/* ⚡ 3.9.269 — MECCSESEMÉNYEK (F3) — élő mérés valódi meccseken.
   Amit néz:
     1. minden gól eseménnyé válik (a saját és a kapott is, a lefújt
        eredménnyel egyezően), névvel;
     2. a gól fajtája (fejes, tizenegyes, szabadrúgás…) a sorából jön, akár
        előtte, akár utána fut le az sbEv;
     3. a fontos kibocsátó helyek névvel jönnek (tipp), a többi a szövegből;
     4. a kiválasztás: lassú tempón minden gól, a többi a keretből (≤ keret,
        típusonként ≤ 2), gyors tempón, végigjátszásban és kikapcsolva semmi;
     5. a feliratkozó pontosan a kiválasztottakat kapja;
     6. a modul nem húz véletlent (a szimulációt nem mozdítja);
     7. nincs oldalhiba.
   Használat: node tools/meccsesemeny-3-9-269-proba.js   (MROOT=… másik mappára) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9214;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  /* egy valódi egyjátékos karrier (mentési zárral), szezonban, nyitott HUB-bal */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
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
    openHubMidSeason();});
  await p.waitForTimeout(1500);   /* a nyitáskori összevont mentés is lefusson */


  const meccsek=async(db,seb,opt)=>p.evaluate(async([db,seb,opt])=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const _tm=matchSpeedTickMs;matchSpeedTickMs=()=>12;
    const regiSeb=matchSpeed;matchSpeed=seb;
    if(opt&&opt.ki)try{localStorage.setItem(MEV_ANIM_KEY,"1");}catch(e){}
    const kapott=[];const fn=ev=>kapott.push(ev);
    if(!window._mevProbaFigyel){window._mevProbaFigyel=true;mevFeliratkoz(ev=>{(window._mevKapott=window._mevKapott||[]).push(ev);});}
    const out=[];
    try{
      for(let k=0;k<db;k++){
        /* egy előző kör által már elindított meccs előbb érjen véget */
        for(let i=0;i<400&&S.playing;i++)await varj(40);
        window._mevKapott=[];
        for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
        try{utoLancVege();mEloTorol();}catch(e){}
        S.auto=!!(opt&&opt.auto);S.lastMatch=null;
        if(S.idx>=28){S.idx=0;}
        playMatch();
        for(let i=0;i<400&&!S.lastMatch;i++)await varj(40);
        await varj(80);
        const L=mevLista().map(e=>({t:e.t,side:e.side,p:e.p,alt:e.alt||null,extra:e.extra||null,min:e.min,anim:e.anim,forras:e.forras,sor:e.sor||""}));
        out.push({gf:S.lastMatch&&S.lastMatch.gf,ga:S.lastMatch&&S.lastMatch.ga,L,kapott:window._mevKapott.length,
          keret:(_mev||_mevUtolso||{}).keret});}
    }finally{matchSpeedTickMs=_tm;matchSpeed=regiSeb;S.auto=false;try{localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}}
    return out;},[db,seb,opt||null]);

  console.log("\n— 1-5. VALÓDI MECCSEK, LASSÚ TEMPÓ (0,1× → keret 8) —");
  const M=await meccsek(10,0.1);
  const gol=M.every(m=>m.L.filter(e=>e.t==="gol").length===m.gf&&m.L.filter(e=>e.t==="golKapott").length===m.ga);
  ok(gol,"minden gól esemény, az eredménnyel egyezően",M.map(m=>`${m.gf}:${m.ga}→${m.L.filter(e=>e.t==="gol").length}:${m.L.filter(e=>e.t==="golKapott").length}`));
  const golok=M.flatMap(m=>m.L.filter(e=>e.t==="gol"||e.t==="golKapott"));
  ok(golok.every(e=>e.p||e.alt==="ongol"||e.alt==="potya"),"a gólok névvel jönnek (kivétel: öngól, potyagól)",golok.filter(e=>!e.p).slice(0,3));
  ok(golok.filter(e=>e.sor).length>=golok.length*0.8,"a gól sora hozzákapcsolódik (≥ 80%)",{sorral:golok.filter(e=>e.sor).length,ossz:golok.length});
  const tipusok=new Set(M.flatMap(m=>m.L.map(e=>e.t)));
  ok(tipusok.size>=7,`legalább 7 eseménytípus 10 meccsen (${[...tipusok].join(", ")})`);
  const tipp=M.flatMap(m=>m.L.filter(e=>e.forras==="tipp"));
  ok(tipp.length>0&&tipp.every(e=>e.side&&(e.p||e.t==="tizenegyes"||e.side==="them")),"a tippek oldallal és (saját oldalon) névvel",{db:tipp.length,minta:tipp.slice(0,3)});
  const percek=M.flatMap(m=>m.L.map(e=>e.min)).filter(x=>x!=null);
  ok(percek.length>0&&percek.every(x=>x>=0&&x<=125),"a percek a meccs idején belül",{db:percek.length});
  const ker=M.every(m=>{const nem=m.L.filter(e=>e.anim&&!MEV_ok_mindig(e.t));return nem.length<=m.keret;});
  function MEV_ok_mindig(t){return t==="gol"||t==="golKapott";}
  ok(M.every(m=>m.keret===8),"0,1×-en a keret 8",M.map(m=>m.keret));
  ok(M.every(m=>m.L.filter(e=>MEV_ok_mindig(e.t)).every(e=>e.anim)),"lassú tempón minden gól animációt kap");
  ok(ker,"a többi a kereten belül marad",M.map(m=>m.L.filter(e=>e.anim&&!MEV_ok_mindig(e.t)).length));
  ok(M.every(m=>{const db={};m.L.filter(e=>e.anim).forEach(e=>db[e.t]=(db[e.t]||0)+1);
    return Object.keys(db).every(t=>MEV_ok_mindig(t)||db[t]<=2);}),"típusonként legfeljebb 2");
  ok(M.some(m=>m.L.some(e=>e.anim&&!MEV_ok_mindig(e.t))),"a gólon kívül is jut animáció");
  ok(M.every(m=>m.kapott===m.L.filter(e=>e.anim).length),"a feliratkozó pontosan a kiválasztottakat kapja",M.map(m=>[m.kapott,m.L.filter(e=>e.anim).length]));
  ok(M.every(m=>!m.L.some(e=>e.t==="csere"&&e.anim)),"a csere sosem animál");

  console.log("\n— 4. GYORS TEMPÓ, VÉGIGJÁTSZÁS, KIKAPCSOLVA —");
  const G=await meccsek(2,0.5);
  ok(G.every(m=>m.keret===0&&m.L.length>0&&!m.L.some(e=>e.anim)),"0,5×: az események megvannak, animáció nincs (a gólnak sem)",G.map(m=>[m.keret,m.L.length]));
  const K=await meccsek(2,0.1,{ki:true});
  ok(K.every(m=>!m.L.some(e=>e.anim)),"kikapcsolva: nincs animáció");
  const A=await meccsek(1,0.1,{auto:true});
  ok(A.every(m=>!m.L.some(e=>e.anim)),"végigjátszásban: nincs animáció");

  console.log("\n— 2. A GÓL KÉT FELE, MINDKÉT SORRENDBEN; A SZÖVEG-TARTALÉK —");
  const U=await p.evaluate(()=>{
    const r={};const n=document.createElement("div");
    mevKezd({});
    addLine(`12'  SZÖGLET UTÁN, FEJJEL! GÓL! Kovács  1:0`,"m goal");sbEv("us","goal","Kovács Béla",12);
    sbEv("us","goal","Nagy Ádám",30);addLine(`30'  TIZENEGYES! Nagy magabiztosan értékesíti  2:0`,"m goal");
    addLine(`⚽⚽⚽  MESTERHÁRMAS!!! Nagy HÁROM gólt lőtt`,"m goal");
    addLine(`41'  Kapufa! Az ellenfél centikre volt a góltól`,"m ev",false,{side:"them"});
    addLine(`44'  Szöglet — <b>Kiss</b> áll a labda mögé`,"m ev");
    addLine(`45'  VAR-ellenőrzés... a gólt nem adják meg!`,"m ev");
    addLine(`🎯 egy nem-közvetítés sor kapufa szóval`,"m life");
    const L=mevLista();
    r.g1=L[0]&&[L[0].t,L[0].p,L[0].alt];r.g2=L[1]&&[L[1].t,L[1].p,L[1].alt,L[1].extra];
    r.tobbi=L.slice(2).map(e=>[e.t,e.side]);r.db=L.length;
    mevVege();
    r.random=[mevValaszt,mevSor,mevSb,mevUj,mevKezd].some(f=>/random/.test(String(f)));
    return r;});
  ok(U.g1&&U.g1.join()==="gol,Kovács Béla,fejes","sor ELŐBB, sbEv utána: név + fajta",U.g1);
  ok(U.g2&&U.g2.join()==="gol,Nagy Ádám,tizenegyes,mesterharmas","sbEv ELŐBB, sor utána: név + fajta + mesterhármas jelző",U.g2);
  ok(JSON.stringify(U.tobbi)===JSON.stringify([["kapufa","them"],["szoglet",null],["var",null]])&&U.db===5,"szöveg-tartalék: kapufa (tipp-oldallal), szöglet, VAR; a nem-közvetítés sor kimarad",U);
  ok(!U.random,"a modul nem húz véletlent");

  console.log("\n— 7. HIBÁK —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
