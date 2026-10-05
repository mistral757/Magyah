# 3.9.204 — 🕹️ A Pixel téma saját élete

> „A pixelated témának lehetnének saját animációi, amik gombonyomáskor,
> játékosnézet megnyitáskor, új oldal betöltésekor, és idle állapotban is
> futnának. Szerintem tök menő lenne, ha élettel teli lenne az egész"

## Mikor fut

**Csak a Pixel témában.** A ✨ kapcsoló vezérli (ugyanaz, ami az élő hátteret),
tehát a „kevesebb mozgás” rendszer-beállítást is tiszteli.

**A mozgás lépcsős** (8 bites, `steps`). A Pixel téma „Szaggatott mozgás”
kapcsolóját kikapcsolva sima.

## 1. Gombnyomás

* **Lenyomódás:** a nagy gombok egy pillanatra 2 px-szel lenyomódnak, mint egy
  játékterem gombja. Ilyen a „Karrier indítása”, a menüsorok, a HUB-kártyák, a
  lépésgombok és a kezdőrúgás.
* **Pixelszikrák:** minden koppintásra az ujjad alól tíz pixelszikra pattan
  szét PICO-8 színekben (sárga, piros, kék, zöld, rózsaszín, narancs), lépcsős
  röppályán.
* **Nem árad el:** egyszerre legfeljebb három sorozat fut, gyors nyomkodásnál
  sem lesz belőle szikraeső.

## 2. Játékosnézet és ablakok

**A keretlista lenyíló játékos-adatlapja** és minden ablak úgy nyílik, mint
egy bekapcsoló képcső: középről, csíkról csíkra izzik fel, egy villanással.
Ilyen ablak a Beállítások, az Infópult vagy a megerősítők.

## 3. Új oldal

**Képernyőváltás:** a megjelenő szakaszok felülről lefelé, lépcsősen
rajzolódnak ki; a kezdőlap nézetei ugyanígy.

**Induláskor** (és ha a Pixel témára váltasz) egyszeri **képcső-bekapcsolás**
fut:

1. a sötét képernyő közepén egy fényvonal nyúlik ki;
2. a kép középről felfelé és lefelé kinyílik.

**Nem fog meg kattintást**, és fél másodperc alatt lezajlik.

**Biztonsági szabály:** ezek a belépők szándékosan nem mozgatnak
(`transform`), csak vágnak és áttetszenek. Így a fekvő HUB fix menüsávja nem
ugrik el — ez a 3.9.203-ban javított hiba volt.

## 4. Tétlenség — „attract mode”

**Ha 18 másodpercig nem nyúlsz semmihez,** a képernyő alján egy 8 bites
focista labdát vezet át balról jobbra:

* sárga mezben, fehér nadrágban;
* két futó képkockával, pixeles talaj-árnyékkal.

**Minden második körben** középen megáll, és **dekázik**: a labda négyszer a
feje fölé pattog, aztán továbbfut. A körök között 9 másodperc szünet van.

**Bármilyen érintésre, görgetésre vagy billentyűre** eltűnik, és az óra
újraindul. Háttérbe tett fülön nem fut.

## Próba

```bash
node tools/pixel-elet-3-9-204-proba.js
```

A próba **17 állítást** ellenőriz:

* induláskor a bekapcsolás és az eltűnése;
* a szikrák száma, a felső korlát és az eltűnésük;
* a játékos-adatlap, az ablakok és a szakaszok animációja, transform nélkül;
* a tétlenségi focista haladása, dekázása és eltűnése;
* hogy más témában és kikapcsolt ✨ mellett semmi nem fut;
* a lépcsős/sima mozgás.
