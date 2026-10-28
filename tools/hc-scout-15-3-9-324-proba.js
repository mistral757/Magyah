/* 🛡 3.9.324 — HARDCORE PVP: A 15. FORDULÓIG A SCOUT EGY AZ EGYBEN UGYANAZT TALÁLJA.

   KÉRÉS: „15. Fordulóig szerintem egy az egyben ugyanaz kellene legyen amit a
   scout talál. Semmi különbség nem kellene legyen a két csapat között PvP
   hardcore módban."

   Amit mér (két gép, ugyanaz a világ-seed, MÁS keret, mindkettő hardcore):
     1. az ütemezés: a szakasz terve ugyanazokban a fordulókban hozza a
        találatokat; a mérföldkő a 15. fordulóig nem hoz külön felfedezést;
     2. a jelölt: ugyanaz a játékos, ugyanazzal az ingyenességgel, akkor is,
        ha az egyik gépen a jelölt-sáv egy játékosa közben boostot kapott;
     3. a scout-célzás a 15. fordulóig nem szűr (2. idény), utána igen;
     4. az ár és a türelem közös, eltérő ügynökség mellett is;
     5. a vendég a házigazda horgonyát használja; ha még nincs meg, a
        kivonat jelzi az eltérést;
     6. a kezdőrúgás előtt a napló kimondja a tervet;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9324;
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
  const KEP=process.argv[2]||null;
  const kA=await karrier(A,"host",0,"hardcore"),kB=await karrier(B,"guest",1,"hardcore");
  await A.evaluate(()=>{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="HCPR";r.HCPR=rec;mpLSave(r);});
  ok(kA.hc&&kB.hc&&kA.seed===kB.seed,"két gép: ugyanaz a világ, mindkettő hardcore, más keret",{kA,kB});
  /* a horgony cseréje: előbb a házigazda, aztán a vendég (megkapja), majd újra */
  await A.evaluate(async()=>{await hcmJelez("próba");});
  const hor=await B.evaluate(async()=>{await hcmJelez("próba");const M=hcmAllapot();return {tars:M.tars&&M.tars.hor,sz:M.tars&&M.tars.horSz,sajat:hcSajatHorgony()};});
  const horA=await A.evaluate(()=>hcSajatHorgony());

  console.log("— 1. az ütemezés —");
  const ut=p=>p.evaluate(()=>{
    S.idx=0;S.seasonNumber=1;
    const T=hcScoutTerv("s1:a"),I=hcKoraiIdok("s1:a",T.n),Tb=hcScoutTerv("s1:b"),Ib=hcKoraiIdok("s1:b",Tb.n);
    const ford=[];for(let i=0;i<15;i++){S.idx=i;ford.push(hcKoraiFelfedezesek().length);}
    S.idx=16;const c=hcKoraiFelfedezesek().length,korai=hcKorai();
    S.idx=0;
    return {I,Ib,n:T.n,nb:Tb.n,ford,c,korai};});
  const uA=await ut(A),uB=await ut(B);
  ok(JSON.stringify(uA)===JSON.stringify(uB),"a két gépen ugyanazok a fordulók",{A:uA,B:uB});
  ok(uA.I.every(i=>i>=1&&i<=6)&&uA.Ib.every(i=>i>=8&&i<=13)&&uA.I.length===uA.n&&uA.Ib.length===uA.nb,"a terv darabszáma, a határfordulók (1., 8., 15.) nélkül",uA);
  ok(uA.ford.reduce((a,b)=>a+b,0)===uA.n+uA.nb&&uA.c===0&&uA.korai===false,"a 15. fordulóig pontosan a terv; a 16-tól nem ez az ág",uA.ford);
  /* a lefújás: a mérföldkő nem hoz külön találatot (a kódban a careerUnlockReasons felülírva) */
  const fut=await A.evaluate(()=>/hcKorai\(\)\)careerUnlockReasons=hcKoraiFelfedezesek\(\)/.test(String(document.documentElement.innerHTML)));
  ok(fut,"a lefújáskor a 15. fordulóig a felfedezés-okok a tervből jönnek (a mérföldkő itt nem hoz külön találatot)");

  console.log("— 2. a jelölt —");
  const fel=(p,boost)=>p.evaluate((boost)=>{
    S.idx=2;S.seasonNumber=1;
    ["scHub","scWindow","twPanel"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
    if(boost){/* a jelölt-sávból egy embert felhúzunk (mintha boostot kapott volna) */
      const t=hcKozosHorgony();const e=Object.values(careerPool).find(x=>typeof x.pk0==="number"&&Math.abs(hcVilagEro(x)-t)<2);
      if(e){e.startRating+=20;e.peak+=20;}}
    S.scoutReal=S.scoutReal||null;
    const out=[];
    for(let i=0;i<2;i++){const r=hcFelfedez(()=>scoutRealDiscover("scoutfind"));
      out.push(r?{n:r.n,free:!!r.free,frac:r.frac,arF:r.arF,tur:r.turelem}:null);}
    return out;},boost);
  await A.evaluate(()=>{scoutRealSet&&scoutRealSet(true);});await B.evaluate(()=>{scoutRealSet&&scoutRealSet(true);});
  const sr=await A.evaluate(()=>scoutRealOn());
  const fA=await fel(A,true),fB=await fel(B,false);
  ok(fA.every(Boolean)&&fA.map(x=>x.n).join()===fB.map(x=>x.n).join(),"ugyanaz a két játékos (más kerettel, és az egyik gépen boostolt jelölttel is)",{A:fA,B:fB,sr});
  ok(fA.map(x=>x.free).join()===fB.map(x=>x.free).join(),"ugyanaz az ingyenesség",{A:fA.map(x=>x.free),B:fB.map(x=>x.free)});

  console.log("— 4. az ár —");
  /* eltérő ügynökség */
  const ar=(p,ag)=>p.evaluate((ag)=>{S.idx=3;S.seasonNumber=1;hcAllapot().n={};
    const _a=window.agencyStars;window.agencyStars=()=>ag;
    const r=hcFelfedez(()=>scoutRealDiscover("scoutfind"));window.agencyStars=_a;
    return r?{n:r.n,frac:r.frac,arF:r.arF,tur:r.turelem}:null;},ag);
  const aA=await ar(A,1),aB=await ar(B,8);
  ok(aA&&aB&&aA.n===aB.n&&aA.frac===aB.frac&&aA.arF===aB.arF&&aA.tur===aB.tur,"az ár (arány, engedmény) és a türelem közös, 1★ és 8★ ügynökséggel is",{aA,aB});

  console.log("— 3. a scout-célzás —");
  /* a 2. idény horgonya: a házigazda, aztán a vendég jelez */
  await A.evaluate(async()=>{S.seasonNumber=2;S.idx=0;await hcmJelez("idény");});
  await B.evaluate(async()=>{S.seasonNumber=2;S.idx=0;await hcmJelez("idény");});
  const cel=p=>p.evaluate(()=>{
    S.seasonNumber=2;S.idx=2;hcAllapot().n={};
    const C=scoutCelAllapot();C.p={t:"kor",v:"34-"};C.m={t:"poszt",v:"KAPUS"};
    const r=hcFelfedez(()=>scoutRealDiscover("scoutfind"));
    const korai={n:r&&r.n,cel:r&&r.cel||null,kor:r&&careerPool[r.n]&&careerPool[r.n].age};
    S.idx=17;hcAllapot().n={};
    let kesoi=[];for(let i=0;i<6;i++){const q=hcFelfedez(()=>scoutRealDiscover("hattrick"));if(q)kesoi.push(q.cel||null);}
    C.p=null;C.m=null;S.seasonNumber=1;S.idx=0;
    return {korai,kesoi};});
  const cA=await cel(A),cB=await cel(B);
  ok(cA.korai.n&&cA.korai.n===cB.korai.n&&!cA.korai.cel,"a 2. idény elején a célzás nem szűr, és ugyanaz jön",{A:cA.korai,B:cB.korai});
  ok(cA.kesoi.some(x=>x&&x.length),"a 15. forduló után a célzás újra szűr",cA.kesoi);

  console.log("— 5. a horgony —");
  ok(typeof hor.tars==="number"&&hor.tars===horA&&hor.sz===1,"a vendég megkapta a házigazda horgonyát",{hor,horA});
  const nh=await B.evaluate(()=>{const M=hcmAllapot();const t=M.tars;M.tars=null;S.seasonNumber=1;S.idx=4;hcAllapot().n={};
    const r=hcFelfedez(()=>scoutRealDiscover("scoutfind"));const e=_hcKoraiElter;M.tars=t;return {elter:e};});
  ok(nh.elter===true,"horgony nélkül a vendég jelzi az eltérést",nh);

  console.log("— 6. a napló —");
  const nap=await A.evaluate(()=>{S.seasonNumber=1;S.idx=0;const H=hcAllapot();H.tervKi={};
    const _s=window.startRoundNow;window.startRoundNow=()=>{};window.hcFuggoKapu=()=>false;window.autoTitleGate=()=>false;
    startRound();window.startRoundNow=_s;
    return [...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).filter(x=>/mindkettőtök scoutja ugyanazt/.test(x)).slice(-1)[0]||"";});
  ok(/fordulóban \(\d/.test(nap)&&/ugyanazon az áron/.test(nap),"a kezdőrúgás előtt a napló kimondja a tervet (fordulókkal)",nap);

  console.log("— 7. oldalhibák —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
