# 3.9.153 — egyensúly: D0, nyári kupa, árazás, csapategyensúly; poszt-tudás és színhűség

A hosszú lista harmadik köre. A négy egyensúly-tétel közül kettőnek (D0 és
nyári kupa) közös gyökere volt: olyan számhoz mértük a mezőnyt, ami nem az,
amivel a motor a pályán számol.

## ⛰ D0 nehézség: a meccs-erő végre a motor tükre

> „Nem jó a nehézség belövés D0-tól kezdve. Én 180-as meccs erőn vagyok.
> Nekik 178-ason kellene lenniük szerintem nyers erővel… az első D0
> szezonon 30-0 lett."

**A mérés.** A szuperliga-kalibráció a kezdőrúgáskor a vállalt résre állítja
a mezőnyt. Kiegyenlítettről indulva ez +2, tehát az elv jó volt. A mérce, a
meccs-erő (`teamMatchStrength` = nyers + `hiddenMatchBonus`), viszont
kihagyott négy dolgot, amivel a motor (`buildMatchSnapshot` → `matchLambdas`)
ténylegesen számol:

| kimaradt tag | hol hat a motorban | egy kiépült karrierben |
|---|---|---|
| csapategyensúly-bónusz | a pillanatkép `ovr`-jében | +2, kitolt plafonnal +4 |
| stílus-képességek csapaterő-tagja (A gépezet, Nincs gyenge láncszem, Kettős veszély…) | `styleOvrBonus` | stílusonként +3…+5 |
| stílus- és ultra-gólszorzók, az alakzat ára | `ownGoalMult` / `oppGoalMult` / `defMult` | ~+1…+2 |
| párkémia és taktika-stílus λ-szorzói, a gólvágó család | `matchLambdas` | ~+1 |

Együtt ez 5-15 pont. A kalibráció ennyivel gyengébb mezőnyt állított be, és a
pályán a +2-es rajtból +12 lett. 0,09-es K mellett ez meccsenként kb.
két és félszeres gólvárhatóság-arány — innen jött a 30-0.

**A javítás.** A `hiddenMatchBonus` most mind a négy tagot tartalmazza:

* az egyensúly-bónusz és a stílus csapaterő-tagja egy az egyben kerül bele;
* a λ-szorzók `ln(m)/K` értékkel, fél súllyal jönnek be. Ugyanezen a mércén
  számoltak eddig is a védekező skillek és a talizmán Meccs-tengelyei.

**Ami kimarad szándékosan:**

* feltételes szorzó: a gyors kontra csak akkor hat, ha gyengébb vagy;
* véletlen tagok: a pszichó család és a napi forma.

**Következmény.** A kijelzett meccs-erőd nagyobb lesz, mint eddig. Ez nem
erősödés: most látszik először, mennyit ér valójában a stílusod és az
egyensúlyod. A mezőny is ehhez mér:

* a szuperligákban a vállalt rés mostantól a pályán is igaz;
* a piramis lentebbi osztályaiban a mezőny a rejtett bónusz felét kapja, és
  ez a fél most az új tagokat is tartalmazza.

**PvP.** A párharc két ⚡-je ugyanabból a képletből számol
(`snapMatchStrength`). A 3.9.149 óta ez `ovr + taktika` volt, amiből a
védekező skillek, a talizmán és a gólszorzók kimaradtak. Régi kliens
pillanatképénél a hiányzó mezők semlegesek, így a szám a régi.

## 🟠 Nyári kupa: a mezőny a meccs-erődhöz mér

> „Nyári kupa nehézségi szintjét hangolni, ott még nem működik jól."

**A hiba** ugyanaz volt, amit a többi kupánál a 3.9.126 már kijavított:

* a mezőny a NYERS csapaterő −1-re állt;
* a meccsen viszont a rejtett bónuszod felét is megkapta.

A pályán így a rés `1 + rejtett/2` lett: a karrier elején 3, egy kiépült
keretnél 16 pont.

**Mostantól** a névleges átlag `nevezési meccs-erő − 1 − rejtett/2`, tehát a
pályán a csapatok a meccs-erőd mínusz eggyel lépnek ki. A felajánló ablak is
ezt mondja ki.

**Közös tornán:**

* a nevezés viszi a meccs-erőt (`ms`) és a rejtett bónuszt (`hb`);
* a közös mezőny a kettőtök közül a nehezebb célértéket kapja;
* régi kliensnél a régi szabály marad.

## 💰 A játékosár kevésbé POT-alapú, az ifi POT-ja felzárkózik

> „Legyen kevésbé POT alapú a játékosok ára. Pl. 143as 18 éves 11000 POT
> 9Mrd gyors eladás. 144es 31 év, 43000 POT 120Mrd gyors eladás... És
> jobban kell igazítani az ifisek POT értékeit az aktuális átlag POThoz az ő
> ratingjukon..."

**A mérés.** A 31 éves játékos 43 000-es POT-ja pontosan az, amit a 144-es
Rating jelent (`peakToPot(144)` ≈ 45 900). A hiba a másik oldalon ült: a 18
éves játékos 11 000-es POT-ja egy 107-es csúcsnak felelne meg.

* A saját nevelésű ifi Ratingje évekig nőtt, a POT-ja viszont a születésekor
  rögzült.
* Az ár a csillag-felár fölött nagyjából POT^2,35-tel nő, ez a lemaradást
  huszonnégyszeresére nagyította.

**Az ár mozgatója** mostantól a POT és a mostani Rating által jelentett POT
súlyozott mértani közepe (`valueDriverPot`):

* Ha a POT a Rating ALATT áll: fiatalnál (≤23) a Rating árazza, idősebbnél
  félig.
* Ha a POT a Rating FÖLÖTT áll:
  * a fiatal tehetséget a POT-ja árazza, mert az ígéret az érték;
  * a kifutott (≥27) játékost félig a mostani Ratingje;
  * a kettő között lineáris az átmenet.

**Mérve** (a próbában):

| játékos | régi ár | új ár |
|---|---|---|
| a bejelentett 18 éves 143-as | 30 450 | 814 486 |
| a bejelentett 31 éves 144-es | 384 588 | 415 143 |
| egy 20 éves, 74-es, 2600-as POT-ú tehetség | 4 090 | 4 090 |
| egy 30 éves, 80-as, 1700-as POT-ú | 1 248 | 1 141 |

A 18 éves 143-as tehát most kétszer annyit ér, mint a 31 éves 144-es. A korai
karrier árai alig mozdulnak.

**A POT felzárkózása** (`youthPotAlign`) a szezonváltáskor fut:

* a saját fiatal (≤23) játékos POT-ja legalább annyi lesz, amennyit a mostani
  Ratingje jelent;
* a csúcsához (peak) nem nyúl, tehát nem ad ajándék-fejlődést;
* a scout-becslés a befagyasztott arányával mozdul;
* az idényzáró összefoglaló kiírja, kinél történt.

Az ár azonnal az új szabály szerint számol. A POT-szám maga a következő
szezonváltáskor igazodik.

## ⚖️ Csapategyensúly: a plafon a kerettel nő

> „Csapategyensúlyért kapható meccserő bónusz scalelődjön 100as nyers
> csapaterő fölött 10esével (nyers csapaterő) 1 teljes meccserőnyit
> emelkedjen a max elérhető meccserő boost"

`balanceMaxOvr`: a +2-es plafonra 100-as nyers csapaterő fölött minden teljes
10 pont +1-et tesz (110 → +3, 150 → +7, 180 → +10).

* A mérce a felállás nyers ereje (`teamStrength`), nem a meccs-erő, különben
  a bónusz önmagát emelné.
* A kitolt plafon („Nincs plafon” képesség) erre szoroz rá.
* A HUB panel és a súgó kiírja az új plafont.

## ☯️ Béke és harmónia: poszt-tudás

> „Béke és harmónia: minél több ismert pozícióval rendelkező játékosokért
> stíluspont. Olcsóbb és gyorsabb a pozíció tanulás - erre legyen képessége
> a béke és harmóniának"

**Három új mérföldkő-család.** Mind a keret pos-listáiból, állapotból számol:

* `hm_versN`: hány ember tud legalább 3 posztot (1/2/3/5/7/10);
* `hm_posMax`: a legsokoldalúbb ember hány posztot tud (4/5/6/8/11).
  * A 11-es fokozat a „mindenes”.
  * Infinityben ez a lépcső nem nyúlik tovább, mert nincs 12. poszt.
* `hm_posSum`: a keret összes megtanult posztja (10/15/20/30/40/55).

**Új I. sávos képesség: Sokoldalú képzés.**

| szint | poszt-tanulás ára | meccsigény |
|---|---|---|
| I. | −25% | −20% |
| II. | −40% | −33% |
| III. | −55% | −50% |

* A fizetés nélküli beszokás ugyanennyivel gyorsul.
* A már FUTÓ tanulásra is azonnal hat (`posLearnNeededNow`).
* A kártya élőben kiírja a mostani meccsigényt és a sokoldalúak számát.

## 🔗 Talizmán: színhűség (kategória-stack)

> „Egy kategóriában összegyűjt X db talizmán, az is adjon stack jutalmat,
> erősítést"

**A szorzó.** Egy kategóriában 3 / 5 / 8 (nem elégetett) talizmán a
kategória teljes alaphatás-összegét ×1,10 / ×1,20 / ×1,35-tel szorozza.

* A szorzó a plafon előtt hat, így egy szín sem szállhat el.
* A Meccs-tengelyeknél a ±8%-os λ-plafon is áll.
* A lépcsős változatokat (Mozgalmas piac, Jellemhullám, Hitelkeret) nem
  érinti, mert azok a ritkasággal nőnek.

**A méretezés.** 8 talizmánnál a csökkenő hozam 4,52 E-t hagy a 8-ból, a
×1,35 ezt 6,1-re emeli. Ez még mindig kevesebb a lineáris 8-nál, tehát a
szétterített pakli sem értéktelenedik el.

**Ahol látszik:**

* az új fokozat bejelenti magát a naplóban;
* a Talizmánok menü jelmagyarázatában 🔗◆ jelvény áll;
* az aktív alaphatások közt külön sor mutatja, mennyi hiányzik a következő
  fokozatig.

## Próba

`tools/egyensuly-3-9-153-proba.js` (port 9191) — lásd `tools/README.md`.
