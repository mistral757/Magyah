# 3.9.193 — 🌱 Az akadémiai ablakok javítása · 🗞️ a szezon történetei a címlapon

> „Észrevettem hogy eléggé az idény vége felé dobálja mostanában az
> ifiakadémia jelöltjeit, és az is előfordul, hogy valakit szezonokon
> keresztül az akadémián tart, akit egyszer odaküldtem. Szerintem itt van
> valami számítási elcsúszás.
> Lehetnének további újságcikk címek, pl olyanok, amik arról beszélnek, hogy
> eddig milyen az idény, milyen győzelmi, vereség, gyenge, jó sorozatban
> vagyunk, hogy a csapat morál kívülről milyennek látszik, hogy egy
> összeszokott páros mennyire jót tesz most a csapatnak, stb. Használjunk
> többet a meglévő infókból. […] Légy kreatív, hogy ezek hogyan jelennek meg
> ezekben az akár humoros cikk címekben is."

## 1. Az ifiakadémia — mérve

Egy végigjátszott idény (nyári kupák nélkül) ajánlatai a 4., 8., 12. és 20.
forduló után jöttek, utána megtelt a keret. Ez önmagában egyenletes. A hibát
négy másik ok adta.

| # | csúszás | hatás |
|---|---|---|
| 1 | **A kupameccsek is ablakot nyitottak.** Az akadémia a meccs utáni láncban fut, és ez a lánc a nyári kupameccsek (EK, MK, felkészülési torna, osztályozó) után is lefut. Ott az `S.idx` a 30-on áll, és a „Nyitott kapu” talizmán 2-es maradékú ablaka (30 % 4 = 2) **minden** nyári kupameccsnél újra dobott. | ajánlat-torlódás az idény végén |
| 2 | **A „Zsákbamacska” talizmán** mindig az idény **első** ablakait vette el. | az ajánlatok későbbre csúsztak |
| 3 | **A visszatérés csak esély volt** (ablakonként a mentettek számával nőtt, 12%-tól). Egy visszaküldött tehetség idényenként nagyjából fele eséllyel jelentkezett. | két-három idényig is bent maradhatott, a 21 éves ballagásig |
| 4 | **A panel** a 0. fordulót és a már lezajlott ablakot is beszámolta. | túl nagy esélyt ígért |

### A szabály

* **Akadémiai ablak csak bajnoki forduló után nyílik:** a 4., 8., … 28.
  forduló után, a „Nyitott kapu” talizmánnal a köztes 2-es maradékúak is.
  Kupában, nyári tornán és osztályozón nincs ablak, és egy fordulóhoz
  legfeljebb egy tartozik.
* **Minden visszaküldött tehetség idényenként egyszer garantáltan
  jelentkezik.**
  * Az idény első ablakában mindenki kap egy **beosztott fordulót** a
    hátralévő ablakok közül, szétszórva, véletlenszerűen.
  * Ha ez az ablak elmegy (tele keret, befagyott akadémia), a következő
    ablakban jön.
  * A „szezononként egyszer” szabály (3.9.52) változatlan.
* **A 21 éves ballagás** változatlanul garantált, és elsőbbséget élvez.
* **A „Zsákbamacska” kihagyása** egyenletesen oszlik el az idény ablakai
  között.
* **Az Ifiakadémia panel** kiírja a beosztott fordulót („idén a 12. forduló
  után garantáltan jelentkezik”), és a hátralévő ablakok számát pontosan
  számolja.

**200 szimulált idény:** az új felfedezések pontosan egyenletesen oszlanak a
hét ablak között (ablakonként 200). A „Zsákbamacska” idényenként pontosan
egyszer hagy ki, ablakonként 21–38 alkalommal (a várható érték ~29).

## 2. A szezon történetei a címlapon

A 3.9.188-as címek az **este** eseményeiből születtek (ifi első gólja,
mesterhármas, fordítás…). Egy sima győzelem, döntetlen vagy vereség csak
általános címet kapott.

Mostantól a lap a **szezon történetét** is megírja, a meglévő
nyilvántartásból. A lap két dolgot vezet saját jegyzetben: a vereség-szériát
és a gólcsendet.

| téma | forrás | példa |
|---|---|---|
| győzelmi széria (3+, 8+) | `S.winStreak` | „Sorozatgyártás: a Teszt FC 6. győzelme zsinórban — a gyártósor nem áll le” · „Gépezet: 9 győzelem zsinórban — a statisztikusok új oszlopot nyitnak” |
| veretlenség | `S.unbeatenStreak` | „Golyóálló: 7. veretlen mérkőzés” |
| nyeretlen / vereség-széria | `S.winlessStreak`, a lap jegyzete | „3 vereség zsinórban — a szurkolók már azt keresik a térképen, hol van a gödör alja” |
| gólcsend | a lap jegyzete | „Gólcsend: 2. meccs lőtt gól nélkül — a csatárokat a kapu keresésére küldték” |
| kapott gól nélküli széria | `S.cleanSheetStreak` | „A kapusunk unatkozik: 4 meccs óta nem kellett a hálóból kiszednie a labdát” |
| élre állás, trónfosztás | `titleSnapshot` + a lap jegyzete | „Új éllovas! …” · „Trónfosztás: …” |
| előny, előny a hajrában, üldözés | `titleSnapshot` | „Mérlegen a cím: 8 pont előny, 8 forduló van hátra” |
| félidei mérleg, kiesőzóna, hajrá, a bajnok tiszteletköre | `titleSnapshot`, `S.W/D/L` | „Félidei mérleg: 7. hely, 22 pont, 6 győzelem, 4 döntetlen, 5 vereség” |
| hibátlan idény, gólgyár | `S.W/D/L`, `S.GF/GA` | „40:2 — a kapusunk már keresztrejtvényt fejt a meccseken” |
| a morál **kívülről** | `S.morale` (85+ / 30−) | „Kívülről nézve: az öltözőben pezsgőfürdő, a buszon karaoke” |
| az **összeszokott páros**, ha ma mindketten termeltek | párkémia, passzkémia, gyilkos páros, szárny | „Telepátia? Kiss és Nagy ismét összekacsintott, az ellenfél pórul járt” · „Gyilkos páros: … ráugrott … védelmére” |
| gólkirályi kerek szám (10, 15, 20…) | `S.scorers` | „20 gól: Kovács kezd unalmassá válni a kapusoknak” |
| a kapitány gólja egy győzelemben | `captainIdx` | „Karszalag kötelez — …” |
| a csapat összhangja (75+) | `teamBond` | „Egy test, egy lélek: … összhangja a csúcson” |

Összesen **65 sablon**.

### Hogyan kerül a lapba

* **A történet a lefújás után dől el** (`pressStoryApply`, a `mLefujas`
  előtt). Ekkor a tabella, a sorozatok és a morál már a friss állást
  mutatja.
* **Esemény nélküli estén** a legerősebb történet lesz a **főcím**, az esetek
  70%-ában.
* **Erős eseménynél** (ifi első gól, bemutatkozó gól, mesterhármas,
  gól-jubileum, búcsú, fordítás, kései győztes gól, kiállítás, rangadó,
  kiütés, zakó) a főcím marad.
* **2★-tól** a lap **rovatot** is ír a cím alá, a szezon egy másik
  történetéből. Megjelenik a mérleg ablakában és a naplóban is.
* **Ismétlésfék:**
  * a legutóbbi főcím témája ×0,25-öt kap;
  * a többi nemrég megírt téma ×0,6-ot;
  * ugyanaz a sablon kétszer egymás után nem jön.
* **A súgó** (`sajto`) leírja az új témákat és a rovatot.

## 3. Próbák

* `tools/akademia-ablak-3-9-193-proba.js` és
  `tools/sajto-tortenet-3-9-193-proba.js` — lásd a `tools/README.md`-t.
* **A régi akadémia-próbák az új szabályhoz igazodnak:**
  * `tools/akademia-evek-proba.js`: a visszatérés beosztott fordulóra jön;
  * `tools/ifiakademia-3-9-177-proba.js`: a panel „garantáltan” szövege.
