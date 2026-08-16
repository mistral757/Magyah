# A szurkolói gazdaság — heti bevétel, élő tábor

*(3.3.09. A korábbi működést a `fanBaseSync` / `seasonBudgetParts` fan-ága
adta; ez a dokumentum az azt felváltó rendszert írja le.)*

## 1. Miért változott

A lelátó eddig **évente egyszer** szólt bele a pénzbe: a tábor mérete egy
szorzót adott a nyári keretre, és szezononként egyszer nőtt vagy fogyott egy
százalékos képletből. Két baja volt:

1. **Mindenki ugyanonnan indult** (8 000 fő) — egy megyei klub és egy Premier
   ligás egyformán.
2. **Menet közben semmi nem fűződött hozzá.** Egy győzelem, egy rangadó, egy
   emlékezetes meccs nem mozdított a lelátón, csak az idény végén, közvetve.

A kiadási oldal viszont már heti ritmusú volt: a **játékos-fizetést minden
mérkőzés után levonjuk**. A bevétel és a kiadás két külön ritmuson állt.

## 2. Az induló létszám

**Fele-fele arányban összeadva** két forrásból, a karrier indulásakor egyszer
(`fanCaptureStart`, ugyanabból a két számból, amit a Run-mérő is eltesz):

| liga (nehézségi sáv) | fő | | kezdő nyers csapaterő | fő |
|---|---|---|---|---|
| kis pénz kis foci (≤74) | 1 000 | | 70 alatt | 3 000 |
| mennyei megyei (75-79) | 3 000 | | 70-80 | 7 500 |
| NB II (80-84) | 12 000 | | 81-90 | 15 000 |
| NB I (85-89) | 30 000 | | 91-100 | 30 000 |
| Biszem-baszom másodosztály (90-94) | 50 000 | | 100 fölött | +30 000 / 10 pont |
| Biszem-baszom premier líg (95+) | 150 000 | | | |
| **Infinity** | +150 000 / 10 szint | | | |

Példa: 84-es mezőnyben, 84-es kezdő kerettel `0,5 × 12 000 + 0,5 × 15 000 =
**13 500** fő`.

Régi mentéshez nem nyúlunk: ahol a tábor mérete már él, ott marad — egy futó
gazdaságot visszamenőleg átárazni rosszabb, mint egy kicsit más induló számmal
együtt élni.

## 3. Heti mozgás és heti bevétel

Minden mérkőzés után (`fanMatchTick`, bajnoki és kupa egyaránt) **előbb a
létszám mozdul, aztán a mostani létszám fizet** — a győzelem jutalma már azon a
héten megjelenik.

A mértékek a **saját liga-sávodhoz** mértek, ezért minden szinten ugyanúgy
viselkednek:

| esemény | a sávod | NB II-ben |
|---|---|---|
| győzelem | +0,6% | +72 fő |
| rangadó-győzelem | +1,2% | +144 fő |
| vereség | −0,4% | −48 fő |
| izgalom (30 fölött, 100-ig lineárisan) | +0,8%-ig | +96 főig |

A bevétel: **10 000 Ft / fő / mérkőzés** (`FAN_TICKET`), rajta a legutóbb
lezárt idény élmény-szorzója (0,85-1,30, változatlan képlet). A **nyári keret
ettől külön él**, és már nem tartalmaz szurkolói tételt: az megint tisztán a
klub saját pénze (csapaterő, edzői fizetés, tempó). Minden, ami abból
származtat (kupapénz, kihívás-jutalom, mérföldkő), a klub léptékét követi.

## 4. Trófeák — egy lépcső, két helyen

| helyezés | 1. | 2. | 3. | 4-5. | 6. |
|---|---|---|---|---|---|
| szorzó | 100% | 50% | 24% | 16% | 8% |

* **Bajnokság:** a „100%" a liga-sávod **fele**. NB II-ben tehát a cím +6 000
  fő, a 2. hely +3 000, a 3. +1 440, a 4-5. +960. (A 6. helytől nem jár.)
* **Kupa:** a „100%" a sorozat saját díja — MK 30 000 · KL 70 000 · EL 100 000
  · BL 200 000 —, és ugyanez a lépcső fokozza le a döntőst (2.), az elődöntőst
  (3.), a negyed- és nyolcaddöntőst (4-5.) és a korábbi kiesést (6.).

## 5. A bér — már nem innen hangoljuk

*(3.3.18: ez a szakasz történeti. A `WAGE_SCALE`-t felváltó, bevétel-érzékeny
bérrendszert a `jatekos-berek.md` írja le.)*

A cél akkor is kimondott volt: **a bér a szurkolói bevétel ~50%-át vigye el egy
sikeres idényben, ~90%-át egy sikertelenben.** A `WAGE_SCALE = 0,30` ebből jött,
méréssel (34 mérkőzéses idényekre: sikeres 3 290 pont bevétel → 53,2%,
sikertelen 1 993 pont → 87,8%).

**Amit a mérés mutatott, és amiért az egész át lett írva:** az arány a karrier
során csúszott. A liga-sávok szurkolói alapja lépcsőzetesen ugrik (12 000 →
30 000 → 50 000 → 150 000), a bér viszont csak a Rating exponenciális függvénye
volt — a kettő nem tudott együtt haladni: ugyanezzel a skálával a bér a
szurkolói bevétel ~38%-át vitte NB I-ben, ~13%-át a Premier ligában és ~12%-át
Infinityben. Egy sikeres idény után tehát a bevétel véglegesen elhúzott a
kiadástól.

A megoldás pontosan az lett, amit ez a szakasz „új mechanika, nem hangolás"
címen félretett: **a bér a bevételből számol** (a lelátó fele + a klub-keret
negyede), és a szétosztása a **liga szintjéhez** mér, nem csak a játékos
Ratingjéhez. Rajta két plafon: sikeres idény után a lelátó 50%-a, siker nélkül
125%-a. Részletek: `jatekos-berek.md`.

A **Bérmérő** ehhez kapott új oszlopot: szezononként külön látszik a teljes
bevétel, abból a lelátóé, a bér, és a `bér/lelátó` arány — ez a mércéje.

## 6. Kihívás-tétek

A szurkoló-tétek a heti gazdasághoz igazodtak: jutalomként **5-25 ezer**
(korábban 2-4 ezer), büntetésként **3-17 ezer** (korábban 1-3 ezer) — a
büntetés tudatosan kisebb marad a párjánál. A „növeld a táborodat N fővel"
kihívás célszáma mostantól a **liga-sávodhoz skálázódik** (horgony az NB II):
egy fix 10 000 fő a megyei szinten teljesíthetetlen, a Premier ligában egyetlen
jó hónap volna.

## 7. Nyitott kérdés

A ≤74-es sáv („kis pénz kis foci") értéke **1 000 fő** — ezt nem a bejelentés
adta, hanem a sor alá extrapoláltam a 3 000-es megyei szintből. Ha más a
szándék, egyetlen szám a `FAN_LEAGUE_TIERS` tetején.
