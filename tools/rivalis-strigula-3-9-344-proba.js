/* ⚔️ „GYŐZZ LE RIVÁLIS ERŐS ELLENFELEKET" — STRIGULA A MECCS PILLANATÁBAN (3.9.344).

   KIMONDOTT KÉRÉS: „A gyozz le rivális ellenfeleket mérése hibás. A határidő
   lejárta idején lévő meccs erőnket vetíti vissza. Minden egyes meccs után
   azonnal be kell húzni a strigulát, ha az egy érvényes rivális elleni győzelem
   volt."

   Amit mér:
     1. egy VALÓDI lejátszott bajnoki meccs rekordja (S.fixtureResults) viszi a
        lefújáskor mért `rival` jelzőt, és az egyezik a meccs előtti küszöbbel;
     2. a számláló a rögzített jelzőt nézi: a keret utólagos erősödése (a mostani
        teamOVRbase nő) NEM veszi el a már bezsebelt skalpot;
     3. a fordítottja: a meccskor nem-rivális győzelem a keret gyengülésével
        sem válik utólag skalppá;
     4. a jelző nélküli (régi mentésből jövő) rekordnál marad a korábbi becslés;
     5. a szabály-szöveg kimondja, hogy a strigula a lefújáskor kerül fel. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9344;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  /* ---- egy valódi egyjátékos karrier, az 1. idény ELEJÉN ---- */
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
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    return {idx:S.idx};});

  console.log("— 1. valódi meccs: a rekord viszi a meccskori jelzőt —");
  await p.evaluate(()=>{
    const fx=S.fixtures[S.idx];
    window.__elo={my:teamOVRbase(),opp:fx.o.ovr,riv:chIsRivalOvr(fx.o.ovr)};
    S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       for(const id of ["subPanelSkip","halfSubSkip","guideTipOk","talDrawLater","unlockOk","skillOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
       return !S.playing&&S.fixtureResults.length>0;});
     if(!kesz)await p.waitForTimeout(500);}}
  const r1=await p.evaluate(()=>({elo:window.__elo,rek:S.fixtureResults[0]}));
  ok(r1.rek&&typeof r1.rek.rival==="boolean","a rekordban ott a rival jelző",r1.rek);
  ok(r1.rek&&r1.rek.rival===r1.elo.riv,"a jelző a meccskori küszöbbel egyezik",r1);

  console.log("\n— 2–4. a számláló a rögzített jelzőt nézi —");
  const r2=await p.evaluate(()=>{
    const o={};const _b=teamOVRbase;const keep=S.fixtureResults;
    const ch={type:"bigScalps",target:3};
    const rek=(ovr,gf,ga,rival)=>{const r={o:{n:"X",ovr},gf,ga,home:true,duel:false,round:1};
      if(rival!==undefined)r.rival=rival;return r;};
    S.fixtureResults=[rek(85,2,1,true),rek(84,1,0,true),rek(70,3,0,false),rek(90,0,1,true)];
    teamOVRbase=()=>86;o.most86=challengeRawValue(ch);
    teamOVRbase=()=>100;o.erosodve=challengeRawValue(ch);   /* régen: 0 */
    teamOVRbase=()=>60;o.gyengulve=challengeRawValue(ch);   /* régen: 3 */
    S.fixtureResults=[rek(85,2,1),rek(70,1,0)];
    teamOVRbase=()=>86;o.regi86=challengeRawValue(ch);
    teamOVRbase=()=>100;o.regi100=challengeRawValue(ch);
    teamOVRbase=_b;S.fixtureResults=keep;
    return o;});
  ok(r2.most86===2,"két rivális győzelem számít (vereség és nem-rivális nem)",r2);
  ok(r2.erosodve===2,"a keret utólagos erősödése nem veszi el a strigulát",r2);
  ok(r2.gyengulve===2,"a meccskor nem-rivális győzelem utólag sem lesz skalp",r2);
  ok(r2.regi86===1&&r2.regi100===0,"jelző nélküli régi rekord: a korábbi becslés marad",r2);

  console.log("\n— 5. szöveg —");
  const r5=await p.evaluate(()=>/lefújás pillanatában/.test(document.documentElement.innerHTML)
    ||/lefújás pillanatában/.test(String(buildChallengeOffer)));
  ok(r5,"a szabály kimondja: a strigula a lefújáskor kerül fel");
  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
