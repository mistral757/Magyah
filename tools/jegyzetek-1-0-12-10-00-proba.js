/* 🐞 1.0.12.10.00 — A FEJLESZTŐ 5 JEGYZETE
   Amit mér:
     1. (jmww5wqotet2u) a Run-tempó határa a Run-cél (kezdő −2) legkorábbi idénye, nem a D1-é; a bélyeg a
        Run-cél aranya (R.pyrGoalRound); a bontás sora a Run-célról szól;
     2. (jmww5qrkf8zdv) a telepített változatban az elveszett teljes képernyőt érzékeli, és „⛶ Vissza teljes
        képernyőre” gombot tesz ki; böngészőben nem;
     3. (jmww64v98jvrm) a kupa párosításában és a tabellákban a saját mez az arculat meze;
     4. (jmww60sd257tr) a gól nélküli letámadás a 16-oson kívül; a Sortűz három valódi lövés (két blokk, egy
        kapusvédés) a gól előtt — 2D-ben és 3D-ben;
     5. (jmww62xmvfycx) a rajzolt jelenet feliratai a 3D képre is kikerülnek; az Egyensúly libikókája: a
        befejező felugrik, a palló túlsó vége lecsapódik; „Új” módban is lejátszódik;
     + nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9499;
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
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{kutLeckeZar();}catch(e){}
    document.querySelectorAll("[role=dialog],.hubModal,#guideTip").forEach(e=>e.classList.add("hide"));});
  /* 1 */
  const r1=await p.evaluate(()=>{const o={};S.pyr.startDiv=5;o.cel=pyrRunGoalDivId();o.ref=pyrTitleRefRound();
    S.pyr.startDiv=6;o.ref6=pyrTitleRefRound();S.pyr.startDiv=5;
    const R=runInit();delete R.pyrGoalRound;delete R.pyrGoalSeason;delete R.pyrGoalLoss;delete R.pyrGoalLate;
    S.seasonNumber=4;S.idx=5;pyrTitlePaceTick();o.veszt=R.pyrGoalLoss>0;o.kesesM=R.pyrGoalLate;
    const sor=pyrTitlePaceRow(50,10);o.sorN=sor.n;o.sorD=sor.d;
    const _m=pyrMyDivId;window.pyrMyDivId=()=>3;window.pyrRunGoalDivId=window.pyrRunGoalDivId;
    const _ab=runBoardOnPyrTitle;window.runBoardOnPyrTitle=()=>null;
    o.bel=runNotePyrGoal();o.belyeg=R.pyrGoalRound;window.pyrMyDivId=_m;window.runBoardOnPyrTitle=_ab;
    o.titleUntouched=R.pyrTitleRound==null;
    S.seasonNumber=1;S.idx=5;return o;});
  ok(r1.cel===3&&r1.ref===90&&r1.ref6===90,"1. a határ a Run-cél (kezdő −2) legkorábbi idénye: a 3. idény vége (90. forduló), D5-ből és D6-ból is",r1);
  ok(r1.veszt&&r1.kesesM===5&&/Run-cél/.test(r1.sorN),"1. a határ után a késés a Run-célhoz mér (a 4. idény 5. fordulójában 5 forduló), a sor neve „A Run-cél aranyának üteme”",r1);
  ok(r1.bel&&r1.belyeg===95&&r1.titleUntouched,"1. a Run-cél arany a tempó bélyege; az élvonalbeli bélyeg érintetlen",r1);
  /* 2 */
  const r2=await p.evaluate(()=>{const o={};o.bongeszo=fsElveszett();
    const _p=pwaInstalled;window.pwaInstalled=()=>true;
    Object.defineProperty(window,"innerHeight",{configurable:true,get:()=>700});
    o.pwa=fsElveszett();fsVisszaNez();const g=$("fsVisszaBtn");o.gomb=!!(g&&!g.classList.contains("hide"));o.szoveg=g&&g.textContent;
    window.pwaInstalled=_p;delete window.innerHeight;fsVisszaNez();o.eltunt=!g||g.classList.contains("hide");return o;});
  ok(!r2.bongeszo&&r2.pwa&&r2.gomb&&r2.eltunt,"2. telepítve az elveszett teljes képernyőt érzékeli, és kiteszi a „⛶ Vissza” gombot; böngészőben nem",r2);
  /* 3 */
  const r3=await p.evaluate(()=>{const I=identState();I.kit=I.kit||{};I.kit.home=Object.assign({},identKitOrDefault("home"),{c1:"#123456",c2:"#abcdef",pat:"stripes"});
    I.kit.away=Object.assign({},identKitOrDefault("away"),{c1:"#654321",c2:"#fedcba",pat:"solid"});
    const fx={o:{n:SQUADS[3].club||"Ellenfél"},home:true};const c={col:"#fff"};
    const h=euParositasHtml(fx,c,""),a=euParositasHtml(Object.assign({},fx,{home:false}),c,"");
    return {hazai:/#123456/i.test(h),idegen:/#654321/i.test(a),liga:/#123456/i.test(ligaMez("",true))};});
  ok(r3.hazai&&r3.idegen&&r3.liga,"3. a kupa párosításában (hazai / idegen) és a tabellában az arculat meze",r3);
  /* 4 */
  const r4=await p.evaluate(()=>{const Y=v=>v;const L=KAM_FORGATO.letamadasKozep(Y),S0=KAM_FORGATO.sortuz(Y);
    const maxX=Object.values(L.sz).flat().filter(k=>k[1]!==51.5).reduce((m,k)=>Math.max(m,k[1]),0);
    const ball=S0.labda.map(k=>k[1]);
    return {maxX,kamera:L.vagas.map(v=>v.n),letMap:(()=>{try{return kamArchetipus("evLetamadas",{t:"letamadas"},{});}catch(e){return "?";}})(),
      kapusig:ball.some(x=>x>50),rugas:S0.hang.filter(h=>h[1]==="aRugas").length,blokk:S0.hang.filter(h=>h[1]==="aTompa").length,kesztyu:S0.hang.some(h=>h[1]==="aKesztyu"),
      ket:(()=>{const T=EVA_SABLON.skSortuz,c=evaKontextus({t:"gol",side:"us",p:"T",min:3,seq:1,skill:"akc_sortuz"});T.svg(c);const k=[];T.mozgas((sel,f)=>{if(sel==="#evaKapus")k.push(f.length);},c);return k[0]||0;})()};});
  ok(r4.maxX<36&&!r4.kamera.includes("kapu"),"4. a gól nélküli letámadás a 16-oson kívül, kapukamera nélkül",r4);
  ok(r4.kapusig&&r4.rugas===3&&r4.blokk===2&&r4.kesztyu&&r4.ket>=4,"4. Sortűz: 3 lövés, 2 blokk, kapusvédés, utána a gól (3D és 2D)",r4);
  /* 5 */
  const r5=await p.evaluate(()=>{const o={};
    const T=EVA_SABLON.skSortuz,c=evaKontextus({t:"gol",side:"us",p:"T",min:3,seq:1,skill:"akc_sortuz"});
    const box=document.createElement("div");box.innerHTML=`<svg>${T.svg(c)}</svg>`;
    o.info=[...box.querySelectorAll("[data-info]")].map(g=>g.textContent.trim());
    const E=EVA_SABLON.skEgyens,c2=evaKontextus({t:"gol",side:"us",p:"T",min:3,seq:2,skill:"akc_egyens",akc:{crew:["A","B","C","D","E","F","G"],sc:"G",mp:40}});
    box.innerHTML=`<svg>${E.svg(c2)}</svg>`;o.egyInfo=[...box.querySelectorAll("[data-info]")].map(g=>g.textContent.replace(/\s+/g," ").trim());
    const libi=[];E.mozgas((sel,f)=>{if(sel==="#evaLibi")libi.push(f[f.length-1].transform);if(sel==="#evaLovo")o.lovo=f.map(k=>k.transform);},c2);
    o.libiVeg=libi[libi.length-1];o.libiDb=libi.length;
    o.hud=/c\._info/.test(String(kamHud));return o;});
  ok(r5.info.some(t=>/LŐ/.test(t))&&r5.egyInfo.some(t=>/MP/.test(t))&&r5.hud,"5. a rajzolt jelenet feliratai (LŐ! LŐ! LŐ!, ⚖️ MP) a 3D képre is kikerülnek",r5);
  ok(r5.libiDb===1&&/rotate\(-16deg\)/.test(r5.libiVeg)&&/102px/.test(r5.lovo[0])&&/64px/.test(r5.lovo[4]),"5. libikóka: a befejező a palló végéről felugrik, a túlsó vég lecsapódik (−16°)",{libi:r5.libiVeg,lovo:r5.lovo});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
