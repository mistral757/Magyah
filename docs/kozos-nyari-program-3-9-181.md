# 3.9.181 — 🗓 A közös nyári program (PvP) és a meccs mérlege

## 1. A bejelentett hiba

> „D0 PvP, én 12. helyen végeztem, és azonnal a Hiper Szuper Kupában indultam.
> A társamnak a Fából készült Kupa indult, és a 32 között azt írja neki, hogy
> várnia kell rám. […] a két játékost mindig az erősebb viszi oda, ahová őt
> nevezi a játék. Nekem is mennem kellett volna vele FA kupába, utána jött volna
> automatikusan, helyezéstől függetlenül a HSZK, mert az D0-tól felfelé már
> mindig van. És utána a nyári kupa annak, aki hamarabb kiesett. Ha döntőben
> találkoztak, akkor a vesztesnek."

### Miért történt

A közös kupanevezés egyetlen sorozatot választott a `MP_CUP_RANK` rangsor
szerint. A **Fából Készült Serleg és a Hiper Szuper Kupa hiányzott ebből a
rangsorból**, ezért mindkettő 0-t ért. Egyenlőségnél a „saját” nevezés nyert,
így mindkét gép a **saját** kupáját tartotta meg: nálad HSZ lett, a társadnál
FA. Mindkét gép ráadásul azt írta ki, hogy „mindketten ugyanabba jutottatok”.
A társad FA-mezőnyében ott ült a te csapatod, és a 32 között rád várt.

**Miért kaphattatok egyáltalán eltérő kupát?** A kupa a saját osztályotokból
jár. PvP-ben az ALL-IN szintugrás és a hangolás is felajánlódik, és csak annak
az osztályát mozgatja, aki megveszi. Így kerülhetett az egyikőtök a D0-ba, a
másik pedig alacsonyabb osztályba. Ezt a mostani változat nem tiltja, de a két
osztály mostantól nem tud eltérő nyarat okozni.

## 2. A szabály mostantól: egy közös program

A nyár nem egyetlen sorozat, hanem egy **program**. Mindkét gép ugyanabból a
két nevezésből ugyanazt építi fel. A feloldás tiszta, szimmetrikus függvény
(`mpResolveProgram`): ha a két nevezést felcseréled, ugyanazt adja.

| # | lépés | mikor |
|---|---|---|
| 1 | **Helyezési kupa** | A kettőtök helyezésből járó nevezése közül az **erősebb** visz mindkettőtöket (KK > OJK > KONF > FA > MK). Azonos sorozatnál selejtező csak akkor van, ha mindkettőtöknek selejtezőtől járna. |
| 1b | **Lánc** | Ha a helyezési kupa megnyerése újabb sorozatot ér (pl. FA → KK-selejtező), az **bármelyikőtök győzelmére mindkettőtöknek** jár, rögtön utána. |
| 2 | **Hiper Szuper Kupa** | Ha bármelyikőtök a D0-ban vagy följebb játszik, mindketten jöttök, helyezéstől függetlenül. |
| 3 | **Nyári Felkészülési Kupa** | Az utolsó közös kupa után annak jár, aki **hamarabb kiesett**. Ha a döntőben találkoztatok, a vesztesnek. Ha ugyanabban a körben estetek ki, mindkettőtöknek. Egyedül játszod, várakozás nélkül. |

A bejelentett eset az új szabállyal így fut:

1. FA, a társad helyezése jogán (ha bármelyikőtök megnyeri, KK-selejtező is
   jön mindkettőtöknek);
2. HSZ, a te D0-d jogán;
3. utána a Nyári Felkészülési Kupa annak, aki hamarabb kiesett.

Ha egyikőtök sem szerez kupát, és nincs HSZ sem, a régi, közös nyári torna
marad (mindkettőtök igenje kell hozzá).

## 3. Tájékoztatás és átengedés

### Tájékoztatás

* **A nevezéskor** a napló kiírja a teljes programot. Minden lépésnél
  szerepel, kinek a jogán jár (a helyezéssel), mit ér a lánc, és kié lesz a
  nyári torna.
* **A kupaképernyőn** egy sáv mutatja, hol tartotok, pl. `FA → HSZ → NYK a
  hamarabb kiesőnek`. Alatta az áll, miért játszod ezt a kupát.
* **A kupa záró gombja** a következményt mondja, pl. „Tovább a programban:
  Hiper Szuper Kupa →”, „Tovább — megnézzük, megnyeri-e a társad →”, vagy
  „Tovább — 🟠 jöhet a Nyári Felkészülési Kupa →”.
* **A kupa utáni kapun** az vár, aki tovább jutott. Ott kiírjuk neki: „a
  társad esett ki hamarabb, ezért neki jár a Nyári Felkészülési Kupa; ha
  elindítja, a torna végén ér ide”.

### Átengedés

* **A győztes nem vár.** Ha megnyerted a láncos kupát, a lánc biztosan elsül.
  A rekordod felmegy, és indulsz.
* **A kiesett társ nem tart fel.** Ha a társ már kiesett, ő sem nyerhette meg,
  így nincs mire várni.
* **Lánc nélküli lépés után azonnal jön a következő.** Az első közös pont
  (csoport- vagy ligazárás) úgyis bevárja a társat.
* **A hamarabb kiesőnek járó nyári torna egyedül megy**, várakozás nélkül.
* **Csak egy valódi várakozás maradt:** ha kiestél, a társ viszont még a
  láncos kupában menetel, meg kell tudni, megnyeri-e. Ebből a várakozásból
  **kilépni nem feladás**: mentve marad, és a HUB „Vissza a közös nyári
  programhoz” gombja oda visz vissza.

## 4. A közös Hiper Szuper Kupa javítása

A HSZ 32-es ligaszakaszában a két gép eddig **nem egyeztetett**. A te
tabelládban a társad nyolc meccse csak szimulált volt, az ő tabellájában pedig
a tieid. A közös ág ráadásul a 9–24. helyezettet is egyenesen a
nyolcaddöntőbe küldte, rájátszás és ellenfél nélkül.

Mostantól:

* **A ligaszakasz végén** a két gép kicseréli a **valódi** eredményeit. A
  társ nyolc meccse a nálad szimuláltak helyére kerül, a saját sorodhoz semmi
  nem nyúl. A helyezés csak ezután dől el.
* **9–24. helyen** rájátszás jön. Ha mindketten ott vagytok, a meglévő
  körzáró egyeztetés bevárja a másikat.
* **Ha te a top 8-ban vagy, a társad pedig a rájátszásban**, a rájátszást
  **nézőként** megvárjuk, mert a nyolcaddöntő párosítása az ő valódi
  eredményén is múlik. A többi párharcot pontosan úgy szimuláljuk, ahogy az ő
  gépe. A várakozás kiléphető; a „Tovább a nyolcaddöntőhöz” gomb és az
  újratöltés is ide hoz vissza.
* **A csoport- vagy ligacsere után** a gép azt is tudja, ha a társ kiesett.
  Ezen múlik, kié lesz a nyári torna.

## 5. A meccs mérlege

> „A feed ezen része a meccsek végén legyen mindig a legalul […] legyen az,
> hogy ez ugrik fel, a meccsvégi statisztikák nem, és ezen a felugró ablakon
> van egy külön gomb, ami megnyitja a meccsvégi statisztikákat."

* **A feedben** a „🎙 A meccs mérlege” és a „📊 Izgalom” sor mostantól a
  lefújás utáni lánc **végén** íródik ki, a jutalmak, mérföldkövek és skillek
  után. Így ez a meccs utolsó két sora.
* **A meccs végén a mérleg ugrik fel**, nem a statisztika. Az ablakban a
  végeredmény, a mérleg mondata, az izgalom pontszáma (sávval) és a bontása
  látszik.
* **A „📊 Meccsvégi statisztikák” gomb** ugyanabban az ablakban megmutatja a
  statisztikát.
* **A „Rendben” gomb** bezárja az ablakot, és továbbvisz, ugyanúgy, mint eddig.
* **A meccsképernyő statisztika-gombja** továbbra is egyenesen a statisztikát
  nyitja.
* **A mérleg a meccs-statisztikával együtt mentődik.** A lefújás utáni lánc
  újratöltés után is ki tudja írni és meg tudja mutatni, de a naplóba csak
  egyszer kerül be.

## 6. Próbák

* **`tools/kozos-nyari-program-3-9-181-proba.js`**, 38 állítás:
  * a feloldás (a bejelentett eset szimmetrikusan, a régi hiba, a selejtező,
    régi kliens);
  * a nevezés és a naplózott program;
  * a léptetés (a társ győzelmére elsülő lánc, sorozatonkénti kulcsok,
    selejtező-körszám, győztes átengedése);
  * a nyári torna öt esete;
  * kilépés és visszatérés;
  * a közös HSZ cseréje és a nézői rájátszás;
  * mentés.
* **`tools/meccs-merlege-3-9-181-proba.js`**, 13 állítás, egy valódi bajnoki
  meccs után:
  * a felugró mérleg;
  * a feed utolsó két sora;
  * a statisztika gomb;
  * a bezárás és a továbblépés;
  * mentés és újratöltés.
* **`tools/frissites-proba.js`**: változatlanul zöld.
