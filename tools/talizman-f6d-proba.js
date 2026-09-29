/* 🧿 TALIZMÁNOK F6d — A MECCS SPECIÁLJAI (3.9.158).

   KIMONDOTT KÉRÉS: „Csináljuk itt lokálba." (a hátralévő lista második
   tétele: a kilenc meccs-special, a legkényesebb motorfeladat)

   Amit mér:
     0. TALIZMÁN NÉLKÜL: minden új olvasó semleges, a pillanatképben nincs új
        mező, és a két motor közös időfüggő olvasója (talIdoOwn / talIdoOpp)
        mező nélkül pontosan 1;
     1. a kilenc special mindegyikére egy PRO és egy KONTRA állítás — az
        időablakok a VALÓDI olvasón, vödörre pontosan; a pálya a valódi
        matchLambdas-on; a lapok a valódi pillanatképen és az emberhátrány
        tételén; a tizenegyes a valódi különleges-esemény ágon; a lelátó a
        valódi heti tickben;
     2. A PÁRHARC-DETERMINIZMUS minden meccs-specialra: a valódi
        h2hWireSnapshot viszi a mezőket, a h2hSimulate ugyanabból a magból
        BITRE ugyanazt adja (öt magon), és a vödrönkénti λ pontosan a
        szorzóval tolódik (0–15., 75+.; a vendégé a hazai Villámrajt-kontrája);
     3. A MECCSERŐ-TÜKÖR: a helyi meccserő (hiddenMatchBonus) és a pillanatkép
        meccserője (snapMatchStrength) ugyanannyit mozdul;
     4. a katalógus: mind a 9 meccs-special él — ezzel a teljes katalógus;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9197;
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
  await p.waitForFunction(()=>typeof talIdoOwn==="function",null,{timeout:15000});

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
    /* a Meccs-kártya TENGELYE a λ-t is tolná (F5) — a speciált az alaphatás
       nélkül mérjük, ezért a lapoknak nem létező tengelyük van */
    window._lapok=(lista)=>{
      S.tal=null;const T=talState();
      T.lapok=lista.map(([id,rang],i)=>{const sp=TAL_SPEC_BY[id];
        return {kat:sp.k,rang:rang||sp.min,dobas:0.5,spec:id,al:"_nincs",uid:i+1,szezon:S.seasonNumber||1};});
      T.seq=lista.length;T.huzas=5;_talAlapMemo=null;_talSpecMemo=null;_talKtx=null;return T.lapok;};
    window._lap=(id,rang)=>_lapok([[id,rang]])[0];
    window._nincs=()=>{S.tal=null;_talAlapMemo=null;_talSpecMemo=null;_talKtx=null;};
    window._mine=(o)=>Object.assign({ovr:100,tacticEffect:0,defMult:1,ownGoalMult:1,oppGoalMult:1},o||{});});

  /* ---- 0. SEMLEGES ---- */
  const n0=await p.evaluate(()=>{
    _nincs();
    const MS=buildMatchSnapshot();
    let dm=1;try{dm=dialMul("redmatch",{});}catch(e){dm=1;}
    return {mezok:Object.keys(talMeccsSnapMezok()).length,
      snap:["talIdo","talSpOwnM","talSpOpp","talHomeM","talAway","talHomeOwn","talOppRed"].filter(k=>k in MS).length,
      ido:[5,15,20,80,90].map(m=>talIdoOwn({},m,0,0)*talIdoOpp({},m)).every(x=>x===1),
      idoMs:[5,80,90].map(m=>talIdoOwn(MS,m,1,1)*talIdoOpp(MS,m)).every(x=>x===1),
      red:dialRedMatch()===SIM.REDMATCH*Math.max(0.5,2-dm),
      piros:talTizemberPiros(),hoher:talHoherPP(),fk:talHoherFkMult(),kapu:talHazaiKapuMult(true),
      tukor:(()=>{const t=talMeccsSpTukor({});return t.own===1&&t.opp===1;})()};});
  console.log("\n— 0. TALIZMÁN NÉLKÜL: SEMLEGES —");
  ok(n0.mezok===0&&n0.snap===0&&n0.ido&&n0.idoMs&&n0.red&&n0.piros===1&&n0.hoher===0&&n0.fk===1&&n0.kapu===1&&n0.tukor,
    "nincs új pillanatkép-mező, az időfüggő olvasó mindenhol 1, a lapok és a tizenegyes semlegesek",n0);

  /* ---- 1. A KILENC SPECIAL ---- */
  const sp=await p.evaluate(()=>{
    const ki={};
    const ido=(sn,m,gf,ga)=>talIdoOwn(sn,m,gf||0,ga||0);
    /* hajrá-gépezet: a 75. perctől +6%; kontra: 0–15. −4% */
    _lap("hajra",2);
    let MS=buildMatchSnapshot();
    ki.hajra=[ido(MS,75),ido(MS,80),ido(MS,90),ido(MS,15),ido(MS,20)];
    /* villámrajt: 0–15. +8%; kontra: 75-től az ellenfélnek +4% */
    _lap("villamrajt",2);MS=buildMatchSnapshot();
    ki.villam=[ido(MS,5),ido(MS,15),ido(MS,20),talIdoOpp(MS,75),talIdoOpp(MS,80)];
    /* hazai erőd: hazai +0,4, idegenben −0,25 meccserő */
    _lap("erod",1);MS=buildMatchSnapshot();
    const m0=_mine(),m1=_mine({talHomeM:MS.talHomeM,talAway:MS.talAway});
    ki.erod=[matchLambdas(m1,100,SIM.HOME).diff-matchLambdas(m0,100,SIM.HOME).diff,
      matchLambdas(m1,100,SIM.AWAY).diff-matchLambdas(m0,100,SIM.AWAY).diff,
      matchLambdas(m1,100,0).diff-matchLambdas(m0,100,0).diff];
    /* kupavadász: kupán +3%, bajnokin −1% */
    _lap("kupavadasz",3);
    const ea=euroActive;
    euroActive=()=>true;ki.kupa=talMeccsSpOwn();
    euroActive=()=>false;ki.bajnoki=talMeccsSpOwn();
    euroActive=ea;
    /* tizenegyes-hóhér: +10 pp; kontra: szabadrúgás-súly −20% */
    _lap("hoher",1);ki.hoher=[talHoherPP(),talHoherFkMult()];
    const pm=playMatchMotor.toString();
    ki.hoherKod=/talHoherPP\(\)/.test(pm)&&/talHoherFkMult\(\)/.test(pm);
    /* betonfal: ellenfél −3%, saját −2% */
    _lap("betonfal",2);MS=buildMatchSnapshot();
    const b1=matchLambdas(_mine({talSpOwnM:MS.talSpOwnM,talSpOpp:MS.talSpOpp}),100,0),b0=matchLambdas(_mine(),100,0);
    ki.beton=[b1.lf/b0.lf,b1.la/b0.la];
    /* tíz ember is elég: az emberhátrány tétele −35%; a piroslap-esély +10% */
    _nincs();const r0=dialRedMatch();
    const w0=(()=>{try{return h2hWireSnapshot();}catch(e){return null;}})();
    _lap("tizember",4);
    ki.tiz=[dialRedMatch()/r0,talTizemberPiros()];
    const w1=(()=>{try{return h2hWireSnapshot();}catch(e){return null;}})();
    ki.tizWire=w0&&w1?[w1.redMatch/w0.redMatch,w1.redP/w0.redP]:null;
    /* a 12. játékos: hazai +2% és a vendég piroslapja +20%; kontra: hazai lelátó −8% */
    _lap("tizenkettedik",3);MS=buildMatchSnapshot();
    const t1=_mine({talHomeOwn:MS.talHomeOwn});
    ki.t12=[matchLambdas(t1,100,SIM.HOME).lf/matchLambdas(_mine(),100,SIM.HOME).lf,
      matchLambdas(t1,100,SIM.AWAY).lf/matchLambdas(_mine(),100,SIM.AWAY).lf,MS.talOppRed,talHazaiKapuMult(true),talHazaiKapuMult(false)];
    /* …és a valódi heti lelátó-tickben */
    const bb=S.transferBudget;fanMatchTick({home:true});const hH=S.transferBudget-bb;
    const bb2=S.transferBudget;fanMatchTick({home:false});const hA=S.transferBudget-bb2;
    ki.t12Kapu=hH/hA;
    /* az utolsó szó: 85-től döntetlennél +10%; kontra: ha mégis kikapsz, −3 morál */
    _lap("utolsoszo",2);MS=buildMatchSnapshot();
    ki.szo=[ido(MS,85,1,1),ido(MS,90,1,1),ido(MS,90,2,1)];
    S.morale=60;talIdoJegyez(85,1,1);talUtolsoSzoVege("loss");ki.szoMor=S.morale;
    S.morale=60;talIdoJegyez(85,2,1);talUtolsoSzoVege("loss");ki.szoMor2=S.morale;
    S.morale=60;
    return ki;});
  console.log("\n— 1. A KILENC SPECIAL —");
  ok(sp.hajra[0]===1&&kozel(sp.hajra[1],1.06,1e-12)&&kozel(sp.hajra[2],1.06,1e-12)&&kozel(sp.hajra[3],0.96,1e-12)&&sp.hajra[4]===1,
    "Hajrá-gépezet: a 75. perctől (80., 85., 90. vödör) +6% · a 0–15. percben −4%",sp.hajra);
  ok(kozel(sp.villam[0],1.08,1e-12)&&kozel(sp.villam[1],1.08,1e-12)&&sp.villam[2]===1&&sp.villam[3]===1&&kozel(sp.villam[4],1.04,1e-12),
    "Villámrajt: a 0–15. percben +8% · a 75. perctől az ellenfélnek +4%",sp.villam);
  ok(kozel(sp.erod[0],0.4,1e-12)&&kozel(sp.erod[1],-0.25,1e-12)&&sp.erod[2]===0,"Hazai erőd: hazai pályán +0,4 · idegenben −0,25 meccserő · semleges pályán semmi",sp.erod);
  ok(kozel(sp.kupa,1.03,1e-12)&&kozel(sp.bajnoki,0.99,1e-12),"Kupavadász: kupameccsen +3% · bajnokin −1%",[sp.kupa,sp.bajnoki]);
  ok(kozel(sp.hoher[0],0.10,1e-12)&&kozel(sp.hoher[1],0.8,1e-12)&&sp.hoherKod,"Tizenegyes-hóhér: +10 pp értékesítés · a szabadrúgás súlya −20% (a különleges-esemény ágon)",sp.hoher);
  ok(kozel(sp.beton[0],0.98,1e-12)&&kozel(sp.beton[1],0.97,1e-12),"Betonfal: az ellenfél −3% · saját −2%",sp.beton);
  ok(kozel(sp.tiz[0],0.65,1e-9)&&kozel(sp.tiz[1],1.1,1e-12)&&sp.tizWire&&kozel(sp.tizWire[0],0.65,1e-9)&&kozel(sp.tizWire[1],1.1,1e-9),
    "Tíz ember is elég: az emberhátrány tétele −35% · piroslap-esély +10% (a CPU-meccsen és a párharc pillanatképében is)",{t:sp.tiz,w:sp.tizWire});
  ok(kozel(sp.t12[0],1.02,1e-12)&&sp.t12[1]===1&&sp.t12[2]===1.2&&kozel(sp.t12[3],0.92,1e-12)&&sp.t12[4]===1&&kozel(sp.t12Kapu,0.92,0.001),
    "A 12. játékos: hazai pályán +2% és a vendég piroslap-esélye +20% · a hazai lelátó-bevétel −8% (a valódi heti tickben)",{t:sp.t12,k:sp.t12Kapu});
  ok(sp.szo[0]===1&&kozel(sp.szo[1],1.1,1e-12)&&sp.szo[2]===1&&sp.szoMor===57&&sp.szoMor2===60,
    "Az utolsó szó: a 85. perctől döntetlennél +10% · ha a 85. percben döntetlen volt és kikapsz, −3 morál",{i:sp.szo,m:[sp.szoMor,sp.szoMor2]});

  /* ---- 2. A PÁRHARC-DETERMINIZMUS ---- */
  const d=await p.evaluate(()=>{
    const ki={};
    const UJ=["talIdo","talSpOwnM","talSpOpp","talHomeM","talAway","talHomeOwn","talOppRed"];
    _lapok([["hajra",2],["villamrajt",2],["erod",1],["betonfal",2],["tizember",4],["tizenkettedik",3],["utolsoszo",2],["hoher",1],["kupavadasz",3]]);
    let w=null;try{w=h2hWireSnapshot();}catch(e){ki.hiba=String(e);}
    if(!w)return ki;
    ki.mezok=UJ.filter(k=>k in w);
    const nelkul=JSON.parse(JSON.stringify(w));UJ.forEach(k=>delete nelkul[k]);
    const sim=(h,a,seed)=>h2hSimulate(JSON.parse(JSON.stringify(h)),JSON.parse(JSON.stringify(a)),rngFor("f6dproba:"+seed),false);
    ki.determin=[1,2,3,4,5].every(s=>JSON.stringify(sim(w,nelkul,s))===JSON.stringify(sim(w,nelkul,s)))
      &&[1,2,3].every(s=>JSON.stringify(sim(nelkul,w,s))===JSON.stringify(sim(nelkul,w,s)));
    /* A VÖDRÖNKÉNTI λ. Hogy a vödör λ-ja CSAK az időablaktól függjön, a két
       pillanatképből kivesszük, ami a gólállástól vagy a lapoktól függ
       (szerepek, csúszkák, lapok) — és csak a talIdo mező különbözik. A
       poisson-hívásokat elkapjuk: vödrönként előbb a hazai, aztán a vendég. */
    const tiszta=x=>Object.assign(JSON.parse(JSON.stringify(x)),{redP:0,yellowP:0,dials:null,roles:null,plan:[]});
    const alap=tiszta(nelkul),ido=Object.assign(tiszta(nelkul),{talIdo:w.talIdo});
    const _po=poisson;let rog=[];
    poisson=function(l,r){rog.push(l);return _po(l,r);};
    let V1,V0;
    try{
      rog=[];sim(ido,alap,11);V1=rog.slice();
      rog=[];sim(alap,alap,11);V0=rog.slice();
    }finally{poisson=_po;}
    ki.hivas=[V1.length,V0.length];
    const r=i=>V1[i]/V0[i];
    /* a t. vödör (t=1…18) hazai hívása a 2(t−1)., a vendégé a 2(t−1)+1. */
    ki.h5=r(0);ki.h15=r(4);ki.h20=r(6);ki.h80=r(30);ki.h90=r(34);
    ki.v20=r(7);ki.v80=r(31);
    /* a 12. játékos: a vendég piroslap-esélye a szimuláció oldalán */
    ki.pirosKod=/talOppRed/.test(h2hSimulate.toString());
    return ki;});
  console.log("\n— 2. A PÁRHARC-DETERMINIZMUS —");
  ok(d.mezok&&d.mezok.length===7,"a valódi h2hWireSnapshot mind a hét új mezőt viszi",d.mezok||d.hiba);
  ok(d.determin,"ugyanabból a magból a h2hSimulate BITRE ugyanazt adja (öt mag, mindkét oldalon)");
  ok(d.hivas&&d.hivas[0]===d.hivas[1]&&d.hivas[0]===36,"a véletlen-fogyasztás szerkezete változatlan (18 vödör × 2 gól-sorsolás)",d.hivas);
  ok(kozel(d.h5,1.08*0.96,1e-9)&&kozel(d.h15,1.08*0.96,1e-9)&&kozel(d.h20,1,1e-12)&&kozel(d.h80,1.06,1e-9),
    "a hazai λ a 0–15. percben ×(1,08·0,96), a 20. vödörben ×1, a 75. perctől ×1,06",{h5:d.h5,h20:d.h20,h80:d.h80,h90:d.h90});
  ok(kozel(d.v20,1,1e-12)&&kozel(d.v80,1.04,1e-9),"a vendég λ a 75. perctől ×1,04 — a hazai Villámrajt-kontrája, a hazai pillanatképből",{v20:d.v20,v80:d.v80});
  ok(d.pirosKod,"a 12. játékos lapja a szimulációban a vendég piroslap-esélyén ül");

  /* ---- 3. A MECCSERŐ-TÜKÖR ---- */
  const t=await p.evaluate(()=>{
    _nincs();const h0=hiddenMatchBonus(),s0=snapMatchStrength(buildMatchSnapshot());
    _lapok([["betonfal",2],["hajra",2],["villamrajt",2]]);
    const h1=hiddenMatchBonus(),s1=snapMatchStrength(buildMatchSnapshot());
    const T=talMeccsSpTukor(buildMatchSnapshot());
    return {dh:h1-h0,ds:s1-s0,vart:0.5*(Math.log(T.own)-Math.log(T.opp))/SIM.K};});
  console.log("\n— 3. A MECCSERŐ-TÜKÖR —");
  ok(kozel(t.dh,t.vart,1e-9)&&kozel(t.ds,t.vart,0.11),"a helyi meccserő és a pillanatkép meccserője ugyanannyit mozdul (a feltétel nélküli tagok és az időablakok vödör-átlaga)",t);

  /* ---- 4. A KATALÓGUS ---- */
  const k=await p.evaluate(()=>({db:TAL_SPEC.filter(s=>s.k==="meccs").length,
    meccs:TAL_SPEC.filter(s=>s.k==="meccs").every(s=>talSpecMukodik(s.id)),
    mind:TAL_SPEC.every(s=>talSpecMukodik(s.id)),ossz:TAL_SPEC.length}));
  console.log("\n— 4. A KATALÓGUS —");
  ok(k.db===9&&k.meccs&&k.mind,"mind a 9 meccs-special él — ezzel a katalógus mind a "+k.ossz+" speciálja",k);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
