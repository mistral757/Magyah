# Hangsúly-csúszkák

*(3.8.27. Érintett kód: `STYLE_DIALS` (7×5) · `dialStore` / `dialValue` /
`dialSet` / `dialCanSet` · `dialProCurve` / `dialConCurve` / `dialPct` /
`dialFactor` · `dialMatch` / `dialEach` / `dialMul` / `dialPP` ·
`dialSectionHtml` · és a húsz bekötési pont a motorban. A terv:
`docs/terv-stilus-szintek-es-hangsulyok.md`.)*

> **BEJELENTETT KÉRÉS:** „találjunk ki csapatstílusonként háromfajta csúszkát,
> amik a csapatstílus fejlődésével válnának egyre nagyobb hatásúvá. A csúszkák
> lényege: pro-contra hatású hangsúlyeltolásokra ad lehetőséget. […] A csúszka
> alap járaton mondjuk 2-3%-os eltolásokat tudna csinálni pozitív, és 5-7%
> negatív irányba, és ahogyan fejlődik, fokozatosan egyre nőne mindkét irány
> mértéke, de a negatívé egyre lassabban, majd pedig egy bizonyos szint után a
> negatív elkezdene csökkenni."
>
> **ÉS A TESZT-KÖRRE:** „legyenek úgy, hogy mind az 5 be van építve, és
> egyszerre 3-nál nyúlhatsz bele, 2-t 0-n kell hagyj."

---

## 1. Az alak: kétvégű csúszka

A kérés példája két **pólust** nevez meg („távoli bombák *vs.* ziccerig
játszott helyzetek"), a százalék-leírás viszont egy pro-t és egy con-t. A kettő
így áll meg egyben:

```
        ziccerig játszva  ◀────────●────────▶  távoli bombák
                        −100%     0     +100%
```

* **középen** semmi nem történik — ez az alapállapot;
* valamelyik vég felé húzva **annak a pólusnak** a haszna kapcsol be, és vele
  **együtt ugyanannak a pólusnak** az ára;
* a két vég **nem tükörkép**: külön haszna és külön ára van.

Lépésköz 10%, mint az osztályugrás csúszkájánál (`PYR_LEAP_STEP`).

## 2. A hatás nagysága

```
PRO(L) = 2,5 + 0,95 × (L−1)
CON(L) = −0,0634 × (L−1)² + 1,152 × (L−1) + 6
```

Mérve a valódi függvényekkel:

| szint | haszon | kár | arány |
|--:|--:|--:|--:|
| 1 | 2,5% | 6,0% | **0,42** |
| 5 | 6,3% | 9,6% | 0,66 |
| 10 | 11,0% | 11,2% | **0,98** |
| 11 | 12,0% | 11,2% | **1,07** |
| 15 | 15,8% | 9,7% | 1,63 |
| 20 | 20,6% | 5,0% | **4,11** |

Ez pontosan a kért ív, és ebből következik a rendszer lelke:

* **az 1. szinten a csúszka rossz üzlet** — 2,5% haszonért 6% árat fizetsz. A
  panel ezt ki is mondja (`⚠️ Ezen a szinten ez még rossz üzlet`). Ha mégis
  kihúzod, az szándékos áldozat egy konkrét meccsért, nem optimalizálás;
* a kár **egyre lassabban nő** (a másodfokú tag mínusz), csúcsa a **10-11.
  szint** környékén 11,2%;
* onnantól **csökken**, a 20. szinten 5,0% — miközben a haszon töretlenül nő.
  A **10-11. szint a fordulópont**: ott éri utol a haszon a kárt. Innen kezd
  igazán megérni a filozófiában mélyre menni.

### A csúszka-állás — a mértéktartás önálló stratégia

```
tényleges PRO = PRO(szint) × t
tényleges CON = CON(szint) × t^1,25
```

| kihúzás | a haszon aránya | a kár aránya |
|--:|--:|--:|
| 100% | 100% | 100% |
| 70% | 70% | **64%** |
| 50% | 50% | **42%** |
| 30% | 30% | **22%** |

A kár kitevője **szándékosan 1,25**. Enélkül a „félig kihúzom" mindig szigorúan
rosszabb volna, mint a „kihúzom vagy nem" — vagyis a csúszka tíz fokozat
álruhájában egy **kétállású kapcsoló** lenne.

## 3. A keret: öt beépül, háromhoz nyúlhatsz

Stílusonként **mind az öt** csúszka be van építve (a három javasolt és a két
tartalék is), és **egyszerre legfeljebb három** állhat nullától eltérően.
Mérve:

```
1. csúszka (lotav)      → beállítva · aktív: 1
2. csúszka (ritmus)     → beállítva · aktív: 2
3. csúszka (kockazat)   → beállítva · aktív: 3
4. csúszka (pontrugas)  → ELUTASÍTVA (3/3 tele) · aktív: 3
5. csúszka (egyvagysor) → ELUTASÍTVA (3/3 tele) · aktív: 3
a másodikat középre     → ok · aktív: 2
most a negyedik         → beállítva · aktív: 3
```

Egy már mozdított csúszkát mindig lehet állítani **és nullázni** — a kapu csak
a NEGYEDIK elindítását tiltja. A panel a szabályt kimondja, és a zárolt csúszka
`disabled`.

**Ez váltja ki az eredetileg tervezett 150%-os hangsúly-keretet.** A kettő
ugyanazt a célt szolgálja (a csúszka átcsoportosítás legyen, ne gyarapítás), és
két korlát egymás mellett feleslegesen bonyolult. Ha a mérés később azt
mutatja, hogy három teljesen kihúzott csúszka túl sok, a keret bármikor MELLÉ
tehető.

## 4. Mérés: mit csinál egy kihúzott csúszka?

A Bombázók **Lőtávolság** csúszkája teljesen kihúzva, a valódi súlyozó-magon
(`GOALW[poszt] × (Rating−58) × csúszka`), egy 4-4-2-es tizenegyen:

| szint | középpálya gólrészesedése | csatárok | eltolás |
|--:|--:|--:|--:|
| — (alap) | 49,0% | 39,3% | — |
| 1 | 50,8% | 37,4% | +1,8 pp |
| 5 | 52,5% | 35,8% | +3,4 pp |
| 10 | 53,9% | 34,6% | +4,9 pp |
| 15 | 54,6% | 34,2% | +5,6 pp |
| 20 | 54,7% | 34,5% | +5,6 pp |

A másik pólus felé (ziccerig játszva): a csatárok részesedése 39,3%-ról a 10.
szinten **44,2%-ra**, a 20-on 44,9%-ra megy.

**Az eltolás a 15. szint körül telítődik**, és ez nem hiba, hanem a görbék
következménye: fölfelé a haszon tovább nő, de a KÁR csökken, tehát a csatár
súlya már nem esik tovább — a *relatív* megoszlás megáll, miközben az abszolút
gólesély tovább javul. Egy teljesen kihúzott csúszka így nagyjából **öt-hat
százalékpontnyi** eltolást ér a góleloszlásban: érezhető, de nem borítja fel a
játékot.

## 5. Húsz csatorna, húsz bekötési pont

Minden hatás egyetlen leíróból jön (`{ch, m, d, szűrők}`), és minden csatorna
**egyetlen** ponton kapaszkodik a motorba. Mind hibatűrő: stílus nélkül, szint
nélkül vagy középen álló csúszkánál a semleges értéket adja, tehát a hívási
helyeken nem kell feltételt írni — pontosan úgy, ahogy ma a `roleGoalMult`.

| csatorna | hol kapaszkodik | mit mozdít |
|---|---|---|
| `goalw` | a gólszerző súlyozása | egy játékos gólsúlya (poszt, kategória, kor, képesség, „ki" szerint) |
| `assistw` | a gólpassz súlyozása | ugyanaz a gólpasszra |
| `own` | `lf` szorzója | saját gólvárhatóság (perc-, állás- és emberhátrány-ablakkal) |
| `opp` | `la` szorzója | az ellenfél gólvárhatósága |
| `chance` | `oppChance` | a helyzet-bontás (bravúr / blokk / szöglet / gólvonal) |
| `card` | `_pRed` | a piros lap esélye |
| `inj` | a sérülés-dobás | a sérülés esélye |
| `setpiece` | `SETPIECE_GOAL_SHARE` | a pontrúgásból eső gólok aránya |
| `counter` | a kontra-ablak | hány percig számít a gól kontrának |
| `role` | `roleVal` | EGY szerep ereje (id = a szerep kulcsa) |
| `redmatch` | `SIM.REDMATCH` | az emberhátrány-büntetés enyhítése |
| `bond` | `bondMatchTick` | az összhang épülésének üteme |
| `dev` | `devTempo` | a keret fejlődési üteme |
| `form` | a forma-frissítés | az elmozdulás mértéke (nem a cél) |
| `morale` | `moraleToOvr` | a morál MECCS-HATÁSA (nem maga a morál) |
| `mstat` | `mstatRate` | az alap fölötti rész — a kiemelkedés mértéke |
| `fame` | `fameAdd` | hírességpont, mind a három forrásra |
| `wage` | `wageStardomOf` | a sztár bére |
| `tacticfit` | `tacticFit` | a taktika-illeszkedés, SZÁZALÉKPONTBAN |
| `bus` | `busOwnMult` / `busOppMult` | a busz ereje (az 1-től való eltérésre) |

### Amit szándékosan NEM írnak át

* **a gólok SZÁMÁT** csak az `own` / `opp` csatornán érintik, és ott is a `SIM`
  padlója (0,15) és plafonja (4,5) fog. A helyzet-bontás és a pontrúgás-arány
  **súlyozási** kérdés: ott csak az változik, KI szerzi;
* az `mstat` az **alap fölötti** részt mozdítja, nem magát a számot — egy 3,5-ös
  (átlagos) meccs attól nem lesz jobb, hogy kihúztad a csúszkát. Így a
  szezonkártya-küszöbök és a skála értelme a helyén marad;
* a `morale` a morál **hatását** mozdítja, nem a morált: a panelen ugyanaz a
  szám áll;
* a `form` a **mozgás** mértékét szabja, a célt nem;
* a `role` az 1-től való **eltérésre** megy, mint az attribútum-szorzó — egy
  0,93-as csökkentő szorzót „erősíteni" azt jelenti, hogy még lejjebb visz;
* a `redmatch` fél tételnél nem enged lejjebb: az emberhátrány maradjon
  emberhátrány.

## 6. Két meccs-állapot

Két hatás nem fejezhető ki szűrővel:

* **`_dialInjured`** — a Panzer bajtársiassága az egyetlen csúszka-hatás, ami
  egy meccsen belüli ESEMÉNYRE kapcsol be (az első saját sérülésre), és
  onnantól a lefújásig él;
* **`_dialWhoMemo`** — a „ki a legjobb / a leggyengébb" rangsor. A mérkőzés
  alatt nem mozdul, ezért a kezdőrúgás (`dialMatchReset`) frissíti, és a
  szint-memó is ott dől el. A `dialMul` a gólszerző-sorsolás egyik
  legforgalmasabb hívása lett — memó nélkül a teljes képességfát és
  mérföldkő-listát járná végig gólonként, játékosonként.

## 7. A harmincöt csúszka

A teljes lista pólusonkénti haszonnal, árral és kapaszkodási ponttal a
tervdokumentum 5. szakaszában áll. A shippelt készlet néhány ponton eltér a
tervtől — ott, ahol egy tartalék-csúszka olyan rendszerre mutatott, aminek
nincs egyetlen tiszta kapaszkodási pontja:

| stílus | terv | shippelt | miért |
|---|---|---|---|
| ☯️ Harmónia | „Edzés-hangsúly" (fő ↔ minden tengely) | **Edzésterhelés** (kímélve ↔ keményen) | a per-TENGELY fejlődésnek nincs egyetlen közös torka; a `dev` csatorna a keret ütemén ül |
| ☯️ Harmónia | „Öltöző ↔ verseny" | ugyanaz, `mstat`-tal kiegészítve | a „verseny a helyekért" a meccsértékelésen is látszik |
| ⭐ Sztár | „Utódnevelés" (fiatal ↔ sztár fejlődése) | ugyanaz, `dev` + `mstat` + `fame` | a fejlődés csatornája keret-szintű, a sztár oldala a `who:"star"` szűrőn megy |
| 🛡️ Panzer | „Kőkemény iskola" (akadémia keménység ↔ passz) | **Technika ↔ Keménység** (`dev` ↔ `inj`+`morale`) | az akadémia attribútum-hangsúlyának nincs csúszkázható pontja |
| 🌀 Tiki-Taka | „Passzkémia-fókusz" (passzkémia ↔ összhang) | ugyanaz, `assistw` + `tacticfit` ↔ `bond` | a passzkémia-tempó a felajánlás-esélyen ül, ami jutalom-sorhoz kötött |

Minden más a terv szerint. A `res:true` jelölés a panelen „tartalék" címkeként
látszik — a teszt-körben viszont ugyanúgy használható, mint a másik három.
