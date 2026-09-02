# 🎽 Visszavonulás — és miért nem az első szezon végén

*(3.9.06. Az érintett kód mind az `index.html` egyetlen script-blokkjában:
`planRetirementChance` / `maybePlanRetirement` / `shouldRetire` /
`retireSeasonEndAllowed` / `retireNoteAnnounce`, plusz a szezonzáró két
ciklusa (kezdő keret és tartalék-keret) és a családtag búcsúja.)*

## 0. Egy mondatban

Senki nem tűnhet el figyelmeztetés nélkül — és az **első idény végén
egyáltalán nem tűnik el senki**.

---

## 1. A rendszer két fele

**A TERV (`retirePlan`).** A játékos előre bejelenti, hogy még egy vagy két
szezon, és abbahagyja. A bejelentés szezonjában biztosan játszik, és a terv
szezonjának VÉGÉN megy el. Ez adja a felkészülési időt: van mikor utánpótlást
igazolni vagy poszt-tanulást indítani.

**A KOCKA (`shouldRetire`).** Akinek nincs terve, arra a szezonzárón lefut a
szokásos esély — 32 év alatt sosem, fölötte a korral és a csúcshoz képesti
hanyatlással nő. Mérve:

| kor | 33 | 34 | 35 | 36 | 37 | 38 |
|---|---|---|---|---|---|---|
| esély egy szezonzárón | 14% | 22% | 31% | 38% | 47% | 55% |

---

## 2. A hiba: az első szezon vége

**BEJELENTETT HIBA:** *„első szezonban ne legyenek visszavonulások. ott max
jelentsék be az 1 szezonon belüli visszavonulást szezon végén. jelenleg
ugyanis láthatatlan visszavonulásként működnek."*

A baj szerkezeti, és egyetlen sorban áll: **a terv kizárólag szezonvégén
születhet meg.** Az első szezonvég tehát az első alkalom, amikor bárki
bejelenthetne bármit — csakhogy **ugyanaz a szezonvég már vissza is
vonultat**.

Vagyis az első idényben *matematikailag* minden visszavonulás előzmény
nélküli. A felhasználó felállít egy keretet, lejátszik egy idényt, és egy
embere szó nélkül eltűnik. A későbbi szezonokban legalább van esély a
figyelmeztetésre; az elsőben nincs.

## 3. A javítás: a sorrend, nem a kocka

Az első szezon végén a kocka **nem visz el senkit, csak bejelent**. Aki most
menne, az még egy idényt játszik — és a bejelentés kimegy a naplóba **és** a
szezonjelentésbe is.

A bejelentés ilyenkor **nem kocka**: pont ő az, aki most abbahagyta volna,
tehát biztosan bejelenti, és a **következő idény végén** megy
(`retirePlan = 2`) — ez az „1 szezonon belüli visszavonulás".

Mérve (3000 minta egy 34 évesre):

| | visszavonult | bejelentett |
|---|---|---|
| **1. szezon vége** | **0** | 1506 |
| 2. szezon vége | 703 | 821 |

Az első idény bejelentési aránya magasabb, és ez szándékos: az a szezonvég,
amikor a keret öregedése egyszerre válik láthatóvá. A kényszerített
bejelentések (akik most mentek volna) és a szokásos, esély szerinti
bejelentések összeadódnak.

**A szabály mindenre áll:** a kezdő keretre, a tartalék-keretre és a
családtag búcsúzására is. Ő a keretben marad utána is, de a búcsú attól még
búcsú — az első idény után az sem érheti felkészületlenül a felhasználót.

---

## 4. Két apróság, ami menet közben derült ki

**A bejelentés két helyen másképp látszott.** A kezdő keret ága naplósort is
írt, a tartalék-keret ága csak a szezonjelentésbe. Ugyanaz az esemény, két
viselkedés — most egy közös könyvelő (`retireNoteAnnounce`) viszi mindkettőt.

**Az érkező neve nyersen ment ki.** A szezonjelentés visszavonulás-sora egy
`{out, in}` párt épít: a TÁVOZÓ neve át volt írva a megjelenítési rétegen, az
ÉRKEZŐé nem — egyetlen sorban, egymás mellett. Javítva, és a névháló megtanulta
ezt az alakot (`.in` / `.out`): mérve az egész fájlban egyetlen nem-név akad
fenn rajta, egy darabszám, az jelölést kapott.

---

## 5. Amit szándékosan NEM csinál

* **Nem tolja el a kort.** A 32 éves küszöb és az esélygörbe változatlan — a
  javítás a sorrendről szól, nem a keménységről.
* **Nem véd a második szezontól.** A terv nélküli, kockás visszavonulás a 2.
  idénytől ugyanúgy előfordulhat: ott már volt egy szezonvég, amikor a
  játékos bejelenthette volna. A figyelmeztetés esélye a rendszer része, nem
  garancia.
* **Nem nyúl a mezőnyhöz.** A világ többi játékosa a maga útján öregszik; ez a
  szabály a TE keretedről szól.
