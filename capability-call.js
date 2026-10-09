// One-shot host requests must settle visibly even if an older host never replies.
// This bounds the external boundary; it does not retry or invent a fallback store.
export async function invokeBounded(caps,name,input,{timeoutMs=8000,signal}={}) {
 if(!caps?.available(name,1))throw new Error(name==='device.storage'?'Lokalno čuvanje nije dostupno u ovom hostu.':'Möbius Voice funkcija nije dostupna u ovom hostu.');
 const controller=new AbortController();let timedOut=false;let timer;let rejectBoundary;
 const boundary=new Promise((_,reject)=>{rejectBoundary=reject;});
 const abort=()=>{controller.abort();rejectBoundary(new Error('Zahtjev je prekinut.'));};
 if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
 timer=setTimeout(()=>{timedOut=true;controller.abort();rejectBoundary(new Error('Möbius nije odgovorio u 8 sekundi. Otvorite aplikaciju u aktivnom panelu i ponovo provjerite vezu s uređajem.'));},timeoutMs);
 try{return await Promise.race([caps.invoke(name,input,{signal:controller.signal}),boundary]);}
 catch(e){if(timedOut)throw new Error('Möbius nije odgovorio u 8 sekundi. Otvorite aplikaciju u aktivnom panelu i ponovo provjerite vezu s uređajem.');throw e;}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
