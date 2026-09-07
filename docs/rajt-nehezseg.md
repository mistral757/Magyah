# A rajt nehézsége — vállalás az osztályválasztón, beváltás a kezdőrúgáskor

*(3.8.29. Érintett kód: `PYR_START_DIFF` · `pyrDiffForGap` / `pyrDiffById` ·
`pyrPtsExp` / `pyrPredict` / `pyrPredictTxt` · `pyrAnchorAtKickoff` ·
`renderPyrDiffPick` · a `#pyrDiffList` / `#pyrDiffNote` blokk és a
`startFirstSeason` hívása.)*

> **BEJELENTETT KÉRÉS:** „hagyományos módban legyen a jelenlegi auto nehézségi
> szint beállítás kicsit érzékenyebb a végleges keret erejére: a szezon
> indítás pillanatában szülessen meg a kezdő nehézségi szintje annak a
> divíziónak, amiben a játékos választotta hogy elindul. Azon a képernyőn, ahol
> a divíziót választjuk, ott nehézséget lehessen megválasztani… és akkor
> kiírja, hogy milyen a Run-szint plafon, és a végleges induló kereted
> meccs-erejéhez képest hol lesz majd a választott divízió középmezőny szintje
> (és itt legyen egy várható helyezés predikció), hogy lehessen érteni a
> vállalásodat. […] És a legnehezebb szinteken egyértelműen olyan meccs-erő
> kell beállítva legyen, amivel az első szezon egyáltalán nem sétagalopp."

---

## 1. Ami eddig hazudott

A rés a **választás** pillanatában dőlt el, a **draftolt** keretre
(`pyrSquadEff`). Utána jött a nyár: igazolások, boostok, edzés, összhang — és a
kezdőrúgásra a kereted 5–15 Ratinggel erősebb lett, mint amire a világot
beállítottuk. Ráadásul a piramisban az **auto szintkövetés sem fut**:

```js
function autoLevelSync(atBoundary){
  …
  if(typeof pyrOn==="function"&&pyrOn())return false;   /* a piramisban nincs mit követni */
```

Vagyis semmi nem hozta helyre.

**Mérve** (a valódi képlettel, D6-os kezdés, 76-os draftolt keret):

| vállalás | draft-keret | végleges keret | **régi tényleges rés** | világ mozdul | **új rés** |
|---|--:|--:|--:|--:|--:|
| Sétagalopp (+6) | 76 | 84 | +14 | +7,9 | **+5,9** |
| Sétagalopp (+6) | 76 | 92 | +22 | +15,8 | **+5,9** |
| Egyenrangú (0) | 76 | 84 | **+8** | +7,9 | **−0,1** |
| Egyenrangú (0) | 76 | 92 | **+16** | +15,8 | **−0,1** |
| Nehéz (−3) | 76 | 84 | +5 | +7,9 | **−3,1** |
| Nehéz (−3) | 76 | 92 | +13 | +15,8 | **−3,1** |
| Brutális (−6) | 76 | 84 | +2 | +7,9 | **−6,1** |
| Brutális (−6) | 76 | 92 | +10 | +15,8 | **−6,1** |
| Kegyetlen (−9) | 76 | 84 | **−1** | +7,9 | **−9,1** |
| Kegyetlen (−9) | 76 | 92 | **+7** | +15,8 | **−9,1** |

A negyedik oszlop a bejelentés: **a „Kegyetlen" rajt a gyakorlatban +7-es
fölénnyé hízott**, ha a nyáron jól igazoltál. A legnehezebb beállítás
sétagalopp lett — pontosan az, amit a kérés utolsó mondata kizár.

## 2. A vállalás — hét fokozat, a meccs-erő nyelvén

A nehézség mostantól **nem** a nyers csapaterőről szól, hanem arról a számról,
amit a mérkőzés tényleg használ: `levelGap = teamMatchStrength −
oppMatchStrength`.

| fokozat | rés | mit jelent |
|---|--:|---|
| 🌴 Sétagalopp | +6 | a mezőny hat Ratinggel alattad — a cím alig kérdés |
| 🙂 Kényelmes | +4 | esélyesként kezdesz, a cím reális |
| 🙃 Enyhe fölény | +2 | a dobogó a te kezedben van |
| ⚖️ Egyenrangú | 0 | pont akkora vagy, mint a mezőny közepe |
| 🥊 Nehéz | −3 | a bennmaradás is munka |
| 🔥 Brutális | −6 | az első idény a túlélésről szól |
| 💀 Kegyetlen | −9 | a liga minden csapata erősebb nálad |

## 3. A predikció — nem becslés, hanem várható érték

A képernyő kiírja, hányadik helyre futna ki a vállalás. Ez **nem szimuláció és
nem jóslat**, hanem a mérkőzés SAJÁT modelljéből számolt várható érték:

* `pyrPtsExp(diff)` — egy mérkőzés várható pontja. Ugyanaz a két Poisson,
  amiből a meccs is dolgozik (`SIM.BASE · e^(SIM.K·d)`, padló 0,15, plafon
  4,5), nyolc gólig összegezve;
* `pyrPredict(ellenfelek, sajátErő)` — a választott osztály **tizenöt valódi**
  ellenfelére, oda-vissza, mindenki mindenkivel. Kiszámoljuk minden csapat
  várható pontszámát, és megnézzük, hányadikra jönnél ki.

**Mérve** (16-os osztály, közép 80, a mezőny szórása ±4,5):

| nehézség | rés | meccs-erő | várható pont | várható helyezés | olvasat |
|---|--:|--:|--:|--:|---|
| Sétagalopp | +6 | 86 | 69 | **1.** | bajnokesélyes |
| Kényelmes | +4 | 84 | 61 | **2.** | osztályozós hely |
| Enyhe fölény | +2 | 82 | 52 | **5.** | felső ház |
| Egyenrangú | 0 | 80 | 43 | **8.** | középmezőny |
| Nehéz | −3 | 77 | 30 | **13.** | alsó ház |
| Brutális | −6 | 74 | 18 | **16.** | kiesőhely |
| Kegyetlen | −9 | 71 | 10 | **16.** | kiesőhely |

Egy meccsre lebontva (hazai +1,2 / idegen −0,4 nélkül):

| erőkülönbség | −9 | −6 | −3 | 0 | +3 | +6 | +9 |
|---|--:|--:|--:|--:|--:|--:|--:|
| pont/meccs | 0,25 | 0,51 | 0,90 | 1,37 | 1,86 | 2,31 | 2,64 |

A képernyő kimondja, hogy ez **várható érték**: egy konkrét idény ettől
három-négy helyet is ingadozhat, és a nyári igazolásaid még nincsenek benne.

## 4. A beváltás — `pyrAnchorAtKickoff`

A `startFirstSeason()` legelején fut, **még a `phase="season"` előtt**: a
mezőnyhez nyúlni csak szezonhatáron szabad, és ez az utolsó pillanat, ami még
annak számít.

```js
for(let i=0;i<40;i++){
  const err=levelGap()-want;
  if(Math.abs(err)<0.15)break;
  const step=Math.max(-4,Math.min(4,err));
  pyrShiftWorld({divs:P.divs},-step);     /* a −step a világot EMELI */
  …
  oppTargetRating=pyrLevel();}
```

**Miért iterálunk.** Az `oppMatchStrength` nem a puszta szint: az `oppBuffFor`
a szinttől **és** a rejtett meccs-bónuszodtól is függ, tehát a `levelGap` nem
lineáris. Egy lépésben nem lehet eltalálni; néhány kör viszont 0,15 alá viszi a
hibát. A lépést ±4-re vágjuk, hogy egy elszaladt mérés se lökje ki a világot
egyetlen körben.

**A saját keretedhez nem nyúlunk.** A pool-átvezetés kihagyja a draftoltakat,
pontosan úgy, ahogy a `pyrStart` és az `applyOppLevel` is teszi — a világ jön
hozzád, nem fordítva. Az átvezetés (mezőnyszint, horgony, piac, attribútumok,
ellenféltábla, növekedési ütem) a `pyrStart` láncából van másolva, mert ugyanaz
a művelet.

**A Run-plafon a TÉNYLEGES vállalást méri.** A beállítás után a `gap0`-t is
felülírjuk a mért résre — enélkül a plafon egy olyan vállalást díjazna, ami
soha nem valósult meg.

**Közös karrierben kimarad.** Ott a szintet a két menedzser alkuja adja
(`mpSeasonGate`), és azt nem írhatja felül egy egyoldalú újramérés.

**Egyszer fut.** Az `anchored` jelző a `S.pyr`-ben él; a következő szezonok
szintjét változatlanul a fel-/kiesés adja.

Ha a világ ténylegesen mozdult, egy naplósor kimondja, mennyit és miért — hogy
a felhasználó ne csendben kapjon más nehézséget, mint amit lát.

## 5. Ami nem változott

* a **részletes mód** nyers rés-csúszkája megmarad szakértői finomhangolásnak,
  csak már ③-as lépés: az a világ **első** felépítését állítja, a nehézség
  pedig azt, amit a kezdőrúgáskor beváltunk;
* a **dinamikus mód** auto szintkövetése érintetlen;
* a **Run-plafon képlete** (`pyrGapFactor`, `pyrRunCap`) változatlan — csak a
  bemenete lett igaz.

---

## 6. A hangolás — ugyanaz a vállalás, egy idénnyel később (3.9.38)

**A kérés.** „Minden szezon végén lehessen −10%-nyi Run szintért (tehát ha
éppen 90-en voltál, akkor leesel 81-re) hangolást kérni a következő szezonra
abban az esetben, ha nem jutottál feljebb az előző szezonban (azaz ha
beragadnál épp). A hangolás olyan szintre hozza az ellenfelet, mint amilyen a
kezdő beállítások szerint volt, tehát ha te úgy állítottad, hogy +2 legyél a
mezőnyhöz, akkor olyanra hozza (a meccs erőd és a csapaterőd számtani
közepéhez képest)."

Ez pontosan a 4. fejezet művelete, csak nem a kezdőrúgáskor, hanem egy
beragadt idény után — és nem ingyen.

### 6.1 A kapu: mikor jár egyáltalán

Négy feltétel, mind kötelező (`pyrRetuneOfferable`):

| feltétel | miért |
|---|---|
| piramis mód, nem auto szezon | az auto szezonban nincs döntési pont |
| van már lezárt idény | a napló utolsó sora nélkül nincs mihez mérni |
| **NEM jutottál feljebb** (`pyrWentUpLast`) | ez a beragadás mentőöve, nem általános könnyítés |
| a korrekció **lefelé** visz, legalább 0,5-tel | ha a rés amúgy is a vállalás fölött áll, a „hangolás" fölfelé tolna — az önsorsrontás volna, és a beragadásnak nem a mezőny az oka |

A negyedik feltétel a fontos: a hangolás **soha nem nehezít**. Ha jobb vagy,
mint amit vállaltál, és mégis beragadtál, akkor a probléma nem a mezőnyszint —
az ajánlat meg sem jelenik.

### 6.2 A mérce: miért a számtani közép a helyes szám

A mezőny a rejtett meccs-bónuszodból (morál, edző, taktika, aura, összhang)
**fixen a felét** kapja vissza — `OPP_BUFF_MEASURED = 0,5`. Tehát:

```
a te oldalad   meccs-erő = keret + h        keret-erő = keret
a mezőny       valódi ereje = szint + h/2
```

A két saját szám **számtani közepe** `keret + h/2`, és a különbség így
pontosan `keret − szint`: **a rejtett tag kiesik.** Ezért nem múlik a hangolás
a napi formán — pont ez volt a kérés magja.

Ez a szám nem új: a játék rés-mércéje, a `levelGap`, **már ez**.

```
levelGap = (keret + h) − szint − max(0,h)·OPP_BUFF_MEASURED
```

Pozitív `h`-nál ez betűre `(keret + h/2) − szint`. A `pyrRetuneMine()` tehát
nem talál ki új aritmetikát, hanem a `levelGap` saját oldalát emeli ki.

**Egy tag, amit az első nekifutás elvétett.** A `max(0, h)`: rossz morálnál
(`h < 0`) a mezőny **semmit** nem kap vissza, tehát ott nincs mit kiejteni, és
a helyes mérce a tiszta meccs-erő. Aki a közepet vinné oda is, az fél `h`-val
alálőné a korrekciót. A próba ezt külön méri, két morállal (20 és 95).

**Egy szándékos eltérés a `levelGap`-tól:** a mezőny oldalán a `d.mean` áll,
nem a `pyrLevel()`. A kettő ugyanaz a mennyiség, csak a `pyrLevel` **egészre
kerekít** — a hangolás pedig a világot folytonosan tolja, tehát a kerekített
mércével a korrekció félmagasan állna meg, és ezen egy iteráló hurok sem
segítene (a hiba a mércében van, nem a lépésben). A `d.mean` ugyanannak a
tizedjegyig vitt alakja, ezért itt **egyetlen lépés** pontosan visszaállítja a
vállalt rést — szemben a 4. fejezet iterációjával.

### 6.3 A cél: a VÁLLALÁS, nem a `gap0`

```js
gapWant  →  gapWantMp  →  gap0
```

Az első a nehézségválasztón vállalt rés (`pyrConfirmDiv` teszi el), a második
a közös karrier szobabeállítása, a harmadik a régi mentések tartaléka. A
`gap0` szándékosan az **utolsó** hely: az a *mért* kezdő rés, ami a
kezdőrúgáskor épp kijött — a hangolás viszont ahhoz visz vissza, amit
**választottál**.

### 6.4 A hatás

A világ **egésze** mozdul, mind a hat osztály együtt (`pyrShiftWorld`), plusz a
`spare` csapatok, amik a fel-/kiesés cseréjét adják — enélkül a lépcső
szétcsúszna, és a csere egy másik skáláról hozna vissza csapatot. Utána
ugyanaz a lánc fut, mint a horgony után: mezőnyszint, fejlődési ütem,
ellenféltábla, piac. **A kereted érintetlen** — a pool-átvezetés kihagyja a
draftoltakat.

**Amihez szándékosan nem nyúl: a `careerBaseRating`.** A piramisban a piac
eltolása (`marketPeakShift`) az `oppTargetRating − careerBaseRating`
különbségből él, vagyis a bázis a **karrier** indulószintje. Ha a hangolás
utánaállítaná, a piac egyetlen nyáron visszaesne a karrier eleji árakra. A
`pyrStart` és a horgony azért állítja, mert ott még nincs mit elveszíteni.

### 6.5 Az ár: szorzós, nem kivonás

```js
PYR_RETUNE_RUN_CUT = 0.10
pyrRetuneMult() = 0.9 ^ (hangolások száma)      →  90 → 81 → 72,9 → 65,6 …
```

Minden hangolás a **maradék** tizedét viszi, tehát a második-harmadik mentőöv
is fáj, de sosem visz nullára: a futás értéke csökken, nem semmisül meg.

**Nem a Run-plafon része, hanem a teljesítményé.** A plafon tisztán a
vállalásaidból jön (hol kezdtél, milyen tempón, mekkora réssel) — az a futás
**előtt** eldől. A hangolás menet közben hozott döntés, tehát a kész
pontszámot szorozza:

```js
total = perf × cap × pyrRetuneMult()
```

A Run-panel külön sorban mondja ki (`🎚️ Hangolás (2×) … ×0,81`), és a
szorzat-sorban is ott a tényező — a „miért ennyi a Run-om" kérdésre a
képernyőn kell hogy legyen válasz.

### 6.6 Hol jön a nyári sorban

```
szezonzárás → fel-/kiesés → (fordulat-felfedés) → HANGOLÁS → all-in osztályugrás → kihívások
```

A hangolás **az osztályugrás előtt** van: a kettő ellentétes irányú döntés
(lefelé hangolni vagy pénzért felfelé ugrani), és a „nem jutottam feljebb"
helyzetben az első kérdés a mentőöv. Utána jönnek a kihívások, tehát a
vállalásaid már a hangolt szinthez kalibrálódnak.

### 6.7 A próba — `tools/pyr-hangolas-proba.js`

14 állítás, valódi böngészőben. Amit külön érdemes kiemelni:

* **a vállalt rés áll vissza (+2), nem a tárolt `gap0` (−4)** — a fixtúra a
  kettőt szándékosan különbözőre állítja;
* **a rejtett bónusz kiesik**: két futás, morál 20 és 95 (`h = −1,5` és
  `h = +2,3`), a hangolás utáni valódi rés mindkettőnél a vállalt +2 (a
  `pyrLevel` egészre kerekít, ezért fél Rating a megengedett szórás);
* **a kereted érintetlen** — és ez fogott meg egy fixtúra-hibát: az első
  változat nem tette be a kezdő 11-et a `drafted`-be, így a piac-eltolás a
  saját keretedet is átskálázta. A valódi játékban minden leigazolt játékos
  bekerül; a próbának ezt utánoznia kell.
