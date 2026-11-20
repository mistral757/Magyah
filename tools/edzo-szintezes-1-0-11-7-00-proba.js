/* 👔 1.0.11.7.00 — A SAJÁT EDZŐD IS SZINTEZHETŐ (mester-szintezés).
   KÉRÉS: „Legyen egy one time purchase az edzői felületen […] 9.5 nehézségi
   szinten 30 stíluspont legyen a bázis ára (scalelődjön fel-le) […] a három
   szintet […] ugyanazokért az árakért […] értesítés […] leghamarabb a
   csapatstílus választás után."
   Amit mér:
     1. stílus nélkül zárva (🔒), a nyitás nem megy;
     2. az ár: 9.5 → 30 · 1.1 → 15 · 10.5 → 34; a szintek = a stílus-edző
        képesség árai (a fából olvasva);
     3. a nyitás (0. szint) semmit nem ad még, a pont fogy;
     4. 1. szint: kétszeres begyakorlás; 2.: plafon 125, illeszkedés 150%;
        3.: 150 és 200% — és csak az edző kedvelt taktikáján;
     5. másik edzőnél semleges, visszahozva a szint visszajön;
     6. a stílusod edzőjénél nem elérhető (ott a fa viszi);
     7. az értesítés egyszer szól; 8. a mentés viszi;
     9. a panel: a gombok és a megerősítés kattintással; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9243;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof coachAttrPower==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=3;S.idx=11;
    window.__sg=saveGame;window.saveGame=()=>{};window.saveGameNow=()=>{};
    const _al=addLine;const sorok=[];addLine=(t,c)=>{sorok.push(String(t));return _al(t,c);};
    /* egy nem stílus-edző a kispadon */
    const nemStil=COACHES.find(c=>!Object.values(STYLE_COACHES).some(d=>d.name===c.n)&&c.tactics&&c.tactics.length);
    coach=nemStil;const T0=coach.tactics[0];
    /* 1. stílus nélkül */
    S.style=null;S.style2=null;S.styleExtra=[];S.edzoSzint=null;
    ki.zar={el:sedzoElerheto(),nyit:sedzoNyit().ok,html:/🔒/.test(sedzoHtml())};
    /* 2. az ár */
    const _nfm=window.styleXNfMost;
    const ar=(nf,s)=>{window.styleXNfMost=()=>({nf,s});return sedzoNyitAr();};
    ki.ar={"9.5":ar(9,5),"1.1":ar(1,1),"7.1":ar(7,1),"10.5":ar(10,5)};
    window.styleXNfMost=()=>({nf:9,s:5});
    const fa=(STYLE_TRAITS.tikitaka||[]).find(t=>t.key==="guardiola");
    ki.szintAr={edzo:[1,2,3].map(sedzoSzintAr),fa:fa.lv.map(x=>x.price)};
    /* 3. nyitás */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};
    try{styleLvlCacheClear();}catch(e){}
    const M=msState();M.sp=400;
    const c0=tacticCeil(T0),m0=styleCoachTrainMult(T0),f0=tacticFitCap(T0);
    const n1=sedzoNyit();
    ki.nyit={ok:n1.ok,ar:n1.ar,sp:M.sp,lvl:sedzoRec()&&sedzoRec().lvl,ceil:tacticCeil(T0),mult:styleCoachTrainMult(T0),fit:tacticFitCap(T0),c0,m0,f0,ujra:sedzoNyit().ok};
    /* 4. szintek */
    const L=[];for(let i=0;i<3;i++){const r=sedzoLep();L.push({ok:r.ok,ar:r.ar,ceil:tacticCeil(T0),mult:styleCoachTrainMult(T0),fit:tacticFitCap(T0)});}
    ki.szintek=L;ki.negyedik=sedzoLep().ok;ki.spVege=M.sp;
    const masik=Object.keys(TACTICS).find(k=>k!==T0&&!Object.values(STYLE_COACHES).some(d=>d.tactic===k&&styleHasKey(Object.keys(STYLE_COACHES).find(x=>STYLE_COACHES[x]===d))));
    ki.masikTaktika={k:masik,ceil:tacticCeil(masik)};
    /* 5. edzőcsere */
    const masikEdzo=COACHES.find(c=>c!==nemStil&&!Object.values(STYLE_COACHES).some(d=>d.name===c.n));
    coach=masikEdzo;ki.csere={ceil:tacticCeil(T0),rec:sedzoRec()};
    coach=nemStil;ki.vissza={ceil:tacticCeil(T0),lvl:sedzoRec()&&sedzoRec().lvl};
    /* 6. a stílusod edzője */
    const mou=COACHES.find(c=>c.n===STYLE_COACHES.beton.name)||{n:STYLE_COACHES.beton.name,tactics:["busz"]};
    coach=mou;ki.stilusEdzo={el:sedzoElerheto(),html:/képességfa|stílus képességfája/.test(sedzoHtml())};
    coach=nemStil;
    /* 7. értesítés */
    S.edzoSzint.tudja=0;sorok.length=0;sedzoErtesit();sedzoErtesit();
    ki.ertesit=sorok.filter(t=>/is szintezhető/.test(t)).length;
    /* 8. mentés */
    window.__lsw=null;const _s=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===saveKey())window.__lsw=v;return _s.apply(this,arguments);};
    try{window.__sg();}catch(e){ki.saveErr=String(e);}finally{Storage.prototype.setItem=_s;}
    let dd=null;try{dd=JSON.parse(mzUnpack(window.__lsw));}catch(e){}
    ki.mentes={van:!!(dd&&dd.S&&dd.S.edzoSzint&&dd.S.edzoSzint.m[nemStil.n])};
    if(dd){S.edzoSzint=null;try{applySavedGame(dd);}catch(e){ki.loadErr=String(e);}coach=nemStil;ki.mentes.vissza=sedzoRec()&&sedzoRec().lvl===3;}
    /* 9. a panel */
    S.edzoSzint={v:1,m:{},tudja:1};const M2=msState();M2.sp=200;
    renderHubCoachPanel();
    const nb=document.getElementById("sedzoNyitBtn");ki.ui={nyitGomb:!!nb&&!nb.disabled,szoveg:nb&&nb.textContent};
    nb.click();document.getElementById("hubTacticConfirmYes").click();
    const lb=document.getElementById("sedzoLepBtn");ki.ui.lepGomb=!!lb;ki.ui.lvl0=sedzoRec()&&sedzoRec().lvl;
    lb.click();document.getElementById("hubTacticConfirmYes").click();
    ki.ui.lvl1=sedzoRec()&&sedzoRec().lvl;ki.ui.sp=M2.sp;
    ki.ui.lepcso=document.querySelectorAll("#hubCoachBody .sedzoLepcso span.on").length;
    window.styleXNfMost=_nfm;addLine=_al;
    return ki;});
  console.log(JSON.stringify(r));
  await p.evaluate(()=>{renderHubCoachPanel();
    const d=document.createElement("div");d.style.cssText="position:fixed;inset:0;z-index:99999;background:var(--bg);overflow:auto;padding:16px";
    d.innerHTML=`<div class="card">${document.getElementById("hubCoachBody").innerHTML}</div>`;document.body.appendChild(d);
    const bx=d.querySelector(".sedzoBox");if(bx)d.scrollTop=bx.offsetTop-260;});
  await p.waitForTimeout(500);
  await p.screenshot({path:path.join(process.env.SHOT_DIR||"/tmp","edzo-szintezes.png"),fullPage:false});
  ok(!r.zar.el&&!r.zar.nyit&&r.zar.html,"1. csapatstílus nélkül zárva (🔒), a nyitás nem megy",r.zar);
  ok(r.ar["9.5"]===30&&r.ar["1.1"]===15&&r.ar["7.1"]===23&&r.ar["10.5"]===34,"2a. a megnyitás ára: 9.5 → 30, a nehézséggel fel-le",r.ar);
  ok(JSON.stringify(r.szintAr.edzo)===JSON.stringify(r.szintAr.fa),"2b. a három szint ára = a stílus-edző képességéé",r.szintAr);
  const N=r.nyit;
  ok(N.ok&&N.ar===30&&N.sp===370&&N.lvl===0&&N.ceil===N.c0&&N.mult===N.m0&&N.fit===N.f0&&!N.ujra,"3. a nyitás: −30 pont, 0. szint, még semmi hatás; kétszer nem nyitható",N);
  const S2=r.szintek;
  ok(S2[0].ok&&S2[0].mult===2&&S2[0].ceil===99&&S2[0].fit===1,"4a. 1. szint: kétszeres begyakorlás",S2[0]);
  ok(S2[1].ok&&S2[1].ceil===125&&S2[1].fit===1.5,"4b. 2. szint: plafon 125, illeszkedés 150%",S2[1]);
  ok(S2[2].ok&&S2[2].ceil===150&&S2[2].fit===2&&!r.negyedik,"4c. 3. szint: 150 és 200%; tovább nem",S2[2]);
  ok(r.spVege===370-r.szintAr.edzo.reduce((a,b)=>a+b,0),"4d. a pontok fogynak",r.spVege);
  ok(r.masikTaktika.ceil===99,"4e. más taktikán nem hat",r.masikTaktika);
  ok(r.csere.ceil===99&&!r.csere.rec&&r.vissza.ceil===150&&r.vissza.lvl===3,"5. edzőcsere: semleges; visszahozva a szint visszajön",[r.csere,r.vissza]);
  ok(!r.stilusEdzo.el&&r.stilusEdzo.html,"6. a stílusod edzőjénél nem elérhető (a fa viszi)",r.stilusEdzo);
  ok(r.ertesit===1,"7. az értesítés egyszer szól",r.ertesit);
  ok(r.mentes&&r.mentes.van&&r.mentes.vissza&&!r.loadErr,"8. a mentés viszi",{m:r.mentes,e:r.loadErr});
  ok(r.ui.nyitGomb&&r.ui.lvl0===0&&r.ui.lepGomb&&r.ui.lvl1===1&&r.ui.sp===200-30-54&&r.ui.lepcso===1,"9. a panel: nyitás és szintlépés kattintással, megerősítéssel",r.ui);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})();
