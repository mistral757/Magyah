# Nyomásgyakorlás, „Nyomás!” a kalapban, presszpont élőben, ⚡ meccs-erő az eredményjelzőn (3.9.133)

Hat bejelentés egy körben. Négy közülük valódi hiba volt, kettő új kérés.
A mérések a `tools/nyomas-es-meccsero-proba.js` próbából jönnek (31 állítás).
A régi kódon a próba a hibákat vissza is adja.

## 1. „Gyors kontra” — csak védőnek lehetett adni

**Bejelentés:** „Már bekapcsolt állapot mellett kaptam egy gyors kontra védő
képességet. Nem lehetett adni csak védőnek.”

**Az ok:** a Nyomásgyakorlás szövege a VÉDŐ-kategória képességeit ígéri
(„eddig csak védő kaphatta meg őket”). Az `eligibleForSkill` kapuja viszont
csak a `type:"defense"` hatású képességeket nyitotta ki. A „Gyors kontra”
VÉDŐ-képesség, de gólpassz-hatású (`assistw`), ezért elöl zárva maradt.
Ugyanígy járt az Ágyúgolyó, a Reptér!, az Ollóra! és a Nagylabda! is.

**Mérve a régi kódon** (3 középpályás és csatár a keretben, Nyomásgyakorlás 1):

| képesség | régi | új |
|---|---|---|
| Gyors kontra | 0 / 3 | 3 / 3 |
| Ágyúgolyó | 0 / 3 | 3 / 3 |
| Betonfal | 3 / 3 | 3 / 3 |
| Villámbeck Queen | 0 / 3 | 0 / 3 (szándékosan) |

**A javítás:** a kapu a VÉDŐ-kategóriát nyitja ki.

- **Kivétel:** a képesség, ami a leírásában kimondottan hátvédhez köti magát
  (`onPitchCat`, a Villámbeck Queen: „Csak védő kaphatja meg”).
- **Egy definíció, három helyen:** a „mi számít védekező képességnek” kérdésre
  most egy függvény felel, a `gpIsDefSkill`. Igaz, ha a képesség a
  VÉDŐ-kategóriáé, vagy bármely hatása védekezés. Ezt használja:
  - a kiosztás;
  - a Nyomásgyakorlás 2-3. szintjének szorzója („ezek a képességek tovább
    növelik a labdaszerzést”);
  - a Nyomás-iskola csillagkedvezménye.

## 2. „Benn van a kalapban a Nyomás!, ha kinyitottam?”

Nem volt benne. **Két független hiba** okozta.

### a) A pakli a karrier elején keveredik

A `S.skillPool` a karrier elején keveredik meg, amikor a „Nyomás!” még zárolt,
ezért kimaradt belőle. A feloldás után csak a következő friss pakliban jelent
volna meg. Friss pakli viszont csak akkor fűződik a meglévő mögé, ha az
12 alá fogyott, vagyis egy szezonon át (és gyakran tovább) nem lehetett
kihúzni. Közben a képesség élő kijelzése már azt írta: „a Nyomás! benne van
a pakliban”.

**Javítás: `poolSyncLocked()`, minden húzás elején.**

- A feloldás utáni első húzásnál **egy** példányt tesz a pakli véletlen
  helyére. Pontosan olyan eséllyel jön elő, mint bármelyik más képesség, ami
  már bent van.
- Nem tölti vissza, miután kihúzták. A sebesség-képességekkel ellentétben ez
  nem örök invariáns: attól a többinél gyakoribb lenne.
- Ha a filozófia lekerül, a zárolt példányt kiveszi a pakliból. Különben a
  sorsolás hatástalan képességet osztana ki.
- A jelző (`S.lockSeed`) a mentés része. Régi mentésben üres objektummal
  indul, így a futó karrierekben is azonnal bekerül a „Nyomás!”.

### b) A „Nyomásra hangolt sorsolás” a hagyományos húzásban nem hatott

A képesség csak a realisztikus mód „nem te döntesz” ágán működött
(`skillRealStyleBias`). A `drawSkillFromPoolRaw`-ban nem volt ága, pedig a
sebesség (Villám) és a passz (Tiki-Taka) párja ott van.

**Mérve** (600 húzás, a Motor vagy a Nyomás! aránya):

| | régi | új |
|---|---|---|
| hangolás nélkül | 4,2% | 5,3% |
| 3. szintű hangolással | **3,7%** (semmi hatás) | **63,7%** |

## 3. A presszpont élőben

A presszpont néma tétel volt (`quiet:{press:1}`). Egy meccsen tucatnyi
labdaszerzés akad, és mindegyik után egy külön „+0,5 presszpont” sor
teleszemetelte volna a közvetítést. Csak a lefújás utáni összesítő mondta ki,
miközben a végösszegbe (helyesen) beleszámított.

**Most:** nem új sor, hanem egy címke a labdaszerzés saját sorának végén:

> 34'  🧲 **Csapdába futottak!** Presszing-csapda a felezővonal előtt, és
> Kovács csukta rájuk az ajtót.  🧲 **+0,5** presszpont

- Az `engNote` visszaadja az egyes stílusoknak jóváírt pontot.
- Az `engInlineTag` csak a néma tételeket címkézi. A többit az `engNoteK`
  amúgy is kiírja, kétszer nem mondjuk ki.

## 4. Több kommentár a fenti labdaszerzésnél és a gólnál

Eddig egy-egy mondat volt mindkettőre. 3. szintű Nyomásgyakorlással
meccsenként 3-4-szer ugyanaz hangzott el. Most:

| | fejléc | mondat |
|---|---|---|
| labdaszerzés | 6 | 14 |
| gól belőle | 5 | 10 |

- A mondatok a pressing különböző arcait mutatják: kigurítás elcsípése,
  csapda a szélen, passzsáv kitalálása, visszatámadás, hibára kényszerített
  hátvéd.
- A `pickLineNoRepeat` miatt kétszer egymás után ugyanaz nem jöhet.
- Egyik mondat sem állít olyan tényt, amit a motor nem tud (pl.
  „harmadszorra”).

## 5. ⚡ Meccs-erő minden eredményjelzőn, élőben

**Kérés:** „…minden meccsnél a meccs erő látszódjon az eredményjelzőn is, és
frissüljön cserékkor, kiállításkor real time.”

- **A név alatti első sor marad:** helyezés · csapaterő. Ez a tabellával és
  a piaccal összevethető szám.
- **Alatta, saját sorban:** ⚡ meccs-erő, mindkét oldalon, minden mérkőzésen:
  - **a tiéd:** `teamMatchStrength()` a kezdőrúgásig, onnan hozzáadódik a
    motor élő változása (`sbSetMyMs`). A csere a két ember különbségének
    tizenegyedével mozdítja, a kiállítás a levont emberhátránnyal (−2,5).
  - **CPU-ellenfél:** `fx.o.ovr + matchHiddenOppBuff()`. Pontosan az a szám,
    amivel a motor a gólvárhatóságot számolja. A képletet ezért emeltük ki a
    `playMatch`-ből egy közös függvénybe: a kiírt szám csak akkor őszinte, ha
    ugyanonnan jön.
  - **Társ (párharc):** a pillanatképéből jött `matchOvr` (3.9.104).
- **Skálakeverés soha:** ha az egyik oldalé hiányzik (régi kliens), egyik
  oldalon sem írjuk ki.

### A motor hibája, ami közben előkerült

A csere a `diff`-et a pillanatképből újraszámolta (`matchLambdas`), és ezzel
némán visszaadta a kiállítás levonását. Egy kiállítás utáni csere után a
csapat ismét teljes létszámú erővel játszott, és a rangadó-hangolás is
elveszett.

- **Javítás:** az emberhátrány összege külön számlán fut (`redDiffCost`), és a
  csere a kiállítás képletével újra alkalmazza. A `rivalTune` is újra ráül.
- **Mérve valódi meccsen:** kiállítás → −2,50; utána egy 60-as csere →
  −4,78. A csere a saját különbségét adja hozzá, az emberhátrányt nem veszi
  vissza.

## 6. PvP: a társ címere és stadionja

- **Mit küldünk:** a pillanatkép (`h2hWireSnapshot`) viszi a saját
  arculatodat: a rajzolt címert, a színpárt és a stadionnevet (`mpWireIdent`).
- **Hol jelenik meg:**
  - az eredményjelzőn a társ oldalán is ott a jelvény;
  - ha nála játszotok, a napló így nyit: „🏟️ ‹stadion› — idegenben,
    ‹klub› otthonában.”
- **CPU-ellenfelek:** jelvény és pályanév nélkül maradnak. Nekik kitalálni
  hazugság volna.

### Biztonság

A `crestSVG` a színeket és a tintát nyersen teszi SVG-attribútumba. Egy idegen
gépről jött értéket ezért nem adhatunk át ellenőrzés nélkül. A
`mpCleanIdent` fehérlistán engedi át:

- **forma és jel:** csak ismert kulcs;
- **mezőminta:** csak rövid azonosító;
- **színek:** csak `#hex` vagy számokból álló `hsl()` / `rgb()`;
- **monogram:** legfeljebb 3 betű vagy szám;
- **stadionnév:** 40 karakter, jelölés nélkül, és kiíráskor még `esc()` is
  fut rajta.

Ami nem felel meg, kiesik: rossz szín vagy ismeretlen forma esetén az egész,
rossz tinta esetén csak a címer, a név marad.

## Érintett függvények

`gpIsDefSkill`, `eligibleForSkill`, `gpPlayerWeight`, `poolSyncLocked`,
`drawSkillFromPoolRaw`, `engNote`, `engInlineTag`, `GP_PRESS_*_TXT/HEAD`,
`matchHiddenOppBuff`, `sbPaintTeams`, `sbFitTeams`, `sbSetMyMs`, `playMatch`
(`redDiffCost`, `sbLiveMs`, `doSub`), `mpWireIdent`, `mpSafeColor`,
`mpCleanIdent`, `h2hWireSnapshot`.

**Módosított próba:** a `tools/pvp-meccsero-proba.js` mostantól a meccs-erőt a
bajnokiban és a kupában is elvárja, saját sorban. A csapaterő sora mindenhol
változatlan.

---

## 3.9.149 — ugyanannak a csapatnak ugyanaz a meccs-ereje mindkét gépen

> *„Nálam azt mutatta, hogy a meccs erőd 98”* — a te eredményjelződön
> ugyanez a csapat ⚡95,2 volt.

**Az ok: két képlet.** A párharcban a társ gépe a te ⚡-odat a te
**pillanatképedből** számolta (`ovr` + taktika). Pontosan ezzel a számmal
számol a szimuláció is. A te géped viszont a helyi **becslést**
(`teamMatchStrength` = csapaterő + `hiddenMatchBonus`) írta ki. A becslésből
hiányzik:

* a napi forma (két kisorsolt játékos ±);
* a **tartós forma** (játékosonként ±15% a skála két szélén);
* a **csapategyensúly-bónusz** (legfeljebb +2);
* a stílus csapaterő-traitje (`ovrTeam`).

**A javítás.**

* **A párharcban mindkét oldal a pillanatképből, ugyanazzal a képlettel.**
  A `h2hStart` a saját pillanatképedből is kiszámolja a `myMatch`-et. Az
  eredményjelző ezt írja ki, és az élő frissítés (csere, kiállítás) is erről
  indul. A két gép így ugyanazt a számpárt mutatja, és az a szám az, amivel
  a meccs valóban lement.
* **A papírforma is szimmetrikus.** A saját papírformád (óriásölés,
  kihívások) ugyanabból a számból jön, amiből a társad gépe a tiédet
  számolja.
* **Motorhiba: a morál-csúszka.** A „morale” csúszka-csatorna (például
  „Hagyd a legjobbat”: ára a csapatmorál; „Béke”: haszna a morál) eddig CSAK
  a kijelzett meccserőben hatott, a motor a csúszka nélküli képlettel
  számolt. Mostantól a `buildMatchSnapshot` is a `moraleToOvr`-t hívja.
  Csúszka nélkül bitre a régi.

**Ami nem változott.** A CPU-meccsek ⚡-ja és a nehézség-követés továbbra is
a becslésből dolgozik. A három hiányzó tag (tartós forma, egyensúly-bónusz,
stílus-trait) beemelése a becslésbe a CPU-mezőny kiegyenlítését is
emelné, tehát ez balance-döntés, nem hibajavítás. Nyitott kérdés.

Próba: `tools/meccsero-egyezes-proba.js`. A valódi `h2hStart` mindkét
szerepből, a valódi eredményjelző, a papírforma és a morál-csúszka. A régi
kódon pontosan a bejelentett eltérést adja vissza (nálad 95,2, a társnál 98).
