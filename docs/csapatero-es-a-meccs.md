# Két csapaterő, egy meccs — és a 6-1

*(3.3.38. Érintett kód: `teamStrength` / `teamOVRbase` / `buildMatchSnapshot` /
`matchLambdas` / `h2hSimulate`, `h2hWireSnapshot`.)*

Ez a dokumentum egy konkrét bejelentésre született: **„magasabb nyers erővel
kaptam ki 6-1-re otthon a párharcon."** A vizsgálat három dolgot talált —
kettőt hibát, egyet a modell természetéből.

## 1. Három szám, nem egy

A „csapaterő" a kódban **három különböző mennyiséget** jelent, és a három nem
összemérhető:

| szám | mi van benne | hol látszik |
|---|---|---|
| `teamOVRbase()` | `játékos.ovr × illeszkedés` — a **nyers csontváz** | büdzsé, generálás, „nagy skalp" könyvelés |
| `teamStrength()` | `posEffectiveRating(poszt) + skill-rating-bónuszok` — **a motor képlete** | a felállásképernyő `#teamOVR`-je, a HUB, a kupa |
| `MS.ovr` (`buildMatchSnapshot`) | a fenti **plusz** morál, kapitány, edzők, aura, csapategyensúly, stílus-bónusz, lendület, forma-dobás | sehol — ez a szimuláció belső száma |

A különbség nem kozmetikai. `teamOVRbase()` a **posztra illeszkedést** egyetlen
durva szorzóval intézi (1 vagy 0,93), miközben a motor az
`posEffectiveRating`-gel dolgozik, ami az **attribútumokból** számol, és a
poszt-ismeret hiányáért akár **−12 Rating** büntetést is ad. Egy rossz poszton
játszó emberen a két szám 10 fölött is eltérhet — ugyanarra a játékosra.

A `MS.ovr` pedig ezen felül visz még egy csomó rejtett tagot: a morál egymaga
**±2,5**, a forma-dobás **±3** (a szerencsés/pechesnek sorsolt emberen), a
csapatforma-malus **−2,2**. Ezek egyike sem látszik semmilyen kijelzett számban.

## 2. Az első hiba: alma a körtéhez

A szezonindító MP-összefoglaló (`announceMpOpponent`) ezt írta ki a társadról:

```
• Kezdő nyers csapaterő: 83.4
```

— vagyis `teamOVRbase()`-t. A **te** csapaterőd viszont a felállásképernyőn és
mindenhol máshol `teamStrength()`. **A két szám két külön skála**, és mivel a
`teamStrength()` a skill-rating-bónuszokat is tartalmazza, a saját számod
rendszeresen magasabb — a társad tehát tartósan gyengébbnek látszott, mint
amilyen.

Ugyanez a hiba a párharc utáni „következő mérkőzés" dobozon is ott volt: a
párharc `fx.o.ovr`-je a nyers skálán állt, a mellette kiírt saját csapaterő meg
a teljesen máson.

**Javítva.** Az összefoglaló mostantól **mindkét számot** kiírja, mindkét
oldalról:

```
• Csapaterő: 87.1 (nyers 83.4)  • a tiéd: 86.2 (nyers 84.9)
```

A párharc pillanatképe pedig **két mezőt** visz: `dispOvr` (a nyers skála, mert
a „nagy skalp" könyvelés abban mér) és az új `shownOvr` (a `teamStrength()`
skálája, a kijelzéshez). A kettőt nem lehetett összevonni: két feladat, két
szám. A kijelzés a már meglévő `fx.o.dispOvr` úton megy, tehát új útvonal nem
kellett hozzá.

> Ez a hiba **nem** befolyásolta a mérkőzés kimenetelét: a szimuláció mindkét
> oldalról a `MS.ovr`-t használja, az pedig szimmetrikus. Csak azt döntötte el,
> hogy MIT hiszel a meccs előtt.

## 3. A második hiba: a stílus-szorzók átszivárogtak

A `matchLambdas` a csapatépítési stílus két gólszorzóját (`ownGoalMult`,
`oppGoalMult`) **globális függvényhívással** olvasta:

```js
let lf=lam(diff)*styleOwnGoalMult(), la=lam(-diff)*mine.defMult*styleOppGoalMult();
```

Ezek a `styleActiveFx()`-ből, vagyis a **helyi játékos** `S.style`-jából
dolgoznak. A CPU-meccsen ez rendben volt (egy oldal gazdag). A párharcban
viszont a szimuláció **mindkét oldalt egy gépen** számolja — tehát a számoló fél
szorzói a társa csapatára is ráültek, a társáéi pedig sehol nem érvényesültek.

Ráadásul a sim-et **bármelyik kliens** kiszámolhatja (`h2hTickRun`), így ugyanaz
a meccs más eredményt adott attól függően, ki ért oda előbb — pont azt a
determinizmust törve, amiért a seedelt véletlen egyáltalán van.

**Javítva.** A két szorzó a `defMult` mellé, a **pillanatképbe** került, és a
`matchLambdas` onnan olvassa. Régi kliens pillanatképében nincs meg a két mező —
ott a helyi függvényre esünk vissza, tehát a mai viselkedés marad.

A tét nem apró: a szorzók a stílus-fán **+15%** támadó- és **−14%** védekező
irányban is elmehetnek, és összeszorzódnak.

## 4. És a harmadik: a Poisson

A gólok `poisson(λ/18)`-cal esnek, tickenként. A λ-görbe:

```
λ = 1.3 · e^(0.09 · erőkülönbség)      [0.15 … 4.5 közé vágva]
```

| erőkülönbség | te lősz | te kapsz |
|---:|---:|---:|
| −6 | 0,76 | 2,23 |
| −3 | 0,99 | 1,70 |
| **0** | **1,30** | **1,30** |
| +3 | 1,70 | 0,99 |
| +6 | 2,23 | 0,76 |

Ebből a **6-1 vagy annál rosszabb** vereség valószínűsége:

| λ te / λ ő | esély | ez kb. |
|---|---:|---|
| 1,6 / 1,4 (te vagy erősebb) | 0,17% | minden 595. meccs |
| 1,5 / 1,5 (egyenlő) | 0,25% | minden 402. meccs |
| 1,3 / 1,8 | 0,65% | minden 154. meccs |
| 1,2 / 2,1 | 1,36% | minden 74. meccs |

**Tehát: egy 6-1 azonos erőnél is bekövetkezik, nagyjából négyszáz meccsenként
egyszer.** Egy hosszú karrierben ez nem kirívó esemény, hanem esedékes. A modell
szándékosan ilyen: egy determinisztikus motorban a jobb csapat mindig nyerne, és
a foci nem így működik.

Amit viszont **nem** szabad, hogy megtörténjen: hogy azt hidd, erősebb voltál,
amikor nem. Ezt javította a 2. és a 3. pont.

## 5. Mit nézz meg legközelebb

1. **A két számot ugyanabban a skálában** — a szezonindító sor mostantól
   mindkettőt kiírja, mindkét oldalról.
2. **A morált.** ±2,5 Rating-nyi, és sehol nem része a „csapaterőnek".
3. **A poszt-illeszkedést.** Egy nem ismert poszton álló ember a motor szemében
   −12-t is érhet, miközben a nyers szám csak −7%-ot mutat.
4. **A taktika-illeszkedést.** A `tacticEffect` a λ-ban ül, nem a csapaterőben:
   −? … +2,7 Rating-ekvivalens, és a fejlécen csak a SZINT látszik, az
   illeszkedés nem.
