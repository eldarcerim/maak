import React,{useEffect,useMemo,useRef,useState} from 'react';
import { Search,Home,Settings as SettingsIcon,Play,Stop,Undo,ArrowRotateCw,Trash } from '@openai/apps-sdk-ui/components/Icon';
import { WORDS } from './vocabulary.js';
import { CATEGORIES,COLORS,CORE,QUICK,DEMO,initialState,wordsFor,filterWords,sentenceChange,undo,redo } from './domain.js';
import { deviceStore } from './device-store.js';
import { createSpeaker } from './speech.js';
import { CSS } from './theme.js';
import Settings from './Settings.jsx';
import VoiceSetup from './VoiceSetup.jsx';
import {createVoiceSetup} from './voice-setup.js';
import {withNaturalAudio} from './natural-pack.js';
export default function App({appId}) {
 const assetUrl=path=>`/app-assets/by-id/${appId}/${path}`;
 const caps=window.mobius?.capabilities;
 const store=useMemo(()=>deviceStore(caps),[]);
 const [state,setState]=useState(initialState),[ready,setReady]=useState(false),[saveError,setSaveError]=useState(''),[status,setStatus]=useState('Dodir bira riječ. Samo Izgovori pokreće zvuk.'),[category,setCategory]=useState('all'),[query,setQuery]=useState(''),[settings,setSettings]=useState(false),[previous,setPrevious]=useState(null);
 const [history,setHistory]=useState({past:[],present:[],future:[]});
 const stateRef=useRef(state);stateRef.current=state;
 const speaker=useMemo(()=>createSpeaker(caps,assetUrl,setStatus),[]);
 const [voiceState,setVoiceState]=useState({busy:false,checking:false,ready:false,message:'Provjera glasa…',percent:null});
 const voiceSetup=useMemo(()=>createVoiceSetup(caps,setVoiceState),[]);
 useEffect(()=>{if(state.mode!=='en')return;const check=()=>{if(document.visibilityState!=='hidden')voiceSetup.refresh();};check();window.addEventListener('focus',check);window.addEventListener('pageshow',check);document.addEventListener('visibilitychange',check);return()=>{window.removeEventListener('focus',check);window.removeEventListener('pageshow',check);document.removeEventListener('visibilitychange',check);};},[state.mode]);
 const nav=useRef(null);
 const canSave=useRef(false),alive=useRef(true),interacted=useRef(false),historyRef=useRef(history);historyRef.current=history;
 const [checking,setChecking]=useState(false);
 async function initialize() {
  if(checking)return;setChecking(true);setSaveError('');
  try {
   const record=await store.load();if(!alive.current)return;
   // Communication made while host setup was pending must never disappear.
   const next=interacted.current?{...record.current,mode:stateRef.current.mode,sentence:historyRef.current.present,alternateSentence:stateRef.current.mode===record.current.mode?record.current.alternateSentence:record.current.sentence,size:stateRef.current.size}:record.current;
   setState(next);if(!interacted.current)setHistory({past:[],present:next.sentence,future:[]});setPrevious(record.previous);canSave.current=true;
   setStatus('Lokalna tabla je učitana. Izgovori pokreće zvuk namjerno.');window.mobius?.signal('app_ready',{item_count:95});
   if(interacted.current)await store.save(next);
  } catch(e) {if(alive.current){canSave.current=false;setSaveError('Ograničeni režim: čuvanje nije potvrđeno. '+e.message);}}
  finally{if(alive.current){setReady(true);setChecking(false);}}
 }
 useEffect(()=>{alive.current=true;initialize();return()=>{alive.current=false;speaker.dispose();voiceSetup.dispose();nav.current?.close();};},[]);
 function save(next,options={}) {if(!options.transactional)setState(next);if(!canSave.current)return Promise.resolve(false);return store.save(next,options).then(record=>{if(options.transactional)setState(next);setPrevious(record.previous);setSaveError('');return true;}).catch(e=>{setSaveError('Nije sačuvano na uređaju. '+e.message);window.mobius?.signal('error',{message:'Device save failed',source:'device-storage'});return false;});}
 function changeHistory(next) {interacted.current=true;historyRef.current=next;setHistory(next);save({...stateRef.current,sentence:next.present});}
 const [naturalPack,setNaturalPack]=useState(null),[naturalActive,setNaturalActive]=useState(false);
 const words=withNaturalAudio(wordsFor(state),state.mode==='bs'&&naturalActive?naturalPack:null);const selected=history.present.map(id=>words.find(w=>w.id===id)).filter(Boolean);
 function select(w){if(history.present.length>=30){setStatus('Najviše 30 riječi. Izgovorite ili očistite rečenicu.');return;}changeHistory(sentenceChange(history,[...history.present,w.id]));}
 function home(){setCategory('all');setQuery('');document.querySelector('.mk-main')?.scrollTo({top:0});}
 function switchMode(mode){if(mode===state.mode)return;interacted.current=true;speaker.stop(false);setStatus(mode==='bs'?'Bosanski: provjeri izvor snimaka ispod table.':'English demo: provjerite odabrani glas u Voice.');const next={...stateRef.current,mode,sentence:stateRef.current.alternateSentence||[],alternateSentence:history.present};const h={past:[],present:next.sentence,future:[]};historyRef.current=h;setHistory(h);save(next);home();}
 async function openSettings(){speaker.stop(false);let handle;handle=window.mobius?.nav?.open('maak-settings',{onBack:()=>{setSettings(false);nav.current=null;},onForward:()=>{setSettings(true);nav.current=handle;}});if(handle){nav.current=handle;const result=await handle.outcome;if(result.status!=='owned')return;}setSettings(true);}
 function closeSettings(){nav.current?.close();nav.current=null;setSettings(false);}
 const visible=state.mode==='en'?filterWords(DEMO,'all',query):filterWords(words,query.trim()?'all':category,query).filter(w=>w.category!=='core'||query.trim());
 const coreWords=state.mode==='bs'?CORE:DEMO.filter(w=>['en_ja','en_hocu','en_necu','en_da','en_ne','en_jos','en_pomoc','en_pauza'].includes(w.id));
 const quick=state.mode==='bs'?QUICK:['en_da','en_ne','en_jos','en_stani','en_pomoc','en_pauza'].map(id=>DEMO.find(w=>w.id===id));
 function image(w){return w.image|| (w.builtinImage?assetUrl(w.builtinImage):null);}
 function card(w){const count=history.present.filter(id=>id===w.id).length;return <button key={w.id} className="mk-card" style={{'--category':w.color||COLORS[w.category]||COLORS.core}} aria-label={`Dodaj ${w.label}`} onClick={()=>select(w)}>{image(w)?<img src={image(w)} alt="" draggable="false"/>:<span className="mk-letter" aria-hidden="true">{w.label.slice(0,1)}</span>}<span>{w.label}</span>{count>0&&<b className="mk-count" aria-label={`${count} u rečenici`}>{count}</b>}</button>;}
 return <div className="mk-root" data-size={state.size}><style>{CSS}</style>
  <header className="mk-header"><div className="mk-brand"><img className="mk-logo" src={assetUrl('icon.png')} onError={e=>e.currentTarget.style.display='none'} alt=""/><div><h1>MAAK</h1><div className="mk-subtitle">Moj glas. Moj izbor.</div></div></div><div className="mk-actions"><div className="mk-seg" aria-label="Jezik table"><button aria-pressed={state.mode==='bs'} onClick={()=>switchMode('bs')}>Bosanski</button><button aria-pressed={state.mode==='en'} onClick={()=>switchMode('en')}>English demo</button></div><button className="mk-button" onClick={openSettings} aria-label="Otvori postavke"><SettingsIcon/><span>Postavke</span></button></div></header>
  <section className="mk-sentence" aria-label="Rečenična traka"><div className="mk-sentence-title">{state.mode==='bs'?'Moja poruka':'English demo · my message'}</div><div className="mk-compose"><div className="mk-strip" aria-label="Odabrane riječi">{selected.length?selected.map((w,i)=><span className="mk-token" key={i}>{image(w)&&<img src={image(w)} alt=""/>}{w.label}</span>):<span className="mk-placeholder">{state.mode==='bs'?'Šta želiš reći? Odaberi riječi ispod.':'Choose words, then press Izgovori.'}</span>}</div><div className="mk-compose-actions"><button className="mk-button" aria-label="Poništi" disabled={!history.past.length} onClick={()=>changeHistory(undo(history))}><Undo/></button><button className="mk-button" aria-label="Vrati" disabled={!history.future.length} onClick={()=>changeHistory(redo(history))}><ArrowRotateCw/></button><button className="mk-button" aria-label="Očisti rečenicu" disabled={!selected.length} onClick={()=>changeHistory(sentenceChange(history,[]))}><Trash/></button><button className="mk-button primary" disabled={!selected.length} onClick={()=>speaker.speak(selected,state.mode)}><Play/>Izgovori</button><button className="mk-button danger" onClick={()=>speaker.stop()}><Stop/>Prekini</button></div></div><div className="mk-status" role="status" aria-live="polite">{status}</div>{!ready&&<div className="mk-storage-message">Učitavanje lokalne table (najviše 8 sekundi)…</div>}{saveError&&<div className="mk-storage-message" role="alert">{saveError} Komunikacija i originalni BS snimci ostaju dostupni; izmjene su privremene. <button className="mk-button" disabled={checking} onClick={initialize}>{checking?'Provjera…':'Ponovo provjeri čuvanje'}</button></div>}</section>
  <section className="mk-quick" aria-label="Brze riječi — dodaj u poruku">{quick.map(w=><button key={w.id} onClick={()=>select(w)}>{w.label}<small>Dodaj u poruku</small></button>)}</section>
  <div className="mk-body"><aside className="mk-core" aria-label="Stalne core riječi"><h2>{state.mode==='bs'?'Uvijek pri ruci':'English core'}</h2><div className="mk-core-grid">{coreWords.map(card)}</div></aside><main className="mk-main"><div className="mk-toolbar"><button className="mk-button" onClick={home}><Home/>Početna</button><div className="mk-search"><Search/><input aria-label="Pretraži riječi" placeholder="Pretraži riječi…" value={query} onChange={e=>setQuery(e.target.value)} /></div></div>
  {state.mode==='bs'?<nav className="mk-categories" aria-label="Kategorije">{Object.entries(CATEGORIES).filter(([key])=>key!=='core').map(([key,name])=><button key={key} aria-pressed={category===key} onClick={()=>setCategory(key)}>{name}</button>)}</nav>:<div className="mk-banner"><strong>English demo · stvarna Möbius Voice integracija</strong><br/>Ova tabla je namjerno odvojena. Bosanski sadržaj ostaje bosanski. Pripremi glas ispod, pa dodirni Izgovori.</div>}
  {state.mode==='en'&&<VoiceSetup setup={voiceSetup} value={voiceState} speaker={speaker}/>}
  <div className="mk-heading"><h2>{state.mode==='bs'?(query?'Rezultati pretrage':CATEGORIES[category]):'Try your Voice'}</h2><span>{visible.length} {state.mode==='bs'?'simbola · + 16 stalnih':'demo words'}</span></div><div className="mk-grid">{visible.map(card)}</div>{!visible.length&&<div className="mk-empty">{category==='custom'?'Ovdje će biti tvoji simboli. Dodaju se kroz zaštićeno uređivanje u postavkama.':'Nema rezultata. Probaj drugu riječ ili Početna.'}</div>}
  <p className="mk-note">{state.mode==='bs'?`95 originalnih ilustracija · ${naturalActive&&naturalPack?'lokalni paket: '+naturalPack.name:'originalni robotski eSpeak'} · bez automatskog govora`:'Voice radi na ovom uređaju nakon preuzimanja modela.'}<br/>Tabla i lični mediji čuvaju se samo u ovom pregledniku. Potpun offline rad nije obećan. Nije medicinski validiran proizvod.</p></main></div>
  {settings&&<Settings state={state} save={save} previous={previous} speaker={speaker} caps={caps} voiceSetup={voiceSetup} voiceState={voiceState} speechStatus={status} naturalPack={naturalPack} naturalActive={naturalActive} onPack={setNaturalPack} onNaturalActive={setNaturalActive} close={closeSettings} onImport={next=>{setHistory({past:[],present:next.sentence,future:[]});home();}} canSave={canSave.current}/>}
 </div>;
}
