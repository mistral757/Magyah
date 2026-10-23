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
> * **3.9.276 — három javítás:**
>   * „A pixelated módban a sima közvetítés beugró ablakai, amik a gólt
>     ünneplik, belelógnak az animációba": a pixel-téma felugrója (`#pixFx`),
>     szikrái és futkosó figurája z 9980–9990-en ül, a jelenet fölött — amíg
>     jelenet fut (`body.evaFut`), ezek rejtve vannak.
>   * „6 gól után mindig 6 gólt jelez az animáció": a felirat a közvetítés
>     sorából jött, ami 6 fölött mindig „HAT GÓL — VAGY MÉG TÖBB?!". Most a
>     jelenet maga számolja meg a játékos meccsbeli góljait (`evaGolSzam`):
>     MESTERHÁRMAS · NÉGY … TÍZ GÓL, afölött „N GÓL!".
>   * „fekvő módban … nagyon picibe össze vannak nyomva": fekve (≤ 640 px
>     magas) a felirat a színpad MELLÉ kerül, a színpad a teljes magasságot
>     kapja (a gomboknak hagyott sávval).
> * **3.9.278 — SKILL-JELENETEK.** „legyenek a special skillekhez járó
>   animációk: Elastico, Húzd meg a szelet, Usain bolt, Ágyúgolyó, Szitálós,
>   Szabadrúgás mester." Ha a gólt egy skill hozta (a közvetítés skill-sora
>   `tipp.skill`-lel jelöli, a `mevSor` a legutóbbi saját gólra ragasztja),
>   a sima gól-jelenet helyett a skill saját jelenete fut
>   (`EVA_SKILL_SABLON`):
>   * **Elastico** — labda kifelé-befelé, a védő rossz irányba lép, áthúzás;
>   * **Húzd meg a szelet** — szélső sprint a vonal mentén, csíkok, beadás;
>   * **Usain Bolt** — elfutás a védők mellett, km/h-mérő, utánhúzott nyom;
>   * **Ágyúgolyó** — védő bombája, a kamera rázkódik, a háló beszakad;
>   * **Szitálós** — lebegő, cikázó röppálya, a kapus rossz felé mozdul;
>   * **Szabadrúgás mester** — fal, ív a fal fölött a felső sarokba.
>   A felirat a skill nevét mutatja; ha a skillt más játszotta meg, mint aki
>   gólt lőtt, „skilles → gólszerző" (a skilles figurája is a sajátja).
> * **3.9.279 — SKILL-JELENETEK, 2. KÖR.** „Jöhet a következő kör
>   skill-animáció, a győzelemnek csekély az esélye, fogd meg a söröm,
>   torghelle sanyitól tanultam, sebészi passz, tökéletes beadás, villámbekk
>   queen."
>   * **A győzelemnek csekély az esélye. Mire várunk még?** — a hajrá gólja:
>     pirosan lüktető meccsóra, két védő otthagyva, aranyfény. A gólon minden
>     más skillt felülír (a hős sora a gól-blokk végén jön).
>   * **Sebészi passz** — a négyes védősort szikevékony, izzó passz vágja
>     ketté, a csatár a résen fut be (a gólpasszadó sora jelöli).
>   * **A tökéletes beadás** — az alapvonalról, kirajzolt röppályával, fejes
>     a levegőben (a gólpasszadóé).
>   * **Villámbeck Queen** — a bekk villámmal és koronával húz el a szélen,
>     visszagurít — vagy maga fejezi be.
>   * **Fogd meg a söröm!** — nem gól, hanem a kapus BRAVÚRJA: a kapufánál
>     letett söröskorsó, keresztbe vetődés a túlsó sarokba, kifröccsenő hab.
>     A skill sora a védés sora előtt jön; a védés sora ráolvad (egy esemény).
>   * **Torghelle Sanyitól tanultam tisztán szerelni** — nem gól, hanem a
>     becsúszás: a támadó repül, a labda a miénk, a bíró int — „TISZTA!".
>   * A két nem-gól skill-pillanat a meccsenkénti kereten FÖLÖTT is jelenetet
>     kap (ritka: meccsenként legfeljebb egyszer szólal meg).
>   * Csak a jelenettel bíró skill foglalja le a gólt — egy „Gyors kontra"
>     sora nem veszi el a helyet a később megszólaló Szitálós elől.
>   * **Javítva (3.9.278-ból):** a háló a labda becsapódásakor rándul (eddig
>     egy fix 1,6 mp-es görbe arányára, jóval korábban); a több kulcskockás
>     mozgás easingje a kulcskockán ül (az egész animációra tett easing
>     elcsúsztatta a labdát a vetődéshez képest); a falemberek és a Bolt
>     védősora nem zsugorodik össze az indulásnál (kettős skálázás).
> * **3.9.280 — 3. KÖR + HIBAJAVÍTÁS.**
>   * **Bejelentett hiba:** „Animációknál az ellenfél játékosainak
>     névkiírásában ott van a csapatnév is, de nem az átírt, hanem a
>     jogvédett eredeti." A felirat a nyers nevet írta ki; most a
>     megjelenítési rétegen megy át (`evaEllenfelCimke` → `teamLabel`, a
>     szezon nélkül): a valós név csak kalóz módban látszik. A nyers név
>     belső kulcs marad (mez, arcok).
>   * **Skillek:** ICE COLD / COOL (a tizenegyes: dér, toporgó kapus, nyugodt
>     befejezés), A szöcske! (rugós, magas, vízszintes repülés a felső
>     sarokba — bravúr), Reptér! (szöglet, a védő a többiek fölé száll,
>     kondenzcsíkkal), Ollóra! (ollózás hanyatt), Gólzsák (kipattanó, a
>     csatár ott terem, „+1 GÓL").
>   * **Események, a gól fajtája szerint:** öngól (a védő a saját kapujába
>     fejel, fogja a fejét), potyagól (a labda átcsúszik a kapus lába
>     között) — mindkét oldalon; a padról (csere-tábla, a beállt játékos
>     betalál) — a mienk.
>   * A keret fölötti skill-pillanat meccsenként SKILLENKÉNT egyszer jár (a
>     szöcske gyakori lehet).
> * **3.9.284 — A MÉRÉS A JELENETBEN, A BLOKK, ÖT ÚJ SKILL-JELENET.**
>   * **A mért szám = a feed száma.** Eddig a Usain Bolt, az Ágyúgolyó és a
>     Szitálós jelenete egy SORSOLT km/h-t írt ki, ami nem egyezett a közvetítés
>     📡 sorával. Most az emitMeasure a mérést tippként adja (fajta, érték,
>     kié, az eddigi csúcs), a sor a legutóbbi saját gólra tapad (ev.meres),
>     és MINDEN gól-jelenet a jobb felső sarokban mutatja: „📡 LÖVÉSERŐ /
>     VÉGSEBESSÉG — X km/h", pontosan ugyanazzal a számmal. Új egyéni csúcsnál
>     külön, villogó piros jelvény: „🏅 ÚJ REKORD! — eddig Y km/h"; az első
>     mérésnél zöld „ELSŐ MÉRÉS" (csak ha a feedben is kifér a hozzá tartozó
>     sor). Ha a mérés sorát a gólonkénti keret elnyelte, a jelenetben sincs.
>     A régi, sorsolt mérőórák törölve.
>   * **A blokkolt lövés** („mintha egyedül lenne a játékosunk, de nem tudná
>     lőni"): a lövő ténylegesen rúg, az ellenfél védője lábbal előre a lövés
>     vonalába csúszik és keresztben fekszik rajta, a labda a testébe vágódik
>     (csattanás), és oldalra-hátra kipattan. A mellé/védett lövésnél is ott a
>     későn érkező védő.
>   * **Öt új skill-jelenet** — a gólpasszadó skilljei, a passzadó a
>     főszereplő, a gól a rács-cellába megy: **Tessék, Zolika!** (két védő
>     kicselezve, „TESSÉK!" és tálcán a gól), **Gyere kicsibe!** (bársonyos
>     átvétel, kifordulás, laposan be az ötösre — az ötös felvillan),
>     **Nagylabda!** (hosszú ív a védősor fölött a befutó csatár elé),
>     **Katapult** (a kapusunk a kapusmezében kirúg, a labda üstökösként
>     érkezik), **Gyors kontra** (becsúszó labdaszerzés, azonnali mélységi
>     passz, sprintelő csatár). Összesen 26 skill-jelenet.
> * **3.9.283 — A KAPU RÁCSA, ÚJ JELENETEK, JAVÍTÁSOK.**
>   * **A kapu 4×8-as rácsa** (x 32–88, y 22–40; sosem látszik): minden gól és
>     minden védés egy cellába megy, a labda pontosan oda, és a becsapódás /
>     hárítás pillanatában a cella PIROSAN villan (a jelenet legfelső
>     rétegén). A cella a lövő Gólszerzés-, illetve a kapus Kapus-
>     attribútumából: s = (érték−40)/360, a cella súlya exp((−2,5+8,5·s)·e),
>     ahol e a „sarok-érték" (a kapu közepén 0, a sarkokban 1). 40-től 400-ig
>     folyamatos: ~100-nál a közép ~3×, ~250-nél a sarok ~11×, 400-nál ~400×.
>     Az ellenfél emberét a meccserejéből becsüljük. Minden gól- és
>     védés-jelenet ebből dolgozik (a sima gól, fejes, szabadrúgás, tizenegyes,
>     a kapott gól, minden skill-jelenet, öngól, potyagól — az a kapus lába
>     között —, a padról, a bravúr, a védett lövés, a kivédett tizenegyes, a
>     Fogd meg a söröm!, A szöcske!).
>   * **Vetődés a lövés felé:** a bravúrnál a forgatás előjele fordított volt
>     („sokszor másfelé vetődik, mint amerre a lövés megy"); most a vetődés a
>     célzott cellára számolt (evaVetodes): a keze a labdán, középen nem
>     vetődik, csak lép és nyúl.
>   * **A szöglet** a kapu előtt (a régi a tizenhatost az oldalvonalra
>     rajzolta, kapu nélkül): zászló a gólvonal végén, ívelés, a támadó és a
>     védő együtt ugrik, a kapus a vonalon.
>   * **Kapusmez:** külön tervezhető a klub arculatában (🧤 Kapusmez), nyolc
>     ajánlott klasszik párral; az alapértelmezés az, amelyik a hazai és az
>     idegenbeli mez alapszínétől is a legmesszebb esik. Megjelenik a
>     pályaképen (KP), az adatlapon és a jelenetekben; az ellenfél kapusa is
>     elütő klasszik párt kap.
>   * **Új jelenetek:** párkémia közös gólja (egy-kettő, szívek), Klasszik
>     10-es (felvillan a rés), letámadásból gól (hárman rárontanak),
>     tiki-taka (rombuszban jár a labda, a valódi passzszámmal), a
>     buszsofőr (a busz begördül a kapunk elé, a sofőr kiszáll). A szöcske
>     védése is a rácsra került, magasabb, „a kamera felé" ugrással.
>   * **Szöveg:** a „Beblokkolt lövés" kifejezés mindenhonnan kikerült —
>     helyette „a lövést blokkolják", „Blokk!", „elakad a blokkban"; a
>     statisztika sora: „blokk".
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

> **CSERÉLVE: 3.9.275 — MOMENTUM.** A projektgazda döntése: „Az élő meccskép
> nem tetszik. Legyen helyette csak a dominanciát jelző sáv. Nem kell a pálya
> a felállásokkal. […] nevezzük át "momentum"-nak és ugyanúgy legyen
> bezárható. Az hogy legyenek meccs közbeni animációk, az valahol ugyanitt
> kellene hogy ki-be-kapcsolható legyen."
>
> * A pálya, a pöttyök, a labda és a lendület-oszlopok KIKERÜLTEK (velük a
>   saját időzítő is). Ami maradt: egy sáv a két csapat színével és nevével,
>   alatta a százalék.
> * MOMENTUM, nem összesítés: minden helyzet súlya 12 perc alatt feleződik
>   (`EK_FELEZES`) — a sáv azt mutatja, MOST ki van fölényben.
> * A fejlécben, összecsukva is: „🎬 Animációk: BE/KI" — ugyanaz a
>   beállítás, mint a Beállításokban, és meccs közben azonnal hat (KI: a
>   futó jelenet és a sor is leáll). Gyors tempón kiírja: „csak 0,25× és
>   lassabb tempón".
> * Az animációk kapcsolója mostantól ÖNÁLLÓ (az élő háttér kikapcsolása nem
>   viszi magával); ha még nem döntöttél, a rendszer „kevesebb mozgás"
>   kérése alapból KI-re állítja.
> * Próba: `tools/momentum-3-9-275-proba.js` (a régi élő-meccskép próba
>   törölve).
>
> * **3.9.276:** a lendület-oszlopok visszakerültek a sáv alá, magasabban
>   (76 px; kérés: „Ez a Line maradjon meg, csak legyen magasabb"): 18
>   ötperces oszlop, fölfelé mi, lefelé ők, a gólok, lapok, cserék jelével. Az
>   oszlopok nem fogynak (a meccs krónikája), csak a sáv (a momentum).
>
> * **3.9.282 — A MOMENTUM-GÖRBE** (a sáv és az oszlopok helyett). Kérés: „A
>   Momentum nézzen ki inkább úgy, mint egy szép függvény, aminek folytonos a
>   vonala. És ne csak a közvetítés eseményei alakítsák […], hanem a
>   szimulációban résztvevő változók is, amikből a meccs végén meccsvégi
>   statisztikákat csinálunk. […] azt akarom látni, ahogy dinamikusan mozog
>   ott egy vonal fel alá a Momentum mértéke szerint."
>   * Egy folytonos, sima görbe (Catmull–Rom → Bézier, percenként egy pont) a
>     0–90. percen: fölötte a mi színünk, alatta az ellenfélé, a fején egy
>     pötty; a feje élőben halad (requestAnimationFrame, csak amíg a meccs
>     megy és a panel látszik), a vödrök között végigfut, nem ugrik. Fölötte
>     a két csapat neve és a pillanatnyi arány; a gól-, lap- és csere-jelek.
>   * HÁROM RÉTEG: (1) ALAPVONAL — a meccsvégi labdabirtoklás várható értéke
>     ugyanabból a képletből (`mstatPossAlap`, a meccsvégi statisztika is ezt
>     hívja): erőkülönbség, taktika és begyakorlás, stílus, Passz-tengely,
>     skillek, szerepek, poszt-illeszkedés, Gegenpressing, talizmán;
>     (2) A MOTOR VÖDRE — ötpercenként a két csapat gólvárhatósága (λ, amiből
>     a motor a gólokat sorsolja: rákapcsolás, fáradás, emberhátrány, busz,
>     hajrá, lelátó…) és a vödörben ténylegesen kidolgozott helyzetek és gólok
>     (ugyanazok, amikből a lövés-, védés-, blokk-statisztika lesz);
>     (3) A KÖZVETÍTÉS — minden helyzet egy lecsengő kilengés a maga percében.
>     Rá egy kis, meccsenként rögzített hullám. A meccs véletlenjéhez nem nyúl.
>   * A motorban a két λ külön változóba került (a sorsolás változatlan).
>
> Az alábbi F5-leírás a 3.9.272-es, már nem élő változaté.

> **ELKÉSZÜLT: 3.9.272.** Kód: az `index.html` „ÉLŐ MECCSKÉP (3.9.272, F5)”
> blokkja; a helye a közvetítés sorai fölött (`#elokep`). Próba:
> `tools/elo-meccskep-3-9-272-proba.js`.
>
> * **Pálya:** vízszintes, mi balról jobbra támadunk. A saját tizenegy a
>   valódi felállás helyein, az élő állapotból (`MATCH_XI`: csere,
>   kiállítás); az ellenfél alap 4-4-2-ben, tükrözve; mindkettő a mezének
>   színében (az ellenfélé a nevéből, mint az F4-ben). A két blokk a labda
>   felé húzódik (±8).
> * **Labda:** minden eseménynél a zónájába vándorol (az F3 MINDEN eseményét
>   kapja, `mevFeliratkozMind`): támadás → az ellenfél harmada, szöglet →
>   a sarok, tizenegyes → a büntetőpont, gól → a háló (fénygyűrűvel),
>   védekezés → a saját kapunk előtere, lap/sérülés/VAR → középen.
>   Események között a fölény szerint sodródik (percenként).
> * **Fölény-sáv:** a helyzetekből (súlyozva: gól 3, kapufa/tizenegyes 2,
>   bravúr/gólvonal 1,6 …). Szándékosan nem „labdabirtoklás”: a motor azt
>   nem számol.
> * **Lendület:** 18 ötperces oszlop (fel: mi, le: ők), az idővonalon a
>   gólok, lapok és cserék jelével; a lejátszott rész halványan kiemelve.
> * **Kezelés:** alapból nyitva, a fejlécre koppintva összecsukható (az
>   állapot megmarad: `ekCsuk30_0`); az első kezdőrúgásig rejtve.
> * Minden tempón követi a meccset; végigjátszásban nem sodródik. Nem húz
>   véletlent, a szimulációhoz nem nyúl.

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

## 5b. F6 — finomhangolás és a karbantartó (3.9.273–3.9.274)

> Kérés: „beépíthetünk valami cache tisztító mechanizmust is, ami dolgozik
> azon, hogy a hosszan megnyitott oldal se kezdjen el akadozni egy idő után."
> Próba: `tools/karbantarto-3-9-273-proba.js`.

**Mérés 1 — hosszú munkamenet** (30 meccs kézi közvetítéssel, közte
HUB-rajzolás és adatlap-lapozás; CDP: csomópontok, figyelők, heap):

| | előtte, 30. meccs | utána, 30. meccs |
|---|---|---|
| DOM-csomópont | 15 174 (+170/meccs, folyamatosan nő) | ~12 900–13 100 (megáll) |
| napló a lapon | 831 sor | 220–360 sor (+ archívum) |
| arckép-gyorsítótár | 352 (nő a 600-ig) | 240 (LRU) |
| futó időzítő | 6 → 10 (szivárgás) | 7–8 (stabil; +1 a karbantartóé) |
| eseményfigyelő | 651 → 689 | 652 → 694 (stabil) |
| JS-heap | 18,9 MB | 17,9 MB |

**A szivárgás:** az élő meccskép (F5) minden kezdőrúgáskor új 600 ms-os
hurkot indított, a régi fogantyúját előbb felülírta — a régi örökké futott.
Javítva (`ekKezd`), és a karbantartó is őrzi.

**A karbantartó** (`ktFut`, üresjáratban — `requestIdleCallback` —, ~45
mp-enként és a lap előtérbe kerülésekor; rejtett lapon soha):
1. **Napló:** 360 sor fölött a régebbieket (220 marad) memóriabeli
   archívumba viszi; a napló tetején „▲ Korábbi sorok betöltése (N)” gomb
   hozza vissza 200-asával, a görgetés helyben marad, a témakör-jelölés
   (szűrő) megmarad. Meccs közben és visszafelé olvasáskor nem nyúl hozzá; a
   kupa-felület jelölőjét (`euroLogMark`) együtt mozgatja; szezonváltáskor az
   archívum is ürül. Az archívum plafonja 6000 sor.
2. **Arcképek:** valódi LRU (a találat a sor végére kerül), 240-es
   plafon; a függőben maradt pixel-kérések nyoma törlődik.
3. **Időzítők:** a már nem futó meccs élő-kép hurka leáll.
4. **Diagnosztika (🧪):** új „KARBANTARTÓ” blokk — mikor futott, mennyi
   sor van a lapon és az archívumban, a gyorsítótár mérete, a DOM mérete,
   mióta van nyitva a lap.

**Mérés 2 — gyenge telefon** (CPU 4× lassítva):

| művelet | idő |
|---|---|
| arckép (hidegen / gyorsítótárból) | 0,9 ms / 0,02 ms |
| pixeles raszterezés arconként | 44 ms |
| esemény-jelenet felépítése | 10 ms |
| élő meccskép frissítése eseményenként | 1,9 ms |
| adatlap megnyitása | 105 ms |
| HUB teljes újrarajzolása (régi kód) | 226 ms |
| **egy új naplósor 800 soros naplónál** | **15 ms** |
| **ugyanez a karbantartó után (220 sor)** | **2,8 ms** |

**A pixeles előkészítés (3.9.274):** a kezdőrúgáskor eddig 11 ember × 7
hangulat × 2 változat = 154 pixeles arc kérődött EGYSZERRE (154 × 44 ms ≈
7 mp CPU gyenge telefonon). Most csak a figurafejek, a három leggyakoribb
hangulattal (33 arc), EGYENKÉNT, üresjáratban.

**Ami szándékosan maradt:** a HUB teljes újrarajzolása (226 ms lassítva) a
régi kódé; a lenyitás/adatlap gyors útja (3.9.168) már kikerüli.

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
*Állapot: F0–F6 kész (3.9.266–3.9.274); az F5 élő meccsképe 3.9.275-ben momentum-sávra cserélve; 3.9.278–284: huszonhat skill-jelenet, négy gólfajta-jelenet, buszsofőr, a kapu rácsa, a mérés a jelenetben, a blokk.*
