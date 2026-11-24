# 1.0.11.20.01 — Kezdő út, 7. fázis: csiszolás · a módválasztó lap kikerül · az edző tippje Rating nélkül

A terv: [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) (12. fejezet, 7. fázis: „nyelvi kör; a leckék hossza; a telefonos elrendezés; pixel téma”).
Előzmény: [kezdo-ut-zaro-1-0-11-20-00.md](kezdo-ut-zaro-1-0-11-20-00.md).

## Kérések
> (képpel, a „Indulhat a karrier · Hagyományos karrier” lapról) Közben annyit kérnék, hogy ez a
> képernyő teljesen kerüljön ki az egyenletből. Nincs rá szükség. Karrier indításkor egyből ezen
> belül legyünk már. A 2. képnél

> (képpel, a „👔 Az edző tippje: … (Rating 89)” sorról) Az edző ajánlatában ne legyen ott a
> rating. Azt ugyanis nem tudhatja a játékos ekkor még semmilyen módon. Ő csak POT-ot láthat max.

## 1. A módválasztó lap (`#scModeSelect`) kikerül az útból
A dinamikus mód kivétele (1.0.11.15.00) óta a lap egyetlen gombot kínált. A „Karrier indítása” egy késleltetett kattintással ugrotta át. A lap viszont a jelölésben alapból látszik, és minden olyan úton előjött, ahol a helyen nincs mentés:
- friss oldal;
- 🏠 vissza;
- üres helyre váltás;
- sérült mentés.

**Most központilag** (`modeSelectAtugor`, a lap és a kezdőlap-réteg osztályát figyelve): ha a lap látható, a kezdőlap-réteg (`#mpEntry`) nincs fölötte, és más fő képernyő sem látszik, egyenesen a hagyományos karrier gyors indítója jön.

**Nem lép:**
- a kezdőlap alatt (az a valódi kezdőlap);
- közös karrier vendégénél;
- párharc-szobában;
- ha bármely más képernyő már él.

**Hogyan viselkednek az utak:**
- A gyors indító „Vissza” gombja a kezdőlapra visz, nem pattan vissza.
- A lap ⚙ és 📊 gombja a kezdőlapon is megvan.

## 2. Az edző tippje a drafton — csak abból, amit a játékos lát
Eddig a tipp a rejtett Rating szerint választott, és ki is írta („Rating 89”). A drafton viszont a játékos csak „?”-et lát, felmérés után a POT-becslést. Most:
- **Felmérés előtt** senkit nem emel ki (az is elárulná a rejtett erőt). Általános tanács áll a lista tetején: *„előbb mérd fel a jelölteket (👁 Felmérés) — azt válaszd, akinek a legmagasabb a POT-ja, és lehetőleg a saját posztjára kerülhet.”*
- **Felmérés után** a felmértek közül a legmagasabb POT-ú kapja (a saját posztra kerülés kis előnyt ad), a becsléssel: *„…a felmért jelöltek közül neki a legmagasabb a POT-ja (~4230). Még 15 választható jelöltet nem mértél fel.”*
- Minden felmérés után újraszámol.

## 3. Csiszolás
- **Újdonság-értesítések:** a „🆕 Újdonság” sáv eddig szólt egy Kezdő út által még rejtett funkcióról (pl. „Megnyílt a scout-célzás”), amelynek a gombja nem is látszott.
  - A figyelők most a Kezdő út funkcióihoz vannak kötve (`UJ_KUT`): scout-célzás, sztárpiac, átigazolási esemény, ingyen scout-találat, scout, ügynökség, stáb, keret, lelátó.
  - A nyitás után ugyanez az azonosító új lesz, és akkor szól.
- **Nyelvi kör:**
  - a feladatok felszólító módban: „Hozz le egy meccset kapott gól nélkül”, „Maradj veretlen 3 meccsen át”, „Hozz le még egy meccset kapott gól nélkül”;
  - „A meccs **nemcsak** a számokon múlik”;
  - „Az edző és a meccs előtti **elemzés**”;
  - a megbízás gombjának teljes neve: „🧭 Megbízás módosítása”.
- **360 px és pixel téma:** a Kezdő út összes felülete (kártya, lecke-lap, várakozó sáv, erőmérleg, záró ablak, Vezetés-blokk) mindkét témában vízszintes túlcsordulás nélkül fér el (mérve és képen).
- **A leckék hossza:** mind ≤ 4 lépés (a 3. fázis próbája méri).
- **A nyitás- és a záró ablak** közös karrierben és párharcban soha nem jön elő. Egy egyjátékosból áthozott, függő nyitás nem foglalhatja el a közös megerősítő ablakot, amelyet például a kerethirdetés is használ.

## Próbák
- **`tools/kezdo-ut-csiszolas-1-0-11-20-01-proba.js` (új)**, amely ellenőrzi:
  1. a módválasztó útjait: indítás, vissza, egyedül, 1v1;
  2. az edző tippjét: Rating nélkül, felmérés előtt és után;
  3. az újdonság-kaput, és hogy minden Kezdő út-gombhoz kötött figyelő kapuzva van;
  4. a szövegeket;
  5. a 360 px-es pixel témát;
  6. hogy nincs oldalhiba.
- **A módválasztót és a kezdőlapot érintő régi próbák (83 db):**
  - mind átmennek, kivéve a `mez-stylist`-et, amely a Kezdő út előtt is ugyanígy bukott;
  - a párhuzamos terhelés alatt ingadozó jelenet- és meccspróbák (`esemeny-animacio`, `jelenet3d`, `kispad-mester`, `kerethirdetes`, `csapatszerepek`) terhelés nélkül újrafuttatva átmennek.
