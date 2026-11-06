/* 🎯 A RUN-CÉL, AZ AJÁNLOTT D3 ÉS A MENEDZSMENT-CÉLKITŰZÉSEK (1.0.4.13.00).

   KÉRÉS: „a Run szintet mindig úgy kapja meg a játékos, hogy a választott kezdő
   divíziótól kettővel feljebbi szinten, ha tud bajnokságot nyerni, akkor megvan
   a Run szint. A számításon nem kell változtatni." · „legyen az ajánlott kezdő
   szint mindig a d3" · „a karrier kezdésénél legyen egy menedzsment
   célkitűzések ablak: nyerd meg ezt és ezt a divíziót — a nevével".

   Amit mér:
     1. az ajánlott kezdő szint a D3, az osztályválasztó jelöli, és minden sor
        névvel kiírja a hozzá tartozó Run-célt;
     2. a karrier kezdetén felugrik a célkitűzés-ablak a Run-cél NEVÉVEL;
     3. a D4-es cím még nem, a D3-as (D5-ből indulva) már meghozza a Run-t: a
        ranglistára kerül, jön a záróképernyő, a HUB sora teljesítettet mutat;
     4. a Run számítása nem változik (az élvonalbeli cím bélyege érintetlen);
     5. a régi karrier naplójából a cél utólag is felismerhető;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9413;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);


  const r=await p.evaluate(()=>{
    const o={};
    unlockGatesOn=()=>false;pendingWorldSeed="RUNCEL13";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    o.ajanlott=pyrRecommendDiv(pyrPickSq,pyrPendingSpeed,0);
    renderPyrDivPick();
    o.kijelolt=pyrPickDiv;
    const sorok=[...document.querySelectorAll("#pyrDivPickList button")].map(b=>b.textContent.replace(/\s+/g," ").trim());
    o.d3=sorok.find(t=>/^D3 /.test(t))||"";o.d5=sorok.find(t=>/^D5 /.test(t))||"";
    o.ajanlottDb=sorok.filter(t=>/AJÁNLOTT/.test(t)).length;
    document.querySelector("#pyrDiffList [data-nfpick='4']").click();
    pyrPickDiv=5;renderPyrDivPick();
    pyrConfirmDiv();
    return o;});
  ok(r.ajanlott===3&&r.kijelolt===3,"1a. az ajánlott (és előre kijelölt) kezdő szint a D3",{a:r.ajanlott,k:r.kijelolt});
  ok(/AJÁNLOTT/.test(r.d3)&&r.ajanlottDb===1,"1b. az osztályválasztó a D3-at jelöli ajánlottnak",r.d3);
  ok(/Run-cél: Biszem-baszom premier líg/.test(r.d3)&&/Run-cél: Magyah Élmezőny/.test(r.d5)&&!/Run-cél: D\d/.test(r.d5),"1c. minden sor névvel írja ki a Run-célt (D3 → élvonal, D5 → D3)",{d3:r.d3,d5:r.d5});
  await p.waitForTimeout(300);
  const m=await p.evaluate(()=>{
    const mod=$("mgmtModal");const vis=mod&&!mod.classList.contains("hide");
    const t=(($("mgmtBody")||{}).textContent||"").replace(/\s+/g," ");
    $("mgmtOk").click();
    return {vis,t,zar:mod.classList.contains("hide"),seen:!!S.mgmtSeen,start:S.pyr&&S.pyr.startDiv,goal:pyrRunGoalDivId()};});
  ok(m.vis&&m.start===5&&m.goal===3,"2a. a karrier kezdetén felugrik a célkitűzés-ablak (D5-ből a cél a D3)",{vis:m.vis,start:m.start,goal:m.goal});
  ok(/Nyerd meg: Magyah Élmezőny/.test(m.t)&&/Magyah Harmadosztály mezőnyéből/.test(m.t)&&!/\bD\d\b/.test(m.t),"2b. a cél a divízió NEVÉVEL szerepel, D-szám nélkül",m.t.slice(0,300));
  ok(m.zar&&m.seen,"2c. a gomb bezárja, és egyszer jelenik meg",{zar:m.zar,seen:m.seen});
  const c=await p.evaluate(()=>{
    const o={};
    window.saveGame=()=>{};addLine=()=>{};pyrSay=()=>{};
    try{localStorage.removeItem(RUNBOARD_KEY);}catch(e){}
    const sn=S.seasonNumber||1,R=runInit();
    o.titleSeason0=R.pyrTitleSeason||null;
    /* D4-es cím: még nem a cél */
    S.pyr.my=4;S.titleWonSeason=sn;
    o.d4=runNotePyrGoal();o.d4earned=runBoardEarned();o.d4fin=runD1FinaleDue();
    /* D3-as cím: megvan */
    S.pyr.my=3;
    o.d3=runNotePyrGoal();o.goalSeason=R.pyrGoalSeason;
    o.lista=runBoardLoad().some(x=>x&&x.id===runBoardCareerId());
    o.earned=runBoardEarned();o.fin=runD1FinaleDue();
    o.ujra=runNotePyrGoal();
    o.titleSeason1=R.pyrTitleSeason||null;
    o.hub=mgmtHubHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    o.intro=runIntroHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");
    /* a következő idény: D2-es cím nem hoz új záróképernyőt, az élvonalbeli igen */
    S.seasonNumber=sn+1;S.pyr.my=2;S.titleWonSeason=sn+1;o.d2fin=runD1FinaleDue();
    S.pyr.my=1;o.d1fin=runD1FinaleDue();
    /* régi karrier: a bélyeg nélkül a naplóból */
    const keep=R.pyrGoalSeason;delete R.pyrGoalSeason;
    S.pyr.log=[{s:1,div:5,rank:1},{s:2,div:4,rank:2},{s:3,div:3,rank:1}];
    o.naplo=runBoardPyrGoalSeason();
    R.pyrGoalSeason=keep;
    return o;});
  ok(c.d4===false&&c.d4earned===false&&c.d4fin===false,"3a. a D4-es cím (a cél alatt) még nem hozza meg a Run-t",{d4:c.d4,e:c.d4earned,f:c.d4fin});
  ok(c.d3===true&&c.goalSeason>=1&&c.lista&&c.earned,"3b. a D3-as cím meghozza: bélyeg, ranglista-bejegyzés",{d3:c.d3,gs:c.goalSeason,lista:c.lista});
  ok(c.fin===true,"3c. a Run-cél címe a futás záróképernyőjét hozza",c.fin);
  ok(c.ujra===false,"3d. csak az első ilyen cím számít",c.ujra);
  ok(/teljesítve/.test(c.hub)&&/Magyah Élmezőny/.test(c.hub),"3e. a HUB célkitűzés-sora teljesítettet mutat",c.hub);
  ok(/A cél: Magyah Élmezőny megnyerése/.test(c.intro)&&/szabad pálya/.test(c.intro),"3f. a Run magyarázata a Run-célt nevezi meg",c.intro.slice(0,400));
  ok(c.d2fin===false&&c.d1fin===true,"3g. utána a köztes cím nem, az élvonalbeli cím igen hoz záróképernyőt",{d2:c.d2fin,d1:c.d1fin});
  ok(c.titleSeason0===null&&c.titleSeason1===null,"4. a Run számítása érintetlen: az élvonalbeli cím bélyege nem íródik a Run-céltól",{a:c.titleSeason0,b:c.titleSeason1});
  ok(c.naplo===3,"5. régi karrierben a naplóból is felismerhető a Run-cél címe",c.naplo);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
