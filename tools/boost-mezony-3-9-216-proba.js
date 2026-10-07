/* 📈 3.9.216 — A BOOSTOK POT-JA ÉS A „+2 RATING" JUTALOM A MEZŐNNYEL NŐ

   KIMONDOTT KÉRÉS: „a boostokat is igazítsd a mezőnyhöz."

   Amit mér:
     1. 85-ÖS MEZŐNYIG SEMMI NEM VÁLTOZIK: a szorzó 1, az ifi-boost POT-sávja
        1000–2500, a sima boost korlátja 400–2500, a POT-boosté 1000–10 000,
        a kártya-jutalom +2;
     2. FÖLÖTTE A MEZŐNY POT-JÁVAL ARÁNYOS: a szorzó peakToPot(mezőny) ÷
        peakToPot(85) — pontosan a kihívás POT-jutalmáé (egy mérce); 400-as
        mezőnyben egy 900 000-es ifi érdemi POT-ot kap (nem 0,6%-ot), a sima
        és a POT-boost korlátai is nőnek; a Rating-ugrás léptéke változatlan;
     3. A FELÜLET a valódi sávot írja: az ifi- és az öreg-boost panelje, a
        Boost-központ sima és POT-leírása;
     4. A KÁRTYA-FEJLESZTÉS: a kártya a mezőny szerinti összeget ígéri (+8 a
        400-as mezőnyben), az azonnali és a szezonkártyák utánra halasztott
        kifizetés is pontosan azt adja; a régi (összeg nélküli) függő
        fejlesztés +2 marad. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9258;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrPickGap=2;pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout={name:"Próba",stars:2};
    window.saveGame=()=>{};phase="hub";S.seasonNumber=5;S.transferBudget=1e13;
    /* a 🧿 Csodaszer ne torzítsa a mérést */
    window.talBoostHatasMult=()=>1;
    return {v:APP_VERSION,fn:typeof boostPotFieldScale==="function"&&typeof cardUpRatingFor==="function"};});
  ok(String(r0.v).localeCompare("3.9.216",undefined,{numeric:true})>=0,"a verzió legalább 3.9.216",r0.v);
  ok(r0.fn,"a közös POT-lépték és a kártya-összeg függvénye létezik");
  if(!r0.fn){await b.close();srv.close();console.log(`\n✗ ${hiba} hiba`);process.exit(1);}

  /* egy mezőnyön: N próba-boost egy friss, 18 éves ifin (POT, Rating) */
  const meres=(field,pot)=>p.evaluate(([field,pot])=>{
    oppTargetRating=field;infinityMode=field>100;
    const mk=(age)=>{const n="Mérő "+Math.random();const e={n,pos:["KK"],age,startRating:Math.min(field,300),peak:Math.min(field,300)+5,pot,
      youthBonus:age<=23?3:0,youthBonusStartAge:age,nat:"Magyarország"};careerPool[n]=e;return e;};
    const o={sk:boostPotFieldScale(),ch:challengePotScale({oppRating:field}),
      plain:[boostPlainTMin(),boostPlainTMax()],potB:[boostPotTMin(),boostPotTMax()],card:cardUpRatingFor(field),
      ifiT:[],ifiR:[],oregT:[],potT:[],plainT:[]};
    for(let i=0;i<40;i++){
      const e=mk(18),r=applyYouthBoost(e);o.ifiT.push(r.tBoost);o.ifiR.push(r.rBoost);
      const v=mk(33),r2=applyOldBoost(v);o.oregT.push(r2.tBoost);
      const q=mk(25),r3=applyPotBoost(q);o.potT.push(r3.tBoost);
      const w=mk(25),r4=applyPlainBoost(w);o.plainT.push(r4.tBoost);}
    const mm=a=>[Math.min(...a),Math.max(...a)];
    return {sk:o.sk,ch:o.ch,plain:o.plain,potB:o.potB,card:o.card,ifiT:mm(o.ifiT),ifiR:mm(o.ifiR),oregT:mm(o.oregT),potT:mm(o.potT),plainT:mm(o.plainT)};},[field,pot]);

  console.log("— 1. 85-ös mezőnyig semmi nem változik —");
  const a85=await meres(85,3000),a70=await meres(70,3000);
  ok(a85.sk===1&&a70.sk===1,"a szorzó 1 (70-es és 85-ös mezőnyben)",[a70.sk,a85.sk]);
  ok(a85.ifiT[0]>=1000&&a85.ifiT[1]<=2500,"az ifi-boost POT-ja 1000–2500",a85.ifiT);
  ok(a85.oregT[0]>=1200&&a85.oregT[1]<=3000,"az öreg-boost POT-ja 1200–3000",a85.oregT);
  ok(JSON.stringify(a85.plain)==="[400,2500]"&&JSON.stringify(a85.potB)==="[1000,10000]","a sima (400–2500) és a POT-boost (1000–10 000) korlátja a régi",[a85.plain,a85.potB]);
  ok(a85.card===2&&a70.card===2,"a kártya-jutalom +2",[a70.card,a85.card]);

  console.log("\n— 2. fölötte a mezőny POT-jával arányos —");
  const a100=await meres(100,7000),a400=await meres(400,900000);
  ok(a100.sk>2.9&&a100.sk<3.3&&a400.sk>600&&a400.sk<680,"a szorzó 100-asnál ~×3, 400-asnál ~×640",[a100.sk,a400.sk]);
  ok(a100.sk===a100.ch&&a400.sk===a400.ch,"egy mérce: pontosan a kihívás POT-jutalmáé",[a100.ch,a400.ch]);
  ok(a400.ifiT[0]>=Math.round(1000*a400.sk)-1&&a400.ifiT[0]>500000,"400-as mezőnyben a 900 000-es ifi legalább ~640 000 POT-ot kap (régen ~5 000)",a400.ifiT);
  ok(a400.potT[0]>=Math.min(Math.round(1000*a400.sk),2872510-900000)-1,"a POT-boost alsó korlátja is nőtt (a kemény plafonig)",a400.potT);
  ok(a400.plainT[0]>=Math.round(400*a400.sk)-1,"a sima boost POT-ja a megnőtt alsó korlát fölött",a400.plainT);
  ok(a400.ifiR[0]>=Math.round(6*4)-1&&a400.ifiR[1]<=Math.round(12*4)+1,"a Rating-ugrás léptéke változatlan (mezőny/100: 400-asnál ×4)",a400.ifiR);
  const c400=await p.evaluate(()=>[cardUpRatingFor(0),cardUpRatingFor(150),cardUpRatingFor(400)]);
  ok(a100.card===2&&c400[0]===2,"a kártya-jutalom 100-as mezőnyig +2",[a100.card,c400[0]]);
  ok(c400[1]===3&&c400[2]===8,"150-esnél +3, 400-asnál +8",c400);

  console.log("\n— 3. a felület a valódi sávot írja —");
  const u=await p.evaluate(()=>{
    oppTargetRating=400;infinityMode=true;
    const sk=boostPotFieldScale(),o={sk};
    const pl=slots[3].player,e=careerPool[pl.n];
    Object.assign(e,{age:18,youthBonus:5,youthBonusStartAge:18,pot:900000,startRating:400,peak:405});
    openYouthBoostPanel();
    o.ifi=($("twBody").textContent||"").replace(/\s/g,"");
    o.ifiVart=`+${Math.round(1000*sk)}-${Math.round(2500*sk)}POT`;
    const d=BOOST_KINDS.find(x=>x.k==="pot"),dp=BOOST_KINDS.find(x=>x.k==="plain");
    o.pot=d.long().replace(/<[^>]+>/g,"");o.potVart=[fmtNum(boostPotTMin()),fmtNum(boostPotTMax())];
    o.plain=dp.long().replace(/<[^>]+>/g,"");o.plainVart=[fmtNum(boostPlainTMin()),fmtNum(boostPlainTMax())];
    const v=slots[4].player,ev=careerPool[v.n];Object.assign(ev,{age:33});
    try{openOldBoostPanel();}catch(x){o.oregHiba=x.message;}
    o.oreg=($("twBody").textContent||"").replace(/\s/g,"");
    o.oregVart=`+${Math.round(1200*sk)}-${Math.round(3000*sk)}POT`;
    return o;});
  ok(u.ifi.includes(u.ifiVart),"az ifi-boost panelje a skálázott POT-sávot írja",{vart:u.ifiVart,van:u.ifi.slice(0,160)});
  ok(u.potVart.every(x=>u.pot.includes(x))&&u.plainVart.every(x=>u.plain.includes(x)),"a Boost-központ sima és POT-leírása a skálázott korlátokat írja",{pot:u.potVart,plain:u.plainVart});
  ok(u.oreg.includes(u.oregVart),"az öreg-boost panelje a skálázott POT-sávot írja",{vart:u.oregVart,hiba:u.oregHiba});

  console.log("\n— 4. a kártya-fejlesztés —");
  const k=await p.evaluate(()=>{
    const o={};
    oppTargetRating=400;infinityMode=true;
    const ctx=challengeContext();
    let rw=null;for(let i=0;i<500&&!rw;i++){const x=genReward("long","medium",ctx);if(x&&x.kind==="cardUp")rw=x;}
    o.rw=rw;
    /* azonnali kifizetés */
    const ros=fullCareerRoster().filter(Boolean);
    ros.forEach(pl=>{const e=careerPool[pl.n];e.startRating=300;e.peak=305;});
    const elotte=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0);
    const t1=applyChallengeReward(rw);
    o.azonnal=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0)-elotte;o.t1=t1;
    /* halasztott: a szezonkártyák utánra */
    S.pendingCardUps=0;S.pendingCardUpR=[];
    _cardUpDefer=true;try{applyChallengeReward(rw);}finally{_cardUpDefer=false;}
    o.fugg=[S.pendingCardUps,S.pendingCardUpR.slice()];
    const e2=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0);
    drainPendingCardUps([]);
    o.halasztva=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0)-e2;
    o.urult=[S.pendingCardUps,S.pendingCardUpR.length];
    /* régi mentés: függő fejlesztés összeg nélkül → +2 */
    S.pendingCardUps=1;S.pendingCardUpR=undefined;
    const e3=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0);
    drainPendingCardUps([]);
    o.regi=ros.reduce((a,pl)=>a+careerPool[pl.n].startRating,0)-e3;
    return o;});
  ok(k.rw&&k.rw.amount===8&&/\+8 Rating/.test(k.rw.desc),"a 400-as mezőnyben a kártya +8 Ratinget ígér",k.rw);
  ok(k.azonnal===8&&/\+8 Rating/.test(k.t1),"az azonnali kifizetés +8",[k.azonnal,k.t1]);
  ok(k.fugg[0]===1&&JSON.stringify(k.fugg[1])==="[8]"&&k.halasztva===8&&k.urult[0]===0&&k.urult[1]===0,
     "a szezonkártyák utánra halasztott kifizetés is +8, és a sor kiürül",k);
  ok(k.regi===2,"a régi, összeg nélküli függő fejlesztés +2",k.regi);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
