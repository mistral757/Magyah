/* 🧾 LEGUTÓBBI PÉNZMOZGÁSOK (3.9.223)

   BEJELENTETT HIBA: a pénztár magától nő (közös karrier, 3. idény,
   Sztárvilág) — tesztkarrierben nem állt elő. A könyvelés ezért tételesen is
   ír, forrással, hogy a következő előfordulás egy pillantással azonosítható
   legyen.

   Amit mér:
     1. valódi meccsek után a napló tételes: kategória, összeg, idény/forduló,
        időpont, és a forrás a hívó játékfunkció (pl. fanMatchTick ← fullTime);
     2. bevétel és kiadás is bekerül, az irány a kategóriából;
     3. legfeljebb 30 tétel marad (a legrégebbiek esnek ki);
     4. a büdzsé-chip lenyitásában megjelenik; a mentés viszi;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9406;
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
  await p.waitForFunction(()=>typeof ledgerLogHtml==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  const r=await p.evaluate(async()=>{
    try{utoLancVege();mEloTorol();}catch(e){}
    S.transferBudget=5000000;
    S.auto=true;S.idx=0;buildSeasonFixtures();playMatch();
    for(let i=0;i<300&&S.idx<3;i++)await new Promise(r=>setTimeout(r,50));
    S.auto=false;for(let i=0;i<60&&S.playing;i++)await new Promise(r=>setTimeout(r,100));
    try{utoLancVege();}catch(e){}
    const L=S.ledger.log.slice();
    const o={n:L.length,lelato:L.find(x=>x.k==="fans"),ber:L.find(x=>x.k==="wage")};
    /* plafon */
    for(let k=0;k<50;k++)budgetEarn(1000,"reward");
    o.plafon=S.ledger.log.length;o.utolso=S.ledger.log[S.ledger.log.length-1];
    openHubMidSeason();hubBudgetToggle(true);
    const el=document.getElementById("hubLedgerLog");
    o.panel=!!el&&/Legutóbbi pénzmozgások/i.test(el.textContent)&&/forrás:/.test(el.textContent);
    saveGame();try{saveGameFlush&&saveGameFlush();}catch(e){}
    let raw=null;try{raw=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    o.mentes=!!(raw&&raw.S&&raw.S.ledger&&Array.isArray(raw.S.ledger.log)&&raw.S.ledger.log.length===o.plafon);
    return o;});
  ok(r.lelato&&r.lelato.a>0&&r.lelato.sz===1&&/fanMatchTick/.test(r.lelato.f)&&r.lelato.t>0,
     "valódi meccs után tételes: kategória, összeg, idény, időpont, forrás (fanMatchTick ← …)",r.lelato);
  ok(r.ber&&/chargeMatchWages/.test(r.ber.f),"a kiadás is bekerül, a saját forrásával",r.ber);
  ok(r.plafon===30&&r.utolso.k==="reward","legfeljebb 30 tétel marad, a legfrissebb a végén",{plafon:r.plafon,utolso:r.utolso&&r.utolso.k});
  ok(r.panel,"a büdzsé-chip lenyitásában megjelenik, forrással",r.panel);
  ok(r.mentes,"a mentés viszi",r.mentes);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
