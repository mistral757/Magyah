/* SÁRGA LAPOK — ÉLES MÉRÉS EGY VALÓDI SZEZONON.
   Nem részfüggvényeket hív: elindít egy karriert a felületről (kész klub,
   dinamikus mód), végigjátszatja a 30 fordulót a játék saját „Szezon
   végigjátszása" gombjával, és megszámolja, mi történt.

   Amit mér:
     · hány sárga lap esik mérkőzésenként (a cél ~1,2 csapatonként),
     · tényleg jön-e eltiltás a 3. lap után,
     · van-e két sárgából kiállítás, és jár-e utána eltiltás,
     · a lapok OKAI hogyan oszlanak meg,
     · és külön, mérésre: a reklamálás tényleg érzékeny-e a bajkeverő /
       öntörvényű típusra (yellowReasonFor, 20 000 dobás személyiségenként),
     · valamint hogy minden okhoz VAN szövegváltozat.                        */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8966'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:8966/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);

  /* ---- 1. A TISZTA FÜGGVÉNYEK (nem kell hozzá karrier) ---- */
  const tiszta=await p.evaluate(()=>{
    const ki={hatarok:{liga:YELLOW_LIMIT_LEAGUE,kupa:YELLOW_LIMIT_CUP,meccsenkent:YELLOW_PER_MATCH}};
    /* Minden okhoz van-e szöveg, és nem szállnak-e el? */
    ki.szovegek={};
    Object.keys(YELLOW_OK_TXT).forEach(ok=>{
      try{ki.szovegek[ok]=(YELLOW_TXT[ok]||[]).length;}catch(e){ki.szovegek[ok]="HIBA";}});
    /* A reklamálás személyiség-érzékenysége. A msEntry-t próbabejegyzésre
       cseréljük, hogy a coopI/aggroI tényleg az legyen, amit mérni akarunk. */
    const igazi=window.msEntry;
    const dobas=(coopI,aggroI,n)=>{
      window.msEntry=()=>({coopI,aggroI});
      const c={};
      for(let i=0;i<n;i++){const k=yellowReasonFor("X",{min:40,gf:0,ga:0,scored:false});c[k]=(c[k]||0)+1;}
      window.msEntry=igazi;
      const ossz=Object.values(c).reduce((a,x)=>a+x,0);
      const sz={};Object.keys(c).sort().forEach(k=>sz[k]=+(100*c[k]/ossz).toFixed(1));
      return sz;};
    ki.okok_bajkevero=dobas(0,2,20000);      /* Bajkeverő, higgadt */
    ki.okok_atlagos=dobas(3,2,20000);        /* Szimpatikus, higgadt */
    ki.okok_imadott=dobas(5,2,20000);        /* Imádott, higgadt */
    ki.okok_lobbanekony=dobas(3,4,20000);    /* Szimpatikus, lobbanékony */
    /* A mezlevétel csak annak jár, aki gólt szerzett — és akkor is ~1%. */
    window.msEntry=()=>({coopI:3,aggroI:2});
    let mez=0,mezNelkul=0;
    for(let i=0;i<20000;i++){
      if(yellowReasonFor("X",{min:88,gf:1,ga:1,scored:true})==="mez")mez++;
      if(yellowReasonFor("X",{min:88,gf:1,ga:1,scored:false})==="mez")mezNelkul++;}
    window.msEntry=igazi;
    ki.mez_szazalek_golszerzonel=+(100*mez/20000).toFixed(2);
    ki.mez_szazalek_gol_nelkul=+(100*mezNelkul/20000).toFixed(2);
    /* Időhúzás csak vezetésnél, a hajrában. */
    window.msEntry=()=>({coopI:3,aggroI:2});
    let ido1=0,ido2=0;
    for(let i=0;i<20000;i++){
      if(yellowReasonFor("X",{min:80,gf:2,ga:1,scored:false})==="idohuzas")ido1++;
      if(yellowReasonFor("X",{min:40,gf:2,ga:1,scored:false})==="idohuzas")ido2++;}
    window.msEntry=igazi;
    ki.idohuzas_hajraban_vezetve=+(100*ido1/20000).toFixed(2);
    ki.idohuzas_a_40_percben=+(100*ido2/20000).toFixed(2);
    return ki;});
  console.log("TISZTA FÜGGVÉNYEK:",JSON.stringify(tiszta,null,1));

  /* ---- 2. EGY VALÓDI SZEZON ---- */
  const kat=async(id,ms)=>{await p.evaluate(i=>{const e=document.getElementById(i);if(e)e.click();},id);
    await p.waitForTimeout(ms||700);};
  const katSzoveg=async(sz,ms)=>{await p.evaluate(s=>{
    const el=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&(x.innerText||"").includes(s));
    if(el)el.click();},sz);await p.waitForTimeout(ms||700);};

  await kat("heFootStart");
  await kat("modeCareerDynBtn",1200);
  await katSzoveg("Kész klub");
  await kat("startBtn",1200);
  await kat("scoutSpinBtn",2200); await kat("scoutNextBtn",1000);
  await kat("oppSpinBtn",2500);   await kat("oppNextBtn",1200);
  /* Az első klub a listából, majd a megerősítő gomb a betekintőben. */
  await p.evaluate(()=>{const r=document.querySelector("#clubPickList button");if(r)r.click();});
  await p.waitForTimeout(1000);
  await katSzoveg("Ezzel a klubbal indulok",2000);
  const hol=await p.evaluate(()=>({
    kepernyok:[...document.querySelectorAll('[id^="sc"]')].filter(e=>e.offsetParent&&!e.classList.contains("hide")).map(e=>e.id),
    slots:(typeof slots!=="undefined")?slots.filter(s=>s&&s.player).length:0,
    gombok:[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&!x.disabled)
      .map(x=>(x.id||"?")+"|"+(x.innerText||"").replace(/\n+/g,"/").slice(0,26)).slice(0,14)}));
  console.log("KLUBVÁLASZTÁS UTÁN:",JSON.stringify(hol));
  if(!hol.slots){console.log("✗ nem sikerült karriert indítani — a mérés itt megáll");
    await b.close();srv.kill();return;}

  /* A naplót elkapjuk, hogy meg tudjuk számolni a lapokat. */
  await p.evaluate(()=>{
    window.__sorok=[];
    const igazi=window.addLine;
    /* NYÍLFÜGGVÉNYBEN NINCS `arguments` — a rest paraméter kell ide, különben a
       hook minden naplósornál elszáll (mérve: „arguments is not defined"). */
    window.addLine=(...a)=>{try{window.__sorok.push(String(a[0]).replace(/<[^>]+>/g," "));}catch(e){}
      return igazi(...a);};});

  /* A karrier indulásakor tippek és a kémia-bemutató állnak az útban — ezeket
     ugyanúgy elléptetjük, ahogy a felhasználó tenné. */
  for(let i=0;i<40;i++){
    const kesz=await p.evaluate(()=>{
      const lat=e=>e&&e.offsetParent&&!e.classList.contains("hide")&&!e.disabled;
      /* A karrier-indítás lépcsője a pályaképernyőn: kémia → névadás → edző →
         kapitány → „Irány a szezon". Közben tippek és jelzések jönnek. */
      for(const id of ["guideTipOk","tNudgeWhyX","mstatOk","chemOk","nameOk",
                       "coachSpinBtn","coachOk","capConfirmBtn","simGo"]){
        const e=document.getElementById(id);if(lat(e)){e.click();return false;}}
      /* Ami nem kap azonosítót (edzőválasztás, kapitány, taktika): KIZÁRÁSSAL
         haladunk, nem felirat-találgatással. Ami nem a fejléc vagy egy nézegető
         gomb, az a továbbvivő út — a próbának mindegy, melyik edzőt kapjuk. */
      const tilt=new Set(["homeBtn","fsBtn","installBtn","themeToggle","bondMapBtn",
        "bondMapAllBtn","kitViewBtn","guideTipOff","guideTipMore","mpProfileBtn",
        "homeSettingsBtn","homeStatsBtn","pitchSideMine","pitchSideOpp","autoBtn"]);
      const jo=[...document.querySelectorAll("button")].filter(x=>lat(x)&&!tilt.has(x.id));
      /* A LEZÁRÓ GOMB ELŐBB DÖNT. A kihívás-választón öt „Elvállalom" és egy
         „Kész — tovább" áll: az elsőt nyomkodva a próba ott körözne. A
         mérésnek nem kell kihívás — az kell, hogy eljusson a szezonig. */
      const zar=jo.find(x=>/Kész|tovább|Indul|Mehet/i.test(x.innerText||""));
      const t=zar||jo[0];
      if(t){t.click();return false;}
      /* A KÉPESSÉG-KIOSZTÁS LISTÁJA NEM GOMBOKBÓL ÁLL, hanem koppintható
         sorokból — pont ezen akadt el a „meccsről meccsre" lánc is (3.9.31).
         A rendszer ajánlatát nyomjuk meg, ha meg van jelölve; ha nincs, az
         első sort. Így a próba menet közben a jelölést is kipróbálja. */
      const box=document.getElementById("skillAssignList");
      if(box&&box.offsetParent){
        const sor=box.querySelector("[data-imm-ajanl]")||box.querySelector(".prow");
        if(sor&&sor.offsetParent){sor.click();return false;}}
      return lat(document.getElementById("autoBtn"));});
    await p.waitForTimeout(900);
    if(kesz)break;}
  {const d=await p.evaluate(()=>({
    kepernyok:[...document.querySelectorAll('[id^="sc"]')].filter(e=>e.offsetParent&&!e.classList.contains("hide")).map(e=>e.id),
    gombok:[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&!x.disabled)
      .map(x=>(x.id||"?")+"|"+(x.innerText||"").replace(/\n+/g,"/").slice(0,26)).slice(0,18)}));
   console.log("AZ AUTO ELŐTT:",JSON.stringify(d));}
  await kat("autoBtn",1500);
  /* A végigjátszás megerősítést kérhet. */
  await p.evaluate(()=>{const y=document.getElementById("hubTacticConfirmYes");
    if(y&&y.offsetParent)y.click();});
  await p.waitForTimeout(1200);
  /* A végigjátszás aszinkron: megvárjuk, míg letelik a 30 forduló. */
  for(let i=0;i<180;i++){
    const kesz=await p.evaluate(()=>(S.idx||0)>=30||!S.auto);
    if(kesz)break;
    await p.waitForTimeout(1000);}
  await p.waitForTimeout(1500);

  const sz=await p.evaluate(()=>{
    const sorok=window.__sorok||[];
    const sarga=sorok.filter(t=>t.includes("🟨"));
    const lap=sarga.filter(t=>t.includes("Sárga lap"));
    const masodik=sarga.filter(t=>t.includes("MÁSODIK SÁRGA"));
    const eltiltas=sarga.filter(t=>t.includes("összegyűjtötte"));
    const piros=sorok.filter(t=>t.includes("🟥")&&t.includes("PIROS LAP"));
    const okStat={};
    Object.entries(YELLOW_OK_TXT).forEach(([k,v])=>{okStat[k]=0;});
    /* Az okot a szövegből ismerjük fel — a sorok kulcsszavaiból. */
    const kulcs={belepo:"belépő|keresztbe teszi|vitt el az emberből",
      rantas:"lerántás|elkapja a mezt|Taktikai",kez:"Kezez|kézzel",
      reklamalas:"Reklamálás|számon a bírót|rágódik",beszolas:"összeakad|odaszól",
      mueses:"műesést|színészkedik",idohuzas:"Időhúzás|messzire gurítja",
      mez:"lekapja magáról|pörgeti a mezét"};
    lap.forEach(t=>{for(const [k,rx] of Object.entries(kulcs))if(new RegExp(rx).test(t)){okStat[k]++;break;}});
    return {fordulo:S.idx||0,
      sarga_lapok:lap.length, masodik_sarga_kiallitas:masodik.length,
      eltiltas_harom_lapert:eltiltas.length, piros_lapok:piros.length,
      lap_per_meccs:+(lap.length/Math.max(1,S.idx||0)).toFixed(2),
      okok:okStat,
      szezon_szamlalo:Object.entries(S.seasonYellows||{}).sort((a,b)=>b[1]-a[1]).slice(0,5)
        .map(([n,v])=>shortName(n)+": "+v),
      gyujtes_most:Object.entries(S.yellows||{}).filter(x=>x[1]>0).map(([n,v])=>shortName(n)+": "+v),
      karrier_yc:Object.entries(S.careerStats||{}).filter(x=>x[1].yc).length,
      eltiltottak:Object.entries(S.unavailable||{}).map(([n,i])=>shortName(n)+": "+i.reason+"/"+i.matchesLeft),
      pelda_sorok:lap.slice(0,4).map(t=>t.trim().slice(0,120)),
      /* ---- LEJÁTSZOTT PERCEK (3.9.33) ----
         Ugyanez az idény a percgyűjtést is méri: a `share`-ből számolt percek
         tényleg gyűlnek-e, és hogyan viszonyulnak a meccsszám × 90-hez. A
         kezdő tizenegynél a kettő közel egyenlő; a cserénél jóval kevesebb —
         pontosan ez a különbség, amiért az egész átállás történt. */
      percek:(function(){
        const ki=[];
        Object.keys(S.seasonMinutes||{}).sort((a,b)=>(S.seasonMinutes[b]||0)-(S.seasonMinutes[a]||0))
          .forEach(n=>{
            const m=(S.seasonMatches||{})[n]||0,pc=S.seasonMinutes[n]||0;
            ki.push(`${shortName(n)}: ${pc} perc / ${m} meccs = ${(pc/Math.max(1,m)).toFixed(1)} perc/meccs`
              +` · karrier ${careerMinutesOf(n)} perc`);});
        return ki;})()};});
  console.log("EGY SZEZON:",JSON.stringify(sz,null,1));
  console.log("hibák:",h.length?h.slice(0,5):"nincs");
  await b.close();srv.kill();
})();
