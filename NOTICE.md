# Porijeklo resursa · MAAK 1.1.4

## Kod i ilustracije

Izvorni kod i 95 vlastitih programatski nacrtanih vektorskih ilustracija isporučeni su pod MIT licencom iz LICENSE. SVG izvori su u `app/src/main/assets/symbols-pontem`, rasterizirane PNG verzije u `symbols`. Ikonice upravljanja također su nacrtane geometrijskim oblicima/linijama.

Emoji ilustracije iz ranije verzije zamijenjene su u aktivnom skupu. Nijedna font datoteka se ne distribuira. Ovo nije ARASAAC, Mulberry niti drugi standardizirani ili klinički validirani simbolički sistem. Ilustracije ne predstavljaju stvarne članove porodice.

## Rezervni zvuk

WAV datoteke i njihove MP3 kopije predstavljaju ranije generisani sintetički izlaz eSpeak bosanskog glasa. Uključen je samo audio, ne program ili jezička baza. Izgovor i naglasci nisu profesionalno provjereni. MP3 kompresija smanjuje veličinu datoteke, ne pretvara glas u neuralni.

Ženska rezerva je generisana lokalno pomoću eSpeak 1.48.15, glas `bs+f3`, nominalna brzina 145, parametar visine 48. Aplikacija pušta sintetičke izgovore na zadanoj brzini 1.10×; lične snimke pušta na 1.0×. Parametri i katalog su u `female-audio-info.json` i `female-audio.json`. Generator je `tools/generate_female_audio.py`.

Dokumentacija dobavljača opisuje `+f` profile kao sintetičke varijante koje simuliraju ženski glas; nema obećanja prirodnog izgovora: https://espeak.sourceforge.net/commands.html
Android playback/voice API reference: https://developer.android.com/reference/android/speech/tts/TextToSpeech

## Sistemski govor

MAAK 1.1.4 ne koristi Azure niti PONTEM govorni server. Novi tekst se predaje Androidovom instaliranom TTS servisu. MAAK preferira tačan odabrani jezik i lokalnu varijantu glasa. Ako servis ima dvije zasebne porodice za isti jezik, koriste se kao odvojeni ženski/muški profili; ako ima samo jednu, koristi se blaga prilagodba tona. Ako servis nudi samo mrežnu varijantu, sam TTS pružalac može koristiti mrežu prema svojim pravilima. Ugrađeni WAV zapisi ostaju samo krajnja rezerva.

## Privatnost

Nema porodičnih snimaka, fotografija porodice, imena djeteta, serijskog broja tableta ni pristupnih ključeva. Testovi koriste sintetički audio i lažne HTTP odgovore. Pravi ključevi ne smiju biti u chatovima, HTML-u, APK-u ili javnom repozitoriju.

## Ikonica 1.1.4
Vanjska geometrija iz prethodnog projekta je sačuvana. Novo M nacrtano je kao tri vektorske putanje; nisu upotrijebljeni fontovi ili tuđi logotipi. Pokušaj alata za generisanje slike nije vratio sliku; aktivni resurs je programski nacrtan SVG/VectorDrawable.
