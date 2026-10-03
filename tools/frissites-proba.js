/* ⏯ 3.9.171 — A FRISSÍTÉS FOLYTATÁS, NEM ÚJRAKEZDÉS; A LEFÚJÁS VÉGLEGES.

   BEJELENTETT HIBA: „frissítgetéssel lehet csalogatni a játékban. Ha meccs
   közben vagy, sőt ha már lefújták, de még nem lépsz tovább, akkor egy
   frissítéssel, kilépéssel újra lehet kezdeni az adott meccset."

   Amit mér (valódi karrier, valódi mentés, valódi oldal-újratöltés):
     1. KEZDŐRÚGÁS: a lemezre kerül a meccs előtti állapot, és egy élő rekord
        (seed, lement vödrök, döntésnapló);
     2. MEGSZAKÍTATLAN FUTÁS (a mérce): a 3. vödör után a felületen hozott
        csere naplózódik; a lefújáskor a mentésben az eredmény már benne van
        (S.idx nőtt), a függő jutalom-lánc (S.utoMeccs) is;
     3. UGYANAZ A KEZDŐRÚGÁS ÚJRA (frissítés a kezdőrúgás után): a betöltés
        magától indítja — ugyanazzal a sorsolással; a 7. vödör után ÚJABB
        frissítés MECCS KÖZBEN; a betöltés gyorsan visszajátssza a
        megszakításig (a naplózott cserével együtt), onnan élőben megy;
        a teljes közvetítés és a végeredmény AZONOS a mércével;
     4. LEFÚJÁS UTÁNI FRISSÍTÉS: az eredmény nem vész el és nem játszható
        újra; a jutalom-lánc folytatódik, két külön újratöltésnél is
        ugyanazokkal a sorsolásokkal (azonos első jutalom);
     5. a lánc közben a kezdőrúgás nem indít új meccset; a lánc lépéséből
        induló időzítő (skill-pörgetés vége) és gomb-kezelő (a jelölt
        választása) is a lépés rögzített véletlenjével sorsol;
     6. VÉGIGJÁTSZÁS: a lefújás után (a kör mentése előtt) frissítve a lefújt
        meccs ugyanazzal az eredménnyel áll vissza;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9203;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  /* a közvetítés minden sora (a próba olvassa); a lánc lépéseit is jelzi */
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.__sorok=[];});
  const URL=`http://127.0.0.1:${PORT}/index.html`;
  await p.goto(URL,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const varjF=(fn,arg,ms)=>p.waitForFunction(fn,arg,{timeout:ms||60000,polling:20});
  /* a feed-sorok gyűjtése a lapon (minden betöltés után újra be kell kötni) */
  const kotes=()=>p.evaluate(()=>{
    const _a=addLine;addLine=function(h){window.__sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};});

  /* ---- egy valódi egyjátékos karrier (mentési zárral), szezonban ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  const alap=await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    const bent=new Set(slots.map(x=>x.player&&x.player.n));
    const tobbi=sq.players.filter(x=>!bent.has(x.n));
    BENCH.KOZEPPALYAS={n:tobbi[0].n,ovr:tobbi[0].ovr,pos:["KKP"],age:26};
    [...slots.map(x=>x.player),BENCH.KOZEPPALYAS].forEach(pl=>{if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.halftimeSubs=true;S.subHalftimeStop=false;S.auto=false;S.unavailable={};
    try{subPlanState().rules=[];}catch(e){}
    saveGame();
    const kozep=slots.findIndex(x=>x.pos!=="KP"&&x.player);
    return {kozep,be:BENCH.KOZEPPALYAS.n,kulcs:saveKey()};});
  await kotes();

  const tarKi=()=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});
  const tarBe=o=>p.evaluate(o=>{localStorage.clear();for(const k in o)localStorage.setItem(k,o[k]);},o);
  const mentes=()=>p.evaluate(k=>{try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}},alap.kulcs);
  /* a VALÓDI visszatérés: újratöltés → kezdőlap → „Mentett meccs folytatása".
     3.9.180 óta nincs köztes „Folytatom" sáv: ugyanarra a helyre a gomb
     újratöltés nélkül, egyenesen betölt — ezért a naplófigyelő ELŐTTE köt. */
  const kezdolaprol=async()=>{
    await p.evaluate(()=>{window.__sorok=[];});
    await kotes();
    const nav=await p.evaluate(()=>{const x=document.getElementById("heResumeBtn");
      if(x&&x.offsetParent){x.click();return document.getElementById("mpEntry").classList.contains("hide")?"kozvetlen":"?";}
      return "nincs-gomb";});
    await p.waitForTimeout(700);
    return nav;};
  const betolt=async()=>{
    await p.reload({waitUntil:"load"});await p.waitForTimeout(700);
    const nav=await kezdolaprol();
    if(nav!=="kozvetlen")throw new Error("a Folytatás nem töltött be közvetlenül: "+nav);};
  /* a csere a 3. vödör után — a FELÜLETRŐL: az élő cserepult (megállít, csere, „Mehet") */
  const csere=()=>p.evaluate(A=>{
    if(!(MATCH_CTL&&MATCH_CTL.canSub()))return false;
    MATCH_CTL.open();                       /* ⏸ a meccs megáll, a pult nyílik */
    const be=HTS.ctx&&HTS.ctx.bench().find(x=>x.n===A.be);
    if(!be)return false;
    HTS.plan.push({k:A.kozep,in:be});htsCommit();   /* „Mehet" — a meccs folytatódik */
    return true;},alap);
  /* a lánc visszatartása: „frissítés a lefújás után, még a továbblépés előtt" */
  const lancFog=()=>p.evaluate(()=>{window.__lanc=0;utoLancIndit=function(){window.__lanc++;};});
  const kozvetites=s=>s.filter(t=>!/^⏯|^▶/.test(t));

  /* A MÉRCE IS BETÖLTÖTT ÁLLAPOTBÓL INDUL. A próba gyors beállítása nem vet
     kötéseket (összhang) — azt a betöltés pótolja, és az a meccserőbe is
     beleszól. Így minden futás ugyanabból a lemezállapotból indul. */
  await betolt();
  await p.evaluate(()=>{S.halftimeSubs=true;S.subHalftimeStop=false;S.auto=false;
    try{subPlanState().rules=[];}catch(e){}});

  /* ---- 1. KEZDŐRÚGÁS ---- */
  console.log("\n— 1. KEZDŐRÚGÁS —");
  const idx0=await p.evaluate(()=>S.idx);
  await lancFog();
  await p.evaluate(()=>{window.__sorok=[];playMatch();});
  const SNAP_K=await tarKi();
  const m0=JSON.parse(SNAP_K[alap.kulcs]||"null"),e0=JSON.parse(SNAP_K[alap.kulcs+"::elo"]||"null");
  ok(m0&&m0.S&&m0.S.idx===idx0&&!m0.S.playing,"a kezdőrúgás pillanatában a meccs előtti állapot a lemezen",{idx:m0&&m0.S.idx});
  ok(e0&&e0.seed>0&&e0.t===0&&Array.isArray(e0.log),"az élő rekord megszületett (seed, 0 vödör, üres napló)",e0);

  /* ---- 2. A MÉRCE: MEGSZAKÍTÁS NÉLKÜL ---- */
  console.log("\n— 2. A MÉRCE: MEGSZAKÍTÁS NÉLKÜL —");
  await varjF(()=>_mElo&&_mElo.t>=3);
  const cs0=await csere();
  const e1=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),alap.kulcs+"::elo");
  ok(cs0&&e1.log.length===1&&e1.log[0].k==="sub"&&e1.log[0].t>=3,"a felületi csere naplózódott, a vödör számával",e1.log);
  await varjF(()=>window.__lanc>0,null,90000);
  const R0=await p.evaluate(()=>({sorok:window.__sorok.slice(),gf:S.lastMatch&&S.lastMatch.gf,ga:S.lastMatch&&S.lastMatch.ga,idx:S.idx}));
  const W0=await mentes();
  ok(R0.idx===idx0+1,"a lefújáskor a forduló lekönyvelve",{elotte:idx0,utana:R0.idx});
  ok(W0&&W0.S.idx===idx0+1&&W0.S.utoMeccs&&W0.S.utoMeccs.v===1,"a lefújáskor MENTÉS: az eredmény és a függő jutalom-lánc a lemezen",W0&&W0.S.utoMeccs);
  const SNAP_W=await tarKi();
  console.log("    mérce:",R0.gf+"–"+R0.ga,"·",R0.sorok.length,"sor");

  /* ---- 3. FRISSÍTÉS A KEZDŐRÚGÁS UTÁN, MAJD MECCS KÖZBEN ---- */
  console.log("\n— 3. FRISSÍTÉS A KEZDŐRÚGÁS UTÁN ÉS MECCS KÖZBEN —");
  await tarBe(SNAP_K);
  await betolt();
  await varjF(()=>_mElo&&S.playing,null,15000);
  const r1=await p.evaluate(()=>({sorok:window.__sorok.slice(),seed:_mElo.seed}));
  ok(r1.seed===e0.seed&&r1.sorok.some(t=>/újraindul ugyanazzal a sorsolással/.test(t)),"a betöltés magától indítja — UGYANAZZAL a sorsolással",{seed:r1.seed});
  await varjF(()=>_mElo&&_mElo.t>=3);
  await csere();
  await varjF(()=>_mElo&&_mElo.t>=7);
  const e7=await p.evaluate(k=>JSON.parse(localStorage.getItem(k)),alap.kulcs+"::elo");
  ok(e7.t>=7&&e7.log.length===1,"a rekord a 7. vödörnél: vödör-szám és a csere a naplóban",{t:e7.t,log:e7.log});
  await betolt();   /* ← frissítés MECCS KÖZBEN */
  await varjF(()=>_mElo&&S.playing,null,15000);
  const vissza=await p.evaluate(()=>({cel:_mElo.cel,sorok:window.__sorok.slice()}));
  ok(vissza.cel===e7.t&&vissza.sorok.some(t=>/A mérkőzés folytatódik/.test(t)),"a betöltés a megszakításig visszajátszik",{cel:vissza.cel});
  await p.evaluate(()=>{utoLancIndit=function(){window.__lanc=(window.__lanc||0)+1;};});
  await varjF(()=>window.__lanc>0,null,90000);
  const R1=await p.evaluate(()=>({sorok:window.__sorok.slice(),gf:S.lastMatch&&S.lastMatch.gf,ga:S.lastMatch&&S.lastMatch.ga,idx:S.idx}));
  const eloVonal=R1.sorok.findIndex(t=>/Élőben folytatódik/.test(t));
  ok(eloVonal>0,"a megszakítás pontján „Élőben folytatódik” — onnan élőben");
  ok(R1.gf===R0.gf&&R1.ga===R0.ga,"a végeredmény AZONOS a megszakítás nélküli futáséval",{merce:R0.gf+"–"+R0.ga,frissitve:R1.gf+"–"+R1.ga});
  const k0=kozvetites(R0.sorok),k1=kozvetites(R1.sorok);
  const elter=k0.findIndex((t,i)=>t!==k1[i]);
  ok(k0.length===k1.length&&elter<0,"a TELJES közvetítés soról sorra azonos (a naplózott cserével együtt)",
     elter<0?{sorok:k0.length}:{i:elter,merce:k0[elter],frissitve:k1[elter]});
  ok(k1.some(t=>/🔁 Csere/.test(t)),"a naplózott csere a visszajátszásban is megtörtént");

  /* ---- 4. FRISSÍTÉS A LEFÚJÁS UTÁN ---- */
  console.log("\n— 4. FRISSÍTÉS A LEFÚJÁS UTÁN —");
  const lancElso=async()=>{
    await tarBe(SNAP_W);
    /* a lánc első képernyőjét / sorát figyeljük: mi a jutalom? */
    await betolt();
    await varjF(()=>window.__sorok.some(t=>/lefújás utáni kör folytatódik/.test(t)),null,15000);
    await p.waitForTimeout(2500);
    return await p.evaluate(()=>{
      /* a jutalom-képernyők a lapon belül nyílnak (scSkill, kémia-építés, felfedezés…) */
      const modal=[...document.querySelectorAll("[id^=sc]")].filter(x=>x.offsetParent&&!/^sc(Sim|Pitch)$/.test(x.id))
        .map(x=>x.id+": "+x.innerText.replace(/\s+/g," ").slice(0,240));
      return {idx:S.idx,playing:S.playing,uto:!!S.utoMeccs,tart:_utoTartas,lanc:_uto&&_uto.n,sorok:window.__sorok.slice(0,8),modal,
        tabla:(typeof S.W==="number")?[S.W,S.D,S.L]:null};});};
  const L1=await lancElso(),L2=await lancElso();
  ok(L1.idx===idx0+1&&!L1.playing,"frissítés után a forduló lekönyvelve marad — nincs újrajátszható meccs",{idx:L1.idx});
  ok(JSON.stringify(L1.tabla)===JSON.stringify(W0.S&&[W0.S.W,W0.S.D,W0.S.L]),"a tabella a lefújáskori",{L1:L1.tabla});
  ok(JSON.stringify([L1.sorok,L1.modal])===JSON.stringify([L2.sorok,L2.modal]),"két külön újratöltés UGYANAZT a jutalmat hozza",{L1:[L1.sorok,L1.modal],L2:[L2.sorok,L2.modal]});
  /* 5. a lánc közben a kezdőrúgás hatástalan */
  const k5=await p.evaluate(()=>{const i=S.idx;playMatch();return {indult:!!S.playing,idx:S.idx,i};});
  ok(!k5.indult&&k5.idx===k5.i,"a lánc közben a kezdőrúgás nem indít új meccset",k5);

  /* 5b. a lépésből születő időzítő és gomb-kezelő is a lépés véletlenjével fut */
  const lepes=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const futas=async(zaj)=>{
      const U=_uto;_uto={seed:"4242",n:0};const ki={};
      const gomb=document.createElement("button");
      try{
        utoLepes(()=>{
          if(zaj)setTimeout(()=>{Math.random();},1);         /* egy „más okból" induló időzítő */
          setTimeout(()=>{ki.idozito=Math.random();},5);
          gomb.onclick=()=>{ki.gomb=Math.random();};});
        await varj(40);gomb.click();
      }finally{_uto=U;}
      const kint=Math.random===Math.random;   /* a folt lekerült */
      const oc=Object.getOwnPropertyDescriptor(HTMLElement.prototype,"onclick");
      return {ki,kint,st:window.setTimeout===_utoST&&window.setInterval===_utoSI&&!!oc&&!oc.set._utoNat};};
    const a=await futas(false),b=await futas(true);
    return {a,b};});
  ok(lepes.a.ki.idozito!=null&&lepes.a.ki.idozito===lepes.b.ki.idozito,"a lépésben indított időzítő (pl. a skill-pörgetés vége) ugyanazt sorsolja — egy közbeeső idegen időzítő sem tolja el",lepes);
  ok(lepes.a.ki.gomb!=null&&lepes.a.ki.gomb===lepes.b.ki.gomb,"a lépésben kötött gomb-kezelő a kattintáskor is ugyanazt sorsolja");
  ok(lepes.b.st,"a lépés után az időzítők és a kattintás-kezelő eredeti állapotba kerülnek");

  /* ---- 6. VÉGIGJÁTSZÁS: FRISSÍTÉS A LEFÚJÁS UTÁN, A KÖR MENTÉSE ELŐTT ---- */
  console.log("\n— 6. VÉGIGJÁTSZÁS —");
  await tarBe(SNAP_K);
  await p.reload({waitUntil:"load"});await p.waitForTimeout(900);
  /* a kezdőrúgás-rekord helyett: végigjátszás-mérkőzés, a lánc visszatartva */
  await p.evaluate(()=>{localStorage.removeItem(saveKey()+"::elo");});
  const nav6=await kezdolaprol();
  if(nav6!=="kozvetlen")throw new Error("a Folytatás nem töltött be közvetlenül: "+nav6);
  await p.evaluate(()=>{window.__lanc=0;utoLancIndit=function(){window.__lanc++;};
    S.auto=true;window.__sorok=[];playMatch();});
  await varjF(()=>window.__lanc>0,null,60000);
  const A0=await p.evaluate(()=>({gf:S.lastMatch.gf,ga:S.lastMatch.ga,elo:JSON.parse(localStorage.getItem(saveKey()+"::elo")||"null")}));
  ok(A0.elo&&A0.elo.vege===1,"a végigjátszásnál a rekord „lefújt”-ként megmarad",A0.elo&&{vege:A0.elo.vege,t:A0.elo.t});
  await betolt();
  await varjF(()=>window.__sorok.some(t=>/lefújt mérkőzés visszaáll/.test(t)),null,15000);
  await p.evaluate(()=>{utoLancIndit=function(){window.__lanc=(window.__lanc||0)+1;};});
  await varjF(()=>window.__lanc>0,null,60000);
  const A1=await p.evaluate(()=>({gf:S.lastMatch.gf,ga:S.lastMatch.ga,auto:S.auto}));
  ok(A1.gf===A0.gf&&A1.ga===A0.ga,"a lefújt végigjátszás-meccs ugyanazzal az eredménnyel áll vissza",{elotte:A0.gf+"–"+A0.ga,utana:A1.gf+"–"+A1.ga});

  console.log("\n— 7. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
