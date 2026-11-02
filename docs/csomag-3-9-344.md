# 3.9.344 — első licites határidő · meccsenkénti rivális-strigula · erősebb talizmán-fúzió

## 🧹 „Szabadulj meg tőle": a határidő az első licit

> „Szabadulj meg tőle kihívásnál is legyen az első licitig a határidő, ne 7-8 meccsig."

**Mi volt eddig.** A kihívás (`tensionOut`) 7–8 meccses határidővel futott.
Az eladás viszont nem rajtad múlik: ha ezalatt egyetlen ajánlat sem jött,
a kihívás elbukott.

**Mi van most.** Ugyanúgy működik, mint a „leggyengébb láncszem" eladós
kihívás (`deadlineKind:"firstBid"`, 3.9.94 óta):

* nincs meccs-határideje, az idő múlása nem viszi el;
* az **első** ajánlatot el kell fogadnod — ha visszautasítod, vagy várakozó
  licittel leveszed a piacról, a kihívás elbukik (`chSaleRefused`);
* a játékost ingyen elengedni is teljesíti.

A szabály-szöveg ezt ki is mondja.

## ⚔️ „Győzz le N rivális erejű ellenfelet": strigula minden meccs után

> „A győzz le rivális ellenfeleket mérése hibás. A határidő lejárta idején
> lévő meccserőnket vetíti vissza. Minden egyes meccs után azonnal be kell
> húzni a strigulát, ha az egy érvényes rivális elleni győzelem volt."

**A hiba.** A számláló az idény összes győzelmét minden alkalommal a
**mostani** keret-erővel (`teamOVRbase()`) mérte újra. Ha a kereted közben
erősödött, a rivális-küszöb (saját erő − 2) feljebb ment,
és a korábban rivális ellen aratott győzelmek utólag kiestek. A határidőnél
így kevesebb strigula maradt, mint amennyit meccsről meccsre láttál.

**Mi van most.**

* A lefújás után, a meccs rekordjának rögzítésekor (`S.fixtureResults`)
  eldől, hogy az ellenfél **azon a meccsen** rivális erejű volt-e. Ez a
  `rival` jelző a rekordban marad.
* A számláló ezt a jelzőt nézi. A már meglévő strigula később sem tűnik el,
  és a keret gyengülésével sem lesz utólag skalp egy korábbi győzelemből.
* A régi mentések jelző nélküli rekordjainál marad a korábbi becslés.
* A kupás változat (`cupScalps`) eddig is a meccskori két erőt rögzítette,
  ezért nem kellett hozzányúlni.
* A felajánlás előtti fedezet-ellenőrzés és az élő mondat továbbra is a
  mostani erővel számolja a **hátralévő** jelölteket. Ez helyes: a jövőbeli
  meccseken a mostani erőd a legjobb becslés.

## 🧬 A talizmán-fúzió legalább annyit ér, mint a két lap külön

> „Talizmán összeolvasztás eredménye érzésem szerint sokszor egy gyengébb
> hatás, mintha mindkettőt megőriztem volna külön."

**Igazad volt.** Egy kategórián belül az alaphatás csökkenő hozammal gyűlik
(0,85^k). Két külön lap így = a nagyobbik E + 0,85 × a kisebbik E. A fúzió
viszont csak eggyel emelte a ritkaságot:

| Pár | Két külön lap (alap-E) | Fúzió eddig | Fúzió most |
|---|---|---|---|
| átlagos + átlagos | 1,85 | 1,7 (ritka) | 1,85 |
| ritka + ritka | 3,15 | 2,7 (nagyon ritka) | 3,15 |
| nagyon ritka + nagyon ritka | 5,0 | 4,2 (legendás) | 5,0 |
| legendás + átlagos (első gyűjtés) | 5,05 | **4,2 — semmit nem adott** | 5,05 |
| legendás + legendás | 7,8 | 6,0 (Mítosz) | 7,8 |
| átlagos + nagyon ritka | 3,55 | 4,2 (legendás) | 4,2 (nincs pótlék) |

(Közepes dobással. A fúzió a jobbik dobást viszi tovább.)

Ráadásul a beolvasztott lap kiesett a kategória darabszámából. Ez gyengítette
a színhűség-szorzót (3/5/8 lap), a rezonanciát (5) és a Mesterlapot (7).

A special két példánya külön sem adódik össze: mindig a legmagasabb
ritkaságú hat. Ezen az oldalon a fúzió eddig is nyert.

**Mi van most.**

* **Fúzió-pótlék.** Ha a ritkaság-ugrás kevesebbet ad, mint a két lap
  külön, a hiányt egy pótlék (`fE`) tölti ki a lapon. A lap sávja mellett
  ez „+x 🧬"-ként látszik.
* **Darabszám.** Az összeolvasztott lap 1 + a fúziók számának megfelelő lapnak
  számít a színhűségben, a rezonanciában és a Mesterlapnál. Ha a fúzió új
  fokozatot nyit, a napló ki is mondja.
* **Garancia a gombon.** A húzás-ablak gombja mostantól ezt írja:
  „legalább annyit ér, mint a kettő külön".
* **Régi fúziók.** A már összeolvasztott lapok a darabszámban azonnal
  visszakapják a beolvasztott lapot. A pótlékot visszamenőleg nem lehet
  kiszámolni, mert a beolvasztott lap dobását a mentés nem őrizte meg.

## Próbák

* Új: `tools/rivalis-strigula-3-9-344-proba.js`, `tools/talizman-fuzio-3-9-344-proba.js`.
* Bővült: `tools/eladas-kihivas-proba.js` (1b szakasz: tensionOut).
