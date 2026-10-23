# 🛡 Hardcore PvP — szakaszos közös seed és kézfogás (3.9.288, fejlesztés alatt)

## A kérés

> „Seedeljük ezentúl ne csak a draftot, hanem az egyes szezonon belüli
> eseményeket is szakaszonként. 1. szakasz: 1. szezon: szezonkezdés, és 1-8.
> meccs. Itt a hosszú kihívások (játékosspecifikus kihívások esetén csak maga
> a típus, minden más esetén a teljes kihívás egyezzen), a scout által talált,
> az ifiakadémián beköszönő játékosokat, a talizmánokat, a skilleket (…maga a
> skill-sor, amiből húzunk, az legyen rögzített, kivéve, ha a taktika miatt…
> eltér…) és a következő szekcióra vonatkozó rövid kihívásokat kell seedelni.
> 2. szakasz: 1. rövid átigazolás: itt a teljes piacot (a scout erősségének
> megfelelő számú felderítésre vonatkozóan), az átigazolási eseményeket, a
> vásárolható stábtagokat kell. 3. szakasz: 9-15. meccs: … a talizmánokat már
> úgy, hogy 1. helyen szétválhat aszerint, hogy kinek mi a main, 2. és 3.
> helyen ugyanazt kell kapják … 4. szakasz: … téli átigazolás. 5. szakasz:
> 16-23. meccs: … a scout célzás miatt a scout által hozott játékosok
> eltérnek. Az erejüket kell hangolni ezen a belépési ponton. Előre belőni,
> hány játékost talál majd, milyen átlag erősséggel, ebből hány lesz
> ingyenes (nehézségi szint függő), 6. szakasz: második rövid átigazolás. 7.
> szakasz: 24-30. meccs. 8. szakasz: nyári átigazolási lehetőségek teljes
> seedje. 9. szakasz: kupa kihívások és csoport nehézségek seedje … 10.
> szakasz: mindez szezonról szezonra … De mindig legyen egy seed. Ez legyen
> az alap, és az attól való eltérés … Ne váljanak szét. Minden ponton legyen
> egy egyeztetés, ott mindig meg is kell állni a játéknak, azaz be kell
> várjuk egymást egy kézfogásra."

## A szakaszok

| kód | szakasz | kézfogás a végén |
|---|---|---|
| `s<N>:a` | rajt + 1–8. forduló | **az ablak nyitása** (`tw8:be`) |
| `s<N>:tw8` | első rövid ablak | **az ablak zárása** (`tw8:ki`) |
| `s<N>:b` | 9–15. forduló | `tw15:be` |
| `s<N>:tw15` | téli ablak | `tw15:ki` |
| `s<N>:c` | 16–23. forduló | `tw23:be` |
| `s<N>:tw23` | második rövid ablak | `tw23:ki` |
| `s<N>:d` | 24–30. forduló | szezonzárás (ez eddig is kézfogás volt) |
| `s<N>:nyar` | nyár | szezonindító kapu (eddig is kézfogás volt) |
| `s<N>:kupa` | a kupa | a kupa kézfogásai (eddig is megvoltak) |

## A seed: „alap + eltérés"

**Minden seedelt húzás** saját, nevesített véletlen-folyamot kap a közös
világ-seedből:

```
hc | <szakasz> | <fajta> | <sorszám>
```

A sorszám a fajtán belüli **n-edik** húzás a szakaszban. A két gépen az n-edik
scout-felderítés, az n-edik átigazolási esemény, a k-adik forduló ifi-ablaka
ugyanazt a véletlent kapja.

**Az eltérés:**
* **Aki többet húz** (jobb scout, több esemény), az ugyanabból a sorból húz
  tovább.
* **Ami a két keret különbségéből fakad**, az a seed fölötti eltérés: a saját
  játékost nem lehet „felfedezni", és más a domináns talizmán-szín. A véletlen
  alatta ugyanaz.

**Időzítők és gombok.** A húzás alatt a folyamat az időzítőkbe és a gombokba
induló folytatást is viszi (mint a meccs utáni lánc). Egy animáció végén
eldőlő pörgetés tehát ugyanúgy seedelt.

| mi | hogyan | hol |
|---|---|---|
| **kihívások** (hosszú, rövid, kupa) | minden ajánlat-kísérlet saját folyam: a két gépen ugyanaz a **típus**-sor; a játékosra szabottnál csak a típus egyezik, a célszemély a sajátod | `showChallengeOffers` |
| **scout-felderítés** (poszt) | az n-edik felderítés | `twScout` |
| **klub-szemle, képesség-keresés** | az n-edik | a HUB gombjai |
| **átigazolási esemény** | az n-edik pörgetés | `twStartPhase2` |
| **ifi-ablak** | a **forduló** a kulcs (nem a sorszám) | `tryAcademyOpportunity` |
| **talizmán** | a karrier talizmán-seedje a világ-seedből. A kínálat: a 2. és 3. hely kategóriája, ritkasága és lapja közös, az 1. hely a saját domináns szín (main). Az 1. szakaszban mindhárom közös. A saját szerencse, a mesterlap és az öröklap csak az 1. helyre hat. A mérföldkőért és trófeáért járó húzás külön sorból jön, mert az a pályán dől el. | `talKinalat`, `talState` |
| **skill-sor** | a kezdő sorrend eddig is közös volt. Az újratöltés a **töltés sorszámával** seedelt. A taktika és stílus miatti beszúrás az eltérés. | `hcSkillToltRng` |
| **scout-terv** (a szakasz felfedezései) | lásd lent | `hcScoutTerv` |
| stáb-piac | eddig is időszakra nevesített folyam (`staffmkt:<kulcs>`) | — |
| kupa-mezőny és csoportok | eddig is közös (`mpCupRng`) | — |
| draft | eddig is közös | — |

**A meccsek nem seedeltek**, szándékosan. A meccsek a saját keretedből és
döntéseidből születnek, ezek az eredmények maguk.

### A scout-terv

A „hány játékost talál majd, milyen átlag erősséggel, ebből hány lesz
ingyenes" a szakasz seedjéből jön:

* **darab:** 2–3 találat;
* **erő:** mindegyik célereje a **közös mezőnyszinthez** mért eltolás
  (−3 … +4, a csúcs +0,5-nél);
* **ingyenesség:** az arány a fokozattól függ (Homokozó 45% … Semmi esély
  18%).

A felfedezést továbbra is a pályán szerzett mérföldkő váltja ki:

* **a szakasz első N találata** ezt a tervet követi: az erő és az ár közös, a
  scout-célzásod csak azt dönti el, **ki** jön;
* **ami fölötte jön**, az eltérés.

A terv a szakasz elején a naplóba kerül.

## A kézfogás

**A kapu.** Az átigazolási ablak nyitása és zárása hardcore-ban kézfogás. A
játék megáll, amíg a társ is oda nem ér (a várakozó-képernyő ugyanaz, mint a
többi kapuné).

**Az egyeztetés.** A két gép kicseréli a lezárt szakasz seedelt húzásainak
**ujjlenyomatát**, és fajtánként a közös előtagot veti össze. A napló kimondja:

* „✓ a 12 közös húzás mind egyezik · eltérés a seedhez képest: te +1, a
  társad +0 húzás";
* vagy „⚠️ … 1 eltért (kih:short)".

A szezonindító kapu ugyanígy veti össze az előző idény végét, a nyarat és a
kupát.

**A kilépés.** A „↩ Később folytatom" nem dobja el a kézfogást:

* függőben marad;
* a HUB tetején gomb hozza vissza;
* amíg nincs meg, **a kezdőrúgás és a végigjátszás sem indul**, hanem a
  kézfogást hozza elő.

A függő állapot már a kézfogás elején rögzül, így egy újratöltés sem ugorja át.

**Ha a társ nem jön.** 60 másodperc után felajánlja az egyedüli továbblépést.
Ezt beírja a szobába (`final`), és a társ gépe átveszi.

## Ami még fejlesztés alatt

* **A felfedezések száma.** A scout-terv a szakasz első N felfedezését
  hangolja. Azt, hogy hány mérföldkő jön, a pálya dönti el, nem a seed.
* **A jelöltlisták.** A piac jelöltlistái a saját keretedhez mért sávból
  szűrnek (a sajátodat nem kínálja). Ugyanaz a véletlen ezért hasonló, de
  nem betűre azonos embereket hozhat. Ez a kért „eltérés", de érdemes lesz
  mérni.
* **Régi kliens.** Ha a társ régi verzión van, ő könnyedként fut, és nem
  érkezik meg a kézfogásra. A 60 mp-es kiút ilyenkor visz tovább.

## Próba

`tools/pvp-hardcore-3-9-288-proba.js`. Két lap egy böngészőben, a játék saját
helyi szoba-hátterén: **valódi kétkliens-kézfogás**, ugyanaz a világ-seed, más
keret. Amit mér:

* a szakaszok;
* a `hcVel` determinizmusa, és hogy könnyedben semleges;
* a kihívás-típusok egyezése különböző kerettel;
* a talizmán (közös seed, 1. szakasz, 2–3. hely, a main);
* a scout-terv és a felfedezések célereje;
* a skill-sor és az ifi;
* a kézfogás:
  * a várakozás;
  * mindkét kliens továbblép;
  * az egyeztetés eltérés-jelzése;
  * nem kér újra;
  * a megszakítás → függő állapot;
  * a HUB gomb;
  * a forduló blokkolása;
  * az ablak nyitás/zárás hardcore-ban igen, könnyedben nem.
