/* ⚡🧩 MECCSERŐ-BONTÁS ÉS PRESETEK (3.9.249–250)

   KÉRÉS: „Csere és felállás típus presetek, amik arra valók, hogy neked
   készítenek el egy javasolt cserét, felállást […] Legyen egy összegző
   felület, ami elmondja, miből áll a meccserő a nyers erőn felül (alul).
   Tételes kibontás. A felállás alatt van a meccs erő, arra rákattintva is
   ugorjon oda, ahol ez a menüben a csapatépítés alatti fülben van."

   Amit mér:
     1. a tételes hiddenMatchBonusParts összege bitre a régi hiddenMatchBonus
        (öt állapotban; a régi függvény a tools/meccsero-bontas-regi.js-ben);
     2. a panel: a ⚡ kattintásra a Meccserő fül nyílik, a számok a sávéval
        azonosak, minden nem-nulla tétel egy sor; a két menükártya;
     3. az öt felállás-preset a saját célját javítja, az előnézet nem nyúl a
        kerethez, az alkalmazás pontosan az előnézetet írja be, sérültet nem
        tesz be;
     4. a három beépített és a saját csere-preset: padról, posztra alkalmas
        emberrel, a feltételeiknek megfelelően, legfeljebb 3 cserével; a
        cseretervbe tölt;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9473;
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
  await p.waitForFunction(()=>typeof hiddenMatchBonusParts==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
  await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});


  /* a padra és a tartalékba is kerül ember: a presetekhez kell */
  await p.evaluate(()=>{
    const pool=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18).slice(1,4).flatMap(x=>x.players);
    const on=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const mk=(src,age)=>{const pl={n:src.n,ovr:src.ovr,pot:(src.ovr||70)*60,pos:(src.pos||["KKP"]).slice(),age};
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age,startRating:pl.ovr,peak:pl.ovr,pot:pl.pot};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);return pl;};
    let k=0;const szabad=pool.filter(x=>!on.has(x.n));
    BENCH_CATS.forEach(c=>{const src=szabad.find(x=>(x.pos||[]).some(pp=>c.codes.includes(pp))&&!on.has(x.n));
      if(src){on.add(src.n);BENCH[c.key]=mk(src,19+(k++%12));}});
    extraRoster.length=0;
    szabad.filter(x=>!on.has(x.n)).slice(0,6).forEach((src,i)=>{on.add(src.n);extraRoster.push(mk(src,18+i));});
    slots.forEach((sl,i)=>{if(sl.player){sl.player.age=sl.player.age||(24+i%9);if(!sl.player.pot)sl.player.pot=(sl.player.ovr||70)*60;
      const e=careerPool[sl.player.n];if(e){e.age=sl.player.age;if(!e.pot)e.pot=sl.player.pot;}}});
    S.halftimeSubs=false;S.subPlan=null;
    try{localStorage.removeItem("cserePreset30_0");}catch(e){}
    addLine=()=>{};});
  /* a régi (3.9.248-as) hiddenMatchBonus — az azonosság mércéje */
  await p.addScriptTag({content:fs.readFileSync(process.env.HMB_REGI||path.join(__dirname,"meccsero-bontas-regi.js"),"utf8")});

  console.log("=== 1. A TÉTELES MECCSERŐ = A RÉGI SZÁM, BITRE ===");
  const a=await p.evaluate(()=>{
    const ki=[];
    const allapot=[()=>{},()=>{S.morale=85;},()=>{S.morale=12;S.capMod=1;S.eventMod=-2;},
      ()=>{S.teamFormMalus=2;S.capMod=-1;},()=>{const k=Object.keys(TACTICS)[0];S.tactics=S.tactics||{};S.tactics.active=k;S.tactics.levels=S.tactics.levels||{};S.tactics.levels[k]=90;}];
    allapot.forEach(f=>{f();ki.push([hiddenMatchBonus(),_hmbRegi(),hiddenMatchBonusParts().length]);});
    return ki;});
  ok(a.every(x=>x[0]===x[1]),"öt állapotban a tételek összege bitre a régi hiddenMatchBonus",a);
  ok(a.every(x=>x[2]>=10),"legalább tíz tétel (kapitány, morál, edző, aura, taktika, összhang, stílus, talizmán, egyensúly, gólszorzók…)",a.map(x=>x[2]));

  console.log("=== 2. A PANEL ===");
  const pb=await p.evaluate(()=>{
    const ki={};
    $("teamMatchWrap").onclick({stopPropagation(){}});
    const m=$("cspModal");ki.nyitva=!m.classList.contains("hide");
    ki.fulMs=document.querySelector('#cspTabs [data-csp="ms"]').classList.contains("on");
    const txt=$("cspBody").innerText;
    const A=cspMeccseroAdat();
    ki.ossz=txt.indexOf(cspF1(A.kijelzett))>=0&&txt.indexOf(cspF1(A.now))>=0;
    ki.kijelzett=Math.abs(A.kijelzett-(teamStrengthNow()+hiddenMatchBonus()))<1e-9;
    ki.sorok=$("cspBody").querySelectorAll(".cspSor").length;
    ki.nemNulla=A.parts.filter(x=>Math.abs(x.v)>=0.05).length;
    closeCsapatPanel();
    $("hubMeccseroBtn").click();ki.menu=!m.classList.contains("hide")&&_cspTab==="ms";closeCsapatPanel();
    $("hubPresetBtn").click();ki.menu2=_cspTab==="fel";closeCsapatPanel();
    cspRenderBtn();ki.ds=$("hubMeccseroDs").textContent;
    return ki;});
  ok(pb.nyitva&&pb.fulMs,"a felállás alatti ⚡ meccs-erő a panel Meccserő fülét nyitja",pb);
  ok(pb.ossz&&pb.kijelzett,"a panel a csapaterőt és a ⚡ meccs-erőt írja — ugyanazt, mint a felállás alatti sáv",pb);
  ok(pb.sorok===pb.nemNulla,"minden nem-nulla tétel egy sor",[pb.sorok,pb.nemNulla]);
  ok(pb.menu&&pb.menu2,"a Csapatépítés két kártyája a megfelelő fülre nyit",pb);
  ok(/^⚡ \d+,\d = csapaterő/.test(pb.ds),"a menükártya az élő számot mutatja",pb.ds);

  console.log("=== 3. FELÁLLÁS-PRESETEK ===");
  const c=await p.evaluate(()=>{
    const ki={};
    if(S.tactics)S.tactics.active=null;   /* az 1. rész taktikája — itt taktika nélkül indulunk */
    const k0=slots.map(s=>s.player&&s.player.n).join("|");
    const t0=performance.now();
    CSP_FELALLAS.forEach(P=>{
      const J=cspFelallasJavaslat(P.k);
      ki[P.k]=J.hiba?{hiba:J.hiba}:{valt:J.valt.length,m0:J.m0,m1:J.m1};});
    ki.ido=Math.round(performance.now()-t0);
    ki.erintetlen=slots.map(s=>s.player&&s.player.n).join("|")===k0;
    /* taktikával */
    const tk=Object.keys(TACTICS)[0];S.tactics=S.tactics||{};S.tactics.active=tk;
    const J=cspFelallasJavaslat("taktika");ki.taktika2={valt:J.valt.length,f0:J.m0.fit,f1:J.m1.fit};
    /* alkalmazás: a legerősebb tizenegy */
    const R=cspFelallasJavaslat("rating");
    cspFelallasAlkalmaz(R);
    ki.alk={ero:teamStrength(),vart:R.m1.ero,jo:slots.every(s=>!s.player||(canPlayPos(s.player,s.pos)&&!playerUnavailable(s.player.n)))};
    ki.ujra=cspFelallasJavaslat("rating").valt.length;
    /* sérült kezdő: a preset kiveszi */
    const n=slots[3].player.n;S.unavailable=S.unavailable||{};S.unavailable[n]={kind:"inj",left:3};
    const J2=cspFelallasJavaslat("rating");ki.serult=J2.valt.some(v=>v.ki&&v.ki.n===n);
    delete S.unavailable[n];
    return ki;});
  ok(c.erintetlen,"az előnézet nem nyúl a kerethez",c.erintetlen);
  ok(c.rating.m1.ero>=c.rating.m0.ero,"a legerősebb tizenegy: a csapaterő nem csökken",[c.rating.m0.ero,c.rating.m1.ero]);
  ok(c.fiatal.m1.kor<c.fiatal.m0.kor,"a legfiatalabb csapat: az átlagéletkor csökken",[c.fiatal.m0.kor,c.fiatal.m1.kor]);
  ok(c.fiatalEros.m1.ero-0.5*c.fiatalEros.m1.kor>=c.fiatalEros.m0.ero-0.5*c.fiatalEros.m0.kor-1e-9,"fiatal és erős: a célfüggvény nem romlik",c.fiatalEros);
  ok(c.osszhang.m1.bond>=c.osszhang.m0.bond,"a legjobb összhang: az összhang nem csökken",[c.osszhang.m0.bond,c.osszhang.m1.bond]);
  ok(c.taktika.hiba&&c.taktika2.f1>=c.taktika2.f0,"taktika nélkül szól; aktív taktikával az illeszkedés nem csökken",c);
  ok(Math.abs(c.alk.ero-c.alk.vart)<1e-9&&c.alk.jo,"az alkalmazás pontosan az előnézetet írja be; mindenki tudja a posztját",c.alk);
  ok(c.ujra===0,"alkalmazás után ugyanaz a preset már nem talál javítást",c.ujra);
  ok(c.serult,"a sérült kezdőt a preset kiveszi",c.serult);
  ok(c.ido<6000,"öt preset ésszerű idő alatt",c.ido+" ms");

  console.log("=== 4. CSERE-PRESETEK ===");
  const d=await p.evaluate(()=>{
    const ki={};
    /* a 3. rész a legerősebb tizenegyet hagyta a pályán — a „vereségnél a
       jobbik be" ehhez nem találna erősebb padost; a fiatal tizenegy kell */
    cspFelallasAlkalmaz(cspFelallasJavaslat("fiatal"));
    ki.cond=[mpSubCondOk("eldolt",3,1),mpSubCondOk("eldolt",1,3),mpSubCondOk("eldolt",2,1),mpSubCondOk("eldolt",0,0)];
    const xiR=r=>{const sl=slots[r.outIdx];return playerStrength(sl.player,sl.pos);};
    const beR=r=>{const sl=slots[r.outIdx];const p=mpSubBench().find(b=>b.n===r.inName);return p?playerStrength(p,sl.pos):null;};
    const g1=cspCsereGyart(CSP_CSERE_BEEPITETT[0],null);
    ki.b1={n:g1.rules.length,cond:g1.rules.every(r=>r.cond==="eldolt"&&r.min===60),gyengebb:g1.rules.every(r=>beR(r)<xiR(r)),
      padrol:g1.rules.every(r=>mpSubBench().some(b=>b.n===r.inName)),poszt:g1.rules.every(r=>{const p=mpSubBench().find(b=>b.n===r.inName);return canPlayPos(p,slots[r.outIdx].pos);})};
    const g2=cspCsereGyart(CSP_CSERE_BEEPITETT[1],null);
    ki.b2={n:g2.rules.length,cond:g2.rules.every(r=>r.cond==="veszit"),erosebb:g2.rules.every(r=>beR(r)>xiR(r))};
    const g3=cspCsereGyart(CSP_CSERE_BEEPITETT[2],1);
    const kuszob=Math.max(...mpSubBench().map(p=>sellValue(p)||0))+1;
    const g3b=cspCsereGyart(CSP_CSERE_BEEPITETT[2],kuszob);
    ki.b3={n:g3.rules.length,cond:g3.rules.every(r=>r.cond==="vezet2"&&r.min===45),kuszobFelett:g3b.rules.length,megj:g3b.megj.length};
    ki.max=[g1,g2,g3].every(g=>g.rules.length<=HALFTIME_SUB_MAX&&new Set(g.rules.map(r=>r.inName)).size===g.rules.length&&new Set(g.rules.map(r=>r.outIdx)).size===g.rules.length);
    /* betöltés a cseretervbe */
    cspCsereAlkalmaz(Object.assign({nev:"x"},g3),"csere");
    ki.terv=[subPlanRules().length===g3.rules.length,S.halftimeSubs===true];
    cspCsereAlkalmaz(Object.assign({nev:"y"},g2),"hozza");
    ki.hozza=subPlanRules().length===g3.rules.length+g2.rules.length;
    /* saját preset */
    cspSajatMent([{id:"sx",n:"Fiatalok be vereségnél",sorok:[{be:"fiatal",ki:"legidosebb",rel:"mindegy",cond:"veszit",min:70,db:2}]}]);
    const T=cspSajatCsere()[0];const g4=cspCsereGyart(T,null);
    ki.sajat={n:g4.rules.length,min:g4.rules.every(r=>r.min===70&&r.cond==="veszit")};
    openCsapatPanel("csere");ki.lista=$("cspBody").innerText.indexOf("Fiatalok be vereségnél")>=0;
    document.querySelector('[data-cspcs="b1"]').click();ki.elonezet=$("cspBody").querySelectorAll(".cspJav .cspValt").length===g1.rules.length;
    closeCsapatPanel();
    return ki;});
  ok(d.cond.join()==="true,true,false,false","az „eldőlt meccs” feltétel: 2+ gól bármelyik irányba",d.cond);
  ok(d.b1.n>0&&d.b1.cond&&d.b1.gyengebb&&d.b1.padrol&&d.b1.poszt,"Kirakat eldőlt meccsen: padról, posztra alkalmas, gyengébb a jobb helyére, 60'-től ±2-nél",d.b1);
  ok(d.b2.n>0&&d.b2.cond&&d.b2.erosebb,"Vereségnél a jobbik be: erősebb pados, vesztésre állásnál",d.b2);
  ok(d.b3.n>0&&d.b3.cond&&d.b3.kuszobFelett===0&&d.b3.megj>0,"Eladásra kirakat: 45'-től +2-nél, a küszöb alatti nem jön be (és szól)",d.b3);
  ok(d.max,"legfeljebb 3 csere presetenként, senki kétszer",d.max);
  ok(d.terv.every(Boolean)&&d.hozza,"a cseretervbe tölt (csere vagy hozzáadás), és bekapcsolja a meccs közbeni cseréket",d);
  ok(d.sajat.n>0&&d.sajat.min&&d.lista,"saját preset: elmentve, a listán, a mostani keretből gyárt",d.sajat);
  ok(d.elonezet,"a preset kiválasztása előnézetet mutat",d.elonezet);

  console.log("=== 5. MENTETT FELÁLLÁSOK ===");
  const m=await p.evaluate(()=>{
    const ki={};
    const nevek=()=>slots.map(sl=>sl.player&&sl.player.n);
    const alap=nevek(),alapForm=form;
    const M=cspMentes("Hazai alap");
    ki.mentve=cspMentesek().length===1&&M.nev==="Hazai alap"&&M.form===form;
    /* kísérletezés: a legerősebb tizenegy (a 4. rész a legfiatalabbat hagyta) */
    cspFelallasAlkalmaz(cspFelallasJavaslat("rating"));
    ki.mas=nevek().join()!==alap.join();
    /* visszatöltés: előnézet, aztán alkalmazás */
    const J=cspMentesJavaslat(M.id);
    ki.elonezet=J.valt.length>0&&nevek().join()!==alap.join();
    cspMentesAlkalmaz(J);
    ki.vissza=nevek().join()===alap.join();
    /* ugyanazon a néven felülír */
    cspMentes("Hazai alap");ki.felulir=cspMentesek().length===1;
    /* a karrier-mentés viszi */
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){d=null;}
    ki.mentesben=!!(d&&d.S&&Array.isArray(d.S.felMentes)&&d.S.felMentes.length===1);
    /* egy mentett ember közben elment: kimarad, a helyén a mostani marad */
    cspFelallasAlkalmaz(cspFelallasJavaslat("rating"));
    const M2=cspMentesek()[0];
    const tavozo=M2.xi.find(n=>n&&!nevek().includes(n));
    const p0=fullCareerRoster().find(x=>x.n===tavozo);
    const loc=p0&&findPlayerLocation(p0);
    if(loc&&loc.type==="bench")BENCH[loc.key]=null;else if(loc&&loc.type==="extra")extraRoster.splice(loc.idx,1);
    const J2=cspMentesJavaslat(M2.id);
    ki.kimarad=J2.kimarad.some(x=>x.n===tavozo&&/nincs a keretben/.test(x.ok));
    cspMentesAlkalmaz(J2);
    ki.tobbiVissza=nevek().filter((n,i)=>n===M2.xi[i]).length>=10;
    /* más alakzatban mentett: az alakzatot is visszaállítja */
    const masik=availableFormKeys().find(k=>k!==form);
    applyFormationChange(masik);
    const J3=cspMentesJavaslat(M2.id);
    ki.masForm=!!J3.masForm;
    cspMentesAlkalmaz(J3);
    ki.formVissza=form===alapForm;
    /* törlés */
    S.felMentes=[];ki.torles=cspMentesek().length===0;
    /* a felület */
    openCsapatPanel("fel");ki.felulet=!!$("cspBody").querySelector("[data-cspment]");closeCsapatPanel();
    return ki;});
  ok(m.mentve&&m.felulir,"a mostani tizenegy saját néven menthető (ugyanazon a néven felülír)",m);
  ok(m.mas&&m.elonezet&&m.vissza,"kísérletezés után a mentett tizenegy előnézettel visszatölthető, pontosan",m);
  ok(m.mentesben,"a mentett felállások a karrier-mentéssel együtt mentődnek",m.mentesben);
  ok(m.kimarad&&m.tobbiVissza,"akit közben eladtál, az kimarad (és szól), a többiek visszakerülnek",m);
  ok(m.masForm&&m.formVissza,"más alakzatban mentett felállásnál az alakzat is visszaáll",m);
  ok(m.torles&&m.felulet,"törölhető; a mentés a Felállás fülön van",m);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
