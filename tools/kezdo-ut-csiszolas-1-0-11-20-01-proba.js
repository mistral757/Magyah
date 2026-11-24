/* 🧭 1.0.11.20.01 — KEZDŐ ÚT, 7. FÁZIS: CSISZOLÁS
   KIMONDOTT KÉRÉSEK: „ez a képernyő teljesen kerüljön ki az egyenletből […]
   Karrier indításkor egyből ezen belül legyünk már" (a módválasztó lap) ·
   „Az edző ajánlatában ne legyen ott a rating. Azt ugyanis nem tudhatja a
   játékos ekkor még semmilyen módon. Ő csak POT-ot láthat max."
   Amit mér:
     1. „Karrier indítása" → egyenesen a gyors indító (nincs módválasztó);
        a gyors indító „Vissza" gombja a kezdőlapra visz (nem pattan vissza);
        az egyedül maradt módválasztóból is a gyors indító lesz; az 1v1 érintetlen;
     2. a draft: az edző tippje sehol nem említ Ratinget; felmérés előtt senkit
        nem emel ki (általános tanács a lista tetején); felmérés után a felmértek
        közül a legmagasabb POT-ú kapja, a POT-becsléssel;
     3. az újdonság-értesítés a Kezdő út zárt funkciójáról nem szól — a nyitás
        után igen;
     4. a feladatok felszólító módban; a funkciónevek nyelvileg rendben;
     5. 360 px-en, pixel témában a Kezdő út kártyája és a lecke lapja nem lóg ki;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9286;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  const errs=[];
  const uj=async()=>{const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);return p;};
  const indit=async p=>{
    await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
    await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
    await p.waitForTimeout(2500);};
  const lat=`(()=>{const v=id=>{const e=document.getElementById(id);return !!(e&&!e.classList.contains("hide"));};return {home:v("mpEntry"),mode:v("scModeSelect"),quick:v("scQuick"),setup:v("scFormation")};})()`;
  /* 1. a módválasztó */
  {const p=await uj();
   const a0=await p.evaluate(lat);
   await indit(p);
   const a1=await p.evaluate(lat);
   await p.evaluate(()=>document.getElementById("qkBackBtn").click());await p.waitForTimeout(1500);
   const a2=await p.evaluate(lat);
   await p.evaluate(()=>{document.querySelectorAll('section[id^="sc"]').forEach(x=>x.classList.add("hide"));document.getElementById("mpEntry").classList.add("hide");document.getElementById("scModeSelect").classList.remove("hide");});
   await p.waitForTimeout(900);
   const a3=await p.evaluate(lat);
   await p.close();
   const q=await uj();
   await q.evaluate(()=>document.getElementById("mpDuelBtn").click());await q.waitForTimeout(1500);
   const a4=await q.evaluate(lat);await q.close();
   ok(a0.home&&!a1.mode&&a1.quick&&a2.home&&!a2.quick&&!a3.mode&&a3.quick&&a4.home&&!a4.quick&&!a4.setup,
     "1. „Karrier indítása” → egyenesen a gyors indító; a „Vissza” a kezdőlapra (nem pattan vissza); az egyedül maradt módválasztóból is a gyors indító; az 1v1 érintetlen",{betoltes:a0,indit:a1,vissza:a2,egyedul:a3,egyegy:a4});}
  /* 2. a draft: az edző tippje */
  {const p=await uj();await indit(p);
   await p.evaluate(()=>document.getElementById("qkGoBtn").click());await p.waitForTimeout(2500);
   await p.evaluate(()=>{const b=document.getElementById("scoutSpinBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(2500);
   await p.evaluate(()=>{const b=document.getElementById("scoutNextBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(1500);
   await p.evaluate(()=>{const b=document.getElementById("spinBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(2500);
   const d0=await p.evaluate(()=>{const t=document.querySelectorAll("#squadList .kutTipp");const L=document.getElementById("squadList");
     return {db:t.length,tx:t[0]&&t[0].textContent,elol:!!(t[0]&&L.firstChild===t[0])};});
   /* egy választható jelölt felmérése a saját gombjával */
   const d1=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
     const gombok=[...document.querySelectorAll("#squadList button")].filter(b=>/Felmérés — nézzük meg a POT-jét/.test(b.textContent)&&!b.disabled);
     const sor=gombok.find(b=>{const r=b.closest(".cand,.row,li,div");return true;});
     if(!sor)return {nincsGomb:true};
     sor.click();await varj(300);
     const t=document.querySelectorAll("#squadList .kutTipp");
     return {db:t.length,tx:t[0]&&t[0].textContent,elol:!!(t[0]&&document.getElementById("squadList").firstChild===t[0])};});
   ok(d0.db===1&&d0.elol&&!/Rating/i.test(d0.tx)&&/mérd fel/.test(d0.tx)&&d1.db===1&&!d1.elol&&!/Rating/i.test(d1.tx)&&/POT-ja \(~\d+\)/.test(d1.tx),
     "2. az edző tippje Rating nélkül: felmérés előtt általános tanács a lista tetején, felmérés után a felmért jelölt kapja a POT-becsléssel",{elotte:d0,utana:d1});
   await p.close();}
  /* 3–5: a HUB-ban */
  const p=await uj();
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

  const r3=await p.evaluate(()=>{
    const t=teachStateObj();t.ujInit=1;t.uj={};t.ujOff=0;
    window.scoutCelNyitva=()=>true;window.ujKapu=()=>true;
    const elso=kutNyitva("scoutcel");
    _ujLat=Date.now()-5000;ujTick();
    const zartan=(t.uj.scoutcel||[]).length;
    S.kut.nyit.scoutcel=1;
    _ujLat=Date.now()-5000;ujTick();
    const nyitva=(t.uj.scoutcel||[]).length;
    /* minden olyan figyelő, amelynek horgonya Kezdő út-gomb, a megfelelő funkcióhoz van kötve */
    const hiany=UJ_FIGY.filter(w=>w.a).filter(w=>{const f=Object.keys(KUT_FUNKCIO).find(k=>KUT_FUNKCIO[k].el.indexOf(w.a)>=0);return f&&UJ_KUT[w.k]!==f;}).map(w=>w.k);
    return {elso,zartan,nyitva,hiany};});
  ok(r3.elso===false&&r3.zartan===0&&r3.nyitva===1&&!r3.hiany.length,"3. az újdonság-értesítés a Kezdő út zárt funkciójáról nem szól, a nyitás után igen; minden Kezdő út-gombhoz kötött figyelő kapuzva",r3);
  const r4=await p.evaluate(()=>{const fel=[];KUT_SZAKASZ.forEach(sz=>sz.fel.forEach(f=>fel.push(f.t)));
    const rossz=fel.filter(t=>/^(\d|Egy |Még egy )/.test(t));
    return {rossz,nev:KUT_FUNKCIO.edzo.n,nemcsak:KUT_SZAKASZ.find(x=>x.id==="lelek").edzo.indexOf("nemcsak")>=0};});
  ok(!r4.rossz.length&&r4.nev==="Az edző és a meccs előtti elemzés"&&r4.nemcsak,"4. a feladatok felszólító módban; a funkciónevek és a „nemcsak” rendben",r4);
  await p.setViewportSize({width:360,height:740});
  const r5=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    try{applyTheme("pixel");}catch(e){}
    ["hubTacticConfirmModal","guideTip"].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add("hide");});
    S.kut.uj=[];renderHub();await varj(400);
    const ki=()=>[...document.querySelectorAll("#hubKutKartya *,#kutLecke *")].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.right>innerWidth+0.5;}).length;
    const k1=ki();kutLeckeIndit("elso11");await varj(700);const k2=ki();kutLeckeZar();
    return {kartya:k1,lecke:k2,doc:document.documentElement.scrollWidth-innerWidth};});
  ok(r5.kartya===0&&r5.lecke===0&&r5.doc<=0,"5. 360 px-en, pixel témában a Kezdő út kártyája és a lecke lapja nem lóg ki",r5);
  ok(errs.length===0,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
