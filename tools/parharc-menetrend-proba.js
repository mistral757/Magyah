/* ⚔ PÁRHARC-FORDULÓ ÉS A TÁRS CÍME (3.9.101).

   BEJELENTETT HIBA (tesztelői képernyőkép): a 22. fordulóban „⚔ A TÁRSAD" áll
   ellenfélként, az állás „21/30", és onnan nem lehet továbblépni — „többször
   frissítettem, hogy hátha megjavul".

   A MÉRT OK. A menetrend a két párharcot egy nyers `splice(r-1,0,…)` sorral
   tette a helyére. A `splice` viszont CSENDBEN A VÉGÉRE CSÚSZTAT, ha az index
   túllóg a tömbön. Ha a mezőny a vártnál kisebb, a MÁSODIK párharc nem a 30.
   fordulóra kerül:

     14 ellenfél → 30 forduló · párharcok: 15, 30   (ez a helyes eset)
     10 ellenfél → 22 forduló · párharcok: 15, 22   ← a képernyőkép
     15 ellenfél → 32 forduló · párharcok: 15, 30

   A `h2hIsDuelRound()` viszont a FORDULÓSZÁMBÓL dönt (15 vagy 30), tehát a
   22. fordulón nem párharc indult volna, hanem rendes bajnoki egy 0-s erejű
   szellemcsapat ellen — vagy semmi, mert a lista ott véget ér.

   KIMONDOTT MÁSODIK KÉRÉS: „PvP-ben D1-ben ne csak akkor kapd meg a győztes
   kijelzőt, ha megnyered a D1-et, hanem akkor is, ha csak a társad előz meg,
   azaz úgy leszel 2., hogy a társad az 1."

   Amit mér:
     1. fixturesFitToSeason: MINDEN mezőnyméretnél pontosan 30 forduló, és a
        párharcok pontosan a 15. és a 30. fordulón — a hibát okozó 10, 13, 14,
        15, 16 ellenfeles esetekkel;
     2. ugyanez szoba nélkül: 30 forduló, párharc sehol;
     3. hogy a régi, nyers splice ezeken TÉNYLEG elhasalt (a próba nem
        hitelesíthet egy nem-változást);
     4. fixturesRepair egy 32 fordulós mentésen (a beküldött mentés alakja);
     5. fixturesRepair egy 22 fordulós mentésen, a 22. fordulón álló
        párharccal (a tesztelő kliensének alakja) — a LEJÁTSZOTT rész marad;
     6. a szellemmeccs elleni zár: startRoundNow nem játszik le hamis meccset;
     7. mateFinalRank és a társ-bajnokavatás képernyője;
     8. az ÉLES ág: a szezonzárás a társ címénél is ünnepel — de a SAJÁT
        könyvelésedhez (consecutiveTitles, titleWonSeason) nem nyúl;
     9. és a három nemleges eset (te vagy 3., a társ nem 1., nincs szoba). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9069;
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

/* A KARRIER-BOOTSTRAP. Ugyanaz, mint a többi próbában; itt függvénybe emelve,
   mert az élő szezonzárást négy különböző felállásban is meg kell néznünk. */
const BOOT=`(()=>{
  gameMode="career";
  enterCareerSetupFromHome(true);
  beginNewGame();
  const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=15)[0];
  showChemistry=()=>{};
  S.pyr=null;S.idx=0;
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
  return true;})()`;

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  const nyit=async()=>{
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.waitForTimeout(1200);
    await p.waitForFunction(()=>typeof fixturesFitToSeason==="function"
      &&typeof fixturesRepair==="function"&&typeof mateFinalRank==="function",
      null,{timeout:30000});};
  await nyit();

  /* ================= 1-3. AZ ILLESZTÉS ================= */
  const ill=await p.evaluate(()=>{
    const ki={};
    /* Egy N ellenfeles, oda-vissza menetrend — pontosan az, amit a
       buildSeasonFixtures a párharcok beszúrása ELŐTT előállít. */
    const lista=n=>{const a=[];for(let i=0;i<n;i++){a.push({o:{n:"CPU"+i,ovr:70},home:true});}
      for(let i=0;i<n;i++){a.push({o:{n:"CPU"+i,ovr:70},home:false});}return a;};
    const mer=out=>({hossz:out.length,
      parharcok:out.map((f,i)=>f&&f.duel?i+1:0).filter(Boolean),
      lyuk:out.filter(f=>!f||(!f.duel&&!f.o)).length});
    /* A RÉGI KÓD, betűre: ez a nyers splice, ami a hibát okozta. */
    const regi=n=>{const a=lista(n);[15,30].forEach(r=>a.splice(r-1,0,{duel:true,round:r}));return mer(a);};

    const _h=h2hRoomActive;
    window.h2hRoomActive=()=>true;
    ki.szobaval=[10,13,14,15,16].map(n=>({n,...mer(fixturesFitToSeason(lista(n),Math.random))}));
    ki.regi=[10,13,14,15,16].map(n=>({n,...regi(n)}));
    window.h2hRoomActive=()=>false;
    ki.szobaNelkul=[10,14,15,16].map(n=>({n,...mer(fixturesFitToSeason(lista(n),Math.random))}));
    /* ÜRES BEMENET: ne dőljön el, és ne találjon ki meccseket a semmiből. */
    ki.ures=mer(fixturesFitToSeason([],Math.random));
    window.h2hRoomActive=_h;
    /* DETERMINISZTIKUS-E A PÓTLÁS? A két kliens ugyanabból a seedelt folyamból
       dolgozik — ugyanazt a menetrendet kell kapniuk. */
    window.h2hRoomActive=()=>true;
    const kulcs=l=>l.map(f=>f.duel?"D":(f.o.n+(f.home?"H":"V"))).join("|");
    const a1=fixturesFitToSeason(lista(10),rngFor("proba:fix"));
    const a2=fixturesFitToSeason(lista(10),rngFor("proba:fix"));
    ki.determ=kulcs(a1)===kulcs(a2);
    window.h2hRoomActive=_h;
    return ki;});

  console.log("=== 1. az illesztés szobában: mindig 30 forduló, párharc 15/30 ===");
  ill.szobaval.forEach(r=>ok(r.hossz===30&&r.parharcok.join()==="15,30"&&r.lyuk===0,
    `${r.n} ellenfél`,{hossz:r.hossz,parharcok:r.parharcok,lyuk:r.lyuk}));
  console.log("=== 2. szoba nélkül: 30 forduló, párharc sehol ===");
  ill.szobaNelkul.forEach(r=>ok(r.hossz===30&&r.parharcok.length===0&&r.lyuk===0,
    `${r.n} ellenfél`,{hossz:r.hossz,parharcok:r.parharcok}));
  ok(ill.ures.hossz===0,"üres mezőny → üres menetrend (nem találunk ki meccseket)",ill.ures);
  ok(ill.determ===true,"a pótlás determinisztikus (a két kliens ugyanazt kapja)");
  console.log("=== 3. a RÉGI kód ugyanezeken elhasalt (a próba nem hitelesít nem-változást) ===");
  {const rossz=ill.regi.filter(r=>r.hossz!==30||r.parharcok.join()!=="15,30");
   ok(rossz.length>0,"a nyers splice legalább egy mezőnyméretnél elrontotta",
     ill.regi.map(r=>({n:r.n,hossz:r.hossz,p:r.parharcok})));
   const husz2=ill.regi.find(r=>r.n===10);
   ok(!!husz2&&husz2.hossz===22&&husz2.parharcok.join()==="15,22",
     "10 ellenféllel pontosan a bejelentett képet adta: 22 forduló, párharc a 22.-en",husz2);}

  /* ================= 4-6. A HELYREÁLLÍTÁS ÉS A ZÁR ================= */
  const jav=await p.evaluate(BOOT);
  ok(jav===true,"karrier-bootstrap");
  const rep=await p.evaluate(()=>{
    const ki={};
    const _h=h2hRoomActive;
    window.h2hRoomActive=()=>true;
    const cpu=(i,h)=>({o:{n:"CPU"+i,ovr:70},home:!!h,jelolt:"cpu"+i});
    const duel=r=>({duel:true,round:r,home:false,o:{n:"⚔ A társad",ovr:0}});
    const kep=()=>({hossz:S.fixtures.length,
      parharcok:S.fixtures.map((f,i)=>f&&f.duel?i+1:0).filter(Boolean),
      lyuk:S.fixtures.filter(f=>!f||(!f.duel&&!f.o)).length});

    /* --- 4. A BEKÜLDÖTT MENTÉS ALAKJA: 32 forduló, 29. forduló után --- */
    {const a=[];for(let i=0;i<32;i++)a.push(cpu(i,i%2===0));
     a[14]=duel(15);a[29]=duel(30);
     S.fixtures=a;S.idx=29;
     const elotte=kep();
     const fej=a.slice(0,29).map(f=>f.duel?"D":f.jelolt);
     ki.h32={elotte,baj:fixturesRepair(),utana:kep(),
       fejEgyezik:S.fixtures.slice(0,29).map(f=>f.duel?"D":f.jelolt).join()===fej.join()};}

    /* --- 5. A TESZTELŐ KLIENSÉNEK ALAKJA: 22 forduló, párharc a 22.-en --- */
    {const a=[];for(let i=0;i<22;i++)a.push(cpu(i,i%2===0));
     a[14]=duel(15);a[21]=duel(22);
     S.fixtures=a;S.idx=21;
     const fej=a.slice(0,21).map(f=>f.duel?"D":f.jelolt);
     ki.h22={elotte:kep(),baj:fixturesRepair(),utana:kep(),
       fejEgyezik:S.fixtures.slice(0,21).map(f=>f.duel?"D":f.jelolt).join()===fej.join(),
       huszkettoRendes:!!(S.fixtures[21]&&!S.fixtures[21].duel&&S.fixtures[21].o)};}

    /* --- A JÓ MENETREND VÁLTOZATLAN MARAD (nem „javítunk" ép mentést) --- */
    {const a=[];for(let i=0;i<28;i++)a.push(cpu(i,i%2===0));
     const j=fixturesFitToSeason(a,Math.random);
     S.fixtures=j;S.idx=7;
     const elotte=JSON.stringify(S.fixtures);
     ki.ep={baj:fixturesRepair(),valtozatlan:JSON.stringify(S.fixtures)===elotte,hossz:S.fixtures.length};}
    window.h2hRoomActive=_h;

    /* --- 6. A SZELLEMMECCS ELLENI ZÁR (szoba nélkül: a 4. forduló EGYÉNI
           karrierben nem lehet párharc, mégis párharc-helyfoglaló áll ott) --- */
    {S.fixtures=fixturesFitToSeason(
       Array.from({length:30},(_,i)=>({o:{n:"CPU"+i,ovr:70},home:i%2===0})),Math.random);
     S.idx=3;S.fixtures[3]={duel:true,round:4,home:false,o:{n:"⚔ A társad",ovr:0}};
     S.playing=false;S.lastMatch=null;
     const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
     let dob=null;try{startRoundNow();}catch(e){dob=String(e);}
     addLine=_a;
     ki.zar={dob,jatszik:!!S.playing,
       negyedikRendes:!!(S.fixtures[3]&&!S.fixtures[3].duel&&S.fixtures[3].o),
       hossz:S.fixtures.length,
       szoltHelyre:naplo.some(x=>/Menetrend helyreállítva/.test(x)),
       szoltUjra:naplo.some(x=>/indítsd újra a kezdőrúgást/.test(x))};}

    /* --- ÜRES MENETREND: ebből még FÖL TUD ÉPÜLNI a mezőnyből --- */
    {S.fixtures=[];S.idx=0;S.playing=false;
     const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
     let dob=null;try{startRoundNow();}catch(e){dob=String(e);}
     addLine=_a;
     ki.zarUres={dob,jatszik:!!S.playing,hossz:(S.fixtures||[]).length,
       szolt:naplo.some(x=>/Menetrend helyreállítva/.test(x))};}

    /* --- ÉS AMIT TÉNYLEG NEM TUD HELYREÁLLÍTANI (nincs is menetrend-tömb),
           azt nem játssza le, hanem megáll és szól --- */
    {S.fixtures=null;S.idx=0;S.playing=false;
     const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
     let dob=null;try{startRoundNow();}catch(e){dob=String(e);}
     addLine=_a;
     ki.zarNincs={dob,jatszik:!!S.playing,
       szolt:naplo.some(x=>/menetrendje hibás/.test(x))};}
    return ki;});

  console.log("=== 4. helyreállítás: 32 fordulós mentés (a beküldött alak) ===");
  ok(rep.h32.elotte.hossz===32,"a bemenet tényleg 32 fordulós volt",rep.h32.elotte);
  ok(rep.h32.baj>0,"a hibát fölismerte",{baj:rep.h32.baj});
  ok(rep.h32.utana.hossz===30&&rep.h32.utana.parharcok.join()==="15,30"&&rep.h32.utana.lyuk===0,
    "utána 30 forduló, párharc 15/30",rep.h32.utana);
  ok(rep.h32.fejEgyezik===true,"a LEJÁTSZOTT 29 fordulóhoz nem nyúlt");

  console.log("=== 5. helyreállítás: 22 fordulós mentés, párharc a 22.-en ===");
  ok(rep.h22.elotte.hossz===22&&rep.h22.elotte.parharcok.join()==="15,22",
    "a bemenet a tesztelő képernyőjének alakja",rep.h22.elotte);
  ok(rep.h22.baj>0,"a hibát fölismerte",{baj:rep.h22.baj});
  ok(rep.h22.utana.hossz===30&&rep.h22.utana.parharcok.join()==="15,30"&&rep.h22.utana.lyuk===0,
    "utána 30 forduló, párharc 15/30",rep.h22.utana);
  ok(rep.h22.fejEgyezik===true,"a LEJÁTSZOTT 21 fordulóhoz nem nyúlt");
  ok(rep.h22.huszkettoRendes===true,"a 22. fordulón mostantól rendes bajnoki áll");
  ok(rep.ep.baj===0&&rep.ep.valtozatlan===true&&rep.ep.hossz===30,
    "az ÉP menetrendhez hozzá sem nyúl",rep.ep);

  console.log("=== 6. a szellemmeccs elleni zár ===");
  ok(!rep.zar.dob,"a zár nem dob kivételt",rep.zar.dob);
  ok(rep.zar.jatszik===false,"nem indult el hamis mérkőzés");
  ok(rep.zar.negyedikRendes===true&&rep.zar.hossz===30,"a forduló helyreállt",rep.zar);
  ok(rep.zar.szoltHelyre&&rep.zar.szoltUjra,"a napló elmondja, mi történt és mi a teendő",
    {helyre:rep.zar.szoltHelyre,ujra:rep.zar.szoltUjra});
  ok(!rep.zarUres.dob&&rep.zarUres.jatszik===false&&rep.zarUres.hossz===30&&rep.zarUres.szolt===true,
    "ÜRES menetrend: a mezőnyből újraépül, meccs nem indul",rep.zarUres);
  ok(!rep.zarNincs.dob&&rep.zarNincs.jatszik===false&&rep.zarNincs.szolt===true,
    "helyreállíthatatlan menetrendnél megáll és szól",rep.zarNincs);

  /* ================= 7. A TÁRS CÍMÉNEK KÉPERNYŐJE ================= */
  const kep=await p.evaluate(()=>{
    const ki={};
    ki.rang={
      tars2:mateFinalRank([{n:"A",you:true},{n:"B",mate:true}]),
      tars1:mateFinalRank([{n:"B",mate:true},{n:"A",you:true}]),
      nincs:mateFinalRank([{n:"A",you:true},{n:"C"}]),
      ures:mateFinalRank(null)};
    const t=[{n:"Társ FC",mate:true,pts:80,w:26,d:2,l:2,gf:90,ga:20},
             {n:"Teszt FC",you:true,pts:78,w:25,d:3,l:2,gf:88,ga:22}];
    showMateChampionScreen(t);
    const g=id=>{const e=document.getElementById(id);return e?(e.textContent||"").trim():null;};
    ki.modal={rejtve:document.getElementById("championModal").classList.contains("hide"),
      kicker:g("champKicker"),cim:g("champTitle"),
      sub:g("champSub"),meta:g("champMeta")};
    ki.klub=teamName;
    document.getElementById("championModal").classList.add("hide");
    return ki;});
  console.log("=== 7. mateFinalRank és a képernyő ===");
  ok(kep.rang.tars2===2&&kep.rang.tars1===1&&kep.rang.nincs===0&&kep.rang.ures===0,
    "mateFinalRank helyezést ad, hiányzó társnál 0-t",kep.rang);
  ok(kep.modal.rejtve===false,"a képernyő tényleg megjelent");
  ok(kep.modal.kicker==="A SZOBA ARANYA","a felütés a közös címről szól",kep.modal.kicker);
  ok(/Társ FC/.test(kep.modal.sub||"")&&kep.klub&&kep.modal.sub.indexOf(kep.klub)>=0,
    "mindkét klub neve szerepel",{sub:kep.modal.sub,klub:kep.klub});
  ok(/78 pont/.test(kep.modal.meta||"")&&/80 pont/.test(kep.modal.meta||""),
    "a saját és a társ pontszáma is ott van",kep.modal.meta);

  /* ================= 8-9. AZ ÉLES ÁG A SZEZONZÁRÁSBAN =================
     Négy felállás, mindegyik FRISS oldalon: a finish() szezont zár, tehát egy
     futásban nem lehet négyszer megnézni. */
  const eset=async(nev,cfg)=>{
    await nyit();
    const r0=await p.evaluate(BOOT);
    if(r0!==true)return {nev,boot:false};
    return await p.evaluate(c=>{
      const ki={nev:c.nev,boot:true};
      window.h2hRoomActive=()=>!!c.szoba;
      window.mpMateFinal=()=>true;
      window.mpTableNow=()=>null;
      /* A végtabella kézzel: a helyezés a SORREND. */
      const sor=(n,f)=>({n,...f,pts:70,w:22,d:4,l:4,gf:70,ga:30,gd:40});
      S.finalTable=c.tabla.map((x,i)=>sor("Klub"+i,x));
      S.seasonClosed=false;S.mpMateTitleSeason=null;S.titleWonSeason=null;
      S.consecutiveTitles=0;
      let hivva=0,arg=null;
      window.showMateChampionScreen=t=>{hivva++;arg=(t||[]).length;};
      window.showChampionScreen=()=>{};
      const naplo=[];const _a=addLine;addLine=t=>naplo.push(String(t));
      let dob=null;try{finish();}catch(e){dob=String(e);}
      addLine=_a;
      ki.dob=dob;ki.hivva=hivva;ki.arg=arg;
      ki.jelzo=S.mpMateTitleSeason;ki.szezon=S.seasonNumber||1;
      ki.sajatCim=S.titleWonSeason;ki.sorozat=S.consecutiveTitles||0;
      ki.naplo=naplo.some(x=>/A társad a bajnok/.test(x));
      /* MÁSODSZOR IS? A jelzőnek ki kell zárnia (újratöltés utáni konfetti). */
      S.seasonClosed=false;
      try{finish();}catch(e){}
      ki.masodszor=hivva;
      return ki;},cfg);};

  const e1=await eset("társ 1., te 2., szobában",{nev:"a",szoba:true,tabla:[{mate:true},{you:true},{},{}]});
  const e2=await eset("társ 1., te 3.",         {nev:"b",szoba:true,tabla:[{mate:true},{},{you:true},{}]});
  const e3=await eset("te 2., de nem a társ az 1.",{nev:"c",szoba:true,tabla:[{},{you:true},{mate:true},{}]});
  const e4=await eset("nincs szoba",            {nev:"d",szoba:false,tabla:[{mate:true},{you:true},{},{}]});

  console.log("=== 8. a szezonzárás a társ címénél is ünnepel ===");
  ok(e1.boot===true&&!e1.dob,"a szezonzárás lefutott",{dob:e1.dob});
  ok(e1.hivva===1,"a képernyő PONTOSAN egyszer jött elő",{hivva:e1.hivva});
  ok(e1.naplo===true,"a napló is kimondja");
  ok(e1.jelzo===e1.szezon,"a szezonjelző beállt",{jelzo:e1.jelzo,szezon:e1.szezon});
  ok(e1.masodszor===1,"újratöltés / második zárás után nem ismétli",{db:e1.masodszor});
  console.log("--- és a SAJÁT könyveléshez nem nyúl ---");
  ok(e1.sajatCim===null,"a titleWonSeason érintetlen (nem lettél te bajnok)",{v:e1.sajatCim});
  ok(e1.sorozat===0,"a consecutiveTitles nem nőtt",{v:e1.sorozat});

  console.log("=== 9. a három nemleges eset ===");
  ok(e2.hivva===0,"társ 1., te 3. → nincs képernyő (nem csak a társ előzi meg)",{hivva:e2.hivva});
  ok(e3.hivva===0,"te 2., de az 1. nem a társad → nincs képernyő",{hivva:e3.hivva});
  ok(e4.hivva===0,"egyjátékos → nincs képernyő",{hivva:e4.hivva});

  const sulyos=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(sulyos.length===0,"nincs oldalhiba",sulyos.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})().catch(e=>{console.error(e);srv.close();process.exit(1);});
