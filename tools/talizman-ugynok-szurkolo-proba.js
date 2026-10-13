/* 🕴️📣🎓 TALIZMÁNOK — Ügynökség, Szurkolótábor, erősebb Stáb (3.9.224)

   KIMONDOTT KÉRÉS: „A stábtagos talizmánok legyenek erősebbek és
   kreatívabbak. Legyen ügynökséges (a 3 közül valamelyik gyorsabban fejlődik,
   szezonok között garantált szintlépés a scoutnak, megnyílik a scout XL
   gyűjtés amivel magától is tud szintet lépni, nem csak nyáron, akárcsak az
   átigazolási ügynökség, az átigazolási ügynökség igazilasokert kapott
   pontszámai +100%-ra feltornázhatók) talizmáncsoport is és szurkolótáboros
   (izgalom boost speciális eseményekre külön külön talizmán, izgalmas meccs
   bevétel boost, szurkolótábor hatása hazai meccsen: boost rangadón,
   hátrányban lélekemelés, kiegyenlített meccsen ellenfél elbizonytalanítás,
   ezeket mind külön lehet nyitni, hatás százalékokkal)"

   Amit mér:
     1. A KATALÓGUS: 13 szín; a két új színnek 6-6 speciálja van, mind él;
        a Stáb öt változattal, erősebb egységgel; egyik szöveg sem hagy benne
        {v}-t, NaN-t, undefined-ot, egyik ritkaságon sem;
     2. TALIZMÁN NÉLKÜL minden új kapaszkodó semleges;
     3. ÜGYNÖKSÉG: a célzott gyorsítás (scout / ügynökség / sajtó) csak a
        saját célját mozdítja és +100%-nál megáll; a garantált scout-lépés a
        ritkaság határáig pótol; az XP-gyűjtés idény közben szintet léptet;
        az igazolás pontja +100%-ig nő; a speciálok (Exkluzív szerződés,
        Hírszerző hálózat, Kapcsolati tőke, Fejvadász, Aranykéz);
     4. SZURKOLÓTÁBOR: az esemény-felismerés; az izgalom-boost csak a saját
        eseményére jár; a kassza a 65+ izgalmú meccsen; a pillanatkép mezői
        (a rangadó-katlan csak rangadón); a matchLambdas csak hazai pályán, a
        zaj csak kiegyenlített meccsen; az időfüggő rész hátrányban és a 75.
        perctől; a Koreográfia a lelátó-küszöbön;
     5. STÁB: hatás, ár, tapasztalat, kiöregedés, stábpiac, Szakkönyvtár,
        Utánpótlás-edzők;
     6. VALÓDI MECCSEK az összes új lappal: lefutnak, XP gyűlik, és
        nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9461;
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
    ki.ugySpec=TAL_SPEC.filter(s=>s.k==="ugynok").length;
    ki.szuSpec=TAL_SPEC.filter(s=>s.k==="szurkolo").length;
    ki.stabSpec=TAL_SPEC.filter(s=>s.k==="stab").length;
    ki.mind=TAL_SPEC.every(s=>talSpecMukodik(s.id));
    ki.kontraMas=TAL_SPEC.filter(s=>["ugynok","szurkolo","stab"].indexOf(s.k)>=0).every(s=>s.con&&s.con.k!==s.k);
    ki.rez=!!(TAL_REZ.ugynok&&TAL_REZ.szurkolo);
    ki.stabValt=talKat("stab").valt.map(V=>V.k);
    ki.stabU=talKat("stab").valt.filter(V=>V.k==="hatas"||V.k==="ar").map(V=>[V.u,V.cap]);
    /* minden szöveg, minden ritkaságon */
    const rossz=[];
    ["ugynok","szurkolo","stab"].forEach(kat=>{
      for(let r=1;r<=5;r++){
        talKat(kat).valt.forEach(V=>{
          const L={kat,valt:V.k,rang:r,dobas:0.5,spec:null};
          if(kat==="ugynok"&&V.k==="fejl")L.ug="sajto";
          if(kat==="szurkolo"&&V.k==="izgalom")L.ie="mester";
          const t=talAlapSzoveg(L)+" "+talLapNev(L)+" "+talSav(L);
          if(/\{v\}|NaN|undefined|null/.test(t))rossz.push(t);});
        TAL_SPEC.filter(s=>s.k===kat&&s.min<=r).forEach(s=>{
          const L={kat,rang:r,dobas:0.5,spec:s.id};
          const t=talSpecOldal(s,"pro",r,L)+" "+talSpecOldal(s,"con",r,L);
          if(/\{v\}|NaN|undefined/.test(t))rossz.push(s.id+": "+t);});}});
    ki.rossz=rossz;
    /* a generátor: a célzott változat mindig kap célt */
    let cel=0,db=0;
    for(let i=0;i<400;i++){
      const r=talRng("proba",i);
      const L1=talUjLap(r,"ugynok",1,{tiszta:true}),L2=talUjLap(r,"szurkolo",1,{tiszta:true});
      [L1,L2].forEach(L=>{if(L.valt==="fejl"||L.valt==="izgalom"){db++;if(L.ug||L.ie)cel++;}});}
    ki.cel=[cel,db];
    return ki;});
  console.log("— 1. A KATALÓGUS —");
  ok(k.kat.length===13&&k.kat[11]==="ugynok"&&k.kat[12]==="szurkolo","13 szín: az Ügynökség és a Szurkolótábor a Boost után",k.kat);
  ok(k.ugySpec===6&&k.szuSpec===6&&k.stabSpec===10&&k.mind,"6-6 új speciál, a Stábnak +2 (8 → 10) — mind él",{u:k.ugySpec,s:k.szuSpec,st:k.stabSpec});
  ok(k.kontraMas&&k.rez,"minden új kontra MÁSIK területet üt, és mindkét új színnek van rezonanciája");
  ok(k.stabValt.join(",")==="hatas,ar,xp,oreg,vadasz"&&k.stabU[0][0]===6&&k.stabU[0][1]===50&&k.stabU[1][0]===7&&k.stabU[1][1]===55,
     "a Stáb öt változattal, erősebb egységgel és plafonnal",{v:k.stabValt,u:k.stabU});
  ok(!k.rossz.length,"egyik szöveg sem hagy benne {v}-t, NaN-t, undefined-ot (5 ritkaság)",k.rossz.slice(0,3));
  ok(k.cel[0]===k.cel[1]&&k.cel[1]>0,"a célzott változat mindig kap célt (scout/ügynökség/sajtó, ill. esemény)",k.cel);

  /* ---- 2. SEMLEGES TALIZMÁN NÉLKÜL ---- */
  const n=await p.evaluate(()=>{
    _pakli([]);S.tal=null;_talAlapMemo=null;
    const L=LELATO.find(x=>x.fan>0);
    return {fejl:["scout","ugynok","sajto"].map(talUgyFejlMult),pont:talUgyPontMult(),xl:talScoutXpPct(),gar:talUgyGaranciaFok(),
      bev:talSzurkBevetelMult({exc:90,home:true}),mezo:talSzurkMezo(),izg:talSzurkIzgalomPlusz({diff:4,goals:6,rival:true,cup:true,comeback:1,decisiveMin:90},[],true),
      need:agencyNextPts(0),list:agencyMaxListings(1),err:scoutErrorPct(5),kuszob:lelatoFanKuszob(L)===L.fan,
      xp:talStabXpMult(),oreg:talStabOregPlusz(),vad:talStabVadaszPlusz(),ultra:talUltrakMult(),
      ido:talSzurkIdo({talSzurk:null},80,0,1,true)};});
  console.log("\n— 2. TALIZMÁN NÉLKÜL —");
  ok(n.fejl.join(",")==="1,1,1"&&n.pont===1&&n.xl===0&&n.gar===0&&n.bev===1&&n.mezo===null&&n.izg===null
     &&n.need===3&&n.list===2&&Math.abs(n.err-(0.75-(4/9)*0.73))<1e-9&&n.kuszob&&n.xp===1&&n.oreg===0&&n.vad===0&&n.ultra===1&&n.ido===1,
     "minden új kapaszkodó semleges (×1 / 0 / null), a régi számok bitre a régiek",n);

  /* ---- 3. ÜGYNÖKSÉG ---- */
  const u=await p.evaluate(()=>{
    const ki={};
    const E=4.2*1.25;   /* legendás, dobás 0,5, Tiszta */
    _pakli([_lap("ugynok","fejl",4,0.5,null,{ug:"scout"})]);
    ki.fejlScout=["scout","ugynok","sajto"].map(talUgyFejlPct);
    ki.vartScout=Math.min(100,12*E);
    /* a scout nyári esélye: 0,28 × (1+63%) ≈ 0,456 — a 0,40-es dobás már fejleszt */
    const _r=Math.random;
    try{
      Math.random=()=>0.40;
      const s1={stars:3};maybeImproveScout(s1);ki.nyarVele=s1.stars;
      _pakli([]);const s2={stars:3};maybeImproveScout(s2);ki.nyarNelkul=s2.stars;
    }finally{Math.random=_r;}
    /* plafon: tíz legendás → +100% */
    _pakli(Array.from({length:10},()=>_lap("ugynok","fejl",4,1,null,{ug:"ugynok"})));
    ki.plafon=talUgyFejlPct("ugynok");ki.need=agencyNextPts(0);ki.need5=agencyNextPts(5);
    /* sajtó: a tábor-arány többet ér */
    _pakli([]);const r0=pressRatio();
    _pakli([_lap("ugynok","fejl",4,0.5,null,{ug:"sajto"})]);ki.sajto=[r0,pressRatio(),talUgyFejlMult("sajto")];
    /* GARANTÁLT SCOUT-LÉPÉS — ritka (2): 6,5★-ig pótol */
    try{
      Math.random=()=>0.99;   /* a nyár magától nem hoz */
      _pakli([_lap("ugynok","garancia",2,0.5)]);
      const a={stars:3};maybeImproveScout(a);
      const c={stars:6.5};maybeImproveScout(c);
      const d={stars:6};maybeImproveScout(d);
      ki.gar=[a.stars,c.stars,d.stars,talUgyGaranciaFok()];
      /* Mítosz (5): ha a nyár hozta, még +½★ */
      Math.random=()=>0;
      _pakli([_lap("ugynok","garancia",5,0.5)]);
      const e={stars:4};maybeImproveScout(e);ki.mitosz=e.stars;
      /* égetett lap nem hat */
      Math.random=()=>0.99;
      _pakli([Object.assign(_lap("ugynok","garancia",4,0.5),{eget:1})]);
      const f={stars:3};maybeImproveScout(f);ki.eget=f.stars;
    }finally{Math.random=_r;}
    /* XP-GYŰJTÉS — legendás xl: +105% → 2,05 pont / meccs; 1★ → 12 pont kell */
    _pakli([_lap("ugynok","xl",4,0.5)]);
    const _s=scout;scout={name:"Próba",stars:1};
    const _add=addLine;addLine=()=>{};
    try{
      ki.xlPct=talScoutXpPct();
      let i=0;for(;i<20&&scout.stars===1;i++)talScoutXpTick();
      ki.xlMeccs=i;ki.xlStars=scout.stars;ki.xlMarad=talScoutXpAll().pts;
      ki.xlNeed=[scoutXpNeed(1),scoutXpNeed(5),scoutXpNeed(9.5)];
      /* az XP-csík: 1,5★-on 0,3 / 15 XP (2%) */
      const bar=scoutXpBar();
      ki.xpBar=[/Scout XP/.test(bar),/0,3<\/b> \/ 15 XP/.test(bar),/width:2\.0%/.test(bar),!/XL/.test(bar)];
      scout.stars=10;talScoutXpTick();ki.xlMax=[scout.stars,talScoutXpAll().pts];
    }finally{scout=_s;addLine=_add;}
    /* ÜZLETI PONTVADÁSZ: az igazolás pontja ×2 (plafon) */
    const _ag=agency;
    try{
      addLine=()=>{};
      S.transferBudget=1e9;
      _pakli([]);agency=null;const p0=agencyAward("buy",100000,"X Próba");
      agency=null;const m0=agencyAward("market",100000,"X Próba");
      /* négy legendás lap (ötnél már a rezonancia +1 pontja is hatna) */
      _pakli(Array.from({length:4},()=>_lap("ugynok","pont",4,1)));agency=null;const p1=agencyAward("buy",100000,"X Próba");
      ki.pont=[p0,p1,talUgyPontMult(),m0];
      /* FEJVADÁSZ: a piaci eladás pontja +v%, és jutalék az igazolás után */
      _pakli([_lap("ugynok",null,1,0.5,"fejvadasz")]);
      agency=null;const m1=agencyAward("market",100000,"X Próba");
      const b0=S.transferBudget||0;agency=null;agencyAward("buy",100000,"X Próba");
      ki.fejvadasz=[m1/m0,talSpecV("fejvadasz","pro"),b0-(S.transferBudget||0),talSpecV("fejvadasz","con")];
    }finally{agency=_ag;addLine=_add;}
    /* EXKLUZÍV SZERZŐDÉS, HÍRSZERZŐ HÁLÓZAT, KAPCSOLATI TŐKE */
    _pakli([]);const L0=agencyMaxListings(1),e0=scoutErrorPct(5),ap0=agencyUpgradePrice(),sp0=scoutUpgradePriceNow(),t0=talTisztaShift();
    _pakli([_lap("ugynok",null,1,0.5,"exkluziv"),_lap("ugynok",null,2,0.5,"hirszerzo"),_lap("ugynok",null,3,0.5,"kapcsolati")]);
    ki.spec={list:[L0,agencyMaxListings(1)],err:[e0,scoutErrorPct(5),talSpecV("hirszerzo","pro")],
      ap:[ap0,agencyUpgradePrice()],sp:[sp0,scoutUpgradePriceNow()],tiszta:[t0,talTisztaShift()]};
    /* ARANYKÉZ: a gyengébbik lép a szezonváltáskor */
    const _s2=scout,_ag2=agency;
    try{
      addLine=()=>{};
      _pakli([_lap("ugynok",null,4,0.5,"aranykez")]);
      scout={name:"P",stars:2};agency=null;agencyState();   /* ügynökség 1★ < scout 2★ */
      talUjSzinSzezonvaltas();ki.arany1=[scout.stars,agencyStars()];
      scout={name:"P",stars:1};agency=null;agencyState();agency.lvl=4;   /* scout 1★ < ügynökség 3★ */
      talUjSzinSzezonvaltas();ki.arany2=[scout.stars,agencyStars()];
    }finally{scout=_s2;agency=_ag2;addLine=_add;}
    /* REZONANCIA: 5 lap → +1 pont üzletenként, −15% scout-ár */
    try{
      addLine=()=>{};
      _pakli(Array.from({length:5},()=>_lap("ugynok","pont",1,0)));
      ki.rez=[talRez("ugynok"),talScoutArMult()];
    }finally{addLine=_add;}
    return ki;});
  console.log("\n— 3. ÜGYNÖKSÉG —");
  ok(Math.abs(u.fejlScout[0]-u.vartScout)<1e-9&&u.fejlScout[1]===0&&u.fejlScout[2]===0,"Gyorsabb fejlődés (scout): csak a saját célját mozdítja",u.fejlScout);
  ok(u.nyarVele===3.5&&u.nyarNelkul===3,"…a scout nyári esélye ×(1+63%): a 0,40-es dobás így fejleszt, nélküle nem",[u.nyarVele,u.nyarNelkul]);
  ok(u.plafon===100&&u.need===1.5&&u.need5===6.5,"…az ügynökségnél +100%-nál megáll, és a szintek pontigénye a felére esik",[u.plafon,u.need,u.need5]);
  ok(Math.abs(u.sajto[1]-u.sajto[0]*u.sajto[2])<1e-9||(u.sajto[0]===1&&u.sajto[1]>=1),"…a sajtónál a tábor-arány többet ér",u.sajto);
  ok(u.gar[0]===3.5&&u.gar[1]===6.5&&u.gar[2]===6.5&&u.gar[3]===2,"Garantált scout-lépés (ritka): pótol, de csak 6,5★-ig",u.gar);
  ok(u.mitosz===5&&u.eget===3,"…a Mítosz a nyári lépés mellé még +½★-ot ad; az égetett lap nem hat",[u.mitosz,u.eget]);
  ok(Math.abs(u.xlPct-105)<1e-9&&u.xlMeccs===6&&u.xlStars===1.5&&Math.abs(u.xlMarad-0.3)<1e-6&&u.xlNeed.join(",")==="12,36,63",
     "Scout XP: 2,05 pont/meccs → 6 meccs után 1,5★, a maradék tovább számít; a küszöb 12 / 36 / 63",u);
  ok(u.xlMax[0]===10&&u.xlMax[1]===0,"…a maximumon nem gyűjt tovább",u.xlMax);
  ok(u.xpBar.every(Boolean),"…a scout-panel XP-csíkja: 0,3 / 15 XP, 2% (sehol nem „XL”)",u.xpBar);
  ok(Math.abs(u.pont[1]/u.pont[0]-2)<1e-9&&u.pont[2]===2,"Üzleti pontvadász: az igazolás pontja +100%-ig (×2)",u.pont);
  ok(Math.abs(u.fejvadasz[0]-1.3)<1e-9&&u.fejvadasz[2]===Math.round(100000*u.fejvadasz[3]/100),"Fejvadász: piaci eladás +30% pont · a vételár 2%-a jutalék",u.fejvadasz);
  ok(u.spec.list[1]===u.spec.list[0]+1,"Exkluzív szerződés: +1 piaci hely",u.spec.list);
  ok(Math.abs(u.spec.err[1]-u.spec.err[0]*(1-u.spec.err[2]/100))<1e-9,"Hírszerző hálózat: a POT-becslés hibája −v%",u.spec.err);
  ok(u.spec.ap[1]<u.spec.ap[0]&&u.spec.sp[1]>u.spec.sp[0],"Kapcsolati tőke: olcsóbb ügynökség, drágább scout",{ap:u.spec.ap,sp:u.spec.sp});
  ok(u.spec.tiszta[1]<u.spec.tiszta[0],"Hírszerző hálózat (kontra): kevesebb esély a tiszta üzletre",u.spec.tiszta);
  ok(u.arany1[0]===2&&u.arany1[1]===1.5&&u.arany2[0]===1.5&&u.arany2[1]===3,"Aranykéz: a gyengébbik lép (előbb az ügynökség, aztán a scout)",{a1:u.arany1,a2:u.arany2});
  ok(u.rez[0]&&Math.abs(u.rez[1]-0.85)<1e-9,"Belső információ (rezonancia): a scout-fejlesztés −15%",u.rez);

  /* ---- 4. SZURKOLÓTÁBOR ---- */
  const s=await p.evaluate(()=>{
    const ki={};
    const E=4.2*1.25;
    /* az esemény-felismerés */
    const log=[{side:"us",name:"A",min:10},{side:"us",name:"A",min:30},{side:"them",name:"Z",min:50},{side:"us",name:"A",min:88}];
    ki.es1=talSzurkEsemenyek({diff:2,goals:4,rival:true,comeback:1,decisiveMin:88,cup:false},log);
    ki.es2=talSzurkEsemenyek({diff:5,goals:5,rival:false,comeback:0,decisiveMin:20,cup:true},[]);
    ki.es3=talSzurkEsemenyek({diff:-1,goals:1,rival:true,comeback:0,decisiveMin:60,cup:false},[]);
    /* izgalom-boost: rangadó-győzelemre szóló legendás lap */
    _pakli([_lap("szurkolo","izgalom",4,0.5,null,{ie:"derby"})]);
    ki.izgDerby=talSzurkIzgalomPlusz({diff:1,goals:1,rival:true},[],false);
    ki.izgMas=talSzurkIzgalomPlusz({diff:1,goals:1,rival:false},[],false);
    ki.izgVart=Math.round(Math.min(25,3*E));
    /* kassza: csak a 65+ izgalmú meccsen */
    _pakli([_lap("szurkolo","kassza",4,0.5)]);
    ki.kassza=[talSzurkBevetelMult({exc:70}),talSzurkBevetelMult({exc:64}),1+Math.min(50,6*E)/100];
    /* a pillanatkép: a rangadó-katlan csak rangadón */
    /* lapról lapra (egy színben a 2. lap már csak 85%-ot érne) */
    const egy=vk=>{_pakli([_lap("szurkolo",vk,4,0.5)]);return talSzurkMezo();};
    _talKtx={derby:false};ki.mezoNem=egy("rangado");
    _talKtx={derby:true};ki.mezoIgen=Object.assign({},egy("rangado"),egy("lelek"),egy("bizony"));_talKtx=null;
    ki.mezoVart=[1+Math.min(12,1.5*E)/100,1-Math.min(10,1.2*E)/100];
    /* a matchLambdas: csak hazai pályán; a zaj csak kiegyenlített meccsen */
    const base={ovr:80,tacticEffect:0,defMult:1,ownGoalMult:1,oppGoalMult:1,chemPairs:0};
    const Z={rg:1.1,bz:0.9};
    const h0=matchLambdas(base,81,SIM.HOME),h1=matchLambdas(Object.assign({},base,{talSzurk:Z}),81,SIM.HOME);
    const f0=matchLambdas(base,90,SIM.HOME),f1=matchLambdas(Object.assign({},base,{talSzurk:Z}),90,SIM.HOME);
    const a0=matchLambdas(base,81,SIM.AWAY),a1=matchLambdas(Object.assign({},base,{talSzurk:Z}),81,SIM.AWAY);
    const x1=matchLambdas(Object.assign({},base,{talSzurk:{rg:5,bz:0.01}}),81,SIM.HOME);
    ki.lam={hazLf:h1.lf/h0.lf,hazLa:h1.la/h0.la,erosLa:f1.la/f0.la,idLf:a1.lf/a0.lf,idLa:a1.la/a0.la,vagLf:x1.lf/h0.lf,vagLa:x1.la/h0.la};
    /* az időfüggő rész */
    const sn={talSzurk:{hl:1.08,h75:1.04}};
    ki.ido=[talSzurkIdo(sn,30,0,1,true),talSzurkIdo(sn,80,1,1,true),talSzurkIdo(sn,80,0,1,true),talSzurkIdo(sn,80,0,1,false),talSzurkIdo(sn,30,1,0,true)];
    /* a pillanatkép a párharc-drótba is bekerül, és a kikapcsolt párharc törli */
    ki.drot=TAL_SNAP_MEZOK.indexOf("talSzurk")>=0;
    /* KOREOGRÁFIA: a lelátó szurkolóküszöbe */
    const L=LELATO.find(x=>x.fan>0);
    _pakli([_lap("szurkolo",null,3,0.5,"koreografia")]);
    ki.kor=[L.fan,lelatoFanKuszob(L),talSpecV("koreografia","pro")];
    /* BÉRLETESEK, KÖZÖNSÉGDÍJ (kontra), TELT HÁZ (rezonancia) */
    _pakli([_lap("szurkolo",null,2,0.5,"berletes"),_lap("szurkolo",null,1,0.5,"kozonsegdij")]);
    ki.berl=[talSzurkBevetelMult({home:true,exc:50}),talSzurkBevetelMult({home:false,exc:50}),talSzurkBevetelMult({home:false,exc:20}),
      talSpecV("berletes","pro"),talSpecV("kozonsegdij","con")];
    _pakli(Array.from({length:5},()=>_lap("szurkolo","kassza",1,0)));
    ki.rez=[talRez("szurkolo"),talSzurkBevetelMult({home:true,exc:50})];
    /* LEGENDÁS LELÁTÓ: minden hazai meccs +v izgalom */
    _pakli([_lap("szurkolo",null,4,0.5,"legendaslelato")]);
    ki.leg=[talSzurkIzgalomPlusz({diff:0,goals:0},[],true),talSzurkIzgalomPlusz({diff:0,goals:0},[],false)];
    /* ULTRÁK (kontra): idegenben a meccserő a pillanatképben */
    _pakli([_lap("szurkolo",null,2,0.5,"ultrak")]);
    ki.ultrak=[talMeccsSnapMezok().talAway,talSpecV("ultrak","con"),talUltrakMult()];
    return ki;});
  console.log("\n— 4. SZURKOLÓTÁBOR —");
  ok(s.es1.join(",")==="fordit,derby,hajra,mester"&&s.es2.join(",")==="zapor,kiutes,nulla,kupa"&&s.es3.length===0,"az események felismerése a meccs lefolyásából",{a:s.es1,b:s.es2,c:s.es3});
  ok(s.izgDerby&&s.izgDerby.pont===s.izgVart&&s.izgMas===null,"Izgalom-boost: csak a saját eseményére jár (rangadó-győzelem +16)",{d:s.izgDerby,m:s.izgMas,v:s.izgVart});
  ok(Math.abs(s.kassza[0]-s.kassza[2])<1e-9&&s.kassza[1]===1,"Izgalmas kassza: a 65+ izgalmú meccs bevétele nő, a 64-esé nem",s.kassza);
  ok(s.mezoNem===null&&Math.abs(s.mezoIgen.rg-s.mezoVart[0])<1e-9&&Math.abs(s.mezoIgen.hl-s.mezoVart[0])<1e-9&&Math.abs(s.mezoIgen.bz-s.mezoVart[1])<1e-9,
     "a pillanatkép: a rangadó-katlan csak rangadón, a lélekemelés és a zaj mindig",{nem:s.mezoNem,igen:s.mezoIgen});
  ok(Math.abs(s.lam.hazLf-1.1)<1e-9&&Math.abs(s.lam.hazLa-0.9)<1e-9&&Math.abs(s.lam.erosLa-1)<1e-9&&s.lam.idLf===1&&s.lam.idLa===1,
     "matchLambdas: hazai pályán hat, idegenben nem; a zaj csak kiegyenlített (±3) meccsen",s.lam);
  ok(Math.abs(s.lam.vagLf-1.15)<1e-9&&Math.abs(s.lam.vagLa-0.85)<1e-9,"…a hamis (túl nagy) érték ±15%-ba vágva",s.lam);
  ok(s.ido.join(",")===[1.08,1.04,1.08*1.04,1,1].join(","),"az időfüggő rész: hátrányban és a 75. perctől, csak hazai pályán",s.ido);
  ok(s.drot,"a mező a talizmán-pillanatkép része (a kikapcsolt párharc törli)");
  ok(s.kor[1]===Math.round(s.kor[0]*(1-s.kor[2]/100))&&s.kor[1]<s.kor[0],"Koreográfia: a lelátó-hang szurkolóküszöbe −v%",s.kor);
  ok(Math.abs(s.berl[0]-(1+s.berl[3]/100))<1e-9&&s.berl[1]===1&&Math.abs(s.berl[2]-(1-s.berl[4]/100))<1e-9,"Bérletesek: hazai bevétel +v% · Közönségdíj (kontra): 30 alatti izgalomnál −v%",s.berl);
  ok(s.rez[0]&&Math.abs(s.rez[1]-1.1)<1e-9,"Telt ház (rezonancia): hazai bevétel +10%",s.rez);
  ok(s.leg[0]&&s.leg[0].pont===5&&s.leg[1]===null,"Legendás lelátó: minden hazai meccs +5 izgalom (legendáson), idegenben semmi",s.leg);
  ok(Math.abs(s.ultrak[0]+s.ultrak[1])<1e-9&&s.ultrak[2]>1,"Ultrák: a tábor-növekedés nő · idegenben a meccserő −v (a pillanatképben)",s.ultrak);

  /* ---- 5. STÁB ---- */
  const st=await p.evaluate(()=>{
    const ki={};
    const E=4.2*1.25;
    const c={type:"attr:gol",sz:70};
    _pakli([]);const q0=coachQual(c),sp0=staffPrice(70),rf0=coachRetireFrom(),cap0=coachSzCap({sz:60,szBase:60}),band0=staffMarketBand();
    /* lapról lapra (egy színben a 2. lap már csak 85%-ot érne) */
    const egy=vk=>_pakli([_lap("stab",vk,4,0.5)]);
    egy("hatas");ki.hatas=[coachQual(c)/q0,1+6*E/100];
    egy("ar");ki.ar=[staffPrice(70)/sp0,1-7*E/100];
    egy("xp");ki.xp=[talStabXpMult(),1+15*E/100];
    egy("oreg");ki.oreg=[coachRetireFrom()-rf0,0.8*E];
    egy("vadasz");ki.vad=[talStabVadaszPlusz(),Math.round(1.5*E)];
    const band1=staffMarketBand();ki.band=[band0.lo,band0.hi,band1.lo,band1.hi];
    _pakli([_lap("stab",null,2,0.5,"szakkonyvtar"),_lap("stab",null,1,0.5,"utanpotlas")]);
    ki.konyv=[coachSzCap({sz:60,szBase:60})-cap0,talSpecV("szakkonyvtar","pro"),talStabKiadasMult(),talSpecV("szakkonyvtar","con")];
    /* Utánpótlás-edzők: 21 alatt erősebb; a 30 felettiek fejlődése lassabb */
    ki.utan=[talSpecV("utanpotlas","pro"),talFejlSzorzo(31,"x"),talFejlSzorzo(25,"x"),talSpecV("utanpotlas","con")];
    return ki;});
  console.log("\n— 5. STÁB —");
  ok(Math.abs(st.hatas[0]-st.hatas[1])<1e-9,"Jobb szakemberek: a coachQual ×(1+6×E%)",st.hatas);
  ok(Math.abs(st.ar[0]-st.ar[1])<0.002,"Olcsóbb stáb: a stábtag ára −7×E%",st.ar);
  ok(Math.abs(st.xp[0]-st.xp[1])<1e-9,"Gyors tanulók: a tapasztalatgyűjtés ×(1+15×E%)",st.xp);
  ok(Math.abs(st.oreg[0]-st.oreg[1])<1e-9,"Örökifjú stáb: a kiöregedés 0,8×E évvel később",st.oreg);
  ok(st.vad[0]===st.vad[1]&&st.band[3]>=st.band[1]&&st.band[2]>=st.band[0],"Szakember-vadász: a stábpiac sávja feljebb",{v:st.vad,b:st.band});
  ok(st.konyv[0]===st.konyv[1]&&Math.abs(st.konyv[2]-(1+st.konyv[3]/100))<1e-9,"Szakkönyvtár: a Szakértelem-plafon +v · a stáb-kiadás +v%",st.konyv);
  ok(st.utan[0]>0&&Math.abs(st.utan[1]-(1-st.utan[3]/100))<1e-9&&st.utan[2]===1,"Utánpótlás-edzők (kontra): a 30 felettiek fejlődése −v%",st.utan);

  /* ---- 6. VALÓDI MECCSEK AZ ÖSSZES ÚJ LAPPAL ---- */
  const v=await p.evaluate(async()=>{
    const ki={};
    const lapok=[];
    ["fejl","xl","pont","garancia"].forEach((vk,i)=>lapok.push(_lap("ugynok",vk,3,0.5,null,vk==="fejl"?{ug:"scout"}:null)));
    TAL_SZURK_ES.forEach(E=>lapok.push(_lap("szurkolo","izgalom",3,0.5,null,{ie:E.k})));
    ["kassza","rangado","lelek","bizony"].forEach(vk=>lapok.push(_lap("szurkolo",vk,3,0.5)));
    TAL_SPEC.filter(x=>x.k==="ugynok"||x.k==="szurkolo"||x.id==="szakkonyvtar"||x.id==="utanpotlas")
      .forEach(x=>lapok.push(_lap(x.k,null,Math.max(4,x.min),0.5,x.id)));
    _pakli(lapok);
    if(!scout)scout={name:"Próba",stars:2};
    const xl0=talScoutXpAll().pts||0,st0=scout.stars;
    const _add=addLine;addLine=()=>{};
    const _atg=autoTitleGate;autoTitleGate=()=>false;
    const t0=Date.now();
    try{
      S.seasonNumber=1;S.idx=0;S.auto=true;matchSpeed=20;buildSeasonFixtures();
      playMatch();
      let last=-1,stuck=0;
      for(let i=0;i<3000&&S.idx<8;i++){
        await new Promise(r=>setTimeout(r,50));
        if(S.idx===last){if(++stuck>200){if(!S.playing){S.auto=true;try{playMatch();}catch(e){}}stuck=0;}}
        else{stuck=0;last=S.idx;}}
    }finally{S.auto=false;addLine=_add;autoTitleGate=_atg;}
    await new Promise(r=>setTimeout(r,500));
    ki.idx=S.idx;ki.mp=Date.now()-t0;
    const X=talScoutXpAll();
    ki.xl=[xl0,X.pts,X.lep||0,st0,scout.stars];
    ki.exc=(S.seasonDrama&&S.seasonDrama.n)||0;
    return ki;});
  console.log("\n— 6. VALÓDI MECCSEK —");
  ok(v.idx>=8,"8 forduló lement az összes új lappal",v);
  ok(v.xl[2]>0||v.xl[1]>v.xl[0],"…a Scout XP meccsről meccsre gyűlt (vagy már szintet is léptetett)",v.xl);
  ok(v.exc>=8,"…minden meccs izgalma könyvelődött",v.exc);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));

  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
