# 3.9.206 — 📈 Karrier-mérő és 🔭 valósághű scout

> „Jó lenne beépíteni a játékba egy merő rendszert, ami minden megkezdett
> karrierről részletes mérési adatokat készít úgy hogy az kivonatolható
> legyen. A cél: minél jobban megérteni, hogyan működik a balance a
> játékban […]"

> „legyen egy kapcsoló, ami realisztikusabbá teszi a scout találatait […]"

## 1. A karrier-mérő

### Mit rögzít

**Minden karrier-játékban fut, csendben.** A napló a böngészőben marad,
saját kulcson (`meres30_<karrier>`):

* a mentést nem hízlalja;
* egy karrier törlése sem viszi el.

**A karrier azonosítója** a világ-seed és az első mérés ideje
(`S.meresId`, a mentéssel együtt él). Két karrier ugyanazzal a seeddel így
sem olvad egy naplóba.

**Az 1. idény részletes:**

| Mikor | Mit |
|---|---|
| Az első bajnoki kezdőrúgáskor | **Beállítások:** mód, indulás, tempó, értékelési alap, Magyah, VB, felállás, mezőny, piramis (osztály, sebesség, rés, eltolás, klub-erő), szint-rés, scout, ügynökség, edző, kapitány, büdzsé, csapatnév, valósághű scout, ✨, közös kupa |
| Az első bajnoki kezdőrúgáskor | **Kezdő keret:** minden játékos minden adattal: poszt, nemzetiség, kor, OVR, kijelzett OVR, kezdő és csúcs-érték, POT és becsült POT, attribútumok, alap-sebesség, jellem, skillek, valós referencia |
| Minden meccs után | Forduló, sorozat, hazai/vendég, eredmény, az ellenfél kijelzett és tényleges meccs-ereje, a saját csapaterő és meccs-erő, a büdzsé |
| Minden érkezéskor | A játékos minden adattal, a forrása és az ára |
| A bajnokság végén | Helyezés, pont, győzelem/döntetlen/vereség, gólok, mezőny, csapatátlag |
| Az idény zárásakor | Végső erő és meccs-erő, a főkönyv kategóriánként, bevételre és kiadásra bontva (nyitó és záró egyenleggel), a távozók, a nemzetközi kupa |

**A 2. idénytől tömör:**

* kezdő és végső csapaterő és meccs-erő;
* helyezés, pont, gólok;
* a meccsek összesítője (nincs meccsenkénti sor);
* a büdzsé (nyitó, záró, bevétel és kiadás kategóriánként);
* érkezők (tömören) és távozók, forrás szerint.

**A források:** `ifi`, `vasarlas`, `scout:<ok>` (a felfedezés oka),
`megfigyelt` (a valósághű scout listájáról vett), `ikon`, `egyeb`.

**A draft és a nyitó vásárlások** nem érkezők: azok a kezdő keret részei,
amely a kezdőrúgáskor rögzül.

**Betelt tárhelynél** a 2. idénytől a meccs-részletek esnek ki. A mérés
sosem viheti el a játékot.

### Kivonat

**A játékban:** Beállítások → 📈 Mérési napló:

* ⬇ **Letöltés (JSON)** — minden karrier naplója egy fájlban;
* 📋 **Másolás** — ugyanez a vágólapra;
* ☁ **Feltöltés most** — kézi feltöltés.

**Összegzés:**

```bash
node tools/meres/osszegez.js magyah-meres-2026-10-06.json --csv meres.csv
```

* **Bemenet:** a játék letöltése, a Firebase-konzol exportja (a teljes
  adatbázis vagy csak a `meres` ág) vagy egyetlen napló.
* **Kimenet:**
  * karrierenként egy összefoglaló;
  * `--csv` esetén idényenként egy sor, táblázatkezelőbe.

### Feltöltés

**Választható, alapból KI.** Ha a felhasználó bekapcsolja („Automatikus
feltöltés a fejlesztőknek”), idényzáráskor a napló felmegy:

* hova: a játék Firebase-adatbázisába, `meres/<névtelen uid>/<karrier>`;
* becenév, e-mail vagy más személyes adat nem kerül fel;
* a csapatnév igen, ha a játékos írta be.

**A szabály** (`tools/firebase-rules.json`, a `meres` ág):

* csak a saját ágra lehet írni;
* olvasni a kliensből senki nem tud;
* egy bejegyzés legfeljebb 400 000 karakter.

**A szabályt a Firebase-konzolban kézzel kell közzétenni** (Realtime
Database → Szabályok). Addig a feltöltés elutasítva marad. A játék ettől
nem hibázik, csak nem megy fel semmi.

**Az adatvédelmi tájékoztató** ezt a 4.5 pontban írja le.

**A cél:** később ebből jön az egyszerű nehézség-rendszer. A játékos két
dolgot állít be: a karrier nehézségét és a kezdő osztályt; a részletes
beállítások választhatóak maradnak.

## 2. Valósághű scout

**A kapcsoló:** Beállítások → 🔭 Scout → Valósághű scout. A futó karrierre
szól (`S.scoutReal`, a mentésben), az új karrier a legutóbbi választást
örökli.

**A találat:**

* **Gyengébb:** a felfedezés sávjának felső határa 1,5-del lejjebb, a csúcsa
  is lejjebb ül (a scout minőségével együtt mozog). Mérve átlagban kb. 1,5–2
  ponttal gyengébbet talál.
* **Nem érkezik:** a 🔭 Megfigyelt játékosok listájára kerül (HUB →
  Átigazolások). Legfeljebb 8 fő; ha több, a legrégebbi kiesik.

**A vétel az eladás tükre:**

| | Eladás (meglévő) | Valósághű scout-vétel |
|---|---|---|
| Kiinduló ár | a kért ár | **a piaci vételár 65–75%-a** (1★ ügynökség → 75%, 10★ → 65%) |
| A másik fél kúpja | licitek 60–125%, csúcs 65–100% | **fogadókészség 68–118%, csúcs 100%** (1★), jobb ügynökséggel lejjebb (5★ → 85%) |
| Elutasítás után | a csúcs +5% (a negyedikig) | **a csúcs −5%** (a negyedikig) |
| Türelem | — | **3–5 licit** (5★ ügynökséggel +1); a nagyon alacsony ajánlat (a fogadókészség 80%-a alatt) kettőt fogyaszt; ha elfogy: **végleges nem** |
| Tárgyalás | — | ha a licit közel volt (a fogadókészség 88%-a fölött): **ellenajánlat**, amit az ablakon belül elfogadhatsz |
| Mikor | eladási ablak | **ugyanaz az ablak**; ablakonként játékosonként legfeljebb 3 licit |

**A licit gombjai:** a meghirdetett ár 75 / 85 / 95 / 105%-a, plusz az
ellenajánlat elfogadása és a ✕ (levétel a listáról).

**A kapu:** csak nyitott ablakban, elég büdzsével és szabad kerethellyel
lehet licitálni.

**Elfogadáskor** a vétel ugyanazon az úton megy, mint egy piaci vásárlás:

* a főkönyvben „igazolás”;
* az érkezés jelölése (`markArrived`);
* a mérőben `megfigyelt` forrás.

## Mentés

**A korábbi hiány:** az `S` mezőnként mentődik. Az új mezők nélkül a lista,
a kapcsoló és a napló-azonosító újratöltéskor elveszett volna.

**Most mindhárom** a mentésben van (`scoutReal`, `scoutWatch`, `meresId`).
A régi mentés üres listával és örökölt kapcsolóval tölt be.

## Próba

`tools/meres-scout-3-9-206-proba.js` — **48 állítás**, valódi böngészőben,
részletek a `tools/README.md`-ben.
