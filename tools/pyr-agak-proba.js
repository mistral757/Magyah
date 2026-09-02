const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8957'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  await p.goto('http://localhost:8957/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={};
    out.premium=PYR_DRAFT_PREMIUM;
    // közös alapállapot mindkét futáshoz
    const setup=()=>{ S.pyr=null; S.idx=0; gameMode="career"; careerStart="draft";
      drafted.clear(); try{careerPool=null;}catch(e){} try{scout=null;}catch(e){} };
    const futtat=(kozos)=>{
      setup();
      const eredeti=window.h2hRoomActive;
      window.h2hRoomActive=()=>kozos;
      let uzenet=null;
      try{ uzenet=pyrStart(3,"tarto",null,0); }catch(e){ uzenet="HIBA: "+e.message; }
      window.h2hRoomActive=eredeti;
      const P=S.pyr||{};
      return {uzenet:String(uzenet).slice(0,120), oppTargetRating,
        worldShift:P.worldShift, rawMean:P.rawMean, gap0:P.gap0,
        clubEff:P.clubEff===undefined?"HIÁNYZIK":P.clubEff,
        startDrag:P.startDrag===undefined?"HIÁNYZIK":P.startDrag,
        // az OSZTÁLYOM csapatai a világban, az eltolás után
        divAtlag:(()=>{const d=(P.divs||[])[2];
          return d&&d.teams?Math.round(d.teams.reduce((a,t)=>a+t.ovr,0)/d.teams.length*10)/10:null;})()};
    };
    out.solo=futtat(false);
    out.kozos=futtat(true);
    return out;});
  console.log("PYR_DRAFT_PREMIUM =",r.premium,"\n");
  const k=["uzenet","oppTargetRating","worldShift","rawMean","divAtlag","gap0","clubEff","startDrag"];
  console.log("mező".padEnd(17)+"EGYJÁTÉKOS".padEnd(26)+"KÖZÖS (PvP)");
  k.forEach(x=>console.log(String(x).padEnd(17)+String(r.solo[x]).slice(0,25).padEnd(26)+String(r.kozos[x]).slice(0,45)));
  console.log("\nHIBAK:",h.length?h.slice(0,3):"nincs");
  await b.close(); srv.kill();
})();
