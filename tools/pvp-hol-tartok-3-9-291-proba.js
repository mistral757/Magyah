/* 📍 3.9.291 — „HOL TARTOK": VÁLASZ A TÁRS BÖKÉSÉRE.

   KÉRÉS: „Amikor ott vagy a játékban és úgy kapsz értesítést a társadtól,
   hogy vár, akkor legyen egy gomb, ami azt csinálja, hogy ha rányomsz, akkor
   elküldi a társadnak, hogy hányadik fordulónál jár épp, hogy tudja, hogy
   mennyit kell még várnia."

   Amit mér (memóriabeli h2h-ág, a két oldal külön):
     1. a bökés sávján ott a „📍 Hol tartok" gomb;
     2. a koppintás a saját rekeszembe írja az állásomat (idény, lejátszott
        fordulók, mit csinálok), a sáv visszaigazol, a napló is; fék;
     3. a váró oldal: a társ válasza a saját kapujához mérve — „még 2
        forduló", ugyanott, előrébb; a válasz-sávon nincs újabb gomb, a régi
        vagy a saját válasz nem ugrik be;
     4. az állás-szöveg: meccs közben, ablakban, nyáron;
     5. nincs oldalhiba.
   Használat: node tools/pvp-hol-tartok-3-9-291-proba.js [kép-mappa] */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const path=require('path');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8991'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba++;console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x).slice(0,600):""));};
  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8991/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const kep=process.argv[2];
  await p.evaluate(()=>{
    gameMode="career";MP.active=true;MP.role="host";MP.activeRoom="ABCD";mpNet.mode="fb";
    window.h2hRoomActive=()=>true;teamName="Próba FC";
    window._naplo=[];const _al=window.addLine;window.addLine=(t,c)=>{window._naplo.push(String(t));try{_al(t,c);}catch(e){}};
    try{localStorage.removeItem(MP_PING_MUTE_KEY);}catch(e){}
    _mpPingMute=0;_mpPingAt=0;_mpPingSeen=0;
    window.ENYEM=mpMyId();window.TARS="tars-1";
    _mpPresRoom={code:"ABCD",players:{[ENYEM]:{role:"host",online:true},[TARS]:{role:"guest",online:true}}};
    window._h2h={};
    window.mpBk=()=>({h2hPut:async(c,r,f,v)=>{(_h2h[r]=_h2h[r]||{})[f]=v;},h2hGet:async(c,r)=>_h2h[r]||null});
    phase="season";S.seasonNumber=1;S.idx=6;S.playing=false;S.twWindow=null;S.seasonClosed=false;});

  console.log("— 1. a bökés sávja —");
  const r1=await p.evaluate(async()=>{
    _h2h.ping={[TARS]:{e:"⏳",t:"Társ FC",g:"🛡 KÉZFOGÁS",at:Date.now()}};
    await mpPingPoll();await new Promise(r=>setTimeout(r,400));
    const ab=document.getElementById("mpPingAllas");
    return {sav:!document.getElementById("mpPingBar").classList.contains("hide"),
      gomb:ab&&!ab.classList.contains("hide"),tx:ab&&ab.textContent,
      szoveg:document.getElementById("mpPingTx").textContent};});
  ok("a társ bökése beugrik, rajta a „📍 Hol tartok” gomb",r1.sav&&r1.gomb&&/Hol tartok/.test(r1.tx),r1);
  if(kep)await p.screenshot({path:path.join(kep,"bokes-gomb.png"),clip:{x:0,y:0,width:390,height:110}});

  console.log("\n— 2. a koppintás —");
  const r2=await p.evaluate(async()=>{
    S.playing=true;   /* épp a 7. fordulót játszom */
    document.getElementById("mpPingAllas").click();
    await new Promise(r=>setTimeout(r,300));
    const rec=_h2h.pingAllas&&_h2h.pingAllas[ENYEM];
    const o={rec,gomb:document.getElementById("mpPingAllas").textContent,
      sav:document.getElementById("mpPingTx").textContent,
      naplo:_naplo.filter(t=>/Jelezted/.test(t)).slice(-1)[0]||""};
    /* fék: rögtön újra nem */
    o.fek=await mpAllasKuld();
    S.playing=false;
    return o;});
  ok("a saját rekeszembe kerül: 1. idény, 6 lejátszott forduló, a 7.-et játssza",
    r2.rec&&r2.rec.sn===1&&r2.rec.idx===6&&r2.rec.mit==="meccs"&&/7\. fordulót játssza/.test(r2.rec.hol)&&r2.rec.t==="Próba FC",r2.rec);
  ok("a sáv és a napló visszaigazol",/Elküldve/.test(r2.gomb)&&/Elküldtük/.test(r2.sav)&&/6\/30/.test(r2.naplo),{gomb:r2.gomb,sav:r2.sav,naplo:r2.naplo});
  ok("fék: rögtön újra nem küld",!r2.fek.ok&&/mp múlva/.test(r2.fek.miert),r2.fek);
  if(kep){await p.waitForTimeout(200);await p.screenshot({path:path.join(kep,"elkuldve.png"),clip:{x:0,y:0,width:390,height:110}});}

  console.log("\n— 3. a váró oldal —");
  const var1=await p.evaluate(async()=>{
    mpPingHide();await new Promise(r=>setTimeout(r,300));
    /* én várok a 8. forduló után; a társ a 6 lejátszott után a 7.-et játssza */
    S.idx=8;
    _h2h.pingAllas={[ENYEM]:{sn:1,idx:8,mit:"var",hol:"x",at:Date.now()},
      [TARS]:{sn:1,idx:6,mit:"meccs",hol:"a 7. fordulót játssza",t:"Társ FC",at:Date.now()}};
    _h2h.ping={};
    await mpPingPoll();await new Promise(r=>setTimeout(r,400));
    return {sav:!document.getElementById("mpPingBar").classList.contains("hide"),
      tx:document.getElementById("mpPingTx").textContent,emoji:document.getElementById("mpPingEmoji").textContent,
      gomb:!document.getElementById("mpPingAllas").classList.contains("hide"),
      naplo:_naplo.filter(t=>/Társ FC: 1\. idény/.test(t)).length};});
  ok("a váró látja: hol tart, és még 2 forduló, mire odaér",var1.sav&&/6\/30/.test(var1.tx)&&/Még 2 forduló/.test(var1.tx)&&/épp játssza/.test(var1.tx)&&var1.emoji==="📍",var1);
  ok("a válasz-sávon nincs újabb „Hol tartok” gomb; a napló is megkapja",!var1.gomb&&var1.naplo===1,var1);
  if(kep)await p.screenshot({path:path.join(kep,"varo-oldal.png"),clip:{x:0,y:0,width:390,height:110}});
  const var2=await p.evaluate(async()=>{
    mpPingHide();await new Promise(r=>setTimeout(r,300));
    const n0=_naplo.length;
    await mpPingPoll();   /* ugyanaz a válasz: nem ugrik be újra */
    const ujra=_naplo.length-n0;
    const o={ujra};
    const t=(rec)=>mpAllasBecsles(rec).al;
    o.ugyanott=t({sn:1,idx:8,mit:"ablak",hol:"a 8. forduló utáni átigazolási ablakban"});
    o.elorebb=t({sn:1,idx:10,mit:"elott",hol:"a 11. forduló előtt"});
    S.seasonNumber=2;S.idx=0;
    o.idenyKoz=mpAllasBecsles({sn:1,idx:27,mit:"elott",hol:""}).hatra;
    S.seasonNumber=1;S.idx=8;
    /* régi válasz nem ugrik be */
    _h2h.pingAllas[TARS].at=Date.now()-10*60000;_mpAllasSeen=0;
    const n1=_naplo.length;await mpPingPoll();o.regi=_naplo.length-n1;
    return o;});
  ok("ugyanaz a válasz nem ugrik be újra; a régi sem",var2.ujra===0&&var2.regi===0,var2);
  ok("ugyanott → „ugyanannál a fordulónál”, előrébb → „ő vár rád”, idényhatáron át is számol (3)",
    /Ugyanannál/.test(var2.ugyanott)&&/Előrébb jár nálad \(2/.test(var2.elorebb)&&var2.idenyKoz===3,var2);

  console.log("\n— 4. az állás-szöveg —");
  const r4=await p.evaluate(()=>{const o={};
    S.idx=8;S.playing=false;S.twWindow={round:8,label:"x"};o.ablak=mpAllasMost();S.twWindow=null;
    S.idx=30;S.seasonClosed=true;o.nyar=mpAllasMost();S.seasonClosed=false;
    S.idx=3;o.elott=mpAllasMost();return o;});
  ok("ablakban / nyáron / forduló előtt",/8\. forduló utáni átigazolási ablakban/.test(r4.ablak.hol)&&/az 1\. idény utáni nyári szünetben/.test(r4.nyar.hol)&&/4\. forduló előtt/.test(r4.elott.hol),r4);

  console.log("\n— 5. hibák —");
  ok("nincs oldalhiba",!oldal.length,oldal.slice(0,5));
  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
