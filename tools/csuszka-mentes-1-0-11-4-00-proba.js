/* 💾 1.0.11.4.00 — SAJÁT CSÚSZKA-BEÁLLÍTÁSOK.

   KÉRÉS: „A hangsúlycsúszkák is legyenek menthetők, mint a felállás. Hogy
   legyenek saját beállítások is, ne csak a nagyon védekezés, nagyon támadás
   és edzői összeállítás."

   Amit mér:
     1. a blokk a gyors játékterv alatt ül; minden csúszka középen → a Mentés
        tiltott, és megmondja, miért;
     2. mentés: a taktika ÉS a filozófia csúszkái egy rekordba kerülnek, a
        megadott névvel; a lista gombja kiírja a tartalmát; azonos névvel
        felülír, 20 a plafon;
     3. visszatöltés: a csúszkák pontosan a mentett állásra állnak (taktika és
        filozófia), a ↺ visszavonás mindkettőt visszaadja;
     4. a mostani keret tisztelete: ha az ismertség kevesebb csúszkát enged, a
        LEGERŐSEBB kerül vissza, a többit kimondja; más taktikánál is
        visszatölthető, és ezt kimondja; más filozófiánál a stílus-csúszkák
        kimaradnak, és ezt is kimondja;
     5. törlés megerősítéssel;
     6. a karrier mentése oda-vissza megőrzi (S.dialMentes), a régi mentés
        (a mező nélkül) üres listával töltődik;
     7. 430 px: nincs vízszintes túlcsordulás; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9619;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json",".json":"application/json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const KEP=process.env.KEP||"";
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");localStorage.setItem("nyitoLatta30_0","1");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};initPlayerAttrs(careerPool[pl.n]);});
    if(!scout)scout=generateScout();
    startFirstSeason();phase="season";
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    S.idx=0;S.auto=false;window.__sgn=saveGameNow;window.mezKerdesKell=()=>false;
    document.getElementById("mpEntry").classList.add("hide");});
  await p.waitForTimeout(400);
  const r=await p.evaluate(async()=>{
    const ki={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const $q=s=>document.querySelector(s);
    const D=TACTIC_DIALS.map(d=>d.k),A={[D[0]]:4,[D[1]]:8,[D[4]]:-6},ERO={[D[1]]:8};
    const k="kontra";S.tactics.active=k;S.tactics.levels[k]=92;S.tactics.dials={};tdMemoClear();
    S.style={key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,dials:{}};
    S.style2=null;S.styleExtra=[];styleLvlCacheClear();
    S.dialMentes=null;
    openHubMidSeason();openHubDialPanel(true);renderHubDialPanel();
    /* 1. */
    const box=()=>$q("#tdMentBox");
    ki.van=!!box();
    ki.sorrend=(()=>{const t=$q("#tdTervBox"),m=box();return !!t&&!!m&&!!(t.compareDocumentPosition(m)&Node.DOCUMENT_POSITION_FOLLOWING);})();
    ki.tiltott=$q("[data-tdment]").disabled&&/középen áll/.test(box().innerText);
    /* 2. mentés: taktika + filozófia */
    S.tactics.dials[k]=Object.assign({},A);
    const sl=dialListIn(S.style);ki.stilusDb=sl.length;
    S.style.dials={[sl[0].k]:10,[sl[1].k]:-5};
    tdMemoClear();renderHubDialPanel();
    const elvart={td:JSON.stringify(S.tactics.dials[k]),st:JSON.stringify(S.style.dials)};
    $q("[data-tdmnev]").value="Idegenben";$q("[data-tdment]").click();await varj(30);
    const L=S.dialMentes||[];
    ki.mentve=L.length===1&&L[0].nev==="Idegenben"&&L[0].tk===k
      &&JSON.stringify(L[0].td)===JSON.stringify(A)
      &&L[0].stilus.length===1&&L[0].stilus[0].key==="bombazok"&&JSON.stringify(L[0].stilus[0].dials)===elvart.st;
    ki.rekord=L[0];
    ki.lista=box().querySelectorAll("[data-tdmtolt]").length;
    ki.kivonat=(box().querySelector(".tdMentB small")||{}).innerText||"";
    /* azonos név felülír; 20 a plafon */
    S.tactics.dials[k]=Object.assign({},A);tdMemoClear();
    $q("[data-tdmnev]").value="Idegenben";$q("[data-tdment]").click();await varj(20);
    ki.felulir=(S.dialMentes||[]).length===1;
    const ideg=(S.dialMentes||[])[0];
    for(let i=0;i<25;i++)tdMentes("Próba "+i);
    ki.plafon=(S.dialMentes||[]).length;
    ki.kiszorult=!(S.dialMentes||[]).some(x=>x.nev==="Idegenben");   /* a legrégebbi esik ki */
    S.dialMentes=[ideg];renderHubDialPanel();
    /* 3. visszatöltés + visszavonás */
    tdTervAlkalmaz("tamad");
    S.style.dials={[sl[2]?sl[2].k:sl[0].k]:3};
    tdMemoClear();renderHubDialPanel();
    const elotte={td:JSON.stringify(S.tactics.dials[k]),st:JSON.stringify(S.style.dials)};
    $q("[data-tdmtolt]").click();await varj(30);
    const nz=o=>JSON.stringify(Object.fromEntries(Object.entries(o||{}).filter(([,v])=>v)));
    ki.toltve=nz(S.tactics.dials[k])===nz(A)&&nz(S.style.dials)===nz(JSON.parse(elvart.st));
    ki.uzenet=(($q("#tdTervBox .tdTervU")||{}).innerText)||"";
    const v=$q("[data-tdterv='vissza']");ki.visszaGomb=!!v;
    if(v){v.click();await varj(30);}
    ki.visszaJo=nz(S.tactics.dials[k])===nz(JSON.parse(elotte.td))&&nz(S.style.dials)===nz(JSON.parse(elotte.st));
    /* 4a. kisebb ismertség: egy csúszka fér → a legerősebb (8-as) */
    S.tactics.levels[k]=61;S.tactics.dials[k]={};tdMemoClear();renderHubDialPanel();
    ki.max61=tdMaxFor(tacticLevel(k),k);
    $q("[data-tdmtolt]").click();await varj(30);
    ki.kicsi=nz(S.tactics.dials[k]);ki.kicsiVart=nz(ERO);ki.kicsiUz=(($q("#tdTervBox .tdTervU")||{}).innerText)||"";
    /* 4b. más taktika */
    S.tactics.levels[k]=92;const k2=Object.keys(TACTICS).find(x=>x!==k);
    S.tactics.active=k2;S.tactics.levels[k2]=92;S.tactics.dials[k2]={};tdMemoClear();renderHubDialPanel();
    $q("[data-tdmtolt]").click();await varj(30);
    ki.masTakt=nz(S.tactics.dials[k2])===nz(A);ki.masTaktUz=(($q("#tdTervBox .tdTervU")||{}).innerText)||"";
    /* 4c. más filozófia */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,dials:{}};styleLvlCacheClear();renderHubDialPanel();
    $q("[data-tdmtolt]").click();await varj(30);
    ki.masStil=nz(S.style.dials)==="{}";ki.masStilUz=(($q("#tdTervBox .tdTervU")||{}).innerText)||"";
    /* 7. túlcsordulás */
    ki.tul=[...document.querySelectorAll("#tdMentBox *")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    /* 6. a karrier mentése oda-vissza */
    try{window.__sgn();const d=loadSavedGame(saveKey());ki.mentesben=!!(d&&d.S&&Array.isArray(d.S.dialMentes)&&d.S.dialMentes.length===1);
      const d2=JSON.parse(JSON.stringify(d));delete d2.S.dialMentes;applySavedGame(d2);ki.regi=tdMentesek().length===0;
      applySavedGame(d);ki.vissza=tdMentesek().length===1&&tdMentesek()[0].nev==="Idegenben";}catch(e){ki.mentHiba=String(e);}
    /* 5. törlés */
    openHubMidSeason();openHubDialPanel(true);renderHubDialPanel();
    $q("[data-tdmtor]").click();await varj(60);
    const igen=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/Igen, törlöm/.test(x.innerText));
    ki.megerosit=!!igen;if(igen){igen.click();await varj(60);}
    ki.torolve=tdMentesek().length===0;
    return ki;});
  ok(r.van&&r.sorrend,"1. a „Saját beállítások” blokk a gyors játékterv alatt");
  ok(r.tiltott,"1. minden csúszka középen: a Mentés tiltott, és megmondja");
  ok(r.mentve&&r.lista===1&&/Széles játék|letámadás|Magas|Mindent/i.test(r.kivonat),"2. a taktika és a filozófia csúszkái egy rekordba, névvel; a gomb kiírja a tartalmát",{rekord:r.rekord,kivonat:r.kivonat});
  ok(r.felulir&&r.plafon===20&&r.kiszorult,"2. azonos név felülír; 20 a plafon (a legrégebbi esik ki)",{plafon:r.plafon});
  ok(r.toltve&&/Visszatöltve/.test(r.uzenet),"3. visszatöltés: a taktika és a filozófia csúszkái pontosan a mentett állásra",r.uzenet);
  ok(r.visszaGomb&&r.visszaJo,"3. a ↺ visszavonás mindkettőt visszaadja");
  ok(r.max61===1&&r.kicsi===r.kicsiVart&&/Kimaradt/.test(r.kicsiUz),"4. kevesebb csúszka fér: a legerősebb kerül vissza, a többit kimondja",{max:r.max61,lett:r.kicsi,uz:r.kicsiUz});
  ok(r.masTakt&&/másik|taktikánál készült/.test(r.masTaktUz),"4. más taktikánál is visszatölthető, és kimondja",r.masTaktUz);
  ok(r.masStil&&/filozófia/.test(r.masStilUz),"4. más filozófiánál a stílus-csúszkák kimaradnak, és kimondja",r.masStilUz);
  ok(r.megerosit&&r.torolve,"5. törlés megerősítéssel");
  ok(!r.mentHiba&&r.mentesben&&r.regi&&r.vissza,"6. a karrier mentése oda-vissza megőrzi; a régi mentés üres listával töltődik",{hiba:r.mentHiba,ment:r.mentesben,regi:r.regi,vissza:r.vissza});
  ok(r.tul===0,"7. 430 px: nincs vízszintes túlcsordulás",r.tul);
  if(KEP){await p.evaluate(()=>{const S2=S;S2.tactics.dials[S2.tactics.active]={[TACTIC_DIALS[0].k]:4,[TACTIC_DIALS[1].k]:8};tdMentes("Hazai roham");tdMentes("Idegenben");
      renderHubDialPanel();const m=document.getElementById("tdMentBox");if(m){m.scrollIntoView({block:"start"});window.scrollBy(0,-220);}});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,"csuszka-mentes-utana.png")});}
  ok(errs.length===0,"7. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
