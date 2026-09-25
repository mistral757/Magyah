/* 🧿 TALIZMÁNOK — F3: a hat gazdasági kategória alaphatása (3.9.142).

   KIMONDOTT KÉRÉS: „Mehet az f3" — a Scout, a Csapatstílus, a Taktika, az
   Igazolások, a Fejlődés és a Stáb talizmánjainak alaphatása bekapcsol.

   Amit mér:
     1. TALIZMÁN NÉLKÜL SEMMI NEM MOZDUL: minden kapaszkodó pontosan a régi
        számot adja — üres gyűjteménnyel ÉS olyan gyűjteménnyel is, amiben csak
        a még nem ható kategóriák (Joker, Morál, Bank, Meccs) állnak;
     2. A CSÖKKENŐ HOZAM ÉS A PLAFON: egy kategória talizmánjai erő szerint
        0,85^k-szorosan adódnak, és a változat plafonja fog;
     3. MIND A 13 VÁLTOZAT a saját kapaszkodóján: a stílus-fa és a csillagozás
        ára (a fizetés is!), a mérföldkő pénze és stíluspontja, az illeszkedés
        és a begyakorlás, a tárgyalás tiszta sávja (valódi twResolveSigning), a
        kedvezmény (seedelt, a kihívás-kedvezménnyel nem adódik össze), a licit
        kúpja (valódi saleRollOffer), a fejlődési tempó, az edzés, a stábhatás,
        a stábtag és a stábhely ára, az akadémia köztes kapuja és a scout
        negyedik jelöltje;
     4. A FELÜLET: a lapon a ⚡ jelzés, a menüben az aktív hatások a plafonnal
        és a következő talizmán hatékonyságával;
     5. A JOKER ESEMÉNYCSOMAGJA: 2 jó + 1 rossz, a tartalma a lapon látszik, a
        választás a paklihoz adja, és egy esemény nem jön kétszer;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9159;
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
  await p.waitForFunction(()=>typeof talAlapMind==="function",null,{timeout:15000});

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
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;
    /* a próba saját segédjei: egy talizmán adott változattal és erővel */
    window._lap=(kat,valt,rang,dobas,spec)=>({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length;_talAlapMemo=null;};
  });

  /* ---- 1. SEMLEGES ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    /* a mérendő pontok egyetlen pillanatképe */
    const kep=()=>{
      const o={};
      const tk=Object.keys(TACTICS)[0];
      o.fit=tacticFit(tk);
      o.dev=devTempo();
      const c={type:"attr:gol",sz:70};o.qual=coachQual(c);
      o.staff=staffPrice(70);o.slot=coachSlotPrice(4);
      o.ms=msCashReward(0.1);o.sp=msSpReward(40);
      o.star=starUnlockPrice(SKILLS[0]);
      o.jel=[talScout4P(),talAkadKapuP(),talStilusArMult(),talMsPremium(),talFitPP(),talTanulMult(),
        talTisztaShift(),talKedvP(),talLicitShift(),talDevMult(),talEdzesMult(),talStabHatasMult(),talStabArMult()];
      return o;};
    S.tal=null;_talAlapMemo=null;ki.ures=kep();
    _pakli([_lap("bank","bevetel",4,1),_lap("joker","vad",4,1),_lap("moral","legkor",3,1),{kat:"meccs",al:"gol",rang:4,dobas:1,spec:null}]);
    ki.masik=kep();
    ki.azonos=JSON.stringify(ki.ures)===JSON.stringify(ki.masik);
    ki.semleges=ki.ures.jel.join(",")==="0,0,1,1,0,1,0,0,0,1,1,1,1";
    return ki;});
  console.log("\n— 1. TALIZMÁN NÉLKÜL SEMMI NEM MOZDUL —");
  ok(n.semleges,"üres gyűjteménnyel minden olvasó semleges (0 / ×1)",n.ures.jel);
  ok(n.azonos,"csak nem ható kategóriákkal (Bank, Joker, Morál, Meccs) minden kapaszkodó bitre ugyanaz",{ures:n.ures,masik:n.masik});

  /* ---- 2. CSÖKKENŐ HOZAM ÉS PLAFON ---- */
  const h=await p.evaluate(()=>{
    const ki={};
    /* három Jobb illeszkedés: E = 2,7 / 1,7 / 1,0 (dobás 0,5 → ×1,0) + Tiszta ×1,25 */
    _pakli([_lap("taktika","fit",1,0.5),_lap("taktika","fit",3,0.5),_lap("taktika","fit",2,0.5)]);
    const E=[2.7,1.7,1.0].map(x=>x*1.25);
    ki.vart=0.8*(E[0]+E[1]*0.85+E[2]*0.85*0.85);
    ki.mert=talFitPP();
    ki.kov=talAlapMind()._hat.taktika;
    /* egy special-os talizmán NEM kapja a Tiszta ×1,25-öt */
    _pakli([_lap("taktika","fit",2,0.5,"kameleon")]);
    ki.spec=talFitPP();
    /* a plafon: tíz legendás fit → 8 pp */
    _pakli(Array.from({length:10},()=>_lap("taktika","fit",4,1)));
    ki.plafon=talFitPP();
    /* a sorrend az ERŐ szerint dől el, nem a húzás szerint */
    _pakli([_lap("stab","hatas",1,0.5),_lap("stab","ar",4,0.5)]);
    ki.ar=talAlap("stab","ar");ki.hatas=talAlap("stab","hatas");
    return ki;});
  console.log("\n— 2. CSÖKKENŐ HOZAM ÉS PLAFON —");
  ok(Math.abs(h.mert-h.vart)<1e-9,"három talizmán erő szerint, 1 · 0,85 · 0,85² súllyal adódik",{vart:h.vart,mert:h.mert});
  ok(Math.abs(h.kov-Math.pow(0.85,3))<1e-9,"a következő talizmán hatékonysága 0,85³",h.kov);
  ok(Math.abs(h.spec-0.8*1.7)<1e-9,"special-os talizmán: nincs Tiszta-szorzó",h.spec);
  ok(h.plafon===8,"a plafon fog (Jobb illeszkedés: 8 pp)",h.plafon);
  ok(Math.abs(h.ar-5*4.2*1.25)<1e-9&&Math.abs(h.hatas-4*1.25*0.85)<1e-9,"a sorrend az erőé: a legendás ár-talizmán teljes, az átlagos hatás-talizmán 85%",h);

  /* ---- 3. A KAPASZKODÓK ---- */
  const k=await p.evaluate(async()=>{
    const ki={};
    const tk=Object.keys(TACTICS)[0];
    S.tal=null;_talAlapMemo=null;
    const alap={fit:tacticFit(tk),dev:devTempo(),qual:coachQual({type:"attr:gol",sz:60}),
      staff:staffPrice(70),slot:coachSlotPrice(4),ms:msCashReward(0.1),sp:msSpReward(40),star:starUnlockPrice(SKILLS[0])};
    /* egy-egy legendás talizmán minden változatból (dobás 0,5) */
    _pakli([_lap("stilus","fa",4),_lap("stilus","ms",4),_lap("taktika","fit",4),_lap("taktika","tanul",4),
      _lap("fejlodes","tempo",4),_lap("fejlodes","edzes",4),_lap("stab","hatas",4),_lap("stab","ar",4),
      _lap("igazolas","tiszta",4),_lap("igazolas","kedv",4),_lap("igazolas","licit",4),
      _lap("scout","lista",4),_lap("scout","kapu",4)]);
    ki.v=talAlapMind();
    const E=4.2*1.25;   /* a kategória ELSŐ talizmánja teljes, a második 85% */
    ki.fit={elotte:alap.fit,utana:tacticFit(tk),pp:talFitPP()};
    ki.dev={ar:devTempo()/alap.dev,m:talDevMult()};
    ki.qual={ar:coachQual({type:"attr:gol",sz:60})/alap.qual,m:talStabHatasMult()};
    ki.staff={ar:staffPrice(70)/alap.staff,m:talStabArMult()};
    ki.slot={elotte:alap.slot,utana:coachSlotPrice(4),m:talStabArMult()};
    ki.ms={ar:msCashReward(0.1)/alap.ms,sp:msSpReward(40)/alap.sp,m:talMsPremium()};
    ki.star={ar:starUnlockPrice(SKILLS[0])/alap.star,m:talStilusArMult()};
    /* a stílus-fa: a KIJELZETT és a LEVONT ár is kedvezményes */
    {
      S.style={key:"bombazok",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};S.style2=null;
      const t=styleTraitList("bombazok")[0];
      const W=msState();W.sp=100000;
      const lista=t.lv[0].price,kijelzett=styleTraitNextPrice(t);
      const r=styleBuyTrait(t.key);
      ki.fa={lista,kijelzett,levont:100000-W.sp,ok:r&&r.ok!==false,m:talStilusArMult()};}
    /* a begyakorlás: ugyanabból a szintből kétszer, talizmánnal és nélküle */
    {
      if(!S.tactics)S.tactics={active:tk,levels:{}};
      S.tactics.active=tk;S.tactics.levels[tk]=70;
      tacticTrainAfterMatch(2,0);const g1=S.tactics.levels[tk]-70;
      const reg=S.tal;S.tal=null;_talAlapMemo=null;
      /* a tempó is talizmán-függő: ugyanazt a devTempo-t kell adni mindkét ágon */
      S.tactics.levels[tk]=70;
      const _dt=devTempo;const dtVal=(()=>{S.tal=reg;_talAlapMemo=null;const v=devTempo();return v;})();
      S.tal=null;_talAlapMemo=null;
      devTempo=()=>dtVal;
      const _tf=tacticFit;const fitVal=(()=>{S.tal=reg;_talAlapMemo=null;const v=_tf(tk);S.tal=null;_talAlapMemo=null;return v;})();
      tacticFit=()=>fitVal;
      tacticTrainAfterMatch(2,0);const g0=S.tactics.levels[tk]-70;
      devTempo=_dt;tacticFit=_tf;S.tal=reg;_talAlapMemo=null;
      ki.tanul={g1,g0,ar:g1/g0,m:talTanulMult()};}
    /* a tárgyalás: VALÓDI twResolveSigning, rögzített dobással — a dobás a
       semleges tiszta sáv fölé esik, de a talizmánnal megnövelt alá */
    {
      const q=scoutQuality(scout);
      const cleanN=Math.max(0.10,Math.min(0.85,0.38+q*0.22));
      const cleanT=Math.max(0.10,Math.min(0.85,0.38+q*0.22+talTisztaShift()));
      const r0=(cleanN+cleanT)/2;
      const futtat=async()=>{
        let eredmeny=null;
        const _sr=twSigningResult;twSigningResult=(c,kind)=>{eredmeny=kind;};
        const _mr=Math.random;Math.random=()=>r0;
        const _cb=S.chDealBoost,_cm=S.chDealMalus;S.chDealBoost=0;S.chDealMalus=0;
        try{
          TW={busy:false,iv:null,searchMode:"pos"};
          $("twBody").innerHTML="<div>…</div>";
          twResolveSigning({n:"Próba Péter",ovr:70,pos:["CS"]},()=>{},()=>{},{});
          for(let i=0;i<60&&!eredmeny;i++)await new Promise(r=>setTimeout(r,50));
        }finally{Math.random=_mr;twSigningResult=_sr;S.chDealBoost=_cb;S.chDealMalus=_cm;}
        return eredmeny;};
      const vele=await futtat();
      const reg=S.tal;S.tal=null;_talAlapMemo=null;
      const nelkul=await futtat();
      S.tal=reg;_talAlapMemo=null;
      ki.targy={vele,nelkul,r0,cleanN,cleanT};}
    /* a licit: VALÓDI saleRollOffer, rögzített dobással — a kúp csúcsa feljebb */
    {
      /* egy valódi pool-játékos, POT-tal és korral — a fixtúra kézzel rakott
         kerettagjainak nincs kikiáltási ára */
      const e0=Object.values(careerPool).find(x=>x&&x.pot&&x.age&&x.pos);
      const pl=careerPlayerFromPoolEntry(e0);
      const _srp=saleRosterPlayer;saleRosterPlayer=()=>pl;
      const rec={n:pl.n,rejects:0};
      const _mr=Math.random;Math.random=()=>0.5;
      let a=null,b0=null;
      try{
        a=saleRollOffer(rec);
        const reg=S.tal;S.tal=null;_talAlapMemo=null;
        b0=saleRollOffer(rec);
        S.tal=reg;_talAlapMemo=null;
      }finally{Math.random=_mr;saleRosterPlayer=_srp;}
      ki.licit={vele:a&&a.amount,nelkul:b0&&b0.amount,shift:talLicitShift()};}
    /* a kedvezmény: seedelt, stabil, és nem adódik a kihívás-kedvezménnyel */
    {
      const nevek=Object.keys(careerPool).slice(0,400);
      let talal=0,stabil=true;
      nevek.forEach(nm=>{const a=talKedvTalal(nm),b2=talKedvTalal(nm);if(a!==b2)stabil=false;if(a)talal++;});
      const egy=nevek.find(nm=>talKedvTalal(nm));
      const e=careerPool[egy];
      const parts=buyDiscountParts(e).map(x=>x.k);
      S.buyDiscountChance=1;
      const parts2=buyDiscountParts(e).map(x=>x.k);
      S.buyDiscountChance=0;
      ki.kedv={arany:talal/nevek.length,p:talKedvP(),stabil,parts,parts2};}
    /* az akadémia köztes kapuja: idx%4===2, rögzített 0-s dobással */
    {
      const _mr=Math.random;Math.random=()=>0;
      const _ao=S.academy;
      let azonnal=null;
      const probal=()=>{let hivott=false;S.idx=6;
        try{tryAcademyOpportunity(()=>{hivott=true;});}catch(e){}
        return hivott;};
      try{
        const vele=probal();
        const reg=S.tal;S.tal=null;_talAlapMemo=null;
        const nelkul=probal();
        S.tal=reg;_talAlapMemo=null;
        azonnal={vele,nelkul};
      }finally{Math.random=_mr;S.academy=_ao;S.idx=5;
        try{$("scAcademy")&&$("scAcademy").classList.add("hide");}catch(e){}}
      ki.akad=azonnal;}
    return ki;});
  console.log("\n— 3. A KAPASZKODÓK —");
  const E=4.2*1.25;
  ok(Math.abs(k.fit.pp-0.8*E)<1e-9&&Math.abs((k.fit.utana-k.fit.elotte)-Math.min(k.fit.pp/100,1-k.fit.elotte))<1e-9,
     "Jobb illeszkedés: a tacticFit pontosan a pp-vel nő",k.fit);
  ok(Math.abs(k.dev.ar-k.dev.m)<1e-9&&Math.abs(k.dev.m-(1+2.5*E/100))<1e-9,"Gyorsabb érés: a devTempo a talizmán szorzójával nő",k.dev);
  ok(Math.abs(k.qual.ar-k.qual.m)<1e-9&&Math.abs(k.qual.m-(1+4*E/100))<1e-9,"Jobb szakemberek: a coachQual szorzója",k.qual);
  ok(Math.abs(k.staff.ar-k.staff.m)<0.002&&k.staff.m<1,"Olcsóbb stáb: a stábtag ára",k.staff);
  ok(k.slot.utana<k.slot.elotte&&Math.abs(k.slot.utana/k.slot.elotte-k.slot.m)<0.05,"Olcsóbb stáb: a stábhely ára (500-ra kerekítve)",k.slot);
  ok(Math.abs(k.ms.ar-k.ms.m)<0.02&&Math.abs(k.ms.sp-k.ms.m)<0.03,"Mérföldkő-prémium: a pénz és a stíluspont is",k.ms);
  ok(Math.abs(k.star.ar-k.star.m)<0.05,"Olcsóbb fa: a csillagozás-jog ára",k.star);
  ok(k.fa.ok&&k.fa.kijelzett<k.fa.lista&&k.fa.levont===k.fa.kijelzett,"Olcsóbb fa: a képesség kijelzett ÉS levont ára kedvezményes",k.fa);
  ok(Math.abs(k.tanul.ar-k.tanul.m)<1e-6&&k.tanul.m>1,"Gyorsabb tanulás: a valódi meccs utáni begyakorlás a szorzóval nő",k.tanul);
  ok(k.targy.vele==="clean"&&k.targy.nelkul!=="clean","Tiszta üzlet: ugyanaz a dobás a talizmánnal tiszta üzlet, nélküle nem (valódi tárgyalás)",k.targy);
  ok(k.licit.vele>k.licit.nelkul,"Licitfelhajtó: ugyanaz a dobás nagyobb licitet ad (valódi saleRollOffer)",k.licit);
  ok(k.kedv.stabil&&Math.abs(k.kedv.arany-k.kedv.p)<0.08,"Kedvezmény-szerencse: a találat seedelt és stabil, az aránya a talizmán esélye",k.kedv);
  ok(k.kedv.parts.indexOf("tal")>=0&&k.kedv.parts2.indexOf("tal")<0,"…és a kihívás-kedvezménnyel nem adódik össze",k.kedv);
  ok(k.akad&&k.akad.vele===false&&k.akad.nelkul===true,"Nyitott kapu: a köztes fordulóban a talizmánnal ajánlat indul, nélküle nem",k.akad);

  /* a két véletlenen múló, UI-mélyi kapaszkodó: a képlet bekötése */
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(/const _tm=\(\(S\.chTrainBoost\|\|0\)>0\?CH_TRAIN_BOOST_MULT:1\)\*talEdzesMult\(\);/.test(src),"Hatékony edzés: a tervezett edzés szorzója a talizmánt is viszi");
  ok(/:3\+\(\(\(\)=>\{const p=talScout4P\(\);return p>0&&Math\.random\(\)<p\?1:0;\}\)\(\)\);/.test(src),"Bővebb lista: a poszt-felderítés jelöltszáma 3 + talizmán-dobás");

  /* ---- 4. A FELÜLET ---- */
  const u=await p.evaluate(()=>{
    const ki={};
    _pakli([_lap("taktika","fit",3,0.5),_lap("taktika","fit",1,0.5),_lap("bank","bevetel",2,0.5)]);
    talMenuOpen();
    ki.blokk=$("talHatas").textContent;
    ki.lapok=[...document.querySelectorAll("#talGrid .talStat")].map(x=>x.textContent);
    talMenuClose();
    return ki;});
  console.log("\n— 4. A FELÜLET —");
  ok(/Aktív alaphatások/.test(u.blokk)&&/taktika-illeszkedés/.test(u.blokk)&&/plafon 8 pp/.test(u.blokk)&&/72%-ot ér/.test(u.blokk)&&!/NaN/.test(u.blokk)&&!/Jobb üzletmenet/.test(u.blokk),
     "a menü kiírja az aktív hatást, a plafont és a következő talizmán hatékonyságát — a még nem ható Bankot nem",u.blokk);
  ok(u.lapok.filter(t=>/⚡/.test(t)).length===2&&u.lapok.filter(t=>/⏳/.test(t)).length===1,"a lapon ⚡ jelzi, ha az alaphatás él (Bank: még ⏳)",u.lapok);

  /* ---- 5. A JOKER ESEMÉNYCSOMAGJA ---- */
  const j=await p.evaluate(()=>{
    const ki={};
    S.tal=null;const T=talState();
    const rnd=talRng("csomag-proba");
    let jo2rossz1=0,kulonbozo=0;
    for(let i=0;i<200;i++){
      const c=talCsomagDob(rnd);
      const jo=c.filter(id=>TAL_ESEMENY_BY[id].jo).length;
      if(c.length===3&&jo===2)jo2rossz1++;
      if(new Set(c).size===c.length)kulonbozo++;}
    ki.jo2rossz1=jo2rossz1;ki.kulonbozo=kulonbozo;
    /* a lapon látszik, és a választás a paklihoz adja */
    const L=talUjLap(talRng("csomag-lap"),"joker",3,{tiszta:true});
    L.valt="csomag";L.csomag=talCsomagDob(talRng("csomag-lap2"));
    ki.szoveg=talAlapSzoveg(L);
    T.varo=[{id:"cs-1",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[L,talUjLap(rnd,"bank",1),talUjLap(rnd,"scout",1)]}];
    talValaszt(0);
    ki.pakli=Object.keys(T.esemenyek);
    ki.egyezik=JSON.stringify(ki.pakli.slice().sort())===JSON.stringify(L.csomag.slice().sort());
    /* ami már bent van, nem jön újra */
    let ujra=0;for(let i=0;i<100;i++)talCsomagDob(rnd).forEach(id=>{if(T.esemenyek[id])ujra++;});
    ki.ujra=ujra;
    ki.szam={jo:TAL_ESEMENY.filter(e=>e.jo).length,rossz:TAL_ESEMENY.filter(e=>!e.jo).length};
    ki.specDb=TAL_SPEC.length;
    return ki;});
  console.log("\n— 5. A JOKER ESEMÉNYCSOMAGJA —");
  ok(j.jo2rossz1===200&&j.kulonbozo===200,"minden csomag 2 jó és 1 rossz, ismétlés nélkül",j);
  ok(/📦/.test(j.szoveg)&&(j.szoveg.match(/✦/g)||[]).length===2&&(j.szoveg.match(/✖/g)||[]).length===1,"a csomag tartalma a lapon látszik",j.szoveg);
  ok(j.egyezik&&j.pakli.length===3,"a választás a három eseményt a paklihoz adja",j.pakli);
  ok(j.ujra===0,"ami már a pakliban van, nem jön újra csomagban",j.ujra);
  ok(j.szam.jo>=9&&j.szam.rossz>=7&&j.specDb>=80,"a tár: legalább 9 jó és 7 rossz esemény, 80+ special",{...j.szam,spec:j.specDb});

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
