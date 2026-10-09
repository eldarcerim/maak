# MAAK — prijedlog Store opisa

Ovo je tekst za pregled prije javne predaje, ne potvrda da je aplikacija objavljena.

**Naziv:** MAAK  
**Autor:** Eldar Ćerim / PONTEM  
**Kratki opis:** Moj glas, moj izbor. Bosanska komunikacijska tabla s 95 originalnih simbola.

## Javni opis
MAAK je svijetla bosanska komunikacijska tabla za namjerno sastavljanje poruka pomoću 95 originalnih ilustracija. Core riječi ostaju pri ruci, uz kategorije, pretragu, DA/NE, JOŠ/STOP i POMOĆ/PAUZA. Rečenična traka ima Poništi, Vrati, Izgovori i Prekini. Telefon i tablet imaju prilagođen raspored i tri veličine simbola.

Zaštićeno uređivanje omogućava vlastite simbole, slike i kratke snimke. Lični mediji i tabla čuvaju se samo na uređaju; backup se prikazuje kao lokalni JSON s kopiranjem i provjerenim uvozom. Nema slanja ličnih AAC poruka cloud TTS servisu.

Bosanski koristi originalni sintetički eSpeak, ne prirodan neuralni glas. Prirodan paket nije uključen; moguć je lokalni uvoz 95 licenciranih snimaka za trenutnu sesiju. Zaseban English demo koristi stvarni Möbius Voice. Model i Alba glas pripremaju se tek nakon klika, po uređaju, uz napredak i prekid. Ako puni download ponovi 502, rezervni korak je Voice → English → Download model, zatim povratak u MAAK i priprema preostalog glasa. Završni status nije potvrda fizičke čujnosti.

Nije medicinski validiran proizvod. Potpun offline rad nije obećan. Brisanje browser podataka može ukloniti tablu: privatni backup čuvajte redovno. MIT izvor; originalne licence i porijeklo resursa ostaju sačuvani.

## Mogućnosti koje pregled instalacije treba objasniti
- Lokalni uređajski podaci: do 1 MiB; bez server upload/sync fallbacka.
- English Voice: namjerna lokalna sinteza i eksplicitna priprema modela/glasa.
- Mikrofon: izborno snimanje vlastite riječi do 4 sekunde, lokalni nacrt.
- Nema agenta, plaćenog govora, ključeva, cross-app podataka ili kamerom prikupljenih slika.

## Snimke za Store
`static/store/board-bs.png` prikazuje praznu bosansku tablu; `static/store/english-demo.png` prikazuje zasebni I WANT WATER demo. To su stvarne snimke dostavljene za javni opis, bez ličnih medija. English snimka nije dokaz sinteze ili čujnosti. Tačan javni opis, alternativni tekstovi i putanje slika nalaze se u `mobius.json`.
