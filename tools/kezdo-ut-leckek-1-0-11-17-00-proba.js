/* 🧭 1.0.11.17.00 — KEZDŐ ÚT, 3. FÁZIS: A LECKÉK + A „KEZDŐ BOT"
   KÉRÉS: „…ha valami kinyílik, egy rövid lecke […] képernyőképekkel megmutatjuk,
   hogy na itt akkor ezt kell csinálni." + docs/kezdo-ut-roadmap.md 6.4, 7.1, 8, 10, 12.
   Amit mér:
     1. minden lecke legfeljebb 4 lépés, a hivatkozott elemek léteznek, minden
        nyitó szakasznak (és a piacnak) van leckéje, a „Csináld" csak
        visszafordítható műveletet kér;
     2. a kártyáról indított első lecke: Mutasd (kiemelés + arany keret) → …
        → Csináld (vár; a jelre „Kész") → Összegzés; a lecke „látott" lesz;
     3. a nyitás-ablak „Mutasd meg →" gombja a szakasz leckéjét indítja;
     4. a HUB-on kívül a lecke kis sávvá húzódik a modális ablakok alá, és a
        HUB-on folytatódik;
     5. ☰ Menü → 🧭 Vezetés: a Kezdő út ki/be kapcsolható, a leckék újranézhetők;
     6. KEZDŐ BOT: egy teljes első idény TÉTLENÜL (végigjátszás, egyetlen
        feladat nélkül) — a 30. fordulóra a 0–5. szakasz mind lezárul, minden
        első idényes funkció kinyílik, csak a 2. idényes (akadémia, kupa) zárt;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9277;
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
  /* 1. a leckék szerkezete */
  const r1=await p.evaluate(()=>{
    const BIZTONSAGOS=["view:formation","view:tactics","view:midrole","view:analysis","view:budget","set:training","set:bond","set:dial"];
    const hiba=[];
    Object.keys(KUT_LECKE).forEach(id=>{const L=KUT_LECKE[id];
      /* 1.0.11.21.00: az „Első tizenegy" vezetett túra — a 4 lépéses korlát a nyitás-leckékre szól */
      if(L.l.length>4&&!L.vezetett)hiba.push(id+": "+L.l.length+" lépés");
      L.l.forEach((st,i)=>{
        if(!["kep","mutasd","csinald","osszeg","katt"].includes(st.t))hiba.push(id+"/"+i+": típus "+st.t);
        /* 1.0.11.22.00: a panelek belső gombjai (pl. az edző lapjáé) csak a panel megnyitásakor születnek */
        const DINAMIKUS=["edzoElemzesBtn","edzoElemBody","edzoElemOk","trAjanlBox","trAjanlBtn","trainEloBox","btAjanlBox","btAjanlBtn","unlockOkBtn"];   /* 1.0.12.2.00: az ajánlás-dobozok és a felfedezés gombja is */
        if(st.el&&!document.getElementById(st.el)&&!DINAMIKUS.includes(st.el))hiba.push(id+"/"+i+": nincs #"+st.el);
        (st.kep||[]).forEach(k=>{if(!document.getElementById(k))hiba.push(id+"/"+i+": nincs kép #"+k);});
        if(st.t==="csinald"&&!BIZTONSAGOS.includes(st.var))hiba.push(id+"/"+i+": nem biztonságos jel "+st.var);
        if(!kutLeckeSzov(st.c)||!kutLeckeSzov(st.x))hiba.push(id+"/"+i+": üres szöveg");});});
    const nyito=KUT_SZAKASZ.filter(sz=>sz.nyit.length).map(sz=>sz.id).filter(id=>!KUT_LECKE[id]);
    if(!KUT_LECKE.piac)nyito.push("piac");
    return {hiba,hianyzo:nyito,db:Object.keys(KUT_LECKE).length};});
  /* 1.0.11.19.00: +2 stílus-lecke (a döntés előtt és után) */
  ok(!r1.hiba.length&&!r1.hianyzo.length&&r1.db===22,"1. 22 lecke (1.0.12.9.00: + a kupák és a szezon vége; 1.0.11.22.01: + a talizmán-húzás; 1.0.12.1.00: + a 6 jutalom-képernyő; 1.0.12.2.00: + a scout-felfedezés; 1.0.12.5.00: + a kihívások; 1.0.12.7.00: + a csapategyensúly), mind ≤ 4 lépés, létező elemekre mutat; minden nyitásnak van leckéje; a „Csináld” csak visszafordítható",r1);
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();
    for(const id of ["guideTipOk","guideTipOff"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  await p.waitForTimeout(400);
  /* 2. az első lecke (1.0.11.21.00 óta magától indul, és a valódi elemekre koppintva halad) */
  await p.waitForTimeout(2500);
  const r2a=await p.evaluate(()=>{
    const o={auto:_kutL&&_kutL.id};
    if(!_kutL){const g=document.querySelector('#hubKutKartya [data-kut="lecke:elso11"]');o.gomb=!!g;if(g)g.click();}
    o.cim=document.querySelector("#kutLecke .kutLCim").textContent;o.lepes=document.querySelector("#kutLecke .kutLFej").textContent;return o;});
  await p.waitForTimeout(1300);
  const r2b=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    const d=document.getElementById("kutLDim"),fr=d.querySelector("b").getBoundingClientRect(),el=kutElsoSor().getBoundingClientRect();   /* 1.0.11.22.01: a kijelölés egy sor (a példa-játékosé) */
    const o={dim:!d.classList.contains("hide"),keret:Math.abs(fr.top-(el.top-5))<3&&Math.abs(fr.height-(el.height+10))<3};
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();o.c2=document.querySelector("#kutLecke .kutLCim").textContent;
    document.querySelector('#kutLecke [data-kl="tovabb"]').click();await w(900);
    o.c3=document.querySelector("#kutLecke .kutLCim").textContent;
    const v=document.querySelector(".kutCelVillog");o.villog=!!(v&&v.closest("#hubRoster"));
    o.nincsTovabbFo=!document.querySelector('#kutLecke .fo[data-kl="tovabb"]');
    if(v)v.click();await w(900);
    o.lap=plSheetOpen();o.c4=document.querySelector("#kutLecke .kutLCim")&&document.querySelector("#kutLecke .kutLCim").textContent;
    teachMidRoleMark();o.pipa=!!S.kut.kesz["elso11:megb"];
    document.querySelector('#kutLecke [data-kl="zar"]').click();
    o.zarva=!document.getElementById("kutLecke")&&!_kutL&&!document.querySelector(".kutCelVillog");
    plSheetClose();
    o.latta=!!(S.kut.lecke&&S.kut.lecke.elso11);return o;});
  ok(r2a.auto==="elso11"&&/A kereted/.test(r2a.cim)&&/1\/\d+/.test(r2a.lepes)&&r2b.dim&&r2b.keret&&/Csere/.test(r2b.c2)&&r2b.villog&&r2b.nincsTovabbFo&&r2b.lap&&/attribút/i.test(r2b.c4)&&r2b.pipa&&r2b.zarva&&r2b.latta,
    "2. az „Első tizenegy” magától indul: Mutasd (sötétítés + keret EGY soron, a képernyőn belül) → „katt” (a sor villog, a koppintás a lapot nyitja és léptet) → kihagyható; a lecke „látott”",Object.assign({},r2a,r2b));
  /* 3. a nyitás-ablak a leckét indítja */
  await p.evaluate(()=>{window._acLog=[];const _ac=askConfirm;window.askConfirm=function(o){window._acLog.push(o&&o.title);return _ac.apply(this,arguments);};
    kutJel("view:formation");kutJel("view:tactics");
    /* 1.0.11.22.00 — a 2. szakasz tanító céljai: gól, 3 lejátszott meccs, tempó-váltás */
    kutMeccsUtan(1,0);kutMeccsUtan(0,1);kutMeccsUtan(0,0);kutJel("set:tempo");
    document.getElementById("scHub").classList.remove("hide");S.idx=1;renderHub();});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const b=document.getElementById("mgmtOk");if(b&&b.offsetParent)b.click();const t=document.getElementById("guideTip");if(t)t.classList.add("hide");});
  await p.waitForTimeout(2500);
  /* 1.0.12.2.00: a szakasz vége saját, nagy ablak (#kutKeszModal) — a régi kérdés-ablak helyett */
  const r3=await p.evaluate(()=>{const m=document.getElementById("kutKeszModal");
    const o={modal:!!(m&&!m.classList.contains("hide")),cim:m?m.querySelector(".kkCim").textContent+" "+((m.querySelector(".kkAl")||{}).textContent||""):""};
    if(o.modal)m.querySelector('[data-kk="i"]').click();
    o.dbg={ac:window._acLog,sz:S.kut.sz,uj:JSON.stringify(S.kut.uj),kl:_kutL&&_kutL.id,mas:kutMasAblak(),kesz:JSON.stringify(S.kut.kesz)};
    o.lecke=_kutL&&_kutL.id;o.lcim=document.querySelector("#kutLecke .kutLCim")&&document.querySelector("#kutLecke .kutLCim").textContent;return o;});
  ok(r3.modal&&/Szakasz teljesítve|kinyílt/i.test(r3.cim)&&r3.lecke==="meccsek"&&/edzésterv/i.test(r3.lcim),"3. a „🔓 Kinyíltak” ablak „Mutasd meg →” gombja a szakasz leckéjét indítja (Edzés és összhang)",r3);
  /* 4. másik ablak alatt: kis sáv a modális ablakok alatt (1.0.11.22.00: a vezetett lecke a menü-lépésnél) */
  const r4=await p.evaluate(()=>{const o={lepes:_kutL&&_kutL.i};
    askConfirm({title:"Próba-ablak",html:"x"});return o;});
  await p.waitForTimeout(800);
  const r4b=await p.evaluate(()=>{const box=document.getElementById("kutLecke");const o={sav:box.classList.contains("var"),z:getComputedStyle(box).zIndex,dim:document.getElementById("kutLDim").classList.contains("hide")};
    document.getElementById("hubTacticConfirmNo").click();return o;});
  await p.waitForTimeout(800);
  const r4c=await p.evaluate(()=>{const box=document.getElementById("kutLecke");return {sav:box&&box.classList.contains("var"),villog:!!document.querySelector(".kutCelVillog")};});
  ok(r4.lepes===0&&r4b.sav&&+r4b.z<90&&r4b.dim&&!r4c.sav&&r4c.villog,"4. másik ablak alatt a lecke kis sáv a modális ablakok alatt (z < 90); utána teljes lappal folytatódik, a cél villog",Object.assign({},r4,r4b,{vissza:r4c}));
  await p.evaluate(()=>kutLeckeZar());
  /* 5. a Vezetés menü */
  const r5=await p.evaluate(()=>{const o={};
    hubMenuToggle(true);const g=document.querySelector('#hubActions .hubGroup[data-acc="teach"]');
    if(g&&g.querySelector(".accBody").classList.contains("hide"))hubAccToggle(g);
    o.panel=!!document.getElementById("kutPanel");o.lista=[...document.querySelectorAll("#kutPanel [data-kutlecke]")].map(b=>b.dataset.kutlecke);
    o.zartElotte=!kutNyitva("boost");
    document.getElementById("kutBeKi").click();o.ki=!!S.kut.mind&&kutNyitva("boost");
    document.getElementById("kutBeKi").click();o.be=!S.kut.mind&&!kutNyitva("boost");
    document.querySelector('#kutPanel [data-kutlecke="elso11"]').click();o.ujra=_kutL&&_kutL.id;kutLeckeZar();
    return o;});
  ok(r5.panel&&r5.lista.includes("elso11")&&r5.lista.includes("meccsek")&&r5.zartElotte&&r5.ki&&r5.be&&r5.ujra==="elso11",
    "5. ☰ Menü → 🧭 Vezetés: a Kezdő út ki- és visszakapcsolható, a leckék innen újranézhetők",r5);
  /* 6. KEZDŐ BOT — egy teljes első idény, tétlenül */
  const r6=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.kut={v:1,tudas:"kezdo",sz:0,kesz:{},nyit:{},uj:[],zs:0,vt:0,mutatott:{}};
    S.seasonNumber=1;S.idx=0;
    const t0=Date.now();
    S.auto=true;S.unavailable={};
    startRound();
    for(let i=0;i<40000&&S.idx<30;i++)await varj(15);
    S.auto=false;await varj(1500);
    const o={idx:S.idx,ido:Math.round((Date.now()-t0)/1000)};
    kutErtekel();
    o.sz=S.kut.sz;o.cim=KUT_SZAKASZ[S.kut.sz]&&KUT_SZAKASZ[S.kut.sz].id;
    o.nyitva=Object.keys(KUT_FUNKCIO).filter(f=>kutNyitva(f));
    o.zart=Object.keys(KUT_FUNKCIO).filter(f=>!kutNyitva(f));
    o.feladat=Object.keys(S.kut.kesz).length;
    return o;});
  ok(r6.idx>=30&&r6.sz===6&&r6.cim==="filozofia"&&r6.zart.length===2&&r6.zart.includes("akademia")&&r6.zart.includes("euro"),
    "6. KEZDŐ BOT: a tétlenül végigjátszott első idény után a 0–5. szakasz lezárult (a filozófia-szakasz következik), minden első idényes funkció nyitva, csak az akadémia és a kupa vár",r6);
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
