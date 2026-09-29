# 🕹️ A negyedik téma: „Pixel” — terv

> „Készíts egy tervet egy 4. téma stílusra, ami megjelenésben jobban illene
> ehhez a zenéhez, amit most tettünk a játékba. Egy klasszik pixelated verzió
> lenne ez. Nyugodtan lehet sarkos, de azért színes, és mindenképp piiiixxxeeel"

## 0. Az egymondatos ígéret

Egy **8 bites konzoljáték** a zenéhez: pixelbetű, éles sarkok, kemény
árnyékok, élénk, korlátozott paletta. A mozgás is szaggatott, mint egy régi
kazettás játékban. **Az olvashatóság a sűrű táblákban sem sérül.**

## 1. Amire épül — és amit a mérés mutatott

A téma-rendszer már erre való:

* **Tokenek.** Egy téma egy `[data-theme="…"]` CSS-blokk (≈30 változó) és egy
  sor a `THEMES` listában. A választó, a kezdőlap sarkában álló témagombok és
  a mintasáv magától megjelenik.
* **Hangulat-rétegek.** A `--grain` (szemcse) és a `--glow`/`--glow-paint`
  (teljes képernyős festék) rétegek adottak. A noir vignettája is így készült.
* **A zene** WebAudio négyszög-/háromszöghullám és 8 bites zaj — NES-szerű
  chiptune. A téma ehhez igazodik, nem fordítva.

**A mérés** (3.9.164, `index.html`):

| mi | darab | mit jelent a pixel témának |
|---|---:|---|
| `border-radius` | 388 (ebből 100 inline stílusban, 29 kör) | a „sarkos” hatás nem jöhet témaváltozóból — globális felülírás kell |
| `box-shadow` | 101 | a lágy árnyékok helyére kemény, eltolt pixelárnyék |
| `linear-gradient` | 101 | színátmenet helyett sávos, lépcsős kitöltés (vagy tömör szín) |
| `transition` / `@keyframes` | 18 / 32 | a mozgás `steps()`-re vált |
| különböző hex szín | 617 | a legtöbb a témaváltozókon át jön; a JS-ből festett foltok (nehézség-chip, kártyaszintek, kupa-színek) maradnak — színes témában ez rendben van |

## 2. A megjelenés

### 2.1 Paletta — 16 szín, a régi konzolok módján

Egy **PICO-8-ihletésű** 16 színű készlet. Egy színpaletta nem védhető alkotás,
de a számokat úgyis a saját kontrasztmérésünk dönti el.

| token | szín | szerep |
|---|---|---|
| `--bg` | `#1d2b53` | mély éjkék alap (nem fekete — a „képernyő” színe) |
| `--panel` / `--panel2` | `#16214a` / `#26356a` | kártyák, panelek |
| `--line` | `#3b4b86` | 2 px-es keretvonalak |
| `--ink` | `#fff1e8` | törtfehér szöveg |
| `--dim` / `--dim2` | `#c2c3c7` / `#83769c` | másodlagos szöveg |
| `--gold` | `#ffec27` | kiemelés: sárga, mint a régi pontszámláló |
| `--grass` | `#00e436` | jó / győzelem |
| `--red` | `#ff004d` | rossz / vereség |
| `--blue` | `#29adff` | információ |
| `--purple` | `#ff77a8` | ritka / különleges (rózsaszín — a PICO-8 „neon” színe) |
| `--pos-gk/df/mf/fw` | sárga / kék / zöld / piros | poszt-színek |
| `--turf-a` / `--turf-b` | `#008751` / `#006a3f` | a gyep két sávja |
| `--badge-ink` | `#1d2b53` | szöveg a sárga gombokon |
| `--radius` | `0` | minden sarok éles |

Minden szöveg–háttér párt a próba **legalább 4,5:1**-es kontrasztra mér. Ahol
nem éri el (a rózsaszín és a halvány lila a panelen), ott a token sötétebb
árnyalatot kap.

### 2.2 Betűk — két pixelbetű, önhosztolva

* **Címek, számok, gombok:** *Press Start 2P* (OFL 1.1) — a klasszikus
  arcade-betű.
  * Csak rövid szövegre: nagyon széles.
  * A rácsa 8 px, tehát csak **8 / 16 / 24 / 32 px**-en éles. A téma ezekre a
    méretekre kerekít.
* **Törzsszöveg, táblák, napló:** *Pixelify Sans* (OFL 1.1, változó súly) —
  pixeles, de hosszú szövegben is olvasható.
  * Tartalék: *VT323* (OFL 1.1), ha a Pixelify a sűrű táblákban túl széles.
* **Kötelező ellenőrizni:** a magyar **ő / ű** (U+0150–0151, U+0170–0171) a
  `latin-ext` szeletben legyen meg. A próba `document.fonts.check`-kel és egy
  kirajzolt „Győző Űrhajó” mintával ellenőrzi, különben pótbetű ugrik be.
* **A betűk bekötése:**
  * a `/fonts` könyvtárba kerülnek (licenc az `OFL.txt`-be);
  * kapnak egy-egy `@font-face`-t (latin + latin-ext);
  * a `sw-1.js` `STATIC_ASSETS` listáját bővíteni kell, és léptetni a
    `CACHE_NAME`-et.
  * Külső kérés továbbra sincs.

### 2.3 Forma — „sarkos, de színes”

* **Minden sarok éles.** Egyetlen globális szabály:
  `[data-theme="pixel"] *{border-radius:0 !important}`, mert a 100 inline
  kerekítést más úton nem lehet elérni.
  * **A 29 kör is négyzet lesz:** poszt-korongok, pöttyök, smiley-háttér,
    témagombok. Ez pixel-hű, és így a legolcsóbb.
  * Kivételt csak ott teszünk, ahol a kör jelentést hordoz. Ilyet egyelőre
    nem találtunk; a képernyőképes próba dönti el.
* **Keretek:** 2 px-es tömör vonal, és a „lépcsős sarok” (notched corner) a
  kártyákon és gombokon. Két réteg `box-shadow`-val készül, a DOM-hoz nem
  kell nyúlni:
  `box-shadow: 0 -2px 0 0 var(--line), 0 2px 0 0 var(--line), -2px 0 0 0 var(--line), 2px 0 0 0 var(--line)`
  a sarok nélkül.
* **Árnyék:** a lágy árnyékok helyett kemény, eltolt pixelárnyék
  (`4px 4px 0 #000`).
* **Gombok:** vastag, színes, árnyékos „konzolgomb”.
  * Lenyomva 2 px-t lefelé mozdul, és az árnyéka eltűnik (`:active`) — mint
    egy fizikai gomb.
  * A fő gomb (Karrier indítása, Tovább) sárga, sötét felirattal.
* **Színátmenetek:** a 101 `linear-gradient` a legtöbb helyen tömör színre
  vált, a fontos helyeken 2-3 sávos, lépcsős kitöltésre (az eredményjelző, a
  kupa-színek, a kezdőlap fejléce).

### 2.4 Pixel-textúrák — a „piiiixxxeeel” réteg

* **Pásztázó sorok (CRT).** A `--glow-paint` egy
  `repeating-linear-gradient` (1 px sötét csík 3 px-enként, 6–8%
  átlátszósággal). Mozdulatlan, tehát nem meríti az akkumulátort.
  Kikapcsolható (lásd 4.2).
* **Raszter a szemcse helyett.** A `--grain` zajtextúrája helyett 2×2-es
  raszterminta (dither). Csak a nagy felületeken (kezdőlap, fejléc), finoman.
* **Pixelesítés.** Minden kép és canvas `image-rendering: pixelated`
  (címerek, vászon-rajzok). A pálya felfestése `shape-rendering: crispEdges`.
* **A gyep** sávos helyett sakktábla-mintás (8 px-es kockák a két zöldből).

### 2.5 Mozgás — szaggatottan, mint a régi gépen

* **A 32 animáció** `steps()` időzítést kap (4–8 lépés, ~8–12 képkocka/mp):
  a kezdőlap betűanimációja, a felúszások, a gól-villanás, a talizmán-húzás
  fordulása.
* **A 18 átmenet** azonnalira vagy 2 lépésesre vált.
* **„Pixel-fade”:** a panelek megjelenése nem áttűnés, hanem egy
  négylépcsős kockás maszk (`steps(4)` egy `mask-image`-en).
* **`prefers-reduced-motion`** esetén minden mozgás kikapcsol, a pásztázó
  sorok is.

### 2.6 Ikonok

Az emoji-k a rendszer betűivel rajzolódnak — nem pixelesek, és CSS-szel nem
is tehetők azzá. Két lépcső:

1. **Most:** az emoji-k maradnak. A keretük, háttérlapjuk és méretük
   rácsra kerül (16 / 24 / 32 px), így „tárgyként” ülnek a pixelvilágban.
2. **Később (kreatív munka):** a leggyakoribb ~20 ikonból **saját pixel-sprite**
   inline SVG-ben (`crispEdges`, 16×16-os rács). Csak ebben a témában
   cserélődnek.
   * Első körben: labda, kupa, fogaskerék, grafikon, pajzs, kesztyű, cipő,
     csillag, villám, szív, érme, lakat, talizmán-kő.

## 3. Képernyőnként — mit kell külön megnézni

| terület | teendő |
|---|---|
| **Kezdőlap** (`#mpEntry`) | a „MAGYAH” cím *Press Start 2P*-ben, kemény színes árnyékkal (sárga betű, piros + kék eltolt árnyék, mint egy címképernyőn); villogó „PRESS START” jellegű alcím a gomb alatt (`steps(2)` villogás, 1 mp); a sorok (karrierutak, Beállítások, Keretek) pixel-panelek; a statisztika-számok pontszámláló-stílusban |
| **Fejléc, HUB** | kártyák lépcsős sarokkal, a fülek „cartridge”-címkék; a nehézség-chip és a kártyaszint-csíkok maradnak színesek |
| **Pálya** | sakktábla-gyep, négyzetes poszt-korongok, crispEdges felfestés |
| **Eredményjelző** (`#sbBoard`, kupa-színekkel) | LED-kijelző: a számok *Press Start 2P*-ben, a kupa-színek sávos, lépcsős kitöltéssel; a Hiper Szuper Kupa lila sheen-je `steps()`-re vált |
| **Meccs-napló** | *Pixelify Sans*, sorköz +2 px; a gól-sorok villanása 2 lépcsős |
| **Talizmánok** | a ritkasági körvonal (bronz / ezüst / arany / szivárvány / Mítosz sötét-arany) pixel-keret; a szivárvány 6 tömör sávból áll, nem színátmenet; a húzásnál a fordulás 6 képkockás |
| **Modálok** (Beállítások, Keretek, megerősítők) | ablak-keret dupla 2 px-es vonallal, a címsor „ablakfejléc”-sávban (mint egy RPG-párbeszéd), a háttér raszteres sötétítés |
| **Grafikonok** (fejlődési görbe, SVG-k) | `crispEdges`, a vonalak 2 px-esek, a pontok négyzetek |

## 4. A beállítások

### 4.1 A témaválasztó

A `THEMES` lista negyedik tagja:

```js
{id:"pixel",label:"▦ Pixel",desc:"8 bites konzol: pixelbetű, éles sarkok, 16 szín — a zenéhez."}
```

A kezdőlap sarkában is megjelenik (`renderHeTheme`), és a Beállítások
mintasávja is magától mutatja.

### 4.2 Két kis kapcsoló (csak ebben a témában)

* **Pásztázó sorok** — be / ki. Alapból be; mobilon, kis fényerőn zavarhat.
* **Szaggatott mozgás** — be / ki. Alapból be; a reduced-motion mindkettőt
  felülírja.

Mindkettő `localStorage`-ban él, a téma mellett.

### 4.3 Zene és téma — összekötés (opcionális)

Ha a pixel témát választod és a zene ki van kapcsolva, egyszer felkínáljuk:
„Ehhez a témához szól a legjobban a zene — bekapcsolod?” Csak felajánlás,
automatikusan semmi nem kapcsol be.

## 5. Ütemterv

| fázis | tartalom | próba |
|---|---|---|
| **P1 — alapok** | a betűk (letöltés, `@font-face`, `OFL.txt`, sw-cache), a tokenek, a `THEMES` sor, globális éles sarok, kemény árnyékok, gombok | betű-lefedettség (ő/ű), kontraszt minden token-párra, a témaváltás mentése / visszatöltése |
| **P2 — kezdőlap és fejléc** | címképernyő, sorok, statisztika, a fejléc chipjei | képernyőkép 430×900-on és fekvő telefonon |
| **P3 — pálya, eredményjelző, napló** | sakktábla-gyep, négyzetes korongok, LED-eredményjelző, napló-tipográfia | képernyőkép meccs közben; a gól-villanás lépései |
| **P4 — kártyák és ablakok** | talizmán-keretek, húzás-animáció, modálok, HUB-kártyák, grafikonok | képernyőkép a húzásról, egy modálról és a HUB-ról |
| **P5 — textúrák és mozgás** | pásztázó sorok, raszter, `steps()`, pixel-fade, a két kapcsoló, reduced-motion | a kapcsolók működnek; reduced-motion mellett nincs animáció |
| **P6 — pixel-ikonok** (kreatív) | ~20 saját sprite, csak a pixel témában | az ikonkészlet teljes, és a többi témában változatlan |
| **P7 — lezárás** | súgó-bejegyzés, doksi, teljes regresszió; a meglévő képernyőkép-próba negyedik témával bővül | teljes regresszió |

A **P1–P3 önmagában is kiadható** („Pixel” téma, ikonok nélkül). A P6 a
legnagyobb kreatív munka, és függetlenül is jöhet később.

## 6. Kockázatok

* **Olvashatóság.** A pixelbetűk kis méreten nehezek. Ezért csak a címek
  kapnak *Press Start 2P*-t; a törzs *Pixelify Sans* marad, és a téma a
  legkisebb betűméretet 12 px-re emeli. A sűrű táblákat (tabella, piac,
  keretlista) a P3–P4 képernyőképein kell ellenőrizni.
* **Szélesség.** A pixelbetűk szélesebbek: a gombfeliratok, chipek és
  fülcímek kilóghatnak. A globális `letter-spacing: 0` és a kisebb címméret
  kezeli. A 430 px-es és a fekvő nézet képernyőképe a próba része.
* **A globális éles sarok** a fix pozíciójú rétegekre nem hat (nem
  `transform`/`filter`), tehát a noirnál látott horgony-hiba itt nem jöhet
  elő.
* **Méretnövekedés.** A két új betű együtt ~60–90 kB.
  * A böngésző csak akkor kéri le őket, ha a pixel téma használja.
  * A service worker viszont az offline működéshez a telepítéskor előre
    letölti a teljes betűkészletet. Ez egyszeri, kis költség.
  * Ha ez sok, a két betű kimarad a `STATIC_ASSETS`-ből, és az első
    használatkor kerül a gyorsítótárba.

## 7. Döntések, amik tőled kellenek

1. **Betűpár:** *Press Start 2P* + *Pixelify Sans* (ajánlott), vagy a
   „terminálosabb” *Press Start 2P* + *VT323*?
2. **Paletta:** a PICO-8-ihletésű éjkék alap (ajánlott), a NES-es fekete
   alap élénk színekkel, vagy egy Game Boy-os négy zöld? Az utóbbi nem
   „színes”, ezért csak alternatívaként.
3. **Pásztázó sorok** alapból be vagy ki?
4. **Pixel-ikonok (P6)** most, a témával együtt, vagy később külön körben?
5. **Legyen-e a pixel az alapértelmezett téma** az új telepítéseknél? Ma a
   „Törtfehér” az.
