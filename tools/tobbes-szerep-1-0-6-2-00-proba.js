/* 🎽 1.0.6.2.00 — TÖBB SZEREP EGY EMBEREN + A RÖGZÍTETT STÍLUS-VÁLTÓ.
   KÉRÉS: a 3. csapatstílustól 3 játékos viselhet 2 szerepet; a 4.-től 5
   játékos 2-t, közülük 1 akár 3-at. A stílusjelvények a menü tetején rögzítve.
   Amit mér:
     1. 2 stílus: egy ember egy szerep (a régi szabály);
     2. 3 stílus: 3 ember visel 2-t, a negyedik többes kérésnél a régi út
        (leadja a többit), 3 szerep nem lehet;
     3. 4 stílus: 5 ember 2-vel, közülük 1 hárommal; a második hármas nem megy;
     4. egy stíluson belül továbbra is egy ember egy szerep;
     5. a motor mindkét szerepét látja (roleOf), a keretlista több jelvényt kap,
        a szerep-szakasz a nézett stílus szerepeit sorolja;
     6. a stílus-váltó sor sticky, egy sorban; nincs oldalhiba. */
"use strict";
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9157;
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
  try{await p.waitForFunction(()=>typeof roleMultiCap==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a többes szerep függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}
  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
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
    phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const mk=(key)=>({key,chosenSeason:1,traits:{szerepek:1},ms:{done:{},seen:{},t:{}},star:null});
    const nev=slots.map(s=>s.player.n);   /* 11 ember, a 0. a kapus */
    const m=()=>Object.assign({},roleState().map);
    const ures=()=>{roleState().map={};};
    /* 1. két stílus */
    S.style=mk("bombazok");S.style2=mk("beton");S.styleExtra=[];try{styleLvlCacheClear();}catch(e){}
    ures();roleAssign("nyito",nev[5]);roleAssign("fal",nev[5]);
    ki.ket={cap:roleMultiCap(),map:m()};
    /* 2. három stílus */
    S.styleExtra=[mk("villam")];try{styleLvlCacheClear();}catch(e){}
    ures();
    ["nyito","befejezo","talalo"].forEach((k,i)=>roleAssign(k,nev[2+i]));
    ["fal","arok","kereszttuz"].forEach((k,i)=>roleAssign(k,nev[2+i]));   /* 3 ember 2-2 */
    ki.har1={map:m(),used:roleMultiUsed(null)};
    /* a 4. többes: egy új embert két szerepre */
    roleAssign("b2b",nev[6]);
    const m6=m();
    /* nev[6] már egy szereppel bír (b2b); a fal-t akarja — a keret betelt: leadja a b2b-t */
    roleAssign("fal",nev[6]);
    ki.har2={map:m(),used:roleMultiUsed(null),elotte:m6};
    /* 3 szerep 3 stílusnál: nev[3] (befejezo+arok) + villám szerep → nem fér (3 kéne, har=0) */
    ures();roleAssign("nyito",nev[3]);roleAssign("fal",nev[3]);roleAssign("b2b",nev[3]);
    ki.har3=m();
    /* 4. egy stíluson belül */
    ures();roleAssign("nyito",nev[4]);roleAssign("befejezo",nev[4]);ki.egy=m();
    /* 3. négy stílus */
    S.styleExtra=[mk("villam"),mk("tikitaka")];try{styleLvlCacheClear();}catch(e){}
    ures();
    for(let i=0;i<5;i++){roleAssign(["nyito","befejezo","talalo","fal","arok"][i],nev[1+i]);
      roleAssign(["latnok","aura","stabil","legolas","b2b"][i],nev[1+i]);}
    ki.negy1={map:m(),used:roleMultiUsed(null),cap:roleMultiCap()};
    roleAssign("kereszttuz",nev[1]);   /* nev[1]: nyito+latnok → +kereszttuz = 3 */
    ki.negy2={map:m(),used:roleMultiUsed(null)};
    roleAssign("robben",nev[2]);   /* nev[2]: a második hármas — nem fér */
    ki.negy3={map:m(),used:roleMultiUsed(null)};
    /* 5. a motor és a felület */
    ki.roleOf=[roleOf("nyito"),roleOf("latnok"),roleOf("kereszttuz")];
    ki.kulcs=roleKeysOfPlayer(nev[1]);
    ki.mstat=(()=>{try{return mstatRoleCh(nev[1]).keys||null;}catch(e){return String(e);}})();
    const all=roleNamesMapAll();ki.badge=(all.get(nev[1])||[]).length;
    S.styleView=2;const d=document.createElement("div");d.innerHTML=roleSectionHtml();
    ki.szakasz=[...d.querySelectorAll("select.roleSel")].map(x=>x.getAttribute("data-role"));
    ki.multiNote=/Többes szerep/.test(d.textContent);
    /* 6. a stílus-váltó sor */
    try{hubStyleSetOpen(true);}catch(e){}
    renderStylePanel();
    const bar=document.querySelector(".styleViewBar");
    ki.bar=bar?{pos:getComputedStyle(bar).position,n:bar.querySelectorAll("[data-styleview]").length,
      cols:(bar.getAttribute("style")||"").replace(/\s/g,"")}:null;
    return ki;});
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const db=(M,n)=>Object.values(M).filter(x=>x===n).length;
  console.log("\n— 1. két stílus —");
  ok(t.ket.cap.ket===0&&db(t.ket.map,Object.values(t.ket.map)[0])===1&&Object.keys(t.ket.map).length===1,"egy ember egy szerep",t.ket);
  console.log("\n— 2. három stílus —");
  ok(t.har1.used.ket===3&&Object.keys(t.har1.map).length===6,"3 ember visel 2 szerepet",t.har1);
  /* nev[6] a fal-t mástól veszi el: annak a többes helye felszabadul, tehát nev[6] megtarthatja a b2b-t */
  ok(t.har2.used.ket===3&&t.har2.map.b2b===t.har2.map.fal,"a gazdát cserélő szerep felszabadítja a többes helyet",t.har2);
  ok(Object.keys(t.har3).length===1&&t.har3.b2b,"3 stílusnál 3 szerep nem lehet (a többit leadja)",t.har3);
  console.log("\n— 4. egy stíluson belül —");
  ok(Object.keys(t.egy).length===1&&t.egy.befejezo,"egy stíluson belül egy ember egy szerep",t.egy);
  console.log("\n— 3. négy stílus —");
  ok(t.negy1.cap.ket===5&&t.negy1.cap.har===1&&t.negy1.used.ket===5,"5 ember 2 szereppel",t.negy1);
  ok(t.negy2.used.har===1&&t.negy2.used.ket===5&&t.negy2.map.b2b,"1 ember 3 szereppel",t.negy2);
  ok(t.negy3.used.har===1&&!Object.values(t.negy3.map).some((x,i,a)=>a.filter(y=>y===x).length>3),"a második hármas nem fér",t.negy3);
  console.log("\n— 5. motor és felület —");
  ok(t.roleOf.every(Boolean)&&t.kulcs.length===3,"a motor mind a három szerepét látja",{roleOf:t.roleOf,kulcs:t.kulcs});
  ok(Array.isArray(t.mstat)&&t.mstat.length>=1,"a meccs-statisztika csatornái minden szerepet összeadnak",t.mstat);
  ok(t.badge===3,"a keretlistán mind a három jelvény",t.badge);
  ok(eq(t.szakasz,["fal","arok","kereszttuz"])&&t.multiNote,"a szerep-szakasz a nézett stílus szerepeit sorolja, a többes keret kiírva",t.szakasz);
  console.log("\n— 6. a stílus-váltó —");
  ok(t.bar&&t.bar.pos==="sticky"&&t.bar.n===4&&/repeat\(4,/.test(t.bar.cols),"a váltó sor rögzítve, a négy jelvény egy sorban",t.bar);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
