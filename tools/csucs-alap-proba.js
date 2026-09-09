/* ⭐ A CSÚCS-ALAP (Rating a csúcson) — a rating–POT–életkor hármas mérése (3.9.54)

   KIMONDOTT ELV, amit a próba ŐRIZ:
     „minden játékos, aki több instantban is benne van az adatbázisban, kap egy
      életkor-POT kombót mindegyik instantban (akárcsak a rating a szezonban
      módban, ami gyakorlatilag ennek a módnak az alapja), és bármelyik
      instantjában nyitod ki azt a játékost tartalmazó csapatot, te azt az
      instantját fogod megkapni, amelyik az összes instant közül a legerősebb
      volt ennél a generálásnál"

   ÉS A KÉT KÉRT VÁLTOZTATÁS:
     1. „toljuk feljebb egy 15%-kal a várható kiosztott POT-t a teljes
        adatbázisra",
     2. „a teljes adatbázisra a ténylegesen legenerált, beillesztett születési
        évekből számított életkorok és ratingok alapján számítsunk POT-t és
        életkort".

   A próba a TELJES adatbázison mér (3439 játékos, 4626 kártya, 319 klub), nem
   mintán — a kérés is a teljes adatbázisra szólt.

   Használat: node tools/csucs-alap-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8990'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8990/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    /* A cardBasisOn() a gameMode-ot IS nézi — enélkül a careerDraftPlayer a
       kanonikus pool-bejegyzést adja vissza, és a próba a semmit méri. */
    gameMode="career";
    setRatingBasis("peak");careerRatingBasis="peak";scout={stars:3};
    const pool=initCareerPlayerPool(scout);
    const nevek=Object.keys(pool);
    o.db={jatekos:nevek.length,kartya:SQUADS.reduce((s,x)=>s+x.players.length,0),klub:SQUADS.length};

    /* Melyik névnek hány kártyája van, és melyik klubokban */
    const kartyak={};
    SQUADS.forEach(sq=>sq.players.forEach(sp=>{(kartyak[sp.n]=kartyak[sp.n]||[]).push({sp,sq});}));

    /* ── 1. KANONIKUS SZEMÉLY: bármelyik klubból ugyanaz ────────────────── */
    const tobbes=nevek.filter(n=>(kartyak[n]||[]).filter(x=>!x.sq.wc).length>1);
    o.tobbkartyas=tobbes.length;
    let elter=0,nemLegjobb=0,nemLegerosebb=0;
    const pelda=[];
    tobbes.forEach(n=>{
      const e=pool[n];
      const lapok=kartyak[n].filter(x=>!x.sq.wc);
      const elso=careerDraftPlayer(e,lapok[0].sq);
      /* ugyanaz a személy MINDEN klubjából? */
      for(let i=1;i<lapok.length;i++){
        const m=careerDraftPlayer(e,lapok[i].sq);
        if(m.ovr!==elso.ovr||m.age!==elso.age||m.pot!==elso.pot||m.peak!==elso.peak){elter++;break;}}
      /* és tényleg a LEGJOBB kártyája? */
      const maxOvr=Math.max(...lapok.map(x=>Math.round(x.sp.ovr)));
      if(elso.ovr!==maxOvr)nemLegjobb++;
      /* és tényleg a LEGERŐSEBB instant? (minden kártyájára lefuttatva) */
      let legPot=-1,legOvr=-1;
      lapok.forEach(x=>{
        const bb=seasonBasisFor(e,x.sp,x.sq,{peakCard:true});
        if(bb){legPot=Math.max(legPot,Math.round(bb.pot*PEAK_POT_BONUS/10)*10);
               legOvr=Math.max(legOvr,bb.ovr);}});
      if(elso.pot<legPot-0.5||elso.ovr<legOvr-0.5)nemLegerosebb++;
      if(pelda.length<3)pelda.push({n,klubok:lapok.length,ovr:elso.ovr,age:elso.age,pot:elso.pot});});
    o.kanonikus={elter,nemLegjobb,nemLegerosebb,pelda};

    /* ── 2. A 15%-OS RÁTÉT A TELJES ADATBÁZISON ─────────────────────────── */
    let sPot=0,sNyers=0,sEst=0,csucsNemKoveti=0,ovrElter=0,n2=0;
    const kor_ismert=[],kor_becsult=[];
    nevek.forEach(n=>{
      const e=pool[n];
      const best=careerBestCardFor(n);if(!best)return;
      const nyers=seasonBasisFor(e,best.sp,best.squad,{peakCard:true});
      const kesz=peakBasisFor(e);
      if(!nyers||!kesz)return;
      n2++;
      sNyers+=nyers.pot;sPot+=kesz.pot;sEst+=kesz.estimatedPOT;
      if(potToPeakOvr(kesz.pot)>kesz.peak+0.5)csucsNemKoveti++;
      if(kesz.ovr!==Math.round(best.sp.ovr))ovrElter++;
      (BIRTH_YEAR[n]!=null?kor_ismert:kor_becsult).push(kesz.age);});
    const atl=a=>a.reduce((s,v)=>s+v,0)/a.length;
    o.ratet={db:n2,arany:Math.round(sPot/sNyers*1000)/1000,
      becsles_arany:Math.round(sEst/sPot*1000)/1000,
      csucsNemKoveti,ovrElter};

    /* ── 3. AZ ÉLETKOR FORRÁSA ─────────────────────────────────────────── */
    const q=(a,x)=>{const s=a.slice().sort((u,v)=>u-v);return s[Math.floor(s.length*x)];};
    o.kor={ismert:{db:kor_ismert.length,atl:Math.round(atl(kor_ismert)*100)/100,
                   med:q(kor_ismert,.5),p10:q(kor_ismert,.1),p90:q(kor_ismert,.9)},
           becsult:{db:kor_becsult.length,atl:Math.round(atl(kor_becsult)*100)/100,
                   med:q(kor_becsult,.5),p10:q(kor_becsult,.1),p90:q(kor_becsult,.9)}};
    o.kor.torzitas=Math.round((atl(kor_becsult)-atl(kor_ismert))*100)/100;

    /* A VALÓS születési év tényleg felülír-e mindent: egy ismert eset. */
    {const n="Lionel Messi";
     const e=pool[n];
     if(e){const best=careerBestCardFor(n);
       const y=best?seasonYear(best.squad.season):null;
       const bb=peakBasisFor(e);
       o.valos_ev={van:BIRTH_YEAR[n]!=null,ev:y,szuletes:BIRTH_YEAR[n],
         szamitott:(y!=null&&BIRTH_YEAR[n]!=null)?y-BIRTH_YEAR[n]:null,kapott:bb?bb.age:null};}}

    /* Az empirikus tábla tényleg a VALÓS korokból épül-e */
    {const E=peakAgeEmpiric();
     o.tabla={mind:E.mind.length,posztok:Object.keys(E.posztok).length,
       min:E.mind[0],max:E.mind[E.mind.length-1]};}

    /* ── 4. A TÖBBI FOKOZAT ÉRINTETLEN ─────────────────────────────────── */
    {const e=pool[nevek[0]];
     const best=careerBestCardFor(nevek[0]);
     const sz=seasonBasisFor(e,best.sp,best.squad);            /* peakCard NÉLKÜL */
     const cs=seasonBasisFor(e,best.sp,best.squad,{peakCard:true});
     o.szezon_erintetlen={pot_azonos:sz.pot===cs.pot,peak_azonos:sz.peak===cs.peak};}
    /* szezon-alap a TELJES adatbázison: nincs rajta rátét */
    {let el=0,n3=0;
     SQUADS.forEach(sq=>{if(sq.wc)return;sq.players.forEach(sp=>{
       const e=pool[sp.n];if(!e)return;n3++;
       const bb=seasonBasisFor(e,sp,sq);
       const alap=Math.max(e.pot||0,peakToPot(Math.min(ratingCap(),
         Math.max(Math.round(sp.ovr),e.refOvr!=null?e.refOvr:Math.round(sp.ovr),Math.round(e.peak||0)))));
       if(bb.pot!==alap)el++;});});
     o.szezon_teljes={kartya:n3,elter:el};}

    /* ── 5. DETERMINIZMUS ──────────────────────────────────────────────── */
    {const e=pool[nevek[7]];
     const a=peakBasisFor(e),c=peakBasisFor(e);
     o.determinizmus=JSON.stringify(a)===JSON.stringify(c);}
    return o;});

  console.log("=== adatbázis ===");
  console.log("  "+JSON.stringify(r.db));

  console.log("\n=== 1. a kanonikus személy (az ELV) ===");
  ok("több klubból ugyanaz az ember jön ki",r.kanonikus.elter===0,
     {tobbkartyas:r.tobbkartyas,elter:r.kanonikus.elter});
  ok("és mindig a LEGJOBB kártyája",r.kanonikus.nemLegjobb===0,r.kanonikus.nemLegjobb);
  ok("ami egyben a LEGERŐSEBB instantja is (minden kártyára lefuttatva)",
     r.kanonikus.nemLegerosebb===0,r.kanonikus.nemLegerosebb);
  console.log("  minta: "+JSON.stringify(r.kanonikus.pelda));

  console.log("\n=== 2. a 15%-os rátét a TELJES adatbázison ===");
  ok("a kiosztott POT 15%-kal feljebb (teljes adatbázis, ±0,5%)",
     Math.abs(r.ratet.arany-1.15)<0.005,r.ratet.arany);
  ok("a CSÚCS is követi a POT-t (nincs üres ígéret)",r.ratet.csucsNemKoveti===0,
     r.ratet.csucsNemKoveti);
  ok("a scout becslése a MEGEMELT számra vonatkozik",
     Math.abs(r.ratet.becsles_arany-1)<0.02,r.ratet.becsles_arany);
  ok("a RATING nem változott (a kártya csúcsformája marad)",r.ratet.ovrElter===0,
     r.ratet.ovrElter);

  console.log("\n=== 3. az életkor a VALÓS születési évekből ===");
  ok("a valós születési év mindent felülír (Messi csúcskártyája)",
     r.valos_ev.van===true&&r.valos_ev.kapott===r.valos_ev.szamitott,r.valos_ev);
  ok("az empirikus tábla a valós korokból épül (2000+ minta, posztonként)",
     r.tabla.mind>2000&&r.tabla.posztok>=8,r.tabla);
  ok("a BECSÜLT korok eloszlása egyezik a VALÓSAKÉVAL (torzítás < 0,5 év)",
     Math.abs(r.kor.torzitas)<0.5,{torzitas:r.kor.torzitas,
       ismert:r.kor.ismert,becsult:r.kor.becsult});
  ok("a medián és a két szélső tized is egyezik",
     r.kor.ismert.med===r.kor.becsult.med&&r.kor.ismert.p10===r.kor.becsult.p10
     &&r.kor.ismert.p90===r.kor.becsult.p90,
     {ismert:[r.kor.ismert.p10,r.kor.ismert.med,r.kor.ismert.p90],
      becsult:[r.kor.becsult.p10,r.kor.becsult.med,r.kor.becsult.p90]});

  console.log("\n=== 4. a másik két fokozat érintetlen ===");
  ok("a szezon-alap se rátétet, se csúcskártya-kort nem kap",
     r.szezon_erintetlen.pot_azonos&&r.szezon_erintetlen.peak_azonos,r.szezon_erintetlen);
  ok("és ez a TELJES adatbázis minden kártyájára igaz",
     r.szezon_teljes.elter===0,r.szezon_teljes);

  console.log("\n=== 5. determinizmus ===");
  ok("kétszer hívva bitre ugyanaz",r.determinizmus===true);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
