/* 🌍 3.9.331 — PvP SAJÁT BAJNOKSÁG (Könnyed) a közös (Hardcore) mellett.

   KÉRÉS (a teljes terv: docs/terv-pvp-sajat-bajnoksag.md): a szoba
   létrehozásakor dönthető el, mint a tempó és a szigorúság: a mostani rend a
   Hardcore (közös bajnokság), az új a Könnyed (ajánlott): két külön világ a
   saját erőhöz mért mezőnnyel; közös a célrés (a két választás átlaga), a
   párharc-napok (a 15. és a 30. forduló után), a kupa és az idényvégi
   Run-összevetés.

   Amit mér (fázisonként bővül):
     1. a kapcsoló: a csomag, a mentés, a predikátumok (mpSv, h2hRoomActive);
        régi szoba (mező nélkül) = közös;
     2. a saját világ: egyjátékos-piramis (15 gépi ellenfél, 30 gépi forduló,
        nincs párharc-helyfoglaló a bajnokiban);
     3. a közös célrés: élő csere, bevárás, átlag a kezdőrúgásban;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9331;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
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
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  const setup=async(p,role,vilag)=>p.evaluate(([role,vilag])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=true;MP.role=role;MP.activeRoom="SV01";
    {const r=mpLRooms();if(!r.SV01){const rec=mpNewRoomRecord();rec.code="SV01";r.SV01=rec;mpLSave(r);}}
    _mpVilagWanted=vilag;_mpSzigorWanted="konnyed";
    gameMode="career";enterCareerSetupFromHome(true);
    pendingWorldSeed=mpLRooms().SV01.seed;   /* a szoba közös seedje, mint a valódi indulásnál */
    beginNewGame();
    const vilagMentve=S.mpVilag;
    /* a fokozat-választó az egyjátékos úton (a szoba fokozatát nem szimuláljuk) */
    MP.active=false;
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[role==="host"?1:2];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    MP.active=true;S.mpVilag=vilagMentve;
    window.saveGame=()=>{};
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){try{window._nlog.push(String(t));}catch(e){}return al.apply(this,arguments);};
    return true;},[role,vilag]);

  const ctx2=ctx;
  const g=await ctx2.newPage();
  g.on("pageerror",e=>errs.push("G: "+String(e)));
  await g.addInitScript(()=>{window.HANG_TESZT=true;});
  await g.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await g.waitForTimeout(1200);

  console.log("— 1. a kapcsoló —");
  const r1=await p.evaluate(()=>{
    const o={};
    _mpVilagSel="sajat";o.csomag=mpCollectSettings().vilag;
    _mpVilagSel="kozos";o.csomag2=mpCollectSettings().vilag;_mpVilagSel="sajat";
    o.regi=mpVilagNorm(undefined);o.alap=MP_VILAG_DEF;
    mpApplySettings(Object.assign(mpCollectSettings(),{vilag:undefined}));o.atvetRegi=_mpVilagWanted;
    mpApplySettings(Object.assign(mpCollectSettings(),{vilag:"sajat"}));o.atvet=_mpVilagWanted;
    return o;});
  ok(r1.csomag==="sajat"&&r1.csomag2==="kozos"&&r1.alap==="sajat","a csomag viszi a bajnokságot; az új szoba alapja a saját",r1);
  ok(r1.regi==="kozos"&&r1.atvetRegi==="kozos"&&r1.atvet==="sajat","régi szoba (mező nélkül) = közös; a vendég átveszi",r1);

  await setup(p,"host","sajat");await setup(g,"guest","sajat");
  console.log("— 2. a saját világ —");
  const r2=await p.evaluate(()=>{
    const o={};o.vilag=S.mpVilag;o.sv=mpSv();o.h2h=h2hRoomActive();o.room=mpRoomOn();
    o.need=pyrDivNeed(pyrMyDivId());o.opps=leagueOpps().length;
    buildSeasonFixtures();o.fix=S.fixtures.length;o.duel=S.fixtures.filter(f=>f&&f.duel).length;
    o.mp=!!(S.pyr&&S.pyr.mp);o.lvl=pyrLevel();
    return o;});
  ok(r2.vilag==="sajat"&&r2.sv&&!r2.h2h&&r2.room,"saját bajnokság: mpSv igaz, a közös-világ ágak (h2hRoomActive) kikapcsolnak",r2);
  ok(r2.need===15&&r2.opps===15&&r2.fix===30&&r2.duel===0&&!r2.mp,"egyjátékos-piramis: 15 gépi ellenfél, 30 gépi forduló, nincs párharc-helyfoglaló",r2);
  const r2g=await g.evaluate(()=>({sv:mpSv(),lvl:pyrLevel()}));
  ok(r2g.sv,"a vendég is saját bajnokságban",r2g);

  console.log("— 3. a közös célrés —");
  const r3=await (async()=>{
    const prep=pp=>pp.evaluate(()=>{phase="season";S.seasonClosed=true;S.seasonNumber=1;S.seasonHistory=[{season:1}];
      S.finalTable=[{you:true,n:"X"}];S.pyr.svCel=null;window._tovabb=0;return {sn:pyrFloorUpcoming(),nf:nfOn()};});
    const a=await prep(p),b=await prep(g);
    /* a házigazda +0,3-at, a vendég −0,1-et választ */
    await p.evaluate(()=>{nfOffer(()=>{window._tovabb++;},false);});
    await g.evaluate(()=>{nfOffer(()=>{window._tovabb++;},false);});
    await p.waitForTimeout(400);
    await p.evaluate(()=>{for(let i=0;i<3;i++)$("nfHangPlus").click();});
    await g.evaluate(()=>{$("nfHangMinus").click();});
    await p.waitForTimeout(3500);
    const elo=await p.evaluate(()=>($("svCelTars")||{}).textContent||"");
    await p.evaluate(()=>{[...$("unlockActions").querySelectorAll("button")].find(x=>/ezzel indulok/.test(x.textContent)).click();});
    await p.waitForTimeout(3000);
    const var1=await p.evaluate(()=>({tovabb:window._tovabb,cim:$("unlockTitle").textContent,svCel:S.pyr.svCel}));
    await g.evaluate(()=>{[...$("unlockActions").querySelectorAll("button")].find(x=>/ezzel indulok/.test(x.textContent)).click();});
    await p.waitForTimeout(4000);
    const ph=await p.evaluate(()=>({tovabb:window._tovabb,svCel:S.pyr.svCel,next:S.pyr.nfHangNext,log:window._nlog.filter(t=>/Közös célrés/.test(t)).slice(-1)[0]}));
    const gh=await g.evaluate(()=>({tovabb:window._tovabb,svCel:S.pyr.svCel,next:S.pyr.nfHangNext}));
    /* a kezdőrúgás az átlaggal számol */
    const kick=await p.evaluate(()=>{const sn=pyrFloorUpcoming();S.seasonNumber=sn;S.idx=0;const H=pyrFloorHist();delete H[sn];
      const cel=nfCelFor(sn);let k=null;try{k=pyrFloorKickoff();}catch(e){return {hiba:String(e)};}
      return {cel,alap:nfCelK(nfLevelFor(sn)),H:pyrFloorHist()[sn]&&{want:pyrFloorHist()[sn].want,g:pyrFloorHist()[sn].g}};});
    return {a,b,elo,var1,ph,gh,kick};})();
  ok(/közös célrés így/.test(r3.elo)&&/most ezt nézi/.test(r3.elo),"a nyitott ablak élőben mutatja a társ választását és a közös célrést",r3.elo);
  ok(r3.var1.tovabb===0&&/Közös célrés/.test(r3.var1.cim)&&r3.var1.svCel&&r3.var1.svCel.kesz,"a véglegesítés után bevár (a kezdőrúgás nem indul)",r3.var1);
  ok(r3.ph.tovabb===1&&r3.gh.tovabb===1&&r3.ph.svCel.avg===0.1&&r3.gh.svCel.avg===0.1&&r3.ph.next===0.1&&r3.gh.next===0.1,
    "a társ véglegesítése után mindkettő továbblép, a közös hangolás az átlag: (+0,3 − 0,1)/2 = +0,1",{p:r3.ph,g:r3.gh});
  ok(/Közös célrés a 2\. idényre/.test(r3.ph.log||""),"a napló kimondja a két választást és a közöset",r3.ph.log);
  ok(r3.kick&&Math.abs(r3.kick.cel-(r3.kick.alap+0.1))<1e-6,"a kezdőrúgás a közös célréssel számol (a fokozat célrése +0,1)",r3.kick);

  console.log("— 4. a súlyozott seed —");
  const seedP=pp=>pp.evaluate(()=>{
    S.seasonNumber=2;S.idx=3;S.seasonClosed=false;S.hc=null;
    const o={seed:hcSeed(),hard:mpHardcore(),korai:hcKorai()};
    o.huzas=hcVel("proba",()=>[Math.random(),Math.random(),Math.random()].map(x=>Math.round(x*1e6)));
    o.huzas2=hcVel("proba",()=>Math.round(Math.random()*1e6));
    o.terv=hcScoutTerv(hcSzakasz());
    o.szint=Number(oppTargetRating)||0;
    o.cel=o.terv.t.map(x=>Math.round((o.szint+x.rel)*10)/10);
    let k=0;hcKezfogas("s2:tw8:be",()=>{k++;});o.kezfogas=k;
    return o;});
  const sa=await seedP(p),sg=await seedP(g);
  /* a vendég világát eltoljuk: más mezőnyszint, ugyanaz a seed */
  ok(sa.seed&&!sa.hard&&!sa.korai&&sa.kezfogas===1,"saját bajnokságban a seed él, kézfogás és közös scout-jelölt nélkül",{seed:sa.seed,hard:sa.hard,korai:sa.korai,k:sa.kezfogas});
  ok(JSON.stringify(sa.huzas)===JSON.stringify(sg.huzas)&&sa.huzas2===sg.huzas2,"ugyanaz a húzás mindkét gépen (a szakasz n-edik húzása)",{a:sa.huzas,g:sg.huzas});
  ok(JSON.stringify(sa.terv.t)===JSON.stringify(sg.terv.t),"a scout-terv eltolásai közösek",{a:sa.terv.t,g:sg.terv.t});
  ok(sa.cel.every((c,i)=>Math.abs((c-sa.szint)-(sg.cel[i]-sg.szint))<1e-6),"a célerő a SAJÁT mezőnyszinthez mér (súlyozott): ugyanaz az eltolás, más szint",{a:{szint:sa.szint,cel:sa.cel},g:{szint:sg.szint,cel:sg.cel}});

  console.log("— 5. a párharc-nap —");
  const phPrep=pp=>pp.evaluate(()=>{
    S.seasonNumber=2;S.idx=15;S.seasonClosed=false;S.svPh=null;S.playing=false;S.auto=false;S.h2hPending=null;
    phase="season";$("scSim").classList.remove("hide");matchSpeed=3;
    utoLancIndit=function(){};window.saveGame=()=>{};
    if(!window.__gyors){window.__gyors=1;const _st=window.setTimeout,_si=window.setInterval;
      window.setTimeout=function(f,ms,...a){return _st.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};
      window.setInterval=function(f,ms,...a){return _si.call(this,f,(ms>=3000&&ms<60000)?15:ms,...a);};}
    S.subPlanAsked=h2hKey();
    const o={esed:svPhEsedekes(),duel:h2hIsDuelRound(),key:h2hKey(),home:h2hHostIsSimHome(),label:kickBtnLabel(),
      penz0:Math.round(S.transferBudget||0)};
    return o;});
  const pa=await phPrep(p),pg=await phPrep(g);
  ok(pa.esed===1&&pa.duel&&pa.key==="s2svd1"&&pg.key==="s2svd1"&&pa.home===true&&pg.home===true&&/párharc-nap I/i.test(pa.label),
    "a 15. forduló után az I. párharc-nap esedékes: közös kulcs, a házigazda a hazai (gépfüggetlenül), a gomb kiírja",{pa,pg});
  await p.evaluate(()=>{startRound();});await g.evaluate(()=>{startRound();});
  let kesz=false;
  for(let i=0;i<180&&!kesz;i++){await p.waitForTimeout(1000);
    kesz=await p.evaluate(()=>!!(S.svPh&&S.svPh.m["2:1"]))&&await g.evaluate(()=>!!(S.svPh&&S.svPh.m["2:1"]));}
  const ra=await p.evaluate(()=>({m:S.svPh&&S.svPh.m["2:1"],M:S.svPh&&S.svPh.merleg,idx:S.idx,esed:svPhEsedekes(),label:kickBtnLabel(),
    penz:Math.round(S.transferBudget||0),led:(S.ledger||[]).filter?null:null,log:window._nlog.filter(t=>/Párharc-nap I:/.test(t)).slice(-1)[0]}));
  const rg=await g.evaluate(()=>({m:S.svPh&&S.svPh.m["2:1"],M:S.svPh&&S.svPh.merleg,idx:S.idx,esed:svPhEsedekes(),penz:Math.round(S.transferBudget||0)}));
  ok(kesz&&ra.m&&rg.m&&ra.m.gf===rg.m.ga&&ra.m.ga===rg.m.gf,"a párharc lefut mindkét gépen, és ugyanaz az eredmény (tükörben)",{a:ra.m,g:rg.m});
  ok(ra.idx===15&&rg.idx===15&&ra.esed===0&&!/PÁRHARC/.test(ra.label),"nem bajnoki forduló: az S.idx marad, utána a 16. forduló jön",{idx:ra.idx,label:ra.label});
  {const w=ra.m&&ra.m.gf>ra.m.ga,d=ra.m&&ra.m.gf===ra.m.ga;
   ok(ra.M&&ra.M.p===(w?3:d?1:0)&&rg.M.p===(ra.m.ga>ra.m.gf?3:d?1:0),"a párharc-mérleg 3/1/0 pontot könyvel mindkét oldalon",{a:ra.M,g:rg.M});
   const nyert=w?ra:(ra.m.ga>ra.m.gf?rg:null),nyertPrep=w?pa:pg;
   ok(!nyert||nyert.penz>nyertPrep.penz0,"a győztes párharc-díjat kap",nyert?{elotte:nyertPrep.penz0,utana:nyert.penz}:"döntetlen");}
  ok(/párharc-mérleg/.test(ra.log||""),"a napló kiírja az eredményt és a mérleget",ra.log);

  const r6=await p.evaluate(()=>{
    S.idx=30;S.seasonClosed=false;const o={};
    o.esed=svPhEsedekes();o.key=h2hKey();o.home=h2hHostIsSimHome();o.label=kickBtnLabel();
    phase="season";finish();o.phase=phase;o.zarva=!!S.seasonClosed;
    return o;});
  ok(r6.esed===2&&r6.key==="s2svd2"&&r6.home===false&&/párharc-nap II/i.test(r6.label)&&r6.phase==="season"&&!r6.zarva,
    "a 30. forduló után a II. párharc-nap jön (a vendég a hazai); a szezon nem zárul előtte",r6);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
