# Hagyományos karrier — a dinamikus ligapiramis

*(Tervdokumentum. Állapot: **váz, még egy sor kód sincs belőle.** A mérőeszköz,
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

## 2. A három kapcsoló

```
① Honnan indulsz     🎲 Draft        /  🏟️ Kész klub
② Melyik osztályban  ●━━━━━━━━━━━    (6. … 1. osztály)
③ Az ellenfelek      ━━━●━━━━━━━━    😴 / 🚶 / 🏃 / 🔥
   fejlődése
```

Ezen felül a játékos **saját** fejlődési tempója a mai négy fokozat marad
(Alap / Komótos / Csiga / Gleccser) — de lásd **5.4**: ez a hagyományos módban
**nem független** az ellenfél tempójától.

Minden más rögzül: nincs Rating-alap-választás (kötelezően **csúcsforma**, mert
a világ ereje a valós kluberősségekre épül), nincs auto szintkövetés (nincs mit
követni), nincs Infinity-kapu.

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

**A javasolt beállítás:** `q = 0,15` + klubeltolás + `PYR_DRAFT_PREMIUM = 3`
konstans levonás → a kezdő rés minden osztályban **0 … +1**, azaz feljutásra
esélyes, de nem befutó újonc vagy.

**Egy független megerősítés:** a felhasználó saját tapasztalata szerint a mai
draftból válogatottakkal együtt 80–86-os csapatok jönnek ki, és a súlyozástól
76–84-et várt. A mérés `q=0,15`, válogatottakkal: nyers XI **80,8** — pontosan
a jelzett sávban —, klubeltolással 74,4. A modell tehát a valós tapasztalattal
egyezik, és az eltolás az, ami a becsült sávot a helyére viszi.

### 4.3 A többi megfontolt út

**Kész klub.** Átveszed egy valós klub kész keretét abból az osztályból, ahol
kezdesz: az erőd definíció szerint a klub ereje, a rés nulla. Immerzióban ez a
legerősebb (te vagy a Paksi FC), és korrekció sem kell hozzá. **Marad a
legegyszerűbb út — de a 4.2 után nem az EGYETLEN.**

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

Ez független megerősítése a kód saját becslésének
(`RUN_CLIMB_PER_SEASON = 10`) — azzal, hogy a valóság **~30%-kal szerényebb**,
mint amit a Run-mérő legkorábbi-Infinity referenciája feltételez. A tervezés
alapja legyen a mért **7,0**.

Két minta is látszik: a **hosszabb runok üteme lassabb** (BARSZA 8 szezon →
5,98; 757 két szezon → 7,90), tehát a fejlődés kopik; és a **magasabbról induló
run gyorsabb** (O-o' 87-ről → 8,96), mert a jobb kerethez jobb büdzsé jár.

### 5.3 A négy fokozat — szimulált ív

`node tools/pyramid-sim.js speeds` (7,0-es játékos-ütem, 3,0-as osztálylépcső,
a 6. osztályból indulva, 25 szezon, 400 karrier):

```
               fokozat |  net | élvon | mikor | bajnok| mikor |feljut|kiesés| vég-
                       |mászás| elér% | (szez)|  lett%| (szez)| db   | db   | oszt.
-----------------------+------+-------+-------+-------+-------+------+------+------
        😴 Alvó mezőny |  3,5 |  100% |   7,9 |  100% |  10,2 |  5,2 |  0,2 |  1,0
    🚶 Lassan követnek |  2,2 |  100% |  10,6 |  100% |  14,1 |  5,5 |  0,5 |  1,0
    🏃 Lépést tartanak |  1,4 |  100% |  14,3 |  100% |  18,8 |  6,0 |  1,0 |  1,0
          🔥 Kegyetlen |  0,8 |  100% |  20,9 |   47% |  24,0 |  6,8 |  1,8 |  1,0
```

| fokozat | AI-ütem a játékosé %-ában | nettó mászás | az élmény |
|---|---|---|---|
| 😴 **Alvó mezőny** | 50% | 3,5 | a mai karrier érzete — 8 szezon a csúcsig, kiesés gyakorlatilag nincs |
| 🚶 **Lassan követnek** | 68% | 2,2 | ~11 szezon a csúcsig, minden második karrierben egy kiesés |
| 🏃 **Lépést tartanak** *(ajánlott)* | 80% | 1,4 | ~14 szezon a csúcsig, ~19 az első aranyig, **átlagosan egy kiesés** |
| 🔥 **Kegyetlen** | 89% | 0,8 | ~21 szezon a csúcsig, két kiesés, és **25 szezon alatt is csak 47% esély az első aranyra** |

A 0,4-es nettó mászás (95%-os AI-ütem) már **átbillen**: a szimuláció szerint a
karrierek 98%-a el sem jut az élvonalig 25 szezon alatt, és a végosztály
átlaga 2,5 — vagyis a piramis középső harmadában ragad. Ez a **sáv alsó
határa**: 0,7 alá nem érdemes menni.

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
nagyobb). Az élvonalban az AI-ütem a **játékos ütemének 92%-a**, a legalsó
osztályban a beállított fokozaté; a kettő közt lineáris.

```
share(osztály) = share[fokozat] + (0,92 − share[fokozat]) × (6 − osztály)/5
```

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

**Javaslat a hagyományos módra:** `oppBuffFor` **mindkét tagja kikapcsolva**
(0-t ad vissza). Az AI-fejlődés váltja ki a szerepét, és ez az EGYETLEN pont,
ahol a rejtett bónusz és a nyílt fejlődés nem duplázódik. A mai módban semmi
nem változik.

Ha mégis kell fék, akkor **csak a mért tag maradjon, feleakkora súllyal**
(0,25), és a fix tag mindenképpen essen ki — az utóbbi a 84-es abszolút
horgonya miatt egy önmagához képest mérő piramisban értelmezhetetlen.

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

## 7. Kupák

A terv szerinti szerkezet, a mai `S.euro` kampánymotorra ültetve
(`euroLam`, `endEuroCampaign`, a 32 csapatos főtábla, `RUN_CUP_W`):

| osztály | hazai kupa | nemzetközi |
|---|---|---|
| **D1** (premier líg) | FA-kupa, **selejtező nélkül**, egyből a top 32 | 1–3. hely: **BL** selejtező nélkül · 4–5.: **EL** · 6.: **KL** · **FA-kupa-győztes: BL** |
| **D2** (másodosztály) | FA-kupa, **4 körös selejtezővel** | — |
| **D3** (NB I) | Magyar Kupa, **akárhányadik helyről** | 1\.: **BL-selejtező** · 2\.: **EL-selejtező** · 3\.: **KL-selejtező** · MK-győztes: a **következő** idényben BL-selejtező |
| **D4** (NB II) | Magyar Kupa, **az első 3 helyezett** | — |
| **D5–D6** | — | — |

A selejtező mind a háromnál **4 mérkőzés**, oda-visszavágóval, és a kiesés
**alacsonyabb sorozat selejtezőjébe ejt** (BL→EL→KL), nem ki a kupából.

**Két inkonzisztencia a tervben, döntést igényel:**

1. **Kétféle hazai kupa** szerepel: „Magyar Kupa" (D3–D4) és „FA-kupa"
   (D1–D2). Ha ez szándékos (a piramis felső fele más országé), akkor a
   D2→D3 mozgás **kupát is vált** — az érdekes, de a mérföldkövek
   (`RUN_MILESTONES.mk_*`) csak az egyiket ismerik. Ha nem szándékos, egy
   kupanév legyen, sávonként más nevezési joggal.
2. **A D1 FA-kupa-győztes BL-t kap, de a D3 MK-győztes csak a KÖVETKEZŐ
   idényben.** Ha ez tudatos (a felsőbb liga azonnal jutalmaz), érdemes
   kiírni; ha nem, egységesíteni kell — különben a szabály véletlenszerűnek
   hat.

**Amit a mai kódból örökölhetünk:** az `euroDominance()` (mennyire uraltad a
szezont) továbbra is jó jelzés, de a bemenete változik: a `base` ne
`oppTargetRating` legyen, hanem **a saját osztályod középértéke**. Így egy D3
bajnok nem a D1 mércéjével mérve „nem uralta" a szezont.

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

## 9. Run-szint a hagyományos módban

A mai `runBreakdown` sorai közül a **beállításokhoz kötöttek eltűnnek**
(nincs nehézség-belövés, nincs Rating-alap-vállalás, nincs Infinity-határidő),
és a helyükre a piramis saját mércéi lépnek:

| sor | súly | pont |
|---|---|---|
| **Kezdő osztály** | 1,0 | minél lentebb kezdtél, annál több (D6 = 100, D1 = 40) |
| **Az ellenfelek tempója** | 1,0 | 😴 25 · 🚶 55 · 🏃 80 · 🔥 100 |
| **Vállalt fejlődési tempó** | 0,25 / 0,5 / 0,75 | mint ma, de a 2.6-os arányon (lásd audit) |
| **Az élvonalba jutás üteme** | 1,0 | a szimulált medián a mércéje: a fokozat mediánjánál (pl. 🏃 = 14) 100 pont, szezononként −6 |
| **Az első bajnoki arany üteme** | 1,0 | ua., a fokozat arany-mediánjához mérve |
| **Szezononként** | 0,25 | a helyezés az OSZTÁLYON belül, `runRankScore` |
| **Kiesések** | — | **nem vonnak le** — a kiesés a mód része, nem kudarc |
| **Mérföldkövek** | 0,04–0,1 | mint ma |

A **kihívás-szorzó** (`runChallengeMult`) helyére az **osztály** lép: egy
D1-beli bajnoki cím többet ér, mint egy D5-beli. A mai képlet abszolút
Rating-szintre horgonyoz (70…110), ami egy végtelenbe növő piramisban
elszalad — helyette `1 − (osztály−1)×0,12`, azaz D1 = 1,00 … D6 = 0,40.

---

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

### 11.1 Az állapot

```js
S.pyr = {
  on:true,                       /* a hagyományos mód jelzője */
  k:1.7,                         /* a sávnyújtás szorzója (3.1/A) */
  divs:[                         /* 6 osztály, a világ generálásakor egyszer */
    {id:1,n:"Biszem-baszom premier líg",
     teams:[{club:"FC Barcelona",season:"2010/11",ovr:88.0}, …]},
    …],
  my:{div:6,idx:0},              /* hol vagy */
  aiSpeed:"tarto",               /* a választott fokozat */
  log:[]                         /* a mérő (10/b) */
};
```

A `SEASON_OPPS` **változatlan alakban** áll elő: a saját osztályod 15 másik
csapata. A motor felé tehát a piramis láthatatlan — minden meccs, tabella,
kihívás és statisztika ugyanúgy fut, mint ma.

### 11.2 Hova nyúl a kód

| lépés | hol | mit |
|---|---|---|
| világ-generálás | új `pyrBuildWorld()` | 96 klub, 6 osztály, sávnyújtás, seedelt |
| szezonindítás | `startNextCareerSeason` | `SEASON_OPPS = pyrMyDivision()` |
| szezonzárás | `endSeason` után | `pyrDevelopWorld()` → `pyrPromoteRelegate()` |
| kupa-nevezés | `cupEntryFor` | a piramis táblájából, nem `CUP_TIERS`-ből |
| rejtett buff | `oppBuffFor` | `if(S.pyr&&S.pyr.on)return 0;` |
| piac-horgony | `marketPeakShift` | `careerBaseRating` helyett az osztály középértéke |
| szintváltás | `applyOppLevel`, `autoLevelSync` | `if(S.pyr&&S.pyr.on)return false;` |
| Infinity | `infinityMode` ág | a piramisban nem fut |

### 11.3 Fázisok

| fázis | tartalom | mikor kész |
|---|---|---|
| **P0** | a beállítás-audit 1–5. hibája javítva | az új mód ELŐTT |
| **P1** | a két csúszkás egyszerű mód + a négy oldalas belépés | önállóan is érték |
| **P2** | `pyrBuildWorld` + a 6 osztály + `SEASON_OPPS` átirányítás; **fejlődés és fel-/kiesés nélkül** — egy statikus piramis, ami már játszható | első játszható mérföldkő |
| **P3** | `pyrDevelopWorld` + fel-/kiesés + a mérő (10/b) | itt dől el, működik-e a mód |
| **P4** | kupák a piramis szabályai szerint | |
| **P5** | Run-szint a 9. pont szerint, riválisok, Infópult | |
| **P6** | hangolás valós runokból; a négy fokozat véglegesítése | |

**A P3 a kritikus kapu.** Ha az ott mért nettó mászás nem esik a
0,8 – 3,5 sávba, a fokozatokat kell újralőni — a `tools/pyramid-sim.js`
`sweep` parancsa pont ehhez van.

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
4. **Kész klub + osztályválasztás** — ha kész klubbal indulsz, a klubod
   *saját* Ratingje meghatározza, melyik osztályba illik. Engedjük-e, hogy a
   Barcelonával a hatodosztályban kezdj (azonnali 5 feljutás), vagy a
   klubválasztás **szűkítse** a választható osztályokat?
5. **A draft-paradoxon melyik megoldása** (4.1: a, b vagy c)? A dokumentum a
   **(a) kész klub alapértelmezést + (b) ellensúlyozott draftot** javasolja
   párban — de ha a draft marad a fő út, a (b) rés-konstansait ki kell mérni
   és karban kell tartani, valahányszor az adatbázis bővül.
6. **A `PYR_STEP` és a fejlődési fokozatok együtt mozognak.** A négy
   ellenfél-tempó a 3,0-as lépcsőhöz van kalibrálva; ha a `PYR_STEP`
   változik, a `tools/pyramid-sim.js speeds step=…` futtatásával a fokozatokat
   újra kell lőni. A kettőt sosem szabad külön hangolni.
