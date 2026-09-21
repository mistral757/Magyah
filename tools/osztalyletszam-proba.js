/* 🧮 AZ OSZTÁLYLÉTSZÁM, A PÁRATLAN MEZŐNY ÉS A BETÖLTÉS SORRENDJE (3.9.102).

   BEJELENTÉS (képernyőkép + mentés): „1. 32 fordulóssá változott a játék (30
   helyett). 2. Az ellenfelek pontszámai megszűntek. Csak az ellenünk játszott
   meccsek vannak nekik. És továbbra sem tud tovább menni a beakadt."

   A BEKÜLDÖTT MENTÉS (6. szezon, host, 46VWL2) mérve:
     fixtures 32 · párharcok 15, 30 · pyr.my 1 · SEASON_OPPS 15
     osztálylétszámok D1:15 D2:15 D3:16 D4:16 D5:16 D6:16 · összesen 94
     mpTable: 6. szezon, 15. forduló után, 17 sor

   A 94 HELYES (6×16 − a páros két helye), az ELOSZLÁS csúszott el eggyel: a
   D1-ben 15 világ-csapat áll 14 helyett. Ebből az EGY elcsúszásból nőtt ki
   mind a három tünet:

     · 15 ellenfél → a menetrend 32 fordulós;
     · n = 15 + te + a társad = 17, vagyis PÁRATLAN → az aiLeagueSchedule
       régi `n%2!==0` kapuja 30 ÜRES fordulót adott vissza, tehát a CPU-k
       egymás elleni meccsei el sem készültek;
     · és az így kiszámolt, 15. forduló utáni közös tabella BERAGADT.

   Amit mér:
     1. hogy a mentés alakja tényleg a páratlan esetet adja (n=17);
     2. az aiLeagueSchedule páratlan mezőnnyel is JÁTSZAT a mezőnnyel — és
        hogy a RÉGI kapu ugyanitt üres naptárat adott;
     3. pyrDivSizeRepair: 15/15 → 14/16, az összlétszám változatlan,
        determinisztikus és idempotens; egyjátékosban más a célszám;
     4. hogy a hiányzó világ-csapatot NEM találjuk ki;
     5. mpTableSane: a hibás pillanatképet félreteszi, az épet nem bántja;
     6. ÉS A LEGFONTOSABB: a betöltéskori menetrend-javítás a BETÖLTÖTT
        menetrenden dolgozik — a 3.9.101-ben az Object.assign(S,d.S) ELŐTT
        futott, tehát halott kód volt;
     7. az ALAPSZABÁLY, lekötve: egy osztály 16 csapat, egy szezon 30
        forduló — mindkét módban, a levezetéssel együtt. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9073;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};

const BOOT=`(()=>{
  gameMode="career";
  enterCareerSetupFromHome(true);
  beginNewGame();
  const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
  showChemistry=()=>{};
  S.idx=0;
  pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
  pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
  renderPyrDivPick();pyrConfirmDiv();
  if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
  {const _k=sq.players.slice();
   slots.forEach((sl,i)=>{
     if(sl.player)return;
     const src=_k[i%_k.length];
     const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
     sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
  if(typeof captainIdx!=="undefined"&&captainIdx<0)captainIdx=0;
  if(!coach)coach=COACHES[0];
  if(!scout)scout=generateScout();
  S.auto=false;matchSpeed=20;
  phase="season";
  buildSeasonFixtures();
  return !!(S.pyr&&S.pyr.divs&&S.pyr.divs.length);})()`;

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof pyrDivSizeRepair==="function"
    &&typeof mpTableSane==="function"&&typeof aiLeagueSchedule==="function",
    null,{timeout:30000});
  ok(await p.evaluate(BOOT)===true,"karrier-bootstrap (piramis)");

  /* ================= 1-2. A PÁRATLAN MEZŐNY ================= */
  const par=await p.evaluate(()=>{
    const ki={};
    const _h=h2hRoomActive,_l=leagueOpps;
    /* A beküldött mentés alakja: 15 ellenfél + te + a társad = 17. */
    const opps=Array.from({length:15},(_,i)=>({n:"CPU"+i,ovr:100+i}));
    window.h2hRoomActive=()=>true;
    window.leagueOpps=()=>opps.slice();
    ki.n=opps.length+1+1;
    ki.paratlan=ki.n%2!==0;
    /* A menetrend a mentés alakja szerint: 30 CPU-meccs + 2 párharc = 32. */
    const fx=[];
    for(let i=0;i<15;i++)fx.push({o:opps[i],home:true});
    for(let i=0;i<15;i++)fx.push({o:opps[i],home:false});
    fx.splice(14,0,{duel:true,round:15,home:false,o:{n:"⚔ A társad",ovr:0}});
    fx.splice(29,0,{duel:true,round:30,home:false,o:{n:"⚔ A társad",ovr:0}});
    S.fixtures=fx;S.idx=29;
    ki.fxHossz=fx.length;
    _aiSchedCache=null;
    const R=aiLeagueSchedule();
    ki.fordulok=R.length;
    ki.uresFordulok=R.filter(x=>!x.length).length;
    ki.parokOsszesen=R.reduce((a,x)=>a+x.length,0);
    /* Hány külön CPU szerepel egyáltalán a naptárban? */
    const kik=new Set();R.forEach(x=>x.forEach(([a,c])=>{kik.add(a);kik.add(c);}));
    ki.szereploCpu=kik.size;
    /* És hány meccse van a legtöbbet és a legkevesebbet játszó CPU-nak? */
    const db={};R.forEach(x=>x.forEach(([a,c])=>{db[a]=(db[a]|0)+1;db[c]=(db[c]|0)+1;}));
    const v=Object.keys(db).map(k=>db[k]);
    ki.cpuMeccsMin=v.length?Math.min.apply(null,v):0;
    ki.cpuMeccsMax=v.length?Math.max.apply(null,v):0;
    /* A RÉGI KAPU: pontosan ez állt itt, és pontosan ezt adta. */
    ki.regiKapuUres=(ki.n<4||ki.n%2!==0);
    /* PÁROS MEZŐNY (14 ellenfél) — ott semmi nem változhatott. */
    const o14=Array.from({length:14},(_,i)=>({n:"P"+i,ovr:100+i}));
    window.leagueOpps=()=>o14.slice();
    const fx2=[];
    for(let i=0;i<14;i++)fx2.push({o:o14[i],home:true});
    for(let i=0;i<14;i++)fx2.push({o:o14[i],home:false});
    fx2.splice(14,0,{duel:true,round:15,home:false,o:{n:"⚔ A társad",ovr:0}});
    fx2.splice(29,0,{duel:true,round:30,home:false,o:{n:"⚔ A társad",ovr:0}});
    S.fixtures=fx2;_aiSchedCache=null;
    const R2=aiLeagueSchedule();
    ki.paros={fordulok:R2.length,ures:R2.filter(x=>!x.length).length,
      parok:R2.reduce((a,x)=>a+x.length,0)};
    window.h2hRoomActive=_h;window.leagueOpps=_l;_aiSchedCache=null;
    return ki;});

  console.log("=== 1. a bejelentett alak: páratlan mezőny ===");
  ok(par.n===17&&par.paratlan===true,"n = 15 ellenfél + te + a társad = 17, páratlan",{n:par.n});
  ok(par.fxHossz===32,"és a menetrend ettől 32 fordulós",{hossz:par.fxHossz});
  ok(par.regiKapuUres===true,"a RÉGI kapu (n%2!==0) pontosan itt adott üres naptárat");
  console.log("=== 2. az új naptár páratlan mezőnnyel is játszat ===");
  ok(par.fordulok===30,"30 forduló",{f:par.fordulok});
  ok(par.uresFordulok===0,"egyetlen üres forduló sincs",{ures:par.uresFordulok});
  ok(par.parokOsszesen>=150,"és rengeteg CPU-párosítás született",{parok:par.parokOsszesen});
  ok(par.szereploCpu===15,"mind a 15 CPU szerepel a naptárban",{db:par.szereploCpu});
  ok(par.cpuMeccsMin>=20&&par.cpuMeccsMax<=32,
    "és mindegyik reális számú meccset kap",{min:par.cpuMeccsMin,max:par.cpuMeccsMax});
  ok(par.paros.fordulok===30&&par.paros.ures===0&&par.paros.parok>0,
    "páros mezőnynél (14 ellenfél) minden a régi",par.paros);

  /* ================= 3-4. AZ OSZTÁLYLÉTSZÁMOK ================= */
  const div=await p.evaluate(()=>{
    const ki={};
    const _h=h2hRoomActive;
    const gyart=(meret)=>({on:true,my:1,above:0,spare:{n:"T1",ovr:100},spare2:{n:"T2",ovr:99},
      divs:meret.map((m,i)=>({teams:Array.from({length:m},(_,k)=>
        ({n:`D${i+1}_${k}`,ovr:140-i*10-k*0.5})),mean:0,lo:0,hi:0}))});
    const meretek=()=>S.pyr.divs.map(d=>d.teams.length);
    const osszes=()=>S.pyr.divs.reduce((a,d)=>a+d.teams.length,0);

    /* --- A BEKÜLDÖTT MENTÉS ALAKJA, SZOBÁBAN --- */
    window.h2hRoomActive=()=>true;
    S.pyr=gyart([15,15,16,16,16,16]);
    ki.elotte=meretek();ki.elotteOsszes=osszes();
    /* Melyik csapatnak KELL lejjebb lépnie? A D1 leggyengébbje. */
    const varhatoLe=S.pyr.divs[0].teams.slice().sort((a,b)=>b.ovr-a.ovr).pop().n;
    ki.mozgatott=pyrDivSizeRepair("proba");
    ki.utana=meretek();ki.utanaOsszes=osszes();
    ki.leLepett=(S.pyr.divs[1].teams||[]).some(t=>t.n===varhatoLe);
    ki.marNincsFent=!(S.pyr.divs[0].teams||[]).some(t=>t.n===varhatoLe);
    ki.masodszor=pyrDivSizeRepair("proba");     /* idempotens? */
    ki.utana2=meretek();
    /* mean/lo/hi újraszámolva? */
    const d0=S.pyr.divs[0];
    ki.atlagOk=d0.mean>0&&d0.lo>0&&d0.hi>=d0.lo;

    /* --- DETERMINIZMUS: ugyanabból az állapotból ugyanaz --- */
    S.pyr=gyart([15,15,16,16,16,16]);pyrDivSizeRepair("proba");
    const A=S.pyr.divs.map(d=>d.teams.map(t=>t.n).join(","));
    S.pyr=gyart([15,15,16,16,16,16]);pyrDivSizeRepair("proba");
    const B=S.pyr.divs.map(d=>d.teams.map(t=>t.n).join(","));
    ki.determ=A.join("|")===B.join("|");

    /* --- A MÁSIK IRÁNY: a saját osztályban KEVÉS van --- */
    S.pyr=gyart([13,17,16,16,16,16]);
    ki.keves={elotte:meretek(),mozg:pyrDivSizeRepair("proba"),utana:meretek()};

    /* --- EGYJÁTÉKOS: a saját osztály célszáma eggyel NAGYOBB (15), és a
           világ is eggyel több csapatot tart (95, nem 94) --- */
    window.h2hRoomActive=()=>false;
    S.pyr=gyart([15,16,16,16,16,16]);
    ki.soloEp={elotte:meretek(),mozg:pyrDivSizeRepair("proba"),utana:meretek()};
    S.pyr=gyart([14,17,16,16,16,16]);
    ki.solo={elotte:meretek(),mozg:pyrDivSizeRepair("proba"),utana:meretek()};

    /* --- 4. HIÁNYZÓ CSAPAT: nem találunk ki senkit --- */
    window.h2hRoomActive=()=>true;
    S.pyr=gyart([15,15,16,16,16,13]);       /* a világból hiányzik 3 csapat */
    const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
    ki.hianyos={elotte:meretek(),mozg:pyrDivSizeRepair("proba"),utana:meretek(),
      osszes:osszes()};
    addLine=_a;
    ki.hianyos.szolt=naplo.some(x=>/A világ létszáma maga is hibás/.test(x));

    /* --- PIRAMIS NÉLKÜL: hozzá sem nyúl --- */
    S.pyr=null;
    ki.nincsPiramis=pyrDivSizeRepair("proba");
    window.h2hRoomActive=_h;
    return ki;});

  console.log("=== 3. pyrDivSizeRepair ===");
  ok(div.elotte.join()==="15,15,16,16,16,16","a bemenet a beküldött mentés alakja",div.elotte);
  ok(div.utana.join()==="14,16,16,16,16,16","utána D1:14, D2:16 — ahogy kell",div.utana);
  ok(div.utanaOsszes===div.elotteOsszes,"az összlétszám változatlan",
    {elotte:div.elotteOsszes,utana:div.utanaOsszes});
  ok(div.mozgatott===1,"pontosan EGY csapat mozdult",{db:div.mozgatott});
  ok(div.leLepett&&div.marNincsFent,"és a D1 LEGGYENGÉBBJE lépett le");
  ok(div.masodszor===0&&div.utana2.join()==="14,16,16,16,16,16",
    "másodszor már nincs mit tenni (idempotens)",{m:div.masodszor});
  ok(div.atlagOk===true,"az osztály közepe/szélei újraszámolódtak");
  ok(div.determ===true,"determinisztikus: ugyanaz az állapot ugyanazt adja");
  ok(div.keves.utana.join()==="14,16,16,16,16,16",
    "a másik irány is (13/17 → 14/16)",div.keves);
  ok(div.soloEp.mozg===0&&div.soloEp.utana.join()==="15,16,16,16,16,16",
    "egyjátékosban a 15/16/16/16/16/16 már ép — nem nyúl hozzá",div.soloEp);
  ok(div.solo.utana.join()==="15,16,16,16,16,16",
    "egyjátékosban a saját osztály célszáma 15 (14/17 → 15/16)",div.solo);
  ok(div.nincsPiramis===0,"piramis nélkül hozzá sem nyúl");

  console.log("=== 4. hiányzó csapatot nem találunk ki ===");
  ok(div.hianyos.osszes===15+15+16+16+16+13,"a világ létszáma nem nőtt",
    {osszes:div.hianyos.osszes});
  ok(div.hianyos.utana[0]===14,"a saját osztály így is helyre kerül",div.hianyos.utana);
  ok(div.hianyos.szolt===true,"és a napló kimondja, hogy a világ maga hibás");

  /* ================= 5. A BERAGADT KÖZÖS TABELLA ================= */
  const tbl=await p.evaluate(()=>{
    const ki={};
    const sor=(n,pl,w,d,l)=>({n,player:pl,you:false,mate:false,pts:0,gf:0,ga:0,w,d,l});
    /* A beküldött mentés: két menedzser 15 meccsen, a CPU-k 1-2-n. */
    const rossz={season:S.seasonNumber||1,upto:15,teams:[
      sor("Én",true,15,0,0),sor("Társ",true,14,0,1),
      ...Array.from({length:15},(_,i)=>sor("CPU"+i,false,0,0,i<3?2:1))]};
    const jo={season:S.seasonNumber||1,upto:15,teams:[
      sor("Én",true,15,0,0),sor("Társ",true,14,0,1),
      ...Array.from({length:15},(_,i)=>sor("CPU"+i,false,5,4,6))]};
    const eleje={season:S.seasonNumber||1,upto:2,teams:[
      sor("Én",true,2,0,0),sor("Társ",true,2,0,0),
      ...Array.from({length:15},(_,i)=>sor("CPU"+i,false,0,0,1))]};
    ki.rossz=mpTableSane(rossz);
    ki.jo=mpTableSane(jo);
    ki.eleje=mpTableSane(eleje);
    ki.ures=mpTableSane({teams:[]});
    /* És hogy az mpTableNow tényleg félreteszi-e */
    S._mpTblWarned=0;S.mpTable=rossz;
    const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
    ki.nowRossz=mpTableNow();
    addLine=_a;
    ki.szolt=naplo.some(x=>/eltett pillanatképe hibás/.test(x));
    S.mpTable=jo;ki.nowJo=!!mpTableNow();
    S.mpTable=null;
    return ki;});
  console.log("=== 5. a beragadt, hibásan számolt közös tabella ===");
  ok(tbl.rossz===false,"a beküldött alakot hibásnak ismeri fel");
  ok(tbl.jo===true,"az ép pillanatképet nem bántja");
  ok(tbl.eleje===true,"a szezon elején (kevés meccs) nem ítélkezik");
  ok(tbl.ures===true,"üres listán nem dől el");
  ok(tbl.nowRossz===null,"az mpTableNow félreteszi a hibásat");
  ok(tbl.szolt===true,"és egyszer szól is róla");
  ok(tbl.nowJo===true,"az épet visszaadja");

  /* ================= 6. A BETÖLTÉS SORRENDJE ================= */
  const bet=await p.evaluate(()=>{
    const ki={};
    /* Elkapjuk azt a payloadot, amit a saveGame a lemezre írna. */
    let d=null;const _irt=[];
    const _set=Storage.prototype.setItem;
    MP.active=true;MP.activeRoom="TESZT1";MP.role="host";
    try{
      Storage.prototype.setItem=function(k,v){
        _irt.push(String(k)+":"+String(v).length);
        try{const o=JSON.parse(v);if(o&&o.S&&Array.isArray(o.S.fixtures))d=o;}catch(e){}
        return _set.call(this,k,v);};
      /* A saveGame KIZÁRÓLAG felvett zárral ír (lásd ott) — a próbában a
         tényleges célt adjuk meg neki. */
      _saveLock=saveKey();_saveBroken=false;_saveFrozen=false;
      saveGame();
    }finally{Storage.prototype.setItem=_set;}
    if(!d){ki.payload=false;ki.kulcsok=_irt;return ki;}
    ki.payload=true;
    /* A MENTÉST ELRONTJUK PONTOSAN ÚGY, AHOGY A BEKÜLDÖTT: 32 forduló. */
    const opps=(d.SEASON_OPPS||[]).slice();
    const fx=[];
    for(let i=0;i<15;i++)fx.push({o:opps[i%opps.length],home:true});
    for(let i=0;i<15;i++)fx.push({o:opps[i%opps.length],home:false});
    fx.splice(14,0,{duel:true,round:15,home:false,o:{n:"⚔ A társad",ovr:0}});
    fx.splice(29,0,{duel:true,round:30,home:false,o:{n:"⚔ A társad",ovr:0}});
    d.S.fixtures=fx;d.S.idx=29;d.phase="season";
    d.mp={active:true,room:"TESZT1",role:"host",myId:(d.mp&&d.mp.myId)||"x"};
    ki.mentesHossz=d.S.fixtures.length;
    /* A memóriában szándékosan EGY ÉP menetrend áll: ha a javítás az
       Object.assign ELŐTT futna, ezt javítgatná, a betöltött 32-es lista
       pedig érintetlenül maradna — pontosan ez volt a 3.9.101 hibája. */
    S.fixtures=fx.slice(0,30);
    const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
    let dob=null;try{applySavedGame(d);}catch(e){dob=String(e);}
    addLine=_a;
    ki.dob=dob;
    ki.hossz=(S.fixtures||[]).length;
    ki.parharcok=(S.fixtures||[]).map((f,i)=>f&&f.duel?i+1:0).filter(Boolean);
    ki.szolt=naplo.some(x=>/Menetrend helyreállítva/.test(x));
    ki.szoba=h2hRoomActive();
    return ki;});
  console.log("=== 6. a betöltéskori javítás a BETÖLTÖTT menetrenden dolgozik ===");
  ok(bet.payload===true,"sikerült elkapni egy valódi mentés-payloadot",bet.kulcsok);
  if(!bet.payload){console.log("  (a 6. szakasz többi állítása kimarad)");}else{
  ok(!bet.dob,"a betöltés nem dobott",bet.dob);
  ok(bet.mentesHossz===32,"a mentésben tényleg 32 forduló volt");
  ok(bet.szoba===true,"és a szoba a betöltés után aktív (h2hRoomActive)");
  ok(bet.hossz===30,"betöltés után 30 forduló",{hossz:bet.hossz});
  ok(bet.parharcok.join()==="15,30","a párharcok a helyükön MARADTAK",
    {p:bet.parharcok});
  ok(bet.szolt===true,"és a napló elmondja, hogy helyreállítás történt");}

  /* ================= 7. AZ ALAPSZABÁLY: 16 CSAPAT → 30 FORDULÓ =============
     Ez a szakasz nem egy hibát mér, hanem egy ÍGÉRETET köt le. A mezőny
     minden osztályban 16 csapat, tehát a szezon minden módban pontosan 30
     forduló — és a két szám nem sodródhat el egymástól egy későbbi
     változtatásban sem. A levezetés mindkét módban kijön:

       közös karrier:  14 CPU + te + a társad = 16 ülés
                       14 CPU × 2 meccs = 28, + 2 párharc (15. és 30.) = 30
       egyjátékos:     15 CPU + te         = 16 ülés
                       15 CPU × 2 meccs                                = 30

     És mivel a tabella-létszám mindkét esetben 16, vagyis PÁROS, a 2.
     szakaszban bevezetett üres hely SOSEM lép működésbe egy ép világban —
     az tisztán háló, nem a normál működés része. */
  const inv=await p.evaluate(()=>{
    const ki={};
    const _h=h2hRoomActive;
    ki.PYR_TEAMS=PYR_TEAMS;
    ki.SEASON_ROUNDS=SEASON_ROUNDS;
    S.pyr={on:true,my:1,above:0,divs:[]};
    window.h2hRoomActive=()=>true;
    ki.kellSajatSzoba=pyrDivNeed(1);      /* a saját osztályod világ-csapatai */
    ki.kellMas=pyrDivNeed(2);             /* egy idegen osztály */
    window.h2hRoomActive=()=>false;
    ki.kellSajatSolo=pyrDivNeed(1);
    ki.ulesSzoba=ki.kellSajatSzoba+2;     /* + te + a társad */
    ki.ulesSolo=ki.kellSajatSolo+1;       /* + te */
    /* És amit ebből a menetrend csinál. */
    const lista=n=>{const a=[];
      for(let i=0;i<n;i++)a.push({o:{n:"C"+i,ovr:70},home:true});
      for(let i=0;i<n;i++)a.push({o:{n:"C"+i,ovr:70},home:false});return a;};
    const mer=out=>({hossz:out.length,
      p:out.map((f,i)=>f&&f.duel?i+1:0).filter(Boolean),
      lyuk:out.filter(f=>!f||(!f.duel&&!f.o)).length,
      potolt:out.filter(f=>f&&f.filler).length});
    window.h2hRoomActive=()=>true;
    ki.szoba=mer(fixturesFitToSeason(lista(ki.kellSajatSzoba),Math.random));
    ki.szobaN=ki.kellSajatSzoba+1+1;      /* tabella-létszám */
    window.h2hRoomActive=()=>false;
    ki.solo=mer(fixturesFitToSeason(lista(ki.kellSajatSolo),Math.random));
    ki.soloN=ki.kellSajatSolo+1;
    window.h2hRoomActive=_h;S.pyr=null;
    return ki;});

  console.log("=== 7. az alapszabály: 16 csapat → 30 forduló ===");
  ok(inv.PYR_TEAMS===16,"egy osztály 16 csapat (PYR_TEAMS)",{v:inv.PYR_TEAMS});
  ok(inv.SEASON_ROUNDS===30,"egy szezon 30 forduló (SEASON_ROUNDS)",{v:inv.SEASON_ROUNDS});
  ok(inv.kellMas===16,"idegen osztály: 16 világ-csapat",{v:inv.kellMas});
  ok(inv.ulesSzoba===16,"közös karrier: 14 CPU + te + a társad = 16 ülés",
    {cpu:inv.kellSajatSzoba,ules:inv.ulesSzoba});
  ok(inv.ulesSolo===16,"egyjátékos: 15 CPU + te = 16 ülés",
    {cpu:inv.kellSajatSolo,ules:inv.ulesSolo});
  ok(inv.szoba.hossz===30&&inv.szoba.p.join()==="15,30"
     &&inv.szoba.lyuk===0&&inv.szoba.potolt===0,
    "közös karrier: 14×2 + 2 párharc = 30 forduló, pótlás nélkül",inv.szoba);
  ok(inv.solo.hossz===30&&inv.solo.p.length===0
     &&inv.solo.lyuk===0&&inv.solo.potolt===0,
    "egyjátékos: 15×2 = 30 forduló, párharc és pótlás nélkül",inv.solo);
  ok(inv.szobaN===16&&inv.soloN===16,
    "a tabella-létszám mindkét módban 16 — PÁROS, tehát ép világban nincs üres hely",
    {szoba:inv.szobaN,solo:inv.soloN});

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
