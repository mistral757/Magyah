# Párharc-értékelés (Könnyed PvP) és a nehézségfüggő 3. stílus — 1.0.4.12.00

## 1. Az újabb csapatstílus küszöbe a nehézséggel

Kimondott kérés: *„ötödik szintű nehézségig marad ez a szint, hogy a 20 szint elérése
után nyílik ki a harmadik csapatstílus, viszont ahogyan megyünk felfelé, az ötödik
nehézségi szinttől 6.1-nél kezdve már elkezdünk közelíteni ahhoz, hogy a 10.5-ön már a
15-ös szintnél megnyíljon a harmadlagos csapatstílus, és ezt fokozatosan kell
felépíteni."*

| nehézség | küszöb |
|---|---|
| 1.1 – 5.5 | 20. szint |
| 6.1 | 19,8 (a 19. szint 80%-a) |
| 7.1 | 18,8 |
| 8.1 | 17,8 |
| 9.1 | 16,8 |
| 10.1 | 15,8 |
| 10.5 és fölötte | 15. szint |

- Belső szintenként 0,2 szinttel lejjebb, monoton. A tört a szinten **belüli** haladás
  (`styleEffLevel` = szint + haladás), így a lépcső valóban fokozatos.
- Minden újabb helyre ugyanez a küszöb él (a 4., 5. … filozófiára is).
- Fokozat nélküli (klasszikus) karrierben marad a 20. szint.
- A csúcsfok és a pontgyűjtő +10 szintje továbbra is a 20. szinten nyílik.
- A menü kiírja a küszöböt és a nehézséget, a nyitáskor a napló egyszer szól.
- Kód: `styleXNeedFor(nf,s)`, `styleXNeed()`, `styleEffLevel(st)`.

## 2. A párharc értékelő ablaka

Kimondott kérés: *„minden párharc után a PvP könnyed módban egy külön ablakban dobnád
fel az értékelést a párharc állásáról: melyik csapat milyen erős, eddig milyen eredmények
voltak, kinek mennyi a Run szintje, beszínezve látványosan, és itt lehetne megvásárolni
nagyon látványos helyen a felzárkóztatási sima boostokat."*

Saját bajnokságban (Könnyed PvP) minden párharc-nap után, a meccs utáni lánc végén
felugrik (`#svErtModal`); a „Tovább" viszi tovább a folyamatot. Tartalma:

- **Eredmény**: a nap és az idény, a két csapat, a gólok, győzelem/döntetlen/vereség
  színezve.
- **Erő és Run**: két kártya — a Run szint nagy, színezett számmal és minősítéssel
  (induló · közepes · jó · erős · kiemelkedő · legendás; a vezetőn 👑), alatta a párharcbeli
  ⚡ meccs-erő; alattuk a különbség és az idényen belüli Run-gyarapodás.
- **🆙 Felzárkóztatás** — kiemelt, aranyszínű doboz a lap közepén: a ⚡ most / plafon,
  haladás-sáv, és nagy gomb a sima boostok megvásárlásához (a meglévő `felzNyit`). Ha nem
  te vagy a gyengébb, a doboz megmondja, kié az ajánlat.
- **Párharc-mérleg** (a karrier egészére): győzelem / döntetlen / vereség / pont, gólok,
  ki vezet.
- **Eddigi párharcok**: idényenként az I–IV. nap eredménye színes jelvényekkel.
- **Saját bajnokságotok**: pont, mérleg, meccsszám, osztály — mindkét csapaté.

Az adat: a párharc rekordja (`svPhRogzit`) mostantól a két ⚡-t (a közös
pillanatképekből — a két gépen tükörben ugyanaz), a két Run szintet és a társ bajnoki
mérlegét is viszi; a társé a pillanatkép `standing.run` / `standing.div` mezőjéből jön.
A HUB Párharc-lapján „Az utolsó párharc értékelése" gombbal bármikor újranyitható.

Próbák: `tools/stilus-20-szint-1-0-4-11-00-proba.js` (2g–2o), `tools/sajat-bajnoksag-3-9-331-proba.js`
(a kétgépes párharc rekordja és az ablak).
