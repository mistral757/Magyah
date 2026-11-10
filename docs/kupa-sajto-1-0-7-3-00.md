# 🏆 A kupa a címlapon (1.0.7.3.00)

> „Legyenek a kupasorozatra és azon belül a kupasorozat egyes szakaszaira
> reagáló cikkek a klub újságíróitól. Különösen hypeolt legyen a döntő. Extra
> hype a BL és Hiper Liga döntő!"

A játékban a „BL" a **Kupák Kupájának Kupája** (KK, kulcsa `BL`). A „Hiper
Liga" a **Hiper Szuper Kupa** (HSZ).

## Három helyen ír a lap

1. **Minden kupameccs után** (`pressKupaCim`, a `pressHeadline`-ból).
   - A cím a sorozatot és a szakaszt mondja ki: selejtező első meccse,
     továbbjutás vagy kiesés; csoportkör vagy ligaszakasz (nyitány, közbülső
     forduló, zárás); kieséses első meccs; a visszavágó döntése
     (tizenegyesekkel is); az elődöntőből a döntőbe jutás; a döntő.
   - A rovat neve **🏆 Kupaláz**.
   - A bajnoki szezontörténet (`pressStoryApply`) nem írja felül.
   - A döntő, a továbbjutás és a kiesés mindig a címlapon van. Egy sima
     kupameccsen egy erős esti esemény maradhat a cím, például mesterhármas
     vagy az ifi első gólja; ilyenkor a kupa a rovatba kerül.
2. **A szakasz előtt** (`pressKupaElozetes`): előzetes a naplóban.
   - a selejtező első köre előtt;
   - a csoportkör / ligaszakasz előtt;
   - a kieséses körök előtt: a kisebb sorozatokban minden másodiknál;
   - a döntő előtt külön felvezetés.
3. **A kampány végén** (`pressKupaZaras`): ünnepi kiadás a kupagyőzelemkor,
   és reakció a csoportkörös vagy ligaszakaszos búcsúra. Kieséses kiesésnél a
   meccscikk elég.

## A hype fokozatai (`kupaHype`)

| fokozat | sorozat | a döntő |
|---|---|---|
| 3 | KK, Hiper Szuper Kupa | **KÜLÖNSZÁM**: csupa nagybetűs címek, saját sablonsor, alcím és rovat, háromsoros **különkiadás** előzetesként, a cikk ×1,5 szurkolót hoz |
| 2 | OJK | alcím és rovat, kétsoros előzetes |
| 1 | KONF, Magor Kupája, Fából Készült Serleg | alcím és rovat, kétsoros előzetes |
| 0 | felkészülési kupa | csak visszafogott címek, előzetes csak a döntő előtt |

A 3-as fokozatú sorozatban már a **döntőbe jutás** is saját, harsány címet
kap, alcímmel.

## Az este extrái

A kupa a meccsvégi doboz extrái közé is bekerül, és ez a sajtó-cikk súlyát is
adja:

| extra | súly |
|---|---|
| 🏆 kupagyőzelem | 1,3 · OJK 1,6 · KK és Hiper 2 |
| 🥈 elveszített döntő | 0,7 · KK és Hiper 1 |
| 🎟️ döntőbe jutás | 0,9 · KK és Hiper 1,2 |
| 🎟️ továbbjutás vagy főtáblára jutás | 0,6 |

## A nyelv

- A szakasznevek négy ragozott alakban állnak (`KUPA_KOR_FORMA`), a hangrend
  miatt nem egy toldalékkal: „csoportkörében", „ligaszakaszában",
  „nyolcaddöntőjében".
- Az eredmény mögé nem kerül toldalék, mint a meglévő címekben sem
  („Klub 2–1 Ellenfél").

## A bekötés

- A kupameccs környezetét (sorozat, szakasz, oda- vagy visszavágó, forduló,
  összesítés, tizenegyesek) a lefújáskor rögzítjük, **még** az
  `euroFinishUserMatch` előtt (`_CUPS`). Utána a sorozat már a következő
  szakaszban állhat.
- Ezt kapja meg a `mVerdictEnrich` (`o.cup`).

## Próba

A `tools/kupa-sajto-1-0-7-3-00-proba.js` ezeket méri:
- minden sorozat × minden helyzet × 30 sorsolás: egyetlen hibás cím sincs;
- a hype-fokozatok és a különszám;
- bajnoki meccsen nincs kupacím;
- erős esti esemény mellett a kupa a rovatba kerül;
- az extrák és a cikk szurkolói;
- a szezontörténet nem írja felül a kupacímet;
- az előzetesek és a zárás.
