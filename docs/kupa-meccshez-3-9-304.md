# ⚽ Kupameccs: „Irány a meccs" — a bajnoki meccsnézet a kupában is (3.9.304)

## A kérés

> „Jelenlegi verzióban a kupa meccsek között nem tudunk indítani edzői
> elemzést csak akkor ha bemegyünk a menübe […] a kupa meccseknél nem az kéne
> hogy a kupa menüből lehet közvetlenül indítani a meccset hanem a kupa
> menüből egy olyan gomb lenne hogy irány a meccshez és aztán ott megint
> jöjjön az a képernyő ami a bajnokság közben is és ott lehet nyomni a
> felkészülés a meccsre gombot meg ott lehet nyomni egy edzői elemzést vagy a
> kihívások megtekintését satöbbi"

## Ami változott

1. **A kupa-képernyő gombja** „Kezdőrúgás” helyett **„⚽ Irány a meccs →”**.
   Meccset nem indít, hanem a bajnoki **meccsnézetet** nyitja meg (pálya +
   közvetítés). Itt ugyanazok a gombok vannak, mint a bajnokin:
   * 🧠 Edzői elemzés (a kupameccsre szól);
   * 🗣️ Öltöző, 🎯 Kihívások, 📅 Menetrend.
2. **A kezdőrúgás két lépésben**, mint a bajnokin:
   * előbb **🔍 Felkészülés — Csoportkör · 1/6. forduló**: az eredményjelző
     előnézete és az eligazítás (ellenfél, pálya, erőviszonyok);
   * utána **⚽ Kezdőrúgás**: a kupameccs indul.
3. **🏆 Vissza a kupa-táblához:** innen vissza lehet lépni a kupa-képernyőre,
   meccs nélkül.
4. **Ami rejtve van:** a meccsnézetben a „Szezon végigjátszása” gomb, mert a
   kupában nincs értelme. A kezdőrúgás után visszajön.

## Ami nem változott

* **A kupa-párharc** (a társad ellen) felkészülés nélkül indul, mint a
  bajnoki párharc.
* **A szezon végigjátszása** és a **„meccsről meccsre” lánc** egyenesen
  indítja a kupameccset, mert ott senki nem nézi a felkészülést.
* **A hiányzó-panel** a kezdőrúgáskor ugyanúgy feljön, ha kell.

## Próba

`tools/kupa-meccshez-3-9-304-proba.js`:

* **„Irány a meccs”:**
  * meccs nem indul, a meccsnézet nyílik;
  * a végigjátszás rejtve;
  * a vissza-gomb és az edzői elemzés látszik;
* **felkészülés → kezdőrúgás;**
* **az elemzés a kupameccsre szól;**
* **vissza a kupa-táblához;**
* **a végigjátszás és a lánc egyenesen indít;**
* **nincs oldalhiba.**
