import { WORDS } from './vocabulary.js';
export const CATEGORIES = {all:'Sve riječi',ljudi:'Ljudi',hrana:'Hrana',pice:'Piće',igra:'Igra',aktivnosti:'Aktivnosti',mjesta:'Mjesta',potrebe:'Potrebe',osjecaji:'Osjećaji',rijeci:'Male riječi',custom:'Moji simboli',core:'Core'};
export const COLORS = {core:'#f9e9ad',ljudi:'#f2dfec',hrana:'#fbe3c6',pice:'#d9edf8',igra:'#ddedcc',aktivnosti:'#d9e9de',mjesta:'#e3e2f8',potrebe:'#f8dede',osjecaji:'#f7e2e7',rijeci:'#e5eced',custom:'#d8eee9'};
const TRANSLATIONS = {ja:'I',hocu:'want',necu:'do not want',da:'yes',ne:'no',jos:'more',gotovo:'finished',pomoc:'help',stani:'stop',pauza:'break',voda:'water',jesti:'eat',lopta:'ball',sretan:'happy',mama:'mum',piti:'drink'};
export const DEMO = WORDS.filter(w=>TRANSLATIONS[w.id]).map(w=>({...w,id:'en_'+w.id,label:TRANSLATIONS[w.id].toUpperCase(),spoken:TRANSLATIONS[w.id],category:'demo'}));
export const CORE = WORDS.filter(w=>w.category==='core');
export const QUICK = ['da','ne','jos','stop','pomoc','pauza'].map(id=>WORDS.find(w=>w.id===id));
export const MAX_STATE_BYTES = 450000;
export function initialState() { return {schema:1,size:'standard',mode:'bs',custom:[],sentence:[],alternateSentence:[]}; }
export function wordsFor(state) { return state.mode==='en' ? DEMO : [...WORDS,...state.custom]; }
export function normalizeText(s) { return s.toLocaleLowerCase('bs').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d'); }
export function filterWords(words,category,query) { return words.filter(w=>(category==='all'||w.category===category)&&normalizeText(w.label+' '+w.spoken).includes(normalizeText(query))); }
export function sentenceChange(history,next) { return {past:[...history.past,history.present].slice(-25),present:next,future:[]}; }
export function undo(history) { if(!history.past.length)return history;return {past:history.past.slice(0,-1),present:history.past.at(-1),future:[history.present,...history.future].slice(0,25)}; }
export function redo(history) { if(!history.future.length)return history;return {past:[...history.past,history.present].slice(-25),present:history.future[0],future:history.future.slice(1)}; }
export const stateBytes = value=>new TextEncoder().encode(JSON.stringify(value)).length;
function requireThat(ok,msg) { if(!ok) throw new Error(msg); }
function exactKeys(v,keys) { requireThat(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k)),'Nepoznata ili neispravna polja.'); }
function text(v,max,name) { requireThat(typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\x00-\x08\x0b-\x1f]/.test(v),`${name} nije ispravan.`); }
export function validateMedia(value,type) {
 requireThat(typeof value==='string','Medij nije ispravan.');
 if(!value)return value;
 requireThat(value.length<=(type==='image'?70000:180000),'Medij je prevelik.');
 const re=type==='image'?/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/:/^data:audio\/(wav|mpeg|ogg|webm);base64,[A-Za-z0-9+/]+={0,2}$/;
 requireThat(re.test(value),'Dozvoljeni su samo ugrađeni PNG/JPEG/WebP i WAV/MP3/OGG/WebM, ne linkovi ili SVG.');
 return value;
}
export function validateState(raw) {
 exactKeys(raw,['schema','size','mode','custom','sentence','alternateSentence']);
 requireThat(raw.schema===1,'Nepodržana verzija podataka.');
 requireThat(['compact','standard','large'].includes(raw.size),'Nepoznata veličina.');
 requireThat(['bs','en'].includes(raw.mode),'Nepoznata tabla.');
 requireThat(Array.isArray(raw.custom)&&raw.custom.length<=50,'Najviše 50 vlastitih simbola.');
 const ids=new Set();
 const custom=raw.custom.map(w=>{
  exactKeys(w,['id','label','spoken','category','color','image','audio']);
  requireThat(/^user_[a-zA-Z0-9_-]{1,64}$/.test(w.id)&&!ids.has(w.id),'Dupli ili neispravan ID simbola.');ids.add(w.id);
  text(w.label,40,'Naziv');text(w.spoken,120,'Izgovor');requireThat(Object.hasOwn(CATEGORIES,w.category)&&!['core','all'].includes(w.category),'Nepoznata kategorija.');
  requireThat(/^#[0-9a-fA-F]{6}$/.test(w.color),'Neispravna boja.');validateMedia(w.image,'image');validateMedia(w.audio,'audio');
  return {id:w.id,label:w.label,spoken:w.spoken,category:w.category,color:w.color,image:w.image,audio:w.audio};
 });
 const next={schema:1,size:raw.size,mode:raw.mode,custom,sentence:raw.sentence,alternateSentence:raw.alternateSentence??[]};
 requireThat(Array.isArray(raw.sentence)&&raw.sentence.length<=30,'Najviše 30 riječi u rečenici.');
 const available=new Set(wordsFor(next).map(w=>w.id));requireThat(raw.sentence.every(id=>typeof id==='string'&&available.has(id)),'Rečenica sadrži nepoznat simbol ili jezik.');
 const opposite={...next,mode:next.mode==='bs'?'en':'bs'};
 const alternateIds=new Set(wordsFor(opposite).map(w=>w.id));
 requireThat(Array.isArray(next.alternateSentence)&&next.alternateSentence.length<=30&&next.alternateSentence.every(id=>typeof id==='string'&&alternateIds.has(id)),'Druga tabla sadrži nepoznat simbol.');
 requireThat(stateBytes(next)<=MAX_STATE_BYTES,'Tabla prelazi 450 kB. Smanjite broj ličnih medija.');
 return {...next,sentence:[...raw.sentence],alternateSentence:[...next.alternateSentence]};
}
export function validateBackup(raw) {exactKeys(raw,['format','version','createdAt','state']);requireThat(raw.format==='MAAK-MOBIUS'&&raw.version===1,'Ovo nije MAAK Möbius backup v1.');requireThat(typeof raw.createdAt==='string'&&Number.isFinite(Date.parse(raw.createdAt)),'Neispravan datum.');return validateState(raw.state);}
export function backup(state) {return {format:'MAAK-MOBIUS',version:1,createdAt:new Date().toISOString(),state:validateState(state)};}
