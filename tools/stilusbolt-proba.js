/* 🛒 A HAT PIAC és a bontott állapot (3.9.128).

   KIMONDOTT KÉRÉS (a 3.9.127 javítása): „Ennél nem azt vártam tőled, hogy egy
   az egyben valósítsd meg a villám saját bolti termékeit… hanem hogy azt és a
   panzert vásárlási lehetőségeit MINTAKÉNT véve dolgozz ki
   csapatstílusonként EGY-EGY SPECIÁLIS PIACOT, 3-3 termékkel… De így
   rendkívül egyhangú lenne."

   Amit mér:
     A) A BONTOTT ÁLLAPOT (3.9.127, változatlanul)
      1. négy nevesített tényező, az összegük betűre az engBaseRaw;
      2. a MÉLYSÉG a régi képlet (külön újraszámolva);
      3. az ÉL a 85-ös küszöbtől mér, tetőzve;
      4. az ÖSSZJÁTÉK csak a stílus kulcsposztjairól válogat;
      5. a KÉPESSÉG-tétel a tengely-térképet követi, idegen tengely nem számít;
      6. a Harmónia éle FORDÍTOTT;
      7. EGYIK tényező sem függ a felállástól.
     B) HOGY TÉNYLEG HAT PIAC, NEM EGY SABLON HATSZOR
      8. mind a hat stílusnak van SAJÁT NEVŰ piaca, 3-3 termékkel;
      9. a tizennyolc termék azonosítója egyedi;
     10. legalább hétféle HATÁSFAJTA szerepel köztük (nem egy sablon);
     11. stílusonként pontosan EGY egymeccses tétel van, és az a legolcsóbb;
     12. az árak a tarifával nőnek, a SZINT ára viszont fix.
     C) A TIZENEGY HATÁSFAJTA, EGYENKÉNT
     13. 🔥 fx1 (ownGoalMult) tényleg megjelenik a stílus fx-listáján, és a
         lefújás elfogyasztja;
     14. 🌧️ fx1 (oppGoalMult) csökkenti az ellenfél gólesélyét;
     15. ☕ fx1 (moraleFloor) megemeli a morál-padlót;
     16. 🩹 fxN (injMult) HALMOZÓDIK, és a max-nál megáll;
     17. 📕 tune (recNear) kijjebb tolja a rekordhajrá határát;
     18. 🔟 tune (nineSteps) több lépcsőt enged a Kilencesnek;
     19. 🧠 tune (pcOffer) növeli a passzkémia ajánlkozását — a plafonig;
     20. 👟 tune (duoRipe) rövidíti a gyilkos páros érését, 4 meccsig;
     21. 🥅 tune (errMul) szorozza a kikényszerített hibát;
     22. 🧊 trait a Panzer TÜKÖRKÉPE: a vérmérséklet HIGGADTABB felé megy,
         a pályán lévő példány is követi, a szélén álló embert tiltja;
     23. 🤝 bond két ember összhangját emeli;
     24. 🔗 passchem egy lépcsőt lép;
     25. ⚖️ rating a kezdő 11 leggyengébbjét emeli, tetőzve;
     26. ⏱️ token · Villám: SZÁZALÉK egy posztcsoportra;
     27. 🎯 token · Tiki-taka: LAPOS ráadás az EGÉSZ tizenegyre (más alak!);
     28. 🎓 coach: egy Szakértelem-lépcső, rossz típusra nem fizet;
     29. a könyvelés (pts / spent) mindenhol stimmel;
     30. mind a hat piac kirajzolódik a panelen;
     31. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9101;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof engBaseParts==="function"
      &&typeof engShopList==="function"&&typeof engShopBuy==="function"
      &&typeof engShopFx==="function"&&typeof engTune==="function"
      &&typeof engTokenApply==="function"&&typeof engTraitApply==="function"
      &&typeof engBuyPair==="function"&&typeof engBuyRating==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a bontás és a hat piac függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    const n1=x=>Math.round(x*10)/10;
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
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=80;
    try{buildSeasonFixtures();}catch(e){}
    slots.forEach(sl=>{
      if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26};
      const e=careerPool[sl.player.n];
      if(!e.pos)e.pos=sl.player.pos.slice();
      if(!e.attrs)initPlayerAttrs(e);});
    const setStyle=k=>{
      S.style={key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
      S.style2=null;
      const E=engState(k);
      E.pts=100000;E.earned=100000;E.spent=0;E.lvl=0;
      delete E.buy;delete E.tok;delete E.fx1;delete E.tb;
      return E;};
    const buyById=(k,id,extra)=>{
      const it=engShopItem(k,id);
      if(!it)return null;
      if(it.kind==="coach")return engBuyCoach(k,it,extra);
      if(it.kind==="trait")return engTraitApply(k,it,extra);
      if(it.kind==="bond"||it.kind==="passchem")return engBuyPair(k,it,extra[0],extra[1]);
      if(it.kind==="token"&&it.grp)return engBuyToken(k,it,extra);
      return engShopBuy(k,it);};

    /* ================= A) A BONTOTT ÁLLAPOT ================= */
    setStyle("villam");
    ki.engKey=engKey();
    const P=engBaseParts("villam");
    ki.partIds=P.map(x=>x.id);
    ki.osszeg=n1(P.reduce((a,x)=>a+x.v,0));
    ki.baseRaw=engBaseRaw("villam");
    {const d=ENG_DEFS.villam,v=[];
     fullCareerRoster().forEach(pl=>{const e=careerPool[pl.n];if(!e)return;
       v.push((e.attrs&&e.attrs.seb)||0);});
     v.sort((a,b)=>b-a);
     let s=0;
     v.slice(0,d.men).forEach(sp=>{s+=Math.max(0,Math.min(d.perMan,(sp-d.scaleFrom)/d.perStep));});
     ki.regiMelyseg=n1(s*d.baseScale);ki.ujMelyseg=P[0].v;}
    {const nev=fullCareerRoster().map(x=>x.n),ment={};
     nev.forEach(n=>{ment[n]=careerPool[n].attrs.seb;});
     nev.forEach(n=>{careerPool[n].attrs.seb=80;});
     ki.elNulla=engElRaw("villam");
     nev.slice(0,3).forEach(n=>{careerPool[n].attrs.seb=200;});
     ki.elTeto=engElRaw("villam");
     nev.forEach(n=>{careerPool[n].attrs.seb=ment[n];});}
    {const nevek=engChemNames("villam");
     ki.chemPosztok=nevek.map(n=>((careerPool[n]&&careerPool[n].pos)||[])[0]||"?");
     ki.chemN=nevek.length;}
    {const nev=fullCareerRoster().map(x=>x.n);
     ki.skillNulla=engSkillRaw("villam");
     const pace=SKILLS.filter(sk=>sk.type==="pace"||(sk.combo||[]).some(c=>c.type==="pace"))[0];
     if(pace)nev.slice(0,10).forEach(n=>{S.skills[n]=[{skillId:pace.id,skill:pace}];});
     ki.skillTeto=engSkillRaw("villam");
     nev.slice(0,10).forEach(n=>{delete S.skills[n];});
     const gol=SKILLS.filter(sk=>sk.type==="goalw")[0];
     if(gol)nev.slice(0,10).forEach(n=>{S.skills[n]=[{skillId:gol.id,skill:gol}];});
     ki.skillIdegen=engSkillRaw("villam");
     nev.slice(0,10).forEach(n=>{delete S.skills[n];});}
    ki.harmElFv=(typeof ENG_DEFS.harmonia.el==="function");
    ki.harmEl=harmoniaEngEl();
    {const elotte=engBaseRaw("villam"),ment=slots.map(sl=>sl.player);
     slots.forEach((sl,i)=>{sl.player=ment[(i+5)%ment.length];});
     const kozben=engBaseRaw("villam");
     slots.forEach((sl,i)=>{sl.player=ment[i];});
     ki.fuggetlen=[elotte,kozben,engBaseRaw("villam")];}

    /* ================= B) HAT PIAC, NEM EGY SABLON ================= */
    ki.piacok={};ki.idk=[];ki.fajtak={};
    Object.keys(ENG_DEFS).forEach(kk=>{
      const d=ENG_DEFS[kk],L=engShopList(kk);
      L.forEach(it=>{ki.idk.push(it.id);ki.fajtak[it.kind]=(ki.fajtak[it.kind]||0)+1;});
      const arak=L.map(it=>it.ar);
      ki.piacok[kk]={nev:d.shopN||null,db:L.length,
        egymeccs:L.filter(it=>it.tag==="egy meccs").length,
        legolcsobb:arak.length?(Math.min.apply(null,arak)===L.filter(it=>it.tag==="egy meccs").map(it=>it.ar)[0]):false,
        savok:arak.slice().sort((a,b)=>a-b)};});
    ki.idEgyedi=(new Set(ki.idk)).size===ki.idk.length;
    ki.fajtaDb=Object.keys(ki.fajtak).length;
    {setStyle("villam");
     const it=engShopItem("villam","gyujto");
     const e1=engShopPrice("villam",it),s0=engScaleT("villam");
     const ment=ENG_DEFS.villam.baseScale;
     ENG_DEFS.villam.baseScale=ment*4;
     const e2=engShopPrice("villam",it),s1=engScaleT("villam");
     ENG_DEFS.villam.baseScale=ment;
     ki.arSkala=[e1,e2,n1(s0),n1(s1)];
     ki.szintArFix=[ENG_PRICE[1],engNextPrice("villam")];}

    /* ================= C) A HATÁSFAJTÁK, EGYENKÉNT ================= */
    /* 🔥 fx1 · ownGoalMult (Bombázók) */
    {const E=setStyle("bombazok");
     const elotte=styleOwnGoalMult();
     buyById("bombazok","etvagy");
     const utana=styleOwnGoalMult();
     /* A MÁSODIK VÉTEL MÉG A LEFÚJÁS ELŐTT: amíg egy egymeccses tétel él,
        nem lehet mellé venni egy másikat. */
     const ketto=!!engShopBuy("bombazok",engShopItem("bombazok","etvagy"));
     const baj=engShopWhy("bombazok",engShopItem("bombazok","etvagy"));
     const elfogy=engMatchSpend().map(x=>x.n);
     /* …a lefújás UTÁN viszont már igen — a tétel elfogyott. */
     const ujra=!!engShopBuy("bombazok",engShopItem("bombazok","etvagy"));
     engMatchSpend();
     ki.fxOwn={elotte:n1(elotte),utana:n1(utana),spent:E.spent,
       elfogy:elfogy.length,marad:n1(styleOwnGoalMult()),ketto:ketto,baj:baj,ujra:ujra};}
    /* 📕 tune · recNear + 🔟 tune · nineSteps (Bombázók) */
    {const E=setStyle("bombazok");
     ki.recNear=[engTune("recNear")];
     buyById("bombazok","rekordkonyv");buyById("bombazok","rekordkonyv");
     ki.recNear.push(engTune("recNear"));
     buyById("bombazok","rekordkonyv");buyById("bombazok","rekordkonyv");
     ki.recNear.push(engTune("recNear"),engShopItem("bombazok","rekordkonyv").max);
     /* A HATÁS A MOTORBAN. A bzRecGoalMult a BZ9_TIERS kapuja mögött van
        (3. csapatstílus-szint), tehát a próbának fel kell húznia a szintet —
        különben a tétel „hatástalannak" látszana, pedig csak zárva van. */
     {const M=styleMsStateIn(S.style);
      (STYLE_MILESTONES.bombazok||[]).forEach(d=>{M.done[d.id]=1;M.seen[d.id]=1;});}
     ki.recSzint=[styleLevel(S.style),bzTier()];
     S.recGoalsMatch=5;bzRecReset();
     ki.recHat=[bzRecGoalMult(3)>1];      /* 3 gól, 3-mal kijjebb tolt határ → armol */
     bzRecReset();delete E.buy;
     ki.recHat.push(bzRecGoalMult(3)>1);  /* a tétel nélkül 3 gólnál még nem */
     bzRecReset();
     ki.recHat.push(bzRecGoalMult(4)>1);  /* …4 gólnál viszont igen, magától is */
     /* Kilences-lépcsők */
     delete E.buy;E.pts=100000;
     ki.nine=[engTune("nineSteps")];
     buyById("bombazok","kilencesetrend");
     ki.nine.push(engTune("nineSteps"));
     buyById("bombazok","kilencesetrend");buyById("bombazok","kilencesetrend");
     ki.nine.push(engTune("nineSteps"),engShopItem("bombazok","kilencesetrend").max);}
    /* 🌧️ fx1 · oppGoalMult + 🧊 trait + 🩹 fxN (Beton) */
    {const E=setStyle("beton");
     const e0=styleOppGoalMult();
     buyById("beton","vizespalya");
     ki.fxOpp=[n1(e0),n1(styleOppGoalMult())];
     engMatchSpend();
     /* 🧊 HIDEGVÉR: a Panzer tükörképe */
     const nev=slots.find(sl=>sl.player).player.n;
     const e=careerPool[nev];
     e.verI=6;                                  /* türelmetlen */
     const r=engTraitApply("beton",engShopItem("beton","hidegver"),nev);
     const pl=currentRoster().find(x=>x.n===nev)||extraRoster.find(x=>x.n===nev);
     ki.trait={n:r&&r.n,elotte:r&&r.elotte,utana:r&&r.utana,uj:e.verI,
       peldany:pl?pl.verI:null,irany:e.verI===5};
     e.verI=0;
     ki.traitSzel=[engTraitEnd(engShopItem("beton","hidegver"),nev),
       engTraitApply("beton",engShopItem("beton","hidegver"),nev)];
     /* 🩹 ÉJSZAKAI GYÚRÓ: halmozódik */
     E.pts=100000;delete E.buy;
     ki.inj=[n1(styleInjMult())];
     buyById("beton","gyuro");ki.inj.push(n1(styleInjMult()));
     buyById("beton","gyuro");buyById("beton","gyuro");ki.inj.push(n1(styleInjMult()));
     buyById("beton","gyuro");ki.inj.push(n1(styleInjMult()),engBought("beton","gyuro"));}
    /* ☕ fx1 · moraleFloor + 🤝 bond + ⚖️ rating (Harmónia) */
    {const E=setStyle("harmonia");
     const m0=styleMoraleFloor();
     buyById("harmonia","reggeli");
     ki.morale=[m0,styleMoraleFloor()];
     engMatchSpend();
     const a=slots[1].player.n,b2=slots[2].player.n;
     let b0=0;try{b0=Math.round(bondOf(a,b2));}catch(e){}
     const r=engBuyPair("harmonia",engShopItem("harmonia","vacsora"),a,b2);
     ki.bond={elotte:r&&r.elotte,utana:r&&r.utana,no:r&&(r.utana>r.elotte),b0:b0};
     /* ⚖️ FELZÁRKÓZTATÁS */
     E.pts=100000;delete E.buy;S.ratingAdj={};
     const cel=engRatingTarget();
     const r2=engBuyRating("harmonia",engShopItem("harmonia","felzarkoztatas"));
     ki.rating={cel:cel&&cel.n,kapta:r2&&r2.n,adj:S.ratingAdj[cel&&cel.n]||0};
     for(let i=0;i<6;i++)engBuyRating("harmonia",engShopItem("harmonia","felzarkoztatas"));
     ki.ratingTeto=[engBought("harmonia","felzarkoztatas"),
       engShopItem("harmonia","felzarkoztatas").max,
       engShopWhy("harmonia",engShopItem("harmonia","felzarkoztatas"))];}
    /* 🎯 token flat + 🔗 passchem + 🧠 pcOffer (Tiki-taka) */
    {const E=setStyle("tikitaka");
     const p0=teamAttrStrengths().passz,s0=teamAttrStrengths().seb;
     buyById("tikitaka","otvenpassz");
     const p1=teamAttrStrengths().passz,s1=teamAttrStrengths().seb;
     ki.flatTok={passzNo:n1(p1-p0),sebNo:n1(s1-s0),
       csapat:engShopItem("tikitaka","otvenpassz").grp===false,
       mod:engShopItem("tikitaka","otvenpassz").mode};
     engMatchSpend();
     ki.flatUtan=n1(teamAttrStrengths().passz-p0);
     /* 🔗 KETTŐS FALAZÁS */
     E.pts=100000;
     const a=slots[3].player.n,b2=slots[4].player.n;
     const r=engBuyPair("tikitaka",engShopItem("tikitaka","kettosfalazas"),a,b2);
     ki.pc={elotte:r&&r.elotte,utana:r&&r.utana,tenyleg:passChemStages(a,b2)};
     /* 🧠 RONDÓ-TRÉNING */
     delete E.buy;E.pts=100000;
     ki.pcOffer=[engTune("pcOffer")];
     buyById("tikitaka","rondotrening");buyById("tikitaka","rondotrening");
     ki.pcOffer.push(engTune("pcOffer"));}
    /* 🫁 fx1 · gpPressMult + 👟 duoRipe + 🥅 errMul (Gegenpressing) */
    {const E=setStyle("gegen");
     const g0=styleFxMul("gpPressMult");
     buyById("gegen","laktat");
     ki.gpPress=[n1(g0),n1(styleFxMul("gpPressMult"))];
     engMatchSpend();
     ki.gpPressUtan=n1(styleFxMul("gpPressMult"));
     E.pts=100000;delete E.buy;
     const ripe0=gpDuoRipeNeed(),err0=gpErrMult();
     buyById("gegen","kozosfutas");
     const ripe1=gpDuoRipeNeed();
     buyById("gegen","kozosfutas");buyById("gegen","kozosfutas");
     buyById("gegen","kozosfutas");
     ki.duoRipe=[ripe0,ripe1,gpDuoRipeNeed(),engBought("gegen","kozosfutas")];
     buyById("gegen","hibakenyszer");
     ki.errMul=[n1(err0),n1(gpErrMult())];}
    /* ⏱️ token pct + 🏃 train + 🎓 coach (Villám) */
    {const E=setStyle("villam");
     S.staff=[{n:"Gyors Géza",type:"attr:seb",sz:50,szBase:50,xp:0,age:40,since:1,attrKey:"seb"},
              {n:"Kapus Kázmér",type:"attr:kapus",sz:50,szBase:50,xp:0,age:40,since:1,attrKey:"kapus"}];
     const s0=teamAttrStrengths().seb;
     buyById("villam","gyujto","VEDO");
     ki.pctTok={no:teamAttrStrengths().seb>s0,
       csoport:engShopItem("villam","gyujto").grp===true,
       mod:engShopItem("villam","gyujto").mode,
       vedoSeb:n1(engTokenApply("JV","seb",100)),
       vedoGol:n1(engTokenApply("JV","gol",100)),
       csatarSeb:n1(engTokenApply("CS","seb",100))};
     engMatchSpend();
     /* 🏃 */
     slots.forEach(sl=>{if(sl.player&&careerPool[sl.player.n])careerPool[sl.player.n].attrs.seb=90;});
     const gk=slots.find(sl=>sl.pos==="KP");
     if(gk&&gk.player)careerPool[gk.player.n].attrs.seb=10;
     const lassu=slots.filter(sl=>sl.player&&sl.pos!=="KP")[3];
     if(lassu)careerPool[lassu.player.n].attrs.seb=55;
     const cel=engTrainTarget("villam");
     const r=engShopBuy("villam",engShopItem("villam","rajtblokk"));
     ki.train={cel:cel&&cel.n,kell:lassu&&lassu.player.n,kapus:gk&&gk.player.n,
       lvl:r&&r.lvl,szorzo:engTrainMult(cel.n,"seb"),mas:engTrainMult(cel.n,"gol")};
     for(let i=0;i<6;i++)engShopBuy("villam",engShopItem("villam","rajtblokk"));
     ki.trainTeto=[E.tb.lvl,ENG_TRAIN_MAX,engShopWhy("villam",engShopItem("villam","rajtblokk"))];
     /* 🎓 */
     E.pts=100000;E.spent=0;
     const it=engShopItem("villam","sprintkurzus");
     ki.coachLista=engCoachList("villam",it).map(x=>x.c.n);
     const ar=engShopPrice("villam",it);
     const rc=engBuyCoach("villam",it,0);
     ki.coach={n:rc&&rc.n,elotte:rc&&rc.elotte,utana:rc&&rc.utana,xp:S.staff[0].xp,
       ar:ar,spent:E.spent};
     const p0=E.pts;
     ki.coachRossz=[engBuyCoach("villam",it,1),E.pts===p0,S.staff[1].sz];}

    /* ================= A PANEL, MIND A HAT PIACON ================= */
    ki.panel=[];
    Object.keys(ENG_DEFS).forEach(kk=>{
      setStyle(kk);
      const d=ENG_DEFS[kk];
      let h="";
      try{h=engSectionHtml();}catch(e){ki.panel.push(kk+": "+e.message);return;}
      if(h.indexOf("undefined")>=0||h.indexOf("NaN")>=0)ki.panel.push(kk+": undefined/NaN");
      if(h.indexOf(d.shopN)<0)ki.panel.push(kk+": nincs piac-név");
      if(h.indexOf(d.elN)<0)ki.panel.push(kk+": nincs él-sor");
      engShopList(kk).forEach(it=>{if(h.indexOf(it.n)<0)ki.panel.push(kk+"/"+it.id);});});
    return ki;});

  console.log("\n— A) A BONTOTT ÁLLAPOT —");
  ok(JSON.stringify(t.partIds)===JSON.stringify(["melyseg","el","chem","skill"]),
     "négy nevesített tényező",t.partIds);
  ok(kozel(t.osszeg,t.baseRaw,0.11),"az összegük = engBaseRaw",[t.osszeg,t.baseRaw]);
  ok(kozel(t.ujMelyseg,t.regiMelyseg,0.11),"a MÉLYSÉG betűre a régi képlet",[t.ujMelyseg,t.regiMelyseg]);
  ok(t.elNulla===0&&kozel(t.elTeto,30,0.01),"az ÉL a 85-ös küszöbtől mér, tetőzve",[t.elNulla,t.elTeto]);
  ok(t.chemN>0&&t.chemN<=5&&t.chemPosztok.every(x=>["JV","BV","JSZ","BSZ"].indexOf(x)>=0),
     "az ÖSSZJÁTÉK csak a kulcsposztokról válogat",t.chemPosztok);
  ok(t.skillTeto>t.skillNulla&&t.skillTeto<=18.01&&t.skillIdegen===t.skillNulla,
     "a KÉPESSÉG-tétel a tengely-térképet követi, tetőzve",[t.skillNulla,t.skillTeto,t.skillIdegen]);
  ok(t.harmElFv&&t.harmEl!==null,"☯️ a Harmónia éle fordított",t.harmEl);
  ok(t.fuggetlen[0]===t.fuggetlen[1]&&t.fuggetlen[1]===t.fuggetlen[2],
     "EGYIK tényező sem függ a felállástól",t.fuggetlen);

  console.log("\n— B) HAT PIAC, NEM EGY SABLON —");
  {const rossz=Object.keys(t.piacok).filter(k=>!t.piacok[k].nev||t.piacok[k].db!==3);
   ok(rossz.length===0,"mind a hat stílusnak SAJÁT NEVŰ piaca van, 3-3 termékkel",
      Object.keys(t.piacok).map(k=>`${k}: ${t.piacok[k].nev} (${t.piacok[k].db})`));}
  ok(t.idEgyedi,"a tizennyolc termék azonosítója egyedi",t.idk.length);
  ok(t.fajtaDb>=7,"legalább hétféle HATÁSFAJTA szerepel köztük",t.fajtak);
  {const rossz=Object.keys(t.piacok).filter(k=>t.piacok[k].egymeccs!==1||!t.piacok[k].legolcsobb);
   ok(rossz.length===0,"stílusonként pontosan EGY egymeccses tétel, és az a legolcsóbb",rossz);}
  ok(t.arSkala[1]>t.arSkala[0]&&t.szintArFix[0]===t.szintArFix[1],
     "az árak a tarifával nőnek, a SZINT ára fix",[t.arSkala,t.szintArFix]);

  console.log("\n— C) A HATÁSFAJTÁK —");
  ok(t.fxOwn.utana>t.fxOwn.elotte,"🔥 fx1 · a csapat gólesélye nő",[t.fxOwn.elotte,t.fxOwn.utana]);
  ok(t.fxOwn.elfogy===1&&t.fxOwn.marad===t.fxOwn.elotte,"…és a lefújás elfogyasztja",t.fxOwn);
  ok(t.fxOwn.ketto===false&&!!t.fxOwn.baj,"…egyszerre EGY egymeccses tétel él",
     [t.fxOwn.ketto,t.fxOwn.baj]);
  ok(t.fxOwn.ujra===true,"…a lefújás után viszont újra vehető",t.fxOwn.ujra);
  ok(t.fxOpp[1]<t.fxOpp[0],"🌧️ fx1 · az ellenfél gólesélye csökken",t.fxOpp);
  ok(t.morale[1]>t.morale[0]&&t.morale[1]===68,"☕ fx1 · a morál-padló megemelkedik",t.morale);
  ok(t.inj[1]<t.inj[0]&&t.inj[2]<t.inj[1]&&t.inj[3]===t.inj[2]&&t.inj[4]===3,
     "🩹 fxN · a sérülés-esély HALMOZÓDIK, és a max-nál megáll",t.inj);
  ok(t.recNear[1]===2&&t.recNear[2]===3&&t.recNear[3]===3,
     "📕 tune · a rekordhajrá határa kijjebb tolódik, tetőzve",t.recNear);
  ok(t.recSzint[1]>0,"…a rekord-hajrá kapuja nyitva a méréshez (stílusszint)",t.recSzint);
  ok(t.recHat[0]===true&&t.recHat[1]===false&&t.recHat[2]===true,
     "…és a motorban tényleg hamarabb armol",t.recHat);
  ok(t.nine[1]===1&&t.nine[2]===2&&t.nine[3]===2,"🔟 tune · a Kilences több lépcsőt kap",t.nine);
  ok(t.pcOffer[1]===2,"🧠 tune · a passzkémia ajánlkozása nő",t.pcOffer);
  ok(t.duoRipe[1]===t.duoRipe[0]-3&&t.duoRipe[2]>=4&&t.duoRipe[3]===3,
     "👟 tune · a gyilkos páros érése rövidül, 4 meccsig",t.duoRipe);
  ok(t.errMul[1]>t.errMul[0],"🥅 tune · a kikényszerített hiba nő",t.errMul);
  ok(t.trait.irany&&t.trait.uj===5&&t.trait.peldany===5,
     "🧊 trait · a vérmérséklet a HIGGADTABB felé megy (a Panzer tükörképe)",t.trait);
  ok(t.traitSzel[0]===true&&t.traitSzel[1]===null,"…és a szélén álló emberre nem fizet",t.traitSzel);
  ok(t.bond.no,"🤝 bond · két ember összhangja nő",t.bond);
  ok(t.pc.utana===t.pc.elotte+1&&t.pc.tenyleg===t.pc.utana,"🔗 passchem · egy lépcsőt lép",t.pc);
  ok(t.rating.cel===t.rating.kapta&&t.rating.adj===1,
     "⚖️ rating · a kezdő 11 leggyengébbje kapja",t.rating);
  ok(t.ratingTeto[0]===t.ratingTeto[1]&&!!t.ratingTeto[2],"…és tetőzik, a gomb megmondja",t.ratingTeto);
  ok(t.pctTok.csoport&&t.pctTok.mod==="pct"&&kozel(t.pctTok.vedoSeb,105,0.01)
     &&t.pctTok.vedoGol===100&&t.pctTok.csatarSeb===100,
     "⏱️ token · Villám: SZÁZALÉK egy posztcsoportra",t.pctTok);
  ok(t.flatTok.csapat&&t.flatTok.mod==="flat"&&t.flatTok.passzNo>0&&t.flatTok.sebNo===0,
     "🎯 token · Tiki-taka: LAPOS ráadás, más alak, csak a Passzra",t.flatTok);
  ok(t.flatUtan===0,"…és a lefújás ezt is elfogyasztja",t.flatUtan);
  ok(t.train.cel===t.train.kell&&t.train.cel!==t.train.kapus
     &&kozel(t.train.szorzo,1.25,0.001)&&t.train.mas===1,
     "🏃 train · a leglassabb ember, a saját tengelyén",t.train);
  ok(t.trainTeto[0]===t.trainTeto[1]&&!!t.trainTeto[2],"…és tetőzik",t.trainTeto);
  ok(t.coachLista.length===1&&t.coach.utana===t.coach.elotte+1&&t.coach.xp===2
     &&kozel(t.coach.spent,t.coach.ar,0.01),
     "🎓 coach · egy Szakértelem-lépcső, könyvelve",t.coach);
  ok(t.coachRossz[0]===null&&t.coachRossz[1]&&t.coachRossz[2]===50,
     "…rossz típusú stábtagra nem fizet",t.coachRossz);

  console.log("\n— A PANEL —");
  ok(t.panel.length===0,"mind a hat piac kirajzolódik, minden termékével",t.panel);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
