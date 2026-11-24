/* 🧭 1.0.12.2.02 — A „HOL?" MINDEN FELADATNÁL, ÁLLÓ ÉS FEKVŐ NÉZETBEN, RÉGI MENTÉSBŐL IS
   BEJELENTETT HIBA (kép, fekvő nézet): „Próbálja megmutatni nekem a következő feladatot, csak még nem
   nyitotta ki közben a menüben ezt a fület... Újabb bug. Ezeket módszeresen irtsuk ki..."
   Az ok: egy korábban indult karrierben a már teljesített szakasz (újabb) nyitása sosem futott le,
   így a feladat gombja zárva maradt. Amit mér, MINDEN szakasz MINDEN feladatára:
     · régi mentést utánozva (üres nyitás-lista) a kiértékelés pótolja a teljesített szakaszok nyitásait;
     · a feladat gombja nincs zárva;
     · a „Hol?" lecke eljut a feladat céljáig, és az ott LÁTHATÓ (keretezve / villogva) —
       álló (390×844) és fekvő (1330×1030) nézetben is;
     · nincs oldalhiba. */
"use strict";
const FEKVO=process.argv.includes("--fekvo");const VP=FEKVO?{width:1330,height:1030}:{width:390,height:844};const NEV=FEKVO?"fekvő":"álló";

const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9443;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:VP})).newPage();
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
  await p.evaluate(()=>{S.tactics=S.tactics||{};if(!S.tactics.active)S.tactics.active=Object.keys(TACTICS)[0];
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});
  const tiszta=async()=>{await p.evaluate(()=>{try{kutLeckeZar();}catch(e){}try{_guideQ.length=0;guideShowNext();}catch(e){}
    try{if(_tSteps){_tSteps=null;teachStepsHide();}}catch(e){}try{plSheetClose();}catch(e){}
    document.querySelectorAll('#kutKeszModal,#hubTacticConfirmModal,#scUnlock,#scSkill,#cspModal,#edzoElemModal,#talModal,#ladaModal').forEach(e=>e.classList.add("hide"));
    document.querySelectorAll('#scHub [id$="Picker"]').forEach(e=>e.classList.add("hide"));
    ["scWindow","twPanel"].forEach(x=>{const e=document.getElementById(x);if(e)e.classList.add("hide");});
    $("scHub").classList.remove("hide");try{hubMenuExit();}catch(e){}renderHub();});await p.waitForTimeout(350);
    await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});};
  const feladatok=await p.evaluate(()=>{const o=[];KUT_SZAKASZ.forEach((sz,i)=>sz.fel.forEach(f=>{if(f.a&&f.a!=="speedRow")o.push({i,sz:sz.id,f:f.id,a:f.a});}));return o;});
  const rossz=[],zart=[];
  for(const t of feladatok){
    await tiszta();
    const z=await p.evaluate((t)=>{S.kut.sz=t.i;S.kut.nyit={};S.kut.kesz={};S.kut.uj=[];S.kut.mind=0;kutErtekel();S.kut.uj=[];renderHub();
      const e=$(t.a);return !!(e&&e.classList.contains("kutZar"));},t);
    if(z)zart.push(t.sz+"/"+t.f);
    await p.evaluate((t)=>{kutHolIndit(t.sz,t.f);},t);
    let latta=false,ism=0,elozo="";
    for(let k=0;k<30;k++){
      await p.waitForTimeout(380);
      const a=await p.evaluate((t)=>{if(!_kutL)return {vege:1};const st=KUT_LECKE[_kutL.id].l[_kutL.i];const el=kutLeckeCel(st);
        const cel=el&&(el.id===t.a||(t.a==="hubRoster"&&el.closest&&el.closest("#hubRoster")));
        const d=$("kutLDim");
        return {i:_kutL.i,t:st.t,c:kutLeckeSzov(st.c),cel:!!cel,lat:!!(el&&kutLeckeLathato(el)),dim:!!(d&&!d.classList.contains("hide")),
          pill:$("kutLecke").classList.contains("var"),v:!!document.querySelector(".kutCelVillog")};},t);
      if(a.vege)break;
      if(a.cel&&a.lat&&a.dim){latta=true;break;}
      const sor=a.i+":"+a.c;if(sor===elozo)ism++;else ism=0;elozo=sor;
      if(ism>=5)break;
      if(a.t==="katt"&&a.v&&!a.pill)await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});v.click();});
      else if(!a.pill&&a.t!=="katt")await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
    if(!latta)rossz.push(t.sz+"/"+t.f+"("+t.a+")");}
  ok(!zart.length,`1. [${NEV}] régi mentésből is: a feladatok gombja nincs zárva (a teljesített szakaszok nyitásai pótolva)`,zart);
  ok(!rossz.length,`2. [${NEV}] a „Hol?” minden feladatnál eljut a célig, és az ott látható, keretezett (${feladatok.length} feladat)`,rossz);
  ok(!errs.length,`3. [${NEV}] nincs oldalhiba`,errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
