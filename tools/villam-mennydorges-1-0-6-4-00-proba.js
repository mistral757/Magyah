/* ⚡ 1.0.6.4.00 — VONZÓBB MENNYDÖRGÉS + A SZINERGIA JELENETEI.
   Amit mér:
     1. a Villám minden képessége ×0,95 áron, a hatások +10% (minták: Villámkontra,
        Utolérhetetlen, Robben-szerep, Száguldás);
     2. a Gyors lábak piaca: −33/40/50% a 95+ sebességűek vételárából, a scout
        kiszemeltjeinél is; a lassabbakra nem hat;
     3. a nulladik szintű Villám: 4×95+ vagy 2×99 sebességnél az 1. idényben
        felajánlva; indításkor a Korai plafon-nyitás ingyen él, minden más (szerepek,
        többi képesség) nem; az idényzáráskor teljes értékű; a Panzer útja érintetlen;
     4. a 28 szinergia-pár jelenete lerajzolható és mozog; a lánc-gól a saját jelenetét kapja;
     5. nincs oldalhiba. */
"use strict";
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9173;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof vl0CanOffer==="function"&&!!EVA_SABLON.skSzin,null,{timeout:15000});}catch(e){van=false;}
  ok(van,"az új függvények léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}
  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const mk=(key,tr)=>({key,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});
    const tr=k=>(STYLE_TRAITS.villam||[]).find(x=>x.key===k);
    /* 1. árak és hatások */
    ki.ar=["utolerhetetlen","villamkontra","sprint_iskola","gyors_piac"].map(k=>{const t=tr(k);return t?[k,t.tier,t.lv.map(l=>l.price)]:[k,null];});
    ki.base=STYLE_TRAIT_PRICE;
    ki.kontra=tr("villamkontra").lv.map(l=>l.fx.ownGoalMult);
    ki.utol=tr("utolerhetetlen").lv.map(l=>{try{return typeof l.fx.ovrTeam;}catch(e){return null;}});
    ki.robben=ROLE_DEFS.robben.v.slice();
    ki.szag=[akcQk("szaguld",2,5)/akcQ(2,5),akcQk("sortuz",2,5)/akcQ(2,5)];
    /* 2. a gyors piac */
    S.style=mk("villam",{gyors_piac:3});S.style2=null;S.styleExtra=[];try{styleLvlCacheClear();}catch(e){}
    const nevek=Object.keys(careerPool).filter(n=>!drafted.has(n)).slice(0,2);
    const e1=careerPool[nevek[0]],e2=careerPool[nevek[1]];if(!e1.attrs)initPlayerAttrs(e1);if(!e2.attrs)initPlayerAttrs(e2);
    e1.attrs.seb=97;e2.attrs.seb=80;
    ki.mult=[styleBuyMultFor(e1),styleBuyMultFor(e2),styleSpeedBuyMult()];
    const p1=buyPrice(e1);S.style=mk("villam",{});try{styleLvlCacheClear();}catch(e){}const p0=buyPrice(e1);
    ki.arany=Math.round(p1/p0*100)/100;
    S.style=mk("villam",{gyors_piac:3});try{styleLvlCacheClear();}catch(e){}
    ki.parts=(buyDiscountParts(e1)||[]).map(x=>x.k+":"+Math.round(x.pct*100)+" "+x.d);
    {const rec={n:e1.n,frac:0.7,arF:1};const L1=scoutRealListPrice(rec);S.style=mk("villam",{});try{styleLvlCacheClear();}catch(e){}
     const L0=scoutRealListPrice(rec);ki.scout=Math.round(L1/L0*100)/100;}
    /* 3. a nulladik szint */
    S.style=null;S.style2=null;S.styleExtra=[];try{styleLvlCacheClear();}catch(e){}
    S.vl0Asked=0;
    /* a Villám a feloldási létrán a 2. futástól nyílik — a nulladik szint is csak feloldva él */
    ki.zarva=(()=>{try{return unlockGatesOn()&&!unlockStyleOk("villam");}catch(e){return null;}})();
    try{const U=unlockState();U.runs=Math.max(U.runs||0,1);}catch(e){}
    const keret=fullCareerRoster();
    keret.forEach(p=>{const e=careerPool[p.n];if(e){if(!e.attrs)initPlayerAttrs(e);e.attrs.seb=Math.min(e.attrs.seb,90);}});
    ki.elotte=vl0CanOffer();
    keret.slice(0,4).forEach(p=>{careerPool[p.n].attrs.seb=96;});
    ki.negy95=[vl0CanOffer(),vl0Szamol()];
    keret.slice(0,4).forEach(p=>{careerPool[p.n].attrs.seb=90;});keret.slice(0,2).forEach(p=>{careerPool[p.n].attrs.seb=99;});
    ki.ket99=[vl0CanOffer(),vl0Szamol()];
    ki.start=vl0Start();
    ki.pre={key:S.style&&S.style.key,pre:!!(S.style&&S.style.pre),plafon:styleSpeedEarly(),tr:Object.assign({},S.style&&S.style.traits),
      lv:styleLevel(S.style),szerep:roleKeysForStyle().length,own:styleFxMul?styleFxMul("ownGoalMult"):null};
    {const W=msState();W.sp=999;}
    ki.vesz={kontra:styleBuyTrait("villamkontra"),plafon:styleBuyTrait("korai_plafon")};
    ki.ujra=vl0CanOffer();
    /* a Panzer nulladik szintje továbbra is a Fordított jellemet engedi */
    ki.pzAb=[preAbility({key:"panzer"}),preAbility({key:"villam"})];
    /* az idényzárás */
    S.seasonClosed=true;
    ki.grad=pz0Graduate();
    ki.utana={pre:!!(S.style&&S.style.pre),lv:styleLevel(S.style),szerep:roleKeysForStyle().length};
    S.seasonClosed=false;
    /* 4. a 28 jelenet */
    const nev=slots.map(s=>s.player.n),T=EVA_SABLON.skSzin;
    ki.jel=Object.keys(SZIN_DEFS).map(key=>{
      try{const ev={t:"gol",side:"us",p:nev[9],skill:"szin",skillN:5,min:55,seq:1,akc:{k:"szin",par:key,crew:[nev[4],nev[6],nev[7],nev[9]],sc:nev[9]}};
        const c=evaKontextus(ev);const svg=T.svg(c);const calls=[];T.mozgas((sel,fr,o)=>calls.push(sel),c);
        return [key,svg.length>800&&calls.length>=8&&!!T.cim(c)&&!!T.alcim(c),calls.length];}catch(e){return [key,"HIBA "+e];}});
    ki.sablon=evaSkillSablon({t:"gol",skill:"szin"});
    return ki;});
  console.log("\n— 1. árak és hatások —");
  const varAr=(tier)=>t.base[tier].map(x=>Math.round(x*0.95));
  ok(t.ar.every(a=>a[1]&&JSON.stringify(a[2])===JSON.stringify(varAr(a[1]))),"a Villám képességei ×0,95 áron (az új is)",{ar:t.ar});
  ok(JSON.stringify(t.kontra)==="[1.055,1.1,1.145]","Villámkontra +10%: 1,055 / 1,10 / 1,145",t.kontra);
  ok(Math.abs(t.robben[3]-1.165)<1e-6&&Math.abs(t.robben[0]-1.0385)<1e-6,"a Robben-szerep +10% (az 1-től való eltérés)",t.robben);
  ok(Math.abs(t.szag[0]-1.1)<1e-6&&Math.abs(t.szag[1]-1)<1e-6,"a Száguldás esélye ×1,1, a többi akcióé nem",t.szag);
  console.log("\n— 2. Gyors lábak piaca —");
  ok(t.mult[0]===0.5&&t.mult[1]===1&&t.mult[2]===0.5,"a 95+ sebességűnek −50%, a lassabbnak semmi",t.mult);
  ok(t.arany===0.5,"a vételár a felére esik",t.arany);
  ok(t.scout===0.5,"a scout kiszemeltjének meghirdetett ára is",t.scout);
  ok(t.parts.some(x=>/gyors játékosokra/.test(x)),"a kedvezmény-bontás kimondja",t.parts);
  console.log("\n— 3. a nulladik szintű Villám —");
  console.log("     (a Villám a próba elején zárva: "+t.zarva+")");
  ok(t.elotte===false&&t.negy95[0]===true&&t.ket99[0]===true,"4×95+ vagy 2×99 sebességnél ajánlja, alatta nem",{elotte:t.elotte,negy:t.negy95,ket:t.ket99});
  ok(t.start.ok&&t.pre.key==="villam"&&t.pre.pre&&t.pre.plafon&&t.pre.tr.korai_plafon===1&&t.pre.lv===0,"indításkor: Villám, nulladik szint, a Korai plafon-nyitás azonnal él",t.pre);
  ok(t.pre.szerep===0,"a szerepek a nulladik szinten még nem élnek",t.pre.szerep);
  ok(!t.vesz.kontra.ok&&t.vesz.plafon.ok&&t.vesz.plafon.level===2,"csak a Korai plafon-nyitás fejleszthető",t.vesz);
  ok(t.ujra===false,"a döntés után nincs új ajánlat",t.ujra);
  ok(t.pzAb[0]==="abs_jellem"&&t.pzAb[1]==="korai_plafon","a Panzer útja érintetlen",t.pzAb);
  ok(t.grad===true&&!t.utana.pre&&t.utana.lv>=1&&t.utana.szerep===3,"az idényzáráskor teljes értékű (szint, szerepek)",{grad:t.grad,utana:t.utana});
  console.log("\n— 4. a szinergia jelenetei —");
  ok(t.jel.length===28&&t.jel.every(x=>x[1]===true),"mind a 28 pár jelenete lerajzolható és mozog",t.jel.filter(x=>x[1]!==true));
  ok(t.sablon==="skSzin","a lánc-gól a saját jelenetét kapja",t.sablon);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
