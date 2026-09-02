# 🎬 Meccsről meccsre — az auto meccsindító

*(3.9.08. Az érintett kód mind az `index.html` egyetlen script-blokkjában: a
„MECCSRŐL MECCSRE" szakasz — `immOn` / `immArm` / `immPending` / `immStep` /
`immLeagueStopWhy` / `immAfterLeagueMatch` / `immCupArm` —, plusz négy bekötési
pont: a jutalom-lánc indulása (`fullTime`), `mstatAfterMatch`,
`proceedAfterMatch` és `euroAfterUserMatch`.)*

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
  ├─ JUTALMAK, egyenként ── 3 mp ──▶ tovább
  │     · új felfedezés · jutalom-képesség · akadémia · tipp-buborék
  │
  ├─ a meccs értékelése   ── 3 mp ──▶ bezárul
  │
  ├─ FELKÉSZÜLÉS (a tábla átvált, jön az eligazítás)
  │                       ── 15 mp ──▶ KEZDŐRÚGÁS
  └─ …és kezdődik elölről
```

**A három és a tizenöt nem esetleges.** A tudnivaló egy *mondat* — három
másodperc alatt elolvasható, és a lánc lényege épp az, hogy ne kelljen
koppintani érte. A felkészülés viszont az utolsó pont, ahol még beavatkozhatsz
(csere, taktika), ezért ott bőven marad idő.

> **EZ VOLT AZ EREDETI TERV HIÁNYA (3.9.05).** Az első változat csak két
> pontot ismert: az értékelő ablakot (30 mp) és a felkészülést (15 mp). A
> jutalmak viszont az értékelő **előtt** jönnek — a lefújás után előbb fut a
> felfedezés, a jutalom-képesség és az akadémia (`afterAllRewards`), és csak
> utána nyílik az értékelő. A lánc tehát épp ott fegyverkezett fel, ahol a
> munka már véget ért: a jutalom-képernyők alatt semmi nem számolt, és a
> képernyő-őr minden nyitott ablakra megállította a láncot — akkor is, ha az
> ablakban semmi dolgod nem volt, csak egy „Rendben".
>
> Ezért a lánc ma nem egy időzítő, hanem egy **lépés-hurok** (`immStep`).

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

### Mit léptet el magától, és mit nem

A hurok minden lépésnél megnézi, mi áll a képernyőn, és három dolog egyikét
teszi:

| a képernyőn | a lánc |
|---|---|
| **tudnivaló** — egyetlen „Rendben"-szerű gomb | 3 mp múlva megnyomja, és újra körbenéz |
| **valódi döntés** — két vagy több választható út | **megáll**, és megmondja, min |
| **kiút** — visszalépés (`data-imm="kiut"`) | soha nem nyomja meg, mintha ott sem volna |
| **átmeneti** — épp fut egy animáció (képesség-sorsolás) | vár, nem lép és nem áll meg |
| **tiszta** | jöhet a felkészülés, majd a kezdőrúgás |

**A döntés-felismerés nem azonosító-lista, hanem a GOMBOK SZÁMA** a képernyő
gomb-dobozában. Ez nem trükk, hanem a kód szerkezetéből következik: ugyanaz a
doboz (`#unlockActions`) szolgálja ki az **új felfedezést** (egy gomb:
„Rendben") és a **tele keretet** meg az **akadémiát** (két út) — az azonosító
tehát önmagában nem is döntené el. Ugyanez a képesség-képernyőn: a „nem te
döntesz" ág egyetlen „Rendben"-t rak ki, a valódi kiosztás egy egész listát.

Amit így nem ismerünk fel — bármi más nyitott ablak vagy képernyő —, ahhoz
**nem nyúlunk**: a lánc megáll. Vaktában kattintgatni rosszabb, mint várni.

> **Két biztosíték.** (1) Ha egy képernyő a koppintásra nem tűnik el, a hurok
> három másodpercenként örökké pörögne — tizenkét egymást követő lépés után
> megáll és szól (`IMM_STEP_MAX`). (2) Ha egy képernyő „átmeneti" marad
> örökre — mert gomb nélkül ragadt bent —, húsz körülnézés (~9 mp) után
> ugyanígy megáll (`IMM_WAIT_MAX`).
>
> **A NULLA GOMB NEM DÖNTÉS.** Ez nem apró részlet: a gomb-számláló szabály
> naiv olvasata szerint a „nem egy gomb" az döntés volna — és egy épp épülő
> vagy bent ragadt, gomb nélküli képernyőn a lánc örökre olyan kérdésre várna,
> ami meg sem jelent. Nulla gombnál tehát VÁRUNK, nem állunk meg.

### A kémia-építés — és a gomb-számlálás határa

**BEJELENTETT HIBA (3.9.08):** *„amikor kémiaépítéshez ér, akkor mindig új
kémiát akar elkezdeni a mostanit felfüggeszteni. ha nincs user prompt, akkor
mindig építse tovább a már folyamatban levőt."*

Ez a gomb-számlálás egyetlen vakfoltja volt, és pontosan azért, mert a szabály
**gombokat** számol. A kémia-építés képernyőjén a folytatás egy koppintható
`.prow` **DIV** („koppints a továbblépéshez"), a kiszállás viszont igazi
`<button>` („↩ Mégis másik párost építek"). A lánc tehát a képernyőn
**egyetlen gombot** látott, „tudnivalónak" olvasta — és megnyomta. Mérve, a
javítás előtt:

| | javítás nélkül | javítva |
|---|---|---|
| mit nyomna meg | `↩ Mégis másik párost építek` | a folytató sor |
| a páros állása utána | **3/5 → 3/5** (semmi) | 3/5 → **4/5** |
| a lánc | megáll a megerősítő ablakon | megy tovább |

Vagyis a felhasználó minden egyes kémia-jutalomnál azt kapta, hogy a játék a
**folyamatban lévő párost akarja felfüggeszteni** — a fázis pedig nem haladt.

**A javítás két fele.** Az egyik szerkezeti: a **kiút-gomb nem lépés**. Aki
visszalépést tesz ki a képernyőre, `data-imm="kiut"`-tal jelöli, és az
`immBtns` kihagyja — a lánc soha nem nyom meg olyan gombot, ami hátrafelé
visz. A másik a kémia-panel saját ága: a folytató sor `#chemGoOn` azonosítót
kapott, ezt lépteti a lánc; a párválasztó pedig `#chemPickMark`-ot, és **ott
megáll** — ki kivel épüljön, az több szezonra szóló döntés, nem tudnivaló.

Két dolog derült ki menet közben, amit senki nem jelentett:

* **A passzkémia ugyanígy elromlott.** Ugyanaz a panel, ugyanaz a szerkezet,
  ugyanaz a hiba — a javítás mindkettőre megy.
* **A választó „↩ Mégis mást választok elsőnek" gombja is** a lánc kezébe
  került, ha már kiválasztottad az első embert: azt nyomogatva a képernyő
  csak újrarajzolta magát.

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
lefújás ─ üzenetek 3 mp-enként ─▶ KUPA-NÉZET ─ 15 mp ─▶ kezdőrúgás
```

A kupameccs után a játék eddig is **tartott** harminc másodpercet, mielőtt a
sorozat-nézetbe ugrott (`euroHoldStart`). Bekapcsolt móddal ez **kimarad**: a
lánc épp azért van, hogy ne kelljen várni — egy harminc másodperces tartás a
tetején nem ritmus, hanem üresjárat.

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

`IMM_STEP_SEC` 3 · `IMM_PREP_SEC` 15 · `IMM_STEP_MAX` 12 · `IMM_WAIT_MAX` 20.

Mind egy helyen áll, a szakasz tetején. A kupa-ág is a `IMM_PREP_SEC`-et
használja — ott a kupa-nézet és a kezdőrúgás közti szünet ugyanaz a műfaj,
mint a bajnoki felkészülésé.

---

## 7. Az állapot

`S.immersion` — **a mentés része**. Ez nem futásidejű pillanat, hanem az, ahogy
a felhasználó nézni akarja a karrierjét; egy újratöltés nem veheti el tőle.
(Ugyanaz az érv, mint a mezes pályaképnél: `S.ident.kitView`.)

Futásidőben egyetlen időzítő él (`_immT`): egy új visszaszámlálás indítása a
régit leállítja, tehát két lánc sosem futhat egymás mellett.

A hurok **idempotens**: a `_immTarget` megjegyzi, MELYIK képernyőre számolunk,
és ha ugyanarra hívják újra, nem indítja elölről. Ez azért kell, mert az
`immStep`-nek több hívója van — a jutalom-lánc indulása, az értékelő ablak és a
forduló vége —, és a pirulának nem szabad visszaugrálnia attól, hogy kétszer
kérdezünk rá ugyanarra.

---

## 8. Amit szándékosan NEM csinál

* **Nem dönt helyetted.** A hiányzók panelje, a jutalom-képesség választója és
  minden megerősítő kérdés ugyanúgy feljön, és ott a lánc MEGÁLL — csak a
  *léptetést* veszi le a kezedről, a döntéseket nem. A tudnivalókat elléptet;
  a választásokat érintetlenül hagyja.
* **Nem kattint vaktában.** Amit nem ismer fel, ahhoz nem nyúl: inkább megáll.
* **Nem gyorsítja a mérkőzést.** A közvetítés tempóját továbbra is a Tempó
  csúszka állítja; a két rendszer külön él.
* **Nem szól bele a párharcba.** Közös karrierben a párharc-forduló megálló:
  azt a két menedzser együtt indítja.
* **Nem fut a draft alatt vagy szezonon kívül.** A kapcsolósáv is csak
  `phase === "season"` mellett, meccsen kívül látszik.
