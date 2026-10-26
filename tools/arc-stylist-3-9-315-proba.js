/* 🧑✂️🌍 3.9.315 — FRIZURÁK, ARCFORMÁK, ARCVONÁS-PÖRGETÉS, STYLIST-MÓD.

   KÉRÉS: „még ugyanennyi frizura […] amilyenek konkrét legendás vagy mostani
   top játékosoknak is vannak. És arcformákból is legyen még vagy 5 […] és
   […] random generátorral pörgethető cucc […] az arc forma+orr+szem
   elhelyezkedés+homlokmagasság+archibák együttesen változnak […] csak ezzel a
   random generátorral." + a „szutykos stylist vagyok" mód: a globálisan
   mentett kinézet közös listára megy, naponta beépül, mindenkinek az lesz az
   alap, és helyben felülírható.

   Amit mér:
     1. 38 frizura (19 új); mind kirajzolódik, mind más, sima és pixeles is;
     2. alapgenerálás: a többség régi frizurája marad, az újak ~⅓-ban jönnek;
        determinisztikus (ugyanaz a név → ugyanaz az arc);
     3. 8 arcforma (5 új), mind más fejet ad; a régi fejW-s mentés a régi
        formára olvas;
     4. a vonás-mag: más mag → más (nem szerkeszthető) vonások, a szerkeszthetők
        (frizura, szemforma, orr-típus) nem változnak; az edzők kézi portréja
        (vonas=-1) új véletlen jegy nélkül marad;
     5. a szerkesztő: 🎲 pörget, ↺ visszaáll, az Arcforma sor az új formákra lép;
     6. a közös lista (ARC_ALAP) az alap, a helyi globális felülírja, az
        „eredeti" a közös lista;
     7. stylist-mód: a profil-mező kulcsszava bekapcsolja; a globális mentés a
        stylist/<uid>/<kulcs> ágra megy, a szabálynak megfelelő formában;
        kapcsolat nélkül sorba áll;
     8. a napi beépítő (tools/stylist/beepit.js) egy export-ból beírja a
        listát, a betöltött játék ezt használja; törlés is működik;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9315;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
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
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a hang-kém: minden megszólalás időbélyeggel */
    window._hl=[];const h0=hang;hang=function(id){window._hl.push([performance.now(),id]);return h0.apply(this,arguments);};
    window._var=()=>new Promise(r=>{const t0=performance.now();
      const f=()=>(!_evaFut&&!_evaSor.length)||performance.now()-t0>9000?r():setTimeout(f,40);f();});
    window._elo=()=>{mevKezd({});_mev.anim=true;_mev.keret=8;S.playing=true;S.auto=false;};});
  await p.waitForTimeout(800);

  console.log("\n— 1. frizurák —");
  const r1=await p.evaluate(()=>{
    const jp={n:"Próba Frizura",nat:"Brazília",age:25};
    const svg=i=>{const regi=_faceModElo;_faceModElo={nev:jp.n,ov:{haj:i,kopas:0,vonas:-1}};try{return faceSVG(jp,100,{});}finally{_faceModElo=regi;}};
    const L=FACE_HAJ_STILUS.map((x,i)=>svg(i));
    const kul=new Set(L).size;
    let pix=0;for(let i=19;i<38;i++){const regi=_faceModElo;_faceModElo={nev:jp.n,ov:{haj:i,kopas:0,vonas:-1}};
      try{const s=faceSVG(jp,100,{bold:true});if(s.length>500)pix++;}finally{_faceModElo=regi;}}
    return {db:FACE_HAJ_STILUS.length,kul,pix,uj:FACE_HAJ_STILUS.slice(19)};});
  ok(r1.db===38&&r1.kul===38,"38 frizura, mind más rajzot ad",{db:r1.db,kul:r1.kul});
  ok(r1.pix===19,"az új 19 a vastag (pixeles alap) rajzban is kirajzolódik",r1.pix);

  console.log("\n— 2. alapgenerálás —");
  const r2=await p.evaluate(()=>{
    const all=[],volt=new Set();SQUADS.forEach(s=>s.players.forEach(x=>{if(!volt.has(x.n)){volt.add(x.n);all.push(x);}}));
    const minta=all.filter((x,i)=>i%7===0).slice(0,600);
    let uj=0,regiMaradt=0,egyezik=0,heg=0,forma=0;
    minta.forEach(x=>{const jp={n:x.n,nat:x.nat,age:26};const A=faceTraits(jp),B=faceTraits(jp);
      if(JSON.stringify(A)===JSON.stringify(B))egyezik++;
      if(A.haj>=19)uj++;else regiMaradt++;
      if(A.heg||A.anyajegy||A.gorbe)heg++;if(A.homlok!==1||A.fejTop<10||A.allCsucs>76.5)forma++;});
    return {db:minta.length,uj,regiMaradt,egyezik,heg,forma};});
  console.log("  "+JSON.stringify(r2));
  ok(r2.egyezik===r2.db,"determinisztikus: ugyanaz a név mindig ugyanazt az arcot adja",r2.egyezik);
  ok(r2.uj/r2.db>0.2&&r2.uj/r2.db<0.45,"az új frizurák ~⅓-ban jönnek, a többség régi frizurája marad",r2);
  ok(r2.heg>0&&r2.heg/r2.db<0.5&&r2.forma>0,"az archibák és az új arcformák az alapgenerálásban is megjelennek, de nem mindenkin",r2);

  console.log("\n— 3. arcformák —");
  const r3=await p.evaluate(()=>{
    const jp={n:"Próba Forma",nat:"Olaszország",age:26};
    const T=i=>{const regi=_faceModElo;_faceModElo={nev:jp.n,ov:{arcF:i}};try{return faceTraits(jp);}finally{_faceModElo=regi;}};
    const L=FACE_ARCFORMAK.map((a,i)=>{const t=T(i);return [t.fejW,t.allW,t.fejTop,t.allY,t.allCsucs,t.allHegy,t.homlok].map(x=>Math.round(x*100)).join(",");});
    const regiMentes=fedArcKod({fejW:27.8,allW:22.24});
    return {db:FACE_ARCFORMAK.length,kul:new Set(L).size,regiMentes,ujNev:FACE_ARCFORMAK.slice(3).map(a=>a[0])};});
  ok(r3.db===8&&r3.kul===8,"8 arcforma, mind más fejet ad",r3);
  ok(r3.regiMentes===2,"a 3.9.315 előtti (fejW-s) mentés a régi „széles” formára olvas",r3.regiMentes);

  console.log("\n— 4. a vonás-mag —");
  const r4=await p.evaluate(()=>{
    const jp={n:"Próba Vonás",nat:"Spanyolország",age:27};
    const T=ov=>{const regi=_faceModElo;_faceModElo={nev:jp.n,ov};try{return faceTraits(jp);}finally{_faceModElo=regi;}};
    const nem=t=>[t.fejTop,t.allY,t.allCsucs,t.szemTav,t.szemY,t.orrM,t.orrY,t.homlok].map(x=>Math.round(x*100)).join(",");
    const szerk=t=>[t.haj,t.szemTip,t.orr,t.szaj,t.szemoldTip,t.hajSzin,t.bor].join(",");
    const alap=T({}),L=[];for(let i=1;i<=12;i++)L.push(T({vonas:i*104729}));
    const edzo=T({vonas:-1});
    return {kul:new Set(L.map(nem)).size,szerkVal:new Set(L.map(szerk).concat([szerk(alap)])).size,
      ujraUgyanaz:nem(T({vonas:104729}))===nem(L[0]),
      jegyek:L.filter(t=>t.heg||t.anyajegy||t.gorbe||t.aszim).length,
      edzo:{heg:edzo.heg,anyajegy:edzo.anyajegy,gorbe:edzo.gorbe,homlok:edzo.homlok,orrM:edzo.orrM}};});
  ok(r4.kul===12&&r4.ujraUgyanaz,"más mag → más vonások; ugyanaz a mag → ugyanaz",r4);
  ok(r4.szerkVal===1,"a pörgetés a szerkeszthető jegyekhez (frizura, szemforma, orr-típus…) nem nyúl",r4.szerkVal);
  ok(r4.jegyek>=4,"a pörgetések egy része archibát hoz (heg, anyajegy, görbe orr, aszimmetria)",r4.jegyek);
  ok(!r4.edzo.heg&&!r4.edzo.anyajegy&&!r4.edzo.gorbe&&r4.edzo.homlok===1&&r4.edzo.orrM===1,"a kézi portré (edzők) új véletlen jegy nélkül marad",r4.edzo);

  console.log("\n— 5. a szerkesztő —");
  const r5=await p.evaluate(async()=>{
    const jp={n:"Próba Szerkesztő",nat:"Anglia",age:24};
    fedNyit(jp,{csakGlobal:true});await new Promise(r=>setTimeout(r,150));
    const sor=$("fedVonas"),o={van:!!sor};
    sor.click();await new Promise(r=>setTimeout(r,60));o.mag=_fed.vazlat.vonas;
    $("fedVonas").click();await new Promise(r=>setTimeout(r,60));o.mag2=_fed.vazlat.vonas;
    $("fedVonas0").click();await new Promise(r=>setTimeout(r,60));o.vissza=_fed.vazlat.vonas===undefined;
    for(let i=0;i<8;i++){fedLep("arc",1);}o.arcF=_fed.vazlat.arcF;o.nincsFejW=_fed.vazlat.fejW===undefined;
    fedVeletlen();o.veletlenMag=_fed.vazlat.vonas>0;
    fedBezar();return o;});
  ok(r5.van&&r5.mag>0&&r5.mag2>0&&r5.mag!==r5.mag2&&r5.vissza,"🎲 pörget (minden kattintás új mag), ↺ visszaáll a név szerintire",r5);
  ok(r5.arcF===7&&r5.nincsFejW,"az Arcforma sor az új formákra lép (8. lépés: gyémánt)",r5);
  ok(r5.veletlenMag,"a 🎲 Véletlen gomb a vonás-magot is pörgeti",r5.veletlenMag);

  console.log("\n— 6. a közös lista mint alap —");
  const r6=await p.evaluate(()=>{
    const nev="Próba Közös",jp={n:nev,nat:"Anglia",age:24};
    ARC_ALAP[nev]={haj:20,arcF:4};
    const kozos=faceTraits(jp);
    faceModSet("global",nev,{haj:25});
    const helyi=faceTraits(jp);
    fedNyit(jp,{csakGlobal:true});const eredeti=fedAlap(_fed.jp);fedBezar();
    faceModSet("global",nev,{});
    const vissza=faceTraits(jp);
    delete ARC_ALAP[nev];try{_faceCache.clear();}catch(e){}
    return {kozos:kozos.haj,kozosF:kozos.fejW,helyi:helyi.haj,helyiF:helyi.fejW,eredeti:eredeti.haj,vissza:vissza.haj};});
  ok(r6.kozos===20&&r6.kozosF===30,"a közös lista az alap (frizura, arcforma)",r6);
  ok(r6.helyi===25&&r6.helyiF===30,"a helyi globális felülírja, ami benne van; a többi a közösből marad",r6);
  ok(r6.eredeti===20&&r6.vissza===20,"az „eredeti” a közös lista — a helyi törlése oda áll vissza",r6);

  console.log("\n— 7. stylist-mód —");
  const r7=await p.evaluate(async()=>{
    const o={};
    try{renderProfileModal&&openProfileModal&&openProfileModal();}catch(e){}
    try{renderProfileModal();}catch(e){}
    const inp=$("huNamePass");o.mezo=!!inp;
    if(inp){inp.value="  Szutykos   Stylist vagyok ";inp.dispatchEvent(new Event("input"));}
    o.be=stylistOn();
    /* a hálózat helyett egy kém */
    const irasok=[];let online=false;
    lbInit=async()=>online?{mode:"on",uid:"uidTESZT",db:{},fns:{ref:(db,p)=>p,set:async(p,v)=>{irasok.push([p,v]);}}}:{mode:"off"};
    const nev="Lionel Messi",jp={n:nev,nat:"Argentína",age:25};
    fedNyit(jp,{csakGlobal:true});await new Promise(r=>setTimeout(r,100));
    o.felirat=/Stylist-mód/.test($("fedAl").textContent);
    _fed.vazlat={haj:21,vonas:777};fedMentes();
    await new Promise(r=>setTimeout(r,200));
    o.sorOffline=stylistSor().length;o.uzenetOffline=_fed&&_fed.uzenet;
    online=true;_fed.vazlat={haj:22,vonas:778,arcF:3};fedMentes();
    await new Promise(r=>setTimeout(r,250));
    o.sorOnline=stylistSor().length;o.irasok=irasok;o.uzenet=_fed&&_fed.uzenet;
    fedBezar();
    const [path,v]=irasok[irasok.length-1]||[];
    o.utvonalOk=/^stylist\/uidTESZT\/h[0-9a-z]{1,12}$/.test(path||"");
    o.kulcsOk=path&&path.endsWith(stylistKulcs(nev));
    o.formaOk=!!v&&typeof v.v==="number"&&typeof v.at==="number"&&typeof v.n==="string"&&typeof v.d==="string"&&v.d.length<=2000&&Object.keys(v).every(k=>["v","at","app","n","d"].includes(k));
    o.tartalom=v?JSON.parse(v.d):null;
    faceModSet("global",nev,{});stylistSet(false);
    return o;});
  ok(r7.mezo&&r7.be,"a profil-mező kulcsszava (kis/nagybetű, szóközök mindegy) bekapcsolja a stylist-módot",{mezo:r7.mezo,be:r7.be});
  ok(r7.felirat,"a szerkesztő kimondja, hogy a globális mentés a közös listára is megy",r7.felirat);
  ok(r7.sorOffline===1&&/sorban/.test(r7.uzenetOffline||""),"kapcsolat nélkül a feltöltés sorba áll",{sor:r7.sorOffline,uz:r7.uzenetOffline});
  ok(r7.sorOnline===0&&r7.irasok.length>=1&&r7.utvonalOk&&r7.kulcsOk&&r7.formaOk,"kapcsolattal felmegy a stylist/<uid>/<kulcs> ágra, a szabály formájában (a sor kiürül)",{path:r7.irasok.map(x=>x[0]),forma:r7.formaOk});
  ok(r7.tartalom&&r7.tartalom.haj===22&&r7.tartalom.arcF===3&&r7.tartalom.vonas===778,"a feltöltött kinézet a mentett (a vonás-maggal együtt)",r7.tartalom);

  console.log("\n— 8. a napi beépítés —");
  const os=require("os"),cp=require("child_process");
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"stylist-"));
  MASOLAT=path.join(dir,"index.html");fs.copyFileSync(path.join(ROOT,"index.html"),MASOLAT);
  const h=n=>{let x=2166136261>>>0;for(let i=0;i<n.length;i++){x^=n.charCodeAt(i);x=Math.imul(x,16777619)>>>0;}return "h"+(x>>>0).toString(36);};
  const exp={stylist:{u1:{[h("Lionel Messi")]:{v:1,at:1000,n:"Lionel Messi",d:JSON.stringify({haj:21,arcF:4,bor:99,gonosz:"<x>"})},
      [h("Kitalált Játékos")]:{v:1,at:9,n:"Kitalált Játékos",d:"{\"haj\":3}"}},
    u2:{[h("Lionel Messi")]:{v:1,at:2000,n:"Lionel Messi",d:JSON.stringify({haj:22,szakall:-1,vonas:4242})}}}};
  fs.writeFileSync(path.join(dir,"e1.json"),JSON.stringify(exp));
  const fut=f=>cp.execFileSync("node",[path.join(ROOT,"tools/stylist/beepit.js"),"--fajl",path.join(dir,f),"--html",MASOLAT],{encoding:"utf8"});
  const ki1=fut("e1.json");
  const blokk=/\/\*ARC-ALAP:KEZD\*\/([\s\S]*?)\/\*ARC-ALAP:VEG\*\//.exec(fs.readFileSync(MASOLAT,"utf8"))[1];
  const T1=JSON.parse(blokk);
  ok(T1["Lionel Messi"]&&T1["Lionel Messi"].haj===22&&T1["Lionel Messi"].vonas===4242&&!T1["Kitalált Játékos"]&&!("gonosz" in (T1["Lionel Messi"]||{})),
    "a legfrissebb bejegyzés épül be; ismeretlen név és mező kimarad",{T1,ki:ki1.trim()});
  const ki2=fut("e1.json");
  ok(/nincs változás/.test(ki2),"újrafuttatva nem változtat",ki2.trim());
  /* a betöltött játék a beépített listát használja */
  const p2=await (await b.newContext()).newPage();const e2=[];p2.on("pageerror",e=>e2.push(String(e)));
  await p2.goto(`http://127.0.0.1:${PORT}/stylist-masolat.html`,{waitUntil:"load"});await p2.waitForTimeout(900);
  const r8=await p2.evaluate(()=>{const T=faceTraits({n:"Lionel Messi",nat:"Argentína",age:25});return {haj:T.haj,szakall:T.szakall,alap:!!ARC_ALAP["Lionel Messi"]};});
  ok(r8.alap&&r8.haj===22&&r8.szakall===-1&&!e2.length,"a beépített listával betöltött játékban ez az alap kinézet",{r8,e2});
  /* törlés: üres d */
  fs.writeFileSync(path.join(dir,"e2.json"),JSON.stringify({stylist:{u3:{[h("Lionel Messi")]:{v:1,at:3000,n:"Lionel Messi",d:""}}}}));
  fut("e2.json");
  const T2=JSON.parse(/\/\*ARC-ALAP:KEZD\*\/([\s\S]*?)\/\*ARC-ALAP:VEG\*\//.exec(fs.readFileSync(MASOLAT,"utf8"))[1]);
  ok(!T2["Lionel Messi"],"a közös kinézet törlése (üres bejegyzés) kiveszi a listából",T2);
  try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
