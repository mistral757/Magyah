# 🆕 „Új verzió érhető el” — és a regressziós futtató (3.9.306)

## Miért

A 3.9.298-as hardcore-esetben a vendég **más szabállyal játszott**, mint a
társa. A legvalószínűbb ok: régebbi verziót futtatott.

* A fő HTML „network-first”: egy újratöltés mindig a friss játékot hozza.
* A telepített app (PWA) viszont a telefonon **napokig a memóriában ülhet**
  újratöltés nélkül.
* A gép ezt eddig csak a PvP-kézfogásnál mondta ki, utólag.

## Mit csinál

**A kiszolgálón** az `index.html` mellett egy apró `version.json` áll:

```json
{"v":"3.9.306"}
```

**Mikor nézi meg a játék:**

* 15 másodperccel a betöltés után;
* amikor az app előtérbe jön;
* félóránként;
* legfeljebb tízpercenként.

**Ha a kint lévő verzió újabb**, a lap alján egy sáv jelenik meg:

> 🆕 **Új verzió érhető el: v3.9.307** (nálad v3.9.306)
> A frissítés előtt a játék ment — semmi nem vész el.
> [🔄 Frissítés most] [Később]

* **🔄 Frissítés most:** előbb ment, aztán újratölt. Futó meccs alatt nem tölt
  újra, csak szól: „⚽ Most meccs fut — a lefújás után koppints újra.”
* **Később:** erre a verzióra elhallgat. Egy még újabbra újra szól.
* **Csak újabbra szól.** Egy régebbi kint lévő fájl (pl. egy félúton járó
  CDN-csere) sosem riaszt.
* **Csak http(s)-en működik.** `file://`-ról nincs mit kérdezni.

## A service worker

A régi worker minden nem-HTML kérést „cache-first” ad. Így a `version.json`
első válaszát örökre visszaadná. Ezért három dolog történik:

1. **Az új worker** a `version.json`-t átengedi a hálózatra, nem cache-eli.
2. **A kérés időbélyeget visz** (`/version.json?t=…`). Így a még frissítetlen,
   régi worker alatt is friss a válasz.
3. **Az új worker aktiváláskor** kitakarítja a régi által eltett
   `version.json`-bejegyzéseket.

## ⚠️ Kiadáskor

**A `version.json`-t az `APP_VERSION`-nel együtt kell léptetni.** Ha elmarad,
semmi nem romlik el, csak a sáv nem szól az új verzióról.

A próba első állítása pontosan ezt nézi, így egy elfelejtett léptetés a
regresszióban azonnal piros.

## 🐞 Mellékesen: a párharc-animáció ellenfele

A 3.9.270 óta az esemény-animációk (`evaEllenfelNev`, `evaEllenfelCimke`,
`evaEllenfelEro`) párharcban a `DUEL`-t nézték. Csakhogy az a `playMatchMotor`
**helyi konstansa**, ezért ott sosem látszott.

* **A hiba:** párharcban a jelenet a menetrend **gépi** ellenfelének nevét,
  mezét és erejét vette a társ csapata helyett.
* **A javítás:** a kezdőrúgás most egy modulszintű `_evaDuel`-be is beírja a
  párharc szkriptjét. Párharc nélkül ez `null`.

**Hogyan derült ki:** a `tools/check.sh` (`no-undef`) már jelezte. Mivel a
`check.sh` addig is piros volt két `requestIdleCallback`-sor és egy skill-név
miatt, a jelzés elveszett. Mostantól a `check.sh` **zöld**.

## 🧪 A regressziós futtató — `tools/futtat.js`

~235 próba él a `tools/` alatt, de eddig nem volt egyetlen parancs, ami
lefuttatja és összesíti őket.

```bash
node tools/futtat.js --uj 15 --check
```

* Párhuzamosan fut, és két azonos portú próba sosem fut egyszerre.
* Próbánként egy sor.
* A napló a `/tmp`-be kerül.
* A képernyőképeket a végén rendbe teszi.
* Részletek: `tools/README.md`.

## Próba

`tools/uj-verzio-3-9-306-proba.js`, 17 állítás:

* a `version.json` egyezik az `APP_VERSION`-nel;
* a verzió-összevetés;
* újabb verzió esetén sáv, ugyanaz vagy régebbi esetén csend, a tízperces
  fékkel;
* „Később” és egy még újabb verzió;
* futó meccs alatt nincs újratöltés; egyébként mentés, aztán újratöltés;
* a service worker átengedi a `version.json`-t; a régi worker alatt is friss,
  és az új kitakarít;
* a párharc-animáció ellenfele;
* nincs oldalhiba.
