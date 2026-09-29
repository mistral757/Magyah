# 3.9.167 — 🎻 A lágy hangzás, témánkénti hangulattal

> „legyen olyan is, ami illik a nem pixelated témánkhoz is? Én valami
> immerzív, de azért könnyed, instrumentális témát gondolnék, ahhoz illő
> alkalmazáshangokkal. És akkor a témaváltó a zenei témát is automatikusan
> váltaná" — „Mehet az A, témánkénti hangulatokkal!"

## Két hangzás, egy motor

A 3.9.163 chiptune-ja (négyszög, háromszög, 8 bites zaj) mostantól a
**Pixel** témáé. A másik három téma a **lágy** hangzást kapja. A motor
közös: ugyanaz a 16-od lépéses lejátszó és ugyanaz a szöveges kotta szól,
csak más hangszereken, valódi zengetővel. **Továbbra sincs egyetlen
hangfájl sem**, és offline is szól.

| téma | hangulat | dallam | kíséret | basszus | dob |
|---|---|---|---|---|---|
| Sötét-arany | **Mozi** | elektromos zongora (FM) | lebegő pad-akkordok, csengő | mély szinusz | puha lábdob, halk shaker |
| Törtfehér | **Napos** | kalimba | puha marimba-akkordbontás (3.9.169 óta; előtte gitár) | kerek basszus | lábdob, shaker, peremütés |
| Noir | **Füstös jazz** | vibrafon | zongora-akkordok a 2. és 4. ütésre | kerek walking-basszus (3.9.169 óta; előtte pengetett nagybőgő) | ride, seprű, swing |
| Pixel | Chiptune | — a 3.9.163 szerint — | | | |

**A beállítás.** A Beállítások → Hang és zene alatt új választó van:
**Hangzás**.

* Alapból **automatikus**: a színtémát követi.
* Kézzel is rögzíthető („lágy” vagy „chiptune”). A lágy Pixel témán a Mozi
  hangulattal szól.
* Témaváltáskor a futó menüzene **azonnal** átvált a másik hangszerelésre.
* A „Most:” sor kiírja, mi szól éppen.

## A hangszerek (mind kódból)

* **Elektromos zongora:** FM-szintézis. A modulátor indexe fél másodperc
  alatt lecseng, ez adja az ütés után kitisztuló hangot.
* **Csengő / cseleszta:** nem harmonikus felhangokkal (2,76×, 5,4×).
* **Kalimba.**
* **Vibrafon:** tremolóval.
* **Pad:** két, egymáshoz képest elhangolt fűrészhullám, lassan nyíló
  szűrővel.
* **Pengetett húr (gitár, nagybőgő):** Karplus–Strong. Egy simított
  zajimpulzus köröz egy hangmagasságnyi késleltetőben. Hangonként egyszer
  számolódik, utána gyorsítótárból szól.
* **Zengető:** buszonként egy konvolver, kódból generált, 2,4 mp-es
  lecsengéssel. A hangerő-csúszka rá is hat.
* **Dobok:** puha lábdob, shaker, peremütés, seprű, ride.

## Új szerzemények

A három menüdal (Öltözői főcím, Taktikai tábla, Meccsnap) lágy változata új
kotta. Lassabb (76–100 bpm), levegősebb dallam, négyhangú (szeptim)
akkordokkal:

* **Főcím:** Fmaj7 – G6 – Em7 – Am7;
* **Taktikai tábla:** Dm7 – B♭maj7 – Fmaj7 – Cmaj7;
* **Meccsnap:** Gmaj7 – Em7 – Cmaj7 – D6.

A nyolc csapatstílus dallama és szignálja a saját kottájával szól,
visszafogottabb tempón. A hármashangzatok automatikusan szeptimet kapnak
(Napos hangulatban szextet).

## Az alkalmazáshangok

Mind a 23 hangeffektnek van lágy párja:

* **A sípszó marad valósághű:** az a pályáról jön, nem a felületből.
* **Lelátó-moraj** szól a gólnál.
* **A felület hangjai puhák:** a kattintás halk fakoppanás, az értesítés
  üvegcsengő, a pénz csilingelés, a talizmán-húzás suhanás és csengő.
* **A dallamos jelzések a hangulat hangszerén szólnak** (csengő / kalimba /
  vibrafon): gól, győzelem, lapok, VAR, mesterhármas.

## Hangerő — mérve

Offline hangkártyán, a „Főcím” 24 másodpercén:

* **A hangulatok egymáshoz:** a pad nélküli két hangulat eleinte a Mozi
  hangerejének ~40%-án szólt, ezért hangulatonként saját erősítő kapott
  kiegyenlítést.
* **Torzítás ellen:** a pengetések tüskés tranziensei miatt a Napos csúcsa
  1,4 volt, ami telefonon torzított volna. Most simított gerjesztés és egy
  szelíd kompresszor fogja meg.
* **Az eredmény:**
  * a három hangulat 1,5 dB-en belül van (a próba 3 dB-et enged);
  * a csúcs mindenhol 0,75 alatt;
  * a lágy zene ~2 dB-lel halkabb a chiptune-nál, szándékosan: „könnyed”.

## Próba

`tools/hangtema-proba.js` (port 9201, 21 állítás). Méri:

* az automatikus és a kézi választást;
* a táblák teljességét;
* offline hangkártyán hangulatonként: a dalok és a 23 effekt szól, nem
  torzít, nincs NaN; a stílus-dallamok és -szignálok szólnak;
* a hangerő-illesztést;
* a beállító ablakot;
* élő hangkártyán a témaváltáskori zenecserét.

## 3.9.169 — a gitár kikerült

> „a két olyan zenei téma, amiben gitár is van, az nagyon nem jó. A gitárt egy
> az egyben vegyük ki belőle. Nagyon agresszív."

A pengetett húr (Karplus–Strong) mindkét érintett hangulatból eltűnt, a
húr-motorral együtt.

* **Napos:**
  * a gitár nyolcados akkordbontása helyett puha marimba szól **negyedekben**,
    fel-le hullámzó sorrendben: nyugodtabb, nem pörög;
  * a pengetett basszus helyett kerek basszus szól.
* **Füstös jazz:**
  * a walking-basszus vonala marad (alaphang, terc, kvint, félhangos
    rávezetés), de a pengetett nagybőgő helyett kerek, pengetés nélküli
    hangon;
  * ez egy szinusz 15 ms-os lágy indítással, plusz halk második-harmadik
    felhanggal, hogy telefon-hangszórón is hallható maradjon.
* **Hangerő:** a három hangulat 0,8 dB-en belül van egymáshoz, a csúcs 0,77
  alatt.
* **Próba:** a `tools/hangtema-proba.js` őrzi, hogy gitár (pengetett húr)
  egyik hangulatban se szóljon.
