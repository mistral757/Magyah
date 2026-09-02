const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8965'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  await p.goto('http://localhost:8965/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={};
    // ── 1. A VENDÉG ÁTVESZI-E A HÁZIGAZDA KEZDÉSÉT? ──
    const csomag=(cs)=>({careerStart:cs,gameMode:"career",oppTargetRating:84,
      pyr:{on:true,speed:"tarto",div:3,bmin:78,bmax:86,upAmt:0,up:0}});
    careerStart="draft"; mpApplySettings(csomag("draft"));
    out.host_draft_utan_a_vendegnel=careerStart;
    careerStart="draft"; mpApplySettings(csomag("club"));
    out.host_club_utan_a_vendegnel=careerStart;
    // ── 2. AZ OSZTÁLY A KÖZÖS-E A DRAFTOS ÁGON? ──
    const L=activeSquads(); const klub=L.find(x=>x.players&&x.players.length>=11);
    const top11=klub.players.slice().sort((a,b)=>b.ovr-a.ovr).slice(0,11);
    const draftSq={club:"A drafton összeállított kereted",season:"",players:top11};
    const nezd=(mp,pendDiv)=>{
      const e0=MP.active; MP.active=!!mp;
      pyrPendingDiv=pendDiv; pyrPendingSpeed="tarto";
      pyrPickSq=null;pyrPickDiv=null;
      try{pyrOpenDivPick(draftSq);}catch(e){}
      const d=pyrPickDiv; MP.active=e0;
      try{$("scPyrDiv").classList.add("hide");}catch(e){}
      return d;};
    out.ajanlott_egyjatekosban=nezd(false,3);
    out.kozos_karrierben_D3=nezd(true,3);
    out.kozos_karrierben_D5=nezd(true,5);
    out.kozos_karrierben_D1=nezd(true,1);
    return out;});
  console.log(JSON.stringify(r,null,1));
  console.log("HIBAK:",h.length?h.slice(0,3):"nincs");
  await b.close(); srv.kill();
})();
