import {pcmWav} from './audio-local.js';
// No MediaStream, recorder or personal samples cross into server storage.
export function recordWord(caps,onLevel=()=>{}, {permissionMs=30000,captureMs=9000}={}){
 if(!caps?.available('media.microphone.capture',1))throw new Error('Snimanje nije dostupno. Dodaj lokalnu audio datoteku.');
 const session=caps.open('media.microphone.capture',{maxDurationMs:4000});
 let timer,done=false,resolve,reject;
 const result=new Promise((a,b)=>{resolve=a;reject=b;});
 const off=session.on('level',v=>{if(!done)onLevel(v);});
 function settle(error,data){if(done)return;done=true;clearTimeout(timer);off();if(error)reject(error);else resolve(data);}
 const timeout=message=>{session.cancel();settle(new Error(message));};
 timer=setTimeout(()=>timeout('Mikrofon nije dobio dozvolu u 30 sekundi. Pokušaj ponovo ili uvezi snimak.'),permissionMs);
 session.ready.then(()=>{if(done)return;clearTimeout(timer);timer=setTimeout(()=>timeout('Snimanje nije završilo. Pokušaj ponovo ili uvezi snimak.'),captureMs);},()=>{});
 session.result.then(({samples,sampleRate})=>{try{settle(null,pcmWav(samples,sampleRate));}catch(e){settle(e);}},e=>settle(new Error(e?.name==='AbortError'?'Snimanje je prekinuto.':(e?.message||'Mikrofon nije dostupan.'))));
 result.catch(()=>{});
 return {ready:session.ready,result,finish:()=>session.finish(),cancel:()=>{session.cancel();settle(new Error('Snimanje je prekinuto.'));}};
}
