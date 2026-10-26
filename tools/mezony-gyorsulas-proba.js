/* 🏃 A MEZŐNY IDÉNY KÖZBENI GYORSULÁSA (3.9.254)

   KÉRÉS: „4. szezontól kezdve […] elunalmasodik […] olyan rendszert, ami
   szezonról szezonra erősíti a szezon közbeni fejlődési tempóját az
   ellenfélnek, és ezen még tovább erősít az, hogy épp hanyadik divízióban
   vagyunk […] ne növeljük a beragadás esélyét […] Eleinte lőjünk inkább alá".

   Amit mér: a görbe (1–3. idény 0; a mért többlet 30%-a; plafon 10; nem
   csökken), az osztályszorzó, a fordulónkénti gyűlés és hogy az ellenfelek
   ereje ezt látja, az idempotencia, a beragadás-őr, az idényváltás, a napló,
   nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9478;
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
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

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
    /* 3.9.302: az új karrier már a 2. szerződéssel (gyv) indul — ez a próba a
       FUTÓ karrierek 3.9.254 görbéjét méri, ezért a jelzőt levesszük */
    try{delete S.pyr.gyv;}catch(e){}
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


  const r=await p.evaluate(()=>{
    const ki={};
    ki.pyr=!!(typeof pyrOn==="function"&&pyrOn());
    ki.gorbe=[1,2,3,4,5,6,8,12,30].map(n=>Math.round(nfGyorsIdeny(n)*100)/100);
    ki.oszt=[PYR_DIVS,Math.ceil(PYR_DIVS/2),1,0,-5].map(d=>Math.round(nfGyorsOszt(d)*1000)/1000);
    const _tms=teamMatchStrength,_oms=oppMatchStrength,_add=addLine;
    const naplo=[];addLine=(t)=>{naplo.push(t);};
    try{
      /* 3. idény: semmi */
      S.seasonNumber=3;S.idx=0;S.pyr.gyors=null;S.pyr.grow=null;SEASON_OPPS=pyrOpponents();
      teamMatchStrength=()=>200;
      S.idx=10;ki.harom=nfGyorsTick();
      /* 4. idény, elhúzó csapat: gyűlik */
      S.seasonNumber=4;S.idx=0;S.pyr.gyors=null;S.pyr.grow=null;SEASON_OPPS=pyrOpponents();
      const base0=SEASON_OPPS[0].ovrBase!=null?SEASON_OPPS[0].ovrBase:SEASON_OPPS[0].ovr;
      const E=nfGyorsTeljes(4,pyrMyDivId());ki.E=E;
      S.idx=10;nfGyorsTick();pyrOppRefresh();
      ki.acc10=S.pyr.gyors.acc;ki.vart10=Math.round(E*10/30*1000)/1000;
      ki.ovr=Math.round((SEASON_OPPS[0].ovr-base0)*1000)/1000;ki.vartOvr=Math.round((pyrGrowStep()*10+ki.vart10)*100)/100;
      ki.kozben=Math.round((pyrGrowNow()-pyrGrowStep()*10-pyrMidLiftNow())*1000)/1000;
      /* idempotens */
      nfGyorsTick();ki.ujra=S.pyr.gyors.acc;
      /* beragadás-őr: a csapat a célrés alatt → nem gyűlik */
      teamMatchStrength=()=>oppMatchStrength()-5;
      S.idx=15;nfGyorsTick();ki.or={acc:S.pyr.gyors.acc,szunet:S.pyr.gyors.szunet};
      /* újra elhúz → megint gyűlik */
      teamMatchStrength=()=>500;
      S.idx=30;nfGyorsTick();ki.vege=S.pyr.gyors.acc;ki.vartVege=Math.round((E*10/30+E*15/30)*1000)/1000;
      /* új idény: nulláról, és a régi nem számít */
      S.seasonNumber=5;S.idx=0;ki.ujIdeny=nfGyorsAcc();
      ki.szolt=naplo.filter(t=>/felpörgött/.test(t)).length;
    }finally{teamMatchStrength=_tms;oppMatchStrength=_oms;addLine=_add;}
    return ki;});
  console.log(JSON.stringify(r));
  ok(r.pyr,"piramis-karrier fut");
  ok(r.gorbe.slice(0,3).every(v=>v===0),"az 1–3. idényben nincs gyorsulás",r.gorbe);
  ok(Math.abs(r.gorbe[3]-4.05)<0.01&&Math.abs(r.gorbe[4]-5.4)<0.01&&Math.abs(r.gorbe[5]-6.75)<0.01,"4. idény +4,05 · 5. +5,4 · 6. +6,75 (a mért többlet 30%-a)",r.gorbe.slice(3,6));
  ok(r.gorbe[7]===10&&r.gorbe[8]===10,"legfeljebb +10 egy idényre",r.gorbe.slice(6));
  ok(r.gorbe.every((v,i,a)=>i===0||v>=a[i-1]),"idényről idényre nem csökken",r.gorbe);
  ok(r.oszt[0]===0.5&&r.oszt[2]===1&&r.oszt[3]>1&&r.oszt[4]===1.15&&r.oszt[1]>0.5&&r.oszt[1]<1,"osztály: legalul ×0,5 → élvonal ×1 → szuperliga legfeljebb ×1,15",r.oszt);
  ok(r.harom===0,"a 3. idényben a tick sem ad semmit",r.harom);
  ok(r.E>0&&Math.abs(r.acc10-r.vart10)<1e-6,"10 forduló után a gyorsulás tizede/harmada gyűlt össze (E·10/30)",[r.acc10,r.vart10]);
  ok(Math.abs(r.ovr-r.vartOvr)<0.02&&Math.abs(r.kozben-r.acc10)<1e-6,"az ellenfelek ereje az alapütem + a gyorsulás",[r.ovr,r.vartOvr]);
  ok(r.ujra===r.acc10,"egy fordulót egyszer számol (idempotens)",r.ujra);
  ok(r.or.acc===r.acc10&&r.or.szunet===5,"beragadás-őr: a célrés alatt nem gyűlik (5 forduló szünet)",r.or);
  ok(Math.abs(r.vege-r.vartVege)<0.002,"elhúzáskor újra gyűlik — az idény végén a 25 jó fordulóé",[r.vege,r.vartVege]);
  ok(r.ujIdeny===0,"az új idény nulláról indul",r.ujIdeny);
  ok(r.szolt===1,"a napló egyszer szól az idényben",r.szolt);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
