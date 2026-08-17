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

## 5. A bér újrahangolása — méréssel

A cél kimondott: **a bér a szurkolói bevétel ~50%-át vigye el egy sikeres
idényben, ~90%-át egy sikertelenben.** A `WAGE_SCALE` ebből jött, nem
becslésből — a játék saját képleteivel (`fanMatchDelta`, `playerMatchWage`)
végigszámolt 34 mérkőzéses idényekből:

| idény | bevétel | skála 0,30 mellett |
|---|---|---|
| sikeres (20 GY / 6 D / 4 V, 2 rangadó-győzelem, 40-es izgalom, ×1,30) | 3 290 pont | **53,2%** |
| sikertelen (8/8/14, 28-as izgalom, ×0,85) | 1 993 pont | **87,8%** |

A két végponthoz külön-külön 0,282 és 0,308 tartozna; a **0,30 mindkettőt
eltalálja**. (Korábbi érték: 0,5.)

**Amit a mérés még mutat, és amit tudni kell:** az arány a karrier során
csúszik. A liga-sávok szurkolói alapja lépcsőzetesen ugrik (12 000 → 30 000 →
50 000 → 150 000), a bér viszont a Rating exponenciális függvénye — a kettő nem
tud együtt haladni. Ugyanezzel a skálával a bér a szurkolói bevétel ~38%-át
viszi NB I-ben, ~13%-át a Premier ligában, ~12%-át Infinityben (sikeres
idényben). Ha ezt is egyenletessé akarjuk tenni, a bérnek a **liga szintjét**
is követnie kellene, nem csak a játékos Ratingjét — az viszont már új
mechanika, nem hangolás.

A **Bérmérő** ehhez kapott új oszlopot: szezononként külön látszik a teljes
bevétel, abból a lelátóé, a bér, és a `bér/lelátó` arány — ez a hangolás
mércéje.

## 5b. A bér a lelátóhoz kötve (3.3.18)

Az 5. szakasz hangolása egyetlen konstanssal (`WAGE_SCALE`) próbálta elérni,
hogy a bér a szurkolói bevétel ~50%-át vigye. **Nem sikerülhetett**, és a mérés
maga mondta ki, miért: a tábor a liga-sávokkal *lépcsőzetesen* ugrik, a bér
viszont a Rating *exponenciális* függvénye — a kettő nem tud együtt haladni. A
gyakorlatban a bér a lelátó bevételének ~38%-át vitte NB I-ben, ~13%-át a
Premier ligában és ~12%-át Infinityben. Egy sikeres idény után a bevétel durván
elhúzott a kiadástól: a klub gazdagodott, a pénznek pedig nem volt hova
folynia.

**A megoldás nem újabb hangolás, hanem új csatornák: a kiadás mostantól
közvetlenül a bevételre érzékeny.**

### Három új tétel a bérszámfejtésben

| # | Tétel | Mérték | Mihez kötött |
|---|---|---|---|
| 1 | **Top sztár-felár** | fejenként a meccsenkénti szurkolói bevétel **1/12-e**, legfeljebb 3 emberre | a lelátóhoz |
| 2 | **Siker-béremelés** | megnyert trófeánként a meccsenkénti szurkolói bevétel **1/9-e** | a lelátóhoz |
| 3 | **Menedzseri fizetés** | `1 + S.salaryMod` szorzó az alapbéren | a saját fizetésedhez |

**1. Top sztár-felár.** Egy klub 1-3 emberét extrán meg kell fizetni, és a felár
nem a Ratingből jön, hanem a **lelátóból**. Aki a pályára lép közülük, azért
fizetsz — a sztár pihentetése tényleg olcsóbb hét, pontosan úgy, ahogy az
alapbér is a játékidőhöz kötött.

Top sztár az, akire **bármelyik** igaz (`wageTopStars`):

* a Ratingje **százalékban** kiemelkedik a *játszó keret* (kezdő 11 + cserepad)
  átlagából — legalább **+10%**;
* a **termése** — gól + gólpassz + bravúr mérkőzésenként — a keret átlagának
  **kétszerese** (legalább 5 lejátszott meccs után, hogy ne zaj legyen); így a
  kapus bravúrjai és a védő gólpasszai is számítanak;
* a **szezonkártyája Gyilkos vagy magasabb**.

A rangsor a Rating, és **legfeljebb hárman** kerülnek be. A mérce szándékosan a
játszó keret, nem a teljes állomány: a tartalék és az akadémia beleszámítva
lehúzná az átlagot, és onnantól az első csapat fele „kiemelkedne".

**2. Siker-béremelés.** A bajnoki cím és a kupagyőzelmek (**kizárólag** a
győzelmek — a második hely és az elődöntő nem) új szurkolókat hoztak; ennek az
ára, hogy az öltöző is kéri a részét. Trófeánként a meccsenkénti szurkolói
bevétel 1/9-e épül be a bérbázisba — vagyis a béremelés **pontosan azzal a
bevétellel skálázódik, amit a siker termelt**.

### A két kemény határ

A rendszernek nem szabad se elszállnia, se megfojtania azt, aki jól teljesít:

* **Amíg sikeres vagy**, a bér **nem haladhatja meg a szurkolói bevétel felét**.
  Sikeres az a klub, amelyiknél a legutóbb lezárt idényben **bármelyik** igaz:
  top 3 bajnoki helyezés · elődöntő (top 4) egy **európai** sorozatban · a
  **magyar kupa** megnyerése. Ez garancia: a sikeres klub sosem megy tönkre a
  saját béreitől.
* **Ha egyik sem teljesül**, elengedjük a számok kezét: a bér ilyenkor
  túlterhelheti a rendszert, egészen a szurkolói bevétel **125%-áig**.

A második pont nem *felnyomja* a bért, hanem *leveszi róla a féket*: a valódi
költség látszik. Aki csak egy jó idényt futott, ott a nyers számok úgyis a
plafon alatt vannak — aki viszont hosszú éveken át halmozta a trófeákat, annak
a bérbázisa akkor is ott marad, amikor az eredmények elmaradnak. **Ez a rendszer
foga:** a siker felépít egy bérterhet, és a hanyatlás azzal együtt jön.

### Mérve

Valósághű kereten (kezdő 11: 78-92, cserepad 74-80, 30 000 fős tábor,
34 mérkőzéses idény):

| helyzet | szurkolói bevétel | bér | arány |
|---|--:|--:|--:|
| bajnokként (1 trófea) | 6 120 | 3 060 | **50%** — plafonon |
| 11. helyen (1 trófea) | 4 896 | 2 750 | 56% |
| 3 trófeával, sikeresen | 6 426 | 3 213 | **50%** — plafonon |
| 8 trófea után bukó idény (Premier líg) | — | — | **113%** |
| Infinity-keret kis táborral | — | — | **125%** — plafonon |

A régi, tisztán Rating-alapú bér ugyanezeken a pontokon 12-38% között mozgott.

### Visszafelé kompatibilitás

Ahol nincs szurkolótábor (régi mentés, még nem futott `fanCaptureStart`), a
`wageFanRef()` nullát ad, és **a régi, tiszta alapbér él tovább, plafon
nélkül** — se felár, se béremelés, se határ. Egy futó gazdaságot nem árazunk át
visszamenőleg.

A `WAGE_SCALE` és a Bérmérő **változatlan**: az alapbér képlete nem mozdult, és
a mérő `bér/lelátó` oszlopa most is a hangolás mércéje — csak mostantól a
plafonok is látszanak rajta.

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
