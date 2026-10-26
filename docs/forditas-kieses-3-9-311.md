# 🛟 Fordítás, mégis kiesés: a lefújás nem akadhat el (3.9.311)

## A bejelentés

> „a nyári kupában negyeddöntő második meccse után elakadt a guest. Nem
> engedi őt tovább. Nem ad be neki várakozó képernyőt, semmit."

A 3.9.309 védőhálói után:

> „A guest továbbra is be van ragadva ugyanott..."

## Amit a két diagnosztika mutatott

**Guest:**

* nyári kupa (NYK), negyeddöntő, `idx 1`;
* az útvonal utolsó eleme `ko:qf 1:2` — vagyis a visszavágó eredménye
  **nincs a mentésben**;
* van élő meccs-rekord a szobához (`::elo`).

A visszavágó tehát lement, de a lefújáskori mentés már nem történt meg.
Újratöltéskor a meccs ugyanazzal a sorsolással áll vissza, ezért ugyanott
akadt el újra.

**Host:** a HUB-ban az idényrajtra vár. Nem ő akasztja meg a guestet.

## Az ok

Kupa-visszavágón a **meccs embere a továbbjutáshoz kötött**: ha a párharc
elveszett, aznap nincs meccs embere (`best = −1`), akkor sem, ha a napi
eredmény döntetlen vagy győzelem.

**A hibás ág:** ha a csapat a meccsen hátrányból hozta ki a pontot
(„🔥 Fordítás!"), a fordítás jutalma a meccs emberének formapontot ad. Ez a
sor a `best` ellenőrzése nélkül olvasta az `active[best]`-et. Fordítás +
kiesés esetén ez `active[-1]`, vagyis `undefined` — és a `fullTime` itt
hibára futott:

* az eredmény nem mentődött;
* a lefújás utáni lánc el sem indult;
* `S.playing` igaz maradt;
* nem jött se ablak, se várakozó képernyő.

**Nem PvP-hiba, és nem a mostani módosítások okozták.** Minden kupa
visszavágóján előjöhetett, amióta a meccs embere a továbbjutáshoz kötött.
A guest esete pontosan ez volt: az első meccs 1:2 lett, a visszavágón
fordítás jött, a párharc mégis elveszett.

**A reprodukció** a guest pontos állapotával (1. idény, MK / split közös
kupa, NYK negyeddöntő, első meccs 1:2) a valódi felületről indítva 10
visszavágóból 3-szor akadt el, mindháromszor ugyanazzal a hibával:

```
TypeError: Cannot read properties of undefined (reading 'p') at fullTime
```

## A javítás

A fordítás formapont-jutalma csak akkor jár, ha van meccs embere
(`best >= 0`). A morál-löket és a „Fordítás!" sor marad, mert az a csapatnak
szól.

**A beragadt guest:** a 3.9.311 betöltése után az újratöltés visszajátssza a
visszavágót (ugyanazzal az eredménnyel), a lefújás most lefut, és a lánc
megy tovább.

## Próba

`tools/forditas-kieses-3-9-311-proba.js`, 4 állítás.

**Amit csinál:** valódi NYK-negyeddöntő visszavágókat játszik a felületről
indítva. Az első meccs 0:4, így a párharc szinte mindig elveszik. Addig
játszik, amíg kétszer elő nem áll a „fordítás + kiesés" eset (legfeljebb 40
meccs).

**Amit mér:**

* az eset tényleg előállt;
* ilyenkor a lefújás lefut, a lánc elindul, és nincs meccs embere;
* minden visszavágónál elindul a lánc;
* nincs oldalhiba.

**Javítás nélkül** a próba piros: ugyanaz a `TypeError`, és a lánc nem
indul el.
