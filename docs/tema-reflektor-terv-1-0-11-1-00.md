# Terv — az 5. téma („Reflektor”), a nyitó töltőképernyők és az új ikon

Ez a lap a munka ELŐTT készült: mit építek, milyen sorrendben, és mit
vetettem el. A megvalósult állapotot a verziók saját leírásai rögzítik
(`docs/tema-reflektor-1-0-11-1-00.md`, `docs/nyito-1-0-11-2-00.md`,
`docs/ikon-1-0-11-2-01.md`).

## A kérés

1. Egy ötödik megjelenési téma, amely messze áll a meglévő négytől, és
   **ez lesz az új alapértelmezett** (a megrendelő külön helyesbítése).
2. Megnyitáskori töltőképernyő, mind az öt témában más.
3. Új alkalmazás-ikon, amely megmutatja, mi ez a játék.

## 1. A téma: ◈ Reflektor — esti rangadó, élő közvetítés

**Karakter.** A négy meglévő téma mind egy *tárgy* világa: szén és arany
(trófea-vitrin), krémpapír (nyomtatott program), filmnyomat (mozi), 8 bites
konzol. Ami hiányzik, az maga a *meccsnap*: a kivilágított stadion este, és a
tévéközvetítés grafikája. A Reflektor ezt hozza: mély petróleum-éjszaka, a
sarkokból beeső reflektorfény, „volt”-sárgászöld kiemelés, döntött, sportos
címbetű.

**Paletta.** Az alap petróleumkék-zöld (`#06141a`), nem semleges fekete (az a
Sötét-arany és a Noir) és nem indigó (az a Pixel). A kiemelés a „volt”
(`#d6ff3f`): a mezek és a stoplisok neonja, az aranytól és a Pixel
citromsárgájától is jól elválik. A jelentéshordozók: menta-zöld (jó), korall
(rossz), égkék (információ), levendula. A cél minden szövegszínre legalább
4,5:1 az alapon és a paneleken is; a próba méri.

**Tipográfia.** Új betű: **Exo 2** (SIL OFL, változó súlyú, önhosztolt, két
szelet: latin + latin-ext, együtt ~72 kB, csak ebben a témában töltődik le).
Hat jelöltet rendereltem ki a palettán (Exo 2, Saira, Sora, Space Grotesk,
Outfit, Red Hat Display, mellette az Archivo). Az Exo 2 nyert: a szélessége
az Archivóéhoz áll a legközelebb (a 142 000 soros felületen ez a legkisebb
tördelési kockázat), a döntött, kövér változata pedig pontosan a közvetítések
eredményjelző-betűje. A címek döntöttek; valódi kurzív fájlt nem töltök be
(az +74 kB volna), a böngésző dönti meg a betűt: geometrikus groteszknél ez
tiszta.

**Formanyelv.** Üvegszerű, átlósan színezett panelek vékony fény-éllel; a
fő gomb volt-színű, sötét felirattal és halk ragyogással; a szakaszcímek
előtt döntött „közvetítés-pálcika”. A hangulat-rétegen (`--glow-paint`) két
reflektorkúp ül a felső sarkokban: álló kép, nem animáció (akkumulátor).

**Mozgás.** Az élő háttér jelenete kap Reflektor-festéket (éjszakai gyep,
volt mezek). Külön, folyamatosan futó animációt a téma nem hoz.

**Hang.** Új lágy hangulat: „Esti rangadó” (elektromos zongora, pad, mély
szinusz-basszus, egyenletes puha lábdob). A hangereje a többi hangulatéhoz
igazodik (3 dB-en belül), a meglévő hangtéma-próba mércéjével.

**Elvetett irányok.**

- *Világos, hűvös „jégfehér” téma.* Napfényben a legjobb, de a Törtfehér már
  betölti ezt a szerepet, és a nyitóképernyő meg az ikon sötét alapon sokkal
  drámaibb.
- *Krétatábla (zöld tábla, kréta, mágnesek).* Erős ötlet, de iskolás, nem
  „profi”; a gyep zöldje beleolvadna a felületbe.
- *Indigó + neon (a nagy ligák arculata).* A Pixel téma éjkékje és
  citromsárgája túl közel van hozzá.
- *Meggypiros (Aranycsapat).* A bordó témát egyszer már törölni kellett
  olvashatatlanság miatt; a piros a „rossz” jelentésével is ütközik.
- *Széles (extended) címbetű.* Menő, de a hosszú magyar címek 430 pixelen
  kilógnának.

## 2. A nyitó töltőképernyők

**Keret.** A `<body>` legelső eleme, saját kis CSS-sel és egy rövid
szkripttel; a téma a `<head>` szkriptjéből már ismert, tehát az első
festés a jó témában történik. A nagy szkript végén egy hívás jelzi, hogy a
játék kész. A képernyő addig marad, amíg a játék betölt, de legalább egy
rövid ideig: **első megnyitáskor 1,2 mp**, **visszatérőként 0,5 mp**
(rövidített koreográfia), utána 0,3 mp alatt elhalványul. Koppintásra azonnal
eltűnik. Biztonsági idő: ha a jelzés nem jön, 6 mp után magától lekerül.
Hangot nem ad (kattintás előtt a böngésző úgysem engedné). „Kevesebb
mozgásnál” (rendszer-beállítás vagy `fxAnimOff`) álló kép, animáció nélkül.

| Téma | Ötlet | Elrendezés és mozgás |
|---|---|---|
| Reflektor | A stadion felkapcsol | Sötétből négy reflektorsor gyullad ki egymás után, a fénykúpok bevilágítanak; a gyep vonalai perspektívában rajzolódnak ki; a kezdőkörön a felállás pontjai és a kémia-vonalak állnak össze; a név döntött közvetítés-táblán úszik be; alul eredményjelző pörög 0-tól 30–0-ig (ez a töltésjelző). |
| Sötét-arany | Trófea-vitrin | Középen vékony arany gyűrű rajzolódik körbe, benne ritkított, vékony antikva „MAGYAH”; alatta hajszálvonal nyílik szét. Csendes, lassú. |
| Törtfehér | Nyomtatott meccsprogram | Vágójelek a sarkokban, fejléc-léniák, a cím betűnként „nyomódik” a papírra, ferde gumibélyegző: „30–0”. Balra zárt, újság-tördelés. |
| Noir | Filmfőcím | Fekete sávok (szélesvászon), visszaszámláló kör söprő mutatóval, majd a címkártya; halk villódzás. |
| Pixel | A konzol bekapcsol | Képcső-csík, gépelt rendszerüzenetek, memória-ellenőrzés, blokkos töltősáv, villogó „NYOMJ STARTOT”. Lépcsős mozgás. |

**Elvetve:** közös képernyő más színekkel (a kérés kifejezetten tiltja);
beágyazott kép vagy videó (méret); hang a nyitáskor (böngésző-korlát); a
splash mint kötelező várakozás (a visszatérő játékost idegesítené).

## 3. Az ikon: a „taktikai M”

**Az ötlet.** Az M betű öt töréspontja öt játékos a taktikai táblán, a szárai
a köztük futó passz- és kémia-vonalak. Egyetlen jel mondja el, hogy ez
*MAGYAH*, hogy *felállás*, és hogy a játékosok *össze vannak kötve*. Alatta
kis piros–fehér–zöld csapatkapitányi szalag: a magyar szál. Az alap a
Reflektor petróleum-éjszakája a kezdőkör halvány ívével, a jel volt-színű.

**Méretek.** Három rajz, mint eddig: 72 pixeltől a teljes jel; 48-on a
pályavonal nélkül, vastagabb szárakkal; 32 alatt csak a kövér M és a szalag.
A maskable változatban a jel a középső 80%-os körön belül marad.

**Elvetve:** focilabda (a régi ikon; klipart, és semmit nem mond a
menedzselésről); „30–0” számokkal (48 pixelen olvashatatlan); címerpajzs
(minden klubos app ilyen); Blenderrel renderelt, plasztikus jel (kis
méretben a fény-árnyék elmossa az élt; az SVG-ből gyártott PNG élesebb, és a
generátor egyetlen forrása megmarad).

## Sorrend és verziók

| Verzió | Lépés | Szint |
|---|---|---|
| 1.0.11.1.00 | a Reflektor téma, alapértelmezettként; betű, hang, élő háttér; próba | minor (új, látható rendszer) |
| 1.0.11.1.0x | a lefedettség csiszolása, ha a képernyőképek kilógó foltot mutatnak | patch |
| 1.0.11.2.00 | a nyitó töltőképernyő kerete és az öt képernyő; próba | minor |
| 1.0.11.2.01 | az új ikonkészlet, manifest, service worker, áruházi grafika, képernyőképek | patch (a nyitás csomagjának része) |

## Amihez nem nyúlok

A meglévő négy téma színei és szabályai; a mentés és a PvP-csere formája; a
`version.json` `v` mezője. A régi ikonfájlok az új készlet ellenőrzéséig a
helyükön maradnak (felülírás előtt másolat készül a `tools/ikon/regi/` alá).
