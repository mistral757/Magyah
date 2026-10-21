# 3.9.263 — A pénz a 3–4. idény után is józan marad

> „A mérési adatainkat is böngészd. És próbálj valamit kidolgozni, amivel 3-4.
> szezon után is még reasonable lesz az anyagi oldala a játéknak."
>
> A közös karrier társa: „Kb 120 ifi boost fér bele […] Itt egyszer csak
> valahol tízszeres sebességgel kezd el ömleni a pénz. Ami tök jó, csak
> irreális fejlesztéseket tesz lehetővé ahhoz képest, hogy egy darabig minden
> fillért meg kellett becsülni."

## 1. A mérés

Forrás: a `meres-adat` ág, 13 karrier, 34 idény, az idényenkénti `penz`
bontás. Az alábbi számok bevételek, eladások nélkül.

| karrier | 1. idény | 2. | 3. | 4. |
|---|---|---|---|---|
| csiga, 7. fokozat | 6,6 ezer | 77 ezer | 10,5 millió | 467 millió |
| gleccser, 7. fokozat | 8,0 ezer | 154 ezer | 28,9 millió | 5,4 milliárd |

A csapaterő ezalatt nagyjából duplázódik. A bevétel idényenként ×30 és ×190
között ugrik.

## 2. A két ok

### 2.1 A fejlesztések ára lemarad

A boost-egység, a poszt-betanítás és a fix fejlesztési árak horgonya a
működési keret (`clubBudgetScale`). Ez a csapaterőből nő, pontonként 4,5%-kal.

A bevétel szinte egésze viszont a piaci árakhoz kötött csatornákból jön:

* lelátó: a keret átlagos kikiáltási ára;
* kupadíj: a piac teteje;
* sztár-tételek.

Ezek a POT-görbével exponenciálisan nőnek. A 4. idényre a „klub éves
bevétele” mérce a valódi bevételnek kb. 1%-a lett, innen jött a 120 ifi-boost.

### 2.2 A kihívás pénzjutalma kamatos kamat volt

A régi képlet:

```
(0,28 × egyenleg + 2500) × (1 + (mezőny − 80) × 0,02)
```

Egy 228-as mezőnyben, nehéz (×1,25) és hosszú (×1,5) kihívásnál egyetlen
jutalom az egyenleg kétszerese. Egy mért 4. idényben ez 2,29 milliárd volt, a
bevétel 42%-a. A jutalom tehát a felhalmozott pénzzel nőtt, és büntette azt,
aki elköltötte.

## 3. A szabály

### 3.1 A fejlesztések léptéke

A lépték (`penzLeptek`) a működési keret és a valódi éves bevétel fele közül a
nagyobb.

* **Valódi éves bevétel:** az előző lezárt és a mostani idény bevétele közül a
  nagyobb.
* **Ami nem számít bele:** az eladás, a hitel, a visszatérítés és a
  PvP-felzárkóztatás. Ezek nem a klub szerkezeti bevételei, és az eladás
  beszámítása a keret kiárusítását büntetné.

Erre a léptékre ül:

* a boost-egység (1,1 × lépték), vele mind a hét boost és az egyenlítő;
* a poszt-betanítás;
* a fix fejlesztési árak (stáb, scout, felállás, keretbővítés), a meglévő
  gyökös fékkel.

**A karrier eleje betűre a régi.** Az 1. idényben valódi motorral mérve a
valódi bevétel ≈ 1,5 × működési keret, tehát 0,5 × 1,5 < 1.

**Később sem lesz belőle száz.** Egy idény valódi bevétele legfeljebb ~1,8
ifi-boostot fizet. A karrier elején is ennyi: a mért karrierekben az 1–2.
idényben egy idény ~1–1,8 egységet költött boostra.

**Nem manipulálható.** A költés nem csökkenti, mert bevételt mér, nem
egyenleget. Az eladás nem emeli.

### 3.2 A kihívás pénz-tétje

* **Új alap:** 0,85 × lépték, a jutalom és a büntetés is. Az egyenleg nem
  számít.
* **Nem gerjeszti önmagát:** a tét saját léptéke a kihívás- és
  mérföldkő-jutalom nélkül méri a bevételt.
* **A karrier elején ugyanott van:** 85-ös mezőnyben, 5 000-es egyenlegnél a
  régi ~4 200, az új ~4 500.

### 3.3 Ami szándékosan maradt

* **PvP-felzárkóztatás:** a régi léptéken marad. Az bevétel, a valódi
  bevételhez kötve önmagát gerjesztené.
* **Talizmános kamat és tőzsde:** a működési kerethez kötött plafonnal fut,
  ez eddig is így volt.

## 4. A felület

A boost-katalógus kiírja a léptéket, a működési keretet és a valódi bevétel
felét, valamint azt, melyik dönt most.

## 5. Futó karrierekben

A könyvelés (`S.ledger`) a mentésben van, ezért egy késői karrierben a
3.9.263 betöltése után az árak **azonnal** a valódi bevételhez igazodnak.
Ott a boost érezhetően drágább lesz, ez a cél.

## Próba

`tools/penz-leptek-3-9-263-proba.js` méri:

* a karrier eleje a régi;
* a nagy bevétel fele dönt, a kizárt kategóriák nélkül;
* legfeljebb ~1,8 boost fér egy idénybe;
* a kihívás-tét az egyenlegtől és a saját jutalmától független;
* a katalógus kiírja a léptéket.

A `talizman-kihivas-rejtett-proba.js` a nagy alapot most nagy valódi
bevétellel kapja, nem nagy egyenleggel.
