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

---

# 🧩 Második kör: új kihívások, büntetések, jutalmak (3.9.37)

## 6. Kilenc kihívás az új motor-elemek begyakorlására

Kimondott kérés: *„az új játékmotor elemek begyakorlását segítő kihívások"*.
Ezek nem az EREDMÉNYT mérik, hanem azt, hogy hozzányúlsz-e egy rendszerhez,
amit különben sosem nyitnál ki. **Egyikhez sem kell szerencse.**

| típus | mit kér | horgony a motorban |
|---|---|---|
| `tensionOut` | szabadulj meg attól, aki feszültséget okoz az öltözőben | az öltöző-napló `pos:false` eseményei — aki a legtöbbször szerepel bennük |
| `youthListed` | kínáld piaci eladásra az egyik 20 év alattidat | `SALE_LIST_MIN_MINUTES` (500 perc) — az élő mondat kiírja, ki áll a legközelebb |
| `bondBoostNew` | boostold egy **érkező** összjátékát | `bondIntegrating()` — ugyanaz a kapu, amit a felület „érkező"-nek jelöl |
| `staffFromPlayer` | hívd meg a saját játékosodat stábtagnak | `COACH_MIN_MINUTES` (2000 közös perc) |
| `trainFocus` | válts az edzés vagy az összhangépítés fókuszán | `trainingChangeUsed` / `bondTrainChangeUsed` |
| `integrationDone` | vidd 8/8-ra egy játékos beilleszkedését | `bondRevealNew()` — az ablak lezárása |
| `staffBought` | vásárolj stábtagot (9 meccses határidő) | a stábpiac vásárlási útja |
| `looksSpent` | használd fel az összes felderítést | `S.twWindow` / `S.summerLooks` `left` mezője |
| `cheapReservesOut` | ne maradjon 1 Mrd alatti gyors eladási árú tartalékod | `sellValue()` az `extraRoster`-en |

A `tensionOut`, a `youthListed`, a `looksSpent` és a `cheapReservesOut`
**állapot-kihívás**: a MOSTANI helyzetet kérdezi, nem a vállalás óta elért
növekményt.

## 7. Nyolc új büntetés — a mozgásteret szűkítik, nem a keretet csonkítják

| büntetés | mérték | hol hat, egyetlen helyen |
|---|---|---|
| a szerepek nem működnek | 3 meccs | `roleStyleActive()` — a szerepek **minden** hatása ezen kérdez rá |
| lassul az összhangépítés | 8 meccs, ×0,5 | `bondMatchTick` tempó-szorzója |
| a legerősebb pár elidegenedik | −10 összhang | `bondAdd` a legerősebb páron |
| nem te célzod a skilleket | 15 / **30** meccs | `grantSkillDecide` — a rendszer egyetlen kézi kapuja |
| a másodlagos edzés befagy | egy szezon | a `_tr.sec` sáv kimarad |
| nehezebben indul az üzlet | 5 tárgyalás | a tárgyalás `cleanCut`-ja |
| elveszítesz egy stílus-képesség-szintet | 1 szint | `styleState().traits` |
| egy stábtag elköszön | mindig a **leggyengébb** | `staff()` legkisebb `sz` |

> A „mindig a leggyengébb megy" **szándékosan nincs kimondva** a büntetés
> leírásában: a „valakit elveszítesz" feszültsége a lényeg, a megnyugtató
> „úgyis a legrosszabbat" elvenné. A kód viszont kimondja, hogy a következő
> olvasó ne higgye véletlennek.

Az egyetlen keret-csonkító büntetés (`losePlayer`) továbbra is csak
hosszú + nehéz vállalásnál jön.

## 8. Tizenhat új jutalom

**Ingyen boostok** (fajtánként külön zseton): sima · attribútum · összhang ·
skill *(csak realisztikus skill-módban — laza módban a sorsolási súlynak
nincs mit befolyásolnia)*. Az ár a `boostPriceOf`-ban lesz nulla, nem a
fizetésnél: így a katalógus, a fedezet-ellenőrzés, a megerősítő ablak és a
levonás **mind ugyanazt a számot látja**.

| jutalom | mérték | hol hat |
|---|---|---|
| könnyebb üzletkötés | 3 tárgyalás | a tárgyalás `cleanCut`-ja (±0,14) |
| edzés-hatékonyság | +50%, 15 meccs | a tervezett edzés fő+mellék sávja |
| a kinyitott ifi | 250 perctől piacra vihető, feleakkora tapasztalat-küszöb | `saleListBlock` + `saleExposure` |
| kikiáltási ár-padló | 3 kirakat, a teljes érték 90%-a | `saleAskPrice` — a **tapasztalat-csonkítást** kapcsolja ki |
| taktikai illeszkedés | +2–7 pp, tartós | ugyanaz a pp-csatorna, mint a Box-to-box szerepé |
| begyakorlás | +1, tartós | `S.tactics.levels` |
| sebességplafon | egy névre, tartós | `speedCap(name)` — ugyanaz a sor, mint a stílus-traité |
| mesterhármas-esély | +2–7%, tartós | a gólsúly szorzója, **csak két gól után** |
| a legerősebb védő | +25–50% értékelés, 10 meccs | a KÉSZ `star` érték a `mstatCompute`-ban |
| a kapus formája | +2–5 formapont | `entry.formPoints` |
| sárgalap-esély | −15–25%, tartós (plafon 40%) | a csapat lapesélye |
| sérülés-gyógyítás | 1 zseton, nem jár le | lásd lent |
| a következő vásárlás | −25%, a sikeres vásárlásig | `buyPrice` — garancia, nem esély |

### A sérülés-gyógyítás

A zseton **nem jár le**, ezért nincs külön „elraktározás": a nemet mondás
egyszerűen nem költi el. A felajánlás a **meccs után** jön, nem a sérülés
pillanatában — egy futó közvetítés közepén felugró kérdés a mérkőzést
szakítaná félbe, és a döntéshez amúgy sincs mit hozzátenni. Utána bármikor
elsüthető: a HUB keretlistáján a „⚕ sérült" jelzés **gombbá válik** (arany
kerettel, „⚕️ gyógyítás!" felirattal), és koppintásra megerősítést kér.

**Eltiltásra sosem** — egy piros lapot nem lehet gyógytornával leülni.

## A célpont a kifizetéskor dől el

A jutalmak egy része egy emberre szól („a leggyorsabb játékosod", „a
legerősebb védőd"). A nevet **szándékosan nem** a felajánláskor választjuk ki:
a kihívás nyolc–harminc meccsig fut, közben eladhatod, kieshet, jöhet nála
jobb — egy előre rögzített név gyakran már nem is volna a keretben.

## A próba kibővült

`node tools/kihivas-proba.js` — **44 állítás.** A második kör lényege:
**minden jutalmat és minden büntetést elsütünk, és megnézzük, hogy a hozzá
tartozó állapot tényleg megváltozott-e.** Egy jutalom, ami nem csinál semmit,
rosszabb, mint ha nem létezne: a játékos kipipálja, és nem érti, miért nem
változott semmi.
