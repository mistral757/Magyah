# 1.0.12.10.00 — 5 fejlesztői jegyzet (u_fd5811b0d243)

| Jegyzet | Mi készült |
|---|---|
| jmww5wqotet2u — Run-szint | A Run-tempó eddig az élvonalbeli (D1) aranyhoz mért. Most a **Run-célhoz**, vagyis a kezdő osztály −2 bajnoki címéhez. |
| jmww5qrkf8zdv — teljes képernyő | A telepített változat visszatéréskor érzékeli, ha elveszett a teljes képernyő. Ilyenkor fent megjelenik egy „⛶ Vissza teljes képernyőre" gomb, és a következő koppintás (bárhol) visszakéri. |
| jmww64v98jvrm — mez | A saját mez mindenhol az arculat szerelése (`sajatMez`): a kupa párosításában (hazai / idegen), a kupa- és a bajnoki tabellában, a menetrendben és a szezonkártyákon. Eddig egy egyszerűsített, felezett mez állt itt. |
| jmww60sd257tr — letámadás, Sortűz | A gól nélküli letámadás 3D felvezetése (`letamadasKozep`) az ellenfél térfelén, a 16-oson kívül zajlik, kapukamera nélkül. A Sortűz négy lövésből áll; a részletek lent. |
| jmww62xmvfycx — stílusgól-infó, libikóka | A rajzolt jelenetek feliratai a 3D képre is kikerülnek. Az Egyensúly-gól valódi libikóka lett. |

## Run-szint: a Run-cél határa és bélyege
- **A határ:** a Run-cél osztályát legkorábban a (feljutások + 1). idényben lehet elérni. Két feljutással ez a 3. idény 30. bajnokija, a karrier 90. fordulója (`pyrTitleRefRound`).
- **A tempó bélyege:** `R.pyrGoalRound`, `R.pyrGoalLoss` és `R.pyrGoalRate`. A `runNotePyrGoal` írja, amikor a Run-cél aranya megszületik.
- **Az élvonalbeli bélyeg:** az `R.pyrTitleRound` megmarad a lépcsőknek és a nehézségi létrának.
- **Régi mentés:** a D1-es határhoz gyűjtött levonás nem jön át. A Run-cél határától egyszer, a mai ütemmel újraszámolódik. Ha a Run-cél aranya már megvan, azt a piramis naplójából pótolja.
- **A bontás:** a sor neve „A Run-cél aranyának üteme".

## Sortűz: lövés → blokk → lövés → blokk → lövés → védés → gól
- **3D felvezetés:**
  1. az 1. lövés a jobb védőbe csapódik, és lepattan;
  2. a 2. lövés a középső védőbe csapódik;
  3. a 3. lövést a kapus kiüti;
  4. a kipattanót a lövő kapja, és a kimenetel az ő gólja.
- **Hangok:** rúgás és tompa ütés a blokkoknál, kesztyű a kapusnál.
- **2D:** ugyanez a sorrend, a védők és a kapus a pillanatban reagálnak.

## Stílusgól-infó a 3D képen
- A rajzolt jelenet feliratai `data-info` jelet kapnak; ilyen például a „LŐ! LŐ! LŐ!", a „⚖️ 40 MP TELJES EGYENSÚLY", a passzszám vagy a zsák gólszáma.
- Az `evaKer` ezeket kigyűjti a `c._info` tömbbe, a `kamHud` pedig a skill neve alá rajzolja őket a 3D képre.

## Egyensúly: libikóka
1. A palló kileng, majd megnyugszik.
2. A befejező a palló jobb végéről felugrik („HOPP!").
3. A súlya nélkül a bal vég a földre csapódik.
4. A labda felpattan, és ő a levegőből a kapuba lövi.

„Új" (csak 3D) módban is lejátszódik: a 3D felvezetés után ismétlésként jön.

## Próba
- `tools/jegyzetek-1-0-12-10-00-proba.js` — minden pont.
- Igazítva: `felvezetok-1-0-11-13-00` (a gól nélküli letámadás saját felvezetése).
