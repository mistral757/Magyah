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
