# Összhang-rendszer — tervezet és ütemterv

**Állapot:** 🟡 az F0 döntések megvannak, az **F1–F3 kész** (3.8.03) ·
**Cél-verzió:** 3.8.x · A megvalósult rész leírása: `docs/osszhang-rendszer.md`

*(Ez egy TERV-dokumentum, nem leírás. Amíg a fázisok le nem futnak, a benne
szereplő függvény- és mezőnevek javaslatok.)*

---

## 0. Az egymondatos ígéret

> Az összhang azt méri, **mennyire ismerik egymást** a játékosaid — lassan
> gyűlik, csak közös pályán töltött percből, és **egyetlen számként** ül rá a
> csapaterőre. Ettől lesz drága egy igazolás, és ettől lesz fájdalmas eladni
> valakit, aki tíz éve nálad játszik.

Ez a rendszer **öt meglévő rendszerrel érintkezik**, és a tervezés nehezebb
része nem az új kód, hanem az, hogy ezek ne mondjanak egymásnak ellent.

---

## 1. Mi van MÁR MEG a kódban

Ez a lista nem udvariasságból van itt: a terv fele arról szól, hogy a meglévőt
**nem duplikáljuk**.

| meglévő | mit csinál | ütközik? |
|---|---|---|
| **`S.chemPairs`** — párkémia | két játékos közti, 5 fázisú kötés; 5/5-nél ×1,10 gólsúly a párnak, +3%/pár csapat-λ (max 18%); pályaképen vonal; skill-pörgetésben prompt; `chemPairsDone` kihívás; taktika-begyakorlást gyorsít (`TACTICS[].chemRoles`) | **IGEN — frontálisan** |
| **`S.passChem`** — passzkémia (Tiki-Taka) | ugyanaz, párhuzamos tárban, saját csatornán | igen |
| **`CHEM` induló elemzés** | közös klub / nemzet / rivális / vezetői pár → `S.ratingAdj` állandó szezonra | **IGEN — ez a 11. pontod** |
| **Személyiség** | `leadI` (Vezetés 0–4), `coopI` (Együttműködés 0–5), `aggroI` (Temperamentum 0–4) — **minden játékoson már ott van** | nem, ez ajándék |
| **`S.morale`** | 0–100, célértéke a kapitányból + kémiából + edzőből; `moraleMod=(morál−50)/50×2,5` OVR | **fogalmilag igen** |
| **Edzés** | `S.training={main:{stat,groups},sec:{stat,groups}}`, 4 posztcsoport, max 2 csoport/edzés, ciklusonként **egy** váltás | nem — **ez a minta, amit másolunk** |
| **Stáb** | `COACH_TYPES` 10 típus, köztük **`chem` „Csapatkovács"**; 32+ év & 40 meccs nálad; fókusz: keret / posztcsoport / max **2** ember | **IGEN — a 7. pontod** |
| **`buildMatchSnapshot`** | `ovr = sum/11 + capMod + eventMod + coach.ovrMod + moraleMod + auraBonus + capExp + chFormMalus + teamMomentumAdj + balBonus + styleBonus` | nem — **ide fűzünk be egy tagot** |
| **`buildPitchBonds`** | már RAJZOL kötés-vonalakat (fehér folytonos = kész, arany szaggatott = épülő, ibolya = passzkémia) | igen, a 8. pontod ezt váltja |
| **`S.careerStats[n]`** | `{g,a,mvp,rc,inj,saves,cs,matches}` — van gólpassz-**összeg**, de **nincs gólpassz-PÁR** | hiányzik, kell |

---

## 2. A hét dolog, amire nem gondoltál

### 2.1 A párkémiával frontálisan ütközik — ez a legfontosabb döntés

A 3.i. pontod a kémiaépítést az összhang **bemenetének** veszi. Csakhogy a
párkémia ma már **ugyanaz a dolog**: pár-szintű, épülő, pályaképen látszó,
meccsre ható kötés. Ha mindkettő megmarad a mai formájában, a játékos két
majdnem azonos rendszert néz két külön vonaltípussal, és a hatásuk
**kétszer** számít bele ugyanabba a meccsbe.

**Javaslat — egy alap, két réteg:**

* **Az összhang a FOLYTONOS alap** (0–99), minden pár között, csendben gyűlik.
* **A párkémia marad DISZKRÉT ESEMÉNY**: a skill-pörgetés továbbra is felajánl
  egy párost, az 5 fázis továbbra is épül, és az elkészülte **nagy, egyszeri
  ugrást ad az adott pár összhangjába** (+25), *plusz* megtartja a mai saját
  hatásait (gólsúly, taktika-begyakorlás, `chemPairsDone` kihívás).

Így **semmi meglévő tartalom nem vész el**, a párkémia pedig értelmet kap:
ő a *szerkesztett*, te-választottad kötés, az összhang a *megélt*.

### 2.2 Ha a szám nincs KÖZÉPRE ÁLLÍTVA, elrontja az egész nehézségi görbét

Ez a legnagyobb egyensúly-kockázat, és nincs benne a felsorolásodban.

A 11. pontod szerint az első keret 0–45-ön indul; a 10. szerint egy új ember
15-ről. Ha a csapat-összhangot **egyenesen** kötjük az OVR-re, akkor minden
karrier egy **rejtett hendikeppel** indul, és a nehézség évről évre magától
csökken — miközben a ligaszint, a büdzsé és a kihívás-kalibráció mind a mai
görbére van hangolva.

**Javaslat:** a meccs-tag **nulla-középpontú** legyen.

```
bondMod = clamp( (teamBond − BOND_REF) / 40 × 2,5 ,  −2,5 , +3 )
BOND_REF ≈ 55   (a „szokásos", beállt csapat)
```

A ±2,5 nem véletlen: pontosan akkora, mint a **morál** tagja
(`(morál−50)/50×2,5`), és a kiállítás (`SIM.REDMATCH` = 2,5) súlyával
azonos. Egy szétesett öltöző ≈ egy emberhátrány. Egy tíz éve együtt játszó
csapat ≈ egy jó edző. Ez a helyes nagyságrend.

### 2.3 Az ellenfélnek nincs összhangja

A gépi ellenfél egyetlen szám. Ha te +3-at kapsz érettségért, a **teljes liga
könnyebb lesz**, nem csak a saját csapatod jobb. A 2.2 középre állítás ezt
nagyrészt megoldja (átlagos csapat ≈ 0 tag), de érdemes az ellenfélnek is adni
egy **színlelt, klubonként stabil** összhangot: csak a közvetítés-szövegnek és
a meccs előtti összevetésnek, a matekba nem szólva bele.

### 2.4 A párharcban a pillanatképbe KELL tenni

Ezen a kódbázison ez már **egyszer elsült**: a `styleOwnGoalMult()` /
`styleOppGoalMult()` a helyi állapotból olvasott, ezért párharcban a számoló
fél stílusa a társa csapatára is ráült, és ugyanaz a meccs más eredményt adott
attól függően, ki számolta ki. A `buildMatchSnapshot` kommentje ma is erről
szól.

**Az összhang-tagnak a `buildMatchSnapshot` visszaadott, sorosítható mezői
közé kell kerülnie** (`teamBond`, `bondMod`), nem szabad `matchLambdas`-ból
helyi függvényt hívni rá. Ez nem apróság — ez a rendszer 1. számú
determinizmus-csapdája.

### 2.5 Mi a különbség a morál és az összhang között?

A játékos ezt fogja kérdezni először, és ha nincs rá egymondatos válasz, a
rendszer zavaros marad.

| | **morál** | **összhang** |
|---|---|---|
| mit mér | hogy **érzik magukat** | mennyire **ismerik egymást** |
| mitől mozdul | eredmény, esemény, kapitány | közösen lejátszott perc |
| tempó | meccsről meccsre ugrál | idényekben mérhető |
| elveszíthető? | igen, egy rossz sorozattal | csak ha valaki **elmegy** |

**Következmény:** a morál célértékét ma a „kémia" is alakítja. Ha az összhang
bejön, **az vegye át ezt a bemenetet** — különben két öltözői szám ugyanabból
a dologból táplálkozik.

### 2.6 Az 55 vonal egy hajszálgombolyag

Tizenegy emberen **55 pár** van. Ha mindet kirajzoljuk, a térkép olvashatatlan.
A hét fokozatod alsó két szintje („halvány ritkán szaggatott") jó ösztön —
tedd meg **szabállyá**:

* alapból csak a **4. fokozattól** (folytonos) rajzolunk;
* egy játékosra koppintva **az ő összes** kötése előjön, a többi elhalványul;
* egy kapcsoló („mindent mutass") a teljes hálót kirakja.

**A piros a legmagasabb fokozatra kockázatos:** ebben a játékban a `--red`
mindenhol a *rossz* (piros lap, büntetés, csökkenő érték). A csúcs-kötés
piros vonala tanult jelentéssel ütközik. Javaslat: a csúcs legyen **arany**
(a játék „legjobb" színe), vagy ha ragaszkodsz a piroshoz, akkor a
jelmagyarázat mondja ki, hogy itt az izzást jelenti.

### 2.7 Amiről egyáltalán nem esett szó

* **Rossz viszony.** Ma van `badPairs` (rivális klubok, 75%-ban feszült). Egy
  tisztán 0–99-es pozitív skála ezt elveszíti. Javaslat: **ne legyen negatív
  szám** — a konfliktus **plafont** adjon (pl. max 40, amíg fel nem oldódik).
  Egy szám marad, a dráma megvan.
* **A kapitány.** Van kapitány-rendszer (`capMod`, `captainAgeExpBonus`). Ha
  bárminek, hát ennek épp az összhanghoz kellene köze legyen — ingyen,
  tematikus nyereség.
* **A pad.** Aki nem játszik, nem gyűjt. Ez helyes, de a forgatást
  megdrágítja, és sérüléshullámnál büntet. Az **összhangépítés edzés-sáv**
  pont ezt oldja meg: a nem játszó is épít, csak lassabban. Jó szinergia —
  ez a sáv nem díszlet, hanem szükséges ellensúly.
* **A felállás-váltás.** Ha átállsz 4-4-2-ről 4-3-3-ra, elvész a védő↔VKP
  kötés? **Nem szabad.** A kötés két EMBER között van; a poszt csak azt szabja
  meg, milyen **gyorsan épül** és mennyit **számít** — nem törli.
* **Az eladási képernyő.** Ha az összhangnak súlya van, a *„Biztosan eladod?"*
  ablaknak **ki kell írnia, mennyi összhang vész el vele**. Enélkül a
  rendszer csak számol, de nem „ad súlyt az igazolásoknak" — pedig az volt a cél.
* **Tempó.** A játékban van `tempoMult()` / `devTempo()` lassítás (Infinity,
  európai kupa fele, felkészülési kupa negyed tempó). Az összhang-gyűlésnek
  **át kell mennie ezen**, különben ez lesz az egyetlen rendszer, ami elszalad.
* **Mentés-migráció.** A régi mentésekben nincs összhang. Kell `freshS()`
  alapérték, kell a két explicit mezőlista (mentés ~66800, betöltés ~67200),
  és kell egy **magvetés a meglévő `chemPairs`-ből**, hogy egy futó karrier ne
  nullázódjon.
* **Az akadémia és a kölcsön.** Rájuk is a 8 meccses beilleszkedés vonatkozik?
  (Javaslat: igen, de a saját nevelésű **12-ről** induljon magasabbról — ő már
  ott volt.)

---

## 3. A javasolt modell

### 3.1 Tár

```js
S.bonds = { "Név A§Név B": v }        // v: 0..99, egész
S.bondNew = { "Név": {m:0, seed:null} }   // beilleszkedés: hány SAJÁT meccs telt el
```

Egy 28 fős keret 378 párt jelent — laposan tárolva ~8 KB, elfogadható.
A `pruneChemistry()` mintájára kell egy `pruneBonds()`: aki kikerül a
keretből, azzal minden kötés törlődik.

### 3.2 Két külön csatorna — ez a terv gerince

A felsorolásod 3. pontja hét dolgot sorol egy kalap alá. Ezeket **szét kell
választani**, mert a fele **építési sebesség**, a másik fele **olvasási súly**:

| a te pontod | **ÉPÍTÉSI ütem** (mennyivel nő a pár) | **OLVASÁSI súly** (mennyit ér a csapat-számban) |
|---|---|---|
| 3.i kémiaépítés | ✅ nagy ugrás elkészültekor | — |
| 3.ii közös múlt | ✅ kezdőérték | — |
| 3.iii személyiség | ✅ szorzó | — |
| 3.iv pozíciók | ✅ szorzó | ✅ **súly** |
| 3.v taktika | ✅ szorzó | ✅ **súly** |
| 3.vi felállás | — | ✅ **súly** |
| 3.vii összhang-edzés | ✅ szorzó | — |

**Miért ez a szétválasztás a legfontosabb javaslatom:** ha a felállás és a
taktika az *olvasási* oldalon ül, akkor a csapatszám **azonnal** reagál, amikor
két embert felcserélsz a pályán. A játékos rögtön látja, mit csinált. Ha
mindent az építési oldalra teszel, a felállás-változtatás hatása három hónap
múlva jelenik meg — az nem visszajelzés, az zaj.

```js
teamBond = Σ(w_ij × bond_ij) / Σ(w_ij)     // csak a PÁLYÁN lévő 11-ből, 55 pár
```

ahol `w_ij` = pályatávolság-közelség × taktika-szerep-párosítás × sorpáros.
A szomszédos védőpáros súlya nagy; a kapus és a jobbszélső súlya kicsi.

### 3.3 Meccsenkénti gyűlés

```
Δ_ij = ALAP × tempoMult
     × posztszorzó(i,j)          (szomszéd 1,4 · sor 1,2 · távoli 0,7)
     × taktikaszorzó             (TACTICS[].chemRoles párja: 1,5)
     × edzésszorzó               (fő 1,8 · másodlagos 1,3 · nem edzett 0,8)
     × személyiségszorzó         (coop, lead, aggro — lásd 3.4)
     × passzszorzó               (a két Passz attribútum átlaga, 0,9–1,15)
     × élményszorzó              (győzelem 1,25 · egymásnak gólpassz 2,0 aznap)
     × csillapítás(bond)         (magas értéknél lassul: 99 elérhetetlen közeli)
```

**A csillapítás nem opcionális.** Enélkül minden pár 99-re fut, és a rendszer
elveszti a jelentését. Javaslat: `(1 − bond/110)^1,5`.

**A „gólpassz egymásnak" (6. pontod) új könyvelést igényel:** ma csak a
gólpassz-összeg van meg (`careerStats[n].a`), a **pár** nincs. A meccsmotorban
a gól eseményénél ott van a lövő és a passzoló is — onnan kell egy
`bondAssistPair(as, sc)` hívás.

### 3.4 A személyiség végre kap szerepet

Ma a három tulajdonság gyakorlatilag dísz. Itt lesz belőle mechanika:

* **Együttműködés** (`coopI`) — a pár *mindkét* tagjáé számít; ez a fő szorzó
  (Bajkeverő 0,7 → Imádott 1,3).
* **Vezetés** (`leadI`) — aszimmetrikus: a magas vezetésű ember **mindenkivel**
  gyorsabban épít, és a kapitány kap még egy rátétet.
* **Temperamentum** (`aggroI`) — két Lobbanékony együtt lassabban ér össze; a
  Kiegyensúlyozott a legjobb ragasztó.

### 3.5 A beilleszkedés (10. pont) — a lyuk és a foltja

A javaslatod jó, de három résen szivárog:

1. **„8 meccs" = az Ő meccsei**, nem a csapaté. Egy cserejátékos különben
   fél idényig 15-ön ragad.
2. **A 15 nem semleges, hanem *átmenetileg jó*.** Egy beállt csapatban a
   valós átlag 60 fölött van, tehát az új ember a 8 meccs alatt **húzza lefelé**
   a csapatszámot — ez így helyes és szándékos, de **ki kell írni**, különben
   a menedzser nem érti, miért esett a csapatereje az igazolás után.
3. **A 8. meccs egy szakadék.** 15-ről lehet 4-re esni. Javaslat: a 4.
   meccstől kezdve egy **halvány jelzés** a játékos lapján („nehezen szokik" /
   „gyorsan érzi a helyét"), hogy a leleplezés fizetség legyen, ne csapás.

### 3.6 Az összhangépítés edzés-sáv (3.vii)

**Pontosan az `S.training` mintájára**, mert az bevált, és a játékos már
ismeri a felületet:

```js
S.bondTrain = { main:{group:"VEDO_VEDO"}, sec:{group:"VEDO_KOZEP"} }
```

**Kell hozzá ellentétel**, különben mindenki maxolja: ami nincs a két sávban,
az **0,8×** ütemben épül. Nincs új valuta, nincs új pénzköltés — ugyanaz a
„ciklusonként egy váltás" korlát, mint az edzésnél.

A csoportok két fajtából: **posztcsoport-párok** (a meglévő `TRAIN_GROUPS`-ból
képezve) és **megbízás-alapú** párok (szélső↔szélső, középpályás↔árnyékék,
szélső↔középcsatár, védő↔védekező középpályás). Az utóbbi a `slotRoles`-t
olvassa, tehát **a felállásoddal együtt mozog** — ez szándékos: a specifikus
sáv csak akkor ér valamit, ha tényleg úgy is játszol.

### 3.7 Az összhang-edző (7. pont)

**Ne 11. típus legyen.** Már van `chem` „Csapatkovács", aki az öltözői kémián
dolgozik. Ő **legyen** az összhang-edző — a mai hatása amúgy is ebbe az
irányba mutat.

A 4 fókusz-ember viszont valódi változás: ma `COACH_FOCUS_MAX_PLAYERS=2`, és a
fókusz-matek 100 figyelem-egységet oszt szét (szűkebb fókusz = fejenként több,
összesen kevesebb). A 4-es fókusz **saját sort kap** ebben a táblában.
Jogosultság: 32+, 40 meccs nálad **és** a nála mért csapat-összhang átlaga egy
küszöb fölött — a belépő Szakértelme ebből skálázódjon.

---

## 4. Ütemterv

A sorrend elve: **a szám előbb legyen mérhető, mint látható, és előbb legyen
kiegyensúlyozott, mint szorzókkal megfejelt.** Minden fázis külön commit,
külön `tools/check.sh` és külön mérés.

| # | fázis | mit szállít | miért itt | kockázat |
|---|---|---|---|---|
| **F0** | **Döntések** | a lenti 6 kérdés eldöntve | kód nélkül olcsó visszalépni | — |
| **F1** ✅ | **A modell** (kész, 3.8.00) | `S.bonds`, `bondOf`, meccsenkénti gyűlés, `teamBond()`, `pruneBonds()`, mentés/betöltés + magvetés a `chemPairs`-ből. **A meccsre MÉG NEM hat.** Egy rejtett kiírás mutatja | egy szám, ami senkire nem hat, biztonságosan mérhető: lefuttatunk 5 idényt és megnézzük, hova fut | alacsony |
| **F2** ✅ | **A meccsbe kötés** (kész, 3.8.01) | `bondMod` a `buildMatchSnapshot`-ba **és a sorosított mezők közé** (2.4!); a `BOND_REF` beállítása; a csapaterő-sáv jelölése | itt dől el az egyensúly — előbb, mint hogy bármi UI ráépülne | **magas** |
| **F3** ✅ | **A beilleszkedés** (kész, 3.8.03) | 8 saját meccs, a 4. meccstől jelzés, beilleszkedési jelentés; **az eladási és vásárlási megerősítő kiírja az összhang-tételt** | ez a bejelentett cél („súly az igazolásoknak") — amint a szám hat, ez azonnal kell | közepes |
| **F3b** | **Kommentár és üzenetek** | meccs közbeni kommentárok a nagyon jól / rosszul működő összhangra (páros, posztcsoport, csapat), és meccs utáni üzenet, ha egy kötés SZINTET LÉPETT | a fokozat-küszöbök az F4 skálájából jönnek, de a szöveg nem vár rá | alacsony |
| **F4** | **Összhangtérkép** | kapcsoló a pályaképen, 7 fokozat, rajzolási küszöb (2.6) | most már van mit mutatni | közepes (rajz) |
| **F5** ✅ | **A játékos lapja** (az F3-mal együtt elkészült) | csapat-összhang + top 3 személyes, a Statzone mellé | olcsó, és az F4 fokozat-skáláját újrahasználja | alacsony |
| **F6** | **Összhangépítés** | a második edzés-sáv, posztcsoport- és megbízás-párokkal | szorzó egy MŰKÖDŐ rendszerre | közepes |
| **F7** | **Az összhang-edző** | a `chem` típus átalakítása, 4-es fókusz, jogosultság | szorzó a szorzóra — legkésőbb | közepes |
| **F8** | **Az első keret** | 0–45 skála + 60-as extra, a közös múlt nagyobb súlyával, egy összefoglaló képernyővel | ez az F1 magvetésének a *csinosabb* változata; addig a nyers magvetés is elég | alacsony |
| **F9** | **Hangolás + dokumentáció** | mérés 10 idényen, `docs/osszhang-rendszer.md`, fogalomtár-szócikk, vezetett élmény | — | — |

**Ha csak három fázisra van energia:** F1 + F2 + F3. Az már teljes értékű
rendszer — épül, hat, és az igazolásnak súlya lesz. Az F4–F7 mind
*megjelenítés és szorzó* egy már működő magra.

---

## 5. Az F0 döntései — megvannak

| # | kérdés | **döntés** |
|---|---|---|
| 1 | a párkémia sorsa | **marad diszkrét eseményként**, nem olvad be; minden mai értéke és hatása megmarad, és +25-öt ad az adott pár összhangjába |
| 2 | középre állított meccs-tag | **igen** |
| 3 | átveszi-e a morál „kémia" bemenetét | **igen** (F2-ben) |
| 4 | a csúcs-vonal színe | **arany** |
| 5 | konfliktus-plafon | **igen, 40** — a döntés indoklása lent |
| 6 | az összhangépítés ellentétele | **a 0,8× lassítás, pénz nélkül** — az indoklás lent |

### 5.1 Miért plafon, és miért 40 (5. kérdés)

Nem negatív számmal, mert az egy **második előjelet** vinne a rendszerbe: a
csapatszám így nem lenne értelmezhető egyetlen skálán, és a „mennyit ér a
csapatom" kérdésre két különböző előjelű részből kellene válaszolni. A plafon
ugyanazt a drámát adja **egy** skálán: a feszült pár együtt is játszhat, épül
is köztük valami, de nem lesz belőlük tengely.

A 40 azért ennyi, mert a **beállt csapat 55 körül jár** (`BOND_REF`): a
plafonos pár tehát érezhetően a csapat alatt marad, de nem nulla — egy
feszültség nem szünteti meg, hogy két profi együtt tud dolgozni.

Két forrása van, **egy olvasóval**: a tárolt (rivális klubok, az induló
elemzésből és a későbbi igazolásoknál ugyanazzal az aránnyal), és a számolt
(Bajkeverő + Lobbanékony) — utóbbi a meglévő adatból következik, tehát nincs
mit tárolni.

### 5.2 Miért nem kerül pénzbe az összhangépítés (6. kérdés)

**A 0,8× lassítás elég fék, és jobb fék, mint a pénz.**

* A játékban **már sok pénznyelő van** (igazolás, bér, boost, poszt-tanulás,
  stáb-hely, akadémia). Egy újabb azt jelentené, hogy az összhang a *gazdag*
  menedzser kiváltsága — pedig épp az ellenkezője a célja: a szegény klub
  fegyvere az, hogy **együtt tartja** a keretét.
* A lassítás **valódi döntést** kényszerít: ha a védelmet edzed, a támadósor
  lassabban ér össze. Ez ugyanaz az áldozat-szerkezet, ami az
  attribútum-edzésnél már bevált, és a játékos **ismeri is** — nem kell új
  fogalmat megtanulnia.
* A stáb-figyelemhez kötés a **Csapatkovácsot** duplán terhelné: ő az F7-ben
  amúgy is az összhang edzője lesz. Két kapu ugyanarra a rendszerre
  átláthatatlan.

Marad tehát a bevált minta: **fő + másodlagos sáv, ciklusonként egy váltás**,
és ami kimarad, az 0,8× ütemben épül.

---

## 6. Összefoglalva: elég kidolgozott-e?

**A váz jó**, és három dolgot kifejezetten eltaláltál: a 99-es plafon
zárva hagyását, a beilleszkedési ablakot, és azt, hogy a leggyengébb
kötések vizuálisan majdnem láthatatlanok legyenek.

**Ami hiányzott, az szinte mind INTEGRÁCIÓ, nem mechanika:** a párkémiával
való ütközés, a nehézségi görbe elcsúszása, a párharc-determinizmus, a
morál-határvonal, és az, hogy az eladási képernyőnek ki kell írnia a
veszteséget. A mechanikai listád önmagában majdnem teljes — egyetlen valódi
hiány van benne: **nincs csillapítás**, ami nélkül minden pár 99-re fut.
