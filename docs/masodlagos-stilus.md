# A másodlagos csapatstílus (3.9.64)

> „3. szezon végétől nyíljon ki a secondary csapatstílus választás. […]
> választhatsz még egy csapatstílust, amit szintén kimaxolhatsz, aminek szintén
> érvényesek a szerepei, hangolásai, képességei, mérföldkövei. 1 nehezítés van:
> a secondary csapatstílus mérföldkövei 3x lassabban gyűlnek. […] A
> csapatstílus pontot egyetlen nagy poolba gyűjti a két stílus."

## Az igazi munka: három kérdés, ami eddig egy volt

A rendszer eddig **egyetlen függvénnyel** (`styleState()`) válaszolt három
teljesen különböző kérdésre — egy stílus mellett a három egybeesett, kettőnél
szétválik, és minden hívási hely eldöntheti magát rosszul:

| kérdés | ki válaszol most | példa |
|---|---|---|
| **mi hat a pályán?** | `styleSlots()` — MINDKÉT filozófia | képességek, szerepek, hangsúlyok |
| **melyiket nézem?** | `styleView()` — csak felület | a panel fája, mérföldkövei, csúszkái |
| **melyik stílusé ez az adat?** | `styleStateFor(kulcs)` | a sztár, a híresség, a cipők, a mezszám-alku |

A `styleState()` jelentése **változatlan maradt**: az elsődleges. Így minden
eddigi hívási hely pontosan azt kapja, amit eddig — egy filozófia mellett a
rendszer betűre a régi.

## Mi él egyszerre, és hogyan

- **Képességek.** A motor a két fa közül a **nagyobbik szintet** látja
  (`styleTraitLevel`), a hatás-lista (`styleActiveFx`) viszont **mindkettőből**
  merít. A két tár külön él, ezért a kulcsütközés nem tud kárt tenni: a
  `szerepek` képesség **négy** filozófiában is szerepel, de mindegyik a sajátját
  írja.
- **Szerepek.** Hat szezon-szerep lesz három helyett (`roleKeysForStyle()`
  uniót ad), a kiosztó viszont mindig a nézett filozófia hármasát mutatja. A
  szerep **szintje a saját filozófiájából** jön (`roleLevel(kulcs)`) — a
  másodlagosban megvett „Kiosztott szerepek" nem emeli az elsődleges szerepeit.
- **Hangsúlyok.** Külön tár, külön lista és **külön hármas keret** stílusonként.
  A csúszka ereje a **saját filozófia szintjéből** számol: egy 3. szintű
  másodlagos csúszkája nem kaphatja meg a 15. szintű elsődleges erejét.
- **Szint.** Mindkét filozófiának saját 20 szintje, saját SXP-je és saját
  rangsora van. (A fejléc rangja is a sajátjából jön — ezt egy képernyőkép
  találta meg: a Beton 1. szintje előbb „Első passzok" volt, a Tiki-Taka rangja.)
- **A sztár.** A sztár, a híresség, a követelései és a cipők mindig ahhoz a
  filozófiához tartoznak, **amelyik viszi őket** — akkor is, ha az a másodlagos.
  Ezért kapott a teljes sztár-család egy saját torkot (`starStyle()`).
- **Az ujjlenyomat.** A meccs-statisztika stílus-csatornái (birtoklás, passz,
  támadás, védekezés) **átlagolódnak**, nem összeadódnak: ez leírás arról,
  hogyan játszik a csapat, és két labdatartó stílus összege lehetetlen
  birtoklást adna.

## Az ár

A másodlagos mérföldkövei **harmadannyi** csapatstílus-pontot fizetnek:

```js
styleIsSecondary(st) ? Math.max(1, Math.round(sp/3)) : sp
```

A harmadolás a **tempó-szorzó után** történik (`msSpReward`), tehát azt a
jutalmat harmadolja, amit valóban kaptál volna. A padló 1 pont: egy teljesített
mérföldkő ne fizethessen nullát — ugyanaz az elv, ami a tempó-szorzónál is áll.

## A pont közös — és ez nem új rendszer

A tárca (`msState().sp`) eleve **globális** volt, nem stílusonkénti. Az
„egyetlen nagy pool" tehát a meglévő rendszer tulajdonsága: a másodlagos
mérföldköveiből gyűlő pontot az **elsődleges fájára is elköltheted**. A vásárlás
a *nézett* fába megy, a pont a közösből fogy — a balance a játékos döntése.

## A felület

A stílus-panel tetején:

- amíg nincs másodlagos és még nem jár: egy visszaszámláló („még N idény");
- amikor jár: **„🎯 Válassz másodlagos csapatstílust!"**;
- utána: a két filozófia kártyája egymás mellett, és **„⇄ Ugrás a másodlagos
  csapatstílusra"** — alatta a teljes kezelőfelület átáll a másikra.

A nézet a mentésben is benne van (`S.styleView`), de **egyetlen játékmeneti
hatása sincs**: a próba külön méri, hogy a nézetváltás nem mozdít sem a
hatás-listán, sem a szerepeken.

## Szabályok

- Ugyanazt a filozófiát nem lehet kétszer felvenni, harmadik nincs, és a
  run-kapuk (Villámháború, Sztárom a párom, Tiki-Taka, Panzer) a másodlagosra is
  érvényesek.
- A választás itt is **végleges**.
- Régi mentésben nincs `style2` — ott null marad, és a panel a kapu nyílásakor
  felajánlja.

Mérés: `tools/masodlagos-stilus-proba.js` — 30 állítás.

---

# A kapu korábbra került (3.9.69)

Eredetileg a másodlagos a **3. lezárt szezon** után nyílt
(`STYLE2_MIN_SEASONS`). Ez a gyakorlatban a 4. idény elejét jelentette: addigra
az elsődleges filozófia már a felénél tartott, és a másodikat úgy kellett
elkezdeni, hogy a tárcát közben már régen szét kellett volna osztani. A döntés
későn érkezett ahhoz, hogy döntés legyen.

## A két út

Mostantól **két** út vezet a kapuhoz, és amelyik előbb ér oda, az nyitja
(`style2GateWhy()` — üres szöveg = nyitva):

| út | feltétel | konstans |
|---|---|---|
| **idő** | a **3. idény 15. fordulója UTÁN**, azaz a téli átigazolási ablaktól | `STYLE2_SEASON=3`, `STYLE2_ROUND=15` |
| **teljesítmény** | az **elsődleges filozófia eléri a 6. szintet** | `STYLE2_LEVEL=6` |

Az időbeli út a garancia: aki csak megy előre, a 3. idény telén megkapja. A
szint-út a jutalom: aki tényleg beleteszi a pontot az elsődlegesbe, hamarabb.

### Miért 6 és nem 7

A kérés szabad kezet adott a kettő között. A szint-ár görbéje dönt:
`1000×((L−1)/19)^1.6` — a **6. szint ~118 stíluspont**, a **7. ~157**. Az a
kérdés, megnyerhető-e a szint-út a garantált út ELŐTT. A 3. idény telére egy
figyelmes játékos reálisan 110–140 pontot gyűjt; 6-nál ez valódi verseny, 7-nél
a szint-út szinte sosem ér oda előbb, és akkor egy szabállyal többet írtunk le
anélkül, hogy bármit eldöntene. Ezért 6.

### Az idő mérése

A `style2GateWhy()` a szezonszámot és a **lejátszott bajnoki fordulók** számát
nézi (`S.seasonNumber`, a menetrend-index), nem a naptárt és nem az
átigazolási-ablak jelzőjét: a 15. forduló utáni állapot pontosan a téli ablak,
és ez az egyetlen mérce, amely a menetrend minden hosszánál ugyanazt jelenti.

Ha zárva van, a felület nem „nem"-et mond, hanem **kimondja, mi hiányzik**:

> „a 3. idény 15. fordulója után — vagy amint az elsődleges filozófiád eléri a
> 6. szintet (most 4.)"

illetve a 3. idényben: „még 6 forduló — vagy amint…". Ugyanez a mondat megy a
stíluspanel figyelmeztetésébe és a `chooseStyle2()` elutasításába is, tehát
nincs két igazság.

## A két felugró kártya

A lépcsőknél frissen bevezetett feloldás-ablak most a **két stílus-kapura** is
megszólal — ugyanaz a nyelv, ugyanaz az ablak:

- **`style1` · 🏛 „Eldől a klub filozófiája"** — amint az első választás
  megnyílik (`styleCanChoose()`).
- **`style2` · 🎯 „Jöhet a második filozófia"** — amint a fenti kapu nyílik
  (`style2CanChoose()`).

### Más emlékezet, mint a lépcsőké

Ez a lényegi különbség, és szándékos:

| | lépcső-kártyák | stílus-kártyák |
|---|---|---|
| jelző | `unlockState().seen` | `S.styleCardSeen` |
| hol él | `localStorage`, játékoshoz | a **mentésben**, karrierhez |
| meddig | a játékos életében **egyszer** | **minden karrierben** egyszer |

A lépcsők a játékos fejlődését jelzik — azt egyszer kell megtudni. A
stílusválasztás viszont **minden karrierben valódi esemény**, tehát minden
karrierben hír. Aki új klubot kezd, újra megkapja, mert újra igaz.

### Hol szólal meg

`styleCardTick()` a **HUB rajzolásából** fut (közvetlenül a `teachTick("hub")`
után). Ott áll a játékos, amikor a kapu kinyílik, és onnan egy koppintás a
menü. Két őr védi: `gameMode==="career"`, és `unlockGatesOn()` — **közös
karrierben egyik kártya sem ugrik fel**, ahogy a lépcsőknél sem, mert a PvP-ben
ilyen viselkedés eddig nem létezett.

## Mentés

Új mező: `S.styleCardSeen` (`{style1:1,style2:1}`). Régi mentésben hiányzik —
ott a kártya egyszer még megszólal, ami helyes: azt a hírt az a karrier még nem
kapta meg.

Mérés: `tools/masodlagos-stilus-proba.js` — a kapu-táblázat a
`[[2,10],[3,0],[3,14],[3,15],[3,29],[4,0]]` idény/forduló párokon, a szint-út
4/5-ön zárva és 6/7-en nyitva, plusz a két kártya (megjelenik, és másodszorra
már nem).
