# 3.9.214 — 🤝 Gyors indítás PvP-szobában: a közös karrier fajtája

> „Az egyszerű kezdés jelenleg nem veszi figyelembe a választási lehetőséget
> dinamikus és hagyományos mód között, amennyiben pvp szobát indítasz, annak
> kell egy külön kapcsoló oda."

## Amit találtam

**1. Valódi hiba: a lépcső zárai a PvP-szobában is ott ragadtak.**

Ha a kezdő lépcsőn járó játékos ugyanabban a munkamenetben már megnyitotta
az egyjátékos beállítót (vagy a Beállításokat), a lépcső letiltotta a
módválasztót. Utána egy PvP-szobát indítva a gyors panel a zárt gombot
örökölte: a Dinamikus nem volt választható, és visszaváltani sem lehetett.

Az ok: az `unlockApplyLocks` közös karrierben egy puszta `return`-nel
kilépett. Mivel ott nincs lépcső, nem zárt — de a korábbi zárakat sem vette
vissza.

**2. Hiányzott a saját kapcsoló.** Egyjátékosban a kezdőlap két gombja
(Dinamikus / Hagyományos karrier) dönt. A szobát indító házigazda viszont gomb
nélkül érkezett a gyors panelre, és az az előző (egyjátékos) választás
maradékával nyílt.

## A javítás

* **A lépcső zárai feloldódnak közös karrierben.** A gombok, a kapuk
  lakatjai és a lépcső jegyzete is. A vendég átnézője kivétel, ott a zárolás
  szándékos.
* **Új alapbeállítás:** Beállítások → 🎛️ Új karrier alapbeállításai →
  **🤝 Közös karrier fajtája** (Dinamikus / Hagyományos).
  * A szobát indító házigazda gyors panele **ezzel nyílik**.
  * Ha a panelen átváltod, az **visszaíródik** a következő szobához.
  * **Egyjátékosban nem hat:** ott továbbra is a kezdőlap gombja dönt, és az
    egyjátékos váltás sem írja felül.
* **A gyors panel felirata PvP-ben:** „A közös karrier fajtája —
  mindkettőtökre érvényes”.
* A választás (mint eddig is) a szoba csomagjában utazik (`pyr.on`), a
  vendég ezt veszi át.

## A próba

`tools/pvp-gyors-fajta-3-9-214-proba.js` — **21 állítás**, valódi böngészőben,
hálózat nélkül (szoba-backend csonkkal).

* az alapbeállítás sora és tárolása;
* a házigazda útja mindkét irányban, a felirat, a visszaírás;
* a publikált csomag;
* a bejelentett eset: lépcsős egyjátékos beállító után PvP-szoba (a javítás
  előtti kódon itt a Dinamikus tiltva maradt);
* egyjátékosban a kezdőlap dönt.
