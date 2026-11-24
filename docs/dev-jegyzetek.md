# 🐞 Fejlesztői jegyzetek — 1.0.12.3.00

> KIMONDOTT KÉRÉS: „ha a szokásos helyen lent a profil alján beírom: »szutykos fejlesztő vagyok«, akkor felkerül a fenti sávba minden létező képernyőn egy bug jel […] Készít magának egy feljegyzést arról, hogy melyik felületen lett megnyomva a bug gomb, és feldobna nekem egy kis jegyzet toolt, amiben ki lehet választani a probléma típusát egy általad előkészített részletes listából […], alatta pedig egy jegyzetfüzetkébe felírhatnám, hogy itt mi a tervem, gondolatom stb. És ezt felnyomnánk firebase-n keresztül a repóba, akárcsak a mérési adatokat […] Vagy akár felépíthetnénk egy workflowt, vagy skillt is itt claude code-on belül, amivel egyszerűen csak lefuttatom nálad azt, hogy csekkold a friss bug-reportokat, és implementáld a változtatáskéréseket."

## A lánc

```
játék (🐞) ──► helyi sor (localStorage) ──► Firebase devjegyzet/<uid>/<id>
                                                   │  (háromóránként, vagy kézzel: Run workflow)
                                                   ▼
                       .github/workflows/devjegyzet-szinkron.yml + tools/devjegyzet/lehuz.js
                                                   │
                                                   ▼
                  `dev-jegyzetek` ág: devjegyzet/JEGYZETEK.md + devjegyzet/jegyzetek.json
                                                   │
                                                   ▼
             Claude Code: „csekkold a jegyzeteimet” → .claude/skills/jegyzetek (feldolgozás,
             megvalósítás, a tools/devjegyzet/kezelt.json nyilvántartás frissítése)
```

## 1. A játékban
- **Bekapcsolás:** a profil alján, a rejtett mezőbe: **szutykos fejlesztő vagyok**. Kis- és nagybetűtől, ékezettől független. Kikapcsolás: a profil alján a „Fejlesztői mód kikapcsolása” gomb.
- **A 🐞 gomb:** minden képernyőn a jobb felső sarokban (a fejléc ikonjai alatt), minden ablak fölött. A számláló mutatja, hány jegyzet vár feltöltésre.
- **A hely a koppintás pillanatában rögzül** (`devHely`). Rögzített adatok:
  - a látható képernyők és a nyitott ablakok a címükkel;
  - a ☰ menü, a nyitott panel címe, a játékos-adatlap;
  - a futó lecke és a lépése;
  - az idény és a forduló, a Kezdő út szakasza;
  - a nézet mérete, a téma, a görgetés és a verzió.

  Egy sorban is látszik, pl. „📍 Itt: Pálya + Panel › 🏋️ Edzésterv”.
- **A jegyzet:**
  - a probléma típusa csoportos listából: 🐞 Hiba (22 féle) és 💡 Ötlet / kérés (12 féle), az eddigi közös munkából összeállítva;
  - fontosság: 🔥 sürgős / normál / 🧊 ráér;
  - a jegyzetfüzet szövege (kötelező).
- **Mentés:** a helyi sorba, és feltöltés a Firebase-be. Ha nincs kapcsolat, sorban marad, és a következő indításkor megy fel. Az utolsó jegyzetek a jegyzet-ablak alján látszanak, állapottal együtt.

## 2. Firebase
- **Ág:** `devjegyzet/<uid>/<id>`, mezők: `{v, at, app, d}`; `d` a jegyzet JSON-ja, legfeljebb 20 000 karakter. Ugyanaz a névtelen azonosítás, mint a mérési naplóé (`lbInit`).
- **Szabály** (`tools/firebase-rules.json`): csak a saját ágra lehet írni, kívülről semmit nem lehet olvasni. **A szabályt közzé kell tenni** a Firebase-konzolon (Realtime Database → Rules), mert addig a feltöltés elutasítódik, és a jegyzetek helyben, sorban maradnak.

## 3. A repóba
- `tools/devjegyzet/lehuz.js`: a mérési szinkron szolgáltatásfiókjával (`FIREBASE_SERVICE_ACCOUNT`) olvas. A kimenete `JEGYZETEK.md` (olvasható, legújabb elöl) és `jegyzetek.json`. A szerző helyett SHA-256 kivonat áll (`u_…`), a szöveg változatlan.
- `.github/workflows/devjegyzet-szinkron.yml`: háromóránként fut, és kézzel is indítható. A `dev-jegyzetek` ágra commitol. Az ütemezés csak akkor fut, ha a munkafolyamat a **fő ágon** (`main`) van.
- **Ha a repó nyilvános, a `dev-jegyzetek` ág is az**, vagyis a jegyzetek szövege bárki számára olvasható.

## 4. Feldolgozás (Claude Code)
Elég annyit mondani: „csekkold a jegyzeteimet” (vagy egy kérés mellé: „…és a jegyzetekkel együtt”). A `jegyzetek` skill:
1. lehozza a `dev-jegyzetek` ágat;
2. **csak a megbízható szerzőtől** dolgoz fel magától (`tools/devjegyzet/szerzok.json`, amit az első alkalommal veled együtt töltünk ki), mert a kulcsszó nyilvános, és a Firebase-ágra bárki írhat;
3. az újakat (`tools/devjegyzet/kezelt.json` szerint) összefoglalja, megvalósítja vagy rákérdez;
4. a kész jegyzeteket a nyilvántartásba írja.

## Próba
`tools/dev-jegyzet-1-0-12-3-00-proba.js` ellenőrzi:
1. a kulcsszó ékezet nélkül is bekapcsol;
2. a gomb látható és koppintható a HUB-on, egy panelen és egy felugró ablak fölött;
3. a hely a panel címével rögzül, a típuslista csoportos, a szöveg kötelező, a jegyzet a helyi sorba kerül, a gombon számláló jelenik meg;
4. a lehúzó szkript a jegyzetből `JEGYZETEK.md`-t és `jegyzetek.json`-t készít;
5. a mód kikapcsolható;
6. nincs oldalhiba.
