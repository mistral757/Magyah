/* 📅🛡️ 1.0.12.2.03 — MENETREND ÉS TABELLA: ÚJ KINÉZET, NYERS KLUBNÉV NÉLKÜL
   BEJELENTÉS (kép): „A menetrend és tabella már egy ideje nem lett frissítve kinézetileg. Plusz ott
   becsúsztak még jogvédett tartalmak." (a bajnoki egyéni listák klub-oszlopa: „Stade de Reims (1959/60)")
   Amit mér:
     1. a clubLabel a szezonos alakot is a fordítórétegen viszi át (= teamLabel);
     2. az ablakban (mindhárom fül) egyetlen olyan nyers klubnév sincs, amelynek van magyar megfelelője;
     3. három fül; a menetrend minden sora mezes, a lejátszottak eredmény-pirulát kapnak, a következő
        meccs kiemelt; az egyéni listák mezzel, a klub a név alatt;
     4. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9453;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  const r=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.kut.lecke=Object.assign(S.kut.lecke||{},{elso11:1});try{kutLeckeZar();}catch(e){}
    S.fixtureResults=S.fixtureResults||[];for(let i=0;i<12;i++){const f=S.fixtures[i];S.fixtureResults[i]={gf:(i*7)%4,ga:(i*5)%3,round:i+1,o:f&&f.o};}S.idx=12;
    const o={};
    const nyers=Object.keys(HU_CLUB_TABLE).filter(c=>HU_CLUB_TABLE[c]&&HU_CLUB_TABLE[c][0]&&HU_CLUB_TABLE[c][0]!==c);
    o.cl=clubLabel("Stade de Reims (1959/60)")===teamLabel("Stade de Reims (1959/60)")&&clubLabel("Stade de Reims (1959/60)").indexOf("Stade de Reims")<0;
    $("scheduleViewBtn").click();await w(300);
    const txt={};
    for(const k of ["menet","tabella","listak"]){msFul(k);await w(150);txt[k]=$("scheduleModal").innerText;}
    o.szivargas=[];for(const k in txt)nyers.forEach(c=>{if(c.length>3&&txt[k].indexOf(c)>=0&&o.szivargas.length<8)o.szivargas.push(k+": "+c);});
    o.fulek=document.querySelectorAll("#scheduleModal [data-msful]").length;
    msFul("menet");await w(100);
    const sorok=[...document.querySelectorAll("#scheduleBody .msSor")];
    o.sorok=sorok.length;o.mez=sorok.filter(x=>x.querySelector(".ltMez svg, .ltMez .ltSw")).length;
    o.pirula=document.querySelectorAll("#scheduleBody .msS.win,#scheduleBody .msS.draw,#scheduleBody .msS.loss").length;
    o.kov=document.querySelectorAll("#scheduleBody .msSor.next").length;
    msFul("listak");await w(100);
    const lb=[...document.querySelectorAll("#scheduleBoardBody .lbSor")];
    o.lb=lb.length;o.lbMez=lb.filter(x=>x.querySelector(".ltMez svg")).length;o.lbKlub=lb.filter(x=>x.querySelector(".lbKlub")&&x.querySelector(".lbKlub").textContent.trim()).length;
    return o;});
  ok(r.cl,"1. a clubLabel a szezonos alakot is lefordítja",r.cl);
  ok(!r.szivargas.length,"2. egyik fülön sincs nyers (lefordítható) klubnév",r.szivargas);
  ok(r.fulek===3&&r.sorok===30&&r.mez===30&&r.pirula===12&&r.kov===1&&r.lb>=8&&r.lbMez===r.lb&&r.lbKlub===r.lb,"3. három fül; mezes menetrend, eredmény-pirulák, kiemelt következő meccs; mezes egyéni listák a klubbal",r);
  ok(!errs.length,"4. nincs oldalhiba",errs.slice(0,5));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
