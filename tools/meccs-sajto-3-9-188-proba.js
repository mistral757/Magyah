/* 📰 3.9.188 — A MECCS MÉRLEGE BŐVÜL, A HELYI LAP CÍMEI ÉS AZ ÚJSÁGÍRÓK.

   KIMONDOTT KÉRÉS: „A meccsvégi boxban legyen több mint eddig […] Legyen ott a
   meccs embere és hogy milyen értékelést kapott, hogy volt-e a meccsen
   valami extra […] És legyen egy sajtóhír headline szerű mondat is […]
   Legyen a scout és ügynökség mellett egy harmadik csapat mostantól, az
   újságírók. Ők is fejlődnek ezentúl a szurkolótábor növekedésével, és extra
   meccsek után […] a cikkükkel tudnak további szurkolókat szerezni."

   Amit mér:
     1. VALÓDI MECCS: a mérleg-ablakban ott a helyi lap címe, a meccs embere
        (vagy vereségnél a csapat legjobbja) a fokozatával, és a meccs
        extrái; a naplóban a lap címe a mérleg előtt; a mérleg mentődik;
     2. AZ EXTRÁK ÉS A CÍM: az akadémista első gólja, a bemutatkozó gól, a
        mesterhármas, a klubgól-jubileum, a fordítás, a rangadó, a kiütés és a
        zakó a saját címét kapja; a névelő (a/az) helyes;
     3. AZ ÚJSÁGÍRÓK: a csillagok a tábor CSÚCSÁNAK növekedéséből jönnek
        (1★ → 5★, fél csillagos lépcsők), a csúcs nem esik vissza; a lap neve
        a szinttel nő; 3★-tól alcím; a fejlődés a naplóba is bekerül;
     4. A CIKK: extra meccs után pontosan liga-sáv × 0,15% × csillag × súly
        szurkolót hoz (a súly 1–2), vereségnél felet, sima meccs után semmit;
     5. A FELÜLET: a scout és az ügynökség panelján a harmadik csapat, a
        HUB-gomb felirata, a mentés viszi az állapotot; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9231;
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

  /* ---- valódi egyjátékos karrier, szezonban ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
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
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=4;S.W=3;S.D=1;S.L=0;S.auto=false;
    saveGame();
    window.__sorok=[];
    const _a=addLine;addLine=function(h){window.__sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};
    S.auto=false;S.halftimeSubs=false;try{subPlanState().rules=[];}catch(e){}
    playMatch();});
  {const t0=Date.now();let kesz=false;
   while(!kesz&&Date.now()-t0<150000){
     kesz=await p.evaluate(()=>{
       const m=document.getElementById("mstatModal");
       if(m&&!m.classList.contains("hide"))return true;
       const box=document.getElementById("skillAssignList");
       if(box&&box.offsetParent){
         const g=[...box.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled&&/Rendben/.test(x.innerText||""));
         if(g){g.click();return false;}
         const aj=box.querySelector("[data-imm-ajanl]")||box.querySelector(".prow");
         if(aj){aj.click();return false;}}
       const ua=document.getElementById("unlockActions");
       if(ua&&ua.offsetParent){
         const g=[...ua.querySelectorAll("button")].find(x=>x.offsetParent&&!x.disabled);
         if(g){g.click();return false;}}
       for(const id of ["talDrawLater","guideTipOk","skillOfferSkip","unlockOk","chPopBtn"]){
         const x=document.getElementById(id);if(x&&x.offsetParent&&!x.disabled){x.click();break;}}
       return false;});
     if(!kesz)await p.waitForTimeout(400);}
   if(!kesz)throw new Error("a mérleg ablaka nem nyílt meg");}

  const r1=await p.evaluate(()=>{
    const V=S.lastMatch&&S.lastMatch.verdict,M=S.lastMatch;
    const test=document.getElementById("mstatBody").innerText;
    const sorok=window.__sorok,n=sorok.length;
    return {V:V?{head:V.head,mvp:V.mvp,extras:V.extras,press:V.press}:null,test,
      gf:M.gf,ga:M.ga,
      fejSor:sorok.findIndex(t=>/^📰 /.test(t)),merlegSor:sorok.findIndex(t=>/A meccs mérlege:/.test(t)),
      utolsoKetto:sorok.slice(-2)};});
  console.log("\n— 1. VALÓDI MECCS —");
  ok(r1.V&&r1.V.head&&r1.V.head.t&&r1.V.head.paper,"a mérlegben ott a helyi lap címe és a lap neve",r1.V&&r1.V.head);
  ok(/📰/.test(r1.test)&&r1.test.indexOf(r1.V.head.t)>=0,"az ablak kiírja a címet",r1.test.slice(0,200));
  const vereseg=r1.gf<r1.ga;
  ok(r1.V.mvp&&r1.V.mvp.n&&(vereseg?!r1.V.mvp.mvp:r1.V.mvp.mvp)&&(r1.V.mvp.grade||r1.V.mvp.grade===null),
     vereseg?"vereségnél a csapat legjobbja áll ott":"a meccs embere a mérlegben, a fokozatával",r1.V.mvp);
  ok(new RegExp(vereseg?"A csapat legjobbja":"A meccs embere").test(r1.test)&&(!r1.V.mvp.grade||r1.test.indexOf(r1.V.mvp.grade)>=0),
     "az ablak kiírja a meccs emberét és az értékelését",r1.test.slice(0,300));
  ok(Array.isArray(r1.V.extras)&&r1.V.extras.every(x=>x.ic&&x.t)&&(!r1.V.extras.length||/A meccs extrái/i.test(r1.test)),
     "az extrák listája (ha van) az ablakban is",r1.V.extras);
  ok(r1.fejSor>=0&&r1.fejSor<r1.merlegSor&&/A meccs mérlege:/.test(r1.utolsoKetto[0]),
     "a naplóban a lap címe a mérleg előtt áll, a mérleg két sora marad a meccs utolsó két sora",{fej:r1.fejSor,merleg:r1.merlegSor,ut:r1.utolsoKetto});

  /* ---- 2. AZ EXTRÁK ÉS A CÍM ---- */
  const r2=await p.evaluate(()=>{
    const ki={};
    const names=fullCareerRoster().map(x=>x.n);
    const A=names[0],B=names[1],C=names[2];
    const sor=(n,o)=>Object.assign({n,pos:"CS",g:0,a:0,saves:0,svPen:0,red:false,mvp:false,star:5},o||{});
    const eset=(o)=>{
      const V={score:o.score||50,rival:!!o.rival,dmin:o.dmin==null?null:o.dmin};
      mVerdictEnrich(V,{M:o.M||{pending:[],jubilee:[]},last:{us:"Próba FC",them:o.them||"Ellenfél SE",players:o.players||[sor(A,{mvp:true,g:1})]},
        gf:o.gf,ga:o.ga,cls:o.gf>o.ga?"win":o.gf<o.ga?"loss":"draw",maxDeficit:o.md||0,goalJub:o.gj||[]});
      return V;};
    const r0=Math.random;
    try{
      ki.youth=eset({gf:2,ga:0,M:{extra:[{k:"youthFirst",n:B,how:"goal"}],pending:[],jubilee:[]}});
      ki.debut=eset({gf:1,ga:0,M:{pending:[{kind:"debut",name:C,how:"goal"}],jubilee:[]}});
      ki.hat=eset({gf:4,ga:1,players:[sor(A,{mvp:true,g:3})]});
      ki.gjub=eset({gf:1,ga:1,gj:[{n:A,no:100}]});
      ki.fordit=eset({gf:3,ga:2,md:2});
      ki.derby=eset({gf:2,ga:1,rival:true});
      ki.derbyL=eset({gf:0,ga:1,rival:true});
      ki.rout=eset({gf:6,ga:0});
      ki.zako=eset({gf:0,ga:5,players:[sor(A,{star:3})]});
      ki.red=eset({gf:2,ga:1,players:[sor(A,{mvp:true,g:2}),sor(B,{red:true,star:3})]});
      ki.jub=eset({gf:2,ga:1,M:{pending:[],jubilee:[{n:B,no:100}]}});
      ki.late=eset({gf:2,ga:1,dmin:88});
    }finally{Math.random=r0;}
    ki.Bnev=shortName(B);ki.Cnev=shortName(C);ki.Anev=shortName(A);
    /* a névelő: magánhangzós ellenfél */
    const _r=Math.random;Math.random=()=>0;   /* az első sablon: abban van névelő */
    let V;try{V=eset({gf:0,ga:1,rival:true,them:"Arzenál"});}finally{Math.random=_r;}
    ki.az=V.head.t;
    return ki;});
  console.log("\n— 2. AZ EXTRÁK ÉS A CÍM —");
  const kk=(o,k)=>o&&o.head&&o.head.key===k;
  const ext=(o,k)=>(o.extras||[]).some(x=>x.k===k);
  ok(kk(r2.youth,"youth")&&ext(r2.youth,"youth")&&r2.youth.head.t.indexOf(r2.Bnev)>=0,"az akadémista első gólja: extra és saját cím, a nevével",r2.youth.head.t);
  ok(kk(r2.debut,"debut")&&ext(r2.debut,"debut")&&r2.debut.head.t.indexOf(r2.Cnev)>=0,"a bemutatkozó gól",r2.debut.head.t);
  ok(kk(r2.hat,"hat")&&ext(r2.hat,"hat"),"a mesterhármas",r2.hat.head.t);
  ok(kk(r2.gjub,"gjub")&&ext(r2.gjub,"gjub")&&/100/.test(r2.gjub.head.t),"a klubgól-jubileum (100. gól)",r2.gjub.head.t);
  ok(kk(r2.fordit,"fordit")&&ext(r2.fordit,"fordit"),"a fordítás",r2.fordit.head.t);
  ok(kk(r2.derby,"derbyW")&&ext(r2.derby,"derby")&&kk(r2.derbyL,"derbyL"),"a rangadó (győzelem és vereség)",[r2.derby.head.t,r2.derbyL.head.t]);
  ok(kk(r2.rout,"rout")&&ext(r2.rout,"rout")&&kk(r2.zako,"zako")&&ext(r2.zako,"zako"),"a kiütés és a zakó",[r2.rout.head.t,r2.zako.head.t]);
  ok(kk(r2.red,"redW")&&ext(r2.red,"red"),"a kiállítás",r2.red.head.t);
  ok(kk(r2.jub,"jubW")&&ext(r2.jub,"jub"),"a meccs-jubileum",r2.jub.head.t);
  ok(kk(r2.late,"late"),"a kései döntés",r2.late.head.t);
  ok(r2.zako.mvp&&!r2.zako.mvp.mvp,"vereségnél a csapat legjobbja áll a meccs embere helyén",r2.zako.mvp);
  ok(/az Arzenál/.test(r2.az)&&!/a Arzenál/.test(r2.az),"a névelő helyes (az Arzenál)",r2.az);

  /* ---- 3–4. AZ ÚJSÁGÍRÓK ÉS A CIKK ---- */
  const r3=await p.evaluate(()=>{
    const ki={};
    const sorok=[];const _a=addLine;addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{
      S.press=null;S.fanBase=10000;
      const P=pressState();P.start=10000;P.peak=10000;
      ki.s1=pressStars();ki.lap1=pressPaper();
      const lep=[];
      [12500,16000,20000,26000,34000,45000,60000,80000,200000].forEach(f=>{S.fanBase=f;pressTick();lep.push(pressStars());});
      ki.lepcso=lep;ki.lap5=pressPaper();
      S.fanBase=15000;pressTick();ki.nemEsik=pressStars();
      ki.fejlodott=sorok.filter(t=>/AZ ÚJSÁGÍRÓK FEJLŐDTEK/.test(t)).length;
      /* a cikk: 3★-on, extra meccs (súly 1,2), győzelem */
      S.press=null;S.fanBase=26000;const P2=pressState();P2.start=10000;P2.peak=26000;
      ki.s3=pressStars();
      const tier=fanLeagueBase();
      const f0=fanBase();
      const V={score:50,extras:[{k:"youth",w:1.2,t:"x"}]};
      ki.cikk=pressArticle(V,{gf:2,ga:0});
      ki.vart=Math.round(Math.round(tier*PRESS_PCT*3*1.2)*talFanMult());
      ki.nott=fanBase()-f0;
      /* súly-plafon: 2 */
      const V2={score:90,extras:[{w:1},{w:1},{w:1}]};
      const f1=fanBase();pressArticle(V2,{gf:3,ga:0});ki.plafon=fanBase()-f1;
      ki.vartPlafon=Math.round(Math.round(tier*PRESS_PCT*pressStars()*2)*talFanMult());
      /* vereség: fél */
      const f2=fanBase();pressArticle({score:80,extras:[]},{gf:2,ga:3});ki.vesztes=fanBase()-f2;
      ki.vartVesztes=Math.round(Math.round(tier*PRESS_PCT*pressStars()*1*0.5)*talFanMult());
      /* sima meccs: nincs cikk */
      const f3=fanBase();ki.sima=pressArticle({score:40,extras:[{w:0.2}]},{gf:1,ga:0});ki.simaNott=fanBase()-f3;
      ki.szamlalo=pressState().cikk;
      /* alcím 3★-tól */
      const V3={score:50,rival:false,mvp:{n:fullCareerRoster()[0].n,grade:"nagyon jó"},extras:[{k:"cs",w:0.5,t:"Kapott gól nélkül"}]};
      const H=pressHeadline(V3,{last:{us:"Próba FC",them:"Ellenfél SE"},gf:1,ga:0});
      ki.lead=H.lead;ki.hpaper=H.paper;
      S.press=null;S.fanBase=10000;const P3=pressState();P3.start=10000;P3.peak=10000;
      ki.lead1=pressHeadline(V3,{last:{us:"Próba FC",them:"Ellenfél SE"},gf:1,ga:0}).lead;
    }finally{addLine=_a;}
    return ki;});
  console.log("\n— 3. AZ ÚJSÁGÍRÓK —");
  ok(r3.s1===1&&r3.lap1==="Lelátói Hírlevél","induláskor 1★, a lap: Lelátói Hírlevél",{s:r3.s1,lap:r3.lap1});
  ok(JSON.stringify(r3.lepcso)==="[1.5,2,2.5,3,3.5,4,4.5,5,5]","a tábor csúcsának növekedése fél csillagonként emeli a szintet, 5★-ig",r3.lepcso);
  ok(r3.lap5==="Magyah Sport Napló"&&r3.nemEsik===5,"5★-on a lap neve is nő; a tábor visszaesése nem rontja a szintet",{lap:r3.lap5,s:r3.nemEsik});
  ok(r3.fejlodott===8,"minden fejlődés a naplóba is bekerül",r3.fejlodott);
  ok(r3.lead&&/A meccs embere/.test(r3.lead)&&r3.lead1==="","3★-tól alcím (lead) is jár, alatta nem",{lead:r3.lead,lead1:r3.lead1});
  console.log("\n— 4. A CIKK —");
  ok(r3.s3===3&&r3.cikk&&r3.cikk.fans===r3.vart&&r3.nott===r3.vart,"extra meccs után a cikk: liga-sáv × 0,15% × csillag × súly szurkoló",{kapott:r3.nott,vart:r3.vart});
  ok(r3.plafon===r3.vartPlafon,"a súly legfeljebb 2×",{kapott:r3.plafon,vart:r3.vartPlafon});
  ok(r3.vesztes===r3.vartVesztes,"vereség után a cikk fele annyit hoz",{kapott:r3.vesztes,vart:r3.vartVesztes});
  ok(r3.sima===null&&r3.simaNott===0&&r3.szamlalo===3,"sima meccs után nincs cikk; a számláló csak a cikkeket számolja",{sima:r3.sima,db:r3.szamlalo});

  /* ---- 5. A FELÜLET ÉS A MENTÉS ---- */
  const r5=await p.evaluate(()=>{
    const ki={};
    try{mstatClose();}catch(e){}
    try{renderHub();}catch(e){}
    ki.gomb=(document.getElementById("hubScoutUpgradeBtn")||{}).innerText||"";
    document.getElementById("hubScoutUpgradeBtn").click();
    ki.panel=document.getElementById("twBody").innerText;
    ki.cim=document.getElementById("twTitle").textContent;
    try{csReturnToHub();}catch(e){}
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){d=null;}
    ki.mentve=!!(d&&d.S&&d.S.press&&d.S.press.v===1);
    return ki;});
  console.log("\n— 5. A FELÜLET —");
  ok(/sajtó/.test(r5.gomb)&&/Újságírók/.test(r5.panel)&&/Scout/.test(r5.panel)&&/ügynökség/i.test(r5.panel)&&/sajtó/.test(r5.cim),
     "a scout és az ügynökség mellett a harmadik csapat: újságírók",{gomb:r5.gomb.slice(0,120),cim:r5.cim});
  ok(r5.mentve,"a mentés viszi az újságírók állapotát");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
