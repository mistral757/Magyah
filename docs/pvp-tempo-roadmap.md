# ⚡ PvP-tempó — roadmap

*(Terv, nem megvalósítás. Minden állítása a kódból van mérve, nem
emlékezetből. A három ötlet: tempó-módok időkorláttal · értesítés a társnak ·
párkereső.)*

---

## 0. Egy mondatban

A három ötlet **jó**, de kettőnek van egy-egy rejtett fala, amit előbb kell
megkerülni, mint elkezdeni: az **1.**-nek az, hogy *a hiányzó játékos keretét
senki nem tudja feltölteni helyette*, a **2.**-nak az, hogy *push-üzenetet
kliensből nem lehet küldeni*. Mindhárom fölött pedig ott van egy közös,
olcsó előfeltétel, ami ma hiányzik: **jelenlét-érzékelés és közös óra**.

---

## 1. A mostani rendszer — amit mértem

### 1.1 Hogyan vár ma a két kliens egymásra

Nincs push-értesítés a kliensek között: **2,5 másodpercenkénti lekérdezés**
megy (`h2hTick`), és a „készen állok” nem egy jelzőbit, hanem **maga a
feltöltött keret-pillanatkép** (`h2hWireSnapshot` → `h2h/<kulcs>/<host|guest>`).

Ez fontos: **a „ready” = adat**, nem szándék. Amíg a másik kliens nem tölti
fel a keretét, a mérkőzést nem lehet lejátszani, mert *nincs mit lejátszani*.

### 1.2 Hány várakozási pont van

Nem egy. Csak `MP_WAIT_*` beváró-készletből **tíz** van a kódban, plusz a
lobbi és a döntés-csatorna — mind saját szöveggel és saját őrökkel:

| kapu | mire vár |
|---|---|
| lobbi (`bothReady`) | mindkét játékos „kész” a szoba-képernyőn |
| párharc (`h2h/<forduló>`) | a két keret-pillanatkép |
| közös indítás (`MP_WAIT_START`) | a házigazda beállításai |
| szint-szinkron (`MP_LEVEL_KEY`) | a mezőny szintje |
| döntések (`mpDecisionKey`) | pl. folytatjuk / befejezzük |
| kupa: nevezés · csoportkör · párharc | `MP_WAIT_CUP` · `MP_WAIT_GROUP` · `MP_WAIT_TIE` |
| tabella, osztályozó, hazai kupa | `MP_WAIT_TABLE` · `MP_WAIT_PYRPO` · `MP_WAIT_MK` |

**Egy időkorlát-rendszer tehát nem egy helyre kerül.** Ha csak a párharcra
építjük be, a felhasználó a kupanevezésnél ugyanúgy beragad — és pont az volt
a panasz. (A `mpSoloArm` ma sincs mind a tízre bekötve: ez a rés már most is
ott van, csak kézi gombként.)

### 1.3 Ami MÁR most létezik kiútként

* **`mpSoloArm` / „⏭ folytatom egyedül”** — 25 másodperc után **megjelenik egy
  gomb**. Kézi, nem automatikus, és **nincs minden kapura bekötve**.
* **`mpCupSplitApart`** — a közös szálat kettévágja, mindkettő a saját
  tornáján megy tovább. **Ez a legfontosabb minta az egész tervhez** (lásd 3.2).
* **keret visszahívása** (`h2hWaitUnreadyBtn`) — a feltöltött pillanatkép
  visszavonható, amíg a meccs le nem futott.
* **`mpWaitWatchdog`** — 25 mp mozdulatlanság után kiírja, hogy megállt.
* **árva-felismerés** — ha a szoba eltűnt, kimondja és elenged.

### 1.4 Amiből semmi nincs

| hiányzik | következmény |
|---|---|
| **jelenlét** (`onDisconnect` nulla találat) | ma nem tudható, hogy a társ ott van-e, vagy tegnap óta nem indította el a játékot. Csak azt látod, hogy „nem kész”. |
| **szerveridő** (`ServerValue.TIMESTAMP` nulla találat) | minden időbélyeg **helyi óra** (`Date.now()`). Két gép órája percekkel eltérhet. |
| moderáció, jelentés, tiltás | idegenekkel való játékhoz kellene |
| szerveroldal (Cloud Functions) | push-üzenethez kellene |

### 1.5 A történet, amit érdemes komolyan venni

A kódban **65 „BEJELENTETT HIBA” blokk** van, és feltűnően sok közülük épp
PvP-holtpont: *„nem oldódott meg a PvP dolog, ebben a konkrét esetben még
mindig stuck mindkét fél.”* A mostani „nincs időkorlát, a képernyő mindig
elhagyható” **tudatos védekezés** ezekre.

> **Ez nem érv az időkorlát ellen — hanem arra, hogy az időkorlát ne
> HELYETTESÍTSE a kiutakat, hanem MELLÉJÜK jöjjön.** Egy automatikus
> továbblépés, ami félreszámol, nem lassú játékot csinál, hanem elrontott
> karriert.

---

## 2. F0 — a közös előfeltétel *(kicsi, és mindhármat kiszolgálja)*

Mielőtt bármelyik ötlet elkezdődne, két apróság kell. Együtt talán egy nap.

### 2.1 Jelenlét (`onDisconnect`)

A Firebase RTDB-nek van rá beépített eszköze: a kliens beír egy
`players/<id>/online: true`-t, és megmondja a szervernek, hogy kapcsolat-
bontáskor írja vissza `false`-ra. Ez **a szerveren fut le**, tehát akkor is
működik, ha a fül összeomlik.

Amit azonnal ad:

* a várakozó képernyő megmondhatja, hogy **„a társad most nincs online”** —
  ez önmagában megszünteti a panasz felét, mert ma a felhasználó nem tudja,
  hogy vár-e valamire, vagy hiába vár;
* az időkorlát csak akkor indul, ha a társ **tényleg nincs ott**;
* a párkereső csak élő ellenfelet kínál.

### 2.2 Közös óra

Minden határidő **szerveridőben** íródjon a szobába (`ServerValue.TIMESTAMP`,
illetve `.info/serverTimeOffset` a kliens-korrekcióhoz), és a **határidő
maga is adat legyen**, ne két kliens külön számolása.

> **EZ A LEGKÖNNYEBBEN ELRONTHATÓ RÉSZ AZ EGÉSZ TERVBEN.** Ha mindkét kliens
> a saját `Date.now()`-jából dönti el, hogy letelt-e a három perc, és az
> óráik két percet térnek, akkor **az egyik továbblép, a másik nem** — és
> abból nem lassú játék lesz, hanem kettévált világ. A határidő legyen egy
> mező (`deadlineAt`), amit az ír be, aki elsőként készen áll.

---

## 3. Ötlet 1 — Tempó-módok és időkorlát

### 3.1 A fal: a hiányzó játékos keretét senki nem tudja feltölteni

*„Utána automatikusan megyünk tovább az aktuális állással.”* — a kérdés az,
**mi az „aktuális állás”**, ha a társ kerete soha nem érkezett meg.

A szimuláció `h2hSimulate(home, away, …)` — **két** pillanatkép kell hozzá. A
hiányzó játékos kliense nem fut, tehát nem tud feltölteni semmit; a jelen
lévő kliens pedig nem tudja, milyen tizenegyet állított volna.

Ez nem részletkérdés: enélkül a „menjünk tovább” szónak nincs jelentése.

### 3.2 A tisztességes válasz — három lépcső, ebben a sorrendben

| helyzet | mit tegyünk | miért ez |
|---|---|---|
| **van korábbi pillanatképe** (2. fordulótól) | a **legutóbbi keretével** játszik | Ő állította össze. Nem ideális, de az ő döntése, és determinisztikus. |
| **nincs még pillanatképe** (1. forduló) | **nincs párharc**: mindkettő a saját CPU-fordulóját játssza | Nem hazudunk mérkőzést, ami nem volt. |
| **tartósan nem jön vissza** | **`mpCupSplitApart`** — a szálak szétválnak | **Ez a minta már létezik**, és ez a becsületes vég: két külön karrier, nem egy megcsonkított közös. |

> **Amit KIFEJEZETTEN NEM javaslok:** a hiányzó ellenfél keretének
> *kitalálását* (véletlen tizenegy, „átlagos” csapat, CPU-keret az ő nevében).
> Determinisztikusan meg lehetne csinálni, tehát *technikailag* működne — de a
> visszatérő játékos egy olyan meccset találna a történetében, amit nem ő
> játszott, olyan kerettel, amit nem ő választott. A PvP egyetlen valutája a
> bizalom; ez elköltené.

### 3.3 A három tempó-mód

A szoba létrehozásakor választható, és **a szobába íródik** (a vendég nem
tudja felülírni):

| mód | határidő | mi történik lejáratkor |
|---|---|---|
| **Kényelmes** *(a mai viselkedés, ez az alapérték)* | nincs | semmi; a 25 mp-es kézi „folytatom egyedül” marad |
| **Tempós** | **3 perc** *(a te javaslatod)* | **felajánlja** a továbblépést egy gombbal, hangosan |
| **Villám** | 3 perc | **magától** továbblép a 3.2 szerint |

Két megjegyzés a saját javaslatodhoz:

**(a) A „Tempós” szándékosan csak FELAJÁNL.** Így a 3 perces határidő
mérhetővé válik éles használatban, mielőtt automatikussá tennénk. Ha a
számok azt mondják, hogy jó, a „Villám” pusztán annyi, hogy magától nyomja
meg — ugyanaz a kód.

**(b) Az óra csak akkor induljon, ha a társ NINCS online** (F0). Ha ott van
és épp a keretét rendezi, a három perc kevés — az a legrosszabb fajta
időkorlát, ami a jelen lévő játékost bünteti.

### 3.4 Kockázatok

| kockázat | súly | kezelés |
|---|---|---|
| **óra-eltérés → kettévált világ** | 🔴 magas | szerveridő + `deadlineAt` a szobában (F0/2.2) |
| **a visszatérő játékos „elveszett” fordulót talál** | 🔴 magas | a visszatéréskor a kliensnek fel kell ismernie, hogy a forduló nélküle dőlt el, és **el kell mondania, mi történt** — nem némán átugrani |
| **mindkét kliens egyszerre lép tovább, kétszer** | 🟠 közepes | tranzakció a `sim` mezőre: aki előbb ír, azé; a másik azt olvassa (a mai logika már ilyen, meg kell tartani) |
| **a nyolc kapu közül csak egyre épül be** | 🟠 közepes | **közös őr**, nem kapunkénti másolás — a `mpSoloArm` már közös, arra kell ráépíteni |
| **a régi holtpont-hibák visszatérése** | 🟠 közepes | az időkorlát a kiutak MELLÉ jön, nem helyettük |
| a 3 perc rossz szám | 🟢 alacsony | legyen konstans, és mérjük |

### 3.5 Amit ez NEM old meg

A napokig elhúzódó játék attól még elhúzódik, ha a társad **egyszerűen nem
nyitja meg a játékot**. Az időkorlát azt oldja meg, hogy *te* ne ragadj be —
nem azt, hogy ő jöjjön. **Arra való a 2. ötlet.**

---

## 4. Ötlet 2 — Értesítés a társ eszközére

### 4.1 A fal: kliensből nem lehet push-t küldeni

Ez a terv legkeményebb korlátja, és nem megkerülhető ügyeskedéssel.

Egy push-üzenet elküldéséhez **szerverkulcs** kell (FCM HTTP v1 → OAuth2
szolgáltatásfiók). Ha ez a kliensbe kerül, **bárki bármit küldhet bárkinek a
te neveddel** — a kulcsot pár perc alatt kiolvassák a JS-ből. Tehát:

> **A „bökd meg a társad” gomb szükségszerűen szerveroldalt igényel.**
> Firebase-en ez egy **Cloud Function**, ami a **Blaze** (kártyás)
> csomagot kívánja.

**Költség.** A Cloud Functions ingyenkerete havi ~2 millió hívás; egy bökés
ennek a töredéke — reálisan **0 Ft**. A Blaze viszont bankkártyát kér, és
elvi lehetőség a megszaladás. **Költségriasztás kötelező**, nem opció.

### 4.2 Három lépcső, és az első ingyen van

**1. lépcső — bökés a játékon belül (szerver nélkül, ingyen).**
A bökés egy mező a szobában (`nudge: {by, at}`). Ha a társ **épp nyitva
tartja a játékot**, azonnal lát egy sávot: *„KLS321: a társad arra vár, hogy
továbblépj.”*
*Korlát:* csak akkor ér el, ha nyitva van a játék — vagyis pont azt az esetet
**nem** oldja meg, ami miatt az ötlet született. Cserébe egy nap alatt kész,
és a 2. lépcső ugyanerre az adatra épül.

**2. lépcső — igazi push (Cloud Function + FCM).**
A kliens feliratkozik, a tokenje a szobába kerül; a bökés egy Functiont hív,
az küldi az üzenetet. **Ez az, amit tényleg kértél.**

**3. lépcső — automatikus emlékeztető.** „A társad 12 órája vár rád.”
Ütemezett Function. Csak akkor, ha a 2. bevált.

### 4.3 Kockázatok

| kockázat | súly | kezelés |
|---|---|---|
| **szerverkulcs a kliensben** | 🔴 kritikus | soha; csak Cloud Function |
| **bökés-spam** | 🟠 közepes | szerveroldali fék (pl. 10 percenként egy szobánként), és a szabályfájlban is |
| **iOS** | 🟠 közepes | webes push csak iOS 16.4+ és **csak ha a kezdőlapra telepítették**. Androidon (TWA) rendben. Ezt előre ki kell mondani, nem hibaként kezelni. |
| **engedélykérés rossz pillanatban** | 🟢 alacsony | csak az első bökésnél kérjük, ne induláskor |
| **Data safety** | 🟢 alacsony | az FCM-token új adattípus, deklarálni kell |

---

## 5. Ötlet 3 — Párkereső

### 5.1 A technikai rész a könnyebbik fele

Egy `mp/queue` ág: belépsz `{szerep-preferencia, at}`-tal, és a kliens keres
egy párt. **Tranzakcióval**, különben ketten is elkapják ugyanazt az
ellenfelet — ez az a hiba, ami tesztben soha nem jön elő, élesben azonnal.

### 5.2 Ami viszont NEM technikai, és nagyobb

> **A párkereső idegeneket ültet egymás mellé, és ez megváltoztatja azt is,
> hogy MILYEN app a Magyah — nem csak azt, hogy mit tud.**

**(a) Az `mp` ág ma bejelentkezés nélküli.** A szabályfájl a szobakódot
tekinti belépőnek. Barátok közt ez elég; a nyilvános sorban **nem** — ott
`auth != null` kell, különben a sort egyetlen szkript kiüríti.

**(b) A Play-besorolás megváltozik.** Az IARC-kérdőívben van kérdés arra,
hogy a felhasználók **kapcsolatba léphetnek-e egymással**. Ma a válasz
„baráti szoba, kóddal”; a párkeresővel „igen, idegenekkel”. Ez **emeli a
korhatárt**, és a Data safety űrlapon is más lesz. A becenév innentől nem a
barátaidnak látszik, hanem bárkinek.

**(c) Moderáció.** Ha idegenek látják egymás becenevét, kell **jelentés és
tiltás**. Enélkül az első trágár becenév a te problémád lesz, nem a
felhasználóé.

**(d) Az adatvédelmi tájékoztatót módosítani kell.** Ma azt mondja, a
kétjátékos mód baráti funkció. A párkeresővel ez nem lesz igaz.

### 5.3 És egy gyakorlati kockázat

**Az idegenek sokkal gyakrabban hagyják ott a játékot, mint a barátok.** Egy
párkereső időkorlát nélkül nem gyorsítaná a PvP-t, hanem **elrontaná**: tele
lenne félbehagyott közös karrierekkel.

> **Ezért az 1. ötlet nem opcionális kísérője a 3.-nak, hanem az
> előfeltétele.**

---

## 6. A javasolt sorrend

```
┌─ F0 · JELENLÉT ÉS KÖZÖS ÓRA ────────────────────────────────┐
│ onDisconnect + szerveridő. Kicsi, és mindhármat kiszolgálja.│
│ Önmagában is javít: „a társad most nincs online”.           │
└─────────────────────────────────────────────────────────────┘
      │
┌─ P1 · TEMPÓ-MÓDOK ──────────────────────────────────────────┐
│ Három mód, a Kényelmes az alapérték. 3 perc, előbb          │
│ FELAJÁNLVA (Tempós), és csak a mérés után automatikusan.    │
│ A hiányzó keret kezelése a 3.2 lépcsői szerint.             │
└─────────────────────────────────────────────────────────────┘
      │
┌─ P2a · BÖKÉS A JÁTÉKON BELÜL ───────────────────────────────┐
│ Szerver nélkül, ingyen. Egy nap. A P2b-t is előkészíti.     │
└─────────────────────────────────────────────────────────────┘
      │
┌─ P2b · IGAZI PUSH ──────────────────────────────────────────┐
│ Cloud Function + FCM. Blaze kell hozzá, költségriasztással. │
└─────────────────────────────────────────────────────────────┘
      │
┌─ P3 · PÁRKERESŐ ────────────────────────────────────────────┐
│ Csak P1 UTÁN. Auth az mp ágra, moderáció, IARC-újranézés,   │
│ adatvédelmi tájékoztató módosítása.                         │
└─────────────────────────────────────────────────────────────┘
```

**Miért ez a sorrend.** Az F0 olcsó, és nélküle a P1 órája vakon jár. A P1
önmagában megoldja a bejelentett panasz nagyobbik felét (a beragadást), és
nem kér pénzt. A P2a ingyen próbálja ki, hogy a bökés egyáltalán segít-e,
mielőtt Blaze-t kapcsolnánk. A P3 a legdrágább és a legkockázatosabb, és a
P1 nélkül visszafelé sülne el.

---

## 7. Amit szándékosan NEM javaslok

* **Ne találjuk ki a hiányzó játékos keretét.** Lásd 3.2.
* **Ne kerüljön szerverkulcs a kliensbe** semmilyen „ideiglenes” formában.
* **Ne kapjon a „Kényelmes” mód is időkorlátot.** A mai viselkedésnek maradnia
  kell alapértéknek: a barátaival hétvégenként játszó felhasználót egy
  automatikus továbblépés nem gyorsítaná, hanem meglopná.
* **Ne kapunként másoljuk az időkorlátot.** Nyolc kapu van; nyolc külön óra
  nyolc külön hibát jelent.
* **Ne induljon a párkereső időkorlát nélkül.**
