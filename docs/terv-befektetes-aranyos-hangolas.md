# 🤝 Terv: befektetés-arányos hangolás a közös karrierben

> A fejlesztői beszélgetésből (a társ): „7 egységgel erősebb a csapatom, ami
> azt jelenti, hogy te vagy semmire nem költöttél, vagy olyan dolgokra, ami
> hosszú távon ad előnyt. Most elveszítem az előnyt, amire minden pénzem
> költöttem […] Ez így egy külön hack."
>
> A te válaszod: „…ha meg nem hangolunk, akkor teljesen szétcsúszhat a két
> csapat pár szezon alatt, és a közös továbbjátszás szinte értelmetlenné válik
> […] Azt lehet esetleg vizsgálni, arányosan mennyit invesztált a két játékos
> a csapatába ahhoz, hogy ott járjon, ahol. És ha abból kiderül, hogy az egyik
> teljesen offolt minden költést, akkor kevésbé felemelni őt."
>
> A társ: „Normál esetben, amikor mindenki költ a boostokra vagy új
> játékosokra, akkor jobb hangolni, de ha mondjuk szakemberekre költ, meg
> összhang boostra, akkor az azonnal semmit nem mutat, de hosszabb távon
> beindulhat."

Ez **terv** — a kód nem változott. A döntési pontok a végén.

## 1. Ma így működik (`mpApplyBalance`)

* **Mikor:** idény végén, ha a két keret közti különbség több mint 1. A mérce a
  14 legjobb ratingű játékos átlaga (`mpSquadStrength`).
* **Mit csinál:** mindkét oldal a különbség **felét** lépi a közép felé. Az
  elöl lévő lefelé, a lemaradó felfelé.
* **Kin:** a 11 legnagyobb potenciálú játékoson, névre szólóan, legfeljebb a
  nyers erő ±3%-áig (100-as keretnél ±3). Halmozódik.
* **Mit NEM néz:** hogy ki mit költött, és miért van ott, ahol van.

A két gond:

1. **Az elöl lévőt lehúzza.** Az a fölény is elvész, amit pénzből és döntésből
   épített. Erre jogos a „hack" panasz.
2. **A lemaradót feltétel nélkül felemeli.** Az is felzárkózik, aki a pénzén
   ült, és ez a másik oldalon igazságtalan.

## 2. Az elv

A hangolás a különbségnek csak azt a részét egyenlítse ki, **amit nem a
befektetés magyaráz**. A balszerencse, a gyengébb kezdő keret és a lehúzó
spirál felzárkóztatható. Ami a több és okosabb költésből jön, az maradjon
annál, aki megdolgozott érte.

A mérce a **befektetés aránya**, nem az eredménye. Így a társ ellenvetése is
rendben van: aki stábra vagy összhang-boostra költött, az ugyanúgy
befektetett, akkor is, ha a hatás csak később jön.

## 3. A mérce: befektetési arány (BA)

Idényenként, a főkönyvből (`S.ledger.rows[idény].cats`, a mérő `penz` blokkja
ugyanezt viszi):

```
BA = befektetett kiadás / rendelkezésre álló pénz
rendelkezésre álló = nyitó egyenleg + az idény bevétele
```

**Befektetésnek számít** — teljes értéken, függetlenül attól, mikor térül meg:

| Azonnal hat | Később hat (ugyanúgy beszámít) |
|---|---|
| igazolás (`buy`), boost (`boost`), keretbővítés (`roster`) | stáb (`staff`), scout (`scout`), ügynökség (`agency`), felállás (`tactic`), poszt-betanítás (`poslearn`), mérföldkő-kategória (`msunlock`), megtartási díj (`retain`) |

**Nem számít befektetésnek:**

* a bér (`wage`) — az kötelező, nem döntés;
* a hitel és a kamata;
* a befektetés/hozam páros (`invest`/`investRet`) — az pénzügyi művelet, nem
  a csapat építése;
* az Infinity és az osztályugrás tétje.

A **mozgó átlag** két idényen át számol (az idei súlya 2, a tavalyié 1). Így
egy nagy nyári igazolás vagy egy spóroló félév nem billenti át egymagában.

## 4. A hangolás új szabálya

Legyen **L** az elöl lévő, **H** a lemaradó, **Δ** a különbség (a mai mérce
szerint), és **BA_L**, **BA_H** a két befektetési arány.

1. **A lemaradó felzárkóztatása** a különbség egy része:

   ```
   felzárkózás = Δ × ½ × min(1, BA_H / max(BA_L, BA_padló))
   ```

   * **Ha a lemaradó legalább ugyanannyit fektetett be,** megkapja a mai
     felzárkóztatás teljes részét (Δ felét).
   * **Ha a pénzén ült** (pl. az elöl lévő aránya felét költötte), a
     felzárkóztatás is arányosan kisebb.
   * **A `BA_padló` (pl. 0,15)** megakadályozza, hogy két spóroló játékos közt
     egy apró arány elszálljon.

2. **Az elöl lévő nem veszít.** A mai „lefelé fél lépés" megszűnik. Egyetlen
   kivétel: ha az elöl lévő **lényegesen kevesebbet** fektetett be
   (BA_L < 0,6·BA_H), a különbség nagy része tehát nem a munkájából jön
   (szerencsés draft, korai talizmán). Ilyenkor kaphat egy kisebb, legfeljebb
   ¼ Δ lefelé lépést.

3. **A felzárkóztatás formája.** Két lehetőség, és a döntés a tiéd:

   * **(a) Rating, mint ma:** a 11 legnagyobb potenciálú játékoson, a mostani
     ±3%-os plafonnal. Egyszerű, azonnal hat.
   * **(b) Erőforrás — ezt javaslom:** a felzárkózás meccserő-értékével arányos
     **büdzsé-pótlék** és/vagy **boost-kedvezmény** a következő idényre. A
     lemaradónak így is dolgoznia kell érte: el kell költenie, jól. A
     gyengébbnek több eszköz jár, nem ingyen erő.

## 5. A két gép egyetértése (MP-szinkron)

A mai hangolás azért szimmetrikus, mert mindkét kliens ugyanabból a két
számból dolgozik (a saját és a társ záró ereje). Az új szabályhoz **a
befektetési arány is kell**:

* a szezonzáró csomag (`mpMateFinal().stats`) kap egy `ba` mezőt (a
  két idényes mozgó átlag) és a `baV:1` verziót;
* **ha a társ csomagjában nincs `ba`** (régi kliens), mindkét oldal a mai
  szabályra esik vissza — így a két gép soha nem számol kétféleképp;
* a számítás determinisztikus, véletlent nem használ.

## 6. Kijelzés

A hangolás összefoglalója kimondja a miértet is, pl.:

> „Te 64%-ot fektettél be, a társad 31%-ot — a 6,2-es különbség fele helyett
> csak 1,5-öt hozunk be nála. A te kereted nem változik."

Az Infópult „Szezon és mérleg" fülén ott a két befektetési arány, hogy az idény
közben is látszódjon, hogyan áll.

## 7. Mérés és bevezetés

* A mérő idényenként már most rögzíti a főkönyvet (`penz.ki` kategóriánként),
  tehát a BA a mérési adatokból **visszamenőleg is kiszámolható**. A
  bevezetés előtt a meglévő közös karriereken megnézhető, milyen
  hangolásokat adott volna az új szabály.
* Egy új próba (`tools/mp-hangolas-ba-proba.js`) méri:
  * az azonos befektetésnél a mai felzárkózást;
  * a spóroló lemaradónál a kisebbet;
  * hogy az elöl lévő nem veszít;
  * a régi kliensre visszaesést;
  * hogy a két gép egyezik.

## Döntési pontok

1. **A felzárkóztatás formája:** (a) Rating, mint ma, vagy (b) erőforrás
   (büdzsé-pótlék / boost-kedvezmény)? Én a (b)-t javaslom.
2. **Az elöl lévő:** soha ne veszítsen, vagy a 4/2. pont kivétele maradjon
   (ha lényegesen kevesebbet fektetett be)?
3. **A befektetés listája** (3. fejezet): jó így, vagy kerüljön át valami a
   másik oszlopba (pl. a bér egy része, ha valaki drága sztárokat tart)?
4. **A `BA_padló` és a mozgó átlag** (2:1, két idény): kezdetnek jók így?
