# A stílus-meccserő íve és teteje · a piramis mércéi · ultra ráadás (3.9.139)

## 1. Az ív: a maximum a 10. szinten, nem a 4.-en

> „A csapatstílusok saját speciális meccserő-boostjai túl gyorsan kiépíthetők
> maxra (12 és 20 meccserő pont), már kb. lvl 4-5 körül elérjük velük a maxot."

**Az ok, mérve:** a hozam = állapot × a megvett szint százaléka. A
százalékokat ~130-as állapotra hangoltuk. A valódi állapot egy középkarrieres
keretnél már 300 fölött van: a bejelentett panelen 329 nyomásszint, 6-os
stílusszinten. Így a 4. szint 3,9%-a 12,8-at adott, vagyis már a plafont.

**Most:** az n. megvett szint legfeljebb a plafon **n/10-ét** adhatja
(`styleRampCap`):

| szint | motoros stílusok | Panzer |
|---|---|---|
| 1. | +1,2 | +2 |
| 4. | +4,8 | +8 |
| 8. | +9,6 | +16 |
| 10. | **+12** | **+20** |

- **A teljes plafon** csak a 10. szinten nyílik meg, és ahhoz 14-es
  csapatstílus-szint kell (`engNeedLevel` = 4 + n).
- **Az állapot továbbra is számít:** egy 100-as állapotú keret a 10. szinten
  is csak 100 × 9% = +9-et kap.

## 2. A tető a 15. stílusszinttől nyílik

> „Ugyanezeknek a teteje nyíljon ki és lehessen 12 és 20 fölé vinni, amennyiben
> az adott csapatstílus eléri a lvl15-öt."

| stílusszint | ≤14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|
| motoros stílus (+25%/szint) | 12 | 15 | 18 | 21 | 24 | 27 | 30 |
| Panzer (+20%/szint) | 20 | 24 | 28 | 32 | 36 | 40 | 44 |

- **A másodlagos filozófia** mindkettőnek, az ívnek és a tetőnek is a FELÉT
  kapja (3.9.137): a 20. szinten +15, illetve +22.
- **Függvények:** `styleCapFor`, `engOvrCapK`, `fearOvrCap`, `STYLE_CAP_OPEN = 15`.
- **A panel** kiírja, hogy ezen a szinten legfeljebb mennyi jár, mennyi a mostani
  teljes plafon, és hogyan nyílik tovább.

## 3. Az All-in: meccs-erő a meccs-erőhöz

> „Nem a meccs erőmmel hasonlítja össze az ellenfél erejét."

**Eddig:** a panel a cél-osztály **közepét** (a világ-szintet) mérte a **nyers
keretedhez**. Ez két skála: a mezőny a rejtett bónuszod felét visszakapja, te
a meccs-erődben az egészet viszed.

**Most** ugyanaz a mérce, mint a HUB osztály-dobozában:

- a te `teamMatchStrength()`-ed;
- a cél-osztály `oppMatchStrength(közép)`-je, a szezon elején.

A nyers kereted zárójelben marad.

## 4. A létra: minden fok a MOSTANI meccs-erőt mutatja

> „Nem updatelődik folyamatosan az osztályok erőssége. Így félrevezető, hol
> járok erőben."

**Eddig:** a fokok az osztályközepet írták, ami a szezon alatt mozdulatlan
(D4: 113). A „mezőny most” doboz közben 132,8-at mutatott: növekedés + a
rejtett erősítés. Egy képernyőn két skála volt.

**Most** minden fok ugyanazon a skálán áll, mint a doboz és a te meccs-erőd:

- a saját osztályod foka **betűre** a „mezőny most” szám;
- a többié: az osztály közepe + a **saját** idénybeli növekedése (`pyrAiRate`,
  mert minden osztály a maga ütemében erősödik) + a rejtett erősítés.

Halványan mellette az osztályközép marad, tájékoztatásul.

## 5. Ultra csatár: enyhe csapatszintű ráadás

Amíg ultra csatár áll elöl, a csapat saját gólesélye **+5%** (`ULTRA_TEAM_OWN`).
A pillanatkép `ownGoalMult`-jában ül, tehát a PvP-párharcban is él. Az ár
(+3…+10% kapott gól) változatlan.

## 6. `tools/nevek/table.json` törölve

A fájl ~1000 néven elavult volt, és a `build.py` nem írta. Egy korábbi mérést
hamis hibákkal vitt félre. Mérni az `index.html` `HU_NAME_TABLE`-jéből kell.

## Próba

A `tools/stilus-meccsero-iv-proba.js` (21 állítás) ellenőrzi:

- a bejelentett esetet (329-es állapot, 4. szint → +4,8);
- a teljes ívet mindkét rendszerre;
- a két tető-sort;
- a másodlagos felezést;
- a kis állapot korlátját;
- az ultra +5%-át;
- a valódi All-in panel mindkét számát;
- azt, hogy a létra saját foka egyezik a „mezőny most” számmal.

**Módosult:** a `panzer-felelem-proba.js` „sosem +20 fölé” állítása. Most azt
méri, hogy a +20 14-es stílusszintig áll, 20-on +44.
