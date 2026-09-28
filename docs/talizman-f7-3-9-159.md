# 3.9.159 — Talizmánok F7: égetés, fúzió, rezonancia, Összhatás

> A döntés: „a színhűség maradjon, és fussanak együtt".

A 3.9.153-as **színhűség** (3 / 5 / 8 lap egy színben: az alaphatás ×1,10 /
×1,20 / ×1,35) marad. Mellé jön a terv rezonanciája: az **5 lapos
képesség** és a **7 lapos Mesterlap**. A terv 3 lapos „hangolódása" (a
csökkenő hozam 0,85 → 0,90) nem kell. A színhűség első fokozata ugyanazt a
csökkenő hozamot adja vissza, egyszerűbben.

## 🔥 Égetés

* Csak a nyári ablakban, idényenként egyszer, megerősítő ablakkal.
* A pro és a kontra megszűnik, és jár érte +3 szerencse.
* Ami a lappal érkezett, vele megy: a még várakozó jellemhullám és a Joker-csomag eseményei.
* A lap halványan, áthúzva a gyűjteményben marad, és nem számít a színbe.
* A menü fejlécében új chip áll: „🔥 égetés: 1 elérhető (nyáron)".

## 🧬 Fúzió és ✶ Mítosz

* **A kínálat.** Eddig kizárta a birtokolt speciálokat, így duplikátum sosem jött. Mostantól minden kínálati hely 12% eséllyel a már birtokolt, még nem Mítosz speciálokból választ, ha abban a színben van ilyen.
  * Ez a dobás **külön seedelt folyamból** jön: a fő kínálat véletlenje érintetlen.
  * A kínálat seedelt marad, visszatöltéskor sem változik.
* **A húzás-ablak.** Az ilyen lapon „🧬 ez a special már a tiéd — összeolvasztható" áll. Kiválasztva két gomb jelenik meg:
  * „🧬 Összeolvasztom → *új ritkaság*";
  * „Külön lapként a gyűjteménybe".
* **Az új lap.** A meglévő lap marad, új lap nem kerül a gyűjteménybe.
  * A ritkaság eggyel nő: a nagyobbik + 1, legfeljebb legendás.
  * Két legendásból **Mítosz** lesz (az 5. fokozat: E = 6,0, a pro skálája 3,9).
  * A jobbik alapdobás marad meg. Kétélű penge esetén a jobbik pro-dobás és a kisebb kontra-dobás.

## 🔗 Rezonancia (5 lap) és ⭐ Mesterlap (7 lap)

| szín | képesség | hol hat |
|---|---|---|
| 🔭 Scout | Tisztánlátás: minden felderítés első jelöltjének POT-ja köd nélkül | a felderítési lista |
| 🎭 Stílus | Stílusérzék: stíluspont +5% (a másodlagosé is) | `talSpSzorzo` |
| 📋 Taktika | Zökkenőmentes váltás: váltás után 3 meccsig a régi rendszer hatása is számít, a jobbik hat | `tacticEffect` |
| 🤝 Igazolás | Második esély: ablakonként egyszer a végleg meghiúsult tárgyalás újranyitható (magasabb áron) | a tárgyalás „Meghiúsult" képernyője |
| 🌱 Fejlődés | Kártyaérlelés: a szezonkártya POT-ajándéka +10% | `cardApplyPot` |
| 🎓 Stáb | Továbbképzés: idényenként minden stábtag +1 Szakértelem | a szezonváltás |
| 🃏 Joker | Még egy lap: minden húzáson eggyel több lap, díj nélkül | a kínálat |
| ❤️ Morál | Lelki támasz: a morál sosem esik 35 alá | a morál-padló |
| 💰 Bank | Hitelképesség: hitelkamat −2 pp, Befektetés +0,2 | a hitelkeret, a befektetés |
| ⚽ Meccs | Fő tengely: a legerősebb tengely +2 E | az alaphatás-összeg |

* **A Joker és a Kaszinó.** A kettő összeadódik: mindkettővel öt lap jön, a Kaszinó díja marad.
* **A Taktika-rezonancia a párharcban.** A `tacticEffect` a pillanatképbe kerül, tehát a párharcban is hat.
* **A Mesterlap.**
  * A 7. lap felvételekor a szín „várakozó" lesz.
  * A következő kínálatban egy hely legendás lap ebből a színből. Ha a szín nincs a kínálatban, az „ismerős" hely helyére jön.
  * A húzás, a passz is, elhasználja. Színenként egyszer jár.
* **Bejelentés.** A rezonancia és a Mesterlap megnyílását a napló kimondja.

## 🌈 Polihisztor-díj

* Ha mind a tíz színből van legalább egy (nem égetett) lapod, a menüben és a Rezonancia fülön megjelenik a választó.
* A választott színben egy **legendás, special nélküli** lap jár, ×1,25 alappal. A körvonala szivárvány.
* Egyszer jár.

## 🎭 Az archetípus-cím

A domináns szín címe (A Bankár, A Nevelő…, vegyes paklinál A Polihisztor)
eddig csak a menü fejlécében állt. Mostantól három helyen is látszik:

* **a szezonzáró jelentésben:** „🧿 A paklid" blokk, az archetípussal, a legendásokkal, a Mítoszokkal, a fúziókkal és a rezonáló színekkel;
* **a párharc-csapatlapon:** új `arch` mező. A megtisztítás csak ismert színt enged át, a cím rövid és jelölésmentes. Régi kliensnél hiányzik, ott nem íródik ki;
* **a profilban:** a Kártyatárral együtt (F8).

## A menü jobb oszlopa: fülek

* **Gyűjtemény.** Szűrő színre (a darabszámmal) és ritkaságra. Az elégetett lapok a végén állnak. Nyáron minden lap alatt „🔥 Elégetem" gomb van.
* **Összhatás** (a terv 14.3):
  * színenként az alaphatás (a csökkenő hozam és a plafon után), a lépcsős változatok, a prók, és a kontrák annak a színnek az alatt, amelyet ütnek;
  * mellette a rezonancia-képesség, és hogy mennyit érne a következő lap;
  * alul a **területenkénti mérleg**, például: „Fejlődési tempó: +7,5% (alap) −3% (Két hazát szolgál) −4% (Az Aranytojás) = +0,5%".
* **Rezonancia** (a terv 14.5): színenként a színhűség, a képesség és a Mesterlap állása, és a Polihisztor-díj.
* **Kártyatár:** az F8-ban.

Fekvő telefonon a jobb oszlop fülekkel együtt fér ki. A gyűjtemény a vízszintes polcon marad.

## Mentés

* **Új mezők a lapon:** `eget`, `egetSz`, `fuzio`, `poli`, `mester`.
* **Új mezők az állapotban:** `mester{szín:"var"|"kesz"}`, `poli`, `fuzDb`, `spAll.egetSz`, `spAll.rezTakt`, `spAll.rezIgaz`.

Régi mentésben mind hiányzik, ilyenkor semleges.

## Próba

`tools/talizman-f7-proba.js` (port 9198).
