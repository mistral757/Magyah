# ⚽ A meccsmotor szórása a meccserő függvényében — elemzés (3.9.219)

> „…elemezd, jelenleg hogyan néz ki a meccsszimuláció és mennyire vad jelenleg
> a mérő abban, hogy meccserőtől függetlenül mekkora kilengések lehetnek egy
> meccs végeredményében. […] a meccs erő +2-3 és fordításos vereség, stb. Ez
> nagyon elveheti a kedvet a taktikaépítéstől."

> A fejlesztői beszélgetésből: „…hogyan lehetne a meccserőnek nagyobb súlyt
> adni a végleges eredményben anélkül, hogy túl determinisztikussá válna. […]
> itt, ahol a meccsen magán ténylegesen semmit nem tudsz tenni […] fontos, hogy
> ne váljon semmissé a munkád a meccsmotor túlzott randomizálása miatt. Legyen
> csak a Joker talizmánokra építő játékos élménye az, hogy sosem tudja, mi
> történhet egy adott meccsen."

Ez **elemzés és javaslat**, a játékon nem változtat. A számok két mérőből
jönnek (lásd a végén):

* **a valódi motorból**, 2110 lejátszott meccsel;
* **egy hű modellből**, ami a változatokat is ki tudja próbálni.

## 1. Hogyan dől el egy meccs

1. **A különbség:** `d` = a saját ⚡ meccserő − az ellenfél ⚡ meccserője + a
   pálya. Hazai pályán +1,2, idegenben −0,4. **A pálya nincs benne a kiírt ⚡-ban.**
2. **A gólvárhatóság:** a saját λ = 1,3·e^(0,09·d), az ellenfélé
   1,3·e^(−0,09·d). Egy pont különbség ~9%-ot mozdít mindkét oldalon.
3. **A gólok:** a meccs 18 ötperces vödörből áll, és mindegyikben Poisson-sorsolás
   dönt a gólokról. Ez a szórás fő forrása, és a szerkezetéből következik.
4. **A ráadásrétegek:**

| Réteg | Gyakoriság | Erőfüggő? |
|---|---|---|
| 90+ dráma (ráadásgól) | 14%, szoros állásnál 24%, rangadón ×1,8 | **nem — 50-50, ki szerzi** |
| Különleges esemény (11-es, öngól, szabadrúgás, VAR) | 10%/meccs, rangadón 26% (×2) | **nem** |
| Piros lap | 6%/meccs, rangadón ×1,6 · −2,5 meccserő | **csak a mi oldalunkon** — a gépi ellenfél sosem kap |
| **Rangadó és hajrá-rangadó** | 2 rivális × 2 meccs + az utolsó 7 fordulóban minden 4 ponton belüli ellenfél | a két λ a közös közepük felé húzódik — **az előny 48–74%-a eltűnik** |

A napi forma (±3 egy-egy emberen) a csapatátlagban **kioltja magát**, nem
zajforrás.

## 2. Mérve — a valódi motor

A mérés körülményei: 1. idényes karrier, és a kért ⚡-különbséget a kezdőrúgáskor
állítottam be. A meccsek fele hazai, fele idegen pályán ment, így az átlagos
pályaelőny +0,4.

**Normál bajnoki** (1207 meccs, különbségenként 240):

| ⚡ különbség | Győzelem | Döntetlen | **Vereség** | Pont/meccs |
|---|---|---|---|---|
| 0 | 42% | 29% | 29% | 1,55 |
| **+2** | 53% | 26% | **21%** | 1,86 |
| **+3** | 61% | 20% | **20%** | 2,02 |
| +5 | 72% | 18% | 10% | 2,33 |
| +8 | 83% | 12% | 5% | 2,60 |

**Rangadó / hajrá-rangadó** (903 meccs, különbségenként 300):

| ⚡ különbség | Győzelem | Döntetlen | **Vereség** | Pont/meccs |
|---|---|---|---|---|
| 0 | 41% | 26% | 33% | 1,49 |
| **+3** | 50% | 19% | **31%** | 1,69 |
| **+5** | 52% | 21% | **28%** | 1,76 |

A mintavételi hiba ±2–3 százalékpont. A modell szerint +8-nál is még ~23% a
vereség.

### Mit jelent ez

* **+2–3-nál minden ötödik normál meccs vereség,** és a hajrában **minden
  harmadik**. A rangadó az előny nagy részét elnyeli: +5-ös fölénnyel is alig jobb a mérleg,
  mint +0-val egy normál meccsen.
* **A sorozatok ebből adódnak.** Egy 30 fordulós idényben ennyi az esélye, hogy
  lesz benne legalább 3 egymást követő vereség:

  | | 3+ vereség sorban | 4+ vereség sorban |
  |---|---|---|
  | +2, csupa normál meccs | **38%** | 12% |
  | +3, csupa normál meccs | 26% | 6% |
  | +2, 4 rangadóval és 7 hajrá-rangadóval | **44%** | 15% |

  Tehát egy +2–3-as fölénnyel futó idények közel felében előjön a „sorra
  veszít a gyengébbek ellen" élmény, hiba nélkül is.
* **A feljutási hajrá a legzajosabb szakasz:** a döntő meccsek épp a
  hajrá-rangadók, ahol az erőkülönbség nagy része elvész. Egy D6-ban
  „beragadó" karrierben ez közvetlenül számít.
* **A fordításos vereség** a modell szerint +2–3-nál a meccsek ~4–5%-a, a
  rangadón ~7%.

## 3. A lehúzó spirál

A véletlen nem marad egy meccsen belül:

* **morál:** vereség és elveszett előny után csökken, legfeljebb ±2,5 meccserő;
* **tartós forma:** ötmeccsenként frissül, és a játékos értékeléseiből
  számol, amelyek az eredménnyel együtt esnek; játékosonként ±7,5%.

Egy balszerencsés sorozat így **valódi meccserő-esést** okoz, ami újabb
vereségeket hoz. Ugyanezt a lehúzó spirált írja le a fejlesztői beszélgetés is:
„romlott a forma folyamatosan… hiába költöttem a pénzt boostokra".

## 4. Közös karrier: a hangolás

**Mostani szabály (`mpApplyBalance`):**

* Idény végén a két keret a különbség felét-felét lépi egymás felé.
* A 11 legnagyobb potenciálú játékoson hat, embereként legfeljebb a nyers erő
  ±3%-áig, és halmozódik.
* **Nem nézi, ki mit költött,** és **az elöl lévőt lehúzza**. Ez a „7 egységgel
  erősebb vagyok, mégis elveszítem az előnyt" panasz forrása.

A beszélgetés két jogos szempontja ütközik:

* **a te javaslatod:** a hangolás nézze, arányosan mennyit fektetett be a két
  játékos — aki nem költött, azt kevésbé emelje;
* **a társ ellenvetése:** a hosszú távú befektetés (stáb, összhang-boost) azonnal
  nem látszik, de később beindul.

**Mindkettőt kezeli, ha a hangolás a befektetés arányát méri, nem az
eredményét.** A karrier-mérő főkönyve már kategóriánként rögzíti a kiadást:

* **A mérce:** a kiadás a bevételhez mérve. A hosszú távú tételek (stáb,
  összhang-boost, akadémia, felállás, poszt-tanítás) **teljes értéken
  számítanak** — aki későbbre épít, az ugyanúgy befektetett.
* **Ha a lemaradó legalább ugyanakkora arányban költött,** jár neki a teljes
  felzárkóztatás.
* **Ha a pénzén ült,** arányosan kevesebb jár.
* **Az elöl lévőt ne húzza le** (vagy csak alig). A lemaradó felemelése
  inkább **erőforrásként** jöjjön, például büdzsé-pótlékként vagy
  boost-kedvezményként, hogy annak is dolgoznia kelljen érte.

## 5. Javaslat — lépcsőzve

A célok egyszerre: a meccserő döntsön többet, a munka ne vesszen el a zajban, a
játék ne váljon kiszámítottá, és **a káosz választható legyen**: a Joker
(🃏 *A Szerencsejátékos*) kategóriájában már ott a *Vad idény* és a
*Káosz-elmélet*.

| Lépés | Mit | Hatás (modell, normál / rangadó, vereség% +3-nál) | Kockázat |
|---|---|---|---|
| **1. A zaj az erőhöz kötve (A)** | a 90+ gól és a különleges esemény oldala a λ-arányból; az ellenfél is kaphat piros lapot | 22 → 20 / 32 → 31 | nincs — a kalibrációt alig mozdítja |
| **2. Rangadó (B)** | a λ-közelítés a harmadára; a teljes „kiszámíthatatlan rangadó" Joker-hatás lesz | rangadón 32 → **23** | a rangadó „karaktere" (gólgazdag/zárt) megmarad, csak az erő többet számít |
| **3. „A jobb csapat rákapcsol" (D)** | 60' után, ha az esélyes nem vezet, a λ-ja legfeljebb ×1,25 | 20 → 18 | enyhe; a fordításos vereség ritkul |
| **4. Meredekség (K 0,09 → 0,12)** | egy pont ⚡ többet ér | 20 → **16**; +5-nél 13 → **8** | **az egész nehézségi kalibráció erre épül** (játszható ablak, mezőny-fejlődés, rejtett erősítés, feljutási ív) — csak az új nehézségi rendszerrel együtt, a mérési adatokra hangolva |
| **5. Spirál-fék** | a morál és a forma a **megérdemelt** eredményre reagáljon (a meccs λ-jaihoz mérve), ne a puszta eredményre; a lefelé mozgás tompítva | a balszerencse nem válik tartós gyengeséggé | közepes — több rendszert érint |

A modell szerint a 2. és a 4. lépés együtt (A+B+K0,12) a +3-as fölényt így
alakítja:

* normál meccsen 65/19/16 lesz a 56/22/22 helyett;
* rangadón 62/19/19 lesz a 46/22/32 helyett.

A meccs így is meccs marad: +3-nál minden hatodik meccsen kikapsz, és +0-nál
semmi nem változik.

## 6. Mit kér a nehézségi rendszer a mérőtől

A karrier-mérő csak az **1. idényben** rögzít meccsenként eredményt és meccserőt;
a 2. idénytől tömör. A szórás és a nehézség hangolásához **minden idényben
meccsenként** kellene ez az öt adat:

* ⚡ különbség;
* pálya;
* rangadó-jelző;
* a két λ;
* eredmény.

Ez 30 rövid sor idényenként.

## A mérők

* `tools/meccsmotor/szoras-valos.js` — a valódi motor (Playwright, álórával);
  `MODE=normal|big`, `N`, `DS`, `OUT`.
* `tools/meccsmotor/szoras-modell.js` — a modell és a változatok (A, B, D, K);
  `VENUE=1` a hazai/idegen keverékhez.
