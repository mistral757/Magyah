# Terv — saját üzenet, videó, hang és GIF a meccsközvetítés eseményeire

> „Az megoldható lenne, hogy testreszabhatóvá tegyük a játékban, hogy a
> meccsközvetítés minden típusú promptjára behozhasson valami személyre
> szabott üzenetet, vagy akár egy konkrét videót, hangot, gifet, amit
> feltöltesz egy telefonon tárolt helyi mappába, ahonnan a game olvashat, és
> azt lejátssza mindig, amikor az az esemény történik, és ki lehessen
> választani, hogy esemény előtt vagy után stb" — „Ezt mentsük el későbbre.
> Legyen egy doksi, ami ennek a felépítését leírja, ha később be akarnánk
> vezetni."

**Állapot:** terv. Kód még nincs. Ez a dokumentum a későbbi bevezetés
alapja.

---

## 1. A korlát, amiből a felépítés következik

A játék böngészőben fut (PWA). Egy weboldal **nem figyelhet magától egy
mappát** a telefonon:

| Lehetőség | Asztali Chrome/Edge | Android Chrome | iPhone Safari |
|---|---|---|---|
| Mappa-hozzáférés (File System Access API, `showDirectoryPicker`) | ✅ | ❌ nem megbízható | ❌ |
| Fájlválasztó (`<input type="file" accept="video/*,audio/*,image/*" multiple>`) | ✅ | ✅ | ✅ |
| Tárolás a böngésző saját tárában (IndexedDB, Blob) | ✅ | ✅ | ✅ (kilakoltatható, lásd 6.) |

**A döntés:**

* A fájlokat a felhasználó **egyszer feltölti** a fájlválasztóval.
* A játék a saját tárába (IndexedDB) menti őket, és mindig onnan játssza le,
  offline is.
* Gyakorlatban ez ugyanaz, mint a mappa, csak a fájlt egyszer „be kell
  húzni”.
* Asztali Chrome-on később választható ráadás a mappa-csatolás: egy
  kijelölt mappa tartalmát a játék indításkor szinkronizálja a tárba.

---

## 2. Mire köthető (az esemény-kulcsok)

**Az alap a közvetítés esemény-modellje (`MEV_TIPUS`).** Minden kiemelt
eseménynek van típusa, és ugyanez dönti el az animációt is:

| Csoport | Kulcsok |
|---|---|
| Gólok | `gol`, `golKapott` |
| Gól-fajták (`ev.alt`, `MEV_GOL_ALT`) | `fejes`, `szabadrugas`, `tizenegyes`, `potya`, `ongol`, `csere` (a padról), `hosszabbitas`, `letamadas` |
| Gól-jelzők (`MEV_GOL_EXTRA`) | `mesterharmas`, `negy`, `ot`, `hat` |
| Pontrúgás, védekezés | `tizenegyes`, `buntetoparbaj`, `kapufa`, `bravur`, `vedes`, `golvonal`, `blokk`, `szereles` |
| Fegyelem, egyéb | `piros`, `sarga`, `var`, `serules`, `busz`, `letamadas`, `szoglet`, `szabadrugas`, `bedobas`, `loves`, `kidolgozas` |
| Skill-jelenetek (`EVA_SKILL_SABLON`) | pl. `mf_elastico`, `sp_bolt`, `fw_cannon`, `mf_fk` |
| Meccs-keret (új, nem esemény-típus) | `kezdoRugas`, `felido`, `lefujasGyozelem`, `lefujasDontetlen`, `lefujasVereseg` |

**Szűrők** (választhatók, egy szabályon belül „és” kapcsolattal):

* **oldal:** saját / ellenfél / mindegy;
* **játékos:** egy konkrét név a saját keretből (például „ha Ronaldinho lő
  gólt”);
* **sorozat:** bajnoki / kupa / párharc / mind;
* **perc-sáv:** például csak a 85. perc után („a hajrá gólja”).

**Egy szabály felépítése:**

```js
{ id, aktiv:true,
  esemeny:"gol",            // a kulcs
  alt:null,                 // pl. "fejes" — null = minden fajta
  oldal:"us",               // "us" | "them" | null
  jatekos:null,             // név | null
  sorozat:null,             // "liga" | "kupa" | "parharc" | null
  perc:[0,120],
  mikor:"utana",            // "elotte" | "utana" | "helyette" | "alatta"
  media:[ "m_3f2a…", … ],    // a tár kulcsai; több → véletlen választás
  szoveg:"{jatekos} megint betalált a {perc}. percben!",
  hangero:0.8,
  maxHossz:8 }              // másodperc, utána magától tovább
```

**Ha több szabály illik egy eseményre**, a legszűkebb nyer: a konkrét
játékos előbb, mint az oldal, az oldal előbb, mint a „mindegy”. Ha a
szűkség egyenlő, a lista sorrendje dönt.

---

## 3. Mit lehet hozzárendelni

| Fajta | Formátum | Megjegyzés |
|---|---|---|
| **Szöveg** | sablon behelyettesítéssel: `{jatekos}`, `{perc}`, `{ellenfel}`, `{eredmeny}`, `{golszam}`, `{csapat}` | a meglévő `shortName` / `teamLabel` szűrőkön át — a nyers névkiírás-őr (`check.sh`) ugyanúgy él |
| **Hang** | mp3, m4a/aac, ogg, wav | `<audio>`, vagy a meglévő hangrendszer keverőjén át (`hangMeccsNezett`) |
| **Videó** | mp4 (H.264/AAC), webm | `<video playsinline>`; iPhone-on mp4 kell |
| **GIF / kép** | gif, webp, png, jpg | `<img>`; a GIF magától fut, a kép `maxHossz`-ig marad |

Egy szabályhoz **több fájl** is tartozhat: minden alkalommal véletlenül
választ közülük. A véletlen a meccs seedjétől független, tehát a meccs
kimenetéhez nem nyúl.

---

## 4. Mikor szól — és hogyan illeszkedik a közvetítésbe

A közvetítés már ma is tud **várni**:

* a kiemelt jelenet (animáció) alatt a közvetítés sorai pufferben várnak
  (`_kozv`);
* a jelenet végén (`evaLezar`) folytatódik;
* a jelenetek sorban jönnek (`_evaSor`, `evaKer`).

A saját média ugyanebbe a sorba illeszkedik, egy új jelenet-fajtaként
(`media`):

| `mikor` | Mit csinál |
|---|---|
| `elotte` | a média-jelenet az animáció **előtt** kerül a sorba |
| `utana` | **után** |
| `helyette` | az animáció **helyett** (az esemény szövege ugyanúgy megjelenik) |
| `alatta` | csak hangnál: az animációval **együtt** szól (a játék saját gólhangja helyett vagy mellett — kapcsoló) |

**A lejátszó** (`#evMedia`, az `#evAnim` testvére, ugyanazzal a kerettel):

* „Tovább ›” gomb, és koppintásra átugrik, mint az animáció;
* a „Ne mutasd többet ezen a meccsen” itt is működik;
* `maxHossz` után magától tovább lép, és akkor is, ha a fájl nem játszható
  le (hiba → csendben tovább, a napló egy sorban jelzi);
* **végigjátszásnál (`S.auto`) és gyors tempón** nem szól, ugyanazzal a
  szabállyal, mint az animáció (`mevAnimBe`, `mevKeret`);
* **párharcban** csak a saját gépen szól. A két gép eredménye ettől
  független: a média csak a megjelenítést tartja fel, a meccs sorsolását
  nem.

**A meccsóra** a média alatt áll, pontosan úgy, mint a jelenetek alatt. A
meccs kimenetéhez nem nyúl: a gólok a lefújás előtt már ki vannak sorsolva.

---

## 5. A beállító felület

**Helye:** Beállítások → 🎬 Saját közvetítés. Rövid gyorslink a meccs
közbeni animáció-kapcsoló mellé.

* **Szabálylista:** esemény-ikon, név, szűrők, időzítés, médiák
  bélyegképe; be/ki kapcsoló; húzással sorba rendezhető.
* **Új szabály, lépésenként:**
  1. esemény;
  2. szűrők;
  3. média (fájl feltöltése vagy a meglévők közül) és/vagy szöveg;
  4. időzítés;
  5. **▶ Előnézet** egy kitalált eseménnyel.
* **Médiatár:** a feltöltött fájlok mérettel, és hogy hány szabály
  használja; törlés; a foglalt hely és a böngésző által adott keret
  (`navigator.storage.estimate()`).
* **Export / import:** a szabályok és a fájlok egy csomagban (zip), hogy
  másik eszközre átvihetők legyenek.

---

## 6. Tárolás és határok

* **IndexedDB adatbázis:** `30-0-media-v1`, két tárolóval:
  * `fajlok` — kulcs `m_<hash>`, érték `{blob, tipus, nev, meret, hossz, at}`;
  * `szabalyok` — a fenti objektumok.
* **Nem a mentésben** él: a karrier mentése kicsi marad. A szabályok a
  profilhoz (böngészőhöz) tartoznak, minden karrierre hatnak.
* **Tartós tár:** az első feltöltéskor `navigator.storage.persist()` kérés.
  Enélkül iPhone-on a böngésző kilakoltathatja a tárat, ha a játékot
  hetekig nem nyitod meg. Ha ez megtörténik, a szabály megmarad, a fájl
  helyén „hiányzik — töltsd fel újra” áll.
* **Méretkorlát:** fájlonként alapból 20 MB, összesen a böngésző keretének
  legfeljebb 50%-a. A videó hosszát feltöltéskor kiolvassuk, és 15 mp fölött
  figyelmeztet.
* **Tömörítés:** a játék nem tömörít (böngészőben drága és lassú), csak
  figyelmeztet, és javasol egy formátumot.

---

## 7. Böngésző-sajátosságok

* **Hangos lejátszás:** a böngésző csak felhasználói koppintás után enged
  hangos médiát. Meccs közben ez mindig teljesül (a kezdőrúgás koppintás),
  és a hangrendszer már ma is így oldja fel a hangkártyát. Ha mégis
  tiltaná, a videó némán megy, és egy 🔇 jel mutatja.
* **iPhone:** `playsinline`, mp4 (H.264), és teljes képernyő nélkül, a
  jelenet keretében.
* **Pixel téma:** a média a téma keretében jelenik meg, de a tartalmat nem
  pixelesítjük.

---

## 8. PvP

* **Első változat:** mindenki a saját gépén, a saját szabályaival. A társ
  semmit nem lát belőle, és semmi nem utazik a szobán át.
* **Későbbi ráadás** (ha kell): „megosztott klipek” — a fájl a Firebase
  Storage-ba kerül, a szoba csak a hivatkozást viszi. Ehhez kell:
  * tárhely-szabály (méret, csak a szoba két tagja olvashatja);
  * a feltöltő hozzájárulása;
  * moderáció nincs, ezért csak a két játékos között, nyilvánosan soha.

---

## 9. Bevezetési lépések

1. **Tár és lejátszó.** IndexedDB, a `media` jelenet az `_evaSor`-ban, a
   négy időzítés, átugrás, auto/gyors tempó kizárása. Próba: egy kitalált
   esemény mindegyik időzítéssel, hiányzó és hibás fájl.
2. **Beállító felület.** Szabálylista, varázsló, médiatár, előnézet.
   Próba: létrehozás, szerkesztés, törlés, a tár mérése.
3. **Szűrők és sablonszöveg.** Oldal, játékos, sorozat, perc; több fájl
   véletlenszerűen; a legszűkebb szabály nyer.
4. **Export / import**, tartós tár kérése, a kilakoltatás kezelése.
5. *(opcionális)* Mappa-csatolás asztali Chrome-on; megosztott klipek PvP-ben.

Az 1–2. lépés már önmagában teljes értékű funkció.

---

## 10. Amihez nem nyúl

* **A meccsmotor, a sorsolás, a seed:** a média kizárólag megjelenítés.
* **A mentés és a mérési napló:** a szabályok a böngészőhöz tartoznak, nem
  a karrierhez.
* **A nyilvános repó:** a feltöltött fájlok soha nem kerülnek se a repóba,
  se a Firebase-be (a 8. pont ráadásáig).
