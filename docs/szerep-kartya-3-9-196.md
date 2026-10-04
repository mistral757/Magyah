# 3.9.196 — 🎭 A szerepkártya: nem fut ki, nincs nyers kulcs

> „Nem annyira elegáns hogy azok a szövegrészek ott kifutnak a boxból"
> (képernyőkép: a Panzer szerepei, pixel-betűs téma)

## Két hiba

1. **A hatás-szöveg kifutott a kártyafejlécből.** A szerep hatás-szövege
   (pl. „−52% a kiállítás meccserő-ára, amíg a pályán van”) a kártya
   fejlécében tördelhetetlen volt (`.msRew{white-space:nowrap}`). Széles
   betűs témában kilógott a kártyából, és a címet („A Vezér”) is két sorba
   szorította.
2. **Nyers belső kulcs a felületen.** A Vezér (Panzer) és az Irányító
   (Gegenpressing) szerepe a Rating és a karizma együtteséből mér, a Lesi
   Puskás a Sebesség és a Gólszerzés átlagából. Ennek a két származtatott
   mércének nem volt neve, ezért a kártyán és a jelölt-listában a kulcs
   állt: „ovrkar 200”, „sebgol”.

## A javítás

* **A tördelés:**
  * a kártyafej (`.msTop`) tördelhet (`flex-wrap`);
  * a hatás-szöveg (`.msRew`) ha nem fér el, új sorba kerül, jobbra
    igazítva, és szükség esetén soron belül is törik;
  * minden ilyen kártyára érvényes (szerepek, mérföldkövek, képességek),
    mert ugyanaz a fej-minta van mindenhol.
* **A két mérce neve** (`ROLE_ATTR_COMBO`, `roleAttrLabel`):
  * **Vezérerő** — a Rating és a karizma együtt;
  * **Lesi-erő** — a Sebesség és a Gólszerzés átlaga.
* **A kártyán így olvasható:** „a hatás erejét a Vezérerő (a Rating és a
  karizma együtt) szabja”. A jelölt-listában: „Maskarás · KV · 87 · Vezérerő
  106”.

## Próba

`tools/szerep-kartya-3-9-196-proba.js` — a valódi `roleSectionHtml`
Panzerrel és Gegenpressinggel, 260 px széles dobozban.
