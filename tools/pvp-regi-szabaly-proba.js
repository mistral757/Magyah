/* A RÉGI, még közzé nem tett szabályfájl szimulálása:
   - players/$pid alatt CSAK role és ready
   - a tempo mező a szoba gyökerében: engedve (a régi rules nem tiltja) */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8937'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  await p.goto('http://localhost:8937/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1800);
  const r=await p.evaluate(async()=>{
    const out={}, tar={};
    const ENGED_PID=new Set(["role","ready"]);      // a RÉGI szabály
    const hiba=(u,v)=>{                              // az érvényesítő
      const m=/players\/([^/]+)$/.exec(u);
      if(m&&v&&typeof v==="object")
        for(const k of Object.keys(v)) if(!ENGED_PID.has(k)) return "PERMISSION_DENIED: "+k;
      if(/rooms\/[A-Z0-9]+$/.test(u)&&v&&v.players)
        for(const pid of Object.keys(v.players))
          for(const k of Object.keys(v.players[pid]||{}))
            if(!ENGED_PID.has(k)) return "PERMISSION_DENIED: players."+k;
      return null;};
    mpNet.mode="fb"; mpNet.db={};
    mpNet.fns={
      ref:(db,u)=>({u}),
      get:async(r)=>({exists:()=>!!tar[r.u],val:()=>tar[r.u]}),
      set:async(r,v)=>{const e=hiba(r.u,v);if(e)throw new Error(e);tar[r.u]=v;},
      update:async(r,v)=>{const e=hiba(r.u,v);if(e)throw new Error(e);
        tar[r.u]=Object.assign({},tar[r.u],v);},
      remove:async(r)=>{delete tar[r.u];},
      onDisconnect:(r)=>({update:async(v)=>{const e=hiba(r.u,v);if(e)throw new Error(e);},
                          cancel:async()=>{}}),
      serverTimestamp:()=>1234567890,
      onValue:()=>{}};
    _mpTempoSel="villam";
    try{ out.create=await mpBackendFb.create(); }catch(e){ out.create={hiba:e.message}; }
    const kulcs=Object.keys(tar).find(k=>/rooms\/[A-Z0-9]+$/.test(k));
    out.szoba=kulcs?{tempo:tar[kulcs].tempo,jatekos:tar[kulcs].players,
                     kod_hossz:(tar[kulcs].code||"").length}:null;
    out.jelenlet_kiirodott=Object.keys(tar).some(k=>/players\//.test(k));
    out.tars_jelenlet=mpMateOnline(kulcs?tar[kulcs]:null);
    return out;});
  console.log(JSON.stringify(r,null,1));
  console.log("HIBAK:",h.length?h.slice(0,4):"nincs");
  await b.close(); srv.kill();
})();
