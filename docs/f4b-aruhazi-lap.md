# 🏪 F4/b — Az áruházi lap szövegei

*(3.9.50. A `docs/f4-play-papirmunka.md` 5. pontjának hiányzó fele. Ez a lap
**bemásolható**: a Play Console mezőibe pontosan ez megy, változtatás nélkül.
A karakterszámok mérve vannak, nem becsülve.)*

---

## 0. Amit egy helyen kell eldönteni

| mező | érték |
|---|---|
| **alkalmazás neve** (30 karakter a plafon) | `MAGYAH` |
| csomagnév | `hu.magyah.app` *(az `assetlinks.json`-ban is ez áll)* |
| alapértelmezett nyelv | magyar (`hu-HU`) |
| kategória | Játékok → **Sport** |
| címkék | menedzserjáték · futball · szimuláció |
| tartalom-besorolás | az IARC-kérdőívből — **enyhe trágárság: IGEN** (lásd F4 3.) |
| ár | ingyenes, alkalmazáson belüli vásárlás nélkül |

> **A NÉV.** A játékon belüli hosszú alcím („Magyah Szutykos Kutyusok a
> Biszem-Baszom Topligák Között") **nem** mehet az áruházi névbe: 30 karakter
> a plafon, és a Play a nevet a besorolásnál is nézi. Az alcím a JÁTÉKBAN
> marad, ahol a helye van — az áruházban a `MAGYAH` áll, a hangvétel pedig a
> leírásból árad.

---

## 1. Rövid leírás — **80 karakter a plafon**

```
Magyar futballmenedzser: draft, kémia, harminc forduló. Offline is játszható.
```

*(77 karakter — a 80-as plafon alatt.)*

**Két tartalék, ha ez nem tetszik:**

```
Építs keretet, sorsolj edzőt, és vidd fel a klubot a megyeiből az élvonalba.
```
*(76)*

```
Futballmenedzser magyarul: hat osztály, harminc forduló, egy klub — a tiéd.
```
*(75)*

---

## 2. Hosszú leírás — **4000 karakter a plafon**

> **Miért nem szuperlatívuszokból áll.** A Play tiltja a megtévesztő és a
> túlzó ígéreteket, és a rangsorolást sem javítja. Ez a szöveg azt mondja el,
> MI TÖRTÉNIK a játékban — a hangvétel pedig a játék sajátja, nem egy
> hirdetési sablon.

```
Egy magyar futballklub menedzsere leszel. Nem a pályán játszol: te döntesz.

⚽ ÍGY MEGY

Összeválogatod a keretet — klubokat pörgetsz, játékosonként építkezel —,
felállítod a csapatot, sorsolsz egy edzőt, aztán jön harminc forduló.
A mérkőzéseket a játék szimulálja, percről percre, élő eredményjelzővel és
kommentárral: gólok gólpasszal, sárga és piros lapok, tizenegyesek,
formaingadozás, öngól, VAR. A tempó a tiéd — végignézed vagy átfuttatod.

🏆 HAT OSZTÁLY, EGY CÉL

A hagyományos karrierben egy hatosztályos bajnoki rendszerben indulsz.
Aki az élen végez, feljut; aki a végén, kiesik. A csúcs az első osztály
bajnoki címe — és onnan még mindig van feljebb.

A karrier több szezonon át tart. A játékosaid öregednek és fejlődnek, van
átigazolási piac, utánpótlás-akadémia, edzésterv, büdzsé, szurkolói gazdaság
és európai kupasorozat.

🪜 LÉPCSŐK A CSÚCS FELÉ

A játékban több tucat beállítás van — nehézség, tempó, kezdési mód. Ezeket
nem zúdítjuk rád az első percben: a játék végigvezet néhány lépcsőn, és
minden bajnoki cím kinyit egy adagot belőlük. Aki már tudja, mit csinál,
hamar szabad kezet kap; aki most kezdi, nem egy beállítás-falba fut bele.

🎯 A KLUB FILOZÓFIÁJA

Az első teljes szezon után egyszer, véglegesen eldöntöd, milyen csapatot
építesz: beton védelem, bombázók, tiki-taka, egy sztár köré szervezett klub,
vagy valami egészen más. A döntés saját mérföldköveket és saját képességfát
nyit meg — és végigkíséri a karriert.

🛡️ A KLUB, AMI A TIÉD

Címert tervezel, klubszíneket választasz, szerelést és mezszámokat adsz a
kerednek, nevet a stadionnak. Mind ingyenes, egyik sem kötelező — és onnantól
ott van a HUB tetején, az eredményjelzőn és a bajnokavatáson is.

👥 KÖZÖS KARRIER

Egy barátoddal közös világban is végigvihettek egy karriert: ugyanaz a
mezőny, ugyanaz a tabella, és a szezon közben egymás ellen is játszotok.
Szobakóddal működik, regisztráció nélkül.

📵 OFFLINE IS

A játék a készülékeden fut. Telepítés után repülőgép módban is elindul és
végigjátszható — a mentéseid a te készülékeden maradnak, és fájlba is
kimenthetők. Csak a közös karrier és a globális ranglista kíván internetet.

🚫 AMI NINCS BENNE

Nincs hirdetés. Nincs alkalmazáson belüli vásárlás. Nincs energia-rendszer,
nincs várakoztatás, nincs regisztráció. Nem gyűjtünk rólad adatot: a játék
alapesetben semmit nem küld el.

⚠️ A NEVEKRŐL

A játék nem áll kapcsolatban egyetlen valós labdarúgóklubbal, szövetséggel
vagy játékossal sem. A benne szereplő játékos-, klub- és liganevek
kitaláltak — magyar hangzású, gyakran humoros nevek, itt-ott vaskos
poénokkal. Ha ilyet nem szeretnél, ez a játék nem neked való.
```

*(Mérve: **2616 karakter**, a 4000-es plafon alatt. Az emoji-fejlécek a Play
lapján is megjelennek, és tördelik a szöveget — a Play megengedi őket, csak
címként ne álljanak.)*

---

## 3. Amit még a Console kér

| mező | állapot | hol |
|---|---|---|
| ikon 512×512 | ✅ | `icons/icon-512x512.png` |
| **funkciógrafika 1024×500** | ⬜ **hiányzik** | grafikai munka — lásd lent |
| telefonos képernyőkép (min. 2, max. 8) | ✅ négy darab 1080×1920 | `icons/screenshots/` |
| adatvédelmi tájékoztató URL | ✅ | `https://<domain>/adatvedelem/` |
| kapcsolattartási e-mail | ✅ | `magyahok1997@protonmail.com` |
| célközönség | ⬜ döntés | **13+** ajánlott (lásd F4 3. — enyhe trágárság) |

### A funkciógrafikáról

Ez az egyetlen kötelező elem, amit kódból nem lehet előállítani. Ami a
meglévő anyagból kijön:

* a **címlap** (`icons/screenshots/01-cimlap.png`) felső harmada 1024×500-ra
  vágva már majdnem kész — a `MAGYAH` felirat és a krém háttér adott;
* mellé a **maskable ikon** és egy rövid mondat a rövid leírásból.

Fontos: a funkciógrafikán **ne legyen apró szöveg** (a Play kicsinyítve is
mutatja), és **ne legyen benne képernyőkép-keret** — a Play ezt kifogásolja.

---

## 4. Az első feltöltés sorrendje

1. **Zárt teszt sáv**, nem éles — az assetlinks ujjlenyomata csak feltöltés
   után derül ki (lásd `docs/f6-f7-csomagolas.md`).
2. Az áruházi lap kitöltése ezekkel a szövegekkel.
3. Data safety + IARC (a válaszok: `docs/f4-play-papirmunka.md`).
4. Az `assetlinks.json` ujjlenyomatának beírása és **újra-deploy** — ezután
   ellenőrizni, hogy a telepített példányban **nincs böngésző-címsáv**.
5. Csak ezután éles sáv.
