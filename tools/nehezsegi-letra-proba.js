/* 🪜 A NEHÉZSÉGI LÉTRA (3.9.130).

   KIMONDOTT KÉRÉS: „az ellenfél erejének választásában legyen egy sokkal
   differenciáltabb sáv, ami +6-ról indul, és 6-2 között 0,5, 2 és 0 között
   0,1 tizedes lépésekkel lehet állítani. A létrán ahogy haladsz előre a
   játékban a megnyert karrierekben, az alap indítási szint a +2,5 legyen és
   innen minden megnyert karrierrel mindig 2 szint nyíljon meg nehezítésben.
   Könnyebbet bármikor lehessen választani. […] És legyen jóval nagyobb
   jelentősége ennek a választott nehézségnek a végleges Run szintben. És ha
   valaki eléri a 0-t választott nehézségként és úgy is nyer egy karriert,
   akkor kinyílik a mínuszos kezdés (0,1-nél még nem). A mínuszos kezdésnél
   minden 0,1 lépés +10-et nyit a Run szint tetején… itt mindig egy teljes
   egész számnyi nyílik ki egyszerre."

   Amit mér:
     1. a lépcsők: +6,0 … +2,5 félenként, +2,0 … 0,0 és lejjebb tizedenként;
     2. friss (a kezdő lépcsők utáni) profilon a határ +2,5, és a választó
        ennél nehezebbet NEM enged — sem a csúszkán, sem a vágáson át;
     3. a nyitás szabálya, szó szerint a kérés példáival: 2,5 → 2,0 és 1,9 ·
        1,9 → 1,8 és 1,7 · 0,1 → csak 0,0 · 0,0 → a 0…−1 sáv · −1 → −1…−2;
        sávon belüli vagy könnyebb győzelem nem nyit újat;
     4. a megerősítés a FINOM számot teszi el (gapWant = diffT/10), és zárt
        fokról nem lehet indulni;
     5. a győzelem egy karrierben EGYSZER könyvelődik, a cím pillanatában;
     6. a betöltéskori pótlás: egy régi, címet már nyert mentés preset-rése
        (gapWant) is nyit;
     7. a Run: az új görbe meredekebb (0 → 1,00 · +2 → 0,70 · +2,5 → 0,65 ·
        +6 → 0,30), mínuszban a tető 100 + 10/tized, és a plafon valóban
        100 fölé mehet; a régi karrier (nincs diffT) a régi görbén marad;
     8. a választó felülete: a csúszka pontosan a nyitott fokokon jár, a ◀ ▶
        lépked, a zárt presetek lakattal és tiltva;
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9115;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof diffSteps==="function"&&typeof diffNoteWin==="function"
      &&typeof diffFront==="function"&&typeof diffRunFactor==="function"
      &&typeof pyrDiffAllowed==="function"&&typeof diffCareerWin==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a nehézségi létra függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    /* A FELOLDÁS-NAPLÓ tiszta lappal: a kezdő lépcsők mögött (3 cím), hogy a
       nehézség-állító szabad legyen — de a létra határa még az alapon. */
    const naplo=(o)=>{
      localStorage.removeItem(UNLOCK_KEY);_unlockCache=null;
      const u=unlockState();Object.assign(u,{d1:3},o||{});unlockSave();_unlockCache=null;
      return unlockState();};
    naplo();

    /* ---- 1. A LÉPCSŐK ---- */
    const L=diffSteps();
    ki.lepcsok={eleje:L.slice(0,10),kozep:L.slice(8,30),nulla:L.indexOf(0),
      utana:L.slice(L.indexOf(0),L.indexOf(0)+4),hossz:L.length};

    /* ---- 2. A FRISS PROFIL HATÁRA ---- */
    ki.hatar0=diffFront();
    ki.nyitott=[diffOpenT(25),diffOpenT(20),diffOpenT(60)];

    /* ---- 3. A NYITÁS SZABÁLYA ---- */
    const lanc=[];
    const lep=(t,szoveg)=>{const uj=diffNoteWin(t);lanc.push({t,uj,front:diffFront(),szoveg});};
    naplo();
    lep(25,"2,5 → 2,0 és 1,9");
    lep(19,"1,9 → 1,8 és 1,7");
    lep(30,"könnyebb győzelem: semmi új");
    naplo({diffFront:1});
    lep(1,"0,1 → csak 0,0");
    lep(0,"0,0 → a 0…−1 sáv");
    lep(-5,"sávon belül: semmi");
    lep(-10,"−1,0 → −1…−2");
    naplo({diffFront:2});
    lep(2,"0,2 → 0,1 és 0,0");
    ki.lanc=lanc;

    /* ---- 4. A MEGERŐSÍTÉS ÉS A KAPU ---- */
    naplo();
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};startClubCareer=()=>{};
    S.pyr=null;S.idx=0;
    pyrOpenDivPick({club:"draft",season:"",players:sq.players.slice(0,18)});
    pyrPickFromDraft=true;
    ki.nyito=pyrPickGap;
    const allowed=pyrDiffAllowed();
    ki.engedett={min:Math.min.apply(null,allowed),max:Math.max.apply(null,allowed),db:allowed.length};
    /* nehezebbet kérünk, mint a határ */
    pyrPickGap=1.2;pyrSyncUpFromGap();
    ki.vagas=pyrPickGap;
    pyrDiffSetT(19);ki.setZart=pyrPickGap;
    /* a UI */
    const box=$("pyrDiffList");
    const r=box.querySelector("#pyrDiffRange");
    ki.ui={van:!!r,max:r?parseInt(r.max,10):null,db:allowed.length,
      zartChip:[...box.querySelectorAll("[data-diffjump]")].filter(x=>x.disabled).length,
      lakat:box.innerHTML.indexOf("🔒")>=0};
    box.querySelector('[data-diffstep="1"]').click();         /* egy fokkal könnyebb */
    ki.uiLep=pyrPickGap;
    box.querySelector('[data-diffjump="25"]').click();        /* vissza az alapra */
    ki.uiAlap=pyrPickGap;
    /* a megerősítés */
    pyrDiffSetT(30);
    pyrConfirmDiv();
    ki.mentve={gapWant:S.pyr&&S.pyr.gapWant,diffT:S.pyr&&S.pyr.diffT,fieldWant:S.pyr&&S.pyr.fieldWant};

    /* ---- 5. A GYŐZELEM EGYSZER, A CÍM PILLANATÁBAN ---- */
    naplo();
    S.pyr.diffT=25;S.pyr.gapWant=2.5;
    const R=runInit();delete R.diffWinNoted;R.pyrTitleRound=null;
    const e1=diffCareerWin(true),f1=diffFront();
    const e2=diffCareerWin(true),f2=diffFront();
    ki.egyszer={elso:e1,front1:f1,masodik:e2,front2:f2};

    /* ---- 6. BETÖLTÉSKORI PÓTLÁS: régi mentés preset-rése ---- */
    naplo({diffFront:0});
    delete S.pyr.diffT;S.pyr.gapWant=0;delete S.pyr.fieldWant;
    delete R.diffWinNoted;
    ki.potlas={t:diffCareerT(),uj:diffCareerWin(true),front:diffFront()};
    /* a kezdő lépcső rögzített mezőnye NEM nehézségi fok */
    naplo();delete R.diffWinNoted;S.pyr.fieldWant=80;delete S.pyr.gapWant;delete S.pyr.diffT;
    ki.lepcsoNem={t:diffCareerT(),uj:diffCareerWin(true)};
    delete S.pyr.fieldWant;

    /* ---- 7. A RUN ---- */
    ki.gorbe={g0:diffRunFactor(0),g1:diffRunFactor(10),g2:diffRunFactor(20),
      g25:diffRunFactor(25),g6:diffRunFactor(60),m01:diffRunFactor(-1),m1:diffRunFactor(-10),
      top0:diffRunTop(0),top01:diffRunTop(-1),top1:diffRunTop(-10)};
    ki.regiGorbe={g0:pyrGapFactor(0),g25:pyrGapFactor(2.5),g6:pyrGapFactor(6)};
    /* a plafon a karrierben. A többi tényező (osztály, két tempó) a plafont
       SZOROZZA — a tető csak akkor érhető el, ha azok is a maximumon vannak.
       Ezért két mérés: a mostani beállítással a −1,0 PONTOSAN kétszerese a
       0,0-nak, a legnehezebb egyéb beállításokkal pedig tényleg 100 fölé megy. */
    S.pyr.diffT=0;
    const c0=pyrRunCap();
    S.pyr.diffT=-10;
    const c1=pyrRunCap();
    const ment={d:S.pyr.startDiv,sp:S.pyr.aiSpeed,tp:runInit().tempo};
    S.pyr.startDiv=6;S.pyr.aiSpeed="vegtelen";runInit().tempo="kokorszak";
    const cMax=pyrRunCap();
    S.pyr.startDiv=ment.d;S.pyr.aiSpeed=ment.sp;runInit().tempo=ment.tp;
    S.pyr.diffT=25;
    const c2=pyrRunCap();
    delete S.pyr.diffT;S.pyr.gap0=2.5;
    const c3=pyrRunCap();
    ki.plafon={nulla:c0.cap,max:{cap:cMax.cap,top:cMax.top},
      minusz:{cap:c1.cap,top:c1.top,sor:c1.parts.map(x=>x.n).join(" | ")},
      alap:{cap:c2.cap,top:c2.top},regi:{cap:c3.cap,top:c3.top,sor:c3.parts.map(x=>x.n).join(" | ")}};
    /* a teljes Run tetején: −1,0-n a 100 fölé is felmehet */
    S.pyr.diffT=-10;
    const bd=runBreakdown();
    ki.run={top:bd.top,total:bd.total,cap:bd.cap,perf:bd.perf};
    return ki;});

  console.log("\n— A LÉPCSŐK —");
  ok(same(t.lepcsok.eleje.slice(0,9),[60,55,50,45,40,35,30,25,20]),
     "+6,0 … +2,0 fél lépcsőkkel",t.lepcsok.eleje);
  ok(same(t.lepcsok.kozep.slice(1,4),[19,18,17])&&t.lepcsok.nulla===28,
     "+2,0 alatt tized lépcsők, 0,0-ig húsz fok",t.lepcsok);
  ok(same(t.lepcsok.utana,[0,-1,-2,-3]),"…és a 0 alatt is tizedenként",t.lepcsok.utana);

  console.log("\n— A FRISS PROFIL —");
  ok(t.hatar0===25&&same(t.nyitott,[true,false,true]),
     "a határ +2,5: az nyitva, a +2,0 zárva, a +6,0 nyitva",[t.hatar0,t.nyitott]);

  console.log("\n— A NYITÁS SZABÁLYA —");
  const L=t.lanc;
  ok(same(L[0].uj,[20,19])&&L[0].front===19,"2,5-ön nyerve: 2,0 és 1,9",L[0]);
  ok(same(L[1].uj,[18,17])&&L[1].front===17,"1,9-en nyerve: 1,8 és 1,7",L[1]);
  ok(L[2].uj.length===0&&L[2].front===17,"könnyebb fokon nyerve: semmi új",L[2]);
  ok(same(L[3].uj,[0])&&L[3].front===0,"0,1-en nyerve: CSAK a 0,0 (a mínusz még nem)",L[3]);
  ok(L[4].uj.length===10&&L[4].uj[0]===-1&&L[4].uj[9]===-10&&L[4].front===-10,
     "0,0-n nyerve: az egész 0…−1 sáv",L[4]);
  ok(L[5].uj.length===0,"sávon belül (−0,5) nyerve: semmi új",L[5]);
  ok(L[6].uj.length===10&&L[6].front===-20,"−1,0-n nyerve: a −1…−2 sáv",L[6]);
  ok(same(L[7].uj,[1,0])&&L[7].front===0,"0,2-n nyerve: 0,1 és 0,0",L[7]);

  console.log("\n— A VÁLASZTÓ —");
  ok(kozel(t.nyito,2.5,0.001),"az osztályválasztó +2,5-ön nyit",t.nyito);
  ok(t.engedett.min===25&&t.engedett.max<=60,"a választható fokok: +2,5-től a könnyű felé",t.engedett);
  ok(kozel(t.vagas,2.5,0.001)&&kozel(t.setZart,2.5,0.001),
     "zárt fokot kérve (1,2 · 1,9) a +2,5-ön marad",[t.vagas,t.setZart]);
  ok(t.ui.van&&t.ui.max===t.ui.db-1,"a csúszka pontosan a nyitott fokokon jár",t.ui);
  ok(t.ui.zartChip>=3&&t.ui.lakat,"a zárt presetek tiltva, lakattal",t.ui);
  ok(kozel(t.uiLep,3.0,0.001)&&kozel(t.uiAlap,2.5,0.001),"a ▶ egy fokot lép, az 🎬 alap visszaáll",[t.uiLep,t.uiAlap]);
  ok(kozel(t.mentve.gapWant,3.0,0.001)&&t.mentve.diffT===30&&t.mentve.fieldWant===undefined,
     "a megerősítés a FINOM fokot teszi el (gapWant = diffT/10)",t.mentve);

  console.log("\n— A GYŐZELEM —");
  ok(same(t.egyszer.elso,[20,19])&&t.egyszer.masodik.length===0&&t.egyszer.front2===19,
     "egy karrier EGYSZER nyit — a második cím már nem",t.egyszer);
  ok(t.potlas.t===0&&t.potlas.front===-10,"a régi mentés 0-s preset-rése is nyit (betöltéskori pótlás)",t.potlas);
  ok(t.lepcsoNem.t===null&&t.lepcsoNem.uj.length===0,"a kezdő lépcső rögzített mezőnye nem nehézségi fok",t.lepcsoNem);

  console.log("\n— A RUN —");
  const g=t.gorbe;
  ok(g.g0===1&&kozel(g.g2,0.70,1e-9)&&kozel(g.g25,0.65,1e-9)&&kozel(g.g6,0.30,1e-9)&&kozel(g.g1,0.85,1e-9),
     "az új görbe: 0→1,00 · +1→0,85 · +2→0,70 · +2,5→0,65 · +6→0,30",g);
  ok(g.g0-g.g25>=0.3&&(t.regiGorbe.g0-t.regiGorbe.g25)<0.15,
     "a 0 és a +2,5 közti különbség 35%, a régi görbén 11% volt",[g.g25,t.regiGorbe.g25]);
  ok(kozel(g.m01,1.1,1e-9)&&kozel(g.m1,2.0,1e-9)&&g.top01===110&&g.top1===200&&g.top0===100,
     "mínuszban tizedenként +10 a tetőn: −0,1 → 110 · −1,0 → 200",g);
  ok(t.plafon.minusz.top===200&&kozel(t.plafon.minusz.cap,2*t.plafon.nulla,1e-6),
     "a −1,0-s plafon PONTOSAN kétszerese a 0,0-snak",[t.plafon.nulla,t.plafon.minusz.cap]);
  ok(kozel(t.plafon.max.cap,2,1e-6),"…és a legnehezebb egyéb beállításokkal tényleg 100 FÖLÉ megy (×2,0)",t.plafon.max);
  ok(t.plafon.minusz.sor.indexOf("Választott nehézség")>=0,"…és a bontásban kimondja a fokot",t.plafon.minusz.sor);
  ok(t.plafon.regi.top===100&&t.plafon.regi.sor.indexOf("Választott")<0,
     "a régi karrier (nincs diffT) a régi, mért réssel marad",t.plafon.regi);
  ok(t.run.top===200,"a Run tetején is 200 a határ −1,0-n",t.run);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));

  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
