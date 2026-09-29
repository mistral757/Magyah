# 3.9.165 — 🕹️ A Pixel téma

> „Mehet, a javaslataid szerint, a pixel-ikonokkal együtt! És hát legyen minél
> inkább stacked… Légy laza, de pontos, alapos, kreatív, lepj meg!"

A negyedik színtéma a 3.9.163-as chiptune zenéhez. A terve:
[pixel-tema-terv.md](pixel-tema-terv.md). Ez a lap arról szól, mi lett
belőle, és hol tér el a tervtől.

**Az alapértelmezett téma nem változott: törtfehér.** A Pixel a kezdőlap ▦
gombjával vagy a Beállítások → Megjelenés alatt választható.

## Megjelenés

**Paletta.** A PICO-8 fantáziakonzol 16 színéből él:

* éjkék alap `#1d2b53`, krém szöveg `#fff1e8`;
* citromsárga kiemelés, zöld „jó", rózsaszín-piros „rossz", égkék
  „információ".

A jelentéshordozó színek kontrasztra hangolva: mind ≥4,5:1 az alapon, a
panelen és a panel2-n is. A próba méri.

* **Eltérés a tervtől:** a piros `#ff6680` helyett `#ff7088`. A panel2-n az
  előbbi 4,46:1 lett volna, ez 4,74:1.

**Betűk.** Két pixelbetű, önhosztolva, SIL OFL alatt, latin + latin-ext
szelettel (a magyar ő/ű az ext-ben lakik):

| betű | ahol él | miért |
|---|---|---|
| **Press Start 2P** | a logó, az eredményjelző lapjai, a sorszámok, a számlálók, a verziójel | a klasszikus 8×8-as rácsbetű, a 8 px egész többszörösein a legélesebb |
| **Pixelify Sans** (400–700) | minden más: törzs, címek, gombok, ÉS minden magyar felirat (címkék, a fő gomb, posztjelvények, a tábla feliratai), vastag nagybetűvel | a Press Start túl széles a kód száz fix méretű címéhez, hosszú szövegben fárasztó, és — lásd lent — nem tud magyarul |

* **Eltérés a tervtől — a Press Start nem tud magyarul.** A betűnek nincs
  külön ékezetes nagybetűje: az Á, É, Ő… helyén a kisbetűs rajz ül
  („MEGNYITáS", „CéL"), és 8 px-en az ékezet szinte el is tűnik. Ezért a
  terv címke-szerepét (steplbl, kezdőlapi feliratok, a fő gomb) a Pixelify
  Sans vastag nagybetűje vette át. Az árnyékék posztkódja („ÁÉ") miatt a
  posztjelvény is ide került.

* A négy szelet együtt ~42 kB.
* A service worker előre cache-eli őket (cache v6), tehát offline is megy.
* A böngésző csak Pixel témában tölti le őket.

**Forma:**

* **Sarkok:** élesek mindenhol, egy globális `border-radius:0`-val. Száz
  kerekítés inline stílusban ül, oda témaváltozó nem ér el.
* **Pixelkeret:** a paneleken négy tömör árnyékból áll (a sarokban hiányzik
  egy 3×3-as pixel, mint egy sprite-kereten), alatta kemény, eltolt vetett
  árnyék.
* **Konzolgombok:** bevésett éllel. Lenyomva a bevésés megfordul, és a gomb
  2 px-et süllyed.
* **Ablakok:** RPG-párbeszéddobozok (tripla keret), raszteres sötétítéssel.

## Képernyőnként

* **Kezdőlap: címképernyő.**
  * A „Magyah" Press Startban, sárgán, piros és sötét, kétszer eltolt
    árnyékkal, beeső animációval.
  * A szemcse helyén lépésenként villogó csillagmező.
  * A fő gomb előtt villogó, rajzolt, lépcsős „▶". A karakteres ▶ nincs a
    pixelbetűkben, és pótbetűvel halvány volt.
  * A sorszámok és a számlálók pontszám-kijelzők.
* **Eredményjelző: LED-tábla.** A sorozat-festések maradnak (bajnoki zöld,
  BL-kék, FA-fehér, Hiper-lila…), a keret színe is a sorozaté. Ami változik:
  * éles sarok, négyzetes LED-raszter;
  * a fordítós lapok helyén kétszínű pixel-lapok Press Start számokkal;
  * villogó kettőspont (lefújás után megáll);
  * a fordító-tengely és a fémcsap elmarad, mert pixelen a 0 és a 8 derekát
    takarta.
* **Pálya:** négyzetes korongok, szaggatott üres helyek.
* **Fejléc:** kockás, zöld-sárga „padlócsík". A vezérlősor keskeny telefonon
  sorba törhet, mert a szélesebb pixelbetűvel kilógott volna.
* **Kezdőlapi karrierutak:** a „Megnyitás →" jel a szöveg alá kerül,
  különben a leírás egy keskeny oszlopba szorult volna.

## A négy kapcsoló

A Beállításokban, csak Pixel témában:

| kapcsoló | mit csinál |
|---|---|
| 📺 CRT-sorok | 1 px sötét sor minden 3. képsoron és halk képcső-vignetta, a hangulat-rétegen (`--glow-paint`) |
| 🎞 Szaggatott mozgás | minden CSS-animáció és átmenet `steps()` — 6 képkocka |
| 👾 Pixel-ikonok | a lenti sprite-csere |
| 🎆 Arcade-feliratok | a lenti feliratok |

* Az alapállás mind BE.
* A választás a `<html>` osztályain ül (`pixCrtOff`, `pixMoveOff`,
  `pixIconOff`, `pixFxOff`), és localStorage-ban marad meg.
* A `<head>` már az első festés előtt felteszi őket.
* Ha a készülék mozgáscsökkentést kér, az animációk és a CRT-sorok maguktól
  kikapcsolnak.

## 👾 Pixel-ikonok

37 saját, 12×12-es sprite (`PIX_SPRITES`) a PICO-8 palettájával:

⚽ 🏆 ⭐ ⚡ 🔥 💰 🟨 🟥 🏠 🔊 🔇 ⚙ 📊 🎯 🧿 ⚠ 📈 ⚔ 🎓 🔒 🔓 🪜 🛡 🎲 🏅 🥇 📋 👑 💣 🏁
📅 ❤ 🎁 ⏱ 🔔 🌱 💡

A lista a játék szövegeiben leggyakoribb emojikból állt össze.

* **Szándékosan kimaradt a 🤝 és a 🏟.** 12 pixelen nem lett belőlük
  olvasható rajz, és egy rossz sprite rosszabb, mint az eredeti emoji.
* **Hogyan cserél.** Egy MutationObserver gyűjti a DOM-ba kerülő
  csomópontokat (napló, tábla, HUB), és 40 ms-onként egyszerre dolgozza fel
  őket. A saját cseréink keltette mutációkat a `takeRecords()` nyeli le.
* **Nem tör el semmit.** Az emoji szövege a DOM-ban marad, egy láthatatlan
  `.pxE` spanben. A `textContent` és az `innerText` így ugyanaz, mint csere
  előtt, tehát a naplót olvasó szűrők (`HANG_SOR`, a próbák) nem vakulnak
  meg.
* **Visszafordul.** Más témára váltva, vagy a kapcsolóval, minden csere
  visszafordul.
* **Ahová nem nyúl:** űrlapmezők és `<option>` (az nem is tud elemet
  tartani), szkript, stílus, svg és canvas.

## 🎆 Arcade-feliratok

Egy villanás a képernyő közepén. A hang-horgon (`hang()`) ül, tehát
ugyanott szól, ahol a 8 bites hang — néma módban is.

| esemény | felirat |
|---|---|
| saját gól | GÓÓÓL! · +1 |
| kapott gól | GÓLT KAPTUNK |
| mesterhármas | MESTERHÁRMAS · ×3 COMBO |
| piros lap | PIROS LAP |
| győzelem | GYŐZELEM! · STAGE CLEAR |
| vereség | VERESÉG · CONTINUE? ▶ |
| döntetlen | DÖNTETLEN · DRAW |
| legendás húzás | LEGENDÁS! · ★ ★ ★ |
| a Pixel téma bekapcsolása | PIXEL MÓD · PRESS START ▶ |

**Mikor jelenik meg:**

* A meccs-feliratok csak nézett meccsen villannak fel, mert a hangjuk is
  csak ott szól.
* Nem blokkolja a koppintást.
* A CRT-sorok alatt ül, tehát ez is „a képcsövön" van.

## ↑↑↓↓←→←→BA

Billentyűzeten a Konami-kód bármelyik témából a Pixelbe hoz, „30 ÉLET"
felirattal.

## Próba

`tools/pixel-tema-proba.js` (port 9197). A `tools/kezdolap-proba.js` a
kezdőlapot mostantól a Pixel témában is lefotózza.
