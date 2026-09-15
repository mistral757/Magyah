/* ⚡ MINDEN BOOST EGY HELYEN (3.9.76)

   KIMONDOTT KÉRÉS: „Az ifi boost és az öreg róka boost legyen bevezetve a
   boost központba, ne legyenek külön, és a rájuk vonatkozó jutalmak is oda
   legyenek bevezetve ugyanúgy mint a többi boostnál — a nulla ft-os ár ott
   látszódjon. Nem kell külön kihívás jutalmak menüpont a csapatépítés menün
   belül."

   HÁROM ÁLLÍTÁS-CSOPORT:
     1. a HUB menüjéből eltűnt a két külön boost-gomb és a jutalom-almenü;
     2. a Boost-központ MIND A HETET kínálja, és az ifi/öreg sora a saját
        paneljét nyitja (azoknak saját jelölt-logikájuk van);
     3. a kihívás-jutalom a KATALÓGUS árában látszik (0 Ft / INGYEN), és a
        végrehajtáskor fogy el.

   A LEGFONTOSABB ÁG A RÉGI HIBÁT MÉRI: az általános ingyen-zseton
   (S.boostTokens) eddig NEM hatott a katalógus árára, csak a saját
   képernyőjén — ugyanaz a jutalom két úton, két árral. Az ifi-boost ára
   ráadásul megkerülte a boostPriceOf-ot, tehát a FAJTÁNKÉNTI zseton sem
   fogott rajta.

   Használat: node tools/boost-kozpont-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8983'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage({viewport:{width:390,height:900}});
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8983/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* ── 1. A MENÜBŐL ELTŰNT, AMINEK EL KELLETT ── */
    o.menu={
      ifiGomb:!!document.getElementById("hubYouthBoostBtn"),
      oregGomb:!!document.getElementById("hubOldBoostBtn"),
      jutalomCsoport:!!document.getElementById("hubTokenGroup"),
      ingyenBoostGomb:!!document.getElementById("hubBoostTokenBtn"),
      ingyenIgazolasGomb:!!document.getElementById("hubFreePlayerBtn"),
      /* …és ami MARADT: az egyetlen út */
      boostKozpont:!!document.getElementById("hubBoostBtn")};

    /* ── A DÍSZLET ── */
    gameMode="career";phase="hub";S.seasonNumber=3;S.transferBudget=9e12;
    careerPool={};
    const mk=(n,age,pot)=>{careerPool[n]={n,pos:["KV"],age,pot,startRating:70,peak:75,
      nat:"Magyarország",youthBonus:age<20?1:0};return {n,pos:["KV"],ovr:70};};
    const roster=[mk("Ifi Imre",18,3000),mk("Öreg Ödön",33,1200),mk("Közép Károly",26,2000)];
    window.fullCareerRoster=()=>roster;
    window.currentRoster=()=>roster;window.extraRoster=[];
    S.boostTokens=0;S.chFreeBoost={};

    /* ── 2. A KATALÓGUS MIND A HETET HOZZA ── */
    o.fajtak=BOOST_KINDS.map(d=>d.k);
    o.vanGo={youth:typeof (BOOST_KINDS.find(d=>d.k==="youth")||{}).go==="function",
      old:typeof (BOOST_KINDS.find(d=>d.k==="old")||{}).go==="function"};
    /* a go: KÖZVETLENÜL a panelt nyitja, nem egy rejtett gomb kattintását */
    o.panelFuggveny={youth:typeof openYouthBoostPanel==="function",
      old:typeof openOldBoostPanel==="function"};
    let nyitott=null;
    const eredetiY=window.openYouthBoostPanel,eredetiO=window.openOldBoostPanel;
    window.openYouthBoostPanel=()=>{nyitott="youth";};
    window.openOldBoostPanel=()=>{nyitott="old";};
    BOOST_KINDS.find(d=>d.k==="youth").go();o.goYouth=nyitott;
    BOOST_KINDS.find(d=>d.k==="old").go();o.goOld=nyitott;
    window.openYouthBoostPanel=eredetiY;window.openOldBoostPanel=eredetiO;

    /* ── 3. A KÉT ZSETON EGY FOGALOM ── */
    const teljesY=()=>{S.boostTokens=0;S.chFreeBoost={};return boostPriceOf("youth");};
    o.arak={};
    o.arak.teljes=teljesY();
    S.boostTokens=2;                    /* ÁLTALÁNOS jutalom */
    o.arak.altalanosYouth=boostPriceOf("youth");
    o.arak.altalanosOld=boostPriceOf("old");
    /* …de csak az ifire és az öregre szól — a többi fajta ára változatlan */
    o.arak.altalanosPlain=boostPriceOf("plain");
    S.boostTokens=0;S.chFreeBoost={youth:1};
    o.arak.fajtankentiYouth=boostPriceOf("youth");
    /* …és az IFI-PANEL ára is a közös kapun át jön (ez volt elrontva) */
    o.arak.ifiPanel=youthBoostPrice();
    S.chFreeBoost={};
    o.arak.ifiPanelTeljes=youthBoostPrice();
    o.arak.egyezik=(youthBoostPrice()===boostPriceOf("youth"));

    /* ── 4. A ZSETON A VÉGREHAJTÁSKOR FOGY, A SZŰKEBB ELŐSZÖR ── */
    S.boostTokens=1;S.chFreeBoost={youth:1};
    const e1=boostFreeSpend("youth");
    o.koltes1={ok:e1,fajtankenti:chFreeBoostLeft("youth"),altalanos:S.boostTokens};
    const e2=boostFreeSpend("youth");
    o.koltes2={ok:e2,fajtankenti:chFreeBoostLeft("youth"),altalanos:S.boostTokens};
    const e3=boostFreeSpend("youth");
    o.koltes3={ok:e3};
    /* az általános zseton MÁS fajtára nem megy el */
    S.boostTokens=1;S.chFreeBoost={};
    o.masFajta={spend:boostFreeSpend("plain"),maradt:S.boostTokens};

    /* ── 5. A KATALÓGUSBAN LÁTSZIK, HOGY INGYEN ── */
    S.boostTokens=2;S.chFreeBoost={plain:1};
    boostOpenPanel();
    const sorok=Array.from(document.getElementById("twActions").querySelectorAll("button"))
      .map(x=>x.textContent||"");
    const sor=(nev)=>sorok.find(t=>t.indexOf(nev)>=0)||"";
    o.katalogus={
      db:sorok.length,
      ifi:sor("Ifi-boost"),
      oreg:sor("Öreg róka"),
      sima:sor("Sima boost"),
      /* a fizetős sorok viszont TOVÁBBRA IS árat mutatnak */
      pot:sor("POT boost")};
    S.boostTokens=0;S.chFreeBoost={};
    boostOpenPanel();
    const sorok2=Array.from(document.getElementById("twActions").querySelectorAll("button"))
      .map(x=>x.textContent||"");
    o.katalogusFizetos={ifi:sorok2.find(t=>t.indexOf("Ifi-boost")>=0)||""};

    /* ── 6. AZ INGYEN IGAZOLÁS TOVÁBBRA IS MŰKÖDIK, MAGÁTÓL ── */
    S.freePlayerTokens=1;
    o.igazolas={keszen:buyTokenReady(),
      /* a zseton a fizetés tölcsérében vált be — a menü-gomb nélkül is */
      mentve:(function(){try{
        const d=JSON.parse(JSON.stringify({S:{freePlayerTokens:S.freePlayerTokens,
          boostTokens:S.boostTokens,chFreeBoost:S.chFreeBoost}}));
        return d.S.freePlayerTokens===1;}catch(e){return false;}})()};
    S.freePlayerTokens=0;
    o.igazolasNelkul=buyTokenReady();
    return o;});

  console.log("=== 1. a menüből eltűnt, aminek el kellett ===");
  ok("nincs külön Ifi-boost és Öreg csirkefogó gomb",
     r.menu.ifiGomb===false&&r.menu.oregGomb===false,r.menu);
  ok("és nincs külön „Kihívás-jutalmak” almenü sem",
     r.menu.jutalomCsoport===false&&r.menu.ingyenBoostGomb===false
     &&r.menu.ingyenIgazolasGomb===false,r.menu);
  ok("a Boost-központ viszont ott van — ez az egyetlen út",
     r.menu.boostKozpont===true,r.menu);

  console.log("\n=== 2. a katalógus mind a hetet hozza ===");
  ok("a hét fajta (plusz az Egyenlítő) között ott az ifi és az öreg is",
     r.fajtak.indexOf("youth")>=0&&r.fajtak.indexOf("old")>=0&&r.fajtak.length>=7,
     r.fajtak);
  ok("a soruk a SAJÁT paneljüket nyitja (saját jelölt-logikával)",
     r.vanGo.youth&&r.vanGo.old&&r.panelFuggveny.youth&&r.panelFuggveny.old
     &&r.goYouth==="youth"&&r.goOld==="old",
     {go:r.vanGo,fn:r.panelFuggveny,y:r.goYouth,o:r.goOld});

  console.log("\n=== 3. a két kihívás-jutalom EGY fogalom ===");
  ok("teljes áron az ifi-boost fizetős",r.arak.teljes>0,r.arak);
  ok("az ÁLTALÁNOS zseton nullázza az ifi és az öreg árát",
     r.arak.altalanosYouth===0&&r.arak.altalanosOld===0,r.arak);
  ok("…de csak azt a kettőt — más fajta ára változatlan",
     r.arak.altalanosPlain>0,r.arak);
  ok("a FAJTÁNKÉNTI zseton is nullázza",r.arak.fajtankentiYouth===0,r.arak);
  ok("és az IFI-PANEL ára a KÖZÖS kapun jön (ez volt elrontva: megkerülte)",
     r.arak.ifiPanel===0&&r.arak.ifiPanelTeljes>0&&r.arak.egyezik===true,r.arak);

  console.log("\n=== 4. a zseton a végrehajtáskor fogy, a szűkebb előbb ===");
  ok("előbb a fajtánkénti fogy, az általános érintetlen",
     r.koltes1.ok===true&&r.koltes1.fajtankenti===0&&r.koltes1.altalanos===1,r.koltes1);
  ok("utána az általános",
     r.koltes2.ok===true&&r.koltes2.altalanos===0,r.koltes2);
  ok("ha egyik sincs, nem költ semmit",r.koltes3.ok===false,r.koltes3);
  ok("az általános zseton MÁS fajtára nem megy el",
     r.masFajta.spend===false&&r.masFajta.maradt===1,r.masFajta);

  console.log("\n=== 5. a katalógusban látszik, hogy INGYEN ===");
  ok("az ifi és az öreg sora INGYEN-t ír, a jutalom nevével és a darabszámmal",
     /INGYEN/.test(r.katalogus.ifi)&&/kihívás-jutalom/.test(r.katalogus.ifi)
     &&/2 db/.test(r.katalogus.ifi)&&/INGYEN/.test(r.katalogus.oreg),
     {ifi:r.katalogus.ifi.replace(/\s+/g," ").slice(0,110)});
  ok("a fajtánkénti jutalom ugyanígy (Sima boost), darabszám nélkül, ha csak 1",
     /INGYEN/.test(r.katalogus.sima)&&!/db/.test(r.katalogus.sima),
     {sima:r.katalogus.sima.replace(/\s+/g," ").slice(0,90)});
  ok("a fizetős sorok viszont továbbra is árat és egységet mutatnak",
     /egység/.test(r.katalogus.pot)&&!/INGYEN/.test(r.katalogus.pot),
     {pot:r.katalogus.pot.replace(/\s+/g," ").slice(0,80)});
  ok("zseton nélkül az ifi sora is árat mutat",
     !/INGYEN/.test(r.katalogusFizetos.ifi)&&/egység/.test(r.katalogusFizetos.ifi),
     {ifi:r.katalogusFizetos.ifi.replace(/\s+/g," ").slice(0,80)});

  console.log("\n=== 6. az ingyen igazolás nem veszett el ===");
  ok("a zseton él, és a vételi úton magától vált be (menü-gomb nélkül)",
     r.igazolas.keszen===true&&r.igazolas.mentve===true
     &&r.igazolasNelkul===false,r.igazolas);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
