# 1.0.4.16.00 — az edzői meccs-elemzés minden gólforrást lát

## A bejelentés
„Az edzői elemzések érzésem szerint nem tudnak minden csapatstílus képességgel
számolni. A gegenpressing nyomásgyakorlásos büntetésből származó góljait
szinte biztos, hogy nem tudja figyelembe venni." (6:1 győzelem, a gólok java
pressingből; az elemzés: „kb. 1015 meccsből egyszer".) És: „átláthatóbbá,
fülekkel lenyithatóvá tenni."

## Mi volt a hiba
A motor több gólt a gólvárhatóságon (λ) **kívül** sorsol. Az elemzés ezeket
egyetlen „11-es, öngól, VAR, pontrúgás-skill" sorba söpörte (a VAR nem gól, a
szöglet a λ-n belül esik), a szerencse-számításhoz pedig az összes ilyen gól
karrier-átlagát vette. Egy erős pressing-csapat meccsenként 1–3 várható
büntetés-gólja így szinte teljesen kimaradt: a „szerencse" valójában a
gegenpressing volt.

## A javítás
- **Forrásonként** (`mxForras`): 🧲 gegenpressing-büntetés, 🌀 Tiki-Taka
  passzrekord, 🔥 Bombázók gólétvágy, 🎯 11-es, 🙈 öngól, 🦶 szabadrúgás,
  ⏱️ 90+ ráadás, 🔄 csere-csatár, 🧤 kapus-potyagól, ⏳ hosszabbítás. Ami
  kimaradna, „egyéb" (a próba szerint nincs ilyen).
- **Várható gól** (`mxVart`): a pressing-büntetés vödrönként, ugyanabból a
  valószínűségből, amivel a motor sorsol (a meccsenkénti plafonig); a
  gólétvágy, amikor éles; a hosszabbítás a saját λ-jából; a Tiki-Taka a saját,
  aktív meccseken mért rátájából.
- **Szerencse**: λ + a stílus-csatornák várható gólja + az általános források
  (11-es, öngól, szabadrúgás, 90+, csere-csatár, potyagól) mért átlaga. Az
  általános átlagba a stílus-gólok már nem kerülnek (a mérés `v:2`-vel újraindul).
- **Tényezők**: a stílus-csatornák a λ-szorzók mellett, gólban és
  meccserő-egyenértékben.

## A felület
Fent mindig: a meccserők ígérete → minden gólforrással várható → a végeredmény,
és egy mondat arról, mi döntötte el a meccset. Alatta három lenyitható fül:
**⚖️ Mi mozdította el az esélyeket** (sávokkal), **⚽ Honnan jöttek a gólok**
(táblázat forrásonként, a várható értékkel), **🎲 Mennyi volt a szerencse**.

Próba: `tools/edzo-elemzes-forrasok-1-0-4-16-00-proba.js` (valódi meccsekkel).
