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
