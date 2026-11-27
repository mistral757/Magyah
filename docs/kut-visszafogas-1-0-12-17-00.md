# 1.0.12.17.00 — Kezdő út: az ellenfél visszafogása az első idény feloldásaiig

## KIMONDOTT KÉRÉS
> „Nehézségi szint problémák vannak akkor, ha 5.1 fölött indul egy karrier tanítós üzemmódban, mivel nincsenek
> eszközei a feloldásokig a csapata fejlesztésére. Az alatt nincs igazán gond szerintem. De onnan felfelé kicsit
> az ellenfél fejlődésébe bele kell nyúlni az első szezon feloldásai alatt. Azaz, hogy visszafogni az ellenfél
> fejlődését az egyes feloldásokig különböző százalékokban. Erre kéne számításokat csinálnod és nehézségi
> szintekre scalelve elkészítened a visszafogás mértékét."

## A számítás (reprodukálható: `node tools/kut-visszafogas/szamitas.js`)

### 1. A mért bemenetek

| Forduló | 4–6. | 7–10. | 11–15. | 16–20. | 21–25. | 26–30. |
|---|---|---|---|---|---|---|
| Tapasztalt játékos ⚡-ja, minden eszközzel¹ | +0,97 | +1,45 | +2,22 | +3,11 | +4,09 | +6,06 |
| Eszköz nélküli játékos (valódi motor)² | +0,72 | +0,88 | +1,16 | +1,29 | +1,30 | +1,80 |
| **Az emelők** (különbség) | +0,25 | +0,57 | +1,06 | +1,82 | +2,79 | +4,26 |

¹ A `meres-adat` ág, 25 lezárt 1. idény (fokozat 6.3–9.5). A blokk mediánja, az 1–3. forduló átlagához mérve.
² `tools/kut-visszafogas/meres.js`: 5.1-en, D3-ban 16 gépi idény, vásárlás és boost nélkül.

**Mellékmérés:** az edzésterv és az összhangépítés korai (1. forduló) vagy késői (6. forduló, illetve soha) beállítása között az első idényben **nincs mérhető különbség**. Az eltérés ±1-en belül marad, a morál és a forma lengése alatt.

**Az emelők összetétele:**
- **Boost:** az 1. idényben átlagosan +1,08 a 25. fordulóig (`boostok.csv`, 25 idény). Ez az emelők kb. 39%-a.
- **Átigazolás:** kb. 35%. A Kezdő úton is ugyanúgy a 8. fordulóban nyílik, ezért nem hiány.
- **A többi eszköz:** kb. 26%.
  - elemzés és meccserő-bontás 8
  - csapatszerepek 7
  - talizmán 7
  - stáb, scout-cél, klub 4

**A mezőny üteme** 5.1-en, D3-ban: 0,149 ⚡ fordulónként.

### 2. A zárt rész szakaszonként (5.0 fölött a Boost már a 2. szakasz végén nyílik)

| Szakasz | A Kezdő úton még zárva | Zárt rész | Jellemző fordulók |
|---|---|---|---|
| A — 1–2. (első tizenegy, első meccsek) | minden emelő | 100% | 1–5. |
| B — 3. (fejlődés) | elemzés, szerepek, talizmán, stáb | 26% | 6–12. |
| C — 4. (a csapat lelke) | szerepek, talizmán, stáb | 18% | 13–19. |
| D — 5. (szerencse és kockázat) | talizmán, stáb | 11% | 20–25. |
| E — 6. (a mérleg) | stáb, scout-cél, klub | 4% | 26–30. |

**Visszafogás** = a zárt rész × az emelők üteme ÷ a mezőny üteme, a szakasz fordulóin átlagolva. Egy feloldás után nem nőhet.

Az alap (5.1-en): **22% · 15% · 15% · 14% · 8%**, utána 0.

### 3. Skálázás a nehézségre

k = (3,2 − célrés) ÷ (3,2 − 1,6)
- **A párna:** a 4.x „Haladó” célrése (3,2) az a párna, amelyen a hiány még nem fáj. Ott k = 0: „az alatt nincs igazán gond”.
- **Az egység:** az 5.1 célrése (1,6), itt k = 1.
- **A teteje:** legfeljebb 75%.

| Fokozat | Célrés | k | A | B | C | D | E |
|---|---|---|---|---|---|---|---|
| 4.x | 3,2 | 0 | 0% | 0% | 0% | 0% | 0% |
| 5.1–5.5 | 1,6 | 1,00 | 22% | 15% | 15% | 14% | 8% |
| 6.1 | 1,4 | 1,13 | 25% | 17% | 17% | 16% | 9% |
| 6.5 | 1,0 | 1,38 | 30% | 21% | 21% | 19% | 11% |
| 7.1 | 0,9 | 1,44 | 32% | 22% | 22% | 20% | 12% |
| 7.5 | 0,5 | 1,69 | 37% | 25% | 25% | 24% | 14% |
| 8.1 | 0,4 | 1,75 | 39% | 26% | 26% | 25% | 14% |
| 8.5 | 0,0 | 2,00 | 44% | 30% | 30% | 28% | 16% |
| 9.1 | −0,1 | 2,06 | 45% | 31% | 31% | 29% | 17% |
| 9.5 | −0,5 | 2,31 | 51% | 35% | 35% | 32% | 19% |
| 10.1 | −0,6 | 2,38 | 52% | 36% | 36% | 33% | 19% |
| 10.5 | −1,0 | 2,63 | 58% | 39% | 39% | 37% | 21% |

## Ellenőrzés a valódi motoron (`MODOK=B,K node tools/kut-visszafogas/meres.js`)

| Fokozat | Mezőny ütem/forduló | Idény alatti mezőny-növekedés Kezdő út nélkül | Kezdő úttal | Visszatartva |
|---|---|---|---|---|
| 4.5 | 0,149 | 4,47 | 4,47 | 0 |
| 5.1 | 0,149 | 4,47 | 3,81 | 0,66 |
| 7.1 | 0,123 | 3,69 | 2,90 | 0,79 |
| 9.1 | 0,099 | 2,97 | 2,06 | 0,91 |
| 10.5 | 0,057 | (1,71) | 1,05 | 0,66 |

## A működés (`kutFekPct`, `kutFekTick`, `kutFekAcc` — a `pyrGrowNow` mellett)
- **Hatókör:**
  - csak az 1. idényben;
  - csak amíg a Kezdő út él (a „Mindent kinyitok” után nem);
  - csak a 5.1-es és magasabb fokozaton.
- **Hol hat:** a saját bajnoki meccseid mezőnyén, a `pyrGrowNow` fedőrétegén. A gépi bajnokságok és a világ érintetlenek.
- **Gyűlik:** fordulónként, az adott forduló szakasza szerint (`S.pyr.kutFek`). Egy feloldás nem írja át visszamenőleg a korábbi fordulókat. A visszatartott rész a szezon végéig megmarad.
- **Naplóüzenet:** egyszer szól, amikor először hat.
- **Közös karrier:** nem érinti, mert ott a Kezdő út nem él.

## Mire figyelj
- **A számok mérésből jönnek, nem érzésből.** Az első idényben az eszközök hiánya kisebb, mint amilyennek tűnik. A tapasztalt játékos előnyének nagyja a boostból és az átigazolásból jön, és ezek Nehéz fokozattól a Kezdő úton is korán nyílnak.
- **Ha ez kevésnek bizonyul,** a `KUT_FEK.alap` egy szorzóval egyben emelhető. Ez a kezdő tudás hiánya miatt lehet így: nem csak az eszköz hiányzik, hanem a rutin is.
- **A mérés hiányosságai:**
  - a tapasztalt-adat a 6.3–9.5 fokozatról van;
  - a bot kerete gyengébb egy valódi draftnál;
  - a lezárt eszközökön belüli arányok (8/7/7/4) becslések.

## Próba
`tools/kut-visszafogas-1-0-12-17-00-proba.js`:
1. a nehézségi szorzó;
2. a játék táblázata = a számítás;
3. a szakaszonkénti százalék, és ahol 0;
4. a gyűjtés: idempotens, a `pyrGrowNow` ennyivel kisebb, a feloldás nem ír vissza;
5. nincs oldalhiba.

**Lefutott még:** `nehezseg-3-9-222`, `eromerleg-1-0-11-18-00`, `kezdo-ut-motor-1-0-11-16-00`, `nehezseg-tortenet-3-9-349`, `osztott-nehezseg-3-9-316`.
