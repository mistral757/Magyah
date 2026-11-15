/* 🏋️ 1.0.9.6.00 — AZ EDZÉS ÉS A STÁB ERŐSEBB.
   KÉRÉS: „A stábtagok és az edzés borzasztóan gyengék. Ezeket sokkal kevésbé
   kellene gyengíteni a nehézségi szintekkel. És alapból is az egész
   rendszernek jóval erősebbnek kellene lennie."
   Amit mér:
     1. a tempó-csillapítás: a nehézségi lassításnak csak 30%-a (Gleccser 0,45
        → 0,835, Kőkorszak 0,26 → 0,778, Villám 1 → 1);
     2. az átváltás: 0,55 Rating/pont, a sávok a szint-szorzóval tágulnak;
     3. a stáb: alapszorzó 2,5 (attribútum-mester 1,375 pont/meccs), a
        skill-kiosztás 3,6;
     4. VALÓDI meccs Gleccser-tempón: a középpályás fő edzés-pontja a mérlegben
        a képlet szerinti (2,0 × szint × kor × tempó × csillapítás), azaz kb.
        4,6-szorosa a réginek;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9199;
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
  await p.waitForFunction(()=>typeof edzTempoKomp==="function",null,{timeout:15000});
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
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=2;S.idx=5;
    window.saveGame=()=>{};window.saveGameNow=()=>{};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    /* 1. a csillapítás */
    const _tm=tempoMultAx;
    const kk=v=>{window.tempoMultAx=()=>v;const o=+edzTempoK().toFixed(3);return o;};
    ki.tempo={gl:kk(0.45),ko:kk(0.26),tu:kk(1)};
    /* 2. az átváltás */
    ki.atv={a10_1:+attrDevToRating(10,1).toFixed(3),a10_2:+attrDevToRating(10,2).toFixed(3),a20_1:+attrDevToRating(20,1).toFixed(3),a20_2:+attrDevToRating(20,2).toFixed(3),neg:+attrDevToRating(-5,1).toFixed(3)};
    /* 3. a stáb */
    ki.stab={mult:COACH_EFFECT_MULT,attr:COACH_ATTR_PTS,skill:COACH_SKILL_W,morale:COACH_MORALE_PER};
    /* 4. valódi meccs Gleccser-tempón */
    window.tempoMultAx=ax=>0.45;
    S.training={main:{stat:"passz",groups:["KOZEPPALYAS"]},sec:null,setSeason:S.seasonNumber};
    const kozep=slots.map((s,i)=>({s,i})).filter(x=>getCategoryFor(x.s.pos)==="KOZEPPALYAS").map(x=>x.s.player.n);
    const e0={};kozep.forEach(n=>{const e=careerPool[n];const tl=trainLogFor(e);e0[n]=(tl.terv&&tl.terv.passz)||0;});
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{utoLancVege();mEloTorol();}catch(e){}
    try{localStorage.setItem(MEV_ANIM_KEY,"1");}catch(e){}
    const _ts=matchSpeedTickMs;matchSpeedTickMs=()=>8;
    S.auto=false;S.lastMatch=null;
    playMatch();
    for(let i=0;i<3000&&!S.lastMatch;i++)await varj(20);
    matchSpeedTickMs=_ts;
    ki.vege=!!S.lastMatch;
    ki.kozep=kozep.map(n=>{const e=careerPool[n];const tl=trainLogFor(e);
      const kapott=((tl.terv&&tl.terv.passz)||0)-e0[n];
      const alap=ageScaleAttr(e.age,1)*trainScale(e)*0.45;   /* share = 1, egyéb szorzók nélkül */
      return {n,age:e.age,kapott:+kapott.toFixed(3),uj:+(TRAIN_PLAN_MAIN*alap*edzTempoKomp()).toFixed(3),regi:+(0.8*alap).toFixed(3)};});
    window.tempoMultAx=_tm;
    return ki;});
  console.log(JSON.stringify(r).slice(0,2500));
  ok(Math.abs(r.tempo.gl-0.835)<0.001&&Math.abs(r.tempo.ko-0.778)<0.001&&r.tempo.tu===1,"1. a nehézségi tempó lassításának csak 30%-a hat (Gleccser 0,835 · Kőkorszak 0,778)",r.tempo);
  ok(Math.abs(r.atv.a10_1-4.95)<0.01&&Math.abs(r.atv.a10_2-5.5)<0.01&&r.atv.a20_2>r.atv.a20_1&&Math.abs(r.atv.neg+2.75)<0.01,"2. 0,55 Rating/pont, a sávok a szint-szorzóval tágulnak (és a hátrány is szimmetrikus)",r.atv);
  ok(r.stab.mult===2.5&&Math.abs(r.stab.attr-1.375)<1e-9&&Math.abs(r.stab.skill-3.6)<1e-9&&r.stab.morale===22.5,"3. a stáb alapszorzója 2,5 (a skill-kiosztásé 2,0)",r.stab);
  const jok=(r.kozep||[]).filter(x=>x.kapott>0);
  ok(r.vege&&jok.length>0&&jok.every(x=>x.kapott>=x.uj*0.6&&x.kapott<=x.uj*2.6&&x.kapott>x.regi*2.5),"4. valódi meccs (Gleccser): a fő edzés pontja a képlet szerinti, sokszorosa a réginek",r.kozep);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
