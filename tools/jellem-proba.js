/* 🙂 A JELLEM HÁROM TENGELYE — karizma · kapcsolódás · vérmérséklet (3.9.56)

   KIMONDOTT KÉRÉS (kivonat):
     "vezetői képesség" ==> "karizma" (7 szint)
     "együttműködés"   ==> "kapcsolódás" (9 szint)
     "temperamentum"   ==> "vérmérséklet" (9 szint)
     „Fontos: ezek ugye hatással voltak a morálra, az öltözői eseményekre, a
      kapcsolatok kialakulására, a csapatkapitány értékelésére, hatására stb."
     „És vigyázz! Ahol több tulajdonságszintet soroltam van mint amennyi régen
      volt, ott integráld az új szintekhez tartozó változókat a rendszerbe."

   EZ AZ UTOLSÓ MONDAT A PRÓBA LÉTOKA. A skálák hosszabbak lettek (5→7, 6→9,
   5→9), a régi kód viszont tele volt `aggroI>=3` alakú küszöbökkel és
   ÖTELEMŰ súlytömbökkel. Ha ezek bármelyike ottmaradt volna, a hiba NÉMA:
   a hatodik-kilencedik fokozat egyszerűen kiesik a tömbből (undefined → NaN),
   vagy a küszöb a skála közepét kezdi „forró fejnek" nézni.

   Használat: node tools/jellem-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8999'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8999/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    o.hossz={kar:KAR_LEVELS.length,kap:KAP_LEVELS.length,ver:VER_LEVELS.length};
    o.nevek={kar:KAR_LEVELS,kap:KAP_LEVELS,ver:VER_LEVELS};
    o.sulyOssz={kar:KARW.reduce((a,b)=>a+b,0),kap:KAPW.reduce((a,b)=>a+b,0),
                ver:VERW.reduce((a,b)=>a+b,0)};
    o.sulyHossz={kar:KARW.length===KAR_LEVELS.length,kap:KAPW.length===KAP_LEVELS.length,
                 ver:VERW.length===VER_LEVELS.length};

    /* ── A SÁVOK NÉPESSÉGE a teljes adatbázison ── */
    const all=[];SQUADS.forEach(sq=>sq.players.forEach(x=>all.push(x)));
    o.db=all.length;
    const pct=f=>Math.round(all.filter(f).length/all.length*1000)/10;
    o.savok={kar_gyenge:pct(trKarGyenge),kar_vezer:pct(trKarVezer),
      kap_tort:pct(trKapTort),kap_gond:pct(trKapGond),
      kap_jo:pct(trKapJo),kap_nepszeru:pct(trKapNepszeru),
      ver_higg:pct(trVerHigg),ver_forro:pct(trVerForro)};

    /* ── MINDEN FOKOZATNAK VAN NEVE ÉS SÚLYA (a néma kiesés próbája) ── */
    let nevtelen=0,nullaSuly=0;
    [[KAR_LEVELS,KARW],[KAP_LEVELS,KAPW],[VER_LEVELS,VERW]].forEach(([L,W])=>{
      L.forEach((n,i)=>{if(!n)nevtelen++;if(!(W[i]>0))nullaSuly++;});});
    o.mindenFokozat={nevtelen,nullaSuly};

    /* ── A LAP-SÚLY MINDEN FOKOZATON VÉGES ÉS MONOTON NŐ ── */
    const piros=[],sarga=[];
    for(let i=0;i<VER_LEVELS.length;i++){
      piros.push(Math.round(redRiskOf({verI:i})*1000)/1000);
      sarga.push(Math.round(yellowRiskOf({verI:i})*1000)/1000);}
    o.lap={piros,sarga,
      veges:piros.concat(sarga).every(v=>isFinite(v)&&v>0),
      monoton:piros.every((v,i)=>i===0||v>piros[i-1])&&sarga.every((v,i)=>i===0||v>sarga[i-1]),
      vegpontok:piros[0]===0.2&&piros[piros.length-1]===3
        &&sarga[0]===0.35&&sarga[sarga.length-1]===2.4,
      kozep:piros[(VER_LEVELS.length-1)/2]===1&&sarga[(VER_LEVELS.length-1)/2]===1};

    /* ── KAPITÁNY: a jellem a pontok kétharmada, a karizma a fele ── */
    const kap=(k,p2,v,age)=>captainSuitability({karI:k,kapI:p2,verI:v,age:age||27},null);
    const K=KAR_LEVELS.length-1,P=KAP_LEVELS.length-1,V=VER_LEVELS.length-1;
    o.kapitany={
      legjobb:Math.round(kap(K,P,0,34)*10)/10,
      legrosszabb:Math.round(kap(0,0,V,22)*10)/10,
      /* karizma önmagában: a semlegesből a csúcsba lépés mennyit ér? */
      karizma_ert:Math.round((kap(K,Math.round(P/2),Math.round(V/2))-kap(0,Math.round(P/2),Math.round(V/2)))*10)/10,
      /* forró vérmérséklet: csak levon */
      forro_ar:Math.round((kap(K,P,0)-kap(K,P,V))*10)/10,
      /* monoton-e a karizmában? */
      monoton:(()=>{let e=-1e9;for(let i=0;i<=K;i++){const v=kap(i,Math.round(P/2),Math.round(V/2));if(v<=e)return false;e=v;}return true;})()};
    o.kapitanySzoveg=captainBreakdownTxt({karI:K,kapI:P,verI:0},{age:33});

    /* ── MORÁL-SMILEY: 10 fokozat, mindegyik elérhető, és az öltöző mozdítja ── */
    o.arcok=MORALE_FACES.length;
    o.arcSzoveg=MORALE_FACE_TXT.length;
    const fok=new Set();
    for(let k=0;k<=K;k++)for(let p2=0;p2<=P;p2++)for(let v=0;v<=V;v++)
      fok.add(moraleImpact({karI:k,kapI:p2,verI:v}));
    o.elerheto=[...fok].sort((a,b)=>a-b);
    gameMode="career";S.moodMark={};
    const em={n:"__proba__",karI:Math.round(K/2),kapI:Math.round(P/2),verI:Math.round(V/2)};
    const alap=moraleImpact(em);
    moodMarkAdd(em.n,-6);moodMarkAdd(em.n,-6);const le=moraleImpact(em);
    S.moodMark={};moodMarkAdd(em.n,6);moodMarkAdd(em.n,6);const fel=moraleImpact(em);
    o.oltozo={alap,le,fel,mozdul:le<alap&&fel>alap};
    /* a jegy nem szaladhat el */
    S.moodMark={};for(let i=0;i<50;i++)moodMarkAdd(em.n,-6);
    o.oltozo.plafon=Math.abs(moodMarkOf(em.n))<=0.8001;

    /* ── ÖLTÖZŐI ESEMÉNYEK: mind a 17 kiválasztható a megfelelő emberrel ── */
    o.esemenyek=PERSONALITY_EVENTS.length;
    {const keret=[];
     for(let k=0;k<=K;k++)for(let v=0;v<=V;v++)keret.push({n:"e"+k+"_"+v,karI:k,kapI:k%(P+1),verI:v,ovr:75});
     let talalt=0;
     PERSONALITY_EVENTS.forEach(e=>{
       if(e.need===1){if(keret.some(e.cond))talalt++;}
       else{const a=keret.filter(e.condA),b2=keret.filter(e.condB);
         if(a.length&&b2.length&&(a.length>1||b2.length>1||a[0]!==b2[0]))talalt++;}});
     o.esemenyTalalt=talalt;}

    /* ── A RÉGI MENTÉS ÁTVEZETÉSE: a szélsőségek szélsőségek maradnak ── */
    _saveTraitLen=SAVE_TRAIT_OLDLEN;
    const regi={a:{n:"A",leadI:4,coopI:5,aggroI:4},   /* Remek / Imádott / Lobbanékony */
                b:{n:"B",leadI:0,coopI:0,aggroI:0},   /* Gyenge / Bajkeverő / Jámbor */
                c:{n:"C",leadI:2,coopI:2,aggroI:2}};  /* mindhárom a régi közép */
    saveMigratePot(regi,0);
    o.mentes=regi;
    o.mentesJo=regi.a.karI===K&&regi.a.kapI===P&&regi.a.verI===V
      &&regi.b.karI===0&&regi.b.kapI===0&&regi.b.verI===0
      &&regi.a.leadI===undefined&&regi.a.lead===undefined;

    /* ── SEHOL NEM MARADT RÉGI MEZŐ ── */
    scout={stars:3};careerRatingBasis="peak";
    const pool=initCareerPlayerPool(scout);
    const e0=pool[Object.keys(pool)[0]];
    o.poolMezok={ujak:e0.karI!=null&&e0.kapI!=null&&e0.verI!=null,
      regiek:e0.leadI===undefined&&e0.coopI===undefined&&e0.aggroI===undefined
        &&e0.lead===undefined&&e0.coop===undefined&&e0.aggro===undefined};
    o.kartyaMezok=(()=>{const x=SQUADS[0].players[0];
      return x.karI!=null&&x.leadI===undefined&&x.lead===undefined;})();
    return o;});

  console.log("=== a három skála ===");
  ok("karizma 7 · kapcsolódás 9 · vérmérséklet 9 fokozat",
     r.hossz.kar===7&&r.hossz.kap===9&&r.hossz.ver===9,r.hossz);
  ok("a súlytömbök HOSSZA egyezik a listákéval (nincs kilógó fokozat)",
     r.sulyHossz.kar&&r.sulyHossz.kap&&r.sulyHossz.ver,r.sulyHossz);
  ok("minden fokozatnak van neve ÉS nem nulla súlya",
     r.mindenFokozat.nevtelen===0&&r.mindenFokozat.nullaSuly===0,r.mindenFokozat);
  ok("a kért nevek, a kért sorrendben",
     r.nevek.kar[0]==="töketlen"&&r.nevek.kar[6]==="az igazi vezető"
     &&r.nevek.kap[0]==="szorongó"&&r.nevek.kap[8]==="egy igazán jó ember"
     &&r.nevek.ver[0]==="földi béke"&&r.nevek.ver[8]==="vandál");

  console.log("\n=== a sávok népessége (a régi egyensúly) ===");
  const cel={kar_gyenge:8,kar_vezer:26,kap_tort:5,kap_gond:15,kap_jo:60,
             kap_nepszeru:32,ver_higg:32,ver_forro:32};
  Object.keys(cel).forEach(k=>{
    ok(`${k}: ${r.savok[k]}% (a régi ${cel[k]}%, ±3)`,
       Math.abs(r.savok[k]-cel[k])<=3,undefined);});

  console.log("\n=== lap-hajlam a vérmérsékletből ===");
  ok("mind a 9 fokozatra véges, pozitív súly (nincs néma kiesés)",r.lap.veges,r.lap.piros);
  ok("a súly monoton nő a skálán",r.lap.monoton);
  ok("a végpontok betűre a régiek (piros 0,2…3 · sárga 0,35…2,4)",r.lap.vegpontok,
     {piros:[r.lap.piros[0],r.lap.piros[8]],sarga:[r.lap.sarga[0],r.lap.sarga[8]]});
  ok("a skála közepén pontosan 1,0 mindkettő",r.lap.kozep);

  console.log("\n=== kapitány-alkalmasság ===");
  ok("a karizmában szigorúan monoton (a jobb vezető mindig jobb kapitány)",r.kapitany.monoton);
  ok("a karizma önmagában 40 pontot ér",Math.abs(r.kapitany.karizma_ert-40)<0.5,r.kapitany.karizma_ert);
  ok("a forró vérmérséklet 8 pontot VON LE, sosem ad",
     Math.abs(r.kapitany.forro_ar-8)<0.5,r.kapitany.forro_ar);
  ok("a legjobb és a legrosszabb jelölt között több mint 60 pont",
     r.kapitany.legjobb-r.kapitany.legrosszabb>60,
     {legjobb:r.kapitany.legjobb,legrosszabb:r.kapitany.legrosszabb});
  ok("a lapon tételes bontás áll, nem egy néma szám",
     /karizma \+/.test(r.kapitanySzoveg)&&/rutin/.test(r.kapitanySzoveg));
  console.log("    "+r.kapitanySzoveg);

  console.log("\n=== morál-smiley ===");
  ok("10 arc, 10 magyarázat",r.arcok===10&&r.arcSzoveg===10,{arc:r.arcok,txt:r.arcSzoveg});
  ok("mind a 10 fokozat elérhető a jellemből",r.elerheto.length===10,r.elerheto);
  ok("az öltözőben történtek MOZDÍTJÁK a jegyet",r.oltozo.mozdul,r.oltozo);
  ok("de nem szaladhat el (plafon ±0,8)",r.oltozo.plafon);

  console.log("\n=== öltözői események ===");
  ok("mind a "+r.esemenyek+" esemény kiválasztható a megfelelő kerettel",
     r.esemenyTalalt===r.esemenyek,{talalt:r.esemenyTalalt,ossz:r.esemenyek});

  console.log("\n=== régi mentés ===");
  ok("a szélsőségek szélsőségek maradnak, a régi mezők eltűnnek",r.mentesJo,r.mentes);

  console.log("\n=== sehol nem maradt régi mező ===");
  ok("a karrier-pool az új mezőket hordozza, a régieket nem",
     r.poolMezok.ujak&&r.poolMezok.regiek,r.poolMezok);
  ok("a klubkeretek kártyái is",r.kartyaMezok===true);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
