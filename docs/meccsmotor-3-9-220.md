# 3.9.220 — ⚽ A meccserő többet dönt

> „…egy kicsit következetesebbnek kell lennie az eredményeknek a meccs erő
> függvényében." — a döntés az elemzés után (docs/meccsmotor-szoras-elemzes.md):
> „1–4 mehet, szerintem ezt bele tudjuk majd számolni az adatokba, hogy volt
> egy váltás időközben a meccsmotorban. A mérő minden idényben rögzítse a
> meccsenkénti adatokat is, éppen ebből a célból. A hangolást dolgozd ki
> tervként!"

## Mi változott a meccsen

| # | Változás | Előtte | Most |
|---|---|---|---|
| 1 | **A zaj az erőhöz kötve** | a 90+ ráadásgól és a 11-es/öngól oldala 50-50 volt; piros lapot csak mi kaptunk | a két gólvárhatóság arányából; **az ellenfél is kaphat pirosat** (ugyanazzal az eséllyel és árral) |
| 2 | **Rangadó / hajrá-rangadó** | a két λ 48–74%-ban a közös közép felé húzódott | a régi közelítés **harmada**; a hangulat (zárt / gólgazdag / ideges) marad |
| 3 | **A jobb csapat rákapcsol** | — | a 60. perc után, ha az esélyes nem vezet: a gólvárhatósága ×1,25-ig (5 meccserőnél telik be), az ellenfélé ennyivel osztva — a CPU-meccsen és a párharcban is |
| 4 | **A meredekség** | K = 0,09 (1 pont ≈ +9% gólvárhatóság) | **K = 0,12** (1 pont ≈ +13% / −11%) |

**A pálya súlya nem nőtt.** A hazai pálya +1,2 helyett +0,9, az idegen −0,4
helyett −0,3. Pontosan ugyanannyi gólvárhatóságot adnak, mint eddig, mert a
pálya nem a te munkád.

### A káosz a Jokeré

A fejlesztői beszélgetésből: *„Legyen csak a Joker talizmánokra építő játékos
élménye az, hogy sosem tudja, mi történhet egy adott meccsen."*

* **🃏 Vad idény:** a ritka-esemény többletével arányosan visszahozza a régi
  rangadó-közelítést; a 60%-os plafonján teljesen. A leírása kimondja.
* **🃏 Káosz-elmélet** (speciál): a rangadók a régi, teljes
  kiszámíthatatlansággal mennek. A kontra-sorában áll, mert az esélyesnek ez
  hátrány.

### Mellékhatás, ami javítás

A 🏟️ „A 12. játékos" talizmán (+20% ellenfél-piros hazai pályán) eddig csak a
párharcban hatott, mert a gépi ellenfél soha nem kapott lapot. Mostantól a gép
ellen is él.

## Mérve — a valódi motoron

A mérés körülményei: 1. idényes karrier, a kért ⚡-különbség a kezdőrúgáskor
beállítva, a meccsek fele hazai, fele idegen
(`tools/meccsmotor/szoras-valos.js`).

**Normál bajnoki** (győzelem / döntetlen / vereség %):

| ⚡ különbség | 3.9.219 | **3.9.220** |
|---|---|---|
| 0 | 42 / 29 / 29 | 48 / 24 / 28 |
| +2 | 53 / 26 / 21 | 65 / 18 / **17** (n=840) |
| +3 | 61 / 20 / 20 | 73 / 17 / **10** (n=840) |
| +5 | 72 / 18 / 10 | 85 / 8 / **6** |
| +8 | 83 / 12 / 5 | 94 / 6 / **0** |

**Rangadó / hajrá-rangadó** (300 meccs különbségenként):

| ⚡ különbség | 3.9.219 | **3.9.220** |
|---|---|---|
| 0 | 41 / 26 / 33 | 45 / 19 / 36 |
| +3 | 50 / 19 / 31 | 68 / 18 / **14** |
| +5 | 52 / 21 / 28 | 80 / 12 / **8** |

A meccs meccs marad: egyenlő erőknél ugyanúgy bármi kijöhet, és +2-nél még
mindig minden hatodik meccs vereség.

## Az idény szintjén

### A piramisban

Itt a meredekebb motor **teljes hatása** él. A `tools/pyramid-sim.js gaps`,
600 idény soronként, a régi és az új motor egymás mellett:

| rés (a te erőd − az osztály átlaga) | feljutás (top 2), régi → új | kiesés, régi → új |
|---|---|---|
| −2 | 0 → 0% | 51 → 64% |
| 0 | 9 → 8% | 11 → 9% |
| +2 | 55 → **68%** | 0 → 0% |
| +3 | 75 → **89%** | 0 |

Az előny többet ér, a lemaradás viszont többe kerül. A lemaradó csapatot a
Run-padló (3.9.210) védi.

### A dinamikus módban

**Itt a nehézség ígérete nem változik.** A cél-sávok (Kegyetlen … Megengedő),
a csúszka, a nehézség neve, a bajnoki esély és a figyelmeztetés a régi motoron
mért bajnoki esélyhez voltak kalibrálva. Az új motorban ugyanez az esély
kisebb fölénynél jön ki: a mérés szerint a régi gap 0,86–0,90-szeresénél
(szezon-szimuláció, 3000 idény soronként).

* **A sávok ezért a régi egységben maradnak** (`GAP_KAL = 0,87`), a tárolt
  választás (pl. „c5") nem változik, és a felhasználás helyén számolódnak át.
* **A „Kiegyensúlyozott" sáv** most a +2,6 … +4,4 meccserő-sáv (eddig +3 … +5),
  és ugyanazt a bajnoki esélyt ígéri, mint eddig.
* **Ami változik:** a szezon közbeni munkád (morál, taktika, összhang,
  igazolás) egy ponttal többet ér a pályán.

## A mérő (minden idényben)

* **Meccsenkénti sor minden idényben** (eddig csak az 1.-ben). A régebbi
  verzióban nyitott idény is gyűjt innentől.
* **Új mezők a sorban:**
  * `d` — a kezdőrúgás motor-különbsége, pályával;
  * `lf`, `la` — a két gólvárhatóság, a rangadó-hangolás után;
  * `nagy` — `riv` / `hajra`;
  * `r`, `or` — a mi és az ellenfél kiállításai;
  * `mot` — a **motor nemzedéke**.
* **A motor nemzedéke** (`MERES_MOTOR`): 1 = 3.9.219-ig, 2 = 3.9.220-tól. A
  sorok, az idény (`motor`) és a beállítások is viszik. A régi sorokban
  hiányzik, és 1-nek számít. **A váltás előtti és utáni adat így
  szétválasztható** — ahogy kérted.
* **`node tools/meres/osszegez.js <napló.json> --meccsek meccsek.csv`** egy
  meccsenkénti CSV-t ad, minden idényből, a fenti oszlopokkal.

## Közös karrier: a hangolás

Terv, a kód nem változott: `docs/terv-befektetes-aranyos-hangolas.md`.

## Próba

`tools/meccsmotor-3-9-220-proba.js` — 27 állítás:

* a konstansok;
* a rákapcsolás minden ága;
* a rangadó és a két Joker-lap;
* a dinamikus sávok átszámolása (a tárolt választás, a legközelebbi sáv, a
  bajnoki esély, a név, a kiírás);
* az ellenfél kiállítása egy valódi meccsen (napló, eredményjelző, mérősor);
* a mérő minden idényben;
* a súgó.
