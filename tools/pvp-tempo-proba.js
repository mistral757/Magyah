const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8933'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message)); p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8933/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={}, ME=mpMyId();
    const sz=(tempo,online)=>({tempo,players:{[ME]:{role:"host"},M:{role:"guest",online}}});
    // ── 1. A MÓDOK ──
    out.modok=Object.keys(MP_TEMPO).map(k=>`${k}: ${MP_TEMPO[k].ms/1000}mp auto=${MP_TEMPO[k].auto}`);
    out.alap=mpTempoKey({});                       // ismeretlen → alapérték
    out.ismeretlen=mpTempoKey({tempo:"nincsilyen"});
    // ── 2. A HATÁRIDŐ ──
    const most=mpNow();
    _mpPresRoom=sz("villam",false);
    out.hatarido={
      frissen: mpMMSS(mpDeadlineLeft(most)),
      felut:   mpMMSS(mpDeadlineLeft(most-90000)),
      lejart:  mpDeadlineLeft(most-200000),
    };
    _mpPresRoom=sz("villam",true);                 // A TÁRS ITT VAN
    out.hatarido.tars_itt_van=mpDeadlineLeft(most-200000);
    _mpPresRoom=sz("nyugodt",false);               // KÉNYELMES mód
    out.hatarido.kenyelmes=mpDeadlineLeft(most-200000);
    // ── 3. AUTOMATIKUS LÉPÉS ──
    let lagy=0, kemeny=0;
    _mpSoloOut=null; _mpSoloFired=null;
    _mpPresRoom=sz("villam",false);
    mpSoloArm("A társad nem nevezett — indulok a saját kvalifikációmmal",()=>{lagy++;},"teszt-lagy",true);
    _mpSoloOut.at=mpNow()-200000;                  // lejárt
    const ob=document.getElementById("h2hWaitOrphanBtn");
    ob.classList.remove("hide");
    mpSoloOffer(false); mpSoloOffer(false);        // kétszer: ne pörögjön
    out.lagy_kapu={lefutott:lagy, gomb_szovege:ob.textContent.slice(0,40)};
    // KEMÉNY kapu: auto=false → sosem lép magától
    _mpSoloOut=null; _mpSoloFired=null;
    mpSoloArm("Egyedül folytatom ezt a karriert",()=>{kemeny++;},"teszt-kemeny",false);
    _mpSoloOut.at=mpNow()-600000;
    mpSoloOffer(false); mpSoloOffer(false); mpSoloOffer(false);
    out.kemeny_kapu={lefutott:kemeny};
    // KÉNYELMES módban a lágy sem lép magától
    let lagy2=0; _mpSoloOut=null; _mpSoloFired=null;
    _mpPresRoom=sz("nyugodt",false);
    mpSoloArm("lágy",()=>{lagy2++;},"teszt-kenyelmes",true);
    _mpSoloOut.at=mpNow()-600000; mpSoloOffer(false);
    out.kenyelmes_nem_lep={lefutott:lagy2};
    // A TÁRS ITT VAN → Villámban sem lép
    let lagy3=0; _mpSoloOut=null; _mpSoloFired=null;
    _mpPresRoom=sz("villam",true);
    mpSoloArm("lágy",()=>{lagy3++;},"teszt-online",true);
    _mpSoloOut.at=mpNow()-600000; mpSoloOffer(false);
    out.tars_online_nem_lep={lefutott:lagy3};
    // ── 4. A KIÍRÁS ──
    const el=document.getElementById("h2hWaitMate");
    const fest=(room,solo)=>{_mpPresRoom=room;_mpSoloOut=solo;mpPresencePaint();
      return (el.innerText||"").replace(/\s+/g," ").trim();};
    out.szoveg={
      villam_szamlal: fest(sz("villam",false),{at:mpNow()-60000,auto:true}).slice(-60),
      tempos_szamlal: fest(sz("tempos",false),{at:mpNow()-60000,auto:true}).slice(-62),
      parharc_frissen:(()=>{_h2hWaitAt=Date.now();return fest(sz("villam",false),null).slice(-70);})(),
      parharc_lejart: (()=>{_h2hWaitAt=Date.now()-200000;return fest(sz("villam",false),null).slice(-150);})(),
      kenyelmes:      fest(sz("nyugodt",false),{at:mpNow()-60000,auto:true}).slice(-40),
    };
    _mpSoloOut=null;_mpSoloFired=null;
    return out;});
  console.log(JSON.stringify(r,null,1));
  console.log("HIBAK:",h.length?h.slice(0,5):"nincs");
  await b.close(); srv.kill();
})();
