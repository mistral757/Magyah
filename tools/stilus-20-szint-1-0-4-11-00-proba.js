/* 👑 A 20. CSAPATSTÍLUS-SZINT JUTALMAI (1.0.4.11.00).

   KÉRÉS: „mostantól mindig lehet egy újabb csapatstílust választani, amint
   eléred a 20. szintet az egyik csapatstílusoddal — jelezve a menüben is" ·
   „a 20. szinten választhatsz annak 3 képességét, amit további 3-3 szintén át
   lehet fejleszteni, jelentősen drágábban" · „a csapatstílus saját
   pontgyűjtője (meccserő) kinyílik további 10 szinttel".

   Amit mér:
     1. ÚJABB FILOZÓFIA: minden 20. szintre jutott filozófia egy újabb helyet
        nyit; az extra teljes értékű slot (másodlagosként viselkedik), nem
        választható kétszer ugyanaz, a nézet körbeváltható, a mentés viszi;
     2. a menüsáv jelzi a lehetőséget (gomb) és a célt (jelzés a szinthez);
     3. CSÚCSFOK: a tábla minden képességre három lépcsőt ad, stílusonként
        legalább három jelölhető, a jelölés csak a 20. szinten megy, legfeljebb
        3, a 4–6. szint jóval drágább, a hatás tényleg él, a stílus szintjét
        nem mozdítja;
     4. A PONTGYŰJTŐ 11–20. SZINTJE: csak a 20. stílusszinten vehető meg, a
        hozam és a plafon nő, a régi létra (1–10.) változatlan;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9411;
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

  /* ---- alap: karrier, két filozófia, a szint kézben tartva ---- */
  const r=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>false;pendingWorldSeed="STILUS20";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    window.__saveReal=saveGame;window.saveGame=()=>{};phase="season";
    addLine=()=>{};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[];S.styleView=1;
    /* a stílus-szintet kézben tartjuk: kulcs → szint */
    window.__L={beton:6,bombazok:6};
    const _sl=styleLevel;window.__sl=_sl;
    styleLevel=st=>(st&&st.key&&window.__L[st.key]!=null)?window.__L[st.key]:_sl(st);
    styleLvlCacheClear();

    /* ---- 1. ÚJABB FILOZÓFIA ---- */
    o.zarva=[styleXCanChoose(),styleXGateWhy()];
    o.zarvaChoose=chooseStyleX("villam",null);
    window.__L.beton=20;styleLvlCacheClear();
    o.nyitva=[styleXCanChoose(),styleMasterCount()];
    o.duplikalt=chooseStyleX("beton",null);
    o.csillagos=chooseStyleX("sztar",null);                 /* sztár nélkül nem megy */
    o.valasz=chooseStyleX("villam",null);
    o.slotok=styleSlots().map(x=>x.key);
    o.nezet=styleViewIdx();
    o.masodlagos=[styleIsSecondary(S.styleExtra[0]),styleIsSecondary(S.style),styleIsSecondary(S.style2)];
    o.masodikra=chooseStyleX("tikitaka",null);              /* még nincs 2. 20-as szint */
    o.masodikGate=styleXGateWhy();
    window.__L.bombazok=20;styleLvlCacheClear();
    o.masodikNyit=styleXCanChoose();
    /* ---- 2. a sáv ---- */
    o.barNyitva=style2BarHtml();
    o.valasz2=chooseStyleX("tikitaka",null);
    o.nezet2=styleViewIdx();
    o.barZarva=style2BarHtml();
    o.fast=[styleLevelOfFast(S.styleExtra[0]),styleLevelOfFast(S.styleExtra[1])];
    /* a nézet körbeváltása */
    const seq=[];for(let i=0;i<5;i++){seq.push(styleViewIdx());styleViewSet(styleViewIdx()%styleSlots().length+1);}
    o.korbe=seq;
    /* hatások: az extra filozófia képességei élnek */
    S.styleExtra[0].traits.villamkontra=1;styleLvlCacheClear();     /* a Villám képessége, extra slotban */
    o.extraFx=styleOwnGoalMult();
    /* mentés körbe */
    const kulcs=SAVE_KEY;window.saveGame=undefined;
    return o;});
  ok(r.zarva[0]===false&&/20\. szintet/.test(r.zarva[1]),"1a. 20. szint nélkül az újabb filozófia zárva, a szöveg megmondja miért",r.zarva);
  ok(r.zarvaChoose&&r.zarvaChoose.ok===false,"1b. zárva a választás is nem megy",r.zarvaChoose);
  ok(r.nyitva[0]===true&&r.nyitva[1]===1,"1c. egy 20. szintű filozófia = egy újabb hely",r.nyitva);
  ok(r.duplikalt.ok===false&&/már a tiéd/.test(r.duplikalt.reason),"1d. ugyanazt nem lehet kétszer felvenni",r.duplikalt);
  ok(r.csillagos.ok===false,"1e. a sztáros filozófiához sztár kell",r.csillagos);
  ok(r.valasz.ok===true&&JSON.stringify(r.slotok)===JSON.stringify(["beton","bombazok","villam"]),"1f. az újabb filozófia felvehető, a harmadik slotba kerül",r.slotok);
  ok(r.nezet===3,"1g. a panel az újonnan felvett filozófiára vált",r.nezet);
  ok(r.masodlagos[0]===true&&r.masodlagos[1]===false&&r.masodlagos[2]===true,"1h. az extra másodlagosként viselkedik, az elsődleges nem",r.masodlagos);
  ok(r.masodikra.ok===false,"1i. újabb hely csak újabb 20. szinttel jön (1 extra → még egy kell)",{masodikra:r.masodikra,gate:r.masodikGate});
  ok(r.masodikNyit===true,"1j. a második 20. szint újabb helyet nyit",r.masodikNyit);
  ok(r.valasz2.ok===true&&r.nezet2===4,"1k. a negyedik filozófia is felvehető",{v:r.valasz2,n:r.nezet2});
  ok(JSON.stringify(r.korbe)===JSON.stringify([4,1,2,3,4]),"1l. a nézet körbeváltható mind a négy filozófián",r.korbe);
  ok(r.fast[0]===1&&r.fast[1]===1,"1m. a szint-memó extra slotra is él",r.fast);
  ok(r.extraFx>1,"1n. az extra filozófia képességei élnek a motoron",r.extraFx);
  ok(/id="style2Pick"/.test(r.barNyitva)&&/Válaszd ki a 4\. csapatstílust/.test(r.barNyitva),"2a. nyitott hely: a sáv gombja kiírja (hányadik filozófia)",r.barNyitva.replace(/<[^>]+>/g," ").slice(0,200));
  ok((r.barZarva.match(/data-styleview="\d"/g)||[]).length>=3&&!/id="style2Swap"/.test(r.barZarva),"2b. a váltó a négy filozófiára is megvan — a csempék maguk (1.0.4.15.03)",1);

  /* ---- 2c. a jelzés: a menüsáv jelzi a célt ---- */
  const s2=await p.evaluate(()=>{
    /* új helyzet: két filozófia, egyik sem 20. szintű, a sáv a célt mutatja */
    S.styleExtra=[];S.styleView=1;window.__L={beton:9,bombazok:12};styleLvlCacheClear();
    const h=style2BarHtml();
    const plain=h.replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    return {plain,pick:/id="style2Pick"/.test(h)};});
  ok(!s2.pick&&/A 3\. csapatstílus/.test(s2.plain)&&/20\. szintet/.test(s2.plain)&&/mesterfok|csúcsfok|Csúcsfok/i.test(s2.plain),"2c. a cél látszik a csapatstílus menüben (szint, jutalom, haladás)",s2.plain.slice(0,420));

  /* ---- 2d. MENTÉS KÖRBE ---- */
  const m=await p.evaluate(()=>{
    const o={};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[mk("villam"),mk("panzer")];
    S.styleExtra[0].peak={picks:["villamkontra"]};S.styleExtra[0].traits.villamkontra=5;
    S.styleView=4;
    window.saveGame=window.__saveReal;
    try{saveGameNow();}catch(e){o.mentErr=String(e);}
    let d=null;
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(!/^30-0-save/.test(k))continue;
      try{const j=JSON.parse(localStorage.getItem(k));if(j&&j.S&&Array.isArray(j.S.styleExtra)&&j.S.styleExtra.length){d=j;break;}}catch(e){}}
    o.van=!!d;
    if(!d)return o;
    o.mentett=d.S.styleExtra.map(x=>x.key);
    S.styleExtra=[];S.styleView=1;S.style2=null;
    try{applySavedGame(d);}catch(e){o.betErr=String(e);}
    o.vissza=(S.styleExtra||[]).map(x=>x.key);
    o.nezet=S.styleView;
    o.picks=S.styleExtra[0]&&S.styleExtra[0].peak&&S.styleExtra[0].peak.picks;
    o.szint=S.styleExtra[0]&&S.styleExtra[0].traits.villamkontra;
    o.slots=styleSlots().length;
    window.saveGame=()=>{};
    return o;});
  ok(m.van&&JSON.stringify(m.mentett)===JSON.stringify(["villam","panzer"]),"2d. a mentés viszi az extra filozófiákat",m);
  ok(JSON.stringify(m.vissza)===JSON.stringify(["villam","panzer"])&&m.nezet===4&&m.slots===4,"2e. a betöltés visszaállítja az extrákat és a nézetet",{vissza:m.vissza,nezet:m.nezet,slots:m.slots});
  ok(m.picks&&m.picks[0]==="villamkontra"&&m.szint===5,"2f. a csúcsfok-jelölés és a 4–6. szint is megmarad",{picks:m.picks,szint:m.szint});

  /* ---- 2g. A KÜSZÖB A NEHÉZSÉGGEL (1.0.4.12.00) ---- */
  const n=await p.evaluate(()=>{
    const o={};
    o.tab=[[1,1],[4,5],[5,5],[6,1],[6,5],[7,1],[8,1],[9,1],[10,1],[10,5],[10,9]].map(x=>[x.join("."),styleXNeedFor(x[0],x[1])]);
    /* monoton: soha nem nő a nehézséggel */
    let mono=true,prev=99;
    for(let f=1;f<=10;f++)for(let b=1;b<=5;b++){const v=styleXNeedFor(f,b);if(v>prev+1e-9)mono=false;prev=v;}
    o.mono=mono;
    /* élő: 8.3-as karrier, 18,4-es filozófia → nyit (küszöb 17,4); 17,2 → nem */
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[];S.styleView=1;
    const _nf=styleXNfMost;styleXNfMost=()=>({nf:8,s:3});
    const _el=styleEffLevel;
    styleEffLevel=st=>st.key==="beton"?18.4:5;
    o.need=styleXNeed();o.nyit=styleXCanChoose();
    styleEffLevel=st=>st.key==="beton"?17.2:5;
    o.zar=styleXCanChoose();o.why=styleXGateWhy();
    o.bar=style2BarHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    styleXNfMost=()=>null;o.nincsFok=styleXNeed();
    styleXNfMost=_nf;styleEffLevel=_el;
    o.txt=[styleXNeedTxt(20,true),styleXNeedTxt(18.6,true),styleXNeedTxt(15,false)];
    return o;});
  const tab=Object.fromEntries(n.tab);
  ok(tab["1.1"]===20&&tab["4.5"]===20&&tab["5.5"]===20,"2g. az 5. fokozatig a küszöb a 20. szint",n.tab);
  ok(tab["6.1"]<20&&tab["6.1"]>19.5,"2h. a 6.1-en kezd lejjebb jönni (19,8)",tab["6.1"]);
  ok(tab["10.5"]===15&&tab["10.9"]===15,"2i. a 10.5-ön (és fölötte) a 15. szint",{a:tab["10.5"],b:tab["10.9"]});
  ok(n.mono,"2j. a küszöb a nehézséggel fokozatosan, monoton csökken",1);
  ok(Math.abs(n.need-17.4)<1e-9&&n.nyit===true&&n.zar===false,"2k. 8.3-on 17,4 a küszöb: a 18,4 nyit, a 17,2 nem",{need:n.need,nyit:n.nyit,zar:n.zar});
  ok(/17\. szint 40%-át/.test(n.why)&&/8\.3/.test(n.why),"2l. a szöveg kimondja a küszöböt és a nehézséget",n.why);
  ok(/8\.3 nehézségen/.test(n.bar)&&/10\.5-ön a 15/.test(n.bar),"2m. a menü is jelzi a nehézségfüggő küszöböt",n.bar.slice(0,400));
  ok(n.nincsFok===20,"2n. fokozat nélküli (klasszikus) karrierben a 20. szint",n.nincsFok);
  ok(n.txt[0]==="a 20. szintet"&&n.txt[1]==="a 18. szint 60%-át"&&n.txt[2]==="a 15. szint","2o. a küszöb szövege",n.txt);

  /* ---- 2p. NÉGY FILOZÓFIA, A MECCSERŐ-ÚT, AZ ÚJRAVÁLASZTÁS (1.0.4.15.00) ---- */
  const q=await p.evaluate(()=>{
    const o={};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    const _nf=styleXNfMost;styleXNfMost=()=>null;
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[];S.styleView=1;S.styleXMs=0;
    window.__L={beton:9,bombazok:9};styleLvlCacheClear();
    /* a felső határ: négy */
    S.styleExtra=[mk("villam"),mk("tikitaka")];styleLvlCacheClear();
    o.cap=[styleXCanChoose(),styleXGateWhy()];
    o.capBar=style2BarHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    /* meccserő-út: 250 → 3., 350 → 4. */
    S.styleExtra=[];S.styleXMs=249;styleLvlCacheClear();o.ms249=styleXCanChoose();
    o.bar249=style2BarHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    S.styleXMs=250;o.ms250=styleXCanChoose();
    S.styleExtra=[mk("villam")];styleLvlCacheClear();
    S.styleXMs=300;o.ms300_4=styleXCanChoose();
    S.styleXMs=350;o.ms350_4=styleXCanChoose();
    /* a 3. a szint-úton nyílt 250 előtt: a 4. nem 250-nél, csak 350-nél */
    window.__L={beton:20,bombazok:9,villam:5};styleLvlCacheClear();
    S.styleXMs=260;o.lvl260=styleXCanChoose();
    S.styleXMs=350;o.lvl350=styleXCanChoose();
    /* a csúcs számít: a meccserő mérése nem csökkenti */
    S.styleXMs=300;const _tms=teamMatchStrength;teamMatchStrength=()=>120;styleXMsNote();o.csucs=S.styleXMs;teamMatchStrength=_tms;
    /* újraválasztás */
    S.styleExtra=[];window.__L={beton:9,bombazok:9};styleLvlCacheClear();
    o.reselZar=styleReselWhy();
    o.reselBar0=style2BarHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    window.__L={beton:10,bombazok:4};styleLvlCacheClear();
    o.reselNyit=styleReselWhy();
    /* a bombázók fájába 2 + 1 szint, a pontgyűjtőből 120 elköltve */
    const t0=styleTraitList("bombazok")[0],t1=styleTraitList("bombazok")[1];
    S.style2.traits={[t0.key]:2,[t1.key]:1};S.style2.eng={pts:5,earned:200,spent:120,lvl:3};
    const kolt=t0.lv[0].price+t0.lv[1].price+t1.lv[0].price;
    msState().sp=100;
    S.styleView=2;
    o.reselBar=style2BarHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    o.dupla=styleReselect(2,"beton",null);
    const r=styleReselect(2,"villam",null);
    o.r=r;o.sp=msState().sp;o.vart=100+Math.round(kolt*0.33);
    o.uj=S.style2&&S.style2.key;o.ujEng=S.style2&&S.style2.eng;o.ujTraits=JSON.stringify(S.style2.traits);
    o.nezet=styleViewIdx();
    styleXNfMost=_nf;
    return o;});
  ok(q.cap[0]===false&&/felső határ/.test(q.cap[1])&&/Mind a 4 filozófia-hely betelt/.test(q.capBar),"2p. legfeljebb négy filozófia — a sáv kimondja",{why:q.cap[1],bar:q.capBar.slice(0,160)});
  ok(q.ms249===false&&q.ms250===true,"2q. 250-es meccserőnél megnyílik a 3. filozófia",{a:q.ms249,b:q.ms250});
  ok(/meccserő eléri a 250-et/.test(q.bar249)&&/249/.test(q.bar249),"2r. a sáv a meccserő-utat is mutatja (haladással)",q.bar249.slice(0,500));
  ok(q.ms300_4===false&&q.ms350_4===true,"2s. a 4. a meccserő-úton 350-nél nyílik",{a:q.ms300_4,b:q.ms350_4});
  ok(q.lvl260===false&&q.lvl350===true,"2t. ha a 3. a szint-úton nyílt, a 4. nem 250-nél, csak 350-nél",{a:q.lvl260,b:q.lvl350});
  ok(q.csucs===300,"2u. a meccserő csúcsa számít (gyengébb mérés nem veszi vissza)",q.csucs);
  ok(/10\. szintet/.test(q.reselZar)&&q.reselNyit===""&&/újraválasztás/i.test(q.reselBar0),"2v. az újraválasztás a 10. szinttől nyílik — a sáv kiírja a feltételt",{z:q.reselZar,n:q.reselNyit});
  ok(/újraválasztása/.test(q.reselBar)&&/33% visszatérítés/.test(q.reselBar),"2w. a nézett filozófia újraválasztása gombbal, a visszatérítés becslésével",q.reselBar.slice(0,400));
  ok(q.dupla.ok===false&&q.r.ok===true&&q.uj==="villam"&&q.sp===q.vart&&q.ujEng&&Math.abs(q.ujEng.pts-39.6)<0.05&&q.ujTraits==="{}"&&q.nezet===2,
    "2x. a csere: a fára költött pont és a pontgyűjtőből elköltött pont 33%-a vissza, az új tiszta lappal indul",{sp:q.sp,vart:q.vart,eng:q.ujEng,uj:q.uj});

  const qq=await p.evaluate(()=>{
    const o={};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[];S.styleView=2;
    window.__L={beton:12,bombazok:5};styleLvlCacheClear();
    hubStyleSetOpen(true);renderStylePanel();
    const b=$("styleReselBtn");o.gomb=!!b;if(!b)return o;
    b.click();
    const body=$("hubStyleBody");
    o.valaszto=/Újraválasztás — /.test(body.textContent);
    o.zarva=!!body.querySelector('[data-style2="beton"][disabled]');
    const v=body.querySelector('[data-style2="villam"]');o.vGomb=v&&v.textContent;
    v.click();
    o.kerdes=/Lecseréled a filozófiát/.test(($("hubTacticConfirmTitle")||{}).textContent||"");
    $("hubTacticConfirmYes").click();
    o.uj=S.style2&&S.style2.key;o.elso=S.style&&S.style.key;
    return o;});
  ok(qq.gomb&&qq.valaszto&&qq.zarva&&qq.vGomb==="Erre cserélem"&&qq.kerdes&&qq.uj==="villam"&&qq.elso==="beton",
    "2y. a felületen: gomb → választó (a meglévő filozófiák zárva) → megerősítő → a nézett hely cserélődik",qq);

  /* ---- 2z. A CSEMPE MAGA A VÁLTÓ (1.0.4.15.03) ---- */
  const tz=await p.evaluate(()=>{
    const o={};
    const mk=k=>({key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style=mk("beton");S.style2=mk("bombazok");S.styleExtra=[mk("villam")];S.styleView=3;
    styleLvlCacheClear();hubStyleSetOpen(true);renderStylePanel();
    const body=$("hubStyleBody");
    o.zoldGomb=!!$("style2Swap");
    o.csempek=body.querySelectorAll("[data-styleview]").length;
    body.querySelector('[data-styleview="1"]').click();
    o.utan1=styleViewIdx();
    $("hubStyleBody").querySelector('[data-styleview="1"]').click();   /* a nézett csempe: nem csinál semmit */
    o.ujra1=styleViewIdx();
    $("hubStyleBody").querySelector('[data-styleview="2"]').click();
    o.utan2=styleViewIdx();
    o.jelolt=$("hubStyleBody").querySelector('[data-styleview="2"]').getAttribute("aria-pressed");
    return o;});
  ok(!tz.zoldGomb&&tz.csempek===3&&tz.utan1===1&&tz.ujra1===1&&tz.utan2===2&&tz.jelolt==="true",
    "2z. nincs külön váltógomb — a filozófia-csempére kattintva vált, a nézett csempe jelölt",tz);

  /* ---- 3. CSÚCSFOK ---- */
  const c=await p.evaluate(()=>{
    const o={};
    window.__L={beton:6,bombazok:6};styleLvlCacheClear();
    const per={};let hiany=[];
    Object.keys(STYLE_PEAK_DEFS).forEach(sk=>{
      per[sk]=0;
      Object.keys(STYLE_PEAK_DEFS[sk]).forEach(tk=>{
        const t=styleTraitList(sk).find(x=>x.key===tk);
        if(!t||!t.peak||t.peak.length!==3){hiany.push(sk+":"+tk);return;}
        per[sk]++;});});
    o.per=per;o.hiany=hiany;
    o.ar=styleTraitList("beton").filter(t=>t.peak).map(t=>({k:t.key,l3:t.lv[2].price,p:t.peak.map(x=>x.price)}));
    /* a stílus SZINTJE (nyers SXP) nem mozdul a csúcsfoktól */
    const st=S.style;
    st.traits={};styleTraitList("beton").forEach(t=>{st.traits[t.key]=t.lv.length;});
    styleLvlCacheClear();
    const sx0=styleSxp(st);
    /* jelölés 20. szint nélkül */
    o.jelolKorai=(()=>{S.styleView=1;return styleMasterPick("zart_kapu");})();
    window.__L.beton=20;styleLvlCacheClear();
    o.jelol1=styleMasterPick("zart_kapu");
    o.jelolUjra=styleMasterPick("zart_kapu");
    o.nemJelolheto=styleMasterPick("tizenegyedik");          /* nincs csúcsfoka */
    o.jelol2=styleMasterPick("vashideg");
    o.jelol3=styleMasterPick("edzett_szemek");
    o.jelol4=styleMasterPick("olcso_vedo");                   /* a negyedik már nem */
    o.picks=st.peak.picks.slice();
    /* vásárlás: pont nélkül nem, pontokkal igen */
    msState().sp=0;
    o.vasarNincs=styleBuyTrait("zart_kapu");
    msState().sp=5000;
    const t=styleTraitByKey("zart_kapu",st);
    o.ar4=styleTraitNextPrice(t,st);
    const fx0=styleOppGoalMult();
    o.v4=styleBuyTrait("zart_kapu");o.fx4=styleOppGoalMult();
    o.v5=styleBuyTrait("zart_kapu");o.fx5=styleOppGoalMult();
    o.v6=styleBuyTrait("zart_kapu");o.fx6=styleOppGoalMult();
    o.v7=styleBuyTrait("zart_kapu");
    o.lv=styleTraitLevelIn(st,"zart_kapu");
    o.fx0=fx0;
    o.spentRest=msState().sp;
    /* nem jelölt képesség 3/3-nál megáll */
    o.nemJelolt=styleBuyTrait("olcso_vedo");
    o.sxpEgyenlo=(styleSxp(st)===sx0);
    /* a kártya kirajzolja a pontokat és a jelölést */
    o.html=styleTraitsHtml(true).replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    return o;});
  ok(c.hiany.length===0,"3a. a csúcsfok-tábla minden bejegyzése létező képességre mutat, három lépcsővel",c.hiany);
  ok(Object.keys(c.per).every(k=>c.per[k]>=3),"3b. minden stílusban legalább három képesség jelölhető",c.per);
  ok(c.ar.length>0&&c.ar.every(x=>x.p[0]>=2.5*x.l3&&x.p[0]<x.p[1]&&x.p[1]<x.p[2]),"3c. a csúcsfok-lépcsők a 3. szint árának ≥2,5-szeresei és emelkednek",c.ar.slice(0,3));
  ok(c.jelolKorai.ok===false,"3d. 20. szint nélkül nem jelölhető",c.jelolKorai);
  ok(c.jelol1.ok&&c.jelolUjra.ok===false,"3e. a 20. szinten jelölhető, ugyanaz kétszer nem",{a:c.jelol1,b:c.jelolUjra});
  ok(c.nemJelolheto.ok===false,"3f. a motor-táblába kötött képesség nem jelölhető",c.nemJelolheto);
  ok(c.jelol2.ok&&c.jelol3.ok&&c.jelol4.ok===false&&c.picks.length===3,"3g. legfeljebb három jelölés",c.picks);
  ok(c.vasarNincs.ok===false,"3h. pont nélkül a csúcsfok-szint nem vehető meg",c.vasarNincs);
  ok(c.ar4>=3*c.ar[0].l3||c.ar4>=100,"3i. a csúcsfok ára jóval a régi fölött áll",c.ar4);
  ok(c.v4.ok&&c.v5.ok&&c.v6.ok&&c.v7.ok===false&&c.lv===6,"3j. három további szint vehető meg, a hatodikon megáll",{lv:c.lv,v7:c.v7});
  ok(c.fx4<c.fx0&&c.fx5<c.fx4&&c.fx6<c.fx5,"3k. a csúcsfok-szintek hatása tényleg nő",{fx0:c.fx0,fx4:c.fx4,fx5:c.fx5,fx6:c.fx6});
  ok(c.nemJelolt.ok===false,"3l. a nem jelölt képesség 3/3-on megáll",c.nemJelolt);
  ok(c.sxpEgyenlo,"3m. a csúcsfok a stílus szintjét (SXP) nem mozdítja",1);
  ok(/Csúcsfok/.test(c.html)&&/6\/6/.test(c.html),"3n. a kártyák kiírják a csúcsfokot és a 6/6 szintet",c.html.slice(0,200));

  /* ---- 4. A PONTGYŰJTŐ 11–20. SZINTJE ---- */
  const e=await p.evaluate(()=>{
    const o={};
    o.max=[ENG_MAX,RETTEGES_MAX];
    o.need=[engNeedLevel(10),engNeedLevel(11),engNeedLevel(20),rettegesNeedLevel(11)];
    o.lepcso=[];for(let n=1;n<=20;n++)o.lepcso.push(engNeedLevel(n));
    o.pct=[ENG_PCT[10],ENG_PCT[11],ENG_PCT[20],RETTEGES_PCT[10],RETTEGES_PCT[20]];
    o.ar=[ENG_PRICE[10],ENG_PRICE[11],ENG_PRICE[20]];
    o.arany=Math.round(ENG_PCT[20]/RETTEGES_PCT[20]*100)/100;
    /* a Bombázók motorja: 10. szinten állunk, 12-es stílusszinttel (1.0.6.0.02: a 11. szinthez 13-as kell) */
    S.style=({key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null});
    S.style2=null;S.styleExtra=[];S.styleView=1;
    window.__L={bombazok:12};styleLvlCacheClear();
    const E=engState("bombazok");
    o.van=!!E;
    if(!E)return o;
    E.lvl=10;E.pts=100000;
    o.why19=engNextWhy("bombazok");
    window.__L.bombazok=13;styleLvlCacheClear();o.why13=engNextWhy("bombazok");
    window.__L.bombazok=20;styleLvlCacheClear();
    const cap10=engOvrCapK("bombazok");   /* 20. stílusszint, 10. szint */
    o.why20=engNextWhy("bombazok");
    o.buy=engBuyLevel("bombazok");o.lvl11=engLvl("bombazok");
    o.spent=Math.round((100000-E.pts)*10)/10;
    for(let i=0;i<9;i++)engBuyLevel("bombazok");
    o.lvl20=engLvl("bombazok");
    o.tovabb=engBuyLevel("bombazok");o.lvlMax=engLvl("bombazok");
    const cap20=engOvrCapK("bombazok");
    o.capArany=Math.round(cap20/cap10*100)/100;
    o.tetején=engNextWhy("bombazok");
    return o;});
  ok(e.max[0]===20&&e.max[1]===20,"4a. a létra 20 szintes",e.max);
  /* 🪜 1.0.6.0.02 — a 11–20. szint egyenletesen a 13.–20. stílusszint között (törés nélkül) */
  ok(e.need[0]===12&&e.need[1]===13&&e.need[2]===20&&e.need[3]===13,"4b. az 1–10. szint a régi kapuval (2+n), a 11–20. egyenletesen 13-tól 20-ig",e.need);
  {const L=e.lepcso||[];let mon=true,ugras=0;for(let i=1;i<L.length;i++){if(L[i]<L[i-1])mon=false;ugras=Math.max(ugras,L[i]-L[i-1]);}
   ok(mon&&ugras<=1&&L[19]===20&&JSON.stringify(L.slice(10))==="[13,14,14,15,16,17,18,18,19,20]","4c. a teljes lépcső monoton, sehol nincs egynél nagyobb ugrás",L);}
  ok(e.pct[0]===0.09&&e.pct[1]>e.pct[0]&&e.pct[2]>e.pct[1]&&e.pct[4]>e.pct[3],"4c. a hozam a 11–20. szinten tovább nő (a régi 1–10. változatlan)",e.pct);
  ok(e.ar[0]===580&&e.ar[1]>e.ar[0]&&e.ar[2]>e.ar[1],"4d. az ár a 10. után tovább drágul (580 → ...)",e.ar);
  ok(Math.abs(e.arany-0.6)<0.01,"4e. a nem-Panzer létra továbbra is a Panzer 0,6-szerese",e.arany);
  ok(e.van&&/13\. csapatstílus-szint/.test(e.why19)&&e.why13==="","4f. 12-es stílusszinten a 11. szint zárva (a szöveg megmondja: 13. kell), 13-ason nyitva",{z:e.why19,ny:e.why13});
  ok(e.why20===""&&e.buy&&e.lvl11===11,"4g. 20. stílusszinten a 11. szint megvehető",{why:e.why20,lvl:e.lvl11});
  ok(e.lvl20===20&&e.tovabb===false&&e.lvlMax===20,"4h. a létra a 20. szinten megáll",{lvl20:e.lvl20,tovabb:e.tovabb});
  ok(Math.abs(e.capArany-1.5)<0.02,"4i. a meccserő-plafon a 20. szinten ×1,5 (a 10. szinthez képest)",e.capArany);

  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
