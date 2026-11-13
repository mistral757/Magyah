/* 🔁 1.0.9.0.02 — A CSERE A TÖLTŐ ALATT, A MENTÉS A SOROZAT VÉGÉN.
   KÉRÉS: „Kellene még »pillanat…« töltőképernyős cuccot kötni arra, amikor
   játékosokat cserélgetünk. Ott nagyon jelentős a várakozási idő. Valamit
   magával ezzel az idővel is jó ha kezdünk."
   Amit mér:
     1. a stílus-XP (styleSxpParts) és a mérföldkő-összeg (msSpSum) bitre
        ugyanaz, mint a régi, mérföldkövenkénti msSpReward-dal — talizmán-
        prémiummal és tempóval is;
     2. a HUB csere-listájából cserélve a „Pillanat…" töltő bejön, a csere
        megtörténik, és a töltő alatt NEM íródik mentés;
     3. a HUB elhagyásakor (saveGameFlush — ezt hívja minden töltő) a csere
        kiíródik; a lap elhagyásakor (pagehide) is;
     4. húzással (hubDragDrop) ugyanígy;
     5. gyors gépen (tanult ≤150 ms) a töltő nem jön be, a csere közvetlenül fut;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9177;
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
  await p.waitForFunction(()=>typeof toltoCsere==="function",null,{timeout:15000});
  await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      sl.player={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.fit=1;});
    if(!scout)scout=generateScout();
    phase="season";S.idx=10;
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{saveLockSet(saveKey());}catch(e){}
    try{saveGameNow();}catch(e){}});
  /* 1. a stílus-XP bitre */
  const sxp=await p.evaluate(()=>{
    const regiParts=(st)=>{   /* a régi összegzés: mérföldkövenként msSpReward */
      const k=st.key,list=STYLE_MILESTONES[k]||[],M=styleMsStateIn(st);
      const alap=list.filter(d=>!d.infExt),ext=list.filter(d=>d.infExt);
      const sum=l=>l.reduce((a,d)=>a+msSpReward(d.val),0);
      return {max:sum(alap),emax:sum(ext),got:M?sum(alap.filter(d=>M.done[d.id])):0,egot:M?sum(ext.filter(d=>M.done[d.id])):0};};
    const out=[];
    const keys=Object.keys(STYLE_MILESTONES).slice(0,6);
    const _tp=window.talMsPremium,_tm=window.tempoMultAx;
    const esetek=[[1,1],[1.137,1],[1,0.83],[1.21,0.77]];
    for(const [pr,tm] of esetek){
      window.talMsPremium=()=>pr;talMsPremium=window.talMsPremium;
      window.tempoMultAx=(a)=>a==="taktika"?tm:1;tempoMultAx=window.tempoMultAx;
      keys.forEach(k=>{
        const st={key:k,traits:{},ms:{done:{},seen:{},t:{}}};
        (STYLE_MILESTONES[k]||[]).forEach((d,i)=>{if(i%3===0)st.ms.done[d.id]=1;});
        const r=regiParts(st),z=styleSxpParts(st);
        out.push({k,pr,tm,egyezik:r.max===z.ms.max&&r.emax===z.msExt.max&&r.got===z.ms.got&&r.egot===z.msExt.got,
          sum:msSpSum(STYLE_MILESTONES[k])===(STYLE_MILESTONES[k]||[]).reduce((a,d)=>a+msSpReward(d.val),0)});});}
    window.talMsPremium=_tp;talMsPremium=_tp;window.tempoMultAx=_tm;tempoMultAx=_tm;
    return out;});
  ok(sxp.length>=12&&sxp.every(x=>x.egyezik&&x.sum),"1. a stílus-XP és a mérföldkő-összeg bitre a régi (4 talizmán/tempó-eset × stílusok)",sxp.filter(x=>!x.egyezik||!x.sum).slice(0,3));
  /* 2–3. a csere-listából */
  const r2=await p.evaluate(async()=>{
    const o={};
    try{delete toltoMsAll()[TOLTO_CSERE_KULCS];}catch(e){}
    try{renderHub();}catch(e){}
    const i=3,j=slots.findIndex((s,k)=>k!==i&&s.player);
    const loc={type:"slot",idx:i,p:slots[i].player};
    const a=slots[i].player.n;
    openHubPositionPicker(loc);
    await new Promise(r=>setTimeout(r,300));
    const row=[...document.querySelectorAll("#hubPosPickerBody > *")].find(x=>x.onclick);
    o.van=!!row;
    const mentesElotte=localStorage.getItem(saveKey());
    let irasok=0;const _si=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===saveKey())irasok++;return _si.apply(this,arguments);};
    row.click();
    await new Promise(r=>setTimeout(r,60));
    const t=document.getElementById("toltoRet");o.tolto=!!(t&&t.classList.contains("be"));
    o.szoveg=t?t.textContent.trim():"";
    for(let k=0;k<40;k++){const x=document.getElementById("toltoRet");if(!x||!x.classList.contains("be"))break;await new Promise(r=>setTimeout(r,100));}
    o.megtortent=slots[i].player.n!==a;
    o.irasToltoAlatt=irasok;o.fuggo=_saveTartFuggo;o.tart=_saveTart;
    await new Promise(r=>setTimeout(r,1500));   /* a régi halasztott mentés ideje — most nem írhat */
    o.irasUtana=irasok;
    saveGameFlush();
    o.irasFlush=irasok;
    o.mentveCsere=(()=>{try{const d=saveRawParse(localStorage.getItem(saveKey()));return d&&d.slots&&d.slots[i]&&d.slots[i].player&&d.slots[i].player.n===slots[i].player.n;}catch(e){return "hiba "+e;}})();
    /* 3b. pagehide */
    const loc2={type:"slot",idx:4,p:slots[4].player},b0=slots[4].player.n;
    openHubPositionPicker(loc2);await new Promise(r=>setTimeout(r,300));
    const row2=[...document.querySelectorAll("#hubPosPickerBody > *")].find(x=>x.onclick);row2.click();
    for(let k=0;k<40;k++){const x=document.getElementById("toltoRet");if(!x||!x.classList.contains("be"))break;await new Promise(r=>setTimeout(r,100));}
    const ir0=irasok;
    window.dispatchEvent(new Event("pagehide"));
    o.pagehideIr=irasok-ir0;
    o.mentve2=(()=>{try{const d=saveRawParse(localStorage.getItem(saveKey()));return d.slots[4].player.n===slots[4].player.n&&slots[4].player.n!==b0;}catch(e){return "hiba "+e;}})();
    Storage.prototype.setItem=_si;
    o.tanult=toltoMsAll()[TOLTO_CSERE_KULCS];
    return o;});
  ok(r2.van&&r2.tolto&&/Pillanat/.test(r2.szoveg),"2. csere-listából: a „Pillanat…” töltő bejön",r2);
  ok(r2.megtortent,"2. a csere megtörtént");
  ok(r2.irasToltoAlatt===0&&r2.irasUtana===0&&r2.fuggo===true,"2. a töltő alatt és utána nem íródik mentés (a sorozat végére vár)",r2);
  ok(r2.irasFlush===1&&r2.mentveCsere===true,"3. a HUB elhagyásakor (saveGameFlush) egyben kiíródik, benne a cserével",r2);
  ok(r2.pagehideIr===1&&r2.mentve2===true,"3. a lap elhagyásakor (pagehide) is kiíródik",r2);
  /* 4. húzás */
  const r4=await p.evaluate(async()=>{
    const o={};
    try{delete toltoMsAll()[TOLTO_CSERE_KULCS];}catch(e){}   /* a friss próbakarrier gyors: a tanult értéket töröljük */
    try{renderHub();}catch(e){}
    const rows=[...document.querySelectorAll("#hubRoster [data-hubloc], #hubRoster .hubRow")];
    o.sorok=rows.length;
    const a=slots[5].player.n,b=slots[6].player.n;
    try{
      _hd={dragging:true,src:null,to:null};
      window.hubDragLocOf=window.hubDragLocOf;
      const _lo=hubDragLocOf;
      hubDragLocOf=el=>el==="A"?{type:"slot",idx:5}:{type:"slot",idx:6};
      _hd.src="A";_hd.to={getAttribute:()=>null};
      o.ok=hubDragDrop();
      hubDragLocOf=_lo;_hd=null;
    }catch(e){o.hiba=String(e);}
    await new Promise(r=>setTimeout(r,60));
    const t=document.getElementById("toltoRet");o.tolto=!!(t&&t.classList.contains("be"));
    for(let k=0;k<40;k++){const x=document.getElementById("toltoRet");if(!x||!x.classList.contains("be"))break;await new Promise(r=>setTimeout(r,100));}
    o.csere=slots[5].player.n===b&&slots[6].player.n===a;
    o.fuggo=_saveTartFuggo;saveGameFlush();
    return o;});
  ok(r4.ok&&r4.csere&&r4.tolto,"4. húzással: a csere megtörténik, a töltő bejön",r4);
  /* 5. gyors gép */
  const r5=await p.evaluate(async()=>{
    toltoRogzit(TOLTO_CSERE_KULCS,40);toltoMsAll()[TOLTO_CSERE_KULCS]=40;
    let fut=false;toltoCsere(()=>{fut=true;});
    const t=document.getElementById("toltoRet");
    return {fut,tolto:!!(t&&t.classList.contains("be")),tart:_saveTart};});
  ok(r5.fut&&!r5.tolto&&!r5.tart,"5. gyors gépen nincs töltő, a csere közvetlenül fut, és a mentés a szokásos úton",r5);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
