/* 🔍 3.9.334 — AZ EDZŐ ELEMZÉSE A VÉGEREDMÉNYRE SZÁMOL, A NEM-xG GÓLOK ESÉLYÉVEL.

   BEJELENTÉS (képernyőkép): 2:2, a meccserők 2,6 : 0,6-ot, a pálya 3,1 : 0,6-ot
   ígért, +1 kapott gól a gólvárhatóságon kívülről. Az elemzés „kb. 3
   meccsből egyszer"-t írt — mert csak a gólvárhatóságból jött 2:1-re
   számolt, és a 11-es / öngól esélyét sem vette számba.

   Amit mér:
     1. a bejelentett eset: a valószínűség a 2:2-re, a nem-xG gólok rátájával
        (alap 0,15) — kb. 7 meccsből egyszer; a szöveg kimondja az eredményt;
     2. a nem-xG gólok rátája a karrierből mérődik (20 meccstől), és mentődik;
     3. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9334;
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
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(500);

  console.log("\n— 1. a bejelentett eset —");
  const t1=await p.evaluate(()=>{
    S.mxExtra=null;
    const MX={o:{n:18,xg:3.1,pg:2,ln:{}},a:{n:18,xg:0.6,pg:1,ln:{}},lf0:2.6,la0:0.6,preO:{},preA:{}};
    const X=mxVege(MX,2,2);const tx=mxSzoveg(X).replace(/<[^>]+>/g,"");
    const regi=mxPoisCdfDiff(3.1,0.6,1),uj=mxPoisCdfDiff(3.25,0.75,0);
    /* ugyanaz a meccs-objektum másodszor nem könyvel */
    mxVege(MX,2,2);
    return {p:X.pRossz,regi,uj,tx,extra:X.extra,M:JSON.parse(JSON.stringify(S.mxExtra))};});
  ok(Math.abs(t1.p-t1.uj)<1e-9&&Math.round(1/t1.p)===7&&Math.round(1/t1.regi)===3,"a 2:2-re számol a nem-xG gólok esélyével: kb. 7 meccsből egyszer (régen: 3)",{p:t1.p,regi:t1.regi});
  ok(/\(2:2\)/.test(t1.tx)&&/kb\. 7 meccsből egyszer/.test(t1.tx)&&/11-esek, öngólok/.test(t1.tx)&&/\+1 kapott/.test(t1.tx),"a szöveg kimondja az eredményt és azt, hogy a 11-es/öngól esélye is benne van",t1.tx);
  ok(t1.M&&t1.M.n===1&&t1.M.a===1&&t1.M.o===0,"a meccs nem-xG góljai a karrier mérésébe kerülnek (egyszer)",t1.M);

  console.log("\n— 2. a mért ráta —");
  const t2=await p.evaluate(()=>{
    S.mxExtra={n:40,o:4,a:16};const r=mxExtraRata();
    S.mxExtra={n:5,o:5,a:5};const r0=mxExtraRata();
    S.mxExtra={n:40,o:4,a:16};saveGame();const d=loadSavedGame();
    return {r,r0,mentve:!!(d&&d.S&&d.S.mxExtra&&d.S.mxExtra.n===40)};});
  ok(t2.r.mert&&Math.abs(t2.r.o-0.1)<1e-9&&Math.abs(t2.r.a-0.4)<1e-9&&!t2.r0.mert&&t2.r0.o===0.15,"20 meccstől a karrier mért rátája, addig 0,15",t2);
  ok(t2.mentve,"a mért ráta mentődik",t2.mentve);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
