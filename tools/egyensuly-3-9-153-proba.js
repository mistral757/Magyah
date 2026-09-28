/* ⚖️ 3.9.153 — EGYENSÚLY ÉS JUTALMAK, EGY KÖTEGBEN.

   A felhasználó listájából (idézve):
     · „Nem jó a nehézség belövés D0-tól kezdve. Én 180-as meccs erőn vagyok.
       Nekik 178-ason kellene lenniük… az első D0 szezonon 30-0 lett."
     · „Csapategyensúlyért kapható meccserő bónusz scalelődjön 100as nyers
       csapaterő fölött 10esével (nyers csapaterő) 1 teljes meccserőnyit
       emelkedjen a max elérhető meccserő boost"
     · „Béke és harmónia: minél több ismert pozícióval rendelkező játékosokért
       stíluspont. Olcsóbb és gyorsabb a pozíció tanulás — erre legyen
       képessége a béke és harmóniának"
     · „Egy kategóriában összegyűjt X db talizmán, az is adjon stack jutalmat,
       erősítést"
     · „Legyen kevésbé POT alapú a játékosok ára… És jobban kell igazítani
       az ifisek POT értékeit az aktuális átlag POThoz az ő ratingjukon."
     · „Nyári kupa nehézségi szintjét hangolni, ott még nem működik jól."

   Amit mér:
     1. A MECCS-ERŐ A MOTOR TÜKRE: a helyi meccs-erő (teamMatchStrength) és a
        motor pillanatképéből számolt (snapMatchStrength) ugyanaz — a
        csapategyensúly, a stílus csapaterő-tagja és gólszorzói, a párkémia
        is benne van mindkettőben; egy stílus-képesség pontosan annyit mozdít
        rajta, amennyit a motorban;
     2. az egyensúly-plafon 100 fölött 10-esével +1 (110 → 3, 180 → 10), és a
        bónusz ebből a plafonból számol;
     3. SOKOLDALÚ KÉPZÉS: az ár és a meccsigény a szinttel csökken, a
        beszokás is gyorsul, és a már futó tanulás is azonnal rövidül;
     4. a harmónia három új mérföldkő-családja a keret poszt-tudását méri, és
        a 11 posztos lépcső nem nyúlik Infinityben;
     5. SZÍNHŰSÉG: 3/5/8 talizmán egy kategóriában ×1,10/×1,20/×1,35 az
        alaphatáson (a plafon előtt), és az új fokozat kimondja magát;
     6. AZ ÁR: a bejelentett pár megfordul (a 18 éves 143-as ér többet), a
        fiatal tehetség ára nem mozdul, a kifutotté enyhén a Rating felé húz;
        az ifi POT-ja a Ratingjéhez zárkózik, a csúcsa marad;
     7. NYÁRI KUPA: a mezőny a pályán a meccs-erőd mínusz egy — közös tornán
        a nehezebb célérték, régi kliensnél a régi szabály;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9191;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e+1e-9;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof snapMatchStrength==="function"&&typeof balanceMaxOvr==="function",null,{timeout:15000});

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
    if(!scout)scout=generateScout();
    phase="season";S.seasonNumber=3;S.idx=5;S.transferBudget=5e9;S.morale=70;
    S.subs={};
    addLine=()=>{};saveGame=()=>{};});

  /* ---- 1. A MECCS-ERŐ A MOTOR TÜKRE ---- */
  const m=await p.evaluate(()=>{
    const ki={};
    const r1=x=>Math.round(x*100)/100;
    /* a napi forma (gi/bi) ±SIM.FORM kioltja egymást; a tartós forma semleges */
    const snapMs=()=>{const sn=buildMatchSnapshot();return snapMatchStrength(sn);};
    const base=()=>{
      const t=[];for(let i=0;i<5;i++)t.push(snapMs());
      return {live:r1(teamMatchStrength()),snap:r1(t.reduce((a,b)=>a+b,0)/t.length)};};
    S.style=null;S.style2=null;
    ki.ures=base();
    /* stílus: harmónia (csapaterő-tag) + beton (gólszorzó) */
    S.style={key:"harmonia",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};
    S.style2={key:"beton",chosenSeason:2,traits:{},ms:{done:{},seen:{},t:{}}};
    const a0=teamMatchStrength();
    S.style2.traits.zart_kapu=3;
    const a1=teamMatchStrength();
    ki.zartKapu={delta:r1(a1-a0),vart:r1(0.5*(-Math.log(0.86))/SIM.K),mult:styleOppGoalMult()};
    /* egy feltétel nélküli csapaterő-tag: a Tiki-Taka nélkül a legegyszerűbb
       a „Nincs gyenge láncszem" — a feltétele az egyensúly 80 fölött */
    const bal=teamBalance();
    ki.balOk=bal.ok;ki.balBonus=r1(bal.bonus);
    const h0=hiddenMatchBonus();
    /* a feltételét (kezdő 11 szórása 5 alatt) kényszerítjük — a mérés tárgya a bekötés */
    const _sp=stXISpread;window.stXISpread=()=>3;
    const h0b=hiddenMatchBonus();
    S.style.traits.gepezet_mukodik=3;
    const h1=hiddenMatchBonus();
    window.stXISpread=_sp;
    ki.gepezet={delta:r1(h1-h0b),vart:3.5};
    /* az egyensúly-bónusz benne van */
    ki.balBenne=(()=>{const x=teamBalanceBonus();
      const orig=teamBalanceBonus;window.teamBalanceBonus=()=>0;
      const nelkul=hiddenMatchBonus();window.teamBalanceBonus=orig;
      return {x:r1(x),kul:r1(hiddenMatchBonus()-nelkul)};})();
    ki.stilussal=base();
    /* párkémia a pályán: egy kész pár +3% saját λ */
    const n=slots.filter(s=>s.player).map(s=>s.player.n);
    const c0=teamMatchStrength();
    S.chemPairs=S.chemPairs||{};
    S.chemPairs["proba|pár"]={a:n[1],b:n[2],stages:CHEM_PAIR_NEED};
    ki.chem={delta:r1(teamMatchStrength()-c0),vart:r1(0.5*Math.log(1.03)/SIM.K)};
    ki.kemiaval=base();
    /* a párharc két ⚡-je ugyanebből a képletből */
    ki.duel=snapMatchStrength({ovr:96.1,tacticEffect:1.9});
    ki.duelMult=snapMatchStrength({ovr:90,tacticEffect:0,oppGoalMult:0.86,ownGoalMult:1.1});
    ki.duelMultVart=r1(90+0.5*(Math.log(1.1)-Math.log(0.86))/SIM.K);
    delete S.chemPairs["proba|pár"];
    S.style=null;S.style2=null;
    return ki;});
  console.log("— 1. A MECCS-ERŐ A MOTOR TÜKRE —");
  ok(kozel(m.ures.live,m.ures.snap,0.3),"stílus nélkül a helyi meccs-erő = a motor pillanatképe",m.ures);
  ok(kozel(m.zartKapu.delta,m.zartKapu.vart,0.02),"a Zárt kapu (−14% ellenfél-gól) fél súllyal, ln(m)/K-val jön be",m.zartKapu);
  ok(kozel(m.gepezet.delta,m.gepezet.vart,0.02),"a stílus csapaterő-tagja (A gépezet) pontosan annyit ad, mint a motorban",m.gepezet);
  ok(m.balOk&&kozel(m.balBenne.kul,m.balBenne.x,0.02)&&m.balBenne.x>0,"a csapategyensúly-bónusz benne van a meccs-erőben",m.balBenne);
  ok(kozel(m.stilussal.live,m.stilussal.snap,0.3),"stílussal is: helyi = pillanatkép",m.stilussal);
  ok(kozel(m.chem.delta,m.chem.vart,0.02),"egy kész párkémia a pályán +3% saját λ-t ér a meccs-erőben is",m.chem);
  ok(kozel(m.kemiaval.live,m.kemiaval.snap,0.3),"kémiával is: helyi = pillanatkép",m.kemiaval);
  ok(m.duel===98&&kozel(m.duelMult,m.duelMultVart,0.06),"a párharc ⚡-je a régi mezőkkel változatlan, a szorzókkal a közös képletből",{d:m.duel,m:m.duelMult,v:m.duelMultVart});

  /* ---- 2. AZ EGYENSÚLY-PLAFON ---- */
  const e=await p.evaluate(()=>{
    const r=[95,100,109.9,110,150,179.9,180].map(x=>balanceMaxOvr(x));
    const b=teamBalance();
    return {r,maxOvr:b.maxOvr,raw:teamStrength(),bonus:b.bonus,score:b.score,
      panel:(()=>{try{return balanceBlockHtml?"":"";}catch(e){return "";}})()};});
  console.log("\n— 2. AZ EGYENSÚLY-PLAFON —");
  ok(JSON.stringify(e.r)===JSON.stringify([2,2,2,3,7,9,10]),"100 fölött 10 nyers csapaterőnként +1 (110 → 3, 150 → 7, 180 → 10)",e.r);
  ok(kozel(e.bonus,e.maxOvr*e.score,1e-6)&&e.maxOvr===Math.max(2,2+Math.floor((e.raw-100)/10)),"a bónusz a keret plafonjából számol",e);

  /* ---- 3. SOKOLDALÚ KÉPZÉS ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    const e=careerPool[slots[3].player.n];
    S.style=null;S.style2=null;
    ki.ar0=posLearnCost(e);ki.m0=posLearnMatchesNeeded(e);ki.d0=posDriftMatchesNeeded(e);
    e.posLearning={target:"CS",needed:ki.m0,progress:7,startedSeason:3};
    S.style={key:"harmonia",chosenSeason:1,traits:{sokoldalu_kepzes:1},ms:{done:{},seen:{},t:{}}};
    ki.ar1=posLearnCost(e);ki.m1=posLearnMatchesNeeded(e);
    S.style.traits.sokoldalu_kepzes=3;
    ki.ar3=posLearnCost(e);ki.m3=posLearnMatchesNeeded(e);ki.d3=posDriftMatchesNeeded(e);
    /* a futó tanulás (12-re indult, 7-nél tart) a következő meccsel kész */
    ki.most=posLearnNeededNow(e);
    const pos0=e.pos.slice();
    stepPosLearning(e,0,1);
    ki.kesz=!e.posLearning&&e.pos[0]==="CS";
    e.pos=pos0;
    ki.trait=(STYLE_TRAITS.harmonia||[]).some(t=>t.key==="sokoldalu_kepzes"&&t.tier===1);
    S.style=null;
    return ki;});
  console.log("\n— 3. SOKOLDALÚ KÉPZÉS —");
  ok(k.trait,"a Béke és harmónia fáján ott az I. sávos „Sokoldalú képzés”");
  ok(k.m1===Math.round(k.m0*0.8)&&k.m3===Math.round(k.m0*0.5)&&k.d0===k.m0*3&&k.d3===k.m3*3,
     "a meccsigény −20% / −50% (a tempó-beállítás szerinti bázisról), a beszokás ugyanennyivel",k);
  ok(Math.abs(k.ar1-k.ar0*0.75)<=100&&Math.abs(k.ar3-k.ar0*0.45)<=100,"az ár −25% / −55% (százasra kerekítve)",{a0:k.ar0,a1:k.ar1,a3:k.ar3});
  ok(k.most===k.m3&&k.kesz,`a már futó tanulás is rövidül — 7/${k.m0} után a következő meccsel kész`,{most:k.most,kesz:k.kesz});

  /* ---- 4. A POSZT-TUDÁS MÉRFÖLDKÖVEI ---- */
  const t=await p.evaluate(()=>{
    const ki={};
    const L=STYLE_MILESTONES.harmonia||[];
    ki.fam=["hm_versN","hm_posMax","hm_posSum"].map(f=>L.filter(d=>d.fam===f).map(d=>d.n));
    ki.skip=ST_INF_SKIP.indexOf("hm_posMax")>=0;
    const R=msRoster();
    const mentes=R.map(p=>{const e=careerPool[p.n];return e?e.pos.slice():null;});
    ki.v0=stVersatileCount(3);ki.mx0=stPosMax();ki.s0=stPosExtraSum();
    const ALL=["KP","JV","BV","KV","VKP","KKP","TKP","JSZ","BSZ","CS","ÁÉ"];
    const e0=careerPool[R[0].n],e1=careerPool[R[1].n];
    const l0=e0.pos.length,l1=e1.pos.length;
    ki.vVart=ki.v0+(l0<3?1:0)+(l1<3?1:0);
    ki.sVart=ki.s0-(l0-1)-(l1-1)+10+2;
    e0.pos=ALL.slice();
    e1.pos=[e1.pos[0]].concat(ALL.filter(x=>x!==e1.pos[0]).slice(0,2));
    ki.v1=stVersatileCount(3);ki.mx1=stPosMax();ki.s1=stPosExtraSum();
    const d=L.find(x=>x.id==="hm_posMax_11");
    ki.mindenes=d?d.p()>=d.n:false;
    R.forEach((p,i)=>{if(mentes[i])careerPool[p.n].pos=mentes[i];});
    ki.txt=d?d.d:"";
    return ki;});
  console.log("\n— 4. A POSZT-TUDÁS MÉRFÖLDKÖVEI —");
  ok(JSON.stringify(t.fam)===JSON.stringify([[1,2,3,5,7,10],[4,5,6,8,11],[10,15,20,30,40,55]]),"három új család a harmónia tábláján",t.fam);
  ok(t.v1===t.vVart&&t.s1===t.sVart,"a mérők a keret pos-listáiból számolnak (sokoldalúak, megtanult posztok)",t);
  ok(t.mx1===11&&t.mindenes&&/mind a 11/.test(t.txt),"a „Mindenes” (11 poszt) teljesül, ha valaki mindet tudja",{mx:t.mx1,txt:t.txt});
  ok(t.skip,"a 11 posztos lépcső nem nyúlik Infinityben (nincs 12. poszt)");

  /* ---- 5. SZÍNHŰSÉG ---- */
  const s=await p.evaluate(()=>{
    const ki={};
    const sorok=[];addLine=(x)=>{sorok.push(String(x));};
    S.talOff=false;S.tal=null;_talAlapMemo=null;
    const T=talState();
    const lap=(r)=>({kat:"scout",valt:"lista",rang:r,dobas:0.5,spec:null,uid:++T.seq});
    const E=L=>talLapE(L);
    T.lapok=[lap(1),lap(1)];_talAlapMemo=null;
    const v2=talAlap("scout","lista");
    const kezzel=(n)=>{let x=0;for(let i=0;i<n;i++)x+=E(lap(1))*Math.pow(TAL_HOZAM,i);return x*12;};
    ki.ket={v:v2,vart:kezzel(2)};
    /* a harmadik a húzáson át: a bejelentés is */
    T.varo=[{id:"proba",forras:"ms",szezon:3,fordulo:5,kinalat:[lap(1),{kat:"bank",valt:"bevetel",rang:1,dobas:0.5},{kat:"stab",valt:"hatas",rang:1,dobas:0.5}]}];
    talValaszt(0);_talAlapMemo=null;
    ki.harom={v:talAlap("scout","lista"),vart:kezzel(3)*1.10};
    ki.bejel=sorok.filter(x=>/SZÍNHŰSÉG/.test(x));
    T.lapok.push(lap(1),lap(1));_talAlapMemo=null;
    ki.ot={v:talAlap("scout","lista"),vart:kezzel(5)*1.20};
    T.lapok.push(lap(1),lap(1),lap(1));_talAlapMemo=null;
    ki.nyolc={v:talAlap("scout","lista"),vart:Math.min(100,kezzel(8)*1.35)};
    ki.fok=[2,3,4,5,7,8,20].map(talStackFok);
    ki.txt=[talStackTxt(1.1),talStackTxt(1.35)];
    /* a menü kimondja */
    try{talMenuRender();ki.menu=/Színhűség/.test($("talHatas").innerHTML)&&/🔗/.test($("talLegend").innerHTML);}catch(e){ki.menu=String(e);}
    S.tal=null;_talAlapMemo=null;
    return ki;});
  console.log("\n— 5. SZÍNHŰSÉG —");
  ok(kozel(s.ket.v,s.ket.vart,1e-6),"két lap: nincs szorzó",s.ket);
  ok(kozel(s.harom.v,s.harom.vart,1e-6),"három lap egy színben: ×1,10",s.harom);
  ok(s.bejel.length===1&&/×1,1/.test(s.bejel[0]),"az új fokozat kimondja magát a naplóban",s.bejel);
  ok(kozel(s.ot.v,s.ot.vart,1e-6)&&kozel(s.nyolc.v,s.nyolc.vart,1e-6),"öt lap ×1,20, nyolc ×1,35 (a plafon előtt)",{ot:s.ot,nyolc:s.nyolc});
  ok(JSON.stringify(s.fok)===JSON.stringify([0,1,1,2,2,3,3])&&s.txt[0]==="1,1"&&s.txt[1]==="1,35","a fokozatok és a kiírás",{f:s.fok,t:s.txt});
  ok(s.menu===true,"a Talizmánok menü mutatja (jelvény + sor)",s.menu);

  /* ---- 6. AZ ÁR ÉS AZ IFI POT-JA ---- */
  const a=await p.evaluate(()=>{
    const ki={};
    const regi=e=>Math.round(Math.round(e.pot*1.2*ageValueMultiplier(e.age)*upsideMultiplier(e))*starValueMult(e.pot));
    const ifi={n:"Próba Ifi",pot:11000,age:18,startRating:143,peak:152};
    const vet={n:"Próba Veterán",pot:43000,age:31,startRating:144,peak:144};
    ki.regi={ifi:regi(ifi),vet:regi(vet)};
    ki.uj={ifi:marketValue(ifi),vet:marketValue(vet)};
    ki.rp143=peakToPot(143);
    /* a korai karrier: egy fiatal tehetség ára nem mozdul, a kifutotté enyhén */
    const tehetseg={pot:2600,age:20,startRating:74,peak:86};
    const kifutott={pot:1700,age:30,startRating:80,peak:80};
    ki.tehetseg={regi:regi(tehetseg),uj:marketValue(tehetseg)};
    ki.kifutott={regi:regi(kifutott),uj:marketValue(kifutott)};
    /* a POT felzárkózása: csak ≤23, csak fölfelé, a csúcshoz nem nyúl */
    const e1={n:"x",pot:11000,basePot:9000,age:18,startRating:143,peak:152};
    const d1=youthPotAlign(e1);
    const e2={n:"y",pot:11000,age:24,startRating:143,peak:152};
    const d2=youthPotAlign(e2);
    const e3={n:"z",pot:60000,age:19,startRating:143,peak:160};
    const d3=youthPotAlign(e3);
    ki.igazit={d1,pot1:e1.pot,base1:e1.basePot,peak1:e1.peak,d2,pot2:e2.pot,d3,pot3:e3.pot};
    return ki;});
  console.log("\n— 6. AZ ÁR ÉS AZ IFI POT-JA —");
  ok(a.regi.vet/a.regi.ifi>8&&a.uj.ifi>a.uj.vet,"a bejelentett pár: régen a veterán sokszorosa volt, most a 18 éves ér többet",{regi:a.regi,uj:a.uj});
  ok(a.tehetseg.uj===a.tehetseg.regi,"a fiatal tehetség (POT a Ratingje fölött) ára változatlan",a.tehetseg);
  ok(a.kifutott.uj<a.kifutott.regi&&a.kifutott.uj>a.kifutott.regi*0.85,"a kifutott ember ára enyhén a Ratingje felé húz",a.kifutott);
  ok(a.igazit.pot1===a.rp143&&a.igazit.base1===a.rp143&&a.igazit.peak1===152&&a.igazit.d1>0,"a 18 éves POT-ja a Ratingjéhez zárkózik (a csúcs marad)",a.igazit);
  ok(a.igazit.d2===0&&a.igazit.pot2===11000&&a.igazit.d3===0&&a.igazit.pot3===60000,"24 évesnél, illetve már magasabb POT-nál nem nyúl hozzá",a.igazit);

  /* ---- 7. A NYÁRI KUPA MEZŐNYE ---- */
  const n=await p.evaluate(()=>{
    const ki={};
    S.oppBuffH=null;
    const hb=seasonHiddenBonus();
    const ms=nykRatedMs();
    ki.mid=euroMidRating("NYK");
    ki.vart=Math.round(ms-1-Math.max(0,hb)*OPP_BUFF_MEASURED);
    ki.palyan=Math.round((ki.mid+Math.max(0,hb)*OPP_BUFF_MEASURED)*10)/10;
    ki.ms=Math.round(ms*10)/10;ki.hb=hb;
    ki.kozos=mpNykSharedMid(80,82,{ms:120,hb:20},{ms:118,hb:10});
    ki.kozosRegi=mpNykSharedMid(80,82,{},{ms:118,hb:10});
    return ki;});
  console.log("\n— 7. A NYÁRI KUPA MEZŐNYE —");
  ok(n.mid===n.vart&&Math.abs(n.palyan-(n.ms-1))<=0.6,"a mezőny a pályán a meccs-erőd mínusz egy (a névleges átlag + a rejtett fele)",n);
  ok(n.kozos===Math.max(Math.round(120-1-10),Math.round(118-1-5))&&n.kozosRegi===81,"közös tornán a nehezebb célérték; régi kliensnél a nyers −1",{k:n.kozos,r:n.kozosRegi});

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
