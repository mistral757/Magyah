# A passzkémia közös fejlődése — és a tört attribútum (3.9.95)

## A bejelentett hiba

> „Szerintem bugos a passzkémiánál az együtt fejlődés. Sokszor van hogy ilyen
> fura állásokon elakad. Nem is éri el a szintjét, főleg nem megy vele együtt
> onnan."

A képernyőképen egy 17 éves középvédő lapja állt, rajta:

```
Védekezés 94 · Védés 60 · Passz 112.375 · Gólszerzés 69 · Sebesség 73
```

A „fura állás" tehát nem kép a beszédben: **szó szerint ott volt a lapon.**

## A lánc, ami ebből kibomlott

### 1. A specializációs sáv két vége tört lett

A `bumpAttr` sávja (`ATTR_SPEC_CEIL` / `ATTR_SPEC_FLOOR`) a `trainScale`-lel
skálázódik — ez a 3.8-as javítás, ami miatt az edzés a magas Ratingű
játékosnál sem halványul el. Csakhogy a `trainScale` **tört**:

```
trainScale = startRating / 80          →  89/80 = 1,1125
plafon     = 89 − 10 + 30 × 1,1125     =  112,375
```

Amint az attribútum nekifeszült ennek a plafonnak, a clamp

```js
entry.attrs[key]=Math.max(floor,Math.min(ceil,entry.attrs[key]+dir));
```

**ráírta a törtet magára az attribútumra** — és onnantól a mentésben is tört
ült. Innen jött a lapon látott `112.375`.

### 2. Az összeérés EGYENLŐSÉGET néz — tört értékkel elérhetetlen

A passzkémia felzárkózási szakaszát a `passChemRipe` zárja le, és a mércéje az
**egyenlőség** volt:

```js
return passChemPassOf(pr.a)===passChemPassOf(pr.b);
```

Egy tört érték viszont sosem lesz egyenlő a társa egész értékével. A kötés
tehát **örökre a felzárkózás szakaszában ragadt**, és a közös, gyorsított
fejlődés — a kötés fele haszna — el sem indult.

Sőt: a két fél **átugrálta egymást**. Minden meccsen a másik lett a „gyengébb",
és a felzárkózás újraindult. Pontosan ez a „fura állásokon elakad".

### 3. A gyengébb fél plafonja a társáé ALATT is lehet

Ez a tört számoktól **független**, önálló hiba. Egy középvédő Passz-sávja
szűkebb, mint egy irányítóé (`ATTR_PROFILE.KV.passz = −10`, `KKP = +1`), és a
sáv a saját `startRating`-jéhez van kötve. Ha az irányító 125-ös passzal áll, a
középvédő 112-es plafonnal **soha nem érheti el** — felért, ameddig
felérhetett, a rendszer mégis örökre felzárkózásban tartotta.

A régi kód ezt szándékosnak mondta („ha a gyengébb fél a saját plafonján áll,
ott megáll. Ez nem hiba, hanem a szabály"). A megállás tényleg szabály — de
abból nem következik, hogy a **közös fejlődés** is elmaradjon.

### 4. Még a sikeres összeérés sem tartott ki

Mivel a mérce a **pillanatnyi** egyenlőség volt, az első eltérés — egy
gólpassz, egy edzéslépés, egy eltérő `trainScale` — visszadobta a párt a
felzárkózásba. Vagyis a „**innentől EGYÜTT fejlődnek tovább**" ígéret még a
tiszta esetben sem teljesült egy meccsnél tovább.

## Mi lett belőle

### A sáv két vége kerekítve egész

```js
function attrBandOf(entry,key){
  …
  return {
    hi:Math.round(Math.min(attrCapFor(key,entry&&entry.n),base+(prof[key]||0)+ATTR_SPEC_CEIL*_ts)),
    lo:Math.round(Math.max(40,base+(prof[key]||0)-ATTR_SPEC_FLOOR*_ts))};}
```

**Kerekítés, nem csonkítás** — mert a `trainScale` saját doksija is kerekített
értéket ígér („130-as Ratingnél a specializációs tér +49-re tágul": 30 × 1,625
= 48,75). A `bumpAttr` innentől ezt a sávot használja, tehát a clamp nem tud
többé törtet írni.

A régi mentésekben ülő törteket az `ensureAllAttrs` **egyszer** visszakerekíti
a sávba — ugyanaz a védőháló, ami a sebesség- és az árnyékék-migrációt is viszi.

### Az összeérés plafon-tudatos és végleges

```js
function passChemRipe(pr){
  if(!pr)return false;
  if(pr.ripe)return true;                                 /* VÉGLEGES */
  const pa=passChemPassOf(pr.a),pb=passChemPassOf(pr.b);
  if(pa===pb)return true;                                 /* összeértek */
  const loN=pa<pb?pr.a:pr.b;
  return passChemPassOf(loN)>=passChemPassCeil(loN);}     /* felért, ameddig felérhetett */
```

A `passChemPassCeil` **ugyanabból a sávból** (`attrBandOf`) dolgozik, mint a
`bumpAttr` — a kettő nem tud elcsúszni egymástól.

A `passChemTick` az összeérést **latchelve** rögzíti (`pr.ripe=1`), és ki is
mondja a naplóban, külön mondattal a két esetre:

| eset | a napló sora |
|---|---|
| egyenlőség | „…passza egy szintre került (120) — innentől EGYÜTT fejlődnek tovább" |
| plafon | „…a saját Passz-plafonjára ért (112) — feljebb már nem jut, de a felzárkózás ezzel lezárult — innentől EGYÜTT fejlődnek tovább" |

## Ami NEM változott

* **A plafont most sem lépjük át.** A passzkémia nem ír felül határokat, csak
  az odáig vezető utat rövidíti le — a gyengébb fél a sávja tetején áll meg.
* **A felzárkózás lépése az összeérés után is fut.** Ha a gyengébb fél plafonja
  később megnő (mert a Ratingje nőtt), onnan kapaszkodik tovább a társa után.
  A `pr.ripe` csak a szakaszt zárja le, nem a mozgást.
* **A rendes, egyenlőséges összeérés változatlan.** A próba külön ágon méri,
  hogy két, plafon alatt álló középpályás tényleg egyenlőséggel ér össze, nem
  a plafon-ággal.

### Régi mentés

A `said` mező akkoriban is csak összeéréskor került fel, tehát pontosan azt
jelentette, amit ma a `ripe`. A `passChemTick` ezért `if(pr.said)pr.ripe=1;`
sorral veszi át — a már összeért párok nem esnek vissza felzárkózásba.

## Próba

`tools/passzkemia-osszeeres-proba.js` (9045-ös port), 18 állítás. A legfontosabb
az első: a próba **pontosan a bejelentett 112,375-öt** állítja elő (89-es
Ratingű középvédő, `trainScale = 1,1125`), és azt méri, hogy ma 112 lesz belőle.
