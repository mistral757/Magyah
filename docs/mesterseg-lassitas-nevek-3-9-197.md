# 3.9.197 — 🎓 Lassabb, gyengébb stílus-mesterség · két névkör

> „A névjavaslatok mehetnek
> Legyenek sokkal lassabbak a profil csapatstílusra vonatkozó skillfa
> jutalmai. Sokkal lassabban megszerezhetők és kevésbé erősek"

## 1. Sokkal lassabban megszerezhető

**A mérföldkő-lépcsők hosszabbak és magasabbak:**

| lépcső | 3.9.195 | 3.9.197 |
|---|---|---|
| meccs a stílussal | 10 … 400 (7) | 20 · 60 · 120 · 200 · 320 · 480 · 700 · 1000 |
| győzelem a stílussal | 5 … 250 (7) | 10 · 35 · 70 · 120 · 200 · 320 · 480 · 650 |
| szerepben lejátszott meccs | 10 … 550 (6) | 25 · 80 · 180 · 350 · 600 · 900 · 1300 |
| a szereplők gólja + gólpassza | 5 … 300 (6) | 10 · 40 · 100 · 200 · 350 · 550 · 800 |
| lezárt idény | 1 … 13 (6) | 2 · 4 · 7 · 11 · 16 · 22 · 30 |
| bajnoki cím | 1 · 2 · 4 · 7 | 1 · 3 · 6 · 10 · 15 |
| stílus-mérföldkő | 3 … 120 (6) | 10 · 30 · 60 · 100 · 150 · 220 · 300 |
| legmagasabb stílusszint | 3 … 20 (7) | 6 · 10 · 14 · 17 · 19 · 20 |

**A szintküszöbök** (1–10. szint):

| | 1–10. szint küszöbe |
|---|---|
| eddig | 20 · 60 · 120 · 200 · 300 · 420 · 560 · 720 · 900 · 1100 XP |
| most | 150 · 350 · 600 · 850 · 1100 · 1350 · 1600 · 1850 · 2050 · 2200 XP |

A teljes tábla 2200 XP.

**A tempó, mérve** (a próba is ellenőrzi):

| karrier ugyanazzal a stílussal | eddig | most |
|---|---|---|
| egy 3 idényes | ~5. szint | **~1. szint** |
| két 3 idényes | — | **~2. szint** |
| egy 10 idényes | — | **~3. szint** |

A 10. szinthez szinte a teljes tábla kell, vagyis sok karrier ugyanazzal a
stílussal.

## 2. Kevésbé erős

| csomópont | 3.9.195 | 3.9.197 |
|---|---|---|
| Hozott tudás I / II / III | +15 / +25 / +40 (összesen 80) | **+6 / +10 / +14 (összesen 30)** csapatstílus-pont |
| Mérföldkő-prémium I / II + Mesterfokozat | +10% / +10% / +10% (30%) | **+4% / +4% / +4% (12%)** |
| Ismerős fa / Kitaposott ösvény + Mesterfokozat | −8% / −8% / −10% (−26%) | **−3% / −3% / −4% (−10%)** |
| Második otthon (másodlagos osztó) | 3 → 2 | **3 → 2,5** |
| Rutin (stílus szint-pont) | +5% | **+2%** |

A képességár-kedvezmény plafonja 60% helyett 20%.

**A már megnyitott csomópontok maradnak.** Aki a 3.9.195 óta nyitott
csomópontot, azt nem veszi el a rendszer. Új pontot viszont csak akkor kap,
ha a mesterségszintje utoléri a már nyitott csomópontok számát.

**A profilszint „Stílus-mesterség (összes szint)” lépcsője** a lassabb
tempóhoz igazodik: 1 · 3 · 6 · 10 · 16 · 24 · 34 · 46.

## 3. Két névkör (20 név)

A `tools/nevek/manual.py` a `JAVASLAT_3_9_197` blokkot kapta, ebből a
`build.py` újraépíti a táblát. A `kettozes.py` lefutott: nincs kettőzött
személy.

| játékos | eddig | most |
|---|---|---|
| Dirk Kuyt | Köjt Barnabás | Kujtorgó Dirk |
| Michael Ballack | Bálákos Mihály | Ballonos Mihály |
| Sepp Maier | Májer Zsepp | Majonézes Zsepp |
| Andy Cole | Kol Bandi | Kóla Bandi |
| Ihor Belanov | Belánov Igor | Bölényes Igor |
| Willie Miller | Miler Vili | Mímelő Vili |
| Nils Liedholm | Lídólm Miklós | Lidérces Miklós |
| Pablo Aimar | Ájmár Pali | Ájuldozó Pali |
| Zbigniew Boniek | Bonyek Barnabás | Bonyolult Barnabás |
| Thiago Alcântara | Alkantára Tihamér | Alkudozó Tihamér |
| Filippo Inzaghi | Indzagi Fülöp | Ingázó Fülöp |
| Hernán Crespo | Kreszpó Ernő | Kresszes Ernő |
| Geoff Hurst | Hurszt Dzsef | Hurkás Dzsef |
| Antonio Cassano | Kasszano Antal | Kaszinós Antal |
| Billy Bremner | Brémner Vili | Brummogó Vili |
| Roy Makaay | Makáj Roj | Makacs Roj |
| Radamel Falcao | Falkó Radamesz | Falatozó Radamesz |
| Uli Stielike | Stilike Ulrik | Stiglices Ulrik |
| Wim Kieft | Kift Vilmos | Kifli Vilmos |
| Nemanja Matić | Matyics Nándor | Matekos Nándor |

## 4. Próba

A `tools/profil-szint-3-9-195-proba.js` az új számokra igazodik, és egy új
állítást is kapott a tempóra (28 állítás).
