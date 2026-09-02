#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────────────────────
 *  MAGYAH 30-0 — KÉPERNYŐ-PRÓBA: marad-e valós név a KÉPERNYŐN?
 *
 *  MIÉRT VAN, HA MÁR VAN NÉVAUDIT. A `nev-audit.js` a KÓDOT nézi: kiírási
 *  helyeket és ismert névforrásokat párosít. Ez erős háló, de két dolgot nem
 *  tud megfogni:
 *
 *    1. AMI NEM KIÍRÁS, HANEM ÁLLAPOT. A kész klubos karrierindításnál a
 *       `teamName` változó MAGA kapta meg a klub kanonikus nevét — onnantól
 *       hatvan helyről íródott ki, mindegyik szabályosan. A kód hibátlan volt;
 *       a képernyőn mégis „IFK Göteborg" állt, a fejlécen, a tabellán, az
 *       eredményjelzőn és a meccs-statisztikában is.
 *    2. AMI CSAK EGY ÚTVONALON JÖN ELŐ. Egy kártya, egy ablak, egy ág.
 *
 *  Ez a szkript ezért a MÁSIK oldalról méri ugyanazt: végigjátssza a karrier
 *  indítását és egy mérkőzést, és lépésenként megnézi, hogy a képernyő
 *  szövegében szerepel-e a HU_NAME_TABLE / HU_CLUB_TABLE / HU_LEAGUE_TABLE
 *  bármelyik KANONIKUS kulcsa. Ha igen, megmondja, MELYIK ELEMBEN.
 *
 *  Nem bizonyítás (nem járja be a teljes játékot), hanem próba — de pontosan
 *  azt az osztályt fogja meg, amit a statikus háló elvileg sem tud.
 *
 *  Használat:   node tools/nevek/kepernyo-proba.js
 *  Kilépési kód 0 = nem találtunk valós nevet a képernyőn.
 * ───────────────────────────────────────────────────────────────────────────── */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=path.join(__dirname,"..","..");
const PORT=8971;

/* Saját, apró statikus kiszolgáló: a játék abszolút útvonalakkal hivatkozik a
   betűkre és az ikonokra (/fonts, /icons), tehát a file:// nem elég. */
function serve(){
  const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
    ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
  return new Promise(res=>{
    const s=http.createServer((req,rp)=>{
      let f=decodeURIComponent(req.url.split("?")[0]);
      if(f==="/")f="/index.html";
      const abs=path.join(ROOT,f);
      if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
      rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
      fs.createReadStream(abs).pipe(rp);});
    s.listen(PORT,"127.0.0.1",()=>res(s));});
}

let chromium;
try{({chromium}=require("playwright"));}
catch(e){try{({chromium}=require("/opt/node22/lib/node_modules/playwright"));}
catch(e2){console.error("✗ Nincs playwright. Telepítsd, vagy futtasd ott, ahol elérhető.");process.exit(2);}}

(async()=>{
  const srv=await serve();
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  const talalt=new Map();

  /* EGY MÉRÉS. A találatnál megkeressük a LEGSZŰKEBB elemet, ami tartalmazza —
     enélkül a jelentés annyit mondana, hogy „valahol a body-ban". */
  const scan=async hol=>{
    const r=await p.evaluate(()=>{
      const t=document.body.innerText||"";
      const out=[];
      const nez=(tabla,cimke,minHossz)=>{
        Object.keys(tabla||{}).forEach(k=>{
          if(k.length<=minHossz||!t.includes(k))return;
          let hol="?";
          const walk=e=>{
            for(const ch of e.children)
              if((ch.innerText||"").includes(k)){walk(ch);return;}
            hol=(e.tagName||"")+(e.id?"#"+e.id:"")+" :: "+(e.innerText||"").slice(0,80).replace(/\n/g," / ");};
          walk(document.body);
          out.push(cimke+": "+k+"   @ "+hol);});};
      nez(typeof HU_NAME_TABLE!=="undefined"?HU_NAME_TABLE:null,"NÉV",7);
      nez(typeof HU_CLUB_TABLE!=="undefined"?HU_CLUB_TABLE:null,"KLUB",6);
      nez(typeof HU_LEAGUE_TABLE!=="undefined"?HU_LEAGUE_TABLE:null,"LIGA",6);
      return out;});
    r.forEach(x=>{if(!talalt.has(x))talalt.set(x,hol);});};

  const varj=ms=>p.waitForTimeout(ms);
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await varj(900);
  await scan("kezdőlap");

  await p.evaluate(()=>{const b=[...document.querySelectorAll("button")]
    .find(e=>e.offsetParent&&/Egyedül játszom/.test(e.innerText));if(b)b.click();});
  await varj(400);
  await p.click("#modeCareerDynBtn").catch(()=>{});
  await varj(500);

  /* Beállítás — és KÉSZ KLUBOS indulás: az a leggyorsabb út a szezonig, és
     épp az az ág, ahol a legutóbbi szivárgás volt. */
  for(let k=0;k<20;k++){
    const cs=await p.$('button[data-cs="club"]');
    if(cs&&await cs.isVisible()){await cs.click().catch(()=>{});await varj(250);}
    await scan("beállítás");
    let ment=false;
    for(const s of ["#setupNextBtn","#startBtn"]){
      const e=await p.$(s);
      if(e&&await e.isVisible()){await e.click().catch(()=>{});await varj(250);ment=true;break;}}
    if(!ment)break;}

  for(let k=0;k<14;k++){
    if(await p.evaluate(()=>phase!=="draft"))break;
    await scan("scout és klubválasztás");
    await p.evaluate(()=>{
      const bs=[...document.querySelectorAll("button")].filter(e=>e.offsetParent&&!e.disabled);
      const t=e=>(e.innerText||"").trim();
      const pick=bs.find(e=>/^Ezzel a klubbal indulok/.test(t(e)))
        ||bs.find(e=>/^Sorsolás|^Irány a|^Irány az/.test(t(e)))
        ||bs.find(e=>/\(\d{4}\/\d{2}\)/.test(t(e)));
      if(pick)pick.click();});
    await varj(1100);}

  let kapitanyKesz=false;
  for(let k=0;k<40;k++){
    if(await p.evaluate(()=>phase==="season"))break;
    await scan("kémia · edző · kapitány · kihívások");
    const mit=await p.evaluate(kk=>{
      const lat=id=>{const e=document.getElementById(id);
        return e&&e.offsetParent&&!e.classList.contains("hide")&&!e.disabled?e:null;};
      const e=lat("chemOk")||lat("coachOk")||lat("coachSpinBtn")||lat("skillSpinBtn");
      if(e){e.click();return "id";}
      const bs=[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&!x.disabled);
      const t=x=>(x.innerText||"").trim();
      const pick=bs.find(x=>/^Értem$|^Ne mutass több tippet|^Őt választom|^Ezzel indulunk|^Rendben, tovább|^Igen,|^Elfogadom|^Vállalom|^Kihagyom|^Bezár|^Tovább$|^Irány a szezon|^Kész — tovább/.test(t(x)));
      if(pick){pick.click();return "gomb";}
      const sa=document.getElementById("skillAssignList");
      if(sa&&sa.offsetParent){const q=sa.querySelector("button");if(q){q.click();return "skill";}}
      if(phase==="captain"&&!kk){
        try{if(pendingCaptainIdx<0)selectCaptainCandidate(0,true);}catch(_){}
        const cb=document.getElementById("capConfirmBtn");
        if(cb&&!cb.classList.contains("hide")){cb.click();return "kapitany";}}
      return null;},kapitanyKesz);
    if(mit==="kapitany")kapitanyKesz=true;
    await varj(650);}
  await scan("szezon");

  /* Egy teljes mérkőzés: a közvetítés, az eredményjelző és a lefújás. */
  for(let k=0;k<6;k++){
    if(await p.evaluate(()=>S.playing))break;
    await p.evaluate(()=>{try{kickoffTap();}catch(e){}});
    await varj(1200);}
  for(let k=0;k<200;k++){
    if(await p.evaluate(()=>!S.playing&&!!S.lastMatch))break;
    if(k%10===0)await scan("mérkőzés");
    await varj(500);}
  await scan("lefújás");
  await p.evaluate(()=>{try{mstatShow();}catch(e){}});
  await varj(700);
  await scan("meccs-statisztika");

  await b.close();srv.close();

  if(errs.length){
    console.log("✗ oldalhiba a próba alatt:");
    errs.slice(0,4).forEach(e=>console.log("   ",e));}
  if(!talalt.size){
    console.log("✓ a próbált útvonalakon egyetlen kanonikus név sem került a képernyőre");
    process.exit(errs.length?1:0);}
  console.log(`✗ ${talalt.size} kanonikus név a képernyőn:\n`);
  talalt.forEach((hol,x)=>console.log(`  [${hol}]  ${x}`));
  console.log(`
  Javítás: a kiírás menjen a megjelenítési rétegen —
    játékosnév → fullName(...) / shortName(...)
    klubnév    → teamLabel(...) / clubLabel(...)
    liganév    → leagueLabel(...)
  Ha egy VÁLTOZÓ hordozza a nevet (mint a teamName), ott nem a hatvan kiírást
  kell burkolni, hanem MÁR AZ ÉRTÉKADÁSNÁL a magyarított nevet eltenni.`);
  process.exit(1);
})().catch(e=>{console.error("✗ a próba elszállt:",e&&e.message);process.exit(2);});
