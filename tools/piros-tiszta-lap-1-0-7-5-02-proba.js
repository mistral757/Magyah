/* 🧽 1.0.7.5.02 — KÖZVETLEN PIROS UTÁN TISZTA LAP.
   KÉRÉS: „Egy közvetlen piros lapos kiállítás törölje el a játékos addigi
   felgyűjtött sárgáit. Az eltiltás után tiszta lap."
   Amit mér (valódi karriermeccseken, playMatch):
     A. közvetlen piros (a mérő MERES_PIROS-horga osztja): a kiállított
        bajnoki ÉS kupa-sárgái eltűnnek, eltiltást kap, a napló 🧽 sora szól;
        a többiek gyűjtése érintetlen (2 marad, vagy a 3. lapnál eltiltás);
     B. második sárgáért kiállítás (sok sárga, közvetlen piros nincs): a
        korábban gyűjtött lapok MEGMARADNAK, a meccs két lapja nem gyűlik;
     C. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9157;
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
  await p.waitForFunction(()=>typeof playMatch==="function"&&typeof SAJAT_PIROS!=="undefined",null,{timeout:15000});
  const t=await p.evaluate(async()=>{
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
    phase="season";
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    window.styleToughOnRoll=()=>false;   /* a „lepattan róla" stílusdobás ne zavarjon */
    const nevek=slots.filter(s=>s.player).map(s=>s.player.n);
    const meccs=async()=>{
      S.unavailable={};S.lastMatch=null;S.auto=true;S.idx=(S.idx||0)%10;
      try{utoLancVege();mEloTorol();}catch(e){}
      const _al=addLine;const sorok=[];
      window.addLine=function(h){try{sorok.push(String(h).replace(/<[^>]+>/g,""));}catch(e){}return _al.apply(this,arguments);};
      const pr0=Object.assign({},S.playerReds||{});
      playMatch();
      for(let i=0;i<800&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
      window.addLine=_al;
      const pirosak=nevek.filter(n=>((S.playerReds||{})[n]||0)>(pr0[n]||0));
      return {sorok,pirosak,kesz:!!S.lastMatch};};
    /* ---- A. közvetlen piros ---- */
    ki.A=[];
    const _sm=window.talSargaMult;
    for(let k=0;k<6;k++){
      S.yellows={};S.cupYellows={};nevek.forEach(n=>{S.yellows[n]=2;S.cupYellows[n]=1;});
      window.talSargaMult=()=>0;            /* ma ne essen sárga: a mérés tiszta legyen */
      MERES_PIROS={min:10};
      const r=await meccs();MERES_PIROS=null;
      const rn=r.pirosak[0]||null;
      ki.A.push({kesz:r.kesz,piros:r.pirosak.length,
        sargaUtana:rn?[(S.yellows||{})[rn],(S.cupYellows||{})[rn]]:null,
        eltiltva:rn?((S.unavailable[rn]||{}).reason==="suspension"):null,
        szivacs:rn?r.sorok.some(s=>s.includes("🧽")&&s.includes(shortName(rn))&&s.includes(" 3 korábbi")):null,
        masokEpek:nevek.filter(n=>n!==rn).every(n=>(S.yellows[n]===2)&&(S.cupYellows[n]===1))});}
    window.talSargaMult=_sm;
    /* ---- B. második sárga: a korábbi gyűjtés marad ---- */
    ki.B=[];const _kozv=SAJAT_PIROS.kozv;SAJAT_PIROS.kozv=0;
    window.oppKiallit=window.oppKiallit;   /* érintetlen */
    for(let k=0;k<25&&ki.B.length<4;k++){
      S.yellows={};S.cupYellows={};nevek.forEach(n=>{S.yellows[n]=1;S.cupYellows[n]=1;});
      window.talSargaMult=()=>7;
      const r=await meccs();window.talSargaMult=_sm;
      const y2=nevek.filter(n=>r.sorok.some(s=>s.includes("MÁSODIK SÁRGA")&&s.includes(shortName(n))));
      y2.forEach(n=>ki.B.push({liga:S.yellows[n],kupa:S.cupYellows[n],
        szivacs:r.sorok.some(s=>s.includes("🧽")&&s.includes(shortName(n)))}));}
    SAJAT_PIROS.kozv=_kozv;
    return ki;});
  console.log("A:",JSON.stringify(t.A));console.log("B:",JSON.stringify(t.B));
  const A=t.A.filter(x=>x.kesz&&x.piros===1);
  ok(A.length>=4,"A. legalább 4 meccsen pontosan egy közvetlen piros esett",t.A.map(x=>x.piros));
  ok(A.every(x=>x.sargaUtana[0]===undefined&&x.sargaUtana[1]===undefined),"A. a kiállított bajnoki és kupa-sárgái eltűntek",A.map(x=>x.sargaUtana));
  ok(A.every(x=>x.eltiltva),"A. a kiállított eltiltást kapott");
  ok(A.every(x=>x.szivacs),"A. a napló 🧽 sora kiírja: 3 korábbi sárga évült el");
  ok(A.every(x=>x.masokEpek),"A. a többi játékos gyűjtése érintetlen");
  ok(t.B.length>=1,"B. volt második sárgás kiállítás",t.B.length);
  ok(t.B.every(x=>x.liga===1&&x.kupa===1&&!x.szivacs),"B. második sárga után a korábbi lap megmarad, a meccs két lapja nem gyűlik",t.B);
  ok(!errs.length,"C. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
