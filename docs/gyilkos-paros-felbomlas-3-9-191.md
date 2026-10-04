# 3.9.191 — 🧲 A gyilkos páros felbomlik, ha egy tagja távozik · két névkör

> „A névjavaslatok mehetnek. Itt ha a páros valamelyik fele távozik a
> klubtól, akkor szűnjön meg a páros és nyissa meg a lehetőséget új páros
> építésére."

## 1. A hiba

A távozó ember párosa a tárban (`S.gpDuo`) maradt.

* **A hely nem szabadult fel:** kész párosnak számított, tehát elfoglalta a
  három hely egyikét (`gpDuoRoom`).
* **A bent maradt társ sem szabadult fel:** „már párosban van” maradt
  (`gpDuoInActive`).
* **A tagok soha nem szabadultak:** sem a hely, sem az ember.

A párkémia, a passzkémia és az összhang már eddig is felbomlott a
keret-takarításban (`pruneChemistry`); a gyilkos páros onnan kimaradt.

## 2. A szabály

**A keret-takarítás a gyilkos párost is felbontja** (`gpDuoPrune`). Ezen a
takarításon minden távozási út átmegy:

* eladás;
* elengedés;
* visszavonulás;
* a meccs előtti biztonsági háló.

| helyzet | mi történik |
|---|---|
| kész vagy összeért páros, egy tag távozik | a páros megszűnik, a hely felszabadul, a bent maradt ember újra párosítható |
| félkész (épülő) páros, egy tag távozik | a páros megszűnik, az „épül” jelölő törlődik, új párt választhatsz |
| mindkét tag távozik | a páros megszűnik |

**A napló kimondja:**

> 🧲 Felbomlott a gyilkos páros (összeért): A & B — A elhagyta a klubot.
> B újra párosítható, a páros helye felszabadult — a következő
> felajánlásnál új párost építhetsz.

**Ami megmarad:**

* **A sebesség:** a már kiegyenlített sebesség az emberé.
* **A mérföldkő:** a „klub történetében felépült párosok” mérföldköve nem
  csökken. A kész párosokat egy történeti tár (`S.gpDuoHist`) őrzi, a
  mérföldkő ebből és a mostani kész párosokból számol. A mentés ezt is
  viszi.

**Régi mentés:** a korábban, takarítás nélkül távozott tag párosa az első
takarításnál bomlik fel, és a mérföldkőben benne marad.

## 3. Két névkör (20 név)

A `tools/nevek/manual.py` a `JAVASLAT_3_9_191` blokkot kapta, ebből a
`build.py` újraépíti a táblát. A `kettozes.py` lefutott: nincs kettőzött
személy.

| játékos | eddig | most |
|---|---|---|
| Emerson Palmieri | Palmiri Imre | Pálmafás Imre |
| Djibril Cissé | Szisszé Dzsibrill | Sziszegő Dzsibrill |
| Marco Kurz | Kurc Márk | Kurta Márk |
| Garry Flitcroft | Flitkroft Geri | Flitteres Geri |
| Fabian Ernst | Érnst Fábián | Komoly Fábián |
| Manuel Gulde | Gúlde Manó | Gulyás Manó |
| Franck Kessié | Kesszié Ferkó | Késes Ferkó |
| Davide Calabria | Kalabria Dávid | Kalamáris Dávid |
| Damiano Tommasi | Tommazi Damján | Tamáskodó Damján |
| Duván Zapata | Szapata Ödön | Csapatos Ödön |
| Harry Kewell | Kjúúl Bálint | Kevély Harri |
| Dietmar Hamann | Hámann Menyhért | Hámozó Dietmár |
| Peter Crouch | Krúcs Péter | Kuporgó Péter |
| Vladimír Šmicer | Szmájszer Vladi | Smirgli Vladi |
| Johan Neeskens | Nyeskens Jancsi | Nyeszlett Jancsi |
| Robert Prosinečki | Prószinyecki Robi | Prózai Robi |
| Dejan Savićević | Szavicsevics Deján | Savanyú Deján |
| Predrag Mijatović | Mijatovics Predrág | Miákoló Predrág |
| Denis Law | Denéz Láv | Lávás Dénes |
| Antoni Ramallets | Rámajetsz Tóni | Ramazuri Tóni |

## 4. Próba

`tools/gyilkos-paros-felbomlas-3-9-191-proba.js` — lásd a `tools/README.md`-t.
