/* ⭐ 1.0.10.1.00 — A „SZTÁROM A PÁROM" CSÚSZKÁI A MECCSRE IS HATNAK.
   MÉRÉS (audit, D tétel): a Sztár öt csúszkájának nem volt feltétel nélküli
   gólvárhatóság-hatása — a legjobb készlete 0 ⚡-et ért, a Betoné 2,5-et.
   SZABÁLY (csak az új karrierekben, a csúszkák 2. szerződésében):
     · „Minden labda hozzá": + a csapat gólvárhatósága, amíg a sztár a pályán van
       (az ára a régi: nélküle ugyanennyit esik);
     · „Végigjátssza": + feleannyi a 70. perctől, amíg a sztár a pályán van.
   Amit mér:
     1. RÉGI karrierben a saját szorzó betűre a régi (sztárral 1, nélküle a kár);
     2. ÚJ karrierben a sztárral a pályán él a haszon, nélküle nem (ott a kár él);
     3. a „Végigjátssza" csak a 70. perctől, feleakkora;
     4. a legjobb Sztár-készlet ⚡-egyenértéke szintenként (kiírja);
     5. a párharcba utazó tételek között az új karrierben ott van, a régiben nincs;
     6. a panel szövege csak az új karrierben ígéri; az összkép „most él"-t ír;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9327;
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
    });
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const ki={};
    const XI=slots.filter(sl=>sl&&sl.player);const star=XI[XI.length-1].player.n;
    let LV=20;styleLevel=function(st){const s=st||styleState();return (s&&s.key&&!s.pre)?LV:0;};
    const mk=d=>({key:"sztar",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star,dials:d});
    S.tactics.active=null;S.tactics.dials={};
    const _t=talMeccsCsat;talMeccsCsat=()=>1;
    const own=m=>dialMul("own",{min:m,gf:0,ga:0,red:false,injured:false});
    const be=d=>{S.style=mk(d);S.style2=null;S.styleExtra=[];styleLvlCacheClear();tdMemoClear();_dialWhoMemo=null;};
    ki.sztarNev=fameStarName()===null;   /* stílus nélkül nincs */
    be({kiszolgalas:10});ki.sztar=fameStarName()===star;
    const pro=dialProCurve(20)/100,con=dialConCurve(20)/100;
    S.dialV=0;ki.regiBent=own(20);
    S.dialV=2;ki.ujBent=own(20);ki.vart=1+pro;
    /* a sztár lekerül a pályáról */
    const sl=slots.find(x=>x&&x.player&&x.player.n===star),keep=sl.player;sl.player=null;_dialWhoMemo=null;
    S.dialV=0;ki.regiKint=own(20);S.dialV=2;ki.ujKint=own(20);ki.vartKint=1-con;
    sl.player=keep;_dialWhoMemo=null;
    /* Végigjátssza */
    be({sztterheles:10});S.dialV=2;ki.vegig=[own(40),own(75)];ki.vegigVart=1+pro/2;
    S.dialV=0;ki.vegigRegi=[own(40),own(75)];
    /* a legjobb készlet szintenként (≤3 csúszka), a 2. szerződésben */
    S.dialV=2;ki.tabla=[];
    const list=STYLE_DIALS.sztar;
    for(const lv of [1,5,10,15,20]){LV=lv;let best=-9,bs="";
      const rec=(i,cnt,d)=>{
        if(i===list.length){be(d);const O=dialOsszkep();const w=0.4*O.iv.d.eq+0.3*O.iv.up.eq+0.3*O.iv.dn.eq;
          if(w>best+1e-9){best=w;bs=Object.keys(d).map(k=>k+(d[k]>0?"▶":"◀")).join(" ");}return;}
        rec(i+1,cnt,d);
        if(cnt<3)for(const v of [-10,10]){const d2=Object.assign({},d);d2[list[i].k]=v;rec(i+1,cnt+1,d2);}};
      rec(0,0,{});ki.tabla.push([lv,+best.toFixed(2),bs]);}
    LV=20;
    /* párharc-tételek */
    be({kiszolgalas:10});
    S.dialV=0;ki.drotRegi=JSON.stringify(h2hWireDial("own"));
    S.dialV=2;ki.drotUj=JSON.stringify(h2hWireDial("own"));
    /* panel */
    S.styleView=1;openHubMidSeason();openHubDialPanel(true);
    ki.panelUj=document.getElementById("hubDialBody").innerText;
    S.dialV=0;renderHubDialPanel();ki.panelRegi=document.getElementById("hubDialBody").innerText;
    S.dialV=2;talMeccsCsat=_t;
    return ki;});
  ok(r.sztar&&r.sztarNev,"0. a próba sztárja a kezdőben áll");
  ok(r.regiBent===1&&Math.abs(r.regiKint-r.vartKint)<1e-12,"1. régi karrier: sztárral 1, nélküle csak a kár (a régi szabály)",[r.regiBent,+r.regiKint.toFixed(3)]);
  ok(Math.abs(r.ujBent-r.vart)<1e-12,"2. új karrier, a sztár a pályán: a csapat gólvárhatósága nő",+r.ujBent.toFixed(3));
  ok(Math.abs(r.ujKint-r.vartKint)<1e-12,"2. új karrier, a sztár nincs a pályán: a haszon nem él, a kár igen",+r.ujKint.toFixed(3));
  ok(r.vegig[0]===1&&Math.abs(r.vegig[1]-r.vegigVart)<1e-12&&r.vegigRegi[0]===1&&r.vegigRegi[1]===1,"3. „Végigjátssza”: csak a 70. perctől, feleakkora — a régi karrierben semmi",r.vegig.map(x=>+x.toFixed(3)));
  console.log("     a legjobb Sztár-készlet ≈ ⚡-egyenértéke (szint, ⚡, készlet):");r.tabla.forEach(t=>console.log("       "+JSON.stringify(t)));
  ok(r.tabla[4][1]>0.5&&r.tabla[4][1]<2.5&&r.tabla[0][1]<r.tabla[4][1],"4. a 20. szinten a Sztár legjobb készlete a szerényebb stílusok szintjén (Gegenpressing 0,9 · Harmónia 1,0 ⚡)",r.tabla[4]);
  ok(r.drotRegi==="[]"&&/"f":1\.2/.test(r.drotUj),"5. párharc-tételek: az új karrierben utazik, a régiben nincs",[r.drotRegi,r.drotUj]);
  ok(/amíg a sztár a pályán van/.test(r.panelUj)&&/most él/.test(r.panelUj)&&!/gólvárhatósága, amíg a sztár a pályán van/.test(r.panelRegi),"6. a panel csak az új karrierben ígéri, és jelzi, hogy most él");
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
