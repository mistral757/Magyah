# 🔢 Mezszám a mez elején · ✏️ névceruza mindenkinek (1.0.7.5.00)

> „Lehessen beállítani, hogy a játékosok mezének elején is látszódjon a
> mezszámuk, opcionálisan. És azt, hogy hol. A névmódosítós ceruzácska a
> játékosok adatlapján minden játékosnak legyen ott, csak a szutykos stylist
> legyen az, akinek a változtatása globális, html-be épülő. És ne csak a nevét
> lehessen módosítani, hanem a megjelenítési rövid nevet is."

## 🔢 A mezszám a mez elején

- **Hol állítható:** HUB → Csapatépítés → 🛡️ A klub arculata, 6. szakasz,
  „🔢 Mezszám a mez elején is". A lehetőségek:
  - ✕ Nem (ez az alap, a mostani mezek nem változnak);
  - a hét hely egyike, ugyanazok, mint a mezjelé: bal mell, jobb mell, a
    mell közepe, a gallér alatt, has, bal ujj, jobb ujj.
- **Hol hat:** a meccs-animációk **szemből** látszó saját játékosain. A
  pályakép mezein a szám eddig is elöl, középen állt. Hátulról a háton van,
  így elöl nem duplázódik. Az ellenfél figurái nem kapnak számot elöl.
- **Ütközés:** ha a szám a mezjel helyére kerülne, a jel a párjára költözik:
  bal mell ↔ jobb mell, bal ujj ↔ jobb ujj, a többi esetben a bal mellre.
- **Méret:** a szám mérete a helyhez igazodik: a mell közepén és a hason
  nagyobb, az ujjon és a gallér alatt kisebb.
- **Tárolás:** a mentésben (`S.ident.numElol`). Az arculat alaphelyzetbe
  állítása kikapcsolja.

## ✏️ A névceruza

- **Mindenkinek, minden játékosnál** ott van a név mellett az adatlapon, az
  akadémistáknál és a generált neveknél is.
- **Két mező:** teljes név (legfeljebb 40 karakter) és rövid név (legfeljebb
  20 karakter; ez látszik a közvetítésben, a pályaképen és a listákban). Üresen
  hagyva a mező az alapjára áll vissza. A szabály: legalább két karakter,
  benne betű, HTML-jel nélkül.
- **Sima játékos:** a módosítás **csak a saját gépén** él. Ez a meglévő
  névszerkesztő rétege (`harminc_nulla_usernevek_v1`) és az új
  `harminc_nulla_userrovid_v1`. Nem része a mentésnek és a közös világnak.
- **Stylist**, a magyarított névlistán szereplő játékosnál: a teljes és a
  rövid név a **közös listára** megy.
  - A feltöltés `{"f","r"}`.
  - A napi beépítés (`tools/stylist/beepit.js`) a `NEV_ALAP` védett blokkba
    írja, szövegként, vagy `[f,r]` párként, ha rövid név is van. Az `f`
    üres lehet, ha csak a rövid név változott.
  - A listán nem szereplő nevet a stylist is csak helyben írhatja át.
- **A rövid név rétegei** (az első, ami van):
  1. a saját rövid név;
  2. a saját teljes névből képzett alak;
  3. a közös rövid név;
  4. a közös teljes névből képzett alak;
  5. a beépített magyarítás.
- **Javítás közben:** a beépítő a beépített névtáblát mostantól csak a
  `HU_NAME_TABLE` blokkból olvassa. Korábban egy `[f,r]` bejegyzés a második
  futáskor beépített névnek látszott, és törlődött volna.

## Próba

- `tools/mezszam-elol-1-0-7-5-00-proba.js`: alapból nincs szám; bekapcsolva a
  helyén van; ütközéskor a jel átköltözik; az ellenfélen nincs; hátulról nem
  duplázódik; az arculat gombjai működnek; a mentés megtartja.
- `tools/stylist-nev-szinergia-1-0-7-2-00-proba.js` (bővítve):
  - a ceruza mindenkinél ott van, és a saját átnevezés teljes és rövid névvel
    csak helyben hat;
  - a közös rövid név a közös listára megy;
  - a beépítés `[f,r]` bejegyzéssel, másodszori futtatásra változatlanul.
