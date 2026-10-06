# 3.9.208 — ⏱️ A négy résztempó

> „Külön kapcsoló a fejlődési tempón belül a következőkre: a) játékosok
> fejlődése, b) bevételek és kiadások (edzői bevétel + szurkolótábor +
> játékos fizetések), c) taktikai fejlődés (begyakorlás, illeszkedés,
> csapatstílus pontok gyűjtési sebessége), d) ifiakadémia (ajánlott
> játékosok base ereje és ajánlatok sűrűsége, játékosok fejlődési tempója az
> akadémián)"

## Hogyan néz ki

**A fő tempó-választó marad.** Alatta egy lenyitható sor van:
„⏱️ Részletes tempó”. Lenyitva négy választó jelenik meg; mindegyikben
„= a fő tempó” vagy a nyolc fokozat egyike választható. A zárt
fokozat (lépcső-kapu) itt sem választható.

**Alapból mind a négy a fő tempót követi** — aki nem nyit le semmit, betűre
a régi játékot kapja. Az összefoglaló és a HUB „Ami rögzült” sora egyéni
beállításnál tengelyenként mutatja a fokozatokat.

## Melyik csatorna hova került

| Tengely | Csatornák | Run-súly |
|---|---|---|
| 🏃 Játékosok | játékos-fejlődés (formapont, attribútum, passzív sebesség), edzői tapasztalat, skill-türelem, szezonkártya-küszöbök, scout-hatékonyság és ikon-esély, a nemzetközi kupák tempója — **és a mezőny természetes fejlődése** | 45% |
| 💰 Pénz | szezonkeret (edzői bevétel), lelátó, mérföldkő-pénz | 20% |
| 📋 Taktika | begyakorlás, összhang és párkémia, poszt-tanulás és beszokás (illeszkedés), csapatstílus-pont | 20% |
| 🌱 Akadémia | a tehetségek alapereje, az ajánlatok sűrűsége, a fejlődés az akadémián | 15% |

**A mezőny a játékos-tengelyt követi.** A játékos-tempó lassítása így nem
könnyítés: a világ ugyanabban az ütemben lassul.

## A fizetések

**Egyeztetett döntés: csak a bevétel lassul.** Ha a bér is ugyanannyival
lassulna, a pénz-tempó lassítása semmit nem jelentene.

**A buktató, amit a próba talált:** a bér a lelátó és a klubkeret részéből
áll, tehát magától követte volna a pénz-tempót.

**A javítás pontos, nem arányosított:**

* a két bér-összetevőt a játék úgy számolja, MINTHA a pénz-tengely a
  játékos-tengellyel egyezne (`wageTempoNeutral`, hatókörös felülírás);
* egy egyszerű szorzó túlkorrigált volna, mert a jegyár-tempó a lelátó
  bevételére nem egyenes arányban hat.

**Ha mind a négy együtt lassul** (a fő tempó), a bér a régi módon követi.

## A Run

**A karrier indulásakor rögzül a négy tengely** (`R.tempoAx`). A
„legkönnyebb használt fokozat számít” szabály tengelyenként él: menet
közbeni könnyítés lefelé húz, nehezítés nem javít visszamenőleg.

**A plafon tempó-tényezője a súlyozott átlag.** Ha mind a négy ugyanaz,
pontosan a régi érték (a súlyok összege 1).

**Régi karrierben** (nincs `R.tempoAx`) a régi, egyetlen tempó a mérce,
betűre.

## Közös karrier

**Mind a négy világ-tulajdonság:**

* a házigazda csomagjában utazik (`tempoAx`);
* a rögzítés a szobáé (`mpWorldTempoAx`), a mentés viszi;
* régi szobában (nincs térkép) mind a négy a szoba fő tempója;
* a szezonindítási alkuban az eltérést kimondja, a házigazdáét átveszi;
* a vendég átnézőjén zárolt.

## Mérő

A mérési napló beállításai között a négy tengely is ott van (`tempoAx`).

## Próba

`tools/reszt-tempo-3-9-208-proba.js` — 26 állítás.
