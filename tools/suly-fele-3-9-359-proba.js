/* 🧮 SÚLYOZÁS FELE-FELE, A NYÁRZÁRÓ ÉRTÉKELÉS UTÁNI ZÁRÓVAL (3.9.359).

   KIMONDOTT KÉRÉS: „Minden módban állítsuk át a súlyozást úgy, hogy a súly
   egyik fele a nyárzáró értékelés utáni meccs erő, másik fele az új szezon
   indításkori meccs erő."

   Amit mér:
     1. a súly fele-fele: (indító + záró) / 2;
     2. a nyárzáró értékelés (hubShowSeasonReportBody) a szezonkártyák
        kiosztása (és a kártya-fejlesztések) UTÁN méri a záró nevezési
        meccs-erőt (3.9.360 — 3.9.359-ben még a kártyák előtt);
     3. a mérés felülírja a 30. fordulós zárót (a régi megmarad zaro30-ként),
        idényenként egyszer, és a közös karrier saját záró értéke is ez;
     4. a mentésbe kerül; nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9359;
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


  const r=await p.evaluate(()=>{const o={};
    o.fele=mpMsSuly(135.1,114.7);
    const src=hubShowSeasonReportBody.toString();
    const iA=src.indexOf("advanceCareerSeason()"),iK=src.indexOf("determineSeasonCards()"),iD=src.indexOf("drainPendingCardUps(cardResults)"),iZ=src.indexOf("nfZaroUtanRogzit(");
    o.sorrend=iA>0&&iK>iA&&iD>iK&&iZ>iD&&src.indexOf("nfZaroUtanRogzit(",iZ+1)<0;
    const H=pyrFloorHist(),sn=S.seasonNumber||1;
    H[sn]=Object.assign(H[sn]||{},{zaroMs:100});
    S.zaroUtan=null;
    const _t=teamMatchStrength;let ms=112.34;teamMatchStrength=()=>ms;
    o.u1=nfZaroUtanRogzit(sn);o.h1={zaroMs:H[sn].zaroMs,zaro30:H[sn].zaro30,utan:H[sn].zaroUtan};
    ms=150;o.u2=nfZaroUtanRogzit(sn);o.h2=H[sn].zaroMs;
    o.mp=mpSajatZaro(sn);
    teamMatchStrength=_t;
    saveGame();let mentve=false;try{for(let i=0;i<localStorage.length;i++){const t=localStorage.getItem(localStorage.key(i));if(t&&t.indexOf('"zaroUtan":{')>=0){mentve=true;break;}}}catch(e){}
    o.mentve=mentve;return o;});
  ok(Math.abs(r.fele-124.9)<1e-9,"fele-fele: (135,1 + 114,7) / 2 = 124,9",r.fele);
  ok(r.sorrend,"a nyárzáró értékelés a szezonkártyák (és a kártya-fejlesztések) UTÁN méri a zárót — 3.9.360",r.sorrend);
  ok(r.u1&&r.u1.ms===112.3&&r.h1.zaroMs===112.3&&r.h1.zaro30===100&&r.h1.utan===1,"a mérés felülírja a 30. fordulós zárót (a régi zaro30-ként megmarad)",r.h1);
  ok(r.u2.ms===112.3&&r.h2===112.3,"idényenként egyszer: a jelentés újranyitása nem méri újra",{u2:r.u2,h2:r.h2});
  ok(r.mp===112.3,"a közös karrier saját záró értéke is a nyárzáró utáni",r.mp);
  ok(r.mentve,"a mentésbe kerül",r.mentve);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
