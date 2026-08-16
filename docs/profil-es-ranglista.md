# Profil és ranglista — 1. fázis (helyi), 2. fázis (globális)

*(3.3.21. Érintett kód: `PROFILE_KEY` és a köré épült függvények, `renderProfileModal`,
`profileTotals`, valamint a már meglévő `runBoard*` réteg.)*

## 1. Mi készült el (1. fázis)

A kezdőlap jobb felső sarkában egy **profil-gomb**: becenév + rövid azonosító.
Rákoppintva egy ablak nyílik, benne

* a **becenév** szerkesztője,
* az **eredményeid** összegezve (a végigvitt karrierekből),
* és a már meglévő **helyi Run-ranglista**.

Minden a `localStorage`-ban él, hálózat nélkül — a 2. fázis (globális
ranglista) ugyanezekre az adatokra fog épülni.

## 2. Az adatmodell

```js
localStorage["30-0-profile-v1"] = {
  v: 1,
  uid: "u<10 jel>",     // egyszer születik, SOHA nem változik
  nick: "Mistral",      // szabad szöveg, NEM egyedi
  createdAt, updatedAt
}
```

* **A becenév nem egyedi** — foglalás-rendszer helyett az `uid` különböztet meg
  mindenkit. A felületen a rövid alak jelenik meg: `Mistral #9f2x` (az uid
  utolsó négy jele). A **teljes** uid megy majd fel a globális listára, a rövid
  csak kijelzés.
* **Eszközönként külön profil** (mint a téma és a Run-ranglista). Ezt a felület
  ki is mondja.
* **A mentéstől független.** Egy karrier lezárása a mentést törli — a profil
  nem élhet benne.

## 3. Névszabályok

| szabály | érték |
|---|---|
| hossz | 2-20 karakter (a fölösleg vágódik) |
| tisztítás | vezérlőkarakterek és `<` `>` ki, többszörös szóköz összevonva |
| szűrő | egyszerű trágárság-lista, ékezet- és írásjel-függetlenül |

A szűrő (`PROFILE_BAD_WORDS` + `profileNormalize`) a normalizált alakban keres
részláncot: a `g.e.c.i` és a `Kúrva` ugyanúgy fennakad. Nem teljes moderáció —
a nyilvánvalót fogja ki, mielőtt közös listára kerülne, és a felület kimondja,
miért nem megy át. Bővítés: egyetlen tömb.

A megjelenítés minden ponton `esc()`-en megy át, tehát a tárolt név akkor sem
tud jelölést befecskendezni, ha a szűrő átengedi.

## 4. Az eredmény-összegzés

`profileTotals()` a **helyi Run-ranglistából** dolgozik (`runBoardLoad`), oda
pedig kizárólag **Infinityt megnyitott** karrier kerül. Amit ad: legjobb
Infinity-Run (mezőnnyel és szezonszámmal), legjobb záró Run, hány
Infinity-futás / ebből hány lezárva, összes bajnoki cím, összes Aranylabda,
összes lejátszott szezon.

Ez az EGY függvény a globális statisztika jövőbeli gyűjtőhelye is — ezért van
külön kiemelve, nem a rajzolásba szőve.

## 5. A 2. fázis terve (globális ranglista)

A döntések megvannak:

* **Csak az Infinity-megnyitáskori Run** kerül fel — az a valódi referencia
  (a lezáráskori marad helyi).
* A név nem egyedi, az azonosító különböztet meg.
* A szűrő már most a helyén van, tehát feltöltéskor nem kell újra dönteni róla.

Ami hátravan (kód): a `runBoardOnInfinity()` mellé egy feltöltés
`/lb/runs/<uid>` alá, egy top-100 lekérdezés (`orderByChild('infRun')` +
`limitToLast`), és a lista-nézet a profil-ablakba. A Firebase RTDB **már be van
kötve** (az MP-ág használja, lusta SDK-importtal és helyi tartalékkal), tehát új
infrastruktúra nem kell.

Ami hátravan (konzol, a projektgazdánál):

1. **RTDB-szabály** a `/lb` ágra: írás csak a saját uid alá, séma- és
   tartomány-ellenőrzés (`infRun` 0-100, `infLevel` 0-300, névhossz),
   sebességkorlát.
2. **Anonymous auth** bekapcsolása — enélkül az uid csak egy localStorage-string.

**Amit a rendszer nem tud garantálni:** a játék statikus HTML, a kliens bármit
felküldhet. A szabályok a szemetelést és a triviális átírást fogják ki, a
szándékos csalást nem — a lista becsületkassza, és ezt a nézet alatt ki is
mondjuk majd.
