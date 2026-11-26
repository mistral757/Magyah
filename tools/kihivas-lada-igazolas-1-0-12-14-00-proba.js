/* 🏆 1.0.12.14.00 — A KIHÍVÁS-JUTALMAK MEGÚJÍTÁSA, LEGENDÁS LÁDA, IGAZOLÁS-JELENET
   KIMONDOTT KÉRÉS: „Semmilyen jutalmak közül csak ezt vedd ki: kapus formapont, ifieladhatóság […] Plusz a
   ládákba tegyünk a két legritkább szintbe legendás játékos igazolási lehetőségeket is […] És mostantól minden
   igazolásnál ez legyen az animációs jelenet. Legyen menő!"
   Amit mér:
     1. a kalapból kikerült: gkFormUp, youthSellable (jutalom), losePlayer, bidMalus (büntetés); bent az új 9;
     2. a freePlayer gyakoribb; a nehéz kihívás jutalma 3-ból 2 (choose2), a választó ablak 2 jutalmat fizet;
     3. a büntetés súlya a sávot követi (könnyűnél nincs 2-es/3-as súlyú);
     4. a küszöb-jutalom: 500 → max 200, a kapu (saleBlockReason) is ezt nézi;
     5. staffHalf (coachQual fele), skillPause (10 meccs után visszatér), trainSecFreeze 10 meccs;
     6. a Kihívás-előnyök a Menedzsmentben listáz;
     7. láda: ár ×0,71, valuta ×1,41, kulcs ingyen nyit; legenda-esély a nehézséggel csökken, a legenda
        kártyával és skillel jön, és a pörgetés után a jelenet szól;
     8. az igazolás-jelenet minden igazolásnál (markArrived) megjelenik, Ratinggel és POT-tal, NaN nélkül;
     9. a jegyzetek: a 3. lecke kapitánnyal és 3 góllal, gólpassz-/piac-/talizmán-feladat, a menü
        azonnal frissül, a tempó „Hol?” a Vissza gombon át vezet, a figura feje nem csúszik a gallér alá;
    10. nincs oldalhiba.  KEP=1 → képek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9631;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben, vágjunk|Ne mutass több/.test(x.textContent)).forEach(x=>x.click());});await p.waitForTimeout(600);
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
  const KEPDIR=process.env.KEPDIR||"/tmp/kli";if(process.env.KEP)fs.mkdirSync(KEPDIR,{recursive:true});

  /* 1–3. A KALAP */
  const r1=await p.evaluate(()=>{
    const o={rew:{},pun:{easy:{},medium:{},hard:{}},choose:0,choOk:0,hardN:0};
    for(let i=0;i<500;i++){for(const sc of ["short","long","cup"])for(const d of ["easy","medium","hard"]){
      const r=genReward(sc,d,challengeContext());o.rew[r.kind]=(o.rew[r.kind]||0)+1;
      const q=genPunishment(sc,d,challengeContext());o.pun[d][q.kind]=(o.pun[d][q.kind]||0)+1;}}
    for(let i=0;i<60;i++){const h=chHardJutalom("long","hard",challengeContext());o.hardN++;
      if(h.kind==="choose2"){o.choose++;const ks=new Set(h.opts.map(x=>x.kind+(x.boost||"")));if(h.opts.length===3&&ks.size===3&&/3 jutalomból 2/.test(h.desc))o.choOk++;}}
    o.target=CH_PASS_TARGET.hard;
    return o;});
  ok(!r1.rew.gkFormUp&&!r1.rew.youthSellable,"a kapus-formapont és az ifi-eladhatóság nincs a kalapban",{gk:r1.rew.gkFormUp,y:r1.rew.youthSellable});
  const P=Object.assign({},r1.pun.easy,r1.pun.medium,r1.pun.hard);
  ok(!P.losePlayer&&!P.bidMalus&&!P.staffLeaves&&!P.loseSkill,"a játékos-vesztés, a licit-, stáb- és skill-vesztés nincs a büntetések közt",{lp:P.losePlayer,bm:P.bidMalus});
  const uj=["moraleCel","sellMinDown","ladaKulcs","staffFree","edzoXp","szinPont","skillStar","chemStep","ifiAkXp"];
  ok(["moraleCel","sellMinDown","ladaKulcs","staffFree","edzoXp"].every(k=>r1.rew[k]>0),"az új jutalmak megjelennek",uj.map(k=>k+":"+(r1.rew[k]||0)));
  ok(r1.rew.freePlayer>r1.rew.salaryUp*2,"az ingyen igazolás többszörösen gyakoribb",{fp:r1.rew.freePlayer,sal:r1.rew.salaryUp});
  ok(r1.choose===r1.hardN&&r1.choOk===r1.choose,"a nehéz jutalom: 3 különböző, ebből 2",{n:r1.hardN,c:r1.choose,ok:r1.choOk});
  ok(r1.target===0.33,"a nehéz cél 33%",r1.target);
  const sulyos=["lockTransfers","benchLock","potBlock","skillPause","staffHalf","scoutDown","agencyDown","loseStylePerk","salaryCut","freezeAcademy"];
  ok(sulyos.every(k=>!r1.pun.easy[k]),"könnyű kihívásnál nincs idényes/súlyos büntetés",Object.keys(r1.pun.easy));
  ok(["loseStylePerk","salaryCut","freezeAcademy"].every(k=>!r1.pun.medium[k])&&r1.pun.medium.potBlock>0,"közepesnél nincs 3-as súlyú, 2-es van",Object.keys(r1.pun.medium));
  ok(r1.pun.hard.salaryCut>0&&r1.pun.hard.staffHalf>0&&r1.pun.hard.skillPause>0,"nehéznél a súlyosak és az új enyhítettek is jönnek",{sc:r1.pun.hard.salaryCut,sh:r1.pun.hard.staffHalf,sp:r1.pun.hard.skillPause});

  /* 4–5. KIFIZETÉSEK */
  const r2=await p.evaluate(()=>{
    const o={};
    o.min0=saleMinPerc();
    applyChallengeReward({kind:"sellMinDown",amount:200});o.min1=saleMinPerc();
    applyChallengeReward({kind:"sellMinDown",amount:200});o.min2=saleMinPerc();
    const pl=fullCareerRoster().filter(Boolean)[3];
    try{const q=saleBlockReason?saleBlockReason(pl):null;o.blk=q;}catch(e){o.blk=String(e);}
    o.yMin=chYouthSellMin("valaki");
    /* morál-cél */
    o.mc=applyChallengeReward({kind:"moraleCel",amount:5});o.mcv=chMoralCelV();
    applyChallengeReward({kind:"moraleCel",amount:5});applyChallengeReward({kind:"moraleCel",amount:5});applyChallengeReward({kind:"moraleCel",amount:5});o.mcCap=chMoralCelV();
    /* stáb fele */
    const L=staff();if(!L.length){const of=staffMakeOffer({lo:50,hi:60},Math.random,new Set(),null);hireCoach(staffOfferToCoach(of));}
    const c=staff()[0];const q0=coachQual(c);
    o.sh=applyChallengePunishment({kind:"staffHalf"});const q1=coachQual(staff().reduce((a,x)=>(x.sz||0)<(a.sz||0)?x:a));
    o.qArany=Math.round(q1/coachQual(Object.assign({},c,{n:"__mas__"}))*100)/100;o.q0=q0;
    /* skill szünet */
    const n=slots[5].player.n;S.skills[n]=[{skill:SKILLS[0],stagesNeeded:1,stagesCompleted:1}];
    const db0=Object.values(S.skills).reduce((s,a)=>s+a.length,0);
    o.sp=applyChallengePunishment({kind:"skillPause"});
    const db1=Object.values(S.skills).reduce((s,a)=>s+a.length,0);
    for(let i=0;i<10;i++)chModifierTick();
    const db2=Object.values(S.skills).reduce((s,a)=>s+a.length,0);
    o.skill=[db0,db1,db2,!!S.chSkillPause];
    /* másodlagos edzés */
    o.tf=applyChallengePunishment({kind:"trainSecFreeze"});const f0=chTrainSecFrozen();
    for(let i=0;i<10;i++)chModifierTick();o.tfz=[f0,chTrainSecFrozen()];
    /* ingyen stáb */
    applyChallengeReward({kind:"staffFree"});o.sf=staffMarketAr({price:12345});
    /* edző-XP, kulcs, csillag */
    const x0=edzoAll().xp||0;applyChallengeReward({kind:"edzoXp",amount:60});o.ex=(edzoAll().xp||0)-x0;
    o.lk=applyChallengeReward({kind:"ladaKulcs",lada:"kupa"});o.lkN=lada().kulcs.kupa;
    S.skills[n].forEach(i=>i.stars=0);if(!S.skills[n].length)S.skills[n]=[{skill:SKILLS[0],stagesNeeded:1,stagesCompleted:1}];
    o.st=applyChallengeReward({kind:"skillStar"});
    o.pot=genReward("long","medium",challengeContext());
    for(let i=0;i<40&&o.pot.kind!=="pot";i++)o.pot=genReward("long","medium",challengeContext());
    return o;});
  ok(r2.min0===500&&r2.min1===300&&r2.min2===200,"a küszöb 500 → 300 → 200 (a plafon 300)",[r2.min0,r2.min1,r2.min2]);
  ok(r2.yMin===200,"a kapu-függvény az új küszöbet adja",r2.yMin);
  ok(r2.mcv===5&&r2.mcCap===15,"a morál-cél +5, idényenként legfeljebb +15",[r2.mcv,r2.mcCap,r2.mc]);
  ok(r2.qArany===0.5,"a fél hatású stábtag coachQual-ja a fele",[r2.qArany,r2.sh]);
  ok(r2.skill[1]===r2.skill[0]-1&&r2.skill[2]===r2.skill[0]&&!r2.skill[3],"a szünetelő skill 10 meccs után visszatér",[r2.skill,r2.sp]);
  ok(r2.tfz[0]&&!r2.tfz[1],"a másodlagos edzés 10 meccsre fagy",[r2.tfz,r2.tf]);
  ok(r2.sf===0,"az ingyen stáb-token 0 Ft-ra viszi a stábpiaci árat");
  ok(r2.ex===60,"edző-XP +60",r2.ex);
  ok(r2.lkN===1,"a ládakulcs bekerül",r2.lk);
  ok(/★/.test(r2.st),"a képesség-csillag +1 csillag",r2.st);
  ok(r2.pot.kind==="pot"&&/Rating a csúcson/.test(r2.pot.desc)||r2.pot.kind!=="pot","a POT-jutalom a várható Ratinget is mutatja",r2.pot.desc);

  /* 2b. a választó ablak */
  const r3=await p.evaluate(async()=>{
    const opts=[{kind:"money",amount:1000,desc:"+1000"},{kind:"staffFree",desc:"stáb"},{kind:"edzoXp",amount:10,desc:"xp"}];
    const b0=S.transferBudget||0,s0=S.chStaffFree||0;
    applyChallengeReward({kind:"choose2",opts});
    await new Promise(r=>setTimeout(r,1300));
    const ov=document.getElementById("chValaszt");if(!ov)return {nincs:true};
    const bs=ov.querySelectorAll(".chvOpt");bs[0].click();
    ov.querySelectorAll(".chvOpt")[1].click();
    const ok1=!ov.querySelector(".chvOk").disabled;
    ov.querySelector(".chvOk").click();
    return {ok1,van:!!document.getElementById("chValaszt"),db:(S.transferBudget||0)-b0,sf:(S.chStaffFree||0)-s0,q:(S.chValaszt||[]).length};});
  ok(r3.ok1&&!r3.van&&r3.db===1000&&r3.sf===1&&r3.q===0,"a választó ablakban 2 jutalom fizet",r3);

  /* 6. Kihívás-előnyök */
  const r4=await p.evaluate(()=>{mgmtPanelOpen();const d=document.getElementById("mgChElony");if(!d)return null;d.open=true;
    return {t:d.textContent,n:d.querySelectorAll(".mgElony").length};});
  ok(r4&&r4.n>=4&&/200 perctől/.test(r4.t)&&/ládakulcs/.test(r4.t)&&/Futó büntetések/.test(r4.t)&&!/undefined|NaN/.test(r4.t),"a Kihívás-előnyök összegez",r4&&{n:r4.n,t:r4.t.slice(0,300)});
  if(process.env.KEP){await p.evaluate(()=>{const d=document.getElementById("mgChElony");d.scrollIntoView();});await p.screenshot({path:KEPDIR+"/elonyok.png"});}

  /* 7. LÁDA */
  const r5=await p.evaluate(()=>{
    const o={ar:LADAK.map(d=>d.ar),x:LADA_VALUTA_X};
    o.e1=ladaSpErme(100);
    /* esély a nehézséggel */
    const orig=styleXNfMost;
    styleXNfMost=()=>({nf:1,s:1});o.pEasy=[ladaLegendaEsely(5),ladaLegendaEsely(6)];
    styleXNfMost=()=>({nf:9,s:5});o.p95=[ladaLegendaEsely(5),ladaLegendaEsely(6)];
    styleXNfMost=orig;
    /* kulcs */
    const e0=ladaErme();const r=ladaVesz("kupa",1,true);o.kulcs=[r.ok,ladaErme()===e0,(lada().kulcs.kupa||0)];
    /* legenda */
    const j=ladaJutLegenda(6);o.jc=j&&j.cim;
    const n0=fullCareerRoster().length;o.txt=j.alkalmaz();o.leg=j.legenda;
    const q=findRosterPlayerByName(j.legenda),e=careerPool[j.legenda];
    o.legOk=[fullCareerRoster().length-n0,!!q,e&&e.cardTier,(S.skills[j.legenda]||[]).length,e&&e.isIcon];
    return o;});
  ok(JSON.stringify(r5.ar)==="[10,15,23,34,49,71]"&&r5.x===1.41,"a ládák ára ×0,71, a valuta ×1,41",r5.ar);
  ok(r5.pEasy[0]>r5.p95[0]&&r5.pEasy[1]>r5.p95[1]&&r5.p95[1]>0,"a legenda-esély a nehézséggel csökken",{easy:r5.pEasy,n95:r5.p95});
  ok(r5.kulcs[0]&&r5.kulcs[1]&&r5.kulcs[2]===0,"a kulcs érme nélkül nyit, és elfogy",r5.kulcs);
  ok(r5.legOk[0]===1&&r5.legOk[1]&&r5.legOk[2]==="godlike"&&r5.legOk[3]===2&&r5.legOk[4],"a legenda a keretbe jön, GODLIKE kártyával és 2 skillel",[r5.legOk,r5.txt]);

  /* 8. JELENET */
  const r6=await p.evaluate(async()=>{
    window.IGAZ_TESZT=true;
    const q=findRosterPlayerByName(fullCareerRoster().filter(Boolean)[2].n);
    const cand={n:"Proba Igazolt",pos:["CS"],ovr:84,age:23,nat:"Brazília",karI:2,kapI:2,verI:2};
    careerPool[cand.n]={n:cand.n,pos:["CS"],age:23,startRating:84,peak:88,pot:4200,estimatedPOT:4300,nat:"Brazília"};
    extraRoster.push(cand);drafted.add(cand.n);markArrived(cand,250000);
    await new Promise(r=>setTimeout(r,700));
    const ov=document.getElementById("igazJel");if(!ov)return {nincs:true};
    const korai={alak:getComputedStyle(ov.querySelector(".ijAlak")).opacity};
    await new Promise(r=>setTimeout(r,4600));
    const t=ov.textContent;
    const k=ov.querySelector(".ijKartya").getBoundingClientRect(),a=ov.querySelector(".ijAlak").getBoundingClientRect();
    return {korai,t,k:[k.width,k.height],a:[a.width,a.height],kesz:+getComputedStyle(ov.querySelector(".ijAlak")).opacity,
      kOp:+getComputedStyle(ov.querySelector(".ijKartya")).opacity,img:!!ov.querySelector(".ijAlak img")};});
  ok(!r6.nincs,"az igazolás-jelenet megjelenik (markArrived)");
  ok(r6.t&&/84/.test(r6.t)&&/4\s?300|4300/.test(r6.t)&&/RATING/.test(r6.t)&&/POT/.test(r6.t)&&/🇧🇷/.test(r6.t)&&!/undefined|NaN/.test(r6.t),"a kártyán Rating, POT, zászló",r6.t&&r6.t.slice(0,200));
  ok(+r6.korai.alak<0.5&&r6.kesz>0.95&&r6.kOp>0.95&&r6.img,"a játékos a homályból lép elő, a kártya beúszik",r6);
  if(process.env.KEP)await p.screenshot({path:KEPDIR+"/igazolas.png"});
  const r7=await p.evaluate(async()=>{const ov=document.getElementById("igazJel");ov.querySelector(".ijOk").click();
    await new Promise(r=>setTimeout(r,500));return !document.getElementById("igazJel");});
  ok(r7,"az „Isten hozott” bezárja");
  /* a legendás láda láncolata: nyitás → pörgetés → jelenet */
  const r8=await p.evaluate(async()=>{
    const j=ladaJutLegenda(5);if(!j)return {nincs:true};j.szint=5;j.eredmeny=j.alkalmaz();
    ladaNyitasMutat(ladaDef("bajnokok"),[j]);
    await new Promise(r=>setTimeout(r,2600));
    const por=!!document.getElementById("igazPorog");
    await new Promise(r=>setTimeout(r,3600));
    const ov=document.getElementById("igazJel");
    return {por,jel:!!ov,leg:ov&&ov.classList.contains("ijLeg"),t:ov&&ov.querySelector(".ijFej").textContent};});
  ok(r8.por&&r8.jel&&r8.leg&&/LEGENDÁS/.test(r8.t),"a legendás láda: pörgetés, aztán a legenda-jelenet",r8);
  if(process.env.KEP){await p.waitForTimeout(2500);await p.screenshot({path:KEPDIR+"/legenda.png"});}
  /* webdriver alatt teszt-jelző nélkül nincs jelenet */
  const r9=await p.evaluate(()=>{window.IGAZ_TESZT=false;const x=document.getElementById("igazJel");if(x)x.remove();
    return igazJelenetKell({n:"x"});});
  ok(r9===false,"próbában (webdriver) a jelenet magától nem jön");

  /* 10. A JEGYZETEK (jmwxx…) */
  const r10=await p.evaluate(()=>{
    const o={};
    const sz=id=>KUT_SZAKASZ.find(x=>x.id===id);
    o.fejl=sz("fejlodes").fel.map(f=>f.id);o.fejlKell=sz("fejlodes").kell;
    o.kapNyit=sz("meccsek").nyit.indexOf("kapitany")>=0&&sz("lelek").nyit.indexOf("kapitany")<0;
    o.lelek=sz("lelek").fel.map(f=>f.id);o.merleg=sz("merleg").fel.map(f=>f.id);
    /* a Kezdő út egy futó állapota */
    S.kut={v:1,tudas:"kezdo",sz:KUT_SZAKASZ.findIndex(x=>x.id==="fejlodes"),kesz:{},nyit:{menedzsment:1,edzes:1,osszhang:1,kapitany:1},uj:[],zs:0,vt:0,mutatott:{}};
    kutMeccsUtan(2,0);o.gol1=!!S.kut.kesz["fejlodes:gol3"];
    kutMeccsUtan(1,1);o.gol2=!!S.kut.kesz["fejlodes:gol3"];
    S.assists=S.assists||{};const n=slots[9].player.n;S.assists[n]=3;o.as=kutAllapotOk("assist3");
    /* a menü: nyitás után azonnal látszik */
    document.getElementById("scHub").classList.remove("hide");
    S.kut.nyit.meccsero=0;hubRefreshMenu();const zar0=$("hubMeccseroBtn").classList.contains("hide");
    S.kut.nyit.meccsero=1;kutHubFrissit();const zar1=$("hubMeccseroBtn").classList.contains("hide");
    o.menu=[zar0,zar1];
    /* tempó Hol? */
    const L=kutHolLecke(sz("meccsek"),sz("meccsek").fel.find(f=>f.id==="tempo"));
    o.tempo=L.l.map(x=>x.el||x.sel||x.t);
    /* a meccsek leckéje: kapitány + nehéznél boost */
    o.mLecke=KUT_LECKE.meccsek.l.map(x=>x.c).join("|");
    o.lLecke=KUT_LECKE.lelek.l.map(x=>x.c).join("|");
    /* a figura: a fej feljebb, a gallér a tervezőé */
    const f=evaFig(slots[1].player,{c1:"#c00",c2:"#0a0",ink:"#fff",pat:"solid",sleeve:"cuff",collar:"polo"},0.8,false);
    const g=evaFigura("tq",f,{c1:"#c00",c2:"#0a0",ink:"#fff",pat:"solid",sleeve:"cuff",collar:"polo"},0,0,1);
    o.fig=[/y="-62.4"/.test(g),/<rect x="47.5" y="16"/.test(g),/M-10.5 -26.9/.test(g)];
    S.kut=null;
    return o;});
  ok(r10.fejl.includes("kapitany")&&r10.fejl.includes("gol3")&&r10.fejlKell===5&&r10.kapNyit,"a 3. lecke: kapitány + még 3 gól (a kapitány a 2. végén nyílik)",r10);
  ok(r10.lelek.includes("assist3")&&r10.lelek.includes("piac")&&r10.merleg.includes("tal1"),"a gólpassz-, piac- és talizmán-feladat bent",[r10.lelek,r10.merleg]);
  ok(!r10.gol1&&r10.gol2&&r10.as,"a 3 gól a szakaszban gyűlik; a 3 gólpassz feladat teljesül",[r10.gol1,r10.gol2,r10.as]);
  ok(r10.menu[0]===true&&r10.menu[1]===false,"a nyitás után a menüpont azonnal látszik (HUB-váltás nélkül)",r10.menu);
  ok(r10.tempo[0]==="hubNextSeasonBtn"&&/speedRow/.test(r10.tempo[1]),"a tempó „Hol?”: előbb a Vissza a szezonhoz gomb, aztán a csúszka",r10.tempo);
  ok(/Kapitány|kapitány/.test(r10.mLecke)&&/Boost/.test(r10.mLecke)&&!/Kapitány/.test(r10.lLecke),"a kapitány és a Boost (nehéznél) a meccsek leckéjében",[r10.mLecke.slice(0,300)]);
  ok(r10.fig.every(Boolean),"a figura: a fej feljebb ül, az ingnyak és a csíkos ujjvég a tervezőé",r10.fig);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,4));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})();
