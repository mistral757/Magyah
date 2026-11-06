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
