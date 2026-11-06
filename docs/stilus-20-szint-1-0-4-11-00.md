# A 20. csapatstílus-szint jutalmai — 1.0.4.11.00

Kimondott kérés: *„mostantól mindig lehet egy újabb csapatstílust választani, amint
eléred a 20. szintet az egyik csapatstílusoddal — jelezve a menüben is"*, *„a 20.
szinten választhatsz annak 3 képességét, amit további 3-3 szintén át lehet
fejleszteni, jelentősen drágábban"*, *„a csapatstílus saját pontgyűjtője (meccserő)
kinyílik további 10 szinttel"*.

## 1. Újabb filozófia
- Minden filozófia, amely eléri a **20. szintet**, egy újabb helyet nyit. Újabb helyek
  száma = a 20. szintre jutott filozófiáid száma − a már felvett extrák. Az új
  filozófia is hozhat újabbat, ha ő is eléri a 20-at. Legfeljebb mind a nyolc.
- Előfeltétel: megvan az elsődleges és a másodlagos.
- Állapot: `S.styleExtra` (tömb, a másodlagossal azonos szerkezet), mentve/betöltve;
  `styleSlots()` mindet tartalmazza, tehát minden hatás (szerepek, hangsúlyok,
  képességek, mérföldkövek, motor) ugyanúgy él.
- Az extra **másodlagosként** viselkedik: harmadannyi mérföldkő-pont, felezett
  meccserő-plafon. A pont közös tárcába gyűlik.
- A panel nézete 1-től számozott index (`styleViewIdx`), a váltó körbejár.
- **Jelzés a menüben:** a csapatstílus-panel tetején a nyitott hely gombja („🔓 Válassz újabb
  csapatstílust!"), zárt állapotban a cél és a haladás (legmagasabb szint / 20), a menü
  „dönts!" jelvénye, és a 20. szint elérésekor naplóüzenet.

## 2. Csúcsfok (a képességek 4–6. szintje)
- A 20. szinten a filozófia fájából **legfeljebb 3 képesség jelölhető** (végleges), ezek a
  3/3 fölött további **három szintet** kapnak.
- Jelölhető: azok a képességek, amelyek hatása skálán mozgó szám (`STYLE_PEAK_DEFS`,
  stílusonként 3–7). A motor-táblába kötött fokozatok (szerepek, Busz-szint, Guardiola…)
  nem. A lépcsők lépése a 3. szint lépésének kb. fele.
- Ár (a 3. szint árának 2,9–7-szerese): I. rang 110/170/250 · II. 200/310/450 ·
  III. 320/480/700 (`STYLE_PEAK_PRICE`).
- A 4–6. szint a `traits` tárban él, a jelölés a `st.peak.picks`-ben. A stílus szintjét
  (SXP) a csúcsfok **nem** mozdítja.

## 3. A pontgyűjtő 11–20. szintje
- A rettenet (Panzer) és a többi stílus állapot→meccserő létrája 10-ről **20 szintre** nő;
  a 11–20. szint csak a **20. stílusszinten** vehető meg.
- Hozam: szintenként +1,11 százalékpont (Panzer: +1,85), a 20. szinten 20,1% (33,5%);
  a nem-Panzer létra továbbra is a Panzeré 0,6-szerese.
- Ár: 640 → 1 520 (×1,1 szintenként; a 11–20. együtt ~10 200 pont, a régi tíz 2 500).
- A meccserő-plafon szintenként +5%-kal nő a 10. fölött (a 20.-on ×1,5).
- A Villám „nyolcvan perc" fáradása továbbra is a 10. szinten tűnik el.

## Hangolható számok
`STYLE_PEAK_PRICE`, `STYLE_PEAK_DEFS` (értékek), `STYLE_MASTER_CAP_STEP` (0,05),
az `RETTEGES_PCT` / `ENG_PCT` 11–20. szakasza és az ár-lista vége.

Próba: `tools/stilus-20-szint-1-0-4-11-00-proba.js` (48 állítás).
