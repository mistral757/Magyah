/* ⚔🎯 1.0.9.2.00 — STÍLUSGÓLOK A PÁRHARCBAN, A GÓL TÍPUSA MINDKÉT OLDALON.
   KÉRÉS: „Mi is az akadálya annak, hogy legyenek a párharcban is képesség
   gólok? […] És még jobb lenne, ha mindkét oldalon látszana, hogy melyik gól
   milyen típusú: skill gól, csapatstílus gól, vagy sima gól."
   Amit mér:
     1. a pillanatkép viszi a stílus-tervet (rács, gegen, gólétvágy, skill-
        névsor), és nem nagy;
     2. a terv torzítatlan: sok pillanatképen a rácspont kidobott stílusgóljai
        átlagban a várható értéket adják;
     3. a szimuláció: stílusgólok kind/src-vel, a gólszerző a saját csapat
        pályán lévő embere; a sima gólok típust kapnak; a gegen-plafon tart;
        ugyanaz a mag → bitre ugyanaz a lista;
     4. régi (terv nélküli) társ-pillanatkép: nála nincs stílusgól, nincs típus;
     5. egy VALÓDI párharc (playMatch): a gól sorában a típus, a stílusgólnál a
        saját sor; a párharc-elemzés forrásonként bontja;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9187;
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
  await p.waitForFunction(()=>typeof h2hStilusTerv==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
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
    phase="season";S.seasonNumber=3;S.idx=14;
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const mk=(k,tr)=>({key:k,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("tikitaka",{passzrekord:3});S.style2=mk("gegen",{nyomasgyakorlas:3,buntetes:3});
    S.styleExtra=[mk("bombazok",{sortuz:3,goletvagy:3}),mk("panzer",{tankoljunk:3})];
    try{styleLvlCacheClear();}catch(e){}
    ki.aktiv={tt:ttOn(),akc:akcAktiv(),gp:gpOn()&&gpPunishLv(),bz:bzAppetiteLevel()};
    /* 1. a terv a pillanatképben */
    const en=mpMyId();
    const W=JSON.parse(JSON.stringify(h2hWireSnapshot()));W.by=en;
    ki.terv={van:!!W.sty,racs:W.sty&&W.sty.racs.length,gp:!!(W.sty&&W.sty.gp),bz:W.sty&&W.sty.bz,sk:W.sty?Object.keys(W.sty.sk).length:0,
      meret:JSON.stringify(W.sty||{}).length,c:W.sty&&W.sty.c};
    /* 2. torzítatlanság: sok terv, a f=1,00 rácspont */
    let lett=0,vart=0,lettGp=0,vartGp=0;const N=120;
    const MS=buildMatchSnapshot();
    for(let i=0;i<N;i++){
      const t=h2hStilusTerv(MS,[]);if(!t)continue;
      const pt=t.racs.find(x=>x.f===1);
      lett+=pt.l.length;
      vart+=pt.e.tt+Object.values(pt.e.ak).reduce((a,b)=>a+b,0);
      if(t.gp){lettGp+=Math.min(t.gp.cap,t.gp.l.length);vartGp+=t.gp.e;}}
    ki.torz={lett:lett/N,vart:vart/N,lettGp:lettGp/N,vartGp:vartGp/N};
    /* 3–4. a szimuláció */
    const tars=JSON.parse(JSON.stringify(W));
    tars.by="zz-tars";tars.teamName="Társ FC";tars.ovr=W.ovr-2;tars.players.forEach((q,i)=>{q.n="Társ "+(i+1);});
    tars.plan=[];delete tars.sty;
    const sajatNev=new Set(W.players.map(x=>x.n));
    const st={stilus:0,src:{},skill:0,sima:0,tarsKind:0,rosszSc:0,meccs:0,gpTul:0,determ:true};
    /* minden meccshez FRISS pillanatkép (a terv pillanatképenként kidobott) */
    for(let s=0;s<80;s++){
      const Wi=JSON.parse(JSON.stringify(h2hWireSnapshot()));Wi.by=en;
      const sim=h2hSimulate(Wi,tars,h2hMulberry(1000+s),false);
      st.meccs++;
      let gpN=0;
      sim.events.filter(e=>e.type==="goal").forEach(e=>{
        if(e.side==="home"){
          if(e.kind==="stilus"){st.stilus++;st.src[e.src]=(st.src[e.src]||0)+1;if(e.src==="press")gpN++;if(!sajatNev.has(e.scorer))st.rosszSc++;}
          else if(e.kind==="skill")st.skill++;else if(e.kind==="sima")st.sima++;}
        else if(e.kind)st.tarsKind++;});
      if(gpN>(Wi.sty.gp?Wi.sty.gp.cap:0))st.gpTul++;
      if(s<5){const s2=h2hSimulate(Wi,tars,h2hMulberry(1000+s),false);if(JSON.stringify(s2.events)!==JSON.stringify(sim.events))st.determ=false;}}
    ki.sim=st;
    /* skill-címke: a terv névsorába beírt ember gólja „skill" */
    const W2=JSON.parse(JSON.stringify(W));W2.sty.sk={};W2.players.forEach(q=>{W2.sty.sk[q.n]="Gólzsák";});
    let sk2=0,sima2=0;for(let s=0;s<20;s++){h2hSimulate(W2,tars,h2hMulberry(5000+s),false).events.forEach(e=>{if(e.type==="goal"&&e.side==="home"){if(e.kind==="skill"&&e.skn==="Gólzsák")sk2++;if(e.kind==="sima")sima2++;}});}
    ki.skill={sk2,sima2};
    /* 5. egy valódi párharchoz: olyan mag, amelyikben van saját stílusgól */
    let seed=-1,sim0=null;
    for(let s=0;s<200&&seed<0;s++){const sm=h2hSimulate(W,tars,h2hMulberry(9000+s),false);
      const mine=sm.events.filter(e=>e.type==="goal"&&e.side==="home");
      if(mine.some(e=>e.kind==="stilus"&&AKC_DEFS[e.src])&&mine.some(e=>e.kind==="sima"||e.kind==="skill")){seed=s;sim0=sm;}}
    sim0.hf="host";
    window.__P={node:{host:W,guest:tars},sim:sim0};
    ki.valasztott={seed,hg:sim0.hg,ag:sim0.ag,tipusok:sim0.events.filter(e=>e.type==="goal").map(e=>[e.side,e.kind||"-",e.src||""])};
    return ki;});
  console.log(JSON.stringify({aktiv:r.aktiv,terv:r.terv,torz:r.torz,sim:r.sim,skill:r.skill,val:r.valasztott}).slice(0,1500));
  ok(r.terv.van&&r.terv.racs===7&&r.terv.gp&&r.terv.bz>0,"1. a pillanatkép viszi a tervet (7 rácspont, gegen, gólétvágy)",r.terv);
  ok(r.terv.meret<30000,"1. a terv mérete kicsi (<30 kB)",r.terv.meret);
  ok(Math.abs(r.torz.lett-r.torz.vart)<=Math.max(0.12,0.15*r.torz.vart),"2. a rácspont kidobott stílusgóljai átlagban a várható értéket adják (TT + akciók)",r.torz);
  ok(Math.abs(r.torz.lettGp-r.torz.vartGp)<=Math.max(0.12,0.2*r.torz.vartGp),"2. a gegen-büntetés is (a plafonnal)",r.torz);
  ok(r.sim.stilus>0&&Object.keys(r.sim.src).length>=2,"3. a szimulációban vannak stílusgólok, több forrásból",r.sim.src);
  ok(r.sim.rosszSc===0,"3. a stílusgól szerzője mindig a saját csapat embere",r.sim.rosszSc);
  ok(r.sim.sima+r.sim.skill>0,"3. a gólvárhatóság gólja is típust kap (sima / skill)",{sima:r.sim.sima,skill:r.sim.skill});
  ok(r.sim.gpTul===0,"3. a gegen-plafon tart",r.sim.gpTul);
  ok(r.sim.determ,"3. ugyanaz a mag → bitre ugyanaz a lista");
  ok(r.skill.sk2>0&&r.skill.sima2===0,"3. a skill-névsor emberének gólja „skill-gól” a képesség nevével",r.skill);
  ok(r.sim.tarsKind===0,"4. a régi (terv nélküli) társ góljai típus nélkül maradnak",r.sim.tarsKind);
  /* 5. valódi párharc */
  console.log("… valódi párharc lejátszása (≈2 perc)");
  const j=await p.evaluate(()=>new Promise(res=>{
    const out={};
    try{
      const P=window.__P;const sorok=[];const _al=addLine;
      window.addLine=function(h){try{sorok.push(String(h).replace(/<[^>]+>/g,""));}catch(e){}return _al.apply(this,arguments);};
      MP.role="host";_h2hIndult=null;S.auto=true;S.lastMatch=null;
      h2hStart(P.node,P.sim,15,"s3r15x");
      const t0=Date.now();
      const iv=setInterval(()=>{
        if((!S.playing&&S.lastMatch)||Date.now()-t0>200000){
          clearInterval(iv);window.addLine=_al;
          const M=S.lastMatch||{},X=M.mx||{};
          out.gf=M.gf;out.ga=M.ga;out.sim={hg:P.sim.hg,ag:P.sim.ag};
          out.cimke=sorok.filter(s=>/csapatstílus-gól|skill-gól|sima gól/.test(s)).length;
          out.golSor=sorok.filter(s=>/GÓL!/.test(s)).length;   /* a saját gólok (a társ régi, terv nélküli pillanatképpel jön) */
          out.tarsSor=sorok.filter(s=>/Gól:/.test(s)).length;
          out.stilusSor=sorok.filter(s=>/SORTŰZ|TANKOLJUNK|PASSZ!|FELÉBREDT|Tankoljunk|Sortűz/.test(s)).slice(0,3);
          out.forr=X.forr||null;out.pg=X.pg||null;out.exv=X.exv||null;
          let h="";try{h=mxHtml(X);}catch(e){h="HIBA";}
          out.html=/csapatstílus-gól/.test(h);
          res(out);}},500);
    }catch(e){out.err=String(e&&e.stack||e);res(out);}}));
  console.log("párharc:",JSON.stringify(j).slice(0,900));
  ok(!j.err&&j.gf===j.sim.hg&&j.ga===j.sim.ag,"5. a párharc a lista szerint ért véget",j);
  ok(j.cimke>=j.golSor&&j.golSor>0,"5. minden saját gól sorában ott a típus",{cimke:j.cimke,gol:j.golSor});
  ok(j.stilusSor&&j.stilusSor.length>0,"5. a stílusgólnál a saját sor (akció / passzsor)",j.stilusSor);
  ok(j.forr&&Object.keys(j.forr.o||{}).length>0&&j.html,"5. a párharc-elemzés forrásonként bontja, és a gólok listáján a típus",{forr:j.forr,pg:j.pg});
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
