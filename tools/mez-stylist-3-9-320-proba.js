/* 🎽 3.9.320 — A MECCS ELŐTTI MEZ-ABLAK (stylist-mód).

   KÉRÉS: „Aki bejelöli, hogy stylistkedik szívesen a játékban, az kapjon
   lehetőséget minden meccs előtt, amit játszik, gyorsan beállíthassa az
   ellenfél mezét. Amit beállít, az onnantól annak a csapatnak a globál,
   játékba alapértelmezettként beépített mez lesz, akárcsak az így elkészített
   játékoskinézetek. Minden meccs előtt legyen egy ilyen felugró ablak, olyan
   előtt is, amelyiknek már beállította. Legfeljebb rányom, hogy most nem
   akarja beállítani."

   Amit mér:
     1. a kapcsoló csak stylist-módban látszik a profilban; nélküle nincs ablak;
     2. bekapcsolva a kezdőrúgás előtt felugrik az ablak, az ellenfél nevével
        — a meccs csak a döntés után indul; a „Most nem" továbbenged;
     3. a mentés azonnal hat (az ellenfél meze mindenhol a beállított), és a
        stylist/<uid>/ ágra megy (v:2, „mez:" név, a szabály formájában);
     4. a következő meccs előtt is felugrik — akkor is, ha a csapatnak már van
        meze (és ezt kiírja); automatikus végigjátszásnál nem;
     5. ha a beállított mez a mienkhez túl közel esik, a váltómeze jön;
     6. „vissza a sorsoltra" törli (helyben és a közös listán); a mez
        szólhat a klub minden szezonjára vagy csak egy klub-szezonra — a
        klub-szezoné elsőbb, a többi szezonon a klubé marad;
     7. a napi beépítő a mezt a MEZ-ALAP blokkba teszi (név nélkül, kulcs
        szerint; ismeretlen mező / rossz szín kimarad), és a betöltött játék
        ezt használja; az üres bejegyzés kiveszi;
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9320;
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
    /* a meccsmotor helyett egy számláló — a kapu a kezdőrúgás ELŐTT dönt */
    window._motor=0;playMatchMotor=function(){window._motor++;};
    window._toast=[];backToast=function(m){window._toast.push(String(m));};});
  await p.waitForTimeout(800);

  console.log("— 1. a kapcsoló —");
  const r1=await p.evaluate(()=>{
    const o={};
    try{renderProfileModal();}catch(e){}
    o.nincsKapcsolo=!document.getElementById("mezStylistCb");
    let kesz=0;window._motor=0;
    S.auto=false;S.playing=false;
    playMatch();o.nelkulMotor=window._motor;o.nelkulAblak=!!(document.getElementById("mezModal")&&!document.getElementById("mezModal").classList.contains("hide"));
    stylistSet(true);renderProfileModal();
    const cb=document.getElementById("mezStylistCb");o.vanKapcsolo=!!cb;
    if(cb){cb.checked=true;cb.dispatchEvent(new Event("change"));}
    o.be=mezStylistOn();
    S.idx=1;S.playing=false;
    return o;});
  ok(r1.nincsKapcsolo&&r1.vanKapcsolo&&r1.be,"a kapcsoló csak stylist-módban látszik a profilban, és bekapcsolja",r1);
  ok(r1.nelkulMotor===1&&!r1.nelkulAblak,"kapcsoló nélkül nincs ablak, a meccs azonnal indul",r1);

  console.log("— 2–3. az ablak és a mentés —");
  const r2=await p.evaluate(async()=>{
    const o={};
    const irasok=[];
    lbInit=async()=>({mode:"on",uid:"uidTESZT",db:{},fns:{ref:(db,p)=>p,set:async(p,v)=>{irasok.push([p,v]);}}});
    window._motor=0;S.auto=false;S.playing=false;
    const nev=mezEllenfelNev();o.nev=nev;
    playMatch();
    const m=document.getElementById("mezModal");
    o.ablak=!!m&&!m.classList.contains("hide");o.motorElotte=window._motor;
    o.cim=$("mezCim").textContent;o.ujSzoveg=/még nincs beállított meze/.test($("mezTorzs").textContent);
    o.gombok=[...$("mezGombok").querySelectorAll("button")].map(b=>b.textContent);
    /* kék-fehér csíkos, V-nyak */
    const kat=(sel)=>{const b=$("mezTorzs").querySelector(sel);if(b)b.click();return !!b;};
    kat('[data-mezsw="c1"][data-hex="#1668c1"]');kat('[data-mezsw="c2"][data-hex="#f2f4f7"]');
    kat('[data-mezch="pat"][data-val="stripes"]');kat('[data-mezch="collar"][data-val="v"]');
    o.elonezet=$("mezElonezet").innerHTML.includes("#1668c1");
    $("mezGombok").querySelectorAll("button")[0].click();
    await new Promise(r=>setTimeout(r,250));
    o.motorUtana=window._motor;o.zarva=m.classList.contains("hide");
    o.kit=evaEllenfelKit(nev,{c1:"#c8102e"});
    o.irasok=irasok.map(([p,v])=>[p,v]);
    o.sor=stylistSor().length;
    return o;});
  ok(r2.ablak&&r2.motorElotte===0&&r2.cim.includes("Az ellenfél meze")&&r2.ujSzoveg,"bekapcsolva a kezdőrúgás előtt felugrik az ablak (a meccs még nem indult)",{cim:r2.cim,motor:r2.motorElotte});
  ok(r2.gombok.length===2&&/Most nem/.test(r2.gombok[1]),"két gomb: mentés és „Most nem” (beállított mez még nincs)",r2.gombok);
  ok(r2.elonezet&&r2.zarva&&r2.motorUtana===1,"az előnézet követi a választást; mentés után indul a meccs",{e:r2.elonezet,m:r2.motorUtana});
  ok(r2.kit.c1==="#1668c1"&&r2.kit.c2==="#f2f4f7"&&r2.kit.pat==="stripes"&&r2.kit.collar==="v","a mentett mez azonnal hat: az ellenfél meze mindenhol ez",r2.kit);
  const [ut,v]=r2.irasok[r2.irasok.length-1]||[];
  ok(/^stylist\/uidTESZT\/h[0-9a-z]{1,12}$/.test(ut||"")&&v&&v.v===2&&/^mez:/.test(v.n)&&JSON.parse(v.d).c1==="#1668c1"&&Object.keys(v).every(k=>["v","at","app","n","d"].includes(k))&&r2.sor===0,
    "felmegy a stylist/<uid>/ ágra (v:2, „mez:” név, a szabály formájában), a sor kiürül",{ut,v});

  console.log("— 4–6. a következő meccsek —");
  const r4=await p.evaluate(async()=>{
    const o={};
    const nev=mezEllenfelNev();
    window._motor=0;S.playing=false;
    /* ugyanaz a forduló (újra kezdőrúgás nélkül) → ugyanannak a meccsnek nem kérdez újra */
    playMatch();o.ugyanaz=window._motor===1&&document.getElementById("mezModal").classList.contains("hide");
    /* új forduló, ugyanaz az ellenfél (a menetrendet ideiglenesen erre állítjuk) */
    S.idx=2;S.playing=false;const f0=S.fixtures[2].o;S.fixtures[2].o=S.fixtures[1].o;
    playMatch();
    o.ablak=!document.getElementById("mezModal").classList.contains("hide");
    o.voltSzoveg=/már van beállított meze|minden szezonjára szóló meze/.test($("mezTorzs").textContent);
    o.gombok=[...$("mezGombok").querySelectorAll("button")].map(b=>b.textContent);
    $("mezGombok").querySelectorAll("button")[1].click();   /* Most nem (a számláló: 1 az előző + 1 ez) */
    o.motor=window._motor;o.kitMarad=evaEllenfelKit(nev,{c1:"#c8102e"}).c1;
    /* ütközés: a mi mezünk is kék */
    o.utkozes=evaEllenfelKit(nev,{c1:"#1668c1"});
    /* automatikus végigjátszás: nincs ablak */
    S.idx=3;S.playing=false;S.auto=true;window._motor=0;playMatch();
    o.auto=window._motor===1&&document.getElementById("mezModal").classList.contains("hide");S.auto=false;
    /* vissza a sorsoltra */
    S.idx=4;S.playing=false;S.fixtures[4].o=S.fixtures[1].o;playMatch();
    const gs=[...$("mezGombok").querySelectorAll("button")];
    o.visszaGomb=gs.length===3;gs[2].click();
    await new Promise(r=>setTimeout(r,200));
    o.torolve=mezFor(nev)===null&&evaEllenfelKit(nev,{c1:"#c8102e"}).c1!=="#1668c1";
    S.fixtures[2].o=f0;
    return o;});
  ok(r4.ugyanaz,"ugyanannak a meccsnek a második kezdőrúgásánál nem kérdez újra",r4.ugyanaz);
  ok(r4.ablak&&r4.voltSzoveg&&r4.gombok.length===3,"a következő meccs előtt is felugrik — akkor is, ha a csapatnak már van meze (és kiírja)",{v:r4.voltSzoveg,g:r4.gombok});
  ok(r4.motor===2&&r4.kitMarad==="#1668c1","„Most nem”: indul a meccs, a mez marad",{m:r4.motor,k:r4.kitMarad});
  ok(r4.utkozes.c1==="#f2f4f7"&&r4.utkozes.c2==="#1668c1","ha a mienkhez túl közel esik, a váltómeze jön (világos alap, a klub színével)",r4.utkozes);
  ok(r4.auto,"automatikus végigjátszásnál nincs ablak",r4.auto);
  ok(r4.visszaGomb&&r4.torolve,"„vissza a sorsoltra” törli a beállított mezt",{g:r4.visszaGomb,t:r4.torolve});

  console.log("— 6b. klub vagy klub-szezon —");
  const r6=await p.evaluate(async()=>{
    const o={};const irasok=[];
    lbInit=async()=>({mode:"on",uid:"uidTESZT",db:{},fns:{ref:(db,p)=>p,set:async(p,v)=>{irasok.push([p,v]);}}});
    const A="Teszt Szezonos FC (1985/86)",B="Teszt Szezonos FC (1990/91)";
    const meccs=async(nev,lepes)=>{S.idx=(S.idx||0)+1;S.playing=false;S.fixtures[S.idx].o={n:nev,ovr:80};playMatch();
      await new Promise(r=>setTimeout(r,50));const res=await lepes();await new Promise(r=>setTimeout(r,200));return res;};
    const katt=sel=>{const b=$("mezTorzs").querySelector(sel);if(b)b.click();return !!b;};
    S.idx=5;
    /* 1. A szezonján: a klub MINDEN szezonjára — zöld */
    o.v1=await meccs(A,async()=>{
      const v={szintGomb:!!$("mezTorzs").querySelector('[data-mezszint="szezon"]')};
      katt('[data-mezszint="klub"]');katt('[data-mezsw="c1"][data-hex="#0a7d34"]');katt('[data-mezsw="c2"][data-hex="#ffffff"]');
      v.gomb=$("mezGombok").querySelectorAll("button")[0].textContent;
      $("mezGombok").querySelectorAll("button")[0].click();return v;});
    o.Akit=mezFor(A).c1;o.Bkit=mezFor(B)&&mezFor(B).c1;
    /* 2. B szezonon: csak erre a klub-szezonra — piros */
    o.v2=await meccs(B,async()=>{
      const v={allapot:$("mezTorzs").textContent.includes("minden szezonjára szóló meze")};
      katt('[data-mezszint="szezon"]');katt('[data-mezsw="c1"][data-hex="#c8102e"]');
      v.gomb=$("mezGombok").querySelectorAll("button")[0].textContent;
      $("mezGombok").querySelectorAll("button")[0].click();return v;});
    o.A2=mezFor(A).c1;o.B2=mezFor(B).c1;
    /* 3. B szezon saját mezének törlése → visszaáll a klubé */
    o.v3=await meccs(B,async()=>{
      const v={szezonJelolt:$("mezTorzs").querySelector('[data-mezszint="szezon"]').classList.contains("sel")};
      const gs=[...$("mezGombok").querySelectorAll("button")];v.torolGomb=gs[2]&&gs[2].textContent;gs[2].click();return v;});
    o.B3=mezFor(B).c1;
    o.nevek=irasok.map(x=>x[1].n);
    /* szezon nélküli csapatnál nincs szint-választó */
    o.v4=await meccs("Kitalált Csapat SE",async()=>{const v=!!$("mezTorzs").querySelector("[data-mezszint]");$("mezGombok").querySelectorAll("button")[1].click();return v;});
    return o;});
  ok(r6.v1.szintGomb&&/minden szezonjára/.test(r6.v1.gomb)&&r6.Akit==="#0a7d34"&&r6.Bkit==="#0a7d34","a klub minden szezonjára mentett mez a klub másik szezonján is él",r6);
  ok(r6.v2.allapot&&/csak erre a klub-szezonra/.test(r6.v2.gomb)&&r6.B2==="#c8102e"&&r6.A2==="#0a7d34","egy klub-szezonra eltérő mez adható; a többi szezonon a klubé marad",{A:r6.A2,B:r6.B2,g:r6.v2.gomb});
  ok(r6.v3.szezonJelolt&&/klubé marad/.test(r6.v3.torolGomb||"")&&r6.B3==="#0a7d34","a klub-szezon saját mezének törlése után a klubé jön vissza",r6.v3);
  ok(r6.nevek.includes("mez:Teszt Szezonos FC")&&r6.nevek.includes("mez:Teszt Szezonos FC (1990/91)"),"a közös listára a szint szerinti név megy (klub / klub-szezon)",r6.nevek);
  ok(r6.v4===false,"szezon nélküli csapatnál nincs szint-választó (a kettő egy)",r6.v4);

  console.log("— 7. a napi beépítés —");
  const os=require("os"),cp=require("child_process");
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mez-"));
  MASOLAT=path.join(dir,"index.html");fs.copyFileSync(path.join(ROOT,"index.html"),MASOLAT);
  const h=n=>{let x=2166136261>>>0;for(let i=0;i<n.length;i++){x^=n.charCodeAt(i);x=Math.imul(x,16777619)>>>0;}return "h"+(x>>>0).toString(36);};
  const csapat=await p.evaluate(()=>mezCsapat(S.fixtures[1].o.n||S.fixtures[1].o));
  const K=h("mez:"+csapat);
  const exp={stylist:{u1:{[K]:{v:2,at:1000,n:"mez:"+csapat,d:JSON.stringify({c1:"#0A7D34",c2:"#ffffff",pat:"hoops",sleeve:"alt",collar:"polo",gonosz:"<x>"})},
      [h("mez:Rossz Szín")]:{v:2,at:5,n:"mez:Rossz Szín",d:JSON.stringify({c1:"red",c2:"#fff"})}},
    u2:{[K]:{v:2,at:500,n:"mez:"+csapat,d:JSON.stringify({c1:"#111318",c2:"#ffd400"})}}}};
  fs.writeFileSync(path.join(dir,"e1.json"),JSON.stringify(exp));
  const fut=f=>cp.execFileSync("node",[path.join(ROOT,"tools/stylist/beepit.js"),"--fajl",path.join(dir,f),"--html",MASOLAT],{encoding:"utf8"});
  const ki1=fut("e1.json");
  const mezBlokk=()=>JSON.parse(/\/\*MEZ-ALAP:KEZD\*\/([\s\S]*?)\/\*MEZ-ALAP:VEG\*\//.exec(fs.readFileSync(MASOLAT,"utf8"))[1]);
  const T1=mezBlokk();
  ok(T1[K]&&T1[K].c1==="#0a7d34"&&T1[K].pat==="hoops"&&!("gonosz" in T1[K])&&Object.keys(T1).length===1,"a legfrissebb mez épül be; rossz szín és ismeretlen mező kimarad",{T1,ki:ki1.trim()});
  ok(!fs.readFileSync(MASOLAT,"utf8").split("/*MEZ-ALAP:KEZD*/")[1].split("/*MEZ-ALAP:VEG*/")[0].includes(csapat),"a repóba csapatnév nem kerül (csak a kulcs)",K);
  const ki2=fut("e1.json");
  ok(/nincs változás/.test(ki2),"újrafuttatva nem változtat",ki2.trim());
  const p2=await (await b.newContext()).newPage();const e2=[];p2.on("pageerror",e=>e2.push(String(e)));
  await p2.goto(`http://127.0.0.1:${PORT}/stylist-masolat.html`,{waitUntil:"load"});await p2.waitForTimeout(900);
  const r7=await p2.evaluate(c=>{const k=evaEllenfelKit(c,{c1:"#c8102e"});return {c1:k.c1,pat:k.pat};},csapat);
  ok(r7.c1==="#0a7d34"&&r7.pat==="hoops"&&!e2.length,"a beépített listával betöltött játékban ez a csapat meze",{r7,e2});
  fs.writeFileSync(path.join(dir,"e2.json"),JSON.stringify({stylist:{u3:{[K]:{v:2,at:3000,n:"mez:"+csapat,d:""}}}}));
  fut("e2.json");
  ok(!mezBlokk()[K],"az üres bejegyzés kiveszi a mezt a listából",mezBlokk());
  try{fs.rmSync(dir,{recursive:true,force:true});}catch(e){}

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
