# 🎯 A kihívás-katalógus átszabása (3.9.37)

Kimondott panasz:

> „A kihívásokkal nem vagyok elégedett. Amiket sosem választanak a játékosok:
> teljesíts x db mérföldkövet · csereembereid rúgjanak x gólt · győzz le x db
> rivális ellenfelet · adj el egy 32 év fölötti játékost és hozz egy 25
> alattit · új taktika 81% fölöttire emelése"

Öt kihívás, egy közös hibával: **nem a menedzser döntését mérték.**

---

## 1. „Teljesíts x db mérföldkövet" → **egy konkrét, karnyújtásnyi mérföldkő**

Nyolcvan mérföldkő közül a „3 darab" nem feladat, hanem lottó: nem mondja meg,
mit kell csinálni, és azt sem, hogy a nyolc meccses ablakban egyáltalán
teljesíthető-e bármelyik.

Az új `msOne` **egy, névvel megnevezett** mérföldkőre szól, és csak olyat kínál,
ami mérhetően közel van — a saját haladása (`msProgressOf`) a nehézséghez
tartozó sáv fölött áll:

| nehézség | a mérföldkő haladása legalább |
|---|---|
| Könnyű | 85% |
| Közepes | 72% |
| Nehéz | 55% |

Kimarad a már teljesített, a **beragadt** (zárt kategóriában álló — ott a
haladás nem mozdul, tehát a kihívás teljesíthetetlen volna) és a 0%-on álló.
A leírás kiírja, hol tartasz, tehát a vállalás előtt látod, mit vállalsz.

> **Miért nem szimulációból jön a küszöb**, mint a győzelem-céloknál: a nyolcvan
> mérföldkő nyolcvanféle mértékegységben mér (meccs, gól, pénz, szezon,
> szurkoló) — közös modelljük nincs. A haladás-**százalék** viszont
> mindegyiknél ugyanazt jelenti, és ez a kihívás egyetlen kérdése.

## 2. „Csereembereid rúgjanak x gólt" → **csereperc + csere-csillag**

A cseregól hármas véletlen (bejön-e, kap-e labdát, betalál-e), és a menedzser
döntése alig hat rá. Amit **viszont** eldönt: mennyi percet ad a padnak, és
milyen embert küld be.

* **`subMinutes`** — „A cseréid játsszanak összesen X percet." A kezdőrúgáskori
  11-en kívül pályára lépők percei adódnak össze. Nyolc meccsre 200 / 340 / 480
  perc, az ablak hosszával arányosan, **1000 perces szezon-plafonnal** (a
  lineáris skálázás 30 fordulón 1800-at kérne — meccsenként hatvan percnyi
  cserét, vagyis kötelező félidei kettős cserét).
* **`subStars`** — „Legyen X cserejátékosod, aki **kiemelkedő** estét fut."
  A küszöb pontosan az a fokozat, amit a meccs utáni ablak kiír
  (`MSTAT_GRADES[9]`), nem egy külön szám.

> A célt itt **nem** a kalibráló szimuláció adja, és ezt ki kell mondani: a
> szimuláció a MOTORT modellezi (gól, védés, eredmény), a csereperc viszont
> tisztán a menedzser szokása — hány embert cserél és mikor. Erre nincs
> modellünk, és egy kitalált modell rosszabb volna, mint egy őszinte sáv.

## 3. „Győzz le x rivális ellenfelet" → **mérő elöl, és fedezet-kapu**

A panasz: *„sokszor van hiba, pl. hogy a határidőn belül nincs elegendő ilyen
ellenfél már a kihívás pillanatában sem."*

A jelöltszám eddig is ott állt — de a **szabály-szöveg végén**, ahova a
vállalás előtt senki nem olvas el. Két változás:

1. a jelöltszám a **címbe** került: *„Győzz le 2 rivális erejű ellenfelet 8
   meccsen belül (5 jelölt vár)"*;
2. a `challengeOfferSane` közvetlenül a felajánlás előtt **újraszámolja** a
   hátralévő sorsolást a határidőig, és **tartalékot is kér**: a célnál eggyel
   több jelölt kell. Egy meccset el szabad veszíteni anélkül, hogy a kihívás
   matematikailag lehetetlenné váljon.

Mérve: rivális nélküli mezőnyben 400 sorsolásból **nulla** skalp-ajánlat.

## 4. „32 fölött el, 25 alatt be" → **sorsolt sávok**

A rögzített sáv mindig ugyanaz az egy feladat volt, ugyanazzal a két emberrel a
keretben. Innentől **eladás 29–32 fölött, igazolás 24–28 alatt**, ajánlatonként
újrasorsolva.

Ehhez a két számláló (`chSoldOver32` / `chBoughtUnder25`) helyébe két **életkor-
lista** lépett (`chSoldAges` / `chBoughtAges`), a kihívás pedig feljegyzi a
vállaláskori hosszukat. Így bármelyik sávra pontosan mérhető a haladás, és a
vállalás előtti üzletek itt sem számítanak. *(A régi két számláló megmaradt: a
futó mentésekben elvállalt példányok ne álljanak meg némán.)*

## 5. „Emelj egy új taktikát 81 fölé" → **játssz 15 meccset vele**

A begyakorlás lassan, a **használattal** nő — a „81 fölé" tehát valójában egy
meccsszám volt, csak kimondatlanul, és a játékos nem tudta kiszámolni, hány
meccsre vállalkozik.

Az új `tacticMatches` azt kéri, ami a dolga: **15 meccs egy új taktikával egy
szezonban.** Látható, számolható, és a haladás-sáv is értelmes lesz (7/15).

**A jutalom maga a begyakorlás:** a 15. meccs után a taktika **81-re** ugrik —
ha viszont már **80 fölött** állt, **86-ra**, mert 81-re emelni ott büntetés
volna, nem jutalom. A jutalom mindig azt a taktikát emeli, **amivel
teljesítetted**, sosem a vállaláskorit.

## Ráadás: a hátsó sor estéi

A kérés 2. pontjából előrehozva, mert ugyanaz a számláló hajtja, mint a
csere-csillagot: **`defStars`** — „A védőid érjenek el X kiemelkedő
meccsértékelést."

A cél a **saját, ebben a szezonban mért ütemedből** jön (kiemelkedő védő-este /
meccs), az ablak hosszára vetítve: a Könnyű a mostani ütemed háromnegyedét
kéri, a Közepes annyit, a Nehéz harmadával többet. Amíg nincs mérhető előzmény,
a kérésben megadott 6–12-es sáv a tartalék.

A tiszta lap **nem** feltétel: egy 2-2-n is lehet valaki a pálya legjobbja.

---

## A kivezetés szabálya

A `msDone`, a `subGoals` és a `tacticLevel` **új ajánlatban többé nem születik**,
de a `challengeRawValue` ága szándékosan megmaradt: a futó mentésekben már
elvállalt példányok a határidejükig normálisan kiértékelődnek. Ugyanaz a
kivezetés, mint annak idején a párkémia-kihívásnál.

## A próba

```bash
node tools/kihivas-proba.js
```

Tizennyolc állítás: a kivezetett típusok nem születnek újra · mind a hat új
típus megszületik · a célok értelmes sávban · a haladás csak a vállalás utáni
eseményeket méri · a `msOne` csak közeli, sosem kész vagy beragadt mérföldkövet
ajánl · a nehéz sáv tágabb, a könnyű szűkebb · a `renewOld` sávja tényleg
sorsolt, és a sávon kívüli kor nem számít · a taktika-jutalom 60→81 és 82→86,
az aktív taktikát sosem emeli · rivális nélküli mezőnyben nincs skalp-ajánlat.
