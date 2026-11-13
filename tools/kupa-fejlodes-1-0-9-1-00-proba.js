/* 📈 1.0.9.1.00 — A KUPA-MEZŐNY IS FEJLŐDIK, A BAJNOKI ÜTEMMEL.
   KÉRÉS: „A kupasorozat alatt is legyen ellenfél fejlődés ugyanúgy, mint liga
   szezon alatt. Mértéke, tempója ugyanaz legyen, nehézségi szinthez
   igazítva. Vigyázzunk, hogy ne legyen eszement fejlődés azért :)"
   Amit mér:
     1. a kupameccsenkénti ütem = a bajnoki forduló üteme (pyrGrowStep +
        az idény-gyorsulás fordulónkénti átlaga), és a nehézségi fokozattal nő;
     2. induláskor nincs fejlődés; N kupameccs után a gépi csapatok +N×ütem;
        a te csapatod és a társ nem nő; a meccs-párosítás (fixtures) követi;
     3. idempotens (többszöri frissítés sem halmoz); a fék: legfeljebb 15
        kupameccsnyi;
     4. egy VALÓDI kupameccs (playMatch) után a számláló lép, a következő
        ellenfél erősebb; a kupa-képernyő kiírja;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9179;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof euroOppRefresh==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.idx=30;window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    /* 1. az ütem */
    ki.liga=pyrGrowStep();ki.ut=cupGrowStep();
    const _gy=window.nfGyorsAcc;window.nfGyorsAcc=()=>3;nfGyorsAcc=window.nfGyorsAcc;
    ki.utGyors=cupGrowStep();
    window.nfGyorsAcc=_gy;nfGyorsAcc=_gy;
    /* nehézség: a pyrAiRate-tel arányos (a W.grow a fokozat üteme) */
    const W=S.pyr,g0=W.grow;W.grow=g0*1.5;ki.utNehezebb=cupGrowStep();W.grow=g0;
    /* 2. induláskor */
    S.euroCurrent="BL";S.euroOptOut=false;
    try{startEuroCampaign({});}catch(e){ki.startErr=String(e&&e.stack||e);}
    const E=S.euro;
    ki.stage=E&&E.stage;
    euroOppRefresh();
    const cpu=E.teams.map((t,i)=>({t,i})).filter(x=>!x.t.you&&!x.t.mate);
    const u=E.teams.find(t=>t.you);
    ki.indul={g:cupGrowNow(),cpu0:cpu[0].t.ovr,base0:cpu[0].t.ovrBase,you:u.ovr};
    E.nGrow=4;euroOppRefresh();euroOppRefresh();euroOppRefresh();
    ki.negy={g:cupGrowNow(),cpu0:cpu[0].t.ovr,you:u.ovr,
      fx:(E.fixtures||[]).filter(f=>f.oi!=null).every(f=>Math.abs(f.o.ovr-E.teams[f.oi].ovr)<1e-9),
      mind:cpu.every(x=>Math.abs(x.t.ovr-(x.t.ovrBase+cupGrowNow()))<1e-9)};
    E.nGrow=40;euroOppRefresh();
    ki.fek={g:cupGrowNow(),max:Math.round(cupGrowStep()*15*100)/100};
    /* 4. valódi kupameccs */
    E.nGrow=0;euroOppRefresh();
    const fx0=E.fixtures[E.idx];const elotte=fx0&&fx0.o.ovr;
    S.auto=true;S.lastMatch=null;
    try{playMatch();}catch(e){ki.pmErr=String(e);}
    for(let i=0;i<800&&(S.playing||!S.lastMatch);i++)await new Promise(r=>setTimeout(r,25));
    ki.nGrowUtan=E.nGrow;
    try{renderEuroScreen();}catch(e){ki.renderErr=String(e);}
    const fx1=E.fixtures[E.idx];
    ki.kov={elotte,most:fx1&&fx1.o.ovr,oi0:fx0&&fx0.oi,oi1:fx1&&fx1.oi,base1:fx1&&E.teams[fx1.oi].ovrBase};
    try{ki.html=euroFieldHtml(E,EURO_COMPS.BL).replace(/<[^>]+>/g,"").slice(0,500);}catch(e){ki.html="HIBA "+e;}
    return ki;});
  console.log(JSON.stringify({liga:r.liga,ut:r.ut,utGyors:r.utGyors,nehez:r.utNehezebb,stage:r.stage,err:r.startErr||r.pmErr||r.renderErr}));
  ok(r.liga>0&&Math.abs(r.ut-r.liga)<1e-9,"1. kupameccsenként a bajnoki forduló üteme (gyorsulás nélkül = pyrGrowStep)",{liga:r.liga,ut:r.ut});
  ok(Math.abs(r.utGyors-(r.liga+3/30))<1e-9,"1. az idény-gyorsulás fordulónkénti átlaga is benne (acc 3 → +0,1)",r.utGyors);
  ok(r.utNehezebb>r.ut*1.4,"1. a nehezebb fokozat gyorsabb ütemével a kupa is gyorsabban nő",{ut:r.ut,nehez:r.utNehezebb});
  ok(r.indul.g===0&&r.indul.cpu0===r.indul.base0,"2. induláskor nincs fejlődés",r.indul);
  ok(Math.abs(r.negy.g-Math.round(4*r.ut*100)/100)<1e-9&&r.negy.mind,"2. 4 kupameccs után minden gépi csapat +4×ütem (többszöri frissítéssel sem halmoz)",r.negy);
  ok(r.negy.you===r.indul.you,"2. a te csapatod a kupa jóvoltából nem nő",r.negy);
  ok(r.negy.fx,"2. a meccs-párosítás az ellenfél friss erejét viszi");
  ok(Math.abs(r.fek.g-r.fek.max)<1e-9,"3. a fék: 40 meccs után is legfeljebb 15 meccsnyi",r.fek);
  ok(r.nGrowUtan===1,"4. egy valódi kupameccs után a számláló lép",r.nGrowUtan);
  ok(r.kov.most!=null&&Math.abs(r.kov.most-(r.kov.base1+Math.round(r.ut*100)/100))<0.011,"4. a következő ellenfél a saját alapjánál egy meccsnyivel erősebb",r.kov);
  ok(/fejlődik/.test(r.html||""),"4. a kupa-képernyő kiírja a fejlődést",r.html);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
