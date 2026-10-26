/* 🎞 3.9.313 — PIXEL TÉMÁBAN IS SIMA MOZGÁS A MECCSEN.

   BEJELENTÉS: „Pixelated módban az animációk nagyon szaggatnak. Legyenek
   ugyanolyan szép smooth animációk, mint a többi témával. Jelenleg a
   pixelated stílust ezért kapcsoltam ki, mert nézhetetlenek az animációk."

   MÉRVE (javítás előtt): a böngésző mindkét témában 60 képkockát rajzolt
   (16,7 ms), de a gól-jelenetben a labda Pixel témában csak 7 helyzetben
   látszott (sötét témában 33) — a jelenet minden mozgása steps(8)-cal futott.

   Amit mér, valódi karrierben, a játék saját jelenet-lejátszójával:
     1. Pixel témában a labda annyi helyzetben látszik, mint a sötétben
        (legalább 80%-a), a képkocka-idő egyenletes;
     2. a jelenet egyetlen animációja sem lépcsős (se a mozgás, se a felirat);
     3. a meccs-képernyőn (#scSim) és a jelenetben a CSS sem lépcsőz, a menükben
        viszont a Pixel téma lépcsője marad (a téma jellege), és a „Szaggatott
        mozgás" kapcsolóval az is kikapcsol;
     4. a pixeles arc marad (image-rendering: pixelated);
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9313;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
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
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a hang-kém: minden megszólalás időbélyeggel */
    window._hl=[];const h0=hang;hang=function(id){window._hl.push([performance.now(),id]);return h0.apply(this,arguments);};
    window._var=()=>new Promise(r=>{const t0=performance.now();
      const f=()=>(!_evaFut&&!_evaSor.length)||performance.now()-t0>9000?r():setTimeout(f,40);f();});
    window._elo=()=>{mevKezd({});_mev.anim=true;_mev.keret=8;S.playing=true;S.auto=false;};});
  await p.waitForTimeout(800);

  const mer=tema=>p.evaluate(async tema=>{
    try{applyTheme(tema);}catch(e){document.documentElement.setAttribute("data-theme",tema);}
    await new Promise(r=>setTimeout(r,300));
    _elo();evaIdoSzorzo=1;
    evaKer({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:7});
    await new Promise(r=>setTimeout(r,20));
    const ev=document.getElementById("evAnim");
    const jel=document.getAnimations().filter(a=>{const t=a.effect&&a.effect.target;return t&&ev.contains(t);});
    const lepcsos=jel.filter(a=>{try{return /steps/.test(a.effect.getTiming().easing||"")||/steps/.test(getComputedStyle(a.effect.target).animationTimingFunction||"")&&a instanceof CSSAnimation;}catch(x){return false;}}).length;
    const db=jel.length;
    const arc=getComputedStyle(document.querySelector("#evAnim .evaArc")).imageRendering;
    const fr=[],poz=new Set();let t0=performance.now(),el=t0;
    await new Promise(res=>{const f=()=>{const n=performance.now();fr.push(n-el);el=n;
      const b=document.querySelector("#evaLabda");if(b)poz.add(getComputedStyle(b).transform);
      if(n-t0<1500&&_evaFut)requestAnimationFrame(f);else res();};requestAnimationFrame(f);});
    _evaSor.length=0;evaLezar();mevVege();S.playing=false;
    fr.shift();fr.sort((a,b)=>a-b);
    return {tema,anim:db,lepcsos,arc,median:+fr[fr.length>>1].toFixed(1),hosszu:fr.filter(x=>x>50).length,labda:poz.size};},tema);

  console.log("\n— 1–2. a jelenet mozgása —");
  const d=await mer("dark"),px=await mer("pixel");
  console.log("  sötét: "+JSON.stringify(d)+"\n  pixel: "+JSON.stringify(px));
  ok(px.labda>=Math.floor(d.labda*0.8)&&px.labda>=20,"Pixel témában a labda annyi helyzetben látszik, mint sötétben",{pixel:px.labda,sotet:d.labda});
  ok(px.hosszu===0&&px.median<=20,"a képkocka-idő egyenletes",{median:px.median,hosszu:px.hosszu});
  ok(px.anim>3&&px.lepcsos===0,"a jelenet egyetlen animációja sem lépcsős (mozgás, felirat)",{anim:px.anim,lepcsos:px.lepcsos});
  ok(/pixelated/.test(px.arc),"a pixeles arc marad",px.arc);

  console.log("\n— 3. a CSS: meccs sima, menü lépcsős —");
  const c=await p.evaluate(async()=>{
    applyTheme("pixel");await new Promise(r=>setTimeout(r,200));
    const mk=(szulo)=>{const x=document.createElement("div");x.style.transition="opacity .3s";x.style.animation="pixBlink 1s infinite";szulo.appendChild(x);
      const cs=getComputedStyle(x);const r={tr:cs.transitionTimingFunction,an:cs.animationTimingFunction};x.remove();return r;};
    const sim=$("scSim"),eva=evaElem();
    const r={meccs:mk(sim),jelenet:mk(eva),menu:mk(document.body)};
    document.documentElement.classList.add("pixMoveOff");r.menuKi=mk(document.body);document.documentElement.classList.remove("pixMoveOff");
    applyTheme("dark");return r;});
  ok(!/steps/.test(c.meccs.tr+c.meccs.an)&&!/steps/.test(c.jelenet.tr+c.jelenet.an),"a meccs-képernyőn és a jelenetben a CSS sem lépcsőz",c);
  ok(/steps/.test(c.menu.an)&&/steps/.test(c.menu.tr),"a menükben a Pixel téma lépcsője marad",c.menu);
  ok(!/steps/.test(c.menuKi.an+c.menuKi.tr),"…és a „Szaggatott mozgás” kapcsolóval az is kikapcsol",c.menuKi);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
