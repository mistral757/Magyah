/* 📉 KEZDŐ ÚT — AZ ESZKÖZÖK HATÁSA AZ ELSŐ IDÉNYBEN (mérés a valódi motoron)
   Egy valódi karriert indít a megadott nehézségen (NF=5,1 …), és gépi módban végigjátssza az 1. idényt két
   menetrend szerint:
     A — „minden eszköz": az edzésterv és az összhangépítés ajánlása az 1. fordulótól él;
     B — „Kezdő út": ugyanez a Kezdő út nyitásainak fordulójában (TR=edzés/összhang, alapból 6.);
     K — mint a B, de a Kezdő út ÉL (S.kut), a szakaszai a jellemző fordulókban zárulnak (1–5: 1–2. szakasz,
         6–12: 3., 13–19: 4., 20–25: 5., 26–30: 6.) — ez méri az 1.0.12.17.00-s visszafogást.
   MODOK=A,B (alap) vagy pl. MODOK=B,K.
   Fordulónként rögzíti: a saját ⚡ (teamMatchStrength), a mezőny ⚡ (oppMatchStrength) és a mezőny idény
   közbeni növekedését (pyrGrowNow). Ismétlés: N (alap 3) — átlagolva.
   HASZNÁLAT: NF=5 S=1 N=3 node tools/kut-visszafogas/meres.js  → JSON a stdout-ra */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||path.join(__dirname,"..",".."),PORT=+(process.env.PORT||9690);
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const NF=+(process.env.NF||5),SS=+(process.env.S||1),N=+(process.env.N||3),TR=+(process.env.TR||6),DIV=+(process.env.DIV||3);
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
async function egyIdeny(b,mod){
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("evaKamOff30_0","1");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(600);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(1500);
  await p.evaluate(([NF,SS,DIV])=>{
    beginNewGame();
    try{nfCsomagAlkalmaz(NF,SS);}catch(e){}
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=DIV;pyrPendingSpeed=pyrWantedSpeed;
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
    openHubMidSeason();window.saveGame=()=>{};S.guideOn=false;if(S.kut)S.kut.mind=1;},[NF,SS,DIV]);
  await p.waitForTimeout(1200);
  const r=await p.evaluate(async([mod,TR])=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const beallit=()=>{try{const R=edzesAjanlas();if(R)S.training={main:{stat:R.D.main.stat,groups:R.D.main.groups.slice()},sec:{stat:R.D.sec.stat,groups:(R.D.sec.groups||[]).slice()},setSeason:1};}catch(e){}
      try{const R=osszhangAjanlas();if(R)S.bondTrain={main:R.main.k,sec:R.sec?R.sec.k:null};}catch(e){}};
    S.training=null;S.bondTrain=null;
    const kut=mod==="K";const szSzerint=i=>i<=5?1:i<=12?2:i<=19?3:i<=25?4:5;
    if(kut&&S.kut){S.kut.mind=0;S.kut.kesz_ut=0;S.kut.sz=0;}
    if(mod==="A")beallit();
    if(kut&&S.kut)S.kut.sz=szSzerint(1)-1;
    const sor=[];const rog=()=>{try{sor[S.idx]={ms:Math.round(teamMatchStrength()*100)/100,om:Math.round(oppMatchStrength()*100)/100,g:Math.round(pyrGrowNow()*100)/100,
      ml:Math.round((pyrMidLiftNow()||0)*100)/100,fek:Math.round(((typeof kutFekAcc==="function")?kutFekAcc():0)*100)/100,
      pct:(typeof kutFekPct==="function")?kutFekPct():0};}catch(e){}};
    rog();
    const info={fok:S.pyr&&S.pyr.fok&&(S.pyr.fok.nf+"."+S.pyr.fok.s),speed:S.pyr&&S.pyr.aiSpeed,tempo:tempoMult(),grow:pyrGrowStep(),cel:(typeof nfCelFor==="function")?nfCelFor(1):null,div:pyrMyDivId()};
    S.auto=true;S.unavailable={};
    let utolso=S.idx,beallitva=mod==="A";
    try{startRound();}catch(e){}
    for(let i=0;i<60000&&S.idx<30;i++){await varj(10);
      if(S.idx!==utolso){utolso=S.idx;
        if(kut&&S.kut)S.kut.sz=szSzerint(S.idx+1)-(S.idx+1<=3?1:0);
        rog();
        if(!beallitva&&S.idx>=TR){beallit();beallitva=true;}}
      /* átigazolási ablak / megszakítás: a gépi mód továbbviszi; ha megállt, újraindítjuk */
      if(!S.playing&&S.idx<30&&i%200===199){try{["scEuro","scUnlock","scSkill","scWindow"].forEach(id=>{const e=$(id);if(e)e.classList.add("hide");});
        if(typeof twResumeAfterWindow==="function"&&S.twWindow)twResumeAfterWindow();else startRound();}catch(e){}}}
    S.auto=false;
    return {info,sor,idx:S.idx};},[mod,TR]);
  r.errs=errs.slice(0,3);
  await p.context().close();
  return r;}
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const MODOK=(process.env.MODOK||"A,B").split(",");
  const ki={NF,S:SS,TR,DIV};MODOK.forEach(m=>ki[m]=[]);
  for(let k=0;k<N;k++)for(const m of MODOK)ki[m].push(await egyIdeny(b,m));
  console.log(JSON.stringify(ki));
  await b.close();srv.close();process.exit(0);
})();
