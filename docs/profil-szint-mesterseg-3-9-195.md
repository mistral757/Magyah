# 3.9.195 — 🎖️ Profilszint · 🎓 stílus-mesterség · lenyitható profil

> „Már egy ideje bennem van, hogy ezt a profil részt le kéne tisztázni.
> Csomó infó végtelenségig görgetve. Helyette. Minden legyen kinyithatos
> menüpont. És! Legfelül:
> 1. Legyen egy profil lvl rendszer is, ami a karriereken átívelő statokat
>    gyűjti és azokból csinál mérföldköveket, és azokból szinteket. A
>    szinteket később majd a PVP dolgokban fogjuk használni. + A lépcsős
>    rendszerben is lehetne majd szerepe.
> 2. Lenne egy csapatstílus szerepekhez igazodó külön lvl rendszer, ami
>    lehetővé teszi, hogy egy adott profillal fokozatosan egyre fejlettebb
>    szintre lépj egy-egy csapatsilusban. Itt is mérföldköveket gyűjthetünk.
>    És itt egy skill fa lenne megnyitható, ami az egyes stílusokhoz tartozó
>    könnyítéseket oldana fel. Minden szint +1 nyitás a fán"

## 1. A profil-ablak

**Legfelül a profil feje:** a becenév, az azonosító, a profilszint, a rang
és az XP-sáv.

**Alatta minden lenyitható menüpont** (`details`):

| szekció | alapból |
|---|---|
| 🎖️ Profilszint és mérföldkövek | nyitva |
| 🎓 Stílus-mesterség (benne stílusonként egy lenyitható kártya) | nyitva |
| 👤 Becenév és azonosító | nyitva, ha még nincs becenév |
| 📊 Az eredményeid · 🧿 Talizmánok · 🪜 Lépcsők a csúcs felé · 🏆 Örök csúcsok · 🌍 Globális ranglista · 🏅 Helyi Run-ranglista · 💾 Mentések | csukva |

* **A nyitott állapotot a gép megjegyzi**, a stíluskártyákét is.
* **Az ugrások kinyitják a szekciót:** a HUB „Örök csúcsok” és „Eredményeid”
  ugrása (`openProfileAt`) előbb lenyitja, aztán odagörget.
* **A kezdőlapi Profil-gomb** a szintet is kiírja (🎖️5).

## 2. A profilszint

**A tároló a profilé, nem a karrieré** (`localStorage`: `30-0-prof-v1`).
Egy új karrier nem nullázza, egy mentés törlése nem viszi el.

### Mit számol és hol

| forrás | mikor | duplikáció-védelem |
|---|---|---|
| **meccs** (meccs, győzelem, döntetlen, vereség, gól, kapott gól, kapott gól nélküli meccs, mesterhármas) | a lefújás után, a mentés előtt (`profNoteMatch`) | karrier-azonosító + idény + forduló + kupa-/osztályozó-index |
| **idény** (lezárt idény, bajnoki cím, dobogó) | a szezonzárás bejegyzésénél (`profNoteSeason`) | karrier + idény |
| **kupagyőzelem** (a felkészülési torna nem) | a kupa lezárásakor (`profNoteCup`) | karrier + idény + sorozat |
| élvonalbeli címek, képességek, ikonok | a feloldás-naplóból **olvassuk** | — |
| Infinity-megnyitások | a Run-listából | — |
| örök csúcsok | a csúcs-tárból | — |

**A karrier azonosítója** a mentésben él (`S.profCid`). Egy régi mentés az
első számolt meccsénél kap egyet, „régi” jellel, mert a karrierek közé a
visszamenőleges feltöltés már beszámolta.

**Visszamenőleg** az első megnyitáskor a meglévő karrier-mentésekből
feltöltődik:

* az idény-történet: meccsek, győzelmek, gólok, idények, címek, dobogók,
  kupák;
* a futó idény eddigi meccsei;
* a karrierek száma;
* a csapatstílus idényei, meccsei és stílus-mérföldkövei, a választás
  idényétől.

A szerepek meccsei és a mesterhármasok mentésből nem számolhatók vissza,
ezek mostantól gyűlnek.

### A 16 mérföldkő-lépcső

meccs · győzelem · lőtt gól · kapott gól nélküli meccs · mesterhármas ·
lezárt idény · bajnoki cím · dobogó · kupagyőzelem · élvonalbeli cím ·
karrier · Infinity-megnyitás · megszerzett képesség · igazolt ikon · örök
csúcs · a stílus-mesterség összes szintje.

* **Összesen 122 fokozat.** Az n-edik fokozat 10·n XP-t ér.
* **A szint küszöbe** 15·L·(L+1) XP: az 1. szinthez 30, az 5.-hez 450, a
  10.-hez 1650 XP kell. A teljes tábla kb. 5650 XP, ez nagyjából a 19.
  szint.
* **Egy első idény** nagyjából a 2. szintet hozza.

**A rangok:**

| szint | rang |
|---|---|
| 0 | Újonc |
| 1 | Kezdő menedzser |
| 3 | Ígéretes szakember |
| 5 | Rutinos menedzser |
| 7 | Taktikai mester |
| 9 | Klublegenda |
| 11 | Szövetségi kapitány |
| 14 | Élő legenda |
| 17 | Halhatatlan |

**A későbbi haszon:** a `profileLevel()` és a `profileRank()` a PvP és a
feloldási lépcső számára készült. Ma a profil fején, a gombon és a
szintlépéskor a naplóban látszik.

## 3. A stílus-mesterség

> **3.9.197:** sokkal lassabb és gyengébb lett — az aktuális számok a
> `docs/mesterseg-lassitas-nevek-3-9-197.md`-ben.

**Mind a 8 csapatstílusnak saját mesterségszintje van** (0–10). Ez is a
**profilé**: abban a karrierben gyűlik, ahol a stílus a filozófiád,
elsődlegesként vagy másodlagosként.

### A 8 mérföldkő-lépcső

| lépcső | fokozatok |
|---|---|
| meccs a stílussal | 10 · 30 · 60 · 100 · 160 · 250 · 400 |
| győzelem a stílussal | 5 · 15 · 35 · 60 · 100 · 160 · 250 |
| **szerepben lejátszott meccs** (a stílus három megbízatása, `ROLE_KEYS_OF`) | 10 · 40 · 100 · 200 · 350 · 550 |
| **a szereplők gólja + gólpassza** | 5 · 20 · 50 · 100 · 180 · 300 |
| lezárt idény a stílussal | 1 · 2 · 4 · 6 · 9 · 13 |
| bajnoki cím a stílussal | 1 · 2 · 4 · 7 |
| stílus-mérföldkő | 3 · 10 · 25 · 50 · 80 · 120 |
| legmagasabb stílusszint egy karrierben | 3 · 6 · 9 · 12 · 15 · 18 · 20 |

**A szintek küszöbe:** 20 · 60 · 120 · 200 · 300 · 420 · 560 · 720 · 900 ·
1100 XP. Egy stílussal vitt 3 idényes karrier nagyjából az 5.
mesterségszintig visz.

### A mesterség-fa

**Minden mesterségszint egy nyitást ad.** Tíz csomópont van, négy rangban.
Egy rang csak akkor nyitható, ha az adott stílusban már elég csomópont nyitva
van.

| rang | belépő | csomópont | hatás |
|---|---|---|---|
| I. | — | 🎒 Hozott tudás | a stílus választásakor +15 csapatstílus-pont |
| I. | — | 🏅 Mérföldkő-prémium | a stílus mérföldkövei +10% pontot fizetnek |
| I. | — | 🌱 Ismerős fa | a stílus képességei −8% |
| II. | 2 nyitott | 🎒 Hozott tudás II | +25 pont (összesen +40) |
| II. | 2 nyitott | 🏅 Mérföldkő-prémium II | +10% (összesen +20%) |
| II. | 2 nyitott | 🌳 Kitaposott ösvény | −8% (összesen −16%) |
| III. | 5 nyitott | 🤝 Második otthon | másodlagosként a mérföldkövei harmadolás helyett csak feleznek |
| III. | 5 nyitott | 📈 Rutin | a stílus szint-pontja (1–20. szint) +5% |
| IV. | 8 nyitott | 🎒 Hozott tudás III | +40 pont (összesen +80) |
| IV. | 8 nyitott | 🎓 Mesterfokozat | képességár −10% (összesen −26%), mérföldkő +10% (összesen +30%) |

### Hol hat

A hatás mindig **csak arra a stílusra** vonatkozik, amelyiké a csomópont.

* **Képességár:** `styleTraitNextPrice`. A „szint-pont” (sxp) a teljes
  árat méri, nem a kedvezményeset, tehát a kedvezmény nem torzítja a
  stílusszintet.
* **Mérföldkő-jutalom és a másodlagos osztó:** `styleMsRewardFor`.
* **Rutin:** `styleSxpParts`.
* **Hozott tudás:** `chooseStyle` és `chooseStyle2`. Karrierenként és
  stílusonként egyszer jár (`S.masteryGranted`, a mentés része).

**A szintlépés** mind a profilszintnél, mind a mesterségnél egy sorban
megjelenik a karrier naplójában.

## 4. Próba

`tools/profil-szint-3-9-195-proba.js` — lásd a `tools/README.md`-t.
