#!/usr/bin/env node
/* ============================================================================
   pyramid-sim.js — A DINAMIKUS LIGAPIRAMIS MÉRŐJE
   ----------------------------------------------------------------------------
   Ez a szkript NEM a játék része. Egy tervezési mérőeszköz a készülő
   "hagyományos" (piramis) karriermódhoz: leszimulálja a 6 osztályos,
   együtt fejlődő világot, és megmondja, hogy egy adott ellenfél-fejlődési
   tempó mellett MILYEN ÍVET kap a játékos — hány szezon a feljutás, meddig
   szenved egy osztályban, kiesik-e, és mikor (ha egyáltalán) nyeri meg az
   első osztályt.

   MIÉRT KELL: az egész játékmód EGYETLEN számon áll vagy bukik — azon, hogy
   az ellenfelek milyen gyorsan fejlődnek a játékoshoz képest. Ezt nem lehet
   megérzésre belőni, mert a motor gólgörbéje EXPONENCIÁLIS (λ = 1,3·e^0,09·d),
   tehát a játszható ablak nagyon szűk: ±3-4 Rating. Aki 6-tal a mezőny alatt
   van, az MINDEN meccsét elveszíti — nem "nehéz", hanem játszhatatlan.

   A MOTOR KONSTANSAI BETŰRE az index.html-ből valók (SIM), és a bajnoki
   szimuláció ugyanazt a képletet futtatja, amit a valódi meccs.

   HASZNÁLAT
     node tools/pyramid-sim.js                  — az alap kalibrációs riport
     node tools/pyramid-sim.js gaps             — a Rating-különbség hatása
     node tools/pyramid-sim.js speeds           — a négy ellenfél-tempó íve
     node tools/pyramid-sim.js sweep            — tempó-söprés, hangoláshoz
     node tools/pyramid-sim.js bands            — a piramis sávjai az adatbázisból
     node tools/pyramid-sim.js world            — a LEGENERÁLT piramis, klubnevekkel
     node tools/pyramid-sim.js draft            — mit hoz ki egy SÚLYOZOTT draft
   Opciók (bárhol, kulcs=érték alakban):
     runs=200 seasons=20 start=6 pace=7.0 step=3.0 teams=16 up=2 down=2
============================================================================ */
"use strict";

/* ---- A MOTOR SAJÁT KONSTANSAI (index.html: const SIM=...) ---- */
const SIM={K:0.09,BASE:1.3,HOME:1.2,AWAY:-0.4,OPPSPREAD:3.5};
const lam=d=>Math.max(.15,Math.min(4.5,SIM.BASE*Math.exp(SIM.K*d)));
function poisson(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=Math.random();}while(p>L);return k-1;}
/* durva normális: három egyenletes összege, ugyanaz a minta, amit a
   chSimOne használ a kihívás-kalibrációhoz */
function norm(){return (Math.random()+Math.random()+Math.random()-1.5)/1.5;}

/* ---- PARAMÉTEREK ---- */
const ARG={};
process.argv.slice(2).forEach(a=>{const m=/^([a-z]+)=(.+)$/.exec(a);if(m)ARG[m[1]]=+m[2];});
const CMD=process.argv.slice(2).find(a=>!a.includes("="))||"report";
const P={
  runs:ARG.runs||200,        /* hány karriert szimuláljunk */
  seasons:ARG.seasons||20,   /* hány szezon hosszan */
  start:ARG.start||6,        /* melyik osztályban indul a játékos (6=legalsó) */
  pace:ARG.pace!=null?ARG.pace:7.0,  /* a JÁTÉKOS mért fejlődési üteme, Rating/szezon */
  step:ARG.step!=null?ARG.step:3.0,  /* két osztály KÖZÉPÉRTÉKE közti különbség */
  spread:ARG.spread!=null?ARG.spread:2.0, /* egy osztályon belüli szórás */
  teams:ARG.teams||16,       /* csapat / osztály (a játékossal együtt) */
  decay:ARG.decay!=null?ARG.decay:1.0,  /* a játékos ütemének évi kopása (1=nincs) */
  top:ARG.top!=null?ARG.top:0.92,       /* az AI-tempó aránya az 1. osztályban */
  up:ARG.up||2, down:ARG.down||2,
  divs:6
};

/* ============================================================================
   1. EGY BAJNOKI SZEZON — a motor saját gólgörbéjével
   ---------------------------------------------------------------------------
   Körmérkőzés oda-vissza. A hazai előny és a λ-vágás betűre a meccs-motoré.
   A visszaadott tabella a bemeneti sorrendben kapott indexekkel dolgozik, így
   a hívó tudja, ki hányadik lett.
============================================================================ */
function playSeason(strength){
  const n=strength.length;
  const T=strength.map((s,i)=>({i,s,pts:0,gd:0}));
  for(let h=0;h<n;h++)for(let a=0;a<n;a++){
    if(h===a)continue;
    const d=T[h].s-T[a].s+SIM.HOME;
    const gh=poisson(lam(d)),ga=poisson(lam(-d));
    T[h].gd+=gh-ga;T[a].gd+=ga-gh;
    if(gh>ga)T[h].pts+=3;else if(gh===ga){T[h].pts++;T[a].pts++;}else T[a].pts+=3;
  }
  T.sort((x,y)=>(y.pts-x.pts)||(y.gd-x.gd));
  return T;
}

/* ============================================================================
   2. A RATING-KÜLÖNBSÉG HATÁSA — a játszható ablak
   ---------------------------------------------------------------------------
   EZ A LEGFONTOSABB TÁBLÁZAT AZ EGÉSZ TERVBEN. Megmutatja, hogy a motor
   exponenciális gólgörbéje mellett mennyire szűk a sáv, amiben egy szezonnak
   egyáltalán tétje van.
============================================================================ */
function reportGaps(){
  console.log("\n=== A RATING-KÜLÖNBSÉG HATÁSA EGY "+P.teams+" CSAPATOS BAJNOKSÁGRA ===");
  console.log("gap = a te erőd − az osztály átlaga.  ("+P.runs+" szezon / sor)\n");
  console.log(" gap | átl.hely |  pont | bajnok% | top2(feljut)% | utolsó2(kiesik)%");
  console.log("-----+----------+-------+---------+---------------+-----------------");
  [-12,-10,-8,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,8,10].forEach(g=>{
    let rs=0,ps=0,ch=0,up=0,dn=0;
    for(let k=0;k<P.runs;k++){
      const st=[g];
      for(let i=1;i<P.teams;i++)st.push(norm()*P.spread);
      const T=playSeason(st);
      const r=T.findIndex(t=>t.i===0)+1;
      rs+=r;ps+=T[r-1].pts;
      if(r===1)ch++;if(r<=P.up)up++;if(r>P.teams-P.down)dn++;
    }
    const f=(x,w)=>String(x).padStart(w);
    console.log(f(g,4)+" |"+f((rs/P.runs).toFixed(2),9)+" |"+f((ps/P.runs).toFixed(1),6)
      +" |"+f((100*ch/P.runs).toFixed(1),8)+" |"+f((100*up/P.runs).toFixed(1),14)
      +" |"+f((100*dn/P.runs).toFixed(1),17));
  });
  console.log("\nOLVASAT: a −4 … +4 sávon KÍVÜL a szezon eldőlt, mielőtt elkezdődött.");
  console.log("Ezért az osztályok közti lépcső (step) NEM lehet nagyobb ~3-4-nél,");
  console.log("és az osztályon belüli szórás (spread) sem nagyobb ~2-2,5-nél.\n");
}

/* ============================================================================
   3. EGY TELJES KARRIER A PIRAMISBAN
   ---------------------------------------------------------------------------
   A VILÁG MODELLJE — és a terv legfontosabb felismerése:

   Ha MINDEN AI-csapat ugyanazzal az R ütemmel fejlődik, a játékos pedig
   P ütemmel, akkor a piramis ALAKJA változatlan marad, és kizárólag a
   KÜLÖNBSÉG (P − R) mozgatja a játékost fölfelé benne. Az abszolút számok
   csak kozmetika: egy 200-as Ratingű hatodosztály ugyanúgy játszik, mint egy
   71-es, ha a rések ugyanakkorák.

   EBBŐL KÖVETKEZIK: a négy ellenfél-tempó valójában NÉGY NETTÓ MÁSZÁSI ÜTEM.
   A kalibrálandó szám nem az AI sebessége, hanem a (P − R) különbség.

   AMI EZT ÁRNYALJA (és amiért mégis szimulálunk):
     · a játékos üteme nem konstans: a jó szezon több pénzt és jobb igazolást
       hoz, a rossz kevesebbet — ez visszacsatolás, ami tud spirálozni;
     · az AI-tempóban van zaj, tehát az osztályod mezőnye szezononként
       átrendeződik;
     · a fel-/kiesés lépcsőt visz a rendszerbe: egy feljutás egy csapásra
       −step-tel rontja a helyzetedet.
============================================================================ */
function divMean(d){/* d: 1=élvonal … 6=alsó. 0-hoz képest relatív skála. */
  return -(d-1)*P.step;}

/* ---- AZ AI TEMPÓJA OSZTÁLYONKÉNT ELTÉR ----
   A valóságban egy élvonalbeli klub költségvetése nagyságrendekkel nagyobb,
   mint egy megyei csapaté: fölfelé haladva a mezőny egyre gyorsabban fejlődik.
   Ez oldja meg a piramis EGYETLEN szerkezeti hibáját: az élvonal ELNYELŐ
   ÁLLAPOT (onnan nincs hova feljutni), tehát ha ott is te fejlődsz gyorsabban,
   a mód pár szezon után visszazuhan a mai "mindig nyersz" élménybe.
   A megoldás: az élvonalban az AI ÜTEME ELÉRI A TIÉDET (nettó mászás ~0), így
   a bajnoki cím ott örökre igazi verseny marad — pontosan a hagyományos
   karrier-érzet.  `topShare` = az AI-tempó aránya az 1. osztályban. */
function netFor(baseNet,div,topShare,pace){
  if(topShare==null)return baseNet;
  const topNet=pace*(1-topShare);
  const t=(P.divs-div)/(P.divs-1);        /* 0 az alsó, 1 az élvonal */
  return baseNet+(topNet-baseNet)*t;}

function simCareer(net,opt){
  opt=opt||{};
  /* A játékos ereje az OSZTÁLYOK KÖZÖS SKÁLÁJÁN. A világ együtt nő, ezért a
     világot állva hagyjuk, és csak a játékos relatív erejét mozgatjuk: ez
     matematikailag azonos, csak nem inflálódnak a számok. */
  let div=P.start;
  let str=divMean(div)+(opt.startEdge!=null?opt.startEdge:0);
  const log=[];
  let firstTop=null,firstTitle=null,relegations=0,promotions=0;
  for(let s=1;s<=P.seasons;s++){
    const st=[str-divMean(div)];
    for(let i=1;i<P.teams;i++)st.push(norm()*P.spread);
    const T=playSeason(st);
    const rank=T.findIndex(t=>t.i===0)+1;
    log.push({s,div,rank,gap:+(str-divMean(div)).toFixed(2)});
    if(div===1&&rank===1&&firstTitle==null)firstTitle=s;
    if(div===1&&firstTop==null)firstTop=s;
    /* fel-/kiesés */
    if(rank<=P.up&&div>1){div--;promotions++;}
    else if(rank>P.teams-P.down&&div<P.divs){div++;relegations++;}
    /* FEJLŐDÉS. A nettó mászás az alap; a teljesítmény ±25%-ban módosítja
       (jobb helyezés = több pénz, jobb igazolás, magasabb morál). */
    const perf=1.25-0.5*((rank-1)/(P.teams-1));
    /* A JÁTÉKOS ÜTEME IS FOGY: minden újabb Rating-pont drágább (öregedés,
       a piac lemaradása, a csökkenő hozadék). A mért runokon a 7-8. szezon
       ~5-6 pontot hozott, az 1-2. ~9-et — ezt írja le a `decay`. */
    const dec=Math.pow(P.decay,s-1);
    str+=netFor(net,div,opt.topShare,P.pace)*perf*dec;
  }
  return {log,firstTop,firstTitle,relegations,promotions,endDiv:log[log.length-1].div};
}

function summarize(net,label){
  let top=0,title=0,topSum=0,titleSum=0,rel=0,pro=0,endD=0;
  const divYears=new Array(P.divs+1).fill(0);
  let stuck=0;
  for(let k=0;k<P.runs;k++){
    const r=simCareer(net,{topShare:P.top});
    if(r.firstTop!=null){top++;topSum+=r.firstTop;}
    if(r.firstTitle!=null){title++;titleSum+=r.firstTitle;}
    rel+=r.relegations;pro+=r.promotions;endD+=r.endDiv;
    r.log.forEach(x=>divYears[x.div]++);
    if(r.endDiv>=P.start)stuck++;
  }
  const f=(x,w)=>String(x).padStart(w);
  console.log(f(label,22)
    +" |"+f(net.toFixed(1),5)
    +" |"+f((100*top/P.runs).toFixed(0)+"%",7)
    +" |"+f(top?(topSum/top).toFixed(1):"—",7)
    +" |"+f((100*title/P.runs).toFixed(0)+"%",7)
    +" |"+f(title?(titleSum/title).toFixed(1):"—",7)
    +" |"+f((pro/P.runs).toFixed(1),5)
    +" |"+f((rel/P.runs).toFixed(1),5)
    +" |"+f((endD/P.runs).toFixed(1),5)
    +" |"+f((100*stuck/P.runs).toFixed(0)+"%",7));
}

/* A NÉGY JAVASOLT FOKOZAT. Az AI-tempó a JÁTÉKOS MÉRT ÜTEMÉNEK (pace)
   arányában van megadva — így a lassított játék-tempó (Komótos/Csiga/
   Gleccser) automatikusan az AI-t is lelassítja, és nem fordul át
   halálspirálba. Lásd a docs-ban a "közös tempó-szorzó" pontot. */
const SPEEDS=[
  {k:"alvo",   n:"😴 Alvó mezőny",    share:0.50, d:"az ellenfelek lemaradnak — a mai karrier érzete"},
  {k:"lassu",  n:"🚶 Lassan követnek", share:0.68, d:"van idő építkezni, de a felső osztály nem áll meg"},
  {k:"tarto",  n:"🏃 Lépést tartanak", share:0.80, d:"ajánlott — minden feljutásért külön meg kell dolgozni"},
  {k:"kegyet", n:"🔥 Kegyetlen",       share:0.89, d:"a mezőny majdnem olyan gyors, mint te — évekig ragadhatsz"}
];

function reportSpeeds(){
  console.log("\n=== A NÉGY ELLENFÉL-FEJLŐDÉSI FOKOZAT ÍVE ===");
  console.log(`játékos-ütem: ${P.pace.toFixed(1)} Rating/szezon · osztálylépcső: ${P.step} · `
    +`indulás: ${P.start}. osztály · ${P.seasons} szezon · ${P.runs} karrier\n`);
  console.log(String("fokozat").padStart(22)+" |  net | élvon | mikor | bajnok| mikor |feljut|kiesés| vég- | ottra-");
  console.log(String("").padStart(22)+" |mászás| elér% | (szez)|  lett%| (szez)| db   | db   | oszt.| gadt%");
  console.log("-".repeat(22)+"-+------+-------+-------+-------+-------+------+------+------+-------");
  SPEEDS.forEach(sp=>summarize(P.pace*(1-sp.share),sp.n));
  console.log("\nOLVASAT:");
  console.log(" · 'net mászás' = a játékos ÉVES nettó erősödése a mezőnyhöz képest.");
  console.log(" · Ez az EGYETLEN szám, ami számít — az AI abszolút üteme csak inflálja a Ratingeket.");
  console.log(" · 'ottragadt%' = a karrier végén NEM jutott feljebb az indulási osztályánál.\n");
}

function reportSweep(){
  console.log("\n=== TEMPÓ-SÖPRÉS — a nettó mászás hangolásához ===");
  console.log(`(${P.start}. osztályból indulva, ${P.seasons} szezon, ${P.runs} karrier)\n`);
  console.log(String("nettó mászás").padStart(22)+" |  net | élvon | mikor | bajnok| mikor |feljut|kiesés| vég- | ottra-");
  console.log("-".repeat(22)+"-+------+-------+-------+-------+-------+------+------+------+-------");
  [0.4,0.8,1.2,1.6,2.0,2.5,3.0,4.0,5.0].forEach(net=>
    summarize(net,net.toFixed(1)+" Rating/szezon"));
  console.log("\nCÉLÉRTÉK-JAVASLAT: a 'Lépést tartanak' fokozat akkor jó, ha a játékos");
  console.log("~8-12 szezon alatt ér az élvonalba, és útközben legalább egyszer kiesik.\n");
}

/* ============================================================================
   4. A PIRAMIS SÁVJAI — mit tud az ADATBÁZIS
   ---------------------------------------------------------------------------
   Kiolvassa az index.html SQUADS tömbjét, és megmondja, milyen sávokra lehet
   ténylegesen felosztani a valós klubokat. Ez dönti el, hogy a tervezett
   71-91-es piramis egyáltalán megépíthető-e nyers, skálázatlan Ratingekből.
============================================================================ */
function reportBands(){
  const fs=require("fs"),path=require("path");
  const file=path.join(__dirname,"..","index.html");
  const src=fs.readFileSync(file,"utf8");
  const i=src.indexOf("const SQUADS=[");
  if(i<0){console.error("Nem találom a SQUADS tömböt az index.html-ben.");process.exit(1);}
  const j=src.indexOf("\n];",i);
  const SQUADS=(0,eval)("("+src.slice(i+"const SQUADS=".length,j+2)+")");
  const avg=sq=>{const t=sq.players.map(p=>p.ovr).sort((a,b)=>b-a).slice(0,11);
    return t.reduce((s,v)=>s+v,0)/t.length;};
  const best={};
  SQUADS.forEach(s=>{const a=avg(s);if(!best[s.club]||best[s.club].a<a)best[s.club]={club:s.club,season:s.season,a,wc:!!s.wc};});
  const all=Object.values(best).sort((x,y)=>y.a-x.a);
  console.log("\n=== AZ ADATBÁZIS TEHERBÍRÁSA ===");
  console.log(`klub-szezon: ${SQUADS.length} · egyedi klub: ${all.length} · `
    +`sáv: ${all[all.length-1].a.toFixed(1)} … ${all[0].a.toFixed(1)}\n`);
  console.log("csapat/oszt |  teljes sáv  | D1        | D2        | D3        | D4        | D5        | D6");
  [16,15,12,10].forEach(N=>{
    const need=6*N;
    if(need>all.length){console.log(String(N).padStart(11)+" | NEM ELÉG KLUB ("+need+" kellene, "+all.length+" van)");return;}
    const parts=[];
    for(let d=0;d<6;d++){const g=all.slice(d*N,d*N+N);
      parts.push((g[g.length-1].a.toFixed(1)+"-"+g[0].a.toFixed(1)).padEnd(9));}
    console.log(String(N).padStart(11)+" | "+(all[need-1].a.toFixed(1)+"…"+all[0].a.toFixed(1)).padEnd(12)
      +" | "+parts.join(" | "));
  });
  console.log("\nOLVASAT: a nyers, skálázatlan valós Ratingek NEM adnak ki 71-91-es");
  console.log("piramist — a 90 legjobb klub mindössze ~11 Rating-pontot fog át, tehát");
  console.log("két szomszédos osztály közt csak ~1,5-2 pont marad. Ha nagyobb lépcsőt");
  console.log("akarunk, az osztályokat SZÉT KELL HÚZNI (lásd a docs 'sávnyújtás' pontját).\n");
}


/* ============================================================================
   5. A LEGENERÁLT VILÁG — az index.html SAJÁT generátorával
   ---------------------------------------------------------------------------
   NEM MÁSOLAT: a `PYR-BLOKK` jelölők közti kódot közvetlenül az index.html-ből
   vágjuk ki és futtatjuk. Így nincs két, egymástól elcsúszó implementáció —
   amit itt látsz, betűre az, ami a játékban is futna.

   A blokk három dolgot kér a környezettől (SQUADS, squadAvgOvr, activeSquads),
   ezeket alább megadjuk. A wcOn()-t a válogatottak ki/be kapcsolására
   helyettesítjük: `world wc=1` bekapcsolja őket.
============================================================================ */
function loadPyrBlock(wcOn){
  const fs=require("fs"),path=require("path");
  const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
  const a=src.indexOf("/* ==== PYR-BLOKK KEZDETE");
  const b=src.indexOf("/* ==== PYR-BLOKK VÉGE ====");
  if(a<0||b<0){console.error("Nem találom a PYR-BLOKK jelölőket az index.html-ben.");process.exit(1);}
  const i=src.indexOf("const SQUADS=[");
  const j=src.indexOf("\n];",i);
  const SQUADS=(0,eval)("("+src.slice(i+"const SQUADS=".length,j+2)+")");
  const squadAvgOvr=sq=>{
    const t=sq.players.map(p=>p.ovr).sort((x,y)=>y-x).slice(0,11);
    return t.reduce((s,v)=>s+v,0)/t.length;};
  const activeSquads=()=>wcOn?SQUADS:SQUADS.filter(sq=>!sq.wc);
  const env={SQUADS,squadAvgOvr,activeSquads};
  const names=Object.keys(env);
  const body=src.slice(a,b)+"\nreturn {pyrBuildWorld,pyrDumpWorld,PYR_DIVS,PYR_TEAMS,PYR_STEP,PYR_SPREAD,PYR_TOPMEAN};";
  return new Function(...names,body)(...names.map(k=>env[k]));
}
/* Ugyanaz a determinisztikus, seedelhető folyam, amit a játék rngFor()-ja ad:
   azonos seed → azonos piramis. Enélkül nem lehetne kétszer ugyanazt megnézni. */
function seededRnd(seed){
  let h=2166136261>>>0;
  String(seed).split("").forEach(c=>{h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;});
  return function(){h+=0x6D2B79F5;let t=h;
    t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
    return ((t^(t>>>14))>>>0)/4294967296;};}

function reportWorld(){
  const P0=loadPyrBlock(!!ARG.wc);
  const seed=ARG.seed!=null?ARG.seed:1;
  const w=P0.pyrBuildWorld(seededRnd("pyr:"+seed));
  console.log("\nseed="+seed+(ARG.wc?"  (válogatottakkal)":"  (csak klubcsapatok)"));
  console.log(P0.pyrDumpWorld(w));
  /* A LÉNYEG a lista alatt: a lépcsők és a szórás — ezek döntik el, játszható-e. */
  console.log("\n── ELLENŐRZŐ SZÁMOK ──");
  console.log("oszt | közép | lépcső | szórás | a sáv alja a fölötte lévő közepéhez");
  w.divs.forEach((d,i)=>{
    const ov=d.teams.map(t=>t.ovr);
    const m=ov.reduce((s,v)=>s+v,0)/ov.length;
    const sd=Math.sqrt(ov.reduce((s,v)=>s+(v-m)*(v-m),0)/ov.length);
    const step=i?w.divs[i-1].mean-d.mean:null;
    const up=i?(d.hi-w.divs[i-1].mean):null;
    console.log(` D${d.id}  |${m.toFixed(1).padStart(6)} |`
      +(step==null?"     — ":step.toFixed(1).padStart(6)+" ")+"|"
      +sd.toFixed(2).padStart(7)+" |"
      +(up==null?"      —":up.toFixed(1).padStart(7)));});
  console.log("\nKORLÁTOK (lásd `gaps`): a lépcső <= 3,5 és a szórás <= 2,5 —");
  console.log("efölött az osztály alja már az osztály teteje ellen is esélytelen.\n");
}

/* ============================================================================
   6. A SÚLYOZOTT DRAFT — megoldja-e a draft-paradoxont?
   ---------------------------------------------------------------------------
   A PROBLÉMA (docs 4.1): egy draftolt tizenegy erősebb, mint azok a klubok,
   amikből draftoltad, mert a draft minden keretből a LEGJOBB embert emeli ki,
   a klub tábla-Ratingje viszont a saját top-11 átlaga.

   A JAVASLAT: ne a pool erejét nyomjuk le, hanem a PÖRGETÉS ESÉLYÉT toljuk el
   az alsóbb osztályok felé — a felső osztályok klubjai csak kis eséllyel
   nyílnak ki. Így megmarad a draft izgalma ("hátha most jön egy nagy név"),
   és a kezdő keret mégis az indulási osztályodhoz igazodik.

   AMIT ITT MÉRÜNK: egy 11 körös draftot szimulálunk (körönként egy pörgetés,
   a felkínált keretből a legjobb olyan játékos, aki még betöltetlen posztra
   való), és megnézzük, milyen erős tizenegy jön ki belőle.

   KÉT VÁLTOZAT, mert a piramis Ratingjei NORMALIZÁLTAK, a játékosoké nyersek:
     · NYERS      — a játékos a valós ovr-jével érkezik;
     · KLUBELTOLT — a játékos megkapja a KLUBJA eltolását (piramis − nyers),
       vagyis egy hatodosztályú klub játékosa annyival gyengébb, amennyivel a
       klubja is. Ez a `applyMarketShift` már meglévő mintája.
   A kettő közti különbség dönti el, kell-e egyáltalán eltolás.
============================================================================ */
const DRAFT_SHAPE={KP:1,VEDO:4,KOZEP:4,TAMADO:2};   /* 4-4-2 */
const POS_GROUP={KP:"KP",JV:"VEDO",BV:"VEDO",KV:"VEDO",
  VKP:"KOZEP",KKP:"KOZEP",TKP:"KOZEP",JSZ:"KOZEP",BSZ:"KOZEP",
  CS:"TAMADO","ÁÉ":"TAMADO"};
function draftOne(world,weights,shifted,rnd){
  const need=Object.assign({},DRAFT_SHAPE);
  const taken=new Set();
  const xi=[];
  /* a súlyok kumulatívan, osztályonként */
  const cum=[];let acc=0;weights.forEach(w=>{acc+=w;cum.push(acc);});
  for(let round=0;round<11;round++){
    let best=null;
    /* 3 pörgetési kísérlet: ha a kisorsolt keretben nincs használható ember,
       a játék is ingyen újrapörget (lásd squadHasUsablePlayer) */
    for(let att=0;att<3&&!best;att++){
      const x=rnd()*acc;
      let d=cum.findIndex(c=>x<=c);if(d<0)d=weights.length-1;
      const div=world.divs[d];
      const team=div.teams[Math.floor(rnd()*div.teams.length)];
      const shift=shifted?(team.ovr-team.raw):0;
      (team.players||[]).forEach(p=>{
        if(taken.has(p.n))return;
        const g=POS_GROUP[p.pos&&p.pos[0]];
        if(!g||!need[g])return;
        const v=p.ovr+shift;
        if(!best||v>best.v)best={v,n:p.n,g};});}
    if(!best)continue;
    taken.add(best.n);need[best.g]--;xi.push(best.v);}
  return xi.length?xi.reduce((s,v)=>s+v,0)/xi.length:0;
}
/* ---- A SÚLYPROFIL EGY KÉPLETBŐL ----
   Az indulási osztályodtól MÉRT TÁVOLSÁGGAL mértani ütemben csökken a
   pörgetési esély: w[d] = q^|d − indulás|. A `q` az EGYETLEN hangolható szám:
     q=1,0  — egyenletes (bármelyik klub egyforma eséllyel)
     q=0,5  — a szomszédos osztály fele akkora eséllyel
     q=0,15 — gyakorlatilag a saját osztályod, ritka kiruccanásokkal
     q=0    — kizárólag a saját osztályod
   A "hátha most jön egy nagy név" élmény ettől nem vész el: q=0,15 mellett is
   marad ~2% esély a legfelső osztály egy klubjára a hatodosztályból. */
function draftWeights(start,q){
  const w=[];
  for(let d=1;d<=6;d++)w.push(q===0?(d===start?1:0):Math.pow(q,Math.abs(d-start)));
  return w;}
function reportDraft(){
  const P0=loadPyrBlock(!!ARG.wc);
  const N=ARG.runs||300;
  /* a kereteket is oda kell adnunk a draftnak — a generátor csak a
     tábla-Ratinget adja vissza, a játékosokat innen kötjük hozzá */
  const fs=require("fs"),path=require("path");
  const src=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
  const i=src.indexOf("const SQUADS=[");const j=src.indexOf("\n];",i);
  const SQUADS=(0,eval)("("+src.slice(i+"const SQUADS=".length,j+2)+")");
  const byKey={};SQUADS.forEach(sq=>{byKey[sq.club+"|"+sq.season]=sq;});
  const world=P0.pyrBuildWorld(seededRnd("pyr:"+(ARG.seed!=null?ARG.seed:1)));
  world.divs.forEach(d=>d.teams.forEach(t=>{
    const sq=byKey[t.club+"|"+t.season];t.players=sq?sq.players:[];}));

  const start=ARG.start||6, d0=world.divs[start-1];
  console.log("\n=== MIT HOZ KI EGY SÚLYOZOTT DRAFT ===");
  console.log(`${N} draft / sor · 11 kör · 4-4-2 · indulás: D${start} `
    +`(közép ${d0.mean.toFixed(1)}) · `+(ARG.wc?"válogatottakkal":"csak klubcsapatok"));
  console.log("Az osztályok közepe:  "
    +world.divs.map(d=>`D${d.id} ${d.mean.toFixed(1)}`).join(" · "));
  console.log("\n   q  | esély a saját oszt.-ra | kezdő XI nyers | klubeltolt | RÉS a saját osztályhoz");
  console.log("------+------------------------+----------------+------------+-----------------------");
  [1,0.7,0.5,0.35,0.25,0.15,0.08,0].forEach(q=>{
    const w=draftWeights(start,q);
    const tot=w.reduce((a,b)=>a+b,0);
    let raw=0,shi=0;
    for(let n=0;n<N;n++){
      raw+=draftOne(world,w,false,seededRnd("dr:"+q+":"+n));
      shi+=draftOne(world,w,true, seededRnd("dr:"+q+":"+n));}
    raw/=N;shi/=N;
    console.log(String(q).padStart(5)+" |"+(100*w[start-1]/tot).toFixed(0).padStart(21)+"% |"
      +raw.toFixed(1).padStart(15)+" |"+shi.toFixed(1).padStart(11)+" |"
      +(shi-d0.mean>=0?"+":"")+(shi-d0.mean).toFixed(1).padStart(22-((shi-d0.mean>=0)?1:0)));});
  console.log("\nCÉL: a rés a 0…+2 sávban (a `gaps` szerint +2 → 37% bajnoki esély,");
  console.log("vagyis feljutásra esélyes újonc vagy, de semmi nem jár ingyen).\n");
}
function reportMain(){
  reportGaps();
  reportSpeeds();
}

({gaps:reportGaps,speeds:reportSpeeds,sweep:reportSweep,bands:reportBands,
  world:reportWorld,draft:reportDraft,report:reportMain}[CMD]||reportMain)();
