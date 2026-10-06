# tools/meres/adat — mérési adatok (névtelenítve)

**Amíg a játékbeli mérő (3.9.206) adatot gyűjt, ide kerülnek a korábbi
karrierekből kinyert idénysorok.** A repó nyilvános, ezért ide CSAK
névtelenített kivonat kerül:

* nincs benne játékos-, csapat- vagy scoutnév;
* nincs benne világ-seed és szobakód;
* a karrier azonosítója a seed kivonata (`m_…`).

**A nyers mentések nem kerülnek ide.**

| Fájl | Mi | Honnan |
|---|---|---|
| `mentesekbol-2026-10.json` | 8 karrier, 46 lezárt + 1 futó idény (3.9.77–3.9.174) | mentés-exportok, 2026-09-15 … 10-02 |

## Új mentés hozzáadása

```bash
node tools/meres/mentesbol.js magyah_….json [további…] --nevtelen --ki tools/meres/adat/mentesekbol-<dátum>.json
node tools/meres/osszegez.js tools/meres/adat/*.json --csv osszes.csv
```

**Mit tud a mentésből készült rekord, és mit nem:** lásd a
`tools/meres/mentesbol.js` fejlécét.

* **Röviden:**
  * az idény helyezése, a XI-átlag és a mezőny az idény végén, a főkönyv és
    az eladások hitelesek;
  * az osztály-út becsült;
  * a meccsenkénti sor, a büdzsé idősora és az érkezők forrása hiányzik.

**Az első elemzés:** `docs/meres-mentesek-elemzes-2026-10.md`.
