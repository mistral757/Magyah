# 3.9.198 — 🗞️ A lap tudja, hány piros lap volt, és hány gólt lőtt valaki

> „Ezek az újság cikk leadek is legyenek javítva a kiállítások száma szerint.
> Amikor pedig valaki 3+ gólt lő, akkor az is már ne mesterhármasként legyen
> emlegetve, hanem rendesen, említve a konkrét gólszámot, magyar betűkkel
> kiírva, nem számmal. Akár lehet »mesterötös«, és hasonlók is"
> (képernyőkép: 5:0, három kiállítás — a cím „Tízen is legyőzték", a lead
> csak kettőt említett)

## 1. A kiállítások

**A meccs extrái között a kiállítás EGY sor**, a számával és minden névvel:

> 🟥 Három kiállítás: Kaviár, Belözolu, Skolasztikus

* **A lead (3★-tól) is ezt a sort viszi**, tehát mindhármat említi. Eddig
  soronként egy kiállítás volt, és a lead csak az első kettőt vette át.
* **A cím a valódi létszámot mondja:**

| helyzet | cím |
|---|---|
| 1 kiállítás, győzelem | „Tízen is legyőzték: … emberhátrányban is nyert” · „Piros lap ide vagy oda — …” |
| 3 kiállítás, győzelem | „**Nyolcan** is legyőzték: … **háromemberes** hátrányban is nyert” · „**Három piros lap** ide vagy oda — …” |
| 2 kiállítás, vereség | „**A két piros lap** mindent elrontott: vereség … ellen” |

## 2. A 3+ gól

**Az extra a valódi gólszámmal, betűvel:**

> 🎩 Mesterötös: Égerfás — öt gól

**A címek sablonjai:**

* „Égerfás **mesterötöse** — …”
* „**Öt gól** egy estén: Égerfás egymaga eldöntötte a meccset” (új)
* „**Ötször** Égerfás! …”
* „»Megállíthatatlan« — a szurkolók Égerfás **mesterötösét** ünneplik”

**A sorozat 3-tól 10 gólig:** mesterhármas · mesternégyes · mesterötös ·
mesterhatos · mesterhetes · mesternyolcas · mesterkilences · mestertízes.
A ragozott alakok (-a/-e, -át/-ét, -szor/-szer) táblázatból jönnek, mert
lexikálisak („hármas”, de „hatos”).

* **Az extra súlya** a gólszámmal nő, így egy mesterötös erősebb cikket ér,
  mint egy mesterhármas.
* **A profil lépcsője** „Mesterhármas vagy több (3+ gól)” néven fut, mert ez
  minden 3+ gólos egyéni estét számol.

## 3. Apró javítás

A leadben a felkiáltójellel záruló fokozat után nem jön még egy pont: eddig
„felfoghatatlan!.” állt, most „felfoghatatlan!”.

## Próba

`tools/sajto-gol-piros-3-9-198-proba.js` — a valódi `mVerdictEnrich` és
`pressHeadline` a bejelentett esettel (5:0, három kiállítás), egy ötgólos
estével és egy kétpiros vereséggel.
