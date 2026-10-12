/* 🎛️ A TAKTIKA-ILLESZKEDÉS TETEJE (3.9.223)

   KIMONDOTT KÉRÉS: „Csapatstílusonként az edzohoz tartozo második képesség
   megnyitása után nyíljon ki a taktika illeszkedés teteje is. 150%ra, majd
   lvl3-as edzőnél 200%ra."

   Amit mér:
     1. a tető: edző nélkül / 1. szinten 100%, 2. szinten 150%, 3. szinten 200%;
     2. csak a stílus-edző SAJÁT taktikáján — a többi taktika 100% marad;
     3. kiváló kerettel az illeszkedés tényleg a tetőig megy, és a meccshatás
        vele nő (a 150%-os illeszkedés többet ad, mint a 100%-os);
     4. a taktika-panel kiírja a nyitott tetőt; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9408;
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
  await p.waitForFunction(()=>typeof tacticFitCap==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
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
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  const r=await p.evaluate(()=>{
    const o={};
    const sajat="labdatartas",mas=Object.keys(TACTICS).find(k=>k!==sajat);
    const _lv=styleCoachTacticLevel;
    o.cap=[0,1,2,3].map(l=>{window.styleCoachTacticLevel=k=>k===sajat?l:0;return tacticFitCap(sajat);});
    window.styleCoachTacticLevel=k=>k===sajat?3:0;o.mas=tacticFitCap(mas);
    /* kiváló keret: az illeszkedés-részek bőven a tető fölé vinnének */
    const _p=tacticFitParts;window.tacticFitParts=()=>[{d:1e6}];
    o.fit=[1,2,3].map(l=>{window.styleCoachTacticLevel=k=>k===sajat?l:0;return tacticFit(sajat);});
    o.fitMas=tacticFit(mas);
    window.styleCoachTacticLevel=k=>k===sajat?1:0;const e100=tacticEffectAt(sajat,99,tacticFit(sajat));
    window.styleCoachTacticLevel=k=>k===sajat?2:0;const e150=tacticEffectAt(sajat,99,tacticFit(sajat));
    o.e100=e100;o.e150=e150;
    S.tactics=S.tactics||{levels:{},active:null};S.tactics.active=sajat;
    o.panel=specTacticHtml();
    window.tacticFitParts=_p;window.styleCoachTacticLevel=_lv;
    return o;});
  ok(JSON.stringify(r.cap)==="[1,1,1.5,2]","a tető: 100% · 100% (1. szint) · 150% (2. szint) · 200% (3. szint)",r.cap);
  ok(r.mas===1&&r.fitMas<=1,"a többi taktika teteje 100% marad",{mas:r.mas,fit:r.fitMas});
  ok(r.fit[0]===1&&r.fit[1]===1.5&&r.fit[2]===2,"kiváló kerettel az illeszkedés a tetőig megy",r.fit);
  ok(r.e150>r.e100,`a meccshatás nő vele: 150% → ${r.e150.toFixed(2)} · 100% → ${r.e100.toFixed(2)}`,{e100:r.e100,e150:r.e150});
  ok(/teteje 150%/.test(r.panel)&&/150%/.test(r.panel),"a taktika-panel kiírja a nyitott tetőt",r.panel.slice(0,300));
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
