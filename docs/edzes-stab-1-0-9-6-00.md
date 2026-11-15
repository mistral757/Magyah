# 🏋️ 1.0.9.6.00 — Az edzés és a stáb erősebb

## A kérés

> „A stábtagok és az edzés borzasztóan gyengék. Ezeket sokkal kevésbé kellene
> gyengíteni a nehézségi szintekkel. És alapból is az egész rendszernek jóval
> erősebbnek kellene lennie. Jelenleg szinte teljesen hatástalanok ezek. Nézz
> rá a számokra..."

## A mérés (előtte)

A mérés egy valódi, 8.1-es, Gleccser-tempós karrieren futott, 100–160-as
kerettel.

| mit | érték |
|---|---|
| egy szezon fő edzése, játékosonként | 0,4–2,6 attribútum-lépés |
| +5 a teljes kezdő 11 passzán | +0,5 meccserő (gólszerzésen 0) |
| a csapat egész szezonnyi edzésterve | 4 lépés, 0 meccserő |
| Lélekemelő (Sz 56) | +11,9 morál → +0,6 meccserő |
| attribútum-mester | 0,825 pont/meccs, a játékos szintjével NEM nőtt |

**Az okok:**

- **A nehézségi tempó teljes erővel fékezett.** A „Játékosok” tempó
  9.2-n 0,45×, 10.5-ön 0,26×, és az edzésterv meg a stáb is ezen a tempón
  ment.
- **Kevés volt az edzés pontja.** A fő edzés 0,8 pont/meccs, egy
  attribútum-lépés 15 pont.
- **Az átváltás rögzített sávokon telítődött.** Az attribútum→Rating sávok
  (8 / 16 pont) fix számok voltak. Egy 150-es játékos specializációja a
  „telített” farokban ült, miközben a specializációs sáv maga már a szinttel
  nőtt.
- **A stáb alapszorzója kicsi volt (1,5),** és az attribútum-mester kimaradt
  a szint-szorzóból.

## A javítás

1. **A nehézség csak részben fékez.** A nehézségi tempó lassításának csak a
   30%-a hat az edzésre és a stábra (`edzTempoK` / `edzTempoKomp`): a
   Gleccser 0,45 helyett 0,835, a Kőkorszak 0,26 helyett 0,778. Ez vonatkozik
   az edzéstervre (pályán és padon), az attribútum-mesterre és a stábtagok
   tapasztalatszerzésére. A többi fejlődési csatorna (Rating, akadémia,
   taktika) változatlan.
2. **Az edzésterv pontjai 2,5-szeresre nőnek.** A fő edzés 2,0, a mellék 1,0
   pont/meccs (`TRAIN_PLAN_MAIN/SEC`). A boost és a passzkémia a régi
   `TRAIN_MAIN/SEC_PTS`-en marad. A Kényszerítő képesség ugyanennyivel nő,
   hogy az „edzéstervnél is gyorsabban” ígérete igaz maradjon.
3. **Az attribútum→Rating átváltás erősebb és szintarányos.** Egy pont 0,35
   helyett 0,55 Ratinget ér, és a sávok (8 / 16 / farok) a játékos szint-
   szorzójával (`trainScale`, 80-as Ratingen 1, 176-tól 2,2) tágulnak. Ez a
   hátrányos (negatív) eltérésre is szimmetrikusan igaz.
4. **A stáb alapszorzója 1,5 → 2,5.** Ebből:
   - attribútum-mester: 1,375 pont/meccs, mostantól × a játékos szintje;
   - Lélekemelő: 22,5 morál fókuszonként (plafon 35; a morál 92-es plafonja
     megmarad);
   - Csapatkovács: 15;
   - forma-súly: 3,75;
   - orvos-súly: 1,625 (a −65%-os padló megmarad);
   - a skill-kiosztás 2,0-s alapszorzót kap (3,6), mert az máshol is
     hatványoz.

## Utána: egy 25 éves játékos, a fő attribútumára edzve, 35 meccs

| nehézség (játékos-tempó) | Rating ~120: lépés / Rating egy szezon alatt | Rating ~176+: lépés / Rating egy szezon alatt | 3 szezon (~176+) |
|---|---|---|---|
| 4.1 (Alap 0,8 → 0,94) | 1,8 / +0,6 → **5,3 / +2,9** | 2,6 / +0,9 → **7,7 / +4,2** | +2,8 → **+11,2** |
| 7.1 (Csiga 0,56 → 0,87) | 1,3 / +0,4 → **4,9 / +2,7** | 1,8 / +0,6 → **7,1 / +3,9** | +1,9 → **+10,7** |
| 9.2 (Gleccser 0,45 → 0,835) | 1,0 / +0,4 → **4,7 / +2,6** | 1,5 / +0,5 → **6,9 / +3,8** | +1,6 → **+10,5** |
| 10.5 (Kőkorszak 0,26 → 0,778) | 0,6 / +0,2 → **4,4 / +2,4** | 0,9 / +0,3 → **6,4 / +3,5** | +0,9 → **+10,1** |

**A nehézség hatása:** a 4.1 és a 10.5 közötti különbség az edzésnél eddig
3,2× volt, mostantól 1,2×.

A 24 év alattiak a kor-görbe miatt (×1,6–2,0) ennél is gyorsabban fejlődnek,
a 30 fölöttiek (×0,4) lassabban.

**Futó karrier:** az erősebb átváltás a meglévő specializációkon is azonnal
érvényes. A mért 8.1-es mentésen a csapaterő a betöltéskor +2,3-at, a
meccserő +2,1-et nőtt.

## Próba

`tools/edzes-stab-1-0-9-6-00-proba.js`:

- **A csillapítás:** Gleccser 0,835, Kőkorszak 0,778.
- **Az átváltás:** 0,55 Rating/pont, szintarányos sávok.
- **A stáb szorzói:** az új értékek.
- **Valódi meccs Gleccser-tempón:** a középpályások fő edzés-pontja a
  mérlegben betűre a képlet szerinti, a réginek 4,64-szerese.
