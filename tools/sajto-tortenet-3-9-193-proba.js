/* 🗞️ 3.9.193 — A SZEZON TÖRTÉNETEI A CÍMLAPON.

   BEJELENTÉS: „Lehetnének további újságcikk címek, pl olyanok, amik arról
   beszélnek, hogy eddig milyen az idény, milyen győzelmi, vereség, gyenge, jó
   sorozatban vagyunk, hogy a csapat morál kívülről milyennek látszik, hogy egy
   összeszokott páros mennyire jót tesz most a csapatnak, stb. Használjunk
   többet a meglévő infókból. […] Légy kreatív […] akár humoros cikk
   címekben is."

   Amit mér:
     1. A FORRÁSOK: győzelmi / veretlen / vereség- / gólcsend- / kapott gól
        nélküli széria, élre állás, trónfosztás, előny, félidei mérleg,
        hibátlan idény, morál kívülről, összeszokott páros (párkémia, gyilkos
        páros), gólkirályi kerek szám, kapitány — mind a meglévő
        nyilvántartásból;
     2. A CÍMLAP: esemény nélküli estén a történet a főcím; erős eseménynél
        (pl. mesterhármas) a főcím marad, a történet a rovatba kerül (2★-tól);
     3. ISMÉTLÉSFÉK: a nemrég megírt történet hátrébb sorol, ugyanaz a
        sablon kétszer egymás után nem jön;
     4. MINDEN SABLON kitölthető (nincs „undefined", „NaN", „a(z)");
     5. VALÓDI MECCS: a lefújás után a mérleg címe megkapta a történet-
        réteget, a naplóba is kiírva; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9237;
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
  await p.waitForFunction(()=>typeof pressStoryApply==="function",null,{timeout:15000});

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
    const pA=xs[3].n,pB=xs[4].n,pC=xs[5].n;
    const _rnd=Math.random;
    const lm=(players,gf,ga)=>{S.lastMatch={us:"Teszt FC",them:xs[0].n?"Ellenfél SE":"Ellenfél SE",players,gf,ga};};
    const V0=(key)=>({head:{t:"alap cím",key,paper:"X",stars:1}});
    const kulcsok=(gf,ga)=>{try{return pressStoryCands(V0("win"),{gf,ga}).map(x=>x.key);}catch(e){return ["HIBA "+e];}};
    const tisz=()=>{S.press=null;S.winStreak=0;S.unbeatenStreak=0;S.winlessStreak=0;S.cleanSheetStreak=0;S.morale=60;
      S.chemPairs={};S.passChem={};S.gpDuo={};S.gpDuoMig=1;S.szarny={};S.szarnyMig=1;S.scorers={};S.W=0;S.D=0;S.L=0;S.GF=0;S.GA=0;};
    const _ts=titleSnapshot,_ef=euroFrozen,_tb=teamBond;
    window.euroFrozen=()=>false;window.teamBond=()=>50;
    let SNAP=null;window.titleSnapshot=()=>SNAP;
    const snap=(o)=>Object.assign({teams:new Array(16).fill(0).map((_,i)=>({n:"Csapat "+i,pts:0})),played:10,rank:5,myPts:15,myRem:20,
      leader:{n:"Éllovas SE",pts:20},gap:-5,clinched:false,partial:false},o||{});
    /* ---- 1. A FORRÁSOK ---- */
    tisz();lm([{n:pA,g:1},{n:pB,a:1}],2,0);
    S.winStreak=5;ki.ws=kulcsok(2,0);
    S.winStreak=9;ki.wsBig=kulcsok(2,0);
    tisz();S.unbeatenStreak=7;S.winStreak=1;ki.ub=kulcsok(1,1);
    tisz();lm([{n:pA}],0,1);
    for(let i=0;i<3;i++){const V=V0("loss");pressStoryApply(V,{gf:0,ga:1});}
    ki.ls=kulcsok(0,1);ki.dr=ki.ls.indexOf("dr")>=0;
    tisz();S.cleanSheetStreak=4;lm([{n:pA,g:1}],1,0);ki.cs=kulcsok(1,0);
    tisz();lm([{n:pA,g:1}],1,0);
    SNAP=snap({rank:2});pressStoryApply(V0("win"),{gf:1,ga:0});
    SNAP=snap({rank:1,gap:2});ki.tookLead=kulcsok(1,0);
    pressNote().rk={sz:S.seasonNumber||1,r:1};SNAP=snap({rank:3,gap:-2});ki.lostLead=kulcsok(0,1);
    pressNote().rk={sz:S.seasonNumber||1,r:1};SNAP=snap({rank:1,gap:8,myRem:8});ki.leadRace=kulcsok(1,0);
    SNAP=snap({rank:7,played:15});ki.half=kulcsok(1,0);
    SNAP=snap({rank:15,played:12});ki.bottom=kulcsok(0,1);
    S.W=10;S.D=0;S.L=0;S.GF=40;S.GA=2;SNAP=snap({rank:1,played:10,gap:6,myRem:20});ki.perfect=kulcsok(4,0);
    SNAP=null;
    tisz();S.morale=92;lm([{n:pA}],1,0);ki.morHi=kulcsok(1,0);
    S.morale=20;ki.morLo=kulcsok(0,2);
    tisz();addChemPair(pA,pB,CHEM_PAIR_NEED);lm([{n:pA,g:1},{n:pB,a:1},{n:pC}],2,0);ki.pair=kulcsok(2,0);
    tisz();S.gpDuo={[gpDuoKey(pA,pC)]:{stages:5,built:1,n:0}};lm([{n:pA,g:2},{n:pC,a:1}],3,0);ki.gp=kulcsok(3,0);
    tisz();addChemPair(pA,pB,CHEM_PAIR_NEED);lm([{n:pA,g:1},{n:pB}],1,0);ki.pairNincs=kulcsok(1,0).indexOf("pair")<0;
    tisz();S.scorers={[pA]:10};lm([{n:pA,g:1}],1,0);ki.scorer=kulcsok(1,0);
    S.scorers={[pA]:11};ki.scorerNem=kulcsok(1,0).indexOf("scorer")<0;
    tisz();const kap=slots[captainIdx].player.n;lm([{n:kap,g:1}],1,0);ki.cap=kulcsok(1,0);
    /* ---- 2. A CÍMLAP ---- */
    tisz();S.winStreak=6;lm([{n:pA,g:1}],2,0);
    const _ps=pressStars;
    Math.random=()=>0.1;
    window.pressStars=()=>1;
    let V=V0("win");pressStoryApply(V,{gf:2,ga:0});ki.fo={t:V.head.t,story:V.head.story,rovat:V.head.rovat||null};
    tisz();S.winStreak=6;S.morale=90;
    window.pressStars=()=>2;
    V=V0("hat");V.head.t="Mesterhármas-cím";pressStoryApply(V,{gf:3,ga:0});ki.eros={t:V.head.t,rovat:V.head.rovat||null,rk:V.head.rovatKey};
    tisz();S.winStreak=6;window.pressStars=()=>1;
    V=V0("hat");V.head.t="Mesterhármas-cím";pressStoryApply(V,{gf:3,ga:0});ki.eros1={rovat:V.head.rovat||null};
    /* ---- 3. ISMÉTLÉSFÉK ---- */
    tisz();S.winStreak=6;S.morale=90;window.pressStars=()=>2;
    const egymasutan=[];const sabl=[];
    for(let i=0;i<6;i++){Math.random=()=>0.1;V=V0("win");pressStoryApply(V,{gf:1,ga:0});egymasutan.push(V.head.story);sabl.push(V.head.t);}
    ki.fek={egymasutan,sabl};
    Math.random=_rnd;window.pressStars=_ps;
    /* ---- 4. MINDEN SABLON ---- */
    const c={k:"A Teszt FC",e:"Az Ellenfél SE",s:"2–1",n:12,x:"Kovács",a:"Kiss",b:"Nagy",R:15,r:3,p:28,rem:5,l:"Éllovas SE",g:4,gf:40,ga:3,rec:"9 győzelem, 1 döntetlen, 5 vereség"};
    const rossz=[];let db=0;
    Object.keys(PRESS_ST).forEach(k=>PRESS_ST[k].forEach((f,i)=>{db++;const t=f(c);if(/undefined|NaN|a\(z\)|null/.test(t)||!t.trim())rossz.push(k+i+": "+t);}));
    ki.sablon={db,rossz};
    window.titleSnapshot=_ts;window.euroFrozen=_ef;window.teamBond=_tb;
    tisz();
    ki.verzio=APP_VERSION;
    return ki;});

  const van=(arr,k)=>Array.isArray(arr)&&arr.indexOf(k)>=0;
  console.log("\n— 1. A FORRÁSOK —");
  ok(van(r.ws,"ws")&&van(r.wsBig,"wsBig"),"győzelmi széria (és a nagy széria)",{ws:r.ws,big:r.wsBig});
  ok(van(r.ub,"ub"),"veretlenség",r.ub);
  ok(van(r.ls,"ls")&&r.dr,"vereség-széria és gólcsend (a lap jegyzetéből)",r.ls);
  ok(van(r.cs,"cs"),"kapott gól nélküli széria",r.cs);
  ok(van(r.tookLead,"tookLead"),"élre állás",r.tookLead);
  ok(van(r.lostLead,"lostLead"),"trónfosztás",r.lostLead);
  ok(van(r.leadRace,"leadRace"),"előny a hajrában",r.leadRace);
  ok(van(r.half,"half")&&van(r.bottom,"bottom"),"félidei mérleg, kiesőzóna",{half:r.half,bottom:r.bottom});
  ok(van(r.perfect,"perfect")&&van(r.perfect,"gfa"),"hibátlan idény és gólgyár",r.perfect);
  ok(van(r.morHi,"morHi")&&van(r.morLo,"morLo"),"a morál kívülről (fent és lent)",{hi:r.morHi,lo:r.morLo});
  ok(van(r.pair,"pair")&&van(r.gp,"gp")&&r.pairNincs,"az összeszokott páros, ha MINDKETTEN termeltek (párkémia, gyilkos páros)",{pair:r.pair,gp:r.gp,nincs:r.pairNincs});
  ok(van(r.scorer,"scorer")&&r.scorerNem,"gólkirályi kerek szám — csak amikor épp ma lett kerek",{s:r.scorer,nem:r.scorerNem});
  ok(van(r.cap,"cap"),"a kapitány gólja",r.cap);
  console.log("\n— 2. A CÍMLAP —");
  ok(r.fo.story==="ws"&&/győzelm|siker/.test(r.fo.t)&&!r.fo.rovat,"esemény nélküli estén a történet a főcím (1★: rovat nincs)",r.fo);
  ok(r.eros.t==="Mesterhármas-cím"&&r.eros.rovat&&r.eros.rk,"erős eseménynél a főcím marad, a történet a rovatba kerül (2★)",r.eros);
  ok(!r.eros1.rovat,"1★-nál nincs rovat",r.eros1);
  console.log("\n— 3. ISMÉTLÉSFÉK —");
  const e=r.fek.egymasutan;
  ok(e.some((x,i)=>i>0&&x!==e[i-1]),"a nemrég megírt történet hátrébb sorol (váltakozik)",e);
  ok(r.fek.sabl.every((t,i)=>i===0||t!==r.fek.sabl[i-1]),"ugyanaz a cím kétszer egymás után nem jön",r.fek.sabl);
  console.log("\n— 4. MINDEN SABLON —");
  ok(r.sablon.db>=60&&r.sablon.rossz.length===0,`mind a ${r.sablon.db} sablon kitölthető`,r.sablon.rossz);

  /* ---- 5. VALÓDI MECCS ---- */
  const m=await p.evaluate(async()=>{
    const sorok=[];const _a=addLine;window.addLine=function(h){sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};
    S.auto=true;matchSpeed=20;S.idx=0;try{buildSeasonFixtures();}catch(e){}
    const i0=S.idx;
    try{playMatch();}catch(e){return {err:String(e)};}
    for(let i=0;i<400&&S.idx===i0;i++)await new Promise(r=>setTimeout(r,50));
    for(let i=0;i<100&&!(sorok.some(t=>/📰/.test(t)));i++)await new Promise(r=>setTimeout(r,50));
    S.auto=false;window.addLine=_a;
    const V=S.lastMatch&&S.lastMatch.verdict;
    return {idx:S.idx,story:V&&V.story,cim:V&&V.head&&V.head.t,naplo:sorok.filter(t=>/📰/.test(t)).slice(0,2)};});
  console.log("\n— 5. VALÓDI MECCS —");
  ok(m.story===1&&m.cim&&m.naplo.length>0,"a lefújás után a cím megkapta a történet-réteget, a naplóban is",m);
  ok(String(r.verzio).localeCompare("3.9.193",undefined,{numeric:true})>=0,"verzió legalább 3.9.193",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
