# 3.9.156 — Talizmánok F6c: Joker, Morál, Bank speciálok

> „Csináljuk itt lokálba."

A speciál-katalógus harmadik kötege: a Joker, a Morál és a Bank 25
speciálja él. Minden speciál a meglévő motorokba köt be. A pro és a kontra
együtt hat, amíg a lap a gyűjteményben van. Talizmán nélkül minden olvasó
semleges értéket ad, és a meccs pillanatképében sincs új mező.

## A meccsre ható számok a pillanatképben

Öt kontra és egy pro a mérkőzésen hat. A párharcban a két gép csak akkor
számol ugyanúgy, ha a szám a pillanatképben utazik. Ezért három új mező van:

| mező | mit tol | ki adja |
|---|---|---|
| `talSpOwn` | a saját gólvárhatóságot, az egész meccsre | Hosszú emlékezet, Rangadó-láz, Pénzfeldobás |
| `talFav` | a saját gólvárhatóságot, **csak ha esélyes vagy** | Fekete bárány (kontra) |
| `talHome` | a hazai pálya előnyét (meccserőben) | Stadionbővítés (kontra) |

* A fogadó `matchLambdas` sávba vágja őket: a `talSpOwn` és a `talFav`
  ±15%, a `talHome` ±1 meccserő.
* Hogy „esélyes vagy-e", azt a motor saját különbsége dönti el (`diff > 0`).
  Ezt a két gép ugyanabból a két pillanatképből számolja.
* A `talHome` csak hazai pályán hat.
* Régi kliens pillanatképében a mezők hiányoznak — ott semlegesek.
* A `talSpOwn` a meccserő-tükörbe (`snapMatchStrength`, `talMeccsOvr`) is
  bekerült, mert a meccs előtt eldől, és az egész meccsre szól.

**Mellékjavítás.** A párharc pillanatképének sárgalap-esélyéből eddig
kimaradt a Vasfegyelem. Mostantól benne van, a Vasakarat kontrájával együtt.

## 🃏 Joker

| speciál | pro | kontra |
|---|---|---|
| Befektetők | az átigazolási pakliban „Befektető" esemény a hátsó sáv 10%-ával: a heti lelátó 10–35-szöröse egy összegben | a begyakorlás −7% |
| Talizmán-eső | +1 ütemezett húzás, a plafon 6 → 7 | a húzásokon nincs Tiszta talizmán |
| Kétélű penge | az új lapok pro-dobása a jobbik a kettőből | az új lapok kontra-dobása a rosszabbik a kettőből |
| Fekete bárány | óriásölésnél a jutalmak ×1,5 | esélyesként −2% saját gólvárhatóság |
| Kaszinó | a húzáson 4 lap közül választasz | minden húzás a heti lelátó 50%-a |
| Káosz-elmélet | a jó ritka események +50% | a rossz ritka események is +50% |
| Szerencse fia | a garantált legendás 16 helyett 10 húzás után | az átlagos lapok a sáv aljáról dobnak |
| Pénzfeldobás | idényenként 5 (nagyon ritkán 7) érme: fej → +4% a következő meccsen | írás → −3%; két írás egymás után −2 morál |
| Tükörvilág | karrierenként egyszer: egy idényre minden kontra pro | a következő idényben minden pro fele erővel |

**Megjegyzések:**

* **Befektetők.** Idényenként legfeljebb egyszer. A kifizetés saját könyvelési
  sort kap („Befektető — talizmán").
* **Talizmán-eső.** Ha a lap idény közben jön, a plusz húzás a hátralévő
  fordulók egyikébe kerül. A menü ilyenkor a sávok helyett a hátralévő
  darabszámot mutatja.
* **Kétélű penge.** Az adatmodell bővült: a lap mellé két új szám kerül (`dp`,
  `dk`). A speciál száma `0,85 + 0,30 × dobás` szorzót kap oldalanként.
  * A régi lapokon a két mező hiányzik, ezért a számuk pontosan a régi. Ez a
    migráció: nincs mit átírni.
  * A kártyán kiírt szám ugyanabból a függvényből jön, mint a hatás.
* **Kaszinó.** A negyedik lap a maradék kategóriákból jön. A díjat a
  választás és a passz is fizeti. Saját könyvelési sora van. A húzás-ablak
  állva 2 × 2 lapot mutat, széles képernyőn és fekvő telefonon egy sorban
  négyet.
* **Káosz-elmélet.** A jó és a rossz ritka eseményeknek külön szorzójuk van.
  * A mez leveszése jó esemény, a piros lap rossz.
  * A vegyes sávok (különleges meccs-esemény, átigazolási csend) a kettő
    átlagát kapják.
  * A párharcban nem hat.
* **Pénzfeldobás.** A Talizmánok menüben dobsz. Az eredmény azonnal eldől, és
  látszik. A dobás seedelt: a visszatöltés nem pörget újra. A hatás a
  következő meccs pillanatképében utazik. Egyszerre egy érme lehet élesítve.
* **Tükörvilág.** A menüben aktiválható, megerősítés után. Az aktiválás
  idényének végéig tart.
  * **A számos kontrák** előjelet váltanak: a −6% begyakorlásból +6% lesz, a
    −2 morálból +2.
  * **A darabos kontrák** („−1 felderítés", „−1 ajánlat a stábpiacon") +1-re
    fordulnak.
  * **Szünetelnek:** a pénzes kontrák, a morál-jel kontrák, a Kémhálózat
    lebukása és a „pakli" kontrák (Talizmán-eső, Kétélű penge). Ezeknél a
    fordított irány értelmetlen volna.
  * A következő idényben minden **számos pro** fele erővel hat. A szöveges
    prók (például „+1 stábhely") nem feleződnek.

## ❤️ Morál

| speciál | pro | kontra |
|---|---|---|
| Öltözői király | a kapitány morál-súlya és rutin-bónusza +40% | a kapitány eladási ára −15% |
| Hosszú emlékezet | győzelmi sorozatban a cél fölötti morál fele olyan gyorsan kopik | vereség utáni meccsen −2% saját gólvárhatóság |
| Rangadó-láz | rangadón +6 morál a kezdőrúgáskor és +2% gólvárhatóság | rangadó-vereség után 3 meccsig −2% |
| Családias légkör | az összhang +10%-kal gyorsabban épül | 3+ idényes játékos eladásakor −6 morál |
| Vasakarat | a kiállításos meccsen nincs morál-büntetés | sárgalap-esély +8% |
| Lélekbúvár | hullámonként +1 lépés, az irány menet közben is váltható | stábhatás −4% |
| Bulinegyed | 3+ győzelmes sorozatnál +2 morál-cél | a buli utáni meccsen −10% edzés |
| A pszichológus | a morál nem esik 30 (legendáson 40) alá | elfoglal egy stábhelyet |

**Megjegyzések:**

* **Öltözői király.** A kapitány-választó kiírása (3.9.151) magától követi:
  az is a `computeMoraleTarget`-ből számol.
* **Vasakarat.** A játékban nincs közvetlen „piros lap → morál" levonás. A
  kiállítás két úton visz morált, és a pro mindkettőt elveszi:
  * az elvesztett előny büntetése, a kiállított kapitány vagy családtag
    súlyosbításával együtt;
  * a nyeretlen sorozat morál-lökése.

  A dobás mindkét helyen megmarad, így a véletlen-folyam nem mozdul.
* **Lélekbúvár.** A futó hullám sorában „Irányt váltok" gomb áll. A már
  megtett lépések maradnak.
* **A pszichológus.** A padló a meccs utáni morál-számításban és minden
  talizmán-okozta morál-esésben fog.
  * A „fantom" stábhely a stáb-telítettségbe (`staffFull`) és a szabad helyek
    számába kerül.
  * A stáb fejléce és az igazolási sor kiírja: „🛋️ egy helyen a pszichológus
    ül".

## 💰 Bank

| speciál | pro | kontra |
|---|---|---|
| Takarékbetét | idényzáráskor a fel nem használt büdzsé 4%-a (legfeljebb a szezonkeret 10%-a) | vételár +3% |
| Szponzori bónusz | győzelem után +10% heti lelátó | vereség után −1 morál |
| Stadionbővítés | szurkolónövekedés +10% | a felvétel idényében −0,2 hazai előny |
| Kötvénypiac | a Befektetés hozama ×2 → ×2,3 / 2,45 / 2,6 | stíluspont −5% |
| Bérplafon | bér −6% | morál-cél −2 |
| Az Aranytojás | minden eladás +12% (a kikiáltási áron) | fejlődési tempó −4% |
| Tőzsdei bevezetés | idényzáráskor −5% (utolsó hely) … +20% (bajnok) a büdzsén | vereség után −1 morál |
| Szurkolói kötvény | a felvételkor azonnal a heti lelátó 500%-a | két idényen át vereség után −2 morál |

**Megjegyzések:**

* **Idényzárás.** A Takarékbetét és a Tőzsde a bajnokság lezárásakor fut. Ott
  a helyezés már ismert, a nyári keret még nem érkezett meg, tehát a „fel nem
  használt büdzsé" a valódi maradék.
  * Idényenként egyszer fut.
  * A tőzsdei hozam a szezonkeret ±30%-ánál megáll.
* **Vereség utáni morál.** A három bank-kontra (szponzor, tőzsde, kötvény) egy
  naplósorba kerül.

## Új könyvelési sorok

`talBef` (Befektető — talizmán), `talKamat` (Takarékbetét-kamat),
`talTozsde` / `talTozsdeKi` (tőzsdei hozam és veszteség), `talSzponzor`
(szponzori győzelmi bónusz), `talKotveny` (szurkolói kötvény), `talKaszino`
(a húzás díja). A naplóegyezés-próba (`ledger-audit`) mindet ismeri.

## Egy régi adósság: a visszavásárolt játékos kora

Az eladott játékos a piacon évente új életkort kapott, így más korban jöhetett
vissza. Mostantól az eladás a kort is naplózza. A visszavásárláskor a játékos
az eladáskori kor + az azóta eltelt idények számával érkezik.

## Próba

`tools/talizman-f6c-proba.js` (port 9196, 35 állítás). A régi próbák közül
három igazodott:

* `talizman-f6a-proba.js`: „a többi még nem él" mostantól csak a Meccs
  kategóriára szól;
* `talizman-f4a-proba.js`: a ritka-esemény hívás forrás-mintája elfogadja a
  „jó" / „rossz" jelzőt, a morál-húzásé a Bulinegyed tagját;
* `talizman-f4b-proba.js`: a hátsó sáv tömbje a Befektetők miatt külön
  változóban épül — a pakli ugyanúgy a végére fűződik.

A teljes regresszió (113 próba) zöld, egy kivétellel: a `nevmod-boot-proba`
az érintetlen 3.9.155-ön is elbukik (az edzők rövid neve), tehát nem ennek a
kiadásnak a hibája.
