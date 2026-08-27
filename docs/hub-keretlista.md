# A HUB keretlistája — húzással csere és a görgetés

*(3.7.35–3.7.36. Érintett kód: `hubDragInit` és a köre (`hubDragRowOf`,
`hubDragLocOf`, `hubDragLift`, `hubDragMoveGhost`, `hubDragAutoScroll`,
`hubDragDrop`, `hubDragClear`), a `HUBDRAG_*` konstansok, `hubStickyInset` /
`hubScrollRowIntoView` / `hubRenderStay`, valamint a `.hubDragArm` /
`.hubDragGhost` / `.hubDragSrc` / `.hubDragTo` CSS és a `body.hubDragging`
jelző.)*

---

## 1. A görgetés a csere után

**Bejelentett hiba:** *„miután két játékost kicseréltem a HUB-ban, mindig
felgörget az edző magasságába."*

**Az ok.** A posztcsere-választó kezelője horgony nélkül hívott `renderHub()`-ot.
A választó megnyitásakor a lap odagördült a panelhez (`scrollIntoView`), a csere
után pedig a teljes HUB újraépült: a régi DOM eltűnt, és a görgetés a lap
tetejére csippent. Semmi nem „ugrott" — nem volt mihez ragaszkodnia.

**Miért nem a meglévő `hubKeepRowAnchor` kellett ide.** Az a sor **képernyőn
elfoglalt helyét** őrzi meg, és a lenyitásnál pontosan ez a helyes: az ujjad
alatt marad a sor. A cserénél viszont a sor a választóhoz görgetés miatt
jellemzően kívül van a képernyőn — ugyanoda visszaállítani annyit tenne, hogy
továbbra sem látszik. **Itt oda kell vinni a lapot, nem megőrizni a helyét.**

`hubScrollRowIntoView(key)` ezt csinálja, három részlettel:

* **a kitapadt sávok alá.** A HUB tetején a ☰ menü sávja (`.hubMenuWrap`) és
  fekvő módban a fejléc `position:sticky` — a viewport 0-jához igazított sor
  épp alájuk csúszna. A `hubStickyInset()` megméri, meddig érnek, és az alá
  teszi a sort;
* **a görgető nem feltétlenül az ablak** — a legközelebbi görgethető ős kell
  (`hubScrollerOf`, ugyanaz, amit a horgony is használ);
* **háromszor igazít** (azonnal · a következő képkockán · 60 ms múlva): a
  lenyíló részletpanel magassága a betűtípusok és a mérők felépülésével még
  mozdulhat.

**Melyik sorhoz görgetünk?** A lenyitott részletpanel a **HELYHEZ** tartozik
(`hubExpandedKey`), tehát a csere után ugyanott áll nyitva — csak már a
beérkező játékossal. Épp azt akarod megnézni: jól sült-e el a csere.

**Mérve** (430×930, a slot:8 lapja nyitva, csere a panelről): a nyitva maradt
sor teteje **69 px**, a kitapadt menüsáv alja **59 px** — vagyis pontosan
10 px-re alatta, a képernyőn.

---

## 1b. …és MINDEN más művelet után is (3.7.36)

**Bejelentett hiba:** *„miután befejeztél egy akciót, pl. megbízás módosítást
vagy piacra tételt, az oldal tetejére görget, mint korábban a csere után.
Maradjon a megnyitott játékoson a »cursor«."*

A fenti javítás **egyetlen úton** oldotta meg ezt: a posztcsere-választón. A
HUB-nak viszont több művelete is teljes újrarajzolással zárul, és mindnél
ugyanaz történt:

| művelet | miért csúszott a tetejére |
|---|---|
| 🧭 Megbízás módosítása | a választó `scrollIntoView`-val magához görgetett, a mentés után csupasz `renderHub()` jött |
| 📈 Piacra bocsátás / levétel a piacról | megerősítő ablakból tér vissza, a `renderHub()` eldobta a régi DOM-ot |
| 👑 Kapitányváltás | ugyanaz, mint a megbízásnál |
| 🎓 Poszt-tanulás | teljes képernyős folyamat, a `csReturnToHub` a HUB **tetejére** görgetett vissza |

**A megoldás egy függvény, két viselkedéssel** (`hubRenderStay`) — mert a két
helyzet tényleg más:

* ha a nyitva maradt sor **most is látszik** a képernyőn (piacra bocsátás: a lap
  nem mozdult, csak egy modális ablak volt fölötte), akkor a **helyét** őrizzük
  meg — az ujjad alatt marad, ahol volt (`hubKeepRowAnchor`);
* ha **nem látszik** (a választópanel odagörgetett magához, vagy egy teljes
  képernyős folyamatból jövünk vissza), akkor **odavisszük** a lapot — a helyét
  megőrizni annyit tenne, hogy továbbra sem látszik (`hubScrollRowIntoView`).

A „látszik" mérce a kitapadt sávokat is beleszámolja: a sticky menüsáv mögé
csúszott sor nem látszik. A horgonyt a `renderHub()` **előtt** kell megmérni,
ezért fut a függvény a rajzolás körül, nem utána.

**Ha nincs nyitott lap** (a kulcs üres, vagy a sor eltűnt — például eladtad),
akkor ez pontosan egy sima `renderHub()`: a görgetés a böngészőre marad, ahogy
eddig. Ugyanezért maradt érintetlen a **felállásváltás**: ott a kezdő 11 teljes
egészében átrendeződik, tehát a HUB tetejére visszaállni a helyes viselkedés.

---

## 2. Húzással csere

**Kérés:** *„elég legyen hosszan megnyomni egy játékos nevét a HUB-ban, és
akkor elindul egy animáció, amivel lehet húzni azt a játékost fel-alá, és így
könnyedebben lehessen cserélni."*

Egy csere eddig négy koppintás volt: sor → részletek → „Posztcsere" → a jelölt
kiválasztása egy külön panelen. Aki a kezdő tizenegyet rendezgeti, az ezt
tucatszor végigjárja.

### 2.1 A gesztus

| lépés | mi történik |
|---|---|
| nyomva tartás | a sor lassan „betölt" (`.hubDragArm`, `HUBDRAG_HOLD_MS` = 500 ms) |
| 0,5 s után | rezgés (ha van), a sor **felemelkedik**: fix pozíciójú másolat (`.hubDragGhost`) követi az ujjat, az eredeti a helyén marad halványan (`.hubDragSrc`) |
| húzás közben | az ujj alatti sor kijelölődik (`.hubDragTo`, ⇄ jellel) — ez a csere partnere |
| a lista szélén | magától görget (`HUBDRAG_EDGE` = 76 px, `HUBDRAG_SPEED` = 14 px/képkocka) |
| felengedés | a két ember **helyet cserél**, a lap odagördül, ahová vitted |

**Miért hosszú nyomás és nem azonnali húzás:** a lista görgethető. Egy azonnal
induló húzás elvenné a görgetést — a hosszú nyomás az egyetlen gesztus, ami
egyértelműen elválik tőle. A nyomás alatti „betöltés" azért kell, hogy ne legyen
néma a várakozás: látszik, mikor indul el.

**Miért lett 1 s-ból 0,5 s (3.7.36).** *„A csere akció indításhoz elég legyen
0,5 s nyomáshossz."* Az egy másodperc a **mérték** miatt volt hosszú, nem az
elválasztás miatt: a görgetéstől nem az IDŐ választja el a húzást, hanem a
`HUBDRAG_SLOP` (8 px elmozdulás alatt nyomás, fölötte görgetés). Aki görgetni
akar, az az első képkockákban már mozdul is — a maradék félmásodperc tehát csak
várakozás volt annak, aki tényleg húzni akart. A „betöltés" animációja együtt
gyorsul vele: a `--hubArmMs` CSS-változót a `HUBDRAG_HOLD_MS` állítja be, tehát
egy helyen kellett átírni.

**A BÖNGÉSZŐ SZÖVEGKIJELÖLÉSE KI VAN KAPCSOLVA (3.7.40).** A fél másodperces
nyomás pontosan az az idő, amikor a mobil böngésző a saját kijelölését is
elindítja — és amint kijelölésbe kezd, elveszi a pointer-eseményeket: a húzás
félbemarad. A `body`-ra tett `user-select:none` és `-webkit-touch-callout:none`
ezt zárja ki az egész játékban; részletek: `docs/vissza-gomb-es-kijeloles.md`.

**8 px-nél nagyobb elmozdulás a nyomás alatt = görgetni akarsz**
(`HUBDRAG_SLOP`): az időzítő elszáll, a lista a szokott módon görög. A **gyors
koppintás változatlan**: a részletpanel ugyanúgy nyílik.

### 2.2 Amit a dobás jelent

**Cserét, nem beszúrást.** A két ember helyet cserél — pontosan az, amit a
posztcsere-panel is csinál (`swapPlayerLocations`), tehát a poszt-illeszkedés
újraszámolása és minden könyvelés változatlan úton megy.

**Egy kivétel: az ÜRES pad-hely.** Oda a **tartalék-keretből** be lehet húzni
valakit (mozgatás, nem csere) — ugyanaz az ág, amit a panel `fillEmptyBench`
esete is jár. Máshonnan nem: a kezdő 11-ből vagy egy másik pad-helyről áthozva
csak új lyukat ütnénk.

### 2.3 A szerkezeti döntések

* **Egy delegált figyelő, nem soronkénti kezelő.** A `renderHub` minden művelet
  után újraépíti a keretlistát (a sorok DOM-elemei eldobódnak), tehát egy
  soronként felkötött kezelő minden rajzolásnál újra felkötést kérne — és egy
  kihagyott ág némán elvenné a gesztust. A `#hubRoster` viszont megmarad: elég rá
  egyszer felülni, és a sorokat a `data-hubkey` alapján találjuk meg. **Ugyanaz
  az azonosító, amit a görgetés-horgony is használ.**
* **Pointer event**, mert egy kódból viszi az ujjat, az egeret és a tollat. A
  `touchmove`-ot külön kell némítani (`{passive:false}`), mert a már megkezdett
  görgetést a böngésző különben nem adja vissza.
* **A felengedést az ABLAKON figyeljük**, nem a listán: az ujj könnyen kicsúszik
  a listából, és egy ottfelejtett „ghost" beragadna a képernyőn.
* **A húzás utáni click-et elnyeljük** — de **időre** (350 ms), nem a következő
  kattintásig. A dobás után a `renderHub` kicseréli a lista teljes DOM-ját, tehát
  a felengedés helyén már más elem van: click sokszor nem is érkezik, a jelző
  viszont bent ragadna, és a felhasználó **következő, teljesen jogos**
  koppintását nyelné el. (Mérve: pontosan ez történt az első változatban.)
* **Meccs közben nincs húzás** (`squadMoveLockReason`), ahogy a panelen sincs; a
  zárolt embert a `swapPlayerLocations` amúgy is visszautasítja, és ki is írja,
  miért. A soron belüli saját úticélú elemek (jelvények, gombok) nem indítanak
  húzást.

### 2.4 Mérés (430×930, ujj-szimuláció)

| amit néztünk | eredmény |
|---|---|
| 200 ms nyomás | `hubDragArm` fut, ghost nincs |
| 500 ms után | ghost felemelve, `body.hubDragging` kitéve |
| lehúzás egy másik sorra | a célsor `hubDragTo`-t kap, a kulcsa a várt (`slot:4`) |
| felengedés | a két játékos tényleg helyet cserélt a keretben |
| utána | ghost eltakarítva, `body` osztály levéve |
| elmozdulás a nyomás alatt | nincs ghost — a lista görög |
| gyors koppintás | `hubExpandedKey` a sorra áll, a lap kinyílik |
