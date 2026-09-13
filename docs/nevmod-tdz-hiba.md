# „Beírtam a kulcsszót, és befagyott a játék" — a TDZ-hiba (3.9.66)

Bejelentés: *„Ha beállítjuk, hogy ne legyen jogtiszta verzió, profil ablaknál
alul beírjuk, hogy szutykoskutyus, akkor befagy a játék. Nem működik onnantól
kezdve az app. Talán a v3.9.64 óta."*

**Igaz volt, egy verzióval korábbról: a 3.9.61 óta.** Mérve: 3.9.60 tiszta,
3.9.61-től minden verzió halott app valós névmódban.

## A hiba

```
ReferenceError: Cannot access 'careerPool' before initialization
    at natOfName      (32487)
    at baseShortName  (32494)
    at shortName      (36737)
    at <modul-szint>  (87789)   ← a filozófus-edző generátor
```

Három dolog találkozott:

1. **`careerPool` modul-szintű `let`**, és a fájlban jóval lejjebb áll
   (91268) — a `natOfName` viszont a 32487. sorban olvasná.
2. **A `typeof` NEM véd a TDZ ellen.** A `natOfName` őrfeltétele
   `typeof careerPool!=="undefined"` volt. Egy `let` a deklarációja előtt
   *temporal dead zone*-ban van, és ott a `typeof` **dob** — nem `"undefined"`-ot
   ad, mint egy sosem deklarált névnél. A védőfeltétel tehát pontosan azt a
   hibát nem fogta meg, amire íródott.
3. **A 3.9.61 filozófus-edző generátora modul-szinten hív `shortName()`-et** a
   hét edző nevére. Magyarított módban a név a `HU_NAME_TABLE`-ből jön, és a
   hívás sosem jut el a `baseShortName`-ig. **Valós nevekre viszont lefut** — és
   dob.

## Miért „befagyás", és miért maradt is úgy

A modul-szintű hiba nem egy funkciót ejt el: attól a sortól **a fájl hátralévő
hatezer sora nem fut le**. A játék nem hibázik, hanem félig felépülve megáll —
a kezdőképernyő kirajzolódik, a gombok nagy része viszont nem létező
függvényekre mutat.

És mivel a névmód a `localStorage`-ban marad, **újratöltés után is ugyanez
történt**. Innen a „nem működik onnantól kezdve az app".

Mérhető jele volt: a kezdőképernyőn 3.9.60-ban 19 gomb volt, 3.9.61-től valós
névmódban 18 — a hiányzó gomb a le nem futott kódrészből hiányzott.

## A javítás

**1. Az osztály megszüntetése.** A `natOfName` `try/catch`-csel olvassa a
`careerPool`-t — a TDZ-t csak elkapni lehet, megkérdezni nem:

```js
let e=null;
try{e=careerPool?careerPool[n]:null;}catch(err){e=null;}
```

Ettől bármelyik jövőbeli modul-szintű névformázás is biztonságos.

**2. A hét edző nemzetisége kézzel** (`STYLE_COACH_NAT`). Két dolgot ad: a
generátornak nem kell a `careerPool`-ig elmennie érte, és a rövid alak a helyes
szabály szerint képződik. Enélkül a magyar névsorrendű edzők rövid neve a
**keresztnevük** lett volna:

| | előtte | most |
|---|---|---|
| Csank János | „János" | **Csank** |
| Guttmann Béla | „Béla" | **Guttmann** |
| Verebes József | „József" | **Verebes** |

*(A „Johan Cruyff" és a „Dárdai P." szándékos: mindkettő egyértelműsítés — van
Jordi Cruyff és több Dárdai is az adatbázisban.)*

**A beírás helye számít.** A tábla a `STYLE_COACHES` mellett áll, de a
`NAT_BY_NAME`-be írni csak ott lehet, ahol az megszületik (32481) — egy
fentebbi írás ugyanabba a temporal dead zone-ba futott volna. Az első
próbálkozás pontosan ezt tette, és a `try/catch` némán elnyelte: a próba
mutatta meg, hogy a rövid nevek attól még rosszak maradtak.

## A védelem: `tools/nevmod-boot-proba.js`

A próba **nem a névmódot méri, hanem a betöltést**: mindkét módban (és
beállítás nélkül) felhúzza az oldalt, és megnézi, hogy

- nincs oldalhiba, **és**
- a fájl **végén** álló függvények is léteznek.

A második a lényeg. Egy „nincs hiba" önmagában nem elég: a TDZ csendben vágja
el a maradékot, és a hibát csak egy elszálló `pageerror` árulja el — ha épp
figyel rá valaki. A hátsó függvények megléte az egyetlen jel, ami kimondja,
hogy a script **végigfutott**.

Külön ág méri a váltás pillanatát és az **újratöltést** utána — ez volt az az
állapot, ami eddig halott appot adott.

## Kinek mit jelent

Aki 3.9.61 óta átváltott valós nevekre, annak a játéka a **következő betöltéstől
magától rendben lesz** — a beállítás megmaradhat, nem kell törölni semmit.
