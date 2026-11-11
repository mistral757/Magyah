# 🏆 A nemzetközi kupák padlója: az élvonal (1.0.9.0.00)

## A bejelentés

> „Premier league ereje 109, a BL 102, úgy hogy első szezonom, NBI-ben.
> Ez így irreálisan könnyű. Sokkal reálisabb kell legyen."

A képeken:

- **Az első idényes, D3-as karrier.** A létrán a D1 (Giszem-baszom premier
  líg) mezőnye most ⚡109,9.
- **A Kupák Kupájának Kupája (KK) mezőnye** ⚡102,9. Ennyi a te ⚡101,5-öd
  +1 körül. A kiírás szerint: „a bajnokságod ereje nem számít bele…
  a kupa mindig hozzád mér".

## Az ok

A 3.9.262 óta a kupa-mezőny **kizárólag hozzád mér**: a nevezési meccs-erőd
(a tartós formával) −1, plusz a sorozat fix eltolása (KK +2). Akkor ez egy
bejelentett hibára felelt: a túlnőtt kereteknek a kupa túl könnyű lett.

Ez a szabály ott ma is jól működik. Fordítva viszont irreális: egy alulról
érkező csapatnak a KK gyengébb volt, mint a piramis élvonala.

## A szabály mostantól

A nemzetközi sorozatoknak **abszolút padlója** is van. A padló a piramis
élvonalának (a legfelső osztálynak) **mostani meccs-ereje**, ugyanaz a szám,
ami a létrán a D1 sorában áll, plusz a sorozat helye. Az eltolás a pályára
lépő mezőnyre vonatkozik, ⚡-ban:

| sorozat | padló |
|---|---|
| Kupák Kupájának Kupája (KK) | D1 **+2** |
| Hiper Szuper Kupa (HSZ) | D1 **+2** |
| Ojrópai Klubcsapatok Bajnoki Kupája (OJK) | D1 **−1** |
| Konföranszié Líg (KONF) | D1 **−4** (≈ a D2 szintje) |

**A mezőny a kettő közül a NAGYOBB:**

- **Aki alulról érkezik**, az az elit ellen játszik, nem a saját szintje
  ellen. A bejelentett esetben a KK ⚡102,9-ről ≈⚡111,9-re nő. A D1 ⚡109,9.
- **Aki túlnőtt az élvonalon**, annál a régi, hozzá mért szabály marad.
  A kupa ott sem könnyű.

**Nem változnak:**

- a hazai kupák (Magor Kupája, Fából Készült Serleg);
- a felkészülési (nyári) kupa;
- a piramis nélküli mód.

A közös (PvP) kupa is ugyanezt a szabályt kapja, mert a közös középérték
ugyanabból a függvényből (`euroMidRating`) jön.

**A kupa-képernyő kiírja**, ha a padló döntött: az élvonal ⚡-ját a
nevezéskor, az eltolást, és hogy mennyi lett volna a hozzád mért mérce.

## Megjegyzés

A 3.9.175 kérése a KK-t a nyári kupához képest legfeljebb +2-re korlátozta.
Ez a mostani kérés ezt felülírja: alulról érkezve a KK akár 10 ⚡-val is
erősebb lehet nálad, ahogy egy valódi elit-sorozatban.

## Próba

`tools/kupa-elvonal-padlo-1-0-9-0-00-proba.js`:

- **D3-as első idény:**
  - KK = D1+2, HSZ = D1+2, OJK = D1−1, KONF = D1−4;
  - a padló alapja azonos a létra D1 sorával.
- **Hazai kupák:** változatlanok.
- **Túlnőtt keret:** a régi mérce marad.
- **Valódi KK-indulás:** a célérték a padló, és a képernyő kiírja.
- Nincs oldalhiba.
