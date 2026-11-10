# 🗜 Tömörített mentés, önálló tárhely-takarítás, új tempó-csúszka (1.0.7.1.00)

## A kérés (röviden)

> „⚠️ A Run-szintedet nem sikerült a helyi listára írni (megtelt a tárhely?)…
> Mit lehet ezzel csinálni, ha nincs törölhető karrierem? Mit tudnánk tenni ez
> ellen játékmechanikailag?"
>
> „A játék szimuláció sebességet állító csúszka nehezen kezelhető. Legyen 5
> ajánlott alapbeállítás: 0.15, 0.25, 0.5, 1, 2 és legyen két szélén a
> csúszkánál két nyilacska, amivel a szomszédos választható tempóra lehet
> lépni szépen óvatosan."

## Mi tölti meg a tárhelyet

Egy 3. idényes karrier mentését mértem meg:

| rész | méret (karakter) |
|---|---|
| a teljes mentés (csomagolt pool-lal) | 1 125 312 |
| ebből a világ játékos-poolja (≈ 3 800 játékos) | 920 779 |
| ebből az `S` (idény-állapot, statisztikák) | 196 168 |

A böngésző localStorage-kerete jellemzően **5 millió karakter**. Három
egyjátékos hely, a szoba-mentések és a mérési napló együtt ezt egy idő után
betöltik. Ilyenkor először a Run-lista írása száll el, mert az a mentés
után próbálkozik.

## A megoldás: tömörítés + önálló takarítás

### 1. A mentés tömörítve kerül ki

- Saját, egymenetes **LZ77** (hash-lánccal, 1 MB-os ablakkal). A kimenet
  15 bites csomagokban ül egy-egy UTF-16 karakteren (32 + érték). Így
  vezérlő- és helyettesítő-karakter (surrogate) sosem keletkezik.
- Ugyanazon a mentésen mérve: **1 125 312 → 135 966 karakter (×8,3)**.
  A tömörítés ≈ 64 ms, a visszafejtés ≈ 31 ms. Egy friss karrier ×5,4-et
  tömörít.
- **Biztonság:** minden kiírás előtt visszafejtjük a tömörített alakot, és
  csak akkor írjuk ki, ha karakterre ugyanazt adja vissza. Ha nem, a nyers
  JSON megy ki, ahogy eddig.
- A tömörített alak `MZ1~` jellel kezdődik. Ami nem így kezdődik, az nyers
  JSON-ként olvasódik, tehát minden régi mentés változatlanul betöltődik.
- A fájlba kimentés és az átviteli kód a **visszafejtett** mentést viszi.
  A fájl formátuma tehát nem változott, a régi fájlok visszatölthetők.
- Az olvasók egy helyen mennek át (`saveRawParse`):
  - `loadSavedGame`, `saveSlotList`;
  - a törlés ablaka, a profil visszamenőleges feltöltése, a diagnosztika;
  - a mérési napló.

### 2. A régi, nyers mentések egyszeri tömörítése

A betöltés után az első csendes pillanatban (`requestIdleCallback`) a
`tarTomoritMind` helyben összenyomja a régi verzió nyers mentéseit és
mérési naplóit. A tartalom karakterre ugyanaz marad. A kisebb érték kiírása
tele tárhely mellett is sikerül, mert a foglaltság csökken. **A felhasználó
meglévő karrierjei tehát a frissítés után maguktól töredékükre zsugorodnak.**

### 3. Tele tárhely: lépésenkénti takarítás (`tarVeszTakaritas`)

Ha egy írás elszáll, a játék a legkevésbé értékestől halad:

1. az üres, játékot nem tartalmazó mentési sorok (ez eddig is így volt);
2. a még nyers mentések és naplók tömörítése (a tartalom nem változik);
3. a mérési naplók meccsenkénti részletei a 2. idénytől. Az 1. idény
   részletes marad, az idény-összegzések is megmaradnak.

Utána még egyszer megpróbálja az írást.
**Karriert, Run-listát, profilt sosem töröl magától.**

A mentés (`saveWrite`), a Run-lista (`runBoardSave`) és a mérési napló
(`meresSave`) mind ezen az úton ír.

### 4. A figyelmeztetés

- A „Run-szintedet nem sikerült…” sor eddig minden mentésnél újra beíródott
  a naplóba. Mostantól betöltésenként egyszer jelenik meg.
- A sor most megnevezi a teendőt: a **Mentések és tárhely** ablakban a
  **🧹 Hely felszabadítása** gomb.

### 5. A tárhely-ablak

- Új „Mi foglal helyet?” doboz:
  - sáv a szokásos 5 MB-os keretből;
  - mentések (darabszám, ebből tömörítve), mérési napló, beállítások,
    Run-lista és profil.
- A **🧹 Hely felszabadítása** gomb kézzel futtatja a takarítást, és kiírja,
  mennyi szabadult fel. A felirat megmondja, hány nyers mentés vár még.
- A mentési sorokon 🗜 jelzi a tömörített tárolást.

## A tempó-csúszka

- **Logaritmikus sín (0–1000 → 0,1–3×).**
  - Eddig a lineáris sínen a gyakran használt 0,1–0,5× a sín első hetedébe
    szorult.
  - Most minden kétszerezés ugyanakkora út.
  - A fokozatok helye a sínen: 0,15 → 119 · 0,25 → 269 · 0,5 → 473 ·
    1 → 677 · 2 → 881.
- **Öt mágneses fokozat:** 0,15 · 0,25 · 0,5 · 1 · 2. A közelükben (±3% sín)
  a csúszka rájuk ugrik, és a sínen pöcök jelzi őket.
- **◀ ▶ a két szélén.**
  - Egy koppintás a szomszédos ajánlott fokozat.
  - Egyéni állásból (pl. 0,35×) a nyíl irányában a következő fokozatra lép.
  - A két szélső fokozaton (0,15× és 2×) a nyíl kiszürkül.
- Két fokozat között továbbra is állítható egyéni tempó. Ilyenkor a felirat
  szürke. A sín két vége (0,1× és 3×) húzással elérhető marad.
- Mindkét csúszkára érvényes: a meccsképernyőn és a kupa-felületen is,
  szinkronban. A stadion-nézet pirulája szélesebb lett a nyilak miatt.
- Az ütem képlete nem változott (`matchSpeedTickMs`). A tárolt érték
  ugyanaz a szorzó, mint eddig.

## Próba

`tools/tarhely-tempo-1-0-7-1-00-proba.js`:

- oda-vissza pontosság 68 eseten (ékezet, emoji, helyettesítő-karakter,
  ismétlődés, 337 ezer karakterig); sérült adatra kivétel;
- valódi karrier mentése és visszatöltése;
- a tárhely ténylegesen megtöltve: a mentés és a Run-lista írása a
  takarítás után sikerül, a régi nyers mentés karakterre ugyanaz marad,
  a mérési napló ritkul;
- a figyelmeztetés csak egyszer jön;
- a tárhely-ablak és a gomb;
- a csúszka: fokozatok, mágnes, léptetés, kiszürkülés, szinkron.

A régi próbák, amelyek a mentést nyersen olvasták a localStorage-ból,
`mzUnpack`-en át olvasnak. A csúszka értékét olvasók `matchSpeedFromPos`-szal
olvasnak.

## Kockázat

Egy **régebbi** játékverzió nem ismeri a tömörített alakot, és üresnek
látná a helyet. A fő HTML „network-first”: az első online betöltés után a
gyorsítótárban is az új verzió ül, így régi verzió a gyakorlatban nem fut
le újra.
