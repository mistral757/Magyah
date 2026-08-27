# Összhang — a modell

**Állapot:** 🟢 **F1–F7 kész** — csak az F8 (az első keret saját képernyője)
és az F9 (hangolás) van hátra · **Verzió:** 3.8.05

*(Terv és ütemterv: `docs/osszhang-rendszer-terv.md`. Érintett kód: a
`BOND_*` konstansok, `bondKey/bondRaw/bondOf/bondSet/bondAdd/bondCapOf`,
`bondRoleMult/bondTacticMult/bondPersonMult/bondPassMult/bondTrainMult/
bondCatchMult/bondDamp`, `bondMatchTick`, `bondStartIntegration/bondRevealNew`,
`bondSeedFirstSquad/bondSeedValue/bondSeedConflict`, `bondPrune`,
`bondChemComplete`, `teamBond/bondPairWeight/playerBond`, `bondMigrate`,
`bondOvrMod/bondMoraleTerm` + a `buildMatchSnapshot` `bondMod` tagja.)*

---

## 1. Egy mondat

> Az összhang azt méri, **mennyire ismerik egymást** a játékosaid: két ember
> között 0–99, kizárólag **közösen pályán töltött mérkőzésekből** gyűlik, és a
> távozással megsemmisül.

**Nem morál.** A morál azt mondja meg, hogy *érzik* magukat — eredményre
ugrál, egy rossz sorozat elviszi. Az összhang azt, hogy mennyire *ismerik*
egymást — idényekben mérhető, és csak akkor vész el, ha valaki elmegy.

---

## 2. Hol tart

| | |
|---|---|
| **F1** ✅ | a modell: a kötések épülnek, mentődnek, mérhetők |
| **F2** ✅ | a szám **hat**: nulla-középpontú tag a csapaterőben, az összhang **átvette a morál „kémia" bemenetét**, és bekerült a **meccs-erőbe** — így a nehézségi ajánlások is látják |
| **F3** ✅ | **megszólal a döntéseknél**: eladási és vásárlási megerősítő, beilleszkedés a keretlistán és a játékos lapján, meccs utáni jelentés (ez hozta az **F5** magját is) |
| **F3b** ✅ | **megszólal a közvetítésben**: kezdőrúgás, gól, fokozatlépés a lefújás után |
| **F4** ✅ | **összhangtérkép** a pályaképen, hét fokozattal |
| **események** ✅ | átigazolási **csapatépítés** és öltözői **összhang-események** |
| **F6** ✅ | **összhangépítés** — a második menedzser-sáv az edzés mellett |
| **F7** ✅ | **a Csapatkovács** végre azt csinálja, amiről a neve szól |
| **kapitány** ✅ | az összhang a kapitányválasztás **negyede** — a kézi ajánlásban és az automatikus váltóban is |
| F8 · F9 | az első keret saját képernyője, hangolás |

---

## 3. A párkémia MEGMARAD, és nem olvad be

Ez volt a tervezés legfontosabb döntése. A párkémia (`S.chemPairs`) minden mai
hatásával együtt életben marad: gólsúly, csapat-λ, taktika-begyakorlás,
`chemPairsDone` kihívás, pályavonal, skill-pörgetés promptja.

| | **párkémia** | **összhang** |
|---|---|---|
| ki hozza létre | **TE** választod a párost a jutalom-soron | magától, a közös percekből |
| jellege | diszkrét, öt fázis | folytonos, 0–99 |
| mit ad | saját, kimért hatások | egyetlen csapatszám (F2-től) |

**A híd köztük:** egy elkészült (5/5) párkémia **+25 összhangot** ad annak a
párnak (`bondChemComplete`). És mivel a meccsek csak **88-ig** visznek el
(lásd 5.3), a legfelső fokozatra **kizárólag párkémiával lehet feljutni**. A
két rendszer így egymást erősíti, nem duplikálja.

---

## 4. Két külön csatorna — a modell gerince

A bejelentés hét ráható tényezőt sorolt egy kalap alá. Ezek **fele építési
sebesség, fele olvasási súly**, és ez nem szőrszálhasogatás:

| tényező | **építési ütem** | **olvasási súly** |
|---|---|---|
| kémiaépítés | ✅ +25 elkészültekor | — |
| közös múlt | ✅ kezdőérték | — |
| személyiség | ✅ szorzó | — |
| pozíciók | ✅ szorzó | ✅ pályatávolság |
| taktika | ✅ szorzó | ✅ szerep-pár |
| felállás | — | ✅ a súlyokon át |
| összhangépítés (F6) | ✅ szorzó | — |

**Miért így.** Mert a felállás az OLVASÁSI oldalon ül, a csapatszám **azonnal**
reagál, amikor két embert felcserélsz. Ha az építési oldalon ülne, a
felállás-változtatás hatása három hónap múlva jelenne meg — az nem
visszajelzés, az zaj.

---

## 5. Az építési oldal

### 5.1 Mikor épül

`bondMatchTick` a **lefújásnál** fut, ugyanabból a halmazból (`playedAll`),
amiből a pályára lépés könyvelődik — **egy hely, egy igazság**: aki pályára
lépett, az épített. A padon ülő társsal töltött idő nem összhang.

A poszt-térkép a kezdő helyekből indul, és a csere UTÁNI állapottal írja felül:
a becserélt ember a saját helyén számít, a lecserélt azon, ahol játszott.

### 5.2 A szorzók

```
Δ = 0,95 × devTempo()
  × poszt        szomszéd 1,35 · szomszédos sor 1,15 · két sor 0,85 · kapus↔csatár 0,65
  × taktika      1,5 ha a pár szerepe a TACTICS[].chemRoles listáján van
  × edzés        fő 1,8 · másodlagos 1,3 · nem edzett 0,8   (F6-ig mindig 1)
  × személyiség  együttműködés · vezetés · temperamentum (lásd 5.4)
  × passz        a két Passz átlaga → 0,90–1,15
  × élmény       győzelem 1,25 · vereség 0,90
  × gólpassz     2,0, ha AZNAP egymásnak adtak gólpasszt
  × felzárkózás  1,8, amíg az érkező 50 alatt van (lásd 6.2)
  × csillapítás  ((88 − v) / 88)^1,6
```

A `devTempo()` nem díszlet: az európai kupa fele, a felkészülési kupa negyed
tempón megy, az Infinity lassít — az összhang **nem szaladhat el** az egyetlen
rendszerként, ami ezeket nem veszi figyelembe.

**Törtrészben gyűlik, egészben tárolódik.** A maradékot a pár viszi tovább
(`S.bondFrac`), különben a kis szorzók (távoli poszt, rossz személyiség)
örökre elvesznének a kerekítésben.

### 5.3 A csillapítás, és miért 88 az aszimptota

Csillapítás nélkül **minden pár 99-re futna**, és a szám elveszítené a
jelentését: egy tíz éve együtt játszó tengely ugyanannyit érne, mint egy
tavaly összerakott.

A görbe **nem a plafonhoz tart, hanem a 88-hoz**. Ez a rendszer kimondható
szabálya: **a meccsek 88-ig visznek el, a maradék tizenegy pontot csak a
párkémia hozhatja meg.**

**Mérve** (szomszédos védőpáros, semleges személyiség, döntetlenek):

| meccs | 15 | 30 | **60** (2 idény) | 90 | **150** (5 idény) | 250 | 500 |
|---|---|---|---|---|---|---|---|
| összhang | 20 | 34 | **51** | 61 | **71** | 79 | 84 |

### 5.4 A személyiség végre kap szerepet

A három Hattrick-tulajdonság eddig gyakorlatilag dísz volt. Itt lesz belőle
mechanika:

* **Együttműködés** — mindkettőjüké számít, **mértani középpel**: egy bajkeverő
  rontja a párt, de nem semmisíti meg (0,72 → 1,30).
* **Vezetés** — **aszimmetrikus**: elég, ha az egyikük vezéregyéniség (max, +5%/fok).
* **Temperamentum** — két Lobbanékony együtt ×0,78; két Kiegyensúlyozott ×1,06.

**Mérve** (azonos poszt, azonos taktika, 60 meccs — csak a személyiség más):

| pár | 60 meccs után |
|---|---|
| kiváló ↔ semleges | **66** |
| semleges ↔ semleges | 61 |
| bajkeverő ↔ semleges | 54 |
| rossz ↔ lobbanékony | 53 |

---

## 6. Az érkező

### 6.1 A nyolc meccs

A `markArrived` **minden** igazolási úton lefut (vásárlás, klub-szemle, ingyen
token, akadémia, csere), ezért a beilleszkedési ablak ott indul — nem az egyes
vásárlási ágakban.

Amíg tart, az érkező **minden** kötése egységesen **15**. Ez szándékosan a
beállt csapat átlaga alatt van: az új ember a nyolc meccse alatt **lehúzza a
csapatszámot**, és ez nem hiba, hanem a rendszer lényege — az igazolásnak ára
van a pályán is.

**A számláló az Ő meccseit számolja, nem a csapatéit.** Egy cserejátékos
különben fél idényig az ideiglenes értéken ragadna.

**Mérve** (a kezdő 11-be tett igazolás egy 90 meccset lejátszott keretbe):

```
csapatszám előtte 64,6  →  utána 61,0        ← lehúzza, ahogy kell
1:15* 2:15* 3:15* 4:15* 5:15* 6:15* 7:15* 8:15* 9:27
8 meccs után a valódi értékei: 17 / 26 / 27 / 22     (sáv 0–33)
```

### 6.2 A felzárkózás

A nyolcadik meccs után **50-ig 1,8-szeres ütemben** zárkózik (`S.bondFast`).
A jelző 50 fölött magától hatástalan, és lekapcsol, amint a legkisebb kötése
is átlépte — így nem ragad rá egy tíz éve itt játszó emberre.

**Mérve:** nulláról 30 meccs — sima **31**, felzárkózással **45**.

### 6.3 Aki hazatalál

Ha a párnak **közös múltja** van (együtt játszottak egy valós klubban), a
kezdőérték nem a 0–33-as sávból jön, hanem **50-ig** mehet. Közös nemzetiség
a sáv felső felébe emel.

**Kész klub indulásnál a kiinduló klub NEM számít közös múltnak** — ott
mindenki onnan jött, tehát nem mond semmit. Ugyanaz a csapda, amit a
kémia-elemzés már egyszer megfogott: a `clubStartChemPairs` épp ezért szűkíti
három kötésre, a `CHEM.total`-t pedig 5–15-re. Minden **más** közös klub
viszont számít.

---

## 7. A konfliktus PLAFON, nem negatív szám

Az induló elemzés ismeri a feszült párost (rivális klubokból jövők, 75%-ban).
Egy tisztán pozitív skála ezt elveszítené — de a megoldás **nem** negatív
összhang: az egy második előjelet vinne a rendszerbe, és a csapatszám
értelmezhetetlen lenne.

Helyette **plafon** (40): a feszült pár együtt is játszhat, épül is köztük
valami, de 40 fölé nem jut. Egy szám marad, a dráma megvan.

Két forrás, **egy olvasó** (`bondCapOf`):

* **tárolt** — a rivális párok az induló elemzésből (`CHEM.badPairs`, most
  került be a mentésbe), és a később érkezőkre a `bondSeedConflict`
  ugyanazzal az aránnyal (`CHEM_RIVAL_GOOD_P`) sorsol;
* **számolt** — Bajkeverő + Lobbanékony. Ez nem sorsolás, hanem a meglévő
  adatból következik, tehát nincs mit tárolni.

**Mérve:** bajkeverő + lobbanékony, 400 meccs együtt → **40**.

---

## 8. Az olvasási oldal

```
teamBond = Σ(w · bond) / Σ(w)      a PÁLYÁN lévő 11 → 55 pár

w = pályatávolság (1,6 közel … 0,7 távol) × 1,4 ha a taktika szerep-párja
```

A `liveXI()` mondja meg, ki van most a pályán — ugyanaz a forrás, amit az
„aktuális csapaterő" is használ (3.7.42), tehát a kiállított és a busszal
beállt ember itt is helyesen esik ki.

**Mérve** (négy ember, mind 50-en, egy párt 90-re emelve):

| | csapatszám |
|---|---|
| mind 50 | 50,0 |
| a **szomszédos** pár 90-en | **57,1** |
| a **távoli** pár 90-en | 55,1 |

`playerBond(név)` adja a játékos csapat-összhangját és a három legerősebb
személyes kötését — ez az F5 játékoslapjának a bemenete.

---

## 9. Tartósság

**Törlés.** Aki kikerül a keretből, azzal minden kötése megszűnik. A `bondPrune`
a `pruneChemistry` **belsejéből** fut, nem a hívási helyekről — így egy
távozási út se maradhat ki.

**Mentés.** `bonds` · `bondCap` · `bondFrac` · `bondNew` · `bondFast` ·
`bondsSeeded` · `bondTrain`, plusz a `CHEM.badPairs`. Lapos, szám-értékű
objektumok: egy 28 fős keret 378 párja néhány kB.

**Migráció.** Régi mentésben nincs összhang — és **nem nullázunk**: a meglévő
párkémiából vetünk magot (kész kötés 55, épülő fázisonként 8), a többi párt
pedig ugyanazzal az induló elemzéssel töltjük fel, mint az első keretet. Egy
futó karrier tehát nem veszít, és nem is kap ingyen érett csapatot.

---

## 10. Mérés — végponttól végpontig

Valódi karrier-állapoton (kész klub indulás, 16 fős keret, valódi felállás és
poszt-térkép):

```
1. INDULÓ ELEMZÉS: 91 pár · átlag 28 · min 13 · max 38
   feszült pár plafonja 40 · csapatszám a felállásból 28,1

2. 90 MECCS UTÁN a csapatszám: 1:28,3 · 15:39,2 · 30:47,5 · 60:58,0 · 90:64,6

3. ÉRKEZŐ a kezdőbe: 64,6 → 61,0 · 8 meccs után felzárkózik · 59,6

4. MENTÉS → BETÖLTÉS
   kötések száma ✅ · értékek összege ✅ · felzárkózók ✅
   plafonok ✅ · elemzés lefutott ✅

5. MIGRÁCIÓ (régi mentés): 91 pár magvetve
   kész párkémia (5/5) → 55 · a többi az induló elemzésből, nem nulláról
```

Oldalhiba egyik futáson sem volt.

---

## 10b. F2 — a meccsbe kötve

### 10b.1 A tag

```
bondMod = clamp( (teamBond − 55) / 32 × 2,5 ,  −1,5 , +2,5 )
```

**Nulla-középpontú, és ez nem stíluskérdés.** Ha a tag egyenesen a 0–99-es
számból jönne, minden karrier rejtett hendikeppel indulna (egy friss keret
25–30 körül áll), és a nehézség évről évre magától csökkenne — miközben a
ligaszint, a büdzsé és a kihívás-kalibráció mind a mai görbére van hangolva.
A referencia (55) a „beállt" csapat: ott a tag pontosan 0, tehát egy szokásos
keret a mai értékeken játszik.

**A nagyságrend a szomszédaihoz igazodik:** a morál tagja ±2,5, a kiállítás
2,5 (`SIM.REDMATCH`). Szétesett öltöző ≈ egy emberhátrány; tíz éve együtt
játszó csapat ≈ egy jó edző.

**A sáv aszimmetrikus, és a padló MÉRÉSSEL került a helyére.** −1,8-nál a
friss keret együtt (a morálon át jövő résszel) −2,10-en állt: egy teljes
emberhátrány végig az első idényben, ráadásul mellé 30%-kal több
elvágyódás-esemény. Ez a karrier legnehezebb szakaszában sok. −1,5-tel az
összesített padló −1,8 — érezhető, de nem tesz tönkre egy kezdést.

### 10b.2 A párharc-csapda itt magától meg van oldva

A tag a `buildMatchSnapshot` **`ovr` összegébe** kerül, az pedig egyetlen
számként utazik a pillanatképben. Nincs olyan út, amin a számoló fél
összhangja a társa csapatára ülhetne — pontosan az a hiba, ami a
`styleOwnGoalMult()`-tal egyszer már megtörtént. A `teamBond` és a `bondMod`
külön mezőként is megy, de csak a közvetítésnek.

**Mérve:** 70-es összhangnál `ovr` 71,46, 25-ösnél 68,52 — a különbség 2,94,
betűre a két tag különbsége. Sorosítás után változatlan.

### 10b.3 A morál „kémia" bemenetét az összhang vette át

A `computeMoraleTarget` eddig a `CHEM.total`-lal számolt: egy **álló szám**,
ami a keret megalakulásakor egyszer eldőlt, és soha többé nem mozdult. Két
öltözői szám ugyanabból a dologból táplálkozott, és az egyikük halott volt.

A sáv **szűkebb**, mint a régi kémiáé (±18 helyett −10…+12): az összhang már
közvetlenül is hat a csapaterőre, tehát a morálon át csak **hangolnia** szabad,
nem duplán ütnie. A célérték amúgy is csak idénykezdetkor számolódik újra —
szezononkénti pillanatkép, nem meccsről meccsre halmozódó hatás.

Ugyanez a forrás hajtja az **elvágyódás- és identitásválság-kockázatot**
(`chemMoraleRiskFactor`): egy álló kémia-számmal hajtani az események
kockázatát, miközben a morált már az élő összhang adja, két különböző világot
írna le ugyanarról az öltözőről.

### 10b.4 A karrier íve — mérve

Draft-indulás, 30 meccs/idény, végig ugyanaz a tizenegy:

| idény | összhang | csapaterő-tag | morál-cél | morálból | **együtt** |
|---|---|---|---|---|---|
| 0 | 24,9 | −1,50 | 44 | −0,30 | **−1,80** |
| 1 | 44,8 | −0,80 | 50 | 0,00 | **−0,80** |
| 2 | 56,2 | +0,09 | 54 | +0,20 | **+0,29** |
| 3 | 63,3 | +0,65 | 57 | +0,35 | **+1,00** |
| 5 | 71,6 | +1,30 | 60 | +0,50 | **+1,80** |
| 7 | 76,2 | +1,66 | 62 | +0,60 | **+2,26** |
| 10 | 80,1 | +1,96 | 63 | +0,65 | **+2,61** |

**A nullát a 2. idényben lépi át** — ez a szándék: az első két idény
nehezebb a mainál, onnantól könnyebb, és a karrier egésze nagyjából ott marad,
ahol ma van.

Gólvárhatóságban (azonos erejű ellenfél ellen):

| | várható gól | ellene |
|---|---|---|
| szétesett keret (−1,5) | 1,13 | 1,49 |
| beállt (0) | 1,30 | 1,30 |
| tíz éve együtt (+2,34) | 1,60 | 1,05 |

### 10b.5 Ahol látszik

* **A csapaterő-sáv alatt:** `· összhang 61,7 (+0,5 csapaterő)`. A sáv **számát
  nem írja át** — a csapaterő továbbra is a tizenegy ereje —, de kimondja a
  rejtett tagot. Enélkül a menedzser csak annyit látna, hogy a meccsek jobban
  mennek, és nem tudná, miért.
* **Az Infó fülön** a régi „Öltözői kémia" sor helyén a **Csapat-összhang**.

**A KIJELZETT szám élő, a MECCSÉ befagy.** A motor egész `ovr`-je a
kezdőrúgásé (a morál tagja is), a sáv viszont a pályán lévő tizenegyet
követi. Ez így helyes: a sáv azt mutatja, hol tartasz, a meccs azzal számol,
amivel kifutottál.

### 10b.6 Ami változatlan maradt

| helyzet | viselkedés |
|---|---|
| klasszikus mód | `bondOvrMod` = **0** — a rendszer nem létezik |
| karrier, draft közben (nincs még elemzés) | `bondOvrMod` = **0**, a morál a **régi** `CHEM.total×1,2` ágon |
| régi mentés, üres tárak | minden hívás lefut, hiba nélkül |

---

## 10c. A nehézség tud róla (3.8.02)

### 10c.1 Egy sor a meccs-erőben

A `hiddenMatchBonus()` a `buildMatchSnapshot` `ovr`-jének a **tükre**: ami ott
tag, annak itt is tagnak kell lennie. Enélkül az auto szintkövetés és a
nehézség-tanácsadó egy olyan csapatot mért volna, ami nem létezik — és a hiba
pont a **rossz irányba** nőtt: a friss keret alá-, a tíz éve együtt játszó
fölébecsülve.

Ez az egyetlen sor teszi, hogy az **automatika**, a **kézi tanácsadó**, a
`levelWarnState` és a **kihívás-kalibráció** mind ugyanazt az igazságot lássa.

**Mérve** (92,4-es keret, „Kiegyensúlyozott" cél-sáv):

| összhang | meccs-erő-bónusz | rés a 88-as mezőnyhöz | az automatika ajánlana |
|---|---|---|---|
| 25 | −3,23 | +0,7 | **85** |
| 55 | −1,73 | +2,2 | 86 |
| 70 | −0,56 | +3,3 | 87 |
| 85 | +0,62 | +4,2 | **88** |

Az érettebb csapat tehát erősebb mezőnyt kap — a rendszer nem hagyja, hogy a
karrier magától könnyebbé váljon.

### 10c.2 Az ajánlott kezdő mezőny lejjebb került

Egy frissen összeállt keret 25 körüli összhanggal indul: a meccs-erőben −1,5,
a morálon át további −0,3 — az **első idény nagyjából két rating-ponttal
nehezebb**, mint a rendszer előtt volt. Az ajánlásnak ezt tükröznie kell,
különben a „🎬 ajánlott" épp a legsérülékenyebb idényben hazudik.

| | régi | **új** | miért |
|---|---|---|---|
| dinamikus · **kész klub** | 80 | **79** | az összhang-gödör |
| dinamikus · **draft** | 84 | **82** | ott **kétszer** fizetsz: az összhang mellé a morál is alacsonyabban indul (a `computeMoraleTarget` +10-es `clubBonus`-a csak a kész klubnak jár) |
| hagyományos (piramis) · ajánlott rés | +2 | **+3** | a mód is kész klubbal indul, tehát ugyanaz a gödör; a MÁSZÁS ígérete marad, csak nem indul kétszeres hátrányból |

### 10c.3 A kézi csúszkának neve van

A csúszka eddig a **liga** nevét mondta ki („84 · NB I"). Az megmondja, milyen
szintű a mezőny — de nem azt, hogy **neked** milyen lesz ott a szezon. Egy
84-es mezőny egy 78-as kerettel reménytelen, egy 92-essel sétagalopp; a
csúszkán mindkettő ugyanazt a feliratot kapta.

A név a **résből** jön (meccs-erő − mezőny), tehát az összhangot is
tartalmazza. A szavak szándékosan ugyanazok, amiket az auto szintkövetés
cél-sávjai használnak — **egy szótár, két helyen**. Ugyanez a függvény adja a
csúszka alatti tippsort is, ami korábban egy külön, ötfokú listából dolgozott
és el tudott csúszni tőle.

| rés | név |
|---|---|
| ≥ +7,5 | Sétagalopp |
| +6,5 | Megengedő |
| +5,5 | Kényelmes |
| +4,5 | Magabiztos |
| +3,0 | **Kiegyensúlyozott** |
| +1,5 | Kihívást jelent |
| 0,0 | Szigorú |
| −2,0 | Kemény |
| −5,0 | Kegyetlen |
| alatta | Reménytelen |

**Mérve** (92,4-es kerettel): 76 → Sétagalopp · 84 → Magabiztos · 86 →
Kihívást jelent · 88 → Szigorú · 90 → Kemény · 92 → Kegyetlen · 94-től
Reménytelen.

### 10c.4 Egy hiba, amit a mérés fogott meg

A `diffSliderLabel` a beállító képernyő **induló feliratát** is írja, tehát
**betöltés közben lefut** — a `gameMode` viszont a fájl legvégén deklarált
`let`. Az első változat őrizetlenül olvasta, és ezzel `ReferenceError`-ral
**megállította az egész szkriptet**: a lap üresen jött be. Sem a `node --check`,
sem az `eslint no-undef` nem fogja meg az ilyet; a fejetlen böngésző igen.
A javítás a kódbázis bevált mintája (`try/catch`, mert a `typeof` nem véd a
holt zónában).

---

## 10d. F3 — amit a menedzser lát

A rendszer bejelentett célja — *„komolyabb súlyt adna az új igazolásoknak"* —
pontosan itt teljesül vagy bukik: ha a szám számol, de a **döntés
pillanatában** nem szólal meg, akkor a menedzser továbbra is csak Ratinget és
árat lát.

### 10d.1 A hét fokozat

Ugyanaz a skála, amit majd az F4 pályatérképe rajzol — itt még csak szóban.
Egy szótár, több felület.

| érték | név |
|---|---|
| 92+ | Elválaszthatatlan |
| 78+ | Vakon megtalálják |
| 63+ | Erős kötés |
| 47+ | Összeszokott ← az „erős" küszöb |
| 30+ | Ismerik egymást |
| 15+ | Épülőben |
| alatta | Idegenek |

### 10d.2 Eladáskor: mi vész el vele

A megerősítő eddig annyit mondott, hogy *„a felépített kémiája is elvész"* —
szám nélkül. Márpedig egy tíz éve itt játszó ember eladása pont attól fáj,
hogy a kötései **nem költöznek vele**: a vevő a Ratinget kapja meg, te a
kapcsolatokat veszíted.

```
🤝 Az összhangja itt marad — nélküle. Csapat-összhangja 73,7,
   ebből 10 erős kötés szűnik meg.
   A legerősebbek: P. Maldini 77 · Lahm 76 · Platini 76
   A kötés két EMBER között van: az utódnak nulláról kell felépítenie,
   és nyolc meccsig ideiglenes értéken áll.
```

Aki még beilleszkedik, arról ezt **nem** írjuk ki — nála nincs mit elveszíteni,
és a panel ezt ki is mondja.

### 10d.3 Vásárláskor: mennyit esik a csapatszám

A becslés **őszinte**: kiszámoljuk, mi lenne a csapatszám, ha a jövevény
belépne a tizenegybe. A cserélt ember a **leggyengébb összhangú** kezdő — ez a
legkedvezőbb eset, tehát a becslés nem ijesztget.

```
🤝 Beilleszkedés: az első 8 meccsén mindenkivel ideiglenes 15-ös összhangon
   áll. Ha Jasin helyére áll be, a csapat-összhang 73,7 → 64,9
   (−8,8, csapaterőben −0,69). Utána 50-ig gyorsítva zárkózik fel.
```

### 10d.4 A beilleszkedés folyamata — jelzés a 4. meccstől

A nyolcadik meccs egy **szakadék**: 15-ről lehet 4-re esni. Ha a menedzser
semmit nem lát belőle előre, az nem leleplezés, hanem csapás.

**Az irány nem sorsolás:** a játékos addigi teljesítményéből (gól, gólpassz,
együttműködés) olvassuk — amit a jelzés ígér, azt a leleplezés tartja is.

```
1–3. meccs : 🤝 beilleszkedés 0/8 … 2/8          (még nincs mit mondani)
4–8. meccs : 🤝 beilleszkedés 4/8 · gyorsan érzi a helyét
```

Négy fokozat: *gyorsan érzi a helyét* · *kezd beilleszkedni* · *még keresi a
helyét* · *nehezen szokik*. A jelzés a **keretlistán** ott van a forma alatt —
ott dől el a felállítás, ott kell látni, kiről nem tudod még, mit ér a pályán
túl.

### 10d.5 A meccs utáni jelentés

A nyolcadik meccs a rendszer egyik legfontosabb pillanata. Némán elintézni
pont azt a súlyt venné el tőle, amiért az egész készült.

```
🤝 Pelé beilleszkedett — nyolc meccs után megvannak az összhang-értékei
   (átlag 21).
→ Legerősebb kötései: Maradona 28 · Xavi 26 · P. Maldini 24.
→ Innentől 50-ig gyorsítva zárkózik fel a kerethez.
```

Ha valakivel **hazatalált** (közös klubmúlt), azt a sor külön kimondja.

### 10d.6 A játékos lapja (az F5 magja)

A **Kémia fölé** került, mert az a szűkebb fogalom: a párkémia egy-egy
választott páros, az összhang az **egész öltözőhöz** való viszonya.

Két állapot, két mondanivaló. Aki még beilleszkedik, arról a **folyamat** a
hír (hányadik meccs, mit ígér a trend). Aki beállt, annál a **csapat-összhangja
és a három legerősebb kötése**, fokozat-névvel:

```
Csapat-összhangja: 68,4  (a keret egészéhez mérve · a csapat referenciája 55)
Legerősebb kötései: P. Maldini 78 (Vakon megtalálják) · Platini 77 (Erős kötés)
                    · Xavi 77 (Erős kötés)
```

---

## 10e. F3b — a közvetítés

A szám eddig számolt és a döntéseknél megszólalt. Ami hiányzott: **a mérkőzés
maga**. Egy összeszokott tizenegy másképp néz ki a pályán, mint egy frissen
összerakott — ha erről a közvetítés egy szót sem ejt, a rendszer marad
statisztika.

Három szinten szólal meg, és mindhárom **szűkmarkúan**: a közvetítés amúgy is
sűrű, egy negyedik állandó zajforrás elvenné a gólok súlyát.

**Kezdőrúgáskor** — legfeljebb két sor, és csak a szélső eseteknél (72 fölött
dicsér, 34 alatt aggódik). Mellé a **legjellemzőbb posztcsoport**: az,
amelyik a legmesszebb áll a csapat átlagától (±12), mert az mond valamit — nem
az, amelyik pont ugyanott van. És aki még beilleszkedik, azt is kimondja.

```
összhang 20 : 🤝 Sok itt még az idegen egymásnak — ez a tizenegy nem szokta meg egymást.
összhang 55 : (semmi — ez a szándék: a középmezőnyben nincs hír)
összhang 80 : 🤝 Ennek a csapatnak nem kell beszélnie a pályán — az évek megtették a magukét.
védelem +   : 🤝 Külön kiemelnénk a védelmet: ők értik egymást a legjobban ebben a keretben.
```

**Gólnál** — csak „Erős kötés" (63) fölött, és **csak ha nincs köztük kész
párkémia**: annak saját sora van, ugyanazt a párost nem mondjuk el kétszer.
Három hangfekvés a fokozat szerint:

```
66 : → 🤝 Meglátszik a sok közös meccs: Maradona passza pont oda érkezett, ahol Messi várta.
82 : → 🤝 Maradona hátra sem nézett, mégis pontosan tudta, hol van Messi.
95 : → 🤝 Maradona és Messi egymás gondolatait olvassák — a védelem esélyt sem kapott.
```

**Lefújás után** — ha egy kötés **fokozatot lépett**. A hír nem a +1 pont,
hanem hogy átléptek valamit. Csak az említésre méltókat (47 fölött), legfeljebb
hármat, és a meccs UTÁN: menet közben a gólok közé ékelve elvenné azok súlyát.

```
🤝 Henry & C. Ronaldo — új fokozat: Összeszokott (47). Kezd összeállni köztük valami.
```

---

## 10f. F4 — az összhangtérkép

**Nem új képernyő és nem új rajzoló.** Ugyanaz a `#pitch`, ugyanazok a
korongok, ugyanaz a `#pitchBonds` réteg — csak minden, ami nem a
kapcsolatokról szól, kikapcsol: a fűsáv és a felfestés, a szezonkártyák színe
és gyűrűje, az Aranylabda-arany, a poszt-színű keret, a kapitány-szalag, a
sérülés- és eltiltás-jelvények. Marad a karika a Ratinggel, alatta a név, és a
köztük futó vonalak.

**A háttér semleges sötét, nem zöld:** a hét fokozat vékony és halvány vége a
fűszínen egyszerűen nem látszott volna.

| fokozat | vonal | érték |
|---|---|---|
| 1 | halvány, ritkán szaggatott | 1–14 |
| 2 | halvány, sűrűbben szaggatott | 15–29 |
| 3 | szaggatott | 30–46 |
| 4 | folytonos | 47–62 |
| 5 | folytonos vastag | 63–77 |
| 6 | folytonos vastag, **két nyíllal** | 78–91 |
| 7 | folytonos vastag, két nyíllal, **arany** | 92–99 |

**A csúcs arany, nem piros.** Ebben a játékban a piros mindenhol a *rossz*
(lap, büntetés, csökkenő érték) — a legerősebb kötés piros vonala tanult
jelentéssel ütközne.

### A hajszálgombolyag, és mit tettünk ellene

Tizenegy emberen **55 pár** van, és egy beállt keretben ezek nagy része a
4–6. fokozatba esik: 55 vastag vonal, amiből épp az nem olvasható ki, amiért a
térkép készült. A mérés ezt azonnal meg is mutatta.

A szűrő a **struktúrát** mutatja, nem a mátrixot: **fejenként a három
legerősebb** kötés (az uniójuk), plusz **mindig a két felső fokozat** — egy
92-es kötés nem tűnhet el csak azért, mert mindkettejüknek van három még
erősebb. Így 55 helyett tipikusan 15–25 vonal marad, és látszik, ki a háló
közepe. A teljes mátrix egy koppintással előhívható (**⋯ Mind az 55**).

Mérve mindhárom témában, oldalhiba nélkül. A noir szándékosan monokróm — ott a
felső három fokozatot a vastagság és a nyilak különböztetik, nem a szín.

---

## 10g. Az összhang mint esemény

### Öltözői összhang-események

Az öltözői események eddig **kizárólag a morált** mozgatták. Az összhanggal
lett egy másik, lassabb tétjük is: ami ott két ember között történik, az a
pályán is nyomot hagy. A morál-hatásuk szándékosan mérsékelt — a súlyuk az
összhangban van, nem a hangulatban. A feltételeik a **meglévő
személyiség-adatból** dolgoznak, nem új sorsolásból.

| esemény | összhang | morál |
|---|---|---|
| edzés után ottmaradnak gyakorolni | **+9** | +2 |
| a szárnyai alá veszi (vezér ↔ jó együttműködő) | **+12** | +1 |
| egy szobában utaznak idegenbe | **+7** | +3 |
| edzésmeccsen egymásnak esnek | **−8** | −2 |
| megkérdőjelezi a vezető szerepét | **−6** | −1 |

Két helyről is tüzelhet ugyanaz az esemény (a lefújás utáni közjáték és az
átigazolási időszak öltöző-ága), ezért a hatás **egyetlen függvényben** ül
(`applyEventBond`) — a két út nem tud szétcsúszni. A napló mindkét helyen
kimondja, mi történt: enélkül a szám némán mozdulna.

```
🤝 C. Ronaldo & Lahm összhangja 50 → 59 (+9) — Összeszokott.
```

Aki még **beilleszkedik**, azon nem mozdítunk: az értékei a 8. meccsen dőlnek
el, egy közbeeső lökés némán elveszne.

### Csapatépítés (átigazolási esemény)

Az átigazolási időszak eddig kizárólag a keret **összetételéről** szólt: ki
jön, ki megy. Az összhang-rendszerrel a nyárnak van egy másik tétje is — az,
ami már megvan, mennyire áll össze.

Nem egy párost erősít, hanem a **keret egészét**, és pont ez a különbsége az
öltözői eseményektől. A hatás a **meglévő** kötésekre ül rá, tehát annál
többet ér, minél több embered van már együtt: **a csapatépítés nem pótolja a
közös meccseket, csak gyorsítja őket.** A csillapítás és a 88-as puha tető
érvényes rá.

Négy változat (edzőtábor a hegyekben, csapatépítő hétvége, közös felkészülés,
videós műhely), pároként +4…+7 — a **kezdő tizenegy** közti kötések a teljes
adagot kapják, a tartalékkal kötöttek a felét.

```
Nem igazoltunk senkit — helyette videós elemző-műhely az egész kerettel.
Az 55 kapcsolat mindegyike erősödött: a csapat-összhang 50 → 54, a morál +1.
```

A súlya (2) szándékosan a „csendes átigazolási időszak" (3) alatt van: ez a
ritka, kellemes meglepetés.

---

## 10h. F6 — összhangépítés

**A második menedzser-sáv az edzés mellett**, szándékosan ugyanazzal a
szerkezettel: fő + másodlagos, ciklusonként egy váltás, élő előnézet. A
játékos nem tanul új felületet — ugyanazt a döntést hozza meg, csak másról.

**Az ellentétel nem pénz, hanem lassítás.** A játékban már sok pénznyelő van;
egy újabb azt jelentené, hogy az összhang a *gazdag* menedzser kiváltsága —
pedig épp az ellenkezője a célja: a szegény klub fegyvere az, hogy együtt
tartja a keretét. Ami nincs a két sávban, az **0,8×** ütemben épül.

| | szorzó |
|---|---|
| fő sáv | **×1,8** |
| másodlagos | ×1,3 |
| minden más pár | ×0,8 |

**A csoportok a pályán elfoglalt helyet nézik, nem a szerep-kategóriát.**
Ezért lehet köztük „szélsők egymással" vagy „védők a védekező
középpályással" — azok *megbízás*-szintű párok, amiket a
VEDO/KOZEPPALYAS/CSATAR hármas nem tud megkülönböztetni. Következmény, ami
szándékos: a specifikus sáv csak akkor ér valamit, ha tényleg úgy is állsz
fel. A tervező ezért **kiírja, hány pár érintett** most a kezdőben:

```
Védők egymás közt                 6 pár     Szélsők egymással               6 pár
Középpályások egymás közt         3 pár     Középpályások az árnyékékkel    0 pár
Csatárok egymás közt              3 pár     Szélsők a középcsatárral        4 pár
Kapus a védőkkel                  4 pár     Védők a védekező középpályással 8 pár
Védők a középpályásokkal         12 pár
Középpályások a csatárokkal       9 pár                       (4-2-3-1-ben mérve)
```

**Mérve** (40 meccs, 30-as kezdőértékről):

| | véd↔véd | véd↔közép | közép↔közép |
|---|---|---|---|
| nincs sáv | 54 | 50 | 59 |
| fő: védők egymás közt | **64** | 47 | 56 |
| + másodlagos: véd↔közép | **64** | **54** | 56 |

A lassítás tehát valódi: a nem edzett párok visszaesnek 50→47 és 59→56-ra.

---

## 10i. F7 — a Csapatkovács

**Nem új típus.** Már volt egy stábtag, aki „az öltöző belső kémiáján
dolgozik" — csakhogy a munkája egy **álló számba** (`CHEM.total`) folyt, amit
az F2 óta már semmi nem olvas: a morált az élő összhang hajtja. A Csapatkovács
tehát dolgozott, és a munkája a semmibe ment.

Mostantól azt csinálja, amiről a neve szól: **gyorsítja a kötések épülését a
fókuszáltjai között**. A hatás ott a legnagyobb, ahol **mindkét végpont** az ő
fókuszában van — egy kapcsolatot nem lehet félig edzeni.

**Négy ember, nem kettő.** A többi típusnál a szűk fókusz azt jelenti, hogy egy
emberre koncentrálsz; itt viszont a fókusz tárgya egy **kapcsolat**, amihez
ketten kellenek. Két emberrel pontosan egy párt lehetne edzeni — az annyira
szűk, hogy a szűk fókusz értelmét vesztené. Néggyel hat pár jön ki, ami már
egy tengely vagy egy védősor.

**A jogosultsága is változott:** a pontszámába bekerült a **saját
csapat-összhangja** (0,30 súllyal, a természete 0,50 marad a fő faktor) — aki
játékosként mindenkivel összeszokott, az edzőként is tudja, mitől áll össze egy
páros. Az érték a lenyomat készítésekor rögzül, mert a visszavonulás után a
kötései már törlődnek.

### Egy hiba, amit a mérés fogott meg

Az első változat **felborította a stáb-rendszer alapszabályát**. Az edzőnek fix
figyelme van, amit szétoszt: szűkebb fókusz fejenként több, összesen kevesebb.
A `bondCoachMult` viszont csak a minőségből számolt, tehát az **egész keretre**
állított edző ugyanazt a szorzót adta minden párra, mint a négy emberre
állított — vagyis a széles fókusz szigorúan jobb volt. Mérve: ×1,318 mindkét
esetben.

A hígulás mostantól a Csapatkovács saját maximumához mér (4/n):

| fókusz | két fókuszált közt | egy fókuszált |
|---|---|---|
| nincs edző | ×1,000 | ×1,000 |
| 90-es Szakértelem, **4 védőre** | **×1,318** | ×1,104 |
| 45-ös Szakértelem, 4 védőre | ×1,191 | ×1,063 |
| 90-es, csak az egyikre | ×1,104 | ×1,104 |
| 90-es, **egész keret** | ×1,116 | ×1,116 |

---

## 10j. Az összhang a kapitányválasztásban

**Bejelentett kérés:** *„a kapitány személye szempontjából legyen jelentősége
(legalább 25%-nyi) annak, mekkora az összhang pontszáma a választott
kapitánynak. Ezt az autó kapitányváltó is vegye figyelembe."*

### Miért nem egyszerűen `s += bond × 0,3`

Az abszolút érték a **karrier szakaszáról** szólna, nem a jelöltek közti
különbségről: az első idényben mindenki 25 körül áll (a tag mindenkinél
ugyanannyit adna, tehát semmit nem döntene el), a tizedikben mindenki 80 körül
— ugyanez. A kapitányválasztás viszont egy **összehasonlítás**.

Ezért a tag a **kereten belüli helyzetet** méri: a jelölt a tizenegy
összhang-sávjának melyik pontján áll. A jelölt összhangja itt a **kezdő
tizeneggyel** vett *súlyozatlan* átlag — a kapitányi viszonynak nincs köze a
pályatávolsághoz.

### A súly a többi taghoz mérten dől el

Az első változat fix 28 pontot adott — csakhogy a többi tag **tényleges**
szórása keretenként más: elméletben 83, egy valódi tizenegyben **mérve 31** (a
vezetői képesség ritkán szór 0-tól 4-ig, és a korok is közel esnek). Fix
28-cal ez **47%**-os súlyt jelentett: a kért „legalább 25%" fölé lőtt, és
már-már a vezetői képességgel vetekedett.

Mostantól a tag szórása a **többi tagénak a 0,34-szerese** —
`0,34/(1+0,34) ≈ 25%`, pontosan a kért arány, minden keretben. Mérve: **25%**.

Két fék marad rajta:

* a hatás a keret **tényleges** összhang-szórásával skálázódik (18 pontnál
  teljes, alatta arányosan kisebb) — ahol a tizenegy ebben egységes, ott
  tényleg nincs mit választani, és nem szabad zajt felnagyítani. Mérve:
  teljesen egységes keretnél a tag szórása **0,0**;
* a `recommendCaptainIdx` **egyszer** számolja ki a sávot, és adja át —
  enélkül a `bondWithXI` tizenegyszer futna végig a tizenegyen minden
  jelöltnél.

### Ahol látszik

Az **automatikus váltó** ugyanazt a `captainSuitability`-t hívja, tehát
magától követi. A **kézi választóban** minden sor kiírja a jelölt összhangját
és azt, mennyit ér vele:

```
Thierry Henry ★ ajánlott   JSZ · 94 · V·Jó · E·Imádott · T·Jámbor · 🤝 65 (+2,7)
Cristiano Ronaldo          BSZ · 94 · V·Megfelelő · E·Kedves     · 🤝 69 (+5,5)
Franco Baresi              KV  · 92 · V·Megfelelő · E·Kedves     · 🤝 62 (+0,3)
```

Enélkül a rangsor megváltozna, de a menedzser nem tudná, miért — az
„ajánlott" jel indoklás nélkül maradna.

---

## 11. Ami még hátravan

`F8` az első keret saját képernyője (ma a magvetés lefut, csak nincs hozzá
összefoglaló) · `F9` hangolás tíz idényen.
