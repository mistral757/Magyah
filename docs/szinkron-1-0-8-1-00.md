# 🔄 Szinkron — a teljes profil eszközök között (1.0.8.1.00)

## A kérés

> „Azt a firestoreos szinkronizálást, amit a zsebőr appban megcsináltunk,
> építsük be a Magyahba is. Legyen lehetőség eszközök között teljesen
> szinkronizálni egy teljes profilt. Annak minden adatával: futó
> karrierekkel, roomokkal, beállításokkal, speciális játékosnevekkel,
> mindennel. A profilra kattintva rögtön felül legyen ott a szinkronizálás
> gomb. Arra kattintva felugrik a setup ablak. Abban minden úgy, ahogyan a
> zsebőr appban. Persze a stílust leszámítva."

## A felület

- **Profil → legfelül 🔄 Szinkronizálás.** A gomb alatt az állapot
  („✅ Szinkronban · 14:05”, „📴 Nincs internet…”, hibaüzenet).
- **A beállító ablak** a Zsebőr menetét követi:
  1. Firebase-beállítás (a konzolból bemásolt `firebaseConfig`);
  2. a) első eszközön **✨ Új szinkron indítása az itteni adatokkal** →
     megjelenik a **párosító link** (másolás, megosztás);
  3. b) második eszközön a **25 karakteres kód** + **Csatlakozás**, vagy
     egyszerűen a párosító link megnyitása.
  4. Csatlakozva: állapot, a kód (rejtve, „Mutasd”), **🔗 Párosító link**,
     **🔄 Szinkronizálás most**, **Leválasztás erről az eszközről**.
- **📖 Beállítás lépésről lépésre** lenyíló: az öt lépés a Firebase-konzolban,
  és a Firestore-szabályok szövege egy **📋 Másolás** gombbal.
- A párosító link akkor is működik, ha a játék már nyitva van ugyanabban a
  fülben (csak a `#sync=…` hash változik).
- A vissza gomb az ablak saját gombját nyomja meg (a részlapokon „Mégse /
  Vissza”, a főlapon „Bezár”).

## Mi utazik

A profil = a játék **teljes localStorage-a**: mindhárom egyjátékos hely, a
szoba-mentések és a szobák listája, a profil (becenév, azonosító, profilszint,
mesterség), a feloldások, az örök csúcsok, a Run-lista, a saját és a stylist
játékosnevek, a mez- és arc-beállítások, a mérési napló és minden beállítás
(téma, tempó, hang, …).

**Eszközhöz kötött, NEM utazik** (`SYNC_LOCAL_KEYS`):

| kulcs | miért |
|---|---|
| `magyah_sync_v1`, `magyah_sync_base_v1` | a szinkron saját beállítása és ujjlenyomatai |
| `harminc_nulla_sp_slot_v1` | melyik egyjátékos helyen játszottál utoljára *ezen az eszközön* |
| `30-0-push-sub-v1`, `magyah_ertesites_v1` | az értesítési feliratkozás eszközhöz kötött |
| `harminc_nulla_mp_rooms_v1` | a kétjátékos mód *helyi* tartalék-szimulációja (két fül, egy gép) |
| `ujvKesobb`, `toltoMs30_0` | a frissítési sáv „később” jelzője, a töltő eszközönkénti mérése |

## Hogyan működik

### Titkosítás és azonosítás

- A 25 karakteres kód (Crockford base32, 125 bit) a kulcs. Belőle (HKDF) jön
  az AES-GCM-kulcs, egy HMAC-kulcs és a dokumentum azonosítója. A kulcs soha
  nem hagyja el az eszközöket; a Firebase csak olvashatatlan adatot lát.
- Minden érték gzip + AES-GCM, a hitelesített kiegészítő adat a dokumentum
  és a darab azonosítója — egy darab nem cserélhető át egy másikra.
- A szabályok tiltják a listázást: kód nélkül a dokumentum meg sem található.

### A tárolás — darabolva

Egy Firestore-dokumentum legfeljebb 1 MiB, a profil 5 MB is lehet, ezért:

```
magyah/<40 hex>                       a fődokumentum: {v, rev, iv, z, data, by, at}
                                      data = titkosított jegyzék:
                                      { kulcs → {h: ujjlenyomat, p: darab-azonosító, n: darabszám, t: módosítás ideje, d: eszköz} }
magyah/<40 hex>_<p 16 jel>_<i>        egy érték i-edik darabja (≤ 900 000 karakter)
```

- Csak a megváltozott kulcs megy fel újra; a lecserélt érték darabjai a
  véglegesítés után törlődnek.
- A **darab-azonosító feltöltésenként új**, nem a tartalomból jön. Így két
  eszköz sosem írja ugyanazt a darabot, és a takarítás nem törölhet olyat,
  amire egy másik jegyzék még mutat.
- A jegyzék tranzakcióval íródik, a `rev` szigorúan eggyel nő (ezt a szabály
  is kikényszeríti).

### Az összefésülés — kulcsonként, háromutas

Egy karrier mentése nem fésülhető össze belül, ezért az egység a
localStorage-kulcs. Az utolsó közös állapotból csak a **kulcsonkénti
ujjlenyomat** él helyben (`magyah_sync_base_v1`) — a teljes másolat a
tárhely-keretet duplázná meg.

| helyzet | eredmény |
|---|---|
| csak itt változott | felmegy |
| csak a felhőben változott | lejön |
| mindkettőn, ugyanarra | semmi |
| itt törölték, ott szerkesztették (vagy fordítva) | a szerkesztés marad |
| mindkettőn, különbözően | a **később módosított** nyer (a helyi írás ideje a localStorage-figyelőből) |
| csatlakozáskor mindkettőn | a **közös (felhős)** nyer; a csak az új eszközön lévő kulcsok megmaradnak és felmennek |

A helyi írásokat egy figyelő látja (a `Storage.prototype` írói, csak a
localStorage-ra): ez adja a módosítás idejét, és 4 másodperc csend után
feltöltést indít. Háttérbe kerüléskor azonnal.

### A futó játék és az újratöltés

A játékállapot több száz globálisban ül (F7), ezért a másik eszközről érkező
változást nem cseréljük menet közben:

1. a változást előbb **letöltjük** (ha bármi elszáll, még semmi nem változott);
2. a mentés **megfagy** (`_saveFrozen`, és a figyelő minden írást elnyel);
3. kiírjuk a kulcsokat — kivéve azt, amit a játék közben maga is írt (az a
   következő körben ütközésként dől el);
4. a Firestore-kliens rendesen leáll, és a lap újratölt („🔄 Frissítés a
   másik eszközről…”).

- **Meccs közben** (`S.playing`) és a jutalom-lánc alatt nem töltünk le és
  nem töltünk újra: az állapot „⏸ vár”, a meccs után jön.
- **Sorozatos újratöltés ellen**: fél percen belül az ötödiknél már nem
  magától, hanem gombbal.
- Az induló lap első köre 3 mp-et (szinkron miatti újratöltés után 8 mp-et)
  vár, hogy az induláskori írások (tömörítés, a szobák listája) leülepedjenek.
- **Tele tárhely**: ha egy érték nem fér el, és semmi nem íródott ki, nem
  töltünk újra — az állapot megnevezi a 🧹 Hely felszabadítása gombot. Ha már
  valami kiíródott, újratöltünk (a memória elavult), és a következő kör a
  hiányzót újra megpróbálja.

### Két eszköz egyszerre

Ha a másik eszköz épp előttünk véglegesít, a szabály (`rev == régi + 1`) már
az új számhoz mér, és a Firestore `permission-denied`-et ad, nem ütközést.
Ezt felismerjük (a fődokumentum `rev`-je közben nőtt), és újratervezünk.

### A kapcsolat lezárása

Mérve az emulátoron (HTTP/1.1): a figyelő és az írás csatornája egy-egy
függő kérést tart nyitva. Ha a lap úgy tölt újra, hogy ezeket nem zárjuk le,
újratöltésenként kettő ott ragad, és a hostonkénti hat kapcsolat után a
következő lap írása percekig nem kap választ. Ezért újratöltés előtt
`terminate()`, lapelhagyáskor (`pagehide`) is; bfcache-ből visszatérve
(`pageshow`) újraindul. Valós hálózaton ugyanez a long-polling módnál
(proxy mögött) jönne elő.

## A Firebase-oldal

A szabályfájl: **`tools/firestore-szinkron.rules`** — ugyanez a szöveg a
játékban (`SYNC_RULES`), a beállító ablakból kimásolható. A próba összeveti a
kettőt.

- `get`: csak a fő- és a darab-azonosító formájára;
- `create`/`update` a fődokumentumra: csak a megadott mezőkkel, `rev` 1-gyel
  indul és egyesével nő, `at` = a szerver ideje;
- `create`/`update`/`delete` a darabokra (a darab-azonosító titok, a kódból
  származó előtaggal);
- `list`: tilos; minden más gyűjtemény zárva.

A szinkron a **saját** Firebase-projektedben él, a Spark (ingyenes) csomag
bőven elég. Lehet ugyanaz a projekt, mint a Zsebőré: a gyűjtemény neve más
(`magyah`), de **a szabályfájl a teljes Firestore-szabályt felülírja** — ha a
Zsebőr is ott van, a két `match` blokkot egy fájlba kell tenni.

## Próba

`tools/szinkron-1-0-8-1-00-proba.js` — 59 állítás, két külön böngészőprofil,
a valódi Firestore-emulátor a valódi szabályokkal (lásd a fájl fejkommentjét).
Benne egy valódi karrier: az A eszközön elindítva, a B eszközön bájtra
azonosan megérkezik, betölthető és folytatható.
