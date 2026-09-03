/* A RENDSZER AJÁNLATA — 3.9.31.
   Két bejelentett hibát mér:
     (1) „nincs visszaút a kezdőrúgásra kattintás után, ha bedobja, hogy sérülés
         vagy eltiltás miatt cserélni kell" — van-e visszalépés és HUB-gomb, és
         a HUB-gomb ott van-e a kezdőrúgás ALATT;
     (2) „az auto matchplay módban ha a játékostól nem érkezik prompt akkor
         5mp-en belül válassza azt, akit automatikusan ajánl a rendszer" — a
         döntés-panelek megjelölik-e az ajánlatukat, és az immPending
         visszaadja-e.
   Ráadásként megméri azt a néma hibát is, ami mindkettőt lehetővé tette: a
   lánc a hiányzók paneljét `absencePanel` néven kereste, ilyen elem viszont
   nincs a dokumentumban. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8983;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    const azon=el=>el?(el.id||el.tagName.toLowerCase()):null;

    /* ---- 1. A HIÁNYZÓK PANEL AZONOSÍTÓJA ---- */
    out.panel_azonosito={
      absencePanel_letezik:!!document.getElementById("absencePanel"),   /* várt: false */
      absPanel_letezik:!!document.getElementById("absPanel")};          /* várt: true  */

    /* ---- 2. VISSZAÚT ÉS HUB-GOMB A PANELEN ---- */
    const g=id=>document.getElementById(id);
    out.visszaut={
      go:!!g("absGoBtn"), hub:!!g("absHubBtn"), vissza:!!g("absBackBtn"),
      go_ajanlat:g("absGoBtn")?g("absGoBtn").dataset.immAjanl==="1":null,
      hub_kiut:g("absHubBtn")?g("absHubBtn").dataset.imm:null,
      vissza_kiut:g("absBackBtn")?g("absBackBtn").dataset.imm:null};

    /* ---- 3. A HUB-GOMB A KEZDŐRÚGÁS ALATT ---- */
    const kick=g("kickBtn");
    out.hub_a_kezdorugas_alatt=kick?azon(kick.nextElementSibling):null;   /* várt: matchHubBtn */

    /* ---- 4. immAjanlIn: A REJTETT/TILTOTT AJÁNLAT NEM AJÁNLAT ---- */
    try{
      const d=document.createElement("div");d.id="_probaDoboz";
      const bt=document.createElement("button");
      bt.dataset.immAjanl="1";bt.dataset.immMit="próba";bt.textContent="x";
      d.appendChild(bt);document.body.appendChild(d);
      out.ajanlIn={lathato:!!immAjanlIn("_probaDoboz")};
      bt.disabled=true; out.ajanlIn.tiltva=!!immAjanlIn("_probaDoboz");
      bt.disabled=false; bt.classList.add("hide");
      out.ajanlIn.rejtve=!!immAjanlIn("_probaDoboz");
      bt.classList.remove("hide");
      out.ajanlIn.mit=(immAjanlIn("_probaDoboz")||{}).mit;
      d.remove();
    }catch(e){out.ajanlIn="HIBA: "+e.message;}

    /* ---- 5. PÁRKÉMIA-VÁLASZTÓ: VAN-E AJÁNLOTT PÁROS, ÉS EGY KOPPINTÁS-E ---- */
    try{
      const A="Diego Maradona",B="Lionel Messi",C="Wayne Rooney";
      const keret=[{n:A,pos:["CS"],age:27},{n:B,pos:["TM"],age:26},{n:C,pos:["CS"],age:28}];
      window.currentRoster=()=>keret;
      window.careerPool=Object.fromEntries(keret.map(x=>[x.n,{age:x.age}]));
      /* A rangsor a PÁLYÁN állókból dolgozik — állítsunk össze egy hármast. */
      slots.length=0;
      keret.forEach((x,i)=>slots.push({pos:i===0?"CS":i===1?"TM":"BM",player:x}));
      S.chemPairs={};S.chemInProgress=null;
      let folytatodott=false;
      showChemBuild(()=>{folytatodott=true;});
      const q=immPending();
      const aj=$("skillAssignList").querySelector("[data-imm-ajanl]");
      out.parkemia={
        dont:q&&q.dont, van_ajanlat:!!(q&&q.ajanl), mit:q&&q.ajanl&&q.ajanl.mit,
        sor_szovege:aj?aj.innerText.replace(/\n+/g," / ").slice(0,110):null};
      /* Egyetlen koppintás: köt, bezár, folytat — megerősítő ablak NÉLKÜL. */
      if(q&&q.ajanl)q.ajanl.tedd();
      out.parkemia.kattintas_utan={
        parok:Object.values(S.chemPairs||{}).map(x=>`${x.a}+${x.b}=${x.stages}`),
        panel_rejtve:$("scSkill").classList.contains("hide"),
        megerosito_nyilt:!$("hubTacticConfirmModal").classList.contains("hide"),
        folytatodott};
    }catch(e){out.parkemia="HIBA: "+e.message;}

    /* ---- 6. PASSZKÉMIA-VÁLASZTÓ ---- */
    try{
      S.passChem={};S.passChemInProgress=null;
      let folytatodott=false;
      showPassChemBuild(()=>{folytatodott=true;});
      const q=immPending();
      out.passzkemia={dont:q&&q.dont,van_ajanlat:!!(q&&q.ajanl),mit:q&&q.ajanl&&q.ajanl.mit};
      if(q&&q.ajanl)q.ajanl.tedd();
      out.passzkemia.kattintas_utan={
        parok:Object.values(passChemStore()||{}).map(x=>`${x.a}+${x.b}=${x.stages}`),
        panel_rejtve:$("scSkill").classList.contains("hide"),folytatodott};
    }catch(e){out.passzkemia="HIBA: "+e.message;}

    /* ---- 7. KÉPESSÉG-KIOSZTÁS: A LISTA SOROKBÓL ÁLL, NEM GOMBOKBÓL ----
       Pont ezen bukott el eddig a lánc: nulla gombot látott, és „átmeneti
       állapotnak" hitte a döntést. */
    try{
      /* Olyan képesség kell, amire a próbakeretből TÉNYLEG van jelölt —
         különben a panel a „nincs megfelelő posztú játékosod" ágra fut, és nem
         azt mérnénk, amit akarunk. */
      S.skills={};
      let skill=null;
      for(let i=0;i<400&&!skill;i++){
        const s=drawSkillFromPool();
        if(s&&eligibleForSkill(s).length>=2)skill=s;}
      if(!skill)throw new Error("nem találtam a próbakerethez illő képességet");
      renderSkillAssign(skill,3,1);
      $("scSkill").classList.remove("hide");
      $("skillAssignWrap").classList.remove("hide");
      const q=immPending();
      const aj=$("skillAssignList").querySelector("[data-imm-ajanl]");
      out.kepesseg={
        skill:skill&&skill.name, gombok_szama:immBtns("skillAssignList").length,
        sorok_szama:$("skillAssignList").querySelectorAll(".prow").length,
        dont:q&&q.dont, var_e:!!(q&&q.var), van_ajanlat:!!(q&&q.ajanl),
        mit:q&&q.ajanl&&q.ajanl.mit,
        ajanlott_sor:aj?aj.innerText.replace(/\n+/g," / ").slice(0,90):null,
        /* Ugyanaz-e, mint amit az auto-kiosztás rangsora hoz ki? */
        rangsor_elso:(skillAssignRanked(skill)[0]||{}).p&&skillAssignRanked(skill)[0].p.n};
      $("scSkill").classList.add("hide");
    }catch(e){out.kepesseg="HIBA: "+e.message;}

    /* ---- 8. A HIÁNYZÓK PANELJE MINT DÖNTÉS ---- */
    try{
      $("absPanel").classList.remove("hide");
      const q=immPending();
      out.hianyzok={dont:q&&q.dont,van_ajanlat:!!(q&&q.ajanl),mit:q&&q.ajanl&&q.ajanl.mit};
      $("absPanel").classList.add("hide");
    }catch(e){out.hianyzok="HIBA: "+e.message;}

    /* ---- 9. AZ ÖT MÁSODPERC ---- */
    out.masodperc=(typeof IMM_AJANL_SEC!=="undefined")?IMM_AJANL_SEC:null;
    return out;});

  /* ---- 10. A VISSZASZÁMLÁLÁS ÉLESBEN ----
     Nem elég, hogy az immPending visszaadja az ajánlatot: a huroknak fel is
     kell fegyverkeznie rá, ki kell írnia a pirulára, és öt másodperc múlva meg
     kell nyomnia. A hiányzók panelján mérjük, mert az volt a bejelentett
     akadás. (A `classic` mód is elég: az immOn mindkettőt elfogadja.) */
  const idozites=await p.evaluate(async()=>{
    const ki={};
    S.immersion=1;
    let elindult=false;
    _absDone=()=>{elindult=true;};
    $("absPanel").classList.remove("hide");
    immStep();
    await new Promise(r=>setTimeout(r,300));
    ki.pirula_latszik=!$("immPill").classList.contains("hide");
    ki.pirula_szoveg=$("immPillTx").innerText.replace(/\n+/g," / ");
    ki.szamlalo=$("immPillN").textContent;
    ki.forduló_indult_3_masodpercnel=false;
    await new Promise(r=>setTimeout(r,2700));
    ki.forduló_indult_3_masodpercnel=elindult;   /* várt: false — még nem járt le */
    await new Promise(r=>setTimeout(r,3200));
    ki.forduló_indult_6_masodpercnel=elindult;   /* várt: true  */
    ki.panel_rejtve=$("absPanel").classList.contains("hide");
    S.immersion=0;immCancel();
    return ki;});

  console.log(JSON.stringify(r,null,1));
  console.log("IDŐZÍTÉS:",JSON.stringify(idozites,null,1));
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
