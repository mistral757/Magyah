# 3.9.210 — ⛰ A mezőny padlója és az idényenkénti vállalás

> „mi van ha a Run szint számolást hagyományos módban kicsit
> megváltoztatjuk, és nem ezekkel a szintugrásokkal operálunk? Hanem!
> Szezonról szezonra mindig úgy állítja be magát a mezőny ereje, hogy
> minimum olyan erősnek kell lennie, hogy a kezdő nehézséget elérje a
> távolság, akárcsak a D0-tól felfelé. Amennyiben pedig a mezőny alap
> fejlődése meghaladja ezt a minimum értéket, akkor természetesen a
> magasabbik szám él […]"

## A szabály

**Csak az új karrierekben** (`S.pyr.padlo`). A futó karrierek a régi
szerződésükkel futnak végig (szintugrás, hangolás, a D0 fölötti
kétirányú kalibráció).

**A kezdőrúgáskor** (a 2. idénytől, minden osztályban, a D0 fölött is):

> rajtoló mezőny = max(természetes szint, meccs-erőd − vállalásod)

* **A világ csak felfelé mozdul.** Ha elhúztál, a mezőny felnő a
  vállalásodig; ez a „mezőny-emelés”.
* **Ha a mezőny magától erősebb, az marad.** A sebesség-fokozat így attól
  kemény, hogy a világ elhúzhat, amikor gyengébb vagy.
* **A mérce a meccs-erő:** a nevezési erő (a lebutított felállás nem
  segít), ugyanaz, amin a kezdőrúgás horgonya is dolgozik.
* **A padló a minimum:** a mezőnyszint egész számra kerekedik, tehát a rés
  ugrásokban mozog. Ha a vállalás nem található el pontosan, a mezőny a
  keményebb oldalra áll — a rés a vállalás fölött nem marad, legfeljebb
  egy kerekítésnyivel keményebb. Az emelés mérve közelít (lépésenként),
  és a saját túllövését visszaveheti, de a természetes szint alá sosem
  megy.
* **A karrier eleji vállalás** a beállítón választott fok; a plafon csak
  akkor számol a vállalások átlagával, ha már van tényleges
  idényvállalás.

**A téli ablak zárásakor** (egyjátékosban) egy második, szintén egyoldalú
mérés:

* ha a rés közben a vállalás fölé nőtt, a különbség felét azonnal kapja meg
  a mezőny, a másik felét a hátralévő fordulókra elosztva;
* az egész osztály egyformán erősödik, tehát az AI-meccsek erőviszonya nem
  változik.

**Miért kell a téli mérés is:** a mentések szerint a dominancia az idényen
BELÜL épül fel (a meccs-erő bónuszai nőnek). Egy csak kezdőrúgáskori
padló a „3. idénytől 83% cím” mintát nem törné meg.

**Szintugrás és hangolás nincs:** a padló mindkettőt fölöslegessé teszi.

## A vállalás

**Minden idényre** külön vállalás: legalább ennyivel legyen alattad a
mezőny a kezdőrúgáskor.

| Irány | Szabály |
|---|---|
| Könnyítés | bármikor, a karrier eleji vállalás **+2**-ig |
| Nehezítés | idényenként legfeljebb **0,2**-vel, és csak **sikeres idény** (bajnoki cím vagy feljutás) után |

**Hol állítod:**

* **egyjátékosban:** a nyár végén, a fel- és kiesés után a „🎚 Vállalás”
  képernyőn (a szintugrás és a hangolás helyén);
* **bármikor nyáron:** a HUB gombján (a nehézségi szint alatt).

**A választás** a következő kezdőrúgáskor rögzül, a határok közé fogva.

## Közös karrier

* **Átlagok:** a két meccs-erő ÁTLAGA és a két vállalás ÁTLAGA számít:
  rajtoló mezőny = átlag meccs-erő − átlag vállalás.
* **A szezonindító kézfogás** viszi mindkettőt (`vall`); a vállalást a
  HUB gombján állítod be a „Következő idény” előtt.
* **Elmaradt kézfogásnál** nem találgat: abban az idényben nincs padló.
* **A szabály a szoba csomagjával utazik** (`padlo`): régi házigazdánál
  mindkét gép a régi szabállyal fut.
* **A téli mérés közös karrierben nincs:** ott nincs idény közepi
  kézfogás, amiből mindkét gép ugyanazt számolhatná.

## A Run

**A plafon nehézség-tényezője a vállalások átlagából** jön (a karrier
eleji vállalás is benne van). A nehezebb vállalás tehát a Run tetejét
emeli.

**Új sor: „Mezőny-emelés”:**

* **Mit mér:** idényenként mennyivel kellett a mezőnynek a természetes
  szintje fölé emelkednie (rajt + tél), az átlagos mezőny-erő %-ában.
* **A játékos-tempóhoz mérve:** gyorsabb tempón több emelés jár magától,
  ezért ott kevesebbet ér.
* **A pontozás ideiglenes:** 50 + 6 × átlag-% (100 pont ≈ 8%/idény), súly
  1,5. A mérő adatai hangolják majd.

## Mérő

A mérő idényenként rögzíti:

* a vállalást (`padlo.vall`) és a ténylegesen használt célt (`padlo.cel`);
* a rajt és a tél emelését (`padlo.emelesRajt`, `padlo.emelesTel`);
* a természetes szintet és a rést előtte/utána.

A beállításokban a `piramis.padlo` jelzi a szabályt.

## Próba

`tools/padlo-vallalas-3-9-210-proba.js` — 27 állítás.
