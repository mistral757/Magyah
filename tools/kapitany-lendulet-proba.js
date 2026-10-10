/* ⚡ A KAPITÁNY LENDÜLETE: A ±1 VÁRHATÓ ÉRTÉKE (3.9.223)

   KIMONDOTT KÉRÉS: „a kapitánymeccserő boost számításnál legyen beleszámítva
   egy közelítő értékkel annak a szerepe, hogy egy jó meccs után a kapitány +1
   meccserővel húzza felfelé az egész csapatot, egy rossz meccs után pedig
   lefelé. Ez a számítás alapuljon a várható teljesítményen, és minél több
   konkrét mert teljesítmény van annak pontosabb legyen"

   Amit mér:
     1. A MOTOR SÚLYAI: a becslés P(gi = kapitány) és P(bi = kapitány) értéke
        egyezik a motor valódi sorsolásának gyakoriságával (8000 pillanatkép);
        egy csillagos (stellar) kártyás kapitány gi-esélye nő, bi-esélye 0;
     2. A VÁRHATÓ ÉRTÉK: E = P(gól ∪ gi) − P(bi ∪ piros) — a képlet a részekből;
        a csatár gól-esélye nagyobb, mint a védőé;
     3. A MÉRÉS SÚLYA: mért statisztika nélkül a szerep alapértéke dönt; sok
        mért meccsnél a saját gólaránya; a kapitányként mért löket (S.capLokes)
        a mért meccsek számával egyre inkább felülírja a modellt;
     4. A MECCS UTÁN a löket mérése rögzül (m, összeg), és a mentés viszi;
     5. A KIJELZÉS: a kapitány ⚡ meccserő-összege tartalmazza a lendületet, és
        a részletes szöveg kimondja, miből becsült;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9403;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof capLokesBecsles==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
  await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  /* ---- 1. A MOTOR SÚLYAI ---- */
  const m=await p.evaluate(()=>{
    const o={};
    S.capLokes={};S.careerStats=S.careerStats||{};
    const ci=slots.findIndex(s=>s&&s.player);captainIdx=ci;
    const B=capLokesBecsles(ci);
    const N=8000;let g=0,b=0;
    for(let k=0;k<N;k++){const MS=buildMatchSnapshot();if(MS.gi===ci)g++;if(MS.bi===ci)b++;}
    o.becsGi=B.pGi;o.mertGi=g/N;o.becsBi=B.pBi;o.mertBi=b/N;
    /* csillagos (stellar) kártya: ×2,5 jó-forma súly, rossz formára immunis */
    const n=slots[ci].player.n;const _t=playerCardTier;
    window.playerCardTier=x=>x===n?"stellar":_t(x);
    const D=capLokesBecsles(ci);o.gyemGi=D.pGi;o.gyemBi=D.pBi;
    window.playerCardTier=_t;
    return o;});
  ok(Math.abs(m.becsGi-m.mertGi)<0.015&&Math.abs(m.becsBi-m.mertBi)<0.015,
     `P(gi) becsült ${(m.becsGi*100).toFixed(1)}% / motor ${(m.mertGi*100).toFixed(1)}% · P(bi) ${(m.becsBi*100).toFixed(1)}% / ${(m.mertBi*100).toFixed(1)}%`,m);
  ok(m.gyemGi>m.becsGi*2&&m.gyemBi===0,"csillagos kártyás kapitány: a jó forma esélye nő, a rossz formáé 0",m);

  /* ---- 2–3. A VÁRHATÓ ÉRTÉK ÉS A MÉRÉS SÚLYA ---- */
  const v=await p.evaluate(()=>{
    const o={};
    const ci=captainIdx;const n=slots[ci].player.n;
    S.capLokes={};
    const ures=Object.assign({},S.careerStats[n]||{});
    S.careerStats[n]={g:0,a:0,mvp:0,rc:0,inj:0,saves:0,cs:0,matches:0,min:0};
    const A=capLokesBecsles(ci);
    o.keplet=Math.abs(A.e-((A.pGol+A.pGi-A.pGol*A.pGi)-(A.pBi+A.pPiros-A.pBi*A.pPiros)))<1e-9;
    o.alapGol=A.pGol;o.szerep=A.szerep;
    /* sok mért meccs: 60 meccs 45 gól → a saját arány dönt */
    S.careerStats[n].matches=60;S.careerStats[n].g=45;
    const C=capLokesBecsles(ci);o.sokGol=C.pGol;o.sokArany=-Math.log(1-C.pGol);
    /* csatár vs védő a szerep-alapérték szerint (mérés nélkül) */
    S.careerStats[n].matches=0;S.careerStats[n].g=0;
    const cs=slots.findIndex(s=>s&&s.player&&capLokesSzerep(slots.indexOf(s))==="CSATAR");
    const vd=slots.findIndex(s=>s&&s.player&&capLokesSzerep(slots.indexOf(s))==="VEDO");
    if(cs>=0&&vd>=0){
      const nc=slots[cs].player.n,nv=slots[vd].player.n;
      const sc=S.careerStats[nc],sv=S.careerStats[nv];
      S.careerStats[nc]={g:0,matches:0,rc:0};S.careerStats[nv]={g:0,matches:0,rc:0};
      o.csGol=capLokesBecsles(cs).pGol;o.vdGol=capLokesBecsles(vd).pGol;
      S.careerStats[nc]=sc;S.careerStats[nv]=sv;}
    /* a kapitányként mért löket: 0, 12, 200 meccs, átlag +0,5 */
    const mod=capLokesBecsles(ci).modell;
    o.lok=[0,12,200].map(m=>{S.capLokes[n]={m,s:m*0.5};return capLokesBecsles(ci).e;});
    o.modell=mod;
    S.capLokes={};S.careerStats[n]=ures;
    return o;});
  ok(v.keplet,"E = P(gól ∪ gi) − P(bi ∪ piros)",v.keplet);
  ok(v.csGol>v.vdGol*3,`mérés nélkül a szerep dönt: csatár P(gól) ${(v.csGol*100).toFixed(1)}% · védő ${(v.vdGol*100).toFixed(1)}%`,v);
  ok(Math.abs(v.sokArany-(45+12*0)/72)<0.25&&v.sokGol>0.4,`60 mért meccs, 45 gól: a saját arány felé húz (P(gól) ${(v.sokGol*100).toFixed(0)}%)`,v);
  const [l0,l12,l200]=v.lok;
  ok(Math.abs(l0-v.modell)<1e-9&&Math.abs(l12-(v.modell+0.5)/2)<1e-9&&Math.abs(l200-0.5)<0.03,
     `a mért löket súlya a meccsszámmal nő: 0 → modell (${v.modell.toFixed(3)}), 12 → félúton (${l12.toFixed(3)}), 200 → ≈ mért (${l200.toFixed(3)})`,v.lok);

  /* ---- 4. A MECCS UTÁN RÖGZÜL, A MENTÉS VISZI ---- */
  const r=await p.evaluate(async()=>{
    try{utoLancVege();mEloTorol();}catch(e){}
    S.capLokes={};S.subs={};
    const cn=slots[captainIdx].player.n;
    S.auto=true;S.idx=0;buildSeasonFixtures();playMatch();
    for(let i=0;i<300&&S.idx<6;i++)await new Promise(r=>setTimeout(r,50));
    S.auto=false;for(let i=0;i<60&&S.playing;i++)await new Promise(r=>setTimeout(r,100));
    const L=S.capLokes[cn]||null;
    saveGame();try{saveGameFlush&&saveGameFlush();}catch(e){}
    let raw=null;try{raw=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    return {L,mentes:!!(raw&&raw.S&&raw.S.capLokes&&raw.S.capLokes[cn]),idx:S.idx,capMod:S.capMod};});
  ok(r.L&&r.L.m>=4&&Math.abs(r.L.s)<=r.L.m,"a meccsek után a kapitány lökete mérődik (m meccs, ±1-ek összege)",r);
  ok(r.mentes,"a mentés viszi a mért löketet",r.mentes);

  /* ---- 5. A KIJELZÉS ---- */
  const k=await p.evaluate(()=>{
    const c=captainMsBonus(captainIdx);
    return {ossz:c.ossz,resz:c.mor+c.rut+c.lok,lok:c.lok,txt:captainMsTxt(captainIdx,true)};});
  ok(Math.abs(k.ossz-k.resz)<1e-9&&/lendület/.test(k.txt)&&/(mérése alapján|statisztikájából|várható teljesítményéből)/.test(k.txt),
     "a kapitány ⚡ összege tartalmazza a lendületet, és a szöveg kimondja, miből becsült",k.txt);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
