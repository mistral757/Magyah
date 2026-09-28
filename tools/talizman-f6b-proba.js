/* 🧿 TALIZMÁNOK F6b — A SPECIALOK: IGAZOLÁS, FEJLŐDÉS, STÁB (3.9.154).

   KIMONDOTT KÉRÉS: „F6b mehet!"

   Amit mér:
     0. TALIZMÁN NÉLKÜL minden új olvasó a semleges értéket adja;
     1–3. a 24 special mindegyikére egy PRO és egy KONTRA állítás, a valódi
        függvényeken (licit-kúp, képesség-keresés, szezonkeret, vételár-
        kedvezmény, kikiáltási ár, kirakat-várakozás, illeszkedés, token,
        stíluspont, visszavásárlás, bomba-ajánlat, fejlődés, kor-lépés,
        edzés, sérülés, begyakorlás, szezonváltás, stábhely, stábár,
        edzővé válás, kiöregedés, fókusz, stábminőség, jutalom-sor);
     4. a három kategória mind a 24 speciálja él;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9193;
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
  await p.waitForFunction(()=>typeof talSpecV==="function",null,{timeout:15000});

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
    phase="season";S.seasonNumber=3;S.idx=5;S.W=0;S.D=0;S.L=0;S.tal=null;
    S.transferBudget=5e9;S.morale=60;
    if(!scout)scout=generateScout();   /* a felderítés a scout csillagaiból számol */
    if(!S.tactics)S.tactics={active:null,levels:{}};
    if(!S.tactics.active||!TACTICS[S.tactics.active]){S.tactics.active="kontra";S.tactics.levels.kontra=80;}
    addLine=()=>{};saveGame=()=>{};
    /* a heti lelátó a pénzes kontrákhoz: fix szám, hogy a mérés pontos legyen */
    fanWeeklyIncome=()=>1000000;
    /* Egy talizmán a megadott speciállal. A változat szándékosan NEM létező:
       így az alaphatása nem keveredik a mérésbe, csak a special hat. */
    window._lap=(id,rang)=>{
      S.tal=null;const T=talState();
      const sp=TAL_SPEC_BY[id];
      T.lapok=[{kat:sp.k,rang:rang||sp.min,dobas:0.5,spec:id,valt:"_nincs",uid:1}];
      T.seq=1;_talAlapMemo=null;_talSpecMemo=null;return T.lapok[0];};
    window._nincs=()=>{S.tal=null;_talAlapMemo=null;_talSpecMemo=null;};});


  /* ---- 0. SEMLEGES ---- */
  const n0=await p.evaluate(()=>{
    _nincs();
    return {jel:talMoralJelCel(),alk:talAlkuszExtra(3),halo:talHaloExtra(),keret:talSzezonkeretMult(),
      zsak:talZsakSzabad(),huseg:talHusegMult(slots[0].player.n),villam:talVillamVar(),spk:talSpKontraMult(),
      elad:talEladasMult(),vissza:talVisszaLista().length,bomba:talBombaAjanlat(),fejl:talFejlSzorzo(19,"x"),
      kesoi:talKesoiMult(33),akad:talAkadMinusz(),fo:talFoEdzMult(),edz:talEdzHatMult(),inj:talSpecInjMult(),
      tanul:talSpecTanulMult(50),korAr:talKorArMult(20)*talKorArMult(33),hely:talBovitettHely(),kiad:talStabKiadasMult(),
      kor:talEdzoKor()===COACH_MIN_AGE&&talEdzoPerc()===COACH_MIN_MINUTES,stabKor:talStabKorPlusz(),
      scout:talScoutArMult(),fok:talFokuszPlusz(),leg:talLegendaSz(50)};});
  console.log("\n— 0. TALIZMÁN NÉLKÜL: SEMLEGES —");
  ok(n0.jel===0&&n0.alk===0&&n0.halo===0&&n0.keret===1&&!n0.zsak&&n0.huseg===1&&n0.villam===null&&n0.spk===1
    &&n0.elad===1&&n0.vissza===0&&n0.bomba===null&&n0.fejl===1&&n0.kesoi===1&&n0.akad===0&&n0.fo===1&&n0.edz===1
    &&n0.inj===1&&n0.tanul===1&&n0.korAr===1&&n0.hely===0&&n0.kiad===1&&n0.kor&&n0.stabKor===0&&n0.scout===1
    &&n0.fok===0&&n0.leg===50,"minden F6b-olvasó semleges talizmán nélkül",n0);

  /* ---- 1. IGAZOLÁS ---- */
  const ig=await p.evaluate(()=>{
    const ki={};
    const nev=slots[2].player.n,e=careerPool[nev];
    /* alkusz */
    _lap("alkusz",1);
    ki.alk=talAlkuszExtra(2);ki.alkV=AGENCY_REJECT_MODE_STEP*2*0.5;
    S.morale=60;talAlkuszElutasit(nev);ki.alkMor=S.morale;
    /* halo */
    const h0=(()=>{_nincs();return twAttrSearchesForScout();})();
    const k0=computeSeasonBudget();
    _lap("halo",2);
    ki.halo={att:twAttrSearchesForScout()-h0,keret:computeSeasonBudget()/k0};
    /* zsákbamacska: vételár-kedvezmény, szabad-e az ablakban, a vétel elhasználja */
    _lap("zsakbamacska",2);
    const c={n:"Zsák Próba",pos:["KV"],age:25,pot:2000,_talZsak:true};
    ki.zsakDisc=buyDiscountParts(c).filter(x=>x.k==="talZsak").map(x=>x.pct)[0];
    ki.zsakSzabad=talZsakSzabad();
    talSpAll().zsakKey=talAblakKulcs();ki.zsakUtan=talZsakSzabad();
    ki.akadMin=talAkadMinusz();
    /* hűség: 3+ idény → +10%; új igazolás: morál-jel */
    _lap("huseg",1);
    e._klubSz=(S.seasonNumber||1)-3;ki.husegPro=talHusegMult(nev);
    e._klubSz=S.seasonNumber||1;ki.husegUj=talHusegMult(nev);
    S.careerStats=S.careerStats||{};S.careerStats[nev]=S.careerStats[nev]||{matches:0};
    e._arrM=S.careerStats[nev].matches;
    ki.husegJel=talMoralJel(slots[2].player);ki.jelCel=talMoralJelCel();
    delete e._arrM;
    /* villámzár */
    _lap("villamzar",3);
    const w=[];for(let i=0;i<40;i++)w.push(talVillamVar());
    ki.villam=[Math.min(...w),Math.max(...w)];
    const f0=talFitSpecPP();talSpAll().villamHatra=3;ki.villamFit=f0-talFitSpecPP();
    talF6bMeccsUtan();talF6bMeccsUtan();talF6bMeccsUtan();ki.villamLe=talSpAll().villamHatra;
    /* ingyen ember: token idényenként, nem halmozódik; stíluspont −10% */
    _lap("ingyenember",4);
    S.freePlayerTokens=0;
    ki.ing1=talIngyenAd(3);ki.tok1=S.freePlayerTokens;
    ki.ing2=talIngyenAd(4);ki.tok2=S.freePlayerTokens;   /* a tavalyi megvan → nem jön új */
    S.freePlayerTokens=0;ki.ing3=talIngyenAd(5);ki.tok3=S.freePlayerTokens;
    ki.sp=talSpSzorzo(false);
    S.freePlayerTokens=0;
    /* visszavásárlás: az eladás −5%, a lista 80%-on */
    _nincs();
    const sp=careerPlayerFromPoolEntry(careerPool[slots[3].player.n]);
    const ask0=saleAskPrice(sp);
    _lap("visszavasarlas",2);
    ki.elad=saleAskPrice(sp)/ask0;
    const sold=Object.values(careerPool).find(x=>!drafted.has(x.n)&&x.pos&&x.pos.length);
    S.transferLog={sells:[{n:sold.n,credit:10000,season:S.seasonNumber||1}]};
    const L=talVisszaLista();ki.vissza=L.length?L[0]:null;
    ki.visszaGomb=(()=>{talMenuRender();return /data-tal="vissza:/.test($("talHatas").innerHTML)||/Visszavásárlás/.test($("talHatas").innerHTML);})();
    S.transferLog={sells:[]};
    /* utolsó perces bomba: az ajánlat −30%, és elfogadva morált visz */
    _lap("utolsopercesbomba",4);
    let bomba=null;
    for(let i=0;i<30&&!bomba;i++){S.twWindow={round:8+i,label:"x"};bomba=talBombaAblakZar();}
    S.twWindow=null;
    ki.bomba=!!bomba;
    const O=talBombaAjanlat();
    if(O){ki.bombaAr=O.ar/buyPrice(O.e);
      S.transferBudget=1e12;S.morale=60;
      const n=fullCareerRoster().length;const cap=MAX_CAREER_ROSTER;MAX_CAREER_ROSTER=n+5;
      const r=talBombaElfogad();ki.bombaOk=r.ok&&drafted.has(O.n)&&extraRoster.some(x=>x.n===O.n);
      ki.bombaMor=S.morale;MAX_CAREER_ROSTER=cap;ki.bombaUtan=talBombaAjanlat();}
    return ki;});
  console.log("\n— 1. IGAZOLÁS —");
  ok(kozel(ig.alk,ig.alkV,1e-9)&&ig.alkMor===58,"Keményfejű alkusz: a kúp +50%-kal gyorsabban tolódik · elutasításkor −2 morál",{a:ig.alk,m:ig.alkMor});
  ok(ig.halo.att===1&&kozel(ig.halo.keret,0.97,0.002),"Kapcsolati háló: +1 képesség-keresés · a szezonkeret −3%",ig.halo);
  ok(kozel(ig.zsakDisc,0.40,1e-9)&&ig.zsakSzabad&&!ig.zsakUtan&&ig.akadMin===1,"Zsákbamacska: −40% a vak vételen, ablakonként egy · az akadémia −1 ajánlat",ig);
  ok(kozel(ig.husegPro,1.10,1e-9)&&ig.husegUj===1&&ig.husegJel===-1&&ig.jelCel<0,"Hűségprémium: 3+ idény után +10% kikiáltási ár · az új igazolás −1 morál-jel (a csapatmorál célja is)",ig);
  ok(ig.villam[0]>=3&&ig.villam[1]<=8&&ig.villamFit===1&&ig.villamLe===0,"Villámzár: első ajánlat 3–8 forduló · eladás után 3 meccsig −1 pp illeszkedés",{w:ig.villam,f:ig.villamFit,le:ig.villamLe});
  ok(ig.ing1&&ig.tok1===1&&!ig.ing2&&ig.tok2===1&&ig.ing3&&ig.tok3===1&&kozel(ig.sp,0.9,1e-9),"Ingyen ember: idényenként egy token, nem halmozódik · stíluspont −10%",ig);
  ok(kozel(ig.elad,0.95,0.01)&&ig.vissza&&ig.vissza.ar===8000&&ig.visszaGomb,"Visszavásárlási záradék: eladás −5% · az eladott ember 80%-on visszavehető, a menüben",{e:ig.elad,v:ig.vissza});
  ok(ig.bomba&&kozel(ig.bombaAr,0.70,0.02)&&ig.bombaOk&&ig.bombaMor===57&&!ig.bombaUtan,"Utolsó perces bomba: ablakzáráskor ajánlat −30%-kal, aláírható · −3 morál",ig);

  /* ---- 2. FEJLŐDÉS ---- */
  const fj=await p.evaluate(()=>{
    const ki={};
    _lap("titanok",1);
    ki.titanPro=[talKorDev(19,"x"),talKorDev(22,"x")];
    const oreg={n:"Öreg Próba",age:32};careerPool[oreg.n]={n:oreg.n,age:32,pos:["KV"],startRating:80,pot:1500};
    ki.titanJel=talMoralJel(oreg);
    _lap("kesoi",2);
    /* tíz idény öregedés 31 évesen indulva: a töredék gyűlik, a hanyatlás összesen kisebb */
    const ev=(vele)=>{const e={n:"Késői",age:31,peak:90,basePeak:90,startRating:90,youthBonus:0};
      if(vele)_lap("kesoi",2);else _nincs();
      for(let i=0;i<10;i++)careerAgeStepCore(e,false);return 90-e.startRating;};
    const nel=ev(false),vel=ev(true);
    ki.kesoi={nelkul:nel,vele:vel,arany:vel/nel};_lap("kesoi",2);ki.kesoiAkad=talAkadMinusz();
    _lap("specialista",1);ki.spec=[talFoEdzMult(),talSpecTanulMult(80)];
    _lap("kemeny",2);ki.kem=[talEdzHatMult(),talSpecInjMult()];
    _lap("vatta",3);ki.vatta=[talSpecInjMult(),(()=>{const a=talFitSpecPP();_nincs();return talFitSpecPP()-a;})()];
    /* csodagyerek: a legfiatalabb kezdő POT-ja +10% a szezonváltáskor */
    _lap("csodagyerek",4);
    const xi=slots.map(s=>careerPool[s.player.n]);
    xi.forEach((x,i)=>{x.age=24+i;});xi[4].age=18;
    const pot0=xi[4].pot;talF6bSzezonvaltas();
    ki.csoda=xi[4].pot/pot0;ki.csodaAr=[talKorArMult(20),talKorArMult(25)];
    /* második tavasz: 30 feletti +3; a stáb Sz −1 */
    _lap("masodiktavasz",4);
    xi[6].age=33;xi[6].startRating=95;const r0=xi[6].startRating;
    S.staff=[{n:"Stáb Próba",type:"morale",sz:50,szBase:50,age:40,xp:0,focus:{mode:"team"}}];
    talSpAll().tavasz=null;talF6bSzezonvaltas();
    ki.tavasz=xi[6].startRating-r0;ki.tavaszSz=S.staff[0].sz;
    /* versenyszellem: posztonként a két legjobb, 5-ön belül */
    _lap("versenyszellem",2);
    const a=xi[1],b2=xi[2];a.pos=["KV"];b2.pos=["KV"];a.startRating=85;b2.startRating=83;
    xi.forEach((x,i)=>{if(i!==1&&i!==2)x.pos=["P"+i];});
    /* 3.9.158: a TELJES keret posztja egyedi — a kispadon ülő, véletlenül szintén
       KV-s és erősebb játékos különben „ellopta" a rivális-párt (véletlen bukás) */
    fullCareerRoster().forEach((p,i)=>{const e=careerPool[p.n];if(e&&e!==a&&e!==b2)e.pos=["X"+i];});
    _talRivMemo=null;
    ki.riv=[talRivalis(a.n),talRivalis(b2.n),talKorDev(26,a.n)];
    S.staff=[];
    return ki;});
  console.log("\n— 2. FEJLŐDÉS —");
  ok(kozel(fj.titanPro[0],1.10,1e-9)&&fj.titanPro[1]===1&&fj.titanJel===-1,"Ifjú titánok: 21 alatt +10% fejlődés · a 30 felettiek −1 morál-jel",fj);
  ok(fj.kesoi.vele<fj.kesoi.nelkul&&fj.kesoi.arany<=0.9&&fj.kesoi.arany>=0.7&&fj.kesoiAkad===1,"Késői virágzás: tíz idény alatt érezhetően kisebb hanyatlás (a töredék gyűlik) 28 fölött · az akadémia −1 ajánlat",fj.kesoi);
  ok(kozel(fj.spec[0],1.15,1e-9)&&kozel(fj.spec[1],0.94,1e-9),"Specialista: fő edzés +15% · begyakorlás −6%",fj.spec);
  ok(kozel(fj.kem[0],1.20,1e-9)&&kozel(fj.kem[1],1.10,1e-9),"Kemény edzés: edzés +20% · sérülés +10%",fj.kem);
  ok(fj.vatta[0]<1&&fj.vatta[1]>0,"Vattába csomagolva: sérülés −% · illeszkedés −pp",fj.vatta);
  ok(kozel(fj.csoda,1.10,0.002)&&kozel(fj.csodaAr[0],1.10,1e-9)&&fj.csodaAr[1]===1,"Csodagyerek: a legfiatalabb kezdő POT-ja +10% · a 23 alattiak vételára +10%",fj);
  ok(fj.tavasz===3&&fj.tavaszSz===49,"Második tavasz: egy 30 feletti +3 Rating · a stáb Szakértelme −1",fj);
  ok(fj.riv[0]&&fj.riv[1]&&kozel(fj.riv[2],1.12,1e-9),"Versenyszellem: a két rivális fejlődése +12%",fj.riv);

  /* ---- 3. STÁB ---- */
  const st=await p.evaluate(()=>{
    const ki={};
    S.coachSlots=COACH_SLOTS_MAX;
    _nincs();const s0=coachSlots(),p0=staffPrice(50);
    _lap("bovitett",3);ki.bov=[coachSlots()-s0,coachSlotsMax(),staffPrice(50)/p0];
    S.coachSlots=null;
    _lap("mentor",2);ki.mentor=[talEdzoKor(),talEdzoPerc(),talKorArMult(33)];
    _nincs();const sc0=scoutUpgradePriceNow(),rf0=coachRetireFrom();
    _lap("lojalis",1);ki.loj=[coachRetireFrom()-rf0,scoutUpgradePriceNow()/sc0];
    const c={n:"Stáb A",type:"morale",sz:50,szBase:50,age:40,xp:0,focus:{mode:"team"}};
    _lap("tapasztalat",2);
    talEdzoValtas();ki.tapTanul=talSpecTanulMult(80);
    ki.fokusz=(()=>{_lap("fokusz",1);return coachFocusMaxPlayers({type:"morale"});})();
    S.staff=[{n:"Stáb F",type:"morale",sz:50,focus:{mode:"players",names:[slots[0].player.n]}}];
    ki.fokJel=[talMoralJel(slots[0].player),talMoralJel(slots[1].player)];
    S.staff=[];
    _lap("legenda",4);ki.leg=[talLegendaSz(50),talLegendaSz(90)];
    ki.legQ=(()=>{const q1=coachQual(c);_nincs();return q1/coachQual(c);})();
    /* a nagy öreg: a legidősebb stábtag képessége a jutalom-sorba */
    _lap("nagyoreg",3);
    S.pendingRewardSkills=[];
    S.staff=[{n:"Nagy Öreg",type:"morale",sz:60,age:61,fp:{skillsEver:[SKILLS[0].id]}},{n:"Fiatal",type:"chem",sz:40,age:35,fp:{skillsEver:[]}}];
    talSpAll().nagyoreg=null;talF6bSzezonvaltas();
    ki.nagy=(S.pendingRewardSkills||[]).map(x=>x.skillId+"|"+x.from);ki.nagyTanul=[talSpecTanulMult(60),talSpecTanulMult(80)];
    /* konferencia: +3 Sz egy stábtagnak, és a heti lelátó 60%-a */
    _lap("konferencia",2);
    S.staff=[{n:"Konf",type:"morale",sz:50,szBase:50,age:45}];
    const b0=S.transferBudget;talSpAll().konf=null;talF6bSzezonvaltas();
    ki.konf=[S.staff[0].sz,b0-S.transferBudget];
    S.staff=[];S.pendingRewardSkills=[];
    return ki;});
  console.log("\n— 3. STÁB —");
  ok(st.bov[0]===1&&st.bov[1]===7&&kozel(st.bov[2],1.12,0.01),"Bővített stáb: +1 hely (a plafon is) · stáb-kiadás +12%",st.bov);
  ok(st.mentor[0]===30&&st.mentor[1]===1400&&kozel(st.mentor[2],1.05,1e-9),"Mentorlánc: edző 30 évesen, 1400 perc után · a 30 felettiek vételára +5%",st.mentor);
  ok(st.loj[0]===3&&kozel(st.loj[1],1.10,0.02),"Lojális stáb: 3 évvel később öregszik ki · scout-fejlesztés +10%",st.loj);
  ok(kozel(st.tapTanul,0.90,1e-9),"Tapasztalatcsere: edzőváltás után −10% begyakorlás",st.tapTanul);
  ok(st.fokusz===3&&st.fokJel[0]===0&&st.fokJel[1]<0,"Fókuszcsoport: a fókusz 2 → 3 · a fókuszon kívüliek morál-jele negatív",{f:st.fokusz,j:st.fokJel});
  ok(st.leg[0]===61&&st.leg[1]===90&&st.legQ>1,"Pályaedző-legenda: egy fokozattal feljebb a hatásban (a csúcson nincs feljebb)",st);
  ok(st.nagy.length===1&&/\|Nagy Öreg$/.test(st.nagy[0])&&st.nagyTanul[0]===0.9&&st.nagyTanul[1]===1,"A nagy öreg: a legidősebb stábtag képessége a kiosztási sorba · új taktika −10%",st);
  ok(st.konf[0]===53&&st.konf[1]===600000,"Nemzetközi konferencia: +3 Sz · a heti lelátó 60%-a",st.konf);

  /* ---- 4. MIND A 24 ÉL ---- */
  const ui=await p.evaluate(()=>{
    const lista=TAL_SPEC.filter(s=>["igazolas","fejlodes","stab"].indexOf(s.k)>=0);
    return {db:lista.length,mind:lista.every(s=>talSpecMukodik(s.id))};});
  console.log("\n— 4. A KATALÓGUS —");
  ok(ui.db===24&&ui.mind,"az Igazolás, a Fejlődés és a Stáb mind a 24 speciálja él",ui);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
