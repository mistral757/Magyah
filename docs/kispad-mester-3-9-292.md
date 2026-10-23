# ⏱ Kispad-mester — játékperc a nem játszó cseréknek (3.9.292)

## A kérés

Új stábtag-fajta: az adott meccsen nem játszó cserejátékosokat edzi, és
ezzel játékperceket kapnak. A fókusza lehet a teljes cserepad, egy poszt
vagy egy játékos.

Referencia a Szakértelem szerint (teljes pad / poszt / egy játékos, perc
meccsenként): 40 → 1/3/7, 50 → 3/7/12, 65 → 5/10/15, 77 → 10/20/30, és így
tovább.

Saját játékosból azzal lesz jó Kispad-mester, hogy sok percet játszik.

## A perc-táblázat (`PAD_EDZO_TABLA`)

| Sz | teljes cserepad | posztcsoport | egy játékos |
|---:|---:|---:|---:|
| 20 | 0 | 1 | 3 |
| 40 | 1 | 3 | 7 |
| 50 | 3 | 7 | 12 |
| 65 | 5 | 10 | 15 |
| 77 | 10 | 20 | 30 |
| 88 | 14 | 26 | 38 |
| 99 | 18 | 32 | 45 |

* 40 és 77 között betűre a kérés táblázata, a pontok között lineárisan.
* 77 fölött a 65→77 meredekség felével folytatódik.
* A stáb-talizmánok (Jobb szakemberek, Mesterszint) és a csapatstílus
  műhely-képessége ugyanúgy szoroz, mint minden stábtagnál.
* Legfeljebb 90 perc.

## Mit ad a perc (`processPadEdzo`)

A perc azt a fejlődést adja, amit a pályán töltött idő a részesedéssel (share)
ad:

* a Rating részvételi alap-deltáját (0,3 × share);
* a poszt fő attribútumát (0,3 × share);
* a passzív sebességet.

Mindhárom ugyanazzal a kor-görbével számol, mint a pályán.

Ami nem jár, és miért:

* **Esemény-jutalom** (gól, gólpassz, meccsember, tiszta lap): nem volt
  meccs.
* **Az edzésterv még egyszer:** azt a pad-edzés már megadja.

Kik kapnak percet: akik a fókuszban vannak, de azon a meccsen nem léptek
pályára. Ebbe a tartalék-keret is beletartozik.

* A sérült nem edz, az eltiltott igen.
* Egy típusból egyszerre csak egy dolgozik.

A perc a pályafutás-percekbe is bekerül (`careerStats.min`, külön
`minPad` mezőként is). Ezt olvassa például a piacra tétel és az edzővé
válás. A szezonos szerep-bérbe (`seasonMinutes`) viszont nem: az a valódi
meccs-szerepet méri.

A munkanapló egysége: perc.

## A Szakértelme

A típus-pontszám tisztán a nálad lejátszott perc: `(perc / 36 000)^0,7`.
Erre jön, mint minden típusnál, a kor, a rutin és a saját nevelés
gyorsítása.

Saját, 34 éves játékosnál mérve:

| lejátszott perc | Szakértelem |
|---:|---:|
| 2 000 | ≈ 20 |
| 8 000 | ≈ 39 |
| 15 000 | ≈ 58 |
| 30 000 | ≈ 74 |

A „kiemelkedő" küszöb 0,60, ez kb. 17 000 perc.

A stábpiac is kínál Kispad-mestert: a lenyomatán a percek a csúszkával
nőnek.

## Fókusz

* A teljes cserepad, egy posztcsoport (a cserék közül), vagy egy
  játékos. Ember-fókuszban legfeljebb egy játékos jelölhető ki.
* Az előnézet mindhárom módra kiírja a perceket.

## Próba

`tools/kispad-mester-3-9-292-proba.js`.
