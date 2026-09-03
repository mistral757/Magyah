/* P1b — PÁRHARC A TÁRS KORÁBBI KERETÉVEL.
   Amit mér:
     1. a kulcsok kronológiai rangja és felirata,
     2. a keretválasztás (kit fogad el, kit nem),
     3. a szezonhatár: a mérleg átmegy-e,
     4. a NÉGY FÉK külön-külön,
     5. a közös óra (openedAt, szerveridő) a helyi helyett,
     6. az atomi beírás (h2hClaim): felülírja-e a közben megjött keretet,
     7. a teljes folyamat a helyi backenden, két klienssel. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8941'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8941/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);

  const r=await p.evaluate(async()=>{
    const out={}, ME=mpMyId(), MATE="tarsazonosito";

    /* ── 1. KULCS-RANG ÉS FELIRAT ── */
    out.rang={
      s1r15:h2hKeyRank("s1r15"), s1r30:h2hKeyRank("s1r30"),
      s1kupa:h2hKeyRank("s1cupdko2l0"), s1kupa2:h2hKeyRank("s1cupdko2l1"),
      s2r15:h2hKeyRank("s2r15"), rossz:h2hKeyRank("izé")};
    out.rang_sorrend_jo =
      out.rang.s1r15 < out.rang.s1r30 &&
      out.rang.s1r30 < out.rang.s1kupa &&
      out.rang.s1kupa < out.rang.s1kupa2 &&
      out.rang.s1kupa2 < out.rang.s2r15;
    out.felirat={r:h2hKeyLabel("s2r30"),k:h2hKeyLabel("s1cupdko2l1")};

    /* ── 2. KERETVÁLASZTÁS ── */
    const ker=(by,n,at,extra)=>Object.assign(
      {by,at,players:Array.from({length:n},(_,i)=>({n:"J"+i,gw:1,aw:1,rw:1})),
       teamName:"T",standing:{pts:9}},extra||{});
    const szoba={players:{[ME]:{role:"host"},[MATE]:{role:"guest",online:false}},
      h2h:{
        "s1r15":{host:ker(ME,11,100),   guest:ker(MATE,11,101)},
        "s1r30":{host:ker(ME,11,200),   guest:ker(MATE,11,201)},
        "s2r15":{host:ker(ME,11,300)},                                  /* itt állunk */
        "s1cupdko2l0":{guest:ker(MATE,11,150)},
        "s1cupdko2l1":{guest:ker(MATE,11,160)},
        "s2r14sose":{guest:ker(MATE,11,999)},                           /* ismeretlen kulcs */
      }};
    const pick=h2hMateSnapPick(szoba,"s2r15",MATE);
    out.valasztas={kulcs:pick&&pick.key, rang:pick&&pick.rank};
    /* A LEGUTÓBBI az 1. szezon kupájának 2. meccse — a rossz alakú kulcsot
       eldobja, a sajátjaimat nem veszi el, és a jelen fordulót kihagyja. */
    out.valasztas_jo = pick && pick.key==="s1cupdko2l1";

    /* Nem fogadhat el: sajátot, üreset, korábbi helyettesítést. */
    const csak=(node)=>h2hMateSnapPick({h2h:{"s1r15":node}},"s9r9",MATE);
    out.elutasit={
      enyem:      !csak({host:ker(ME,11,1)}),
      ures:       !csak({guest:ker(MATE,0,1)}),
      helyettes:  !csak({guest:ker(MATE,11,1,{stale:true})}),
      by_nelkul:  !csak({guest:ker(undefined,11,1)})};

    /* ── 3. SZEZONHATÁR: A MÉRLEG ── */
    const azonos=h2hStaleSnap({snap:ker(MATE,11,1),key:"s2r15"},"s2r30",ME);
    const masik =h2hStaleSnap({snap:ker(MATE,11,1),key:"s1r30"},"s2r15",ME);
    out.merleg={azonos_szezon:!!azonos.standing, masik_szezon:!!masik.standing};
    out.by_marad = azonos.by===MATE && masik.by===MATE;   /* NEM lesz szerep-ütközés */
    out.jeloles  = masik.stale===true && masik.staleFrom==="s1r30" && masik.staleBy===ME;

    /* ── 4. A NÉGY FÉK ── */
    const sz=(tempo,online)=>Object.assign({},szoba,
      {tempo,players:{[ME]:{role:"host"},[MATE]:{role:"guest",online}}});
    const armelt=()=>!!(_mpSoloOut&&String(_mpSoloOut.gate||"").indexOf("duel:")===0);
    out.fek={};
    /* A keresés a HELYI backend h2hAll-ján megy, egyszer párharconként. */
    mpNet.mode="local"; MP.activeRoom="FEKPRB";
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({FEKPRB:{code:"FEKPRB",h2h:szoba.h2h}}));
    let hivas=0;
    const eredetiAll=mpBackendLocal.h2hAll.bind(mpBackendLocal);
    mpBackendLocal.h2hAll=async(c)=>{hivas++;return eredetiAll(c);};
    const varj=async()=>{for(let i=0;i<40&&!_h2hStale.kesz;i++)await new Promise(r=>setTimeout(r,25));};
    /* (a) Kényelmes mód → nem is fegyverkezik, és NEM is keres (nincs kérés) */
    _mpSoloOut=null;_h2hStale={key:null,pick:null,kesz:false,fut:false};
    _mpPresRoom=sz("nyugodt",false);
    h2hStaleArm("s2r15","host","guest",15,{});
    out.fek.kenyelmes_nem_arm=!armelt() && _h2hStaleWhy==="tempo" && hivas===0;
    /* (b) nincs korábbi keret → nem fegyverkezik, és MEGMONDJA, miért */
    _mpSoloOut=null;_h2hStale={key:null,pick:null,kesz:false,fut:false};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({FEKPRB:{code:"FEKPRB",h2h:{}}}));
    _mpPresRoom=sz("villam",false);
    h2hStaleArm("s2r15","host","guest",15,{});
    out.fek.keres_kozben=(_h2hStaleWhy==="keres"&&!armelt());   /* addig nem ígér semmit */
    await varj();
    h2hStaleArm("s2r15","host","guest",15,{});
    out.fek.nincs_keret=!armelt() && _h2hStaleWhy==="nincs";
    /* (c) van keret, Villám → fegyverkezik; és a keresés EGYSZER fut le */
    _mpSoloOut=null;_h2hStale={key:null,pick:null,kesz:false,fut:false};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({FEKPRB:{code:"FEKPRB",h2h:szoba.h2h}}));
    _mpPresRoom=sz("villam",false);
    hivas=0;
    for(let i=0;i<6;i++){h2hStaleArm("s2r15","host","guest",15,{openedAt:mpNow()-200000});
                         await new Promise(r=>setTimeout(r,20));}
    await varj();
    for(let i=0;i<6;i++)h2hStaleArm("s2r15","host","guest",15,{openedAt:mpNow()-200000});
    out.fek.arm=armelt();
    out.fek.cimke=_mpSoloOut&&_mpSoloOut.label;
    out.fek.kozos_ora=_mpSoloOut&&_mpSoloOut.shared!=null;
    out.fek.keres_egyszer=(hivas===1);   /* 12 kör, EGY lekérés */
    mpBackendLocal.h2hAll=eredetiAll;
    /* (d) a társ ONLINE → a határidő nem jár, tehát magától nem lép */
    let lefut=0; _mpSoloOut=null;_mpSoloFired=null;
    _mpPresRoom=sz("villam",true);
    mpSoloArm("teszt",()=>{lefut++;},"duel:x",true,mpNow()-900000);
    _mpSoloOut.at=Date.now()-900000;
    document.getElementById("h2hWaitOrphanBtn").classList.remove("hide");
    mpSoloOffer(false);mpSoloOffer(false);
    out.fek.tars_online_nem_lep=(lefut===0);
    /* (e) ugyanez OFFLINE társsal → egyszer lefut */
    _mpSoloOut=null;_mpSoloFired=null;_mpPresRoom=sz("villam",false);
    mpSoloArm("teszt",()=>{lefut++;},"duel:x",true,mpNow()-900000);
    _mpSoloOut.at=Date.now()-900000;
    mpSoloOffer(false);mpSoloOffer(false);mpSoloOffer(false);
    out.fek.offline_egyszer_lep=(lefut===1);
    /* (f) TEMPÓS módban SOHA nem lép magától — csak gombot ad */
    let lefut2=0;_mpSoloOut=null;_mpSoloFired=null;_mpPresRoom=sz("tempos",false);
    mpSoloArm("teszt",()=>{lefut2++;},"duel:y",true,mpNow()-900000);
    _mpSoloOut.at=Date.now()-900000;
    const ob=document.getElementById("h2hWaitOrphanBtn");
    ob.classList.add("hide");mpSoloOffer(false);
    out.fek.tempos_csak_gomb={lefutott:lefut2,gomb_latszik:!ob.classList.contains("hide")};

    /* ── 5. A KÖZÖS ÓRA ── */
    _mpPresRoom=sz("villam",false);
    const skewVolt=mpNet.skew;
    mpNet.skew=600000;                        /* a helyi óra 10 PERCET KÉSIK */
    const t=mpNow()-200000;                   /* szerveridőben 200 mp-e nyílt */
    out.ora={kozos:mpDeadlineLeft(t,true), helyi:mpDeadlineLeft(t,false)};
    /* Közösen: lejárt (0). Helyi órával: még 10 percnyi téves hátralék. */
    out.ora_jo = out.ora.kozos===0 && out.ora.helyi>500000;
    mpNet.skew=skewVolt;
    /* Az arm-idő nem indul újra, a közös óra viszont pontosítható */
    _mpSoloOut=null;
    mpSoloArm("a",()=>{},"duel:z",true,null);
    const at0=_mpSoloOut.at;
    await new Promise(r=>setTimeout(r,30));
    mpSoloArm("b",()=>{},"duel:z",true,12345);
    out.arm_stabil={at_valtozatlan:_mpSoloOut.at===at0, shared_frissult:_mpSoloOut.shared===12345,
                    cimke_valtozatlan:_mpSoloOut.label==="a"};

    /* ── 6. ATOMI BEÍRÁS ── */
    mpNet.mode="local";
    const KOD="PROBA1";
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({[KOD]:{code:KOD,h2h:{}}}));
    out.claim={};
    out.claim.ures=(await mpBackendLocal.h2hClaim(KOD,"k","guest",{v:1})).ok;
    out.claim.foglalt=(await mpBackendLocal.h2hClaim(KOD,"k","guest",{v:2})).ok;
    const n=await mpBackendLocal.h2hGet(KOD,"k");
    out.claim.megmaradt=n&&n.guest&&n.guest.v;   /* 1 = NEM írta felül */

    /* ── 7. A JELENLÉT-LEKÉRÉS MÉRETE ── */
    const nagyKer=(i)=>({by:"x",at:i,teamName:"Csapat"+i,ovr:80,dispOvr:80,shownOvr:80,
      defMult:1,famSp:1,tacticEffect:1,tacticStyle:"n",chemPairs:3,redP:0.02,
      card:{team:"Csapat"+i,rows:Array.from({length:11},(_,k)=>({n:"Játékos "+k,pos:"KKP",ovr:80}))},
      players:Array.from({length:18},(_,k)=>({n:"Játékos "+k,pos:"KKP",gw:1.2,aw:0.9,rw:1}))});
    const arch={};
    for(let s=1;s<=6;s++)for(const rd of [15,30])arch["s"+s+"r"+rd]={host:nagyKer(s*100+rd),guest:nagyKer(s*100+rd+1)};
    const teljesSzoba={code:"MERET",tempo:"villam",players:{a:{role:"host",online:true,seenAt:1}},h2h:arch};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({MERET:teljesSzoba}));
    out.meret={
      teljes_kB:Math.round(JSON.stringify(await mpBackendLocal.get("MERET")).length/1024),
      csak_jelenlet_B:JSON.stringify(await mpBackendLocal.presence("MERET")).length};
    return out;});

  /* ── 7. TELJES FOLYAMAT: két kliens, egyik hiányzik ── */
  const teljes=await p.evaluate(async()=>{
    const KOD="PROBA2", KEY="s1r30", MATE="tars";
    const ME=mpMyId();
    mpNet.mode="local";
    /* a szobában van egy KORÁBBI forduló, amit a társ töltött fel */
    const regi={by:MATE,at:100,teamName:"Társ FC",ovr:78,dispOvr:78,shownOvr:78,
      defMult:1,famSp:1,tacticEffect:1,tacticStyle:"n",chemPairs:0,redP:0.02,
      players:Array.from({length:11},(_,i)=>({n:"T"+i,pos:"KKP",gw:1,aw:1,rw:1}))};
    localStorage.setItem(MP_ROOMS_KEY,JSON.stringify({[KOD]:{code:KOD,tempo:"villam",
      players:{[ME]:{role:"host"},[MATE]:{role:"guest",online:false,seenAt:Date.now()-9e5}},
      h2h:{"s1r15":{guest:regi}, [KEY]:{openedAt:Date.now()-9e5}}}}));
    MP.activeRoom=KOD; MP.role="host";
    _mpPresRoom=await mpBackendLocal.get(KOD);
    /* a saját keretem már fent van */
    await mpBackendLocal.h2hPut(KOD,KEY,"host",{by:ME,at:Date.now(),teamName:"Enyém",
      ovr:80,dispOvr:80,shownOvr:80,defMult:1,famSp:1,tacticEffect:1,tacticStyle:"n",
      chemPairs:0,redP:0.02,players:Array.from({length:11},(_,i)=>({n:"E"+i,pos:"KKP",gw:1,aw:1,rw:1}))});
    /* a P1b lépése */
    const pick=h2hMateSnapPick(_mpPresRoom,KEY,MATE);
    const sub=h2hStaleSnap(pick,KEY,ME);
    const cl=await mpBackendLocal.h2hClaim(KOD,KEY,"guest",sub);
    const node=await mpBackendLocal.h2hGet(KOD,KEY);
    /* a KÖZÖS szimuláció mindkét oldalon ugyanabból a csomópontból */
    const mag=()=>rngFor("h2hduel:"+KOD+":30");
    const s1=h2hSimulate(node.host,node.guest,mag(),false);
    const s2=h2hSimulate(node.host,node.guest,mag(),false);
    return {claim:cl.ok, forras:node.guest.staleFrom, stale:node.guest.stale,
      by_a_tarse:node.guest.by===MATE,
      eredmeny:s1.hg+"-"+s1.ag,
      ket_kliens_azonos:JSON.stringify(s1)===JSON.stringify(s2),
      esemenyek:(s1.ev||s1.events||[]).length};});

  console.log("=== P1b ===");
  console.log(JSON.stringify(r,null,1));
  console.log("=== TELJES FOLYAMAT ===");
  console.log(JSON.stringify(teljes,null,1));
  console.log("hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
