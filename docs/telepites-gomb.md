# Telepítés a kezdőképernyőre — böngészőtől független gomb

*(3.7.15. Érintett kód: `#installBtn` a fejlécben (`<header>`), `#installModal`
+ `#installModalBody` + `#installCloseBtn`, `pwaInstalled`, `pwaSyncBtn`,
`pwaPlatformHint`, `pwaManualHtml`, `pwaShowManual`, `pwaInstallClick`,
`initPwaInstall`, a `beforeinstallprompt` / `appinstalled` esemény-figyelők.)*

## A probléma

A PWA-telepítés böngészőnként más útvonalon indul — és a legtöbb böngésző ezt
egy alig észrevehető helyre dugja (címsor-ikon, hamburgermenü, megosztás-lap).
A játékos nem biztos, hogy tudja, hogy a Magyah egyáltalán telepíthető. Kellett
egy **egyetlen, mindig ugyanott lévő gomb**, ami akármelyik böngészőben tesz
valamit — akár natívan indítja a telepítést, akár csak megmutatja, hogyan kell
kézzel.

## A gomb: 📲, a fejlécben, `homeBtn` mellett

A fejléc (`<header>`) a `stadium` mód kivételével (élő meccs közben, ahol
amúgy is eltűnik) **minden** képernyőn ott van — nyitóképernyőn, HUB-ban,
fekvő HUB-ban (`hubLand`), a többi fekvő képernyőn (`landPage`) egyaránt.
Ugyanoda került az install-gomb, ahova a `homeBtn`/`themeToggle` már ott
volt — nem kellett új helyet keresni, és a JS is minimális: egy `hide`
osztály, amit a `pwaSyncBtn()` kapcsol.

A gomb **magától eltűnik**, ha a játék már telepítve fut:

```js
function pwaInstalled(){
  try{
    if(window.matchMedia){
      if(window.matchMedia("(display-mode: standalone)").matches)return true;
      if(window.matchMedia("(display-mode: fullscreen)").matches)return true;}
    if(navigator.standalone)return true;   /* iOS, kezdőképernyőről indítva */
  }catch(e){}
  return false;}
```

Ugyanazok az ellenőrzések, mint amiket a `stadiumFsActive()` már használt a
teljes képernyős HUD-hoz — itt viszont KIZÁRÓLAG a manifest/OS szintű
telepítést nézzük, a `document.fullscreenElement`-et (a saját ⛶ gombunk
Fullscreen API-hívása) szándékosan NEM: az attól még nincs telepítve, csak
teljes képernyőn néz ki a böngésző.

## Két út: natív esemény vagy kézi útmutató

**Ahol van `beforeinstallprompt`** (Chrome/Edge, Android): a gombra kattintva
egyenesen a böngésző saját telepítő-párbeszéde nyílik — a `#installModal` elő
sem kerül.

```js
window.addEventListener("beforeinstallprompt",(ev)=>{
  ev.preventDefault();     // a böngésző saját, késleltetett mini-infósávját tiltjuk le
  _pwaInstallEvt=ev;
  pwaSyncBtn();});
async function pwaInstallClick(){
  if(_pwaInstallEvt){
    const ev=_pwaInstallEvt;_pwaInstallEvt=null;
    try{ ev.prompt(); await ev.userChoice; pwaSyncBtn(); return; }
    catch(e){ /* elhasznált/elutasított esemény — essünk vissza a kézi útmutatóra */ }}
  pwaShowManual();}
```

**Ahol nincs ilyen esemény** (iOS Safari sosem küldi, asztali Safari/Firefox
szintén nem): a `#installModal` mutat lépésről lépésre útmutatót,
`pwaPlatformHint()` szerint más szöveggel (iOS: Megosztás → Kezdőképernyőhöz
adás; Android nem-Chrome: böngészőmenü → Telepítés; asztali: címsor-ikon vagy
könyvjelző). Ez sosem hibaüzenet — mindig ad egy következő lépést.

## `appinstalled`: a fül maga NEM válik standalone-ra

Egy csapda: a telepítés befejeztével a rendszer egy **új ablakban** nyitja meg
a telepített változatot — az eredeti böngészőfül, ahonnan a telepítés
elindult, böngésző-módban marad. Ha az `appinstalled` eseményre egyszerűen
újra lefuttatnánk a `pwaInstalled()`-alapú `pwaSyncBtn()`-t, a gomb **tévesen
látható maradna** ezen a fülön (a `display-mode` itt még mindig `browser`).
Ezért az esemény saját magát tekintjük elég bizonyítéknak, és közvetlenül
elrejtjük a gombot:

```js
window.addEventListener("appinstalled",()=>{
  _pwaInstallEvt=null;
  const b=$("installBtn");if(b)b.classList.add("hide");});
```

## Tesztelés

Playwright, headless Chromium, `userAgent` hamisítással:

- **Asztali Chrome UA** — kézi útmutató (Chrome/Edge-specifikus szöveg),
  natív `beforeinstallprompt` szimulálva → `prompt()` ténylegesen meghívva,
  `#installModal` rejtve marad.
- **iPhone Safari UA** — kézi útmutató, iOS-specifikus szöveg (Megosztás →
  Kezdőképernyőhöz adás).
- **Android Chrome UA** — kézi útmutató, Android-specifikus szöveg (⋮ menü →
  Telepítés).
- `display-mode: standalone` hamisítva a kontextus betöltése ELŐTT → a gomb
  már az első kirajzoláskor rejtve.
- `appinstalled` esemény szimulálva → a gomb azonnal eltűnik, még akkor is,
  ha a `display-mode` a tesztfülön (helyesen) böngésző marad.
- 16:9 asztali `landPage` mód és 844×390 szimulált `stadium` mód: a gomb a
  fejlécben megjelenik, illetve a `stadium` alatt a teljes fejléccel együtt
  eltűnik (élő meccs közben nincs mit telepíteni gombbal zavarni).

Mind a nyolc eset a várt eredményt adta.
