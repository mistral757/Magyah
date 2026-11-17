/* 🎚 1.0.10.0.00 — A CSÚSZKÁK 2. SZERZŐDÉSE: PLAFON A HALMOZOTT GÓLESÉLY-HATÁSON.
   MÉRÉS: docs/audit-felulet-mechanika-1-0-9-8.md C tétel — egy kifejlett
   karrierben a csúszkák együtt ≈ 10–11 ⚡-et értek, a nehézség ablaka ±3–4.
   SZABÁLY: az összes csúszka együttes hatása a saját és az ellenfél
   gólvárhatóságára ±40%-ban megáll — csak az ÚJ karrierekben, csak a helyi
   motorban.
   Amit mér:
     1. az új karrier a 2. szerződéssel indul (S.dialV = 2), a mentés viszi,
        és a jelző nélküli (régi) mentés a régi szabályon marad;
     2. RÉGI karrierben a halmozott szorzó betűre a nyers szorzat (nincs plafon);
     3. ÚJ karrierben a saját és az ellenfél szorzó 0,60…1,40 közé áll, a
        plafon alatti beállítás bitre változatlan, és a többi csatorna
        (lap, sérülés, gólsúly) érintetlen;
     4. az összkép kiírja a plafont, és jelzi, ha fog (régi karrierben nem);
     5. a párharc pillanatképébe utazó csúszka-tételek a jelzőtől függetlenek;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9326;
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
const KEP=process.env.KEP||"",REGI=!!process.env.REGI;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    window.mgmtNyit=()=>false;
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    window.__sgn=saveGameNow;});
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const ki={};
    ki.ujKarrier=S.dialV;
    /* mentés oda-vissza */
    try{window.__sgn();const d=loadSavedGame(saveKey());ki.mentesben=d&&d.S&&d.S.dialV;
      const d2=JSON.parse(JSON.stringify(d));delete d2.S.dialV;S.dialV=2;applySavedGame(d2);ki.regiMentes=S.dialV;
      applySavedGame(d);ki.ujMentes=S.dialV;}catch(e){ki.mentHiba=String(e);}
    /* halmozott beállítás: taktika 99 + Beton 20. szint */
    const A=teamAttrStrengths();
    const k=Object.keys(TACTICS)[0];S.tactics.active=k;S.tactics.levels[k]=99;
    S.tactics.dials={};S.tactics.dials[k]={vonal:-10,tempo:10,press:10,mental:-10};
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,dials:{vonal:-10,belepo:10,busz:-10}};
    styleLevel=function(st){const s=st||styleState();return (s&&s.key&&!s.pre)?20:0;};
    styleLvlCacheClear();tdMemoClear();
    const _t=talMeccsCsat;talMeccsCsat=()=>1;
    const ctxk=[];for(const [gf,ga] of [[0,0],[1,0],[0,1]])for(let m=3;m<=90;m+=5)ctxk.push({min:m,gf,ga,red:false,injured:false});
    const mer=()=>({own:ctxk.map(c=>dialMul("own",c)),opp:ctxk.map(c=>dialMul("opp",c)),
      nyO:ctxk.map(c=>dialOsszNyers("own",c)),nyP:ctxk.map(c=>dialOsszNyers("opp",c)),
      lap:dialMul("card",{}),ser:dialMul("inj",{}),
      gsuly:slots.filter(sl=>sl&&sl.player).map(sl=>dialMul("goalw",{name:sl.player.n,pos:sl.pos})),
      drot:JSON.stringify([h2hWireDial("own"),h2hWireDial("opp")])});
    S.dialV=0;tdMemoClear();const R=mer();
    S.dialV=2;tdMemoClear();const U=mer();
    ki.regiNyers=R.own.every((x,i)=>x===R.nyO[i])&&R.opp.every((x,i)=>x===R.nyP[i]);
    ki.regiMinOpp=Math.min(...R.opp);ki.regiMaxOwn=Math.max(...R.own);
    ki.ujMinOpp=Math.min(...U.opp);ki.ujMaxOpp=Math.max(...U.opp);ki.ujMinOwn=Math.min(...U.own);ki.ujMaxOwn=Math.max(...U.own);
    ki.ujVagas=U.opp.every((x,i)=>Math.abs(x-Math.max(0.6,Math.min(1.4,R.opp[i])))<1e-12)&&U.own.every((x,i)=>Math.abs(x-Math.max(0.6,Math.min(1.4,R.own[i])))<1e-12);
    ki.tobbi=R.lap===U.lap&&R.ser===U.ser&&JSON.stringify(R.gsuly)===JSON.stringify(U.gsuly);
    ki.drot=R.drot===U.drot&&R.drot.length>10;
    /* a régi szabály ⚡-egyenértéke és az újé */
    S.dialV=0;const O0=dialOsszkep();S.dialV=2;const O2=dialOsszkep();
    ki.eq=[+O0.iv.d.eq.toFixed(2),+O2.iv.d.eq.toFixed(2),+O0.iv.up.eq.toFixed(2),+O2.iv.up.eq.toFixed(2)];
    ki.fog=[O0.iv.d.fog,O2.iv.d.fog];
    ki.eqMax=(Math.log(1.4)-Math.log(0.6))/(2*SIM.K);
    /* plafon alatti beállítás: bitre ugyanaz */
    S.tactics.dials[k]={tempo:3};S.style.dials={belepo:4};tdMemoClear();
    S.dialV=0;const a0=ctxk.map(c=>dialMul("own",c)+"/"+dialMul("opp",c)).join();
    S.dialV=2;const a2=ctxk.map(c=>dialMul("own",c)+"/"+dialMul("opp",c)).join();
    ki.alatta=a0===a2;
    /* a panel */
    S.tactics.dials[k]={vonal:-10,tempo:10,press:10,mental:-10};S.style.dials={vonal:-10,belepo:10,busz:-10};tdMemoClear();
    openHubMidSeason();openHubDialPanel(true);
    ki.panelUj=(document.querySelector("#dialOsszBox .dlOsszPlaf")||{}).innerText||"";
    ki.panelUjFog=!!document.querySelector("#dialOsszBox .dlOsszPlaf.fog");
    S.dialV=0;renderHubDialPanel();
    ki.panelRegi=!!document.querySelector("#dialOsszBox .dlOsszPlaf");
    S.dialV=2;S.tactics.dials[k]={tempo:3};S.style.dials={};tdMemoClear();renderHubDialPanel();
    ki.panelAlatta=(document.querySelector("#dialOsszBox .dlOsszPlaf")||{}).innerText||"";
    ki.panelAlattaFog=!!document.querySelector("#dialOsszBox .dlOsszPlaf.fog");
    talMeccsCsat=_t;
    return ki;});
  ok(r.ujKarrier===2,"1. az új karrier a 2. szerződéssel indul",r.ujKarrier);
  ok(r.mentesben===2&&r.ujMentes===2&&!r.mentHiba,"1. a mentés viszi a jelzőt, és betöltéskor visszajön",[r.mentesben,r.ujMentes,r.mentHiba]);
  ok(r.regiMentes===0,"1. jelző nélküli (régi) mentés betöltve: a régi szabály marad",r.regiMentes);
  ok(r.regiNyers&&r.regiMinOpp<0.45,"2. régi karrier: a szorzó betűre a nyers szorzat, plafon nélkül",{minEllenfel:+r.regiMinOpp.toFixed(3),maxSajat:+r.regiMaxOwn.toFixed(3)});
  ok(r.ujVagas&&Math.abs(r.ujMinOpp-0.6)<1e-12&&r.ujMaxOpp<=1.4&&r.ujMinOwn>=0.6&&r.ujMaxOwn<=1.4,"3. új karrier: a saját és az ellenfél szorzó 0,60…1,40 közé áll",{ellenfel:[r.ujMinOpp,+r.ujMaxOpp.toFixed(3)],sajat:[+r.ujMinOwn.toFixed(3),+r.ujMaxOwn.toFixed(3)]});
  ok(r.alatta,"3. plafon alatti beállítás: bitre ugyanaz a két szerződésben");
  ok(r.tobbi,"3. a lap, a sérülés és a gólsúlyok érintetlenek");
  ok(r.eq[1]<r.eq[0]&&r.eq[1]<=r.eqMax+1e-9&&r.eq[3]<=r.eqMax+1e-9,"3. a ⚡-egyenérték a plafonnal legfeljebb "+r.eqMax.toFixed(2),{dontetlen:[r.eq[0],r.eq[1]],vezetesnel:[r.eq[2],r.eq[3]]});
  ok(/legfeljebb ±40%/.test(r.panelUj)&&/plafonon vagy/.test(r.panelUj)&&r.panelUjFog&&r.fog[1]>0&&r.fog[0]===0,"4. az összkép kimondja a plafont, és jelzi, hogy fog",r.panelUj);
  ok(!r.panelRegi,"4. régi karrierben nincs plafon-sor");
  ok(/plafon alatt vagy/.test(r.panelAlatta)&&!r.panelAlattaFog,"4. plafon alatt: nyugodt jelzés",r.panelAlatta);
  ok(r.drot,"5. a párharcba utazó csúszka-tételek a jelzőtől függetlenek");
  ok(errs.length===0,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
