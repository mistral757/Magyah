/* 📊 1.0.9.8.00 — A HANGSÚLY-ÖSSZKÉP.
   KÉRÉS: „a Taktika menüpont alatt szinte el van rejtve a hangsúly-csúszkák
   menüpontja. Benne lassan mindent állítgatsz, de az összeredményt nem látod.
   […] lássa a játékos, hogy a beállításai együtt mit tesznek a csapatával és
   a meccsel."
   Amit mér:
     1. középen álló csúszkákkal az összkép üres állapota, a menü-kártya és a
        Taktika gomb alcíme; a meccs előtti sorban nincs hangsúly-sor;
     2. az összkép számai BETŰRE a motor szorzói (dialMul) — perc és állás
        szerint, saját és ellenfél oldalon; a meccserő-egyenérték a képletből;
     3. a „ki szerzi a gólt" megoszlás 100%-ra összegez, és a jó irányba mozdul;
     4. húzás közben (input) az összkép él, a csúszka a helyén marad; az
        elengedés (change) ment;
     5. az állás-fülek váltanak;
     6. a menü-kártya közvetlenül nyit, és oda is zár vissza; a taktika felől
        nyitva a taktikához tér vissza;
     7. a meccs előtti sor megjelenik, meccs közben nem íródik újra;
     8. 430 px-en és fekvő nézetben nincs vízszintes túlcsordulás;
     9. a mentett forma változatlan (csak S.tactics.dials / style.dials);
    10. nincs oldalhiba.
   KÉPEK: KEP=<mappa> megadásával a panelről képernyőképet ment. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9321;
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
const KEP=process.env.KEP||"";
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  /* ---- egy valódi egyjátékos karrier, az 1. idény elején ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    window.mgmtNyit=()=>false;
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=0;S.auto=false;
    window.saveGame=()=>{window.__mentes=(window.__mentes||0)+1;};window.saveGameNow=()=>{};});
  const zar=async()=>{await p.evaluate(()=>{document.querySelectorAll("button").forEach(x=>{if(x.offsetParent&&/^Értem$/.test(x.innerText.trim()))x.click();});
    for(const id of ["guideTipOk","tNudgeWhyX","talDrawLater"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}});
    await p.waitForTimeout(250);};

  /* ---- 1. minden középen ---- */
  const r1=await p.evaluate(()=>{
    S.tactics.active=null;S.tactics.dials={};S.style=null;S.style2=null;S.styleExtra=[];styleLvlCacheClear();tdMemoClear();
    updateMorale();openHubMidSeason();
    const ki={sor:!!document.querySelector("#moraleLine .dlMeccsSor")};
    ki.kartya=document.getElementById("hubDialDs").textContent;
    ki.takt=document.getElementById("hubTacticsBtn").innerText;
    ki.kartyaLatszik=!document.getElementById("hubDialBtn").classList.contains("hide");
    document.getElementById("hubDialBtn").click();
    ki.ures=document.getElementById("dialOsszBox").innerText;
    ki.sav=document.getElementById("dialOsszSav").innerText;
    ki.zar=document.getElementById("hubDialClose").innerText;
    document.getElementById("hubDialClose").click();
    ki.taktNyitva=!document.getElementById("hubTacticsPicker").classList.contains("hide");
    ki.panelZarva=document.getElementById("hubDialPicker").classList.contains("hide");
    return ki;});
  ok(!r1.sor,"1. középen: a meccs előtti sorban nincs hangsúly-sor");
  ok(/Minden csúszka középen/.test(r1.kartya)&&r1.kartyaLatszik,"1. a menü-kártya látszik, és kimondja, hogy minden középen áll",r1.kartya);
  ok(/nincs aktív rendszer/.test(r1.takt),"1. a Taktika gomb alcíme: nincs aktív rendszer",r1.takt);
  ok(/középen/.test(r1.ures)&&/középen/.test(r1.sav),"1. az összkép és a sáv üres állapota",r1.sav);
  ok(r1.zar==="Bezárás"&&r1.panelZarva&&!r1.taktNyitva,"6. a menüből nyitva „Bezárás”, és nem a taktikára zár",r1.zar);

  /* ---- 2–3. beállított csúszkák: az összkép = a motor ---- */
  const r2=await p.evaluate(()=>{
    const k="kontra";S.tactics.active=k;S.tactics.levels[k]=92;
    S.tactics.dials={};S.tactics.dials[k]={vonal:-7,tempo:10,mental:10};
    S.style={key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,dials:{lotav:10,ritmus:10,kockazat:-6}};
    styleLevel=function(st){const s=st||styleState();return (s&&s.key&&!s.pre)?12:0;};
    styleLvlCacheClear();tdMemoClear();
    const _t=talMeccsCsat;talMeccsCsat=()=>1;   /* a dialMul talizmán-tagja semleges: csak a csúszkák */
    const O=dialOsszkep(),ki={n:O.akt.length,elt:0,db:0};
    for(const a of DIAL_OSSZ_ALLAS){
      for(let i=0;i<18;i++){const c={min:i*5+3,gf:a.gf,ga:a.ga,red:false,injured:false};
        ki.elt=Math.max(ki.elt,Math.abs(O.iv[a.k].own[i]-dialMul("own",c)),Math.abs(O.iv[a.k].opp[i]-dialMul("opp",c)));ki.db+=2;}}
    const I=O.iv.d;ki.eq=I.eq;ki.eqKeplet=(Math.log(I.ao)-Math.log(I.ap))/(2*SIM.K);
    ki.d=[I.ao,I.ap];ki.up=[O.iv.up.ao,O.iv.up.ap];ki.dn=[O.iv.dn.ao,O.iv.dn.ap];
    ki.gol=O.gol&&O.gol.sor.map(r=>[r.n,+r.a.toFixed(1),+r.b.toFixed(1)]);
    ki.golKapus=O.gol?100-O.gol.sor.reduce((s,r)=>s+r.b,0):null;
    ki.mellek=O.mellek.map(m=>m.n+" "+dialOsszPct(m.pct,m.pp));
    ki.motorLap=dialMul("card",{}),ki.motorSer=dialMul("inj",{}),ki.motorKontra=dialMul("counter",{});
    talMeccsCsat=_t;
    updateMorale();ki.sor=(document.querySelector("#moraleLine .dlMeccsSor")||{}).textContent||"";
    S.playing=true;updateMorale();ki.sorMeccsKozben=!!document.querySelector("#moraleLine .dlMeccsSor");S.playing=false;updateMorale();
    renderHub();
    ki.kartya=document.getElementById("hubDialDs").textContent;
    ki.takt=document.getElementById("hubTacticsBtn").innerText;
    return ki;});
  ok(r2.n===6,"2. hat mozdított csúszka (3 taktika + 3 stílus)",r2.n);
  ok(r2.elt<1e-12&&r2.db===108,"2. az ív mind a 108 pontja betűre a motor szorzója (dialMul)",{elteres:r2.elt});
  ok(Math.abs(r2.eq-r2.eqKeplet)<1e-12&&isFinite(r2.eq),"2. a meccserő-egyenérték = (ln saját − ln ellenfél)/(2K)",+r2.eq.toFixed(3));
  ok(r2.up[1]<r2.d[1]-1e-9||r2.up[0]<r2.d[0]-1e-9,"2. vezetésnél más a kép (Vezetést megőrizni)",{d:r2.d,up:r2.up});
  ok(r2.dn[0]>r2.d[0]+1e-9,"2. hátrányban nő a saját gólesély (Mindent bele)",{d:r2.d,dn:r2.dn});
  ok(r2.gol&&r2.gol[1][2]>r2.gol[1][1]&&r2.gol[2][2]<r2.gol[2][1],"3. Távoli bombák: a középpályások gólrészesedése nő, a csatároké esik",r2.gol);
  ok(r2.golKapus!==null&&r2.golKapus>=0&&r2.golKapus<1,"3. a megoszlás (a kapussal) 100%",+r2.golKapus.toFixed(3));
  ok(r2.mellek.some(x=>/sérülés/.test(x))&&r2.mellek.some(x=>/kontra-ablak/.test(x)),"3. a mellékhatások között a sérülés és a kontra-ablak",r2.mellek);
  ok(/6 csúszka él/.test(r2.sor)&&/⚡/.test(r2.sor),"7. a meccs előtti sor megjelenik",r2.sor);
  ok(!r2.sorMeccsKozben,"7. meccs közben a sor nem íródik ki");
  ok(/6 csúszka él/.test(r2.kartya)&&/Gyors kontra/.test(r2.takt)&&/92/.test(r2.takt)&&/6 csúszka/.test(r2.takt),"1. a menü-kártya és a Taktika gomb alcíme élő adat",[r2.kartya,r2.takt]);
  await zar();

  /* ---- 4–6. a panel: élő húzás, fülek, visszaút ---- */
  await p.evaluate(()=>{document.getElementById("hubTacticsBtn").click();});await p.waitForTimeout(300);await zar();
  const r3=await p.evaluate(()=>{
    const ki={};
    const ob=document.getElementById("hubDialOpenBtn");ki.taktKartya=ob.innerText;ob.click();
    ki.zar=document.getElementById("hubDialClose").innerText;
    const sl=document.querySelector('input.tdRange[data-tdial="vonal"]');
    ki.elotte=document.getElementById("dialOsszSav").innerText;window.__mentes=0;
    sl.value="10";sl.dispatchEvent(new Event("input",{bubbles:true}));
    ki.kozben=document.getElementById("dialOsszSav").innerText;
    ki.ugyanaz=document.querySelector('input.tdRange[data-tdial="vonal"]')===sl;
    ki.felirat=sl.closest(".dlCard").querySelector(".dlPct").textContent;
    ki.mentesKozben=window.__mentes;
    sl.dispatchEvent(new Event("change",{bubbles:true}));
    ki.mentesUtana=window.__mentes;ki.ertek=tdValue("kontra","vonal");
    ki.ujraRajzolt=document.querySelector('input.tdRange[data-tdial="vonal"]')!==sl;
    /* stílus-csúszka húzása */
    const s2=document.querySelector('[data-dialslot] input.dlRange[data-dial="kockazat"]');
    const e0=document.getElementById("dialOsszBox").innerText;
    s2.value="10";s2.dispatchEvent(new Event("input",{bubbles:true}));
    ki.stilusEl=document.getElementById("dialOsszBox").innerText!==e0&&S.style.dials.kockazat===10;
    s2.dispatchEvent(new Event("change",{bubbles:true}));
    /* fülek */
    const t=document.querySelector('[data-dlallas="up"]');ki.vanFul=!!t;
    if(t){t.click();ki.ful=document.querySelector(".dlOsszTab.on").getAttribute("data-dlallas");}
    ki.oszlop=document.querySelectorAll("#dialOsszBox .dlIvSav i").length;
    const box=document.getElementById("hubDialPicker");
    ki.tul=[...box.querySelectorAll("*")].filter(e=>e.getBoundingClientRect().right>window.innerWidth+1).length;
    ki.docTul=document.documentElement.scrollWidth-window.innerWidth;
    return ki;});
  ok(/Összkép:/.test(r3.taktKartya),"6. a taktika-panel 🎚 kártyáján ott a rövid összkép",r3.taktKartya.replace(/\n/g," | "));
  ok(/Vissza a taktikához/.test(r3.zar),"6. a taktika felől nyitva a zárógomb a taktikához visz",r3.zar);
  ok(r3.kozben!==r3.elotte&&r3.ugyanaz&&/100% · Magas védővonal/.test(r3.felirat),"4. húzás közben az összkép él, a csúszka a helyén marad",[r3.elotte.replace(/\n/g," "),r3.kozben.replace(/\n/g," ")]);
  ok(r3.mentesKozben===0&&r3.mentesUtana>=1&&r3.ertek===10&&r3.ujraRajzolt,"4. az elengedés ment és újrarajzol (húzás közben nincs mentés)",[r3.mentesKozben,r3.mentesUtana]);
  ok(r3.stilusEl,"4. a stílus-csúszka húzása is élő");
  ok(r3.vanFul&&r3.ful==="up","5. az állás-fül vált",r3.ful);
  ok(r3.oszlop===36,"5. a meccs íve 2×18 oszlop",r3.oszlop);
  ok(r3.tul===0&&r3.docTul<=0,"8. 430 px: nincs vízszintes túlcsordulás",[r3.tul,r3.docTul]);
  if(KEP){await zar();
    await p.evaluate(()=>{
      [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);
        if(c.position==="fixed"&&!e.id&&e.offsetWidth>300&&e.offsetHeight>300&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});
      document.querySelector('[data-dlallas="d"]').click();document.getElementById("hubDialPicker").scrollIntoView();window.scrollBy(0,-70);});
    await p.waitForTimeout(400);await p.screenshot({path:path.join(KEP,"hangsuly-osszkep-utana.png")});}
  const r4=await p.evaluate(()=>{
    document.getElementById("hubDialClose").click();
    return {takt:!document.getElementById("hubTacticsPicker").classList.contains("hide"),
      forma:JSON.stringify(S.tactics.dials)+" "+JSON.stringify(S.style.dials),
      kulcsok:Object.keys(S.tactics).sort().join(",")};});
  ok(r4.takt,"6. a taktika felől nyitva a taktikára zár vissza");
  ok(r4.forma==='{"kontra":{"vonal":10,"tempo":10,"mental":10}} {"lotav":10,"ritmus":10,"kockazat":10}'&&r4.kulcsok==="active,dials,levels",
     "9. a mentett forma változatlan (csak a csúszka-állások)",r4.forma);

  /* ---- 8. fekvő nézet ---- */
  await p.setViewportSize({width:900,height:430});await p.waitForTimeout(500);
  const r5=await p.evaluate(()=>{openHubDialPanel(true);
    const box=document.getElementById("hubDialPicker");
    return {tul:[...box.querySelectorAll("*")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length,
      van:!!document.getElementById("dialOsszBox")};});
  ok(r5.van&&r5.tul===0,"8. fekvő nézet (900×430): az összkép kifér",r5);
  if(KEP){await zar();await p.evaluate(()=>{
      /* a tanító réteg névtelen sötétítője a képen csak takarna */
      [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);
        if(c.position==="fixed"&&!e.id&&e.offsetWidth>600&&e.offsetHeight>300&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});
      document.getElementById("hubDialPicker").scrollIntoView({block:"start"});});
    await p.waitForTimeout(300);await p.screenshot({path:path.join(KEP,"hangsuly-osszkep-fekvo.png")});}
  ok(errs.length===0,"10. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
