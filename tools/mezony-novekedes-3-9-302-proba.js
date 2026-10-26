/* 📈 3.9.302 — A MEZŐNY IDÉNY KÖZBENI ERŐSÖDÉSE: MÉRT, PÉNZMAG- ÉS FOKOZAT-SZINTEZETT GÖRBE.

   KÉRÉS: „Jelentősen meg kell növelni a divíziók nehézségi szintjén belül az
   ellenfél fejlődési tempóját […] 8.5-ig érjen a teteje annak, amilyen
   fejlődésre most az eddigi mérések alapján mi képesek voltunk. Aztán
   9.1-től már jöjjön az, ami fölöttünk jár."

   Amit mér:
     1. az új karrier a 2. szerződéssel indul (S.pyr.gyv = 2);
     2. a szintezés: T(1.1) 0,30 · T(8.5) 1,00 · T(9.1) 1,10 · T(10.5) 1,45,
        monoton;
     3. a görbe: E = szint × R(idény) × P(pénz) × T × K − alapütem; az 1.
        idényben 0 (8.5-ön), a 4. idényben a szint ~40%-a; a gyorsabb
        pénz-tempó többet ad;
     4. a régi (gyv nélküli) karrier a 3.9.254 görbéjén marad;
     5. a fordulónkénti gyűjtés: 30 forduló alatt E-t gyűjt, ha az előnyöd a
        célrés fölött van; alatta (beragadás-őr) nem;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9302;
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
const KEP=process.argv[2]||null;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  const karrier=()=>p.evaluate(()=>{
    unlockGatesOn=()=>false;pendingWorldSeed="SULY0001";worldSeed=null;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    return {suly:S.pyr.suly,padlo:S.pyr.padlo};});
  console.log("— 1. az új karrier —");
  const k1=await karrier();
  const g=await p.evaluate(()=>({gyv:S.pyr.gyv,szint:pyrLevel(),fok:nfFokSzam()}));
  ok(g.gyv===2,"az új karrier a 2. szerződéssel indul",g);

  console.log("\n— 2. a szintezés —");
  const t=await p.evaluate(()=>[1.1,4.3,8.1,8.5,8.8,9.1,10,10.5].map(f=>Math.round(nfGyors2Tier(f)*1000)/1000));
  ok(t[0]===0.3&&t[3]===1&&t[5]===1.1&&t[7]===1.45&&t.every((v,i)=>!i||v>=t[i-1]),"T: 1.1→0,30 · 8.5→1,00 · 9.1→1,10 · 10.5→1,45, monoton",t);

  console.log("\n— 3. a görbe —");
  const e=await p.evaluate(()=>{const o={};const P=S.pyr;
    P.fok={nf:8,s:5,egyeni:false};
    const _t=window.tempoMultAx;
    window.tempoMultAx=ax=>ax==="penz"?GAME_TEMPO.gleccser.k:_t(ax);   /* a mért karrierek pénze */
    o.E1=nfGyors2Teljes(1,pyrMyDivId());o.E2=nfGyors2Teljes(2,pyrMyDivId());o.E4=nfGyors2Teljes(4,pyrMyDivId());
    o.szint=pyrLevel();o.arany4=Math.round(o.E4/o.szint*100);
    P.fok={nf:9,s:1,egyeni:false};o.E1hc=nfGyors2Teljes(1,pyrMyDivId());o.E4hc=nfGyors2Teljes(4,pyrMyDivId());
    P.fok={nf:8,s:5,egyeni:false};
    window.tempoMultAx=ax=>ax==="penz"?GAME_TEMPO.normal.k:_t(ax);
    o.E4penz=nfGyors2Teljes(4,pyrMyDivId());
    o.regi=(()=>{const v=P.gyv;delete P.gyv;const r=nfGyorsTeljes(4,pyrMyDivId());P.gyv=v;return r;})();
    window.tempoMultAx=ax=>ax==="penz"?GAME_TEMPO.gleccser.k:_t(ax);
    o.uj=nfGyorsTeljes(4,pyrMyDivId());window.tempoMultAx=_t;
    return o;});
  ok(e.E1===0&&e.E2>0&&e.E4>e.E2,"8.5-ön: 1. idény 0, a 2.-tól nő",e);
  ok(e.arany4>=35&&e.arany4<=45,"a 4. idényben a szint ~40%-a (a mért +41% medián)",e);
  ok(e.E1hc>0&&e.E4hc>e.E4,"9.1-től már az 1. idényben is, és a 4.-ben több, mint 8.5-ön",e);
  ok(e.E4penz>e.E4,"gyorsabb pénz-tempó → gyorsabb mezőny",e);
  ok(e.uj===e.E4&&e.regi<e.uj&&e.regi<=11.5,"a régi karrier a régi görbén (≤ ~+10), az új az újon",e);

  console.log("\n— 5. a fordulónkénti gyűjtés —");
  const f=await p.evaluate(()=>{const o={};const P=S.pyr;
    P.fok={nf:8,s:5,egyeni:false};S.seasonNumber=4;S.seasonClosed=false;phase="season";
    const E=nfGyorsTeljes(4,pyrMyDivId());
    P.gyors=null;const _g=window.teamMatchStrength;
    window.teamMatchStrength=()=>oppMatchStrength()+50;   /* bőven a célrés fölött */
    for(let i=1;i<=30;i++){S.idx=i;nfGyorsTick();}
    o.E=E;o.acc=nfGyorsAcc();
    P.gyors=null;window.teamMatchStrength=()=>oppMatchStrength()-5;   /* a célrés alatt */
    for(let i=1;i<=30;i++){S.idx=i;nfGyorsTick();}
    o.accLe=nfGyorsAcc();
    window.teamMatchStrength=_g;S.idx=0;
    return o;});
  ok(Math.abs(f.acc-f.E)<0.05,"30 forduló alatt a teljes E gyűlik (a célrés fölött)",f);
  ok(f.accLe===0,"a célrés alatt nincs gyorsulás (beragadás-őr)",f);

  console.log("\n— 6. hibák —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
