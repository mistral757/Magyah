# 3.9.262 — Kupa-mezőny, tiszta lap, korábbi mezőny-gyorsulás

## 1. A kupák mezőnye: nyári kupa + fix sorozat-eltolás

> „Nem jól működik a mezőny nehézség belövés a kupasorozatoknál. A nyári kupa
> úgy számol, hogy gyakorlatilag mindenképp szoros a mezőny, mindegy mennyire
> vagy túlnőve saját mezőnyödön. Ezt kéne alapul venni, és a különböző kupák
> nehézségi szintje szerint tovább pontosítani. Emlékeim szerint ezt már
> egyszer be akartam vezetni."

### Előzmény

Be volt vezetve, a 3.9.175-ben: „nyári kupa bázis + sorozatsáv”. A bázis
akkor is a nyári kupáé volt. A sávon belüli helyet viszont az döntötte el,
mennyivel erősebb vagy gyengébb a bajnokságod (a KK-nál a D1) nálad. Ez volt
a hiba.

### Miért nem működött

Aki túlnőtt a mezőnyén, márpedig a kupába jutók jellemzően ilyenek, annál
minden sorozatban a sáv **alja** jött. A KK így −2-vel **könnyebb** lett, mint
a nyári kupa.

A bejelentett esetben a D1 147 volt, a ti meccs-erőtök 170 fölött. A +7,8-as
különbség így állt össze:

| tétel | érték |
|---|---|
| nyári kupa | +1 |
| sáv alja | +2 |
| a tartós forma, amit a mérés nem látott | ≈ +4,8 |

### Mostantól

* **A bázis betűre a nyári kupáé**: nevezési meccs-erő −1, a rejtett előny
  motor által ráadott felét levonva. A kupánál a mérés a **tartós formát** is
  látja. A kupa a szezonzáró állapoton fagy, a forma végig veled van, és a
  motor is a forma-ráadással számol.
* **Fix sorozat-eltolás**, a bajnokság erejétől függetlenül:

  | | MK | FA | KONF | OJK | KK |
  |---|---|---|---|---|---|
  | a nyári kupa bázisához | −1 | 0 | 0 | +1 | +2 |
  | a pályán a te ⚡-odhoz | −2 | −1 | −1 | 0 | +1 |

* **A közös (PvP) kupa** ugyanezt a szabályt kapja.
* **A nyári kupa saját képlete változatlan.**
* **A svájci rendszerű (HSZ) sorozat** saját szabálya marad.
* **A kiírás** a nyári kupa mércéjét és a sorozat-eltolást mondja.

## 2. Tiszta lap a kupa fordulópontjain

> „A kupasorozatok kezdete előtt törlődjenek a lapok, eltiltások. A
> kupasorozaton belül pedig, a csoportkörről a kieséses szakaszra váltva,
> valamint a döntő előtt szintén törlődjenek a lapok."

**Mikor törlődik** (`cupLapTorles`):

* a sorozat indulásakor, a KK-ból való lecsúszáskor is;
* a csoportkör (ligaszakasz) végén, a kieséses szakasz vagy a rájátszás előtt;
* a döntő előtt.

**Mi törlődik:**

* a kupa sárga-számlálója;
* a lapos **eltiltások**.

A **sérülés marad**. A köztes körváltásoknál (nyolcad → negyed, rájátszás →
nyolcad) nincs törlés. A napló kiírja, mi törlődött.

## 3. A mezőny idény közbeni gyorsulása a fokozattal korábban indul

> „A nehézségi szintek előrehaladásával egyre korábbra kerüljön […] amikor
> fokozatosan elkezdünk pluszban rátenni az ellenfelek szezon közbeni
> fejlődésének tempójára."

A kezdő idény eddig fix 4. volt (3.9.254). Mostantól a fokozattól függ:

| fokozat | 1–4. | 5–6. | 7–8. | 9–10. |
|---|---|---|---|---|
| kezdő idény | 4. (a régi) | 3. | 2. | 1. |

**A görbe változatlan**: a mért többlet 30%-a. A korai idények ezért a görbe
alacsony pontjáról indulnak:

| idény | 1. | 2. | 3. | 4. |
|---|---|---|---|---|
| gyorsulás | +0,68 (csak a 9–10. fokozaton) | +1,35 | +2,7 | +4,05 |

A ráadás tehát most is fokozatosan nő. A tízfokozatú rendszer nélkül (régi
padló, dinamikus mód) marad a 4. idény.

## Próbák

* `tools/kupa-lap-gyorsulas-3-9-262-proba.js` mindhárom pontot méri.
* A régi szabályt váró próbák az új szabályt várják:
  * `kupa-meccsero-proba.js`;
  * `valtozasok-3-9-175-proba.js`;
  * `pyr-szuperliga-proba.js`;
  * `hsz-merce-3-9-200-proba.js`.
