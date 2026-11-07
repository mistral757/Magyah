# 1.0.5.0.00 — a lekövetett fejlődés a Run-szintben

## A kérés
„Valahogy a Run szintbe bele kéne számítson slightly, hogy az 5 fordulónkénti
lekövetős erősödése az ellenfeleknek, az milyen mértékeket ölt. Ne az legyen,
hogy ha valaki kb teljesen a mezőnnyel halad, az ugyanannyi Run szintet kapjon,
mint az, aki minden 5 fordulóban akkorát fejlődik, hogy rohannia kell utána az
ellenfeleknek. Ennek mértéke maximum 10%-nyi plusz Run szintet jelenthessen a
teljes karrierre nézve […] És akkor a 15. fordulós nagy igazításért nem kell
külön járjon Run szint emelés."

## A szabály
- **Mérce:** idényenként a rés-követés (5., 10., 15., 20., 25. forduló utáni)
  emeléseinek összege a mezőny szintjének százalékában, a játékos-tempóhoz
  mérve (mint a „Mezőny-emelés" sor). A **boost-adósság nem** számít — az a
  boost ára, nem a fejlődésé.
- **A karrier átlaga** azokon az idényeken, ahol a követés élt (a 2.
  idénytől). A futó idény a 10. fordulótól, a lejátszott fordulók arányában
  vetítve.
- **Többlet** = Run × 10% × min(1, átlag ÷ 10%/idény). A kész Run-szinthez
  adódik (a plafon és a hangolás után, a felzárkóztatás levonása előtt), a
  tetőig. A mezőnnyel haladónak 0, aki idényenként a mezőny 10%-ának
  megfelelő emelést kényszerít ki, annak a teljes +10%.
- A bontásban saját sor: **Lekövetett fejlődés** (+X Run-pont, az átlag és az
  idények száma).

## Ami kikerült
- A **15. fordulós téli felmérés** (1. idény, illetve ahol a követés nem él)
  emelése többé nem nehezíti a Run-plafont, és a „Mezőny-emelés" sorba sem
  számít.
- A rés-követés emelései sem a plafon nehézség-tényezőjén hatnak (eddig:
  −min(0,5; (téli + követés) × 0,25) a célrésen) — helyettük a külön többlet.

A futó karrierek Run-szintje ezért kissé elmozdulhat: aki sokat követtetett,
nő; akinek a téli felmérés emelt, annak a plafonja egy hajszállal lejjebb kerül.

Próba: `tools/run-kovetes-1-0-5-0-00-proba.js`.
