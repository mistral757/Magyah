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
