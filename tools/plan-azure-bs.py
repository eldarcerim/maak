#!/usr/bin/env python3
"""Offline plan ONLY for 95 common words. No network, credentials, or spending."""
import argparse,json,re
from pathlib import Path
from xml.sax.saxutils import escape
p=argparse.ArgumentParser(description=__doc__);p.add_argument('output',type=Path);p.add_argument('--voice',choices=['bs-BA-VesnaNeural','bs-BA-GoranNeural'],default='bs-BA-VesnaNeural');a=p.parse_args()
root=Path(__file__).resolve().parent.parent
words=json.loads(re.sub(r'^export const WORDS =\s*','',(root/'vocabulary.js').read_text()).strip().rstrip(';'))
plan={'mode':'offline-plan-only','locale':'bs-BA','voice':a.voice,'requests':95,'spokenCharacters':sum(len(w['spoken']) for w in words),'outputFormat':'audio-16khz-32kbitrate-mono-mp3','requires':'Approved Speech resource, secure credential delivery, explicit bounded spend permission and licensing review; never live AAC messages','words':[{'id':w['id'],'outputFile':w['id']+'.mp3','ssml':f'<speak version="1.0" xml:lang="bs-BA"><voice name="{a.voice}">{escape(w["spoken"])}</voice></speak>'} for w in words]}
if a.output.exists():raise SystemExit('Output exists; choose a new file. No overwrite.')
a.output.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print(f'Offline plan: 95 fixed words, {plan["spokenCharacters"]} spoken characters. No requests sent, no charge incurred.')
