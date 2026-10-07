# 3.9.221 — 🤝 Befektetés-arányos hangolás a közös karrierben

> „Folytasd a munkát a hangolással PvP. Az én gondolatom: a felzárkóztatás
> legyen rating és büdzsé és kedvezmény együtt, de mindegyik enyhébb mértékű.
> A rating mindenképpen enyhébb mint eddig."

Előzmény: a fejlesztői beszélgetés („7 egységgel erősebb a csapatom […] Most
elveszítem az előnyt […] Ez így egy külön hack") és a terv
(`docs/terv-befektetes-aranyos-hangolas.md`).

## Előtte → most

| | 3.9.220-ig | **3.9.221** |
|---|---|---|
| **Az elöl lévő** | a különbség felét lefelé lépi | **nem veszít** (kivétel lent) |
| **A lemaradó — rating** | a különbség felét kapja (Δ−1)/2 | a **negyedét** × f |
| **A lemaradó — büdzsé** | — | az éves bevétel 3%-a pontonként × f, legfeljebb **15%** |
| **A lemaradó — boost** | — | −3% pontonként × f, legfeljebb **−15%**, a következő idény végéig |
| **Mit néz** | csak a különbséget | a különbséget **és a befektetési arányt** |

Δ a két keret közti különbség (a mérce a 14 legjobb ratingű játékos, mint
eddig). A hangolás 1 OVR-ig most sem lép.

## A befektetési arány (BA)

```
BA = építő kiadás / (nyitó egyenleg + az idény bevétele)
     — az idei és a tavalyi idény 2:1 súlyú átlaga
```

* **Építő kiadás:** igazolás, boost, keretbővítés, stáb, scout, ügynökség,
  felállás, poszt-betanítás, mérföldkő-kategória, megtartási díj. **A később
  megtérülő is teljes értéken számít** (a társ ellenvetése: „ha szakemberekre
  költ, meg összhang boostra, akkor az azonnal semmit nem mutat").
* **Nem számít építő kiadásnak:**
  * a bér (az kötelező);
  * a hitel és a kamata;
  * a pénzügyi befektetés;
  * a tét jellegű tételek.
* **f** a lemaradó BA-ja az elöl lévőéhez mérve, legfeljebb 1. A nevező
  legalább 0,15, hogy két spóroló között egy apró arány ne szálljon el.
  * Ha a lemaradó legalább annyit fektetett be: f = 1, teljes felzárkóztatás.
  * Ha a pénzén ült (pl. 0,1 vs 0,4): f = 0,25, negyedannyi.
  * Ha senki nem fektetett be: f = 0, nincs felzárkóztatás.

**Az elöl lévő egyetlen kivétele:** ha lényegesen kevesebbet fektetett be (a
BA-ja a lemaradóénak 60%-a alatt), a fölénye nagy része nem a munkájából jön.
Ilyenkor (Δ−1) 15%-ával lejjebb lép.

## Példa (Δ = 7, azonos befektetés)

| | Régi | Új |
|---|---|---|
| Elöl lévő | −3,0 rating | **0** |
| Lemaradó | +3,0 rating | **+1,5 rating, az éves bevétel 15%-a, −15% a boostokon** |
| Különbség utána | 1,0 | 5,5 (a többit a pénz és a kedvezmény segít behozni) |

## Az idény egésze egy mérce

Kupás idényben két kapu van (a bajnokság és a kupa után). **Az idény teljes
felzárkóztatása a legnagyobb, abban az idényben mért különbség terve:**

* a második kapu csak a különbözetet adja;
* ha a kupa alatt **nőtt** a szakadék, a növekmény jár;
* ha szűkült, nem jár újra semmi.

Enélkül a két kapu együtt közel annyi ratinget adott volna, mint a régi
szabály, a kérés viszont az volt, hogy a rating „mindenképpen enyhébb".

## A két gép egyetértése

* **A BA a szezonzáró csomagban utazik** (`stats.ba`, `baV:1`). Mindkét kliens
  a **publikált** értékkel számol, nem egy később újraszámolttal: a főkönyv a
  kupa és a nyár alatt még mozog.
* **A terv tiszta függvény** (`mpCatchPlan`). Ugyanabból a négy számból
  mindkét gép ugyanazt kapja, a saját szemszögéből, pontos tükörképként.
* **Régi társnál** (a csomagjában nincs BA) mindkét oldal a régi szabályt
  futtatja: a két gép soha nem számol kétféleképp.
* **A saját záró érték is követi a hangolást.** A kupa utáni kapu így a már
  hangolt különbségből indul, nem kétszer ugyanabból.

## Felület

* A „Mindketten folytatjátok" doboz és a napló kimondja:
  * a különbséget;
  * ki vezet;
  * a lemaradónál a három tételt;
  * az elöl lévőnél, hogy „a kereted nem változik — a fölényedet megtartod";
  * mindkettőnél **a két befektetési arányt**.
* A Boost-központ kedvezmény-sora és a HUB-gomb kiírja a
  „🤝 PvP-felzárkóztatásból" kedvezményt és a lejáratát.
* A főkönyvben saját sor: **🤝 PvP-felzárkóztatás** (bevétel). A 💰 Jobb
  üzletmenet talizmán nem szorozza.

## Próba

`tools/pvp-hangolas-3-9-221-proba.js` — 31 állítás:

* a BA a főkönyvből;
* a terv minden ága (azonos, spóroló, kicsi, elöl lévő, elöl lévő-spóroló,
  senki, tükör);
* a teljes kapu a lemaradónál (rating, büdzsé a főkönyvben, kedvezmény a
  boost-árban, a záró érték, doboz, napló);
* a kupa utáni kapu (szűkült / nőtt szakadék, az idény számlálója);
* az elöl lévő;
* a régi kliens;
* a csomag, a mentés, a lejárat és a talizmán-kivétel.
