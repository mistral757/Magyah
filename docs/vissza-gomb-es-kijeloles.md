# A telefon vissza gombja — és a szövegkiemelés kikapcsolása

**Állapot:** ✅ megvalósítva · **Verzió:** 3.7.40

*(Érintett kód: a `body` kijelölés-tiltó CSS-blokkja és a `.mpCode` kivétele;
`BACK_LAYERS` / `BACK_BLOCKERS` / `BACK_BTN_RX`, `backVisible`, `backFindBtn`,
`gameBackStep`, `backToast`, `initBackButton`.)*

---

## 1. Szövegkiemelés — ki, az egész játékban

**A bejelentés:** *„ha lehet valahogy szüntessük meg a szövegkiemelés funkciót
a teljes játékban. Sosem akarom szöveget kiemelni benne, és a cseréknél
bezavart, mert néha a hosszú nyomást szövegkiemelésnek érzékeli."*

**Ez nem kozmetika.** A keretlista **húzással csere** gesztusa (`hubDragInit`)
fél másodperc nyomás után indul — pontosan az az idő, amikor a mobil böngésző a
saját szövegkijelölését is elindítja. Amint a böngésző kijelölésbe kezd,
**elveszi a pointer-eseményeket**: a húzás félbemarad, és ott marad egy kék
kijelölés-folt a játékos neve fölött.

**Három külön böngésző-viselkedést kell kikapcsolni**, mert három külön dolog:

| tulajdonság | mit kapcsol ki |
|---|---|
| `user-select` (+ `-webkit-`, `-ms-`) | magát a kijelölést |
| `-webkit-touch-callout` | a hosszú nyomásra felugró „Másolás / Kikeresés" buborékot (iOS Safari) |
| `-webkit-tap-highlight-color` | a koppintáskor felvillanó szürke téglalapot |

A tulajdonság **öröklődik**, ezért elég a `body`-ra tenni — nem kell
végigjárni a felületet.

**Két kivétel marad**, mindkettőnél a kijelölés maga a funkció:

* `input, textarea, select, [contenteditable]` — a klub- és keret-kereső, a
  szobakód beírása;
* `.mpCode` — a **másolható szobakód**, amit el kell tudni küldeni a társadnak
  (`user-select:all`).

**Mérve** (fejetlen böngésző): a főcím `user-select` értéke `none`, és a
Selection API-val ráállított tartomány **0 karaktert** ad vissza; a beviteli mező
`text`, a szobakód `all`.

---

## 2. A telefon vissza gombja

**A bejelentés:** *„hogyan lehetne megoldani, hogy a telefon vissza gombja ne a
játékból lépjen ki, hanem a HUB felülete felé irányítson, az aktuális ablakot
vagy menüfület bezárva, onnan visszafelé lépve?"*

A játék **egyetlen lap, előzmény-bejegyzés nélkül**: a vissza gomb eddig
egyenesen kilépett a telepített alkalmazásból — a szezon közepén, egy
félrenyúlásból.

### 2.1 A csapda

Induláskor **két** előzmény-bejegyzést tartunk (`base` és `trap`), és a
`trap`-en ülünk. A vissza gomb így nem a lapot hagyja el, hanem `popstate`-et
dob: azt elkapjuk, bezárjuk a legfelső réteget, és **visszatoljuk a csapdát**.

```
[base] [trap]          ← itt ülünk
   ↑ vissza gomb
[base]                 → popstate → bezárjuk a felső réteget → pushState(trap)
[base] [trap]          ← megint itt ülünk
```

### 2.2 Miért nem építünk igazi előzmény-vermet

A kézenfekvő megoldás („minden panel-nyitáskor `pushState`") azt kérné, hogy
**hatvan megnyitási pontot** instrumentáljunk — és egyetlen kihagyott ág némán
**kilépéssé** változtatná a vissza gombot. A rossz irányba hibázik.

Ehelyett a kezelő a **mostani állapotot** nézi meg: végigmegy a rétegeken, és az
elsőt zárja be, amelyik nyitva van. Egy új panel így magától bekerül a sorba,
amint felveszed a listába — és ami kimarad, az **nem lép ki, csak nem reagál**.

### 2.3 A zárás mindig a meglévő gombot nyomja meg

Sosem rejtünk el kézzel egy panelt: a réteg **saját** „Mégse / Bezár" gombját
kattintjuk. Így pontosan az a könyvelés fut le, ami a kézi záráskor (a
megerősítő függő callbackje törlődik, a választó visszaáll, a görgetés
helyreáll), és a kétféle út nem tud szétcsúszni.

**Következmény, ami szándékos:** ahol nincs látható záró gomb, ott a vissza gomb
nem csinál semmit. Egy folyamat közepén ez a helyes viselkedés.

**A hiányzók panelje 3.9.31 óta nem blokkoló.** Bejelentett hiba volt, hogy
*„nincs visszaút a kezdőrúgásra kattintás után, ha bedobja, hogy sérülés vagy
eltiltás miatt cserélni kell"*: a panel csak előre engedett, a vissza gomb pedig
— blokkolóként — néma maradt rajta. Most már van kiútja („← Mégsem indítom el"
és „⚙️ Irány a HUB"), tehát rendes réteg lett: a vissza gomb a saját gombját
nyomja meg, a pótlás-választások megmaradnak, a forduló nem indul el.

### 2.4 A sorrend

```
1. FOLYAMAT-PANELEK (BACK_BLOCKERS) → néma, de NEM kilépés
   htSubPanel · mpSubPanel · h2hWait
2. A LEGFELSŐ NYITOTT RÉTEG (BACK_LAYERS, fentről lefelé)
   megerősítő kérdések → ablakok (Infópult, adatbázis, menetrend, …)
   → HUB-választók (posztcsere, megbízás, kapitány, taktika, felállás)
   → teljes képernyős ablakok (átigazolás, jutalom, kupa)
3. NYITOTT MENÜFÜL a HUB-ban (hubAccToggle)
4. NINCS MIT BEZÁRNI → „Nyomd meg még egyszer a kilépéshez"
```

**A kezdőlap (`mpEntry`) szándékosan nem blokkoló.** Ott a vissza gombnak ki
kell tudnia lépni — az a lap gyökere, nincs mögötte semmi. Az első változatban
blokkolóként szerepelt, és emiatt a kezdőlapról a vissza gomb egyáltalán nem
reagált: nem zárt be semmit, de kilépni sem engedett.

### 2.5 A vissza gomb nem hoz döntést

A feliratra illesztő szabály (`BACK_BTN_RX`) **szándékosan szűk**, és csak
semleges elutasításokat enged: `✕ ✖ × ↩ Mégse Mégsem Bezár Vissza`.

A **döntést** jelentő feliratok — „Igen, …", „Kihagyom", „Köszönjük, idén
kihagyjuk" — kimaradnak. A vissza gomb becsukhat egy panelt, de nem mondhat le
helyetted a nyári kupáról. Ahol csak döntés-gombok vannak, ott néma marad.

### 2.6 Kilépni továbbra is lehet

Ha nincs mit bezárni, az első vissza egy sávot villant fel („Nyomd meg még
egyszer a kilépéshez"), és **nem** tolja vissza a csapdát — a második vissza
tehát tényleg kilép. **2,5 másodperc után a csapda magától visszaáll**, hogy egy
későbbi, véletlen vissza már megint csak panelt zárjon.

### 2.7 Két hiba, amit a mérés fogott meg

* **`offsetParent` a modálisokon.** Az első láthatóság-vizsgálat
  `el.offsetParent!==null` volt — csakhogy a modálisok `position:fixed` elemek,
  azoknak az `offsetParent`-je **mindig null**. Emiatt a vissza gomb egyetlen
  megerősítő ablakot sem talált meg. A befoglaló téglalap mérete (`width>0 &&
  height>0`) mindkét fajtára igazat mond.
* **A rejtett, mégis `open` menüfül.** A Csapatstílus füle addig rejtve áll,
  amíg nincs stílusod, de az `open` jelzőt viselheti. A `querySelector(".open")`
  ezen akadt el, és a valóban nyitott fül nyitva maradt — most a **látható**
  nyitott fület keressük.

### 2.8 Mérés (fejetlen böngésző, valódi vissza-navigációval)

| helyzet | eredmény |
|---|---|
| megerősítő modális nyitva | bezárult · az „Igen" callback **nem** futott le |
| kapitányválasztó nyitva | bezárult |
| menüfül nyitva | becsukódott |
| átigazolási ablak, „Vissza a HUB-ba" gombbal | a vissza-gomb lefutott, a döntés-gomb **nem** |
| csak döntés-gombok a képernyőn | semmi nem futott le, a panel nyitva maradt |
| félidei csere (blokkoló) | nyitva maradt, nem lépett ki, sáv sem villant |
| semmi nyitva, 1. vissza | sáv: „Nyomd meg még egyszer…", a lapon maradtunk |
| semmi nyitva, 2. vissza | a lap elhagyva (kilépés) |
| 2,5 mp várakozás után újra | a csapda visszaállt, a modális megint bezárult |

### 2.9 Ha új panel születik

Vedd fel a `BACK_LAYERS` listába, a z-indexének megfelelő helyre:
`{el:"panelId", btn:"zaroGombId"}`. Ha a záró gombot a JS építi (nincs fix
id-je), `btn:null` — akkor a panelen belül keressük meg felirat szerint. Ha
kimarad a listából, a vissza gomb egyszerűen nem reagál rá; **kilépni attól még
nem fog**.
