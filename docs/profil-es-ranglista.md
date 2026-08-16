# Profil és ranglista — 1. fázis (helyi), 2. fázis (globális)

*(3.3.21. Érintett kód: `PROFILE_KEY` és a köré épült függvények, `renderProfileModal`,
`profileTotals`, valamint a már meglévő `runBoard*` réteg.)*

## 1. Mi készült el (1. fázis)

A kezdőlap jobb felső sarkában egy **profil-gomb**: becenév + rövid azonosító.
Rákoppintva egy ablak nyílik, benne

* a **becenév** szerkesztője,
* az **eredményeid** összegezve (a végigvitt karrierekből),
* és a már meglévő **helyi Run-ranglista**.

Minden a `localStorage`-ban él, hálózat nélkül — a 2. fázis (globális
ranglista) ugyanezekre az adatokra fog épülni.

## 2. Az adatmodell

```js
localStorage["30-0-profile-v1"] = {
  v: 1,
  uid: "u<10 jel>",     // egyszer születik, SOHA nem változik
  nick: "Mistral",      // szabad szöveg, NEM egyedi
  createdAt, updatedAt
}
```

* **A becenév nem egyedi** — foglalás-rendszer helyett az `uid` különböztet meg
  mindenkit. A felületen a rövid alak jelenik meg: `Mistral #9f2x` (az uid
  utolsó négy jele). A **teljes** uid megy majd fel a globális listára, a rövid
  csak kijelzés.
* **Eszközönként külön profil** (mint a téma és a Run-ranglista). Ezt a felület
  ki is mondja.
* **A mentéstől független.** Egy karrier lezárása a mentést törli — a profil
  nem élhet benne.

## 3. Névszabályok

| szabály | érték |
|---|---|
| hossz | 2-20 karakter (a fölösleg vágódik) |
| tisztítás | vezérlőkarakterek és `<` `>` ki, többszörös szóköz összevonva |
| szűrő | egyszerű trágárság-lista, ékezet- és írásjel-függetlenül |

A szűrő (`PROFILE_BAD_WORDS` + `profileNormalize`) a normalizált alakban keres
részláncot: a `g.e.c.i` és a `Kúrva` ugyanúgy fennakad. Nem teljes moderáció —
a nyilvánvalót fogja ki, mielőtt közös listára kerülne, és a felület kimondja,
miért nem megy át. Bővítés: egyetlen tömb.

A megjelenítés minden ponton `esc()`-en megy át, tehát a tárolt név akkor sem
tud jelölést befecskendezni, ha a szűrő átengedi.

## 4. Az eredmény-összegzés

`profileTotals()` a **helyi Run-ranglistából** dolgozik (`runBoardLoad`), oda
pedig kizárólag **Infinityt megnyitott** karrier kerül. Amit ad: legjobb
Infinity-Run (mezőnnyel és szezonszámmal), legjobb záró Run, hány
Infinity-futás / ebből hány lezárva, összes bajnoki cím, összes Aranylabda,
összes lejátszott szezon.

Ez az EGY függvény a globális statisztika jövőbeli gyűjtőhelye is — ezért van
külön kiemelve, nem a rajzolásba szőve.

## 5. A 2. fázis terve (globális ranglista)

A döntések megvannak:

* **Csak az Infinity-megnyitáskori Run** kerül fel — az a valódi referencia
  (a lezáráskori marad helyi).
* A név nem egyedi, az azonosító különböztet meg.
* A szűrő már most a helyén van, tehát feltöltéskor nem kell újra dönteni róla.

Ami hátravan (kód): a `runBoardOnInfinity()` mellé egy feltöltés
`/lb/runs/<uid>` alá, egy top-100 lekérdezés (`orderByChild('infRun')` +
`limitToLast`), és a lista-nézet a profil-ablakba. A Firebase RTDB **már be van
kötve** (az MP-ág használja, lusta SDK-importtal és helyi tartalékkal), tehát új
infrastruktúra nem kell.

Ami hátravan (konzol, a projektgazdánál) — a két lépés lent, részletesen.

**Amit a rendszer nem tud garantálni:** a játék statikus HTML, a kliens bármit
felküldhet. A szabályok a szemetelést és a triviális átírást fogják ki, a
szándékos csalást nem — a lista becsületkassza, és ezt a nézet alatt ki is
mondjuk majd.

## 6. A Firebase-oldal — két lépés a konzolban

A kész szabályfájl: **`tools/firebase-rules.json`** (érvényes JSON, kommentek
nélkül, hogy gond nélkül beilleszthető legyen).

### 6.1. Anonymous auth bekapcsolása

Firebase konzol → **Authentication → Sign-in method → Anonymous → Enable**.
Ez adja a `auth.uid`-t, amire a `/lb` írási szabálya épül. Enélkül a `/lb`
ágra senki nem tud írni (a `auth != null` sosem teljesül), a játék többi része
viszont változatlanul megy.

### 6.2. A szabályok beillesztése

Firebase konzol → **Realtime Database → Rules** → a `tools/firebase-rules.json`
tartalmának beillesztése → **Publish**.

> ⚠️ **A szabályfájl a TELJES fát felülírja.** Ezért van benne a `/mp` ág is —
> ha csak a `/lb` részt illesztenéd be, a „Gyere 1v1!" azonnal elnémulna.
> Publikálás előtt érdemes a régi szabályokat kimásolni egy fájlba.

### 6.3. Mit csinál a szabályfájl

**Gyökér:** `".read": false, ".write": false` — alapból semmi. Csak az alább
felsorolt ágak nyílnak ki.

**`/mp` (a meglévő 1v1) — továbbra is bejelentkezés NÉLKÜL megy.** Ez fontos:
az MP-kód nem jelentkezik be sehova, tehát ha az `/mp` ágra `auth != null`
kerülne, a kétjátékos mód eltörne.

| szabály | mit ad |
|---|---|
| `mp/ping: {".read": true}` | a kapcsolat-próba (`mpNetInit`) működik |
| `mp/rooms/$code` írás/olvasás **csak 4 karakteres kódra** | a szoba csak akkor érhető el, ha tudod a kódot; a fa többi részébe nem lehet szemetelni |
| mezőnkénti `.validate` (mode/status/seed hossz, `players/$pid/role`, `ready`) | a szoba-rekord nem hízhat fel tetszőleges tartalommal |

Az `/mp` ágon szándékosan **nincs** „ismeretlen mező tilos" szabály: a
kétjátékos mód működik, és egy elfelejtett mező miatt nem szabad eltörnie.

**`/lb/runs` (az új globális ranglista):**

| szabály | mit ad |
|---|---|
| `".read": true` | a ranglistát bárki olvashatja (ez a lényege) |
| `".indexOn": ["infRun"]` | a top-100 lekérdezés szerveroldalon rendez, nem a kliens |
| írás: `auth != null && $entry.beginsWith(auth.uid + '_')` | **csak a saját bejegyzésedet írhatod** — másét nem tudod átírni vagy törölni |
| `newData.child('at').val() > data.child('at').val() + 10000` | ugyanazt a bejegyzést 10 másodpercenként legfeljebb egyszer lehet frissíteni (fékezi a hurkot) |
| `$entry.matches(/^[A-Za-z0-9_-]+$/)`, hossz ≤ 96 | a kulcs nem tud furcsa karaktereket becsempészni |
| mezőnkénti tartomány-ellenőrzés | `infRun` 0-100, `infLevel` 60-400, `infSeasons` 1-999, becenév 2-20 karakter, `at` ±reális idő |
| `"$other": {".validate": false}` | ismeretlen mező nem kerülhet be |

### 6.4. A bejegyzés sémája (ezt fogja írni a 2. fázis kliense)

```
/lb/runs/<authUid>_<karrierKulcs> = {
  v: 1,
  nick: "Mistral",       // 2-20 karakter, a helyi profilból
  pid:  "u43yu5tf0yy",   // a helyi profil-azonosító — CSAK megjelenítésre
  infRun: 74.2,          // az Infinity-megnyitáskori Run
  infLevel: 100,         // az akkori mezőnyszint
  infSeasons: 9,         // hányadik szezonban
  team: "Magyah FC",     // dísz
  titles: 11, ballons: 3,
  at: 1755300000000      // a feltöltés ideje
}
```

A **kulcs eleje az auth-uid** — ez a hamisíthatatlan rész, ez zárja ki, hogy
valaki más nevében írjon. A `pid` és a `nick` a rekordon belül csak
megjelenítés (azok bármikor átírhatók, ahogy a becenév is).

### 6.5. Amit később még lehet szigorítani

* **Bejegyzés-szám/fő**: a szabályokban nehéz megszámolni a gyerekeket; ha
  valaki elárasztaná, egy Cloud Function takarít, vagy a kulcsot fixáljuk
  `<authUid>_main`-re (fejenként egy sor).
* **Olvasás bejelentkezéshez kötése** (`".read": "auth != null"`): a ranglista
  továbbra is működne (a kliens amúgy is bejelentkezik), de a scrapelés
  nehezebb lenne.
