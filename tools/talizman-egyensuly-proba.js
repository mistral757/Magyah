/* ⚖️ TALIZMÁNOK F9 — AZ EGYENSÚLY MÉRÉSE (3.9.161).

   A terv 17. pontjának két korlátja:
     · a pakli meccserő-hozama a 10. idényben legfeljebb +1,5 OVR;
     · a bevételi hozam legfeljebb +15%.

   A MÉRÉS: 10 karrier × 10 idény = 100 idény, a VALÓDI kínálattal
   (talKinalat) és választással (talValaszt). Idényenként 5 húzás (3
   ütemezett + 2 mérföldkő-csere — a plafon közelében, tehát inkább
   felülbecsül). A választó „ésszerű menedzser": a legritkább lapot viszi, és
   azonos ritkaságnál a domináns színt (specializál — ez a legerősebb út).
   Égetés és passz nincs. Mindkét korlátot két stratégiával mérjük: a
   specializálóval és a „meccsre építővel" (mindig a Meccs lapot viszi, ha van).

   A MECCSERŐ-HOZAM a motor saját mércéjével: hiddenMatchBonus() a paklival és
   nélküle ugyanazon a kereten (benne a Meccs tengelyek λ-ja, a feltétel
   nélküli meccs-speciálok, a taktika-illeszkedés és a stábhatás), plusz a
   morál-célra ható tagok meccserő-egyenértéke (moraleToOvr). A BEVÉTEL a
   Jobb üzletmenet (a bevételi kapu szorzója) — a pénzt hozó speciálok
   egyszeriek vagy feltételesek, azokat külön sorban mutatjuk.

   Amit még kiír (a kérés szerint): a színhűség, a morál-jel kontrák, az
   Ingyen ember token és a Bővített stáb előfordulása a mért paklikban. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9195;
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
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof talRez==="function",null,{timeout:15000});
  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.idx=0;S.transferBudget=5e9;S.morale=60;
    if(!S.tactics)S.tactics={active:null,levels:{}};
    S.tactics.active="kontra";S.tactics.levels.kontra=95;
    addLine=()=>{};saveGame=()=>{};fanWeeklyIncome=()=>1000000;budgetPay=()=>0;budgetEarn=()=>0;});

  const futas=async(strat)=>p.evaluate((strat)=>{
    const ki={ovr:[],bev:[],stack:0,jel:0,ingyen:0,bovitett:0,leg:0,mitosz:0,lap:0};
    const meres=()=>{
      const T=S.tal;S.tal=null;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;
      const h0=hiddenMatchBonus();
      S.tal=T;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;
      const h1=hiddenMatchBonus();
      const cel=talMoralCel()+talBuliCel()-talMoralCelMinusz();
      return {ovr:(h1-h0)+(moraleToOvr(50+cel)-moraleToOvr(50)),bev:talAlap("bank","bevetel")};};
    for(let k=0;k<10;k++){
      S.tal=null;S.seasonNumber=1;const T=talState();T.seed=12345+k*7919+(strat==="meccs"?1:0);
      for(let sz=1;sz<=10;sz++){
        S.seasonNumber=sz;
        for(let h=0;h<5;h++){
          T.varo=[{id:`m${k}-${sz}-${h}`,forras:"utem",n:1,szezon:sz,fordulo:3+h*5}];
          const kin=talKinalatFor(T.varo[0]);
          const dom=talDominans().k;
          let bi=0,bs=-1;
          kin.forEach((L,i)=>{
            const s=(strat==="meccs"&&L.kat==="meccs"?100:0)+L.rang*10+(L.kat===dom?5:0)+(L.spec?0:1)+(L.dobas||0);
            if(s>bs){bs=s;bi=i;}});
          const O=talFuzioJelolt(kin[bi]);
          talValaszt(bi,O?{fuzio:true}:undefined);}}
      const m=meres();ki.ovr.push(m.ovr);ki.bev.push(m.bev);
      const d=talEloszlas();
      if(TAL_KAT.some(K=>talStackFok(d[K.k])>0))ki.stack++;
      if(T.lapok.some(L=>["titanok","huseg","versenyszellem","fokusz"].indexOf(L.spec)>=0))ki.jel++;
      if(T.lapok.some(L=>L.spec==="ingyenember"))ki.ingyen++;
      if(T.lapok.some(L=>L.spec==="bovitett"))ki.bovitett++;
      ki.leg+=T.lapok.filter(L=>L.rang===4).length;ki.mitosz+=T.lapok.filter(L=>L.rang>=5).length;ki.lap+=T.lapok.length;}
    const atl=a=>a.reduce((x,y)=>x+y,0)/a.length;
    return {ovrAtl:atl(ki.ovr),ovrMax:Math.max(...ki.ovr),bevAtl:atl(ki.bev),bevMax:Math.max(...ki.bev),
      stack:ki.stack,jel:ki.jel,ingyen:ki.ingyen,bovitett:ki.bovitett,lapAtl:ki.lap/10,legAtl:ki.leg/10,mitosz:ki.mitosz};},strat);

  const sp=await futas("spec"),mc=await futas("meccs");
  const r2=x=>Math.round(x*100)/100;
  console.log("\n— A MÉRÉS: 10 karrier × 10 idény, idényenként 5 húzás —");
  console.log(`  specializáló: meccserő +${r2(sp.ovrAtl)} (max +${r2(sp.ovrMax)}) · bevétel +${r2(sp.bevAtl)}% (max +${r2(sp.bevMax)}%) · ${r2(sp.lapAtl)} lap, ${r2(sp.legAtl)} legendás, ${sp.mitosz} Mítosz`);
  console.log(`  meccsre építő: meccserő +${r2(mc.ovrAtl)} (max +${r2(mc.ovrMax)}) · bevétel +${r2(mc.bevAtl)}% (max +${r2(mc.bevMax)}%)`);
  console.log(`  előfordulás (a 10 specializáló paklin): színhűség ${sp.stack}/10 · morál-jel kontra ${sp.jel}/10 · Ingyen ember ${sp.ingyen}/10 · Bővített stáb ${sp.bovitett}/10`);
  console.log("\n— A TERV KORLÁTAI —");
  ok(sp.ovrAtl<=1.5&&mc.ovrAtl<=1.5,"a pakli meccserő-hozama a 10. idényben átlagosan legfeljebb +1,5 OVR (mindkét stratégiával)",{spec:r2(sp.ovrAtl),meccs:r2(mc.ovrAtl)});
  ok(sp.bevAtl<=15&&mc.bevAtl<=15,"a bevételi hozam legfeljebb +15%",{spec:r2(sp.bevAtl),meccs:r2(mc.bevAtl)});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
