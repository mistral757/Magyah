# Karrier-beállítások — generál ellenőrzés

*(Állapot: 3.4.09. A vizsgált felület: `#scFormation` — a „1 · Beállítás"
képernyő —, plus az Infópult „A karriered" fülje (`careerSetupHtml`,
index.html ~43168). Ez a dokumentum LELTÁR és HIBALISTA; a belőle következő
átalakítási javaslat: `karrier-beallitasok-terv.md`.)*

---

## 0. Egy mondatban

Tizenkét kapcsoló van a Run indítása előtt, **három különböző helyen tárolva**
(modulszintű változó / localStorage / a mentett `S`), és a három tárolási hely
háromféle élettartamot jelent — a felület viszont mind a tizenkettőt
ugyanolyan „beállításnak" mutatja. Ebből fakad az összes talált hiba: **az
Infópult három kapcsolót zárolt ként (🔒) jelöl, holott menet közben
átállíthatók**, egy negyedik pedig **nem éli túl az újratöltést**.

---

## 1. A teljes leltár

| # | kapcsoló | hol lakik | túléli az újratöltést? | menet közben állítható? | Run-pontot ér? | MP-világ része? |
|---|---|---|---|---|---|---|
| 1 | Felállás (`form`) | modul | draft közben igen (mentés) | igen (HUB) | nem | **nem** (szándékosan személyes) |
| 2 | Vak mód (`mode`) | modul | igen (mentés) | nem | nem | nem (karrierben rejtve) |
| 3 | Családtag (`familyEnabled`) | **modul** | **indulás előtt NEM**, utána igen | nem | nem | igen |
| 4 | Családtag-névkészlet | modul | ua. | nem | nem | igen |
| 5 | Indulás: draft / kész klub (`careerStart`) | modul | igen (mentés) | nem | igen (kihagyó ág) | igen |
| 6 | Vezetés (`guideWantedMode`) | modul → `S.teach` | igen (mentés) | **igen** (☰ Menü) | nem | nem |
| 7 | Skill-mód (`skillModeWanted`) | modul → `S.skillReal` | igen (mentés) | nem | **igen** (0,25) | igen |
| 8 | A Rating alapja | localStorage → `careerRatingBasis` | igen (mentés) | nem | **igen** (0,25 / ×1,5) | igen |
| 9 | Válogatottak (`wcEnabled`) | **localStorage** | **NEM** (nincs a mentésben) | **igen** (élőben olvasott) | nem | igen (de nem rögzül) |
| 10 | Sorsolás rendje | **localStorage** | igen (csak MP-ben rögzül) | **igen** (HUB-sor) | nem | igen |
| 11 | Fejlődési tempó | **localStorage** | igen (csak MP-ben rögzül) | **igen** (bármikor) | **igen** (1,0–2,0!) | igen |
| 12 | Nehézségi csúszka | modul (`oppTargetRating`) | igen (mentés) | igen (szezonhatáron) | **igen** (1,0 + 0,25) | igen |
| 13 | Auto szintkövetés + cél-sáv | **`S`** | igen | igen | igen (0,25) | MP-ben kikapcsolva |
| 14 | Újrapörgetések | modul (`rerolls`) | igen (mentés) | nem (fogy) | **igen** (0,333) | igen |

Három tárolási minta, három élettartam:

* **modulszintű változó** — az oldal betöltésével születik, a beállító
  képernyő tölti fel, a mentés viszi tovább. Aki *indulás előtt* újratölt,
  elveszti.
* **localStorage** — globális preferencia, MINDEN karrierre és MINDEN fülre
  közös. A futó karrierre nézve nincs zárolva (kivéve MP).
* **`S` (mentés)** — a futó karrier sajátja.

---

## 2. A talált hibák

### 2.1 🔒 HAZUG LAKAT — három kapcsoló (Infópult · A karriered)

A `careerSetupHtml` a `lock=1` jelzővel írja ki, hogy „a karrier indulásakor
rögzült, menet közben nem változtatható". Ez **egyjátékos karrierben három
sornál nem igaz**:

| sor | jelenleg | valóság |
|---|---|---|
| 🗓️ **Sorsolás rendje** | 🔒 | a HUB-ban egy koppintással váltható (`hubSchedRow.onclick` → `setScheduleMode`, ~39437) |
| 🐌 **Fejlődési tempó** | 🔒 | bármikor átállítható, és **azonnal hat** — a kód kommentje maga mondja ki (~18104) |
| 🌍 **Világbajnokság** | 🔒 | `wcEnabled` localStorage-ban él, és az `activeSquads()` **minden hívásnál élőben olvassa** (7336) |

Közös karrierben a lakat az első kettőre igaz (`mpWorldSched` / `mpWorldTempo`
rögzül) — a harmadikra ott sem.

**Javítás:** a `lock` jelző ne konstans legyen, hanem a tényleges állapotból
számított: `lockedSched = !!mpWorldSched`, `lockedTempo = !!mpWorldTempo`, a
válogatott-sor pedig lakat nélkül, „globális beállítás — a következő szezon
mezőnyétől hat" megjegyzéssel. (Vagy — jobb — lásd 2.2.)

### 2.2 A válogatott-kapcsoló nincs a mentésben → néma világváltás

`wcEnabled` **nem szerepel a `saveGame()` adatcsomagjában** (52210 körül:
`familyEnabled` igen, `wcEnabled` nem). Két következménye van:

* **Egyjátékos:** újratöltés után a futó karrier visszaáll a localStorage-beli
  preferenciára. Ha közben átkapcsoltad (akár csak úgy, hogy egy másik
  karrierhez beállítottad), a **futó** karrier ellenféltáblája és piaca némán
  megváltozik — a `buildOpponents` és a draft-pool is `activeSquads()`-ból merít.
* **Közös karrier:** `mpApplySettings` közvetlenül írja a `wcEnabled`-et
  (`setWcEnabled` nélkül, tehát a vendég localStorage-a érintetlen — ez így
  helyes). De mivel a mentésbe sem kerül, a vendég **egy újratöltés után a
  saját preferenciájára esik vissza**, és a közös világ pool-ja kettéválik.
  Pontosan az a szétcsúszás, amit a sorsolás/tempó `mpWorldSched`/`mpWorldTempo`
  rögzítése már megszüntetett — ez a harmadik tengely maradt ki.

**Javítás:** `wcEnabled` a mentés-csomagba, `careerWc`-ként a karrier
indulásakor rögzítve (ugyanaz a minta, mint `careerRatingBasis`), és az
`activeSquads()` ezt olvassa, ne a globális preferenciát.

### 2.3 A családtag-kapcsoló nem éli túl az indulás ELŐTTI újratöltést

`familyEnabled` modulszintű változó, `false` alapértékkel, localStorage nélkül.
Ez **betűre ugyanaz a hiba**, amit a 9-es kapcsolónál a `WC_KEY` bevezetése
javított — a kód kommentje (17915) még le is írja a hibaosztályt („aki nem
kattintott rá KÖZVETLENÜL a karrierindítás előtt…"), csak a családtagra nem
alkalmazták. A mentésbe már bekerül (52236), tehát csak az indulás előtti
ablak érintett; ott viszont a névkészlet is elveszik.

**Javítás:** `FAMILY_KEY` localStorage, a `WC_KEY` mintájára.

### 2.4 Az újrapörgetés-csúszka kész klubnál is él — és Run-pontot ad

* A beállító képernyőn a csúszka **kész klub indulásnál is látszik**
  (`#rerollSlider` blokkjának nincs `hide` ága, ellentétben a
  `#careerStartGrid` többi függőségével).
* A `beginNewGame` feltétel nélkül elteszi: `runInit().rerollsChosen=rerolls`.
* A `runBreakdown` reroll-sora csak `R.rerollsChosen!=null`-t néz, tehát a
  sor **kész klubnál is megjelenik**, `0,333` súllyal.

Az Infópult ugyanezt a sort kész klubnál **szándékosan elrejti**
(`if(!(R.clubStart||careerStart==="club"))`) — vagyis a felület már tudja,
hogy értelmetlen, a pontozó nem. Következmény: **kész klubbal indulva a
csúszkát 0-ra húzva 100 pont jár 0,333 súllyal, minden ellenszolgáltatás
nélkül** (a draft-újrapörgetés ott nem is létező mechanika).

**Javítás:** a `runBreakdown` reroll-ága kapja meg ugyanazt a `R.clubStart`
kizárást, ami a `basis` és az `aim` sorokon már ott van; a csúszkát pedig a
`careerStartGrid` kezelője rejtse el.

### 2.5 A kezdésmód-váltás némán visszaállítja a nehézséget

A `#careerStartGrid` kattintáskezelője (17902) **feltétel nélkül** 84-re
(draft) vagy 80-ra (klub) rántja a csúszkát. Ha a felhasználó előbb beállította
a 92-t, aztán megnézi a másik kezdésmódot és visszavált, a 92 nyomtalanul
eltűnik. A javasolt érték felkínálása jó szándék, de csak akkor szabadna
felülírnia, ha a felhasználó **még nem nyúlt** a csúszkához.

### 2.6 A fejlődési tempó Run-súlya aránytalan

`RUN_TEMPO_W = {komotos:1.0, csiga:1.5, gleccser:2.0}`, teli 100 ponttal.
Vagyis a **Komótos** (−10% fejlődés) egyetlen kattintása ugyanakkora súlyt visz
a Run-mérőn, mint a *teljes* „Kezdő nehézség" tengely (1,0) vagy az *egész első
szezon* (1,0) — és **négyszer annyit, mint minden további lezárt szezon**
(0,25). A `runTempoSync` racsnija helyesen véd a menet közbeni csalás ellen, de
az arányon nem segít.

Összevetésül a többi „vállalás"-tétel: szezon-alapú Rating 0,25, kártyánkénti
lutri 0,375, realisztikus skillek 0,25 — mind **nagyobb** játékbeli
következménnyel, mind **négyszer kisebb** súllyal.

**Javaslat:** `{komotos:0.25, csiga:0.5, gleccser:0.75}` — a fokozatok
sorrendje marad, a nagyságrend a többi vállalás mellé kerül.

### 2.7 A nehézség háromszor számít bele a Run-pontba

Ugyanaz a tengely három helyen jelenik meg:

1. **`diff` sor** (súly 1,0) — a vállalt mezőny a draftod csúcsához mérve;
2. **`runSeasonScore`** — a helyezés pontjához hozzáadódik
   `(diff−84)·0,4 + under·0,6`;
3. **`runChallengeMult`** — MINDEN sor súlyát megszorozza
   `0,80 + level·0,28 + under·0,22`-vel.

A 2. és a 3. betűre ugyanazt a két mennyiséget méri (abszolút szint +
alávállalás), csak egyszer összeadva, egyszer szorozva. A `start` és az `aim`
sorok kivezetésének indoklása (41960 körül: *„a körülmény már MINDENHOL benne
van — a kihívás-szorzó az összes többi soron jutalmazza"*) szó szerint erre a
duplázásra hivatkozik — de a `runSeasonScore` belső tagja megmaradt.

**Javaslat:** a `runSeasonScore`-ból essen ki a `(diff−84)·0,4 + under·0,6`
tag; a szezonsort a kihívás-szorzó úgyis a körülményekhez igazítja. (Ez a
meglévő karrierek pontszámát változtatja, tehát verzióhoz kötendő.)

### 2.8 Kisebbek

* **`renderAutoAimSetup` állapotot ír** (`if(mp)S.autoLevel=false;`) egy
  rajzoló függvényben. Működik, de a mellékhatás egy render-hívásba van rejtve.
* **`S.autoLevel` / `S.autoLevelAim` a beállító képernyőn már az `S`-en él**,
  a többi tizenegy kapcsoló nem — ezért kellett a `resetGameState`-be a
  `keepAutoLevel`/`keepAutoAim` kivétel. Egységesebb volna a többi mintáját
  követni (modulszintű `wanted*` változó, amit a `beginNewGame` tesz az `S`-be).
* **A nehézségi csúszka `max=100`**, miközben a `diffTierLabel` 250-ig ad
  neveket. Ez indulásnál helyes (Infinity még nincs), de a felirat
  („100 = Isteni") nem stimmel a sávnevekkel: 100 a *Biszem-baszom premier líg*.

---

## 3. Mit fed le a rendszer, és mit nem

**Amit lefed** — négy, egymástól tényleg független tengely:

| tengely | kapcsoló(k) | mit állít |
|---|---|---|
| **Milyen erős a világ** | nehézségi csúszka, auto szintkövetés + cél-sáv | az ellenfél ereje |
| **Milyen gyorsan nősz hozzá** | fejlődési tempó | a fejlődés, a pénz, az akadémia üteme |
| **Mennyire te döntesz** | skill-mód, Rating-alap, újrapörgetés, draft/klub | a kontroll mértéke |
| **Milyen világ** | válogatottak, családtag, sorsolás rendje, vak mód, vezetés | ízlés / hangulat |

**Amit NEM fed le** (és amit az új játékmód hozna):

* Nincs **liga-szerkezet**: egyetlen 16 csapatos mezőny van, aminek a szintjét
  egy csúszka mondja meg. Nincs fel-/kiesés, nincs alattad és fölötted létező világ.
* Az **ellenfelek nem fejlődnek**. A `buildOpponents` minden szezonban
  ugyanabból az adatbázisból merít a *beállított* célszinthez; a mezőny nem a
  saját múltjából nő, hanem újrasorsolódik.
* Ezért a **nehézség kézi vagy automatikus** — nincs harmadik lehetőség, hogy
  „a világ magától keményedik".
* A **kupa-jogosultság a nehézségi sávból** jön (`CUP_TIERS`), nem a bajnoki
  helyezésből egy valódi ligarendszerben — ezért fordulhat elő, hogy egy
  NB II-ben szenvedő ellenfél a BL-döntőben visszaköszön.

---

## 4. Javítási sorrend

| prioritás | tétel | miért |
|---|---|---|
| 1 | 2.2 — `wcEnabled` a mentésbe | néma világváltás + MP-szétcsúszás |
| 2 | 2.4 — reroll-sor kész klubnál | ingyen Run-pont |
| 3 | 2.1 — a három hazug lakat | a felület mást állít, mint a kód |
| 4 | 2.3 — családtag localStorage | elvesző választás |
| 5 | 2.5 — a csúszka néma visszaállása | elvesző választás |
| 6 | 2.6 / 2.7 — Run-súlyok | egyensúly, verzióhoz kötendő |
| 7 | 2.8 — takarítás | — |

Az 1–5. **viselkedés-hiba**, az egyszerű beállítómód bevezetése előtt érdemes
elintézni: az új felület úgyis ugyanezeket az értékeket fogja csoportosan
állítani, és egy hazug lakat egy előre csomagolt profilban még zavaróbb.
