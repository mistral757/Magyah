# tools/ — kód-ellenőrzés

A játék egyetlen `index.html`, benne egy ~33 000 soros inline `<script>`
blokkal. Nincs build-lépés, és ez szándékos: a fájl `file://`-ról is megnyílik,
a deploy egyetlen fájl másolása. Cserébe **nincs semmi, ami fordításkor
elkapná a hibát** — pedig a 33 000 sor EGY globális scope-on osztozik.

Ez a mappa ezt a hiányt pótolja, build-lépés nélkül.

## Használat

```bash
./tools/check.sh
```

Kilépési kód `0` = minden rendben. Érdemes minden érdemi szerkesztés után
lefuttatni, és **kiadás előtt kötelezően**.

## Mit néz meg

**1. Szintaxis** (`node --check`) — hiányzó zárójel, elrontott vessző. Ezt a
böngésző is elkapná, de csak futásidőben, a teljes játék megállásával.

**2. Nem létező globális** (`eslint no-undef`) — **ez a fontosabb.** Egy
elgépelt függvény- vagy változónév (`renderMilestone` a `renderMilestones`
helyett) betöltéskor semmilyen hibát nem ad; csak akkor derül ki, amikor a
felhasználó pont arra a gombra kattint. Egy ilyen hiba hetekig lapulhat a
kódban. Ez az ellenőrzés fordítás-szerű hálót feszít alá.

Kipróbálva: egy szándékosan elgépelt hívásra a szkript pontos sorszámmal
jelez, és 1-es kilépési kóddal áll meg.

## Amit szándékosan NEM néz

Stílust, formázást, `no-unused-vars`-t. A kód saját, tömör formázási nyelvet
beszél, és a hosszú magyarázó kommentárok is annak részei — egy „javítsd meg a
stílust" futtatás több kárt okozna, mint hasznot.

## A globálisok listája

A `eslint.config.mjs`-ben a böngésző-globálisok **kézzel** vannak felsorolva,
nem a `globals` csomagból jönnek: így a repónak nincs npm-függősége, és minden
felvett név tudatos döntés. Ha egy új böngésző-API-t kezdünk használni
(mondjuk `IndexedDB`), azt oda is fel kell venni — különben a `no-undef`
jogosan tiltakozik.
