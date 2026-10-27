# ✋ Kész csapat: rákérdezés a választáskor (3.9.319)

## A kérés

> „Kész csapatos módban legyen egy rákérdezés hogy biztosan ezt a csapatot
> választod amikor a kész csapatot ki akarod választani ez globális beállítás
> legyen mindegy hogy pvp vagy single player"

## Mi változott

A klubválasztóban a klubra koppintva továbbra is a betekintő nyílik. Az
**„Ezzel a klubbal indulok”** (hagyományos karrierben a „Tovább az
osztályválasztóhoz”) gomb viszont már nem indít azonnal, hanem
megerősítést kér.

**Mit mutat az ablak:**

* a klub nevét és az idényt;
* a keret méretét és a top-11 átlagát;
* hogy a karrier ezzel a kerettel indul, és a klub később nem cserélhető.

**A két gomb:**

* **„Még nézelődöm”:** semmi nem indul, a lista és a betekintő marad;
* **„Igen, ezzel indulok”** (hagyományos karrierben „Igen, tovább”): a
  megszokott út folytatódik.

**Hol él:** mindenhol, mert ez az egyetlen út a kész csapat választásához:

* egyjátékos dinamikus és hagyományos karrierben;
* közös karrierben is. Itt az ablak jelzi, hogy a választás után egyből
  indul az idény.

## Próba

`tools/klub-megerosites-3-9-319-proba.js`, 7 állítás, a valódi klublistán és
gombokon.
