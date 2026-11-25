# Verziózás — minden commit előtt

A verziószám akkor ér valamit, ha első ránézésre elárulja, mekkorát lépett a
játék. Ez a lap dönti el, mi legyen a következő szám. **Minden commit előtt
végig kell menni rajta.**

## A forma

```
1 . 0 . MAJOR . MINOR . PATCH
│   │     │       │       └─ két jegy: 00, 01, 02 … (99 után 100)
│   │     │       └─ funkciócsomag
│   │     └─ a játék „szerződése” változik
│   └─ 0 = még a hivatalos kiadás ELŐTT
└─ 1 = a játék első kiadása
```

Példa: **1.0.4.8.03** = a 4. major 8. minorjának 3. patche, kiadás előtt.

- Az `1.0` előtag a hivatalos kiadásig változatlan. A kiadáskor kell
  eldönteni, mi lesz utána; erről ez a lap nem rendelkezik.
- Új minor esetén a patch **00**-ról indul (1.0.4.9.00). Új major esetén a
  minor és a patch is nulláról (1.0.5.0.00).
- A kijelzés mindenhol „v” + a szám (a kezdőlap jelvénye, a diagnosztika, a
  mentés `app` mezője).

## A döntés — három kérdés, ebben a sorrendben

### 1. MAJOR — változik-e a játék „szerződése”?

Akkor major, ha a változás után **a futó karrierek másképp működnek**,
vagy átállás, migráció kell hozzá, vagy egy alaprendszer logikája cserélődik
le (nem csak bővül). Jelek:

- a futó karrierek új szabályra állnak át, vagy kifejezetten a régin
  maradnak (pl. `S.pyr.*V` szerződés-jelző, „csak az új karrierekben”);
- a mentés formája vagy a PvP-csere formája úgy változik, hogy régi és új
  kliens nem játszhat együtt;
- egy központi rendszer (nehézség, meccsmotor, gazdaság alapja) cserélődik.

Példa a múltból: **a tízfokozatú, kétoldalú nehézség** (régi 3.9.222–223)
→ 4.0.

Ritka. Ha bizonytalan vagy, **nem** major.

### 2. MINOR — új, a játékos számára látható rendszer vagy funkciócsomag?

Akkor minor, ha a játékos **új dolgot tud csinálni vagy látni**, ami saját
nevet érdemel a változásnaplóban. Jelek:

- új menüpont, új ablak, új játékmód, új mechanika (pl. talizmánok,
  saját bajnokság, a keret kihirdetése, Edző menü);
- új csapatstílus, új sorozat (kupa), új kémia vagy skill-családa;
- egy meglévő rendszer szabálya érdemben új irányt kap (pl. a felzárkóztatás,
  az osztott nehézség).

Egy minor több commitból is állhat:

- **az első commit** lépteti a minort (…​.00);
- **a folytatások** (ugyanannak a funkciónak a második, harmadik fázisa, a
  rá érkezett hibajavítás, hangolás) már patchek (…​.01, …​.02).

### 3. PATCH — minden más

- hibajavítás, regresszió;
- hangolás, egyensúly (ár, plafon, arány, küszöb, tempó);
- szöveg, kijelzés, felirat, apró felületi változás;
- nevek, tartalom-kötegek;
- teljesítmény, technikai, próba és eszköz;
- egy meglévő funkció kis bővítése.

## A döntési fa röviden

```
Változik a futó karrierek szerződése / alaprendszer logikája?  → MAJOR
  nem ↓
Új, néven nevezhető, a játékos számára látható rendszer vagy funkció?  → MINOR
  nem ↓
                                                                → PATCH
```

Ha egy commit több dolgot tartalmaz, **a legnagyobb** dönt.

## Ellenőrzőlista minden commit előtt

1. **Mi a mostani szám?** `grep -n 'const APP_VERSION' index.html`
2. **Melyik szint?** A fenti három kérdés alapján.
3. **Az új szám:**
   - patch: az utolsó tag +1, két jegyre töltve (03 → 04);
   - minor: a minor +1, a patch 00;
   - major: a major +1, a minor 0, a patch 00.
4. **Két helyen írd át, egyszerre:**
   - `index.html`: `const APP_VERSION="…";`
   - `version.json`: a `verzio` mező. A **`v` mező befagyott (3.9.369), azt
     soha ne írd át.** A régi (3.9.368-as) kliensek csak ezt olvassák, és
     számtagonként ezt látják újabbnak, így kapják meg a frissítési sávot.
5. **`./tools/check.sh`** — a verziószám-ellenőrzés (5. pont) megfogja a
   rossz formát, és ha a kettő eltér.
6. **A commit üzenete a számmal kezdődik:** `1.0.4.8.04: …`
7. **Minor és major esetén** a változás leírása a `docs/`-ba kerül, és a
   lenti „Kiadások” táblába egy sor.
8. **Fájlnevek** (próba, leírás): a teljes szám kötőjelekkel, pl.
   `tools/valami-1-0-4-8-04-proba.js`, `docs/valami-1-0-4-8-04.md`.

## Technikai megjegyzések

- **Összevetés:** a `verzioUjabb` / `verzioKulcs` mindkét formát érti. A
  régi sorozat (2.x–3.9.x, három tag) mind a 1.0.x előtt áll. A
  `tools/uj-verzio-3-9-306-proba.js` ezt méri.
- **Próbák:** a régi „legalább 3.9.x” ellenőrzések az 1.0.x-et is elfogadják.
  Újat így írj: `verzioUjabb(APP_VERSION,"1.0.4.8.02")` (az oldalon belül),
  vagy egyszerű egyenlőség.
- A **mentés** formátumának saját száma van (`SAVE_FILE_V`), a
  verziószámtól független.
- A **PvP-társak** csak egyenlőséget néznek („Eltérő játékverzió”), tehát a
  forma váltása nem tör el semmit.

## Kiadások — a régi sorozat megfeleltetése

A régi számozás (3.9.x) a 3.9.368-ig tartott. Utólag így felel meg az új
rendnek (a besorolás a commitok tárgysorából készült, 2026-11-05):

| új | régi | dátum | csomag |
|---|---|---|---|
| 1.0.3.9 | 3.9.00–13 | 09-01 | meztervező, PWA, jogtisztaság |
| 1.0.3.10 | 3.9.14–37 | 09-02 | PvP-élmény: jelenlét, tempó, push |
| 1.0.3.11 | 3.9.38–55 | 09-07 | feloldás-lépcsők, piramis-bővítés |
| 1.0.3.12 | 3.9.56–99 | 09-09 | Jellem, másodlagos stílus, Gegenpressing |
| 1.0.3.13 | 3.9.100–140 | 09-20 | sztár piac, Hiper Szuper Kupa, stílusboltok |
| 1.0.3.14 | 3.9.141–162 | 09-25 | Talizmánok |
| 1.0.3.15 | 3.9.163–180 | 09-28 | hang, zene, Pixel téma |
| 1.0.3.16 | 3.9.181–221 | 10-03 | sajtó, gazdaság, profil, scout, résztempók |
| **1.0.4.0** | 3.9.222–254 | 10-08 | **tízfokozatú nehézség** |
| 1.0.4.1 | 3.9.255–265 | 10-17 | talizmán-színek, egységes boost és stílus, stadion |
| 1.0.4.2 | 3.9.266–286 | 10-21 | arcképek, esemény-animációk, momentum |
| 1.0.4.3 | 3.9.287–298 | 10-23 | PvP 2.0: célrés-ablak, hardcore, súlyozás |
| 1.0.4.4 | 3.9.299–315 | 10-26 | Edző: elemzés, magyarázat, kalauz; csapatszerepek |
| 1.0.4.5 | 3.9.316–330 | 10-27 | nehézség-követés: osztott nehézség, boost-plafon, rés-követés |
| 1.0.4.6 | 3.9.331–346 | 10-29 | saját bajnokság (Könnyed PvP) |
| 1.0.4.7 | 3.9.347–365 | 11-02 | felzárkóztatás, osztálylépcső, lelátó, mérések |
| 1.0.4.8 | 3.9.366–368 | 11-05 | a keret kihirdetése, egyszerűbb meccserő-kijelzés |

A 3.9.368 tehát **1.0.4.8.02**. Az első új számozású verzió az
**1.0.4.8.03**: maga ez az átállás (technikai, tehát patch).

## Kiadások — innentől

Minden minor és major ide kap egy sort.

| verzió | dátum | csomag |
|---|---|---|
| 1.0.4.8.03 | 11-05 | (patch) az új verziószámozás és ez a lap |
| **1.0.4.9.00** | 11-05 | kerethirdetés a párharc előtt — két mód (rögtön a meccs / előbb az elemzés), nincs külön felkészülés |
| **1.0.4.10.00** | 11-06 | a verziótörténet beépítve a játékba: a verziószámra koppintva nyílik (bármelyik gazdagépen és alútvonalon), a 2.2 előtti 26 állapottal bővítve |
| 1.0.4.10.01 | 11-06 | (patch) a sztár hírnév-készpénzének plafonja a klub tényleges léptékéhez (`clubBudgetScale`) mér |
| **1.0.4.11.00** | 11-06 | a 20. csapatstílus-szint jutalmai: újabb filozófia, csúcsfok (3 képesség +3 szint), a pontgyűjtő +10 szintje |
| **1.0.4.12.00** | 11-06 | Könnyed PvP: párharc utáni értékelő ablak (erők, Run színezve, eredmények, felzárkóztatás); az újabb stílus küszöbe nehézségfüggő (5.x: 20 → 10.5: 15) |
| **1.0.4.13.00** | 11-06 | ligalépcső: a Run a kezdő osztálynál kettővel feljebbi bajnoki címmel megvan (a számítás változatlan); ajánlott kezdés D3; menedzsment-célkitűzések ablak |
| **1.0.4.14.00** | 11-06 | 📋 Menedzsment menüpont: Run + fő elvárás, aktív kihívások sávja, 3 közeli mérföldkő, igazgatóság, rendszerezett listák; a kihívás-ajánlatok menedzsment-stílusban; névelő-javítások |
| **1.0.4.15.00** | 11-07 | csapatstílus: legfeljebb 4 filozófia; új út a meccserővel (250 → 3., 350 → 4.); L10 után újraválasztás 33% visszatérítéssel; mindez a stílus-panel felső sávjában |
| **1.0.4.16.00** | 11-07 | edzői meccs-elemzés: minden gólforrás külön (gegenpressing, Tiki-Taka, gólétvágy, 11-es, öngól, szabadrúgás, 90+, csere-csatár, potyagól, hosszabbítás), a stílus-csatornák várható gólja a szerencse-számításban és a tényezők között; összefoglaló + három lenyitható fül |
| **1.0.5.0.00** | 11-07 | (major — a futó karrierek Run-számítása) a Run-szintbe az 5 fordulónkénti rés-követés mértéke: külön többlet, legfeljebb a Run +10%-a a karrier átlagából; a 15. fordulós téli emelés többé nem emeli a Run-t |
| **1.0.6.0.00** | 11-07 | (major — a futó karrierek rajt-kalibrációja) a célrés-lánc tartósan mér (morál alapszinten, lendület/kapitány-löket/forma nélkül); a rajt-cél a minimum: a mezőny visszalép (közös karrierben személyes eltolás); a súlyozás csak könnyíthet; a panel kiírja a célrés és a rajt-cél viszonyát; a nyári üzenet meccs-erőben |
| **1.0.6.1.00** | 11-09 | akció-képességek: Sortűz (Bombázók), Phalanx (Beton), Száguldás (Villám), Tankoljunk (Panzer), Egyensúly (Harmónia) — saját jelenettel, szintenként a tiki-taka hozamának fele; Gegen nyomásgyakorlás/büntetés −33% hatás, +25% ár; passzrekord +75% hatás, −10% ár; Tiki-Taka: Övék a középpálya |
| **1.0.6.2.00** | 11-09 | többes szerep: a 3. csapatstílustól 3 játékos visel 2 szerepet, a 4.-től 5 játékos 2-t (közülük 1 akár 3-at), stíluson belül továbbra is egy ember egy szerep; a szerep-szakasz a nézett stílus szerepeit sorolja; a stílus-váltó jelvénysor rögzítve a menü tetején |
| **1.0.6.3.00** | 11-09 | 🔗 Szinergia: a 3. stílustól egy pár szinergiája él (28 pár, mindegyik saját lánccal és 3. szintű csavarral), 3 szint (90/150/240 pont), választó a 3./4. stílusnál, idényenként egy váltás, szezonkezdési jelzés; a lánc-gólok saját forrásként az elemzésben |
| **1.0.6.4.00** | 11-09 | ⚡ vonzóbb mennydörgés: a Villám minden képessége −5% ár, +10% hatás; új képesség: Gyors lábak piaca (−33/40/50% a 95+ sebességűek vételárából, a scout kiszemeltjeinél is); nulladik szintű Villám az 1. idényben (4×95+ vagy 2×99 sebesség → a Korai plafon-nyitás azonnal); 🎬 a 28 szinergia-pár saját jelenete |
| **1.0.7.0.00** | 11-09 | 🏁 az idény-rajt 2. szerződése (egyjátékos): a mezőny = W − célrés + idény-boost + feljutás-boost (a nehézségtől, √W-skálán) + a csúszka (±2%); W = (záró + indító)/2, a megtartott nyári rész ≤ 2%; az 1. idény rajtja 0…+1 a nehéz fokozatokon; a „rajt-cél a minimum” megszűnt; nyári „Idény-rajt” képernyő és 🧳 tartalékolás-figyelmeztetés |
| **1.0.7.1.00** | 11-09 | 🗜 a mentés tömörítve kerül a tárhelyre (saját LZ77, ×5–8 kisebb, kiírás előtt visszaellenőrizve), a régi nyers mentések és mérési naplók egyszer helyben tömörödnek; tele tárhelynél önálló takarítás (üres sorok → tömörítés → mérési meccs-részletek), karriert sosem töröl; a Run-lista írása is újrapróbál; tárhely-bontás és 🧹 „Hely felszabadítása” gomb · ⏩ a tempó-csúszka logaritmikus, 5 mágneses fokozat (0,15 · 0,25 · 0,5 · 1 · 2), ◀ ▶ léptetés |
| **1.0.7.2.00** | 11-09 | 🔗 javítás: a Szinergia (pár, szint, váltás) eddig kimaradt a mentésből — újratöltéskor nullázódott; vele több tartós jelző is (Villám-ajánlat, akció-gólok, talizmán-kapcsolók, idényes jutalom-őrök) · ✏️ stylist-módban a játékos-adatlapon a név átírható: a NEV_ALAP védett listába kerül (napi beépítés, szűrve), mindenkinél az lesz a magyarított név |
| **1.0.7.3.00** | 11-10 | 🏆 a kupa a címlapon: a klub újságírói minden kupameccsről a szakasz szerint írnak (selejtező, csoportkör / ligaszakasz, oda-visszavágó, továbbjutás, tizenegyesek, kiesés, döntő), előzetes minden szakasz előtt, ünnepi kiadás a kupagyőzelemkor; a döntő alcímet és rovatot kap; a KK- és a Hiper Szuper Kupa-döntő KÜLÖNSZÁM (saját sablonok, háromsoros előzetes, ×1,5 szurkoló); a kupa az este extrái között |
| **1.0.7.4.00** | 11-10 | ⚽ a dekázó töltő: a 200 ms fölötti képernyőváltásoknál elmosott háttér, középre ugró, dekázó figura (min. 1 mp), a nehéz gomb a töltő kirajzolása után nyomódik meg; mindig a HUB-, szezon- és kupagombokon, és minden gombon, amelyiknél a mérés 200 ms fölé megy (tanul) · ⚡ a változatlan mentés kimarad, a halasztott mentés a töltő alatt fut, a tömörítő ~25%-kal gyorsabb |
| 1.0.7.4.02 | 11-10 | 🛡 jogtiszta hárombetűs klubkódok: 63 magyarított klub kódja a valódi kód volt (PSV, ATM, TOT, FEN, BEN, AJA…), más klub kódja vagy közismert betűszó — új kódok a magyarított névből (a klubok.py forrásban is); a Celtic „KFC”-je (márka) helyett KLT; a saját csapat és a képzett kódok is kikerülik a tiltólistát; a kiadott buildből a CLUB_ABBR kiürül; őr: tools/nevek/klubkod-proba.js |
| **1.0.7.5.00** | 11-10 | 🔢 a mezszám a mez elején is (arculat 6. szakasz: ki, vagy a hét hely egyike; ütközésnél a jel átköltözik) a szemből látszó saját játékosokon · ✏️ a névceruza minden játékos adatlapján: a teljes ÉS a rövid név átírható — sima játékosnál csak helyben, a stylistnál (közös listás névnél) a közös, html-be épülő listára ([f,r] bejegyzés) |
| **1.0.8.0.00** | 11-10 | ⚔ párharc-motor: mindkét nézet az ellenfél TELJES erejével (keret + taktika) — eddig csak a sajátját látta, és nagy taktika-tételnél a 15 ⚡-nyi fölény 2,4 : 2,3-as gólvárhatósággá olvadt · a gólszorzók (ownGoalMult/oppGoalMult) utaznak a pillanatképben (eddig a számoló gép stílusa ült a társ csapatára) · a kihirdetett lap és az edzői elemzés ⚡-ja = a pillanatkép ⚡-ja · 🔁 nézőpont a tárolt adatból (by / sim.hf) · 🔍⚔ párharc-elemzés a mérlegben és a statisztikában (⚡, közös gólvárhatóság, szerencse, nézőpont- és névsor-ellenőrzés) · 🟥 1.0.7.5.02: közvetlen piros után tiszta lap |
| **1.0.8.1.00** | 11-12 | 🔄 szinkron eszközök között: a teljes profil (karrierek, szobák, profil, nevek, beállítások) a saját Firebase-projekted Firestore-jával, titkosítva; Profil → legfelül 🔄 Szinkronizálás, beállító ablak, párosító link / 25 jegyű kód; kulcsonkénti háromutas összefésülés, darabolt tárolás, a másik eszköz változása újratöltéssel érkezik (meccs közben vár) · `tools/firestore-szinkron.rules` |
| **1.0.9.0.00** | 11-11 | 🏆 a nemzetközi kupák padlója az élvonal: a mezőny a hozzád mért mérce és a piramis élvonalának mostani ⚡-ja közül a nagyobb (KK +2 · HSZ +2 · OJK −1 · KONF −4) — eddig egy első idényes D3-as csapatnak a KK (102,9) gyengébb volt a D1-nél (109,9); a hazai kupák, a nyári kupa és a túlnőtt keretek szabálya változatlan; a kupa-képernyő kiírja, ha a padló döntött |
| 1.0.9.0.01 | 11-11 | 🏆 a HSZ padlója a saját osztályod fölötti osztály (D0-ból a D−1) mostani ⚡-ja +2 — a csúcson a fölé nyíló osztály kiszámolt szintje (a legfelső + egy lépcső) |
| 1.0.9.0.02 | 11-13 | 🔁 a játékoscsere (HUB csere-lista, húzás) a „Pillanat…” töltő alatt; a HUB kirajzolása a felére (a stílus-XP összegzése a talizmán-szorzókat egyszer kéri le, bitre ugyanaz); a csere-sorozat mentése egyben, a HUB elhagyásakor / a lap elhagyásakor — a csere után nincs második fagyás |
| **1.0.9.1.00** | 11-13 | 📈 a kupa-mezőny is fejlődik: minden kupameccsed után a gépi csapatok a bajnoki forduló ütemével nőnek (az idény alapüteme a nehézségi fokozattal + az idény-gyorsulás fordulónkénti átlaga), legfeljebb 15 kupameccsnyit; a te csapatod és a társ nem; a kupa-képernyő kiírja |
| 1.0.9.1.01 | 11-13 | 👑 a csúcsfok a nehézséggel hamarabb nyílik: 5.1-ig a 20. szint, 5.2-től belső szintenként egyenletesen lejjebb (6.1 → 18,62 · 8.1 → 15,86 · 10.1 → 13,1), a 10.5-ön a 12. (a tört rész a szinten belüli haladás); a menü, a kapu és egy egyszeri hír kiírja; a 3. stílus küszöbe változatlan |
| 1.0.9.1.03 | 11-14 | 📂 a HUB menü megnyitáskor minden menüponttal csukva indul (eddig a legutóbb lenyitott csoport fogadott); aloldalról visszatérve a csoport nyitva marad |
| **1.0.9.2.00** | 11-14 | ⚔🎯 stílusgólok a párharcban: a tiki-taka passzrekord, az öt akció, a gegenpressing-büntetés és a Bombázók gólétvágya a gazda gépe által előre kiszámolt tervből (az ellenfél erejére rácson) a közös listába kerül; a gól típusa (csapatstílus / skill / sima) mindkét oldalon a gól sorában és a párharc-elemzésben; a szinergia lánca nem kerül át |
| 1.0.9.2.01 | 11-14 | ⚔⚙️ a párharc közös gólvárhatóságában a helyi motor hiányzó szorzói is dolgoznak (hajrá-képesség, Szárnyak, Villám-fáradás, rekord-hajrá, csukafejes, a szinergia állandó szorzói, a „busz” csúszka) — a pillanatkép profiljából, betűre a helyi képletekkel; a buszsofőr behívása mindkét oldalon kiíródik a közös lista percével és a két kész szorzóval, a lejátszás nem utasíthatja vissza; a párharc-elemzés szorzónként mutatja a várható gól hatását. Lásd [parharc-motorszorzo-1-0-9-2-01.md](parharc-motorszorzo-1-0-9-2-01.md) |
| **1.0.9.3.00** | 11-15 | 🔍 a scout-találat (klasszikus felfedezés, valósághű kiszemelt) a nehézséggel a kereted nyers erejéhez húz: a sáv a (nyers − sáv közepe) t-szeresével csúszik le, t = 0,5·(i/41)^1,47 (1.1 → 0 · 5.1 → 17% · 9.2 → 50% · 10.5 → 65%); csak lefelé, a fizetős piac és a hardcore közös scout-terve változatlan. Lásd [scout-nyers-1-0-9-3-00.md](scout-nyers-1-0-9-3-00.md) |
| **1.0.9.4.00** | 11-15 | ⏭ „Szimuláció a meccs végéig” gomb a tempó-csúszka alatt: ugyanaz a motor és meccs-véletlen fut tovább villámtempóval, jelenetek és félidei megálló nélkül (a tervezett cserék lefutnak); párharcban, végigjátszásban és a 90. perc után nincs. Lásd [meccs-vegere-1-0-9-4-00.md](meccs-vegere-1-0-9-4-00.md) |
| **1.0.9.5.00** | 11-16 | 🔄 a kölcsönjátékos tényleg kölcsön: az „Három kölcsönjátékos” esemény a scout felfedezési sávjából húz (az 1.0.9.3.00-ás nehézségi gyengítéssel); játékosonként sorsolt 15–60 bajnoki fordulós szerződés, számláló a név mellett; a bére pályára lépés nélkül is jár; 6 meccsen 180 perc alatt a klubja visszahívja; nem adható el, csak 0 Ft-ért visszaküldhető; lejáratkor visszamegy. Lásd [kolcson-1-0-9-5-00.md](kolcson-1-0-9-5-00.md) |
| **1.0.9.6.00** | 11-16 | 🏋️ az edzés és a stáb erősebb: a nehézségi tempó lassításának csak 30%-a hat rájuk (Gleccser 0,45 → 0,835); az edzésterv 2,5× pont (fő 2,0 · mellék 1,0/meccs); az attribútum→Rating átváltás 0,35 → 0,55/pont, szintarányos sávokkal; a stáb alapszorzója 1,5 → 2,5 (skill 2,0), az attribútum-mester a játékos szintjével nő. 9.2-n egy 25 éves, ~176-os játékos: +0,5 → +3,8 Rating/szezon. Lásd [edzes-stab-1-0-9-6-00.md](edzes-stab-1-0-9-6-00.md) |
| **1.0.9.7.00** | 11-16 | 🌘 a rejtett csapatstílus a talizmán-menüben: melyik a legjobb rejtett stílus (és ki van mögötte), a négy esély, a feloldott képességek állapottal (aktív / élővé vált / talizmánok ki), az árnyék-pontok, a titkos megbízatás és az élő ajánlat; máshol továbbra is név nélkül. Lásd [rejtett-talizman-1-0-9-7-00.md](rejtett-talizman-1-0-9-7-00.md) |
| 1.0.9.7.01 | 11-16 | (patch) audit a felületről, a visszajelzésekről és a balanszról ([audit-felulet-mechanika-1-0-9-8.md](audit-felulet-mechanika-1-0-9-8.md)); új mérő: `tools/meccsmotor/hangsuly-valos.js` (a hangsúly-csúszkák a valódi motoron) |
| **1.0.9.8.00** | 11-16 | 📊 hangsúly-összkép: a 🎚 panel tetején a taktika és a filozófiák mozdított csúszkái EGYÜTT — a meccs íve (saját / ellenfél gólesély ötpercenként, döntetlennél · vezetésnél · hátrányban), ≈ ⚡ meccserő-egyenérték, ki szerzi a gólt, mellékhatások, feltételes hatások; húzás közben is él, görgetéssel járó egysoros sáv; közvetlen 🎚 kártya a Csapatépítés menüben, alcím a Taktika gombon, sor a kezdőrúgás előtt; a motor és a mentés változatlan. Lásd [hangsuly-osszkep-1-0-9-8-00.md](hangsuly-osszkep-1-0-9-8-00.md) |
| 1.0.9.8.01 | 11-16 | 📐 a Taktika-panel tetején az állapot (aktív rendszer · ismertség · illeszkedés, az öt tengely csempéi), az öt tengely részletes bontása és a magyarázat lenyitható fülben (a szöveg változatlan) — a hat rendszer az első képernyőn kezdődik |
| 1.0.9.8.02 | 11-16 | 💱 a Boost-központ tetején három csempe (az egység ára · az egyenleg · a kedvezmény) és a kedvezmény forrásai; az árazás magyarázata (egység, a kezdő idények ablaka, a klub léptéke) lenyitható fülben, a szöveg változatlan — a fejléc 252 → 155 px, mind a hét fajta az első képernyőn |
| **1.0.10.0.00** | 11-16 | (major — a csúszkák szerződése, csak az ÚJ karrierekben) 🎚 plafon a hangsúly-csúszkák halmozásán: az összes csúszka együttes hatása a saját és az ellenfél gólvárhatóságára ±40%-ban megáll (×0,60…×1,40); a futó karrierek és a párharc a régi szabályon (`S.dialV`); mérve: két forrás halmozva 2,417 → 2,257 pont/meccs, kapott gól 0,50 → 0,72; az Összkép kiírja a plafont. Lásd [csuszka-plafon-1-0-10-0-00.md](csuszka-plafon-1-0-10-0-00.md) |
| **1.0.10.1.00** | 11-16 | ⭐ a „Sztárom a párom” csúszkái a meccsre is hatnak (csak az új karrierekben): „Minden labda hozzá” + a csapat gólvárhatósága, amíg a sztár a pályán van; „Végigjátssza” + feleannyi a 70. perctől; a legjobb Sztár-készlet 0 → 0,87 ⚡ a 20. szinten; a futó karrierek változatlanok. Lásd [sztar-csuszka-1-0-10-1-00.md](sztar-csuszka-1-0-10-1-00.md) |
| **1.0.10.2.00** | 11-16 | 📈 az edzésterv előrejelzése: a választó alján játékosonként a várható hozam az idény végéig (fő és mellék külön, a kezdő összege, kispad lenyitva, 🔒 a specializációs sáv tetején), választás közben él; a motor edzés-ágának tükre — a próba a motor valódi könyvelésével veti össze (eltérés 0). Lásd [edzesterv-elore-1-0-10-2-00.md](edzesterv-elore-1-0-10-2-00.md) |
| **1.0.10.3.00** | 11-16 | 🧭 gyors játékterv a 🎚 panelen: három szándék (⚔ Rohamra · 🛡 Zárjuk le · 🧠 Az edző terve), az edző a taktika csúszkáit a motor szorzóival mérve állítja be az ismertség keretén belül, megmondja, mit tett (és mit hagyott középen, mert ártana), visszavonható; 🧾 az Összkép alján a legutóbbi meccs mérlege a csúszkák szemével (az edzői elemzés tényezőjéből); egyik sem új mechanika. Lásd [jatekterv-1-0-10-3-00.md](jatekterv-1-0-10-3-00.md) |
| **1.0.11.0.00** | 11-16 | (major — a futó karrierek Szinergia-ára is átáll) 🔗 a Szinergia szintjeit a pár KÉT stílusának saját pontgyűjtője fizeti (rettenet · csillag · villám · passz · pressz · gól · beton · harmónia pont), mindkettő ugyanannyit: 100 · 200 · 300; a csapatstílus-pont ehhez nem kell; a már megvett szintek megmaradnak; 👑 csúcsfok-jelöléssel (mindkét stílusból egy-egy jelölés) három további szint ×2,9 / ×3,3 / ×3,7, összesen 500 + 500 pontért; a panelen kassza-sor. Lásd [szinergia-ar-1-0-11-0-00.md](szinergia-ar-1-0-11-0-00.md) |
| **1.0.11.1.00** | 11-17 | ◈ az ötödik téma, a **Reflektor** (esti rangadó, élő közvetítés: petróleum-éjszaka, volt kiemelés, Exo 2), és ez lett az alapértelmezett; saját menüdalok („Esti rangadó”), saját animációk (gomb, oldal, ablak, menü, gól-felirat, témaváltás) a ✨ kapcsolón ([tema-reflektor-1-0-11-1-00.md](tema-reflektor-1-0-11-1-00.md)) |
| **1.0.11.2.00** | 11-17 | 🎬 nyitóképernyő, mind az öt témában más (Reflektor: a stadion felkapcsol, a 30–0 számláló valódi töltésjelző · Sötét-arany: trófea-vitrin · Törtfehér: nyomtatott meccsprogram · Noir: filmfőcím · Pixel: a konzol bekapcsol); nem mesterséges várakozás, visszatérőként rövid, „kevesebb mozgás”-nál álló kép, koppintásra eltűnik ([nyito-1-0-11-2-00.md](nyito-1-0-11-2-00.md)) |
| 1.0.11.2.01 | 11-17 | (patch — a nyitás csomagjának folytatása) 🏷️ új alkalmazás-ikon: a taktikai M (öt játékos, kémia-vonalak, piros–fehér–zöld kapitány), teljes készlet ellenőrzéssel és tömörítéssel; manifest-színek, sw v10, új áruházi grafika és képernyőképek ([ikon-1-0-11-2-01.md](ikon-1-0-11-2-01.md)) |
| **1.0.11.3.00** | 11-17 | 📈 a Szakmai stáb előrejelzése: minden stábtag kártyáján, kinek mennyit hoz az idény végéig (attribútum-mesterek játékosonként, a motor láncával és az edzésterv lassításával · Kispad-mester: perc és fejlődés · Iskolateremtő, Ritmusmester, Gyógyító kéz, Lélekemelő, Csapatkovács), a fókusz módosítására azonnal ([stab-elore-1-0-11-3-00.md](stab-elore-1-0-11-3-00.md)) |
| **1.0.11.4.00** | 11-17 | 💾 saját csúszka-beállítások: a 🎚 panelen névvel menthető a taktika és a filozófiák csúszkáinak állása (max. 20), egy koppintással visszatölthető (↺ visszavonható), törölhető; a visszatöltés a mostani keretet tiszteli, és kimondja, mi maradt ki ([csuszka-mentes-1-0-11-4-00.md](csuszka-mentes-1-0-11-4-00.md)) |
| 1.0.11.4.01 | 11-17 | (patch) ⚡ a Reflektor animációi simábbak: a nem GPU-n futó `clip-path`/`box-shadow` animációk (oldal, lenyitott csoport, ablak) áttűnésre és külön fényrétegre cserélve, a menü-címsorok elmosás nélkül, a pálya nem animálódik a menütől ([reflektor-sima-1-0-11-4-01.md](reflektor-sima-1-0-11-4-01.md)) |
| 1.0.11.4.02 | 11-17 | (patch) 🏷️ az ikonok címe verziót kapott (`?v=2`) a manifestben, a `<head>`-ben és a service workerben — a régi fájlnéven a gyorsítótárak a régi ikont adhatták újratelepítéskor is; sw v11 ([ikon-1-0-11-2-01.md](ikon-1-0-11-2-01.md)) |
| 1.0.11.4.03 | 11-17 | (patch) 🏋️ a stáb és az edzés a magas szinten: a szint-szorzó plafonja 2,2 → 6 (480-as Ratingig követi a játékost, a specializációs sáv és az átváltás sávjaival együtt); az attribútum-mesterek alap-pontja ×4,5, a figyelem felosztásának kitevője 0,72 → 0,40 csak náluk. A bejelentett eset (Játékmester, 38 éves, 370-es szint): 0,36 → ≈ 6,9 lépés 19 meccs alatt (≈ 19×). Lásd [stab-magas-szint-1-0-11-4-03.md](stab-magas-szint-1-0-11-4-03.md) |
| **1.0.11.5.00** | 11-19 | 🌱 az ifiakadémia saját szintje (10 szint, XP: meccs, csapaterő-növekedés, felvett ifi, saját nevelésűek a pályán, ifi-eladás) a 8. fordulótól: ⚖️ gyakoriság ↔ minőség (±1/±2/±3), 🧭 poszt-fókusz, 👥 1–3 ingyenes szakember (poszt-edző, képesség-edző, skill-mester, tehetségvadász), erejük a szinttel; az ifi POT-ja a mezőnyhöz horgonyoz (200-as mezőny: medián 58 300 → 152 200, csúcs 152 → 196), a visszatérőé a felhozott csúcsához. Lásd [ifiakademia-1-0-11-5-00.md](ifiakademia-1-0-11-5-00.md) |
| 1.0.11.5.01 | 11-19 | (patch — hibajavítás) 💾 az ifiakadémia állapota (`S.ifiAk`: XP, szint, irány, fókusz, szakemberek) a mentésbe és a betöltésbe — a mentés mezőnként sorolja az `S`-t, és az 1.0.11.5.00 kimaradt belőle, így újratöltéskor elveszett volna; a próba mentés–visszatöltéssel ellenőrzi ([ifiakademia-1-0-11-5-00.md](ifiakademia-1-0-11-5-00.md)) |
| **1.0.11.6.00** | 11-19 | 🎁 ládák: öt fizetőeszköz → ⦿ ládaérme (pénz 1 U = 100 · játékos a piaci érték 25%-a, mérve ~2× a gyors eladás · stábtag 40% · talizmán ritkaság szerint · stíluspont 2,5); hat láda (14 … 102 érme, a várható érték az ár 86 … 97%-a, az Öltözői 6. szintje 0,05%), ×1/×5/×10; tíz jutalomkategória hat szinten (kupon → 2 ifi-boost, szezonkártya ezüst–diamond → stellar–godlike választással, stábtag, talizmán-fejlesztés, meccs-boost, játékos-erősítő, szurkolói boost, pénz/kölcsön, időleges csapatstílus, egyebek); nyitás a Reflektor-stadionban. Lásd [ladak-1-0-11-6-00.md](ladak-1-0-11-6-00.md) |
| 1.0.11.6.01 | 11-20 | (patch — hangolás) 🎁 ládák: ⦿ ládaérme kihívás-jutalomként (30–80 × a kihívás szorzója); a pénz-érme 25%-kal olcsóbb; a játékos a piaci érték 40%-a (≥ 1,5× gyors eladás; mérve a bejelentő keretén 250 → 517 érme); a befizetés hozama a nehézséggel skálázódik (9.5 ×1 · 7.1 ×1,32 · 1.1 ×2 · 10.5 ×0,89); a befizetésnél a játékos, a stábtag és a talizmán neve kis ablakot nyit ([ladak-1-0-11-6-00.md](ladak-1-0-11-6-00.md)) |
| **1.0.11.7.00** | 11-20 | 👔 mester-szintezés: a nem stílus-edző is szintezhető az Edző panelen — egyszeri megnyitás csapatstílus-pontért (9.5-ön 30, a nehézséggel fel-le: 1.1 → 15 · 10.5 → 34), utána 3 szint a stílus-edzők áraival (54 · 92 · 146) és hatásával a kedvelt taktikáján (2× begyakorlás · plafon 125 és 150 · illeszkedés 150 és 200%); csak a csapatstílus választása után, edzőnként tárolva, egyszeri értesítéssel. Lásd [edzo-szintezes-1-0-11-7-00.md](edzo-szintezes-1-0-11-7-00.md) |
| **1.0.11.8.00** | 11-23 | 🎯 ki-ki meccs a Run-szintért: a Run-szint rögzítésére jogosító ligában (piramis: a Run-cél divízió vagy felette; dinamikus: az Infinity-kapu) a 2. vagy 3. hely után egy idegenbeli ki-ki meccs a bajnok ellen (döntetlennél hosszabbítás és büntetők); győzelemnél a Run-szint rögzül 1% levonással a Run-összegből, vereségnél semmi nem változik. Single és PvP módban is, idényenként egyszer, kihagyható. Lásd [kiki-run-1-0-11-8-00.md](kiki-run-1-0-11-8-00.md) |
| **1.0.11.9.00** | 11-23 | 👶📋🧑‍🎨 arcok: az „ifj.” változatok a párjuk arcát öröklik (a kor a sajátjuk); 📋 Arc másolása bármely játékosról az arcszerkesztőben (`minta` mező); stylist-módban a meccs előtti mez-ablakból az ellenfél teljes kerete is beállítható. Lásd [arc-masolas-1-0-11-9-00.md](arc-masolas-1-0-11-9-00.md) |
| **1.0.11.10.00** | 11-23 | 🏔 a divízió arculata a ligapiramisban: minden osztálynak saját színe, ikonja, rangneve (D6 🌾 Grund → D1 🏆 Arany, D0 👑 Korona, D−k 🌌 Kozmosz); a fejlécben osztály-csip és divízió-színű szegély, a HUB tetején divízió-sáv a lépcsővel és a Run-céllal. Lásd [divizio-arculat-1-0-11-10-00.md](divizio-arculat-1-0-11-10-00.md) |
| 1.0.11.10.01 | 11-23 | (patch — a felület-csomag folytatása) 📊🏅🏆🃏 tabella (mezek, pontsáv, zóna-elválasztók, a divízió színe), szezonzáró hős-kártya (érem, csempék, a 30 meccs formacsíkja, arcképes listák), kupa-HUB (szalag, menetelés-út, párosítás-kártya, új csoporttabella), szezonkártyák valódi kártyákként. Lásd [divizio-arculat-1-0-11-10-00.md](divizio-arculat-1-0-11-10-00.md) |
| 1.0.11.10.02 | 11-23 | (patch — terv, kód nélkül) 🎥🏆 a stadionos közvetítés (közös világ méterben, 7 kameraállás, rendező, vágás a jeleneten belül, a stadion az adatokból) és a legalább 1 perces, 7 szintű bajnoki/kupás ünneplés terve, fázisokra bontva. Lásd [kozvetites-unneples-terv.md](kozvetites-unneples-terv.md) |
| **1.0.11.11.00** | 11-23 | 🃏 szezonkártyák: a szintet a KÁRTYAPONT dönti el — gól, gólpassz, meccs embere, védés, tiszta lap, a meccs-osztályzatok (kiemelkedő+) és az egyéni díjak (Aranylabda +12, bajnoki királyok +7, kupa-díj +6, cím/kupagyőzelem +3) együtt; a küszöbök 25%-kal lejjebb (3/7,5/13,5/19/24/30/39/51), a régi egy-mércés utak is −25%; kvóták változatlanok; a kártyán a díjak és a KP. Lásd [kartyapont-1-0-11-11-00.md](kartyapont-1-0-11-11-00.md) |
| **1.0.11.12.00** | 11-23 | 🎥 kamerák, 1. fázis: a lövés jellegű jeleneteknél nyitó vágás új 3D kameraállásból (főkamera / kapu mögötti / támadók mögötti) a stadionnal (méret, nézők, klubszínek, vendégszektor, villanyfény), a jeleneten belül rendező (követő közeli ↔ totál vágás, a mozgás és az arcok változatlanok), gól után reakció-vágás a tomboló lelátóval; kapcsoló a Beállításokban; jelenet-skill (.claude/skills/jelenet). Lásd [kamerak-1-0-11-12-00.md](kamerak-1-0-11-12-00.md) |
| **1.0.11.13.00** | 11-23 | 🎬 felvezető-forgatókönyvek: MINDEN jelenet (gól és nem gól, 51 sablon) a hozzá illő 3D felvezetést kapja 29 archetípusból (beadás a szélről / a szögletzászlótól, letámadás az ellenfél labdájával, kontra a saját térfelünkről, sorfalas szabadrúgás, becsúszás + játékvezető, VAR …), vágásokkal és automatikus képkivágással (a passzoló és a góllövő mindig a képen, nagyban); új kamera-mód: Élő + ismétlés (a gól élőben 3D-ben esik, a gólöröm után a rajzolt jelenet visszajátszás, villogó R). Lásd [felvezetok-1-0-11-13-00.md](felvezetok-1-0-11-13-00.md) |
| **1.0.11.14.00** | 11-23 | 🎬 a régi jelenetek új, teljes 3D változata: a felvezetés után a régi jelenet KIMENETELE 3D-ben (gól a célzott cellába, kapufa, védés / megfogja, mellé / fölé, blokk, gólvonal, szerelés, tisztázás, öngól, lap a bíró kezében, sérülés + orvos, VAR-monitor + „NINCS GÓL”, behajtó busz), a régi infókkal a képen (célrács a cellával és „hova ment”, mérés + rekord, skill neve, színe és effektje, a Hős perce, feliratsáv); beállítás: Régi / Új / Mindkettő (alap: az új után a régi visszajátszásként, villogó R-rel, minden jelenetnél). Lásd [jelenet3d-1-0-11-14-00.md](jelenet3d-1-0-11-14-00.md) |
| 1.0.11.14.02 | 11-23 | (patch — terv, kód nélkül) 🧭 Kezdő út: a játék érthetővé tétele — „Mennyire ismered a játékot?”, mind a 10 nehézségi fok nyitva ajánlással, osztály-ajánlás, vezetett draft; 9 szakasz célfeladatokkal, amelyek fokozatosan nyitják a HUB funkcióit (lezárt funkció = az edző alapállása), minden nyitáshoz élő képes lecke; külön tananyag az erőforrás-takarékosságról és a mezőny követéséről, az átigazolásról és a gazdaságról, a csapatstílusokról és a skillfáról; fázisok, mérés, döntési pontok. Lásd [kezdo-ut-roadmap.md](kezdo-ut-roadmap.md) |
| **1.0.11.15.00** | 11-23 | 🧭 Kezdő út, 1. fázis — a belépés: „Mennyire ismered a játékot?” (Most kezdem / Játszottam már / Ismerem), mind a 10 nehézségi fokozat nyitva „kinek ajánlott” sorral és tudásszint szerinti ajánlással, kezdőnek 2 lépéses indító és megerősítés a 7+ fokozatnál, osztály-tanács, „Az edző tippje” a drafton; a dinamikus mód kivéve a választható módok közül (a „Karrier indítása” egyenesen a hagyományos karrierbe visz); költés-figyelmeztetés minden módban (kevés tartalék / 85% fölötti győzelmi esély a következő ellenfél ellen). Lásd [kezdo-ut-belepes-1-0-11-15-00.md](kezdo-ut-belepes-1-0-11-15-00.md) |
| **1.0.11.16.00** | 11-23 | 🧭 Kezdő út, 2. fázis — a motor: új karrierben (Most kezdem / Játszottam már) a HUB funkciói fokozatosan nyílnak, 7 szakaszban, kis célfeladatokkal (gombnyomás, meccseredmény, tabella); a Kezdő út kártya a HUB tetején („Hol?” gombok, mi nyílik, tartalék-forduló, „Mindent kinyitok”); kinyíláskor „🔓 Kinyílt a menüben!” + „Mutasd meg →”; az átigazolási piac a 8. fordulótól; a kihívás-ajánlatok és a zárt funkciók leckéi a nyitásig hallgatnak; zárva semmi nem vész el; régi mentés, „Ismerem a játékot”, közös karrier: minden nyitva. Lásd [kezdo-ut-motor-1-0-11-16-00.md](kezdo-ut-motor-1-0-11-16-00.md) |
| **1.0.11.17.00** | 11-23 | 🧭 Kezdő út, 3. fázis — a leckék: minden nyitáshoz legfeljebb 4 lépéses lecke (🖼 Kép → 👉 Mutasd: kiemelés arany kerettel → ✋ Csináld: a lecke megvárja, amíg megcsinálod → ✅ Összegzés), 8 lecke (az első tizenegy, edzés és összhang, az átigazolás, a meccs számai, a csapat lelke, szerencse és kockázat, erőforrás és a mezőny, hosszú táv); a „Mutasd meg →” a leckét indítja; ☰ Menü → 🧭 Vezetés: a Kezdő út ki/be, a leckék újranézhetők; a „Mérleg” szakasz a 30. fordulóig nyílik (az első nyáron már nyitva a boost, az Infópult és a klub); próba: a „kezdő bot” egy teljes idényt tétlenül végigjátszva minden első idényes funkciót kinyit. Lásd [kezdo-ut-leckek-1-0-11-17-00.md](kezdo-ut-leckek-1-0-11-17-00.md) |
| **1.0.11.18.00** | 11-24 | ⚖️ Kezdő út, 4. fázis — gazdaság: ERŐMÉRLEG a HUB-on a büdzsé alatt (🟢 a célrésben · 🟡 fölötte: „a mezőny utánad lép — most ne költs erőre”, és ki veszi el a többletet: téli felmérés / rés-követés · 🔴 alatta: „az erősítés a célhoz kell” · nyáron a rajt-cél), a nehézség saját mércéjével (a most elvárt rés és a holtsáv); GAZDASÁGI VISSZATEKINTŐ a szezonzáró jelentésben (erősítés, fejlesztés, bér, bevétel tételesen; a meccserőd és a mezőny az idény elején és végén; tanulság a zárórés szerint); a „Erőforrás és a mezőny” lecke az erőmérlegre mutat. Lásd [eromerleg-1-0-11-18-00.md](eromerleg-1-0-11-18-00.md) |
| **1.0.11.19.00** | 11-24 | 🎯 Kezdő út, 5. fázis — stílus: a választó mind a 8 kártyáján három új sor (💪 mit erősít · 🧩 milyen keret illik · 👁 a kereted szemével: a mostani kezdőid számai azon a mércén, amit az a stílus néz — ítélet és szín nélkül), minden karrierben; két lecke: „A klub filozófiája” a döntés előtt (magától, a választó megnyitásakor) és „Stíluspont és képességfa” utána; a Kezdő út új szakasza: „A klub filozófiája” (válassz · nézd meg a képességfát · a mérföldköveket); a lecke-motor CSS-szelektoros célpontot és előkészítő lépést kapott. Lásd [stilus-osszeveto-1-0-11-19-00.md](stilus-osszeveto-1-0-11-19-00.md) |
| **1.0.11.20.00** | 11-24 | 🎓 Kezdő út, 6. fázis — a vége: záró ablak „Végigjártad a Kezdő utat!” (szakaszonként egy sor arról, mit tanultál; a leckék listája; az utolsó nyitás és minden más ablak után, egyszer); jelvény a profil fejlécében („🧭 Kezdő út — végigjárva”); `kutKesz` a játékoshoz kötött feloldás-naplóban; a következő karrier „Játszottam már” beállítással indul (a kifejezett „Ismerem” marad; „Mindent kinyitok” után nincs jelvény). Javítás: a tudásszint első alkalmazása csak egyjátékosban (közös karrierrel kezdve az első egyjátékos indításnál is életbe lép). Lásd [kezdo-ut-zaro-1-0-11-20-00.md](kezdo-ut-zaro-1-0-11-20-00.md) |
| 1.0.11.20.01 | 11-24 | 🧭 Kezdő út, 7. fázis — csiszolás: a módválasztó lap („Indulhat a karrier”) kikerül az útból — a „Karrier indítása” és minden mentés nélküli út egyenesen a gyors indítóba visz; az edző draft-tippje Rating nélkül (felmérés előtt általános tanács, utána a felmértek közül a legmagasabb POT-ú, a becsléssel); az újdonság-értesítés a Kezdő út zárt funkcióiról hallgat; nyelvi kör; 360 px és pixel téma ellenőrizve. Lásd [kezdo-ut-csiszolas-1-0-11-20-01.md](kezdo-ut-csiszolas-1-0-11-20-01.md) |
| **1.0.11.21.00** | 11-24 | 🧭 A kezdés újragondolva: a menedzsment-célkitűzések ablaka a draft után nem jön elő, csak az első HUB-on; EDZŐVÁLASZTÁS: tipp a kerethez (minden edző kedvelt taktikáinál a mostani kereted illeszkedése és az indulási meccs-hatás OVR-ben, „💡 ajánlott” jel), „Biztos őt választod?” megerősítés, visszalépés a kezdő taktikától és a végső kártyáról is — ugyanahhoz a 3 edzőhöz; AZ ELSŐ TIZENEGY vezetett túra (magától indul az első HUB-on): a keret és a piros nyíl, csere két úton, egy rossz poszton álló / erősebbel pótolható játékos lapja (attribútumok, posztok), csere a javasolt partnerrel, megbízás, majd villogó ☰ Menü → Felállás → az összetételből számolt ajánlott alak, és ugyanígy a Taktika (ismertség, illeszkedés, a Meccs-hatás OVR — 60%/60 vs 50%/80 példa —, fejlesztési tanács, ajánlott rendszer); a taktika-panel minden sora mutatja a meccs-hatást; a lecke alatt más felugró tipp nem zavar. Lásd [kezdes-vezetes-1-0-11-21-00.md](kezdes-vezetes-1-0-11-21-00.md) |
| **1.0.11.22.00** | 11-24 | 🧭 A tanítás egységesen vezetett: a menü MINDIG a saját felületén nyílik (a tanító réteg, a guide-túra és a ragadó gomb is — eddig a keretlista mellett, beágyazva tűnt fel); a Kezdő út céljai csupa tanító, eredménytől független lépés (a 2. szakasz: rúgj egy gólt · játssz le 3 meccset · változtasd meg a meccs tempóját; győzelem, kapott gól nélkül, zsinór, tabella kikerült), és mind a szakasz kezdetén már nyitott funkcióra mutat; animáció: az alap az Új (csak 3D), 25%-kal lassabb (a jelenet órája lassul), a vége kitart és elhalványul; minden nyitás-lecke vezetett (villogó ☰ Menü / „← Vissza a menübe” → villogó menüpont → a panelen konkrét elem, élő példa a saját keretből → kipróbálás → összegzés). Lásd [tanitas-vezetes-1-0-11-22-00.md](tanitas-vezetes-1-0-11-22-00.md) |
| 1.0.11.22.01 | 11-24 | 🧭 Az első meccsig: „Az első tizenegy” kijelölése egy sor (a teljes keretlista kilógott a képből és villogott), a lecke kerete mindig a képernyőn belül; az első talizmán-húzásnál vezetett lecke (mi ez, hogyan olvasd a lapot, válassz, Passz / Később döntök — több várakozó húzással is); a klub arculata kezdőként is elérhető, a Kezdő út első szakaszában ajánlott feladat, és az első lecke végén vezetett lépés. Lásd [kezdo-csiszolas2-1-0-11-22-01.md](kezdo-csiszolas2-1-0-11-22-01.md) |
| **1.0.12.0.00** | 11-24 | 🏆⚽ MAJOR — a kupaszabály a futó karrierekben is változik: a hazai kupa minden helyezéssel jár (D1–D2: Fából Készült Serleg; NB I és NB II: Magor Kupája, a bajnok is), és ha mellé európai sorozat is jut, egy nyáron KÉT kupa megy — előbb a hazai, utána az európai (`S.euroSor`, mentve); a hazai kupa győzelme feljavítja a sorban álló sorozatot (pl. KONF → KK-selejtező); D0-tól változatlanul csak a HSZ. 🛡️ A klub arculata: 8 · A meccslabda — versenyenként saját labda (bajnokság + minden most elérhető kupa; alapszín, mintaszín, hat minta), a régi és az új jelenetben is; 9 · Az animációk — a jelenetek be/ki és az Új / Mindkettő / Régi itt is. Lásd [kupa-labda-1-0-12-0-00.md](kupa-labda-1-0-12-0-00.md) |
| **1.0.12.1.00** | 11-24 | ⚖️🎁 A meccsmotor 7.1-től változatlan, lefelé fokonként könnyebb (egyjátékos karrierben): a fölény nagyobb (d×(1+0,6k)), a hátrány kisebb (d×(1−0,35k)), +1,0k meccserő a javadra — 1.1-en +3-mal 79% győzelem (7.1: 60%), −3-mal 30% (7.1: 18%); párharcban és közös karrierben nincs. A hat jutalom-képernyő (kémia, passzkémia, gyilkos páros, szárny, fejlesztés, jutalom-skill) első megjelenésekor vezetett lecke (mi ez → mire jó → a játék ajánlata → válassz → hol látod). Javítás: a menüből indított jutalom/felfedezés ablakként jön a menü fölött (eddig láthatatlan volt); egy induló lecke félreteszi az alatta maradó guide-tippet és lépéssort. [docs](motor-jutalom-1-0-12-1-00.md) |
| **1.0.12.2.00** | 11-24 | 🧭💡 A tanítás szélei: a lecke-lap nem takarja a célt (oda ül, ahol kevésbé takar, és a lap/panel alja mindig felgörgethető — az edzésterv „rögzítés" gombja elérhető); a Kezdő út szakaszának vége nagy, ünneplő ablakkal szól AZONNAL, a meccsképernyőn is („Irány a HUB" → a lecke indul; a Kezdőrúgás és a lánc megáll előtte); 💡 ajánlás az edzéstervhez (a taktikád fókusza, kire hat, illeszkedés most → az idény végén) és az összhangépítéshez (melyik sáv, a párok, meccserő-hatás), betöltés gombbal; „Hol?" minden feladatnál vezetett mini-lecke (pl. játékos → adatlap → a fejlődési görbe lenyitása); javítás: a taktika-csúszka is kipipálja a csúszka-feladatot; a jutalom- és felfedezés-képernyők mindig felugró ablakként, a felfedezett játékos arccal és Ratinggel, az első felfedezésnél leckével. [docs](tanitas-szelek-1-0-12-2-00.md) |
| 1.0.12.2.01 | 11-24 | 🧭 Az első átigazolási ablak vezetve: a piac-lecke magától indul az ablak nyitásakor, és sorra rámutat minden lehetőségre (Vásárlás, Klub-szemle, Képesség-keresés, Átigazolási esemény, Felfedezett játékosok — az ingyenes scout-találat —, Sztár piac, Stábtag, Eladási ajánlatok), majd egy tartalék adatlapján az „Eladás most" és a „Piacra bocsátás" működésére, végül a lezárásra. [docs](tanitas-szelek-1-0-12-2-00.md) |
| 1.0.12.2.02 | 11-24 | 🧭 Javítás: a „Hol?" zárt menügombra mutatott egy korábban indult karrierben (a szakaszok nyitásai 1.0.11.22.00-ban átrendeződtek, és a teljesített szakasz új nyitása elmaradt). A kiértékelés most mindig pótolja a teljesített szakaszok nyitásait, a „Hol?" pedig kinyitja a feladat funkcióját. Módszeres próba mind a 22 feladatra, álló és fekvő nézetben, régi mentésből. [docs](tanitas-szelek-1-0-12-2-00.md) |
| 1.0.12.2.03 | 11-24 | 📅🛡️ Menetrend és tabella: a bajnoki egyéni listák nyers (jogvédett) klubnevei eltűntek — a clubLabel a szezonos alakot is a fordítórétegen viszi át; új kinézet a tabella stílusában: három fül (Menetrend · Tabella · Egyéni listák), mezes menetrend teljes nevekkel, címkékkel, eredmény-pirulákkal és kiemelt következő meccsel; mezes, érmes egyéni listák a klubbal a név alatt. [docs](tanitas-szelek-1-0-12-2-00.md) |
| **1.0.12.3.00** | 11-24 | 🐞 Fejlesztői jegyzetek: a profil rejtett mezőjébe „szutykos fejlesztő vagyok” → minden képernyőn 🐞 gomb; a koppintás rögzíti a helyet (képernyő, ablakok, panel, lecke, adatlap, idény/forduló, nézet, verzió), a jegyzet-ablakban csoportos típuslista (hiba / ötlet), fontosság és jegyzetfüzet; helyi sor + feltöltés a Firebase devjegyzet/<uid> ágára; a lehúzás GitHub Actionnel (háromóránként) a `dev-jegyzetek` ágra; a feldolgozás a `jegyzetek` skill-lel (megbízható szerző, kezelt-nyilvántartás). [docs](dev-jegyzetek.md) |
| **1.0.12.4.00** | 11-25 | 🎬 Felületi jelenetsáv (🐞 jegyzet): fent egy kis animált sáv (álló nézetben ≤ 33%, fekvőben ≤ 25%), koppintásra vagy 10 mp után eltűnik, 90 mp-en belül nem ismétlődik, kikapcsolható („kikapcsolom” / A klub arculata → Animációk); négy jelenet élő adattal — 🏢 Infópult (recepciós a klubirodában), 🏋️ Edzésterv (edző + bóják), 🛒 Vásárlás (scout), 📅 Menetrend (eredményjelző). A kezdőlap két útja: 01 Egyedül játszom · 02 Gyere 1v1!; a stadion-nézetben (fekvő/PC meccs) újra látszik a felső sáv (téma, hang, főmenü, verzió). [docs](jelenetsav-1-0-12-4-00.md) |
| **1.0.12.5.00** | 11-25 | 🧭 A Kezdő út a második játékos jegyzetei szerint (9 🐞, a fejlesztő döntéseivel): nehéz (5+) fokozaton a ⚡ Boost az első meccsek után nyílik; a „Klub filozófiája” szakasz nyárig vár (a csapatstílus nyitásáig); a 📋 Menedzsment és a kihívások az elejétől, az első ajánlatnál vezetett kihívás-lecke; a kapitányválasztó nyitva marad, régi ↔ új összevetéssel („Mégis a régi”); a Kezdő úton nincs „saját felállás” ajánló; a taktika-panelből kikerült a csúszka-út; a „Hol?” a megbízásnál középpályást → Megbízás gombot → javaslatot vezet; a „Mielőtt pályára lépnél” tipp a választott fokozatról szól; kivizsgálva: a 8.1 → 6.3 a zárt csomag-elemek helyettesítése (hivatalos szint). [docs](apa-jegyzetek-1-0-12-5-00.md) |
| **1.0.12.6.00** | 11-25 | 🎚 A fokozat-csomag minden eleme nyitva az első karriertől: a mezőny-tempó, a játék-tempó mind a négy tengelyen (gyorsítás és lassítás), az ikon-igazolások sűrűsége és a realisztikus képesség-mód — a választott fokozat pontosan az, ami fut (8.1 = 8.1, nincs helyettesítés); a kezdő lépcső ezeket már nem köti (a csomag adja); a feloldás-ablakokból és a haladás-panelből kikerültek. A többi kapu (válogatottak, csapatstílusok, D4–D6, lutri, kész klub, dinamikus, 10.6+) változatlan. [docs](nehezseg-nyitva-1-0-12-6-00.md) |
| **1.0.12.7.00** | 11-25 | 🪟 Menüből nyíló aloldalak ablakban (🐞 jegyzetek): állva, menü-módban a Csapatépítés és az Átigazolás minden HUB-kártyája és aloldala (taktika, kapitány, edző, szerepek, csúszkák, menedzsment, vásárlás, klub-szemle, edzésterv, összhang, boost, felállás, arculat, stadion, scout, keret, stáb …) rögzített, görgethető ablak a menü fölött, „← Vissza a menübe ✕” sávval; bezárás után a menü ugyanott (0 px eltérés). Kihívás-lecke: a bemutatás után szabad választás, 3 mp után tipp a HUB-kitérőről. Csapategyensúly: Kezdő út-feladat + vezetett lecke. Párkémia-jelvény látszik a reflektor témában. [docs](menu-ablak-1-0-12-7-00.md) |
| **1.0.12.8.00** | 11-25 | 🎬🧍 Figurás jelenetek: a jelenetsáv szereplői a meccsjelenetek figurái (saját arc kivágva, klubmez, mezszám); az edzésterv-jelenetben a mi kezdőnk szlalomozik labdával, az edző sípol; a recepciós és a scout kivágott mellkép; új jelenetek: 👑 kapitány (a valódi kapitány karszalaggal), 📋 taktika (tábla a mostani felállással), 🌱 akadémia (a legfiatalabb dekázik). Tétlenségben (20 mp, a HUB-on, minden témában) a saját játékosaink jönnek: egyedül szól (cserepad, kapitány, gól, sorozat, kor, jellem szerint), dekázik, vagy páros jelenet az összhang és a vérmérséklet szerint (passz + pacsi / veszekedés / beszélgetés); érintésre eltűnik; a pixel témában a kisfiú helyett. [docs](figura-jelenetek-1-0-12-8-00.md) |
| 1.0.12.8.01 | 11-25 | (patch) 🧍 a tétlen játékos-jelenet hamarabb (8 mp, a szünet 10 mp) és a meccsképernyőn is jön, amikor nem fut a mérkőzés és nem pereg jelenet. [docs](figura-jelenetek-1-0-12-8-00.md) |
| **1.0.12.9.00** | 11-25 | 🎰🪟🎬 Az átigazolási esemény kaszinós pörgetővel (a játékosod besétál, megrántja a félkarú rabló karját, a tárcsák az esemény jelén állnak meg, JACKPOT, alatta az eredmény); a Csapatépítés modális alpontjai (talizmánok, ládák, meccserő, akadémia, cserék) is a közös ablakstílusban; hét új menüpont-jelenet (felállás, talizmán, boost, stadion, stáb, menedzsment, ládák). 7 🐞 jegyzet: a talizmán-fúzió mindkét alaphatást megtartja és erősíti (+ javítva: a választott célzott lap célja elveszett); az „MK + KK indulunk” gomb ki, kérdés a bajnokság végén; sztár-megerősítés; a stílus-döntés alatt a tippek várnak, a filozófia-lecke szerepekkel és ajánlott képességgel, a Kezdő út két új szakasszal (kupák, szezon vége); a lap a bíró kezében, szebb háló; szélesvásznú jelenet PC-n és fekvőben. [docs](kaszino-jegyzetek-1-0-12-9-00.md) |
| 1.0.12.9.01 | 11-25 | (patch) 🧍 A játékos-jelenetek a képernyő alján nem csak tétlenségben: 10 mp után bármelyik képernyőn (ha nem fut meccs és nem pereg meccsjelenet), két jelenet között mindig 7 mp; érintés, görgetés máshol nem tünteti el — csak a figurára / buborékra koppintás, utána 10 mp múlva jön a következő; saját kapcsoló: 🛡️ A klub arculata → Animációk → „🧍 A játékosaid a képernyő alján”. [docs](kaszino-jegyzetek-1-0-12-9-00.md) |
| **1.0.12.10.00** | 11-25 | 🐞 5 jegyzet: a Run-tempó a Run-célhoz (kezdő −2) mér, nem a D1-hez (a határ a 3. idény vége); telepítve az elveszett teljes képernyőt érzékeli („⛶ Vissza” gomb, a következő koppintás visszakéri); a saját mez mindenhol az arculaté (kupa-párosítás, tabellák, szezonkártyák); a gól nélküli letámadás a 16-oson kívül; a Sortűz valódi lövéssorozat (blokk, blokk, kapusvédés, gól); a rajzolt jelenet feliratai a 3D képen is; az Egyensúly-gól valódi libikóka (a befejező felugrik, a túlsó vég lecsapódik). [docs](jegyzetek-1-0-12-10-00.md) |
| **1.0.12.11.00** | 11-25 | 🏆🎬 Kupa-ünneplés: minden megnyert kupadöntő után ~45–60 mp-es, átugorható jelenet (lefújás, a hősök, a lelátó, a sor az érmekkel, a trófeaemelés, a csapatstílus koreográfiája, záró kép; 7 szint a sorozat rangja szerint), utána a konfettis trófea-képernyő, és csak a „Tovább” után a meccs utáni lánc (skillek, értékelés). 🐞 Az ikon-sűrűség a futó karrierben a mentett fokozaté (a 9.5 „Kikapcsolva” tényleg 0%), a végigjátszás is a kapcsolón át dob. 13 új menüpont-jelenet (edző, szerepek, meccserő, csúszkák, arculat, scout-fejlesztés, keretbővítés, összhang, klub-szemle, sztárpiac, eladás, figyelőlista, stábpiac). [docs](kupa-unneples-1-0-12-11-00.md) |
| **1.0.12.12.00** | 11-25 | ⚖️ Az Egyensúly-gól saját 3D jelenete: libikóka a stadionban, rajta öt csapattárs és a befejező; a palló kileng és megáll, a befejező leugrik, a túlsó vég lecsapódik, a labda felpattan, ő a levegőből a kapuba fejel. „Új” módban már nem jön utána a régi rajz. [docs](egyensuly-3d-1-0-12-12-00.md) |
