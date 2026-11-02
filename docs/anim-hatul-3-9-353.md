# 3.9.353 — animációk: a támadók háttal, a védők szemben

> „Az aktuálisan védekező játékosok minden esetben előröl kell látszódjanak,
> ők a képzeletbeli kamerával mindig szemben vannak. A támadók is szerintem
> kezdjenek mindig szemben, és miután megkapták a labdát, azután forduljanak a
> kapu felé. […] Ha bonyolult megoldani, legyen egyszerűen ennyi: támadók
> háttal, védők szemben."

## Mi volt eddig

A „hátulról” nézet **minden** figurára hatott, a védőkre és a kapusra is.
Ők viszont a kapu előtt a kamerával szemben állnak, így nem háttal kellene
látszaniuk.

## Mi van most

A kamera a támadók mögött áll, és a kapu felé néz.

| Figura | „Hátulról” nézet | „Elölről” nézet |
|---|---|---|
| a támadó oldal: lövő, társak, rúgó, passzoló, a skill gazdája | **háttal** (tarkó, a háton a mezszám) | szemben |
| a védekező oldal: védők, sorfal, **kapus** | **szemben** | szemben |
| bíró, buszsofőr, lapot kapó, sérült | szemben | szemben |

* **Kapott gól:** az ellenfél támadói háttal, a mi védőink és a kapusunk
  szemben.
* **Saját kapusunk bravúrja:** az ellenfél lövője háttal, a kapusunk szemben.
* **Az arculat gombjának új felirata:** „Támadók hátulról — tarkó, a háton a
  szám; a védők és a kapus szemben”.
* **Pixeles arcoknál** a kezdőrúgás előtti előkészítés mindkét változatot
  elkészíti: szemből a védekező, háttal a támadó jelenethez.

## Amit most nem csináltam

A javasolt teljes változatot: a támadó szemben kezd, és a labda átvétele
után fordul a kapu felé. Ehhez jelenetenként követni kellene, mikor ér a
labda az egyes figurákhoz, és ott cserélni a fejet. Ez minden jelenet
időzítését érinti. A kérés szerinti egyszerű szabály él. Ha kell a
fordulás, külön megcsinálom.

## Próba

`tools/mez-jel-esemeny-3-9-321-proba.js`, bővítve:

* saját gól, kapott gól, bravúr és lap-jelenet: ki áll háttal és ki szemben;
* elölről nézetben mindenki szemben;
* a védő a hátulról nézetben is szemben marad.
