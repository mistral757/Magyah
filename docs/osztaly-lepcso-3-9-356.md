# 3.9.356 — a felsőbb osztályok együtt nőnek a tiéddel, és a lépcső a nehézségi szinttől függ

> „A d1 szintje lejjebb húzta a BL beszintezését. Ez egyszerűen megoldható
> lenne, ha a saját ligánk fejlődésével a fentebbi ligak szintje is szépen
> tornázná fel magát. És egyébként is az új adatok fényében felül lehetne
> vizsgálni, hogy alap járaton mennyi a minimum elvárt nehézségi szint lépés
> két divízió között játék nehézségi szinttől függően." — a választás: „b)
> verzió".

## Mi volt a baj

* **Idényrajtkor** a horgony az egész világot együtt tolja el, a lépcsők ott
  rendben vannak.
* **Idény közben** a nehézségi rendszer emelései eddig csak a SAJÁT
  osztályodra hatottak:
  * a téli emelés;
  * az idény-gyorsítás;
  * az 5 fordulós követés.
* **A többi osztály csak az alap ütemmel nőtt.** Ezért a bejelentett képen a
  D1 (113,0) és a D2 (109,3) a D3 (118,5) alá csúszott.

## 1. A világ idény közbeni emelése (minden karrierben)

* **`pyrVilagEmeles()`:** a téli emelés, az idény-gyorsítás és a követés
  emelése. A boost-adósság **nincs benne**: az a te boostjaid ára, és csak a
  saját bajnokságodat terheli.
* **A létrán** minden osztály „most” száma ezzel együtt áll. A D1 így nem
  csúszhat a saját osztályod alá.
* **Az osztályozó ellenfele** (a fentebbi liga 14–15. helyezettje, illetve a
  lentebbi 2–3.) is a megemelt szinten jön. Eddig aránytalanul könnyű volt.
  * Közös szobában ez kimarad, mert ott a két gép követése eltérhet.

## 2. A lépcső a fokozat szerint (csak új karrierekben)

| Fokozat | Lépcső két osztály közepe között | Feljutási pótlék |
|---|---|---|
| 1–3. | 3,0 | — |
| 4–6. | 3,5 | 0,5 |
| 7–8. | 4,0 | 1,0 |
| 9–10. | 4,5 | 1,5 |

* **A világ már így épül fel:**
  * a D1 marad;
  * minden lentebbi osztály (osztály − 1) × a többlet értékkel lejjebb kerül;
  * az új, D1 fölött nyíló osztály is ezzel a lépcsővel jön.
* **A feljutási pótlék:** a feljutás utáni **első idényben** a rajt-cél a
  lépcső 3,0 fölötti részével szorosabb.
  * A 3,0-s alap lépcsőt az idényrajti horgony továbbra is kiveszi. A
    nehézség gerince a célrés marad, a feljutás csak a többletet hozza.
  * Kiesés vagy maradás után nincs pótlék.
  * A naplóban külön sor jelzi: „🪜 Feljutási pótlék”.
  * Közös karrierben a célrés-ablak is ezzel számol.
* **A fokozat-választó** minden fokozatnál kiírja a lépcsőt és a pótlékot.
* **A szerződés (`S.pyr.lepcsoV`):**
  * a futó karrierek a maguk szerződésén maradnak, 3,0-s lépcsővel és pótlék
    nélkül;
  * a kezdő lépcső rögzített mezőnyű karrierjei (például „78-as mezőny”)
    szintén kimaradnak, mert ott a mezőny a vállalás.

## A KK mezőnye

A KK (és minden kupa) mezőnye nem a D1-hez mér, hanem a nevezéskori ⚡-odhoz.
A pályán a terv szerint a te ⚡-od +1-et adja. A bejelentett képen a 115-ös
mezőny (a pályán ⚡118,1) egy ⚡117,1-es nevezésből jött ki. Hogy a ⚡-od a
nevezés után mitől nőtt 122,9-re, azt egy mentés vagy feltöltött mérési napló
mondja meg.

## Próba

`tools/osztaly-lepcso-3-9-356-proba.js` (12 állítás):

* a lépcső fokozatonként;
* a 2. és a 8. fokozatú új karrier világának mért lépcsője (~3,0 és ~4,0);
* a világ emelése a boost-adósság nélkül, és a létra többi osztálya vele;
* a feljutási pótlék pontosan 1,0 a 8. fokozaton, maradásnál, kiesésnél és
  régi szerződésben 0;
* a fokozat-választó felirata.
