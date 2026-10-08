# 3.9.222 — 🎚 Tízfokozatú, kétoldalú nehézség (piramis) és átállás

> „Szerintem legyünk többfokozatúak. Javaslatom: 1. homokozó, 2. kezdő,
> 3. simaliba, 4. haladó, 5. nehéz, 6. professzionális, 7. mesteri,
> 8. legendás, 9. gyilkos, 10. semmi esély — legyenek lenyithatók, ahol
> részletezi, hogy ez milyen settings. 2. Jó lesz a holtsáv. 3. A dinamikust
> hagyjuk egyelőre. 4. Legyen a futón: átállok legyen ==> itt is lehessen
> lenyitni, melyik mit jelent settings szinten."

Előzmény: a terv és a mérések (`docs/nehezsegi-rendszer-terv.md`). A
döntések szerint ez **csak a piramis-karriert** érinti. A dinamikus mód nem
változott.

## A tíz fokozat

A fokozat egy **célrés**: ennyi meccserővel legyél **az idény átlagában** a
mezőny fölött (mínusznál alatta). A kimenetek az idény-szimulációból
(`tools/nehezseg/idenysim.js`, a valódi motorhoz kalibrálva) valók. Ezek a
**tesztelendő sávok**: a mérő adatai fogják hangolni őket.

| # | Fokozat | Célrés | Feljutás / idény | Cím / idény | Kiesés / idény |
|---|---|---|---|---|---|
| 1 | 🏖️ Homokozó | +6 | ~100% | 97% | — |
| 2 | 🌱 Kezdő | +4,5 | 98% | 88% | — |
| 3 | 🙂 Simaliba | +3,5 | 95% | 74% | — |
| 4 | ⚖️ **Haladó** (ajánlott) | **+2,5** | **81%** | **51%** | — |
| 5 | 🥊 Nehéz | +1,5 | 57% | 27% | — |
| 6 | 🎯 Professzionális | +0,75 | 35% | 13% | — |
| 7 | 🧠 Mesteri | 0 | 16% | 5% | — |
| 8 | 👑 Legendás | −1 | 3% | 1% | 2% |
| 9 | 🔥 Gyilkos | −2 | ~0% | ~0% | 13% |
| 10 | 💀 Semmi esély | −3 | ~0% | ~0% | 35% |

**Minden fokozat lenyitható** („Mit jelent? — a beállítások”). A lenyitott
sor ugyanazt mondja mindhárom helyen: a beállítón, a nyári
fokozatválasztón és az átállásnál.

* 🎯 a célrés;
* 📊 a várható feljutás, cím és kiesés;
* 🏁 **a rajt:** mennyi a rés a kezdőrúgáskor, és miért. Ez a várható
  idényen belüli mozgás: az első idényben a modell becsli, utána a karriered
  saját mérése;
* ⬆️ mi történik, ha elhúzol;
* ⬇️ mi történik, ha lemaradsz (az alsó fék, az osztályod éves ütemével);
* 🧱 a holtsáv;
* 🔁 az idényenkénti szabály;
* 🏆 a Run-plafon szorzója;
* 🔒 zárt foknál a nyitás feltétele.

## A szabályozó (`S.pyr.padlo = 2`)

1. **Rajt:** a mezőny a kezdőrúgáskor a **rajt-célra** áll:

   ```
   rajt-cél = célrés − (várható idényen belüli rés-változás) / 2
   ```

   * **A változás tanul.** Az idény végén rögzül (`dg` = záró rés − rajt-rés
     + téli emelés), és a következő rajt-cél a legutóbbi két idény átlagát
     használja.
   * **Az első idényben a mért modell becsli:** a saját sodródás 5,6 + 0,8 ×
     rés, mínusz a mezőny éves üteme az adott osztályban és tempón.
2. **Felül:** ha a rajtkor a rés a rajt-cél fölött van, a mezőny felnő hozzá
   (a 3.9.210-es padló). **Télen a célrés +0,5** fölötti rész a mezőnyé,
   nem a rajt-cél fölötti: az idény közepén a rés épp az idényátlag körül
   jár.
3. **Alul (az új): az alsó fék.** Ha a rajtkor a rés **több mint 1,5-tel** a
   rajt-cél alatt van, a mezőny abban az idényben kevesebbet nő:
   * legfeljebb a holtsáv széléig fékez, és legfeljebb **egy éves ütemnyit**
     (a világ megvár, de nem gyengül);
   * a napló kimondja: „🎚 Alsó fék.”
4. **A holtsáv (1,5) a munkáé.** A rajt-cél és alatta 1,5 között a mezőny a
   saját ütemével nő. A vásárlás, a boost, a taktika és az összhang dönti el,
   hol állsz benne.

**Közös karrierben** ugyanez fut a két meccserő és a két rajt-cél átlagából,
mindkét gépen ugyanúgy (a kézfogás számaiból, véletlen nélkül). Az alsó fék is.

## Idényenként

Ugyanaz a szerződés, mint a vállalásnál:

* **könnyíteni** bármikor lehet, legfeljebb **kettővel** a karrier eleji fokozatnál
  könnyebbig;
* **nehezíteni** egy fokkal lehet, **sikeres idény** (bajnoki cím vagy
  feljutás) után.

Nyáron a HUB gombja a következő idény fokozatát mutatja. A képernyőn mind a
tíz fok látszik, lenyithatóan; a határon kívüliek lakattal és okkal.

## Az új karrier — a beállító 2. lépése

* **A tíz fokozat az elsődleges választó.** A fok kiválasztása a régi létrát a
  fokozat rajt-céljára állítja (az osztályhoz és a mezőny tempójához
  számolva).
* **A régi létra megmaradt** lenyitható „⚙️ Finomhangolás” blokként. Ha valaki
  csúszkával állít, a célrés a rajtból számolódik, a legközelebbi fok
  jelölve.
* **A zárt fokok lakatot kapnak:** a mínuszos sáv nyitási kapuja ugyanaz,
  mint eddig.
* **A 🎛️ Karrier-alapbeállítások** új mezője a **Nehézségi fokozat**. A
  következő karrier ezzel indul, és a gyors indítás is ezt viszi.
* **Közös karrierben** a szoba csomagja `padlo:2`. A régi házigazda szobája
  (`padlo:1`/`true`) a régi, egyoldalú padlót viszi mindkét gépen.

## Átállás futó karrierben

A HUB-on az **„🎚 Átállok a tízfokozatú nehézségre”** gomb jelenik meg, ha
mind igaz:

* egyjátékos piramis-karrier;
* még nem a kétoldalú szabályon fut;
* **két idény között** vagyunk (a lezárt idény után, a kezdőrúgás előtt). A
  futó idény így egészében a régi szabállyal megy végig.

A képernyő:

* **kimondja, mi változik:**
  * a fokozat és a célrés;
  * a kétoldalú követés;
  * hogy a következő kezdőrúgástól él;
  * hogy végleges;
* **a tíz fok itt is lenyitható**, a mostani nehézség a legközelebbi fokként
  jelölve;
* **„Mégsem”:** nem változik semmi.

Az átállás után a karrier eleji fokozat a választott, és a határok innen
számolnak. A korábbi idények nem számítanak bele.

## A mérő

* **Beállítás-blokk:** `padlo`, `nf`, `cel`.
* **Idényenként (`padlo`):**
  * `nf`, `celres`;
  * `fek` (mennyit fogott vissza az alsó fék);
  * `resVeg` (záró rés), `dg` (a mért idényen belüli változás);
  * `dgBecsles` (amivel a rajt-cél számolt).

Ebből idényenként összevethető a célrés és a valódi idényátlag (a
meccsenkénti `ms − oMs`-ből). Ez a hangolás alapja: a célrések, a holtsáv
és a sodródás-becslés.

## A Run

* A „Mezőny-emelés” sor **levonja az alsó féket**, és az összeg előjeles.
* A plafon nehézség-tényezője a rajt-célok átlagából jön (ugyanaz a
  mechanika, mint a vállalásoknál).

## Próba

`tools/nehezseg-3-9-222-proba.js` — 43 állítás (részletek a `tools/README.md`-ben).
