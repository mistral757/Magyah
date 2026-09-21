# A közös jelzőrendszer-motor, és a Villám gazdasága (3.9.105)

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

## 7. Mérés

`node tools/stilus-motor-proba.js` (9077-es port) — nyolc szakasz: a két létra
viszonya (**minden szinten 0,6**), az azonos ár- és küszöblétra, a viharszint
mint állapot (a skála alja, a stílusszint nagyítása, az eladás azonnali
hatása), a 10%-os meccskeret, a szint → meccserő átváltás a +12-es plafonnal,
egy **élő mérkőzés** teljes tarifája és könyvelése, végül hogy a motor csak a
saját stílusánál fut.

## 8. ⏳ „Nyolcvan perc" — a sebesség ára

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

## 9. Ami még hátra van ebből a lépésből

* **Szárny-kémia** — a passzkémia mintájára, sebességre: azonos szárnyon
  játszó, hasonló sebességű páros közös percekből köt, és a kontrák
  gólesélyét emeli az adott oldalon.
