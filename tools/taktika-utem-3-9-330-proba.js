/* ⚙️ 3.9.330 — A TAKTIKA BEGYAKORLÁSÁNAK ÜTEME ÉS A CSÚSZKÁK SKÁLÁJA.

   BEJELENTÉS: „a taktika begyakorlási sebessége teljesen elfogadhatatlan, az
   hogy másfél szezon alatt egy darab ismertségi szintet lépjen előre, az
   teljesen irreális."

   Amit mér:
     1. a lassulás 72 fölött 5%/szint (0,92 → 0,95); az eredmény-szorzó
        (döntetlen 0,5, vereség 0,25) — valódi tacticTrainAfterMatch-csel is;
     2. egy közepes idény kb. kétszer annyit ad, mint régen;
     3. a taktika-csúszkák a plafonig érnek (99: 60·70·80·89·99; kitolt
        plafonnál arányosan), a panel az új küszöböket írja;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9330;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(500);

  console.log("\n— 1. a begyakorlás üteme —");
  const t1=await p.evaluate(()=>{
    const o={};
    const k=S.tactics.active||Object.keys(TACTICS)[0];S.tactics.active=k;
    o.rate85=tacticLevelRate(85,k);o.rate90=tacticLevelRate(90,k);o.rate70=tacticLevelRate(70,k);
    o.perf=[tacticPerfMult(4,0),tacticPerfMult(1,0),tacticPerfMult(1,1),tacticPerfMult(0,1)];
    /* egy-egy valódi meccs utáni lépés 92-n és 97-en (90 fölött a csapaterő-szorzó 1) */
    const lep=(L,gf,ga)=>{S.tactics.levels[k]=L;tacticTrainAfterMatch(gf,ga);return S.tactics.levels[k]-L;};
    o.g92w=lep(92,1,0);o.g92d=lep(92,1,1);o.g92l=lep(92,0,1);o.g97w=lep(97,1,0);
    S.tactics.levels[k]=85;
    return o;});
  ok(Math.abs(t1.rate85-Math.pow(0.95,13))<1e-9&&Math.abs(t1.rate90-Math.pow(0.95,18))<1e-9&&Math.abs(t1.rate70-1.06)<1e-9,
    "a lassulás 72 fölött szintenként 5% (régen 8%) — 85-ön ×1,52, 90-en ×1,78 a régihez képest",{r85:t1.rate85,regi85:Math.pow(0.92,13),r90:t1.rate90,regi90:Math.pow(0.92,18)});
  ok(t1.perf.join()==="1.25,1,0.5,0.25","az eredmény-szorzó: nagy győzelem 1,25 · győzelem 1 · döntetlen 0,5 · vereség 0,25",t1.perf);
  ok(t1.g92w>0&&Math.abs(t1.g92d/t1.g92w-0.5)<1e-6&&Math.abs(t1.g92l/t1.g92w-0.25)<1e-6,"valódi meccs után: a döntetlen a győzelem fele, a vereség a negyede",t1);
  ok(Math.abs(t1.g97w/t1.g92w-Math.pow(0.95,5))<1e-6,"92 → 97: a lépés 0,95^5-szörösére lassul",{arany:t1.g97w/t1.g92w,vart:Math.pow(0.95,5)});

  console.log("\n— 2. egy közepes idény, alap tempón —");
  const t2=await p.evaluate(()=>{
    /* a képlet tiszta modellje: 60% illeszkedés, közepes eredménysor */
    const rate=(L,b)=>L<=72?1+(72-L)*0.03:Math.pow(b,L-72);
    const idx=(L,b,P)=>{const pm=0.1*1.25+0.35*1+0.3*P[0]+0.25*P[1];let x=L;
      for(let i=0;i<30;i++)x=Math.min(99,x+0.237*rate(x,b)*(0.6+0.6*0.8)*pm*0.8);return x-L;};
    return {uj85:idx(85,0.95,[0.5,0.25]),regi85:idx(85,0.92,[0.35,0.1]),uj90:idx(90,0.95,[0.5,0.25]),regi90:idx(90,0.92,[0.35,0.1])};});
  ok(t2.uj85>=1.9&&t2.uj85/t2.regi85>=1.6&&t2.uj90/t2.regi90>=1.8,"egy közepes idény kb. kétszer annyit ad (85-ön ~+2,1, 90-en ~+1,6)",t2);

  console.log("\n— 3. a taktika csúszkái a plafonig —");
  const t3=await p.evaluate(()=>{
    const o={},k=S.tactics.active;
    o.k99=[0,1,2,3,4].map(i=>tdKuszob(i,k));
    o.max=[59,60,69,70,79,80,88,89,98,99].map(L=>tdMaxFor(L,k));
    S.tactics.levels[k]=99;tdMemoClear();o.lv99=tdMemo().lv;o.max99=tdMemo().max;
    /* kitolt plafon (Guardiola/Mourinho): arányosan */
    const _c=tacticCeil;tacticCeil=()=>125;
    o.k125=[0,1,2,3,4].map(i=>tdKuszob(i,k));
    S.tactics.levels[k]=99;tdMemoClear();o.max99g=tdMemo().max;o.lv99g=tdMemo().lv;
    tacticCeil=_c;
    S.tactics.levels[k]=82;tdMemoClear();
    o.html=tdSectionHtml().replace(/<[^>]+>/g," ");
    return o;});
  ok(t3.k99.join()==="60,70,80,89,99"&&t3.max.join()==="0,1,1,2,2,3,3,4,4,5","99-es plafonnál 60 · 70 · 80 · 89 · 99 nyit egy-egy csúszkát",t3);
  ok(t3.max99===5&&Math.abs(t3.lv99-20)<1e-9,"a 99-es ismertségen mind az öt csúszka és a teljes hatás (20. fok)",{max:t3.max99,lv:t3.lv99});
  ok(t3.k125.join()==="60,76,93,109,125"&&t3.max99g===3&&t3.lv99g<20,"125-ös plafonnál a skála arányosan nyúlik (60 · 76 · 93 · 109 · 125)",t3);
  ok(/60 → 1, 70 → 2, 80 → 3, 89 → 4, 99 → 5/.test(t3.html)&&!/150/.test(t3.html)&&/a következő 89-nél/.test(t3.html),"a panel az új küszöböket írja (82-n: 3/5, a következő 89-nél)",t3.html.slice(0,400));
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
