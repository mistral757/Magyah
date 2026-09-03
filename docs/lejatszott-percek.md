# Lejátszott percek (3.9.33)

Kimondott kérés:

> „Az átigazolási piacra tételt és az edzővé válást is tegyük mostantól
> játszott percekkel számított értékek függvényévé.
> átigazolási piacra tehető az, akinek van már 500 lejátszott perce (ez
> fulltime meccsekkel alig több mint 5, de azzal a taktikával amit most
> használnak a playerek, hogy 5 percekre hozzák be őket meccs végén, úgy
> jelentősen hosszabb: 100 meccs...) a kikiáltási ár felskálázását is percekkel
> csináljuk, de lassabb tempóban, mint a korábbi meccs alapúnál
> A segédedzővé váláshoz legalább 20 teljesen lejátszott meccs kelljen, az ugye
> 1800 perc. kerekítsük 2000-re. szóval ott az legyen a határ. ott is a
> tapasztalat edzői minőségre adott hatását lassabban de scaleljük a plusz
> percekkel"

---

## 1. Miért volt rossz a meccsszám

A meccsszám egy **ötperces beállást** és egy **végigjátszott mérkőzést**
pontosan egyformán könyvelt el. Két szabály ült rajta, és mindkettő pont azt
nem tudta megkülönböztetni, amiért létezett:

* **piacra tétel** — 20 meccs. Húsz cameo (összesen másfél meccsnyi játékidő)
  már kinyitotta a kirakatot egy frissen igazolt embernél.
* **edzővé válás** — 40 meccs. Negyven ötperces beállás összesen alig három
  meccsnyi közös múlt — de a rendszer „negyven meccsnyi ismeretségnek" látta.

---

## 2. Az adat: `share`, ami már megvolt

A motor a csere pillanatában kiszámolja a `share`-t — azt a 0..1 arányt, amivel
a **fejlődés** és a **meccs-értékelés** is dolgozik:

```
a.share = 1 − eltelt/90     (a beálló)
halfOut.push({… share: eltelt/90})   (a lecserélt)
```

Egy slotot legfeljebb egyszer lehet cserélni (`htsSlotBusy`), tehát slotonként
az arányok összege pontosan 1 — nincs mit duplán számolni. A lefújás ebből
összegzi a perceket:

```
S.seasonMinutes[név]      — idényenként (mint a seasonMatches)
S.careerStats[név].min    — a karrier összes perce nálad
```

**A kiállított kivétel.** Ő az `active`-ban marad, tehát osztatlan aránnyal
teljes meccset könyvelne — pedig épp az a lényeg, hogy nem játszotta végig. A
piros lap percét (`redMin`) ismerjük, abból számol.

---

## 3. A két kapu

| | régi | új |
|---|---|---|
| piacra tétel | 20 meccs | **500 lejátszott perc** |
| edzővé válás | 40 meccs | **2000 lejátszott perc** |

**MÉRVE** (`tools/percek-proba.js`):

| eset | perc | piacra | edző |
|---|---|---|---|
| 100 ötperces beállás | 500 | ✔ (épp) | ✘ |
| egy perccel a kapu alatt | 499 | ✘ (`minutes`, −1 perc) | — |
| 20 végigjátszott meccs | 1800 | ✔ | ✘ |
| 23 végigjátszott meccs | 2070 | ✔ | ✔ |
| 30 meccs, 2700 perc, **30 évesen** | 2700 | ✔ | ✘ (kor) |

Két dolgot érdemes kimondani:

* **A 2000 perc nem 20 teljes meccs, hanem 22,2.** A kérés maga mondta ki a
  kerekítést („az ugye 1800 perc, kerekítsük 2000-re") — a küszöb tehát
  szándékosan valamivel a húsz meccs fölött van.
* **A végigjátszó embernek KÖNNYEBB lett az edzői út** (22 meccs a régi 40
  helyett), a beállogatónak viszont sokkal nehezebb. Ez a lényeg: a szabály
  végre azt méri, amit mérni akar.
* A **kor kapuja** (32 év) érintetlen.

---

## 4. Az árskálázás — percben, lassabban

| | régi | új | mennyivel lassabb |
|---|---|---|---|
| bizonyítottság teli pontja | 40 meccs | **5000 perc** (≈55,6 meccs) | ~39% |
| hűség-tag teli pontja | 200 meccs | **24 000 perc** (≈267 meccs) | ~33% |
| a termés rátájának osztója | meccsszám | **lejátszott 90 percek** | — |
| a „még zaj" küszöb | 5 meccs | **450 perc** | — |

**MÉRVE**: 3600 percnél (a régi 40 meccs percre váltva) a bizonyítottság most
**0,72**, nem 1,00 — a rámpa tényleg lassabb.

**A termés mércéje is 90 perc lett, nem egy beállás.** A gól/gólpassz-arány
eddig meccsre osztott, tehát a hajrában becserélt ember egyetlen góllal 1,0-s
rátát mutatott — ugyanazt, amit egy végigjátszott mérkőzésen gólt szerző
csatár. Ugyanaz a torzítás, amit a percküszöb kiüt, csak ez az ÁRBAN jelent
meg. *(Ez a kérésen túlmutató, de vele egy irányba mutató kiegészítés — a
„felskálázás percekkel" enélkül félkész maradt volna.)*

---

## 5. Az edzői rutin — percben, lassabban

`coachRoutinePts` teli pontja **420 meccs → 50 000 perc** (≈556 teljes
mérkőzés), a csökkenő hozam (`^0.75`) változatlan.

**MÉRVE:**

| játékidő | rutinpont (max 20) |
|---|---|
| 3600 perc (40 meccs) | 2,78 |
| 37 800 perc (a régi 420 meccs) | **16,22** (régen 20,00) |
| 50 000 perc | 20,00 |

---

## 6. A régi mentések

**Percadat nincs bennük, és visszamenőleg nem is lehet kitalálni** — a motor
eddig nem gyűjtötte. A korábbi meccseket ezért **teljes értékűnek** vesszük
(×90): a régi szabály szerint egy meccs egy meccs volt, tehát aki eddig piacra
vihető volt vagy edzőnek jogosult, az marad is.

A pótlás a **betöltéskor egyszer, véglegesen** megtörténik, és nem a
lekérdezőben. Ez nem stílus kérdése: ha csak a lekérdező pótolna, az első új
meccs `cs.min = (cs.min||0) + perc` sora **nulláról** indulna, és a játékos
elveszítené a teljes múltját.

**MÉRVE:** egy 40 meccses, percadat nélküli bejegyzésből 3600 perc lesz, és
`m90 === matches` — vagyis a kikiáltási ár **egy forinttal sem változik**.

---

## 7. Hol látszik

A HUB játékos-lapján a **„Játékperc"** cella közvetlenül a „Meccs" mellett áll —
nem helyette. A kettő **különbsége** a lényeg: 40 meccs 300 perccel egészen más
ember, mint 40 meccs 3600 perccel.

A piacra-bocsátás gombja a hiányzó perceket írja ki („még 312 perc kell
(188/500)"), és az alatta álló sor kimondja, miért percben mérünk.

---

## 8. Élesben mérve

Egy végigjátszott idény (`tools/sargalap-proba.js` ugyanazt a szezont méri):

```
Hisén:               2700 perc / 30 meccs = 90,0 perc/meccs
Vernerfia:           2610 perc / 29 meccs = 90,0
Nílsffy Szabolcs:    2490 perc / 28 meccs = 88,9   ← lecserélve
Strömbérg:           2460 perc / 28 meccs = 87,9   ← lecserélve
Madách:               115 perc /  2 meccs = 57,5   ← beállóként
Balogh:                90 perc /  1 meccs = 90,0
```

A végig játszó kezdőnél a perc/meccs pontosan 90,0; a cserélt embereknél és a
beállóknál a tört rész is látszik. A `share`-ből számolt percek tehát tényleg a
valóságot követik — és pontosan ez a különbség az, amiért az egész átállás
történt.
