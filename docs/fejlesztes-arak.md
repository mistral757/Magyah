# A fejlesztések ára: büdzséhez mérve, kezdő kedvezménnyel (3.9.135)

> „A felállás módosítás is scalelődjön árban, akárcsak a pozíció tanulás. És a
> stáb bővítés is, a scout erősítés, az átigazolási ügynökség fejlesztés.
> Mindenen legyen ott az 50 és 33% kedvezmény 1. és 2. szezonban, mint a
> boostokon."

## Ami eddig volt

Négy tétel fix pontáron állt:

| tétel | régi ár |
|---|---|
| fizetős felállásváltás | 5000 pont (10 Mrd) |
| stáb-hely | 10 000 · 1,75ⁿ pont (20 / 35 / 61 Mrd) |
| scout-fejlesztés | 5000 … 100 000 pont, exponenciális görbe |
| ügynökség-fejlesztés | a scout-ár kétszerese |

Egy friss karrier éves kerete ~4000 pont (8 Mrd). Az első idényben egy
stáb-hely így két és fél évnyi bevételbe került, a piramis tetején viszont
aprópénz volt. A poszt-tanulás 3.8.18 óta már a büdzséhez mért, de a kezdő
kedvezményt eddig egyik sem kapta, csak a boostok.

## A szabály

- **Arányos ár:** a régi ár pontosan a referencia-büdzsénél marad érvényes
  (`PRICE_BUDGET_REF` = 10 000 pont = 20 Mrd, egy ~90-es csapat éves
  kerete), onnan a klub éves bevételével (`clubBudgetScale`) arányosan
  mozog.
- **Az árak alakja érintetlen:** a stáb-helyek 1,75-ös lépcsője és a scout
  görbéje ugyanaz, csak a lépték követi a klubot.
- **Kedvezmény:** ugyanaz a függvény, ami a boostokat viszi (`boostEarlyDisc`):
  1. idény −50%, 2. idény −33%, a 3.-tól teljes ár. Ez az öt tételen mind jár,
  a poszt-tanuláson is.
- **Az idei első felállásváltás** továbbra is ingyenes.
- **A képernyők** az ár mellé kiírják: „−50% (1. idény)”. A naplóbejelentés és a
  „boost-kedvezmény” tipp is megemlíti, hogy ezekre is vonatkozik.

## Mérve

Friss karrier, valódi büdzsé (~3990 pont ≈ 8 Mrd/idény):

| tétel | régi (fix) | új, 1. idény | új, 3. idény |
|---|---|---|---|
| felállásváltás (2.+) | 10 Mrd | 2 Mrd | 4 Mrd |
| stáb-hely 3→4 | 20 Mrd | 4 Mrd | 8 Mrd |
| scout 3,5★→4★ | 36 Mrd | 7 Mrd | 14 Mrd |
| ügynökség (következő fél ★) | a scout ×2 | 4 Mrd | 10 Mrd |
| poszt-tanulás | 2,2 Mrd | 1,2 Mrd | 2,2 Mrd |

Az ügynökség a saját csillagszintjén vett scout-ár kétszerese, ezért lehet
olcsóbb a scoutnál.

## Ami kimaradt (nem volt a kérésben)

A **keretbővítés** (`rosterExpandPrice`) és a **felállás-bolt** (a 4-2-4 és a
saját felállás, 75 / 50 Mrd) továbbra is fix áras. Ha kell, ugyanez a helper
(`scaledUpgradePrice`) egy sorral rájuk is tehető.

## Próba

`tools/fejlesztes-arak-proba.js` (33 állítás). A régi kódon 24 bukik.

- a referenciánál a régi ár, ±1% kerekítéssel;
- kétszeres és fele büdzsé → kétszeres és fele ár, mind a hat árnál;
- 1. idény −50%, 2. idény −33%;
- az idei első felállásváltás ingyenes;
- a képernyők kedvezmény-címkéje.
