# 1.0.11.16.00 — Kezdő út, 2. fázis: a motor (fokozatosan nyíló HUB)

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (a döntések a 15., az állapot a 16. fejezetben).
Előzmény: [kezdo-ut-belepes-1-0-11-15-00.md](kezdo-ut-belepes-1-0-11-15-00.md) (1. fázis, a belépés).

## Kérés
> […] a HUB funkciói fokozatosan nyíljanak ki, kis célfeladatokkal […] fontos, hogy az eddigi
> funkciókból semmit ne vegyünk el, de azokat képesek legyünk meghaladni, megtölteni, érthetőbbé tenni.

## Kinek szól
- **🌱 Most kezdem** és **⚽ Játszottam már:** az új karrier Kezdő úttal indul (`S.kut`).
- **🏆 Ismerem, mindent kérek:** nincs Kezdő út, minden nyitva, mint eddig.
- **A közös karrier (MP) és a párharc:** soha, ott minden nyitva.
- **Régi mentés** (nincs benne `S.kut`): minden nyitva, semmi nem változik.

## Mit csinál
A HUB menüben a még nem tanult funkciók gombjai rejtve vannak (`kutZar`). Semmi nem vész el:
- a zárt funkció a háttérben a semleges alapállásán fut, ahogy eddig is, ha nem nyúltál hozzá: az edzés a szokásos terv szerint, a csúszkák 0-n;
- ami gyűlik, az zárva is gyűlik (talizmán-húzás, ládák).

A HUB tetején a **🧭 Kezdő út kártya** mutatja:
- a szakasz nevét és az edző mondatát;
- a 3 feladatot, a megtaláláshoz „Hol?” gombbal (megvillantja a gombot);
- hány kell a 3-ból, és mi nyílik utána;
- a tartalék-fordulót („ha addig nem jön össze, az edző magától továbblép”);
- hány funkció vár még;
- a **Mindent kinyitok** gombot (megerősítéssel kikapcsolja az utat; minden azonnal nyitva).

### A szakaszok

| # | Szakasz | Feladatok (kell) | Tartalék (forduló) | Nyílik |
|---|---|---|---|---|
| 1 | Az első tizenegy | nézd meg a felállást · a taktikát · egy megbízást (3/3) | 1. | — |
| 2 | Az első meccsek | rúgj gólt · tarts meg kapott gól nélkül egy meccset · nyerj (2/3) | 6. | 🏋️ edzésterv, összhang |
| 3 | Fejlődés | állíts edzéstervet · összhang-építést · nyerj kettőt zsinórban (2/3) | 13. | ⚡ meccserő-bontás, 👔 az edző elemzése, 🎚 hangsúly-csúszkák |
| 4 | A csapat lelke | nézd meg az elemzést · állíts csúszkát · légy a felső félben (2/3) | 20. | szerepek, kapitány, cserék, sablonok |
| 5 | Szerencse és kockázat | 3 veretlen meccs · két gól egy meccsen · kapott gól nélküli meccs (2/3) | 26. | talizmán, ládák, menedzsment és kihívások |
| 6 | Mérleg | nézd meg a büdzsét · legyen biztonságos tartalék · felső fél a 25. forduló után (2/3) | 2. idény 1. | boost, infópult, stáb, scout-cél, klub |
| 7 | Hosszú táv | győzelem · gól az új idényben (1/2) | 2. idény 6. | ifiakadémia, kupák |

- **Az átigazolási piac** (vétel, saját scout, kereső, sztárpiac, eladási ajánlatok, figyelőlista) a **8. fordulótól** nyitva, a feladatoktól függetlenül. Ez a döntés: átigazolás az első idényben a 8. fordulótól.
- **A jelek** a meglévő kezelőkből jönnek (`kutJel`):
  - a felállás, a taktika, a büdzsé és az edző elemzése gomb megnyitása;
  - az edzésterv és az összhang rögzítése;
  - a csúszka elmozdítása;
  - a megbízás kijelölése.
- **A meccsfeladatok** a tétmeccsek után könyvelődnek (`kutMeccsUtan`: gól, kapott gól nélkül, győzelem, zsinór, veretlenség).
- **A tabella-feladatok** a forduló után a végső tabella alapján dőlnek el (felső fél).
- **A tartalék:** ha egy szakasz a tartalék-fordulóig nem teljesül, az edző magától továbblép, és kinyitja a következőt. Így senki nem ragad be.

### Kinyílás
Szakaszváltáskor jön a **🔓 Kinyílt / Kinyíltak a menüben!** ablak a funkciók listájával és a **Mutasd meg →** gombbal:
- a gomb a menüben a helyére görget, és megvillantja (`kutVillog`);
- az ablak megvárja a többi ablakot (menedzsment-célok, kalauz-tipp, feloldó kártya, animáció…). 1,5 másodpercenként újra próbál, és csak a HUB-on jelenik meg.

### Ami a zárral együtt hallgat
- **A kihívás-ajánlatok** (a rajtnál, az ellenőrző pontokon, a kupa előtt) az 5. szakaszig (menedzsment) nem jönnek.
- **A tanítóréteg leckéi** (`TEACH_TOPICS`) egy zárt funkcióról nem jönnek elő, amíg az zárva van: edzés, talizmán, boost, csere, eladás, scout, stadion, merch, kihívások stb.

## Technika
- **Állapot:**
  - `S.kut = {v:1, tudas, sz, kesz:{}, nyit:{}, uj:[], zs, vt, mutatott:{}}`;
  - mentve: a mezőlistában `kut`, betöltéskor ellenőrizve.
- **Funkciók:** `KUT_FUNKCIO` (név, ikon, gomb-azonosítók, fordulókapu), `KUT_SZAKASZ` (szakaszok).
- **Kapu:** `kutMenuKapu()` a `hubRefreshMenu()` elején fut, így a csoportok láthatósága a látható gombokból számol, ahogy eddig. A `data-kuthid` jelzi, mit rejtett a kapu, és nyitáskor csak azt adja vissza.
- **Fő függvények:** `kutAktiv`, `kutNyitva(f)`, `kutJel(id)`, `kutMeccsUtan(gf,ga)`, `kutErtekel()`, `kutCeremonia()`, `kutKartyaRajz()`, `kutHub()`.

## Próbák
- **`tools/kezdo-ut-motor-1-0-11-16-00-proba.js` (új)**, amely ellenőrzi:
  1. a kaput és a kártyát;
  2. a jel- és meccsfeladatokat, a szakaszváltást és a kinyílást;
  3. hogy az ünneplés a többi ablak után jön;
  4. a piacot a 8. fordulótól;
  5. a tartalék-továbblépést és az út végét;
  6. a „Mindent kinyitok” gombot;
  7. a mentést és betöltést, a régi mentést;
  8. a profi szintet;
  9. a kihívás-ajánlatok zárását;
  10. hogy nincs oldalhiba.
- **A HUB-ot, karriert vagy kihívást érintő régi próbák:** lásd a commitot.
