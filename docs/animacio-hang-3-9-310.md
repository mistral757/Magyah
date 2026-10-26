# 🎬🔊 A jelenet saját hangja, a közvetítés utána (3.9.310)

## A kérés

> „Konkrétan az animációnak legyen saját hangja. Lövés, kapufa, védés,
> hálóban a labda, szitálós, stb. Mindennek saját kis effektek időzítve az
> animációhoz. A közvetítés hangjai pedig mindig csak az animációk után
> jöjjenek, hogy ne visszajátszás szerű legyen az animáció."

A „szitálós" a **Szitálós** skill-jelenetre (`skSzitalos`, a `fw_cannon`
skill) vonatkozik: ott a labda lebegve, cikázva száll.

## 1. A közvetítés a jelenet UTÁN jön

**Eddig:** az esemény a közvetítés sorából született (`addLine` → `mevSor`,
illetve `sbEv` → `mevSb`). Mire a jelenet elindult, a „GÓL!" sora és a gól
dallama már kint volt, ezért a jelenet visszajátszásnak hatott.

**Most:** amíg egy jelenet sorban áll vagy fut, a meccs új sorai és a
közvetítés hangjai **pufferbe** kerülnek (`_kozv`). Ide tartozik:

* a `hangMeccs` (gól, kapott gól, lap, bravúr, félidő…);
* a sorhangok (kapufa, tizenegyes, VAR, mesterhármas);
* és rajtuk keresztül a lelátó reakciója.

A jelenet vége után (`evaFolytat` → `kozvKiurit`) a sorok sorrendben
kimennek, a hangok pedig egymás után szólnak, 280 ms-onként, hogy ne mossák
össze egymást. Az óra a jelenet alatt amúgy is áll, így semmi nem csúszik el.

**A gól sora külön eset.** A motor a gól sorát az esemény ELŐTT írja (a sor,
aztán az `sbEv`), ezért a sor kiírásakor a jelenet még nincs sorban. Ilyenkor
a gól sora a tick végéig vár (`kozvGolVar`):

* ha addigra jelenet állt sorba, vele együtt a jelenet után jön;
* ha nem (például a jelenet-keret elfogyott), azonnal kimegy.

**Mikor NINCS halasztás:**

* gyors (auto) módban;
* nem élő meccsen;
* ha nincs jelenet.

Ezekben a régi út marad. Ha a jelenetet kikapcsolják, vagy a lap a háttérbe
kerül, a lejátszó a pufferből mindent azonnal kiad.

## 2. A jelenet saját hangja

**Honnan jön a hang:** a jelenet mozgásából, nem kézzel írt
időpontlistából. A lejátszó `A()` burkolója minden animációnál látja, melyik
elem mikor mozdul, és ebből hangjegyet ír (`evaHangJel`):

| elem | mikor | hang |
|---|---|---|
| labda (`#evaLabda`) | megindul | rúgás (`aRugas`), erős lövésnél (Ágyúgolyó, Katapult, Nagy labda, Szabadrúgás-mester, Szitálós) bomba (`aBomba`) |
| labda | messzire, gyorsan száll | suhanás (`aSuhan`) |
| labda, Szitálós | megindul | lebegő, recsegő süvítés (`aLebeg`) |
| labda | irányt vált | érintés / pattanás (`aErintes`) |
| háló (`#evaHalo`) | mozdul | hálózörej + tompa puffanás (`aHalo`) |
| kapufa-keret (`#evaKeret`) | felvillan | fémes csendülés (`aKapufa`) |
| a célzott cella (`#evaCella`) | villan | kesztyű (`aKesztyu`); ha a háló is mozdul (gól), elmarad |
| kapus (`#evaKapus`) | elrugaszkodik | vetődés (`aVetodes`) |
| blokk-csattanás (`#evaCsatt`) | felbukkan | tompa ütés (`aTompa`) |
| villanás (`#evaVillan`) | felvillan | a lelátó morajlása (`aTomeg`) |
| kép (`#evaKamera`) | rázkódik | dörrenés (`aDorr`) |
| lap (`#evaLap`) | előkerül | rövid síp + a lap suhanása (`aSipRovid`, `aLap`) |
| játékvezető, orvos | megjelenik | rövid síp |
| sérült játékos | a földre kerül | tompa ütés |
| VAR-sáv | indul | két rövid jelzőhang (`aVar`) |

**Az időzítés:** ugyanaz a szám, amivel a mozgás fut — a késleltetés, a
kulcskocka-offset és a sebesség-szorzó együtt. A hang ezért nem csúszik el a
képtől, és egy új jelenet-sablon magától hangot kap.

**Szabályok:**

* azonos hang 60 ms-on belül csak egyszer szól;
* jelenetenként legfeljebb 10 hangjegy;
* koppintással átugrott jelenetnél a hátralévő hangok elmaradnak;
* csak a nézett, élő meccsen szólnak (`hangMeccsNezett`).

**A hangzás:** a zörejek a WebAudio-szintetizátorral készülnek. Mindkét
hangcsomagban (chiptune és lágy) ugyanazok, mert a pályáról jönnek, mint a
sípszó. A lágy csomag ezeket a chiptune-változatra irányítja.

## Próba

`tools/animacio-hang-3-9-310-proba.js`, 20 állítás, valódi karrierben, a
játék saját lejátszójával:

* mind a 44 sablon kap legalább egy jelenet-hangot;
* gól: rúgás + háló, kesztyű nélkül;
* kapufa: kapufa-csendülés, háló nélkül;
* bravúr: kesztyű / vetődés, háló nélkül;
* Szitálós: bomba + lebegés;
* blokk: saját hang;
* lap: síp + lap;
* a hang a kulcskocka idején szól (mért eltérés 4–7 ms), a rúgás a háló előtt;
* a valódi `addLine` + `sbEv` úton:
  * jelenet közben a GÓL-sor és a közvetítés hangja pufferben vár;
  * utána kijön;
  * minden közvetítés-hang az utolsó jelenet-hang után szól;
* koppintás után a hátralévő jelenet-hangok elmaradnak, a közvetítés kijön;
* jelenet nélkül és gyors módban a régi út; a jelenet nélküli gól-sor csak a
  tick végéig vár;
* nincs oldalhiba.

A `hangtema-proba` a 24 felület-hang mellett a 15 jelenet-zörej lágy párját
is számolja.
