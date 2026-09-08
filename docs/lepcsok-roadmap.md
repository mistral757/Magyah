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

| Run-szint | mi nyílik ki |
|---|---|
| *(2. megnyert Run)* | ellenfél-tempó **+1** (Lépést tartanak) |
| 30 | játék-tempó **−1** · ellenfél-tempó **+1** |
| 40 | ellenfél-tempó **−1** és **+2** |
| 50 | játék-tempó **−2** · ellenfél-tempó **+2** |
| 60 | ellenfél-tempó **+3** |
| 70 | játék-tempó **−3** |
| 75 | ellenfél-tempó **+4** |
| 80 | játék-tempó **−4** |
| 90 | játék-tempó **−5** |

### 3.5 Run-győzelmek → csapatstílusok

| Run | stílus |
|---|---|
| 1. | 🧱 Beton védelem · ⚽ Bombázók |
| 2. | ⚡ Hol jön a mennydörgés? |
| 3. | ⭐ Sztárom a párom |
| 4. | 🌀 Tiki-Taka |
| — | ☯️ Béke és harmónia *(a meglévő szabály szerint)* |
| **külön** | 🛡️ **Panzerkampfwagen**: a kezdő draftodban legyen **14 negatív tulajdonság**. Szürkén, a feltétellel ráírva látszik. |

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

**Próba:** `node tools/lepcsok-proba.js` — 92 állítás (1. és 2. fázis együtt).

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

### 3. fázis — a Run-alapú feloldások
* tempó-fokozatok Run-szint szerint (3.4);
* csapatstílusok Run-győzelem szerint (3.5);
* a Panzer külön feltétele + a szürke csempe felirata.

### 4. fázis — a gyűjtő feloldások
* ikon-sűrűség lépcsői (10/20/22);
* nemzeti válogatottak (20 játékos);
* realisztikus skill (10 egy emberen / 100 összesen).

### 5. fázis — csiszolás
* a HUB-ban egy „mi van még hátra" panel;
* a feloldások visszanézhetők a Profil alatt;
* próba a teljes lépcsősorra.

---

## 6. Amit a rendszer NEM csinál

* **Nem vesz el semmit.** Aki már játszik, annak a meglévő karrierje és
  beállításai érintetlenek — a napló csak NYIT.
* **Nem zárja el a közös karriert.** A *Gyere 1v1* az első perctől elérhető: a
  lépcsők az egyjátékos élményt tanítják, nem a barátodat zárják ki.
* **Nem büntet.** Egy lépcső nem veszíthető el, és nem jár le.
