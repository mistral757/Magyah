# A nyári felkészülési kupa

**Állapot:** ✅ megvalósítva · **Verzió:** 3.6 – 3.7.37

*(Érintett kód: `EURO_COMPS.NYK`, `compFriendly` / `euroFriendlyActive`,
`friendlyCupOfferable` / `offerFriendlyCup` / `friendlyCupSettle` /
`friendlyCupStart`, `euroMidRating` felkészülési ága, `EURO_TEMPO_FRIENDLY`,
`FRIENDLY_RISK_MULT` / `friendlyRiskMult`, valamint a közös karrier oldalán
`mpNykResolve` / `mpNykSharedMid` / `mpNykJoinCup`.)*

---

## 1. Mi ez, és mikor jön elő

Ha egy idény végén **nem szereztél kupaindulást** (se európait, se hazait), a
nyár eddig egyetlen mérkőzés nélkül telt el. A felkészülési kupa ezt tölti ki:
egy **32 csapatos torna**, klasszikus lebonyolítással — nyolc négyes csoport
oda-vissza, onnan egyenes kiesés a döntőig, pontosan úgy, mint a Bajnokok
Ligájában.

A **nevezés szezononként egyszer kérdés** (`S.friendlyCupSeason`), tehát a
„nem" sem kérdez rá újra ugyanabban a nyárban.

## 2. A mezőny hozzád van mérve

Itt szándékosan **nem** a nehézségi sáv, a rejtett erősítés és a kupa-előny
bonyolult képlete dönt, hanem egyetlen szám: a kereted **nyers csapatereje
mínusz egy** (`euroMidRating` felkészülési ága). Ez a sorozat ígérete —
magadhoz mért, egy hajszálnyival könnyebb mezőny, amin a fiatalok is játékidőt
kapnak.

*(Közös karrierben az **erősebb kerethez** horgonyzunk — lásd
`docs/kozos-karrier-szezonzaras.md` 4.2b.)*

## 3. Jutalom nincs — a játékidő az

| | felkészülési kupa |
|---|---|
| trófea · pénzdíj · Champion-kártya | ❌ |
| taktika-szintugrás · szurkoló-löket · arany-díj | ❌ |
| bekerül a karrier-történetbe | ❌ |
| fejlődés | ✅ **negyed tempón** (`EURO_TEMPO_FRIENDLY` = 0,25) |
| képességek · forma · párkémia · taktika-begyakorlás | ✅ (ugyanazon a negyed tempón) |
| kupa-kihívások | ✅ itt is felvehetők, és a jutalmuk jár |
| bérek · lelátó | ✅ a szokott módon |

Az eredményjelző saját, **bója-narancs edzőtábor-témát** kap, hogy egy
pillantásból látszódjon: ez nem tétmeccs.

## 4. Fele kockázat (3.7.37)

**A bejelentés:** *„legyen kisebb (50%-kal) a piroslap- és sérülés-esély a
nyári felkészülési kupában (kivéve a Panzerkampfwagen csapatstílusnál)."*

**Miért helyes.** A torna se trófeát, se pénzdíjat, se kártyát nem ad — az
egyetlen, amit hoz, a **játékidő**. Egy tétnélküli tornán szerzett féléves
sérülés vagy egy eltiltás a következő **bajnoki** fordulóban ezt a hozadékot
negatívba fordítja: a nyár többe kerülne, mint amennyit ér. A kockázat nem
tűnik el (a torna nem edzőmeccs-koreográfia), csak **feleződik**.

**A Panzer kivétel, és ez nem finomkodás.** Annál a filozófiánál a piros lap és
a sérülés nem baleset, hanem a rendszer **üzemanyaga**: a „Vadhajtások"
képesség szándékosan EMELI mindkettőt (+160% / +100% a 3. szinten), a
Megfélemlítés egyenesen a kiállításból él, a stílus mérföldkövei pedig a piros
lapokat (`pz_redall`, `pz_redseason`) és a sérülten aratott győzelmeket
(`pz_injwin`) számolják. Ott egy néma felezés a saját fáját venné vissza,
méghozzá pont azokon a mérkőzéseken, ahol a legolcsóbban gyűjthetne belőle.

**Egy torok.** A `friendlyRiskMult()` egyetlen szám, és mindhárom dobás ezen
megy át: a mérkőzés piroslap-sorsolása, a sérülés-sorsolás, és a párharc
pillanatképének `redP` mezője. Így a lap és a sérülés nem tud szétcsúszni
egymástól, és a felület is ugyanabból a számból mondhatja meg, mi vár rád.

```
friendlyRiskMult()
  nincs futó kupa  ................  1
  BL / EL / KL / MK  ..............  1
  NYK, futó kampány  ..............  0,5
  NYK, lezárt kampány (stage:done)   1
  NYK + Panzerkampfwagen  .........  1
```

**Az `euroActive()` őr nem díszlet.** A lezárt kampány `S.euro`-ja bent marad
`"done"` szakasszal; enélkül a felezés átszivárogna a **következő idény
bajnoki** mérkőzéseire is. Ugyanez az indok, amiért az `euroTempo` is ezzel
kezd.

**A felületen** a nevezési képernyő kimondja, melyik ág érvényes rád: „fele
akkora eséllyel, mint tétmeccsen", illetve Panzernél „teljes eséllyel — nálad a
lap és a sérülés a rendszer üzemanyaga". A fogalomtár (Európai kupák szócikk)
ugyanezt írja le hosszabban.

## 5. Közös karrierben

A nyári torna **közös**: egyhangú nevezés, egy 32-es mezőny, találkozás csak a
kieséses ágon. Részletesen: `docs/kozos-karrier-szezonzaras.md` **4.2** és
**4.2b**.
