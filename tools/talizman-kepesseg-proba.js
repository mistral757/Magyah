/* 🎮 3.9.173 — A TALIZMÁN-KÉPESSÉGEK LÁTHATÓ HELYEN.

   BEJELENTETT KÉRÉS: „A talizmánok szezon közben aktiválható funkciói legyenek
   sokkal láthatóbb helyen. Most nagyon el vannak dugva. A talizmánoknál felül
   legyenek nagyban külön a te képességeid, amiket tudsz használni."

   Amit mér (valódi karrier, valódi Talizmánok menü):
     1. A „🎮 A te képességeid" blokk a menü TETEJÉN áll (a bal oszlop első
        eleme), és kártyát kap a Titkos fegyver, a Pénzfeldobás, a Tükörvilág
        és az irányra váró jellemhullám; a most használható világít és elöl áll.
     2. A kártya gombja ugyanazt teszi, mint eddig a lista gombja (a Titkos
        fegyver élesedik, a kártya „élesítve" állapotba vált, a gombja eltűnik).
     3. Az „Aktív alaphatások" listában nincs többé akciógomb (az égetésen
        kívül) — a sor felfelé mutat.
     4. A meccsképernyőn, a kezdőrúgás fölött gyorssáv mutatja a következő
        meccsre ható képességeket; koppintásra a menü a kártyánál nyílik.
     5. A HUB Talizmánok-gombja kiírja, hány képesség használható.
     6. Talizmán nélkül a blokk elmondja, mi fog ide kerülni.
     7. Nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9213;
const OUT=process.env.KEPOUT||"";
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900},deviceScaleFactor:OUT?2:1})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  /* egy valódi egyjátékos karrier (mentési zárral), szezonban */
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
  await p.waitForTimeout(700);
  const tisztit=()=>p.evaluate(async()=>{
    for(let i=0;i<6;i++){const x=document.getElementById("guideTipOk");if(x&&x.offsetParent)x.click();await new Promise(r=>setTimeout(r,60));}
    try{_guideCur=null;_guideQ=[];const g=document.getElementById("guideTip");if(g)g.classList.add("hide");}catch(e){}});

  /* ---- 6. TALIZMÁN NÉLKÜL ---- */
  console.log("\n— 6. TALIZMÁN NÉLKÜL —");
  const ures=await p.evaluate(()=>{
    S.tal=null;talState();_talAlapMemo=null;_talSpecMemo=null;
    talMenuOpen();
    const k=document.getElementById("talKep");
    const r={lathato:!!k&&!k.classList.contains("hide"),szoveg:k?k.textContent.replace(/\s+/g," "):""};
    talMenuClose();return r;});
  ok(ures.lathato&&/A te képességeid/.test(ures.szoveg)&&/Titkos fegyver/.test(ures.szoveg),"talizmán nélkül is ott a blokk, és elmondja, mi kerül ide",ures.szoveg.slice(0,160));

  /* ---- 1. A BLOKK A MENÜ TETEJÉN ---- */
  console.log("\n— 1. A TE KÉPESSÉGEID — A MENÜ TETEJÉN —");
  const a=await p.evaluate(()=>{
    S.tal=null;const T=talState();
    const lista=[["titkosfegyver",3],["penzfeldobas",2],["tukorvilag",4]];
    T.lapok=lista.map(([id,rang],i)=>({kat:TAL_SPEC_BY[id].k,rang,dobas:0.5,spec:id,valt:"_nincs",uid:i+1,szezon:S.seasonNumber||1}));
    T.seq=lista.length;_talAlapMemo=null;_talSpecMemo=null;_talKtx=null;
    talHullamok().push({uid:77,lepes:3,hossz:5,irany:null,kesz:0,log:[]});
    talMenuOpen();
    const k=document.getElementById("talKep"),left=document.querySelector("#talModal .talLeft");
    const kartyak=[...k.querySelectorAll(".talKepCard")].map(c=>({k:c.getAttribute("data-kep"),most:c.classList.contains("most"),
      gomb:!!c.querySelector("button[data-tal]"),szoveg:c.textContent.replace(/\s+/g," ").slice(0,90)}));
    const kr=k.getBoundingClientRect(),hr=document.getElementById("talHatas").getBoundingClientRect();
    return {elso:left.firstElementChild===k,fentebb:kr.top<hr.top,kartyak,
      nagyIkon:parseFloat(getComputedStyle(k.querySelector(".talKepIc")).fontSize),
      gombMagas:k.querySelector(".talKepBtn.btn-y").getBoundingClientRect().height};});
  const kk=a.kartyak.map(x=>x.k);
  ok(a.elso&&a.fentebb,"a „Képességeid” a bal oszlop első eleme, az alaphatások fölött",a);
  ok(["titkos","erme","tukor","hullam77"].every(x=>kk.includes(x)),"kártyát kap: Titkos fegyver, Pénzfeldobás, Tükörvilág, a jellemhullám iránya",kk);
  ok(a.kartyak.filter(x=>["titkos","erme","tukor","hullam77"].includes(x.k)).every(x=>x.most&&x.gomb),"a most használhatók világítanak, és saját gombjuk van",a.kartyak);
  ok(a.nagyIkon>=28&&a.gombMagas>=34,"nagyban: nagy ikon, nagy gomb",{ikon:a.nagyIkon,gomb:a.gombMagas});
  if(OUT){await tisztit();await p.screenshot({path:OUT+"/kep-dark.png"});}

  /* ---- 2. A KÁRTYA GOMBJA ---- */
  console.log("\n— 2. A KÁRTYA GOMBJA —");
  const g=await p.evaluate(async()=>{
    document.querySelector('#talKep [data-kep="titkos"] button[data-tal="titkos"]').click();
    await new Promise(r=>setTimeout(r,150));
    const X=talTitkos(),c=document.querySelector('#talKep [data-kep="titkos"]');
    return {elo:X.elo,left:X.left,max:X.max,cls:c.className,gomb:!!c.querySelector("button[data-tal]"),all:c.querySelector(".talKepAll").textContent,
      sor:[...document.querySelectorAll("#talKep .talKepCard")].map(x=>x.getAttribute("data-kep"))};});
  ok(g.elo&&g.left===g.max-1,"a kártya gombja élesíti a Titkos fegyvert (egy használat)",g);
  ok(/élesítve/.test(g.all)&&/elo/.test(g.cls)&&!g.gomb,"a kártya „élesítve” állapotba vált, a gombja eltűnik",{all:g.all,cls:g.cls});
  ok(g.sor.indexOf("titkos")>g.sor.indexOf("erme"),"a már elhasznált hátrébb kerül, a még használható elöl marad",g.sor);

  /* ---- 3. A LISTA ---- */
  console.log("\n— 3. AZ AKTÍV ALAPHATÁSOK LISTÁJA —");
  const l=await p.evaluate(()=>{
    const h=document.getElementById("talHatas");
    const gombok=[...h.querySelectorAll("button[data-tal]")].map(x=>x.getAttribute("data-tal")).filter(x=>x.indexOf("eget:")!==0);
    return {gombok,fel:h.querySelectorAll(".talKepFel").length};});
  ok(l.gombok.length===0&&l.fel>=1,"a listában nincs akciógomb — a sor felfelé mutat",l);
  if(OUT){await p.evaluate(()=>applyTheme("pixel"));await p.evaluate(()=>talMenuRender());await tisztit();await p.waitForTimeout(400);
    await p.screenshot({path:OUT+"/kep-pixel.png"});await p.evaluate(()=>applyTheme("dark"));}

  /* ---- 4. A GYORSSÁV ---- */
  console.log("\n— 4. A GYORSSÁV A KEZDŐRÚGÁS FÖLÖTT —");
  await p.evaluate(()=>{talMenuClose();try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(1500);
  const s=await p.evaluate(()=>{
    const el=document.getElementById("talKepStrip"),kick=document.getElementById("kickBtn");
    const chips=[...el.querySelectorAll("[data-kepnyit]")].map(x=>({k:x.getAttribute("data-kepnyit"),elo:x.classList.contains("elo"),t:x.textContent.replace(/\s+/g," ")}));
    return {lathato:!el.classList.contains("hide")&&!!el.offsetParent,fotte:el.nextElementSibling===kick,chips};});
  ok(s.lathato&&s.fotte,"a gyorssáv látszik, közvetlenül a kezdőrúgás fölött",s);
  ok(s.chips.some(x=>x.k==="erme"&&!x.elo)&&s.chips.some(x=>x.k==="titkos"&&x.elo)&&!s.chips.some(x=>x.k==="tukor"),
     "a következő meccsre ható képességek: a Pénzfeldobás használható, a Titkos fegyver élesítve (✓); a Tükörvilág nem ide tartozik",s.chips);
  if(OUT){await tisztit();await p.evaluate(()=>document.getElementById("talKepStrip").scrollIntoView({block:"center"}));await p.waitForTimeout(300);
    await p.screenshot({path:OUT+"/kep-strip.png"});}
  const s2=await p.evaluate(async()=>{
    document.querySelector('#talKepStrip [data-kepnyit="erme"]').click();
    await new Promise(r=>setTimeout(r,400));
    const c=document.querySelector('#talKep [data-kep="erme"]');
    const r={nyitva:!document.getElementById("talModal").classList.contains("hide"),villan:!!c&&c.classList.contains("villan")};
    talMenuClose();
    /* meccs közben és végigjátszásnál nincs sáv */
    S.auto=true;_talKepStripHtml="x";talKepStripSync();r.autoRejtve=document.getElementById("talKepStrip").classList.contains("hide");S.auto=false;
    return r;});
  ok(s2.nyitva&&s2.villan,"koppintásra a menü a kártyánál nyílik, a kártya felvillan",s2);
  ok(s2.autoRejtve,"végigjátszásnál nincs gyorssáv");

  /* ---- 5. A HUB GOMBJA ---- */
  console.log("\n— 5. A HUB TALIZMÁNOK-GOMBJA —");
  const hb=await p.evaluate(async()=>{
    openHubMidSeason();await new Promise(r=>setTimeout(r,300));
    const t=document.getElementById("hubTalBtn");
    const r={txt:t.textContent,jel:t.classList.contains("talKepVar")};
    try{hubMidSeasonReturn();}catch(e){}return r;});
  ok(/🎮 \d+ képesség használható/.test(hb.txt)&&hb.jel,"a HUB gombja kiírja, hány képesség használható, és világít",hb);

  console.log("\n— 7. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
