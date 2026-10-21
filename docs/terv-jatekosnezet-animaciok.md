# TERV: játékos-adatlap, meccsesemény-animációk, élő meccskép

> „Már egy ideje gondolkodom három dolgon, ami igazából egy nagy téma. Erre kéne
> egy plan. 1. Játékos nézet … 2. Meccsesemény vizuális szimulációk … 3.
> Vizualizáció meccs közben.”

Ez **terv, nem megvalósítás**. A kódban még semmi nem változott. Minden fázis
külön verzió, külön próbával. A 7. fejezet kérdéseire adott válaszok
módosíthatják a tervet.

## 0. Ami már megvan, és amire építünk

| darab | hol | mire jó itt |
|---|---|---|
| `jerseySVG(kit,size,opts)`, `identKitOrDefault`, `kitForNow` | ~60960–61000 | mez a portrén és az animációkban |
| `buildHubDetail(loc)` + `details.hdSec` szakaszok, `hdBindSections` | ~91994 | az adatlap TARTALMA: átköltözik, nem újraíródik |
| `addLine(html,cls,budgeted)` | ~60336 | minden meccssor ezen megy át: az animáció horga |
| `EV_ICONS` (regex → típus), `HANG_SOR` | ~60287, ~8231 | kész esemény-besorolás a szövegből (tartalék út) |
| PvP: `sim.events` (`type:"goal"` …), `h2hPlayback` | ~65823, ~65945 | a párharcban már STRUKTURÁLT eseménylista van |
| `fxAnimOff`, `prefers-reduced-motion`, `pix*Off` kapcsolók | 39. sor és a beállítások | az animációk ki/be, a pixel-téma |
| `drawPitch()` + `pitchXY` / `slotXY` | ~43692 | a felállás koordinátái az élő meccsképhez |
| `matchSpeed`, `MATCH_SPEED_*`, `MATCH_SPEED_UI` | ~60190 | a tempó-skála |

Ami **nincs**: arckép, adatlap-ablak, egységes eseménymodell a normál
meccsen (ott a sorok csak HTML-szövegek), meccs közbeni pályakép.

## 1. A tempó-skála átszámozása (F0, a többi alapja)

> **ELKÉSZÜLT: 3.9.266.** A döntés: az első értelmezés, az alap az új 0,25×.
> Próba: `tools/tempo-skala-3-9-266-proba.js`.

### 1.1 A kérés értelmezése

A kérés: „az 1x sebesség lenne a régi 0.5x, és lenne mostantól 3x, és
ugyanúgy 0.1x az alja, ami fele olyan gyors mint a régi 1x”.

Ez **lineáris, ×0,5-ös átszámozásként** áll össze: `régi = új × 0,5`.

| új felirat | régi érték | ütem (5 perces szakasz) | egy meccs |
|---|---|---|---|
| 3× (új max) | 1,5× (a mostani max) | 220 ms | ~4 mp |
| 1× | 0,5× | 660 ms | ~12 mp |
| 0,5× | 0,25× (a régi alap) | 1,32 s | ~24 mp |
| 0,25× (új alap, az animáció küszöbe) | 0,125× | 2,64 s | ~48 mp |
| 0,1× (új min) | 0,05× | 6,6 s | ~2 perc |

**Kétértelmű pont:** a „fele olyan gyors mint a régi 1x” szó szerint a régi
0,5×. Az viszont az új 1×, nem a 0,1×. A fenti tábla azzal számol, hogy az új
0,1× a régi 0,1× fele (0,05×). A 7. fejezet 1. kérdése erre vonatkozik.

### 1.2 Megvalósítás

* Egy `MATCH_SPEED_SCALE=0.5`. A `tickMs` ezen megy át:
  `Math.round(330/(matchSpeed*MATCH_SPEED_SCALE))`.
* A csúszkák (`#matchSpeedRange`, `#euroSpeedRange`) új tartománya
  0,1–3, a lépés végig 0,05.
* **Átköltöztetés:** új kulcs, `harminc_nulla_matchspeed_v2`. Ha csak a v1
  létezik, `v2 = v1 × 2`. Így a beállított TEMPÓ marad, csak a felirat
  változik. Az alapérték (döntés) az új 0,25×, ami a régi 0,125×: aki sosem
  állította, lassabb közvetítést kap, mint eddig.
* Az auto-mód (18 ms) és a párharc fix ütem (`H2H_TICK_MS`) nem változik. A
  párharc szövegében a „0,1×” felirat igazodik, ha kell.
* Próba: a régi kulcs átszámolódik, a tickMs betűre a régi egy átállított
  felhasználónál, és a két csúszka szinkronban marad.

## 2. Játékos-adatlap ablak és arckép (F1–F2)

### 2.1 Az arckép-generátor (F1)

> **ELKÉSZÜLT: 3.9.267** (még nem jelenik meg a játékban; az F2 teszi ki az
> adatlapra). A kód az `index.html` „ARCKÉP (3.9.267, F1)” blokkja.
> Próba: `tools/arckep-3-9-267-proba.js`. Mintaoldal: `tools/arckep-galeria.js`.
>
> Ami a terv óta pontosodott:
> * 19 hajstílus, 7 szakáll, 5 szemforma, 6 orr, 6 száj (a morál húzza), 10
>   bőrtónus, 9 hajszín, 6 szemszín; 400 valódi játékosból 400 különböző arc.
> * A kor: őszülés (31–41 évesen indul, mindenkinek a maga idején), ráncok,
>   és a játékosok kb. 40%-ánál visszahúzódó hajvonal. Aki kopaszodik, rövidre
>   vágatja a frufrut és a bokrot; a végén „patkó” marad.
> * A pixeles változat 40×40-es, a rajz saját palettájára (≈25 szín)
>   kvantálva. A vonalak ehhez vastagabbak (`bold`).
> * Választás: `faceStilus()` — „auto” (pixel-témában pixeles), „sima”,
>   „pix” (`faceStyle30_0`). A kapcsoló az F2 adatlapjára kerül.
> * Ismert korlát: az arc a névből és a nemzetiségből sorsolódik, ezért egy
>   valódi sztár bőrtónusa nem feltétlenül egyezik a valóságossal.

**Elv:** determinisztikus, procedurális SVG, rétegekből. Ugyanaz a játékos
mindig ugyanazt az arcot kapja, minden gépen. A PvP-ben az ellenfél is ezt
látja. Nincs kép-fájl és nincs hálózat.

**Mag:** `faceSeed(p)` = hash(név + születési idény / eredet). Ez lehetőleg ne
változzon átigazoláskor vagy névmódosításkor. Ha van stabil azonosító, az
legyen a mag.

**Változók (mind a magból, néhány a játékos adataiból):**

| réteg | változatok | ami befolyásolja |
|---|---|---|
| arcforma | ~8 (ovális, szögletes, kerek, hosszú…) | mag |
| bőrtónus | ~10 skála | mag, a nemzetiség (`nat`) szerinti eloszlással súlyozva |
| fül, nyak | 3–4 | mag |
| szem (forma, szín, távolság) | ~8 × 5 szín | mag |
| szemöldök | ~8 | mag; a jellem (pl. agresszív) ráncolhatja |
| orr | ~8 | mag |
| száj | ~6, és a hangulat szerint mosoly vagy szigor | mag + morál |
| haj (forma) | ~16 (kopasz, rövid, fade, göndör, copf, hosszú, mohawk…) | mag |
| haj (szín) | ~8 | mag + nemzetiség; **a kor őszít** (32+ fokozatosan) |
| hajvonal | — | **a kor**: 30 fölött eshet vissza |
| szakáll, bajusz | ~8 (nincs, borosta, kecske, telt…) | mag + kor (a fiatal ritkábban) |
| kiegészítő | ritka: hajpánt, fejpánt, sebtapasz, kapus-sapka | mag, poszt |
| mez | `jerseySVG` gallér-része, a klub szerelésével | a klub (mezszám is mehet rá) |
| háttér | a kártyaszint színe (`playerCardTier`) | a kártyaszint |

Ez kb. 10¹⁰ kombináció. Két csapattárs gyakorlatilag nem lesz egyforma.

**Két változat:**

* **Sima:** vektoros SVG, tetszőleges méretben éles.
* **Pixeles:** ugyanaz az SVG 32×32-es (vagy 40×40-es) canvasra raszterezve,
  majd `image-rendering:pixelated`-del felnagyítva. Utána egy szűkített
  paletta-kvantálás (16–24 szín) kell, hogy valóban pixel-art legyen, ne
  elmosott kép. A pixel-téma automatikusan ezt mutatja. Máshol a beállítás
  dönt: „Arckép: sima / pixeles”.
* **Gyorsítótár:** `faceCache[mag+korsáv+mez]` → dataURL. A keret ~25–40
  arca egyszer rajzolódik, utána csak `<img>`.

**Méret:** a generátor a rétegek path-adataival együtt becsülten 25–45 KB a
már 8 MB-os fájlban. Ez elfogadható.

**Hol jelenik meg (F1 után fokozatosan):** az adatlap (nagy), a HUB-lista
sorai (kicsi, kikapcsolható), az animációk, a gólszerző-kártya, a
díjátadók.

### 2.2 Az adatlap-ablak (F2)

> **ELKÉSZÜLT: 3.9.268.** Próba: `tools/jatekos-adatlap-3-9-268-proba.js`.
>
> * A törzs a régi lenyíló (`buildHubDetail`) változatlanul; a nyitott lapot
>   továbbra is a `hubExpandedKey` jelöli, a `renderHub` minden újrarajzoláskor
>   az ablakot frissíti (`plSheetSync`), vagy bezárja, ha a játékos eltűnt.
> * Fejléc: arckép (Sima/Pixel váltó), mezszám, név, poszt és hely
>   (kezdő/pad/tartalék), kor, nemzetiség, kártyaszint, morál, forma,
>   összhang; jobbra a Rating (a poszton érvényes) és a POT.
> * Lapozás: ‹ › gombok, oldalra húzás a fejlécen, ← → billentyűk; körbe ér.
> * Bezárás: ✕, a háttérre koppintás, a telefon vissza gombja, Esc.
> * A posztcsere-, poszt-tanulás- és megbízás-választó előtt az ablak
>   bezárul (azok a HUB-ban nyílnak). A felugró ablakok (eladás-megerősítő,
>   szójegyzék, súgó) fölötte ülnek: az ablak z-indexe 58, azoké 60+.
> * Beállítások → témaválasztó alatt: „🧑 Játékos-adatlap — Külön ablakban,
>   arcképpel” (KI = a régi lenyíló), és „Arckép: automatikus / sima /
>   pixeles”.

* A HUB-ban a játékosra koppintva **nem nyílik le** a sor. Egy teljes
  magasságú lap (`.plSheet`) nyílik meg: telefonon alulról felcsúszó, széles
  képernyőn középen álló modal.
* **Fejléc:** nagy arckép (sima/pixeles váltóval), név, mezszám, poszt, kor,
  nemzetiség, kártyaszint, Rating, forma, morál, státusz-jelek.
* **Törzs:** a mostani `buildHubDetail` szakaszai (`hdSec`) változatlan
  tartalommal, fülekre vagy a mostani lenyíló szakaszokra rendezve.
  Átköltöznek, nem íródnak újra. A `hdOpenState` megmarad.
* **Navigáció:** ‹ › gombok vagy oldalra húzás a keret következő
  játékosára. Esc / vissza gomb / háttérre koppintás zár. Az Android vissza
  gombja a `history` állapottal zárja, ahogy a többi ablaknál.
* **Átmenet:** egy verzióig egy beállítás („Játékos: ablak / lenyíló”) őrzi
  a régit, aztán kikerül.
* **Kockázat:** a `buildHubDetail` belső gombjai (`hdBindSections`, edzés,
  poszt-tanulás, eladás…) ID-kre kötnek. Az ablakban egyszerre egy példány
  él, így nincs ütközés. A kötéseket a gyökér-elemre kell átírni,
  `document`-szintű `$()` helyett.

## 3. Meccsesemény-animációk (F3–F4)

### 3.1 Mikor futnak

* Csak **0,25× és lassabb** új tempónál (ez a régi 0,125×), és csak ha a
  beállítás be van kapcsolva: „🎬 Esemény-animációk”, alapból be.
  `fxAnimOff`, `prefers-reduced-motion` vagy auto-mód mellett nincs animáció.
* **Meccsenkénti keret a tempótól:**

  | tempó | animáció / meccs |
  |---|---|
  | 0,25× | 3 |
  | 0,2× | 4 |
  | 0,15× | 6 |
  | 0,1× | 8 |

* **Rangsor, ha több esemény versenyez:** saját gól > kapott gól >
  tizenegyes > piros lap > kapufa > bravúr > ritka skill-pillanat
  > szöglet / becsúszás / letámadás. **A gól mindig kap animációt**, a keret
  fölött is. A többi a keretből fogy. Egy meccsen ugyanaz a típus legfeljebb
  2× ismétlődik.
* **Megszakítás nélkül:** animáció közben a meccsóra **áll** (a tick-időzítő
  szünetel), utána folytatódik. Koppintásra átugorható. Egy
  „ne mutasd többet ezen a meccsen” gomb is van.

### 3.2 Eseménymodell: honnan tudjuk, MI történt

> **ELKÉSZÜLT: 3.9.269 (F3).** Kód: az `index.html` „MECCSESEMÉNYEK (3.9.269,
> F3)” blokkja, közvetlenül az `addLine` előtt. Próba:
> `tools/meccsesemeny-3-9-269-proba.js` (valódi meccsekkel).
>
> * **A csatorna:** az esemény ott születik, ahol a közvetítés sora: amit a
>   motor csak némán könyvel el, azt a néző nem látta, animáció sem jár hozzá.
> * **Három forrás:** az `sbEv` (gól, sárga, piros, sérülés, névvel), az
>   `addLine` 4. paramétere (tipp: `{t, side, p, alt}` — bravúr, védés,
>   blokk, gólvonal, szöglet-tisztázás, kapufa, lövés, kidolgozás,
>   tizenegyes, VAR, letámadás, büntetőpárbaj, csere), és a szöveg-tartalék
>   (`MEV_SOR`, csak percbélyeges közvetítés-sorra).
> * **A gól két fele:** az esemény az `sbEv`-ből lesz (név), a sora adja a
>   fajtát (`alt`: fejes, tizenegyes, szabadrúgás, letámadás, padról,
>   potya, öngól, hosszabbítás) — mindkét sorrendben; a mesterhármas és
>   társai az utolsó saját gól jelzője (`extra`).
> * **Kiválasztás** (`mevValaszt`): csak új 0,25× és lassabb tempón, kézi
>   közvetítésben, bekapcsolt animációval (`evAnimOff30_0`; az élő háttér
>   kikapcsolása is kikapcsolja). A gól mindig; a többi a keretből
>   (0,25×: 3 · 0,2×: 4 · 0,15×: 6 · 0,1×: 8), időarányosan (ha a keret a
>   meccs eddigi részénél jobban fogyott, csak prio ≥ 60), típusonként ≤ 2.
>   A csere sosem. A megszakított meccs gyorsított újrajátszása alatt sem.
> * **Átadás az F4-nek:** `mevFeliratkoz(fn)` — a kiválasztott események;
>   `mevLista()` — a futó (vagy az utolsó) meccs összes eseménye.
> * **Mérve 10 meccsen (0,1×):** minden gól esemény (az eredménnyel
>   egyezően, névvel, a sorával); 14 eseménytípus; a gólok mellett
>   meccsenként 4–8 animáció; a modul nem húz véletlent.

A normál meccsen az események jelenleg csak HTML-sorok. Két út van:

1. **Strukturált tipp (fő út):** az `addLine` kap egy 4. paramétert:
   `{a:"goal", p:játékos, side:"home"|"away", assist:p2, min}`. A
   kibocsátó helyeken (gól, kapufa, védés, lap, szöglet, becsúszás
   `fearNote("tackle")`, letámadás `engNote("press")`, tizenegyes, VAR,
   mesterhármas, sérülés) ezt hozzá kell adni. Ez a legtöbb munka: kb.
   20–30 hívási hely, gépiesen.
2. **Tartalék:** ha nincs tipp, az `EV_ICONS` regex-besorolása ad típust.
   Ilyenkor nincs játékos, ezért az animáció arc nélküli (sziluett + mez).

A PvP-ben a `sim.events` már strukturált. Ott csak le kell képezni.

### 3.3 Az animáció-motor

> **ELKÉSZÜLT: 3.9.270 (F4).** Kód: az `index.html` „ESEMÉNY-ANIMÁCIÓK
> (3.9.270, F4)” blokkja. Próba: `tools/esemeny-animacio-3-9-270-proba.js`.
>
> * **Lejátszó:** feliratkozik az F3-ra (`mevFeliratkoz`), sorba állít,
>   egyenként játszik (`#evAnim`, z 435). A jelenet a tick UTÁN indul
>   (setTimeout 0), hogy a gól sora (fajta, mesterhármas) már hozzákapcsolódjon.
> * **Az óra áll** a jelenet alatt: `MATCH_CTL.animSzunet` / `animFolytat`
>   (a cserepanel útja); ha közben a félidei panel nyílik, az indít újra.
>   Párharcban az óra NEM áll (közös lista), ott a jelenet ráúszik, és nem
>   torlódik.
> * **Kezelés:** koppintás vagy a vissza gomb → tovább; „Ne mutasd többet
>   ezen a meccsen”; háttérbe tett fülön kimarad.
> * **Jelenetek (13 sablon, 19 típus):** gól (alap, fejes, tizenegyes,
>   szabadrúgás; mesterhármas-felirat), kapott gól, kapufa, bravúr/védés
>   (ziccer), tizenegyes és büntetőpárbaj (gól, kapufa, kivédve, kimarad),
>   sárga/piros lap (a bíró felmutatja; piros: levonul), szöglet (beadás
>   fejessel, vagy fejes tisztázás), szabadrúgás (sorfal), blokk/szerelés
>   (becsúszás), gólvonal-mentés, letámadás (hárman zárnak), sérülés, VAR,
>   lövés (mellé, védik, blokkolják), kidolgozás.
> * **Szereplők:** „bobblehead” figurák — fej-váll az F1 arcképe a
>   csapat mezében, alatta nadrág és láb. A főszereplő az esemény
>   játékosa (a morál-arccal: gólnál vigyorog, kapott gólnál lehorgaszt).
>   Az ellenfél mezét a nevéből generáljuk (`evaEllenfelKit`), és sosem
>   hasonlít a miénkre. A felirat-sáv: cím, perc · név (· ellenfél), arc.
> * **3.9.271 — a figura teste:** az első változat a portré mellszobrát
>   (széles váll a mezzel) tette két vékony lábra — nem illeszkedett. Most a
>   portréból csak a FEJ jön (`faceSVG` `csakFej`: váll és gallér nélkül,
>   álló 68×84-es kivágás), a test saját, arányos rajz: mezes törzs ujjal és
>   gallérral (a klub mintája ráfeszítve), nadrág, a bőrszínhez illő kar és
>   comb, sportszár a mez színében, cipő. A fej nagyobb a testnél
>   (bobblehead), a nyak a gallérba fut.
> * **Pixel-téma:** lépcsős mozgás, szögletes keret, pixeles arc (a saját
>   tizenegy arca a kezdőrúgáskor előre elkészül).
> * **Beállítás:** a témaválasztó alatt „🎬 Esemény-animációk” (BE/KI).

* **Egy teljes képernyős réteg** (`#evAnim`, fixed, z-index a feed fölött).
  Benne egy 16:9-es (telefonon álló 9:16) SVG-színpad.
* **Technika:** SVG + CSS/WAAPI kulcskockák (`element.animate`). Nincs
  külső könyvtár, nincs canvas-fizika. 1–3 mp, 60 fps a mai telefonokon. A
  pixel-témában lépcsős `steps()` időzítés és a pixeles arc.
* **Sablon = jelenet-recept:** `ANIM_TPL[típus] = {dur, build(stage,ctx)}`.
  A `ctx` tartalma: az érintett játékos(ok) arca, mezük
  (`jerseySVG(kitFor(side))`), mezszám, az ellenfél színe, a perc és az
  eredmény. Minden sablon 2–3 variánst kap a magból, hogy ne legyen unalmas.
* **Közös építőkockák:** pálya-részlet (kapu, tizenhatos, szögletzászló),
  stilizált figura (mez-test + arc-fej + egyszerű végtagok, „bobblehead”
  stílus), labda mozgáspályával, kapus, háló-rezgés, villanás és lassítás,
  felirat-sáv („GÓÓÓL! 67' — Kovács 2–1”).

**Sablonlista (első kör):**

| típus | jelenet |
|---|---|
| ⚽ gól | lövés → a labda a háló felé → háló-rezgés → ünneplő arc közelije + eredmény |
| 😞 kapott gól | ugyanaz az ellenfél mezében, a végén a mi kapusunk arca |
| 🥅 kapufa | lövés → a labda a kapufán csattan, a kapu remeg, „KAPUFA!” |
| 🧤 bravúr | vetődő kapus (az ő arca), kiütött labda |
| 🦵 becsúszás | két figura, becsúszás, a labda elpattan |
| 🐺 letámadás | 2–3 figura zár, labdaszerzés, a stílus színe |
| 🚩 szöglet | felső nézet: beívelés → fejes |
| 🎯 szabadrúgás | sorfal + ívelt lövés |
| ⚪ tizenegyes | lövő és kapus szemközt, oldalválasztás → kimenetel |
| 🟨🟥 lap | a bíró felmutatja; a játékos arca, piros lapnál az elvonulás |
| 📺 VAR | képernyő-keret, „ellenőrzés…”, döntés |
| 🎩 mesterhármas | három gyors villanás + az arc „koronával” |
| 🤕 sérülés | a játékos a földön, orvosi táska |
| ⭐ ritka skill / stílus-pillanat | a stílus jelével és színével |

**Hang:** a meglévő hang-réteg (`hang(id)`) az animáció kezdetén szól. Ma is
szól, csak eddig a sorhoz kötődött.

### 3.4 Határok

* **PvP-párharc:** az animáció CSAK HELYI, a szimuláció eredményét nem érinti
  (az eseménylista előre kész). A két kliens lejátszása nem kell, hogy
  kockapontos legyen. Ezt ellenőrizni kell a `h2hPlayback`-ben: ha valahol a
  lejátszás időzítése szinkron-üzenetre vár, ott az animáció nem állíthatja
  meg az órát, csak átfedésként fut.
* **Determinizmus:** az animáció a meccs `R()` véletlenjéből **nem** húzhat.
  Saját, az eseményből képzett magot használ, különben elcsúszna a
  szimuláció.
* **Háttérfül, alvó telefon:** ha a lap nem látható, az animáció kimarad.

## 4. Élő meccskép (F5)

Ez nem fizikai szimuláció. Az események **vizuális követése** egy kis
pályán, a feed fölött (összecsukható, telefonon ~120 px magas).

* **22 pötty** a két felállás `slotXY` koordinátáiból, a mezek színével. A
  sajátunk a meglévő `drawPitch` logikából, az ellenfélé a felállásából vagy
  egy alap 4-4-2-ből.
* **A labda** az eseményből következő zónába vándorol, egy rövid íven:
  * támadás: az ellenfél harmada;
  * szöglet: a sarok;
  * gól: a háló.

  Események között a labdabirtoklás-arány szerint sodródik. A pöttyök enyhén
  a labda felé húzódnak.
* **Csíkok és jelek a pálya alatt:** labdabirtoklás-sáv, „lendület”-görbe
  (a helyzetek ötperces szakaszonként) és a lapok/cserék jelei az idővonalon.
* **Kapcsolat az animációval:** a lassú tempón a nagy esemény a kis pályáról
  „nagyít be” a teljes képernyős animációba, majd vissza.
* Gyors tempón (1× fölött) csak a labda-zóna és a lendület-görbe frissül.
  Az élő meccskép tehát MINDEN tempón működik, az animáció csak a lassún.

## 5. Fázisok és sorrend

| fázis | tartalom | függ | becslés |
|---|---|---|---|
| **F0** | tempó-skála ×0,5, v2 kulcs, átköltöztetés, csúszkák 0,1–3 | — | kicsi (1 verzió) |
| **F1** | arckép-generátor (sima + pixeles), gyorsítótár, galéria-próba (100 arc egy lapon, szemre ellenőrzés) | — | közepes |
| **F2** | játékos-adatlap ablak, a `buildHubDetail` átköltöztetése, lapozás | F1 | közepes |
| **F3** | eseménymodell: `addLine` tipp-paraméter a kibocsátó helyeken, regex tartalék, keret és rangsor | F0 | közepes, gépies |
| **F4** | animáció-motor + első 6 sablon (gól, kapott gól, kapufa, bravúr, tizenegyes, lap), aztán a többi | F1, F3 | nagy, két verzióban |
| **F5** | élő meccskép a feed fölött | F3 | közepes |
| **F6** | finomhangolás: pixel-téma, hang-szinkron, teljesítmény-mérés gyenge telefonon | mind | kicsi |

Az F0 és az F1 párhuzamosan mehet. Látható eredmény már az F1 után van: arcok
a HUB-ban.

## 6. Kockázatok

* **Fájlméret:** a teljes csomag becsülten 120–200 KB a 8 MB mellé. Ez
  elfogadható. Ha nagyon nő, az arc-rétegek path-adatai tömöríthetők.
* **Teljesítmény:** a sok `<img>` dataURL a HUB-listában. Ezért lusta
  rajzolás kell (IntersectionObserver) és gyorsítótár. Animációból egyszerre
  csak egy fut.
* **Arc-generátor ízlésvilága:** a kinézet szubjektív, ezért az F1 után egy
  galéria-oldallal jóváhagyásra kerül, mielőtt mindenhová bekerül.
* **Nemzetiség szerinti bőrtónus:** csak súlyozott eloszlás, nem kötelező
  hozzárendelés. Egy országból is többféle arc jön, sztereotípia nélkül.
* **A régi próbák:** a HUB-lenyílóra és a tempó-feliratra építő tesztek
  frissülnek (`tools/`).

## 7. Döntések (a projektgazda válaszai)

1. Tempó: az első értelmezés (új 0,1× = régi 0,05×).
2. Alapértelmezés: az új 0,25×.
3. Arckép: rajzfilmes / „bobblehead”.
4. Arc csak az adatlapon és az animációkban, a HUB-lista soraiban nem.
5. Az ellenfél játékosai is kapnak arcot.
6. Az élő meccskép alapból nyitva.

### Az eredeti kérdések

1. **Tempó:** az új 0,1× a régi 0,05× legyen (a meccs ~2 perc), vagy a régi
   0,1× maradjon az alja (új 0,2× = régi 0,1×)? A terv az előbbivel számol.
2. **Az új alapérték:** 0,5× (= a mostani 0,25× tempó, a terv ezzel
   számol), vagy 0,25× (ahol már animáció is van)?
3. **Arckép-stílus:** inkább rajzfilmes/„bobblehead” (barátságos, jól skálázik
   pixelesre), vagy félrealisztikus? A terv az előbbivel számol.
4. **Az arc a HUB-lista soraiban** is jelenjen meg kicsiben, vagy csak az
   adatlapon és az animációkban?
5. **Az ellenfél játékosai** is kapjanak arcot (pl. a gólszerzőjük az
   animációban)? A terv szerint igen, ugyanazzal a generátorral, név alapján.
6. **Élő meccskép:** a feed fölött alapból nyitva legyen, vagy összecsukva?

---
*Állapot: F0–F4 kész (3.9.266–3.9.270). Következik az F5 (élő meccskép).*
