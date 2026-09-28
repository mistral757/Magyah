# 3.9.152 — csereterv-scenariók, fejlődési görbe, fekvő talizmán, értesítés, ranglista

A hosszú lista második köre.

## 🔁 Cseretervek: mentés, betöltés, kapcsoló törlés nélkül

> „Menthető csere tervek, amiben akármennyi csere scenario lehet egyszerre"
> · „Csere ki bekapcsolása anélkül hogy az aktuális cserebeállítások
> eltűnnének"

* **Mentett tervek.** A tervező tetején a „📚 Mentett tervek” blokk áll. A
  mostani terv névvel menthető („Vezetünk”, „Hátrányban”…), **akárhány**
  mentett terv lehet.
  * Egy koppintás betölti a tervet. A futó terv helyére MÁSOLAT kerül, tehát a
    szerkesztés nem rontja el a mentettet.
  * A „↺ Felülírás” visszaírja a tervet, a ✕ törli.
  * A félidei megállás beállítása is a terv része.
* **A kikapcsolás megtartja a tervet.** A HUB a kikapcsolt állapotban is
  kiírja: „a terved (n opció, m mentett) megvan, bekapcsoláskor visszajön”.
* **A párharc „nem cserélek” gombja többé NEM törli a tervet.** Eddig ez volt
  az egyetlen út, ami eldobta a szabályokat. Mostantól csak arra az egy
  mérkőzésre veszi le a tervet a drótról (`S.subPlanSkip`), a következő
  párharcon újra fut.

## 📈 Fejlődési görbe a játékoslapon

> „Legyen egy fejlődés követő görbéje minden játékosnak amit meg lehet
> nézni a saját adatlapján a HUBban"

**Adat.** A pool-bejegyzés `dh` tömbje [idény, forduló, alap-Rating] pontokat
gyűjt.

* **Mikor kerül fel pont:** a meccs utáni lánc (`devHistTick`) csak akkor ír,
  ha a Rating mozdult, vagy új idény kezdődött.
* **Legfeljebb 90 pont:** ha betelik, a régebbi fele ritkul; a legelső pont
  sosem vész el.
* **A távozók görbéje törlődik** idényenként egyszer, mert a mentés már
  egyszer kvótába futott.

**Megjelenés.** A lapon SVG-görbe látható:

* idényhatárok;
* szaggatott vonalon a csúcs-plafon;
* a legjobb és a mostani pont kiemelve;
* alatta: kezdet → most (±), a legjobb és a plafon.

Az alap-Ratinget mutatja, a napi forma nélkül.

## 📱 Talizmánok fekvő módban

> „Telefonos fekvő módban nem látszanak jól a talizmánok, pedig ott lehetne
> az egyik legmenőbb oldal nézetben"

Fekvő telefonon (≤ 560 px magasság) a menü két oszlop:

* **balra** az irány, az idény és a hatások, külön görgetve;
* **jobbra** a gyűjtemény **vízszintes polcon**: a lapok egymás mellett,
  lapozva, alattuk halvány arany „polc”-fénnyel.

A húzás három lapja egymás mellé kerül. A lapokon nincs idézet, hogy a lényeg
(alap, special, kontra) látsszon, az ablak pedig görgethető, ha a gombok
nem férnének el.

## 🔔 Értesítés minden platformon

> „Nem minden platformon lehet bekapcsolni az értesítést"

A gomb eddig csak annyit mondott: „ez a böngésző nem tud értesítést
fogadni”. Mostantól a konkrét teendőt mondja, már a gomb alatt is:

* **iPhone / iPad Safari-lapon:** a push csak a kezdőképernyőre tett játékban
  él (iOS 16.4-től): Megosztás → „Főképernyőhöz adás”.
* **Beépített böngésző** (Messenger, Instagram, Facebook, TikTok): nyisd meg a
  rendes böngészőben.
* **Privát / inkognitó ablak:** nyisd meg normál ablakban.
* **Régi Safari:** az engedélyt callback-kel adja. Eddig igen válasz esetén
  is „nem kaptunk engedélyt” jött; most mindkét alakot elfogadja.
* **A háttérszolgáltatásra legfeljebb 8 mp-et vár** (eddig örökké), utána
  kimondja, hogy töltsd újra az oldalt.

## 🌍 Ranglista: havi fül és a 09.08-i határnap

> „Legyen aktuális havi ranglista a karrier Run szinteknél globálban.
> Minden Run eredmény, ami 09.08. előtti, legyen levéve a mindenkori globál
> ranglistáról, csak a hely ranglistán maradjon meg."

A mérce az **elérés** pillanata (a helyi sor `at` mezője: az Infinity
megnyitása, illetve az első élvonalbeli arany), nem a feltöltésé.

* **A 2026. 09. 08. előtt elért futás fel sem megy.** A helyi listán
  változatlanul megmarad.
* **A globális listán két fül van:**
  * **🌍 Mindenkori:** a határnap előtti bejegyzések nem látszanak.
  * **📅 E havi:** az adott naptári hónapban, a határnap után elért futások,
    a lekért legjobb 100 közül.
* **Az elérés ideje új `ach` mezőben megy fel.**
  * A szabályfájl (`tools/firebase-rules.json`) frissült: az `ach` szám, és
    nem lehet a jövőben.
  * **Amíg a Firebase-konzolban a régi szabály él**, az `ach`-os írást
    elutasítja. Ilyenkor a feltöltés MAGÁTÓL újraír a régi alakkal, tehát
    semmi nem törik el. Az új szabály kitétele után az elérés ideje is
    felmegy.

## A próba

`node tools/kenyelem-3-9-152-proba.js` (9189-es port), 19 állítás:

* **cseretervek:** mentés, betöltés másolatként, felülírás, törlés; a
  kikapcsolás és a párharc-kihagyás megtartja a tervet;
* **fejlődési görbe:** a görbe pontjai, a korlát, a távozók törlése, a valódi
  lánc és a játékoslap;
* **fekvő mód:** valódi 844×390-es nézetben a két oszlop, a vízszintes polc
  és a három lap;
* **értesítés:** valódi iPhone- és Messenger-user-agenttel a teendő, és a
  callback-es engedélykérés;
* **ranglista:** a szűrés, a havi fül, a feltöltés tiltása és a régi
  szabályfájlra való visszaesés.
