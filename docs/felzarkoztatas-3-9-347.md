# 3.9.347 — felzárkóztatás a párharc után (könnyed mód)

> „Minden párharc után, könnyed módban, legyen felajánlva az alacsonyabb
> szinten járó csapatnak, hogy felzárkóztatást kérhessen. Ára: Run szint
> pontok. Módja, sima boostok, 1 teljes Run szint 10 sima boost, azaz 0.1 Run
> színtért lehet venni 1 sima boostot ilyenkor."

## Ki kapja

Az, akinek a párharcban kisebb volt a **⚡ meccs-ereje**.

* A két szám a közös pillanatképből jön (`DUEL.myMatch`, `DUEL.oppMatch`).
  Ugyanezekkel a számokkal ment le a meccs, és a két gép ugyanezt látja.
  Ezért mindig pontosan az egyik fél kap ajánlatot.
* Ha a két ⚡ tizedre kerekítve egyenlő, egyikük sem kap ajánlatot.
* Ajánlatot ad:
  * a saját bajnokság mind a négy párharc-napja;
  * a közös bajnokság könnyed szobájának párharca.
* Nem ad ajánlatot:
  * hardcore szoba;
  * kupa-párharc;
  * osztályozó.

## Mit ad, mennyiért

* **1 sima boost = 0,1 Run-pont**, vagyis 1 teljes Run-szint 10 boostot ér.
* **Legfeljebb annyit vehetsz, amennyi Run-pontod van.** 13,9-es Run-nál ez
  139 boost.
* **A boostok ingyen-zsetonként érkeznek a Boost-központba.** Ott a sima
  boost ára 0, és a szokásos módon választod ki, kire mennek, egyenként vagy
  a kosárral.
* **A Run levonása a kész Run-számból történik**, a plafon és a hangolás
  után. Így pontosan annyit visz, amennyit a felület ígér. A Run-bontásban
  saját sora van: „Felzárkóztatás — −X Run-pont · N sima boost”.
* Saját bajnokságban a Run-idények összevetése (a párharc-lap) a csökkent
  Run-nal számol. Ez az ár része.

## Meddig él

**A következő bajnoki meccsig.** A 30. forduló utáni párharc ajánlata a
nyáron át, a következő idény első bajnokijáig él.

## Hol

* **A naplóban:** a párharc után egy sor jelzi az ajánlatot.
* **A HUB-on, a Run-mérő alatt:** egy kártya „🆙 Felzárkóztatást kérek”
  gombbal. A gomb csúszkás ablakot nyit, ahol megadod, hány boostot veszel.

## Megjegyzés

A bajnoki meccseken a boost-adósság szabálya él: a kezdőrúgás utáni boost
kezdő tizenegyre eső nyereségének fele a saját mezőnyödhöz kerül. A párharcban
a boost teljes egészében számít, ott nincs adósság.

## Próba

`tools/felzarkoztatas-3-9-347-proba.js` (16 állítás):

* ki kapja;
* a vásárlás;
* a plafon;
* a Run-bontás sora;
* a valódi levonás;
* a HUB-kártya és a csúszkás ablak;
* a lejárat egy valódi bajnoki után.
