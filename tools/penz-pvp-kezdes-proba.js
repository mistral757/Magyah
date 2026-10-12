/* 💰🤝 PÉNZ ÉS PvP-KEZDÉS (3.9.224)

   BEJELENTÉS (PvP, 3. idény, 25:4-es párharc-mérleg): „1. a kezdő erősség a
   két csapatnál nagyon sokat számít, akár 1 rating különbség a draftban is
   óriásit dobhat. 2. Ha sikerül valamivel megdobni a pénzbevételt, akkor
   megnyerted a játékot […] a sztárom a párom pl. ha második szezon végén
   eladja a sztárját akkor kb 30-40k Mrd készpénzre tesz szert […] van egy
   slight hangolás a draft után első szezon kezdete előtt is. (Erről nem kell
   szólni a játékosoknak, csak erősítsük fel mindig a gyengébbet annyira, hogy
   legfeljebb 0.75 rating különbség legyen a kezdő meccserőben)"

   Amit mér:
     1. AZ ELADÁSI PLAFON: a másfél idénynyi működési keret alatt az ár betűre
        a régi; fölötte logaritmikusan nő (monoton, folytonos); egy kirívó
        sztár ára a keret néhányszorosára esik vissza; a gyors eladás és a
        kijelzés ugyanazt a plafonos számot látja;
     2. A HÍRNÉV: a sztár-hozta tömeg legfeljebb az organikus tábor; a reklám
        és a befektető idényenként legfeljebb a működési keret 60%-a;
     3. A BEFEKTETÉS legfeljebb egy idénynyi működési keret;
     4. A PvP KEZDŐ KIEGYENLÍTÉS: a gyengébb oldal pontosan 0,75-re zárkózik
        fel, az erősebb nem mozdul; egyszer fut, csak az 1. idény előtt; a
        nyers erő és a szezonvégi plafon nem látja; a mentés viszi;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9462;
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
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
  await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});


  /* ---- 1. AZ ELADÁSI PLAFON ---- */
  const e=await p.evaluate(()=>{
    const ki={};
    _saleCoreMemo=null;
    ki.core=seasonBudgetCore();ki.T=saleSoftT();
    const T=ki.T;
    ki.alatt=[saleSoftCap(Math.round(T*0.5)),Math.round(T*0.5),saleSoftCap(Math.round(T))];
    ki.folott=[2,10,1000,4000].map(x=>saleSoftCap(Math.round(T*x))/T);
    let mono=true,prev=0;for(let x=0.1;x<5000;x*=1.3){const v=saleSoftCap(T*x);if(v<prev-1)mono=false;prev=v;}
    ki.mono=mono;
    /* egy kirívó sztár: óriás POT, legendás kártya, teljes életmű */
    const nm=slots.find(s=>s.player).player.n;
    const ent=careerPool[nm];
    const old={pot:ent.pot,peak:ent.peak,startRating:ent.startRating,age:ent.age};
    ent.pot=400000;ent.peak=190;ent.startRating=185;ent.age=26;
    const pl=Object.assign({},ent,{n:nm});
    const _gm=gameMode;
    gameMode="arcade";const nyers=saleAskPrice(pl);gameMode=_gm;
    ki.sztar={nyers,most:saleAskPrice(pl),gyors:sellValue(pl),T,disc:SELL_DISCOUNT};
    ki.note=/Piaci plafon/.test(saleSoftNote(pl));
    Object.assign(ent,old);
    ki.noteKicsi=saleSoftNote(Object.assign({},ent,{n:nm}))==="";
    return ki;});
  console.log("— 1. AZ ELADÁSI PLAFON —");
  ok(e.core>0&&Math.abs(e.T-1.5*e.core)<1e-6,"a küszöb a működési keret másfélszerese",{core:e.core,T:e.T});
  ok(e.alatt[0]===e.alatt[1]&&e.alatt[2]===Math.round(e.T),"a küszöb alatt az ár betűre a régi",e.alatt);
  ok(Math.abs(e.folott[0]-(1+0.25*Math.log(2)))<1e-3&&Math.abs(e.folott[1]-(1+0.25*Math.log(10)))<1e-3&&e.folott[3]<3.2,
     "fölötte logaritmikus: ×2 → +17%, ×10 → +58%, ×4000 → ~3,1× a küszöb",e.folott);
  ok(e.mono,"monoton: a drágább ember sosem ér kevesebbet");
  ok(e.sztar.nyers>e.sztar.T*50&&e.sztar.most<e.sztar.T*3.2&&Math.abs(e.sztar.gyors-Math.round(e.sztar.most*e.sztar.disc))<=1,
     "egy kirívó sztár: a nyers ár a keret sokszorosa, a plafonos legfeljebb ~3×, a gyors eladás ugyanebből számol",e.sztar);
  ok(e.note&&e.noteKicsi,"a piaci plafon csak akkor szól, ha tényleg fog");

  /* ---- 2. A HÍRNÉV ---- */
  const f=await p.evaluate(()=>{
    const ki={};
    const F={pts:0,season:0,seasonNo:S.seasonNumber||1,startSeason:1,src:{},hist:[],ev:{surge:0,ad:0,inv:0},fanBoost:0,adIncome:0,invIncome:0};
    const _fs=fameState,_fn=fameStarName,_fl=fameLevel,_r=Math.random,_add=addLine,_fw=fanWeeklyIncome;
    fameState=()=>F;fameStarName=()=>"Próba Sztár";fameLevel=()=>5;addLine=()=>{};
    const B=seasonBudgetCore();
    fanWeeklyIncome=()=>B;   /* óriás heti lelátó: a reklám nyersen a keret sokszorosa volna */
    const tb0=S.transferBudget=1000;
    try{
      Math.random=()=>0;   /* minden esemény elsül, a legkisebb százalékkal */
      for(let i=0;i<30;i++){F.ev={surge:0,ad:0,inv:0};fameRevenueTick();}
    }finally{fameState=_fs;fameStarName=_fn;fameLevel=_fl;Math.random=_r;addLine=_add;fanWeeklyIncome=_fw;}
    ki.cash=[F.cashSz&&F.cashSz.got,B*FAME_CASH_CAP];
    ki.boost=[F.fanBoost,fanBase()-F.fanBoost];
    return ki;});
  console.log("\n— 2. A HÍRNÉV —");
  ok(f.cash[0]>0&&f.cash[0]<=f.cash[1]+1,"a reklám és a befektető együtt legfeljebb a működési keret 60%-a az idényben",f.cash);
  ok(f.boost[0]>0&&f.boost[0]<=f.boost[1]*1+1,"a sztár-hozta tömeg legfeljebb az organikus tábor",f.boost);

  /* ---- 3. A BEFEKTETÉS ---- */
  const v=await p.evaluate(()=>{
    let box=$("hubInvestBox");
    if(!box){box=document.createElement("div");box.id="hubInvestBox";document.body.appendChild(box);}
    S.investPending=true;S.transferBudget=seasonBudgetCore()*40;
    renderInvestOffer();
    const sz=[...box.querySelectorAll("button")].map(b=>b.firstChild&&b.firstChild.textContent).filter(Boolean);
    const core=seasonBudgetCore();
    S.investPending=false;
    return {core,szoveg:/egy idénynyi működési keretet/.test(box.textContent),gombok:sz.length};});
  const cap=await p.evaluate(()=>{S.investPending=true;S.transferBudget=seasonBudgetCore()*40;
    const _c=Math.floor(Math.min((S.transferBudget||0)/2,seasonBudgetCore())/500)*500;S.investPending=false;return _c;});
  console.log("\n— 3. A BEFEKTETÉS —");
  ok(v.szoveg&&v.gombok>=2&&cap<=v.core,"a befektetés legfeljebb egy idénynyi működési keret (a büdzsé 40-szerese mellett is)",{v,cap});

  /* ---- 4. A PvP KEZDŐ KIEGYENLÍTÉS ---- */
  const q=await p.evaluate(()=>{
    const ki={};
    S.seasonHistory=[];S.mpStartP=null;S.mpStartEq=null;S.mpBalanceP={};S.mpBalance=0;
    const raw0=mpRawStrength(),ms0=mpStartMeasure();
    /* az erősebb oldal: nem mozdul */
    const E1=mpStartEqualize(ms0,ms0-2);
    ki.eros=[E1&&E1.moved,S.mpStartP];
    S.mpStartEq=null;
    /* a gyengébb oldal: 3 meccserővel elmarad → 0,75-re zárkózik */
    const E2=mpStartEqualize(ms0,ms0+3);
    ki.ms1=mpStartMeasure();ki.gyenge=[E2.moved,E2.n,E2.capped,ki.ms1-ms0];
    ki.uj=mpStartEqualize(ms0,ms0+10)===S.mpStartEq&&Math.abs(mpStartMeasure()-ki.ms1)<1e-9;
    ki.raw=[raw0,mpRawStrength()];
    ki.offset=mpBalanceOffset(Object.keys(S.mpStartP)[0]);
    ki.tuneCap=mpTuneCap();ki.balP=Object.keys(S.mpBalanceP||{}).length;
    /* a 2. idényben már nem fut */
    S.mpStartEq=null;const sp=S.mpStartP;S.mpStartP=null;S.seasonHistory=[{}];
    ki.masodik=mpStartEqualize(ms0,ms0+3);ki.masodikP=S.mpStartP;
    S.seasonHistory=[];S.mpStartP=sp;S.mpStartEq={done:1};
    /* kicsi különbség (0,5): nincs mit tenni */
    S.mpStartEq=null;S.mpStartP=null;
    const E3=mpStartEqualize(ms0,ms0+0.5);ki.kicsi=[E3.moved,S.mpStartP];
    /* a mentés viszi */
    S.mpStartEq=null;S.mpStartP=null;mpStartEqualize(ms0,ms0+2);
    const P=JSON.stringify(S.mpStartP);
    saveGame();
    const d=JSON.parse(localStorage.getItem(saveKey())||"null");
    ki.mentes=!!(d&&d.S&&d.S.mpStartP&&JSON.stringify(d.S.mpStartP)===P&&d.S.mpStartEq&&d.S.mpStartEq.done);
    return ki;});
  console.log("\n— 4. A PvP KEZDŐ KIEGYENLÍTÉS —");
  ok(q.eros[0]===0&&!q.eros[1],"az erősebb oldal nem mozdul",q.eros);
  ok(Math.abs(q.gyenge[3]-2.25)<0.02&&q.gyenge[1]===11&&!q.gyenge[2],"a gyengébb oldal 3-ból 0,75-re zárkózik fel (+2,25), a 11 legnagyobb potenciálú emberen",q.gyenge);
  ok(q.uj,"egyszer fut: a második hívás nem mozdít");
  ok(Math.abs(q.raw[0]-q.raw[1])<1e-9&&q.offset>0&&q.balP===0,"a nyers erő és a szezonvégi hangolás táblája nem látja, a kiolvasás igen",{raw:q.raw,off:q.offset,balP:q.balP});
  ok(q.masodik===null&&!q.masodikP,"a 2. idény előtt már nem fut",q.masodik);
  ok(q.kicsi[0]===0&&!q.kicsi[1],"0,75-ön belüli különbségnél nincs mit tenni",q.kicsi);
  ok(q.mentes,"a mentés viszi a táblát és a „lefutott” jelet");

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
