/* 🔍 1.0.9.3.00 — A SCOUT-TALÁLAT A NEHÉZSÉGGEL A KERETED NYERS EREJÉHEZ HÚZ.
   KÉRÉS: „A Scout által talált játékosok (nem a sima átigazolási piac) átlag
   ratingja nehézségi szintenként egyre növekvő mértékben közeledjen a csapat
   nyers erejéhez a mezőny erejével szemben. […] 9.2-n kb már félúton […]
   10.5-nél pedig már 15%-kal a nyers erő felé."
   Amit mér:
     1. a görbe: 1.1 → 0 · 9.2 → 0,5 · 10.5 → 0,65, szigorúan nő, és a
        lépései nőnek (egyre növekvő mérték);
     2. lemaradó keretnél (nyers = sáv közepe − 20) a sáv a (nyers − sáv
        közepe) t-szeresével csúszik le, a valódi felfedezések átlaga ennyivel
        lejjebb;
     3. erősebb keretnél nincs csúszás (nincs ingyen sztár);
     4. a fizetős piac sávja (signingBand) változatlan;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9193;
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
  await p.waitForFunction(()=>typeof discRawT==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=4;S.idx=10;
    window.saveGame=()=>{};
    /* 1. a görbe */
    const g=[];for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++)g.push(discRawT(nf,s));
    ki.g={a:g[0],k92:discRawT(9,2),k105:discRawT(10,5),k51:discRawT(5,1),k71:discRawT(7,1)};
    let no=true,gyorsul=true;
    for(let i=1;i<g.length;i++){if(!(g[i]>g[i-1]))no=false;if(i>=2&&!(g[i]-g[i-1]>=g[i-1]-g[i-2]-1e-12))gyorsul=false;}
    ki.g.no=no;ki.g.gyorsul=gyorsul;
    /* 2–4. a sáv és a valódi felfedezések */
    const b0=signingBand();ki.b0={mid:b0.mid,lo:b0.lo,hi:b0.hi,d:b0.d};
    const _raw=bandTeamRaw;
    const nfAll=v=>{window.styleXNfMost=()=>v;};
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const atlag=()=>{let x=0,n=0;for(let i=0;i<500;i++){const e=pickDiscoveryEntry(cands,false);if(e){x+=e.startRating;n++;}}return n?x/n:null;};
    const meres=(nf,s,rawF)=>{nfAll({nf,s});window.bandTeamRaw=rawF;const bb=signingBand();const d=discoveryBand(false);
      return {sh:Math.round(d.sh*100)/100,vart:Math.round(Math.min(0,discRawT(nf,s)*(rawF()-bb.mid))*100)/100,lo:d.lo,hi:d.hi,avg:atlag()};};
    const gyenge=()=>b0.mid-20,eros=()=>b0.mid+30;
    ki.m11=meres(1,1,gyenge);
    ki.m92=meres(9,2,gyenge);
    ki.m105=meres(10,5,gyenge);
    ki.e105=meres(10,5,eros);
    window.bandTeamRaw=_raw;window.styleXNfMost=()=>({nf:10,s:5});
    const sb=signingBand();ki.sb={mid:sb.mid,lo:sb.lo,hi:sb.hi};
    return ki;});
  console.log(JSON.stringify(r).slice(0,2000));
  ok(r.g.a===0&&Math.abs(r.g.k92-0.5)<1e-9&&Math.abs(r.g.k105-0.65)<0.002,"1. a görbe: 1.1 → 0 · 9.2 → 0,5 · 10.5 → 0,65",r.g);
  ok(r.g.no&&r.g.gyorsul,"1. szigorúan nő, egyre növekvő lépésekkel",r.g);
  ok(r.m11.sh===0,"2. 1.1-en nincs csúszás",r.m11);
  ok(r.m92.sh<0&&r.m92.sh===r.m92.vart&&r.m105.sh===r.m105.vart&&r.m105.sh<r.m92.sh,"2. lemaradó keretnél a sáv a (nyers − sáv közepe) t-szeresével csúszik le: 9.2 → félút, 10.5 → 65%",{m92:r.m92,m105:r.m105});
  ok(r.m92.avg!=null&&r.m11.avg!=null&&Math.abs((r.m92.avg-r.m11.avg)-r.m92.sh)<=3&&Math.abs((r.m105.avg-r.m11.avg)-r.m105.sh)<=3,"2. a valódi felfedezések átlaga ennyivel lejjebb",{a11:r.m11.avg,a92:r.m92.avg,a105:r.m105.avg});
  ok(r.e105.sh===0,"3. erősebb keretnél nincs csúszás (nincs ingyen sztár)",r.e105);
  ok(r.sb.mid===r.b0.mid&&r.sb.lo===r.b0.lo&&r.sb.hi===r.b0.hi,"4. a fizetős piac sávja változatlan",{b0:r.b0,sb:r.sb});
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
