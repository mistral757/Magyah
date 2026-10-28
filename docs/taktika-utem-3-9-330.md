# ⚙️ Gyorsabb taktika-begyakorlás, 🎚 a csúszkák a plafonig (3.9.330)

## A bejelentés

> „a taktika begyakorlási sebessége teljesen elfogadhatatlan, az hogy másfél
> szezon alatt egy darab ismertségi szintet lépjen előre, az teljesen
> irreális"

## Az ok

Nem hiba volt, hanem a képlet: a begyakorlás 72-es ismertség fölött
**szintenként 8%-kal** lassult (0,92^(szint−72)). Ehhez jött még két
szorzó: a vereség szinte semmit nem tanított (×0,10), a döntetlen keveset
(×0,35).

Egy közepes idény alap tempón, 60%-os illeszkedéssel ennyit adott:

| Ismertség | Régen / idény | Most / idény |
|---|---|---|
| 80 | +1,8 | +2,6 |
| 85 | +1,2 | +2,1 |
| 88 | +0,9 | +1,8 |
| 90 | +0,8 | +1,6 |
| 92 | +0,7 | +1,5 |
| 95 | +0,5 | +1,3 |

| Út | Régen | Most |
|---|---|---|
| 80 → 90 | 9 idény | 5 idény |
| 80 → 99 | 24 idény | 11 idény |

A „másfél idény alatt +1" tehát a 88–92-es sávban a régi képlet pontos
eredménye volt.

## A változás (kb. kétszeres ütem a 85 fölötti sávban)

* **A lassulás 72 fölött 5% szintenként** (0,92 helyett 0,95). 85-ön ×1,52,
  90-en ×1,78, 95-ön ×2,1 a régihez képest. 72 alatt nincs változás.
* **Az eredmény-szorzó:** a nagy győzelem 1,25, a győzelem 1 (ezek
  maradtak), a **döntetlen 0,5** (0,35 volt), a **vereség 0,25** (0,10 volt).
  A győzelem továbbra is a legjobb tanító, de a vereség sem nulla.
* Minden más szorzó változatlan: illeszkedés, kémia, tempó, csapaterő,
  stílus, edző, talizmánok. A plafon is marad: 99, Guardiolával és
  Mourinhóval 125.
* A futó karrierekre azonnal hat, a következő meccstől.

## A taktika-csúszkák a plafonig érnek

**A hiba:** a 3.9.293 óta a taktika öt csúszkája 60 és 150 közötti
ismertségre volt hangolva (60 · 82,5 · 105 · 127,5 · 150). Az ismertség
viszont 99-nél megáll, így egy átlagos taktikán **soha nem nyílt 2-nél több
csúszka**, és a hatás sem érte el a csúcsát.

**Most** a skála 60-tól a taktika saját plafonjáig fut:

| Plafon | 1. | 2. | 3. | 4. | 5. csúszka |
|---|---|---|---|---|---|
| 99 (átlagos) | 60 | 70 | 80 | 89 | 99 |
| 125 (Guardiola/Mourinho) | 60 | 76 | 93 | 109 | 125 |

* A haszon/kár íve is ezen a skálán fut. A plafonon jár a teljes hatás
  (+20,6% / −5%), a fordulópont 99-es plafonnál kb. 80.
* A panel az új küszöböket, a következő nyitást és a fordulópontot írja ki.

## Próba

`tools/taktika-utem-3-9-330-proba.js` (10 állítás):

* a görbe és az eredmény-szorzó, valódi `tacticTrainAfterMatch`-csel is;
* egy közepes idény kb. kétszer annyit ad;
* a csúszka-küszöbök 99-es és 125-ös plafonnál;
* a teljes hatás a plafonon;
* a panel szövege;
* nincs oldalhiba.

Igazított próba: `csapatszerepek-3-9-293` (az új küszöbök).
