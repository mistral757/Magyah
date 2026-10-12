# 📈 A mérési naplók automatikus szinkronja (Firebase → GitHub)

> „A másodiknak lenne igazán értelme, azzal tudnánk automatikusan gyűjteni
> neked az infót, hogy azt tudd figyelembe venni minden későbbi nehézségi
> szint állító melónál."

## Hogyan működik

1. **A játék** feltölti a mérési naplót idényzáráskor a Firebase `meres/<uid>/<karrier>` ágára, ha a felhasználó bekapcsolta (Beállítások → 📈 Mérési napló → Automatikus feltöltés).
   * Az ág kívülről nem olvasható, és ez így helyes.
2. **A GitHub Action** (`.github/workflows/meres-szinkron.yml`) naponta 03:17 UTC-kor fut, és kézzel is indítható (Actions → „Mérési naplók szinkronja” → Run workflow).
   * Egy **szolgáltatásfiók-kulccsal** (admin jog) lehúzza az ágat.
   * A `tools/meres/firebase-lehuz.js`-sel névteleníti és összegzi.
   * A **`meres-adat`** ág `meres/` könyvtárába commitolja az eredményt, de csak akkor, ha az adat változott.
3. **A fejlesztéskor** a Claude-munkamenet (és bárki) innen olvassa az adatot:
   ```bash
   git fetch origin meres-adat
   git show origin/meres-adat:meres/osszegzes.txt
   git show origin/meres-adat:meres/meres-firebase.json > /tmp/meres.json
   ```

## Mi kerül a `meres-adat` ágra

| fájl | mi |
|---|---|
| `meres-firebase.json` | a teljes napló, névtelenítve; a `tools/meres/osszegez.js` közvetlenül olvassa |
| `osszegzes.txt` | karrierenként: beállítások, kezdő keret, idényenként erő, helyezés, pénz, érkezők |
| `idenyek.csv` | idényenként egy sor |
| `meccsek.csv` | meccsenként egy sor: meccserő, az ellenfélé, a különbség, gólvárhatóság, motor-nemzedék |
| `ALLAPOT.md` | hány játékos / karrier / idény / meccs-sor, a legutóbbi feltöltés |

**Névtelenítés.** A repó nyilvános, ezért:

* a játékos-, csapat-, scout- és edzőnév (`n`, `nev`, `nevek`, `csapat`) helyén `null` áll;
* a Firebase-uid helyén SHA-256 kivonat áll (`u_…`), ugyanaz a játékos tehát felismerhető marad;
* a karrier-azonosító helyén szintén kivonat áll (`f_…`), mert benne van a világ-seed.

Minden szám (erő, helyezés, pénz, meccssorok) változatlan.

## Egyszeri beállítás (a repó gazdájának)

1. **Firebase-konzol** → a `magyahok` projekt → ⚙️ Projektbeállítások →
   **Szolgáltatásfiókok** → „Új privát kulcs létrehozása”. Letöltődik egy
   JSON-fájl.
2. **GitHub** → a repó → Settings → Secrets and variables → **Actions** →
   „New repository secret”:
   * név: `FIREBASE_SERVICE_ACCOUNT`;
   * érték: a JSON-fájl teljes tartalma.
3. A workflow-nak az **alapértelmezett ágon (`main`)** kell lennie: a GitHub
   csak onnan futtatja az időzített workflow-t. Amint a fejlesztési ág
   bekerül a `main`-be, a szinkron él.
4. Első futás: Actions → „Mérési naplók szinkronja” → **Run workflow**.

A kulcs admin jogú: soha ne kerüljön a repóba vagy a chatbe, csak a
GitHub-titokba.

## Kézi futtatás és próba

```bash
# a Firebase-konzol exportjából (Realtime Database → ⋮ → Export JSON):
node tools/meres/firebase-lehuz.js --fajl export.json --ki ki/
# élesben (a kulccsal):
FIREBASE_SERVICE_ACCOUNT="$(cat kulcs.json)" node tools/meres/firebase-lehuz.js --ki ki/
```

A szkriptnek nincs külső függősége. A Google OAuth-tokent (JWT, RS256) a
Node beépített `crypto` moduljával írja alá.
