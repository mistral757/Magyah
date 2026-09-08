/* 🪜 LÉPCSŐK A CSÚCS FELÉ — a feloldás-rendszer élő mérése (1. fázis).
   Amit néz:
     1. a napló ÜRESEN indul, és a lépcső 1/3-on áll,
     2. az ELSŐ Kezdőrúgás üdvözlő ablakot nyit, a MÁSODIK már nem,
     3. a Kezdőrúgás a lépcsőn a HAGYOMÁNYOS karrierbe visz (kötött út),
     4. a kezdőlapi útválasztó a lépcsőn REJTETT, három cím után látszik,
     5. a dinamikus karrier az 5. címig ZÁRVA, utána nyitva,
     6. mind a három lépcső PRESETJE pontosan azt állítja be, amit a terv mond,
     7. a `zar` listán szereplő vezérlők valóban tiltottak, a többi nem,
     8. a lépcső után MINDEN feloldódik (a zár VISSZAVONHATÓ),
     9. a D1-győzelem lépteti a naplót és sorban hozza a feloldás-ablakokat,
    10. a válogatott-kapcsoló új, jogtiszta felirata.
   Használat: node tools/lepcsok-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8961'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};

  /* Egy friss lap, megadott számú D1-győzelemmel a naplóban. A napló
     localStorage-ban él, ezért a beállítás UTÁN újra kell tölteni. */
  async function lap(d1){
    const p=await b.newPage({viewport:{width:390,height:844}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(n=>{
      try{localStorage.clear();}catch(e){}
      if(n>0)try{localStorage.setItem("30-0-unlock-v1",
        JSON.stringify({v:1,d1:n,runs:0,bestRun:0,icons:0,nat:0,skills:0,
          maxSkills:0,panzer:false,seen:{welcome:1},at:Date.now()}));}catch(e){}
    },d1);
    await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p;}

  /* ── 1. ÜRES NAPLÓ ── */
  {const p=await lap(0);
   out.ures=await p.evaluate(()=>({
     d1:unlockState().d1, lepcso:unlockStep(), lepcson:unlockOnLadder(),
     preset_van:!!unlockPreset(),
     dyn_zarva:unlockHas("dyn")===false, div4_zarva:unlockHas("diff")===false}));

   /* ── 2-3. ÜDVÖZLŐ + KÖTÖTT ÚT ── */
   out.udvozlo=await p.evaluate(()=>{
     const r={};
     const el=document.getElementById("unlockWelcome");
     r.rejtve_elotte=el.classList.contains("hide");
     let ut=[];const igazi=window.heNewCareer;window.heNewCareer=(m)=>{ut.push(m);};
     document.getElementById("mpSoloBtn").click();
     r.megnyilt=!el.classList.contains("hide");
     r.karrier_meg_nem_indult=ut.length===0;      /* előbb olvas, aztán indul */
     document.getElementById("unlockWelBtn").click();
     r.bezarult=el.classList.contains("hide");
     r.ut=ut.slice();                              /* a lépcsőn: "pyr" */
     /* MÁSODIK koppintás: az ablak már nem jön elő, a karrier azonnal indul */
     ut=[];document.getElementById("mpSoloBtn").click();
     r.masodszor_nincs_ablak=el.classList.contains("hide");
     r.masodszor_ut=ut.slice();
     window.heNewCareer=igazi;
     return r;});

   /* ── 4-5. A KEZDŐLAPI ÚTVÁLASZTÓ ── */
   out.utvalaszto_0=await p.evaluate(()=>({
     szakasz_rejtve:document.getElementById("heWaySect").classList.contains("hide"),
     dyn_tiltva:document.getElementById("heWayDyn").disabled,
     modelap_dyn_tiltva:document.getElementById("modeCareerDynBtn").disabled}));
   await p.close();}

  /* ── 6-7. A HÁROM LÉPCSŐ PRESETJE ÉS ZÁRAI ── */
  const VART={
    1:{diff:78,rerolls:5,speed:"lassu",guide:"hard",
       zart:["#diffSlider","#rerollSlider","#guideGrid button","#wcToggleGrid button",
             "#pyrSpeedGrid button","#iconGrid button","#ratingBasisGrid button",
             "#careerStartGrid button"],
       nyitott:[]},
    2:{diff:80,rerolls:3,speed:"lassu",guide:"hard",
       zart:["#diffSlider","#rerollSlider","#wcToggleGrid button","#pyrSpeedGrid button",
             "#iconGrid button","#ratingBasisGrid button","#careerStartGrid button"],
       nyitott:["#guideGrid button"]},
    3:{diff:80,rerolls:null,speed:"tarto",guide:"hard",
       zart:["#diffSlider","#wcToggleGrid button","#pyrSpeedGrid button","#iconGrid button",
             "#ratingBasisGrid button","#careerStartGrid button"],
       nyitott:["#guideGrid button","#rerollSlider"]}};
  out.lepcsok={};
  for(const n of [1,2,3]){
    const p=await lap(n-1);
    out.lepcsok[n]=await p.evaluate(()=>{
      /* a hagyományos karrier beállító képernyője — ugyanaz az út, mint a
         kezdőlapi gombé */
      enterCareerSetupFromHome(true);
      const zart=sel=>[...document.querySelectorAll(sel)].every(e=>e.disabled);
      const nyit=sel=>[...document.querySelectorAll(sel)].every(e=>!e.disabled);
      return {
        lepcso:unlockStep(),
        pyr:pyrWanted, start:careerStart, wc:wcEnabled, family:familyEnabled,
        basis:ratingBasis(),
        rerolls, csuszka_reroll:+document.getElementById("rerollSlider").value,
        speed:pyrWantedSpeed, tempo:gameTempoPref(), icons:iconRatePref(),
        guide:guideWantedMode, skill:skillModeWanted,
        diff:oppTargetRating, alap:careerBaseRating,
        gift_speed:unlockGiftHas("speed",pyrWantedSpeed),
        gift_tempo:unlockGiftHas("tempo",gameTempoPref()),
        csuszka_diff:+document.getElementById("diffSlider").value,
        jelzes:!document.getElementById("unlockSetupNote").classList.contains("hide"),
        jelzes_szoveg:document.getElementById("unlockSetupNote").textContent.trim().slice(0,80),
        zar:{diff:zart("#diffSlider"),reroll:zart("#rerollSlider"),
             guide:zart("#guideGrid button"),wc:zart("#wcToggleGrid button"),
             speed:zart("#pyrSpeedGrid button"),icons:zart("#iconGrid button"),
             basis:zart("#ratingBasisGrid button"),start:zart("#careerStartGrid button")},
        forma_nyitva:nyit("#formGrid button")};});
    await p.close();}

  /* ── 8. A LÉPCSŐ UTÁN MINDEN NYITVA ── */
  {const p=await lap(3);
   out.szabad=await p.evaluate(()=>{
     enterCareerSetupFromHome(true);
     const zart=sel=>[...document.querySelectorAll(sel)].some(e=>e.disabled);
     return {lepcson:unlockOnLadder(), preset:unlockPreset(),
       jelzes_rejtve:document.getElementById("unlockSetupNote").classList.contains("hide"),
       /* A LÉPCSŐ-ZÁR VÉGE ≠ MINDEN NYITVA. A rácsok visszakerülnek a
          játékoshoz, de az EGYES kapuk (lutri, kész klub) még zárva vannak —
          épp ez az a hiba, amit a 2. fázis javított. */
       barmi_zart:["#diffSlider","#rerollSlider","#guideGrid button"].filter(zart),
       /* A FOKOZAT- ÉS TEMPÓ-RÁCS a RUN-kapuk alatt, az IKON- ÉS
          VÁLOGATOTT-RÁCS a GYŰJTŐ kapuk alatt marad — mindkettő MÁS RÉTEG,
          mint a lépcső rács-zára, és a 3. bajnoki cím nem old fel egyiket sem. */
       run_kapuzott:["#pyrSpeedGrid button","#tempoGrid button"].filter(zart),
       gyujto_kapuzott:["#iconGrid button","#wcToggleGrid button"].filter(zart),
       kapuzott:["#ratingBasisGrid button","#careerStartGrid button"].filter(zart),
       nyitva:{diff:unlockHas("diff"),basis:unlockHas("basis"),div4:unlockHas("div4"),
               div5:unlockHas("div5"),dyn:unlockHas("dyn")}};});
   out.utvalaszto_3=await p.evaluate(()=>({
     szakasz_latszik:!document.getElementById("heWaySect").classList.contains("hide"),
     dyn_tiltva:document.getElementById("heWayDyn").disabled,
     dyn_felirat:document.getElementById("heWayDyn").querySelector("i").textContent.slice(0,40)}));
   await p.close();}

  /* ── 5b. AZ ÖTÖDIK CÍM UTÁN A DINAMIKUS IS NYITVA ── */
  {const p=await lap(5);
   out.ot_cim=await p.evaluate(()=>({
     dyn:unlockHas("dyn"), club:unlockHas("club"), div6:unlockHas("div6"),
     dyn_tiltva:document.getElementById("heWayDyn").disabled,
     modelap_tiltva:document.getElementById("modeCareerDynBtn").disabled}));
   await p.close();}

  /* ── 9. A D1-GYŐZELEM KÖNYVELÉSE ÉS AZ ABLAK-SOR ── */
  {const p=await lap(0);
   out.gyozelem=await p.evaluate(()=>{
     const l=[];
     for(let i=0;i<5;i++){
       unlockNoteD1();
       const el=document.getElementById("unlockCard");
       l.push({d1:unlockState().d1, nyitva:!el.classList.contains("hide"),
               cim:document.getElementById("unlockCardTitle").textContent,
               mit:document.getElementById("unlockCardWhat").textContent});
       /* az ablakot bezárjuk, hogy a következő jöhessen (a lánc időzített) */
       unlockCardClose();}
     /* ÚJRA: ugyanaz a feloldás NEM jön elő másodszor */
     const elotte=unlockState().d1;
     unlockShow("free1");
     return {sor:l, ismetles_nem_jott:document.getElementById("unlockCard").classList.contains("hide"),
             vegso_d1:elotte};});
   await p.close();}

  /* ── 12. AZ EGYES VÁLASZTÁSOK KAPUI (2. fázis) ── */
  out.kapuk={};
  for(const n of [0,3,4,5]){
    const p=await lap(n);
    out.kapuk[n]=await p.evaluate(()=>{
      enterCareerSetupFromHome(true);
      const g=sel=>{const el=document.querySelector(sel);
        return el?{tiltva:el.disabled,szurke:el.classList.contains("unlockOff"),
                   sz:(el.querySelector("small")||{}).textContent}:null;};
      return {
        d1:unlockState().d1,
        divMax:unlockDivMax(),
        divWhy:{d3:unlockDivWhy(3),d4:unlockDivWhy(4),d5:unlockDivWhy(5),d6:unlockDivWhy(6)},
        season:g('#ratingBasisGrid button[data-rb="season"]'),
        wild:g('#ratingBasisGrid button[data-rb="wild"]'),
        peak:g('#ratingBasisGrid button[data-rb="peak"]'),
        club:g('#careerStartGrid button[data-cs="club"]'),
        draft:g('#careerStartGrid button[data-cs="draft"]')};});
    await p.close();}

  /* ── 13. AZ OSZTÁLYVÁLASZTÓ LISTÁJA ── */
  {const p=await lap(3);
   out.osztalylista=await p.evaluate(()=>{
     /* a listát a saját rajzolójával kérjük — egy valós klubkeretre */
     const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
     pyrPickSq=sq;pyrPickDiv=null;pyrPendingSpeed="tarto";pyrPickGap=0;
     renderPyrDivPick();
     const sorok=[...document.querySelectorAll("#pyrDivPickList button")].map(b=>({
       tiltva:b.disabled, szurke:b.classList.contains("unlockOff"),
       sz:b.textContent.replace(/\s+/g," ").trim().slice(0,50)}));
     /* az ajánlás sem eshet zárt osztályra */
     const ajanlott=pyrRecommendDiv(sq,"tarto",0);
     /* és a megerősítés sem indíthat zárt osztályból */
     pyrPickDiv=6;
     return {sorok, kijelolt:pyrPickDiv, ajanlott, divMax:unlockDivMax()};});
   await p.close();}

  /* ── 11. A GYŰJTŐ SZÁMLÁLÓK (a kapuk a 3-4. fázisban jönnek, a GYŰJTÉS már megy) ── */
  {const p=await lap(0);
   out.szamlalok=await p.evaluate(()=>{
     const r={};
     /* IKON és NEMZETI VÁLOGATOTT — a markArrived központi pontján */
     r.nat_nevsor=unlockNatNames().size;
     /* A careerPool modul-szintű `let`: BAREN kell írni, a window-on nincs rajta. */
     careerPool={"Teszt Ikon":{isIcon:true,skillsEver:[]},
                 "Teszt Sima":{skillsEver:[]}};
     const natNev=[...unlockNatNames()][0];
     careerPool[natNev]={skillsEver:[]};
     unlockNoteSigning("Teszt Ikon");
     unlockNoteSigning("Teszt Sima");
     unlockNoteSigning(natNev);
     r.icons=unlockState().icons; r.nat=unlockState().nat;
     r.icon2_zarva=unlockHas("icon2")===false;
     for(let i=0;i<9;i++)unlockNoteSigning("Teszt Ikon");
     r.icons10=unlockState().icons; r.icon2_nyilt=unlockHas("icon2")===true;
     /* KÉPESSÉG: az egy emberen lévő csúcs és az összeg */
     for(let i=0;i<10;i++){
       careerPool["Teszt Sima"].skillsEver.push("s"+i);
       unlockNoteSkill("Teszt Sima");}
     r.skills=unlockState().skills; r.maxSkills=unlockState().maxSkills;
     r.skillReal=unlockHas("skillReal");
     /* RUN: SZÁRMAZTATOTT — a ranglistából, visszamenőleg is */
     /* a Run-ranglista NYERS TÖMB — pontosan az a szerkezet, amit a
        runBoardLoad vár (egy rossz alakú fixture itt csendben nullát adna) */
     try{localStorage.setItem("30-0-runboard-v1",JSON.stringify(
       [{run:71},{run:44},{run:12}]));}catch(e){}
     return r;});
   /* a származtatás csak friss olvasáskor látszik — újratöltjük a lapot */
   await p.reload({waitUntil:'networkidle'});
   await p.waitForTimeout(2400);
   out.run_szarmaztatas=await p.evaluate(()=>({
     runs:unlockState().runs, bestRun:unlockState().bestRun,
     tarto:unlockSpeedOk("tarto"), kegyet:unlockSpeedOk("kegyet"),
     konyortelen:unlockSpeedOk("konyortelen"),
     vegtelen:unlockSpeedOk("vegtelen"),
     lassu:unlockSpeedOk("lassu"),
     tempo_normal:unlockTempoOk("normal"), tempo_csiga:unlockTempoOk("csiga"),
     tempo_jegkorszak:unlockTempoOk("jegkorszak"),
     tempo_kokorszak:unlockTempoOk("kokorszak"),
     stilus:{beton:unlockHas("styleBeton"),villam:unlockHas("styleVillam"),
             tiki:unlockHas("styleTiki"),panzer:unlockHas("stylePanzer")}}));
   await p.close();}

  /* ── 14. A RUN-KAPUK A FELÜLETEN (3. fázis) ── */
  /* Egy lap, megadott Run-előzménnyel. */
  async function runLap(lista,extra){
    const p=await b.newPage({viewport:{width:390,height:844}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(a=>{
      try{localStorage.clear();}catch(e){}
      try{localStorage.setItem("30-0-runboard-v1",JSON.stringify(a.lista));}catch(e){}
      /* A LÉPCSŐN KÍVÜL mérünk: 3 bajnoki cím, hogy a rács-zár ne takarja el a
         Run-kapukat — a kettő két külön réteg, és itt a másodikat vizsgáljuk. */
      try{localStorage.setItem("30-0-unlock-v1",JSON.stringify(
        {v:1,d1:3,runs:0,bestRun:0,icons:0,nat:0,skills:0,maxSkills:0,
         panzer:false,gift:{},seen:{welcome:1},at:1}));}catch(e){}
      if(a.extra)Object.keys(a.extra).forEach(k=>{
        try{localStorage.setItem(k,a.extra[k]);}catch(e){}});
    },{lista,extra:extra||null});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p;}

  /* 14a. FRISS TELEPÍTÉS: nulla Run — csak az alapfokozat és az alap tempó */
  {const p=await runLap([]);
   out.run_kapu_0=await p.evaluate(()=>{
     enterCareerSetupFromHome(true);
     const sp=[...document.querySelectorAll("#pyrSpeedGrid button")].map(b=>({
       tiltva:b.disabled,szurke:b.classList.contains("unlockOff"),
       sel:b.classList.contains("sel"),
       sz:(b.querySelector("small")||{}).textContent||""}));
     const tp=[...document.querySelectorAll("#tempoGrid button")].map(b=>({
       id:b.dataset.tempo,tiltva:b.disabled,
       sz:(b.querySelector("small")||{}).textContent||""}));
     return {fokozatok:sp, tempok:tp, valasztott:pyrWantedSpeed,
       ok:{lassu:unlockSpeedOk("lassu"),tarto:unlockSpeedOk("tarto"),
           alvo:unlockSpeedOk("alvo"),kegyet:unlockSpeedOk("kegyet")},
       stilus:{beton:unlockStyleOk("beton"),bombazok:unlockStyleOk("bombazok"),
               harmonia:unlockStyleOk("harmonia"),villam:unlockStyleOk("villam"),
               sztar:unlockStyleOk("sztar"),tikitaka:unlockStyleOk("tikitaka"),
               panzer:unlockStyleOk("panzer")},
       miert:{villam:unlockStyleWhy("villam"),panzer:unlockStyleWhy("panzer"),
              tarto:unlockSpeedWhy("tarto"),kegyet:unlockSpeedWhy("kegyet"),
              csiga:unlockTempoWhy("csiga")}};});
   await p.close();}

  /* 14b. HÁROM LEZÁRT KARRIER, 62-es csúcs — a táblázat közepe */
  {const p=await runLap([{run:62,style:"villam"},{run:31},{run:12}]);
   out.run_kapu_62=await p.evaluate(()=>{
     enterCareerSetupFromHome(true);
     return {runs:unlockState().runs, best:unlockState().bestRun,
       speed:{lassu:unlockSpeedOk("lassu"),tarto:unlockSpeedOk("tarto"),
              alvo:unlockSpeedOk("alvo"),kegyet:unlockSpeedOk("kegyet"),
              konyortelen:unlockSpeedOk("konyortelen"),vegtelen:unlockSpeedOk("vegtelen")},
       tempo:{normal:unlockTempoOk("normal"),komotos:unlockTempoOk("komotos"),
              csiga:unlockTempoOk("csiga"),gleccser:unlockTempoOk("gleccser"),
              jegkorszak:unlockTempoOk("jegkorszak"),kokorszak:unlockTempoOk("kokorszak")},
       stilus:{villam:unlockStyleOk("villam"),sztar:unlockStyleOk("sztar"),
               tikitaka:unlockStyleOk("tikitaka")},
       tempo_valasztott:gameTempoPref()};});
   await p.close();}

  /* 14c. A JÓVÁÍRÁS: a tárolt tempó és a Run-lista stílusa/fokozata azonnal jár */
  {const p=await runLap([{run:5,style:"tikitaka",speed:"vegtelen"}],
                        {"harminc_nulla_tempo_v1":"kokorszak"});
   out.jovairas=await p.evaluate(()=>({
     runs:unlockState().runs, best:unlockState().bestRun,
     gift:unlockState().gift,
     /* MIND A HÁROM messze a Run-küszöb ALATT van — mégis nyitva, mert
        használatban volt */
     kokorszak:unlockTempoOk("kokorszak"),
     vegtelen:unlockSpeedOk("vegtelen"),
     tikitaka:unlockStyleOk("tikitaka"),
     /* amit NEM használt, az továbbra is zárva */
     jegkorszak:unlockTempoOk("jegkorszak"),
     konyortelen:unlockSpeedOk("konyortelen"),
     sztar:unlockStyleOk("sztar"),
     /* és a választó a jóváírt tempón áll, nem esik vissza az alapra */
     valasztott:gameTempoPref()}));
   await p.close();}

  /* 14d. A PANZER FELTÉTELE */
  {const p=await runLap([]);
   out.panzer=await p.evaluate(()=>{
     const jo=n=>({leadI:0,coopI:0,aggroI:4});   /* 3 negatív jellemvonás */
     const semmi=()=>({leadI:4,coopI:5,aggroI:0});
     const r={};
     r.egy_ember=unlockBadTraits(jo());
     r.tiszta=unlockBadTraits(semmi());
     r.kell=UNLOCK_PANZER_NEED;
     /* 4 nehéz ember = 12 vonás — még nem elég */
     r.negy=unlockNoteDraft([jo(),jo(),jo(),jo()]);
     r.zarva_12=unlockStyleOk("panzer")===false;
     /* 5 nehéz ember = 15 — megvan */
     r.ot=unlockNoteDraft([jo(),jo(),jo(),jo(),jo(),semmi()]);
     r.nyilt=unlockStyleOk("panzer")===true;
     r.naplo=unlockState().panzer;
     r.ablak=!document.getElementById("unlockCard").classList.contains("hide");
     r.ablak_cim=document.getElementById("unlockCardTitle").textContent;
     return r;});
   await p.close();}

  /* 14e. A STÍLUSVÁLASZTÓ LISTÁJA */
  {const p=await runLap([{run:20}]);   /* 1 lezárt karrier → a 2. fut */
   out.stiluslista=await p.evaluate(()=>{
     const h=styleChooserHtml?styleChooserHtml():"";
     const d=document.createElement("div");d.innerHTML=h;
     const sorok=[...d.querySelectorAll(".msItem")].map(x=>({
       nev:(x.querySelector(".msTop b")||{}).textContent||"",
       zart:x.classList.contains("unlockOff"),
       gomb:(x.querySelector("button")||{}).textContent||"",
       felirat:x.textContent.indexOf("karrieredtől")>=0||x.textContent.indexOf("jellemvonás")>=0}));
     return {sorok, runs:unlockState().runs};});
   await p.close();}

  /* ── 15. A GYŰJTŐ KAPUK A FELÜLETEN (4. fázis) ── */
  async function gyujtoLap(u,extra){
    const p=await b.newPage({viewport:{width:390,height:844}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(a=>{
      try{localStorage.clear();}catch(e){}
      try{localStorage.setItem("30-0-unlock-v1",JSON.stringify(Object.assign(
        {v:1,d1:5,runs:0,bestRun:0,icons:0,nat:0,skills:0,maxSkills:0,
         panzer:false,gift:{},seen:{welcome:1,migrate:1},at:1},a.u)));}catch(e){}
      if(a.extra)Object.keys(a.extra).forEach(k=>{
        try{localStorage.setItem(k,a.extra[k]);}catch(e){}});
    },{u,extra:extra||null});
    await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p;}
  async function gyujtoOlvas(p){
    return p.evaluate(()=>{
      enterCareerSetupFromHome(true);
      const g=sel=>{const el=document.querySelector(sel);
        return el?{tiltva:el.disabled,sz:(el.querySelector("small")||{}).textContent||""}:null;};
      return {
        ritka:g('#iconGrid button[data-icon="ritka"]'),
        nagyonritka:g('#iconGrid button[data-icon="nagyonritka"]'),
        ki:g('#iconGrid button[data-icon="ki"]'),
        teljes:g('#iconGrid button[data-icon="teljes"]'),
        wc:g('#wcToggleGrid button[data-wc="on"]'),
        real:g('#skillModeGrid button[data-sk="real"]'),
        laza:g('#skillModeGrid button[data-sk="loose"]'),
        beallitas:{ikon:iconRatePref(),wcEnabled:wcEnabled}};});}

  {const p=await gyujtoLap({});                 out.gyujto_0=await gyujtoOlvas(p);await p.close();}
  {const p=await gyujtoLap({icons:12,nat:8});   out.gyujto_12=await gyujtoOlvas(p);await p.close();}
  {const p=await gyujtoLap({icons:22,nat:20,maxSkills:10});
   out.gyujto_teli=await gyujtoOlvas(p);await p.close();}
  /* 15b. A JÓVÁÍRÁS: aki ma ritkább ikonokkal és válogatottakkal játszik, azt
     a kapu nem veheti el — a MIGRÁCIÓ kell hozzá, ezért `migrate` nélkül. */
  {const p=await b.newPage({viewport:{width:390,height:844}});
   p.on('pageerror',e=>hiba.push(e.message));
   await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
   await p.evaluate(()=>{
     try{localStorage.clear();}catch(e){}
     try{localStorage.setItem("harminc_nulla_ikon_v1","nagyonritka");
         localStorage.setItem("harminc_nulla_wc_v1","on");
         localStorage.setItem("30-0-unlock-v1",JSON.stringify(
           {v:1,d1:5,runs:0,bestRun:0,icons:0,nat:0,skills:0,maxSkills:0,
            panzer:false,gift:{},seen:{welcome:1},at:1}));}catch(e){}});
   await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
   await p.waitForTimeout(2400);
   out.gyujto_jovairas=await gyujtoOlvas(p);
   await p.close();}
  /* 15c. A KÜSZÖB ÁTLÉPÉSE ABLAKOT NYIT */
  {const p=await gyujtoLap({icons:9,nat:19});
   out.gyujto_ablak=await p.evaluate(()=>{
     careerPool={"Ikon":{isIcon:true,skillsEver:[]}};
     const natNev=[...unlockNatNames()][0];
     careerPool[natNev]={skillsEver:[]};
     const r={};
     unlockNoteSigning("Ikon");
     r.icon_cim=document.getElementById("unlockCardTitle").textContent;
     r.icon_nyit=!document.getElementById("unlockCard").classList.contains("hide");
     unlockCardClose();
     unlockNoteSigning(natNev);
     r.wc_cim=document.getElementById("unlockCardTitle").textContent;
     r.szamlalok={icons:unlockState().icons,nat:unlockState().nat};
     return r;});
   await p.close();}

  /* ── 16. A HALADÁS PANEL (5. fázis) ── */
  {const p=await b.newPage({viewport:{width:390,height:844}});
   p.on('pageerror',e=>hiba.push(e.message));
   await p.goto('http://localhost:8961/index.html',{waitUntil:'domcontentloaded'});
   await p.evaluate(()=>{
     try{localStorage.clear();
       localStorage.setItem("30-0-unlock-v1",JSON.stringify(
         {v:1,d1:4,runs:2,bestRun:44,icons:13,nat:6,skills:41,maxSkills:6,
          panzer:false,gift:{},seen:{welcome:1,migrate:1},at:1}));
       localStorage.setItem("30-0-runboard-v1",JSON.stringify(
         [{run:44,team:"Első",seasons:6,level:92,mode:"pyr"},
          {run:22,team:"Második",seasons:4,level:84,mode:"pyr"}]));
     }catch(e){}});
   await p.goto('http://localhost:8961/index.html',{waitUntil:'networkidle'});
   await p.waitForTimeout(2400);
   out.panel=await p.evaluate(()=>{
     const G=unlockProgressGroups();
     const h=unlockProgressHtml();
     const d=document.createElement("div");d.innerHTML=h;
     const sorok=[...d.querySelectorAll(".upRow")];
     /* A PANEL ÉS A FELÜLET UGYANAZT MONDJA-E: minden sor a saját szabályát
        kérdezi vissza, tehát a kettőnek egyeznie KELL. */
     const egyezik=G.every(g=>g.sorok.every(r=>{
       if(/Kezdő nehézség/.test(r.n))return r.ok===unlockHas("diff");
       if(/^D5/.test(r.n))return r.ok===unlockHas("div5");
       if(/ritkábban/.test(r.n))return r.ok===unlockHas("icon2");
       if(/Nemzeti válogatottak/.test(r.n))return r.ok===unlockHas("wc");
       if(/Kegyetlen/.test(r.n))return r.ok===unlockSpeedOk("kegyet");
       if(/Csigatempó/.test(r.n))return r.ok===unlockTempoOk("csiga");
       if(/Tiki-Taka/.test(r.n))return r.ok===unlockStyleOk("tikitaka");
       return true;}));
     return {csoportok:G.length, sorok:sorok.length,
       kesz:sorok.filter(x=>x.classList.contains("ok")).length,
       fejlec:(d.querySelector(".upHead")||{}).textContent||"",
       egyezik,
       /* a zárt sorok MEGMONDJÁK, mi nyitja ki */
       mind_indokolt:sorok.filter(x=>!x.classList.contains("ok"))
         .every(x=>((x.querySelector(".upW")||{}).textContent||"").trim().length>3),
       lezart_jelzes:/3\. lezárt karriered/.test(h)};});
   /* és a Profil tényleg kirajzolja */
   out.panel.profilban=await p.evaluate(()=>{
     renderProfileModal();
     return document.getElementById("profileBody").innerHTML.indexOf("unlockProg")>=0;});
   await p.close();}

  /* ── 10. A JOGTISZTA FELIRAT ── */
  {const p=await lap(3);
   out.valogatott=await p.evaluate(()=>{
     const g=[...document.querySelectorAll("#wcToggleGrid button")];
     const on=g.find(x=>x.dataset.wc==="on");
     return {felirat:on.childNodes[0].textContent.trim(),
             alszoveg:on.querySelector("small").textContent,
             regi_maradt:/VB|EB-győztes/.test(on.textContent)};});
   await p.close();}

  await b.close();srv.kill();

  /* ═══════════ ÉRTÉKELÉS ═══════════ */
  const A=[];
  const ok=(n,f)=>A.push({n,ok:!!f});
  ok("üres napló: 0 D1, 1. lépcső", out.ures.d1===0&&out.ures.lepcso===1&&out.ures.lepcson===true);
  ok("üres napló: van preset, a dinamikus zárva", out.ures.preset_van&&out.ures.dyn_zarva&&out.ures.div4_zarva);
  ok("üdvözlő: az első koppintásra nyílik", out.udvozlo.rejtve_elotte&&out.udvozlo.megnyilt);
  ok("üdvözlő: a karrier csak UTÁNA indul", out.udvozlo.karrier_meg_nem_indult&&out.udvozlo.bezarult);
  ok("üdvözlő: a lépcsőn a hagyományos útra visz", out.udvozlo.ut.length===1&&out.udvozlo.ut[0]==="pyr");
  ok("üdvözlő: másodszor már nem jön elő", out.udvozlo.masodszor_nincs_ablak&&out.udvozlo.masodszor_ut[0]==="pyr");
  ok("kezdőlap: a lépcsőn nincs útválasztó", out.utvalaszto_0.szakasz_rejtve);
  ok("kezdőlap: a dinamikus mindkét belépőn zárva", out.utvalaszto_0.dyn_tiltva&&out.utvalaszto_0.modelap_dyn_tiltva);
  [1,2,3].forEach(n=>{
    const L=out.lepcsok[n],V=VART[n];
    ok(`${n}. lépcső: a lépcső száma`, L.lepcso===n);
    ok(`${n}. lépcső: hagyományos + draft`, L.pyr===true&&L.start==="draft");
    ok(`${n}. lépcső: nincs válogatott, nincs családtag`, L.wc===false&&L.family===false);
    ok(`${n}. lépcső: Rating a csúcson`, L.basis==="peak");
    ok(`${n}. lépcső: kezdő nehézség ${V.diff}`, L.diff===V.diff&&L.alap===V.diff&&L.csuszka_diff===V.diff);
    ok(`${n}. lépcső: ellenfél-fokozat ${V.speed}`, L.speed===V.speed);
    ok(`${n}. lépcső: a preset JÓVÁÍRJA, amit rád ad`,
       L.gift_speed===true&&L.gift_tempo===true);
    ok(`${n}. lépcső: alap tempó, megszokott ikonok, laza skillek`,
       L.tempo==="normal"&&L.icons==="teljes"&&L.skill==="loose");
    if(V.rerolls!=null)ok(`${n}. lépcső: ${V.rerolls} újrapörgetés`,
       L.rerolls===V.rerolls&&L.csuszka_reroll===V.rerolls);
    ok(`${n}. lépcső: a jelzés kiírja, hol tartunk`, L.jelzes&&/lépcső/.test(L.jelzes_szoveg));
    V.zart.forEach(sel=>{
      const k={"#diffSlider":"diff","#rerollSlider":"reroll","#guideGrid button":"guide",
               "#wcToggleGrid button":"wc","#pyrSpeedGrid button":"speed",
               "#iconGrid button":"icons","#ratingBasisGrid button":"basis",
               "#careerStartGrid button":"start"}[sel];
      ok(`${n}. lépcső: ${sel} ZÁRVA`, L.zar[k]===true);});
    V.nyitott.forEach(sel=>{
      const k={"#guideGrid button":"guide","#rerollSlider":"reroll"}[sel];
      ok(`${n}. lépcső: ${sel} NYITVA`, L.zar[k]===false);});
    ok(`${n}. lépcső: a felállás mindig a tiéd`, L.forma_nyitva===true);});
  ok("3 cím után: nincs preset, nincs jelzés", out.szabad.lepcson===false&&out.szabad.preset===null&&out.szabad.jelzes_rejtve);
  ok("3 cím után: a lépcső RÁCS-zárai eltűntek", out.szabad.barmi_zart.length===0);
  ok("3 cím után: a fokozat- és tempó-rács a RUN-kapuk alatt marad",
     out.szabad.run_kapuzott.length===2);
  ok("3 cím után: az ikon- és válogatott-rács a GYŰJTŐ kapuk alatt marad",
     out.szabad.gyujto_kapuzott.length===2);
  ok("3 cím után: az EGYES kapuk viszont még állnak (lutri, kész klub)",
     out.szabad.kapuzott.length===2);
  ok("3 cím után: nehézség/Rating/D4 nyitva, D5 és dinamikus még nem",
     out.szabad.nyitva.diff&&out.szabad.nyitva.basis&&out.szabad.nyitva.div4
     &&!out.szabad.nyitva.div5&&!out.szabad.nyitva.dyn);
  ok("3 cím után: az útválasztó előjön, a dinamikus felirata a feltételt mondja",
     out.utvalaszto_3.szakasz_latszik&&out.utvalaszto_3.dyn_tiltva
     &&/5\./.test(out.utvalaszto_3.dyn_felirat));
  ok("5 cím után: dinamikus, kész klub, D6 nyitva",
     out.ot_cim.dyn&&out.ot_cim.club&&out.ot_cim.div6
     &&!out.ot_cim.dyn_tiltva&&!out.ot_cim.modelap_tiltva);
  ok("győzelem: a napló 1..5-ig lépked", out.gyozelem.sor.map(x=>x.d1).join()==="1,2,3,4,5");
  ok("győzelem: mind az öt feloldás-ablak megnyílt", out.gyozelem.sor.every(x=>x.nyitva));
  ok("győzelem: az ablakok a helyes sorrendben jönnek",
     /2\. lépcső/.test(out.gyozelem.sor[0].cim)&&/3\. lépcső/.test(out.gyozelem.sor[1].cim)
     &&/Szabad kezet/.test(out.gyozelem.sor[2].cim)&&/D5/.test(out.gyozelem.sor[3].mit)
     &&/D6/.test(out.gyozelem.sor[4].mit));
  ok("győzelem: ugyanaz a feloldás nem jön elő kétszer", out.gyozelem.ismetles_nem_jott);
  ok("válogatott-kapcsoló: jogtiszta felirat, a VB/EB eltűnt",
     /Nemzeti válogatottak/.test(out.valogatott.felirat)&&out.valogatott.regi_maradt===false);
  ok("számláló: az ikon-igazolás gyűlik, a sima nem", out.szamlalok.icons===1&&out.szamlalok.icon2_zarva);
  ok("számláló: a nemzeti válogatott külön gyűlik",
     out.szamlalok.nat===1&&out.szamlalok.nat_nevsor>100);
  ok("számláló: 10 ikonnál nyílik az ikon-sűrűség 2. szintje",
     out.szamlalok.icons10===10&&out.szamlalok.icon2_nyilt);
  ok("számláló: a képességek gyűlnek, az egy emberen lévő csúcs is",
     out.szamlalok.skills===10&&out.szamlalok.maxSkills===10&&out.szamlalok.skillReal===true);
  ok("Run: a ranglistából SZÁRMAZIK, visszamenőleg is (3 futás, legjobb 71)",
     out.run_szarmaztatas.runs===3&&out.run_szarmaztatas.bestRun===71);
  ok("Run: a fokozatok a Run-szintet követik (71-es csúcs → a végtelen még zárva)",
     out.run_szarmaztatas.lassu&&out.run_szarmaztatas.tarto
     &&out.run_szarmaztatas.kegyet&&out.run_szarmaztatas.konyortelen
     &&!out.run_szarmaztatas.vegtelen);
  ok("Run: a játék-tempó lassításai a Run-szintet követik (71 → csiga igen, jégkorszak nem)",
     out.run_szarmaztatas.tempo_normal&&out.run_szarmaztatas.tempo_csiga
     &&!out.run_szarmaztatas.tempo_jegkorszak&&!out.run_szarmaztatas.tempo_kokorszak);
  ok("Run: a csapatstílusok a futásaidat követik (3 lezárt → a 4. fut → tiki-taka is)",
     out.run_szarmaztatas.stilus.beton&&out.run_szarmaztatas.stilus.villam
     &&out.run_szarmaztatas.stilus.tiki&&!out.run_szarmaztatas.stilus.panzer);
  /* --- 2. fázis: az egyes választások kapui --- */
  ok("kapu: 0 címnél a Rating-szezon és a lutri és a kész klub is zárt",
     out.kapuk[0].season.tiltva&&out.kapuk[0].wild.tiltva&&out.kapuk[0].club.tiltva
     &&out.kapuk[0].season.szurke&&/🔒/.test(out.kapuk[0].club.sz));
  ok("kapu: 3 címnél a Rating-szezon NYITVA, a lutri és a kész klub még nem",
     out.kapuk[3].season.tiltva===false&&out.kapuk[3].wild.tiltva===true
     &&out.kapuk[3].club.tiltva===true);
  ok("kapu: a kinyitott gomb VISSZAKAPJA az eredeti feliratát",
     !/🔒/.test(out.kapuk[3].season.sz)&&out.kapuk[3].season.szurke===false);
  ok("kapu: 4 címnél a lutri is nyitva, a kész klub még nem",
     out.kapuk[4].wild.tiltva===false&&out.kapuk[4].club.tiltva===true);
  ok("kapu: 5 címnél minden nyitva", out.kapuk[5].wild.tiltva===false
     &&out.kapuk[5].club.tiltva===false&&!/🔒/.test(out.kapuk[5].club.sz));
  ok("kapu: a mindig nyitott választásokat nem bántjuk",
     out.kapuk[0].peak.szurke===false&&out.kapuk[0].draft.szurke===false);
  ok("osztály: a mélység a címekkel nyílik (0→D3, 3→D4, 4→D5, 5→D6)",
     out.kapuk[0].divMax===3&&out.kapuk[3].divMax===4
     &&out.kapuk[4].divMax===5&&out.kapuk[5].divMax===6);
  ok("osztály: a zárt osztály megmondja, mi nyitja ki",
     out.kapuk[0].divWhy.d3===null&&/3 bajnoki/.test(out.kapuk[0].divWhy.d4)
     &&/5 bajnoki/.test(out.kapuk[0].divWhy.d6));
  ok("osztálylista: hat sor, a D5 és D6 szürke és tiltott",
     out.osztalylista.sorok.length===6
     &&out.osztalylista.sorok.slice(0,4).every(x=>!x.tiltva)
     &&out.osztalylista.sorok.slice(4).every(x=>x.tiltva&&x.szurke));
  ok("osztálylista: a zárt sorra rá van írva a feltétel",
     /🔒/.test(out.osztalylista.sorok[4].sz)&&/🔒/.test(out.osztalylista.sorok[5].sz));
  ok("osztálylista: az ajánlás sosem esik zárt osztályra",
     out.osztalylista.ajanlott<=out.osztalylista.divMax);
  /* --- 3. fázis: a Run-kapuk --- */
  {const K=out.run_kapu_0;
   ok("Run-kapu 0: az alapfokozat nyitva, a többi zárt",
      K.ok.lassu===true&&K.ok.tarto===false&&K.ok.alvo===false&&K.ok.kegyet===false);
   ok("Run-kapu 0: a fokozat-rács öt zárt gombja szürke, a feltétellel",
      K.fokozatok.filter(x=>x.tiltva).length===5
      &&K.fokozatok.filter(x=>x.tiltva).every(x=>x.szurke&&/🔒/.test(x.sz)));
   ok("Run-kapu 0: a feliratok magyarul toldalékolnak (40-es, 60-as, 75-ös)",
      K.fokozatok.some(x=>/40-es/.test(x.sz))&&K.fokozatok.some(x=>/60-as/.test(x.sz))
      &&K.fokozatok.some(x=>/75-ös/.test(x.sz)));
   ok("Run-kapu 0: a kijelölés a nyitott fokozatra esik vissza",
      K.valasztott==="lassu"&&K.fokozatok.filter(x=>x.sel).length===1);
   ok("Run-kapu 0: a tempó-rács három gyorsítója nyitva, öt lassítása zárt",
      K.tempok.filter(x=>!x.tiltva).map(x=>x.id).sort().join()==="gyors,normal,turbo");
   ok("Run-kapu 0: a stílusok közül három nyitva (beton, bombázók, harmónia)",
      K.stilus.beton&&K.stilus.bombazok&&K.stilus.harmonia
      &&!K.stilus.villam&&!K.stilus.sztar&&!K.stilus.tikitaka&&!K.stilus.panzer);
   ok("Run-kapu 0: minden zár MEGMONDJA, mi nyitja ki",
      /2\. karriered/.test(K.miert.villam)&&/negatív jellemvonás/.test(K.miert.panzer)
      &&/2\. lezárt karriered/.test(K.miert.tarto)&&/40/.test(K.miert.kegyet)
      &&/50/.test(K.miert.csiga));}
  {const K=out.run_kapu_62;
   ok("Run-kapu 62: a fokozatok a táblázat szerint (+3-ig, +4 még nem)",
      K.runs===3&&K.best===62&&K.speed.tarto&&K.speed.alvo&&K.speed.kegyet
      &&K.speed.konyortelen&&!K.speed.vegtelen);
   ok("Run-kapu 62: a tempó a táblázat szerint (−2-ig, −3 még nem)",
      K.tempo.normal&&K.tempo.komotos&&K.tempo.csiga
      &&!K.tempo.gleccser&&!K.tempo.jegkorszak&&!K.tempo.kokorszak);
   ok("Run-kapu 62: a 4. futásodban a tiki-taka is nyitva",
      K.stilus.villam&&K.stilus.sztar&&K.stilus.tikitaka);}
  {const J=out.jovairas;
   ok("jóváírás: amit HASZNÁLTÁL, az a Run-küszöb alatt is a tiéd marad",
      J.runs===1&&J.best===5&&J.kokorszak===true&&J.vegtelen===true&&J.tikitaka===true);
   ok("jóváírás: amit NEM használtál, az továbbra is zárva",
      J.jegkorszak===false&&J.konyortelen===false&&J.sztar===false);
   ok("jóváírás: a választó a jóváírt tempón marad, nem esik vissza",
      J.valasztott==="kokorszak");}
  {const P=out.panzer;
   ok("Panzer: a három negatív jellemvonás számolása",
      P.egy_ember===3&&P.tiszta===0&&P.kell===14);
   ok("Panzer: 12 vonás még kevés, 15 már elég",
      P.negy===12&&P.zarva_12&&P.ot===15&&P.nyilt&&P.naplo===15);
   ok("Panzer: a feloldás pillanatában ablak jön", P.ablak&&/Panzer/.test(P.ablak_cim));}
  {const L=out.stiluslista;
   ok("stíluslista: a 2. futásban négy stílus nyitva, három zárt (sztár, tiki, Panzer)",
      L.runs===1&&L.sorok.length===7&&L.sorok.filter(x=>x.zart).length===3);
   ok("stíluslista: a zárt sor gombja „Még zárva”, és RÁ VAN ÍRVA a feltétel",
      L.sorok.filter(x=>x.zart).every(x=>/Még zárva/.test(x.gomb)&&x.felirat));}
  /* --- 4. fázis: a gyűjtő kapuk --- */
  {const G=out.gyujto_0;
   ok("gyűjtő 0: a három ikon-fokozat és a válogatottak és a realisztikus skill zárt",
      G.ritka.tiltva&&G.nagyonritka.tiltva&&G.ki.tiltva&&G.wc.tiltva&&G.real.tiltva);
   ok("gyűjtő 0: a mindig nyitott választásokat nem bántjuk",
      G.teljes.tiltva===false&&G.laza.tiltva===false);
   ok("gyűjtő 0: a felirat a SAJÁT ÁLLÁSÁT mondja, nem csak a küszöböt",
      /0\/10/.test(G.ritka.sz)&&/még 10 hiányzik/.test(G.ritka.sz)
      &&/0\/20/.test(G.wc.sz));}
  {const G=out.gyujto_12;
   ok("gyűjtő 12 ikon: az első fokozat nyílik, a többi még nem",
      G.ritka.tiltva===false&&G.nagyonritka.tiltva===true&&G.ki.tiltva===true);
   ok("gyűjtő 12 ikon: a hátralévő szám pontos (még 8 a 20-ig)",
      /12\/20/.test(G.nagyonritka.sz)&&/még 8 hiányzik/.test(G.nagyonritka.sz));
   ok("gyűjtő 12 ikon: a kinyitott gomb VISSZAKAPJA az eredeti feliratát",
      !/🔒/.test(G.ritka.sz)&&/45%/.test(G.ritka.sz));}
  {const G=out.gyujto_teli;
   ok("gyűjtő teli: mind az öt gyűjtő kapu nyitva",
      !G.ritka.tiltva&&!G.nagyonritka.tiltva&&!G.ki.tiltva&&!G.wc.tiltva&&!G.real.tiltva);}
  {const G=out.gyujto_jovairas;
   ok("jóváírás: aki ma ritkább ikonokkal játszik, megtartja — a LÉTRA alsó foka is",
      G.ritka.tiltva===false&&G.nagyonritka.tiltva===false
      &&G.beallitas.ikon==="nagyonritka");
   ok("jóváírás: amit nem használt, az továbbra is zárva (ikonok: kikapcsolva)",
      G.ki.tiltva===true);
   ok("jóváírás: a bekapcsolt válogatottak megmaradnak",
      G.wc.tiltva===false&&G.beallitas.wcEnabled===true);}
  {const A=out.gyujto_ablak;
   ok("gyűjtő: a 10. ikon és a 20. válogatott a PILLANATBAN ablakot nyit",
      A.icon_nyit&&/Tíz legenda/.test(A.icon_cim)&&/Húsz válogatott/.test(A.wc_cim)
      &&A.szamlalok.icons===10&&A.szamlalok.nat===20);}
  /* --- 5. fázis: a haladás panel --- */
  {const P=out.panel;
   ok("panel: öt csoport, 22 sor, hat kész", P.csoportok===5&&P.sorok===22&&P.kesz===6);
   ok("panel: a fejléc a haladást mondja", /6\/22/.test(P.fejlec));
   ok("panel: minden sor UGYANAZT mondja, amit a felület kapui", P.egyezik===true);
   ok("panel: minden zárt sor megmondja, mi nyitja ki", P.mind_indokolt===true);
   ok("panel: kiírja, hogy a tempó-kapcsolók a 3. lezárt karriertől nyílnak",
      P.lezart_jelzes===true);
   ok("panel: a Profil tényleg kirajzolja", P.profilban===true);}
  ok("nincs futásidejű hiba", hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  console.log("\n=== 🪜 LÉPCSŐK — 1. FÁZIS ===");
  A.forEach(x=>console.log(`${x.ok?"✅":"❌"} ${x.n}`));
  if(hiba.length)console.log("\nHIBÁK:\n"+hiba.slice(0,10).join("\n"));
  const bukott=A.filter(x=>!x.ok).length;
  console.log(`\n${A.length-bukott}/${A.length} rendben`);
  process.exit(bukott?1:0);
})();
