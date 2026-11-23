# 1.0.11.9.00 — Ifj. arcöröklés, arc másolása, az ellenfél játékosai a stylistnak

## Kérés
> Szutykos stylist: lehessen arra rányomni, hogy ezúttal a játékosokat is be akarom állítani ·
> Arc másolás meglévő játékosról · Ifj. verziók eleve kapják meg azt az arcot

## 👶 Ifj. változatok
A magyarítás az egynevű kártyákat (Baggio, Cruyff, Maldini…) „ifj.” előtaggal
választja el a teljes nevű párjuktól (ifj. Bádzsó ↔ Bádzsó Robika). Az ifj.
változat arca mostantól a **párjáé**:

- ugyanabból a magból készül, a pár nemzetiségének arcrégiójával;
- a pár minden beállított kinézetét örökli (közös lista, globális, karrieres);
- a saját beállítása erre kerül rá; a **kor a sajátja** (őszülés, hajvonal, ráncok, szakállesély).

**A pár:** a megjelenített név „ifj.” utáni része pontosan egy másik játékos rövid
nevével, teljes nevével vagy vezetéknevével egyezik (ékezet nélkül is). Ma 14
pár van. **Nincs öröklés**, ha több a jelölt (ifj. Ánderfi: három Ánderfi van), vagy
nincs pár (ifj. Fiatal, ifj. Rokve, ifj. Kutinnyó → itt van: Philippe Coutinho).
A stylist-névcsere után a párok újraszámolódnak.

## 📋 Arc másolása
Az arcszerkesztőben új gomb: **📋 Arc másolása**. Keresés két betűtől a teljes
adatbázisban, arcképpel; a választás után a játékos arca a forrásé (mag,
arcrégió, a forrás beállított kinézete), és innen tovább igazítható.

- Tárolás: a kinézet új mezője, `minta: "<név>"` (FACE_MOD_MEZOK `"s"` típus).
- A másolás az alatta lévő rétegeket (pl. a játékos saját közös kinézetét)
  elveti — a másolt arc a forrásé, nem keverék.
- Lánc: saját minta → ifj. pár → …, legfeljebb 4 lépés, kör nélkül.
- Stylist-módban a közös listára is felmegy; a napi beépítő (`tools/stylist/beepit.js`)
  csak a játékban létező nevet fogadja el mintának.

## 🧑‍🎨 Az ellenfél játékosai (stylist)
A meccs előtti mez-ablak (stylist-mód + „Szívesen stylistkedem”) új gombja:
**„Ezúttal a játékosokat is beállítom →”**. Kinyílik az ellenfél teljes kerete
(arckép az ellenfél mezében, poszt, kor a kártya idénye szerint), a 🎨 a
megszokott szerkesztőt nyitja **globálisan** (stylist-módban a közös listára).
A lista a szerkesztő bezárásakor frissül; „Kész” indítja a meccset, „Vissza a mezhez”
visszavisz. Csak valós kerettel rendelkező ellenfélnél látszik.

## Próba
`tools/arc-masolas-1-0-11-9-00-proba.js` — párok, azonos vonások, öröklés, minta,
kör, a szerkesztő 📋 folyamata, a mez-ablak kerete.
A `mez-stylist-3-9-320` próba gombszámlálása az új gombot nem számolja (a 3 régi
hiba — a közös MEZ_ALAP-ban már szereplő csapat — változatlan, a main-en is fennáll).
