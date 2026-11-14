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
