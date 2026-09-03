/* P1b — A TELJES KÖR ÉLESBEN.
   Nem részfüggvényeket hív, hanem a VALÓDI beváró hurkot (h2hTick) futtatja,
   a saját 2,5 másodperces ütemével. Amit mér:
     · megjelenik-e a felajánló gomb, és mit ír rajta,
     · Villám módban magától lefut-e a helyettesítés,
     · bekerül-e a társ korábbi kerete a szoba MOSTANI rekeszébe,
     · lefut-e utána a szimuláció, és kiíródik-e a `sim`,
     · eljut-e a folyamat a h2hStart-ig (a meccs indításáig),
     · és mit lát a VISSZATÉRŐ játékos a saját oldalán.
   A hálózat helyi backend, a Firebase-ág fölé kötve — a kód ugyanaz. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8942'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8942/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);

  const out=await p.evaluate(async()=>{
    const napló=[], KOD="ELESPRB", KEY="s1r30", ROUND=30, MATE="tarsika";
    const ME=mpMyId();
    const ker=(by,nev,at)=>({by,at,teamName:nev,ovr:80,dispOvr:80,shownOvr:80,
      defMult:1,famSp:1,tacticEffect:1,tacticStyle:"n",chemPairs:0,redP:0.02,
      card:{team:nev,rows:[]},
      players:Array.from({length:11},(_,i)=>({n:nev[0]+i,pos:"KKP",gw:1,aw:1,rw:1}))});

    /* ---- A SZOBA ---- */
    const szoba={code:KOD,tempo:"villam",
      players:{[ME]:{role:"host",online:true,seenAt:Date.now()},
               [MATE]:{role:"guest",online:false,seenAt:Date.now()-9e5}},
      h2h:{"s1r15":{host:ker(ME,"Enyém",100),guest:ker(MATE,"Társ FC",101)},
           [KEY]:{openedAt:Date.now()-9e5}}};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({[KOD]:szoba}));

    /* ---- A FIREBASE-ÁG A HELYIRE KÖTVE. A jelenlét csak "fb" módban fut,
           ezért a módot fb-nek mondjuk, a hívásokat viszont a helyi backend
           szolgálja ki: a MÉRT KÓD így betűre a valódi ág. ---- */
    mpNet.mode="fb"; mpNet.skew=0;
    ["h2hGet","h2hPut","h2hAll","h2hClaim","get","presence","setRole"].forEach(k=>{
      mpBackendFb[k]=(...a)=>mpBackendLocal[k]?mpBackendLocal[k](...a):Promise.resolve(null);});
    MP.activeRoom=KOD; MP.role="host";
    S.h2hPending={key:KEY,round:ROUND};

    /* ---- AMI A MECCSIG VEZET, ODÁIG NEM MEGYÜNK: a playMatch helyére
           naplózó csonk kerül, hogy lássuk, MIVEL indult volna el. ---- */
    const igaziPlay=window.playMatch;
    let indult=null;
    window.playMatch=()=>{indult={opp:h2hScript&&h2hScript.oppName,
      eredmeny:h2hScript&&h2hScript.sim?(h2hScript.sim.hg+"-"+h2hScript.sim.ag):null};};
    const igaziAdd=window.addLine; const sorok=[];
    window.addLine=(t,c)=>{sorok.push(String(t).replace(/<[^>]+>/g,""));};

    /* ---- A SAJÁT KERETEM MÁR FENT VAN ---- */
    await mpBackendLocal.h2hPut(KOD,KEY,"host",ker(ME,"Enyém",Date.now()));

    /* ---- INDUL A VALÓDI HUROK ---- */
    MP_TEMPO.villam.ms=1;            /* a 3 percet nem üljük végig */
    _h2hBusy=true; _mpSoloOut=null; _mpSoloFired=null;
    _h2hStale={key:null,pick:null,kesz:false,fut:false};
    _mpPresRoom=null; _mpPresAt=0;
    document.getElementById("h2hWait").classList.remove("hide");
    h2hTick(KEY,"host","guest",ROUND);

    const ob=document.getElementById("h2hWaitOrphanBtn");
    let gombSzoveg=null;
    for(let i=0;i<80;i++){
      mpWaitWatchdog();                                 /* ez tölti a jelenlétet */
      if(_mpSoloOut&&_mpSoloOut.at>Date.now()-30000)_mpSoloOut.at=Date.now()-30000;
      if(!gombSzoveg&&!ob.classList.contains("hide"))gombSzoveg=ob.textContent;
      if(indult)break;
      await new Promise(r=>setTimeout(r,250));}

    const node=await mpBackendLocal.h2hGet(KOD,KEY);
    const eredmeny={
      gomb:gombSzoveg,
      helyettesitve:!!(node&&node.guest&&node.guest.stale),
      forras:node&&node.guest&&node.guest.staleFrom,
      by_a_tarse:!!(node&&node.guest&&node.guest.by===MATE),
      csapatnev:node&&node.guest&&node.guest.teamName,
      sim_kiirva:!!(node&&node.sim),
      meccs_indult:indult,
      napló:sorok.slice(-3)};

    /* ---- A VISSZATÉRŐ OLDALA. Ugyanaz a csomópont, de ŐK a "guest": lássuk,
           kap-e magyarázatot arról, miért játszott a csapata nélküle. ---- */
    MP.role="guest"; sorok.length=0; indult=null;
    const eredetiId=mpMyId;
    window.mpMyId=()=>MATE;
    h2hStart(node,node.sim,ROUND);
    window.mpMyId=eredetiId;
    eredmeny.visszatero_naplo=sorok.slice(-2);
    eredmeny.visszatero_meccs=indult;

    /* ---- ÉS A MÁSIK MÓD: TEMPÓS. Ott a határidő CSAK FELAJÁNL — a gombnak
           meg kell jelennie, de magától SEMMI nem történhet. ---- */
    MP.role="host"; sorok.length=0; indult=null;
    const KEY2="s1cupdko2l0";
    await mpBackendLocal.h2hPut(KOD,KEY2,"host",ker(ME,"Enyém",Date.now()));
    await mpBackendLocal.h2hPut(KOD,KEY2,"openedAt",Date.now()-9e5);
    {const rr=mpLRooms();rr[KOD].tempo="tempos";mpLSave(rr);}
    MP_TEMPO.tempos.ms=1;
    _h2hBusy=true;_mpSoloOut=null;_mpSoloFired=null;
    _h2hStale={key:null,pick:null,kesz:false,fut:false};
    _mpPresRoom=null;_mpPresAt=0;
    S.h2hPending={key:KEY2,round:2};
    h2hTick(KEY2,"host","guest",2);
    let t_gomb=null;
    for(let i=0;i<40;i++){
      mpWaitWatchdog();
      if(_mpSoloOut&&_mpSoloOut.at>Date.now()-30000)_mpSoloOut.at=Date.now()-30000;
      if(!ob.classList.contains("hide"))t_gomb=ob.textContent;
      await new Promise(r=>setTimeout(r,250));}
    const n2=await mpBackendLocal.h2hGet(KOD,KEY2);
    eredmeny.tempos={gomb:t_gomb, magatol_lepett:!!(n2&&n2.guest), meccs:indult};
    /* És most MEGNYOMJUK a gombot: ugyanannak kell történnie, mint Villámban. */
    ob.click();
    for(let i=0;i<40&&!indult;i++){mpWaitWatchdog();await new Promise(r=>setTimeout(r,250));}
    const n3=await mpBackendLocal.h2hGet(KOD,KEY2);
    eredmeny.tempos.kattintas_utan={helyettesitve:!!(n3&&n3.guest&&n3.guest.stale),
      meccs:indult, napló:sorok.slice(-2)};
    _h2hBusy=false;
    /* ---- A VISSZATÉRŐ ÚTJA: kérünk-e tőle cseretervet egy ELDŐLT meccshez? ---- */
    let tervet_kert=0;
    const igaziTerv=window.openSubPlanner;
    window.openSubPlanner=(o)=>{tervet_kert++;};
    /* `gameMode` script-szintű `let`: NEM a window tulajdonsága — csupasz
       értékadással kell állítani, különben egy másik változót írnánk. */
    const allapot={mode:gameMode,pend:S.h2hPending,asked:S.subPlanAsked};
    gameMode="career"; S.h2hPending=null; S.subPlanAsked=null;
    const igaziKey=window.h2hKey;
    window.h2hKey=()=>KEY;                      /* ezen a kulcson KÉSZ `sim` van */
    await new Promise(r=>setTimeout(r,800));
    if(_h2hPoll){clearTimeout(_h2hPoll);_h2hPoll=null;}
    _h2hBusy=false;
    await h2hBeginDuel();
    eredmeny.visszatero_terv_kerdes={lefutott_meccsnel:tervet_kert};
    /* KONTROLL: eldöntetlen fordulónál a tervet TOVÁBBRA IS meg kell kérdezni.
       ELŐBB KIVÁRJUK az előző kör lecsengését: a h2hTick a hívás után még
       futhat, és a végén _h2hBusy=false-ra állít — ha ez a következő hívás
       AWAITJE ALATT érkezik meg, az őr jogosan szakítja félbe. Ez a kód helyes
       viselkedése; a próbának kell alkalmazkodnia hozzá. */
    await new Promise(r=>setTimeout(r,800));
    if(_h2hPoll){clearTimeout(_h2hPoll);_h2hPoll=null;}
    _h2hBusy=false; S.h2hPending=null; S.subPlanAsked=null; tervet_kert=0;
    window.h2hKey=()=>"s1r29";
    await h2hBeginDuel();
    window.h2hKey=igaziKey;
    eredmeny.visszatero_terv_kerdes.eldontetlennel=tervet_kert;
    eredmeny.visszatero_terv_kerdes.diag={
      gameMode, kulcs_ok:h2hKey!==igaziKey?"felulirva":"eredeti",
      pending:S.h2hPending&&S.h2hPending.key, asked:S.subPlanAsked,
      s1r29:JSON.stringify(await mpBackendLocal.h2hGet(KOD,"s1r29")||null).slice(0,60),
      terv_globalis:window.openSubPlanner!==igaziTerv};
    if(_h2hPoll){clearTimeout(_h2hPoll);_h2hPoll=null;}
    window.openSubPlanner=igaziTerv; gameMode=allapot.mode;
    S.h2hPending=allapot.pend; S.subPlanAsked=allapot.asked;
    _h2hBusy=false;
    window.playMatch=igaziPlay; window.addLine=igaziAdd;
    MP_TEMPO.villam.ms=180000; MP_TEMPO.tempos.ms=180000;
    return eredmeny;});

  console.log(JSON.stringify(out,null,1));
  console.log("hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
