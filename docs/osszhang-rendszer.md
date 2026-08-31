# Összhang — a modell

**Állapot:** ✅ **kész — F1-től F9-ig, plusz az egyéni követés és a
keret-szinthez mért érkező** · **Verzió:** 3.8.11

*(Terv és ütemterv: `docs/osszhang-rendszer-terv.md`. Érintett kód: a
`BOND_*` konstansok, `bondKey/bondRaw/bondOf/bondSet/bondAdd/bondCapOf`,
`bondSettledBase/bondNewLevels/bondLevelsOf/bondProvOf/bondProvNow/
bondCatchParams/bondBaseAfterArrival`,
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
| **F8** ✅ | **az induló elemzés képernyője** — a magvetés nem fut le némán |
| **F9** ✅ | **hangolás tíz idényen**, fogalomtár-szócikk |
| **egyéni követés** ✅ | a játékos száma a **kezdő tizenegyhez** mérve |
| **keret-szint** ✅ | az érkező **minden száma arány**, nem fix — egy erős igazolás nem bünteti azt, aki jól tartotta össze a keretét |

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
  × felzárkózás  1,8–2,6, amíg az érkező a keret szintje alatt van (lásd 6.2)
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

**Az érkező MINDEN száma a keret szintjéhez mért arány** (3.8.11) — a
viszonyítás mindenhol ugyanaz: `bondSettledBase()`, azaz a **kezdő tizenegy
súlyozott átlaga, a beilleszkedők nélkül**. A régi, fix számok mostantól a
**padlók**. A miértje a 10n. fejezetben.

### 6.1 A nyolc meccs

A `markArrived` **minden** igazolási úton lefut (vásárlás, klub-szemle, ingyen
token, akadémia, csere), ezért a beilleszkedési ablak ott indul — nem az egyes
vásárlási ágakban.

Amíg tart, az érkező **minden** kötése egységesen a **keret szintjének 66%-a**
(de legalább 15). Ez szándékosan a beállt csapat átlaga alatt van: az új ember
a nyolc meccse alatt **lehúzza a csapatszámot**, és ez nem hiba, hanem a
rendszer lényege — az igazolásnak ára van a pályán is. Az ár viszont
**arányos**: egy 78-as keretbe érkező 51-en áll, nem 15-ön.

**A számláló az Ő meccseit számolja, nem a csapatéit.** Egy cserejátékos
különben fél idényig az ideiglenes értéken ragadna.

**Az érték a nyolc meccs alatt is frissül** (`bondMatchTick`): ha közben
eladsz egy tengelyt, a keret szintje esik, és az érkező száma vele. „Az
**aktuális** csapatösszhang 66%-a" — nem a belépéskori.

**Mérve** (a kezdő 11-be tett igazolás, ugyanaz a keret négy szinten):

| keret szintje | ideiglenes | csapatszám előtte → utána | a RÉGI, fix 15-tel |
|---|---|---|---|
| 25 | **16** | 25 → 23,5 (−1,5) | 23,3 (−1,7) |
| 40 | **26** | 40 → 37,7 (−2,3) | 35,9 (−4,1) |
| 55 | **36** | 55 → 51,9 (−3,1) | 48,4 (−6,6) |
| 70 | **46** | 70 → 66,0 (−4,0) | 60,9 (−9,1) |
| 80 | **53** | 80 → 75,5 (−4,5) | 69,2 (−10,8) |

### 6.2 A felzárkózás

A nyolcadik meccs után gyorsítva zárkózik (`S.bondFast`) — és **a cél is, az
ütem is a keret szintjéhez igazodik** (`bondCatchParams`):

* **cél:** a keret mai szintje, de legalább **50**. Egy 78-as csapatban az
  50-nél megálló gyorsítás félúton hagyta volna az érkezőt.
* **ütem:** ×1,8 az 55-ös referenciáig, onnan lineárisan ×2,6-ig a 88-as
  puha tetőnél. Egy összeszokott öltözőnek megvan a nyelve és a rendje —
  abba gyorsabban tanul bele valaki.

A jelző a cél fölött magától hatástalan, és lekapcsol, amint a legkisebb
kötése is átlépte — így nem ragad rá egy tíz éve itt játszó emberre.

**Mérve:** nulláról 30 meccs — sima **31**, felzárkózással **45**. Egy 70-es
keretbe érkező 40 meccs alatt 34,6-ról **47,9**-re jön fel, a csapatszám
64,2-ről **69,9**-re — vagyis a keret egy idény alatt visszaáll oda, ahol az
igazolás előtt volt.

### 6.3 Aki hazatalál

Ha a párnak **közös múltja** van (együtt játszottak egy valós klubban), a
kezdőérték nem a normál sávból jön, hanem **a keret mai szintjéig** (de
legalább 50-ig) mehet. Közös nemzetiség a sáv felső felébe emel.

**Fölé nem:** a közös múlt **behozza** őt a csapatba, nem a csapat fölé emeli.

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
   (3.8.08-as mérés, a FIX 15-ös ideiglenes értékkel. A 3.8.11 óta ez a
   szám a keret szintjéhez mért — friss mérés a 6.1-ben és a 10n.-ben)

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

### 10d.2 Eladáskor: mi VÁLTOZIK, és mi vész el

A megerősítő eddig annyit mondott, hogy *„a felépített kémiája is elvész"* —
szám nélkül. Az első számos változat viszont **zavaros lett**, és jogosan:
kiírt egy „csapat-összhang" számot, ami (a) a teljes keret átlaga volt, nem a
csapatszám, és (b) nem mondta meg, **mennyivel** lesz kevesebb. Egy **nem
kezdő** eladásánál pedig egyenesen hazudott: a `teamBond` csak a **pályán
lévő** tizenegyet nézi, tehát egy tartalék távozása ma semmit nem mozdít
rajta — a szám mégis ott állt, mintha veszteség volna.

**Két különböző kérdés, két különböző mondat.**

**Kezdő eladásánál a szám VÁLTOZIK** — és a mértéke attól függ, ki lép a
helyére, ezért mindkét utat kiírjuk:

```
🤝 A csapat-összhang ettől VÁLTOZIK — kezdő ember.
→ Mészáros lépne a helyére a keretből: 68,7 → 62,8 (csapaterőben −0,46)
→ igazolással: 68,7 → 64,1 (−0,36) — az érkező nyolc meccsig mindenkivel 45-ön áll
→ 10 erős kötése szűnik meg.
   A legerősebbek: Jasin 70 · Lahm 70 · Beckenbauer 70
   180 nálad lejátszott meccs épült beléjük.
```

Ha a keretben **nincs** azonos szerep-kategóriájú utód, azt kimondjuk, és csak
az igazolás-ág marad. *(A mérés itt egy hibát fogott: az első változat a
**kapus** helyére egy csatárt ajánlott, mert idegen posztról mindenki „be tud
állni", tehát a nyers rating döntött. Most a fit ≥ azonos szerep-kategória
kötelező.)*

**Tartalék eladásánál a szám NEM változik** — és ezt ki kell mondani. Helyette
azt mutatjuk meg, mit veszítesz: a **lehetőséget**, hogy beálljon. A puszta
szám néma, ezért mindig kap egy értelmezést is:

```
🤝 A csapat-összhang ettől MA nem változik — nincs a kezdő tizenegyben,
   és a szám csak a pályán lévőket méri.
→ Amit elveszítesz, az a lehetőség: ha beállna F. Baresi helyére,
  34,2-es összhangot hozna (a mostani csapatszám 70).
→ Beállva LEHÚZNÁ a csapatszámot (−35,8) — de ez nagyrészt abból jön, hogy
  nem játszik: aki nem lép pályára, nem gyűjt. Az összhangépítés sávja
  ezen tud segíteni.
```

A három ág: **emelné** a csapatszámot (valódi tartalék-érték) · **nagyjából
annyit hozna** (összhangban nem hiányozna) · **lehúzná** (a fenti magyarázattal,
mert egy nem játszó ember alacsony száma nem az ő hibája).

Mindkét ágon ott a közös rész: hány **erős** kötés szűnik meg, melyek ezek, és
**hány közös meccs** épült beléjük — ez teszi a veszteséget tapinthatóvá.

Aki még beilleszkedik, arról semmit nem írunk ki — nála nincs mit elveszíteni,
és a panel ezt ki is mondja.

### 10d.3 Vásárláskor: mennyit esik a csapatszám

A becslés **őszinte**: kiszámoljuk, mi lenne a csapatszám, ha a jövevény
belépne a tizenegybe. A cserélt ember a **leggyengébb összhangú** kezdő — ez a
legkedvezőbb eset, tehát a becslés nem ijesztget.

```
🤝 Beilleszkedés: az első 8 meccsén mindenkivel ideiglenes 48-ös összhangon
   áll (a keret mai szintjének 66%-a). Ha J4 helyére áll be, a csapat-összhang
   72 → 67,4 (−4,6, csapaterőben −0,36). Utána 67-ig 2,1-szeres ütemben
   zárkózik fel.
```

*(A számok élők: ugyanez a panel egy 25-ös keretnél 16-ot és −1,5-öt ír ki.)*

**A felzárkózás célja VETÍTETT szám, nem a mai keret-szint** (`bondBaseAfterArrival`).
A mai szintet kiírni ide **túlígéret** volna: a cél a beállt tizenegy szintje —
csakhogy a nyolcadik meccs után az érkező **maga is beleszámít**, a friss,
alacsony értékeivel, tehát a szint alább kerül, mint ahol most áll. A panel
ezért a **hipotetikus** tizenegyre méri a szintet, a jövevény párjainál a
sávja közepével (`(lo+hi)/2`), ugyanazokkal a súlyokkal, amikkel a
`bondSettledBase` fog.

**Mérve** (előnézet vs. a valódi lefutás, nyolc meccs után):

| keret szintje | a panel ígérete | a VALÓDI cél a 8. meccs után |
|---|---|---|
| 40 | 50-ig, ×1,8 | **50**, ×1,80 |
| 55 | 50-ig, ×1,8 | **52**, ×1,80 |
| 70 | 64-ig, ×2,0 | **64**, ×2,03 |
| 80 | 74-ig, ×2,3 | **74**, ×2,27 |

A panel tehát pontosan annyit ígér, amennyit a rendszer tart — és ahol téved,
ott **lefelé** téved (55-nél 50-et mond 52 helyett).

### 10d.4 A beilleszkedés folyamata — jelzés a 4. meccstől

A nyolcadik meccs egy **szakadék**: 15-ről lehet 4-re esni. Ha a menedzser
semmit nem lát belőle előre, az nem leleplezés, hanem csapás.

**Az irány nem sorsolás:** a játékos addigi teljesítményéből (gól, gólpassz,
együttműködés) olvassuk — amit a jelzés ígér, azt a leleplezés tartja is.

```
1–3. meccs : 🤝 beilleszkedés 0/8 … 2/8          (még nincs mit mondani)
4–8. meccs : 🤝 beilleszkedés 4/8 · gyorsan érzi a helyét
```

A játékos lapja azt is kiírja, **mibe** fog beleesni — a sávot, a
hazatalálás tetejét és a felzárkózás célját, mind a saját keretére számolva:

```
Addig mindenkivel ideiglenes 48-ös összhangon áll — a keret mai szintjének
66%-a (72).
A 8. meccs után az addigi teljesítménye alapján kapja meg a valódi értékeit
(24–54, közös klubmúlttal 72-ig), onnan 72-ig gyorsítva zárkózik.
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

## 10k. F8 — az induló elemzés képernyője

A magvetés eddig **némán** futott le a kémia-doboz „Rendben" gombjára: 55–378
kapcsolat született, és a menedzser egyet sem látott belőlük. Márpedig ez az a
pillanat, amikor a **keret megszületik** — és az első idény nehézségének a fele
(a −1,5-es csapaterő-tag) itt dől el.

**A kémia-doboz mostantól két lépcsős.** Először a klasszikus kémia-elemzés (ki
kivel játszott, ki kivel feszült), utána az összhang induló képe. A kettő
ugyanabból az adatból dolgozik, de mást mond: a kémia a **múltat**, az összhang
a **kiindulási állapotot**. Egy képernyőre zsúfolva egyik sem érne el.

```
Összhang — a keret kiindulási állapota

  A keret kiindulási állapota — 55 kapcsolat. Innentől minden közösen
  lejátszott meccs épít rajta, és minden távozás visz el belőle.

  Csapat-összhang: 46,8  (a beállt csapat referenciája 55)
  Ez most −0,6 csapaterő. Egy frissen összeállt keret mindig innen indul.

  A LEGERŐSEBB KÖTÉSEK
  🤝 Bodnár & Komlósi   60  Összeszokott · az induló kémia
  🤝 Mészáros & Rudolf  60  Összeszokott · az induló kémia
  🤝 Szakály & Dombi    59  Összeszokott · az induló kémia

  ⚡ Feszültség: Czvitkovics & Mészáros — köztük 40 fölé nem jut
     az összhang, amíg a viszony áll.
```

**Legfeljebb öt kötés**, mert a 91 pár felsorolása nem információ, hanem zaj —
és mindegyik mellett ott az **ok** (közös klub, nemzetiség vagy az induló
kémia). A betöltés a helyes lépcsőre tér vissza: ha a magvetés már lefutott, a
második képernyőt kapod, nem az elsőt.

**Az induló kémia is közös múltnak számít** (ez az F8 igazi mechanikai
kiegészítése). A `CHEM.goodPairs` nem csak a klubot és a nemzetiséget
tartalmazza: benne van a **jóra fordult rivalizálás** és a **vezetői kötés**
is (egy erős vezető felkarol valakit). Ezek pontosan olyan „már ismerjük
egymást" viszonyok, mint a közös klub — a bejelentés is ezt kérte: az első
keretnél nagyobb a hatása az induló kémiának.

---

## 10l. F9 — hangolás tíz idényen

### A pad örökre a magvetett értéken ragadt

A tízidényes mérés egy valódi hiányt talált. A kötés alapszabálya, hogy
**közös pályán töltött percből** gyűlik — aki nem játszik, nem gyűjt. Ez
helyes, de a tartalékok kötése így **soha nem mozdult**: tíz idény után is a
kiinduló 8-10-en állt. A forgatás és a sérüléshullám aránytalanul drága lett
volna.

Az ellensúlyt a terv az összhangépítésre bízta (2.7), de az az F6-ban nem
került bele. Most igen: **ami a sávodba esik, az az edzéspályán is épül** —
`BOND_BENCH_RATE` = 35%-os ütemen, és **csak ott**. Ettől lesz a sáv valódi
eszköz, nem díszlet: ez az egyetlen mód, hogy a padot bekösd a hálóba. Sáv
nélkül a régi viselkedés marad, betűre.

**Mérve** (ugyanaz a keret, 10 idény = 300 meccs, hat középhátvéd a padon):

| összhangépítés | pad↔pad min | pad↔kezdő átlag | csapatszám |
|---|---|---|---|
| nincs sáv | **10** | 27,1 | 81,1 |
| fő: védők egymás közt | **63** | 44,4 | 79,7 |

A csapatszám cserébe 81,1-ről 79,7-re esik — a lassítás ára látszik.

### A karrier íve VALÓDI keret-forgással

Az F2-es mérés végig ugyanazzal a tizeneggyel futott. A valóság nem ilyen:
idényenként egy kezdőt eladni és egy újat hozni teljesen más ívet ad.

| idény | összhang | tag | mit vitt el az eladott |
|---|---|---|---|
| 0 | 25,5 | −1,50 | az induló elemzés (136 pár) |
| 1 | 47,1 | −0,62 | P. Maldini (csapat-összh. 33) |
| 3 | 57,0 | +0,16 | Platini (51) |
| 5 | 59,4 | +0,34 | C. Ronaldo (52) |
| 8 | 57,0 | +0,16 | Iniesta (57) |
| 9 | 64,3 | +0,73 | *(nincs több eladás)* |
| 10 | 66,9 | +0,93 | — |

**A forgó keret 57–59 körül beáll**, és csak akkor kezd emelkedni, amikor
abbahagyod az eladást. Az F2 méréséhez képest (80,1 / +1,96 a tizedik
idényben) a különbség nagyjából **egy teljes OVR** — pontosan az a súly, amit
a rendszer az igazolásoknak adni akart.

### A plafon zárva maradt

Tíz idény, 300 meccs, 136 kötés után **egyetlen pár sem érte el a 99-et** — a
legmagasabb 84. A 88-as puha tető tartja magát, és a legfelső fokozathoz
tényleg kell egy elkészült párkémia.

### A kapitány-súly minden keretben 25%

Három különböző kereten mérve (más személyiségekkel, más összhang-szórással) a
tag súlya rendre **25%** volt — a többi tag szórása 29, 34 és 57 pont volt,
tehát az arányosítás dolgozik. Egységes keretnél a tag helyesen elhalkul.

### Fogalomtár

Az összhang saját szócikket kapott (**Összhang**), ami egy helyen mondja el a
teljes rendszert: mi a különbség a moráltól, hogyan ül a csapaterőre, mitől
épül, mi a 88-as tető, a hét fokozat, az érkező nyolc meccse, a plafon, az
edzés-sáv, a Csapatkovács és a kapitány-hatás.

---

## 10m. Az egyéni követés (3.8.07)

**Bejelentett hiány:** *„most nem tudjuk az összhang értékeket egyénileg
követni."* Igaz volt. A játékos lapja a **teljes keretre** átlagolt számot
mutatta, ami két irányban is félrevezetett: egy tartaléknál a padon ülőkkel
meglévő gyenge kötései lehúzták, egy kezdőnél pedig a soha nem játszó
tartalékok hígították.

**A helyes mérce a kezdő tizenegy** — a meccs-hatás (`teamBond`) is abból
számol, tehát az egyéni számnak is arról kell szólnia.

### Aki nincs a kezdőben: egy embert ki kell venni

Ha beállna, valakinek ki kellene mennie — az ő helyét nem foglalhatja el
önmaga mellett. A „legvalószínűbb" áldozat: **akinek a helyére a legjobban
illeszkedik**, és ott holtversenynél **a leggyengébb**. A poszt-illeszkedés
mindig erősebb szempont, mint a rating; a rating csak holtversenyt bont.

**Mérve** (11 kezdő egymással 70-en, két tartalék 22-n, két erős kötéssel):

```
Nesta (KV)          → kit váltana: F. Baresi (KV, rating 92)
                      — nem Beckenbauert (94), mert ő az erősebb
  Összhangja a kezdő tizeneggyel: 28,2 · Épülőben
  Nincs a kezdőben — a szám azt mondja meg, mennyi lenne,
  ha F. Baresi helyére állna be.
  Három legerősebb kötése (az EGÉSZ keretben):
    Beckenbauer 84 (Vakon megtalálják) · F. Baresi 76 (Erős kötés) · Jasin 22
```

**A három legerősebb kötés szándékosan a TELJES keretből néz**, nem csak a
kezdőből: egy padon ülő régi társsal meglévő 80-as kötés akkor is érték, ha ma
épp nem játszanak együtt — és holnap újra fognak.

### Ahol megjelenik

| hely | ki megy ki a számításból |
|---|---|
| **a játékos lapja** (HUB) | a legvalószínűbb áldozat — kiírja, kicsoda és miért |
| **Cserék a meccs alatt** (csereterv) | a szabály **saját** `outIdx`-e — ott nem kell találgatni |
| **élő csere-panel** | a kijelölt lejövő; ha még nincs kijelölve, a legvalószínűbb |
| **hiányzó-pótló panel** | maga a hiányzó kezdő — pontosan ismert |

A csereterv és az élő panel a **kimenő** számát is odateszi, hogy a csere
összhang-mérlege egy pillantásra látsszon:

```
🤝 35,8 a tizeneggyel — Henry helyén
Legerősebb kötései: P. Maldini 58 · Mészáros 55 · Messi 48
Akit lecserélsz — Henry: 68
```

A hiányzó-pótló panelen a sor végére kerül, a poszthűség mellé:

```
Mészáros · 79   pad · poszthű · 🤝 41,2
Rudolf   · 82   pad · idegen poszt (−) · 🤝 45,9
```

Aki még **beilleszkedik**, annál mindenhol a folyamat áll a szám helyén
(`🤝 beilleszkedik 3/8 meccs — addig mindenkivel 15`).

---

## 10n. A keret szintje hat az érkezőre (3.8.11)

**Bejelentett kérés:** *„A csapat átlag összhangja legyen hatással az érkező
játékos illeszkedésének sebességére, a jobb illeszkedést segíthesse ez is. Ne
legyen az, hogy teljesen értelmetlen legyen egy erős játékost bevenni, mert
ezzel felborul az összhang."*

### A hiba, amit javít

Az érkező négy száma **fix** volt: nyolc meccsig mindenkivel **15**, utána
**0–33**, hazatalálásnál 50-ig, felzárkózás **50-ig ×1,8**. Ezek egy **friss,
25–30-as** kerethez voltak hangolva — és ott jól is működtek.

Egy **beállt** keretben viszont ugyanezek a számok szakadékká váltak. Egy
70-es csapatnál egy igazolás **9,1 ponttal** húzta le a csapatszámot, egy
80-asnál **10,8-cal** — függetlenül attól, milyen jó a játékos. Vagyis:

> Minél jobban tartottad össze a keretedet, annál drágább lett bárkit
> igazolni. A rendszer a saját céljával fordult szembe.

Ez ráadásul **valóságellenes** is. Egy összeszokott öltöző épp hogy
**könnyebben** vesz fel valakit: megvan a nyelve, a rendje, a hangadói. A régi
modell ennek pont az ellenkezőjét mondta.

### A megoldás: minden szám ARÁNY

Egy közös viszonyítás, a `bondSettledBase()` — **a kezdő tizenegy súlyozott
átlaga, a beilleszkedők nélkül**. Szó szerint az, amit a bejelentés kért:
*„az átlagösszhang a kezdő 11 összhangja őnélküle."*

| | arány | padló (a régi, fix érték) |
|---|---|---|
| ideiglenes érték (8 meccs) | **66%** | 15 |
| a 8 meccs utáni sáv | **33–75%** | 0–33 |
| hazatalálás | **100%** | 50 |
| felzárkózás célja | **100%** | 50 |
| felzárkózás üteme | ×1,8 → **×2,6** (55-től 88-ig) | ×1,8 |

**Miért a beilleszkedők NÉLKÜL.** Két oka van, és mindkettő kemény:

* **körkörösség** — a `teamBond` a `bondOf`-ból dolgozik, az pedig épp az
  ideiglenes értéket adná vissza: a szám saját magától függene;
* **kettős büntetés** — két egyszerre érkező kölcsönösen lehúzná a másik
  kiindulási szintjét, pedig egyikük sem a keret állapotáról szól.

A `bondSettledBase` ezért a `bondRaw`-ból olvas — az ideiglenes érték sehol
nem kerül bele. **Mérve:** két egyszerre érkező egy 70-es keretbe, mindkettő
46-on áll, egymással is 46-on (a kisebbik ideiglenes érték számít).

### A régi értékek a PADLÓK, nem a középértékek

Ez a változtatás legfontosabb féke. Egy gyenge (25–30-as) kerethez érkezve
**betűre a mai viselkedést kapod**: az első idény nehézsége, a −1,5-es gödör
és a tíz idényre hangolt karrier-ív nem mozdul. A rendszer csak **fölfelé**
nyílik ki, ott, ahol eddig hazudott.

**Mérve** (ugyanaz az érkező, ugyanaz a keret, csak a szintje más):

| keret szintje | ideiglenes | sáv | haza | felzárk. cél | ütem |
|---|---|---|---|---|---|
| 25 | 16 | 8–33 | 50 | 50 | ×1,80 |
| 40 | 26 | 13–33 | 50 | 50 | ×1,80 |
| **55** *(a referencia)* | 36 | 18–41 | 55 | 55 | ×1,80 |
| 70 | 46 | 23–52 | 70 | 70 | ×2,16 |
| 88 *(a puha tető)* | 58 | 29–66 | 88 | 88 | ×2,60 |

A padlók az 50-es keret körül adják át a helyüket az arányoknak — pontosan
ott, ahol a keret már „beállt"-nak számít.

### Az igazolásnak továbbra is ÁRA van

66% < 100%: az érkező **még mindig lehúzza** a csapatszámot. Csak már nem
aránytalanul.

| keret | csapatszám előtte → utána | a RÉGI, fix 15-tel |
|---|---|---|
| 25 | 25 → 23,5 (**−1,5**) | 23,3 (−1,7) |
| 55 | 55 → 51,9 (**−3,1**) | 48,4 (−6,6) |
| 70 | 70 → 66,0 (**−4,0**) | 60,9 (−9,1) |
| 80 | 80 → 75,5 (**−4,5**) | 69,2 (−10,8) |

Az ár tehát a keret szintjével **enyhén nő** (a jobb csapatba lépni több
ismerkedést kíván), de nem robban.

### A sebesség — a bejelentés első fele

**Mérve** (érkező egy 70-es keretbe, 40 meccs a leleplezés után):

| | leleplezés | +8 meccs | +16 | +24 | +32 |
|---|---|---|---|---|---|
| J12 átlaga | 34,6 | 37,1 | 41,5 | 44,9 | **47,9** |
| csapatszám | 64,2 | 66,1 | 67,7 | 68,9 | **69,9** |

**A keret nagyjából egy idény alatt visszaáll oda, ahol az igazolás előtt
volt.** A régi modellel (15-ös ideiglenes, 0–33-as sáv, 50-es cél) ez két-három
idény lett volna — és a felzárkózás félúton, 50-nél meg is állt volna.

### Ami VÁLTOZATLAN maradt

| | viselkedés |
|---|---|
| az **induló elemzés** (`bondSeedFirstSquad`) | betűre a régi képlet — a `bondSeedValue` új `lo` paramétere ott üres. Mérve: 105 pár, min 10, max 34, csapatszám 21,1 |
| **klasszikus mód** | `bondSettledBase()` = `null` → minden szám a padlón |
| **régi mentés** (`{m:3}` rekord) | az első olvasáskor a mai keret-szintből pótoljuk és el is tesszük |
| a **88-as puha tető**, a **plafon**, a **csillapítás** | érintetlen — a hazatalálás sem viheti a keret mai szintje fölé |
| a **morál**, a **kapitány-súly**, a **nehézség** | ugyanabból a `teamBond`-ból dolgoznak, tehát maguktól követik |

---

## 10n. Kiemelt pozíció és a teljes kötés-térkép (3.8.13)

**Bejelentett kérés:** *„az összhang stat legyen kiemelt pozícióban, ne is
kelljen külön lenyitni. Legyen ott mindenkinek, ahol most a »kezd
beilleszkedni« van"*, és *„a lenyíló menüben lehessen részletesen megnézni,
hogy kivel milyen kapcsolatban van — ne a képesség alatt legyen, hanem legyen
egy saját lenyíló ablaka"*.

### A keretlista sora — mindenkinek

A keretlista sorában eddig **csak a beilleszkedők** chipje állt
(`bondSettleChip`), a beállt keret száma pedig a lenyitott lapon lapult. Épp az
a szám hiányzott a felállítás helyéről, ami a felállításról szól.

`bondRowChip(név)` innentől **mindenkinek** ad sort, ugyanott:

```
🤝 összhang: 36,5 · Ismerik egymást
🤝 összhang: 41,2 · Összeszokott (ha beállna)      ← nincs a kezdőben
🤝 beilleszkedés 5/8 · kezd beilleszkedni          ← még érkező
```

A mérce ugyanaz, mint a lapon: a **kezdő tizeneggyel** mért összhang
(`bondXIDetail`) — az számít a mérkőzésen. Aki nincs a kezdőben, annál a szám
azt mondja meg, mennyi lenne, ha beállna (a legvalószínűbb áldozat kimarad az
átlagból, lásd 10m).

### Saját lenyíló szakasz, benne a teljes térkép

A játékos lapján az összhang-blokk eddig a **Képességek szakasz végén** lógott
(nem volt saját `hdMark`-ja), tehát a skillek alatt kellett keresni — és csak a
három legerősebb kötést mutatta. Abból viszont nem derül ki, **hol a baj**: a
gyenge kötéseken kell dolgozni, és a kezdő tizenegyen belüli szomszédságok azok,
amik a pályán tényleg számítanak.

Mostantól **önálló szakasz** (`hdMark("hdBond", "🤝 Összhang", "kivel milyen a
viszonya")`), közvetlenül a **Kémia fölött** — az a szűkebb fogalom: a párkémia
egy-egy választott páros, az összhang az egész öltözőhöz való viszony.

A szakaszban a régi összefoglaló alatt ott a **teljes kötés-térkép**
(`bondAllListHtml`): egy sor **minden** kerettaggal, két csoportban, mindkettő
értékben csökkenően és csoport-átlaggal:

```
🤝 A kezdő tizeneggyel — 10 társ, átlag 44,8
   P. Maldini      58 · Összeszokott      ▓▓▓▓▓▓░░░░
   Mészáros        55 · Összeszokott      ▓▓▓▓▓▓░░░░
   …
🤝 A keret többi tagjával — 14 társ, átlag 29,1
   Rudolf          cserepad · 34 · Ismerik egymást
   …
```

A nem kezdőknél a sor kimondja, **hol** van a másik (cserepad / tartalék): a
kötés a pályán fizet, tehát ez a döntéshez tartozik. A beilleszkedőnél a lista
kimarad — ott még nincs mit mutatni, a folyamat a hír.

---

## 10n. Aki kimaradt az érkezésből (3.8.25)

**BEJELENTETT HIBA:** *„ha egy új játékost először a cserepadra teszek és nem a
kezdőbe, akkor egyből túllesz a beszokás 8 meccses fázisán és kap egy 2-5
közötti összhang értéket, ami a béka segge alatt van, és használhatatlan lesz
a játékos."*

### Az ok — az ablak el sem kezdődött

A beilleszkedési ablakot **egyetlen** hely nyitja meg: a `markArrived`, azon át
a `bondStartIntegration`. Ez minden IGAZOLÁSI úton lefut — de van olyan
útvonal, ami e nélkül tesz **vadonatúj** embert a keretbe. A legtisztább
példa a **szezonvégi nyugdíjazás pótlása**: ott a `careerPlayerFromPoolEntry`
egy új játékost gyárt, és egyenesen a slotba **vagy a padra** teszi.

Aki így kerül be, annak nincs `bondNew`-je — tehát a rendszer **késznek látja**,
miközben egyetlen kötése sincs. Minden párja nulláról indul, és a szokásos
ütemmel pár meccs alatt kúszik 2-5-ig. A nyolc meccses ablak nem „lejárt":
**el sem kezdődött.**

### Mérve

A valódi függvényekkel, egy 60 meccsen érlelt, **72-es** keretbe lépve:

| eset | belépéskor | 2. meccs után | 8. meccs után | 14. meccs után |
|---|---|---|---|---|
| szabályos érkezés (kezdőbe) | 48 (ideiglenes) | 48 | átlag **46,9** | átlag **52,9** |
| szabályos érkezés (padra, be is áll) | 48 (ideiglenes) | 48 | átlag **45,4** | átlag **52,7** |
| szabályos érkezés (padra, nem játszik) | 48 (ideiglenes) | 48 | 48 (ideiglenes) | 51 (ideiglenes) |
| **ablak nélküli belépés — a hiba** | **0** | **1,5** | átlag **7,2** | átlag **12,5** |
| **ugyanaz, javítva** | 48 (ideiglenes) | 2/8, 48 | átlag **47,1** | átlag **54,5** |

A negyedik sor második oszlopa maga a bejelentés: **1,5**, aztán 2-5 körül.

### A javítás — a rendszer nem feltételez

Nem egy újabb hívás a hiányzó helyre. A rendszer mostantól **nem
feltételezi**, hogy minden érkezési út szólt neki:

```js
function bondEnsureArrivals(){
  ...
  const have=bondSeededNames();       /* akinek van BÁRMILYEN rögzített kötése */
  names.forEach(nm=>{
    if(have.has(nm)||bondIntegrating(nm))return;
    bondStartIntegration(nm);});      /* aki kimaradt, az ÉRKEZŐ */
}
```

**Miért egyértelmű a jel.** A `bondSet` a kulcsot akkor is létrehozza, ha az
érték 0, az induló elemzés pedig minden párra lefut. Akinek **egyetlen kulcsa
sincs**, az bizonyosan sosem volt magvetve — nincs olyan szabályos állapot,
amiben egy régi kerettag így nézne ki.

**Négy horgony**, mind hideg útvonal:

1. `pruneChemistry()` — minden keret-változás átmegy rajta;
2. `bondMatchTick()` eleje — az utolsó védvonal az első könyvelés előtt;
3. a mentés betöltése — **a már elromlott karrier is meggyógyul**;
4. és a gyökér: a nyugdíj-pótlás ága most maga indítja el az ablakot. A
   `markArrived`-ból pontosan ezt az egy sort viszi át — a kihívás- és
   igazolás-számlálókba a klub saját pótlása továbbra sem való.

---

## 10n. Utóirat: a jutalom-játékos (3.8.31)

**BEJELENTETT HIBA, a 3.8.25 UTÁN:** *„megmaradt az összhang bug. Új játékost
megkaptam, betettem kezdőbe, nincs beilleszkedés, hanem kap azonnal egy
összhang értéket."* (A képen: `összhang: 5,6 · Idegenek`.)

### Két külön dolgot rontottam el

**1. Volt még egy érkezési út, amiről nem szólt senki.**

```js
function unlockRandomPlayer(){
  …
  drafted.add(newP.n);
  extraRoster.push(newP);
  NAT_BY_NAME[newP.n]=newP.nat;
  return newP;}          ← se markArrived, se bondStartIntegration
```

Ez a **„🔍 Új felfedezés"** út: a mesterhármas-, nagy győzelem- és
meccsember-jutalom, meg a scoutolóhálózat véletlen találata — pontosan az
„új játékost **megkaptam**". A 3.8.25 a szezonvégi nyugdíj-pótlást javította;
ez a második ilyen út volt, és ugyanúgy kimaradt.

**2. A 3.8.25 feltétele törékeny proxy volt.**

Az öngyógyítás azt kérdezte, van-e a játékosnak **bármilyen rögzített kötése**.
Elég egy pár meccs, amiben a kötései nulláról épülni kezdtek — és a rendszer
„réginek" látja azt, aki sosem illeszkedett be. A bejelentett játékos már
**5,6-os átlagon** állt: volt kulcsa, tehát az öngyógyítás átlépett rajta.

### A javítás

**A gyökér:** a jutalom-játékos is érkező (`bondStartIntegration`). A teljes
`markArrived` szándékosan nem fut le — ez nem igazolás: nem fizettél érte, és a
kihívás-számlálókba sem való. Ugyanaz a döntés, mint a nyugdíj-pótlásnál.

**A feltétel:** a proxy helyett **explicit jelölő**. Az `S.bondSeen` azoknak a
neveknek a halmaza, akiket az összhang-rendszer **már beengedett**. Aki a
keretben van és nincs benne, az érkező — akárhány kulcsa van, és akármelyik
úton került be. Aki kikerül a keretből, a jelölőből is kikerül: ha valaha
visszatér, a kötései már megsemmisültek, tehát **újra** érkező.

**A már elromlott mentés:** régi mentésben nincs `bondSeen`, tehát az első
futásnál mindenkit „látottnak" vennénk — a már megsérült játékos így örökre a
padlón maradna. Egy mérés szűri ki (`bondNeverIntegrated`): aki **nyolc
meccsnél kevesebbet** játszott nálad, **és** a kötés-átlaga a beilleszkedés
sávjának **alja alatt** van, az bizonyosan nem ment át az ablakon. Egy beállt
kerettag sosem néz ki így — az ő értékei a sávból indultak.

**És a HUB rajzolása is gyógyít**, hogy a keretlistán azonnal a helyes állapot
lássék, ne csak a következő meccs után.

### Mérve

60 meccsen érlelt keret, a jutalom-út valódi lépéseivel:

| eset | belépéskor | 2. meccs | 6. meccs | 8. meccs |
|---|--:|--:|--:|--:|
| **a hiba** (ablak nélkül) | 0 | **1,6** | **5,8** | — |
| javítva (a jutalom-játékos érkező) | 48 ideigl. | 2/8, 48 | — | átlag **47,3** |
| **régi, már elromlott mentés** | 6,4 | — | — | — |
| …a gyógyító kör után | 48 ideigl. | — | — | átlag **47,5** |
| beállt kerettag (nem téveszthetünk) | 59,3 | — | — | 59,3 — **ablakot nem kap** |

Az első sor a bejelentés: hat meccs után **5,8** — a képernyőképen 5,6.

---

## 11. Ami még hátravan

**Semmi — a rendszer kész.** Ami a tervből tudatosan kimaradt: az
ellenfeleknek nincs saját összhangja (a nulla-középpontú tag ezt kiváltja, és
a színlelt érték csak a közvetítés-szövegnek kellene), és a pályatérkép nem
mutatja a padon ülőkkel meglévő kötéseket (azt a játékos lapja mondja el).
