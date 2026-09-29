/* 🔔 3.9.172 — KIS SZÁMOK, STÁB-MÉRLEG, KIHÍVÁS-FELUGRÓ, FEED-SZŰRŐ, PUSH.

   BEJELENTETT KÉRÉSEK:
     · „A pici 5-ös, 8-as, 3-as és 2-es nagyon összetéveszthető a pixelated
       témában."
     · „A játékos HUB beli edzés és fejlődés menüpontja alatt látszódjon külön,
       hogy mennyit kapott a stábtagtól és mennyit a sima edzésből."
     · „Legyen külön felugró ablak a kihívások teljesítésekor (nem csak a
       pixelated módban, de abban is legyen, a saját stílusához illően)."
     · „A feedet lehessen ki-be-kapcsolhatóan megtisztítani az extra infóktól…
       Ennek beállítása a menüben a vezetés alatt legyen."
     · „Az értesítések, amik jelenleg a vezetés részei… legyenek push
       értesítésekként a játékban… csak azok, amik az aktuális meccs indítása,
       idény indítása előtt fontosak lehetnek, vagy olyan dolgok, amikkel már
       rég nem foglalkozott a játékos."

   Amit mér:
     1. PIXEL SZÁMJEGYEK: a pixel téma betűsorában a „Magyah Pixszam" áll
        elöl, csak a számjegyekre (unicode-range), betöltve; a „2358"
        ugyanolyan széles, mint a Pixelify-ban (a számok a helyükön maradnak);
        a másik témák nem kérik.
     2. STÁB-MÉRLEG: a személyi edző pontjai külön csatornán (stab, stabBy)
        könyvelődnek, a régi edzés-mérleget (pts) nem torzítják, és a HUB
        játékoslapján „🎓 Stábtag" sor mutatja őket, az edző nevével.
     3. KIHÍVÁS-FELUGRÓ: a teljesítés megnyitja; sorba áll („még 1"); a gomb
        lépteti és bezárja; végigjátszásnál magától zárul; a pixel témában
        saját ruhát kap (szögletes, „ACHIEVEMENT UNLOCKED"); a resolveChallenge
        hívja.
     4. FEED-SZŰRŐ: a sorok témakört kapnak (a stílus-pont kifejezetten, a
        folytatósor örököl, a perc-előtagos sor mindig közvetítés); a
        kapcsoló elrejti és visszahozza; a „Csak a meccsközvetítés" mindent
        rejt, ami nem közvetítés; a beállítás megmarad; a Vezetés menüben él.
     5. PUSH: csak a VEZ_PUSH témák; „meccs" a kezdőrúgás előtt, „szezon" az
        idény elején, „reg" csak 8 forduló után; fordulónként egyszer; a sáv
        beúszik, a „Mutasd" a HUB-ba visz; kikapcsolva és „Semmi" módban néma.
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9210;
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

  /* ---- 1. PIXEL SZÁMJEGYEK ---- */
  console.log("\n— 1. A PIXEL TÉMA SZÁMJEGYEI —");
  const sz=await p.evaluate(async()=>{
    applyTheme("dark");await new Promise(r=>setTimeout(r,50));
    const sotet=getComputedStyle(document.documentElement).getPropertyValue("--font-body");
    applyTheme("pixel");
    await document.fonts.load('12px "Magyah Pixszam"',"2358");
    await document.fonts.load('12px "Pixelify Sans"',"2358");
    await document.fonts.ready;
    const stack=getComputedStyle(document.documentElement).getPropertyValue("--font-body").trim();
    const face=[...document.fonts].filter(f=>/Pixszam/.test(f.family));
    const meres=csalad=>{const s=document.createElement("span");s.style.cssText=`position:absolute;visibility:hidden;font:400 40px ${csalad};white-space:nowrap`;
      s.textContent="23580";document.body.appendChild(s);const w=s.getBoundingClientRect().width;s.remove();return Math.round(w*10)/10;};
    return {stack,sotet,elso:/^'Magyah Pixszam'/.test(stack),
      tartomany:face.map(f=>f.unicodeRange),betoltve:face.some(f=>f.status==="loaded"),
      wUj:meres("'Magyah Pixszam'"),wRegi:meres("'Pixelify Sans'")};});
  ok(sz.elso,"a pixel téma betűsorában a „Magyah Pixszam” áll elöl",sz.stack);
  ok(sz.tartomany.length>=2&&sz.tartomany.every(u=>/U\+30-39/i.test(u)),"a betű CSAK a tíz számjegyet adja (unicode-range), 400 és 700 súlyban",sz.tartomany);
  ok(sz.betoltve,"a számjegy-betű betöltődik");
  ok(Math.abs(sz.wUj-sz.wRegi)<0.6,"a „23580” ugyanolyan széles, mint a Pixelify-ban — a számok a helyükön maradnak",{uj:sz.wUj,regi:sz.wRegi});
  ok(!/Pixszam/.test(sz.sotet),"a sötét téma nem kéri a pixel számjegyeket");
  await p.evaluate(()=>applyTheme("dark"));

  /* ---- egy valódi egyjátékos karrier (mentési zárral), szezonban ---- */
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}});
  await p.waitForTimeout(800);

  /* ---- 2. STÁB-MÉRLEG ---- */
  console.log("\n— 2. EDZÉS ÉS FEJLŐDÉS: STÁBTAG KÜLÖN —");
  const st=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const cel=slots.find(x=>x.player&&x.pos!=="KP").player.n;
    const mas=Object.values(careerPool).find(e=>e.n!==cel);
    const fp=careerFingerprint(mas);fp.age=40;
    const c=makeCoach(fp,"attr:gol",S.seasonNumber);c.n="Teszt Mester";c.sz=99;c.szBase=99;c.focus={mode:"players",group:null,names:[cel]};
    staff().push(c);
    const i0=S.idx;S.auto=true;S.unavailable={};startRound();
    for(let i=0;i<4000&&S.idx<i0+6;i++)await varj(20);
    S.auto=false;await varj(1200);
    const e=careerPool[cel],tl=e.trainLog||{};
    for(let i=0;i<6;i++){const x=document.getElementById("guideTipOk");if(x&&x.offsetParent)x.click();await varj(60);}
    const hub=(()=>{openHubMidSeason();return true;})();await varj(400);
    const pl=slots.find(x=>x.player&&x.player.n===cel).player;
    const kulcs=hubLocKey(findPlayerLocation(pl));
    const row=[...document.querySelectorAll("#hubRoster [data-hubkey]")].find(x=>x.getAttribute("data-hubkey")===kulcs);
    if(row)row.click();await varj(300);
    const sec=document.querySelector("#hubRoster .hubDetail .hdTrSplit");
    const txt=sec?sec.parentElement.textContent.replace(/\s+/g," "):"";
    try{hubMidSeasonReturn();}catch(x){}
    staff().splice(staff().indexOf(c),1);
    return {stabGol:tl.stab&&tl.stab.gol,by:tl.stabBy&&Object.keys(tl.stabBy),tipus:tl.stabBy&&tl.stabBy["Teszt Mester"]&&tl.stabBy["Teszt Mester"].tipus,
      ptsGol:(tl.pts&&tl.pts.gol)||0,tervGol:(tl.terv&&tl.terv.gol)||0,extraGol:(tl.extra&&tl.extra.gol)||0,lassitGol:(tl.lassit&&tl.lassit.gol)||0,txt,hub};});
  ok(st.stabGol>0&&st.by&&st.by[0]==="Teszt Mester"&&st.tipus==="Gólvágó-mentor","a személyi edző pontjai külön csatornán, edzőnként könyvelve",st);
  ok(Math.abs(st.ptsGol-(st.tervGol+st.extraGol-st.lassitGol))<1e-6,"a régi edzés-mérleg (pts) = edzésterv + egyéb − lassítás; a stáb nincs benne",{pts:st.ptsGol,terv:st.tervGol,extra:st.extraGol,lassit:st.lassitGol});
  ok(/🎓 Stábtag/.test(st.txt)&&/Gólszerzés \+/.test(st.txt)&&/Mester/.test(st.txt)&&/Gólvágó-mentor/.test(st.txt),"a HUB játékoslapján „🎓 Stábtag” sor: attribútum, edzőnév, típus",st.txt.slice(0,260));

  /* ---- 3. KIHÍVÁS-FELUGRÓ ---- */
  console.log("\n— 3. A KIHÍVÁS-FELUGRÓ —");
  const ch=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const r={};S.auto=false;
    chPopShow({desc:"Szerezz 8 gólt 5 meccsen",scope:"short"},"+1 talizmán-húzás");
    chPopShow({desc:"Nyerd meg a bajnokságot",scope:"long"},"Új stílus-token");
    await varj(400);
    const el=document.getElementById("chPop");
    r.lathato=!!el&&!el.classList.contains("hide")&&el.classList.contains("on");
    r.desc=el.querySelector("#chPopDesc").textContent;r.rew=el.querySelector("#chPopRew").textContent;
    r.meta=el.querySelector("#chPopMeta").textContent;
    r.dialog=el.getAttribute("role");
    el.querySelector("#chPopBtn").click();await varj(500);
    r.masodik=el.querySelector("#chPopDesc").textContent;r.masodikLathato=el.classList.contains("on");
    el.querySelector("#chPopBtn").click();await varj(500);
    r.zarva=el.classList.contains("hide")&&!_chPopOn;
    /* végigjátszás: magától zárul */
    S.auto=true;chPopShow({desc:"Auto-teszt",scope:"short"},"x");await varj(200);
    r.autoIdozito=!!_chPopT&&_chPopOn;chPopClose();await varj(400);S.auto=false;
    /* pixel ruha */
    applyTheme("pixel");chPopShow({desc:"Pixel-teszt",scope:"short"},"y");await varj(700);
    const card=el.querySelector(".chPopCard");
    r.pxSarok=getComputedStyle(card).borderTopLeftRadius;r.pxAlcim=getComputedStyle(el.querySelector(".chPopSub")).display;
    r.pxKeret=getComputedStyle(card).borderTopWidth;
    chPopClose();await varj(400);applyTheme("dark");
    chPopShow({desc:"Sötét-teszt",scope:"short"},"z");await varj(500);
    r.sotetAlcim=getComputedStyle(el.querySelector(".chPopSub")).display;
    r.sotetSarok=getComputedStyle(el.querySelector(".chPopCard")).borderTopLeftRadius;
    chPopClose();await varj(400);
    r.bekotve=/chPopShow\(ch,outcome\)/.test(String(resolveChallenge));
    return r;});
  ok(ch.lathato&&/Szerezz 8 gólt/.test(ch.desc)&&/talizmán/.test(ch.rew)&&ch.dialog==="dialog","a teljesítés felugró ablakot nyit: kihívás, jutalom",ch);
  ok(/még 1 teljesített kihívás vár/.test(ch.meta),"a második sorba áll, a kártya jelzi",ch.meta);
  ok(/bajnokságot/.test(ch.masodik)&&ch.masodikLathato&&ch.zarva,"a gomb a következőre lép, a végén bezár");
  ok(ch.autoIdozito,"végigjátszásnál magától zárul (időzítő)");
  ok(ch.pxSarok==="0px"&&ch.pxAlcim==="block"&&parseFloat(ch.pxKeret)>=4,"a pixel témában saját ruha: szögletes, vastag keret, „ACHIEVEMENT UNLOCKED”",{sarok:ch.pxSarok,alcim:ch.pxAlcim,keret:ch.pxKeret});
  ok(ch.sotetAlcim==="none"&&ch.sotetSarok!=="0px","a többi témában a téma saját kártyája",{alcim:ch.sotetAlcim,sarok:ch.sotetSarok});
  ok(ch.bekotve,"a resolveChallenge teljesítéskor hívja");

  /* ---- 4. FEED-SZŰRŐ ---- */
  console.log("\n— 4. A FEED-SZŰRŐ —");
  const fk=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const r={};
    localStorage.removeItem(FEED_OFF_KEY);feedFilterApply();
    S.playing=false;
    r.minta={
      perc:feedKat("23'  Gól: Kovács  1:0","m goal"),
      presz:feedKat("🔥 +2 presszpont — labdaszerzés","m skillnote"),
      fejl:feedKat("📈 Rakétácska fejlődött: 74 → 75","m life"),
      penz:feedKat("🎺 Szurkolói bevétel: +80 M Ft","m skillnote"),
      mero:feedKat("🏁 MÉRFÖLDKŐ — Az első óriásölés · +254 M Ft","m mvp"),
      keret:feedKat("🔍 Új felfedezés: X csatlakozott a keretedhez","m life"),
      oltozo:feedKat("Lendületben a csapat — 2. győzelem sorban! Morál +5","m ev"),
      merleg:feedKat("🎙 A meccs mérlege: 2:3. … erről napokig fog beszélni az öltöző.","m ev"),
      talz:feedKat("🧿 Talizmán: Fekete bárány","m life"),
      vege:feedKat("VÉGE MAGYAH XI – Nápolyi 2:0","m win")};
    S.playing=true;r.minta.eloEgyeb=feedKat("Visszafogott iram a középpályán","m");S.playing=false;
    const L=document.getElementById("ttLines");
    feedKatVele("stilus",()=>addLine("☠️ +1 rettenet — próba","m skillnote"));
    const sStil=L.lastElementChild;
    addLine("🏁 MÉRFÖLDKŐ — Próba-mérföldkő · +1 M Ft","m mvp");
    addLine("→ Ez a magyarázó sor a mérföldkőhöz tartozik.","m skillnote");
    const sMagy=L.lastElementChild;
    addLine("12'  Gól: Próba Péter  1:0","m goal");
    const sGol=L.lastElementChild;
    r.stilAttr=sStil.getAttribute("data-fk");r.magyAttr=sMagy.getAttribute("data-fk");r.golAttr=sGol.getAttribute("data-fk");
    const lat=el=>getComputedStyle(el).display!=="none";
    /* a panel a Vezetés menüben */
    renderTeachPanel();
    const box=document.getElementById("feedFilterBox");
    r.panel=!!box&&!!box.closest("#hubTeachBody");
    r.sorok=box?box.querySelectorAll("[data-fk-k]").length:0;
    box.querySelector('[data-fk-k="stilus"]').click();await varj(50);
    r.stilRejtve=!lat(sStil);r.golLatszik1=lat(sGol);
    r.tarolva=JSON.parse(localStorage.getItem(FEED_OFF_KEY)||"{}").stilus===1;
    document.querySelector('#feedFilterBox [data-fk-k="stilus"]').click();await varj(50);
    r.stilVissza=lat(sStil);
    document.querySelector("#feedFilterBox [data-fk-all]").click();await varj(50);
    const mind=[...L.children];
    r.csakMeccs=mind.every(x=>x.getAttribute("data-fk")==="meccs"||!lat(x));
    r.golLatszik2=lat(sGol);r.magyRejtve=!lat(sMagy);
    r.gombAllapot=document.querySelector("#feedFilterBox [data-fk-all]").classList.contains("on");
    document.querySelector("#feedFilterBox [data-fk-all]").click();await varj(50);
    r.mindVissza=mind.every(lat);
    return r;});
  const m=fk.minta;
  ok(m.perc==="meccs"&&m.vege==="meccs"&&m.eloEgyeb==="meccs","a perc-előtagos, a VÉGE- és a meccs alatti egyéb sor közvetítés",m);
  ok(m.presz==="stilus"&&m.fejl==="fejlodes"&&m.penz==="penz"&&m.mero==="kihivas"&&m.keret==="keret"&&m.oltozo==="oltozo"&&m.talz==="talizman"&&m.merleg==="hirek",
     "a témakörök: stílus-pont, fejlődés, pénz, mérföldkő, keret, öltöző, talizmán, összegzés",m);
  ok(fk.stilAttr==="stilus"&&fk.magyAttr==="kihivas"&&fk.golAttr==="meccs","a sor jelölést kap: a stílus-pont kifejezetten, a folytatósor örököl",fk);
  ok(fk.panel&&fk.sorok===8,"a kapcsolók a Vezetés menüben: nyolc témakör",{panel:fk.panel,sorok:fk.sorok});
  ok(fk.stilRejtve&&fk.golLatszik1&&fk.tarolva,"a „Csapatstílus pontgyűjtése” kikapcsolva elrejti a sort, a gól marad; a beállítás megmarad");
  ok(fk.stilVissza,"visszakapcsolva a korábbi sor is előjön");
  ok(fk.csakMeccs&&fk.golLatszik2&&fk.magyRejtve&&fk.gombAllapot,"„Csak a meccsközvetítés”: minden más rejtve, a gól látszik");
  ok(fk.mindVissza,"újra koppintva minden visszajön");

  /* ---- 5. PUSH ---- */
  console.log("\n— 5. A VEZETÉS PUSH-ÉRTESÍTÉSEI —");
  const pu=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const r={};
    try{hubMidSeasonReturn();}catch(e){}
    const t=teachStateObj();t.mode="hard";delete t.pushOff;
    /* egy nyitva maradt tipp-buborék alatt a push szándékosan hallgat — előbb
       azt zárjuk be, ahogy a játékos is tenné */
    for(let i=0;i<6;i++){const x=document.getElementById("guideTipOk");if(x&&x.offsetParent)x.click();await varj(80);}
    r.buborekAlatt=null;
    if(_guideCur){r.buborekAlatt=vezPushKapu();_guideCur=null;_guideQ=[];}
    /* a valódi témák elhallgatnak, hogy a mérés tiszta legyen */
    const eredeti={};Object.keys(VEZ_PUSH).forEach(k=>{eredeti[k]=VEZ_PUSH[k];delete VEZ_PUSH[k];});
    TEACH_TOPICS["proba:meccs"]={n:"Próba-meccstéma",why:"A kezdőrúgás előtt érdemes.",scr:"hub",prio:1,mark:"🧪",due:()=>true};
    TEACH_TOPICS["proba:reg"]={n:"Próba-régi",why:"Régóta vár.",scr:"hub",prio:2,due:()=>true};
    TEACH_TOPICS["proba:csend"]={n:"Próba-csendes",why:"Nem push.",scr:"hub",prio:0,due:()=>true};
    VEZ_PUSH["proba:meccs"]="meccs";VEZ_PUSH["proba:reg"]="reg";
    delete t.topics["proba:meccs"];delete t.topics["proba:reg"];
    r.kapu=vezPushKapu();
    const now=teachNow();
    r.j1=vezPushJelolt("meccs");
    r.jElo=vezPushJelolt("elo");
    teachTopicRec("proba:reg").pSince=now-8;
    r.j2=vezPushJelolt("meccs");
    /* a valódi ütem: az állapot megül, a sáv beúszik */
    _vezPushKulcs=null;_vezPushLat=0;
    await varj(2800);
    const el=document.getElementById("vezPush");
    r.sav=!!el&&!el.classList.contains("hide")&&el.classList.contains("mpPingIn");
    r.savTx=el?el.textContent.replace(/\s+/g," "):"";
    r.pAt=teachTopicRec("proba:meccs").pAt===now;
    r.ujra=vezPushJelolt("meccs");
    /* „Mutasd": a HUB-téma előtt a HUB kinyílik */
    el.querySelector("#vezPushGo").click();await varj(700);
    r.hubNyitva=!$("scHub").classList.contains("hide");
    try{hubMidSeasonReturn();}catch(e){}
    await varj(500);
    /* kikapcsolva és „Semmi" módban néma */
    t.pushOff=1;r.kiOn=vezPushOn();delete t.pushOff;
    t.mode="off";r.offOn=vezPushOn();t.mode="hard";
    /* a panel kapcsolója */
    renderTeachPanel();r.panelKapcsolo=!!document.querySelector("#hubTeachBody #tchPush");
    r.jelolt=/📣/.test((document.getElementById("hubTeachBody")||{}).textContent||"");
    /* takarítás */
    ["proba:meccs","proba:reg","proba:csend"].forEach(k=>{delete TEACH_TOPICS[k];delete VEZ_PUSH[k];delete t.topics[k];});
    Object.assign(VEZ_PUSH,eredeti);vezPushHide();
    return r;});
  ok(pu.kapu==="meccs","a kezdésre kész meccsképernyő a „kezdőrúgás előtti” pillanat",pu.kapu);
  ok(pu.j1.includes("proba:meccs")&&!pu.j1.includes("proba:csend")&&!pu.j1.includes("proba:reg"),"csak a push-témák szólnak; a „rég” fajta még nem (nincs 8 fordulója)",pu.j1);
  ok(!pu.jElo.includes("proba:meccs"),"a „meccs” fajta a felkészülési HUB-ban nem szól",pu.jElo);
  ok(pu.j2.includes("proba:reg"),"8 esedékes forduló után a „rég” fajta is szól",pu.j2);
  ok(pu.sav&&/Próba-meccstéma/.test(pu.savTx)&&/A kezdőrúgás előtt/.test(pu.savTx),"a sáv beúszik: cím, fajta, miért",pu.savTx);
  ok(pu.pAt&&!pu.ujra.includes("proba:meccs"),"egy téma fordulónként egyszer szól",pu.ujra);
  ok(pu.hubNyitva,"a „Mutasd” a HUB-ba visz");
  ok(pu.kiOn===false&&pu.offOn===false,"kikapcsolva és „Semmi” módban néma");
  ok(pu.panelKapcsolo&&pu.jelolt,"a Vezetés menüben saját kapcsoló, a push-témák 📣-vel jelölve");

  console.log("\n— 6. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
