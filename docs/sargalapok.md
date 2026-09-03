# Sárga lapok (3.9.32)

Kimondott kérés:

> „legyenek ezentúl sárgalapok is a meccseken, amikből 3-at ha összegyűjt
> meccsek között egy játékos, akkor jön az eltiltás. kupasorozatban 2 után
> eltiltás. 1 meccsen 2 után kiállítás, és eltiltás. / legyenek jó kis
> kommentátor szövegek: gólöröm közben leveszi a mezét a támadó (nagyon kicsi
> esély, de magas tét, vagy magas izgalom esetén 85+ percben legyen rá 25%
> esély, alap járaton 1% körül esély a sárgalapok között), kezezés, durva
> belépő, reklamálás (ez legyen érzékeny a bajkeverő és öntörvényű típusokra),
> műesés stb."

---

## 1. A három szabály

| eset | következmény |
|---|---|
| 3 sárga a **bajnokságban** | 1 mérkőzés eltiltás, a számláló nullázódik |
| 2 sárga a **kupasorozatban** | 1 mérkőzés eltiltás, a kupa-számláló nullázódik |
| 2 sárga **egy mérkőzésen** | azonnali kiállítás + 1 mérkőzés eltiltás |

`YELLOW_LIMIT_LEAGUE = 3` · `YELLOW_LIMIT_CUP = 2`

**A két számláló külön él** (`S.yellows` és `S.cupYellows`), mert két külön
szabály szól rájuk, és a valóságban sem közösek: egy kupában kapott lap nem visz
közelebb a bajnoki eltiltáshoz.

**Aki két sárgáért ment le, annak a lapjai nem gyűlnek tovább** — a piros lap
elhasználta őket. A statisztikába (`S.careerStats[n].yc`, `S.seasonYellows`)
viszont bekerülnek: megtörténtek.

**Mikor törlődik a számláló:** az eltiltás kiszabásakor (leülte), a bajnoki
idény fordulóján, és a kupa-számláló minden új sorozat indulásakor.

---

## 2. A gyakoriság

`YELLOW_PER_MATCH = 1.2` — csapatonként ennyi lap várható egy mérkőzésen.

Ez nem önkényes szám. A súlyozás után egy átlagos fegyelmű játékos ~0,11 lapot
kap meccsenként (1,2 elosztva tizenegy emberrel), vagyis a harmadik lapja a 27.
forduló környékére esik. Egy **lobbanékony** viszont a súlyával arányosan
többet: ~0,26 lapot, azaz nagyjából tizenegy meccsenként eltiltást. Pont ennyi
kell ahhoz, hogy a temperamentumnak **ára** legyen a pályán, és ne csak egy
szám maradjon a keretlapon.

**MÉRVE, három végigjátszott idényen** (`tools/sargalap-proba.js`, a játék saját
„Szezon végigjátszása" gombjával):

| | 1. minta | 2. minta | 3. minta | együtt |
|---|---|---|---|---|
| forduló | 27 | 26 | 30 | 83 |
| sárga lap | 42 | 32 | 31 | 105 |
| **lap / meccs** | 1,56 | 1,23 | 1,03 | **1,27** |
| eltiltás 3 lapért | 9 | 6 | 5 | **20** |
| két sárgából kiállítás | 1 | 1 | 2 | 4 |
| közvetlen piros | 3 | 1 | 2 | 6 |
| mezlevétel gólöröm közben | 1 | 3 | — | 4+ |

A mért 1,27 gyakorlatilag a beállított 1,20 (+6%), és a különbözetet a rangadók
×1,35-e adja (idényenként nyolc-tíz mérkőzés). A minták szórása jóval nagyobb
ennél — 1,56 · 1,23 · 1,03 —, tehát hangolni nem kellett.

**A KÖVETKEZMÉNY NAGYOBB, MINT AMIT ELSŐRE LEÍRTAM.** Az első változatban
„egy-két eltiltás idényenként" állt itt; a mérés **idényenként öt-kilencet**
mutat (átlagosan minden negyedik fordulóra egyet), ami a lapszámból három
laponként aritmetikailag adódik is. Ez körülbelül
minden harmadik-negyedik fordulóra jut egy hiányzó — összemérhető a valódi
bajnokságokkal (ott ~2 lap/csapat/meccs, öt lapos küszöb, idényenként 12-15
eltiltás), de a 3-as küszöb szigorúbb annál. Egyetlen szám (`YELLOW_PER_MATCH`)
hangolja, ha soknak bizonyul.

A súlyok a piroslapénál **laposabbak** — `[0,35 · 0,6 · 1 · 1,7 · 2,4]` a
`[0,2 · 0,5 · 1 · 2 · 3]` helyett. Piros lapot szinte csak a lobbanékony kap;
sárgát mindenki. A temperamentum a *gyakoriságot* tolja el, nem a lehetőséget.

Ugyanazok a szorzók hatnak rá, mint a piros lapra: a fegyelem-képességek
(`discipline`), a szerep-kockázat, a csapatstílus, a felkészülési kupa fele
esélye és a globális kártya-csúszka. Rangadón ×1,35.

**Párharcban nincs sárga lap.** Ugyanaz az elv, mint a tizenegyesnél, a
supersubnál és a piros lapnál: a párharc eredményét a **közös eseménylista**
adja, egy helyben sorsolt lap viszont a két kliensen mást hozna ki — a második
sárgából született kiállítás pedig már az állást is szétvinné.

---

## 3. A lap oka nem dísz

A `yellowReasonFor` súlyai összege ~100, tehát az egyes tételek nagyjából
százalékként olvashatók.

| ok | alapsúly | módosító |
|---|---|---|
| durva belépő | 34 | ×1,5 lobbanékonynál (aggroI ≥ 3) |
| taktikai lerántás | 18 | — |
| kezezés | 13 | — |
| **reklamálás** | 12 | **×4 bajkeverőnél/öntörvényűnél (coopI ≤ 1)**, ×0,5 népszerűnél/imádottnál |
| műesés | 9 | — |
| szóváltás | 8 | ×2,5 lobbanékonynál, ×1,6 bajkeverőnél |
| időhúzás | 5 | **csak a 75. perctől és csak vezetésnél**, különben 0 |
| mezlevétel | 1 | **csak annak, aki ezen a meccsen gólt szerzett**, különben 0 |

**MÉRVE** (20 000 dobás személyiségenként, `tools/sargalap-proba.js`):

| személyiség | reklamálás aránya |
|---|---|
| Bajkeverő (coopI 0) | **35,6%** |
| Szimpatikus (coopI 3) | 12,8% |
| Imádott (coopI 5) | 7,2% |

A mezlevétel gólszerzőnél **1,05%**, gól nélkül **0%**. Az időhúzás a hajrában,
vezetve 5,13%, a 40. percben **0%**.

---

## 4. A gólöröm — a 25%-os hajrá-kivétel

A hétköznapi mezlevétel a fenti pool ~1%-a. A kérés viszont külön kimondta a
hajrát, és ez saját szabályt kapott (`mezLeveszes`):

* a **85. perctől**,
* ha **magas a tét** — párharc, rangadó, kupameccs vagy bajnoki tétmérkőzés —,
* **vagy magas az izgalom** — legfeljebb egygólos a különbség, vagy kétgólos
  hátrányból jöttünk vissza, vagy már öt gól esett,
* akkor a gólszerző **25%-kal** lekapja magáról a mezt, és sárgát kap érte.

Az „izgalom" itt **élő közelítés**: a rendes `matchExcitement` mutató csak a
lefújás után áll össze, menet közben nincs mihez nyúlni. A három feltétel
pontosan azt fogja meg, amitől egy meccs a hajrában feszült.

És ha ez a második lapja, ugyanúgy mehet le — ez a szabály, és pont ettől van
tétje.

---

## 5. Hol látszik

* **A közvetítésben**: minden lap saját szöveget kap (2-3 változat okonként,
  ismétlés-szűrővel).
* **Az eredményjelzőn**: 🟨 ikon, borostyán színnel.
* **A HUB keretlistájában**: aki egyetlen lapra van az eltiltástól, külön sort
  kap — „🟨 2/3 sárga lap — a következő lapja eltiltás". A jelzés a
  sorozathoz méri magát (kupában 1/2-nél szólal meg).
* **A játékos lapján**: „Sárga lap" cella, karrier- és idény-oszloppal.

---

## 6. Az érintett állapot

```
S.yellows[név]        — a bajnoki gyűjtés (eltiltásnál nullázódik)
S.cupYellows[név]     — a kupasorozat gyűjtése (sorozatonként újraindul)
S.seasonYellows[név]  — KIJELZÉS: idényenkénti lapszám (mint a playerReds)
S.careerStats[név].yc — karrier-összeg
```

Mindegyik **a mentés része**. Egy eltiltás felé gyűlő két lap nem futásidejű
pillanat: ha egy újratöltés elvinné, a szabálynak nem volna tétje.

Régi mentésben egyik sincs — üresen indulnak, és ez a helyes: senkit nem
büntethetünk visszamenőleg olyan lapokért, amiket a játék akkor még nem adott.
