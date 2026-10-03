# 3.9.182 — 🤝 A páros egy osztályban, egy világban (PvP)

> „Divízió ugrás eltörik D1-től kezdve. Bedobta társamnak, hogy ugorjon, és
> őt a D2-be ugrasztotta. 1. Nem kéne ilyenkor már felajánlani. 2. Ha ugrott
> volna, akkor D−1 lett volna a logikus. […] Csináld meg, hogy ha két játékos
> közül valaki már D0 vagy azalatt van, akkor idény indításkor mindkettő
> kerüljön a legerősebb divízióba. […] De más elcsúszás már nem lesz, ha
> alapvetően kijavítod."

## Mi volt a baj

A piramis-világot közös karrierben **mindkét gép külön számolja**, ugyanabból
a magból és ugyanazokkal a lépésekkel. Amíg mindketten ugyanazt teszitek, a
két világ ugyanaz marad.

Két döntés viszont **csak az egyik gépen mozdít**: az **ALL-IN szintugrás**
és a **hangolás** (mentőöv). Onnantól a két világ elcsúszik, és magától soha
nem jön vissza. A szuperligák (D0, D−1…) ráadásul csak annál nyílnak meg,
akinek a gépén a páros a legfelső osztályt nyerte.

Ezért a társad világában **nem létezett D0**. A játék egy régi, alsóbb
osztályból ajánlott neki ugrást, ezért lett a cél a D2.

## A szabály mostantól

**A páros mindig egy osztályban, egy világban kezdi az idényt — mindig az
erősebbikben.**

1. **Idényindításkor egyeztetés.** A nyári lánc végén, a szintugrás után és
   a kihívások előtt a két gép kicseréli az osztályát és a világ szerkezetét.
   * Ha eltér, a **gyengébb fél átveszi az erősebb fél világát és
     osztályát**.
   * Az „🤝 EGYÜTT KEZDITEK” ablak megmondja neki: „a társad a D−1-ben kezdi
     az idényt, ezért te is vele kezded (eddig: D2)”.
   * Az erősebb félnek egy naplósor szól, hogy a társa vele kezd.
   * Ha a két világ egyezik, a kapu szó nélkül továbbenged.
2. **Szintugrás.**
   * Ha a társad már erősebb osztályban van, **fel sem ajánljuk**, hiszen
     úgyis vele kezdesz. Ezt az idényindító csere előre tudja. Egy naplósor
     elmondja, miért nincs ajánlat.
   * Ha valamelyikőtök ugrik, az idényindító egyeztetés **a másikat is
     viszi**.
3. **Hangolás.** Közös karrierben nincs: csak a saját világodat tolná
   lejjebb, és szétválasztaná a kettőt.

### Ki az erősebb?

* A kisebb osztályazonosító (D−1 erősebb, mint a D0, az pedig, mint a D1).
* Egyenlőnél az, akinél több szuperliga nyílt meg.
* Ha ez is egyenlő, a házigazda.

A döntés szimmetrikus: mindkét gép ugyanazt kapja.

### Mit vesz át a gyengébb fél?

**A világ szerkezetét:**
* az osztályokat és csapataikat;
* a megnyílt szuperligákat;
* a páros két helyének könyvelését;
* az idényforduló jelzőjét.

**És a társ osztályát.** Utána ugyanaz a négy lépés fut, mint a szintugrásnál:
* mezőnyszint;
* fejlődési ütem;
* ellenfél-lista;
* jelvény.

A fejlődés-mérő is tud róla.

**Ami a sajátod marad:**
* a kereted;
* a büdzséd;
* a karriered naplója;
* a saját kalibrációd.

## A ti mostani játékotok

**Mindkettőtöknek frissítenie kell.** A következő idényindításnál:
* a társadnak már nem jár szintugrás (ha még nem döntött róla);
* a társad átkerül hozzád a D−1-be, és az ablak elmondja, miért.

Onnantól a két világ egy, és a fel- és kiesések is közösek.

## Próba

`tools/paros-egy-osztalyban-3-9-182-proba.js`, 18 állítás. Valódi
piramis-karrierrel fut, mellé egy kézzel épített, erősebb társ-világgal (a
társ egy megnyílt D0-ban). Ezeket méri:

* **A feloldás:** szimmetrikus; döntetlennél a házigazda dönt; egyező
  világnál nincs teendő.
* **Szintugrás és hangolás:** ha a társ erősebb osztályban van, nincs
  szintugrás, és a lánc egy naplósorral megy tovább; hangolás közös
  karrierben nincs.
* **A gyengébb fél:**
  * átveszi a világot (D0 megnyílik, ő is ott van);
  * a mezőnyszint és az ellenfél-lista az új osztályé;
  * a fejlődés-mérő tud róla;
  * megjelenik az „EGYÜTT KEZDITEK” ablak, a gomb továbbvisz.
* **Az erősebb fél:** nem változik, csak a napló szól.
* **Egyező világ:** azonnal továbbenged.
* **Egyéb:** a nyári lánc a szintugrás után hívja a kaput; mentés; nincs
  oldalhiba.
