/* 🧿 TALIZMÁNOK F5 — A MECCS TÍZ TENGELYE (3.9.148).

   Amit mér:
     1. SEMLEGES: talizmán nélkül minden olvasó 1 / 0, a pillanatkép
        talOwn/talOpp 1, és a matchLambdas BITRE ugyanazt adja, mint a mezők
        nélkül;
     2. AZ ÖSSZESZÁMOLÁS: a Meccs lapok tengelyenként, a csökkenő hozammal
        (a kategórián belül erő szerint: 1 · 0,85 · 0,85²…);
     3. A λ: a tengelyek súlyai, a ±8%-os plafon, és a matchLambdas pontosan
        a szorzóval tolja a saját / ellenfél gólvárhatóságot; a párkémia
        pár-bónusza a Gólpasszok tengelyével nő;
     4. A VÁGÁS: a társ gépéről jött hamis érték (100, szöveg) sem lóg ki
        a ±8%-os sávból;
     5. A MECCSERŐ: a hiddenMatchBonus (és a ⚡ teamMatchStrength) pontosan
        a talMeccsOvr-rel nő;
     6. A MÁSODLAGOS CSATORNÁK a dialMul-on át: csatár-gólsúly (a kapusé
        nem), kreatív gólpassz-súly, pontrúgás, kontra-ablak, labdaszerzés,
        bravúr/ziccer és blokk/gólvonal; birtoklás, helyzetszám,
        szabadrúgás, mesterhármas;
     7. A PÁRHARC: a valódi h2hWireSnapshot viszi a három mezőt, a valódi
        h2hSimulate ugyanabból a magból BITRE ugyanazt adja, és a benne hívott
        matchLambdas pontosan a talizmán szorzójával tolja a λ-t;
     8. A MENÜ: a meccserő-sor és a tengely-sor;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9175;
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
const kozel=(a,b,e)=>Math.abs(a-b)<=(e||1e-9);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talMeccsLam==="function",null,{timeout:15000});

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
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;
    addLine=()=>{};
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length;_talAlapMemo=null;};
    window._m=(al,rang,dobas)=>({kat:"meccs",al,rang,dobas:dobas==null?0.5:dobas,spec:null});});

  /* ---- 1. SEMLEGES ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    S.tal=null;_talAlapMemo=null;
    const L=talMeccsLam();
    ki.olvasok=[L.own,L.opp,talMeccsOvr(),talMeccsChem(),talMeccsPoss(),talMeccsOppCh(),talMeccsFkW(),talMeccsFkPP(),talMeccsHat(),
      ...["goalw","assistw","setpiece","counter","gppress","chance"].map(ch=>talMeccsCsat(ch,{pos:"CS",kind:"solo"}))];
    const MS=buildMatchSnapshot();
    ki.snap=[MS.talOwn,MS.talOpp,MS.talChem];
    const a=matchLambdas(MS,80,0);
    const ures=Object.assign({},MS);delete ures.talOwn;delete ures.talOpp;delete ures.talChem;
    const b2=matchLambdas(ures,80,0);
    ki.azonos=a.lf===b2.lf&&a.la===b2.la;
    /* a talizmán-állapot, de Meccs lap nélkül */
    _pakli([{kat:"taktika",valt:"fit",rang:3,dobas:0.5,spec:null}]);
    ki.masikKat=[talMeccsLam().own,talMeccsLam().opp,talMeccsOvr()];
    return ki;});
  console.log("\n— 1. SEMLEGES —");
  ok(n.olvasok.join()==="1,1,0,0,0,1,1,0,1,1,1,1,1,1,1","talizmán nélkül minden olvasó és csatorna semleges",n.olvasok);
  ok(n.snap.join()==="1,1,0"&&n.azonos,"a pillanatkép 1/1/0, és a matchLambdas BITRE ugyanaz, mint a mezők nélkül",{snap:n.snap,azonos:n.azonos});
  ok(n.masikKat.join()==="1,1,0","más kategória talizmánja a meccset nem mozdítja",n.masikKat);

  /* ---- 2–5. ÖSSZESZÁMOLÁS, λ, VÁGÁS, MECCSERŐ ---- */
  const l=await p.evaluate(()=>{
    const ki={};
    /* két Gólok lap: az erősebb teljes, a gyengébb 85% */
    _pakli([_m("gol",1,0.5),_m("gol",4,1)]);
    const E1=talLapE(S.tal.lapok[1]),E2=talLapE(S.tal.lapok[0]);
    ki.gol={kapott:talMeccsE("gol"),vart:E1+0.85*E2,mas:talMeccsE("kapus")};
    const L=talMeccsLam();
    ki.lam={own:L.own,vartOwn:1+Math.min(8,0.8*(E1+0.85*E2))/100,opp:L.opp};
    /* matchLambdas: pontosan a szorzóval */
    const MS=buildMatchSnapshot();
    const ures=Object.assign({},MS,{talOwn:1,talOpp:1,talChem:0});
    const a=matchLambdas(MS,80,0),b2=matchLambdas(ures,80,0);
    ki.arany={lf:a.lf/b2.lf,la:a.la/b2.la,own:MS.talOwn};
    /* a védekező oldal */
    _pakli([_m("kapus",2,0.5),_m("vedes",1,0.5)]);
    const Lk=talMeccsLam(),Ek=talLapE(S.tal.lapok[0]),Ev=talLapE(S.tal.lapok[1]);
    const nagy=Ek>=Ev?[Ek,Ev]:[Ev,Ek];
    ki.ved={opp:Lk.opp,own:Lk.own,
      vart:1-(1.2*Ek*(Ek>=Ev?1:0.85)+0.6*Ev*(Ek>=Ev?0.85:1))/100};
    /* a plafon: tíz legendás Csatárok lap */
    _pakli(Array.from({length:10},()=>_m("csatar",4,1)));
    ki.plafon=talMeccsLam().own;
    /* a párkémia többlete */
    _pakli([_m("passz",3,0.5)]);
    const Ep=talLapE(S.tal.lapok[0]);
    const MSp=Object.assign(buildMatchSnapshot(),{chemPairs:2});
    const cp=matchLambdas(MSp,80,0),cp0=matchLambdas(Object.assign({},MSp,{talChem:0}),80,0);
    ki.chem={arany:cp.lf/cp0.lf,vart:(1+2*(0.03+0.005*Ep))/(1+2*0.03),talChem:MSp.talChem};
    /* a vágás: hamis értékek a társtól */
    const base=Object.assign(buildMatchSnapshot(),{talOwn:1,talOpp:1,talChem:0});
    const r0=matchLambdas(base,80,0);
    const r1=matchLambdas(Object.assign({},base,{talOwn:100,talOpp:-5,talChem:9}),80,0);
    const r2=matchLambdas(Object.assign({},base,{talOwn:"x",talOpp:null}),80,0);
    ki.vagas={own:r1.lf/r0.lf,opp:r1.la/r0.la,szoveg:r2.lf===r0.lf&&r2.la===r0.la};
    /* a meccserő */
    _pakli([_m("gol",3,0.8),_m("kapus",3,0.8)]);
    const h1=hiddenMatchBonus(),t1=teamMatchStrength();
    const o=talMeccsOvr();
    S.tal=null;_talAlapMemo=null;
    const h0=hiddenMatchBonus(),t0=teamMatchStrength();
    ki.ero={dh:h1-h0,dt:t1-t0,o};
    return ki;});
  console.log("\n— 2. ÖSSZESZÁMOLÁS —");
  ok(kozel(l.gol.kapott,l.gol.vart)&&l.gol.mas===0,"a tengely E-összege a csökkenő hozammal (1 · 0,85), a többi tengely 0",l.gol);
  console.log("\n— 3. A λ —");
  ok(kozel(l.lam.own,l.lam.vartOwn)&&l.lam.opp===1,"Gólok: saját λ +0,8% × E, az ellenfélé érintetlen",l.lam);
  ok(kozel(l.arany.lf,l.arany.own)&&kozel(l.arany.la,1),"a matchLambdas pontosan a szorzóval tolja a saját gólvárhatóságot",l.arany);
  ok(kozel(l.ved.opp,l.ved.vart)&&l.ved.own===1,"Kapus + Védések: az ellenfél λ −1,2% és −0,6% × E (a gyengébb lap 85%)",l.ved);
  ok(kozel(l.plafon,1.08),"a λ-tagok ±8%-nál megállnak (tíz legendás lap sem ad többet)",l.plafon);
  ok(kozel(l.chem.arany,l.chem.vart,1e-12),"Gólpasszok: a párkémia pár-bónusza 3% + 0,5% × E",l.chem);
  console.log("\n— 4. A VÁGÁS —");
  ok(kozel(l.vagas.own,1.08)&&kozel(l.vagas.opp,0.92)&&l.vagas.szoveg,"a társtól jött hamis érték is a ±8%-os sávban marad; a nem-szám semleges",l.vagas);
  console.log("\n— 5. A MECCSERŐ —");
  ok(l.ero.o>0&&kozel(l.ero.dh,l.ero.o,1e-9)&&kozel(l.ero.dt,l.ero.o,1e-9),"a hiddenMatchBonus és a ⚡ meccserő pontosan a pakli OVR-egyenértékével nő",l.ero);

  /* ---- 6. MÁSODLAGOS CSATORNÁK ---- */
  const c=await p.evaluate(()=>{
    const ki={};
    const E=al=>{_pakli([_m(al,3,0.5)]);return talLapE(S.tal.lapok[0]);};
    let e=E("csatar");ki.goalw={cs:dialMul("goalw",{pos:"CS"}),kp:dialMul("goalw",{pos:"KP"}),vart:1+0.03*e};
    e=E("passz");ki.assistw={kkp:dialMul("assistw",{pos:"KKP"}),cs:dialMul("assistw",{pos:"CS"}),vart:1+0.04*e};
    e=E("szabad");ki.szabad={set:dialMul("setpiece",{}),fkW:talMeccsFkW(),fkPP:talMeccsFkPP(),vart:[1+0.12*e,0.02*e]};
    e=E("szerzes");ki.szerzes={counter:dialMul("counter",{}),gp:dialMul("gppress",{min:45}),vart:[1+e/COUNTER_WINDOW,1+0.08*e]};
    e=E("vedes");ki.vedes={solo:dialMul("chance",{kind:"solo"}),big:dialMul("chance",{kind:"big"}),block:dialMul("chance",{kind:"block"}),vart:1+0.06*e};
    e=E("vedok");ki.vedok={block:dialMul("chance",{kind:"block"}),line:dialMul("chance",{kind:"line"}),solo:dialMul("chance",{kind:"solo"}),vart:1+0.05*e};
    e=E("tartas");ki.tartas={poss:talMeccsPoss(),oppCh:talMeccsOppCh(),vart:[e,1-0.02*e]};
    e=E("gol");ki.gol={ket:chHatMult("X",{X:2}),egy:chHatMult("X",{X:1}),vart:1+0.03*e};
    const src=playMatch.toString();
    const _all=[...document.scripts].map(x=>x.textContent).join("\n");
    ki.forras={poss:/\+\(\(typeof talMeccsPoss==="function"\)\?talMeccsPoss\(\):0\),20,80\)\);/.test(_all),
      oppch:/poisson\(\(OPPCH_BASE\+la\*OPPCH_RATE\)\/18\*talMeccsOppCh\(\)\)/.test(src),
      fk:/25,24\*talMeccsFkW\(\)\]/.test(src)&&/Math\.random\(\)<0\.35\+talMeccsFkPP\(\)/.test(src)};
    return ki;});
  console.log("\n— 6. MÁSODLAGOS CSATORNÁK —");
  ok(kozel(c.goalw.cs,c.goalw.vart)&&c.goalw.kp===1,"Csatárok: a csatár gólsúlya +3% × E, a kapusé nem",c.goalw);
  ok(kozel(c.assistw.kkp,c.assistw.vart)&&c.assistw.cs===1,"Gólpasszok: a kreatívak (középpálya) gólpassz-súlya +4% × E",c.assistw);
  ok(kozel(c.szabad.set,c.szabad.vart[0])&&kozel(c.szabad.fkW,c.szabad.vart[0])&&kozel(c.szabad.fkPP,c.szabad.vart[1]),"Szabadrúgások: pontrúgás- és szabadrúgás-súly +12% × E, belövés +2 pp × E",c.szabad);
  ok(kozel(c.szerzes.counter,c.szerzes.vart[0])&&kozel(c.szerzes.gp,c.szerzes.vart[1]),"Labdaszerzések: a kontra-ablak +E perc, a labdaszerzés +8% × E",c.szerzes);
  ok(kozel(c.vedes.solo,c.vedes.vart)&&kozel(c.vedes.big,c.vedes.vart)&&c.vedes.block===1,"Védések: ziccer-hárítás és bravúr +6% × E",c.vedes);
  ok(kozel(c.vedok.block,c.vedok.vart)&&kozel(c.vedok.line,c.vedok.vart)&&c.vedok.solo===1,"Védők: blokk és gólvonal-mentés +5% × E",c.vedok);
  ok(kozel(c.tartas.poss,c.tartas.vart[0])&&kozel(c.tartas.oppCh,c.tartas.vart[1]),"Labdatartás: +E pp birtoklás, az ellenfél helyzetszáma −2% × E",c.tartas);
  ok(kozel(c.gol.ket,c.gol.vart)&&c.gol.egy===1,"Gólok: a két gólos játékos gólsúlya (a mesterhármas) +3% × E",c.gol);
  ok(c.forras.poss&&c.forras.oppch&&c.forras.fk,"a meccsmotorban a birtoklás, a helyzetszám és a szabadrúgás a helyén",c.forras);

  /* ---- 7. A PÁRHARC ---- */
  const d=await p.evaluate(()=>{
    const ki={};
    _pakli([_m("gol",3,0.8),_m("csatar",3,0.8),_m("kapus",2,0.5)]);
    buildMatchSnapshot();
    let w=null;try{w=h2hWireSnapshot();}catch(e){ki.hiba=String(e);}
    if(!w)return ki;
    ki.mezok={talOwn:w.talOwn,talOpp:w.talOpp,talChem:w.talChem};
    const nelkul=Object.assign({},w,{talOwn:1,talOpp:1,talChem:0});
    const sim=(h,a,seed)=>h2hSimulate(JSON.parse(JSON.stringify(h)),JSON.parse(JSON.stringify(a)),rngFor("f5proba:"+seed),false);
    const e1=sim(w,nelkul,7),e2=sim(w,nelkul,7);
    ki.determin=JSON.stringify(e1)===JSON.stringify(e2);
    /* A PÁRHARC λ-JA: a valódi h2hSimulate hívja a matchLambdas-t — elkapjuk,
       mit ad a hazai oldalra talizmánnal és nélküle (ugyanaz a mag). */
    const _ml=matchLambdas;let rog=[];
    matchLambdas=function(){const r=_ml.apply(this,arguments);rog.push(r);return r;};
    let L1,L0;
    try{
      rog=[];sim(w,nelkul,11);L1=rog[0];
      rog=[];sim(nelkul,nelkul,11);L0=rog[0];
    }finally{matchLambdas=_ml;}
    ki.lam={lf:L1.lf/L0.lf,la:L1.la/L0.la,own:w.talOwn,opp:w.talOpp};
    return ki;});
  console.log("\n— 7. A PÁRHARC —");
  ok(d.mezok&&d.mezok.talOwn>1&&d.mezok.talOpp<1&&d.mezok.talChem===0,"a valódi h2hWireSnapshot viszi a három mezőt",d.mezok||d.hiba);
  ok(d.determin,"ugyanabból a magból a h2hSimulate BITRE ugyanazt adja");
  ok(d.lam&&kozel(d.lam.lf,d.lam.own,1e-12)&&kozel(d.lam.la,d.lam.opp,1e-12),"a párharc szimulációjában a hazai λ pontosan a talizmán szorzójával tolódik (saját és ellenfél oldal)",d.lam);

  /* ---- 8. A MENÜ ---- */
  const m=await p.evaluate(()=>{
    _pakli([_m("gol",3,0.5)]);
    talMenuOpen();const t=$("talHatas").textContent;talMenuClose();
    return t;});
  console.log("\n— 8. A MENÜ —");
  ok(/meccserő — saját gólvárhatóság \+/.test(m)&&/⚽ Gólok: saját gólvárhatóság/.test(m)&&/λ-plafon ±8%/.test(m),"a meccserő-sor és a tengely-sor",m.slice(0,300));

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
