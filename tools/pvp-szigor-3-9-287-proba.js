/* 🛡 3.9.287 — PvP: IDÉNYNYITÓ CÉLRÉS, SÚLYOZOTT MEZŐNY, SZIGORÚSÁG.

   KÉRÉS (részletek):
     1. „A második szezontól […] az irány az idény gomb megnyomásakor külön
        dobja fel: válasszon milyen célrést kíván a következő szezonra, és
        legyen ott egy becsült eredmény beleszámítva a másik csapat aktuális
        meccs-erejét és választását."
     2. „a célrés ezentúl a szezonzáráskori […] meccserő és az új szezon
        indításkori meccserő átlagával számol, úgy, hogy az indításkori súlya
        x1,25 […] 100 záráskor, 107 indításkor, +1 célrés ==>
        (107x1,25+100x1)/2,25-1. És ez mindkét oldalon, és ezek átlaga lesz a
        nehézségi szint, abban az esetben, ha a létrejött szám magasabb, mint
        a minimális nehézségi szint a számított fejlődésből"
     4. „PvP szigorúság: »könnyed«/»hardcore (fejlesztés alatt)«"

   Amit mér:
     1. a képlet: (107·1,25+100)/2,25 = 103,89 — a példa −1 célréssel 102,89;
        a pár súlyozott átlaga csak akkor él, ha mindkét rekord hozza (régi
        társnál a régi képlet), és a két gépen tükörszimmetrikus;
     2. a szezonzáró csomag hozza a záró NEVEZÉSI meccs-erőt; a kézfogás
        rekordja a lezárt idény záró értékét;
     3. a kezdőrúgás (valódi piramis-karrier, kétoldalú szabályozó): a
        mezőny a súlyozott átlagból áll be a két rajt-cél átlagára; a nyári
        növekmény ~44%-a megmarad a régi képlethez képest; a napló kimondja;
     4. a relatív padló: a tavalyi rajtszint × (1 + ütem/85) — ha a képlet
        alá menne, a mezőny ehhez nő; más osztályban és a fék zónájában nem él;
     5. a szigorúság: a kapcsoló, a beállítás-csomag, az átvétel, az S-ben a
        karrierrel, mentés/betöltés, mpHardcore();
     6. az idénynyitó célrés-ablak: a 2. idénytől, a közös kapu ELŐTT; a
        becslés a társ ÉLŐ előnézetével számol (és kiírja), a léptetés
        közzéteszi a sajátot; a Rendben a választott célréssel a kapura megy,
        a „Még maradok" nem;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9287;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
const kozel=(a,b,e)=>Math.abs(a-b)<=(e||0.25);
const KEP=process.argv[2]||null;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  console.log("\n— 1. a képlet —");
  const r1=await p.evaluate(()=>{
    const o={};
    o.pelda=Math.round((mpMsSuly(107,100)-1)*100)/100;
    o.nincsZaro=mpMsSuly(107,null);
    const A={mstr:107,str:100,mz:100,mzV:1},B={mstr:120,str:110,mz:114,mzV:1};
    const p1=pyrSuperPairMS(A,B),p2=pyrSuperPairMS(B,A);
    o.avg=Math.round(p1.avg*100)/100;o.vart=Math.round(((107*1.25+100)/2.25+(120*1.25+114)/2.25)/2*100)/100;
    o.tukor=Math.abs(p1.avg-p2.avg)<1e-9&&p1.suly===1&&p2.suly===1;
    const regi=pyrSuperPairMS({mstr:107,str:100},B);
    o.regi={avg:regi.avg,suly:regi.suly};
    const fel=pyrSuperPairMS({mstr:107,str:100,mz:100},B);   /* mzV nélkül */
    o.fel=fel.suly;
    return o;});
  ok(r1.pelda===102.89,"(107×1,25+100)/2,25 − 1 = 102,89 (a kérés példája: 103,89 a súlyozott, −1 a célrés)",r1.pelda);
  ok(r1.nincsZaro===107,"záró érték nélkül az indító",r1.nincsZaro);
  ok(r1.avg===r1.vart&&r1.tukor,"a pár: a két súlyozott érték átlaga, tükörszimmetrikusan",r1);
  ok(r1.regi.suly===0&&r1.regi.avg===113.5&&r1.fel===0,"régi társnál (nincs mz/mzV) a régi képlet — mindkét gépen",r1);

  /* ---- piramis-karrier a beállítón át (Haladó) ---- */
  const karrier=()=>p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();
    document.querySelector("#pyrDiffList [data-nfpick='4']").click();
    pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    phase="season";S.seasonClosed=false;});
  await karrier();

  if(KEP){fs.mkdirSync(KEP,{recursive:true});
    await p.evaluate(async()=>{
      const tar={};
      window.mpBk=()=>new Proxy({async h2hGet(c,k){return tar[k]||null;},async h2hPut(c,k,f,v){tar[k]=tar[k]||{};tar[k][f]=v;return true;}},
        {get:(o,k)=>k in o?o[k]:(async()=>null)});
      window.h2hRoomActive=()=>true;MP.active=true;MP.role="host";MP.activeRoom="PROBA";window.mpSeasonGate=()=>{};
      /* valós arányok: a friss karrier mostani meccs-erejéhez mérve */
      let ms=0;msRatedBegin();try{ms=Math.round(teamMatchStrength()*10)/10;}finally{msRatedEnd();}
      S.seasonNumber=1;S.seasonHistory=[{season:1,rank:3}];S.seasonClosed=true;S.idx=30;phase="hub";
      S.mpMyFinal={season:1,strength:ms-4,matchStr:ms-4,matchStrN:ms-4};
      tar["s"+mpUpcomingSeason()+"pre"]={guest:{v:1,season:mpUpcomingSeason(),ms:Math.round((ms+3)*10)/10,mz:Math.round((ms-2)*10)/10,hid:1,cel:3.0,rajt:mpCelresRajt(3.0),at:1}};
      document.querySelectorAll("body *").forEach(el=>{const cs=getComputedStyle(el);
        if(cs.position==="fixed"&&el.id!=="scUnlock"&&!el.contains(document.getElementById("scUnlock")))el.style.display="none";});
      beginNextSeasonWithChallenges();
      window._kepVissza=()=>{S.seasonNumber=1;S.seasonHistory=[];S.seasonClosed=false;S.idx=0;phase="season";S.mpMyFinal=null;
        MP.active=false;delete window.h2hRoomActive;};});
    await p.waitForTimeout(3500);
    await p.locator("#scUnlock").screenshot({path:path.join(KEP,"celres-ablak.png")});
    await p.evaluate(()=>{_mpCelresMost=false;document.getElementById("scUnlock").classList.add("hide");
      ["mpEntry"].forEach(id=>{const e=document.getElementById(id);if(e){e.classList.remove("hide");e.style.display="";}});
      mpTempoRender();mpSzigorRender();mpShow("mpViewRoom");});
    await p.waitForTimeout(400);
    const v=await p.$("#mpViewRoom");if(v)await v.screenshot({path:path.join(KEP,"szigorusag.png")});
    await p.reload({waitUntil:"load"});await p.waitForTimeout(1200);await karrier();
    console.log("(a képek elkészültek — a próba friss oldalon, friss karrierrel folytatódik)");}

  console.log("\n— 2. a záró nevezési meccs-erő —");
  const r2=await p.evaluate(()=>{
    const o={};
    const rep=mpSeasonReport();
    let v=null;msRatedBegin();try{v=Math.round(teamMatchStrength()*10)/10;}finally{msRatedEnd();}
    o.n=rep.stats.matchStrN;o.v=v;o.nyers=rep.stats.matchStr;
    S.seasonNumber=1;S.mpMyFinal={season:1,strength:90,matchStr:95,matchStrN:96.4};
    S.seasonHistory=[{season:1,rank:3}];
    o.sajat=mpSajatZaro(1);o.masik=mpSajatZaro(2);
    S.mpMyFinal={season:1,strength:90,matchStr:95};o.tartalek=mpSajatZaro(1);
    return o;});
  ok(r2.n===r2.v&&r2.n>0,"a szezonzáró csomag hozza a záró NEVEZÉSI meccs-erőt",r2);
  ok(r2.sajat===96.4&&r2.masik===null&&r2.tartalek===95,"a kézfogás a lezárt idény záró értékét viszi (régi mentésnél a nyerset)",r2);

  console.log("\n— 3. a kezdőrúgás: súlyozott mezőny —");
  const r3=await p.evaluate(()=>{
    const o={};
    const _h=h2hRoomActive;h2hRoomActive=()=>true;
    try{
      const H=pyrFloorHist();
      S.seasonNumber=2;S.idx=0;
      const lvl=pyrLevel();
      o.want=pyrFloorWantFor(2);
      /* a kettő: nyáron mindketten +12-t építettek a záró fölé */
      const A={mstr:lvl+20,str:lvl+20,mz:lvl+8,mzV:1,vall:o.want},Bk={mstr:lvl+16,str:lvl+16,mz:lvl+4,mzV:1,vall:o.want};
      const pair=pyrSuperPairMS(A,Bk);pair.for=2;pair.vallA=o.want;pair.vallB=o.want;
      S.pyr.superPair=pair;
      o.wa=pair.wa;o.wb=pair.wb;o.avg=pair.avg;o.regiAvg=(A.mstr+Bk.mstr)/2;
      const h=pyrFloorKickoff();o.h=Object.assign({},h);
      o.res=Math.round((pair.avg-pyrLevel())*10)/10;   /* hid=0 → mezo=szint */
      o.szint=pyrLevel();
      /* a régi képlet ugyanitt ennyivel magasabb mezőnyt adott volna */
      o.megmarad=Math.round((o.regiAvg-o.avg)*10)/10;o.nyari=12;
      o.naplo=/A mezőny képlete/.test(document.body.textContent)&&/≈44%/.test(document.body.textContent);
    }finally{h2hRoomActive=_h;}
    return o;});
  ok(r3.h&&r3.h.lift>0&&kozel(r3.res,r3.want,0.6),"a mezőny a SÚLYOZOTT átlagból áll be a rajt-célra",r3);
  ok(r3.h&&r3.h.suly&&r3.h.suly.wa===r3.wa&&r3.h.suly.wb===r3.wb&&typeof r3.h.rajtSzint==="number","az idény sora rögzíti a súlyozott számokat és a rajtszintet",r3.h);
  ok(kozel(r3.megmarad,r3.nyari*(1/2.25),0.05),"a nyári +12-ből ≈44% (5,3) a tiéd marad",{megmarad:r3.megmarad});
  ok(r3.naplo,"a napló kimondja a képletet");

  console.log("\n— 4. a relatív padló —");
  const r4=await p.evaluate(()=>{
    const o={};
    const _h=h2hRoomActive;h2hRoomActive=()=>true;
    try{
      const H=pyrFloorHist();
      S.seasonHistory.push({season:2,rank:5});
      S.seasonNumber=3;S.idx=0;
      const F=nfMezonyUtem(S.pyr.my);o.F=F;
      /* a tavalyi rajtszint magas: 160 — a relatív padló 160·(1+F/85) */
      H[2].rajtSzint=160;H[2].div=S.pyr.my;
      o.rel=pyrMpRelPadlo(3);o.vart=Math.round(160*(1+F/85)*10)/10;
      /* a kettő épp a rajt-célon áll a mostani szinten (a képlet nem emelne) */
      const lvl=pyrLevel(),w=pyrFloorWantFor(3);
      const A={mstr:lvl+w,str:lvl+w,mz:lvl+w,mzV:1},Bk={mstr:lvl+w,str:lvl+w,mz:lvl+w,mzV:1};
      const pair=pyrSuperPairMS(A,Bk);pair.for=3;pair.vallA=w;pair.vallB=w;S.pyr.superPair=pair;
      const h=pyrFloorKickoff();o.h=Object.assign({},h);o.szint=pyrLevel();
      o.naplo=/a saját ütemével nőtt/.test(document.body.textContent);
      /* más osztályban nem él */
      H[3].div=S.pyr.my+1;o.masOszt=pyrMpRelPadlo(4);
    }finally{h2hRoomActive=_h;}
    return o;});
  ok(r4.rel===r4.vart&&r4.F>0,"a relatív padló: a tavalyi rajtszint × (1 + ütem/85)",r4);
  ok(r4.h&&r4.h.relPadlo&&r4.szint>=r4.rel-0.6,"ha a képlet nem emelne, a mezőny a relatív padlóig nő",{szint:r4.szint,rel:r4.rel,h:r4.h});
  ok(r4.naplo,"a napló kimondja, miért nőtt");
  ok(r4.masOszt===null,"más osztályban a relatív padló nem él",r4.masOszt);

  console.log("\n— 5. a szigorúság —");
  const r5=await p.evaluate(()=>{
    const o={};
    _mpSzigorSel="hardcore";
    o.csomag=mpCollectSettings().szigor;
    _mpSzigorSel="konnyed";o.csomag2=mpCollectSettings().szigor;
    const s=mpCollectSettings();s.szigor="hardcore";mpApplySettings(s);o.atvett=_mpSzigorWanted;
    s.szigor=undefined;mpApplySettings(s);o.regiSzoba=_mpSzigorWanted;
    /* a kapcsoló felülete */
    const box=document.getElementById("mpSzigorBox");
    mpSzigorRender();o.gombok=box.querySelectorAll("[data-szigor]").length;
    box.querySelector("[data-szigor='hardcore']").click();o.valasztott=_mpSzigorSel;
    o.fejlesztes=/fejlesztés alatt/.test(box.textContent)&&/meghosszabbítja/.test(box.textContent);
    _mpSzigorSel="konnyed";
    /* az S-ben, a karrierrel — és mentéssel */
    S.mpSzigor="hardcore";
    const _h=h2hRoomActive;h2hRoomActive=()=>true;o.hc=mpHardcore();h2hRoomActive=_h;o.hcSolo=mpHardcore();
    return o;});
  ok(r5.csomag==="hardcore"&&r5.csomag2==="konnyed","a beállítás-csomag viszi a választást",r5);
  ok(r5.atvett==="hardcore"&&r5.regiSzoba==="konnyed","a vendég átveszi; régi szobában könnyed",r5);
  ok(r5.gombok===2&&r5.valasztott==="hardcore"&&r5.fejlesztes,"a kapcsoló: két gomb, a hardcore „fejlesztés alatt”, és kimondja, hogy hosszabb",r5);
  ok(r5.hc===true&&r5.hcSolo===false,"mpHardcore(): csak közös szobában, hardcore-ral",r5);

  console.log("\n— 6. az idénynyitó célrés-ablak —");
  const r6=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    /* hamis szoba: a társ élő előnézete a tárolóban */
    const tar={};
    const _bk=mpBk;window.mpBk=()=>({
      async h2hGet(code,key){return tar[key]||null;},
      async h2hPut(code,key,field,val){tar[key]=tar[key]||{};tar[key][field]=val;return true;}});
    const _h=h2hRoomActive;window.h2hRoomActive=()=>true;
    MP.active=true;MP.role="host";MP.activeRoom="PROBA";
    const _gate=mpSeasonGate;let kapu=0;window.mpSeasonGate=f=>{kapu++;};
    try{
      S.seasonNumber=3;S.seasonHistory=[{season:1,rank:3},{season:2,rank:4},{season:3,rank:2}];
      S.seasonClosed=true;S.idx=30;phase="hub";
      S.mpMyFinal={season:3,strength:90,matchStr:95,matchStrN:96};
      S.mpMateFinal={season:3,rep:{stats:{matchStr:100,matchStrN:101}}};
      const sn=mpUpcomingSeason();o.sn=sn;
      o.kell=mpCelresKell();
      tar["s"+sn+"pre"]={guest:{v:1,season:sn,ms:118,mz:104,hid:2,cel:3.0,rajt:1.4,at:1}};
      beginNextSeasonWithChallenges();
      await varj(400);
      const box=document.getElementById("scUnlock");
      o.nyitva=!box.classList.contains("hide");
      o.cim=document.getElementById("unlockTitle").textContent;
      o.kapuElott=kapu;
      const t=document.getElementById("unlockBody").textContent;
      /* 3.9.297 — a lényeg, rizsa nélkül: egy fő szám (a mezőny várható
         meccs-ereje), alatta a te és a társad meccs-ereje és rése */
      o.elo=/● élő/.test(t);o.becsles=/várható meccs-ereje/.test(t)&&/A te meccs-erőd/.test(t)&&/A társadé/.test(t)&&/~\d/.test(t);
      o.tarsMs=/A társadé: 118/.test(t);
      o.dontes=/átlagához áll be/.test(t);
      o.nincsRizsa=!/súlyozott|feljutás ~|Mit jelent a döntésed|természetes ~|idényátlag/.test(t);
      const elso=JSON.parse(JSON.stringify(tar["s"+sn+"pre"].host||null));
      o.kozzetett=!!elso&&elso.v===1&&elso.season===sn&&typeof elso.cel==="number"&&elso.mz===96;
      const cel0=elso.cel;
      document.getElementById("mpCelMinus").click();await varj(50);
      o.lepett=Math.round((tar["s"+sn+"pre"].host.cel-cel0)*100)/100;
      o.kijelzo=document.querySelector("#unlockBody").textContent.includes(nfCelTxt(Math.round((cel0-0.1)*100)/100));
      /* „Még maradok": nem megy a kapura */
      [...document.querySelectorAll("#unlockActions button")].find(x=>/Még maradok/.test(x.textContent)).click();
      o.maradKapu=kapu;o.maradZarva=box.classList.contains("hide");
      /* újra, és most Rendben */
      beginNextSeasonWithChallenges();await varj(200);
      document.getElementById("mpCelMinus").click();
      const celV=tar["s"+sn+"pre"].host.cel;
      [...document.querySelectorAll("#unlockActions button")].find(x=>/Rendben/.test(x.textContent)).click();
      o.rendbenKapu=kapu;
      o.hang=S.pyr.nfHangNext;o.hangVart=Math.round((celV-nfCelK(nfLevelFor(pyrFloorUpcoming())))*100)/100;
      o.celFor=nfCelFor(pyrFloorUpcoming());o.celV=celV;
      /* ha a saját indító rekordom már fent van, nincs ablak — egyenesen a kapu */
      tar["s"+sn+"start"]={host:{season:sn,lvl:null}};
      document.getElementById("scUnlock").classList.add("hide");
      const k0=kapu;beginNextSeasonWithChallenges();await varj(200);
      o.fentKapu=kapu-k0;o.fentNincsAblak=document.getElementById("scUnlock").classList.contains("hide");
      /* egyjátékosban és az 1. idény előtt nincs ablak */
      window.h2hRoomActive=()=>false;o.solo=mpCelresKell();
    }finally{window.mpSeasonGate=_gate;window.h2hRoomActive=_h;window.mpBk=_bk;MP.active=false;}
    return o;});
  ok(r6.kell&&r6.nyitva&&/Célrés/.test(r6.cim)&&r6.kapuElott===0,"a 2. idénytől az „Irány az idény” előbb a célrés-ablakot nyitja (a kapu előtt)",r6);
  ok(r6.becsles&&r6.elo&&r6.tarsMs&&r6.dontes&&r6.nincsRizsa,"a becslés a társ ÉLŐ előnézetével számol: egy fő szám (a mezőny várható meccs-ereje), alatta a két meccs-erő és rés — rizsa nélkül (3.9.297)",r6);
  ok(r6.kozzetett&&r6.lepett===-0.1&&r6.kijelzo,"a saját előnézet közzétéve; a léptetés frissíti",r6);
  ok(r6.maradKapu===0&&r6.maradZarva,"„Még maradok”: nincs kapu",r6);
  ok(r6.rendbenKapu===1&&r6.hang===r6.hangVart&&r6.celFor===r6.celV,"Rendben: a választott célréssel a közös kapura",r6);
  ok(r6.fentKapu===1&&r6.fentNincsAblak,"ha a saját indító rekord már fent van, az ablak nem nyílik újra",r6);
  ok(r6.solo===false,"egyjátékosban nincs ablak");

  console.log("\n— 7. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
