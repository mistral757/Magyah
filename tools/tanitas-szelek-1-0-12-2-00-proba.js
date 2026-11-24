/* 🧭💡 1.0.12.2.00 — A TANÍTÁS SZÉLEI: TAKARÁS, SZAKASZVÉG, „HOL?", AJÁNLÁS, FELFEDEZÉS
   BEJELENTETT HIBÁK ÉS KÉRÉSEK (képekkel):
     · „az edzésterv tanító üzenet miatt nem lehet lezárni az edzés kiválasztása műveletet";
     · „amikor teljesült a 3. meccs után minden […] nem szólt a játék […] oda kellett volna vigyen
       azonnal" és „Nem kapunk nagy kiáltó értesítést […] Vagy késéssel kapjuk meg.";
     · „el kellett volna mondani, hogy a mostani taktikámhoz mit érdemes fejleszteni […] hogyan
       javítja majd a taktika illeszkedést […] Ugyanez majd az összjátéknál is";
     · „a hol? Nem jó helyre visz. A menüt nyitja meg. Pedig egy játékoshoz kéne odavigyen";
     · „hiába állítottam a csúszkákon, nem pipálódott ki";
     · „mi ez a scout által talált játékos dolog […] arccal, ratinggel […] felugró ablakban".
   Amit mér:
     1. a taktika-csúszka (első idény) kipipálja a „hangsúly-csúszka" feladatot;
     2. az edzésterv-ajánlás a taktika fókusz-tengelyét edzi, betölthető, és az illeszkedés nő;
        az összhang-ajánlás betölthető;
     3. a „meccsek" lecke végigjárható a villogó elemekre koppintva (ajánlás → rögzítés), a
        terv rögzül, és a „Rögzítsd" lépésnél a lap NEM takarja a gombot;
     4. a szakasz a meccsképernyőn azonnal nagy ablakkal szól, a kezdőrúgás előtte megáll, és
        az „Irány a HUB" a HUB-on a leckét indítja;
     5. „Hol?" a fejlődési görbénél: játékos → adatlap → lenyitás, és a feladat kipipálódik;
        a csúszkánál: menü → menüpont → csúszka, és kipipálódik;
     6. a felfedezés ablakként jön (fix pozíció), arccal és Ratinggel, és az első alkalommal lecke;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9431;
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
  const sz=await p.evaluate(()=>{const i=id=>KUT_SZAKASZ.findIndex(x=>x.id===id);return {meccsek:i("meccsek"),fejlodes:i("fejlodes"),lelek:i("lelek")};});
  const tiszta=async()=>{await p.evaluate(()=>{try{kutLeckeZar();}catch(e){}try{_guideQ.length=0;guideShowNext();}catch(e){}
    try{if(_tSteps){_tSteps=null;teachStepsHide();}}catch(e){}
    document.querySelectorAll('#kutKeszModal,#hubTacticConfirmModal,#scUnlock,#scSkill').forEach(e=>e.classList.add("hide"));
    ["scWindow","twPanel"].forEach(x=>{const e=document.getElementById(x);if(e)e.classList.add("hide");});
    $("scHub").classList.remove("hide");try{hubMenuExit();}catch(e){}renderHub();});await p.waitForTimeout(500);
    await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});await p.waitForTimeout(200);};
  await p.evaluate(()=>{S.tactics=S.tactics||{};if(!S.tactics.active)S.tactics.active=Object.keys(TACTICS)[0];
    S.tactics.levels=S.tactics.levels||{};S.tactics.levels[S.tactics.active]=95;});
  await tiszta();
  /* 1. taktika-csúszka */
  const r1=await p.evaluate((sz)=>{S.kut.sz=sz.lelek;S.kut.uj=[];S.kut.kesz={};Object.keys(KUT_FUNKCIO).forEach(f=>S.kut.nyit[f]=1);
    const dk=TACTIC_DIALS[0].k;const ok=tdSet(dk,2);tdSet(dk,0);return {ok,pipa:!!S.kut.kesz["lelek:csuszka"]};},sz);
  ok(r1.ok&&r1.pipa,"1. a taktika-csúszka is kipipálja a hangsúly-csúszka feladatot",r1);
  /* 2. ajánlások */
  const r2=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    S.trainingChangeUsed=false;S.bondTrainChangeUsed=false;
    openTrainingPlanner();await w(300);
    const R=edzesAjanlas(),o={doboz:!!$("trAjanlBox"),btn:!!$("trAjanlBtn"),fo:R&&R.D.main.stat,fokusz:R&&R.parts[0].key,most:R&&R.B&&R.B.most,utana:R&&R.B&&R.B.utana,
      szoveg:($("trAjanlBox")||{}).textContent||""};
    $("trAjanlBtn").click();await w(200);
    o.betolt=trainDraft.main.stat===o.fo&&trainDraft.main.groups.length>0;o.tervFit=!!$("trTervFit");
    closeTrainingPlanner();await w(200);
    openBondTrainPlanner();await w(300);
    o.bdoboz=!!$("btAjanlBox");const B=osszhangAjanlas();
    if($("btAjanlBtn"))$("btAjanlBtn").click();await w(200);
    o.bbetolt=!!(B&&bondTrainDraft&&bondTrainDraft.main===B.main.k);o.bszoveg=(($("btAjanlBox")||{}).textContent||"").slice(0,160);
    closeBondTrainPlanner();await w(200);o.ill=/illeszkedés/.test(o.szoveg);o.szoveg=o.szoveg.slice(0,200);return o;});
  ok(r2.doboz&&r2.btn&&r2.fo===r2.fokusz&&r2.betolt&&r2.tervFit&&r2.utana>=r2.most&&r2.ill&&r2.bdoboz&&r2.bbetolt,
    "2. az edzés-ajánlás a taktika fókuszát edzi, betölthető, az illeszkedés nő; az összhang-ajánlás betölthető",r2);
  /* 3. a meccsek-lecke végigjárva */
  await tiszta();
  await p.evaluate(()=>{S.trainingChangeUsed=false;S.bondTrainChangeUsed=false;S.training=null;S.bondTrain=null;kutLeckeIndit("meccsek");});
  const nyom=[];let takar=null,elakadt=0,elozo="",ism=0;
  for(let k=0;k<90;k++){
    await p.waitForTimeout(420);
    const a=await p.evaluate(()=>{if(!_kutL)return {vege:1};const st=KUT_LECKE[_kutL.id].l[_kutL.i];const v=document.querySelector(".kutCelVillog");const box=$("kutLecke");
      let fed=null;if(v&&box&&st.t==="katt"){const r=v.getBoundingClientRect(),l=box.querySelector(".kutLLap").getBoundingClientRect();
        fed=Math.max(0,Math.min(r.bottom,l.bottom)-Math.max(r.top,l.top))>2&&Math.max(0,Math.min(r.right,l.right)-Math.max(r.left,l.left))>2;}
      return {i:_kutL.i,t:st.t,pill:box.classList.contains("var"),v:!!v,fed,c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent||""};});
    if(a.vege)break;
    const sor=a.i+":"+a.c;if(sor===elozo)ism++;else{ism=0;nyom.push(a.c.trim());}elozo=sor;
    if(/Rögzítsd/.test(a.c)&&a.v&&takar===null)takar=a.fed;
    if(ism>=6){elakadt++;await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();else kutLeckeTovabb();});ism=0;continue;}
    if(a.t==="katt"&&a.v&&!a.pill)await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});v.click();});
    else if(!a.pill)await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
  const r3=await p.evaluate(()=>({tr:!!(S.training&&S.training.main&&S.training.main.stat),bt:!!(S.bondTrain&&S.bondTrain.main)}));
  ok(r3.tr&&r3.bt&&!elakadt&&takar===false&&nyom.some(x=>/Mit érdemes/.test(x))&&nyom.some(x=>/Hol építsünk/.test(x)),
    "3. a meccsek-lecke végigjárható (ajánlás → betöltés → rögzítés), és a lap nem takarja a Rögzítés gombot",{r3,elakadt,takar,nyom});
  /* 4. a szakasz vége a meccsképernyőn */
  await tiszta();
  const r4=await p.evaluate(async(sz)=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    S.kut.sz=sz.meccsek;S.kut.uj=[];S.kut.kesz={"meccsek:gol":1,"meccsek:tempo":1};S.kut.md={meccsek:2};
    S.kut.nyit.edzes=0;S.kut.nyit.osszhang=0;S.kut.lecke=Object.assign(S.kut.lecke||{},{meccsek:0});
    hubMidSeasonReturn();await w(500);
    const o={sim:!$("scSim").classList.contains("hide")};
    kutMeccsUtan(1,0);o.fugg=kutNyitasFugg();
    const pl=S.playing;kickoffTap();await w(300);
    const m=$("kutKeszModal");o.ablak=!!(m&&!m.classList.contains("hide"));o.cim=m&&m.querySelector(".kkCim").textContent;o.nemindult=S.playing===pl;
    const st=m&&getComputedStyle(m);o.fix=st&&st.position==="fixed";
    m.querySelector('[data-kk="i"]').click();await w(1800);
    o.hub=!$("scHub").classList.contains("hide");o.lecke=_kutL&&_kutL.id;return o;},sz);
  ok(r4.sim&&r4.fugg&&r4.ablak&&/Szakasz/.test(r4.cim||"")&&r4.nemindult&&r4.fix&&r4.hub&&r4.lecke==="meccsek",
    "4. a szakasz vége a meccsképernyőn nagy ablakkal szól, a kezdőrúgás megáll, az „Irány a HUB” a leckét indítja",r4);
  /* 5. „Hol?" */
  await tiszta();
  const hol=async(szid,fid,max)=>{
    await p.evaluate(([a,c,s])=>{S.kut.sz=s;S.kut.uj=[];S.kut.kesz={};renderHub();
      const g=document.querySelector(`#hubKutKartya [data-kuthol="${a}:${c}"]`);if(g)g.click();else kutHolIndit(a,c);},[szid,fid,sz[szid]]);
    const ny=[];let el=0,pz="",is=0;
    for(let k=0;k<(max||40);k++){await p.waitForTimeout(450);
      const a=await p.evaluate(()=>{if(!_kutL)return {vege:1};const st=KUT_LECKE[_kutL.id].l[_kutL.i];const v=document.querySelector(".kutCelVillog");
        return {i:_kutL.i,t:st.t,v:v?(v.id||v.tagName):null,pill:$("kutLecke").classList.contains("var"),c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent||""};});
      if(a.vege)break;const sr=a.i+":"+a.c;if(sr===pz)is++;else{is=0;ny.push(a.c.trim()+(a.v?"→"+a.v:""));}pz=sr;
      if(is>=6){el++;await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();else kutLeckeTovabb();});is=0;continue;}
      if(a.t==="katt"&&a.v&&!a.pill)await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});
        if(v.tagName==="INPUT"&&v.type==="range"){v.value="2";v.dispatchEvent(new Event("input",{bubbles:true}));v.dispatchEvent(new Event("change",{bubbles:true}));}else v.click();});
      else if(!a.pill)await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
    const pipa=await p.evaluate(([a,c])=>!!S.kut.kesz[a+":"+c],[szid,fid]);
    try{await p.evaluate(()=>{if(typeof plSheetClose==="function")plSheetClose();});}catch(e){}
    return {ny,el,pipa};};
  const h1=await hol("fejlodes","gorbe");
  await tiszta();
  const h2=await hol("lelek","csuszka");
  ok(h1.pipa&&!h1.el&&h1.ny.some(x=>/játékost/.test(x))&&h1.ny.some(x=>/görbét|Mit mutat/.test(x))&&h1.ny.some(x=>/Megvan/.test(x))&&h2.pipa&&!h2.el&&h2.ny.some(x=>/menü/.test(x))&&h2.ny.some(x=>/Húzd/.test(x)),
    "5. „Hol?”: görbe (játékos → adatlap → lenyitás) és csúszka (menü → menüpont → csúszka), mindkettő kipipálva",{h1,h2});
  const h3=await p.evaluate(()=>{const rossz=[];KUT_SZAKASZ.forEach(sz=>sz.fel.forEach(f=>{if(!f.a)return;
    const L=kutHolLecke(sz,f);if(!L||!L.l||L.l.length<2)rossz.push(sz.id+":"+f.id);}));return rossz;});
  ok(!h3.length,"5b. minden feladatnak van legalább kétlépéses „Hol?” leckéje",h3);
  /* 6. a felfedezés */
  await tiszta();
  const r6=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    S.kut.lecke=Object.assign(S.kut.lecke||{},{jut_felfedez:0});delete S.kut.lecke.jut_felfedez;
    const e=Object.values(careerPool).find(x=>x&&x.n&&!slots.some(s=>s.player&&s.player.n===x.n));
    const np=careerPlayerFromPoolEntry(e);let vissza=0;
    showCareerUnlockReveal(np,"doublesave",()=>{vissza++;},true);await w(1200);
    const u=$("scUnlock"),o={fix:getComputedStyle(u).position==="fixed",arc:!!u.querySelector(".felfArc svg"),rating:/Rating/.test(u.textContent),lecke:_kutL&&_kutL.id};
    for(let k=0;k<8&&_kutL;k++){const st=KUT_LECKE[_kutL.id].l[_kutL.i];
      if(st.t==="katt"){const v=document.querySelector(".kutCelVillog");if(v)v.click();}else{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();}
      await w(700);}
    o.vege=!_kutL;o.vissza=vissza;return o;});
  ok(r6.fix&&r6.arc&&r6.rating&&r6.lecke==="jut_felfedez"&&r6.vege&&r6.vissza===1,"6. a felfedezés ablakként jön, arccal és Ratinggel, az első alkalommal leckével",r6);
  ok(!errs.length,"7. nincs oldalhiba",errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
