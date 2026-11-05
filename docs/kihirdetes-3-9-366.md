# 3.9.366 — a keret kihirdetése a párharc előtt

## Kérés

> „Párharc előtt: hogy lehessen edzői elemzéssel dolgozni értelmesen. Amikor
> a felkészültem gombra rányomsz, akkor legyen egy felugró ablak: a keret
> kihirdetése, 1. igen, és mehet a meccs, 2. Igen, de még lehet, hogy
> változtatok, 3. Nem, még módosítanom kell. […] amint mindketten rányomnak
> az igenre, mindketten kapnak egy elemzést […] Aki az 1. választotta, az
> megnézheti az elemzést, majd ha azt bezárta, automatikusan indul neki a
> meccs. […] Aki a 2.-t választotta, az visszaléphet, módosíthat a csapaton,
> és kérhet még edzői elemzést, annyit, ahány az edzőnek van alapból.
> Ilyenkor az első, mindenkinek járó elemzés ingyen van."

## A menet

Ez minden párharcra vonatkozik: a saját bajnokság párharc-napjaira, a közös
bajnokság párharcára és a kupa-párharcra.

1. **🔍 Felkészülés** (ahogy eddig): a két gép kicseréli a csapatlapját.
2. A gomb ezután: **✅ Felkészültem — ⚔ …**. Ha a cseretervről még nem
   döntöttél, előbb az jön.
3. **A kihirdetés ablaka:**
   - **1. Igen — mehet a meccs.** Az ablak kimondja: ezután a keret nem
     változtatható. Kivétel: amíg a társad kerete nincs kihirdetve, a
     várakozásból vissza lehet lépni.
   - **2. Igen, de még lehet, hogy változtatok.**
   - **3. Nem, még módosítanom kell.** Bezár, nem küld semmit.
4. Az 1. és a 2. a csapatlapot `kesz` jelzéssel felteszi a szoba
   `dp:<párharc-kulcs>` rekeszébe, ahonnan a társ gépe az elemzéshez olvas.
5. **Várakozás a társ kihirdetésére:**
   - A **↩ Visszalépek** gomb leveszi a jelzést; a lap marad.
   - Ha a társ gépe egy percig nem jelez (régebbi verzió, nincs kapcsolat),
     elemzés nélkül is tovább lehet lépni.
6. Amint mindketten kihirdettetek, mindketten **ingyenes edzői elemzést**
   kaptok a két kihirdetett keretből. Ez nem fogy az edző elemzéseiből.
7. **Az 1. választás után** az elemzés „Értem” gombja indítja a párharcot
   (a szokásos keret-feltöltés, várakozás, közös szimuláció). A keret a
   várakozó képernyőről továbbra is visszahívható; utána újra ki kell
   hirdetni.
8. **A 2. választás után:**
   - a gomb **📣 Kihirdetve — ⚔ …** lesz;
   - a keret szabadon módosítható;
   - a fizetős elemzések az edző szintje szerint járnak, és mindig a társ
     friss, esetleg újra kihirdetett lapjával számolnak;
   - a következő nyomásra ugyanez az ablak jön, már elemzés nélkül. Az 1.
     azonnal indít, a 2. a mostani keretet hirdeti ki újra.

## Technikai

- `dkKapu` a `kickoffTap` két ágában ül (bajnoki/saját bajnokság és kupa).
- Auto módban, futó meccs alatt, vagy ha a keret már fent van
  (`S.h2hPending`), nem lép közbe.
- A `duelLapCsere` a lapra ráteszi a kihirdetés jelzését
  (`dkLapRekord`), így egy fizetős elemzés nem törli.
- A kihirdetés állapota modul-szintű (`_dk`). Újratöltés után újra ki kell
  hirdetni, és ha a társ már kihirdetett, azonnal jön az ingyenes elemzés.

## Próba

`tools/kihirdetes-3-9-366-proba.js` (két kliens, 15 állítás):
- a gomb felirata és a három választás;
- a 3. nem küld semmit;
- az 1. kihirdet, a visszalépés leveszi a jelzést;
- a 2.-es oldal azonnal megkapja az ingyenes elemzést a társ lapjával, és az
  edző elemzései nem fogynak;
- az 1.-es oldal elemzése kimondja, hogy az „Értem” indít, és indít is;
- a 2.-es oldal újranyomásra elemzés nélkül indul;
- a párharc lefut, tükörben;
- nincs oldalhiba.

`tools/parharc-felkeszules-3-9-305-proba.js` az új menetre igazítva.
