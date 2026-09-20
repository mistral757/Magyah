# ⭐ Sztár piac (3.9.100)

## A kimondott kérés

> „Globálisan minden módban PvP, single, dinamikus, hagyományos. Minden. Ha a
> csapaterőd eléri a nyers 110-et, és az átigazolási ügynökség eléri a 4
> csillagot, akkor megnyílik egy új átigazolás típus: sztár piac. Itt az alap
> skálától 20%-kal jobb játékosokat lehet igazolni. Minden keresés 4 játékost
> dob fel: 1 kapus, 1 védő, 1 középpályás, 1 csatár. Az átigazolási ügynökség
> fejlődésével nő az ilyen keresések száma. Ez csak nyáron van nyitva."

## Miért van rá szükség

A meglévő keresések mind az **alap sávból** dolgoznak (`signingBand`): a
mezőny szintje, a kereted **nyers ereje** és a **legjobb embered** feszíti ki,
és mindhárom a klubbal **együtt nő**. Ebből az következik, hogy bármilyen nagy
is leszel, a piac mindig „magadfajtát" kínál — a felzárkózás után **nincs hova
nőni rajta keresztül**.

A sztár piac az egyetlen csatorna, ami a saját sávod **fölé** mutat. Épp ezért
áll két kapu mögött, és épp ezért csak nyáron.

## A két kapu

| | mérce | miért ez |
|---|---|---|
| **110 nyers csapaterő** | `teamStrength()` | ez az a szám, amit a kupa-nézet és a felállás is „csapaterő"-ként ír ki. **Nem a meccs-erő**: abban benne ülnek a rejtett bónuszok (morál, edző, taktika, aura), és egy jó napi forma nem nyithat meg egy piacot. |
| **4★ ügynökség** | `agencyStars()` | ide a kapcsolataid kellenek, nem a scout szeme. |

A kettő **együtt** kell. A HUB-gomb végig látszik — ez hosszú távú **cél**, azt
látni kell ahhoz, hogy célozz rá —, és a felirata mindig megmondja, melyik
kapu hiányzik, a saját mai értékeddel:

```
⭐ Sztár piac
   110 nyers csapaterő kell hozzá — a tiéd 96,4
```

A megnyílás **egyszer hangot kap** a naplóban. A bejelentés a kapu
teljesülésekor szólal meg, nem a nyár nyílásakor: az a pillanat a tiéd.

## Minden módban

A rendszer **egyetlen mód-jelzőt sem olvas**: se `pyrOn`, se `infinityMode`,
se `h2hRoomActive`. Ami közös benne mindenhol — a csapaterő, az ügynökség és a
nyári ablak —, az mindenhol létezik. A próba ezt külön méri: piramis, Infinity
és közös karrier mellett betűre ugyanaz jön ki.

## A gap-létra

Mennyivel jobb embert találsz az alap sávnál. A kérés három pontot ad meg, a
köztük lévők **lineárisan** jönnek — és **félcsillagonként** lépünk, mert az
ügynökség is fél csillagonként fejlődik (egy szint = fél csillag).

| ügynökség | gap |
|---|---|
| 4★ | 15–25% |
| 7★ | 22,5–32,5% |
| 10★ | 30–40% |
| 15★ | 40–50% |
| 20★ | 50–60% |
| 30★ | 70–80% |

**Húsz fölött** a legutolsó szakasz meredeksége folytatódik (félcsillagonként
+1 százalékpont): az ügynökségnek nincs felső határa, tehát a létrának sem
adunk mesterségeset — a 20 fölötti csillag amúgy is egy egész karrier munkája.

A gap **minden emberre külön sorsolódik** a sávján belül, hogy a négy találat
ne egyforma távolságra álljon a mezőnytől.

## Hány keresés egy nyáron

A kérés táblázata, betűre:

| ügynökség | keresés | | ügynökség | keresés |
|---|---|---|---|---|
| 4–5★ | 1 | | 8,5–10★ | 5 |
| 5,5–6★ | 2 | | 10,5–13★ | 6 |
| 6,5–7★ | 3 | | 13,5–16★ | 7 |
| 7,5–8★ | 4 | | 16,5–20★ | 8 |

Húsz csillag fölött **ötösével** jár a következő: 20,5–25★ → 9, 25,5–30★ → 10,
és így tovább.

A keret a **nyári dobozban** él (`summerLooks`), a szezonhoz kötve — egy HUB-ba
ki-be lépkedés vagy egy újratöltés nem tölti újra, és a következő nyáron
tiszta lappal indul. **Közben is nőhet** (ügynökség-fejlesztés): ilyenkor az
*elköltött* alkalom a fix pont, és a maradék abból számolódik újra — a kiírt
„maradt x/y" sosem hazudik, és egy fejlesztés nem tünteti el, amit már
elhasználtál.

## A keresés

Négy ember, **posztonként egy**: kapus · védő · középpályás · csatár. A
`twScout` harmadik keresési módja (`searchMode:"star"`) — a jelöltválasztáson
kívül minden közös a másik kettővel: ugyanaz a lista, ugyanaz a POT-felmérés,
ugyanaz a vásárlás-folyamat.

A célérték a szokásos sávból indul (`rollSigningTarget`), és a gap-létra emeli
meg. Aki egy szerepre nem talál senkit (üres pool, elfogyott a büdzsé), az
egyszerűen kimarad: három találat is találat.

### A besorolás, amit a próba fogott meg

Az első nekifutásban a szerepenkénti szűrés a `BENCH_CATS` kódlistáiból
dolgozott — azok viszont **átfednek**: a `JSZ`/`BSZ` egyszerre szerepel a
`KOZEPPALYAS` és a `CSATAR` szerepnél. Emiatt a „középpályás" helyre **szélső
csatár** került, és a találat mást mondott, mint amit kerestünk:

```
["KAPUS","VEDO","CSATAR","CSATAR"]
```

A `ROLE_CATS` kódlistái viszont **diszjunktak**, és pontosan azt olvassa a
`getCategoryFor` is, ami a listasor címkéjét adja. A szűrés azóta ezen megy:
a **kiválasztás** és a **kiírás** ugyanabból az egy igazságból dolgozik.

## Az üzletkötés esélye (3.9.103)

KIMONDOTT KÉRÉS: *„A sztár igazolásnál növeljük meg az üzletkötés esélyét.
Itt egy saját rendszer legyen. 4 csillagnál 66% esély ==> 10 csillag már 90%
és innen szépen lassan tart a 99% felé, amit 30 csillagnál már elér."*

### Miért saját rendszer

A rendes tárgyalás kimenetelét a **scout** minősége tolja (`scoutQuality`). A
sztár piacot viszont nem a scout nyitja meg, hanem az **ügynökség**, és a
másik két létrája (gap, keresésszám) is a csillagaiból jön. Logikátlan volna,
hogy a húszcsillagos ügynökség olyan embert talál, akit aztán ugyanakkora
eséllyel veszítesz el, mint a legelsőt: az ügynökség egész értelme az, hogy
**tárgyalni is tud**.

### A görbe

Két szakaszból áll, pontosan a kérés szerint. A lépcső itt is
félcsillagonként megy, mint a másik két létránál, és a padló a nyitó négy
csillag.

| ügynökség | üzletkötés |
|---|---|
| 4★ | **66%** |
| 5★ | 70% |
| 6★ | 74% |
| 7★ | 78% |
| 8★ | 82% |
| 9★ | 86% |
| 10★ | **90%** |
| 12★ | 92,3% |
| 15★ | 93,9% |
| 20★ | 95,9% |
| 25★ | 97,6% |
| 30★ | **99%** |
| 30★ fölött | 99% |

* **4★ → 10★: lineáris.** Egész csillagonként +4 pont, félcsillagonként +2 —
  kerek, fejben követhető számok.
* **10★ → 30★: lassuló közelítés.** Az elején még érezhetően nő, aztán
  ellaposodik: ez a „szépen lassan tart a 99% felé". A hiányzó kilenc pont
  kétharmada az út feléig megvan, a maradék harmad tényleg a legvégére marad.
* **A 99% plafon, és a maradék egy százalék szándékosan megmarad.** Nincs
  olyan ügynökség, amelyik mellett biztos az üzlet — különben a tárgyalás
  képernyője üres szertartássá válna.

A 66-os kezdőérték nem véletlen: nagyjából ott van, ahol a rendes tárgyalás
egy közepes scouttal áll. A sztár piac tehát **a megszokott eséllyel indul**,
és onnan javul — nem egy külön, eleve kegyesebb csatorna.

### Mi lesz a maradékból

A `p` az esély, hogy a játékos **igent mond** — akár sima, akár prémium áron.
A maradék oszlik meg az „egyelőre nem" (újraküldheted a scoutot) és a
végleges nem között.

**A scout nem esik ki, csak más a dolga.** Azt színezi, hogy az igen
sima-e vagy magasabb árral jár, és hogy a nem után marad-e még egy
próbálkozás. Vagyis a **scout a tárgyalás minőségét** viszi, az **ügynökség a
kimenetelét** — a kettő nem ugyanarra a számra nyom.

A kihívás-zseton (`chDealBoost` / `chDealMalus`) itt is hat, különben a
jutalom épp a legdrágább igazolásoknál volna hatástalan. A felső korlát
99,5%: a 99%-os tető fölé csak egy jutalom emelhet, és az is csak egy
hajszállal.

**A rendes keresésben semmi nem változott.** Ott továbbra is a régi képlet
megy a scout minőségéből; a próba külön állítással méri, hogy a 4★-os és a
20★-os ügynökség között ott egyetlen határ sem mozdul.

### Egy szivárgás, amit a bekötés hozott

A tárgyalás a `TW.searchMode==="star"` jelzőből tudja, hogy sztár piaci
üzletről van szó. A **klub-szemle** viszont (`startClubScouting`) a *meglévő*
`TW`-t használja tovább, ha van — tehát egy sztár piaci keresés **után**
indított klub-szemle is a kedvezőbb eséllyel ment volna, pedig az egy másik
csatorna, ahol a scout dönt. A jelzőt ezért a klub-szemle indulásakor
kifejezetten letöröljük, és a próba állítással is rögzíti ezt.

### Hol látszik

A HUB megerősítő dobozában (a keresés indítása előtt) és a találati lista
fejlécében is ott az aktuális szám, egyetlen forrásból
(`starMarketDealPct()`).

## Próba

`tools/sztar-piac-proba.js` (9063-as port). Huszonöt töréspont a
keresés-létrán, a gap-létra három rögzített pontja és a köztes félcsillagok, a
két kapu külön-külön és együtt, a négy „csak nyáron" eset, a keret teljes
életciklusa, egy **élő keresés** (négy találat, négy különböző poszt, az alap
sáv fölött), és hogy mind a négy módban ugyanaz jön ki.

A gap-létránál külön állítás méri, hogy tényleg **félcsillagonként lép**, nem
folytonosan: 4,2★ és 4,0★ ugyanazt adja, 4,4★ és 4,5★ ugyanazt — de a kettő
nem egyenlő egymással.

A **8. szakasz** az üzletkötés-létrát méri: a kérés három rögzített pontját, a
lineáris szakasz mind a hét fokát, a plafont 30 fölött, a padlót 4 alatt, és
két szerkezeti tulajdonságot — hogy a görbe **monoton** és hogy 10★ fölött a
lépések **egyre kisebbek** (ez a „szépen lassan").

A **8b. szakasz** azt méri, hogy a tárgyalás tényleg ebből a számból dolgozik.
A `land()` egyetlen `Math.random()`-ot használ, tehát a `pick` véletlenjét
kiiktatva és a pörgetést nullázva minden futás **egy előre megadott értékkel**
dől el: a próba a négy kimenetel határai köré lő (4★-nál hat pontot, 20★-nál
hármat), és megnézi, hogy mindegyik a helyére esik-e. Ugyanez a mérés mondja
ki, hogy a **rendes** keresés határai az ügynökség csillagától függetlenül
állnak.
