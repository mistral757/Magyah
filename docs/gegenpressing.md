# 🧲 Gegenpressing — a nyolcadik filozófia (3.9.93)

> **KIMONDOTT KÉRÉS:** „Új csapatstílus: Gegenpressing (ha jól írom)" — és
> utána kilenc képesség, három szerep, a mérföldkövekkel és minden mással
> együtt rám bízva.

Igen, jól írod: `Gegenpressing`, egy szóval, két „g"-vel.

## 0. Mi ez, és miben más a többinél

Ez az első filozófia, ami **nem a labdáról szól**, hanem arról a pillanatról,
amikor **nincs nálad**. A többi stílus a saját játékát méri (gól, tiszta lap,
passz, sebesség); ez azt, hogy mit csinálsz a labdavesztés utáni öt
másodpercben.

Ezért kap **saját motor-csatornát**: a **labdaszerzést az ellenfél térfelén**.
Ez a csatorna eddig nem létezett. A motor kétféle védekezést ismert:

* a **védekezés-szorzót** (`defMult`) — mennyi gólt kapunk, egyetlen számba rejtve;
* a **védekező villanást** (blokk, szerelés, tisztázás) — a hátsó sor eseményeit,
  a saját tizenhatos környékén.

A pressinggel szerzett labda egyik sem: az **elöl** történik, és nem azt mondja
meg, mennyit kapunk, hanem azt, hányszor kerülünk gólhelyzetbe a semmiből.

A könyvelés **névre szól** (`mPress`), mint a védéseké és a szereléseké — a
mérföldkövek, a meccsértékelés és a szerepek mind ebből olvasnak.

## 1. A kilenc képesség

| # | képesség | sáv | mit csinál |
|---|---|---|---|
| a | **Nyomásgyakorlás** | I. | megnyitja a saját motor-csatornát (~2,0 / 2,8 / 3,6 labdaszerzés meccsenként), és **kinyitja a védekező képességeket a középpályásoknak és a csatároknak is**; a 2-3. szinten ezek a skillek +33% / +66%-kal többet érnek |
| b | **Büntetés** | II. | az odafent szerzett labdából gól lesz: **25% / 33% / 50%**, meccsenként legfeljebb **2 / 2 / 3** |
| c | **Gyilkos páros** | III. | a **negyedik kötésfajta** — lásd lentebb |
| d | **Felfutások, visszazárások** | II. | a védők gól- és gólpassz-esélye **+5 / 7,5 / 10%**, a középpálya és a támadósor labdaszerzése ugyanennyivel |
| e | **Kikényszerített hiba** | II. | az **ellenfél** öngóljának súlya ×2 / ×4 / ×11 (+100 / +300 / +1000%) |
| f | **Nem kell nekünk labda** | II. | a filozófia **alkuja** — lásd lentebb |
| g | **Nyomás skill** | II. | megnyitja a saját képességet (lásd lentebb) |
| h | **Nyomásra hangolt sorsolás** | I. | a sorsolás a **Motor** és a **Nyomás!** felé tolódik (30 / 45 / 60%) |
| i | **Nyomás-iskola** + **Csillagozható nyomás** | II./III. | a gyorsasági és védekező képességek csillagozása olcsóbb, illetve gyakrabban ajánlott |

Mellettük a minden filozófiának járó **Kiosztott szerepek** (III.) és a
filozófus-edző, **Kloppanós Gyuri** (Jürgen Klopp, Gyors kontra).

### f) A „Nem kell nekünk labda" — és ami eddig hiányzott a motorból

A játék egyetlen képessége, ami **tudatosan ront egy mutatón**. Eladod a
labdatartást gólesélyért:

| szint | saját gólesély | birtoklás ára | **az ellenfél gólesélye** |
|---|--:|--:|--:|
| 1 | +5% | −20 pont | **+10%** |
| 2 | +12% | −12 pont | +6% |
| 3 | +20% | −5 pont | +2,5% |

A kérés pontosan látta, mi hiányzik: *„Ehhez az is kell, hogy a csökkent
labdatartás növelje az ő gólszerzési esélyüket, ez szerintem jelenleg nincs
benne a motorban."* Nem volt benne — a labdatartás a statisztikai képernyő
száma volt, a gólvárhatóság meg tőle függetlenül futott. Most **minden eladott
labdatartás-százalékpont fél százalékkal emeli az ellenfél gólvárhatóságát**
(`GP_POSS_TO_OPP`).

Ettől lesz a képesség **alku**, nem ajándék: az 1. szinten rossz üzlet, a 3.-on
jó. Ez a görbe a képesség lelke.

### c) Gyilkos páros — a negyedik kötésfajta

A képesség-kötés, a párkémia és a passzkémia mellé. Két **támadó vagy
középpályás** ember köti.

**Az építés (3.9.138 óta, a passzkémia mintájára).** A korábbi változat
NÉMÁN indította a párt: a meccs utáni léptetés az ábécében első jogosult párt
vette fel, és csak a kész pillanatában szólalt meg. Bejelentés: „Nem igazán
lehet jól követni… Automatikusan épül? Nekem kell építeni?” Mostantól:

1. **Az ajánlat:** a jutalmak egy része gyilkospáros-építés lesz. Ez saját
   dobás a párkémia és a passzkémia után (`gpDuoOfferP`): a passzkémia 26%-os
   alapja × 1 / 1,25 / 1,33 a képesség szintje szerint.
2. **A választás:** ha nincs épülő páros, a rendszer felajánl egyet (egy
   koppintás), de bárki kettőt kiválaszthatsz a jelöltek közül.
3. **A továbbépítés:** ha van épülő páros, azt építed tovább egy fázissal,
   vagy váltasz. A megkezdett fázisok megmaradnak, és a választóból
   folytathatók.
4. **5 fázis után a páros KÉSZ:**
   * **együtt presszingelnek:** ha *mindketten* pályán vannak, a csapat
     nyomásgyakorlása erősödik (+5 / 8 / 10%);
   * **együtt gyorsulnak:** ami az egyiket gyorsítja, az a másikat is viszi
     (edzés, személyi edző, boost, a „Nyomás!” képesség).
5. **Az összeérés:** a kész páros 15 / 12 / 8 közös meccs után ÉR ÖSSZE (a
   Laboratórium „Közös futás”-a rövidíti). Ekkor a sebességük kiegyenlítődik
   a jobbikra, azonnali ráadással (+2 / 4 / 6%).

A napló minden fázist, a kész állapotot és az összeérést is kimondja. A
képesség kártyája páronként mutatja, hol tart.

**A korlátok:**

- egy ember egy párosban lehet;
- egyszerre legfeljebb **három** kész páros élhet (`GP_DUO_MAX`), és ha ez
  betelt, nincs több felajánlás. Enélkül a pressing-szorzó korlátlanul
  halmozódna.

**Régi mentés:** a kész pár kész marad. A némán indult félkész pár a
haladásával arányos fázist kap (15 közös meccs = 5 fázis), és a választóból
folytatható.

### g) „Nyomás!" — az egyetlen posztfüggetlen képesség

A játék egyetlen skillje, amit **nem a poszt kategóriája szab meg**
(`anyCat`): a pressing nem poszt, hanem hozzáállás. Három dolgot ad:

* a **sebesség** attribútuma 50%-kal gyorsabban fejlődik;
* 50%-kal nagyobb eséllyel szerez labdát az ellenfél térfelén;
* a **gyorsasági képességek** hatása +25%-kal erősebb rajta.

**Zárolt** (`LOCKED_SKILL_IDS`): amíg a fán meg nem veszed, a pakliban sincs
benne. Ez nem kozmetika — enélkül más stílusnál is kihúzhatná a sorsolás, és
mivel senki nem volna rá jogosult, a jutalom **némán elveszne**
(`autoAssignSkill` üres jelöltlistára visszalép). Ezért mennek a húzások
mostantól a `skillDeck()` kapun át, nem a nyers `MAIN_SKILLS`-ből.

## 2. A három szerep

| szerep | belépő | gazda | hatás |
|---|---|---|---|
| 🎛️ **Irányító** | VKP vagy védő | **Rating + karizma** | a nyomásgyakorlás hatása ×1,06…1,25, és a taktikai illeszkedés |
| 🎣 **Lesi Puskás** | bárki | **sebesség és gólszerzés átlaga** | a Büntetés gólesélye ×1,10…1,40, plusz saját ráadás az ilyen gólokra |
| 🐁 **Mérgezett egér** | a keret **három leggyorsabb** embere | sebesség | saját labdaszerzés ×1,9…2,8 az első félidőben, ×1,25…1,55 a másodikban — **és a 70. perctől nő a sérülés-veszélye** |

Két újdonság a szerep-rendszerben:

* Az **Irányító** az első szerep, aminek a gazdája **nem egy attribútum**, hanem
  a Rating és a karizma együtt (`roleAttrOf` „ovrkar"). A Lesi Puskásé két
  attribútum átlaga („sebgol"). Mindkettő a meglévő gépezeten megy át, tehát a
  kártyán megjelenő „miért" ugyanaz a szám, ami a motorban hat.
* A **Mérgezett egér** az egyetlen szerep, aminek **ára van**. A belépője is a
  legszűkebb az egész játékban.

## 3. Mérföldkövek

A gerinc az **odafent szerzett labda** (12 fokozat, 20-tól 4200-ig), mellette
idényes és mérkőzésenkénti csúcs, a **pressinggól** (12 fokozat), a keret
sebessége (egyéni csúcs és kezdő-11 átlag), a saját képesség és a saját kötés
lépcsője. Egyszeri nagy pillanatok: a rendszer 90%-os illeszkedése, „A
középpálya a leggyorsabb", és **„A kapusnak nem volt dolga"** (győzelem kapott
gól nélkül, legalább három odafent szerzett labdával). Öt kezdő fokozat, hogy
a fa az első idényben is elinduljon.

## 4. Hangsúly-csúszkák

Öt kétvégű csúszka, saját csatornával (`gppress`): **Védelmi vonal magassága**,
**A pressing ritmusa** (első félidő ↔ hajrá), **Belépő keménysége** (lapok ↔
labdaszerzés), **Ki fejezze be?** (középpálya ↔ csatárok), **Mennyit bírunk?**
(sérülés ↔ labdaszerzés és fejlődés).

## 5. Ami párharcban nem sül el

A **labdaszerzés** párharcban is fut — nem mozdítja az állást, tehát a két
kliens nem csúszhat szét tőle. A belőle születő **gól** viszont már az
eredmény, azt pedig a közös eseménylista adja (v3), ezért az elmarad. Ugyanaz
az elv, mint a tizenegyesnél, a supersubnál és a 90+ drámánál.

## 6. A próba

`node tools/gegenpressing-proba.js` (9041-es port) — 40 állítás: a
regisztráció minden táblában, a kilenc képesség és a szintjeik, a
pressing-motor, a Büntetés számai, az alku **mindkét** fele, a zárolt skill, a
három szerep belépőivel és származtatott gazdáival, a gyilkos páros teljes
életciklusa (összeérés, kiegyenlítődés, közös fejlődés, a „mindketten pályán"
feltétel), és a legfontosabb: **más filozófiában egyetlen szám sem mozdul.**
