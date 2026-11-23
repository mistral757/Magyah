/* 📊🏅🏆🃏 1.0.11.10.01 — TABELLA, SZEZONZÁRÓ, KUPA-HUB, SZEZONKÁRTYÁK ÚJ ARCCAL
   KÉRÉS: „Szezonkártyák. Tabella, szezonzáró értékelő felület, és a kupa HUB
   már régen nem lett fejlesztve kinézetben. Ezeket fejlesszük hozzá a játék
   stílusához. Legyen látványosabb, átláthatóbb, izgalmasabb."
   Amit mér: 1. a tabella: divízió-fej, 16 sor mezzel, a TE sor, zóna-jelvények
   és elválasztók, a sorrend és a pontok a buildLeagueTable szerint; 2. a
   szezonkártyák: kártyánként szint, arckép, számok, ajándék, a megtartott
   pecsétje; 3. a szezonzáró hős-kártyája: helyezés, csempék, a 30 meccs
   formacsíkja; a szekciók ikonnal, a listák arcképpel; 4. a kupa-HUB: szalag,
   menetelés-út, párosítás-kártya, csoporttabella új arccal; 5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9262;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
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
    openHubMidSeason();window.saveGame=()=>{};});
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(x=>x.offsetParent&&/Rendben, vágjunk/.test(x.textContent)).forEach(x=>x.click());});await p.waitForTimeout(600);
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
  const r=await p.evaluate(()=>{
    const o={};
    [...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/Ne mutass több/.test(x.textContent)).forEach(x=>x.click());
    const xi=slots.filter(s=>s.player).map(s=>s.player.n);
    S.fixtureResults=[];S.W=S.D=S.L=S.GF=S.GA=0;S.scorers={};S.assists={};S.mvps={};
    const G=[2,1,3,0,2,1,1,4,2,0,3,1,2,2,3,1,0,2,2,1,3,2,1,0,2,4,1,2,3,1],A=[0,1,1,2,1,0,1,1,0,0,2,3,1,0,1,1,2,0,2,0,0,1,1,1,0,2,0,1,1,1];
    for(let i=0;i<30;i++){const fx=S.fixtures[i];const gf=G[i],ga=A[i];
      S.fixtureResults.push({o:{n:fx.o&&fx.o.n,ovr:fx.o&&fx.o.ovr},gf,ga,home:!!fx.home,duel:false,round:i+1});
      if(gf>ga)S.W++;else if(gf<ga)S.L++;else S.D++;S.GF+=gf;S.GA+=ga;
      for(let g=0;g<gf;g++){const n=xi[10-(g+i)%4];S.scorers[n]=(S.scorers[n]||0)+1;}
      const m=xi[(i*7)%11];S.mvps[m]=(S.mvps[m]||0)+1;}
    S.pts=3*S.W+S.D;S.idx=20;   /* a 14. forduló utáni állás (a 20. fordulónál tartva) */
    /* 1. tabella (14. forduló) */
    const T=buildLeagueTable(14,{});
    const d=document.createElement("div");d.innerHTML=renderFinalTable(T);
    const sorok=[...d.querySelectorAll(".ltSor:not(.ltHead)")];
    o.t={fej:(d.querySelector(".ltFejJel")||{}).textContent,al:(d.querySelector(".ltFejNev small")||{}).textContent,
      db:sorok.length,mez:d.querySelectorAll(".ltMez svg").length,te:d.querySelectorAll(".ltTe").length,
      teNev:((d.querySelector(".ltTe .ltNev")||{}).textContent||""),
      pontok:sorok.map(x=>+x.querySelector(".ltP").textContent).join(",")===T.map(x=>x.pts).join(","),
      elso:sorok[0].querySelector(".ltPoz").textContent,zona:d.querySelectorAll(".ltPoz.z").length,val:d.querySelectorAll(".ltVal").length,
      jel:d.querySelectorAll(".ltJel span").length};
    /* 2. szezonkártyák */
    const kd=document.createElement("div");
    kd.innerHTML=cardResultsHtml([{n:xi[10],tier:"mythic",g:19,a:6,mvp:7,m:28,bump:3,potGain:120},{n:xi[3],tier:"silver",cs:9,g:1,a:2,mvp:1,m:25,repeat:true,potGain:15},{n:xi[9],tier:"godlike",g:31,a:12,mvp:12,m:30,bump:5,potGain:300}]);
    o.k={db:kd.querySelectorAll(".skKartya").length,elso:(kd.querySelector(".skFej")||{}).textContent,arc:kd.querySelectorAll(".skArc img").length,
      pecset:kd.querySelectorAll(".skPecset").length,nyer:(kd.querySelector(".skNyer")||{}).textContent,ures:cardResultsHtml([])};
    /* 3. szezonzáró */
    S.idx=30;phase="season";
    try{finish();}catch(e){o.finishHiba=String(e);}
    const H=$("verdictHero");
    o.v={lat:!H.classList.contains("hide"),on:$("verdict").classList.contains("vdHeroOn"),
      helyezes:(H.querySelector(".vdErem b")||{}).textContent,forma:H.querySelectorAll(".vdF").length,
      gy:H.querySelectorAll(".vdF.w").length,W:S.W,tier:(H.querySelector(".vdTier")||{}).textContent,tierRegi:$("verdictTier").textContent,
      csempe:[...H.querySelectorAll(".vdCsempek b")].map(x=>x.textContent),pts:S.pts,
      ikon:document.querySelectorAll("#verdictStats .vsIk").length,arc:document.querySelectorAll("#verdictStats .vdArc img").length,
      tabla:document.querySelectorAll("#verdictTableBody .ltab").length};
    /* 4. kupa-HUB */
    S.seasonClosed=true;S.euroCurrent="EL";S.euroCurrentQual=false;window.cupChallengeOffer=(cb)=>cb();
    try{startEuroCampaign({});showEuroScreen();}catch(e){o.kupaHiba=String(e);}
    o.e={szalag:!!document.querySelector("#euroHead .euSzalag"),nev:(document.querySelector("#euroHead .euCim b")||{}).textContent,
      ut:[...document.querySelectorAll("#euroHead .euLep")].map(x=>x.className.replace("euLep","").trim()+":"+x.textContent).join("|"),
      info:!!document.querySelector("#euroHead details.euInfo"),par:document.querySelectorAll("#euroNext .euCs svg").length,
      vs:!!document.querySelector("#euroNext .euVs"),csop:document.querySelectorAll("#euroTable .ltSor:not(.ltHead)").length,
      te:document.querySelectorAll("#euroTable .ltTe").length,gomb:!$("euroKickBtn").classList.contains("hide")};
    return o;});
  ok(r.t.fej==="⭐ D3"&&/14\. forduló után/.test(r.t.al)&&r.t.db===16&&r.t.mez===16&&r.t.te===1&&/TE/.test(r.t.teNev)&&r.t.pontok,"1a. tabella: divízió-fej, 16 sor mezzel, a TE sor, a pontok a buildLeagueTable szerint",r.t);
  ok(r.t.elso==="1"&&r.t.zona>=6&&r.t.val>=3&&r.t.jel===4,"1b. zóna-jelvények, elválasztók és jelmagyarázat",r.t);
  ok(r.k.db===3&&r.k.elso==="GODLIKE"&&r.k.arc===3&&r.k.pecset===1&&/\+5/.test(r.k.nyer)&&r.k.ures==="","2. szezonkártyák: szint szerint rendezve, arckép, pecsét, ajándék",r.k);
  ok(!r.finishHiba&&r.v.lat&&r.v.on&&r.v.forma===30&&r.v.gy===r.v.W&&r.v.tier===r.v.tierRegi&&r.v.csempe[0]===String(r.v.pts),"3a. szezonzáró hős-kártya: helyezés, csempék, 30 meccs formacsíkja",r.v);
  ok(r.v.ikon>=5&&r.v.arc>=5&&r.v.tabla===1,"3b. a szekciók ikonnal, a listák arcképpel, a végtabella új arccal",r.v);
  ok(!r.kupaHiba&&r.e.szalag&&/Ojrópai/.test(r.e.nev)&&/^most:Csoport/.test(r.e.ut)&&/Döntő$/.test(r.e.ut)&&r.e.info,"4a. kupa-HUB: szalag, menetelés-út (a csoport világít), lenyitható magyarázat",r.e);
  ok(r.e.par===2&&r.e.vs&&r.e.csop===4&&r.e.te===1&&r.e.gomb,"4b. párosítás-kártya két mezzel, csoporttabella új arccal, a kezdőgomb ott",r.e);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
