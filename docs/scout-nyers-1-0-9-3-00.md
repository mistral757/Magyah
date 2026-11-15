# 🔍 1.0.9.3.00 — A scout-találat a nehézséggel a kereted nyers erejéhez húz

## A kérés

> „A Scout által talált játékosok (nem a sima átigazolási piac) átlag
> ratingja nehézségi szintenként egyre növekvő mértékben közeledjen a csapat
> nyers erejéhez a mezőny erejével szemben. Azaz pl itt 9.2-n kb már félúton
> legyen az átlag scout találta játékos ereje […] 10.5-nél pedig már 15%-kal a
> nyers erő felé."

## Ami eddig volt

A felfedezés sávja (`discoveryBand`) a piaci sávra (`signingBand`) ül. Ennek a
közepe a mezőny szintje, a kereted nyers ereje és a legjobb játékosod
átlaga. A kereted ereje a sávban azonban ±15-re van a mezőnyhöz szorítva
(`SIGNING_BAND_CLAMP`). Ezért egy, a mezőnytől erősen lemaradó keret (a
bejelentésnél nyers 173, a scout-találatok 212–219) is a mezőny szintjén
kapott embert — ráadásul ingyen vagy töredékáron.

## Mostantól

A felfedezés sávja (az alja, a teteje és a kúp csúcsa együtt) a kereted nyers
ereje felé csúszik. A nyers erő a `bandTeamRaw`: a kezdők Rating-átlaga,
szorítás nélkül.

`csúszás = t · (nyers − a piaci sáv közepe)`, csak lefelé.

A `t` a nehézséggel gyorsulva nő; `i` a nehézség belső sorszáma (1.1 → 0 …
10.5 → 49):

`t = 0,5 · (i / 41)^1,47`

| nehézség | 1.1 | 3.1 | 5.1 | 6.1 | 7.1 | 8.1 | 9.1 | **9.2** | 10.1 | **10.5** |
|---|---|---|---|---|---|---|---|---|---|---|
| t | 0 | 6% | 17% | 24% | 32% | 40% | 48% | **50% (félút)** | 57% | **65% (félút + 15%)** |

- **Csak lefelé hat.** Ha a kereted erősebb a sáv közepénél, a scout nem hoz
  ingyen sztárt; ez a 3.9.201 óta érvényes szabály.
- **Csak a scout-találatra hat:** a klasszikus felfedezésre és a valósághű
  scout kiszemeltjeire. A fizetős piac (`signingBand`, scout-keresés)
  változatlan.
- **A hardcore közös scout-terve változatlan:** a mezőnyhöz mért, mindenkinél
  azonos célerő. Egy keretfüggő csúszás ott szétválasztaná a játékosokat.
- **A scout-célzás panelje** („hány ember felel meg a sávban”) ugyanazt a
  csúsztatott sávot használja.

Példa a bejelentés képeiről, becsléssel, 9.2-n: a nyers erő 173, a
scout-sáv közepe kb. 210 körül. A találatok átlaga kb. 18–20-szal lejjebb
kerül, nagyjából a mezőny és a nyers erő félútjára.

## Próba

`tools/scout-nyers-1-0-9-3-00-proba.js`:

- **A görbe:** 0 / 0,5 / 0,65, szigorúan nő, és a lépései is nőnek.
- **A sáv csúszása:** lemaradó keretnél pontosan `t · (nyers − közép)`.
- **A valódi felfedezések átlaga** ennyivel kerül lejjebb.
- **Erősebb keretnél** nincs csúszás.
- **A fizetős piac sávja** változatlan.

A `felfedezes-szint-3-9-201` próba a régi alapsávot méri, ezért abban a
csúszás ki van kapcsolva.
