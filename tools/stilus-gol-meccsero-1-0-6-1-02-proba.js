/* ⚡ 1.0.6.1.02 — A STÍLUS-GÓLOK MÉRCÉJE: MECCSERŐ A MECCSERŐ ELLEN.
   KÉRÉS: a csapatstílus-specifikus góloknál (ahol attribútumok számítanak) a
   mért attribútumot a meccserő-többlettel kell felskálázni, és az ellenfél
   MECCSEREJÉHEZ mérni — nem a nyers erejéhez.
   Amit mér:
     1. stilusMerce: k = (teamMatchStrength + tartós forma) ÷ teamStrength,
        a mérce fx.o.ovr + matchHiddenOppBuff();
     2. valódi meccsen a tiki-taka és az akciók terve EZZEL a két számmal
        készül, és ez egyezik az eredményjelző ⚡ számaival (SB.msBase/oppMsBase);
     3. a tiki-taka pool és az akció-tengely (Sortűz, Phalanx, Száguldás)
        a k-val szorzott attribútumot méri; az Egyensúly és a Tankoljunk
        (nem attribútum) érintetlen;
     4. irány: nagyobb meccserő-többlet → nagyobb gólesély; erősebb ellenfél-
        meccserő → kisebb;
     5. a stílusfa élő sora a meccserőről beszél; nincs oldalhiba. */
"use strict";
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9147;
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
  try{await p.waitForFunction(()=>typeof stilusMerce==="function"&&typeof akcPlanMatch==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a stilusMerce és az akció-motor létezik");
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
    const mk=(key,tr)=>({key,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("bombazok",{sortuz:3});S.style2=mk("tikitaka",{passzrekord:3});
    S.styleExtra=[mk("beton",{phalanx:3}),mk("villam",{szaguldas:3})];
    try{styleLvlCacheClear();}catch(e){}
    /* 1. a képlet */
    const fx=S.fixtures[S.idx];
    const M=stilusMerce(fx);
    const raw=teamStrength(),ms=teamMatchStrength()+(pformTeamOvr()||0),op=fx.o.ovr+matchHiddenOppBuff();
    ki.f={k:M.k,kv:ms/raw,opp:M.opp,opv:op,raw,ms,nyers:fx.o.ovr};
    /* 3. a pool és a tengely */
    const act=slots.map((s,idx)=>({p:s.player,idx})).filter(a=>a.p);
    const p1=ttChainPool(act,-1,1),p2=ttChainPool(act,-1,1.2);
    ki.pool=p1.every((x,i)=>Math.abs(p2[i].passz-x.passz*1.2)<1e-9&&Math.abs(p2[i].gol-x.gol*1.2)<1e-9);
    const ap=akcPool(act,null),top=(f,n)=>ap.map(f).sort((a,b)=>b-a).slice(0,n).reduce((a,b)=>a+b,0)/n;
    const o=80,k=1.1;
    ki.dp={sortuz:[akcDp("sortuz",ap,o,k),(top(x=>x.at.gol||0,4)*k-o)/o*100],
           phalanx:[akcDp("phalanx",ap,o,k),(top(x=>x.at.ved||0,6)*k-o)/o*100],
           egyens:[akcDp("egyens",ap,o,k),akcDp("egyens",ap,o,1)],
           tank:[akcDp("tank",ap,o,k),akcDp("tank",ap,o,1)]};
    /* 4. irány */
    const q=(op,kk)=>akcQ(3,akcDp("sortuz",ap,op,kk));
    ki.irany={k1:q(80,1),k12:q(80,1.2),erosebb:q(90,1)};
    /* 2. valódi meccsek: a terv bemenete és az eredményjelző */
    ki.meccs=[];
    for(let m=0;m<4;m++){
      S.unavailable={};S.lastMatch=null;S.idx=m;S.auto=true;
      try{utoLancVege();mEloTorol();}catch(e){}
      const _t=ttPlanMatch,_a=akcPlanMatch;let tArg=null,aArg=null,elo=null;
      window.ttPlanMatch=function(){tArg=[arguments[2],arguments[3]];try{elo=stilusMerce(S.fixtures[S.idx]);}catch(e){}return _t.apply(this,arguments);};
      window.akcPlanMatch=function(){aArg=[arguments[2],arguments[3]];return _a.apply(this,arguments);};
      playMatch();
      for(let i=0;i<600&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
      window.ttPlanMatch=_t;window.akcPlanMatch=_a;
      ki.meccs.push({tArg,aArg,elo:elo&&{k:elo.k,opp:elo.opp,my:elo.my,raw:elo.raw},sb:{my:SB.msBase,opp:SB.oppMsBase},kesz:!!S.lastMatch});}
    /* 5. a stílusfa élő sora */
    ki.hint=akcHint("sortuz");
    ki.leiras=(STYLE_TRAITS.bombazok||[]).find(x=>x.key==="sortuz").d;
    return ki;});
  const kz=(a,b,e)=>Math.abs(a-b)<=(e||1e-6);
  console.log("\n— 1. a képlet —");
  ok(kz(t.f.k,Math.max(0.6,Math.min(1.8,t.f.kv)))&&kz(t.f.opp,t.f.opv),"k = meccserő ÷ nyers erő, mérce = az ellenfél meccsereje",t.f);
  console.log("\n— 2. valódi meccsek —");
  const MM=t.meccs.filter(m=>m.kesz&&m.tArg&&m.aArg);
  ok(MM.length>=3,"lejátszott meccsek a tervvel",MM.length);
  ok(MM.every(m=>kz(m.tArg[0],m.elo.opp)&&kz(m.tArg[1],m.elo.k)&&kz(m.aArg[0],m.elo.opp)&&kz(m.aArg[1],m.elo.k)),"a tiki-taka és az akciók terve a meccserő-mércével készül",MM.map(m=>[m.tArg,m.aArg]));
  ok(MM.every(m=>kz(m.elo.opp,m.sb.opp,0.05)&&kz(m.elo.my,m.sb.my,0.05)),"a mérce egyezik az eredményjelző ⚡ számaival",MM.map(m=>[m.elo.my,m.sb.my,m.elo.opp,m.sb.opp]));
  console.log("\n— 3. pool és tengely —");
  ok(t.pool,"a tiki-taka pool Passza és Gólszerzése a k-val szorzódik");
  ok(kz(t.dp.sortuz[0],t.dp.sortuz[1])&&kz(t.dp.phalanx[0],t.dp.phalanx[1]),"a Sortűz és a Phalanx tengelye a k-val felskálázott érték az ellenfél meccserejéhez",t.dp);
  ok(kz(t.dp.egyens[0],t.dp.egyens[1])&&kz(t.dp.tank[0],t.dp.tank[1]),"az Egyensúly és a Tankoljunk (nem attribútum) érintetlen");
  console.log("\n— 4. irány —");
  ok(t.irany.k12>t.irany.k1&&t.irany.erosebb<t.irany.k1,"nagyobb ⚡ többlet → több esély; erősebb ellenfél → kevesebb",t.irany);
  console.log("\n— 5. szövegek —");
  ok(/meccserejéhez/.test(t.hint)&&/meccserejéhez/.test(t.leiras)&&!/nyers erejéhez/.test(t.leiras),"a stílusfa a meccserőről beszél",t.hint);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
