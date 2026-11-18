# 🏋️ 1.0.11.4.03 — A stáb és az edzés a magas szinten

## A bejelentés

> „370-es mezőny mellett különösen, de bármilyen körülmények között teljesen
> elfogadhatatlan, hogy milyen kevés a fejlődés, amit egy stábtag hozzáad…
> Kb. 20× ennyi lenne a reális, de lehet, hogy keveset mondtam.”

## A mérés (előtte)

Az eset: Játékmester (Sz 70), 9 középpályás fókusz, 38 éves játékos. A
stábelőrejelzés „Passz +0,4” egy idény végéig (19 forduló).

| játékos szintje | szint-szorzó | lépés 19 meccs alatt |
|---|---|---|
| 80 | 1,0 | 0,17 |
| 176 | 2,2 | 0,36 |
| **300** | **2,2** | **0,36** |
| **370** | **2,2** | **0,36** |

**A két ok:**

1. **A szint-szorzó (`trainScale`) a 176-os Ratingnél megállt (2,2×).** Egy
   370-es mezőnyön a játékosok 300 körül járnak, ott egy attribútum-lépés a
   Rating 0,3%-a, a szorzó viszont 3,75× helyett 2,2× volt. A specializációs
   sáv (`attrBandOf`) és az attribútum→Rating átváltás sávjai is ehhez
   kötődnek, ezért a plafon őket is szűken tartotta.
2. **A figyelem felosztása 9 játékos között erősen szórt.** Fejenként
   100/9^0,72 = 20,6 jut, így a széles fókusz csak a töredéket adta.

## A javítás

- **`TRAIN_SCALE_MAX` 2,2 → 6** (480-as Ratingig követ). Az edzésterv, az
  attribútum-mesterek, a boost, a passzkémia, a specializációs sáv és az
  átváltás sávjai mind arányosan nőnek a játékos szintjével.
- **Attribútum-mesterek:**
  - `COACH_ATTR_BOOST = 4,5`: az alap-pontjuk ×4,5 (1,375 → 6,19
    pont/meccs).
  - `COACH_ATTR_EXP = 0,40`: a figyelem kitevője 0,72 → 0,40 csak náluk
    (`coachAttrPower`).
    - 9 játékosnál fejenként 41,5 jut 20,6 helyett.
    - Egy főnél a figyelem 100 marad.
    - A „szűk vs széles” választás megmarad, a széles fókusz csak kevésbé
      büntetett.
  - A stábtípusok többi része (forma, orvos, morál, kémia, skill, kispad)
    változatlan.
- A kártyán a „fejenkénti figyelem”, a pont/meccs és a magyarázó szöveg az
  új értékeket mutatja. A stábelőrejelzés ugyanazt a képletet használja,
  mint a motor, ezért az előrejelzés egyezik a könyveléssel.

## Utána (ugyanaz a mérés)

| játékos szintje | szint-szorzó | lépés 19 meccs alatt | a régihez képest |
|---|---|---|---|
| 80 | 1,0 | 1,55 | 9× |
| 176 | 2,2 | 3,28 | 9× |
| **300** | **3,75** | **5,59** | **15×** |
| **370** | **4,63** | **≈ 6,9** | **≈ 19×** |

- A 26 éves, 300-as játékos egy teljes idényben (35 forduló) 20,6 lépést
  kap, a 38 éves 10,3-at.
- **Edzésterv:** a fő edzés pontja a magas szinten is nő. 300-ason 2,94 →
  5,01 pont/meccs.
- **A tapasztalat 80-as szinten:** a 9 fős fókusz kb. 9×, a magas szinten
  15–19×. A bejelentett „kb. 20×”-hoz a 370-es szinten ér a legközelebb, ahol
  a probléma a legnagyobb volt.

## Amire érdemes figyelni

- **Egy fős fókusz:** egy fős fókusz mellett egy 300-as, 26 éves játékos
  ≈ 50 lépést kap idényenként. Ez kb. 4× akkora, mint az edzésterv fő
  sávja. A plafon (a specializációs sáv teteje) ezt korlátozza, de aki egy
  tehetséget célzottan nevel, 2–3 idény alatt eléri. Ha ez túl sok, a
  `COACH_ATTR_BOOST` egyetlen szám.
- **Régi mentések:** minden meglévő karrier azonnal érzi a változást, mert a
  képletek élőben számolnak. A magasabb szint-szorzó a specializációs sávot
  is tágítja, így a magas szinten járó játékosok több Ratinget nyerhetnek
  az attribútumaikból.

## Próba

`tools/stab-magas-szint-1-0-11-4-03-proba.js`:

- a szint-szorzó 480-as Ratingig követ (80 → 1, 176 → 2,2, 300 → 3,75,
  370 → 4,63, plafon 6);
- az attribútum-mester figyelme a valódi létszámmal számolt, egy főnél a
  teljes;
- a többi stábtípus változatlan;
- a mért eset 370-es szinten ≥ 15× a régi;
- az edzésterv főpontja arányosan nő;
- **az előrejelzés egyezik a motor könyvelésével** egy valódi meccs után.

Az `edzes-stab-1-0-9-6-00` próba a stáb szorzóját az új értékre várja.
