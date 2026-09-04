# 📈 A szezon íve (3.9.37)

Kimondott kérés:

> „szezon végén legyen egy kis infografika ami mutatja hogy az a 3 csapat akik
> top 3ban végeztek, +te, ha nem vagy benne, akkor hogyan alakultatok aktuális
> helyezés szempontjából. hogy változott. menő lenne megnézni pl egy nagy
> comeback szezont, hogy 16. helyről a csapatod mondjuk hogyan mászik fel top
> 3ba vagy ilyesmi"

---

## 1. Az adat már megvolt — csak sosem kértük el

A `buildLeagueTable(upto)` **tetszőleges fordulóra** megadja az állást, és a
saját kommentje mondja ki, miért használható erre:

> „A SORREND KÖTÖTT (1. fordulótól felfelé, körön belül a menetrend
> sorrendjében), mert csak így lesz egy rövidebb szezonrész a hosszabb valódi
> prefixe."

A CPU-k egymás elleni meccseit egy **seedelt** folyam (`rngFor "…:table"`)
szimulálja, ami minden hívásnál ugyanonnan indul. A 7. forduló utáni állás
tehát tényleg a 30. forduló utáni **valódi előzménye** — nem egy másik valóság.

Harminc hívás, és kész a teljes ív. **Új könyvelés sehol nem keletkezik:** a
mentés nem hízik, és a régi mentések is megszólalnak, mert a grafikon a már
meglévő `fixtureResults`-ból és a menetrendből épül.

Az ára **3 ms** (mérve, 16 csapatos mezőnyön) — egyszer, a szezonzáráskor.

## 2. Mit mutat

A végtabella **alatt**, a szezonzáró verdiktben:

| | |
|---|---|
| **vonalak** | a dobogó három csapata + TE, ha nem állsz rajta (3 vagy 4 vonal) |
| **tengelyek** | X: 1–30. forduló · Y: 1. … 16. hely |
| **dobogó-sáv** | halvány arany mező az 1–3. hely magasságában — ez a tét |
| **féltáv** | szaggatott függőleges a 15. fordulónál, hogy a fordulat helye olvasható legyen |
| **pontok a te íveden** | rajt · mélypont · csúcs · vég (a rajthoz/célhoz tapadó jelölés kimarad) |
| **egy mondat** | „A mélypontod a 16. hely volt — ott álltál az 5–15. forduló között. Onnan 12 helyet léptél előre a 4. helyig." |
| **jelmagyarázat** | egyben számtábla: rajt · legjobb · vége csapatonként |

A mondat a valódi ívhez igazodik: **comeback**, **bajnoki menetelés** és
**összeomlás** külön szöveget kap, a névelő pedig a kimondott alakhoz
(`hunAz`: „az 1. hely", de „a 2.").

## 3. Két döntés, ami nem kozmetika

**A végpontot a TÁBLA adja, nem a sorsolás.** A grafikon közvetlenül a
végtabella alatt áll; ha a 30. forduló pontja akár egyszer is mást mondana,
mint a fölötte lévő sor, az ellentmondás volna a képernyőn. Ezért az utolsó
pont mindig a megjelenített végtabellából jön (az a hiteles: közös karrierben
a host számolja, és a mentésben is az él). Egyjátékosban a kettő **betűre
egyezik** — ezt a próba méri —, az anchor csak azt zárja ki, hogy valaha
eltérhessenek.

**A vonalakat nem csak a szín különbözteti meg.** A játéknak van egyszínű
(noir) témája is, ahol a `--gold`, a `--blue` és a `--purple` szinte azonos
szürke. Ezért a vonalvastagság és a szaggatás is hordozza a különbséget — a
te íved mindig a legvastagabb, folytonos, arany. A noir képernyőképen ez
látszik a legjobban: a grafikon ott is olvasható.

## 4. Közös karrierben hallgat

Nem hiányosság, hanem ugyanaz a szabály, ami a **bajnoki hajrá-narratívára**
is áll: közös karrierben a menet közbeni tabella menthetetlenül hiányos — a
társad eredményei csak a **15. és a 30. fordulónál** érkeznek meg —, tehát
fordulónkénti ívet nem lehet belőle rajzolni, csak kitalálni. Két pontból
pedig nem grafikon lesz, hanem félrevezetés.

A panel ilyenkor egy mondattal megmondja, miért néma; a végtabella fölötte
teljes értékű.

## 5. A próba

```bash
node tools/szezon-iv-proba.js
```

Kilenc állítást mér, és képernyőképet készít mindhárom témában:

1. **determinizmus** — `buildLeagueTable(r)` kétszer hívva ugyanaz;
2. **a 30. forduló = a végtabella** (ez az anchor létjogosultsága);
3. minden forduló **szabályos 1..N rangsor** (nincs kimaradó hely);
4. **comeback** (nem vagy dobogón) → 4 vonal · **bajnok** → 3 vonal;
5. a panel kirajzolódik (fő SVG + jelmagyarázat-svg-k);
6. dobogó-sáv és féltáv-jelölés a helyén;
7. közös karrierben **nem rajzol, de megmondja, miért**;
8. a verdikt **tényleg előhívja** (a `finish()` két sora lefut);
9. a **névelő** mindenütt helyes (se „a 1.", se „a(z)").

A szezonok szándékosan kitaláltak: egy valódi 30 fordulós idény lejátszása
percekig tartana, a grafikon viszont tisztán a `fixtureResults`-ból és a
seedelt tabella-folyamból dolgozik — azt kell bizonyítani, hogy **azokat**
helyesen olvassa.
