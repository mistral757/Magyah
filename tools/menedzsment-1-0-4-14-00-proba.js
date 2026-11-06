/* 📋 A MENEDZSMENT FELÜLET (1.0.4.14.00).

   KÉRÉS: „A menedzsmentnek legyen egy saját menüpontja a csapatépítésen belül.
   És alattuk legyenek a kihívások, mérföldkövek … stílusmérföldkő is … felül
   egy sáv, ahol nagyban mindig ott vannak az aktív kihívások … és 3 random
   mérföldkő, amihez már közel vagy (ki- és belépéskor és kézzel frissül) … az
   összes kihívás-felület a menedzsment saját stílusú ablakában … az
   igazgatósági célkitűzések is ide … legfelül a Run szint és a fő elvárás."

   Amit mér:
     1. a Csapatépítés menüben ott a 📋 Menedzsment, és megnyitja az aloldalt;
     2. legfelül a Run szint és a fő elvárás (a cél-liga NEVÉVEL, a lépcsővel);
     3. az aktív kihívások nagy sávja haladás-gyűrűvel és -sávval;
     4. három közeli mérföldkő; a frissítés gomb és a ki-/belépés újrasorsol;
     5. az igazgatóság megbízása élő állással;
     6. a rendszerezett listák: kihívások, mérföldkő-csoportok, stílus-mérföldkövek;
     7. a kihívás-ajánlat a menedzsment skinjében, a „Elvállalom" gombokkal; más
        célú panelnél a skin lekerül;
     8. a névelők: „az 1. idényben", nem „a 1." / „a(z)";
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9414;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);


  await p.evaluate(()=>{
    unlockGatesOn=()=>false;pendingWorldSeed="MENEDZS14";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();
    pyrPickDiv=5;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    try{$("mgmtOk").click();}catch(e){}
    window.saveGame=()=>{};
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
  });
  const r=await p.evaluate(()=>{
    const o={};
    const btn=document.querySelector('.hubGroup[data-acc="build"] #hubMgmtBtn');
    o.menu=!!btn;
    btn.click();
    const c=$("hubMgmtPicker");o.nyit=c&&!c.classList.contains("hide");o.skin=c.classList.contains("mgmtSkin");
    const t=()=>($("hubMgmtBody").textContent||"").replace(/\s+/g," ");
    o.t0=t();
    o.near0=($("hubMgmtBody").querySelectorAll(".mgNear>div")||[]).length;
    o.k0=JSON.stringify(_mgmtNear);
    /* kézi frissítés */
    let mas=0;for(let i=0;i<6;i++){$("mgmtNearBtn").click();if(JSON.stringify(_mgmtNear)!==o.k0)mas++;}
    o.kezi=mas;
    o.near1=$("hubMgmtBody").querySelectorAll(".mgNear>div").length;
    /* ki- és belépés: újrasorsol */
    const ref=_mgmtNear;$("hubMgmtClose").click();o.kilep=(_mgmtNear!==ref);o.zarva=c.classList.contains("hide");
    const ref2=_mgmtNear;$("hubMgmtBtn").click();o.belep=(_mgmtNear!==ref2);
    /* aktív kihívás + igazgatóság */
    let ch=null;for(let i=0;i<20&&!ch;i++){try{ch=buildChallengeOffer("short",challengeContext());}catch(e){}}
    if(ch){S.activeChallenges=[];acceptChallenge(ch);}
    o.chVan=!!ch;
    S.tal=S.tal||{};S.tal.esHat=S.tal.esHat||{};
    S.tal.esHat.igazg={szezon:S.seasonNumber||1,indult:true,ms:0,mn:0,fb0:fanBase(),elv:[{k:"gol",cel:40},{k:"helyezes",cel:3}]};
    mgmtPanelRender();
    const b=$("hubMgmtBody");
    o.t1=t();
    o.ring=b.querySelectorAll(".mgCh svg").length;
    o.dets=[...b.querySelectorAll("details.mgDet>summary")].map(x=>x.textContent.replace(/\s+/g," ").trim());
    return o;});
  ok(r.menu&&r.nyit&&r.skin,"1. a Csapatépítés menüben ott a Menedzsment, és megnyitja a saját stílusú aloldalt",{menu:r.menu,nyit:r.nyit,skin:r.skin});
  ok(/RUN SZINT/.test(r.t0)&&/A FŐ ELVÁRÁS/.test(r.t0)&&/Nyerd meg: Magyah Élmezőny/.test(r.t0)&&/Ezzel rögzül a Run szinted/.test(r.t0),"2a. legfelül a Run szint és a fő elvárás, a cél-liga nevével",r.t0.slice(0,260));
  ok(/Magyah Harmadosztály/.test(r.t0)&&/Magyah Másodosztály/.test(r.t0),"2b. a lépcső a mostani ligától a célig, nevekkel",r.t0.slice(0,400));
  ok(r.chVan&&/Aktív kihívások \(1\)/.test(r.t1)&&r.ring>=1,"3. az aktív kihívás a nagy sávban, haladás-gyűrűvel",{ring:r.ring});
  ok(r.near0===3&&r.near1===3,"4a. három közeli mérföldkő",{a:r.near0,b:r.near1});
  ok(r.kezi>=1,"4b. a kézi frissítés újrasorsol",r.kezi);
  ok(r.kilep&&r.belep&&r.zarva,"4c. ki- és belépéskor is frissül",{ki:r.kilep,be:r.belep});
  ok(/Az igazgatóság megbízása/.test(r.t1)&&/Gólszám/.test(r.t1)&&/legalább 40 bajnoki gól/.test(r.t1)&&/Bajnoki helyezés/.test(r.t1),"5. az igazgatóság elvárásai élő állással",r.t1.slice(r.t1.indexOf("igazgatóság"),r.t1.indexOf("igazgatóság")+220));
  ok(r.dets.some(x=>/Kihívások/.test(x))&&r.dets.filter(x=>/^🏅/.test(x)).length>=3&&r.dets.some(x=>/Stílus-mérföldkövek — Beton védelem/.test(x)),"6. rendszerezett listák: kihívások, mérföldkő-csoportok, stílus-mérföldkövek",r.dets);
  const k=await p.evaluate(()=>{
    const o={};
    S.activeChallenges=[];
    showChallengeOffers("short",3,()=>{},false,{hubBack:false});
    const tp=$("twPanel");
    o.skin=tp.classList.contains("mgmtSkin");
    o.seal=/A MENEDZSMENT AJÁNLATA/.test(tp.textContent);
    o.gombok=tp.querySelectorAll(".chTake").length;
    tp.querySelector(".chTake").click();$("hubTacticConfirmYes").click();
    o.vallalt=(S.activeChallenges||[]).length;
    o.skinUtana=tp.classList.contains("mgmtSkin");
    $("twTitle").textContent="🎓 Stábtag igazolása";
    return new Promise(res=>setTimeout(()=>{o.leker=!tp.classList.contains("mgmtSkin");res(o);},30));});
  ok(k.skin&&k.seal&&k.gombok>=1,"7a. a kihívás-ajánlat a menedzsment skinjében, a fejléc kimondja",k);
  ok(k.vallalt===1&&k.skinUtana,"7b. az „Elvállalom” (a megerősítővel) ugyanúgy működik, a skin megmarad",k);
  ok(k.leker,"7c. más célú panelnél a skin lekerül",k.leker);
  const n=await p.evaluate(()=>{
    const R=runInit();R.pyrGoalSeason=1;
    const intro=runIntroHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    return {a1:hunAz(String(1)),a5:hunAz(String(5)),a3:hunAz(String(3)),intro};});
  ok(n.a1==="az"&&n.a5==="az"&&n.a3==="a"&&/elérted az 1\. idényben/.test(n.intro)&&!/a\(z\)/.test(n.intro),"8. a névelők: az 1., az 5., a 3. — „a(z)” nélkül",n.intro.slice(n.intro.indexOf("elérted")-5,n.intro.indexOf("elérted")+40));
  ok(!errs.length,"9. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
