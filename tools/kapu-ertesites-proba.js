/* 🔔 A SZEZONZÁRÓ KAPU ÉRTESÍTÉSE — „szólok neki, hogy rá várok" (3.9.62)

   BEJELENTETT HIÁNY: „ezen a képernyőn nincsen lehetőség arra hogy értesítsük
   az ellenfelünket arról hogy várakozunk."

   MIÉRT KÜLÖN PRÓBA. A bökés MEGVOLT a játékban — csak a beváró réteghez volt
   szegezve KÉT független ponton: a gombja abban a rétegben ül, a jelenlét-kör
   pedig kizárólag addig futott, amíg az a réteg nyitva volt. A szezonzáró kapu
   viszont képernyő, nem réteg: ott a `_mpPresRoom` ki volt nullázva, tehát még
   a bökés függvényének sem lett volna honnan kiolvasnia a társ feliratkozását.
   Egy odatett gomb ezért ÖNMAGÁBAN nem oldotta volna meg a hibát — a próba
   magja épp ez: a JELENLÉT-KÖR életben marad-e a kapun.

   Használat: node tools/kapu-ertesites-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8912'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8912/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── A DÍSZLET: élő közös karrier, nyitott bajnoki kapu ── */
    gameMode="career";
    MP.active=true;MP.activeRoom="TEST";MP.role="host";
    S.mpOrphan=false;S.seasonNumber=3;S.mpCupSeason=0;
    S.mpDecision=null;S.mpDecisionCup=null;
    mpNet.mode="fb";
    const en=mpMyId(), tars="tarsId";
    const szoba=(be)=>({code:"TEST",players:{
      [en]:{role:"host",online:true,seenAt:Date.now()},
      [tars]:Object.assign({role:"guest"},be)}});
    /* a hálózati írást és a küldést elfogjuk: ez a próba nem küld semmit */
    const jelek=[];let kuldes=0;
    window.mpWaitMark=(on)=>{jelek.push(!!on);};
    /* A VALÓDI nudgeKuld a FÉKET is elindítja (`_nudgeAt`) — az utánzatnak
       ezt tudnia kell, különben a doboz üzenetét nem ott mérnénk, ahol van. */
    window.nudgeKuld=()=>{kuldes++;_nudgeAt=Date.now();return Promise.resolve({ok:true});};

    /* ── 1. A KAPU ÁLLAPOTAI ── */
    o.kapu={};
    o.kapu.dontetlen={nyitva:mpDecGateOpen(),varok:!!mpDecWaitGate()};
    S.mpDecision={season:3,mine:"continue",mate:null};
    o.kapu.enDontottem={nyitva:mpDecGateOpen(),varok:!!mpDecWaitGate()};
    S.mpDecision={season:3,mine:"continue",mate:"continue"};
    o.kapu.keszen={nyitva:mpDecGateOpen(),varok:!!mpDecWaitGate()};
    /* a kupa-kapu akkor sem vár, ha a hajsza már lezárult a bajnokin */
    S.mpCupSeason=3;S.mpDecision={season:3,mine:"stop",mate:null};
    S.mpDecisionCup={season:3,mine:"stop",mate:null};
    o.kapu.hajszaVege={kapu:mpGateKind(),nyitva:mpDecGateOpen(),varok:!!mpDecWaitGate()};
    S.mpCupSeason=0;S.mpDecisionCup=null;

    /* ── 2. A DOBOZ SZÖVEGE ── */
    S.mpDecision={season:3,mine:"continue",mate:null};
    const varoDoboz=mpDecPresBox();
    S.mpDecision=null;
    const semlegesDoboz=mpDecPresBox();
    S.mpDecision={season:3,mine:"continue",mate:"continue"};
    const zartDoboz=mpDecPresBox();
    o.doboz={
      varo_gomb:/id="mpDecNudgeBtn"/.test(varoDoboz),
      varo_jelenlet:/id="mpDecPres"/.test(varoDoboz),
      semleges_gomb:/id="mpDecNudgeBtn"/.test(semlegesDoboz),
      semleges_jelenlet:/id="mpDecPres"/.test(semlegesDoboz),
      /* a másik irány: engem is el lehessen érni */
      semleges_felirat:/id="mpDecSubBtn"/.test(semlegesDoboz),
      zart:zartDoboz};

    /* ── 3. A FESTÉS: a doboz élő DOM-ban ── */
    S.mpDecision={season:3,mine:"continue",mate:null};
    const holder=document.createElement("div");
    holder.innerHTML=mpDecPresBox();
    document.body.appendChild(holder);
    const lathato=()=>!$("mpDecNudgeWrap").classList.contains("hide");
    const uzenet=()=>$("mpDecNudgeMsg").textContent;

    /* 3a. a társ OFFLINE és fel van iratkozva → megy a bökés */
    _nudgeAt=0;_mpDecPushKey=null;
    _mpPresRoom=szoba({online:false,seenAt:Date.now()-600000,push:'{"endpoint":"x"}'});
    mpDecPresPaint();
    o.offline={gomb:lathato(),tiltva:$("mpDecNudgeBtn").disabled,
      jelenlet:$("mpDecPres").textContent,uzenet:uzenet(),kuldes};

    /* 3b. ugyanez MÉG EGYSZER: az automata jelzés kapunként egyszer megy ki */
    mpDecPresPaint();
    o.masodszor={kuldes,uzenet:uzenet(),tiltva:$("mpDecNudgeBtn").disabled};

    /* 3c. a fék letelt — a gomb újra él, de MAGÁTÓL nem küld többet */
    _nudgeAt=0;
    mpDecPresPaint();
    o.fekUtan={kuldes,tiltva:$("mpDecNudgeBtn").disabled,uzenet:uzenet()};

    /* 3d. a társ ONLINE → nincs mit bökni */
    _nudgeAt=0;_mpDecPushKey=null;kuldes=0;
    _mpPresRoom=szoba({online:true,seenAt:Date.now(),push:'{"endpoint":"x"}'});
    mpDecPresPaint();
    o.online={gomb:lathato(),jelenlet:$("mpDecPres").textContent,kuldes};

    /* 3e. a társ nem iratkozott fel → a gomb OTT VAN, de megmondja, miért nem megy */
    _nudgeAt=0;_mpDecPushKey=null;kuldes=0;
    _mpPresRoom=szoba({online:false,seenAt:Date.now()-600000});
    mpDecPresPaint();
    o.feliratkozasNelkul={gomb:lathato(),tiltva:$("mpDecNudgeBtn").disabled,
      uzenet:uzenet(),kuldes};

    /* ── 4. A MÁSIK OLDAL: ő vár rám ── */
    S.mpDecision=null;             /* én még nem döntöttem */
    holder.innerHTML=mpDecPresBox();
    _mpPresRoom=szoba({online:false,seenAt:Date.now()-60000,waitAt:Date.now()-30000});
    mpDecPresPaint();
    o.oVar={szoveg:$("mpDecPres").textContent,gomb:!!$("mpDecNudgeBtn")};
    /* egy RÉGEN ottfelejtett jelzés nem várakozás */
    _mpPresRoom=szoba({online:false,seenAt:Date.now()-60000,waitAt:Date.now()-1209600000});
    mpDecPresPaint();
    o.regiJel=$("mpDecPres").textContent;

    /* ── 5. A JELENLÉT-KÖR ÉLETBEN MARAD A KAPUN (ez volt a hiba magja) ── */
    S.mpDecision={season:3,mine:"continue",mate:null};
    holder.innerHTML=mpDecPresBox();
    let tick=0;
    const eredetiTick=window.mpPresenceTick;
    window.mpPresenceTick=()=>{tick++;};
    _mpPresRoom=szoba({online:false,seenAt:Date.now()-600000,push:'{"endpoint":"x"}'});
    $("h2hWait").classList.add("hide");        /* a beváró réteg ZÁRVA */
    mpWaitWatchdog();
    o.kor={lathato:mpDecPresLive(),tick,szobaMegvan:!!_mpPresRoom};
    /* és ha a kapu lezárult, a kör is leáll — nem kérdezgetünk a semmiért */
    S.mpDecision={season:3,mine:"continue",mate:"continue"};
    tick=0;
    mpWaitWatchdog();
    o.korUtan={lathato:mpDecPresLive(),tick,szoba:_mpPresRoom};
    window.mpPresenceTick=eredetiTick;

    /* ── 6. A SAJÁT JELZÉSEM A SZOBÁBAN ── */
    jelek.length=0;_mpDecMarked=false;
    S.mpDecision=null;
    mpSendDecision("continue");                /* a hálózati fele elszáll — nem baj */
    o.jelKiiras={utana:jelek.slice(),dontes:S.mpDecision&&S.mpDecision.mine};
    mpDecMark(true);                           /* kétszer nem írunk ugyanarról */
    o.ismetles=jelek.slice();
    mpDecMark(false);
    o.torles=jelek.slice();
    /* a beváró réteg zárása a mezőt is törli → a jelzőnk elavul */
    _mpDecMarked=true;
    h2hWaitHide();
    o.retegZaras={jelzo:_mpDecMarked};

    holder.remove();
    return o;});

  console.log("=== a kapu állapotai ===");
  ok("amíg egyikünk sem döntött, a kapu nyitva, de nem VÁROK",
     r.kapu.dontetlen.nyitva===true&&r.kapu.dontetlen.varok===false,r.kapu.dontetlen);
  ok("ha én döntöttem és ő még nem: ez a VÁRAKOZÁS",
     r.kapu.enDontottem.nyitva===true&&r.kapu.enDontottem.varok===true,r.kapu.enDontottem);
  ok("ha mindketten döntöttünk, nincs többé mire várni",
     r.kapu.keszen.nyitva===false&&r.kapu.keszen.varok===false,r.kapu.keszen);
  ok("a lezárt hajsza kupa-kapuja nem vár senkire",
     r.kapu.hajszaVege.kapu==="cup"&&r.kapu.hajszaVege.nyitva===false
     &&r.kapu.hajszaVege.varok===false,r.kapu.hajszaVege);

  console.log("\n=== a doboz ===");
  ok("a várakozó kap bökés-gombot",r.doboz.varo_gomb&&r.doboz.varo_jelenlet,r.doboz);
  ok("aki még nem döntött, nem bökhet — de a jelenlétet ő is látja",
     r.doboz.semleges_gomb===false&&r.doboz.semleges_jelenlet===true,r.doboz);
  ok("és mindkét oldalnak felajánljuk, hogy ŐT is el lehessen érni",
     r.doboz.semleges_felirat===true,r.doboz.semleges_felirat);
  ok("lezárt kapunál a doboz eltűnik",r.doboz.zart==="",r.doboz.zart);

  console.log("\n=== a bökés ===");
  ok("offline társnál megjelenik a bökés gombja",r.offline.gomb===true,r.offline);
  ok("a jelenlét ki van írva (mióta nincs itt)",
     /NINCS a játékban/.test(r.offline.jelenlet),r.offline.jelenlet);
  ok("és magától KIMEGY egy értesítés, hogy rá várunk",r.offline.kuldes===1,r.offline.kuldes);
  ok("de kapunként CSAK EGYSZER — a második kör nem küld újat",
     r.masodszor.kuldes===1,r.masodszor);
  ok("a fék ideje alatt a gomb NEM él, és a doboz kimondja, hogy már szóltunk",
     r.offline.tiltva===true&&/Már szóltunk neki/.test(r.offline.uzenet),r.offline);
  ok("a fék letelte után újra élő gomb — de magától nem megy több értesítés",
     r.fekUtan.tiltva===false&&r.fekUtan.kuldes===1,r.fekUtan);
  ok("aki ONLINE, azt nem bökjük meg (látja a képernyőn)",
     r.online.gomb===false&&r.online.kuldes===0,r.online);
  ok("feliratkozás nélküli társnál a gomb LÁTSZIK, de megmondja az okot",
     r.feliratkozasNelkul.gomb===true&&r.feliratkozasNelkul.tiltva===true
     &&/nem kapcsolta be az értesítést/.test(r.feliratkozasNelkul.uzenet),r.feliratkozasNelkul);
  ok("és ilyenkor nem is próbálunk küldeni",r.feliratkozasNelkul.kuldes===0);

  console.log("\n=== a másik oldal ===");
  ok("aki még nem döntött, LÁTJA, hogy rá várnak",
     /rád vár/.test(r.oVar.szoveg),r.oVar.szoveg);
  ok("neki nincs bökés-gombja (nem ő vár)",r.oVar.gomb===false);
  ok("egy régen ottfelejtett jelzés nem várakozás",
     !/rád vár/.test(r.regiJel),r.regiJel);

  console.log("\n=== a jelenlét-kör a kapun (a hiba magja) ===");
  ok("zárt beváró réteg mellett is fut a kör, amíg a kapu nyitva",
     r.kor.lathato===true&&r.kor.tick===1&&r.kor.szobaMegvan===true,r.kor);
  ok("a kapu lezárultával leáll, és a szoba példánya elengedve",
     r.korUtan.lathato===false&&r.korUtan.tick===0&&r.korUtan.szoba===null,r.korUtan);

  console.log("\n=== a saját jelzésem ===");
  ok("a döntés elküldése kiírja a szobába, hogy várok",
     r.jelKiiras.utana.length===1&&r.jelKiiras.utana[0]===true,r.jelKiiras);
  ok("ugyanarról nem írunk kétszer",r.ismetles.length===1,r.ismetles);
  ok("a visszavonás leveszi",r.torles.length===2&&r.torles[1]===false,r.torles);
  ok("a beváró réteg zárása után a jelzőnk elavul (újra ki tudjuk írni)",
     r.retegZaras.jelzo===false,r.retegZaras);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
