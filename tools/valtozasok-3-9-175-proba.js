/* 3.9.175 — HANGOLÁS ÉS BEÁLLÍTÁSOK.

   Amit mér:
     1. PvP KERET-HANGOLÁS: a névre szóló plafon a keret nyers erejének 3%-a
        (100 → 3, 170 → 5,1), a hangolás pillanatában rögzül, a mentés viszi;
        régi mentésben (rögzített plafon nélkül) a régi ±2; a hangolás a 3%-ig
        mehet el, és a kiolvasás is ott vág;
     2. KUPÁK EREJE: minden sorozat a Nyári Kupa bázisához mért sávjában marad
        (MK −6…0, FA −5…+1, KL −4…+1, EL −3…+2, KK −2…+2); a gyenge
        bajnokság a sáv aljára, az erős a tetejére viszi; a KK-t az élvonal
        (D1) ereje mozgatja, nem a saját osztályod; a rangsor egyenrangú
        helyzetben is megmarad; a PvP közös számítása ugyanazt a sávot adja;
     3. ÉRTESÍTÉSEK: a Beállításokban ott a kapcsoló; kikapcsolva a vezetés
        emlékeztetője nem ugrik fel, a társ jelzése sáv helyett a naplóba
        kerül, a jelenlét-kör nem teszi közzé a feliratkozást; a beállítás
        megmarad (localStorage); visszakapcsolva minden a régi;
     4. JOKER SZÍNHŰSÉG: a Joker-fokozat (3/5/8 lap) az új átigazolási
        események súlyát szorozza — a jókét ×1,25/×1,55/×2,00, a rosszakét
        ×1,10/×1,20/×1,35; Joker nélkül (vagy más színnel) a pakli súlya
        változatlan; a felület kiírja;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9217;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:24};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:24,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.auto=false;});
  await p.waitForTimeout(500);

  /* ---- 1. PvP KERET-HANGOLÁS ---- */
  console.log("\n— 1. PvP keret-hangolás: a nyers erő 3%-a —");
  const h=await p.evaluate(()=>{
    const o={f100:mpTuneCapFor(100),f170:mpTuneCapFor(170),txt:mpTuneCapTxt(5.1)};
    /* régi mentés: nincs rögzített plafon → ±2 */
    S.mpTuneCap=null;S.mpBalance=0;S.mpBalanceP={};
    o.regi=mpTuneCap();
    const nev=slots.find(x=>x.player).player.n;
    S.mpBalanceP[nev]=4.5;o.regiKiolvas=mpBalanceOffset(nev);
    /* hangolás: a társ 30 ponttal erősebb → mindenki felfelé, a plafonig */
    S.mpBalanceP={};
    const raw=mpRawStrength();
    const _st=mpDuelStanding;
    mpDuelStanding=()=>{const m=mpMyStrength();return {mine:m,mate:m+30,gap:-30,iLead:false};};
    const r=mpApplyBalance();
    mpDuelStanding=_st;
    const vals=Object.values(S.mpBalanceP);
    o.raw=+raw.toFixed(2);o.cap=S.mpTuneCap;o.vart=mpTuneCapFor(raw);
    o.max=Math.max(...vals);o.n=vals.length;o.capped=r.capped;o.rCap=r.cap;
    o.kiolvas=mpBalanceOffset(r.names[0]);
    /* mentés-kör */
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    o.mentve=d&&d.S&&d.S.mpTuneCap;
    S.mpBalanceP={};S.mpTuneCap=null;
    return o;});
  ok(h.f100===3&&h.f170===5.1&&h.txt==="5,1","a plafon a nyers erő 3%-a: 100 → ±3, 170 → ±5,1",h);
  ok(h.regi===2&&h.regiKiolvas===2,"régi mentésben (rögzített plafon nélkül) a régi ±2 vág",{cap:h.regi,ki:h.regiKiolvas});
  ok(h.cap===h.vart&&h.cap>2,"a hangolás a SAJÁT keret nyers erejéből rögzíti a plafont",{raw:h.raw,cap:h.cap,vart:h.vart});
  ok(Math.abs(h.max-h.cap)<1e-9&&h.capped&&h.rCap===h.cap,"nagy szakadéknál a kör a 3%-os plafonig megy, és ott megáll",{max:h.max,cap:h.cap,capped:h.capped});
  ok(Math.abs(h.kiolvas-h.cap)<1e-9,"a kiolvasás (pOvrDisplay) is a 3%-nál vág",h.kiolvas);
  ok(h.mentve===h.cap,"a plafon a mentésbe kerül",h.mentve);

  /* ---- 2. KUPÁK EREJE ---- */
  console.log("\n— 2. kupák ereje: Nyári Kupa + sorozatsáv —");
  const k=await p.evaluate(()=>{
    const palya=c=>euroMidRating(c)+((EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0);
    const C=["MK","FA","KL","EL","BL"];
    const nyk=nykMidMine();
    const meres=()=>{const o={};C.forEach(c=>{o[c]=palya(c)-nyk;});return o;};
    const ot=oppTargetRating,_top=pyrTopLevel,_g=pyrGrowNow;
    pyrGrowNow=()=>0;
    oppTargetRating=nyk-30;pyrTopLevel=()=>nyk-30;const gyenge=meres();
    oppTargetRating=nyk+30;pyrTopLevel=()=>nyk+30;const eros=meres();
    oppTargetRating=nyk+1;pyrTopLevel=()=>nyk+1;const egyenrangu=meres();
    /* a KK-t az élvonal mozgatja: saját osztály gyenge, D1 erős */
    oppTargetRating=nyk-30;pyrTopLevel=()=>nyk+30;const d1=meres();
    oppTargetRating=ot;pyrTopLevel=_top;pyrGrowNow=_g;
    /* PvP: ugyanaz a sáv, közös számítással (rejtett bónusz nélkül) */
    const ms=120;
    const pvp={};C.forEach(c=>{pvp[c]=mpCupSharedMid(ms,ms-5,0,0,c)+((EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0)-nykMidFor(ms,0);});
    const pvpAzonos=mpCupSharedMid(ms,ms-5,0.2,0.9,"BL")===mpCupSharedMid(ms-5,ms,0.9,0.2,"BL");
    return {nyk,gyenge,eros,egyenrangu,d1,pvp,pvpAzonos,sav:CUP_BAND};});
  const savban=o=>Object.keys(k.sav).every(c=>o[c]>=k.sav[c][0]&&o[c]<=k.sav[c][1]);
  ok(JSON.stringify(k.gyenge)===JSON.stringify({MK:-6,FA:-5,KL:-4,EL:-3,BL:-2}),"jóval gyengébb bajnokság (és élvonal): minden sorozat a sávja ALJÁN",k.gyenge);
  ok(JSON.stringify(k.eros)===JSON.stringify({MK:0,FA:1,KL:1,EL:2,BL:2}),"jóval erősebb bajnokság: a sáv TETEJÉN — MK +0, FA +1, KL +1, EL +2, KK +2",k.eros);
  /* a sáv közepe: MK −3 · FA −2 · KL −1,5 · EL −0,5 · KK 0 — egész számra
     kerekítve az EL és a KK összeérhet, ezért a sorrend nem csökkenő */
  {const q=k.egyenrangu;
   ok(savban(q)&&q.MK<=q.FA&&q.FA<=q.KL&&q.KL<=q.EL&&q.EL<=q.BL&&q.MK<q.KL&&q.KL<q.BL&&q.MK===-3&&q.BL===0,
    "egyenrangú bajnokságnál a sáv közepe (MK −3 … KK 0), és a rangsor megmarad",q);}
  ok(k.d1.BL===2&&k.d1.MK===-6,"a KK-t az élvonal (D1) ereje mozgatja, a hazai kupát a saját bajnokság",k.d1);
  ok(savban(k.pvp)&&k.pvpAzonos,"PvP: a közös számítás ugyanabban a sávban, és a két kliensen azonos",{pvp:k.pvp,azonos:k.pvpAzonos});

  /* ---- 3. ÉRTESÍTÉSEK ---- */
  console.log("\n— 3. értesítések ki/be —");
  const e=await p.evaluate(async()=>{
    const o={};
    renderThemeModal();
    const cb=document.getElementById("ertOn");
    o.kapcsolo=!!cb&&cb.checked;o.alapOn=ertesitesOn();
    o.szoveg=(document.getElementById("ertModalBody")||{}).textContent||"";
    /* ki */
    cb.checked=false;cb.onchange();await new Promise(r=>setTimeout(r,200));
    o.ki=ertesitesOn();
    try{o.tarolt=JSON.parse(localStorage.getItem(ERT_KEY));}catch(x){o.tarolt=null;}
    /* a vezetés emlékeztetője: a kapu és a jelöltek megvannak, mégsem ugrik fel */
    const _k=vezPushKapu,_j=vezPushJelolt,_on=vezPushOn;
    vezPushKapu=()=>"meccs";vezPushJelolt=()=>[Object.keys(VEZ_PUSH)[0]];vezPushOn=()=>true;
    _vezPushKulcs=null;_vezPushLat=0;_vezPushMost=null;_vezPushQ.length=0;
    for(let i=0;i<4;i++){vezPushTick();await new Promise(r=>setTimeout(r,600));}
    const vp=document.getElementById("vezPush");
    o.vezKi=!(vp&&!vp.classList.contains("hide"))&&!_vezPushMost;
    /* a társ jelzése: sáv helyett napló */
    const sorok=[];const _a=addLine;addLine=function(h){sorok.push(String(h).replace(/<[^>]+>/g,""));return _a.apply(this,arguments);};
    const _b=mpBk,_ra=h2hRoomActive;const mode=mpNet.mode,room=MP.activeRoom;
    h2hRoomActive=()=>true;mpNet.mode="fb";MP.activeRoom="ERTPRB";
    mpBk=()=>({h2hGet:async()=>({tars:{at:Date.now(),e:"👋",t:"Társ FC",g:"a szezonindításnál"}})});
    _mpPingSeen=0;
    await mpPingPoll();
    const bar=document.getElementById("mpPingBar");
    o.pingSav=!!bar&&!bar.classList.contains("hide");
    o.pingNaplo=sorok.filter(t=>/🔕/.test(t));
    /* a jelenlét-kör nem teszi közzé a feliratkozást */
    o.kozzeteszFeltetel=String(mpPresenceArm).indexOf("ertesitesOn()")>=0||document.documentElement.innerHTML.indexOf("ertesitesOn()&&(all||force===\"push\")")>=0;
    /* vissza */
    renderThemeModal();
    const cb2=document.getElementById("ertOn");cb2.checked=true;cb2.onchange();await new Promise(r=>setTimeout(r,200));
    o.vissza=ertesitesOn();
    _vezPushKulcs=null;_vezPushLat=0;
    for(let i=0;i<4;i++){vezPushTick();await new Promise(r=>setTimeout(r,600));}
    o.vezBe=!!_vezPushMost||(vp&&!document.getElementById("vezPush").classList.contains("hide"));
    try{vezPushHide();}catch(x){}
    _mpPingSeen=0;sorok.length=0;
    await mpPingPoll();
    o.pingSavBe=!!bar&&!bar.classList.contains("hide");
    try{mpPingHide();}catch(x){}
    addLine=_a;mpBk=_b;h2hRoomActive=_ra;mpNet.mode=mode;MP.activeRoom=room;
    vezPushKapu=_k;vezPushJelolt=_j;vezPushOn=_on;
    return o;});
  ok(e.kapcsolo&&e.alapOn&&/Értesítések/.test(e.szoveg)&&/Készülék-értesítés/.test(e.szoveg),"a Beállításokban ott a kapcsoló, alapból BE, és elmondja, mire hat",e.szoveg.slice(0,140));
  ok(!e.ki&&e.tarolt&&e.tarolt.on===false,"kikapcsolva: a beállítás megmarad (localStorage)",e.tarolt);
  ok(e.vezKi,"kikapcsolva a vezetés emlékeztetője nem ugrik fel");
  ok(!e.pingSav&&e.pingNaplo.length===1&&/Társ FC/.test(e.pingNaplo[0]),"a társ jelzése sáv helyett csendben a naplóba kerül",e.pingNaplo);
  ok(e.kozzeteszFeltetel,"a jelenlét-kör kikapcsolva nem teszi közzé a készülék feliratkozását");
  ok(e.vissza&&e.vezBe&&e.pingSavBe,"visszakapcsolva az emlékeztető és a jelzés-sáv is újra megjelenik",{vez:e.vezBe,ping:e.pingSavBe});

  /* ---- 4. JOKER SZÍNHŰSÉG ---- */
  console.log("\n— 4. Joker színhűség: az új események esélye —");
  const j=await p.evaluate(()=>{
    S.tal=null;const T=talState();
    const ids=Object.keys(TAL_ES_IMPL).filter(id=>TAL_ESEMENY_BY[id]);
    const jo=ids.find(id=>TAL_ESEMENY_BY[id].jo),rossz=ids.find(id=>!TAL_ESEMENY_BY[id].jo);
    T.esemenyek={[jo]:{suly:1},[rossz]:{suly:1}};
    const suly=()=>{_talAlapMemo=null;const o={};talEsemenyPakli().forEach(x=>{o[x.tal]=x.weight;});return [o[jo],o[rossz]];};
    /* minden állapot saját sorszámot kap — a talEloszlas memója erre figyel */
    let sq=100;
    const lapok=(kat,n)=>{sq+=10;T.lapok=Array.from({length:n},(_,i)=>({kat,rang:1,dobas:0.5,valt:"_nincs",uid:sq+i,szezon:1}));T.seq=sq;};
    const out={};
    lapok("joker",0);out.j0=suly();
    lapok("joker",2);out.j2=suly();
    lapok("joker",3);out.j3=suly();
    lapok("joker",5);out.j5=suly();
    lapok("joker",8);out.j8=suly();
    lapok("bank",8);out.bank8=suly();
    lapok("joker",5);
    let html="";try{html=talRezonanciaHtml();}catch(x){html="";}
    out.ui=/Új átigazolási események: a jók esélye/.test(html.replace(/<[^>]+>/g,""));
    out.sorok=[];const _a=addLine;addLine=function(h){out.sorok.push(String(h).replace(/<[^>]+>/g,""));};
    try{talStackBejelent("joker",1);}catch(x){}
    addLine=_a;
    S.tal=null;
    return out;});
  const kb=(a,b)=>Math.abs(a-b)<1e-9;
  ok(kb(j.j0[0],1)&&kb(j.j0[1],1)&&kb(j.j2[0],1)&&kb(j.j2[1],1),"Joker-fokozat nélkül a pakli súlya változatlan",{j0:j.j0,j2:j.j2});
  ok(kb(j.j3[0],1.25)&&kb(j.j3[1],1.10),"◆ (3 lap): a jó új esemény ×1,25, a rossz ×1,10",j.j3);
  ok(kb(j.j5[0],1.55)&&kb(j.j5[1],1.20),"◆◆ (5 lap): ×1,55 / ×1,20",j.j5);
  ok(kb(j.j8[0],2)&&kb(j.j8[1],1.35),"◆◆◆ (8 lap): ×2,00 / ×1,35",j.j8);
  ok(kb(j.bank8[0],1)&&kb(j.bank8[1],1),"más szín színhűsége nem mozdítja az eseményeket",j.bank8);
  ok(j.ui&&j.sorok.length===1&&/új átigazolási események esélye/.test(j.sorok[0]),"a rezonancia-panel és a fokozat-bejelentés kiírja",j.sorok);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
