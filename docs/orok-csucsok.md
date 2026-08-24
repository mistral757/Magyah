# Örök csúcsok — karriereken átívelő rekordok

*(3.7.21. Érintett kód: `RECORDS_KEY`, `RECORD_DEFS`, `recordsLoad` /
`recordsSave` / `recordsCtx` / `recordsNote`, `recordsSweep`,
`recordsNoteMoney`, `recordsPanelHtml`, és a három beakasztási pont:
`ledgerNote`, a meccs-végi blokk (`runPaceTick` mellett), a szezonzárás
(`runTempoSync` mellett) és a karrier-lezárás (`runBoardOnClose` mellett).)*

## Mi ez, és miben más, mint a Run-ranglista

A Run-ranglista azt méri, **milyen jó volt egy futás** — egyetlen számban, és
csak az Infinityt megnyitott karrierekről. Az Örök csúcsok azt, hogy **a játék
egésze alatt mi volt a legszélsőségesebb, ami valaha megtörtént**: a legtöbbet
gólozó játékosod, a legdrágább igazolásod, a legmagasabb mezőny, amit valaha
vállaltál.

Két fontos különbség:

- **Nincs belépő.** A Run-ranglistára csak Infinity-megnyitás után kerülsz fel;
  a csúcsok az **első mérkőzésedtől** gyűlnek.
- **Karriereken átívelnek.** Egy lezárt (és törölt) karrier rekordjai
  megmaradnak — pont ettől érdekes visszanézni rájuk: nyolc szezon után is
  lehet, hogy a gólrekord még mindig egy három karrierrel ezelőtti emberé.

## Hol él: localStorage, nem a mentés

`30-0-records-v1`, ugyanazon az elven, mint a Run-ranglista és a profil: egy
karrier lezárása **törli a mentést**, a rekordoknak viszont épp azt kell
túlélniük. Böngészőnként/eszközönként külön (ahogy a téma és a profil is).

Alak: `{v:1, r:{ <kulcs>: {v, who?, team?, season?, at} }}` — a nyers szám
mellett mindig ott a **kontextus**: ki érte el, melyik klubnál, hányadik
szezonban, mikor. Enélkül a szám csak szám; így viszont emlék.

## Két forrás, és ez szándékos

### 1. Állapot-alapú: `recordsSweep()`

A rekordok többsége egy **szám a futó karrierben** (hány gólja van a legjobb
emberednek, mekkora a csapaterőd, hány skillje van valakinek). Ezeket nem
eseményre kötöttem, hanem időnként **végignézzük a teljes állapotot**, és ami
rekord, azt eltesszük.

**Miért így:** egy gól tizenöt különböző helyen születhet (mezőnyből,
tizenegyesből, kupában, párharcban) — ha mind a tizenöthöz hozzá kellene
nyúlni, az első kifelejtett hely némán hiányzó rekordot adna. A söprés viszont
mindig a **valóságot** látja, akárhány új gólforrás jön a jövőben.

A söprés minden lépése külön `try/catch`-ben van: a szezonzárás és a meccs-vég
útjában ül, tehát egy hiányzó mező (régi mentés, félkész állapot) semmiképp nem
akaszthatja meg a játékot — egy kimaradt rekord apró kár, egy megállt
szezonzárás nem az.

**Mikor fut:**
- **minden mérkőzés után** (a meccs-végi blokk legvégén, a `runPaceTick` mellett
  — ekkorra minden könyvelés lezárult: statisztika, tabella, sorozatok,
  kihívások, tehát a söprés a végleges állapotot látja; kupában és párharcban
  is fut);
- **szezonzáráskor** (a „leghosszabb karrier" épp ilyenkor nőhet);
- **karrier-lezáráskor**, közvetlenül a mentés törlése előtt — a nyár óta még
  változhatott az állapot (igazolás, boost, keretbővítés).

### 2. Esemény-alapú: `recordsNoteMoney()`

Ami a söprés számára láthatatlan, mert **nem marad utána állapot**: egy
igazolás *ára* a fizetés pillanatában létezik, utána már csak a játékos van meg.

Ezt a pénzügyi könyvelés **egyetlen kapuján** (`ledgerNote`) csípjük el — ott
minden vásárlás és eladás átmegy, kategóriával és névvel együtt. Így a
klasszikus tárgyalástól a piaci ajánlaton át a sztár-eladásig minden útvonal
magától bekerül, a jövőbeliek is.

A **nyers** `cat`-tal hívjuk, nem a sztár-ágra terelt kulccsal: a `saleStar`
ugyanúgy eladás, csak a sztáré. A `wage`, `boost` stb. kategóriák
szándékosan nem képeznek rekordot.

## A 21 rekord

| | rekord | forrás |
|---|---|---|
| ⚽ | Legtöbb gól (egy játékossal) | `careerStats.g` |
| 🅰️ | Legtöbb gólpassz | `careerStats.a` |
| 👕 | Legtöbb meccs | `careerStats.matches` |
| 🌟 | Legtöbb MVP | `careerStats.mvp` |
| 🧤 | Legtöbb bravúr | `careerStats.saves` |
| 🛡️ | Legtöbb tiszta lap | `careerStats.cs` |
| 📈 | Legmagasabb Rating | `pOvrDisplay` (amit a kártyán is látsz) |
| 💪 | Legmagasabb attribútum | `careerPool[].attrs` (mind az öt tengely) |
| 💎 | Legmagasabb TSI | `careerPool[].tsi` |
| ✦ | Legtöbb képesség | `S.skills[név].length` |
| 📣 | Legmagasabb híresség | `famePoints()` — csak ⭐ Sztárom a párom stílusban |
| 📥 | Legdrágább igazolás | `ledgerNote("buy")` |
| 📤 | Legdrágább eladás | `ledgerNote("sale"/"saleStar")` |
| 🏦 | Legnagyobb büdzsé | `S.transferBudget` |
| 🔥 | Legmagasabb mezőny | `oppTargetRating` |
| ⚔️ | Legerősebb csapat | `teamStrength()` |
| 🎺 | Legnagyobb tábor | `fanBase()` |
| ⚙️ | Legmagasabb taktika | `S.tactics.levels` legmagasabbja (a rendszer nevével) |
| 🎯 | Legtöbb stílus-képesség | `S.style.traits` szintjeinek összege (a stílus nevével) |
| 🧱 | Leghosszabb veretlenség | `S.unbeatenStreak` |
| 📅 | Leghosszabb karrier | `S.seasonHistory.length` |

## A felület

A profil-ablakban (kezdőlap → 👤 Profil), az „Eredményeid" alatt. Nem táblázat,
hanem **kártyák**: a rekordok vegyes természetűek (van, amit ötven karrier
múlva sem döntesz meg, és van, ami az első szezonban beáll), ezért mindegyik
önmagában olvasható — mi a rekord, mennyi, ki, melyik klubnál, mikor.

**Csak a meglévők jelennek meg.** Egy üres sorokkal teli lista azt sugallná,
hogy valamit elmulasztottál; a rekord viszont nem feladat, hanem emlék. A
számláló viszont kiírja, hányból hány áll (`19/21`), hogy legyen mit gyűjteni.

Minden megjelenített név `esc()`-en megy át — a csapatnév felhasználó által
szerkeszthető.

## Tesztelés

Playwright, headless Chromium:

- **Szintetikus állapot**: mind a 21 rekordtípus helyesen töltődik, a helyes
  játékossal (a bravúr/tiszta lap a kapushoz, a gól a csatárhoz), a `wage`
  kategória helyesen **nem** képez rekordot, és a `saleStar` (30 Mrd) helyesen
  felülírja az alacsonyabb `sale`-t (12,75 Mrd).
- **Perzisztencia**: teljes oldal-újratöltés után a rekordok megmaradnak; egy
  gyengébb második karrier **nem** írja felül a régit (gól 150 marad az első
  klubnál), egy erősebb érték viszont igen (mezőny 110 → 134, a kontextus is
  frissül az új klubra).
- **Valódi végigjátszás**: friss karrier (kész klub) → scout → ellenféltábla →
  klubválasztás → kémia → edző → kapitány → képesség → **egy valódi lejátszott
  mérkőzés** (3-0 győzelem). A rekordok maguktól megjelentek a valós
  hookokból: gól 2 · Tord Holmgren, gólpassz 1, meccs 1, MVP 1, bravúr 1,
  Rating 84, attribútum 88, TSI 4629, képesség 1, csapaterő 77,7, tábor 8038,
  büdzsé 4909 pont, mezőny 76, veretlenség 1, taktika 80 · Totális futball.
  A még nem létező rekordok (stílus, híresség, lezárt szezon, igazolás,
  eladás) helyesen hiányoztak.
- **Felület**: sötét és világos (paper) témában is olvasható; üres állapot
  szövege helyes.

`tools/check.sh` zöld.
