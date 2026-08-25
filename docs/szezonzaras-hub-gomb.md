# A szezonzárás után a HUB-gomb ugyanoda visz, mint bármikor máskor

*(3.7.30. Érintett kód: `$("hubGoBtn").onclick`, az új `hubScrollTop()`, és
`openHubMidSeason` záró sora. Változatlan: `hubLandWanted`,
`HUBLAND_BLOCKERS`, `landPageWanted`, `stadiumSync`.)*

## A tünet

A bajnokság utolsó meccse után jön a verdikt, alatta a **„Tovább a HUB-ba →"**
gomb. Fekvő nézetben megnyomva „összezavarodnak a dolgok": nem a HUB fekvő
elrendezése jön be, hanem egy szűk hasáb, a tetején a MÁR LEJÁTSZOTT mérkőzés
teljes közvetítés-naplójával, és a lap ráadásul valahol a HUB fejléce alatt áll
meg.

## Az ok — két külön hiba egy gombban

### 1. A meccsképernyő nyitva maradt

A gomb kezelője eddig ennyit tett a láthatósággal:

```js
$("scVerdict").classList.add("hide");
$("scHub").classList.remove("hide");
```

A `#scSim` (a közvetítés-panel az eredményjelzővel és a naplóval) tehát a
lefújás óta változatlanul nyitva volt — a HUB egyszerűen ALÁ került.

Álló nézetben ez „csak" egy fölösleges görgetés. Fekvőben viszont ez a
láthatóság a **kapcsoló**: a HUB saját fekvő elrendezésének (`hubLand`) az
egyik kizáró feltétele épp a látható meccsképernyő —

```js
const HUBLAND_BLOCKERS=["scSim","scVerdict","scEuro","scInfReport","scDraft",
                        "scPyrDiv","scClubPick","scScout","scOpponents"];
```

— így a `hubLand` sosem kapcsolt be. A `landPageWanted` pedig épp arra való,
hogy elkapja azt, ami se nem stadion, se nem HUB: a lap az általános
`landPage` hasábra esett vissza.

**A bizonyíték, hogy ez tényleg hiba és nem szándék:** ugyanezt az állapotot
(`phase="hub"`) egy **újratöltés** helyesen állítja elő — ott a pálya látszik,
a meccsképernyő nem. Ugyanaz a pillanat a karrierben, két különböző képernyő
attól függően, hogyan érkeztél oda. Mérve, 900×414-es ablakban:

| hogyan | `body` | `#scSim` | `#scPitch` | lapmagasság |
|---|---|---|---|--:|
| a gombbal (RÉGI) | `landPage` | **látszik** | látszik | 5477 px |
| újratöltve | `hubLand` | rejtve | látszik | 3299 px |
| a gombbal (ÚJ) | `hubLand` | rejtve | látszik | 3355 px |

A javítás ezért nem kitalál egy új állapotot, hanem **az újratöltés által már
helyesnek bizonyultat rakja össze**: elrejti a meccsképernyőt (és a
biztonság kedvéért a nyitva felejthető `#scWindow` / `#scEuro` panelt), a
pályát pedig kiteszi.

A `#scSim`-et nem kell visszaállítani: a következő szezonindítás
(`startNextCareerSeason`) és a kupaképernyő magától felfedi. Mérve: az új
szezon után `#scSim` látszik, a Kezdőrúgás aktív, `S.idx` 0.

### 2. A görgetés egy elavult koordinátára ment

A `scrollIntoView` a **hívás pillanatában** számol célt. A fekvő elrendezés
viszont csak UTÁNA áll össze: a `hubLand` osztályt a szekciók osztálylistáját
figyelő `stadiumSync` teszi ki (MutationObserver), a `renderHub` tartalma
pedig szintén ekkor kap magasságot. A verdiktnél a lap ráadásul a teljes
meccsnapló ALJÁN áll, tehát ezer pixeres nagyságrendű a görgetnivaló.

Az eredmény mérésenként MÁS volt — a HUB teteje a viewport fölött −265,
−332, −464 px-nél állt meg. (Ez a „változó mértékben elcsúszik" a
felhasználó jelzésében.)

A megoldás ugyanaz a három ütem, amit a kezdőrúgás nézetzárása
(`sbLockView`) már használ: egyszer azonnal, egyszer a következő képkockán,
egyszer röviddel utána — az utolsó kettő a közben kialakult elrendezésre
korrigál.

```js
function hubScrollTop(){
  const go=()=>{const el=$("scHub");
    if(!el||el.classList.contains("hide"))return;
    el.scrollIntoView({behavior:"smooth"});};
  go();
  if(typeof requestAnimationFrame==="function")requestAnimationFrame(go);
  setTimeout(go,140);}
```

Ugyanezt kapta a **szezon közbeni** HUB-bejárat (`openHubMidSeason`) is: ott
az elcsúszás kisebb volt (−62 px), de ugyanaz az ok — és a felhasználó kérése
épp az volt, hogy a gomb „ugyanúgy működjön, mint bármikor máskor". A két
bejárat mostantól ugyanazt a rutint hívja.

## Mérés a javítás után

Playwright, valódi végigjátszott szezon, 900×414-es fekvő ablak:

| | `body` | `#scSim` | `#scHub` teteje |
|---|---|---|--:|
| szezonzárás → HUB | `hubLand` | rejtve | **0 px** |
| szezon közben → HUB | `hubLand` | rejtve | **0 px** |
| ugyanaz újratöltve | `hubLand` | rejtve | −32 px |

Álló nézetben (430×900) a szezonzárás → HUB szintén `#scSim` rejtve, a pálya
látszik, a HUB teteje 0 px — onnan a „🏆 Indulhat a Magyar Kupa!" gomb a
kupaképernyőre visz, tehát a szezonzárás utáni útvonal végig ép.

Nincs konzolhiba egyik ágon sem. `tools/check.sh` zöld.
