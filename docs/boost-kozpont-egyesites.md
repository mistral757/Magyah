# Minden boost egy helyen (3.9.76)

**Állapot:** ✅ megvalósítva · **Mérés:** `tools/boost-kozpont-proba.js` — 17 állítás

---

## A kérés

> „Az ifi boost és az öreg róka boost legyen bevezetve a boost központba, ne
> legyenek külön, és a rájuk vonatkozó jutalmak is oda legyenek bevezetve
> ugyanúgy mint a többi boostnál — a nulla ft-os ár ott látszódjon. Nem kell
> külön kihívás jutalmak menüpont a csapatépítés menün belül."

## 1. Ami eltűnt a menüből

| | miért kellett mennie |
|---|---|
| ⚡ **Ifi-boost** gomb | ugyanaz a művelet, mint a Boost-központ egy sora |
| 🎩 **Öreg csirkefogó** gomb | ugyanaz |
| 🎁 **Kihívás-jutalmak** almenü | két gombja volt, és egyik sem volt igazi menüpont |

A Csapatépítés menüben így **egy** boost-belépő maradt: a Boost-központ.

### A panelek viszont megmaradtak

Az ifi- és az öreg-boostnak **saját jelölt-logikája** van (akadémista, illetve
30 fölötti játékos), amit a katalógus általános játékos-választója nem tudna.
A két képernyő ezért változatlan — csak `$("hubYouthBoostBtn").onclick`-ből
**`openYouthBoostPanel()`** függvény lett, és a katalógus sora közvetlenül ezt
hívja. Eddig egy rejtett gomb kattintását szimulálta; egy gomb, ami csak
azért létezik, hogy egy másik kód rákattintson, nem gomb.

## 2. Két ingyen-zseton, egy fogalom

Ez volt a valódi rendetlenség a felszín alatt. **Két** külön „ingyen boost"
jutalom létezett, és külön is viselkedett:

| | hol élt | hatott-e a katalógus árára |
|---|---|---|
| `S.chFreeBoost[fajta]` (3.9.37) | fajtánkénti zseton | **igen** (`boostPriceOf`) |
| `S.boostTokens` | általános zseton, saját menüponttal és saját választóképernyővel | **nem** |

Vagyis ugyanaz a jutalom **két úton, két árral** jelent meg: a saját
képernyőjén ingyen volt, a Boost-központban teljes áron.

Mostantól egyetlen kérdés van — *hány ingyen lövésed van ERRE a fajtára*:

```js
function boostFreeLeft(kind){
  let n=chFreeBoostLeft(kind);
  if(kind==="youth"||kind==="old")n+=(S.boostTokens||0);
  return n;}
```

Az általános zseton az **ifi-** és az **öreg-boostra** szól — a saját panele is
pontosan ezt a kettőt kínálta —, tehát ott számít bele, és máshol nem.

### A költés sorrendje nem mindegy

```js
function boostFreeSpend(kind){
  if(chFreeBoostSpend(kind))return true;          /* előbb a SZŰKEBB */
  if((kind==="youth"||kind==="old")&&(S.boostTokens||0)>0){ … }
```

Először a **fajtánkénti** zseton fogy, mert az szűkebb, tehát értékesebb: az
általánosat a másik fajtára is el lehet még lőni. Fordítva a játékos némán
veszítene értéket.

## 3. Egy hiba, ami menet közben derült ki

```js
function youthBoostPrice(){return boostUnitPrice();}   /* ❌ */
```

Az ifi-boost ára **megkerülte a `boostPriceOf`-ot**. Következmény: a
fajtánkénti ingyen-zseton a katalógusban 0 Ft-ot mutatott, az ifi-panel
viszont teljes árat kért — a jutalom a saját felületén elveszett. Most:

```js
function youthBoostPrice(){return boostPriceOf("youth");}
```

Egy ár, egy igazság: a katalógus, a megerősítő ablak és a levonás ugyanazt a
számot látja. (Pontosan az az elv, amit a `boostPriceOf` saját kommentárja
már 3.9.37 óta kimond — csak ez az egy út kimaradt belőle.)

## 4. A jutalom a saját nevén jelenik meg

A katalógus sorában a puszta „0 Ft" nem mondja meg, **miért** ingyen:

```
⚡ Ifi-boost — akadémistára: a fejlődés berobban
INGYEN — kihívás-jutalom (2 db), az egyenleged nem mozdul
```

A fizetős sorok változatlanul az árat és az egységet mutatják.

## 5. Az ingyen igazolás nem veszett el

A „🎁 Ingyen igazolás" gomb sosem csinált mást, mint hogy **átvitt az
átigazolási képernyőre**. Maga a zseton a fizetés egyetlen tölcsérében
(`payFor`) vált be **magától**, bármelyik igazolási úton — scout-jelölt,
klub-szemle, álomigazolás, sőt a megemelt ár is. A vételi ablak ki is írja:

> 🎁 Ingyen igazolás-token van nálad — a megemelt árat is ez fedezi, az
> egyenleged nem mozdul.

A gomb tehát egy emlékeztető volt egy olyan menüben, aminek nem kellett
léteznie. A jelzés ott van a helyén, ahol a pénz elfogyna.

## 6. A tanító-jelzés is átállt

A `sys:token` téma („Beváltatlan ajándék") a megszűnt almenüre mutatott.
Mostantól a **Boost-központra** mutat, és csak az ingyen boostról szól — az
ingyen igazolásra egy menübe mutató jelzés rossz irányba küldene, hiszen az a
vételi úton vált be.

## 7. Mit NEM érint

- A boost-árak, a kedvezmények (kezdő idények ablaka, kihívás-jutalom
  százalék), a hatások és a mérföldkövek változatlanok.
- A mentés mezői (`boostTokens`, `freePlayerTokens`, `chFreeBoost`)
  változatlanok — egy futó karrier minden zsetonja megmarad, csak máshol
  látszik.
