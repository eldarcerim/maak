import {validateMedia} from './domain.js';
export function audioBytes(data) {
 validateMedia(data,'audio');
 const raw=atob(data.slice(data.indexOf(',')+1));const bytes=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes.buffer;
}
export function pcmWav(samples,sampleRate,{maxSeconds=4,targetRate=16000}={}) {
 if(!(samples instanceof Float32Array)||!samples.length||!Number.isFinite(sampleRate)||sampleRate<8000||sampleRate>192000)throw new Error('Snimak nema ispravne audio podatke.');
 if(samples.length/sampleRate>maxSeconds+.05)throw new Error(`Snimak smije trajati najviše ${maxSeconds} sekunde.`);
 let energy=0;for(const v of samples){if(!Number.isFinite(v))throw new Error('Neispravni uzorci zvuka.');energy+=v*v;}
 if(Math.sqrt(energy/samples.length)<.0003)throw new Error('Snimak je tih ili prazan. Provjeri mikrofon i snimi ponovo.');
 const n=Math.floor(samples.length*targetRate/sampleRate);const buffer=new ArrayBuffer(44+n*2),view=new DataView(buffer);
 const ascii=(offset,text)=>{for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i));};
 ascii(0,'RIFF');view.setUint32(4,36+n*2,true);ascii(8,'WAVE');ascii(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,targetRate,true);view.setUint32(28,targetRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);ascii(36,'data');view.setUint32(40,n*2,true);
 // Average each source interval when downsampling; do not change pitch/duration.
 for(let i=0;i<n;i++){const start=Math.floor(i*sampleRate/targetRate),end=Math.max(start+1,Math.floor((i+1)*sampleRate/targetRate));let v=0;for(let j=start;j<Math.min(end,samples.length);j++)v+=samples[j];v/=Math.min(end,samples.length)-start;view.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,v))*32767),true);}
 let binary='';const bytes=new Uint8Array(buffer);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 return validateMedia('data:audio/wav;base64,'+btoa(binary),'audio');
}
