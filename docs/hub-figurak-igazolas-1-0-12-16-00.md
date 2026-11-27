# 1.0.12.16.00 — HUB-figurák: ritkábban, kukucskálva, szundival · játékos a töltőn · az igazolás-jelenet glitche

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy4573jh1ss)
> „Túl sok a kis besétáló játékosok animáció a HUBban. Túl gyakori. Legyen randomabb. Ne mindig 5mp időközönként
> jöjjön. Hanem 7-11 mp, és legyen olyan animáció is, ami csak egy oldalról vagy felülről benézés, mint a régi
> Windows xp varázsló. És legyen az, hogy minden 3. ilyen animációnál az egyik játékos úgy jöjjön be, hogy csak
> bejön és megkérdezi, hogy: "Mester, szólj, ha idegesítünk, és akkor lelépünk egy időre!" Vagy: "Mester, minden
> oké? Ha egy kis magányra vágysz, csak egy szabadba kerül!" És ha erre rákattintasz, akkor be lehet állítani ott
> rögtön hogy mennyi szundi idő legyen ezeknek az animációknak. Ja és a pillanat... Átvezető kijelzőn ezentúl nem
> a kis pixel figura legyen hanem valamelyik játékosunk dekázzon azon mindig."

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy3zuxxc79j)
> „Nagyon menő a legendás igazolás képernyő, de glitchel sajnos. Ezt meg kell javítani, mert amúgy nagyon menő.
> Ez a Style minden igazolásnál legyen ott."

## Mi változott

### Tétlen HUB-figurák (`oe*`)
- **Ritkább, véletlen ütem:** 10 mp tétlenség után indul, a jelenetek között 7–11 mp véletlen szünet (`oeGap`).
- **Kukucskálás (`oeKukucs`), a jelenetek ~30%-a:**
  - **felülről:** a játékos fejjel lefelé lóg be a képernyő tetején, a buborék alatta (`oeFent`, `oeBubLent`);
  - **oldalról:** balról vagy jobbról, megdőlve hajol be.

  Rövid beszólás, aztán visszahúzódik.
- **Minden 3. jelenet a kérdező játékos (`oeKerdes`):**
  - bejön középre, és megkérdezi a két mondat egyikét (a „szabadba” → „szavadba” javítással), a buborékban a „👆 koppints rám…” tipp;
  - rákoppintva a **szundi-választó** (`#oeSzundi`) nyílik: 5 / 15 / 30 perc, 1 óra, „a mai játék végéig”, „kikapcsolom”, vagy „Maradjanak, jó így! 👍”;
  - a választás a naplóba is kerül;
  - a szundi addig tartja távol a figurákat (`oeSzundiz`, localStorage `magyah_oeSzundi30_0`). A „mai játék végéig” a munkamenetre szól, a „kikapcsolom” az eddigi kapcsolót (🛡️ A klub arculata → Animációk) viszi ki.

### „Pillanat…” töltő
- A pixel kisfiú helyett a keret egy véletlen játékosa dekázik (meccsfigura, labda, alatta a neve).
- Karrieren kívül, ahol nincs keret, marad a kisfiú.

### Igazolás-jelenet glitche
**Az ok:**
- A jelenetre koppintva (átugrás) az `ijKesz` osztály MINDEN animációt 0,01 mp-esre állított.
- Ez a végtelen ismétlésű sugárkoszorút és a szikrákat is érintette, így azok másodpercenként tucatszor villództak.

**A javítás:**
- Átugráskor csak a belépő elemek (alak, kártya, fejléc, alsó sáv) ugranak a végállapotba.
- A teaser-kártyák eltűnnek.
- A sugár 18 mp-es forgással, a szikrák a saját tempójukkal mennek tovább.
- A háttérköd `filter:blur(18px)` helyett lágy színátmenet (gyenge telefonon a blur is akadt), a forgó rétegeken `will-change`.

**Minden igazolásnál ott van:** a jelenet már eddig is minden igazolásnál futott (`markArrived` → `igazJelenetSorba`): piac, scout, ingyenes, láda, kihívás-jutalom. Kivétel az ifjúsági akadémiáról felhozott játékos, mert az nem igazolás.

## Próba
`tools/oe-szundi-tolto-1-0-12-16-00-proba.js`:
1. a szünet 7–11 mp;
2. a sorrend J J K J J K…;
3. a kukucskálás felülről és oldalról;
4. kérdés → választó → 15 perc szundi alatt nincs jelenet, a „kikapcsolom” a kapcsolót viszi;
5. a töltőn a mi játékosunk;
6. az átugrás után a sugár 18 s-os és a szikrák 3 s-os ütemmel futnak;
7. nincs oldalhiba.

Lefutott még: `figura-jelenet-1-0-12-8-00`, `kihivas-lada-igazolas-1-0-12-14-00`, `lecke-vegig-1-0-12-15-00`, `tolto-1-0-7-4-00`, `csere-tolto-1-0-9-0-02`.

---

# 1.0.12.16.01 — A távoli lövés 3D-ben: igazi bombagól messziről

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy4qba47ws4)
> „Szitálós gólnál mikor megkapja a játékos a labdát, utána tol egyet rajta úgy, gjgy gyakorlatilag beletolja a
> védőbe. És tök közel is kerül így a kapuhoz. Menőbb lenne, ha távol maradna a kaputól, és onnan messziről egy
> enyhe labdaigazítás után lőné rá, és igazi távoli bombagól lenne belőle."

## Az ok
A 3D kimenetel (`kamKimenetel`) minden 36 m-nél hátrébb végződő felvezetésnél „rátört a kapura”:
- a lövő 15 m-t vitte előre a labdát, x≈41-ig, vagyis 11 m-re a kaputól;
- a védő (v1) közben elé lépett, így a lövő gyakorlatilag beletolta a labdát (0,97 m-re került tőle).

A kontránál és a vágtánál ez jó, a távoli lövésnél nem.

## A javítás
A „tavoli” felvezetésnél (Szitálós, Ágyúgolyó, potyagól, a sima távoli lövés) a lövő nem tör be. Helyette:
1. egy rövid, ~1,5 m-es igazítás oldalra, a védőtől el;
2. a védő későn lép oda, és nem éri el;
3. a lövés ~25 m-ről jön.

A kimenetel ugyanaz marad: gól, védés, kapufa, mellé.

## Próba
`tools/tavoli-bomba-1-0-12-16-01-proba.js`, 36 eset.

| | Régi kód | Új kód |
|---|---|---|
| lövés a gólvonaltól | 11,3 m | 25 m |
| mozgás a lövésig | 15 m | 2 m |
| lövő–védő minimum | 0,97 m | 3,6 m |

Ezek is maradtak:
- a kimenetel és az idővonal;
- a nem távoli felvezetés továbbra is betör.

Lefutott még: `jelenet3d-1-0-11-14-00`, `felvezetok-1-0-11-13-00`, `szinergia-3d-1-0-12-13-00`, `egyensuly-3d-1-0-12-12-00`.

---

# 1.0.12.16.02 — Szitálós egy kamerából · vissza a menübe · korai stílus-lecke

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwyl7uwa5ajb)
> „Nem igazán lehetett látni a szitálós gól animációját. Túl gyors volt és valahogy a kamera pont lövés közben
> váltott és így gyakorlatilag pont maga a szitálás nem látszott. Legyen rögzített ennél a gól fajtánál, hogy vagy
> a kapu mögül, vagy a játékos mögül látszik a gól végig, 1 kameraállásból, hogy jól látszódjon a szitálás."

**Mit változtattam (a `kamKimenetel` Szitálós-ágában, `F.skill.fx==="lebeg"`):**
- **Egy kamera:** a labda átvételétől a végéig egyetlen vágás szól. Ez a lövő mögötti, kissé oldalt álló, rögzített kamera (`{fix:true,d:[-1,±0,55,0,32]}`).
- **Nem úszik, nem követ:** a kivágás az első képkockán dől el (lövő + kapus), utána nem változik.
- **A lövő a kép szélén van:** így nem takarja el a labda útját.
- **Lassabb repülés:** a kimenetel +1,1 mp hosszabb, a repülés 0,3 mp-ről kb. 1,1 mp-re nő.
- **Erősebb tánc:** a labda oldalra ±0,9 m-t, fel-le 0,45 m-t mozog.
- **A többi skill változatlan.**

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwy8icxp8q2v)
> „Átigazolási esemény animáció és kipörgetés után nem a menübe kerülünk vissza, hanem a HUBba. Nagyon babra így...
> Ennél is ugyanoda kell visszakerülünk, ahol előtte voltunk. Átigazolás fül lenyitva, Menü"

**Megjegyzés (eltérés):** a próbában a sima, az álomigazolásos és az ikonos kimenetel a régi kóddal is a menübe tért vissza, nyitott füllel. A HUB-ra dobást két dolog okozhatta:
- egy, a visszatéréskor felugró, HUB-ra horgonyzó tipp (`guideShowNext`), amely bezárta a menüt;
- a menü-állapot elvesztése, amíg a folyamat a menün kívüli képernyőn járt (beillesztés, igazolás-jelenet).

**A javítás mindkettőt lefedi:**
- **Induláskor:** a menüből indított átigazolási folyamat (esemény, vásárlás) feljegyzi a menü-állapotot (`TW.menuBol`: nyitott fülek, görgetés).
- **Bármelyik kijáratnál** (`twNextCycleOrFinish`, `csReturnToHub`): a `twMenuVissza` a menübe visz, nyitott füllel, ugyanoda.
- **Közben:** a `hubMenuOutsidePage` a futó folyamatot is a menü aloldalának tekinti, így a menü-állapot nem vész el.
- **A tipp:** a visszatérés utáni 8 mp-ben a HUB-ra horgonyzó tipp félreáll (`_guideHalasztott`), és a menüből kilépve jön elő.

## KIMONDOTT KÉRÉS (🐞 jegyzet jmwz1nhpk6unb)
> „Nincs tanítás arra, hogy mi van akkor, ha beköszönt a mennydörgés vagy a panzer idő előtt. (Amikor ez a két
> stílus első szezon vége előtt kap egy lehetőséget elindulni)"

**Új Kezdő út lecke: `korai` („Korai csapatstílus — nulladik szint”).** A felugró ajánlat-ablakon fut, négy lépésben:
1. **Mi történik most?** A szokásos választás az idény végén van, ez két stílus kivétele. Itt a feltételeik is: a Mennydörgéshez 4 játékos 95+ vagy 2 játékos 99-es Sebességgel; a Panzerhez 12 negatív jellemvonás a kezdő keretben, az első meccs előtt.
2. **Mit kapsz?** Nulladik szint: a pontok már gyűlnek, és egyetlen képesség él.
3. **Mi az ára?** A döntés végleges.
4. **Mit érdemes?** Mikor mondj igent, és mikor „Most nem”. Utóbbinál meddig él még az ajánlat, és hol találod (☰ Menü → 🎯 Csapatstílus).

**Mikor indul:**
- a Kezdő úton magától, amikor az ajánlat felugrik;
- a stíluspanel ajánlat-kártyájának „📖 Mi ez?” gombjáról;
- a Leckék listából, amíg az ajánlat él.

**A döntés a tiéd marad:** a lecke után az ablak nyitva marad.

## Próba
`tools/szitalos-menu-korai-1-0-12-16-02-proba.js`:
1. **Szitálós:** egy rögzített kamera, 1,13 mp repülés; az Ágyúgolyónál két felvétel marad.
2. **Menü-visszatérés:** sima, álomigazolás és ikon után a menübe kerülsz, nyitott füllel, ugyanoda.
3. **Félretett tipp:** a visszatérés utáni tipp vár, és a menüből kilépve jön elő.
4. **Korai lecke:** 4 lépés az ablakon, utána az ablak nyitva marad; a „Mi ez?” gomb ott van.
5. **Oldalhiba:** nincs.

**Lefutott még:**
- `tavoli-bomba-1-0-12-16-01`, `felvezetok-1-0-11-13-00`, `lecke-vegig-1-0-12-15-00` (az új leckével együtt minden lecke végigmegy);
- `kihivas-lada-igazolas-1-0-12-14-00`, `oe-szundi-tolto-1-0-12-16-00`;
- `menu-ablak-1-0-12-7-00`, `menu-csukva-1-0-9-1-03`, `menupont-jelenetek-1-0-12-11-00`, `fekvo-menu-tartalom-3-9-345`;
- `jelenet3d-1-0-11-14-00`: a 3. pontja (vászon-képpontszámlálás) egyszer elbukott, két újrafuttatásra átment. Időzítésfüggő.
