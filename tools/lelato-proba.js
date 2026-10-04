/* 🏟️ 3.9.174 — A LELÁTÓ HANGJA: MECCSZAJ, 25%-OS ZENE, FELOLDÁS AZ IZGALOMMAL.

   BEJELENTETT KÉRÉS: „Meccs közben 25%-on a háttér zene + egy meccs zaj
   szurkolással… Legyen mondjuk 5 féle, és ezek mérföldkövekkel kinyithatók
   legyenek. Meccs izgalomhoz köthetően legyenek mérföldkövekre rakva a
   kinyitások. Ezeket változtatni az arculat menüpont alatt lehessen."

   Amit mér (valódi karrier, valódi hangkártya, HANG_TESZT):
     1. mind az öt lelátó kirenderelődik: nem néma, a csúcs 0,9 alatt, a hurok
        varrata sima (a varrat-ugrás nem nagyobb a szokásos mintaváltozásnál
        háromszor), és a nagyobb tömeg hangosabb, mint a vasárnapi;
     2. NÉZETT meccs közben: a lelátó szól (a választott), a zene 25%-on megy
        tovább (nem hallgat el), a gól-esemény a lelátót is megmozdítja;
        a lefújás után a lelátó elhallgat, a zene visszaáll 100%-ra;
     3. végigjátszásnál nincs lelátó;
     4. a feloldás az izgalom lépcsőin: 0 / 65 / 85 / 92 / 96; zárt lelátó
        nem választható (a választás a vasárnapira esik vissza); az izgalmi
        csúcs átlépése bejelentést ír a naplóba;
     5. az Arculat menüben „7 · A lelátó hangja": öt kártya, a zártak
        feltétellel, a választás azonnal érvényes és a mentésbe kerül, a
        belehallgatás szól;
     6. a Hang beállításai közt a lelátó ki/be és a hangereje;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9215;
const OUT=process.env.LELOUT||"";
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,520):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:OUT?2:1})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1000);

  /* ---- 1. A RENDER ---- */
  console.log("\n— 1. AZ ÖT LELÁTÓ KIRENDERELÉSE —");
  const r=await p.evaluate(async()=>{
    const out={};
    for(const L of LELATO){
      const buf=await lelatoRender(L.k);
      if(!buf){out[L.k]=null;continue;}
      const n=buf.length;let q=0,cs=0,ds=0;
      for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++){q+=d[i]*d[i];const a=Math.abs(d[i]);if(a>cs)cs=a;if(i)ds+=Math.abs(d[i]-d[i-1]);}}
      const d0=buf.getChannelData(0),d1=buf.getChannelData(1);
      const varrat=Math.max(Math.abs(d0[n-1]-d0[0]),Math.abs(d1[n-1]-d1[0]));
      out[L.k]={mp:+(n/buf.sampleRate).toFixed(1),rms:Math.sqrt(q/(2*n)),csucs:cs,varrat,lepes:ds/(2*(n-1))};}
    return out;});
  const kk=["vasarnap","hazai","ultra","katlan","legenda"];
  ok(kk.every(k=>r[k]&&r[k].rms>.02&&r[k].mp>=15),"mind az öt kirenderelődik, nem néma, 15 mp fölötti hurok",kk.map(k=>r[k]&&{k,mp:r[k].mp,rms:+r[k].rms.toFixed(3)}));
  ok(kk.every(k=>r[k]&&r[k].csucs<=.9001),"a csúcs mindenhol 0,9 alatt",kk.map(k=>r[k]&&+r[k].csucs.toFixed(3)));
  ok(kk.every(k=>r[k]&&r[k].varrat<=3*r[k].lepes+.01),"a hurok varrata sima (nem nagyobb a szokásos mintaváltozásnál háromszor)",kk.map(k=>r[k]&&{v:+r[k].varrat.toFixed(4),l:+r[k].lepes.toFixed(4)}));
  ok(r.legenda.rms>r.vasarnap.rms&&r.katlan.rms>r.vasarnap.rms,"a nagy tömeg hangosabb, mint a vasárnapi",{v:+r.vasarnap.rms.toFixed(3),k:+r.katlan.rms.toFixed(3),l:+r.legenda.rms.toFixed(3)});

  /* ---- karrier ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:24};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:24,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(600);
  await p.mouse.click(5,5);
  await p.evaluate(()=>{hangFelold();const B=hangBeall();B.on=true;B.zene=true;B.lelato=true;hangHangero();});
  await p.waitForTimeout(400);

  /* ---- 4. A FELOLDÁS ---- */
  console.log("\n— 4. A FELOLDÁS AZ IZGALOM LÉPCSŐIN —");
  const f=await p.evaluate(()=>{
    const r={};const t=msT();
    t.exciteMax=0;r.l0=LELATO.map(L=>lelatoNyitott(L));
    identState().lelato="legenda";r.zartValasztas=lelatoValasztott();
    const sorok=[];const _a=addLine;addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{msNoteMatch({excitement:88});}finally{addLine=_a;}
    r.l88=LELATO.map(L=>lelatoNyitott(L));r.bejelentes=sorok.filter(x=>/ÚJ LELÁTÓ-HANG/.test(x));
    t.exciteMax=96;r.l96=LELATO.map(L=>lelatoNyitott(L));r.nyitottValasztas=lelatoValasztott();
    r.kuszob=LELATO.map(L=>L.kell);
    return r;});
  ok(JSON.stringify(f.kuszob)==="[0,65,85,92,96]","a lépcsők: alap · 65 izgalmas · 85 emlékezetes · 92 · 96 (az izgalom-mérföldkövek fokai)",f.kuszob);
  ok(JSON.stringify(f.l0)==="[true,false,false,false,false]"&&f.zartValasztas==="vasarnap","kezdetben csak a vasárnapi nyitott; zárt lelátó nem választható",f);
  ok(JSON.stringify(f.l88)==="[true,true,true,false,false]"&&f.bejelentes.length===2,"egy 88-as izgalmú meccs kettőt nyit, és be is jelenti",f.bejelentes);
  ok(JSON.stringify(f.l96)==="[true,true,true,true,true]"&&f.nyitottValasztas==="legenda","96-nál mind nyitva, a választott szól",f);

  /* ---- 2. NÉZETT MECCS ---- */
  console.log("\n— 2. NÉZETT MECCS: LELÁTÓ + 25%-OS ZENE —");
  const m=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const r={};identState().lelato="katlan";
    r.elotte={duck:_hangZeneDuck,zeneKell:hangZeneKell()};
    S.auto=false;matchSpeed=0.5;S.halftimeSubs=false;S.unavailable={};S.lastMatch=null;
    try{utoLancVege();mEloTorol();}catch(e){}
    playMatch();
    for(let i=0;i<60&&!(_lelato&&_lelato.src);i++)await varj(100);
    await varj(700);
    r.kozben={fut:!!(_lelato&&_lelato.src),k:_lelato&&_lelato.k,duck:_hangZeneDuck,zeneKell:hangZeneKell(),
      zeneSzol:!!_hangZene,zeneGain:+_hangBus.zene.gain.value.toFixed(3),zajGain:+_hangBus.zaj.gain.value.toFixed(3),nezett:hangMeccsNezett()};
    await varj(2200);   /* a beúszás (2,2 mp) végigér */
    /* A MÉRÉS IDEJÉRE a futó meccs saját reakciói (egy valódi gól, egy kapott
       gól) nem szólhatnak bele: terhelt gépen a meccs gyorsabban halad, és egy
       épp lecsengő hullám (vagy egy kapott gól utáni elcsendesedés) elrontotta
       a mérést. A mérés előtt a moraj megnyugszik (két minta 0,01-en belül). */
    const _reag=lelatoReag;lelatoReag=function(){return false;};
    const gNow=()=>_lelato&&_lelato.g?_lelato.g.gain.value:0;
    /* A HANG-ÓRA SZERINT VÁRUNK, nem a falióra szerint (3.9.187): a görbék
       (setTargetAtTime) az AudioContext saját idején futnak, és terhelt gépen,
       a teljes regresszió közepén a fej nélküli böngésző hang-órája szinte
       megáll — 1,2 mp falióra alatt a hangerő 0,002-t mozdult. A nyugvás is
       és a gól utáni minta is HANG-másodpercben mér. */
    const aNow=()=>_hangCtx?_hangCtx.currentTime:0;
    const hangVarj=async(sec,max)=>{const t0=aNow();for(let i=0;i<(max||200)&&aNow()-t0<sec;i++)await varj(50);};
    /* NEM ELÉG A STABILITÁS: egy korábbi valódi gól hulláma 6 hang-másodpercig
       a csúcson TART (lelatoHullam), ami „stabilnak" látszik — és onnan a mért
       gól ugyanarra a csúcsra céloz, tehát nem nő. Az alapszint közelébe várunk. */
    const alap=()=>{try{return lelatoSzint();}catch(e){return 0;}};
    for(let i=0;i<80;i++){const a=gNow();await hangVarj(0.3);
      if(Math.abs(gNow()-a)<0.01&&(!(alap()>0)||gNow()<=alap()*1.1))break;}
    const g0=gNow();
    r.gol=_reag("gol");
    const minta=[];for(let i=0;i<8;i++){await hangVarj(0.15);minta.push(+gNow().toFixed(3));}
    lelatoReag=_reag;
    r.g0=+g0.toFixed(3);r.minta=minta;
    r.golUtan=Math.max(...minta)>g0*1.25;
    for(let i=0;i<600&&!S.lastMatch;i++)await varj(50);
    await varj(2600);
    r.utana={fut:!!_lelato,duck:_hangZeneDuck,nezett:hangMeccsNezett()};
    return r;});
  ok(m.kozben.fut&&m.kozben.k==="katlan"&&m.kozben.nezett,"nézett meccs közben a választott lelátó szól",m.kozben);
  ok(m.kozben.duck===.25&&m.kozben.zeneKell&&m.kozben.zeneSzol,"a zene nem hallgat el: 25%-on megy tovább",m.kozben);
  ok(m.gol&&m.golUtan,"a gól a lelátót is megmozdítja (a moraj felerősödik)",{gol:m.gol,elotte:m.g0,utana:m.minta});
  ok(!m.utana.fut&&m.utana.duck===1,"a lefújás után a lelátó elhallgat, a zene visszaáll 100%-ra",m.utana);

  /* ---- 3. VÉGIGJÁTSZÁS ---- */
  console.log("\n— 3. VÉGIGJÁTSZÁS —");
  const a=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    try{utoLancVege();mEloTorol();}catch(e){}
    S.auto=true;S.unavailable={};S.lastMatch=null;
    const i0=S.idx;playMatch();
    let volt=false;
    for(let i=0;i<200&&S.idx===i0;i++){await varj(25);if(_lelato)volt=true;}
    S.auto=false;await varj(800);
    return {volt,duck:_hangZeneDuck};});
  ok(!a.volt,"végigjátszásnál nincs lelátó",a);

  /* ---- 5. AZ ARCULAT MENÜ ---- */
  console.log("\n— 5. ARCULAT → A LELÁTÓ HANGJA —");
  const u=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    for(let i=0;i<6;i++){const x=document.getElementById("guideTipOk");if(x&&x.offsetParent)x.click();await varj(50);}
    msT().exciteMax=86;identState().lelato="vasarnap";
    openHubMidSeason();await varj(200);
    identOpenPanel();await varj(200);
    const sec=document.getElementById("identLelato");
    const r={van:!!sec,cim:sec&&sec.querySelector(".identSecH").textContent};
    const k=[...sec.querySelectorAll(".lelatoKartya")];
    r.kartyak=k.map(x=>({k:x.dataset.lelato,zar:x.classList.contains("zar"),sel:x.classList.contains("sel"),valaszt:!!x.querySelector("[data-lelato-val]")}));
    r.feltetel=k[3].querySelector(".lelatoFelt").textContent;
    sec.querySelector('[data-lelato-val="ultra"]').click();await varj(150);
    r.valasztva=identState().lelato;r.most=lelatoValasztott();
    r.selUj=!!document.querySelector('#identLelato .lelatoKartya.sel[data-lelato="ultra"]');
    const pb=document.querySelector('#identLelato [data-lelato-proba="hazai"]');pb.click();await varj(900);
    r.proba=!!_lelatoProba;r.probaGomb=pb.disabled;
    r.mentve=(()=>{try{saveGame();const d=JSON.parse(localStorage.getItem(saveKey()));return d.S&&d.S.ident&&d.S.ident.lelato;}catch(e){return "hiba:"+e.message;}})();
    return r;});
  ok(u.van&&/7 · A lelátó hangja/.test(u.cim),"az Arculat menüben: „7 · A lelátó hangja”",u.cim);
  ok(u.kartyak.length===5&&JSON.stringify(u.kartyak.map(x=>x.zar))==="[false,false,false,true,true]","öt kártya; 86-os csúcsnál a Katlan és a Legendás éjszaka zárva",u.kartyak);
  ok(u.kartyak[3].valaszt===false&&/92/.test(u.feltetel),"a zártnál nincs választó gomb, a feltétel ki van írva",u.feltetel);
  ok(u.valasztva==="ultra"&&u.most==="ultra"&&u.selUj,"a választás azonnal érvényes",u);
  ok(u.mentve==="ultra","a választás a mentésbe kerül (az arculat része)",u.mentve);
  ok(u.proba&&u.probaGomb,"a belehallgatás szól",u);
  if(OUT){await p.evaluate(()=>document.getElementById("identLelato").scrollIntoView({block:"start"}));await p.waitForTimeout(300);
    await p.screenshot({path:OUT+"/lelato-arculat.png"});}

  /* ---- 6. A HANG BEÁLLÍTÁSAI ---- */
  console.log("\n— 6. A HANG BEÁLLÍTÁSAI —");
  const h=await p.evaluate(()=>{
    const html=hangBeallHtml();
    const d=document.createElement("div");d.innerHTML=html;
    return {kapcsolo:!!d.querySelector("#hangLelato"),hangero:!!d.querySelector("#hangLelatoVol"),szoveg:/25%/.test(d.textContent)};});
  ok(h.kapcsolo&&h.hangero&&h.szoveg,"a Hang beállításai közt: lelátó ki/be, hangerő, és a 25%-os zene leírása",h);

  console.log("\n— 7. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
