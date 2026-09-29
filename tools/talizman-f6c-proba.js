/* 🧿 TALIZMÁNOK F6c — A SPECIALOK: JOKER, MORÁL, BANK (3.9.156).

   KIMONDOTT KÉRÉS: „Csináljuk itt lokálba." (az F6c a hátralévő lista első
   tétele)

   Amit mér:
     0. TALIZMÁN NÉLKÜL minden új olvasó a semleges értéket adja, és a
        pillanatképben nincs új mező;
     1–3. a 25 special mindegyikére egy PRO és egy KONTRA állítás, a valódi
        függvényeken (eseménypakli, ütemező, generátor, kínálat, húzás-díj,
        ritka-esemény szorzó, érme, tükör, morál-cél, visszahúzás, padló,
        stábhely, összhang, eladási ár, bér, szurkolónövekedés, befektetés,
        idényzárás, könyvelés);
     4. A PÁRHARC: a három új pillanatkép-mező (talSpOwn, talFav, talHome) a
        valódi h2hWireSnapshot-ban utazik, a h2hSimulate ugyanabból a magból
        BITRE ugyanazt adja, és a λ pontosan a szorzóval tolódik;
     5. a felület: a négy lapos húzás-ablak, az érme és a tükör gombja;
     6. a katalógus: a Joker, a Morál és a Bank mind a 25 speciálja él, a
        Meccs speciáljai még nem;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9196;
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
  await p.waitForFunction(()=>typeof talSpecLamOwn==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint az F6b-próbában */
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
    S.transferBudget=5e9;S.morale=60;S.winStreak=0;
    if(!scout)scout=generateScout();
    if(!S.tactics)S.tactics={active:null,levels:{}};
    if(!S.tactics.active||!TACTICS[S.tactics.active]){S.tactics.active="kontra";S.tactics.levels.kontra=80;}
    addLine=()=>{};saveGame=()=>{};
    fanWeeklyIncome=()=>1000000;
    /* egy vagy több talizmán a megadott speciálokkal — a változat szándékosan
       NEM létező, hogy csak a special hasson */
    window._lapok=(lista)=>{
      S.tal=null;const T=talState();
      T.lapok=lista.map(([id,rang],i)=>{const sp=TAL_SPEC_BY[id];
        return {kat:sp.k,rang:rang||sp.min,dobas:0.5,spec:id,valt:"_nincs",uid:i+1,szezon:S.seasonNumber||1};});
      T.seq=lista.length;T.huzas=5;_talAlapMemo=null;_talSpecMemo=null;_talKtx=null;return T.lapok;};
    window._lap=(id,rang)=>_lapok([[id,rang]])[0];
    window._nincs=()=>{S.tal=null;_talAlapMemo=null;_talSpecMemo=null;_talKtx=null;};
    window._sor=(sn,k)=>{const r=S.ledger&&S.ledger.rows&&S.ledger.rows[sn||S.seasonNumber];return (r&&r.cats&&r.cats[k])||0;};});

  /* ---- 0. SEMLEGES ---- */
  const n0=await p.evaluate(()=>{
    _nincs();
    return {own:talSpecLamOwn(),fav:talSpecFav(),home:talSpecHome(),mezok:Object.keys(talSpecSnapMezok()).length,
      snap:["talSpOwn","talFav","talHome"].filter(k=>k in buildMatchSnapshot()).length,
      kiraly:talKiralyMult(),kapElad:talKapitanyEladasMult(slots[0].player.n),bond:talBondMult(),vas:talVasSargaMult(),
      buli:talBuliCel(),buliEdz:talBuliEdzMult(),padlo:talMoralPadlo(),fantom:talStabFantom(),fan:talFanMult(),
      inv:talInvestMult(),ber:talBerplafonMult(),arany:talAranytojasMult(),utem:talUtemN(),plafon:talPlafon(),
      pity:talPity(),kasz:talKaszinoDij(),kaosz:talKaoszMult("jo")*talKaoszMult("rossz"),fb:talFeketeMult(50),
      bef:talBefTetel(14),tukor:talTukorMost()||talTukorUtan(),ritka:talRitkaMult(false,"jo")*talRitkaMult(false,"rossz"),
      kotveny:talSpKontraMult(),dev:talSpecDevMult(),tanul:talSpecTanulMult(80),stab:talSpecStabMult(),edz:talEdzHatMult()};});
  console.log("\n— 0. TALIZMÁN NÉLKÜL: SEMLEGES —");
  ok(n0.own===1&&n0.fav===1&&n0.home===0&&n0.mezok===0&&n0.snap===0,"a pillanatképben nincs új mező, a szorzók 1-ek",n0);
  ok(n0.kiraly===1&&n0.kapElad===1&&n0.bond===1&&n0.vas===1&&n0.buli===0&&n0.buliEdz===1&&n0.padlo===0&&n0.fantom===0
    &&n0.fan===1&&n0.inv===2&&n0.ber===1&&n0.arany===1&&n0.utem===3&&n0.plafon===6&&n0.pity===16&&n0.kasz===0
    &&n0.kaosz===1&&n0.fb===1&&n0.bef===null&&!n0.tukor&&n0.ritka===1&&n0.kotveny===1&&n0.dev===1&&n0.tanul===1
    &&n0.stab===1&&n0.edz===1,"minden F6c-olvasó semleges talizmán nélkül",n0);

  /* ---- 1. JOKER ---- */
  const jk=await p.evaluate(()=>{
    const ki={};
    /* befektetők: a hátsó sáv 10%-a, idényenként egyszer; kontra: begyakorlás −7% */
    _lap("befektetok",4);
    const t=talBefTetel(14);ki.befSuly=t?t.weight/(14+t.weight):null;
    const b0=S.transferBudget,sor0=_sor(null,"talBef");
    const r=talBefFizet();ki.befPenz=(S.transferBudget-b0)/1e6;ki.befSor=_sor(null,"talBef")-sor0;
    ki.befCim=r.title;ki.befMasodik=talBefTetel(14);ki.befTanul=talSpecTanulMult(80);
    /* talizmán-eső: +1 ütemezett húzás, plafon 7; kontra: nincs Tiszta */
    _lap("eso",3);
    ki.eso=[talUtemN(),talPlafon(),talSzezon().due.length];
    let tiszta=0;const rnd=talRng("proba-eso");
    for(let i=0;i<300;i++){const L=talUjLap(rnd,"stab",3,{});if(!L.spec)tiszta++;}
    ki.esoTiszta=tiszta;
    _nincs();{let t0=0;const r0=talRng("proba-eso");for(let i=0;i<300;i++){const L=talUjLap(r0,"stab",3,{});if(!L.spec)t0++;}ki.esoNelkulTiszta=t0;}
    /* kétélű penge: a special két oldala saját dobást kap — pro a jobbik, kontra a rosszabbik */
    _lap("ketelu",2);
    const dp=[],dk=[];const r2=talRng("proba-ketelu");
    for(let i=0;i<400;i++){const L=talUjLap(r2,"stab",3,{spec:true});if(L.spec&&L.dp!=null){dp.push(L.dp);dk.push(L.dk);}}
    ki.ketDb=dp.length;ki.ketDp=dp.reduce((a,x)=>a+x,0)/dp.length;ki.ketDk=dk.reduce((a,x)=>a+x,0)/dk.length;
    const sp=TAL_SPEC_BY.specialista;
    ki.ketSzam=[talSpecSzam(sp,"pro",1,{dp:1,dk:0}),talSpecSzam(sp,"con",1,{dp:1,dk:1}),talSpecSzam(sp,"pro",1,{})];
    ki.ketSzoveg=talSpecOldal(sp,"pro",1,{dp:1});
    /* fekete bárány: óriásölésnél ×1,5; esélyesként −2% saját λ */
    _lap("feketebarany",2);
    ki.fb=[talFeketeMult(MS_GIANT_PCT+1),talFeketeMult(MS_GIANT_PCT-1),talSpecFav()];
    const mine={ovr:100,tacticEffect:0,defMult:1,ownGoalMult:1,oppGoalMult:1,talFav:talSpecFav()};
    const semm=Object.assign({},mine,{talFav:undefined});
    ki.fbEsely=matchLambdas(mine,95,0).lf/matchLambdas(semm,95,0).lf;
    ki.fbEselytelen=matchLambdas(mine,105,0).lf/matchLambdas(semm,105,0).lf;
    /* kaszinó: négy lap; minden húzás a heti lelátó 50%-a */
    _lap("kaszino",3);
    const kin=talKinalat("proba-kasz");ki.kaszLap=kin.length;ki.kaszKat=new Set(kin.map(L=>L.kat)).size;
    ki.kaszDij=talKaszinoDij();
    const T=talState();T.varo=[{id:"proba-k1",forras:"utem",n:1,szezon:S.seasonNumber,fordulo:5}];
    const b1=S.transferBudget;talValaszt(3);ki.kaszFiz=b1-S.transferBudget;ki.kaszSor=_sor(null,"talKaszino");
    /* káosz-elmélet: a jók és a rosszak +50%, a párharcban nem */
    _lap("kaosz",4);
    ki.kaosz=[talKaoszMult("jo"),talKaoszMult("rossz"),talRitkaMult(false,"jo"),talRitkaMult(true,"rossz")];
    /* szerencse fia: 10 húzás; kontra: az átlagos lap a sáv aljáról */
    _lap("szerencsefia",1);
    ki.pity=talPity();
    const r3=talRng("proba-sf");const d1=[];for(let i=0;i<50;i++)d1.push(talUjLap(r3,"bank",1,{}).dobas);
    ki.sfDobas=Math.max(...d1);
    const T2=talState();T2.szerencse=10;T2.huzas=4;
    ki.sfLeg=talKinalat("proba-sf2").some(L=>L.rang>=4);
    return ki;});
  console.log("\n— 1. JOKER —");
  ok(kozel(jk.befSuly,0.10,1e-9)&&jk.befPenz>=10&&jk.befPenz<=35&&kozel(jk.befSor/1e6,jk.befPenz,1e-9)&&jk.befMasodik===null&&kozel(jk.befTanul,0.93,1e-9),
    "Befektetők: a hátsó eseménysáv 10%-a, a heti lelátó 10–35-szöröse saját könyvelési sorral, idényenként egyszer · begyakorlás −7%",jk);
  ok(jk.eso[0]===4&&jk.eso[1]===7&&jk.eso[2]===4&&jk.esoTiszta===0&&jk.esoNelkulTiszta>50,
    "Talizmán-eső: +1 ütemezett húzás a naptárban, plafon 6 → 7 · a húzásokon nincs Tiszta talizmán",{eso:jk.eso,t:jk.esoTiszta,t0:jk.esoNelkulTiszta});
  ok(jk.ketDb>100&&jk.ketDp>0.6&&jk.ketDk>0.6&&kozel(jk.ketSzam[0],15*1.15,1e-9)&&kozel(jk.ketSzam[1],6*1.15,1e-9)&&kozel(jk.ketSzam[2],15,1e-9)&&/\+17%/.test(jk.ketSzoveg),
    "Kétélű penge: a pro a jobbik, a kontra a rosszabbik dobás a kettőből · a régi lap száma változatlan, a kiírt szám a hatóval egyezik",{db:jk.ketDb,dp:jk.ketDp,dk:jk.ketDk,sz:jk.ketSzam,t:jk.ketSzoveg});
  ok(jk.fb[0]===1.5&&jk.fb[1]===1&&kozel(jk.fb[2],0.98,1e-12)&&kozel(jk.fbEsely,0.98,1e-12)&&jk.fbEselytelen===1,
    "Fekete bárány: óriásölésnél ×1,5 · esélyesként −2% saját λ (esélytelenként semmi)",jk.fb.concat([jk.fbEsely,jk.fbEselytelen]));
  ok(jk.kaszLap===4&&jk.kaszKat===4&&jk.kaszDij===500000&&jk.kaszFiz===500000&&jk.kaszSor===500000,
    "Kaszinó: négy különböző kategóriájú lap · minden húzás a heti lelátó 50%-a, saját könyvelési sorral",jk);
  ok(kozel(jk.kaosz[0],1.5,1e-9)&&kozel(jk.kaosz[1],1.5,1e-9)&&kozel(jk.kaosz[2],1.5,1e-9)&&jk.kaosz[3]===1,
    "Káosz-elmélet: a jó ritka események +50% · a rosszak is +50% · a párharcban nem hat",jk.kaosz);
  ok(jk.pity===10&&jk.sfDobas===0&&jk.sfLeg,"Szerencse fia: 10 húzás után garantált legendás · az átlagos lap a sáv aljáról dob",{p:jk.pity,d:jk.sfDobas,l:jk.sfLeg});

  const jk2=await p.evaluate(()=>{
    const ki={};
    /* pénzfeldobás: 5 érme; fej +4%, írás −3%; két írás egymás után −2 morál */
    _lap("penzfeldobas",2);
    const X=talErme();ki.max=X.max;
    const e=talErmeDob();ki.lam=talSpecLamOwn();ki.fej=e.fej;ki.masodik=talErmeDob();
    talF6cEredmeny("draw",false);ki.elfogy=talErme().elo;
    /* két írás egymás után: keresünk egy olyan állást, ahol a dobás írás */
    let irasMor=null;
    for(let sz=10;sz<60&&irasMor===null;sz++){
      S.seasonNumber=sz;talSpAll().erme=null;const Y=talErme();Y.iras=1;S.morale=60;
      const d=talErmeDob();
      if(d&&!d.fej)irasMor=S.morale;
      talF6cEredmeny("draw",false);}
    S.seasonNumber=3;ki.irasMor=irasMor;
    /* tükörvilág: egy idényre minden kontra pro; utána a pro fele erővel */
    _lapok([["tukorvilag",4],["specialista",1]]);
    ki.tanul0=talSpecTanulMult(80);
    const a=talTukorAktival();ki.akt=a.ok;
    ki.tanulTukor=talSpecTanulMult(80);ki.foTukor=talFoEdzMult();
    ki.masodszor=talTukorAktival().ok;
    S.seasonNumber=4;ki.foUtan=talFoEdzMult();ki.tanulUtan=talSpecTanulMult(80);
    S.seasonNumber=5;ki.foKesobb=talFoEdzMult();
    S.seasonNumber=3;
    return ki;});
  ok(jk2.max===5&&(jk2.fej?kozel(jk2.lam,1.04,1e-12):kozel(jk2.lam,0.97,1e-12))&&jk2.masodik===null&&jk2.elfogy===null&&jk2.irasMor===58,
    "Pénzfeldobás: 5 érme, fej +4% / írás −3% a következő meccsen, egyszerre egy · két írás egymás után −2 morál",jk2);
  ok(kozel(jk2.tanul0,0.94,1e-9)&&jk2.akt&&kozel(jk2.tanulTukor,1.06,1e-9)&&kozel(jk2.foTukor,1.15,1e-9)&&!jk2.masodszor
    &&kozel(jk2.foUtan,1.075,1e-9)&&kozel(jk2.tanulUtan,0.94,1e-9)&&kozel(jk2.foKesobb,1.15,1e-9),
    "Tükörvilág: az aktiválás idényében a kontra pro (−6% → +6%), karrierenként egyszer · a következő idényben a pro fele (+15% → +7,5%)",jk2);

  /* ---- 2. MORÁL ---- */
  const mo=await p.evaluate(()=>{
    const ki={};
    const cap=slots[captainIdx].player.n,mas=slots[(captainIdx+3)%11].player.n;
    /* öltözői király: a kapitány súlya +40%; kontra: az eladási ára −15% */
    _nincs();const cp=careerPlayerFromPoolEntry(careerPool[cap]);const a0=saleAskPrice(cp);
    _lap("kiraly",2);
    ki.kiraly=[talKiralyMult(),talKapitanyEladasMult(cap),talKapitanyEladasMult(mas),saleAskPrice(cp)/a0];
    /* hosszú emlékezet: győzelmi sorozatban a cél fölötti morál fele olyan gyorsan kopik; vereség után −2% λ */
    _lap("emlekezet",1);
    S.winStreak=2;ki.kopas=[talEmlekezetKopas(80,60),talEmlekezetKopas(50,60)];S.winStreak=0;ki.kopas.push(talEmlekezetKopas(80,60));
    talF6cEredmeny("loss",false);ki.emlLam=talSpecLamOwn();talF6cEredmeny("win",false);ki.emlLam2=talSpecLamOwn();
    /* rangadó-láz: rangadón +6 morál és +2% λ; rangadó-vereség után 3 meccsig −2% */
    _lap("rangadolaz",2);
    S.morale=60;_talKtx={derby:true};talRangadoKezdes();ki.rangMor=S.morale;ki.rangLam=talSpecLamOwn();
    talF6cEredmeny("loss",true);_talKtx=null;
    const v=[];for(let i=0;i<4;i++){v.push(talSpecLamOwn());talF6cEredmeny("draw",false);}
    ki.rangVesz=v;
    /* családias légkör: összhang +10%; kontra: 3+ idényes eladásakor −6 morál */
    _lap("csaladias",1);
    ki.bond=talBondMult();
    careerPool[mas]._klubSz=(S.seasonNumber||1)-3;S.morale=60;talEladasMoral(mas);ki.csalMor=S.morale;
    careerPool[mas]._klubSz=S.seasonNumber||1;S.morale=60;talEladasMoral(mas);ki.csalUj=S.morale;
    /* vasakarat: kiállításnál nincs morál-büntetés; kontra: sárgalap +8% */
    _lap("vasakarat",3);
    ki.vas=[talVasakarat(),talVasSargaMult()];
    /* lélekbúvár: hullámonként +1 lépés, az irány váltható; kontra: stábhatás −4% */
    _lap("lelekbuvar",4);
    const T=talState();T.hullamok=[];
    const L={uid:77,rang:2,kat:"moral",valt:"hullam"};talHullamRegisztral(L);
    const h=talHullamok()[0];ki.hullamLepes=h.lepes;
    talHullamIranyValaszt(77,"kar+");ki.valt=talHullamIranyValt(77,"kap+");ki.irany=h.irany;
    ki.stab=talSpecStabMult();
    /* bulinegyed: 3+ győzelmes sorozat +2 cél; a buli utáni meccsen −10% edzés */
    _lap("bulinegyed",2);
    S.winStreak=3;ki.buliCel=talBuliCel();talF6cEredmeny("win",false);ki.buliEdz=talEdzHatMult();
    S.winStreak=0;talF6cEredmeny("loss",false);ki.buliUtan=talEdzHatMult();
    /* a pszichológus: a morál nem esik 30 alá; kontra: egy stábhely */
    _lap("pszichologus",3);
    S.morale=40;talSpMoral(-50,"próba");ki.padlo=S.morale;
    const st0=S.staff;S.staff=[];
    const hely=coachSlots();for(let i=0;i<hely-1;i++)S.staff.push({n:"Stáb "+i,type:"morale",sz:40,szBase:40,age:40,xp:0,focus:{mode:"team"}});
    ki.fantom=[talStabFantom(),staffFull()];
    _nincs();ki.fantomNelkul=staffFull();S.staff=st0;
    S.morale=60;
    return ki;});
  console.log("\n— 2. MORÁL —");
  ok(kozel(mo.kiraly[0],1.4,1e-9)&&kozel(mo.kiraly[1],0.85,1e-9)&&mo.kiraly[2]===1&&kozel(mo.kiraly[3],0.85,0.01),
    "Öltözői király: a kapitány morál-hatása +40% · a kapitány eladási ára −15%",mo.kiraly);
  ok(mo.kopas[0]===0.5&&mo.kopas[1]===1&&mo.kopas[2]===1&&kozel(mo.emlLam,0.98,1e-12)&&mo.emlLam2===1,
    "Hosszú emlékezet: győzelmi sorozatban fele olyan gyorsan kopik · vereség utáni meccsen −2% saját λ",mo);
  ok(mo.rangMor===66&&kozel(mo.rangLam,1.02,1e-12)&&kozel(mo.rangVesz[0],0.98,1e-12)&&kozel(mo.rangVesz[2],0.98,1e-12)&&mo.rangVesz[3]===1,
    "Rangadó-láz: rangadón +6 morál és +2% λ · rangadó-vereség után 3 meccsig −2%",{m:mo.rangMor,l:mo.rangLam,v:mo.rangVesz});
  ok(kozel(mo.bond,1.1,1e-9)&&mo.csalMor===54&&mo.csalUj===60,"Családias légkör: összhang +10% · a 3+ idényes eladásakor −6 morál (a frissnél nem)",mo);
  ok(mo.vas[0]===true&&kozel(mo.vas[1],1.08,1e-9),"Vasakarat: a kiállítás nem visz morált · sárgalap-esély +8%",mo.vas);
  ok(mo.hullamLepes===4&&mo.valt&&mo.irany==="kap+"&&kozel(mo.stab,0.96,1e-9),"Lélekbúvár: hullámonként +1 lépés, az irány menet közben váltható · stábhatás −4%",mo);
  ok(mo.buliCel===2&&kozel(mo.buliEdz,0.9,1e-9)&&mo.buliUtan===1,"Bulinegyed: 3+ győzelmes sorozatnál +2 morál-cél · a buli utáni meccsen −10% edzés",mo);
  ok(mo.padlo===30&&mo.fantom[0]===1&&mo.fantom[1]===true&&mo.fantomNelkul===false,"A pszichológus: a morál nem esik 30 alá · egy stábhelyet elfoglal",mo);

  /* ---- 3. BANK ---- */
  const bk=await p.evaluate(()=>{
    const ki={};
    /* valószerű szezonkeret: a fixture-é olyan kicsi, hogy a 100-as kerekítés elnyelné */
    const _sbc=seasonBudgetCore;seasonBudgetCore=()=>1e9;
    const base=seasonBudgetCore();
    /* takarékbetét: idényzáráskor kamat (plafon: a szezonkeret 10%-a); kontra: vételár +3% */
    _lap("takarek",1);
    S.transferBudget=Math.round(base*0.5);const b0=S.transferBudget;
    const r=talBankIdenyzaras(5,12);ki.kamat=(S.transferBudget-b0)/b0;ki.kamatSor=_sor(null,"talKamat");ki.masodszor=talBankIdenyzaras(5,12);
    S.transferBudget=Math.round(base*10);const b1=S.transferBudget;talSpAll().bankZar=null;talBankIdenyzaras(5,12);ki.kamatPlafon=(S.transferBudget-b1)/base;
    /* szponzori bónusz: győzelem +10% heti lelátó; vereség −1 morál */
    _lap("szponzor",2);
    const b2=S.transferBudget;talBankMeccs("win");ki.szpPenz=S.transferBudget-b2;ki.szpSor=_sor(null,"talSzponzor");
    S.morale=60;talBankMeccs("loss");ki.szpMor=S.morale;
    /* stadionbővítés: szurkolónövekedés +10%; a felvétel idényében −0,2 hazai előny */
    _lap("stadion",3);
    ki.fan=talFanMult();ki.home=talSpecHome();
    const mine={ovr:100,tacticEffect:0,defMult:1,ownGoalMult:1,oppGoalMult:1,talHome:talSpecHome()};
    ki.homeDiff=matchLambdas(mine,100,SIM.HOME).diff-matchLambdas(Object.assign({},mine,{talHome:undefined}),100,SIM.HOME).diff;
    ki.awayDiff=matchLambdas(mine,100,SIM.AWAY).diff-matchLambdas(Object.assign({},mine,{talHome:undefined}),100,SIM.AWAY).diff;
    talState().lapok[0].szezon=(S.seasonNumber||1)-1;_talSpecMemo=null;ki.homeKesobb=talSpecHome();
    /* kötvénypiac: befektetés ×2,3; kontra: stíluspont −5% */
    _lap("kotveny",2);ki.inv=talInvestMult();ki.spk=talSpKontraMult();
    /* bérplafon: bér −6%; kontra: morál-cél −2 */
    _nincs();const pl=slots[1].player;const w0=playerMatchWage(pl);
    _lap("berplafon",1);ki.ber=playerMatchWage(pl)/w0;ki.celMinusz=talMoralCelMinusz();
    /* az aranytojás: eladás +12%; kontra: fejlődési tempó −4% */
    _nincs();const sp=careerPlayerFromPoolEntry(careerPool[slots[4].player.n]);const a0=saleAskPrice(sp);
    _lap("aranytojas",4);ki.elad=saleAskPrice(sp)/a0;ki.dev=talSpecDevMult();
    /* tőzsdei bevezetés: idényzáráskor −5…+20%; vereség −1 morál */
    _lap("tozsde",4);
    S.transferBudget=Math.round(base*0.4);const b3=S.transferBudget;talBankIdenyzaras(1,12);ki.tozsdeElso=(S.transferBudget-b3)/b3;
    S.transferBudget=Math.round(base*0.4);const b4=S.transferBudget;talSpAll().bankZar=null;talBankIdenyzaras(12,12);ki.tozsdeUtolso=(S.transferBudget-b4)/b4;
    ki.tozsdeSor=[_sor(null,"talTozsde"),_sor(null,"talTozsdeKi")];
    S.morale=60;talBankMeccs("loss");ki.tozsdeMor=S.morale;
    /* szurkolói kötvény: azonnal a heti lelátó 500%-a; két idényen át vereségkor −2 morál */
    _lap("szurkoloikotveny",2);
    const b5=S.transferBudget;talKotvenyFelvesz(talState().lapok[0]);ki.kotv=S.transferBudget-b5;ki.kotvSor=_sor(null,"talKotveny");
    S.morale=60;talBankMeccs("loss");ki.kotvMor=S.morale;
    S.seasonNumber=5;S.morale=60;talBankMeccs("loss");ki.kotvMorKesobb=S.morale;S.seasonNumber=3;
    S.morale=60;S.transferBudget=5e9;seasonBudgetCore=_sbc;
    return ki;});
  console.log("\n— 3. BANK —");
  ok(kozel(bk.kamat,0.04,0.001)&&bk.kamatSor>0&&bk.masodszor===null&&kozel(bk.kamatPlafon,0.10,0.001),
    "Takarékbetét: idényzáráskor 4% kamat a fel nem használt büdzsére, legfeljebb a szezonkeret 10%-a, idényenként egyszer, saját sorral",bk);
  ok(bk.szpPenz===100000&&bk.szpSor===100000&&bk.szpMor===59,"Szponzori bónusz: győzelem után +10% heti lelátó · vereség után −1 morál",bk);
  ok(kozel(bk.fan,1.1,1e-9)&&bk.home===-0.2&&kozel(bk.homeDiff,-0.2,1e-12)&&bk.awayDiff===0&&bk.homeKesobb===0,
    "Stadionbővítés: szurkolónövekedés +10% · a felvétel idényében −0,2 hazai előny (idegenben és később semmi)",bk);
  ok(bk.inv===2.3&&kozel(bk.spk,0.95,1e-9),"Kötvénypiac: a Befektetés hozama ×2 → ×2,3 · stíluspont −5%",bk);
  ok(kozel(bk.ber,0.94,0.002)&&bk.celMinusz===2,"Bérplafon: bér −6% · morál-cél −2",bk);
  ok(kozel(bk.elad,1.12,0.01)&&kozel(bk.dev,0.96,1e-9),"Az Aranytojás: eladás +12% · fejlődési tempó −4%",bk);
  ok(kozel(bk.tozsdeElso,0.20,0.002)&&kozel(bk.tozsdeUtolso,-0.05,0.002)&&bk.tozsdeSor[0]>0&&bk.tozsdeSor[1]>0&&bk.tozsdeMor===59,
    "Tőzsdei bevezetés: az 1. hely +20%, az utolsó −5% a büdzsén, két irányú könyveléssel · vereség −1 morál",bk);
  ok(bk.kotv===5000000&&bk.kotvSor===5000000&&bk.kotvMor===58&&bk.kotvMorKesobb===60,
    "Szurkolói kötvény: azonnal a heti lelátó 500%-a · két idényen át vereségkor −2 morál, utána nem",bk);

  /* ---- 4. A PÁRHARC ---- */
  const d=await p.evaluate(()=>{
    const ki={};
    _lapok([["emlekezet",1],["feketebarany",2],["stadion",3]]);
    talF6cEredmeny("loss",false);
    const MS=buildMatchSnapshot();
    ki.ms={own:MS.talSpOwn,fav:MS.talFav,home:MS.talHome};
    let w=null;try{w=h2hWireSnapshot();}catch(e){ki.hiba=String(e);}
    if(!w)return ki;
    ki.mezok={own:w.talSpOwn,fav:w.talFav,home:w.talHome};
    const nelkul=Object.assign({},w);delete nelkul.talSpOwn;delete nelkul.talFav;delete nelkul.talHome;
    const sim=(h,a,seed)=>h2hSimulate(JSON.parse(JSON.stringify(h)),JSON.parse(JSON.stringify(a)),rngFor("f6cproba:"+seed),false);
    ki.determin=JSON.stringify(sim(w,nelkul,7))===JSON.stringify(sim(w,nelkul,7));
    const _ml=matchLambdas;let rog=[];
    matchLambdas=function(){const r=_ml.apply(this,arguments);rog.push(r);return r;};
    let L1,L0;
    try{rog=[];sim(w,nelkul,11);L1=rog[0];rog=[];sim(nelkul,nelkul,11);L0=rog[0];}
    finally{matchLambdas=_ml;}
    ki.diff=L1.diff-L0.diff;
    ki.lf=L1.lf/L0.lf;ki.esely=L1.diff>0;
    ki.vart=Math.exp(SIM.K*-0.2)*0.98*(ki.esely?0.98:1);
    /* egy régi kliens pillanatképe (a mezők nélkül) semleges */
    ki.regi=sim(nelkul,nelkul,3).hg===sim(nelkul,nelkul,3).hg;
    return ki;});
  console.log("\n— 4. A PÁRHARC —");
  ok(d.ms&&kozel(d.ms.own,0.98,1e-12)&&kozel(d.ms.fav,0.98,1e-12)&&d.ms.home===-0.2,"a pillanatkép viszi a három mezőt (talSpOwn, talFav, talHome)",d.ms);
  ok(d.mezok&&kozel(d.mezok.own,0.98,1e-12)&&kozel(d.mezok.fav,0.98,1e-12)&&d.mezok.home===-0.2,"a valódi h2hWireSnapshot is viszi őket",d.mezok||d.hiba);
  ok(d.determin,"ugyanabból a magból a h2hSimulate BITRE ugyanazt adja");
  ok(kozel(d.diff,-0.2,1e-12)&&kozel(d.lf,d.vart,1e-9),
    "a párharc λ-ja: a hazai előny −0,2, a saját λ ×0,98 (és esélyesként még ×0,98)",d);

  /* ---- 5. A FELÜLET ---- */
  const f=await p.evaluate(()=>{
    const ki={};
    _lap("kaszino",3);
    const T=talState();T.varo=[{id:"proba-kf",forras:"utem",n:1,szezon:S.seasonNumber,fordulo:5}];
    talDrawOpen(()=>{});
    ki.lapok=$("talDrawCards").children.length;ki.negy=$("talDrawCards").classList.contains("negy");
    ki.dij=/a húzás díja/.test($("talDrawSrc").textContent);
    talDrawClose();
    _lapok([["penzfeldobas",2],["tukorvilag",4]]);
    talMenuOpen();
    const h=$("talModal").innerHTML;   /* 3.9.173: a gombok a „Képességeid" kártyáin */
    ki.erme=/data-tal="erme"/.test(h);ki.tukor=/data-tal="tukor"/.test(h);
    document.querySelector('[data-tal="erme"]').click();
    ki.ermeUtan=/FEJ|ÍRÁS/.test($("talModal").textContent);
    talMenuClose();
    return ki;});
  console.log("\n— 5. A FELÜLET —");
  ok(f.lapok===4&&f.negy&&f.dij,"a Kaszinó négy lapos húzás-ablaka, a díj kiírva",f);
  ok(f.erme&&f.tukor&&f.ermeUtan,"a menüben az érme és a tükör gombja; a feldobás eredménye azonnal látszik",f);

  /* ---- 6. A KATALÓGUS ---- */
  const k=await p.evaluate(()=>{
    const F6C=TAL_SPEC.filter(s=>["joker","moral","bank"].indexOf(s.k)>=0);
    const meccs=TAL_SPEC.filter(s=>s.k==="meccs");
    /* 3.9.158 óta a Meccs speciáljai is élnek (F6d) — a teljes katalógus */
    return {db:F6C.length,mind:F6C.every(s=>talSpecMukodik(s.id)),meccsNem:meccs.every(s=>talSpecMukodik(s.id))};});
  console.log("\n— 6. A KATALÓGUS —");
  ok(k.db===25&&k.mind&&k.meccsNem,"a Joker, a Morál és a Bank mind a 25 speciálja él (és 3.9.158 óta a Meccséi is)",k);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
