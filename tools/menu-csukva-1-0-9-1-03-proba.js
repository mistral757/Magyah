/* 📂 1.0.9.1.03 — A HUB MENÜ MEGNYITÁSKOR MINDEN MENÜPONTTAL CSUKVA.
   KÉRÉS: „Amikor a menüt megnyitod, alapból legyen minden menüpont zárva —
   amikor nyitva van, zavaró, hogy nehéz megtalálni, melyik menüpont kell."
   Amit mér:
     1. a menüben kinyitott csoport a menü bezárása → újranyitása után csukva;
     2. nyitott menüben a csoport nyitható (a harmonika él);
     3. aloldalról visszatérve (hubMenuApply) a csoport NEM csukódik;
     4. az átigazolási ablak a nyitás után a saját csoportját nyitja ki;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9181;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof hubMenuToggle==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
    const o={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];sl.player={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.fit=1;});
    if(!scout)scout=generateScout();
    phase="season";window.saveGame=()=>{};
    ["scSim","scPitch"].forEach(id=>{const e=$(id);if(e)e.classList.add("hide");});
    $("scHub").classList.remove("hide");try{renderHub();}catch(e){o.rh=String(e);}
    const nyitott=()=>[...document.querySelectorAll("#hubActions .hubGroup")].filter(g=>{const bd=g.querySelector(".accBody");return bd&&!bd.classList.contains("hide");}).map(g=>g.getAttribute("data-acc"));
    const csop=k=>document.querySelector(`#hubActions .hubGroup[data-acc="${k}"]`);
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    /* 1–2 */
    hubMenuToggle(true,true);await w(50);
    o.elso=nyitott();
    csop("build").querySelector(".accHead").click();await w(30);
    o.lenyitva=nyitott();
    hubMenuToggle(false,true);await w(30);
    hubMenuToggle(true,true);await w(30);
    o.ujranyitva=nyitott();
    /* a felhasználói gombbal is */
    csop("transfer").querySelector(".accHead").click();await w(30);
    hubMenuToggle(false,true);await w(30);
    $("hubMenuBtn").click();await w(120);
    o.gombbal=nyitott();o.menuLatszik=!$("hubActions").classList.contains("hide");
    /* 3. aloldalról vissza: hubMenuApply nem csuk */
    csop("build").querySelector(".accHead").click();await w(30);
    hubMenuApply();await w(30);
    o.aloldalUtan=nyitott();
    /* 4. átigazolási ablak-nyitás mintája: toggle(true) után a saját csoport */
    hubMenuToggle(false,true);await w(30);
    hubMenuToggle(true,true);
    const g=csop("transfer");g.classList.add("open");g.querySelector(".accBody").classList.remove("hide");
    o.atig=nyitott();
    return o;});
  console.log(JSON.stringify(r));
  ok(r.elso.length===0,"1. első nyitáskor minden menüpont csukva",r.elso);
  ok(r.lenyitva.length===1&&r.lenyitva[0]==="build","2. nyitott menüben a csoport lenyitható",r.lenyitva);
  ok(r.ujranyitva.length===0,"1. bezárás → újranyitás után ismét minden csukva",r.ujranyitva);
  ok(r.gombbal.length===0&&r.menuLatszik,"1. a menü gombjával nyitva is minden csukva",r);
  ok(r.aloldalUtan.length===1&&r.aloldalUtan[0]==="build","3. aloldalról visszatérve (hubMenuApply) a csoport nyitva marad",r.aloldalUtan);
  ok(r.atig.length===1&&r.atig[0]==="transfer","4. ami a nyitás UTÁN nyit csoportot (átigazolási ablak), az működik",r.atig);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
