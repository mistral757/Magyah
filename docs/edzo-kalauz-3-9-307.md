# 👔📖 Az edző mint idegenvezető (3.9.307)

## A kérés

> „Sok a rendszer. […] az edző lenne az idegenvezető, ahogy a 3.9.303 óta a
> meccs körül is ő beszél. Idény elején elmondaná, mi nyílt meg, és a menü
> tetején egyetlen javaslatot adna, hogy most mit érdemes csinálni. […] a
> legfontosabb, legtöbbet érő […] dolgokat egy-egy ablakban vizuálisan el
> lehetne magyarázni külön. Kicsit ilyen klasszik guide screenshot
> verzióban. Ezt csinálná az edző mint idegenvezető. Idénytől idényre."

## Amire épít

A játékban már van tanító réteg (3.9.172):

* a tipp-buborékok;
* a vezetett lépéssorok;
* a halk jelzések;
* a felül beúszó „push” és „újdonság” sáv.

Mind **egy regisztrátumból** dolgozik (`TEACH_TOPICS`): témánként van
`ready`, `due`, `prio` és `why`.

Az új rész **nem második súgó**. Ugyanazt a rangsort és ugyanazt a „Mutasd”
utat használja, csak az edző szájából, és képekkel.

## 1. Az edző szava — kártya a ☰ Menü fölött

**Hol van:** beágyazott kártya közvetlenül a ☰ Menü fölött, az edző nevével
és arcképével. Nem felugró ablak, így semmit nem takar el, és nem állítja meg
a játékot.

### Eligazítás

**Mikor jelenik meg:**

* új idény elején;
* vagy ha azóta valami megnyílt a menüben.

**Mi nyílt meg:** a menü gombjainak **láthatóságából** derül ki, tehát
pontosan abból, ami ténylegesen feloldódott:

* Talizmánok;
* Edzésterv;
* Boost-központ;
* Összhangépítés;
* Szakmai stáb;
* Megfigyelt játékosok;
* Scout-célzás;
* Run-szint;
* Infópult.

**Kivétel a Csapatstílus:** az ága a választás előtt is látszik (zárva).
Ott a választhatóság számít (`styleCanChoose`).

**Az idény kalauz-fejezetei** chipként jelennek meg, egy koppintással
nyílnak.

**„Értem”** után az eligazítás elcsukódik, egészen a következő idényig vagy
újdonságig.

**Az első alkalom csendes.** Ami ekkor eleve nyitva van, az alapállapot, nem
hír. Az új karrier 1. idénye köszöntéssel és az első fejezetekkel indul.
Egy régi mentés a következő idényváltáskor kap először eligazítást.

### Egy javaslat

**Honnan jön:** a tanító réteg legelső esedékes témája (`teachDueList("hub")[0]`),
a téma saját „miért” szövegével.

* **„Mutasd →”:** a vezetés saját útját hívja (`vezPushMutasd`). Kinyitja a
  menüt, és odavisz.
* **„›”:** a következő esedékes témára lapoz. Például: „2/6 · Boost-kedvezmény,
  amíg tart”.
* **Ha semmi nem esedékes:** egy olvasatlan kalauz-fejezet, vagy „Minden a
  helyén — kérj tőlem elemzést”.

### Mikor rejtett

* „Vezetés: Semmi” fokozatban a kártya rejtve van. A kalauz az Edző menüből
  ilyenkor is elérhető.
* Közös karrierben is él, mert a HUB ugyanaz.

## 2. Az edző kalauza — „guide screenshot” ablak

**Felépítés:** fejezetenként lapozható ablak. Minden lépés három részből áll:

* egy **élő képernyőkép**;
* rajta piros keretek és **számozott jelölők** (①②③④);
* alatta az edző magyarázata, a jelölők számaival.

### Az élő kép

A kép a **valódi HUB-elem másolata**, a mostani témában és állapotban.
Ezért sosem avul el, és sötét, Pixel vagy bármelyik témában ugyanúgy néz ki,
mint a játékban.

* **Az azonosítók** `data-kid`-be költöznek, így nincs kettőzött `id` a
  lapon.
* **A kép nem kattintható** (`inert`).
* **A még nem elérhető elemek** halványan, szaggatott kerettel látszanak.
  Így a kép azt is megmutatja, ami később nyílik.
* **A túl magas kép** 300 px-re kicsinyedik. A jelölők a kicsinyített helyet
  mérik, és ablakméret-váltáskor újraszámolódnak.
* **Ha a valódi elem üres** (például épp nincs kihívásod), tartalék-ábra jön,
  az ajánlat-kártya formájában.

### A fejezetek

| fejezet | nyílik | lépés | amit mutat |
|---|---|---|---|
| 👔 A HUB és a menü | 1. idény | 2 | a menü ágai; az Edző menüpont |
| ⚡ Meccserő | 1. idény | 2 | csapaterő vs. ⚡ vs. 📈; a különbség és a Meccserő-bontás |
| 💰 Büdzsé és átigazolás | 1. idény | 2 | a büdzsé-chip; a négy piaci út |
| ⚙️ Taktika és edzésterv | 1. idény | 1 | 85-ös küszöb; fő/mellék edzés, korszorzó |
| 🏁 Kihívások | 1. idény | 2 | évszak/szezon, 2+2 hely; a mért nehézség (72/48/26%) |
| 🧿 Talizmánok | ha nyitva | 1 | húzások, három lap, ritkaság |
| 🎯 Csapatstílus | 2. idény + választható | 2 | végleges döntés, mérföldkövek; szezon-szerepek, 20 szint |
| 📈 Run-szint és nehézség | 2. idény + látszik | 1 | a vállalás mércéje; a piramis |
| 🌱 Scout, akadémia, stáb | 2. idény | 1 | scout vs. ügynökség; akadémia; stáb |
| 🏆 Mérföldkövek és Infópult | 3. idény + látszik | 1 | az Infópult három füle |

**Honnan a számok:** a fogalomtárból (`GLOSSARY`) és a kódból valók:

* +1 ⚡ ≈ +13% / −11% gólvárhatóság;
* hazai +0,9 · idegenben −0,3;
* edzés 0,8 / 0,4, 21 év alatt kétszeres;
* kihívás 72 / 48 / 26%;
* talizmán-ritkaság 58 / 28 / 11 / 3%;
* stáb: 32 év és 2000 perc;
* akadémia: minden 4. meccs.

### Elérés

* a kártya „📖 n/N” gombja;
* a kártya fejezet-chipjei;
* az **Edző menü** új gombja („📖 Az edző kalauza · n/N fejezet”).

**A tartalomjegyzék** a zárt fejezeteket 🔒-tel és a nyílás idényével
mutatja. **Az utolsó lépés „✓ Értem”-je** olvasottnak jelöli a fejezetet: ✓
a listában, és a számláló nő.

## Állapot és mentés

```
S.kalauz = {v:1, sn, lat:[menüelemek], fej:[elmondott fejezetek], olv:{fejezet:1}}
```

A mentés kiírja, a visszatöltés visszaveszi (lásd `edzo` mellett). Az új
karrier tiszta lappal indul.

## Próba

`tools/edzo-kalauz-3-9-307-proba.js`, 24 állítás, valódi HUB-ban:

* a kártya helye; név és arckép;
* az 1. idény köszöntése; a csendes alapállapot;
* a javaslat = az első esedékes téma; „Mutasd” és „›”;
* „Értem”, az új menüelem és a csend;
* a 2. idény eligazítása;
* a kalauz:
  * tartalomjegyzék és zárt fejezetek;
  * mind a 14 nyitott lépés élő képet ad, id nélkül, `inert`;
  * a jelölők a képen belül vannak, 25/26 megjelenik;
* olvasottnak jelölés;
* az Edző menü gombja; a „Semmi” fokozat;
* a mentés;
* nincs oldalhiba.

Képek: `node tools/edzo-kalauz-3-9-307-proba.js <mappa>`.

## Mellékesen: az edzői elemzés esélyei

**A hiba:** az elemzés (3.9.300) a győzelem/döntetlen/vereség esélyét egy 0–10
gólos rácson számolta. Nagy gólvárhatóságnál (λ ≈ 3,6 fölött) ez ezrelékeket
levágott, ezért a három esély összege 99,9% lett. Az `edzo-3-9-300` próba a
teljes regresszióban ezt el is kapta.

**A javítás:** az esélyek a rács tömegére normalizálódnak. Ez csak a
kijelzést érinti, a meccsmotort nem.

## Teljes regresszió

**230/235 zöld.** Az öt piros:

* **`sargalap`:** az ismert, elavult mérőszkript.
* **`csapatszerepek-3-9-293`, `kispad-mester-3-9-292`, `frissites`:**
  meccset lejátszó próbák. Önmagukban kétszer egymás után zöldek; a
  véletlenszerű bukás a 4 párhuzamos böngésző terheléséből jött.
* **`edzo-3-9-300`:** a fenti 99,9%; javítva, zöld.
