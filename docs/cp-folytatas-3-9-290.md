# ⏸ Félbehagyott checkpoint: visszatérés újratöltés után (3.9.290)

## A bejelentés

Az első hardcore-próbán a 8. fordulónál kellett bevárni egymást. Aki
hamarabb ért oda, kilépett, majd visszalépett. A játék ekkor nem az
átigazolási ablakhoz vitte, hanem a 9. forduló kezdőrúgását ajánlotta fel.
A kézfogás gombja csak menüpontok közti lépegetés után jelent meg, az
„Irány a szezon" gomb helyén.

Ugyanez a hiba a kihívás-választásnál is előjött: ha ott frissített, a
felajánlott kihívások eltűntek.

## Az ok

A forduló utáni checkpoint (kihívás-választás → jutalmak → hardcore
kézfogás → átigazolási ablak) addig csak a memóriában létezett. A mentés
annyit tudott, hogy a 8. forduló lement. A betöltés ezért a következő
kezdőrúgásra vitt. Ez egyjátékosban is így volt: frissítéskor a kihívások
és az ablak is kimaradtak.

## A javítás

**Mentett folyamat (`S.cpFolyamat`).** Mezői: idény, forduló, lépés
(`kihivas` / `ablak`) és a felajánlott csomag. A nyitott ablak (`S.twWindow`)
veszi át, ekkor törlődik.

**Betöltés (`cpFolytatasBetolteskor`):**

* **Kihívás-választás közben:** ugyanaz a lista nyílik meg, nem sorsol újat.
  Az elvállaltak megmaradnak. Utána a szokásos úton megy tovább.
* **Függő kézfogás (hardcore):** egyből a HUB menüjébe visz, és a kézfogás
  azonnal újraindul. Ha a társ közben odaért, rögtön nyílik az ablak.
* **A kihívások után, az ablak előtt:** onnan folytatódik.

**Egyértelmű HUB (hardcore):**

* A függő kézfogás alatt a HUB fő gombja maga a kézfogás:
  „🛡 Kézfogás a társaddal — …". Menüpontok közti lépegetés sem írja felül.
* A fölötte álló jelzés csak tájékoztat, nem második gomb.
* A „↩ Később folytatom" egyenesen a HUB menüjébe visz.
* A kezdőrúgás gombja sem ígér fordulót („🛡 Előbb a kézfogás a
  társaddal"). Megnyomva a kézfogást hozza elő.

## Próba

`tools/cp-folytatas-3-9-290-proba.js`: valódi mentés → friss lap → a
betöltő út.
