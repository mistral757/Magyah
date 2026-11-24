/* ⚖️ 1.0.11.18.00 — KEZDŐ ÚT, 4. FÁZIS: AZ ERŐMÉRLEG ÉS A GAZDASÁGI VISSZATEKINTŐ
   (docs/kezdo-ut-roadmap.md 7.1 — „Tartós segítők")
   Amit mér:
     1. a Kezdő úton az erőmérleg a „Mérleg" szakaszig rejtve, utána látszik;
     2. a zónák a MOST ELVÁRT réshez (1. idény: rajt-cél → célrés útja) és a
        holtsávhoz mérve: zöld / sárga / piros; a sárga megmondja, ki veszi el a
        többletet (1. idényben a téli felmérés, a 2.-tól a rés-követés);
     3. nyáron nincs szín, a rajt-célt mondja;
     4. egy végigjátszott idény: a pillanatkép (nyitó és záró meccserő, mezőny)
        megvan, és a szezonzáró jelentésben ott a gazdasági visszatekintő;
     5. a visszatekintő a főkönyvből bont (erősítés / fejlesztés / bér /
        bevétel), és a zárórés szerint tanít (elhúztál / alatta / egyensúly);
     6. mentés és betöltés viszi az S.gazd-ot; az új karrier nullázza;
     7. a „Mérleg" lecke 2. lépése az erőmérlegre mutat;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9279;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
  /* karrier a HUB-ig (a draft és az osztályválasztó gyors útja) */
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
    window._ajanlat=0;const _sco=showChallengeOffers;window.showChallengeOffers=function(){window._ajanlat++;return _sco.apply(this,arguments);};
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window._saveEredeti=saveGame;window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();
    for(const id of ["guideTipOk","guideTipOff"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  /* 1. a Kezdő út kapuja */
  const r1=await p.evaluate(()=>{const v=()=>{const e=document.getElementById("hubEromerleg");return !!(e&&!e.classList.contains("hide")&&e.textContent.trim());};
    const o={nfOn:nfOn(),zart:!kutNyitva("boost")};renderHub();o.elotte=v();
    S.kut.nyit.boost=1;renderHub();o.utana=v();return o;});
  ok(r1.nfOn&&r1.zart&&!r1.elotte&&r1.utana,"1. a Kezdő úton az erőmérleg a „Mérleg” szakaszig rejtve, utána a büdzsé alatt látszik",r1);
  /* 2. a zónák */
  const r2=await p.evaluate(()=>{
    const H=pyrFloorHist(),sn=S.seasonNumber||1,r=H[sn];
    r.want=2;r.cel=4;delete r.kov;delete r.midDone;S.idx=15;
    const _lg=window.levelGap,o={};
    const zona=g=>{window.levelGap=()=>g;renderHub();const A=eromerlegAllapot();return {z:A.z,elv:A.elv,tx:document.getElementById("hubEromerleg").textContent};};
    o.zold=zona(4.6);o.sarga=zona(6.2);o.piros=zona(2.0);
    r.kov={v:1,rajt:2,dgB:4,tur:0,emel:[],ad:0,adDb:0,g:{}};
    o.kovSarga=zona(6.2);
    delete r.kov;window.levelGap=_lg;return o;});
  ok(r2.zold.elv===4&&r2.zold.z==="zold"&&/🟢/.test(r2.zold.tx)&&r2.sarga.z==="sarga"&&/téli felmérés/.test(r2.sarga.tx)&&/ne költs/.test(r2.sarga.tx)
    &&r2.piros.z==="piros"&&/🔴/.test(r2.piros.tx)&&/leggyengébb/.test(r2.piros.tx)&&r2.kovSarga.z==="sarga"&&/rés-követés/.test(r2.kovSarga.tx),
    "2. a zónák a most elvárt réshez (+2 → +4 → +6 út, a 15. fordulóban +4) és a ±1,5 holtsávhoz: zöld · sárga (1. idény: téli felmérés · 2.-tól: rés-követés) · piros",
    {zold:r2.zold.z,sarga:r2.sarga.tx.slice(0,160),kov:r2.kovSarga.tx.slice(0,170),piros:r2.piros.z});
  /* 3. nyár */
  const r3=await p.evaluate(()=>{S.seasonHistory=(S.seasonHistory||[]).concat([{season:S.seasonNumber||1}]);renderHub();
    const A=eromerlegAllapot(),tx=document.getElementById("hubEromerleg").textContent;S.seasonHistory.pop();renderHub();return {mod:A.mod,tx:tx.slice(0,150)};});
  ok(r3.mod==="nyar"&&/nyár/.test(r3.tx)&&/rajt-cél/.test(r3.tx),"3. nyáron nincs szín: a rajt-célt és a célrést mondja",r3);
  await p.evaluate(()=>{S.idx=1;renderHub();document.getElementById("hubEromerleg").scrollIntoView({block:"center"});});
  await p.waitForTimeout(300);await p.screenshot({path:(process.env.KEPDIR||"/tmp")+"/eromerleg.png"}).catch(()=>{});
  /* 4. egy végigjátszott idény */
  const r4=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.idx=0;S.gazd=null;S.kut.mind=1;
    S.auto=true;S.unavailable={};startRound();
    for(let i=0;i<40000&&S.idx<30;i++)await varj(15);
    S.auto=false;await varj(2500);
    /* a verdikt után a játékos lép tovább a szezonzáróba — itt mi */
    if(phase!=="hubreport"){try{hubShowSeasonReport();}catch(e){}await varj(1500);}
    const G=S.gazd||{};
    return {G,jelentes:/Gazdasági visszatekintő/.test(document.getElementById("hubSeasonReport").innerHTML)};});
  ok(r4.G.sn===1&&r4.G.ms0>0&&r4.G.ms1>0&&r4.G.mz0>0&&r4.G.mz1>0&&r4.G.i>=29&&r4.jelentes,"4. végigjátszott idény: a pillanatkép (nyitó és záró meccserő, mezőny) megvan, a szezonzáró jelentésben ott a gazdasági visszatekintő",r4);
  /* 5. a bontás és a tanulság */
  const r5=await p.evaluate(()=>{
    const tx=()=>gazdVisszaHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    S.ledger={v:LEDGER_V,rows:{1:{season:1,open:0,cats:{buy:3000,boost:1000,stadion:500,wage:800,fans:2000,season:5000}}}};
    const cel=nfCelFor(1),t=nfHoltsav();
    S.gazd={sn:1,ms0:80,mz0:80-cel,ms1:90,mz1:90-(cel+t+1),i:30};const fel=tx();
    S.gazd={sn:1,ms0:80,mz0:80-cel,ms1:84,mz1:84-(cel-t-1),i:30};const ala=tx();
    S.gazd={sn:1,ms0:80,mz0:80-cel,ms1:84,mz1:84-cel,i:30};const egy=tx();
    return {fel:fel.slice(0,400),ala:/A mezőny alatt zártál/.test(ala),egy:/A célrés körül zártál/.test(egy),
      bont:/Erősítésre költöttél/.test(fel)&&/Igazolások/.test(fel)&&/Boostok/.test(fel)&&/Stadionbővítés/.test(fel)&&/bérre/.test(fel)&&/bevétel/.test(fel),
      elhuz:/Elhúztál a mezőnytől/.test(fel)};});
  ok(r5.bont&&r5.elhuz&&r5.ala&&r5.egy,"5. a visszatekintő a főkönyvből bont (erősítés · fejlesztés · bér · bevétel), és a zárórés szerint tanít: elhúztál / alatta / egyensúly",r5);
  /* 6. mentés, betöltés, új karrier */
  const r6=await p.evaluate(()=>{const o={};
    S.gazd={sn:2,ms0:81.5,mz0:79,b0:1234,ms1:85,mz1:82,i:12};
    window.saveGame=window._saveEredeti;try{if(!_saveLock)_saveLock=saveKey();}catch(e){}
    try{saveGameNow();}catch(e){o.hiba=String(e);}
    let raw=localStorage.getItem(saveKey())||"";if(mzIs(raw))raw=mzUnpack(raw);
    const d=JSON.parse(raw);o.mentve=!!(d.S.gazd&&d.S.gazd.ms0===81.5);
    S.gazd=null;applySavedGame(JSON.parse(raw));o.vissza=!!(S.gazd&&S.gazd.b0===1234);
    const regi=JSON.parse(raw);delete regi.S.gazd;applySavedGame(regi);o.regi=S.gazd===null;
    S.gazd={sn:1};const _s=window.saveGame;window.saveGame=()=>{};
    try{beginNewGame();}catch(e){}
    o.uj=S.gazd===null;window.saveGame=_s;return o;});
  ok(r6.mentve&&r6.vissza&&r6.regi&&r6.uj,"6. a mentés viszi az S.gazd-ot, a betöltés visszaadja, a régi mentés nélküle tölt; az új karrier nullázza",r6);
  /* 7. a lecke */
  const r7=await p.evaluate(()=>{const st=KUT_LECKE.merleg.l[1];return {t:st.t,el:st.el,van:!!document.getElementById(st.el),x:/erőmérleg/.test(kutLeckeSzov(st.c)+kutLeckeSzov(st.x))&&/célrés/.test(kutLeckeSzov(st.x))};});   /* 1.0.11.22.00: a szöveg lehet függvény (élő példa); 1.0.12.1.00: a szó a címben áll, a szöveg a célrést magyarázza */
  ok(r7.t==="mutasd"&&r7.el==="hubEromerleg"&&r7.van&&r7.x,"7. a „Erőforrás és a mezőny” lecke 2. lépése az erőmérlegre mutat",r7);
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
