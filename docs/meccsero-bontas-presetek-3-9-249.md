# ⚡🧩 Meccserő-bontás, felállás- és csere-presetek (3.9.249–250)

## A kérés

> „Csere és felállás típus presetek, amik arra valók, hogy neked készítenek el
> egy javasolt cserét, felállást […] Legyen egy összegző felület, ami elmondja,
> miből áll a meccserő a nyers erőn felül (alul). Tételes kibontás. A felállás
> alatt van a meccs erő, arra rákattintva is ugorjon oda, ahol ez a menüben a
> csapatépítés alatti fülben van."

## Hol van

**Menü → 🏗️ Csapatépítés** két új kártyája, és egy közös ablak három füllel:

| Bejárat | Fül |
|---|---|
| ⚡ Meccserő-bontás (a kártyán az élő szám: „⚡ 74,3 = csapaterő 72,5 + 1,9”) | ⚡ Meccserő |
| 🧩 Felállás- és csere-presetek | 🧩 Felállás |
| a felállás alatti „⚡ meccs-erő” felirat (koppintásra) | ⚡ Meccserő |

A csapaterő-szám és az ⓘ továbbra is a súgót nyitja; csak a ⚡ rész vezet a bontásba.

## ⚡ Meccserő — tételesen (3.9.249)

A rejtett tag (`hiddenMatchBonus`) mostantól **tételek listájából** adódik össze
(`hiddenMatchBonusParts`), ugyanabban a sorrendben, mint eddig — a szám **bitre a
régi** (a próba öt állapotban a régi függvényhez méri). A panel ugyanezt a listát
mutatja, csoportosítva:

| Csoport | Tételek |
|---|---|
| 🧠 Öltöző és vezetés | csapatmorál, kapitány-löket, kapitány rutinja, lendület, esemény-módosító, kihívás-büntetés |
| 🎓 Stáb | vezetőedző |
| 👥 A kezdő 11 együtt | aura-képességek, védekező képességek (fél súllyal), összhang, csapategyensúly, gólszorzók (stílus, alakzat, párkémia, taktika-stílus — fél súllyal) |
| ⚙️ Taktika | az aktív taktika a begyakorlottságával |
| 🎯 Csapatstílus | a filozófia képességei, rettegés, motor-bónusz |
| 🧿 Talizmánok | a Meccs-talizmánok tengelyei |

Felül az összesítő: csapaterő (a pályán álló tizenegy) + rejtett tagok = ⚡ meccs-erő;
ha van tartós forma, mellette „amivel a motor a meccsen számol”. Külön sor szól, ha
egy kezdő hiányzik (a pótlással számol a nehézség), és ha a kalibrációs ablakban a
nevezési meccs-erő számít. A nulla értékű tételek egy sorban, „most nem hat”.

## 🧩 Felállás-presetek (3.9.250)

A teljes keretből (kezdők, pad, tartalék) a **mostani felállásban**:

| Preset | Cél |
|---|---|
| 🐣 A lehető legfiatalabb csapat | a legkisebb átlagéletkor, a Rating mindegy |
| 🌱 Fiatal, a lehető legmagasabb Ratinggel | csapaterő − 0,5 × átlagéletkor (egy év ≈ 0,5 Rating) |
| 💪 A lehető legmagasabb Rating | a legnagyobb csapaterő |
| 🤝 A lehető legmagasabb összhang | a kezdő 11 összhangja (döntetlennél a Rating) |
| ⚙️ A taktikához legjobban illő | az aktív taktika illeszkedése (taktika nélkül szól) |

Kemény feltétel mindegyiknél: mindenki tudja a posztját, sérült, eltiltott és zárolt
játékos nem kerül be. A kereső helyi javítással dolgozik (posztonként minden jelöltet
kipróbál, amíg javul), a valódi pontozó függvényekkel. **Előnézet**: posztonként ki megy
ki, ki jön be, és mit mozdít a csapaterőn, a ⚡-n, az átlagéletkoron, az összhangon és a
taktika-illeszkedésen. Csak az „Alkalmazom” írja át a keretet.

## 🔁 Csere-presetek (3.9.250)

Egy preset **sorokból** áll; egy sor a mostani keretből **konkrét** cseréket gyárt (ki
jön be a padról, kinek a helyére, hányadik perctől, milyen állásnál — legfeljebb 3).
A kész cserék a meglévő cseretervbe kerülnek (vagy annak helyére), és onnan ugyanúgy
futnak, mint a kézzel tervezettek; a meccs közbeni cserék bekapcsolnak.

| Beépített | Szabály |
|---|---|
| 💼 Kirakat eldőlt meccsen | 60'-től, **2 gólos előnynél vagy hátránynál** (új feltétel: „ha eldőlt a meccs”): a legnagyobb piaci értékű, de **gyengébb** padosok jönnek be a posztjukon legjobb kezdők helyére |
| 🔄 Vereségnél a jobbik be | 60'-től, vesztésre állásnál: a kezdők közül a legnagyobb piaci értékűek helyére a náluk **erősebb** padosok |
| 💰 Eladásra kirakat 45'-től | 45'-től, 2 gólos előnynél: akinek a **gyors eladási ára** legalább a megadott összeg (Mrd Ft; alapból a padosok mediánja), beáll egy neki megfelelő poszt leggyengébb kezdője helyére |

**Saját preset**: név + legfeljebb 5 sor. Soronként: ki jöjjön be (legnagyobb piaci érték ·
gyors eladási ár legalább X · legmagasabb Rating · legfiatalabb), kinek a helyére (a posztján
a legjobb · a leggyengébb · a legnagyobb piaci értékű · a legidősebb), erősségi feltétel
(mindegy · csak ha a beálló gyengébb · erősebb), állás, perc, darab. A saját presetek a
böngészőben maradnak (karrierfüggetlenek), és mindig a **mostani** keretből gyártanak.

A párharcban a cseretervet a társ gépe is kiértékeli; az új „eldőlt meccs” feltételt egy
régebbi verzió nem ismeri — a verzió-eltérésre a szoba már most is figyelmeztet.

## Próba

`node tools/meccsero-preset-proba.js` — 32 állítás (a mentett felállásokkal).

## 💾 Mentett felállások (3.9.252)

> „ez úgy működik igazán jól, ha az aktuális felállásunkat is el lehet menteni
> itt saját néven, és vissza lehet tölteni (ti. azt manuálisan elkészítem
> olyanra, amilyenre akarom, elmentem és utána merek kísérletezni)"

A 🧩 Felállás fül tetején: a **mostani** tizenegy saját néven menthető (ugyanazon a
néven felülír, legfeljebb 20 mentés). A mentés az alakzatot, a tizenegyet posztonként
és a padot viszi, név szerint; a karrier-mentés része (`S.felMentes`).

A visszatöltés ugyanaz az előnézet → Alkalmazom út, mint a preseteké:

* akit közben eladtál, aki sérült, eltiltott vagy zárolt, az nem kerül vissza — a
  helyén az marad, aki most ott áll, és az előnézet meg is mondja;
* ha a mentés más alakzatban készült, a visszatöltés az alakzatot is visszaállítja
  (a felállásváltás 3.9.248 óta ingyenes);
* a kapitányt nem tölti vissza: a karszalagnak saját szabályai vannak, és amíg a
  kapitány a kezdőben marad, nála is marad.

Próba: a `tools/meccsero-preset-proba.js` 5. része (6 állítás; a próba összesen 32).
