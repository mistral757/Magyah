/* „BEFEJEZZÜK ITT" — MEGERŐSÍTÉS ÉS VISSZAVONÁS (3.9.35).

   Bejelentett hiba: „ha PvPben véletlenül rányomsz hogy befejezzük itt, akkor
   nincs visszaút. és nem kér megerősítést."

   Amit mér:
     1. a döntés-doboz MINDEN állapotában ott van-e a visszavonó gomb — külön
        kiemelve a `mine==="stop"` esetet, ami eddig kimaradt;
     2. a gomb a HELYES kaput viszi magával (a kupa utáni kapun a bajnoksági
        stop visszavonásakor a bajnoksági mezőt kell nullázni, nem a kupáét);
     3. a „Befejezzük itt" tényleg megerősítést kér, és a NEM-re nem történik
        semmi;
     4. a visszavonás után a döntés eltűnik nálunk ÉS a szobában is, a HUB-kapu
        pedig újra a kölcsönös igenre vár;
     5. és hogy egy MÁR ELROMLOTT mentésben (mine==="stop") a gomb magától
        megjelenik — ez a „a most meglévő karrierben is legyen beépítve" rész. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8972;
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

  const r=await p.evaluate(async()=>{
    const out={};
    gameMode="career";
    careerPool=careerPool||{};
    /* ---- ÉLŐ SZOBA, helyi backenddel ---- */
    MP.active=true;MP.activeRoom="PRB1";MP.role="host";
    S.mpOrphan=false;S.seasonNumber=3;
    mpNet.mode="local";
    const irt=[];
    const igaziPut=mpBackendLocal.h2hPut;
    mpBackendLocal.h2hPut=(room,key,field,val)=>{irt.push({key,field,val});return Promise.resolve(true);};

    const allapot=(mine,mate,cup)=>{
      S.mpDecision=mine===undefined&&mate===undefined?null
        :{season:3,mine:mine||null,mate:mate||null};
      S.mpDecisionCup=cup||null;};
    const doboz=()=>{
      const h=mpDecisionBox();
      const d=document.createElement("div");d.innerHTML=h;
      const u=d.querySelector("#mpDecUndo");
      return {van_visszavonas:!!u,
        felirat:u?u.textContent.trim():null,
        kapu:u?u.dataset.gate:null,
        van_befejez:!!d.querySelector("#mpDecStop"),
        van_folytat:!!d.querySelector("#mpDecContinue")};};

    /* ---- 1. A NÉGY ÁLLAPOT ---- */
    allapot(null,null);      out.meg_nem_dontottem=doboz();
    allapot("continue",null);out.folytatom_varok=doboz();
    allapot("stop",null);    out.befejeztem_varok=doboz();          /* EZ HIÁNYZOTT */
    allapot("stop","stop");  out.mindketten_befejeztuk=doboz();
    allapot("continue","stop");out.o_fejezte_be=doboz();
    allapot("continue","continue");out.mindketten_folytatjuk=doboz();

    /* ---- 2. A KUPA UTÁNI KAPU: a BAJNOKSÁGI stop visszavonása ---- */
    out.kupa_kapu=(function(){
      const igazi=window.mpHasCupGate;
      window.mpHasCupGate=()=>true;
      S.mpDecision={season:3,mine:"stop",mate:null};
      S.mpDecisionCup=null;
      const d=doboz();
      window.mpHasCupGate=igazi;
      return d;})();   /* várt: kapu === "league" */

    /* ---- 3. A MEGERŐSÍTÉS ---- */
    out.megerosites=await (async()=>{
      allapot(null,null);
      $("scVerdict").classList.remove("hide");
      $("mpVerdictBox")?($("mpVerdictBox").innerHTML=mpDecisionBox()):0;
      /* Ha nincs ilyen tároló, kézzel tesszük a lapra — a mérés a gombról szól. */
      let holder=$("mpVerdictBox");
      if(!holder){holder=document.createElement("div");holder.id="_prbHolder";
        holder.innerHTML=mpDecisionBox();document.body.appendChild(holder);}
      mpBindVerdict();
      const s=$("mpDecStop");
      if(!s)return "nincs Befejezzük gomb";
      s.click();
      await new Promise(r=>setTimeout(r,200));
      const modal=$("hubTacticConfirmModal");
      const nyitva=modal&&!modal.classList.contains("hide");
      const cim=$("hubTacticConfirmTitle")?$("hubTacticConfirmTitle").textContent:null;
      const dontes_a_kerdes_alatt=mpMyDecision();
      /* NEM-re nem történhet semmi. */
      const no=$("hubTacticConfirmNo");if(no)no.click();
      await new Promise(r=>setTimeout(r,200));
      return {kerdez:!!nyitva,cim,
        dontes_a_kerdes_alatt:dontes_a_kerdes_alatt||null,
        dontes_a_nem_utan:mpMyDecision()||null};})();

    /* ---- 4. A VISSZAVONÁS TÉNYLEGESEN TÖRÖL ---- */
    out.visszavonas=await (async()=>{
      allapot("stop",null);
      irt.length=0;
      let holder=$("_prbHolder");
      if(!holder){holder=document.createElement("div");holder.id="_prbHolder";document.body.appendChild(holder);}
      holder.innerHTML=mpDecisionBox();
      mpBindVerdict();
      const u=$("mpDecUndo");
      if(!u)return "nincs visszavonó gomb";
      u.click();
      await new Promise(r=>setTimeout(r,400));
      return {dontes_utana:mpMyDecision()||null,
        halozatra_irt:irt.map(x=>`${x.key}/${x.field}=${String(x.val)}`)};})();

    mpBackendLocal.h2hPut=igaziPut;
    return out;});

  console.log(JSON.stringify(r,null,1));
  console.log("PAGE ERRORS:",errs.length?errs.slice(0,5):"nincs");
  await b.close(); srv.close();
})();
