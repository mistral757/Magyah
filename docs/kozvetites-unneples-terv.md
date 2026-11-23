# Terv — stadionos közvetítés, kameraállások, bajnoki és kupás ünneplés

> Kérés (2026-11-23): „hogyan lehetne jobban otthon érezni magunkat a meccs közvetítésben …
> látszódhatna a stadion, lehetnének kameraállások, kameraváltások … nem visszajátszásként, hanem
> kameraállások minden animációhoz, akár egy animáción belül is kameraváltás.” És: „Amikor
> megnyered a bajnokságot, kupát, annak megfelelő örömködéssel fejeződjön be a meccs … legalább egy
> 1 perces animáció … jelentős különbség a szintek között … stadion nézetes, oldalról, stadion
> háttérrel. Itt a stadion mérete is számítson. A lelátókon a csapat színei.”
>
> Ez TERV. Kód még nem készült belőle. A megvalósítás fázisokra bontva, egyenként jóváhagyva menne.

## 1. Mi van ma (amire építünk)

| Építőkocka | Hol | Mire jó a tervben |
|---|---|---|
| **Eseményjelenetek (EVA, 3.9.270-től)** | `evaPalya`, `evaFig`, `evaSkillSablon`, `evaAltSablon` … | 120×120-as SVG-színpad, WAAPI-mozgás, „bobblehead” figurák a valódi arccal és mezzel. Gól, védés, skill-, akció- és szinergia-jelenetek. Ezeket kell „kamerák elé” tenni. |
| **Izometrikus vetítés** | `fxP` (élő háttér, 3.9.202) | Méterben megadott pálya → képernyő. A kamera-modell első lépcsője. |
| **Arcok és mezek** | `faceSVG`, `facePixUrl` (gyorsítótáras), `jerseySVG`, `evaEllenfelKit`, `kitForNow` | A szereplők, a szurkolók mezszínei, a kupák színei. |
| **Stadion-adat** | `STAD_KAP` (3 000 → 120 000 fő, 12 fokozat), `stadionKap()`, `stadionNezo()` | A stadion mérete és telítettsége. A lelátó ebből épül fel. |
| **Klubarculat** | `teamColors()`, `identCrest()`, címer-SVG, mez | Lelátó-színek, molinók, tifó. |
| **Lelátó-hang** | `lelatoKorus`, `lelatoTaps`, `lelatoHullam`, `lelatoFuttykoncert`, `lelatoReag` | A kép mellé már van hang. A kamera és a hang egy ütemre jár. |
| **Divízió és kupa színei** | `pyrDivArculat` (1.0.11.10.00), `EURO_COMPS[k].col` | Az ünneplés „szintje” és díszlete. |
| **Ünneplés ma** | `showTrophyScreen` (`showChampionScreen`, `showMateChampionScreen`, `euroMaybeCelebrate`) | Statikus trófea-ablak. Ezt váltaná ki, illetve ezt előzné meg a jelenet. |
| **Kezdési időpont** | `fixtureKick(rnd)` → óra:perc | Esti meccs = villanyfény a jelenetben. |

## 2. A közvetítés: stadion-színpad és kamerák

### 2.1 Egy világ, sok kamera
- **A mostani út:** minden jelenet egy saját, rögzített nézetű rajz.
- **Az új alap:** egy közös **világ méterben**:
  - a pálya 105 × 68 m;
  - körülötte a lelátó-gyűrűk;
  - benne a szereplők és a labda (x, y, z koordinátával).
- **A kamera** csak egy vetítés: `{hol, hova néz, látószög/zoom, magasság}`.
- **A következmény:** ugyanaz a jelenet bármelyik kamerából lejátszható, és **egy jeleneten belül vágni** lehet a kamerák között. Ez a kérés lényege: nem visszajátszás, hanem élő rendezés.

### 2.2 A kameraállások (a mellékelt képek nyomán)
| Név | Hol áll | Mire jó | Kép, amire hasonlít |
|---|---|---|---|
| **Főkamera** | főlelátó, középen, magasan, ~25°-os dőlés | építkezés, a játék íve; ez az alapnézet | 4. (izometrikus, rácsos kerítés, lelátó) |
| **Kapu mögötti** | a kapu mögött, alacsonyan | büntető, szabadrúgás, lövés, védés | 1. (a büntetőrúgó háta mögül) |
| **Magas taktikai** | a kapu mögött, nagyon magasan | szöglet, beadás, fejes, felállás | 3. (pixeles, eredményjelzővel) |
| **Lelátó-totál** | a stadion sarka fölött, messziről | meccs eleje, félidő, ünneplés, hangulat | 2. (festői, tömött lelátók) |
| **Közeli** | a játékos előtt, mellmagasságban | a gólszerző, a hős, a kapitány | 5. (pixeles portré labdával) |
| **Pókkamera** | a pálya fölött, a labdát követi | kontra, szóló, Villám-futás | — |
| **Oldalvonali** | az oldalvonalon, alacsonyan | becsúszás, párharc, sárga lap | — |

### 2.3 A rendező (melyik kamera, mikor)
- **Felvétel-lista:** minden jelenet-sablon kap egy ilyet, például:
  - **gól:** Főkamera az építkezésre (1,2 s) → Kapu mögötti a lövésre (0,6 s) → Közeli az örömre (1,0 s);
  - **védés:** Kapu mögötti → Közeli a kapusra.
- **Vágási szabályok:**
  - a felvétel legalább 0,5 s;
  - vágás mozgásra;
  - a 180°-os tengely tartása (a csapatok iránya nem fordul meg);
  - ugyanazt a kamerát nem vágjuk önmagára.
- **A választás az esemény magjából jön** (mint ma a kapurács-cellánál). A meccs véletlenjéhez nem nyúl, és ugyanaz az esemény mindig ugyanúgy néz ki.
- **A tempó számít:**
  - 0,25× alatt teljes vágás;
  - gyorsabban kevesebb vágás;
  - a leggyorsabb tempón egy kamera.

### 2.4 A stadion az adatokból
- **Méret (`stadionKap`):**
  - ≤ 8 000: egy alacsony lelátó, fák, kerítés;
  - ≤ 35 000: két szint, tető;
  - > 65 000: három szint, zárt aréna, kivetítő;
  - 120 000: kolosszeum.
- **Telítettség (`stadionNezo / stadionKap`):** az üres székek látszanak. Egy rossz idény a lelátón is látszik.
- **Színek:**
  - a hazai tábor a klub két színében (sálak, zászlók, időnként tifó a címerrel);
  - a vendégszektor az ellenfél mezszínében.
- **Díszlet:**
  - reklámtáblák (a talizmán-szponzor logója);
  - a kupa színe a táblákon és a kezdőkörben;
  - esti meccsen villanyoszlopok és fénykúpok.
- **Téma szerint:**
  - a pixel-témában alacsony felbontású vásznon rajzolunk és felnagyítjuk (pixeles hatás, mint a 3–5. képen);
  - a többi témában sima rajz, a Reflektorban erős fényekkel.

### 2.5 Teljesítmény (telefonon is)
- **A lelátó egyszer rajzolódik meccsenként**, kameránként egy-egy háttérképbe. A lelátó a jelenet alatt nem mozog, csak „hullámzik”: egy olcsó réteg váltja az előre rajzolt képkockákat.
- **Csak a szereplők és a labda mozog:** ~12 figura, 30 képkocka/s.
- **Kikapcsolható:**
  - a mostani `fxAnimOff` kapcsoló;
  - a „kevesebb mozgás” rendszerbeállítás;
  - a jelenetszám-keret marad.
- **A mérés:** 4× CPU-lassítással (mint a 3.9-es mérésekben), a mintakészülék szintjén.

## 3. Az ünneplés (legalább 1 perc)

### 3.1 Mikor indul
- **Bajnoki cím:** `showChampionScreen`.
- **PvP:** a társ címe (`showMateChampionScreen`), visszafogottabb változat.
- **Kupagyőzelem:** `euroMaybeCelebrate`. Minden sorozatra: nyári felkészülési, Magor Kupája, KONF, OJK, KK, Hiper Szuper Kupa.
- **Egyebek:** a ki-ki meccs győzelme, a Run-cél bajnoksága.
- **Egyszer szól eseményenként:** a meglévő jelzők (`titleWonSeason` stb.) mellett egy újratöltés nem indítja újra.
- **Koppintásra átugorható:** a záró kártyára ugrik, a hangot rögtön lehalkítja.

### 3.2 A változók, amik a jelenetet adják
| Változó | Honnan | Hol látszik |
|---|---|---|
| **Kapitány** | `slots[captainIdx]` / `captainName` | ő emeli a trófeát, ő vezeti a sort |
| **A döntő sztárja** | a döntő meccsének legjobbja (meccs embere / gólszerző) | külön közeli, névfelirattal, a döntő góljának visszajátszásszerű *élő* újrarendezésével |
| **Aki húzta a csapatot** | a szezon meccs embere-listájának élén álló (`S.mvps`), illetve a gólkirály (`S.scorers` + kupa) | közeli, a szezon számaival |
| **Elsődleges csapatstílus** | az első stílus-slot | a koreográfia (lásd 3.4) |
| **Stadionméret és telítettség** | `stadionKap`, `stadionNezo` | a háttér, a tömeg, a hang hangereje |
| **Klubszínek, címer, mez** | `teamColors`, `identCrest`, `kitForNow` | lelátó, konfetti, molinók |
| **A sorozat** | `EURO_COMPS[k]` (szín, név), illetve a divízió (`pyrDivArculat`) | trófea alakja és színe, díszlet |
| **Az idény mérlege** | GY-D-V, pont, gólok, a Run rögzülése | a záró kártya |

### 3.3 Szintek, mert „legyen jelentős különbség”
| Szint | Esemény | Hossz | Díszlet |
|---|---|---|---|
| 1 | nyári felkészülési kupa, D6 cím | ~60 s | kis lelátó, pár száz néző, asztal a trófeával, kézfogások, egy pezsgő |
| 2 | D5–D4 cím | ~65 s | kis pódium, konfetti a klubszínekben |
| 3 | D3 cím, Magor Kupája | ~70 s | pódium ívvel, konfetti, tűzijáték-előzetes |
| 4 | D2 cím, KONF | ~75 s | színpad, konfetti-ágyúk, füstgránátok a lelátón a klubszínekben |
| 5 | D1 bajnokság, OJK | ~85 s | nagyszínpad, tűzijáték, a stadion összes fénye, tiszteletkör |
| 6 | KK, D0 Korona | ~95 s | aréna-show, kivetítős összefoglaló, kapitány a vállakon |
| 7 | Hiper Szuper Kupa, D−k Kozmosz | ~110 s | mindez + éjszakai fényshow a kupa lila színében, buszos felvonulás a zárásban |

Minden szint új elemet *ad hozzá*. A trófea nagysága, a konfetti mennyisége, a tömeg sűrűsége és
a zene hangszerelése szintről szintre nő.

### 3.4 A forgatókönyv (alapváltozat, ~70 s)
| Idő | Jelenet | Kamera |
|---|---|---|
| 0–6 s | lefújás: a játékosok egymásnak rohannak, a kispad kifut, a lelátó feláll | Főkamera → Lelátó-totál |
| 6–16 s | **A hősök**: a döntő sztárja, a húzóember, a gólkirály, névvel és számokkal | Közeli × 3 |
| 16–24 s | **A szurkolók**: tifó a címerrel, sálak, füst a klubszínekben (szint szerint) | Lelátó-totál |
| 24–32 s | a pódium felépül (a szint díszlete) | Magas taktikai |
| 32–42 s | **a sor**: a játékosok egyenként, a legfiatalabbtól a kapitányig, érmekkel | Oldalvonali |
| 42–52 s | **A TRÓFEAEMELÉS**: a kapitány; konfetti, tűzijáték (szinttől) | Közeli → Lelátó-totál (daru) |
| 52–62 s | **a stílus koreográfiája** (lásd lent), az edző feldobása | Pókkamera |
| 62–70 s | záró kártya: az idény mérlege, a Run-rögzítés (ha volt), „Tovább” | — |

**A stílus koreográfiája:**
- **Tiki-Taka:** passzkör a trófea körül.
- **Gegen:** sprint a szurkolókhoz, letámadás-mozdulat.
- **Beton:** fal-fotó, összekapaszkodva.
- **Villám:** tiszteletkör vágtában.
- **Panzer:** az edző a vállakon.
- **Harmónia:** körtánc.
- **Sztár:** a sztár egyedül a reflektorban.
- **Bombázók:** „lövöldözés” konfetti-ágyúkkal.

### 3.5 Hang
A meglévő lelátó-hangmotor viszi:
- kórus a lefújásra;
- taps-hullám a sorra;
- a trófeaemelésnél a csúcs;
- a téma hangszerelésében egy rövid győzelmi dallam (a `hangZene…` motorral).

## 4. Fázisok (mindegyik külön verzió, próbával)
1. **Stadion-keret**:
   - a világ- és kamera-modell, a lelátó a stadion adataiból (méret, telítettség, színek, éjszaka);
   - 3 kamera: Főkamera, Kapu mögötti, Lelátó-totál;
   - a mai jelenetek változatlanul *ebben a keretben* futnak.
   - Kis kockázat, azonnal látható.
2. **Rendező**:
   - a gól-, védés- és lövésjelenetek világ-koordinátákra;
   - felvétel-listák, vágás a jeleneten belül;
   - Közeli kamera.
3. **Ünneplés v1**:
   - a forgatókönyv, a változók, a 7 szint;
   - átugrás, záró kártya, hang.
4. **Bővítés**:
   - Pókkamera és Oldalvonali kamera;
   - a skill-, akció- és szinergia-jelenetek átültetése;
   - lelátó-reakciók (hullám, füst, futtykoncert-kép);
   - időjárás.
5. **Finomítás**: a pixel-téma saját felbontása, teljesítménymérés gyenge telefonon, beállítások (kamera-gyakoriság, ünneplés hossza).

A mentés nem változik (csak „ezt már láttad” jelzők). A PvP-ben a jelenetek helyiek: kozmetikák,
nincs mit szinkronizálni.

## 5. Mi segítene ehhez
- **Artifactok (most is elérhető):**
  - egy önálló **„kameralabor”** oldal: csúszkákkal állítható kamera, stadionméret, telítettség, klubszínek, nappal/éjszaka;
  - ezen a telefonodon is jóváhagyhatod a szögeket, mielőtt a játékba kerülnek;
  - ugyanígy egy **ünneplés-előnézet** szintenként.
- **Videós ellenőrzés:** a környezetben futó Playwright felvételt tud készíteni a jelenetekről. Ezeket elküldhetem előnézetnek, mielőtt beépülnek.
- **Képek tőled:** a 5 mellékelt kép jó irányt ad. Ami még segítene:
  - 2–3 kedvenc stadion **oldalnézetből**;
  - ha van, egy **pixeles sprite-lap** (játékos-pózok), ha kézzel rajzolt stílust szeretnél.
  - Saját grafikai generátorom nincs, ezért kód-rajzolt (SVG/canvas) elemekkel dolgozom, ahogy eddig is. Az illik a játék „nincs külső fájl” szabályához.
- **Connectorok:**
  - nem kell új;
  - a Google Drive (már elérhető) jó lehet egy közös referencia-mappához, ha sok képet küldenél;
  - ha van Figma-terved, a Figma-connector segítene, de nem szükséges.
- **Skill:** érdemes lenne egy **projekt-skillt** írni (`.claude/skills/jelenet/`), ami leírja:
  - az EVA- és kamera-motort;
  - a jelenet-sablonok szabályait;
  - a verziózást és a próbák mintáját.
  - Így a jövőbeli munkamenetek gyorsabban beállnak, és következetesebb lesz a sok jelenet.
