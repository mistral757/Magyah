/* 🧭 1.0.12.2.01 — AZ ELSŐ ÁTIGAZOLÁSI ABLAK VEZETVE
   KIMONDOTT KÉRÉS: „Az első rövid átigazolási ablakban azt is el kellett volna magyarázza a játék,
   hogy milyen fajta átigazolási lehetőségek vannak, mi az átigazolási esemény, mi ez a scout által
   talált ingyen játékos. Mindegyikre ravinni a kurzort stb. És a mi játékoseladásaink ügyében
   szintén oda kellett volna vigyen, hogy lássam, miképpen működik ez az eladás dolog."
   Amit mér:
     1. a 8. forduló utáni ablak megnyitásakor a piac-lecke magától indul (Kezdő úton, először);
     2. a lecke végigjárható a valódi elemekre koppintva, és sorra mutat: az időszak, Vásárlás,
        Klub-szemle, Átigazolási esemény, Felfedezett játékosok, majd egy tartalék adatlapján az
        „Eladás most" és a „Piacra bocsátás" gomb, végül a lezárás — mindegyik célja látható és keretezett;
     3. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9437;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
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
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  await p.evaluate(()=>{S.tactics=S.tactics||{};if(!S.tactics.active)S.tactics.active=Object.keys(TACTICS)[0];});
  await p.evaluate(()=>{S.kut.sz=KUT_SZAKASZ.findIndex(x=>x.id==="lelek");S.kut.kesz={};S.kut.uj=[];Object.keys(KUT_FUNKCIO).forEach(f=>S.kut.nyit[f]=1);S.kut.lecke=S.kut.lecke||{};delete S.kut.lecke.piac;
    try{kutLeckeZar();}catch(e){}try{_guideQ.length=0;guideShowNext();}catch(e){}
    try{scoutClassicDiscover("hattrick");}catch(e){}
    S.idx=8;$("scSim").classList.add("hide");twOpenCheckpointWindow(8,()=>{});});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});
  await p.waitForTimeout(2500);
  const r1=await p.evaluate(()=>({lecke:_kutL&&_kutL.id,ablak:twWindowOpen(),mas:[...document.querySelectorAll('[role="dialog"],[aria-modal="true"],.hubModal,#guideTip,#unlockCard,#unlockWelcome,#evAnim,#edzoElemModal,#glossaryModal,#themeModal,#hubTacticConfirmModal')].filter(e=>!e.closest("#kutLecke")&&!e.classList.contains("hide")&&getComputedStyle(e).display!=="none").map(e=>e.id||e.className)}));
  if(!r1.lecke)await p.evaluate(()=>kutLeckeIndit("piac"));
  ok(r1.lecke==="piac"&&r1.ablak,"1. az ablak megnyitásakor a piac-lecke magától indul",r1);
  const nyom=[],keret={};let elakadt=0,elozo="",ism=0;
  for(let k=0;k<90;k++){
    await p.waitForTimeout(420);
    const a=await p.evaluate(()=>{if(!_kutL)return {vege:1};const st=KUT_LECKE[_kutL.id].l[_kutL.i];const v=document.querySelector(".kutCelVillog");const box=$("kutLecke");
      const el=kutLeckeCel(st),d=$("kutLDim");
      return {i:_kutL.i,t:st.t,pill:box.classList.contains("var"),v:!!v,lat:!!(el&&kutLeckeLathato(el)),dim:!!(d&&!d.classList.contains("hide")),
        nincs:!!document.querySelector("#kutLecke .kutLNincs"),c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent||""};});
    if(a.vege)break;
    const sor=a.i+":"+a.c;if(sor===elozo)ism++;else{ism=0;nyom.push(a.c.trim());}elozo=sor;
    if(a.t!=="osszeg")keret[a.c.trim()]=a.lat&&a.dim&&!a.nincs;
    if(ism>=6){elakadt++;await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();else kutLeckeTovabb();});ism=0;continue;}
    if(a.t==="katt"&&a.v&&!a.pill)await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});v.click();});
    else if(!a.pill)await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
  const kell=["Az átigazolási időszak","Vásárlás","Klub-szemle","Átigazolási esemény","Felfedezett játékosok","És az eladás?","Eladás most","Piacra bocsátás","Lezárás"];
  const hiany=kell.filter(c=>!nyom.some(x=>x.indexOf(c)>=0));
  const rossz=Object.entries(keret).filter(([c,v])=>!v&&kell.some(k=>c.indexOf(k)>=0)).map(([c])=>c);
  ok(!elakadt&&!hiany.length&&!rossz.length,"2. a lecke sorra mutat minden lehetőségre és az eladás két útjára, látható, keretezett célokkal",{elakadt,hiany,rossz,nyom});
  ok(!errs.length,"3. nincs oldalhiba",errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
