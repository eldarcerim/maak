import {WORDS} from './vocabulary.js';
import {validateMedia} from './domain.js';
import {audioBytes} from './audio-local.js';
export const MAX_PACK_BYTES=20*1024*1024;
const check=(ok,message)=>{if(!ok)throw new Error(message);};
export function validateNaturalPack(raw){
 check(raw&&raw.format==='MAAK-BS-VOICE-PACK'&&raw.version===1&&raw.locale==='bs-BA','Ovo nije MAAK BS paket v1.');
 check(['human','azure','licensed'].includes(raw.source),'Navedi izvor: human, azure ili licensed.');
 for(const k of ['name','license'])check(typeof raw[k]==='string'&&raw[k].trim().length>0&&raw[k].length<=500,`Nedostaje naziv ili licenca (${k}).`);
 check(Array.isArray(raw.words)&&raw.words.length===WORDS.length,'Paket mora sadržavati svih 95 osnovnih riječi.');
 const ids=new Set();const words=raw.words.map(w=>{
  const original=WORDS.find(o=>o.id===w.id);
  check(original&&!ids.has(w.id),'Nepoznata ili duplirana riječ u paketu.');ids.add(w.id);
  check(w.text===original.spoken,`Tekst ne odgovara riječi ${original.label}.`);
  validateMedia(w.audio,'audio');check(w.audio,'Paket sadrži prazan snimak.');check(/^[a-f0-9]{64}$/.test(w.sha256),'Nedostaje SHA-256 snimka.');
  return {id:w.id,text:w.text,audio:w.audio,sha256:w.sha256};
 });
 const pack={format:'MAAK-BS-VOICE-PACK',version:1,locale:'bs-BA',source:raw.source,name:raw.name.trim(),license:raw.license.trim(),words};
 check(new TextEncoder().encode(JSON.stringify(pack)).length<=MAX_PACK_BYTES,'Paket prelazi 20 MiB.');return pack;
}
export function withNaturalAudio(words,pack){if(!pack)return words;const map=new Map(pack.words.map(w=>[w.id,w]));return words.map(w=>map.has(w.id)?{...w,audio:map.get(w.id).audio,audioSource:`BS paket: ${pack.name}`} : w);}
function boundedStep(promise,signal,timeoutMs) {
 return new Promise((resolve,reject)=>{
  let timer;const finish=(fn,v)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);fn(v);};
  const abort=()=>finish(reject,new Error('Uvoz paketa je prekinut.'));
  if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});
  timer=setTimeout(()=>finish(reject,new Error('Provjera snimka je zastala. Pokušaj ponovo s ispravnim paketom.')),timeoutMs);
  Promise.resolve(promise).then(v=>finish(resolve,v),e=>finish(reject,e));
 });
}
export async function verifyNaturalPack(raw,{signal,onProgress,decode,hash,timeoutMs=10000}={}){
 const pack=validateNaturalPack(raw);let ctx;
 hash ||= async bytes=>{if(!globalThis.crypto?.subtle)throw new Error('Provjera paketa nije podržana u ovom pregledniku.');return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');};
 if(!decode){ctx=new (window.AudioContext||window.webkitAudioContext)();decode=bytes=>ctx.decodeAudioData(bytes);}
 try{for(let i=0;i<pack.words.length;i++){
  if(signal?.aborted)throw new Error('Uvoz paketa je prekinut.');const w=pack.words[i],bytes=audioBytes(w.audio);
  check(await boundedStep(hash(bytes),signal,timeoutMs)===w.sha256,`Checksum ne odgovara snimku ${w.id}.`);
  const audio=await boundedStep(decode(bytes),signal,timeoutMs);check(audio.length>0&&audio.duration<=8.05,`Snimak ${w.id} je prazan ili duži od 8 sekundi.`);
  let energy=0;const samples=audio.getChannelData(0);for(const v of samples){check(Number.isFinite(v),'Neispravni audio uzorci.');energy+=v*v;}
  check(energy/samples.length>1e-10,`Snimak ${w.id} je tih/prazan.`);
  if(signal?.aborted)throw new Error('Uvoz paketa je prekinut.');onProgress?.(i+1,pack.words.length);
 }}finally{await ctx?.close();}
 return pack; // Speech/language/naturalness still need a human listening review.
}
