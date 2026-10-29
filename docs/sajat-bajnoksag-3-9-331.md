# 🌍 PvP saját bajnokság — Könnyed (ajánlott) a Hardcore mellett (3.9.331)

A terv és a döntések: `docs/terv-pvp-sajat-bajnoksag.md`. Ez a lap a
megvalósítást írja le.

## A kérés

> „A PvP szoba létrehozásakor már el kellene dönteni ezt is mint a tempót és
> a szigorúságot. És itt a mostani, eddigi rend lenne a hardcore és az új
> lenne a könnyed (ajánlott)."
>
> „Szezonok végén Run szint összehasonlítás is külön. És a célrés számítás
> szintén legyen közös. Mindketten választanak egy célrést. Annak az átlagát
> adjuk mindkettő csapat erejéhez külön-külön a külön mezőnyök ereje
> megállapításához."
>
> „A seedelhetőséget őrizzük meg, amennyire lehet. […] legenda jön, Blaise
> Djiudjitsu — egyik mezőny 90-es ⇒ 100 rating Blaise, másik mezőny 98-as,
> 108 Blaise. […] De legyen seedelhető súlyozottan."

## 1. A kapcsoló

A szoba létrehozásakor, a „⏱ Sebesség" után:

```
🌍 Bajnokság
  ● Könnyed — saját bajnokság (ajánlott)
  ○ Hardcore — közös bajnokság
```

* **Alapértelmezés:** a Könnyed.
* **A szakaszos közös seed** a régi „🛡 PvP szigorúság" kapcsoló új neve.
  Csak a Hardcore mellett jelenik meg, a lehetőségei „Ki" és „Be (fejlesztés
  alatt)".
* **Hol utazik:**
  * a h2h `cfg` rekesz `vilag` mezője;
  * a `start.settings.vilag`;
  * a mentésben az `S.mpVilag`.
* **Hol látszik:** a lobbyban, a vendég átnézőjében és az infópultban.
* **Régi szoba vagy mentés:** ha a mező hiányzik, az „közös"-t jelent. A futó
  karrierek betűre a régi szabállyal mennek tovább.

**A predikátumok:**

* `mpRoomOn()`: él a szoba (a régi `h2hRoomActive` törzse).
* `mpSv()`: él a szoba, és saját bajnokság van.
* `h2hRoomActive()`: saját bajnokságnál **hamis**. Ezért minden közös-világ
  ág kikapcsol:
  * a mezőny-alku;
  * a páros-léptetés;
  * a közös tabella;
  * a felzárkóztatás;
  * az osztott nehézség;
  * a verdikt-kapuk.

  A játék ilyenkor egyjátékos-szabállyal fut. A közös pontokat (a célrést, a
  párharc-napot, a kupát és a Run-összevetést) külön predikátumok nyitják
  meg.

## 2. Két külön világ

Mindkét gép egyjátékos-piramist épít a szoba közös seedjéből:

* 15 gépi ellenfél, 30 bajnoki forduló, párharc-helyfoglaló nélkül;
* a draft közös (ugyanaz a pool és ugyanaz a mag);
* a világ tengelyei (tempó, sorsolás, válogatottak, ikonok) a házigazdáéi;
* a nehézségi fokozat a házigazdáé, mindkettőtöknek ugyanaz.

**Ami külön megy:** a mezőny, a fel- és kiesés, a piac és a tabella. A
mezőny a saját súlyozott meccs-erődhöz áll be, a kezdőrúgás egyjátékos-ágán.

## 3. A közös célrés

A 2. idénytől a nyári célrés-ablak közös.

**Élőben.** Az ablak a társ pillanatnyi választását és a közös célrést is
mutatja. A választás a szoba `s<N>svcel` rekeszébe megy fel.

**Véglegesítés.** A „Rendben, ezzel indulok" után a gép bevárja a társat. A
kezdőrúgás a két hangolás **átlagával** számol:

```
közös hangolás = (a tiéd + a társadé) / 2  → P.nfHangNext
a te mezőnyöd  = a te súlyozott meccs-erőd − a közös célrés (a saját világodban)
```

A két mezőny tehát külön áll be, de ugyanakkora réssel indultok.

**Ha a társ nem jön.**

* Villám sebességnél a várakozás után a saját célréseddel indulsz.
* Tempós sebességnél gomb kínálja ugyanezt.
* „Még maradok a HUB-ban": a választásod fent marad. Visszatérve egyenesen a
  bevárásra jutsz.

**A napló** kiírja a két választást és a közöset.

## 4. A súlyozott seed

Saját bajnokságban (`hcSeed()`) a hardcore szakaszos véletlen-folyamai a
közös világ-seedből jönnek, **kézfogás nélkül**. Ezek:

* átigazolási esemény;
* scout, klub-szemle, képesség-keresés;
* ifi;
* kihívás;
* talizmán;
* skill-sor;
* a szakasz scout-terve.

A két gépen a szakasz n-edik húzása ugyanaz a véletlen. **Az erőt hordozó
érték viszont a saját mezőnyszintedhez mér.** Például a scout-terv célereje a
saját mezőnyöd plusz a közös eltolás, az esemény pedig a saját piacodból
választ. Ugyanaz a véletlen, a saját skáládon.

**Ami a hardcore-é marad:**

* a kézfogás;
* az ujjlenyomat;
* a 15. fordulóig közös scout-jelölt (`hcKorai`).

## 5. A párharc-nap

A társad klubja nincs a tabelládban, ezért a párharc **nem bajnoki forduló**:

* **az I. párharc-nap a 15. forduló után jön** (az ablak után, a 16. előtt),
  a házigazda a hazai;
* **a II. párharc-nap a 30. forduló után jön**, a szezonzárás előtt, a vendég
  a hazai.

**A meccs** a mai párharc-motorral fut:

* közös eseménylista, a két pillanatkép, a valódi meccs-erők;
* a kulcs `s<N>svd<1|2>`;
* a lapok, a sérülés és a játékos-statisztika úgy számít, mint a régi
  bajnoki párharcnál.

**Mi nem változik tőle:** az `S.idx`, a tabella, az ablak és a kapott gól
nélküli bajnoki meccsek száma.

**A tét:**

* **⚔ Párharc-mérleg:** 3 / 1 / 0 pont, a karrier egészére (`S.svPh`).
* **Párharc-díj:** győzelemért a saját heti lelátó ×1,5, döntetlenért ×0,75.
  A főkönyvben saját sora van („Párharc-díj").
* **Morál és taktika-begyakorlás:** mint egy meccsnél.

**A gomb** „⚔ PÁRHARC-NAP I/II" (előtte a felkészülés). A szezon nem zárul a
II. párharc-nap előtt.

## 6. A közös kupa — relatív mezőny

**Ami marad:** a közös nyári program saját bajnokságban is él:

* a jobbik kvalifikáció visz;
* HSZ, lánc, nyári torna;
* „csak a döntőben".

Ezek a kapuk az `mpKupaKozos()`-ra váltottak.

**Ami új: a mezőny relatív.**

* **A horgony.** Mindkét gép a SAJÁT horgonyára (`euroMidRating`) építi a
  mezőnyt. A nevezés minden sorozatra átküldi a saját horgonyokat
  (`svMids`).
* **A gépi csapatok** a közös kupa-seedből sorsolt eltolással ülnek a saját
  horgonyon.
* **A klubok neve** közös mércéből jön: a két horgony átlagából, a bajnoki
  kizárás nélkül.
* **A társ** a saját horgonyához mért távolságával kerül a te skáládra.
* **A szimuláció** csak a két erő különbségét nézi. Ezért a gépi csapatok, a
  kalapok, a csoportok és a gépi meccsek a két gépen **ugyanazok**, a
  különbség pontosan a két horgony különbsége.

## 7. Run-összevetés és párharc-lap

**A HUB-on** a Run-mérő alatt a ⚔ Párharc-lap áll:

* a párharc-mérleg (az idény két párharc-napjával);
* a Run-idények mérlege;
* az állás (a párharc dönt, egyenlőségnél a Run);
* az idény Run-összevetése: induló Run, mostani Run, gyarapodás, közös
  célrés, osztály, helyezés, a mezőny szintje, meccs-erő.

**Az idény Run-győztese** az, aki **többet gyarapodott**.

**Mikor zárul az idény.** A kezdőrúgáskor rögzül az új idény induló Runja,
és ezzel az előző véglegesen lezárul (a kupa is mozdítja a Runt). Ha mindkét
oldal végleges, a mérleg könyvel, és a napló kimondja.

A szoba rekesze: `s<N>svrun`.

## Mentés

| mező | tartalom |
|---|---|
| `S.mpVilag` | `"sajat"` vagy `"kozos"` (hiány = közös) |
| `S.pyr.svCel` | `{sn, h, hm, avg, kesz, how}` |
| `S.svPh` | `{v, m:{"<idény>:<n>":{gf,ga,at,tars}}, merleg:{w,d,l,gf,ga,p}}` |
| `S.svRun` | `{v, r0, sajat, tars, szamolt, gyoz}` |

## Próba

`tools/sajat-bajnoksag-3-9-331-proba.js` (31 állítás, két lap a helyi
szoba-háttéren):

1. a kapcsoló (csomag, alapérték, régi szoba);
2. a saját világ;
3. a közös célrés (élő csere, bevárás, átlag, kezdőrúgás);
4. a súlyozott seed;
5. a párharc-nap (egy valódi, két gépen lefutó párharc: tükörben azonos
   eredmény, mérleg, díj, az idx marad; a II. nap és a szezonzárás őre);
6. a közös kupa relatív mezőnnyel (azonos klubok, kalapok, csoportok és
   gépi meccsek, a horgony-különbséggel eltolva);
7. a Run-összevetés és a párharc-lap.
