# 3.9.224 — 💰 A pénzrobbanás fékjei és 🤝 a rejtett PvP kezdő kiegyenlítés

> „3 szezon alatt ekkora különbség keletkezik, még úgy is, hogy vannak
> hangolások. Ők: 1. a kezdő erősség a két csapatnál nagyon sokat számít,
> akár 1 rating különbség a draftban is óriásit dobhat. 2. Ha sikerül
> valamivel megdobni a pénzbevételt, akkor megnyerted a játékot,
> gyakorlatilag vége. […] a sztárom a párom pl. ha második szezon végén
> eladja a sztárját akkor kb 30-40k Mrd készpénzre tesz szert […] van egy
> slight hangolás a draft után első szezon kezdete előtt is. (Erről nem kell
> szólni a játékosoknak, csak erősítsük fel mindig a gyengébbet annyira, hogy
> legfeljebb 0.75 rating különbség legyen a kezdő meccserőben)"

## Amit az adat mutatott

A szerveren gyűlő mérési napló (Firebase, `meres/`) ebből a környezetből nem
olvasható, ezért a repóban lévő névtelen kivonatból dolgoztam
(`tools/meres/adat/mentesekbol-2026-10.json`, 8 karrier). A bevételek
kategóriánként:

| karrier | idény | működési keret | a kirívó tétel |
|---|---|---|---|
| m_2ec31d | 4. | 123 255 | **`saleStar` 513 315 883** (a sztár eladása, a keret ~4000-szerese) |
| m_2ec31d | 5. | 101 259 | **`investRet` 512 784 000**: a befektetés megduplázta |
| m_436f7f | 4. | 352 519 | **`saleStar` 204 853 562** |
| m_2ec31d | 5. | 101 259 | `fameFans` 1,46M · `fameAd` 1,07M: a hírnév a keret 25-szörösét hozta |

A három forrás ugyanaz a minta: egy SZORZAT, aminek nincs felső vége.

* **Kikiáltási ár** = piaci érték (∝ POT^2,35) × szezonkártya (×5,2-ig) ×
  életmű (×6-ig).
* **Befektetés:** a büdzsé fele duplázható, bármekkora is a büdzsé.
* **Hírnév:**
  * a szurkoló-robbanás egyenként az organikus tábor 20–250%-a, idényenként 4×;
  * a reklám a heti lelátó 100–700%-a, 8×-ig.

## A javítás

### 1. A kikiáltási ár piaci plafonja

A kikiáltási ár másfél idénynyi **működési keretig** (`seasonBudgetCore`)
betűre a régi. E fölött logaritmikusan nő:
`T × (1 + 0,25 × ln(ár / T))`, ahol `T = 1,5 × keret`.

| a nyers ár / T | eddig | mostantól |
|---|---|---|
| ×1 | T | T |
| ×2 | 2T | 1,17T |
| ×10 | 10T | 1,58T |
| ×1000 | 1000T | 2,73T |
| ×4000 | 4000T | 3,07T |

* A plafon a kikiáltási árra ül, ezért mindenhol ugyanaz a szám hat:
  * a gyors eladás (×0,25);
  * a piaci licitek (60–125%);
  * a kijelzés;
  * az ügynökségi pont.
* A normál eladás nem változik: a mért idényekben egy-egy ember a keret
  töredéke.
* Ha a plafon fog, az eladási ablak alján egy sor kimondja: „🏦 Piaci plafon”.

### 2. A hírnév (Sztárom a párom) két plafonja

* **A sztár-hozta tömeg** legfeljebb akkora, mint az organikus tábor: a sztár
  a saját tábort legfeljebb még egyszer hozza el.
* **A reklám és a befektető** készpénze idényenként legfeljebb a működési
  keret 60%-a.

### 3. A befektetés

Legfeljebb a büdzsé fele, **és legfeljebb egy idénynyi működési keret**. Így
egy kirívó bevétel nem duplázható meg.

### 4. 🤝 Rejtett PvP kezdő kiegyenlítés

* **Mikor:** az 1. idény szezonindító cseréjén, a draft után. Ekkor a két
  kliens amúgy is elküldi egymásnak a meccs-erejét (`mstr`).
* **Mit csinál:** ha a saját meccs-erőm **0,75-nél többel** elmarad a társétól,
  a keret 11 legnagyobb potenciálú embere annyi ratinget kap, hogy a
  különbség **pontosan 0,75** legyen.
* **Csak felfelé:** az erősebb oldal nem mozdul. A két gép egymástól
  függetlenül, ugyanabból a két számból dönt.
* **Egyszer fut:** karrierenként egyszer (`S.mpStartEq`), és **a napló nem szól
  róla**.
* **Saját tábla** (`S.mpStartP`):
  * a szezonvégi hangolás ±3%-os plafonját nem fogyasztja;
  * a nyers erő (`mpRawStrength`) nem látja;
  * a mentés viszi.
* **Névenkénti plafon:** a nyers erő 10%-a, tehát egy elszállt draftot sem
  rendez át teljesen.

## Próba

`tools/penz-pvp-kezdes-proba.js`: **18 állítás**, valódi böngészőben.

## Utólag (3.9.251): a plafon mércéje a valódi bevétel

> „Amikor indult a szezon, volt kb 5 játékosom, akiknek 80 milliárd körüli
> azonnali ára volt […] a 8. héten már csak 16 milliárd körüli az azonnali
> áruk, pedig játszottak is."

A fenti plafon mércéje a **működési keret** volt (a csapaterőből és a mezőnyből
számolt nyári pénz). A valódi bevétel java viszont a **lelátó** (hetente fizet, a
keretben nincs benne) és a **kupadíj**: a bejelentő társának naplójában (2. idény)
a lelátó 452 980, a kupadíj 211 122 pont volt — a működési keret ennek töredéke. A
plafon így egy átlagos értékes játékost is az ötödére nyomott (80 → 16 Mrd), nem
csak a kirívó sztárt.

**Mostantól** a mérce a klub rendszeres bevétele egy idényre: szezonkeret + lelátó +
kupadíj + kihívás- és mérföldkő-jutalom (az eladás nem — különben egy sztár-eladás a
saját plafonját emelné), a tavalyi idényből vagy az idei futó ütemből (8 forduló
után), és sosem kevesebb a működési keretnél. A küszöb továbbra is 1,5 idény.

| | régi mérce | új mérce |
|---|---|---|
| a bejelentett ár (160 000 pont kikiáltási = 80 Mrd azonnali) | 10 331 | **160 000** (érintetlen) |
| a mért sztár-eladás (513 315 883 pont) | — | 2 677 085 (~3,8 idénynyi valódi bevétel) |

Próba: `node tools/eladasi-plafon-bevetel-proba.js` (8 állítás).
