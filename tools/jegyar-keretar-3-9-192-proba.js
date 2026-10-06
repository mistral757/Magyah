/* 🎟️ 3.9.192 — A JEGYÁR A KERET KIKIÁLTÁSI ÁRÁHOZ IGAZODIK.

   BEJELENTÉS: „Túl sok pénz folyik be jegyeladásokból. Legyen referencia az,
   hogy mennyi az átlagos kikiáltási ára egy játékosodnak. Nekem pl most 23Mrd
   körül van. Szerintem az a reális, hogy a jegyárak ehhez igazítva kb 12-15Mrd
   környékén legyenek. Persze ez a fizetéseket is lefelé tolja majd. De az
   eddigi számolás mindkettőnél maradjon meg, csak tegyük hozzá ezt a faktort
   is. Ne lehessen túl könnyen pénzt gyűjteni. És természetesen a játék
   tempóbeállításai erre az összegre is legyenek hatással."

   Amit mér:
     1. A BEJELENTŐ SZÁMAI: 23 Mrd átlagos kikiáltási ár, 300 000-es
        liga-tábor, 260 984 fő, ×1,25 élmény, ×16,2 jegyár-görbe → a
        meccsenkénti bevétel 12–15 Mrd (eddig 52,9 Mrd);
     2. A LÉTSZÁM VÁLTOZATLANUL SZÁMÍT: kétszeres tábor kétszeres bevétel;
        az élmény-szorzó is;
     3. A TEMPÓ: gyorsabb tempón több, lassabbon kevesebb (az alaphoz
        arányosan);
     4. CSAK LEFELÉ: ahol a mostani jegyár eleve a referencia alatt van, a
        faktor 1 (nem emel);
     5. A BÉR KÖVETI: a bér-horgony és a sztár hírnév-horgonya ugyanazzal a
        faktorral csökken;
     6. A VALÓDI KERET: a kikiáltási ár-átlag a keretből jön (>0), és
        gyorsítótárazott;
     7. A FELÜLET: a napló jegyára a valódi jegyár; a keret-bontás és a súgó
        kimondja; verzió; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9235;
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
  await p.waitForFunction(()=>typeof fanAskFactor==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
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
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    tiszta();


    const PT=x=>x/HUF_PER_POINT;   /* Ft → pont */
    ki.valodi=fanSquadAskAvg();
    const t0=performance.now();for(let i=0;i<200;i++)fanSquadAskAvg();ki.cacheMs=Math.round(performance.now()-t0);
    /* a bejelentő helyzete, a bemenetekre stubolva */
    const _ask=fanSquadAskAvg,_lb=fanLeagueBase,_sc=fanTicketScale,_fm=fanMult;
    window.fanSquadAskAvg=()=>PT(23e9);
    window.fanLeagueBase=()=>300000;
    window.fanTicketScale=()=>16.2032;
    window.fanMult=()=>1.25;
    window.tempoMult=()=>GAME_TEMPO.normal.k;
    S.fanBase=260984;
    const regi=S.fanBase*FAN_TICKET*1.25*16.2032;
    ki.bejelento={regiMrd:Math.round(regi*HUF_PER_POINT/1e8)/10,ujMrd:Math.round(fanWeeklyIncome()*HUF_PER_POINT/1e8)/10,
      f:Math.round(fanAskFactor()*1000)/1000,jegy:fanTicketFt()};
    /* 2. létszám és élmény */
    S.fanBase=521968;const dupla=fanWeeklyIncome();S.fanBase=260984;const egy=fanWeeklyIncome();
    window.fanMult=()=>1.0;const elm1=fanWeeklyIncome();window.fanMult=()=>1.25;
    ki.letszam={arany:Math.round(dupla/egy*1000)/1000,elmeny:Math.round(egy/elm1*1000)/1000};
    /* 3. tempó */
    /* 3.9.208 óta a lelátó a PÉNZ-tengelyt olvassa (tempoMultAx) — mindkét olvasót helyettesítjük */
    const _tmAx=window.tempoMultAx;
    const tm=k=>{window.tempoMult=()=>k;window.tempoMultAx=()=>k;return fanWeeklyIncome();};
    const alap=tm(GAME_TEMPO.normal.k);
    ki.tempo={turbo:Math.round(tm(GAME_TEMPO.turbo.k)/alap*100)/100,komotos:Math.round(tm(GAME_TEMPO.komotos.k)/alap*100)/100,
      kokorszak:Math.round(tm(GAME_TEMPO.kokorszak.k)/alap*100)/100};
    window.tempoMult=()=>GAME_TEMPO.normal.k;if(_tmAx)window.tempoMultAx=_tmAx;
    /* 4. csak lefelé: 100 alatti erő, kis jegyár */
    window.fanTicketScale=()=>1;window.fanLeagueBase=()=>12000;window.fanSquadAskAvg=()=>PT(3e9);
    ki.lefele=fanAskFactor();
    window.fanTicketScale=()=>16.2032;window.fanLeagueBase=()=>300000;window.fanSquadAskAvg=()=>PT(23e9);
    /* 5. a bér követi */
    S.wageFans=250000;
    const fNow=fanAskFactor();
    const wNow=wageAnchorWeek(),fmNow=fameWageAnchor();
    window.fanSquadAskAvg=()=>PT(1e15);   /* faktor = 1 */
    const wFull=wageAnchorWeek(),fmFull=fameWageAnchor();
    window.fanSquadAskAvg=()=>PT(23e9);
    ki.ber={f:Math.round(fNow*1000)/1000,berArany:Math.round(wNow/wFull*1000)/1000,
      fameArany:fmFull>0?Math.round(fmNow/fmFull*1000)/1000:null};
    /* 7. a felület */
    const sorok=[];const _a=addLine;addLine=h=>{sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{fanMatchTick({win:true,exc:50,home:true});}catch(e){sorok.push("HIBA "+e);}finally{addLine=_a;}
    ki.naplo=sorok.find(t=>/Szurkolói bevétel/.test(t))||sorok.join(" | ");
    let bont="";try{bont=budgetBreakdownHtml().replace(/<[^>]+>/g," ").replace(/\s+/g," ");}catch(e){bont="HIBA "+e;}
    ki.bontas=(bont.match(/a keret kikiáltási árához igazítva ×[0-9,]+/)||[""])[0];
    ki.szotar=/A JEGYÁR A KERETED ÁRÁHOZ IGAZODIK/.test(GLOSSARY.szurkoloibevetel.text);
    ki.verzio=APP_VERSION;
    window.fanSquadAskAvg=_ask;window.fanLeagueBase=_lb;window.fanTicketScale=_sc;window.fanMult=_fm;
    return ki;});

  console.log("\n— 1. A BEJELENTŐ SZÁMAI —");
  ok(Math.abs(r.bejelento.regiMrd-52.9)<0.2,"a régi számítás: ~52,9 Mrd/meccs",r.bejelento);
  ok(r.bejelento.ujMrd>=12&&r.bejelento.ujMrd<=15,"az új: 12–15 Mrd/meccs",r.bejelento);
  console.log("\n— 2. A LÉTSZÁM ÉS AZ ÉLMÉNY —");
  ok(r.letszam.arany===2&&r.letszam.elmeny===1.25,"kétszeres tábor kétszeres bevétel; az élmény is szoroz",r.letszam);
  console.log("\n— 3. A TEMPÓ —");
  ok(r.tempo.turbo===1.25&&r.tempo.komotos===0.85&&r.tempo.kokorszak===0.33,"a tempó arányosan hat (Villám ×1,25 · Komótos ×0,85 · Kőkorszak ×0,33)",r.tempo);
  console.log("\n— 4. CSAK LEFELÉ —");
  ok(r.lefele===1,"kis jegyárnál a faktor 1 — nem emel",r.lefele);
  console.log("\n— 5. A BÉR KÖVETI —");
  ok(r.ber.f<0.5&&Math.abs(r.ber.berArany-r.ber.f)<0.002,"a bér-horgony ugyanazzal a faktorral csökken",r.ber);
  ok(r.ber.fameArany===null||Math.abs(r.ber.fameArany-r.ber.f)<0.002,"a sztár hírnév-horgonya is",r.ber);
  console.log("\n— 6. A VALÓDI KERET —");
  ok(r.valodi>0,"a kikiáltási ár-átlag a keretből jön",Math.round(r.valodi));
  ok(r.cacheMs<400,"gyorsítótárazott (200 hívás)",r.cacheMs+" ms");
  console.log("\n— 7. A FELÜLET —");
  ok(/Szurkolói bevétel/.test(r.naplo)&&r.naplo.indexOf(r.bejelento.jegy)>=0,"a napló a valódi jegyárat írja",{naplo:r.naplo,jegy:r.bejelento.jegy});
  ok(/×0,/.test(r.bontas),"a keret-bontás kimondja a faktort",r.bontas);
  ok(r.szotar,"a súgó elmondja");
  ok(String(r.verzio).localeCompare("3.9.192",undefined,{numeric:true})>=0,"verzió legalább 3.9.192",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
