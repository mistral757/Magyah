/* 🧿 TALIZMÁNOK F8 — KÁRTYATÁR, ÖRÖKLAP, TRÓFEA-HÚZÁS, PAKLI-SÁV, HÁTLAP (3.9.160).

   Amit mér:
     1. KÁRTYATÁR: a látott / felvett / fuzionált speciál a böngésző tárolójába
        kerül, egy új karrier nem nullázza; a menü füle és a profil sora;
     2. ÖRÖKLAP: csak 5+ idény és 85+ csúcs után; a következő kínálatban ott a
        lap a játékos nevével, idézetével, a poszt színében; a pro a poszt
        fejlődésén, a kontra a visszavonult mezszámán hat; a húzás elhasználja;
     3. TRÓFEA-HÚZÁS: egy trófea egy húzás (egyszer); betelt plafonnál a
        következő idény elejére tolódik;
     4. A PAKLI-SÁV: a négy új mérföldkő-család a valódi táblában, a valódi
        számlálókkal;
     5. A „PAKLIBA MENT" SOR: a mérföldkő-csere összege tájékoztatóként a
        mérlegben, és a nyitó + Σ = záró egyenlőség nem sérül;
     6. A HÁTLAP: a húzás-ablak lapjai címeres hátlappal, a legendás csillan;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9194;
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
  await p.waitForFunction(()=>typeof talTarHtml==="function",null,{timeout:15000});
  await p.evaluate(()=>{
    try{localStorage.removeItem(TAL_TAR_KEY);}catch(e){}
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
    phase="season";S.seasonNumber=6;S.idx=5;S.tal=null;S.transferBudget=5e9;S.morale=60;
    addLine=()=>{};saveGame=()=>{};fanWeeklyIncome=()=>1000000;
    window._uj=()=>{S.tal=null;const T=talState();T.huzas=5;_talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;return T;};});

  /* ---- 1. KÁRTYATÁR ---- */
  const kt=await p.evaluate(()=>{
    const ki={};
    const T=_uj();
    T.varo=[{id:"k1",forras:"utem",n:1,szezon:6,fordulo:5,kinalat:[
      {kat:"stab",rang:2,dobas:0.7,spec:"mentor",valt:"hatas",cimke:"a"},
      {kat:"bank",rang:1,dobas:0.3,spec:"takarek",valt:"bevetel",cimke:"b"}]}];
    talValaszt(0);
    const t=talTarBetolt();ki.latott=!!(t.latott.mentor&&t.latott.takarek);ki.felvett=t.felvett.mentor===2&&!t.felvett.takarek;ki.dobas=t.maxDobas.mentor;
    /* új karrier: a tár marad */
    S.tal=null;ki.ujKarrier=talTarOsszeg().latott;
    talState().lapok=[];talMenuOpen();document.querySelector("[data-ttab='tar']").click();
    ki.ful=/Kártyatár/.test($("talPanel").textContent)&&/Felfedezve/.test($("talPanel").textContent)&&/Mentorlánc/.test($("talPanel").textContent);
    ki.rejtett=/\?\?\?/.test($("talPanel").textContent);
    document.querySelector("[data-ttab='gyujt']").click();talMenuClose();
    ki.profil=/Felfedezve/.test(talTarProfilHtml());
    return ki;});
  console.log("\n— 1. KÁRTYATÁR —");
  ok(kt.latott&&kt.felvett&&kt.dobas===0.7,"a látott és a felvett speciál (a ritkasággal, a dobással) a tárba kerül",kt);
  ok(kt.ujKarrier===2&&kt.ful&&kt.rejtett&&kt.profil,"egy új karrier nem nullázza; saját fül (a fel nem fedezett „???\") és profil-sor",kt);

  /* ---- 2. ÖRÖKLAP ---- */
  const or=await p.evaluate(()=>{
    const ki={};
    const T=_uj();
    const nev=slots[9].player.n,e=careerPool[nev];
    e.pos=["CS"];e.peak=91;e.startRating=88;e._klubSz=S.seasonNumber-6;
    S.careerStats=S.careerStats||{};S.careerStats[nev]={g:214,a:40,matches:300};
    const fiatal=slots[8].player.n;careerPool[fiatal]._klubSz=S.seasonNumber-2;careerPool[fiatal].peak=95;
    ki.fiatal=talOrokJelolt(careerPool[fiatal]);
    ki.jelolt=!!talOrokJelolt(e);ki.ketszer=talOrokJelolt(e);
    const kin=talKinalat("orok1");const L=kin.find(x=>x.orok);
    ki.lap=L?{kat:L.kat,rang:L.rang,nev:talLapNev(L),q:/214 gól/.test(L.orok.q),cimke:L.cimke}:null;
    const html=talLapHtml(L,{});ki.html=/öröksége/.test(html)&&/csatárok fejlődési tempója/.test(html);
    T.varo=[{id:"o1",forras:"utem",n:1,szezon:6,fordulo:6,kinalat:kin}];
    talValaszt(kin.indexOf(L));
    ki.var=(T.orokVar||[]).length;
    /* a pro: a csatárok fejlődése; a kontra: a mezszám */
    const cs=Object.values(careerPool).find(x=>x&&x.pos&&x.pos[0]==="CS"&&x.n!==nev);
    const kp=Object.values(careerPool).find(x=>x&&x.pos&&x.pos[0]==="KP");
    ki.dev=[talOrokDev(cs.n),talOrokDev(kp.n)];
    const mez=T.lapok.find(x=>x.orok).orok.mez;ki.mez=mez;
    if(mez){const hord=slots[2].player;const _n=numOf;numOf=n=>n===hord.n?mez:null;
      ki.jel=talMoralJel(hord);numOf=_n;}
    return ki;});
  console.log("\n— 2. ÖRÖKLAP —");
  ok(or.fiatal===null&&or.jelolt&&or.ketszer===null,"csak 5+ idény és 85+ csúcs után, egy játékosról egyszer",or);
  ok(or.lap&&or.lap.kat==="fejlodes"&&or.lap.rang===3&&/öröksége/.test(or.lap.nev)&&or.lap.q&&/öröklap/.test(or.lap.cimke)&&or.html,
    "a következő kínálatban ott a lap: a poszt színében, a csúcs szerinti ritkasággal, a statisztikájából írt idézettel",or.lap);
  ok(or.var===0&&or.dev[0]>1&&or.dev[1]===1&&(or.mez==null||or.jel===-4),"a húzás elhasználja; a csatárok fejlődése nő, másoké nem; a mezszámát viselő −4 morál-jel",or);

  /* ---- 3. TRÓFEA-HÚZÁS ---- */
  const tr=await p.evaluate(()=>{
    const ki={};
    const T=_uj();const sz=talSzezon();sz.db=0;
    ki.egy=talTrofea("bajnoki cím","cim-6");ki.ketto=talTrofea("bajnoki cím","cim-6");
    ki.varo=T.varo.filter(v=>v.forras==="trofea").length;ki.forras=talForrasSor(T.varo[T.varo.length-1]);
    sz.db=talPlafon();
    talTrofea("kupagyőzelem","kupa-6-BL");
    ki.halaszt=(T.trofeaVar||[]).length;ki.varo2=T.varo.filter(v=>v.forras==="trofea").length;
    S.seasonNumber=7;const sz7=talSzezon();
    ki.atvitt=T.varo.filter(v=>v.forras==="trofea"&&v.szezon===7).length;ki.db7=sz7.db;ki.maradt=(T.trofeaVar||[]).length;
    S.seasonNumber=6;
    return ki;});
  console.log("\n— 3. TRÓFEA-HÚZÁS —");
  ok(tr.egy&&!tr.ketto&&tr.varo===1&&/Trófea-húzás/.test(tr.forras),"egy trófea egy húzás, egyszer",tr);
  ok(tr.halaszt===1&&tr.varo2===1&&tr.atvitt===1&&tr.db7===1&&tr.maradt===0,"betelt plafonnál a következő idény elejére tolódik",tr);

  /* ---- 4. A PAKLI-SÁV ---- */
  const ms=await p.evaluate(()=>{
    const T=_uj();
    T.lapok=[1,2,3,4,5].map(i=>({kat:"bank",rang:i===5?4:1,dobas:0.5,spec:null,valt:"bevetel",uid:i}));T.seq=5;T.fuzDb=1;
    const def=id=>MILESTONES.find(d=>d.id===id);
    return {db:def("pakli_db_5")&&def("pakli_db_5").p(),leg:def("pakli_leg_1")&&def("pakli_leg_1").p(),
      rez:def("pakli_rez_1")&&def("pakli_rez_1").p(),fuz:def("pakli_fuz_1")&&def("pakli_fuz_1").p(),
      grp:def("pakli_db_5")&&def("pakli_db_5").grp,db40:!!def("pakli_db_40")};});
  console.log("\n— 4. A PAKLI-SÁV —");
  ok(ms.db===5&&ms.leg===1&&ms.rez===1&&ms.fuz===1&&ms.grp==="Pakli"&&ms.db40,"a négy új mérföldkő-család a táblában, a valódi számlálókkal",ms);

  /* ---- 5. A „PAKLIBA MENT" SOR ---- */
  const pm=await p.evaluate(()=>{
    const T=_uj();const sz=talSzezon();sz.db=0;sz.csere=0;
    const def={id:"proba_ms_x",t:"Próba-mérföldkő"};
    let n=0;const _r=talRng;talRng=function(){return ()=>0;};
    try{talMsBatchNext();n=talMsCsere(def,12345)?1:0;}finally{talRng=_r;}
    budgetEarn(1000,"reward");
    const h=ledgerHtml("x");
    const L=ledgerSum(S.seasonNumber);
    return {cs:n,sor:/pakliba ment/.test(h)&&/12[ .\u00a0]?345|12 345/.test(h.replace(/<[^>]+>/g,"")),ment:talPakliMent(S.seasonNumber),drift:L.drift||0};});
  console.log("\n— 5. A „PAKLIBA MENT” SOR —");
  ok(pm.cs===1&&pm.ment===12345&&pm.drift===0,"a mérföldkő-csere összege tájékoztatóként a mérlegben, a könyvelés egyezik",pm);

  /* ---- 6. A HÁTLAP ---- */
  const hl=await p.evaluate(()=>{
    const T=_uj();
    T.varo=[{id:"h1",forras:"utem",n:1,szezon:6,fordulo:5,kinalat:[
      {kat:"stab",rang:4,dobas:0.7,spec:null,valt:"hatas",cimke:"a"},{kat:"bank",rang:1,dobas:0.3,spec:null,valt:"bevetel",cimke:"b"}]}];
    talDrawOpen(()=>{});
    const back=[...document.querySelectorAll("#talDrawCards .talBack")];
    const r={db:back.length,svg:back.every(x=>x.querySelector("svg")),holo:back.filter(x=>x.classList.contains("holo")).length};
    talDrawClose();return r;});
  console.log("\n— 6. A HÁTLAP —");
  ok(hl.db===2&&hl.svg&&hl.holo===1,"a lapok címeres hátlappal érkeznek, a legendás csillan",hl);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
