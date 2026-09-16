/* PERCBÉLYEG — EGY ESEMÉNY = EGY PERC (3.9.78).

   BEJELENTETT HIBA: „Valamiért beakadt a játéknak, hogy 5-tel osztható
   percekben vannak nagyobb eséllyel az események, és ami még nagyobb gond,
   hogy ugyanabban a percben több esemény is tud lenni, ami a legrosszabb,
   hogy több gól is."

   Amit mér:
     1. a VÖDÖR-MATEK tisztán: a régi szabály (minden hívás új percet foglal,
        majd a vödör tetejére csonkol) mellett és az új mellett is — hány
        százalék lesz 5-tel osztható, és hányszor ismétlődik egy perc;
     2. hogy a `gmin` MÁR NEM FOGYASZT: egy vödrön belül hússzor hívva ugyanazt
        a percet adja, tehát a naplósor és a mérföldkő-előtag nem csúszik szét;
     3. hogy a `gminNew` a vödör KÜLÖNBÖZŐ perceit adja, amíg van hely, és hogy
        az idő közben SOHA nem lép visszafelé;
     4. hogy a 90 fölötti ág érintetlen (a „90+N" a ráadás saját eloszlásából);
     5. és ÉLESBEN, egy végigjátszott idényen: a naplóból kiolvasott
        percbélyegek eloszlása, és hogy esik-e két GÓL ugyanabban a percben. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8989'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:8989/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);

  /* ---- 1-4. A TISZTA VÖDÖR-MATEK ---- */
  const tiszta=await p.evaluate(()=>{
    const ki={};

    /* A RÉGI SZABÁLY, ÚJRAÉPÍTVE — hogy a szám, amihez hasonlítunk, ne
       emlékezetből jöjjön. Betűre az, ami 3.9.77-ig a kódban állt. */
    let regiLast=0;
    const regi=bucket=>{
      const hi=Math.max(1,bucket),lo=Math.max(1,hi-4);
      let m=lo+Math.floor(Math.random()*(hi-lo+1));
      if(m<=regiLast)m=regiLast+1;
      if(m>hi)m=hi;
      regiLast=Math.max(regiLast,m);
      return m;};

    /* Egy mérés: N hívás vödrönként, 4000 vödrön át. */
    const meres=(huz,ujVodor,n)=>{
      let oszthato=0,ossz=0,ismetlo=0,vodrok=0,vissza=0;
      for(let v=0;v<4000;v++){
        const bucket=5+5*(v%18);
        ujVodor(bucket,v);
        const latott=[];let elozo=0;
        for(let i=0;i<n;i++){
          const m=huz(bucket);
          if(m<elozo)vissza++;
          elozo=m;
          latott.push(m);ossz++;
          if(m%5===0)oszthato++;}
        if(new Set(latott).size<latott.length)ismetlo++;
        vodrok++;}
      return {oszthato:+(100*oszthato/ossz).toFixed(1),
        ismetlodo_vodor:+(100*ismetlo/vodrok).toFixed(1),
        visszafele:vissza};};

    ki.regi={};ki.uj={};
    for(const n of [1,2,3,4,5,6]){
      ki.regi[n+" hívás/vödör"]=meres(regi,(bucket,v)=>{if(v%18===0)regiLast=0;},n);
      ki.uj[n+" esemény/vödör"]=meres(gminNew,(bucket,v)=>{if(v%18===0){_lastGoalMin=0;_gbB=0;}},n);}

    /* 2. A `gmin` NEM FOGYASZT: húsz hívás egy vödrön belül. */
    _lastGoalMin=0;_gbB=0;
    const husz=[];for(let i=0;i<20;i++)husz.push(gmin(45));
    ki.gmin_nem_fogyaszt={percek:Array.from(new Set(husz)),
      mind_ugyanaz:new Set(husz).size===1,
      a_vodorben:husz.every(m=>m>=41&&m<=45)};

    /* …és hogy az esemény UTÁN a gmin az ESEMÉNY percét adja — ez az, amitől a
       naplósor és a mérföldkő-előtag ugyanarról a pillanatról beszél. */
    _lastGoalMin=0;_gbB=0;
    const esem=gminNew(45);
    ki.gmin_az_esemeny_perce={esemeny:esem,utana:gmin(45),egyezik:gmin(45)===esem};

    /* 3. A `gminNew` külön perceket ad, amíg van hely (a vödörben ÖT perc van). */
    _lastGoalMin=0;_gbB=0;
    const ot=[];for(let i=0;i<5;i++)ot.push(gminNew(45));
    ki.ot_esemeny_egy_vodorben={percek:ot,mind_kulon:new Set(ot).size===5,
      novekvo:ot.every((m,i)=>i===0||m>ot[i-1])};

    /* 4. A 90 FÖLÖTTI ÁG. */
    _lastGoalMin=0;_gbB=0;
    const raadas=[];for(let i=0;i<400;i++){_lastGoalMin=90;raadas.push(gmin(95));}
    ki.raadas={min:Math.min(...raadas),max:Math.max(...raadas),
      mind_90_folott:raadas.every(m=>m>90&&m<=100)};
    return ki;});
  console.log("VÖDÖR-MATEK:",JSON.stringify(tiszta,null,1));

  const uj1=tiszta.uj["1 esemény/vödör"],uj3=tiszta.uj["3 esemény/vödör"];
  const regi3=tiszta.regi["3 hívás/vödör"];
  console.log(tiszta.gmin_nem_fogyaszt.mind_ugyanaz?"✓ a gmin nem fogyaszt percet":"✗ a gmin még mindig léptet");
  console.log(tiszta.gmin_az_esemeny_perce.egyezik?"✓ a gmin az esemény percét adja vissza":"✗ a gmin elszakadt az eseménytől");
  console.log(tiszta.ot_esemeny_egy_vodorben.mind_kulon?"✓ öt esemény = öt külön perc":"✗ két esemény ugyanazt a percet kapta");
  console.log(tiszta.ot_esemeny_egy_vodorben.novekvo?"✓ a percek növekvő sorrendben":"✗ visszafelé lépett az idő");
  console.log(tiszta.raadas.mind_90_folott?"✓ a ráadás sávja érintetlen (91..100)":"✗ elromlott a 90+ ág");
  console.log(`  3 esemény/vödör — 5-tel osztható: RÉGI ${regi3.oszthato}%  →  ÚJ ${uj3.oszthato}%`);
  console.log(`  3 esemény/vödör — ismétlődő perc: RÉGI ${regi3.ismetlodo_vodor}%  →  ÚJ ${uj3.ismetlodo_vodor}%`);
  console.log(uj3.oszthato<30?"✓ a torzítás a véletlen szintjén (20% körül)":"✗ még mindig az 5-ösökre torlódik");
  console.log(uj3.ismetlodo_vodor<2?"✓ három esemény gyakorlatilag sosem kap azonos percet":"✗ még mindig ismétlődnek a percek");
  console.log(uj1.visszafele===0&&uj3.visszafele===0?"✓ az idő soha nem lép visszafelé":"✗ visszafelé lépett az óra");

  /* ---- 5. ÉLES MÉRÉS EGY VALÓDI IDÉNYEN ---- */
  const kat=async(id,ms)=>{await p.evaluate(i=>{const e=document.getElementById(i);if(e)e.click();},id);
    await p.waitForTimeout(ms||700);};
  const katSzoveg=async(sz,ms)=>{await p.evaluate(s=>{
    const el=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&(x.innerText||"").includes(s));
    if(el)el.click();},sz);await p.waitForTimeout(ms||700);};

  await kat("heFootStart");
  /* A mezőnyválasztón ma a hagyományos (ligapiramis) karrier áll — a kezdés
     módját a saját beállítójával váltjuk kész klubra, hogy a próba ne 15
     draft-pörgetéssel teljen. */
  await kat("modeCareerPyrBtn",1500);
  await p.evaluate(()=>{setCareerStart("club");updatePyrSetupVisibility();});
  await p.waitForTimeout(800);
  await kat("setupNextBtn",800); await kat("setupNextBtn",900);
  await kat("startBtn",1500);
  await kat("scoutSpinBtn",2500); await kat("scoutNextBtn",1500);
  /* Az első klub a listából. */
  await p.evaluate(()=>{const r=document.querySelector("#clubPickList button");if(r)r.click();});
  await p.waitForTimeout(1200);
  const hol=await p.evaluate(()=>({
    kepernyok:[...document.querySelectorAll('[id^="sc"]')].filter(e=>e.offsetParent&&!e.classList.contains("hide")).map(e=>e.id),
    slots:(typeof slots!=="undefined")?slots.filter(x=>x&&x.player).length:0}));
  console.log("KLUBVÁLASZTÁS UTÁN:",JSON.stringify(hol));

  /* A naplót elkapjuk: a percbélyeg a sor elején áll. */
  await p.evaluate(()=>{
    window.__sorok=[];
    const igazi=window.addLine;
    window.addLine=(...a)=>{try{window.__sorok.push(String(a[0]).replace(/<[^>]+>/g," "));}catch(e){}
      return igazi(...a);};});

  for(let i=0;i<60;i++){
    const kesz=await p.evaluate(()=>{
      const lat=e=>e&&e.offsetParent&&!e.classList.contains("hide")&&!e.disabled;
      for(const id of ["guideTipOk","tNudgeWhyX","mstatOk","chemOk","nameOk",
                       "coachSpinBtn","coachOk","capConfirmBtn","simGo"]){
        const e=document.getElementById(id);if(lat(e)){e.click();return false;}}
      const tilt=new Set(["homeBtn","fsBtn","installBtn","themeToggle","bondMapBtn",
        "bondMapAllBtn","kitViewBtn","guideTipOff","guideTipMore","mpProfileBtn",
        "homeSettingsBtn","homeStatsBtn","pitchSideMine","pitchSideOpp","autoBtn"]);
      const jo=[...document.querySelectorAll("button")].filter(x=>lat(x)&&!tilt.has(x.id));
      const zar=jo.find(x=>/Kész|tovább|Indul|Mehet/i.test(x.innerText||""));
      const t=zar||jo[0];
      if(t){t.click();return false;}
      const box=document.getElementById("skillAssignList");
      if(box&&box.offsetParent){
        const sor=box.querySelector("[data-imm-ajanl]")||box.querySelector(".prow");
        if(sor&&sor.offsetParent){sor.click();return false;}}
      return lat(document.getElementById("autoBtn"));});
    await p.waitForTimeout(900);
    if(kesz)break;}
  await kat("autoBtn",1500);
  await p.evaluate(()=>{const y=document.getElementById("hubTacticConfirmYes");
    if(y&&y.offsetParent)y.click();});
  await p.waitForTimeout(1200);
  for(let i=0;i<180;i++){
    const kesz=await p.evaluate(()=>(S.idx||0)>=30||!S.auto);
    if(kesz)break;
    await p.waitForTimeout(1000);}
  await p.waitForTimeout(1500);

  const eles=await p.evaluate(()=>{
    const sorok=window.__sorok||[];
    /* A percbélyeg alakja: „43'  …" vagy „90+3  …". A ráadást külön kezeljük:
       ott a rács eleve más, nem az ötperces vödör. */
    const perc=[],raadas=[];
    sorok.forEach(t=>{
      let m=/^(\d{1,2})'\s/.exec(t);
      if(m){perc.push(+m[1]);return;}
      m=/^90\+(\d{1,2})\s/.exec(t);
      if(m)raadas.push(90+ +m[1]);});
    const oszt=perc.filter(x=>x%5===0).length;
    /* GÓLSOROK egy meccsen belül: ugyanaz a perc kétszer? A napló meccsenként
       újraindul, ezt a „Kezdés" / kezdőrúgás sor jelzi — helyette a percek
       csökkenéséből ismerjük fel a meccshatárt, az sosem fordul elő menet közben. */
    const golSor=sorok.filter(t=>/^(\d{1,2})'\s|^90\+\d/.test(t)
      &&/(GÓL!|Tizenegyesgól|ÖNGÓL|SZABADRÚGÁSGÓL|Potyagól|A PADRÓL)/.test(t));
    const golPerc=golSor.map(t=>{const m=/^(\d{1,2})'/.exec(t);
      if(m)return +m[1];const r=/^90\+(\d{1,2})/.exec(t);return r?90+ +r[1]:0;});
    let dupla=0,meccsek=1,elozo=0,latott=new Set();
    golPerc.forEach(x=>{
      if(x<elozo){meccsek++;latott=new Set();}
      if(latott.has(x))dupla++;
      latott.add(x);elozo=x;});
    const hist={};for(let i=1;i<=5;i++)hist[i]=0;
    perc.forEach(x=>{const r=x%5;hist[r===0?5:r]++;});
    return {fordulo:S.idx||0,naplosorok:sorok.length,percbelyegek:perc.length,
      raadas_sorok:raadas.length,
      oszthato_otel:+(100*oszt/Math.max(1,perc.length)).toFixed(1),
      maradek_szerint:Object.fromEntries(Object.entries(hist)
        .map(([k,v])=>[k+". perc a vödörben",+(100*v/Math.max(1,perc.length)).toFixed(1)+"%"])),
      golsorok:golSor.length,gólos_meccsek:meccsek,
      azonos_percu_gol:dupla,
      pelda:golSor.slice(0,5).map(t=>t.trim().slice(0,90))};});
  console.log("ÉLES IDÉNY:",JSON.stringify(eles,null,1));
  console.log(eles.oszthato_otel<30?`✓ élesben is a véletlen szintjén (${eles.oszthato_otel}%)`
    :`✗ élesben az 5-ösökre torlódik (${eles.oszthato_otel}%)`);
  console.log(eles.azonos_percu_gol===0?"✓ egy meccsen belül nincs két azonos percű gól"
    :`✗ ${eles.azonos_percu_gol} gól kapott már meglévő percet`);
  console.log("hibák:",h.length?h.slice(0,5):"nincs");
  await b.close();srv.kill();
})();
