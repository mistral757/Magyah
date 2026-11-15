/* ⏭ 1.0.9.4.00 — SZIMULÁCIÓ A MECCS VÉGÉIG.
   KÉRÉS: „Legyen elhelyezve egy szimuláció a meccs végéig gomb. Mert néha
   már első félidőben eldől a meccs és akkor lehessen a végére ugrani ha
   akarsz. Kivéve PvP párharcban."
   Amit mér:
     1. rendes bajnoki meccsen, lassú (0,25×) tempón a gomb a tempó alatt
        látszik; a 15. perc körül megnyomva a meccs néhány másodperc alatt
        lefut, a félidei csereszünet (bekapcsolva) NEM állítja meg, a
        jelenetek elmaradnak, a gomb eltűnik, a napló kimondja;
     2. az eredmény a lefújás könyvelésében (S.lastMatch) rendben van, az
        eredményjelző 90. percnél áll;
     3. PÁRHARCBAN a gomb nem látszik, és a fogantyú is elutasítja;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9195;
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
  await p.waitForFunction(()=>typeof playMatch==="function",null,{timeout:15000});
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
    phase="season";S.seasonNumber=2;S.idx=3;
    window.saveGame=()=>{};window.saveGameNow=()=>{};
    window.__ki=ki;});
  const r=await p.evaluate(async()=>{
    const ki=window.__ki||{};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{utoLancVege();mEloTorol();}catch(e){}
    try{localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}
    matchSpeed=0.25;
    try{subHalftimeStopOn=()=>true;}catch(e){}
    S.auto=false;S.lastMatch=null;
    const sorok=[];const _al=addLine;
    window.addLine=function(h){try{sorok.push(String(h).replace(/<[^>]+>/g,""));}catch(e){}return _al.apply(this,arguments);};
    playMatch();
    /* a 15. percig (vagy amíg egy jelenet áll) — a lassú tempón */
    const t0=Date.now();let lathato=false;
    for(let i=0;i<600;i++){await varj(50);
      const vs=document.getElementById("vegereSor");lathato=!!vs&&!vs.classList.contains("hide")&&vs.offsetParent!==null;
      const mt=(document.getElementById("sbClock")||{}).textContent||"";
      if(lathato&&Date.now()-t0>6000)break;}
    ki.lathato=lathato;ki.gombSzoveg=(document.getElementById("vegereBtn")||{}).textContent;
    ki.animElotte=!!(_mev&&_mev.anim);
    const t1=Date.now();
    document.getElementById("vegereBtn").click();
    ki.animUtana=_mev?_mev.anim:null;
    let felidoPanel=false;
    for(let i=0;i<1200&&!S.lastMatch;i++){await varj(25);
      const hp=document.getElementById("htSubPanel");if(hp&&!hp.classList.contains("hide"))felidoPanel=true;}
    ki.ido=Date.now()-t1;ki.vege=!!S.lastMatch;ki.felidoPanel=felidoPanel;
    const vs=document.getElementById("vegereSor");ki.utanaRejtve=!vs||vs.classList.contains("hide");
    ki.naplo=sorok.filter(s=>/Szimuláció a meccs végéig/.test(s)).length;
    ki.lm=S.lastMatch?{gf:S.lastMatch.gf,ga:S.lastMatch.ga}:null;
    ki.fullTimeSor=sorok.filter(s=>/LEFÚJTÁK|Lefújták|lefújta|VÉGE/i.test(s)).length;
    window.addLine=_al;
    /* 3. párharc: a fogantyú és a gomb */
    try{
      const W=JSON.parse(JSON.stringify(h2hWireSnapshot()));W.by=mpMyId();
      const tars=JSON.parse(JSON.stringify(W));tars.by="zz";tars.teamName="Társ FC";tars.players.forEach((q,i)=>{q.n="Társ "+(i+1);});tars.plan=[];delete tars.sty;delete tars.lm;
      const sim=h2hSimulate(W,tars,h2hMulberry(7),false);sim.hf="host";
      MP.role="host";_h2hIndult=null;S.lastMatch=null;
      for(let i=0;i<100&&S.playing;i++)await varj(50);
      h2hStart({host:W,guest:tars},sim,15,"s2r15x");
      let duelLatszik=false,duelCan=null;
      for(let i=0;i<120;i++){await varj(50);
        const v=document.getElementById("vegereSor");if(v&&!v.classList.contains("hide"))duelLatszik=true;
        if(MATCH_CTL&&duelCan===null)duelCan=MATCH_CTL.canVegere();}
      ki.duel={latszik:duelLatszik,can:duelCan,vegere:MATCH_CTL?MATCH_CTL.vegere():null};
    }catch(e){ki.duelErr=String(e&&e.stack||e);}
    return ki;});
  console.log(JSON.stringify(r).slice(0,1500));
  ok(r.lathato&&/meccs végéig/.test(r.gombSzoveg||""),"1. a gomb a tempó alatt látszik a futó meccsen",{l:r.lathato,t:r.gombSzoveg});
  ok(r.vege&&r.ido<15000,"1. megnyomva a meccs gyorsan lefut",{ido:r.ido,vege:r.vege});
  ok(!r.felidoPanel,"1. a félidei csereszünet (bekapcsolva) nem állítja meg",r.felidoPanel);
  ok(r.animUtana===false,"1. a jelenetek ezen a meccsen elmaradnak",{elotte:r.animElotte,utana:r.animUtana});
  ok(r.utanaRejtve&&r.naplo===1,"1. a gomb eltűnik, a napló egyszer kimondja",{rejtve:r.utanaRejtve,naplo:r.naplo});
  ok(r.lm&&typeof r.lm.gf==="number"&&typeof r.lm.ga==="number","2. a lefújás könyvelése rendben (S.lastMatch)",r.lm);
  ok(!r.duelErr&&r.duel&&r.duel.latszik===false&&r.duel.can===false&&r.duel.vegere===false,"3. párharcban nincs gomb, a fogantyú elutasítja",r.duel||r.duelErr);
  ok(!errs.length,"4. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
