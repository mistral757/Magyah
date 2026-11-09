# 🎽 Több szerep egy emberen + rögzített stílus-váltó (1.0.6.2.00)

## A kérés

> „A harmadik csapatstílus megnyitásától legyen lehetőség arra, hogy összesen
> 3 játékosod 2 szereppel is rendelkezhessen. A 4. csapatstílustól pedig 5
> rendelkezhet 2-vel, 1 pedig akár 3-mal. […] A csapatstílus menünél a
> csapatstílus jelvények, amikkel lehet köztük váltogatni, legyenek rögzítve
> az oldal tetején."

## A szabály

| stílusok | többes szerep |
|---|---|
| 1–2 | egy ember egy szerep (a régi szabály) |
| 3 | legfeljebb **3** ember visel 2 szerepet |
| 4+ | legfeljebb **5** ember visel 2 vagy több szerepet, közülük **1** akár 3-at |

- **Egy stíluson belül** továbbra is egy ember egy szerep. A filozófia három
  feladata három embert kér, a többes szerep a filozófiák *között* nyílik.
- **Ha a keret betelt**, a régi út él: az új szerep elveszi a játékos többi
  szerepét. Ezt egy naplósor ki is mondja, hogy semmi ne tűnjön el némán.
- **A gazdát cserélő szerep** a régi viselőjétől lekerül. Ha ezzel annak a
  többes helye felszabadul, azt a korlát már a döntésnél beszámítja.

## A motor

Nem kellett hozzányúlni. Minden szerep-hatás `roleOf(kulcs)===név` alapon
kérdez, a kiosztás pedig kulcs → név tábla (`S.roles.map`), így egy név több
kulcs alatt is állhat. Az „egy ember egy szerep” szabályt eddig csak a
`roleAssign` kényszerítette ki. Most ott ül a `roleMultiOk` korlátja is.

A meccs-statisztika szerep-csatornái (`mstatRoleCh`) minden szerepet
összeadnak.

## A felület

- **A játékos lapja:** a 3. stílustól a viselt szerepek listája, mindegyik
  ✕-szel levehető, és egy „újabb szerep hozzáadása” legördülő. Egyetlen
  lehetőségnél (betelt keret) a sor maga mondja meg, hogy a többit leadja.
- **A keretlista:** minden szerep külön jelvényt kap.
- **A szerep-szakasz** a nézett stílus szerepeit sorolja. Eddig minden stílus
  blokkja az *összes* stílus szerepét ismételte. A többes keret állása kiírva.
- **A stílus-váltó sor** sticky: egy sorban, tömören (ikon, név, szint), a
  fölötte ragadó fejlécek alá mérve (`styleViewBarTop`).

## Próba

`tools/tobbes-szerep-1-0-6-2-00-proba.js`: 2, 3 és 4 stílus, a stíluson
belüli szabály, a felszabaduló hely, a motor, a jelvények, a szakasz és a
sticky sor. 15 állítás.
