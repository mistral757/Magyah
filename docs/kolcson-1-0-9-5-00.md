# 🔄 1.0.9.5.00 — A kölcsönjátékos tényleg kölcsön

## A kérés

> „Az 1.0.9.3.00 scout gyengítős commitját érvényesítsük a három
> kölcsönjátékos érkezett átigazolási eseményre is. Ezek is túl erősek.
> Plusz ezek a kölcsönjátékosok legyenek tényleg azok, amiknek mondják
> magukat. Legyen rajtuk, nevük mellett egy számláló. 15 forduló és 2. szezon
> közötti időtartamra jön mindegyik, külön külön sorsolva. Kell nekik bért
> fizetni, ha nem kapnak elég játékpercet, akkor elmennek, nem lehet őket
> eladni. Egyetlen opció van, vissza lehet küldeni a kölcsön klubhoz 0 Ft-ért.
> Vagy megtartani a kölcsön végéig és játszatni."

## Az erő

Az esemény (`applyTransfer` → `loan3`) eddig a `findReplacement`-ből húzott:
a teljes világ-poolból, egyenletesen, csak a posztra szűrve, a kereted
szintjétől függetlenül. A bejelentésnél ezért jöttek 221–235-ös kölcsönösök
egy 191-es nyers erejű kerethez.

Mostantól a `kolcsonJelolt` a scout felfedezési sávjából (`discoveryBand`)
húz, a poszton belül. Ebben benne van az 1.0.9.3.00-ás, a nehézséggel növekvő
húzás a kereted nyers ereje felé. A scout-célzás itt nem szól bele.

Mérve, 9.2-n, egy lemaradó kerettel:

| húzás | átlag |
|---|---|
| a régi (egyenletes) | 78 |
| az új | 64 |

Az új húzás minden alkalommal a sávon belül maradt.

## A kölcsön

A kölcsön-állapot az `S.kolcson` (`{v:1, list:[{n, left, total, perc[]}]}`),
és a mentés viszi.

- **Időtartam:** játékosonként külön sorsolva 15–60 bajnoki forduló (két
  idény). A szerződés az érkezéskor (`markArrived`) jön létre, így a
  várólistáról később érkező is megkapja. A számlálót **csak a bajnoki
  forduló** fogyasztja, a kupa- és osztályozó-meccs nem.
- **Számláló:** a HUB-sorban a név mellett „🔄 kölcsön · N ford.” felirat áll.
  Pirosra vált, ha a következő meccsen visszahívhatják.
- **Bér:** a pályára lépők bérét a meccs-elszámolás amúgy is levonja. A
  kölcsönjátékosé **akkor is jár, ha nem lépett pályára**: ugyanaz a
  bérszámítás és plafon (`wageBill`), külön naplósorral.
- **Játékperc:** az utolsó 6 meccsén (kupameccs is) legalább 180 perc kell,
  ami a lehetséges harmada. Ha ennyi nincs meg, a klubja visszahívja. Egy
  meccsel előtte figyelmeztetés jön.
- **Nem adható el.** Nem vihető piacra, és edzői állás sem ajánlható fel
  neki. Az eladás a motor szintjén is tiltott (`reason:"kolcson"`).
- **Egyetlen művelet a visszaküldés:** „↩ Visszaküldés a kölcsönadó klubhoz —
  0 Ft”, megerősítéssel. Pénz nem jár érte, és a bére is megszűnik.
- **Lejárat:** a számláló végén a játékos visszamegy. Ha a kezdőben áll, a
  helyére a szokásos pótlás lép, mint minden elengedésnél. A visszament
  játékos a világ piacán újra elérhető.

## Próba

`tools/kolcson-1-0-9-5-00-proba.js`:

- **Az erő:** a scout-sávban marad, és jóval a régi húzás alatt.
- **Az érkezés:** három kölcsönjátékos, mindegyiknek 15–60 fordulós
  szerződéssel; a számláló a HUB-ban.
- **Eladás:** nem adható el, és nem vihető piacra.
- **Bér:** pályára lépés nélkül is levonódik.
- **Számláló:** a bajnoki forduló fogyasztja, a kupa nem.
- **Játékperc:** figyelmeztetés, majd visszahívás.
- **Lejárat:** a számláló végén visszamegy.
- **Visszaküldés:** ingyenes és azonnali.
- **Mentés:** a kölcsön-állapot megmarad.
