/* 🔄 1.0.9.5.00 — A KÖLCSÖNJÁTÉKOS TÉNYLEG KÖLCSÖN.
   KÉRÉS: „Az 1.0.9.3.00 scout gyengítős commitját érvényesítsük a három
   kölcsönjátékos érkezett átigazolási eseményre is. […] Legyen rajtuk, nevük
   mellett egy számláló. 15 forduló és 2. szezon közötti időtartamra jön
   mindegyik, külön külön sorsolva. Kell nekik bért fizetni, ha nem kapnak
   elég játékpercet, akkor elmennek, nem lehet őket eladni. Egyetlen opció
   van, vissza lehet küldeni a kölcsön klubhoz 0 Ft-ért. Vagy megtartani a
   kölcsön végéig és játszatni."
   Amit mér:
     1. az erő: lemaradó keretnél, 9.2-n a kölcsönjelölt a scout felfedezési
        sávjában van (az átlaga ott), és jóval a régi (egyenletes) húzás alatt;
     2. az esemény: 3 kölcsönjátékos a tartalékba, mindegyiknek külön sorsolt
        15–60 fordulós szerződése, a HUB-sorban a számláló;
     3. nem adható el, nem vihető piacra;
     4. a bér: pályára nem lépve is levonódik; a számlálót csak a bajnoki
        forduló fogyasztja;
     5. a játékperc: 5 üres meccs után figyelmeztet, a 6. után visszamegy;
     6. a lejárat: a számláló végén visszamegy;
     7. a visszaküldés: ingyen (a büdzsé nem változik), azonnal;
     8. a mentés viszi; 9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9197;
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
  await p.waitForFunction(()=>typeof kolcsonJelolt==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
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
    phase="season";S.seasonNumber=3;S.idx=16;
    window.__sg=saveGame;window.saveGame=()=>{};window.saveGameNow=()=>{};
    S.transferBudget=5e9;
    const sorok=[];const _al=addLine;
    window.addLine=function(h){try{sorok.push(String(h).replace(/<[^>]+>/g,""));}catch(e){}return _al.apply(this,arguments);};
    /* 1. az erő */
    const b0=signingBand();
    window.styleXNfMost=()=>({nf:9,s:2});
    const _raw=bandTeamRaw;window.bandTeamRaw=()=>b0.mid-20;
    const d=discoveryBand(false);
    const pos=slots[5].pos;
    let uj=[],regi=[];
    for(let i=0;i<150;i++){const a=kolcsonJelolt(pos);if(a)uj.push(a.ovr!=null?a.ovr:pOvr(a));
      const c=findReplacement([pos],{});if(c)regi.push(c.ovr!=null?c.ovr:pOvr(c));}
    const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
    const uS=[];for(let i=0;i<150;i++){const a=kolcsonJelolt(pos);if(a&&careerPool[a.n])uS.push(careerPool[a.n].startRating);}
    ki.ero={lo:d.lo,hi:d.hi,mode:d.mode,sh:d.sh,ujAvgStart:avg(uS),bennSav:uS.filter(x=>x>=d.lo-0.01&&x<=d.hi+0.01).length/Math.max(1,uS.length),ujAvg:avg(uj),regiAvg:avg(regi)};
    window.bandTeamRaw=_raw;
    /* 2. az esemény */
    const elotte=extraRoster.length;
    const txt=applyTransfer({key:"loan3"});
    ki.esemeny={txt,uj:extraRoster.length-elotte,lista:S.kolcson.list.map(x=>({n:x.n,left:x.left,total:x.total}))};
    const L=S.kolcson.list;
    ki.tag=kolcsonCimkeHtml(L[0].n);
    try{openHubMidSeason();}catch(e){}
    try{renderHub();}catch(e){}
    ki.hubTag=(document.body.innerHTML.match(/🔄 kölcsön · \d+ ford\./g)||[]).length;
    /* 3. eladás */
    const p0=findRosterPlayerByName(L[0].n);
    const sr=releasePlayer(p0,true);
    ki.elad={ok:sr.ok,reason:sr.reason,blk:(saleListBlock(p0)||{}).kind,bent:!!findRosterPlayerByName(L[0].n)};
    /* 4–5. a bér és a játékperc: L[0] nem játszik */
    const A=L[0].n,B=L[1].n,C=L[2].n;
    const pB=findRosterPlayerByName(B),pC=findRosterPlayerByName(C);
    const left0={a:kolcsonRec(A).left,b:kolcsonRec(B).left};
    const bud0=S.transferBudget;
    kolcsonMeccsUtan([pB,pC],{[B]:90,[C]:90},true);
    ki.ber={levont:bud0-S.transferBudget,sor:sorok.filter(s=>/Kölcsön-bér/.test(s)).length,leftA:kolcsonRec(A).left-left0.a};
    kolcsonMeccsUtan([pB,pC],{[B]:90,[C]:90},false);   /* kupameccs: nem fogy */
    ki.kupa={leftA:kolcsonRec(A).left-left0.a};
    for(let i=0;i<3;i++)kolcsonMeccsUtan([pB,pC],{[B]:90,[C]:90},true);
    ki.figy=sorok.filter(s=>/keveset játszik/.test(s)&&s.indexOf(shortName(A))>=0).length;
    ki.mostVanA=!!kolcsonRec(A);
    kolcsonMeccsUtan([pB,pC],{[B]:90,[C]:90},true);
    ki.percTav={vanA:!!kolcsonRec(A),bentA:!!findRosterPlayerByName(A),sor:sorok.filter(s=>/visszahívta/.test(s)).length,vanB:!!kolcsonRec(B)};
    /* 6. lejárat */
    kolcsonRec(B).left=1;
    kolcsonMeccsUtan([pB,pC],{[B]:90,[C]:90},true);
    ki.lejart={vanB:!!kolcsonRec(B),bentB:!!findRosterPlayerByName(B),sor:sorok.filter(s=>/Lejárt/.test(s)).length};
    /* 8. mentés (a 7. előtt, amíg C még kölcsönben van) */
    window.__lsw=null;const _s=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===saveKey())window.__lsw=v;return _s.apply(this,arguments);};
    try{window.__sg();}catch(e){ki.saveErr=String(e);}finally{Storage.prototype.setItem=_s;}
    let dd=null;try{dd=JSON.parse(mzUnpack(window.__lsw));}catch(e){}
    ki.mentes={van:!!(dd&&dd.S&&dd.S.kolcson&&dd.S.kolcson.list.some(x=>x.n===C))};
    if(dd){const keep=JSON.stringify(S.kolcson);S.kolcson=null;try{applySavedGame(dd);}catch(e){ki.loadErr=String(e);}ki.mentes.vissza=!!kolcsonRec(C);}
    /* 7. visszaküldés */
    const bud1=S.transferBudget;
    const vr=kolcsonTavozik(C,"vissza");
    ki.vissza={ok:vr.ok,van:!!kolcsonRec(C),bent:!!findRosterPlayerByName(C),budget:S.transferBudget-bud1,sor:sorok.filter(s=>/Visszaküldted/.test(s)).length};
    window.addLine=_al;
    return ki;});
  console.log(JSON.stringify(r).slice(0,2500));
  ok(r.ero.bennSav>=0.9&&Math.abs(r.ero.ujAvgStart-r.ero.mode)<=6,"1. a kölcsönjelölt a scout felfedezési sávjában (9.2, lemaradó keret)",r.ero);
  ok(r.ero.ujAvg<r.ero.regiAvg-3,"1. …és jóval a régi (egyenletes) húzás alatt",{uj:r.ero.ujAvg,regi:r.ero.regiAvg});
  ok(r.esemeny.uj===3&&r.esemeny.lista.length===3&&r.esemeny.lista.every(x=>x.total>=15&&x.total<=60&&x.left===x.total),"2. három kölcsönjátékos, mindegyiknek 15–60 fordulós szerződés",r.esemeny.lista);
  ok(/🔄 kölcsön · \d+ ford\./.test(r.tag)&&r.hubTag>=3,"2. a számláló a név mellett (HUB)",{tag:r.tag,hub:r.hubTag});
  ok(!r.elad.ok&&r.elad.reason==="kolcson"&&r.elad.blk==="kolcson"&&r.elad.bent,"3. nem adható el, nem vihető piacra",r.elad);
  ok(r.ber.levont>0&&r.ber.sor===1&&r.ber.leftA===-1,"4. a pályára nem lépett kölcsönös bére is levonódik; a bajnoki forduló fogyaszt",r.ber);
  ok(r.kupa.leftA===-1,"4. a kupameccs nem fogyasztja a számlálót",r.kupa);
  ok(r.figy===1&&r.mostVanA,"5. 5 üres meccs után figyelmeztet",{figy:r.figy,van:r.mostVanA});
  ok(!r.percTav.vanA&&!r.percTav.bentA&&r.percTav.sor===1&&r.percTav.vanB,"5. a 6. után visszamegy (a játszók maradnak)",r.percTav);
  ok(!r.lejart.vanB&&!r.lejart.bentB&&r.lejart.sor===1,"6. a lejáratkor visszamegy",r.lejart);
  ok(r.vissza.ok&&!r.vissza.van&&!r.vissza.bent&&r.vissza.budget===0&&r.vissza.sor===1,"7. a visszaküldés ingyenes és azonnali",r.vissza);
  ok(r.mentes&&r.mentes.van&&r.mentes.vissza&&!r.loadErr,"8. a mentés viszi",{m:r.mentes,e:r.loadErr,s:r.saveErr});
  ok(!errs.length,"9. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
