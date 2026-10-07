# 3.9.217 — 🎁 Ingyen igazolható scout-találat, csak átigazolási időszakban

> „A realisztikus scout is találjon úgy játékost, hogy az igazolás ingyenes.
> Azt szintén az átigazolási ablakban lehessen intézni. Arány 33%. És ha a
> klasszikus scout van bekapcsolva, ezentúl a tőle érkező játékosokat is csak
> átigazolási időszakban lehessen leigazolni (ingyen)."

## Egy lista, két forrás

| Scout | A találat | Ára | Mikor igazolható |
|---|---|---|---|
| 🔭 Valósághű | a **Megfigyelt játékosok** listájára | **⅓ ingyen**, ⅔ licittel (65–75%-ról) | csak átigazolási időszakban |
| 🔍 Szokásos | a **Felfedezett játékosok** listájára | **mindig ingyen** | csak átigazolási időszakban |

**Átigazolási időszak** ugyanaz, mint a liciteknél és az eladásnál: a nyár (két
szezon között) és a szezonközi átigazolási ablak.

## Az ingyenes igazolás

* A kártyán **🎁 ingyen** jelzés és egy **✍️ Leigazolom — ingyen** gomb áll.
  Zárt időszakban a gomb tiltott, és ki van írva, mikor igazolható.
* **Nincs licit és nincs türelem.** A valósághű scout ingyenes kiszemeltjénél
  a licit-hívás is egyenesen az ingyenes igazolásra vezet.
* **Kell hely a keretben.** Tele keretnél az üzenet megmondja, mi a teendő
  (elengedés vagy keretbővítés).
* A játékos a **tartalék-keretbe** kerül, és elindul a beilleszkedése (az
  összhang nulláról épül).
* A mérés „scout:<ok>” forrással rögzíti.
* Ez továbbra is **felfedezés, nem vásárlás**: az igazolás-kihívásokba nem
  számít bele (ezt az üzenet is kimondja, ha épp fut ilyen kihívás).

## A szokásos scout útja

* **A meccs utáni felfedezés** (mesterhármas, nagy győzelem, meccsember, a
  hálózat saját találata) a **listára** kerül, nem a keretbe.
* **A felfedező képernyő megmarad:** kimondja, hogy a játékos a listára
  került, ingyen leigazolható, és hogy most nyitva van-e az átigazolási
  időszak.
* **Végigjátszásnál** képernyő nélkül, csak a listára (és a naplóba).
* **A HUB Átigazolás menüjében** a gomb „🔍 Felfedezett játékosok” néven
  jelenik meg, amint van valaki a listán. A felirata számolja az ingyeneseket
  („2 🎁 ingyen leigazolható — most”).
* **A lista legfeljebb 8 fős**, mint eddig. A legrégebbi esik ki.

## Értesítés

**🆕 Újdonság** (3.9.215): ha egy átigazolási időszak nyílik, és ingyenes
játékos vár a listán, egyszer szól („Ingyen leigazolható felfedezett”). A
„Mutasd” a lista gombjához visz.

## A próba

`tools/scout-ingyen-3-9-217-proba.js` — **18 állítás**, valódi böngészőben.

* a 33%-os arány 600 felfedezésen;
* az ingyenes és a fizetős igazolás kapui;
* zárt és nyitott időszak, tele keret, a mérés forrása;
* a szokásos scout listája, a felfedező képernyő és a végigjátszás;
* a panel, a HUB-gomb és az újdonság-figyelő.

A `meres-scout-3-9-206-proba` két helyen igazodott:

* a szokásos felfedezés a listán át, az időszakban leigazolva érkezik;
* a licit-mérés fizetős találattal fut.
