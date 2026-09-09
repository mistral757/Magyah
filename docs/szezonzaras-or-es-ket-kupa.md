# ⛔🏆 A szezonzárás őre és a két kupa egy szezonban (3.9.59)

Két bejelentés, egy javítás — mert ugyanaz a rendszer sérült mindkettőben.

---

## 1. „A 8. forduló után lezárta a szezont"

> **BEJELENTETT HIBA:** „szezon 8. fordulója után bedobott az előző szezon
> záróképére a BL utáni szezonzárasra az irány a pályára gomb megnyomása után,
> de úgy, mintha ez az aktuális szezon zárása lett volna, mert értékelte az
> első 8 meccs alatt teljesített dolgokat, mindenkinek előrehaladt a fejlődése,
> elbuktam a szezonos kihívásokat, mindenki 1 évvel öregebb lett."

### 1.1 Ezt már javítottuk egyszer — és rossz helyen

A 3.7-es javítás a `hubNextSeasonFlow()` **elejére** tett egy zárat, a saját
kommentjével együtt:

> „BEJELENTETT HIBA: a 2. szezon 8. fordulója után a HUB-ból »egyszer csak«
> véget ért a szezon… A felület javítása mellé ezért ide is kerül egy zár."

A diagnózis jó volt, a **hely** nem. A HUB továbbléptető gombja ugyanis
**három** különböző kezelőt kaphat, és a zár csak az egyiken ült:

| fázis | felirat | kezelő | volt zár? |
|---|---|---|---|
| `season` | ← Vissza a szezonhoz | `hubMidSeasonReturn` | — |
| `hubreport` | **Irány a pályára →** | **`beginNextSeasonWithChallenges`** | **nem** |
| egyéb | Ugrás a nyár végére | `hubNextSeasonFlow` | igen |

A bejelentett eset pontosan a középső sor: a fázis egy megszakadt nyárzárásból
(**a BL utáni szezonzárásból**) ottragadt `hubreport`-on, a gomb ezért az
„Irány a pályára →" szerepet vette fel — és a szezon közepén elindította a
következő idényt: szintlépés, fel-/kiesés, öregedés, kihívás-bukás.

### 1.2 A tanulság: az őrnek a romboló műveletnél a helye

Nem a gombnál, mert gomb sok van és lesz. **Három** visszafordíthatatlan
művelet létezik, és mostantól mind a három ugyanazt az egy kérdést teszi fel:

| művelet | mit csinál |
|---|---|
| `hubShowSeasonReport` | kihívás-kiértékelés, öregítés, szezonváltás |
| `beginNextSeasonWithChallenges` | szintlépés, fel-/kiesés, új idény |
| `startEuroCampaign` | sorozat nélkül **azonnal a szezonjelentésbe esik** |

```js
function seasonCloseAllowed(){
  if(gameMode!=="career")return true;
  return !!S.seasonClosed;}
```

**A mérce `S.seasonClosed`, és nem a `phase`** — épp a fázis romlott el. A
`seasonClosed` a `finish()`-ben lesz igaz, amikor mind a 30 forduló lement, és
a `startNextCareerSeason()`-ben esik vissza hamisra: pontosan az az ablak,
amiben a szezonzárásnak futnia szabad.

### 1.3 És a beragadt fázist meg is gyógyítjuk

Egy néma elutasítás itt nem elég: ha a fázis rossz marad, a gomb újra és újra
ugyanazt a szerepet veszi fel, és a felhasználó beragad. Ezért a
`seasonPhaseRepair()` visszaállítja a fázist, ha nyárzáró állapotot talál egy
**futó** szezonban (`idx` 0 és 30 között, `seasonClosed` hamis) — és kimondja,
mert egy néma javítás nem tanít semmit.

A javítás a `setHubNextSeasonBtn()`-ben is lefut: az a **közös torok**, ahova
minden képernyő befut, tehát az öngyógyítás minden úton megtörténik, nem csak
ott, ahol most gyanakszunk.

---

## 2. „Nem tud lefutni 2 kupa"

> **BEJELENTETT HIBA:** „sokszor próbáltuk már beépíteni, hogy Fából készült
> Kupa után még jöjjön a BL ha azt megnyerte a csapat. ez még mindig nem
> működik. nem tud lefutni 2 kupa."

Ez **két külön okból** nem működött, és mindkettő önmagában is elég lett volna.

### 2.1 A lánc ki volt zárva a piramisból

A `euroMkChainPending()` első érdemi sora ez volt:

```js
if(typeof pyrOn==="function"&&pyrOn())return false;
```

Az indoklás akkor logikusnak tűnt („piramisban a hazai kupa jutalma a következő
idényre szól"), csakhogy **a ligapiramis pont az a mód, ahol az Fából Készült
Serleg egyáltalán létezik**. A lánc tehát soha, egyetlen karrierben sem
futhatott le rá. A `comp!=="MK"` szűkítés ugyanezt tette: az FA-t kizárta.

### 2.2 És a „következő idényre szóló" jutalom sem ért el a pályáig

A tartalék-út is törött volt, csak csendesebben:

1. megnyered az FA-t → `pyrCupWinNote()` eltesz egy nevezést:
   `S.euroEntry = {comp:"BL", qual:true, forSeason:N+1}`;
2. az `N+1`. szezon indításakor ez átkerül: `S.euroCurrent="BL"`;
3. …de a kupák a szezon **végén** futnak, és odáig eljutva az `N+1`. szezon
   `finish()`-e **felülírta ugyanazt a mezőt** a bajnoki helyezésből számolt
   indulással:

```js
S.euroCurrent = ce.comp;          /* feltétel nélkül */
```

Vagyis a megígért BL pontosan azelőtt tűnt el, hogy sorra került volna —
minden alkalommal, némán.

### 2.3 A javítás

**A lánc általánosítva** (`cupChainNext`): a `cupTierFor().cupWins`-ből
dolgozik, ami osztályonként más, és a sík mód régi `mkWinsKL` szabálya is
megmarad mellette.

| hol | a hazai kupa | amit ér | hogyan |
|---|---|---|---|
| D1 · D2 | Fából Készült Serleg | **BL** | selejtezőtől |
| D3 | Magor Kupája | **BL** | selejtezőtől |
| D4 | Magor Kupája | — | nincs lánc |
| sík mód, 80-84 | Magor Kupája | KL | selejtező nélkül |

A sorozat **azonnal indul, ugyanabban a szezonban** — pontosan ezt kérte a
bejelentés. Szezononként **egy** lánc süthet el (`S.mkToKLDone`), különben egy
megnyert BL újabb sorozatot indítana a végtelenségig.

**A felülírás ellen** a `finish()` külön védve van: a helyezésből járó indulás
csak akkor veszi át a helyet, ha **erősebb** (BL > EL > KL > hazai kupa) —
ugyanaz a rangsor, amivel a `pyrCupWinNote` is dolgozik. Ha a meglévő az
erősebb, marad, és a napló ki is mondja: *„a helyezésedből OJK járna, de a
korábban kiharcolt BL-indulás erősebb — az marad."* Egy csendben megtartott
jutalom épp olyan zavarba ejtő, mint egy csendben elvett.

**A kétszeres jutalom ellen:** ha a lánc most elsül, a „következő idényre
szóló" nevezés nem születik meg. A kettő egymás alternatívája, nem kiegészítője.

---

## 3. Mérés

`tools/szezonzaras-or-proba.js` — 17 állítás:

* a három romboló művelet mind visszafordul a 8. fordulónál, és **semmi nem
  változik** (szezonszám, fordulószám);
* a beragadt `hubreport` fázis meggyógyul, és a gomb visszakapja a
  „← Vissza a szezonhoz" szerepét;
* lezárt szezonban viszont mind a három átenged — az őr nem akadály, hanem zár;
* a lánc mind a négy osztályon és a sík módban is a helyes sorozatot adja;
* szezononként egy lánc, és vesztes kupa nem indít láncot;
* a kiharcolt BL túléli a gyengébb helyezést, de egy jobb helyezés felülírhatja.
