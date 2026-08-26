# Megerősítés — mit nem szabad egy koppintással elintézni

**Állapot:** ✅ megvalósítva · **Verzió:** 3.7.38

*(Érintett kód: `askConfirm` és a köre (`askHubTacticConfirm`, `askSellConfirm`,
`askSaleUnlist`), a `#hubTacticConfirmModal`.)*

---

## 1. A szabály

> Egy koppintás nem költhet el több milliárdot, nem vállalhat be egy egész
> szezonra szóló kötelezettséget, és nem éghet el tőle egy olyan **alkalom**,
> amiből egy egész ablakban egy-kettő van.

A megerősítő EGY közös modális (`askConfirm`), és mindig ugyanazt a három
dolgot mondja ki:

1. **mit** csinálsz (név, összeg, poszt, képesség),
2. **mi fogy** el érte, és hogy **nem jár vissza**,
3. **mennyi marad** utána.

A modális a `#scHub`-on KÍVÜL, `position:fixed` fedőrétegként él, ezért a
HUB-ból, az átigazolási képernyőről (`#scWindow`) és a kupa-nézetből is
ugyanúgy előjön.

---

## 2. A 3.7.38-as leltár

**A bejelentés:** *„keress meg olyan pontokat, ahol jelenleg is fennáll az a
helyzet, hogy valamilyen jelentős hatással bíró akciót hajt végre a játékos
egyetlen gombnyomással megerősítés kérése nélkül. Mondok egyet: képességkeresés
menübe ha belépek és kiválasztom, melyik képességét keresem, azonnal rákeres,
nem kér megerősítést — pedig abból általában 1-2 darab van csak."*

A leltár azt találta, hogy a **pénzköltés** oldala rendben volt: minden
`budgetPay` megerősítő mögött ült. A lyukak egy helyen sűrűsödtek: a **szűkös,
vissza nem térő „alkalmak"** elköltésénél — és két esetben ott, ahol az
**építő** ág kapott megerősítőt, a **romboló** nem.

### A · Egy menü-koppintás elköltött egy alkalmat

| | hol | keret | mi történt |
|---|---|---|---|
| 🎲 Átigazolási esemény | `hubTransferEventBtn` | nyáron 2 (10★-tól 3), ablakban 1-2 | **a menüpont MAGA volt a művelet** — a `twSpendEvent()` a koppintásra futott, közbenső képernyő nélkül |
| 🎯 Képesség-keresés | `twShowAttrPicker` | ablakban 1-3, nyáron 2-8 | a tengely-gombra koppintva `attrLeft--` és indult a keresés |
| 🎁 Ingyen boost-token | `hubBoostTokenBtn` | jellemzően 1 | a sorra koppintva `boostTokens--` és a boost lefutott |

**A képesség-keresésnél ott volt a bizonyíték, hogy ez kimaradás, nem
szándék:** a testvér-képernyője, a **poszt-választó** (`twShowCategoryPicker`)
pontosan erre a problémára kapott megerősítőt — *„Kiküldöd a scoutot? … Ez egy
felderítést költ el, és a keretből nem jár vissza"* —, az attribútum-ág viszont
kimaradt belőle. Az új szöveg ugyanazt a mintát követi, hogy a két képernyő
ugyanazt a nyelvet beszélje.

**A boost-tokennél ugyanez az aszimmetria:** ugyanaz a boost **pénzért** teljes
megerősítőt kap („A boost egyszeri és visszavonhatatlan"), a token-úton viszont
ugyanaz a hatás és ugyanaz a véglegesség kérdés nélkül futott le.

### B · A romboló ág volt az őrizetlen

| | hol | mi történt |
|---|---|---|
| 💼 „Kihagyom" a befektetésnél | `renderInvestOffer` | az összeg-gombok mind megerősítőt kapnak („a lehetőség egyszeri"), a mellettük álló, **ugyanolyan kinézetű** Kihagyom viszont egy koppintással véglegesen eldobta a felajánlást |
| 📈 „Elutasítom — várok jobbat" | `renderSaleOffersPanel` | az **elfogadás** teljes megerősítőt kapott, az elutasítás nem — pedig az elfogadás saját szövege mondja ki: *„ez a konkrét összeg nem jön vissza"* |

Az elutasító párbeszéd kiírja azt is, amit cserébe kapsz: a licit-kúp csúcsa
feljebb kúszik (`agencyBidMode`), a negyedik elutasításig.

### C · Amit szándékosan NEM őriztünk meg

Ezeknél a koppintás vagy dedikált képernyőn történik, vagy a gomb felirata
maga mondja ki az árát — ott a megerősítő már útban volna, nem védelem:

| | hol | miért marad |
|---|---|---|
| 🔍 Klub-szemle „Pörgetés" | `showClubScoutIntro` | saját képernyő, fölötte a maradék pörgetések száma |
| 👁 „Felmérés" a jelöltsoron | `candRevealBtn` | a felirat kiírja, hány jelölt van még hátra; a keret képernyőnkénti, és csak információt vesz |
| ⏭ „Kihagyom ezt a kört" | `twShowCategoryPicker` | a felirat pontosan azt mondja, amit tesz |
| ⭐ Fejlesztés-jutalom sora | `showSkillCompletion` | a képernyő MAGA a „válaszd ki a jutalmad" kérdés |

Két határeset, amit a bejelentő is a „későbbre" listára tett: a **draft
újrapörgetése** (a szám a gombon, de a mostani keret elvész) és a **buszsofőr
behívása** (kétlépcsős — felfegyverzés + célpont —, a kártya kiírja az árát, de
a második koppintás meccs közben azonnal, visszavonhatatlanul végrehajt).

---

## 3. Mérés (fejetlen böngésző, valódi kezelőkkel)

Mind az öt ponton ugyanaz a három lépés futott le:

| | 1. koppintás | „Mégse" | „Igen" |
|---|---|---|---|
| 🎯 Képesség-keresés | modális nyílik · `attrLeft` **2** · keresés **nem indult** | `attrLeft` **2** | `attrLeft` **1** · keresés indult |
| 🎲 Átigazolási esemény | modális nyílik · `eventLeft` **2** · 2. fázis **nem indult** | `eventLeft` **2** | `eventLeft` **1** · 2. fázis indult |
| 🎁 Boost-token | modális nyílik · token **1** · boost **nem futott** | token **1** | token **0** · boost lefutott |
| 💼 Befektetés kihagyása | modális nyílik · `investPending` **true** | **true** | **false** |
| 📈 Ajánlat elutasítása | modális nyílik · elutasítás **0** | **0** | **1** |

Vagyis egyik ponton sem fogy semmi az első koppintásra, és a „Mégse" tényleg
visszavesz mindent.
