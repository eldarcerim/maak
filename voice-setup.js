import {invokeBounded} from './capability-call.js';
export function voiceFailure(error){
 const code=error?.code;
 if(code==='download_failed'||/device asset source returned/i.test(error?.message||'')){
  const status=error?.message?.match(/returned (\d{3})/)?.[1];
  return status?`Preuzimanje modela je odbio izvor ili Möbius posrednik (HTTP ${status}). Ne briši svoje podatke. Ako prvi download i jedan ponovni pokušaj ne uspiju: Otvori Voice → English → Download model. Vrati se u MAAK → Ponovo provjeri glas → Pripremi English glas za preostalu Albu. Potvrđeni dijelovi se nastavljaju.`:'Voice paket nije preuzet u provjerenoj veličini. Potreban je ispravan službeni paket. Ne briši svoje podatke; ponovo provjeri ili pokušaj kasnije.';
 }
 if(code==='integrity_failed')return 'Preuzeti model nije prošao sigurnu provjeru. Nije sačuvan. Potreban je ispravan službeni Voice paket; nemoj zaobilaziti provjeru.';
 if(code==='not_installed')return 'Glas nije preuzet na ovom uređaju. Dodirni Pripremi English glas.';
 if(['engine_blocked','engine_failed','engine_missing'].includes(code))return 'Govorni engine nije pokrenut. Ponovo pokušaj u aktivnom MAAK panelu; ako se ponavlja, otvori Voice i provjeri njegov probni govor.';
 if(['limit_exceeded','quota_exceeded'].includes(code))return 'Nema dovoljno dozvoljenog prostora za glas. Provjeri slobodan prostor na uređaju i pokušaj ponovo.';
 if(code==='denied')return 'Preglednik nije dozvolio pripremu glasa. Otvori MAAK u aktivnom panelu i ponovo pokušaj.';
 if(code==='timeout')return 'Glas je zastao. Provjeri vezu i ponovo pokušaj; Prekini ostaje dostupan.';
 return error?.message||'Glas nije dostupan. Provjeri vezu i prostor, zatim ponovo pokušaj.';
}
export const isEnglish = model => /^(English|en(?:-|$))/i.test(model?.language||'');
export function englishPlan(catalog) {
 const engine=catalog.engines?.find(e=>e.languages?.some(l=>isEnglish({language:l})));
 const model=catalog.models?.find(m=>isEnglish(m)&&!m.cloned&&m.voice==='Alba')||catalog.models?.find(m=>isEnglish(m)&&!m.cloned);
 if(!engine||!model)throw new Error('Ova instalacija nema podržani English/Alba model. Otvori Voice za dostupne glasove.');
 return {engine,model,bytes:(engine.state==='ready'?0:Math.max(0,engine.storedBytes-engine.cachedBytes||engine.storedBytes))+(model.profileState==='ready'?0:model.profileBytes)};
}
// One owner for setup, progress and cancellation. Catalog never downloads or selects.
export function createVoiceSetup(caps,onChange,{idleMs=90000}={}) {
 let current={busy:false,checking:false,ready:false,active:null,plan:null,message:'Provjeri English glas na ovom uređaju.',percent:null,error:''};
 let generation=0,session=null,controller=null,disposed=false;
 const emit=patch=>{current={...current,...patch};if(!disposed)onChange(current);};
 async function inspect(signal) {
  const [models,playback]=await Promise.all([
   invokeBounded(caps,'device.speech-models',{operation:'catalog'},{signal}),
   invokeBounded(caps,'media.speech',{operation:'catalog'},{signal}),
  ]);
  return {active:playback.activeModel,ready:isEnglish(playback.activeModel),plan:englishPlan(models)};
 }
 async function refresh() {
  if(current.busy||current.checking||disposed)return;
  const g=generation;emit({checking:true,error:''});
  try{const value=await inspect();if(g!==generation)return;emit({...value,message:value.ready?`Spreman: Möbius Voice · ${value.active.name} · English. Dodirni Izgovori.`:'English glas nije spreman na ovom uređaju. Pripremi ga jednim klikom.'});}
  catch(e){if(g===generation)emit({ready:false,error:voiceFailure(e),message:'Provjera nije uspjela. Aktiviraj MAAK i ponovo provjeri.'});}
  finally{if(g===generation)emit({checking:false});}
 }
 function transferOnce(input,g,label) {
  return new Promise((resolve,reject)=>{
   session=caps.open('device.speech-models',input);const owned=session;let timer,last=-1;
   const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{owned.cancel();reject(new Error('Preuzimanje je zastalo. Provjeri mrežu i dodirni Ponovo pripremi; potvrđeni dijelovi se nastavljaju.'));},idleMs);};arm();
   const off=owned.on('progress',v=>{if(g!==generation)return;const bytes=Number(v.downloadedBytes)||0;if(bytes>last){last=bytes;arm();}const total=Number(v.totalBytes)||0;emit({message:label,percent:total?Math.min(100,Math.round(bytes/total*100)):null});});
   owned.result.then(resolve,reject).finally(()=>{clearTimeout(timer);off();if(session===owned)session=null;});
  });
 }
 async function transfer(input,g,label){
  try{return await transferOnce(input,g,label);}catch(e){
   if(g!==generation)return;
   // One retry of the same checksum-pinned package per explicit setup click.
   // The host resumes verified chunks; never loop or switch mirrors.
   if(!/returned 502/.test(e?.message||''))throw e;
   emit({message:'Izvor je vratio 502. Jedan ponovni pokušaj s potvrđenim dijelovima…',percent:null});
   return await transferOnce(input,g,label);
  }
 }
 async function prepare() {
  if(current.busy||current.checking||disposed)return;
  const g=++generation;controller=new AbortController();emit({busy:true,ready:false,error:'',percent:null,message:'Provjera potrebnog preuzimanja…'});
  try{
   const value=await inspect(controller.signal);if(g!==generation)return;
   // Do not replace a ready English voice/clone merely because Alba is the default.
   if(!value.ready){
    if(value.plan.engine.state!=='ready')await transfer({operation:'install-engine',engineId:value.plan.engine.id},g,'Preuzimanje English modela…');
    if(g!==generation)return;
    if(value.plan.model.profileState!=='ready')await transfer({operation:'install-profile',modelId:value.plan.model.id},g,'Preuzimanje Alba glasa…');
    if(g!==generation)return;
    emit({message:'Odabir English glasa…',percent:null});
    await invokeBounded(caps,'device.speech-models',{operation:'select',modelId:value.plan.model.id},{signal:controller.signal});
   }
   const verified=await inspect(controller.signal);if(g!==generation)return;
   if(!verified.ready)throw new Error('Preuzimanje nije dalo spreman English glas. Otvori Voice i provjeri odabir.');
   emit({...verified,message:`Spreman: Möbius Voice · ${verified.active.name} · English. Sada dodirni Izgovori.`,percent:null});
  }catch(e){if(g===generation)emit({error:voiceFailure(e),message:'Priprema nije završena. Nije pokrenut govor.'});}
  finally{if(g===generation){controller=null;emit({busy:false,percent:null});}}
 }
 function cancel(){generation++;controller?.abort();controller=null;session?.cancel();session=null;emit({busy:false,checking:false,ready:false,percent:null,message:'Priprema prekinuta. Možeš je nastaviti ponovnim klikom.',error:''});}
 return {refresh,prepare,cancel,dispose(){disposed=true;cancel();},get state(){return current;}};
}
