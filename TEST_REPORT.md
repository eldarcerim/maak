# Provjere — MAAK Möbius edicija

Ovaj dokument opisuje provjere izvora i granice dokaza. Ne sadrži privatne razvojne zapisnike ili korisničke podatke.

## Automatske provjere
Paket ima **57 Node testova**. Pokreni `npm test` i `bash build.sh` u direktoriju izvora.

- Vokabular, core/kategorije, pretraga, poruke i poništi/vrati.
- Lokalno čuvanje, ograničena inicijalizacija, oporavak i validacija backupa.
- Vidljivi JSON, clipboard odbijanje i zajednička validacija file/paste importa.
- Read-only Voice katalog bez automatskog downloada; engine/profil, odabir i potvrda spremnosti.
- Download greška, tačno jedan retry na 502, prekid, kasni događaji, zastoj i očuvanje spremnog English glasa.
- AudioContext u originalnom dodiru, ograničeno čekanje, nedostajući/pogrešni model, tihi/neispravni PCM, greška zakazivanja i prekid.
- Lokalno dekodiranje audio data-URL-a bez mrežnog fetch-a.
- Paket95: ID/tekst, licenca, checksum, MIME/veličina, dekodiranje, trajanje/tišina, timeout/cancel i session-only aktivacija.
- Reviewed mikrofon, odbijanje/nedostupnost, finish/cancel, čekanje dozvole, zastoj i mono 16 kHz WAV.

Browser, Voice, mikrofon i dekoder su u unit testovima **mockovani**. Prolazak nije dokaz stvarnog preuzimanja, sinteze, mikrofona, prirodnog izgovora ili fizičke čujnosti. `validate-app.py` provjerava manifest/import closure i stvarni production build.

## Tokovi za provjeru na uređaju
1. Bosanski: JA → HOĆU → VODA, Poništi, Vrati, Izgovori i Prekini. Provjeri čujnost, ne samo završni status.
2. Reload: rečenica i veličina ostaju nakon potvrđenog lokalnog čuvanja. Ako čuvanje nije dostupno, nakon najviše 8 s mora se vidjeti ograničeni režim, ne beskonačno učitavanje.
3. English na svježem browser profilu: preostali bajtovi → eksplicitna priprema → napredak/prekid → ponovna priprema → odabir glasa → I WANT WATER → Izgovori. Bez klika nema downloada ni govora.
4. Ako puni model download i ograničeni retry vrate 502: **Otvori Voice → English → Download model**. Vrati se u MAAK, ponovo provjeri glas i pripremi preostali Alba profil. Već potvrđeni model ne treba ponovo preuzimati.
5. Otključaj MAAK, kreiraj probni simbol, izmijeni ga, ukloni uz potvrdu i provjeri lokalni povrat. Koristi samo testne medije.
6. Backup: prikaži/kopiraj JSON, sačuvaj lokalni fajl, pregledaj file/paste import i potvrdi. Oštećeni/preveliki JSON mora biti odbijen bez promjene table.
7. Mikrofon: allow/deny, završi/odustani, preslušaj, sačuvaj i reload. Prirodni BS paket: 95 licenciranih datoteka, provjera/preslušavanje/aktivacija i povrat na eSpeak.
8. Telefon/tablet, OS file picker, screen reader, PWA i audio izlaz provjeravaju se posebno.

## Granice izdanja
- Završni status English znači da je zakazani audio završen; **ne potvrđuje čujnost zvučnika**. Fizička čujnost i kvalitet nisu certificirani.
- English setup ima rezervni put preko službene Voice aplikacije. Nema alternativnog mirror-a, checksum bypassa ili neslužbenog TTS-a. Tačan uzrok mogućih 502 nije ustanovljen.
- Prirodan BS paket nije uključen. Originalni eSpeak nije neuralni glas. Offline planner i lokalni paker ne izvršavaju cloud zahtjeve.
- Clipboard/OS backup round-trip, mikrofon, fizički audio i pristupačnost zahtijevaju ljudsku uređajsku provjeru; mockovi ih ne zatvaraju.
- Potpun offline rad nije obećan; `offline_capable` ostaje `false`.

Licence i izvorni PNG/WAV resursi ne mijenjaju se ovim testovima. Nije medicinski validiran proizvod.
