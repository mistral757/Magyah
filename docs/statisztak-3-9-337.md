# 👥 Statiszták helyett a mi játékosaink az animációkban (3.9.337)

## A kérés

> „Azokban az animációkban, amelyeknél a mi játékosainkat statiszták veszik
> át, azokba építsük be, hogy vagy érintett, vagy random, de a mi
> játékosaink legyenek ott. Pl. gegenpressing nyomás gólja, gólzsák gólja,
> remek kijátszás passza stb."

## Ami eddig volt

Egy jelenetben eddig csak két saját figura volt valódi játékos: a
főszereplő (a gólszerző, a szerelő, a lapot kapó) és a kapusunk. Minden
többi saját figura egy helyőrző névből kapta az arcát:

* „Társ";
* „Társ2";
* „Rúgó";
* „Támadó";
* „Védő".

Vagyis egy idegen arc állt a mi mezünkben.

Ez a következő esetekben volt a leglátványosabb:

* a letámadásos gól két rohanó társánál;
* a tiki-taka négy passzolójánál;
* a szöglet és a szabadrúgás figuráinál;
* a kapott gólnál a mi védőnknél;
* az ellenfél kapusának bravúrjánál a mi lövőnknél.

## Ami most van

Minden saját figura a kezdő tizenegyünkből jön, egy helyen (`evaKontextus`),
így minden jelenetre egyszerre hat:

1. **Előbb az érintett.**
   * A gól sorában zárójelben álló gólpasszadó, például
     `GÓL! Messi (Xavi)`.
   * Az esemény második szereplője (`p2`).

   A tiki-takában a gólpasszadó a **passzoló** figurája, a többiben az első
   társ.
2. **Utána a poszthoz illő társak.**
   * Támadásban az elöl játszók: CS, ÁÉ, szélsők, TKP, KKP.
   * Védekezésben a hátsó sor: KV, JV, BV, VKP, KKP.
   * Ha ezek elfogynak, a többi mezőnyjátékos.
3. **Rögzített mag.** A sorrend az eseményből képzett magból jön. Ugyanaz a
   jelenet mindig ugyanazokat mutatja, és a meccs véletlenjéhez nem nyúl.

**Kik nem ismétlődnek:**

* a főszereplő;
* a skill gazdája;
* a kapus;
* egy jeleneten belül senki sem áll két helyen.

**Ha nincs elég saját játékos** (például üres keret egy próbában), a régi
helyőrző marad. A jelenet ilyenkor sem omlik össze.

**Az ellenfél figurái** továbbra is névtelenek. Az ő keretüket a játék nem
vezeti.

## Próba

`tools/statisztak-3-9-337-proba.js` (12 állítás):

* gólnál a gólpasszadó a társ;
* a stáb csupa saját mezőnyjátékos, ismétlés nélkül, gólszerző és kapus
  nélkül;
* a társ2 és a rúgó sem helyőrző;
* rögzített mag;
* letámadásos gólnál elöl játszók;
* tiki-takánál a passzoló a gólpasszadó;
* kapott gólnál hátsó sorbeli védő;
* az ellenfél kapusának bravúrjánál saját lövő;
* üres keretnél hiba nélkül a régi helyőrző;
* nincs oldalhiba.
