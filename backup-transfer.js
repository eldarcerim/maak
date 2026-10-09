import { backup, validateBackup } from './domain.js';
// Backup bytes stay in the app and the owner's explicitly chosen clipboard.
// Direct download is blocked by the frame response CSP; never weaken it here.
export function exportBackupText(state) { return JSON.stringify(backup(state),null,2); }
export function parseBackupText(text) {
 if(typeof text!=='string'||!text.trim())throw new Error('Zalijepi MAAK backup JSON.');
 if(new TextEncoder().encode(text).length>650000)throw new Error('Backup je prevelik (najviše 650 kB).');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Tekst nije ispravan JSON.');}
 return validateBackup(value);
}
export function selectBackupText(field) {
 if(!field)return false;
 try{field.focus();field.select();field.setSelectionRange?.(0,field.value.length);return true;}catch{return false;}
}
export async function copyBackupText(text,clipboard,field) {
 // Called directly inside a user gesture, with no await before writeText.
 try{if(clipboard?.writeText&&await clipboard.writeText(text)===true)return 'copied';}catch{/* visible manual fallback, never manufactured success */}
 return selectBackupText(field)?'selected':'visible';
}
