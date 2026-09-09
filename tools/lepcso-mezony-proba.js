/* 🪜 A LÉPCSŐ RÖGZÍTETT MEZŐNYE — élő mérés (3.9.53)

   BEJELENTETT HIBA (szó szerint):
     „A lépcsős módban rögzített nehézségi szinteket ígérünk az első 3 d1-es
      winig. Pl most egy karriert indítottam, 2. lépcső: rögzített 80-as
      mezőny, D3 kellene legyen, de amint indítok, felveszi a tempót velem a
      koma, és feljön kiegyenlítettbe, 84-es mezőnyre, mert én 85-ös csapatot
      építettem. Ez a működés akkor oké lenne, ha már nyitva lennének a
      beállítások és én kiegyenlített módban akarok indulni."

   A MÉRÉS LÉNYEGE, EGY MONDATBAN: a lépcsőn a MEZŐNY a vállalás, a szabad
   karrierben a RÉS — és a próba mindkettőt méri, mert a javítás akkor jó, ha
   a régi viselkedés SÉRTETLEN marad ott, ahol helyes volt.

   Hogyan: a kezdőrúgás horgonya a `teamMatchStrength()`-et olvassa, ezért a
   kereterőt egyetlen számmal állítjuk be — pont az a kérdés, hogy a mezőny
   követi-e. Minden méréshez FRISS világ épül.

   Használat: node tools/lepcso-mezony-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8983'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],pageHiba=[];
  const all=(t,ok,x)=>{if(!ok)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((ok?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  /* Friss lap adott számú D1-győzelemmel a naplóban (0-2 → lépcső, 3+ → szabad). */
  async function lap(d1){
    const p=await b.newPage({viewport:{width:390,height:844}});
    p.on('pageerror',e=>pageHiba.push(e.message));
    p.on('console',m=>{if(m.type()==='error')pageHiba.push(m.text());});
    await p.goto('http://localhost:8983/index.html',{waitUntil:'domcontentloaded'});
    await p.evaluate(n=>{
      try{localStorage.clear();
        localStorage.setItem("30-0-unlock-v1",JSON.stringify({v:1,d1:n,runs:9,
          bestRun:0,icons:0,nat:0,skills:0,maxSkills:0,panzer:false,
          seen:{welcome:1},at:Date.now()}));}catch(e){}
    },d1);
    await p.goto('http://localhost:8983/index.html',{waitUntil:'networkidle'});
    await p.waitForTimeout(2400);
    return p;}

  /* A közös mérőfej: felépít egy karriert a rendes úton (beginNewGame →
     renderPyrDivPick → pyrConfirmDiv), majd megadott kereterőkkel lefuttatja
     a kezdőrúgás horgonyát — mindig friss világon. */
  const MERES=(erok)=>{
    const o={};
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
    showChemistry=()=>{};
    const friss=()=>{
      S.pyr=null;S.idx=0;
      pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
      pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
      renderPyrDivPick();
      pyrConfirmDiv();};
    friss();
    o.allapot={fieldWant:S.pyr.fieldWant,gapWant:S.pyr.gapWant,
               div:pyrMyDivId(),mezony:pyrLevel()};
    o.kerekites=pyrLevel()===Math.round(pyrMyDivMeanRaw());
    o.sorok=[];
    erok.forEach(ero=>{
      friss();
      const eredeti=window.teamMatchStrength;
      window.teamMatchStrength=()=>ero;
      const elotte=pyrLevel();
      const futott=pyrAnchorAtKickoff();
      const utana=pyrLevel();
      const gap0=S.pyr.gap0;
      window.teamMatchStrength=eredeti;
      o.sorok.push({ero,elotte,utana,futott,gap0});});
    return o;};

  /* ── 1-2. A LÉPCSŐ: A MEZŐNY NEM MOZDUL ─────────────────────────────── */
  for(const {d1,mezo,lep} of [{d1:0,mezo:78,lep:1},{d1:1,mezo:80,lep:2},{d1:2,mezo:80,lep:3}]){
    const p=await lap(d1);
    const res=await p.evaluate(new Function("return ("+MERES.toString()+")([78,82,85,88,92])"));
    console.log(`\n=== ${lep}. lépcső · ígért mezőny ${mezo} ===`);
    all(`${lep}. lépcső: a vállalás a MEZŐNY (fieldWant), nem a rés`,
      res.allapot.fieldWant===mezo&&res.allapot.gapWant===undefined,res.allapot);
    all(`${lep}. lépcső: D3-ból indul`,res.allapot.div===3,res.allapot.div);
    all(`${lep}. lépcső: a mezőny induláskor ${mezo}`,res.allapot.mezony===mezo,res.allapot.mezony);
    all(`${lep}. lépcső: a pyrLevel a nyers átlag kerekítése`,res.kerekites===true);
    const mozdult=res.sorok.filter(x=>x.utana!==mezo);
    all(`${lep}. lépcső: MINDEN kereterőnél ${mezo} marad a mezőny (78…92)`,
      mozdult.length===0,res.sorok.map(x=>x.ero+"→"+x.utana).join(" "));
    /* a rés viszont NŐ a kereterővel — ez a javítás másik fele:
       a fölényt te építed, nem a világ adja vissza */
    const g=res.sorok.map(x=>x.gap0);
    all(`${lep}. lépcső: a RÉS a kereteddel nő (a Run-plafon valódi rést mér)`,
      g.every((v,i)=>i===0||v>g[i-1]),g);
    await p.close();}

  /* ── 3. A SZABAD KARRIER ÉRINTETLEN ─────────────────────────────────── */
  {const p=await lap(3);
   const res=await p.evaluate(new Function("return ("+MERES.toString()+")([78,85,92])"));
   console.log("\n=== szabad karrier (3 cím) — a RÉGI viselkedés ===");
   all("szabad: a vállalás a RÉS (gapWant), fieldWant nincs",
     typeof res.allapot.gapWant==="number"&&res.allapot.fieldWant===undefined,res.allapot);
   const u=res.sorok.map(x=>x.utana);
   all("szabad: a mezőny KÖVETI a keretedet (ez ott a funkció)",
     u[2]>u[0],res.sorok.map(x=>x.ero+"→"+x.utana).join(" "));
   all("szabad: a horgony le is fut",res.sorok.every(x=>x.futott===true));
   await p.close();}

  /* ── 4. KÖZÖS KARRIERBEN NEM NYÚLUNK SEMMIHEZ ───────────────────────── */
  {const p=await lap(0);
   const res=await p.evaluate(()=>{
     enterCareerSetupFromHome(true);beginNewGame();
     const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=11)[0];
     showChemistry=()=>{};
     S.pyr=null;S.idx=0;
     pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
     pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
     renderPyrDivPick();pyrConfirmDiv();
     const elotte=pyrLevel();
     const e0=window.h2hRoomActive;window.h2hRoomActive=()=>true;
     const t0=window.teamMatchStrength;window.teamMatchStrength=()=>95;
     const futott=pyrAnchorAtKickoff();
     const utana=pyrLevel();
     window.h2hRoomActive=e0;window.teamMatchStrength=t0;
     return {elotte,utana,futott};});
   console.log("\n=== közös karrier ===");
   all("közös karrier: a horgony kiszáll, a mezőny mozdulatlan",
     res.futott===false&&res.elotte===res.utana,res);
   await p.close();}

  console.log("\nOLDALHIBÁK: "+(pageHiba.length?pageHiba.slice(0,3).join(" | "):"nincs"));
  if(pageHiba.length)hiba.push("oldalhiba: "+pageHiba[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
