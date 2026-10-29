# 🔁 A félbehagyott kihívás-ajánlat, 👆 a játékos-név menü (3.9.333)

## 1. A kihívás-ajánlat túléli a frissítést

> „Ha kihívásos képernyőn vagyunk, akkor előfordul, hogy frissítés után nem
> visz oda vissza a gép, azaz konkrétan elveszhet a kihívás vállalás
> lehetősége."

**Az ok.** A frissítést eddig csak a forduló utáni (checkpoint) rövid
kihívások ajánlata élte túl (3.9.290). Ami elveszett:

* **Az idénynyitó (első és későbbi idény) hosszú ajánlat.** Az elsőnél a
  „már felajánlottuk" jelző mentődött, a lista nem, így a lehetőség végleg
  elveszett. A későbbieknél új lista sorsolódott.
* **Az idénykezdő sprint** (a Kihívások talizmán rövid ajánlata).
* **A kupa-kihívások.** Itt is a jelző mentődött, a lista nem.

**Most:**

* minden ajánlat a mentésbe kerül (`S.chKinal`) a folytatás fajtájával
  (`elso`, `kov`, `sprint-elso`, `sprint-kov`, `kupa`) és a vállalások
  jelzőjével;
* betöltéskor **ugyanazokkal az ajánlatokkal** nyílik vissza, az
  elvállaltak kimaradnak a listából;
* a „Kész — tovább" törli a mentett ajánlatot, és ugyanoda visz tovább,
  ahová frissítés nélkül vitt volna.

**Mellékesen javítva (3.9.331):** a mentés egyenként sorolja fel a mezőket,
és a saját bajnokság két új állapota kimaradt belőle:

* a párharc-napok (`S.svPh`);
* a Run-összevetés (`S.svRun`).

Frissítés után így a már lejátszott párharc-nap újra esedékes lett volna.
Most mindkettő mentődik.

## 2. A játékos-név menü és a betekintő adatlap

> „… valamelyik érintett játékos nevére rákattintva […] először egy
> legördülő menü jön, amin két opció: első: őt választom, második: ugrás a
> játékos adatlapjára. És akkor akár ott helyben is beugorhat a játékos
> adatlap."

**Hol.** A döntési felületeken:

* a skill- és kémia-választó (`#scSkill`, ide tartozik a legelső skill is);
* az átigazolási ablak és minden eseménye (`#scWindow`): álomigazolás,
  elvágyódás, sztár-követelés, ikon, scout, ügynökség;
* a nyári döntések képernyője (`#scUnlock`).

**Koppintható nevek.** Ezeken a felületeken a kiírt játékosnevek maguktól
koppinthatók: pöttyözött aláhúzást kapnak. A játék a felület minden
változásakor megkeresi a neveket. A keret tagjainál a teljes és a rövid
név, a világ többi játékosánál a teljes név számít. A meglévő képernyőkhöz
ehhez nem kellett nyúlni.

**A névre koppintva menü nyílik:**

* **✅ Őt választom** — ha a név egy választó gombon vagy soron áll; ugyanaz
  történik, mint eddig a koppintásra;
* **📋 A játékos adatlapja** — a lap **helyben, a döntés fölött** nyílik.

**A betekintő adatlap:**

* a műveletek gombjai zárva vannak, a döntés alatta érintetlenül vár;
* a ‹ › gombokkal a keret többi tagjára lehet lapozni;
* a HUB újrarajzolása nem zárja be;
* a világ játékosánál (például egy álomigazolás jelöltjénél) a pool adataiból
  épül.

**A név melletti koppintás** (a sor, a gomb többi része) a régi út, azonnal
választ. A programból indított kattintás (például a „meccsről meccsre"
lánc) is a régi úton megy, menü nélkül.

## Próba

`tools/kihivas-nev-menu-3-9-333-proba.js` (12 állítás):

* a mentés, a visszanyitás, a lezárás, és a párharc- és Run-adatok
  mentése;
* a koppintható név, a menü, az „Őt választom", a betekintő lap és annak
  zártsága;
* a HUB-újrarajzolás, a régi út és a programból indított kattintás.
