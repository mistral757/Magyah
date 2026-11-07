/* 🔍 1.0.4.16.00 — AZ EDZŐI ELEMZÉS MINDEN GÓLFORRÁST LÁT.

   BEJELENTÉS: „Az edzői elemzések érzésem szerint nem tudnak minden
   csapatstílus képességgel számolni. A gegenpressing nyomásgyakorlásos
   büntetésből származó góljait szinte biztos, hogy nem tudja figyelembe
   venni." — „Az egész edzői elemzés dolgot finomítani kellene, és
   átláthatóbbá, fülekkel lenyithatóvá tenni."
   Amit mér (VALÓDI meccsekkel, a motorral):
     1. maxolt gegenpressinggel a büntetés-gólok forrásként kerülnek az
        elemzésbe (pontosan annyi, amennyi a meccsen esett), a várható értékük
        vödrönként gyűlik, és a tényezők között is ott vannak;
     2. a forrásonkénti bontás összege = a gólvárhatóságon kívüli gólok;
     3. a szerencse-számítás a csatorna várható gólját is beszámítja (λ-ba);
     4. az általános mérésbe (11-es, öngól…) a pressing-gól nem kerül;
     5. a felület: összefoglaló + három lenyitható fül;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9139;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof mxForras==="function"&&typeof gpOn==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"az elemzés gólforrás-függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";
    window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";
    const mind=(lv)=>({nyomasgyakorlas:lv,buntetes:lv,gyilkos_paros:lv,felfutasok:lv,
      kikenyszeritett_hiba:lv,nem_kell_labda:lv,nyomas_skill:lv,sorsolas:lv,
      csillagozhato_nyomas:lv,nyomas_iskola:lv,szerepek:lv});
    S.style={key:"gegen",chosenSeason:1,traits:mind(3),ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
    try{roleAttrCacheClear();}catch(e){}try{styleLvlCacheClear();}catch(e){}
    ki.gpOn=gpOn();
    S.mxExtra=null;
    /* a büntetés esélyét felhúzzuk, hogy kevés meccsből is legyen pressing-gól */
    const _pp=gpPunishP;window.gpPunishP=a=>Math.min(0.95,_pp(a)*3+0.3);
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const meccsek=[];
    for(let k=0;k<12;k++){
      S.unavailable={};S.lastMatch=null;S.idx=k%10;
      try{utoLancVege();mEloTorol();}catch(e){}
      const gp0=gpGoalsAll();S.auto=true;
      playMatch();
      for(let i=0;i<600&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
      const press=gpGoalsAll()-gp0;
      const M=S.lastMatch;if(!M||!M.mx)continue;
      const X=M.mx;
      const sumO=Object.values(X.forr.o).reduce((a,b)=>a+b,0),sumA=Object.values(X.forr.a).reduce((a,b)=>a+b,0);
      meccsek.push({gf:M.gf,ga:M.ga,press,forrPress:X.forr.o.press||0,exPress:X.exv.o.press||0,
        sumO,sumA,extra:X.extra,tetPress:(X.tet||[]).some(t=>t.cs&&t.k==="press"),
        lamO:X.lam.o,xgO:X.xg.o,altO:X.alt.o,egyeb:(X.forr.o.egyeb||0)+(X.forr.a.egyeb||0)});
      if(press>=2&&!ki.minta){ki.minta=X;ki.html=mxHtml(X);ki.szoveg=mxSzoveg(X,true).replace(/<[^>]+>/g,"");}}
    window.gpPunishP=_pp;
    ki.meccsek=meccsek;ki.E=JSON.parse(JSON.stringify(S.mxExtra||null));
    return ki;});
  const M=t.meccsek;
  console.log("\n— 1. a pressing-gól forrásként —");
  ok(t.gpOn&&M.length>=10,"maxolt gegenpressing, lejátszott meccsek",{on:t.gpOn,n:M.length,sfs:t.sfs});
  ok(M.every(m=>m.forrPress===m.press),"a büntetés-gól minden meccsen pontosan annyi forrásként, ahány esett",M.map(m=>[m.press,m.forrPress]));
  ok(M.reduce((a,m)=>a+m.press,0)>=3,"volt pressing-gól a mintában",M.reduce((a,m)=>a+m.press,0));
  ok(M.every(m=>m.exPress>0),"a várható büntetés-gól minden meccsen gyűlt",M.map(m=>Math.round(m.exPress*100)/100));
  ok(M.filter(m=>m.press>0).every(m=>m.tetPress),"ahol esett pressing-gól, a tényezők között is ott van");
  console.log("\n— 2. a bontás összege —");
  ok(M.every(m=>m.sumO===m.extra.o&&m.sumA===m.extra.a),"forrásonként összeadva = a gólvárhatóságon kívüli gólok",M.map(m=>[m.sumO,m.extra.o,m.sumA,m.extra.a]));
  ok(M.every(m=>m.egyeb===0),"nincs besorolatlan („egyéb”) gól — minden forrás be van kötve",M.map(m=>m.egyeb));
  console.log("\n— 3. a szerencse —");
  ok(M.every(m=>Math.abs(m.lamO-(m.xgO+m.altO+m.exPress))<0.35),"a λ a csatorna várható gólját is tartalmazza",M.map(m=>[Math.round(m.lamO*100)/100,Math.round((m.xgO+m.altO+m.exPress)*100)/100]));
  console.log("\n— 4. az általános mérés —");
  const pressOssz=M.reduce((a,m)=>a+m.press,0);
  ok(t.E&&t.E.v===2&&t.E.n===M.length&&t.E.o<=M.reduce((a,m)=>a+m.sumO,0)-pressOssz+1e-9,"a pressing-gól nem kerül az általános (11-es, öngól…) átlagba",t.E);
  console.log("\n— 5. a felület —");
  const h=t.html||"";
  ok(!!t.minta,"van minta-meccs legalább két pressing-góllal",!!t.minta);
  ok((h.match(/<details class="mxFul"/g)||[]).length===3&&/mxHarom/.test(h)&&/mxFo/.test(h),"összefoglaló + három lenyitható fül",h.length);
  ok(/gegenpressing/.test(h)&&/Honnan jöttek a gólok/.test(h)&&/Mennyi volt a szerencse/.test(h),"a gegenpressing a felületen, a fülek címei",1);
  ok(/gegenpressing/.test(t.szoveg)&&!/VAR/.test(t.szoveg),"a napló rövid szövege is megnevezi (a VAR nem gólforrás)",t.szoveg);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
