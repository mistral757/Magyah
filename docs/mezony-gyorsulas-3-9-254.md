# 🏃 A mezőny idény közbeni gyorsulása (3.9.254)

## A kérés

> „4. szezontól kezdve már a magas nehézségi szinten indított karrier is
> elunalmasodik, mert túl jó már a csapat, túl sok a pénz, túl gyorsan fejlődünk,
> semmi esélye az ellenfeleknek. Be kéne vezetni a mérési adatainkból kiindulva egy
> olyan rendszert, ami szezonról szezonra erősíti a szezon közbeni fejlődési
> tempóját az ellenfélnek, és ezen még tovább erősít az, hogy épp hanyadik
> divízióban vagyunk. Ez azért fontos, hogy ne növeljük a beragadás esélyét. […]
> Eleinte lőjünk inkább alá"

## A mérés

Forrás: a `meres-adat` ág (Firebase-szinkron, 2026-10-15), a kétoldalú szabályozó
`dg` mezője = a rés (⚡ meccserő − mezőny) változása egy idény alatt.

| Idény | n | dg (medián) | megjegyzés |
|---|---|---|---|
| 1. | 4 | +5,1 | |
| 2. | 5 | +10,3 | szórás −5,6 … +33,4 |
| 3. | 1 | +13,4 | |
| 4. | 1 | ~+19 | 26 forduló, 26–0–0 |

Jó közelítés: **dg ≈ 5 + 4,5 · (idény − 1)**. A mezőny idény közben eddig csak
az éves alapütemmel nőtt (`pyrGrowStep`, ~4–7 pont/idény), a csapatok 15–50-et.
Az idényrajti horgony ezt minden nyáron visszaállította, idényen belül viszont
egyre gyorsabban lehetett elhúzni.

## A szabály

Csak az **idény közbeni** mezőny-növekedésre ül (`pyrGrowNow`). Az éves
világfejlődés és a szabályozó modellje érintetlen — különben a rajt „visszaadná”
a nehezítést.

| | |
|---|---|
| kezdés | a 4. idénytől |
| mérték | a mért többlet (dg − 5) **30%-a**, alálőve: 4. idény +4,05 · 5. +5,4 · 6. +6,75 · 7. +8,1 · 8. +9,45 · legfeljebb **+10** pont egy idényre |
| osztály | legalul ×0,5 → élvonal ×1,0 → szuperligák ×1,05 … ×1,15 (lent, a feljutásért küzdve kevesebb) |
| tempó | a mért karrierek Komótos (×0,7) tempón futottak — ehhez arányosítva |
| beragadás-őr | abban a fordulóban, amikor a ⚡-előny a mezőny fölött a fokozat célrése alatt van, nincs gyorsulás |

Fordulónként gyűlik (`S.pyr.gyors.acc`, idényhez kötve), és a mezőny erejébe a
`pyrGrowNow` adja hozzá — a meccs, a kijelzett erő és a nehézség-tanácsadó is
látja. Az AI–AI meccseket nem érinti (az osztályon belül mindenkire ugyanaz). A
napló idényenként egyszer szól, amikor elindul. A mérési napló `padlo.gyors`
mezője rögzíti, mennyi gyűlt és hány fordulóban állt meg az őr miatt — ebből
látjuk majd, hova kell tovább hangolni.

**Hangolás egy helyen:** `NF_GYORS` (`arany` 0,30 → nagyobb érték = erősebb).

## Próba

`node tools/mezony-gyorsulas-proba.js` — 15 állítás.
