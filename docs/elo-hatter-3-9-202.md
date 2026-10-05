# 3.9.202 — ✨ Két hasábos kezdőlap és élő háttér (Sötét-arany minta)

> „A fekvő és PC megjelenés elég gagyi a kezdőképernyőn. Mindegyik témánál
> legyen megoldva, hogy telefonon és PC-n is jó legyen az elrendezés fekvő
> módban. Plusz elkezdhetnél kidolgozni egy olyan kapcsolót, amivel mindegyik
> téma megjelenésébe beépül egy csomó plusz elegáns és ízléses animáció.
> Kezdve a kezdőképernyővel, ahol […] a háttérben a témának megfelelő
> vizualitással egy focipálya lenne dőlt szögben felülnézetből, ahol éppen
> valamilyen edzés, bemelegítés, szabadrúgásgyakorlás, vagy ilyesmi zajlik.
> […] És a HUBon belül a Menü mögött pedig lehetne valami ilyen felülnézetes.
> […] kezdheted azzal, hogy csak az egyik basic (nem pixelated) témához
> csinálsz meg mindent példaképpen, azon javítgatunk ha kell, és ha kész,
> akkor apply-oljuk mindegyik másik témára is."

## 1. A kezdőlap két hasábban — mind a négy témában

**Mi volt a baj:** a kezdőlap minden méreten egyetlen 440 px-es hasáb volt.

* **Asztalon** a képernyő kétharmada üresen állt.
* **Fekvő telefonon** a témagombok rácsúsztak a felső feliratra, és a
  karriereid csak görgetés után jöttek.

**Mostantól szélesen** (legalább 960 px széles és fekvő arányú képernyő,
vagy fekvő telefon) két hasáb van:

| bal hasáb (áll) | jobb hasáb (görget) |
|---|---|
| felirat, cím, jelmondat, „Karrier indítása”, „Gyere 1v1!” | a karriereid és a szobáid, „Beállítások és a világ” |

* **A bal hasáb** sticky, függőlegesen középre igazítva.
* **A számlálók** alattuk egy sorban, **a lábléc** a lap teljes szélességében.
* **Fekvő telefonon** sűrűbb betűk és térközök; a témagombok a felirat fölött
  maradnak.
* **Állva semmi nem változott:** ott ugyanúgy egy hasáb van, ugyanabban a
  sorrendben.
* **A témák:** minden szín és betű a téma tokenjeiből jön, tehát a négy téma
  (Sötét-arany, Törtfehér, Noir, Pixel) ugyanazt az elrendezést kapja; a Pixel
  a saját címbetűjével.

## 2. ✨ Az élő háttér kapcsolója

**Hol kapcsolható:**

* **a kezdőlap ✨ gombja** (a témagombok mellett);
* **Beállítások → Színtéma → ✨ Élő háttér.**

**Az alapállás:**

* **BE**, ha még nem döntöttél.
* **KI**, ha a rendszeredben „kevesebb mozgás” van beállítva — de ha ott
  kifejezetten bekapcsolod, BE marad.

**A választás megmarad**, és már az első festésnél érvényes (nincs
villanás).

**Egyelőre a Sötét-arany témában él** — ez a minta, amin javítgatunk.
A többi témában a kapcsoló látszik, és megmondja, hogy ott még készül.

## 3. A kezdőlap jelenete — dőlt felülnézet

**Egy éjszakai, mélyzöld pálya izometrikus szögből**, a mellékelt kép
nézőpontjából: a gólvonal jobbra lefelé fut, a pálya balra lefelé nyúlik.

**A pályán:**

* nyírt sávok és halvány krétavonalak;
* a 16-os a 9,15 m-es ívvel;
* a kapu vékony, sűrű hálóval és a hálótető árnyékával;
* a középkör.

**Rajta négy edzésrész fut egyszerre:**

1. **Szabadrúgás** (8 másodperces kör): sorfal négy emberrel a szabályos
   9,15 méteren, kapus, rúgó.
   * A rúgó nekifut, a labda a sorfal fölött a kapu felé ível, a sorfal
     felugrik, a kapus a lövés oldalára vetődik.
   * Minden harmadik lövést kivédi, a többi a hálóban köt ki.
   * A labda ezután eltűnik, és újra a rúgópontra kerül; a rúgó visszasétál.
2. **Bemelegítő kocogás:** öten egymás nyomában egy téglalapon.
3. **Passzolás:** két játékos lapos passzokkal.
4. **Szlalom:** egy játékos labdával a bóják között, oda-vissza.

**A szereplők:** felálló alakok árnyékkal; futás közben ringanak, és lépnek
a lábaik. A mieink arany mezben vannak, a sorfal szürkében, a kapus
türkizben.

**A nézőablak a képernyőhöz igazodik:**

* **asztalon** a szabadrúgás a két hasáb fölötti sávban zajlik, nem a
  kártyák mögött;
* **állva és fekve** a kapu és a szabadrúgás köré vág.

**A szöveg védelme:** a cím mögött egy lágy sötétítés halványítja a pályát,
a karrier-kártyák pedig enyhén áttetsző üvegek.

## 4. A HUB menüje mögött — felülnézet

**A mellékelt drónfotó hangulata:**

* csíkosra nyírt gyep, középkör és a 16-os íve;
* egy fasor lágy, átlós árnyéka;
* a játékosok **hosszú árnyékkal**.

**Az edzés:**

* **rondó:** öten körben passzolnak, egy kerget középen;
* mellette **az edző**;
* **kocogók** és **hosszú passzok**.

**Hol látszik:**

* **Állva** a ☰ Menü megnyitásakor. A lap háttere ilyenkor átlátszó, a menü
  sorai üvegek, a jelenet a középkörben fut.
* **Fekve és asztalon** a menü végig a bal sávban áll (ott nincs külön
  menü-mód), ezért a jelenet a HUB teljes háttere. Az edzés a két oldalsó
  sávba kerül (jobbra a rondó, balra a kocogók), hogy ne a középső tartalom
  mögött fusson.

**A lépték állandó:** a figurák minden képernyőn ugyanakkorák, alacsony
képernyőn sem zsugorodnak apróra.

## 5. Kíméletes a géppel

* **Képkockaszám:** ~30 képkocka/másodperc, egyetlen ciklus mindkét
  jelenetre.
* **Magától leáll,** ha nem látszik semmi: másik képernyő, háttérbe tett
  fül, kikapcsolt kapcsoló, vagy olyan téma, amelyiknek még nincs jelenete.
  Ilyenkor másodpercenként egyszer ránéz, hogy kell-e újra indulnia.

## 6. A többi témára — a következő lépés

**A rajz és a mozgás közös, a téma csak a festéket adja:** minden szín
CSS-változó (`--fxGrass`, `--fxStripe`, `--fxLine`, `--fxUs`, `--fxThem`,
`--fxGk` …). Egy új téma bekapcsolása:

1. egy változó-blokk a témának;
2. a téma azonosítója a `FX_THEMES` listába.

Ha a Sötét-arany minta rendben van, ez megy a Törtfehérre, a Noirra és a
Pixelre (ott lépcsős, pixeles mozgással).

## Próba

```bash
node tools/elo-hatter-3-9-202-proba.js
```

A próba **20 állítást** ellenőriz: az elrendezést 4 témában és 3 méretben,
a kapcsolót, a „kevesebb mozgás” beállítást, hogy a jelenet mozog-e, a
szabadrúgás ívét, a témaváltást és a HUB-menüt.
