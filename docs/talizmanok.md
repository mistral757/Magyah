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
