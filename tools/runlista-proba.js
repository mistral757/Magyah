/* A RUN-RANGLISTA ŐRE — élő mérés.
   A kérdés: ha a mérföldkő feltétele IGAZ, fent van-e a Run szint a listán,
   FÜGGETLENÜL attól, lefutott-e annak idején a felvevő hívás.
   Ezért itt SOSEM hívjuk a runBoardOnPyrTitle/runBoardOnInfinity függvényeket:
   csak beállítjuk a mentett állapotot, és megnézzük, mit tesz az őr. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
(async()=>{
  const srv=spawn('python3',['-m','http.server','8997'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:390,height:844}});
  const h=[]; p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text())});
  await p.goto('http://localhost:8997/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2000);

  const o=await p.evaluate(()=>{
    const r={};
    const KEY="30-0-runboard-v1";
    const tiszta=()=>{try{localStorage.removeItem(KEY);}catch(e){}; _rbOk=null;};
    const lista=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){return [];}};
    /* minimális karrier-környezet */
    gameMode="career";
    window.worldSeed="proba-seed-1";
    S.run={startAvg:70,maxAvg:80,baseDiff:1,rerollsChosen:0,seasons:[],infinitySeason:null,ms:{}};
    S.seasonNumber=7; S.pyr=null;

    /* ── 1. NINCS MÉRFÖLDKŐ → nem kerül fel ── */
    tiszta();
    r.nincs_merfoldko={eredmeny:!!runBoardEnsure("proba"),lista:lista().length};

    /* ── 2. DINAMIKUS: az Infinity megnyílt (a mentésben), de a lista ÜRES —
           pontosan az az eset, amikor a felvevő hívás elmaradt ── */
    tiszta();
    S.run.infinitySeason=5;
    const sor=runBoardEnsure("proba-dyn");
    r.dinamikus={felkerult:!!sor, db:lista().length,
      merfoldko_szezon:sor&&sor.infSeasons, potolt:sor&&sor.potolt,
      van_potoltAt:!!(sor&&sor.potoltAt), mod:sor&&sor.mode,
      mentesbe_irva:!!(S.run.rbAt)};

    /* ── 3. IDEMPOTENS: másodszor nem duplázunk ── */
    _rbOk=null;                         /* a gyorsítótárat is megkerülve */
    r.ketszer={masodik:!!runBoardEnsure("proba-megint"), db:lista().length};

    /* ── 4. HAGYOMÁNYOS: D1 arany a piramis NAPLÓJÁBÓL (nincs pyrTitleSeason) ── */
    tiszta();
    window.worldSeed="proba-seed-2";
    S.run={startAvg:70,maxAvg:80,baseDiff:1,rerollsChosen:0,seasons:[],infinitySeason:null,ms:{}};
    /* SZÁNDÉKOSAN NINCS `on:true` — pont az a jelző hiányozhat egy
       félbemaradt betöltés után; a naplóból akkor is fel kell ismerni. */
    S.pyr={div:1,log:[{s:3,div:2,rank:4},{s:6,div:1,rank:1}]};
    const sor2=runBoardEnsure("proba-pyr");
    r.hagyomanyos={felkerult:!!sor2, mod:sor2&&sor2.mode,
      merfoldko_szezon:sor2&&sor2.infSeasons, db:lista().length};

    /* ── 5. D1-BEN INDULT, DE NEM NYERT → nem kerül fel ── */
    tiszta();
    window.worldSeed="proba-seed-3";
    S.pyr={on:true,div:1,log:[{s:1,div:1,rank:2},{s:2,div:1,rank:3}]};
    r.d1_de_nem_nyert={felkerult:!!runBoardEnsure("proba"),db:lista().length};

    /* ── 6. A LEZÁRÁS ELŐTT IS PÓTOL: runBoardOnClose eddig NULL-t adott
           vissza, ha nem volt bejegyzés — most előbb pótol, aztán frissít ── */
    tiszta();
    window.worldSeed="proba-seed-4";
    S.pyr=null;
    S.run={startAvg:70,maxAvg:80,baseDiff:1,rerollsChosen:0,seasons:[],infinitySeason:4,ms:{}};
    const zar=runBoardOnClose();
    r.lezaraskor={frissult:!!zar, db:lista().length,
      potolt:(lista()[0]||{}).potolt, zarva:!!(lista()[0]||{}).closedAt};
    return r;});

  console.log(JSON.stringify(o,null,1));
  console.log("hibák:",h.length?h:"nincs");
  await b.close(); srv.kill();
})();
