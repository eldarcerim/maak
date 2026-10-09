# MAAK — Möbius edicija
**Moj glas. Moj izbor.** Bosanska komunikacijska tabla s 95 originalnih ilustracija i zasebnim English Voice demom. Nije medicinski validiran proizvod.

Ovo je zasebna web/Möbius edicija: ne mijenja Android MAAK 1.1.4, njegov izvor ili Play izdanje. Autor: Eldar Ćerim / PONTEM.

## Brzi početak
1. Otvori MAAK i biraj riječi, npr. **JA → HOĆU → VODA**. Odabir je tih.
2. **Izgovori** namjerno pokreće zvuk; **Prekini** prekida pripremu/reprodukciju. DA/NE, JOŠ/STOP, POMOĆ/PAUZA dodaju se u poruku, ne govore automatski.
3. **Poništi / Vrati** rade i poslije čišćenja trake. Najviše 30 riječi; istorija posljednjih 25 promjena u ovoj sesiji. 16 core riječi stalno ostaju u svojoj zoni.
4. Koristi kategorije, pretragu (radi i bez kvačica) i **Početna**. Veličinu biraj u **Postavke → Manji / Srednji / Veći**. Raspored se ne preslaže po učestalosti.
5. U postavkama redovno **Izvezi backup**. Za vlastite simbole, import ili lokalni povrat upiši **MAAK → Otključaj uređivanje**. To je zaštita od slučajnih dodira, ne lozinka.

### Vlastiti simboli
Novi simbol ima naziv, tekst snimka, kategoriju, boju te opcionalnu sliku i audio datoteku ili vlastiti mikrofonski snimak. Originali se ne mijenjaju. Slika se smanjuje lokalno na najviše 320 px i ponovo rasterizira bez izvornih metapodataka. Audio se provjerava lokalno. Dugme **Snimi svoju riječ** traži mikrofon tek u dodiru, do 4 sekunde, i priprema lokalni mono 16kHz WAV u nacrtu; preslušaj pa sačuvaj. Odustani prekida i pri čekanju OS dozvole. Uvoz fajla ostaje alternativa. **Tekst nije proizvoljni bosanski TTS**: dodaj snimak koji zaista izgovara taj tekst. Simbol bez audio datoteke može biti u poruci, ali Izgovori za takvu poruku pokazuje grešku.

Najviše 50 vlastitih simbola; PNG/JPEG/WebP do 6 MB prije smanjenja; audio WAV/MP3/OGG/WebM do 130 kB i 8 sekundi, uz podršku dekodera preglednika. Ukupna tabla do 450.000 UTF-8 bajtova (približno 440 KiB). Browser-local kapacitet uključuje i prethodnu tablu.

### Backup i povrat
JSON format `MAAK-MOBIUS`, verzija 1. **Izvezi backup** sada prikazuje cijeli lokalni JSON umjesto blokiranog browser downloada. **Kopiraj JSON** koristi podržani `window.mobius.clipboard`; uspjeh se prikazuje samo kad helper vrati `true`. Pri odbijanju JSON ostaje vidljiv i odabran za Ctrl/Cmd+C ili mobilni Kopiraj. Sačuvaj kopirani tekst u lokalnom tekst editoru kao `MAAK-backup.json`; clipboard nije trajni backup. Ne lijepi lične backupe u chat ili javne servise. Za uvoz upiši MAAK i odaberi JSON fajl **ili zalijepi isti JSON → Provjeri zalijepljeni JSON**. Oba puta prolaze iste validatore i isti pregled prije potvrde. Export uključuje obje jezičke poruke, vlastite simbole, lične medije i veličinu; ne uključuje neograničenu istoriju undo/redo. Import provjerava format, verziju, ID-eve, kategorije, boje, tekstove, količinu/veličinu podataka, data-URL tipove, stvarno otvaranje slika i dekodiranje audio datoteka. Linkovi, SVG, nepoznata polja i neispravni podaci se odbijaju.

Poslije provjere vidi se **pregled zamjene**. Potvrda atomskom lokalnom operacijom čuva trenutnu tablu kao prethodnu i primjenjuje novu. Neuspjela operacija ne zamjenjuje aktivnu tablu. **Vrati prethodnu tablu…** također prvo pokazuje pregled; to je jedan nivo povrata. Uklanjanje vlastitog simbola ima posebnu potvrdu i isti povrat. Stare v1 datoteke bez druge jezičke poruke migriraju bez gubitka postojeće poruke. Android backup nije ovaj format.

## Govor
**Bosanski:** tačno 95 originalnih WAV datoteka iz Android izvora. Sintetički eSpeak fallback, bez tvrdnje o prirodnom ili profesionalno provjerenom izgovoru. Riječi se reproduciraju redom na 1,0×, bez gramatičkog preoblikovanja i bez mrežnog TTS servisa. Lični audio reproducira se lokalno.

**English demo:** odvojena tabla s 16 demonstracijskih riječi i originalnim ilustracijama. Bosanska tabla nije prevedena. Obje poruke se čuvaju zasebno pri promjeni table. Koristi stvarni Möbius `media.speech v1` i glas odabran na ovom uređaju kroz podržani Voice ugovor. Nema paralelnog `speechSynthesis`, cloud/plaćenog servisa ili aplikacijskog enginea.

**Mali setup korak:** **English demo → Pripremi English glas**. Dugme prikazuje približnu veličinu iz stvarnog kataloga; tek klik preuzima English Q8 model i Alba profil kroz `device.speech-models`, odabire glas i ponovo provjerava `media.speech` katalog. Ovo je zajednički odabir uređaja za druge Möbius aplikacije; već spreman English glas/clone se ne zamjenjuje. **I → WANT → WATER → Izgovori** je zaseban obavezni dodir za audio. Postoje progress, **Prekini pripremu**, **Ponovo pripremi** (nastavlja potvrđene dijelove) i **Ponovo provjeri glas**. Nema automatskog preuzimanja ili govora. Ako priprema vrati 502, handler ponavlja isti provjereni paket **samo jednom po kliku**. Ako opet padne: **Otvori Voice → English → Download model**, zatim se vrati u MAAK, provjeri glas i pripremi preostali Alba profil. Prepoznaju se već potvrđeni dijelovi; ne preuzimaj model ponovo ako je spreman. Alternativa **Otvori Voice** otvara novi tab; povratak/fokus/pageshow/vidljivost provjeravaju katalog, a svaki Izgovori čita stvarni odabir ponovo. Model je po uređaju i browser profilu — preuzimanje drugdje nije priprema ovog uređaja.

**Prirodan BS:** dodan siguran lokalni paket 95 licenciranih riječi i snimanje vlastite riječi, ali **prirodan paket nije dostupan u instalaciji**. Uvoz je session-only i ne mijenja lične simbole/board. Priprema i tačan preostali Azure/lokalni korak su u [NATURAL_BS_SETUP.md](NATURAL_BS_SETUP.md). Nema Azure poziva, tajni u klijentu ili troška.
Integracija hvata aktivni `modelId` za svaku poruku, odmah u dodiru aktivira AudioContext, uzastopno zakazuje Float32 audio pakete prema `sampleRate`, poštuje `boundary` pauze i prekida capability sesiju i zakazane izvore. Završen synthesis nije proglašen završenom reprodukcijom dok zadnji zakazani paket ne završi. Nema lažnog uspjeha ako nema audio paketa, uzorci su potpuno tihi/neispravni ili zakazivanje ne uspije. Status ne dokazuje da je zvučnik fizički čujan.

## Privatnost i ograničeni režim
Sačuvane lične slike, snimci, tekstovi, poruke i postavke idu samo u dokumentovanu **`device.storage v1`** mogućnost. Nema server storage fallbacka, servisa ili agenta u aplikaciji. Browser-local podaci se ne sinhroniziraju. Brisanje site data ili reinstalacija može ih ukloniti; izvezi privatni backup.

Mikrofonski snimak i lokalni BS paket obrađuju se u memoriji, bez slanja serveru. Kopiranje backupa je namjerno preko podržanog clipboard helpera.

Originalni resursi učitavaju se iz Möbiusa uobičajenim HTTP zahtjevima. Generički signali platformi sadrže samo broj simbola/tip operacije ili generičku grešku, ne poruke, slike, snimke ili imena.

Čitanje/čuvanje i Voice katalog čekaju najviše 8 sekundi. Ako host ne odgovori, vidi se **Ograničeni režim / Ponovo provjeri čuvanje**, a komunikacija ostaje dostupna u memoriji. Status govora se prikazuje zasebno. Nepotvrđeno čuvanje nije uspjeh. Ako se lokalno učitavanje zaglavi pri ažuriranju otvorenog panela, ponovo provjeri čuvanje ili svježe otvori MAAK. Oporavak ne zaobilazi sigurnost platforme. Izvorni audio zahtjev ima rok 10 sekundi. Audio-unlock čeka do 8 s; Voice setup 90 s bez stvarnog napretka; synthesis 180 s bez novog loading/audio napretka i 10 min ukupno. Prekini je dostupan tokom pripreme i reprodukcije. Engine ima i vlastiti runtime watchdog. Lokalni data-URL snimci se dekodiraju direktno, ne kroz CSP-blokirani fetch.

## Izvor, build i instalacija
Root paketa sadrži `mobius.json`. Native Android izvor nije dio ovog paketa; preneseni resursi imaju izvornu licencu i porijeklo u `NOTICE.md`.

Struktura: `index.jsx` kompozicija; `domain.js` vokabular/backup/istorija; `device-store.js` jedini lokalni podatkovni sloj; `capability-call.js` ograničena host granica; `speech.js` reproduciranje i Voice; `voice-setup.js`/`VoiceSetup.jsx` click-only priprema; `natural-pack.js`/`NaturalVoice.jsx` lokalni BS paket; `audio-local.js`/`voice-recording.js`/`VoiceRecorder.jsx` lokalni snimak; `tools/` offline priprema BS paketa; `media.js` lokalna obrada/validacija; `backup-transfer.js` vidljivi JSON i podržano clipboard kopiranje; `Settings.jsx`; `theme.js`; `assets/` originalni mediji; `tests/`.

Möbius obezbjeđuje React i Apps SDK ikone; nema CDN-a ili dodatnih runtime zavisnosti. `static/` je installer-owned izlaz, osim rezervisanog autorskog `static/store/` direktorija za javne Store snimke. Manifest navodi originalne runtime datoteke iz `assets/`.

```bash
# Iz raspakovanog source direktorija:
npm test
python3 /data/platform/backend/scripts/validate-app.py /putanja/do/maak
# Privatna instalacija u vlastitom Möbiusu, bez javnog URL-a ili Store objave:
# Smjesti source u /data/apps/maak/ (ne prepisuj drugu postojeću aplikaciju).
python3 /data/platform/backend/scripts/apply_app.py /data/apps/maak
```

Apply je dokumentovani privatni put: validira, kompajlira, upisuje prihvaćenu reviziju i aktivira aplikaciju. Ne traži restart. Ne prepisuj postojeću aplikaciju ili njene podatke. Ne kopiraj lične podatke, `.git` ili generisane runtime izlaze. Store instalacija koristi javni root `mobius.json` i platformin pregled mogućnosti; lokalni Apply sam po sebi nije javna objava.

Provjere i plafon dokaza: [TEST_REPORT.md](TEST_REPORT.md). Poznata ograničenja: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md). Neobjavljeni Store nacrt: [APP_STORE_DRAFT.md](APP_STORE_DRAFT.md).

## Licence
`LICENSE` i `NOTICE.md` preneseni su neizmijenjeni iz MAAK 1.1.4: MIT, Moj glas AAC contributors. 95 ilustracija su originalne, nisu ARASAAC/Mulberry niti klinički validiran skup. Ikonica edicije je raster adaptacija izvornog MAAK identiteta. Novi kod ove edicije također se isporučuje pod MIT licencom. Voice/engine/models nisu uključeni u ZIP; njihovim licencama i downloadom upravlja instalirani Voice (MIT aplikacija; Kyutai modeli CC BY 4.0 prema njegovoj dokumentaciji).
