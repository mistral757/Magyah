# 3.9.259 — A nagy ugrás nem viszi lejjebb a csapatstílus-szintet

> „Miután feloldódik a nagy ugrás hagyományos módban, a csapatstílus szintje
> visszaesik. Értem, mi az oka, újraszámol mindent az új mérföldkövekkel. De
> ne essen vissza. Semennyit. Sőt, nőnie kéne ilyenkor, hiszen egy csomó új
> mérföldkő elérhető lesz."

## Az ok

A csapatstílus-szint három csatornából áll:

* fa: 400 SXP;
* teljesség: 350 SXP;
* mérföldkövek: 250 SXP.

A mérföldkő-csatorna eddig arányt számolt: szerzett / elérhető × 250.

Piramis módban a nagy ugrás magától megnyitja az Infinityt
(`pyrInfinityCheck`). Ekkor a `stExtendForInfinity` minden bővíthető
mérföldkő-család végére hat új lépcsőt fűz, a nyolc stílusnál együtt 678-at.
A nevező egy csapásra megnőtt, a szerzett pont nem. Egy mérés szerint így a
csatorna kb. 150-ről kb. 45 SXP-re esett, ami −100 SXP és jellemzően 1–2 szint.

## A javítás

* **A nevező a régi lista marad.** A mérföldkő-csatorna nevezője a régi,
  Infinity előtti lista.
* **Az új lépcsők a tetőn felül adnak.** Ugyanazon az árfolyamon adnak SXP-t,
  mint a régiek, de a 250-es tetőn felül.
* **A megnyílás pillanatában a szám pontosan a régi.** Semennyit nem esik.
* **Minden teljesített új lépcső emel.** Ahol a mutató már túl is van egy új
  küszöbön, ott a következő pásztázás azonnal jóváírja.
* **A szint továbbra is a 20.-nál áll meg.**

A fejléc a három csatorna-mérő alatt kiírja: „♾️ Infinity-lépcsők: +N SXP a
250-es tetőn felül”.

## Próba

`tools/stilus-infinity-szint-3-9-259-proba.js` mind a nyolc stílusnál méri:

* a megnyílás előtti és utáni szint és SXP pontosan egyezik;
* a régi képlettel esett volna;
* egy teljesített új lépcső után az SXP nő;
* a fejléc kiírja a hozamot.
