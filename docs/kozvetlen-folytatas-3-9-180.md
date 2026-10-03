# 3.9.180 — ▶ Nincs több köztes „Mentett meccs található” oldal

> „Single player mentés betöltésénél van ez a köztes oldal. Erre nincs
> szükség. Kivehető, törölhető."

## Mi változott

A „Mentett meccs található” sáv a **Folytatom / 🗑 Adattörlés** gombpárral
megszűnt. A választás úgyis megtörténik a kezdőlapon. A
**„Mentett meccs folytatása”** gomb és a karrierhely chipje **egyenesen
betölti** a karriert.

| honnan | mi történik |
|---|---|
| hideg indulás után „Folytatás” ugyanarra a helyre | újratöltés nélkül, azonnal betölt |
| másik helyre váltás (újratöltéssel) | az indulás maga tölt be, a kezdőlap nem jön elő |
| a mentést közben törölted (🗑 a chipen) | nem tölt be egy eldobott karriert, a módválasztó jön |
| a mentés nem nyílik meg | a megszokott hibasáv a kezdőlapon áll, a mentés a helyén marad |

**Törölni továbbra is lehet:**

* a kezdőlap chipjein;
* a „Mentések és tárhely” listában.

Mindkettő ugyanazt a kétlépcsős folyamatot nyitja: előbb felkínálja az
összegzés letöltését, csak utána, külön megerősítéssel töröl.

## A kódban

* Az `#resumeBanner` elem eltűnt.
* `spFolytatMost()` a **hívás pillanatában** olvassa újra a mentést, nem az
  induláskorit használja.
* A hideg indulást a `_spFolytatVar` jelző jegyzi. Ugyanerre a helyre a
  `mpSwitchContext` ezt hívja meg.
* Mentés nem íródik felül: a `saveGame` üres állapotot nem ír ki
  (`hasLiveGame`).

## Próba

`tools/kozvetlen-folytatas-3-9-180-proba.js`, 11 állítás, valódi karrierrel és
valódi újratöltéssel. A `frissites-proba.js` is ezen az úton tölt be: a
naplófigyelő a Folytatás előtt köt.
