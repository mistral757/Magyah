# A kihívás-jutalom egy egész kategóriát old fel (3.9.89)

## A bejelentett kérés

> „Az a jutalom ami egy beragadt mérföldkő jutalmát oldja fel az változzon meg
> arra hogy az egyik stílusmérföldkő csoportot amelyikben ugye beragadt
> mérföldkő is lehetne egy az egyben feloldja."

## Mi volt eddig

A hosszú és a kupa-kihívások jutalomkészletében állt egy `msUnstick`:

> „egy beragadt mérföldkő jutalma azonnal befolyik"

A **legrégebben** beragadt fokozatot fizette ki, egyet. A stílusfa
nagyságrendjéhez képest ez alig érződött — egy hosszú kihívás vállalásáért
egyetlen fokozat jutalma.

## Mi lett belőle

> „egy egész mérföldkő-kategória feloldása — a benne álló fokozatok azonnal
> fizetnek"

A hat kategória (`MS_STYLE_CATS`: Vagyon · Transzferpiac · Utánpótlás és stáb ·
Trófeák · Bajnoki fölény · A nagy ugrás) az egyetlen dolog, ami a
mérföldkő-rendszerben **zárható** — és a beragadás is innen ered. A „csoport"
tehát ezekre szól: a jutalom egyet **ingyen** kinyit.

## A két ág, és miért kell kettő

Fontos részlet: **beragadt fokozat csak MÁR NYITOTT kategóriában létezik.** A
zárás alatt teljesült fokozat nem a teljesítéskor ragad be, hanem a
**megnyitás** pillanatában (`msUnlockCat` → `M.pend`). Egy zárt kategóriában
tehát nincs mit „feloldani" — ott maga a kategória a zár.

Ezért a jutalom két ágon dolgozik:

1. **Van még zárt kategória** → azt nyitja meg **ingyen** (`msGrantCat`), és
   ami a zárás alatt már teljesült, az **nem ragad be, hanem azonnal fizet**.
   Ez a szó szerinti „egy az egyben feloldja".
2. **Már minden nyitva** → a **legtöbb beragadt fokozatot tartó** kategória
   **összes** beragadt jutalma egyszerre folyik be (`msReleaseBestCat`). A
   többi kategória beragadt jutalma érintetlen marad.
3. Ha egyik sem áll fenn, a jutalom — őszintén — elvész, és ezt ki is mondja.

## Melyik kategóriát viszi

A **legtöbbet érőt**: ahol a legtöbb kész fokozat vár (a fizetős úton pont azok
ragadnának be). Döntetlennél a **drágábbat**, mert azt nehezebb kiváltani.

```
piac: 3 kész · vagyon: 1 kész   →  „feloldva: Transzferpiac — a benne álló 3 fokozat azonnal fizetett"
vagyon: 2 kész · trofeak: 2 kész →  Trófeák (858 vs 429 a nyers ár)
```

## Ami NEM változott

A **fizetős** megnyitás (`msUnlockCat`) betűre a régi: a büdzséből megy, és a
kész fokozatokat **beragasztja** — azok a saját sávjuk következő fokozatára
várnak. A jutalom tehát nem írja felül a rendszer gazdaságát, csak egyszer
átugorja.

A jutalom kulcsa szándékosan maradt `msUnstick`: egy **futó** kihívás jutalma a
mentésben is ezzel a névvel ül, így a régi vállalás is az új, nagyobb jutalmat
kapja meg — migráció nélkül.

## Egy mellékesen javított szöveg

A súgó („A beragadt jutalom nem vész el") eddig azt állította, hogy amit zárt
kategóriában teljesítettél, az *„a megnyitáskor egyszerre fizet ki"*. Ez nem
volt igaz: a megnyitás beragaszt, és a sáv következő fokozata engedi ki. A
szöveg most ezt mondja — és megemlíti az új jutalmat is, ahol viszont tényleg
nem ragad be semmi.

## A próba

`node tools/merfoldko-kategoria-jutalom-proba.js` (9029-es port) — 17 állítás:
a jutalom szövege, az ingyenes megnyitás (a büdzsé nem mozdul, nulla beragadás,
azonnali fizetés), a kategóriaválasztás és a döntetlen-szabály, a második ág
(a legtöbb beragadtat tartó kategória kiürül, a többi érintetlen), az üres
eset, és hogy a fizetős út változatlanul beragaszt.

**Egy csapda a próbaíráshoz:** a mérföldkő-tábla küszöbe lehet 0 vagy negatív
is (a nehézség-lépcsők miatt), tehát egy „nem kész" csonknak a küszöb ALÁ kell
mennie, nem nullára — különben magától teljesítettnek számít.
