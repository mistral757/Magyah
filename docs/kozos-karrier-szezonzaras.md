# KÖZÖS KARRIER — A SZEZONZÁRÁS

**Állapot:** ✅ megvalósítva · **Verzió:** 3.4.01

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
csapaterő pedig még a kupa előtti. Egy megnyert Konferencia-liga viszont pénzt,
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

* **A befejezés végleges.** Ha az 1. kapun bármelyikőtök a „befejezzük"-öt
  választotta (`mpRunStopped`), a 2. kapu nem kínál folytatást — csak az
  összesítést mutatja. Enélkül a második kapu visszavonhatná az elsőn
  kimondott döntést.
* **A 2. kapu nem tud beragadni.** A gombja nem a következő szezonba visz,
  hanem a **szezonjelentésre** — a záró könyveléshez. Azt egy „befejezzük" sem
  tarthatja vissza, ezért ott a lezárult döntés is továbbenged.

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

## 3. Magyar Kupa → Konferencia-liga, közösen (3.4.01)

Alacsonyabb sávban (NB II) a **megnyert Magyar Kupa Konferencia-liga indulást
ér**, és azt még ugyanabban a szezonzárásban le is játsszuk.

**A hiba:** közös karrierben ez a lánc csak a **győztes** kliensén sült el. Ő
elindult a KL-be, a társa pedig a szezonjelentésre lépett tovább — a két
karrier egy egész kupasorozatra szétvált. Pedig a rendszer alapelve pont az,
hogy a **jobbik eredménye viszi mindkettőtöket**: a nevezésnél (`mpResolveCup`)
ez ki is van mondva — *„aki nem kvalifikált, azt a társa jogán visszük
magunkkal"*.

**A javítás:** a lánc is közös döntés lett, ugyanazon a mintán, mint a nevezés.
Mindketten felteszitek, megnyertétek-e a hazai kupát (`s<szezon>mkkl`), és ha
**bármelyikőtök** igen, **mindketten** indultok a Konferencia-ligában. A
vesztes oldalon a napló ki is mondja, kinek a jogán.

**Miért nem elég a helyi jelző:** a kupát csak egyikőtök nyerheti meg (vagy egy
gépi csapat), tehát a vesztes oldalon semmilyen helyi állapotból nem derül ki,
hogy a lánc elsült — ehhez a társ eredménye kell.

**Ha megszakad a kapcsolat**, vagy a felhasználó nem várja meg az egyeztetést,
a saját eredményre esünk vissza — az pontosan a javítás előtti viselkedés,
tehát nem lehet rosszabb. Ilyenkor a két karrier tényleg szétválhat, és a
napló ezt ki is mondja.
