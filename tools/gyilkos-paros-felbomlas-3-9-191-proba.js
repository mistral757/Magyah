/* 🧲 3.9.191 — A GYILKOS PÁROS FELBOMLIK, HA EGY TAGJA TÁVOZIK.

   BEJELENTÉS: „Itt ha a páros valamelyik fele távozik a klubtól, akkor
   szűnjön meg a páros és nyissa meg a lehetőséget új páros építésére."

   Amit mér (a valódi eladási úton: releasePlayer → pruneChemistry):
     1. KÉSZ PÁROS: az eladott tag párosa megszűnik, a három hely egyike
        felszabadul (gpDuoRoom), a bent maradt ember újra párosítható
        (gpDuoInActive / gpDuoPairOk), a napló kimondja;
     2. FÉLKÉSZ PÁROS: az épülő pár is megszűnik, az „épül" jelölő törlődik;
     3. AMI NEM VÁLTOZIK: a többi páros megmarad; a már kiegyenlített
        sebesség az emberé marad; a „klub történetében felépült párosok"
        mérföldköve nem csökken (gpDuoHist);
     4. RÉGI MENTÉS: a korábban, takarítás nélkül távozott tag párosa az
        első takarításnál bomlik fel, és a mérföldkőben benne marad;
     5. A mentés viszi a történetet; a képesség leírása kimondja a szabályt;
        verzió; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9234;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof gpDuoPrune==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    tiszta();


    const mk=(n,pos)=>{if(!careerPool[n])careerPool[n]={n,pos:[pos],age:25,startRating:80,peak:80,pot:3000};
      const e=careerPool[n];if(!e.attrs)initPlayerAttrs(e);return {n,ovr:80,pos:[pos],age:25};};
    const X=["Páros Teszt A","Páros Teszt B","Páros Teszt C","Páros Teszt D","Páros Teszt E","Páros Teszt F","Páros Teszt G","Páros Teszt H"]
      .map((n,i)=>mk(n,i%2?"CS":"KKP"));
    X.forEach(p=>extraRoster.push(p));
    const [pA,pB,pC,pD,pE,pF,pG,pH]=X.map(p=>p.n);
    const K=gpDuoKey;
    S.gpDuoMig=1;
    S.gpDuo={};S.gpDuoHist={};S.gpDuoInProgress=null;
    S.gpDuo[K(pA,pB)]={stages:5,built:1,done:1,n:12,season:1};
    S.gpDuo[K(pC,pD)]={stages:5,built:1,n:3};
    S.gpDuo[K(pE,pF)]={stages:5,built:1,n:0};
    S.gpDuo[K(pG,pH)]={stages:3,n:0};S.gpDuoInProgress=K(pG,pH);
    careerPool[pA].attrs.seb=88;careerPool[pB].attrs.seb=88;
    ki.elotte={kesz:gpDuoDone(),hely:gpDuoRoom(),bInActive:gpDuoInActive(pB),karrier:gpDuoCareer()};
    const sorok=[];const _a=addLine;addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    let r1,r2;
    try{
      /* 1. a kész (összeért) páros egyik tagját ELADJUK */
      r1=releasePlayer(X[0],true);
      ki.kesz={ok:r1&&r1.ok,van:!!S.gpDuo[K(pA,pB)],kesz:gpDuoDone(),hely:gpDuoRoom(),
        bInActive:gpDuoInActive(pB),bParOk:gpDuoPairOk(pB,pG),karrier:gpDuoCareer(),
        masikMarad:!!S.gpDuo[K(pC,pD)]&&!!S.gpDuo[K(pE,pF)],sebB:careerPool[pB].attrs.seb,
        sor:sorok.find(t=>/Felbomlott/.test(t))||""};
      /* 2. a félkész páros egyik tagját ELENGEDJÜK */
      sorok.length=0;
      r2=releasePlayer(X[7],false);
      ki.felkesz={ok:r2&&r2.ok,van:!!S.gpDuo[K(pG,pH)],inProg:S.gpDuoInProgress,sor:sorok.find(t=>/Felbomlott/.test(t))||""};
      /* 4. régi mentés: a tag takarítás nélkül tűnt el */
      sorok.length=0;
      const iE=extraRoster.findIndex(p=>p.n===pE);extraRoster.splice(iE,1);
      const kElotte=gpDuoCareer();
      pruneChemistry();
      ki.regi={van:!!S.gpDuo[K(pE,pF)],karrierElotte:kElotte,karrier:gpDuoCareer(),hist:Object.keys(S.gpDuoHist).length,
        sor:sorok.find(t=>/Felbomlott/.test(t))||""};
      /* ismételt takarítás: semmi új sor, semmi változás */
      sorok.length=0;pruneChemistry();
      ki.ismet={sorok:sorok.filter(t=>/Felbomlott/.test(t)).length,karrier:gpDuoCareer()};
    }finally{addLine=_a;}
    ki.mentes=[...document.scripts].some(sc=>/gpDuoHist:S\.gpDuoHist/.test(sc.textContent));
    let leiras="";try{leiras=JSON.stringify(ST_TRAITS||null);}catch(e){}
    ki.leiras=/a páros felbomlik/.test(document.documentElement.innerHTML)||/a páros felbomlik/.test(leiras)
      ||/a páros felbomlik/.test(String(stTrait))||(()=>{try{return [...document.scripts].some(s=>/a páros felbomlik: a helye felszabadul/.test(s.textContent));}catch(e){return false;}})();
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 0. KIINDULÁS —");
  ok(r.elotte.kesz===3&&!r.elotte.hely&&r.elotte.bInActive&&r.elotte.karrier===3,"három kész páros: nincs hely, B párosban van",r.elotte);
  console.log("\n— 1. KÉSZ PÁROS: AZ EGYIK TAG ELADÁSA —");
  ok(r.kesz.ok&&!r.kesz.van,"az eladás után a páros megszűnik",r.kesz);
  ok(r.kesz.kesz===2&&r.kesz.hely,"a hely felszabadul: új páros építhető",{kesz:r.kesz.kesz,hely:r.kesz.hely});
  ok(!r.kesz.bInActive&&r.kesz.bParOk,"a bent maradt ember újra párosítható",{bInActive:r.kesz.bInActive,bParOk:r.kesz.bParOk});
  ok(/Felbomlott a gyilkos páros \(összeért\)/.test(r.kesz.sor)&&/elhagyta a klubot/.test(r.kesz.sor)&&/új párost építhetsz/.test(r.kesz.sor),"a napló kimondja",r.kesz.sor);
  ok(r.kesz.masikMarad,"a többi páros megmarad");
  ok(r.kesz.sebB===88,"a kiegyenlített sebesség az emberé marad",r.kesz.sebB);
  ok(r.kesz.karrier===3,"a mérföldkő (klub történetében felépült párosok) nem csökken",r.kesz.karrier);
  console.log("\n— 2. FÉLKÉSZ PÁROS —");
  ok(r.felkesz.ok&&!r.felkesz.van&&r.felkesz.inProg===null,"az épülő páros is megszűnik, az „épül” jelölő törlődik",r.felkesz);
  ok(/Felbomlott a gyilkos páros \(félkész, 3\/5 fázis\)/.test(r.felkesz.sor)&&/új párost választhatsz/.test(r.felkesz.sor),"a napló a félkész párosét is kimondja",r.felkesz.sor);
  console.log("\n— 4. RÉGI MENTÉS —");
  ok(!r.regi.van&&r.regi.karrier===r.regi.karrierElotte&&r.regi.hist===2,"takarítás nélkül távozott tag: az első takarításnál bomlik fel, a mérföldkőben marad",r.regi);
  ok(r.ismet.sorok===0&&r.ismet.karrier===3,"ismételt takarítás: nincs új sor, a szám áll",r.ismet);
  console.log("\n— 5. MENTÉS, LEÍRÁS —");
  ok(r.mentes,"a mentés viszi a történetet (gpDuoHist)");
  ok(r.leiras,"a képesség leírása kimondja a felbomlást");
  ok(String(r.verzio).localeCompare("3.9.191",undefined,{numeric:true})>=0,"verzió legalább 3.9.191",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
