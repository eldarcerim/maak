import { validateMedia } from './domain.js';
import {audioBytes} from './audio-local.js';
export function readData(file) {return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Datoteka nije pročitana.'));reader.readAsDataURL(file);});}
export function loadImage(src) {return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Slika se ne može otvoriti.'));img.src=src;});}
export async function prepareImage(file) {
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>6*1024*1024)throw new Error('Odaberite PNG/JPEG/WebP sliku do 6 MB. SVG nije podržan.');
 const image=await loadImage(await readData(file));
 const ratio=Math.min(1,320/image.width,320/image.height);
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));
 const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
 // Rasterizing locally removes embedded metadata. No upload or server resize.
 const data=canvas.toDataURL('image/jpeg',.8);return validateMedia(data,'image');
}
export async function verifyAudio(data) {
 validateMedia(data,'audio');if(!data)return;
 const ctx=new (window.AudioContext||window.webkitAudioContext)();
 try{const b=await ctx.decodeAudioData(audioBytes(data));if(!b.length||b.duration>8.05)throw new Error('Audio smije trajati najviše 8 sekundi.');}catch(e){throw new Error(e.message.includes('8 sekundi')?e.message:'Audio format nije čitljiv u ovom pregledniku.');}finally{await ctx.close();}
}
export async function prepareAudio(file) {
 const aliases={'audio/x-wav':'audio/wav','audio/mp3':'audio/mpeg'};
 const type=aliases[file.type]||file.type;
 if(!['audio/wav','audio/mpeg','audio/ogg','audio/webm'].includes(type)||file.size>130000)throw new Error('Odaberite WAV/MP3/OGG/WebM do 130 kB i 8 sekundi.');
 const data=await readData(new Blob([file],{type}));await verifyAudio(data);return data;
}
export async function verifyBackupMedia(state) {
 for(const w of state.custom){if(w.image){const img=await loadImage(w.image);if(img.width>512||img.height>512)throw new Error('Backup slika prelazi 512 px.');}if(w.audio)await verifyAudio(w.audio);}
 return state;
}
