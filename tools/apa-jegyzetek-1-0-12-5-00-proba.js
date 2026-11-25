/* 🐞 1.0.12.5.00 — APA KILENC JEGYZETE (a felhasználó döntésével)
   Amit mér:
     1. nehéz fokozaton (5+) a Boost-központ az „Első meccsek" után nyílik, könnyebben nem;
     2. a „Klub filozófiája" szakasz nyárig vár (kártya, jelek), a lezárt idény után indul;
     3. a kapitányválasztó nyitva marad, régi ↔ új összevetés, „Mégis a régi", „Kész";
     4. a Kezdő úton nincs „Elérhető áron: saját felállás" értesítés;
     5. a taktika-panelben nincs út a hangsúly-csúszkákhoz;
     6. a kihívások az elejétől nyitva (Menedzsment), az első ajánlatnál vezetett lecke;
     7. a „Hol?" a megbízásnál középpályást villogtat, az adatlapján a Megbízás gombot;
     9. a „Mielőtt pályára lépnél" tipp a piramisban a választott fokozatról beszél;
     + nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9463;
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
  const w=ms=>p.waitForTimeout(ms);
  const r=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    try{kutLeckeZar();}catch(e){}
    o.kut=!!(S.kut&&kutAktiv());
    /* 9 */
    o.tipp=GUIDE_TIPS["hub:preseason"].x;
    /* 6 — menedzsment nyitva */
    kutErtekel();o.mgmtNyitva=kutNyitva("menedzsment");
    /* 1 — boost */
    const szMeccs=KUT_SZAKASZ.findIndex(x=>x.id==="meccsek");
    const pr=(nf)=>{S.pyr.fok=Object.assign({},S.pyr.fok||{},{nf});S.pyr.nf=nf;S.kut.sz=szMeccs;delete S.kut.nyit.boost;
      KUT_SZAKASZ[szMeccs].fel.forEach(f=>S.kut.kesz["meccsek:"+f.id]=1);kutErtekel();return !!S.kut.nyit.boost;};
    o.boost8=pr(8);o.boost4=pr(4);
    /* 2 — nyár */
    const szF=KUT_SZAKASZ.findIndex(x=>x.id==="filozofia");S.kut.sz=szF;S.seasonClosed=false;
    kutErtekel();o.nyarVar=kutNyarVar(KUT_SZAKASZ[szF]);o.szMarad=S.kut.sz===szF;
    kutKartyaRajz();o.kartya=(kutKartyaEl()||{}).textContent||"";
    kutJel("view:styletrait");o.nemPipal=!S.kut.kesz["filozofia:fa"];
    S.seasonClosed=true;o.nyarUtan=!kutNyarVar(KUT_SZAKASZ[szF]);kutKartyaRajz();o.kartya2=(kutKartyaEl()||{}).textContent||"";
    S.seasonClosed=false;S.kut.sz=0;
    /* 4 */
    const _b=S.transferBudget;S.transferBudget=1e12;const U=UJ_FIGY.find(x=>x.k==="felallas");
    o.felallas=U?U.ids():"nincs-UJ";S.transferBudget=_b;
    /* 5 */
    try{renderHubTacticsPanel();}catch(e){o.taktErr=String(e);}o.dialBtn=!!document.getElementById("hubDialOpenBtn");
    /* 3 */
    $("hubCaptainBtn").onclick();await w(100);
    const regi=captainIdx;const btn=[...document.querySelectorAll("#hubCaptainBody .btn-s")].find(b=>!b.disabled);
    btn.click();await w(150);
    o.capNyitva=!$("hubCaptainPicker").classList.contains("hide");o.capUj=captainIdx!==regi;
    o.cap=($("hubCapOsszevet")||{}).textContent||"";o.capGomb=$("hubCaptainCancel").textContent;
    $("hubCapVissza").click();await w(100);o.capVissza=captainIdx===regi;
    $("hubCaptainCancel").click();await w(100);o.capZar=$("hubCaptainPicker").classList.contains("hide");
    return o;});
  console.log(JSON.stringify(r).slice(0,400));
  ok(r.kut,"a Kezdő út fut");
  ok(/karrier indításakor/.test(r.tipp)&&!/AUTO SZINTKÖVET/.test(r.tipp),"9: a tipp a választott fokozatról szól",r.tipp.slice(0,90));
  ok(r.mgmtNyitva,"6: a Menedzsment az elejétől nyitva");
  ok(r.boost8&&!r.boost4,"1: 8-as fokozaton a Boost az első meccsek után nyílik, 4-esen nem",{b8:r.boost8,b4:r.boost4});
  ok(r.nyarVar&&r.szMarad&&/nyáron/.test(r.kartya)&&r.nemPipal,"2: a filozófia-szakasz nyárig vár (kártya, jelek)",r.kartya.slice(0,160));
  ok(r.nyarUtan&&/Válaszd ki a klub filozófiáját/.test(r.kartya2),"2: a lezárt idény után indul");
  ok(Array.isArray(r.felallas)&&r.felallas.length===0,"4: nincs „saját felállás” értesítés a Kezdő úton",r.felallas);
  ok(!r.dialBtn&&!r.taktErr,"5: a taktika-panelben nincs csúszka-út",r.taktErr);
  ok(r.capNyitva&&r.capUj&&/régi és új/.test(r.cap)&&/Kész/.test(r.capGomb),"3: a kapitányválasztó nyitva marad, összevetéssel",r.cap.slice(0,160));
  ok(r.capVissza&&r.capZar,"3: „Mégis a régi” és „Kész” működik");
  /* 7 — Hol? megbízás */
  const h=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    S.kut.sz=0;kutHolIndit("elso11","megb");await w(500);
    o.id=_kutL&&_kutL.id;o.i0=_kutL&&_kutL.i;
    const cel=kutMegbSor();o.celKey=cel&&cel.getAttribute("data-hubkey");
    const mm=/^slot:(\d+)$/.exec(o.celKey||"");o.kozep=!!(mm&&isMidRoleSlot(form,+mm[1]));
    o.villog=!!(cel&&(cel.classList.contains("kutCelpont")||cel.className.match(/kut/)));
    cel&&cel.click();await w(900);
    o.lap=plSheetOpen();o.i1=_kutL&&_kutL.i;o.gomb=!!document.querySelector('#plSheetBody [data-kut="megbizas"]');
    try{document.querySelector('#plSheetBody [data-kut="megbizas"]').click();}catch(e){}await w(700);
    o.picker=!$("hubMidRolePicker").classList.contains("hide");o.i2=_kutL&&_kutL.i;
    try{$("hubMidRoleCancel").click();}catch(e){}await w(500);o.i3=_kutL&&_kutL.i;o.pipa=!!S.kut.kesz["elso11:megb"];
    try{kutLeckeZar();}catch(e){}
    return o;});
  ok(h.id==="hol_megb"&&h.kozep,"7: a „Hol?” egy középpályás sorát célozza",h);
  ok(h.lap&&h.i1===1&&h.gomb,"7: az adatlapon a Megbízás gomb a következő lépés",h);
  ok(h.picker&&h.i2===2&&h.pipa,"7: a választó nyílik, a feladat kipipálva",h);
  /* 6 — kihívás-lecke */
  const k=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    if(S.kut.lecke)delete S.kut.lecke.kihivas;
    showChallengeOffers("long",3,()=>{},false,{});await w(1200);
    const o={id:_kutL&&_kutL.id,kartya:document.querySelectorAll("#twBody .chCard").length};
    await w(200);return o;});
  ok(k.id==="kihivas"&&k.kartya>0,"6: az első ajánlatnál a kihívás-lecke indul",k);
  await p.screenshot({path:(process.env.SP||"/tmp")+"/kihivas-lecke.png"});
  ok(errs.length===0,"nincs oldalhiba",errs);
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
