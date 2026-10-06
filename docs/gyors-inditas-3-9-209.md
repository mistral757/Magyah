# 3.9.209 — ⚡ Gyors indítás és 🎛️ az új karrier alapbeállításai

> „a beállítások menübe kerüljön be az összes kapcsoló, amit új játék
> indításkor is állítasz. Mindent beállíthatsz magadnak, hogy hogyan
> szeretsz, és amikor új játékot indítasz, akkor legyen az, hogy egyszerű
> beállításokkal indulunk neki, csak annyit kérdez, hogy dinamikus vagy
> hagyományos, draft vagy kész klub és aztán már indul is a draft/
> csapatválasztás. És csak a részletes mód lenyitásával lenne az, hogy
> végigmész a szokásos beállításokon […] (ezt globálban gondolom, pvp és
> single)."

> „Osztályválasztó mindig jöjjön fel."

## Az út

**Kezdőlap → Dinamikus vagy Hagyományos karrier → ⚡ Gyors indítás.** A
panelen két kérdés van:

1. **A karrier fajtája:** Dinamikus vagy Hagyományos (a kezdőlapon
   választott van kijelölve, átváltható).
2. **A kezdés:** Draft vagy Kész klub.

Az **Indulás →** ugyanazt a „Kezdjük”-et futtatja, mint a részletes út —
közös karrierben a házigazda publikálását is. Utána a scout, a draft vagy a
klubválasztás jön, hagyományos módban pedig **mindig az osztályválasztó**,
az alapbeállítás szerinti osztállyal és nehézséggel előre kijelölve.

**A panel alján az alapbeállításaid** (ugyanaz az összefoglaló, mint a
részletes beállító utolsó oldalán). Egy sorra koppintva a részletes
beállító azon az oldalán nyílik, ahol a beállítás lakik.

**🧭 Részletes beállítás:** a megszokott négyoldalas beállító, az
alapbeállításokkal kitöltve. A tetején „⚡ Vissza a gyors indításhoz”.

**Közös karrier:** a házigazda is gyors indítással kezd, a saját
alapbeállításaival (azok utaznak a szoba csomagjában). A vendég útja
változatlan (átnéző).

## Az alapbeállítások

**Beállítások → 🎛️ Új karrier alapbeállításai** (lenyitható blokk):

* ⚡ **Gyors indítás** be/ki — kikapcsolva mindig a négyoldalas beállító
  nyílik;
* **minden beállító-mező:** kezdés, felállás, draft-pool, Rating-alap,
  Legendás magyahok, scout, családtag, újrapörgetés, ellenfelek, kezdő
  osztály, a rajt nehézsége, mezőny, szintkövetés, fejlődési tempó és a
  négy résztempó, ikonok, vezetés, képességek.

**A futó karriert nem változtatja meg:** a szerkesztő az alapbeállítás-tárba
ír, és az érték a következő beállító-megnyitáskor lép életbe.

**Egy vezérlőkészlet, két belépés:**

* a választható értékeket és a zárakat a szerkesztő a beállító SAJÁT
  gombjaiból olvassa (lépcső-zár, kapuk, Run-kapuk) — nincs második igazság;
* a beállító képernyő minden mozdulata visszaíródik a tárba;
* a ténylegesen választott osztály és nehézség lesz a következő karrier
  alapja.

## Zárak és lépcsők

* **A kezdő lépcsőkön** a lépcső presetje továbbra is felülírja a tárat (a
  tár előbb töltődik be, a preset utána fut).
* **Zárt értéket a tár sem állít be:** ha a rács gombja zárt, a mező kimarad.
* **A gyors indításban:**
  * a zárt kezdés (kész klub) nem választható;
  * a dinamikus karrier 5 címes kapuja itt is él;
  * a lépcső jelzése a panel tetején áll.

## A tár

`harminc_nulla_karrieralap_v1` (localStorage) — mezők: `gyors`, `start`,
`form`, `wc`, `basis`, `magyah`, `scoutReal`, `family`, `rerolls`,
`speed`, `pyrDiv`, `pyrGapT`, `dynLevel`, `diffUi`, `aim`, `autoLevel`,
`tempo`, `tax`, `icons`, `guide`, `skill`.

**A nehézség-nézet és a cél-sáv is benne van:** egyszerű nézetben a
szintkövetés mindig él, ezért a „Kézi” a részletes nézetet kapcsolja be.

## Próba

`tools/gyors-inditas-3-9-209-proba.js` — 22 állítás.
