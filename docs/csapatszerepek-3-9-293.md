# 🎽 Csapatszerepek és a taktika csúszkái (3.9.293)

## A kérés röviden

* **Új menüpont a Csapatépítésben.** Minden csapatszerep egy helyen: a
  csapatstílus szerepei és négy új általános szerep.
  * **Szabadrúgás-lövő:** a gólszerzés és a passz átlaga; a
    Szabadrúgás-mester ×1,5.
  * **Szöglet-rúgó:** a passz; A tökéletes beadás ×1,5.
  * **Tizenegyes-rúgó:** a gólszerzés; COOL ×1,25, ICE COLD ×1,5.
  * **Bedobó:** a védekezés és a passz átlaga; a Nagylabda ×1,5.
    * Az ellenfél gólesélye 1–5%-kal csökken.
    * A bedobó maga +1–3% gólpassz-esélyt kap a Nagylabdán felül.
    * Animáció is jár hozzá.
* **A meccsmotorban is hassanak.** A csillagozott képességek tovább
  növeljék a szorzókat.
* **Saját menüpont a hangsúly-csúszkáknak** a Taktika alatt.
* **5 általános csúszka minden taktikához.** Hogy hányat lehet használni,
  az ismertségtől függ: 60 → 1, 150 → 5. A hatás mértéke is az
  ismertségtől függ, és a taktika-illeszkedés szoroz rá.

## 1. Az általános szerepek (`GEN_ROLES`)

**Hol:** HUB → Csapatépítés → 🎽 Csapatszerepek.

**Alkalmasság:** a gazda-képesség(ek) átlaga × a skill-szorzó.

* A szorzó bónusz-része a skill készültségével arányos. Egy félkész
  Szabadrúgás-mester ×1,25-öt ad.
* Csillagonként a bónusz-rész +20%-kal nő: három csillaggal a ×1,5-ből
  ×1,8 lesz.
* Több skill közül a legnagyobb szorzó számít (COOL és ICE COLD esetén az
  ICE COLD).

**Minőség (q):** 70-es alkalmasság alatt 0, 250-nél 1 (3.9.294 óta; előtte 55–125). A skála lineáris: 160-nál 50%.

**Kijelölés** (szerepenként):

| állás | mi történik |
|---|---|
| nincs (alap) | a motor a régi módon sorsol, a futó karrierek balansza nem mozdul |
| automatikus | a pályán lévő legalkalmasabb rúg (kapus csak bedobó lehet) |
| név | ő rúg; ha nincs a pályán (sérült, lecserélték, kiállították), a legalkalmasabb veszi át |

**A motorban:**

| szerep | hatás |
|---|---|
| tizenegyes | a kijelölt rúgja; értékesítés 74% + 14% × q (a COOL / ICE COLD saját aránya, ha nagyobb) |
| szabadrúgás | a kijelölt rúgja; gól 28% + 17% × q (a régi fix 35% helyett); a szabadrúgás-helyzet súlya × (0,85 + 0,3 × q) |
| szöglet | a pontrúgásgólok aránya × (0,85 + 0,35 × q); a szögletgól gólpasszát (50 + 40 × q)% eséllyel ő adja; a szöglet-sorban ő áll |
| bedobás | az ellenfél gólesélye −(1 + 4 × q)% a pillanatképben, tehát a párharcban is; a gólpasszt +(1 + 2 × q)% eséllyel ő adja; a pontrúgás-helyzetek 30%-a hosszú bedobás lesz |

A bedobás-gólpasszt a közvetítés kimondja, és új animáció jár hozzá
(`EVA_SABLON.bedobas`). Kapu-nézetben látszik:

* a bedobó az oldalvonalon hátrahajol, és a tizenhatosba hajítja a labdát;
* a társ a védő fölött kapu felé csúsztat.

**A stílus szerepei:** ugyanitt, mindkét filozófiáé (a meglévő kiosztóval).

## 2. A hangsúly-csúszkák alpontja

**Hol:** HUB → Csapatépítés → ⚙️ Taktika → 🎚 Hangsúly-csúszkák.

Két rész van rajta:

* az aktív taktika öt csúszkája;
* a csapatstílus hangsúlyai, mindkét filozófiáé, a saját hármas keretével.

## 3. A taktika csúszkái (`TACTIC_DIALS`)

Az öt kétvégű csúszka:

| csúszka | ◀ pólus | pólus ▶ |
|---|---|---|
| Védővonal | Mély védekezés | Magas védővonal |
| Tempó | Türelmes építkezés | Gyors átmenetek |
| Szélesség | Középen át | Szélekről |
| Letámadás | Visszaállás | Magas letámadás |
| Mentalitás | Eredmény megőrzése | Mindent bele |

**Működés:** ugyanaz a motor, mint a stílus-csúszkáké.

* Középen ki vannak kapcsolva, 10%-os lépésekben állíthatók.
* A kár 1,25-ös kitevővel nő a csúszka állásával.
* Ugyanazokra a csatornákra hatnak (own, opp, goalw, assistw, setpiece,
  counter, card, inj).

**Hány mozdítható:**

| ismertség | 60 | 82,5 | 105 | 127,5 | 150 |
|---|---:|---:|---:|---:|---:|
| csúszka | 1 | 2 | 3 | 4 | 5 |

**Mekkora a hatás:** az ismertség 60→150 a stílus-szint 1→20 skáláján fut.

| | 60-as ismertség | 150-es ismertség |
|---|---:|---:|
| haszon (teljesen kihúzva) | +2,5% | +20,6% |
| kár (teljesen kihúzva) | −6% | −5% |

A kár közben, a skála közepén 11,2%-on tetőzik.

**Illeszkedés-szorzó:** f = 0,5 + illeszkedés, 0,6 és 1,6 közé vágva.

* A haszon × f, a kár ÷ f.
* 50%-os illeszkedésnél semleges.

**Tárolás:** minden taktikának saját állása van (`S.tactics.dials[taktika]`),
és mindig az aktívé hat.

## Próba

`tools/csapatszerepek-3-9-293-proba.js [kép-mappa]`
