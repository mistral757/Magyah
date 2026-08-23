# Fekvő mód — a stadion-nézet és a HUB, egész karrierre

*(3.7.05–3.7.06. Érintett kód: `body.stadium` / `body.stadium.stadiumLive` /
`body.appFs` CSS-blokk az `index.html`-ben, `stadiumWanted`,
`STADIUM_BLOCKERS`, `sbApplyStadium`, `stadiumSync` + a `MutationObserver`,
`stadiumFsActive` / `stadiumFsToggle`, `#stadiumFsBtn`. A HUB oldaláról:
`body.hubLand` CSS-blokk, `hubLandWanted`, `HUBLAND_BLOCKERS`, `applyHubLand`,
`_hubLandOpenedMenu` és a `hubMenuApply` `land`-kapuja. A manifest oldaláról:
`icons/site.webmanifest` — `display: fullscreen`, és `sw-1.js` cache-neve.)*

## 1. Ami volt: egy nézet, ami a lefújással elmúlt

A 3.5-ös stadion-mód arra született, hogy meccs közben le lehessen tenni a
telefont: fektetve az eredményjelző a kijelző teljes szélességét kapta, alatta
futott a közvetítés. Három feltétele volt — **fektetett tájolás**, **alacsony
viewport** (ez zárta ki az asztali böngészőt és a táblagépet) és **élő
mérkőzés**.

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
| Sáv szélessége | `clamp(148px, 27vw, 236px)` |
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

**A nagy felületek (vásárlás, klub-szemle, edzésterv, stáb) egyelőre kimaradnak.**
Azok a `#scWindow` szakaszban laknak, és megnyitáskor **elrejtik a `#scHub`-ot**
— a bal sáv viszont fizikailag a `#scHub` belsejében van, tehát vele együtt
tűnne el. Ilyenkor a lap visszaesik a megszokott, 520 px-es hasábba. Ez a
következő lépés helye, ha kell: vagy a menü költözik ki a `#scHub`-ból egy saját
gazdába, vagy a `#scWindow` kap saját fekvő elrendezést.

### Mérés (844×390, világos és sötét témán)

| Amit néztünk | Eredmény |
|---|---|
| HUB fektetve | `hubLand` be, `menuMode` ki · sáv 262×390 · jobb oszlop 526 |
| Aloldal (Taktika) a sávból | `position:fixed`, x=274, a menü végig látszik |
| Infópult ablak | `position:fixed`, 844×390 — fektetve is teljes |
| „Irány a szezon" | `hubLand` ki, a meccsképernyőn `stadium` be |
| HUB szezon közben (`matchHubBtn`) | `hubLand` újra be |
| Visszaforgatás állóra | `hubLand` ki, a menü becsukva, `scrollHeight` a régi |
| 568×320 · 932×430 | bekapcsol · 1280×720 (asztali) nem |
| Vízszintes görgetés | sehol |
