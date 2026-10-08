/* 🎚 3.9.223 — A FOKOZAT-CSOMAG (10 × 5) ÉS AZ ÚJ INDÍTÁS.

   KÉRÉS: „a fokozatok nem csak a résen alapulnak, hanem minden egyéb
   beállításon is, ami a nehézségre hatással van […] átalakítottam volna az
   egyszerű indítást arra, hogy 1 nagy nehézség választó oldal (amit
   részletesen ki lehet bontani ha akarsz) és utána minden mást be kell
   állítani, ami nem kifejezetten a nehézséghez tartozik, majd pedig
   draft/kész csapat, majd pedig divízió választó." · „legyen mind a 10
   fokozatnak 5 belső szintje […] két nagy fokozat között először a célrés
   lép, aztán a belső öt szint a további faktorokat lépteti […] Lvl 6 fölött
   már mindig csak realisztikus skill legyen, és minimum fejlődési tempó
   nehézség már a csiga tempó"

   Amit mér:
     1. A TÁBLA: a játék és a tools/nehezseg/fokozatok.js betűre azonos; a
        határon csak a célrés lép, belül egy-egy elem, mindig nehezebbre, és
        soha vissza; 6. fölött realisztikus képesség, 7-től legalább Csiga;
        a várható kimenet monoton;
     2. AZ ÚJ INDÍTÁS: három oldal; friss alapbeállításon az ajánlott 4.1;
        tíz lenyitható fokozat, mindegyikben öt belső szint; egy szint
        kiválasztása MINDEN elemet beállít és az alapbeállításba ír;
        egy elem kézi átírása „Egyéni"; újranyitva megmarad;
     3. ZÁR: a zárt elem helyett a legközelebbi nyitott (kiírva); a kezdő
        lépcsőn a lépcső dönt;
     4. A 2. OLDAL: a nem-nehézségi beállítások, és életbe lépnek;
        a 3. oldal: draft / kész klub, indulás, összefoglaló;
     5. AZ OSZTÁLYVÁLASZTÓ: a csomag összefoglalója, a célrés lenyitva
        módosítható; a karrier eltárolja a csomagot és a téli tűrést;
     6. A TÉL a csomag tűrésével mér;
     7. A BEÁLLÍTÁSOK 🎛️ BLOKKJA: a csomag választása az elemeket is beírja,
        egy elem átírása egyéni;
     8. DINAMIKUS MÓD: a fokozat nem él, az elemek egyenként; KÖZÖS KARRIER:
        a csomag a szoba rés-csúszkáját is állítja. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9264;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TOOL=require(path.join(ROOT,"tools/nehezseg/fokozatok.js"));
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404|MIME/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  console.log("\n— 1. a tábla —");
  const r1=await p.evaluate(()=>{
    const o={v:APP_VERSION,all:[]};
    for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++)o.all.push(nfCsomag(nf,s));
    o.idx=NF_ELEMEK.map(e=>({k:e.k,ert:e.ert}));
    o.kim=NF_KIMENET;o.n=NF_LEPESEK.length;
    return o;});
  ok(String(r1.v).localeCompare("3.9.223",undefined,{numeric:true})>=0,"verzió",r1.v);
  {let egyezik=true,elso=null;
   for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++){
     const a=r1.all[(nf-1)*5+s-1],t=TOOL.nfCsomag(nf,s);
     if(JSON.stringify(a)!==JSON.stringify(t)){egyezik=false;elso=elso||{nf,s,a,t};}}
   ok(egyezik&&r1.n===40,"a játék és a szimuláció táblája betűre azonos (50 szint, 40 lépés)",elso);}
  const ert=(c,k)=>k.startsWith("tempo.")?c.tempo[k.slice(6)]:c[k];
  const idx=(c,k)=>r1.idx.find(e=>e.k===k).ert.indexOf(ert(c,k));
  {let jo=true,hol=null;
   for(let i=1;i<50;i++){
     const a=r1.all[i-1],c=r1.all[i];
     const valt=r1.idx.filter(e=>ert(a,e.k)!==ert(c,e.k)).map(e=>e.k);
     const hatar=c.s===1;
     const vissza=r1.idx.some(e=>idx(c,e.k)<idx(a,e.k));
     const celLep=c.cel<a.cel;
     /* a 6. fokozattól a belső szinteken is lép a célrés, pontosan 0,1-et */
     const belsoCel=c.nf>=6?Math.abs((a.cel-c.cel)-0.1)<1e-9:c.cel===a.cel;
     /* belül egy elem — a 6. fokozattól lehet „csak a célrés" lépés is (a
        gyors mezőny helyén, lásd a doksit) */
     const elemOk=valt.length===1||(c.nf>=6&&valt.length===0);
     if(vissza||(hatar?(valt.length!==0||!celLep):(!elemOk||!belsoCel))){jo=false;hol=hol||{i,valt,hatar,a:a.cel,c:c.cel};}}
   ok(jo,"a határon csak a célrés lép, belül pontosan egy elem (a 6. fokozattól a célrés is −0,1) — mindig nehezebbre, soha vissza",hol);
   const cels=r1.all.map(c=>c.cel);
   ok(cels[0]===4&&cels[49]===-1&&cels.slice(25).every((v,i)=>i===0||Math.abs(cels[25+i-1]-v-0.1)<1e-9),
      "a célrés +4-től −1-ig; az 5. fokozat fölött szintenként 0,1",cels);}
  {const real=r1.all.filter(c=>c.nf>=6).every(c=>c.skill==="real");
   const csiga=r1.all.filter(c=>c.nf>=7).every(c=>["jatekos","penz","taktika","akademia"].every(a=>r1.idx[1].ert.indexOf(c.tempo[a])>=r1.idx[1].ert.indexOf("csiga")));
   ok(real&&csiga,"a 6. fokozattól realisztikus képesség, a 7.-től minden tempó legalább Csiga",{real,csiga});}
  {const a=r1.all[0],z=r1.all[49];
   ok(a.speed==="alvo"&&a.tempo.jatekos==="turbo"&&z.speed==="tarto"&&r1.all.every(c=>["alvo","lassu","tarto"].includes(c.speed))&&z.tempo.jatekos==="kokorszak"&&z.icons==="ki"&&z.tel==="szigoru",
      "1.1 a legkönnyebb, 10.5 a legnehezebb csomag (a mezőny-tempó legfeljebb Lépést tartanak)",{a,z});
   const h=r1.all[15];
   ok(h.nf===4&&h.s===1&&h.cel===2.2&&h.speed==="tarto"&&h.tempo.jatekos==="normal"&&h.skill==="loose"&&h.scout==="off"&&h.icons==="teljes"&&h.tel==="normal",
      "az ajánlott 4.1 a régi alapbeállítás közelében (Lépést tartanak, Alap tempó, lazán)",h);}
  {const K=r1.kim;let mon=true;
   for(let i=1;i<50;i++)if(K[i][0]>K[i-1][0]||K[i][1]>K[i-1][1]||K[i][2]<K[i-1][2]||K[i][4]>K[i-1][4])mon=false;
   ok(K.length===50&&mon,"a várható kimenet monoton (feljutás, cím ↓ · kiesőhely ↑ · rés ↓)",K.slice(14,22));}

  console.log("\n— 2. az új indítás —");
  const r2=await p.evaluate(()=>{
    const o={};
    try{localStorage.removeItem(KA_KEY);}catch(e){}_ka=null;
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);
    o.lathato=!document.getElementById("scQuick").classList.contains("hide");
    o.lapok=document.querySelectorAll("#qkSteps [data-qkl]").length;
    o.lap1=!document.getElementById("qkPg1").classList.contains("hide")&&document.getElementById("qkPg2").classList.contains("hide");
    o.fok=Object.assign({},pyrPickFok);o.ka=kaLoad().pyrFok;
    o.szintek=document.querySelectorAll("#qkDiff details.nfLvl").length;
    o.gombok=document.querySelectorAll("#qkDiff .nfSub[data-fok]").length;
    o.nyitva=[...document.querySelectorAll("#qkDiff details.nfLvl")].filter(d=>d.open).length;
    o.miert=document.querySelectorAll("#qkDiff details.nfLvl details").length;
    /* 6.3 kiválasztása */
    document.querySelector('#qkDiff [data-fok="6.3"]').click();
    o.a63={fok:Object.assign({},pyrPickFok),sp:pyrWantedSpeed,t:tempoAxPrefMap(),sk:skillModeWanted,ic:iconRatePref(),sc:scoutRealWanted,tel:pyrPickTel,nf:pyrPickNf,ka:kaLoad().pyrFok,kaSp:kaLoad().speed,egy:nfEgyezik(6,3)};
    o.jel=!!document.querySelector('#qkDiff .nfSub.sel[data-fok="6.3"]');
    /* egy elem kézi átírása */
    const el=document.querySelector('#qkDiff select[data-nfe="icons"]');el.value="ki";el.dispatchEvent(new Event("change"));
    o.egyeni={fok:Object.assign({},pyrPickFok),ka:kaLoad().pyrFok,ic:iconRatePref(),cim:document.querySelector("#qkDiff .nfValasztott").textContent};
    /* újranyitva megmarad (nem írja vissza a csomagot) */
    quickShow();
    o.ujra={fok:Object.assign({},pyrPickFok),ic:iconRatePref(),sp:pyrWantedSpeed};
    /* a célrés egyéniben */
    const nfs=document.querySelector('#qkDiff select[data-nfe="nf"]');nfs.value="5";nfs.dispatchEvent(new Event("change"));
    o.celres={nf:pyrPickNf,ka:kaLoad().pyrNf};
    return o;});
  ok(r2.lathato&&r2.lapok===3&&r2.lap1,"három oldal, az 1. a nehézség",r2);
  ok(r2.fok.nf===4&&r2.fok.s===1&&!r2.fok.egyeni&&r2.ka==="4.1","friss alapbeállításon az ajánlott 4.1",{f:r2.fok,ka:r2.ka});
  ok(r2.szintek===10&&r2.gombok===50&&r2.nyitva===1&&r2.miert===10,"tíz lenyitható fokozat, mindegyikben öt belső szint és a célrés magyarázata",r2);
  {const a=r2.a63;
   ok(a.sp==="tarto"&&a.t.jatekos==="komotos"&&a.t.penz==="csiga"&&a.t.taktika==="csiga"&&a.t.akademia==="csiga"&&a.sk==="real"&&a.ic==="ritka"&&a.sc===true&&a.tel==="normal"&&a.nf===6&&a.egy&&r2.jel,
      "a 6.3 kiválasztása MINDEN elemet beállít",a);
   ok(a.ka==="6.3"&&a.kaSp==="tarto","…és az alapbeállításba is írja",a);}
  ok(r2.egyeni.fok.egyeni&&r2.egyeni.ka==="e6.3"&&r2.egyeni.ic==="ki"&&/Egyéni/.test(r2.egyeni.cim),"egy elem kézi átírása „Egyéni” (a 6.3-ból)",r2.egyeni);
  ok(r2.ujra.fok.egyeni&&r2.ujra.ic==="ki"&&r2.ujra.sp==="tarto","újranyitva az egyéni megmarad",r2.ujra);
  ok(r2.celres.nf===5&&r2.celres.ka==="5","egyéniben a célrés-fokozat is állítható",r2.celres);

  console.log("\n— 3. zárak és a lépcső —");
  const r3=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>true;
    const u=unlockState();u.d1=3;u.runs=0;u.bestRun=0;u.icons=0;u.maxSkills=0;u.skills=0;
    /* 1.1: az Alvó mezőny még zárt (3 karrier + 40-es Run) → Lassan követnek */
    const c=nfCsomagHatasos(nfCsomag(1,1));
    o.h11={sp:c.speed,hely:c.hely.map(h=>h.k+":"+h.volt+"→"+h.lett)};
    const c6=nfCsomagHatasos(nfCsomag(6,1));
    o.h61={sk:c6.skill,ic:c6.icons,sp:c6.speed,t:c6.tempo,n:c6.hely.length};
    quickShow();
    o.helySor=[...document.querySelectorAll('#qkDiff [data-fok="1.1"] .hely')].map(x=>x.textContent);
    /* a kezdő lépcső */
    u.d1=0;quickShow();
    o.lepcso={txt:document.getElementById("qkDiff").textContent.slice(0,200),lista:document.querySelectorAll("#qkDiff .nfLvl").length};
    u.d1=3;unlockGatesOn=()=>false;
    return o;});
  ok(r3.h11.sp==="lassu"&&r3.h11.hely.some(x=>/^speed:alvo→lassu/.test(x)),"a zárt Alvó mezőny helyett a legközelebbi nyitott (Lassan követnek)",r3.h11);
  ok(r3.h61.sk==="loose"&&r3.h61.ic==="teljes"&&r3.h61.sp==="lassu"&&r3.h61.t.akademia==="normal"&&r3.h61.n>=3,"a zárt elemek a legközelebbi nyitottra esnek (képesség, ikon, ellenfél, tempók)",r3.h61);
  ok(r3.helySor.length>=1&&/helyett/.test(r3.helySor[0]),"a sor kiírja a helyettesítést",r3.helySor);
  ok(r3.lepcso.lista===0&&/lépcső/.test(r3.lepcso.txt),"a kezdő lépcsőn a lépcső dönt (nincs fokozat-lista)",r3.lepcso);

  console.log("\n— 4. a 2. és a 3. oldal —");
  const r4=await p.evaluate(()=>{
    const o={};
    quickShow();document.getElementById("qkNextBtn").click();
    o.lap2=!document.getElementById("qkPg2").classList.contains("hide");
    o.mezok=[...document.querySelectorAll("#qkEgyeb select[data-qka]")].map(x=>x.dataset.qka);
    const fam=document.querySelector('#qkEgyeb select[data-qka="family"]');fam.value="on";fam.dispatchEvent(new Event("change"));
    o.fam=familyEnabled;o.kaFam=kaLoad().family;
    const ff=document.querySelector('#qkEgyeb select[data-qka="form"]');ff.value="433";ff.dispatchEvent(new Event("change"));
    o.form=form;
    o.nincsNeh=!document.querySelector('#qkEgyeb select[data-qka="speed"],#qkEgyeb select[data-qka="tempo"],#qkEgyeb select[data-qka="skill"],#qkEgyeb select[data-qka="scoutReal"]');
    document.getElementById("qkNextBtn").click();
    o.lap3=!document.getElementById("qkPg3").classList.contains("hide");
    o.start=document.querySelectorAll("#qkStartGrid [data-qs]").length;
    o.go=!!document.getElementById("qkGoBtn");
    o.recap=[...document.querySelectorAll("#qkRecap .setupRecapRow .k")].map(x=>x.textContent);
    o.recapFok=[...document.querySelectorAll("#qkRecap .setupRecapRow")].map(x=>x.textContent).find(t=>/Nehézségi fokozat/.test(t));
    o.next=document.getElementById("qkNextBtn").classList.contains("hide");
    document.getElementById("qkPrevBtn").click();o.vissza=!document.getElementById("qkPg2").classList.contains("hide");
    familyEnabled=false;
    return o;});
  ok(r4.lap2&&["form","basis","family","magyah","rerolls","wc","guide"].every(k=>r4.mezok.includes(k))&&r4.nincsNeh,"a 2. oldal: a nem-nehézségi beállítások (és csak azok)",r4.mezok);
  ok(r4.fam===true&&r4.kaFam==="on"&&r4.form==="433","a 2. oldal választásai életbe lépnek és tárolódnak",r4);
  ok(r4.lap3&&r4.start===2&&r4.go&&r4.next&&r4.vissza,"a 3. oldal: draft / kész klub, indulás; a lapozó oda-vissza",r4);
  ok(r4.recapFok&&/Egyéni|belső szint/.test(r4.recapFok),"az összefoglaló a fokozat-csomagot írja",r4.recapFok);

  console.log("\n— 5. az osztályválasztó és a karrier —");
  const r5=await p.evaluate(()=>{
    const o={};
    nfCsomagAlkalmaz(8,2);   /* a 8.2-ben lép a tél szigorúra */
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();
    const box=document.getElementById("pyrDiffList");
    o.ossz=!!box.querySelector("#pyrFokOssz");o.osszTxt=(box.querySelector("#pyrFokOssz")||{}).textContent||"";
    const d=box.querySelector("#pyrCelresValaszto");o.celresZart=d&&!d.open;
    o.celSor=box.querySelectorAll("#pyrCelresValaszto [data-nfpick]").length;
    pyrConfirmDiv();
    o.pyr={padlo:S.pyr.padlo,nf:S.pyr.nf,tel:S.pyr.tel,fok:S.pyr.fok,speed:S.pyr.aiSpeed};
    o.skillReal=S.skillReal;o.scoutReal=S.scoutReal;
    return o;});
  ok(r5.ossz&&/Legendás/.test(r5.osszTxt)&&r5.celresZart&&r5.celSor===10,"az osztályválasztón a csomag összefoglalója; a célrés lenyitva módosítható",r5);
  ok(r5.pyr.padlo===2&&r5.pyr.nf===8&&r5.pyr.tel==="szigoru"&&r5.pyr.fok&&r5.pyr.fok.nf===8&&r5.pyr.fok.s===2&&!r5.pyr.fok.egyeni,"a karrier eltárolja a csomagot és a téli tűrést",r5.pyr);
  ok(r5.pyr.speed==="tarto"&&r5.skillReal===true&&r5.scoutReal===true,"a csomag elemei a karrierben élnek (ellenfél, képesség, scout)",r5);

  console.log("\n— 6. a tél a csomag tűrésével —");
  const r6=await p.evaluate(()=>{
    const o={};
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    const gap=()=>{msRatedBegin();try{return Math.round(levelGap()*10)/10;}finally{msRatedEnd();}};
    const rec=pyrFloorHist()[1];S.idx=15;
    {const kell=(rec.cel+0.8)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.g=gap();o.cel=rec.cel;
    o.m=pyrFloorMid();
    /* normál tűréssel (+0,5) ugyanott kisebb lenne */
    rec.midDone=false;S.pyr.tel="normal";delete S.pyr.midLift;rec.mid=0;
    {const kell=(rec.cel+0.8)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.g2=gap();o.m2=pyrFloorMid();
    return o;});
  ok(r6.m&&Math.abs(r6.m.amt-(r6.g-r6.cel))<=0.11,"szigorú télen a célrés fölötti teljes rész a mezőnyé",r6);
  ok(r6.m2&&Math.abs(r6.m2.amt-(r6.g2-r6.cel-0.5))<=0.11,"normál télen a +0,5 tűrésen túli rész",r6);

  console.log("\n— 7. a Beállítások 🎛️ blokkja —");
  const r7=await p.evaluate(()=>{
    const o={};
    const m=document.getElementById("themeModal");m.classList.remove("hide");renderThemeModal();
    const sel=document.querySelector('#kaBox select[data-ka="pyrFok"]');
    o.van=!!sel;o.opt=sel?sel.options.length:0;
    sel.value="7.2";sel.dispatchEvent(new Event("change"));
    const st=kaLoad();o.st={fok:st.pyrFok,nf:st.pyrNf,sp:st.speed,t:st.tempo,tax:st.tax,ic:st.icons,sk:st.skill,sc:st.scoutReal,tel:st.pyrTel};
    const sp=document.querySelector('#kaBox select[data-ka="speed"]');
    sp.value="tarto";sp.dispatchEvent(new Event("change"));
    o.egyeni=kaLoad().pyrFok;
    o.tel=!!document.querySelector('#kaBox select[data-ka="pyrTel"]');
    m.classList.add("hide");
    return o;});
  {const c=TOOL.nfCsomag(7,2);
   ok(r7.van&&r7.opt===51&&r7.st.fok==="7.2"&&r7.st.nf==="7"&&r7.st.sp===c.speed&&r7.st.t===c.tempo.jatekos&&r7.st.ic===c.icons&&r7.st.sk===c.skill&&r7.st.sc===c.scout&&r7.st.tel===c.tel,
      "a csomag választása az elemeket is beírja",r7.st);}
  ok(r7.egyeni==="e7.2"&&r7.tel,"egy elem átírása után egyéni",r7);

  console.log("\n— 8. dinamikus mód és közös karrier —");
  const r8=await p.evaluate(()=>{
    const o={};
    gameMode="career";enterCareerSetupFromHome(false);
    o.dyn={lista:document.querySelectorAll("#qkDiff .nfLvl").length,
      mezok:[...document.querySelectorAll("#qkDiff select[data-qka],#qkDiff select[data-qkaim],#qkDiff select[data-qktax]")].map(x=>x.dataset.qka||(x.dataset.qkaim?"aim":"tax:"+x.dataset.qktax))};
    /* közös karrier: a csomag a szoba rés-csúszkáját is állítja */
    MP.active=true;pyrWanted=true;pyrWantedDiv=5;
    nfCsomagAlkalmaz(5,1);o.mpGap=pyrWantedGap;
    o.mpVart=diffSnapT(nfRajtCel(nfDef(5).cel,5,null,nfCsomagHatasos(nfCsomag(5,1)).speed))/10;
    MP.active=false;
    return o;});
  ok(r8.dyn.lista===0&&["dynLevel","aim","tempo","icons","skill","scoutReal"].every(k=>r8.dyn.mezok.includes(k))&&r8.dyn.mezok.filter(x=>/^tax:/.test(x)).length===4,
     "dinamikus módban a fokozat nem él, az elemek egyenként",r8.dyn);
  ok(Math.abs(r8.mpGap-r8.mpVart)<1e-9,"közös karrierben a csomag a szoba rés-csúszkáját a rajt-célra teszi",r8);

  console.log("\n— 9. a fokozatok feloldása —");
  const r9=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>true;
    const u=unlockState();
    /* új játékos (a 3.9.223 első futásakor 3-as profil) */
    delete u.nfMig;delete u.nfMind;delete u.nfMax;
    const _pl=profileLevel;profileLevel=()=>3;
    o.uj={max:nfNyitottMax(),z6:nfFokZart(6),z7:nfFokZart(7),mind:u.nfMind};
    /* később eléri a 10-es szintet — rá már nem vonatkozik */
    profileLevel=()=>12;o.kesobb=nfNyitottMax();
    /* nyerés a 7. fokozat 3. belső szintjén… előbb a 6.-on */
    const sn=S.seasonNumber||1;S.pyr.padlo=2;S.pyr.vallH=S.pyr.vallH||{};
    S.pyr.vallH[sn]=Object.assign({},S.pyr.vallH[sn]||{},{nf:6});
    if(S.run)delete S.run.nfWinNoted;
    o.nyer6=nfCareerWin(true);o.max6=nfNyitottMax();
    o.masodszor=nfCareerWin(true);
    if(S.run)delete S.run.nfWinNoted;S.pyr.vallH[sn].nf=7;S.pyr.fok={nf:7,s:3,egyeni:false};
    o.nyer7=nfCareerWin(false);o.max7=nfNyitottMax();
    o.naplo=/Megnyílt a 8\. fokozat/.test(document.body.textContent);
    /* a korábbi, legalább 10-es profilú játékosnak minden nyitva */
    delete u.nfMig;delete u.nfMind;delete u.nfMax;
    o.regi={max:nfNyitottMax(),z10:nfFokZart(10)};
    profileLevel=_pl;
    /* a beállítón: a zárt fokozat gombjai tiltva, a nyitottak nem */
    delete u.nfMig;delete u.nfMind;u.nfMax=0;u.nfMig=1;u.nfMind=false;
    pyrWanted=true;quickShow();
    o.gomb7=document.querySelector('#qkDiff [data-fok="7.1"]').disabled;
    o.gomb6=document.querySelector('#qkDiff [data-fok="6.5"]').disabled;
    unlockGatesOn=()=>false;
    return o;});
  ok(r9.uj.max===6&&!r9.uj.z6&&r9.uj.z7&&r9.uj.mind===false,"új játékosnak az első 6 fokozat nyitott",r9.uj);
  ok(r9.kesobb===6,"aki a frissítés után éri el a 10-es profilt, annak nem nyílik minden",r9.kesobb);
  ok(r9.nyer6===7&&r9.max6===7&&r9.masodszor===null,"a 6. fokozaton megnyert karrier a 7.-et nyitja (karrierenként egyszer)",r9);
  ok(r9.nyer7===8&&r9.max7===8&&r9.naplo,"a 7.3-on megnyert karrier a következő NAGY fokozatot (8.) nyitja, és kimondja",r9);
  ok(r9.regi.max===10&&!r9.regi.z10,"a frissítés előtt legalább 10-es profilú játékosnak minden nyitva",r9.regi);
  ok(r9.gomb7===true&&r9.gomb6===false,"a beállítón a zárt fokozat szintjei tiltva",r9);

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
