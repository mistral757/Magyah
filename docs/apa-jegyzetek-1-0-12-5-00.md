# 🧭 Kezdő út: a második játékos jegyzetei — 1.0.12.5.00

A fejlesztő édesapja végigjátszotta az első idényt (telefon, 375×834, a 8.1-es fokozat, Kezdő út), és kilenc jegyzetet (🐞) írt közben. A jegyzeteket a fejlesztő egyenként döntötte el. Ez a verzió a döntéseit hajtja végre.

| # | Jegyzet | Döntés | Mi lett |
|---|---|---|---|
| 1 | jmwvdsms6gg1j: „…a boostok még nem voltak. Úgy érzem nincs eszközöm erősíteni a csapatot […] nehézben indultam” | „Jó lesz úgy, ahogy javaslom” | Az 5. (Nehéz) fokozattól a Kezdő út a ⚡ Boost-központot már „Az első meccsek” szakasz végén kinyitja, nem a „Mérleg” végén. A kezdő indító 7+ fokozatnál feldobott figyelmeztetése ezt is elmondja. |
| 2 | jmwvdp5by59nn: „Túl hamar van lecke a klub filozófiájának választásáról” | „Csak a liga végén jöjjön, a nyár kezdetén, amikor feloldódik a csapatstílus választás” | „A klub filozófiája” szakasz nyárig vár. A kártya csak jelzi („— nyáron”), nincs feladat, „Hol?” vagy lecke. A jelek sem számítanak. Ha a csapatstílus választható (az 1. idény lezárása után), a szakasz elindul. |
| 3 | jmwvdlvpn27cm: „Amikor új kapitányt választok, kidob onnan, nem látom, hogy akkor az új jobb-e mint a régi” | „Javítsd” | A kapitányválasztó nyitva marad. A tetején a régi és az új kapitány összevetése látszik: meccserő-hatás, kezdő morál, és hogy jobb, gyengébb vagy egyforma. Van „↩ Mégis a régi” gomb, a „✓ Kész” zár. |
| 4 | jmwvdf35fe6q1: „Ajánlotta a saját felállást mivel elérhető áron van, viszont ez egy kezdőknek szerintem fölösleges” | „Javítsd” | A Kezdő út alatt a felállás-bolt és a saját felállás nem jelentkezik „Elérhető áron” értesítéssel. |
| 5 | jmwvd78pbkbqy: „Hangsúly csúszkát már ez előtt tudtam állítani” | „A taktikán belül is van út a csúszkákhoz. Ezt vegyük ki” | A taktika-panel „🎚 Hangsúly-csúszkák” kártyája kikerült. A csúszkák egyetlen útja a menü saját pontja, amit a Kezdő út a maga szakaszában nyit. |
| 6 | jmwvcw8mg6trr: „Nem jöttek kihívások az elején…” | „Lehet kihívás, de legyen hozzá lecke” | A 📋 Menedzsment és a kihívás-ajánlatok az elejétől nyitva vannak, futó Kezdő úton is. Az első ajánlatnál vezetett lecke indul (lásd lent). |
| 7 | jmwvc7by7j7b1: „Nem villog egyik középpályás sem” (a „Hol?” a megbízásnál) | „Javítsd” | Saját, vezetett „Hol?” lecke (lásd lent). |
| 8 | jmwvbypb4enyx: „8.1 nehézséget választottam induláskor, most mégis 6.3 lett” | „Járj utána” | Kivizsgálva, a kód nem változott (lásd lent). |
| 9 | jmwvbxgkncrs0: „Mielőtt a pályára lépnél tipp: azt mondja, hogy be tudom állítani az erősségét…” | „Javítsd” | A ligapiramisban a tipp a karrier indításakor választott fokozatról, a 🎚 sávról és a nyári célrés-hangolásról szól. A régi szöveg (nehézség + auto szintkövetés) csak a dinamikus módé maradt. |

## A 6. pont: a kihívás-lecke
A lecke az első kihívás-ajánlatnál indul (`KUT_LECKE.kihivas`). Öt lépése:
1. Mi ez: vállalás, jutalom és büntetés.
2. Hogyan olvasd a kártyát: nehézség, cél, 🏆, ⚠, 📋 szabály, egy élő példával.
3. Mikor érdemes vállalni.
4. Döntés: a „Kész — tovább” gomb.
5. Hol követed a vállalást.

A leckét a ☰ Menü → 🧭 Vezetés alatt újra lehet nézni.

## A 7. pont: a „Hol?” lecke a megbízásnál
Eddig az egész keretlista villogott, és bármelyik adatlap megnyitása lezárta a leckét. Most három lépésben vezet:
1. A villogó középpályás sora a keretlistán (a játék saját megbízás-példája).
2. Az adatlapján a 🧭 Megbízás módosítása gomb.
3. A javasolt megbízás.

Ha más játékos lapja nyílt meg, a lecke kéri, hogy zárd be.

## A 8. pont kivizsgálása: miért lett a 8.1-ből 6.3?
A fokozat-csomag (3.9.223) nem csak célrés. Mellette a mezőny tempója, a négy tempó-tengely, az ikon-igazolások, a képesség-mód, a scout, a holtsáv és a téli felmérés is a csomag része.

Egy első karrierben ezek közül több még zárva van (Run-kapuk), például:
- a „Lépést tartanak” mezőny-tempót a 2. lezárt karrier nyitja;
- a lassabb tempó-fokozatok, a ritkább ikonok és a realisztikus képességek szintén zárva vannak.

A zárt elemek helyére a beállító a legközelebbi nyitottat teszi (`nfCsomagHatasos`). A HUB viszont a ténylegesen futó beállításból számolt **hivatalos szintet** írja ki (`nfHivatalos`). Mérés egy friss első karrierben:

| Választott | Hivatalos (első karrierben) | Ami helyettesítve lett |
|---|---|---|
| 5.1 | 5.1 | tempó, mezőny, képesség |
| 7.1 | 5.4 | + ikonok |
| 8.1 | 6.2 (a holtsávval és a téllel 6.3) | mezőny (Lépést tartanak → Lassan zárkóznak), 4 tempó-tengely (Gleccser → Normál), ikonok (Nagyon ritkán → Megszokott), képesség (Realisztikus → Laza) |

A választott célrés (a 8.1-é) megmarad. A többi elem még nem állítható ilyen nehézre, ezért a hivatalos szint 6.3. A választóban ez csak egy „🔒 még zárt, helyette: …” sorként látszik; azt, hogy ettől a szint is lejjebb kerül, sehol nem mondja ki. A kód ebben a verzióban nem változott. A lehetséges utakat a felhasználó elé terjesztettük.

## Próba
`tools/apa-jegyzetek-1-0-12-5-00-proba.js`: 15 ellenőrzés, mind a kilenc pont és az oldalhiba.
