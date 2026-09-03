# KÖZÖS KARRIER — A SZEZONZÁRÁS

**Állapot:** ✅ megvalósítva · **Verzió:** 3.4.01 – 3.8.35

Ez a dokumentum a közös (két menedzseres) karrier szezonzárását írja le: hol
állnak az **ellenőrző kapuk**, mit csinál a **hangolás**, és hogyan megy a két
klub **együtt** Európába.

---

## 0. A szezonzárás menete

```
30. forduló
   ↓
VERDIKT-KÉPERNYŐ  ──►  1. ELLENŐRZŐ KAPU  (bajnokság után)   ── 1. hangolás
   ↓
HUB → kupanevezés (mpCupGate: a JOBBIK kvalifikáció lesz a közös sorozat)
   ↓
KUPASOROZAT
   ↓  (hazai kupa győzelemnél: MK → KL lánc, közös döntéssel)
KUPA UTÁNI KAPU  ──►  2. ELLENŐRZŐ KAPU  (kupa után)         ── 2. hangolás
   ↓
SZEZONJELENTÉS (advanceCareerSeason: itt lép a szezonszám)
   ↓
HUB → következő idény
```

Kupasorozat nélkül **egy** kapu és **egy** hangolás van — minden marad a
régiben.

---

## 1. A két ellenőrző kapu (3.4.01)

A kapu ugyanaz a kérdés mindkétszer: **folytatjátok-e a hajszát?** A
folytatáshoz **mindkettőtök** igenje kell; ha bármelyikőtök a befejezést
választja, jön az összesítés és a végső ítélet.

| | 1. kapu | 2. kapu |
|---|---|---|
| **mikor** | a 30. forduló után, a verdikt-képernyőn | a kupasorozat lezárása után, önálló képernyőn |
| **kulcs** | `s<szezon>decision` | `s<szezon>decisioncup` |
| **állapot** | `S.mpDecision` | `S.mpDecisionCup` |
| **hangolás** | igen | igen, **újra** |

### Miért kellett a második

A verdikt a kupa **előtt** fut le: ott a sorozat eredménye még nem látszik, a
csapaterő pedig még a kupa előtti. Egy megnyert Konföranszié Líg viszont pénzt,
Champion-kártyát és egyéni díjakat hoz — a kép érdemben átrendeződik. Aki a
**teljes idény** ismeretében akart dönteni, annak eddig nem volt hol.

### Miért önálló képernyő, és nem a szezonjelentés alja

Volt egy korábbi kísérlet erre (`renderHubMpDuel`), a szezonjelentés alatti
dobozzal — és a gyakorlatban **soha nem nyílt ki**. Az ok szerkezeti: a
jelentés első lépése az `advanceCareerSeason()`, ami lépteti a szezonszámot és
üríti a párharc szezonhoz kötött állapotát (`S.mpMateFinal`, `S.mpDecision`).
Mire a doboz rajzolódott volna, a társ zárása már nem tartozott a futó
idényhez. A kapunak tehát a szezonzárás **elé** kell kerülnie — ugyanoda, ahol
a bajnokság utáni is áll.

A képernyő a `scVerdict`-et hasznosítja újra: ugyanaz a keret, ugyanazok a
gombok, ugyanaz a párharc-szekció. Csak a fejléc mondja meg, hogy ez már a
kupa utáni kapu.

### Két őr

* **A befejezés lezárja a 2. kaput.** Ha az 1. kapun bármelyikőtök a
  „befejezzük"-öt választotta (`mpRunStopped`), a 2. kapu nem kínál folytatást
  — csak az összesítést mutatja. Enélkül a második kapu **véletlenül**
  felülírhatná az elsőn kimondott döntést. *(A SZÁNDÉKOS visszavonás más
  kérdés, és 3.9.35 óta lehetséges — lásd az 1/b pontot.)*
* **A 2. kapu nem tud beragadni.** A gombja nem a következő szezonba visz,
  hanem a **szezonjelentésre** — a záró könyveléshez. Azt egy „befejezzük" sem
  tarthatja vissza, ezért ott a lezárult döntés is továbbenged.

---

## 1/b. A befejezés visszavonható (3.9.35)

Bejelentett hiba: *„ha PvPben véletlenül rányomsz hogy befejezzük itt, akkor
nincs visszaút. és nem kér megerősítést."*

**Mindkettő igaz volt, és a második okozta az elsőt.** A „Meggondoltam magam"
gomb **létezett** — csak elérhetetlen ágon. A döntés-doboz sorrendje ez volt:

```
1. mine==="continue" && mate==="continue"  → hangolás, indulhat a szezon
2. mine==="stop" || mate==="stop"          → záró összesítés          ← itt VISSZATÉRT
3. mine                                     → „Meggondoltam magam"     ← ide sosem jutott el
```

Aki tehát a **folytatást** választotta, kapott visszavonást; aki a
**befejezést**, az nem. Egy sor sorrend, és a legdrágább döntés lett az
egyetlen visszavonhatatlan.

### Miért volt visszavonható egyáltalán

A döntés **nem csinál semmit, csak jelöl**: `S.mpDecision = {season, mine,
mate}`, szezonra szólóan. Nincs mit visszacsinálni — a hangolás, a
történet-bejegyzés és a szezonléptetés mind a **kölcsönös igen** után fut. A
visszavonás ezért betűre ugyanaz, ami a folytatás-ágon eddig is volt: a saját
mező nullázása helyben és a szobában.

### A három szabály

* **A záró összesítés alatt is ott a gomb.** `mpUndoBox()` mindhárom ágra
  odakerül, nem csak a várakozóra.
* **A társ stopja nem akadály.** Ha ő is befejezte, a te visszavonásod
  egymagában nem indítja újra a hajszát — de a **saját szavadat** akkor is
  visszaveheted, és ha ő is visszavonja, a kapu újra kinyílik. Elzárni ezt azt
  jelentené, hogy a társad hibája a te karrieredet is véglegesíti.
* **A gomb hozza magával a kaput** (`data-gate`), nem a pillanatnyi
  `mpGateKind()`. A kupa utáni kapun a **bajnoksági** stop is visszavonható —
  pont ott derül ki, hogy elkattintottad —, és azt a jelen kapu kulcsával
  nullázni néma tévedés volna: a rossz mezőt törölné, a rosszat hagyná állva.

### A megerősítés

A „🏁 Befejezzük itt" mostantól kérdez, és a kérdés **kimondja, mi történik és
mi nem**: a karrier és a szoba megmarad, a döntés visszavonható. Ha a társ már
válaszolt, azt is kiírja — külön mondattal arra, ha ő a *folytatást*
választotta, mert ott a te igened az ő igenjét is elejti.

### A már elromlott mentés

A gomb tisztán **állapotból** jelenik meg, és a `phase==="verdict"` a mentés
része: egy olyan karrier, amelyben ez a hiba már megtörtént, betöltéskor
visszaáll a verdikt-képernyőre, és ott már ott a visszavonás. Nem kell hozzá
külön migráció.

**MÉRVE** (`tools/pvp-visszavonas-proba.js`): mind a hat döntés-állapot, a
kupa-kapus kereszteset (`data-gate="league"`), a megerősítő (megnyílik, a
kérdés alatt nem rögzül döntés, a „Mégsem" után sem), és hogy a visszavonás
tényleg törli a döntést nálunk **és** a szobában (`s3decision/host=null`).

Egyetlen állapot marad visszavonhatatlan: a **kölcsönös folytatás**. Ott a
hangolás már lefutott és a következő szezon nyitva áll — az más művelet volna,
nem ugyanennek a gombnak a párja.

---

## 2. A hangolás — kit érint (3.4.01)

Kölcsönös igen esetén a rendszer **1 OVR** különbségre hangolja a két keretet:
az erősebbét lefelé, a gyengébbét fölfelé, mindkét oldal a távolság felét téve
meg. Mindkét kliens ugyanazt a két számot ismeri, tehát az eredmény
szimmetrikus — nem kell hozzá „döntőbíró" oldal.

**A hangolás névre szól, nem a keret egészére.** Eredetileg egyetlen globális
szám volt (`S.mpBalance`); ettől viszont az ifiakadémiáról felhozott
tizenhetedik ember és a tartalék kapus is ugyanazt a büntetést vagy ajándékot
vitte, pedig a párharc a **kezdő csapatokról** szól.

> **A 3.7.24 ezt a szakaszt felülírta** — a mérce a keret 14 legjobb ratingű
> játékosa, a kör a 11 legnagyobb potenciálú, névre szólóan ±2-es plafonnal.
> Lásd **2b**. Az alábbi leírás a 3.4.01–3.7.23 közti állapotot rögzíti.

A kör **tizenöt ember**:

| | kik |
|---|---|
| **11** | a szezont vagy a kupasorozatot **lezáró kezdő tizenegy** |
| **+4** | posztonként egy-egy csere: a keretben **maradt legjobb TSI-jű** kapus, védő, középpályás és támadó |

**Miért a TSI, és nem a Rating.** A Rating a pillanatnyi forma és a boostok
összege (kártya, díj, épp futó eltolás), a TSI viszont a játékos tartós piaci
értéke — az mondja meg, ki a keret következő embere azon a poszton. Ráadásul a
Rating **már tartalmazza** a korábbi hangolásokat, tehát önmagára hivatkozna:
aki egyszer bekerült a körbe, azt a saját eltolása tartaná bent.

A kör a hangolás **pillanatában** dől el, tehát a két kapu akár eltérő névsorra
is írhat.

### Mérve

Egy 6 OVR-rel gyengébb kerettel, két kapun át:

| | eltolás | csapaterő | különbség |
|---|--:|--:|--:|
| kiindulás | — | 99,82 | 6,00 |
| 1. hangolás (bajnokság után) | +2,50 / 15 játékos | 102,32 | 1,00 |
| *közben: a társ a kupában erősödött* | | | 5,00 |
| 2. hangolás (kupa után) | +0,75 / 15 játékos | 103,07 | 1,00 |
| **kumulálva egy kezdőn** | **+3,25** | | |

A körön kívüli tartalékok eltolása mindkét lépés után **0** marad.

### Amit vállalunk

A régi, globális eltolás egyik előnye elveszett: az **igazolások és az
akadémisták már nem automatikusan a hangolt skálán élnek**. Egy frissen vett
játékos a saját, hangolatlan értékén lép be a keretbe. Ezt két dolog
ellensúlyozza: a hangolás **kapunként újra lefut** (kupás idényben kétszer), és
a kör minden alkalommal az **aktuális** kezdő tizenegyre és az aktuális
cserékre íródik — vagyis az új ember a következő hangoláskor magától bekerül.

**Régi mentés:** az `S.mpBalance` globális szám érvényben marad, és mindenkire
hat tovább. Egy futó karrier egyensúlya nem borulhat fel attól, hogy a
könyvelés módja megváltozott; az új hangolások viszont már a névre szóló
táblára (`S.mpBalanceP`) kerülnek.

---

## 2b. A MÉRCE ÉS A KÖR ÚJRAGONDOLVA (3.7.24)

*(Érintett kód: `mpRatedRoster` + `mpSquadStrength` (új), `mpMyStrength`,
`mpSeasonReport`, `mpMyFinalStrength`, `mpRecordHistory`, `mpTuneSquad`,
`mpTuneAdd`, `mpApplyBalance`, `mpBalanceOffset`, `MP_COMPARE_N` /
`MP_TUNE_N` / `MP_TUNE_CAP`.)*

Két külön kérdés van, és a 3.4.01-es rendszer mindkettőre ugyanazt a választ
adta — a **kezdő tizenegyet**:

1. **MIHEZ mérünk?** (ki áll jobban, mennyit kell hangolni)
2. **KIRE írjuk rá?** (kinek a Ratingje mozdul)

### A mérce: a keret 14 legjobb ratingű játékosa

A régi mérce a `teamStrength()` volt: a **mai felállás**, a posztjukon. Ez a
MECCSRE a helyes szám, az összevetésre viszont nem:

* egy meccs előtti átrendezés (pihentetés, sérült pótlása, kísérleti felállás)
  azonnal **mozdította a párharc mérlegét**, pedig a kereted ereje nem
  változott;
* a padon ülő 92-es sztár **nem számított bele**, a poszton kívül beugró
  tartalék viszont a fit-szorzóval **lehúzta** a számot;
* és mivel a hangolás is ezen mért, a két hatás egymást erősítette.

Mérve, egy valós kereten (Real Madrid 2011/12, 22 fő): a kezdőből kiül
Cristiano Ronaldo, beáll a harmadik kapus —

| | mérce |
|---|--:|
| régi (`teamStrength`, kezdő 11) | 86,18 → **82,27** |
| új (`mpSquadStrength`, top 14) | 85,93 → **85,93** |

A párharc a **keretről** szól, ezért a mérce mostantól a keret
`MP_COMPARE_N` = **14** legjobb ratingű játékosának átlaga — mindegy, ki a
kezdő. A rating itt a **kijelzett** szám (`pOvrDisplay`), pontosan az, amit a
keretlistán a kártyán látsz: poszt-illeszkedés nélkül, hiszen a pad és a
tartalék embereinek nincs is „posztjuk" a felállásban.

**Miért 14 és nem 11.** A kezdő tizenegy mellett a három legjobb tartalék az,
ami egy szezont ténylegesen kibír (sérülés, eltiltás, rotáció). Egy 11-es
mérce a mély keretet ingyen adná, egy 20-as a keret alját is beszámítaná.

Ugyanez a szám megy a szobába (`mpSeasonReport().stats.strength`), a közös
előzménybe (`mpRecordHistory`) és a nyári igazolási referenciába
(`mpFreezeSummerRef`) — a két oldal tehát végig egy skálán találkozik.

### A kör: a 11 legnagyobb potenciálú játékos

A régi kör a záró kezdő tizenegy volt + posztonként a legjobb TSI-jű csere.
Ez **menet közben mozgó névsort** adott (egy csere a 30. fordulóban átírta,
kit érint a hangolás), és a keret **öregedő végére** is rátolta az eltolást,
ahol a következő idényre már nem marad belőle semmi.

A kör mostantól a keret `MP_TUNE_N` = **11 legnagyobb potenciálú** játékosa.
A `playerPotential` egy számba fogja, mennyit ér a játékos MÉG EZUTÁN: a még
elérhető Rating-emelkedést (a fő tag), a nyers tehetséget (TSI) és a
fiatalságot. Vagyis pontosan azt a tizenegyet adja, aki a karriert **tovább
fogja vinni** — és ez a helyes cél, mert a hangolás nem a lezárult idényről
szól, hanem a következőről.

**Miért nem a Rating.** Változatlan az indok: a Rating már tartalmazza a
korábbi hangolásokat, tehát önmagára hivatkozna. A potenciál a `careerPool`
bejegyzéséből számol (peak, TSI, kor), amit a hangolás **nem ír** — a rangsor
tehát stabil.

**A kör és a mérce ÁTFED, de nem azonos**, és ez szándékos: a boost oda megy,
ahol a jövő van, a mérleg viszont a mai erőt méri. Egy körtag, aki nincs benne
a legjobb 14-ben (tipikusan egy akadémista tehetség), ratinget kap, de a mai
mérleget nem mozdítja — a hangolás így a **következő** idényben fizet.

### A plafon: ±2 rating, névre szólóan

Plafon nélkül a hangolás korlátlanul kumulálódott: aki három idényen át a
gyengébb oldalon állt, annál a kör ±6-8 ratinget is összeszedhetett, és a
Rating többé nem a játékosról szólt, hanem a könyvelésről.

`MP_TUNE_CAP` = **2**: egy embertől legfeljebb két ratinget vesz el a
rendszer, és legfeljebb kettőt ad neki — **összesen, kumulálva**, nem
kapunként. A plafon a **kiolvasásnál** is érvényes (`mpBalanceOffset`), nem
csak az íráskor: egy régi mentés túlnőtt tétele sem hat tovább kettőnél. A
tárolt szám érintetlen marad.

Ezért a hangolás célja (`MP_BALANCE_GAP` = 1 OVR) mostantól **cél, nem
garancia**. A hurok akkor is megáll, ha mindenki a plafonra ért — a felület
ilyenkor kiírja, mennyi maradt, és hogy a többit a pályán kell behozni. A
`mpApplyBalance` ezért `newGap`-ként a **ténylegesen elért** különbséget adja
vissza, nem a fix 1-et.

### Mérve

Ugyanaz a 22 fős keret, `mpSquadStrength()` = 85,93:

| eset | a társ | utána | elmozdulás | maradék rés | plafon | eltolás/fő |
|---|--:|--:|--:|--:|:-:|--:|
| a társ +3 | 88,93 | 86,93 | +1,00 | **1,00** | nem | +1,75 |
| én +3 | 82,93 | 84,93 | −1,00 | **1,00** | nem | −1,75 |
| a társ +20 | 105,93 | 87,21 | +1,29 | **9,22** | **IGEN** | **+2,00** |
| 0,4 OVR | 86,33 | 85,93 | 0 | 0,40 | — | — |
| régi mentés: tárolt +7,5 | | | | | | **érvényes +2,00** |

Az eltolás/fő azért nagyobb, mint az elmozdulás (1,75 vs 1,00): a 11 fős kör
közül csak nyolc van benne a legjobb 14-ben, tehát a mérce a kör lépésének
csak egy hányadát látja. A hurok ezért **mér, nem számol** — és túllőni nem
tud, mert a mérce mindig kevesebbet mozdul, mint a kör.

---

## 3. Magor Kupája → Konföranszié Líg, közösen (3.4.01)

Alacsonyabb sávban (Magyar Másodbajnokok) a **megnyert Magor Kupája Konföranszié Líg indulást
ér**, és azt még ugyanabban a szezonzárásban le is játsszuk.

**A hiba:** közös karrierben ez a lánc csak a **győztes** kliensén sült el. Ő
elindult a KL-be, a társa pedig a szezonjelentésre lépett tovább — a két
karrier egy egész kupasorozatra szétvált. Pedig a rendszer alapelve pont az,
hogy a **jobbik eredménye viszi mindkettőtöket**: a nevezésnél (`mpResolveCup`)
ez ki is van mondva — *„aki nem kvalifikált, azt a társa jogán visszük
magunkkal"*.

**A javítás:** a lánc is közös döntés lett, ugyanazon a mintán, mint a nevezés.
Mindketten felteszitek, megnyertétek-e a hazai kupát (`s<szezon>mkkl`), és ha
**bármelyikőtök** igen, **mindketten** indultok a Konföranszié Lígben. A
vesztes oldalon a napló ki is mondja, kinek a jogán.

**Miért nem elég a helyi jelző:** a kupát csak egyikőtök nyerheti meg (vagy egy
gépi csapat), tehát a vesztes oldalon semmilyen helyi állapotból nem derül ki,
hogy a lánc elsült — ehhez a társ eredménye kell.

**Ha megszakad a kapcsolat**, vagy a felhasználó nem várja meg az egyeztetést,
a saját eredményre esünk vissza — az pontosan a javítás előtti viselkedés,
tehát nem lehet rosszabb. Ilyenkor a két karrier tényleg szétválhat, és a
napló ezt ki is mondja.

---

## 4. Ami eddig NEM ért el a közös karrierbe (3.7.32)

**A bejelentés:** *„van egy csomó beállítás hagyományos módban, ami nincs
globálissá téve, és így PvP-ben nincs érvényesítve. Pl. PvP-ben nem ajánlotta
fel szezon végén, hogy lejátsszuk az osztályozót, hanem magának leszimulálta."*

A leltár három olyan hagyományos-módú funkciót talált, ami **egy sorral ki volt
kapcsolva** közös karrierben — mindhárom ugyanazzal az indoklással („a két
kliens világa szétcsúszna"), és mindhárom indoklás **részben** volt igaz.

| Funkció | Eddig MP-ben | Mostantól |
|---|---|---|
| ⚔️ Lejátszható osztályozó | soha nem ajánlottuk fel | **a páros közös párharca** |
| 🟠 Nyári felkészülési kupa | soha nem ajánlottuk fel | **közös, egyhangú nevezés** |
| 🏅 Bajnoki egyéni díjak | soha nem osztottuk ki | **a két keret között dől el** |

*(Ami szándékosan MARAD kikapcsolva: az **auto szintkövetés**. Az a SAJÁT
kereted erejéből számol új mezőnyszintet, tehát a két kliensen külön mozdítaná
a közös világot. A beállító képernyő ezt ki is mondja — nem hazug lakat: a
választó ott MP-ben el is tűnik.)*

---

### 4.1 Az osztályozó — a páros párharca

**Ami miatt ki volt zárva, és ami ebből igaz.** A két kliens világának bitre
azonosnak kell maradnia. A **párosítás** viszont már eddig is az volt: az
előnézet (`pyrPoPreview`) a KÖZÖS végtabellából (`mpTableNow` → `S.finalTable`)
és a szoba seedjéből épül, tehát mindkét gépen ugyanaz az ellenfél áll, ugyanazzal
az erővel. Egyedül a **kimenet** csúszhatna szét — és pont azt kell egyeztetni,
nem az egész mérkőzést elvenni.

**A páros EGY entitás a piramison.** A rollover a két menedzser-sort egyetlen
csapattá vonja össze, a **jobbik helyezésen** (`pyrMyFinalOrder`) — fel- és
lefelé is együtt mozogtok. Az osztályozó tehát nem a tiéd, hanem a **párosé**, és
ugyanaz a szabály vonatkozik rá, ami a közös karrier többi közös döntésére:

> **A jobbik eredménye viszi mindkettőt.**

* mindketten lejátsszátok a saját két meccseteket **ugyanaz ellen az ellenfél
  ellen** — a mérkőzés valódi: cserélsz, sérülsz, fejlődsz;
* ha **bármelyikőtök** megnyeri a párharcot, a páros feljut / bennmarad;
* aki a szimulációt választja (vagy auto szezont futtat), **nem szavaz**: ha a
  másik lejátszotta, az az eredmény áll; ha egyikőtök sem, marad a régi,
  szimulált út — betűre úgy, ahogy eddig volt.

**A történet is közös.** A két meccs eredménye, az összesítés és a döntés módja
EGY lejátszásból jön, determinisztikus választással: a **győztesé**, és ha
mindketten ugyanarra jutottak (vagy csak egy játszott), a **házigazdáé**. Így a
két képernyőn betűre ugyanaz a mondat áll, és a `pyrPoPlayedSwap` mindkét
oldalon ugyanazt cseréli be a fordulóba.

**Kulcs:** `s<szezon>pyrpo` · **kód:** `pyrPoJoint`, `mpPoResolve`, `mpPoApply`,
`pyrPoSettle`, `pyrPoResultScreen`.

#### 4.1b …és egy néma szétcsúszás, ami eddig is ott volt

A szimulált osztályozó a **te élő csapaterődből** számolt
(`teamMatchStrength`), az pedig kliensenként MÁS — vagyis a két gépen más
gólvárhatósággal futott le ugyanaz a párharc, és a páros az egyik oldalon
feljuthatott, a másikon nem. Ugyanaz a hibaosztály, amit a közös kupánál a
`str` átküldése már megszüntetett, csak a piramis oldalán — és eddig
észrevétlen maradt, mert a párharcot senki nem játszotta le.

**A mérce a szezonzáró érték, nem az élő:** a rollover a nyári
öregedés/fejlődés UTÁN fut, tehát az élő szám addigra mindkét oldalon
elmozdult. A zárás pillanata viszont EGY közös pont, és mindkét érték el van
téve (`S.mpMyFinal.matchStr` és a társ jelentésének `stats.matchStr` mezője).
A páros egy csapat, a piramison a jobbik helyezés viszi mindkettőt: a
párharcban ezért a **jobbik keret** áll ki (`pyrPairMatchOvr`).

Régi mentésnél vagy régi verziójú társnál nincs meg a mező — ott a régi, helyi
út marad, változatlanul.

---

### 4.2 A nyári felkészülési kupa — egyhangú nevezés

A „van-e kupátok" kérdés **már eddig is közös** volt: azt a kupanevezés kapuja
(`mpCupGate`) dönti el mindkettőtökre. A felajánlás feltétele tehát egyszerre
igaz vagy hamis a két gépen — a tornát mégsem ajánlottuk fel.

**Ami miatt ki volt zárva, és ami ebből igaz.** Egy **egyoldalú** torna tényleg
kettéválasztaná a nyarat — és nem is elsősorban a játékidő miatt: a kampány
lezárása állítja be a kupa utáni kapu jelzőjét (`S.mpCupSeason`), az pedig
átbillenti, MELYIK döntési rekeszt (`…decision` vagy `…decisioncup`) használja
a szezonzáró kapu. Ha csak az egyikőtök játszana tornát, a két kliens **két
különböző rekeszre** várna — a szezonzárás holtpontra futna. A tiltás tehát nem
a tornáról szólt, hanem erről.

**Ezért a nevezés közös döntés, és itt EGYHANGÚ:** csak akkor indul a torna, ha
mindketten igent mondtok.

**Miért nem „a jobbik viszi mindkettőt", mint máshol?** Mert itt az igen nem
jobb a nemnél: egy tétnélküli tornába (se trófea, se pénzdíj) nem lehet
belerángatni azt, aki nem kért belőle — és az auto szezont futtató fél nem is
tudná lejátszani. Így a két kliens vagy együtt lép a tornába, vagy együtt marad
ki; a kapu-jelző sosem csúszhat szét.

**Kulcs:** `s<szezon>nyk` · **kód:** `friendlyCupJoint`, `mpNykResolve`,
`friendlyCupSettle`.

#### 4.2b …és a torna maga is közös (3.7.36)

**A bejelentés:** *„nyári kupában, amikor nincs klasszikus sorozat, csak
felkészülési kupa, PvP módban, hagyományosban nem tett minket egy kupába."*

A 3.7.32 a **nevezést** tette közössé — a **tornát** magát nem. A
`friendlyCupStart` egyszerűen elindította a saját 32-es mezőnyét mindkét gépen:
két külön világ lett belőle, ahol sosem találkozhattatok. Pedig a nyár épp
attól nyár, hogy nincs más közös sorozat — ez az egyetlen, amiben
összekerülhettetek volna.

**A közös kupa gépezete készen állt, és sorozat-független.** A `mpCup` rekord
vezeti a seedelt mezőnyt, a kalapokat, az ágrajzot, a társ csapatát a 32
között és a kieséses ági találkozást — a `buildEuroField` és a
`startEuroCampaign` mindezt a `comp` betűjelére nézve intézi, nem a sorozat
fajtájára. A nyári tornát egyszerűen **nem kapcsolta bele senki**.

**A javítás pontosan ennyi.** A nevezés (`s<szezon>nyk`) mostantól magával
viszi azt a néhány számot, amiből a közös mezőny felépül — ugyanazokat a
mezőket, mint a tétmeccses kupanevezés (`mpCupGate`):

| mező | mire kell |
|---|---|
| `teamName` | a társ csapata valódi néven ül a mezőnyben |
| `ovr` | a **nyers** erő: ebből dolgozik a szimuláció és a mezőny célértéke |
| `str` | a **kijelzett** (boostos) csapaterő — csak a felületnek |
| `v` | verzió-egyeztetés: eltérésnél a napló azonnal kimondja |

A `mpNykResolve` ezért **már nem igen/nem**, hanem `null` (nem indul) vagy a két
nevezés együtt; igazként viselkedik, tehát a régi `if(go)` ág változatlanul jó.
Az eredményt a `mpNykJoinCup` írja be a `S.mpCup` rekeszbe (`comp:"NYK"`) —
**átírva**, nem eldobva azt, amit a kupanevezés kapuja `comp:null`-lal hagyott
ott, hogy a szezonra vonatkozó többi mezője érvényben maradjon.

**A mezőny célértéke.** Egyjátékosban az ígéret *„a te nyers csapaterőd mínusz
egy"* (`euroMidRating` felkészülési ága). Kettőnél ez a szám kliensenként más
volna, márpedig a közös kupa egyetlen garanciája, hogy a két gép **bitre
ugyanazt** a mezőnyt építi. A `mpNykSharedMid` ezért az **erősebb kerethez**
horgonyoz (annak a nyers erejéhez mínusz egy) — ugyanaz a döntés, mint a
tétmeccses `mpCupSharedMid`-nél: így a tornán a jobbik keretnek sincs
sétagalopp. A nevezési képernyő közös karrierben ki is írja ezt.

**Ami változatlan:** a torna továbbra sem ad semmit (se trófea, se pénzdíj, se
Champion-kártya, se arany-díj, se karrier-történet), a nevezés továbbra is
**egyhangú**, és a kapu-jelző (`S.mpCupSeason`) sem csúszhat szét — mindkét
kliens ugyanazt a kampányt játssza le, tehát ugyanakkor is zárja le.

**Kód:** `mpNykResolve`, `mpNykSharedMid`, `mpNykJoinCup`, `friendlyCupStart`.

---

### 4.3 A bajnokság egyéni díjai — a két keret között

Közös karrierben a három bajnoki díjat (gólkirály, gólpassz-király,
kapus-király) **soha nem osztottuk ki**. A szezon egyéni teljesítménye jutalom
nélkül maradt, és az Aranylabda szavazásából is kiesett egy egész bemenet.

**Ami miatt ki volt zárva, és ami ebből igaz.** A góllövőlista két forrásból
épül: a **két menedzser kerete** és a **gépi mezőny**. A gépi rész
kliensenként MÁS — a CPU-k egymás elleni párosítását a helyi menetrendből
fejtjük vissza (lásd `aiLeagueSchedule`) —, tehát a gépi góllövőlistát nem
lehet közösen koronázni. Ez igaz, és igaz is marad.

**Ami viszont igenis közös: a két menedzser kerete.** A sajátodat a saját
tábládból ismered, a társadét a szezonzáró jelentése hozza (`topScorer` /
`topAssist` / az új `topCS`) — és mindkét gépen ugyanaz a két jelölt áll
egymással szemben. Közös karrierben ezért a díj a **két keret között** dől el,
a gépi mezőny nélkül; a napló ezt ki is mondja.

**A holtversenyt a név dönti**, kódpont szerint (`a.n<b.n`), **nem**
`localeCompare` — az böngészőnként más sorrendet adhatna, és pont az a fajta
néma szétcsúszás lenne belőle, amit el akarunk kerülni.

**Régi verziójú társ:** ha a jelentésében nincs `topCS` mező, abban a
kategóriában nem koronázunk. Inkább maradjon el a díj, mint hogy a két gépen
más kapja.

**Kód:** `lgMateTop`, `lgKingOf`, `awardLeagueKings`; a jelentés új mezője
`stats.topCS`.

---

### 4.4 A kétoldali kapu közös mintája

Ugyanaz a koreográfia fut a kupanevezésnél, az MK → KL láncnál, az
Infinity-befizetésnél és a közös tabellánál: mindkét fél **feltesz** egy
bejegyzést a szoba egy rekeszébe, **várja** a másikét, és amikor mindkettő
megvan, egy **determinisztikus feloldó** (mindkét gépen ugyanaz a függvény,
ugyanazon a két bejegyzésen) kiadja a közös eredményt.

A két új döntés (`pyrpo`, `nyk`) ezt már nem másolja újra: az `mpBothGate`
burkoló adja a várakozó ablakot, az elhasalt feltöltés pótlását (`mpReput`), a
beragadt jelző feloldását (`mpWaitStuck`) és a „nem várom meg" kiutat.

**A kiút mindenhol ugyanaz:** ha nem várod meg az egyeztetést, a **saját**
döntéseddel megyünk tovább — az pontosan a javítás előtti viselkedés, tehát nem
lehet rosszabb —, és a napló ki is mondja, hogy a két karrier ilyenkor
szétválhat.

**A meglévő négy hívó szándékosan érintetlen:** azok élesben futó, kimért
kódok, és egy „takarítás" kedvéért nem érdemes hozzájuk nyúlni.

---

### 4.5 Mérés

A hálózati kézfogást két kliens nélkül nem lehet élesben lefuttatni, a
**feloldók** viszont tiszta függvények — azokat betűre ugyanazokkal a
bejegyzésekkel futtattuk le mindkét szerepben (host és guest nézőpontból), és
az eredménynek azonosnak kell lennie:

| eset | páros eredménye | a történet forrása | a két kliens egyezik? |
|---|---|---|---|
| mindketten játszottak, a host nyert | feljut | a hosté | ✔ |
| mindketten játszottak, a guest nyert | feljut | a guesté | ✔ |
| mindketten nyertek | feljut | a hosté | ✔ |
| mindketten vesztettek | marad | a hosté | ✔ |
| host játszott és nyert, guest kihagyta | feljut | a hosté | ✔ |
| host kihagyta, guest játszott és vesztett | marad | a guesté | ✔ |
| egyikőjük sem játszott | — (marad a szimuláció) | — | ✔ |
| VÉDŐ oldalon (`iAmCh=false`), egyikük nyert | bennmarad | a győztesé | ✔ |
| VÉDŐ oldalon, mindketten vesztettek | kiesik | a hosté | ✔ |

Egyjátékosban a feloldó **azonosságfüggvény**: ugyanazt adja vissza, amit a
lejátszott párharc kiszámolt (`played` → saját eredmény, `skip` → `null`,
vagyis szimuláció) — a régi út betűre változatlan.

A bajnoki díjak feloldója ugyanígy: egyjátékosban a gépi gólkirály nyer (mint
eddig), közös karrierben a két keret jobbika, régi verziójú társnál pedig a
kapus-király elmarad.

---

## 5. A HÁROM SKÁLA — ÉS AHOL ÖSSZEKEVEREDTEK (3.8.14)

**Bejelentett hiba:** *„nem működik jól az ellenfél felállásának megtekintése
és az ellenfél ratingjának kijelzése egymás elleni meccsnél. A szezonzáráskor
már stimmel a rating, a felállásnál ettől függetlenül nem jó értékek vannak."*

A bejelentés pontos volt, és a két fele **ugyanabból** jött: a közös karrierben
HÁROM különböző csapaterő-szám kering, és a párharc oldalán összekeveredtek.

| szám | mit mér | hol a helye |
|---|---|---|
| `teamOVRbase()` | **nyers csontváz** — `ovr × poszt-illeszkedés`, boost és skill-bónusz nélkül | a motor és a **tabella** közös skálája; a meccs utáni könyvelés (óriásölés, „nagy skalp") is ezen mér |
| `teamStrength()` | a **kezdő tizenegy** effektív ereje (`playerStrength` = poszt-effektív rating + tartós módosítók) | a felállásképernyő, az eredményjelző és a naplósorok |
| `mpSquadStrength()` | a **keret** 14 legjobbja (`pOvrDisplay`, poszt nélkül) | a **szezonzáró** összevetés és a kiegyenlítés (lásd 2b) |

### 5.1 Az eredményjelző és a párharc naplósora rossz skálát írt

A párharc pillanatképe MINDKÉT számot átküldi (`dispOvr` = a társ
`teamOVRbase()`-e a könyveléshez, `shownOvr` = a `teamStrength()`-e a
kijelzéshez) — de a fogadó oldalon `fx.o.ovr` a nyers, és `fx.o.dispOvr` a
kijelzett. A **kupaképernyő** és a kupa-mezőny már helyesen a `dispOvr`-t
használta; az **eredményjelző** (`sbPaintTeams`) és a párharc **naplósora**
lemaradt róla, és a nyerset írta ki.

A hatás következetes és egyirányú: a saját oldaladon a `teamStrength()` áll, a
társadén a nyers csontváz — **a társad rendszeresen gyengébbnek látszott, mint
amilyen** (jellemzően 3-5 ponttal). CPU-ellenfélnél ez nem jelentkezett: ott a
mezőny `ovr`-je *maga* a viszonyítási szint, tehát az összevetés szándékos.

Mindkét hely mostantól a `dispOvr`-t használja, ha van, és a naplósor **a te
számodat is odaírja**, hogy a kettő egymás mellett, egy skálán álljon.

### 5.2 A felállás-nézet számai

Két baja volt:

1. **A sáv és a korongok két különböző tizenegyről szóltak.** A `str` a
   `teamStrength()`-ből jött (a `slots` tizenegye), a korongokra viszont a
   pillanatkép `active` tizenegye került (a kényszerű cserékkel együtt). Sérült
   vagy eltiltott kezdőnél a kiírt átlag nem a látható emberekét adta.
   Mostantól a `str` **pontosan a kirajzolt korongok átlaga**.
2. **Csak egy mérce volt kint, és nem az, amit a felhasználó ismer.** A
   szezonzáró összevetés a `mpSquadStrength()`-en megy — a felállás-nézet
   viszont a kezdő tizenegyet írta ki, magyarázat nélkül. A két szám több
   ponttal is eltérhet, és ebből lett a *„a szezonzáráskor stimmel, itt nem"*
   élmény. A kártya innentől a **keret-számot is átküldi** (`squad`), a nézet
   pedig mindkettőt kiírja, néven nevezve, és **melléteszi a te ugyanolyan
   skálájú számodat** is. Régi kliens kártyáján nincs `squad` — akkor a sor
   egyszerűen elmarad, nem hazudik nullát.

Ugyanez a keret-szám bekerült a **szezonindító** naplóösszefoglalóba is
(`announceMpOpponent`), hogy a szezon két végén ne két különböző skálájú számot
láss a társadról.

### 5.3 A befagyott kép kora

A pillanatkép szándékosan **túléli a szezonváltást** (amit egyszer láttál, azt
nem felejted el) — csakhogy egy tavalyi felállás számai már nem a társad mai
keretéről szólnak. A sáv ezt eddig nem mondta ki, tehát a felhasználó a
NÉZETET hitte hibásnak, nem a kép korát. Innentől ott a figyelmeztetés:
*„⚠ Ez a TAVALYI állapot: azóta igazolhatott, fejlődhetett és öregedhetett a
kerete."*

### 5.4 A megfigyelő nézet nem maradhat kint mérkőzés alatt

Ha a kapcsoló a kezdőrúgás pillanatában az ellenfél oldalán állt, a mérkőzés
egy **befagyott, mozdulatlan kép mögött** játszódott le: a cserék, a kiállítás
és az élő csapaterő mind a rejtett saját pályán történtek. A `mpOppViewSync`
mostantól a futó mérkőzésre (`S.playing`) is visszakapcsol a saját pályára —
ugyanúgy, ahogy a kapitányválasztásra és a játékos-lerakásra már eddig is.


---

## 6. A KUPA UTÁNI KAPU BERAGADT GOMBJA (3.8.35)

**Bejelentett hiba:** *„kupasorozatok végén be szokott csúszni egy ilyen záró
képernyő hiba. itt beszürkül a gomb és csak oldalfrissítéssel oldható meg."*

A **🤝 Folytatjuk — hangolt kerettel** gomb koppintásra letiltódott, és utána
semmi nem történt. A döntés valójában **rögzült** (a mentésben is) — ezért
hozta helyre az oldalfrissítés: a friss rajzolás már a *„Elküldve: folytatjuk
— várunk a társad válaszára"* állapotot mutatta.

### A gomb kezelője

```js
const set=async(choice,btn)=>{
  if(btn)btn.disabled=true;      // ← letiltás ELŐRE
  await mpSendDecision(choice);  // ← ha ez nem tér vissza…
  mpVerdictRefresh();            // ← …ez sosem fut le
  mpDecisionLoop();};
```

A letiltás **feltétel nélkül** megtörtént, a visszaengedést viszont kizárólag
az újrarajzolás hozhatta. Három úton maradhatott el:

### a) A hiányzó kontextus — ez volt a fő ok

```js
function mpVerdictRefresh(){
  const el=$("mpVerdictSec");
  if(!el||!_mpVerdictCtx)return;   // ← néma visszalépés
  …}
```

A `_mpVerdictCtx` **egyetlen** helyen íródott: a bajnoki verdikt-képernyőn
(`finish()`). A **kupa utáni kapu** (`mpShowCupGate`) és a HUB-doboz
(`renderHubMpDuel`) ugyanezt a szekciót rajzolja, de a kontextust nem
állította — és a változó **nem a mentés része**.

Aki tehát a bajnoki verdikt óta újratöltött, annál a kontextus `null` volt. A
kupasorozat hosszú, a két kapu között órák-napok telhetnek: **ez a tipikus
eset**, nem a kivétel. Ezért „szokott becsúszni" épp a kupasorozatok végén.

**A javítás:** a szekció a saját rajzolásakor jegyzi fel, amiből épült —
`mpVerdictSection` végén, egy sorban. Így minden hívó, a jövőbeliek is, magától
helyes marad; a `finish()` külön értékadása megszűnt.

### b) Az elakadt hálózati írás

A `mpSendDecision` a döntést **helyben azonnal** rögzíti és menti, csak utána ír
a szobába. A Firebase `set` viszont offline vagy akadozó vonalon **nem oldódik
fel** (az SDK sorba állítja az írást) — az `await` tehát örökre ott állt.

Mostantól a küldés **6 másodperces versenyfutás**: utána a felület továbbmegy,
az írás a háttérben magától befut. Nem veszik el semmi — a társ válaszát amúgy
is a lekérdező kör (`mpDecisionLoop`) hozza meg.

### c) Kivétel bárhol a láncban

A kezelő `async` nyíl volt, `try` nélkül: egy kivétel néma elutasított
ígéretté vált, és a gomb ott maradt. Mostantól `try/finally` fogja körül —
a `finally` **vagy** újrarajzol, **vagy** visszaadja a gombot
(`mpDecButtonsEnable`).

Ugyanezt kapta a **Meggondoltam magam** gomb is.

### Az önvédelmi ágak

A `mpVerdictRefresh` mostantól igazat/hamisat ad vissza (megtörtént-e), és
három zsákutcát zár le: hiányzó kontextus (a helyezéseket a `mpDuelRanks`
pótolja), üres szekció (nem töröljük a felületet, mert a törlés a gombokat is
elvinné), és a kötés kivétele (nem viheti magával a hívó `finally` ágát).

### Tesztelés

Playwright, valódi karrieren, szintetikus közös szobával — a kupa utáni kapu
úgy nyílik meg, hogy a bajnoki verdikt-képernyő **abban a lapbetöltésben nem
futott le** (pontosan a bejelentett helyzet). Öt eset, mindegyik a **jelenlegi
és a javítás előtti** kódon is lefuttatva:

| eset | 3.8.34 | 3.8.35 |
|---|---|---|
| a hálózat rendben van | ✗ beragadt szürke gomb | ✓ „Elküldve — várunk a társadra" |
| a hálózati írás **kivételt dob** | ✗ beragadt szürke gomb | ✓ ugyanaz |
| a hálózati írás **sosem oldódik fel** | ✗ beragadt szürke gomb | ✓ 6 mp után továbbenged |
| a társ már igent mondott | — | ✓ hangolás lefut, „Indulhat a következő szezon", a továbblépő gomb megjelenik |
| **Befejezzük itt** | — | ✓ végső összesítő, a továbblépő gomb megjelenik |

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.
