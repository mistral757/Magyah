# Percbélyeg — egy esemény, egy perc (3.9.78)

## A bejelentés

> „Valamiért beakadt a játéknak, hogy 5-tel osztható percekben vannak nagyobb
> eséllyel az események, és ami még nagyobb gond, hogy ugyanabban a percben
> több esemény is tud lenni, ami a legrosszabb, hogy több gól is. Nagyon nem
> elegáns pl. az ugyanabban a percben (5-tel osztható) 2 gól és még valami
> esemény."

Mindkét panasz igaz volt, és ugyanaz a sor okozta mindkettőt.

## Mi a vödör, és miért van

A meccsmotor **öt perces vödrökben** pereg: `min += 5`, tehát tizennyolc
lépésben ér végig a mérkőzésen. Ez szerkezeti: a gólvárhatóság, a Poisson-
dobások, a helyzetszámok és az egész balansz erre a rácsra van hangolva. **Ez
nem változott, és nem is fog:** a percbélyeg kizárólag KIÍRÁSI kérdés — az,
hogy egy vödrön belül melyik percre írjuk a történteket.

## A gyökér

A régi `gmin(vödör)` minden hívásnál ÚJ percet foglalt a vödörből, és szigorúan
monoton nőtt. Csakhogy egy vödörben **öt perc van**. Amint elfogytak, a
függvény a vödör **utolsó** percére csonkolt — és az utolsó perc épp az, ami
osztható öttel.

Három-négy hívás pedig a normális volt, mert **egy esemény gyakran kétszer
kért percet**:

| esemény | hány percet fogyasztott |
|---|---|
| piros lap | 2 — a naplósor és a mérföldkő-előtag |
| kapott gól | 2 — a gólsor és a kapus-mérföldköve |
| második sárga | 2 — a kiállítás szövege és a mérföldkő-előtag |
| szabadrúgásgól | 2 — a gólsor és a lövéserő-mérő |

Ráadásul a két hívás **két különböző percet** adott: ugyanannak az eseménynek a
két fele szétcsúszott.

### Mérve

4000 vödör, a régi szabály újraépítve (`tools/percbelyeg-proba.js`):

| hívás/vödör | 5-tel osztható perc | ismétlődő perc a vödörben |
|---|---|---|
| 1 | 21,4% | 0% |
| 2 | 36,5% | 20,6% |
| 3 | 50,2% | 50,5% |
| 4 | 61,8% | 80,3% |
| 5 | 69,9% | 96,5% |
| 6 | 74,6% | 100% |

A **20%** a véletlen szintje (minden ötödik perc osztható öttel). Három hívás
után tehát már a duplája, és a vödrök felében ismétlődött egy perc.

## A javítás

Az elv egy mondat: **a perc az ESEMÉNYÉ, nem a naplósoré.**

A régi `gmin` helyére két függvény lépett:

- **`gmin(vödör)` — a vödör MOSTANI perce.** Egy vödrön belül mindig ugyanaz.
  Nem foglal, nem léptet, nem tud telítődni. Ezt kapja a kommentár, a
  mérföldkő-előtag és az esemény második fele, hogy ugyanarról a pillanatról
  beszéljenek.
- **`gminNew(vödör)` — egy ÚJ esemény perce.** A vödör **első** eseménye a
  teljes sávból kap egy percet, egyenletesen; a **további** események az előző
  után következnek. Ezt hívja a gól, a lap, a sérülés, a helyzet — minden, ami
  önálló sorként megjelenik a közvetítésben.

A 90 fölötti ág érintetlen: ott a „90+N" továbbra is a ráadás saját
eloszlásából jön (`stoppageMin`), nem a rácsból.

### Az óra nem tud elszaladni

Ha egy vödörben négy-öt esemény van, a percek elfogynak, és a bélyeg legfeljebb
egy vödörnyit csúszik előre. A **következő** vödör ezt lenyeli: a `gbEnsure`
a vödör saját felső határára szorítja a kezdőpontot. Ez a fék az, ami miatt nem
térhet vissza a 3.8.38-ban javított hiba (az elszaladt óra és a „90+10"-ek
sora).

### Egy esemény, egy hívás

Ahol egy eseményhez két sor tartozik, a perc **egyszer** dől el, és mindkét sor
ugyanazt kapja:

```js
const _drt = gminNewTxt(min);
addLine(`${_drt}  ${redCardLine(nev)}`, "m rc");
mileRed(MILE, nev, `${_drt}  `);
```

## Az eredmény

Ugyanaz a mérés, az új kóddal:

| esemény/vödör | 5-tel osztható perc | ismétlődő perc a vödörben |
|---|---|---|
| 1 | 19,8% | 0% |
| 2 | 20,3% | 0% |
| 3 | 23,6% | 0% |
| 4 | 24,2% | 0% |
| 5 | 20,0% | 0% |

És **élesben, egy végigjátszott idényen** (30 forduló, 310 percbélyeg):

- 5-tel osztható perc: **17,4%** — a vödör ötödik perce lett a *legritkább* a
  leggyakoribb helyett;
- a vödrön belüli eloszlás: 21,0% / 20,6% / 20,6% / 20,3% / 17,4%;
- **nulla** olyan mérkőzés, ahol két gól ugyanabba a percbe esett.

## A próba

`node tools/percbelyeg-proba.js` — a vödör-matek tisztán (a régi szabállyal
összevetve), a `gmin`/`gminNew` szerződése, a 90 fölötti ág, és egy
végigjátszott idény élesben.
