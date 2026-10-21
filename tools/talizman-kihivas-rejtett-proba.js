/* 📜🌘 TALIZMÁNOK — Kihívások és Rejtett csapatstílus (3.9.255)

   KIMONDOTT KÉRÉS: „1. Kihívások: több felajánlott kihívás közül
   választhatsz; több egyszerre elfogadható kihívás (külön rövid, hosszú és
   kupa); több könnyű kihívás; nagyobb jutalom-érték; extra kihívás-ablak:
   szezon elején a hosszúak mellett rövidek is; szezononként 1→3 elbukott
   kihívás büntetésétől megmenekülsz. 2. Rejtett csapatstílus: a nem használt
   csapatstílusok közül le kell mérni, melyikben lennél a legmagasabb
   (mérföldkövek alapján) […] max 33%-os eséllyel jönnek a stíluspontok […]
   ha egy mérföldkő miatt egy másik stílus előzi, attól a mérföldkőtől ő veszi
   át […] szerep, lvl1 képesség (max 6/idény), lvl2 ajánlat stíluspontért."

   Amit mér:
     1. A KATALÓGUS: 15 szín, a két új a végén; minden szöveg tiszta minden
        ritkaságon; a „Több hely" mindig kap hatókört; van rezonancia;
     2. TALIZMÁN NÉLKÜL minden új kapaszkodó semleges;
     3. KIHÍVÁSOK: helyek hatókörönként (+1, betelve +2); plusz ajánlat;
        a könnyű arány nő; a jutalom ×(1+x); a sprint lépcsői, a sprint
        kínálata (saját határidejű cél nélkül) és a horgony-jelölő; a Kegyelmi
        kártya elengedi a büntetést, a kereten túl már nem;
     4. REJTETT STÍLUS: az első vizsgálat csendes; az új mérföldkő a legjobb
        rejtett stílusnak fizet; az előzés átveszi; a lemaradó nem kap; a
        képesség a styleActiveFx-ben hat; idényenként legfeljebb 6; a II.
        szintű ajánlat pontért megvehető; a titkos szerep csak a saját
        meccsén él;
     5. VALÓDI MECCSEK az összes új lappal: lefutnak, és nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9463;
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
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
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
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});

  /* ---- 1. A KATALÓGUS ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    ki.kat=TAL_KAT.map(K=>K.k);
    ki.rez=!!(TAL_REZ.kihivas&&TAL_REZ.rejtett);
    const rossz=[];
    ["kihivas","rejtett"].forEach(kat=>{
      for(let r=1;r<=5;r++)talKat(kat).valt.forEach(V=>{
        const L={kat,valt:V.k,rang:r,dobas:0.5,spec:null};
        if(V.k==="hely")L.kh="cup";
        const t=talAlapSzoveg(L)+" "+talLapNev(L)+" "+talSav(L);
        if(/\{v\}|NaN|undefined|null/.test(t))rossz.push(t);});});
    ki.rossz=rossz;
    let cel=0,db=0;
    for(let i=0;i<300;i++){const L=talUjLap(talRng("pk",i),"kihivas",1,{tiszta:true});
      if(L.valt==="hely"){db++;if(TAL_KIH_SCOPES.indexOf(L.kh)>=0)cel++;}}
    ki.cel=[cel,db];
    return ki;});
  console.log("— 1. A KATALÓGUS —");
  ok(k.kat.length===15&&k.kat[13]==="kihivas"&&k.kat[14]==="rejtett","15 szín: a 📜 Kihívások és a 🌘 Rejtett csapatstílus a végén",k.kat);
  ok(!k.rossz.length,"minden alaphatás-szöveg tiszta, mind az öt ritkaságon",k.rossz.slice(0,3));
  ok(k.cel[1]>0&&k.cel[0]===k.cel[1],"a „Több hely\" lap mindig kap hatókört (rövid / hosszú / kupa)",k.cel);
  ok(k.rez,"mindkét új színnek van rezonanciája");

  /* ---- 2. TALIZMÁN NÉLKÜL ---- */
  const n=await p.evaluate(()=>{
    _pakli([]);
    return {hely:["short","long","cup"].map(s=>challengeSlotLimit(s)-challengeSlotBase(s)),
      extra:talKihExtraAjanlat("short"),konnyu:talKihKonnyuP(),jutal:talKihJutalomMult(),
      kegy:talKihKegyelemDb(),ablak:talKihAblakDb(),rejt:rejtOn(),fx:rejtFx().length,
      szerep:(rejtSzerepDob(),!!rejtSzerep())};});
  console.log("\n— 2. TALIZMÁN NÉLKÜL —");
  ok(n.hely.every(x=>x===0),"a kihívás-helyek a régiek (mindhárom hatókör)",n.hely);
  ok(n.extra===0&&n.konnyu===0&&n.jutal===1&&n.kegy===0&&n.ablak===0,"nincs plusz ajánlat, könnyítés, jutalom-szorzó, kegyelem, sprint",n);
  ok(n.rejt===false&&n.fx===0&&n.szerep===false,"a rejtett stílus alszik: nincs képesség, nincs szerep",n);

  /* ---- 3. KIHÍVÁSOK ---- */
  const c=await p.evaluate(()=>{
    const ki={};
    /* hely: egy átlagos lap a rövidre → +1 csak ott; négy legendás → +2 */
    _pakli([_lap("kihivas","hely",1,0.5,null,{kh:"short"})]);
    ki.hely1=["short","long","cup"].map(s=>challengeSlotLimit(s)-challengeSlotBase(s));
    _pakli([1,2,3,4].map(()=>_lap("kihivas","hely",4,1,null,{kh:"cup"})));
    ki.hely2=["short","long","cup"].map(s=>challengeSlotLimit(s)-challengeSlotBase(s));
    ki.helyV=talAlap("kihivas","hely.cup");
    /* kínálat: a plafon (200%) = +2 biztos ajánlat */
    _pakli([1,2,3,4].map(()=>_lap("kihivas","kinalat",5,1)));   /* 4 lap: a rezonancia (5) még nem él */
    ki.kinPct=talKihKinalatPct();ki.extra=talKihExtraAjanlat("short");
    /* könnyű arány: 600 ajánlat-sorsolás lap nélkül és a 40%-os plafonnal */
    const arany=()=>{let e=0,d=0;const ctx=challengeContext();
      for(let i=0;i<600;i++){const o=buildChallengeOffer("short",ctx);if(!o)continue;d++;if(o.difficulty==="easy")e++;}
      return d?e/d:0;};
    _pakli([]);ki.konnyu0=arany();
    _pakli([1,2,3,4,5].map(()=>_lap("kihivas","konnyu",5,1)));
    ki.konnyuP=talKihKonnyuP();ki.konnyu1=arany();
    /* jutalom: a pénz-tétel ×(1+x) — a sorsolót a pénzre állítjuk */
    const _pick=chRewardPick;chRewardPick=pool=>pool.find(x=>x.kind==="money");
    /* 3.9.263: a pénz-tét a klub léptékéből jön (nem az egyenlegből) — egy nagy
       valódi bevétel adja a nagy alapot, hogy az 500-as kerekítés ne torzítson */
    S.ledger={v:LEDGER_V,rows:{[S.seasonNumber||1]:{open:0,cats:{fans:2e7}}}};
    try{const ctx=challengeContext();
      _pakli([]);ki.penz0=genReward("long","medium",ctx).amount;
      _pakli([1,2,3,4].map(()=>_lap("kihivas","jutal",5,1)));
      ki.jutalM=talKihJutalomMult();ki.penz1=genReward("long","medium",ctx).amount;}
    finally{chRewardPick=_pick;}
    /* sprint: lépcsők */
    ki.ablak=[1,2,3,4,5].map(r=>{_pakli([_lap("kihivas","ablak",r,0.5)]);
      return [talKihAblakDb(),challengeSlotLimit("short")-challengeSlotBase("short")];});
    ki.ablakTxt=talAlapSzoveg(_lap("kihivas","ablak",4,0.5));
    /* sprint kínálat: saját határidejű cél nélkül, a horgony-jelölővel */
    _pakli([_lap("kihivas","ablak",3,0.5)]);
    let hivva=false;
    const _hang=window.hang;
    chSprintThen(()=>{hivva=true;})();
    ki.sprint={db:_challengeOffers.length,scope:[...new Set(_challengeOffers.map(o=>o.scope))],
      sajat:_challengeOffers.filter(o=>o.deadlineIdx!=null||o.deadlineKind).length,flag:_chSprint,hivva};
    ki.sprintAblak=chSprintWindow();
    {const o=_challengeOffers[0];S._chAnchorPending=true;S.activeChallenges=[];
     try{acceptChallenge(o);}catch(e){ki.accErr=String(e);}
     ki.horgony=!!(o&&o.needsRoundAnchor);S._chAnchorPending=false;S.activeChallenges=[];}
    $("scWindow").classList.add("hide");$("twPanel").classList.add("hide");
    /* auto-módban nincs sprint, a lánc azonnal továbbmegy */
    {let h=false;S.auto=true;try{chSprintThen(()=>{h=true;})();}finally{S.auto=false;}ki.sprintAuto=h;}
    /* kegyelem: egy átlagos lap = 1; a második bukás már büntet */
    _pakli([_lap("kihivas","kegyelem",1,0.5)]);
    ki.kegyDb=talKihKegyelemDb();
    _pakli([1,2,3,4].map(()=>_lap("kihivas","kegyelem",5,1)));
    ki.kegyMax=talKihKegyelemDb();
    /* a rezonancia (5 lap) nem tolja a kegyelmet 3 fölé — a jutalmat emeli */
    _pakli([1,2,3,4,5,6].map(()=>_lap("kihivas","kegyelem",5,1)));
    ki.kegyRez=[talKihKegyelemDb(),talKihJutalomMult(),talKihExtraAjanlat("long")];
    _pakli([_lap("kihivas","kegyelem",1,0.5)]);
    S.chKegyelem=null;
    const _pun=applyChallengePunishment,_sat=challengeSatisfied,_add=addLine;
    let bunt=0;applyChallengePunishment=()=>{bunt++;return "BÜNTETÉS";};challengeSatisfied=()=>false;addLine=()=>{};
    try{
      const mk=()=>({desc:"próba",scope:"short",reward:{desc:"r"},punishment:{desc:"p"},deadline:{kind:"round",value:8}});
      S.resolvedChallenges=[];
      resolveChallenge(mk());resolveChallenge(mk());
      ki.kegy={bunt,out:S.resolvedChallenges.map(r=>r.outcome),met:S.resolvedChallenges.map(r=>r.met),used:talKihKegyelemAll().used};
    }finally{applyChallengePunishment=_pun;challengeSatisfied=_sat;addLine=_add;}
    return ki;});
  console.log("\n— 3. KIHÍVÁSOK —");
  ok(c.hely1[0]===1&&c.hely1[1]===0&&c.hely1[2]===0,"Több hely: egy átlagos lap a RÖVIDEKRE → +1 hely, csak ott",c.hely1);
  ok(c.hely2[2]===2&&c.hely2[0]===0&&Math.abs(c.helyV-1)<1e-9,"…betelt gyűlő érték a kupára → +2, és a plafonnál megáll",{h:c.hely2,v:c.helyV});
  ok(c.kinPct===200&&c.extra===2,"Bővebb kínálat: a 200%-os plafon = +2 biztos ajánlat",[c.kinPct,c.extra]);
  ok(Math.abs(c.konnyuP-0.4)<1e-9&&c.konnyu1>c.konnyu0+0.15,"Könnyebb célok: a 40%-os plafonnal érezhetően több a könnyű ajánlat",{p:c.konnyuP,elotte:+c.konnyu0.toFixed(3),utana:+c.konnyu1.toFixed(3)});
  ok(Math.abs(c.jutalM-1.4)<1e-9&&Math.abs(c.penz1/c.penz0-1.4)<0.03,"Gazdagabb jutalom: a pénz-tétel ×1,4 a plafonnál",{m:c.jutalM,p:[c.penz0,c.penz1]});
  ok(JSON.stringify(c.ablak)==="[[2,0],[3,0],[4,0],[4,1],[5,1]]","Idénykezdő sprint: 2/3/4/4/5 rövid ajánlat, a 4–5. fokozat +1 rövid helyet is ad",c.ablak);
  ok(!/NaN|undefined/.test(c.ablakTxt),"…a lépcső szövege tiszta",c.ablakTxt);
  ok(c.sprint.db>=3&&c.sprint.scope.join()==="short"&&c.sprint.sajat===0&&c.sprint.flag===false&&!c.sprint.hivva,
    "a sprint rövid ajánlatokat tesz elénk (saját határidejű cél nélkül), és a lánc a döntésig vár",c.sprint);
  ok(c.sprintAblak===8&&c.horgony&&!c.accErr,"…a szezonváltáskor vállalt rövid kihívás horgony-jelölőt kap (ablak: 8 meccs)",{a:c.sprintAblak,h:c.horgony,e:c.accErr});
  ok(c.sprintAuto,"végigjátszásban nincs sprint — a lánc azonnal továbbmegy");
  ok(c.kegyDb===1&&c.kegyMax===3,"Kegyelmi kártya: az első lap 1 elengedés, a gyűlő érték 3-ig",[c.kegyDb,c.kegyMax]);
  ok(c.kegyRez[0]===3&&Math.abs(c.kegyRez[1]-1.1)<1e-9&&c.kegyRez[2]===1,"Biztos kéz (rezonancia): +1 ajánlat és +10% jutalom — a kegyelem 3-nál marad",c.kegyRez);
  ok(c.kegy.bunt===1&&/elengedve/.test(c.kegy.out[0])&&c.kegy.out[1]==="BÜNTETÉS"&&c.kegy.met.every(m=>m===false)&&c.kegy.used===1,
    "…az első bukás büntetése elmarad (a bukás bukás marad), a második már büntet",c.kegy);

  /* ---- 4. REJTETT STÍLUS ---- */
  const r=await p.evaluate(()=>{
    const ki={};
    S.style=null;S.style2=null;S.rejtett=null;S.ms=null;
    /* a plafon változatonként: három Mítosz-lap ugyanarra a változatra */
    ki.p=["rpont","rszerep","rkep","rajanl"].map(v=>{_pakli([1,2,3].map(()=>_lap("rejtett",v,5,1)));return talRejtP(v);});
    /* a forgatókönyvhöz egy-egy lap (4 db: a rezonancia még nem él) — a dobást
       lent rögzítjük, tehát az esély nagysága itt nem számít */
    _pakli(["rpont","rszerep","rkep","rajanl"].map(v=>_lap("rejtett",v,5,1)));
    ki.on=rejtOn();
    /* két jelölt stílus kap egy-egy próba-mérföldkövet, amit mi kapcsolunk */
    const A="bombazok",B="villam";
    window._pv={};
    const mf=(st,id,val)=>STYLE_MILESTONES[st].push({id,t:id,d:id,val,n:1,p:()=>window._pv[id]||0});
    mf(A,"pr_a1",5000);mf(B,"pr_b1",10000);mf(A,"pr_a2",1);for(let i=0;i<10;i++)mf(B,"pr_bk"+i,1);
    _pv.pr_a1=1;   /* már az első vizsgálat előtt teljesül → csendes */
    const sp0=msState().sp||0;
    rejtScan();
    const R=rejtState();
    ki.seed={seeded:R.seeded,best:R.best,sp:(msState().sp||0)-sp0,kep:R.kep.length};
    /* mindig nyerő dobás — a döntések logikáját mérjük, nem a szerencsét */
    const _dob=rejtDob;rejtDob=()=>0;
    try{
      const sp1=msState().sp||0;
      _pv.pr_b1=1;rejtScan();   /* B (10000) előzi A-t (5000+) → B fizet */
      ki.atvesz={best:R.best,sp:(msState().sp||0)-sp1,kep:R.kep.map(x=>x.s),aj:R.ajanlat&&R.ajanlat.s};
      const sp2=msState().sp||0;
      _pv.pr_a2=1;rejtScan();   /* A: 5001 < B: 10000 → nem fizet */
      ki.lemarad={best:R.best,sp:(msState().sp||0)-sp2};
      /* képesség-plafon: 10 újabb B-mérföldkő, legfeljebb 6 képesség idén */
      for(let i=0;i<10;i++){_pv["pr_bk"+i]=1;rejtScan();}
      ki.kepDb=R.kep.length;ki.kepSz=R.kepSz[S.seasonNumber||1];
      /* a képesség a styleActiveFx-ben hat */
      const x=R.kep[0],t=STYLE_TRAITS[x.s].find(z=>z.key===x.k);
      ki.fxBenne=styleActiveFx().indexOf(t.lv[0].fx)>=0;
      /* ha a stílus élővé válik, a rejtett példánya kimarad (ott a saját fája szól) */
      S.style2={key:x.s,traits:{}};ki.fxElo=styleActiveFx().indexOf(t.lv[0].fx)>=0;S.style2=null;
      /* a II. szintű ajánlat */
      const A2=R.ajanlat;ki.aj={van:!!A2,ar:A2&&A2.ar};
      const W=msState();W.sp=(A2?A2.ar:0)-1;
      ki.ajKevés=rejtAjanlatElfogad().ok;
      W.sp=(A2?A2.ar:0)+5;
      const r2=rejtAjanlatElfogad();
      const xk=rejtKepOf(A2.s,A2.k);
      ki.ajVesz={ok:r2.ok,maradt:W.sp,lv:xk&&xk.lv,ures:R.ajanlat===null};
      /* titkos szerep: csak a saját meccsén */
      S.idx=3;
      const sz=rejtSzerepDob();
      ki.szerep={key:sz&&sz.key,stil:sz&&roleStyleOf(sz.key),best:R.best,of:sz&&roleOf(sz.key)===sz.name,akt:roleStyleActive()};
      S.idx=4;ki.szerepUtana={of:sz?roleOf(sz.key):null,akt:roleStyleActive()};
      S.idx=0;
    }finally{rejtDob=_dob;
      [A,B].forEach(st=>{STYLE_MILESTONES[st]=STYLE_MILESTONES[st].filter(d=>!/^pr_/.test(d.id));});}
    return ki;});
  console.log("\n— 4. REJTETT STÍLUS —");
  ok(r.on&&r.p.every(x=>Math.abs(x-0.33)<1e-9),"a négy esély a 33%-os plafonnál áll meg",r.p);
  ok(r.seed.seeded&&r.seed.sp===0&&r.seed.kep===0&&r.seed.best==="bombazok","az első vizsgálat CSENDES: rögzít, de nem fizet (a legjobb a már teljesítettek alapján)",r.seed);
  ok(r.atvesz.best==="villam"&&r.atvesz.sp>0&&r.atvesz.kep.indexOf("villam")>=0&&r.atvesz.aj==="villam",
    "az előző mérföldkő ÁTVESZI a vezetést, és attól a mérföldkőtől ő kap: pont, képesség, ajánlat",r.atvesz);
  ok(r.lemarad.best==="villam"&&r.lemarad.sp===0,"a lemaradó stílus mérföldköve nem fizet",r.lemarad);
  ok(r.kepSz===6&&r.kepDb===6,"idényenként legfeljebb 6 csendes képesség",[r.kepDb,r.kepSz]);
  ok(r.fxBenne&&!r.fxElo,"a csendes képesség a styleActiveFx-ben hat — az élővé vált stílusé ott kimarad",[r.fxBenne,r.fxElo]);
  ok(r.aj.van&&r.aj.ar>0&&r.ajKevés===false,"a II. szintű ajánlat megjön, és pont nélkül nem vehető meg",{aj:r.aj,keves:r.ajKevés});
  ok(r.ajVesz.ok&&r.ajVesz.maradt===5&&r.ajVesz.lv===2&&r.ajVesz.ures,"…pontért megvehető: II. szint, a pont levonva, az ajánlat lezárul",r.ajVesz);
  ok(r.szerep.key&&r.szerep.stil===r.szerep.best&&r.szerep.of&&r.szerep.akt,"titkos megbízatás: a legjobb rejtett stílus szerepe, egy hozzá illő játékosnál",r.szerep);
  ok(r.szerepUtana.of===null&&r.szerepUtana.akt===false,"…és csak a saját meccsén él",r.szerepUtana);

  /* ---- 4b. A SPECIÁLOK ---- */
  const sp=await p.evaluate(()=>{
    const ki={};
    ["kihivas","rejtett"].forEach(kat=>{
      const L=TAL_SPEC.filter(x=>x.k===kat);
      ki[kat]={db:L.length,min1:L.filter(x=>x.min===1).length,mind:L.every(x=>talSpecMukodik(x.id)),
        kontraMas:L.every(x=>x.con&&x.con.k!==kat&&(talKat(x.con.k)||x.con.k==="pakli"))};});
    const rossz=[];
    TAL_SPEC.filter(x=>x.k==="kihivas"||x.k==="rejtett").forEach(x=>{for(let r=x.min;r<=5;r++){
      const L={kat:x.k,rang:r,dobas:0.5,spec:x.id};
      const t=talSpecOldal(x,"pro",r,L)+" "+talSpecOldal(x,"con",r,L)+" "+talLapNev(L);
      if(/\{v\}|NaN|undefined/.test(t))rossz.push(x.id+": "+t);}});
    ki.rossz=rossz;
    const S1=(id,r)=>_pakli([_lap(TAL_SPEC_BY[id].k,null,r||Math.max(4,TAL_SPEC_BY[id].min),0.5,id)]);
    /* pénz-jutalom nehézen és kupán */
    const _pick=chRewardPick;chRewardPick=pool=>pool.find(x=>x.kind==="money");
    S.ledger={v:LEDGER_V,rows:{[S.seasonNumber||1]:{open:0,cats:{fans:2e7}}}};   /* 3.9.263 — lásd fent */
    try{const ctx=challengeContext();
      _pakli([]);const h0=genReward("long","hard",ctx).amount,c0=genReward("cup","medium",ctx).amount;
      S1("kockazati");ki.kock=[h0,genReward("long","hard",ctx).amount,talSpecV("kockazati","pro")];
      S1("kupalaz");ki.kupa=[c0,genReward("cup","medium",ctx).amount,talSpecV("kupalaz","pro")];}
    finally{chRewardPick=_pick;}
    S1("aranyszerzodes");ki.arany=challengeSlotLimit("long")-challengeSlotBase("long");
    S1("rutinos");{let e=0,m=0;const ctx=challengeContext();for(let i=0;i<300;i++){const o=buildChallengeOffer("short",ctx);if(o&&o.difficulty==="easy"){e++;}}ki.rutinos=e;}
    S1("halasztas");{const ctx=challengeContext();S.idx=0;let d=null;for(let i=0;i<50&&d==null;i++){const o=buildChallengeOffer("short",ctx);if(o&&o.deadline.kind==="round"&&o.deadlineIdx==null)d=o.deadline.value;}ki.halaszt=[d,shortChallengeWindow(),talSpecV("halasztas","pro")];}
    /* rejtett speciálok: egy rszerep lap + a speciál */
    _pakli([_lap("rejtett","rszerep",1,0.5),_lap("rejtett",null,4,0.5,"arnyekedzo")]);
    ki.edzo=[talRejtP("rszerep"),talAlap("rejtett","rszerep"),talSpecV("arnyekedzo","pro")];
    S1("nemataniitvany");ki.nema=rejtKepMax();
    S1("szurkebiboros",4);S.rejtett={szerep:{key:"b2b",name:"x",idx:S.idx||0,season:S.seasonNumber||1}};
    ki.biboros=[roleLevel("b2b"),roleLevel("nyito")];S.rejtett=null;
    return ki;});
  console.log("\n— 4b. SPECIÁLOK —");
  ok(sp.kihivas.db===6&&sp.rejtett.db===6&&sp.kihivas.min1>=1&&sp.rejtett.min1>=1,"6-6 speciál, mindkét színben van átlagos ritkaságú is",{k:sp.kihivas,r:sp.rejtett});
  ok(sp.kihivas.mind&&sp.rejtett.mind&&sp.kihivas.kontraMas&&sp.rejtett.kontraMas,"mind él, és minden kontra MÁSIK színt üt");
  ok(!sp.rossz.length,"a speciálok szövegei tiszták minden ritkaságon",sp.rossz.slice(0,3));
  ok(Math.abs(sp.kock[1]/sp.kock[0]-(1+sp.kock[2]/100))<0.05,"Kockázati tőke: a nehéz kihívás pénze +v%",sp.kock);
  ok(Math.abs(sp.kupa[1]/sp.kupa[0]-(1+sp.kupa[2]/100))<0.05,"Kupaláz: a kupa-kihívás pénze +v%",sp.kupa);
  ok(sp.arany>=1,"Aranyszerződés: +hely a hosszú kihívások közt",sp.arany);
  ok(sp.halaszt[0]===Math.min(30,sp.halaszt[1]+Math.round(sp.halaszt[2]))&&sp.halaszt[2]>=1,"Halasztás: a rövid határidő +v meccs",sp.halaszt);
  ok(Math.abs(sp.edzo[0]-Math.min(0.33,(sp.edzo[1]+sp.edzo[2])/100))<1e-9&&sp.edzo[2]>0,"Árnyékedző: a titkos szerep esélye +v pp",sp.edzo);
  ok(sp.nema>6,"Néma tanítvány: több csendes képesség fér bele",sp.nema);
  ok(sp.biboros[0]===2&&sp.biboros[1]===0,"Szürke bíboros (legendás): a titkos szerep II. szintű erővel, a többi szerep érintetlen",sp.biboros);

  /* ---- 5. VALÓDI MECCSEK AZ ÖSSZES ÚJ LAPPAL ---- */
  const v=await p.evaluate(async()=>{
    const ki={};
    const lapok=[];
    ["kinalat","konnyu","jutal","kegyelem"].forEach(vk=>lapok.push(_lap("kihivas",vk,3,0.5)));
    TAL_KIH_SCOPES.forEach(sc=>lapok.push(_lap("kihivas","hely",3,0.5,null,{kh:sc})));
    lapok.push(_lap("kihivas","ablak",4,0.5));
    ["rpont","rszerep","rkep","rajanl"].forEach(vk=>lapok.push(_lap("rejtett",vk,5,1)));
    _pakli(lapok);S.rejtett=null;
    const _add=addLine;addLine=()=>{};
    const _atg=autoTitleGate;autoTitleGate=()=>false;
    let szerepDb=0;const _sd=rejtSzerepDob;rejtSzerepDob=function(){const x=_sd.apply(this,arguments);if(x)szerepDb++;return x;};
    try{
      S.seasonNumber=1;S.idx=0;S.auto=true;matchSpeed=20;buildSeasonFixtures();
      playMatch();
      let last=-1,stuck=0;
      for(let i=0;i<3000&&S.idx<8;i++){
        await new Promise(r=>setTimeout(r,50));
        if(S.idx===last){if(++stuck>200){if(!S.playing){S.auto=true;try{playMatch();}catch(e){}}stuck=0;}}
        else{stuck=0;last=S.idx;}}
    }finally{S.auto=false;addLine=_add;autoTitleGate=_atg;rejtSzerepDob=_sd;}
    await new Promise(r=>setTimeout(r,500));
    ki.idx=S.idx;ki.seeded=!!(S.rejtett&&S.rejtett.seeded);ki.szerepDb=szerepDb;
    return ki;});
  console.log("\n— 5. VALÓDI MECCSEK —");
  ok(v.idx>=8,"8 forduló lement az összes új lappal",v);
  ok(v.seeded,"…a rejtett stílus mérője a meccsek közt elindult",v);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));

  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
