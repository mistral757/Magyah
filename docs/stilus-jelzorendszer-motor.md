# A közös jelzőrendszer-motor — mind a nyolc filozófia (3.9.105–3.9.110)

## 1. Miért

KIMONDOTT KÉRÉS: *„Mindegyik csapatstílus kapjon egy olyan rendszert, mint a
panzerkampfwagen a félelem-rettenet-tel. A skálák hasonlók legyenek, viszont a
reward legyen alacsonyabb. A panzerkampfwagené legyen a legerősebb, mert
minden másban az a legkevésbé kifizetődő választás."*

A projektgazda a **„b" utat** választotta: a Panzer **+20-a marad**, a többi
stílus **+12**-t kap. (Az „a" út — a Panzer plafonjának lehozása — elvetve.)

## 2. Amit a Panzer feltalált, és amit itt általánosítunk

A félelem-rettenet erejét egyetlen szerkezeti döntés adja: **a kettéválasztás.**

| lépcső | Panzernél | mit jelent |
|---|---|---|
| **állapot** | félelem szint | nem gyűjtöd, hanem **van**: a keretből számol, a stílusszint nagyítja |
| **valuta** | rettenet pont | meccsenként gyűlik, az állapot 10%-áig |
| **szint** | Rettegés | a valutából vásárolható, az állapot egyre nagyobb %-át teszi meccserővé |

Ettől lesz a gazdaság **önmagát hajtó kör** — és ettől lesz
**összehasonlítható** is, mert mindhárom lépcső ugyanazon a skálán áll.

### Miért nem írjuk át a Panzert erre

A félelem-rettenet mélyen be van kötve (bolt, mérföldkövek, közvetítés,
mentés), és **működik**. Egy refaktor ott tiszta kockázat lenne, haszon
nélkül. A Panzer marad a **referencia-megvalósítás**, a motor pedig a többi
stílusé — a számok szándékosan ugyanabban az alakban állnak, hogy a kettő
összemérhető maradjon. Ez nem hat külön rendszer: **egy** motor, stílusonként
egy táblázat-sorral.

## 3. A számok

| | Panzer | a többi |
|---|---|---|
| százalék-létra | `[0 … 0,15]` | `[0 … 0,09]` — **végig pontosan 0,6×** |
| meccserő-plafon | **+20** | **+12** |
| árlétra | `[150 … 3500]` | **betűre ugyanaz** |
| szintküszöb | `4+n` stílusszint | **betűre ugyanaz** |
| szintek | 10 | 10 |
| meccsenkénti keret | az állapot 10%-a | az állapot 10%-a |

**Ugyanaz a munka, kisebb jutalom** — pontosan a kért viszony. Az arány végig
0,6, tehát a Panzer bármelyik szinten ugyanannyival ver rá a többire: a rés
nem szűkül és nem tágul menet közben.

A tarifa 100-as állapot fölött együtt skálázódik az állapottal — ugyanaz a
szabály és ugyanaz az ok, mint a Panzernél (`dreadScale`): a plafon a
szinttel nő, tehát a fix tarifa idővel elérhetetlenné tenné.

## 4. ⚡ A Villám: viharszint → villámpont → Villámcsapás

### Az állapot: viharszint

A **sebességből** számol — az egyetlen attribútum kemény plafonnal, tehát a
rendszer épp azt a tengelyt tolja, amit másképp nem lehet.

* a keret **11 leggyorsabb** embere adja (nem a kiállított kezdő: így egyetlen
  felállással nem lehet kijátszani),
* emberenként legfeljebb **3 egység**, ahogy a Panzernél is: **70**-es
  sebesség nulla, **100**-as a maximum,
* × 10, aztán a stílusszint nagyítása (1. szinten fél, 20.-on kétszeres).

Mérve: 95-ös átlagsebességű kerettel, közepes stílusszinten **~138** a
viharszint — nagyjából ott, ahol egy felépült Panzer félelem szintje. **Egy
gyors ember eladása azonnal leviszi** (165 → 150 a próbában).

### A valuta: villámpont

| tétel | pont |
|---|---|
| **korai gól** (a félidők első negyedórája — hideg védelem) | 1,0 |
| gól | 0,35 |
| gólpassz | 0,25 |
| **villámláb gólja** (a gólszerző sebessége ≥ 95) | 0,6 |
| **háromgólos győzelem** | 1,0 |
| meccserő-fölény (kezdőrúgáskor) | max 5 |
| győzelem erősebb ellen / óriásölés | a keret arányos része |

A gól- és a gólpassz-tétel **néma** (van saját soruk a közvetítésben); a
többi azonnal megszólal, és a lefújásnál jön a tételes összesítő — ugyanaz a
nyelv, mint a rettenetnél.

### A szint: Villámcsapás

A viharszint egyre nagyobb százaléka válik meccserővé, +12-ig. A panel
kimondja, hogy a Panzer ugyanezen a létrán jár +20-ig — *„ez a filozófia ára
ott, és a jutalma itt."*

## 5. Hol lakik

* **Kód:** `ENG_DEFS` tábla + `eng*` függvények, közvetlenül a Panzer
  fear-blokkja után.
* **Állapot:** a stílus-állapotban (`st.eng`), mint a Panzernél az `st.fear` —
  így a **mentés magától viszi**, és egy stílusváltás nem keveri össze a
  kettőt.
* **Meccs-bekötés:** a gól a `recordScorer` **közös csatornáján** szólal meg
  (tizenegyes, szabadrúgás, csere-gól, hosszabbítás — mind átfut rajta), a
  gólpassz a `recordAssist`-en, a futó perc a `tickFn`-ből.
* **Meccserő:** két helyen száll be, pontosan ott, ahol a Panzeré is
  (`hiddenMatchBonus` és a `styleBonus`).
* **Felület:** saját szakasz a stílus-panelen, a rettenet mintájára.

## 6. Egyszerre csak EGY motor fut

`engKey()` a stílus-slotokból (elsődleges + másodlagos) az **első** olyat
adja, amelyikhez tartozik motor. Két gazdaság párhuzamos pörgetése kétszeres
meccserőt adna ugyanazért a munkáért. A próba külön állítja, hogy Panzernél a
motor **néma** — de másodlagos sloton a Villám így is fut.

## 7. ⏳ „Nyolcvan perc" — a sebesség ára

A Villám eddig **tiszta nyereség** volt: a gyors keret jobb, és kész. Egy
filozófiának viszont két oldala kell, különben nem választás, hanem bezárás —
a Panzernél ezt a szerepet a rossz jellem tölti be (a félelem szintet emelő
vandálok a pályán kívül is vandálok).

**A Villám ára az, ami a valóságban is: a nagyon gyors csapat elfárad.** A
**70. perctől** a csapat gólesélye esik, az ellenfélé pontosan ugyanannyival
nő — annál jobban, minél magasabb a viharszint.

| | |
|---|---|
| mikortól | 70. perc |
| mennyi | legfeljebb **±6%** a gólesélyen (~0,7 meccserőnyi tétel) |
| mitől függ | a viharszint: 70 alatt semmi, 300-nál a teljes mérték |
| hogyan tűnik el | **minden megvett Villámcsapás-szint a tizedét** — a 10. szinten a hátrány nulla |

Ez nem büntetés, hanem **ív**: az elején fizetsz a sebességért, a végén már
nem. És ez teszi értelmessé a „korai gól" tarifát is — a rendszer mindkét
fele ugyanazt mondja: **siess**.

A hatás szorzó, nem meccserő, tehát a `roleOwnGoalMult` / `roleOppGoalMult`
mellett ül, ugyanazon a két ponton.

## 8. ⚡ Szárny-kémia (3.9.107)

> **3.9.143 óta** a szárny nem magától indul: felajánlásból, választásból és fázisonként épül, mint a gyilkos páros. Lásd `docs/szarny-kemia-epites.md`.

A **harmadik kötésfajta** a passzkémia és a gyilkos páros mellé — és a
harmadik, ami nem felajánlásból jön, hanem **együtt töltött időből**.

### Mit köt össze

Egy **szárnyat**: a szélső védőt és az előtte játszó szélsőt, ugyanazon az
oldalon — **JV+JSZ** vagy **BV+BSZ**. A magyar futballnyelv erre azt mondja:
*„összeszokott szárny"* — és pontosan ez a Villám lelke, mert a szélen nem a
technika dönt, hanem hogy a kettő **egyszerre indul-e meg**.

### A belépő szigorú, és ez a lényeg

A kettő **sebessége legfeljebb 3-mal térhet el**. Ha a védő lassabb, mint a
szélső, a labda kifut alóla — nincs mit összeszokni. Így a kötés nem jár
automatikusan mindenkinek, hanem egy **keretépítési döntés** jutalma.

A posztkódból döntünk, nem a slotból — ugyanúgy, ahogy a gyilkos párosnál:
a tick csak neveket kap, és a játékos **saját posztja** mondja meg, melyik
szárny embere.

**Legfeljebb kettő** lehet belőle, és ezt nem külön korlát mondja ki, hanem
maga a szerkezet: két oldal van.

### A fokozatok

| stílusszint | fokozat | összeérés | gólesély / páros | sebesség-ugrás |
|---|---|---|---|---|
| < 3 | — | nincs | — | — |
| 3–7 | 1 | 14 közös meccs | +3,0% | +2% |
| 8–13 | 2 | 11 közös meccs | +4,5% | +3% |
| 14+ | 3 | 8 közös meccs | +6,0% | +4% |

A szorzó csak akkor jár, ha **mindketten a pályán vannak** (a kiállított
nem) — ugyanaz a szabály, mint a gyilkos páros presszing-szorzójánál. Két
kész párossal a kettő **szorzódik** (mérve: 1,06 × 1,06 = 1,1236).

Az összeéréskor a **sebességük fölfelé kiegyenlítődik** a nagyobbikhoz, egy
kis ráadással, a keményplafonig (`attrHardCap`) — a kötés nem nyit új teret,
csak felzárkóztat.

### Miért a stílusszint a kapu

A gyilkos párost egy **képesség** nyitja, mert a Gegenpressing fáján van neki
hely. A Villám fájára nem akartunk új képességet tolni egy olyan körben, ami
amúgy is három rendszert hoz — itt ezért maga a filozófia szintje a lépcső.

### Hol lakik

`S.szarny` (a mentés része), a léptetés a `passChemTick` / `gpDuoTick`
mellett fut a fejlődési ciklus után, a szorzó pedig a `roleOwnGoalMult`
csatornáján megy.
## 9. ⚽ Bombázók — a motor második stílusa (3.9.108)

Itt derül ki, ér-e valamit a közös motor: **a Bombázók gazdasága egy
táblázatsor.** Ugyanaz a bázis-szerkezet, csak másik attribútumon.

| | Villám | Bombázók |
|---|---|---|
| állapot | viharszint (`seb`) | **gólterhelés** (`gol`) |
| valuta | villámpont | **gólpont** |
| szint | Villámcsapás | **Gólözön** |

A tarifa viszont másról szól — **a Villámé a MIKOR, a Bombázóké a MENNYI**:

| tétel | pont |
|---|---|
| gól | 0,4 |
| gólpassz | 0,2 |
| **mesterhármas** | 1,0 |
| **gólzápor** (4+ gól egy meccsen) | 1,5 |
| **új klubrekord** | 2,5 |

### ⚽ A Kilences

Kijelölsz egy **csatárt**, és onnantól **minden gólja megemeli a következő
gólesélyét**. A gólzápor így szó szerint önmagát gerjeszti: aki egyszer
betalált, azt keresi a labda.

| stílusszint | gólonként | max |
|---|---|---|
| 3–7 | +35% | ×2,05 |
| 8–13 | +50% | ×2,50 |
| 14+ | +70% | ×3,10 |

**Az ellentétel élesen tematikus, és ez teszi választássá:** a **70. perctől,
ha hátrányban vagytok, a bónusz eltűnik**. A Kilences **frontember, nem
megmentő** — akkor öl, amikor már megy a csapatnak. Enélkül ez egy
univerzális gólsúly-buff volna, nem karakter.

A szorzó a gólsúly csatornáján megy (`roleGoalMult` mellett), tehát a
tizenegyen **belül** oszt újra — nem emeli a csapat gólvárhatóságát.

### ⚽ A rekord kötelez

A klub őrzi az **egymeccses gólcsúcsát** (`S.recGoalsMatch`). Ha **egy gólra
vagytok tőle**, az egész csapat gólesélye megnő a mérkőzés végéig — érzik,
hogy történik valami.

| stílusszint | a csapat gólesélye |
|---|---|
| 3–7 | +4,0% |
| 8–13 | +6,0% |
| 14+ | +8,0% |

A jelző a meccsen belül **latchelődik**: ha egyszer felizzott, a hátralévő
percekre marad, akkor is, ha közben átléptétek a rekordot. A csúcs a
lefújásnál könyvelődik — **a tarifa UTÁN**, hogy a „megdőlt" tétel a régi
csúcshoz mérten szülessen, és ne üsse agyon önmagát. A csúcs sosem csökken.
2 alatti rekordnál nincs mit megközelíteni.

### Párharcban egyik sem fut

Ott a **közös, seedelt eseménylista** dönti el, ki mikor talál be — ugyanaz a
szabály, ami a helyben dobott lapokra és a bemondott vereségre is áll. Egy
helyben módosított gólsúly azonnal szétvinné a két kliens nézetét.

## 10. A maradék négy stílus (3.9.110)

Ezzel **mind a nyolc filozófiának van kamatozó gazdasága.** Kettőnek saját
(Panzer: félelem-rettenet · Sztár: híresség), hatnak a közös motor.

| stílus | állapot | bázis | valuta | szint |
|---|---|---|---|---|
| ⚡ Villám | viharszint | `seb` | villámpont | Villámcsapás |
| ⚽ Bombázók | gólterhelés | `gol` | gólpont | Gólözön |
| 🧱 Beton | betonszint | **max(`ved`, `kapus`)** | betonpont | Bunker |
| ☯️ Harmónia | harmóniaszint | **az egyenletesség** | harmóniapont | Egyensúly |
| 🌀 Tiki-taka | passzterhelés | `passz` | passzpont | Körforgás |
| 🧲 Gegenpressing | nyomásszint | **átlag(`seb`, `ved`)** | presszpont | Fojtás |

### Három bázis-alak, hogy mindenki a saját nyelvén mérhessen

* **`attr`** — egy tengely (Villám, Bombázók, Tiki-taka).
* **`attrMax`** — a kettő közül a nagyobbik. A Betonnál a kapus a **védését**
  adja, a mezőnyjátékos a **védekezését** — egy skálán. Mérve: 95-ös védéssel
  a kapus pontosan annyit ér, mint egy 95-ös védekezésű hátvéd.
* **`attrAvg`** — a kettő átlaga. A Gegenpressingnél presszingelni **lábbal
  ÉS szereléssel** lehet; aki csak az egyikkel bír, nem presszingel. Mérve:
  100 sebesség + 70 védekezés = pontosan annyi, mintha mindkettő 85 lenne.

### ☯️ És egy negyedik, ami kilóg — szándékosan

A Harmónia az **egyetlen** stílus, aminek az állapota nem egy tengely
**magassága**, hanem a keret **egyenletessége**. A filozófia szó szerint ezt
mondja: *„nincs kiemelkedő ember, és nincs gyenge láncszem sem."* Egy
sztárcsapat itt **rosszul jár** — és ez a lényeg.

A tizenegy legjobb Ratingű ember átlagához mérünk: mindenki annál többet ad,
minél közelebb áll hozzá; 12 Rating eltérésnél már nulla. Mérve: egy
tökéletesen egyenletes keret **660**, egy 120/80-ra széthúzott **0**.

### Négy tarifa-nyelv

| stílus | mit fizet |
|---|---|
| 🧱 Beton | **tiszta lap 2,0** · lezárt meccs (győzelem ≤1 kapott góllal) 0,8 · védekező villanás 0,15 |
| ☯️ Harmónia | **három gólszerző 1,5** · négy vagy több +1,0 · gólpassz 0,35 · gól 0,15 |
| 🌀 Tiki-taka | **gólpassz 0,5** (a motor legtöbbet fizető rendes tétele) · csapatjáték (3+ gólpassz) 1,5 · gól 0,2 |
| 🧲 Gegenpressing | **elhódított labda elöl 0,45** · tiszta lap 1,0 · gól 0,2 |

A Harmóniánál a próba külön állítja, hogy **egy ember három gólja nulla
pontot ér** — ott nem a gól számít, hanem hogy hányan szerezték. A
Gegenpressing `press` tétele a motor egyetlen olyan tarifája, ami nem gólból,
lapból vagy eredményből jön: a stílus saját motor-csatornájából (`mPress`).

## 11. A feed és a másodlagos harmadolása (3.9.111)

### Minden stílus beszél a közvetítésben

KIMONDOTT KÉRÉS: *„ahogyan a rettenetnek vannak meccs közben feedben
visszajelzései, mi mennyi pontot ért éppen, úgy legyen a többi
csapatstílusnál is ilyen."*

A mérce a Panzeré. Ott a néma halmaz (`DREAD_QUIET`) **mindössze kettő**: a
védekező villanás és a meccserő-fölény. A sárga lap, a piros, a mesterhármas
és a kemény belépő mind megszólal — pedig sárgából is jön több egy
mérkőzésen.

Ugyanez a küszöb áll most a motorban is: **néma csak az, amiből tucatnyi jön
egy meccsen.**

| stílus | mi néma |
|---|---|
| ⚡ Villám · ⚽ Bombázók · ☯️ Harmónia · 🌀 Tiki-taka | **semmi** |
| 🧱 Beton | védekező villanás |
| 🧲 Gegenpressing | elhódított labda elöl |
| *mind* | meccserő-fölény (`ENG_QUIET_ALL`) |

A gól és a gólpassz eddig néma volt mind a négy stílusnál — **mostantól
beszél**. Mérve: egy gól + egy gólpassz a Villámnál 5, a Tiki-takánál és a
Harmóniánál 3 feed-sort ad. A próba azt is állítja, hogy **minden
tarifa-tételnek van magyar címkéje**, tehát a feed sosem ír kulcsnevet.

### A másodlagos filozófia harmadáron gyűjt

KIMONDOTT KÉRÉS: *„ahogyan a csapatstílus pontgyűjtését, úgy ezeket a pont
gyűjtéseket is csökkentsük: harmadoljuk a mértéküket a másodlagos
csapatstílusnál."*

Ugyanaz a szám és ugyanaz az elv, mint a mérföldköveknél
(`STYLE2_MS_DIV = 3`). Két döntés, ami nem magától értetődő:

* **A harmadolás a TARIFÁN megy, nem a jóváíráson.** Így minden szám, amit a
  feedben látsz, **igaz szám** — nem a teljes tételt írjuk ki, hogy aztán a
  végén némán elharmadoljuk.
* **A meccsenkénti plafon változatlan.** Nem azt szűkítjük, mennyi *fér* bele
  egy meccsbe, hanem azt, milyen *gyorsan* gyűlik: a plafon továbbra is az
  állapot 10%-a, csak háromszor annyi mérkőzés kell hozzá. (Mérve: elsődleges
  12,1 · másodlagos 4,0 · a plafon mindkettőnél 55.)

A lefújás összesítője kimondja: *„másodlagos filozófia: harmadáron gyűlik."*

### És a rettenet is

A kérés a *többi* stílus jelzőrendszereiről szólt, de a Panzeré **ugyanolyan
meccsenként gyűlő valuta**. Ha csak a többit harmadolnánk, a „Panzer
másodlagosnak" azonnal a legjobb választás lenne — épp azt a rést nyitva,
amit a harmadolás be akar zárni. Ezért a `fearNote`, a `fearNoteWin` és a
fölény-tétel is osztódik, ugyanazzal a számmal és ugyanazon az elven.

## 12. Mérés

`node tools/stilus-motor-proba.js` (9077-es port) — tizenkét szakasz: a két létra
viszonya (**minden szinten 0,6**), az azonos ár- és küszöblétra, a viharszint
mint állapot (a skála alja, a stílusszint nagyítása, az eladás azonnali
hatása), a 10%-os meccskeret, a szint → meccserő átváltás a +12-es plafonnal,
egy **élő mérkőzés** teljes tarifája és könyvelése, végül hogy a motor csak a
saját stílusánál fut.

