/* KÖZÖS KARRIER: A HÁZIGAZDA DÖNT, A VENDÉG NÉZ (3.9.40).

   Amit mér:
     1. A KEZDŐ CSAPATERŐ csúszkája DRAFTNÁL eltűnik (nincs klublista, amit
        szűrne), kész klubbal viszont ott van. A maradék két döntés ilyenkor
        átveszi a ① és ② sorszámot.
     2. A MÉRCE draftnál nem a sáv közepe, hanem a draftból VÁRHATÓ keret-erő
        (osztály nyers közepe + PYR_DRAFT_PREMIUM) — ugyanaz a szám, amivel a
        pyrStart MP-ága a világot építi. Ez determinisztikus, tehát a két
        kliens ugyanazt kapja.
     3. A VENDÉG ZÁRA teljes: minden közös-karrier vezérlő tiltva van, az
        ikon-sűrűséggel együtt. A régi lista a 3.5.19-ben megszűnt
        #pyrBandMin/#pyrBandMax-ot nevezte meg, a valódi #pyrBandMid pedig
        nyitva maradt.
     4. AZ IKON-SŰRŰSÉG világ-tulajdonság: utazik a szoba-csomagban, és futó
        közös karrierben a házigazda értéke szól (iconRateNow).
     5. KÖZÖS KARRIER + DRAFT: a draft után NINCS osztályválasztó — az
        osztályt a szoba mondta meg.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8973;
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
  const p=await b.newPage({viewport:{width:430,height:1100},deviceScaleFactor:2});
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1400);

  const r=await p.evaluate(()=>{
    const out={};
    const vis=id=>{const e=document.getElementById(id);return !!e&&!e.classList.contains("hide");};
    gameMode="career";pyrWanted=true;
    MP.active=true;MP.role="host";
    pyrWantedDiv=5;pyrWantedBand=[79,81];pyrWantedGap=0;

    /* --- 1. A SÁV LÁTHATÓSÁGA --- */
    careerStart="club";updatePyrSetupVisibility();
    out.klub={sav:vis("pyrBandWrap"),
      divNo:($("pyrMpNoDiv")||{}).textContent,gapNo:($("pyrMpNoGap")||{}).textContent};
    careerStart="draft";updatePyrSetupVisibility();
    out.draft={sav:vis("pyrBandWrap"),
      divNo:($("pyrMpNoDiv")||{}).textContent,gapNo:($("pyrMpNoGap")||{}).textContent};
    out.sav_draftnal_eltunt=(out.klub.sav===true&&out.draft.sav===false);
    out.sorszam_atveve=(out.klub.divNo==="②"&&out.klub.gapNo==="③"
      &&out.draft.divNo==="①"&&out.draft.gapNo==="②");
    /* a setCareerStart magától újrarajzol */
    careerStart="club";updatePyrSetupVisibility();
    setCareerStart("draft");
    out.setCareerStart_rajzol=(vis("pyrBandWrap")===false);

    /* --- 2. A MÉRCE --- */
    careerStart="club";
    const klubMerce=pyrMpBandMid();
    careerStart="draft";
    const draftMerce=pyrMpBandMid();
    const w=pyrBuildWorld(rngFor("pyr:world"),0);
    const nyers=pyrDivRawMeanFor(null,pyrWantedDiv,w,2);
    out.merce={klub:klubMerce,draft:draftMerce,nyers:Math.round(nyers*10)/10,
      premium:PYR_DRAFT_PREMIUM};
    out.merce_klub_a_sav=(klubMerce===80);
    out.merce_draft_szamitott=(Math.abs(draftMerce-(nyers+PYR_DRAFT_PREMIUM))<0.06);
    /* determinisztikus: kétszer ugyanaz */
    out.merce_determinisztikus=(pyrMpBandMid()===draftMerce);

    /* --- 3. A VENDÉG ZÁRA --- */
    const kell=["pyrBandMid","pyrMpDiv","pyrMpGap","pyrMpGapMinus","pyrMpGapPlus",
      "pyrMpGapZero","pyrMpDetailBtn","diffSlider","rerollSlider"];
    const kellGrid=["pyrSpeedGrid","pyrModeGrid","tempoGrid","iconGrid","schedGrid",
      "careerStartGrid","wcToggleGrid","skillModeGrid","ratingBasisGrid"];
    /* elavult elemeket NE nevezzen meg a lista */
    out.nincs_elavult=!/pyrBandMin|pyrBandMax/.test(MP_GUEST_LOCK_SEL);
    mpGuestReviewLock(true);
    const nyitva=[];
    kell.forEach(id=>{const e=document.getElementById(id);if(e&&!e.disabled)nyitva.push(id);});
    kellGrid.forEach(id=>{
      document.querySelectorAll(`#${id} button`).forEach(x=>{if(!x.disabled)nyitva.push(id);});});
    out.nyitva=[...new Set(nyitva)];
    out.zar_teljes=(out.nyitva.length===0);
    mpGuestReviewLock(false);
    out.feloldas=(()=>{const e=document.getElementById("pyrBandMid");return !!e&&e.disabled===false;})();

    /* --- 4. AZ IKON-SŰRŰSÉG --- */
    setIconRate("nagyonritka");
    const csomag=mpCollectSettings();
    out.icons_a_csomagban=(csomag.icons==="nagyonritka");
    /* a vendég oldala: a saját preferencia MARAD, de a világé a házigazdáé */
    setIconRate("teljes");
    mpApplySettings(Object.assign({},csomag,{pyr:{on:false}}));
    lockMpWorldSettings();
    out.icon={sajat:iconRatePref(),vilag:iconRateNow(),szorzo:iconRateMult()};
    out.icon_a_hoste=(out.icon.vilag==="nagyonritka"&&out.icon.sajat==="teljes"
      &&Math.abs(out.icon.szorzo-ICON_RATE.nagyonritka.k)<1e-9);
    /* régi szoba (nincs `icons` mező) → a saját marad */
    const regi=Object.assign({},csomag);delete regi.icons;
    mpApplySettings(Object.assign({},regi,{pyr:{on:false}}));
    lockMpWorldSettings();
    out.icon_regi_szoba=(iconRateNow()==="teljes");
    MP.active=false;lockMpWorldSettings();
    out.icon_sp=(iconRateNow()==="teljes"&&mpWorldIcons===null);

    /* --- 4/b. AZ ÁTNÉZŐ SZINKRONJA TÉNYLEG LEFUT ÉS AZ ÉLŐ ELEMEKRE ÍR --- */
    MP.active=true;MP.role="guest";
    /* KÉSZ KLUBOS szoba: ott van csapaterő-csúszka, amit szinkronizálni kell.
       (Draftnál a blokk rejtve van, és a mérce sem innen jön — lásd fent.) */
    careerStart="club";
    pyrWanted=true;pyrWantedDiv=3;pyrWantedBand=[85,87];pyrWantedGap=-1.5;
    out.sync_hiba=null;
    try{mpGuestReviewSync(Object.assign({},csomag,{icons:"ritka"}));}
    catch(e){out.sync_hiba=String(e);}
    out.sync={band:($("pyrBandMid")||{}).value,div:($("pyrMpDiv")||{}).value,
      gap:($("pyrMpGap")||{}).value,
      ikon:[...document.querySelectorAll("#iconGrid button")]
        .filter(x=>x.classList.contains("sel")).map(x=>x.dataset.icon)[0]};
    out.sync_ok=(out.sync_hiba===null&&out.sync.band==="86"
      &&out.sync.div==="3"&&out.sync.gap==="-1.5"&&out.sync.ikon==="ritka");
    MP.active=false;

    /* --- 5. KÖZÖS + DRAFT: nincs osztályválasztó --- */
    out.draft_ag_mp=/pyrMpSetup\(\)&&pyrPending&&pyrPendingDiv/.test(pyrOpenDivPickFromDraft.toString());
    out.draft_ag_confirm=/pyrConfirmDiv\(\)/.test(pyrOpenDivPickFromDraft.toString());
    return out;});

  const T=[
    ["a kezdő csapaterő DRAFTNÁL eltűnik, kész klubbal marad",r.sav_draftnal_eltunt===true],
    ["a sorszámok átveszik a helyet (①② draftnál, ①②③ klubbal)",r.sorszam_atveve===true],
    ["a kezdés-váltás azonnal újrarajzol",r.setCareerStart_rajzol===true],
    ["kész klubbal a mérce a sáv közepe",r.merce_klub_a_sav===true],
    ["draftnál a mérce = osztály nyers közepe + draft-prémium",r.merce_draft_szamitott===true],
    ["…és determinisztikus (a két kliens ugyanazt kapja)",r.merce_determinisztikus===true],
    ["a zárlista nem nevez meg megszűnt elemeket",r.nincs_elavult===true],
    ["a vendég zára TELJES — semmi nem marad nyitva",r.zar_teljes===true],
    ["a zár feloldható (a házigazda képernyője él)",r.feloldas===true],
    ["az ikon-sűrűség utazik a szoba-csomagban",r.icons_a_csomagban===true],
    ["futó közös karrierben a házigazda ikon-értéke szól",r.icon_a_hoste===true],
    ["régi szobában (nincs mező) a saját érték marad",r.icon_regi_szoba===true],
    ["egyjátékosban nincs zár, a saját érték szól",r.icon_sp===true],
    ["közös karrier + draft: az osztály a szobából jön",r.draft_ag_mp===true&&r.draft_ag_confirm===true],
    ["az átnéző a HÁZIGAZDA értékeit írja az ÉLŐ vezérlőkre",r.sync_ok===true],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  kész klub:",JSON.stringify(r.klub),"· draft:",JSON.stringify(r.draft));
  console.log("  a mérce:  ",JSON.stringify(r.merce));
  console.log("  ikon:     ",JSON.stringify(r.icon));
  console.log("  átnéző:   ",JSON.stringify(r.sync),r.sync_hiba?("HIBA: "+r.sync_hiba):"");
  if(r.nyitva&&r.nyitva.length)console.log("  NYITVA MARADT:",JSON.stringify(r.nyitva));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
