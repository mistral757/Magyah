# A másodlagos filozófia meccserő-plafonja a fele (3.9.137)

> „A másodlagos csapatstílusból szerezhető plusz meccserőt felezzük. Panzer:
> 20 ⇒ 10, többiek 12 ⇒ 6. Az össz meccserő boostot nem kell korlátozni.
> Szerintem most korlátozva van az elsődleges max pontszámában."

## Ami eddig volt

A bejelentés pontos volt:

- **Saját plafon:** minden motoros stílus szintje a saját plafonjáig adott
  meccserőt (+12, a Panzer rettenete +20).
- **Közös plafon:** a 3.9.131 óta ezen FELÜL az összes motoros stílus hozama
  együtt sem mehetett +12 fölé.

Egy kiépített elsődleges filozófia már a +12-n állt, tehát a másodlagos
meccserő-hozama gyakorlatilag nulla volt. A képernyőn ettől még nőtt, csak az
összegbe nem jutott be.

## Ami mostantól van

| | elsődlegesként | másodlagosként |
|---|---|---|
| Panzer (Rettegés) | +20 | **+10** |
| minden más motoros stílus | +12 | **+6** |

- **Közös plafon nincs:** a két filozófia hozama egyszerűen összeadódik:

  | elsődleges | másodlagos | együtt legfeljebb |
  |---|---|---|
  | motoros stílus | motoros stílus | +18 |
  | motoros stílus | Panzer | +22 |
  | Panzer | motoros stílus | +26 |

- **A plafon feleződik, a hozam-százalék nem:** a másodlagos szint ugyanúgy a
  saját állapota százalékát adja, csak hamarabb ér a felezett tetejére. Az
  állapot maga amúgy is harmadáron gyűlik (`STYLE2_MS_DIV`).
- **A képernyő** a másodlagos filozófia paneljén a felezett plafont írja ki,
  zárójelben megmondva, hogy ez a teljes érték fele.

Függvények: `engOvrCapK(k)`, `fearOvrCap()`, `STYLE2_OVR_DIV = 2`. Az
`engOvrBonus()` összegéről lekerült a `Math.min(ENG_OVR_CAP, …)`.

## Mérve

A `tools/gegen-pontrendszer-proba.js` fixtúrájában:

- Gegen elsődleges: +11,5
- Villám másodlagos: +6 (a saját plafonján)
- együtt: **+17,5** (a régi szabállyal 12 lett volna)

A próba négy plafont is ellenőriz: Panzer +20 / +10, Gegen +12 / +6.
