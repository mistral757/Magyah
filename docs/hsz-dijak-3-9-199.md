# 3.9.199 — 💜 Egyéni díjak a Hiper Szuper Kupában

> „Hiper szuper ligában is legyenek egyéni díjak. 10%kal erősebbek, mint a
> Kupák Kupájának Kupájában. Gólkirály gólpassz király kapus"

## 1. A három díj

A Hiper Szuper Kupa (HSZ) végén **a teljes mezőny statisztikájából** dől el a
gólkirály, a gólpassz-király és a kapus-király, ugyanúgy, ahogy a Kupák
Kupájának Kupájában (BL). Ha a király a **te játékosod**, tartós special
skillt kap.

**A +10% a BL-díj hatására vonatkozik.** A szorzós értékeknél a semleges
1-hez mért többlet nő 10%-kal (gól-, passz- és MVP-súly, kapus-védelem),
a hozzáadott értékek (rating, aura) pedig egyszerűen 10%-kal nőnek.

| díj | BL | HSZ |
|---|---|---|
| 💜 **Hiper Aranycipő** (csatár) | gól ×6 · rating +5 | gól ×6,5 · rating +5,5 |
| 💜 **Hiper Aranypasszok** (középpályás) | passz ×6 · rating +3 · MVP ×1,5 | passz ×6,5 · rating +3,3 · MVP ×1,55 |
| 💜 **Hiper Aranykesztyű** (kapus) | ellenfél-gólesély ×0,82 · aura +2,5 | ellenfél-gólesély ×0,80 · aura +2,75 |

* **Csak díjként szerezhető:** a HSZ-díj nem kerülhet a
  jutalom-pörgetésbe.
* **Hírnév és mérföldkő:** szintén a BL +10%-a:
  * a hírnév-bázis 10 → 11;
  * a mérföldkő-gyűjtemény súlya 3 → 3,3.

## 2. A BL- és a HSZ-díj viszonya

**Egy játékosnál ugyanabból a díjból egyszerre csak egy változat él**, a
kettő nem halmozódik:

| helyzet | mi történik |
|---|---|
| HSZ-díj, nincs még ilyen díja | megkapja a Hiper-változatot |
| HSZ-díj, a BL-változat már nála van | a Hiper-változat **lecseréli** a BL-est |
| BL-díj, a Hiper-változat már nála van | **megtartja** az erősebb Hiper-díjat |

**Minden díj számít a díjszámlálóba.** A 2. díjtól ugyanúgy jár a kék
karika és díjanként a tartós +3 Rating, akármelyik kupából jött.

## 3. A felületen

* **A záróképernyő:** külön blokk „Hiper Szuper Kupa — egyéni díjak”
  címmel, 💜 jelöléssel.
* **A saját játékos sora azt mondja, ami tényleg történt:**
  * „megkapta a Hiper Aranycipő special skillt”;
  * „a Hiper Aranypasszok lecserélte a korábbi KK-díját”;
  * „megtartotta az erősebb Hiper Aranycipő skillt”.

  Ez egyben javítás is: korábban a záróképernyő akkor is azt írta, hogy
  „megkapta a special skillt”, ha a játékosnál már megvolt.
* **A napló:** a díjsor ugyanezt a kimenetet mondja (💜 a HSZ-ben).
* **A meccs-kommentár:** a HSZ-díjasnak saját sorai vannak (három-három
  változat gólra, gólpasszra és védésre).

## Ami nem változott

* **A BL-díjak** értékei és címei.
* **A többi sorozat:** a bajnokság, az OJK, a KONF és a Magor Kupája díjai
  változatlanok.
* **A Run-mérő mérföldkövei:** nincs külön HSZ-gólkirály mérföldkő.

## Próba

```bash
node tools/hsz-dijak-3-9-199-proba.js
```

A próba **23 állítást** ellenőriz, valódi karrier-állással, a valódi
`startEuroCampaign` → `euroCampaignEndNow` → `renderEuroScreen` úton.
