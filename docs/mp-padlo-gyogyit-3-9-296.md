# 🩹 A közös karrier nehézségi szabálya újratöltés után (3.9.296)

## A bejelentés (hardcore közös karrier, 2. idény eleje)

| | házigazda | vendég |
|---|---|---|
| nehézségi szint | 7.5 Mesteri, célrés +1 | **nincs kijelezve** |
| osztályközép (D3) | 116 | 95 |
| a mezőny meccs-ereje | 119,5 | 100,6 |
| saját meccs-erő | 108,6 („Fal −10,9”) | 134,2 („Sétagalopp +33,6”) |
| Run | — | 47,9, „Döcögős” |

## Az ok

A vendég a szoba csomagjából kapja meg a nehézségi szabályt (`padlo:2`, a
kétoldalú padló) és a szoba fokozatát (`_mpNfFok`). Ezt az `mpApplySettings`
állítja be, de **csak modulváltozókban** élt.

A mentés (`S.pyrMp`) a draft és a klubválasztás közti állapotból csak az
osztályt, a sávot és a felskálázást vitte. Ha a vendég ezalatt újratöltött
(vagy kilépett és visszalépett), a karrier-indítás (`pyrConfirmDiv`)
`_mpPadlo = 0`-t látott. A karrier így **padló nélkül** indult:

* nincs nehézségi szint, ezért nincs sáv és nincs célrés-ablak;
* a kezdőrúgás nem a padló szerinti, kézfogásból számolt emelést futtatta,
  hanem a régi szuperliga-kalibrációt (`pyrSuperKickoff`);
* a két világ így idényről idényre szétvált.

A házigazdánál ez nem fordulhatott elő: nála a szabály mindig `padlo:2`.

## A javítás

1. **A mentés viszi.** Az `S.pyrMp` mostantól a szabályt (`padlo`) és a
   fokozatot (`fok`) is tartalmazza, a betöltés pedig visszaállítja a
   modulváltozókat. Az újratöltés után induló karrier így a szoba szerint
   fut.
2. **A már hibás karrier gyógyul** (`mpPadloGyogyit`).
   * **Mikor fut:** a jelenlét első, teljes olvasásakor, ami a szoba
     közzétett csomagját is hozza. Csak akkor, ha a szoba kétoldalú
     padlóval fut, a karrierben pedig hiányzik.
   * **A szabály:** a szoba csomagjából visszaáll a `padlo:2`, a fokozat,
     a célrés, a tél és a holtsáv. Megjelenik a nehézségi sáv.
   * **Az emelés:** ha az idény rajtja még nem a padló szerint
     könyvelődött, és megvan az idénynyitó közös pár (`superPair`), a
     mezőny-emelés azonnal lefut. Ugyanazokból a cserélt számokból számol,
     mint a társ gépén, így a két világ összeér.
   * **A napló kimondja,** mi történt.
   * Ép karriert és régi (padló nélküli vagy egyoldalú) szobát nem bánt.

## Ami nem gyógyul vissza

**Az első idény különbsége.** A vendég padló nélkül, könnyebb világban
nőtte ki magát (134 vs 108), és ez a két meccs-erő közti különbség
megmarad.

A közös pár átlaga (a 3.9.287 óta súlyozott) innentől mindkettőtökre
ugyanazt a mezőnyt állítja. A különbség a következő idényekben a
kiegyenlítő rendszerekkel (befektetés-arányos hangolás, célrés-ablak)
fogy.

## Próba

`tools/mp-padlo-gyogyit-3-9-296-proba.js`.
