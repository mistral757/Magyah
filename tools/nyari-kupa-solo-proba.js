/* 🟠 A NYÁRI TORNA KIÚTJA KÖZÖS KARRIERBEN (3.9.72)

   BEJELENTETT HIBA: „indítottam nyári kupát PvP-ben. Nem akartam megvárni a
   társamat, és mondta hogy mehetek a saját választásommal. Rányomtam, és a
   nyár végére ugrott, semmi kupa."

   A GOMB HAZUDOTT: a kapu vázának kiútja azt írta ki, hogy „a saját
   döntésemmel megyek tovább", a nyári torna viszont `solo:false` tartalékkal
   hívta — a kiút tehát MINDIG a NEM-et hajtotta végre.

   A PRÓBA ELŐSZÖR A RÉGI HIBÁT JÁTSSZA ÚJRA (igen + kiút → indul-e a torna),
   aztán a javítás két felét méri: hogy a kiút a saját döntést hajtja végre,
   és hogy a féloldalas torna NEM csúsztatja szét a szezonzárást — ez volt az
   egyetlen valódi ok, amiért eddig tilos volt.

   Használat: node tools/nyari-kupa-solo-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8955'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8955/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(async()=>{
    const o={};
    /* ---- A DÍSZLET: egy közös karrier, nyár, kupaindulás nélkül ---- */
    gameMode="career";phase="hub";
    S.seasonNumber=3;S.friendlyCupSeason=0;S.friendlySolo=0;
    S.finalTable=[{n:"x"}];S.euro=null;S.euroOptOut=false;
    S.mpCupSeason=0;S.mpDecision=null;S.mpDecisionCup=null;
    S.mpCup={season:3,comp:null};
    careerPool={"X":{n:"X"}};      /* a friendlyCupOfferable ezt is kéri */
    S.euroCurrent=null;S.euroCurrentQual=false;
    teamName="Próba FC";
    MP.role="host";MP.activeRoom="PROBA";
    window.h2hRoomActive=()=>true;
    window.teamOVRbase=()=>72;window.teamStrength=()=>75;
    window.saveGame=()=>{};
    const naplo=[];window.addLine=(t)=>naplo.push(String(t));
    /* a hálózat: egy memóriabeli szoba */
    const szoba={};
    let putDb=0;
    window.mpBk=()=>({
      h2hGet:async(room,key)=>szoba[key]||null,
      h2hPut:async(room,key,field,val)=>{putDb++;(szoba[key]=szoba[key]||{})[field]=val;return true;}});
    window.mpNetInit=async()=>{};
    window.h2hWaitShow=()=>{};window.h2hWaitHide=()=>{};
    window.mpBeaconPing=async()=>false;
    window.startEuroCampaign=()=>{o._kampany=(o._kampany||0)+1;};
    window.hubShowSeasonReport=()=>{o._jelentes=(o._jelentes||0)+1;};

    /* ---- 1. A KAPU FELTÉTELEI ---- */
    o.elofeltetel={joint:friendlyCupJoint(),offerable:friendlyCupOfferable()};

    /* ---- 2. IGEN + KIÚT: ELINDUL-E A TORNA? (ez volt a hiba) ---- */
    o._kampany=0;
    let tovabb=0;
    friendlyCupSettle(true,()=>{tovabb++;});
    await new Promise(r0=>setTimeout(r0,60));
    /* a kiút gombja fel van fegyverezve, és a felirata a SAJÁT döntést mondja */
    o.kiutIgen={felirat:(_mpSoloOut&&_mpSoloOut.label)||null,
      kapu:(_mpSoloOut&&_mpSoloOut.gate)||null};
    mpGateGiveUp("nyk");
    o.igenEredmeny={kampany:o._kampany,tovabb,
      friendlySolo:S.friendlySolo,
      euroCurrent:S.euroCurrent,
      /* a döntés le van könyvelve: idén nem kérdez újra */
      friendlyCupSeason:S.friendlyCupSeason,
      /* a szobában ott a SOLO jelölés, hogy a később érkező társ lássa */
      szobaSolo:!!(szoba["s3nyk"]&&szoba["s3nyk"].host&&szoba["s3nyk"].host.solo),
      naplo:naplo.filter(t=>/egyedül/i.test(t)).length};

    /* ---- 3. A FÉLOLDALAS TORNA NEM CSÚSZTATJA SZÉT A SZEZONZÁRÁST ---- */
    /* a kampány vége: a kupa utáni kapu itt dőlne el */
    S.euro=null;
    o.kapuElott={mpCupSeason:S.mpCupSeason,gateKind:mpGateKind(),
      key:mpDecisionKey()};
    let jelentes=0;
    mpShowCupGate(()=>{jelentes++;});
    o.kapuUtan={mpCupSeason:S.mpCupSeason,gateKind:mpGateKind(),
      key:mpDecisionKey(),jelentes,friendlySolo:S.friendlySolo};

    /* ---- 4. NEM + KIÚT: változatlanul kimaradás ---- */
    S.friendlyCupSeason=0;S.friendlySolo=0;S.euroCurrent=null;o._kampany=0;
    delete szoba["s3nyk"];
    let tovabb2=0;
    friendlyCupSettle(false,()=>{tovabb2++;});
    await new Promise(r0=>setTimeout(r0,60));
    o.kiutNem={felirat:(_mpSoloOut&&_mpSoloOut.label)||null};
    mpGateGiveUp("nyk");
    o.nemEredmeny={kampany:o._kampany,tovabb:tovabb2,
      friendlySolo:S.friendlySolo,friendlyCupSeason:S.friendlyCupSeason};

    /* ---- 5. A KÉSŐN ÉRKEZŐ TÁRS ---- */
    /* mine = a társ (most nevez), mate = én (már egyedül elindultam) */
    o.keson={
      soloJelolt:mpNykResolve({yes:true,offer:true},{yes:true,offer:true,solo:true}),
      mindketto:mpNykResolve({yes:true,offer:true},{yes:true,offer:true}),
      egyikNem:mpNykResolve({yes:true,offer:true},{yes:false,offer:true}),
      nemAjanlhato:mpNykResolve({yes:true,offer:true},{yes:true,offer:false})};

    /* ---- 6. A SOLO EREDMÉNYBŐL NEM KÖZÖS MEZŐNY LESZ ---- */
    S.friendlyCupSeason=0;S.friendlySolo=0;S.mpCup={season:3,comp:null};
    o._kampany=0;
    friendlyCupStart({solo:true});
    o.soloStart={kampany:o._kampany,friendlySolo:S.friendlySolo,
      mpCupComp:(S.mpCup&&S.mpCup.comp)||null,euroCurrent:S.euroCurrent};
    /* …a KÖZÖS eredményből viszont igen */
    S.friendlyCupSeason=0;S.friendlySolo=0;S.mpCup={season:3,comp:null};
    friendlyCupStart({yes:true,
      mine:{ovr:72,teamName:"Én"},
      mate:{ovr:70,teamName:"Társ",str:74,v:APP_VERSION}});
    o.jointStart={friendlySolo:S.friendlySolo,
      mpCupComp:(S.mpCup&&S.mpCup.comp)||null,
      mate:(S.mpCup&&S.mpCup.mateName)||null};

    /* ---- 7. EGYJÁTÉKOSBAN SEMMI NEM VÁLTOZOTT ---- */
    window.h2hRoomActive=()=>false;
    S.friendlyCupSeason=0;S.friendlySolo=0;S.euroCurrent=null;o._kampany=0;
    friendlyCupSettle(true,()=>{});
    o.egyjatekos={kampany:o._kampany,friendlySolo:S.friendlySolo,
      joint:friendlyCupJoint()};
    return o;});

  console.log("=== a díszlet ===");
  ok("közös karrier, nyár, kupaindulás nélkül — a kapu felajánlható",
     r.elofeltetel.joint===true&&r.elofeltetel.offerable===true,r.elofeltetel);

  console.log("\n=== IGEN + „nem várom meg” — ez volt a hiba ===");
  ok("a kiút felirata kimondja, MI történik: egyedül nevezek",
     /egyedül nevezek/i.test(r.kiutIgen.felirat||"")&&r.kiutIgen.kapu==="nyk",r.kiutIgen);
  ok("és a torna TÉNYLEG elindul (a hibás kódban itt 0 kampány volt)",
     r.igenEredmeny.kampany===1&&r.igenEredmeny.euroCurrent==="NYK",r.igenEredmeny);
  ok("a döntés le van könyvelve, és a napló kimondja, hogy egyedül",
     r.igenEredmeny.friendlyCupSeason===3&&r.igenEredmeny.naplo>=1,r.igenEredmeny);
  ok("a szoba megkapja a SOLO jelölést, mielőtt lezárnánk",
     r.igenEredmeny.szobaSolo===true,r.igenEredmeny);
  ok("…és nem lépünk tovább a szezonjelentésre (a torna következik)",
     r.igenEredmeny.tovabb===0,r.igenEredmeny);

  console.log("\n=== a szezonzárás nem csúszik szét ===");
  ok("a féloldalas torna NEM billenti át a kupa utáni kapu jelzőjét",
     r.kapuUtan.mpCupSeason===0&&r.kapuUtan.gateKind==="league",r.kapuUtan);
  ok("tehát a két kliens ugyanazon a döntési rekeszen marad",
     r.kapuElott.key===r.kapuUtan.key&&/decision$/.test(r.kapuUtan.key),
     {elott:r.kapuElott.key,utan:r.kapuUtan.key});
  ok("a kapu csendben továbbenged, és a jelzőt elhasználja",
     r.kapuUtan.jelentes===1&&r.kapuUtan.friendlySolo===0,r.kapuUtan);

  console.log("\n=== NEM + „nem várom meg” — változatlan ===");
  ok("a felirat itt a kimaradást mondja",/kihagyom a tornát/i.test(r.kiutNem.felirat||""),r.kiutNem);
  ok("és tényleg kimarad: nincs kampány, a nyár lezárul",
     r.nemEredmeny.kampany===0&&r.nemEredmeny.tovabb===1
     &&r.nemEredmeny.friendlyCupSeason===3&&r.nemEredmeny.friendlySolo===0,r.nemEredmeny);

  console.log("\n=== a későn érkező társ ===");
  ok("ha a másik már egyedül elindult, a későn érkező sem marad ki — ő is egyedül játszik",
     !!r.keson.soloJelolt&&r.keson.soloJelolt.solo===true,r.keson.soloJelolt);
  ok("két időben érkező igenből viszont KÖZÖS torna lesz, ahogy eddig",
     !!r.keson.mindketto&&r.keson.mindketto.yes===true&&!r.keson.mindketto.solo,r.keson.mindketto);
  ok("egy nem vagy egy „nálam nincs torna” továbbra is kizár",
     r.keson.egyikNem===null&&r.keson.nemAjanlhato===null,r.keson);

  console.log("\n=== a két indulás különbsége ===");
  ok("SOLO: saját mezőny — a közös kupa-rekeszbe nem kerül NYK",
     r.soloStart.kampany===1&&r.soloStart.friendlySolo===3
     &&r.soloStart.mpCupComp===null,r.soloStart);
  ok("KÖZÖS: a társ csapata bekerül a 32-es mezőnybe, és nincs solo-jelző",
     r.jointStart.mpCupComp==="NYK"&&!!r.jointStart.mate
     &&r.jointStart.friendlySolo===0,r.jointStart);

  console.log("\n=== egyjátékos ===");
  ok("egyjátékosban a nevezés azonnal indít, kapu és solo-jelző nélkül",
     r.egyjatekos.joint===false&&r.egyjatekos.kampany===1
     &&r.egyjatekos.friendlySolo===0,r.egyjatekos);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
