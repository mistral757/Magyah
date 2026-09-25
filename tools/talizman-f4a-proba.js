/* 🧿 TALIZMÁNOK — F4a: Joker, Morál, Bank (3.9.144).

   KIMONDOTT KÉRÉS: „Okés mehet az f4" — és a korábbi döntés: „Joker erősíti
   a negatív alacsony eséllyel dolgokat is."

   Amit mér:
     1. TALIZMÁN NÉLKÜL SEMMI NEM MOZDUL (minden olvasó semleges, a bevételi
        kapu, az ablak-keret és a nyári keret betűre a régi);
     2. 🃏 VAD IDÉNY: a szorzó a ritkasággal, a plafonnal; a párharcban
        semleges; az átigazolási „csendes" sáv a valódi twResolvePhase2-ben
        szűkül; a meccs-motor három pontja (különleges esemény, piros lap,
        mezlevétel) viszi a szorzót;
     3. 🃏 MOZGALMAS PIAC: a ritkaság szerinti ablakok, a +2-es plafon, és a
        VALÓDI ablaknyitás (twOpenCheckpointWindow) és nyári keret;
     4. ❤️ JÓ LÉGKÖR: a cél és a visszatérés szorzója;
     5. 🌊 JELLEMHULLÁM: a valódi húzás-ablakban a választás után az
        irányválasztó nyílik; a gomb elindítja; a hullám a hossza végére
        minden lépését megteszi, a skálán belül, egy ember legfeljebb kettőt;
        a pool és a pályán lévő példány együtt mozdul; ha már senkit nem lehet
        az irányba vinni, a hossza végén elül; „később" → a menüből;
     6. 💰 JOBB ÜZLETMENET: a bevételi kapu szorzója, a kivételekkel;
     7. 🏦 HITEL: a keret a legjobb lapból + lépcső; csak ablakban; a
        felvétel, a törlesztés (tőke + kamat), a hátralék késedelmi kamata és
        a bevételből való behajtása, az előtörlesztés, és a menü gombja;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9167;
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
  await p.waitForFunction(()=>typeof talHitelFelvesz==="function",null,{timeout:15000});

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
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);
      /* a jellem a skála KÖZEPÉN — hogy minden irányba legyen hova lépni */
      e.karI=3;e.kapI=4;e.verI=4;sl.player.karI=3;sl.player.kapI=4;sl.player.verI=4;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;
    window._lap=(kat,valt,rang,dobas,spec)=>({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length;_talAlapMemo=null;};});

  /* ---- 1. SEMLEGES ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    S.tal=null;_talAlapMemo=null;
    ki.olvasok=[talJokerVad(),talRitkaMult(false),talPiacExtra("nyar"),talPiacExtra("rovid"),talPiacExtra("teli"),
      talMoralCel(),talMoralVissza(),talBankMult("fans"),talHitelFok()];
    S.transferBudget=1000;budgetEarn(1234,"fans");ki.bevetel=S.transferBudget-1000;
    ki.nyar=twSummerEventMax();ki.nyarAlap=twEventStepsFor(twEventScoutStars());
    return ki;});
  console.log("\n— 1. TALIZMÁN NÉLKÜL —");
  ok(n.olvasok.join(",")==="1,1,0,0,0,0,1,1,0","minden F4a-olvasó semleges",n.olvasok);
  ok(n.bevetel===1234,"a bevételi kapu betűre a régi",n.bevetel);
  ok(n.nyar===n.nyarAlap,"a nyári esemény-keret a régi",n);

  /* ---- 2. VAD IDÉNY ---- */
  const v=await p.evaluate(()=>{
    const ki={};
    _pakli([_lap("joker","vad",4)]);
    ki.m=talJokerVad();ki.duel=talRitkaMult(true);
    _pakli(Array.from({length:6},()=>_lap("joker","vad",4,1)));
    ki.plafon=talJokerVad();
    /* a valódi twResolvePhase2 hátsó sávja: a „csendes" súlya */
    _pakli([_lap("joker","vad",4)]);
    const _w=weightedPickArr,_mr=Math.random;let sulyok=null;
    weightedPickArr=arr=>{sulyok=arr.map(x=>({k:x.key,w:x.weight}));return arr.find(x=>x.key==="quiet")||arr[0];};
    Math.random=()=>0.999;
    try{twResolvePhase2();}catch(e){ki.hiba=e.message;}
    finally{weightedPickArr=_w;Math.random=_mr;}
    ki.csendes=(sulyok||[]).find(x=>x.k==="quiet");
    ki.alom=(sulyok||[]).find(x=>x.k==="dream");
    return ki;});
  console.log("\n— 2. 🃏 VAD IDÉNY —");
  ok(Math.abs(v.m-(1+0.08*4.2*1.25))<1e-9,"legendás Vad idény: ×1,42",v.m);
  ok(v.duel===1,"a párharcban semleges",v.duel);
  ok(v.plafon===1.6,"a plafon +60%",v.plafon);
  ok(v.csendes&&Math.abs(v.csendes.w-3/v.m)<1e-9&&v.alom&&v.alom.w===3,"a valódi átigazolási sorsolásban a „csendes” sáv szűkül, a többi súlya marad",v);
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(/_sevP=\(RIVAL_MOOD\?0\.26:0\.10\)\/18\*talRitkaMult\(DUEL\)/.test(src),"a meccs-motor: a különleges esemény (jó ÉS rossz) viszi a szorzót");
  ok(/dialMul\("card",\{injured:_dialInjured\}\)\*talRitkaMult\(DUEL\);/.test(src),"…a piros lap is (a rossz ritka esemény)");
  ok(/Math\.random\(\)>=Math\.min\(0\.5,0\.25\*talRitkaMult\(DUEL\)\)/.test(src),"…és a mez leveszése is");

  /* ---- 3. MOZGALMAS PIAC ---- */
  const pi=await p.evaluate(()=>{
    const ki={};
    const tabla=r=>{_pakli([_lap("joker","piac",r)]);return [talPiacExtra("nyar"),talPiacExtra("rovid"),talPiacExtra("teli")].join("/");};
    ki.rang=[1,2,3,4,5].map(tabla);
    _pakli([_lap("joker","piac",4),_lap("joker","piac",4),_lap("joker","piac",4)]);
    ki.plafon=[talPiacExtra("nyar"),talPiacExtra("rovid"),talPiacExtra("teli")].join("/");
    /* a valódi ablaknyitás */
    _pakli([_lap("joker","piac",4)]);
    const _e=twEnterHubWindow,_a=addLine;twEnterHubWindow=()=>{};addLine=()=>{};
    try{twOpenCheckpointWindow(15,()=>{});ki.teli=S.twWindow.eventMax;twOpenCheckpointWindow(8,()=>{});ki.rovid=S.twWindow.eventMax;}
    finally{twEnterHubWindow=_e;addLine=_a;S.twWindow=null;}
    ki.nyar=twSummerEventMax()-twEventStepsFor(twEventScoutStars());
    return ki;});
  console.log("\n— 3. 🃏 MOZGALMAS PIAC —");
  ok(pi.rang.join(" ")==="1/0/0 0/1/0 1/1/0 1/1/1 2/2/2","a ritkaság szerinti ablakok: nyár · két rövid · nyár+rövid · mind · +2 mind",pi.rang);
  ok(pi.plafon==="2/2/2","halmozva ablakonként legfeljebb +2",pi.plafon);
  ok(pi.teli===3&&pi.rovid===2&&pi.nyar===1,"a valódi ablaknyitás és a nyári keret is +1-et kap",pi);

  /* ---- 4. JÓ LÉGKÖR ---- */
  const m=await p.evaluate(()=>{
    _pakli([_lap("moral","legkor",3)]);
    return {cel:talMoralCel(),vissza:talMoralVissza()};});
  console.log("\n— 4. ❤️ JÓ LÉGKÖR —");
  ok(Math.abs(m.cel-0.8*2.7*1.25)<1e-9&&Math.abs(m.vissza-(1+0.1*2.7*1.25))<1e-9,"a morál-cél +2,7 pont, a visszatérés ×1,34",m);
  ok(/const _tc=Math\.min\(100,S\.moraleTarget\+talMoralCel\(\)\);/.test(src)&&/\*_tv\)\);\}/.test(src),"a meccs utáni morál-húzás a célt és a szorzót is viszi");

  /* ---- 5. JELLEMHULLÁM ---- */
  const h=await p.evaluate(async()=>{
    const ki={};
    S.tal=null;const T=talState();talSzezon();
    const L=_lap("moral","hullam",3,0.5,null);L.valt="hullam";
    T.varo=[{id:"hw-1",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[L,_lap("bank","bevetel",1),_lap("scout","lista",1)]}];
    talDrawOpen(null);
    document.querySelectorAll("#talDrawCards .talPickBtn")[0].click();
    $("talDrawOk").click();
    ki.cim=$("talDrawTitle").textContent;
    ki.gombok=document.querySelectorAll("#talDrawCards .talIranyBtn").length;
    ki.okRejtve=$("talDrawOk").classList.contains("hide");
    const H=talHullamok()[0];
    ki.varIrany=!H.irany;
    /* a „kemény" kapcsolódás-irány */
    [...document.querySelectorAll("#talDrawCards .talIranyBtn")].find(b=>/Kapcsolódás ↓/.test(b.textContent)).click();
    ki.irany=H.irany;ki.lepes=H.lepes;ki.hossz=H.hossz;
    ki.zarva=$("talDrawModal").classList.contains("hide");
    ki.gombVissza=!$("talDrawOk").classList.contains("hide");
    /* a hullám végigfut: fordulónként egy tick */
    const elotte={};currentRoster().forEach(p=>{elotte[p.n]=careerPool[p.n].kapI;});
    const _a=addLine;const nap=[];addLine=x=>nap.push(String(x));
    try{for(let r=0;r<H.hossz+2;r++){S.idx=5+r;talHullamTick();}}finally{addLine=_a;}
    ki.kesz=H.kesz;
    const valt={};let rossz=0,szinkron=true;
    currentRoster().forEach(p=>{
      const e=careerPool[p.n],d=elotte[p.n]-e.kapI;
      if(d!==0)valt[p.n]=d;
      if(d<0||d>2)rossz++;
      if(p.kapI!==e.kapI)szinkron=false;});
    ki.valt=Object.values(valt).reduce((a,x)=>a+x,0);ki.rossz=rossz;ki.szinkron=szinkron;
    ki.naplo=nap.filter(x=>/Jellemhullám/.test(x)).length;
    ki.lezarva=talHullamok().length;
    /* beragadás ellen: ha a keretben már senkit nem lehet az irányba vinni
       (mindenki a karizma-skála tetején), a hossza végén a hullám elül */
    const KMAX=KAR_LEVELS.length-1;
    currentRoster().forEach(p=>{careerPool[p.n].karI=KMAX;p.karI=KMAX;});
    S.idx=3;
    const HB={uid:"hw-elul",irany:"kar+",lepes:3,kesz:0,hossz:4,kezd:saleCareerRound(),utolso:-1};
    HB.veg=HB.kezd+HB.hossz;talHullamok().push(HB);
    const nap2=[];addLine=x=>nap2.push(String(x));
    try{for(let r=0;r<HB.hossz+2;r++){S.idx=4+r;talHullamTick();}}finally{addLine=_a;}
    ki.elul={elult:HB.elult,kesz:HB.kesz,marad:talHullamok().length,
      sor:nap2.filter(x=>/elült/.test(x)).length};
    /* „Később döntök": a menüből indítható */
    const L2=_lap("moral","hullam",1,0.5,null);L2.valt="hullam";
    T.varo=[{id:"hw-2",forras:"utem",n:2,szezon:3,fordulo:9,kinalat:[L2,_lap("bank","bevetel",1),_lap("scout","lista",1)]}];
    talDrawOpen(null);
    document.querySelectorAll("#talDrawCards .talPickBtn")[0].click();
    $("talDrawOk").click();
    $("talDrawLater").click();
    talMenuOpen();
    ki.menuGomb=!!document.querySelector('#talHatas [data-tal^="hullam:"]');
    talMenuClose();
    return ki;});
  console.log("\n— 5. 🌊 JELLEMHULLÁM —");
  ok(/Jellemhullám/.test(h.cim)&&h.gombok===5&&h.okRejtve&&h.varIrany,"a választás után az irányválasztó nyílik (5 irány)",h);
  ok(h.irany==="kap-"&&h.lepes===5&&h.hossz===15&&h.zarva&&h.gombVissza,"a gomb elindítja a hullámot (nagyon ritka: 5 lépés, 15 forduló), és az ablak visszaáll",h);
  ok(h.kesz===5&&h.valt===5&&h.rossz===0,"a hossza végére mind az 5 lépés megtörtént, a választott irányba, egy ember legfeljebb kettőt",h);
  ok(h.szinkron&&h.naplo===h.lepes&&h.lepes===5&&h.lezarva===0,"a pool és a pályán lévő példány együtt mozdul; a napló minden lépést kimond; a kész hullám lezárul",h);
  ok(h.elul.elult===3&&h.elul.kesz===3&&h.elul.marad===0&&h.elul.sor===1,"ha már senkit nem lehet az irányba vinni, a hullám a hossza végén elül (nem ragad be), és a napló kimondja",h.elul);
  ok(h.menuGomb,"„Később döntök” után a menüben „Irányt választok” gomb vár",h.menuGomb);

  /* ---- 6. JOBB ÜZLETMENET ---- */
  const bk=await p.evaluate(()=>{
    _pakli([_lap("bank","bevetel",4)]);
    const m=talBankMult("fans");
    const mer=cat=>{S.transferBudget=0;budgetEarn(10000,cat);return S.transferBudget;};
    return {m,fans:mer("fans"),season:mer("season"),sale:mer("sale"),loan:mer("loanIn"),passz:mer("talizman")};});
  console.log("\n— 6. 💰 JOBB ÜZLETMENET —");
  ok(Math.abs(bk.m-(1+0.015*4.2*1.25))<1e-9&&bk.fans===Math.round(10000*bk.m)&&bk.season===bk.fans,"a bevételek +7,9%",bk);
  ok(bk.sale===10000&&bk.loan===10000&&bk.passz===10000,"az eladás, a hitel és a passz kivétel",bk);

  /* ---- 7. HITEL ---- */
  const hi=await p.evaluate(()=>{
    const ki={};
    _pakli([_lap("bank","hitel",3)]);
    const _sw=saleWindowOpen;
    ki.keret=talHitelKeret();
    _pakli([_lap("bank","hitel",3),_lap("bank","hitel",1)]);
    ki.fok2=talHitelFok();
    _pakli([_lap("bank","hitel",3)]);
    const _a=addLine;addLine=()=>{};
    try{
      saleWindowOpen=()=>false;ki.zart=talHitelFelveheto();
      saleWindowOpen=()=>true;
      S.transferBudget=0;
      const r=talHitelFelvesz();ki.felvesz={ok:r.ok,osszeg:r.osszeg,budzse:S.transferBudget};
      ki.masodik=talHitelFelveheto().ok;
      const H=talHitel();ki.h={fut:H.fut,kamat:H.kamat,resz:H.reszletToke+H.reszletKamat};
      /* bőséges büdzsével végig */
      S.transferBudget=10000000;const b0=S.transferBudget;
      for(let i=0;i<30&&talHitel();i++)talHitelTorleszt();
      ki.teljes={fizetett:b0-S.transferBudget,var:ki.felvesz.osszeg+ki.h.kamat,lezarva:!talHitel()};
      /* hátralék: üres kassza */
      talHitelFelvesz();
      S.transferBudget=0;
      talHitelTorleszt();talHitelTorleszt();
      const H2=talHitel();ki.hatralek=H2.hatralek;
      ki.kesesVart=Math.round((H2.reszletToke+H2.reszletKamat)*(1+TAL_HITEL_KESES))+(H2.reszletToke+H2.reszletKamat);
      /* egy bevétel először a hátralékot viszi */
      budgetEarn(ki.hatralek+500,"fans");
      ki.behajt={hatralek:talHitel().hatralek,budzse:S.transferBudget};
      /* előtörlesztés */
      S.transferBudget=10000000;
      const e=talHitelElotorleszt();ki.elo={ok:e.ok,lezarva:!talHitel()};
      /* a menü gombja */
      talMenuOpen();
      ki.menuGomb=!!document.querySelector('#talHatas [data-tal="hitel"]');
      document.querySelector('#talHatas [data-tal="hitel"]').click();
      ki.menuFelvett=!!talHitel();
      talMenuClose();
    }finally{saleWindowOpen=_sw;addLine=_a;}
    ki.ledger=Object.keys(LEDGER_CATS).filter(k=>/^loan/.test(k));
    return ki;});
  console.log("\n— 7. 🏦 HITEL —");
  ok(hi.keret&&hi.keret.fok===3&&hi.keret.kamat===0.10&&hi.keret.fut===20,"nagyon ritka Hitelkeret: 35% · 10% · 20 meccs",hi.keret);
  ok(hi.fok2===4,"egy második Hitelkeret-lap +1 lépcső",hi.fok2);
  ok(!hi.zart.ok&&/ablakban/.test(hi.zart.miert),"csak átigazolási ablakban vehető fel",hi.zart);
  ok(hi.felvesz.ok&&hi.felvesz.budzse===hi.felvesz.osszeg&&!hi.masodik,"a felvétel a büdzsébe teszi (szorzó nélkül); egyszerre egy hitel",hi);
  ok(hi.teljes.lezarva&&Math.abs(hi.teljes.fizetett-hi.teljes.var)<=hi.h.fut,"végig törlesztve: tőke + kamat, és lezárul",hi.teljes);
  ok(hi.hatralek===hi.kesesVart,"üres kasszánál a részlet hátralékká válik, fordulónként +2% késedelmi kamattal",{h:hi.hatralek,v:hi.kesesVart});
  ok(hi.behajt.hatralek===0&&hi.behajt.budzse===500,"a következő bevétel ELŐBB a hátralékot viszi",hi.behajt);
  ok(hi.elo.ok&&hi.elo.lezarva,"előtörlesztés: a hátralévő tőke és a hátralék, és lezárul",hi.elo);
  ok(hi.menuGomb&&hi.menuFelvett,"a menü „Felveszem” gombja felveszi a hitelt",hi);
  ok(hi.ledger.length===3,"három ledger-sor: folyósítás, törlesztés, kamat",hi.ledger);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
