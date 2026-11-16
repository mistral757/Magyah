# 🎨 1.0.9.8.00 — Pixeles gólöröm-futás (az első Blender-elem)

## A döntés

> „1. Pixeles 2. Maradnak az arányok 3. Gól jelenet"

## Mit látsz

A gól-jelenet végén, amikor a labda a hálóban van, a gólszerző pixeles alakja
balról jobbra végigfut a kép alján. Nyolckockás futóciklussal fut, a saját
mezében, a saját bőr- és hajszínével.

- Minden gól-változatban megjelenik: sima gól, fejes, tizenegyes,
  szabadrúgás, és a kapott gólnál az ellenfél gólszerzőjével is.
- A sima gólnál 1,95 mp-nél indul (a lövés után), a többinél 1,2 mp-nél. A
  3 mp-es jelenet végéig keresztülér.
- Az alak 60 egység magas a 120-as jelenetben: az előtérben, a többi
  figurához mérve.

## Hogyan készül

1. **Blender** (`tools/blender/jatekos-sprite.py --mod retegek`, ablak nélkül,
   Cycles CPU). Ugyanaz a nagy fejű figura és futóciklus, két rétegben:
   - **árnyalás:** minden testrész fehér, csak a fény formálja;
   - **azonosító:** minden testrész egy egyszínű kód (mez, csík, nadrág,
     sportszár, bőr, haj, sötét = szem és cipő), élsimítás nélkül.
2. **Atlasz** (`tools/blender/sprite-atlasz.py --pixel 40`): 8 kocka × 40 px,
   két sor (az árnyalás LANCZOS-szal, a kód legközelebbi-szomszéddal
   kicsinyítve, kemény alfával). 320×80 PNG, 6,6 kB, base64-ben az
   `index.html`-ben (`SPR_FUT_ATLASZ`).
3. **Színezés a böngészőben** (`sprFutLap`), gólszerzőnként egyszer,
   gyorsítótárral:
   - a kód adja a színt: mez és sportszár = a mez fő színe, csík = a
     felirat színe, nadrág = a másodszín, bőr = a játékos bőre, haj = a
     játékos haja (kopasznál a bőr);
   - az árnyalás a fényét adja.
4. **Animáció:** SVG-ben, a jelenet saját animációs segédjén át (az
   időszorzó és a „Tovább” is érvényes rá). A futókockákat egy
   `steps(8)`-as eltolás váltja.

**Futásbiztonság:** ha az atlasz még nem töltődött be, a jelenet nélküle
fut.

## Újrarenderelés

```bash
blender -b -P tools/blender/jatekos-sprite.py -- --ki /tmp/ret --mod retegek
/usr/bin/python3 tools/blender/sprite-atlasz.py /tmp/ret /tmp/atlasz.png --pixel 40
base64 -w0 /tmp/atlasz.png   # → SPR_FUT_ATLASZ
```

A „magyah” felhőkörnyezet setup scriptje telepíti a Blendert.

## Próba

`tools/gol-unnep-sprite-1-0-9-8-00-proba.js`:

- az atlasz betöltődik;
- a mez a fő színben, a nadrág a másodszínben jelenik meg, és a gyorsítótár
  működik;
- az ünnep-réteg minden gól-változatban ott van;
- a labda hálóba érése előtt a figura a képen kívül vár, utána keresztülfut;
- a kockák 40 px-es lépésekben váltanak.

`KEPEK=mappa` képkockákat is ment.

A régi jelenet-próbák zöldek: sima gól, eseményanimáció, mélység, hang.
