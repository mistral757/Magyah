# Hagyományos karrier — a dinamikus ligapiramis

*(Tervdokumentum. Állapot: **P5 kész — a mód elérhető és játszható.** Világ,
ligarendszer, fejlődés, súlyozott draft, kupák, Run-szint, riválisok, belépő. Lásd a 11.3 fázistáblát. A mérőeszköz,
amivel a számai születtek: `tools/pyramid-sim.js`. A hozzá tartozó
beállítás-átalakítás: `karrier-beallitasok-terv.md`; a mai kapcsolók
hibalistája: `karrier-beallitasok-audit.md`.)*

---

## 0. Egy mondatban

Hat osztályból álló ligapiramis, valós klubokkal, **fel- és kieséssel**, ahol
**az ellenfelek is fejlődnek** — a játékos három kapcsolót állít be az elején
(honnan indul, milyen osztályban, milyen gyorsan nőnek az ellenfelek), és
onnantól semmit nem változtathat: nincs nehézségi csúszka, nincs auto
szintkövetés, nincs Infinity-vásárlás. A tető magától nyílik.

**A cél:** olyan karrier, ami megizzaszt. Ahol egy szezon el is veszhet, ahol
egy alacsonyabb ligában lehet évekig ragadni, és ahol a BL-döntőben nem az a
csapat vár, akivel három éve az NB II-ben szenvedtél.

---

## 1. Mi a különbség a mai („dinamikus") módhoz képest

| | dinamikus (mai) | hagyományos (új) |
|---|---|---|
| a világ | **egy** 16 csapatos mezőny | **hat** 15+1 csapatos osztály |
| a nehézség | csúszka + auto szintkövetés, **menet közben állítható** | az induló osztály választása, **véglegesen** |
| az ellenfél | minden szezonban **újrasorsolódik** a célszinthez | **ugyanazok a klubok**, saját fejlődéssel |
| ha jó vagy | a mezőny utánad lép | **feljutsz** |
| ha rossz vagy | semmi | **kiesel** |
| a kupa | a nehézségi sávból jár (`CUP_TIERS`) | a **bajnoki helyezésből**, ligánként |
| a plafon | 100, utána fizetős Infinity | nincs — a piramis együtt nő a végtelenbe |
| a rivális | rangadó-lista | a **hozzád Ratingben legközelebbi** csapatok |

---

## 2. A kapcsolók — és a sorrendjük (v3.4.18)

A beállító képernyőn **egyetlen** piramis-kapcsoló maradt:

```
① Az ellenfelek      ━━━●━━━━━━━━    😴 / 🚶 / 🏃 / 🔥
   fejlődése
```

A másik kettő **átköltözött a belépő útvonalra**, mert egyik sem eldönthető a
másik ismerete nélkül:

```
scScout  →  scClubPick   (② melyik klub kerete)
         →  scPyrDiv     (③ MELYIK LIGÁBAN kezdesz +
                          ④ MILYEN ERŐS legyél a mezőnyhöz képest)
         →  a karrier
```

A ③ és a ④ **egy döntés két fele**, és a v3.5.19 óta pontosan ebben a két
kérdésben áll a képernyőn: fent a hat liga (ez a futás hossza és a Run-plafon),
lent EGY csúszka a rajt nehézségére (mennyivel légy erősebb vagy gyengébb a
mezőnynél, nyers csapaterőben). A világ felskálázása ebből SZÁMÍTÓDIK — nincs
külön csúszkája. Lásd 8.6.

**A karrier fajtájának választója az 1. oldalra költözött (v3.5.08)** — a
felállás alá, a kezdésmód-választó fölé. Ez a beállítás első és legfontosabb
elágazása: a 3. oldal fél vezérlőkészlete és a 2. oldal Rating-alapja is tőle
függ. A régi helyén (a „kihívás" oldal tetején) a felhasználó már két oldalnyi
olyan kapcsolót állított be, amiből hagyományos módban a fele értelmét veszti.
A két választó **egy döntéscsoport**: a hagyományos mód kötelezően kész klub,
ezért ott a kezdésmód-választó eltűnik, és a helyén egy rövid magyarázó sor áll.

**Nincs draft.** A hagyományos módban a kezdés kötelezően kész klub — a
kezdésmód-választó el is tűnik a beállításról (`updatePyrSetupVisibility`
odaállítja a `careerStart`-ot). Az indoklás a **4.2 lezárása**.

### 2.2 A klubválasztó betekintője (v3.5.10) — MINDEN MÓDBAN

A klubválasztás eddig **egy koppintás** volt, visszaút nélkül: a listából a
nevet, az idényt és a top-11 átlagot lehetett látni, a döntés viszont a teljes
karrierre szólt. Az átlag nem mondja meg, MILYEN keretet kapsz — egy 85-ös,
beérett gárda és egy 85-ös, feltörő csapat két külön karrier.

Mostantól az első koppintás **lenyit**, és csak a megerősítő gomb indít. A
doboz három dolgot mond:

* **fejléc** — keretméret, top-11 átlag, és a keret **legerősebb** embere (a
  lista potenciál szerint rendez, tehát a 91-es sztár simán lemaradhat róla);
* **a hét legnagyobb potenciálú ember** — poszt · név · kor · Rating · a
  csúcsáig hátralévő fejlődés · potenciál. A rangsor a `playerPotential`-ből
  jön, ugyanabból a számból, amit a skill-kiosztás és az árazás is használ;
* **egy mondatos ítélet** a keret legnagyobb potenciáljáról.

**A számok a szezon-alapról szólnak, nem a pool nyers bejegyzéséről.** A
`seasonBasisFor` tiszta függvény (nevesített, seedelt folyam a
név+klub+idény hármasra), tehát ugyanazt adja a betekintőben, mint majd a
leigazolásnál — a doboz nem ígérhet mást, mint amit kapsz, és nem fogyaszt
véletlent a fő folyamból.

**A sávok mérve.** A 172 választható klub-szezon top-7-eseit végigszámolva
(1203 érték): medián **7**, p75 11, p90 15, p97 **29**, maximum **78**. Egy
beérett szuperklub top-embere 5-10 körül áll (Barcelona 1993/94: 13), egy
feltörő keretben viszont 60-80 is akad — Sporting CP 2017/18: **78**, Arsenal
2003/04: 76, Barcelona 2008/09: 72. A színküszöbök ehhez igazodnak
(≥30 zöld · ≥15 arany · ≥8 alap · alatta halvány).

**Mód-független.** A dinamikus, a hagyományos és a közös karrier is ugyanezen
az úton megy; a gomb felirata mondja meg, mi következik („Ezzel a klubbal
indulok →" vagy „Tovább az osztályválasztóhoz →"). A hagyományos módban a
lábjegyzet külön kimondja, hogy a keret még egy EGYSÉGES eltolást kap az
osztály skálájára — a sorrend attól nem változik.

### 2.3 „Amit látsz, azt kapod" — a pool-eltolás kiírva (v3.5.11)

**BEJELENTETT TÜNET:** a klubválasztó 76-os átlagot hirdetett, a pályán viszont
68-as csapaterő fogadott. Három külön dolog keveredett össze; a mérés
(RB Salzburg 2019/20, D6) mindhármat szétválasztotta.

**1. A DINAMIKUS MÓDBAN NINCS ELTÉRÉS.** Mind a 15 játékos pontosan a
kártya-Ratinggel érkezik (Δ = 0). A `seasonBasisFor` `ovr`-je a kártya értéke,
és a TSI-sorsolás nem nyúl hozzá — a kor is a valós születési évből jön, csak
ott sorsol, ahol nincs adat. Ez a viselkedés a kívánt, és már megvolt.

**2. A PIRAMISBAN EGY EGYSÉGES ELTOLÁS FUT** (`pyrScaleClubPlayer` →
`applyMarketShift`), és mérve tényleg egységes: D6-ban mind a 15 emberre
pontosan **−6** (off = −5,4). Ez nem hiba, hanem a mód gerince: a piramis
Ratingjei normalizáltak, a játékos-adatbázis nyers, és eltolás nélkül egy
hatodosztályú klubbal **+5,6-tal a saját mezőnyöd FÖLÖTT** kezdenél (lásd 2.1).
A rés nem változik tőle: a mezőny közepe ugyanennyivel mozdul.

**3. A PÁLYÁN POSZT-EFFEKTÍV SZÁM LÁTSZIK** (`playerStrength`), nem a játékos
saját Ratingje. Ez adja a látszólagos „egyenetlenséget": ugyanabban a mérésben
Haaland (középcsatár a helyén) −6-ot, Hwang Hee-chan (csatár BALSZÉLEN) **−10**-et
mutat. A különbség a poszt-illeszkedés, nem TSI-lutri.

**AZ ELSŐ NEKIFUTÁS (v3.5.11) CSAK KIÍRTA az eltolást a döntési képernyőn.
Megbukott:** a felhasználó továbbra is 84-es Haalandot választott és 78-asat
kapott. Egy magyarázó mondat nem tesz igazzá egy hamis számot.

### 2.3b A VILÁG JÖN A KERETHEZ — origó-csere (v3.5.12)

**A döntés:** *„azt kapjuk, ami az adatbázisban van, csak hozzátársítunk egy
TSI-t random"* — és a plusz-Rating problémára ott a **felskálázó**.

Nem a 2. pont eltolását szüntetjük meg (arra szükség van), hanem az
**előjelét fordítjuk meg**: ugyanazt a különbséget a VILÁGRA alkalmazzuk.
Minden osztály minden csapata `−off`-fal mozdul (`pyrShiftWorld`), a kereted
és a pool pedig érintetlen marad (`S.pyr.off = 0`).

```
régi:  (nyers + off) − pyrKözép        = nyers − nyersKözép − up
új:     nyers        − (pyrKözép − off) = nyers − nyersKözép − up
```

**A rés bitre ugyanaz.** Mérve mind a 18 kombinációra (6 osztály × 3
felskálázási fokozat, RB Salzburg 2019/20): a régi és az új modell rése
minden sorban azonos (−9,0 · −6,2 · −4,8 · −3,4 · −2,5 · −1,5 felskálázás
nélkül; −16,5 … −9,0 a 2. fokozaton). A nehézség, a fel- és kiesés, a
felskálázó és a Run-plafon tehát **semmit nem változik** — csak a számok
origója költözik oda, ahol a felhasználó él.

**Mérve, ami megváltozott a képernyőn** (Salzburg, D6): a keret mind a 15
játékosa **pontosan a kártya-Ratinggel** érkezik (Haaland 84, Szoboszlai 77,
Hee-chan 76 — Δ = 0), a mezőnyszint 71,6 helyett **77**, az osztályok közepe
D1 90,9 · D2 88,4 · D3 85,7 · D4 82,2 · D5 79,5 · D6 77. A kereted és a
mezőny így **közvetlenül összevethető**, magyarázat nélkül.

**A pool és a piac is a nyers skálán marad** (`pyrPoolOffset() = 0`), tehát a
kereted és az igazolható játékosok ugyanazt a nyelvet beszélik — korábban a
kereted el volt tolva, a piac árazása (TSI-alapú) viszont nem.

**AMIT KÜLÖN SEMLEGESÍTENI KELLETT: a büdzsé.** A `seasonBudgetParts` fix
60-90-es ablakra hangolt, NÉGYZETES görbével árazik (`(teamR−60)/30`), tehát a
puszta átcímkézés a hatodosztálynak **+42%** keretet adott volna (2835 → 4040)
— olyan változás, amit senki nem kért. A `pyrWorldShift()` visszaadja az
eltolást a büdzsé-számításnak, és ezzel a keret **bitre a 3.5.12 előtti**
(mérve: 2835 = 2835). A többi gazdasági ág érintetlen: a szurkolótábor tárolt
számláló, az árazás pedig TSI- és kor-alapú, amiket az eltolás sosem mozgatott.

**RÉGI MENTÉS: érintetlen.** A világ a mentésben él a maga eltolásával és a
nem nulla `S.pyr.off`-fal; a `pyrScaleClubPlayer` ott változatlanul fut. Új
karrierben `off = 0`, tehát ugyanaz a kód nem csinál semmit. Nincs migráció.

**AMI MEGMARADT ELTÉRÉSNEK:** a pályán továbbra is **poszt-effektív** szám
látszik (3. pont) — ez viszont a dinamikus módban is így van, és a betekintő
lábjegyzete kimondja.

**A klub ELŐBB jön, mint az osztály.** Az osztály önmagában nem nehézség: a
negyedosztály egy 84-es kerettel sétagalopp, egy 73-assal évekig tartó
kapaszkodás. Csak a keret ismeretében lehet értelmes ajánlást adni, és csak
akkor lehet a Run-plafont őszintén kiírni. Az osztályválasztó ezért nem
osztályokat sorol, hanem **réseket** (`pyrDivOptions`).

**A rés (gap).** `gap = a klubod top-11 nyers ereje − a célosztály nyers közepe`
(a belépéskor kieső 16. csapat nélkül). A pool-eltolás mindkét oldalt ugyanúgy
mozgatja, tehát a rés a **nyers** skálán is igaz — ez az egyetlen szám, ami
megmondja, mekkora falat vállaltál. Címkék (a **4.** mérései szerint):

| rés | címke |
|---|---|
| ≥ +6 | sétagalopp |
| +2,5 … +6 | kényelmes |
| −1,5 … +2,5 | **egyenrangú** |
| −4 … −1,5 | kemény menet |
| −7 … −4 | brutális |
| < −7 | fal — évekig a kiesés ellen |

**Az ajánlás** a fokozathoz tartozó cél-réshez legközelebbi osztály
(`PYR_REC_GAP`): 😴 −2,5 · 🚶 −1,8 · 🏃 −1,0 · 🔥 0,0. Alvó mezőnynél mélyebbről
is felérsz, kegyetlennél már az egyenrangú kezdés is kemény menet. Döntetlennél
a **mélyebb** osztály nyer — a mód ígérete a hegymászás. **Ajánlás, nem
korlátozás:** mind a hat osztály választható marad.

Ezen felül a játékos **saját** fejlődési tempója a mai négy fokozat marad
(Alap / Komótos / Csiga / Gleccser) — de lásd **5.4**: ez a hagyományos módban
**nem független** az ellenfél tempójától.

Minden más rögzül: nincs Rating-alap-választás (kötelezően **szezon-alap**, mert
a kész klub kerete a saját idényének értékeléseivel érkezik), nincs auto
szintkövetés (nincs mit követni), nincs Infinity-kapu.

### 2.1 A két skála összecsúszása — MÉRT HIBA, javítva (v3.4.18)

A klub-elsős sorrend hozta felszínre. A piramis világa **normalizált**
Ratingeken áll (a valós, sűrűn tömött 69–88-as mezőnyt hat tiszta sávba húzzuk
szét), a karrier-pool ezért egy eltolást kap (`pyrPoolOffset`). A kész klub
kerete viszont **nem a poolból** jön: a szezon-alap a klub-szezon saját, nyers
értékeléseit írja be (`commitSeasonBasis`).

Mérve: a hatodosztály nyers közepe **77,0**, normalizálva **71,4** — vagyis egy
pontosan átlagos hatodosztályú klubbal **+5,6-tal a saját mezőnyöd fölött**
kezdtél volna. A **4.** táblázata szerint ez azonnali, biztos feljutás: a mód
egész ígérete elveszett volna.

Javítás: `pyrScaleClubPlayer` — a kész klub kerete ugyanazt az eltolást kapja,
amit a pool. Mérve a javítás után: kezdő XI **70,5**, osztályközép **71,3**,
azaz a hirdetett −1,4-es rés valóban teljesül.

---

## 3. A világ: hat osztály

### 3.1 Amit az adatbázis TÉNYLEG tud — mért adat

`node tools/pyramid-sim.js bands`:

```
klub-szezon: 200 · egyedi klub: 115 · sáv: 71,1 … 88,0

csapat/oszt |  teljes sáv  | D1        | D2        | D3        | D4        | D5        | D6
         16 | 77,5…88,0    | 85,1-88,0 | 82,7-85,0 | 80,7-82,5 | 79,9-80,6 | 78,4-79,5 | 77,5-78,3
         15 | 77,8…88,0    | 85,5-88,0 | 82,7-85,1 | 81,3-82,7 | 80,0-81,2 | 78,7-80,0 | 77,8-78,6
         12 | 78,9…88,0    | 85,8-88,0 | 83,6-85,8 | 82,5-83,5 | 80,7-82,1 | 80,0-80,6 | 78,9-80,0
```

**A tervezett 71–91-es piramis nyers Ratingekből NEM építhető meg.** A 90
legerősebb egyedi klub mindössze **11,3 Rating-pontot** fog át (76,7 … 88,0),
tehát két szomszédos osztály közé csak ~1,5–2 pont jut — nem 2-pontos lépcső
8 pont széles sávokkal, ahogy a terv szólt, hanem 1,5-es lépcső 2 pont
széles sávokkal. Ráadásul **88 fölött egyetlen csapat sincs**: a legerősebb a
Barcelona 2010/11 (88,0), és mindössze két klub éri el a 87-et.

Három út vezet ki ebből:

**(A) A RANG DÖNT, A GEOMETRIA TERVEZETT — ez lett megvalósítva.**
*(Az eredetileg javasolt konstans sávnyújtás — `88 − (88−valós)×1,7` — MÉRVE
MEGBUKOTT, lásd 3.3.)* Két dolgot választunk szét:

* **ki hová kerül** — teljes egészében a valós erő dönti: a klubok valós
  Rating szerinti rangsorban állnak, az első 16 az élvonal, és így tovább;
* **mekkora a különbség** — ezt tervezzük, mert ezen múlik a játszhatóság:

```
ovr = 86 − (osztály−1)×3,0 + (helyzet − 0,5)×4,0
```

ahol a `helyzet` a klub 0…1 közti helye a saját osztálya **nyers**
Rating-tartományában — tehát az osztályon belüli sorrend és a relatív
távolságok is a valóságból jönnek, csak a nagyságrend normalizálódik.

**(B) Nyers Ratingek, lapos piramis.** Semmit nem skálázunk. A piramis
77,5–88,0 közt fekszik, osztályonként ~1,7 lépcsővel. Immerzió tökéletes,
de a **feljutás alig érződik** (−1,7 gap ≈ 12. hely, tehát bennmaradó
szezon), és a piramis alja nem „megyei", hanem „erős másodosztály".

**(C) Az adatbázis bővítése lefelé.** ~40 további, tényleg gyenge valós keret
(alsóbb ligás magyar, kelet-európai, skandináv klubok) 65–78 közt. Ez a
legtöbb munka, de az egyetlen út, ami skálázás nélkül adja a teljes ívet.
Az (A) és a (C) nem zárja ki egymást: bővítés után a `k` csökkenthető.

### 3.2 A megvalósult alak — mért, nem tervezett

`node tools/pyramid-sim.js world seed=1` (a generátor az index.html
`PYR-BLOKK`-jából, tehát ez betűre a játék kódja):

| oszt | név | sáv | közép | lépcső | szórás |
|---|---|---|---|---|---|
| D1 | Biszem-baszom premier líg | 84,0 – 88,0 | 86,0 | — | 1,35 |
| D2 | Biszem-baszom másodosztály | 81,0 – 85,0 | 82,7 | −3,3 | 1,31 |
| D3 | NB I | 78,0 – 82,0 | 80,0 | −2,7 | 1,17 |
| D4 | NB II | 75,0 – 79,0 | 76,8 | −3,2 | 1,27 |
| D5 | NB III | 72,0 – 76,0 | 73,9 | −2,9 | 1,42 |
| D6 | mennyei megyei | 69,0 – 73,0 | 71,4 | −2,5 | 1,14 |

Minden lépcső a **≤3,5**-ös korlát alatt, minden szórás a **≤2,5** alatt (4.),
a piramis 69-től 88-ig ér — lényegében a terv eredeti 71–91-es íve. A sávok
1 ponttal átfednek: **a másodosztály bajnoka erősebb, mint az élvonal
sereghajtója**, ahogy a valóságban is.

96 klub kell, 115 egyedi klub van (válogatottak nélkül 102) — **elég, de a
tartalék vékony: 6 klub.** Az adatbázis bővítése ezért továbbra is hasznos
volna, még ha már nem is kötelező.

Böngészőben ellenőrizve: 6×16 csapat, **nulla névütközés és nulla
klubütközés**, és a generálás determinisztikus a világ-seedből (`rngFor`) —
ugyanaz a karrier újratöltve bitre ugyanazt a piramist kapja. Két különböző
seed viszont érdemben más világot ad: az egyikben a Barcelona 2008/09 és a
Real Madrid 2025/26 van az élvonalban, a másikban a Barcelona 2014/15 és a
Real Madrid 1959/60 — a klubok azonossága stabil, az évadok és a sorrend nem.

### 3.3 Miért bukott meg a konstans sávnyújtás — mért adat

A valós Rating-eloszlás **nem egyenletes**: sűrű a 76–82-es sávban, ritka a
tetején. Ha egyenlő *darabszámú* szeletekre vágjuk (16 csapat/osztály), a felső
osztály széles nyers sávot fog át, az alsók szinte semmit. A ×1,7-es konstans
szorzó ezt az egyenetlenséget nem javítja, hanem **felnagyítja**:

| oszt | közép | lépcső | szórás |
|---|---|---|---|
| D1 | 82,6 | — | 2,36 |
| D2 | 76,7 | **−5,9** | 1,13 |
| D3 | 74,3 | −2,4 | **0,59** |
| D4 | 72,3 | −2,0 | **0,59** |
| D5 | 70,9 | −1,4 | **0,39** |
| D6 | 69,1 | −1,8 | 0,80 |

A D1→D2 zuhanás játszhatatlan (a korlát 3,5), az alsó négy osztály viszont
egyetlen, szétválaszthatatlan masszává olvad, ahol minden csapat ugyanolyan
erős. **A szorzó hangolása nem segít**: bármelyik értékkel az egyik vég
elromlik, mert a baj az eloszlásban van, nem a skálában. Ez indokolja a
rang-alapú elhelyezést.

---

## 4. A KRITIKUS KORLÁT: a játszható ablak ±4 Rating

`node tools/pyramid-sim.js gaps` — a motor SAJÁT konstansaival
(λ = 1,3·e^(0,09·d), hazai/idegen előny, 16 csapat, 400 szezon/sor):

```
 gap | átl.hely |  pont | bajnok% | top2(feljut)% | utolsó2(kiesik)%
-----+----------+-------+---------+---------------+-----------------
 -10 |    16,00 |   6,0 |     0,0 |           0,0 |            100,0
  -8 |    16,00 |   9,7 |     0,0 |           0,0 |            100,0
  -6 |    15,98 |  15,5 |     0,0 |           0,0 |            100,0
  -4 |    15,66 |  23,5 |     0,0 |           0,0 |             93,3
  -2 |    13,25 |  32,1 |     0,0 |           0,3 |             48,3
   0 |     8,30 |  41,3 |     5,5 |          13,5 |             10,0
  +2 |     3,42 |  51,1 |    37,3 |          52,5 |              0,0
  +4 |     1,35 |  60,0 |    79,5 |          92,0 |              0,0
  +6 |     1,04 |  68,8 |    98,5 |          99,3 |              0,0
  +8 |     1,00 |  75,7 |   100,0 |         100,0 |              0,0
```

**Ez válaszol a terv legfontosabb kérdésére.** *„Mi lesz, ha 3 szezon után egy
+15 Ratinggel erősebb táblán találjuk magunkat?"* — **utolsó hely, ~3 pont, a
30 meccsből 0 győzelem, 100% kiesés.** Nem nehéz: játszhatatlan. A motor
gólgörbéje exponenciális, tehát a −6 alatti tartomány nem „küzdelmes", hanem
matematikailag lezárt.

Ebből három **kemény tervezési korlát** következik:

1. **Az osztályok középértéke közti lépcső ≤ 3,5.** 3,3-nál egy frissen
   feljutott csapat −3,3-mal indul: ~15. hely, ~75% kiesés — kemény, de nem
   reménytelen (és épp ezért van értelme a fel-le ingázásnak).
2. **Az osztályon belüli szórás ≤ 2,5.** Nagyobbnál az osztály alja már az
   osztály teteje ellen is esélytelen, és a tabella két külön bajnoksággá esik
   szét. **A tervezett 8 pont széles sávok ezért nem járhatók** — egy 8-as
   sávban a legalsó csapat a legfelső ellen −8-on áll, azaz 0% esély.
3. **A nettó éves mászás nem lehet 3-nál nagyobb**, különben minden feljutás
   után azonnal visszaáll a fölény, és a mód visszazuhan a mai „mindig nyersz"
   élménybe.

### 4.1 A DRAFT-PARADOXON — a második szerkezeti akadály

Egy **draftolt tizenegy mindig jóval erősebb, mint azok a klubok, amikből
draftoltad.** A draft ugyanis minden megpörgetett keretből a *legjobb* embert
emeli ki, a klub tábla-Ratingje viszont a saját **top-11 átlaga**. A kettő közt
strukturális rés van. Mérve, a `k=1,7`-es nyújtott skálán, ha a draft-pool
kizárólag a saját osztályod klubjaira szűkül:

| osztály | osztály-középérték | a draftból kihozható legjobb 11 | **rés** |
|---|---|---|---|
| D1 | 85,0 | 97,0 | **+12,0** |
| D2 | 80,7 | 92,3 | **+11,6** |
| D3 | 77,4 | 90,2 | **+12,8** |
| D4 | 74,9 | 88,0 | **+13,1** |
| D5 | 72,6 | 83,1 | **+10,5** |
| D6 | 70,8 | 79,7 | **+8,9** |

Vagyis egy hatodosztályból induló draftos játékos a **saját osztálya klubjaiból
összerakva is +9-en áll** — ami a 4. pont táblázata szerint 98,5% bajnoki
esély, azaz azonnali feljutás, függetlenül attól, milyen fokozatra állítottad
az ellenfelek fejlődését. Az egész 3. kapcsoló hatástalanná válna.

**Ez nem az új mód hibája — a mai játékban is így van.** A küldött runok
kezdő tizenegye kivétel nélkül ~86 volt, akármilyen mezőnyszintet választott a
játékos (80 és 87 között); ezért létezik egyáltalán a „nehézség-belövés"
(`runAimScore`) Run-sor: azt pontozza, mennyire találtad el a mezőnyt a
draftodhoz. A mai módban ez a *játékos döntése*; a piramisban viszont a
mezőnyt nem te állítod, tehát a résnek **strukturálisan** el kell tűnnie.

### 4.2 A MEGOLDÁS: súlyozott draft + klubeltolás — mérve

*(A megoldás a felhasználó javaslata: ne a pool erejét nyomjuk le, hanem a
PÖRGETÉS ESÉLYÉT toljuk el az alsóbb osztályok felé, hogy a felső osztályok
klubjai csak kis eséllyel nyíljanak ki. Így megmarad a draft izgalma.
Mérve: `node tools/pyramid-sim.js draft`.)*

**A súlyprofil egyetlen számból.** Az indulási osztálytól mért távolsággal
mértani ütemben csökken a pörgetési esély: `w[d] = q^|d − indulás|`.

**Két összetevő kell, nem egy.** A súlyozás megmondja, MELYIK klubok
nyílnak ki; a **klubeltolás** azt, hogy a bennük lévő játékos milyen erős.
Az utóbbi a már meglévő `applyMarketShift` mintája: a játékos annyival
gyengébb, amennyivel a klubja is (piramis-Rating − nyers Rating).

D6-ból indulva, 200 draft / sor, csak klubcsapatok:

| q | esély a saját osztályra | kezdő XI nyers | klubeltolt | **rés a saját osztályhoz** |
|---|---|---|---|---|
| 1,0 *(egyenletes)* | 17% | 83,4 | 81,9 | **+10,5** |
| 0,5 | 51% | 80,7 | 76,6 | +5,2 |
| 0,25 | 75% | 80,0 | 75,1 | +3,7 |
| **0,15** | **85%** | **79,8** | **74,5** | **+3,1** |
| 0,08 | 92% | 79,6 | 74,2 | +2,8 |
| 0 *(csak a saját)* | 100% | 79,5 | 74,1 | +2,7 |

**Három dolog olvasható ki:**

1. **A súlyozás a nagyját megoldja** — +10,5-ről +2,7-re visz. A `q=0,15`
   mellett a pörgetések 85%-a a saját osztályból jön, de marad ~2% esély egy
   élvonalbeli klubra: a „hátha most jön egy nagy név" élmény megmarad.
2. **A klubeltolás nélkül nem működik.** Eltolás nélkül a kezdő XI 79,5–83,4
   — vagyis +8…+12 a D6 fölött, akármilyen meredek a súlyozás. A két
   összetevő együtt jár.
3. **Marad egy ~+2,7-es maradék**, ami *nem tüntethető el* súlyozással: ez a
   draft szerkezeti prémiuma (a legjobb 11 tizenhat keretből mindig erősebb,
   mint egy keret saját top-11 átlaga). Mérve **állandó**: D6-ból +2,7,
   D3-ból +3,7, válogatottakkal D6-ból +2,8 — vagyis egy egyszerű konstanssal
   korrigálható.

**A MEGVALÓSULT MEGOLDÁS** (`node tools/pyramid-sim.js draft`, immár a valódi
`pyrDraftPick`-kel és a valódi pool-eltolással, 250 draft/sor):

| indulás | osztály közepe | pool-eltolás | kezdő XI | **rés** |
|---|---|---|---|---|
| D6 | 71,6 | −8,4 | 71,0 | **−0,5** |
| D5 | 74,0 | −7,0 | 74,0 | **−0,0** |
| D4 | 76,9 | −4,9 | 77,2 | **+0,4** |
| D3 | 80,1 | −2,9 | 80,9 | **+0,8** |
| D2 | 82,8 | −1,6 | 83,8 | **+1,0** |
| D1 | 86,2 | −1,8 | 86,5 | **+0,3** |

`q = 0,15` + `PYR_DRAFT_PREMIUM = 3` + a pool eltolása a piramis skálájára —
a rés mind a hat indulási osztályban a **−0,5 … +1,0** sávban van.

**Egy pótlólagos korrekció: `PYR_DRAFT_FLOOR = 0,004`.** A mértani csökkenés
önmagában túl gyorsan hal el: a hatodosztályból az élvonal esélye
0,15⁵ ≈ 0,008%, azaz gyakorlatilag SOHA — pedig épp az a draft öröme, hogy
néha egy nagy név is eléd kerül. A padló minden osztálynak ad minimális
esélyt; a hatodosztályból a felső három együtt ~1,2%-ot kap. Mérve a
merítés D6-ból: **84,6% D6 · 13,3% D5 · 1,8% D4 · 0,3% D3** + a padló.

**Hol lakik a két összetevő:** a súlyozás a `pyrDraftPick`-ben (a KEZDŐ
osztályhoz mérve, hogy egy feljutás után a Run-visszajátszás se csússzon el),
az eltolás a `marketPeakShift()`-ben — vagyis ugyanazon az egy kapun, amin a
piac amúgy is a világhoz igazodik.

**Egy független megerősítés:** a felhasználó saját tapasztalata szerint a mai
draftból válogatottakkal együtt 80–86-os csapatok jönnek ki, és a súlyozástól
76–84-et várt. A mérés `q=0,15`, válogatottakkal: nyers XI **80,8** — pontosan
a jelzett sávban —, klubeltolással 74,4. A modell tehát a valós tapasztalattal
egyezik, és az eltolás az, ami a becsült sávot a helyére viszi.

#### A LEZÁRÁS: a draft kikerült a módból (v3.4.18)

A számok fentebb rendben vannak — a **játékélmény** viszont nem lett az. A
súlyozott draft ugyanis pont azt a döntést teszi kiszámíthatatlanná, amire az
egész mód épül: **hogy TUDD, mekkora falat vállaltál.** A rés a súlyozás
mellett is szórt marad (nem a mért középérték a te futásod), és a mód
belépője emiatt egy olyan vállalást kért, amit csak utólag lehetett látni.
Ehhez jött, hogy a draft belépő-sorrendje fordított: ott az osztály KELL a
merítés súlyozásához, tehát a klub után választott osztály nem is lehetséges.

**Döntés:** a hagyományos módban egyetlen kezdés van, a **kész klub**. Ekkor
a rés nem szórt, hanem *kiszámított és kiírt* szám (`gap0`), és a Run-plafon
is őszinte lehet (**9.1**).

A súlyozott draft KÓDJA megmarad (`pyrDraftPick`, `PYR_DRAFT_Q`,
`PYR_DRAFT_PREMIUM`): a mérőeszköz `draft` parancsa dolgozik vele, és a
Run-visszajátszás merítés-súlyozása is ezen az egy kapun megy. A módban
viszont nincs út, ami elvezetne hozzá.

### 4.3 A többi megfontolt út

**Kész klub.** Átveszed egy valós klub kész keretét, és utána döntöd el, melyik
osztályból indulsz vele. Immerzióban ez a legerősebb (te vagy a Paksi FC), a rés
pedig nem becslés, hanem kiírt szám. **A v3.4.18 óta ez az EGYETLEN út** — az
indoklás a 4.2 lezárásában.

**Korlátozott draft** (nem a legjobb embert viheted minden keretből, hanem az
5–20. helyezettből). Immerzióban gyenge, a szórása nagy — elvetve, mert a
4.2-es megoldás ugyanazt éri el érthetőbben.


---

## 5. Az ellenfelek fejlődése — ezen áll vagy bukik minden

### 5.1 A felismerés, ami az egészet egyszerűvé teszi

Ha **minden** AI-csapat ugyanazzal az `R` ütemmel fejlődik, a játékos pedig
`P`-vel, akkor a piramis **alakja változatlan marad**, és kizárólag a
**különbség (P − R)** mozgatja a játékost benne. Az abszolút ütem csak
inflálja a számokat: egy 200-as Ratingű hatodosztály ugyanúgy játszik, mint egy
71-es, ha a rések ugyanakkorák.

**Tehát nem az AI sebességét kell kalibrálni, hanem a nettó mászást.** Ez az az
egyetlen szám, amit a négy fokozat állít.

### 5.2 Mennyi a játékos üteme? — a küldött runokból mérve

A kezdő 11 becsült ereje = a kezdő mezőny + 4 (az auto szintkövetés
`balanced` sávja +3…+5-öt tart), a vég-XI a lezáráskori átlag:

| run | szezon | kezdő mezőny | vég-XI | **Rating/szezon** |
|---|---|---|---|---|
| 757 | 2 | 82 | 101,8 | 7,90 |
| gigi-gól-ló | 4 | 82 | 112,4 | 6,60 |
| AllStars | 4 | 82 | 109,8 | 5,95 |
| O-o' | 5 | 87 | 135,8 | 8,96 |
| BARSZA | 8 | 83 | 134,8 | 5,98 |
| Shat | 5 | 80 | 125,7 | 8,34 |
| Bri'ish | 4 | 84 | 116,7 | 7,18 |

**átlag 7,27 · medián 7,18 · sáv 5,95 – 8,96**

Ez független megerősítése a kód akkori becslésének
(`RUN_CLIMB_PER_SEASON = 10`) — azzal, hogy a valóság **~30%-kal szerényebb**,
mint amit a Run-mérő legkorábbi-Infinity referenciája feltételezett. A tervezés
alapja legyen a mért **7,0**.

*(Utóirat, v3.4.19: ugyanez a 10-es becslés a dinamikus mód Infinity-határidejét
is állította, ott viszont FÖLFELÉ tévedett — túl késői határidőt adott, és a
korai megnyitás bónuszát érdemtelenül felnagyította. A határidő azóta fix: a
3. szezon 30. bajnokija, `RUN_INF_DEADLINE_SEASON`, és a
`RUN_CLIMB_PER_SEASON` kivezetve.)*

Két minta is látszik: a **hosszabb runok üteme lassabb** (BARSZA 8 szezon →
5,98; 757 két szezon → 7,90), tehát a fejlődés kopik; és a **magasabbról induló
run gyorsabb** (O-o' 87-ről → 8,96), mert a jobb kerethez jobb büdzsé jár.

### 5.3 A négy fokozat — MÉRVE, a valódi kóddal

`node tools/pyramid-sim.js live` — ez már nem absztrakt modell: az index.html
`pyrBuildWorld` / `pyrSimDivision` / `pyrDevelopWorld` függvényeit futtatja, a
valós klubokkal és valódi fel-/kieséssel. (120 karrier × 25 szezon, D6-ból.)

| fokozat | AI-ütem alul / az élvonalban | élvonalba jut | első arany | nettó mászás | vég-osztály |
|---|---|---|---|---|---|
| 😴 **Alvó mezőny** | 0,50 / 0,65 | 100% · 8,4. szezon | 8,8. (100%) | 4,32 | 1,0 |
| 🚶 **Lassan követnek** | 0,68 / 0,75 | 100% · 10,2. | 12,3. (100%) | 3,37 | 1,0 |
| 🏃 **Lépést tartanak** *(ajánlott)* | 0,76 / 0,82 | 100% · 12,3. | 18,5. (95%) | 2,55 | 1,0 |
| 🔥 **Kegyetlen** | 0,83 / 0,91 | **73%** · 18,8. | 21,0. **(1%)** | 1,18 | 1,6 |

A Kegyetlen szándékosan olyan, hogy a karrierek negyede **el sem jut az
élvonalig** 25 szezon alatt.

**KÉT HANGOLÁSI KORLÁT, mindkettő mérve:**

**(1) Az élvonali utolérés nem lehet közös.** Az első változatban minden
fokozat ugyanazt a 0,92-t kapta az élvonalban. Mérve megbukott:

```
😴 Alvó         élvonal 11,4. szezon · bajnok  2% · nettó 1,58
🚶 Lassan       élvonal 13,9.        · bajnok  0% · nettó 1,50
🏃 Lépést tart  élvonal 17,9.        · bajnok  0% · nettó 1,30
🔥 Kegyetlen    élvonal 18,4.        · bajnok  0% · nettó −0,21
```

A négy fokozat a karrier második felében **összeolvadt** (a karrier zöme az
élvonalban telik, ott viszont mind ugyanazt kapta), és a **bajnoki cím
elérhetetlen** volt: frissen feljutva ~−3-on állsz az élvonal közepéhez, a
címhez ~+3 kell, tehát ~6 pont relatív mozgás — 0,92-nél (nettó 0,56/szezon)
ez tizenegy szezon, a karrier végén túl. Ezért lett az utolérés a **fokozat
sajátja** (`top`).

**(2) A `share` nem mehet 0,85 fölé — halálspirál.** 0,89-nél a mért nettó
**−0,41**, és a karrierek 89%-a a piramis aljára csúszik. Az ok visszacsatolás:
a rossz szezon kevesebb pénzt hoz, az kevesebb fejlődést, az még rosszabb
szezont. A 0,83 az a határ, ahol a fokozat még kemény, de nem zsákutca.

| share | élvonalba jut | nettó | vég-osztály |
|---|---|---|---|
| 0,89 | 11% | −0,41 | 5,2 |
| 0,86 | 25% | +0,42 | 3,9 |
| **0,83** | **73%** | **+1,18** | **1,6** |
| 0,80 | 100% | +1,64 | 1,0 |

### 5.4 A tempó-csatolás — ELVI HIBALEHETŐSÉG

A játékos saját tempója (Alap ×1,00 … Gleccser ×0,60) **szorozza** a `P`-t.
Ha az AI ütemét abszolút számban rögzítenénk, a Gleccser-tempó
(P = 7,0 × 0,60 = 4,2) a „Lépést tartanak" AI-ütemével (5,6) szemben
**negatív nettó mászást** adna (−1,4) — a játékos nemhogy nem jutna fel, hanem
osztályról osztályra **lefelé** csúszna, amíg a piramis aljára nem ér. A
Run-mérő eközben a lassított tempóért *jutalmat* ad. Ez a mód legcsúnyább
lehetséges hibája.

**Szabály: az AI ütemét mindig a JÁTÉKOS tempóval megszorozva számoljuk.**

```
aiRate = 7,0 × tempoMult() × share[fokozat]
```

Így a nettó mászás minden tempón arányos marad, és a Gleccser tényleg csak
*hosszabbá* teszi a karriert, nem reménytelenné.

### 5.5 Az élvonal az elnyelő állapot — és mi a megoldás

Az élvonalból nincs hova feljutni. Ha ott is a játékos fejlődik gyorsabban, a
mód pár szezon után visszazuhan a mai élménybe: örök bajnok, tét nélkül. A
szimuláció ezt meg is mutatja (`top=1.0` nélkül minden fokozat 100% arany).

**Megoldás:** az AI üteme **osztályonként eltér** — fölfelé haladva gyorsul,
ahogy a valóságban is (egy élvonalbeli klub költségvetése nagyságrenddel
nagyobb). Az élvonali érték a **fokozat sajátja** (`top`), nem közös konstans
— lásd 5.3/(1), ahol a közös érték mérve megbukott.

```
share(osztály) = share[fokozat] + (top[fokozat] − share[fokozat]) × (6 − osztály)/5
```

Játékban ellenőrizve: a „Lépést tartanak" fokozat AI-üteme D6-ban 5,32,
D1-ben 5,74 — a rés a te 7,0-es ütemedhez képest 1,68-ról 1,26-ra szűkül.

Ettől a bajnoki cím az élvonalban **örökre igazi verseny marad** — pontosan a
hagyományos karrier-érzet: az évek nagy részében dobogós vagy, néha bajnok,
néha 5. Ez adja a mód végtelenjét, Infinity-vásárlás nélkül.

### 5.6 A fejlődés alakja

* **Egyenletes**, ahogy a terv mondja: minden AI-csapat a saját üteméhez
  ±20% zajt kap (`rngFor("world:dev:s"+szezon+":"+klub)`), tehát a mezőny
  átrendeződik, de nem ugrál.
* **Enyhe eredmény-alapú tag:** a bajnok +15%, az utolsó −15% az adott
  osztályban. Ez tartja a bajnokokat a fel-/kiesés után is versenyben, és
  akadályozza meg, hogy egy örök sereghajtó a következő szezonban is
  sereghajtó legyen.
* **Minden osztály EGYSZERRE** fejlődik, a szezonzárás után, a fel-/kiesés
  ELŐTT — így a csere már az új erőviszonyok szerint történik.
* A fejlődés **egyetlen számot** mozgat csapatonként (a tábla-`ovr`-t). Az
  ellenfelek nem kapnak keretet, nem öregednek, nem igazolnak: a
  `buildOpponents` ma is `{n, ovr}` párokkal dolgozik, és a góllövő-választás
  (`pickOpponentScorer`) a klub valós keretéből merít. Ez változatlan marad.

### 5.7 FORDULÓRÓL FORDULÓRA — a szezon közbeni kúszás (v3.4.22)

**A probléma.** Te minden héten fejlődsz (edzés, képességek, igazolások), a
mezőny viszont évente EGYSZER, egyetlen ugrással lépett. A szezon vége felé
egyre kényelmesebb lett a bajnokság, aztán idényváltáskor hirtelen keményebb —
ez a mód legfeltűnőbb művi eleme volt.

**A megoldás SZÁMÍTOTT, nem halmozott.** A mezőny fordulónkénti ereje

```
ovr(r) = ovrBase + (éves alapütem / 30) × r
```

ahol `ovrBase` a szezonkezdő érték, `r` a lejátszott fordulók száma. Három baj
marad így ki, és mind a hármat a kód meglévő garanciái okoznák:

1. **A menetrend és a mezőny külön mentődik** (a `buildLeagueTable` névalapú
   párosításánál ez már dokumentált hiba volt). Egy helyben növelt szám
   újratöltés után szétcsúszna a két oldalon; a képlet mindkettőn ugyanazt adja.
2. **A tabella minden rajzoláskor újrajátssza az egész szezont**, és garantálja,
   hogy a féltávi állás a végleges valódi előzménye. Halmozott számmal a replay
   a mai erővel játszaná újra az 1. fordulót is.
3. **Idempotens:** kétszer futtatva sem romlik el semmi.

**Miért nem billenti fel az AI-bajnokságot.** Az ütem az osztályon belül
mindenkire ugyanaz, tehát az AI-vs-AI meccsek *erőkülönbsége* — és így a
szimulált eredmény — változatlan. Mérve: a 10 fordulós tabella a szezon elején
és a 29. fordulónál nézve **betűre azonos**.

**Miért nem számolunk kétszer.** A világ csapatai (`S.pyr.divs`) a szezon alatt
érintetlenek; a kúszás csak a szezon mezőnyének (`SEASON_OPPS`) a fedőrétege. A
szezonfordulón a `pyrDevelopWorld` a szokásos éves lépést adja a világnak, és
az új szezon mezőnye onnan születik újra. Mérve D4-ben: ütem **0,183/forduló**,
30 forduló = **5,49** = pontosan az éves alapütem; a szezonhatáron a 30.
forduló mezőnye 82,38 → az új szezon eleje 82,24, azaz **−0,14 ugrás** (a
helyezés- és zajmódosító különbsége).

**A mezőnyszint (`oppTargetRating`) SZÁNDÉKOSAN nem mozdul menet közben.** Az a
szezon horgonya: erre épül a piac (`marketPeakShift`), a kupasáv (`cupTierFor`
→ `pyrDivForLevel`, ami egy +5-ös elcsúszástól MÁS osztályt adna vissza) és a
gazdaság. A `levelGap`/underdog viszont látja a kúszást: az `oppMatchStrength`
az „itt és most" kérdésre hozzáadja, különben a játék a szezon vége felé
könnyebbnek hinné magát, mint amilyen.

**Egy mellékjavítás.** A lejátszott meccs ellenfele mostantól PILLANATKÉP a
`fixtureResults`-ban, nem hivatkozás: enélkül a 3. fordulóban legyőzött
ellenfél ereje a 25. fordulóban visszamenőleg magasabbnak látszana, és a rá
épülő kihívás-számlálók (pl. „verj meg egy rivális erejűt") elcsúsznának.
(A mentés/betöltés amúgy is másolatot csinált belőle, tehát a hivatkozás
megtartása csak újratöltésig tartó, hamis azonosság volt.)

**A dinamikus módban EGYELŐRE NINCS bevezetve.** Ott az auto szintkövetés
(`autoLevelSync`) a funkcionális párja, és a kettő együtt kétszer mozgatná a
mezőnyt — az összevonás külön döntés.

---

## 6. A PvE meccs-motor átvizsgálása

### 6.1 A REJTETT ELLENFÉL-ERŐSÍTÉS — ez a legveszélyesebb tétel

```js
oppBuffFor(lvl,hidden) = max(0,(lvl−84)×0,12) + max(0,hidden×0,5)
```

Két tagja van, és **mindkettő ütközik az új móddal**:

* **A mért tag** (`hidden × 0,5`): a mezőny megkapja a TE rejtett bónuszod
  felét — a morálod, a taktika-begyakorlásod, az aura-skilljeid, a
  kapitányod fele visszaüt rád. A mai módban ez indokolt gumiszalag: az
  ellenfelek NEM fejlődnek, tehát valami kell, ami megakadályozza a
  tarolást. **Az új módban viszont az AI-fejlődés MAGA ez a mechanizmus** —
  a kettő együtt duplán fékez, és a „Kegyetlen" fokozat a szimulált 0,8-as
  nettó mászás helyett gyakorlatilag 0-t adna.
* **A fix tag** (`(lvl−84)×0,12`): korlátlanul nő a mezőnyszinttel. Egy
  piramisban, ami a végtelenbe fejlődik, ez 150-es szinten már +7,9, 200-ason
  +13,9 — **magától lezárja a játékot**, mert a 4-es játszható ablakot
  többszörösen túllépi.

**Javaslat a hagyományos módra (v3.4.x, MEGHALADVA):** `oppBuffFor` **mindkét
tagja kikapcsolva** (0-t ad vissza). Az AI-fejlődés váltja ki a szerepét, és ez
az EGYETLEN pont, ahol a rejtett bónusz és a nyílt fejlődés nem duplázódik.

### 6.1a A MÉRT TAG VISSZAKAPCSOLVA — mért ellenérv (v3.5.09)

**A fenti javaslat fele megbukott.** A „az AI-fejlődés MAGA ez a mechanizmus"
érv csak akkor állna, ha a két fék UGYANAZT fékezné. Nem ugyanazt:

| fék | mit követ |
|---|---|
| a mezőny évi fejlődése (≈+3,5) | a **kereted** erősödését — Ratingek, igazolások, akadémia |
| a mért rejtett bónusz | a **szituatív** oldalt — morál, edző, taktika-begyakorlás, aura-képességek, kapitányi rutin, kémia |

A második csatornának a mezőny oldalán **semmilyen megfelelője nincs**, és a
mezőny évi lépése sem követi. Mérve egy futó karrieren, az 1. szezon 4.
fordulójában (D6, 2. felskálázási fokozat):

```
kijelzett csapaterő  76,8
valódi meccs-erő     82,0     ← +5,2 rejtett, amiről a rés-mérce nem tudott
a mezőny             80,2
vállalt („egyenrangú") rés   −1,2
a pályán mért rés            +1,8
```

Vagyis a mód központi ígérete — *„a rés az egyetlen szám, ami megmondja,
mekkora falat vállaltál"* — nem teljesült: a vállalt egyenrangú kezdésből a
pályán 3 ponttal fölényes lett, és a különbség a karrierrel együtt nő.

**KÖVETKEZETLENSÉG IS VOLT.** A `hiddenOppBuff` kupa-ága
(`Math.max(0,seasonHiddenBonus()*OPP_BUFF_MEASURED)`) a `pyrOn`-tól
**függetlenül** adta a mért felét. A piramis kupája és bajnoksága tehát
kétféle szabály szerint ment.

**A MEGVALÓSULT SZABÁLY.** A piramisban `oppBuffFor` a **mért tagot adja**
(`hidden × 0,5`), a **fix tag továbbra is kimarad** — az utóbbi indoka
változatlan és helyes: korlátlanul nő a szinttel, egy végtelenbe növő
piramisban 150-es szinten +7,9, ami magától lezárná a játékot. A dinamikus
mód érintetlen.

A kompenzáció **félig** megy, ugyanazzal az indokkal, amiért a dinamikus
módban is: a teljes kioltás pontosan értelmetlenné tenné a morált, a taktikát,
az aurát és a kapitányt. A másik fele a te előnyöd marad — csak most már a
rés-mérce is tud róla.

**MÉRVE, a fenti karrieren:**

| | meccs-rés | 30 fordulós várható pont |
|---|---|---|
| előtte | **+1,8** | 52,9 |
| utána | **−0,8** | 39,1 |

Vagyis a vállalt „egyenrangú" kezdés tényleg egyenrangú lett.

### 6.1a-2 AZ UNDERDOG-MÉRCE (v3.5.09)

Ugyanez a vizsgálat hozta felszínre, hogy az `underdogFactor` a mezőny
**meccs-erejét** a te **nyers** csapaterődhöz mérte. Két különböző fajta szám,
és a különbség pontosan a rejtett bónuszod — a HUB hegy-doboza ezért tudta
ugyanabban a sorban azt írni, hogy *„+2 a mezőnyhöz képest"* (előnyben vagy)
ÉS hogy *„enyhe hátrány: +9% fejlődés"* (hátrányban vagy).

A bónusz **szerepe változatlan**: fejlődési kárpótlás annak, aki tényleg
gyengébb — nem meccserő-bónusz (a faktor ma is csak a fejlődést, a
jutalom-esélyt és a kémia-ajánlatokat szorozza). Csak a **mérés** lett
becsületes: meccs-erő a meccs-erőhöz. A piramisban ez külön is kellett: a
mezőny mostantól megkapja a rejtett bónuszod felét, tehát a régi képlettel a
kompenzáció MAGA hizlalta volna az underdog-bónuszt — jutalom járt volna
azért, hogy erős vagy.

**MÉRVE:**

| eset | fejlődés régi | fejlődés új |
|---|---|---|
| PIRAMIS · rajt, fejletlen keret (76 · mezőny 78 · rejtett 1,5) | 5% | 3% |
| PIRAMIS · a fenti futás (76,8 · 80,2 · rejtett 5,2) | 9% | 2% |
| PIRAMIS · kiépített keret (95 · 95 · rejtett 9) | 8% | 8% |
| DINAMIKUS · gyenge keret (80 · mezőny 90 · rejtett 2) | 36% | **31%** |
| DINAMIKUS · kiépített (100 · mezőny 98 · rejtett 8) | 19% | **9%** |

A tényleg gyenge keret gyakorlatilag mindent megtart; a kényelmesen nyerő
veszíti el — pontosan az, amiért a bónusz született.

### 6.1b A RATING-PLAFON — a második szerkezeti akadály a motorban

`RATING_CAP = 119` a játékosok Rating/peak felső határa, és a mai módban ezt
kizárólag az Infinity megvásárlása oldja fel. A piramis viszont **szándékosan
nem tartalmaz Infinity-vásárlást** („a tető magától nyílik"), miközben a
világ a végtelenbe fejlődik.

Mérve: az élvonal AI-üteme ~5,7/szezon, tehát a 86-os induló középérték
**hat szezon alatt átlépi a 119-et**. Onnantól a játékos plafonon áll, a világ
tovább nő, és a karrier feltartóztathatatlanul csúszik lefelé a piramisban —
nem nehézség, hanem szerkezeti zsákutca.

**Megoldás:** a `ratingCap()` a piramisban is `Infinity`-t ad. A konstans épp
erre az egy sorra készült („hogy az Infinity mód később egy sorral
feloldhassa"); a piramis a második ilyen feloldó. **A kor-görbe marad**: az
öregedés lassítása könnyítés volna, nem a plafon ügye.

Ugyanez a kapu vonatkozik a **kupamezőnyre** is (a kampány mezőnye korábban
közvetlenül a `RATING_CAP`-re vágott) — egy 119-re vágott kupamezőny egy
150-es világban néma könnyítés lett volna.

### 6.2 Amit ellenőriztünk, és rendben van

| mechanizmus | hol | ítélet a piramisra |
|---|---|---|
| `seasonHiddenBonus` befagyasztás | 39072 | **jó** — épp a gumiszalagot előzi meg (a rossz sorozat ne könnyítse a bajnokságot) |
| `matchLambdas` — λ-vágás .15/4.5 | 26169 | **jó**, de ez okozza a ±4-es ablakot (4.) |
| `underdogFactor` (fejlődés-bónusz hátrányban) | 39089 | **jó, sőt kulcs** — a piramisban ez segíti a felzárkózást egy nehéz osztályban; érdemes megtartani |
| `marketPeakShift` + `MARKET_INF_MAX_LAG` | 12265 | **át kell írni** — a `careerBaseRating` horgony (a karrier induló szintje) helyett a piramisban az **aktuális osztály középértéke** a helyes horgony, különben a piac 10 szezon után 30 ponttal a világ alatt marad |
| `euroDominance` / kupamezőny | 7839 | **át kell írni** — a kupamezőny ma a bajnoki nehézségi szintből épül; a piramisban a **résztvevő ligák** középértékéből kell (lásd 7.) |
| `CUP_TIERS` sávos kvalifikáció | 7761 | **kivezetendő** az új módban — ott a bajnoki helyezés dönt, nem a Rating-sáv |
| `applyOppLevel` / `autoLevelSync` | 28626 / 39160 | **nem fut** — nincs szintváltás |
| `INFINITY_UNLOCK_RATING` kapu | 12148 | **nem fut** — a tető magától nyílik |

### 6.3 A „3 szezon múlva +15-ös tábla" forgatókönyv

Nem fordulhat elő, **ha** a 4. pontban leírt korlátokat betartjuk: a
legnagyobb egyszeri ugrás a feljutás, ami a lépcső nagysága (~3,3), és a
következő szezonig a saját fejlődésed ennek a felét-egészét visszahozza.
A +15-ös helyzet csak akkor áll elő, ha valaki 8 pont széles sávokkal
és 2 pontos lépcsőkkel dolgozik (a sáv teteje és alja közti 8 + két lépcső),
vagy ha a fix `oppBuffFor` tag a magasba nőtt szinteken bekapcsolva marad.

---

## 7. Kupák — MEGVALÓSULT

A kvalifikációt a hagyományos módban nem a Rating-sáv adja, hanem az
**osztály**. A `PYR_CUPS` tábla alakja szándékosan azonos a `CUP_TIERS`-ével,
így a teljes kupagépezet (`cupEntryFor`, selejtező, mezőnyépítés, ünneplés)
egyetlen hook-kal átvette — a `cupTierFor` ad a piramisban osztály-alapú sort.

| oszt | liga | hazai kupa | nemzetközi | a kupagyőzelem jutalma |
|---|---|---|---|---|
| **D1** | premier líg | FA-kupa a top 32-ből, **selejtező nélkül** | 1–3. **BL** · 4–5. **EL** · 6. **KL**, mind selejtező nélkül | FA → **BL közvetlenül**, a következő idényben |
| **D2** | másodosztály | FA-kupa, **4 körös** selejtezővel, minden csapat | — | — |
| **D3** | NB I | Magyar Kupa, 4. helytől bárkinek | 1. **BL-sel.** · 2. **EL-sel.** · 3. **KL-sel.** | MK → **BL-selejtező**, a következő idényben |
| **D4** | NB II | Magyar Kupa, az első **3** helyezett | — | — |
| **D5–D6** | NB III / megyei | — | — | — |

Böngészőben ellenőrizve, mind a hat osztályon, helyezésenként.

**Két új darab a gépezetben:**

* **Az FA-kupa mint második hazai sorozat** (`EURO_COMPS.FA`). A piramis felső
  felében a hazai kupa nem szerény sorozat: a legjobb 32 játssza, és a
  győzelme BL-t ér — ezért erősebb mezőnyt kap (`oppDelta 0`, szemben az MK
  −4-ével) és a KL/EL közé árazott díjazást.

  **A DINAMIKUS MÓDBAN IS FUT (v3.5.01).** A két Biszem-baszom sávban eddig az
  volt a helyzet, hogy aki lecsúszott a nemzetközi helyekről, annak egyáltalán
  nem jutott kupa (a Magyar Kupa a 79-es és 84-es sávé). Ugyanaz a sorozat
  ugyanoda került be: `{comp:"FA",max:99}` a `CUP_TIERS` két felső sorának a
  végére, tehát a nemzetközi helyek után mindenki más az FA-kupát játssza.

  **A hírességpontokból hiányzott** (v3.5.01): sem a `FAME_AWARD_BASE`, sem a
  `FAME_MVP_BASE` nem ismerte, ezért az FA-kupában szerzett egyéni díj a
  BAJNOKI bázison fizetett (1), a meccs embere pedig egy sima ligameccsén.
  Az értéke ott is a két hazai kupa viszonyát követi: **díj 1,25** és
  **MVP 2,5**, vagyis MK és KL közé — pont oda, ahova a díjazása.

  **Az arculata angol piros-fehér** (v3.5.01): az eredményjelző az EGYETLEN
  világos lemezű tábla a játékban (`#sbBoard.comp-FA`), piros fordítós
  lapokkal. A sorozatszín ezért királykékről `#c8102e`-re váltott — egy
  sorozatot egy szín visz végig (fejléc, Champion-gyűrű, eredményjelző). A
  Magyar Kupa szintén piros, de a kettő SOHA nem fut együtt: az MK a 79/84-es
  sávé és a D3–D4-é, az FA a fölöttük lévő szinteké.
* **A selejtező körszáma sávonként állítható** (`euroQualRounds`). Alapban
  kettő; a D2 FA-kupája négy körrel kezd, mert onnan minden csapat nevez —
  ott a főtáblára jutás maga a szűrő.

**A selejtező-lecsúszás már megvolt:** az `EURO_DROP` (BL→EL→KL) pontosan azt
csinálja, amit a terv kért — a bukott BL-selejtező nem kiesés, hanem az EL
selejtezőjébe ejt.

**Egy útközben talált hiba.** A „következő idényre szóló indulás" ága
(`S.euroEntry.forSeason`) **nem állította be a selejtező-jelzőt**. Eddig ez
nem látszott, mert az ág csak régi mentéseket szolgált ki; a piramisban
viszont ÉLŐ út, és nélküle a D3 Magyar Kupa-győztese a **BL főtábláján**
kezdett volna, selejtező nélkül. Javítva.

**Ami nyitva maradt:** a piramis felső fele FA-kupát játszik, az alsó Magyar
Kupát, tehát egy D2→D3 kiesés **kupát is vált**. Ez szándékos (a felső kupa
erősebb és BL-t ér), de ha zavarónak bizonyul, elég a `PYR_CUPS` két `comp`
mezőjét egységesíteni. A `RUN_MILESTONES` egyelőre csak az MK-t ismeri — az
FA-kupa mérföldkövei a Run-szint lépésénél (P5) jönnek.

## 7.1 Fel- és kiesés: az OSZTÁLYOZÓ

A helyezés nem puszta sorszám. Az osztályok között van egy **osztályozó sáv**,
ahol a feljutás nem jár, hanem ki kell harcolni:

| helyezés | mi történik |
|---|---|
| **1.** | közvetlen feljutás |
| **2–3.** | **osztályozó** a fentebbi osztály **15.**, illetve **14.** helyezettje ellen |
| 4–13. | marad |
| **14–15.** | **osztályozón védi a helyét** |
| **16.** | közvetlen kiesés |

A párosítás keresztbe megy: a jobbik feljutó-jelölt (2.) a gyengébb védőt
(15.) kapja. Két oda-visszavágós párharc osztálypáronként — **az első meccs a
kihívónál, a visszavágó a védőnél**, tehát a döntő mérkőzésen a bennmaradásra
játszó csapaté a hazai pálya, ahogy a valóságban is.

**Mérve** (a motor saját gólgörbéjével, 300 párharc értékenként) — a kihívó
győzelmi esélye:

| erőviszony | azonos | +3 | −3 | −6 |
|---|---|---|---|---|
| kihívó nyer | **48%** | 71% | 32% | 10% |

Az azonos erőnél mért 48% mutatja a védő hazai előnyét a visszavágón. Mivel
egy alsóbb osztály 2. helyezettje jellemzően 2–3 Ratinggel a felsőbb osztály
15. helyezettje alatt van, a párharc valóban **nyitott** — ez a mód
legdrámaibb két mérkőzése.

**Egyelőre SZIMULÁLT, nem játszott.** A lejátszható osztályozóhoz a szezon
utáni szakaszba kellene egy teljes mérkőzés-folyam (mint az európai kupáé) —
az külön lépés. Addig a párharc a motor saját törvényei szerint dől el, és
részletesen elbeszéljük: mindkét meccs eredménye, az összesítés és a döntés
módja (összesítés vagy büntetők) is kiírásra kerül.

## 7.2 A hegymászás vezetése

A mód akkor működik, ha a felhasználó **tudja, hogy hegyet mászik**. Három
helyen mondjuk ki:

* **A HUB nagy kijelzője** (`pyrLadderHtml`) a nehézségi gomb helyén: egy
  hatfokú létra, a jelenlegi osztály kiemelve, mellette a cél („a csúcsig 3
  osztály"), a feljutás és a kiesés pontos feltételei, és a meccs-erőd a
  mezőnyhöz mérve.
* **A tabella fejléce** megmondja, MELYIK osztály állásáról van szó, és a
  sorok színes csíkot kapnak: feljutás · osztályozó · kiesés, jelmagyarázattal.
* **A szezon eleji tájékoztató** (`announcePyrSeason`) a kezdőrúgás előtt
  kimondja a tétet: hányadik idény, melyik osztály, mi kell a feljutáshoz, mi
  fenyeget alul, és hogy a mezőny is fejlődik — „ha megállsz, lecsúszol".

### 6.1c A HATÁROK FELOLDÁSA — Infinity nélkül (v3.5.04)

A **6.1b** feloldotta a Rating-plafont a piramisban, mert enélkül a mód
szerkezeti zsákutca volna. A többi Infinity-határ viszont ott maradt, és
pontosan ugyanaz a logika vonatkozik rájuk: a sebesség 99-es plafonja, a kor
miatti hanyatlás, a 32 éves visszavonulás, az akadémia sávja, a TSI- és
attribútum-plafon, a stílus-mérföldkövek teteje. Egy végtelenbe növő világban
mindegyik ugyanúgy megfogja a karriert.

**A kapu: az osztályod mezőnye eléri a 100-as átlagot** (`pyrInfinityCheck`).
Nincs vásárlás, nincs ár, nincs gomb — a mód ígérete szerint „a tető magától
nyílik".

**Az `infinityMode` zászlót állítjuk át, szándékosan azt**, és nem egy második
predikátumot: a játékban minden Infinity-szabály ezen az egy zászlón dől el, és
egy párhuzamos predikátumból előbb-utóbb kimaradna egy hívási hely. Mérve a
3. szezonfordulón, 104-es mezőnynél: sebesség-plafon 99 → feloldva,
visszavonulás 32 → 55, stílus-mérföldkövek +444 új fokozat.

**Amit NEM ad meg:** a megnyitás egyszeri ajándékait — a keret ×TSI-boostját
(az a 100 milliárdos ár ellentételezése; ingyen odaadva a mért fejlődési
egyensúlyt billentené fel) és a 119-re csonkolt basePeak-ek helyreállítását
(tárgytalan: itt a plafon sosem csonkolt). A **határok** nyílnak ki, nem az
ajándékok.

**Az Infinity-VÁSÁRLÁS eltűnt a HUB-ból.** Korábban a 100-as mezőny
megnyerésekor megjelent a 100 milliárdos sáv, ami azt is sugallta, hogy a
ranglistára jutás ehhez van kötve. Nincs így: a piramis belépője az **élvonal
megnyerése** (`runBoardOnPyrTitle`, lásd 9.), és az Infinitynek semmi köze
hozzá.

---

## 8. Riválisok

A mai rangadó-lista helyett: **a hozzád Ratingben legközelebb álló 2–3
csapat a saját osztályodban**, szezononként újraszámolva. Ez a piramis
természetes riválisa — és mivel a mezőny fejlődik, a rivális **változik**:
akit tavaly lehagytál, idén már nem az.

A `chIsRivalOvr` / `CH_RIVAL_MARGIN=2` már pontosan ezt a definíciót
használja a kihívásokhoz (a saját erődhöz mért ±2 sáv), tehát a rivális-
detektálás kódja **átvehető változatlanul**.

---

## 8.5 A VILÁG FELSKÁLÁZÁSA (v3.5.08)

**A hiány.** A piramis a valós klubokat a valós erejük szerint rangsorolja,
tehát egy top nevekkel teli keret **mindig** az élvonalba tartozik. Aki
Barcelonával akarta végigmászni a hegyet, annak két rossz választása volt:
vagy az élvonalból indul (nincs mit megmászni, plafon 30), vagy a
hatodosztályból **+11,0-es réssel** — sétagalopp, plafon 30. A „top nevek, de
a piramis aljáról" karrier egyszerűen nem létezett.

**A megoldás.** A felskálázó a **VILÁGOT** emeli meg, nem a keretedet. Négy
fokozat; a negyediken a legalsó osztály átlagereje pontosan a mai legerősebb
osztály átlagereje.

| fokozat | eltolás | D6 közepe | D1 közepe |
|---|---|---|---|
| 0 | — | 71,4 | 85,9 |
| 1 | +3,75 | 75,2 | 89,7 |
| 2 | +7,50 | 78,9 | 93,4 |
| 3 | +11,25 | 82,7 | 97,2 |
| **4** | **+15,00** | **86,4** | 100,9 |

A lépcső a piramis **saját geometriájából** jön, nem kitalált számból:
`(osztályok−1) × PYR_STEP = 5 × 3,0 = 15,0` — pontosan a D1 és a D6 közepe
közti távolság, négy fokozatra osztva.

**Hogyan hat — két helyen, és sehol máshol.**

1. A világ generálásakor a `base` ennyivel feljebb indul (`pyrBuildWorld(rnd,
   upLv)`), tehát a mezőny tényleg erősebb, és a mezőnyszint is ennyivel
   magasabb.
2. A **kereted viszont nem emelkedik vele**: a pool-eltolás (`off`) a
   felskálázás NÉLKÜLI osztályközépre horgonyoz (`off = pyrMean − up −
   rawMean`). Enélkül a kereted együtt emelkedne a mezőnnyel, és a felskálázó
   pontosan semmit nem érne.

Ebből a rés:

```
gap0 = klub_nyers − az osztály nyers közepe − felskálázás
```

Minden más — rangsor, osztályon belüli sorrend, kupák, fel- és kiesés, AI-tempó
— **érintetlen**: a felskálázás egy eltolás, nem új szabály.

**MÉRVE** (FC Barcelona 2010/11, nyers 88,0 · 🏃 Lépést tartanak · alap tempó):

| fokozat | ajánlott osztály | rés | zóna | Run-plafon |
|---|---|---|---|---|
| 0 | D1 | +3,6 | kényelmes | 35 |
| 1 | D1 | −0,2 | egyenrangú | 44 |
| 2 | D2 | −1,3 | egyenrangú | 56 |
| 3 | D5 | −1,3 | egyenrangú | 76 |
| **4** | **D6** | **−4,0** | **kemény menet** | **91** |

Ez a kért karrier: a legerősebb valós keret a piramis legaljáról indul,
egyenrangú vagy annál nehezebb küzdelemben, és a Run-plafon 35-ről 91-re nő.

**A másik oldal ugyanígy látszik.** Egy gyenge klubbal a felskálázás
öngyilkosság: a Paksi FC (77,4) már a 2. fokozaton `−7,1`-es réssel, „fal"
zónában áll. Épp ezért **a klub UTÁN** áll a csúszka, és a lista **élőben**
követi: a döntés pillanatában látod, melyik osztály lesz az ajánlott.

**Közös karrierben** a felskálázás világ-tulajdonság, tehát a **házigazdáé**:
a beállító képernyőn állítja, a szoba-csomag viszi át (`pyr.upAmt`, mellette a
régi kliensek kedvéért a 0-4 fokozatra kerekített `pyr.up`), és a klub sávjának
közepéhez mérve kapja hozzá az osztály-ajánlást. Régi szobában nincs mező — ott
nincs felskálázás, ahogy eddig sem.

---

## 8.6 A RÉS A VEZÉRLŐ (v3.5.15 → v3.5.19)

**A 3.5.15 lépése.** A felskálázó négy fokozat volt (0 / 3,75 / 7,5 / 11,25 /
15); a fokozat durva eszköz, mert a rés-sávok, amikre a döntés épül, 1-2 Rating
szélesek. A skála ezért folyamatos lett (`pyrUpNorm`, 0,1-es lépés) és
szimmetrikus: **−15,0 … +15,0** (`PYR_UP_MIN`/`PYR_UP_MAX`). A felső határ
jelentése változatlan (a D6 közepe = a mai D1 közepe), az alsó a tükörképe. A
negatív irány nem külön szabály: egy 69-es kerettel az élvonalban csak úgy
lehetsz középmezőny, ha a világ jön **le** hozzád.

**A 3.5.19 lépése — a bejelentés:** *„a mostani csúszka teljesen gyilkosan
nehéz, felfoghatatlan még nekem is, pedig én tudom, mit akar."*

Igaza volt, és a hiba szerkezeti: a csúszka a **világ eltolását** állította,
vagyis egy KÖZVETETT számot. A felhasználót nem az érdekli, hány ponttal
emelkedik a piramis, hanem hogy Ő milyen erős lesz a saját mezőnyében — a kettő
között egy fejben elvégzendő kivonás állt (`rés = klub − osztályközép −
eltolás`), és **három vezérlő** versengett ugyanazért a döntésért: a csúszka, az
immerzió-csík és a lista.

### A mai modell: két kérdés, két vezérlő

```
① Melyik ligában kezdesz?        → a hat sor: a futás HOSSZA és a Run-plafon
② Milyen erős legyél a mezőnyhöz → EGY csúszka: a rés, NYERS csapaterőben
   képest?                          (−8 … +8, félpontos lépés)
```

A világ eltolása ebből **számítódik**: `up = klub_nyers − osztály_nyers_közepe −
rés` (`pyrUpForGap`). A felhasználónak nem kell tudnia róla — a csúszka alatt
egy szürke, zárójeles sor kiírja annak, aki kíváncsi. A **0 rés = immerzió**: a
fogalom megmaradt, csak nem külön vezérlő többé, hanem a skála természetes
középpontja (és a „🎬 középmezőny" gomb helye).

**A csúszka határa ligánként más** (`pyrGapRangeFor`): a világ ±15-nél messzebb
nem tolható, tehát egy 69-es kerettel az élvonalban a „legyek erősebb" egyszerűen
nem elérhető. A csúszka ott megáll, és a hint kimondja, miért — nem tiltunk,
csak nem hazudunk.

**A hat sor mind a VÁLASZTOTT réssel számol.** A régi lista egy világ-eltolással
dolgozott, tehát a hat sorban hat KÜLÖNBÖZŐ rés állt, és a felhasználónak fejben
kellett kikeresnie a neki tetszőt. Most fordítva: a rés adott, és a sorok azt
mutatják, mit ér ugyanaz a vállalás a hat ligában — a futás hossza, a Run-plafon,
és szürkén az, mennyivel mozdul hozzá a világ. Az egyetlen jelvény a
**🏠 ITT VAN OTTHON**: az az osztály, ahol a klubod felskálázás nélkül is a
mezőny közepe volna (`pyrHomeDivRaw`) — tájékozódási pont, nem előírás.

**MÉRVE, végig a valódi kóddal** (a `pyrStart` MENTETT `gap0`-ja, tehát az, ami
tényleg a karrierbe kerül):

| klub | liga | kért rés | beállt | világ | mentett `gap0` |
|---|---|--:|--:|--:|--:|
| Barcelona 2010/11 (88,0) | D6 | 0 | 0 | +11,0 | **0,0** |
| Barcelona 2010/11 | D6 | −3 | −3 | +14,0 | **−3,0** |
| Barcelona 2010/11 | D1 | +2,5 | +2,5 | +1,1 | **+2,5** |
| Debreceni VSC 2025/26 (69,0) | D1 | 0 | **−0,5** | −15,0 (a határ) | **−0,5** |
| Debreceni VSC 2025/26 | D6 | −2 | −2 | −6,0 | **−2,0** |

Amit beállítasz, azt kapod — egyetlen kivétellel, ahol a világ nem tolható elég
messzire, és ott a csúszka is odáig megy csak.

### Közös karrier (PvP): három számozott döntés

```
① A kezdő csapaterő   → EGY csúszka (69-88). A klublista ennek a ±1-es
                         környezetéből kínál (82 → 81-83 · PYR_BAND_HALF).
② Közös kezdő osztály → a közös tabella, ahol mindketten kezdtek.
③ A rajt nehézsége    → ugyanaz a rés-csúszka, a SÁV KÖZEPÉHEZ mérve;
                         az osztályból KÉT hely szabadul fel (két menedzser).
```

A két külön min/max csúszka megszűnt: ugyanazt tudta, csak három döntést kért
kettő helyett, és a „min > max" állapotot is kezelni kellett. A szoba-csomag
**változatlan** (`bmin`/`bmax` + `upAmt`), tehát a vendég- és a régi kliensoldal
nem érzi a változást. A vendégnél a rés a KAPOTT eltolásból fejtődik vissza
(`pyrMpGapFromUp`) — enélkül a helyi rajzoló a saját (nulla) résével némán
felülírná a házigazda döntését.

**Visszafelé kompatibilis.** A futó karrierek a világot MENTIK (`S.pyr.divs`),
tehát semmi nem mozdul alattuk. A 3.5.15 előtti mentések/szobák 0-4
**fokozatot** tároltak: egy 0-4 közti egész ma legális eltolás is, ezért a mai
kód mindenhol `upAmt` néven írja ki az eltolást, és a puszta `up`-ot csak akkor
olvassa fokozatként, ha `upAmt` nincs (`pyrUpRead`, `pyrUpFromLegacyLevel`).

## 9. Run-szint a hagyományos módban — MEGVALÓSULT

**A vezérelv (a projektgazda döntése): *egy könnyű Run nem kaphat magas
értékelést, akármilyen jól játsszák.*** A mai módban ez nem teljesült — a
nehézség a súlyozott átlag EGYIK tétele volt, tehát elég jó teljesítménnyel a
könnyű beállítás is felkúszhatott 80 fölé.

Mostantól **két szám szorzata**:

```
Run = KIHÍVÁS-PLAFON × TELJESÍTMÉNY
```

### 9.1 A plafon — tisztán a vállalásaidból

| tényező | értékek |
|---|---|
| **Kezdő osztály** | D1 ×0,55 · D2 ×0,70 · D3 ×0,80 · D4 ×0,88 · D5 ×0,94 · **D6 ×1,00** |
| **Ellenfél-tempó** | 😴 ×0,55 · 🚶 ×0,75 · 🏃 ×0,90 · 🔥 **×1,00** |
| **Saját tempó** | Alap ×0,88 · Komótos ×0,93 · Csiga ×0,97 · Gleccser **×1,00** |
| **Kezdő rés** | **holtsáv ±1,0** → ×1,00 · fölötte ×(1 − 0,075 × (rés − 1,0)), padló **×0,40** · alatta ×(1 + 0,05 × (−rés − 1,0)), mennyezet **×1,30** |

*(Az „Indulás: draft ×1,00 · kész klub ×0,95" sor **kivezetve, v3.4.20**. A draft
megszűnésével mindenkire egyformán ült — nem különbséget mért, hanem egyetemes
adó volt, ami a 100-as plafont mindenkinek elérhetetlenné tette. A rés
**+1,0-ig terjedő holtsávja** ugyanabból a kiadásból való: a mérés szerint a
+1-es rés még egyenrangú kezdés, a +2 viszont már 37%-os bajnoki esély — a
büntetés csak ott induljon, ahol a könnyebbség tényleg megjelenik, különben
maga az AJÁNLOTT osztály is büntetést kapott volna.)*

**A rés-szorzó KÉTOLDALAS lett (v3.5.08).** A projektgazda döntése: *„ha
középre lő, akkor nem kap semmi buffot nerföt. ha viszont alá vagy felé lő,
akkor kompenzáljuk."* A kezdő osztály vállalása a mód **két fő mérőszámának
egyike** (a másik a mászás sebessége), és egy csak lefelé büntető szorzó ezt
félig mérte: aki középre lőtt, ugyanazt kapta, mint aki egy nála sokkal
erősebb mezőnybe merészkedett.

Aszimmetrikus marad a **mérték**: a büntetés meredekebb (0,075/pont), mint a
jutalom (0,05/pont) — a könnyítés biztos előny, a nehezítés viszont csak
lehetőség. A szorzat pedig **1,00-nál akkor is elvágódik**: a bátor kezdés nem
visz 100 fölé, csak ellensúlyozza a többi tényező visszafogását (könnyebb
ellenfél-tempó, magasabb kezdő osztály). Ez adja a felskálázott karrier
plafonját is: Barcelonával a 4. fokozaton `−4,0` a rés → ×1,15, és a plafon 91.

| rés | −10 | −8 | −6 | −4 | −2 | −1 … +1 | +2 | +4 | +6 | +8 | +12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| szorzó | 1,30 | 1,30 | 1,25 | 1,15 | 1,05 | **1,00** | 0,93 | 0,78 | 0,63 | 0,48 | 0,40 |

**Miért kellett a rés-szorzó (v3.4.18).** A draft kivétele után az osztály
önmagában már nem mért kihívást: a hatodosztályba be lehetett volna lépni egy
élvonalbeli kerettel, és az adta volna a **legmagasabb** osztály-plafont a
**legkönnyebb** futáshoz. A rés ezt zárja le. Mérve (🏃 + alap tempó):

| klub | D1 | D2 | D3 | D4 | D5 | D6 |
|---|---|---|---|---|---|---|
| FC Barcelona (88,0) | 30 | 27 | 25 | 26 | 28 | 30 |
| Deportivo (80,6) | 41 | 53 | 58 | 57 | 56 | 54 |
| Debreceni VSC (69,0) | 41 | 53 | 60 | 66 | 71 | **75** |

Egy szuperklubbal **sehol** nem lehet magasra futni, és a „mélyről indulok egy
nagy kerettel" út sem éri meg jobban, mint az őszinte kezdés. Egy gyenge klubbal
a plafon a szokásos módon nő lefelé haladva.

**A 100 elérhető — de a klub dönti el (v3.4.20).** A legkeményebb beállításon
(🔥 Kegyetlen + Gleccser) a **172 választható klub-szezonból 39** ér el 100-as
plafont; a Barcelona **46**-ig jut, akármelyik osztályból indul. Ezt a
klubválasztó már a listában kiírja (a klubbal ELÉRHETŐ legmagasabb plafon),
az osztályválasztó pedig a teljes szorzatot mutatja, és megnevezi, melyik
tényező fogja vissza:

| klub | D1 | D2 | D3 | D4 | D5 | D6 |
|---|---|---|---|---|---|---|
| FC Barcelona (88,0) | 46 | 42 | 40 | 36 | 38 | 40 |
| Deportivo (80,6) | 55 | 70 | 80 | 84 | 83 | 81 |
| Debreceni VSC (69,0) | 55 | 70 | 80 | 88 | 94 | **100** |

Mért plafonok:

| beállítás | plafon |
|---|---|
| **legkönnyebb** — D1 + alvó mezőny + alap tempó + kész klub | **25** |
| D3 + lassan követnek + alap tempó + draft | 53 |
| **ajánlott** — D6 + lépést tartanak + alap tempó + draft | 79 |
| **legnehezebb** — D6 + kegyetlen + gleccser + draft | **100** |

**A direktíva mérve teljesül:** egy *hibátlan* futás (minden szezon 1. hely,
minden mérföldkő megvan) a legkönnyebb beállításon **99 teljesítményt** ér el
— és a Run-szintje **25**. Ugyanaz a hibátlan futás a legnehezebb
beállításon: **85,7**.

A saját tempó ezzel **kikerült a sorok közül a plafonba**, ahol a helye van:
vállalás, nem teljesítmény. Ez egyben orvosolja az auditban jelzett
aránytalanságot is (a Komótos egyetlen kattintása annyit vitt, mint a teljes
első szezon — `karrier-beallitasok-audit.md` 2.6).

### 9.2 A teljesítmény — mit mérünk a plafonon belül

| sor | súly | mit mér |
|---|---|---|
| **Az élvonalba jutás üteme** | **2,5** | a TÖKÉLETES mászáshoz mérve (lásd alább) |
| **Az első bajnoki arany üteme** | **2,5** | ua., az arany ideáljához |
| **Feljutások** | 0,2 / db | tiszta jutalom |
| **Kiesések** | — | **nem vonnak le** — a mód része, nem kudarc |
| szezononkénti helyezés | 1,0 / 0,25 | mint ma, `runRankScore` |
| taktika, hűség, mérföldkövek | mint ma | változatlan |

#### 9.2.1 Az ütem mércéje: a tökéletes mászás (v3.5.08)

**Mi volt a baj.** Az ütem-sorok a fokozat **szimulált mediánjához** mértek
(`refTop` / `refTitle`): ahhoz, amit egy átlagos futás hoz. Két hibája volt.
Egyrészt a mérce fokozatonként **más** volt, tehát a 100-as Run-sebesség nem
jelentette ugyanazt két karrierben. Másrészt a medián egy **statisztika**, nem
cél: egy „12,3. szezonos mérce" semmit nem mond arról, mi lett volna a lehető
leggyorsabb.

**A mérce mostantól a tökéletes futás**, és az egyetlen dologból következik,
ami a mászás hosszát meghatározza: a **kezdő osztályból**. A leggyorsabb
lehetséges karrier minden idényben feljut, és az élvonalba érve azonnal bajnok:

```
D5-ből indulva  →  1-4. szezon: négy feljutás (D4, D3, D2, D1)
                   5. szezon:  bajnoki cím az élvonalban
```

| kezdő osztály | D1 | D2 | D3 | D4 | D5 | D6 |
|---|---|---|---|---|---|---|
| ideális felérés | 1. | 1. | 2. | 3. | 4. | 5. |
| **ideális arany** | **1.** | **2.** | **3.** | **4.** | **5.** | **6.** |

A pontozás **arányos**, nem lineáris: `100 × ideális / tényleges`. Kétszer annyi
idő fele annyi pont — és a képlet magától skálázódik a kezdő osztállyal, tehát
egy D6-os és egy D2-es futás ugyanazon a mércén áll. Mérve (D6-ból indulva,
ideális arany a 6. szezon): tökéletes mászás → **100/100**; a 12. szezonban
felérve és a 18.-ban aranyat nyerve → **42 / 33**.

Az **ellenfél-tempó szándékosan nem szerepel** benne: azt a Run-plafon már
megfizette (`PYR_RUN_CAP.speed`), és kétszer mérni ugyanazt hiba volna. A
medián-értékek mérési adatként megmaradnak — a sor leírásában viszonyítási
pontként megjelennek.

**A SÚLY IS MEGVÁLTOZOTT: 1,0 → 2,5 soronként.** A projektgazda döntése szerint
a mód két fő mérőszáma a **sebesség** és a **kezdő osztály vállalása**; az
utóbbi a plafonban ül, az előbbi itt. Korábban a két ütem-sor 1,0-1,0 súlyt
vitt, vagyis a mód fő mérőszáma ugyanannyit nyomott, mint egyetlen szezon
helyezése — egy hosszú karrierben a sok apró sor egyszerűen elnyelte. Az új
5,0 összsúly nagyságrenddel a legnagyobb tétel (a legnagyobb egyéb sor 1,0).

**Ami kiesett a piramisban:** a „Kezdő nehézség" és a „Nehézség-belövés"
(a mezőnyt nem te állítod be — a kezdő osztály már a plafonban van), a
„Szezon-alapú Rating" (a piramisban kötelezően csúcsforma) és az
**Infinity-határidő** (nincs Infinity — a helyét a két ütem-sor vette át).

**A kihívás-szorzó is osztály-alapú lett** (`pyrChallengeMult`): D1 ×1,00 …
D6 ×0,40. A mai, abszolút Ratingre horgonyzott képlet egy végtelenbe növő
piramisban azonnal telítődne — a hatodosztály és az élvonal ugyanazt a
szorzót kapná, amint a világ 110 fölé ér.

**A felületen** a plafon külön blokkban jelenik meg, tényezőnként lebontva, és
a beállító képernyőn **már a döntés pillanatában** látszik — utólag nem
változtatható.

## 9.3 Riválisok

A véletlen sorsolás helyett a piramisban a **hozzád erőben legközelebb álló**
csapatok a riválisaid. Mivel a mezőny fejlődik, a rivális **szezononként
változik**: akit tavaly lehagytál, idén már nem az. Ugyanaz a definíció,
amit a kihívás-rendszer is használ (`chIsRivalOvr`).

## 10. A MÉRŐ — amit muszáj beépíteni

A terv maga mondja ki: *„szerintem bele kell majd építeni egy mérőt valahol"*.
Két szinten kell:

**(a) Fejlesztői mérő — kész, `tools/pyramid-sim.js`.** Ez futtatja a fenti
táblázatokat, és bármelyik paraméter átírható parancssorból:

```bash
node tools/pyramid-sim.js gaps                     # a játszható ablak
node tools/pyramid-sim.js speeds                   # a négy fokozat íve
node tools/pyramid-sim.js sweep                    # tempó-söprés hangoláshoz
node tools/pyramid-sim.js bands                    # mit tud az adatbázis
node tools/pyramid-sim.js speeds step=2.5 pace=8 seasons=30
```

**(b) Játékbeli mérő — az Infópult új sora.** Minden szezonzáráskor eltéve
egyetlen rekord osztályonként:

```js
S.pyr.log.push({s:szezon, div, rank, myOvr, divMean, gap, aiStep, myStep});
```

Ebből a HUB-ban egy sor kirajzolható („**Te +6,1 · a mezőny +5,4 · nettó
+0,7**"), és — ami fontosabb — a felhasználó **exportálni tudja** a mai
karrier-összegzés mintájára. Ezekből az adatokból lehet a négy fokozatot
valós játékon hangolni; a szimuláció csak a kiindulást adja.

---

## 11. Megvalósítási váz

### 11.0 A P2 mérése — a ligarendszer egészséges-e

`node tools/pyramid-sim.js league seasons=20` (statikus piramis, 20 szezon):

```
csapatszám osztályonként: 16 / 16 / 16 / 16 / 16 / 16   ✓ stabil
feljutás összesen: 200 · ebből azonnal visszaesett: 58  (29%)
elmozdult a kiinduló osztályától: 34/96 klub (35%)
```

A bumeráng-arány 29% (a 30–60%-os egészséges sáv alsó pereme, ami statikus
világnál várható), és a klubok harmada elmozdult a kiinduló osztályától —
tehát a világ él, de nem kaotikus.

A játékbeli kód böngészőben ellenőrizve: bajnokként feljutsz, utolsóként
kiesel, 14 vegyes szezon után is 6×16 a létszám, nulla névütközés, és a
mentés–betöltés bitre visszaadja a piramist.

### 11.1 Az állapot

```js
S.pyr = {                        /* MEGVALÓSULT ALAK */
  on:true,                       /* a hagyományos mód jelzője */
  my:6,                          /* melyik osztályban állsz */
  divs:[                         /* 6 osztály; a TIÉDBEN 15 klub + te */
    {id:1,name:"Biszem-baszom premier líg",mean:86.0,lo:84,hi:88,
     teams:[{n:"Manchester City (2022/23)",ovr:88.0,
             club:"Manchester City",season:"2022/23",raw:86.8}, …]},
    …],
  spare:{…},                     /* a klub, akinek a helyére beléptél */
  log:[{s:1,div:6,to:5,rank:1}], /* a mérő (10/b) magja */
  v:1
};
/* MÉG NINCS BENNE (P3): aiSpeed — a választott fejlődési fokozat. */
```

A `SEASON_OPPS` **változatlan alakban** áll elő: a saját osztályod 15 másik
csapata. A motor felé tehát a piramis láthatatlan — minden meccs, tabella,
kihívás és statisztika ugyanúgy fut, mint ma.

### 11.2 Hova nyúl a kód

| lépés | hol | mit |
|---|---|---|
| világ-generálás | `pyrBuildWorld()` ✅ | 96 klub, 6 osztály, rang-alapú elhelyezés, seedelt |
| szezonforduló | `startNextCareerSeason` ✅ | `pyrRollover()` — a te osztályod a VALÓS végtabellából, a másik öt `pyrSimDivision()`-nel |
| ellenféltábla | `startNextCareerSeason` ✅ | `SEASON_OPPS = pyrOpponents()` |
| mentés | `saveGame` / `applySavedGame` ✅ | `S.pyr` (~6 kB), plusz a szint önjavítása betöltéskor |
| fejlődés | `pyrDevelopWorld()` ✅ | osztályonkénti ütem, ±20% zaj, eredmény-alapú tag; a fel-/kiesés ELŐTT fut |
| Rating-plafon | `ratingCap()` ✅ | a piramisban nincs plafon (6.1b) |
| mérő | `S.pyr.log` ✅ | szezononként egy sor: erőd · a te lépésed · a mezőnyé · NETTÓ |
| kupa-nevezés | `cupTierFor` ✅ | a piramisban osztály-alapú sort ad (`PYR_CUPS`) |
| draft-merítés | `pyrDraftPick` ✅ | súlyozva a kezdő osztályod felé, padlóval |
| rejtett buff | `oppBuffFor` ✅ | `if(pyrOn())return 0;` |
| piac-horgony | `marketPeakShift` ✅ | a piramis skálájára tolt pool + 1:1 követés a növő világgal |
| szintváltás | `applyOppLevel`, `autoLevelSync` ✅ | `if(pyrOn())return false;` — a szintet az OSZTÁLYOD adja |
| Infinity | `infinityMode` ág | a piramisban nem fut |

### 11.3 Fázisok

| fázis | tartalom | mikor kész |
|---|---|---|
| **P0** | a beállítás-audit 1–5. hibája javítva | az új mód ELŐTT |
| **P1** | az egyszerű beállítómód + a négyoldalas belépés | önállóan is érték |
| **P2** | ✅ **kész** — `pyrBuildWorld`, a 6 osztály, `SEASON_OPPS` átirányítás, fel-/kiesés mind a hat osztályban, mentés. **Fejlődés nélkül**: statikus piramis. Belépés: `pyrStart(6)` a konzolból | első játszható mérföldkő |
| **P3** | ✅ **kész** — `pyrDevelopWorld`, a négy fokozat, a tempó-csatolás, az élvonali utolérés, a Rating-plafon feloldása és a beépített mérő (`S.pyr.log`) | **a mód működik** |
| **P4** | ✅ **kész** — súlyozott draft (`pyrDraftPick` + pool-eltolás) és a teljes kuparendszer (`PYR_CUPS`, FA-kupa, sávonkénti selejtező-körszám, a kupagyőzelem jutalma a következő idényre) | |
| **P5** | ✅ **kész** — Run-plafon + a piramis teljesítmény-sorai, riválisok, Infópult-lap, és a **belépő** (a karrier fajtájának választója, osztály-csúszka, fokozat-választó, a plafon élő kiírásával) | a mód elérhető |
| **P6** | hangolás valós runokból; a négy fokozat véglegesítése | |
| **P7** | ✅ **kész** — a beállítóképernyő négy oldalra bontása (`karrier-beallitasok-terv.md` 7.) | |
| **P8** | ✅ **kész** (v3.4.18) — a draft kikerült a módból, a belépő sorrendje **klub → osztály**, ajánlott osztály a klub erejéhez és a fokozathoz mérve (`pyrDivOptions`, `pyrRecommendDiv`), a kezdő rés a Run-plafonban (`pyrGapFactor`), és a kész klub kerete a piramis skálájára kerül (`pyrScaleClubPlayer`) | |

**A P3 volt a kritikus kapu, és átment.** A mért nettó mászás mind a négy
fokozatnál a 0,8 – 3,5 sávban van (1,18 … 4,32), és a fokozatok végig
megkülönböztethetők. A hangoláshoz `node tools/pyramid-sim.js live`, egy
fokozat átlövéséhez `live tier=kegyet share=0,84 top=0,92`.

---

## 11.4 KÖZÖS KARRIER (PvP) — v3.5.05

**Ami lehetővé tette:** a piramis világa a `rngFor("pyr:world")`-ből épül, az
pedig a SZOBA seedjéből — a két kliensen bitre ugyanaz a hat osztály. Nem kell
átküldeni a világot, csak négy döntést.

**Két dolog közös, és mindkettőt a HÁZIGAZDA állítja:**

| beállítás | miért közös |
|---|---|
| **Kezdő osztály** (D1–D6) | egy tabellán osztoztok, tehát nem lehet személyes döntés. A képernyő ajánlást ad a sáv KÖZEPÉHEZ mérve |
| **Kezdő klub Rating-sávja** (min–max) | e nélkül a párharcnak nincs tétje. A sáv a klublistát szűri mindkét oldalon, determinisztikusan |

Az osztályválasztó képernyő emiatt közös karrierben **nincs**: a klub
kiválasztása után egyből indul az idény.

**A mezőny 14 AI + ti ketten = 16**, pontosan annyi, amennyit a közös karrier
menetrendje amúgy is vár (28 CPU-meccs + 2 párharc = 30 forduló). Az osztályból
ezért **két** csapat lép ki, nem egy — és determinisztikusan a két leggyengébb,
nem klub-alapon. A klub-alapú kivétel ugyanis kliensenként MÁS klubot venne ki,
és a két világ némán szétnőne (a mezőnyszinted, a kupasávod és a fel-/kiesés is
a világból jön). **Ára:** ha valamelyikőtök klubja szerepel a világban is, a
neve kétszer tűnhet fel — más évjárattal. Ez a szétnövésnél kisebb rossz.

**A páros EGY entitás a fel-/kiesésnél:** a JOBBIK helyezésetek dönt, és a
rosszabbik sora kikerül a rolloverbe adott sorrendből — így 16 tabellasorból
pontosan 15 entitás lesz (14 világ-csapat + ti egyként). Együtt maradtok; a
verseny az, ki végez a másik fölött, szezonról szezonra. Ha a társad helyezése
vitt feljebb, a szezonforduló ki is mondja.

**A második ülés is költözik.** A rollover 1:1-ben cserél, tehát költözéskor az
új osztályod 15-tel maradna, az elhagyott is 15-tel. Egyetlen csere rendezi: a
félretett második csapat visszatér az elhagyott osztályba, és az újból kilép a
leggyengébb. Mérve 12 szezonon át: a saját osztály végig 14, a többi 16, a
világ összlétszáma végig **96**.

**A szezonindító alku kimarad:** a piramisban a mezőnyt az osztály adja, nem a
két javaslat számtani közepe. A csapatlap-csere marad — abból tudja meg a két
kliens egymás keretét.

---

## 12. Nyitott kérdések

1. ~~Sávnyújtás vagy adatbázis-bővítés?~~ **Eldőlt** (3.1/A + 3.3): a rang
   dönti el a helyet, a geometriát tervezzük. Az adatbázis bővítése már nem
   kötelező, de a 6 klubos tartalék vékony — 20-30 további klub kényelmesebbé
   tenné a merítést.
2. **Két hazai kupa vagy egy?** (7. pont, 1. inkonzisztencia)
3. **Kiesés az utolsó osztályból** — mi történik, ha a D6-ból esnél ki?
   Javaslat: nincs hetedik osztály, a D6 utolsó helye a padló (egy „megyei
   pokol" szezon).
4. ~~**Kész klub + osztályválasztás**~~ **Eldőlt** (2. és 9.1, v3.4.18): a
   választás **nem szűkül** — a Barcelonával el lehet indulni a
   hatodosztályból. Nem korlátozunk, hanem **árazunk**: a kezdő rés
   szorzója (`pyrGapFactor`) levágja a plafont, és a képernyő már a döntés
   pillanatában kiírja, mennyit ér az adott út. Mérve: a szuperklub sehol
   nem jut 30 fölé, és a „mélyről egy nagy kerettel" út sem éri meg jobban
   az őszinte kezdésnél.
5. ~~A draft-paradoxon melyik megoldása?~~ **Tárgytalan** (4.2 lezárása,
   v3.4.18): a draft kikerült a módból. A kódja megmarad a mérőeszköznek és a
   Run-visszajátszásnak, de a belépőn nincs út hozzá. **Karbantartás a helyén:**
   ha az adatbázis bővül, a `node tools/pyramid-sim.js bands` és `world`
   újrafuttatandó — az osztályok nyers közepe mozdul, és vele az ajánlás.
6. ~~A kiesés gyakorlatilag csak a Kegyetlen fokozaton fordul elő~~ —
   **megoldva az osztályozóval** (lásd lentebb). A 2–3. helyezett immár
   párharcot játszik a fentebbi osztály 15., illetve 14. helyezettje ellen,
   tehát gyengébb csapatok is feljuthatnak (és ott tényleg szenvednek), a
   fentiek pedig valódi kiesés-veszélyben vannak.
7. **A `PYR_STEP` és a fejlődési fokozatok együtt mozognak.** A négy
   ellenfél-tempó a 3,0-as lépcsőhöz van kalibrálva; ha a `PYR_STEP`
   változik, a `tools/pyramid-sim.js speeds step=…` futtatásával a fokozatokat
   újra kell lőni. A kettőt sosem szabad külön hangolni.
