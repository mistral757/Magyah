/* 📊 3.9.275 — MOMENTUM (az élő meccskép helyett) — élő mérés.
   Amit néz:
     1. az első kezdőrúgásig rejtve; utána (3.9.282) a momentum-GÖRBE, a két
        csapat nevével;
     2. valódi meccs közben a vonal folyamatosan mozog fel-alá, egyetlen
        összefüggő görbe, a feje előre halad; a motor 18 vödre táplálja; a
        végén a 90. percig ér, a gól-jelekkel, és a rajzoló leáll;
     3. A MODELL: a két csapat gólvárhatósága billenti, az alapvonal a
        meccsvégi birtoklás képletéből jön, a gól kilengése lecseng, a görbe
        folytonos, és a meccs véletlenjéhez nem nyúl;
     4. összecsukható, és az állapot megmarad;
     5. az animáció-kapcsoló a fejlécben: meccs közben azonnal hat (a futó
        jelenetet és a sort is leállítja), ugyanaz a beállítás, mint a
        Beállításokban; gyors tempón kiírja, hogy ott úgysem lenne jelenet;
     6. a „kevesebb mozgás" rendszer-kérés az alapértéket KI-re állítja, a
        kifejezett döntés felülírja;
     7. nincs oldalhiba.
   Használat: node tools/momentum-3-9-275-proba.js [kép-mappa] */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9219;
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


  const OUT=process.argv[2]||null;
  console.log("\n— 1. —");
  ok(await p.evaluate(()=>document.getElementById("elokep").classList.contains("hide")),"az első kezdőrúgásig rejtve");
  const m=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    window._mTm=matchSpeedTickMs;matchSpeedTickMs=()=>260;window._mSeb=matchSpeed;matchSpeed=0.5;
    try{utoLancVege();mEloTorol();}catch(e){}
    S.auto=false;S.lastMatch=null;playMatch();
    await varj(200);
    const el=document.getElementById("elokep");
    return {lathato:!el.classList.contains("hide"),palya:!!document.getElementById("ekPalya")||document.querySelectorAll(".ekP,#ekLabda").length,
      sav:!!document.getElementById("ekBirMi"),gorbe:!!document.getElementById("ekVonal"),
      mi:document.getElementById("ekMiNev").textContent,ok:document.getElementById("ekOkNev").textContent};});
  ok(m.lathato&&!m.palya&&!m.sav&&m.gorbe,"a kezdőrúgás után: a momentum-GÖRBE (3.9.282), sáv és pálya nélkül",m);
  ok(m.mi.length>0&&m.ok.length>0&&m.ok!=="Ellenfél"&&!/\(/.test(m.ok),"a két csapat neve a görbe fölött (évad-zárójel nélkül)",{mi:m.mi,ok:m.ok});
  console.log("\n— 2. VALÓDI MECCS —");
  const cy=[],hossz=[];let shot=false,folyt=true;
  for(let i=0;i<400;i++){
    await p.waitForTimeout(90);
    const r=await p.evaluate(()=>{const v=document.getElementById("ekVonal"),pt=document.getElementById("ekPont");
      const d=v?v.getAttribute("d")||"":"";
      return {v:!!S.lastMatch,cy:pt?+pt.getAttribute("cy"):null,cx:pt?+pt.getAttribute("cx"):null,m:(d.match(/M/g)||[]).length,len:d.length};});
    if(r.v)break;
    if(r.cy!=null){cy.push(r.cy);hossz.push(r.cx);}
    if(r.m>1)folyt=false;
    if(!shot&&OUT&&cy.length>40){shot=true;
      await p.evaluate(()=>{try{document.getElementById("scHub").classList.add("hide");document.getElementById("scSim").classList.remove("hide");}catch(e){}
        for(const id of ["guideTip","guideDim"]){const x=document.getElementById(id);if(x)x.style.display="none";}
        document.getElementById("elokep").scrollIntoView({block:"center"});});
      await p.waitForTimeout(200);const h=await p.$("#elokep");const bb=h&&await h.boundingBox();
      if(bb)await p.screenshot({path:OUT+"/momentum.png",clip:{x:0,y:Math.max(0,bb.y-60),width:430,height:bb.height+130}});}}
  await p.waitForTimeout(400);
  const vege=await p.evaluate(()=>{matchSpeedTickMs=window._mTm;matchSpeed=window._mSeb;
    const L=document.getElementById("ekLend"),pt=document.getElementById("ekPont");
    const W=L.viewBox.baseVal.width;
    return {W,cx:+pt.getAttribute("cx"),golJel:[...L.querySelectorAll("text")].filter(t=>t.textContent==="⚽").length,
      gol:(S.lastMatch?S.lastMatch.gf+S.lastMatch.ga:-1),vodor:_ek.cel.length,
      tk:new Set(_ek.cel.map(c=>Math.round(c.tk*100))).size,alap:_ek.alap,raf:_ek.raf};});
  const kul=new Set(cy.map(v=>Math.round(v))).size;
  ok(kul>=12&&folyt,"a vonal folyamatosan mozog fel-alá, egyetlen összefüggő görbeként",{kulonbozo:kul,minta:cy.length,folytonos:folyt});
  ok(hossz.length>10&&hossz.every((x,i)=>i===0||x>=hossz[i-1]-0.01),"a görbe feje előre halad (nem ugrál vissza)",hossz.length);
  ok(vege.vodor===18&&vege.tk>=4&&vege.alap>0.2&&vege.alap<0.8,"a motor 18 vödre táplálja (a két csapat λ-ja), és a birtoklás-alapvonal",vege);
  ok(Math.abs(vege.cx-vege.W)<2&&vege.golJel===vege.gol&&!vege.raf,"a végén a görbe a 90. percig ér, annyi gól-jellel, ahány gól; a rajzoló leállt",vege);
  console.log("\n— 3. A MODELL —");
  const d=await p.evaluate(()=>{
    const r={};
    /* a) a szimuláció változói: a λ-arány billenti */
    ekKezd();_ek.alap=.5;
    for(let k=1;k<=6;k++)ekMotor(k*5,.14,.04,0,0,0);
    r.miNyom=ekErtek(25);
    for(let k=7;k<=12;k++)ekMotor(k*5,.03,.15,0,0,0);
    r.okNyom=ekErtek(57);
    /* b) az alapvonal: a birtoklás képletéből */
    r.alapErős=ekAlapvonal(10);r.alapGyenge=ekAlapvonal(-10);
    /* c) a közvetítés: a gól kilengés, ami lecseng */
    ekKezd();_ek.alap=.5;for(let k=1;k<=18;k++)ekMotor(k*5,.08,.08,0,0,0);
    const v31=ekErtek(31),v55=ekErtek(55),v28=ekErtek(28);
    ekEsemeny({t:"gol",side:"us",min:30,seq:1});
    r.golUtan=ekErtek(31)-v31;r.kesobb=ekErtek(55)-v55;r.elotteNem=Math.abs(ekErtek(28)-v28);
    /* d) folytonos: 0,1 percenként nincs ugrás */
    let ugr=0;for(let x=0;x<90;x+=.1)ugr=Math.max(ugr,Math.abs(ekErtek(x+.1)-ekErtek(x)));
    r.ugras=ugr;
    /* e) a meccs véletlenjéhez nem nyúl */
    const _r=Math.random;let hiv=0;Math.random=()=>{hiv++;return _r();};
    for(let x=0;x<90;x+=.5)ekErtek(x);ekRajz();ekMotor(90,.1,.1,0,0,0);
    Math.random=_r;r.random=hiv;
    r.tx=document.getElementById("ekBirTx").textContent;
    return r;});
  ok(d.miNyom>0.3&&d.okNyom<-0.2,"a két csapat gólvárhatósága billenti a vonalat (fel, majd le)",d);
  ok(d.alapErős>d.alapGyenge,"az alapvonal a meccsvégi birtoklás képletéből: az erősebb többet birtokol",[d.alapErős,d.alapGyenge]);
  ok(d.golUtan>0.25&&Math.abs(d.kesobb)<0.08&&d.elotteNem<1e-9,"a gól kilengés a maga percében (előtte nem), ami lecseng",d);
  ok(d.ugras<0.06,"folytonos: 0,1 percenként legfeljebb kis lépés",d.ugras);
  ok(d.random===0&&/^\d+% – \d+%$/.test(d.tx),"a meccs véletlenjéhez nem nyúl; fölötte a pillanatnyi arány",d);
  console.log("\n— 4. ÖSSZECSUKÁS —");
  const c=await p.evaluate(()=>{const b=document.getElementById("ekCsuk");b.click();
    const r={rejtve:document.getElementById("ekTest").classList.contains("hide"),tx:b.textContent,
      animLatszik:!document.getElementById("ekTest").contains(document.getElementById("ekAnim"))&&!document.getElementById("ekAnim").classList.contains("hide")};
    ekKezd();r.megmarad=document.getElementById("ekTest").classList.contains("hide");b.click();
    r.nyitva=!document.getElementById("ekTest").classList.contains("hide");return r;});
  ok(c.rejtve&&/Momentum/.test(c.tx)&&c.megmarad&&c.nyitva,"„Momentum”, összecsukható, az állapot megmarad",c);
  ok(c.animLatszik,"összecsukva is látszik az animáció-kapcsoló",c.animLatszik);
  console.log("\n— 5. ANIMÁCIÓ-KAPCSOLÓ —");
  const a=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    try{localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}
    const r={};
    matchSpeed=0.1;mevKezd({});_mev.keret=8;_mev.anim=mevAnimBe();evaIdoSzorzo=3;
    evaKer({t:"gol",side:"us",p:"Teszt Elek",min:20,seq:1});evaKer({t:"kapufa",side:"us",p:"Teszt Elek",min:21,seq:2});
    await varj(80);
    r.fut=!!_evaFut;
    const g=document.getElementById("ekAnim");g.click();
    await varj(80);
    r.ki={tx:g.textContent,kulcs:localStorage.getItem(MEV_ANIM_KEY),mev:_mev.anim,fut:!!_evaFut,sor:_evaSor.length,
      rejtve:document.getElementById("evAnim").classList.contains("hide")};
    try{renderThemeModal();}catch(e){}
    const ob=document.getElementById("evaOptBtn");r.beall=ob?ob.getAttribute("aria-pressed"):null;
    g.click();r.be={tx:g.textContent,mev:_mev.anim};
    matchSpeed=0.5;updateMatchSpeedUI();r.tippGyors=document.getElementById("ekAnimTipp").textContent;
    matchSpeed=0.25;updateMatchSpeedUI();r.tippLassu=document.getElementById("ekAnimTipp").textContent;
    evaIdoSzorzo=1;
    return r;});
  ok(a.fut,"egy jelenet fut",a.fut);
  ok(/KI/.test(a.ki.tx)&&a.ki.kulcs==="1"&&a.ki.mev===false&&!a.ki.fut&&a.ki.sor===0&&a.ki.rejtve,"KI: azonnal hat — a futó jelenet és a sor is leáll",a.ki);
  ok(a.beall==="false","ugyanaz a beállítás, mint a Beállításokban",a.beall);
  ok(/BE/.test(a.be.tx)&&a.be.mev===true,"BE: újra él",a.be);
  ok(/0,25×/.test(a.tippGyors)&&a.tippLassu==="","gyors tempón kiírja, hogy ott úgysem lenne jelenet",{gyors:a.tippGyors,lassu:a.tippLassu});
  console.log("\n— 6. KEVESEBB MOZGÁS —");
  await p.emulateMedia({reducedMotion:"reduce"});
  const rm=await p.evaluate(()=>{try{localStorage.removeItem(MEV_ANIM_KEY);}catch(e){}
    const alap=mevAnimBe();localStorage.setItem(MEV_ANIM_KEY,"0");const dont=mevAnimBe();localStorage.removeItem(MEV_ANIM_KEY);return {alap,dont};});
  ok(rm.alap===false&&rm.dont===true,"„kevesebb mozgás”: alapból KI, a kifejezett döntés felülírja",rm);
  console.log("\n— 7. —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
