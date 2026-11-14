/* ⚔⚙️ 1.0.9.2.01 — A MOTOR-SZORZÓK A PÁRHARC KÖZÖS GÓLVÁRHATÓSÁGÁBAN.
   KÉRÉS: „ne csak animáció, meg közös esemény szinten, hanem meccsmotor,
   gólvárhatóság, stb szinten is érvényesüljenek ezek. Ahogyan a park the bus
   védekező profilja is, főleg amikor bejön a buszsofőr. Az is látszódjon, hogy
   mikor jön be, és legyen tényleges motorbeli hatása, amiről mindkét oldal
   egységes tudomást szerezzen."
   Amit mér:
     1. a pillanatkép viszi a profilt (lm), a buszsofőr-szabály a csúszkát (bd);
     2. a profil szorzói BETŰRE a λ-n: Villám-fáradás (saját és ellenfél),
        Szárnyak, a 2. félidős hajrá-képesség csak nagy hátrányban;
     3. a buszsofőr: a behívás vödrétől az ellenfél λ-ja ×0,34, a sajátja ×0,75
        (3. szint), a csúszka (bd) betűre a helyi busDial; az esemény viszi a két
        kész szorzót; a könyvelés (busMin, bus, p:bus) előjelesen;
     4. régi pillanatkép (lm nélkül): nincs szorzó, nincs könyvelés; determinisztikus;
     5. VALÓDI párharc: a saját ÉS a társ buszsofőrje is kiíródik (perc, két
        szám, „a társad is ezt látja"), és a párharc-elemzés motor-szorzó blokkja
        mutatja;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9191;
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
  await p.waitForFunction(()=>typeof h2hLmProfil==="function",null,{timeout:15000});
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
    S.style=mk("beton",{buszsofor:3});S.style2=null;S.styleExtra=[];
    try{styleLvlCacheClear();}catch(e){}
    const en=mpMyId();
    const W=JSON.parse(JSON.stringify(h2hWireSnapshot()));W.by=en;
    ki.lmValodi=W.lm||null;
    const tars=JSON.parse(JSON.stringify(W));
    tars.by="zz-tars";tars.teamName="Társ FC";tars.players.forEach((q,i)=>{q.n="Társ "+(i+1);});
    tars.plan=[];delete tars.sty;delete tars.lm;
    const W0=JSON.parse(JSON.stringify(W));delete W0.lm;delete W0.sty;W0.plan=[];
    const sim=(h,a,s)=>h2hSimulate(h,a,h2hMulberry(s),false);
    const ar=(a,b)=>Math.round(a/b*1000)/1000;
    /* 2a. Villám-fáradás: a saját λ ×0,8, az ellenfélé ×1,25 — az 1. vödör (0:0, mindkét ágon azonos) */
    const Wv=JSON.parse(JSON.stringify(W0));Wv.lm={v:1,vo:Array(18).fill(0.8),vp:Array(18).fill(1.25)};
    const b0=sim(W0,tars,77),bv=sim(Wv,tars,77);
    ki.villam={h:ar(bv.lamB[0][0],b0.lamB[0][0]),a:ar(bv.lamB[0][1],b0.lamB[0][1]),x:bv.lm.home.x};
    /* 2b. Szárnyak: két pályán lévő → ×1,06; ha az egyik nincs a pályán → semmi */
    const Ws=JSON.parse(JSON.stringify(W0));Ws.lm={v:1,sz:{p:[[W0.players[9].n,W0.players[10].n]],m:0.06}};
    const Ws2=JSON.parse(JSON.stringify(W0));Ws2.lm={v:1,sz:{p:[[W0.players[9].n,"Nincs Ilyen"]],m:0.06}};
    ki.szarny={be:ar(sim(Ws,tars,77).lamB[0][0],b0.lamB[0][0]),ki:ar(sim(Ws2,tars,77).lamB[0][0],b0.lamB[0][0])};
    /* 2c. hajrá-képesség: csak a 2. félidőben, legalább 2 gólos hátrányban */
    const Wc=JSON.parse(JSON.stringify(W0));Wc.lm={v:1,cl:{n:Object.fromEntries(W0.players.map(q=>[q.n,1])),r:3}};
    const erosTars=JSON.parse(JSON.stringify(tars));erosTars.ovr=W0.ovr+25;
    let clVan=0,clRossz=0,clMeccs=0;
    for(let s=0;s<60;s++){
      const m=sim(Wc,erosTars,300+s);clMeccs++;
      /* a 45. perc utáni vödrök állása az eseménylistából */
      let hg=0,ag=0,felt=false;const gl=m.events.filter(e=>e.type==="goal");
      for(let t=10;t<=18;t++){
        hg=gl.filter(e=>e.side==="home"&&e.min<=(t-1)*5).length;ag=gl.filter(e=>e.side==="away"&&e.min<=(t-1)*5).length;
        if(ag-hg>=2)felt=true;}
      const x=(m.lm.home.x||{}).clutch||0;
      if(x>0)clVan++;
      if(x>0&&!felt&&ag-hg<1)clRossz++;}
    ki.clutch={clVan,clRossz,clMeccs};
    /* 3. buszsofőr a TÁRSNÁL: 1. perctől, 3. szint */
    const busR=(nev,bd)=>({min:1,cond:"barmi",outN:nev,inN:BUS_DRIVER_NAME,gw:0,aw:0,dOvr:0,bus:3,bd});
    const tb=JSON.parse(JSON.stringify(tars));tb.plan=[busR(tars.players[6].n,1)];
    const s0=sim(W0,tars,91),s1=sim(W0,tb,91);
    const be=s1.events.find(e=>e.type==="sub"&&e.bus>0)||null;
    ki.busz={be,h1:ar(s1.lamB[0][0],s0.lamB[0][0]),h2:ar(s1.lamB[1][0],s0.lamB[1][0]),a2:ar(s1.lamB[1][1],s0.lamB[1][1]),
      lm:s1.lm.away,hlm:s1.lm.home,sc0:[s0.events.filter(e=>e.type==="goal"&&e.min<=5).length,s1.events.filter(e=>e.type==="goal"&&e.min<=5).length]};
    const tb2=JSON.parse(JSON.stringify(tars));tb2.plan=[busR(tars.players[6].n,0.5)];
    const s2=sim(W0,tb2,91);const be2=s2.events.find(e=>e.type==="sub"&&e.bus>0)||{};
    ki.buszD={bp:be2.bp,bo:be2.bo,vart:{bp:Math.max(0.05,Math.min(1,1-(1-BUS_OPP_MULT[2])*0.5)),bo:Math.max(0.05,Math.min(1,1-(1-BUS_OWN_MULT[2])*0.5))}};
    /* 4. régi pillanatképek: nincs könyvelés; determinizmus */
    ki.regi={h:b0.lm.home.x,a:b0.lm.away.x,busMin:b0.lm.home.busMin};
    ki.determ=JSON.stringify(sim(Wv,tb,5).events)===JSON.stringify(sim(Wv,tb,5).events);
    /* 5. valódi párharc: saját buszsofőr (egy középpályás helyére) ÉS a társé */
    let kozep=null;
    try{const MS=buildMatchSnapshot();MS.active.forEach(a=>{if(!kozep&&roleInFormation(slots[a.idx].pos,form,a.idx)==="KOZEPPALYAS")kozep=a.p.n;});}catch(e){}
    const Wp=JSON.parse(JSON.stringify(W));Wp.plan=[Object.assign(busR(kozep,1),{min:60})];
    const tp=JSON.parse(JSON.stringify(tars));tp.plan=[Object.assign(busR(tars.players[6].n,1),{min:30})];
    const sp=sim(Wp,tp,4242);sp.hf="host";
    ki.kozep=kozep;ki.spBus=sp.events.filter(e=>e.type==="sub").map(e=>[e.side,e.min,e.bp,e.bo]);
    window.__P={node:{host:Wp,guest:tp},sim:sp};
    return ki;});
  console.log(JSON.stringify(r).slice(0,2500));
  ok(r.lmValodi===null||r.lmValodi.v===1,"1. a pillanatkép profilja (lm) érvényes vagy üres",r.lmValodi);
  ok(r.villam.h===0.8&&r.villam.a===1.25,"2. Villám-fáradás betűre a λ-n (saját ×0,8, ellenfél ×1,25)",r.villam);
  ok(r.villam.x&&r.villam.x.villam<0&&r.villam.x["p:villam"]>0,"2. …és a könyvelés előjelesen (saját −, ellenfélé +)",r.villam.x);
  ok(r.szarny.be===1.06&&r.szarny.ki===1,"2. Szárnyak: csak ha mindketten a pályán (×1,06)",r.szarny);
  ok(r.clutch.clVan>0&&r.clutch.clRossz===0,"2. hajrá-képesség: csak nagy hátrányban, a 2. félidőben",r.clutch);
  ok(r.busz.be&&r.busz.be.min===6&&r.busz.be.bp===0.34&&r.busz.be.bo===0.75,"3. a buszsofőr eseménye a 6. percben, a két kész szorzóval",r.busz.be);
  ok(r.busz.h1===1,"3. a behívás előtt semmi nem változik",r.busz.h1);
  ok(r.busz.sc0[0]!==r.busz.sc0[1]||(Math.abs(r.busz.h2-0.34)<0.006&&Math.abs(r.busz.a2-0.75)<0.006),"3. a behívás vödrétől: ellenfél λ ×0,34, saját ×0,75",{h2:r.busz.h2,a2:r.busz.a2,sc0:r.busz.sc0});
  ok(r.busz.lm&&r.busz.lm.busMin===6&&r.busz.lm.x.bus<0&&r.busz.lm.x["p:bus"]<0&&!Object.keys(r.busz.hlm.x||{}).length,"3. a könyvelés: busMin, saját és ellenfél várható gólja is csökken; a másik oldal üres",r.busz.lm);
  ok(Math.abs(r.buszD.bp-r.buszD.vart.bp)<0.002&&Math.abs(r.buszD.bo-r.buszD.vart.bo)<0.002,"3. a busz-csúszka (bd=0,5) betűre a helyi busDial",r.buszD);
  ok(!Object.keys(r.regi.h||{}).length&&!Object.keys(r.regi.a||{}).length&&r.regi.busMin===undefined,"4. régi pillanatkép: nincs szorzó, nincs könyvelés",r.regi);
  ok(r.determ,"4. ugyanaz a mag → bitre ugyanaz a lista");
  ok(r.kozep&&r.spBus.length===2,"5. a valódi párharc listájában mindkét buszsofőr",r.spBus);
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
          out.sajat=sorok.filter(s=>/^🚌 JÖHET A BUSZSOFŐR!/.test(s.trim())||/JÖHET A BUSZSOFŐR! .*lejön, és a busz keresztbe áll a kapu előtt/.test(s));
          out.tars=sorok.filter(s=>/Társ FC: JÖHET A BUSZSOFŐR!/.test(s));
          out.szam=sorok.filter(s=>/gólesélye(tek)? \d+%-kal zuhan/.test(s));
          out.kozos=sorok.filter(s=>/közös szimuláció ezzel számol/.test(s)).length;
          let h="";try{h=mxHtml(X);}catch(e){h="HIBA";}
          out.html=/Motor-szorzók a közös gólvárhatóságban/.test(h)&&/buszsofőr \(\d+'-től/.test(h);
          out.lm=X.duel&&X.duel.lm||null;
          res(out);}},500);
    }catch(e){out.err=String(e&&e.stack||e);res(out);}}));
  console.log("párharc:",JSON.stringify(j).slice(0,1200));
  ok(!j.err&&j.gf===j.sim.hg&&j.ga===j.sim.ag,"5. a párharc a lista szerint ért véget",{gf:j.gf,ga:j.ga,sim:j.sim,err:j.err});
  ok(j.sajat&&j.sajat.length===1,"5. a saját buszsofőr sora",j.sajat);
  ok(j.tars&&j.tars.length===1,"5. a TÁRS buszsofőrje is kiíródik (perccel)",j.tars);
  ok(j.szam&&j.szam.length===2&&j.kozos===2,"5. mindkettőnél a két szám, és hogy a közös szimuláció ezzel számol",{szam:j.szam,kozos:j.kozos});
  ok(j.html&&j.lm&&j.lm.o&&j.lm.a&&j.lm.o.busMin!=null&&j.lm.a.busMin!=null,"5. az elemzés motor-szorzó blokkja mindkét buszsofőrrel",j.lm);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
