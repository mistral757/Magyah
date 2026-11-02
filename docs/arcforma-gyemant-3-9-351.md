# 3.9.351 — a gyémánt (rombusz) arcforma kivéve

> „A rombusz fejformára nincsenek ráillesztve a hajak. Vagy vegyük ki ezt a
> fejformát, vagy oldjuk meg az illeszkedést. Amelyik egyszerűbb."

**A választás: kivétel.** A gyémánt forma homloka keskeny (0,6). Minden
frizura a normál homlok-szélességre rajzolódik, ezért a haj lelógott róla.
Az illesztéshez mind a 37 frizurát a homlok-szélességhez kellene igazítani.
A kivétel egy helyen elintézhető, és a többi arcot nem érinti.

**Mi változott:**

* **A szerkesztő** nem kínálja a gyémánt formát; 8 választás marad:
  „eredeti” + 7 forma.
* **A véletlen sorsolás** (a gépi arcok és a pörgetés) nem adja.
* **Ahol mégis gyémánt állna** (régi mentés, közös kinézet-lista, a név
  szerint generált arc), ott a hozzá legközelebbi, hegyes állú **szív alakú**
  forma rajzolódik. A szerkesztő ezt jelöli ki.
* **A többi arc betűre ugyanaz marad.** A forma sora a tömbben megmaradt,
  így egyetlen sorszám sem csúszott el.

**Próba.** Új: `tools/arcforma-gyemant-3-9-351-proba.js`:

* 4000 generált arc között nincs gyémánt, a többi forma megvan;
* a régi gyémánt beállítás szív alakúként rajzolódik;
* a szerkesztő nem kínálja.

Igazítva: `arc-stylist-3-9-315` (7 különböző fej; az Arcforma sor 7.
lépése a szív alakú).
