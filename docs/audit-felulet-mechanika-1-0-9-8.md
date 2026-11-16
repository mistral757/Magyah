# Audit: felület, stílus, visszajelzés, régi elemek, balansz

*(2026-11-16, az 1.0.9.7.00 állapotáról. A feladat öt területe: **1** UI ·
**2** stílus · **3** hiányzó összekötés / visszajelzés · **4** régi elemek
illesztése · **5** balansz. Ez a lap a megvalósítás ELŐTT készült; ami belőle
megvalósult, annak a verziója a tétel végén áll.)*

## Hogyan készült

- `./tools/check.sh` zöld; a játék headless Chromiumban, 430×900-on, valódi
  egyjátékos karrierben (a `tools/meccsmotor/szoras-valos.js` indítási láncán).
- Képernyőképek: kezdőlap, beállító, szezon-képernyő, HUB + ☰ Menü mindhárom
  csoportja, Taktika, Hangsúly-csúszkák, Edzésterv, Stáb, Talizmánok,
  Felállás, Meccserő-bontás (Csapat-panel), Edző, Boost-központ, Menedzsment,
  Stadion, Scout/ügynökség, Vásárlás, Csapatszerepek. A bizonyítéknak szánt
  három kép: `docs/kepek/audit-1-0-9-8/`.
- Mérések: a csúszkák halmozott hatása analitikusan (a játék saját
  `dialEach`/`dialMatch`/`dialFactor` függvényeivel, böngészőben), és a valódi
  meccsmotoron (`tools/meccsmotor/hangsuly-valos.js`, 4×600 meccs).
- Stílus-számlálás: az `index.html` CSS-éből és a beégetett `style="…"`
  attribútumokból, szkripttel.

## A rangsor

| # | ter. | tétel | haszon | kockázat | munka | döntés |
|--:|:--:|---|:--:|:--:|:--:|---|
| A | 3, 1 | A hangsúly-csúszkák rejtve vannak, és nincs összkép | nagy | kicsi | közepes | **megvalósítom** (1.0.9.8.00) |
| B | 1, 4 | A Taktika-panel: 1000 px magyarázat a választás előtt | közepes | kicsi | kicsi | **megvalósítom** (1.0.9.8.01) |
| C | 5 | A csúszkák halmozva több meccserőt érnek, mint a nehézségi ablak | nagy | **nagy** | — | **javaslat**, a felhasználó dönt |
| D | 5 | A „Sztárom a párom” csúszkái a meccsre nem hatnak | közepes | közepes | kicsi | javaslat |
| E | 3 | Az edzésterv választásakor nincs előrejelzés | közepes | kicsi | közepes | javaslat (részben megvan utólag) |
| F | 2 | Nincs betűméret- és lekerekítés-skála (43 + 14 érték) | közepes | **nagy** | nagy | javaslat; az új felületek a meglévő osztályokból építkeznek |
| G | 4 | Régi panelek: szövegfal elöl, döntés alul | közepes | közepes | nagy | B-ben egy panel; a többi javaslat |
| H | 1 | A HUB-ban egyszerre két „alpanel-nyelv” él | kicsi | közepes | nagy | javaslat |

---

## A · A hangsúly-csúszkák rejtve vannak, és nincs összkép (3, 1)

**A gond.** Ez a felhasználó saját példája, és a kód igazolja.

- *Az út:* HUB → ☰ Menü → 🏗️ Csapatépítés → ⚙️ Taktika → a panelen az öt
  tengely bontása és két bekezdés magyarázat UTÁN egy kártya: 🎚
  Hangsúly-csúszkák (`renderHubTacticsPanel`, a `hubDialOpenBtn`). A HUB-menü
  „⚙️ Taktika” gombjának nincs alcíme (a mellette álló Edzéstervnek van), tehát
  a menüből nem látszik sem az aktív rendszer, sem az, hogy él-e csúszka.
  Kép: `menu-elotte.png`, `taktika-elotte.png`.
- *A panel:* csúszkánként kiírja a hasznot és a kárt (`tdSectionHtml`,
  `dialSectionHtml`), de a taktika 5 és a legfeljebb 4 filozófia 3-3 (a
  Hangsúly-virtuóz talizmánnal 4-4) csúszkája **ugyanazokra a csatornákra
  szorzódik össze** — egyszerre akár 17–21 csúszka —, és ezt az összeget a
  játék sehol nem mutatja meg. Kép: `csuszkak-elotte.png`.
- *A visszajelzés késik:* a csúszka `onchange`-re rajzol újra, tehát húzás
  közben semmi nem változik, csak az elengedés után.
- *A meccs előtt* semmi nem jelzi, hogy a csúszkák élnek.

**A javaslat.** Egy 📊 Összkép blokk a panel tetején, ami a motor saját
függvényeiből számol (nem új képlet): a meccs íve (saját és ellenfél
gólesély ötperces bontásban, döntetlennél / vezetésnél / hátrányban), egy
≈ ⚡ meccserő-egyenérték, „ki szerzi a gólt” a kezdő tizenegy súlyaiból,
a mellékhatások (lap, sérülés, kontra-ablak, összhang, fejlődés…) és a
feltételhez kötött hatások. Húzás közben is éljen. Görgetéssel együtt járó
egysoros sáv. Közvetlen menü-kártya; alcím a Taktika gombon; egy sor a
kezdőrúgás előtt.

**Haszon** nagy (a rendszer végre látszik) · **kockázat** kicsi (kijelzés, a
motor és a mentés nem változik) · **munka** közepes. → **1.0.9.8.00.**

## B · A Taktika-panel: magyarázat a választás előtt (1, 4)

**A gond.** A panel 430 px-en ~1500 px magas, ebből az első ~560 px az öt
tengely részletes bontása és két magyarázó bekezdés; a hat választható rendszer
ez UTÁN jön (`taktika-elotte.png`). Az újabb felületek (Csapat-panel, Talizmán,
Menedzsment) fordítva építkeznek: elöl az állapot és a döntés, a magyarázat
lenyitható. A szöveg jó és pontos — a helye rossz.

**A javaslat.** Elöl egy rövid állapot-sor (aktív rendszer, ismertség,
illeszkedés), utána a 🎚 kártya és a rendszerek; az öt tengely bontása és a
magyarázat `<details>`-be kerül („A kereted öt tengelye — részletek”),
semmi nem vész el. **Kockázat** kicsi. → **1.0.9.8.01.**
Képek: `taktika-fejlec-elotte.png` → `taktika-fejlec-utana.png` (az első
rendszer-kártya a panel tetejétől 274 px-re kezdődik a korábbi ~900 helyett).

## C · A csúszkák halmozva sokat érnek — mérés (5)

**Analitikusan** (a legjobb 3 csúszka stílusonként, illetve a taktika öt
csúszkája; a ≈ ⚡ = (ln saját − ln ellenfél)/(2K), K = 0,12; 40% döntetlen,
30–30% vezetés/hátrány súllyal):

| forrás | 5. szint | 10. | 15. | 20. | a legjobb készlet a 20. szinten |
|---|--:|--:|--:|--:|---|
| 🧱 Beton | 0,6 | 1,1 | 1,7 | **2,5** | saját ×1,15 · ellenfél ×0,63 |
| 🌀 Tiki-Taka | 0,3 | 0,6 | 1,2 | 2,1 | ×1,38 · ×0,83 |
| ⚡ Villám | 0,4 | 0,7 | 1,2 | 2,0 | ×1,29 · ×0,79 |
| 🛡️ Panzer | 0,5 | 0,9 | 1,3 | 1,7 | ×1,21 · ×0,79 |
| ⚽ Bombázók | 0,3 | 0,5 | 1,0 | 1,6 | ×1,53 · ×1,05 |
| ☯️ Harmónia | 0,3 | 0,5 | 0,7 | 1,0 | ×1,00 · ×0,79 |
| 🔥 Gegenpressing | 0,1 | 0,1 | 0,4 | 0,9 | ×0,99 · ×0,79 |
| ⭐ Sztárom a párom | 0 | 0 | 0 | **0** | — |

| a taktika csúszkái (ismertség / illeszkedés) | mozdítható | ≈ ⚡ |
|---|--:|--:|
| 70 / 50% | 2 | 0,2 |
| 80 / 50% | 3 | 0,3 |
| 90 / 50% | 4 | 0,9 |
| 99 / 50% | 5 | 1,7 |
| 99 / 80% | 5 | 2,4 |
| 99 / 110% | 5 | **3,2** (vezetésnél az ellenfél ×0,37) |

**A valódi motoron** (rögzített 0 meccserő-különbség, 600 meccs beállításonként,
fele hazai; a pont/meccs szórása ≈ ±0,05):

| beállítás | Gy / D / V | pont/meccs | lőtt | kapott |
|---|---|--:|--:|--:|
| taktika 99, csúszkák középen | 55,3 / 21,7 / 23,0 | 1,877 | 1,95 | 1,20 |
| taktika 99, 4 csúszka kihúzva (illeszkedés ~55%) | 65,2 / 21,3 / 13,5 | **2,168** | 1,78 | **0,64** |
| Beton 20. szint, csúszkák középen | 50,7 / 23,3 / 26,0 | 1,753 | 1,78 | 1,21 |
| Beton 20. szint, 3 csúszka kihúzva | 65,3 / 21,7 / 13,0 | **2,177** | 1,98 | **0,76** |

Vagyis a taktika csúszkái **+0,29 pont/meccs** (egy 30 fordulós idényben ≈
+8,7 pont), a Beton hármasa **+0,42 pont/meccs** (≈ +12,7 pont). A kapott gól
−37% a Betonnál: pontosan a kiírt ×0,63.

**Miért gond.** A nehézség a meccserő-rést szabályozza (célrés, rés-követés),
a `pyramid-sim.js` fejléce szerint a játszható ablak ±3–4 Rating. Egy kifejlett
karrierben (99-es taktika jó illeszkedéssel + négy 20. szintű filozófia) a
csúszkák a fenti táblák szerint összesen **≈ 10–11 ⚡**-nyi gólvárhatóság-
előnyt adhatnak, ami **nem része a meccserőnek** — a nehézségi szabályozó tehát
nem látja, és nem is követi. Egy közepes karrierben (egy 10. szintű stílus +
90-es taktika) ez ≈ 2 ⚡: érezhető, de az ablakon belül van.

**Két dolog is igaz egyszerre:** a csúszka szándékosan jutalmazza a mélyre
menést (a 20. szinten „négyszeres haszon”), és a késői játékban a halmozás
kinövi a nehézséget.

**A javaslat — nem hajtom végre**, mert a futó karrierek szabályát és a motor
gólvárhatóságát érintené (a `VERZIOZAS.md` szerint ez legalább hangolás, a
halmozás plafonja pedig major-gyanús). A lehetőségek, a felhasználó döntésére:

1. *Csak láttatni* (ez megtörténik az A tétellel: a ≈ ⚡ szám kiírja).
2. *Közös plafon* a csúszkák összesített `own`/`opp` szorzójára (pl. saját
   ≤ ×1,35, ellenfél ≥ ×0,65) — egyszerű, de a futó, erre épített karriereket
   gyengíti.
3. *A csúszkák ⚡-egyenértéke beszámít a rés-követésbe* — a nehézség látná;
   ez a rajt-szerződést érinti, tehát major.
4. *A taktika-illeszkedés szorzója csak a hasznot szorozza, a kárt nem
   osztja* (ma mindkettő: 99/110%-nál a kár 3%-ra olvad) — a legkisebb
   beavatkozás, új karrierekre.

## D · A „Sztárom a párom” csúszkái a meccsre nem hatnak (5)

A C tábla utolsó sora: a Sztár öt csúszkájának nincs feltétel nélküli `own` /
`opp` hatása (hírnév, bér, fejlődés, gólsúly, „ha a sztár nincs a pályán”).
Ez **szándékos jelleg** lehet (a stílus a sztárról szól), de a többi hét
stílushoz mérve a csúszka-rendszerből ez a filozófia 0 ⚡-et kap, miközben a
Beton 2,5-et. Javaslat: vagy egy sztár-feltételű gólvárhatóság-csatorna (pl.
„amíg a sztár a pályán van”), vagy a panelen kimondani, hogy ezek a csúszkák
a karrierre hatnak, nem a meccsre. Az Összkép (A) ezt már láttatja: náluk az
ív üres, a hatás a „mellékhatások” között jelenik meg.

## E · Az edzésterv választásakor nincs előrejelzés (3)

`openTrainingPlanner`: a fő és a mellék edzésnél „+2 / +1 pont/meccs” áll, és
hogy a másik két képesség 12%-kal lassul — de nem látszik, **kinek** és
**mennyit** hoz ez az idény végéig. Utólag van visszajelzés (a játékos
adatlapján az edzés-mérleg: `trainLogFor`), előre nincs. Javaslat: a választó
alján egy „Ezzel a tervvel az idény végéig” sor a kezdő tizenegyre (várható
attribútum-lépések a `TRAIN_PLAN_MAIN/SEC` és a hátralévő fordulók alapján).
Kockázat kicsi (kijelzés), munka közepes — a pontos átváltás (1.0.9.6.00-ás
sávok, stáb-szorzó) miatt nem fért be ebbe a körbe.

## F · Nincs betűméret- és lekerekítés-skála (2)

Mérve: a CSS-ben **43 különböző** `font-size` érték (9,5–22 px között fél
pixelenként), **14** `border-radius`; a kódban további **1229 beégetett**
`font-size` és 194 `border-radius` (`style="…"`: összesen 3184 helyen). A
színek rendben vannak (CSS-változók: `--gold`, `--grass`, `--red`, `--panel`,
`--line`…, a témák ezekre épülnek) — a látvány ezért egységes; a betűméretek
és a sugarak viszont kézzel szórtak.

Egy teljes tokenesítés (pl. `--fs-1…6`, `--r-1…4`) 4400 helyet érintene egy
142 000 soros fájlban, képernyőnkénti vizuális regresszióval: **nagy kockázat,
kis látható haszon**. Javaslat: a skálát leírni és ÚJ / érintett felületeken
betartani (a B és az A tétel a meglévő `.msSum`, `.dlCard`, `.infoCard`,
`.hubCard` osztályokból és ugyanazokból a méretekből építkezik), a régi
helyeket pedig panelenként, a G tétellel együtt átvinni.

## G · Régi panelek: szövegfal elöl (4)

Ugyanaz a minta, mint B-nél, több régi panelen: Edzésterv (két bekezdés a
választó előtt), Boost-központ (~450 px szabálymagyarázat az első boost
előtt), Szakmai stáb, Felállás módosítása, Scout–ügynökség–sajtó. Az újabb
panelek (Csapat-panel, Talizmánok, Menedzsment, Rejtett stílus) fülekkel,
összegző csempékkel és lenyitható részletekkel dolgoznak. Javaslat:
panelenként egy patch, a B tétel mintájára (állapot elöl, magyarázat
`<details>`-ben, a szöveg változatlan). Ebben a körben a Taktika készül el;
a Boost-központ a következő jelölt (ott a legnagyobb a fal).

## H · Két „alpanel-nyelv” a HUB-ban (1)

A régebbi alpanelek a HUB oldalába nyíló kártyák (`hubTacticsPicker`,
`hubRolesPicker`, `hubCaptainPicker`… — odagörget), az újabbak felugró ablakok
(`cspModal`, talizmán, menedzsment). Mindkettő működik; a kettő együtt
következetlen (hol „Bezárás”, hol „← Vissza a HUB-ba”, hol ✕). Egységesítése
sok kattintási utat és ~40 próbát érint — javaslat marad.

## Ami rendben van (és nem nyúltam hozzá)

- A színrendszer és a témák (változókra épülnek, következetesek).
- A Meccserő-bontás (Csapat-panel) — ez a minta arra, hogyan kell egy összetett
  számot láttatni; az Összkép ugyanezt a nyelvet követi.
- Az edzői elemzés a meccs után a csúszkák gólvárhatóság-tagját már ma is
  külön kezeli (`mxVodor` „dial” tényező).
