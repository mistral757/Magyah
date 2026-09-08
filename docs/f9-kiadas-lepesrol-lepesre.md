# 🚀 F9 — Kiadás lépésről lépésre

*(3.9.51. Ez a lap a KEZED alá dolgozik: minden lépésnél ott a parancs vagy a
kattintás, és az, hogy MIRŐL LÁTOD, hogy sikerült. A „miért"-ek a
`docs/kiadasi-roadmap.md`-ben vannak; ez a lap a „mit csinálj".)*

> **A KÓD OLDALÁN NINCS TEENDŐ.** Mind a hét lépés a te gépeden vagy a te
> fiókodban történik. Az utolsó gépi ellenőrzés — `node tools/kiadas-proba.js`
> — **49/50**, és az egyetlen nyitott tétel (az assetlinks-ujjlenyomat) épp a
> 4. lépésben töltődik ki.

**Ahol a sorrend KÖTÖTT, ott ki van írva.** A leggyakoribb elrontott lépés a
4-es: az ujjlenyomat csak az AAB feltöltése UTÁN létezik, tehát nem lehet
előre kitölteni.

---

## 0. Mielőtt bármihez hozzáérnél — két döntés

| kérdés | ajánlás | miért |
|---|---|---|
| **Aláíró kulcs** | **Play App Signing** (a Google őrzi) | Saját kulccsal: ha elveszik, az app **soha többé nem frissíthető**. A Play App Signing mellett a te *feltöltő* kulcsod cserélhető, ha elveszne. |
| **Célközönség** | **13+** | A névanyagban vannak szándékosan vaskos nevek (lásd `docs/f4-play-papirmunka.md` 3.). A 13+ alatt a Families-szabályzat is bekapcsolna, és az sokkal szigorúbb. |

---

## 1. Push-értesítések élesítése *(Netlify)*

**Ez az egyetlen lépés, ami a kiadástól függetlenül is számít**: enélkül a
bökés a felületen működni látszik, de a függvényen elbukik.

### 1.1 A kulcspár

Ha még nincs meg a **titkos** fele (a publikus 3.9.37 óta az `index.html`-ben
áll):

```bash
npx web-push generate-vapid-keys
```

> ⚠️ **A publikusnak EGYEZNIE kell azzal, ami az `index.html`-ben áll.** Ha új
> párt generálsz, mindkét helyre az új kell — különben a feliratkozás
> létrejön, de az aláírás nem illik hozzá, és a push-szolgáltató visszautasítja.
> Az `index.html`-ben lévő publikus kulcs: `PUSH_VAPID_PUBLIC`, 87 karakter.

### 1.2 A négy környezeti változó

Netlify → **Site configuration → Environment variables** → *Add a variable*:

| név | érték |
|---|---|
| `VAPID_PUBLIC` | ugyanaz, ami az `index.html`-ben |
| `VAPID_PRIVATE` | a **titkos** fele — ez soha ne kerüljön a repóba |
| `VAPID_SUBJECT` | `mailto:magyahok1997@protonmail.com` |
| `RTDB_URL` | `https://magyahok-default-rtdb.europe-west1.firebasedatabase.app` |

Aztán **Deploys → Trigger deploy → Deploy site**.

### 1.3 Ha a deploy elbukik a titok-szkennelésen

A napló a `VAPID_PUBLIC`-ra panaszkodik? Egy sor a `netlify.toml`
`[build.environment]` szakaszába:

```toml
SECRETS_SCAN_OMIT_KEYS = "VAPID_PUBLIC"
```

> **Csak ezt az egy nevet**, és **soha ne a `VAPID_PRIVATE`-et**: annak a
> szkennelése az egyetlen háló, ami elkapná, ha a titkos fele valaha
> beleszivárogna a kimenetbe.

### 1.4 Miről látod, hogy sikerült

Két böngésző, két különböző eszközön (vagy egy telefon + egy asztali gép):

1. mindkettőn nyiss/csatlakozz ugyanabba a szobába;
2. mindkettőn kapcsold be az értesítést (a gomb kéri az engedélyt);
3. az egyiken várakozz, a másikon nyomd meg a **bökést**.

**Sikeres:** a másik eszközön megjelenik a „MAGYAH — várnak rád" értesítés.
**Sikertelen:** a felület kiírja az okot (a `mpNet.pushErr`-ből) — a
leggyakoribb a hiányzó környezeti változó és a nem publikált adatbázis-szabály.

---

## 2. Play Console-fiók

**Ez a leghosszabb átfutású lépés — ezzel kezdj, és közben csináld a többit.**

1. <https://play.google.com/console> → regisztráció **magánszemélyként**;
2. **egyszeri 25 USD** regisztrációs díj;
3. **személyazonosság-igazolás** (okmány + cím). Napokig is eltarthat.

> ⚠️ **A 12 tesztelős szabály.** Új **személyes** fejlesztői fiókoknál a Google
> zárt tesztet vár az éles kiadás előtt: adott számú tesztelőnek (a jelenlegi
> szabály szerint **12**) **14 napon át** folyamatosan futnia kell a
> tesztnek. **Ellenőrizd a Console-ban a rád vonatkozó aktuális feltételt** —
> ez a szabály az elmúlt években többször változott, és a te fiókodra vonatkozó
> pontos számot a Console írja ki.
>
> **Amit ebből tudni kell:** a naptár dönt, nem a munka. Ezért indul ez a lépés
> elsőként, és ezért érdemes a zárt tesztet a lehető leghamarabb feltölteni —
> a 14 nap akkor kezd ketyegni.

---

## 3. Az AAB építése *(Bubblewrap)*

### 3.1 Előfeltételek

* **Node 18+** (`node -v`),
* **JDK 17** — a Bubblewrap fel tudja telepíteni, de ha van, gyorsabb,
* **Android SDK** — a Bubblewrap az első futáskor felajánlja a letöltést; hagyd rá.

```bash
npm install -g @bubblewrap/cli
bubblewrap doctor          # megmondja, mi hiányzik
```

### 3.2 A projekt létrehozása

Egy ÜRES könyvtárban (ne a játék repójában — a burok külön projekt):

```bash
mkdir -p ~/magyah-twa && cd ~/magyah-twa
bubblewrap init --manifest https://<A-TE-DOMAINED>/icons/site.webmanifest
```

A kérdésekre ezek a válaszok:

| kérdés | válasz | miért |
|---|---|---|
| Application name | `MAGYAH` | ez látszik az indítón |
| Short name | `MAGYAH` | — |
| **Application ID** | **`hu.magyah.app`** | **KÖTELEZŐEN ez** — az `.well-known/assetlinks.json` ezt tartalmazza |
| Display mode | `fullscreen` | a manifest is ezt mondja |
| Orientation | `default` | a játék fekvő módot is tud |
| Status bar color | `#000000` | a manifest `theme_color`-ja |
| **Signing key** | **hozz létre újat** | ez a FELTÖLTŐ kulcs; jegyezd fel a jelszavakat |
| versionCode | `1` | az első kiadás |
| versionName | **`3.9.51`** | **egyezzen az `APP_VERSION`-nel** |

> 🔑 **A kulcsfájl (`android.keystore`) és a két jelszó.** Tedd jelszókezelőbe
> vagy egy titkosított mentésbe. Play App Signing mellett ez „csak" a feltöltő
> kulcs — elvesztése kellemetlen, de nem végzetes (a Google tud újat
> engedélyezni). Kulcs nélkül viszont nem tudsz frissítést feltölteni.

### 3.3 Az építés

```bash
bubblewrap build
```

Ez létrehozza az **`app-release-bundle.aab`**-t (ezt töltöd fel) és egy
`app-release-signed.apk`-t (ezzel tudsz kézzel telepíteni tesztre).

**Miről látod, hogy sikerült:** a parancs kiírja mindkét fájl útját, és a
`.aab` néhány MB.

---

## 4. Feltöltés → ujjlenyomat → assetlinks ⚠️ **KÖTÖTT SORREND**

**Ez a leggyakrabban elrontott lépés.** Az ujjlenyomat, ami az
`assetlinks.json`-ba kell, csak a feltöltés UTÁN létezik — a Google akkor
generálja az *app signing* kulcsot.

### 4.1 Feltöltés zárt tesztre

Play Console → **Tesztelés → Zárt teszt** → új kiadás → az `.aab` feltöltése.
*(Ne éles sávra: ez még nem publikálás.)*

### 4.2 Az ujjlenyomat kimásolása

Play Console → **Tesztelés és kiadás → Beállítás → Alkalmazás-aláírás**
*(a menüpont neve változhat: „App integrity" / „App signing" is lehet)*.

Ott két ujjlenyomat áll:

| melyik | kell? |
|---|---|
| **App signing key certificate** SHA-256 | ✅ **EZ KELL** |
| Upload key certificate SHA-256 | ❌ nem ez |

> Ha a **feltöltő** kulcs ujjlenyomatát írod be, a TWA-ban ott marad a
> böngésző címsávja, és semmi nem mondja meg, miért. Ez a hibás lépés
> klasszikus formája.

### 4.3 Beírás és újra-deploy

A repóban, `.well-known/assetlinks.json`, a `PLACEHOLDER:…` helyére:

```json
"sha256_cert_fingerprints": [
  "AB:CD:EF:...:12"
]
```

Aztán commit + push → a Netlify magától deployol.

**Ellenőrzés:**

```bash
curl -s https://<A-TE-DOMAINED>/.well-known/assetlinks.json
node tools/kiadas-proba.js   # innentől 50/50, figyelmeztetés nélkül
```

### 4.4 A végső próba

Telepítsd a zárt tesztből az appot, és nyisd meg.

* **Nincs böngésző-címsáv a tetején** → az assetlinks jó, kész vagy.
* **Van címsáv** → az ujjlenyomat rossz (lásd 4.2), vagy a fájl nem érhető el
  a `https://<domain>/.well-known/assetlinks.json` címen, vagy a
  csomagnév nem `hu.magyah.app`.

---

## 5. A Play Console űrlapjai

Mind kitölthető, amíg a teszt fut. A válaszok készen vannak.

| űrlap | hol vannak a válaszok |
|---|---|
| **Adatbiztonság** (Data safety) | `docs/f4-play-papirmunka.md` 2. szakasz — táblázatosan |
| **Tartalmi besorolás** (IARC) | ugyanott, 3. szakasz — ⚠️ **„enyhe trágárság: IGEN"** |
| **Célközönség** | 13+ (lásd 0.) |
| **Adatvédelmi tájékoztató URL** | `https://<domain>/adatvedelem/` |
| **Hirdetések** | nincs |
| **Alkalmazáson belüli vásárlás** | nincs |

> **A besorolásnál ne spórolj.** Valótlan „nem" válasz miatt utólag leszedhetik
> az appot; a helyes válasz legrosszabb esetben eggyel magasabb korhatár.

---

## 6. Az áruházi lap

Minden szöveg bemásolható innen: **`docs/f4b-aruhazi-lap.md`**.

| mező | forrás |
|---|---|
| Alkalmazás neve | `MAGYAH` |
| Rövid leírás (80) | a lap 1. szakasza |
| Teljes leírás (4000) | a lap 2. szakasza |
| Alkalmazás ikonja (512×512) | `icons/icon-512x512.png` |
| **Funkciógrafika (1024×500)** | `icons/play/feature-1024x500.png` ✅ |
| Telefonos képernyőképek | `icons/screenshots/` (négy darab) |

> A funkciógrafika **kódból készül**: `node tools/grafika/render.js`. Ha a
> játék arculata változik, a kép egy paranccsal újragenerálható — nem avul el
> egy külső eszközben ottfelejtett fájlként.

---

## 7. Éles kiadás

1. a zárt teszt letelte után **Éles → Új kiadás**;
2. ugyanaz az `.aab` (vagy egy újabb, magasabb `versionCode`-dal);
3. beküldés — az első felülvizsgálat jellemzően napokig tart.

### Minden további frissítésnél

**A TARTALOM FRISSÍTÉSÉHEZ NEM KELL PLAY-KIADÁS.** A TWA a webet tölti:
egy `git push` → Netlify-deploy után a felhasználók a következő indításnál a
friss játékot kapják. A Play-en csak akkor kell új AAB, ha maga a BUROK
változik (ikon, név, célzott API-szint).

Új AAB esetén:

```bash
# ~/magyah-twa/twa-manifest.json — versionCode +1, versionName = APP_VERSION
bubblewrap build
```

### A kiadás előtti lánc (minden buildnél)

```bash
node tools/kiadas-proba.js             # papírmunka és csomagolás
./tools/check.sh                       # szintaxis · globálisok · nyers nevek
node tools/nevek/kepernyo-proba.js     # végponti névpróba
python3 tools/nevek/release.py         # → dist/index.html, önellenőrzéssel
```

---

## 8. Ha valami nem stimmel

| tünet | ok |
|---|---|
| a TWA-ban látszik a böngésző címsávja | rossz ujjlenyomat (4.2) vagy elérhetetlen assetlinks |
| a bökés „a szerver nincs beállítva" | hiányzó Netlify-változó (1.2) |
| a bökés „a társad feliratkozása hibás" | a Firebase-szabály nincs közzétéve |
| a Netlify-deploy titok-szkennelésen bukik | 1.3 |
| a `dist` betűi rendszerbetűre esnek | a `fonts/` lemaradt a feltöltésről |
| a Play „hiányzó adatvédelmi tájékoztató" | az URL nem a `https://<domain>/adatvedelem/` |
