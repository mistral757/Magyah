# 🎬 Meccsről meccsre — az auto meccsindító

*(3.9.01. Az érintett kód mind az `index.html` egyetlen script-blokkjában: a
„MECCSRŐL MECCSRE" szakasz — `immOn` / `immArm` / `immLeagueStopWhy` /
`immAfterLeagueMatch` / `immMstatArm` / `immCupArm` —, plusz három bekötési
pont: `mstatAfterMatch`, `proceedAfterMatch` és `euroAfterUserMatch`.)*

## 0. Egy mondatban

Egy kapcsoló az eredményjelző alatt: bekapcsolva a lefújás után magától
bezárul a meccsértékelő, magától jön a felkészülés, és magától indul a
következő mérkőzés — egészen a következő megállóig.

---

## 1. Miért

A karrier ritmusa mérkőzésenként **két koppintás**: bezárni az értékelőt,
elindítani a felkészülést, elindítani a kezdőrúgást. Aki *menedzsel*, annak ez
természetes — minden koppintás egy döntés előtt áll. Aki viszont **nézni**
akarja a csapatát, ahogy a szezon telik, annak pontosan ez a két koppintás
töri meg a folyamatot: soha nem tud hátradőlni.

A „szezon végigjátszása" (`S.auto`) nem erre való: az a **gép kezébe adja a
döntéseket** (jutalom-képességek, pótlások, átigazolások), és a mérkőzéseket
sem játssza le nézhetően. Ez a mód az ellenkezője: **minden döntés a tiéd
marad**, csak a léptetést veszi le a kezedről.

---

## 2. A lánc — egy bajnoki forduló

```
lefújás
  │
  ├─ a meccs értékelése (mstat ablak)      ── 30 mp ──▶ bezárul
  │
  ├─ FELKÉSZÜLÉS (a tábla átvált, jön az eligazítás)
  │                                        ── 15 mp ──▶ KEZDŐRÚGÁS
  └─ …és kezdődik elölről
```

**A harminc és a tizenöt nem esetleges.** Az értékelő egy *táblázat* — végig
kell olvasni; az eligazítás egy *bekezdés* — átfutni is elég.

A visszaszámlálás mindkét lépésnél egy **lebegő pirulán** látszik: mi
következik, hány másodperc múlva, és mellette egy `⏹ Állj`. A pirula azért
lebeg (`position:fixed`), mert a lánc **három képernyőn** megy át
(meccsképernyő → értékelő ablak → kupa-nézet), és mindháromban látszania és
megállíthatónak kell lennie. Z-indexe 480: az értékelő ablak (465) fölött, de
a megerősítő kérdés (470) és a legfelső rétegek alatt — egy válaszra váró
kérdést nem takarhat el.

**A kézi út mindig gyorsabb.** Ha megnyomod a gombot, azonnal történik, ami
történt volna: a lánc és a koppintás **ugyanabba a függvénybe** fut be
(`mstatClose`, `kickoffTap`, `euroKickBtn.click()`), tehát nincs két
viselkedés, amit külön karban kellene tartani.

---

## 3. Hol áll meg

A megállás nem hiba, hanem a mód lényege: ott áll meg, ahol **dönteni kell**,
vagy ahol a mérkőzés megérdemli, hogy magad indítsd el.

| megálló | miért |
|---|---|
| **⚔️ Rangadó** | a szezon kijelölt mérkőzései — `isRivalFixture` |
| **🏆 Bajnoki tétmérkőzés** | amin matematikailag bajnok lehetsz — `isTitleDecider` |
| **📥 Átigazolási időszak** | a 8./15./23. forduló utáni megálló — `CHECKPOINTS` |
| **A szezon vége** | a 30. forduló után a szezonzárás jön |
| **⚔ Párharc-forduló** | közös karrierben a társaddal együtt indítjátok |
| **Osztályozó** | saját képernyője és tétje van |
| **Kupasorozat** | saját ritmusa van — lásd a 4. pontot |

Mindet egyetlen függvény dönti el (`immLeagueStopWhy`), mert **két hívója van**
— az értékelő ablak és a forduló-lánc —, és a kettő nem mondhat mást. A
visszatérési érték maga az indok, ahogy a naplóba is kerül.

**A megállás nem kapcsolja ki a módot.** Ha a rangadót lejátszottad, a lánc a
következő fordulótól magától folytatódik. Kikapcsolni csak a kapcsoló vagy a
pirula `⏹ Állj` gombja tud.

### Képernyő-őr

A visszaszámlálás alatt elnavigálhatsz: átmehetsz a HUB-ba, megnyithatsz egy
ablakot. A lejárat ilyenkor **nem üthet be** — egy kezdőrúgás egy nyitott HUB
alatt a legrosszabb fajta meglepetés. Az `immScreenReady` a lejárat
pillanatában megnézi, hogy tényleg a várt képernyő áll-e, és nincs-e fölötte
ablak; ha nincs, a lánc megáll és meg is mondja, miért.

---

## 4. A kupában

Ugyanez fut, egy lépéssel rövidebben:

```
lefújás ─ értékelő 30 mp ─▶ bezárul ─▶ KUPA-NÉZET ─ 15 mp ─▶ kezdőrúgás
```

A kupameccs után a játék eddig is **tartott** harminc másodpercet, mielőtt a
sorozat-nézetbe ugrott (`euroHoldStart`). Bekapcsolt móddal ez **kimarad**: a
nézelődés ideje már megvolt (az értékelő ablak harminc másodperce), és két
egymás utáni harmincas várakozás nem ritmus, hanem üresjárat.

### A határ a SZAKASZ

Az `euroAfterUserMatch` pontosan négy kimenetet ismer, és a kettéosztás magától
adódik belőle:

| kimenet | mi történik | lánc |
|---|---|---|
| selejtező, 1. mérkőzés után | `showEuroScreen()` | ▶ **megy** |
| **selejtező-párharc eldőlt** | `euroResolveQual()` | ⏸ **megáll** |
| csoportforduló után | `showEuroScreen()` | ▶ **megy** |
| **a csoportkör lezárult** | `euroFinishGroupStage()` | ⏸ **megáll** |
| kieséses párharc 1. mérkőzése után | `showEuroScreen()` | ▶ **megy** |
| **a párharc eldőlt** | `euroResolveRound()` | ⏸ **megáll** |

Ahol `showEuroScreen()`-nel folytatjuk, ott a sorozat **ugyanabban a
szakaszban** lép tovább — ott a lánc mehet. Ahol `euroResolve*` fut, ott a
szakasz lezárul: a csoportkör eredménye, a párharc eldőlése és a selejtező
sorsa mind olyan pont, ahol látnod kell, mi történt.

A megállás itt is **kimondja magát** a naplóban („a csoportkör lezárult", „a
párharc eldőlt"), különben úgy tűnne, elromlott valami.

---

## 5. Ami kizárja

**A szezon végigjátszása erősebb.** A kettő nem futhat egyszerre: az egyik a
gép kezébe adja a döntéseket, a másik épp azért van, hogy te lásd őket. Ha
elindítod a végigjátszást, a lánc lelép (`immCancel`), és amíg az fut, az
`immLeagueStopWhy` sem enged tovább.

---

## 6. Hangoló számok

`IMM_MSTAT_SEC` 30 · `IMM_PREP_SEC` 15.

Mindkettő egy helyen áll, a szakasz tetején. A kupa-ág is a `IMM_PREP_SEC`-et
használja — ott a kupa-nézet és a kezdőrúgás közti szünet ugyanaz a műfaj,
mint a bajnoki felkészülésé.

---

## 7. Az állapot

`S.immersion` — **a mentés része**. Ez nem futásidejű pillanat, hanem az, ahogy
a felhasználó nézni akarja a karrierjét; egy újratöltés nem veheti el tőle.
(Ugyanaz az érv, mint a mezes pályaképnél: `S.ident.kitView`.)

Futásidőben egyetlen időzítő él (`_immT`): egy új visszaszámlálás indítása a
régit leállítja, tehát két lánc sosem futhat egymás mellett.

---

## 8. Amit szándékosan NEM csinál

* **Nem dönt helyetted.** A hiányzók panelje, a jutalom-képesség választója és
  minden megerősítő kérdés ugyanúgy feljön — a lánc csak a *léptetést* veszi
  le a kezedről, a döntéseket nem.
* **Nem gyorsítja a mérkőzést.** A közvetítés tempóját továbbra is a Tempó
  csúszka állítja; a két rendszer külön él.
* **Nem szól bele a párharcba.** Közös karrierben a párharc-forduló megálló:
  azt a két menedzser együtt indítja.
* **Nem fut a draft alatt vagy szezonon kívül.** A kapcsolósáv is csak
  `phase === "season"` mellett, meccsen kívül látszik.
