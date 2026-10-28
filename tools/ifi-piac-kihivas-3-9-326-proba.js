/* 🐞 3.9.326 — „KÍNÁLD PIACI ELADÁSRA EGY 20 ÉV ALATTI JÁTÉKOSODAT": AZONNAL TELJESÜL.

   BEJELENTETT HIBA: „Ez a kihívás nem teljesítettre jön ki abban az esetben,
   ha idő előtt azt a játékost, akit piaci eladásra kínáltál, el is adtad …
   abban a pillanatban, hogy egy ilyen játékost el is adtál, azonnal
   teljesített kihívást kell hogy kihozzon."

   Amit mér:
     1. a kitétel pillanatában a kihívás teljesül és kifizet (nem a határidőn);
     2. ha a kirakott 20 alatti a vállaláskor már a piacon állt, és elkel
        (piaci licit), a kihívás az eladáskor teljesül és kifizet;
     3. az azonnali eladás (a kirakott fiatal „eladás most") ugyanígy;
     4. a teljesülést utóbb semmi nem veszi el (a retesz a határidőnél is áll);
     5. 20 fölötti kitétele nem teljesíti;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9326;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a meccsmotor helyett egy számláló — a kapu a kezdőrúgás ELŐTT dönt */
    window._motor=0;playMatchMotor=function(){window._motor++;};
    window._toast=[];backToast=function(m){window._toast.push(String(m));};});
  await p.waitForTimeout(800);

  await p.waitForTimeout(800);
  const r=await p.evaluate(()=>{
    const o={};
    window.saveGame=()=>{};
    const fiz=[];const _rc=resolveChallenge;resolveChallenge=function(ch){fiz.push(ch.type+":"+(challengeSatisfied(ch)?"ok":"bukott"));return _rc.apply(this,arguments);};
    saleCanList=()=>true;
    const uj=(n,age)=>{careerPool[n]={n,pos:["CS"],ovr:70,age,pot:900,peak:75,nat:"Magyarorszag",conf:0,startRating:70};
      const pl={n,pos:["CS"],ovr:70,age,pot:900,nat:"Magyarorszag"};extraRoster.push(pl);drafted.add(n);return pl;};
    let minta=null;
    const vallal=()=>{let ch=null;
      if(minta)ch=JSON.parse(minta);
      for(let i=0;i<4000&&!ch;i++){let x=null;try{x=buildChallengeOffer("long",challengeContext());}catch(e){}if(x&&x.type==="youthListed")ch=x;}
      if(!ch)return null;
      if(!minta)minta=JSON.stringify(ch);
      delete ch.metLatched;S.activeChallenges=(S.activeChallenges||[]).filter(c=>c.type!=="youthListed");acceptChallenge(ch);return ch;};
    /* 1. kitétel */
    const y1=uj("Teszt Ifi Egy",18);
    const c1=vallal();o.van=!!c1;
    o.elotte=c1&&challengeProgress(c1);
    saleListPlayer(y1);
    o.kitetel={fiz:fiz.slice(),aktiv:(S.activeChallenges||[]).some(c=>c===c1)};
    /* 2. a vállaláskor már piacon álló fiatal elkel (piaci licit) */
    fiz.length=0;
    const c2=vallal();
    o.c2azonnal=fiz.slice();
    /* a vállalás pillanatában még nem fizetett (nem volt kitétel) — most eladjuk */
    const rec=saleListingOf("Teszt Ifi Egy");
    if(rec){rec.offer={amount:1000000};saleAcceptOffer(rec);}
    o.licit={fiz:fiz.slice(),aktiv:(S.activeChallenges||[]).some(c=>c===c2),bent:!!saleRosterPlayer("Teszt Ifi Egy")};
    /* 3. azonnali eladás */
    fiz.length=0;
    const y3=uj("Teszt Ifi Ketto",19);
    const ml=saleMarketState();ml.list.push({n:y3.n,since:0,due:99,rejects:0,offer:null,pending:true});   /* kint áll, a kitételi útvonal nélkül */
    const c3=vallal();
    const elotte3=fiz.slice();
    releasePlayer(y3,true);
    o.azonnal={elotte:elotte3,fiz:fiz.slice()};
    /* 4. a retesz: ha nem fizetett volna, a határidőn is teljesült marad */
    const c4={type:"youthListed",target:1,metLatched:true,startProgress:0};
    o.retesz=challengeSatisfied(c4)&&challengeProgress(c4)>=1;
    /* 5. 20 fölötti */
    fiz.length=0;
    const y5=uj("Teszt Idos",24);
    const c5=vallal();saleListPlayer(y5);
    o.idos={fiz:fiz.slice(),aktiv:(S.activeChallenges||[]).some(c=>c===c5)};
    resolveChallenge=_rc;
    return o;});
  ok(r.van&&r.elotte===0,"a kihívás felajánlható és vállalható; a kitétel előtt 0/1",r);
  ok(r.kitetel.fiz.join()==="youthListed:ok"&&!r.kitetel.aktiv,"a 20 alatti kitétele AZONNAL teljesíti és kifizeti",r.kitetel);
  ok((r.c2azonnal.join()==="youthListed:ok")||(r.licit.fiz.join()==="youthListed:ok"&&!r.licit.aktiv&&!r.licit.bent),"ha már a piacon állt: a vállaláskor vagy legkésőbb az eladáskor teljesül",{c2:r.c2azonnal,licit:r.licit});
  ok(r.azonnal.elotte.join()==="youthListed:ok"||r.azonnal.fiz.join()==="youthListed:ok","a kirakott fiatal azonnali eladásakor is teljesül",r.azonnal);
  ok(r.retesz,"a teljesülést utóbb semmi nem veszi el (retesz)",r.retesz);
  ok(r.idos.fiz.length===0&&r.idos.aktiv,"20 fölötti kitétele nem teljesíti",r.idos);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
