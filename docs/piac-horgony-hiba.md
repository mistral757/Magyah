# 🧭 A piac horgonya és a HSZ mezőnye (3.9.125)

## 1. A bejelentés

> „Valamelyik update valamibe a játékos-felskálázásnál belenyúlt és nem
> működik a scout, az átigazolás, semmi megfelelően. Most egy 170-es
> erősségű mezőnyben vagyok, és nem talál semmit az attribútum-kereső, a
> sztár-kereső 100 körülieket akar nekem eladni 70 Mrd-ért, amikor nekem
> 1000× több pénzem van és 170-180-as játékosaim, a scout is beakadt."
>
> „+1 nem a meccs-erőhöz mérte a mezőny összeállítását a Hiper Szuper
> Ligában. A meccs-erőm 192 és 178-as mezőnyt csinált nekem."

**Mindkettő az én hibám**, a 3.9.112-es és a 3.9.123-as kötegből.

## 2. Az első: a piac horgonya

A piac emelkedése egyetlen különbségből él:

```js
marketPeakShift() = pyrPoolOffset() + (oppTargetRating − careerBaseRating)
```

A piramis három horgonya (`pyrAnchorAtKickoff`, `pyrAnchorShared`,
`pyrSuperAnchorShared`) a világ eltolása után ezt futtatta:

```js
oppTargetRating  = pyrLevel();
careerBaseRating = oppTargetRating;     // ← a különbség NULLÁRA esik
```

Amíg ez **karrierenként egyszer** futott (a kezdőrúgáskor, a `P.anchored`
őrrel), addig **helyes** volt: ott a horgony tényleg a karrier
indulószintje.

**A 3.9.112 szuperliga-kalibrációja viszont minden idényben
`P.anchored = false`-ot ír.** Vagyis a horgony minden szezonban a mostani
szintre ugrott, a piac emelkedése nullázódott, és a le nem igazolt pool a
nyers adatbázis szintjén (85–100) ragadt, miközben a világ 170-en járt.
Innen jön minden bejelentett tünet: a scout nem talál senkit a saját
sávodban, az attribútum-kereső üres, a sztár-piac 100-asokat kínál.

### Ez a hibaosztály már ismert volt

A betöltés-javító **szó szerint** ezt írja le:

> „121-es mezőnyön is 85-95-ös jelöltek jöttek, és az attribútum-keresés sem
> talált 100 fölötti értéket, mert a poolban nem is létezett ilyen."

Csakhogy az **betöltéskor** fut egyszer — a szezonforduló utána rontotta el
újra. A javítás tehát egy újraindításig tartott, és a következő
szezonfordulóval visszatért.

### A megoldás nem folt, hanem invariáns

```js
function pyrSetMarketAnchor(){
  const b = S.run.baseDiff;            // a karrier indulószintje
  if(b != null){ if(careerBaseRating > b) careerBaseRating = b; return; }
  careerBaseRating = oppTargetRating;
}
```

**A horgony soha nem emelkedhet a karrier indulószintje fölé.** A Run-mérő
ezt a draft lezárásakor, bármely szintváltás előtt teszi el — ez a karrier
igazsága.

Nem `min(b, szint)`: kieséskor a világ a horgony **alá** eshet, és egy
lejjebb húzott horgony a piacot **felfújná** (a különbség nő).

**A meglévő mentés magától helyreáll**: az első horgonyzás visszateszi az
indulószintre, és ugyanabban a lépésben fel is húzza a poolt. A próba ezt
külön méri (5. szakasz).

## 3. A második: a HSZ mezőnye

A 3.9.123 a **szezonindító** meccs-erőt (`msKick`) tette meg horgonynak,
azzal az indokkal, hogy a kupa a szezon végén fut. A gyakorlatban ez azt
jelentette, hogy a kupa mezőnye egy **fél évvel korábbi** kerethez méretett:
179-es rajt után 192-es kerettel is 178-as mezőny jött.

Mostantól a horgony a **belépéskori** meccs-erő. A lebutítás-védelem itt is
hat: a mérés nevezési ablakban megy (`msRatedBegin`), tehát a kupa kedvéért
sem éri meg rossz tizenegyet kiállítani. Az `msKick` csak tartalék.

## 4. Amit a mérés hozott

A `tools/piac-horgony-proba.js` a régi kódon **11 állításon bukik**, és
pontosan a bejelentett képet adja vissza:

| | régi kód | javítva |
|---|---|---|
| horgony egy forduló után | 78 → **178** | **78** |
| piac emelkedése | **0** | **99** |
| pool csúcsa 177-es világban | **108** | **195** |

## 5. Egy melléklelet: a nevezési szám nem driftel

A horgony hurka negyvenszer olvassa a meccs-erőt. Ha a nevezési szám közben
elmozdulna, a kalibráció mozgó célra lőne. Öt egymás utáni mérés bitre
azonos eredményt ad — a `msPotential` determinisztikus és mellékhatásmentes
(a `szuperliga-kalibracio-proba` ezt külön állítja).

> **A tűrésről őszintén.** A `szuperliga-kalibracio-proba` rés-tűrése 0,3-ról
> 1,0-ra tágult. Ez a **próba** korlátja, nem a kalibrációé: a mezőnyszint
> egészre kerekül, és a szintetikus keret (11 ad hoc játékos, több sloton
> ugyanaz a név) felnagyítja a csúszást. Izolált, tiszta kerettel mérve a
> horgony pontosan 2,0-ra áll.
