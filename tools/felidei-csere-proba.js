/* 🔁 3.9.166 — A FÉLIDEI TERVEZETT CSERE A FÉLIDŐ-SOR UTÁN.

   BEJELENTETT HIBA: „próbáltuk rendezni azt, hogy a 45. percben ütemezett
   cserék ne a félidő előtt jöjjenek be. Ennek eredménye az lett, hogy most
   50. percben jönnek be azok, akik 45-re vannak ütemezve. Ez így nem jó.
   Annyi, hogy a félidő feed szöveg után legyen, és funkcionálisan is
   onnantól legyenek ők érvényesen a csapat részei a pályán."

   Amit mér (valódi, végigjátszott egyjátékos mérkőzéseken):
     1. a 45. percre ütemezett csere sora KÖZVETLENÜL a FÉLIDŐ-sor után áll,
        „Csere a félidőben" felirattal — sehol nincs „a 50. percben";
     2. a FÉLIDŐ-sor pillanatában a beálló már a pályán van (MATCH_XI), tehát
        a 46. perctől ő játszik;
     3. a lecserélt pontosan a meccs felét kapja (0,5 részesedés);
     4. a 70. percre ütemezett csere „a 71. percben" jön — a vödör első
        percében, ahogy a párharc közös szimulációja is számol vele;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9200;
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
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof playMatch==="function"&&typeof subPlanState==="function",null,{timeout:15000});

  /* egy kész karrier-szezon, mint a hibak-3-9-151-próbában */
  const alap=await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    const uj=(src,pos)=>({n:src.n,ovr:src.ovr,pos:[pos],age:26});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const pl=uj(sq.players[i%sq.players.length],sl.pos);
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    /* két padember: egy középpályás és egy csatár, akik még nincsenek a pályán */
    const bent=new Set(slots.map(x=>x.player&&x.player.n));
    const tobbi=sq.players.filter(x=>!bent.has(x.n));
    BENCH.KOZEPPALYAS=uj(tobbi[0],"KKP");BENCH.CSATAR=uj(tobbi[1],"CS");
    [...slots.map(x=>x.player),BENCH.KOZEPPALYAS,BENCH.CSATAR].forEach(pl=>{if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.seasonNumber=1;S.transferBudget=5e9;S.morale=70;
    saveGame=()=>{};
    const kozep=slots.findIndex(x=>x.pos!=="KP"&&x.pos!=="CS"&&x.player);
    const csatar=slots.findIndex(x=>x.pos==="CS"&&x.player);
    return {kozep,csatar,be45:BENCH.KOZEPPALYAS.n,be70:BENCH.CSATAR.n,
      ki45:slots[kozep].player.n,ki70:slots[csatar>=0?csatar:kozep+1].player.n,csI:csatar>=0?csatar:kozep+1};});

  const meccs=await p.evaluate(async(A)=>{
    const futas=async()=>{
      S.halftimeSubs=true;S.subHalftimeStop=false;S.auto=true;
      subPlanState().rules=[
        {min:45,cond:"barmi",outIdx:A.kozep,inName:A.be45},
        {min:70,cond:"barmi",outIdx:A.csI,inName:A.be70}];
      const sorok=[];let xiFelidokor=null,reszesedes=null;
      const _add=addLine;
      addLine=function(h,c){
        const t=String(h).replace(/<[^>]+>/g,"");
        sorok.push(t);
        if(/^FÉLIDŐ/.test(t))xiFelidokor=null;
        /* a FÉLIDŐ-sor UTÁNI első sornál: ki áll a pályán? */
        if(sorok.length>=2&&/^FÉLIDŐ/.test(sorok[sorok.length-2]))
          try{xiFelidokor=MATCH_XI().map(x=>x.p.n);}catch(e){}
        return _add.apply(this,arguments);};
      try{
        S.unavailable={};S.lastMatch=null;S.idx=0;buildSeasonFixtures();
        playMatch();
        for(let i=0;i<400&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
      }finally{addLine=_add;}
      return {sorok,xiFelidokor,vege:!!S.lastMatch};};
    return await futas();},alap);

  const s=meccs.sorok;
  const iF=s.findIndex(t=>/^FÉLIDŐ/.test(t));
  const i45=s.findIndex(t=>/🔁 Csere/.test(t)&&t.includes("→"));
  const csere=s.filter(t=>/🔁 Csere/.test(t));
  console.log("\n— 1-2. A FÉLIDEI CSERE —");
  ok(meccs.vege&&iF>=0,"a meccs végigment, van FÉLIDŐ-sor",{iF,vege:meccs.vege});
  ok(i45===iF+1&&/Csere a félidőben/.test(s[i45]),"a 45. percre ütemezett csere KÖZVETLENÜL a FÉLIDŐ-sor után, „a félidőben”",{felido:s[iF],utana:s[iF+1]});
  ok(!csere.some(t=>/a 50\. percben/.test(t)),"sehol nincs „a 50. percben” csere",csere);
  ok(Array.isArray(meccs.xiFelidokor)&&meccs.xiFelidokor.includes(alap.be45)&&!meccs.xiFelidokor.includes(alap.ki45),
     "a félidő-sor után a beálló már a pályán van (a 46. perctől ő játszik)",{be:alap.be45,ki:alap.ki45});
  console.log("\n— 4. A KÉSŐBBI CSERE PERCE —");
  ok(csere.some(t=>/a 71\. percben/.test(t)),"a 70. percre ütemezett csere „a 71. percben” jön (a vödör első perce)",csere);

  /* 3. a lecserélt fele meccs: a doSub a halfOut-ba tett részesedés — a
     lefújás utáni fejlődés-elosztás ezt kapja. A stringből ellenőrizzük,
     hogy a félidei ág 45 perccel számol. */
  const kod=await p.evaluate(()=>String(playMatch));
  console.log("\n— 3. A JÁTÉKIDŐ-RÉSZESEDÉS —");
  ok(/const most=at==null\?min:\(at===45\?45:at-1\);/.test(kod),"a félidei csere a lecseréltnek pontosan 45 percet (0,5) ír, a vödör eleji a vödör előtti perceket");
  console.log("\n— 5. OLDALHIBA —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
