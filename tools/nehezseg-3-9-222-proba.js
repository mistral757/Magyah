/* 🎚 3.9.222 — TÍZFOKOZATÚ, KÉTOLDALÚ NEHÉZSÉG (piramis) + ÁTÁLLÁS.

   KÉRÉS: „Szerintem legyünk többfokozatúak … 1. homokozó, 2. kezdő,
   3. simaliba, 4. haladó, 5. nehéz, 6. professzionális, 7. mesteri,
   8. legendás, 9. gyilkos, 10. semmi esély — legyenek lenyithatók, ahol
   részletezi, hogy ez milyen settings · Jó lesz a holtsáv · A dinamikust
   hagyjuk egyelőre · Legyen a futón: átállok legyen ==> itt is lehessen
   lenyitni, melyik mit jelent settings szinten"

   Amit mér:
     1. A TÍZ FOKOZAT: nevek, sorrend, csökkenő célrés, a holtsáv 1,5;
     2. A RAJT-CÉL: a modellből (első idény) és a mért változásból (dg);
     3. A KEZDŐRÚGÁS: felül emel (padló), alul a holtsáv alatt fékez —
        legfeljebb egy éves ütemnyit; a holtsávban nem nyúl hozzá;
     4. A TÉL a célrés +0,5-höz mér; AZ IDÉNY VÉGE rögzíti a dg-t, a
        következő rajt-cél abból tanul;
     5. A HATÁROK: könnyíteni a kezdő fokozatnál kettővel könnyebbig,
        nehezíteni egy fokkal, sikeres idény után;
     6. A BEÁLLÍTÓ: a tíz fokozat lenyitható sorai, a választás → padlo 2,
        nf, célrés; a KA megjegyzi; a finomhangolás lenyitható;
     7. NYÁR: a HUB gombja a fokozatot mutatja, a képernyő lenyitható sorokkal;
     8. ÁTÁLLÁS: futó karrier, csak két idény között, lenyitható sorokkal,
        a választás → padlo 2;
     9. A RUN levonja a féket; A MÉRŐ rögzíti a fokozatot; KÖZÖS KARRIER:
        a szoba csomagja padlo:2, a régi házigazda a régit viszi. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9263;
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
const kozel=(a,b,e)=>Math.abs(a-b)<=(e||0.25);
const KEP=process.env.KEP||"";   /* képernyőképek könyvtára (opcionális) */
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  console.log("\n— 1. a tíz fokozat —");
  const r1=await p.evaluate(()=>({v:APP_VERSION,L:NF_LEVELS.map(x=>({nf:x.nf,n:x.n,cel:x.cel,fel:x.fel,cim:x.cim,kies:x.kies})),
    hs:NF_HOLTSAV,aj:NF_AJANLOTT}));
  ok(String(r1.v).localeCompare("3.9.222",undefined,{numeric:true})>=0,"verzió",r1.v);
  ok(r1.L.map(x=>x.n).join("|")==="Homokozó|Kezdő|Simaliba|Haladó|Nehéz|Professzionális|Mesteri|Legendás|Gyilkos|Semmi esély",
     "a tíz fokozat a kért sorrendben",r1.L.map(x=>x.n));
  ok(r1.L.every((x,i)=>x.nf===i+1&&(i===0||x.cel<r1.L[i-1].cel)&&(i===0||x.fel<=r1.L[i-1].fel)&&(i===0||x.kies>=r1.L[i-1].kies)),
     "a célrés, a feljutás csökken, a kiesés nő",r1.L.map(x=>x.cel));
  ok(r1.hs===1.5&&r1.aj===4,"holtsáv 1,5 · ajánlott a Haladó",r1);

  console.log("\n— 2. a rajt-cél —");
  const r2=await p.evaluate(()=>{
    const F=nfMezonyUtem(6,"tarto");
    const k=nfRajtCel(2.5,6,null,"tarto");
    return {F,k,vissza:k+(nfSodrodasModell(k)-F)/2,dg:nfRajtCel(2.5,6,4,"tarto"),
      celRajtbol:nfCelFromRajt(k,6,"tarto"),kozel:nfNearest(2.4).nf,kozel2:nfNearest(-2.6).nf};});
  ok(r2.F>0&&r2.k<2.5&&kozel(r2.vissza,2.5,0.02),"az első idényben: rajt + (sodródás − ütem)/2 = célrés",r2);
  ok(kozel(r2.dg,0.5,0.001),"mért változással: rajt = célrés − dg/2",r2.dg);
  ok(kozel(r2.celRajtbol,2.5,0.06)&&r2.kozel===4&&r2.kozel2===10,"visszaszámolás és a legközelebbi fok",r2);

  /* ---- karrier a beállítón át (a 3. fokozattal) ---- */
  console.log("\n— 6. a beállító —");
  const r6=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();
    const box=document.getElementById("pyrDiffList");
    o.sorok=box.querySelectorAll("[data-nfpick]").length;
    o.lenyit=box.querySelectorAll("details").length;
    o.finom=/Finomhangolás/.test(box.innerHTML)&&!!box.querySelector("details #pyrDiffRange");
    const d=box.querySelector("[data-nfpick='3']").closest("div").querySelector("details");
    o.reszlet=d?d.textContent:"";
    box.querySelector("[data-nfpick='3']").click();
    o.pick=pyrPickNf;o.gap=pyrPickGap;
    o.vart=diffSnapT(nfRajtCel(nfDef(3).cel,pyrPickDiv||PYR_DIVS,null,pyrPendingSpeed))/10;
    o.jelolt=!!document.querySelector("#pyrDiffList [data-nfpick='3']").textContent.includes("✓");
    /* csúszkás finomhangolás → a fokozat felejtődik, a célrés a rajtból */
    pyrDiffSetT(DIFF_DEFAULT_T);o.csuszka=pyrPickNf;
    document.querySelector("#pyrDiffList [data-nfpick='3']").click();
    pyrConfirmDiv();
    o.padlo=S.pyr.padlo;o.nf=S.pyr.nf;o.nf0=S.pyr.nf0;o.cel=S.pyr.cel;o.on=nfOn();
    o.ka=kaLoad().pyrNf;
    /* a KA visszatölti */
    pyrPickNf=null;kaPyrPickDefaults();o.kaVissza=pyrPickNf;
    return o;});
  /* 3.9.223: a célrés-lista maga is lenyitható (a csomag már az indításkor eldőlt) */
  ok(r6.sorok===10&&r6.lenyit>=11&&r6.finom,"tíz lenyitható sor + a létra lenyitható finomhangolásként",r6);
  ok(/Célrés/.test(r6.reszlet)&&/feljutás/.test(r6.reszlet)&&/Rajt/.test(r6.reszlet)&&/holtsáv/i.test(r6.reszlet)&&/lemaradsz/.test(r6.reszlet),
     "a lenyitott sor a beállításokat részletezi",r6.reszlet.slice(0,300));
  ok(r6.pick===3&&kozel(r6.gap,r6.vart,0.001)&&r6.jelolt,"a fok kiválasztása a rajt-célra állítja a létrát",r6);
  ok(r6.csuszka===null,"a csúszka finomhangolása a fokozatot elengedi",r6.csuszka);
  ok(r6.padlo===2&&r6.nf===3&&r6.nf0===3&&r6.cel===2.8&&r6.on,"az új karrier kétoldalú, a választott fokkal",r6);
  ok(r6.ka==="3"&&r6.kaVissza===3,"a KA megjegyzi és visszatölti",r6);

  /* a karrier játszhatóvá tétele */
  await p.evaluate(()=>{
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    phase="season";S.seasonClosed=false;});

  console.log("\n— 3. a kezdőrúgás: felül emel, alul fékez —");
  const r3=await p.evaluate(()=>{
    const o={};
    const gap=()=>{msRatedBegin();try{return Math.round(levelGap()*10)/10;}finally{msRatedEnd();}};
    const H=pyrFloorHist();o.h1=Object.assign({},H[1]);
    /* 1. idény: rajt-rés a horgonyé; az idény vége rögzíti a dg-t */
    S.idx=30;
    {const kell=(H[1].utana+4)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.v1=nfIdenyVege();o.v1b=nfIdenyVege();
    o.dg1=H[1].dg;o.mert=nfMertValtozas();
    S.seasonHistory=[{season:1,rank:1,pts:70,w:22,d:4,l:4,gf:60,ga:20,oppRating:oppTargetRating,teamAvg:85}];
    S.seasonNumber=2;S.idx=0;
    /* A) elhúztál: 5-tel a rajt-cél fölött */
    o.want2=pyrFloorWantFor(2);
    o.want2vart=Math.round(nfRajtCel(nfDef(nfLevelFor(2)).cel,S.pyr.my,o.mert)*10)/10;
    {const kell=(o.want2+5)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.a_elotte=gap();const hA=pyrFloorKickoff();o.a=Object.assign({},hA);o.a_utana=gap();
    /* B) holtsávban (0,8-del a rajt-cél alatt): nem nyúl hozzá */
    S.seasonHistory.push({season:2,rank:5,pts:50,w:14,d:8,l:8,gf:44,ga:36,oppRating:oppTargetRating,teamAvg:86});
    S.seasonNumber=3;
    o.want3=pyrFloorWantFor(3);
    {const kell=gap()-(o.want3-0.8);pyrShiftWorld({divs:S.pyr.divs},-kell);oppTargetRating=pyrLevel();}
    o.b_elotte=gap();const szB=pyrLevel();const hB=pyrFloorKickoff();o.b=Object.assign({},hB);
    o.b_szint=Math.round((pyrLevel()-szB)*10)/10;
    /* C) mélyen alatta (6-tal): a fék legfeljebb egy éves ütemnyit vesz vissza */
    S.seasonHistory.push({season:3,rank:9,pts:40,w:10,d:10,l:10,gf:36,ga:40,oppRating:oppTargetRating,teamAvg:86});
    S.seasonNumber=4;
    o.want4=pyrFloorWantFor(4);
    {const kell=gap()-(o.want4-9);pyrShiftWorld({divs:S.pyr.divs},-kell);oppTargetRating=pyrLevel();}
    o.c_elotte=gap();const szC=pyrLevel();
    o.utem=nfMezonyUtem(S.pyr.my);
    const hC=pyrFloorKickoff();o.c=Object.assign({},hC);o.c_utana=gap();
    o.c_szint=Math.round((pyrLevel()-szC)*10)/10;
    o.naplo=[...document.querySelectorAll("#log .line, #log div")].map(x=>x.textContent).filter(t=>/Alsó fék/.test(t)).length
      ||/Alsó fék/.test(document.body.textContent);
    /* D) enyhén alatta (2,5-del): a fék csak a holtsáv széléig húz */
    S.seasonHistory.push({season:4,rank:10,pts:38,w:9,d:11,l:10,gf:30,ga:38,oppRating:oppTargetRating,teamAvg:86});
    S.seasonNumber=5;
    o.want5=pyrFloorWantFor(5);
    {const kell=gap()-(o.want5-2.5);pyrShiftWorld({divs:S.pyr.divs},-kell);oppTargetRating=pyrLevel();}
    o.d_elotte=gap();const hD=pyrFloorKickoff();o.d=Object.assign({},hD);o.d_utana=gap();
    return o;});
  ok(r3.h1.nf===3&&r3.h1.cel===2.8&&typeof r3.h1.utana==="number","az 1. idény sora a fokozattal és a rajt-réssel",r3.h1);
  ok(r3.v1&&typeof r3.dg1==="number"&&r3.v1b===null&&kozel(r3.mert,r3.dg1,0.011),"az idény vége rögzíti a dg-t, egyszer",{dg:r3.dg1,m:r3.mert});
  ok(kozel(r3.want2,r3.want2vart,0.001),"a 2. idény rajt-célja a mért változásból tanul",{w:r3.want2,v:r3.want2vart});
  ok(r3.a.lift>3&&r3.a_utana<=r3.a.want+0.16&&r3.a.fek===0&&r3.a.nf===3&&r3.a.cel===2.8,"elhúztál → a mezőny felnő a rajt-célig",r3.a);
  ok(r3.b.lift===0&&r3.b.fek===0&&Math.abs(r3.b_szint)<0.01,"a holtsávban a mezőny a saját útját járja",{b:r3.b,sz:r3.b_szint});
  ok(r3.c.fek>0&&r3.c.fek<=r3.utem+0.6&&r3.c_szint<0&&r3.c_utana>r3.c_elotte,"mélyen (9-cel) alatta → a fék legfeljebb egy éves ütemnyit vesz vissza",{c:r3.c,utem:r3.utem,e:r3.c_elotte,u:r3.c_utana});
  ok(r3.c_utana<r3.c.want-1.5-0.5&&r3.c.fek>=r3.utem-0.6,"a fék nem ajándék: ha az ütem kevés, a holtsávig sem húz fel",{u:r3.c_utana,w:r3.c.want});
  ok(r3.naplo,"a napló kimondja az alsó féket");
  /* a világ egész-szintű kerekítése miatt a beállított rés a széltől fél lépésen
     belül is lehet — ilyenkor a fék joggal nem lép (3.9.223) */
  ok((r3.d.fek>0||Math.abs(r3.d.elotte-(r3.d.want-1.5))<=0.5)&&r3.d_utana>=r3.d.want-1.5-0.6&&r3.d_utana<=r3.d.want-1.5+0.6,"enyhén alatta → a holtsáv széléig",{d:r3.d,u:r3.d_utana});

  console.log("\n— 4. a tél —");
  const r4=await p.evaluate(()=>{
    const o={};
    const gap=()=>{msRatedBegin();try{return Math.round(levelGap()*10)/10;}finally{msRatedEnd();}};
    const rec=pyrFloorHist()[5];S.idx=15;
    {const kell=(rec.cel+0.5+3)-gap();pyrShiftWorld({divs:S.pyr.divs},kell);oppTargetRating=pyrLevel();}
    o.elotte=gap();o.cel=rec.cel;o.want=rec.want;
    o.m=pyrFloorMid();
    return o;});
  ok(r4.m&&kozel(r4.m.amt,r4.elotte-(r4.cel+0.5),0.11),"a tél a célrés +0,5-höz mér (nem a rajt-célhoz)",r4);

  console.log("\n— 5. a határok —");
  const r5=await p.evaluate(()=>{
    const o={};
    S.seasonHistory.push({season:5,rank:7,pts:44,w:12,d:8,l:10,gf:40,ga:40,oppRating:oppTargetRating,teamAvg:86});
    o.b6=nfBounds(6);
    S.seasonHistory[S.seasonHistory.length-1].rank=1;o.b6ok=nfBounds(6);
    S.pyr.nfNext=10;o.fent=nfLevelFor(6);
    S.pyr.nfNext=1;o.lent=nfLevelFor(6);
    delete S.pyr.nfNext;
    return o;});
  ok(!r5.b6.ok&&r5.b6.hi===r5.b6.prev&&r5.b6.lo===1,"sikertelen idény után nem nehezíthető; könnyíteni a kezdő −2-ig (3 → 1)",r5.b6);
  ok(r5.b6ok.ok&&r5.b6ok.hi===r5.b6ok.prev+1,"sikeres idény után egy fokkal nehezebb",r5.b6ok);
  ok(r5.fent===r5.b6ok.hi&&r5.lent===1,"a választás a határok közé fogva",r5);

  console.log("\n— 7. nyár: a HUB és a fokozat-képernyő —");
  const r7=await p.evaluate(()=>{
    const o={};
    S.seasonNumber=5;S.idx=30;S.seasonClosed=true;phase="hub";hubMidSeasonMode=false;preSeasonHubMode=false;S.twWindow=null;
    o.nyar=pyrFloorSummer();o.up=pyrFloorUpcoming();
    try{renderHub();}catch(e){o.hubErr=e.message;}
    const vb=document.getElementById("hubVallBtn");o.gomb=!vb.classList.contains("hide");o.gombTxt=vb.textContent;
    o.atallGomb=!document.getElementById("hubNfAtallBtn").classList.contains("hide");
    vb.click();
    const box=document.getElementById("scUnlock");
    o.kepernyo=!box.classList.contains("hide");
    o.cim=document.getElementById("unlockTitle").textContent;
    const body=document.getElementById("unlockBody");
    o.sorok=body.querySelectorAll("[data-nfval]").length;
    o.lenyit=body.querySelectorAll("details").length;
    o.zart=[...body.querySelectorAll("[data-nfval]")].filter(x=>x.disabled).map(x=>+x.dataset.nfval);
    body.querySelector("[data-nfval='4']").click();
    document.querySelector("#unlockActions button").click();
    o.next=S.pyr.nfNext;
    return o;});
  ok(r7.nyar&&r7.up===6&&r7.gomb&&/6\. idény fokozata/.test(r7.gombTxt)&&/Simaliba/.test(r7.gombTxt),"nyáron a HUB a következő idény fokozatát mutatja",r7);
  ok(!r7.atallGomb,"a már kétoldalú karrierben nincs átállás-gomb");
  ok(r7.kepernyo&&/Nehézségi fokozat/.test(r7.cim)&&r7.sorok===10&&r7.lenyit===10,"a képernyőn a tíz fok, mind lenyitható",r7);
  ok(r7.zart.join(",")==="5,6,7,8,9,10","a határon kívüliek zárva (okkal)",r7.zart);
  ok(r7.next===4,"a választás rögzül",r7.next);

  console.log("\n— 9a. a Run és a mérő —");
  const r9=await p.evaluate(()=>{
    const o={};
    S.run=null;runInit();runCaptureStart();
    o.row=pyrFloorRunRow();
    const H=pyrFloorHist();
    o.ossz=[2,3,4,5].reduce((a,s)=>a+(H[s].lift||0)+(H[s].mid||0)-(H[s].fek||0),0);
    S.seasonNumber=4;
    try{meresSzezonZar();}catch(e){o.err=e.message;}
    const r=meresLoad();const z=r&&r.sz.find(x=>x.sz===4);
    o.padlo=z&&z.padlo;
    o.beall=r&&r.beall&&r.beall.piramis;
    return o;});
  ok(r9.row&&new RegExp((r9.ossz>=0?"\\+":"−")+Math.abs(r9.ossz).toFixed(1).replace(".",",")).test(r9.row.d),"a Run sora a féket levonja (előjeles összeg)",{row:r9.row,o:r9.ossz});
  ok(r9.padlo&&r9.padlo.nf===3&&r9.padlo.celres===2.8&&r9.padlo.fek>0&&"dgBecsles" in r9.padlo,"a mérő rögzíti a fokozatot, a célrést, a féket",r9.padlo);
  ok(r9.beall&&r9.beall.padlo===2&&r9.beall.nf===3,"a mérő beállítás-blokkja",r9.beall);

  console.log("\n— 8. átállás futó karrierben —");
  const r8=await p.evaluate(()=>{
    const o={};
    /* a régi (egyoldalú padlós) karrier: idény közben nem, nyáron igen */
    S.pyr.padlo=1;delete S.pyr.nf;delete S.pyr.nf0;delete S.pyr.cel;
    S.seasonNumber=6;S.idx=10;S.seasonHistory=S.seasonHistory.filter(x=>x.season<6);
    o.kozben=nfAtallHato();
    S.seasonNumber=5;S.idx=30;
    o.nyaron=nfAtallHato();
    try{renderHub();}catch(e){o.hubErr=e.message;}
    const ab=document.getElementById("hubNfAtallBtn");o.gomb=!ab.classList.contains("hide");
    o.vallGomb=document.getElementById("hubVallBtn").textContent;
    ab.click();
    o.cim=document.getElementById("unlockTitle").textContent;
    const body=document.getElementById("unlockBody");
    o.sorok=body.querySelectorAll("[data-nfval]").length;o.lenyit=body.querySelectorAll("details").length;
    o.jelolt=[...body.querySelectorAll("[data-nfval]")].filter(x=>x.textContent.includes("✓")).map(x=>+x.dataset.nfval);
    o.szoveg=body.textContent;
    body.querySelector("[data-nfval='6']").click();
    /* Mégsem → nem áll át */
    const gombok=[...document.querySelectorAll("#unlockActions button")];
    o.gombok=gombok.map(x=>x.textContent);
    gombok[0].click();o.megsem=S.pyr.padlo;
    ab.click();
    document.querySelector("#unlockBody [data-nfval='6']").click();
    [...document.querySelectorAll("#unlockActions button")].find(x=>/Átállok/.test(x.textContent)).click();
    o.padlo=S.pyr.padlo;o.nf=S.pyr.nf;o.nf0=S.pyr.nf0;o.cel=S.pyr.cel;o.on=nfOn();o.atallva=S.pyr.nfAtallva;
    o.lvl=nfLevelFor(6);o.utana=nfAtallHato();
    o.hubUtana=!document.getElementById("hubNfAtallBtn").classList.contains("hide");
    return o;});
  ok(r8.kozben===false&&r8.nyaron===true&&r8.gomb,"átállni a két idény között lehet, a HUB gombjával",r8);
  ok(/Átállás/.test(r8.cim)&&r8.sorok===10&&r8.lenyit===10&&r8.jelolt.length===1,"az átállás képernyője: tíz lenyitható fok, a mostani jelölve",r8);
  ok(/Mi változik/.test(r8.szoveg)&&/végleges/.test(r8.szoveg)&&/Célrés/.test(r8.szoveg),"kimondja, mi változik, és a beállításokat",r8.szoveg.slice(0,200));
  ok(r8.megsem===1,"a „Mégsem” nem állít át");
  ok(r8.padlo===2&&r8.nf===6&&r8.nf0===6&&r8.cel===1.4&&r8.on&&r8.atallva&&r8.atallva.regi===1&&r8.lvl===6,"az átállás: kétoldalú, a választott fokkal",r8);
  ok(r8.utana===false&&!r8.hubUtana,"utána nincs újra átállás",r8);

  if(KEP){
    const takar=()=>p.evaluate(()=>document.querySelectorAll("body *").forEach(el=>{
      if(getComputedStyle(el).position==="fixed"&&!el.contains(document.getElementById("scUnlock")))el.style.display="none";}));
    await p.evaluate(()=>{S.pyr.padlo=1;renderHub();document.getElementById("hubNfAtallBtn").click();
      document.querySelector("#unlockBody details").open=true;});
    await takar();
    await p.locator("#scUnlock").screenshot({path:path.join(KEP,"nf-atallas.png")});
    await p.evaluate(()=>{S.pyr.padlo=2;nfOffer(null,true);document.querySelectorAll("#unlockBody details")[2].open=true;});
    await takar();
    await p.locator("#scUnlock").screenshot({path:path.join(KEP,"nf-nyar.png")});}

  console.log("\n— 9b. közös karrier —");
  const r10=await p.evaluate(()=>{
    const o={};
    o.csomag=mpCollectSettings().padlo;
    const s=mpCollectSettings();
    s.padlo=true;mpApplySettings(s);o.regi=_mpPadlo;
    s.padlo=2;mpApplySettings(s);o.uj=_mpPadlo;
    /* a közös kezdőrúgás: alsó fék a két szám átlagából */
    const _h=h2hRoomActive;h2hRoomActive=()=>true;
    S.pyr.padlo=2;S.pyr.nf=4;S.pyr.nf0=4;
    S.seasonNumber=7;S.idx=0;S.seasonHistory.push({season:6,rank:8,pts:40,w:10,d:10,l:10,gf:30,ga:30,oppRating:oppTargetRating,teamAvg:90});
    const lvl=pyrLevel();
    S.pyr.superPair={for:7,avg:lvl-6,hid:0,a:lvl-5,b:lvl-7,vallA:1.0,vallB:0.0};
    const h=pyrFloorKickoff();o.h=Object.assign({},h);
    o.res=Math.round((S.pyr.superPair.avg-pyrLevel())*10)/10;
    o.utem=nfMezonyUtem(S.pyr.my);
    h2hRoomActive=_h;
    return o;});
  ok(r10.csomag===2&&r10.regi===1&&r10.uj===2,"a szoba csomagja padlo:2; a régi házigazda (true) a régi padlót viszi",r10);
  ok(r10.h&&kozel(r10.h.want,0.5,0.001)&&r10.h.fek>0&&r10.h.fek<=r10.utem+0.6&&r10.res>-6,"közösben is fékez, a két rajt-cél átlagához",r10);

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
