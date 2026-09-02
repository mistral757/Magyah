#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
 *  MAGYAH — NÉVAUDIT: hol szivárog ki kanonikus játékos- vagy klubnév?
 *
 *  MIÉRT VAN. A játék adatbázisában a nevek KANONIKUSAK (a valós játékos- és
 *  klubnevek), a felületen viszont sosem azok jelenhetnek meg: a megjelenítési
 *  réteg (fullName / shortName / teamLabel / clubLabel / leagueLabel) fordítja
 *  őket. Ha egy kiírási hely kimarad ebből, a név NYERSEN kerül a képernyőre —
 *  ez jogtisztasági kockázat, és ránézésre semmi nem jelzi: a kód hibátlan, a
 *  játék fut, csak épp mást ír ki, mint kellene.
 *
 *  A check.sh ezt nem tudja elkapni (nem hiányzó globális és nem szintaxis), a
 *  szem pedig 78 000 soron nem elég. Ez a szkript ezt a hiányt pótolja.
 *
 *  MIT NÉZ. Két dolog EGYÜTTÁLLÁSÁT keresi egy soron belül:
 *    1. KIÍRÁSI HELY  — `esc(...)` hívás, `${...}` behelyettesítés, VAGY egy
 *       közvetlen DOM-szövegírás (`…textContent = …`);
 *    2. NÉVFORRÁS     — olyan kifejezés, amiről tudjuk, hogy KANONIKUS nevet
 *       hordoz (lásd NEVFORRASOK). A lista kézzel írt és bővítendő: minden új
 *       névtároló mezőnek ide a helye.
 *  Ha a névforrás körül nincs megjelenítő függvény, a sor gyanús.
 *
 *  A DOM-ÍRÁS KÜLÖN OSZTÁLY, ÉS EZ EGY VALÓDI HIBÁN TANULTUK MEG. Az edző
 *  sorsolásának kártyája így írta ki a nevet:
 *      $("coachName").textContent = c.n;
 *  Se `esc(`, se `${` — a háló tehát RÁ SEM NÉZETT a sorra, és az edzők valós
 *  neve hónapokig kint volt a képernyőn. A javítás nem egy minta bővítése,
 *  hanem egy hiányzó KIÍRÁSI ALAK felvétele: a `textContent`/`innerText`/
 *  `innerHTML` jobb oldala ugyanúgy képernyő, mint egy sablon.
 *
 *  Ebben a szűk helyzetben a `.n` és a `.name` MINDENESTŐL névforrásnak
 *  számít (nem csak a lenti, nevesített minták). Máshol ez nem járható: egy
 *  általános `.n` szabály a kiírási helyekre 155 találatot adna, azok
 *  túlnyomó része taktika-, képesség- és osztálynév. A DOM-írásokban viszont
 *  összesen néhány ilyen sor van, tehát a szigor itt olcsó.
 *
 *  HAMIS RIASZTÁS. Egy névforrás nem mindig KIÍRÁS: lehet kulcs, kereső-érték
 *  vagy hálózatra küldött adat — ott a kanonikus név a HELYES. Ilyenkor a sor
 *  végére (vagy fölé) írt  /* nev-ok: <indok> *​/  megjegyzés némítja el, épp
 *  úgy, ahogy a ledger-audit.sh-nál az INDOKOLT. Az indok KÖTELEZŐ: az a
 *  bizonyíték, hogy valaki tényleg megnézte.
 *
 *  Használat:   node tools/nev-audit.js
 *  Kilépési kód 0 = nincs gyanús hely.
 * ───────────────────────────────────────────────────────────────────────────── */
"use strict";
const fs=require("fs"),path=require("path");
const SRC=path.join(__dirname,"..","index.html");
const lines=fs.readFileSync(SRC,"utf8").split("\n");

/* A vizsgált blokk: az első magában álló <script> … </script>. Ugyanaz a határ,
   amit a check.sh is használ — a fejléc-jelölésben nincs JavaScript. */
const A=lines.findIndex(l=>l==="<script>");
const B=lines.findIndex(l=>l==="</script>");
if(A<0||B<0){console.error("✗ Nem találom az inline <script> blokk határait.");process.exit(1);}

/* ---- A MEGJELENÍTŐ RÉTEG ----
   Ha a névforrás EZEK VALAMELYIKÉN megy át, a kiírás rendben van. A
   klubrövidítők is itt vannak: azok maguk hívják a clubLabel-t. */
const BURKOLOK=["fullName","shortName","teamLabel","clubLabel","leagueLabel",
  "msWhoName","clubAbbr","sbClubAbbr","myTeamAbbr","pyrEntityName","teamName"];

/* ---- A NÉVFORRÁSOK ----
   Minden bejegyzés egy kifejezés-minta, amiről TUDJUK, hogy kanonikus
   játékos- vagy klubnevet ad vissza. Új névtároló mező → új sor ide. */
/* Meddig ér vissza egy `nev-ok:` jelölés? (Lásd a KÉZZEL IGAZOLT KIVÉTELt.) */
const NEVOK_ABLAK=[0,1,2,3,4,5,6];
const NEVFORRASOK=[
  /* --- klubnév: mérkőzés-ellenfél --- */
  {re:/\b(?:fx|f|nx|_fx)\.o\.n\b/g,                     mi:"a forduló ellenfelének klubneve"},
  {re:/\bE\.teams\[[^\]]*\]\.n\b/g,                     mi:"kupacsapat klubneve"},
  {re:/\bS\.euro\.teams\[[^\]]*\]\.n\b/g,               mi:"kupacsapat klubneve"},
  {re:/\b(?:snap|s)\.nextOppName\b/g,                   mi:"a következő ellenfél klubneve"},
  {re:/\b(?:m|r|fin|tie|pv|src\.e)\.opp\b(?!\w)/g,      mi:"a kupa-menetelés ellenfelének klubneve"},
  {re:/\blastTie\.opp\b/g,                              mi:"a párharc ellenfelének klubneve"},
  {re:/\b_d\.bestOpp\b/g,                               mi:"a legemlékezetesebb meccs ellenfele"},
  {re:/\bM\.them\b/g,                                   mi:"a meccs-statisztika ellenfele"},
  {re:/\brec\.team\b/g,                                 mi:"a rekordot hozó klub neve"},
  /* --- klubnév: keret- és világ-eredet --- */
  {re:/\b(?:sq|squad|x|alt\.sq|best\.squad|curSquad)\.club\b/g, mi:"adatbázis-klubnév"},
  {re:/\b(?:a|b|s|slot|sl)\.origin\b/g,                 mi:"a draft-eredet klubneve"},
  {re:/\bo\.clubs\[/g,                                  mi:"a rivális pár klubjai"},
  {re:/\bg\.rivals\b/g,                                 mi:"a kupacsoport rivális erejű csapatai"},
  /* --- játékosnév --- */
  {re:/\b(?:oppScorer|dramaOppScorer|oppTaker)\b/g,     mi:"az ellenfél gólszerzőjének neve"},
  {re:/\b(?:captainName|oldName|starName)\b/g,          mi:"játékosnév"},
  {re:/\brec\.who\b/g,                                  mi:"a rekordot tartó játékos neve"},
  /* --- CSERE-PÁR: {out: <távozó>, in: <érkező>} ---
     A szezonjelentés visszavonulás-sora ilyen párokat épít (newSignings), és a
     TÁVOZÓ neve át volt írva, az ÉRKEZŐé nem — egyetlen sorban, egymás mellett.
     A minta TÁG, mert a mezőnév rövid és beszédes: bármi, ami `.in`-re vagy
     `.out`-ra végződik. Mérve az egész fájlban EGYETLEN nem-név akad fenn rajta
     (egy darabszám), az jelölést kapott. */
  {re:/\b[A-Za-z_$][\w$]*\.(?:in|out)\b/g,              mi:"csere-pár neve (`.in` / `.out`)"},
  {re:/\bc\.captain\b/g,                                mi:"a társ csapatkapitányának neve"},
  {re:/\bS\.grudge\b/g,                                 mi:"posztcsata-nevek halmaza"},
  /* --- …ÉS A `.name` MEZŐBEN HORDOZOTT NÉV ---
     EZ VOLT A KIMARADT OSZTÁLY. A név nem mindig `.n`: a jutalom-lánc, a
     mérföldkövek és a díjak alkalmi objektumokba pakolják `{name, …}` alakban
     (findIncompleteSkills, buildUpgradeCands, rosterFullChoice, a bajnoki
     díjak listája). A `.n`-re szabott minták ezeket nem látták — a
     „fejlesztés — jutalom" választója így írta ki évekig a valós neveket.
     A minta ezért TÁG: bármi, ami `.name`-en végződik. Ami NEM név (képesség,
     bolti tétel, osztály, család, taktika), azt a KIVÉTELEK zárják ki alább —
     így egy új névtároló mező magától bekerül a hálóba, nem kell észben
     tartani. */
  {re:/\b[A-Za-z_$][\w$]*\.name\b/g,                    mi:"objektumban hordozott név (`.name`)",
   /* A KIVÉTELEK. Két csoport:
        · ami nem SZEMÉLY vagy KLUB (képesség, bolti tétel, stábtag-típus,
          taktika, családtag-beállítás) — ott nincs mit fordítani;
        · a PIRAMIS OSZTÁLYAI (`d` / `_d` / `home` / `cur`): a `name` mezőjük a
          liga-fokozat kitalált magyar neve („Vármegyei liga"), nem klubnév.
          Ezt a négy változónevet a piramis-kód végig következetesen használja. */
   kiveve:/\b(?:skill|inst\.skill|c\.inst\.skill|o\.inst\.skill|sk|it|sp|type|def|aw|dl|st|ct|rd|familyState|coachTypeByKey\([^)]*\)|TACTICS\[[^\]]*\]|d|_d|home|cur)\.name$/}
];

/* ---- HOL VAN A TALÁLAT? ----
   Nem elég, hogy a soron VAN `esc(` vagy `${`: a névforrásnak BENNE kell
   lennie valamelyikben. Egy `if(!silent&&captainName)addLine(…)` sorban az
   első `captainName` egy FELTÉTEL, nem kiírás — a régi, sorra néző változat
   ezt hamis riasztásként dobta.

   A `slot` visszaadja azt a legszűkebb kiírási szakaszt (`esc(…)` argumentum
   vagy `${…}` behelyettesítés), amiben a találat áll — vagy null-t, ha a
   találat egyikben sincs benne. A zárójel-mélységet visszafelé számoljuk. */
function slot(sor,idx){
  let melyseg=0;
  for(let i=idx-1;i>=0;i--){
    const c=sor[i];
    if(c===")"||c==="}"){melyseg++;continue;}
    if(c==="("||c==="{"){
      if(melyseg>0){melyseg--;continue;}
      /* nyitó találat a saját szintünkön: mi nyitotta? */
      if(c==="{"&&i>0&&sor[i-1]==="$")return zaroig(sor,i+1);
      const elotte=sor.slice(Math.max(0,i-24),i);
      if(/\besc$/.test(elotte))return zaroig(sor,i+1);
      /* más hívás vagy csoportosítás: eggyel kijjebb keressük tovább */
      idx=i;i=i;continue;}
  }
  return null;}
/* A nyitó zárójeltől a párjáig tartó szakasz — ebben keressük a burkolót. */
function zaroig(sor,tol){
  let m=1;
  for(let i=tol;i<sor.length;i++){
    const c=sor[i];
    if(c==="("||c==="{")m++;
    else if(c===")"||c==="}"){m--;if(!m)return sor.slice(tol,i);}}
  return sor.slice(tol);}

/* A névforrás körül van-e megjelenítő függvény? A KIÍRÁSI SZAKASZ EGÉSZÉT
   nézzük, nem csak a találat előtti részt: a `${x?` — ${esc(teamLabel(x))}`:""}`
   alakban a burkoló a feltétel MÖGÖTT áll, mégis az a kiírt érték. */
function burkolt(szakasz){
  return BURKOLOK.some(b=>szakasz.includes(b+"("));
}

/* ---- A DOM-ÍRÁS MINT KIÍRÁSI HELY ----
   `X.textContent = <kifejezés>;` — a jobb oldal a képernyőre kerül. A pontos-
   vessző (vagy a sor vége) a határ; ez elég, mert a DOM-írások egysorosak.
   Az `==`/`===` összehasonlítást kizárjuk: az kérdés, nem kiírás. */
const DOM_IRAS=/\.(?:textContent|innerText)\s*=(?!=)\s*([^;]*)/g;
/* Ebben a szűk helyzetben minden `.n` és `.name` névgyanús — lásd a fejlécet. */
const DOM_NEV=/\b[A-Za-z_$][\w$]*\.(?:n|name)\b/g;

const talalatok=[];
for(let i=A+1;i<B;i++){
  const sor=lines[i];
  /* A tisztán megjegyzés-sorok kimaradnak: a magyarázó kommentárok gyakran
     idézik a kifejezéseket, és azok nem kiírások. */
  const t=sor.trim();
  if(t.startsWith("/*")||t.startsWith("*")||t.startsWith("//"))continue;
  /* KÉZZEL IGAZOLT KIVÉTEL. A jelölés állhat a soron VAGY a fölötte lévő
     HÁROM sor bármelyikén. Miért nem csak a soron: egy több sorra tördelt
     sablon belsejébe nem lehet JS-megjegyzést tenni (kiíródna), a nyitó sor
     pedig maga is a sablon része — a jelölésnek tehát a blokk ELÉ kell
     kerülnie, és onnan is érvényesnek kell lennie. A hat sor mért érték: a
     leghosszabb ilyen sablon a jelölés és a kifogásolt sor között öt sort
     fog közre (a piramis osztályválasztójának gombja). */
  if(NEVOK_ABLAK.some(k=>(lines[i-k]||"").includes("nev-ok:")))continue;
  /* 1. ÚT — DOM-szövegírás. Ettől független a sablonos út alább: egy sor
     lehet mindkettő (`el.innerHTML=\`…${x}…\``), és akkor mindkettő nézi. */
  DOM_IRAS.lastIndex=0;
  {let dm;
   const dlatott=new Set();
   while((dm=DOM_IRAS.exec(sor))!==null){
     const jobb=dm[1]||"";
     if(burkolt(jobb))continue;
     /* Ha a jobb oldal SABLON vagy `esc(`, akkor a sablonos út (lentebb) már
        látja, a maga pontos mintáival. Ez az ág CSAK azt a vakfoltot fedi,
        amit az nem: a nyers, behelyettesítés nélküli DOM-írást. Enélkül a
        `innerHTML=\`${x.n}…\`` alakú, ártalmatlan címkék tucatjai jönnének be. */
     if(jobb.includes("${")||jobb.includes("esc("))continue;
     DOM_NEV.lastIndex=0;
     let nm;
     while((nm=DOM_NEV.exec(jobb))!==null){
       if(dlatott.has(nm[0]))continue;
       dlatott.add(nm[0]);
       talalatok.push({sor:i+1,mi:"DOM-szövegbe írt név",mit:nm[0],szoveg:t.slice(0,150)});}}}
  if(!sor.includes("esc(")&&!sor.includes("${"))continue;
  const latott=new Set();
  NEVFORRASOK.forEach(f=>{
    f.re.lastIndex=0;
    let m;
    while((m=f.re.exec(sor))!==null){
      /* A .length/.size/.has(…) nem NÉV, hanem darabszám vagy kérdés. */
      if(/^\.(length|size|has\(|add\(|indexOf|includes\()/.test(sor.slice(m.index+m[0].length)))continue;
      /* Mintánkénti kivétel (lásd a `.name` szabályt): ami nem személy- vagy
         klubnevet hordoz, azt nem kérjük számon. */
      if(f.kiveve&&f.kiveve.test(m[0]))continue;
      const sz=slot(sor,m.index);
      if(sz===null)continue;                           /* nem kiírás: feltétel, kulcs, keresés */
      if(burkolt(sz))continue;
      if(latott.has(m[0]))continue;                    /* egy sorban egy név egyszer */
      latott.add(m[0]);
      talalatok.push({sor:i+1,mi:f.mi,mit:m[0],szoveg:t.slice(0,150)});
    }});
}

if(!talalatok.length){
  console.log(`A vizsgált blokk: index.html ${A+2}–${B}. sor`);
  console.log("✓ minden névkiírás átmegy a megjelenítési rétegen");
  process.exit(0);
}
console.log(`A vizsgált blokk: index.html ${A+2}–${B}. sor`);
console.log(`✗ ${talalatok.length} gyanús névkiírás:\n`);
talalatok.forEach(x=>{
  console.log(`  index.html:${x.sor}  — ${x.mi} (${x.mit})`);
  console.log(`      ${x.szoveg}`);
});
console.log(`
  Javítás: tedd a kifejezést a megjelenítési rétegbe —
    játékosnév → fullName(...) vagy shortName(...)
    klubnév    → teamLabel(...) (évszámos alak) vagy clubLabel(...)
    liganév    → leagueLabel(...)
  Ha a hely NEM kiírás (kulcs, keresés, hálózatra küldött adat), írj a sorra
  egy  /* nev-ok: <indok> */  megjegyzést.`);
process.exit(1);
