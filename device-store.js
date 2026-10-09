import { invokeBounded } from './capability-call.js';
import { initialState,validateState } from './domain.js';
// The only personal-data sink is the reviewed, device-local capability.
export function deviceStore(caps) {
 let saved={version:1,current:initialState(),previous:null};
 let tail=Promise.resolve();
 return {
  async load() {
   if(!caps?.available('device.storage',1))throw new Error('Lokalno čuvanje nije dostupno. Tabla radi privremeno; ne unosite lične medije prije ponovne provjere.');
   const raw=await invokeBounded(caps,'device.storage',{operation:'get',key:'board'});
   if(raw!==null) {
    if(raw.version!==1)throw new Error('Nepoznata lokalna verzija; postojeći podaci nisu promijenjeni.');
    saved={version:1,current:validateState(raw.current),previous:raw.previous?validateState(raw.previous):null};
   }
   return saved;
  },
  save(state,{preserve=false}={}) {
   const current=validateState(state);
   const run=async()=>{
    const next={version:1,current,previous:preserve?saved.current:saved.previous};
    await invokeBounded(caps,'device.storage',{operation:'set',key:'board',value:next});
    saved=next;return saved;
   };
   const task=tail.catch(()=>{}).then(run);tail=task;return task;
  }
 };
}
