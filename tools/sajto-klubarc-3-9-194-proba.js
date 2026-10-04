/* 🗞️ 3.9.194 — A LAP A TE KLUBODRÓL SZÓL.

   BEJELENTÉS: „Ja hát persze, a csapatstílust is bele lehet vonni, meg az
   edzőt, meg ilyesmi! Szerintem ezek mind növelnék az immerziot. Akár a
   stadion nevét is, stb. Szóval ez legyen egy felület ami még növeli azt az
   élményt, hogy mindez a te csapatodról szól"

   Amit mér:
     1. A CSAPATSTÍLUS: mind a nyolc filozófia saját címet kap a saját
        feltételénél (Gegenpressing: a meccs labdaszerzései; Panzer; Beton;
        Bombázók; Béke és harmónia; Villám; Tiki-Taka; Sztárom a párom —
        a sztár jó és láthatatlan estéje), és a ki nem választott stílus
        nem szól bele;
     2. AZ EDZŐ ÉS A TAKTIKA: az edző neve a címben (győzelem, sorozat,
        fekete széria), a taktika neve;
     3. A STADION: a saját (vagy szponzorált) stadionnév a hazai címben;
        idegenbeli győzelem; a menedzser éve az idénynyitón;
     4. A ROVATOK: a cím fölött a rovat neve, a rovat-sor lehetőleg másik
        rovatból; a napló is kiírja;
     5. minden sablon kitölthető; verzió; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9238;
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
  await p.waitForFunction(()=>typeof pressRovatCim==="function",null,{timeout:15000});

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


    window.saveGame=()=>{};
    const xs=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    const pA=xs[3].n,pB=xs[4].n;
    const _rnd=Math.random,_shl=styleHasLive,_ts=titleSnapshot,_ef=euroFrozen,_fs=fameStarName,_tb=teamBond;
    window.euroFrozen=()=>false;window.teamBond=()=>50;
    let SNAP=null;window.titleSnapshot=()=>SNAP;
    let ELO=null;window.styleHasLive=k=>k===ELO;
    const lm=(players,gf,ga)=>{S.lastMatch={us:"Teszt FC",them:"Ellenfél SE",players,gf,ga};};
    const V0=k=>({head:{t:"alap cím",key:k,paper:"X",stars:1}});
    const kulcsok=(gf,ga,home)=>{try{return pressStoryCands(V0("win"),{gf,ga,home}).map(x=>x.key);}catch(e){return ["HIBA "+e];}};
    const cand=(gf,ga,home,key)=>{try{return pressStoryCands(V0("win"),{gf,ga,home}).find(x=>x.key===key)||null;}catch(e){return null;}};
    const tisz=()=>{S.press=null;S.winStreak=0;S.unbeatenStreak=0;S.winlessStreak=0;S.cleanSheetStreak=0;S.morale=60;
      S.chemPairs={};S.passChem={};S.gpDuo={};S.gpDuoMig=1;S.szarny={};S.szarnyMig=1;S.scorers={};S.W=0;S.D=0;S.L=0;S.GF=0;S.GA=0;S._gpThis=0;};
    /* ---- 1. A CSAPATSTÍLUS ---- */
    tisz();
    ELO="gegen";S._gpThis=6;lm([{n:pA,g:1}],2,0);ki.gegen=cand(2,0,true,"stGegen");
    S._gpThis=2;ki.gegenKevés=!kulcsok(2,0,true).includes("stGegen");
    ELO="panzer";S._gpThis=0;lm([{n:pA,g:2}],3,0);ki.panzer=kulcsok(3,0,true).includes("stPanzer");
    ELO="beton";lm([{n:pA,g:1}],1,0);ki.beton=kulcsok(1,0,true).includes("stBeton");
    ELO="bombazok";lm([{n:pA,g:3}],4,1);ki.bomba=kulcsok(4,1,true).includes("stBomba");
    ELO="harmonia";S.morale=80;lm([{n:pA}],1,1);ki.harm=kulcsok(1,1,true).includes("stHarm");S.morale=60;
    ELO="villam";lm([{n:pA,g:2}],2,0);ki.villam=kulcsok(2,0,true).includes("stVillam");
    ELO="tikitaka";ki.tiki=kulcsok(2,0,true).includes("stTiki");
    ELO="sztar";window.fameStarName=()=>pA;
    lm([{n:pA,g:1}],2,0);ki.sztarJo=cand(2,0,true,"stSztarJo");
    lm([{n:pA}],0,2);ki.sztarRossz=kulcsok(0,2,true).includes("stSztarRossz");
    window.fameStarName=_fs;
    ELO=null;lm([{n:pA,g:3}],4,0);ki.nincsStilus=!kulcsok(4,0,true).some(k=>/^st[A-Z]/.test(k));
    /* ---- 2. AZ EDZŐ ÉS A TAKTIKA ---- */
    tisz();const cn=shortName(coach.n);
    lm([{n:pA,g:1}],1,0);
    const cw=cand(1,0,true,"coachWin");ki.coachWin=cw?pressStoryPick("coachWin",cw.c):"";
    const P0=S.press;for(let i=0;i<3;i++)pressStoryApply(V0("loss"),{gf:0,ga:1,home:true});
    lm([{n:pA}],0,1);
    const ch=cand(0,1,true,"coachHot");ki.coachHot=ch?pressStoryPick("coachHot",ch.c):"";
    S.tactics=S.tactics||{};const _ta=S.tactics.active;S.tactics.active="kontra";
    lm([{n:pA,g:1}],1,0);const tw=cand(1,0,true,"tacW");ki.tacW=tw?pressStoryPick("tacW",tw.c):"";
    S.tactics.active=_ta;
    ki.cn=cn;
    /* ---- 3. A STADION ---- */
    tisz();const I=identState(),_st=I.stadium;I.stadium="Lóverseny Aréna";
    lm([{n:pA,g:1}],2,0);const hw=cand(2,0,true,"homeW");
    ki.homeW=hw?[0,1,2].map(i=>PRESS_ST.homeW[i](hw.c)):[];
    lm([{n:pA}],0,1);const hl=cand(0,1,true,"homeL");ki.homeL=hl?PRESS_ST.homeL[0](hl.c):"";
    lm([{n:pA,g:1}],1,0);ki.awayW=kulcsok(1,0,false).includes("awayW")&&!kulcsok(1,0,false).includes("homeW");
    SNAP={teams:new Array(16).fill(0).map((_,i)=>({n:"Cs"+i,pts:0})),played:1,rank:3,myPts:3,myRem:29,leader:{n:"Éllovas",pts:3},gap:0,clinched:false,partial:false};
    S.seasonNumber=5;const mg=cand(1,0,true,"mgr");ki.mgr=mg?PRESS_ST.mgr[0](mg.c):"";SNAP=null;
    I.stadium=_st;
    /* ---- 4. A ROVATOK ---- */
    tisz();S.winStreak=6;ELO="bombazok";lm([{n:pA,g:3}],4,0);
    window.styleHasLive=k=>k==="bombazok";
    const _ps=pressStars;window.pressStars=()=>3;Math.random=()=>0.1;
    const V=V0("win");pressStoryApply(V,{gf:4,ga:0,home:true});
    ki.rovat={cim:V.head.t,storyCim:V.head.storyCim,rovat:V.head.rovat,rovatCim:V.head.rovatCim};
    let html="";try{html=mVerdictPressHtml(V).replace(/<[^>]+>/g," ").replace(/\s+/g," ");}catch(e){html="HIBA "+e;}
    ki.html=html;
    const sorok=[];const _a=addLine;window.addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{V.txt="mérleg";V.score=50;V.label="x";V.parts="";V.fed=false;_mVerdictPending=V;mVerdictFlush();}catch(e){sorok.push("HIBA "+e);}finally{window.addLine=_a;}
    ki.naplo=sorok.find(t=>/📰/.test(t))||"";
    Math.random=_rnd;window.pressStars=_ps;
    /* ---- 5. MINDEN SABLON ---- */
    const c={k:"A Teszt FC",e:"Az Ellenfél SE",s:"2–1",n:12,x:"Kovács",a:"Kiss",b:"Nagy",R:15,r:3,p:28,rem:5,l:"Éllovas SE",g:4,gf:40,ga:3,
      rec:"9 győzelem, 1 döntetlen, 5 vereség",cn:"Gárdista",tn:"Hosszú labdák",st:"Teszt Aréna",fans:"40 000",sn:5};
    const rossz=[];let db=0,nincsRovat=[];
    Object.keys(PRESS_ST).forEach(k=>{if(pressRovatCim(k)==="Szezonrovat")nincsRovat.push(k);
      PRESS_ST[k].forEach((f,i)=>{db++;const t=f(c);if(/undefined|NaN|a\(z\)|null/.test(t)||!t.trim())rossz.push(k+i+": "+t);});});
    ki.sablon={db,rossz,nincsRovat};
    window.styleHasLive=_shl;window.titleSnapshot=_ts;window.euroFrozen=_ef;window.teamBond=_tb;
    tisz();
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. A CSAPATSTÍLUS —");
  ok(r.gegen&&r.gegen.c.n===6&&r.gegenKevés,"Gegenpressing: a meccs labdaszerzései (4-től)",r.gegen&&r.gegen.c.n);
  ok(r.panzer&&r.beton&&r.bomba&&r.harm&&r.villam&&r.tiki,"Panzer, Beton, Bombázók, Harmónia, Villám, Tiki-Taka a saját feltételénél",
     {panzer:r.panzer,beton:r.beton,bomba:r.bomba,harm:r.harm,villam:r.villam,tiki:r.tiki});
  ok(r.sztarJo&&r.sztarRossz,"Sztárom a párom: a sztár jó és láthatatlan estéje",{jo:!!r.sztarJo,rossz:r.sztarRossz});
  ok(r.nincsStilus,"ki nem választott stílus nem szól bele");
  console.log("\n— 2. AZ EDZŐ ÉS A TAKTIKA —");
  ok(r.coachWin.indexOf(r.cn)>=0,"az edző neve a győzelmi címben",r.coachWin);
  ok(r.coachHot.indexOf(r.cn)>=0&&/vereség|széria/.test(r.coachHot),"fekete széria: inog az edző széke",r.coachHot);
  ok(/Gyors kontra/.test(r.tacW),"a taktika neve",r.tacW);
  console.log("\n— 3. A STADION —");
  ok(r.homeW.length===3&&r.homeW.every(t=>/Lóverseny Aréna|Hazai pálya/.test(t)),"a stadion neve a hazai címben",r.homeW);
  ok(/Lóverseny Aréna/.test(r.homeL),"hazai vereség: néma lelátók",r.homeL);
  ok(r.awayW,"idegenbeli győzelem külön cím");
  ok(/Rajtol az 5\. év/.test(r.mgr),"idénynyitó: a menedzser éve",r.mgr);
  console.log("\n— 4. A ROVATOK —");
  ok(r.rovat.storyCim&&r.rovat.rovatCim&&r.rovat.storyCim!==r.rovat.rovatCim,"a főcím és a rovat-sor más rovatból",r.rovat);
  ok(r.html.indexOf(r.rovat.storyCim)>=0&&r.html.indexOf(r.rovat.rovatCim)>=0,"a mérleg ablaka kiírja a rovatneveket",r.html);
  ok(r.naplo.indexOf(r.rovat.rovatCim)>=0,"a napló is",r.naplo);
  console.log("\n— 5. MINDEN SABLON —");
  ok(r.sablon.rossz.length===0&&r.sablon.nincsRovat.length===0&&r.sablon.db>=100,`mind a ${r.sablon.db} sablon kitölthető, mindegyik témának van rovata`,r.sablon);
  ok(String(r.verzio).localeCompare("3.9.194",undefined,{numeric:true})>=0,"verzió legalább 3.9.194",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
