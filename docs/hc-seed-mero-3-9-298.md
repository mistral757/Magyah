# 🔬 Hardcore seed-mérő és a szigorúság gyógyítása (3.9.298)

## A bejelentés (hardcore közös karrier, 1. idény, a 8. forduló utáni ablak)

| | házigazda | vendég |
|---|---|---|
| a scout megfigyelt játékosai | 3 találat, mind 🎁 ingyen (88, 90, 79) | 1 találat, fizetős |
| a 7. heti kihívások | két „Nehéz” (eladás 85%-on, 4 húsz év alatti) | „Kapj legfeljebb 43 gólt” |

A kérés:

> „Szerintem építsünk be külön mérőt a hardcore PvP módba külön, hogy lássuk,
> a seed hogyan teljesít. Tehát mérjünk mindent, amit a seeddel állítunk, és
> akkor tudunk majd ellenőrizni, jól ment-e."

## A diagnózis

A mérési napló azonosítója a világ-seedet is viszi (`ZBKQXK5D_…`). Ebből az 1.
szakasz közös scout-terve utólag kiszámolható (`hc|s1:a|scoutterv`, 8-as
fokozat, 24%-os ingyen-arány):

| # | célerő a mezőnyszinthez | ingyen |
|---|---|---|
| 1 | +0,0 | 🎁 |
| 2 | +2,4 | 🎁 |

**A házigazda betűre ezt kapta:**

* Haaland 88: a mezőnyszint ~88, +0;
* Álvarez 90: +2,4;
* mindkettő ingyen.

A harmadik (Ortega 79) már **terven felüli** találat volt, a 33%-os
alapesély szerint lett ingyenes.

**A vendégnek ugyanazon a seeden** az első felfedezése szintén ingyenes,
~88-as találat lett volna. Ehelyett egyetlen fizetőset kapott, és a
kihívás-típusai is mások voltak.

**Következtetés: a vendég gépén nem futott a hardcore** (`S.mpSzigor` nem
`"hardcore"`).

**Hogyan veszhetett el.** A szigorúság a szoba csomagjából egy modulváltozón
át kerül a karrierbe, mint a 3.9.296-ban a nehézségi szabály. A valódi
kétkliens-folyamatot újrajátszottam a helyi szoba-háttéren: szobanyitás
hardcore-ral, csatlakozás, átnéző, indulás, újratöltés az átnézőnél és a
draftban. A mostani kódban **minden út megtartja**. Ezért a valószínű okok:

* a vendég **régebbi verziót** futtatott (gyorsítótárazott PWA);
* vagy egy, a próbában nem lejátszott újratöltési út vitte el.

Mindkettőre ugyanaz a védelem.

## A javítás

**1. A szigorúság gyógyul** (`mpSzigorGyogyit`):

* Mikor fut: a jelenlét első, teljes olvasásakor, a nehézségi szabály
  gyógyításával együtt.
* Ha a szoba csomagja hardcore, a futó karrier viszont nem az, a karrier
  hardcore-ra áll, és a napló kimondja.
* Ami addig seed nélkül jött, az eltérés marad. A következő húzásoktól a
  közös seed él.
* Könnyed szobát és ép karriert nem bánt.

**2. A két gép jelez egymásnak** (`hcmJelez`, a szoba `hcmer` rekesze):

* Mikor: a belépéskor, minden kézfogáskor és a panel megnyitásakor.
* Mit tesz a rekeszbe: a verziót, a szigorúságot, a világ-seed kivonatát, a
  nehézségi szabályt és a fokozatot.
* Ha a társáé eltér, **mindkét gép azonnal kimondja**, nem a 8. fordulóban.
  Példa: „🔬 Seed-mérő — a társad gépén más a beállítás: szigorúság (nálad
  Hardcore, nála Könnyed)”.
* Ugyanaz az eltérés csak egyszer kerül a naplóba.

**3. A szigorúság az Infópultban.** Az Infópult → A karriered lapon új sor
van: „🛡 PvP szigorúság: Hardcore / Könnyed”, alatta a 🔬 Seed-mérő gomb.

## A seed-mérő

**Hol él:** a karrier-mérő naplójában (`seed` mező), nem a mentésben.

* A Beállítások → 📈 Mérési napló letöltése és feltöltése magától viszi.
* A beállítások blokk (`beall.mp`) a közös karrier azonosítóit is tartalmazza
  (szerep, szoba, szigorúság, seed-kivonat), így a két gép naplója
  párosítható.

**Mit naplóz:** minden seedelt húzást, a szakaszával, a fordulóval, egy
összevethető kivonattal (`e`) és egy olvasható részlettel (`r`).

| fajta | kivonat (két gépen egyeznie kell) | részlet |
|---|---|---|
| kihívás-ajánlat (rövid, hosszú, kupa) | a típus | a teljes szöveg |
| scout-terv (szakaszonként) | darab, célerők, ingyenesség | ugyanez olvashatóan + ingyen-arány |
| felfedezés | a terv n-edik eleme (célerő/ingyen), vagy „terven felüli” | a tényleges játékos és ereje |
| scout-felderítés (ablak) | a poszt | a jelöltlista |
| átigazolási esemény | — | a kategória |
| képesség-keresés, klub-szemle | — | — |
| ifi-ablak | új/visszatérő + erő + poszt | a játékos |
| talizmán-kínálat | a 2–3. hely | mindhárom hely |
| skill-sor töltés | az első 3 skill | az első 6 |
| stáb-piac | szakmák | név, Sz |

Könnyed karrierben nem naplóz: ott nincs közös seed.

**Kézfogáskor** a két gép a lezárt szakasz részletes naplóját is kicseréli,
és a mérő **mindkét oldalt eltárolja**. Így egyetlen letöltött fájlból is
látszik, hol vált szét.

**A panel:** Infópult → A karriered → 🔬 Seed-mérő.

* **Az alap:** a te géped és a társadé egymás mellett. Ami eltér, piros.
* **A kézfogások:** pontonként a közös húzások egyezése. Kinyitva fajtánként,
  soronként mutatja az oldalakat: `=` egyezik, `≠` eltér, `·` csak az egyik
  oldalon van.
* **A saját seedelt húzásaid** szakaszonként.
* **A figyelmeztetések**, a gyógyítás is.
* **📋 Másolás:** a teljes seed-napló JSON-ban.

**Parancssori összevetés:**

```
node tools/meres/seed-osszevet.js <házigazda.json> [vendég.json]
```

* Egy fájllal: az alap, a figyelmeztetések, és kézfogásonként a két oldal
  fajtánkénti egyezése az első eltérésekkel.
* Két fájllal: a közös karriert a szoba + a seed-kivonat párosítja, és a két
  teljes napló szakaszonként összevethető (a kézfogás nélkül lezárt
  szakaszok is).

## Próba

`tools/hc-seed-mero-3-9-298-proba.js`. Két lap, a játék helyi szoba-hátterén;
A hardcore, B (a hibás vendég) könnyed. Amit mér:

* az alap-jelzés:
  * mindkét gép kimondja a szigorúság-eltérést;
  * egyszer, nem ismételve;
* a gyógyítás:
  * egyszer fut, a napló kimondja;
  * könnyed szobát nem bánt;
  * utána nincs új eltérés;
* a húzás-napló:
  * mind az öt fajta (kihívás, scout-terv, felfedezés, talizmán, skill-sor)
    naplózódik;
  * a két gépen azonos a kivonat-sor (más kerettel is);
  * olvasható részletet ad;
  * könnyedben nem naplóz;
* a kézfogás mindkét oldal naplóját eltárolja;
* a panel (Infópult-sor, gomb, alap, kézfogás `=` sorokkal, napló);
* a mérési napló (`beall.mp`, a letöltés viszi a seed-naplót);
* nincs oldalhiba.
