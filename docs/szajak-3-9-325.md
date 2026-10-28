# 👄 Többféle száj a játékos-szerkesztőben (3.9.325)

## A kérés

> „játékos testreszabásnál legyen több fajta száj. Annyira jellegzetes szájak
> tudnak lenni. Pl. Ronaldinho kapafogai"

## A szájak

| # | név | honnan |
|---|---|---|
| 0 | kis mosoly | generált |
| 1 | nevetős | generált |
| 2 | szelíd | generált |
| 3 | félmosoly | generált |
| 4 | egyenes | generált |
| 5 | **kapafog** | új, jellegzetes |
| 6 | **foghíjas** | új, jellegzetes |
| 7 | **széles vigyor** | új, jellegzetes |
| 8 | **telt ajkak** | új, jellegzetes |
| 9 | **vékony ajak** | új, jellegzetes |
| 10 | **csücsörítés** | új, jellegzetes |
| 11 | **nyitott száj** | új, jellegzetes |

Az első öt eddig „1–5. változat" néven szerepelt a szerkesztőben, most nevet
kapott.

**Az új szájak (5–11):**

* **kapafog:** a két nagy felső elülső fog az alsó ajkon is túllóg;
* **foghíjas:** vigyor, középen réssel;
* **széles vigyor:** két fogsor, fültől fülig;
* **telt ajkak:** a két ajak kitöltve;
* **vékony ajak:** összeszorított;
* **csücsörítés;**
* **nyitott száj:** felső fogsorral és nyelvvel.

## A hangulat

A generált szájakat a morál eddig is átrajzolta: jókedvben nevetős, rosszkedvben
lefelé görbülő lett. A jellegzetes szájak a hangulattal együtt mozognak, a
szájzug fel- vagy lefelé áll, de a **jellegük megmarad**:

* **a kapafog** rosszkedvben is kilóg a lefelé görbülő száj fölött;
* **a telt ajkak** szájzuga lefelé fordul;
* **a széles vigyor** rosszkedvben egyenes vonallá szűkül.

## Mi NEM változott

* **A név szerint generált arcok.** A sorsolás továbbra is az első öt közül
  választ, így egyetlen meglévő játékos arca sem változik meg.
* **A jellegzetes szájak forrása:**
  * a játékos-szerkesztő (karrierre vagy globálisan);
  * a stylistok közös listája (a napi beépítő a `FACE_MOD_MEZOK` szabályból
    dolgozik, ami most 0–11-et enged át);
  * a szerkesztő 🎲 sorsolása, ami mind a 12 közül választ.

## A pixeles változat

A palettája a jellegzetes szájaknál kiegészül a fog, a szájüreg, a nyelv és
az ajak színével. Enélkül a raszterezés ezeket a bőrbe olvasztaná.

## Próba

`tools/szajak-3-9-325-proba.js`:

* a 12 száj névvel, és a szerkesztő mind a 12-t felkínálja;
* mind rajzolódik három hangulatban, és a jellegzetesek mások, mint a
  generáltak;
* a kapafog rosszkedvben is kilóg;
* 400 generált név szája az első ötből jön;
* a stylist-szabály a 11-est átengedi, a 20-at levágja;
* a pixeles változat is elkészül;
* nincs oldalhiba.
