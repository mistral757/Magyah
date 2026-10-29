# 🎯 Célzott skill a csapatstílus-boltban (3.9.335)

## A kérés

> „Minden csapatstílushoz tartozzon egy plusz dolog, amit a speciális
> pontjaiból vásárolhat (amiből csapaterőt is, panzernél ez a rettenet).
> Kiválaszthat szezononként kétszer 1 db skillt (változtatásra lehet szükség,
> ha megkapta a skillt, vagy egyszerűen meggondolta magát, de ezt rá bízzuk,
> csak jelezzük, hogy vigyázzon a kiválasztásnál), amit nagyobb eséllyel kap
> meg a csapat. Erre összesen 10x lehet ezt a speciális csapatstílus pontot
> adni, és eszerint erősödik a hatása két faktorosan: 1. A skill
> megszerzésének esélye nő 15 ⇒ 75% a 10 szint alatt, 2. A skill választható
> lesz, hogy kinek adjuk (realisztikus skill módban csak), 25 ⇒ 100%"

## Hol van

A stílus-panelen egy új, összecsukható szakaszban: **🎯 Célzott skill**.
Minden élő filozófiánál megjelenik, amelyiknek saját valutája van:

* a hét motoros stílusnál: villámpont, gólpont, betonpont, harmóniapont,
  passzpont, presszpont, csillagpont;
* a Panzernél: rettenet pont.

Ugyanabból a pénzből fizeted, amiből a csapaterő-szinteket (a Panzernél a
rettenet-szinteket) is veszed.

Két filozófiánál mindkettőnek saját célzása van: saját szinttel, saját
képességgel és a saját pénztárcájából.

## A szint és az ár

10 szint van. Az ár szintenként nő, és összesen fele annyi, mint a
csapaterő-létra:

| szint | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| ár (pont) | 20 | 30 | 45 | 65 | 90 | 120 | 155 | 195 | 240 | 290 |
| 1. hatás: a képesség esélye | 15% | 22% | 28% | 35% | 42% | 48% | 55% | 62% | 68% | 75% |
| 2. hatás: te választod, ki kapja | 25% | 33% | 42% | 50% | 58% | 67% | 75% | 83% | 92% | 100% |

Összesen 1250 pont. A csapaterő-létra 2500.

## A két hatás

**1. A képesség esélye.** Minden új képesség sorsolásánál külön dobás dönt:
a szint szerinti eséllyel a sorsolt helyett a célzott képesség jön. Ez a
dobás a többi torzítás (sebesség-, gól-, stílus-ág) előtt fut. Négy helyen
hat:

* a meccs utáni jutalom és a kihívás-jutalom paklijában;
* a realisztikus mód „nem te döntesz" ágán, a véletlen sorsolásnál;
* a realisztikus mód „nem te döntesz" ágán, a kiérdemlőnek szóló
  sorsolásnál, ha ő megkaphatja;
* a „te döntesz, mindent" típus-választásnál, ha a választott kategória a
  célzott képességé.

A dobás csak akkor sül el, ha a képesség feloldott, és van legalább egy
jogosult játékos. Ilyenkor a jutalom soha nem vész el.

**2. Te választod, ki kapja.** Ez a hatás csak realisztikus skill-módban
számít. Ha a gép döntene a címzettről, és a célzott képesség jött, akkor a
szint szerinti eséllyel mégis a megszokott választó nyílik meg. A napló ezt
kiírja. Laza módban amúgy is mindig te választasz, és a panel ezt meg is
mondja.

A kihívás-büntetés célzás-zára erősebb ennél: amíg él, a gép választ.

## Idényenként két választás

* Az első kijelölés is egy választásnak számít, a csere és a visszavonás is.
* A választás előtt megerősítő ablak jön. A panel figyelmeztet: „Válassz
  körültekintően: ha valaki megkapta, vagy meggondolod magad, a csere is egy
  választásba kerül."
* Új idényben újra két választásod van.
* A panel kiírja a kijelölt képességről:
  * hány játékosodnak van már meg;
  * hányan kaphatják még meg;
  * ha most senki sem kaphatja meg, vagy a képesség zárolt, hogy a célzás
    szünetel.

## Mentés

Az állapot a stílus-állapotban van, mint az `eng` és a `fear`:

```
S.style.celSk / S.style2.celSk = {lvl: 0..10, id: "<skill-id>"|null, valt: {sn, db}}
```

A `valt` az idény száma és az abban felhasznált választások száma.

## Próba

`tools/celzott-skill-3-9-335-proba.js` (20 állítás):

* a két görbe;
* a motoros és a Panzer-fizetés;
* a 10-es tető és a táblázat szerinti ár;
* idényenként két választás;
* a húzási arány: 10. szinten kb. 75%, 1. szinten kb. 15%;
* a realisztikus sorsolás;
* a 2. hatás: 10. szinten mindig te választasz, 1. szinten kb. 25%-ban,
  más képességnél nem hat;
* jogosult nélkül nincs célzás;
* a mentés;
* a panel: a kirajzolás, a megerősítő és a gomb;
* nincs oldalhiba.

## Mellékjavítás: hangulatjel Könnyed szobában

> „Ez furi. Miért ne lennénk közös szobában?"

A párharc-nap bevárásánál a hangulatjel-sor alatt ez állt: „Ehhez közös szoba
kell." Pedig a társ online volt.

**Az ok.** Saját bajnokságban (Könnyed) a `h2hRoomActive()` szándékosan
hamis, hogy a közös-világ szabályai kikapcsoljanak. A hangulatjel küldése, a
fogadása és a 📍 állás-jelzés viszont ugyanezt kérdezte, pedig nekik csak a
szoba kell.

**A javítás.** A három kapu mostantól az `mpRoomOn()`-ra (él a szoba) épül.
A közös-világ döntési kapui (stop, bevárás, verdikt) változatlanul zárva
maradnak.
