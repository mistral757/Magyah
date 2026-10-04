# 3.9.186 — 🔓 A stílus-kategória nem vásárolható: az első teljesítés nyitja

> „Szüntessük meg azt, hogy pénzért lehessen megvenni a stíluskategóriákat.
> Pontosabban legyen az, hogy amint bármelyikből teljesül 1 mérföldkő, dobja
> fel, hogy megkaptad, megnyílt, és a megnyitáskor vonjon le a büdzsédből egy
> átlagos mérföldkő-jutalom árát pénzben. És mind a 6 kategóriánál csak egyszer
> legyen ilyen pénzlevonás, amúgy szépen lehessen őket gyűjteni."

## Ami volt

A hat csapatstílus-pontos kategória zárva indult. Pénzért lehetett megnyitni
őket, kategóriánként más áron, az edzői fizetéssel szorozva. Ami a zárás
alatt teljesült, az a megnyitáskor **beragadt**, és csak egy újabb fokozat
engedte ki.

## Mostantól

* **Nincs „Megnyitom” gomb.** Egy zárt kategória akkor nyílik meg magától,
  amikor bármelyik mérföldköve teljesül (`msScan` → `msAutoOpenCat`).
* **Ami benne teljesült, azonnal fizet.** Beragadt jutalom így nem keletkezik
  többé.
* **Felugró ablak:** „🔓 Stílus-kategória megnyílt”. Megmondja a kategória
  nevét, a levont díjat és azt, hány mérföldkő fizet most. Ugyanaz az ablak és
  ugyanaz a sorba állás, mint a kihívás-felugróé, a pixel témában is.
* **A díj:** egy átlagos pénzjutalmas mérföldkő értéke (`msCatPrice`).
  * Mind a 120+ pénzjutalmas mérföldkő jutalmának számtani közepe, pontosan
    azon a képleten, amin fizetnek: működési keret × a fokozat százaléka ×
    fék × korai lejtő.
  * A talizmános Mérföldkő-prémium kimarad belőle, hogy egy jutalom-növelő
    talizmán ne drágítsa a levonást.
  * A 🧿 Beragadt kincs kontrája (+15%) továbbra is erre a díjra ül.
  * A díj mind a hat kategóriánál ugyanaz, és a klubbal együtt nő.
* **Kategóriánként egyszer:** mind a hatnál egyetlen levonás, utána a
  kategória szabadon gyűlik.
* **Üres kassza:** a büdzsé nem megy nulla alá. Ha kevesebb van, annyi megy le,
  amennyi van, és a kategória akkor is megnyílik.

## A régi mentések

* **Már megnyitott kategória:** nyitva marad, újabb díj nem jár érte.
* **A régi, beragadt jutalmak:** a régi szabály szerint szabadulnak fel.
* **Zárt kategória, amiben már teljesült valami:** a következő kiértékeléskor
  megnyílik, egyszer levonja a díjat, és mindent kifizet, ami benne áll.

## A kihívás-jutalom

A „mérföldkő-kategória feloldása” jutalom továbbra is egy zárt kategóriát nyit
meg, **díj nélkül**. Holtversenynél a súlyosabb kategória nyílik meg (régen ez
a drágább volt). Ha már mind nyitva, a beragadt jutalmakat fizeti ki.

## Próba

`tools/merfoldko-kategoria-nyitas-3-9-186-proba.js` — 16 állítás.

Két régi próba igazodott:

* `merfoldko-kategoria-jutalom-proba.js`: a fizetős út helyett a régi mentés
  lenyomatát állítja elő;
* `talizman-f6a-proba.js`: a díj kisebb szám, ezért a kerekítés miatt ±0,5%
  a tűrés.
