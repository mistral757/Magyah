/* 🃏 1.0.11.11.00 — A KÁRTYAPONT: teljesítmény + osztályzatok + egyéni díjak, −25%-os küszöbök
   KÉRÉS: „bele kéne számítani sokkal inkább a teljesítményeket, egyéni díjakat,
   és a skálán legalább 25%ot könnyíteni kellene a szezonkártyák megszerzéséhez.
   Jelenleg irreálisan magas teljesítmény kell a gyilkos fölötti szintekhez."
   Amit mér:
     1. a küszöbök a régi gól+gólpassz-sor 75%-a;
     2. egy 22 gólos, 10 gólpasszos csatár Gyilkos (régen Mítikus); egy szerény
        statisztikájú, de sok kiemelkedő osztályzatú középpályás legalább
        gyémánt (régen arany);
     3. az egyéni díj (bajnoki gólkirály, Aranylabda) és a csapat címe pontot ad,
        és a kártyán látszik;
     4. a kvóták megmaradnak (Gyilkos és fölötte idényenként 1-1);
     5. egy valódi, végigjátszott idényen senki nem kap rosszabb kártyát, mint
        a régi szabállyal, a sztáron kívül is jut magasabb szint (kiírja az
        eloszlást);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9263;
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
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
  const r=await p.evaluate(()=>{
    const o={};
    [...document.querySelectorAll('button')].filter(x=>x.offsetParent&&/Ne mutass több/.test(x.textContent)).forEach(x=>x.click());
    o.kuszob=CARD_KP;
    const R=currentRoster();
    const nev=pos=>R.find(p=>p.pos&&p.pos[0]===pos)||R[0];
    const TAM=["CS","ÁÉ","BSZ","JSZ"];
    const cs=R.find(p=>p.pos&&TAM.includes(p.pos[0]))||R[R.length-1];
    const kp=R.find(p=>p.pos&&["KKP","TKP","VKP"].includes(p.pos[0])&&p!==cs)||R.find(p=>p!==cs&&p.pos&&p.pos[0]!=="KP");
    const pool0=JSON.stringify(careerPool);
    const alap=()=>{careerPool=JSON.parse(pool0);R.forEach(p=>{const e=careerPool[p.n];if(e)e.cardTier=null;});
      S.scorers={};S.assists={};S.mvps={};S.seasonSaves={};S.seasonCleanSheets={};S.seasonMatches={};S.seasonEuro={};S.pStat={};
      S.ballonDor=null;S.seasonHistory=[{season:1,rank:5,leagueAwards:[],euro:null}];
      R.forEach(p=>{S.seasonMatches[p.n]=30;});};
    const osztalyoz=(n,db,st)=>{S.pStat[n]=S.pStat[n]||[];for(let i=0;i<30;i++)S.pStat[n].push({s:1,r:i,st:i<db?st:4.6,g:0,a:0,m:90});};
    const tierOf=(res,n)=>{const x=res.find(r=>r.n===n);return x?x.tier:null;};
    /* 2a. csatár, 30 gól+gólpassz (20+10), 4 meccs embere */
    const T=tempoMult();o.tempo=T;
    alap();S.scorers[cs.n]=Math.ceil(22/T);S.assists[cs.n]=Math.ceil(10/T);S.mvps[cs.n]=0;
    let res=determineSeasonCards();o.csatar={t:tierOf(res,cs.n),kp:(res.find(r=>r.n===cs.n)||{}).kp};
    /* 2b. középpályás: 3 gól, 5 gólpassz, 2 meccs embere, 12 kiemelkedő + 4 rendkívüli meccs */
    alap();S.scorers[kp.n]=3;S.assists[kp.n]=5;S.mvps[kp.n]=2;osztalyoz(kp.n,12,6.0);
    S.pStat[kp.n].slice(0,4).forEach(x=>x.st=6.9);
    res=determineSeasonCards();const rk=res.find(r=>r.n===kp.n)||{};o.kozep={t:rk.tier,kp:rk.kp,oszt:rk.oszt};
    /* régen: combo 8 → arany (10 alatt: ezüst!) — kiszámolva a régi küszöbökkel */
    o.kozepRegi=(8>=10?"gold":8>=4?"silver":null);
    /* 3. díjak: bajnoki gólkirály + Aranylabda + bajnoki cím */
    alap();S.scorers[cs.n]=14;S.assists[cs.n]=4;
    S.seasonHistory=[{season:1,rank:1,leagueAwards:[{name:cs.n,label:"Bajnoki gólkirály"}],euro:{comp:"MK",won:true,awards:[]}}];
    S.ballonDor={name:cs.n,own:true,season:1};
    res=determineSeasonCards();const rd=res.find(r=>r.n===cs.n)||{};
    o.dij={t:rd.tier,kp:rd.kp,dijak:(rd.dijak||[]).map(d=>d.t+"+"+d.kp)};
    const d=document.createElement("div");d.innerHTML=cardResultsHtml(res);
    o.dijHtml={chip:d.querySelectorAll(".skDij span").length,kp:(d.querySelector(".skKp")||{}).textContent};
    /* 4. kvóták: két Gyilkos-szintű csatár → csak egy Gyilkos */
    alap();const cs2=R.filter(p=>p.pos&&p.pos[0]!=="KP").slice(0,2);
    cs2.forEach(p=>{S.scorers[p.n]=Math.ceil(24/T);S.assists[p.n]=Math.ceil(10/T);});
    res=determineSeasonCards();o.kvota=cs2.map(p=>tierOf(res,p.n));
    careerPool=JSON.parse(pool0);
    return o;});
  ok(r.kuszob.killer===30&&r.kuszob.godlike===51&&r.kuszob.diamond===13.5,"1. a küszöbök a régi sor 75%-a",r.kuszob);
  ok(r.csatar.t==="killer","2a. 22 gól + 10 gólpassz (a tempóra vetítve, 30,5 KP): Gyilkos (régen Mítikus)",r.csatar);
  ok(["diamond","stellar"].includes(r.kozep.t)&&r.kozep.oszt>0&&r.kozepRegi==="silver","2b. szerény statisztika + sok kiemelkedő osztályzat: legalább gyémánt (régen ezüst)",r);
  ok(r.dij.kp>=25+(14+4*0.85)*r.tempo-0.2&&r.dij.dijak.length===4&&["mythic","killer","vandal"].includes(r.dij.t)&&r.dijHtml.chip>=4&&/kártyapont/.test(r.dijHtml.kp),"3. Aranylabda, gólkirály, bajnoki cím, kupagyőzelem pontot ad és a kártyán látszik",r.dij);
  ok(r.kvota.filter(t=>t==="killer").length===1&&r.kvota.includes("mythic"),"4. a kvóták megmaradnak (két Gyilkos-szintű → egy Gyilkos, egy Mítikus)",r.kvota);
  /* 5. valódi idény */
  const v=await p.evaluate(async()=>{let o2;
    window.saveGame=()=>{};
    S.scorers={};S.assists={};S.mvps={};S.seasonSaves={};S.seasonCleanSheets={};S.seasonMatches={};S.seasonEuro={};S.pStat={};S.ballonDor=null;S.seasonHistory=[];
    S.auto=true;matchSpeed=20;
    try{playMatch();}catch(e){return {hiba:String(e)};}
    for(let i=0;i<900&&S.idx<30;i++)await new Promise(r=>setTimeout(r,60));
    await new Promise(r=>setTimeout(r,1500));
    S.auto=false;
    const R=currentRoster();
    const regi={},uj={};
    R.forEach(p=>{const s=cardSeasonStats(p.n);if((s.m||0)<CARD_MIN_MATCHES)return;
      const k=tempoMult()*cardMatchMult(s.m),combo=(s.g+s.a)*k,mvp=s.mvp*k,sv=s.saves*k,c=s.cs*k;
      regi[p.n]=combo>=68||sv>=200||c>=28?8:combo>=52||sv>=175||c>=24?7:combo>=40||mvp>=30||sv>=150||c>=20?6:combo>=32||mvp>=24||sv>=130||c>=17?5:combo>=25||mvp>=18||sv>=115||c>=15?4:combo>=18||mvp>=12||sv>=100||c>=12?3:combo>=10||mvp>=6||sv>=70||c>=7?2:combo>=4||mvp>=3||sv>=40||c>=3?1:0;});
    const pool0=JSON.stringify(careerPool);
    R.forEach(p=>{const e=careerPool[p.n];if(e)e.cardTier=null;});
    const res=determineSeasonCards();
    res.forEach(x=>{uj[x.n]=cardTierRank(x.tier);});
    careerPool=JSON.parse(pool0);
    const sor=Object.keys(regi).map(n=>({n:shortName(n),regi:regi[n],uj:uj[n]||0,kp:(res.find(x=>x.n===n)||{}).kp||0})).sort((a,b)=>b.kp-a.kp);
    o2={t:tempoMult(),st:R.map(p=>[shortName(p.n),JSON.stringify(cardSeasonStats(p.n)),(S.pStat[p.n]||[]).length,(S.pStat[p.n]||[]).filter(x=>x.s===cardLezartSzezon()).length]),lez:cardLezartSzezon(),sn:S.seasonNumber,hist:(S.seasonHistory||[]).length};
    return {idx:S.idx,sor,o2};});
  if(v.hiba)ok(false,"5. valódi idény",v);
  else{
    console.log("     a végigjátszott idény (régi → új szint, 0=nincs · 8=GODLIKE, kártyapont):");
    v.sor.forEach(x=>console.log(`       ${x.n.padEnd(18)} ${x.regi} → ${x.uj}   ${String(x.kp).padStart(5)} KP`));
    const nemRosszabb=v.sor.every(x=>x.uj>=Math.min(x.regi,5)||x.regi>=5);
    const tobb=v.sor.filter(x=>x.uj>x.regi).length;
    ok(v.idx>=30&&nemRosszabb&&tobb>=3,"5. a végigjátszott idényben senki nem rosszabb (a kvótás szinteken kívül), és legalább három játékos magasabb szintet kap",{tobb,idx:v.idx});}
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,4));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
