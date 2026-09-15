/* 🎩 AZ ÚJ EDZŐ A SAJÁT ISMERTSÉGÉRŐL INDUL (3.9.77)

   BEJELENTETT KÉRDÉS/HIBA: „Amikor a csapatstílusunk edzőjét megvesszük,
   akkor ő a saját taktika ismertségéről indítja azt a taktikát […] vagy onnan
   folytatja, ahol az előző edző szintje volt? Ha onnan folytatja, akkor
   rosszul van így. Saját alap értékeiről kell induljon, kivéve ha a main
   taktikáját […] már jobban ismerte 80-asnál az előző edzővel a csapat."

   ONNAN FOLYTATTA: a styleCoachTakeOver csak az edző-objektumot cserélte,
   az S.tactics.levels-hez hozzá sem nyúlt. A karrier-INDÍTÁSNÁL ugyanez
   mindig helyes volt (initTacticsForCoach) — az edzőVÁLTÁS maradt ki belőle.

   A PRÓBA MIND A HÉT FILOZÓFUS-EDZŐT végigméri, mert a „main taktika" nem
   mindegyiknél a saját kedvence: Dárdainál a filozófia rendszere (Hosszú
   labdák) a HARMADIK kedvelt taktikája, tehát a kivétel és az alapérték
   ott válik szét egymástól.

   Használat: node tools/edzovaltas-taktika-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8985'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8985/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";S.seasonNumber=4;
    const naplo=[];window.addLine=(t)=>naplo.push(String(t));
    window.updateBar=()=>{};window.drawPitch=()=>{};
    o.kuszob={liked:TACTIC_START_LIKED,other:TACTIC_START_OTHER};

    /* a hét filozófus-edző és a hozzájuk tartozó filozófia-rendszer */
    o.edzok=Object.keys(STYLE_COACHES).map(k=>{
      const d=STYLE_COACHES[k];
      const c=COACHES.find(x=>x.n===d.name);
      return {stilus:k,nev:d.name,filozofiaTaktika:d.tactic,
        sajatSorrend:(c&&c.tactics)||[],
        /* hányadik a SAJÁT listáján a filozófia rendszere? */
        hanyadik:(c&&c.tactics)?c.tactics.indexOf(d.tactic):-1};});

    /* ---- A MÉRÉS: egy edzőváltás, adott kiinduló szintekkel ---- */
    const valt=(stilusK,kiindulo)=>{
      const d=STYLE_COACHES[stilusK];
      coach={n:"Régi Edző",tag:"a régi",ovrMod:0,moraleBase:0,
        tactics:["totalis","labdatartas","szeljatek"]};
      S.tactics={levels:Object.assign({},kiindulo),active:"totalis"};
      Object.keys(TACTICS).forEach(k=>{if(S.tactics.levels[k]==null)S.tactics.levels[k]=60;});
      naplo.length=0;
      const r0=styleCoachTakeOver(d.name,d.ic,d.tactic);
      return {valtott:r0,szintek:Object.assign({},S.tactics.levels),
        aktiv:S.tactics.active,naplo:naplo.slice(),
        edzo:coach&&coach.n};};

    /* ── 1. GUARDIOLA: a filozófia rendszere az ELSŐ kedvence ── */
    /* (a) a csapat 95-ön ismerte a Labdatartást → MEGMARAD */
    o.pepMagas=valt("tikitaka",{labdatartas:95,busz:99,kontra:88,hosszu:77});
    /* (b) a csapat 80-on ismerte → NEM marad meg, az alapértékére áll */
    o.pep80=valt("tikitaka",{labdatartas:80,busz:99,kontra:88});
    /* (c) a csapat 81-en ismerte → megmarad (a küszöb SZIGORÚAN 80 FÖLÖTT) */
    o.pep81=valt("tikitaka",{labdatartas:81,busz:99});
    /* (d) a csapat gyengén ismerte → az edző alapértékére UGRIK */
    o.pepGyenge=valt("tikitaka",{labdatartas:62,busz:99});

    /* ── 2. DÁRDAI: a filozófia rendszere a HARMADIK kedvence ── */
    /* a Hosszú labdák 95-ön → megmarad; a Kontra (az ő ELSŐ kedvence) viszont
       a saját alapértékére (80) áll vissza, akármilyen magasan volt */
    o.dardai=valt("panzer",{hosszu:95,kontra:99,busz:90,labdatartas:97});

    /* ── 3. AKI MÁR AZ EDZŐ: nem történik semmi ── */
    {const d=STYLE_COACHES.tikitaka;
     coach=COACHES.find(x=>x.n===d.name);
     S.tactics={levels:{labdatartas:95,busz:99,kontra:88},active:"busz"};
     Object.keys(TACTICS).forEach(k=>{if(S.tactics.levels[k]==null)S.tactics.levels[k]=60;});
     naplo.length=0;
     const v=styleCoachTakeOver(d.name,d.ic,d.tactic);
     o.marOEdzo={valtott:v,szintek:Object.assign({},S.tactics.levels),
       naplo:naplo.slice()};}

    /* ── 4. A KARRIER-INDÍTÁS ÚTJA VÁLTOZATLAN ── */
    {const c=COACHES.find(x=>x.n==="Pep Guardiola");
     S.tactics=null;
     initTacticsForCoach(c);
     o.indulas={szintek:Object.assign({},S.tactics.levels),aktiv:S.tactics.active};}
    return o;});

  const T=(x)=>x.szintek;
  console.log("=== a hét filozófus-edző ===");
  console.log("  " + r.edzok.map(e=>`${e.nev.split(" ").pop()}:${e.filozofiaTaktika}(#${e.hanyadik+1})`).join(" · "));
  ok("a filozófia rendszere nem mindegyiküknél a saját kedvence — van, akinél a 3.",
     r.edzok.some(e=>e.hanyadik===0)&&r.edzok.some(e=>e.hanyadik===2),
     r.edzok.map(e=>({n:e.nev,t:e.filozofiaTaktika,i:e.hanyadik})));
  ok("a küszöb az edző SAJÁT legjobbja (80), nem egy beírt szám",
     r.kuszob.liked[0]===80&&r.kuszob.other===60,r.kuszob);

  console.log("\n=== 1. Guardiola — a rendszere az első kedvence ===");
  ok("az edzőváltás megtörtént",r.pepMagas.valtott===true&&/Guardiola/.test(r.pepMagas.edzo),
     {edzo:r.pepMagas.edzo});
  ok("a 95-ös Labdatartás MEGMARAD (80 fölött ismerte)",
     T(r.pepMagas).labdatartas===95,T(r.pepMagas));
  ok("…de a TÖBBI rendszer az ő alapértékére áll: 80/76/70 és 60",
     T(r.pepMagas).totalis===76&&T(r.pepMagas).szeljatek===70
     &&T(r.pepMagas).busz===60&&T(r.pepMagas).kontra===60&&T(r.pepMagas).hosszu===60,
     T(r.pepMagas));
  ok("pontosan 80-on NEM marad meg — a küszöb szigorúan 80 FÖLÖTT van",
     T(r.pep80).labdatartas===80&&T(r.pep81).labdatartas===81,
     {n80:T(r.pep80).labdatartas,n81:T(r.pep81).labdatartas});
  ok("gyenge ismertségnél viszont FELUGRIK az edző alapértékére",
     T(r.pepGyenge).labdatartas===80,T(r.pepGyenge));

  console.log("\n=== 2. Dárdai — a rendszere a HARMADIK kedvence ===");
  ok("a Hosszú labdák 95-ön MEGMARAD, pedig az ő alapja ott csak 70",
     T(r.dardai).hosszu===95,T(r.dardai));
  ok("a Kontra viszont az ő alapértékére (80) esik vissza a 99-ről",
     T(r.dardai).kontra===80,T(r.dardai));
  ok("és a Labdatartás 97-ről 60-ra — az előző edző rutinja nem öröklődik",
     T(r.dardai).labdatartas===60&&T(r.dardai).busz===76,T(r.dardai));

  console.log("\n=== 3. az aktív rendszer és a napló ===");
  ok("a BEÁLLÍTOTT rendszerhez nem nyúlunk — az a menedzser döntése",
     r.pepMagas.aktiv==="totalis"&&r.dardai.aktiv==="totalis",
     {pep:r.pepMagas.aktiv,dardai:r.dardai.aktiv});
  ok("a napló kimondja, hogy az edzések újraindulnak",
     r.pepMagas.naplo.some(t=>/újraindulnak a saját rendszerein/.test(t)),
     {n:r.pepMagas.naplo.length});
  ok("…és külön azt is, ha a filozófia rendszere megmaradt",
     r.pepMagas.naplo.some(t=>/MEGMARAD/.test(t))
     &&!r.pepGyenge.naplo.some(t=>/MEGMARAD/.test(t)),
     {magas:r.pepMagas.naplo.filter(t=>/MEGMARAD/.test(t)).length,
      gyenge:r.pepGyenge.naplo.filter(t=>/MEGMARAD/.test(t)).length});
  ok("a napló megmutatja a mozgást (honnan hova)",
     r.dardai.naplo.some(t=>/99→80/.test(t)||/97→60/.test(t)),
     {sor:r.dardai.naplo.find(t=>/→/.test(t)&&/<b/.test(t))||""});
  ok("és kimondja, hol áll most a beállított rendszered",
     r.pepMagas.naplo.some(t=>/beállított rendszered/.test(t)));

  console.log("\n=== 4. a határok ===");
  ok("aki MÁR az edző: nincs váltás és nincs átrendezés",
     r.marOEdzo.valtott===false&&r.marOEdzo.szintek.labdatartas===95
     &&r.marOEdzo.szintek.busz===99
     &&!r.marOEdzo.naplo.some(t=>/újraindulnak/.test(t)),r.marOEdzo.szintek);
  ok("a karrier-indítás útja betűre változatlan (80/76/70 + 60, aktív az első)",
     r.indulas.szintek.labdatartas===80&&r.indulas.szintek.totalis===76
     &&r.indulas.szintek.szeljatek===70&&r.indulas.szintek.busz===60
     &&r.indulas.aktiv==="labdatartas",r.indulas);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
