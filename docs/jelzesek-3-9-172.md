# 3.9.172 — 🔢 tiszta számok, 🎓 stáb-mérleg, 🏆 kihívás-felugró, 🧹 feed-szűrő, 📣 push

Öt kérés egy körben. Mindegyik ugyanarról szól: a fontos dolog ne vesszen el
a zajban, a zaj pedig ne takarja el a fontosat.

## 1. 🔢 A pixel téma kis számai

> „A pici 5-ös, 8-as, 3-as és 2-es nagyon összetéveszthető a pixelated
> témában. Csak a kicsi számok, de abból azért van bőven."

**Az ok.** A Pixelify Sans számjegyei 10–12 px-en ugyanarra a sziluettre esnek:
lekerekített tető, középső derék, lekerekített talp. A „2358" így egy
„S8"-szerű foltot ad.

**A megoldás: egy saját számjegy-betű („Magyah Pixszam").**
* Csak a tíz számjegyet tartalmazza (`unicode-range: U+30-39`), a pixel téma
  betűsorában a Pixelify elé kerül. A betűk többi része nem változik.
* 5×7-es rácsra rajzolt jegyek. A négy veszélyes jegy szándékosan más-más
  formát kap:

  | jegy | forma |
  |---|---|
  | 2 | kerek tető, átló, **lapos talp** |
  | 3 | **lapos tető**, átlós törés, kerek talp |
  | 5 | **lapos tető + bal oldali fal**, nyitott has |
  | 8 | **két zárt hurok**, keskeny derék |

* A méretei a Pixelify számjegyeiéi (tető 631, előtolás 586 egység). Minden
  szám a régi helyére ül, a táblázatos igazítás is marad (a próba méri: a
  „23580" szélessége betűre azonos).
* Két súlya van: 400, és 700, ahol a képpontok jobbra hízva adják a
  pixel-félkövért.
* Forrás és rajz: `tools/pixszam/build.py`, a kimenet
  `fonts/pixszam-400/700.woff2` (0,7 KB darabja). A service worker előre
  cache-eli (cache v7).
* A nagy számokat (az eredményjelző lapjai, a számlálók) továbbra is a Press
  Start 2P rajzolja: ott nem volt baj.

## 2. 🎓 Edzés és fejlődés: a stábtag külön

> „A játékos HUB beli edzés és fejlődés menüpontja alatt látszódjon külön,
> hogy mennyit kapott a stábtagtól és mennyit a sima edzésből."

**Mi volt eddig.** Az edzés-mérleg csak az edzésterv és néhány gyorsító
pontjait mutatta. A személyi edzők (attribútum-mesterek) pontjai beépültek a
játékos attribútumába, de a mérlegben **sehol nem látszottak**.

**Mostantól** a mérleg csatornánként is könyvel, attribútumonként:

| sor | mi van benne |
|---|---|
| 🏋 Edzésterv | a fő és mellék sáv (a padon és a tartalékban is) |
| 🎓 Stábtag | a személyi edzők pontjai, **edzőnként** (név + típus) |
| ⚡ Egyéb gyorsító | tartós attribútum-boost, passzkémia-adag, Kényszerítő képesség |
| 🐢 Az edzésterv lassítása | amennyit a lassított tengely elvett |

* A régi „edzés összesen" szám változatlan: edzésterv + egyéb − lassítás.
* A stábtag sora akkor is ott van, ha nem adott semmit, és megmondja, miért:
  nincs a fókuszában / nem az ő posztja, vagy nincs attribútum-mester a
  stábban.
* Az előző szezon sora is kiírja a stábtagtól kapott részt.

## 3. 🏆 A kihívás-felugró

> „Legyen külön felugró ablak a kihívások teljesítésekor (nem csak a
> pixelated módban, de abban is legyen, a saját stílusához illően), ne csak a
> feedben lehessen olvasni."

* Teljesítéskor (`resolveChallenge`) egy ünnepi kártya nyílik a képernyő
  közepén. Rajta van a kihívás, a jutalom, a fajtája (rövid vagy szezonos) és
  a haladás, saját szignállal (`hang("kihivas")`, chiptune és lágy változat) és
  rövid rezgéssel.
* **Minden témában** a téma saját tokenjeivel (panel, arany, sarok), halkan
  forgó sugarakkal.
* **A pixel témában** saját ruhát kap:
  * vastag, kétszínű pixelkeret kemény árnyékkal;
  * lépcsős (`steps()`) beúszás, villogó ★ ★ ★ csillagsor;
  * „ACHIEVEMENT UNLOCKED" alcím Press Starttal, raszteres fejléc;
  * „▶" a gombon.
* **Sorba áll:** ha egy körben több kihívás teljesül, egymás után jönnek („még
  1 teljesített kihívás vár"). Ha a pixel téma arcade-felirata (GYŐZELEM!)
  épp fut, a kártya megvárja.
* **Nem állítja meg a játékot:** a jutalom-lánc megy tovább mögötte.
  Végigjátszásnál 4,5 mp után magától eltűnik.
* Bezárni a gombbal, a háttérre koppintva vagy Esc-kel lehet. Ha a gépen be
  van kapcsolva a mozgáscsökkentés, az animáció elmarad.

## 4. 🧹 A feed-szűrő (Vezetés menü)

> „A feedet lehessen ki-be-kapcsolhatóan megtisztítani az extra infóktól, pl.
> csapatstílus sajátos pontgyűjtésének üzeneteitől, és külön kapcsolókkal
> mindentől, ami nem a közvetlen meccsközvetítéshez tartozik. Ennek beállítása
> a menüben a vezetés alatt legyen."

**Hol:** HUB-menü → 🧭 Vezetés → *A meccs-napló tisztítása*.

**Nyolc kapcsoló, és egy gomb, ami mindet egyszerre állítja:**

| kapcsoló | mit rejt |
|---|---|
| 🎨 Csapatstílus pontgyűjtése | presszpont, rettenet, villámpont, gólpont, betonpont, harmóniapont, passzpont — és a mérlegük |
| 📈 Fejlődés és képességek | Rating- és attribútum-lépések, skillek, formafrissítés |
| 🤝 Öltöző | kémia, összhang, kapitány, morál, jellemhullám |
| 💰 Pénzügyek | bevételek, fizetések, díjak, szponzor, kamat |
| 🏆 Kihívások, mérföldkövek, rekordok | (a felugró ablak ettől független) |
| 🧿 Talizmánok és események | talizmán, Joker, rezonancia, zsákbamacska |
| 🔁 Keret, stáb, akadémia | igazolás, eladás, felfedezés, stábtag, ifik |
| 📰 Felvezetés, összegzés, egyéb hírek | ellenfél-bemutató, rangadó-előzetes, a meccs mérlege, izgalom, rendszerüzenet |
| **🎙 Csak a meccsközvetítés** | a fenti nyolc egyszerre (újra koppintva mind vissza) |

**Hogyan működik:**
* Minden sor a születésekor témakört kap (`data-fk`). A kikapcsolt témakört
  a napló konténerén ülő osztály **CSS-sel rejti**, nem törli. Ezért
  visszakapcsolva a korábbi sorok is előjönnek.
* A témakört a stílus-pont sorainál a kód mondja meg (`feedKatVele`), a
  többinél a sor szövege dönti el (`feedKat`).
* A perc-előtagos sor, a Kezdőrúgás, a FÉLIDŐ és a VÉGE **mindig közvetítés**,
  ahogy a meccs alatt keletkező, máshova nem sorolt sor is: ez sosem rejthető.
* A folytatósor („→ …", „ • …", behúzott sor) az előtte álló sor témakörét
  örökli. Így egy mérföldkő magyarázata a mérföldkővel együtt tűnik el.
* A beállítás a készülékhez tartozik (localStorage), nem a karrierhez: ez a
  napló olvasásának módja, nem a játék állapota.

## 5. 📣 A vezetés push-értesítései

> „Az értesítések, amik jelenleg a vezetés részei és emlékeztetnek arra, ha
> valami fontosat még nem állítottál be vagy ilyesmi, azok mostantól legyenek
> push értesítésekként a játékban, akárcsak, mikor a csapattársad küld üzit
> pvp-ben. Ezek közül csak azok legyenek ilyenek, amik az aktuális meccs
> indítása, idény indítása előtt fontosak lehetnek, vagy olyan dolgok, amikkel
> már rég nem foglalkozott a játékos."

**Ugyanaz a sáv, mint a társ jelzése:** felül beúszik, de zöld kerettel,
mert ez a játék szól, nem a társ.
* **Mutasd** (vagy a sáv törzse): odavisz, ahol a tennivaló van; ha a
  meccsképernyőn állsz, előbb a HUB-ot is kinyitja.
* **⏳**: néhány fordulóra elhallgattatja.
* **✕**: bezárja.

A villogó keret és a „?" pötty megmarad: az mutatja a *helyet*, a push mondja
ki, hogy *most* van itt az ideje.

**Csak ez a három fajta szól így:**

| fajta | mikor | témák |
|---|---|---|
| Az idény indítása előtt | a felkészülési HUB-ban és az idény első 3 fordulójában | csapatstílus, szezon-szerepek (áthozottak is), taktika a szezon elején |
| A kezdőrúgás előtt | amikor a meccsképernyő kész a kezdésre | edzésterv, idegen poszt, felállás, középpályás megbízás, tartalékban ülő igazolás, döntésre váró licit, közelgő rangadó |
| Rég nem foglalkoztál vele | ha legalább 8 fordulója esedékes, utána 10 fordulónként | talizmán-húzás, stíluspont, parlagon heverő kémia, sztár-gyorsítás, ingyen boost, sztár-boost, felderítés, boost-kedvezmény, keretbővítés, ügynökség |

A többi téma (tanácsok, mérföldkövek, olvasnivalók) marad a halk jelzésnél. A
Vezetés menü témalistájában 📣 jelöli, mi szólhat pushként.

**Hogy ne legyen zaj:**
* Fordulónként legfeljebb kettő szól, és egy téma fordulónként egyszer. Ha
  egy téma két egymás utáni fordulóban szólt, utána csak minden harmadikban.
* A pillanatnak meg kell ülnie (1,5 mp): átmenő képernyőre nem szól. Nem szól
  végigjátszásnál, meccs közben, a lefújás utáni körben, kihívás-felugró vagy
  nyitott tipp-buborék alatt sem.
* A vezetés meglévő szabályai ugyanúgy érvényesek: elnémítás, halasztás,
  kategória-kapcsoló, a háromszor figyelmen kívül hagyott téma feladása, a
  „Semmi" mód. Van saját kapcsolója is: Vezetés → 📣 Push-értesítések.

## Próba

`tools/jelzesek-3-9-172-proba.js`, 33 állítás öt blokkban, valódi karrierben:
* a számjegy-betű betűsora, tartománya, betöltése és szélessége;
* a stáb-csatorna könyvelése és a HUB-sor;
* a felugró: sorba állás, léptetés, önzárás, pixel- és sötét ruha;
* a feed-szűrő: besorolás, öröklés, rejtés, visszahozás, a „csak közvetítés"
  gomb, a beállítás megmaradása, a panel helye;
* a push fajtái, a fordulónkénti korlát, a sáv, a „Mutasd", a kikapcsolás.

Menet közben kijavítva: egy már futó meccs mellé a `playMatch()` nem indít
másodikat. Korábban az élő rekord miatt ilyenkor ugyanannak a meccsnek a
visszajátszása indult volna el párhuzamosan; a felületen ez nem fordulhatott
elő, de az ütemezők kereszttüzében igen.
