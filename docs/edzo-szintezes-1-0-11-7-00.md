# 👔 1.0.11.7.00 — A saját edződ is szintezhető (mester-szintezés)

## A kérés

> „Ne csak a csapatstílus edzői lehessenek felfejleszthetők. […] Legyen egy
> one time purchase az edzői felületen, hogy ha olyan edződ van, aki nem illik
> a csapatstílusodhoz vagy egyáltalán nem szerepel a csapatstílus edzők
> között, attól még neki is lehessen ez a szintező. Ezért is csapatstílus
> pontot kelljen fizetni, aminek 9.5 nehézségi szinten 30 stíluspont legyen a
> bázis ára. (Scalelődjön fel-le) És aztán ugyanitt […] lehessen a három
> szintet kifejleszteni, ugyanazokért az árakért, amikbe a többi edző
> lvl1-lvl3 közötti árai. Az első onetime purchase lvl0-ra hozza az edzőt […]
> Erre is kössünk rá egy értesítést, és ezt a megvásárlást is leghamarabb a
> csapatstílus választás után lehessen megtenni."

## Hol van

HUB → Csapatépítés → 👔 Edző → **🎓 Mester-szintezés** blokk (az elemző
irányok alatt).

## A szabály

**Kinek:**

- csak a csapatstílus választása után;
- csak ha a mostani edző nem az egyik élő stílusod edzője. Ha ő a stílusod
  edzője, a képességfa viszi a szinteket, és ott olcsóbb.

**Mit ad** — pontosan azt, amit a stílus-edző képessége, csak a TE edződ
kedvelt (első) taktikáján:

| szint | hatás |
|---|---|
| 0 (megnyitás) | csak megnyitja a szintezést |
| 1 | a taktika kétszeres tempóval gyakorlódik be |
| 2 | az ismertség plafonja 125, az illeszkedés teteje 150% |
| 3 | 150, illetve 200% (a meccshatás sapkája 2,1 → 3,63) |

Egyetlen csatornán fut: a `styleCoachTacticLevel` a saját edző szintjét is
nézi. Így a plafon, a tempó és az illeszkedés teteje magától követi. A
párharc pillanatképének formája nem változik.

**Az ár (csapatstílus-pont):**

- **Megnyitás:** 30 pont a 9.5-ön. A nehézséggel változik, a ládák
  nehézség-szorzójának fordítottjaként:

  | nehézség | 1.1 | 7.1 | 9.5 | 10.5 |
  |---|---|---|---|---|
  | ár (pont) | 15 | 23 | 30 | 34 |

- **A három szint:** 54 · 92 · 146 pont. Ez pontosan a stílus-edzők ára
  (III. ársáv × 1,35), a próba a fából olvassa ki.

**Az összeg a 9.5-ön:**

| út | pont |
|---|---|
| saját edző | 322 |
| stílus-edző leszerződtetése | 292 |
| ha eleve a stílus edzője ül a kispadon | 238 |

A saját edző tehát a legdrágább. Cserébe nem kell edzőt cserélni (az
edzőváltás a taktikák begyakorlását újrakezdi), és az marad, akit akarsz.

**Edzőnként tárolódik** (`S.edzoSzint.m[név]`). Ha elküldöd, a hatás
megszűnik; ha visszajön, a szintje vele jön. A mentés viszi.

**Értesítés:** amikor először elérhető (stílus van, és nem a stílus edzője
ül a kispadon), a napló egyszer szól, a megnyitás árával. A megnyitás és
minden szintlépés is naplósort kap.

## Próba

`tools/edzo-szintezes-1-0-11-7-00-proba.js`:

- a zár stílus nélkül;
- az árak nehézségenként, és a szintárak egyezése a fával;
- a megnyitás és a három szint hatása;
- hogy más taktikán nem hat;
- az edzőcsere és a visszatérés;
- a stílus-edző kizárása;
- az egyszeri értesítés;
- a mentés;
- a panel gombjai, megerősítéssel.

A stílus-edző, a taktika (fejléc, illeszkedés, illeszkedés teteje, ütem,
edzőváltás) és az Edző-panel próbái változatlanul zöldek.
