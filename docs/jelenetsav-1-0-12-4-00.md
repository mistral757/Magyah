# 🎬 A felületi jelenetsáv — 1.0.12.4.00

Ebben a verzióban három fejlesztői jegyzet (🐞) készült el: a jelenetsáv, a kezdőlap két útja és a stadion felső sávja.

## 1. A felületi jelenetsáv

**KIMONDOTT KÉRÉS (🐞 jegyzet jmwv3s4ux705r):**
> „Menő lenne, ha a játék több felületére tennénk kis animációkat. Amikor pl. megnyitom az
> infópultot, akkor egy klub-színeknek megfelelő háttérrel ellátott irodában, egy infópult mögött
> álló kedves nő/férfi köszöntene valami basic üzenettel. Mindez felül egy kis odaillő (fekvő és álló
> módban is jól működő, fekvőben max 25% képernyő-magasság, állóban max 33% magasság) kis sávban
> jelenne meg és opcionálisan ki lehetne kapcsolni azonnal, ha rákoppintasz, és magától is eltűnne
> egy 10 mp múlva. […] És mindegyiknél egységes lenne ez a megjelenési forma […] És persze ez is
> teljesen kikapcsolható lenne."

A kísérő kérés: „Ha gondolod folytasd meg egy pár menüpontnál, hogy mutassa példákat, te hogyan oldanád meg.”

### A keret
A keret egységes, és minden jelenet ugyanezt használja.

| | |
|---|---|
| Hely | Fent, a teljes szélességben. Álló nézetben legfeljebb a képernyő 33%-a (és legfeljebb 210 px), fekvőben legfeljebb 25%. |
| Elrendezés | Álló nézetben a beszédbuborék a színpad alatt van, fekvőben a színpad mellett, jobbra. |
| Eltűnés | Koppintásra azonnal. Magától 10 mp után; az alsó fogyó csík mutatja, mennyi van hátra. |
| Ismétlés | Ugyanaz a jelenet 90 mp-en belül nem jön újra. |
| Kikapcsolás | A sáv „kikapcsolom” gombjával, vagy a 🛡️ A klub arculata → 9 · Az animációk → 🎬 Felületi jelenetek BE/KI kapcsolóval. Tárolás: localStorage `magyah_jsav30_0`. |
| Rétegrend | `z-index` 9980: a felugró ablakok fölött, a 🐞 gomb alatt. |
| Csökkentett mozgás | Ha a rendszer csökkentett mozgást kér, az animációk egyszer futnak le. |

A színpad egy SVG (400×120, középre igazítva). A fal a klub színeiből van, és a két szélén túlnyúlik, így bármilyen oldalarányon kitölti a sávot. A szereplők a játék saját arcgenerátorával készülnek (`faceSVG`). Minden szereplőnek a klubhoz kötött, állandó arca van: a recepciós, az edző és a scout mindig ugyanaz.

### Az első négy jelenet

| Felület | Jelenet | Élő szöveg |
|---|---|---|
| 🏢 Infópult | Iroda a klub színeiben: címer, ablak, forgó óra, a pult mögött a recepciós, előtte monitor és gőzölgő kávé. | Napszak szerinti köszönés, a büdzsé, és hogy van-e friss mérföldkő vagy szezonjelentés. |
| 🏋️ Edzésterv | Edzőpálya bójákkal, a klubszínű mezben egy cselező játékos, az edző sípol. | A beállított fő edzés és a csoportok, vagy biztatás, ha még nincs terv. |
| 🛒 Vásárlás | Scout az asztalnál laptoppal és csengő telefonnal, mögötte a parafatábla jelöltkártyákkal, repkedő jelentőlapok. | Posztonkénti keresés, és nyitott ablakban, mennyi van még hátra belőle. |
| 📅 Menetrend | Esti stadion, villódzó reflektorok, ugráló klubszínű nézők, eredményjelző a következő meccsel. | A következő ellenfél, hazai vagy idegen, a dátum. |

### Új jelenet hozzáadása
Két lépés kell hozzá:
1. Egy függvény, ami a klubszínekből (`C.c1`, `C.c2`) `{svg, ki, szoveg}` objektumot ad. Közös elemek: `jsavFal`, `jsavCimer`, `jsavArc`.
2. Egy hívás a felület megnyitásánál: `jsavMutat("kulcs", fuggveny)`.

## 2. A kezdőlap két útja

**KIMONDOTT KÉRÉS (🐞 jegyzet jmwv3m7psf3xg):**
> „A kezdőlapon most a két út a kezdőrúgásig alatt 2-es számmal egyedül árválkodik a hagyományos
> mód. Ehelyett: legyen az 1. az, hogy egyedül játszom, a 2. az, hogy gyere 1v1. […] Remélem ott az
> indítófelület a mostani single-player frissítéseknek megfelelően updatelgetődött. […] ugyanúgy
> lehet-e állítani a vezetettséget, ugyanúgy ki van-e véve a dinamikus mód stb.”

Az új gombok:
- **01 Egyedül játszom**: a hagyományos karrier, ugyanoda visz, ahová eddig.
- **02 Gyere 1v1!**: a párharc-szobát nyitja (ugyanaz, mint a lenti 1v1 gomb).

A dinamikus mód rejtve marad.

Az 1v1 indítás ellenőrzése:
- A dinamikus mód közös karrierben is ki van véve (a módválasztó `off` jelzéssel adja).
- A Kezdő út (a vezetettség) közös karrierben szándékosan nem indul (`kutUj` közös karrierben null). Ott minden funkció nyitva, mert két ember egyszerre nem követhet egy leckét. Ez döntés, nem hiba; a jegyzetek közt jelezve.

## 3. A stadion felső sávja

**KIMONDOTT KÉRÉS (🐞 jegyzet jmwv3iuds7rhq):**
> „PC-n, vagy fekvő módban […] nincsen felül meg az a sáv, ahol látszik a verzió, a témák, a főmenü
> gomb, a hangerő gomb stb. Ez hiányzik innen mindenképpen”

A stadion-nézetben (`body.stadium`) a fejléc eddig rejtve volt. Most egy 38 px-es, rögzített felső sáv. Benne van:
- a csapatnév;
- a nehézség;
- a 🏠 főmenü;
- a ⛶ teljes képernyő;
- a telepítés;
- a téma;
- a 🔊 hang;
- a verzió.

A pálya (`#scSim`) e sáv alatt kezdődik.

## Próba
`tools/jelenetsav-1-0-12-4-00-proba.js` — 18 ellenőrzés:
- a kezdőlap gombjai;
- mind a négy jelenet, a magassággal és a szöveggel;
- a koppintás;
- az ismétlés-gát;
- a 10 mp;
- a fekvő nézet;
- a kikapcsolás és a visszakapcsolás;
- a stadion felső sávja;
- hogy nincs oldalhiba.

A jelenetsáv automatizált böngészőben (`navigator.webdriver`) csak akkor jelenik meg, ha a próba kéri (`window.JSAV_TESZT`), így a régi próbák képernyőit nem takarja.
