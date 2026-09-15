/* 💬 JÁTÉKON BELÜLI ÉRTESÍTÉS A PvP TÁRSNAK (3.9.73)

   KIMONDOTT KÉRÉS: „Lehessen játékon belüli értesítést küldeni a PvP
   társadnak, amikor online. Az értesítéshez lehessen 10db smiley közül
   választani… nézzen úgy ki, mint egy klasszik lebegő értesítés, ami felül és
   sávban beugrik, és lehet rányomni, akkor odaugrik, ahol vár a társad, vagy
   lehet dismisselni, vagy némítani 15 percre."

   A PRÓBA A KÉT OLDALT KÜLÖN MÉRI. A küldőnél: a tíz jel, a kapu (csak ONLINE
   társnál, saját fékkel), és hogy a csík a bökés ELLENKEZŐ esetében jelenik
   meg — a kettő sosem látszik együtt. A fogadónál: a sáv beugrása, a három
   művelet (ugrás, bezárás, 15 perces némítás), és hogy a régi vagy a saját
   jelzés nem ugrik be.

   KÜLÖN ÁG A CSATORNA. A jelzés a `h2h` ág alá megy, nem a `players/$pid`
   alá: az utóbbi szabálya `$other:false`, tehát oda új mezőt írni csak
   frissített, KÖZZÉTETT szabályfájllal lehetne — a ház visszatérő néma
   hibája. A próba a szabályfájlból ellenőrzi, hogy a választott út a MA élő
   szabályokkal is járható.

   Használat: node tools/pvp-ertesites-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const fs=require('fs');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8959'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  /* ── 0. A CSATORNA a MA ÉLŐ szabályokkal is járható ── */
  const rules=JSON.parse(fs.readFileSync('/home/user/Magyah/tools/firebase-rules.json','utf8'));
  const szoba=rules.rules.mp.rooms.$code;
  console.log("=== a csatorna ===");
  ok("a players/$pid ág ZÁRT új mezőre — oda nem lehetett tenni",
     szoba.players.$pid.$other&&szoba.players.$pid.$other[".validate"]===false,
     szoba.players.$pid.$other);
  ok("a h2h ág viszont nyitott, tehát szabályfrissítés NÉLKÜL is működik",
     szoba.h2h&&szoba.h2h[".validate"]===true,szoba.h2h);

  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8959/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(async()=>{
    const o={};
    /* ---- A DÍSZLET: közös szoba, a társ ONLINE ---- */
    gameMode="career";
    MP.role="host";MP.activeRoom="ABCD";
    mpNet.mode="fb";
    window.h2hRoomActive=()=>true;
    teamName="Próba FC";
    const naplo=[];window.addLine=(t)=>naplo.push(String(t));
    try{localStorage.removeItem(MP_PING_MUTE_KEY);}catch(e){}
    _mpPingMute=0;_mpPingAt=0;_mpPingSeen=0;
    const ENYEM=mpMyId(),TARS="tars-1";
    const ujRoom=(online)=>({code:"ABCD",players:{
      [ENYEM]:{role:"host",online:true},
      [TARS]:{role:"guest",online:online}}});
    _mpPresRoom=ujRoom(true);
    /* a hálózat: memóriabeli h2h ág */
    const h2h={};let putDb=0,getDb=0;
    window.mpBk=()=>({
      h2hPut:async(code,round,field,val)=>{putDb++;(h2h[round]=h2h[round]||{})[field]=val;},
      h2hGet:async(code,round)=>{getDb++;return h2h[round]||null;}});

    /* ---- 1. A TÍZ HANGULATJEL ---- */
    o.emoji={db:MP_PING_EMOJI.length,
      egyedi:new Set(MP_PING_EMOJI.map(x=>x.e)).size,
      vanNev:MP_PING_EMOJI.every(x=>x.n&&x.n.length>2),
      lista:MP_PING_EMOJI.map(x=>x.e).join("")};
    o.ismeretlen=mpPingEmojiOk("💣");     /* nem a listából → az elsőre esik vissza */
    o.ismert=mpPingEmojiOk("🔥");

    /* ---- 2. A KÜLDÉS KAPUJA ---- */
    o.kapu={};
    o.kapu.online=mpPingWhyNot();
    _mpPresRoom=ujRoom(false);
    o.kapu.offline=mpPingWhyNot();
    _mpPresRoom={code:"ABCD",players:{[ENYEM]:{role:"host",online:true}}};
    o.kapu.nincsTars=mpPingWhyNot();
    _mpPresRoom=ujRoom(true);
    mpNet.mode="local";o.kapu.helyi=mpPingWhyNot();mpNet.mode="fb";

    /* ---- 3. A KÜLDÉS ---- */
    const k1=await mpPingSend("🔥");
    o.kuldes={ok:k1.ok,put:putDb,
      mezo:!!h2h.ping&&!!h2h.ping[ENYEM],
      e:h2h.ping&&h2h.ping[ENYEM]&&h2h.ping[ENYEM].e,
      t:h2h.ping&&h2h.ping[ENYEM]&&h2h.ping[ENYEM].t,
      vanAt:!!(h2h.ping&&h2h.ping[ENYEM]&&h2h.ping[ENYEM].at)};
    /* a fék: rögtön utána nem megy */
    const k2=await mpPingSend("👋");
    o.fek={ok:k2.ok,miert:k2.miert||"",put:putDb};

    /* ---- 4. A FOGADÁS ---- */
    const bar=document.getElementById("mpPingBar");
    const lathato=()=>!bar.classList.contains("hide");
    /* a SAJÁT jelzés nem ugrik be */
    _mpPingSeen=0;
    await mpPingPoll();
    o.sajat={lathato:lathato()};
    /* a TÁRSÉ igen */
    h2h.ping[TARS]={e:"🍿",t:"Társ FC",g:"a szezonzáró kapunál",at:Date.now()};
    _mpPingSeen=0;
    await mpPingPoll();
    await new Promise(r0=>setTimeout(r0,80));
    o.fogadas={lathato:lathato(),
      emoji:(document.getElementById("mpPingEmoji")||{}).textContent,
      szoveg:(document.getElementById("mpPingTx")||{}).textContent||"",
      becsuszott:bar.classList.contains("mpPingIn"),
      /* felül van, sávban, fixen — mint egy rendszerértesítés */
      pos:getComputedStyle(bar).position,
      top:parseInt(getComputedStyle(bar).top,10)};
    /* ugyanaz a jelzés MÁSODSZOR nem ugrik be */
    mpPingHide();await new Promise(r0=>setTimeout(r0,300));
    await mpPingPoll();
    o.ketszer={lathato:lathato()};
    /* RÉGI jelzés sem */
    h2h.ping[TARS]={e:"👋",t:"Társ FC",g:"",at:Date.now()-MP_PING_FRESH_MS-5000};
    _mpPingSeen=0;
    await mpPingPoll();
    o.regi={lathato:lathato()};

    /* ---- 5. A HÁROM MŰVELET ---- */
    /* (a) BEZÁRÁS */
    h2h.ping[TARS]={e:"⚽",t:"Társ FC",g:"",at:Date.now()};
    _mpPingSeen=0;await mpPingPoll();await new Promise(r0=>setTimeout(r0,60));
    const nyitva1=lathato();
    document.getElementById("mpPingClose").click();
    await new Promise(r0=>setTimeout(r0,320));
    o.bezaras={elotte:nyitva1,utana:lathato()};
    /* (b) NÉMÍTÁS 15 PERCRE */
    h2h.ping[TARS]={e:"⏳",t:"Társ FC",g:"",at:Date.now()};
    _mpPingSeen=0;await mpPingPoll();await new Promise(r0=>setTimeout(r0,60));
    document.getElementById("mpPingMute").click();
    await new Promise(r0=>setTimeout(r0,320));
    const perc=Math.round(mpPingMuteLeft()/60000);
    /* …és némítás alatt egy ÚJ jelzés sem ugrik be */
    h2h.ping[TARS]={e:"🔔",t:"Társ FC",g:"",at:Date.now()};
    _mpPingSeen=0;await mpPingPoll();await new Promise(r0=>setTimeout(r0,60));
    o.nemitas={perc,lathato:lathato(),
      /* a némítás túléli az újratöltést: a localStorage-ban van */
      tarolt:!!(function(){try{return localStorage.getItem(MP_PING_MUTE_KEY);}catch(e){return null;}})(),
      naplo:naplo.filter(t=>/15 perc/.test(t)).length};
    _mpPingMute=0;try{localStorage.removeItem(MP_PING_MUTE_KEY);}catch(e){}
    /* (c) UGRÁS */
    h2h.ping[TARS]={e:"🏆",t:"Társ FC",g:"",at:Date.now()};
    _mpPingSeen=0;await mpPingPoll();await new Promise(r0=>setTimeout(r0,60));
    /* nincs hova ugrani → NEM ugrik, hanem MEGMONDJA, mit tegyen */
    const u1=mpPingJump();
    o.ugrasNincs={vitt:u1,szoveg:(document.getElementById("mpPingTx")||{}).textContent||"",
      lathato:lathato()};
    /* van hova: a beváró réteg */
    let gorgetve=null;
    const w=document.getElementById("h2hWait");
    w.classList.remove("hide");
    w.scrollIntoView=()=>{gorgetve="h2hWait";};
    const u2=mpPingJump();
    o.ugrasVan={vitt:u2,hova:gorgetve};
    w.classList.add("hide");
    await new Promise(r0=>setTimeout(r0,320));

    /* ---- 6. A KÜLDŐ CSÍKJA ---- */
    const host=document.createElement("div");
    host.innerHTML=mpPingBarHtml("proba");
    document.body.appendChild(host);
    _mpPresRoom=ujRoom(true);_mpPingAt=0;
    mpPingPaint("proba");
    const pick=document.getElementById("probaPingPick");
    o.csik={gombok:pick?pick.querySelectorAll("[data-ping]").length:0,
      lathatoOnline:!document.getElementById("probaPingWrap").classList.contains("hide"),
      tiltva:pick?Array.from(pick.querySelectorAll("[data-ping]")).filter(x=>x.disabled).length:-1};
    /* OFFLINE társnál a csík eltűnik — ott a 🔔 bökés (push) a helyes eszköz */
    _mpPresRoom=ujRoom(false);
    mpPingPaint("proba");
    o.csikOffline={rejtve:document.getElementById("probaPingWrap").classList.contains("hide")};
    /* fék alatt a gombok szürkék, és a doboz KIMONDJA, miért */
    _mpPresRoom=ujRoom(true);_mpPingAt=Date.now();
    mpPingPaint("proba");
    o.csikFek={tiltva:Array.from(pick.querySelectorAll("[data-ping]")).filter(x=>x.disabled).length,
      uzenet:(document.getElementById("probaPingMsg")||{}).textContent||""};
    o.olvasas={get:getDb,put:putDb};
    return o;});

  console.log("\n=== a tíz hangulatjel ===");
  ok("pontosan TÍZ, mind különböző, mind saját felirattal",
     r.emoji.db===10&&r.emoji.egyedi===10&&r.emoji.vanNev===true,r.emoji);
  ok("a listán kívüli jel nem megy ki — az elsőre esik vissza",
     r.ismeretlen===MP_E0()&&r.ismert==="🔥",{ism:r.ismeretlen,ok:r.ismert});

  console.log("\n=== a küldés kapuja ===");
  ok("ONLINE társnál mehet",r.kapu.online==="",r.kapu);
  ok("OFFLINE társnál nem — és kimondja, hogy ott a 🔔 bökés a helyes eszköz",
     /nincs a játékban/.test(r.kapu.offline)&&/bökés/.test(r.kapu.offline),r.kapu);
  ok("társ nélkül és helyi módban sem, kimondott okkal",
     /nem csatlakozott/.test(r.kapu.nincsTars)&&/Helyi/.test(r.kapu.helyi),r.kapu);

  console.log("\n=== a küldés ===");
  ok("a jelzés a h2h/ping ág alá megy, a saját azonosítóm alá",
     r.kuldes.ok===true&&r.kuldes.mezo===true&&r.kuldes.e==="🔥"
     &&r.kuldes.t==="Próba FC"&&r.kuldes.vanAt===true,r.kuldes);
  ok("a fék azonnal fog, és megmondja, mennyit kell várni",
     r.fek.ok===false&&/mp múlva/.test(r.fek.miert)&&r.fek.put===1,r.fek);

  console.log("\n=== a fogadás ===");
  ok("a SAJÁT jelzés nem ugrik be",r.sajat.lathato===false,r.sajat);
  ok("a társé igen — a saját jelével és a küldő nevével",
     r.fogadas.lathato===true&&r.fogadas.emoji==="🍿"
     &&/Társ FC vár rád/.test(r.fogadas.szoveg),r.fogadas);
  ok("és úgy néz ki, mint egy rendszerértesítés: FELÜL, fixen, becsúszva",
     r.fogadas.pos==="fixed"&&r.fogadas.top<=40&&r.fogadas.becsuszott===true,r.fogadas);
  ok("kimondja, HOL vár a társ, és hogy koppintani lehet rá",
     /szezonzáró kapunál/.test(r.fogadas.szoveg)&&/koppints/i.test(r.fogadas.szoveg),
     {szoveg:r.fogadas.szoveg});
  ok("ugyanaz a jelzés másodszor nem ugrik be, és a réginek sincs helye",
     r.ketszer.lathato===false&&r.regi.lathato===false,{k:r.ketszer,r:r.regi});

  console.log("\n=== a három művelet ===");
  ok("BEZÁRÁS: a sáv eltűnik",r.bezaras.elotte===true&&r.bezaras.utana===false,r.bezaras);
  ok("NÉMÍTÁS: pontosan 15 perc, és alatta új jelzés sem ugrik be",
     r.nemitas.perc===15&&r.nemitas.lathato===false,r.nemitas);
  ok("…a némítás túléli az újratöltést, és a napló is kimondja",
     r.nemitas.tarolt===true&&r.nemitas.naplo>=1,r.nemitas);
  ok("UGRÁS: ahol van hova, odavisz",
     r.ugrasVan.vitt===true&&r.ugrasVan.hova==="h2hWait",r.ugrasVan);
  ok("…ahol nincs (futó meccs, draft), nem ránt ki — MEGMONDJA, hova menj",
     r.ugrasNincs.vitt===false&&/fejezd be/i.test(r.ugrasNincs.szoveg)
     &&r.ugrasNincs.lathato===true,r.ugrasNincs);

  console.log("\n=== a küldő csíkja ===");
  ok("tíz gomb, mind élő, amíg a társ ONLINE",
     r.csik.gombok===10&&r.csik.lathatoOnline===true&&r.csik.tiltva===0,r.csik);
  ok("OFFLINE társnál a csík eltűnik — ott a push a helyes eszköz",
     r.csikOffline.rejtve===true,r.csikOffline);
  ok("fék alatt mind a tíz gomb szürke, és a doboz kimondja, miért",
     r.csikFek.tiltva===10&&/mp múlva/.test(r.csikFek.uzenet),r.csikFek);

  console.log("\n=== a költség ===");
  ok("a fogadás EGY apró olvasás körönként, nem a teljes szoba",
     r.olvasas.get>0&&r.olvasas.put===1,r.olvasas);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
function MP_E0(){return "👋";}
