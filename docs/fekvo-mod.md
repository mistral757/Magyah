# Fekvő mód — a stadion-nézet, a HUB és minden más képernyő

*(3.7.05–3.7.14. Érintett kód: `body.stadium` / `body.stadium.stadiumLive` /
`body.appFs` CSS-blokk az `index.html`-ben, `stadiumWanted`,
`STADIUM_BLOCKERS`, `sbApplyStadium`, `stadiumSync` + a `MutationObserver`,
`stadiumFsActive` / `stadiumFsToggle`, `#stadiumFsBtn`. A HUB oldaláról:
`body.hubLand` CSS-blokk, `hubLandWanted`, `HUBLAND_BLOCKERS`, `applyHubLand`,
`_hubLandOpenedMenu` és a `hubMenuApply` `land`-kapuja. A 3.7.07-ből:
`sbStadiumFits` / `SB_LAND_MIN_RATIO` / `sbViewportW`, `body.landPage`
CSS-blokk, `landPageWanted` / `applyLandPage`, a `.cpLeague` osztály a
`renderClubPickList`-ben, és a belépő képernyő fekvő médialekérdezése.
A 3.7.08-ból: `hubLandPitchApply` / `_hubLandShowedPitch`, az `applyHubLand`
menü-mód-újraszámolása, a `.hubDetail` rács-szabálya és a kihívás-ablak
`:has(.chCard)` szabálya. A 3.7.11-ből: `hubLandBackSync` / `--hubBackH` és a
kitapadt `#hubNextSeasonBtn`. A 3.7.14-ből: a `sbFitTeams` ResizeObserver-e
(`_sbFitState`) és a tábla függőleges sorrendje (`#sbMain` / `#sbEvents`
flex-szabályai). A manifest oldaláról: `icons/site.webmanifest` —
`display: fullscreen`, és `sw-1.js` cache-neve.)*

## 1. Ami volt: egy nézet, ami a lefújással elmúlt

A 3.5-ös stadion-mód arra született, hogy meccs közben le lehessen tenni a
telefont: fektetve az eredményjelző a kijelző teljes szélességét kapta, alatta
futott a közvetítés. Három feltétele volt — **fektetett tájolás**, **alacsony
viewport** (ez zárta ki az asztali böngészőt és a táblagépet) és **élő
mérkőzés**. (A második feltételt a 3.7.07 tágította ki, lásd a 8. szakaszt.)

A harmadik volt a baj. A sípszóra a nézet szétesett, és visszazuhantál az álló
elrendezésbe — fektetett telefonnal a kezedben. A menühöz vissza kellett
forgatni, a következő fordulót onnan indítani, majd újra elfektetni.

## 2. Ami lett: a meccsképernyő maga a feltétel

A harmadik feltétel most **a látható meccsképernyő**. Kezdőrúgás előtt, meccs
közben és lefújás után is ugyanabban a nézetben maradsz — a különbség csak
annyi, hogy **a menü sávként bejön a jobb szélre**.

```
  ÉLŐ MECCS (body.stadium.stadiumLive)      MECCSEN KÍVÜL (body.stadium)
  ┌────────────────────────────┐            ┌──────────────────┬───────┐
  │        eredményjelző       │            │   eredményjelző  │       │
  │           (2fr)            │            │       (2fr)      │ menü  │
  ├────────────────────────────┤            ├──────────────────┤  sáv  │
  │        közvetítés (1fr)    │            │  közvetítés (1fr)│       │
  └────────────────────────────┘            └──────────────────┴───────┘
```

A sáv **nem új gombsor**: ugyanaz a `#matchCtl`, ami álló nézetben a tábla
alatt fut — kezdőrúgás, szezon végigjátszása, öltöző, kihívások, menetrend,
HUB, kupa-tovább. Egy igazság, két nézet; ugyanazok az elemek, ugyanazokkal a
kezelőkkel, csak máshol állnak.

**Az auto-mód is stadion-nézetben fut.** Korábban ki volt zárva, mert a
„Megállítás" gombnak kéznél kellett lennie — most a sávban ül.

## 3. Ablakként bejövő felületek

A skill-sorsolás (`#scSkill`) és a felfedezés-panel (`#scUnlock` —
scout-találat, akadémiai bemutatkozás, osztályozó, Run-finálé) **szekció**, nem
modális: álló nézetben a lap folyamában jelenik meg. Fektetve ez nem működne,
mert a `body.stadium>section:not(#scSim)` szabály minden más szekciót elrejt —
ezért ez a kettő ott **ablakká válik**: sötét háttér, középre zárt kártya,
saját görgetéssel.

A specifikusság szándékos: `body.stadium>#scUnlock:not(.hide)` (1 azonosító +
2 osztály) veri a rejtő szabályt (1 azonosító + 1 osztály), tehát a két
`!important` nem vakon ütközik.

A többi felugró (öltöző, kihívások, menetrend, megerősítő kérdések) eleve
`position:fixed` modális — azok fektetve is működtek, és most is működnek.

## 4. Mikor kapcsol ki

`stadiumWanted()` a kapu. Kikapcsol, ha a meccsképernyő elrejtőzik, **vagy** ha
egy másik fő képernyő kerül fölé:

```js
const STADIUM_BLOCKERS=["scHub","scWindow","scVerdict","scEuro","scInfReport"];
```

Enélkül a HUB, az átigazolási ablak, a szezonzáró verdikt és a kupanézet
láthatatlan maradna — a CSS ugyanis minden más szekciót elrejt.

**A kapu újraértékelése egy hívási hely.** A meccsképernyő láthatósága tucatnyi
helyen billen; ezeket nem hívogatjuk körbe egyenként. Egy `MutationObserver`
nézi a `#scSim` és a blokkolók `class` attribútumát, és ő szól a
`stadiumSync()`-nek. A `_stadiumSyncing` az önmagát ébresztő kör ellen véd — a
`sbApplyLiveLayout` ugyanis a `#scSim` osztálylistájához is hozzányúl
(`matchLive`).

## 5. Teljes képernyő és a morál sáv

A morál csík **csak teljes képernyőn** jön be legalulra: máshol a rendszersáv
venné el a helyét, és a naplóból esne le egy sor. Két úton lehet ott:

| Út | Hogyan |
|---|---|
| **Telepített változat** | a manifest `display: fullscreen` (`display_override: ["fullscreen","standalone"]`) |
| **Böngésző** | a sáv alján a **⛶ Teljes képernyő** gomb (Fullscreen API) |

A `body.appFs` jelzőt a `stadiumFsActive()` adja: `document.fullscreenElement`,
`(display-mode: fullscreen)`, `(display-mode: standalone)` vagy iOS-en a
`navigator.standalone`. A ⛶ gomb csak ott jelenik meg, ahol a teljes képernyő
**kérhető és még nincs megadva** — a manifestből jövő teljes képernyőn nincs
mit kérni.

A morál sáv a rács két alsó, `auto` magasságú sora. Ha rejtve van, a két sor
nulla magas: nem kell két külön elrendezés a két esethez.

> **A régi telepítéseknél a manifest cache-first volt** (`sw-1.js`,
> `STATIC_ASSETS`), tehát a `display` váltása sosem ért volna el hozzájuk.
> Ezért a cache neve `harminc-nulla-cache-v2` lett: új név = új install = friss
> `addAll`, az `activate` pedig kitakarítja a régit. A fő HTML nem érintett, az
> mindig network-first.

## 6. Küszöbök és apróságok

| Dolog | Érték |
|---|---|
| Viewport-magasság határa | `SB_STADIUM_MAX_H = 560` px |
| Oldalarány-határ (asztali) | `SB_LAND_MIN_RATIO = 1.5` |
| Sáv szélessége | `clamp(148px, 27vw, 236px)`, 600 px magasság fölött `clamp(200px, 20vw, 300px)` |
| Tábla / napló aránya | `2fr` / `1fr` |
| Tempó-csúszka helye | jobbra, `10px + --railW` — a sáv mellé húzódik |

* A sáv `justify-content: safe center`. A sima `center` a magasabb gombsor
  tetejét a görgethető területen **kívülre** tolná; a `safe` ilyenkor a
  tetejéhez igazít, a régi böngésző pedig az egész deklarációt eldobja, és
  ugyanoda (`flex-start`) esik vissza. 568×320-as kijelzőn mérve: a sáv
  `scrollHeight` 385, magassága 320, a kezdőrúgás gomb teteje +8 px — elérhető.
* Ha nincs mit előnézetbe tenni (`#sbWrap.hide`), a napló viszi az egész bal
  oszlopot (`#sbWrap.hide + #ttxt { grid-row: 1 / span 2 }`) — nem marad üres
  kétharmad a képernyő tetején.
* A biztonságos zóna (`env(safe-area-inset-*)`) a sáv felőli oldalon a **sávra**
  költözik, élő meccs alatt viszont visszakerül a táblára és a naplóra.

---

## 7. Ugyanez a HUB-on (3.7.06)

A metódus változatlan: **két sáv**, közös fejléc.

```
  ┌──────────────────────────────────────────────────────────┐
  │  fejléc — közös, kitapad a lap tetejére                   │
  ├──────────────┬───────────────────────────────────────────┤
  │              │  felállás (#scPitch)                      │
  │   ☰ MENÜ     │  ─────────────────────────────────────────│
  │  végig nyitva│  Run-kártya · továbblépés · nehézség ·     │
  │  saját       │  büdzsé · kihívások · KERET (két hasábban) │
  │  görgetéssel │                                           │
  └──────────────┴───────────────────────────────────────────┘
```

* **A bal sáv a `#hubActions`** — ugyanaz a menülista, amit álló nézetben a ☰
  gomb nyit. Itt nincs mit megnyitni: fektetve elfér a HUB mellett, tehát végig
  ott van. A ☰ gomb és a „← Vissza a HUB-ba" sáv elrejtve — nincs hova vissza.
* **Nincs menü-mód.** Álló nézetben a menü KÜLÖN KÉPERNYŐ (`#scHub.menuMode`
  elrejti alóla a HUB egész lapját). Fektetve ez pont a jobb oszlopot venné el,
  ezért a `hubMenuApply` kapuja: `active = _inHubMenu && onHub && !hubLand`.
* **Az aloldalak (taktika-, kapitány-, posztválasztó) lebegnek.** A `#scHub`
  végén, a keretlista *alatt* laknak; a bal sávból megnyitva a jobb oszlop
  aljára kerülnének. Fektetve a fejléc alá zárt, kitűzött panelként jönnek elő.
* **A felállás melletti sáv kap tartalmat.** A pálya `float:left`, a csapaterő,
  a kapitány, a morál és az „Irány a szezon" gomb mellé kerül; ami nem fér el,
  az magától a pálya alá csúszik. `740 px` viewport-szélesség alatt nincs
  úsztatás — ott a mellé szorított szövegoszlop 100 px alá menne.
* **A keret két hasábban** (`repeat(auto-fill, minmax(238px, 1fr))`). A
  csoportfejlécek (`.prow`) és a „Mindent kinyit" sáv végigérnek.
* **Visszaforgatáskor a menü becsukódik**, ha mi nyitottuk ki
  (`_hubLandOpenedMenu`) — álló nézetben nem maradhat ott egy kinyitott,
  hosszú menülista, amit a felhasználó nem kért.

### Hol NEM kapcsol be

`HUBLAND_BLOCKERS` = `scSim`, `scVerdict`, `scEuro`, `scInfReport`, `scDraft`,
`scPyrDiv`, `scClubPick`, `scScout`, `scOpponents`. A meccsképernyő a
stadion-nézeté, a többi a saját, lineáris folyamatáé.

**A nagy felületek (vásárlás, klub-szemle, edzésterv, stáb) nem kapnak
menüsávot.** Azok a `#scWindow` szakaszban laknak, és megnyitáskor **elrejtik a
`#scHub`-ot** — a bal sáv viszont fizikailag a `#scHub` belsejében van, tehát
vele együtt tűnne el. A menü kiköltöztetése DOM-műtét volna; helyette a 3.7.07
általános fekvő lapja (`body.landPage`, 8. szakasz) veszi át ezeket: sáv nélkül,
de teljes szélességben és hasábokban.

### Mérés (844×390, világos és sötét témán)

| Amit néztünk | Eredmény |
|---|---|
| HUB fektetve | `hubLand` be, `menuMode` ki · sáv 262×390 · jobb oszlop 526 |
| Aloldal (Taktika) a sávból | `position:fixed`, x=274, a menü végig látszik |
| Infópult ablak | `position:fixed`, 844×390 — fektetve is teljes |
| „Irány a szezon" | `hubLand` ki, a meccsképernyőn `stadium` be |
| HUB szezon közben (`matchHubBtn`) | `hubLand` újra be |
| Visszaforgatás állóra | `hubLand` ki, a menü becsukva, `scrollHeight` a régi |
| 568×320 · 932×430 | bekapcsol · 1280×720 (asztali) **a 3.7.07 óta szintén** |
| Vízszintes görgetés | sehol |

---

## 8. Fekvő az asztali böngészőben is — és minden képernyőn (3.7.07)

Két hiány maradt a 3.7.06 után, és a kettő ugyanabból a döntésből eredt: a fekvő
módot **elfektetett telefonra** terveztük.

### 8.1 A kapu: mi számít „fekvőnek"

A régi feltétel egy magasság-küszöb volt (`sbViewportH() <= 560`). Ez a mai
telefonok fektetett magasságát fogja be — de **kizárta a klasszikus 16:9-es
böngészőablakot**, ahol egy 1080 px magas ablakban a játék egy 520 px-es
hasábban ült a képernyő közepén, két oldalt üresen.

A `sbStadiumFits()` mostantól két úton mondhat igent:

| Út | Feltétel | Mit fog be |
|---|---|---|
| alacsony viewport | `magasság <= SB_STADIUM_MAX_H` (560) | elfektetett telefon |
| széles oldalarány | `szélesség / magasság >= SB_LAND_MIN_RATIO` (1,5) | 16:9 (1,78), 16:10 (1,60), 3:2 (1,50) asztali ablak |

A fektetett tájolás **mindkettőnél** előfeltétel. Az 1,5-es küszöb szándékosan a
3:2 alatt nem enged: egy 4:3-as táblagép (1,33) továbbra is az álló hasábot
kapja — ott a széles ablak nem jelent „fekvő" alakot.

**Az asztali ablak nem csak nagyobb, más is.** A stadion-nézet minden arányát a
magassághoz kötöttük (`clamp(…, …vh, …)`), mert fektetett telefonon az a szűk
keresztmetszet — 1080 px magasságnál viszont minden clamp a felső határán ül, a
fix pixeles méretek (napló, sávgombok) pedig ott maradnak, ahol egy 360 px-es
kijelzőn voltak. Egy `@media (min-height:600px)` blokk igazítja ezt az egy
esetet: szélesebb sáv (`clamp(200px, 20vw, 300px)`), nagyobb naplóbetű és
nagyobb sávgombok. A HUB-fekvő tartalomoszlopa 1100 px viewport-szélesség fölött
1040 px-nél megáll — egy bekezdés 1500 px sorhosszal olvashatatlan.

### 8.2 A harmadik jelző: `body.landPage`

A stadion-nézet és a HUB-fekvő SAJÁT alakot kapott, mert saját alakjuk van. Ami
e kettőn kívül esett, az fektetve is a 520 px-es álló hasábot mutatta:

> kupa-HUB (`#scEuro`) · átigazolási és klub-szemle felület (`#scWindow`) ·
> szezonzáró verdikt (`#scVerdict`) · draft (`#scDraft`) · klubválasztó
> (`#scClubPick`) · osztályválasztó (`#scPyrDiv`) · scout- és ellenfél-sorsolás ·
> karrier-összegzés (`#scInfReport`) · a belépő képernyő (`#mpEntry`)

A **kupa-HUB** volt a legfájóbb: négy kártya egymás alatt (fejléc + kezdőrúgás ·
az előző meccs naplója · a csoporttábla · a statisztikák), vagyis négy
képernyőnyi görgetés úgy, hogy közben a *Kezdőrúgás* gomb kigörgött a képből.

A `landPageWanted()` kapuja a legegyszerűbb, ami lehet:

```js
sbStadiumFits() && !stadiumWanted() && !hubLandWanted()
```

**Nem kell hozzá blokkoló-lista.** Ami nem stadion és nem HUB, az per
definitionem ide tartozik — a jövőbeli képernyőkkel együtt. A `stadiumSync()`
utolsó lépéseként fut, mert a kapuja a másik kettő eredményéből olvas.

### 8.3 Az elv: a LAP nyílik ki, nem a szakaszok

```
  ┌────────────────────────────────────────────────────────┐
  │ fejléc (tömörebb)                                      │
  ├────────────────────────────────────────────────────────┤
  │  ALAPÉRTELMEZÉS: a szakasz 520 px, középre zárva —     │
  │  betűre úgy, ahogy állóban. Egy kérdést nincs értelme  │
  │  1100 px-re széthúzni.                                 │
  │                                                        │
  │  KIVÉTEL: aminek PÁRHUZAMOS a tartalma.                │
  │  ┌───────────┐ ┌───────────┐ ┌───────────┐             │
  │  │ kupakártya│ │ kupakártya│ │ kupakártya│  ← hasábok  │
  │  └───────────┘ └───────────┘ └───────────┘             │
  └────────────────────────────────────────────────────────┘
```

| Felület | Mit kap |
|---|---|
| `#scEuro` (kupa-HUB) | a kártyák `columns: 330px` hasábokban, `break-inside: avoid` |
| `#twBody` kihívás-ajánlatai | `columns: 300px` — de csak `:has(> .chCard)` mellett |
| `#verdictStats` | `columns: 290px` a szezonzáró blokkoknak |
| `#squadList`, `#skillAssignList` | rács, `minmax(240px, 1fr)` |
| `#clubPickList` | rács, `minmax(250px, 1fr)`; a liga-fejlécek (`.cpLeague`) végigérnek |
| `.stattblwrap`, `#euroLog` | belső görgetők `vh`-hoz kötve (`min(260px, 50vh)`) |
| `#pitchWrap` | `min(100%, 66vh, 340px)` — a pálya beférjen magasságban is |
| `#scDraft` + `#scPitch` | 760 px fölött egymás mellé (`inline-block`) |

**Miért `columns` és nem rács a kupa-HUB-on?** A többhasábos folyam
sorrendtartó: az első kártya az első hasáb tetején kezd, tehát a *Kezdőrúgás*
gomb a bal felső sarokban marad. Egy rács sorokba rendezné a kártyákat, és a
sorok magasságát a legmagasabb elem szabná meg — csupa üres hely.
A hasáb-SZÉLESSÉG (nem darabszám) pedig magától egy hasábra esik vissza egy
568 px-es fektetett telefonon; nem kell hozzá külön médialekérdezés.

**És miért a SZŰKEBB fokozat (`--landW2`, 840 px) a kupa-HUB-nak?** A bő
sávban (1120 px) HÁROM hasáb férne el, a kiegyenlítő folyam viszont a
kártyákból kettőt egy hasábba tenne, és a harmadik üresen maradna. 840 px-en
pontosan két, jó szélességű hasáb áll össze. A `#scWindow` marad a bőn: ott
öt-hat kihívás-kártya sorakozik, azoknak jól jön a harmadik hasáb.

**Miért `:has()` a `#twBody`-nál?** Az háromféle tartalmat kap — kihívás-kártyák,
átigazolási pörgetés, szezonvégi csere —, és csak az első áll kártyák
sorozatából. A `:has(> .chCard)` pont ezt a különbséget mondja ki; amelyik
böngésző nem ismeri, az az egész szabályt eldobja, és marad az egy hasáb.

**Miért `inline-block` a draftnál?** A `#scDraft` és a `#scPitch` TESTVÉR a
`body`-ban, a `body`-t pedig nem tehetjük ráccsá — a fejléc és a többi szakasz is
ott van. Az `inline-block` pont ennyit kér, és ami nem fér el, magától egymás alá
esik. A `~` testvér-kapcsolat gondoskodik róla, hogy a felállás csak akkor
költözzön a pörgetés mellé, ha a draft is látszik: a HUB melletti felállásnak ott
a `hubLand` a gazdája.

### 8.4 A belépő képernyő

A nyitókép álló szerkezetre készült: fent a cím, lent a gombok, közte a
vonalrajz — és a rajz sávját **két fix szám** jelölte ki (`top: 262px`,
`bottom: 200px`, a cím és a gombtömb magassága). Egy 390 px magas fektetett
kijelzőn a 262-es tető már a képernyő alja alatt van:

* a sáv magassága 0 lett, a rajz `max-height`-je is nullára esett — **a kép
  egyszerűen eltűnt**;
* a lap 430 px-re nőtt egy 320 px-es kijelzőn, tehát a lábléc (verzió, seed)
  kigörgött a képből.

Fektetve, alacsony kijelzőn (`@media (orientation:landscape) and
(max-height:560px)`) ezért **balról jobbra olvasunk**: bal oldalt a cím, középen
a rajz, jobb oldalt a gombok. A rajz ilyenkor **valódi hasáb** (`position: static`
+ `order: 2`), nem lebegő háttér — így a flex osztja el a helyet, és a rajz soha
nem lóg rá a gombokra. Ugyanaz a három elem, ugyanabban a sorrendben, csak
elforgatva; a jelölés betűre változatlan.

A többi belépő-nézet (szoba, lobby, profil) érintetlen: azok rövidek, és a
`#mpEntry` saját görgetése elviszi őket.

### 8.5 A vezetett élmény buborékjai

`#guideTip`, `#tSteps` és `#tNudgeWhy` a képernyő aljához tapad
(`position: fixed; bottom: 0`), és a magasságuk a szövegtől függ. Egy 320 px
magas fektetett kijelzőn egy hosszabb tipp kinő a képernyő tetején: a gombjai
elérhetetlenné válnak, és nincs mit görgetni, mert nem a lap folyamában ülnek.
Mindhárom doboz mindhárom fekvő módban `max-height: 76dvh; overflow-y: auto`.

### 8.6 Mérés

**A kapu** (kezdőlapon mérve):

| Ablak | `sbStadiumFits` | Eredmény |
|---|---|---|
| 844×390 (telefon fekvő) | ✔ (alacsony) | `landPage`, nincs görgetés, a rajz 194 px |
| 568×320 (kis telefon fekvő) | ✔ (alacsony) | `landPage`, nincs görgetés, a rajz 102 px |
| 1280×720 (asztali 16:9) | ✔ (arány 1,78) | `landPage` |
| 1920×1080 (asztali 16:9) | ✔ (arány 1,78) | `landPage` |
| 1024×768 (táblagép 4:3) | ✘ (arány 1,33) | álló hasáb, változatlan |
| 390×844 (telefon álló) | ✘ (tájolás) | álló hasáb, változatlan |

**Végigjátszva, 844×390-en** (belépő → beállítás → scout → ellenfél-tábla →
klubválasztó → felállás → skill → HUB → kihívások → meccsképernyő):

| Képernyő | Jelző | Megjegyzés |
|---|---|---|
| scout · ellenfél-tábla · felállás | `landPage` | 520 px-es hasáb középen, mint állóban |
| klubválasztó | `landPage` | két hasáb, a liga-fejlécek végigérnek |
| kihívás-ajánlatok (`#scWindow`) | `landPage` | két hasáb |
| HUB + felállás | `hubLand` | menüsáv 306 px, tartalomoszlop a maradék |
| meccsképernyő | `stadium` | tábla + napló + jobb sáv |
| kupa-HUB (`#scEuro`) | `landPage` | két hasáb: kezdőrúgás balra, csoporttábla+statisztika jobbra — a szakasz 363 px magas, vagyis EGY képernyő (előtte három volt) |

**Asztali 16:9-en** (mentésből visszaállítva):

| Ablak | Meccsképernyő | HUB |
|---|---|---|
| 1280×720 | `stadium`, sáv 256 px, napló 13 px | `hubLand`, menü 306, oszlop 974 |
| 1920×1080 | `stadium`, sáv 300 px, napló 17 px | `hubLand`, menü 306, oszlop 1180, középre zárva |

Vízszintes görgetés egyetlen méretnél és egyetlen képernyőn sem.


---

## 9. Négy csiszolás a fekvő módon (3.7.08)

Az első kör után négy dolog maradt, ami fektetve rosszul viselkedett. Mind a
négy ugyanabból jött: a képernyők **álló nézetre írt vezérlése** fekvő módban
más következménnyel járt, mint amire számított.

### 9.1 A felállás sehol nem látszott

A HUB-ba lépés szezon közben **elrejti a pályát** (`hubMidSeasonEnter` — a
`S._hubReturn` feljegyzi, hogy vissza tudja adni). Álló nézetben ez rendben van:
a pályát a **menü-mód** hozza vissza (`hubMenuApply`, 3.2.00 óta), mert a menü
fele — taktika, kapitány, csere, igazolás — épp a felállásra való.

Fekvő módban viszont **nincs menü-mód** (7. szakasz), tehát az a visszahozás
soha nem futott le. A stadion-nézet meg mindent elrejt a meccsképernyőn kívül —
így a felállás fektetve *sehol* nem volt látható, pedig a fekvő HUB jobb
oszlopának épp az a teteje.

`hubLandPitchApply(on)` ugyanazt a párost adja a pályára, amit a
`_hubLandOpenedMenu` a menülistára: fekvő módban felfedi (és újrarajzolja),
visszaforgatáskor pedig **csak akkor** rejti el, ha mi fedtük fel. Draft közben
nem nyúl hozzá — ott a pálya a draft képernyőé.

### 9.2 A kinyitott játékos részletei feleződtek

A fekvő HUB keretlistája rács (`minmax(238px, 1fr)`), a részletdoboz
(`.hubDetail`) pedig a sor UTÁN, ugyanabba a csoport-testbe kerül — vagyis a
rács **egyetlen cellájába**, egy 238 px-es hasábba. Azon belül az
attribútum-dobozok (`.hdAttrs`, `1fr 1fr`) még egyszer feleződtek. A fekvő mód
így pont ott adott kevesebb helyet, ahol a legtöbb adat van.

```css
body.hubLand #hubRoster .hubDetail{grid-column:1/-1}
body.hubLand .hubDetail .hdAttrs{grid-template-columns:repeat(auto-fit,minmax(155px,1fr))}
```

A `grid-column:1/-1` teljes szélességű sort nyit a részletnek a saját sora
alatt; az attribútum-rács pedig `auto-fit`, tehát 844×390-en három, 1920-on mind
az öt attribútum egy sorba áll.

### 9.3 A kihívás-ajánlat ablakká vált

A kihívás-felajánlás nem képernyő, hanem **kérdés**: elvállalod vagy sem, aztán
visszatérsz oda, ahonnan jöttél. Ugyanaz a megszakítás-fajta, mint a
skill-sorsolás vagy a felfedezés-panel — azok fektetve régóta ablakként jönnek
be (3. szakasz). A kihívás lapként viselkedett: alatta üresen maradt a fél
képernyő, a „Kész — tovább" pedig kigörgött.

```css
body.landPage>#scWindow:not(.hide):has(.chCard){ /* sötét háttér, középre zárt kártya */ }
```

A `:has(.chCard)` a kapu: a `#scWindow` **háromféle** tartalmat kap, és csak a
kihívás-lista kérdés — a vásárlás és a klub-szemle valódi munkafelület, az marad
teljes lap. A `.chCard` osztályt egyedül a `renderChallengeOffers` írja ki.
A `#twActions` (a „Kész — tovább", az ajánlat egyetlen kiútja) `position:sticky`
az ablak alján, tehát a hasábok görgetése nem viheti ki a képből.

Mögötte **ottmarad, amiből jöttél** — kupa-kihívásnál például végig látszik a
kupa-HUB.

### 9.4 A szezonközi átigazolási ablak menü-módban nyílt

`twEnterHubWindow()` felfedi a `#scHub`-ot, majd **azonnal** menü-módba kapcsol
(`hubMenuToggle(true, true)`). A `hubMenuApply` kapuja `_inHubMenu && onHub &&
!hubLand` — csakhogy a `hubLand` jelzőt az `applyHubLand` teszi ki, azt pedig egy
`MutationObserver` hívja, vagyis **a következő mikrotaszkban**. A menü-mód
kérdése tehát még a régi, `hubLand` nélküli világban dőlt el.

Az eredmény fektetve: a jobb oszlopból csak a lezáró gomb és a ☰ sáv maradt
(`#scHub.menuMode>.card.hubMainCard>*{display:none}` + a két kivétel), a HUB
lapja eltűnt alóluk.

A javítás egy sor: az `applyHubLand` a `hubLand` jelző **minden billenésekor**
újraszámoltatja a menü-módot.

```js
const was=b.classList.contains("hubLand");
b.classList.toggle("hubLand",on);
if(was!==on)hubMenuApply();
```

Így fektetve a sima HUB fogad, a bal sávban a már kinyitott **Átigazolás**
csoporttal (azt a `twEnterHubWindow` amúgy is kinyitja) — állóra forgatva pedig
visszatér a menü-mód, ahogy addig is.

### 9.5 Mérés

| Amit néztünk | 844×390 | 1280×720 | 1920×1080 |
|---|---|---|---|
| HUB: `menuMode` / felállás | ki / 279×331 | ki / 340×404 | ki / 340×404 |
| Kinyitott játékos: doboz / szülő | 526 / 526 | 918 / 918 | 1124 / 1124 |
| …attribútum-hasábok | 3 | 5 | 5 |
| Kihívás-ablak: kártya | 816×370 | 1020×510 | 1020×492 |
| …lap-görgetés | nincs | nincs | nincs |
| Átigazolási ablak: `menuMode` / fő kártya / ☰ | ki / látszik / rejtve | ki / látszik / rejtve | ki / látszik / rejtve |

Forgatás 844×390 ↔ 390×844, HUB-on és nyitott átigazolási ablakkal is: a pálya
oda-vissza követi a nézetet, a menü-mód állóban visszajön, fektetve elmarad,
vízszintes görgetés sehol.


---

## 10. A kijárat kitapad a bal sáv tetejére (3.7.11)

A `#hubNextSeasonBtn` a HUB **egyetlen kijárata**, négy felirattal, egy
szerepben:

| Felirat | Mikor |
|---|---|
| `← Vissza a szezonhoz` | szezon közben megnyitott HUB |
| `← Vissza a kihívásokhoz` | a kihívás-felajánlásból kitérve (9.3) |
| `✅ Lezárom a … átigazolási időszakot` | nyitott checkpoint-ablak |
| `Irány a pályára →` / nyárzáró feliratok | szezonok között |

A lapon a nehézségi szint fölött ül — vagyis egy 28 fős keretlistával a jobb
oszlop **tetején**. Egy 390 px magas fektetett kijelzőn ez azt jelenti, hogy a
kijárat mindig görgetésre van: nézed a keret alját, és vissza kell kaparásznod
a lap tetejére. (Az alsó iker-gomb pont ezért született — de az meg a lista
ALJÁN van, tehát középről ugyanúgy görgetni kell.)

Fektetve ezért **kitapad a bal sáv tetejére**, közvetlenül a fejléc alá:

```
  ┌──────────────────────────────────────────────┐
  │  fejléc                                       │
  ├──────────────┬───────────────────────────────┤
  │ ← VISSZA A   │                               │
  │   SZEZONHOZ  │   felállás                    │  ← a gomb fix,
  ├──────────────┤   Run-kártya                  │    a sáv alatta
  │  ☰ MENÜ      │   keret…                      │    kezdődik
  │  (görgethető)│                               │
  └──────────────┴───────────────────────────────┘
```

**Miért nem költöztetjük át a DOM-ban** a menü belsejébe: a gomb a
`.hubMainCard` közvetlen gyereke, és több szabály épül erre — a menü-mód
kivétele a `.twCloseBtn`-re, az alsó iker szinkronja, a rejtés-logika. Egy
oda-vissza mozgatás forgatásonként mindezt kockáztatná. A `position:fixed`
ugyanazt adja, **nulla DOM-mozgatással**; a jelölés betűre változatlan.

**A sáv teteje mért adat** (`--hubBackH`, `hubLandBackSync`): a felirat egy vagy
két sorba tördelhet (a nyárzáró és az ablak-lezáró hosszú), és a menünek
pontosan a gomb alatt kell kezdődnie. Nulla három esetben — nincs fekvő HUB, a
gomb rejtve van, vagy egy nagy felület elnyelte a HUB lapját (`hubWin`); az
utóbbi kettőt maga a mérés intézi, mert egy nem festett elem magassága 0.

**A mérés hívási helye a `syncHubNextSeasonTwin`.** Az a közös torok: minden
hívó, ami a gomb feliratát vagy műveletét állítja, oda fut be — tehát egyetlen
jövőbeli állapot sem maradhat ki. (A másik hívó az `applyHubLand`, a jelző
billenésekor.)

**Az alsó iker fektetve rejtve** (`#hubNextSeasonBtn2`): a felső példány végig a
képernyőn van, tehát az indoka — „ne kelljen visszagörgetni" — megszűnt.

### Mérés (844×390)

| Helyzet | Gomb | Sáv teteje | `--hubBackH` |
|---|---|---|---|
| `← Vissza a szezonhoz` | 0,67 · 262×42 | y=109 | 42px |
| a keret aljára görgetve | 0,67 · 262×42 | y=109 | 42px |
| `✅ Lezárom …` (két sor) | 0,67 · 262×59 | y=126 | 59px |
| állóra forgatva | `position:static`, a változó törlődik | — | — |

Átfedés a gomb és a sáv között egyik állapotban sem.


---

## 11. Két bug a kupa-táblán (3.7.14)

Egy kupameccs stadion-nézetében két dolog romlott el egyszerre, és mindkettő
ugyanabból jött: **a tábla két olyan feltevésre épült, ami a fekvő módban nem
igaz.**

### 11.1 A csapatnév a 3 betűs kódnál ragadt

A `sbFitTeams` eldönti, kifér-e a teljes név a mezőbe — ha nem, a 3 betűs kódra
(`POF`, `MCI`) vált. A döntést a **festés pillanatában** hozza meg, és utána
csak egy **ablak-átméretezés** mérte újra.

Van egy harmadik eset, ami egyik sem: **a fekvő mód bekapcsolása.** A tábla
ilyenkor a lap hasábjából a teljes képernyőre ugrik — a névmező 105-135 px-ről
337-re nő —, csakhogy az ablak mérete nem változott, tehát `resize` sem
érkezett. A kupában ez a tipikus út: a sorozat lapján (egy ~400 px-es
hasáb-kártyában) festünk, a stadion-nézet utána kapcsol be.

Mostantól a **mezőt** figyeljük, nem az ablakot: egy `ResizeObserver` szól, ha a
doboz mérete bármiért megváltozik — forgatás, fekvő mód, sáv be/ki,
betűtípus-betöltés. A `resize`-figyelő tartalékként marad a régi böngészőknek.

Az újraírás **feltételes** (`_sbFitState`: szélesség + csapatnév), és ez nem
takarékosság: a megfigyelő a saját írásunkra is felébredne, és egy önmagát
ébresztő kör indulna. Így a második hívás már nem ír, tehát a kör azonnal leáll.

Mérve (890×400, festés egy 400 px-es hasábban, majd stadion-mód `resize`
nélkül): `BOM` → egy képkockával később `Borussia Mönchengladbach`, és
visszaszűkítve újra `BOM`.

### 11.2 A gólkrónika félbevágva látszott

A tábla négy sávja fentről lefelé: **óra · állás · összesítés · gólkrónika**. Az
állást egy `margin:auto 0` zárta középre, a maradék sávok pedig a
`flex-shrink:1` alapértelmezéssel osztoztak — a gólkrónikát ráadásul egy
`min-height:0` engedte **nulláig** összenyomni.

Egy **kupameccsen** jön be az összesítés-sáv is (`#sbAgg`, ötödik elem egy
olyan magasságban, ami négyre volt méretezve), és egy alacsony fektetett
kijelzőn épp a krónika fogyott el: a sor félbevágva látszott, a percek lelógtak
a tábla aljáról.

A sorrend most **kimondott**:

| Sáv | Viselkedés |
|---|---|
| óra, összesítés | `flex:0 0 auto` — a saját magasságán marad |
| gólkrónika | `flex:0 1 auto`, `min-height:32px`, `max-height:38%`, `overflow:hidden` |
| állás | `flex:1 1 auto`, `min-height:0` — **ő** nyeli el a szabad helyet, és ő adja is fel |

A krónika így legalább egy **teljes** sort tart (nincs több félbevágott perc), és
legfeljebb a tábla 38%-át viszi — egy hat gólos meccs sem nyomja szét az
eredményt.

Mérve 890×340 / 300 / 270-en: a tábla tartalma korábban 32-45 px-szel túlnyúlt a
dobozán, most **0**; a krónika mindhárom méretnél teljes egészében látszik.

---

## 12. A szezonzárás utáni HUB-gomb (3.7.30)

A fekvő módnak három jelzője van (`stadium`, `hubLand`, `landPage`), és a
kapujuk a szekciók LÁTHATÓSÁGÁBÓL olvas. Ebből következik, hogy egy nyitva
FELEJTETT szakasz nem kozmetikai hiba: átbillenti a lapot egy másik módba.

Pontosan ez történt a szezonzáró verdikt „Tovább a HUB-ba →" gombjánál: a
kezelő nem rejtette el a lefújás utáni meccsképernyőt, az pedig
`HUBLAND_BLOCKERS`-tag — így a HUB fekvő elrendezése sosem kapcsolt be, és a
lap az általános `landPage` hasábra esett vissza, a teljes meccsnaplóval a HUB
fölött.

A teljes leírás — a második hibával (az elavult koordinátára futó
`scrollIntoView`) és a mérésekkel együtt — a
[`szezonzaras-hub-gomb.md`](szezonzaras-hub-gomb.md) fájlban van.
