# 🎚 A fokozat-csomag minden eleme nyitva — 1.0.12.6.00

**KIMONDOTT KÉRÉS (🐞 jegyzet jmwvbypb4enyx kivizsgálása után, „D) verzió”):**
> „Szüntessük meg ezeket a zárt elemeket. Minden nyitva eleve”

## Mi volt a baj
A jegyzet így szólt: „8.1 nehézséget választottam induláskor, most mégis 6.3 lett”. Az okát az 1.0.12.5.00 tárta fel (lásd [apa-jegyzetek-1-0-12-5-00.md](apa-jegyzetek-1-0-12-5-00.md)).

A fokozat-csomag (3.9.223) a célrés mellett hét további elemet állít:
- a mezőny tempóját;
- a négy tempó-tengelyt;
- az ikon-igazolások sűrűségét;
- a képesség-módot;
- a scoutot;
- a holtsávot;
- a téli felmérést.

Ezek közül négy egy első karrierben zárva volt:
- a mezőny-tempó (Run-kapu: a 2. lezárt karrier, illetve 40/60/75-ös Run-szint);
- a tempó-lassítások (3 lezárt karrier és 30–90-es Run-szint);
- a tempó-gyorsítások (3 bajnoki cím);
- az ikon-sűrűség (10/20/22 leigazolt ikon) és a realisztikus képesség-mód (10 képesség egy emberen vagy 100 összesen).

A zárt elem helyére a beállító a legközelebbi nyitottat tette. A választott 8.1-ből így a futó beállítás a hivatalos szint szerint 6.3 lett.

## Mi változott
Az első karriertől minden nyitva van:

| Elem | Eddig | Most |
|---|---|---|
| Mezőny tempója (Alvó … Végtelen menet) | Run-kapuk (`unlockSpeedOk`) | mind választható |
| Játék-tempó, mind a négy tengely (Turbó … Kőkorszak) | Run-kapuk és 3 cím (`unlockTempoOk`) | mind választható |
| Ikon-igazolások (ritkábban / nagyon ritkán / ki) | 10 / 20 / 22 ikon | mind választható |
| Képesség-mód: realisztikus | 10 egy emberen vagy 100 összesen | választható |

Ennek a következményei:
- A választott fokozat pontosan az, ami fut: nincs helyettesítés, a hivatalos szint megegyezik a választottal. Mind az 50 belső szinten mérve.
- A kezdő lépcső (1–3.) már nem köti a mezőny-tempót, a tempót, az ikonokat és a képesség-módot. Ezeket a választott fokozat-csomag adja. A lépcső továbbra is köti az osztályt (D3), a mezőny szintjét (78 vagy 80), az újrapörgetést, a kezdés módját, a Rating-alapot, a válogatottakat és a vezetést.
- A feloldás-ablakok közül kimaradnak a „Tíz legenda”, „Húsz legenda”, „Nincs több ajándék” és „A képességek a maguk útján” ablakok. A számlálók tovább könyvelnek.
- A Profil haladás-paneljéből kikerül a tempó-, ikon- és képesség-csoport.
- A 3. lépcső ablakából kikerül a „Lépést tartanak” mondat.

## Ami nem változott
- A 10.6+ extra szintek a saját szabályuk szerint nyílnak. Ezek csak célrés-szintek, nem csomag-elemek.
- Zárva maradnak a többi feloldás kapui is:
  - a válogatottak a draftban (20 válogatott játékos);
  - a csapatstílusok;
  - a D4–D6 kezdő osztály;
  - a kártyánként lutri Rating-mód;
  - a kész klubos indulás;
  - a dinamikus karrier.
- A futó karrierek a saját rögzített beállításukkal mennek tovább (`S.pyr.fok.cfg`). Új karrier indításakor jön a nyitott csomag.

## Próba
- **Új próba:** `tools/nehezseg-nyitva-1-0-12-6-00-proba.js`. Friss böngészőben mind az 50 belső szinten nincs helyettesítés, és a hivatalos szint a választott. A beállító rácsaiban nincs zárt gomb, a lépcsőn sem. A 8.1-es csomag alkalmazva 8.1. A haladás-panelben nincs tempó-, ikon- és képesség-feloldás.
- **Az új szabályhoz igazítva:** `lepcsok-proba.js`, `fokozat-csomag-3-9-223-proba.js` és `reszt-tempo-3-9-208-proba.js`. A `reszt-tempo` a csatornákat a „Normál” alapról méri; az ajánlott 4.1-es csomag „Gyors” tempót ír elő, és ez most már valóban fut.
