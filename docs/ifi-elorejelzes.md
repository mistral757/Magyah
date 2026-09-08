# 🔮 Ifi-előrejelzés a felajánlásban (3.9.52)

Kimondott kérés:

> „az egyik junior developerrel beszélgetve jött fel az ifik kérdése. vele
> beszélgetve jutott ez eszembe: építsük be és legyen benne az ifit felajánló
> üzenetben is az adott játékos potenciálja ilyen szezonokra bontva,
> figyelembe véve a kezdő TSIt, kort, kezdő ratingot. és egy játékost egy
> szezonban csak egyszer ajánljon fel visszatérőként"

és rögtön utána, a mérce pontosítása:

> „fontos, mindig a felajánlás pillanatában lévő legjobb 11 rating átlagjához
> legyen mérve"

---

## 1. A döntés: ne legyen második képlet

Az ifi-fejlődés eddig két helyen zajlott, és mindkettő a játék belsejében:
minden meccs után egy edzéslépés (`processAcademyDevelopment`), szezonváltáskor
egy öregedési lépés (`advanceCareerSeason`). Egy előrejelzéshez a legkézenfekvőbb
út az lett volna, hogy írunk rá egy **közelítő képletet**.

Nem ezt tettük. Egy párhuzamos képlet ugyanis attól a naptól kezdve **hazudik**,
amikor valaki a valódi fejlődési görbén igazít, és a másolatról megfeledkezik —
és pont egy ilyen szám az, amit a játékos elhisz, mert számjegyekben áll előtte.

Ehelyett a két számtani mag **kikerült külön függvénybe**:

| függvény | mit csinál | ki hívja |
|---|---|---|
| `academyMatchStep(entry, tsiVarhato)` | egy meccsnyi akadémiai edzés | az éles fejlődés ÉS a jóslás |
| `careerAgeStepCore(entry, ageSkipped)` | egy szezonnyi öregedés + csúcskorrekció | a szezonváltás ÉS a jóslás |

Az `academyProject(entry, szezonok)` így nem *becsül*, hanem **előrejátszik**:
klónoz egy játékost, lefuttat rajta `ACADEMY_PROJ_MATCHES` (30) meccslépést,
utána egy öregedési lépést — szezononként, legfeljebb háromszor, vagy a
ballagásig (`ACADEMY_GRADUATE_AGE`).

A `tools/ifi-elorejelzes-proba.js` pont ezt az egyezést őrzi: lejátszik egy
szezont élesben, előrejelez egy szezont, és a kettőnek kor–rating–TSI hármasban
egyeznie kell.

## 2. Miért determinisztikus

Az egyetlen pont, ahol a jóslás eltér az élestől, a TSI-ugrás. Élesben ez
dobókocka: `ACADEMY_TSI_CHANCE` (3%) eséllyel 200–800 pont. Az előrejelzésben
ugyanennek a **várható értéke** megy be (`ACADEMY_TSI_AVG`, 500), tehát a
`tsiVarhato` kapcsoló nem külön logika, csak a kocka kikapcsolása.

Enélkül ugyanaz a fiatal minden újranyitáskor mást mutatna — és egy jóslat,
ami villog, rosszabb, mint a semmi.

## 3. A mérce: a LEGJOBB 11, nem a felállított kezdő 11

Egy „19 évesen 76-os rating" szám önmagában néma. A viszonyítás adja az
értelmét, és a viszonyítás **`academyBest11Avg()`**: a teljes keretből
(`fullCareerRoster()`) a `pOvrDisplay` szerinti **legjobb tizenegy átlaga**,
a felajánlás pillanatában.

Szándékosan nem a pályára küldött kezdő tizenegy: a felajánlás egy taktikai
kísérlet vagy egy sérüléshullám közben is beeshet, és olyankor a fielded XI
átmenetileg jóval gyengébb — a fiatal pedig hamis fényben tűnne fel. És
szándékosan nem a keretátlag sem, mert azt a kispad alja lehúzza.

A címke (`academyProjTag`) a különbségből születik:

| eltérés a legjobb 11 átlagához | címke |
|---|---|
| **+3** vagy több | *a legjobb 11-ed fölött* |
| **−1 … +3** | *legjobb 11-es szint* |
| **−4 … −1** | *a legjobb 11-ed alatt* |
| **−4 alatt** | *még messze* |

## 4. Mit lát a játékos

A felajánló kártya alján egy blokk (`.acProj`), fejlécében a mérce:

```
HA AZ AKADÉMIÁN HAGYOD · a legjobb 11-ed átlaga 75.8

most         66 · 17 év · TSI 5600
+1 szezon    70  +4 · 18 év · TSI 6050 · még messze
+2 szezon    76 +10 · 19 év · TSI 6500 · legjobb 11-es szint
+3 szezon    81 +15 · 20 év · TSI 6950 · a legjobb 11-ed fölött
```

A blokk csak a **felajánláskor** jelenik meg — a ballagási (`isFinal`)
kártyán nem, mert ott már nincs mit eldönteni.

## 5. Amit a jóslás szándékosan NEM tartalmaz

- **kupameccseket** — csak a bajnoki menetrend hosszával számol,
- **boostot** — az a te pénzed, nem a fiatal adottsága,
- **szerencsét** — a TSI-ugrás várható értéke megy be, nem egy jó sorozat.

Mindhárom kihagyás **ugyanabba az irányba** hibázik: a valóság inkább lesz
jobb, mint a szám. Ezért áll a blokk alján, hogy ez **nem ígéret** — egy
játékos, aki alálő és bejön, megbízható; egy, aki ígérget, egyszer használható.

## 6. Egy szezon = egy ajánlat

A visszatérő ifiket eddig a `tryAcademyOpportunity` szabadon újrahúzhatta, így
ugyanaz a név egy szezonon belül többször is bekopogott — ami az új
előrejelzéssel együtt kifejezetten zavaró lett volna (ugyanaz a táblázat,
újra és újra).

A `rec.offerSeason` bélyeg zárja le: a merítés csak azokra szűkül, akiket az
aktuális szezonban (`S.seasonNumber`) még nem ajánlottunk fel, és a kiválasztott
azonnal megkapja a bélyeget. Az `academyKeep` is ráüti, amikor egy fiatal az
akadémián marad — így a döntés utáni pillanatban sem jöhet vissza ugyanazon a
szezonon belül.

A **ballagás ettől függetlenül garantált**: a 21. életév a `rec.offerSeason`-től
függetlenül kiadja a játékost, tehát senki nem ragadhat bent a szabály miatt.
