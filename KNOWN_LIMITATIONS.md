# Poznata ograničenja
- Ovo nije medicinski validiran proizvod niti zamjena za individualnu stručnu procjenu. Izvorne ilustracije nisu standardizirani klinički skup; audio izgovor nije profesionalno ocijenjen.
- Bosanski audio je izvorni sintetički eSpeak fallback: riječ po riječ, bez gramatičke korekcije ili proizvoljnog BS TTS-a. Ako veza pukne usred poruke, već reproducirane riječi mogu biti čujne prije jasne greške. Voice trenutno nudi English/German/Italian/Portuguese/Spanish, ne BS/HR/SR.
- Vlastiti simbol bez lokalne audio datoteke nema glas; poruka koja ga sadrži jasno prijavi problem. Slika je opciona, bez slike vidi se početno slovo.
- English demo namjerno je zaseban. Glas mora biti spreman i odabran preko Pripremi English glas ili Voice, u istom browser profilu. Prvi engine start može trajati; prekid ostaje dostupan. Status završetka nije ljudska potvrda čujnosti.
- Model nije uključen u izvorni paket niti automatski preuzet. Preuzimanje u jednom browseru ne postavlja drugi uređaj ili privatni/incognito profil.
- Čuvanje je best-effort samo na uređaju, ukupno do 1 MiB preko hosta. Tabla do 450.000 bajtova uz jedan prethodni snapshot; 50 vlastitih simbola; lični audio do 130 kB / 8 s. Za veliku kolekciju medija potreban je drugi dokumentovani host ugovor, ne server upload.
- Brisanje site data, reinstalacija ili browser evikcija mogu ukloniti podatke. JSON backup čuvati privatno; nema automatske sinhronizacije.
- Frame response CSP nema `allow-downloads`. Izvoz je zato omogućen vidljivim lokalnim JSON-om, podržanim Möbius clipboard kopiranjem i ručnim odabirom. Kopirani JSON korisnik mora lokalno sačuvati kao .json. Clipboard može biti odbijen ili sinhroniziran između uređaja prema postavkama OS-a; ručni vidljivi JSON ostaje alternativa. Nema server fallbacka ili promjene izolacije.
- Undo/redo (25 koraka) radi u trenutnoj sesiji, ne preživljava reload. Rečenice oba jezika i postavke preživljavaju uspješno lokalno čuvanje. Import/uklanjanje imaju jedan nivo atomskog lokalnog povrata.
- Otključavanje tekstom MAAK je zaštita od slučajnih dodira, nije autentikacija ili šifriranje.
- `offline_capable: false`: nije obećan potpun offline rad niti hladni offline reload. Originalne slike/WAV i app code mogu trebati vezu. Lokalni device podaci i preuzeti Voice jesu lokalni, ali to nije dokaz cijele offline aplikacije.
- Pri ažuriranju otvorenog panela lokalna inicijalizacija može zastati. Edicija prekida čekanje nakon 8 s, prikazuje ograničeni režim i čuva razgovjetan odvojeni status zvuka. Svježe otvaranje ili Ponovo provjeri čuvanje su mali oporavak; host sigurnost nije promijenjena.
- Telefon/tablet dodir, fizička čujnost, čitač ekrana, kopiranje/lokalno čuvanje JSON-a i import kroz OS file picker i prekid dugog realnog Voice govora zahtijevaju provjeru na uređaju. Dizajn ima responzivne rasporede, fokus i 44px kontrole; to nije predstavljeno kao završena device validacija.

## Glas i priprema
- Prirodan BS paket nije isporučen: postoji lokalni checksum/media-validated uvoz 95 riječi, eksplicitno aktiviranje i session-only reprodukcija. Poslije reloada ponovni uvoz; nije dio board backupa. Izvor i licenca su prijavljeni od dobavljača, nisu dokaz prirodnosti/izgovora/prava.
- Cloud servis nije povezan ovom aplikacijom niti je potrošnja odobrena kroz paket. Ugrađen je samo offline plan fiksnog vokabulara; nema mrežnog rendera ili live cloud poruka. Detalji: [NATURAL_BS_SETUP.md](NATURAL_BS_SETUP.md).
- Snimanje vlastite riječi traži reviewed mikrofon v1 na dodir (do 4 s); WAV nacrt ostaje lokalno. Uvoz do 8 s ostaje alternativa. Browser mic dozvola i stvarna čujnost traže uređajsku provjeru.
- Nema tihog browser TTS fallbacka. Zadržan je pravi shared Möbius Voice; greška je vidljiva umjesto pogrešnog jezika ili udaljenog glasa.
- Ako prvi puni English download vrati 502, dopušten je samo jedan retry istog paketa po kliku. Ako se ponovi, **Otvori Voice → English → Download model**, pa se vrati u MAAK na provjeru/pripremu preostalog Alba glasa. Već potvrđeni dijelovi se prepoznaju. Tačan uzrok mogućih 502 nije utvrđen; ne briši lokalne podatke radi pokušaja popravke.
