# 3.9.154 — Talizmánok F6b: Igazolás, Fejlődés, Stáb speciálok

> „F6b mehet!"

A speciál-katalógus második kötege: a három „gazdasági” kategória
maradék 24 speciálja él. Minden speciál a meglévő motorokba köt be, saját
meccsmotor-ág nincs. A pro és a kontra együtt hat, amíg a lap a
gyűjteményben van (nincs elégetve). Talizmán nélkül minden olvasó semleges
értéket ad.

## A „morál-jel” kontrák valódi ára

A játékos melletti smiley eddig csak kijelzés volt, így egy rajta ülő kontra
semmibe sem került volna. Mostantól a jel két helyen hat:

* **a smiley-n** — látszik, kit érint;
* **a csapatmorál célértékén** — a kezdő 11 érintettjeinek összege,
  0,4-es súllyal (`TAL_JEL_SULY`). Öt érintett kezdő, egyenként −1 jellel:
  a cél −2.

Ez a jel négy kontrában szerepel: Ifjú titánok, Hűségprémium,
Versenyszellem, Fókuszcsoport.

## 🤝 Igazolás

| speciál | pro | kontra |
|---|---|---|
| Keményfejű alkusz | az elutasítások kúp-tolása +50% | elutasításonként −2 csapatmorál |
| Kapcsolati háló | nyaranta +1 képesség-keresés és +1 Sztár-piac futás | a szezonkeret −3% |
| Zsákbamacska | ablakonként egy vak vétel −40%, a POT az aláírásig rejtve | az akadémia idényenként −1 ajánlat |
| Hűségprémium | a 3+ idénye nálad lévők kikiáltási ára +10% | az új igazolások első 10 meccsén −1 morál-jel |
| Villámzár | a piacra tett játékos első ajánlata 3–8 fordulón belül | eladás után 3 meccsig −1 pp illeszkedés |
| Ingyen ember | idényenként egy ingyen igazolás-token (nem halmozódik) | a stíluspont-szerzés −10% |
| Utolsó perces bomba | ablakzáráskor 30% eséllyel sztár-ajánlat −30%-kal | −3 csapatmorál, ha aláírod |
| Visszavásárlási záradék | az eladott játékos két idényen belül az eladási ár 80%-áért visszavehető | minden eladás −5% |

**Megjegyzések:**

* **Zsákbamacska.** A felderítés utolsó jelöltje jön zsákban. Az aláíráskor
  a napló kiírja a POT-ját. A Ködoszlató sem nézhet bele.
* **Utolsó perces bomba és Visszavásárlás.** A Talizmánok menüben állnak,
  soronként egy gombbal.
  * A bomba-ajánlat a következő ablakzárásig él. Nyáron az idény
    kezdőrúgása zárja az ablakot.
  * Visszavásárolni csak nyitott átigazolási időszakban lehet.
  * Tele keretnél vagy kevés büdzsénél a napló mondja meg, mi hiányzik.
* **A klubnál töltött idő.** Az érkezés bélyege (`_klubSz`) mostantól a
  `markArrived`-ban születik. Régi mentésnél a lejátszott meccsekből
  becsüljük: 30 meccs ≈ 1 idény.

## 🌱 Fejlődés

| speciál | pro | kontra |
|---|---|---|
| Ifjú titánok | a 21 alattiak fejlődése +10% | a 30 felettiek −1 morál-jel |
| Késői virágzás | a 28 felettiek hanyatlása −20% | az akadémia idényenként −1 ajánlat |
| Specialista | a fő edzés +15% | a begyakorlás −6% |
| Kemény edzés | minden edzés +20% | a sérülés-esély +10% |
| Vattába csomagolva | a sérülés-esély −15% | −1 pp taktika-illeszkedés |
| Csodagyerek | idényenként a legfiatalabb kezdő POT-ja +10% | a 23 alattiak vételára +10% |
| Második tavasz | idényenként egy 30 feletti játékos Ratingje +3 | a stáb Szakértelme −1 idényenként |
| Versenyszellem | posztonként a két legjobb (5 Ratingen belül) fejlődése +12% | a padon ülő rivális −1 morál-jel |

**Megjegyzések:**

* **Késői virágzás.** A Rating egész szám, a hanyatlás pedig gyakran csak
  1-2 pont, így a v%-os megtakarítás egyenként mindig visszakerekedne. Ezért
  a töredék gyűlik (`_kesoiC`): hosszú távon pontosan v%-kal kisebb a
  hanyatlás. A próbában tíz idény alatt a 14 pontos hanyatlásból 12 lett.
* **Második tavasz.** A kiválasztott a legmagasabb Ratingű 30 feletti
  játékos.

## 🎓 Stáb

| speciál | pro | kontra |
|---|---|---|
| Bővített stáb | +1 stábhely (a plafon is 6 → 7) | stáb-kiadás +12% |
| Mentorlánc | edzővé válás 30 évesen és 1400 perc után (32 és 2000 helyett) | a 30 felettiek vételára +5% |
| Lojális stáb | a stábtagok 3 évvel később öregszenek ki | a scout-fejlesztés +10% |
| Tapasztalatcsere | a stáb Szakértelme idényenként +1-gyel többet nő | edzőváltás után 30 meccsig −10% begyakorlás |
| Fókuszcsoport | a játékos-fókusz 2 → 3 fő | a fókuszon kívüliek −0,5 morál-jel |
| Pályaedző-legenda | minden stábtag egy fokozattal feljebb a hatásban | stáb-kiadás +25% |
| A nagy öreg | idényenként a legidősebb stábtag egy képessége a kiosztási sorba | a 72 alatti taktikák begyakorlása −10% |
| Nemzetközi konferencia | idényenként egy stábtag +3 Szakértelem | a heti lelátó 60%-a idényenként |

**Megjegyzések:**

* **Stáb-kiadás.** Ez a stábpiaci ár, a stábhely ára és az edzői ajánlat
  ára.
* **Lojális stáb.** „Nem távozhat büntetésből”: a játékban jelenleg nincs
  büntetés, ami stábtagot visz el, ezért ez a fél most nem aktiválódik.
* **Lojális stáb kontrája.** Csak a scout-fejlesztés árára ül. Az
  ügynökség ára nem változik.
* **Fókuszcsoport kontrája.** Csak akkor van „kívülálló”, ha legalább egy
  stábtag játékos-fókusszal dolgozik.
* **Pályaedző-legenda.** A hatásban a következő fokozat alsó határával
  számol, a csúcson nincs feljebb.

## Próba

`tools/talizman-f6b-proba.js` (port 9193, 27 állítás). A
`talizman-f6a-proba.js` „a többi még nem él” állítása mostantól a maradék
négy kategóriára szól.
