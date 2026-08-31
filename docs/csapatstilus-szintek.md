# Csapatstílus-szintek és a szezon-szerepek a keretlistán

*(3.8.26. Érintett kód: `styleLvlThreshold` / `styleSxpParts` / `styleLevel` /
`styleLvlProgress` / `STYLE_RANKS` / `styleRankName` / `styleLvlAnnounce` /
`styleHeroHtml`; `roleNamesMap` / `openRolePanel` / a `.rowRole` sor-osztály és
a `data-go="role"` jelvény; a szerep-blokk a `buildHubDetail`-ben.
A teljes terv — a hangsúly-csúszkákkal együtt, amik MÉG NINCSENEK BENNE —:
`docs/terv-stilus-szintek-es-hangsulyok.md`.)*

Két bejelentés egy körben:

> 1. „A csapatstílushoz kapcsolódó szezon szerepek legyenek látványosabb
>    helyen. A HUB-ban lehessen őket módosítani ugyanúgy, mint a piacra tételt
>    vagy a cseréket. akiket kijelölsz először, azok nevére kerüljön rá a
>    szezon jelecske és lehessen rányomni, amivel odaugrik a szerkesztőbe."
> 2. „ehhez be kéne vezetni a csapatstílus szinteket is… minden
>    csapatstílusnak 20 szintje lenne, egyre növekvő xp a szintlépéshez…
>    készítsünk egy saját HUB-szerű menüt a menün belül a csapatstílusnak."

---

## 1. A szint

### 1.1 Miért arány, és nem nyers pont

Kimérve a hét filozófia gazdaságát a mai kódból:

| stílus | elérhető mérföldkő-pont | a képességfa teljes ára | képesség |
|---|--:|--:|--:|
| 🧱 Beton | 1654 | 1938 | 15 |
| 🌀 Tiki-Taka | 1256 | 1580 | 10 |
| ⚽ Bombázók | 1123 | 1872 | 12 |
| 🛡️ Panzer | 953 | 1440 | 10 |
| ☯️ Harmónia | 828 | 2088 | 13 |
| ⭐ Sztár | 750 | 1656 | 11 |
| ⚡ Villám | 628 | 1732 | 12 |

**A szórás 2,6-szeres.** Ha a szint nyers pontból jönne, a filozófia-választás
egyben szint-választás is volna: egy Beton-menedzser ugyanazért a munkáért két
és félszer annyi szintet kapna, mint egy Villám. A szint ezért azt méri,
**mennyit hoztál ki abból, amit EZ a stílus kínál.**

### 1.2 Három csatorna, 1000 SXP

| csatorna | tető | képlet |
|---|--:|---|
| **A** megnyitott szintek | 400 | a fára költött pont ÷ a fa teljes ára |
| **B** teljessé fejlesztett képességek | 350 | Σ tier-súly a 3/3-asokon ÷ Σ az összesen (I=1, II=2, III=3) |
| **C** mérföldkövek | 250 | szerzett mérföldkő-pont ÷ elérhető |

A két képesség-csatorna együtt **750**, a mérföldkövek **250** — pontosan a kért
súlyozás („legnagyobb hatást a képességnyitások, azon belül is a teljessé
fejlesztett képességek adnák, de vinnék előre a mérföldkövek is").

**A B azért él külön**, hogy egy 3/3-as képesség **kétszer** fizessen: egyszer
az árával az A-ban, egyszer a teljességével a B-ben. Ez teszi jobb üzletté egy
képességet végigvinni, mint mindegyikből megvenni az elsőt. A tier-súly azt
ismeri el, hogy egy III. sávú képesség végigfejlesztése 216 pont, egy I. sávúé
76.

### 1.3 A küszöbök

`T(L) = kerekít₅( 1000 × ((L−1)/19)^1,6 )`

| szint | SXP | Δ | rang (Beton) | | szint | SXP | Δ | rang |
|--:|--:|--:|---|---|--:|--:|--:|---|
| 1 | 0 | — | Alapozás | | 11 | 360 | 55 | Bástya |
| 2 | 10 | 10 | Alapozás | | 12 | 415 | 55 | Bástya |
| 3 | 25 | 15 | Alapozás | | 13 | 480 | 65 | Bevehetetlen |
| 4 | 50 | 25 | Alapozás | | 14 | 545 | 65 | Bevehetetlen |
| 5 | 85 | 35 | Kőműves | | 15 | 615 | 70 | Bevehetetlen |
| 6 | 120 | 35 | Kőműves | | 16 | 685 | 70 | Bevehetetlen |
| 7 | 160 | 40 | Kőműves | | 17 | 760 | 75 | A Fal |
| 8 | 200 | 40 | Kőműves | | 18 | 835 | 75 | A Fal |
| 9 | 250 | 50 | Bástya | | 19 | 915 | 80 | A Fal |
| 10 | 305 | 55 | Bástya | | 20 | 1000 | 85 | A Fal |

Az 1,6-os kitevő adja a kért „egyre növekvő XP"-t: a 2. szint tíz pont, a 20.
nyolcvanöt, és a Δ **végig monoton nő** (mérve). Az első négy szint
szándékosan olcsó — a filozófia-választás után azonnal legyen mit látni
mozogni.

**Modellezve** (a három csatorna arányából):

| kiaknázás | A | B | C | SXP | szint |
|---|--:|--:|--:|--:|--:|
| 30% — két-három idény | 120 | 88 | 100 | 308 | **10.** |
| 55% — közép-karrier | 220 | 175 | 163 | 558 | **14.** |
| 90% — hosszú karrier | 360 | 315 | 225 | 900 | **18.** |
| 100% — minden | 400 | 350 | 250 | 1000 | **20.** |

A huszadik szint **a teljes kiaknázás jutalma**: a fa minden szintje megvéve,
minden képesség 3/3-on, minden mérföldkő megvan.

### 1.4 A rangok

A puszta szám hideg. Minden filozófia **öt saját fokozatot** kap, négy-négy
szintre — a szám mondja meg, hol tartasz, a rang azt, **mivé váltál**:

| stílus | 1-4 | 5-8 | 9-12 | 13-16 | 17-20 |
|---|---|---|---|---|---|
| 🧱 Beton | Alapozás | Kőműves | Bástya | Bevehetetlen | A Fal |
| ⚽ Bombázók | Céllövölde | Gólvágó | Ágyúpark | Gólzápor | Kilőtt hálók |
| ☯️ Harmónia | Közös nevező | Egy ritmusra | Zenekar | Egy szervezet | Tökéletes egyensúly |
| ⭐ Sztár | Felfedezve | Címlapon | Reflektorfény | Ikon | Legenda |
| ⚡ Villám | Első sprint | Szélsebes | Villámcsapás | Hangsebesség | Mennydörgés |
| 🛡️ Panzer | Nyers vas | Páncélzat | Ék | Falka | Áttörhetetlen |
| 🌀 Tiki-Taka | Első passzok | Járatás | Körhinta | Labirintus | A labda nem fárad |

### 1.5 Semmi új mentendő adat — egy kivétellel

Mind a három csatorna a **meglévő** állapotból számol (`styleTraitLevel`,
`STYLE_TRAIT_PRICE`, `styleMsState().done`). A szint tehát **származtatott**:
nem tud elveszni, és nem tud elcsúszni a valóságtól.

Egyetlen új mező kell, a `S.style.lvlSeen`: meddig jutott a **hír**. Enélkül
nem lehetne tudni, mikor kell szintlépést bejelenteni. Egy futó karrier az
első méréskor némán felveszi a mostani szintjét — nem kap tizennégy
szintlépés-üzenetet egyszerre.

A hír három helyről indulhat, mert három dolog tolhatja meg a szintet: a
**mérföldkő-kör** (`styleScan`), a **képesség-vásárlás** (`styleTraitBuyLevel`)
és a **panel megnyitása** (`styleDashboardHtml`).

---

## 2. A stílus-HUB fejléce

```
┌─────────────────────────────────────────┐
│▌🧱  BETON VÉDELEM                       │  ← a bal él a filozófia színe
│▌   „Aki nem kap gólt, az nem veszít."   │
│▌                                        │
│▌  ╭───╮  Bevehetetlen                   │  ← a gyűrű a szinten BELÜLI haladás
│▌  │14 │  14. szint a 20-ból             │
│▌  ╰───╯  558 / 615 SXP · még 57 a 15-ig │
│▌ ┌────────┬────────┬────────┐           │
│▌ │ 220/400│ 175/350│ 163/250│           │  ← a három csatorna
│▌ │ szintek│ teljes │ mérföld│           │
│▌ └────────┴────────┴────────┘           │
│▌ 💠 412 stíluspont · 📅 6. szezon óta   │
│▌ 🎽 2/3 szezon-szerep · ⭐ 3 nyitható   │
└─────────────────────────────────────────┘
🏛 A klub filozófiája              412 pont ▼
🧩 Stílus-képességek            18/45 szint ▼
🎽 Szezon-szerepek     dönts!           2/3 ▲
⭐ Csillagozás feloldása      3 nyitható ▼
🏅 Stílus-mérföldkövek             41/102 ▼
```

A csukható kategóriák (`styleSecHtml`) már megvoltak — ez a fejléc került
föléjük.

**A három csatorna-mérő nem dísz:** ez mondja meg, HOL lehet még előrelépni.
Aki 380/400-on áll a szinteknél, de 90/350-en a teljességnél, az tudja, hogy
**szét van szórva a fája** — ez a szám nélkül sehol nem látszott.

A fejléc **kattintható**: a `stilusszint` glosszárium-szócikk nyílik, ami
elmondja a három csatornát és a küszöb-görbét. Egy helyen, a szám mellől.

**A szín egyetlen szabályból jön.** A kártya inline `--sc` változót kap
(`STYLES[].col`), és minden alatta lévő elem (a gyűrű, a sávok, a rang) abból
olvas: a hét filozófia egy CSS-szabályt használ, mégis mindegyik önmaga.

---

## 3. A szerep a keretlistán

### 3.1 A harmadik futó ügy

A keretlista eddig **két** ügyet jelölt, és mindkettő ugyanabból a három
darabból állt. A szerep a harmadik lett, ugyanazon a sínen:

| ügy | halmaz | sor-osztály | jelvény | úticél |
|---|---|---|---|---|
| csereterv | `subPlanNames()` | `.rowSub` (kék) | `🔁 csere` | `openSubPlanner()` |
| piac | `saleListingOf()` | `.rowSale` (arany) | `📈 piacon` / `licit!` | `renderSaleOffersPanel()` |
| **szerep** | `roleNamesMap()` | `.rowRole` (a stílus színe) | `🔓 Nyitó` · `🧱 Fal` | `openRolePanel()` |

**Térkép, nem halmaz.** A jelvényre a szerep **saját neve és ikonja** kerül,
nem egy általános címke: egy „szerepben van" felirat pont azt hallgatná el,
ami a döntés — hogy MELYIK megbízatásról van szó.

**A szín a filozófiáé**, nem egy negyedik rendszer-szín. A kék a csere, az
arany a piac — azok mindig ugyanazt jelentik; ez viszont identitás, és a
keretlista ránézésre elmondja, milyen klub vagy. A soron inline `--roleCol`
viszi be (`STYLES[].col`).

**A bal él a szerepé** akkor is, ha a sor egyszerre csere vagy piac: a szerep
szól a leghosszabb időre (egy egész idényre), a másik kettő pillanatnyi ügy.

**Az úticél gyakorlatilag készen állt:** a tanító-rendszer
`teachOpenStylePanel("role")`-ja már pontosan a kellő három lépést csinálta
(menü ki → kategória nyit → panel rajzol). Csak általános néven ki kellett
emelni belőle.

### 3.2 A chip a keret-mérőn

```
🎽 Szezon-szerep 2/3 · 1 kiosztatlan! ›     🔁 Cseretervben 2 ›     📈 Piacon 1 · 1 licit vár! ›
```

A szerep chipje a **csereterv elé** került: egy egész idényre szól, a másik
kettő pillanatnyi ügy. Ha van üres szerep, figyelmeztető hangot vált — a
kiosztatlan megbízatás ingyen elhagyott előny.

### 3.3 Módosítás a játékos lapján

A piacra bocsátás a **lenyitott lapról** megy, a posztcsere és a poszt-tanulás
alatt — a szerep ugyanoda került. Ettől lesz igaz a kérés második fele: a
jelvény a keretlistán **odavisz**, a lapon pedig **dönteni is lehet**.

```
🎽 SZEZON-SZEREP
   [ 🔓 Nyitó ▾ ]
   🔓 Nyitó — Amíg NINCS gól a meccsen, jóval nagyobb eséllyel ő töri meg a jeget.
   Bármikor átírhatod, a következő meccstől él.
```

**Ugyanaz a szűrő, mint a panelé** (`roleCandidates`): a `roleEligible` belépő
mellett a kapus-kizárás is — négy szerepre mezőnyjátékos kell. Két felület, egy
szabály; enélkül a lapról ki lehetne osztani azt, amit a panel tilt. Aki
egyetlen szerepre sem jelölhető, annál a blokk meg sem jelenik: üres legördülő
rosszabb, mint a semmi.

**Akit más visel, azt is felkínáljuk** — a név ott áll a sorban („most
Vass Á."), mert a `roleAssign` úgyis leveszi róla („egy ember egy szerep").

**Nincs megerősítő kérdés:** a szerep szezonon belül szabadon átírható, tehát
nincs mit megerősíteni — ugyanaz az indok, amiért a stílus-panel legördülője
sem kérdez.

---

## 4. Ami MÉG NINCS benne

A **hangsúly-csúszkák** (a terv 4-5. szakasza) nem részei ennek a körnek. A
szint attól még értelmes szám, hogy még nem hajt semmit — és a
szerep-jelvények egyáltalán nem függenek tőle. A csúszkák teszt-szabálya
(stílusonként mind az öt beépül, egyszerre három állhat nullától eltérően) a
tervdokumentum 4.4-es szakaszában áll.
