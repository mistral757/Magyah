# 🟠 A nyári kupa nem vár a társra, ha neki nincs nyári kupája (3.9.308)

## A kérés

> „Amikor csak egyik játékosnak van nyári kupa, akkor ne kelljen
> várakoznia a másik játékosra a kupa előtti screenen."

## Mikor fordult elő

Közös karrierben a nyári felkészülési kupa nevezése **egyhangú**. A gép a
„NYÁRI KUPA” várakozó képernyőn vár a társ nevezésére (`mpBothGate`, `nyk`).

A közös kupaprogramban ez rendben van: ott mindkettőtöknek ugyanaz a sorozat
jár. A hamarabb kiesőnek a 3.9.181 óta várakozás nélkül jár a nyári kupa.

**Az elakadás akkor volt, ha a kupanevezés szétvált.** Ez akkor történik, ha:

* valamelyikőtök nem várta meg a másikat a kupanevezésnél (`droppedApart`);
* vagy a társ egy másik sorozatba jutott.

Ilyenkor neked nyári kupa jár, a társad viszont a saját kupáját játssza, és
a nyári kupához legjobb esetben is csak egy egész kupasorozat után ér oda.

**Miért nem segített a régi védelem:**

* **A jelzőfény** csak azt látja, ha a társ egy *másik kapunál vár*. Ha
  közben kupameccseket játszik, nem jelez.
* **A 🛰 helyzetjelző** (`mpMateElsewhere`) csak a kupán *belüli* kapuknál
  dolgozott.

Így a „Nem várom meg” gomb maradt az egyetlen kiút, és az csak a türelmi idő
után jelent meg.

## A javítás

### Előzetes ellenőrzés

A nevezés előtt a gép megnézi a szobát (`mpNykTarsMashol`):

1. **A társ nyári nevezése már fent van** → a rendes, közös út dönt.
2. **A társ kupanevezésében sorozat áll** (nemzetközi, hazai vagy HSZ) → ide
   nem jön.
3. **A társ 🛰 helyzetjelzője szerint épp egy másik sorozatot játszik** →
   ide nem jön.

Ha a társ nem jön, a döntésed **azonnal**, várakozó képernyő nélkül
végrehajtódik:

* **igen:** egyedül indulsz, a saját mezőnyödben (`S.friendlySolo`, mint a
  3.9.72-es kiútnál);
* **nem:** kihagyod, és megyünk tovább.

A napló kimondja az okot. Például: „🟠 Nem kell a társadra várnod: a társad
idén a Kupák Kupájának Kupája indulója — idén nincs közös nyári torna.”

### Várakozás közben is

Ha jel nélkül a régi várakozás indul, de a társ közben kupát kezd, a kapu a
következő körben (~2,5 mp) magától továbbenged. Az új `tarsMashol` próba a
`mpBothGate` vázán fut.

### A szoba jelölése

A szobába `kulon:true` kerül. Ha a társ később mégis odaér a nyári kupához:

* **igennel** ő is egyedül indul;
* **nemmel** kihagyja.

Senki nem vár senkire (`mpNykResolve`).

### Hibatűrés

Hálózati gondnál (4 mp-es plafon) a régi út marad: inkább várunk, mint
tévesen szétválasztjuk a nyarat.

## Próba

`tools/nyari-kupa-nem-var-3-9-308-proba.js`, a játék helyi szoba-hátterén:

* a társ kupába nevezett: igennél azonnal, egyedül indul; nemnél azonnal
  kihagy; a szoba jelölése és a naplósor;
* a 🛰 helyzetjelzőből is;
* jel nélkül a régi várakozás, ami a társ kupakezdésére magától
  továbbenged;
* a már fent lévő nyári nevezés a közös út;
* a később érkező társ;
* nincs oldalhiba.

A kapcsolódó 36 PvP- és kupapróba zöld.
