/* ⚽ 3.9.304 — KUPAMECCS: „IRÁNY A MECCS" — A BAJNOKI MECCSNÉZET A KUPÁBAN IS.

   KÉRÉS: „a kupa meccseknél nem az kéne hogy a kupa menüből lehet közvetlenül
   indítani a meccset hanem […] irány a meccshez és aztán ott megint jöjjön az
   a képernyő ami a bajnokság közben is és ott lehet nyomni a felkészülés a
   meccsre gombot meg ott lehet nyomni egy edzői elemzést vagy a kihívások
   megtekintését satöbbi"

   Amit mér:
     1. a kupa-képernyő gombja „Irány a meccs" — és NEM indít meccset: a
        meccsnézet nyílik (a kupa-képernyő rejtve), a végigjátszás gombja
        rejtve, a „Vissza a kupa-táblához" és az edzői elemzés látszik;
     2. a kezdőrúgás két lépésben: 🔍 Felkészülés (meccs nélkül) → ⚽
        Kezdőrúgás (a kupameccs indul);
     3. az edzői elemzés a kupameccsre szól;
     4. vissza a kupa-táblához;
     5. a végigjátszás és a lánc egyenesen indít;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9304;
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
    try{hubMidSeasonReturn();}catch(e){}
    /* a cserepad és a tartalék feltöltése a pool-ból */
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const tobbi=Object.values(careerPool).filter(e=>e&&!kezdo.has(e.n)&&e.pos&&e.pos.length).slice(0,9);
    BENCH_KEYS.forEach((k,i)=>{const e=tobbi[i];if(!e)return;if(!e.attrs)initPlayerAttrs(e);e.age=21;
      BENCH[k]={n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:21};});
    tobbi.slice(BENCH_KEYS.length).forEach(e=>{if(!e.attrs)initPlayerAttrs(e);extraRoster.push({n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:e.age||24});});});
  await p.waitForTimeout(800);


  const lat=id=>{const e=document.getElementById(id);return !!(e&&!e.classList.contains("hide"));};
  await p.evaluate(()=>{
    window._pm=0;window._ses=0;
    window.playMatch=function(){window._pm++;};
    const _se=window.showEuroScreen;window.showEuroScreen=function(){window._ses++;try{_kupaElo=false;kupaGombok(false);}catch(e){}};
    phase="verdict";S.seasonClosed=true;S.idx=30;S.playing=false;S.auto=false;S.unavailable={};S.immersion=false;
    S.euro={stage:"group",comp:"EL",idx:0,md:0,userG:0,userIdx:0,
      fixtures:[{o:{n:"Teszt Kupacsapat FC",ovr:80},home:true}],path:[],teams:[]};
    $("scEuro").classList.remove("hide");$("scSim").classList.add("hide");});
  console.log("— 1. Irány a meccs —");
  const a=await p.evaluate(()=>{const o={};
    o.felirat=String(renderEuroScreen).indexOf("Irány a meccs")>0;
    $("euroKickBtn").classList.remove("hide");$("euroKickBtn").click();
    o.pm=window._pm;
    o.euroRejtve=$("scEuro").classList.contains("hide");o.sim=!$("scSim").classList.contains("hide");
    o.auto=$("autoBtn").classList.contains("hide");o.vissza=!$("kupaVisszaBtn").classList.contains("hide");
    o.kick=$("kickBtn").textContent;
    return o;});
  await p.waitForTimeout(100);
  const a2=await p.evaluate(()=>({elemzes:!$("edzoElemKickBtn").classList.contains("hide"),elemzesTx:$("edzoElemKickBtn").textContent}));
  ok(a.felirat&&a.pm===0&&a.euroRejtve&&a.sim,"a kupa gombja „Irány a meccs”: a meccsnézet nyílik, meccs nem indul",a);
  ok(a.auto&&a.vissza&&a2.elemzes,"a végigjátszás rejtve; „Vissza a kupa-táblához” és az edzői elemzés látszik",Object.assign({},a,a2));

  console.log("\n— 2. felkészülés → kezdőrúgás —");
  const k=await p.evaluate(()=>{const o={};
    o.l1=$("kickBtn").textContent;
    $("kickBtn").click();o.pm1=window._pm;o.l2=$("kickBtn").textContent;
    o.elo=[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).some(t=>/FELKÉSZÜLÉS/.test(t)&&/Teszt|kupa|KUPA/i.test(t))||
      [...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).some(t=>/Teszt Kupacsapat/.test(t));
    $("kickBtn").click();o.pm2=window._pm;o.elo2=kupaElo();o.auto=!$("autoBtn").classList.contains("hide");
    return o;});
  ok(/Felkészülés/.test(k.l1)&&k.pm1===0&&/Kezdőrúgás/.test(k.l2)&&k.elo,"első koppintás: 🔍 Felkészülés (meccs nélkül, az eligazítással)",k);
  ok(k.pm2===1&&!k.elo2&&k.auto,"második: ⚽ Kezdőrúgás — a kupameccs indul, a meccsnézet gombjai helyreállnak",k);

  console.log("\n— 3. az edzői elemzés a kupameccsre —");
  const e=await p.evaluate(()=>{const M=edzoKovetkezoMeccs();return {van:!!M,ellen:M&&M.fx.o.n,kulcs:M&&M.kulcs};});
  ok(e.van&&e.ellen==="Teszt Kupacsapat FC"&&/:e:[A-Z]+:[a-z0-9]+:\d+:0:Teszt Kupacsapat FC$/.test(e.kulcs),"az edzői elemzés a kupameccsre szól (3.9.314: a kulcsban sorozat, szakasz, kör, index, ellenfél)",e);

  console.log("\n— 4. vissza a kupa-táblához —");
  const v=await p.evaluate(()=>{const o={};const s0=window._ses;
    $("euroKickBtn").click();$("kupaVisszaBtn").click();
    o.ses=window._ses-s0;o.elo=kupaElo();o.pm=window._pm;return o;});
  ok(v.ses===1&&!v.elo&&v.pm===1,"a gomb visszavisz a kupa-táblához, meccs nélkül",v);

  console.log("\n— 5. végigjátszás és lánc: egyenesen —");
  const d=await p.evaluate(()=>{const o={};const p0=window._pm;
    S.auto=true;$("euroKickBtn").click();o.auto=window._pm-p0;S.auto=false;
    _immKupa=true;try{$("euroKickBtn").click();}finally{_immKupa=false;}o.lanc=window._pm-p0-o.auto;
    o.horog=String(immCupArm).indexOf("_immKupa=true")>0;
    return o;});
  ok(d.auto===1&&d.lanc===1&&d.horog,"a végigjátszás és a meccsről-meccsre lánc egyenesen indít",d);

  console.log("\n— 6. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
