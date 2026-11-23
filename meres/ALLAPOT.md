# Mérési naplók a Firebase-ből

Az adat kivonata: `f08e01e32e169078`.

| | |
|---|---|
|játékos (névtelen)|4|
|karrier|31|
|idény|82|
|meccs-sor|3283|

A legutóbbi feltöltés: 2026-11-22T12:24:29.583Z.

Fájlok: `meres-firebase.json` (a teljes, névtelenített napló), `osszegzes.txt`, `idenyek.csv`, `meccsek.csv`, `boostok.csv` (3.9.318-tól).
Újragenerálás: `node tools/meres/osszegez.js meres-firebase.json --csv idenyek.csv --meccsek meccsek.csv --boostok boostok.csv`.
