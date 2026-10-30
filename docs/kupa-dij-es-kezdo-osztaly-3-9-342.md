# 💰 Kupa-díj fordulónként · 🏟 kezdő osztály a PvP gyors indításon (3.9.342)

## 1. 🏟 A kezdő osztály a gyors indításon

> „PvP indítás után ezen a képernyőn kellene, hogy legyen egy legördülő
> menü, amivel ki tudom választani, melyik divízióban akarom majd kezdeni a
> game-et."

**Mi volt eddig.** Közös karrierben a kezdő osztályt csak a régi, részletes
beállító csúszkáján lehetett állítani. A gyors indítás úgy ment ki a
szobába, hogy ehhez senki nem nyúlt, vagyis a D5-ös alapértékkel.

**Mi van most.** A gyors indítás **2 · Egyéb** lapján, közös karrierben és a
ligapiramisban, egy **🏟 Kezdő osztály** legördülő áll:

* D1–D6, mindegyik a Run-plafonjával;
* ugyanazt a szoba-mezőt állítja, mint a részletes csúszka, és a csúszka is
  követi;
* a fokozat rajt-rését az új osztályra számolja újra.

**Kié a választás.** A házigazdáé: a beállítás-csomag viszi a szobába.

* Közös bajnokságban ez a közös osztály.
* Saját bajnokságban mindketten ebből az osztályból indultok, mindenki a
  saját világában.

Egyjátékosban és dinamikus módban nincs: ott a draft végi osztályválasztó
dönt.

## 2. 💰 Kupa-díj fordulónként

> „EL-be estem ki a BL selejtezőn. Azt megnyertem. Kaptam 70 Mrd-ot. A
> társam bejutott BL-be, negyeddöntőben kiesett, alig kapott valamicskét.
> Ezt balancolni kell."

**Mi volt eddig.** Csak a győzelem, a döntő és az elődöntő fizetett, a piac
tetejéhez mérve:

* KK 0,75 · OJK 0,5 · KONF 0,25;
* az ezüstérem a győztes díjának fele, az elődöntő a negyede.

A KK negyeddöntő így **0**-t ért, az OJK megnyerése a piac tetejének a
**felét**.

**Mi van most.** A díj = a sorozat súlya × az elért kör aránya. A győzelem
aránya 1.

| sorozat | súly |
|---|---|
| HSZ | 1,00 |
| KK (BL) | 0,75 |
| OJK (EL) | 0,28 |
| KONF (KL) | 0,12 |
| FA | 0,12 |
| MK | 0,10 |
| Nyári felkészülési kupa | 0 |

| elért kör | európai | hazai (MK, FA) | HSZ |
|---|---|---|---|
| csoport / ligaszakasz | 0,12 | — | 0,10 |
| főtábla (32) | — | 0 | — |
| rájátszás | — | — | 0,18 |
| nyolcaddöntő | 0,25 | 0,10 | 0,30 |
| negyeddöntő | 0,42 | 0,20 | 0,45 |
| elődöntő | 0,58 | 0,35 | 0,60 |
| döntő (ezüst) | 0,76 | 0,60 | 0,78 |
| győzelem | 1 | 1 | 1 |

**A bejelentett két eset, a piac tetejéhez mérve:**

| eset | eddig | most |
|---|---|---|
| OJK megnyerése | 0,5 | **0,28** |
| KK negyeddöntő | 0 | **0,315** |

A KK negyeddöntő tehát valamivel többet ér, mint az OJK megnyerése, a valódi
európai díjazás logikája szerint.

**További következmények:**

* A KK csoportköre ≈0,09-et ér, ez az OJK negyeddöntőjével rokon.
* A selejtezőben kiesés nem fizet, és a felkészülési kupa sem.
* Minden sorozatban egy későbbi kör sosem ér kevesebbet.
* A sorozatok sorrendje áll: HSZ > KK > OJK > KONF.

**A hatás a gazdaságra:**

* A KK-ban menetelők többet kapnak, mert a korai körök is fizetnek.
* Az alsóbb kupák győztesei kevesebbet: OJK 0,5 → 0,28, KONF 0,25 → 0,12,
  FA 0,175 → 0,12, MK 0,125 → 0,1.

A súlyok egy táblában vannak (`CUP_PRIZE_W`, `CUP_PRIZE_GORBE`), egy helyen
hangolhatók.

## Próbák

* `tools/kezdo-osztaly-3-9-342-proba.js` (6 állítás);
* `tools/kupa-dij-3-9-342-proba.js` (8 állítás), benne a valódi kupa-zárás
  is;
* a 14 meglévő kupa-próba zöld.
