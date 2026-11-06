# 1.0.4.10.00 — a verziótörténet a játékban

## Kérés

> „Ezeket még tedd hozzá, és az elkészült html oldal legyen beépítve a játékba
> úgy, hogy azt az oldalt nyissa meg a game, ha a verziószámra kattintok a
> játékon belül. Bármelyik site-on.”

## Mit csinál

- **A verziószámra koppintva** a verziótörténet nyílik meg, két helyen:
  a fejléc jelvényén és a kezdőlap láblécén (Enterrel és szóközzel is).
- A tartalom egy **teljes képernyős réteg** egy iframe-mel: a játék alatta
  marad, nincs mentés, nem vész el a nézet. A **✕ Bezár** és az **Esc** zár,
  a fókusz visszatér a verziószámra. A **↗ Külön lapon** link új lapon nyitja.
- Az oldal a repó **`verziotortenet/index.html`** fájlja (az `adatvedelem/`
  mappa mintájára; a Netlify a `/verziotortenet/` címen szolgálja).

## „Bármelyik site-on”

- Az út **relatív** (`verziotortenet/`, a betűk `../fonts/…`), nem
  gyökér-abszolút. Így a játék bármelyik gazdagépen, porton és alútvonalon
  ugyanabból a helyből nyitja, ahonnan maga betöltődött. A próba külön
  mérte: `127.0.0.1`, `localhost` és egy `/sub/` alútvonal.
- **Külső szolgáltató nincs.** Az oldal a játék saját, önhosztolt betűit
  használja: Press Start 2P, Pixelify Sans, és a számjegyekhez a 3.9.172-es
  `Magyah Pixszam` (a Pixelify számjegyei kis méretben összefolynak). Ez
  megőrzi a játék adatvédelmi tervét: egyetlen kérés sem megy Google-höz.
- A service worker előre cache-eli a `/verziotortenet/` oldalt (cache `v8`),
  így offline is megnyílik.

## Az oldal tartalma (változások)

A `docs/VERZIOTORTENET.md` és az oldal bővült a 2.2 előtti **26 megmaradt
állapottal**: a négy verzió nélküli „30–0” és a 0.758.2 → 1.4.09.
- **A „30–0”:** egyszeri NB I-draft, 7 → 47 klub-szezon.
- **A 0.758.2** az első verziószámos állapot, és itt születik a **Karrier mód**:
  ez a legnagyobb ősi fordulópont.
- A táblázat 28 soros; a 19 helyett **26 kazetta** kattintható.
- Az oldal utolsó sora a mostani 1.0.4.9–1.0.4.10 szakasz.

A generálás a `docs/VERZIOTORTENET.md` táblázatából megy; az oldal
szövegének karbantartása kézi.

## Próba

`tools/verziotortenet-1-0-4-10-00-proba.js` (22 állítás): kattinthatóság,
a réteg és az iframe, a teljes oldal (28 sor, 26 kazetta), a betűk helyi
szeletei és a külső kérések hiánya, Esc/✕/Enter, `localhost`, alútvonal,
önálló megnyitás, a service worker.
