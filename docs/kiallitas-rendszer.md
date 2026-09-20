# A kiállítás négy ügye (3.9.97)

## A négy kimondott kérés

> 1. „Akit kiállítanak, annak a játszott percei a kiállításig számítsanak, de
>    maga az értékelés legyen hasonlóan magas panzerkampfwagen mellett, ha
>    kiállítás volt, nem baj hogy csak 25 vagy 40 percet játszott a kiállított.
>    Ott jutalmazni kell azt aki ilyen kemény."
> 2. „A második kiállítás kommentárjánál már ne azt írja, hogy 10en maradtunk.
>    Harmadik kiállításnál se."
> 3. „Legyen külön mérföldkő az egy meccsen kapott kiállítások számára és arra,
>    hogy hány emberrel a pályán tudtunk meccset nyerni."
> 4. „Az 5. kiállítás után elvesztjük a meccset automatikusan."

## A közös gyökér: a motor EGY kiállítást ismert

A `redIdx` egy **szám** volt, és a második kiállítás egyszerűen **felülírta** az
elsőt. Négy következménye volt, és mind a négy valódi:

| tünet | miért |
|---|---|
| a napló a 2. lapnál is „tízen maradtunk"-at írt | a szöveg fixen tízet mondott |
| a 24. percben kiállított ember a 80.-ban még gólt lőhetett | a kizárás csak az UTOLSÓ `redIdx`-re szólt |
| az első kiállított **eltiltás nélkül** maradt | a lefújás utáni könyvelés is csak az utolsót látta |
| nem lehetett megmondani, hány kiállítást kaptunk | nem volt mit megszámolni |

Ezért a javítás gerince nem négy folt, hanem **egy kiállítás-halmaz**:

```js
const redIdxs=new Set();   /* MINDEN kiállított indexe */
const mRedMin={};          /* név → a kiállítás perce */
const isRed=i=>redIdxs.has(i);
const menLeft=()=>11-redIdxs.size;
```

A `redIdx` megmaradt a **legutóbbi** kiállítás indexének (több tucat hívó
dolgozik vele), de a „ki nincs már a pályán" kérdést innentől a halmaz dönti
el. A motoron kívüli segédek (`roleOwnGoalMult`, `roleOppGoalMult`,
`roleRiskTeamP`, `roleRedTeamP`, `pickTierQuote`, `gpMouseInjMult`,
`processCareerDevelopment`) **változatlan aláírással** kapják meg a halmazt:

```js
function redHas(red,i){          /* szám VAGY halmaz VAGY tömb */
  if(red==null)return false;
  if(typeof red==="number")return red>=0&&i===red;
  if(red instanceof Set)return red.has(i);
  if(Array.isArray(red))return red.indexOf(i)>=0;
  return false;}
```

## 1. A percek — és miért nem szabad, hogy ez büntessen

A **szezonos perc-főkönyv** (`S.seasonMinutes`) évek óta helyesen vágta a
kiállított perceit; a **meccs-értékelés sora** viszont a csonkítatlan `share`-t
kapta, ezért állt a lapján 90'. A két hely mostantól ugyanabból a `mRedMin`
tárból dolgozik.

Csakhogy a két kérés-fél **egymás ellen dolgozna**: a rövid játékidőnek ára van
az értékelésben (15 perc alatt nincs ítélet, fölötte `MSTAT_OUT_FLOOR` és
`MSTAT_PULL_FLOOR` az alap felé húz). A 25. percben kiállított emberünk a
**helyes** percszámmal rosszabb értékelést kapna, mint a hibás 90-cel.

```js
function mstatRedFullMin(row){
  try{return !!(row&&row.red&&pzCardsBuild());}catch(e){return false;}}
```

Panzer lap-építésénél tehát a kiállított **teljes percsúllyal** számol, és a 15
perces kapu sem zárja ki. Máshol változatlan minden — ott a rövidebb játékidő
jogosan számít kevesebbet.

**Mérve** (80-as KV, 1 sárga, 52. percben kiállítva, győzelem):

| | teljes 90' | 52'-re vágva | 10'-re vágva |
|---|---|---|---|
| Panzer lap-építéssel | 5,85 | **5,85** | **6,35** |
| anélkül | 1,90 | 2,10 | nincs ítélet |

Az alap 3,50. A Panzeres kiállított tehát az **alap fölé** kerül, a másik alá:
jutalom vs. büntetés. És a **korai** kiállítás ér a legtöbbet — ahogy a
büntetés is a koraiért volt a legnagyobb.

## 2. A létszám a szövegben is igaz

```js
const MEN_LEFT_WORD={11:"tizenegyen",10:"tízen",9:"kilencen",8:"nyolcan",7:"heten",6:"hatan",5:"öten"};
```

A piroslap-sorok megkapják, hányan maradtak, és a **sokadik** kiállítás saját
készletet kap (`RED_CARD_MORE_TXT`, `RED_CARD_MORE_PANZER_TXT`): „tízen
maradtunk" a harmadiknál nemcsak pontatlan lett volna, hanem komikus is.
Ugyanez a javítás fut a Megfélemlítés sorára és a második sárga mondatára.

## 3. Két új Panzer-mérföldkő

| család | mérce | fokozatok |
|---|---|---|
| `pz_rcmatch` — Kiállítások egy mérkőzésen | `maxMatchRed` | 1 · 2 · 3 · 4 · **5** |
| `pz_winmen` — Hányan nyertük meg | `maxWinShort` | tízen · kilencen · nyolcan · **heten** |

A kettő **nem ugyanaz**: két kiállítást összeszedni és úgy *veszíteni* nem
ugyanaz a teljesítmény, mint kettővel kevesebben *nyerni*. És különbözik a
meglévő `pz_redwinN`-től is: az azt számolja, **hányszor** nyertünk
emberhátrányban, ez azt, hogy **milyen mélyről**.

A plafonok a szabályból jönnek, nem érzésből: kiállításból **öt** a maximum (az
ötödik után lefújják a meccset), győzelemhez viszont legfeljebb **négy** —
hattal már nincs mérkőzés, amit meg lehetne nyerni.

## 4. Az ötödik kiállítás

Hét embernél kevesebbel a mérkőzés nem folytatható (IFAB). Az ötödik
kiállításnál tehát a játékvezető lefújja, és az eredmény **bemondott vereség**:
`0:3`, kivéve ha az ellenfél addigra már többel vezetett.

A lezárás **egyetlen kilépési ponton** történik: a `matchForfeitCheck` csak
megjelöli a mérkőzést, a futó öt perces vödör befejeződik, és a következő tick
eleje zárja le. A `fullTime` legelső dolga a hivatalos eredmény beállítása —
így minden alatta következő könyvelés (`cls`, tabella, morál, mérföldkövek) már
azt látja.

**A gólok a játékosoknál maradnak**: amit a pályán szereztek, azt megszerezték.
A hivatalos **eredmény** az, ami felülíródik, pontosan úgy, ahogy egy
félbeszakadt mérkőzésnél a valóságban is.

**Párharcban sosem.** Ott az eredményt a közös, seedelt eseménylista adja, egy
helyben felülírt állás azonnal szétvinné a két kliens nézetét. A gyakorlatban
elő sem fordulhat: a párharc-szimuláció oldalanként egy kiállítást ismer
(`rollRed` → `X.redName`).

### Az off-by-one, amit a próba fogott meg

Az első nekifutásban a piroslap-kapu `menLeft()>MATCH_MIN_MEN` volt — vagyis
„amíg legalább nyolcan vagyunk". Ez **egy emberrel elvétette a szabályt**: hét
emberrel még JÁR a lap, épp az az ötödik kiállítás, ami után a mérkőzés véget
ér. A gátam mellett az ötödik lap sosem született meg, és a teljes 4. kérés
néma maradt volna. A helyes kapu nem a létszám, hanem a **lefújás**:
`if(!forfeited&&!duelRedFromList)`.

## A balansz ára, megmérve

A régi kapu (`redIdx<0`) azt jelentette, hogy **közvetlen** piros lapból
legfeljebb egy eshetett egy mérkőzésen — a második sárgából születőből viszont
akárhány. Ez a kettősség tette mérhetetlenné a 3. kérést és üressé a 4-et.

Az eltávolítása valódi balansz-változás, ezért meg van mérve. Egy teljes,
30 fordulós szezon, alapértelmezett beállításokkal:

```
30 meccs · 4 kiállítás · 0,133/meccs · a legtöbb egy meccsen: 2
```

A kiállítás tehát ritka maradt: a kapu csak a ránézésre sem látszó **farkat**
engedte el.

## Próba

`tools/kiallitas-rendszer-proba.js` (9051-es port), 30 állítás. A 6-7. szakasz
**valódi mérkőzéseket** játszik le felhúzott piroslap-eséllyel — a refaktor
kockázata a motorban van, nem az egységekben.
