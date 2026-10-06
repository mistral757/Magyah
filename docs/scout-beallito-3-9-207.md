# 3.9.207 — 🔭 A valósághű scout az új karrier beállítóján

> „a realisztikus scout mód az ne csak a beállításokban legyen, hanem az új
> játék indításánál a kapcsolók között is."

## Hol van

**A beállító képernyő 2. oldala („A keret”),** a Legendás magyahok alatt.
Minden karrier-indulásnál látszik, drafttal és kész klubbal is; karrieren
kívül nincs scout, ott nem látszik. Az összefoglaló oldalon saját sora van
(„Scout”).

## Hogyan él

Ugyanaz a hármas, mint a Legendás magyahoknál:

| | Mi | Hol él |
|---|---|---|
| `scoutRealWanted` | a beállító választása | a localStorage-ból indul, és oda ír |
| `S.scoutReal` | a FUTÓ karrier értéke | a `beginNewGame` rögzíti, a mentés viszi |
| `scoutRealOn()` | az olvasó | — |

**A Beállítások kapcsolója** ugyanezt a preferenciát állítja (és a futó
karriert), a beállító választója követi.

**Indulás után** a tárolt preferencia már nem írja át a futó karriert.

## Közös karrier

**Világ-tulajdonság:** a felfedezések útja a keretépítés egyik csatornája.
Ezért:

* a házigazda csomagjában utazik (`scoutReal`);
* a vendégnél a házigazda értéke él, a saját tárolt preferenciája érintetlen;
* régi szobában (nincs mező) KI;
* a vendég átnézőjén zárolt;
* menet közben a Beállításokban nem állítható — ki is írja, miért.

## Próba

`tools/scout-beallito-3-9-207-proba.js` — 13 állítás.
