# ✏️ Stylist-névcsere és 🔗 a Szinergia mentése (1.0.7.2.00)

## 1. A Szinergia nullázódása (hiba)

> „A szinergia választásom időről időre automatikusan törlődik és a rá költött
> pontok is nullázódnak."

**Az ok.** A `saveGame` csak a kifejezetten felsorolt `S`-mezőket menti.
Az 1.0.6.3.00-ban bevezetett `S.szin` kimaradt ebből a felsorolásból. Ez a
mező tartja a választott párt, a megvett szintet és az idényes váltást.
Minden újratöltés üres Szinergiával indult. A szintekért levont
csapatstílus-pont viszont rendben elment (az `S.ms`-ben), ezért tűnt úgy,
hogy a pontok is elvesznek.

**A javítás.** A `szin` bekerült a mentésbe. Egy átfésülés után vele együtt
ezek is, mert ugyanígy kimaradtak:

| mező | mit véd |
|---|---|
| `vl0Asked` | a Villám korai ajánlata ne ugorjon fel újra |
| `akcGol` | az akció-gólok számlálója |
| `talOff`, `talDuelOff` | a talizmán kikapcsolása megmaradjon |
| `svPhJelzett` | a párharc-nap jelzése egyszer jöjjön |
| `fanTrophySeason`, `lgKingSeason`, `leagueAwardCount`, `saleKupaJel` | idényes jutalmak őrei: újratöltés után ne fizessenek kétszer |

**Amit nem lehet visszahozni:** a már elveszett Szinergia-szinteket. A
mentés semmilyen nyomot nem őrzött arról, mennyit költöttél rájuk.

## 2. A stylist névcseréje

> „A szutykos stylist vagyok funkciói közé vegyük fel, hogy ők a játékos
> adatlapnál módosíthatják az adott játékos nevét, amivel a globális
> névlistában is megváltozik a játékos neve. Azaz a html-be egy védett listába
> lesz feltöltve az, amit ő azon változtat."

### A felület

- Stylist-módban a játékos-adatlapon a név mellett ✏️ gomb jelenik meg.
- A gomb egy ablakot nyit. A beírt név a **közös névlistára** kerül.
- Üresen hagyva, vagy az alapnevet beírva a közös név törlődik.

### A rétegek

A megjelenítés határán dől el, melyik név látszik. A kanonikus név, a mentés
és a közös világ kulcsa nem változik. A rétegek erősorrendben:

1. a saját névszerkesztő átírása (`huUserName`), csak a saját böngészőben;
2. a stylist helyi rétege (`stylistNev30_0`): azonnal hat a stylist gépén;
3. **a védett lista (`NEV_ALAP`)**: a `NEV-ALAP:KEZD … NEV-ALAP:VEG`
   jelölők közé a napi beépítés írja. Mindenkinél ez az alapértelmezés;
4. a beépített magyarítás (`HU_NAME_TABLE`).

A 2. és a 3. réteg csak magyarított módban él. A valós nevek módja
érintetlen. A rövid alak a névből jön: magyar játékosnál az első, egyébként
az utolsó szó.

### A feltöltés

- A feltöltés a kinézetekkel közös sorban megy: `stylist/<uid>/<kulcs>`.
- A bejegyzés jellemzői:
  - `v:3`;
  - a név `nev:` előtaggal kerül be;
  - a kulcs a `nev:<kanonikus>` hash-e;
  - `d = {"f":"<új név>"}`, vagy `""` a törléshez.
- Kapcsolat nélkül a feltöltés sorban áll.

### A szabály (a játékban és a beépítésben azonos)

- 2–40 karakter, legalább egy betű.
- Vezérlőjel és HTML-jel (`< > & " ' \` \ { }`) nem lehet benne. Ilyenkor
  a név **elutasítva**, nem csendben megcsonkítva.
- Nem egyezhet egy MÁSIK játékos megjelenített nevével.
- Csak a közös listán szereplő játékos írható át. Az akadémiai vagy
  generált nevek a saját névszerkesztőben írhatók át.

### A napi beépítés (`tools/stylist/beepit.js`)

- Csak létező kanonikus név és helyes kulcs kerül át.
- Nevenként a legfrissebb bejegyzés dönt.
- Ütközésnél az időben korábbi foglalás nyer.
- A beépített magyarítással egyező név törlést jelent.
- Legfeljebb 5000 név.
- A GitHub Action (stylist-szinkron) változatlan: ugyanaz a futás most a
  neveket is beírja.

## Próba

`tools/stylist-nev-szinergia-1-0-7-2-00-proba.js`:

- a Szinergia és a jelzők túlélik a mentést és a valódi visszatöltést;
- a ✏️ csak stylist-módban jelenik meg;
- az azonnali hatás és a rövid alak;
- a sorba állás;
- a szabályok és az ütközés;
- a valós nevek módja érintetlen;
- a törlés;
- a beépítés hamis, rossz kulcsú és ütköző feltöltéssel, idempotensen;
- a beépített listával a név stylist nélkül is él.

A `mez-stylist-3-9-320` próba ettől függetlenül már korábban is piros volt.
Oka, hogy a beépített mez-tábla azóta megtelt, és a próba elvárásai
elavultak.
