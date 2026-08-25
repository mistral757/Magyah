# Meccsenkénti statisztika és játékos-értékelés

*(3.7.26 — a statisztika-réteg ELSŐ lépcsője. Érintett kód: `mstatCompute`,
`mstatRate`, `mstatProfileFit`, `mstatAxisZ`, `mstatPois`, `mstatShow` /
`mstatRender` / `mstatAfterMatch` / `mstatSyncBtn`, `MSTAT_STYLE_W`,
`MSTAT_POSS_SHIFT`, `MSTAT_PASS_MULT`, a `#mstatModal` markup és a `.ms*` CSS;
bekötés a `fullTime` végén és az `afterAllRewards` láncban.)*

## Mit tudott eddig a motor a mérkőzésről

Kettő dolgot mondott ki: az **eredményt** és a **meccs emberét**. Minden más —
ki mennyit tett hozzá, milyen volt a mérkőzés képe — a naplóban élt,
elbeszélve és szétszórva. A karrier-statisztika (`careerStats`) gyűjtött ugyan
gólt, gólpasszt, védést és tiszta lapot, de **meccs-szintű összegzés sehol nem
volt**, és a játékosnak nem volt egyetlen száma sem arról, hogyan játszott.

## Az alapelv: a számok nem díszletek

Ez a réteg **nem tesz zajt a végeredmény mellé**. Minden kiírt érték vagy
MÉRT (a szimuláció közben tényleg megtörtént), vagy a mérkőzés SAJÁT
paramétereiből származtatott. Konkrétan:

* a **kapura lövés sosem kevesebb a szerzett gólnál**;
* **az ellenfél védései PONTOSAN a mi kapura lövéseink mínusz a góljaink** — a
  négy szám (lövés/védés × két oldal) tehát egymásból következik, nem külön
  sorsolt, és nem mondhat ellent egymásnak;
* a **saját védéseink sosem kevesebbek a mérkőzésen elhangzott bravúroknál**
  (`saveCount`) — amit a napló kimondott, azt a táblázat nem tagadhatja le;
* a **labdabirtoklás** a Passz-tengelyedből, a taktikád stílusából és az
  erőkülönbségből áll össze.

A sorsolás **seedelt** (`rngFor`), és a kész számok a mentésbe kerülnek
(`S.lastMatch`) — nem a képlet. Egy újratöltés után az ablak ugyanazt mutatja.

## A hat csapat-statisztika

| sor | miből |
|---|---|
| **labdabirtoklás** | 50% + a taktika stílusa (`MSTAT_POSS_SHIFT`, a begyakorlás arányában) + a Passz-tengely z-je + az erőkülönbség; 24–76 közé vágva |
| **passzok** | 430 az 50%-hoz, ±8,4 birtoklási pontonként, × a rendszer szorzója (`MSTAT_PASS_MULT`) |
| **passzpontosság** | 78% + a Passz-tengely z-je + az erőkülönbség + a rendszer íze |
| **kapura lövés** | gól + a másik kapus védései (λ-ból húzva) |
| **labdaszerzés** | aki kevesebbet birtokol, többet véd: 11 + (100−birtoklás)×0,2 + a Védekezés-tengely z-je |
| **védés** | az ELLENFÉL kapura lövései mínusz a góljai, de sosem kevesebb a bravúroknál |

**A taktika akkor is látszik, ha még nem ül tökéletesen.** Az `MS.tacticStyle`
szándékosan csak 85-ös begyakorlástól él (ott a szimulációs szorzókat
kapcsolja); a labdabirtoklásnak viszont a NYERS stílus kell — egy félig
megtanult Labdatartás is birtokol, csak kevésbé. Ezt a `grip` fejezi ki
(a begyakorlás aránya, 0,35 padlóval).

## A játékos-értékelés

**Hét csillag, fél csillag lépésekben.** A **3,5 az „elvégezte a dolgát"** —
innen mozdul föl és le. A bemenetek (a **forma-rendszer kivételével**, az a
következő lépcső):

| tétel | súly | miből |
|---|--:|---|
| **rating a kereten belül** | ±0,9 | a saját kijelzett Ratingje a mai tizenegy átlagához mérve |
| **a csapat éle** | ±0,5 | a keret átlaga az ellenfél erejéhez mérve |
| **fejlődési szakasz** | ±0,4 | az életkor-görbe éves meredeksége (`ratingAtAge`) — a TSI a csúcson (`peak`) keresztül szól bele |
| **taktikához illő attribútumok** | ±0,6 | a saját tengelyei a taktika súlyprofiljához, a lapos 1/5-höz mérve |
| **csapatstílushoz illő attribútumok** | ±0,4 | ugyanez a filozófiád tengelyeivel (`MSTAT_STYLE_W`) |
| **eredményesség** | — | gól (poszt szerint 1,0–2,6), gólpassz 0,7, tiszta lap 0,5–0,8, védés 0,22/db (max 1,4), labdaszerzés 0,10/db (max 0,7), kapott gól a kapusnál −0,25/db az első fölött, meccs embere +0,5 |
| **csapat eredménye** | ±0,25 | tizenegyen nyernek, tizenegyen veszítenek |
| **piros lap** | −2,5 | a legsúlyosabb egyéni tétel |
| **játszott percek** | súly | nem tétel: az eredményesség a játékidő arányában számít, és a rövid beállás az alap felé húz vissza |

### Miért kettéválik a Rating-tétel

Az első változat egyetlen tételben mérte a játékost a mai ellenfélhez — és a
mérőn azonnal látszott a hiba: egy 88-as keret egy 78-as mezőny ellen
**tizenegy azonos, +1,0-s ráadást** kapott. A tétel tehát nem a játékosról
szólt, hanem az ellenfélről, és a tizenegy értékelése összecsúszott (4,5–6,5
egy sávban). Kettéválasztva a nagyobbik rész a **kereten belüli helyezés** (ki
a legjobb ember a pályán, ki a leggyengébb láncszem — ez adja a valódi
szórást), a kisebbik a csapat és az ellenfél szintkülönbsége.

Mérve, ugyanazon a kereten, négy mérkőzésen: a szórás **3,5–7,0** lett a
korábbi 4,5–6,5 helyett.

### Miért a lapos súlyhoz mérünk

A `mstatProfileFit` a csapat-szintű `tacticFitParts` mintájára pontoz: a
tengely-súly helyett a **lapos 1/5-höz mért többletsúly** szoroz. Mivel
Σ(w−1/5)=0, a játékos saját átlaga kiesik — a pontszám tisztán arról szól,
hogy a **rendszer arra épít-e, amiben ő jó**, nem arról, hogy jó-e általában
(azt a Rating-tétel méri). Ugyanaz az érv, mint ott, ugyanazzal a
levezetéssel.

### A „Sztárom a párom" nem tengely

A `MSTAT_STYLE_W` a hét filozófia tengely-súlyait tartalmazza, ugyanabban az
alakban, mint a `TACTICS` `attrProfile`-jai. A `sztar` szándékosan `null`: az a
filozófia nem egy tengelyre épül, hanem egy **emberre** — ott a kijelölt sztár
(`S.style.star`) kapja a ráadást.

### Az egyénileg kisorsolt statok

A **labdaszerzések** csapatszinten születnek, majd a kereten oszlanak szét:
súlyozva a Védekezés-attribútummal, a poszttal (hátul több, elöl kevesebb) és
a **játékidővel**. A maradék az utolsó emberhez kerül, tehát az egyéni számok
összege **pontosan** a csapat száma. A **védés** a kapusé — egy mezőnyjátékos
„védése" nem ugyanaz a fogalom.

## Az ablak

A lefújás után nyílik ki, és a bezárása viszi tovább a folyamatot.

**A lánc VÉGÉN áll, nem a lefújás pillanatában.** A jutalom-skill, a
felfedezés és az akadémia SAJÁT KÉPERNYŐT nyit — egy ablak azok fölött csak
elfedné őket. A sorrend így az, ami a mérkőzés után természetes: előbb a
jutalmak, végül a mérleg.

**Auto-módban nem nyílik ki** (a szezon végigjátszása nem állhat meg), de a
táblázat akkor is elkészül és mentődik. A meccsképernyő **📊 A meccs
statisztikája** gombja bármikor visszanyitja — ez a gomb csak akkor látszik, ha
van mit mutatni.

**A z-indexe 465**, nem a modálisok szokásos 60-as sávja: ez az ablak *kapuzza*
a folyamatot, tehát a vezetés alsó buborékai (440/445/450) nem takarhatják el
az OK gombot. Ugyanaz az érv, amiért a megerősítő kérdés 470-en ül.

A **három legjobb** kiemelten látszik; a `▼ A teljes keret értékelése` gomb
nyitja ki a többit. **Csak a saját keretünk** — az ellenfél egyéni
teljesítménye nem a mi tudásunk.

**A tettek sora szöveggel megy**, nem tömörített emoji+szám párral. Az első
változat `⚽2 · 🛡3` alakot írt, és a mérőn látszott a baj: a pajzs és a kesztyű
emoji készülékenként más glifára esik vissza, a mellé tapadó szám pedig
összeolvad velük.

## Tesztelés

Playwright-tal, valódi mérkőzéseken (Real Madrid 2011/12 kerettel):

- **konzisztencia minden meccsen**: kapura lövés ≥ gól mindkét oldalon; az
  ellenfél védései = a mi lövéseink − a mi góljaink; a mi védéseink = az ő
  lövéseik − az ő góljaik; a birtoklás két oszlopa 100; az egyéni
  labdaszerzések összege = a csapat száma;
- **nagyságrendek** négy mérkőzésen: birtoklás 58–66%, passz 499–586 / 307–373,
  pontosság 78,5–79,8 / 74,0–76,1, kapura lövés 4–13, labdaszerzés 16–19 / 21–25;
- **értékelések**: mind 0,5 lépésben, mind 0 és 7 között, a szórás 3,5–7,0;
- **auto mód**: hat forduló megállás nélkül lefutott, az ablak nem nyílt ki, a
  táblázat elkészült, és a 📊 gomb utólag megnyitja;
- **újratöltés**: a mentésből ugyanaz a táblázat és ugyanazok az értékelések
  jönnek vissza, a gombról megnyitva;
- **a bezárás után a folyamat nem akad el**: a Kezdőrúgás gomb újra él.

`tools/check.sh` zöld.

## Ami a következő lépcsőkre marad

* a **forma-rendszer** (a felhasználó külön kérte, hogy ez most maradjon ki) —
  ha megvan, egy új tétel lesz a `mstatRate` bontásában, semmi mást nem kell
  hozzányúlni;
* a meccsenkénti statok **halmozása** szezon- és karrier-szintre;
* az ellenfél egyéni statjai (ma szándékosan nincsenek).
