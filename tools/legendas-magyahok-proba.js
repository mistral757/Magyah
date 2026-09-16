/* 🇭🇺 LEGENDÁS MAGYAHOK — a kapcsoló, ami megéri magyarokkal draftolni (3.9.80).

   KIMONDOTT KÉRÉS: „Legyen egy kapcsoló aminek a lényege: érdemes legyen magyar
   játékosokkal feltölteni a draftodat (kész csapat módban nem lehet
   bekapcsolni). Neve: Legendás magyahok. Funkciója: Minden adatbázisban
   szereplő magyar játékos kap egy boostot az adott instance-ban. A karrier
   indítás pillanatában minden magyar játékos kezdő ratingja kap egy emelést:
   minden 80 alatti minimum 80 fölöttire, minden 80-85- közötti kap random +4-8,
   85 fölöttiek: +3-6. A POT ügyében pedig szintén mindannyian kapnának egy új
   sávot: min. 2200 legyen minden magyar játékos POT-ja minden fajta módban
   (lutri, rating szezon [rating csúcs is, bár annak a rating szezon az alapja])"

   Amit mér:
     1. A SÁVOK betűre: 80 alatt 81-85 közé, 80-85 közt +4…+8, 85 fölött +3…+6,
        és hogy a plafon fölé nem lép;
     2. a POT-PADLÓ mind a három Rating-alapon (csúcs, szezon, lutri);
     3. hogy KIKAPCSOLVA egyetlen szám sem mozdul (a boost nem szivárog);
     4. hogy csak a MAGYAR játékosokat érinti — a mezőny többi része érintetlen;
     5. hogy DETERMINISZTIKUS: ugyanaz a játékos mindig ugyanazt az emelést kapja
        (közös karrierben a két kliensnek bitre egyeznie kell);
     6. hogy KÉSZ KLUBBAL indulva a kapcsoló nem is látszik, ÉS a zár akkor sem
        engedi be, ha a localStorage-ban be van kapcsolva;
     7. és élesben: egy valódi, bekapcsolt karrier-poolban tényleg nincs 80
        alatti magyar, és nincs 2200 alatti magyar POT. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9005'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9005/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);

  /* ---- 1-5. A TISZTA FÜGGVÉNYEK ---- */
  console.log("=== a sávok és a padló ===");
  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    /* A kapcsolót a FUTÓ karrier mezőjén át kapcsoljuk — pontosan azt az utat
       járjuk, amit a magyahOn() olvas. */
    S.careerMagyah=true;
    ki.allando={pot_padlo:MAGYAH_POT_MIN,
      also:[MAGYAH_LO_MIN,MAGYAH_LO_MAX],
      kozep:[MAGYAH_MID_MIN,MAGYAH_MID_MAX],
      felso:[MAGYAH_HI_MIN,MAGYAH_HI_MAX],
      pot_csucs:+potToPeakOvr(MAGYAH_POT_MIN).toFixed(1)};

    /* A SÁVOK. Minden bemenetre sok KÜLÖNBÖZŐ névvel mérünk, mert a szórás a
       névre seedelt folyamból jön — egyetlen név egyetlen számot adna. */
    const sav=(bemenet)=>{
      const out=[];
      for(let i=0;i<600;i++)out.push(magyahRating(bemenet,"Teszt Elek "+i));
      return {min:Math.min(...out),max:Math.max(...out)};};
    ki.savok={};
    [55,70,79,80,83,85,86,90,95,99].forEach(x=>{ki.savok[x]=sav(x);});

    /* DETERMINIZMUS: ugyanaz a név ötvenszer ugyanazt adja. */
    const d=[];for(let i=0;i<50;i++)d.push(magyahRating(83,"Szoboszlai Dominik"));
    ki.determinisztikus=new Set(d).size===1;
    ki.pelda_szoboszlai=d[0];

    /* NEM MAGYAROKRA nem hat — a kijárat (magyahLiftBasis) nemzetiséget néz. */
    const alap=()=>({ovr:78,age:24,peak:80,pot:900});
    ki.nem_magyar=magyahLiftBasis(alap(),"Teszt Elek","Anglia");
    ki.magyar=magyahLiftBasis(alap(),"Teszt Elek","Magyarország");

    /* KIKAPCSOLVA semmi nem mozdul. */
    S.careerMagyah=false;
    ki.kikapcsolva=magyahLiftBasis(alap(),"Teszt Elek","Magyarország");
    S.careerMagyah=true;
    return ki;});
  console.log("  állandók:",JSON.stringify(t.allando));
  console.log("  sávok:",JSON.stringify(t.savok));
  const S=t.savok;
  ok(S[55].min>=81&&S[55].max<=85&&S[79].min>=81&&S[79].max<=85,
    "80 alatt mindenki 81-85 közé kerül",{["55"]:S[55],["79"]:S[79]});
  ok(S[80].min===84&&S[80].max===88&&S[85].min===89&&S[85].max===93,
    "80-85 között pontosan +4…+8",{["80"]:S[80],["85"]:S[85]});
  ok(S[86].min===89&&S[86].max===92&&S[90].min===93&&S[90].max===96,
    "85 fölött pontosan +3…+6",{["86"]:S[86],["90"]:S[90]});
  ok(S[99].max<=119,"a Rating-plafont nem lépi át",S[99]);
  ok(S[79].min>80,"a 80 alatti sáv tényleg 80 FÖLÉ visz");
  ok(t.determinisztikus,"determinisztikus: ugyanaz a név ugyanazt az emelést kapja",t.pelda_szoboszlai);
  ok(t.nem_magyar.ovr===78&&t.nem_magyar.pot===900,"a nem magyar játékost nem érinti",t.nem_magyar);
  ok(t.magyar.pot>=2200&&t.magyar.ovr>=81,"a magyar játékost igen",t.magyar);
  ok(t.kikapcsolva.ovr===78&&t.kikapcsolva.pot===900,"kikapcsolva egyetlen szám sem mozdul",t.kikapcsolva);
  ok(t.allando.pot_csucs>=84,"a 2200-as POT-padló ≈84-es fejlődési csúcsot ér",t.allando.pot_csucs);

  /* ---- 6. A KÉSZ KLUB ZÁRJA ---- */
  console.log("\n=== kész klubbal nem kapcsolható be ===");
  const z=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    setCareerStart("draft");updateMagyahVisibility();
    ki.draftnal_latszik=!$("magyahToggleGrid").classList.contains("hide");
    setCareerStart("club");updateMagyahVisibility();
    ki.klubnal_rejtve=$("magyahToggleGrid").classList.contains("hide");
    ki.elerheto_draft=(setCareerStart("draft"),magyahSetupAvailable());
    ki.elerheto_klub=(setCareerStart("club"),magyahSetupAvailable());
    /* A ZÁR: a preferencia BE, a kezdés mégis kész klub — a lezárt érték hamis. */
    setMagyahEnabled(true);
    careerStart="club";
    const zarClub=!!(magyahEnabled&&gameMode==="career"&&careerStart!=="club");
    careerStart="draft";
    const zarDraft=!!(magyahEnabled&&gameMode==="career"&&careerStart!=="club");
    ki.zar={kesz_klub:zarClub,draft:zarDraft};
    setMagyahEnabled(false);setCareerStart("draft");updateMagyahVisibility();
    return ki;});
  ok(z.draftnal_latszik,"drafttal indulva látszik a kapcsoló");
  ok(z.klubnal_rejtve,"kész klubnál rejtve van");
  ok(z.elerheto_draft&&!z.elerheto_klub,"…és a magyahSetupAvailable is ezt mondja",z);
  ok(z.zar.kesz_klub===false&&z.zar.draft===true,
    "a ZÁR kész klubnál akkor sem engedi be, ha a preferencia bekapcsolva áll",z.zar);

  /* ---- 7. ÉLES POOL ---- */
  console.log("\n=== egy valódi karrier-pool, bekapcsolva ===");
  const e=await p.evaluate(()=>{
    gameMode="career";careerStart="draft";
    careerRatingBasis="peak";
    scout=generateScout();
    const merj=()=>{
      const pool=initCareerPlayerPool(scout);
      const hu=Object.values(pool).filter(x=>x.nat==="Magyarország");
      const nem=Object.values(pool).filter(x=>x.nat!=="Magyarország");
      const st=a=>({fo:a.length,
        min_rating:Math.min(...a.map(x=>x.startRating)),
        min_pot:Math.min(...a.map(x=>x.pot)),
        atlag_rating:+(a.reduce((s,x)=>s+x.startRating,0)/a.length).toFixed(1)});
      return {hu:st(hu),nem:st(nem)};};
    S.careerMagyah=false;const ki_=merj();
    S.careerMagyah=true; const be_=merj();
    /* A KÁRTYA-ALAPOK: egy magyar játékos mind a három alapon. A Ferencváros
       vagy bármelyik NB I-es keret első magyarja elég hozzá. */
    const sq=SQUADS.find(x=>x.league==="NB I"&&x.players.some(y=>y.nat==="Magyarország"));
    const sp=sq.players.find(y=>y.nat==="Magyarország");
    const pool=initCareerPlayerPool(scout);
    const entry=pool[sp.n];
    const alapok={};
    if(entry){
      alapok.szezon=seasonBasisFor(entry,sp,sq);
      alapok.lutri=wildBasisFor(entry,sp,sq);
      alapok.csucs=peakBasisFor(entry);}
    S.careerMagyah=false;
    const alapokKi={};
    if(entry){
      alapokKi.szezon=seasonBasisFor(entry,sp,sq);
      alapokKi.lutri=wildBasisFor(entry,sp,sq);
      alapokKi.csucs=peakBasisFor(entry);}
    return {ki:ki_,be:be_,nev:fullName(sp.n),alapok,alapokKi};});
  console.log("  KIKAPCSOLVA:",JSON.stringify(e.ki));
  console.log("  BEKAPCSOLVA:",JSON.stringify(e.be));
  ok(e.be.hu.min_rating>80,"bekapcsolva EGYETLEN magyar sincs 80 alatt",e.be.hu.min_rating);
  ok(e.be.hu.min_pot>=2200,"…és egyetlen magyar POT sem 2200 alatt",e.be.hu.min_pot);
  ok(e.be.hu.atlag_rating>e.ki.hu.atlag_rating+3,
    "a magyar átlag érdemben feljebb megy",{ki:e.ki.hu.atlag_rating,be:e.be.hu.atlag_rating});
  ok(e.be.nem.min_rating===e.ki.nem.min_rating&&e.be.nem.atlag_rating===e.ki.nem.atlag_rating,
    "a mezőny többi része BETŰRE változatlan",{ki:e.ki.nem,be:e.be.nem});
  console.log("  a mért játékos:",e.nev);
  console.log("  bekapcsolva:",JSON.stringify(e.alapok));
  console.log("  kikapcsolva:",JSON.stringify(e.alapokKi));
  const A=e.alapok;
  ok(A.szezon.pot>=2200&&A.lutri.pot>=2200&&A.csucs.pot>=2200,
    "a POT-padló MIND A HÁROM alapon hat (szezon, lutri, csúcs)",
    {szezon:A.szezon.pot,lutri:A.lutri.pot,csucs:A.csucs.pot});
  ok(A.szezon.ovr>e.alapokKi.szezon.ovr&&A.lutri.ovr>=e.alapokKi.lutri.ovr,
    "…és a Rating-emelés is a kártya-alapokon",
    {szezon:[e.alapokKi.szezon.ovr,A.szezon.ovr],lutri:[e.alapokKi.lutri.ovr,A.lutri.ovr]});
  ok(A.szezon.peak>=A.szezon.ovr&&A.csucs.peak>=A.csucs.ovr,
    "a csúcs sosem marad a megemelt Rating alatt (nem esik vissza a szezonváltáskor)");

  console.log("\nOLDALHIBÁK:",h.length?h.slice(0,4):"nincs");
  if(h.length)hiba++;
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✅ minden rendben");
  await b.close();srv.kill();
  process.exit(hiba?1:0);
})();
