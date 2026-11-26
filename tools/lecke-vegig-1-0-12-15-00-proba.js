/* 🧭 1.0.12.15.00 — MINDEN LECKE VÉGIGKATTINTVA (a „kezdő játékos" robot)
   KIMONDOTT KÉRÉS: „a tanítás cuccokat fontos ellenőrizni neked, hogy tényleg mennek e" + 🐞 jmwy1ceu6abed
   („az átigazolás tanításnál az egyes átigazolási típusokba beléptetett, de nem léptetett ki").
   Egy robot úgy jár végig minden leckét, ahogy egy kezdő:
     · a villogó célra koppint (a „katt" lépéseknél), a „Megcsinálom" lépésnél megcsinálja;
     · ha egy panelre került, a lecke sávján a „↩ Vissza a HUB-ba" gombbal jön vissza;
     · különben a „Tovább →" gombbal lép.
   Lépésenként jegyzi: elakadt-e (10 kör alatt nem mozdult), mutatott-e láthatatlan célt („nincs"),
   és a lecke végén: a HUB-on van-e, maradt-e nyitva panel / ablak / adatlap.
   Amit mér:
     1. minden HUB-on futó lecke (elso11, meccsek, fejlodes, lelek, kockazat, merleg, hosszu, kupa, zaras,
        egyensuly) végigmegy elakadás és láthatatlan cél nélkül, és a HUB-on, nyitott panel nélkül ér véget;
     2. a piac-lecke a valódi átigazolási ablakban végigmegy — és ha a játékos a „Vásárlás" kiemelésénél
        belép a panelre, a lecke visszahozza („↩ Vissza a HUB-ba"), majd a lecke folytatódik;
     3. MINDEN Kezdő út-feladat „Hol?"-ja (a tempó és az öltöző is, a meccsképernyőn át) végigmegy (a nyárra váró
        filozófia-szakaszé csak akkor, ha a stílus már választható);
     4. a kijelölésnél nincs elsötétítés (a takaró sávok átlátszók és átengednek);
     5. a mérföldkövek: a stílus-kategória ingyen nyílik; minden teljesítés felugróval jön, és a három kategória
        (pénzes, stílus-kategóriás, csapatstílus) külön némítható a felugrón és a panelen;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9651;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,1500):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");localStorage.setItem("evaKamOff30_0","1");}catch(e){}});
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
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    /* egy öltözői bejegyzés, hogy legyen mit mutatni; minden funkció nyitva */
    try{S.lockerLog=S.lockerLog||[];}catch(e){}
    Object.keys(KUT_FUNKCIO).forEach(f=>S.kut.nyit[f]=1);});
  const tiszta=async()=>{await p.evaluate(()=>{try{kutLeckeZar();}catch(e){}try{_guideQ.length=0;guideShowNext();}catch(e){}
    try{if(_tSteps){_tSteps=null;teachStepsHide();}}catch(e){}try{plSheetClose();}catch(e){}
    document.querySelectorAll('#kutKeszModal,#hubTacticConfirmModal,#scUnlock,#scSkill,#cspModal,#edzoElemModal,#talModal,#ladaModal,#lockerModal,#chPop,#igazJel').forEach(e=>e.classList.add("hide"));
    document.querySelectorAll('#scHub [id$="Picker"]').forEach(e=>e.classList.add("hide"));
    try{GAME_OVERLAY_IDS.forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});}catch(e){}
    document.querySelectorAll('.hubModal,[aria-modal="true"]').forEach(e=>{if(!e.closest("#kutLecke"))e.classList.add("hide");});
    ["scWindow","twPanel","scPitch"].forEach(x=>{const e=document.getElementById(x);if(e)e.classList.add("hide");});
    $("scHub").classList.remove("hide");try{hubMenuExit();}catch(e){}renderHub();});await p.waitForTimeout(300);
    await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});};
  /* a robot: egy elindított leckét végigjár */
  const vegigjar=async(nev,opt)=>{
    opt=opt||{};
    const jel={nev,lepes:0,elakadt:[],nincs:[],hubra:0,vege:false,maradt:[]};
    let elozo="",ism=0,kor=0;
    for(;kor<260;kor++){
      await p.waitForTimeout(260);
      const a=await p.evaluate(()=>{
        if(!_kutL)return {vege:1};
        const L=KUT_LECKE[_kutL.id],st=L.l[_kutL.i],box=$("kutLecke");
        const v=document.querySelector(".kutCelVillog");
        return {i:_kutL.i,n:L.l.length,t:st.t,c:String(kutLeckeSzov(st.c)).slice(0,50),pill:!!(box&&box.classList.contains("var")),
          hubra:!!document.querySelector('#kutLecke [data-kl="hubra"]'),nincs:!!document.querySelector("#kutLecke .kutLNincs"),
          v:!!(v&&teachShown(v)),csin:!!document.querySelector('#kutLecke [data-kl="csinald"]'),
          tov:!!document.querySelector('#kutLecke [data-kl="tovabb"]'),kesz:!!_kutL.kesz,var:!!_kutL.var};});
      if(a.vege){jel.vege=true;break;}
      /* a megerősítő és a felugró ablakok: ahogy egy játékos tenné — igen / tovább */
      const ab=await p.evaluate(()=>{const lat=id=>{const e=$(id);return e&&!e.classList.contains("hide")&&getComputedStyle(e).display!=="none";};
        if(lat("hubTacticConfirmModal")){$("hubTacticConfirmYes").click();return "megerősítés";}
        if(lat("chPop")&&document.getElementById("chPop").classList.contains("on")){const b=$("chPopBtn");if(b)b.click();return "felugró";}
        if(lat("kutKeszModal")){const b=document.querySelector('#kutKeszModal [data-kk="n"]')||document.querySelector('#kutKeszModal [data-kk="i"]');if(b)b.click();return "szakasz";}
        return "";});
      if(ab){jel.ablak=(jel.ablak||0)+1;continue;}
      const kulcs=a.i+":"+a.c+":"+a.pill;
      if(kulcs===elozo)ism++;else{ism=0;jel.lepes++;}
      elozo=kulcs;
      if(a.nincs&&!jel.nincs.includes(a.i+" "+a.c))jel.nincs.push(a.i+" "+a.c);
      if(ism>=10){jel.elakadt.push(a.i+" "+a.c+(a.pill?" (sáv)":""));
        await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();else kutLeckeTovabb();});ism=0;continue;}
      if(opt.belep&&opt.belep(a)){await p.evaluate(sel=>{const e=document.querySelector(sel);if(e)e.click();},opt.belepSel);opt.belep=null;jel.belepett=a.c;continue;}
      if(a.hubra){jel.hubra++;await p.evaluate(()=>document.querySelector('#kutLecke [data-kl="hubra"]').click());continue;}
      if(a.pill)continue;   /* a lecke máshol fut (panel, adatlap) — megvárjuk */
      if(a.t==="katt"&&a.v){await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});
        const rg=v.tagName==="INPUT"&&v.type==="range"?v:v.querySelector&&v.querySelector('input[type=range]');
        if(rg){const v2=rg;v2.value=String(Math.min(+v2.max||100,(+v2.value||0)+(+v2.step||1)*5));v2.dispatchEvent(new Event("input",{bubbles:true}));v2.dispatchEvent(new Event("change",{bubbles:true}));}
        else if(v.tagName==="INPUT"&&v.type==="range"){v.value=String(Math.min(+v.max||100,(+v.value||0)+10));v.dispatchEvent(new Event("input",{bubbles:true}));v.dispatchEvent(new Event("change",{bubbles:true}));}
        else v.click();});continue;}
      if(a.csin){await p.evaluate(()=>document.querySelector('#kutLecke [data-kl="csinald"]').click());await p.waitForTimeout(200);
        await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");if(v)v.click();});continue;}
      if(a.tov&&(a.t!=="katt"))await p.evaluate(()=>document.querySelector('#kutLecke [data-kl="tovabb"]').click());}
    if(!jel.vege)jel.elakadt.push("nem ért véget");
    await p.waitForTimeout(400);
    jel.maradt=await p.evaluate(()=>{const m=[];
      if($("scHub").classList.contains("hide"))m.push("nem a HUB-on");
      if(!$("scWindow").classList.contains("hide"))m.push("panel nyitva: "+(($("twTitle")||{}).textContent||""));
      ["cspModal","edzoElemModal","talModal","ladaModal","lockerModal"].forEach(id=>{const e=$(id);if(e&&!e.classList.contains("hide"))m.push("ablak: "+id);});
      try{if(plSheetOpen())m.push("adatlap nyitva");}catch(e){}
      return m;});
    if(opt.palyan)jel.maradt=jel.maradt.filter(x=>x!=="nem a HUB-on");
    return jel;};
  const rossz=j=>j.elakadt.length||j.nincs.length||j.maradt.length;

  /* 1. a HUB-os leckék */
  const HUBOS=["elso11","meccsek","fejlodes","lelek","kockazat","merleg","hosszu","kupa","zaras","egyensuly"];
  const eredm=[];
  for(const id of HUBOS){
    await tiszta();
    await p.evaluate(id=>{const i=KUT_SZAKASZ.findIndex(x=>x.id===id);if(i>=0)S.kut.sz=Math.max(S.kut.sz||0,i);kutLeckeIndit(id);},id);
    eredm.push(await vegigjar(id));}
  const rosszak=eredm.filter(rossz);
  console.log("    leckék:",eredm.map(j=>`${j.nev}:${j.lepes}${j.hubra?"↩"+j.hubra:""}`).join(" "));
  ok(!rosszak.length,"1. a HUB-os leckék elakadás és láthatatlan cél nélkül végigmennek, és nyitott panel nélkül érnek véget",rosszak);

  /* 2. a piac-lecke a valódi ablakban — a játékos belép a Vásárlásba */
  await tiszta();
  await p.evaluate(()=>{S.kut.lecke=S.kut.lecke||{};delete S.kut.lecke.piac;try{scoutClassicDiscover("hattrick");}catch(e){}
    S.idx=8;$("scSim").classList.add("hide");twOpenCheckpointWindow(8,()=>{});});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();});
  await p.waitForTimeout(2000);
  await p.evaluate(()=>{if(!_kutL||_kutL.id!=="piac")kutLeckeIndit("piac");});
  const piac=await vegigjar("piac",{belep:a=>/Vásárlás/.test(a.c)&&!a.pill,belepSel:"#hubBuyBtn"});
  ok(piac.belepett&&piac.hubra>=1&&!rossz(piac),"2. a piac-lecke: a Vásárlásba belépve a lecke visszahoz (↩), és végigmegy",piac);
  await p.evaluate(()=>{try{twCloseWindow&&twCloseWindow();}catch(e){}});

  /* 3. minden feladat „Hol?"-ja — a tempó és az öltöző a meccsképernyőn át */
  const feladatok=await p.evaluate(()=>{const o=[];KUT_SZAKASZ.forEach((sz,i)=>sz.fel.forEach(f=>{if(f.a&&!(sz.nyar&&!(styleCanChoose()||styleState())))o.push({i,sz:sz.id,f:f.id,a:f.a});}));return o;});
  const holRossz=[];
  for(const t of feladatok){
    await tiszta();
    await p.evaluate(t=>{S.kut.sz=t.i;S.kut.kesz={};S.kut.uj=[];S.kut.mind=0;Object.keys(KUT_FUNKCIO).forEach(f=>S.kut.nyit[f]=1);renderHub();kutHolIndit(t.sz,t.f);},t);
    const j=await vegigjar("hol:"+t.sz+"/"+t.f,{palyan:t.a==="speedRow"||t.a==="lockerBtn"});
    j.maradt=[];   /* a „Hol?" a feladat HELYÉRE visz — ott maradni a dolga */
    if(rossz(j))holRossz.push(j);}
  ok(!holRossz.length,`3. minden „Hol?" végigmegy (${feladatok.length} feladat, a tempó és az öltöző is)`,holRossz);

  /* 4. nincs elsötétítés */
  await tiszta();
  const r4=await p.evaluate(()=>{kutLeckeIndit("elso11");return new Promise(r=>setTimeout(()=>{const d=$("kutLDim");const i=d&&d.querySelector("i");
    const cs=i?getComputedStyle(i):null;r({bg:cs&&cs.backgroundColor,pe:cs&&cs.pointerEvents});kutLeckeZar();},900));});
  ok(r4.bg&&/rgba\(0, 0, 0, 0\)|transparent/.test(r4.bg)&&r4.pe==="none","4. a kijelölés nem sötétít, és átengedi a koppintást",r4);

  /* 6. a mérföldkövek: ingyenes kategória-nyitás, felugró, kategóriánkénti némítás (🐞 jmwxyxn6h94ry) */
  await tiszta();
  const r6=await p.evaluate(async()=>{
    const o={};
    try{localStorage.removeItem(MS_ERT_KEY);}catch(e){}
    const urit=async()=>{_chPopQ.length=0;try{chPopClose();}catch(e){}await new Promise(x=>setTimeout(x,450));_chPopQ.length=0;};
    await urit();
    const c=MS_STYLE_CATS.find(x=>!msCatUnlocked(x.key));
    const b0=S.transferBudget||0;
    const r=msAutoOpenCat(c.key);
    o.nyit={ok:!!r,dij:r&&r.paid,penz:(S.transferBudget||0)-b0};
    await new Promise(x=>setTimeout(x,500));
    const pop=document.getElementById("chPop");
    o.pop1=pop&&pop.classList.contains("on")?pop.querySelector("#chPopRew").textContent:"";
    await urit();
    const d=MILESTONES.find(x=>x.kind==="cash");
    msPayout(d);
    await new Promise(x=>setTimeout(x,500));
    o.pop2=pop.classList.contains("on")?{kick:pop.querySelector("#chPopKick").textContent,mute:!pop.querySelector("#chPopMute").classList.contains("hide")}:null;
    pop.querySelector("#chPopMute").click();
    o.ki=!msErtesitBe("cash")&&msErtesitBe("cat")&&msErtesitBe("style");
    await urit();
    msPayout(d);await new Promise(x=>setTimeout(x,500));
    o.pop3=pop.classList.contains("on")||_chPopQ.some(q=>q.kapcsolo==="cash");
    renderMilestones();const k=document.querySelectorAll('#hubMilestonesPanel [data-msert]');o.kapcsolok=k.length;
    const kc=[...k].find(x=>x.dataset.msert==="cash");if(kc){kc.checked=true;kc.dispatchEvent(new Event("change"));}
    o.vissza=msErtesitBe("cash");
    return o;});
  ok(r6.nyit.ok&&r6.nyit.dij===0&&r6.nyit.penz===0&&/ingyenes/.test(r6.pop1),"6a. a stílus-kategória ingyen nyílik, a felugró ezt mondja",r6);
  ok(r6.pop2&&r6.pop2.mute&&/Mérföldkő/.test(r6.pop2.kick)&&r6.ki&&r6.pop3===false,"6b. minden mérföldkő felugróval jön; a „🔕 Ilyet ne mutass” csak a saját kategóriáját némítja",r6);
  ok(r6.kapcsolok===3&&r6.vissza,"6c. a Mérföldkövek panelen a három kategória külön kapcsolható",r6);
  ok(!errs.length,"7. nincs oldalhiba",errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
