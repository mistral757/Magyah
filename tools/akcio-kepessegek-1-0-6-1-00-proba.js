/* 🎬 1.0.6.1.00 — AZ AKCIÓ-KÉPESSÉGEK (Sortűz, Phalanx, Száguldás, Tankoljunk,
   Egyensúly) ÉS A HANGOLÁSOK (gegenpressing −33% / +25% ár, passzrekord
   +75% / −10% ár, Tiki-Taka csapaterő-képesség).
   Amit mér:
     1. a képességek léteznek, III. sávban, 3 szinttel; az árak (gegen ×1,25,
        passzrekord ×0,9 a régi szorzóhoz képest);
     2. a gegen számai ×0,67; a tiki-taka fala 1,32;
     3. a mérce: szintenként a tiki-taka hozamának fele (≤ 0,66);
     4. VALÓDI meccseken: mind az öt akció ütemeződik a szintnyi alkalommal,
        a gól forrásként kerül az elemzésbe, a várható érték egyezik a mért
        gyakorisággal (nagy mintán), a Tankoljunk gólja játékos nélkül;
     5. a jelenetek (sablonok) léteznek és lerajzolhatók;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9139;
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
  try{await p.waitForFunction(()=>typeof akcPlanMatch==="function"&&typeof AKC_DEFS!=="undefined",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"az akció-motor függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(async()=>{
    const ki={};
    gameMode="career";
    window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
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
    phase="season";
    /* 1–3. a képességek, az árak, a hangolás */
    const tr=(st,k)=>(STYLE_TRAITS[st]||[]).find(x=>x.key===k);
    ki.tr={};AKC_KEYS.forEach(k=>{const D=AKC_DEFS[k];const t=(STYLE_TRAITS[D.st]||[]).find(x=>x.lv&&x.lv[0]&&x.lv[0].fx&&x.lv[0].fx[D.fx]);ki.tr[k]=t?{tier:t.tier,n:t.lv.length,key:t.key}:null;});
    ki.ttKoz=!!tr("tikitaka","kozeppalya_ur");
    ki.gegenOvr=(STYLE_TRAITS.gegen||[]).some(t=>t.lv.some(l=>typeof l.fx.ovrTeam!=="undefined"));
    ki.ar={press:tr("gegen","nyomasgyakorlas").lv.map(l=>l.price),pun:tr("gegen","buntetes").lv.map(l=>l.price),
      rek:tr("tikitaka","passzrekord").lv.map(l=>l.price),p1:STYLE_TRAIT_PRICE[1],p2:STYLE_TRAIT_PRICE[2],p3:STYLE_TRAIT_PRICE[3]};
    ki.gp={press:GP_PRESS_PER_MATCH,pun:GP_PUNISH_P,sk:GP_PRESS_SKILL_MULT,fal:TT_FIN_WALL};
    ki.arany=[1,2,3].map(L=>[-10,0,10,20].map(dp=>Math.round(akcQ(L,dp)*L/(TT_TRIES[L]*akcTTp(L,dp))*1000)/1000));
    /* 4. valódi meccsek, mind az öt akcióval (a stílusok egyszerre élnek: 5 slot nincs, ezért kétkörös mérés) */
    window.mezKerdesKell=()=>false;window.saveGame=()=>{};
    const mk=(key,tr)=>({key,chosenSeason:1,traits:tr||{},ms:{done:{},seen:{},t:{}},star:null});
    const korok=[["bombazok","beton","villam","panzer"],["harmonia","bombazok","beton","villam"]];
    const fxk={bombazok:"sortuz",beton:"phalanx",villam:"szaguldas",panzer:"tankoljunk",harmonia:"egyensuly"};
    ki.meccs=[];ki.tervDb={};ki.golDb={};ki.forrDb={};ki.vartOssz={};ki.tankGol=null;
    for(const kor of korok){
      S.style=mk(kor[0],{[fxk[kor[0]]]:3});S.style2=mk(kor[1],{[fxk[kor[1]]]:3});
      S.styleExtra=[mk(kor[2],{[fxk[kor[2]]]:3}),mk(kor[3],{[fxk[kor[3]]]:3})];
      try{styleLvlCacheClear();}catch(e){}
      ki["aktiv"+korok.indexOf(kor)]=akcAktiv();
      for(let m=0;m<10;m++){
        S.unavailable={};S.lastMatch=null;S.idx=m%10;S.auto=true;
        try{utoLancVege();mEloTorol();}catch(e){}
        const _ap=akcPlanMatch;let terv=null;
        window.akcPlanMatch=function(){const r=_ap.apply(this,arguments);terv=r.slice();return r;};
        const _al=addLine;const sorok=[];window.addLine=function(h,c,x,meta){if(meta&&meta.akc)sorok.push(meta.akc);return _al.apply(this,arguments);};
        playMatch();
        for(let i=0;i<600&&!S.lastMatch;i++)await new Promise(r=>setTimeout(r,25));
        window.akcPlanMatch=_ap;window.addLine=_al;
        const M=S.lastMatch;if(!M||!M.mx||!terv)continue;
        terv.forEach(a=>{ki.tervDb[a.k]=(ki.tervDb[a.k]||0)+1;ki.vartOssz[a.k]=(ki.vartOssz[a.k]||0)+a.q;});
        sorok.forEach(a=>{ki.golDb[a.k]=(ki.golDb[a.k]||0)+1;if(a.k==="tank")ki.tankGol=a;});
        Object.keys(M.mx.forr.o).forEach(k=>{if(AKC_DEFS[k])ki.forrDb[k]=(ki.forrDb[k]||0)+M.mx.forr.o[k];});
        ki.meccs.push({gf:M.gf,ga:M.ga,egyeb:(M.mx.forr.o.egyeb||0)});}}
    /* 5. a jelenetek */
    ki.sablon=AKC_KEYS.map(k=>{const T=EVA_SABLON[EVA_SKILL_SABLON[AKC_DEFS[k].skill]];
      if(!T)return [k,false];
      try{const nev=slots.filter(s=>s.player).map(s=>s.player.n);
        const ev={t:"gol",side:"us",p:k==="tank"?"Panzerkampfwagen":nev[9],skill:AKC_DEFS[k].skill,skillN:9,min:50,seq:1,akc:{k,crew:nev.slice(3,9),sc:k==="tank"?null:nev[9]}};
        const c=evaKontextus(ev);const svg=T.svg(c);
        const calls=[];T.mozgas((sel,fr,o)=>calls.push(sel),c);
        return [k,svg.length>500&&calls.length>=3,calls.length];}catch(e){return [k,"HIBA "+e];}});
    return ki;});
  console.log("\n— 1–3. képességek, árak, hangolás —");
  ok(AKC_KEYS_OK(t.tr),"mind az öt akció-képesség létezik, III. sáv, 3 szint",t.tr);
  ok(t.ttKoz&&!t.gegenOvr,"a Tiki-Taka csapaterő-képessége megvan, a Gegennek nincs ilyen",{tt:t.ttKoz,gegen:t.gegenOvr});
  ok(t.ar.press.every((v,i)=>v===Math.round(t.ar.p1[i]*1.25))&&t.ar.pun.every((v,i)=>v===Math.round(t.ar.p2[i]*1.25)),"a nyomásgyakorlás és a büntetés minden szinten +25%",t.ar);
  ok(t.ar.rek.every((v,i)=>v===Math.round(t.ar.p3[i]*1.35*0.9)),"a passzrekord 10%-kal olcsóbb (a 1,35-ös rendszer-szorzóhoz képest)",t.ar.rek);
  ok(t.gp.press[1]===1.34&&t.gp.press[3]===2.41&&t.gp.pun[1]===0.168&&t.gp.pun[3]===0.335&&t.gp.sk[3]===1.44&&t.gp.fal===1.32,"a gegen számai ×0,67, a tiki-taka fala 1,32",t.gp);
  ok(t.arany.every(r=>r.every(v=>Math.abs(v-0.5)<0.01)),"az akció szintenként pontosan a tiki-taka hozamának fele (≤ 0,66)",t.arany);
  console.log("\n— 4. valódi meccsek —");
  ok(t.meccs.length>=18,"lejátszott meccsek",t.meccs.length);
  ok(AKC_KEYS_LIST.every(k=>t.tervDb[k]>=27),"mind az öt akció ütemeződik (szintenként 3 alkalom)",t.tervDb);
  ok(AKC_KEYS_LIST.every(k=>(t.golDb[k]||0)===(t.forrDb[k]||0)),"minden akció-gól forrásként kerül az elemzésbe",{gol:t.golDb,forras:t.forrDb});
  const g=AKC_KEYS_LIST.reduce((a,k)=>a+(t.golDb[k]||0),0),v=AKC_KEYS_LIST.reduce((a,k)=>a+(t.vartOssz[k]||0),0);
  ok(g>0&&Math.abs(g-v)<=Math.max(4,3*Math.sqrt(v)),"a gólok száma a várható körül (Poisson-szórás)",{gol:g,vart:Math.round(v*10)/10});
  ok(!t.tankGol||t.tankGol.sc===null,"a Tankoljunk gólja játékos nélkül",t.tankGol);
  ok(t.meccs.every(m=>m.egyeb===0),"nincs besorolatlan gól",t.meccs.map(m=>m.egyeb));
  console.log("\n— 5. a jelenetek —");
  ok(t.sablon.every(x=>x[1]===true),"mind az öt jelenet lerajzolható és mozog",t.sablon);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
const AKC_KEYS_LIST=["sortuz","phalanx","szaguld","tank","egyens"];
function AKC_KEYS_OK(tr){return AKC_KEYS_LIST.every(k=>tr[k]&&tr[k].tier===3&&tr[k].n===3);}
