# 1.0.4.9.00 — kerethirdetés a párharc előtt

## Kérés (röviden)

> „Meccs előtt. Nincs külön felkészülök a meccsre gomb. Hanem.
> Kerethirdetés. Erre rányom. Két lehetőség, kerethirdetés és utána
> kezdődhet a meccs. Másik, kerethirdetés és megvárom a társam keretét és az
> elemzést. Harmadik egy mégsem hirdetek keretet gomb. Az első után egyből a
> szokásos várakozó kijelző jön […] A második után ugyanez a felület, más
> felirattal."

Ez váltja a 3.9.366-os menetet (felkészülés → „Felkészültem” → három
választás).

## A gomb

| állapot | felirat |
|---|---|
| még nem hirdettél keretet (vagy visszahívtad a meccs-várakozóból) | **📣 Kerethirdetés — ⚔ …** |
| kihirdettél, és az elemzésre vársz | **📣 Kihirdetve — ⚔ …** |
| megjött az elemzés | **⚔ Kezdőrúgás — …** |

Nincs külön 🔍 Felkészülés lépés: a két gép a kerethirdetéssel cseréli ki a
csapatlapját.

## Az ablak

1. **⚔ Kerethirdetés — utána kezdődhet a meccs.** A szokásos
   meccs-várakozóba visz (bökés, a társ jelenléte, kilépés a kezdőlapra, a
   keret visszahívása). Az ablak kimondja: *felkészületlenül érkezel, az
   elemzést csak a meccs után nézheted meg*.
2. **🧠 Kerethirdetés — megvárom a társam keretét és az elemzést.** Ugyanaz
   a várakozó felület, a saját feliratával („A te kerethirdetésed / A társad
   kerethirdetése”).
3. **✋ Mégsem hirdetek keretet.**

## Az esetek

| te | a társad | mi történik |
|---|---|---|
| 1. | 1. | Amint mindketten nyomtatok, indul a meccs. Az elemzés a kezdőrúgás előtt elkészül a két kihirdetett keretből, és a **meccs mérlegén** egy gombbal nézhető meg. |
| 2. | 1. | Vársz, megkapod az elemzést, változtathatsz, kérhetsz még elemzést (az edződ szintje szerint), aztán a ⚔ Kezdőrúgás feltölti a keretedet. A társad addig a meccs-várakozóban ül. |
| 2. | 2. | Mindketten megkapjátok az elemzést, amint mindkét keret kint van. Utána a ⚔ Kezdőrúgás; aki előbb nyom, az vár a szokásos felületen. |

## A várakozás szabályai

- **Az elemzésre várva vissza lehet lépni**, és a kihirdetés érvényes marad.
  Amint a társad kihirdet, a háttérben is lezárul a fázis, és megjön az
  elemzés. Ha épp nem a meccsképernyőn vagy, a következő gombnyomásra nyílik
  ki.
- **Az elemzés-várakozóba csak újabb kihirdetéssel** lehet visszamenni. Ekkor
  az ablak csak két gombot ad: „Újra kihirdetem a mostani keretet” és
  „Mégsem”. **Innen a meccs-várakozóra nem lehet átváltani.**
- **A meccs-várakozóból (1.) visszalépve** (a keret visszahívása) a gomb
  újra „📣 Kerethirdetés”, és ott a **2. is választható**: utólag is kérhetsz
  elemzést. A visszahívás a cseretervet is eldobja, ezért a következő
  kezdőrúgás előbb azt kérdezi meg.
- Az ingyenes elemzés **nem fogy** az edző elemzéseiből.

## Technikai

- A csatorna a szoba `dp:<párharc-kulcs>` rekesze (a csapatlap, `kesz`: 1 =
  meccs, 2 = elemzés; `dkv: 2`).
- Az elemzés-várakozás a `MP_WAIT_FLOWS` része (`kerethirdetés`), így a
  „vissza” és a kezdőlap gomb a szokásos úton állítja le.
- 1–1 esetén a várakozó tickje (`h2hTickRun`) a szimuláció előtt elteszi az
  elemzést (`dkTarol`). A lefújás megjelöli a mérleget (`dkUtolagJelol`),
  a gomb `#dkUtolagBtn`. Az eltett elemzés csak a memóriában él, újratöltés
  után nem jelenik meg.
- `duelPrepKell()` mindig `false`.
- A kihirdetés állapota modul-szintű (`_dk`), újratöltés után újra ki kell
  hirdetni.

## Próba

`tools/kerethirdetes-1-0-4-9-00-proba.js` (két kliens, három párharc-nap):
- 2–1, a háttérben érkező elemzéssel;
- 2–2, a meccs-várakozóból visszahívott kerettel;
- 1–1, az utólag megnézhető elemzéssel;
- a gomb feliratai, a „vissza” szabályai, tükrözött eredmény, nincs
  oldalhiba.

`tools/parharc-felkeszules-3-9-305-proba.js` az új menetre igazítva. A
`tools/kihirdetes-3-9-366-proba.js` megszűnt, ezt a menetet ez a próba
váltja.
