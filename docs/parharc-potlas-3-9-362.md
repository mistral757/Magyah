# 3.9.362 — az elmaradt párharc-nap pótolható (saját bajnokság)

> „PvP könnyed. Nem volt párharc a 15 és 23 forduló után sem. Mi lett vele?"

## Amit megnéztem

* **Minden indítási út** (Kezdőrúgás, végigjátszás, „meccsről meccsre”,
  betöltés utáni folytatás) a `startRound` → `startRoundNow`-on megy át, és ez
  ELSŐKÉNT a párharc-napot kérdezi. Kerülőút nincs.
* **Élő próba két géppel:** egy valódi 15. bajnoki után a II. nap esedékes, és a
  gomb is azt kínálja („Felkészülés — ⚔ párharc-nap II”).
* **A nap rekordját** csak a lejátszott párharc írja. Az egyszeri 3.9.352-es
  javító a napokhoz nem nyúl.
* **Ami elnémíthatja a napot:** `svPhEsedekes()` 0-t ad, ha
  * a szoba nem él (`mpSv()` hamis — a szoba-kapcsolat nincs fent, vagy elárvult);
  * vagy egy kupa/osztályozó aktívnak látszik.

## A hiba, ami a kimaradt napot végleg elvitte

* **A feltétel `idx === nap` volt.** A nap CSAK a saját fordulóján (8., 15.,
  23.) volt esedékes.
* **Ha ott bármi miatt kimaradt**, a következő bajnoki után már soha nem jött
  elő, és ezt semmi nem jelezte.

## Mostantól

* **Pótlás:** a legelső lejátszatlan nap esedékes, amint a forduló elérte
  (`idx ≥ nap`). Sorrendben pótlódik (előbb a II., aztán a III.).
* **A közös kulccsal fut** (`s<idény>svq<n>`). Ha a társad közben a te
  korábbi kereteddel lejátszotta (szimulálta), a te géped az ő eredményét veszi
  át.
* **Ha a nap esedékes volna, de a szoba nem él**, a napló egyszer kimondja: „A
  II. párharc-nap most nem indulhat: a szoba nincs kapcsolatban. Nem vész el…”
* **A futó idényben** a már elmaradt napok a következő kezdőrúgás előtt
  jönnek.

## Próbák

* **`tools/sajat-bajnoksag-3-9-331-proba.js`** (+3 állítás):
  * a 15. után elmaradt II. nap a 20. fordulóban is esedékes;
  * pótlás után a következő nap a saját fordulójától jön, és sorrendben a
    legelső hiányzó;
  * ha a szoba nem él, a nap nem indul, de a napló egyszer szól.
* **`tools/negy-parharc-3-9-338-proba.js`:** a pótlásos szabályhoz igazítva (a
  későbbi nap ellenőrzésénél a korábbiak lejátszva).
