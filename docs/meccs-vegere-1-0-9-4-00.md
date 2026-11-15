# ⏭ 1.0.9.4.00 — Szimuláció a meccs végéig

## A kérés

> „Valahol, ahol szerinted is jó lenne a helye. Legyen elhelyezve egy
> szimuláció a meccs végéig gomb. Mert néha már első félidőben eldől a meccs
> és akkor lehessen a végére ugrani ha akarsz. Kivéve PvP párharcban."

## A hely

A gomb közvetlenül a **tempó-csúszka alatt** van, a közvetítés alján
(`#vegereSor`). Az is a közvetítés sebességéről szól, és nézés közben ott van
kéznél. Csak futó meccsen látszik, ugyanúgy, mint a csere-gomb: a meccs
fogantyúja (`MATCH_CTL`) dönt róla. A megnyomása után eltűnik.

## Mit csinál

Nem egy külön, gyors szimuláció fut. **Ugyanaz a motor** megy tovább,
ugyanazzal a meccs-véletlennel (`_mRng`), csak villámtempóval (8 ms-os
tick):

- **A jelenetek** (gól-animációk stb.) ezen a meccsen elmaradnak; a
  folyamatban lévő jelenet bezárul.
- **A félidei csereszünet** megállója kimarad. A tervezett cserék lefutnak.
- **Az eredményjelző órája** a mostani perctől pereg tovább, az új ütemben.
- **A napló** egy sorban kimondja: „⏭ Szimuláció a meccs végéig — a mérkőzés
  ugyanúgy lejátszódik, csak jelenetek és megállás nélkül.”

Az eredmény, a statisztika, a fejlődés és a lefújás könyvelése a rendes úton
megy.

## Ahol nincs

- **Párharcban (PvP).** A közvetítés ott közös, fix tempójú; a fogantyú is
  elutasítja.
- **A szezon végigjátszásában (auto).** Ott a meccs már amúgy is villámgyors.
- **A 90. perc után.** A ráadás és a dráma saját időzítővel fut.

## Próba

`tools/meccs-vegere-1-0-9-4-00-proba.js` — rendes bajnoki meccsen, 0,25×-ös
tempón:

- a gomb látszik;
- megnyomva a meccs gyorsan lefut;
- a bekapcsolt félidei csereszünet nem állítja meg;
- a jelenetek elmaradnak;
- a gomb eltűnik, és a naplóban egyszer szerepel a bejelentés;
- a lefújás könyvelése rendben van;
- párharcban nincs gomb, és a fogantyú elutasítja.
