# 🧿 Talizmánok — F0–F2: a váz (3.9.141)

*(Érintett kód: `TAL_RANG` / `TAL_KAT` / `TAL_MECCS_AL` / `TAL_SPEC` ·
`talState` / `talRng` / `talUjLap` / `talKinalat` · `talSzezon` /
`talEsedekes` / `talMsCsere` · `talValaszt` / `talPassz` · `talDrawOpen` /
`talPostMatch` · `talMenuRender` · `talLoadMigrate`; bekötés: `msPayout`,
`msScan`, `afterAllRewards`, `LEDGER_CATS.talizman`, a mentés `tal` mezője,
`TEACH_TOPICS["tal:draw"]`, `GLOSSARY.talizman`. A teljes terv:
`docs/talizmanok-terv.md`. Próba: `tools/talizman-proba.js`.)*

## A kérés és a döntés

> „Talizmán név jó, 3-ból 1, nem vak, minden másban is egyet értek veled.
> Joker erősíti a negatív alacsony eséllyel dolgokat is. kezdd az F0-F2
> fázissal.”

Ez a kör a rendszer **vázát** rakja le: a talizmánok születnek, húzhatók,
gyűlnek és látszanak — **de még nem hatnak**. A felület ezt két helyen is
kimondja (a húzás-ablakban és a menüben), hogy senki ne keressen egy olyan
hatást, ami még nincs bekötve. A hatások kategóriánként az F3–F5-ben jönnek.

Miért így: a rendszer legkockázatosabb része nem egy-egy szám, hanem a
**ritmus** — mikor jön húzás, mennyi, mit kínál, milyen érzés dönteni. Ez most
már kipróbálható, mielőtt a számokat bekötnénk.

---

## F0 — a mérés és a leltár

### A mérföldkő-csere hangolása

A terv 20%-os „pénz helyett talizmán” cserét javasolt, azzal, hogy mérjük
meg. Négy **valódi, végigjátszott** idény (a próba-fixtúra kerete, S.auto)
friss, pénzes mérföldkövei:

| idény | friss pénzes mérföldkő | ebből egy kiértékelésben |
|--:|--:|---|
| 1. | **12** | az 1. forduló után négy illeszkedés-mérföldkő egyszerre |
| 2. | 5 | |
| 3. | 3 | |
| 4. | 3 | |

Egy fix 20% az első idényben ~2,4, a harmadikban ~0,6 cserét adott volna —
az első idény tele, a későbbiek üresek. **A szabály ezért:**

* **25%** eséllyel cserél egy friss, pénzes mérföldkő;
* **egy kiértékelésből (`msScan`) legfeljebb egy** — az egyszerre teljesülő
  csomag egyetlen húzást ér;
* **idényenként legfeljebb kettő**;
* és a **6-os idényplafon** mindent fog.

Egy végigjátszott idény a próbában: **3 ütemezett + 2 csere = 5 húzás.**

### A ritka események leltára (a Joker F4-es bekötéséhez)

Minden jelölt EGY ponton dobódik; a súlyozott pörgetéseknél a Joker a súlyt
fogja emelni (a pörgetések száma nem nő). A döntés szerint a Joker alaphatása
**a jókat ÉS a rosszakat** is tolja.

| esemény | hol dobódik | alap | jó? |
|---|---|---|---|
| különleges esemény (maga) | a meccs-hurok, `_sevP` | 0,10/18 vödrönként (rangadón 0,26/18, max 2) | — |
| szabadrúgásgól | `trySpecialEvent` · `free_kick_goal` | súly 24, belövés 35% | ✅ |
| öngól javunkra | `trySpecialEvent` · `owngoal_for` | súly 10 × `gpErrMult` | ✅ |
| VAR javunkra | `trySpecialEvent` · `var_overturn` | súly 25 | ✅ |
| tizenegyes javunkra | `trySpecialEvent` · `penalty_for` | súly 22 | ✅ |
| tizenegyes ellenünk | `trySpecialEvent` · `penalty_against` | súly 18 | ❌ |
| öngól ellenünk | `trySpecialEvent` · `owngoal_against` | súly 8 | ❌ |
| verekedés | `trySpecialEvent` · `fight` | súly 17 | ❌ |
| mez leveszése a hajrában | `mezLeveszes` | 25% (85. perc után, nagy tétnél) | ❌ (lap) |
| piros lap | a meccs-hurok, `_pRed` | `SIM.REDP` (0,06)/18 × szorzók | ❌ |
| álomigazolás | `TRANSFER_TYPES` · `dream` | súly 3 | ✅ |
| akadémiai tehetség | `TRANSFER_TYPES` · `youth` | súly 3 | ✅ |
| csapatépítés | `TRANSFER_TYPES` · `bondcamp` | súly 2 | ✅ |
| kölcsönjátékosok | `TRANSFER_TYPES` · `loan3` | súly 2 | ✅ |
| elvágyódás | `TRANSFER_TYPES` · `leave` | súly 1 (× kockázat × sztár) | ❌ |
| sztár-befektető | `FAME_INV_LEVEL` fölött | idényenként legfeljebb 1 | ✅ |
| szurkoló-robbanás | sztár-hírnév | idényenként legfeljebb 4 | ✅ |

---

## F1 — az adatmodell és a generátor

### Az állapot

```js
S.tal={v:1, seed, seq, lapok:[…], varo:[…], sz:{season,due:[a,b,c],done,csere,db},
       szerencse, huzas, latott:{specId:1}}
```

* **`seed`** — a karrier saját sorsa. Minden kínálat (`talKinalat`), minden
  ütemezés (`talSzezon`) és minden mérföldkő-csere (`talMsCsere`) ebből és a
  helyzet kulcsából dobódik (`talRng`, mulberry32). Ezért **a visszatöltés
  nem pörget újra**: ugyanabból az állásból ugyanaz a három talizmán jön.
* A talizmán: `{uid, kat, valt | al, rang, dobas, spec, forras, szezon, fordulo}`.
* A `freshS` `tal:null`-lal indul, az állapot lustán születik (`talState`).

### A katalógus

| | darab |
|---|--:|
| kategória | 10 (a Meccs 10 tengellyel) |
| alaphatás-változat | 19 (+10 meccs-tengely) |
| special | **62** — kategóriánként 6, a Joker és a Meccs 7 |

Minden kategóriának van **átlagos szinten** is elérhető speciálja, és minden
kontra **másik** területet üt (a Meccs a saját másik tengelyét vagy ablakát;
néhány Joker-special a talizmánokat magukat — szürke pötty).

### A számok (a próba 10 000 talizmánján)

| | mért | cél |
|---|---|---|
| átlagos / ritka / nagyon ritka / legendás | 57,1 / 28,7 / 11,2 / 3,0% | 58 / 28 / 11 / 3 |
| special-arány | 67,6% | 67% |
| erő a sávon belül (85–115%) | 10 000 / 10 000 | mind |
| Tiszta talizmán alapja | pontosan ×1,25 | ×1,25 |

A special két oldala a **minimum-ritkaságán** a terv táblázatának számát adja,
fölötte a `TAL_RANG` pro/con skálájával nő (a pro erősen: ×1 → ×2,8, a
kontra alig: ×1 → ×1,15).

---

## F2 — a ritmus és a felület

### Az ütemezés

| | 1. idény | többi idény |
|---|---|---|
| 1. húzás | **3–5.** forduló (itt mutatkozik be) | 1–10. |
| 2. húzás | 11–20. | 11–20. |
| 3. húzás | 21–30. | 21–30. |

Az esedékességet a meccs utáni lánc nézi (`talEsedekes`), `S.idx >= due`
alapon — egy kupameccs vagy egy kimaradt kör nem nyel el húzást.

### A kínálat — „egy ismerős, egy új, egy vad”

1. **ismerős** — a domináns színedből (üres gyűjteménynél véletlen);
2. **új irány** — olyan területről, amiből 0–1 talizmánod van;
3. **vad** — bármi.

Három különböző kategória garantált; birtokolt special nem jön újra (a
duplikátum a fúzió dolga lesz, F7).

* **Az első húzás tanít:** legfeljebb ritka, két Tiszta és egy speciális.
* **A szerencse-számláló:** 16 legendás nélküli húzás után a kínálat leggyengébb
  helye legendás lesz. A számláló nullázódik, ha legendás volt a kínálatban.

### A döntés

| gomb | mit csinál |
|---|---|
| egy talizmánra koppintás, majd **„… — a gyűjteménybe”** | a választott a gyűjteménybe kerül, sorszámot kap; a másik kettő „látott” lesz |
| **Passz** | +2 a szerencse-számlálóra és a heti lelátó fele (ledger: 🧿 Talizmán-passz) |
| **Később döntök** | semmit nem dob el — a húzás a Talizmánok menüben vár, ugyanazzal a kínálattal |

A megerősítés választás nélkül tiltott — egy félrekoppintás ne vigyen el egy
talizmánt. Ha több húzás vár (ütemezett + mérföldkő), egymás után jönnek.

### A lánc

```
afterAllRewards → processCareerUnlocks → drainRewardSkills
  → tryAcademyOpportunity → talPostMatch → mstatAfterMatch → proceedAfterMatch
```

* **Végigjátszásnál** (`S.auto`) a húzás **vár**: a talizmán döntés, a gép nem
  hozza meg helyetted. A HUB 🧿 jelzést kap (`TEACH_TOPICS["tal:draw"]`).
* **Meccsről meccsre**: a húzás-ablak a `GAME_OVERLAY_IDS`-ben van, tehát a
  lánc megáll előtte („egy ablak vár rád”) — nem kattint át rajta.
* A vissza gomb a „Később döntök”-öt nyomja (`BACK_LAYERS`).

### A mérföldkő-csere a naplóban

```
🏁 MÉRFÖLDKŐ — 50 bajnoki gól · 🧿 talizmán-húzás (a +12 500 helyett)
```

A mérföldkő-naplóba is így kerül, tehát látszik, mi volt a tét. A pénz ilyenkor
NEM folyik be, és a beragadt / halott kategóriás kifizetés sosem cserél.

### A menü

A HUB-ban a Boost-központ alatt: **🧿 Talizmánok — N a gyűjteményben ·
M húzás vár!** A menü:

* a fejléc a **domináns szín**, a menedzser-címmel (A Bankár, A Nevelő, …; ha
  egyik szín sem éri el a negyedet: 🌈 A Polihisztor);
* 10 színű eloszlás-sáv és jelmagyarázat;
* chipek: idei húzások / plafon, a következő húzás **sávja** (a pontos forduló
  meglepetés marad), mérföldkő-cserék, szerencse;
* „húzz most”, ha húzás vár; és a gyűjtemény, kategóriánként.

### Régi mentés

Talizmánok nélküli mentés **futó idény közepén** (`S.idx > 0`): az idény nem
kap visszamenőleg három húzást egyszerre — a rendszer a következő idény
elején indul (a menü ki is mondja). **Nyári** (0. fordulós) mentésnél már az
aktuális idény teljes.

---

## Ami még NINCS bekötve

| fázis | tartalom |
|---|---|
| F3 | alaphatások: Scout, Stílus, Taktika, Igazolás, Fejlődés, Stáb |
| F4 | Joker (jegyzék + `ritkaP`, jók ÉS rosszak), Morál (jó légkör, jellemhullám), Bank (bevétel-szorzó, **hitel**) |
| F5 | Meccs: tíz tengely, pillanatkép-mezők, meccserő-sor |
| F6 | a 62 special hatása |
| F7 | csökkenő hozam, rezonancia, fúzió / Mítosz, égetés |
| F8 | Kártyatár (karriereken át), öröklap, trófea-húzás |
| F9 | egyensúly-mérés, hangolás |

A Joker húzást módosító speciáljai (Talizmán-eső, Kaszinó, Kétélű penge,
Szerencse fia) is F6-ban kapcsolnak be — most a kínálat 3 lap, a plafon 6.

## A próba

`node tools/talizman-proba.js` (9153-as port, ~40 mp) — 44 állítás, köztük
egy teljes, valódi végigjátszott idény és egy kézi mérkőzés, ahol a
húzás-ablaknak a lánc végén elénk kell kerülnie.

---

# 3.9.142 — F3: a hat gazdasági kategória alaphatása él

> „Szuperek a példák, légy egy kicsit még kreatívabb. […] a pro mindig illik a
> kártyához, de a contra lehet más témájú. […] Mehet az f3”

## A számítás: egy helyen (`talAlapMind`)

1. Egy kategória talizmánjai **erő (E) szerint csökkenő** sorba állnak.
2. A k-adik talizmán a **0,85^k-szorosát** éri. Az 1. teljes, a 2. 85%, a 3.
   72%, a 10. 23%.
3. Minden talizmán a **saját változatához** adja a csökkentett erejét, és a
   változat összege a saját egységében (%, pp) **a plafonnál megáll**.
4. A memó kulcsa a gyűjtemény sorszáma és mérete. A `devTempo`, a
   `tacticFit` és a `coachQual` meccsenként százszor is kérdez, ezért kell.

| változat | 1 E | plafon | kapaszkodó |
|---|--:|--:|---|
| 🔭 Bővebb lista | +12% esély a 4. jelöltre | 100% | `twScout` (`want`) |
| 🔭 Nyitott kapu | +15% esély akadémiai ajánlatra a köztes fordulóban | 100% | `tryAcademyOpportunity` (`idx%4===2`) |
| 🎭 Olcsóbb fa | −3% képesség- és csillagozás-ár | 30% | `styleTraitNextPrice` (kijelzés ÉS levonás), `starUnlockPrice` |
| 🎭 Mérföldkő-prémium | +4% | 40% | `msCashReward`, `msSpReward` |
| 📋 Jobb illeszkedés | +0,8 pp | 8 pp | `tacticFit` (ugyanaz a pp-csatorna) |
| 📋 Gyorsabb tanulás | +6% | 50% | `tacticTrainAfterMatch` |
| 🤝 Tiszta üzlet | +2,5 pp | 20 pp | `twResolveSigning` (`chShift`) |
| 🤝 Kedvezmény-szerencse | 4% esély −25%-ra | 35% | `buyDiscountParts` (seedelt, a kihívás-kedvezménnyel nem adódik) |
| 🤝 Licitfelhajtó | a licit-kúp csúcsa +2 pp | 15 pp | `saleRollOffer` |
| 🌱 Gyorsabb érés | +2,5% | 20% | `devTempo` (a játék saját „fejlődési tempója”: fejlődés, begyakorlás, párkémia) |
| 🌱 Hatékony edzés | +5% | 40% | a tervezett edzés `_tm` szorzója |
| 🎓 Jobb szakemberek | +4% | 35% | `coachQual` (a plafon UTÁN) |
| 🎓 Olcsóbb stáb | −5% | 40% | `staffPrice`, `coachSlotPrice` |

**Talizmán nélkül egyetlen bit sem mozdul.** Semleges állapotban minden olvasó
0-t vagy ×1-et ad. Ahol a kerekítés vagy egy véletlenhívás eltérést okozhatna,
ott a kód ki is kerüli az ágat (`m>=1 ? régi : új`, `p>0 && Math.random()`).
A próba ezt két gyűjteményen méri: egy üresen, és egy olyanon, amelyben csak
a még nem ható kategóriák állnak.

## A felület

* **A lapon** a „⚡ az alaphatás él” / „⏳ később kapcsol be” sor jelzi,
  mi hat már.
* **A menüben** külön blokk van: ⚡ **Aktív alaphatások**. Pontosan azt a
  számot mutatja, amit a játék használ, a plafonnal és azzal együtt, hogy
  mennyit érne a következő talizmán abban a kategóriában. A még nem ható
  változatok itt nem jelennek meg.

## A második hullám: 20 új special

Mindegyik egy kis történet, egy döntés vagy egy kockázat. A kontra sokszor
egészen más világból jön: a szülők ügyvédje, az adóhivatal, a sajtó
címlapja, a lelátó zaja. Összesen **82 special**. A teljes lista:
`docs/talizmanok-terv.md` 9.11.

## 📦 A Joker eseménycsomagja

Új Joker-változat. **2 új jó és 1 új rossz** eseményt tesz az átigazolási
pakliba, és a csomag tartalma **már a lapon látszik**, a választás előtt. Egy
esemény csak egyszer kerülhet a pakliba, és a kínálat három lapja sem
ismételhet. A ritkaság a súlyt viszi (×1 / ×1,3 / ×1,6 / ×2).

A tár: **9 jó** (az ifjúság forrása, igazgatósági ülés, mezszponzor,
sztárvilág, a tékozló fiú, edzőtábor, nyílt nap, ázsiai túra, egy legenda
kopogtat) és **7 rossz** (hírnév-mámor, öltözői botrány, rivális csábítás,
adóellenőrzés, ügynökháború, balszerencsés edzés, pályazár). Az első ötöt a
kérés hozta. A választott csomag a menüben is látszik („📦 Az átigazolási
paklidba került…”). **Az események maguk az F4-ben kapcsolnak be.** A
részletes tervük (az igazgatósági ülés elvárásai, a szponzor-szerződések)
a `docs/talizmanok-terv.md` 9.12-ben van.

## A próba

`node tools/talizman-f3-proba.js` (9159-es port, ~15 mp), 31 állítás:

* a semleges bit-azonosság;
* a csökkenő hozam és a plafon;
* mind a 13 kapaszkodó, köztük a **valódi** tárgyalás (`twResolveSigning`)
  és a **valódi** licit (`saleRollOffer`) rögzített dobással, valamint a
  valódi meccs utáni begyakorlás;
* a menü és a lap jelzései;
* az eseménycsomag.

---

# 3.9.144 — F4a: Joker, Morál, Bank

> „Joker erősíti a negatív alacsony eséllyel dolgokat is.” · „Okés mehet az f4”

Kilenc kategória alaphatása él. A Meccs (F5), a Joker **eseménycsomagjainak
tartalma** (F4b) és a specialok (F6) hiányoznak még. A számítás ugyanaz, mint
az F3-ban (`talAlapMind`): a talizmánok erő szerint sorba állnak, a k-adik
0,85^k-t ér, és minden változatnak saját plafonja van. **Talizmán nélkül
egyetlen bit sem mozdul**, ezt a próba 1. blokkja betűre méri.

## 🃏 Joker

| változat | 1 E | plafon | kapaszkodó |
|---|--:|--:|---|
| **Vad idény** | minden ritka esemény +8% eséllyel | +60% | `talRitkaMult(DUEL)` |
| **Mozgalmas piac** | +esemény az átigazolási ablakokban (ritkaság szerint) | ablakonként +2 | `talPiacExtra(kind)` |
| **Eseménycsomag** | 2 jó + 1 rossz esemény a pakliba | — | az F4b-ben kapcsol be |

A **Vad idény** a meccsen és a piacon is hat:

* a meccs-motor különleges eseménye (`_sevP`, jó és rossz egyaránt);
* a mez leveszése (legfeljebb 50%);
* a piros lap (`_pRed`);
* az átigazolási sorsolás, ahol a „csendes” sáv súlya a szorzóval
  **osztódik**. Így minden valódi esemény (álom, sztár-igény, távozás,
  csúcsforma…) arányosan gyakoribb lesz, a súlyuk pedig nem változik.

A **párharcban (PvP) semleges**: a két gép ugyanazt a meccset játssza, egy
csak az egyik oldalon élő szorzó szétválasztaná őket.

A **Mozgalmas piac** ablakai:

| ritkaság | nyár | rövid (8., 23.) | téli (15.) |
|---|:-:|:-:|:-:|
| átlagos | +1 | | |
| ritka | | +1 | |
| nagyon ritka | +1 | +1 | |
| legendás | +1 | +1 | +1 |
| Mítosz | +2 | +2 | +2 |

Több lap összeadódik, de ablakonként legfeljebb **+2**. A plusz a kézi
ablaknál az `eventMax`-ba kerül (`twOpenCheckpointWindow`, nyáron a
`twSummerEventMax()`). Az automatikus ablakok ugyanennyivel több
`resolveOneEvent`-et futtatnak.

## ❤️ Morál

| változat | 1 E | plafon | kapaszkodó |
|---|--:|--:|---|
| **Jó légkör** | a morál célértéke +0,8 pont; a mélypontról 10%-kal gyorsabb visszatérés | +8 pont (×2 visszatérés) | a meccs utáni morál-húzás (`_tc`, `_tv`) |
| **Jellemhullám** | lépések a keret jellemén, a választott irányba | — | `talHullamTick()` a `talPostMatch` elején |

### 🌊 Jellemhullám

A választás után a húzás-ablak **irányválasztóvá** alakul, öt gombbal:

1. Karizma ↑
2. Kapcsolódás ↑
3. Kapcsolódás ↓
4. Vérmérséklet ↓
5. Vérmérséklet ↑

A „kemény” irányok (a Kapcsolódás ↓ és a Vérmérséklet ↑) Panzerben, a
Fordított jellemmel, erőt jelentenek. Ha a „Később döntök” gombot nyomod, a
Talizmánok menüben egy „Irányt választok” gomb vár.

| ritkaság | lépés | forduló |
|---|--:|--:|
| átlagos | 2 | 10 |
| ritka | 3 | 12 |
| nagyon ritka | 5 | 15 |
| legendás | 8 | 20 |
| Mítosz | 12 | 25 |

**Egy lépés** egy véletlen kerettag jellemét viszi egy fokkal arra, amerre
a hullám fúj. Csak olyan játékos jöhet szóba, akinél a skálán még van hova
lépni, és aki ebben a hullámban még nem lépett kettőt. A pool-bejegyzés és a
pályán lévő példány **együtt** mozdul, a napló pedig minden lépést kimond.

Fordulónként legfeljebb egy lépés jön. Az esélye: a hátralévő lépések száma
osztva a hátralévő fordulókéval. A hullám így a hossza végére minden lépését
megteszi, de hogy pontosan mikor, az véletlen.

**Nem ragad be.** Ha a hossza lejárt, és a keretben már senkit nem lehet
abba az irányba vinni (például mindenki a karizma tetején áll), a hullám
**elül**, a napló kimondja, és eltűnik a menüből.

## 💰 Bank

| változat | 1 E | plafon | kapaszkodó |
|---|--:|--:|---|
| **Jobb üzletmenet** | minden bevétel +1,5% | +15% | `budgetEarn` — egyetlen szorzó |
| **Hitelkeret** | kölcsön a szezonkeret egy részéig | 5. lépcső | `talHitel*` |

A Jobb üzletmenet szorzója **nem vonatkozik** a játékos-eladásra (a sima és
a sztár-eladásra sem), a visszatérítésre, a talizmán-passzra és a
hitel-folyósításra (`TAL_BANK_KIVETEL`).

### 🏦 A hitel

| legjobb Hitelkeret-lap | keret | kamat | futamidő |
|---|--:|--:|--:|
| átlagos | a szezonkeret 15%-a | 20% | 15 meccs |
| ritka | 25% | 15% | 15 meccs |
| nagyon ritka | 35% | 10% | 20 meccs |
| legendás | 50% | 6% | 30 meccs |
| 5. lépcső | 60% | 5% | 30 meccs |

Minden további Hitelkeret-lap egy lépcsővel feljebb visz. A keret alapja a
`seasonBudgetCore()`, százasra kerekítve.

* **Felvétel:** csak átigazolási ablakban, a menü „Felveszem” gombjával.
  Egyszerre egy hitel futhat. A folyósítás `loanIn` sorral kerül a
  büdzsébe, szorzó nélkül.
* **Törlesztés:** minden lejátszott meccs után, a bérrel együtt
  (`chargeMatchWages`), egyenlő részletben. Két sor könyvelődik: a tőke
  `loanPay`, a kamat `loanInt`.
* **Ha a kassza nem fedezi a részletet:** a büdzsé nem megy mínuszba. Ami
  kifér, azt kifizeti, a többi **hátralék** lesz, fordulónként +2% késedelmi
  kamattal. **Minden bejövő pénz** (a folyósítás kivételével) előbb a
  hátralékot viszi (`talHitelBehajt`).
* **A „zár” így valósul meg.** Hátralék csak üres kasszánál keletkezik, és
  minden bevétel előbb azt fizeti. Ezért amíg van hátralék, a büdzsé nullán
  áll, és **semmit nem lehet belőle venni** (igazolás, boost, stáb). A terv
  7. döntésének a hatása ez, csak nem egy külön tiltás, hanem maga a pénz
  mondja ki. Így egy elfelejtett ág sem nyithatja ki véletlenül.
* **Előtörlesztés:** bármikor. A hátralévő tőkét és a hátralékot kell
  kifizetni, a még hátralévő kamat elmarad.
* **Lezárás:** ha a tőke, a hátralék és a részletek mind elfogytak. A napló
  kimondja, és új hitel a következő ablakban vehető fel.

## A felület

* A **menü „Aktív alaphatások”** blokkja a F4a sorait is mutatja: a vad
  szorzót, a piac ablakonkénti pluszát, a morál-célt, a futó hullámokat
  (lépés, hátralévő forduló, irány) és a hitelt (a keret, vagy a futó
  hitel részlete, hátraléka és az előtörlesztés gombja).
* A **súgó** (`GLOSSARY.talizman`) kimondja a kilenc élő kategóriát.

## A próba

`node tools/talizman-f4a-proba.js` (9167-es port, ~15 mp), 35 állítás:

* a semleges bit-azonosság;
* a **valódi** átigazolási sorsolás a Vad idénnyel (a csendes sáv szűkül,
  a többi súlya marad);
* a meccs-motor három ritka eseménye;
* a Mozgalmas piac a valódi ablaknyitásban;
* a morál-húzás;
* a jellemhullám a **valódi** húzás-ablakból végig, és az „elül”-eset;
* a bevételi kivételek;
* a hitel teljes életciklusa (felvétel → törlesztés → hátralék → behajtás →
  előtörlesztés → lezárás), a menü gombjával és a három ledger-sorral.

---

# 3.9.145 — F4b: a Joker eseménycsomagjai élnek

> „új események, amik bekerülhetnek az átigazolási esemény pakliban […]
> mindig van benne 2 új jó és egy új rossz.”

## Hol dobódnak

A `twResolvePhase2` **hátsó, súlyozott sávjában**: ugyanott, ahol az
álomigazolás, a kölcsönjátékos és az akadémia. A pakli
(`talEsemenyPakli()`) a súlyozott tömb **végére** fűződik.

* Egy csomag-esemény alapsúlya **1**, ugyanannyi, mint az Elvágyódásé. Ezt a
  ritkaság szorozza: ×1 / ×1,3 / ×1,6 / ×2 / ×2,5.
* Egy esemény **idényenként legfeljebb egyszer** jön ki.
* Ha épp nincs kire lesújtania (nincs 32 fölötti legendád, nincs 21 alatti
  játékosod, üres a kassza), **nem jön ki és nem is ég el**. A sorsolás
  ilyenkor a csendes kimenetre esik.
* **Talizmán nélkül a pakli üres tömb**, tehát a sorsolás betűre a régi.
  Ugyanannyi véletlenszámot fogyaszt, és ugyanazt adja. Az olvasás nem hozza
  létre a talizmán-állapotot.

## A 13 működő esemény

**Azonnaliak.** Ugyanaz a kimenet a kézi és az automatikus ablakban.

| | esemény | mi történik | kapaszkodó |
|---|---|---|---|
| ✦ | ⏳ Az ifjúság forrása | a legmagasabb Ratingű, legalább 32 éves, legalább 500 perces kerettag **10 évet fiatalodik**. A Rating nem esik: a különbséget az akadémia `youthBonus`-a fogja, ami 26 éves korig kifut. A hanyatlás újraindul, a visszavonulási terv elszáll | `careerPool[n].age` |
| ✦ | ⛰️ Edzőtábor az Alpokban | a csapatépítés **kétszerese** (a `bondcamp` mintájára), és a kezdő 11 **+2 Rating, 5 meccsre** | `bondAdd`, `setNextMatchOvr` |
| ✦ | 🚪 Nyílt nap | egy 16 éves érkezik **ingyen**. A POT-ja nagyobb, mint bárkié az akadémián vagy a 19 év alatti kereted tagjai közt | `generateAcademyPlayer` + POT-emelés |
| ✦ | ✈️ Nyári túra Ázsiában | a heti lelátó **4–9-szerese** és **+5% szurkoló**; cserébe **2 meccs −1 csapaterő** (jetlag) | `budgetEarn("talEsemeny")`, `setTeamMomentum` |
| ✖ | 🥂 Hírnév-mámor | a legnagyobb POT-ú, 21 év alatti játékos 10 meccsen át **−30% fejlődést** kap (pályán és padon), a formája ingadozik (−3…+1), és romlik a jele az öltözőben. **Három meccs egymás után a padon kigyógyítja** | `talMamorDev`, `talEsemenyTick` |
| ✖ | 📸 Öltözői botrány | **−8 morál**, és ha van jelölt, jön az **elvágyódás alkuja**. Ugyanaz a képernyő, fölötte a botrány szövegével | `__LEAVE_PENDING__` + `pre` |
| ✖ | 🧾 Adóellenőrzés | a büdzsé **4–10%-a** bírság | `budgetPay("talEsemenyKi")` |
| ✖ | 🩹 Balszerencsés edzés | a legjobb, épp elérhető kezdőd **2–5 meccsre** kidől | `addOrExtendUnavailable` |
| ✖ | 🔒 Pályazár | **két hazai meccs zárt kapuk mögött**: nincs hazai előny, és nincs lelátó-bevétel (a tábor ettől még mozog). A párharcban nem hat | `playMatch` (`_talZart`), `fanMatchTick({zart})` |

**Döntések.** A kézi ablakban gombok vannak, és mindkét gombon ott a
következmény. A nem választható gomb tiltva van, az oka ki van írva. A
végigjátszásban a gép azt választja, amit egy elfogadó menedzser.

| | esemény | a két gomb | a gép |
|---|---|---|---|
| ✦ | 🎩 Egy legenda kopogtat | a stábpiac legjobb sávja fölötti (legfeljebb +10) Szakértelmű szakember **fél áron** — vagy nem | felveszi, ha van hely és pénz |
| ✦ | 🔁 A tékozló fiú | a legjobb, legfeljebb 35 éves, korábban eladott játékosod hazajön **az eladási ára feléért** (az eladott játékos a világban tovább öregszik, de nem vonul vissza — ezért a korhatár) — vagy nem | hazahozza, ha van hely és pénz |
| ✖ | 🧲 Rivális csábítás | a legjobb nem-kapitány kezdőd: **megtartási díj** (a kikiáltási ár 15%-a), vagy **elengeded** a kikiáltási áron (a kezdő 11-be pótlás érkezik) | megtartja, ha van rá pénz |
| ✖ | 💼 Ügynökháború | **+50% bér** az idény végéig — vagy **nem**: 10 meccs −1 Rating, és romlik a jele az öltözőben | igent mond |

**Még nem (F4c):** 🏛️ Igazgatósági ülés, 🎽 Mezszponzor, 🌟 Sztárvilág.
Mindhárom saját alrendszert kér: idényvégi értékelést, az arculat-szerkesztőt
és a hírnév-gépezetet. A paklidba bekerülhetnek, de nem húzhatók. A lapon és
a menüben ⏳ jelzi őket.

## A felület

* **A kézi ablak:** `showTalEsemeny(h)`. Címe „📦 <esemény>”, alatta „🧿 a
  Joker-csomagodból”. A döntés után a szöveg és egy „Tovább” gomb jön (a
  várólista itt kapja meg a kiutat).
* **A menü** („Aktív alaphatások”) mutatja a paklit (✓ = idén már kijött,
  ⏳ = később kapcsol be) és a futó hatásokat: mámor (hátralévő meccsek,
  pad-sorozat 0–3), pályazár, béremelés.
* **A lap:** az Eseménycsomag alaphatása ⚡ él. A még nem működő esemény
  mellett ⏳ áll.
* **Könyvelés:** két új sor, a `talEsemeny` (+, 📦) és a `talEsemenyKi`
  (−, 📦). A többi pénzmozgás a meglévő sorain megy (stáb, igazolás,
  megtartási díj, eladás).

## A próba

`node tools/talizman-f4b-proba.js` (9169-es port, ~20 mp), 38 állítás:

* a semleges állapot;
* a pakli: súly, idényenként egyszer, a még nem működő kimarad;
* mind a kilenc azonnali esemény a **valódi** `twResolvePhase2`-n keresztül;
* a mámor a meccseken át, a gyógyulás és a lejárat;
* a pályazár: lelátó és fogyás;
* a négy döntés a **valódi** képernyőn, mindkét ággal és a tiltással;
* a kézi ablak (`twStartPhase2` → `land`) és az automatikus
  (`autoResolveCheckpoint`) ablak;
* a menü és a lap.
