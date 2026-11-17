# 🧭 1.0.10.3.00 — Gyors játékterv, és a legutóbbi meccs a csúszkák szemével

> **KÉRÉS:** „Szeretném, ha stabil, jól követhető, új játékos számára is
> érthető lenne a játék. […] Légy kreatív, lepj meg, de vigyázz a játékra.”

Mindkét rész a 🎚 Hangsúly-csúszkák panelen él, és egyik sem új mechanika:
az első a meglévő csúszkákat állítja be helyetted, a második a meglévő edzői
elemzés egy számát hozza oda, ahol a döntés születik.

## 🧭 Gyors játékterv — az edző beállítja

**A gond.** Öt kétvégű csúszka, tíz pólus, a haszon és a kár az ismertségtől
és az illeszkedéstől függ, és alacsony ismertségen a legtöbb csúszka „rossz
üzlet”. Aki először nyitja meg a panelt, nem tudja, hol kezdje — és könnyen
ront a csapatán.

**A megoldás.** Három szándék-gomb az Összkép alatt; az edződ a taktika
csúszkáit ehhez állítja be:

| | mit keres |
|---|---|
| ⚔ **Rohamra** | a legtöbb saját gólesélyt |
| 🛡 **Zárjuk le** | a legkevesebb gólesélyt az ellenfélnek |
| 🧠 **Az edző terve** | a legtöbb ⚡ meccserő-egyenértéket összesen |

Utána kiírja, mit tett (`🧠 Gyorsasági Guszti beállította: Mély védekezés
100% · Magas letámadás 100% · …`), az Összkép azonnal mutatja az eredményt,
és egy **↺ Vissza az előző állásra** gomb betűre visszaállít. Ha az adott
ismertségen valami többet ártana, mint használna, **középen hagyja, és
megmondja** — ez egyben tanítja is a rendszert.

**Hogyan választ.** Mérés, nem tábla: csúszkánként végigpróbálja mind a húsz
állást a motor saját szorzóival (`dialOsszNyers`: ugyanaz a `dialEach` /
`dialMatch` / `dialFactor` lánc), miközben a filozófiák csúszkái a helyükön
maradnak; a célt a három állásra súlyozza (döntetlen 40%, vezetés 30%,
hátrány 30%), és a legtöbbet hozó állásokat veszi, amennyi az ismertség
szerinti keretbe belefér. A beállítás a `tdSet`-en megy át — kézzel pontosan
ugyanez elérhető.

**Amit NEM tesz:** nem nyúl a filozófiák hangsúlyaihoz; nem mérlegeli a
mellékhatásokat (lap, sérülés — azokat az Összkép mutatja, a döntés a tiéd);
nem ad semmit, amit kézzel ne lehetne beállítani; aktív taktika nélkül és
60-as ismertség alatt meg sem jelenik.

## 🧾 A legutóbbi meccs a csúszkák szemével

Az Összkép alján egy sor zárja a kört — beállítottad → láttad előre →
lejátszottad → itt áll, mit tettek **valóban**:

`🧾 A legutóbbi meccsen (2:1) a csúszkáid: saját várható gól +0,21 · az
ellenfélé −0,34 → gólkülönbségben +0,55, ≈ +1,5 ⚡.`

A szám az edzői elemzésé (`S.lastMatch.mx.tet`, a „hangsúly-csúszkák”
tényező): a motor a meccs tényleges percein és állásain mért szorzóból
számolja. Eddig is megvolt, de a meccs utáni elemzés egyik lenyitható
fülében, a tíz legnagyobb tényező között — nem ott, ahol a csúszkát húzod.
Párharc után, és ha a csúszkák hatása a tíz legnagyobb tényező közé nem fért
be, a sor nem jelenik meg.

## Kód és próba

`TD_TERV` · `tdTervSzamol` · `tdTervAlkalmaz` · `tdTervVissza` · `tdTervHtml` ·
`dialUtolsoHtml` · CSS: `.tdTerv*`, `.dlOsszUt`.

`node tools/jatekterv-1-0-10-3-00-proba.js` — 14 állítás: a blokk
megjelenése, a három terv iránya, **helyi optimum** (a mozdított csúszkák
egyetlen más állása sem jobb a célra), a keret, a filozófiák és a mentett
forma érintetlensége, az alacsony ismertség, a visszavonás, a legutóbbi meccs
sora. Kép: `docs/kepek/audit-1-0-9-8/jatekterv-utana.png`.
