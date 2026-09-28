# 3.9.160 — Talizmánok F8: Kártyatár, öröklap, trófea-húzás, Pakli-mérföldkövek

A terv meta-haladása és a különleges források.

## 📚 Kártyatár

A karriereken átívelő gyűjtemény a böngésző tárolójában él
(`30-0-taltar-v1`), a profil mellett. Egy új karrier nem nullázza. Minden
speciálról feljegyzi:

* **👁 látott:** a kínálatban láttad;
* **✅ felvett:** a legnagyobb ritkasággal, amivel valaha felvetted;
* **🧬 fuzionált:** összeolvasztottad;
* **a legnagyobb dobást**, amit valaha láttál.

Hol látszik:

* **A Talizmánok menü Kártyatár fülén** színenként. A fel nem fedezett speciál neve rejtve marad („??? — ritkától”). Ha már csak 1–3 hiányzik, a fül kimondja.
* **A profilban** a „🧿 Talizmánok” sor mutatja a felfedezett, a felvett és a fuzionált speciálok számát, és a futó karrier archetípusát.

## 🕯️ Öröklap

**Mikor jár.** Ha egy játékos visszavonul (a szezonzáró mindkét ciklusában:
kezdő keret és tartalék), és két feltétel teljesül:

* legalább **5 idényt** töltött nálad (a klubnál töltött idő bélyege, 3.9.154);
* a **csúcsa legalább 85**.

Ekkor a következő húzás **utolsó helyén** róla szóló lap jön. Ha épp
Mesterlap vár, az elsőbbséget kap, és az öröklap a következő húzásra marad.

**Milyen a lap.**

| poszt | szín | idézet (a statisztikájából) |
|---|---|---|
| kapus | 🎓 Stáb | „*N* idény, *M* meccs a gólvonalon…” |
| védő | 📋 Taktika | „*N* idény, *M* meccs. Egyetlen csatár sem mondta róla, hogy könnyű volt ellene.” |
| középpályás | 🎭 Stílus | „*N* idény, *A* gólpassz. A játék rajta keresztül lélegzett.” |
| csatár | 🌱 Fejlődés | „*N* idény, *G* gól. A folyosón még mindig az ő mezszáma lóg.” |

* **Ritkaság a csúcs szerint:** 85+ ritka, 90+ nagyon ritka, 95+ legendás.
* **Alaphatás:** a szín egy változata, Tiszta-erővel.
* **✦ Pro:** a posztja játékosainak fejlődési tempója +6 / +8 / +11%.
* **✖ Kontra:** az ő mezszáma egy idényig senkinek nem adható. Aki mégis hordja, −4 morál-jel. Ha nem volt mezszáma: az öltöző egy idényig gyászol, −1 morál-cél.

## 🏆 Trófea-húzás

A három alkalom egy-egy plusz húzást ad, egyszer:

* **bajnoki cím:** az idényzáráskor;
* **kupagyőzelem:** az ünneplő képernyőnél, a tétnélküli nyári torna kivételével;
* **feljutás:** a piramis idényzárójánál.

Ha az idei plafon betelt, a húzás a **következő idény elejére** tolódik,
és ott az új idény plafonjába számít. A húzás-ablak forrás-sora:
„🏆 Trófea-húzás: *bajnoki cím*”.

## 🧿 A „Pakli” mérföldkő-sáv

Négy új mérföldkő-család. Pénzt fizetnek, tehát maguk is húzássá
cserélődhetnek.

| család | küszöbök |
|---|---|
| Talizmánok a pakliban | 5 · 12 · 25 · 40 |
| Legendás talizmánok | 1 · 3 · 6 |
| Rezonáló színek | 1 · 2 · 3 |
| Összeolvasztott talizmánok | 1 · 3 · 6 |

## Két ellenőrzés a tervből

* **„Pakliba ment: X”.** Nem volt meg. Ha a mérföldkő pénz helyett húzást adott, az idény-mérleg mostantól tájékoztató sort mutat: „🧿 pakliba ment (mérföldkő-pénz helyett talizmán-húzás)”, halványan, összeggel. Ez nem kiadás: a pénz be sem folyt, tehát a nyitó + Σ = záró egyenlőség áll.
* **A hátlap.** Nem volt meg: a lapok hátlap nélkül fordultak. Mostantól:
  * a húzás lapjai a **klub címerével, a saját színeiddel** érkeznek;
  * egyenként fordulnak;
  * a legendás lap hátlapján előbb fénycsík fut át (a terv 6.1: „a holo lap előbb csillan”);
  * csökkentett mozgásnál nincs hátlap.

## Ugyanebben a kiadásban: a tartós forma hatása a felére

> „Túl sokat ad a forma a meccs erőhöz. Felezzük a hatását. Negatív irányba is."

| | eddig | mostantól |
|---|---|---|
| a skála két szélén (1. és 14. fok), játékosonként | ±15% | **±7,5%** |
| a félskálák közepén (4. és 11. fok) | ±8% | **±4%** |
| a szélső sávok (1–3. és 12–14. fok) eredményesség-ráadása | ±3% | **±1,5%** |

A skála, a fokok mozgása és a frissítés ritmusa (ötmeccsenként) változatlan.
Csak a hatás lett fele akkora, felfelé és lefelé is. A 3.9.157-es mérés
kereténél („szárnyal", 12,5-ös fok) a 📈 forma-tétel +8,1 helyett nagyjából
+4. A kiírások (a sáv, az eredményjelző, a súgó és a keretlista) az új
számot mondják.

## Próba

`tools/talizman-f8-proba.js` (port 9194). A forma-felezést a
`javitasok-3-9-157-proba` méri: a HUB ⚡ és a 📈 tétel összege most is pontosan
a pillanatkép ⚡-ja.
