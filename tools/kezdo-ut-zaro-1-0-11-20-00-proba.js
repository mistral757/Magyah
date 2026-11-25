/* 🎓 1.0.11.20.00 — KEZDŐ ÚT, 6. FÁZIS: A VÉGE — záró ablak, jelvény, kutKesz, a következő karrier
   (docs/kezdo-ut-roadmap.md 6.4 „Kész vagy", 12. fejezet 6. fázis: „a második
   karrier »Játszottam már«-ral indul")
   Amit mér:
     1. minden szakasznak van „mit tanultál" sora; a záró ablak mind a 8-at és
        a piacot felsorolja;
     2. tiszta játékosnál a tudásszint alapja „Most kezdem";
     3. az út végén: a feloldás-naplóban kutKesz, a tudásszint „Játszottam
        már"-ra lép, és a következő karrier ezzel indul (kutUj);
     4. a HUB-on előbb az utolsó nyitás ablaka, utána — más ablakot megvárva —
        a záró ablak, egyszer;
     5. a záró ablak „📖 A leckék listája" gombja a leckék listáját nyitja;
     6. a profil fejlécében a jelvény;
     7. a kifejezett „Ismerem a játékot" nem íródik felül;
     8. „Mindent kinyitok" után nincs záró ablak és nincs jelvény;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9282;
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
    const t=document.getElementById("guideTip");if(t)t.classList.add("hide");
    document.getElementById("hubTacticConfirmModal").classList.add("hide");S.kut.uj=[];});
  /* 1. a „mit tanultál" sorok */
  const r1=await p.evaluate(()=>{const hiany=KUT_SZAKASZ.filter(x=>!x.tan).map(x=>x.id);
    const d=document.createElement("div");d.innerHTML=kutZaroHtml();return {hiany,li:d.querySelectorAll("li").length,n:KUT_SZAKASZ.length,piac:/átigazolás/i.test(d.textContent)};});
  ok(!r1.hiany.length&&r1.li===r1.n+1&&r1.piac,"1. minden szakasznak van „mit tanultál” sora; a záró ablak mind a "+r1.n+"-at és a piacot felsorolja",r1);
  /* 2. tiszta játékos */
  const r2=await p.evaluate(()=>{localStorage.removeItem(KUT_TUDAS_KEY);const u=unlockState();delete u.kutKesz;unlockSave();return {t:kutTudas(),runs:u.runs||0};});
  ok(r2.t==="kezdo","2. tiszta játékosnál (nincs lezárt karrier, nincs végigjárt út) a tudásszint alapja „Most kezdem”",r2);
  /* 3. az út vége */
  const r3=await p.evaluate(()=>{
    S.kut.sz=KUT_SZAKASZ.length-1;S.kut.uj=[];S.seasonNumber=3;S.idx=2;   /* 1.0.12.9.00: az utolsó szakasz (szezon vége) tartaléka a 61. forduló */
    try{const _s=window.saveGame;window.saveGame=()=>{};kutErtekel();window.saveGame=_s;}catch(e){}
    /* a piac (8. forduló) nyitása is a sorba került volna — itt csak az utolsó szakaszé marad */
    S.kut.uj=S.kut.uj.filter(x=>x.sz==="hosszu");
    const u=JSON.parse(localStorage.getItem(UNLOCK_KEY)||"{}");
    return {kesz:!!S.kut.kesz_ut,naplo:!!(u.kutKesz&&u.kutKesz.at),tudasKulcs:localStorage.getItem(KUT_TUDAS_KEY),t:kutTudas(),uj:(kutUj()||{}).tudas,nyit:S.kut.uj.length};});
  ok(r3.kesz&&r3.naplo&&r3.tudasKulcs==="halado"&&r3.t==="halado"&&r3.uj==="halado","3. az út végén a feloldás-naplóban kutKesz, a tudásszint „Játszottam már” — és a következő karrier ezzel indul",r3);
  /* 4. a HUB: előbb a nyitás, utána a záró ablak */
  await p.evaluate(()=>{document.getElementById("scHub").classList.remove("hide");renderHub();});
  /* a 2. idényre állítva egy feloldás-kártya is jön (a stílusé) — a nyitás-ablak megvárja; mi bezárjuk */
  for(let i=0;i<6;i++){await p.waitForTimeout(500);
    await p.evaluate(()=>{const b=document.getElementById("unlockCardBtn");if(b&&b.offsetParent)b.click();
      for(const id of ["guideTipOk","guideTipOff"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}});}
  await p.waitForTimeout(1800);
  const r4a=await p.evaluate(()=>({cim:document.getElementById("hubTacticConfirmTitle").textContent,lat:!document.getElementById("hubTacticConfirmModal").classList.contains("hide")}));
  /* a nyitás ablakát „Később"-rel zárjuk; közben egy tipp van kint — a záró ablaknak meg kell várnia */
  await p.evaluate(()=>{document.getElementById("hubTacticConfirmNo").click();const t=document.getElementById("guideTip");if(t)t.classList.remove("hide");renderHub();});
  await p.waitForTimeout(2200);
  const r4b=await p.evaluate(()=>({lat:!document.getElementById("hubTacticConfirmModal").classList.contains("hide"),zaro:!!S.kut.zaro}));
  await p.evaluate(()=>{document.getElementById("guideTip").classList.add("hide");});
  await p.waitForTimeout(2200);
  const r4c=await p.evaluate(()=>({cim:document.getElementById("hubTacticConfirmTitle").textContent,lat:!document.getElementById("hubTacticConfirmModal").classList.contains("hide"),zaro:!!S.kut.zaro,
    jelveny:/jelvénye/.test(document.getElementById("hubTacticConfirmBody").textContent)}));
  ok(r4a.lat&&/Kinyíl/.test(r4a.cim)&&!r4b.lat&&!r4b.zaro&&r4c.lat&&/Végigjártad/.test(r4c.cim)&&r4c.zaro&&r4c.jelveny,
    "4. a HUB-on előbb az utolsó nyitás ablaka, utána — a kint lévő tippet megvárva — a záró ablak",{elotte:r4a,varakozik:r4b,zaro:r4c});
  /* 5. a leckék gombja; és csak egyszer */
  const r5=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    document.getElementById("kutZaroLeckek").click();await varj(200);
    const o={lista:document.getElementById("hubTacticConfirmTitle").textContent,db:document.querySelectorAll("#hubTacticConfirmModal [data-kutlecke]").length};
    document.getElementById("hubTacticConfirmModal").classList.add("hide");
    renderHub();await varj(2200);
    o.ujra=!document.getElementById("hubTacticConfirmModal").classList.contains("hide");return o;});
  ok(/leckéi/.test(r5.lista)&&r5.db>=8&&!r5.ujra,"5. a „📖 A leckék listája” a leckék listáját nyitja; a záró ablak csak egyszer jön",r5);
  /* 6. a profil */
  const r6=await p.evaluate(()=>{try{renderProfileModal(null);}catch(e){return {hiba:String(e)};}
    const t=(document.getElementById("profileBody")||{}).textContent||"";return {jelveny:/Kezdő út — végigjárva/.test(t)};});
  ok(r6.jelveny,"6. a profil fejlécében a „🧭 Kezdő út — végigjárva” jelvény",r6);
  /* 7. a kifejezett „Ismerem" marad */
  const r7=await p.evaluate(()=>{localStorage.setItem(KUT_TUDAS_KEY,"profi");kutKeszRogzit();return {t:localStorage.getItem(KUT_TUDAS_KEY),n:unlockState().kutKesz.n};});
  ok(r7.t==="profi"&&r7.n===2,"7. a kifejezett „Ismerem a játékot” nem íródik felül (a napló számlálja a második végigjárást)",r7);
  /* 8. „Mindent kinyitok" */
  const r8=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const u=unlockState();delete u.kutKesz;unlockSave();
    S.kut={v:1,tudas:"kezdo",sz:2,kesz:{},nyit:{},uj:[],zs:0,vt:0,mutatott:{},mind:1};S.seasonNumber=2;S.idx=10;
    document.getElementById("hubTacticConfirmModal").classList.add("hide");
    renderHub();await varj(2000);
    return {ablak:!document.getElementById("hubTacticConfirmModal").classList.contains("hide"),kesz:!!unlockState().kutKesz,jelveny:kutJelvenyHtml()};});
  ok(!r8.ablak&&!r8.kesz&&!r8.jelveny,"8. „Mindent kinyitok” után nincs záró ablak és nincs jelvény",r8);
  ok(errs.length===0,"9. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
