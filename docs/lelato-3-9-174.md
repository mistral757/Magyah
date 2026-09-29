# 3.9.174 — 🏟️ a lelátó hangja: meccszaj, 25%-os zene, izgalommal nyíló lelátók

> „Meccs közben 25%-on a háttér zene + egy meccs zaj szurkolással. Ezt
> készítsd el ahogy tudod. Mehet ingyenes meccs zaj letöltés. Legyen mondjuk 5
> féle, és ezek mérföldkövekkel kinyithatók legyenek. Meccs izgalomhoz
> köthetően legyenek mérföldkövekre rakva a kinyitások. Ezeket változtatni az
> arculat menüpont alatt lehessen."

## A hangforrásról, őszintén

Az ingyenes, szabad licencű hangfelvételek letöltését megpróbáltam, de ebből
a fejlesztői környezetből a forrásokat (Wikimedia Commons, Freesound) a
hálózati szabály tiltja. A tiltást nem kerültem meg.

A játék minden más hangja is a böngészőben születik, ezért a lelátó is:
**szintetizált tömeg, fájl nélkül**, offline is működik, és nincs letöltendő
méret.

Ha később saját, szabad licencű felvétel kerül elő, a lejátszó egy kis
kiegészítéssel azt is tudja szólaltatni. Az alapréteg egyetlen ismétlődő
hangminta, a reakciók külön rétegek, ezért a felvétel az alapréteg helyére
tehető.

## Mit hallasz meccs közben

* **A zene 25%-on szól tovább.** Eddig meccs közben elhallgatott; mostantól a
  lelátó alatt, halkan kíséri a meccset. A lefújás után visszaáll teljes
  hangerőre.
* **A lelátó alaprétege** egy ~21–23 mp-es, varrat nélkül ismétlődő
  hangminta. Egyszer, a háttérben renderelődik ki (`OfflineAudioContext`, az
  első érintés utáni üresjáratban), és a meccs elején 2 mp alatt beúszik.
  Rétegei, a lelátótól függően:
  * **moraj:** lassan hullámzó, sávszűrt zaj;
  * **a tömeg „beszéde”:** szótag-ütemű, két formánssal szűrt zaj — ettől
    hangzik emberinek;
  * **bekiabálások:** zöngés, magánhangzó-szűrt hangok;
  * **elszórt taps** és **ütemes taps-rigmus**;
  * **nagydob**;
  * **énekelt rigmus:** 20–30, kissé elhangolt torok egy dallamon,
    magánhangzó-formánsokkal; a Legendás éjszakán kétszólamú himnusz;
  * **dudák, füttyök**;
  * **a távolság és a stadion zengése** (a kis lelátó messzebb és szárazabb,
    a nagy stadion zeng).
* **Az élő réteg a meccs eseményeire reagál:**

| esemény | a lelátó |
|---|---|
| ⚽ gól | felrobban: zúgás, „góóól”-kórus, taps, a moraj 6 mp-ig erősebb |
| kapott gól | felnyög, aztán 8 mp-ig csendesebb |
| kapufa, bravúr | „óóó” |
| tizenegyes, VAR | feszült zúgás, morgás |
| sárga lap | füttyök és „búúú” |
| piros lap | füttykoncert |
| félidő | taps |
| győzelem / döntetlen / vereség | ünneplés és taps / taps / füttykoncert |

* **Csak nézett meccsen szól.** Végigjátszásnál és a frissítés utáni gyors
  visszajátszásnál a lelátó hallgat, és elhallgat, ha a lap a háttérbe kerül.

## Öt lelátó, az izgalom lépcsőin

A feloldás mércéje a karrier legizgalmasabb meccse. Ez ugyanaz a szám, amit
az „N-es izgalom egy meccsen” mérföldkövek mérnek, a lépcsők pedig az
izgalom-címkék és a mérföldkő-fokok:

| lelátó | mikor nyílik | karaktere |
|---|---|---|
| 🌤️ Vasárnapi délután | alap | pár ezer ember: halk moraj, elszórt taps, bekiabálás |
| 🏠 Hazai mag | az első „izgalmas” meccs (65+) | sűrűbb moraj, ütemes taps-rigmus, füttyök |
| 🥁 Ultrák a kapu mögött | az első „emlékezetes” meccs (85+) | nagydobok, „Ma-gyah!” rigmus a dob ütemére |
| 🔥 Katlan | 92-es izgalom | zúgó tömeg, az egész lelátó indulót énekel, dudák |
| 🌌 Legendás éjszaka | 96-os izgalom | kétszólamú himnusz, mély dobok, óriás zúgás, nagy zengés |

**A nyitás bejelentése:** amikor egy meccs átlép egy lépcsőt, a napló
bejelenti: „🏟️ ÚJ LELÁTÓ-HANG: …”. A sor a „Kihívások, mérföldkövek”
témakörbe tartozik, és megmondja, hol lehet választani.

**Hangerő:** a lelátók hangossága célszintre normált. A nagy tömeg kb. 4–5
dB-lel hangosabb a vasárnapinál, a csúcs mindenhol 0,9 alatt van. A dobos
lelátóknál a dob így nem nyomja el a tömeget.

## Hol választod

**HUB → Csapatépítés → 🛡️ A klub arculata → 7 · A lelátó hangja.**
* Öt kártya: ikon, név, leírás, feltétel.
* A zártaknál a feltétel és a mostani csúcs is látszik („🔒 92 pontos meccsnél
  nyílik — most: 86”).
* Mindegyikbe **bele lehet hallgatni** (8 mp), a zártakba is.
* A választás **azonnal érvényes** (nem a piszkozat része), és a karrierrel
  mentődik.

A **Hang beállításai** között van a lelátó ki/bekapcsolása és a hangereje. A
zene meccs közbeni halkítása a kérés szerint rögzített: 25%.

## Technika röviden

* **Saját hangbusz** (`_hangBus.zaj`) a zene és az effektek mellett.
* **Zene-halkítás:** a meccs alatti 25% (`_hangZeneDuck`) simán, fél mp alatt
  áll be és oldódik fel.
* **Saját véletlen:** a lelátó sosem vesz a meccs seedelt véletlen-folyamából
  (3.9.171), a frissítés utáni visszajátszás nem csúszik el miatta.
* **Varrat nélküli hurok:** a render 2 mp-rel hosszabb, a ritmikus elemek a
  ráhagyásba is bekerülnek, és a ráhagyás equal-power áttűnéssel keveredik
  vissza a hurok elejére.
* **Költség:** a hanggráf felépítése egyszer 40–110 ms (asztali gépen), maga
  a kirenderelés a hangszálon fut (0,4–3,2 mp). Meccs közben csak egy
  ismétlődő puffer és az alkalmi reakciók szólnak.

## Próba

`tools/lelato-proba.js`, 21 állítás:
* a render: nem néma, a csúcs rendben, a varrat sima, a hangerő-sorrend jó;
* a nézett meccs: a lelátó szól, a zene 25%-on megy, a gól megmozdítja a
  lelátót, lefújás után minden visszaáll;
* végigjátszásnál nincs lelátó;
* a feloldás lépcsői és a bejelentés;
* az Arculat-kártyák, a választás, a mentés, a belehallgatás;
* a Hang beállításai;
* nincs oldalhiba.

A `hang-proba` 5. állítása az új szabályt védi: a zene nézett meccsen 25%-on
szól tovább, végigjátszásnál hallgat.
