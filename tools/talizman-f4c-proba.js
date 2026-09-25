/* 🧿 TALIZMÁNOK F4c — AZ IGAZGATÓSÁG, A SZPONZOR, A SZTÁRVILÁG (3.9.146).

   KIMONDOTT KÉRÉS: „Board meeting (legfeljebb 3 elvárás: kupasorozat,
   bajnoki helyezés, szurkolótábor, büdzsé, morál, gólszám, izgalom →
   jutalom/büntetés), Szponzor (logó/mez emoji vagy szín → heti, időszakos
   vagy idényes bevétel), az összes Sztárom a párom esemény (ha nem az a
   csapatstílus)."

   Amit mér:
     1. A CÉL-IDÉNY: meccs nélkül a mostani, a nyárban és menet közben a
        következő;
     2. 🏛️ IGAZGATÓSÁG: a valódi sorsolásból 3 elvárás, kalibrált célokkal (a
        kupa csak ha van kampány); a morál-átlag a meccseken gyűlik; a
        szezonzáró pillanatkép és a szezonváltás értékelése: kiváló /
        teljesítve / elbukva, a tulajdonosok bizalma, a bizalmi szavazás (és a
        −10 morál az új idény első meccsén); az elmaradt kupa nem számít;
        a két kapaszkodó (finish, startNextCareerSeason) a helyén;
     3. 🎽 SZPONZOR: a valódi képernyő négy gombja; a logó a fejlécben és
        meccsenként fizet; a szín a klubszínpár második színe, lejáratkor
        visszaáll; a stadionnév elöl (a saját zárójelben), idényenként fizet,
        és a saját-stadion mérföldkövét NEM teljesíti; a felbontás kötbére a
        hátralévő érték fele; a gép a legtöbbet érőt választja;
     4. 🌟 SZTÁRVILÁG: a klub arca a legjobb kerettag; a négy hírnév-esemény
        (robbanás, reklám, befektető, követelés) idényenként a plafonjáig;
     5. mind a 16 esemény működik; a menü sorai;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9171;
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
  await p.waitForFunction(()=>typeof talIgazgErtekel==="function",null,{timeout:15000});

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
    phase="season";S.seasonNumber=3;S.idx=0;S.W=0;S.D=0;S.L=0;S.tal=null;
    addLine=()=>{};
    window._pakli=ids=>{S.tal=null;const T=talState();ids.forEach(id=>{T.esemenyek[id]={szezon:3,suly:1,uid:1};});return T;};
    window._sorsol=()=>{
      const regi=TRANSFER_TYPES.map(t=>t.weight),_r=Math.random;
      TRANSFER_TYPES.forEach(t=>{t.weight=0;});
      Math.random=()=>0.99;
      try{return twResolvePhase2();}
      finally{Math.random=_r;TRANSFER_TYPES.forEach((t,i)=>{t.weight=regi[i];});}};});

  /* ---- 1. A CÉL-IDÉNY ---- */
  const c=await p.evaluate(()=>{
    const ki=[];
    S.W=0;S.D=0;S.L=0;ki.push(talCelSzezon());
    S.W=3;ki.push(talCelSzezon());
    S.W=0;
    return ki;});
  console.log("\n— 1. A CÉL-IDÉNY —");
  ok(c.join()==="3,4","meccs nélkül a mostani idény, lejátszott meccs után a következő",c);

  /* ---- 2. IGAZGATÓSÁG ---- */
  const ig=await p.evaluate(()=>{
    const ki={};
    S.euroCurrent=null;S.seasonHistory=[{season:2,rank:9,gf:40,excAvg:50,l:8}];
    S.morale=60;S.moraleTarget=60;S.transferBudget=0;
    _pakli(["igazgatosag"]);
    const r=_sorsol();
    const I=talIgazg();
    ki.sorsolas={cim:r.title,szezon:I&&I.szezon,db:I&&I.elv.length,indult:I&&I.indult,
      celok:I&&I.elv.every(e=>e.cel!=null),kupa:I&&I.elv.some(e=>e.k==="kupa")};
    /* a kalibrálás, fajtánként */
    const K={};Object.keys(TAL_IGAZG_FAJTA).forEach(k=>{K[k]=TAL_IGAZG_FAJTA[k].cel();});
    ki.kal=K;
    /* kupa-lehetőség: ha van kampány, a kupa is sorsolható */
    S.euroCurrent="BL";S.euroOptOut=false;
    let volt=false;for(let i=0;i<60&&!volt;i++){_pakli(["igazgatosag"]);const h=talEsemenyElo("igazgatosag");volt=h.elv.indexOf("kupa")>=0;}
    ki.kupaSorsolhato=volt;S.euroCurrent=null;
    /* 3 elvárás kézzel, hogy a mérés determinisztikus legyen — mind kiváló */
    const mk=elv=>{S.tal.esHat=S.tal.esHat||{};S.tal.esHat.ber={};
      S.tal.esHat.igazg={szezon:3,elv,indult:true,fb0:1000,ms:0,mn:0,zaro:null};};
    let base=0;try{base=seasonBudgetCore();}catch(e){}
    ki.base=base;
    mk([{k:"helyezes",cel:5},{k:"gol",cel:40},{k:"moral",cel:50}]);
    /* a morál a meccseken gyűlik */
    S.W=1;S.morale=60;talEsemenyTick();S.morale=60;talEsemenyTick();
    ki.moralGyul={ms:talIgazg().ms,mn:talIgazg().mn};
    S.transferBudget=0;
    talIgazgZaro(2,{gf:50,l:3,excAvg:40});
    const b0=S.transferBudget;
    const e1=talIgazgErtekel();
    ki.mind={penz:S.transferBudget-b0,vart:Math.round(base*0.08)*3+Math.round(base*0.10),
      sorok:e1&&e1.sorok,zar:e1&&/bizalma/.test(e1.zar),torolve:!talIgazg()};
    /* mind elbukik → bizalmi szavazás */
    mk([{k:"helyezes",cel:3},{k:"gol",cel:60},{k:"moral",cel:70}]);
    S.morale=40;talEsemenyTick();
    S.transferBudget=1e9;
    talIgazgZaro(9,{gf:30,l:12,excAvg:30});
    const b1=S.transferBudget;
    const e2=talIgazgErtekel();
    ki.semmi={fizet:b1-S.transferBudget,vart:Math.round(base*0.05)*3+Math.round(base*0.10),
      zar:e2&&/Bizalmi szavazás/.test(e2.zar),minusz:S.tal.esHat.moralMinusz};
    S.morale=70;talEsemenyTick();
    ki.moralUtana=S.morale;ki.minuszLe=S.tal.esHat.moralMinusz;
    /* az elmaradt kupa nem számít; a vegyes eredmény se nem bizalom, se nem szavazás */
    mk([{k:"kupa",cel:2},{k:"gol",cel:40},{k:"helyezes",cel:2}]);
    S.transferBudget=1e9;
    talIgazgZaro(5,{gf:44,l:6,excAvg:40});
    S.euroCurrent=null;
    const e3=talIgazgErtekel();
    ki.vegyes={sorok:e3&&e3.sorok,zar:e3&&e3.zar};
    /* pillanatkép nélkül (pl. a megbízás a következő idényre szólt) nincs értékelés */
    mk([{k:"gol",cel:40}]);S.tal.esHat.igazg.szezon=4;
    ki.maskor=talIgazgErtekel();
    ki.megvan=!!talIgazg();
    /* a két kapaszkodó */
    ki.finish=/talIgazgZaro\(yourRank,S\.seasonHistory\[S\.seasonHistory\.length-1\]\)/.test(finish.toString());
    ki.valtas=/try\{talSzezonvaltas\(\);\}catch\(e\)\{\}\s*S\.seasonNumber=\(S\.seasonNumber\|\|1\)\+1;/.test(startNextCareerSeason.toString());
    S.W=0;
    return ki;});
  console.log("\n— 2. 🏛️ IGAZGATÓSÁG —");
  ok(/Igazgatósági ülés/.test(ig.sorsolas.cim)&&ig.sorsolas.szezon===3&&ig.sorsolas.db===3&&ig.sorsolas.indult&&ig.sorsolas.celok&&!ig.sorsolas.kupa,
     "a valódi sorsolásból 3 elvárás a mostani idényre, kitűzött célokkal — kupa-kampány nélkül kupa nincs",ig.sorsolas);
  ok(ig.kal.helyezes===7&&ig.kal.gol===42&&ig.kal.izgalom===53&&ig.kal.moral===60&&ig.kal.szurkolo>=4&&ig.kal.szurkolo<=8&&ig.kal.kupa===2,
     "a célok a tavalyi idényből kalibrálódnak (9. hely → 7., 40 gól → 42, 50 izgalom → 53, morál-cél 60)",ig.kal);
  ok(ig.kupaSorsolhato,"ha van kupa-kampány, a kupasorozat is elvárás lehet");
  ok(ig.moralGyul.ms===120&&ig.moralGyul.mn===2,"a morál-átlag meccsenként gyűlik",ig.moralGyul);
  ok(ig.mind.penz===ig.mind.vart&&ig.mind.zar&&ig.mind.torolve&&ig.mind.sorok.every(s=>/kiváló/.test(s)),
     "mind kiváló: 3 × 8% + a tulajdonosok bizalma (10%), és a megbízás lezárul",ig.mind);
  ok(ig.semmi.fizet===ig.semmi.vart&&ig.semmi.zar&&ig.semmi.minusz===10,"mind elbukik: 3 × 5% + 10% levonás, bizalmi szavazás",ig.semmi);
  ok(ig.moralUtana===60&&ig.minuszLe===0,"…és az új idény első meccse után −10 morál, egyszer",{m:ig.moralUtana,le:ig.minuszLe});
  ok(/kupa elmaradt/.test(ig.vegyes.sorok.join())&&ig.vegyes.zar==="","az elmaradt kupa nem számít; vegyes eredménynél se bizalom, se szavazás",ig.vegyes);
  ok(ig.maskor===null&&ig.megvan,"a következő idényre szóló megbízást a mostani szezonváltás nem értékeli");
  ok(ig.finish&&ig.valtas,"a pillanatkép a szezonzárásban, az értékelés a szezonváltásban, a szezonszám növelése ELŐTT");

  /* ---- 3. SZPONZOR ---- */
  const sp=await p.evaluate(()=>{
    const ki={};
    const gomb=k=>[...document.querySelectorAll("#twActions .talEsGomb")].find(b=>b.dataset.k===k);
    const uj=()=>{_pakli(["szponzor"]);const r=_sorsol();showTalEsemeny(r.h);return r;};
    const regiSzin=teamColors().slice();
    /* logó */
    let r=uj();
    ki.kepernyo={cim:$("twTitle").textContent,jel:r.title,gombok:document.querySelectorAll("#twActions .talEsGomb").length};
    gomb("logo").click();
    const Z=talSzponzor();
    ki.logo={logo:talSzponzorLogo(),fejlec:!!document.querySelector("#hdrJersey .talSzpLogo")};
    S.transferBudget=0;
    const w=fanWeeklyIncome();
    talSzponzorMeccs();
    ki.logoFizet={kap:S.transferBudget,vart:Math.round(w*Z.pct)};
    /* felbontás: a hátralévő érték fele */
    S.idx=10;S.transferBudget=1e9;
    const kot=Math.round(talSzponzorHatraErtek()/2);
    const b0=S.transferBudget;
    const f=talSzponzorFelbont();
    ki.felbont={ok:f.ok,fizet:b0-S.transferBudget,kot,nincs:!talSzponzor(),fejlec:!document.querySelector("#hdrJersey .talSzpLogo")};
    S.idx=0;
    /* szín */
    r=uj();gomb("szin").click();
    const Z2=talSzponzor();
    ki.szin={masodik:teamColors()[1]===Z2.szin,elso:teamColors()[0]===regiSzin[0]};
    S.transferBudget=0;S.idx=8;talSzponzorMeccs();talSzponzorMeccs();
    ki.szinFizet={kap:S.transferBudget,vart:Z2.osszeg};
    S.idx=0;
    Z2.utolso=S.seasonNumber;talSzponzorSzezonvaltas();
    ki.szinLejar={nincs:!talSzponzor(),visszaall:teamColors()[1]===regiSzin[1]};
    /* stadion */
    identState().stadium="Kispálya";
    const msElotte=identHasStadium();
    identState().stadium="";
    r=uj();
    S.transferBudget=0;
    gomb("stadion").click();
    const Z3=talSzponzor();
    ki.stadion={azonnal:S.transferBudget===Z3.osszeg,kiir:identStadiumKiir(),van:identStadiumVan(),
      sajatMs:identHasStadium(),msElotte};
    identState().stadium="Kispálya";
    ki.stadionZarojel=identStadiumKiir();
    identState().stadium="";
    Z3.utolso=4;S.transferBudget=0;talSzponzorSzezonvaltas();
    const egyszer=S.transferBudget;talSzponzorSzezonvaltas();
    ki.stadionIdeny={kap:egyszer,vart:Z3.osszeg,fizetve:Z3.fizetve,duplan:S.transferBudget!==egyszer,
      elso:Z3.elso};
    talEsFut().szponzor=null;
    /* NYÁRI aláírás (a lezárult idény statisztikája még áll): az egyidényes
       szerződés a KÖVETKEZŐ idényt fedi — a szezonváltáskor nem jár le */
    S.W=10;
    r=uj();
    const hn=r.h;hn.aj.logo.ev=1;
    showTalEsemeny(hn);gomb("logo").click();
    const Zn=talSzponzor();
    ki.nyari={elso:Zn&&Zn.elso,utolso:Zn&&Zn.utolso};
    talSzponzorSzezonvaltas();
    ki.nyari.megvan=!!talSzponzor();
    S.seasonNumber=4;S.W=0;talSzponzorSzezonvaltas();
    ki.nyari.lejart=!talSzponzor();
    S.seasonNumber=3;
    /* a gép a legtöbbet érőt */
    _pakli(["szponzor"]);
    const h=talEsemenyElo("szponzor");
    const ertek=k=>{const a=h.aj[k];return (a.k==="logo"?w*a.pct*30:a.k==="szin"?a.osszeg*3:a.osszeg)*a.ev;};
    const best=["logo","szin","stadion"].sort((x,y)=>ertek(y)-ertek(x))[0];
    ki.auto={val:h.auto(),best};
    /* futó szerződés mellett nincs új ajánlat */
    talEsFut().szponzor={k:"logo",logo:"🍺",cegnev:"X",pct:0.1,elso:3,utolso:3};
    ki.foglalt=talEsemenyElo("szponzor");
    talEsFut().szponzor=null;
    return ki;});
  console.log("\n— 3. 🎽 SZPONZOR —");
  ok(/Mezszponzor/.test(sp.kepernyo.cim)&&sp.kepernyo.jel==="__TAL_PENDING__"&&sp.kepernyo.gombok===4,"a valódi képernyő: három ajánlat és a „nem”",sp.kepernyo);
  ok(sp.logo.logo&&sp.logo.fejlec,"🍺 a logó a fejlécben, a címer sarkában",sp.logo);
  ok(sp.logoFizet.kap===sp.logoFizet.vart&&sp.logoFizet.kap>0,"a logó meccsenként fizet (a heti lelátó %-a)",sp.logoFizet);
  ok(sp.felbont.ok&&sp.felbont.fizet===sp.felbont.kot&&sp.felbont.kot>0&&sp.felbont.nincs&&sp.felbont.fejlec,"a felbontás kötbére a hátralévő érték fele, és a logó eltűnik",sp.felbont);
  ok(sp.szin.masodik&&sp.szin.elso,"a szín a klubszínpár második színe",sp.szin);
  ok(sp.szinFizet.kap===sp.szinFizet.vart,"ablakonként (8., 15., 23. forduló) egyszer fizet",sp.szinFizet);
  ok(sp.szinLejar.nincs&&sp.szinLejar.visszaall,"lejáratkor a saját szín visszaáll",sp.szinLejar);
  ok(sp.stadion.azonnal&&sp.stadion.van&&!sp.stadion.sajatMs&&sp.stadion.msElotte===true&&/(Aréna|Park|Stadion|Center)$/.test(sp.stadion.kiir),
     "a stadionnév azonnal fizet és kiíródik — a saját-stadion mérföldkövét nem teljesíti",sp.stadion);
  ok(/\(Kispálya\)$/.test(sp.stadionZarojel),"a saját név zárójelben marad",sp.stadionZarojel);
  ok(sp.stadionIdeny.kap===sp.stadionIdeny.vart&&sp.stadionIdeny.fizetve===4&&!sp.stadionIdeny.duplan&&sp.stadionIdeny.elso===3,
     "szezonváltáskor a következő idény díját fizeti — egyszer",sp.stadionIdeny);
  ok(sp.nyari.elso===4&&sp.nyari.utolso===4&&sp.nyari.megvan&&sp.nyari.lejart,
     "a nyáron aláírt egyidényes szerződés a következő idényt fedi, és csak utána jár le",sp.nyari);
  ok(sp.auto.val===sp.auto.best,"a gép a szerződés teljes értékében a legtöbbet érőt választja",sp.auto);
  ok(sp.foglalt===null,"futó szerződés mellett nem jön új ajánlat");

  /* ---- 4. SZTÁRVILÁG ---- */
  const sz=await p.evaluate(()=>{
    const ki={};
    S.W=0;S.D=0;S.L=0;
    _pakli(["sztarvilag"]);
    const r=_sorsol();
    const X=talSztar();
    const legjobb=fullCareerRoster().slice().sort((a,b)=>pOvr(b)-pOvr(a))[0];
    ki.arc={cim:r.title,n:X&&X.n===legjobb.n};
    const _r=Math.random;Math.random=()=>0;
    const fb=fanBase(),b0=S.transferBudget=0;
    try{for(let i=0;i<6;i++)talSztarMeccs();}finally{Math.random=_r;}
    ki.ev=X.ev;ki.fans=fanBase()-fb;ki.penz=S.transferBudget-b0;
    ki.ber=talBerSzorzo(X.n);
    /* Sztárom a párom stílusban nem jön ki (a saját gépezete fut), és a futó
       sztárvilág sem dupláz */
    const _fs=fameStarName;fameStarName=()=>legjobb.n;
    try{
      _pakli(["sztarvilag"]);
      ki.sztarStilus={elo:talEsemenyElo("sztarvilag"),utolso:S.tal.esemenyek.sztarvilag.utolso||null};
      talEsFut().sztar={n:legjobb.n,szezon:3,ev:{surge:0,ad:0,inv:0,dem:0}};
      const _r2=Math.random;Math.random=()=>0;
      try{talSztarMeccs();}finally{Math.random=_r2;}
      ki.sztarStilus.ev=talSztar().ev.surge+talSztar().ev.ad;
    }finally{fameStarName=_fs;}
    /* a következő idényre szóló sztár ma még nem hat */
    S.W=4;_pakli(["sztarvilag"]);_sorsol();
    ki.jovo={most:talSztar(),szezon:S.tal.esHat.sztar.szezon};
    S.W=0;
    return ki;});
  console.log("\n— 4. 🌟 SZTÁRVILÁG —");
  ok(/Sztárvilág/.test(sz.arc.cim)&&sz.arc.n,"a klub arca a legjobb kerettag",sz.arc);
  ok(sz.ev.surge===2&&sz.ev.ad===3&&sz.ev.inv===1&&sz.ev.dem===1,"a négy hírnév-esemény a plafonjáig (2 / 3 / 1 / 1)",sz.ev);
  ok(sz.fans>0&&sz.penz>0&&sz.ber===1.25,"szurkolók, pénz (reklám, befektető), és a követelés: +25% bér",{f:sz.fans,p:sz.penz,b:sz.ber});
  ok(sz.jovo.most===null&&sz.jovo.szezon===4,"menet közben a következő idényre szól",sz.jovo);
  ok(sz.sztarStilus.elo===null&&sz.sztarStilus.utolso===null&&sz.sztarStilus.ev===0,
     "Sztárom a párom stílusban nem jön ki (és nem ég el), a futó sztárvilág sem dupláz",sz.sztarStilus);

  /* ---- 5. MIND A 16, ÉS A MENÜ ---- */
  const mn=await p.evaluate(()=>{
    const ki={};
    ki.mind=TAL_ESEMENY.every(e=>talEsemenyMukodik(e.id));
    S.W=0;
    const T=_pakli(["igazgatosag"]);
    T.esHat={ber:{},igazg:{szezon:3,elv:[{k:"gol",cel:40},{k:"moral",cel:55}],indult:true,fb0:1,ms:0,mn:0,zaro:null},
      szponzor:{k:"stadion",nev:"Sörmester Aréna",cegnev:"Sörmester",osszeg:100,ev:2,elso:3,utolso:4,fizetve:3},
      sztar:{n:fullCareerRoster()[0].n,szezon:3,ev:{surge:1,ad:0,inv:0,dem:0}},
      igazgMult:{szezon:2,sorok:["⚽ Gólszám: 44 gól — ✓ teljesítve"],zar:"",penz:500}};
    talMenuOpen();ki.t=$("talHatas").textContent;
    ki.gomb=!!document.querySelector('#talHatas [data-tal="szpFelbont"]');
    talMenuClose();
    return ki;});
  console.log("\n— 5. MIND A 16, ÉS A MENÜ —");
  ok(mn.mind,"mind a 16 csomag-esemény működik");
  ok(/Igazgatósági megbízás — 3\. idény/.test(mn.t)&&/legalább 40 bajnoki gól/.test(mn.t)&&/idény értékelése/.test(mn.t),"a menüben a megbízás a célokkal, és a tavalyi értékelés",mn.t.slice(0,400));
  ok(/Szponzor: Sörmester/.test(mn.t)&&/4\. idény végéig/.test(mn.t)&&mn.gomb&&/Sztárvilág/.test(mn.t)&&/robbanás 1\/2/.test(mn.t),"a szponzor (felbontás-gombbal) és a sztárvilág sora",mn.t.slice(-400));

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
