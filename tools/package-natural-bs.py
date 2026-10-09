#!/usr/bin/env python3
"""Package 95 licensed common-word recordings locally. No provider/network/key."""
import argparse,base64,hashlib,json,re
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('folder',type=Path);p.add_argument('output',type=Path);p.add_argument('--name',required=True);p.add_argument('--license',required=True);p.add_argument('--source',choices=['human','azure','licensed'],required=True)
a=p.parse_args()
if not all(0<len(v.strip())<=500 for v in (a.name,a.license)):raise SystemExit('Name/license must be 1–500 characters')
root=Path(__file__).resolve().parent.parent
words=json.loads(re.sub(r'^export const WORDS =\s*','',(root/'vocabulary.js').read_text()).strip().rstrip(';'))
result={'format':'MAAK-BS-VOICE-PACK','version':1,'locale':'bs-BA','source':a.source,'name':a.name,'license':a.license,'words':[]}
for w in words:
 files=[a.folder/(w['id']+ext) for ext in ('.wav','.mp3','.ogg','.webm') if (a.folder/(w['id']+ext)).is_file()]
 if len(files)!=1:raise SystemExit(f"Require exactly one recording: {w['id']} (.wav/.mp3/.ogg/.webm)")
 f=files[0]
 if f.is_symlink():raise SystemExit('Symlink input is not supported')
 data=f.read_bytes()
 if not 0<len(data)<=130000:raise SystemExit(f'Too large/empty: {f.name} (max 130000 bytes)')
 mime={'.wav':'wav','.mp3':'mpeg','.ogg':'ogg','.webm':'webm'}[f.suffix]
 result['words'].append({'id':w['id'],'text':w['spoken'],'audio':f'data:audio/{mime};base64,'+base64.b64encode(data).decode(),'sha256':hashlib.sha256(data).hexdigest()})
raw=json.dumps(result,ensure_ascii=False,indent=2)+'\n'
if len(raw.encode())>20*1024*1024:raise SystemExit('Pack exceeds 20MiB')
if a.output.exists():raise SystemExit('Output already exists; choose a new file. No overwrite.')
a.output.write_text(raw)
print(f'Pack created locally: 95 recordings. Import verifies checksum/duration/decoding/silence; human must verify pronunciation and rights.')
