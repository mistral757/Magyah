# 3.9.201 — 🔍 A scouthálózat felfedezése a kerethez mért

> „1. Szezon 2. Meccs után talál egy ilyet a 3 csillagos scout. Ez jó így?
> Mekkora az esélye? Ha viszonylag normál esélye van (1db Joker kártyát
> választottam, ami növeli a ritka események esélyét 6%), akkor nem jó, mert
> azonnal megváltozik a teljes szezon egy ekkora igazolással, ingyen!"
> (képernyőkép: 86,5-ös keret, a talált játékos Kuszált Erikó, 97-es
> jobbhátvéd, ingyen)

## A válasz: nem volt jó így

### Honnan jött

**Az út:** a „🔍 Új felfedezés”, vagyis a scouthálózat ingyenes találata.
Bajnoki meccsenként két forrásból indulhat:

* **magától:** minden meccsen 5%;
* **teljesítmény-jutalomként:** mesterhármas, ötgólos győzelem, harmadik
  meccsemberség, két bravúr vagy kettős gólpassz esetén, eseményenként 15%.

**A kupában** mindkettő fele eséllyel indul.

**A Joker nem számít bele.** A „Vad idény” a meccs ritka eseményeire
(tizenegyes, piros lap stb.) és az átigazolási piacra hat, a felfedezésre
nem. Ennek a 97-esnek nem a Joker volt az oka.

### A hiba

**A felfedezés a teljes világ-poolból húzott, egyenletesen.** Sem a kereted
szintjét, sem a scout minőségét nem nézte. A fizetős piac közben a
kerethez mért sávban dolgozik (`signingBand`).

**Ígéret és valóság:** a tempó-táblázat azt írta, hogy „a scout által talált
játékosok szintje → `scoutQuality()`”. Ez a kódban sosem valósult meg.

### Mekkora volt az esélye (mérve, 3609 fős pool, a pool közepén álló kerettel)

**Egy felfedezésből a kereted átlagánál 10+-szal erősebb játékos jön:**

| | esély |
|---|---|
| Legendás magyahok nélkül | **4,1%** |
| Legendás magyahokkal | **~7,7%** (a 138 magyarból 83 ilyen) |

**Csak az 5%-os „magától” ágból számolva** (a teljesítmény-jutalmak
erre még rájönnek):

| | az első 2 meccsen | egy idényben | 10 idény alatt |
|---|---|---|---|
| magyahok nélkül | 0,4% | 6,0% | 46% |
| magyahokkal | 0,8% | 10,9% | 69% |

**Összegezve:** a te pillanatod (már a 2. meccs után) ritka szerencse volt.
Egy karrier alatt viszont szinte biztosan előjött volna. Egy idényben
nagyjából 1,5 felfedezés jön, és 78,5% eséllyel legalább egy.

### Miért épp egy magyar

**A Legendás magyahok két emelése egymásra rakódik a pool-építésben:**

1. a POT-padló (2200) előbb ~84-re húzza a csúcsot, és vele a kezdő Ratinget;
2. a Rating-emelés már erre az ~84-re ül rá (+4…+8).

**Az eredmény:** Kusnyír Erik adatbázis-értéke 67, a poolban mégis 88–90
lesz. Ehhez jön még a piramis piaci eltolása, így lett belőle 97.

**Mit ígér a kapcsoló leírása:** „80 alatt → 81–85”.

**Ez a verzió ezt nem változtatja meg** (lásd lent).

## A javítás: a felfedezés a piaci sáv alatt jön

**Ingyen van, ezért nem lehet jobb annál, amit a piacon vennél.**

* **Felső határ:** a piaci sáv közepe −2 (1★) … +1 (a legjobb scout). A
  scout minősége (`scoutQuality`) a tempóval együtt számít. Alap tempón egy
  3★ scout plafonja kb. a közép −1,5, egy 5★-é a közép −0,9. A határ soha
  nem lép a piaci sáv teteje fölé.
* **Alsó határ:** a piaci sáv alja −8.
* **A kúp csúcsa** a scout minőségével feljebb csúszik, tehát a jobb scout
  átlagban magasabbat talál.
* **Fiatal tehetségek:** a 24 évesnél fiatalabbak kétszeres súllyal jönnek,
  ahogy a Scout súgója mindig is mondta. Mérve a találatok ~80%-a fiatal,
  a sávban lévőknek csak ~49%-a az.
* **Üres sáv:** ha a sávban és alatta nincs senki, nincs felfedezés.
  Felfelé sosem lépünk ki.

**Mérve, 77-es kerettel:**

* **Új határ:** a találatok 64–76 közé esnek.
* **Régi húzás:** a pool 65%-a a mostani felső határ fölött volt, 4,1%-a a
  keret +10 fölött.

## Ami nem változott

* **A gyakoriság:** a felfedezés esélye és forrásai ugyanazok.
* **A már megkapott játékosok:** Kuszált Erikó nálad marad.
* **A Legendás magyahok emelései:** a két emelés halmozódása továbbra is
  felfújja a piacon (fizetősen) elérhető magyarokat. A felfedezésből
  viszont már nem jön ilyen.

## Próba

```bash
node tools/felfedezes-szint-3-9-201-proba.js
```

A próba **14 állítást** ellenőriz, valódi karrier-állással. A keret a pool
mediánján áll, mint egy draftolt keret.
