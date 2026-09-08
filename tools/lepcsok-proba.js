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
  const srv=spawn('python3',['-m','http.server','8977'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],out={};

  /* Egy friss lap, megadott számú D1-győzelemmel a naplóban. A napló
     localStorage-ban él, ezért a beállítás UTÁN újra kell tölteni. */
  async function lap(d1){
    const p=await b.newPage({viewport:{width:390,height:844}});
    p.on('pageerror',e=>hiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
    await p.goto('http://localhost:8977/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(n=>{
      try{localStorage.clear();}catch(e){}
      if(n>0)try{localStorage.setItem("30-0-unlock-v1",
        JSON.stringify({v:1,d1:n,runs:0,bestRun:0,icons:0,nat:0,skills:0,
          maxSkills:0,panzer:false,seen:{welcome:1},at:Date.now()}));}catch(e){}
    },d1);
    await p.goto('http://localhost:8977/index.html',{waitUntil:'networkidle'});
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
       barmi_zart:["#diffSlider","#rerollSlider","#guideGrid button","#wcToggleGrid button",
                   "#pyrSpeedGrid button","#iconGrid button","#ratingBasisGrid button",
                   "#careerStartGrid button"].filter(zart),
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
  ok("3 cím után: EGYETLEN vezérlő sem zárt", out.szabad.barmi_zart.length===0);
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
  ok("Run: a játék-tempó lassításai a Run-szintet követik (80 kell a kőkorszakhoz)",
     out.run_szarmaztatas.tempo_normal&&out.run_szarmaztatas.tempo_csiga
     &&out.run_szarmaztatas.tempo_jegkorszak&&!out.run_szarmaztatas.tempo_kokorszak);
  ok("Run: a csapatstílusok a Run-győzelmeket követik",
     out.run_szarmaztatas.stilus.beton&&out.run_szarmaztatas.stilus.villam
     &&!out.run_szarmaztatas.stilus.tiki&&!out.run_szarmaztatas.stilus.panzer);
  ok("nincs futásidejű hiba", hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  console.log("\n=== 🪜 LÉPCSŐK — 1. FÁZIS ===");
  A.forEach(x=>console.log(`${x.ok?"✅":"❌"} ${x.n}`));
  if(hiba.length)console.log("\nHIBÁK:\n"+hiba.slice(0,10).join("\n"));
  const bukott=A.filter(x=>!x.ok).length;
  console.log(`\n${A.length-bukott}/${A.length} rendben`);
  process.exit(bukott?1:0);
})();
