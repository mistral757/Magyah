const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8921'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message)); p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8921/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={};
    const ME=mpMyId();
    // ── a KÖZÖS ÓRA ──
    out.ora={skew0:mpNow()-Date.now()};
    mpNet.skew=125000;                        // a szerver 125 mp-cel előrébb
    out.ora.skew125=Math.round((mpNow()-Date.now())/1000)+" mp";
    out.ora.stampHelyi=typeof mpStamp();       // helyi módban SZÁM kell legyen
    mpNet.skew=0;
    // ── a HÁROM ÁLLAPOT ──
    const sz=(mate)=>({players:{[ME]:{role:"host"},"MASIK":mate}});
    out.allapot={
      nincs_szoba:      mpMateOnline(null),
      egyedul:          mpMateOnline({players:{[ME]:{role:"host"}}}),
      regi_szoba:       mpMateOnline(sz({role:"guest"})),                 // nincs online mező
      online:           mpMateOnline(sz({role:"guest",online:true})),
      offline:          mpMateOnline(sz({role:"guest",online:false})),
    };
    // ── MIÓTA NINCS ITT ──
    const most=Date.now();
    out.tavol={
      nincs_adat: mpMateAwayMin(sz({online:false})),
      most:       mpMateAwayMin(sz({online:false,seenAt:most-30*1000})),
      ot_perce:   mpMateAwayMin(sz({online:false,seenAt:most-5*60*1000})),
      ket_napja:  mpMateAwayMin(sz({online:false,seenAt:most-2*24*3600*1000})),
    };
    // ── A KIÍRÁS ──
    const el=document.getElementById("h2hWaitMate");
    out.elem_letezik=!!el;
    const fest=(room)=>{_mpPresRoom=room;mpPresencePaint();
      return (el.innerText||"").replace(/\s+/g," ").trim().slice(0,74);};
    out.szoveg={
      online:  fest(sz({online:true})),
      offline: fest(sz({online:false,seenAt:most-5*60*1000})),
      regi:    fest(sz({role:"guest"})),
      nincs:   fest(null),
    };
    // ── a jelenlét-függvények léteznek-e ──
    out.fuggvenyek=["mpPresenceArm","mpPresenceClear","mpMateOnline","mpMateAwayMin",
                    "mpNow","mpStamp","mpPresenceTick","mpPresencePaint"]
      .filter(n=>typeof window[n]!=="function");
    return out;});
  console.log(JSON.stringify(r,null,1));
  console.log("HIBAK:",h.length?h.slice(0,5):"nincs");
  await b.close(); srv.kill();
})();
