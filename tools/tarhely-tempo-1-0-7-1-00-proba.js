/* 🗜 1.0.7.1.00 — A MENTÉS TÖMÖRÍTÉSE, A VÉSZHELYZETI TAKARÍTÁS ÉS AZ ÚJ TEMPÓ-CSÚSZKA.
   Amit mér:
     1. a tömörítő oda-vissza KARAKTERRE pontos (véletlen szövegek, ékezet,
        helyettesítő párok, ismétlődés, üres, rövid) — és sérült adatra kivételt dob;
     2. egy valódi karrier mentése tömörítve kerül ki, és ugyanaz töltődik vissza
        (loadSavedGame, saveSlotList, kimentési boríték);
     3. a régi, NYERS mentések egyszeri tömörítése (tarTomoritMind) a tartalmat
        nem változtatja;
     4. TELE TÁRHELY: a mentés és a Run-lista írása a takarítás után sikerül —
        a régi nyers mentés tömörödik, a mérési napló ritkul, karrier nem vész el;
     5. a tárhely-ablak bontása és a „Hely felszabadítása" gomb;
     6. a tempó-csúszka: logaritmikus sín, öt mágneses fokozat, ◀ ▶ léptetés,
        a két szélen kiszürkülő nyíl, a két csúszka szinkronja;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9433;
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
  await p.waitForFunction(()=>typeof mzPack==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});

  /* ---- 1. a tömörítő ---- */
  const r1=await p.evaluate(()=>{
    let seed=7;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
    const ABC="abcdefghijklmnopqrstuvwxyz0123456789{}[]\":,.-_ ";
    const UNI="áéíóöőúüűÁÉÍÓÖŐÚÜŰćčšžłśß—…⚽🔥😀";
    const esetek=["","a","ab","aaaa","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaab",'{"a":"ő"}',"🔥".repeat(3000),
      "\u0000\u0001\u001f￿\ud800x\udfff"];
    for(let t=0;t<60;t++){
      const n=Math.floor(rnd()*(t<40?3000:60000));let s="";
      for(let i=0;i<n;i++){
        const q=rnd();
        if(q<0.05&&s.length>20){const st=Math.floor(rnd()*s.length),l=Math.floor(rnd()*200);s+=s.substr(st,l);}
        else if(q<0.12)s+=UNI[Math.floor(rnd()*UNI.length)];
        else if(q<0.13)s+=String.fromCharCode(Math.floor(rnd()*65536));
        else s+=ABC[Math.floor(rnd()*ABC.length)];}
      esetek.push(s);}
    let rossz=0,max=0;const peldak=[];
    esetek.forEach(s=>{const z=mzPack(s);
      if(mzUnpack(z)!==s){rossz++;peldak.push(s.length);}
      for(let i=4;i<z.length;i++){const c=z.charCodeAt(i);if(c<32||(c>=0xD800&&c<=0xDFFF)){rossz++;break;}}
      max=Math.max(max,s.length);});
    /* sérült adat: kivétel, nem csendes szemét */
    const jo=mzPack(JSON.stringify({x:"y".repeat(5000),z:[1,2,3]}));
    let dob=0;
    try{mzUnpack(jo.slice(0,jo.length>>1));}catch(e){dob++;}
    try{saveRawParse(jo.slice(0,20));}catch(e){dob++;}
    return {n:esetek.length,rossz,peldak,max,dob,
      nyers:mzUnpack('{"a":1}')==='{"a":1}',kicsi:mzForStore('{"a":1}')==='{"a":1}'};});
  console.log("— 1. a tömörítő —");
  ok(r1.rossz===0,`oda-vissza karakterre pontos (${r1.n} eset, a leghosszabb ${r1.max} karakter), vezérlő- és helyettesítő-karakter nélkül`,r1.peldak);
  ok(r1.dob===2,"sérült tömörített adatra kivételt dob (a hívó olvashatatlannak veszi)");
  ok(r1.nyers&&r1.kicsi,"a nyers JSON átmegy rajta, a kicsit nem tömöríti");

  /* ---- 2–5. egy valódi karrier ---- */
  const r2=await p.evaluate(()=>{
    const ki={};
    window.mgmtNyit=()=>false;
    try{localStorage.clear();}catch(e){}
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
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    phase="season";S.seasonClosed=false;
    S.meresId=S.meresId||"proba_tar";
    saveGameNow();
    const k=saveKey();ki.kulcs=k;
    const raw=localStorage.getItem(k)||"";
    ki.z=mzIs(raw);ki.tarolt=raw.length;
    let json="";try{json=mzUnpack(raw);}catch(e){ki.hiba=String(e);}
    ki.nyers=json.length;
    const d=loadSavedGame(k);
    ki.vissza=!!(d&&d.S&&d.teamName===teamName&&d.S.seasonNumber===S.seasonNumber);
    ki.pool=!!(d&&d.careerPool&&unpackCareerPool(d.careerPool)&&Object.keys(unpackCareerPool(d.careerPool)).length===Object.keys(careerPool).length);
    const sl=saveSlotList().find(x=>x.key===k);
    ki.lista=sl?{real:sl.real,broken:sl.broken,z:sl.z,team:sl.team}:null;
    const env=saveExportEnvelope(k,d);
    ki.boritek=!!(env&&env.mentes&&env.mentes.S&&typeof env.mentes==="object");
    ki.sajatVissza=JSON.stringify(d)===json;
    /* ---- 3. a régi, NYERS mentés egy másik helyen + egy nyers mérési napló ---- */
    const k2=spSaveKeyFor(2);
    const masik=JSON.parse(json);masik.teamName="Régi Nyers FC";
    const masikJson=JSON.stringify(masik);
    localStorage.setItem(k2,masikJson);
    const meres={v:MERES_V,id:"regi_napl",t0:1,csapat:"x",sz:[{sz:1,m:[{a:1}]},{sz:2,m:Array.from({length:400},(_,i)=>({i,gf:i%4,ga:i%3,ms:120.5+i/10,note:"meccs-részlet "+i}))},{sz:3,m:Array.from({length:400},(_,i)=>({i,ms:118+i/7}))}]};
    localStorage.setItem("meres30_regi_napl",JSON.stringify(meres));
    ki.elotte=tarBontas();
    /* ---- 4. TELE TÁRHELY ---- */
    let n=0;const blokk="x".repeat(256*1024);
    try{for(;n<400;n++)localStorage.setItem("szemet_"+n,blokk);}catch(e){}
    let kicsi=0;const apro="y".repeat(8*1024);
    try{for(;kicsi<400;kicsi++)localStorage.setItem("apro_"+kicsi,apro);}catch(e){}
    ki.tele={blokk:n,apro:kicsi,most:storageUsedBytes()};
    /* egy nagyobb érték biztosan nem fér be takarítás nélkül */
    let befer=true;try{localStorage.setItem("proba_nagy",apro.repeat(16));localStorage.removeItem("proba_nagy");}catch(e){befer=false;}
    ki.teleTenyleg=!befer;
    /* a mentés most nagyobb lesz (új adat), és a Run-lista is írni akar */
    {let q=11,t="";for(let i=0;i<150000;i++){q=(q*1103515245+12345)&0x7fffffff;t+=String.fromCharCode(0x4E00+(q>>8)%2000);}
     S.hubReportHtml=t;}
    _saveSoonT=0;
    saveFailed=false;
    saveGameNow();
    const raw2=localStorage.getItem(k)||"";
    let d2=null;try{d2=saveRawParse(raw2);}catch(e){}
    ki.mentesSiker=!saveFailed&&!!(d2&&d2.S&&d2.S.hubReportHtml===S.hubReportHtml);
    ki.utolso=_tarVeszUtolso;
    const raw2b=localStorage.getItem(k2)||"";
    ki.masikZ=mzIs(raw2b);
    let m2=null;try{m2=mzUnpack(raw2b);}catch(e){}
    ki.masikEgyezik=m2===masikJson;
    ki.masikLista=(saveSlotList().find(x=>x.key===k2)||{}).team;
    let mr=null;try{mr=saveRawParse(localStorage.getItem("meres30_regi_napl"));}catch(e){}
    ki.meres={van:!!mr,sz1m:!!(mr&&mr.sz[0].m),sz2m:!!(mr&&mr.sz[1].m),sz3m:!!(mr&&mr.sz[2].m)};
    /* a Run-lista írása tele tárhely mellett (újra megtöltjük) */
    try{for(let j=0;j<400;j++)localStorage.setItem("apro2_"+j,apro);}catch(e){}
    const lista=runBoardLoad();
    const sor={id:"proba|sp",run:7.25,team:"Próba FC",seasons:3,level:1,mode:"pyr",at:Date.now()};
    /* egy nyers régi mentés még kell, hogy legyen mit tömöríteni */
    try{localStorage.removeItem("apro2_0");localStorage.removeItem("apro2_1");}catch(e){}
    try{localStorage.setItem(spSaveKeyFor(3),masikJson.slice(0,400000).replace(/^\{/,'{"x":1,'));}catch(e){}
    try{for(let j=0;j<400;j++)localStorage.setItem("apro3_"+j,apro);}catch(e){}
    runBoardSave(lista.concat([sor]));
    ki.runLista=runBoardLoad().some(x=>x&&x.id==="proba|sp");
    /* a napló figyelmeztetése egyszer, nem minden mentésnél */
    _rbWarn=null;let sorok=0;const al=window.addLine;
    window.addLine=(t)=>{if(/Run-szintedet nem sikerült/.test(String(t)))sorok++;};
    const rbl=runBoardLoad,rbs=runBoardSave;
    runBoardLoad=()=>[];runBoardSave=()=>[];
    const er=runBoardEarned,ci=runBoardCareerId;runBoardEarned=()=>true;runBoardCareerId=()=>"proba2|sp";
    try{runBoardEnsure("p");runBoardEnsure("p");runBoardEnsure("p");}catch(e){ki.ensHiba=String(e);}
    runBoardLoad=rbl;runBoardSave=rbs;runBoardEarned=er;runBoardCareerId=ci;window.addLine=al;
    ki.figySorok=sorok;
    /* takarítás: a szemét el, az ablak kirajzolása */
    Object.keys(localStorage).filter(x=>/^(szemet_|apro|apro2_|apro3_)/.test(x)).forEach(x=>localStorage.removeItem(x));
    storeOpen();
    ki.bontas=($("storeBontas")||{}).textContent||"";
    ki.listaZ=(($("storeList")||{}).innerHTML||"").indexOf("🗜")>=0;
    /* a gomb: egy friss nyers mentés → tömörítve */
    localStorage.setItem(k2,masikJson);
    renderStoreModal();
    ki.gombFelirat=($("storeFelBtn")||{}).textContent||"";
    return ki;});
  /* a betöltéskor ütemezett háttér-tömörítés (tarTomoritKesobb) az első
     csendes pillanatban fut le — megvárjuk, és csak utána teszünk le egy
     friss nyers mentést a gombnak */
  await p.waitForTimeout(1500);
  await p.evaluate(()=>{const k2=spSaveKeyFor(2);const d=loadSavedGame(k2);localStorage.setItem(k2,JSON.stringify(d));renderStoreModal();});
  await p.evaluate(()=>$("storeFelBtn").click());
  await p.waitForTimeout(400);
  const r3=await p.evaluate(()=>({msg:$("storeMsg").textContent,z:mzIs(localStorage.getItem(spSaveKeyFor(2))),
    bontas:$("storeBontas").textContent}));
  const KEP=process.env.KEPEK||"";   /* képek csak kérésre, a repón kívülre */
  if(KEP)await p.screenshot({path:path.join(KEP,"tarhely-1-0-7-1-00.png")}).catch(()=>{});
  await p.evaluate(()=>$("storeModal").classList.add("hide"));

  console.log("\n— 2. a valódi karrier mentése —");
  ok(r2.z,"a mentés tömörítve kerül ki",{kulcs:r2.kulcs});
  ok(r2.tarolt*4<r2.nyers,`legalább negyedakkora (${r2.nyers} → ${r2.tarolt} karakter, ×${(r2.nyers/r2.tarolt).toFixed(1)})`);
  ok(r2.vissza&&r2.pool&&r2.sajatVissza,"ugyanaz töltődik vissza (csapat, idény, a teljes pool)");
  ok(r2.lista&&r2.lista.real&&!r2.lista.broken&&r2.lista.z,"a mentési lista valódinak és tömörítettnek látja",r2.lista);
  ok(r2.boritek,"a kimentési boríték a visszafejtett mentést viszi (a fájl formátuma nem változott)");
  console.log("\n— 3–4. tele tárhely —");
  ok(r2.teleTenyleg,"a tárhely tényleg betelt (a próba nem üres tárral mér)",r2.tele);
  ok(r2.mentesSiker,"a mentés tele tárhely mellett is kiment — a takarítás után",r2.utolso);
  ok(r2.masikZ&&r2.masikEgyezik&&r2.masikLista==="Régi Nyers FC","a régi nyers mentés tömörödött, a tartalma karakterre ugyanaz, a lista felismeri");
  ok(r2.meres.van&&r2.meres.sz1m&&!r2.meres.sz2m&&!r2.meres.sz3m,"a mérési napló: az 1. idény részletes marad, a későbbi meccs-részletek ritkulnak",r2.meres);
  ok(r2.runLista,"a Run-lista írása tele tárhely mellett is sikerül (takarítás + újrapróba)");
  ok(r2.figySorok===1,"a „nem sikerült” figyelmeztetés egyszer jön, nem minden mentésnél",r2.figySorok);
  console.log("\n— 5. a tárhely-ablak —");
  ok(/Mi foglal helyet/.test(r2.bontas)&&/Mentések/.test(r2.bontas)&&/Mérési napló/.test(r2.bontas)&&/tömörítve/.test(r2.bontas),"a bontás: mentések, mérési napló, egyéb, a tömörítés kimondva",r2.bontas.slice(0,200));
  ok(r2.listaZ,"a mentési sor jelzi a tömörítést (🗜)");
  ok(/1 nyers mentés tömörítése/.test(r2.gombFelirat),"a gomb megmondja, hány nyers mentés vár",r2.gombFelirat);
  ok(r3.z&&/Felszabadult/.test(r3.msg)&&/érintetlenek/.test(r3.msg),"a gomb tömörít, és kimondja, mennyi szabadult fel",r3.msg);

  /* ---- 6. a tempó-csúszka ---- */
  await p.evaluate(()=>{setMatchSpeed(0.25);});
  const r6=await p.evaluate(()=>{
    const r=$("matchSpeedRange"),e=$("euroSpeedRange");
    const row=r.parentElement,bt=row.querySelectorAll(".speedStep");
    const o={};
    o.pos=MATCH_SPEED_PRESETS.map(matchSpeedToPos);
    o.vissza=MATCH_SPEED_PRESETS.map(v=>matchSpeedFromPos(matchSpeedToPos(v)));
    o.mag=[matchSpeedFromPos(matchSpeedToPos(0.5)+25),matchSpeedFromPos(matchSpeedToPos(1)-28),matchSpeedFromPos(matchSpeedToPos(0.15)+29)];
    o.koztes=matchSpeedFromPos(Math.round((matchSpeedToPos(0.5)+matchSpeedToPos(1))/2));
    o.vegek=[matchSpeedFromPos(0),matchSpeedFromPos(1000)];
    o.lepes=[];
    setMatchSpeed(0.15);o.balTiltva0=bt[0].disabled;
    for(let i=0;i<5;i++){bt[1].click();o.lepes.push(matchSpeed);}
    o.jobbTiltva=bt[1].disabled;
    for(let i=0;i<5;i++){bt[0].click();o.lepes.push(matchSpeed);}
    o.balTiltva=bt[0].disabled;
    setMatchSpeed(0.35);o.egyeni=[$("matchSpeedVal").classList.contains("speedOff")];
    bt[1].click();o.egyeni.push(matchSpeed);setMatchSpeed(0.35);bt[0].click();o.egyeni.push(matchSpeed);
    /* húzás: a sín közepe egy fokozat mellett → ráugrik */
    r.value=String(matchSpeedToPos(1)+12);r.dispatchEvent(new Event("input"));
    o.huzas=[matchSpeed,$("matchSpeedVal").textContent,matchSpeedFromPos(e.value)];
    o.pockok=$("speedPresetList").options.length;
    o.mentve=localStorage.getItem(MATCH_SPEED_KEY);
    setMatchSpeed(0.25);
    o.tick=matchSpeedTickMs();
    return o;});
  console.log("\n— 6. a tempó-csúszka —");
  ok(r6.vissza.join()==="0.15,0.25,0.5,1,2","az öt fokozat a sínen pontosan visszaolvasható",r6.pos);
  ok(r6.pos[1]-r6.pos[0]>=100&&r6.pos[2]-r6.pos[1]>=150,"logaritmikus: a lassú tartomány nem szorul a sín szélére",r6.pos);
  ok(r6.mag.join()==="0.5,1,0.15","a fokozat közelében a csúszka mágnesesen ráugrik",r6.mag);
  ok(r6.koztes>0.5&&r6.koztes<1,"két fokozat között szabad (egyéni) tempó is állítható",r6.koztes);
  ok(r6.vegek.join()==="0.1,3","a sín két vége továbbra is 0,1× és 3×",r6.vegek);
  ok(r6.lepes.join()==="0.25,0.5,1,2,2,1,0.5,0.25,0.15,0.15","a ◀ ▶ a szomszédos fokozatra lép, a végeken megáll",r6.lepes);
  ok(r6.balTiltva0&&r6.jobbTiltva&&r6.balTiltva,"a két szélső fokozaton a nyíl kiszürkül");
  ok(r6.egyeni[0]===true&&r6.egyeni[1]===0.5&&r6.egyeni[2]===0.25,"egyéni tempóból (0,35×) a nyíl a következő fokozatra lép",r6.egyeni);
  ok(r6.huzas[0]===1&&r6.huzas[1]==="1×"&&r6.huzas[2]===1,"húzás után a két csúszka szinkronban, a felirat a fokozat",r6.huzas);
  ok(r6.pockok===5,"a sínen öt pöcök jelzi a fokozatokat");
  ok(r6.mentve==="1"&&r6.tick===2640,"a beállítás megmarad, az ütem változatlan képletű",[r6.mentve,r6.tick]);
  /* kép a csúszkáról */
  await p.evaluate(()=>{try{showScreen&&showScreen("match");}catch(e){}
    const sr=$("speedRow");if(sr){sr.scrollIntoView({block:"center"});}});
  await p.waitForTimeout(200);
  if(KEP)try{const el=await p.$("#speedRow");if(el&&await el.isVisible())await el.screenshot({path:path.join(KEP,"tempo-csuszka-1-0-7-1-00.png")});}catch(e){}

  console.log("\n— 7. —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
