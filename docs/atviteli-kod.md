# Átviteli kód — a mentés másik eszközre (3.9.65)

Kérés: eszközök közötti átvitel. A választott út: **kód, nem fiók**.

## Miért nem e-mailes bejelentkezés

A kért funkció az **átvitel**, nem a bejelentkezés. A fiók három dolgot hozna
magával, amiből egyik sem az átvitel:

1. **személyes adatot** (e-mail-cím) — tájékoztató-átvezetés, új jogalap,
   megőrzési idő;
2. **Play-kötelezettséget** — ha az alkalmazás fiókot hoz létre, kell
   alkalmazáson belüli fióktörlés ÉS egy nyilvánosan elérhető, törlést kérő
   webes URL, plusz a Data safety űrlap újratöltése;
3. **jelszó- vagy levél-folyamatot** — regisztráció, elfelejtett jelszó,
   kézbesíthetőség.

Az átvitel maga egyikbe sem kerül. A kiadás előtt ez a különbség nem elvi:
a fiók a **kiadási lépéslistát** hosszabbítaná meg, nem a fejlesztést.

## A gépezet nagy része megvolt

A mentés-boríték (`saveExportEnvelope`), a felismerése (`saveImportParse`) és a
visszatöltés kérdező folyamata (`openSaveImportFlow`) a **fájlos kimentéshez**
épült — és pontosan ez kell ide is. Az átvitel ennyit tesz hozzá: a boríték
fájl helyett egy **kód alá** kerül fel, és onnan jön vissza.

**A beolvasó ág betűre ugyanaz.** A felhő nem kap külön jogot: a lehozott
mentés ugyanabba a kérdező folyamatba fut, amelyik megmutatja, mi van a
csomagban, hova kerülne, és csak külön megerősítésre ír. Egy kóddal sem lehet
némán felülírni egy sokszezonos karriert.

## A kód

- **8 karakter**, a félreolvashatatlan ábécéből: `ABCDEFGHJKMNPQRSTUVWXYZ23456789`
  — nincs benne **0, O, 1, I és L**. 31 karakter, 8 hosszan: 8,5·10¹¹
  lehetőség, végigpróbálni nem lehet.
  *(Az `L`-t a próba találta meg: a hibaüzenet már kimondta, hogy nem
  szerepelhet, az ábécében viszont még ott állt — egy ilyen eltérés pont a
  telefonba diktált kódnál bosszulja meg magát.)*
- Kiírva kötőjellel (`UU6A-BVPX`), beírva kötőjel, szóköz és kisbetű is jó.
- **Nem „javítunk" hasonló karaktereket**: egy beírt `0`-ra nincs helyes csere,
  mert a `O` sincs az ábécében. Találgatni rosszabb, mint kimondani, hogy az a
  karakter nem szerepelhet a kódban — a hibaüzenet meg is nevezi, melyik.

## Három védelem a kódon

A kód **maga a kulcs**: aki ismeri, hozzáfér a mentéshez — ugyanaz az elv, mint
a szobakódnál. Ezért:

1. a kód kitalálhatatlan (lásd fent);
2. **24 óra után lejár**, és a lejáratot az **adatbázis-szabály** tartja be, nem
   a kliens: a lejárt bejegyzés olvashatatlan, akkor is, ha valaki a kódot
   megszerezte;
3. sikeres behozatal után a kliens **azonnal törli** a bejegyzést.

## Tömörítve megy

Mérve: a pakolt karrier-készlet **254 kB**, gzippel **91 kB**. A feltöltés a
böngésző natív `CompressionStream("gzip")`-jét használja, base64-esítve; ahol ez
nincs (régi böngésző), nyersen megy fel, és a rekord `z` mezője megmondja,
melyik. A kicsomagolás bitre ugyanazt adja vissza — a próba ezt méri.

A base64 nagy tömbre nem írható egy hívással (`String.fromCharCode(...t)` egy
negyedmilliós tömbön vermet borít), ezért 32 kB-os darabokban megy.

## A méretplafon két helyen áll

`XFER_MAX_CHARS = 1 500 000` a kliensben **és** ugyanez a szám a
`tools/firebase-rules.json` `mp/xfer/$code/d` ágán. A kettő eltérése némán
hibás feltöltést szülne — pontosan az a hibaosztály, ami a push-feliratkozás
900/1200-as eltéréséből már egyszer megvolt. A próba **összeveti a kettőt**.

## Teendő a kiadás előtt

A frissített **`tools/firebase-rules.json`-t közzé kell tenni** a Firebase
konzolban. Amíg nem történik meg, a feltöltés `PERMISSION_DENIED`-del bukik — a
játék ezt ki is mondja:

> a feltöltés nem sikerült — az adatbázis visszautasította, a frissített
> szabályfájl valószínűleg még nincs közzétéve

Ez a ház visszatérő néma hibája (lásd a tempó-mező és a push-mező történetét),
ezért kap külön üzenetet.

## Adatvédelem

A tájékoztató **4.4** szakasza mondja ki: mi megy fel (a mentés, tömörítve, és
egy időbélyeg), mi **nincs** benne (e-mail, telefonszám, fiók, eszközazonosító),
hogy a kód maga a kulcs, és hogy 24 óra után lejár. A nyitó összefoglaló és a
megőrzési idők szakasza is bővült. Fiók nincs, tehát a Play fióktörlési
követelménye **nem** aktiválódik.

## A felület

A **Mentések és tárhely** ablakban:

- minden mentés-soron a `⬇` (fájlba) mellé került egy **`☁`** — ez ad kódot;
- alul a fájlos visszatöltés mellé egy **„☁ Behozatal átviteli kóddal"** gomb.

Mérés: `tools/atviteli-kod-proba.js` — 22 állítás.
