/* A KEZDŐLAP GOMBJAI, A TÉMAVÁLASZTÓ ÉS A TÉMA-VILLANÁS — élő mérés.
   Amit néz:
     1. a téma MÁR AZ ELSŐ FESTÉS ELŐTT a mentett érték-e (nincs sötét villanás),
     2. a rendszer-sáv színe (theme-color) követi-e a témát,
     3. a kezdőlapi témaválasztó vált-e, és jelöli-e az aktívat,
     4. az „indítás" gombok SZABAD helyre visznek, nem a mentettre,
     5. a folytatás gomb a MENTETT helyre visz,
     6. tele helyeknél nem írunk felül némán. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8994'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[]; const out={};

  /* ── 1-2. A VILLANÁS. A lap betöltése közben, MÉG A SCRIPT VÉGE ELŐTT
        nézzük meg a data-theme-et: ha csak az initTheme állítaná be, itt
        még az alapértelmezett (sötét) állapotot látnánk. ── */
  for(const t of ["paper","noir"]){
    const p=await b.newPage({viewport:{width:390,height:844}});
    await p.goto('http://localhost:8994/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(x=>{try{localStorage.setItem("theme30_0",x);}catch(e){}},t);
    /* ÚJRATÖLTÉS, és AZONNAL olvasunk — a nagy script még fut */
    await p.goto('http://localhost:8994/index.html',{waitUntil:'commit'});
    const korai=await p.evaluate(()=>({
      tema:document.documentElement.getAttribute("data-theme"),
      sav:(document.querySelector('meta[name="theme-color"]')||{}).content,
      scriptKesz:typeof window.applyTheme==="function"}));
    await p.waitForTimeout(2500);
    const kesz=await p.evaluate(()=>({
      tema:document.documentElement.getAttribute("data-theme"),
      sav:(document.querySelector('meta[name="theme-color"]')||{}).content}));
    out["villanas_"+t]={korai,kesz};
    await p.close();
  }

  const p=await b.newPage({viewport:{width:390,height:844}});
  p.on('pageerror',e=>hiba.push(e.message));
  p.on('console',m=>{if(m.type()==='error')hiba.push(m.text())});
  await p.goto('http://localhost:8994/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2600);

  out.valaszto=await p.evaluate(()=>{
    const box=document.getElementById("heTheme");
    const g=[...box.querySelectorAll("button")];
    const elotte=document.documentElement.getAttribute("data-theme");
    g.find(x=>x.getAttribute("aria-pressed")==="false").click();
    const utana=document.documentElement.getAttribute("data-theme");
    return {gombok:g.length, feliratok:g.map(x=>x.textContent),
            valtott:elotte!==utana, aktiv_jelolve:
              box.querySelectorAll('[aria-pressed="true"]').length===1};});

  out.gombok=await p.evaluate(()=>{
    const r={}; let hivas=[];
    const igazi=window.mpSwitchContext;
    window.mpSwitchContext=(i)=>{hivas.push(i);};
    /* NINCS mentés sehol → minden „indítás" az 1. szabad helyre megy */
    r.szabad_hely=spFreeSlot();
    hivas=[]; document.getElementById("mpSoloBtn").click();
    r.fogomb=hivas[0];
    hivas=[]; document.querySelector('.heWay[data-heway="pyr"]').click();
    r.ut_pyr={intent:hivas[0],mod:sessionStorage.getItem("magyah_start_mode")};
    hivas=[]; document.getElementById("heFootStart").click();
    r.labKezdes=hivas[0];
    /* SZIMULÁLT TELE ÁLLAPOT: minden hely foglalt */
    const igaziFree=window.spFreeSlot, igaziSave=window.spSlotSave;
    window.spFreeSlot=()=>0; window.spSlotSave=()=>({});
    hivas=[]; document.getElementById("mpSoloBtn").click();
    r.tele={indult:hivas.length, uzenet:(document.getElementById("heStartMsg").textContent||"").slice(0,60),
            lista_lathato:!document.getElementById("mpHomeRooms").classList.contains("hide")};
    /* FOLYTATÁS: a mentett helyre */
    window.spFreeSlot=()=>2; window.spSlotSave=(n)=>(n===1?{x:1}:null);
    hivas=[]; heResumeGo();
    r.folytatas=hivas[0];
    window.spFreeSlot=igaziFree; window.spSlotSave=igaziSave;
    window.mpSwitchContext=igazi;
    return r;});

  console.log(JSON.stringify(out,null,1));
  console.log("hibák:",hiba.length?hiba:"nincs");
  await b.close(); srv.kill();
})();
