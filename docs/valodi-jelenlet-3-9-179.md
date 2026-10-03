# 3.9.179 — 🟢 Valódi jelenlét PvP-ben

> „Akkor is rendszeresen online-nak jelzi a társat PvP-ben, amikor valójában
> nem az: egyszerűen csak nem zárta be az alkalmazást, de már nincs az
> előtérben, nincs aktivitás, vagy már más alkalmazásban van aktivitás."

## Mi volt a baj

Két ok együtt adta ki a hibát:

1. **A szívverés csak a beváró képernyőkön futott.** Máshol a legutóbb kiírt
   `online:true` ott maradt a szobában.
2. **Az `online:false`-t csak a szerver írta be**, és csak akkor, amikor a
   kapcsolat megszakadt (`onDisconnect`). Egy háttérbe tett, de be nem zárt
   alkalmazás kapcsolata viszont percekig, akár órákig él. A böngésző ilyenkor
   nem bontja.

## Mit jelent most az „online”

A társ akkor **online**, ha:

* a játék **előtérben** van, **és**
* az elmúlt **3 percben volt aktivitás**: érintés, kattintás, billentyű,
  görgetés. Aktivitásnak számít az is, ha olyan képernyőn van, ahol a nézés
  maga a játék: egy éppen futó, nézett meccsen vagy a beváró rétegen.

| helyzet | mi megy ki a szobába |
|---|---|
| előtérben, aktív | `online:true`, 25 mp-enként frissítve (szívverés) |
| **háttérbe teszi** (másik app, lezárt képernyő, másik fül) | **azonnal** `online:false`, az időpont a távozás pillanata |
| 3 perce nem nyúl hozzá (előtérben) | `online:false`, az időpont az **utolsó aktivitás** |
| asztali gép: az ablak látszik, de **másik program van elöl** | 1 perc tétlenség után `online:false`; itt a nézés nem számít aktivitásnak |
| visszatér, vagy egyet érint | **azonnal** újra `online:true` |

A szívverés mostantól a közös karrier egész ideje alatt fut, nem csak a beváró
képernyőkön. A „távol” jelzés egyszer megy ki, nem ismétlődik.

## A túloldal is óvatosabb

A társ `online:true` jelzését a játék már nem fogadja el önmagában. Ha
**95 másodperce** nem jött szívverés, a társ „nincs a játékban”. Így egy régi
kliens vagy egy lefagyott fül sem látszik örökké online-nak.

A felirat is a valóságot mondja: „○ A társad most NINCS a játékban —
utoljára 12 perce volt aktív”.

Minden, ami a jelenlétre épül, ezzel együtt javul:

* tétlen vagy háttérben lévő társnak a 🔔 push-bökés megy, nem a játékon
  belüli jelzés, amit úgysem látna;
* a Villám/Tempós fokozat automatikus továbblépése elindul, ha a társ nincs
  ott;
* a „ne zavard, ott ül” kivételek csak akkor élnek, ha tényleg ott ül.

## Amit tudni kell

* **Mindkét félnek frissítenie kell.** Az új szabály a régi verzió jelzéseit
  is jobban olvassa (95 mp után elavultnak veszi őket). Pontos „távol”
  jelzést viszont csak az új verzió küld magáról.
* **A Firebase-szabályokhoz nem kellett nyúlni.** Csak a meglévő `online` és
  `seenAt` mező íródik.
* A küszöbök: `MP_IDLE_MS` = 3 perc, `MP_IDLE_BLUR_MS` = 1 perc,
  `MP_SEEN_STALE_MS` = 95 mp. A szívverés (`MP_PRES_BEAT_MS`) változatlanul
  25 mp.

## Próba

`tools/valodi-jelenlet-3-9-179-proba.js`, 18 állítás. Hamis Firebase-réteggel
dolgozik, ami minden írást rögzít. Ezeket méri:

* előtér és tétlenség;
* egy érintésre visszaáll;
* háttér és visszatérés;
* a nézett meccs és a beváró réteg;
* a globális szívverés;
* az asztali fókusz öt esete;
* az olvasó oldal;
* a felirat;
* csak engedett mezők íródnak;
* nincs oldalhiba.
