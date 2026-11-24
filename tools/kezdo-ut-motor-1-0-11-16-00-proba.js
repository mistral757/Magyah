/* 🧭 1.0.11.16.00 — KEZDŐ ÚT, 2. FÁZIS (A MOTOR): fokozatosan nyíló HUB
   KÉRÉS: „a HUB funkciói fokozatosan nyíljanak ki kis célfeladatokkal […]
   az eddigi funkciókból semmit ne vegyünk el, de azokat képesek legyünk
   meghaladni, megtölteni, érthetőbbé tenni." + docs/kezdo-ut-roadmap.md.
   Amit mér:
     1. új karrierben (Most kezdem) van S.kut; a zárt funkciók gombjai rejtve,
        az alapok (felállás, taktika) látszanak; a Kezdő út kártya a HUB-on;
     2. a feladatok jelekből (gombnyomás) és meccseredményből pipálódnak;
        a szakasz lezárul, a következő szakasz funkciói kinyílnak;
     3. a nyitás-ünneplés megvárja a többi ablakot, aztán jön;
     4. a 8. fordulótól az átigazolási piac nyitva;
     5. a tartalék-forduló után az edző magától továbblép; az út a 2. idényben véget ér;
     6. „Mindent kinyitok": minden nyitva;
     7. mentés/betöltés: S.kut megmarad; régi mentés (S.kut nélkül) = minden nyitva;
     8. „Ismerem a játékot" (profi) → nincs Kezdő út;
     9. a kihívás-ajánlatok a „Szerencse és kockázat" szakaszig hallgatnak;
    10. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9275;
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
  /* 1. kapu + kártya */
  const r1=await p.evaluate(()=>{
    const v=id=>{const e=document.getElementById(id);return !!(e&&!e.classList.contains("hide")&&!e.classList.contains("kutZar"));};
    return {kut:!!S.kut&&S.kut.v===1,tudas:S.kut&&S.kut.tudas,sz:S.kut&&S.kut.sz,kartya:v("hubKutKartya"),
      edzes:v("hubTrainingBtn"),boost:v("hubBoostBtn"),buy:v("hubBuyBtn"),fab:v("hubInfoFab"),
      form:v("hubFormationBtn"),takt:v("hubTacticsBtn"),zart:kutZartDb(),
      feladat:document.querySelectorAll("#hubKutKartya .kutFel, #hubKutKartya li").length};});
  ok(r1.kut&&r1.tudas==="kezdo"&&r1.sz===0&&r1.kartya&&!r1.edzes&&!r1.boost&&!r1.buy&&!r1.fab&&r1.form&&r1.takt&&r1.zart>10,
    "1. új karrier: S.kut megvan; a zárt funkciók rejtve, a felállás és a taktika látszik; a kártya a HUB-on",r1);
  /* 2. jelek, meccs, szakaszváltás, kinyílás */
  const r2=await p.evaluate(()=>{
    const v=id=>{const e=document.getElementById(id);return !!(e&&!e.classList.contains("hide")&&!e.classList.contains("kutZar"));};
    const o={};
    document.getElementById("hubFormationBtn").click();
    o.form=!!S.kut.kesz["elso11:form"];
    kutJel("view:tactics");kutJel("view:midrole");
    o.sz1=S.kut.sz;
    /* 1.0.11.22.00 — a 2. szakasz tanító céljai: gól, 3 lejátszott meccs, tempó-váltás (eredménytől függetlenül) */
    kutMeccsUtan(1,0);o.ketMeccsUtan=S.kut.sz;kutMeccsUtan(0,2);kutMeccsUtan(0,0);o.haromMeccsUtan=S.kut.sz;
    kutJel("set:tempo");o.sz2=S.kut.sz;o.nyitEdzes=kutNyitva("edzes");o.nyitBoost=kutNyitva("boost");
    document.getElementById("hubFormationPicker").classList.add("hide");document.getElementById("scHub").classList.remove("hide");
    S.idx=1;renderHub();
    o.edzesGomb=v("hubTrainingBtn");o.uj=S.kut.uj.slice();
    return o;});
  ok(r2.form&&r2.sz1===1&&r2.ketMeccsUtan===1&&r2.haromMeccsUtan===1&&r2.sz2===2&&r2.nyitEdzes&&!r2.nyitBoost&&r2.edzesGomb&&r2.uj.length>=1,
    "2. a feladatok jelből és meccsből pipálódnak (a 2. szakasz: gól + 3 meccs + tempó — vereséggel is teljesíthető); a szakasz lezárul, az edzés és az összhang kinyílik (a boost még zárt)",r2);
  /* 3. az ünneplés megvárja a többi ablakot */
  /* 1.0.12.2.00: a szakasz vége saját, nagy ablak (#kutKeszModal) */
  const r3a=await p.evaluate(()=>{const m=document.getElementById("kutKeszModal");return {mas:kutMasAblak("#kutKeszModal"),modal:!!(m&&!m.classList.contains("hide"))};});
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();
    for(const id of ["guideTipOk","guideTipOff"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}});
  await p.waitForTimeout(3500);
  await p.evaluate(()=>{const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  await p.waitForTimeout(2200);
  const r3=await p.evaluate(()=>{const m=document.getElementById("kutKeszModal");const be=!!(m&&!m.classList.contains("hide"));
    return {modal:be,cim:be?m.textContent.slice(0,120):"",mutasd:be&&/Mutasd/.test((m.querySelector('[data-kk="i"]')||{}).textContent||"")};});
  ok((r3a.mas?!r3a.modal:true)&&r3.modal&&/Szakasz teljesítve|Kinyíl/i.test(r3.cim)&&r3.mutasd,"3. a nyitás-ünneplés (🔓 Kinyílt…, „Mutasd meg →”) a többi ablak után jön, nem rájuk",{elotte:r3a,utana:r3});
  await p.evaluate(()=>{document.getElementById("hubTacticConfirmModal").classList.add("hide");const m=document.getElementById("kutKeszModal");if(m)m.classList.add("hide");});
  /* 4–6: piac a 8. fordulótól, tartalék-továbblépés, vége, Mindent kinyitok */
  const r4=await p.evaluate(()=>{
    const o={};
    S.idx=7;kutErtekel();o.piac7=kutNyitva("piac");
    S.idx=8;kutErtekel();o.piac8=kutNyitva("piac");
    S.idx=13;kutErtekel();o.sz13=S.kut.sz;
    S.idx=31;S.seasonNumber=1;kutErtekel();o.sz31=S.kut.sz;
    S.seasonNumber=2;S.idx=6;kutErtekel();o.vege=S.kut.kesz_ut;o.akademia=kutNyitva("akademia");o.aktiv=kutAktiv();
    return o;});
  ok(!r4.piac7&&r4.piac8,"4. az átigazolási piac a 8. fordulótól nyitva (előtte zárt)",r4);
  ok(r4.sz13>=3&&r4.sz31===6&&r4.vege&&r4.akademia&&!r4.aktiv,"5. a tartalék-fordulók után az edző magától továbblép; a 2. idényben az út véget ér, minden nyitva",r4);
  const r6=await p.evaluate(()=>{
    S.kut={v:1,tudas:"kezdo",sz:0,kesz:{},nyit:{},uj:[],zs:0,vt:0,mutatott:{}};S.seasonNumber=1;S.idx=1;
    const o={zart:!kutNyitva("boost")};renderHub();
    document.querySelector('#hubKutKartya [data-kut="mind"]').click();
    const y=document.getElementById("hubTacticConfirmYes");if(y)y.click();
    o.mind=!!S.kut.mind;o.boost=kutNyitva("boost");o.euro=kutNyitva("euro");o.zartDb=document.querySelectorAll(".kutZar").length;
    o.kartya=(()=>{const e=document.getElementById("hubKutKartya");return !!(e&&!e.classList.contains("hide")&&e.offsetParent);})();
    return o;});
  ok(r6.zart&&r6.mind&&r6.boost&&r6.euro&&r6.zartDb===0&&!r6.kartya,"6. „Mindent kinyitok”: minden funkció nyitva, a kártya eltűnik",r6);
  /* 7. mentés / betöltés */
  const r7=await p.evaluate(()=>{
    const o={};
    S.kut={v:1,tudas:"kezdo",sz:2,kesz:{"fejlodes:edzes":1},nyit:{edzes:1,osszhang:1},uj:[],zs:0,vt:0,mutatott:{}};
    window.saveGame=window._saveEredeti;
    try{if(!_saveLock)_saveLock=saveKey();}catch(e){}
    try{saveGameNow();}catch(e){o.hiba=String(e);}
    let raw=localStorage.getItem(saveKey())||"";if(mzIs(raw))raw=mzUnpack(raw);
    let d=null;try{d=JSON.parse(raw);}catch(e){}
    o.van=!!(d&&d.S&&d.S.kut&&d.S.kut.sz===2&&d.S.kut.nyit.edzes===1);
    if(d){
      S.kut=null;applySavedGame(JSON.parse(raw));
      o.vissza=!!(S.kut&&S.kut.sz===2&&kutNyitva("edzes")&&!kutNyitva("boost"));
      const regi=JSON.parse(raw);delete regi.S.kut;applySavedGame(regi);
      o.regi=S.kut===null&&kutNyitva("boost")&&kutNyitva("akademia")&&!kutAktiv();}
    return o;});
  ok(r7.van&&r7.vissza&&r7.regi,"7. a mentés viszi S.kut-ot, a betöltés visszaadja; régi mentés (S.kut nélkül) = minden nyitva",r7);
  /* 8. profi: nincs Kezdő út */
  const r8=await p.evaluate(()=>{const e=localStorage.getItem(KUT_TUDAS_KEY);
    localStorage.setItem(KUT_TUDAS_KEY,"profi");const pr=kutUj();
    localStorage.setItem(KUT_TUDAS_KEY,"halado");const ha=kutUj();
    if(e===null)localStorage.removeItem(KUT_TUDAS_KEY);else localStorage.setItem(KUT_TUDAS_KEY,e);
    return {profi:pr,halado:ha&&ha.tudas};});
  ok(r8.profi===null&&r8.halado==="halado","8. „Ismerem a játékot” → nincs Kezdő út; „Játszottam már” → van",r8);
  /* 9. a kihívás-ajánlatok */
  const r9=await p.evaluate(()=>{
    const o={indulo:window._ajanlat};
    gameMode="career";
    S.kut={v:1,tudas:"kezdo",sz:1,kesz:{},nyit:{},uj:[],zs:0,vt:0,mutatott:{}};S.seasonNumber=1;S.idx=10;
    S.euro=S.euro||{};S.euro._chalOffered=false;const _auto=S.auto;S.auto=false;
    let cb=0;window._ajanlat=0;cupChallengeOffer(()=>cb++);o.zartCb=cb;o.zartAjanlat=window._ajanlat;
    S.kut.mind=1;S.euro._chalOffered=false;cb=0;
    try{cupChallengeOffer(()=>cb++);}catch(e){}
    o.nyitAjanlat=window._ajanlat;
    S.auto=_auto;
    for(const s of document.querySelectorAll(".hubModal,[role=dialog]"))s.classList.add("hide");
    return o;});
  ok(r9.indulo===0&&r9.zartCb===1&&r9.zartAjanlat===0&&r9.nyitAjanlat===1,"9. a kezdő és a kupa kihívás-ajánlata a Kezdő úton hallgat; nyitás után megjelenik",r9);
  ok(errs.length===0,"10. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
