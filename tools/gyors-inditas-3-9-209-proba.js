/* 🎛️ 3.9.209 — GYORS INDÍTÁS ÉS AZ ÚJ KARRIER ALAPBEÁLLÍTÁSAI.

   BEJELENTÉS: „a beállítások menübe kerüljön be az összes kapcsoló, amit új
   játék indításkor is állítasz […] amikor új játékot indítasz […] csak
   annyit kérdez, hogy dinamikus vagy hagyományos, draft vagy kész klub és
   aztán már indul is […] És csak a részletes mód lenyitásával lenne az, hogy
   végigmész a szokásos beállításokon" — „Osztályválasztó mindig jöjjön fel."

   Amit mér:
     1. GYORS INDÍTÁS: a kezdőlap gombja a két kérdést nyitja, nem a
        négyoldalas beállítót; a fajta és a kezdés átváltható; az „Indulás"
        ugyanazt a beginNewGame-et futtatja;
     2. RÉSZLETES ÚT: a „Részletes beállítás" a négyoldalas beállítót nyitja,
        onnan vissza lehet lépni; az összefoglaló sora a megfelelő oldalra visz;
     3. A TÁR: a beállító mozdulatai a tárba íródnak, és a következő
        megnyitáskor onnan töltődnek vissza;
     4. A BEÁLLÍTÁSOK BLOKKJA: minden mező szerkeszthető, a FUTÓ karriert nem
        változtatja meg, a gyors indítás kikapcsolható;
     5. ZÁRAK: zárt értéket a tár sem állít be (a lépcső presetje és a kapuk
        felülírják), a gyors indítás zárt gombja nem választható;
     6. OSZTÁLYVÁLASZTÓ: az alapbeállítás szerinti osztály és nehézség előre
        kijelölve; a ténylegesen választott lesz a következő alapja;
     7. KÖZÖS KARRIER: a házigazda a saját alapbeállításaival indul (azok
        utaznak a csomagban). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9251;
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
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  /* a lépcső nélkül (egy már „végigjátszott" profil) — a zárakat a 5. részben külön mérjük */
  /* a dinamikus karrier kezdőlap-gombja friss profilon zárt (5 cím) — a kapu nélküli profilban nyitva */
  const nyit=()=>p.evaluate(()=>{window.__gates=window.__gates||unlockGatesOn;unlockGatesOn=()=>false;
    const d=document.getElementById("modeCareerDynBtn");if(d){d.disabled=false;d.classList.remove("unlockOff");}});
  await nyit();
  const vis=id=>`!document.getElementById("${id}").classList.contains("hide")`;

  console.log("\n— 1. gyors indítás —");
  const r1=await p.evaluate(new Function(`
    const o={v:APP_VERSION,gyors:kaGyors()};
    document.getElementById("modeCareerPyrBtn").click();
    o.quick=${vis("scQuick")};o.setup=${vis("scFormation")};
    o.modeSel=document.querySelector('#qkModeGrid button.sel').dataset.qk;
    o.recap=document.querySelectorAll("#qkRecap .setupRecapRow").length;
    document.querySelector('#qkStartGrid button[data-qs="club"]').click();
    o.cs=careerStart;o.tarStart=kaGet("start");
    document.querySelector('#qkModeGrid button[data-qk="dyn"]').click();
    o.pyr=pyrWanted;
    document.querySelector('#qkModeGrid button[data-qk="pyr"]').click();
    o.pyr2=pyrWanted;
    document.querySelector('#qkStartGrid button[data-qs="draft"]').click();
    window.__bng=0;const _b=beginNewGame;beginNewGame=function(){window.__bng++;return _b.apply(this,arguments);};
    document.getElementById("qkGoBtn").click();
    beginNewGame=_b;
    o.bng=window.__bng;o.quickUtan=${vis("scQuick")};o.scout=${vis("scScout")};o.gm=gameMode;o.cs2=careerStart;
    return o;`));
  ok(String(r1.v).localeCompare("3.9.209",undefined,{numeric:true})>=0&&r1.gyors===true,"alapból gyors indítás",r1);
  ok(r1.quick&&!r1.setup&&r1.modeSel==="pyr"&&r1.recap>=5,"a kezdőlap gombja a két kérdést nyitja (a választott fajtával), alatta az alapbeállítások",r1);
  ok(r1.cs==="club"&&r1.tarStart==="club"&&r1.pyr===false&&r1.pyr2===true,"a fajta és a kezdés átváltható, és a tárba íródik",r1);
  ok(r1.bng===1&&!r1.quickUtan&&r1.scout&&r1.gm==="career"&&r1.cs2==="draft","az „Indulás” a beginNewGame-et futtatja — indul a scout és a draft",r1);

  console.log("\n— 2. részletes út —");
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);await nyit();
  const r2=await p.evaluate(new Function(`
    const o={};
    document.getElementById("modeCareerDynBtn").click();
    document.getElementById("qkDetailBtn").click();
    o.setup=${vis("scFormation")};o.quick=${vis("scQuick")};o.vissza=${vis("setupQuickBtn")};
    document.getElementById("setupQuickBtn").click();
    o.quick2=${vis("scQuick")};o.setup2=${vis("scFormation")};
    const sor=[...document.querySelectorAll("#qkRecap .setupRecapRow")].find(x=>x.dataset.pg==="2");
    sor.click();o.oldal=_setupPage;o.setup3=${vis("scFormation")};
    return o;`));
  ok(r2.setup&&!r2.quick&&r2.vissza,"a „Részletes beállítás” a négyoldalas beállítót nyitja, vissza-gombbal",r2);
  ok(r2.quick2&&!r2.setup2,"vissza lehet lépni a gyors indításhoz",r2);
  ok(r2.oldal===2&&r2.setup3,"az összefoglaló sora a beállítás oldalára visz",r2);

  console.log("\n— 3. a tár: rögzítés és visszatöltés —");
  const r3=await p.evaluate(new Function(`
    const o={};
    document.querySelector('#familyToggleGrid button[data-fam="on"]').click();
    document.querySelector('#guideGrid button[data-gd="light"]').click();
    const rs=document.getElementById("rerollSlider");rs.value="4";rs.dispatchEvent(new Event("input",{bubbles:true}));
    return new Promise(r=>setTimeout(()=>{o.fam=kaGet("family");o.gd=kaGet("guide");o.rr=kaGet("rerolls");r(o);},30));`));
  ok(r3.fam==="on"&&r3.gd==="light"&&r3.rr==="4","a beállító mozdulatai a tárba íródnak",r3);
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);await nyit();
  const r3b=await p.evaluate(()=>{document.getElementById("modeCareerDynBtn").click();
    return {fam:familyEnabled,gd:guideWantedMode,rr:document.getElementById("rerollSlider").value,
      famSel:document.querySelector('#familyToggleGrid button.sel').dataset.fam};});
  ok(r3b.fam===true&&r3b.gd==="light"&&r3b.rr==="4"&&r3b.famSel==="on","újratöltés után a beállító a tárból töltődik vissza",r3b);

  console.log("\n— 4. a Beállítások blokkja —");
  const r4=await p.evaluate(async()=>{
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const o={};
    document.getElementById("themeModal").classList.remove("hide");renderThemeModal();await varj(40);
    const box=document.getElementById("kaBox");o.van=!!box;
    o.mezok=[...box.querySelectorAll("select[data-ka]")].map(x=>x.dataset.ka);
    o.tax=box.querySelectorAll("select[data-katax]").length;
    const set=(k,v)=>{const el=box.querySelector(`select[data-ka="${k}"]`);el.value=v;el.dispatchEvent(new Event("change"));};
    const tempoElotte=gameTempoPref();
    set("tempo","gyors");set("skill","real");set("icons","ritka");set("speed","kegyet");set("scoutReal","on");set("dynLevel","88");set("autoLevel","off");
    {const el=box.querySelector('select[data-katax="penz"]');el.value="csiga";el.dispatchEvent(new Event("change"));}
    o.tar={tempo:kaGet("tempo"),skill:kaGet("skill"),icons:kaGet("icons"),speed:kaGet("speed"),sr:kaGet("scoutReal"),dyn:kaGet("dynLevel"),tax:kaGet("tax")};
    o.eloTempo=gameTempoPref()===tempoElotte;o.eloIcon=iconRatePref()!=="ritka"||true;
    /* a gyors indítás kikapcsolása */
    box.querySelector("#kaGyorsBtn").click();await varj(20);o.gyors=kaGyors();
    document.getElementById("themeModal").classList.add("hide");
    return o;});
  ok(r4.van&&["start","form","wc","basis","magyah","scoutReal","family","rerolls","speed","pyrDiv","pyrNf","dynLevel","autoLevel","tempo","icons","guide","skill"].every(k=>r4.mezok.includes(k))&&r4.tax===4,
     "minden beállító-mező szerkeszthető (a négy résztempóval együtt)",r4.mezok);
  ok(r4.tar.tempo==="gyors"&&r4.tar.skill==="real"&&r4.tar.speed==="kegyet"&&r4.tar.sr==="on"&&r4.tar.dyn==="88"&&r4.tar.tax&&r4.tar.tax.penz==="csiga","a szerkesztő a tárba ír",r4.tar);
  ok(r4.eloTempo,"a futó állapotot nem írja át (a tempó-preferencia a következő beállító-megnyitásig változatlan)",r4);
  ok(r4.gyors===false,"a gyors indítás kikapcsolható",r4.gyors);
  const r4b=await p.evaluate(new Function(`
    document.getElementById("modeCareerDynBtn").click();
    return {quick:${vis("scQuick")},setup:${vis("scFormation")},tempo:gameTempoPref(),penz:tempoAxOwn("penz"),skill:skillModeWanted,
      speed:pyrWantedSpeed,sr:scoutRealWanted,dyn:oppTargetRating,al:!!S.autoLevel,icons:iconRatePref()};`));
  ok(!r4b.quick&&r4b.setup,"kikapcsolt gyors indításnál a négyoldalas beállító nyílik",r4b);
  ok(r4b.tempo==="gyors"&&r4b.penz==="csiga"&&r4b.skill==="real"&&r4b.speed==="kegyet"&&r4b.sr===true&&r4b.dyn===88&&r4b.al===false&&r4b.icons==="ritka",
     "a beállító megnyitásakor a szerkesztett alapbeállítások lépnek életbe",r4b);

  console.log("\n— 5. zárak —");
  const r5=await p.evaluate(new Function(`
    unlockGatesOn=window.__gates;
    kaSet("gyors",true);kaSet("start","club");kaSet("wc","on");
    document.getElementById("modeCareerPyrBtn").click();
    const club=document.querySelector('#qkStartGrid button[data-qs="club"]');
    const dyn=document.querySelector('#qkModeGrid button[data-qk="dyn"]');
    return {cs:careerStart,lepcso:!!unlockPreset(),clubOff:club.disabled,wc:wcEnabled,dynOff:dyn.disabled,
      ladder:${vis("qkLadder")}};`));
  ok(r5.lepcso&&r5.cs==="draft"&&r5.clubOff&&r5.wc===false,"a lépcsőn a preset felülírja a tárat, a zárt kezdés nem választható",r5);
  ok(r5.ladder,"a gyors indítás kiírja a lépcső jelzését",r5);
  ok(r5.dynOff,"a dinamikus karrier zárja (5 cím) a gyors indításban is él",r5);
  await nyit();

  console.log("\n— 6. az osztályválasztó —");
  const r6=await p.evaluate(()=>{
    const o={};
    kaSet("pyrDiv","5");kaSet("pyrGapT","10");
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    const pick={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPendingSpeed=pyrWantedSpeed;
    pyrOpenDivPick(pick);
    o.div=pyrPickDiv;o.t=diffSnapT(pyrPickGap);
    o.lathato=!document.getElementById("scPyrDiv").classList.contains("hide");
    pyrPickDiv=4;pyrPickGap=1.5;pyrConfirmDiv();
    o.ujDiv=kaGet("pyrDiv");o.ujT=kaGet("pyrGapT");
    return o;});
  ok(r6.lathato&&r6.div===5&&r6.t===10,"az osztályválasztó feljön, az alapbeállítás szerinti osztállyal és nehézséggel",r6);
  ok(r6.ujDiv==="4"&&r6.ujT==="15","a ténylegesen választott lesz a következő alapja",r6);

  console.log("\n— 7. közös karrier —");
  /* élesben a szobába lépés újratölt — a 5. rész lépcső-zárai ne ragadjanak át */
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);await nyit();
  const r7=await p.evaluate(()=>{
    kaSet("family","on");kaSet("rerolls","2");kaSet("icons","nagyonritka");
    const mpA=MP.active,role=MP.role;MP.active=true;MP.role="host";
    try{document.getElementById("mpStartBtn").click();}catch(e){}
    const s=mpCollectSettings();
    const o={fam:s.familyEnabled,rr:document.getElementById("rerollSlider").value,quick:!document.getElementById("scQuick").classList.contains("hide"),
      mode:!!document.querySelector("#qkModeGrid button.sel")};
    MP.active=mpA;MP.role=role;return o;});
  ok(r7.fam===true&&r7.rr==="2"&&r7.quick&&r7.mode,"a házigazda is gyors indítással, a saját alapbeállításaival kezd (azok utaznak)",r7);

  ok(!errs.length,"nincs konzolhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
