# 🧭💡 A tanítás szélei: takarás, szakaszvég, „Hol?”, ajánlás, felfedezés — 1.0.12.2.00

> KIMONDOTT KÉRÉSEK ÉS BEJELENTETT HIBÁK (képekkel):
> - „az edzésterv tanító üzenet miatt nem lehet lezárni az edzés kiválasztása műveletet. És amikor teljesült a 3. meccs után minden a tanító szakasz második szintjéből, akkor nem szólt a játék. Kellett volna legyen egy figyelmeztetés, sőt, oda kellett volna vigyen azonnal, nehogy játsszak tovább enélkül. Amit ezen látsz problémákat, azt mindenhol ellenőrizd és javítsd. Plusz nem tetszett, hogy az edzéstervnél nem volt elmagyarázva, mit érdemes választani. El kellett volna mondani, hogy a mostani taktikámhoz mit érdemes fejleszteni és megmutatni, hogy a játékosaimra milyen hatással lesz, hogyan javítja majd a taktika illeszkedést, ha edzek. Ugyanez majd az összjátéknál is jól jönne."
> - „Itt pedig a hol? Nem jó helyre visz. A menüt nyitja meg. Pedig egy játékoshoz kéne odavigyen, lenyitásra sarkalljon, megmutassa, mit kell megnyomni”
> - „A hol? cuccok több helyen nem működnek. Nem kapunk nagy kiáltó értesítést arról, amikor befejezünk egy tanítási fázist. Vagy késéssel kapjuk meg. […] hiába állítottam a csúszkákon, nem pipálódott ki”
> - „Itt sem kaptunk értesítést arról, hogy mi ez a scout által talált játékos dolog. És ez a felület jobban nézne ki, ha arccal, ratinggel lenne ez a kis felugró ablak. És legyen inkább felugró ablakban ezentúl. Ahogyan a skill jutalom, kémiaépítések, és minden meccs utáni dolog”

**Minor:** új, látható rendszerek: ajánlás az edzéstervhez és az összhanghoz, „Hol?”-leckék, a szakaszzáró ablak. A mentés nem változik.

## 1. A lecke-lap nem takar (mindenhol)
- **Az ok:** az edzésterv „Állítsd be!” lépése az egész panelt jelölte ki. A lap lent ült, a „rögzítés” gomb pedig alatta volt.
- **Hová ül a lap:** a lap oda kerül (alulra vagy felülre), ahol **kevésbé takarja** a kiemelt célt.
- **Görgetés:** amíg a lecke látszik, az oldal és az adatlap alján pontosan a lap magasságának megfelelő üres hely van (`--kutLH`, `body.kutLNyitva`). Így bármely panel alja felgörgethető a lap fölé.
- **A lépések:** az edzés- és összhang-lecke „Állítsd be!” lépései konkrét lépésekre bomlottak:
  1. mi ez;
  2. az ajánlás;
  3. ✓ betöltés;
  4. kinek mennyit hoz;
  5. 👆 a **Rögzítés** gombja.

## 2. A szakasz vége: azonnal és feltűnően
- **Saját ablak:** `#kutKeszModal`, „🏆 SZAKASZ TELJESÍTVE!”. A lecke-lap és minden más ablak fölött jelenik meg, a haladás pöttyeivel és a kinyílt funkciókkal.
- **Azonnal szól:**
  - a jel pillanatában (`kutJel`);
  - a meccs utáni léptetés végén is (`proceedAfterMatch`), és az átigazolási időszak után;
  - eddig csak a HUB következő rajzolásakor szólt, a meccsek pedig a HUB érintése nélkül mentek egymás után.
- **A meccsképernyőn:**
  - az **„Irány a HUB — mutasd meg →”** átvisz a HUB-ra, és rögtön indítja a szakasz leckéjét;
  - a **Kezdőrúgás** is megáll előtte; a „Később” egyszer továbbenged;
  - a „meccsről meccsre” lánc is megáll.
- **`askConfirm`:** kapott egy `onNo` ágat, a régi hívók viselkedése változatlan.

## 3. Ajánlás a taktikádhoz — edzés és összhang
- **Edzésterv: 💡 Ajánlás a taktikádhoz**
  - **Mit edzél:** a taktika fókusz-tengelyei közül az, amelyiken +10 pont a legtöbb illeszkedést hozza. Ez a fő edzés, a második a mellék.
  - **Kinek:** a posztcsoport az, ahol a kezdők a legtöbbet viszik abból a képességből.
  - **Kire hat:** a 3 legnagyobb nyertes a kezdőből, a valódi előrejelzésből.
  - **Az illeszkedés:** most → az idény végére (`edzesFitBecsles`). A kezdők hozama a tengely szerep-súlyával átlagolva adja a csapat-tengely emelkedését, abból számol a `tacticFit`.
  - **Becslés:** a sebesség-mag és a meccs-fejlődés nincs külön modellezve.
  - **Gombok és élő mező:** ✓ betöltés; a saját vázlatod illeszkedése is élőben látszik (`#trTervFit`).
- **Összhangépítés: 💡 Ajánlás a kezdő tizenegyedhez**
  - **Melyik sáv:** a fő sáv ott van, ahol a legtöbb súlyú pár áll a legmesszebb a 88-as meccs-plafontól.
  - **A sáv adatai:** a párok száma, az átlaguk, a fokozatuk, a leggyengébb pár, és a csapatszám hányada.
  - **A hatás:** a példában +10 a sáv párjain → a csapat összhangja és a meccserő változása, a `bondOvrMod` képletéből.
  - **Gomb:** ✓ betöltés.

## 4. „Hol?” — vezetett mini-lecke minden feladatnál
A Kezdő út kártyáján a „Hol?” a feladat **saját útját** járja végig, villogó lépésekkel. A lecke a feladat jelére zárul.
- **Menüben ülő funkció:** ☰ Menü → menüpont → a panelen belüli teendő.
  - **Csúszkák:** „Húzd el!”;
  - **Edző:** „🧠 Elemzést kérek”, majd „Értem”.
- **Fejlődési görbe:**
  1. villog egy játékos a keretben;
  2. megnyílik az adatlap;
  3. villog a 📈 Fejlődési görbe sáv → lenyitás;
  4. mit mutat.
- **HUB-elem** (büdzsé, erőmérleg, Infópult): közvetlenül arra mutat.
- **Tempó:** a meccsképernyőn a nyilakra mutat, a HUB-on elmondja, hol találod.

## 5. Javítás: a csúszka nem pipált
Az első idényben a hangsúly-panelen csak a **taktika-csúszkák** vannak (`tdSet`). A Kezdő út jelét eddig egyedül a stílus-csúszka (`dialSet`) küldte; most mindkettő.

## 6. A meccs utáni képernyők ablakként; a felfedezés arccal
- **Ablakként mindig:** a `#scSkill` (jutalom-skill, kémia-építések, fejlesztés) és a `#scUnlock` (scout-felfedezés, akadémia) álló nézetben is **felugró ablak**. Eddig csak fektetve és a menüben volt az.
- **A felfedezés kártyája:** arc (`faceSVG`), Rating és becsült erő (POT).
- **Az első felfedezés vezetett leckét kap** (`jut_felfedez`):
  1. mi ez;
  2. mit jelentenek a számok;
  3. Rendben;
  4. hol igazolod le.

## Próbák
- **Új próba:** `tools/tanitas-szelek-1-0-12-2-00-proba.js`. Ellenőrzi:
  - a csúszka pipáját;
  - mindkét ajánlást (a fókusz-tengely, a betöltés, az illeszkedés nő);
  - a meccsek-leckét végig, valódi koppintással, és hogy a „Rögzítsd” gombot a lap nem takarja;
  - a szakasz végét a meccsképernyőn (nagy ablak, a kezdőrúgás megáll, „Irány a HUB” → a lecke);
  - a „Hol?”-t (a görbe és a csúszka kipipálódik; minden feladatnak van leckéje);
  - a felfedezés-ablakot (fix pozíció, arc, Rating, lecke);
  - hogy nincs oldalhiba.
- **Igazított próbák:**
  - `kezdo-ut-leckek`: 18 lecke, új dinamikus elemek, az új szakaszzáró ablak;
  - `kezdo-ut-motor`: az új szakaszzáró ablak.
- **Zöld még:** a Kezdő út összes próbája, a `motor-jutalom`, az `eromerleg`, és minden próba, ami az edzéstervet, az összhangot, a felfedezést, a kezdőrúgást, a láncot vagy az `askConfirm`-ot érinti (37 próba).
- **Már a HEAD-en is hibás, nem e kör miatt:** `boost-plafon-3-9-318` és `pvp-szigor-3-9-287`.

## 1.0.12.2.01 — Az első átigazolási ablak, vezetve

> KIMONDOTT KÉRÉS: „Az első rövid átigazolási ablakban azt is el kellett volna magyarázza a játék, hogy milyen fajta átigazolási lehetőségek vannak, mi az átigazolási esemény, mi ez a scout által talált ingyen játékos. Mindegyikre ravinni a kurzort stb. És a mi játékoseladásaink ügyében szintén oda kellett volna vigyen, hogy lássam, miképpen működik ez az eladás dolog."

A „Az átigazolás” lecke (`KUT_LECKE.piac`) újraírva.
- **Mikor indul magától:** az első ablak megnyitásakor (`twOpenCheckpointWindow`). Megvárja a közbejövő ablakokat, és a HUB minden rajzolásakor újrapróbálja, amíg az ablak nyitva van (`kutPiacAuto`).
- **Mire mutat, sorban:** keretezve, élő számokkal.
  1. az időszak (mennyi felderítés, esemény maradt);
  2. 🛒 Vásárlás;
  3. 🔍 Klub-szemle;
  4. 🎯 Képesség-keresés;
  5. 🎲 Átigazolási esemény (álomigazolás, ikon, elvágyódás; ablakonként kevés, nem kötelező);
  6. 🔍 Felfedezett játékosok (a scout meccs utáni találatai, a 🎁 ingyenes, csak ablakban, bérrel);
  7. ⭐ Sztár piac, 🎓 Stábtag igazolása, 📈 Eladási ajánlatok.
- **Az eladás:**
  - villog egy **valódi tartalék** sora (az üres padhely nem);
  - megnyílik az adatlapja;
  - keretezve a **💰 Eladás most** (a kikiáltási ár negyede);
  - keretezve a **📈 Piacra bocsátás** (5–15 forduló, a licit 60–125%, 500 perc kell);
  - vissza, majd a **lezárás** gombja, végül három szabály.
- **Az eladás gombjainak jele:** `data-kut="elad"` és `data-kut="piacra"`.
- **Próba:** `tools/piac-lecke-1-0-12-2-01-proba.js` (magától indul; minden lépés látható és keretezett céllal; nincs oldalhiba).

## 1.0.12.2.02 — A „Hol?” zárt gombra mutatott (régebben indult karrier)

> BEJELENTETT HIBA (kép, fekvő nézet): „Próbálja megmutatni nekem a következő feladatot, csak még nem nyitotta ki közben a menüben ezt a fület... Újabb bug. Ezeket módszeresen irtsuk ki..."

- **Az ok:** a Csapatszerepek gombját a Kezdő út zárta (`kutZar`), nem a menücsoport volt csukva. Az 1.0.11.22.00-ban a szakaszok nyitásai átrendeződtek. Egy korábban indult karrierben a már teljesített szakasz új nyitása sosem futott le, így a következő szakasz feladatai zárt gombra mutattak.
- **Állandó szabály:**
  - a kiértékelés (`kutErtekel`, minden HUB-rajzoláskor) csendben pótolja minden már teljesített szakasz nyitását;
  - biztonsági hálóként a „Hol?” indításkor kinyitja a feladat funkcióját, ha az mégis zárva volna.
- **Módszeres próba:** `tools/hol-mind-1-0-12-2-02-proba.js`, álló és `--fekvo` nézetben.
  - Mind a 22 feladatra, régi mentést utánozva (üres nyitás-lista), ellenőrzi:
    - a gomb nincs zárva;
    - a „Hol?” eljut a célig, és az ott látható, keretezett.
  - A javítás nélküli kódon 12 zárt gombot mutat ki; a javítással zöld.

## 1.0.12.2.03 — Menetrend és tabella: új kinézet, nyers klubnév nélkül

> BEJELENTÉS (kép): „A menetrend és tabella már egy ideje nem lett frissítve kinézetileg. Plusz ott becsúsztak még jogvédett tartalmak."

- **A jogvédett nevek:**
  - **Az ok:** a bajnoki egyéni listák klub-oszlopa a csapat TELJES nevét kapta szezonnal (pl. „Stade de Reims (1959/60)”). A `clubLabel` a fordítótáblában szezon nélkül keres, ezért nyersen engedte ki.
  - **A javítás:** a `clubLabel` a szezonos alakot a `teamLabel`-nek adja át, így minden hívó helyén működik, nem csak itt.
- **Új kinézet:**
  - **Fülek:** három fül (📅 Menetrend · 🏆 Tabella · ⭐ Egyéni listák). Az utolsó választott fül megmarad, ez csak kényelmi, böngészőnként.
  - **Menetrend:** a tabella stílusában, mezzel és teljes névvel.
    - címkék: ⚔️ rivális, 🔥 hajrá-rangadó, 🏆 bajnoki döntő, a következő meccs kezdési ideje;
    - H/I jelzés;
    - színes eredmény-pirula (győzelem, döntetlen, vereség);
    - „▼ következik” elválasztó, a következő meccs kiemelve;
    - a fejlécben a lejátszott meccsek száma és a mérleg.
  - **Egyéni listák:** a tabella stílusában.
    - 🥇🥈🥉 az első háromnak;
    - mez;
    - név, alatta a klub a fordítórétegen át;
    - nagy szám;
    - a saját játékosod a klubszíneiddel kiemelve.
- **Próba:** `tools/menetrend-1-0-12-2-03-proba.js`.
  - Egyik fülön sincs olyan nyers klubnév, amelynek van magyar megfelelője.
  - Három fül, 30 mezes sor, eredmény-pirulák, a következő meccs kiemelve, mezes egyéni listák a klubbal.
