# Összhang — a modell

**Állapot:** 🟡 F1 kész (a szám épül, de MÉG NEM HAT) · **Verzió:** 3.8.00

*(Terv és ütemterv: `docs/osszhang-rendszer-terv.md`. Érintett kód: a
`BOND_*` konstansok, `bondKey/bondRaw/bondOf/bondSet/bondAdd/bondCapOf`,
`bondRoleMult/bondTacticMult/bondPersonMult/bondPassMult/bondTrainMult/
bondCatchMult/bondDamp`, `bondMatchTick`, `bondStartIntegration/bondRevealNew`,
`bondSeedFirstSquad/bondSeedValue/bondSeedConflict`, `bondPrune`,
`bondChemComplete`, `teamBond/bondPairWeight/playerBond`, `bondMigrate`.)*

---

## 1. Egy mondat

> Az összhang azt méri, **mennyire ismerik egymást** a játékosaid: két ember
> között 0–99, kizárólag **közösen pályán töltött mérkőzésekből** gyűlik, és a
> távozással megsemmisül.

**Nem morál.** A morál azt mondja meg, hogy *érzik* magukat — eredményre
ugrál, egy rossz sorozat elviszi. Az összhang azt, hogy mennyire *ismerik*
egymást — idényekben mérhető, és csak akkor vész el, ha valaki elmegy.

---

## 2. Mi az F1, és mi NEM

**Ez a fázis szándékosan felület nélküli.** A szám épül, mérhető, mentődik —
de **senkire nem hat**: nincs bekötve a csapaterőbe (az az F2), nincs
pályatérkép, nincs játékoslap-sor, nincs edzés-sáv.

Ennek oka van: egy szám, ami nem hat, **biztonságosan mérhető**. Le lehet
futtatni több idényt és megnézni, hova fut, mielőtt bármi ráépülne. Egyetlen
helyen látszik: a **diagnosztikában** (`── ÖSSZHANG (F1 …)` blokk).

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

## 11. Ami még hátravan

`F2` a meccsbe kötés (nulla-középpontú tag a `buildMatchSnapshot`
**sorosított** mezői közé) · `F3` a beilleszkedés felülete és az eladási
kiírás · `F3b` **kommentárok és meccs utáni üzenetek** · `F4` az
összhangtérkép · `F5` a játékoslap · `F6` az összhangépítés edzés-sáv ·
`F7` az összhang-edző · `F8` az első keret képernyője · `F9` hangolás.
