/* 🧠 3.9.314 — AZ EDZŐI ELEMZÉS MINDEN MECCSRE ÚJRA JÁR; A KUPAMECCS AZONOSÍTÓJA EGYEDI.

   BEJELENTÉS: „néha az edzői elemzések nem resetelődnek két meccs között".

   AZ OK: az elemzések számlálója meccs-kulcshoz kötött. Az osztályozóban a
   kulcs "po" volt — a két meccs közös —, a kupában "e"+idx, az idx viszont
   minden szakasz, selejtezőkör és kupa elején 0-ról indul. Ugyanez az "e"+idx
   állt a meccs-visszaállítás azonosítójában (mMeccsId) is: egy kupadöntő és a
   nyár következő kupájának első meccse ugyanazt kapta, és a kezdőrúgás a döntő
   lefújt rekordját pörgette volna le.

   Amit mér (valódi karrierben, a valódi kérő ablakon át):
     1. az elemzés kérése a számlálót lépteti (megerősítő ablak, „Igen");
     2. osztályozó: az első meccs elhasznált elemzései után a visszavágóra újra jár;
     3. kupa: szakaszváltáskor (nyolcad → negyed, azonos idx), selejtezőkör-
        váltáskor és kupaváltáskor (döntő → a következő kupa első meccse) újra jár;
     4. ugyanarra a meccsre nem jár újra (mentés-visszatöltés után sem);
     5. a meccs-azonosító: a döntő lefújt rekordja nem illik a következő kupa
        első meccsére; a régi formátumú FÉLBE MARADT rekord igen (a frissítés
        nem ad új esélyt), a régi formátumú LEFÚJT nem;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9314;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
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

  const r=await p.evaluate(async()=>{
    const out={};
    const max=edzoElemzesMax();out.max=max;
    const kimeritve=()=>{const M=edzoKovetkezoMeccs();const E=S.edzo||(edzoAll(),S.edzo);E.elemzes={key:M.kulcs,db:max,xp:1};return M.kulcs;};
    S.seasonClosed=true;S.idx=30;
    /* 1. a valódi kérés */
    S.pyrPo={stage:"play",idx:0,opp:{n:"Osztályozó FC",ovr:70},iAmCh:true,legs:[]};
    const elotte=edzoElemzesMarad();
    edzoElemzesKer();await new Promise(r=>setTimeout(r,150));
    const y=$("hubTacticConfirmYes");if(y)y.click();
    await new Promise(r=>setTimeout(r,250));
    out.keres={elotte,utana:edzoElemzesMarad(),modal:!$("edzoElemModal").classList.contains("hide")};
    try{$("edzoElemModal").classList.add("hide");}catch(e){}
    /* 2. osztályozó */
    kimeritve();out.po0=edzoElemzesMarad();
    S.pyrPo.idx=1;S.pyrPo.legs=[[1,0]];out.po1=edzoElemzesMarad();
    S.pyrPo=null;
    /* 3. kupa */
    const fx=n=>({o:{n,ovr:70},home:true});
    S.euro={comp:"KL",stage:"r16",idx:0,qRound:0,fixtures:[fx("Alfa"),fx("Alfa")]};
    kimeritve();out.r16=edzoElemzesMarad();
    S.euro.stage="qf";S.euro.idx=0;S.euro.fixtures=[fx("Alfa"),fx("Alfa")];   /* még az ellenfél neve is azonos */
    out.qf=edzoElemzesMarad();
    S.euro={comp:"FA",stage:"qual",idx:0,qRound:1,fixtures:[fx("Béta"),fx("Béta")]};
    kimeritve();out.q1=edzoElemzesMarad();
    S.euro.qRound=2;out.q2=edzoElemzesMarad();
    S.euro={comp:"KL",stage:"final",idx:0,qRound:0,fixtures:[fx("Gamma")]};
    kimeritve();out.donto=edzoElemzesMarad();
    S.euro={comp:"HSZ",stage:"group",idx:0,qRound:0,fixtures:[fx("Gamma")]};
    out.kovKupa=edzoElemzesMarad();
    /* 4. ugyanaz a meccs — mentés-visszatöltés után is */
    kimeritve();out.ugyanaz=edzoElemzesMarad();
    S.euro=JSON.parse(JSON.stringify(S.euro));S.edzo=JSON.parse(JSON.stringify(S.edzo));
    out.visszatoltve=edzoElemzesMarad();
    /* 5. a meccs-azonosító */
    S.euro={comp:"KL",stage:"final",idx:0,qRound:0,fixtures:[fx("Gamma")]};
    const dontoId=mMeccsId(),dontoRegi=mMeccsIdRegi();
    S.euro={comp:"HSZ",stage:"group",idx:0,qRound:0,fixtures:[fx("Delta")]};
    out.id={donto:dontoId,kov:mMeccsId(),
      ujLefujt:mEloEgyezik({id:dontoId,vege:1}),
      regiLefujt:mEloEgyezik({id:dontoRegi,vege:1}),
      regiFelbe:mEloEgyezik({id:mMeccsIdRegi(),vege:0}),
      sajat:mEloEgyezik({id:mMeccsId(),vege:1})};
    S.euro=null;
    return out;});
  console.log("  "+JSON.stringify(r));
  const M=r.max;
  ok(r.keres.elotte===M&&r.keres.utana===M-1&&r.keres.modal,"a valódi kérés lépteti a számlálót, és az elemzés megjelenik",r.keres);
  ok(r.po0===0&&r.po1===M,"osztályozó: a visszavágóra újra jár az elemzés",{po0:r.po0,po1:r.po1});
  ok(r.r16===0&&r.qf===M,"kupa: szakaszváltáskor (nyolcad → negyed, azonos index és ellenfél-név) újra jár",{r16:r.r16,qf:r.qf});
  ok(r.q1===0&&r.q2===M,"kupa: a következő selejtezőkörben újra jár",{q1:r.q1,q2:r.q2});
  ok(r.donto===0&&r.kovKupa===M,"a döntő után a következő kupa első meccsére újra jár",{donto:r.donto,kov:r.kovKupa});
  ok(r.ugyanaz===0&&r.visszatoltve===0,"ugyanarra a meccsre nem jár újra — mentés-visszatöltés után sem",{ugyanaz:r.ugyanaz,vissza:r.visszatoltve});
  ok(r.id.donto!==r.id.kov&&!r.id.ujLefujt&&!r.id.regiLefujt,"a döntő lefújt rekordja nem illik a következő kupa első meccsére (új és régi formátumban sem)",r.id);
  ok(r.id.regiFelbe&&r.id.sajat,"a régi formátumú félbe maradt rekord és a saját rekord illik (a frissítés nem ad új esélyt)",r.id);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
