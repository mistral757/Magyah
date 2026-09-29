/* 🔧 3.9.151 — BEJELENTETT HIBÁK ÉS KÉRÉSEK, EGY KÖTEGBEN.

   A felhasználó listájából (idézve):
     · „Továbbra is rosszul van kiírva az ellenfél meccsereje PvPben az
       egymás elleni meccsen. Nem annyi, amennyi ténylegesen."
     · „Rosszul van timingolva a félidei csere. Még félidő előtt bekerül a
       feedbe."
     · „Akadémiai tehetségek (átigazolási esemény hozzá őket) ratingja oké,
       életkora botrány. Legyen 18-22 közötti életkoruk."
     · „Rossz kihívás: sebesség plafon nyitás, adj el játékosokat X árban"
     · „Talizmán is legyen kihívás jutalom, és az egyenlítő boost is, és
       csapatstílus kémia lépések"
     · „A morál meccserő hatása nincs számszerűen kiírva sehol" és
       „Csapatkapitánynál sincs kiírva a konkrét meccs erő bónusz amit ad"
     · „Játékos statoknál a HUBban legyen ott, melyik csapatból jött"
     · „A Hiper szuper liga eredményjelzője is legyen menő lila."
   (Az árak skálázását a fejlesztes-arak-proba méri.)

   Amit mér:
     1. PÁRHARC: a társ cseréje a közös listában viszi az erő-változást, és a
        valódi eredményjelző (sbSetOppMs) pontosan annyit mozdítja a társ
        ⚡-jét; a kiállítása a saját emberhátrány-tételével;
     2. TERVEZETT CSERE: a „45. perctől" szabály a közös szimulációban a
        félidő UTÁN (46. perc) jön, a „70. perctől" a 71.-ben; a helyi motor
        feltétele ugyanez;
     3. AKADÉMIAI TEHETSÉG: a valódi átigazolási esemény 18–22 éveseket hoz;
     4. KIHÍVÁS-JUTALMAK: a két rossz nincs a kalapban, a három új igen (ha
        van mire hatnia), és a valódi kiváltásuk működik (a talizmán-húzás
        sorba áll, a csapatstílus-kémia fázist lép, az egyenlítő zsetonja
        elfogy);
     5. KIÍRÁSOK: a HUB morálsora és a kapitányválasztó a meccserőt mondja,
        pontosan a motor képletével; a játékoslap a származási klubot;
     6. a Hiper Szuper Kupa táblája lila;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9185;
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
  await p.waitForFunction(()=>typeof h2hSimulate==="function"&&typeof sbSetOppMs==="function",null,{timeout:15000});

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
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.seasonNumber=3;S.idx=5;S.transferBudget=5e9;S.morale=70;
    addLine=()=>{};saveGame=()=>{};});

  /* ---- 1-2. PÁRHARC: A TÁRS ⚡-JE ÉS A CSERE IDŐZÍTÉSE ---- */
  const d=await p.evaluate(()=>{
    const ki={};
    const nev=(o,i)=>o+" Játékos "+i;
    const csapat=(o,extra)=>Object.assign({
      teamName:o,ovr:80,defMult:1,famSp:null,tacticEffect:0,tacticStyle:null,
      chemPairs:0,ownGoalMult:1,oppGoalMult:1,plan:[],roles:null,
      players:Array.from({length:11},(_,i)=>({n:nev(o,i),pos:i===0?"KP":"KKP",gw:i===0?0.02:5,aw:i===0?0.02:4,rw:1,yw:1})),
      redP:0,yellowP:0},extra||{});
    const terv=[{min:45,cond:"any",outN:nev("Vendég",5),inN:"Vendég Csere 1",dOvr:1.7},
                {min:70,cond:"any",outN:nev("Vendég",6),inN:"Vendég Csere 2",dOvr:-0.9}];
    const sim=h2hSimulate(csapat("Hazai"),csapat("Vendég",{plan:terv}),rngFor("proba151"),false);
    const subs=sim.events.filter(e=>e.type==="sub");
    const felido=sim.events.find(e=>e.type==="half");
    ki.subs=subs.map(e=>({min:e.min,dOvr:e.dOvr}));
    ki.felidoUtan=subs.length===2&&felido&&subs[0].min>felido.min;
    /* a sorrend a rendezett listában is: a 45-ös szabály a félidő-sor UTÁN áll */
    ki.sorrend=sim.events.findIndex(e=>e.type==="half")<sim.events.findIndex(e=>e.type==="sub");
    /* a helyi motor feltétele ugyanaz */
    ki.helyi=/const hatar=atHalf\?45:min-5;/.test(String(playMatchMotor));   /* 3.9.166: a félidei a FÉLIDŐ-sor után, lásd felidei-csere-proba */
    /* a valódi eredményjelző: a társ ⚡-je a kezdőrúgás száma + az ő eseményei */
    sbPaintTeams({duel:true,home:true,myMatch:98,o:{n:"Vendég",ovr:87,dispOvr:88,matchOvr:94.6}});
    ki.alap=SB.teams.away.ms;
    sbSetOppMs(1.7);ki.csereUtan=SB.teams.away.ms;
    sbSetOppMs(1.7-0.9-SIM.REDMATCH);ki.pirosUtan=Math.round(SB.teams.away.ms*100)/100;
    ki.pirosVart=Math.round((94.6+1.7-0.9-SIM.REDMATCH)*100)/100;
    ki.sajatMarad=SB.teams.home.ms;
    /* a lejátszás bekötése: a társ eseményei a saját vödrükben */
    ki.bekotve=/duelOppBkt\[_b\]\|\|\[\]\)\.forEach\(duelApplyOpp\)/.test(String(playMatchMotor));
    return ki;});
  console.log("\n— 1. PÁRHARC: A TÁRS ⚡-JE ÉLŐBEN —");
  ok(d.subs.length===2&&d.subs[0].dOvr===1.7&&d.subs[1].dOvr===-0.9,"a közös lista a csere erő-változását is viszi (véletlent nem fogyaszt)",d.subs);
  ok(d.alap===94.6&&Math.abs(d.csereUtan-96.3)<1e-9&&d.pirosUtan===d.pirosVart&&d.sajatMarad===98,
     "a valódi eredményjelzőn a társ ⚡-je a cserével és a kiállítással mozdul — a sajátod nem",d);
  ok(d.bekotve,"a lejátszás a társ eseményeit is átadja az eredményjelzőnek");
  console.log("\n— 2. A TERVEZETT CSERE IDŐZÍTÉSE —");
  ok(d.felidoUtan&&d.sorrend&&d.subs[0].min===46&&d.subs[1].min===71,"a „45. perctől” csere a félidő UTÁN (46.), a „70. perctől” a 71. percben",d.subs);
  ok(d.helyi,"a helyi motor is a szabály percének lejárta után hajt végre");

  /* ---- 3. AKADÉMIAI TEHETSÉG ---- */
  const y=await p.evaluate(()=>{
    const korok=[];
    const t=TRANSFER_TYPES.find(x=>x.key==="youth");
    for(let i=0;i<25;i++){
      const elotte=new Set(extraRoster.map(x=>x.n));
      applyTransfer(t);
      extraRoster.filter(x=>!elotte.has(x.n)).forEach(x=>{const e=careerPool[x.n];korok.push(e?e.age:x.age);});
      extraRoster.length=Math.min(extraRoster.length,5);}
    return korok;});
  console.log("\n— 3. AKADÉMIAI TEHETSÉG —");
  ok(y.length>=10&&y.every(a=>a>=18&&a<=22),"a valódi átigazolási esemény 18–22 éveseket hoz",{db:y.length,min:Math.min(...y),max:Math.max(...y)});

  /* ---- 4. KIHÍVÁS-JUTALMAK ---- */
  const k=await p.evaluate(()=>{
    const ki={};
    const kalap=(scope)=>{
      const _pick=pick;let pool=null;
      pick=a=>{pool=a;return a[0];};
      try{genReward(scope,"hard",{});}finally{pick=_pick;}
      return (pool||[]).map(x=>x.kind);};
    S.tal=null;const T=talState();
    const alap=kalap("long");
    ki.nincsRossz=!alap.includes("speedCapOpen");
    ki.talDraw=alap.includes("talDraw");
    /* a „salesValue" vállalás sem jön többé: száz long-kihívásból egy sem */
    let volt=false;
    for(let i=0;i<150&&!volt;i++){try{const c=genChallenge("long","hard",{});if(c&&c.type==="salesValue")volt=true;}catch(e){}}
    ki.nincsEladas=!volt;
    /* a talizmán-húzás valódi kiváltása */
    const v0=T.varo.length;
    ki.talTxt=applyChallengeReward({kind:"talDraw"});
    ki.talSor=T.varo.length-v0;ki.talForras=T.varo[T.varo.length-1]&&T.varo[T.varo.length-1].forras;
    ki.talLabel=talForrasSor(T.varo[T.varo.length-1]||{});
    /* az egyenlítő: csak akkor, ha a stílus ismeri; a zseton a végrehajtáskor fogy */
    const _eq=eqLevel;eqLevel=()=>1;
    try{ki.eqKalap=kalap("long").some(x=>x==="freeBoost")&&(()=>{const _pick=pick;let pool=null;pick=a=>{pool=a;return a[0];};try{genReward("long","hard",{});}finally{pick=_pick;}return pool.some(x=>x.kind==="freeBoost"&&x.boost==="equal");})();}
    finally{eqLevel=_eq;}
    applyChallengeReward({kind:"freeBoost",boost:"equal"});
    ki.eqZseton=chFreeBoostLeft("equal");
    ki.eqAr=boostPriceOf("equal");
    ki.eqSpend=boostFreeSpend("equal")&&chFreeBoostLeft("equal")===0;
    /* a csapatstílus-kémia: félkész gyilkos páros */
    const _on=gpDuoOn;gpDuoOn=()=>true;
    try{
      const a=slots[8].player.n,c=slots[9].player.n;
      S.gpDuo=null;gpDuoAddStage(a,c);
      ki.chemKalap=(()=>{const _pick=pick;let pool=null;pick=x=>{pool=x;return x[0];};try{genReward("long","hard",{});}finally{pick=_pick;}return pool.some(x=>x.kind==="styleChemStep");})();
      const st0=gpDuoStages(a,c);
      ki.chemTxt=applyChallengeReward({kind:"styleChemStep",amount:2});
      ki.chem={elotte:st0,utana:gpDuoStages(a,c)};
    }finally{gpDuoOn=_on;}
    ki.chemNincs=!(()=>{const _pick=pick;let pool=null;pick=x=>{pool=x;return x[0];};try{genReward("long","hard",{});}finally{pick=_pick;}return pool.some(x=>x.kind==="styleChemStep");})();
    return ki;});
  console.log("\n— 4. KIHÍVÁS-JUTALMAK —");
  ok(k.nincsRossz&&k.nincsEladas,"a sebességplafon-nyitás és az „adj el X értékben” nem jön többé",k);
  ok(k.talDraw&&k.talSor===1&&k.talForras==="ch"&&/Kihívás-jutalom/.test(k.talLabel),"🧿 talizmán-húzás: a kalapban van, és a valódi kiváltás sorba állítja",k);
  ok(k.eqKalap&&k.eqZseton===1&&k.eqAr===0&&k.eqSpend,"⚖️ egyenlítő: csak egyenlítős stílusnál a kalapban, a zseton 0 Ft-ot ad és a végrehajtáskor fogy",k);
  ok(k.chemKalap&&k.chem.utana===k.chem.elotte+2&&k.chemNincs,"🧲 csapatstílus-kémia: félkész kémiánál a kalapban, a kiváltás +2 fázis; kémia nélkül nincs a kalapban",{chem:k.chem,txt:k.chemTxt});

  /* ---- 5. KIÍRÁSOK ---- */
  const x=await p.evaluate(()=>{
    const ki={};
    S.morale=80;updateMorale();
    ki.moral=$("moraleLine").textContent;
    ki.moralVart=moraleToOvr(80);
    const c=captainMsBonus(captainIdx);
    ki.kap=c;
    ki.kapKezzel={mor:moraleToOvr(moraleTargetIfCaptain(captainIdx))-moraleToOvr(moraleTargetIfCaptain(-1)),
      rut:captainAgeExpBonus(slots[captainIdx].player.age)*0.15};
    try{renderHubCaptainPicker();ki.kapPanel=/meccserő/.test($("hubCaptainHint").innerHTML)&&/meccserő/.test($("hubCaptainBody").innerHTML);}catch(e){ki.kapPanel="hiba: "+e.message;}
    /* honnan jött: a draftos bélyeg és a valódi játékoslap */
    const pl=slots[3].player,e=careerPool[pl.n];
    delete e.from;
    playerFromStamp(pl.n,{club:"Ferencvárosi TC",season:"2011/12"});
    ki.bely=e.from;
    playerFromStamp(pl.n,{club:"Másik FC",season:"2020/21"});
    ki.nemIrja=e.from.club==="Ferencvárosi TC";
    try{const d=buildHubDetail({type:"slot",idx:3,p:pl});ki.lap=d.textContent.indexOf("honnan jött")>=0;}catch(err){ki.lap="hiba: "+err.message;}
    /* markArrived bélyegez (akadémistát a saját akadémiának) */
    const ak=generateAcademyPlayer("KV");markArrived(ak,0,true);
    ki.akad=careerPool[ak.n].from&&careerPool[ak.n].from.akad===1;
    ki.akadTxt=playerFromTxt(ak,careerPool[ak.n]);
    return ki;});
  console.log("\n— 5. KIÍRÁSOK —");
  ok(/meccserő/.test(x.moral)&&x.moral.indexOf((x.moralVart>=0?"+":"−")+Math.abs(Math.round(x.moralVart*10)/10).toFixed(1).replace(".",","))>=0,
     "a HUB morálsora a meccserőt is kiírja — a motor képletével",{sor:x.moral,vart:x.moralVart});
  ok(Math.abs(x.kap.mor-x.kapKezzel.mor)<1e-9&&Math.abs(x.kap.rut-x.kapKezzel.rut)<1e-9&&x.kapPanel===true,
     "a kapitányválasztó kiírja, mennyi meccserőt ad (morálon át + rutin, a kapitány nélküli csapathoz mérve)",x.kap);
  ok(x.bely&&x.bely.club==="Ferencvárosi TC"&&x.nemIrja&&x.lap===true,"a játékoslapon ott a származási klub, és a bélyeg nem íródik felül",x.bely);
  ok(x.akad&&/akadémia/.test(x.akadTxt),"az akadémista a saját akadémiát kapja",x.akadTxt);

  /* ---- 6. HIPER SZUPER KUPA ---- */
  const h=await p.evaluate(()=>{
    const bd=$("sbBoard");bd.className="";bd.classList.add("comp-HSZ");
    const bg=getComputedStyle(bd).backgroundImage;
    bd.classList.remove("comp-HSZ");
    const alap=getComputedStyle(bd).backgroundImage;
    return {lila:/91, 26, 158|5b1a9e/i.test(bg),mas:bg!==alap};});
  console.log("\n— 6. HIPER SZUPER KUPA —");
  ok(h.lila&&h.mas,"a Hiper Szuper Kupa táblája lila",h);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
