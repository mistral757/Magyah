# A nyári torna kiútja közös karrierben (3.9.72)

**Állapot:** ✅ javítva · **Mérés:** `tools/nyari-kupa-solo-proba.js` — 17 állítás

---

## 1. A bejelentés

> „Volt egy ilyen hogy indítottam nyári kupát PvP-ben. Nem akartam megvárni a
> társamat, és mondta hogy mehetek a saját választásommal. Rányomtam, és a
> nyár végére ugrott, semmi kupa."

## 2. A gomb hazudott

A közös döntések kapuja (`mpBothGate`) minden kapunál **ugyanazt** a kiutat
kínálta:

> „A társad nem jelentkezik — **a saját döntésemmel megyek tovább**"

A nyári torna viszont `solo:false` tartalékkal hívta a kaput. A kiút tehát a
tartalékot hajtotta végre, nem a döntésedet: **mindig a NEM-et** — akkor is,
ha az imént mondtál igent. Innen a „semmi kupa" és a nyár végére ugrás.

Ez nem elírás volt: a `solo` mező pontosan azért létezik, hogy a hívó
megmondja, mi legyen a kiút eredménye. A nyári tornánál a `false` **szándékos**
volt, csak a felirat maradt a általános.

## 3. Miért volt eddig tilos a féloldalas torna — és mi ebből igaz

A nevezés **egyhangú**: egy tétnélküli tornába nem lehet belerángatni azt, aki
nem kért belőle (és az auto szezont futtató fél nem is tudná lejátszani). Ez
helyes, és **marad**.

Ebből viszont **nem** következik, hogy aki egyedül marad, annak ki kell
maradnia. A tiltás valódi oka technikai volt, és a 3.7.32 ki is mondja: a
kupakampány lezárása átbillenti a **kupa utáni kapu** jelzőjét
(`S.mpCupSeason`), az pedig megváltoztatja, **melyik** döntési rekeszt
használja a szezonzáró kapu:

```
mpGateKind()  →  "league"  →  kulcs: s3decision
              →  "cup"     →  kulcs: s3decisioncup
```

Ha csak az egyikőtök játszana tornát, a két kliens **két különböző kulcsra**
várna — a szezonzárás holtpontra futna.

## 4. A javítás

### a) A kiút azt teszi, amit ígér

`friendlyCupSettle` mostantól `solo:(yes ? {solo:true} : false)` tartalékkal
hívja a kaput, és **saját feliratot** ad neki:

| a döntésed | a kiút felirata | mi történik |
|---|---|---|
| igen | „A társad nem jelentkezik — **egyedül nevezek a tornára**" | elindul a saját 32-es mezőnyöd |
| nem | „A társad nem jelentkezik — **kihagyom a tornát**" | a nyár lezárul (a régi viselkedés) |

A várakozó mondat is kimondja előre, mi vár rád, ha nem várod meg: *„a KÖZÖS
torna (ahol az ő csapata is ott van a 32 között) csak akkor indul, ha ő is
nevez. Ha nem várod meg, egyedül indulsz: a mezőny a sajátod lesz."*

`mpBothGate` ehhez kapott egy `soloLabel` mezőt. A többi kapu felirata
betűre változatlan — ott az általános mondat igaz.

### b) A féloldalas torna nem billenti át a jelzőt

A `friendlyCupStart` egyedül indított tornánál beírja az `S.friendlySolo`
jelzőt (idényre szól), és a `mpShowCupGate` **ezt nézi meg először**:

```js
if((S.friendlySolo||0)===(S.seasonNumber||1)){
  S.friendlySolo=0; cb(); return; }     /* se kapu, se jelző */
```

Így a torna után is `mpGateKind()==="league"` marad, vagyis **mindkét kliens
ugyanazon a döntési rekeszen áll**. Ez volt az egyetlen valódi akadály.

A kapu kihagyása nem veszteség: ez a kapu a **közös sorozat utáni közös
döntés** — egy féloldalas, jutalom nélküli felkészülési tornának nincs mit
egyeztetnie, és a keretek az idényzáró kapunál úgyis újra egymáshoz
hangolódnak.

### c) A későn érkező társ sem marad ki

A kiút előtt a szoba megkapja a **solo jelölést** (`mpGateGiveUp` új `pre`
horga), és `mpNykResolve` ebből dolgozik:

```js
if(mine.solo||mate.solo) return {solo:true};
```

Ha a társ később mégis nevez, ő **nem** közös tornát indít (azt már nem
lehet — én a sajátomban játszom), hanem ő is **egyedül** játssza le a magáét.
Így mindketten játszotok, és egyikőtök sem lép be a kupa utáni kapuba: a két
kliens szinkronban marad.

> **Ez a hazárd egyébként korábban is fennállt.** A régi kódban is
> feltöltöttem az igenemet, mielőtt kiléptem — a később érkező társ tehát két
> igent látott, és **közös** tornát indított egy olyan csapat ellen, amelyik
> valójában nem játszott. A javítás ezt is megszünteti.

## 5. Mit NEM érint

- **Egyjátékos**: a nevezés ott sosem megy kapun át (`friendlyCupJoint()`
  hamis), tehát betűre változatlan.
- **A közös torna**: ha mindketten időben igent mondtok, minden marad — a társ
  csapata ott van a 32 között, `S.mpCup.comp="NYK"`, és a kupa utáni kapu
  rendesen lefut mindkét oldalon.
- **Az egyhangúság**: egy „nem" vagy egy „nálam idén nincs torna" továbbra is
  kizárja a közös tornát.
- **A többi kapu** (osztályozó, kupanevezés, hazai kupa, párharc) felirata és
  viselkedése változatlan.

## 6. Mentés

Új mező: `S.friendlySolo` (idényszám, 0 = nincs). A kupa utáni kapu elhasználja
és nullázza. Régi mentésben hiányzik → 0 → a régi út.
