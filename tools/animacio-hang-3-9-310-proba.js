/* 🎬🔊 3.9.310 — A JELENETNEK SAJÁT HANGJA VAN, A KÖZVETÍTÉS UTÁNA JÖN.

   KÉRÉS: „az animációnak legyen saját hangja. Lövés, kapufa, védés, hálóban
   a labda, szitálós, stb. Mindennek saját kis effektek időzítve az
   animációhoz. A közvetítés hangjai pedig mindig csak az animációk után
   jöjjenek, hogy ne visszajátszás szerű legyen az animáció."

   Valódi karrierben, a játék saját jelenet-lejátszójával mér:
     1. minden jelenet-sablon kap legalább egy hangjegyet (a mozgásból);
     2. a fajták saját hangja: gól → rúgás + háló (kesztyű nélkül); kapufa →
        kapufa; bravúr → kesztyű/vetődés (háló nélkül); Szitálós → bomba +
        lebegés; blokkolt lövés → tompa ütés; lap → síp + lap;
     3. a hangok a mozgással együtt szólnak (az időpont a kulcskockából jön,
        a sebesség-szorzóval együtt);
     4. jelenet közben a közvetítés sora és hangja pufferben vár, és a jelenet
        UTÁN jön ki, sorrendben — a valódi addLine + sbEv úton is;
     5. átugrott jelenetnél a hátralévő jelenet-hangok elmaradnak, a
        közvetítés viszont kijön;
     6. jelenet nélkül, gyors (auto) módban a régi út: azonnal;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9310;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a hang-kém: minden megszólalás időbélyeggel */
    window._hl=[];const h0=hang;hang=function(id){window._hl.push([performance.now(),id]);return h0.apply(this,arguments);};
    window._var=()=>new Promise(r=>{const t0=performance.now();
      const f=()=>(!_evaFut&&!_evaSor.length)||performance.now()-t0>9000?r():setTimeout(f,40);f();});
    window._elo=()=>{mevKezd({});_mev.anim=true;_mev.keret=8;S.playing=true;S.auto=false;};});
  await p.waitForTimeout(800);

  console.log("\n— 1. minden sablonnak van hangja —");
  const s1=await p.evaluate(()=>{
    const ures=[],hibas=[];
    Object.keys(EVA_SABLON).forEach(sk=>{
      const T=EVA_SABLON[sk];
      const skillId=Object.keys(EVA_SKILL_SABLON).find(k=>EVA_SKILL_SABLON[k]===sk);
      const t=Object.keys(EVA_TIPUS_SABLON).find(k=>EVA_TIPUS_SABLON[k]===sk)||((EVA_SKILL_TIPUS[skillId]||["gol"])[0]);
      const ev={t,side:"us",p:"Teszt Elek",min:30,seq:1,skill:skillId||null};
      try{const c=evaKontextus(ev);
        const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");svg.innerHTML=`<g id="evaKamera">${T.svg(c)}${evaCellaRect()}</g>`;
        const J=[];T.mozgas((sel,frames,opt)=>{if(!svg.querySelector(sel))return null;evaHangJel(J,sel,frames,Object.assign({},opt||{}),sk);return {};},c);
        if(!J.length)ures.push(sk);}catch(e){hibas.push(sk+": "+e.message);}});
    return {db:Object.keys(EVA_SABLON).length,ures,hibas};});
  ok(s1.hibas.length===0,"minden sablon végigmérhető",s1.hibas);
  ok(s1.ures.length===0,`mind a ${s1.db} sablon kap legalább egy jelenet-hangot`,s1.ures);

  console.log("\n— 2–3. a fajták saját hangja, a mozgással együtt —");
  const jelenet=ev=>p.evaluate(async ev=>{
    _elo();evaIdoSzorzo=0.5;window._hl=[];
    const t0=performance.now();evaKer(ev);await new Promise(r=>setTimeout(r,30));
    const F=_evaFut,terv=F?(F.hangJ||[]).map(x=>[Math.round(x[0]),x[1]]):[];
    await _var();
    const sz=window._hl.filter(x=>/^a[A-Z]/.test(x[1])).map(x=>[Math.round(x[0]-t0),x[1]]);
    mevVege();S.playing=false;evaIdoSzorzo=1;
    return {terv,sz,ids:sz.map(x=>x[1])};},ev);
  const E={t:"gol",side:"us",p:"Teszt Elek",min:30,seq:1};
  const rg=await jelenet(E);
  ok(rg.ids.includes("aRugas")&&rg.ids.includes("aHalo")&&!rg.ids.includes("aKesztyu"),"gól: rúgás + háló, kesztyű nélkül",rg.ids);
  const rk=await jelenet({...E,t:"kapufa",seq:2});
  ok(rk.ids.includes("aKapufa")&&!rk.ids.includes("aHalo"),"kapufa: a kapufa csendülése, háló nélkül",rk.ids);
  const rb=await jelenet({...E,t:"bravur",side:"them",seq:3});
  ok((rb.ids.includes("aKesztyu")||rb.ids.includes("aVetodes"))&&!rb.ids.includes("aHalo"),"bravúr: kesztyű / vetődés, háló nélkül",rb.ids);
  const rs=await jelenet({...E,skill:"fw_cannon",seq:4});
  ok(rs.ids.includes("aBomba")&&rs.ids.includes("aLebeg"),"Szitálós: bomba-rúgás + lebegő süvítés",rs.ids);
  const rl=await jelenet({...E,t:"blokk",side:"them",seq:5});
  ok(rl.ids.length>0,"blokk: saját hang",rl.ids);
  const rp=await jelenet({...E,t:"sarga",seq:6});
  ok(rp.ids.includes("aSipRovid")&&rp.ids.includes("aLap"),"lap: síp + a lap suhanása",rp.ids);
  /* a terv (a kulcskockákból) és a valódi megszólalás ugyanazt az időt adja */
  const elter=[rg,rk,rs].map(r=>{const m=[];r.sz.forEach(([ms,id])=>{const t=r.terv.find(x=>x[1]===id);if(t)m.push(Math.abs(ms-t[0]));});return Math.max(0,...m);});
  ok(elter.every(x=>x<200),"a hang a kulcskocka idején szól (≤200 ms eltérés, sebesség-szorzóval)",elter);
  const golRug=rg.sz.find(x=>x[1]==="aRugas"),golHalo=rg.sz.find(x=>x[1]==="aHalo");
  ok(golRug&&golHalo&&golRug[0]<golHalo[0],"a rúgás előbb szól, mint a háló",{golRug,golHalo});

  console.log("\n— 4. a közvetítés a jelenet UTÁN —");
  const r4=await p.evaluate(async()=>{
    _elo();evaIdoSzorzo=0.4;window._hl=[];
    const L=lines(),n0=L?L.children.length:0;
    goalNoteLeft=10;
    addLine(`12'  GÓL! Bomba  1:0`,"m goal");sbEv("us","goal","Bomba Béla",12);
    hangMeccs("kapufa");
    await new Promise(r=>setTimeout(r,60));
    const kozben={fut:!!_evaFut||_evaSor.length>0,sorKint:L.children.length-n0,puffer:_kozv.sorok.length,
      hangPuffer:_kozv.hangok.length,kozvHang:window._hl.filter(x=>!/^a[A-Z]/.test(x[1])).map(x=>x[1])};
    await _var();await new Promise(r=>setTimeout(r,900));
    const utolsoJel=Math.max(0,...window._hl.filter(x=>/^a[A-Z]/.test(x[1])).map(x=>x[0]));
    const kozv=window._hl.filter(x=>!/^a[A-Z]/.test(x[1]));
    const tx=[...L.children].slice(n0).map(d=>d.textContent);
    mevVege();S.playing=false;evaIdoSzorzo=1;
    return {kozben,utana:{sorKint:tx.length,tx,puffer:_kozv.sorok.length,
      kozvHang:kozv.map(x=>x[1]),mindUtana:kozv.length>0&&kozv.every(x=>x[0]>=utolsoJel)}};});
  ok(r4.kozben.fut&&r4.kozben.sorKint===0&&r4.kozben.puffer>=1,"jelenet közben a GÓL-sor nincs kint, pufferben vár",r4.kozben);
  ok(r4.kozben.kozvHang.length===0&&r4.kozben.hangPuffer>=1,"…és a közvetítés hangja sem szól még",r4.kozben);
  ok(r4.utana.puffer===0&&r4.utana.sorKint>=1&&/GÓL/.test(r4.utana.tx[0]||""),"a jelenet után a sor kijön",r4.utana);
  ok(r4.utana.mindUtana&&r4.utana.kozvHang.includes("kapufa"),"a közvetítés minden hangja az utolsó jelenet-hang UTÁN szól",r4.utana);

  console.log("\n— 5. átugrott jelenet —");
  const r5=await p.evaluate(async()=>{
    _elo();evaIdoSzorzo=1;window._hl=[];
    const L=lines(),n0=L.children.length;
    evaKer({t:"gol",side:"us",p:"Teszt Elek",min:50,seq:9});
    addLine(`50'  a közvetítés sora`,"m");hangMeccs("gol");
    await new Promise(r=>setTimeout(r,120));
    $("evAnim").click();   /* koppintás: tovább */
    const t1=performance.now();
    await new Promise(r=>setTimeout(r,2800));
    const kesoi=window._hl.filter(x=>x[0]>t1+20&&/^a[A-Z]/.test(x[1])).map(x=>x[1]);
    const r={kesoi,sor:L.children.length-n0,gol:window._hl.some(x=>x[1]==="gol")};
    mevVege();S.playing=false;return r;});
  ok(r5.kesoi.length===0,"koppintás után a hátralévő jelenet-hangok elmaradnak",r5.kesoi);
  ok(r5.sor===1&&r5.gol,"…a közvetítés sora és hangja viszont kijön",r5);

  console.log("\n— 6. a régi út: jelenet nélkül, illetve gyors módban —");
  const r6=await p.evaluate(async()=>{
    const L=lines();
    _elo();window._hl=[];let n0=L.children.length;
    addLine(`60'  sima sor`,"m");hangMeccs("gol");
    const a={sor:L.children.length-n0,hang:window._hl.map(x=>x[1])};
    /* gól-sor, amelyhez nem jön jelenet: csak a tick végéig vár */
    n0=L.children.length;addLine(`62'  GÓL! Árva  2:0`,"m goal");
    a.golAzonnal=L.children.length-n0;
    await new Promise(r=>setTimeout(r,30));a.golUtana=L.children.length-n0;
    mevVege();
    mevKezd({auto:true});S.playing=true;S.auto=true;window._hl=[];n0=L.children.length;
    _evaSor.push({t:"gol",side:"us",p:"X",min:1,seq:1});   /* egy beragadt sor sem halaszt gyors módban */
    addLine(`61'  gyors sor`,"m");
    const g={halaszt:kozvHalasztva(),sor:L.children.length-n0};
    _evaSor.length=0;mevVege();S.playing=false;S.auto=false;
    return {a,g};});
  ok(r6.a.sor===1&&r6.a.hang.includes("gol"),"jelenet nélkül: a sor és a hang azonnal",r6.a);
  ok(r6.a.golAzonnal===0&&r6.a.golUtana===1,"a jelenet nélküli gól-sor csak a tick végéig vár, aztán kimegy",r6.a);
  ok(!r6.g.halaszt&&r6.g.sor===1,"gyors (auto) módban nincs halasztás",r6.g);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
