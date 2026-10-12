# 3.9.224 — ⚡ A meccserő a pályára lépő tizenegyről szól

> „Az miért van, hogy 7 meccsből alig volt olyan, amit nyertem annak
> ellenére, hogy mindig én vagyok az erősebb, és többször 3-4 egységgel?
> Valamit még tudnom kellene?” — PvP-társ, 1 győzelem, 3 döntetlen és
> 3 vereség (0:4, 0:2, 2:0, 1:1, 2:2, 2:2, 2:3).

## 1. Mérés: a motor ma

`tools/meccsmotor/szoras-valos.js` a valódi meccsláncon fut. A kért
⚡-különbséget a kezdőrúgáskor állítja be, és a meccsek fele hazai, fele
idegen.

| ⚡ különbség | normál bajnoki (n=300) | rangadó (n=200) |
|---|---|---|
| 0 | 49 / 22 / 30 | 51 / 23 / 27 |
| +3 | **78 / 12 / 10** | 66 / 19 / 16 |
| +4 | **80 / 14 / 6** | 77 / 14 / 10 |

A táblázat a győzelem / döntetlen / vereség százalékát mutatja.

A motor ugyanúgy viselkedik, mint a 3.9.220-as mérésben. Valódi +3–4-es
fölénnyel 7 meccsből legfeljebb 1 győzelem kb. **0,06%** eséllyel jön ki.
Ezért a kérdés az lett, hogy **valóban +3–4 volt-e a különbség**.

## 2. Mérés: a kiírt ⚡ és a motor különbsége

Az új mérő a `tools/meccsmotor/kijelzes-valos.js`. Nem tolja el az erőt:
valódi bajnoki meccseket játszik, és mindegyiken feljegyzi két számot:

* **a kiírt ⚡-párt:** az eredményjelzőn álló számokat;
* **a motor tényleges különbségét:** a két gólvárhatóságból visszaszámolva,
  tehát a védekező skill, a stílus- és a talizmán-szorzók is benne vannak,
  a pálya nélkül.

**Az eredmény (a javítás előtt):**

* A meccsek többségén a két szám egyezik (|Δ| ≤ 0,2).
* Ha egy kezdő **sérült vagy eltiltott** volt, a motor **1,5–2,5**
  meccserővel gyengébb csapattal játszott, mint amit a ⚡ mutatott. Két
  hiányzónál ez **4+** volt.
  * Például: kiírva **+0,8**, a motorban **−3,6**.
  * Például: kiírva **+2,4**, a motorban **0,1**.

**Az ok:**

* A ⚡ (`teamMatchStrength`) a `teamStrength()`-ből számolt. Ez a
  **felállást** méri, a hiányzó emberrel együtt.
* A motor (`buildMatchSnapshot`) viszont a **pótlásával** lép pályára.
* A csapaterő-sáv (`teamStrengthNow`) ezt 3.7.42 óta tudta, a ⚡ nem.

## 3. A javítás

* **A ⚡ a pályára lépő tizenegyet méri** (`teamStrengthMatch`):
  * meccs közben az élő tizenegyet;
  * meccs előtt, ha van hiányzó a kezdőben, a pótlási réteg
    **próba-felépítésével**. A valódi `S.subs` érintetlen marad.
  * Hiányzó nélkül a szám betűre a régi.
* **A rejtett tagok is a pályára lépőkről szólnak** (`matchSlotsView`):
  * az aura-skill és a védekező skill a pótlásé;
  * a hiányzó kapitány rutin-bónusza nem jár, mint a motorban.
* **A tartalék-háló választása determinisztikus** (`findSubPick`): üres
  padnál a pótlást eddig véletlenül sorsolta. Mostantól a hiányzó nevéből,
  az idényből és a fordulóból választ, így a meccs előtti ⚡ és a
  kezdőrúgás biztosan ugyanazt az embert látja.

**Utána** (3 × 60 valódi meccs): a hiányzós meccseken a kiírt és a motor
szerinti különbség átlaga **−0,04…+0,04**, a legnagyobb eltérés **0,36**.

## Amit a játékosnak érdemes tudnia

* A ⚡ mostantól a hiányzók nélküli, valódi tizenegyet mutatja. Ha egy kezdő
  sérült vagy eltiltott, a szám a meccs előtt már lejjebb áll.
* A csapaterő-sáv „N kényszercserével” sora ezt eddig is kiírta, a ⚡ nem.
* A 7 meccses sorozatban a 4 piros lap és a 2 sérülés (az idény-összegzés
  szerint) pont ilyen meccseket termelt.

## Próba

* `tools/meccsero-hianyzo-proba.js`: 6 állítás.
* A mérő: `RESET=1 N=60 BOOST=3 node tools/meccsmotor/kijelzes-valos.js`.
