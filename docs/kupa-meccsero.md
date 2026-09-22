# 🏆 A kupamezőny a meccs-erőhöz mér (3.9.126)

## 1. Az audit és a döntés

A 3.9.125-ös átvizsgálás nyolc kalibrációs kaput talált, ami még nyers erőt
mért. A megállapodás: **1–5 váltson, 6–8 maradjon**. Ez a lap az elvégzett
munka és a mérés jegyzőkönyve.

## 2. A legnagyobb tétel: a kupamezőny

```js
// régi
f = max(nyers, mezőnyszint) + befagyasztott_rejtett/2 − edge
// új
f = max(nevezési_meccs-erő, mezőnyszint) − edge
```

A fölényed a régi képletben `edge + rejtett/2` volt. Mivel a rejtett bónusz
a karrier során **+4-ről +30 fölé** nő, a kupa nehézsége teljesen ettől
függött — ami sosem volt tervezői döntés:

| rejtett bónusz | +4 | +10 | +20 | +30 |
|---|---|---|---|---|
| **régi fölény (KK)** | 4,9 | 7,9 | 12,9 | **17,9** |
| **új fölény (KK)** | **7,9** | **7,9** | **7,9** | **7,9** |

A karrier elején fojtogató, a végén séta. Az új képletnél állandó.

## 3. Az új alapérték levezetve, nem tippelve

Az `oppDelta` a fölénybe **nem** szól bele: az `euroMidRating`
`round(f − d)`-t ad vissza, a hívó `+ d`-t tesz rá, a kettő kiejti egymást.
A sorozatok rangsorát tisztán az `EURO_EDGE.add` viszi.

> **A saját mérőeszközöm első változata épp ezt vétette el**, és hamis,
> hárompontos lépcsőt mutatott a sorozatok közt. A javítás után derült ki,
> hogy a valódi lépcső egypontos.

```
régi fölény = edge_régi + rejtett/2
új fölény   = edge_új
cél: a KÖZÉP-karrier (rejtett ≈ +10) maradjon változatlan
→ base_új = base_régi + 5 = 1,2 + 5 = 6,2
```

Mérve, a +10-es kalibrációs ponton a régi és az új fölény **bitre azonos**
mind a négy sorozatban és mindkét karrierszakaszban:

| | KK | OJK | KONF | MK |
|---|---|---|---|---|
| régi (rejtett +10) | 7,9 | 8,9 | 9,9 | 10,9 |
| **új (bármely rejtettnél)** | **7,9** | **8,9** | **9,9** | **10,9** |

A plafonok tágultak (4,5–9 → 9,5–13,5), mert a régiek az új alapértéknél
már a kiindulásnál aktívak lettek volna; az újak csak teljes dominanciánál
fognak.

## 4. Amit a mérés FELÜLÍRT a saját javaslatomból

Az audit a **dominanciát** (#2) és a **szezonkezdő csapaterőt** (#3) is a
váltandók közé sorolta. **A mérés ezt megcáfolta.**

Az `euroDominance` a kereted és a **mezőnyszint** (`oppTargetRating`)
különbségéből dolgozik — az pedig nyers skálájú szám. Meccs-erőre váltva a
különbség a rejtett bónusszal együtt nőne, a dominancia felszaladna, az
`edge` vele, és a kupa fölénye **újra a rejtett bónusztól függene** —
pontosan az a sodródás, amit az imént szüntettünk meg.

A két oldalnak azonos skálán kell állnia, és itt az a nyers. A #3 csak a
#2-t táplálja, tehát az is marad.

## 5. A PvP három helye (#4, #5, #6)

| hol | régen | most |
|---|---|---|
| `pyrAnchorShared` — a közös világ horgonya | a két nyers keret átlaga | a két **`mstr`** átlaga |
| `mpCupSharedMid` — a közös kupa mezőnye | az erősebb nyers keret | az erősebb **`mstr`** |
| `mpResolveLevel` auto ága | `(nyers+nyers)/2 + 1` | `(mstr+mstr)/2 + 1` |

A `pyrAnchorShared` volt a legfontosabb: a karrier eleje nyers skálán
kalibrált, a D0 fölötti rész (3.9.112) viszont már meccs-erőn — **két
különböző skála ugyanabban a karrierben**. Az `mstr` 3.9.104 óta utazik a
kézfogásban, és 3.9.122 óta nevezési szám, tehát a lebutítás-védelem is hat
rá. Régi kliensnél mindhárom helyen a nyers marad.

## 6. A lebutítás-védelem a kupánál is

A kupamezőny a **nevezési** meccs-erőre horgonyoz. Mérve: egy szándékosan
gyenge tizenegynél a mezőny **27 ponttal** esik a **54** helyett — pontosan
a fele, ahogy a 3.9.122 szabálya mondja.

## 7. Ami nem változott

- **Sztár-piac kapuja (110)** — nyers marad. A kód érve áll: *„egy jó napi
  forma nem nyithat meg egy piacot."*
- **`mpSquadStrength` (PvP handicap)** — a keret **mélységét** méri, nem a
  napi formát; meccs-erőn két kliens közt hullámzana. *(Külön megjegyzés: a
  top-14 KERET átlaga, tehát a kezdő tizenegyet figyelmen kívül hagyja — ez
  önálló kérdés, nem a meccs-erőé.)*
- A kupa-kihívások „nálad erősebb" küszöbe és a meccsjelentés `ovrGap`-je: a
  KIJELZETT számpárral kell egyeznie, azt pedig nem bolygattuk.

## 8. Eszközök

- `tools/kupa-meccsero-proba.js` — 14 állítás (a régi kódon 8 bukik)
- `tools/kupa-mezony-meres.js` — **mérőeszköz, nem próba** (kilépési kódja
  mindig 0): karrierszakaszonként és rejtett-bónuszonként kiírja a régi és az
  új fölényt. Ezzel lett levezetve a 6,2.
