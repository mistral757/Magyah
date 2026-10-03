/* ⚖️ 3.9.184 — AZ EGYENLÍTŐ INGYEN-ZSETONJA VALÓBAN INGYEN, ÉS ELFOGY.

   Bejelentett hiba: „az egyik kihívás jutalma egy ingyenes egyenlítő boost
   volt, és azóta végtelen egyenlítő boostot tudok venni 200 M-s, kb. ingyen
   áron."
   Az ok: a zsetonnál a boostPriceOf 0-t adott, az eqPrice viszont rátette a
   100 pontos (200 M Ft-os) alsó határt — az ár sosem lett 0, a vásárlás pedig
   csak 0-s árnál fogyasztotta el a zsetont. A zseton örökre megmaradt.

   Amit mér:
     1. a régi hiba: zseton mellett az ár 0 (nem 200 M Ft);
     2. a vásárlás elhasználja a zsetont, az egyenleg nem mozdul, és az idény
        alapáras darabjai sem fogynak;
     3. utána az ár a rendes (≥ 100 pont), és a következő vásárlás fizet;
        a zseton nem jön vissza;
     4. a bolt és a megerősítő ablak „INGYEN"-t ír; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9227;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";careerPool=careerPool||{};
    careerPool["A"]={n:"A",startRating:80,peak:85,pot:3000};
    careerPool["B"]={n:"B",startRating:100,peak:100,pot:3000};
    window.eqLevel=()=>1;            /* a Béke és harmónia egyenlítője 1. szinten */
    window.saveGame=()=>{};
    S.transferBudget=1e9;S.eqBoostsUsed=0;
    S.chFreeBoost={equal:1};
    /* a megerősítő ablak: elkapjuk és jóváhagyjuk */
    let utolso=null;window.askConfirm=(c)=>{utolso=c;};
    window.boostDoneScreen=()=>{};
    window.applyEqualizeBoost=(names,lvl)=>{S.eqBoostsUsed=(S.eqBoostsUsed||0)+1;return {cel:90,sorok:names.map(n=>({n,elotte:80,utana:90}))};};
    /* 1. az ár zsetonnál */
    o.arZseton=eqPrice();
    /* 4a. a megerősítő szövege */
    boostEqConfirm(["A","B"]);
    o.megerosito=String(utolso&&utolso.html||"").replace(/<[^>]+>/g,"");
    /* 2. vásárlás */
    const egyenleg0=S.transferBudget;
    utolso.onYes();
    o.zsetonUtana=chFreeBoostLeft("equal");
    o.egyenlegValt=S.transferBudget-egyenleg0;
    o.alaparasFogyott=S.eqBoostsUsed;
    /* 3. a következő */
    o.arUtana=eqPrice();
    boostEqConfirm(["A","B"]);
    const e1=S.transferBudget;
    utolso.onYes();
    o.fizetett=e1-S.transferBudget;
    o.zsetonVissza=chFreeBoostLeft("equal");
    o.alaparas2=S.eqBoostsUsed;
    /* 4b. a bolt sora zsetonnál */
    S.chFreeBoost={equal:1};
    let bolt="";
    try{if(typeof boostOpenPanel==="function"){boostOpenPanel();bolt=$("twActions").innerText||"";}}catch(e){bolt="HIBA:"+e;}
    o.bolt=bolt;
    o.boltIngyen=/Egyenlítő[\s\S]{0,200}INGYEN/.test(bolt);o.boltVan=/Egyenlítő/.test(bolt);o.boltResz=(bolt.split("Egyenlítő")[1]||"").slice(0,160);
    return o;});
  console.log("\n— 1. a régi hiba —");
  ok(r.arZseton===0,"zseton mellett az egyenlítő ára 0 (nem 200 M Ft)",r.arZseton);
  console.log("\n— 2. a vásárlás —");
  ok(r.zsetonUtana===0,"a vásárlás elhasználja a zsetont",r.zsetonUtana);
  ok(r.egyenlegValt===0,"az egyenleg nem mozdul",r.egyenlegValt);
  ok(r.alaparasFogyott===0,"az idény alapáras darabjai sem fogynak",r.alaparasFogyott);
  console.log("\n— 3. utána —");
  ok(r.arUtana>=100,"utána a rendes ár jön (≥ 100 pont)",r.arUtana);
  ok(r.fizetett===r.arUtana&&r.zsetonVissza===0&&r.alaparas2===1,"a következő vásárlás fizet, a zseton nem jön vissza",{fizetett:r.fizetett,ar:r.arUtana,alaparas:r.alaparas2});
  console.log("\n— 4. a felület —");
  ok(/INGYEN/.test(r.megerosito)&&/kihívás-jutalom/.test(r.megerosito),"a megerősítő ablak „INGYEN — kihívás-jutalom”-at ír",r.megerosito.slice(0,200));
  ok(r.boltVan&&r.boltIngyen,"a boltban az egyenlítő sora „INGYEN”-t ír",r.boltResz);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
