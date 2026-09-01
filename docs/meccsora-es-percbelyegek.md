# A meccsóra és a percbélyegek — miért szaladt el a napló a táblától

*(3.8.38. Érintett kód: `gmin` vödör-plafonja, az új `gnow`, a négy
kontextus-hívás a `playMatch`-ben (`_dialCtx`, `dialMul("own"/"opp"/"goalw")`,
`pickTierQuote`), és a `sbSetScore` számjegyei. A meglévő, változatlan
mechanika: `sbClockPaint`, `stoppageMin`, `sbMinTxt`, a 90+ dráma.)*

## A bejelentés

> „továbbra is fennáll az idő probléma… nem oldódott meg. mi lehet a
> hátterében?"

A képernyőképeken két dolog látszik:

- az eredményjelző órája **85:14**-et mutat, miközben a napló már **90+8**-nál
  jár — a lefújásnál pedig gólok egész sora kap **90+10** bélyeget;
- a tábla **9:1**-et ír, a napló ugyanabban a pillanatban **10:0**-t, és a tábla
  SAJÁT gólkrónikájában tíz gólszerző-sor áll.

A 3.8.36 az eredményjelző és a napló **elrendezését** javította (a ragadó tábla
rátakart a naplóra) — az valódi hiba volt, és meg is szűnt. Ez viszont egy másik
hiba, ugyanazon a képernyőn: nem a doboz csúszott el, hanem **az idő**.

## Az óra nem hazudik — a napló szalad el

A tábla órája a **valós eltelt időből** számol (`sbClockPaint`): egy motor-tick
öt meccspercet ér, tehát az óra pontosan annyit mutat, amennyi ténylegesen
lefutott. Ez helyes és nem is csúszhat el.

A napló percei viszont máshonnan jönnek: a `gmin(vödör)` ad egy egyperc-pontos,
hihető bélyeget az ötperces vödrön belül. **És ez a függvény mellékhatásos** —
minden hívása előrébb tolja a közös elbeszélői órát (`_lastGoalMin`), mert két
esemény nem kaphat azonos percet:

```js
let m = bucket-4 + Math.floor(Math.random()*5);
if(m<=_lastGoalMin) m=_lastGoalMin+1;   // szigorúan nagyobb
```

Ez a naplósoroknál helyes. Csakhogy **négy helyen nem naplósorhoz kellett a
perc, hanem kontextusnak** — és az egyik közülük egy `weightedPick`
**súlyfüggvénye**, ami a pályán lévő **minden játékosra** lefut:

```js
weightedPick(active,(x,idx)=> … * dialMul("goalw",{ …, min:gmin(min), … }) … )
```

Egyetlen gól gólszerző-választása így **tizenegyszer** húzott új percbélyeget —
pedig egyszer sem írt ki semmit.

## Mérve, egy valódi meccsen

A `gmin` minden hívását felírtuk egy lejátszott, 4:1-es mérkőzésen:

| | 3.8.37 | 3.8.38 |
|---|--:|--:|
| `gmin`-hívás összesen | **76** | **8** |
| gól nélküli ötperces vödör | 2 hívás | 1–2 hívás |
| **gólos vödör** | **14–16 hívás** | 1–3 hívás |
| legnagyobb percbélyeg | **100** (= 90+10) | 68 |
| a vödörből kilépett bélyeg | igen: 10 → 11, 12, … **18** | **nincs** |

A számláló tehát **egyetlen ötperces vödrön belül végigsétált nyolc percen**, és
mindezt egy súlyfüggvényből. Négy gólnál már beállt a 100-as plafonra; a
bejelentett **10:1**-es meccsen ez jóval korábban megtörtént — onnantól
**minden** gól „90+10" lett, a napló pedig fényévekre került az órától.

## A javítás

### 1. Ami olvasni akarja a percet, az olvassa

Új, **mellékhatás nélküli** olvasó (`gnow`): ugyanazt a percet adja vissza, de
nem mozdít semmit. A négy kontextus-hívás erre váltott — a `_dialCtx`, a két
`dialMul` és a `pickTierQuote`.

Ez egyben egy **csendes pontatlanságot is megszüntet**: a súlyfüggvényben eddig
minden jelöltet *más* (egyre későbbi) perccel értékeltünk ki, tehát a
hangsúly-csúszka időablakos hatásai jelöltenként máshogy értek. Mostantól
mindenki ugyanabban a percben áll.

### 2. A vödörből nem lépünk ki

Védőháló, hogy egy jövőbeli hívási hely se tudja megint elszabadítani az órát:
a bélyeg **nem hagyhatja el a saját ötperces vödrét**. Ha elfogytak benne a
percek, az esemény a vödör **utolsó** percét kapja.

Két esemény azonos perce sokkal kisebb baj — a valódi közvetítés is így beszél
(„35' Pelé, 35' Dorval") —, mint egy elszaladt óra. **Az utolsó vödör a
kivétel:** ott a ráadásba átcsúszni jogos, épp attól „90+".

### 3. A tábla kétjegyű eredményt is ki tud írni

A tábla oldalanként **egyetlen** lapot tartott, és a számot kiíráskor
**9-re csonkolta**:

```js
sbSetDigits([SB.scoreEls[0]], Math.min(9,hs));   // ← a régi sor
```

Egy 10:1-es meccs így **9:1**-ként állt a táblán, miközben alatta, ugyanannak a
táblának a gólkrónikájában tíz gólszerző-sor sorakozott. A tábla saját magának
mondott ellent — a bejelentés ezt is „elcsúszásnak" látta, joggal.

Mostantól az oldal annyi lapot kap, ahány számjegy kell, és csak akkor épül
újra, ha a szélesség tényleg változott (különben minden gólnál eldobnánk a
flip-animációt).

| eredmény | 3.8.37 | 3.8.38 |
|---|---|---|
| 9:0 | „9:0" ✓ | „9:0" ✓ |
| 10:0 | **„9:0"** ✗ | „10:0" ✓ |
| 10:1 | **„9:1"** ✗ | „10:1" ✓ |
| 12:11 | **„9:9"** ✗ | „12:11" ✓ |

## Tesztelés

Playwright, headless Chromium, **valódi karrieren, valódi lejátszott
mérkőzésen**, 430×932-es nézetben:

- **A percszámláló mérése** (a fenti táblázat): a hívásszám 76-ról 8-ra esett,
  a gólos vödrök 14–16 helyett 1–3 hívást kapnak, és **egyetlen bélyeg sem lép
  ki a vödréből**. A javítás előtti kódon ugyanez a mérés reprodukálta az
  elszaladást (10-es vödör → 18. perc) és a 100-as plafont.
- **A krónika** a javítás után hihető: `Pelé 17', 31', 75', 90' · Macia 75' ·
  Lima 90+2` — nincs „90+10"-halom.
- **Az eredményjelző számjegyei**: hét eredményre ellenőrizve, a javítás előtti
  kódon a 10:0 / 10:1 / 12:11 mind hibás volt, utána mind helyes.
- **Elrendezés**: 12:11-nél, telefonon, a tábla középső sora 56 px marad, a
  számjegyek **nem takarnak rá** a csapatnevekre és **nem lógnak ki** a sorból
  (képernyőképpel is ellenőrizve).

Egyetlen konzol-hiba sem keletkezett. `tools/check.sh` zöld.
