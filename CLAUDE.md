# Magyah — munkaszabályok

## Verziószám — MINDEN commit előtt

Olvasd el és kövesd: **[docs/VERZIOZAS.md](docs/VERZIOZAS.md)**.

- Forma: `1.0.MAJOR.MINOR.PATCH`, a PATCH kétjegyű (00, 01 …).
- Döntés: major = a futó karrierek szerződése vagy egy alaprendszer logikája
  változik · minor = új, a játékos számára látható rendszer vagy
  funkciócsomag (az első commitja; a folytatások patchek) · patch = minden más.
- Két helyen, egyszerre: `index.html` (`const APP_VERSION`) és
  `version.json` (`verzio`). A `version.json` `v` mezője befagyott
  (`3.9.369`), azt soha ne írd át.
- `./tools/check.sh` ellenőrzi a formát és az egyezést.
- A commit üzenete a számmal kezdődik: `1.0.4.8.04: …`.
