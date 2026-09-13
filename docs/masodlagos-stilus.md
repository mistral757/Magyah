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

- A második választás a **3. lezárt szezon** után nyílik (`STYLE2_MIN_SEASONS`),
  ugyanazzal a mércével, mint az első (`styleSeasonsClosed`): a szezonszám csak
  a következő kezdőrúgásnál lép, a döntés helye viszont a szezonzárás.
- Ugyanazt a filozófiát nem lehet kétszer felvenni, harmadik nincs, és a
  run-kapuk (Villámháború, Sztárom a párom, Tiki-Taka, Panzer) a másodlagosra is
  érvényesek.
- A választás itt is **végleges**.
- Régi mentésben nincs `style2` — ott null marad, és a panel a 3. lezárt szezon
  után felajánlja.

Mérés: `tools/masodlagos-stilus-proba.js` — 20 állítás.
