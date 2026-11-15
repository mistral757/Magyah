/* 🌘 1.0.9.7.00 — A REJTETT CSAPATSTÍLUS A TALIZMÁN-MENÜBEN.
   KÉRÉS: „A rejtett csapatstílus legyen ugyan rejtett, de a talizmánok
   felületen ott lehessen megnézni, melyik az, és mik lettek eddig feloldva,
   mik aktívak onnan."
   Amit mér:
     1. rejtett állapot és talizmán nélkül a blokk nem jelenik meg;
     2. a talizmán-menüben: a legjobb rejtett stílus neve (és a mögötte álló),
        a négy esély, a feloldott képességek állapottal (aktív / a stílus
        élővé vált), az árnyék-pontok, az élő ajánlat gombja;
     3. a gomb az ajánlatot nyitja;
     4. a HUB-on és a csapatstílus-menüben továbbra sincs a neve;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9201;
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
  await p.waitForFunction(()=>typeof rejtTalHtml==="function",null,{timeout:15000});
  await p.evaluate(()=>{
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
    phase="season";S.seasonNumber=3;S.idx=12;
    window.saveGame=()=>{};window.saveGameNow=()=>{};
    window.__ki=ki;});
  const r=await p.evaluate(async()=>{
    const ki=window.__ki;const varj=ms=>new Promise(r=>setTimeout(r,ms));
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    S.rejtett=null;
    ki.ures=rejtTalHtml();
    /* a talizmán: a négy esély él */
    window.talRejtP=v=>({rpont:0.21,rkep:0.15,rajanl:0.09,rszerep:0.12})[v]||0;
    const _talOn=talOn;window.talOn=()=>true;
    const mk=(k)=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("tikitaka");S.style2=null;S.styleExtra=[];try{styleLvlCacheClear();}catch(e){}
    const jel=rejtJeloltek();
    const a=jel.find(k=>k==="beton")||jel[0],b=jel.find(k=>k!==a);
    const ms=k=>(STYLE_MILESTONES[k]||[]);
    const done={};done[a]={};ms(a).slice(0,3).forEach(d=>{done[a][d.id]=1;});done[b]={};ms(b).slice(0,1).forEach(d=>{done[b][d.id]=1;});
    const t1=rejtKepJeloltek(a,1)[0],t2=rejtKepJeloltek("tikitaka",1)[0],t3=rejtKepJeloltek(a,2)[1]||rejtKepJeloltek(a,2)[0]||(STYLE_TRAITS[a]||[]).find(z=>z.lv&&z.lv[1]);ki.t3=!!t3;
    S.rejtett={seeded:1,done,best:a,pontDb:4,kepSz:{3:1},
      kep:[{s:a,k:t1.key,lv:1,season:3},...(t2?[{s:"tikitaka",k:t2.key,lv:1,season:2}]:[])],
      ajanlat:t3?{s:a,k:t3.key,ar:7,season:3,lattuk:true}:null};
    ki.a=a;ki.b=b;ki.t1=t1.n;ki.t2=t2?t2.n:null;
    talMenuOpen();await varj(200);
    const el=document.getElementById("talRejt");
    ki.txt=el?el.textContent:"";
    ki.lathato=!!el&&el.offsetParent!==null&&el.textContent.length>0;
    ki.legjobb=ki.txt.indexOf(styleByKey(a).n)>=0;
    ki.mogotte=ki.txt.indexOf(styleByKey(b).n)>=0;
    ki.eselyek=/21%/.test(ki.txt)&&/15%/.test(ki.txt)&&/9%/.test(ki.txt)&&/12%/.test(ki.txt);
    ki.aktiv=ki.txt.indexOf(t1.n)>=0&&/✅ aktív/.test(ki.txt);
    ki.elo=!t2||/élővé vált/.test(ki.txt);
    ki.pont=/\+4 csapatstílus-pont/.test(ki.txt);
    if(window.__KEP){el.scrollIntoView({block:"start"});await varj(200);await window.__KEP();}
    const btn=document.getElementById("talRejtAjanlBtn");ki.gomb=!!btn;
    if(btn){btn.click();await varj(200);const m=document.getElementById("hubTacticConfirmModal"),tm=document.getElementById("talModal");
      ki.ajanlNyilt=!!m&&!m.classList.contains("hide")&&/Suttogó ajánlat/.test((document.getElementById("hubTacticConfirmTitle")||{}).textContent||"")&&tm.classList.contains("hide");}
    /* 4. máshol nincs neve */
    try{talMenuClose();}catch(e){}
    try{openHubMidSeason();renderHub();}catch(e){}
    const hub=(document.getElementById("scHub")||{}).innerText||"";
    ki.hubNev=hub.indexOf("Rejtett csapatstílus")>=0&&hub.indexOf(styleByKey(a).n+" (rejtett")>=0;
    window.talOn=_talOn;
    return ki;});
  console.log(JSON.stringify(r).slice(0,1800));
  ok(r.ures==="","1. rejtett állapot és talizmán nélkül nincs blokk",r.ures.slice(0,80));
  ok(r.lathato&&r.legjobb&&r.mogotte,"2. a menüben ott a legjobb rejtett stílus és a mögötte álló",{a:r.a,b:r.b});
  ok(r.eselyek,"2. a négy esély",r.txt.slice(0,400));
  ok(r.aktiv&&r.elo,"2. a feloldott képességek állapottal (aktív / a stílus élővé vált)",{t1:r.t1,t2:r.t2});
  ok(r.pont,"2. az árnyék-pontok");
  ok(r.t3&&r.gomb&&r.ajanlNyilt,"3. az élő ajánlat gombja megnyitja az ajánlatot (és nem takarja a menü)",{t3:r.t3,gomb:r.gomb,nyilt:r.ajanlNyilt});
  ok(!r.hubNev,"4. a HUB-on továbbra sincs a neve");
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
