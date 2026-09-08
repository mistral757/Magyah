#!/usr/bin/env node
/* 🏪 KIADÁS-ELŐTTI ELLENŐRZŐ — a papírmunka és a csomagolás gépi része.
   Nem a játékot méri (arra ott a 34 próba), hanem azt, amit a Google Play
   ELUTASÍT, ha hiányzik. Mindegyik állítás egy konkrét elutasítási okra felel.

   MIÉRT KELL. Ez a réteg nem fut le magától: egy új adatkiáramlás (mint a
   3.9.22-es push) csendben elavítja az adatvédelmi tájékoztatót, és ez csak a
   Play-elutasításnál derülne ki — hetekkel később. A `docs/f4-*.md` és az
   `adatvedelem/index.html` mostantól EGYÜTT mozdul a kóddal, vagy elbukik itt.

   Használat: node tools/kiadas-proba.js       (nem kell böngésző) */
const fs=require("fs"),path=require("path");
const GYOKER=path.join(__dirname,"..");
const A=[],ok=(n,f,mit)=>A.push({n,ok:!!f,mit:mit||""});
const olv=p=>{try{return fs.readFileSync(path.join(GYOKER,p),"utf8");}catch(e){return null;}};
const van=p=>{try{return fs.existsSync(path.join(GYOKER,p));}catch(e){return false;}};

/* ════════ 1. ADATVÉDELMI TÁJÉKOZTATÓ ════════ */
const adatv=olv("adatvedelem/index.html");
ok("az adatvédelmi tájékoztató létezik",!!adatv);
if(adatv){
  const szoveg=adatv.replace(/<[^>]*>/g," ");
  /* A PLACEHOLDER A LEGGYAKORIBB ELUTASÍTÁSI OK ebben a szakaszban: egy
     kitöltetlen [SZÖGLETES ZÁRÓJEL] azonnal „nem teljes tájékoztató". */
  const ph=szoveg.match(/\[[A-ZÁÉÍÓÖŐÚÜŰ][A-ZÁÉÍÓÖŐÚÜŰ \/-]{3,}\]/g)||[];
  ok("nincs benne kitöltetlen placeholder",ph.length===0,ph.join(" · "));
  ok("megnevezi az adatkezelőt",/Tóth-Gyóllai Dániel/.test(szoveg));
  ok("van benne kapcsolati e-mail",/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(szoveg));
  ok("van benne postai cím (székhely)",/\d{4}\s+Budapest/.test(szoveg));
  ok("kimondja a jogalapot (GDPR 6. cikk)",/6\.\s*cikk/.test(szoveg));
  ok("megnevezi a felügyeleti hatóságot",/NAIH|Nemzeti Adatvédelmi/.test(szoveg));
  /* MIND A HÁROM ADATKIÁRAMLÁSNAK SZEREPELNIE KELL. A lista a kódból jön —
     ha egy negyedik születik, ide is fel kell venni, és a próba fog szólni. */
  const agak=[
    ["globális ranglista",/ranglist/i],
    ["kétjátékos szoba",/szobak[oó]d/i],
    ["push-értesítés",/push-feliratkoz/i]];
  agak.forEach(([nev,re])=>ok(`a tájékoztató leírja: ${nev}`,re.test(szoveg)));
  ok("a push-szakasz megmondja, hol tárolódik és mikor törlődik",
     /szob[aá]/i.test(szoveg)&&/t[oö]rl/i.test(szoveg));
}

/* ════════ 2. A KÓD ÉS A TÁJÉKOZTATÓ EGYÜTT MOZOG ════════
   Ez a lényeg: nem azt nézzük, hogy a doksi szép-e, hanem hogy a KÓDBAN lévő
   külső hosztok mindegyike szerepel-e benne. Egy új harmadik fél némán
   érkezne — pont ez történt a push-sal. */
const kod=olv("index.html");
ok("az index.html olvasható",!!kod);
/* A KOMMENTEKET LE KELL SZEDNI, MIELŐTT HOSZTOT KERESÜNK. A kód tele van
   olyan magyarázatokkal, amik épp azt írják le, MIÉRT NEM hívunk már egy
   szolgáltatást ("korábban a fonts.googleapis.com töltötte be…"). Egy
   nyers szövegkeresés ezekre is rátalálna, és pont a MEGOLDOTT problémát
   jelentené hibaként — az első futáson pontosan ez történt. */
const kodTiszta=(kod||"")
  .replace(/\/\*[\s\S]*?\*\//g," ")
  .replace(/<!--[\s\S]*?-->/g," ");
if(kod&&adatv){
  const sz=adatv.replace(/<[^>]*>/g," ");
  const hosztok=new Set();
  (kodTiszta.match(/https?:\/\/[a-z0-9.-]+/gi)||[]).forEach(u=>{
    const h=u.replace(/^https?:\/\//i,"").toLowerCase();
    if(h==="www.w3.org")return;                 /* SVG-névtér, nem kérés */
    if(h.endsWith(".example.com"))return;
    hosztok.add(h);});
  const ismert=[
    [/gstatic/,/gstatic/i],
    [/firebasedatabase\.app|firebaseio/,/Firebase/i],
    [/fonts\.google/,/betű|font/i]];
  const ismeretlen=[...hosztok].filter(h=>!ismert.some(([re])=>re.test(h)));
  ok("a kódban nincs bejelentetlen külső hoszt",ismeretlen.length===0,ismeretlen.join(" · "));
  ok("a Firebase mint adatfeldolgozó szerepel a tájékoztatóban",/Firebase/i.test(sz));
  /* A push küldője a Netlify — ha a függvény létezik, a doksiban is kell. */
  if(van("netlify/functions/nudge.js"))
    ok("a Netlify mint adatfeldolgozó szerepel a tájékoztatóban",/Netlify/i.test(sz));
  /* A push-funkció ÉL-E: ha a kulcs ki van töltve, a doksinak muszáj tudnia róla. */
  const kulcs=(kod.match(/PUSH_VAPID_PUBLIC="([^"]*)"/)||[])[1]||"";
  ok("ha a push él, a tájékoztató is tud róla",
     !kulcs||/push/i.test(sz), kulcs?`a kulcs ${kulcs.length} karakter`:"a push alszik");
}

/* ════════ 3. MANIFEST ÉS IKONOK ════════ */
const mfRaw=olv("icons/site.webmanifest");
ok("a manifest létezik és érvényes JSON",(()=>{try{JSON.parse(mfRaw);return true;}catch(e){return false;}})());
if(mfRaw){
  let mf=null;try{mf=JSON.parse(mfRaw);}catch(e){}
  if(mf){
    ["id","name","short_name","description","lang","scope","start_url","display","icons"]
      .forEach(k=>ok(`manifest: ${k}`,mf[k]!=null&&mf[k]!==""));
    const mask=(mf.icons||[]).filter(i=>String(i.purpose||"").includes("maskable"));
    ok("van maskable ikon (192 és 512)",
       mask.some(i=>i.sizes==="192x192")&&mask.some(i=>i.sizes==="512x512"));
    ok("van 512×512-es ikon az áruházi laphoz",van("icons/icon-512x512.png"));
    const hiany=[...(mf.icons||[]),...(mf.screenshots||[])]
      .map(i=>String(i.src||"").replace(/^\//,"")).filter(p=>!van(p));
    ok("a manifest minden hivatkozott képe létezik",hiany.length===0,hiany.join(" · "));
    ok("legalább 2 képernyőkép van (a Play minimuma)",(mf.screenshots||[]).length>=2);
  }
}

/* ════════ 4. SERVICE WORKER ÉS OFFLINE ════════ */
const sw=olv("sw-1.js");
ok("a service worker létezik",!!sw);
if(sw){
  ok("a regisztrált fájlnév és a valódi egyezik",
     /navigator\.serviceWorker\.register\(\s*["']\/sw-1\.js/.test(kodTiszta));
  const lista=(sw.match(/"\/[^"]*"/g)||[]).map(x=>x.slice(2,-1)).filter(Boolean);
  const hiany=lista.filter(p=>p&&!van(p));
  ok("az előcache minden fájlja létezik",hiany.length===0,hiany.join(" · "));
  ok("a gyökér (\"/\") is elő van cache-elve — enélkül nincs offline indulás",
     /"\/"/.test(sw));
}

/* ════════ 5. ASSETLINKS (TWA) ════════ */
const al=olv(".well-known/assetlinks.json");
ok("az assetlinks.json létezik",!!al);
if(al){
  let j=null;try{j=JSON.parse(al);}catch(e){}
  ok("az assetlinks érvényes JSON",!!j);
  if(j&&j[0]){
    const fp=((j[0].target||{}).sha256_cert_fingerprints||[])[0]||"";
    const kesz=/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/i.test(fp);
    /* EZ SZÁNDÉKOSAN FIGYELMEZTETÉS, NEM BUKÁS: az ujjlenyomat csak az első
       AAB-feltöltés UTÁN derül ki, tehát a repóban helyesen placeholder áll. */
    A.push({n:"az assetlinks ujjlenyomata kitöltve",ok:kesz,figy:!kesz,
      mit:kesz?"":"a Play Console-ból, az első AAB-feltöltés után"});
    ok("az assetlinks csomagneve ki van töltve",
       /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test((j[0].target||{}).package_name||""));
  }
}

/* ════════ 6. ÁRUHÁZI SZÖVEGEK ════════ */
const lap=olv("docs/f4b-aruhazi-lap.md");
ok("az áruházi lap szövegei megvannak",!!lap);
if(lap){
  const blokk=lap.split("```");
  const kb=[1,3,5,7].map(i=>(blokk[i]||"").trim());
  ok("a rövid leírás belefér 80 karakterbe",kb[0].length>0&&kb[0].length<=80,`${kb[0].length}`);
  ok("mindhárom rövid változat belefér",kb.slice(0,3).every(x=>x.length&&x.length<=80));
  ok("a hosszú leírás belefér 4000 karakterbe",kb[3].length>0&&kb[3].length<=4000,`${kb[3].length}`);
  ok("a hosszú leírás kimondja, hogy a nevek kitaláltak",/kital[aá]lt/i.test(kb[3]));
  ok("a hosszú leírás nem ígér vásárlást vagy hirdetést",
     /Nincs hirdetés/i.test(kb[3])&&/vásárlás/i.test(kb[3]));
}

/* ════════ 6b. ÁRUHÁZI GRAFIKA ════════
   A funkciógrafika a Play EGYETLEN kötelező grafikai eleme, amit nem lehet a
   játékból kifényképezni — ezért generáljuk (tools/grafika/render.js). A
   MÉRETE PONTOS kell legyen: 1024×500, se több, se kevesebb. */
{const fg="icons/play/feature-1024x500.png";
 ok("a funkciógrafika létezik",van(fg),"tools/grafika/render.js állítja elő");
 if(van(fg)){
   /* PNG-fejléc: a 16. bájttól 4-4 bájt a szélesség és a magasság. */
   const buf=fs.readFileSync(path.join(GYOKER,fg));
   const w=buf.readUInt32BE(16),h=buf.readUInt32BE(20);
   ok("a funkciógrafika pontosan 1024×500",w===1024&&h===500,`${w}×${h}`);
   ok("a funkciógrafika mérete a Play korlátja alatt (15 MB)",buf.length<15*1024*1024,
      `${(buf.length/1024).toFixed(0)} kB`);}}

/* ════════ 7. AMI A KIADOTT BUILDBE MEGY ════════ */
ok("a release-építő megvan",van("tools/nevek/release.py"));
ok("a betűk önhosztoltak (nincs Google Fonts a kódban)",
   !!kod&&!/fonts\.googleapis\.com/.test(kodTiszta));
ok("a Firebase-szabályok forrása a repóban van",van("tools/firebase-rules.json"));

/* ════════ ÉRTÉKELÉS ════════ */
console.log("=== 🏪 KIADÁS-ELŐTTI ELLENŐRZŐ ===\n");
let bukott=0,figy=0;
A.forEach(x=>{
  const jel=x.ok?"✅":(x.figy?"⚠️ ":"❌");
  if(!x.ok){if(x.figy)figy++;else bukott++;}
  console.log(`${jel} ${x.n}${x.mit?`  ${x.ok?"·":"—"} ${x.mit}`:""}`);});
console.log(`\n${A.length-bukott-figy}/${A.length} rendben`
  +(figy?` · ${figy} figyelmeztetés (a csomagoláskor dől el)`:"")
  +(bukott?` · ${bukott} HIBA`:""));
process.exit(bukott?1:0);
