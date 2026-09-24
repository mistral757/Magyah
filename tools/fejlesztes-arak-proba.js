/* 💰 A FEJLESZTÉSEK ÁRA: BÜDZSÉHEZ MÉRVE, KEZDŐ KEDVEZMÉNNYEL (3.9.135).

   KIMONDOTT KÉRÉS: „A felállás módosítás is scalelődjön árban, akárcsak a
   pozíció tanulás. És a stáb bővítés is, a scout erősítés, az átigazolási
   ügynökség fejlesztés. Mindenen legyen ott az 50 és 33% kedvezmény 1. és
   2. szezonban, mint a boostokon."

   Amit mér:
     1. a referencia-büdzsénél (10 000 pont), a 3. idényben a régi fix árak
        BETŰRE megmaradnak (felállás 5000, stáb 10 000·1,75ⁿ, scout görbe,
        ügynökség ×2);
     2. a kétszeres büdzsé kétszeres árat ad, a fele felét — mind a négynél;
     3. az 1. idényben −50%, a 2.-ban −33%, a 3.-tól teljes ár — mind az
        ötnél (a poszt-tanulás is);
     4. az idei első felállásváltás továbbra is ingyenes;
     5. a képernyők kiírják a kedvezményt (és a 3. idényben nem);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9135;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof coachSlotPrice==="function",null,{timeout:15000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";
    if(!scout)scout={name:"Teszt",stars:3.5};
    scout.stars=3.5;
    S.boostDiscount=0;
    let B=10000;
    const _cbs=clubBudgetScale;
    clubBudgetScale=()=>B;
    const pl=slots.find(s=>s.player).player,ent=careerPool[pl.n]||(careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr});
    if(!ent.attrs)initPlayerAttrs(ent);
    const arak=()=>{
      S.formationChangesThisSeason=1;
      const o={form:formationChangeCost(),stab3:coachSlotPrice(3),stab5:coachSlotPrice(5),
        scout:scoutUpgradePrice(3.5),agency:agencyUpgradePrice(),pos:posLearnCost(ent),
        agencyVart:Math.round(scoutUpgradePrice(agencyStars())*2/500)*500};
      S.formationChangesThisSeason=0;o.formIngyen=formationChangeCost();
      return o;};
    /* régi (fix) árak a referenciánál */
    const regiScout=(()=>{const st=3.5,bb=Math.log(20)/8,a=5000/Math.exp(bb);
      return Math.round(a*Math.exp(bb*st)*(1+0.28*Math.exp(-Math.pow((st-4.5)/2.4,2)))*SCOUT_PRICE_MULT/500)*500;})();
    ki.regi={form:FORMATION_CHANGE_COST,stab3:10000,stab5:Math.round(10000*1.75*1.75),scout:regiScout};
    S.seasonNumber=3;
    ki.ref=arak();
    B=20000;ki.dupla=arak();
    B=5000;ki.fel=arak();
    B=10000;
    S.seasonNumber=1;ki.sz1=arak();
    S.seasonNumber=2;ki.sz2=arak();

    /* ---- a képernyők ---- */
    const kep=()=>{
      const o={};
      try{S.formationChangesThisSeason=1;renderFormationPicker();
        o.form=/−\d+% \(\d\. idény\)/.test(document.getElementById("hubFormationHint").innerHTML);}catch(e){o.form="hiba: "+e.message;}
      try{renderScoutUpgradePanel();o.scout=/−\d+% \(\d\. idény\)/.test(document.getElementById("twBody").innerHTML);}catch(e){o.scout="hiba: "+e.message;}
      try{renderAgencyUpgradePanel();o.agency=/−\d+% \(\d\. idény\)/.test(document.getElementById("twBody").innerHTML);}catch(e){o.agency="hiba: "+e.message;}
      S.formationChangesThisSeason=0;
      return o;};
    S.seasonNumber=1;ki.kep1=kep();
    S.seasonNumber=3;ki.kep3=kep();
    clubBudgetScale=_cbs;
    return ki;});

  const k=["form","stab3","stab5","scout"];
  console.log("\n— 1. A REFERENCIÁN A RÉGI ÁR —");
  /* 1% tűrés: az új ár 500-ra kerekít (a stáb-hely régi ára kerekítetlen volt) */
  k.forEach(x=>ok(Math.abs(t.ref[x]/t.regi[x]-1)<=0.01,`${x}: 10 000-es büdzsénél, 3. idényben a régi ár (±1% kerekítés)`,{most:t.ref[x],regi:t.regi[x]}));
  ok(t.ref.agency===t.ref.agencyVart,"az ügynökség a (saját csillagszintjén vett) scout-ár kétszerese",{a:t.ref.agency,vart:t.ref.agencyVart});

  console.log("\n— 2. A BÜDZSÉVEL ARÁNYOS —");
  k.concat(["agency","pos"]).forEach(x=>{
    ok(Math.abs(t.dupla[x]/t.ref[x]-2)<0.03,`${x}: kétszeres büdzsé → kétszeres ár`,{ref:t.ref[x],dupla:t.dupla[x]});
    ok(Math.abs(t.fel[x]/t.ref[x]-0.5)<0.03,`${x}: fele büdzsé → fele ár`,{ref:t.ref[x],fel:t.fel[x]});});

  console.log("\n— 3. A KEZDŐ KEDVEZMÉNY —");
  k.concat(["agency","pos"]).forEach(x=>{
    ok(Math.abs(t.sz1[x]/t.ref[x]-0.50)<0.03,`${x}: 1. idény −50%`,{sz1:t.sz1[x],teljes:t.ref[x]});
    ok(Math.abs(t.sz2[x]/t.ref[x]-0.67)<0.03,`${x}: 2. idény −33%`,{sz2:t.sz2[x],teljes:t.ref[x]});});

  console.log("\n— 4-5. INGYENES VÁLTÁS, KÉPERNYŐK —");
  ok(t.sz1.formIngyen===0&&t.ref.formIngyen===0,"az idei első felállásváltás ingyenes marad",{sz1:t.sz1.formIngyen,sz3:t.ref.formIngyen});
  ok(t.kep1.form===true&&t.kep1.scout===true&&t.kep1.agency===true,"az 1. idényben a képernyők kiírják a kedvezményt",t.kep1);
  ok(t.kep3.form===false&&t.kep3.scout===false&&t.kep3.agency===false,"a 3. idényben nincs kedvezmény-címke",t.kep3);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
