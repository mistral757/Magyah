/* 🛡 3.9.288 — HARDCORE PvP: SZAKASZOS KÖZÖS SEED + KÉZFOGÁS.

   KÉRÉS: „Seedeljük ezentúl ne csak a draftot, hanem az egyes szezonon belüli
   eseményeket is szakaszonként. […] Ez legyen az alap, és az attól való
   eltérés […] minden a seedhez képest mért eltérés legyen. Ne váljanak szét.
   Minden ponton legyen egy egyeztetés, ott mindig meg is kell állni a
   játéknak, azaz be kell várjuk egymást egy kézfogásra."

   KÉT OLDAL, EGY BÖNGÉSZŐBEN: a két lap közös localStorage-on át a játék
   saját helyi szoba-hátterével (mpBackendLocal) beszél — valódi kétkliens-
   kézfogás. A két karrier ugyanabból a világ-seedből, de MÁS kerettel indul.

   Amit mér:
     1. a szakasz-azonosító (a, tw8, b, tw15, c, tw23, d, nyar);
     2. hcVel: ugyanaz a kulcs → ugyanaz a sorozat; könnyed módban nem nyúl a
        véletlenhez;
     3. a kihívás-ajánlat: hardcore-ban a két gépen ugyanaz a TÍPUS-sor,
        különböző kerettel is; könnyed módban nincs ilyen ígéret;
     4. a talizmán-kínálat: a 2–3. hely (kategória, ritkaság, lap) közös, az 1.
        a saját domináns szín; az első szakaszban mindhárom közös; a
        talizmán-seed közös;
     5. a scout-terv: közös, a felfedezés a terv célerejéhez és ingyenességéhez
        igazodik mindkét gépen; a terven felüli találat eltérés;
     6. a skill-sor újratöltése közös; az ifi-ablak a forduló szerint közös;
     7. a kézfogás: két kliens bevárja egymást, az egyeztetés összeveti az
        ujjlenyomatot; a megszakítás függőben hagyja, a kezdőrúgás addig nem
        indul, a HUB gombja folytatja; az ablak nyitása/zárása hardcore-ban
        kézfogást kér, könnyedben nem;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9288;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const errs=[];
  const lap=async()=>{const p=await ctx.newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);return p;};
  const A=await lap(),B=await lap();
  /* a két karrier: ugyanaz a világ-seed, más keret; hardcore közös szoba */
  const karrier=(p,role,sqi,szigor)=>p.evaluate(([role,sqi,szigor])=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    MP.active=false;
    pendingWorldSeed="HCSEED01";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[sqi];
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
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;S.seasonNumber=1;S.idx=0;
    /* a közös szoba és a szigorúság a felállás után */
    MP.active=true;MP.role=role;MP.activeRoom="HCPR";S.mpSzigor=szigor;S.tal=null;S.hc=null;
    return {seed:worldSeed,szigor:S.mpSzigor,hc:mpHardcore(),keret:slots.map(s=>s.player&&s.player.n).filter(Boolean).slice(0,3)};},[role,sqi,szigor]);
  const kA=await karrier(A,"host",0,"hardcore"),kB=await karrier(B,"guest",1,"hardcore");
  /* a közös szoba a helyi háttérben (a valódi játékban a lobby hozza létre) */
  await A.evaluate(()=>{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="HCPR";r.HCPR=rec;mpLSave(r);});
  console.log("— 0. két karrier —");
  ok(kA.seed==="HCSEED01"&&kB.seed==="HCSEED01"&&kA.hc&&kB.hc&&kA.keret.join()!==kB.keret.join(),"ugyanaz a világ-seed, hardcore, más keret",{kA,kB});

  console.log("\n— 1. a szakaszok —");
  const r1=await A.evaluate(()=>{const o=[];const s0={idx:S.idx,tw:S.twWindow,cl:S.seasonClosed};
    S.seasonNumber=2;
    [0,7,8,14,15,22,23,29].forEach(i=>{S.idx=i;o.push(hcSzakasz());});
    S.idx=8;S.twWindow={round:8};o.push(hcSzakasz());S.twWindow={round:15};o.push(hcSzakasz());S.twWindow=null;
    S.idx=30;S.seasonClosed=true;o.push(hcSzakasz());
    S.idx=s0.idx;S.twWindow=s0.tw;S.seasonClosed=s0.cl;S.seasonNumber=1;
    return o;});
  ok(r1.join(",")==="s2:a,s2:a,s2:b,s2:b,s2:c,s2:c,s2:d,s2:d,s2:tw8,s2:tw15,s2:nyar","a, b, c, d · tw8 · tw15 · nyár",r1);

  console.log("\n— 2. hcVel —");
  const minta=p=>p.evaluate(()=>{const f=()=>[Math.random(),Math.random(),Math.random()].map(x=>Math.round(x*1e6));
    return {k1:hcVel("proba",f,"x1"),k1b:hcVel("proba",f,"x1"),k2:hcVel("proba",f,"x2")};});
  const vA=await minta(A),vB=await minta(B);
  ok(vA.k1.join()===vA.k1b.join()&&vA.k1.join()===vB.k1.join()&&vA.k1.join()!==vA.k2.join(),"ugyanaz a kulcs → ugyanaz a sorozat (mindkét gépen); más sorszám → más",{vA,vB});
  const konnyed=await A.evaluate(()=>{const sz=S.mpSzigor;S.mpSzigor="konnyed";const r=Math.random;let azonos=false;
    hcVel("proba",()=>{azonos=(Math.random===r);},"x1");S.mpSzigor=sz;return {azonos,hc:mpHardcore()};});
  ok(konnyed.azonos,"könnyed módban a hcVel nem nyúl a véletlenhez",konnyed);

  console.log("\n— 3. a kihívás-ajánlat —");
  const kih=p=>p.evaluate(()=>{S.idx=0;S.seasonNumber=1;
    const _r=window.renderChallengeOffers;window.renderChallengeOffers=()=>{};
    const out=[];
    for(let j=0;j<3;j++){showChallengeOffers("short",3,()=>{},false,{});out.push(_challengeOffers.map(c=>c.type).join("+"));}
    window.renderChallengeOffers=_r;
    ["scHub","scWindow","twPanel"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
    return out;});
  const cA=await kih(A),cB=await kih(B);
  ok(cA.length===3&&cA.join("|")===cB.join("|")&&cA.every(x=>x.length>0),"hardcore: a két gépen ugyanaz a típus-sor (három egymás utáni ajánlat)",{A:cA,B:cB});
  ok(new Set(cA).size>1,"az egymás utáni ajánlatok különböznek (a sorszám lép)",cA);

  console.log("\n— 4. a talizmán —");
  const tal=(p,dom)=>p.evaluate((dom)=>{
    const T=talState();const o={seed:T.seed};
    /* 1. szakasz: mindhárom közös */
    S.idx=3;o.elso=talKinalat("p1").map(L=>L.kat+":"+L.rang+":"+(L.spec||L.alap||L.v||""));
    /* később: a domináns szín (a „main") eltérhet */
    if(dom){T.lapok=[0,1,2,3,4].map(i=>({kat:dom,rang:1,id:"pr"+i}));try{_talElMemo=null;}catch(e){}}
    S.idx=10;S.seasonNumber=1;
    const k=talKinalat("p2");o.kesobb=k.map(L=>L.kat+":"+L.rang+":"+(L.spec||L.alap||L.v||""));o.dom=talDominans().k;
    T.lapok=[];try{_talElMemo=null;}catch(e){}
    return o;},dom);
  const tA=await tal(A,"scout"),tB=await tal(B,"bank");
  ok(tA.seed===tB.seed,"a talizmán-seed közös",{a:tA.seed,b:tB.seed});
  ok(tA.elso.join()===tB.elso.join(),"az első szakaszban mindhárom lap közös",{A:tA.elso,B:tB.elso});
  ok(tA.kesobb[1]===tB.kesobb[1]&&tA.kesobb[2]===tB.kesobb[2],"később a 2–3. hely (kategória, ritkaság, lap) közös",{A:tA.kesobb,B:tB.kesobb});
  ok(tA.kesobb[0]!==tB.kesobb[0]||tA.dom===tB.dom,"az 1. hely a saját domináns szín (main) szerint eltérhet",{A:tA.kesobb[0],B:tB.kesobb[0],domA:tA.dom,domB:tB.dom});

  console.log("\n— 5. a scout-terv —");
  const sc=p=>p.evaluate(()=>{
    S.idx=16;S.seasonNumber=1;
    const T=hcScoutTerv(hcSzakasz());
    const lvl=Number(oppTargetRating)||0,talal=[];
    const _real=scoutRealOn;
    for(let i=0;i<T.n+1;i++){
      const rec=hcFelfedez(()=>scoutClassicDiscover("hattrick"));
      const e=rec?scoutRealEntry(rec):null;
      talal.push(e?{r:Math.round(e.startRating),c:Math.round((lvl+(T.t[i]?T.t[i].rel:0))*10)/10}:null);}
    return {terv:T,lvl,talal,naplo:(hcScoutTervNaplo(hcSzakasz()),/scout-terve/.test(document.body.textContent))};});
  const sA=await sc(A),sB=await sc(B);
  ok(JSON.stringify(sA.terv)===JSON.stringify(sB.terv)&&sA.terv.n>=2,"a szakasz scout-terve közös (darab, célerő, ingyenesség)",{A:sA.terv,B:sB.terv});
  ok(sA.talal.slice(0,sA.terv.n).every(x=>x&&Math.abs(x.r-x.c)<=4.5),"a terv szerinti felfedezések a közös célerő körül (±4)",sA.talal);
  ok(sA.naplo,"a napló kimondja a tervet");

  console.log("\n— 6. a skill-sor és az ifi —");
  const sk=p=>p.evaluate(()=>{const r=hcSkillToltRng();const a=weightedShuffleSkills(r).slice(0,6).map(x=>x.id);
    let ifi=null;hcVel("ifi",()=>{ifi=[Math.random(),Math.random()].map(x=>Math.round(x*1e6));},"r12");return {a,ifi};});
  const kA6=await sk(A),kB6=await sk(B);
  ok(kA6.a.join()===kB6.a.join(),"a skill-sor újratöltése közös",{A:kA6.a,B:kB6.a});
  ok(kA6.ifi.join()===kB6.ifi.join(),"az ifi-ablak a forduló kulcsán közös",{A:kA6.ifi,B:kB6.ifi});

  console.log("\n— 7. a kézfogás —");
  /* két kliens: A előbb érkezik és vár, B utána */
  await A.evaluate(()=>{S.hc.nyom["s1:a"]={"kih:short":["x","y"],tal:["a/b"]};
    window._hcKesz=0;hcKezfogas("s1:tw8:be",()=>{window._hcKesz++;});});
  await A.waitForTimeout(2500);
  const varA=await A.evaluate(()=>({kesz:window._hcKesz,vari:!document.getElementById("h2hWait").classList.contains("hide"),
    fuggo:!!(S.hc&&S.hc.fuggo),cim:document.getElementById("h2hWaitRound").textContent}));
  ok(varA.kesz===0&&varA.vari&&varA.fuggo&&/KÉZFOGÁS/.test(varA.cim),"A vár a társra (a függő állapot már rögzítve)",varA);
  await B.evaluate(()=>{S.hc.nyom["s1:a"]={"kih:short":["x","z"],tal:["a/b"]};
    window._hcKesz=0;hcKezfogas("s1:tw8:be",()=>{window._hcKesz++;});});
  await B.waitForTimeout(3000);await A.waitForTimeout(2500);
  const kesz=async p=>p.evaluate(()=>({kesz:window._hcKesz,jelolve:!!S.hc.kesz["s1:tw8:be"],fuggo:S.hc.fuggo,
    rejtve:document.getElementById("h2hWait").classList.contains("hide"),
    naplo:[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).filter(t=>/Kézfogás/.test(t)).slice(-1)[0]||""}));
  const kAe=await kesz(A),kBe=await kesz(B);
  ok(kAe.kesz===1&&kBe.kesz===1&&kAe.jelolve&&kBe.jelolve&&!kAe.fuggo&&!kBe.fuggo&&kAe.rejtve&&kBe.rejtve,"mindkét kliens továbblép, egyszer",{kAe,kBe});
  ok(/eltért/.test(kAe.naplo)&&/kih:short/.test(kAe.naplo)&&/3 közös húzásból 1/.test(kAe.naplo),"az egyeztetés kimondja: 3 közös húzásból 1 eltért (a kihívásnál)",kAe.naplo);
  /* újra ugyanaz a pont: már kész, azonnal továbbenged */
  const ujra=await A.evaluate(()=>{let n=0;hcKezfogas("s1:tw8:be",()=>{n++;});return n;});
  ok(ujra===1,"a lezárt kézfogás nem kér újra",ujra);
  /* megszakítás: függőben marad, a kezdőrúgás nem indul, a HUB gombja folytat */
  const megsz=await A.evaluate(async()=>{
    let tov=0;hcKezfogas("s1:tw15:be",()=>{tov++;});
    await new Promise(r=>setTimeout(r,300));
    document.getElementById("h2hWaitCancelBtn").click();
    await new Promise(r=>setTimeout(r,300));
    const o={tov,fuggo:S.hc.fuggo&&S.hc.fuggo.pont,gomb:!!document.getElementById("hcFuggoBtn")&&!document.getElementById("hcFuggoBtn").classList.contains("hide")};
    o.gombTx=o.gomb?document.getElementById("hcFuggoBtn").textContent:"";
    /* a kezdőrúgás a kézfogást hozza elő, nem a meccset */
    let meccs=0;const _sr=window.startRoundNow;window.startRoundNow=()=>{meccs++;};
    S.playing=false;S.idx=15;startRound();
    await new Promise(r=>setTimeout(r,300));
    o.meccs=meccs;o.ujraVar=!document.getElementById("h2hWait").classList.contains("hide");
    document.getElementById("h2hWaitCancelBtn").click();
    window.startRoundNow=_sr;
    return o;});
  ok(megsz.tov===0&&megsz.fuggo==="s1:tw15:be"&&megsz.gomb&&/Kézfogás/.test(megsz.gombTx),"a megszakítás függőben hagyja; a HUB gombja megjelenik",megsz);
  ok(megsz.meccs===0&&megsz.ujraVar,"függő kézfogás mellett a forduló nem indul — a kézfogás jön elő",megsz);
  /* az ablak nyitása és zárása kézfogást kér hardcore-ban; könnyedben nem */
  const ablak=await A.evaluate(async()=>{
    const o={};let hivas=[];const _k=window.hcKezfogas;window.hcKezfogas=(pont,f)=>{hivas.push(pont);};
    S.hc.fuggo=null;S.seasonNumber=1;S.idx=23;
    continueCheckpoint(23,()=>{});o.be=hivas.slice();hivas.length=0;
    S.idx=23;twResumeAfterWindow();o.ki=hivas.slice();hivas.length=0;
    S.mpSzigor="konnyed";
    const _o=window.twOpenCheckpointWindow;let nyit=0;window.twOpenCheckpointWindow=()=>{nyit++;};
    continueCheckpoint(23,()=>{});o.konnyed=hivas.slice();o.konnyedNyit=nyit;
    window.twOpenCheckpointWindow=_o;window.hcKezfogas=_k;S.mpSzigor="hardcore";
    return o;});
  ok(ablak.be.join()==="s1:tw23:be"&&ablak.ki.join()==="s1:tw23:ki","hardcore: az ablak nyitása és zárása kézfogást kér",ablak);
  ok(ablak.konnyed.length===0&&ablak.konnyedNyit===1,"könnyed: nincs kézfogás, az ablak azonnal nyílik",ablak);

  console.log("\n— 8. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
