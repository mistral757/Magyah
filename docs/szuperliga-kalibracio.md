# ⛰ A szuperligák kalibrációja (3.9.112)

## 1. A kérés

> „+1 amikor kinyílik a D0 hagyományos módban (mindegy hogy PvP vagy sp)
> onnantól kezdve ne legyenek szintugrasi felajánlások, minden divízió onnan
> induljon, hogy a kezdetben kiválasztott nehézségi szintnek megfelelő
> erősségű mezőnyt kapjunk. Pl. Ha kiegyenlítettről indultunk +2 a mezőnyhöz
> képest az indulás, akkor d0-ban is így legyen (csak itt a meccs erőhöz
> igazítva). Tehát elindul például egy megnyert d0 után egy d-1 és a szezon
> kezdés pillanatában megnézi a meccs erőmet, ahhoz hozzáad vagy levon annyit,
> amennyi a játék kezdetekor beállított érték volt, a példa esetében levon
> kettőt, hogy +2ben legyünk, és úgy generál nekem mezonyt. PvPben
> természetesen a kettőnk átlag meccserejéhez igazítja ugyanezt."

A meccs-erős horgony szándékos volta külön meg is erősítve:

> „Igen, szándékos, mehet a meccs-erős horgony"

## 2. Mi volt a baj

A ligapiramis **önszabályozó rendszer** — de csak addig, amíg van hova
feljebb menni. Ha elszaladsz a mezőny fölött, feljutsz, és a következő
osztály visszahúz. Ez a visszacsatolás a D1 fölött elfogy.

A szuperligák ugyanis **a régi tetőhöz vannak kötve, nem hozzád**:

```js
const base=((top&&top.mean)||0)+PYR_STEP;   // pyrOpenTopDiv
```

Az új osztály pontosan egy lépcsővel erősebb az addiginál — függetlenül attól,
hogy a te kereted közben mennyit fejlődött. A `PYR_STEP` fix, a te fejlődésed
nem: egy jól menedzselt karrierben a keret idényenként többet lép, mint a
lépcső. Következmény:

| idény | világ lépése | keret lépése | a rés |
|---|---|---|---|
| D0 megnyílik | +PYR_STEP | — | ≈ a vállalt |
| D−1 | +PYR_STEP | több | tágul |
| D−2 | +PYR_STEP | több | tovább tágul |
| … | | | a szuperligák **egyre könnyebbek** |

Vagyis pont a hegy csúcsa lett a legkönnyebb szakasz — a mód ígéretének
(„a tető magától nyílik") a fordítottja.

## 3. Amit most csinál

**A D0 megnyílásától minden idény kalibrált kezdőrúgással indul.** A szezon
kezdetének pillanatában megmérjük a meccs-erődet, és a világot pontosan oda
állítjuk, ahol a karrier elején vállalt rés újra kijön. Aki kiegyenlítettről
(+2) indult, az a D−7-ben is +2-vel kezd.

```js
function pyrSuperOn(){ return pyrOn() && pyrAbove()>0; }
```

### A mérce: a MECCS-ERŐ

Kimondott kérés, és vállalt következmény. Nem a nyers keret, hanem a morállal,
edzővel, kapitánnyal, taktikával, összhanggal és a stílus bónuszaival (rettenet,
`engOvrBonus`) együtt mért erő — pontosan az a skála, amin a `levelGap()` és a
magányos horgony (`pyrAnchorAtKickoff`) már ma is dolgozik.

Ez azt jelenti, hogy **egy rossz morállal induló idényben gyengébb mezőnyt
kapsz, egy jól felépített nyár után erősebbet.** Ez nem mellékhatás: ez a
kérés lényege.

### Egy karrier, egy vállalás

A cél-rést **egyszer** fagyasztjuk be, az első kalibrált idényben:

```js
P.superWant = pyrRetuneWant();   // gapWant → gapWantMp → gap0
```

Enélkül a cél önmagát kergetné: a `pyrRetuneWant` régi mentésben a `gap0`-ra
esik vissza, azt viszont **maga a horgony írja újra** minden kezdőrúgáskor.

### Miért a kezdőrúgásnál, és nem a szezonfordulónál

A felhasználó a „szezon kezdés pillanatát" kérte, és van rá szakmai ok is: a
szezonforduló (`pyrSeasonTurn`) a **nyár előtt** fut, tehát az akkor mért
meccs-erő az igazolások, az öregedés és a friss morál nélküli. A kalibrációnak
a tényleges rajtoló keretet kell látnia.

A hívás helye ezért a `startNextCareerSeason`-ben van, **közvetlenül a
`buildSeasonFixtures()` előtt** — ez az utolsó pillanat, amikor a világ még
büntetlenül mozdulhat: se menetrend, se tabella nem mutat rá.

## 4. A két elhallgató felajánlás

Ha a mezőny minden idényben a vállalt résre áll, két meglévő felajánlás
elveszti az értelmét. Mindkettő elhallgat:

| felajánlás | miért hallgat el |
|---|---|
| **szintugrás** (`pyrLeapOfferable`) | Egy osztállyal feljebb is UGYANAZT a rést kapnád — csak a büdzséd árán. **Ezt a felhasználó kifejezetten kérte.** |
| **hangolás** (`pyrRetuneOfferable`) | A beragadás mentőöve Run-pontért tolja lejjebb a világot; a következő kezdőrúgás úgyis visszaállítja a vállalt résre, tehát a fizetség nyomtalanul elveszne. **Ezt nem kérte külön — a kalibráció következménye.** |

Egy **már megkötött** szintugrás-vállalás (`pyrLeapActive`) továbbra is
rendesen lefut és kiértékelődik: csak új ajánlat nem születik.

## 5. PvP: a páros átlag meccs-ereje

A magányos ág itt nem használható. A `levelGap()` a **saját** rejtett
bónuszodból dolgozik, az pedig kliensenként más — abban a skálában
horgonyozva a két világ garantáltan szétnőne (ugyanaz a hibaosztály, amit a
karrier eleji `pyrAnchorShared` már megoldott).

Ezért a PvP ág minden bemenete **cserélt szám**. A szezonindító kézfogás
(`mpStartExchange`) amúgy is lefut minden idény előtt, és 3.9.104 óta viszi a
meccs-erőt is:

| szám | honnan | miért közös |
|---|---|---|
| `avg` | a két `mstr` átlaga | mindkét kliens mindkettőt látja |
| `hid` | a két `mstr − str` átlaga | ugyanaz |
| `want` | `superWant` (a befagyasztott vállalás) | a szoba beállításából ered |
| `pyrLevel()` | a közös világ | determinisztikus |

A mezőny oldala a `levelGap` **tükre**: a piramisban az `oppBuffFor` pontosan
`max(0, rejtett × OPP_BUFF_MEASURED)`, tehát

```js
const mezo = () => pyrLevel() + Math.max(0, pair.hid*OPP_BUFF_MEASURED);
// a cél:  pair.avg − mezo()  ===  want
```

Nem kellett új aritmetikát kitalálni — csak páros alakba tenni a meglévőt.

### A kétlépcsős futás

A kapu (`mpSeasonGate`) a **szezonforduló előtt** fut, a kalibrációnak viszont
a forduló **utáni** osztályodat kell mérnie: a kettő közt egy fel- vagy kiesés
is történhet. Ezért:

1. **a kapuban** a `pyrSuperPairStash` csak **elteszi** a négy számot,
   a következő idény számával bélyegezve (`for`);
2. **a kezdőrúgásnál** a `pyrSuperAnchorShared` használja fel.

Ha a bélyeg nem stimmel (kényszerindítás, megszakadt kapcsolat, tavalyi
rekord), **nem kalibrálunk** — inkább kimarad egy idény, mint hogy a két
világ szétváljon.

A stash **minden** idényben elkészül, D0 alatt is: abban az idényben,
amelyikben a D0 megnyílik, már kell.

### Régi kliens

Ha a társ rekordjában nincs `mstr` (régi verzió), a nyers keretére (`str`)
esünk vissza, és a rejtett tagja 0-nak számít. A kalibráció akkor is lefut,
csak a nyers skálán — jobb, mint kihagyni.

## 6. Nincs lépéskorlát, szándékosan

A karrier eleji közös horgony `PYR_MP_ANCHOR_MAX=12`-vel véd egy félremért
első kézfogás ellen. Itt a korlát **ártana**: a szuperligák pont azért nőnek
el a kerettől, mert a világ lépcsője és a te fejlődésed két külön ütem — egy
megvágott kalibráció némán a felén állna meg, és a hiba idényről idényre
halmozódna.

A korlát ezért ugyanaz, mint a magányos ágon: **40 lépés, lépésenként
legfeljebb 4 Rating**. Ez a kettőt szimmetrikussá is teszi.

## 7. Amihez nem nyúlunk

- **A D0 alatti játék betűre a régi.** A kapu `pyrAbove()>0`, régi mentésben
  ez 0 — ott semmi nem változik.
- **A lépcső mezőny-ígérete** (`fieldWant`) a D0 fölött törlődik: ott egy
  rögzített mezőnyszint értelmezhetetlen (a világ addigra messze fölötte jár),
  és a felhasználó mostantól **rést** kért, nem szintet.
- **Az osztálylétszámok**: a kalibráció a világot *tolja*, nem rendezi át —
  a 16-os mezőny 16 marad.
- **A fel- és kiesés**: a kalibráció után is ugyanúgy mászol a hegyen. A
  mezőny nehézsége áll be, nem a helyezésed.

## 8. Ami a naplóban látszik

```
⛰ Szuperliga-kalibráció. A D0 megnyílása óta minden idény azon a
   nehézségen indul, amit a karrier elején vállaltál (Kiegyenlített,
   cél-rés +2,0): a mezőny a kezdőrúgás pillanatában a meccs-erődhöz
   igazodik — a rés most +2,0.
→  Szintugrási felajánlás és hangolás innentől nincs: a nehézséget már
   nem a lépcső adja, hanem ez a kalibráció.
```

PvP-ben egy sorral több: a két meccs-erő, az átlaguk, és hogy a világ merre
mozdult.

## 9. A próba

`tools/szuperliga-kalibracio-proba.js` (13 szakasz) — lásd `tools/README.md`.
