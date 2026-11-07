# 1.0.4.15.00 — 4. csapatstílus, meccserő-út, újraválasztás

## Felső határ
Legfeljebb **4 filozófia** (`STYLE_SLOT_MAX=4`): az alapstílus, a második és
legfeljebb két további (`S.styleExtra`).

## Hogyan nyílik a 3. és a 4.
Két út, a kettő közül a **nagyobb** számít (nem adódnak össze):

- **Szint-út** (változatlan): ahány stílusod elérte a nehézségfüggő küszöböt
  (`styleXNeedFor`: 5.x → 20, 10.5 → 15), annyi újabb hely.
- **Meccserő-út** (új): a valaha elért legnagyobb ⚡ meccserő (`S.styleXMs`,
  mentve) — 250-nél 1 hely (a 3. stílus), 350-nél 2 hely (a 4.).

`styleXAllowed() = min(2, max(szint-út, meccserő-fok))`. Így ha a 3. stílus
már a szint-úton megnyílt 250 előtt, a 250 nem ad újabbat — a 4. csak 350-nél
(vagy egy második küszöbszintű stílussal) jön.

## Újraválasztás
Ha bármelyik stílusod elérte a **10. szintet**, bármelyik filozófia-helyed
lecserélhető egy még nem birtokolt stílusra:

- a helybe vásárolt képességszintek árának (az edző adta ingyenes 1. szint
  nélkül) **33%-a** csapatstílus-pontként visszajár;
- a speciális pontgyűjtőbe (motor / rettegés) elköltött pontok 33%-a az új
  stílus saját pontgyűjtőjébe kerül, ha van neki, egyébként csapatstílus-pont;
- az új stílus a szokásos módon, saját mérföldkövei szerint ad pontot.

## Felület
A stílus-panel felső sávja (ahol eddig a 3. stílus haladása volt):
a következő hely két haladássávval (szint és meccserő), a betelt állapot,
valamint az újraválasztás gombja a várható visszatérítéssel.

Próba: `tools/stilus-20-szint-1-0-4-11-00-proba.js` (2p–2y).
