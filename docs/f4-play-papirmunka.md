# 📋 F4 — A Play-papírmunka válaszlapja

*(3.9.10. A kiadási roadmap 3.4 pontja. Ez a lap **előkészítés**: a Play
Console-ba kézzel kell bepötyögni, de a válaszok itt már megvannak, és a
kódból vannak levezetve — nem emlékezetből.)*

## 0. Egy mondatban

A játék **alapesetben semmit nem küld el**; adat csak akkor mozdul, ha a
felhasználó ranglistára tölt fel vagy kétjátékos szobát nyit. **Nincs
hirdetés, nincs analitika, nincs regisztráció, nincs vásárlás.**

---

## 1. Az audit — mi hagyja el a készüléket

Nem becslés: a `index.html` átvizsgálásából. **A teljes kódban három külső
hoszt szerepel**, és ebből az egyik nem is hálózati hívás:

| hoszt | mire |
|---|---|
| `gstatic.com` | a Firebase programkönyvtár letöltése (futásidőben, `import`) |
| `…europe-west1.firebasedatabase.app` | az adatbázis (Frankfurt, EU) |
| `w3.org` | csak az SVG névtér-azonosító — **nem hálózati kérés** |

**Nulla találat** ezekre: `gtag`, Google Analytics, Tag Manager, Sentry,
Mixpanel, Amplitude, AdSense, AdMob, Facebook SDK.

### 1.1 Globális ranglista — választható, bejelentkezéssel

Firebase **anonim** bejelentkezés (`signInAnonymously`). Csak akkor ír, ha van
becenév ÉS a felhasználó megnyomja a feltöltést. A rekord:

| mező | tartalom |
|---|---|
| `nick` | **a felhasználó által írt becenév**, ≤20 karakter |
| `pid` | helyi profilazonosító, ≤24 karakter |
| `infRun`, `infLevel`, `infSeasons` | a futás számai |
| `team`, `mode`, `style`, `titles`, `ballons` | csapatnév és a karrier jellemzői |
| `at` | időbélyeg |
| *(kulcs)* | `<anonim-auth-uid>_<karrier-azonosító>` |

### 1.2 Kétjátékos szoba — választható, bejelentkezés NÉLKÜL

`mp/rooms/<4 karakteres kód>`: kód, játékmód, létrehozás ideje, közös
világ-mag, a résztvevők szerepe és készenléte, és a fordulók eredményei.

### 1.3 Ami csak a készüléken van

A mentések, a keret, a karrier és a beállítások a `localStorage`-ban. **Ez
soha nem hagyja el a készüléket** — a Data safety szempontjából tehát nem
„gyűjtött" adat.

---

## 2. Data safety űrlap — a kitöltendő válaszok

### 2.1 Gyűjtünk vagy megosztunk adatot?

**IGEN.** (Ha „nem"-et jelölnénk, az valótlan volna: a ranglista becenevet és
azonosítót küld fel.)

### 2.2 Adattípusok

| Play-kategória | gyűjtjük? | megosztjuk? | kötelező? | mire |
|---|---|---|---|---|
| **App activity → Other actions** | ✅ | ❌ | **nem** (választható) | ranglista-eredmények, kétjátékos eredmények |
| **App info & performance** | ❌ | ❌ | — | nincs összeomlás-jelentés és nincs diagnosztika |
| **Device or other IDs** | ✅ | ❌ | **nem** | az anonim auth-azonosító és a helyi profilazonosító |
| **Personal info → Name** | ⚠️ **döntés kell** | ❌ | **nem** | lásd lent |
| Location, Contacts, Photos, Files, Messages, Calendar, Health, Financial | ❌ | ❌ | — | nem kérjük és nem használjuk |

> **⚠️ AZ EGYETLEN ÉRDEMI DÖNTÉS: a becenév.** Szabadon írható mező, tehát a
> felhasználó **valódi nevet is beleírhat**. Két járható út van:
>
> **(a) Deklaráld „Personal info → Name"-ként.** Óvatos és biztonságos: a Play
> soha nem büntet a túlnyilatkozásért, csak az alulnyilatkozásért.
>
> **(b) Deklaráld csak „User IDs"-ként**, és a felületen tedd egyértelművé,
> hogy a becenév nyilvános és nem lehet valódi név.
>
> **Ajánlás: (a).** Olcsóbb, mint egy utólagos szabálysértési jelzés.

### 2.3 A többi kérdés

| kérdés | válasz | miért |
|---|---|---|
| Titkosított a továbbítás? | **igen** | a Firebase HTTPS-t használ |
| Kérhet-e a felhasználó törlést? | **igen** | a tájékoztatóban megadott e-mail-címen |
| A gyűjtés kötelező-e? | **nem** | mindkét funkció opcionális |
| Van-e hirdetés? | **nincs** | — |
| Megfelel-e a Families szabályzatnak? | **nem célzunk gyerekeket** | lásd az IARC-ot |

---

## 3. IARC tartalmi besorolás — a kérdőív

A legtöbb kérdésre „nem" a válasz: nincs valósághű erőszak, nincs szexuális
tartalom, nincs drog, nincs valós pénzes szerencsejáték, nincs vásárlás.

> **⚠️ EGY KÉRDÉSRE VISZONT „IGEN" A VÁLASZ, ÉS EZT KI KELL MONDANI.**
>
> **Trágár nyelvezet / vulgáris humor.** A névanyagban vannak **szándékosan
> vaskos** nevek. Mérve a kiadott (`dist/`) fájlban is, tehát a felhasználóhoz
> is eljutnak:
>
> `Aztakurva Sándor` · `Seggborotváló András` · `Pizzaszaró Lehel` ·
> `Dészarul Aurél` · *(határeset:)* `Debuzi Máté`
>
> Ez a kérdőívben **„igen, enyhe trágárság / vulgáris humor"**. Következménye
> jellemzően PEGI 12 / ESRB Teen körüli besorolás — nem baj, csak tudni kell
> előre. **Valótlan „nem" válasz miatt utólag leszedhetik az appot**, ezért ez
> nem az a kérdés, amin spórolni érdemes.
>
> Ha alacsonyabb besorolás a cél, a négy név a `tools/nevek/manual.py`-ban
> egyetlen mozdulattal átírható — de ez a te döntésed, nem az enyém: ezek a te
> szándékos poénjaid.

---

## 4. Az adatvédelmi tájékoztató

Megvan: **`adatvedelem/index.html`**, a kiadás után a
`https://<domain>/adatvedelem/` címen. Önálló lap, külső betű és szkript
nélkül, sötét módot is tud.

**Három mező kitöltendő benne a közzététel előtt**, `[SZÖGLETES ZÁRÓJELBEN`
jelölve:

1. `[ADATKEZELŐ NEVE]`
2. `[KAPCSOLATI E-MAIL]`
3. `[SZÉKHELY / ORSZÁG]`

E három nélkül a Play elutasítja — az adatvédelmi tájékoztató URL akkor is
kötelező, ha semmit nem gyűjtenénk.

---

## 5. Áruházi lap — ami már megvan

| kell | állapot |
|---|---|
| ikon (512×512) | ✅ `icons/icon-512x512.png` |
| maskable ikon | ✅ 3.9.10 óta |
| telefonos képernyőképek | ✅ négy darab 1080×1920, `icons/screenshots/` |
| rövid és hosszú leírás | ⬜ a manifest `description` mezője kiindulásnak jó |
| funkciógrafika (1024×500) | ⬜ hiányzik |
| célközönség, kereskedelmi státusz | ⬜ Play Console-ban |

---

## 6. Ami ezután jön

**F6** — `assetlinks.json` + Bubblewrap → aláírt AAB. A roadmap 3.2 és 3.3.

**F7** — a Firebase-szabályok kiadás előtti átnézése, és a **4 karakteres
szobakód** kérdése: ~1,7 millió kombináció végigpróbálható. Ma baráti
funkció; nyilvános kiadásnál felület. Az adatvédelmi tájékoztató ezt
**kimondja** (4.2), de a kimondás nem javítás — a döntés (hosszabb kód,
lejárat, vagy írás-korlátozás) az F7-é.
