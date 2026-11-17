/* 🧭 1.0.10.3.00 — GYORS JÁTÉKTERV (az edző beállítja a taktika csúszkáit)
   és 🧾 A LEGUTÓBBI MECCS A CSÚSZKÁK SZEMÉVEL.
   Amit mér:
     1. aktív taktika nélkül és 60-as ismertség alatt a blokk nincs ott;
     2. ⚔ Rohamra: a saját gólesély nagyobb, mint a 🛡 Zárjuk le után; a 🛡
        után az ellenfélé kisebb; a 🧠 Az edző terve adja a legtöbb ⚡-et;
     3. a terv nem tud jobbat senki kézzel: egyetlen csúszka egyetlen állása
        sem javít tovább a célon (helyi optimum, a keret betartásával);
     4. a keret (ismertség szerinti darabszám) sosem sérül, a filozófiák
        csúszkái érintetlenek, a mentett forma a régi;
     5. alacsony ismertségen az edző kimondja, ha semmi nem éri meg;
     6. „↺ Vissza az előző állásra” betűre visszaállít;
     7. a legutóbbi meccs sora az edzői elemzés csúszka-tényezőjéből;
     8. 430 px, oldalhiba.  KEP=<mappa>: képernyőkép. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9329;
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
const KEP=process.env.KEP||"",REGI=!!process.env.REGI;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
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
    window.saveGame=()=>{window.__m=(window.__m||0)+1;};window.saveGameNow=()=>{};});
  await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{
    const ki={};
    const _t=talMeccsCsat;talMeccsCsat=()=>1;
    S.style=null;S.style2=null;S.styleExtra=[];styleLvlCacheClear();
    /* 1. nincs aktív / alacsony ismertség */
    S.tactics.active=null;S.tactics.dials={};tdMemoClear();openHubMidSeason();openHubDialPanel(true);
    ki.nincsAktiv=!document.getElementById("tdTervBox");
    const k="kontra";S.tactics.active=k;S.tactics.levels[k]=55;tdMemoClear();renderHubDialPanel();
    ki.alacsony=!document.getElementById("tdTervBox");
    /* 2. 92-es ismertség + egy filozófia saját csúszkákkal */
    S.tactics.levels[k]=92;
    S.style={key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null,dials:{lotav:10,ritmus:-10}};
    styleLevel=function(st){const s=st||styleState();return (s&&s.key&&!s.pre)?12:0;};
    styleLvlCacheClear();tdMemoClear();
    S.tactics.dials[k]={szeles:4};
    const kezdo=JSON.stringify(S.tactics.dials[k]);
    const W={d:0.4,up:0.3,dn:0.3};
    const mer=()=>{let o=0,a=0;DIAL_OSSZ_ALLAS.forEach(A=>{let so=0,sa=0;for(let m=5;m<=90;m+=5){const c={min:m-2,gf:A.gf,ga:A.ga,red:false,injured:false};
      so+=Math.log(dialOsszNyers("own",c));sa+=Math.log(dialOsszNyers("opp",c));}o+=W[A.k]*so/18;a+=W[A.k]*sa/18;});return {o,a,eq:o-a};};
    const cel=(c,M)=>c==="tamad"?M.o:c==="ved"?-M.a:M.eq;
    renderHubDialPanel();
    ki.gombok=[...document.querySelectorAll("#tdTervBox [data-tdterv]")].map(b=>b.getAttribute("data-tdterv"));
    const E={};ki.keret=true;ki.optimum=true;ki.allasok={};
    for(const c of ["tamad","ved","edzo"]){
      window.__m=0;
      document.querySelector(`#tdTervBox [data-tdterv="${c}"]`).click();
      const M=mer();E[c]=M;ki.allasok[c]=Object.assign({},S.tactics.dials[k]);
      if(tdActiveCount(k)>tdMaxFor(92,k))ki.keret=false;
      if(!window.__m)ki.nemMentett=c;
      /* helyi optimum: a MOZDÍTOTT csúszkák egyetlen más állása sem jobb a célra */
      const st=tdStore(k);const alapP=cel(c,M);
      TACTIC_DIALS.forEach(d=>{if(!st[d.k])return;const keep=st[d.k];
        for(let v=-10;v<=10;v++){st[d.k]=v;if(cel(c,mer())>alapP+1e-9)ki.optimum=false;}st[d.k]=keep;});
      ki["uzenet_"+c]=(document.querySelector("#tdTervBox .tdTervU")||{}).innerText||"";}
    ki.E={tamad:[+E.tamad.o.toFixed(4),+E.tamad.a.toFixed(4)],ved:[+E.ved.o.toFixed(4),+E.ved.a.toFixed(4)],edzo:[+E.edzo.o.toFixed(4),+E.edzo.a.toFixed(4)]};
    ki.rendben=E.tamad.o>E.ved.o+1e-9&&E.ved.a<E.tamad.a-1e-9&&E.edzo.eq>=E.tamad.eq-1e-9&&E.edzo.eq>=E.ved.eq-1e-9;
    ki.stilus=JSON.stringify(S.style.dials)==='{"lotav":10,"ritmus":-10}';
    ki.forma=Object.keys(S.tactics).sort().join(",")+"|"+Object.values(S.tactics.dials[k]).every(v=>Number.isInteger(v)&&v>=-10&&v<=10);
    /* 6. visszavonás: a három közül az utolsó előtti állapotra */
    const elotte=JSON.stringify(ki.allasok.ved);
    const vb=document.querySelector('#tdTervBox [data-tdterv="vissza"]');ki.vanVissza=!!vb;vb.click();
    const nz=o=>JSON.stringify(Object.fromEntries(Object.entries(o).filter(x=>x[1])));
    ki.vissza=nz(S.tactics.dials[k])===nz(ki.allasok.ved);
    ki.visszaGombEltunt=!document.querySelector('#tdTervBox [data-tdterv="vissza"]');
    /* 5. alacsony ismertség: 60 → 1 csúszka, és a haszon kisebb a kárnál */
    S.tactics.levels[k]=60;S.tactics.dials[k]={};tdMemoClear();renderHubDialPanel();
    document.querySelector('#tdTervBox [data-tdterv="edzo"]').click();
    ki.alacsonyDb=tdActiveCount(k);ki.alacsonyUz=(document.querySelector("#tdTervBox .tdTervU")||{}).innerText||"";
    /* 7. a legutóbbi meccs sora */
    S.tactics.levels[k]=92;tdMemoClear();
    S.lastMatch={mx:{v:2,gf:2,ga:1,tet:[{old:"o",k:"dial",m:1.1,gol:0.21,neked:0.21,me:0.6},{old:"a",k:"dial",m:0.8,gol:-0.34,neked:0.34,me:0.9},{old:"o",k:"bus",m:1.2,gol:0.3,neked:0.3,me:0.7}]}};
    renderHubDialPanel();
    ki.utolso=(document.querySelector("#dialOsszBox .dlOsszUt")||{}).innerText||"";
    S.lastMatch={mx:{v:2,gf:1,ga:1,tet:[{old:"o",k:"bus",m:1.2,gol:0.3,neked:0.3,me:0.7}]}};renderHubDialPanel();
    ki.utolsoNincs=!document.querySelector("#dialOsszBox .dlOsszUt");
    S.lastMatch={mx:{v:2,duel:{},gf:1,ga:1}};renderHubDialPanel();ki.utolsoDuel=!document.querySelector("#dialOsszBox .dlOsszUt");
    S.lastMatch=null;
    ki.tul=[...document.querySelectorAll("#hubDialPicker *")].filter(e=>e.offsetParent&&e.getBoundingClientRect().right>window.innerWidth+1).length;
    talMeccsCsat=_t;
    return ki;});
  ok(r.nincsAktiv&&r.alacsony,"1. aktív taktika nélkül és 60 alatt nincs játékterv-blokk");
  ok(r.gombok.join()==="tamad,ved,edzo","2. három szándék-gomb",r.gombok);
  console.log("     a három terv (súlyozott ln saját, ln ellenfél):",JSON.stringify(r.E));
  console.log("     állások:",JSON.stringify(r.allasok));
  ok(r.rendben,"2. Rohamra → több saját gólesély; Zárjuk le → kevesebb az ellenfélnek; az edző terve → a legtöbb ⚡");
  ok(r.optimum,"3. helyi optimum: a mozdított csúszkák egyetlen más állása sem jobb a célra");
  ok(r.keret&&!r.nemMentett,"4. a darabszám-keret nem sérül, és minden terv ment",r.nemMentett);
  ok(r.stilus&&r.forma==="active,dials,levels|true","4. a filozófia csúszkái érintetlenek, a mentett forma a régi",r.forma);
  ok(/beállította:/.test(r.uzenet_edzo),"4. az edző megmondja, mit állított be",r.uzenet_edzo);
  ok(r.alacsonyDb<=1&&r.alacsonyUz.length>20,"5. alacsony ismertségen legfeljebb egy csúszka, szöveges indoklással",[r.alacsonyDb,r.alacsonyUz]);
  ok(r.vanVissza&&r.vissza&&r.visszaGombEltunt,"6. „Vissza az előző állásra” betűre visszaállít");
  ok(/A legutóbbi meccsen \(2:1\)/.test(r.utolso)&&/\+0,21/.test(r.utolso)&&/−0,34/.test(r.utolso)&&/\+0,55/.test(r.utolso)&&/\+1,5 ⚡/.test(r.utolso),"7. a legutóbbi meccs sora az elemzés csúszka-tényezőjéből",r.utolso);
  ok(r.utolsoNincs&&r.utolsoDuel,"7. csúszka-tényező nélkül és párharc után nincs sor");
  ok(r.tul===0,"8. 430 px: nincs vízszintes túlcsordulás",r.tul);
  if(KEP){await p.evaluate(()=>{const k="kontra";S.tactics.dials[k]={};tdMemoClear();
      S.lastMatch={mx:{v:2,gf:2,ga:1,tet:[{old:"o",k:"dial",m:1.1,gol:0.21,neked:0.21,me:0.6},{old:"a",k:"dial",m:0.8,gol:-0.34,neked:0.34,me:0.9}]}};
      renderHubDialPanel();document.querySelector('#tdTervBox [data-tdterv="edzo"]').click();});
    await p.waitForTimeout(700);
    await p.evaluate(()=>{for(const id of ["guideTip","guideDim","tNudgeWhy","tNudgeDots","tStepDim"]){const e=document.getElementById(id);if(e)e.classList.add("hide");}
      [...document.querySelectorAll("body *")].forEach(e=>{const c=getComputedStyle(e);if(c.position==="fixed"&&/rgba\(0, 0, 0, 0\.5\)/.test(c.backgroundColor))e.style.display="none";});
      document.getElementById("tdTervBox").scrollIntoView({block:"center"});});
    await p.waitForTimeout(500);await p.screenshot({path:path.join(KEP,"jatekterv-utana.png")});}
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
