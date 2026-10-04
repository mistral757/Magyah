# 3.9.183 — 🎺 A jegyár 100-as nyers erő fölött a piaccal nő

> „Egy ponton túl jelentéktelenné kezd válni a szurkolói bevétel. 100-as
> nyers erő fölött ez is kezdjen el fokozatosan skálázódni."

## Mi volt a baj

**A jegyár fix volt:** 10 000 Ft/fő/meccs, ezt csak az idény-élmény szorozta.
**A piac viszont meredeken nő:** a játékosok ára a nyers erővel exponenciálisan
emelkedik, és a szezonkeret vitrin-prémiuma is a piac tetejét követi.

Mérve a piaci ár, 100-as nyers erőhöz viszonyítva:

| nyers erő | piaci ár |
|---|---|
| 100 | ×1 |
| 105 | ×2,0 |
| 110 | ×3,8 |
| 117 | ×8,3 |
| 120 | ×11,3 |
| 130 | ×28,2 |
| 150 | ×130 |

A bejelentéskori képernyőn (116,7-es nyers erő) a lelátó egy idényre
644 Mrd Ft-ot hozott. Ez a 138 460 Mrd Ft-os szezonkeretnek kb. 0,5%-a volt.

## Mostantól

**100-as nyers erőig minden marad.** Fölötte a jegyár **ugyanazon a görbén nő,
amin a játékosok piaci ára**:

    jegyár-szorzó = piaci ár(nyers erő) / piaci ár(100)

* **Folytonos és fokozatos:** pontosan 100-nál ×1, 100,1-nél ×1,013,
  117-nél ×8,3, 130-nál ×28.
* **A lelátó vásárlóereje állandó marad:** ugyanannyi játékost „vesz”, mint
  100-as erőnél, ezért nem válik jelentéktelenné.
* **A nyers erő** ugyanaz a szám, amit a taktika-plafon (3.9.176) is használ:
  a keret nyers csapatereje (`teamOVRbase`).

### A bér nem követi

A fizetések a **szerződéskori lelátóhoz** kötöttek, és az a régi jegyáron
számol. A többlet ezért **tisztán a klubé**:

* a bér, a sztárfelár és a bérplafon nem nő a jegyárral;
* a bérhorgony újraszámolása a rögzített bevételből a szorzót kiveszi, így a
  szurkolólétszámot nem fújja fel.

### Ami viszont követi

Ami a heti lelátó-bevételből számol, az automatikusan vele nő:
* a talizmán-események;
* a szponzori és a hírnév-csatornák.

Ezek ugyanis „a lelátó értékét” mérik.

## A felületen

* **A HUB szurkolói doboza:** „… · a jegyár a 100 feletti nyers erőddel ×8,33”.
* **A keret bontása:**
  * a szurkolótábor sora kiírja a szorzót;
  * a tiszta haszon két sorban áll: a szezon közben szerzett tábor és a
    jegyár 100 feletti szorzója. A bér egyiket sem követi.
* **A szótár** (Szurkolói bevétel) is elmondja.

## Próba

`tools/jegyar-skala-3-9-183-proba.js`, 11 állítás:

* 100-ig ×1, fölötte folytonos és szigorúan nő;
* a szorzó a piaci árgörbe aránya;
* a bevétel nő, a bér horgonya nem;
* a bérhorgony visszaszámolása helyes;
* a felület és a szótár;
* nincs oldalhiba.
