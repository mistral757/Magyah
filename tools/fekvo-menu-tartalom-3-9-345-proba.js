/* 🖥️ FEKVŐ / PC: A MENÜBŐL NYÍLÓ TARTALOM A KÖZÉPSŐ SZÉLES SÁVBAN (3.9.345).

   KIMONDOTT KÉRÉS: „Telefonon, fekvő módban és pc-n minden oldalsó menüsávban
   szereplő cucc úgy jelenjen meg, hogy töltse ki a középső nagy széles részt."

   Amit mér, 1366×768-on (PC) és 844×390-en (fekvő telefon):
     1. a Csapatstílus törzse NEM a bal sávban nyílik, hanem a jobb oszlop fölött
        lebeg, annak teljes szélességében; a ✕ Bezár becsukja;
     2. a bal sáv egy MÁSIK menüpontja becsukja a lebegő panelt;
     3. a talizmán- és a csapat-panel ablaka a jobb oszlopot tölti ki, nem lóg
        rá a bal sávra;
     4. a felállásváltó a széles lapszélességet kapja (nem 520 px);
     5. állva semmi nem változik (a törzs a menüben marad, a ✕ rejtve). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9372;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
async function kor(b,VW,VH){
  const p=await (await b.newContext({viewport:{width:VW,height:VH}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    return {idx:S.idx};});
  await p.evaluate(()=>{S.idx=3;guideShowNext=()=>{};
    document.querySelectorAll("body>section").forEach(x=>x.classList.add("hide"));
    openHubMidSeason();
    document.querySelectorAll("#guideTip,#guideDim,.guideDim").forEach(x=>x.remove());
    /* a Csapatstílus-csoport a 2. idénytől látszik — itt elég, hogy kinyitható */
    $("hubStyleGroup").classList.remove("hide");});
  await p.waitForTimeout(500);
  const r=await p.evaluate(()=>{
    const o={};const land=document.body.classList.contains("hubLand");o.land=land;
    const menuR=$("hubActions").getBoundingClientRect().right;o.menuR=Math.round(menuR);
    const rect=el=>{const q=el.getBoundingClientRect();return {x:Math.round(q.left),w:Math.round(q.width),r:Math.round(q.right)};};
    $("hubStyleBtn").click();
    const body=$("hubStyleGroup").querySelector(".accBody");
    o.stilus=rect(body);o.stilusFix=getComputedStyle(body).position;
    const x=body.querySelector(".hubKeepClose");o.xLatszik=!!(x&&x.offsetParent);
    if(x&&x.offsetParent){x.click();o.xUtan=body.classList.contains("hide");}
    /* a másik menüpont becsukja */
    $("hubStyleBtn").click();
    const grp=$("hubTalBtn").closest(".accBody");
    let h=$("hubTalBtn").parentElement;while(h&&h.id!=="hubActions"){h.classList.remove("hide");h=h.parentElement;}
    $("hubTalBtn").click();
    o.masikUtan=body.classList.contains("hide");
    o.tal=rect($("talModal").querySelector(".card"));
    try{talMenuClose();}catch(e){}
    $("hubMeccseroBtn").click();
    o.csp=rect($("cspModal").querySelector(".card"));
    $("cspModal").classList.add("hide");
    $("hubFormationBtn").click();
    o.felall=rect($("hubFormationPicker"));
    return o;});
  await p.close();
  return {r,errs};}
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  for(const [VW,VH] of [[1366,768],[844,390]]){
    console.log(`\n— ${VW}×${VH} —`);
    const {r,errs}=await kor(b,VW,VH);
    const jobb=VW-r.menuR;
    ok(r.land,"fekvő HUB (hubLand)",r.land);
    ok(r.stilusFix==="fixed"&&r.stilus.x>=r.menuR&&r.stilus.w>=jobb-40,"1. a Csapatstílus a jobb oszlop fölött, teljes szélességben",{stilus:r.stilus,menuR:r.menuR});
    ok(r.xLatszik&&r.xUtan,"1. a ✕ Bezár látszik és becsuk",r);
    ok(r.masikUtan,"2. másik menüpont becsukja a lebegő panelt",r.masikUtan);
    ok(r.tal.x>=r.menuR&&r.tal.w>=Math.min(1180,jobb-40),"3. a talizmán-ablak a jobb oszlopot tölti ki",{tal:r.tal,menuR:r.menuR});
    ok(r.csp.x>=r.menuR&&r.csp.w>=Math.min(1180,jobb-40),"3. a csapat-panel a jobb oszlopot tölti ki",{csp:r.csp,menuR:r.menuR});
    ok(r.felall.w>Math.min(560,VW-60),"4. a felállásváltó széles",r.felall);
    ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));}
  console.log("\n— 390×844 (álló) —");
  const {r,errs}=await kor(b,390,844);
  ok(!r.land&&r.stilusFix!=="fixed"&&!r.xLatszik,"5. állva a törzs a menüben marad, a ✕ rejtve",{land:r.land,fix:r.stilusFix,x:r.xLatszik});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
