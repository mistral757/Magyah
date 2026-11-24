# 🧭 Az első meccsig: kijelölés, talizmán-húzás, klubarculat — 1.0.11.22.01

> KIMONDOTT KÉRÉS (képekkel): „Eljutottam az első meccsig. 1. itt van valami glitchelés a kijelzőn, amikor ez a kijelölés van
> 2. a talizmánt mikor kapom, nincs semmi tanító felulet, hogy ez mi.
> 3. A klub arculatát még be kéne vezetni, hogy az első meccs előtt ajánlott legyen megcsinálni."

## 1. A kijelölés villogása
- **Az ok:** „Az első tizenegy” 1–2. lépése a teljes keretlistát jelölte ki. A lista magasabb a képernyőnél, ezért:
  - az arany keret fölül-alul kilógott, a szélein csíkok maradtak;
  - a lecke lapja rácsúszott a kijelölt elemre.
- **A javítás:** a kijelölés EGY sor, a példa-játékosé (`kutElsoSor`; ha nincs ilyen, az első kezdőé). A lecke szövege meg is mondja: „a kijelölt sor egy ilyen játékosod”.
- **Általános védelem:** a lecke-motor arany kerete minden lépésnél a képernyőn belül marad (`kutLeckeKiemel`).

## 2. A talizmán-húzás magyarázata
A húzás (egy mérföldkő jutalma) a 🧿 Talizmánok menüpont kinyílása előtt is jöhet. A hozzá tartozó tipp ilyenkor hallgatott, mert a funkció a Kezdő útban még zárva volt.

Az első húzásnál most magától indul a „A talizmán-húzás” vezetett lecke (`kutTalHuzasIndit`, a `talDrawOpen` végén). A lapja a húzás-ablak fölött jelenik meg.

| # | Lépés | Mit vár |
|---|---|---|
| 1 | **Mi ez?** — mérföldkő jutalma; nem játékerő, hanem egy terület kis, állandó plusza | Tovább |
| 2 | **Hogyan olvasd a lapot?** — terület, ritkaság (◆◇◇◇), az ALAP hatás számmal, ⚡, a Tiszta lap (×1,25); példa a saját első lapodból | Tovább |
| 3 | **Válassz egyet** — tipp: a csapatodnak legtöbbet érő terület | 👆 egy lap |
| 4 | **A gyűjteménybe** — a Passz (+2 szerencse) és a Később döntök is elmagyarázva | 👆 a gomb |
| 5 | **A talizmánjaid** — hol lesz a gyűjtemény; hány húzás vár még | Kész |

- **Ha több húzás vár:** a következő ugyanabban az ablakban nyílik újra. Ezért a 4. lépés a húzás lezárulását figyeli (a várakozó húzások száma csökken), nem az ablak bezárását.
- **Csak egyszer:** a második húzásnál már nem jön. Futó leckét nem szakít félbe.
- **Újranézhető** a leckék listájában.

## 3. A klub arculata az első meccs előtt
- **Mindig elérhető:** a 🛡️ A klub arculata kikerült a „klub” funkció zárja alól, mert ingyenes. A stadion, a scout és a keretbővítés zárva marad.
- **Ajánlott feladat:** a Kezdő út első szakaszában „Ajánlott: alkosd meg a klub arculatát”. A szakaszhoz 3 kell a 4-ből, tehát nem kötelező. A jel `view:identity`, a gomb koppintására.
- **Az első lecke vége** előtt vezetett lépések:
  1. villog a ☰ Menü;
  2. villog a 🛡️ A klub arculata;
  3. a panelen: címer, klubszínek, mez, stadionnév — ingyenes, öt mérföldkő, csapatstílus-pont;
  4. mentés, vagy „később” a villogó visszalépő gombbal.

## Próbák
- **Új:** `tools/kezdo-csiszolas2-1-0-11-22-01-proba.js`. Ezeket méri:
  - egy sor a kijelölés, a keret a képernyőn belül, a lap nem takarja;
  - a talizmán-lecke két várakozó húzással is végigmegy, és a másodiknál már nem jön;
  - az arculat: elérhető, ajánlott feladat, kipipálódik, benne van a leckében.
- **Frissítve:** `kezdo-ut-leckek` (11 lecke; a keret egy soron).
- **Zöld:** `kezdes-vezetes-1-0-11-21-00` (az első lecke a klubarculattal együtt végigmegy), `kezdo-ut-motor`, `tanitas-vezetes-1-0-11-22-00`.
