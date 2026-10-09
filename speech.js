import {invokeBounded} from './capability-call.js';
import {audioBytes} from './audio-local.js';
import {isEnglish,voiceFailure} from './voice-setup.js';
export function createSpeaker(caps,assetUrl,onStatus,{idleMs=180000,unlockMs=8000}={}) {
 let context=null,session=null,token=0,sources=new Set(),active=false,controller=null;
 function stop(report=true){token++;controller?.abort();controller=null;session?.cancel();session=null;for(const s of sources){try{s.stop();}catch{}s.disconnect();}sources.clear();active=false;if(report)onStatus('Prekinuto.');}
 async function catalog(signal){return invokeBounded(caps,'media.speech',{operation:'catalog'},{signal});}
 // Bound real external stalls and honor cancel, including a never-settled resume.
 function wait(promise,signal,ms,message){return new Promise((resolve,reject)=>{let timer;const abort=()=>done(reject,new Error('Prekinuto.'));const done=(fn,v)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);fn(v);};if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>done(reject,new Error(message)),ms);Promise.resolve(promise).then(v=>done(resolve,v),e=>done(reject,e));});}
 function schedule(samples,rate,cursor){
  if(!(samples instanceof Float32Array)||!Number.isFinite(rate)||rate<8000||rate>192000)throw new Error('Voice je vratio neispravne audio podatke.');
  if(context.state!=='running')throw new Error('Zvuk je pauziran u pregledniku. Vrati se i ponovo dodirni Izgovori.');
  if(!samples.length)return cursor;
  const b=context.createBuffer(1,samples.length,rate);b.copyToChannel(samples,0);
  const s=context.createBufferSource();s.buffer=b;s.connect(context.destination);sources.add(s);s.onended=()=>{sources.delete(s);s.disconnect();};
  const start=Math.max(context.currentTime+.025,cursor);s.start(start);return start+b.duration;
 }
 function drain(end,signal){return new Promise((resolve,reject)=>{const tick=()=>{if(signal.aborted)finish(reject,new Error('Prekinuto.'));else if(context.state!=='running')finish(reject,new Error('Preglednik je zaustavio zvuk. Ponovo dodirni Izgovori.'));else if(context.currentTime>=end)finish(resolve);};const finish=(fn,v)=>{clearInterval(timer);signal.removeEventListener('abort',tick);fn(v);};const timer=setInterval(tick,40);signal.addEventListener('abort',tick,{once:true});tick();});}
 return {catalog,stop,
  async speak(words,mode){
   stop(false);const mine=token;active=true;controller=new AbortController();const signal=controller.signal;
   try{
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Preglednik ne podržava audio. Otvori MAAK u podržanom pregledniku.');
    context ||= new Audio();const resumed=context.resume(); // original tap, before host/fetch awaits
    onStatus('Pokretanje zvuka…');await wait(resumed,signal,unlockMs,'Preglednik nije otključao zvuk. Ponovo dodirni Izgovori.');if(mine!==token)return;
    if(context.state!=='running')throw new Error('Preglednik nije pokrenuo zvuk. Ponovo dodirni Izgovori.');
    if(mode==='bs'){
     if(words.some(w=>!w.audio&&!w.builtinAudio))throw new Error('Vlastiti simbol nema audio snimak. Snimi riječ ili dodaj lokalnu audio datoteku.');
     for(const w of words){
      let bytes;
      if(w.audio)bytes=audioBytes(w.audio); // data: fetch is blocked by this frame's connect-src
      else {const fetchAbort=new AbortController();const cancel=()=>fetchAbort.abort();signal.addEventListener('abort',cancel,{once:true});try{bytes=await wait((async()=>{const r=await fetch(assetUrl(w.builtinAudio),{signal:fetchAbort.signal});if(!r.ok)throw new Error('Originalni snimak nije učitan. Provjeri vezu.');return r.arrayBuffer();})(),signal,10000,'Snimak nije učitan u 10 sekundi. Provjeri vezu i pokušaj ponovo.');}finally{fetchAbort.abort();signal.removeEventListener('abort',cancel);}}
      const b=await wait(context.decodeAudioData(bytes),signal,10000,'Snimak se ne može otvoriti.');if(mine!==token)return;
      onStatus(w.audio?`Reprodukcija: ${w.audioSource||'Lokalni vlastiti snimak'} · Bosanski`:'Reprodukcija originalnih eSpeak snimaka · Bosanski');
      const end=schedule(b.getChannelData(0),b.sampleRate,context.currentTime);await drain(end,signal);if(mine!==token)return;
     }
    }else{
     const {activeModel}=await catalog(signal);if(mine!==token)return;
     if(!activeModel)throw new Error('Voice nije spreman. Dodirni Pripremi English glas ispod table, zatim Izgovori.');
     if(!isEnglish(activeModel))throw new Error(`Odabran je ${activeModel.name} (${activeModel.language}), ne English. Dodirni Pripremi English glas.`);
     let cursor=context.currentTime,received=0,energy=0,lastProgress='',timer;let rejectWatch;
     const watched=new Promise((_,reject)=>rejectWatch=reject);
     const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{rejectWatch(new Error('Voice je zastao bez novog napretka. Dodirni Prekini, provjeri glas i pokušaj ponovo.'));owned.cancel();},idleMs);};
     const owned=caps.open('media.speech',{operation:'synthesize',modelId:activeModel.id,document:{version:1,locale:'en-GB',hints:[],segments:[{kind:'paragraph',text:words.map(w=>w.spoken).join(' '),pauseAfterMs:0}]}});session=owned;arm();
     const offLoading=owned.on('loading',v=>{if(mine!==token)return;const p=JSON.stringify(v);if(p!==lastProgress){lastProgress=p;arm();}onStatus(v.stage==='generating'?`Stvaranje zvuka: Möbius Voice · ${activeModel.name}`:`Učitavanje glasa na uređaju… ${Number.isFinite(v.percent)?Math.round(v.percent)+'%':''} · Prekini je dostupan.`);});
     let playbackError=null;
     const offAudio=owned.on('audio',({samples})=>{if(mine!==token)return;try{let chunkEnergy=0;for(const v of samples){if(!Number.isFinite(v))throw new Error('Neispravan Voice zvuk.');chunkEnergy+=v*v;}cursor=schedule(samples,activeModel.sampleRate,cursor);received+=samples.length;energy+=chunkEnergy;arm();onStatus(`Reprodukcija: Möbius Voice · ${activeModel.name} · English`);}catch(e){playbackError=e;rejectWatch(new Error('Voice zvuk nije mogao biti zakazan za reprodukciju. '+e.message));owned.cancel();}});
     const offBoundary=owned.on('boundary',v=>{if(mine===token&&Number.isFinite(v.pauseAfterMs))cursor+=v.pauseAfterMs/1000;});
     try{await wait(Promise.race([owned.result,watched]),signal,600000,'Voice nije završio za 10 minuta. Ponovo pokušaj.');}finally{clearTimeout(timer);offAudio();offBoundary();offLoading();if(session===owned)session=null;owned.cancel();}
     if(mine!==token)return;if(playbackError)throw playbackError;
     if(!received||energy/received<1e-10)throw new Error('Voice nije vratio čujne uzorke zvuka; uspjeh nije potvrđen. Ponovo provjeri glas.');
     await drain(cursor,signal);if(mine!==token)return;
    }
    active=false;controller=null;onStatus('Reprodukcija završena — čujnost potvrđuješ na uređaju.');
   }catch(e){if(mine!==token)return;stop(false);onStatus(e.code?voiceFailure(e):(e.message||'Zvuk nije uspio.'));}
  },dispose(){stop(false);context?.close();},get active(){return active;}};
}
