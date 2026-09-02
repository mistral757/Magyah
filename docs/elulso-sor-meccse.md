# ⚽ Az elülső sor meccse — lövések, kidolgozás, pontrúgás, passzjáték

*(3.9.04. Az érintett kód mind az `index.html` egyetlen script-blokkjában: az
`OURCH_*` konstansok, a `noteAtk` / `atkPick` / `ourChance` a `playMatch`
belsejében, a `mstatCompute` passz-szétosztása, és a `mstatPlayerHtml`
címkesora.)*

## 0. Egy mondatban

A hátsó sornak 3.8.20 óta van meccse; mostantól az elülsőnek is — de az
**értékelésükhöz nem nyúl**.

---

## 1. Miért

A 3.8.20 óta minden ellenfél-helyzet kibomlik: van gazdája és van mondata
(bravúr, blokk, gólvonal-mentés, tisztázás). A védőké és a kapusé így valódi
mérkőzéssé vált.

Elöl nem történt meg ugyanez. Aki nem lőtt gólt és nem adott gólpasszt, az
**néma maradt egy egész mérkőzésen** — pedig tizenegyszer tört kapura és
háromszor tálalt ziccert. A statisztikában is csak egy csapatszintű „kapura
lövés" szám állt, gazda nélkül.

---

## 2. A modell — pontosan az `oppChance` tükörképe

```
helyzet / mérkőzés  =  OURCH_BASE + lf · OURCH_RATE          (lf = a MI gólvárhatóságunk)
```

…és a kimenetel egy arány-lépcsőn dől el:

| arány | mi történik | kié a stat |
|---|---|---|
| `OURCH_ON` 0,26 | kapura lövés, a kapusuk védi | lövő |
| `OURCH_WIDE` 0,22 | fölé, mellé, kapufa | lövő |
| `OURCH_KEY` 0,16 | helyzetkidolgozás — ziccert tálal, de nincs befejezés | kidolgozó |
| `OURCH_BLOCK` 0,14 | a védőjük blokkolja | lövő |
| `OURCH_SET` 0,12 | pontrúgás: szöglet vagy szabadrúgás | elvégző |
| a maradék | elakadt támadás, rossz utolsó passz | senkié |

A lövő a **gólsúlyokkal** (`GOALW`), a kidolgozó és a pontrúgó a
**gólpassz-súlyokkal** (`ASSTW`) sorsolódik — ugyanazokkal, amikkel a gól és a
gólpassz embere. Így a „ki lő sokat" ugyanazt a csapatképet rajzolja, mint a
góllövőlista, nem egy másikat.

> **A GÓLOKAT EZ NEM ÉRINTI.** Azokat továbbra is a Poisson dönti el. Ez a
> szakasz kizárólag a gólon KÍVÜLI támadásokat bontja ki — pontosan úgy, ahogy
> az `oppChance` a gólon kívüli ellenfél-helyzeteket.

### Mennyi hangzik el

`OURCH_LOUD` = 0,42. Elöl sokkal több esemény van, mint hátul, és egy mérkőzés
naplója nem állhat harminc lövés-sorból. **A statisztika mindet viszi, a napló
a javát** — ugyanaz az elv, mint a rutinvédés `OPPCH_LOUD_SAVE`-jénél, csak
erősebben.

---

## 3. A statisztika oszlopai nem mondhatnak ellent egymásnak

Ez a rendszer legfontosabb fegyelme, és a 3.8.20 óta él: ha a napló kimondott
egy eseményt, a táblázatnak ugyanazt kell mutatnia.

Ezért **négy oszlop lett mértté** (a becslő ág tartalék marad annak a
mérkőzésnek, amit nem a tick játszott le — például egy régi mentésnek):

| oszlop | eddig | mostantól |
|---|---|---|
| a mi kapura lövésünk | Poisson-becslés | a tickben elhangzott lövések összege |
| az ellenfél kapusának védései | Poisson-becslés | ugyanaz (= kapura lövés − gól) |
| az ellenfél blokkjai | a mi gólvárhatóságunkból becsülve | a tickben blokkolt lövéseink |
| az ellenfél tisztázásai | ugyanígy becsülve | az elvégzett pontrúgásaink |

Enélkül a napló és a táblázat két külön számot mondana ugyanarról — ez a
legrosszabb fajta hiba, mert **mindkettő hihetőnek látszik**.

---

## 4. A passzjáték stabilitása — ez nem esemény, hanem arány

A kérés szó szerint azt kérte, hogy látszódjon, „mennyire stabil a
passzjáték". Ez nem egy pillanat, hanem egy **arány**, ezért nem a tickből jön,
hanem a csapat két kész számából (`passes`, `acc`) osztjuk szét:

* a **passzok száma** a poszt (hátul-középen több labda megy át) és a játékidő
  szerint oszlik — ez a labdaérintés, nem az érdem;
* a **pontosság** az emberé: a csapatátlag körül mozdul el a saját
  Passz-attribútuma szerint, a **keret átlagához mérten**.

Így a posztidegen helyen játszó, gyenge passzolójú ember alacsonyabb
százalékot kap, a rendező középpályás magasabbat — pontosan az, amit a
„stabil-e a passzjátéka" kérdés jelent.

A játékos sorának végén jelenik meg (`34 passz · 87,2% pontos`), a tettek
MÖGÖTT: a gól és a bravúr az esemény, ez a háttérmunka mérője.

---

## 5. Amiért ez NEM ad jobb osztályzatot

Ez a kérés kimondott feltétele volt: *„nekik nem kell hogy ez feljebb húzza az
értékelést, náluk így is stabil."* A `mstatRate` ezért **egyetlen új tételt sem
olvas** — se lövést, se kidolgozást, se pontrúgást, se passz-mérleget.

És van mögötte szerkezeti ok is, nem csak a kérés:

A hátsó sor tételei **azért** pontoznak, mert a védő és a kapus osztályzatának
nem volt más fogódzója, mint a kapott gól — a bravúr és a blokk adta vissza
nekik a saját meccsüket. **Elöl ez a probléma nem áll fenn:** ott a gól (1,6) és
a gólpassz (0,7) már megfizeti az eredményt, a rendszer-illeszkedés pedig a
munkát.

Ha a lövés is fizetne, a **sokat lövő, keveset betaláló** csatár kapna magasabb
jegyet, mint a két lövésből kettőt bevágó — ami pont a fordítottja annak, amit
egy értékelés mondani akar.

> Ezek a számok **megmutatják** a munkát, nem **megfizetik**.

---

## 6. Hova kerülnek

* **A naplóba** — a mérkőzés közben, névvel.
* **A meccs-statisztika játékos-sorába**: `5 lövés (2 kapura) · 2
  helyzetkidolgozás · 3 pontrúgás · 41 passz · 88,1% pontos`.
* **A karrier-statisztikába** (`careerStats`): `sh` (lövés), `son` (kapura),
  `kp` (helyzetkidolgozás), `spt` (elvégzett pontrúgás) — vagyis szezonokon át
  gyűlik.

---

## 7. Hangoló számok, egy helyen

`OURCH_BASE` 2,2 · `OURCH_RATE` 2,6 · `OURCH_ON` 0,26 · `OURCH_WIDE` 0,22 ·
`OURCH_KEY` 0,16 · `OURCH_BLOCK` 0,14 · `OURCH_SET` 0,12 · `OURCH_LOUD` 0,42.

A `BASE` a védekező oldal 2,4-énél szándékosan kisebb: a **saját** kapunk elé
mindig kerül némi forgalom (az ellenfél is támad), a mi támadásaink viszont
jobban függnek attól, milyen a csapat. A `RATE` viszont ugyanaz — a
gólvárhatóság ugyanolyan meredeken hozza a helyzeteket mindkét oldalon.

**Egy jövőbeli támadó hangsúly-csúszka** kódmódosítás nélkül bekapcsolható: az
`ourChance` már most átengedi a bontást a `dialMul("chance", {kind})`
csatornán. Ma egyetlen csúszka sem nevezi meg ezeket a fajtákat, tehát 1-et ad.

---

## 8. …és a hátsó soron: a bravúr-kihívás újraszabása

Ugyanennek az érmének a másik oldala, ezért itt a helye.

**A panasz:** *„a bravúros kihívások (amik egész szezon alatt kérnek 12
védést kb) 3 meccs alatt finisben vannak."*

Igaza volt, és **két** oka volt.

**1. A cél kézzel volt beírva.** A régi sávok (rövid 2-3, hosszú 7-10) egy
**3.8.20 ELŐTTI** mérésen álltak, amikor a bravúr még ritka flavor-esemény
volt („300 szimulált szezonon mérve a termés ~7,8/szezon" — a régi komment
maga őrizte meg ezt). A védekezési rendszer átszabása óta a helyzet-modell
nagyságrenddel többet termel.

**2. A számláló mást mért, mint amit a szöveg mondott.** A kihívás mindig
„bravúrt" kért, a `challengeRawValue` viszont a **teljes** `S.seasonSaves`-ből
olvasott — amiben a rutinból megfogott lövés is benne van. A négyféle
védésből három látványos (bravúr, ziccer-hárítás, kivédett tizenegyes), a
negyedik nem — és mérve a rutinvédés a termés **több mint fele**.

### A javítás nem egy új szám

A bravúr **bekerült a szimulátorba** (`chSimOne`, `svBig` mező), oda, ahol a
győzelem, a pont és a tiszta lap célja is születik. A modell szó szerint a
mérkőzésé:

```
helyzet/meccs = OPPCH_BASE + la·OPPCH_RATE     ·     ebből látványos: OPPCH_SOLO + OPPCH_BIG
```

Onnantól a cél **a csapat saját erejéhez kalibrálódik** — és ha a motor
konstansai újra változnak, a cél magától követi. Mérve (400 szimulált szezon,
mediánok):

| erőviszony | kapott gól / 30 forduló | **bravúr / 30 forduló** | bravúr / 8 forduló |
|---|---|---|---|
| jóval gyengébbek (gap −6) | 66 | 62 | 16 |
| kiegyenlített (gap 0) | 38 | **44** | 11 |
| jóval erősebbek (gap +6) | 22 | 33 | 9 |

Egy betonvédelemnek tehát **kevesebb** bravúr jut — mert kevesebb helyzetet
enged —, és a kihívás célja ezt már tudja.

A `S.seasonSaveBig` a látványos védések saját vödre (a `noteSave` tölti);
`S.seasonSaves` érintetlen marad, mert azon áll a szezonkártya, az Aranykesztyű
és a Statzone.

> **Amit a szimuláció nem tud:** a kivédett tizenegyest (ritka, saját útvonal)
> és a hangsúly-csúszka jövőbeli állását. Mindkettő **fölfelé** torzítja a
> valós termést, tehát a cél inkább könnyű, mint teljesíthetetlen — ebben a
> sorrendben szeretjük a tévedést.
