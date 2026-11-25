# 🪟 Menü-ablakok, kihívás-döntés, csapategyensúly — 1.0.12.7.00

Ebben a verzióban a fejlesztő telefonos jegyzetei (🐞, szerző `u_fd5811b0d243`, a 2026-11-25 09:08-as kézi lehúzásból) készültek el. Ez az eszköz bekerült a megbízható szerzők közé (`tools/devjegyzet/szerzok.json`).

## 1. Menüből nyíló aloldalak ablakban, vissza a menübe ugyanoda
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvspztm1im2):**
> „A csapatépítés menüponton belül is minden ablakként nyíljon meg. Amikor az ablakot bezárjuk, akkor ne a HUBba
> ugorjunk vissza, hanem a menübe érkezzünk vissza ugyanoda, ahol a megnyitás előtt voltunk."

**KIMONDOTT KÉRÉS (🐞 jegyzetek jmwvsmwnf9q2h, jmwvsmfp2egzk, kétszer beküldve):**
> „Az átigazolás menü fülein belül, rányomunk az egyes alpontok egységesen külön ablakként nyíljanak meg. Ahhoz
> hasonlóan, ahogy az infopult, a meccserő összetételes pont stb. És a kinézetüket is újítsuk meg"

Felmérés a változtatás előtt (állva, 375×834, minden Csapatépítés- és Átigazolás-menüpont megnyitva, majd bezárva):
- **Felugró ablakok:** Talizmánok, Ládák, Meccserő, Presetek, Akadémia. Bezárás után a menüben maradtunk, ugyanott.
- **HUB-kártyák** (taktika, kapitány, edző, szerepek, csúszkák, menedzsment) és **HUB-on kívüli aloldalak** (vásárlás, klub-szemle, sztár piac, stáb-piac, edzésterv, összhang, boost, felállás, arculat, stadion, scout, keret, stáb): teljes oldalként nyíltak. Visszafelé a menübe értünk, de nem ugyanoda: 36–1371 px eltéréssel, a lap tetejére ugorva.

Most állva, menü-módban mindegyik **ablak**:
- rögzített, saját görgetésű, lekerekített keret a menü fölött;
- felül tapadó „← Vissza a menübe ✕” sáv;
- a menü alatta marad, sötétítve (a HUB-on kívüli aloldalnál is: `#scHub.menuBehind`).

A menüpont megnyomásakor a játék feljegyzi a lap görgetését (`_hubMenuY`). Az ablak bezárásakor a menü pontosan oda tér vissza, a csoport nyitva marad. Mérve az eltérés minden menüpontnál 0 px.

A rétegrend:
- az ablak `z-index` 55;
- fölötte marad a játékos-adatlap (58), a megerősítő kérdések (470) és a felugró ablakok (465+).

Fekvő nézetben (`hubLand`) nem változott semmi, ott a menü a bal sávban áll.

## 2. Kihívás-lecke: a bemutatás után szabad választás
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvupnn3jf9e):**
> „A kihívás lecke megmutat egy kihívást […] de a többit így nem lehet megnézni, a végén pedig a kész tovább gombra
> visz. […] Miután megmutatott egy kihívást, még kéne szűnjön a fókusz mód, engedje, hogy válasszak. És majd én
> kilépek, ha akarok. + 3mp gondolkodás után itt mutassa meg, hogy ha nem tudom eldönteni, érdemes e vállalni,
> ugorhatok a menübe és megnézhetem azt, amire szükség lehet hozzá, és vissza tudok jönni a kihívás vállaláshoz"

A lecke három lépés:
1. Mi ez.
2. Hogyan olvasd, és mikor érdemes vállalni.
3. Összegzés: „Most te döntesz”.

A „Kész — tovább” gombra már nem visz.

A lecke vége után 3 mp-cel, fókusz nélkül, tipp-sáv jelenik meg a lista alján: „Nem tudod eldönteni? Ugorj a HUB-ba…”. Közben villan a „🏠 Megnézem a keretet a HUB-ban” gomb. A vállaltak megmaradnak, a játékos ide tér vissza. Ahol nincs HUB-kitérő (a legelső ajánlat), ott a tipp azt mondja, hogy a vállalás sosem kötelező, és jönnek még ajánlatok. A sáv a „Kész — tovább”-ra és a HUB-kitérőre eltűnik.

## 3. Párkémia: a fázisszám a reflektor témában
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvuij112r68):**
> „Párkémia építés fázisszámai nem látszanak az 5. új megjelenési témánál"

A kémia-sor jelvényének (`.pos.pc-cs`, például „3/5”, „⚙”) nem volt háttere. A reflektor téma minden `pc-` jelvény betűjét sötétre állítja, így a szám sötét betűvel a sötét háttéren eltűnt. Most minden témában saját, kiemelő háttere van.

## 4. A csapategyensúly tanítása
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvuerlk3at9):**
> „A csapategyensúlyról nem tanítottunk eddig semmit. Ezt pótolni kell."

**Új feladat** a Kezdő út „A csapat lelke” szakaszában: „Nézd meg a ⚖️ csapategyensúlyt”. A szakaszhoz 3 kell a 4 feladatból.

**Vezetett lecke**, három lépésben (a „Hol?” gombról és a 📖 Leckék listából is elérhető, ez utóbbi az előrébb járó karriereknek):
1. Mi ez, és mennyi bónuszt ad most.
2. A három rész (Teher 45%, Skill 30%, Rating 25%), élő mérésekkel: hány emberre oszlik a termés, ki a legterheltebb, hány skill-birtokosod van.
3. Mit tegyél.

A feladat a lecke végén, vagy a ⚖️ mérőre koppintva pipálódik ki.

## 5. A bajnoki ünneplés — kivizsgálva
**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvwgbxqhkev):**
> „Nem volt bajnoki győztes animáció, pedig úgy emlékeztem, hogy beépítettük. Ezzel mizu?"

Ami beépült és működik:
- **A bajnokavatás trófea-képernyője** (`showChampionScreen`, konfetti 3.9.224). Ellenőrizve a reflektor témában is, éles karrierben, a meccsképernyőn: megjelenik.
- **A közvetítés kamerái** (`docs/kozvetites-unneples-terv.md`, 1–2. fázis).

Ami nem épült be: a **legalább egyperces, 7 szintű ünneplés-jelenet**. Ez a terv 3. fázisa („Ünneplés v1”), és sosem készült el. A terv szerint fázisonként, külön jóváhagyással megy. Döntésre vár.

## Próba
`tools/menu-ablak-1-0-12-7-00-proba.js`: 12 ellenőrzés. A kihívás-lecke és a tipp-sáv, a párkémia-jelvény, a csapategyensúly-feladat és -lecke, a kapitányváltó és az edzésterv ablakként, bezárás után a menüben, 0 px eltéréssel, és hogy nincs oldalhiba.
