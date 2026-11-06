# Menedzsment menüpont — 1.0.4.14.00

Kimondott kérés: *„A menedzsmentnek legyen egy saját menüpontja a csapatépítésen belül. És
alattuk legyenek a kihívások, mérföldkövek. Minden típusú. Stílusmérföldkő is. Legyen szépen
rendszerezve. Átlátható legyen. És legyen felül egy sáv, ahol nagyban mindig ott vannak az aktív
kihívások. Látványos követési vizualizációval. … És 3 random mérföldkő, amihez már közel vagy …
minden ki- és belépés után frissítsük. És lehessen manuálisan is frissíteni. Az összes kihívás
felület, amikor új kihívást vállalsz, ezentúl a menedzsment saját stílusú ablakában jelenjen meg.
A funkció és gombok ne változzanak … Van egy átigazolási esemény, amikor célkitűzéseket kapsz. Az
is ide kerüljön be. És a menedzsment felületen látszódjon legfelül a Run szint és a fő elvárás …
A szöveges javítanivalókat bármikor javíthatod."*

## A felület (HUB → ☰ Menü → 🏗️ Csapatépítés → 📋 Menedzsment)
Saját, „tárgyalóterem" palettán (`.mgmtSkin`), a témától függetlenül. Fentről lefelé:
1. **Run szint** (színezve; „🔒 rögzítve: X", ha a Run-cél megvolt) és **a fő elvárás**:
   „🏆 Nyerd meg: ‹liga neve›" — „ezzel rögzül a Run szinted", a mostani helyezéssel, és a
   liga-lépcső a mostani ligától a célig (nevekkel).
2. **🎯 Aktív kihívások** — nagy kártyák: haladás-gyűrű, haladás-sáv, a haladás szövege,
   nehézség, hatókör, határidő, jutalom és büntetés.
3. **⭐ Közel vagy hozzájuk** — 3 véletlen mérföldkő (általános és stílus) a közel állók közül
   (60% fölött; ha abból kevés van, a 8 legközelebbi közül). Belépéskor és kilépéskor újrasorsol,
   a 🔄 Frissítés gombbal kézzel is.
4. **🏛️ Az igazgatóság megbízása** — az *Igazgatósági ülés* átigazolási esemény elvárásai, élő
   állással (gól, helyezés, tábor, büdzsé, morál, izgalom, kupa); utána az előző idény értékelése.
5. **📚 Kihívások és mérföldkövek** — csukható szakaszok: a kihívások (aktív + lezárt, a régi
   kihívás-ablak tartalma), az általános mérföldkövek csoportonként, és minden filozófia
   stílus-mérföldkövei külön (a nyitottak a haladás szerint, a kész darabszám alul).

Csak megjelenít: minden szám a meglévő mérőkből jön (challengeProgress, msProgressOf, a stílus
mérföldkövei a saját slotjuk nézetében, TAL_IGAZG_FAJTA.mer). A HUB Run-mérője alatti
„📋 Célkitűzés" sor is ezt nyitja.

## A kihívás-ajánlatok
Minden kihívás-felajánlás (kezdő, szezon, évszak, sprint, kupa) a menedzsment skinjében, „📋 A
MENEDZSMENT AJÁNLATA" fejléccel. A kártyák, a „Elvállalom" és a megerősítő változatlan. A közös
`#twPanel` más célú használatánál (bolt, stáb…) a skin a címváltással magától lekerül.

## Nyelvi javítások
- „a 1. idényben" típusú névelők (57+6 hely): a kiejtett alak szerint (`hunAz`) — „az 1.", „az 5.".
- A maradék „a(z)" formanyomtatvány-alakok (27 hely) ugyanígy.

Próba: `tools/menedzsment-1-0-4-14-00-proba.js` (17 állítás).
