/* ⚖️🤝 A BÉKE ÉS HARMÓNIA KÉT CSOPORTOS BOOSTJA (3.9.67)

   A stílus-diagnózis azt mérte ki, hogy a filozófia baja nem a nehézség,
   hanem hogy a CÉLJÁHOZ — kis szórás, egyenletes keret — nem volt eszköze: az
   átigazolás, a szezonkártyák, az ifi-boost, az ikonok és a POT-vezérelt
   fejlődés MIND a szórást növelik. Ez a két képesség az eszköz.

   A PRÓBA A SZÁMTANT MÉRI, a felhasználó SAJÁT példáival:
     · egyenlítő, 3. szint, 80 és 120 → mindkettő 115;
     · tömeg-boost, 3 emberre, a horgonynak +2 Rating és +1800 POT járna →
       1. szint: +1 (2/3 kerekítve) és +600 · 2. szint: +1 és +800 ·
       3. szint: +1 és +1000.
   Plusz a posztcsoport-szabály (a KV+VKP ember mindkét körbe befér, és a
   MEGTANULT poszt is számít), és az ár féke.

   Használat: node tools/harmonia-boost-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8931'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8931/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    gameMode="career";phase="hub";
    S.transferBudget=1e15;S.eqBoostsUsed=0;
    /* A díszlet: hat játékos, három posztcsoportban, köztük egy kétlaki. */
    careerPool={};
    /* A 250 PERCES BELÉPŐ (3.9.68) MIATT a díszlet perceket is ad: enélkül az
       egyenlítő jogosan utasítaná vissza az egész keretet. */
    S.careerStats={};
    const mk=(n,pos,ovr,pot,perc)=>{careerPool[n]={n,pos,nat:"Magyarország",startRating:ovr,
      peak:ovr,pot,attrs:null,age:26};
      S.careerStats[n]={matches:10,min:(perc==null?900:perc),g:0,a:0};
      return careerPool[n];};
    mk("Alfa Aladár",["KV"],80,3000);
    mk("Béta Bálint",["KV"],120,9000);
    mk("Gamma Gábor",["JV"],90,4000);
    mk("Delta Dénes",["CS"],100,5000);
    mk("Epszilon Elek",["KV","VKP"],95,4500);   /* kétlaki: védő ÉS középpályás */
    mk("Zéta Zoltán",["VKP"],85,3500);
    mk("Friss Ferenc",["KV"],130,9000,100);   /* 100 perc — nem vehet részt */
    window.fullCareerRoster=()=>Object.keys(careerPool).map(n=>({n,pos:careerPool[n].pos,
      ovr:careerPool[n].startRating}));
    window.currentRoster=()=>[];
    window.extraRoster=[];

    /* ── 1. POSZTCSOPORT ── */
    o.csoport={
      ketlaki:boostPosCats(careerPool["Epszilon Elek"]).sort(),
      vedo:boostPosCats(careerPool["Alfa Aladár"]),
      /* a kétlaki mindkét körbe befér */
      vedovel:boostSameGroup(careerPool["Epszilon Elek"],careerPool["Alfa Aladár"]),
      kozeppel:boostSameGroup(careerPool["Epszilon Elek"],careerPool["Zéta Zoltán"]),
      /* a védő és a középpályás viszont NEM */
      vedoKozep:boostSameGroup(careerPool["Alfa Aladár"],careerPool["Zéta Zoltán"]),
      /* a horgony köre */
      korAlfa:boostGroupMates("Alfa Aladár").sort(),
      korZeta:boostGroupMates("Zéta Zoltán").sort()};
    /* MEGTANULT POSZT: a posLearnFinish az entry.pos-ba írja — innentől
       a másik csoportba is befér. */
    careerPool["Zéta Zoltán"].pos=["CS"].concat(careerPool["Zéta Zoltán"].pos);
    o.csoport.tanultUtan=boostSameGroup(careerPool["Zéta Zoltán"],careerPool["Delta Dénes"]);
    careerPool["Zéta Zoltán"].pos=["VKP"];

    /* ── 2. AZ EGYENLÍTŐ SZÁMTANA — a felhasználó példája ── */
    const par=[careerPool["Alfa Aladár"],careerPool["Béta Bálint"]];   /* 80 és 120 */
    o.egyenlitoCel={
      lvl1:Math.round(eqTargetOf(par,1)),
      lvl2:Math.round(eqTargetOf(par,2)),
      lvl3:Math.round(eqTargetOf(par,3))};
    /* A BELÉPŐ ITT IS: a frissen igazolt 130-as ember nem húzhatja fel a célt. */
    o.perc={
      regi:eqEligible("Alfa Aladár"),friss:eqEligible("Friss Ferenc"),
      celFrissel:Math.round(eqTargetOf(
        ["Alfa Aladár","Béta Bálint","Friss Ferenc"].filter(eqEligible)
          .map(n=>careerPool[n]),3))};
    /* ── 3. AZ EGYENLÍTŐ VÉGREHAJTÁSA ── */
    S.style={key:"harmonia",chosenSeason:1,traits:{egyenlito:3},ms:{done:{},seen:{},t:{}},star:null};
    S.style2=null;S.styleView=1;
    o.szint={eq:eqLevel()};
    const res=applyEqualizeBoost(["Alfa Aladár","Béta Bálint"],3);
    o.egyenlito={cel:res.cel,sorok:res.sorok,
      alfa:{rating:careerPool["Alfa Aladár"].startRating,peak:careerPool["Alfa Aladár"].peak,
            pot:careerPool["Alfa Aladár"].pot},
      beta:{rating:careerPool["Béta Bálint"].startRating,peak:careerPool["Béta Bálint"].peak,
            pot:careerPool["Béta Bálint"].pot}};

    /* ── 4. AZ ÁR FÉKE ── */
    const arak=[];
    S.eqBoostsUsed=0;
    for(let i=0;i<8;i++){arak.push(eqPriceMult());S.eqBoostsUsed++;}
    o.ar={lvl3:arak};
    S.style.traits.egyenlito=1;
    S.eqBoostsUsed=0;
    const arak1=[];
    for(let i=0;i<8;i++){arak1.push(eqPriceMult());S.eqBoostsUsed++;}
    o.ar.lvl1=arak1;
    S.eqBoostsUsed=0;S.style.traits.egyenlito=3;

    /* ── 5. A TÖMEG-BOOST SZÁMTANA — a felhasználó példája ── */
    S.style.traits.tomeg_boost=1;
    const terv={r:2,t:1800};
    const oszt=[];
    [1,2,3].forEach(lv=>{
      S.style.traits.tomeg_boost=lv;
      oszt.push({lvl:lv,mult:Math.round(massMult()*1000)/1000,sh:massShare(terv,3)});});
    o.tomeg={oszt};
    /* a horgony a legjobb Ratingű */
    o.horgony=massAnchor(["Gamma Gábor","Delta Dénes","Zéta Zoltán"]).n;
    /* és a szétosztás tényleg megérkezik mindenkire */
    S.style.traits.tomeg_boost=3;
    const elotte=["Gamma Gábor","Delta Dénes"].map(n=>({n,r:careerPool[n].startRating,t:careerPool[n].pot}));
    const sh=massShare({r:2,t:1800},2);
    applyMassBoost("plain",["Gamma Gábor","Delta Dénes"],sh,null);
    o.kiosztas={sh,elotte,
      utana:["Gamma Gábor","Delta Dénes"].map(n=>({n,r:careerPool[n].startRating,t:careerPool[n].pot}))};
    /* a POT-boost ága is fixen oszt */
    const potElotte=careerPool["Zéta Zoltán"].pot;
    applyMassBoost("pot",["Zéta Zoltán"],{t:777},null);
    o.potAg={elotte:potElotte,utana:careerPool["Zéta Zoltán"].pot};

    /* ── 6. A KÉPESSÉG NÉLKÜL NINCS SEMMI ── */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
    o.nelkul={eq:eqLevel(),eqOn:eqOn(),mass:massLevel(),
      massPlain:massOn("plain"),
      /* és a katalógus sem kínálja fel */
      keszlet:BOOST_KINDS.map(d=>d.k).indexOf("equal")>=0,
      ready:boostKindReady("equal")};
    /* a tömeg-boost SOSEM megy ifire/öregre/egyenlítőre */
    S.style={key:"harmonia",chosenSeason:1,traits:{tomeg_boost:3},ms:{done:{},seen:{},t:{}},star:null};
    o.kivetel={youth:massOn("youth"),old:massOn("old"),equal:massOn("equal"),
      plain:massOn("plain"),attr:massOn("attr"),pot:massOn("pot"),
      bond:massOn("bond"),skill:massOn("skill")};
    return o;});

  console.log("=== a posztcsoport ===");
  ok("a kétlaki (KV+VKP) MINDKÉT csoportba tartozik",
     r.csoport.ketlaki.join("+")==="KOZEPPALYAS+VEDO"&&r.csoport.vedovel===true
     &&r.csoport.kozeppel===true,r.csoport);
  ok("a védő és a középpályás viszont nem boostolható együtt",
     r.csoport.vedoKozep===false);
  ok("a horgony köre a SAJÁT csoportja (a kétlaki mindkettőben ott van)",
     r.csoport.korAlfa.join("|")==="Béta Bálint|Epszilon Elek|Friss Ferenc|Gamma Gábor"
     &&r.csoport.korZeta.join("|")==="Epszilon Elek",r.csoport);
  ok("a MEGTANULT poszt is számít",r.csoport.tanultUtan===true);

  console.log("\n=== az egyenlítő számtana (80 és 120) ===");
  ok("3. szint: a rés 75%-a → mindkettő 115 (a bejelentett példa)",
     r.egyenlitoCel.lvl3===115,r.egyenlitoCel);
  ok("2. szint: 50% → 110 · 1. szint: 33% → kb. 107",
     r.egyenlitoCel.lvl2===110&&r.egyenlitoCel.lvl1===107,r.egyenlitoCel);
  ok("a végrehajtás tényleg EGY számra hozza mindkettőt",
     r.egyenlito.cel===115&&r.egyenlito.alfa.rating===115&&r.egyenlito.beta.rating===115,
     r.egyenlito);
  ok("aki FELJEBB kerül, annál a pályafutás-görbe is követi",
     r.egyenlito.alfa.peak>=115,r.egyenlito.alfa);
  ok("aki LEJJEBB, annak a görbéje és a POT-ja érintetlen marad",
     r.egyenlito.beta.peak===120&&r.egyenlito.beta.pot===9000,r.egyenlito.beta);

  ok("a 250 perc alatti ember nem vehet részt (3.9.68) — a cél nem csúszik fel",
     r.perc.regi===true&&r.perc.friss===false&&r.perc.celFrissel===115,r.perc);

  console.log("\n=== az ár féke ===");
  ok("3. szinten 3 megy alapáron, utána duplázódik",
     r.ar.lvl3.join(",")==="1,1,1,2,4,8,16,32",r.ar.lvl3);
  ok("1. szinten 5 megy alapáron",
     r.ar.lvl1.join(",")==="1,1,1,1,1,2,4,8",r.ar.lvl1);

  console.log("\n=== a tömeg-boost számtana (+2 Rating, +1800 POT, 3 főre) ===");
  {const t=r.tomeg.oszt;
   ok("1. szint: ×1 → fejenként +1 Rating (2/3 kerekítve) és +600 POT",
      t[0].sh.r===1&&t[0].sh.t===600,t[0]);
   ok("2. szint: ×4/3 → +1 Rating és +800 POT (a bejelentett példa)",
      Math.abs(t[1].mult-1.333)<0.01&&t[1].sh.r===1&&t[1].sh.t===800,t[1]);
   ok("3. szint: ×5/3 → +1 Rating és +1000 POT",
      Math.abs(t[2].mult-1.667)<0.01&&t[2].sh.r===1&&t[2].sh.t===1000,t[2]);}
  ok("a horgony a legjobb Ratingű kijelölt",r.horgony==="Delta Dénes",r.horgony);
  ok("és a szétosztott adag MINDENKIRE megérkezik, ugyanannyi",
     r.kiosztas.utana.every((x,i)=>x.r===r.kiosztas.elotte[i].r+r.kiosztas.sh.r
       &&x.t===r.kiosztas.elotte[i].t+r.kiosztas.sh.t),r.kiosztas);
  ok("a POT-ág is a KAPOTT számot adja, nem sorsol újra",
     r.potAg.utana-r.potAg.elotte===777,r.potAg);

  console.log("\n=== a képesség nélkül ===");
  ok("más filozófiánál az egyenlítő nem létezik",
     r.nelkul.eq===0&&r.nelkul.eqOn===false&&r.nelkul.ready===false,r.nelkul);
  ok("és a tömeg-kérdés sem jön elő",
     r.nelkul.mass===0&&r.nelkul.massPlain===false,r.nelkul);
  ok("a tömeg-boost az ifire, az öregre és az egyenlítőre SOSEM megy",
     r.kivetel.youth===false&&r.kivetel.old===false&&r.kivetel.equal===false,r.kivetel);
  ok("a másik ötre viszont igen",
     r.kivetel.plain&&r.kivetel.attr&&r.kivetel.pot&&r.kivetel.bond&&r.kivetel.skill,r.kivetel);

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
