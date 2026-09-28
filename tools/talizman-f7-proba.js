/* 🧿 TALIZMÁNOK F7 — HALMOZÓDÁS, FÚZIÓ, ÉGETÉS, REZONANCIA, ÖSSZHATÁS (3.9.159).

   KIMONDOTT DÖNTÉS: „a színhűség maradjon, és fussanak együtt" — a 3/5/8-as
   színhűség mellé az 5 lapos rezonancia-képesség és a 7 lapos Mesterlap.

   Amit mér:
     1. ÉGETÉS: csak a nyári ablakban, idényenként egyszer; a pro és a kontra
        megszűnik, +3 szerencse; a lap áthúzva marad; a menü gombja és a
        megerősítés;
     2. FÚZIÓ: a kínálat kis eséllyel birtokolt speciált hoz (külön seedelt
        dobás: a fő kínálat véletlenje érintetlen); az összeolvasztás eggyel
        ritkább lapot ad a jobbik dobással; két legendásból Mítosz; a húzás-
        ablak kétféle döntést kínál;
     3. REZONANCIA: mind a 10 képesség a valódi olvasón (köd, stíluspont,
        taktika-váltás, második esély, kártya-POT, Szakértelem, +1 lap,
        morál-padló, hitel és befektetés, a legerősebb tengely);
     4. MESTERLAP: 7 lapnál a következő kínálatban legendás lap abból a színből,
        és csak egyszer;
     5. POLIHISZTOR: tíz színnél egyszer egy legendás, special nélküli lap;
     6. ARCHETÍPUS: a szezonzáró jelentésben és a párharc-csapatlapon (a
        megtisztítás után is);
     7. ÖSSZHATÁS ÉS SZŰRŐ: a fülek, a területenkénti mérleg, a szín- és
        ritkaság-szűrő;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9198;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=(e==null?1e-9:e)+1e-12;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talRez==="function",null,{timeout:15000});
  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;S.transferBudget=5e9;S.morale=60;
    if(!scout)scout=generateScout();
    if(!S.tactics)S.tactics={active:null,levels:{}};
    if(!S.tactics.active||!TACTICS[S.tactics.active]){S.tactics.active="kontra";S.tactics.levels.kontra=80;}
    addLine=()=>{};saveGame=()=>{};fanWeeklyIncome=()=>1000000;
    window._nyar=v=>{twClosedNow=()=>!v;twWindowOpen=()=>false;};
    /* lapok: [kat, rang, spec|null, valt] */
    window._pakli=(lista)=>{
      S.tal=null;const T=talState();
      T.lapok=lista.map(([kat,rang,spec,valt],i)=>{const K=talKat(kat);
        const L={kat,rang,dobas:0.5,spec:spec||null,uid:i+1,szezon:S.seasonNumber||1};
        if(kat==="meccs")L.al=valt||"gol";else L.valt=valt||K.valt[0].k;return L;});
      T.seq=lista.length;T.huzas=5;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;_talKtx=null;return T;};
    window._szin=(kat,db,valt)=>Array.from({length:db},()=>[kat,1,null,valt]);});

  /* ---- 1. ÉGETÉS ---- */
  const eg=await p.evaluate(()=>{
    const ki={};
    const T=_pakli([["fejlodes",2,"specialista"],["bank",1,null]]);
    ki.elotte=talFoEdzMult();
    _nyar(false);ki.telen=talEgetheto(T.lapok[0]).ok;
    _nyar(true);T.szerencse=4;
    const r=talEget(1);ki.ok=r.ok;ki.utana=talFoEdzMult();ki.szer=T.szerencse;ki.jelzo=T.lapok[0].eget===1;
    ki.masodik=talEget(2).ok;ki.eloszl=talEloszlas().fejlodes;
    talMenuOpen();ki.athuz=!!document.querySelector("#talGrid .talCard.eget");
    S.seasonNumber=4;talMenuRender();ki.gomb=!!document.querySelector("[data-tal^='eget:']");
    talMenuClose();S.seasonNumber=3;
    return ki;});
  console.log("\n— 1. ÉGETÉS —");
  /* a Specialista ritka lapon: 15 × 1,4 (a ritkaság pro-skálája) = +21% */
  ok(kozel(eg.elotte,1.21)&&!eg.telen&&eg.ok&&eg.utana===1&&eg.szer===7&&eg.jelzo,"csak a nyári ablakban; a pro és a kontra megszűnik, +3 szerencse",eg);
  ok(!eg.masodik&&eg.eloszl===0&&eg.athuz&&eg.gomb,"idényenként egyszer; a lap áthúzva marad a gyűjteményben, és nem számít a színbe; jövőre újra lehet (gomb)",eg);

  /* ---- 2. FÚZIÓ ---- */
  const fu=await p.evaluate(()=>{
    const ki={};
    /* a kínálat: birtokolt speciál kis eséllyel — sok kulccsal megszámoljuk */
    const T=_pakli([["stab",2,"mentor"],["stab",1,"lojalis"],["stab",1,"fokusz"]].concat(_szin("stab",2)));
    let dup=0,db=0;
    for(let i=0;i<400;i++){const kin=talKinalat("fuzproba"+i);kin.forEach(L=>{if(L.spec){db++;if(talFuzioJelolt(L))dup++;}});}
    ki.dupArany=dup/db;
    /* a fő véletlen érintetlen: a fúzió-dobás nélkül is ugyanaz a kategória- és ritkaság-sor */
    const k1=talKinalat("stabil").map(L=>L.kat+L.rang).join(),k2=talKinalat("stabil").map(L=>L.kat+L.rang).join();
    ki.seedelt=k1===k2;
    /* az összeolvasztás */
    T.varo=[{id:"fz1",forras:"utem",n:1,szezon:3,fordulo:5}];
    T.varo[0].kinalat=[{kat:"stab",rang:2,dobas:0.9,spec:"mentor",valt:"hatas",cimke:"x"}];
    const n0=T.lapok.length;
    const O=talValaszt(0,{fuzio:true});
    ki.fuz={rang:O.rang,dobas:O.dobas,db:T.lapok.length-n0,fuzio:O.fuzio};
    /* két legendás → Mítosz */
    const T2=_pakli([["meccs",4,"betonfal","kapus"]]);
    T2.varo=[{id:"fz2",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[{kat:"meccs",rang:4,dobas:0.2,spec:"betonfal",al:"kapus",cimke:"x"}]}];
    const M=talValaszt(0,{fuzio:true});ki.mitosz=M.rang;ki.mitoszJel=TAL_RANG[5].n;ki.mitoszSzam=talSpecV("betonfal","pro");
    /* 3.9.162: a legendás gyűjt — az első nem legendás fúzió után még legendás, a második után Mítosz */
    const T4=_pakli([["stab",4,"mentor"]]);
    const kor=r=>{T4.varo=[{id:"fz4"+r,forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[{kat:"stab",rang:r,dobas:0.3,spec:"mentor",valt:"hatas",cimke:"x"}]}];
      return talValaszt(0,{fuzio:true}).rang;};
    ki.gyujt=[kor(2),kor(1)];
    /* a húzás-ablak: a fúzió-gomb és a „külön lapként" */
    const T3=_pakli([["stab",2,"mentor"]]);
    T3.varo=[{id:"fz3",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[{kat:"stab",rang:3,dobas:0.4,spec:"mentor",valt:"hatas",cimke:"x"},{kat:"bank",rang:1,dobas:0.4,spec:null,valt:"bevetel",cimke:"y"}]}];
    talDrawOpen(()=>{});
    document.querySelectorAll("#talDrawCards .talPickBtn")[0].click();
    ki.gombLatszik=!$("talDrawFuse").classList.contains("hide");ki.gombSzoveg=$("talDrawFuse").textContent;
    ki.tag=/összeolvasztható/.test($("talDrawCards").textContent);
    document.querySelectorAll("#talDrawCards .talPickBtn")[1].click();
    ki.masikNincs=$("talDrawFuse").classList.contains("hide");
    document.querySelectorAll("#talDrawCards .talPickBtn")[0].click();
    $("talDrawFuse").click();
    ki.ablakUtan={lapok:talState().lapok.length,rang:talState().lapok[0].rang};
    return ki;});
  console.log("\n— 2. FÚZIÓ —");
  ok(fu.dupArany>0.01&&fu.dupArany<0.4&&fu.seedelt,"a kínálat kis eséllyel birtokolt speciált hoz, és seedelt marad",{a:fu.dupArany,s:fu.seedelt});
  ok(fu.fuz.rang===3&&kozel(fu.fuz.dobas,0.9)&&fu.fuz.db===0&&fu.fuz.fuzio===1,"ritka + ritka → nagyon ritka, a jobbik dobással, új lap nélkül",fu.fuz);
  /* a Betonfal ritkától él: a Mítosz pro-ja 3 × 3,9 / 1,4 */
  ok(fu.gyujt[0]===4&&fu.gyujt[1]===5,"a legendás gyűjt: az első nem legendás fúzió után legendás marad, a második után Mítosz",fu.gyujt);
  ok(fu.mitosz===5&&fu.mitoszJel==="Mítosz"&&kozel(fu.mitoszSzam,3*3.9/1.4,1e-9),"két legendás → Mítosz (a special a Mítosz-skálán)",fu);
  /* a meglévő ritka (2) és a kínált nagyon ritka (3): a nagyobbik + 1 = legendás */
  ok(fu.gombLatszik&&/legendás/.test(fu.gombSzoveg)&&fu.tag&&fu.masikNincs&&fu.ablakUtan.lapok===1&&fu.ablakUtan.rang===4,
    "a húzás-ablak: a birtokolt speciálnál „Összeolvasztom\" gomb és jelzés, a másik lapnál nincs; a gomb összeolvaszt",fu);

  /* ---- 3. REZONANCIA ---- */
  const rz=await p.evaluate(()=>{
    const ki={};
    /* 4 lap: még nincs · 5 lap: van */
    _pakli(_szin("stilus",4,"fa"));ki.negy=talRez("stilus");const sp4=talSpSzorzo(false);
    _pakli(_szin("stilus",5,"fa"));ki.ot=talRez("stilus");ki.stilus=talSpSzorzo(false)/sp4;ki.stilusMasod=talSpSzorzo(true);
    _pakli(_szin("fejlodes",5,"tempo"));
    {const e={pot:3000,peak:80};const o=Math.random;Math.random=()=>0;
      _pakli([]);const a=cardApplyPot(Object.assign({},e),"gold",1);
      _pakli(_szin("fejlodes",5,"tempo"));const bb=cardApplyPot(Object.assign({},e),"gold",1);Math.random=o;ki.kartya=bb/a;}
    _pakli(_szin("moral",5,"legkor"));ki.padlo=talMoralPadlo();S.morale=40;talSpMoral(-30,"x");ki.padloMor=S.morale;S.morale=60;
    _pakli(_szin("bank",5,"hitel"));ki.bankInv=talInvestMult();
    /* öt hitel-lap: a keret az 5. lépcső (5% kamat) — a rezonanciával 3% */
    {const K=talHitelKeret();ki.kamat=K&&K.kamat;ki.kamat0=TAL_HITEL_FOK[K.fok].kamat;}
    _pakli(_szin("joker",5,"vad"));ki.jokerLap=talKinalat("rezj").length;
    _pakli(_szin("meccs",5,"gol").concat([["meccs",1,null,"kapus"]]));
    /* ugyanaz a pakli rezonancia nélkül (a talRez ideiglenesen kikapcsolva) */
    {const v=talAlapMind();ki.tengely=v["meccs.gol"];
     const _r=talRez;talRez=()=>false;_talAlapMemo=null;
     try{ki.tengely4=talAlapMind()["meccs.gol"];}finally{talRez=_r;_talAlapMemo=null;}}
    /* stáb: +1 Sz a szezonváltáskor */
    _pakli(_szin("stab",5,"hatas"));
    S.staff=[{n:"Stáb Egy",type:"morale",sz:40,szBase:40,age:40,xp:0,focus:{mode:"team"}}];
    talSpecSzezonvaltas();ki.stabSz=S.staff[0].sz;
    /* taktika: a váltás utáni 3 meccsen a jobbik hatás */
    _pakli(_szin("taktika",5,"fit"));
    S.tactics.levels.kontra=95;S.tactics.levels.labdabirtoklas=60;S.tactics.active="kontra";
    const jo=tacticEffect();
    talRezTaktValtas("kontra");S.tactics.active=Object.keys(TACTICS).find(k=>k!=="kontra");S.tactics.levels[S.tactics.active]=60;
    ki.takt=[tacticEffect(),jo,tacticEffectFor(S.tactics.active)];
    talSpecMeccsUtan();talSpecMeccsUtan();talSpecMeccsUtan();ki.taktUtan=tacticEffect();
    S.tactics.active="kontra";
    /* igazolás: a második esély ablakonként egyszer */
    _pakli(_szin("igazolas",5,"tiszta"));ki.igaz1=talRezIgazSzabad();talRezIgazHasznal();ki.igaz2=talRezIgazSzabad();
    ki.igazKod=/talRezIgazSzabad\(\)/.test(twSigningResult.toString());
    /* scout: az első jelölt köd nélkül (a forrásban) */
    _pakli(_szin("scout",5,"lista"));ki.scout=talRez("scout");
    ki.scoutKod=/_ci===0&&talRez\("scout"\)/.test(document.documentElement.innerHTML);
    return ki;});
  console.log("\n— 3. REZONANCIA (5 LAP) —");
  ok(!rz.negy&&rz.ot&&kozel(rz.stilus,1.05,1e-9)&&kozel(rz.stilusMasod,1.05,1e-9),"🎭 4 lapnál még nincs, 5-nél van: stíluspont +5% (a másodlagosé is)",rz);
  ok(kozel(rz.kartya,1.10,0.01),"🌱 a szezonkártya POT-ajándéka +10%",rz.kartya);
  ok(rz.padlo===35&&rz.padloMor===35,"❤️ a morál nem esik 35 alá",rz);
  ok(kozel(rz.bankInv,2.2,1e-9)&&kozel(rz.kamat0-rz.kamat,0.02,1e-9),"💰 a Befektetés ×2,2, a hitelkamat −2 pp",rz);
  ok(rz.jokerLap===4,"🃏 a húzáson eggyel több lap",rz.jokerLap);
  ok(kozel(rz.tengely-rz.tengely4,2,1e-9),"⚽ a legerősebb tengely +2 E (ugyanaz a pakli, rezonanciával és nélküle)",{vele:rz.tengely,nelkule:rz.tengely4});
  ok(rz.stabSz===41,"🎓 idényenként minden stábtag +1 Szakértelem",rz.stabSz);
  ok(kozel(rz.takt[0],Math.max(rz.takt[1],rz.takt[2]),1e-12)&&rz.takt[0]>rz.takt[2]&&kozel(rz.taktUtan,rz.takt[2],1e-12),
    "📋 a váltás utáni 3 meccsen a régi rendszer hatása számít, utána az újé",{t:rz.takt,u:rz.taktUtan});
  ok(rz.igaz1&&!rz.igaz2&&rz.igazKod,"🤝 a második esély ablakonként egyszer, a meghiúsult tárgyaláson",rz);
  ok(rz.scout&&rz.scoutKod,"🔭 a felderítés első jelöltje köd nélkül",rz);

  /* ---- 4. MESTERLAP ---- */
  const ms=await p.evaluate(()=>{
    const ki={};
    const T=_pakli(_szin("bank",6,"bevetel"));
    T.varo=[{id:"ms1",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[{kat:"bank",rang:1,dobas:0.4,spec:null,valt:"bevetel",cimke:"x"}]}];
    talValaszt(0);
    ki.var=talMesterVar();
    const kin=talKinalat("mester1");const L=kin.find(x=>x.mester);ki.lap=L?{kat:L.kat,rang:L.rang,cimke:L.cimke}:null;
    T.varo=[{id:"ms2",forras:"utem",n:1,szezon:3,fordulo:6,kinalat:kin}];
    talPassz();
    ki.utana=talMesterVar();ki.allapot=T.mester.bank;
    ki.ujra=talKinalat("mester2").some(x=>x.mester);
    return ki;});
  console.log("\n— 4. MESTERLAP (7 LAP) —");
  ok(ms.var==="bank"&&ms.lap&&ms.lap.kat==="bank"&&ms.lap.rang===4&&/mesterlap/.test(ms.lap.cimke),"a 7. lapnál a következő kínálatban legendás lap abból a színből",ms);
  ok(ms.utana===null&&ms.allapot==="kesz"&&!ms.ujra,"a húzás (passz is) elhasználja — színenként egyszer",ms);

  /* ---- 5. POLIHISZTOR ---- */
  const po=await p.evaluate(()=>{
    const ki={};
    _pakli(TAL_KAT.slice(0,9).map(K=>[K.k,1,null]));
    ki.kilenc=talPoliKer("bank").ok;
    const T=_pakli(TAL_KAT.map(K=>[K.k,1,null]));
    talMenuOpen();ki.gombok=document.querySelectorAll("[data-tal^='poli:']").length>=10;talMenuClose();
    const r=talPoliKer("bank");
    ki.ok=r.ok;ki.lap=r.L?{kat:r.L.kat,rang:r.L.rang,spec:r.L.spec,poli:r.L.poli}:null;
    ki.masodszor=talPoliKer("stab").ok;
    ki.html=/poli/.test(talLapHtml(r.L,{kicsi:true}));
    return ki;});
  console.log("\n— 5. POLIHISZTOR-DÍJ —");
  ok(!po.kilenc&&po.gombok&&po.ok&&po.lap&&po.lap.kat==="bank"&&po.lap.rang===4&&po.lap.spec===null&&po.lap.poli&&!po.masodszor&&po.html,
    "kilenc színnél még nincs; tíznél a menüben választható, egyszer, legendás special nélküli szivárványlap",po);

  /* ---- 6. ARCHETÍPUS ---- */
  const ar=await p.evaluate(()=>{
    _pakli(_szin("bank",4,"bevetel").concat([["stab",1,null]]));
    const a=talArchetipus(),jel=talJelentesHtml();
    const card=mpTeamCard(null),clean=mpCardClean(card);
    const hamis=mpCardClean(Object.assign({},card,{arch:{cim:"<script>x</script>",k:"nincsilyen"}}));
    return {a,jel:/A Bankár/.test(jel),card:card.arch,clean:clean.arch,hamis:hamis.arch};});
  console.log("\n— 6. ARCHETÍPUS —");
  ok(ar.a&&ar.a.cim==="A Bankár"&&ar.jel,"a domináns szín címe a szezonzáró jelentésben",ar);
  ok(ar.card&&ar.card.cim==="A Bankár"&&ar.clean&&ar.clean.cim==="A Bankár"&&ar.clean.k==="bank"&&ar.hamis&&!/</.test(ar.hamis.cim)&&ar.hamis.k===null,
    "a párharc-csapatlapon utazik, és a megtisztítás a hamis kategóriát és a jelölést kiszűri",ar);

  /* ---- 7. ÖSSZHATÁS, REZONANCIA-FÜL, SZŰRŐ ---- */
  const ui=await p.evaluate(()=>{
    const ki={};
    _pakli([["fejlodes",3,null,"tempo"],["bank",4,"aranytojas"],["stilus",2,"kethaza"],["bank",1,null],["bank",2,null]]);
    talMenuOpen();
    document.querySelector("[data-ttab='ossz']").click();
    const t=$("talPanel").textContent;
    ki.ossz=/Területenkénti mérleg/.test(t)&&/Fejlődési tempó/.test(t)&&/Az Aranytojás/.test(t);
    ki.grid=$("talGrid").classList.contains("hide");
    document.querySelector("[data-ttab='rez']").click();
    ki.rez=/Mesterlap/.test($("talPanel").textContent)&&/Polihisztor/.test($("talPanel").textContent);
    document.querySelector("[data-ttab='gyujt']").click();
    ki.mind=document.querySelectorAll("#talGrid .talCard").length;
    document.querySelector("[data-tsz='k:bank']").click();
    ki.bank=document.querySelectorAll("#talGrid .talCard").length;
    document.querySelector("[data-tsz='r:4']").click();
    ki.bankLeg=document.querySelectorAll("#talGrid .talCard").length;
    document.querySelector("[data-tsz='k:']").click();document.querySelector("[data-tsz='r:0']").click();
    talMenuClose();
    return ki;});
  console.log("\n— 7. ÖSSZHATÁS ÉS SZŰRŐ —");
  ok(ui.ossz&&ui.grid&&ui.rez,"az Összhatás fülön a kategóriák és a területenkénti mérleg, a Rezonancia fülön a küszöbök",ui);
  ok(ui.mind===5&&ui.bank===3&&ui.bankLeg===1,"a gyűjtemény szűrhető színre és ritkaságra",ui);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
