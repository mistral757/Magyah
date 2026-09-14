# Panzer: fordított jellem, félelem és rettenet (3.9.68)

A diagnózis szerint a Panzer volt a legkevésbé választott filozófia: a belépője
egy **2,06%-os draft-lottó**, a jutalma pedig a hét közül a **legszegényebb fa**
(82 mérföldkő, 996 pont). Ez a három rendszer fordítja meg — és nem úgy, hogy
több pontot ad, hanem úgy, hogy a Panzer **saját gazdaságot** kap.

## 1. A jellem abszolút értéke

A Panzernél a személyiség **alapból fordítva hat a csapatra**: aki máshol
mérgezné az öltözőt, itt összetartja.

**Mit fordítunk meg, és mit nem.** A jellem **neve és szintje változatlan**: a
vandál marad vandál, a keretlistán is annak látszik. Ami megfordul, az a
**hatása a csapatra** — a morál, az öltözői események, a kapcsolatok épülése, a
kapitány-alkalmasság és az elvágyódás. **Nem** fordul meg:

- a **karizma** (a kérés kimondottan kiveszi),
- a **lapkockázat** — az nem „hatás a csapatra", hanem a pályán történik, és a
  Panzer épp abból él: a lapokból rettenet lesz,
- a mérföldkövek és a stílus-kapu negatív-jellem számlálói (azok a keret
  *összetételét* mérik, nem a hatását).

### A képesség: „Fordított jellem" (II. sáv)

Két ág, külön mozdul:

| szint | negatívból lett pozitív | pozitívból lett negatív |
|---|---|---|
| 1 | **+10%** | **−75%** |
| 2 | **+25%** | **−110%** → átfordul pozitívba |
| 3 | **+33%** | **−150%** |

A 2. szinttől a csökkentés 100% fölé megy, tehát a „jó fej" ember hatása is
**visszafordul pozitívba** — szerényebben, de pozitívba. Mérve (a próbában): a
„mindenki szereti" ember hatás-oldali értéke 0,375 → 0,55 → 0,75.

## 2. Félelem szint

**A két szám szétválik, és ez a rendszer lelke:**

- a **félelem szint** egy **állapot** — nem gyűjtöd, hanem *van*: a keret
  negatív jellemeiből számol, és a csapatstílus-szint nagyítja fel. Aki eladja
  a vandált, annak azonnal esik;
- a **rettenet pont** egy **valuta** — meccsenként gyűlik.

```
bázis = Σ (zárkózott kapcsolódás + forró vérmérséklet + gyenge karizma) × 10
szint = bázis × (0,5 … 2,0)     ← a csapatstílus-szint 1-től 20-ig
```

A bázis a **nyers** jellemből számol, nem a hatás-oldaliból: a félelem azt méri,
mennyire *ijesztő* a keret, nem azt, hogy ez nekik jót tesz-e. A kettő a
Panzernél épp ellentétes irányba mutat — és pont ez a filozófia poénja.

## 3. Rettenet pont

Meccsenként a félelem szint **10%-a** gyűjthető. A tételek:

| esemény | pont |
|---|---|
| sárga lap | 0,5 |
| piros lap | 2 |
| meccserő-fölény | max 5 (+5 fölött a teljes) |
| mesterhármas | 1 |
| kemény belépő | 0,5 |
| védekező villanás | 0,1 |

**A „sima szerelés" a motorban nem külön esemény**: a szerelés a
védekezés-szorzóban van elrejtve, kimondott eseménye csak a kemény belépőnek
van. Ami a motorban ténylegesen egy kis védekező tetthez tartozik, az a
**védekező villanás** (blokk, szerelés, fegyelem-skill a hátsó alakzatból) — a
Panzer ezt gyűjti 0,1-es tételként.

A mérleg a **kezdőrúgásnál nullázódik** és a lefújásnál könyvelődik: egy
félbehagyott mérkőzés nem hagy maga után fél rettenetet.

## 4. A bolt — a stílus-panel „☠️ Félelem és rettenet" fülén

| tétel | mit csinál | ár |
|---|---|---|
| 🗡 **This is Sparta!** | egy játékos **vérmérséklete** egy fokozattal durvább | 40 |
| 🚫 **Senkit se szerettem!** | egy játékos **kapcsolódása** egy fokozattal zárkózottabb | 40 |
| ⚔️ **Háború istene** | egy játékos **karizmája** egy fokozattal nő | **80** |
| 😱 **Rettegés** | a félelem szint százaléka meccserővé válik | 150…3500 |

A Háború istene azért kétszeres árú, mert a karizma az **egyetlen**, ami a
Panzernél sem fordul meg — ott tiszta nyereség.

**Ez az önmagát hajtó kör:** a rettenetből vett jellem-módosítók rontják a keret
jellemét → nő a félelem szint → több rettenet fér egy meccsbe.

### Rettegés: 10 szint, +20-as plafon

| szint | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| % | 2 | 3,5 | 5 | 6,5 | 8 | 9,5 | 11 | 12,5 | 14 | 15 |

Az n. szinthez **(4+n). csapatstílus-szint** kell — az első tehát az **5.
szinten** nyílik, ahogy a kérés mondja. A hatás **százalékos**, tehát mindig
számít, mekkora a félelem szinted; a **+20-as plafon** viszont abszolút, afölé a
legmagasabb félelem sem visz. (A 10. szinten 15% → a plafonhoz ~133-as félelem
szint kell.)

A bónusz a `styleOvrBonus()`-ba fut be (a motor ebből az egy számból dolgozik),
és a `hiddenMatchBonus()`-ba is — különben a játékos egy +20-as hatást venne
meg, ami sehol nem látszik. A kettő nem kettőzi meg egymást: a motor az elsőt
használja, a tanácsadó és az erősáv a másodikat.

---

## Az egyenlítő 250 perces belépője (ugyanebben a verzióban)

> „ne lehessen »ingyen« lehúzni egy scout által talált öreg magas ratingút
> azért, hogy egy ifisedet jelentősen felemeld."

A lyuk valódi volt: az egyenlítő az **átlag és a legjobb közti résből** számol,
tehát egy frissen igazolt, magas Ratingű ember **puszta jelenléte** felhúzta a
célszámot — utána eladható volt, a nyereség pedig a keretben maradt.

Mostantól csak az vehet részt, akinek **250 perce** megvan a klubnál (bő két és
fél mérkőzés) — sem adóként, sem kedvezményezettként. A felület szürkíti és
kimondja („120/250 perc a klubnál"), a végrehajtás pedig **külön is szűr**: egy
félbemaradt kijelölés se csúsztathasson be friss igazolást.

Mérve: 80 + 120 + egy 200-as újonc (100 perc) → a cél **115**, nem 183.

Mérés: `tools/panzer-felelem-proba.js` — 22 állítás.
