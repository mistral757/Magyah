/* 🧬 1.0.12.9.00 — A FÚZIÓ MINDKÉT ALAPHATÁST MEGŐRZI (🐞 jmww2se9aggzv).

   KIMONDOTT KÉRÉS: „egy legendás, ami minden boost árát csökkenti, össze lett
   olvasztva egy legendás POT-boost kedvezményes talizmánnal. A POT-boost
   kedvezmény elveszett. Mindkettő alaphatás is meg kell maradjon külön-külön,
   és a special hatások is. … mindezek megmaradnak és még erősödnek is."

   1. legendás Olcsóbb csomag + legendás Fajta-kedvezmény (POT), azonos special
      → Mítosz; a csomag-kedvezmény ÉS a POT fajta-kedvezmény is ≥ a külön
      értéknél (és a beolvasztott ×1,15-tel erősebb, a plafonon belül);
   2. a special legalább olyan erős, mint külön;
   3. a lapon látszik a beolvasztott alaphatás (🧬 + sor);
   4. lépcsős változat (Garantált scout-lépés) beolvasztva is hat;
   5. a fúzió eredménye mentés–betöltés után is ugyanaz;
   6. a sima választás is megtartja a célt (bf) — eddig elveszett —, és a régi
      mentés cél nélküli lapja determinisztikus célt kap; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9371;
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

  const r=await p.evaluate(()=>{
    const kesz=(O,L)=>{const T=_pakli([O]);
      T.varo=[{id:"fzb",forras:"utem",n:1,szezon:3,fordulo:5,kinalat:[L]}];return T;};
    const Ob=["boost",4,"torzsvasarlo","csomag"];
    const Lb=()=>({kat:"boost",rang:4,dobas:0.5,spec:"torzsvasarlo",valt:"fajta",bf:"pot",cimke:"x"});
    kesz(Ob,Lb());talValaszt(0,{});
    _talAlapMemo=null;_talSpecMemo=null;
    const kulon={cs:talAlap("boost","csomag"),pot:talBoostFajtaPct("pot"),spec:talSpecV("torzsvasarlo","pro")};
    kesz(Ob,Lb());const O=talValaszt(0,{fuzio:true});
    _talAlapMemo=null;_talSpecMemo=null;
    const fuz={cs:talAlap("boost","csomag"),pot:talBoostFajtaPct("pot"),spec:talSpecV("torzsvasarlo","pro"),rang:O.rang,db:S.tal.lapok.length,fuzAlap:O.fuzAlap};
    const html=talLapHtml(O,{});
    /* mentés-betöltés: JSON-kör */
    S.tal=JSON.parse(JSON.stringify(S.tal));_talAlapMemo=null;_talSpecMemo=null;
    const ujra={cs:talAlap("boost","csomag"),pot:talBoostFajtaPct("pot")};
    /* lépcsős: ügynökség garancia beolvasztva egy más célú lapba */
    const sp=TAL_SPEC.find(s=>s.k==="ugynok"&&s.min<=1);
    kesz(["ugynok",2,sp.id,"pont"],{kat:"ugynok",rang:2,dobas:0.5,spec:sp.id,valt:"garancia",cimke:"x"});
    talValaszt(0,{fuzio:true});_talAlapMemo=null;
    const gar=talUgyGaranciaFok(),pont=talAlap("ugynok","pont");
    kesz(["stab",1,null,"hatas"],Lb());const U=talValaszt(0,{});
    const valasztBf=U&&U.bf;
    _pakli([["boost",2,null,"fajta"]]);const R0=S.tal.lapok[0];delete R0.bf;_talAlapMemo=null;talAlapMind();
    const jav1=R0.bf;delete R0.bf;_talAlapMemo=null;talAlapMind();const jav2=R0.bf;
    return {valasztBf,jav1,jav2,kulon,fuz,ujra,html:/talSzellem/.test(html)&&/🧬 \+/.test(html),gar,pont,sp:sp.id};});
  console.log("— 1–3. Olcsóbb csomag + POT fajta-kedvezmény —");
  ok(r.fuz.db===1&&r.fuz.rang===5,"egy lap lett, Mítosz",{db:r.fuz.db,rang:r.fuz.rang});
  ok(r.fuz.cs>=r.kulon.cs-1e-9&&r.fuz.cs>0,`a csomag-kedvezmény megmaradt (${r.kulon.cs.toFixed(2)} → ${r.fuz.cs.toFixed(2)})`);
  ok(r.fuz.pot>=r.kulon.pot-1e-9&&r.fuz.pot>0,`a POT fajta-kedvezmény megmaradt (${r.kulon.pot.toFixed(2)} → ${r.fuz.pot.toFixed(2)})`);
  ok(r.fuz.pot>r.kulon.pot+1e-6||r.fuz.pot>=20-1e-9,"a beolvasztott alaphatás erősödött (vagy plafonon)",[r.kulon.pot,r.fuz.pot]);
  ok(r.fuz.spec>=r.kulon.spec-1e-9,"a special legalább olyan erős",[r.kulon.spec,r.fuz.spec]);
  ok(r.html,"a lapon ott a beolvasztott alaphatás sora");
  ok(Math.abs(r.ujra.cs-r.fuz.cs)<1e-9&&Math.abs(r.ujra.pot-r.fuz.pot)<1e-9,"mentés–betöltés után ugyanaz",r.ujra);
  console.log("\n— 4. lépcsős változat beolvasztva —");
  ok(r.gar>=3,"a Garantált scout-lépés hat (egy fokkal feljebb)",r.gar);
  ok(r.pont>0,"a lap saját alapja (Üzleti pontvadász) is hat",r.pont);
  console.log("\n— 6. a cél megmarad / javul —");
  ok(r.valasztBf==="pot","a sima választás megtartja a fajtát",r.valasztBf);
  ok(r.jav1&&r.jav1===r.jav2,"a régi, cél nélküli lap determinisztikus célt kap",[r.jav1,r.jav2]);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
