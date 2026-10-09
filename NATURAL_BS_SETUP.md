# Prirodan bosanski glas — siguran preostali korak

## Šta je sada stvarno dostupno
Originalnih 95 WAV datoteka su eSpeak; ne postaju prirodne promjenom boje, tona ili brzine. Möbius Voice trenutno ima English/German/Italian/Portuguese/Spanish, ne Bosnian. MAAK ne šalje rečenicu cloud servisu i nema Azure ključ.

Ovaj paket ne provjerava Microsoft račun, grant, stanje sredstava ili Speech resurse. Ne dolazi s pristupom servisu ili dozvolom za potrošnju.

Offline planner nudi `bs-BA-VesnaNeural` i `bs-BA-GoranNeural`. Prije bilo kakvog servisa provjeri aktuelne [jezike i glasove](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts) i [službeni REST ugovor](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech). Opcija u planneru ne potvrđuje pristup resursa niti besplatnu uslugu.

## Opcija bez servisa: ljudski izgovoren paket
Pripremi 95 **licenciranih** lokalnih snimaka, jedan po stabilnom ID-u iz `vocabulary.js`, npr. `ja.wav`, `hocu.mp3`, `voda.wav`. Svaki mora stvarno izgovarati odgovarajući `spoken` tekst, biti do 8 s i 130.000 bajtova; WAV/MP3/OGG/WebM. Kraće riječi i mono MP3 znatno smanjuju veličinu. Prirodnost i prava potvrđuje osoba, ne program.

```bash
python3 tools/package-natural-bs.py /lokalni/bs-snimci /lokalni/MAAK-BS-paket.json \
  --name 'Bosanski — moj odobreni glas' --source human \
  --license 'Unesite stvarnu dozvolu/autora i uslove korištenja'
```

Paker radi **samo lokalno**, ne traži mrežu ni ključ i ne prepisuje postojeći izlaz. Paketu dodaje stabilni ID, tačan tekst, MIME, SHA-256 svakog audio fajla i licencu. Ne utvrđuje jezik ili vlasništvo.

U aplikaciji: **Postavke → MAAK → Otključaj uređivanje → Lokalni BS paket**. Provjeravaju se svih 95 ID-a, tekstovi, checksum, veličina, stvarno dekodiranje, trajanje i prazan/tih snimak. Zatim **Preslušaj JA → Koristi paket u ovoj sesiji**. Rečenična traka i lični simboli nisu zamijenjeni. **Koristi originalni eSpeak** vraća rezervu bez brisanja fajlova.

**Paket je session-only:** nakon ponovnog otvaranja treba uvesti svoj lokalni JSON ponovo. Nije dio backupa table, ne zauzima board quota i nije na serveru. To je namjerni put u postojećem izoliranom hostu: `device.storage` ima ukupno 1 MiB, a `device.asset-cache` podržava regenerabilne javne HTTPS pakete, ne privatni lokalni upload. Nije uveden raw IndexedDB, nova dozvola ili server fallback. Za trajni distribuirani paket treba kasnije odobriti tačne javne/licencirane resurse ili drugi podržani lokalni host ugovor.

## Azure: priprema bez potrošnje
U izvoru je **offline planner**, ne izvršivač Azure zahtjeva:

```bash
python3 tools/plan-azure-bs.py /lokalni/MAAK-Azure-plan.json --voice bs-BA-VesnaNeural
```

Plan navodi samo 95 već javnih osnovnih riječi, SSML, izlazne ID.mp3 nazive, broj znakova i format `audio-16khz-32kbitrate-mono-mp3`. Nema trenutne AAC rečenice, privatnog simbola, slike, snimka, regiona ili ključa. Nema poziva servisu ili potrošnje.

**Tačan minimalni servisni korak:** potvrditi postojeći Azure Speech resource/region i grant uslove te posebno odobriti najviše **95 zahtjeva samo za taj fiksni osnovni vokabular** odabranim Vesna ili Goran glasom. Pristupni ključ ide kroz Möbius sealed secure-input/encrypted secret helper u budućem odobrenom koraku, nikad chat, JS, backup ili repo. Ta dozvola ne bi odobrila live cloud TTS ličnih AAC poruka. Nakon odobrenog rendera preslušati 95 datoteka/licence, pakovati lokalno prethodnim pakerom (`--source azure`), pa uvesti paket. Ništa od toga nije izvršeno u ovoj reviziji.

## Vlastita riječ bez paketa
**Postavke → MAAK → Novi/Uredi simbol → Snimi svoju riječ** traži mikrofon tek nakon dodira. Do 4 sekunde, mono 16kHz PCM WAV; prazan/tih snimak i predugo čekanje se odbijaju. **Završi / Odustani**, zatim **Preslušaj snimak → Sačuvaj simbol**. Snimak prije čuvanja ostaje samo u nacrtu. Ako mikrofon/OS dozvola ne radi, koristi postojeći uvoz lokalnog WAV/MP3/OGG/WebM fajla do 130kB/8s. MAAK ne klonira ovaj glas i ne šalje ga Voice server biblioteci.
