# 3.9.190 — 💸 Dinamikus bér: a számla nem a plafont tölti ki

> „Továbbra is maradjon intelligens, ne csak őrülten töltsük ki mindig a max
> 50% keretet. Tehát legyen dinamikus a dolog!"

## 1. A hiba, mérve

A 3.9.189 óta a bér a valódi jegyáron számol. A nyers számla viszont eleve a
plafon fölé épült:

* **a bázis** a lelátó fele és a klub-keret negyede volt — ez egymagában
  már a plafon;
* **a ligához mért Rating-többlet** exponenciálisan szorozta (4%/pont, +15
  pont = ×1,8);
* **a top sztárok felára** 3 × 1/12, azaz +25%;
* **a trófea** darabonként +11%.

**Mérés** (kezdő 11, 40 000 fős horgony, 90 / 105 / 117 / 125 nyers erő):

| keret | nyers számla a lelátóhoz | fizetve (sikeres idény után) |
|---|---|---|
| ligaszintű, sztár nélkül | 79–108% | **50%** |
| +8 Rating a liga fölött | 109–149% | **50%** |
| +15 Rating, 3 sztár, 2 trófea | 221–274% | **50%** |

A bér tehát valójában egyetlen szám volt: „a lelátó fele”.

## 2. Az új szabály

| elem | 3.9.189 | 3.9.190 |
|---|---|---|
| bázis — lelátó | 50% | **16%** |
| bázis — klub-keret (meccsre osztva) | 25% | **8%** |
| trófea-béremelés (darabonként) | a lelátó 1/9-e | **1/36-a** |
| top sztár felára (fejenként, legfeljebb 3) | a lelátó 1/12-e | **1/40-e** |
| a keret minősége a ligához | a Rating-kulcs teljes aránya (exponenciális) | **a kezdő 11 átlagos bér-kulcsa / a liga kulcsa, gyököt vonva, ×0,75–1,6** |

* **A kereten belüli szétosztás nem változott:**
  * a 4%/pontos Rating-kulcs;
  * rajta a játékos saját szorzója (szerep, kapitány, POT, hűség, siker,
    friss sztár-igazolás, ifi — 3.9.189).
* **A plafonok sem változtak:**
  * sikeres idény után a lelátó 50%-a;
  * siker nélkül 125%;
  * a „Sztárom a párom” sztárja a plafonon kívül.

## 3. Az eredmény, mérve

Kezdő 11 + 3 csere (25 perc/meccs), a nyers számla a lelátó százalékában:

| keret | friss keret | összeszokott (100 meccs) |
|---|---|---|
| ligaszintű, sztár nélkül | 23–29% | 28–36% |
| +8 Rating, 1 sztár | 30–37% | 36–44% |
| +15 Rating, 1 sztár | 34–42% | 41–51% |
| +8 Rating, 3 sztár, 2 trófea | 42–49% | 50–59% → **plafon** |
| +15 Rating, 3 sztár, 2 trófea | 47–55% | 57–67% → **plafon** |

**A számla tehát a keret valódi jellemzőiből jön ki:**

* a minőség a ligához;
* a rotáció;
* a hűség;
* a friss sztár-igazolások;
* a top sztárok;
* a trófeák.

**A plafon csak a legdrágább kereteknél fog:** az erős, összeszokott, sztáros
és trófeás bajnoknál.

**Siker nélkül** a 125%-os plafon csak felső határ. A számla nem megy fel
odáig, egy ligaszintű keret ott is a lelátó negyedét viszi.

## 4. Hol látszik

* **A keret-bontás:**
  * a „…ez meccsenként” sor kiírja a kezdő 11 ligához mért minőség-szorzóját;
  * a „…bér / szerződéskori lelátó” sor kimondja, hogy a számla a plafon
    alatt van, vagy hogy a plafon visszahúzta.
* **A súgó** (`fizetesek`):
  * az új arányok;
  * a tompított minőség;
  * „A BÉR DINAMIKUS, NEM A PLAFONT TÖLTI KI”.
* **Az adatlap** (3.9.189) a plafon utáni összeget csak akkor írja ki, ha a
  plafon tényleg fog.

## 5. Próba

* `tools/dinamikus-ber-3-9-190-proba.js` — lásd a `tools/README.md`-t.
* A `tools/jatekos-fizetes-3-9-189-proba.js` plafon-ellenőrzése mostantól
  szándékosan drága keretet állít be: egy átlagos keret már nem éri el a
  plafont.
