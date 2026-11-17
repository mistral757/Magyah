# 💾 1.0.11.4.00 — Saját csúszka-beállítások

> **Kérés:** „A hangsúlycsúszkák is legyenek menthetők, mint a felállás. Hogy
> legyenek saját beállítások is, ne csak a nagyon védekezés, nagyon támadás
> és edzői összeállítás.”

Próba: `tools/csuszka-mentes-1-0-11-4-00-proba.js` · Kép: `docs/kepek/csuszka-mentes-1-0-11-4-00/utana.png`.

## Mi változott

A 🎚 Hangsúly-csúszkák panelen, a 🧭 Gyors játékterv három gombja alatt új
blokk: **💾 Saját beállítások**.

- **Mentés:** név (pl. „Idegenben”) + 💾. Egy mentés **a panel teljes
  állása**: a taktika öt csúszkája és a filozófiák hangsúly-csúszkái együtt.
  Ha minden csúszka középen áll, a gomb tiltott, és megmondja, miért.
- **A lista:** minden mentés egy gomb, rajta a tartalma
  (`Magas védővonal 40% · Gyors átmenetek 80%`); mellette 🗑 (megerősítéssel).
  Azonos névvel felülír; legfeljebb 20, a legrégebbi esik ki.
- **Visszatöltés:** egy koppintás; az Összkép azonnal mutatja az eredményt, és
  a **↺ Vissza az előző állásra** a taktika *és* a filozófiák csúszkáit is
  visszaadja.

## A mostani keret tisztelete

A visszatöltés ugyanazon a kapun megy át (`tdSet`, `dialSet`), mint a kézi
állítás — nem kerüli meg a játék szabályait:

- ha az ismertség (taktika) vagy a hangolási keret (filozófia) azóta
  **kevesebb** csúszkát enged, a **legerősebbek** kerülnek vissza, a többit
  kimondja („Kimaradt: …”);
- a taktika öt csúszkája minden taktikánál ugyanaz, ezért egy **másik
  taktikánál** mentett állás is visszatölthető — ezt is kimondja;
- egy **másik filozófiához** mentett stílus-csúszka kimarad, és kimondja.

## Hol él

A karrier mentésében (`S.dialMentes`), mint a mentett felállások
(`S.felMentes`): a `saveGame` írja, az `applySavedGame` olvassa; a régi mentés
(a mező nélkül) üres listával töltődik. A mentés formátuma visszafelé
kompatibilis, a futó karrierek szerződése nem változik.

## Amit nem változtat

A csúszkák hatása, a keretek (hány csúszka mozdítható), a gyors játékterv
három gombja.
