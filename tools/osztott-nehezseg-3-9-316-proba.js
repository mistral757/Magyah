/* ⚖️ 3.9.316 — NAGY KÜLÖNBSÉGNÉL A KEZDŐKAPU FELAJÁNLÁSA: MARADUNK /
   BEFEJEZZÜK / OSZTOTT NEHÉZSÉG.

   KÉRÉS: „ahol ennyire jelentős a különbség a két csapat között
   szezonindításkor, ott […] amikor mindketten rányomtak a gombra, akkor
   felajánl egy lehetőséget a gép […] Aki le van maradva, az a nehézségi
   szinthez mért legkönnyebb célrést kapja, aki pedig előrébb, az a
   legnehezebbet. […] legalább -2 és +2 […] 3 lehetőséget adjon: 1. maradunk a
   mostani erőknél, 2. Befejezzük a párharcot itt, győzött az erősebb, 3. Az
   új lehetőség […] a párharcot ilyenkor is lejátssza a két csapat 15. és 30.
   fordulóban, és ilyenkor is tabella szintjén egy mezőnyben játszanak."

   Egy lap, a játék helyi szoba-hátterén; a társ választását közvetlenül a
   szobába írjuk. Amit mér:
     1. a becslés tükörszimmetrikus (a két gépen ugyanaz, felcserélve), és csak
        −2 / +2 fölötti különbségnél kérdez; régi társnál (osztV nélkül) nem;
     2. a felajánlás megjelenik a három lehetőséggel; eltérő választásnál vár,
        egyezőnél dönt; a döntés a szobába és a mentésbe kerül;
     3. a 3. lehetőség: a lemaradó a fokozata legkönnyebb, az elöl álló a
        legnehezebb célrését kapja; a kezdőrúgás után a SAJÁT bajnoki
        meccseken az ellenfél pontosan annyival gyengébb/erősebb, hogy a rés a
        cél legyen — a közös világ szintje (és vele a tabella) nem mozdul a
        felosztástól; kupában, párharc-fordulóban 0; a következő idényben lejár;
     4. az 1. lehetőség: semmi nem változik;
     5. a 2. lehetőség: a párharc lezárul (győzött az erősebb), a következő
        idény nem indul — az összegzés jön helyette;
     6. a már eldöntött választás újra-belépéskor nem kérdez újra;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9316;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
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
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);

  /* közös karrier a helyi szobában; a torna indítását és a mentést elkapjuk */
  await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    mpNet.mode="local";window.mpNetInit=async()=>{};
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[1];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=true;S.seasonNumber=3;
    S.finalTable=[{you:true,n:"MAGYAH XI"}];   /* a felajánlhatósághoz: lezárt idény */
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){try{window._nlog.push(String(t));}catch(e){}return al.apply(this,arguments);};
    MP.active=true;MP.role="host";
    MP.activeRoom="OSZT";{const r=mpLRooms();const rec=mpNewRoomRecord();rec.code="OSZT";r.OSZT=rec;mpLSave(r);}
    S.seasonHistory=[{season:1},{season:2}];   /* a 3. idény jön */
    window._kesz=0;});


  const rek=(mstr,vall,extra)=>Object.assign({mstr,str:mstr-2,vall,mz:mstr-1,mzV:1,osztV:1,season:3},extra||{});
  console.log("— 1. a becslés —");
  const r1=await p.evaluate(([A,B,C])=>{
    const b1=mpOsztBecsles(A,B),b2=mpOsztBecsles(B,A);
    return {b1,b2,nagy:!!mpOsztKell(A,B),kicsi:!!mpOsztKell(A,C),regi:!!mpOsztKell(A,Object.assign({},B,{osztV:undefined}))};},
    [rek(100.5,0.4),rek(112.5,0.9),rek(103,0.9)]);
  ok(r1.b1.gE===r1.b2.gT&&r1.b1.gT===r1.b2.gE&&r1.b1.mezo===r1.b2.mezo,"a becslés tükörszimmetrikus (a két gépen ugyanaz)",{b1:r1.b1,b2:r1.b2});
  ok(r1.nagy&&!r1.kicsi&&!r1.regi,"csak nagy (−2/+2) különbségnél kérdez, régi társnál nem",r1);

  console.log("— 2–3. a felajánlás és az osztott nehézség —");
  const r2=await p.evaluate(async([A,B])=>{
    const o={};const sn=mpUpcomingSeason();o.sn=sn;
    S.mpOsztDont=null;S.pyr.osztottKell=null;
    mpOsztottKapu(A,B,()=>{window._kesz++;});
    await new Promise(r=>setTimeout(r,300));
    const box=$("scUnlock");o.lat=!box.classList.contains("hide");o.cim=$("unlockTitle").textContent;
    o.gombok=[...$("unlockActions").querySelectorAll("button")].map(b=>b.textContent);
    /* én: 3; a társ: 1 → vár */
    $("unlockActions").querySelectorAll("button")[2].click();
    await mpBk().h2hPut(MP.activeRoom,mpOsztKulcs(sn),"guest",{c:1,season:sn,at:Date.now()});
    await new Promise(r=>setTimeout(r,3000));
    o.varElteres=window._kesz===0&&/mást választott/.test($("unlockBody").textContent);
    /* a társ átvált 3-ra → dönt */
    await mpBk().h2hPut(MP.activeRoom,mpOsztKulcs(sn),"guest",{c:3,season:sn,at:Date.now()});
    await new Promise(r=>setTimeout(r,3000));
    o.kesz=window._kesz;o.dont=S.mpOsztDont;o.kell=S.pyr.osztottKell;o.H=mpCelresHatar();
    const node=await mpBk().h2hGet(MP.activeRoom,mpOsztKulcs(sn));o.szoba=node&&node.host&&node.host.c;
    return o;},[rek(100.5,0.4),rek(112.5,0.9)]);
  ok(r2.lat&&/Nagy a különbség/.test(r2.cim)&&r2.gombok.length===3,"a felajánlás megjelenik, három lehetőséggel",{cim:r2.cim,gombok:r2.gombok});
  ok(r2.varElteres,"eltérő választásnál nem dönt, kiírja a társ választását",r2.varElteres);
  ok(r2.kesz===1&&r2.dont&&r2.dont.c===3&&r2.szoba===3,"egyező választásnál dönt; a döntés a szobában és a mentésben",{kesz:r2.kesz,dont:r2.dont,szoba:r2.szoba});
  ok(r2.kell&&r2.kell.szerep==="hatrany"&&r2.kell.cel===r2.H.hi,"a lemaradó a fokozata legkönnyebb célrését kapja",{kell:r2.kell,H:r2.H});

  /* az elöl álló oldal (tükör) */
  const r2b=await p.evaluate(([A,B])=>{S.mpOsztDont={season:mpUpcomingSeason(),c:3};S.pyr.osztottKell=null;
    let k=0;mpOsztottKapu(A,B,()=>{k++;});return {k,kell:S.pyr.osztottKell,H:mpCelresHatar()};},[rek(112.5,0.9),rek(100.5,0.4)]);
  ok(r2b.k===1&&r2b.kell.szerep==="elony"&&r2b.kell.cel===r2b.H.lo,"az elöl álló a legnehezebbet; a már eldöntött választás nem kérdez újra",r2b);

  /* a kezdőrúgás és a meccseken ható eltolás */
  const r3=await p.evaluate(()=>{
    const o={};const P=S.pyr,sn=3;
    S.seasonNumber=sn;S.idx=0;
    const H=pyrFloorHist();delete H[sn];
    P.osztottKell={sn,szerep:"hatrany",cel:0.9,rajt:0.6,gE:-4,gT:7};
    P.superPair={for:sn,avg:106.5,hid:0,a:100.5,b:112.5,suly:0,wa:100.5,wb:112.5,vallA:0.4,vallB:0.9};
    const lvl0=pyrLevel();
    const b0=matchHiddenOppBuff(),m0=oppMatchStrength();
    /* a közös világ ugyanúgy áll be, mint felosztás nélkül: összevetjük */
    const ment=JSON.stringify({P:S.pyr,opp:oppTargetRating});
    let kick=null;try{kick=pyrFloorKickoff();}catch(e){o.hiba=String(e);}
    const lvlOszt=pyrLevel();o.O=P.osztott;
    o.Hcel=pyrFloorHist()[sn].cel;o.Hoszt=pyrFloorHist()[sn].osztott;
    const b1=matchHiddenOppBuff(),m1=oppMatchStrength();
    o.buffKul=Math.round((b1-b0)*10)/10;o.msKul=Math.round((m1-m0-(lvlOszt-lvl0))*10)/10;
    const mezo=pyrLevel()+Math.max(0,(P.superPair.hid||0)*OPP_BUFF_MEASURED);
    o.res=Math.round((P.superPair.wa-mezo-P.osztott.off)*10)/10;
    /* párharc-forduló, kupa: 0 */
    S.idx=14;o.parharc=mpOsztottOff();S.idx=0;
    const e0=S.euro;S.euro={stage:"group",comp:"EL",target:90};o.kupa=mpOsztottOff();S.euro=e0;
    /* a következő idényben lejár */
    S.seasonNumber=4;o.kovetkezo=mpOsztottOff();S.seasonNumber=3;
    /* ugyanez felosztás nélkül: a világ szintje ugyanaz */
    const v=JSON.parse(ment);S.pyr=v.P;oppTargetRating=v.opp;delete S.pyr.osztottKell;delete pyrFloorHist()[sn];
    try{pyrFloorKickoff();}catch(e){}
    o.lvlNelkul=pyrLevel();o.lvlOszt=lvlOszt;
    return o;});
  ok(r3.O&&r3.O.sn===3&&r3.O.szerep==="hatrany"&&typeof r3.O.off==="number"&&r3.O.off<0,"a kezdőrúgás kiszámolja a személyes eltolást (lemaradó: gyengébb ellenfelek)",r3.O);
  ok(r3.Hcel===0.9&&r3.Hoszt&&r3.Hoszt.szerep==="hatrany","az idény játszott célrése a személyes (a Run és a HUB ezt olvassa)",{cel:r3.Hcel,oszt:r3.Hoszt});
  ok(Math.abs(r3.res-0.6)<=0.11,"az eltolással a saját rajt-rés pontosan a cél (0,6)",r3.res);
  ok(r3.buffKul===Math.round(r3.O.off*10)/10&&r3.msKul===Math.round(r3.O.off*10)/10,"a saját bajnoki meccseken az ellenfél pontosan ennyivel gyengébb (motor és kijelzés)",{buff:r3.buffKul,ms:r3.msKul,off:r3.O.off});
  ok(r3.parharc===0&&r3.kupa===0&&r3.kovetkezo===0,"párharc-fordulóban és kupában nem hat, a következő idényben lejár",{p:r3.parharc,k:r3.kupa,kov:r3.kovetkezo});
  ok(r3.lvlOszt===r3.lvlNelkul,"a közös világ szintje (a tabella alapja) nem mozdul a felosztástól",{oszt:r3.lvlOszt,nelkul:r3.lvlNelkul});

  console.log("— 3.9.317: a kezdőrúgás előtti kapu (a fel-/kiesés után) —");
  const r6=await p.evaluate(async()=>{
    const o={};
    S.seasonNumber=2;S.idx=0;const sn=3;
    S.mpOsztDont=null;S.pyr.osztottKell=null;S.pyr.osztott=null;S.pyr.osztRegiNaplo=null;
    S.pyr.superPair={for:sn,avg:106.5,hid:0,a:100.5,b:112.5,suly:0,wa:100.5,wb:112.5,vallA:0.4,vallB:0.9,osztV:true};
    /* a közös világ szintje: a becslés a MOSTANI (forduló utáni) szintből dolgozik */
    o.B=mpOsztBecslesPar(S.pyr.superPair);
    let tovabb=0;
    await mpBk().h2hPut(MP.activeRoom,mpOsztKulcs(sn),"guest",null).catch?.(()=>{});
    o.atvette=mpOsztottKezdoKapu(()=>{tovabb++;});
    await new Promise(r=>setTimeout(r,300));
    o.cim=$("unlockTitle").textContent;o.szoveg=/fel- és kiesés után/.test($("unlockBody").textContent);
    $("unlockActions").querySelectorAll("button")[2].click();
    await mpBk().h2hPut(MP.activeRoom,mpOsztKulcs(sn),"guest",{c:3,season:sn,at:Date.now()});
    await new Promise(r=>setTimeout(r,3000));
    o.tovabb=tovabb;o.kell=S.pyr.osztottKell;
    o.masodszor=mpOsztottKezdoKapu(()=>{tovabb++;});
    /* régi társ: nem kérdez, de a napló kimondja */
    S.mpOsztDont=null;S.pyr.osztottKell=null;S.pyr.superPair.osztV=false;
    window._nlog=[];const al=addLine;window.addLine=addLine=function(t){window._nlog.push(String(t));return al.apply(this,arguments);};
    o.regi=mpOsztottKezdoKapu(()=>{});
    o.regiNaplo=window._nlog.some(t=>/régebbi verzióval/.test(t));
    window.addLine=addLine=al;
    /* kis különbségnél nincs kérdés */
    S.pyr.superPair=Object.assign({},S.pyr.superPair,{osztV:true,wa:105,wb:107,avg:106});
    o.kicsi=mpOsztottKezdoKapu(()=>{});
    return o;});
  ok(r6.B&&r6.B.gE<=-2&&r6.B.gT>=2,"a becslés a kézfogás számaiból és a mostani közös világból",r6.B);
  ok(r6.atvette&&/Nagy a különbség/.test(r6.cim)&&r6.szoveg,"a felajánlás a kezdőrúgás előtt jön (a fel- és kiesés után)",{at:r6.atvette,cim:r6.cim});
  ok(r6.tovabb===1&&r6.kell&&r6.kell.szerep==="hatrany"&&r6.masodszor===false,"egyező választás után a kezdőrúgás folytatódik, másodszor nem kérdez",{tovabb:r6.tovabb,kell:r6.kell,m:r6.masodszor});
  ok(r6.regi===false&&r6.regiNaplo,"régi társnál nem kérdez, de a napló kimondja, miért",{regi:r6.regi,naplo:r6.regiNaplo});
  ok(r6.kicsi===false,"kis különbségnél nincs kérdés",r6.kicsi);

  console.log("— 4–5. maradunk / befejezzük —");
  const r4=await p.evaluate(([A,B])=>{S.mpOsztDont={season:mpUpcomingSeason(),c:1};S.pyr.osztottKell=null;
    let k=0;mpOsztottKapu(A,B,()=>{k++;});return {k,kell:S.pyr.osztottKell};},[rek(100.5,0.4),rek(112.5,0.9)]);
  ok(r4.k===1&&!r4.kell,"„maradunk”: továbbenged, nincs felosztás",r4);
  const r5=await p.evaluate(async([A,B])=>{S.mpOsztDont={season:mpUpcomingSeason(),c:2};S.mpParharcVege=null;
    let k=0;mpOsztottKapu(A,B,()=>{k++;});
    const o={k,V:S.mpParharcVege,cim:$("unlockTitle").textContent,lezarva:mpParharcLezarva()};
    /* a következő idény indítása helyett az összegzés */
    let kapu=0;const g=mpSeasonGate;mpSeasonGate=()=>{kapu++;};
    $("scUnlock").classList.add("hide");
    beginNextSeasonWithChallenges();
    o.kapu=kapu;o.ujra=!$("scUnlock").classList.contains("hide")&&/párharcot/.test($("unlockTitle").textContent);
    mpSeasonGate=g;S.mpParharcVege=null;return o;},[rek(100.5,0.4),rek(112.5,0.9)]);
  ok(r5.k===0&&r5.V&&r5.V.gyoztes==="tars"&&/A társad nyerte/.test(r5.cim)&&r5.lezarva,"„befejezzük”: a párharc lezárul, győzött az erősebb (itt a társ)",r5);
  ok(r5.kapu===0&&r5.ujra,"a lezárt párharc után új közös idény nem indul — az összegzés jön",{kapu:r5.kapu,ujra:r5.ujra});

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
