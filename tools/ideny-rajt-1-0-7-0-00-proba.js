/* 🏁 1.0.7.0.00 — AZ IDÉNY-RAJT, 2. SZERZŐDÉS.
   Amit mér:
     1. az 1. idény rajtja a fokozat szerint (0 … +1 a nehezeken);
     2. a 2. idénytől a valódi kezdőrúgás a képlet szerinti rajt-résre áll
        (több fokozat, idény, feljutás, csúszka) — a tényleges levelGap is;
     3. a megtartott nyári rész a W 2%-áig; a csúszka ±2%, a Run-hangolás ±0,5;
     4. a képlet nem „mezőny-emelés" (a Run nem kap érte), a napló és a HUB kimondja;
     5. a jellemző számok (táblázat) — 3. idényre pluszos rajt a 5.1-en sem;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9431;
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
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
    window.mgmtNyit=()=>false;
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};phase="season";S.seasonClosed=false;
    ki.nf=nfOn();
    const P=S.pyr;
    ki.aktiv=nrAktiv();
    const setF=(nf,s)=>{P.nf=nf;P.nf0=nf;P.fok=Object.assign({},P.fok||{},{nf,s});
      const H=pyrFloorHist();Object.keys(H).forEach(k=>{if(H[k])H[k].nf=nf;});};
    const ms=()=>{let v;msRatedBegin();try{v=teamMatchStrength();}finally{msRatedEnd();}return v;};
    /* 1. az 1. idény */
    ki.elso=[[1,1],[4,1],[5,1],[8,5],[10,5]].map(([nf,s])=>{setF(nf,s);return [nf+"."+s,nrElso()];});
    {setF(8,5);S.seasonNumber=1;P.anchored=false;P.gapWant=-3;delete P.fieldWant;
     try{pyrAnchorAtKickoff();}catch(e){ki.ah=String(e);}
     let g=null;msRatedBegin();try{g=Math.round(levelGap()*10)/10;}finally{msRatedEnd();}ki.anchor1={want:P.nrElso,gap:g,gap0:P.gap0};}
    /* 2. a kezdőrúgás a 2. idénytől */
    const fut=(nf,s,sn,prom,sig,nyar)=>{
      setF(nf,s);
      const H=pyrFloorHist();
      Object.keys(H).map(Number).filter(x=>x>=2).forEach(x=>{delete H[x];});
      const ind=ms();
      for(let x=2;x<sn;x++)H[x]={g:0,want:0,div:P.my,done:true,nf,cel:nfCelK(nf),zaroMs:ind};
      H[sn-1]=Object.assign(H[sn-1]||{},{done:true,nf,div:prom?P.my+1:P.my,zaroMs:Math.round((ind-nyar)*10)/10});
      S.seasonHistory=[];for(let x=1;x<sn;x++)S.seasonHistory.push({season:x,rank:prom&&x===sn-1?1:5,pts:50,oppRating:oppTargetRating,teamAvg:85});
      S.seasonNumber=sn;S.idx=0;S.seasonClosed=false;phase="season";
      if(typeof sig==="number")P.nrSigNext=sig;else delete P.nrSigNext;
      /* a világ a kezdőrúgás előtt messze odébb (a kezdőrúgás mindkét irányba igazít) */
      msRatedBegin();try{pyrShiftWorld({divs:P.divs},(Math.random()<.5?-6:6));oppTargetRating=pyrLevel();}finally{msRatedEnd();}
      let k=null;try{k=pyrFloorKickoff();}catch(e){return {hiba:String(e)};}
      let g=null;msRatedBegin();try{g=Math.round(levelGap()*10)/10;}finally{msRatedEnd();}
      const N=H[sn]&&H[sn].nr;
      return {f:nf+"."+s,sn,prom,sig:sig||0,nyar,N,gap:g,hang:H[sn]&&H[sn].hang,lift:H[sn]&&H[sn].lift,fek:H[sn]&&H[sn].fek,moved:H[sn]&&H[sn].nrMoved};};
    ki.esetek=[
      fut(8,5,3,true,0,4),fut(8,5,3,false,0,4),fut(5,1,3,false,0,10),fut(5,1,2,false,0,4),
      fut(10,5,3,true,0,4),fut(8,5,3,true,0.02,4),fut(8,5,3,true,-0.02,4),fut(1,1,3,false,0,4),
      fut(8,5,5,true,0,4),fut(8,5,3,true,0,40)];
    ki.naplo=/Idény-rajt:/.test(document.body.textContent);
    ki.hub=pyrCelSorHtml(0).replace(/<[^>]+>/g,"");
    /* a nyári sor (a következő idényre) */
    S.seasonHistory.push({season:S.seasonNumber,rank:5,pts:40,oppRating:oppTargetRating,teamAvg:85});
    ki.nyarSor=pyrCelSorHtml(0).replace(/<[^>]+>/g,"");
    /* a nyári képernyő */
    try{S.auto=false;nfOffer(()=>{},true);const sc=document.getElementById("scUnlock");
      ki.offer=sc?sc.textContent.replace(/\s+/g," ").slice(0,700):"";
      const pl=document.getElementById("nrSigPlus");if(pl)pl.click();
      ki.offer2=(document.getElementById("scUnlock")||{}).textContent||"";}catch(e){ki.offer="HIBA "+e;}
    /* 5. a táblázat — a tiszta képletből, jellemző W-kkel (a megtartott rész: a nyári változás medián fele, 1,5%) */
    ki.tabla=[];
    [[1,1],[4,1],[5,1],[6,5],[8,5],[9,5],[10,5]].forEach(([nf,s])=>{setF(nf,s);
      [[2,110],[3,205],[4,280],[5,400]].forEach(([sn,W])=>{[false,true].forEach(pr=>{
        const _pf=pyrFeljutott;window.pyrFeljutott=()=>pr;
        const b=nrBontas(sn,W,W*1.015,0);window.pyrFeljutott=_pf;
        ki.tabla.push([nf+"."+s,sn,W,pr?"fel":"—",b.rajt,Math.round((b.rajt-W*0.02)*10)/10,Math.round((b.rajt+W*0.02)*10)/10]);});});});
    return ki;});
  console.log("\n— 1. az 1. idény —");
  ok(r.aktiv,"az új rajt él (egyjátékos, tízfokozatú)",r.aktiv);
  const E=Object.fromEntries(r.elso);
  ok(E["8.5"]>=0&&E["8.5"]<=1&&E["10.5"]===0&&E["5.1"]<=1&&E["1.1"]>1,"a nehéz fokozatokon 0 és +1 között, a könnyebbeken több",r.elso);
  ok(Math.abs(r.anchor1.gap-r.anchor1.want)<=0.6,"az 1. idény horgonya a fokozat rajtjára áll (nem a régi beállításra)",r.anchor1);
  console.log("\n— 2. a kezdőrúgás —");
  r.esetek.forEach(x=>console.log("     "+JSON.stringify({f:x.f,sn:x.sn,fel:x.prom,sig:x.sig,nyar:x.nyar,W:x.N&&x.N.W,tart:x.N&&x.N.keep,C:x.N&&x.N.C,B:x.N&&x.N.B,D:x.N&&x.N.D,S:x.N&&x.N.Sg,rajt:x.N&&x.N.rajt,mert:x.gap,hiba:x.hiba})));
  ok(r.esetek.every(x=>x.N&&Math.abs(x.gap-(x.N.keep+x.N.C-x.N.B-x.N.D-x.N.Sg))<=1.0),"a tényleges rajt-rés a képlet szerinti (legfeljebb egy világ-szintnyi kerekítéssel)",r.esetek.map(x=>[x.f,x.sn,x.gap,x.N&&Math.round((x.N.keep+x.N.C-x.N.B-x.N.D-x.N.Sg)*10)/10]));
  const e0=r.esetek[0],e1=r.esetek[1],eS=r.esetek[5],eK=r.esetek[6],eNagy=r.esetek[9];
  ok(e0.N.prom&&!e1.N.prom&&e0.gap<e1.gap,"a feljutás keményít",[e0.gap,e1.gap]);
  ok(eS.gap<e0.gap&&eK.gap>e0.gap&&Math.abs(eS.N.Sg-e0.N.W*0.02)<0.15,"a csúszka ±2%-kal tol",[eK.gap,e0.gap,eS.gap]);
  ok(eS.hang===-0.5&&eK.hang===0.5&&e0.hang===0,"a csúszka a Run-hangolás nyelvén ±0,5",[eS.hang,e0.hang,eK.hang]);
  ok(Math.abs(eNagy.N.keep-eNagy.N.W*0.02)<0.15&&e0.N.keep<=e0.N.W*0.02+0.05,"a megtartott nyári rész a W 2%-áig (egy óriási nyár sem viszi el)",[e0.N.keep,eNagy.N.keep,eNagy.N.W]);
  ok(r.esetek.every(x=>x.lift===0&&x.fek===0),"a képlet szerinti eltolás nem „mezőny-emelés” és nem fék",r.esetek.map(x=>[x.lift,x.fek,x.moved]));
  ok(r.esetek[2].gap<0.05,"5.1, 3. idény, nagy nyár (+10), feljutás nélkül: sincs pluszos rajt",r.esetek[2].gap);
  console.log("\n— 4. a napló és a HUB —");
  ok(r.naplo,"a kezdőrúgás naplója kimondja a bontást");
  ok(/rajt-rés/.test(r.hub)&&/idény-boost/.test(r.hub),"idény közben a HUB a rajt bontását mutatja",r.hub);
  ok(/Tartalékolj/.test(r.nyarSor)&&/rajtja/.test(r.nyarSor),"nyáron a HUB a várható rajtot és a tartalékolás tanácsát mutatja",r.nyarSor);
  ok(/Idény-rajt/.test(r.offer)&&/várható rajt-rés/.test(r.offer)&&/Tartalékolj/.test(r.offer)&&/nehezebb/.test(r.offer),"a nyári képernyő: a bontás, a figyelmeztetés és a csúszka",r.offer);
  ok(/\+0,25%/.test(r.offer2),"a csúszka 0,25%-os lépésben tol",(r.offer2||"").match(/a csúszka[^·]*/));
  console.log("\n— 5. a jellemző számok (rajt-rés · a csúszka két végén) —");
  console.log("     fok   idény  W     feljutás  rajt   (+2% nehezebb … −2% könnyebb)");
  r.tabla.forEach(x=>console.log(`     ${String(x[0]).padEnd(5)} ${x[1]}.     ${String(x[2]).padEnd(5)} ${x[3].padEnd(8)}  ${String(x[4]).padStart(6)}  (${x[5]} … ${x[6]})`));
  const t3=r.tabla.filter(x=>x[1]===3&&x[0]!=="1.1"&&x[0]!=="4.1");
  ok(t3.every(x=>x[4]<0),"a 3. idényre (5.1-től) jellemzően nincs pluszos rajt",t3.filter(x=>x[4]>=0));
  ok(r.tabla.filter(x=>x[1]===2&&x[0]==="8.5").every(x=>x[4]<=0&&x[4]>=-3),"a 2. idény 8.5-ön 0 és −3 között",r.tabla.filter(x=>x[1]===2&&x[0]==="8.5"));
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
