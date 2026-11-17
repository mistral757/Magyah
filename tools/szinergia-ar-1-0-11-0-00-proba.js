/* 🔗 1.0.11.0.00 — A SZINERGIA ÁRA A KÉT ÉRINTETT STÍLUS SAJÁT PONTGYŰJTŐJÉBŐL.
   KÉRÉS: „A szinergia gól szintjeit ne csapatstílus pontból, hanem az érintett
   csapatstílusok saját pontgyűjtőjéből lehessen venni. Mindkettőből bele kell
   adni 100-at az első szintért, 200-at a másodikért és 300-at a harmadikért.
   Ha ezt választod maxra fejlesztésnek, akkor a max az 500+500 saját pont a
   két érintett csapatstílustól." (a „max" = csúcsfok-jelölés)
   Amit mér:
     1. pár nélkül nem vehető; a fizetők a pár két stílusa, a saját pontnevükkel
        (a Panzernél rettenet pont);
     2. ha EGYIK oldalon kevés a pont, nem megy, és egyik sem fogy;
     3. 100 / 200 / 300 mindkettőből; a csapatstílus-pont nem mozdul; az
        elköltött pont a pontgyűjtő `spent` számlálójába könyvelődik;
     4. a 3. szint után csak csúcsfok-jelöléssel megy tovább;
     5. a jelölés feltételei (mindkét stílus csúcsfokon, mindkettőben szabad
        jelölés), a jelölés mindkettőből elvisz egyet, végleges;
     6. a csúcsfok három szintje 120 / 160 / 220 = 500 mindkét oldalon, a
        szorzó ×2,9 / ×3,3 / ×3,7;
     7. FUTÓ karrier: a csapatstílus-pontból már megvett szint megmarad, a
        következő szint ára az új;
     8. párváltás: a szint marad, a fizetők az ÚJ pár stílusai;
     9. a mentés viszi a szintet, a csúcsfok-jelzőt és a jelöléseket;
    10. a panel: mindkét pontnév a gombon, a kassza-sor, a csúcsfok-blokk;
        430 px; nincs oldalhiba.  KEP=<mappa>: képernyőkép. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9331;
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
  if(process.env.SZPAR)await p.evaluate(k=>{window.__SZPAR=k;},process.env.SZPAR);
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof szinMeccsKezd==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a szinergia függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const KEP=process.env.KEP||"";
  const r=await p.evaluate(async()=>{
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
    window.mezKerdesKell=()=>false;window.__sgnValodi=saveGame;window.saveGame=()=>{};
    const mk=(key,tr,star)=>({key,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:star||null});
    const nev=slots.map(s=>s.player.n);
    let sztar=nev[9];
    const setSt=(keys,tr)=>{
      /* a sztár mindig a MOSTANI kezdőből (egy hosszú futásban a régi megsérülhet) */
      {const sl=slots.filter(x=>x&&x.player&&x.pos!=="KP"&&!(S.unavailable&&S.unavailable[x.player.n]));if(sl.length)sztar=sl[sl.length-2].player.n;}S.style=mk(keys[0],tr&&tr[0],keys[0]==="sztar"?sztar:null);S.style2=keys[1]?mk(keys[1],tr&&tr[1],keys[1]==="sztar"?sztar:null):null;
      S.styleExtra=keys.slice(2).map((k,i)=>mk(k,tr&&tr[i+2],k==="sztar"?sztar:null));try{styleLvlCacheClear();}catch(e){}};
    const ki2={};
    const _sgn=window.__sgnValodi;
    S.szin=null;const W=msState();W.sp=777;
    setSt(["panzer","villam","gegen","sztar"]);
    /* 1. pár nélkül */
    ki2.parNelkul=szinVesz();
    szinValaszt(szinKulcs("panzer","villam"));
    const F0=szinFizetok();ki2.fizetok=F0.map(f=>[f.k,f.n]);
    const gy=k=>szinGyujto(k).o;
    /* 2. az egyik oldalon kevés */
    gy("panzer").pts=650;gy("panzer").spent=0;gy("villam").pts=40;gy("villam").spent=0;
    ki2.keves=szinVesz();ki2.kevesUtan=[gy("panzer").pts,gy("villam").pts,szinState().lv];
    /* 3. a három szint */
    gy("villam").pts=650;
    ki2.arak=[];ki2.vetel=[];
    for(let i=0;i<3;i++){ki2.arak.push(szinAr());ki2.vetel.push(szinVesz().ok);}
    ki2.utan3=[gy("panzer").pts,gy("villam").pts,gy("panzer").spent,gy("villam").spent,szinState().lv,W.sp];
    /* 4. a 3. szint után */
    ki2.ar4=szinAr();ki2.vesz4=szinVesz();
    /* 5. a jelölés feltételei */
    ki2.miert0=szinCsucsMiert();
    const _mo=styleMasterOk;styleMasterOk=()=>true;
    const stP=styleStateFor("panzer"),stV=styleStateFor("villam");
    stP.peak={picks:["a","b","c"]};ki2.miertTele=szinCsucsMiert();
    stP.peak={picks:["a"]};ki2.miertOk=szinCsucsMiert();
    ki2.jelol=szinCsucsJelol();
    ki2.picks=[stP.peak.picks.slice(),(stV.peak&&stV.peak.picks||[]).slice(),styleMasterLeft(stP),styleMasterLeft(stV),szinState().csucs];
    ki2.jelolUjra=szinCsucsJelol().ok;
    /* 6. a csúcsfok három szintje */
    gy("panzer").pts=500;gy("villam").pts=500;gy("panzer").spent=600;gy("villam").spent=600;
    ki2.csArak=[];ki2.csVetel=[];ki2.szorzo=[];
    for(let i=0;i<3;i++){ki2.csArak.push(szinAr());ki2.csVetel.push(szinVesz().ok);ki2.szorzo.push(SZIN_M[szinLv()]);}
    ki2.utan6=[gy("panzer").pts,gy("villam").pts,gy("panzer").spent,gy("villam").spent,szinState().lv,szinLv(),szinAr(),szinVesz().ok,W.sp];
    ki2.vart=szinVartElore();
    /* 9. mentés oda-vissza */
    try{saveGame=_sgn||saveGame;saveGameNow();const d=loadSavedGame(saveKey());
      ki2.mentes=d&&d.S&&d.S.szin?[d.S.szin.lv,d.S.szin.csucs]:null;
      const pk=JSON.stringify(d).split("szin:csucs").length-1;ki2.mentPicks=pk;}catch(e){ki2.mentHiba=String(e);}
    window.saveGame=()=>{};
    /* 8. párváltás: a szint marad, a fizetők az új pár */
    S.seasonNumber=(S.seasonNumber||1)+1;
    ki2.valt=szinValaszt(szinKulcs("gegen","sztar")).ok;
    ki2.valtUtan=[szinLv(),szinFizetok().map(f=>f.n)];
    /* 7. futó karrier: régi, csapatstílus-pontból vett 2. szint */
    S.szin={lv:2,par:szinKulcs("panzer","villam"),valt:null,ert:null,carry:0,mert:{n:0,g:0}};
    stP.peak=null;stV.peak=null;
    gy("panzer").pts=300;gy("villam").pts=300;const sp0=W.sp;
    ki2.regi=[szinLv(),szinAr(),szinVesz().ok,szinLv(),gy("panzer").pts,gy("villam").pts,W.sp===sp0];
    /* 10. a panel */
    S.szin.lv=1;gy("panzer").pts=250;gy("villam").pts=120;
    _szinNyitva=true;S.styleView=1;
    try{openHubMidSeason();document.getElementById("hubStyleBtn").click();}catch(e){ki2.panelHiba=String(e);}
    const P=document.getElementById("szinPanel");
    ki2.panel=P?P.innerText:"";
    const B=P&&P.querySelector("[data-szinbuy]");ki2.gomb=B?[B.innerText,B.disabled]:null;
    ki2.kassza=P?[...P.querySelectorAll(".szinKassza span")].map(x=>[x.className,x.innerText]):[];
    gy("villam").pts=900;gy("panzer").pts=900;S.szin.lv=3;renderStylePanel();
    const P2=document.getElementById("szinPanel");
    ki2.csBlokk=P2&&P2.querySelector(".szinCsucs")?P2.querySelector(".szinCsucs").innerText:"";
    ki2.csGomb=!!(P2&&P2.querySelector("[data-szincsucs]"));
    ki2.tul=P2?[...P2.querySelectorAll("*")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length:-1;
    styleMasterOk=_mo;
    return ki2;});
  const t=r;
  ok(!t.parNelkul.ok&&/válassz párt/.test(t.parNelkul.reason),"1. pár nélkül nem vehető",t.parNelkul.reason);
  ok(JSON.stringify(t.fizetok)===JSON.stringify([["villam","villámpont"],["panzer","rettenet pont"]])||JSON.stringify(t.fizetok)===JSON.stringify([["panzer","rettenet pont"],["villam","villámpont"]]),"1. a fizetők a pár két stílusa, saját pontnévvel",t.fizetok);
  ok(!t.keves.ok&&/villámpont kellene, van 40/.test(t.keves.reason)&&t.kevesUtan.join()==="650,40,0","2. ha az egyik oldalon kevés: nem megy, és egyik sem fogy",t.keves.reason);
  ok(t.arak.join()==="100,200,300"&&t.vetel.every(Boolean),"3. az ár 100 / 200 / 300 — mindkét stílusból",t.arak);
  ok(t.utan3.join()==="50,50,600,600,3,777","3. mindkét pontgyűjtőből 600 fogyott (spent), a csapatstílus-pont nem mozdult",t.utan3);
  ok(t.ar4===null&&!t.vesz4.ok&&/csúcsfok/.test(t.vesz4.reason),"4. a 3. szint után csak csúcsfok-jelöléssel megy tovább",t.vesz4.reason);
  ok(/még nem érte el a csúcsfokot/.test(t.miert0),"5. jelölés: amíg a stílusok nincsenek csúcsfokon, nem megy",t.miert0);
  ok(/csúcsfok-jelölése elkelt/.test(t.miertTele)&&t.miertOk==="","5. jelölés: betelt jelölésnél nem megy; szabad hellyel igen",t.miertTele);
  ok(t.jelol.ok&&t.picks[0].join()==="a,szin:csucs"&&t.picks[1].join()==="szin:csucs"&&t.picks[2]===1&&t.picks[3]===2&&t.picks[4]===1&&!t.jelolUjra,"5. a jelölés mindkét stílusból elvisz egyet, és egyszeri",t.picks);
  ok(t.csArak.join()==="120,160,220"&&t.csVetel.every(Boolean)&&t.csArak.reduce((a,b)=>a+b,0)===500,"6. a csúcsfok három szintje 120 / 160 / 220 = 500 mindkét oldalon",t.csArak);
  ok(t.szorzo.join()==="2.9,3.3,3.7"&&t.utan6.slice(0,8).join()==="0,0,1100,1100,6,6,,false"&&t.utan6[8]===777&&Math.abs(t.vart-0.06*3.7)<1e-9,"6. a szorzó ×2,9 / ×3,3 / ×3,7; a 6. szint a teteje; a csapatstílus-pont érintetlen",{szorzo:t.szorzo,utan:t.utan6});
  ok(t.regi.join()==="2,300,true,3,0,0,true","7. futó karrier: a régi 2. szint megmarad, a 3. ára 300 + 300 a pontgyűjtőkből",t.regi);
  ok(t.valt&&t.valtUtan[0]===6&&t.valtUtan[1].sort().join()==="csillagpont,presszpont","8. párváltás: a szint marad, a fizetők az új pár stílusai",t.valtUtan);
  ok(!t.mentHiba&&t.mentes&&t.mentes.join()==="6,1"&&t.mentPicks>=2,"9. a mentés viszi a szintet, a csúcsfok-jelzőt és a két jelölést",[t.mentes,t.mentPicks,t.mentHiba]);
  ok(t.gomb&&/2\. szint/.test(t.gomb[0])&&/200 villámpont/.test(t.gomb[0])&&/200 rettenet pont/.test(t.gomb[0])&&t.gomb[1]===true,"10. a gombon mindkét pontnév; kevés pontnál tiltva",t.gomb);
  ok(t.kassza.length===2&&t.kassza.some(k=>k[0]==="ok")&&t.kassza.some(k=>k[0]==="keves"&&/még 80 kell/.test(k[1])),"10. a kassza-sor megmutatja, melyik oldalon mennyi hiányzik",t.kassza);
  ok(/saját pontgyűjtőjéből/.test(t.panel)&&/100 · 200 · 300/.test(t.panel),"10. a panel kimondja az új szabályt");
  ok(/500 \+ 500/.test(t.csBlokk)&&t.csGomb,"10. a 3. szinten megjelenik a csúcsfok-blokk a jelölő gombbal",t.csBlokk.slice(0,120));
  ok(t.tul===0&&!t.panelHiba,"10. 430 px: nincs vízszintes túlcsordulás",[t.tul,t.panelHiba]);
  if(KEP){await p.evaluate(()=>{{const m=document.getElementById("mpEntry");if(m)m.classList.add("hide");}
      for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}
      [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);if(c.position==="fixed"&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});
      S.szin.lv=1;szinGyujto("panzer").o.pts=250;szinGyujto("villam").o.pts=120;renderStylePanel();
      const g=document.querySelector('#scHub .hubGroup[data-acc="style"]');
      if(g){const bd=g.querySelector(".accBody");if(bd&&bd.classList.contains("hide"))g.querySelector(".accHead").click();}
      renderStylePanel();});
    await p.waitForTimeout(700);
    const el=await p.$("#szinPanel");
    if(el&&await el.isVisible())await el.screenshot({path:require("path").join(KEP,"szinergia-ar-utana.png")});
    else console.log("  (a szinergia-panel nem látszik — nincs kép)");}
  ok(errs.length===0,"10. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
