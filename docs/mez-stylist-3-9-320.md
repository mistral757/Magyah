# 🎽 Az ellenfél meze: meccs előtti stylist-ablak (3.9.320)

## A kérés

> „Aki bejelöli, hogy stylistkedik szívesen a játékban, az kapjon lehetőséget
> minden meccs előtt, amit játszik, gyorsan beállíthassa az ellenfél mezét.
> Amit beállít, az onnantól annak a csapatnak a globál, játékba
> alapértelmezettként beépített mez lesz, akárcsak az így elkészített
> játékoskinézetek. Minden meccs előtt legyen egy ilyen felugró ablak, olyan
> előtt is, amelyiknek már beállította. Legfeljebb rányom, hogy most nem
> akarja beállítani."

## A kapcsoló

**A helye:** a profil alján, a stylist-mód sorában (a „szutykos stylist
vagyok” kulcsszó után látszik):

> 🎽 **Szívesen stylistkedem:** minden meccs előtt beállíthatom az ellenfél
> mezét.

**Miért csak stylist-módban:** ami itt születik, az a közös listára megy,
ugyanazon az úton, mint a játékoskinézet.

**Tárolás:** böngészőnként, a mentéstől függetlenül (`mezStylist30_0`).

## Az ablak

**Mikor jön:** minden saját meccs kezdőrúgása előtt (bajnoki, kupa,
osztályozó), egyjátékosban és közös karrierben is.

**Mikor nem jön:**

* automatikus végigjátszásnál;
* a közös karrier párharcában, mert ott a társ csapata az ellenfél;
* egy megszakadt meccs folytatásánál;
* ugyanannak a meccsnek egy második kezdőrúgásánál.

**Akkor is felugrik, ha a csapatnak már van beállított meze.** Ezt az ablak
kiírja, és a mez át is írható.

**Mit lehet beállítani:**

* alapszín és második szín (a klubszín-paletta);
* a szám és a gallér színe;
* minta, ujj, gallér (a mezszerkesztő listái);
* élő előnézet mutatja az eredményt.

**A gombok:**

* **„💾 Mentés — ez lesz a csapat meze”**;
* **„Most nem — indulhat a meccs”**;
* ha már van beállított mez: **„↺ Vissza a sorsolt mezre”** (a közös
  listáról is).

**A döntés után** a meccs ugyanúgy indul, mint ablak nélkül.

## Klub vagy klub-szezon

> „legyen egy külön setting, hogy amikor beállítod, akkor azt csak a
> klub-szezonra, vagy a teljes klub minden szezonjára akarod beállítani. És
> ha egy csapatnak van már egy teljes minden klubra vonatkozó, attól még
> lehessen egyes klub-szezonokra attól eltérő, a többin meg a globál"

**A választó.** Az ablakban a „Mire szóljon?” sor két lehetőséget ad:

* **„Csak erre a klub-szezonra (1990/91)”**;
* **„A klub minden szezonjára”**.

**Melyik mez látszik:** ha az adott klub-szezonnak saját meze van, az; ha
nincs, a klub mindenkori meze; ha az sincs, a sorsolt.

* **Példa:** a klub minden szezonjára zöldet állítasz, az 1990/91-es
  idényére pirosat. Az 1990/91-es csapat piros, minden más idénye zöld.

**Alapértelmezés:** a választó arra a szintre áll, ahol már van mez (a
klub-szezoné elsőbb), különben a klubra. Szintváltáskor betölti annak a
szintnek a meglévő mezét.

**Törlés:**

* a klub-szezon szintjén: **„↺ A klub-szezon saját mezének törlése (a klubé
  marad)”**;
* a klub szintjén: **„↺ Vissza a sorsolt mezre”**.

**Szezon nélküli csapatnál** (például a piramis kitalált klubjainál) a két
szint egy, ilyenkor nincs választó.

**A közös listán** a két szint két külön bejegyzés: `mez:<klub>` és
`mez:<klub (szezon)>`. Mindkettő hash-kulcsként kerül a repóba.

## Hol hat a mez

**Mindenhol, ahol az ellenfél meze látszik:** az animációkban és az élő
meccsképen. Ezt egy közös függvény adja (`evaEllenfelKit`).

**A sorrend:**

1. a saját gépen mentett mez (azonnal);
2. a közös lista (`MEZ_ALAP`, a napi beépítésből);
3. a névből sorsolt mez (tartalék).

**Ütközés:** ha a beállított mez alapszíne túl közel esik a mi mezünkhöz, az
ellenfél a **váltómezét** kapja: világos alap, a klub színével.

**A kulcs** a szinttől függ (lásd fent).

## A közös lista

**Feltöltés:** a mentés a meglévő stylist-csatornán megy fel
(`stylist/<uid>/<kulcs>`). Kapcsolat nélkül sorba áll.

* **Megkülönböztetés:** `v:2`, és a név `mez:` előtagot kap. A kulcs a
  `mez:<csapat>` hash-e, így a játékoskinézetekkel nem keveredik.
* **A Firebase-szabályt nem kell módosítani.**

**Napi beépítés:** a `tools/stylist/beepit.js` ugyanabban a futásban a
`MEZ-ALAP:KEZD … MEZ-ALAP:VEG` blokkba írja a mezeket.

* **Csak a kulcs (hash) és a mez kerül a repóba,** csapatnév nem.
* **Szűrés:**
  * a kulcs a névből számolt;
  * a színek `#rrggbb` alakúak;
  * a minta, az ujj és a gallér a játék saját listájából való;
  * az ismeretlen mező kimarad;
  * csapatonként a legfrissebb bejegyzés dönt;
  * az üres bejegyzés törlés.

## Próba

`tools/mez-stylist-3-9-320-proba.js`, 24 állítás:

* a kapcsoló;
* az ablak, a mentés és a feltöltés formája;
* az ismételt ablak, a „Most nem”, az ütközés, az automatikus játék és a
  törlés;
* a klub és a klub-szezon szintje (felülírás, visszaállás, feltöltött nevek);
* a napi beépítés és a beépített lista betöltése;
* nincs oldalhiba.
