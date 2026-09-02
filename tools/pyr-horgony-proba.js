const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8969'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage(); const h=[];
  p.on('pageerror',e=>h.push(e.message));
  await p.goto('http://localhost:8969/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  const r=await p.evaluate(()=>{
    const out={};
    const L=activeSquads(); const klub=L.find(x=>x.players&&x.players.length>=11);
    // egy közös piramis-világ felépítése, ahogy a pyrStart adja
    const vilag=(gapWant)=>{
      S.pyr=null;S.idx=0;gameMode="career";careerStart="draft";drafted.clear();
      try{careerPool=null;}catch(e){} try{scout=null;}catch(e){}
      const e0=window.h2hRoomActive; window.h2hRoomActive=()=>true;
      pyrWantedGap=gapWant;
      try{pyrStart(3,"tarto",klub,0);}catch(e){}
      window.h2hRoomActive=e0;
      return S.pyr;};
    // ── 1. UGYANAZ A KÉT SZÁM → UGYANAZ A VILÁG? ──
    const futas=(myStr,mateStr,gapWant)=>{
      vilag(gapWant);
      const elotteSzint=pyrLevel();
      const a=pyrAnchorShared(myStr,mateStr);
      return {kezdo:elotteSzint,szint:pyrLevel(),shift:S.pyr.worldShift,
              moved:a&&a.moved,res_utana:a&&a.utana,want:a&&a.want};};
    // A KÉT KLIENS: ugyanaz a két szám, csak FELCSERÉLT sorrendben
    out.hostA=futas(86,80,0);
    out.guestA=futas(80,86,0);      // a másik oldal ugyanezt látja
    out.egyezik_A=JSON.stringify(out.hostA)===JSON.stringify(out.guestA);
    // ── 2. A KÉRT RÉST TARTJA-E? ──
    out.res0 =futas(86,80, 0);
    out.res_p4=futas(86,80, 4);
    out.res_m4=futas(86,80,-4);
    // ── 3. KÉTSZER NEM FUT LE ──
    vilag(0);
    const a1=pyrAnchorShared(86,80), a2=pyrAnchorShared(86,80);
    out.masodszor=a2;
    out.elsore_mozdult=a1&&a1.moved;
    // ── 4. HIÁNYZÓ SZÁM → NEM CSINÁL SEMMIT ──
    vilag(0); out.hianyzo=pyrAnchorShared(86,undefined);
    // ── 5. A VÁGÁS ──
    vilag(0); out.elszallt=futas(200,200,0);
    return out;});
  const pp=(k)=>console.log(k.padEnd(10)+JSON.stringify(r[k]));
  console.log("=== 1. a két kliens ugyanazt kapja? ===");
  pp("hostA"); pp("guestA"); console.log("EGYEZIK: "+r.egyezik_A);
  console.log("\n=== 2. a kért rést tartja? (átlag 83) ===");
  ["res0","res_p4","res_m4"].forEach(pp);
  console.log("\n=== 3-5. ===");
  console.log("elsore_mozdult:",r.elsore_mozdult," masodszor:",JSON.stringify(r.masodszor));
  console.log("hianyzo szam:",JSON.stringify(r.hianyzo));
  console.log("elszallt (200 vs 200, vágással):",JSON.stringify(r.elszallt));
  console.log("\nHIBAK:",h.length?h.slice(0,3):"nincs");
  await b.close(); srv.kill();
})();
