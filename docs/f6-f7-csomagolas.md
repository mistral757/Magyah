# 📦 F6–F7 — Csomagolás és a Firebase-szabályok

*(3.9.12. A kiadási roadmap 3.2, 3.3 és 3.5 pontja. Az F7 kódrésze kész és
mérve van; az F6 a te gépeden fejeződik be — aláíró kulcs és éles domain
nélkül nem lehet AAB-t építeni.)*

---

## 1. F7 — a Firebase-szabályok átnézése

### 1.1 A szobakód: négyről hatra

**Ez volt a legkonkrétabb hiba.** Az ábécé 32 karakteres (`ABCDEFGHJKLMN
PQRSTUVWXYZ23456789` — az `I`, `O`, `0`, `1` szándékosan kimarad, mert
diktálásnál összekeverik őket).

| | kombináció | mit jelent |
|---|---|---|
| 4 karakter *(eddig)* | **1 048 576** | egy délután, egy szkripttel végigpróbálható |
| 6 karakter *(mostantól)* | **1 073 741 824** | ezerszeres szorzó |

> A roadmap „~1,7 millió"-t írt. **Ez téves volt:** 32⁴ = 1 048 576, nem 1,7
> millió. (A 36-os ábécével jött volna ki 1,68 millió, de az `I/O/0/1`
> kimarad.)

Ez azért számít, mert egy szoba adata **bejelentkezés nélkül** olvasható és
írható annak, aki a kódot ismeri. Egymillió kód végigpróbálása nem elméleti
veszély.

**A régi kódok tovább élnek.** A beviteli mező hatot enged, de négyet is
elfogad, és az adatbázis-szabály mindkét hosszt átengedi.

### 1.2 Amit a szabályfájlban szigorítottam

| változás | miért |
|---|---|
| `.read` / `.write`: `$code.length === 4 \|\| === 6` | az új hossz, a régi megtartásával |
| `.write` + **30 napos frissesség** | egy elhagyott szoba kódja örökre érvényes volt; mostantól 30 nap után nem írható. Új szoba létrehozását nem akadályozza (`!data.exists()`) |
| a szoba gyökerében `"$other": {".validate": false}` | csak az ismert kulcsok írhatók. Az utak felsorolhatók, ellenőriztem: `code`, `mode`, `createdAt`, `status`, `seed`, `players`, `start`, `h2h` — más nincs |

> **A SZABÁLYFÁJL NEM ÉLES ATTÓL, HOGY ITT VAN.** A repóbeli
> `tools/firebase-rules.json` csak a forrás — a Firebase Console-ban kell
> **közzétenni**. Amíg ez nem történik meg, a fenti szigorítások nem élnek.

### 1.3 Amit MEGFONTOLTAM, DE NEM CSINÁLTAM MEG — és miért

**A `start` és a `h2h` továbbra is `".validate": true`**, vagyis
korlátozatlan. Ez tudott kockázat: aki ismer egy élő szobakódot, tetszőleges
méretű adatot írhat oda, ami a Firebase-számládon jelenik meg.

**Miért nem szigorítottam mégsem:** megnéztem, mi kerül oda, és a `h2h`
levelei **tetszőleges objektumok** — `{rows:…}`, teljes állapot-pillanatképek,
meccsjelentések, döntés-rekordok, tizenkét különböző hívási helyről. Egy
szabály, ami ezt „rövid sztring vagy szám"-ra szűkíti, **némán megölné a
kétjátékos módot** — és élő Firebase-hozzáférés nélkül nem tudom
végigpróbálni, hogy nem tettem-e. Egy nem tesztelt biztonsági szigorítás
rosszabb, mint egy kimondott kockázat.

**Amit helyette javaslok**, ha ez fontossá válik:
1. a kliens oldalon egy méret-fék a `h2hPut`-ban (a payload JSON-hossza
   fölött), mert azt tesztelni tudod;
2. a Firebase Console-ban **költségriasztás** — ez az igazi védőháló, és öt
   perc beállítani;
3. csak ezután, mért payload-alakokkal, a szabály-oldali szűkítés.

### 1.4 A ranglista

A `lb/runs` ág rendben van: az írás `auth != null`-hoz kötött, és a kulcsnak
az író saját `auth.uid`-jével kell kezdődnie, tehát **más bejegyzését senki
nem írhatja felül**. Van 10 másodperces írás-fék és mezőnkénti `.validate`.

Egy apró rés marad: a kulcs `<uid>_<karrier-azonosító>`, és a karrier-részt a
kliens adja. Egy elszánt felhasználó **több bejegyzést** hozhat létre
magának, ha változtatja. Nem adatvédelmi kérdés, csak a lista tisztasága —
és a ranglista úgyis `limitToLast`-tal olvas.

### 1.5 Amit az adatvédelmi tájékoztatóban javítani kellett

A tájékoztató azt írta, hogy a kétjátékos szobák „rendszeresen törlésre
kerülnek". **Ezt semmi nem csinálta** — ez az én állításom volt, és nem volt
igaz. Javítva: kilépéskor a szoba tényleg azonnal törlődik (`leave()` →
`remove()`), de egy ELHAGYOTT szoba ott marad; 30 nap után már nem írható, és
kézzel töröljük. A lap most kimondja, hogy **nincs automatikus takarítás**.

---

## 2. F6 — a burok

### 2.1 Digital Asset Links

Kész: **`.well-known/assetlinks.json`**. Enélkül a TWA-ban ott marad a
böngésző címsávja — vagyis nem appnak látszik, hanem weboldalnak. Ez a
leggyakrabban elrontott lépés.

**Két mező kitöltendő benne:**

1. `package_name` — most `hu.magyah.app`. Ez a **végleges** applicationId:
   a Play-en **soha többé nem változtatható**, és a domainedhez illik
   igazítani.
2. `sha256_cert_fingerprints` — a **Play App Signing** ujjlenyomata, NEM a
   saját feltöltő kulcsodé. A Play Console → *Kiadás → Beállítás → Alkalmazás
   aláírása* alatt található, miután először feltöltöttél egy AAB-t.

> **A SORREND ITT SZÁMÍT, ÉS SOKAN ELRONTJÁK.** Előbb AAB-t töltesz fel,
> ONNAN olvasod ki az ujjlenyomatot, és csak UTÁNA teszed élesre az
> `assetlinks.json`-t. Fordítva nem megy — az ujjlenyomat még nem létezik.

A fájlnak a **`https://<domain>/.well-known/assetlinks.json`** címen kell
elérhetőnek lennie, `application/json` típussal, átirányítás nélkül.

### 2.2 A Bubblewrap-lépések

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://<domain>/icons/site.webmanifest
bubblewrap build          # → app-release-bundle.aab + a signing key
```

**Három döntés, amit rögzíteni kell** (mindegyik nehezen visszacsinálható):

| döntés | megjegyzés |
|---|---|
| **applicationId** | pl. `hu.magyah.app`. A Play-en soha nem változtatható. |
| **versionCode / versionName** | a `versionName` legyen az `APP_VERSION` (ma `3.9.12`), a `versionCode` pedig egy egyszerű, MONOTON növő egész (1, 2, 3…). A Play a `versionCode`-ot nézi, és **csökkenni nem tudhat**. |
| **az aláíró kulcs tárolása** | **ennek az elvesztése azt jelenti, hogy az appot soha többé nem tudod frissíteni.** Play App Signinggel a Google őrzi a kiadói kulcsot, de a FELTÖLTŐ kulcs a tiéd. Mentsd el legalább két helyre, a jelszavaival együtt. |

### 2.3 Amit nem tudok elvégezni helyetted

Aláírt AAB-t itt nem lehet építeni: kell hozzá az **éles domain** (a
`bubblewrap init` onnan olvassa a manifestet), egy **Java/Android SDK
környezet**, és egy **aláíró kulcs**, aminek soha nem szabad a repóba
kerülnie. Ezért maradt ez a lap runbook, nem szkript.

---

## 3. Ami ezután van

**F9 — kiadás.** A roadmap 5. szakaszának ellenőrzőlistája.

**Nyitva maradt, sorrendben:**

1. A Firebase-szabályok **közzététele a Console-ban** (a fájl kész).
2. **Költségriasztás** a Firebase-ben — ez az igazi védőháló a `h2h` ellen.
3. Az `assetlinks.json` két mezője, a fenti sorrendben.
4. Az adatvédelmi tájékoztató három mezője (`docs/f4-play-papirmunka.md`).
5. Az IARC „vulgáris humor" kérdése (ugyanott).
