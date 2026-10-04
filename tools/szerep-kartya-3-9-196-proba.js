/* 🎭 3.9.196 — A SZEREPKÁRTYA: NEM FUT KI, NINCS NYERS KULCS.

   BEJELENTÉS (képernyőképpel): „Nem annyira elegáns hogy azok a
   szövegrészek ott kifutnak a boxból" — a szerep hatás-szövege (pl. „−52%
   a kiállítás meccserő-ára, amíg a pályán van") a kártya fejlécéből kilógott,
   és a Vezérnél a nyers „ovrkar" kulcs állt az attribútum helyén.

   Amit mér (valódi roleSectionHtml, Panzer és Gegenpressing):
     1. nincs nyers kulcs (ovrkar, sebgol) se a kártyán, se a jelölt-listában;
        a két származtatott gazda neve: Vezérerő, Lesi-erő;
     2. 260 px széles dobozban sem lóg ki egyetlen elem sem a kártyából;
     3. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9240;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof roleAttrLabel==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    tiszta();


    const xs=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    const meres=(stil,map)=>{
      S.style={key:stil,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};
      try{styleLvlCacheClear();}catch(e){}
      S.roles={season:S.seasonNumber||1,map};
      const w=document.createElement("div");
      w.style.cssText="position:fixed;left:0;top:0;width:260px;padding:10px;box-sizing:border-box;background:var(--bg);z-index:99999";
      w.innerHTML=roleSectionHtml();document.body.appendChild(w);
      const W=w.getBoundingClientRect().right;
      const ki2={szoveg:w.textContent.replace(/\s+/g," "),
        opciok:[...w.querySelectorAll("option")].map(o=>o.textContent).join(" | "),
        kilog:[...w.querySelectorAll(".msItem *")].filter(e=>e.tagName!=="OPTION").map(e=>Math.round(e.getBoundingClientRect().right-W)).filter(x=>x>0)};
      w.remove();return ki2;};
    ki.panzer=meres("panzer",{meszaros:xs[2].n,vezer:xs[5].n,falka:xs[3].n});
    ki.gegen=meres("gegen",{iranyito:xs[5].n,lesipuskas:xs[8].n});
    ki.cimke=[roleAttrLabel("ovrkar"),roleAttrLabel("sebgol"),roleAttrLabel("ved")];
    S.style=null;S.roles=null;
    ki.verzio=APP_VERSION;
    return ki;});
  const nyers=t=>/ovrkar|sebgol/.test(t);
  ok(!nyers(r.panzer.szoveg)&&!nyers(r.panzer.opciok)&&/Vezérerő \(a Rating és a karizma együtt\)/.test(r.panzer.szoveg),"Panzer: nincs nyers kulcs, a Vezér gazdája „Vezérerő”",r.panzer.opciok.slice(0,200));
  ok(!nyers(r.gegen.szoveg)&&!nyers(r.gegen.opciok)&&/Lesi-erő/.test(r.gegen.szoveg),"Gegenpressing: nincs nyers kulcs, „Vezérerő” és „Lesi-erő”",r.gegen.opciok.slice(0,200));
  ok(JSON.stringify(r.cimke)===JSON.stringify(["Vezérerő","Lesi-erő","Védekezés"]),"a címkék",r.cimke);
  ok(r.panzer.kilog.length===0&&r.gegen.kilog.length===0,"260 px-en sem lóg ki semmi a kártyából",{p:r.panzer.kilog,g:r.gegen.kilog});
  ok(String(r.verzio).localeCompare("3.9.196",undefined,{numeric:true})>=0,"verzió legalább 3.9.196",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
