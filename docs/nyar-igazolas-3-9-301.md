# 🌞 Igazolás a teljes nyáron, licit a nyári kupák közben (3.9.301)

## A kérés

> „Egész nyári időszakban végig, bármelyik meccsek között lehessen igazolni.
> A valóságban is így van. A tieidre is jöhetnek licitek."

## Miért nem lehetett eddig

**Az időrend.** A nyári kupasorozat (európai kupa, hazai kupa, Nyári
Felkészülési Kupa) a bajnokság **lezárása után** fut. Ekkor a szezon már
zárva van (`S.seasonClosed`), és a nyári keretek is feltöltődtek.

**A gond a kupa-képernyő „⚙️ Ugrás a HUB-ba” gombjával volt.**

* A szezon közbeni HUB-módot nyitja (`hubMidSeasonMode`).
* Az átigazolás kapuja (`twClosedNow`) ezt zártnak vette.
* A kupák közben így egyetlen átigazolási művelet sem volt elérhető, csak a
  kupa után, a nyár végén.

**A licitek.** A kirakatba tett játékosra a licit várakozása a bajnoki
fordulószámlálón ketyeg (`saleCareerRound`), az pedig az egész nyár alatt áll.
A kupák alatt ezért nem jött ajánlat. A 3.9.224 csak a nyár **végére**
garantált egyet.

## A javítás

1. **A kapu:** a nyári kupa közben (lezárt idény, a 30. forduló után, aktív
   kupa) az átigazolás nyitva, bármelyik két kupameccs között
   (`nyariKupaMost`). Ez minden átigazolási műveletre vonatkozik, mert
   mindegyik ugyanezt a kaput kérdezi:
   * vásárlás, klub-szemle, képesség-keresés, átigazolási esemény;
   * a scout listája és licitje;
   * a stáb-piac;
   * a kirakat.

   A nyári keretek nem töltődnek újra: a szezonzáráskor már megkaptad őket, a
   kupa a nyár része.
2. **A licitek:**
   * Minden lejátszott nyári kupameccs **2 fordulónyit** léptet a kirakatban
     álló játékosaid licit-várakozásán (`nyarMeccsUtan`).
   * A ketyegő azonnal kiadja, ami esedékes.
   * A naplóban a szokott „📬 Ajánlat érkezett” sor jelenik meg, a döntés az
     Átigazolás menüben.
   * A nyár végi garancia (3.9.224) változatlan.
3. **A HUB fő gombja** a kupából nyitva „← Vissza a kupához”.

**Futó szezonban** minden a régi: a 8., 15. és 23. forduló utáni ablakon kívül
zárva.

## Próba

`tools/nyar-igazolas-3-9-301-proba.js`:

* **a kapu:**
  * futó szezonban zárva;
  * a nyári kupa közben nyitva (vásárlás, kirakat, scout-licit);
  * a sima nyári HUB-ban nyitva;
* **a licit:**
  * a kupameccsek alatt jön;
  * meccsenként 2 forduló;
  * kupán kívül a horog nem léptet;
* **a horog helye** és a gomb felirata;
* **nincs oldalhiba.**
