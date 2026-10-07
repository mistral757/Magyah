/* 🤝 3.9.221 — BEFEKTETÉS-ARÁNYOS HANGOLÁS A KÖZÖS KARRIERBEN

   KIMONDOTT KÉRÉS: „a felzárkóztatás legyen rating és büdzsé és kedvezmény
   együtt, de mindegyik enyhébb mértékű. A rating mindenképpen enyhébb mint
   eddig." (terv: docs/terv-befektetes-aranyos-hangolas.md)

   Amit mér:
     1. A BEFEKTETÉSI ARÁNY a főkönyvből: befektetés / (nyitó + bevétel), a bér
        nem befektetés, a stáb igen; két idény 2:1;
     2. A TERV (tiszta függvény): a lemaradó a különbség NEGYEDÉT kapja
        ratingben (eddig a felét), büdzsét és boost-kedvezményt pontonként
        3%-ot, legfeljebb 15%-ot, mind × f; az elöl lévő nem veszít, kivéve ha
        lényegesen kevesebbet fektetett be; a két gép szemszöge tükörkép;
     3. A KAPU a lemaradónál: rating, büdzsé (főkönyvben), kedvezmény (a boost-
        árban), a saját záró érték követi, a doboz és a napló kimondja;
     4. A KUPA UTÁNI KAPU ugyanabban az idényben a plafon fölé nem ad;
     5. AZ ELÖL LÉVŐ: nem változik; kevés befektetésnél lejjebb lép;
     6. RÉGI KLIENS (nincs BA a társ csomagjában): a régi szabály fut;
     7. a csomag viszi a BA-t; mentés-kör; a kedvezmény lejár; a Jobb
        üzletmenet nem szorozza; nincs konzolhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9262;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:24};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:24,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.auto=false;});
  await p.waitForTimeout(500);


  console.log("— 1. a befektetési arány —");
  const r1=await p.evaluate(()=>{
    const sn=S.seasonNumber||1;
    const L=ledgerState();
    const regi=JSON.parse(JSON.stringify(L.rows));
    L.rows={};
    L.rows[sn]={season:sn,open:1000,cats:{season:3000,fans:1000,buy:1500,staff:500,wage:1200,loanPay:300}};
    const egy=mpBefektetesiArany();
    L.rows[sn-1]={season:sn-1,open:0,cats:{season:2000,boost:200}};
    const ketto=mpBefektetesiArany();
    L.rows=regi;
    return {egy,ketto,sor:mpBaRow({open:1000,cats:{season:3000,fans:1000,buy:1500,staff:500,wage:1200}})};});
  ok(r1.sor===0.4,"egy idény: (igazolás+stáb) / (nyitó+bevétel) = 2000/5000 — a bér és a hiteltörlesztés nem számít",r1.sor);
  ok(r1.egy===0.4&&r1.ketto===0.3,"két idény 2:1 súllyal: (2×0,4+0,1)/3 = 0,3",r1);

  console.log("\n— 2. a terv —");
  const r2=await p.evaluate(()=>{
    const P=(g,l,a,b)=>{const x=mpCatchPlan(g,l,a,b);return {my:+x.myMove.toFixed(4),mate:+x.mateMove.toFixed(4),
      b:+x.budgetPct.toFixed(4),d:+x.discPct.toFixed(4),f:x.f,lead:x.lead};};
    return {egyenlo:P(-7,false,0.4,0.4),sporolo:P(-7,false,0.1,0.4),kicsi:P(-3,false,0.4,0.4),
      vezet:P(7,true,0.4,0.4),vezetSpor:P(7,true,0.1,0.5),nulla:P(-7,false,0,0),
      tukor:[P(-5,false,0.3,0.5),P(5,true,0.5,0.3)],regiFele:(7-MP_BALANCE_GAP)/2};});
  ok(r2.egyenlo.my===1.5&&r2.egyenlo.mate===0&&r2.egyenlo.f===1,"azonos befektetésnél a lemaradó (Δ−1) negyedét kapja ratingben, az elöl lévő nem mozdul",r2.egyenlo);
  ok(r2.egyenlo.my<r2.regiFele,"a rating enyhébb, mint eddig (1,5 a régi 3 helyett)",[r2.egyenlo.my,r2.regiFele]);
  ok(r2.egyenlo.b===0.15&&r2.egyenlo.d===0.15,"büdzsé és kedvezmény: pontonként 3%, legfeljebb 15%",r2.egyenlo);
  ok(r2.kicsi.b===0.06&&r2.kicsi.d===0.06&&r2.kicsi.my===0.5,"kis különbségnél arányosan kevesebb (Δ=3 → 6%, +0,5)",r2.kicsi);
  ok(r2.sporolo.f===0.25&&r2.sporolo.my===0.375&&r2.sporolo.b===0.0375,"aki a pénzén ült (BA 0,1 vs 0,4), annak negyedannyi jár",r2.sporolo);
  ok(r2.vezet.my===0&&r2.vezet.b===0&&r2.vezet.lead,"az elöl lévő nem veszít, és nem kap semmit",r2.vezet);
  ok(r2.vezetSpor.my===-0.9&&r2.vezetSpor.mate===1.5,"ha az elöl lévő lényegesen kevesebbet fektetett be, (Δ−1) 15%-ával lejjebb lép",r2.vezetSpor);
  ok(r2.nulla.my===0&&r2.nulla.b===0,"ha senki nem fektetett be, nincs felzárkóztatás",r2.nulla);
  ok(r2.tukor[0].my===r2.tukor[1].mate&&r2.tukor[0].mate===r2.tukor[1].my,"a két gép szemszöge pontos tükörkép",r2.tukor);

  /* a közös kapu-környezet: liga-kapu, mindketten folytatják */
  const KAPU=(mine,mate,baMine,baMate)=>{
    const sn=S.seasonNumber||1;
    S.mpBalance=0;S.mpBalanceP={};S.mpTuneCap=null;S.mpCatchDisc=null;S.mpCatchSeason=null;S.mpCupSeason=0;S.mpRanks=null;
    S.mpMyFinal={season:sn,strength:mine,ba:baMine};
    const stats={strength:mate};if(baMate!=null)stats.ba=baMate;
    S.mpMateFinal={season:sn,rep:{stats}};
    S.mpDecision={season:sn,mine:"continue",mate:"continue"};};

  console.log("\n— 3. a kapu a lemaradónál —");
  const r3=await p.evaluate((KAPUsrc)=>{
    const KAPU=eval("("+KAPUsrc+")");
    const o={};
    const m=mpMyStrength();
    KAPU(m,m+7,0.4,0.4);
    const b0=Math.round(S.transferBudget||0),u0=boostUnitPrice(),dm0=boostDiscountMult();
    const ledger0=(ledgerRow().cats.mpCatch)||0;
    mpMaybeApplyBalance("league");
    const bi=S.mpDecision.balanceInfo;
    o.bi={uj:bi.uj,moved:+bi.moved.toFixed(3),budget:bi.budget,disc:bi.disc,lead:bi.lead};
    o.vart=Math.round(clubBudgetScale()*0.15);
    o.budzse=Math.round(S.transferBudget)-b0;
    o.fokonyv=(ledgerRow().cats.mpCatch||0)-ledger0;
    o.kedv=S.mpCatchDisc;o.dmArany=+(boostDiscountMult()/dm0).toFixed(4);
    o.sajat=+(S.mpMyFinal.strength-m).toFixed(3);o.tars=S.mpMateFinal.rep.stats.strength-m;
    o.doboz=mpDecisionBox().replace(/<[^>]+>/g,"");
    const L=[...(lines()?lines().children:[])].map(x=>x.textContent);o.sor=L.filter(t=>/Kiegyenlítés a folytatáshoz/.test(t)).pop()||"";
    return o;},KAPU.toString());
  ok(r3.bi.uj&&!r3.bi.lead&&Math.abs(r3.bi.moved-1.5)<0.05,"rating: +1,5 (a 6-os többlet negyede) — a régi szabály 3-at adott volna",r3.bi);
  ok(r3.budzse===r3.vart&&r3.bi.budget===r3.vart&&r3.fokonyv===r3.vart,"büdzsé: az éves bevétel 15%-a, a főkönyvben „PvP-felzárkóztatás” sorral",{b:r3.budzse,vart:r3.vart,fk:r3.fokonyv});
  ok(r3.kedv&&r3.kedv.pct===0.15&&r3.kedv.until===((await p.evaluate(()=>S.seasonNumber||1))+1)&&r3.dmArany===0.85,"boost: −15% az egység árán, a következő idény végéig",{k:r3.kedv,arany:r3.dmArany});
  ok(Math.abs(r3.sajat-r3.bi.moved)<1e-6&&r3.tars===7,"a saját záró érték követi a hangolást, a társé (az elöl lévőé) nem mozdul",{sajat:r3.sajat,tars:r3.tars});
  ok(/Felzárkóztatás/.test(r3.doboz)&&/Befektetési arány/.test(r3.doboz)&&/te 40%/.test(r3.doboz),"a doboz kimondja a három tételt és a két befektetési arányt",r3.doboz.slice(0,300));
  ok(/Felzárkóztatás/.test(r3.sor),"a napló is",r3.sor.slice(0,200));

  console.log("\n— 4. a kupa utáni kapu ugyanabban az idényben —");
  const r4=await p.evaluate(()=>{
    const sn=S.seasonNumber||1;
    const kupa=()=>{
      S.mpCupSeason=sn;S.mpDecisionCup={season:sn,mine:"continue",mate:"continue"};
      const b0=Math.round(S.transferBudget);
      mpMaybeApplyBalance("cup");
      const bi=S.mpDecisionCup.balanceInfo;
      return {gapElotte:+bi.gapBefore.toFixed(2),moved:+bi.moved.toFixed(3),budget:bi.budget||0,disc:bi.disc||0,
        budzse:Math.round(S.transferBudget)-b0,kedv:S.mpCatchDisc.pct,doboz:mpDecisionBox().replace(/<[^>]+>/g,"").slice(0,240)};};
    const o={};
    o.szukult=kupa();
    /* a kupa alatt a társ elhúzott: a különbség 9-re nőtt */
    S.mpMateFinal.rep.stats.strength=S.mpMyFinal.strength+9;
    o.nott=kupa();
    o.szamlalo=Object.assign({},S.mpCatchSeason);
    S.mpCupSeason=0;S.mpDecisionCup=null;
    return o;});
  ok(r4.szukult.gapElotte===5.5,"a kupa utáni kapu a MÁR hangolt különbségből indul (7 − 1,5)",r4.szukult.gapElotte);
  ok(r4.szukult.moved===0&&r4.szukult.budzse===0&&r4.szukult.disc===0,"szűkült különbségnél a második kapu nem ad újra — az idény egésze egy mérce",r4.szukult);
  ok(/már megkaptad/.test(r4.szukult.doboz),"a doboz kimondja, miért nem jár most semmi",r4.szukult.doboz);
  ok(Math.abs(r4.nott.moved-0.5)<0.05&&r4.nott.budzse===0&&r4.nott.kedv===0.15,
     "ha a kupa alatt NŐTT a szakadék (9), a növekmény jár: a 8-as többlet negyede (2) − a már kapott 1,5 = +0,5; a büdzsé és a kedvezmény a plafonon",r4.nott);
  ok(Math.abs(r4.szamlalo.myUsed-2)<1e-9&&r4.szamlalo.budgetPct===0.15,"az idény számlálója a tervet könyveli (2,0 rating, 15% büdzsé)",r4.szamlalo);

  console.log("\n— 5. az elöl lévő —");
  const r5=await p.evaluate((KAPUsrc)=>{
    const KAPU=eval("("+KAPUsrc+")");
    const m=mpMyStrength();
    KAPU(m,m-7,0.4,0.4);
    const b0=Math.round(S.transferBudget);
    mpMaybeApplyBalance("league");
    const a=S.mpDecision.balanceInfo,ad={moved:a.moved,budget:a.budget||0,disc:a.disc||0,budzse:Math.round(S.transferBudget)-b0,
      doboz:mpDecisionBox().replace(/<[^>]+>/g,"").slice(0,220)};
    KAPU(m,m-7,0.1,0.5);
    mpMaybeApplyBalance("league");
    const b=S.mpDecision.balanceInfo;
    return {a:ad,b:{moved:+b.moved.toFixed(3),drop:b.drop}};},KAPU.toString());
  ok(Math.abs(r5.a.moved)<1e-6&&r5.a.budzse===0&&r5.a.disc===0,"azonos befektetésnél az elöl lévő kerete nem változik, és nem kap semmit",r5.a);
  ok(/nem változik/.test(r5.a.doboz),"a doboz kimondja: a fölényedet megtartod",r5.a.doboz);
  ok(r5.b.drop&&Math.abs(r5.b.moved+0.9)<0.05,"lényegesen kevesebb befektetésnél (0,1 vs 0,5) −0,9-et lép",r5.b);

  console.log("\n— 6. régi kliens —");
  const r6=await p.evaluate((KAPUsrc)=>{
    const KAPU=eval("("+KAPUsrc+")");
    const m=mpMyStrength();
    KAPU(m,m+7,0.4,null);   /* a társ csomagjában nincs BA */
    S.mpCatchDisc=null;
    const b0=Math.round(S.transferBudget);
    mpMaybeApplyBalance("league");
    const bi=S.mpDecision.balanceInfo;
    return {uj:!!bi.uj,moved:+bi.moved.toFixed(3),budzse:Math.round(S.transferBudget)-b0,kedv:S.mpCatchDisc};},KAPU.toString());
  ok(!r6.uj&&r6.moved>1.6&&r6.budzse===0&&r6.kedv===null,"régi társnál a régi szabály (fél lépés, büdzsé és kedvezmény nélkül)",r6);

  console.log("\n— 7. csomag, mentés, lejárat, talizmán —");
  const r7=await p.evaluate(()=>{
    const o={};
    const rep=mpSeasonReport();o.ba=rep.stats.ba;o.baV=rep.stats.baV;
    const sn=S.seasonNumber||1;
    S.mpCatchDisc={until:sn+1,pct:0.12};S.mpCatchSeason={season:sn,budgetPct:0.1,discPct:0.12};
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    o.mentve=d&&d.S&&d.S.mpCatchDisc;o.mentveSz=d&&d.S&&d.S.mpCatchSeason;
    o.most=mpCatchBoostDisc();
    S.seasonNumber=sn+1;o.kovetkezo=mpCatchBoostDisc();
    S.seasonNumber=sn+2;o.lejart=mpCatchBoostDisc();
    S.seasonNumber=sn;
    o.bank=!!TAL_BANK_KIVETEL.mpCatch;o.kat=LEDGER_CATS.mpCatch&&LEDGER_CATS.mpCatch.side;
    S.mpCatchDisc=null;S.mpCatchSeason=null;
    return o;});
  ok(typeof r7.ba==="number"&&r7.ba>=0&&r7.ba<=1&&r7.baV===1,"a szezonzáró csomag viszi a befektetési arányt",r7);
  ok(r7.mentve&&r7.mentve.pct===0.12&&r7.mentveSz&&r7.mentveSz.budgetPct===0.1,"a kedvezmény és az idényen belüli számláló a mentésbe kerül",r7);
  ok(r7.most===0.12&&r7.kovetkezo===0.12&&r7.lejart===0,"a kedvezmény a következő idény végéig él, aztán lejár",r7);
  ok(r7.bank&&r7.kat===1,"bevételi kategória, és a Jobb üzletmenet nem szorozza",r7);
  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
