# Cserék — egy kapcsoló, egy terv, minden mérkőzésre

*(3.3.22. Érintett kód: `subPlanState` / `subPlanActive` / `subHalftimeStopOn`,
`openSubPlanner` + `renderSubPlanner`, `runPlannedSubs` a meccsmotorban,
`renderHalftimeSubsBtn`. A feltételes szabályok motorja a 3.3.17-es
párharc-cseretervezőből jön — lásd `csapatepitesi-stilusok.md` 3.3.)*

## 1. Ami félbemaradt

A feltételes cseretervező a **párharcra** született: ott a mérkőzés nem tud
megállni (az eredményt a két keretből előre kiszámolt közös eseménylista adja),
tehát a cseréket előre, feltételekhez kötve kellett megtervezni. Csakhogy a
tervező ott is maradt:

* egyetlen mérkőzésre szólt (a kulcs a `h2hKey()` volt),
* az **egyjátékos** meccseken nem lehetett használni,
* és minden párharc előtt újra kellett rakni.

Pedig a kérdés minden meccsen ugyanaz: *„ha a 70. percben vesztésre állunk,
jöjjön be a csatár."* Egy menedzser egyszer eldönti, hogyan cserél.

## 2. Ami lett belőle

**Egy terv van, a karrieren belül globális.** A HUB **Cserék** gombja nyitja, és
onnantól minden mérkőzésre érvényes — bajnokira, kupára, párharcra és a
végigjátszott (auto) szezonra is —, amíg ki nem kapcsolod vagy át nem írod.

A gomb három állapotot mutat:

| állapot | mit jelent |
|---|---|
| **KI** | nincs csere, a meccs végigfut |
| **BE**, terv nélkül | a régi viselkedés: félidei megállás + a meccsnézet csere-gombja |
| **BE**, N tervezett cserével | a szabályok magától lefutnak minden mérkőzésen |

**Bekapcsoláskor rögtön megnyílik a beállító ablak** — ez ugyanaz az ablak,
amit a párharc kezdőrúgása előtt is látsz. Benne két dolog állítható:

1. **Félidei megállás** (BE/KI) — bekapcsolva a meccs félidőben megáll a kézi
   csereszünettel; kikapcsolva a mérkőzés végigfut, és csak a szabályok
   cserélnek. A meccsnézet alján lévő gomb mindkét esetben él, ha maradt
   cserekereted.
2. **Tervezett cserék** — a szabálylista.

## 3. Egy szabály három választása

| # | változó | értékek |
|---|---|---|
| 1 | hányadik perctől | 5-től 85-ig, ötösével (a meccs is öt perces szakaszokban pereg) |
| 2 | milyen az állás | bármilyen · vezetünk · vereségre állunk · döntetlen · 2+ góllal vezetünk · 2+ góllal vereségre állunk · kiállítottak egy játékosunkat |
| 3 | ki helyére ki | a kezdő 11 bármelyik tagja ← a cserepad bármelyik tagja (Beton védelemnél, aktív Park the bus mellett középpályás helyére a **buszsofőr** is) |

**A sorrend a rangsor.** A mérkőzés felülről lefelé halad: ha egyszerre több
szabály is érvényes volna, a fentebbi lép életbe, és a hármas cserekeret is
fentről lefelé fogy el. A nyilakkal átrendezhető.

Egy szabály akkor sül el, ha **mind a négy** igaz: elérted a percét · az állás
stimmel · van még cseréd · a hely és a beálló ember **most is** érvényes (a
keret azóta változhatott: sérülés, eltiltás, kiállítás).

**Az új szabály értelmes tippel születik**: a hely az első olyan középpályás
slot, amit még egyik szabály sem használ, a beálló pedig az első szabad, azonos
szerep-csoportú padon ülő — a tartalék kapust sosem ajánljuk fel magától.

## 4. Hogyan hajtódik végre

| mód | ki hajtja végre |
|---|---|
| egyjátékos meccs (kézi vagy auto) | `runPlannedSubs()` minden öt perces vödör elején, a pillanatnyi állás alapján |
| párharc | a **közös eseménylista** — a terv a pillanatképpel megy fel, és a szimuláció számolja bele (3.3.17) |

Mindkét úton a **rendes csere** (`doSub`, illetve a buszsofőr behívása) fut le,
tehát a könyvelés pontosan ugyanaz, mintha kézzel cseréltél volna: a lecserélt
és a beálló az eltelt idő arányában osztozik a meccs fejlődésén, mindkettőnek
nő a meccsszáma és a statisztikája, és mindkettőért fizetsz bért (3.3.18).

## 5. Az állapot és a mentés

```js
S.halftimeSubs      // a mestergomb (KI/BE) — fölötte áll mindennek
S.subPlan           // {v:1, rules:[...]} — a GLOBÁLIS szabálylista
S.subHalftimeStop   // álljon-e meg a meccs félidőben (alap: igen)
S.subPlanAsked      // melyik párharcra kérdeztünk már rá a kezdőrúgás előtt
```

**Miért a mentésben és nem a localStorage-ban:** a szabályok a KERETRE mutatnak
(melyik slot, melyik padon ülő ember), tehát csak egy adott karrier belsejében
értelmesek. Egy másik karrierbe átvinni őket néma hülyeség lenne.

**Régi mentés:** a 3.3.17-es, párharc-kulcsos terv (`S.mpSubPlan`) egyszer
automatikusan átveszi magát az új, globális tervbe — aki megtervezte a
párharcát, nem veszíti el a munkáját.

## 6. Amit szándékosan NEM csináltunk

* **Nem szüntettük meg a kézi csereszünetet.** A kettő megfér egymás mellett, és
  ugyanabból a hármas keretből gazdálkodik — a terv fut magától, és ha kéred,
  félidőben akkor is megállunk.
* **Nem tettük karrierek fölöttivé.** Lásd fent: a szabályok keret-függők.
* **A párharc előtti kérdés megmaradt.** Ott a tét nagy, és a keret is
  változhatott a legutóbbi beállítás óta — egy pillantás a tervre a kezdőrúgás
  előtt megéri. A „már megkérdeztük" jelző párharconként külön él.
