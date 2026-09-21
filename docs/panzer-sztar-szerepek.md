# 🛡️⭐ Szezon-szerepek a Panzernek és a Sztárnak (3.9.109)

## 1. Miért

KIMONDOTT KÉRÉS: *„Ennek megfelelően kell mindegyik csapatnak szezon szerepes
rendszer is: panzernek és sztárom a páromnak jelenleg nincsen."*

Igaz volt: öt filozófiának volt hármasa (Bombázók, Beton, Villám, Tiki-taka,
Harmónia, Gegenpressing), kettőnek nem. A keretlista szerep-jelvénye fölött
álló megjegyzés is ezt írta: *„ha a stílusnak nincs szerepe (Panzer, Sztár), a
jelölés hazudna."* Mostantól nem hazudik.

## 2. 🛡️ Panzer — egy mondat, három csatorna

Mind a három szerep ugyanarra épül: **„a piros lap minket nem rettent el."**
De három **külön csatornán**, tehát nem fedik egymást.

| szerep | mit ad | csatorna |
|---|---|---|
| 🪓 **A Mészáros** | amíg a pályán van, csökken az ellenfél gólesélye | `roleOppGoalMult` |
| 🎖️ **A Vezér** | amíg a pályán van, a kiállítás kevesebb **meccserőt** visz | `dialRedMatch` szorzója |
| 🐺 **A Falka** | **emberhátrányban** tovább csökken az ellenfél gólesélye | `roleOppGoalMult` |

| szerep | 0. szint | 3. szint | belépő |
|---|---|---|---|
| A Mészáros | ×0,965 ellenfél-gólesély · ×1,4 saját kockázat | ×0,895 · ×2,6 | védő vagy középpályás |
| A Vezér | a kiállítás ára ×0,80 | ×0,42 | **a keret legmagasabb karizmájú embere** |
| A Falka | ×0,96 emberhátrányban | ×0,86 | bárki |

### A Mészáros ára EGYBEN bevétel

Ez a játék egyetlen szerepe, aminek a **költsége** a stílus **jövedelme**. A
Mészáros jóval nagyobb eséllyel kap lapot és sérül meg — a Panzernél viszont
**minden sárga és piros rettenet pontot hoz** (`DREAD_PTS`). Külön kódot nem
kellett hozzá írni: a `fearNote` már ott ül a lap-csatornán.

A csapat **össz**-kockázata is nő, nem csak az eloszlás — egy ember a
tizenegyből, tehát a többletsúlyának a tizenegyed része. Ugyanaz a becsületes
számtan, mint a Kereszttűznél: a szerep valódi ár, nem csak áttolja a lapot
valakire.

### A Vezér: a stílus ígérete végre szám

A Panzer leírása szó szerint ezt mondja: *„a sérült bajtárs csak még jobban
összekovácsolja a keretet."* Eddig ez csak szöveg volt. A Vezér mellett egy
kiállítás **a meccserő-árának a felét-harmadát** viszi csak el.

**Ha őt magát állítják ki, nem véd** — a `redHas` a frissen felvett indexet is
látja, tehát a sorrend helyes. A próba ezt külön méri.

## 3. ⭐ Sztár — az egyetlen hármas, ami nem a viselőjéről szól

A filozófia grammatikája adott: *„egy ember, a többi kiszolgálja."* Ezért
**mind a három szerep a sztárról szól**, nem arról, akit kijelöltél. Ilyen
nincs máshol a játékban.

| szerep | mit ad | belépő |
|---|---|---|
| 🤝 **A Szolgáló** | nő a gólpassz-súlya, **esik a saját gólsúlya** | a sztáron kívül bárki |
| 🛡️ **A Testőr** | amíg a pályán van, a **sztár** lap- és sérülés-kockázata csökken | védő vagy középpályás |
| 👑 **Az Örökös** | amíg a sztár a klubnál van, a fiatal gyorsabban fejlődik | **legfeljebb 23 éves** |

| szerep | 0. szint | 3. szint |
|---|---|---|
| A Szolgáló | ×1,12 gólpassz · **×0,85 saját gól** | ×1,5 · ×0,55 |
| A Testőr | a sztár kockázata ×0,88 | ×0,62 |
| Az Örökös | fejlődés ×1,15 | ×1,6 |

**A Szolgáló az egyetlen szerep a játékban, ami elvesz a viselőjétől.** Ez
szándékos: a filozófia arról szól, hogy nem ő fejez be.

**A sztár maga egyik szerepre sem jelölhető** — a saját magát kiszolgáló,
saját magát őrző és saját magát öröklő ember értelmetlen.

**Az Örökös tanulása véget ér, ha a sztár elhagyja a klubot.** A hírnév
öröklését onnantól a stílus meglévő utód-mechanikája intézi
(`styleStarPickerHtml` „heir" ága) — ez a szerep azt készíti elő, hogy legyen
**kire** hagyni.

## 4. Egy aláírás-bővítés, visszafelé kompatibilisen

A Testőr az egyetlen szerep, aminek a hatása **más emberen** jelenik meg —
tehát tudni kell, hogy a viselője épp a pályán van-e. Ezért a
`roleRiskMult(name)` kapott két **opcionális** paramétert:
`roleRiskMult(name, active, redIdx)`.

A régi, kétparaméter nélküli hívás viselkedése **betűre változatlan** (ott a
Testőr egyszerűen nem hat) — a próba ezt külön állítja. A négy valódi hívási
hely (a helyi meccs kártya- és sérülés-ága, illetve a párharc pillanatképének
piros- és sárgalap-súlyai) mind megkapta a kontextust, tehát **a Testőr a
párharcban is működik**.

## 5. A kihívás-büntetés mindegyikre áll

A „3 meccsig nem működnek a csapatstílus szerepek" büntetés egyetlen kapun
megy (`roleStyleActive`), tehát az új hatra is érvényes — a próba mind a
hármat leméri fagyasztott állapotban.

## 6. Mérés

`node tools/panzer-sztar-szerep-proba.js` (9079-es port) — nyolc szakasz, 30
állítás: a hat szerep regisztrációja (kulcsok, attribútum-gazdák, és hogy az
Örökösnél **szándékosan nincs** gazda, mert ott a kor a mérce), a Mészáros
három hatása, a Vezér — beleértve, hogy őt kiállítva nem véd —, a Falka
ember­hátrány-kapuja, a Szolgáló kétirányú hatása, a Testőr a sztáron és a
visszafelé kompatibilis hívás, az Örökös kor-belépője és a sztár távozása,
végül a fagyasztás.
