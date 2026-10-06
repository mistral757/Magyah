# 3.9.212 — 📈 A POT nem esik vissza 200 000-re

> „Ezt korábban is felfedeztem, hogy boosttal nem lehet 200k fölé vinni a
> POTot, de hogy vissza is ugrik ha boostolod, azt nem gondoltam. Javítsuk."

## A hiba

Egy 400 fölötti Ratingű ifi, akinek a POT-ja eleve 200 000 fölött állt,
egy POT-ot adó ajándék után **200 000-en** maradt: a Ratingje nőtt, a
POT-ja visszaesett.

## Az ok: egy rögzített plafon egy mozgó mezőnyben

A POT kemény plafonja egy fix szám volt: **200 000**. A POT ↔ csúcs görbén
(`peakToPot`) ez nagyjából egy **212-es csúcsnak** felel meg.

Egy 400-as mezőnyben viszont az akadémia **magától is egymillió fölötti
POT-tal** adja a tehetségeket. Ott a „kemény” plafon már semmit nem
korlátozott, csak kárt okozott:

* **A boost POT-ajándéka elnyelődött.** Aki 200 000 fölött állt, annak a
  boost 0 POT-ot adott. (Ez a „boosttal nem lehet 200k fölé vinni”.)
* **Három helyen le is vágta a POT-ot.** Ezeknél a képlet `min(plafon, …)`
  volt, a „sosem lejjebb” padló nélkül:
  * a kihívás-jutalom **„+N POT egy játékosra”** ága (itt még a 9000-es
    lágy plafon is élt: egy 9500-as felnőttet 9000-re vágott);
  * a 🌠 **Csodagyerek** talizmán: szezonváltáskor a legfiatalabb kezdőd
    POT-ja +v%, vagyis épp egy ifit talál el;
  * az ∞ **Infinity nyitó ×1,5-e**.

Mérve, a javítás előtti kódon: mindhárom 900 000 / 500 000 / 250 000 →
**200 000**; a HUB ifi-boostja egy 900 000-es ifin +0 POT.

## A javítás

**1. A kemény plafon a mezőnnyel nő.**

```
plafon = max(200 000, peakToPot(mezőny + 100))
```

| Mezőny | Plafon |
|---|---|
| ≤ 111 | 200 000 (a régi érték) |
| 150 | ~352 000 |
| 250 | ~1 013 000 |
| 400 | ~2 873 000 |

A karrier eleje és a 100 alatti játék tehát nem változik. A 9000-es lágy
plafon (a nem-ifi felnőttek piaci pályája) is marad.

**2. Ajándék sosem vesz el, mindenhol.** Mindhárom vágó ág a többi boost
szabályát kapta: a mostani érték a padló, a plafon csak fölfelé fog.

* A kihívás-jutalom POT-ja mostantól ugyanaz az ajándék, mint a boostoké.
  Csak a kemény plafon fogja, a lágy nem.
* A Csodagyerek és az Infinity ×1,5 is legfeljebb a plafonig emel, lefelé
  nem visz.

**3. Az ifi POT-jának felzárkózása** (3.9.153, szezonváltáskor) magas
mezőnyben a Ratingje szerinti valódi POT-ig megy, nem 200 000-ig. Ez
ugyanaz a szint, amit a piaci játékosok már eddig is kaptak.

## A próba

`tools/pot-plafon-3-9-212-proba.js` — **20 állítás**, valódi böngészőben.

* a plafon skálája;
* a három régi vágó ág (a javítás előtti kódon mind elbukik);
* minden boost-fajta egy plafon fölött álló játékoson;
* a felhasználó útja a felületen át: HUB ifi-boost panel → megerősítés →
  a POT nő, a Rating is nő, a visszajelzés a valódi számot írja;
* az ifi POT-jának felzárkózása.
