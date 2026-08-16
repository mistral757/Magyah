# A csapat-tengelyek négy rétege — az alak is mérhető

*(3.3.20. Érintett kód: `ROLE_AXIS_W`, `SLOT_AXIS_BONUS`, `formShapeAxisShift`,
`teamAttrStrengths`, `renderHubTacticsPanel`, `formShapeTableHtml`.)*

## 1. A kérdés

Van-e olyan mérőnk a védekezésre / passzjátékra / gólszerzésre, ami nem csak a
pályán lévők attribútumait nézi, hanem a **felállást** és a **középpályás
megbízásokat** is? A kívánság konkrét volt: ugyanazzal a tizenegy emberrel egy
5-4-1 és egy 4-5-1 adjon **magasabb** védekezést, mint egy 4-3-3 vagy egy 4-4-2;
és négy támadó középpályás adjon **alacsonyabbat**, mint négy védekező.

Ami volt: az öt tengely (Védekezés · Védés · Passz · Gólszerzés · Sebesség) a
játékosok attribútumaiból állt össze, poszt szerint súlyozva, plusz a
megbízások eltolása (`SLOT_AXIS_BONUS`, ±3 pont VKP/TKP-nál) és a skillek. A
felállás **alakja** viszont csak közvetve szólt bele — azon keresztül, hogy hány
védőt kell beállítanod.

## 2. A négy réteg

`teamAttrStrengths()` mostantól négy, külön is kiolvasható rétegből rakja össze
minden tengely értékét:

| réteg | mit ad | hol látszik |
|---|---|---|
| `_base` | a pályán lévők attribútumai, poszt-súlyozva, illeszkedéssel | „= 75 poszt" |
| `_shape` | **a felállás alakja** (új) | „+1,3 felállás" |
| `_role` | a megbízások (VKP/TKP/árnyékék) | „+0,8 megbízás" |
| `_skill` | a pályán lévők megszerzett skilljei | „+1,2 skill✦" |

A Taktika-panel fejlécében mind a négy ott áll tengelyenként, és a két kicsi
réteg csak akkor jelenik meg, ha tényleg mozdít (érintetlen 4-4-2-nél mindkettő
pontosan 0).

## 3. Az alak súlya — ugyanazokkal a súlyokkal

A felállás „tömege" egy tengelyen a benne álló **szerepek** súlyának összege,
pontosan azokkal a számokkal (`ROLE_AXIS_W`), amikkel maga a tengely is számol:

```
Védekezés-tömeg  = 0,30·kapus + 1,00·védő + 0,50·középpályás + 0,15·csatár
Passz-tömeg      = 0,15·kapus + 0,50·védő + 1,00·középpályás + 0,60·csatár
Gólszerzés-tömeg =              0,15·védő + 0,50·középpályás + 1,00·csatár
```

Az eltolás ehhez képest: `SHAPE_AXIS_K × (a te alakod tömege − a 4-4-2 tömege)`.
A horgony a **4-4-2**, tehát az alap-alak eltolása pontosan 0, és a rendszer nem
inflál. `SHAPE_AXIS_K = 1,5` — ez az egy hangoló szám.

| felállás | Védekezés | Passz | Gólszerzés |
|---|---|---|---|
| 5-4-1 (saját) | **+1,28** | −0,15 | −1,28 |
| 5-3-2 | +0,75 | −0,75 | −0,53 |
| 4-5-1 | +0,53 | +0,60 | −0,75 |
| 4-4-2 | 0 | 0 | 0 |
| 4-3-3 · 4-2-3-1 | −0,53 | −0,60 | +0,75 |
| 3-5-2 | −0,75 | +0,75 | +0,53 |
| 4-2-4 | −1,05 | −1,20 | +1,50 |
| 3-4-3 | −1,28 | +0,15 | +1,28 |
| 3-6-1 (saját) | −0,23 | **+1,35** | −0,23 |

A kért sorrend tehát megvan: 5-4-1 > 4-5-1 > 4-4-2 > 4-3-3 > 3-4-3 a
Védekezésen, és a népes középpálya a Passzt tolja.

**Nulla köré összegződik**: a három eltolás együtt −0,75 és +0,9 között marad,
vagyis az alak **átrendez**, nem felhizlal — a fit horgonya (a három tengely
átlaga) legfeljebb 0,3 ponttal mozdul.

## 4. A mérték

1 attribútumpont ≈ 12-13 százalékpont a **saját** tengelyén, a teljes
taktika-illeszkedésben pedig a taktika tengely-súlyával szorozva jelenik meg.
A ±1,28-as szélső eltérés így egy védekezés-súlyú rendszernél (Park the bus,
ved 48%) ~15 pontnyi illeszkedés-különbséget ad a legzártabb és a legnyíltabb
alak között.

A szándékolt sorrend ezzel áll össze:

| döntés | mekkora eszköz |
|---|---|
| a TAKTIKA (rendszer) | 12-27pp (taktikák egymás közt) |
| a FELÁLLÁS ALAKJA | ~15pp a két véglet közt |
| a MEGBÍZÁS | 8-16pp a saját tengelyén |

## 5. A megbízás nem számolódik kétszer

A szerep-**kategória** (védő / középpályás / csatár) megbízással nem változik —
egy szélsőre állított középpályás középpályás marad —, tehát az alak-tömeg
kizárólag az alaktól függ, a megbízás pedig marad a saját rétegében
(`slotAxisShift`). A két réteg így összeadható, átfedés nélkül.

Mérve, egy saját 5-4-1-ben (a négy középpályás megbízása változik, minden más
azonos):

| megbízás | `_role` a Védekezésen | Védekezés-tengely |
|---|---|---|
| 4 védekező | +0,76 | 76,51 |
| 1 VKP · 1 TKP · 1 KKP · 1 szélső | 0,00 | 76,35 |
| 2 támadó + 2 szélső | −0,39 | 75,86 |
| 4 támadó | −0,78 | 75,22 |

Pontosan a kért irány.

## 6. Hol látszik

* **Taktika-panel** (HUB → Taktika): tengelyenként a négy réteg, számszerűen.
* **Felállás-választó**: „📊 Mit ad maga az alak?" — táblázat a választható
  felállásokról, **védekezés szerint rendezve**, a 4-4-2-höz mérve. Ez az a
  képernyő, ahol a döntés megszületik, tehát a mérő is ide való.
* **Megbízás-panel** (a játékos lapján): opciónként a tengely-elmozdulás, ahogy
  eddig is.

## 7. Amit a szám nem véd ki

Felállásváltáskor a kezdő 11 **összetétele** is változik (más ember lép
pályára), és ez önmagában nagyobbat mozdíthat a tengelyen, mint az alak
eltolása — egy 4-5-1-be bekerülő gyengébb ötödik középpályás lehúzhatja a
Védekezést a +0,53 ellenére. Ezért van külön rétegként kiírva: így elválik, mi
jött az **alaktól** és mi a **névsortól**.

## 8. Nyitott kérdés

Az `AXIS_OFFSET` / `AXIS_SCALE` konstansok a réteg nélküli populáción lettek
mérve. Mivel a horgony a 4-4-2 és az eltolások nulla köré összegződnek, a
populáció-átlag alig mozdul, de a Tengely-mérő (`axisProbeReport`) pontosan ezt
méri élesben — érdemes ránézni pár szezon után, és ha kell, egyetlen sorban
hangolni.
