# 3.9.194 — 🗞️ A lap a te klubodról szól

> „Ja hát persze, a csapatstílust is bele lehet vonni, meg az edzőt, meg
> ilyesmi! Szerintem ezek mind növelnék az immerziot. Akár a stadion nevét
> is, stb. Szóval ez legyen egy felület ami még növeli azt az élményt, hogy
> mindez a te csapatodról szól"

A 3.9.193-as történet-réteg (`pressStoryApply`) új jelöltcsoportot kapott:
**a klub saját arcát**. Ez **44 új sablon**; a lap összesen 109 sablonból
ír.

## 1. A csapatstílus — csak a te filozófiád szól bele

| stílus | mikor | példa |
|---|---|---|
| 🧲 Gegenpressing | legalább 4 labdaszerzés az ellenfél térfelén ezen a meccsen (a meccs saját számlálója) | „Letámadás-lecke: 6 labdát szereztek vissza az Ellenfél SE térfelén” |
| 🛡️ Panzerkampfwagen | győzelem 2+ góllal vagy kiállítás mellett | „Lánctalpak a gyepen — 3–0, a greenkeepernek holnap sok dolga lesz” |
| 🧱 Beton védelem | kapott gól nélkül, nem vereség | „Beton: az Ellenfél SE csatárai ma is falba ütköztek” |
| ⚽ Bombázók | 3+ lőtt gól | „Bombázók: 4 gól — a lelátón már számolni sem bírták” |
| ☯️ Béke és harmónia | morál 70+, nem vereség | „…öltözőjében még a szertáros is mosolyog” |
| ⚡ Villám | győzelem 2+ góllal | „Villámcsapás: … gyorsabb volt, mint az Ellenfél SE gondolatai” |
| 🌀 Tiki-Taka | győzelem 2+ góllal | „Passzorgia: … játékosai a labdát csak hírből ismerték” |
| ⭐ Sztárom a párom | a sztár gólja vagy gólpassza egy győzelemben · vereség, amelyben a sztár nem termelt | „X-show — a többiek ma csak statisztáltak” · „Hol volt a sztár? X ma láthatatlan maradt” |

A „két filozófia, egy klub” esetén mindkét élő stílus szólhat
(`styleHasLive`). A ki nem választott stílus nem szól bele.

## 2. Az edző és a taktika

* **Az edző neve** (`shortName(coach.n)`):
  * győzelemnél: „X mesterkurzusa: …”;
  * döntetlennél: „X a kispadon vakarta a fejét…”;
  * győzelmi sorozatnál: „X keze nyoma: 5 győzelem sorban”;
  * fekete szériánál: „Inog X széke? 3. vereség sorozatban — a vezetőség
    »teljes bizalmáról« biztosította”.
* **A taktika neve:** „Működik a recept (Gyors kontra): …” · „Taktikai
  kérdőjel: Hosszú labdák — ma nem forgott a gépezet”.

## 3. A stadion, az idegenbeli meccs, a menedzser

* **A stadion neve** (`identStadiumKiir`) a hazai címekben: a saját név, vagy
  a szponzoré a sajáttal zárójelben.
  * hazai győzelem: „Erőd: Lóverseny Aréna ma sem adta meg magát — 2–0 az
    Ellenfél SE ellen”;
  * telt ház: „Zúgott a lelátó (Lóverseny Aréna): 40 000 szurkoló
    ünnepelt”;
  * hazai vereség: „Néma lelátók — Lóverseny Aréna ritkán látott ilyet:
    0–1”.
* **Idegenbeli győzelem:** „Hódító hadjárat: …otthonában is mi nyertünk”.
* **Az idénynyitón:** „Rajtol az 5. év: a menedzser ismét nekifut”.

## 4. A rovatok

| rovat | témák |
|---|---|
| **Tabellaőr** | sorozatok, tabella, mérleg |
| **Taktikai jegyzet** | csapatstílus, taktika, az edző győzelmei |
| **Öltözőpletyka** | a morál kívülről, az edző széke |
| **Kémia-rovat** | az összeszokott párosok, az összhang |
| **Sztárfigyelő** | gólkirályi verseny, kapitány, a „Sztárom a párom” sztárja |
| **Lelátói hangok** | stadion, hazai és idegenbeli meccs, a menedzser éve |

* **A cím fölött** a lap neve mellett a főcím rovata áll („📰 Városi Krónika
  · Tabellaőr · ★★”).
* **A cím alatti rovat-sor** (2★-tól) lehetőleg **másik** rovatból jön.
* **A napló is kiírja** a rovatot.

## 5. Próba

* `tools/sajto-klubarc-3-9-194-proba.js` — lásd a `tools/README.md`-t.
* A 3.9.193-as próba sablon-ellenőrzése az új mezőket (edző, taktika,
  stadion, tábor, évszám) is kitölti.
* A `tools/ifi-elorejelzes-proba.js` ballagás-ellenőrzése valódi bajnoki
  ablakon (4. forduló) fut. Eddig egy korábbi ciklus maradékán, az 1596.
  fordulón futott; 3.9.193 óta ott nincs akadémiai ablak.
