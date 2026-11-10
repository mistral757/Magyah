# Mérési naplók a Firebase-ből

Az adat kivonata: `04354b30fc3b4493`.

| | |
|---|---|
|játékos (névtelen)|4|
|karrier|27|
|idény|65|
|meccs-sor|2632|

A legutóbbi feltöltés: 2026-11-10T00:00:04.026Z.

Fájlok: `meres-firebase.json` (a teljes, névtelenített napló), `osszegzes.txt`, `idenyek.csv`, `meccsek.csv`, `boostok.csv` (3.9.318-tól).
Újragenerálás: `node tools/meres/osszegez.js meres-firebase.json --csv idenyek.csv --meccsek meccsek.csv --boostok boostok.csv`.
