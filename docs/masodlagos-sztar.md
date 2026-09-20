# A sztáros filozófia másodlagosként (3.9.99)

## A bejelentett hiba

> „Sztárom a párom másodlagos csapatstílusként megy nekem. És itt nem működik
> se a sztár jóga se az összhangot javító képesség. Mindkettő nullán áll. Ezt
> eddig máskor nem tapasztaltam."

Az „eddig máskor nem tapasztaltam" pontos megfigyelés: **elsődlegesként minden
működött.** A hiba kizárólag a másodlagos sloton élt.

## A gyökér: egy félbemaradt átvezetés

A 3.9.64-ben érkezett a második csapatstílus, és vele a `starStyle()` — az a
függvény, ami **megtalálja** a sztáros filozófiát, akármelyik slotban áll:

```js
function starStyle(){return styleStateFor("sztar");}
```

A hívók átvezetése viszont félbemaradt. **Tizenhárom sztár-mérő** továbbra is
a `styleState()`-ből, vagyis az **elsődleges** stílusból olvasott — ott pedig
nincs `.star`, tehát mind nullát adott:

| függvény | mit némított el |
|---|---|
| `stStarBond` | a sztár összhangja (mérföldkő-család + a képesség kiírása) |
| `stStarBondPairs` | a három legerősebb kötése |
| `stStarEntry` | a pool-bejegyzése (kor, POT, Rating) |
| `stStarCareer` | a karrier-statisztikái (gól, gólpassz, meccsember…) |
| `stStarWagePct` · `stSquadAvgWage` | a bére a keret átlagához mérve |
| `stSquadAvgPrice` | a piaci ára a keret átlagához mérve |
| `styleStarAttrMult` | a kijelölt attribútum fejlődés-gyorsítása |
| `styleStarAgeSkip` | a „nem öregszik" évkihagyása |
| `styleYogaSkills` · `styleYogaShift` · `styleYogaSet` · `styleYogaActive` | **a Sztár jóga egésze** |

Fontos, hogy **nem a képesség szintje** volt rossz: a `styleYogaMax()` és a
`styleFxMul("starBondMult")` a `styleActiveFx()`-en megy, az pedig **mindkét
slotot** bejárja. A szint tehát megvolt — csak nem volt mihez alkalmazni.
Ezért látszott úgy, hogy „nullán áll".

Mérve, ugyanazzal a filozófiával:

| | elsődlegesként | másodlagosként |
|---|---|---|
| `styleYogaMax()` | 0,75 | 0,75 ✅ |
| `styleFxMul("starBondMult")` | ×2,00 | ×2,00 ✅ |
| `styleYogaSkills()` | 1 | **0** ❌ |
| `stStarBond()` | 60 | **0** ❌ |
| `stStarEntry()` | megvan | **nincs** ❌ |

## És a jóga HATÁSA is halott volt

Nem csak a kijelzés. A `multSkillEffect` a `styleYogaActive(name)`-tól kérdezi
meg, kell-e az átalakító ágra menni — az pedig szintén az elsődlegesből
olvasott. Másodlagos sztárnál tehát a beállított eltolások **nem hatottak a
pályán**, akkor sem, ha a skálákat beállítottad.

## Ugyanez a hibaosztály a képesség-sorsolásban

Az audit három további helyet talált, ahol a **stílus kulcsát** az elsődleges
slotból olvastuk:

* `skillRealBias` — a sztár sorsolás-iránya (`skrCat`) másodlagosként némán
  elveszett. A javítás óvatos: az ág **csak akkor veszi át a szót**, ha
  tényleg van választott kategória; enélkül a másik filozófia sodrása marad.
* `skillRealAutoShare` és a mód-választó — egy **másodlagos Panzer** vagy
  **Béke és harmónia** sem hatott a „ki dönti el, kié a képesség" arányra.
  Mindkettő `styleHasKey(kulcs)`-ra váltott.
* `skillRealStarPickBind` — a gombokat rajzoló fél már a `starStyle()`-ból
  dolgozott, a **kattintás-kezelő** viszont az elsődlegesből olvasta ki, mi
  van kijelölve: a „mit jelöltem ki" és a „mire koppintok" két külön
  filozófiáról beszélt.

## Ami NEM változott

A `styleState()` jelentése változatlan: **az elsődleges stílus.** Ahol a
kérdés tényleg az, hogy „van-e már filozófiája a klubnak" (kapuk, a panel, a
szintküszöbök), ott a helyén maradt. Csak a stílus-SPECIFIKUS olvasások
költöztek át.

Mindkét függvény fölé került egy figyelmeztetés, mert ez a hibaosztály
ismétlődni fog: ami egy sztár-adatot olvas, az `starStyle()`-t hív; ami egy
filozófia jelenlétét kérdezi, az `styleHasKey(kulcs)`-ot.

## Próba

`tools/masodlagos-sztar-proba.js` (9061-es port). A mérés módja szándékosan
**nem abszolút számokat** rögzít — azok a balansz változásával elavulnának —,
hanem azt, hogy **ugyanaz a filozófia ugyanazt adja, akárhol áll**: tizennégy
mérő fut le mindkét sloton, és a kettőnek egyeznie kell.

Két őr teszi a mérést értelmessé: a 2. szakasz azt állítja, hogy az értékek
**nem nullák** (különben a „két nulla egyenlő" is zölden átmenne), az 5. pedig
azt, hogy sztáros filozófia **nélkül** viszont tényleg nullák — vagyis a
mérők nem „mindig igazat" mondanak.

A próba a javítás **előtti** kódon 14 ponton bukik.
