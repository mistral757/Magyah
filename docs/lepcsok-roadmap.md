# 🪜 Lépcsők a csúcs felé — az egyjátékos élmény feloldás-rendszere

**Állapot:** a roadmap a teljes tervet rögzíti; a fázisok külön-külön
szállíthatók. A *Kész* jelölés a tényleges beépítést jelenti, nem a tervet.

---

## 0. Miért kell ez

A játék ma **minden kapcsolót azonnal odaad**: egy először induló ember
huszonöt beállítás elé kerül, amiből egyet sem tud megítélni — nem tudja, mit
jelent a „Lépést tartanak", mit ér egy újrapörgetés, miért számít a Rating
alapja. A választás lehetősége így nem szabadság, hanem **zaj**.

A lépcsős feloldás ezt fordítja meg: **a játék tanít, a kapcsolók pedig
jutalmak.** Aki felér a csúcsra, annak a következő lépcső nyílik ki — és
mindig **kimondjuk**, mit nyitott ki és mivel.

**Kimondott kérés (a teljes terv forrása):**

> „Telepítés után csak a Gyere 1v1 és a Kezdőrúgás választható. A kezdőrúgás is
> specifikusan. Győzni kell, hogy kinyíljanak a kapcsolók. Hagyományos karrier
> az alap beállítás, ott megyünk 3 lépcsőn, a 3 lépcső a 3 D1-es győzelemig
> eljutás."

---

## 1. Az alapfogalmak

| fogalom | mit jelent | hol él |
|---|---|---|
| **D1-győzelem** | a piramis LEGFELSŐ osztályának bajnoki címe | karrieren átívelő számláló |
| **Run** | egy lezárt, a Run-ranglistára felkerült karrier | `runBoardLoad()` |
| **Run-szint** | a lezárt karrier Run-pontszáma (0-100) | `runBoardLoad()[].run` |
| **feloldás-napló** | a karriereken ÁTÍVELŐ állapot | új `localStorage` kulcs |

**A napló külön kulcson él, nem a mentésben.** Egy feloldás a JÁTÉKOSÉ, nem a
karrieré: aki hármat nyert, annak a negyedik karrierjében is nyitva marad
minden. A mentés törlése (`mentes-torles.md`) ezért szándékosan **nem** viszi
el a naplót.

---

## 2. A három kezdő lépcső (a D1-ig)

Telepítés után **kizárólag** a *Gyere 1v1* és a *Kezdőrúgás* választható, és a
Kezdőrúgás is **kötött beállítással** indul. A kötöttség lépcsőnként lazul.

| | 1. lépcső | 2. lépcső | 3. lépcső |
|---|---|---|---|
| karrier | hagyományos | hagyományos | hagyományos |
| kezdés | draft | draft | draft |
| **kezdő osztály** | **D3** | **D3** | **D3** |
| **a mezőny Ratingje** | **78** | **80** | **80** |
| nemzeti válogatottak | **nincs** | nincs | nincs |
| Rating | csúcson | csúcson | csúcson |
| családtag | **nincs** | nincs | nincs |
| újrapörgetés | **5** | **3** | **szabadon** |
| ellenfél-tempó | Lassan követnek | Lassan követnek | **Lépést tartanak** |
| játék-tempó | Alap | Alap | Alap |
| ikonok | megszokott | megszokott | megszokott |
| vezetés | teljes | **állítható** | állítható |
| skillek | lazán | lazán | lazán |
| **kezdő nehézség** | **78** | **80** | **80** |

A lépcsőt egy **D1-győzelem** lépteti. A harmadik után nyílik a szabad
beállítás első köre.

**A „78-as kezdő nehézség" a MEZŐNY Ratingje, nem a rés.** A kérés szó szerint
így szólt: *„78-as nehézségi szint (nem a követési távolság, hanem mindenképp
78-as kezdő nehézség)"*. A világ eltolását ezért a kívánt mezőnyszintből
számoljuk vissza (`unlockUpForField`), és a rés abból következik, milyen keretet
draftoltál — nem fordítva.

**Az osztályt és a rajt nehézségét a lépcső dönti el, nem az ajánló.** Ez a
kettő nem a beállító képernyőn lakik, hanem a draft utáni külön képernyőn
(`#scPyrDiv`) — az első kiadásban kimaradt a zárból, és az osztályt ott az
ajánló választotta (a D2-t). A lépcsőn ez a képernyő **nem kérdez**: a
választók helyett egy kimondás áll (mit kaptál és miért), a magyarázó szöveg
pedig marad, mert egy először induló embernek épp az kell.

---

## 3. A feloldás-táblázat

### 3.1 D1-győzelmek

| győzelem | mi nyílik ki |
|---|---|
| 3. | kezdő nehézség-állító · Rating-kapcsoló · „Rating a szezonban" mód · **D4**-ből indulás |
| 4. | **D5** · kártyánként lutri mód |
| 5. | **D6** · kész klubos indulás · **dinamikus mód** (ott minden kapcsoló alapból nyitva) |

### 3.2 Igazolások

| feltétel | mi nyílik ki |
|---|---|
| 10 leigazolt ikon | ikon-sűrűség **2. szint** (ritkábban) |
| további 10 (20) | **3. szint** (nagyon ritkán) |
| további 2 (22) | **4. szint** (kikapcsolva) |
| 20 nemzeti válogatott játékos | a **nemzeti válogatottak** kapcsoló |

### 3.3 Képességek

| feltétel | mi nyílik ki |
|---|---|
| egy játékosnak 10 skillje **vagy** összesen 100 skill | **realisztikus skill** mód |

### 3.4 Run-szintek → tempó-fokozatok

A gyűjtés az **1.** Runnal indul, de a kapcsolók a **3.** Runtól nyílnak.

| Run-szint | mi nyílik ki | kulcs |
|---|---|---|
| *(2. lezárt karrier)* | ellenfél-tempó **+1** (Lépést tartanak) | `tarto` |
| 30 | játék-tempó **−1** (Komótos) | `komotos` |
| 40 | ellenfél-tempó **−1** (Alvó) és **+2** (Kegyetlen) | `alvo`, `kegyet` |
| 50 | játék-tempó **−2** (Csigatempó) | `csiga` |
| 60 | ellenfél-tempó **+3** (Könyörtelen) | `konyortelen` |
| 70 | játék-tempó **−3** (Gleccser) | `gleccser` |
| 75 | ellenfél-tempó **+4** (Végtelen menet) | `vegtelen` |
| 80 | játék-tempó **−4** (Jégkorszak) | `jegkorszak` |
| 90 | játék-tempó **−5** (Kőkorszak) | `kokorszak` |

Az **alapfokozat** (Lassan követnek) és a **gyorsítások** (Alap tempó, Gyors,
Villámfejlődés) nem kapnak kaput — azok mindig a játékoséi.

### 3.5 A hányadik karriered → csapatstílusok

| karrier | stílus |
|---|---|
| 1. | 🧱 Beton védelem · ⚽ Bombázók |
| 2. | ⚡ Hol jön a mennydörgés? |
| 3. | ⭐ Sztárom a párom |
| 4. | 🌀 Tiki-Taka |
| — | ☯️ Béke és harmónia *(a meglévő szabály szerint)* |
| **külön** | 🛡️ **Panzerkampfwagen**: a kezdő draftodban legyen **14 negatív jellemvonás**. Szürkén, a feltétellel ráírva látszik. |

**Az „N. Run" olvasata.** A kérés úgy szólt, hogy „1. Run csapatstílusok
nyitva: bombázók, betonvédelem". Ezt úgy értelmezzük, hogy **a te N-edik
futásodban** — nem úgy, hogy N *lezárt* futás kell hozzá. A másik olvasat
szerint az első karrierben egyetlen stílus sem volna választható, pedig a
stílusválasztó már az első idény végén elém áll: az nem lépcső volna, hanem
fal. A kódban ezért `runs >= N−1` (a `runs` a lezárt futásokat számolja).

**Mi számít negatív jellemvonásnak.** Nem új fogalom: pontosan az a három
állapot, amit a játék saját öltözői eseményrendszere (`PERSONALITY_EVENTS`) is
negatívként kezel — vezetői képesség *Gyenge* (`leadI===0`), társas alkat
*Bajkeverő/Öntörvényű* (`coopI<=1`), temperamentum *Temperamentumos/Lobbanékony*
(`aggroI>=3`). Egy emberen mindhárom meglehet, tehát a 15 fős kezdő keret elvi
maximuma 45 — a 14 valódi, de elérhető vállalás.

---

## 4. A visszajelzés

* **Üdvözlő üzenet** — az ELSŐ Kezdőrúgás-koppintáskor. Elmondja, mi ez a
  játék, és milyen lépcsőkön vezet végig. Teljesen ismeretlen embernek is
  érthetően, szakszó nélkül.
* **Feloldás-ablakok** — a D1-győzelem pillanatában, **külön** ablakban, nem a
  Run-leírásba olvasztva. Egy ablak = egy feloldás. Egyszerű, letisztult,
  követhető. Több egyszerre nyíló feloldás **sorban** jön, nem egyszerre.

---

## 5. Fázisok

### ✅ 1. fázis — a gerinc *(kész: 3.9.46)*

| mi | hol |
|---|---|
| feloldás-napló, külön `localStorage` kulcson (`30-0-unlock-v1`) | `unlockBlank` / `unlockState` / `unlockSave` |
| a D1-győzelem számlálója | `unlockNoteD1` ← `runNotePyrTitle` |
| az igazolás-számlálók (ikon, nemzeti válogatott) | `unlockNoteSigning` ← `markArrived` |
| a képesség-számlálók (összeg + egy emberen a csúcs) | `unlockNoteSkill` ← `noteSkillEver` |
| a Run-számok | `unlockSyncRuns` — **származtatott**, a Run-ranglistából |
| egységes kapu-API | `unlockHas(id)`, `unlockSpeedOk`, `unlockTempoOk`, `unlockStep` |
| a három lépcső presetje | `UNLOCK_PRESETS` → `unlockApplyPreset` ← `enterCareerSetup` |
| a beállító képernyő zárai | `UNLOCK_LOCK_SEL` → `unlockApplyLocks` ← `updatePyrSetupVisibility` |
| a kezdőlap kapui | `heUnlockSync`, `$("mpSoloBtn")` |
| az üdvözlő ablak | `unlockWelcomeShow`, `#unlockWelcome` |
| a feloldás-ablak | `UNLOCK_CARDS`, `unlockShow` / `unlockDrain`, `#unlockCard` |
| „VB-, EB-győztes…" → **Nemzeti válogatottak** | `#wcToggleGrid` |

**Próba:** `node tools/lepcsok-proba.js` — 160 állítás (mind a hat fázis).

**Két döntés, amit érdemes tudni:**

* **A Run-számok SZÁRMAZTATOTTAK, nem könyveltek.** Ha külön számlálót
  vezetnénk, az csak a rendszer bevezetése UTÁN lezárt futásokat ismerné el —
  aki eddig tíz karriert vitt végig, nulláról indulna. A `runBoardLoad()`
  listájából számolva a napló **visszamenőleg** is helyes.
* **A zárolás `disabled`, nem elrejtés.** A felhasználónak LÁTNIA kell, mi vár
  rá — a szürke vezérlő cél, a hiányzó vezérlő nem az. Egyetlen kivétel a
  kezdőlapi útválasztó: a lépcsőkön ott EGY út van, tehát a választás maga
  értelmetlen (a nagy Kezdőrúgás-gomb viszi).

**Egy latens hiba, amit ez a fázis kihozott:** a `#pyrSpeedGrid` az egyetlen
rács, ami teljesen újraépül (`innerHTML=""` + új gombok). A `disabled` a RÉGI
gombokon volt, tehát egy újrarajzolás a **vendég-átnéző zárát is** csendben
leverte róla — a vendég átállíthatta volna a közös világ ellenfél-fokozatát. A
zár mostantól a `renderPyrSpeedGrid` végén kötődik vissza, mindkét okra.

### ✅ 2. fázis — a D1-lépcsők feloldásai *(kész: 3.9.46)*

| mi | hol |
|---|---|
| az EGYES választások kapui (Rating a szezonban, lutri, kész klub) | `UNLOCK_GATES` → `unlockApplyGates` |
| a piramis mélysége (D4/D5/D6) | `unlockDivMax` / `unlockDivWhy` |
| a zárt osztály a listán — szürkén, a feltétellel | `renderPyrDivPick` |
| az ajánlás sosem esik zárt osztályra | `pyrRecommendDiv` |
| a megerősítés sem indíthat zárt osztályból | `pyrConfirmDiv` |
| a dinamikus karrier | `heUnlockSync` (1. fázis) |
| a feloldás-ablakok a győzelem pillanatában | `unlockNoteD1` (1. fázis) |

**A HIBA, AMIT EZ A FÁZIS JAVÍTOTT — a sajátom, az 1. fázisból.** Az
`unlockApplyLocks` a lépcső VÉGÉN mindent feloldott, tehát a 3. bajnoki cím
után a „kártyánként lutri" és a „kész klub" használhatóvá vált, pedig az
`unlockHas` szerint még zárva volt. Egy feloldás-rendszernek **egy** igazsága
lehet. Ezért van most **két réteg**, és ez a különbség szándékos:

* a **lépcső-zár** az EGÉSZ rácsot zárja („még nem te állítod be"), és a 3.
  címmel véget ér;
* a **kapu** EGY gombot zár („ez a lehetőség még nincs kinyitva"), és a saját
  feltételéig áll — a 4., az 5. címig, vagy tovább.

A kapu **mindig a lépcső-zár után fut**, mert az szigorúbb.

**A felirat a gombra kerül.** Egy szürke gomb magyarázat nélkül hibának
látszik; a feltétellel ráírva viszont **cél**. Az eredeti feliratot a
`data-unlock-sz` őrzi, hogy a feloldás pillanatában visszatérjen.

### ✅ 3. fázis — a Run-alapú feloldások *(kész: 3.9.46)*

| mi | hol |
|---|---|
| ellenfél-fokozatok Run-szint szerint | `UNLOCK_SPEED_RUN` → `unlockSpeedOk` / `unlockSpeedWhy` |
| játék-tempó Run-szint szerint | `UNLOCK_TEMPO_RUN` → `unlockTempoOk` / `unlockTempoWhy` |
| csapatstílusok a hányadik karriered szerint | `UNLOCK_STYLE_RUN` → `unlockStyleOk` / `unlockStyleWhy` |
| a Panzer külön feltétele | `UNLOCK_PANZER_NEED`, `unlockBadTraits`, `unlockNoteDraft` ← `placeBench` |
| a **„már kinyitottad" jóváírás** | `unlockGift` / `unlockMigrate` / `unlockGiftFromSave` |
| magyar toldalék a számokhoz | `huTold` / `huSzam` |

**A JÓVÁÍRÁS — ez a fázis legfontosabb döntése.** A kapuk olyan vezérlőkre
kerültek, amiket eddig bárki szabadon használt, a roadmap 6. pontja viszont
kimondja: a rendszer **nem vesz el semmit**. A kettő csak úgy fér össze, ha
akinél egy fokozat **már használatban volt**, az véglegesen megkapja — akkor
is, ha a Run-szintje még nem érne el odáig. Ez nem kivétel, hanem a szabály
másik fele: a jóváírás ugyanolyan végleges, mint bármelyik kiérdemelt
feloldás, csak más okból jár.

Három forrásból gyűlik:

1. **egyszeri átállás** (`unlockMigrate`, `seen.migrate`) — a tárolt
   játék-tempó és a Run-ranglista bejegyzéseinek stílusa/fokozata;
2. **minden mentés-betöltéskor** (`unlockGiftFromSave`) — ez fogja meg azt, aki
   épp egy karrier közepén tart és még semmit nem zárt le;
3. **a lépcsők presetje** (`unlockApplyPreset`) — amit a játék maga adott rád
   egy egész karrierre, azt nem veheti el utána. Enélkül a 3. lépcső „Lépést
   tartanak" fokozata és a Run-kapu egymásnak feszülne.

A Run-bejegyzés mostantól a **fokozatot** is viszi (`speed`), hogy a jóváírás
egy régebbi futásból is felismerje, mit használt valaki.

**Két hiba, amit ez a fázis kihozott:**

* A **kapu-azonosítót string-műtéttel képeztem** (`"tikitaka"` →
  `"styleTikitaka"`), a szabály viszont `"styleTiki"` néven állt — a kapu
  csendben átengedte a Tiki-Takát. Egy string-műtét nem lehet a kapu igazsága;
  most egy táblázat dönt, kulcsra.
* A **tempó-rács a szkript elején rajzolódik ki**, a feloldás-napló viszont a
  szkript végén áll fel: az első rajzoláskor a napló konstansai még a TDZ-ben
  vannak, a kapu-kérdés kivételt dob, a `try/catch` elnyeli — és a rács **zár
  nélkül** maradt ott, ahol a felhasználó tényleg dönt. A kapuk ezért
  mostantól újrarajzolják a rácsokat (`unlockRefreshGrids`).

### ✅ 4. fázis — a gyűjtő feloldások *(kész: 3.9.46)*

| mi | feltétel | hol |
|---|---|---|
| ikon-sűrűség 2/3/4. szintje | 10 / 20 / 22 leigazolt ikon | `UNLOCK_GATES` + `UNLOCK_GATE_COUNTS` |
| nemzeti válogatottak a draftban | 20 válogatottbeli játékos | ugyanott |
| realisztikus képesség-mód | 10 egy emberen **vagy** 100 összesen | ugyanott |

**A felirat a saját állását mondja, nem a küszöböt.** „Még 6 hiányzik (14/20)"
sokkal többet mond, mint „20 ikon kell" — a `UNLOCK_GATE_COUNTS` ezért a
számlálót is megnevezi, nem csak a határt.

**A jóváírás itt is jár, és a létrát is figyeli.** Az ikon-sűrűség négy
fokozata *létra*: aki ma a harmadikat használja, annak a második is jár
(`UNLOCK_ICON_GATE_OF`) — máskülönben a jóváírás egy olyan állapotot hagyna,
amiből nincs visszaút a köztes fokozatra. A válogatott-kapcsoló a boot-kor
`localStorage`-ból áll be, a kapunál **korábban**, ezért a kapu külön visszaveszi,
ha nincs jóváírva.

**A küszöb átlépése a pillanatban szól** (`unlockNoteSigning` /
`unlockNoteSkill` → `unlockShow`), nem a következő beállító képernyőn,
magyarázat nélkül. A képesség-módnál két út vezet ugyanoda (10 egy emberen vagy
100 összesen), ezért ott az **állapotváltást** figyeljük, nem egy konkrét
számot.

### ✅ 6. fázis — az első játékmenet visszajelzései *(kész: 3.9.47)*

Négy hiba egy valódi első szezonból, és mind ugyanabból a családból: **a
lépcsők a beállító képernyőt zárták, a többi felületet nem.**

| mi | hol |
|---|---|
| az osztály és a mezőny Ratingje a lépcső döntése | `UNLOCK_PRESETS.div/.field` → `unlockLadderApplyDiv`, `unlockUpForField` |
| az osztályválasztó a lépcsőn nem kérdez | `renderPyrDivPick` (a `_lepcso` ág) |
| a KIÍRT rés megy a horgonyba, nem a legközelebbi csempe kerek száma | `pyrConfirmDiv` |
| a gyorsítások is feloldások | `UNLOCK_TEMPO_FAST` → `unlockTempoOk` |
| amiből nincs mit választani, az ne is látsszon | `UNLOCK_THIN` → `unlockHideThin` |

**A „legalább kettő" küszöb felülírja a 2-4. fázis döntését.** Ott azt mondtam
ki, hogy *„a szürke vezérlő cél, a hiányzó nem az"* — és ez igaz ott, ahol a
többi fokozat között már tényleg lehet válogatni: akkor a szürke csempe a
következő lépcsőt mutatja. De ahol **egy** dolog választható, ott nincs
választás, csak egy rács tele lakatokkal — az nem cél, hanem zaj. Egy rács
ezért akkor jelenik meg, amikor a **második** lehetőség is kinyílt benne;
onnantól a még zárt csempék maradnak szürkén, a feltétellel.

**Ami nem látszik, azt ki kell mondani.** Az elrejtéssel a játékos nem tudná,
mit kapott — a lépcső-jegyzet ezért felsorolja a döntéseket (kezdő osztály, a
mezőny Ratingje, az ellenfél-fokozat, az újrapörgetés), nem vezérlőként, hanem
tényként. Ugyanezért igazodik a 3. oldal bevezetője és a Run-plafon jegyzete is:
a lépcsőn egyik sem ígérhet olyan választást, ami ott még nincs.

**A gyorsítások miért kaptak kaput.** A lassítások a Run-szinthez kötve álltak,
a könnyítések viszont az első perctől szabadon — pedig a gyorsabb fejlődés is
beállítás, méghozzá olyan, ami **könnyebbé** teszi a játékot. Azzal a körrel
nyílnak, amivel a kezdő nehézség és a Rating-kapcsoló (3 bajnoki cím).

### ✅ 5. fázis — csiszolás *(kész: 3.9.46)*

* **A „mi van még hátra" panel** — `unlockProgressGroups` / `unlockProgressHtml`.
  A felugró feloldás-ablak a *pillanatot* ünnepli; ez a panel a **térkép**,
  amit bármikor újra elő lehet venni: öt csoport, minden sor pipa vagy lakat,
  a feltétel jobbra.
  **A HUB helyett a Profil alatt van** (a roadmap eredetileg a HUB-ot mondta):
  a HUB *karrier*-felület, a feloldások viszont a **játékoshoz** tartoznak — ott
  laknak a Run-ranglista és az örök csúcsok is, ugyanabból az okból.
  **A lista a szabályokból származik**, nem kézzel írt névsor: minden sor
  ugyanazt a kérdést teszi fel (`unlockHas` / `unlockSpeedOk` / `unlockTempoOk`
  / `unlockStyleOk`), amit maga a felület — a próba külön állítja, hogy a kettő
  egyezik. Egy kézzel vezetett másolat pontosan attól avulna el, hogy a szabály
  változik, és akkor a panel épp arról hazudna, amiről tájékoztatnia kéne.
* **Próba a teljes lépcsősorra** — `tools/lepcsok-proba.js`, 132 állítás.

---

## 6. Amit a rendszer NEM csinál

* **Nem vesz el semmit.** Aki már játszik, annak a meglévő karrierje és
  beállításai érintetlenek — a napló csak NYIT.
* **Nem zárja el a közös karriert.** A *Gyere 1v1* az első perctől elérhető: a
  lépcsők az egyjátékos élményt tanítják, nem a barátodat zárják ki.
* **Nem büntet.** Egy lépcső nem veszíthető el, és nem jár le.
