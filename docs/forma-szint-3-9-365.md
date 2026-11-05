# 3.9.365 — a tartós forma nem nő a szinttel, és a HUB is kiírja

## Bejelentés

> „magasabb rating szinteken könnyebben előfordul már, hogy 3-4, akár +5
> rating fölényben is jelentősen kikap […] Itt talán kicsit szigorúbbá kéne
> tenni a játékot." · „2-3 mezőny fölötti erővel egyértelmű vereségek jönnek."
> (PvP Könnyed, D2, 3. idény; „Az edző is kb így jelzi előre.")

## Vizsgálat

1. **A kiírt és a motor szerinti különbség egyezik.** Valódi meccseken
   (`tools/meccsmotor/kijelzes-valos.js`) az eltérés átlagosan −0,02. Egy
   beküldött, 3. idényes mentésben (⚡158, D2, idegenben) a kiírt különbség
   +2,7, a motoré +2,8, az edző előrejelzése 71% / 19% / 10%. A mentést csak
   helyben elemeztük, a repóba nem került.
2. **Mért adat** (a `meres-adat` ág, 2316 meccs): 130 fölötti ⚡-nál +2–3-as
   fölénnyel a meccsek 91%-a győzelem, és nincs vereség. Saját bajnokságos
   karrier nincs a mérésben.
3. **Ami a szinttel együtt nő, és a HUB nem mutatja: a tartós forma.** A
   motor minden játékos hozzájárulását a formájával szorozza (±7,5%). A
   célrés, a fokozatok, a hazai előny és a motor görbéje viszont abszolút
   meccs-erőben áll. A HUB ⚡, a létra, a „mezőny most” rés és a rés-követés
   a formát szándékosan kihagyja (3.9.157, 3.9.350). Egy hullámvölgyes
   kezdőcsapat (átlag 4/14, −4%) hatása:
   - 85-ös szinten kb. −3,4;
   - 155-ösön kb. −6,3.

   Vereségsorozatnál a forma lecsúszik, a vereség tovább rontja. A kiírt
   +2–3 így a pályán negatív lehet, és az edző, aki a formát is számolja, ezt
   előre jelzi.

## Javítás

- `pformErtek(c, név)`: a forma hatása legfeljebb annyi, amennyi egy
  `PFORM_REF` = 100 Ratingű hozzájárulásnál lenne. 100 alatt a hatás bitre a
  régi, fölötte abszolút értékben nem nő tovább (a két szélen ±7,5). Ezt
  használja a motor (`buildMatchSnapshot`), a ⚡ bontása (`pformTeamOvr`), az
  edzői elemzés és a cserejavaslat.
- A HUB a rés alatt kiírja a kezdők formáját és a pályán érvényes rést, ha a
  forma legalább 0,5 (`pyrFormaSorHtml`).
- A nehézség (célrés, rés-követés) továbbra is forma nélkül mér.

## Amit a mentés még mutatott

A 19. fordulóig a mezőny +22,1-et nőtt:
- +2,0 az alapütem;
- +20,2 a 3.9.302-es idény közbeni erősödés (3. idény: szint × 0,345 a
  fokozat szerint).

Ez a kért, mért görbe, nem túlfutás. A 8. fokozat célrése +0,4, a mostani
rés −0,1: a mezőny azt hozza, amit a fokozat ígér.

## Próba

`tools/forma-szint-3-9-365-proba.js`:
- 100 alatt a hatás bitre a régi;
- magas szinten korlátos (−7,4 helyett −5,3);
- a motor és a kijelzés együtt mozdul;
- a HUB kiírja a formát és a pályán érvényes rést;
- nincs oldalhiba.
