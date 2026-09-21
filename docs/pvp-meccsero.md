# ⚡ A meccs-erő a PvP reprezentatív száma (3.9.104)

## 1. A bejelentés

Egy párharc után a két menedzser a saját számait hasonlította össze, és
kiderült, hogy a képernyőn álló szám nem az, amiből a mérkőzés eldőlt:

> „Neked mennyi a meccs erőd? … Lehet hogy annak a kiírása hasznosabb és
> reprezentatívabb lenne. Mert nekem az sokkal sokkal több mint a nyers."
> **173,3** vs **158,5**

KIMONDOTT KÉRÉS: *„Meccs erő legyen a PvP-ben a reprezentatív. Az mérje
egymáshoz a játékosokat. Az látszódjon az eredményjelzőn meccs előtt, közben.
Annak megfelelően legyenek összehasonlítva a hangolási pontokon."*

## 2. Mi volt a baj

**A motor már eddig is jól számolt.** A párharc gólvárhatósága a pillanatkép
`ovr`-jéből jön (`buildMatchSnapshot`: keret + morál + edző + aura + kapitány +
lendület + összhang + stílus), a `tacticEffect` pedig külön adódik hozzá.
Vagyis a mérkőzés **mindig is a meccs-erőn dőlt el.**

A FELÜLET viszont másik két számot mutatott:

| hol | mit mutatott | mi a baja |
|---|---|---|
| eredményjelző | `teamStrength()` / `dispOvr` | a nyers keret, a rejtett tagok nélkül |
| csapatlap | kirajzolt XI, top-14 keret, nyers csontváz | három szám, és **egyik sem** az, amiből a meccs számol |
| szezonindító alku | `str: teamStrength()` | ugyanaz |

A két szám nem apróság: a beküldött esetben a meccs-erő **173,3**, miközben a
nyers keret jóval alatta állt. A különbség pontosan az, amit a MENEDZSELÉS tesz
hozzá — morál, taktika, összhang, stáb. Ha a két menedzser egymáshoz méri
magát, azt kell látnia, ami a pályán dönt.

## 3. Mi változott

### 3.1 A csapatlap viszi a meccs-erőt

`mpTeamCard()` új mezője az `mstr` — pontosan a `teamMatchStrength()`. A
kártya kiírásában ez lett a **vezető sor**:

```
⚡ Meccs-erő: 158,5 (te 173,3 · +14,8)   — EBBŐL számol a mérkőzés
Kezdő tizenegy: 112,2 …                 — a fenti korongok átlaga
Keret (top 14): 108,4 …                 — ez a szezonzáró összevetés mércéje
Nyers csontváz: 101,5                   — a motor belső skálája
```

A másik három szám **megmarad**, mert más a dolguk: a top-14 keret a
szezonzáró összevetés és a kiegyenlítés mércéje, a nyers csontváz a meccs
utáni könyvelésé (óriásölés, „nagy skalp").

### 3.2 Az eredményjelző — meccs előtt és közben

`sbPaintTeams()` **párharcban** mindkét oldalon a meccs-erőt írja ki, és egy
**⚡** jelzi, hogy ez most más szám, mint amit a bajnokiban látsz:

```
⚡173,3          ⚡158,5
```

**Csak a párharcban.** Bajnokiban és kupában a te `teamStrength()`-ed és a CPU
`ovr`-je egy skálán van, tehát ott a mostani pár a helyes — ott betűre semmi
nem változott.

A társ száma a pillanatképéből jön (`DUEL.oppMatch` = `ovr + tacticEffect`).
A pillanatkép így három erő-mezőt visz, három feladatra:

| mező | mire |
|---|---|
| `ovr` | a szimuláció |
| `dispOvr` | a meccs utáni könyvelés (nyers csontváz-skála) |
| `oppMatch` | **a kijelzés és az összevetés** |

### 3.3 A szezonindító alku

A `myBidRec` az `str` (nyers keret, visszafelé kompatibilis) mellé a `mstr`-t
is felviszi — a nehézségi szint alkujánál is ez a beszédes szám, mert a
mezőnyt ehhez mérve állítjátok be.

## 4. Régi kliens: sosem kevert skála

Ha a társad kliense még nem ismeri a mezőt, a kártyán egyszerűen nem jelenik
meg a sor (null, nem hazug 0), az eredményjelzőn pedig **mindkét oldal** a régi
számon marad. Ez szándékos: két KÜLÖNBÖZŐ skálájú szám egymás mellett rosszabb
volna, mint két régi.

## 5. Amit ez NEM változtat

* **A kiegyenlítés (`mpApplyBalance`) és a párharc-ítélet matematikája** a
  top-14 keret-átlagon marad. Az szándékosan keret-MÉLYSÉGET mér („mindegy, ki
  a kezdő"), és egy méltányossági döntés, nem tévedés. Ha azt is a meccs-erőre
  akarod állítani, az külön kör — és balansz-változás, nem kijelzés.
* **A bajnoki és kupa kijelzése** betűre a régi.
* **A motor** semmit nem változott: eddig is a meccs-erőből számolt.

## 6. Mérés

`node tools/pvp-meccsero-proba.js` (9075-ös port) — hat szakasz: a kártya
mezője a `teamMatchStrength()`-tel egyezik; a hálózati tisztítás átengedi a
120 fölötti értéket (a beküldött 173,3-at is), a hiányzót null-ra teszi és az
irreálisat levágja; az eredményjelző párharcban a meccs-erőt mutatja
villám-jelöléssel; régi kliens ellen, bajnokiban és kupában pedig betűre a
régit. A próba a javítás előtti kódon nyolc állításon elhasal.
