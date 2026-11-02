/* 🧬 A TALIZMÁN-FÚZIÓ NEM LEHET GYENGÉBB A KÉT KÜLÖN LAPNÁL (3.9.344).

   KIMONDOTT PANASZ: „Talizmán összeolvasztás eredménye érzésem szerint sokszor
   egy gyengébb hatás, mintha mindkettőt megőriztem volna külön."

   Amit mér, minden ritkaság-párra (1+1, 2+2, 3+3, 4+1 [a legendás első
   gyűjtése], 4+4 [Mítosz], 1+3):
     1. ugyanazon a pakli-alapon a kategória-alaphatás (talAlap) a fúzió után
        ≥ a két külön lappal mért érték;
     2. a kategória darabszáma (színhűség, rezonancia) nem esik vissza;
     3. a special ereje legalább a külön állapotéval egyezik;
     4. ha a fúzió magától is erősebb (1+3), nincs fölösleges pótlék;
     5. a húzás-ablak gombja kimondja a garanciát; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9345;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=(e==null?1e-9:e)+1e-12;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
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
    phase="season";S.seasonNumber=3;S.idx=5;S.tal=null;S.transferBudget=5e9;S.morale=60;
    if(!scout)scout=generateScout();
    if(!S.tactics)S.tactics={active:null,levels:{}};
    if(!S.tactics.active||!TACTICS[S.tactics.active]){S.tactics.active="kontra";S.tactics.levels.kontra=80;}
    addLine=()=>{};saveGame=()=>{};fanWeeklyIncome=()=>1000000;
    window._nyar=v=>{twClosedNow=()=>!v;twWindowOpen=()=>false;};
    /* lapok: [kat, rang, spec|null, valt] */
    window._pakli=(lista)=>{
      S.tal=null;const T=talState();
      T.lapok=lista.map(([kat,rang,spec,valt],i)=>{const K=talKat(kat);
        const L={kat,rang,dobas:0.5,spec:spec||null,uid:i+1,szezon:S.seasonNumber||1};
        if(kat==="meccs")L.al=valt||"gol";else L.valt=valt||K.valt[0].k;return L;});
      T.seq=lista.length;T.huzas=5;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;_talKtx=null;return T;};
    window._szin=(kat,db,valt)=>Array.from({length:db},()=>[kat,1,null,valt]);});

  console.log("— 1–4. fúzió vs. két külön lap —");
  const r=await p.evaluate(()=>{
    const out=[];
    const eset=(rO,rL,alap)=>{
      const kesz=()=>{const T=_pakli([["fejlodes",rO,"specialista",null]].concat(alap));
        T.varo=[{id:"fz"+rO+rL,forras:"utem",n:1,szezon:3,fordulo:5,
          kinalat:[{kat:"fejlodes",rang:rL,dobas:0.5,spec:"specialista",valt:talKat("fejlodes").valt[0].k,cimke:"x"}]}];return T;};
      kesz();talValaszt(0,{});   /* külön lapként */
      const kulon={alap:talAlap("fejlodes",talKat("fejlodes").valt[0].k),db:talEloszlas().fejlodes,spec:talSpecV("specialista","pro")};
      kesz();const O=talValaszt(0,{fuzio:true});
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;
      const fuz={alap:talAlap("fejlodes",talKat("fejlodes").valt[0].k),db:talEloszlas().fejlodes,spec:talSpecV("specialista","pro"),rang:O.rang,fE:O.fE||0};
      out.push({par:rO+"+"+rL,alapLap:alap.length,kulon,fuz});};
    [[1,1],[2,2],[3,3],[4,1],[4,4],[1,3]].forEach(([a,b])=>{eset(a,b,[]);eset(a,b,_szin("fejlodes",3,talKat("fejlodes").valt[0].k));});
    return out;});
  for(const x of r){
    ok(x.fuz.alap>=x.kulon.alap-1e-9,`${x.par} (+${x.alapLap} lap): az alaphatás nem gyengébb (${x.kulon.alap.toFixed(2)} → ${x.fuz.alap.toFixed(2)})`,x.fuz);
    ok(x.fuz.db===x.kulon.db,`${x.par} (+${x.alapLap} lap): a darabszám ugyanannyi`,[x.kulon.db,x.fuz.db]);
    ok(x.fuz.spec>=x.kulon.spec-1e-9,`${x.par} (+${x.alapLap} lap): a special legalább olyan erős`,[x.kulon.spec,x.fuz.spec]);}
  const e13=r.find(x=>x.par==="1+3"&&x.alapLap===0);
  ok(e13&&e13.fuz.fE===0,"1+3: a ritkaság-ugrás magától is erősebb — nincs pótlék",e13&&e13.fuz);
  const e41=r.find(x=>x.par==="4+1"&&x.alapLap===0);
  ok(e41&&e41.fuz.rang===4&&e41.fuz.fE>0,"4+1: a legendás gyűjt, és a beolvasztott lap pótlékként megmarad",e41&&e41.fuz);

  console.log("\n— 5. a húzás-ablak —");
  const g=await p.evaluate(()=>{
    const T=_pakli([["stab",2,"mentor","hatas"]]);
    T.varo=[{id:"fzg",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[{kat:"stab",rang:2,dobas:0.4,spec:"mentor",valt:"hatas",cimke:"x"}]}];
    talDrawOpen(()=>{});
    document.querySelectorAll("#talDrawCards .talPickBtn")[0].click();
    const t=$("talDrawFuse").textContent;
    $("talDrawFuse").click();
    talMenuOpen();const sav=document.getElementById("talGrid").textContent;talMenuClose();
    return {t,sav:/🧬/.test(sav)};});
  ok(/legalább annyit ér, mint a kettő külön/.test(g.t),"a gomb kimondja a garanciát",g.t);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
