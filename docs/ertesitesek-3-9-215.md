# 3.9.215 — 🔔 Értesítések a játékon belül

> „1. Nem működik a szundi gomb, legalábbis nem tartós
> 2. Vannak értesítések, amik helytelenül popupolnak folyamatosan. Pl
> megbízás a középpályán
> 3. Legyenek értesítések arra, amikor új dolgok megnyílnak, vagy elérhető
> lesz az áruk: pl emlékezetes meccs után szurkolói hangzás megnyílik a klub
> arculata menüben, elérhető árú a scout fejlesztés, vagy van felhasználatlan
> átigazolási esemény stb"

## 1. A szundi (⏳) tartós lett

**Két ok volt:**

* **Csak 3 fordulóra szólt.** A kezdőrúgás előtti push viszont minden
  fordulóban szólhat, így három meccs után ugyanaz a sáv ugyanazzal jött
  vissza.
* **A megújuló témák törölték.** Ilyen például az elkölthető stíluspont: minden
  új ponttal a halasztás is elpárolgott, vagyis a szundi a következő
  mérföldkőnél megszűnt.

**Mostantól:**

* A ⏳ **az idény végéig** hallgattat el, de legalább 5 fordulóra (hogy az
  idény utolsó fordulóiban se legyen jelképes). A naplóba ki is írja, hány
  fordulóig.
* A téma megújulása **nem törli** a szundit, mert az kifejezett döntés.
* **Vezetés menü:** a szundizott téma mellett „⏳ szundi — még N forduló”
  áll, és egy **Ébresztés** gombbal azonnal visszahozható. Eddig ehhez előbb
  némítani, majd visszakapcsolni kellett.

A halk jelzés „Most nem” gombja változatlanul 3 fordulóra halaszt.

## 2. A „Megbízás a középpályán” nem jön folyamatosan

**Az ok:** a téma a csapatstílus **szezon-szerepeinek** tábláját (`S.roles`)
nézte, nem a megbízásokét. Aki nem használt szezon-szerepet, annál a téma
örökre esedékes maradt, akárhogy állította a megbízásokat.

**Mostantól:**

* A megbízás a valódi helyén (`slotRoles`) számít: ha bármelyik középső
  középpályás megbízása nem alap, a téma elintézett.
* A **választó megnyitása** is elintézi. A klasszikus (alap) megbízás nem hagy
  nyomot, de aki megnézte és az alapnál maradt, az döntött.
* A téma **kikerült a kezdőrúgás előtti push-ok közül.** Tanács, nem sürgős
  tennivaló; halk jelzésként (keret a kereten) megmarad.

A többi push-téma esedékességét is átnéztem, ott nem találtam hasonló hibát.

## 3. 🆕 Újdonság-értesítések

Egyszer szólnak, amikor valami **most lett elérhető**, ugyanazon a felül
beúszó sávon, „🆕 Újdonság” címkével és arany kerettel. A **Mutasd** odavisz,
szundi nincs rajtuk, mert egyszeriek.

| Mikor | Értesítés | Mutasd |
|---|---|---|
| Egy izgalmas meccs új lelátót nyit (65 / 85 / 92 / 96) | 🏠🥁🔥🌌 Új lelátó nyílt: … | A klub arculata → 7 · A lelátó hangja |
| Teljesül a Sztár piac kapuja | ⭐ Megnyílt a Sztár piac | a Sztár piac gombja |
| Nyitott átigazolási időszak, maradt eseményed | 🎲 Felhasználatlan átigazolási esemény | az Átigazolási esemény gombja |
| Megvan a pénzed a scout következő fél csillagára | 🔭 Elérhető áron: scout-fejlesztés | Scout, ügynökség, sajtó |
| …az ügynökség következő szintjére | 🤝 Elérhető áron: ügynökség-fejlesztés | Scout, ügynökség, sajtó |
| …egy új stáb-helyre | 🎓 Elérhető áron: új stáb-hely | Szakmai stáb |
| …a keretbővítésre | 👥 Elérhető áron: keretbővítés | Keretbővítés |
| …a bolti vagy egy saját felállásra | 📋 / 📐 Elérhető áron: … | Felállás módosítása |

**Egy újdonság egyszer szól.**

* Minden elem azonosítót kap: a scoutnál a mostani csillagszintet, a
  keretnél a mostani méretet, az átigazolási eseménynél az időszakot.
* Amit egyszer bejelentett, azt megjegyzi (`S.teach.uj`, a mentéssel utazik).
* A következő szint már új azonosító, arról újra szól.

**Hol szól:** csak a HUB-ban, nyugalmi helyzetben. Nem szól meccs, végigjátszás,
jutalom-lánc vagy futó bevezető alatt; ilyenkor kivárja, amíg ezek véget érnek.

**Ami már megvolt, arról nem szól.** Az első futáskor (régi mentés, új
karrier) csendben felveszi a mostani állapotot.

**Kapcsoló:** Vezetés menü → 🆕 Újdonság-értesítések. Független a vezetés
fokozatától, de a közös értesítés-kapcsoló (Beállítások) elnémítja. Kikapcsolva
is csendben jegyez, így a visszakapcsoláskor nem zúdul rád a múlt.

## A próba

`tools/ertesitesek-3-9-215-proba.js` — **25 állítás**, valódi böngészőben.

* a szundi hossza, a megújulás, az ébresztés;
* a megbízás-téma (a javítás előtti kódon a beállított megbízás mellett is
  esedékes volt);
* az újdonságok a HUB-ban, a felületen át:
  * csendes kezdés;
  * új lelátó és a „Mutasd”;
  * scout-szintek egyszer;
  * a kikapcsolás;
  * minden figyelő hiba nélkül.

A javítás előtti kódon a próba már az első két résznél elbukik (a szundi 3 forduló után lejár, egy új pont törli, a megbízás-téma beállított megbízás mellett is esedékes), a 3. rész pedig ott még nem is létezik.
