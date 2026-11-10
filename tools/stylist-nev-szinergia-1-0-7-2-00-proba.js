/* ✏️🔗 1.0.7.2.00 — A STYLIST NÉVCSERÉJE ÉS A SZINERGIA MENTÉSE.
   Amit mér:
     1. a Szinergia (pár, szint, váltás) és a többi tartós jelző túléli a
        mentést és a visszatöltést (eddig a S.szin kimaradt a mentésből);
     2. stylist-mód nélkül nincs ✏️; stylist-módban az adatlapon ott a gomb;
     3. a névcsere azonnal hat (teljes és rövid név), sorba áll a feltöltésre
        (v:3, "nev:" előtag, a kulcs a név hash-e), a törlés visszaadja az alapot;
     4. a szabály: tiltott jelek, hossz, betű, ütközés egy másik játékos nevével;
     5. a valós nevek módját nem érinti;
     6. a napi beépítés (beepit.js --fajl) a NEV_ALAP blokkba teszi, szűr, és a
        beépített lista után a név a stylist helyi rétege nélkül is él;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9435;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
let HTMLSRC=null;   /* a 6. lépésben a beépített másolatot szolgáljuk ki */
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/index.html"&&HTMLSRC){rp.setHeader("content-type",TYPES[".html"]);rp.end(HTMLSRC);return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
const karrier=()=>{
  window.mgmtNyit=()=>false;
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
  phase="season";S.seasonClosed=false;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  let p=await ctx.newPage();
  const errs=[];const figyel=pg=>{pg.on("pageerror",e=>errs.push(String(e)));
    pg.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});};
  figyel(p);
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof stylistNevSet==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});

  /* ---- 1. a Szinergia mentése ---- */
  const r1=await p.evaluate(karrier=>{
    try{localStorage.clear();}catch(e){}
    (0,eval)("("+karrier+")")();
    const Z=szinState();
    Z.par="bombazok|villam";Z.lv=2;Z.valt=1;Z.ert=1;Z.carry=0.4;Z.mert={n:3,g:1};
    S.vl0Asked=1;S.akcGol={sortuz:2};S.talOff=true;S.fanTrophySeason=1;S.lgKingSeason=1;S.leagueAwardCount={"X":1};S.saleKupaJel=1;
    saveGameNow();
    const d=loadSavedGame(saveKey());
    return {szin:d&&d.S&&d.S.szin,vl0:d&&d.S.vl0Asked,akc:d&&d.S.akcGol,tal:d&&d.S.talOff,
      fan:d&&d.S.fanTrophySeason,lg:d&&d.S.lgKingSeason,la:d&&d.S.leagueAwardCount,sk:d&&d.S.saleKupaJel,kulcs:saveKey()};},String(karrier));
  /* újratöltés: a valódi indulási úton */
  await p.reload({waitUntil:"load"});await p.waitForTimeout(1500);
  await p.waitForFunction(()=>typeof szinState==="function",null,{timeout:15000});
  const r1b=await p.evaluate(k=>{
    const d=loadSavedGame(k);let be=false;
    try{be=loadIntoGame(d,k);}catch(e){return {hiba:String(e)};}
    const Z=szinState();return {be,par:Z.par,lv:Z.lv,valt:Z.valt,talOff:!!S.talOff,vl0:S.vl0Asked};},r1.kulcs);
  console.log("— 1. a Szinergia mentése —");
  ok(r1.szin&&r1.szin.par==="bombazok|villam"&&r1.szin.lv===2&&r1.szin.valt===1,"a mentésben ott a Szinergia (pár, szint, a váltás idénye)",r1.szin);
  ok(r1.vl0===1&&r1.akc&&r1.akc.sortuz===2&&r1.tal===true&&r1.fan===1&&r1.lg===1&&r1.la&&r1.sk===1,"a többi tartós jelző is (Villám-ajánlat, akció-gólok, talizmán-kapcsoló, idényes jutalom-őrök)",r1);
  ok(r1b.be&&r1b.par==="bombazok|villam"&&r1b.lv===2&&r1b.valt===1&&r1b.talOff&&r1b.vl0===1,"újratöltés után a Szinergia és a jelzők megvannak",r1b);

  /* ---- 2–5. a névcsere ---- */
  const r2=await p.evaluate(()=>{
    const o={};
    const keret=slots.map(s=>s.player).filter(Boolean);
    const jp=keret.find(x=>HU_NAME_TABLE[x.n])||keret[0];
    const n=jp.n;o.n=n;o.alap=HU_NAME_TABLE[n][0];
    const loc={type:"slot",idx:slots.findIndex(s=>s.player===jp),p:jp};
    stylistSet(false);
    plSheetRender(loc);o.gombNelkul=!!$("plSheetHead").querySelector("[data-nevedit]");
    stylistSet(true);
    plSheetRender(loc);o.gombVan=!!$("plSheetHead").querySelector("[data-nevedit]");
    /* a feltöltés hálózat nélkül: a sor marad */
    window.lbInit=async()=>({mode:"off"});
    /* az ablak */
    $("plSheetHead").querySelector("[data-nevedit]").click();
    o.ablak=!!$("stNevInp")&&!$("hubTacticConfirmModal").classList.contains("hide");
    $("stNevInp").value="  Próba   Péter ";
    $("hubTacticConfirmYes").click();
    o.teljes=fullName(n);o.rovid=shortName(n);
    o.lapon=($("plSheetName")||{}).textContent||"";
    const sor=stylistSor();const t=sor.find(x=>x.n==="nev:"+n);
    o.sor=t?{v:t.v,d:t.d,k:t.k===stylistKulcs("nev:"+n)}:null;
    /* szabály */
    o.tilt=[stylistNevSet(n,"<b>x</b>"),stylistNevSet(n,"Jó \"Név\""),stylistNevSet(n,"a"),stylistNevSet(n,"12345"),stylistNevSet(n,"x".repeat(41))].map(r=>r.ok);
    o.tiltJel=stylistNevSet(n,"<b>Jó</b> Név").nev;   /* a jelek kiesnek, a név marad */
    const masik=Object.keys(HU_NAME_TABLE).find(k=>k!==n);
    o.utk=stylistNevSet(n,HU_NAME_TABLE[masik][0]);
    o.utkNev=fullName(n);
    o.nemListas=stylistNevSet("Nincs Ilyen Játékos 123","Valaki").ok;
    stylistNevSet(n,"Próba Péter");
    /* valós nevek módja */
    setHuNames(false);o.valos=fullName(n);setHuNames(true);
    /* törlés: vissza az alapra */
    stylistNevSet(n,"");o.torles=fullName(n);
    const t2=stylistSor().find(x=>x.n==="nev:"+n);o.torlesSor=t2?t2.d:null;
    stylistNevSet(n,"Próba Péter");
    /* stylist nélkül nem lehet */
    stylistSet(false);o.nemStylist=stylistNevSet(n,"Más Név").ok;stylistSet(true);
    o.export={stylist:{uidA:{}}};
    stylistSor().forEach(x=>{o.export.stylist.uidA[x.k]={v:x.v||1,at:x.at,app:APP_VERSION,n:x.n,d:x.d};});
    /* egy hamis feltöltés: nem létező név, rossz kulcs, tiltott név */
    o.export.stylist.uidB={
      [stylistKulcs("nev:Nincs Ilyen")]:{v:3,at:Date.now(),n:"nev:Nincs Ilyen",d:JSON.stringify({f:"Hamis"})},
      "hrossz":{v:3,at:Date.now(),n:"nev:"+masik,d:JSON.stringify({f:"Rossz Kulcs"})},
      [stylistKulcs("nev:"+masik)]:{v:3,at:Date.now()+5,n:"nev:"+masik,d:JSON.stringify({f:"Próba Péter"})}};
    o.masik=masik;
    return o;});
  console.log("\n— 2–5. a névcsere —");
  ok(!r2.gombNelkul&&r2.gombVan,"✏️ csak stylist-módban, az adatlapon a név mellett",[r2.gombNelkul,r2.gombVan]);
  ok(r2.ablak,"a gomb megnyitja a név-ablakot");
  ok(r2.teljes==="Próba Péter"&&/Próba Péter/.test(r2.lapon),"a név azonnal hat (a szóközök összevonva), az adatlap is mutatja",[r2.teljes,r2.lapon]);
  ok(r2.rovid==="Péter"||r2.rovid==="Próba","a rövid alak a névből jön (a nemzetiség szerinti szó)",r2.rovid);
  ok(r2.sor&&r2.sor.v===3&&r2.sor.k&&JSON.parse(r2.sor.d).f==="Próba Péter","sorba áll a feltöltésre: v:3, „nev:” előtag, a kulcs a hash",r2.sor);
  ok(r2.tilt.every(x=>x===false),"tiltott: csak jelek, egy betű, számok, 41 karakter",r2.tilt);
  ok(r2.tiltJel===undefined,"a HTML-jeles név elutasítva (nem csendben megcsonkítva)",r2.tiltJel);
  ok(r2.utk.ok===false&&/másik játékos/.test(r2.utk.reason),"egy másik játékos nevével ütköző név elutasítva",r2.utk.reason);
  ok(!r2.nemListas,"a közös listán nem szereplő név nem írható át itt");
  ok(r2.valos===r2.n,"a valós nevek módját nem érinti",r2.valos);
  ok(r2.torles===r2.alap&&r2.torlesSor==="","a törlés visszaadja az alapnevet, és a törlés is feltöltésre áll",[r2.torles,r2.torlesSor]);
  ok(!r2.nemStylist,"stylist-mód nélkül nem lehet");

  /* ---- 6. a napi beépítés ---- */
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"stnev-"));
  const html=path.join(tmp,"index.html"),exp=path.join(tmp,"export.json");
  fs.copyFileSync(path.join(ROOT,"index.html"),html);
  fs.writeFileSync(exp,JSON.stringify(r2.export));
  let ki="";try{ki=cp.execFileSync("node",[path.join(ROOT,"tools/stylist/beepit.js"),"--fajl",exp,"--html",html],{encoding:"utf8"});}catch(e){ki="HIBA "+(e.stdout||"")+(e.stderr||"");}
  const uj=fs.readFileSync(html,"utf8");
  const m=/\/\*NEV-ALAP:KEZD\*\/([\s\S]*?)\/\*NEV-ALAP:VEG\*\//.exec(uj);
  let tabla=null;try{tabla=JSON.parse(m[1]);}catch(e){}
  console.log("\n— 6. a napi beépítés —");
  ok(/✏️ 1 név/.test(ki),"a beépítés egy nevet vett át",ki.trim());
  ok(tabla&&tabla[r2.n]==="Próba Péter"&&Object.keys(tabla).length===1,"a NEV_ALAP blokkban a név; a hamis, a rossz kulcsú és az ütköző feltöltés elvetve",tabla);
  /* a második futás nem változtat */
  let ki2="";try{ki2=cp.execFileSync("node",[path.join(ROOT,"tools/stylist/beepit.js"),"--fajl",exp,"--html",html],{encoding:"utf8"});}catch(e){ki2="HIBA";}
  ok(/nincs változás/.test(ki2),"újrafuttatva nincs változás (idempotens)",ki2.trim());
  /* a beépített változat: a név a stylist helyi rétege nélkül is él */
  HTMLSRC=uj;
  const p2=await ctx.newPage();figyel(p2);
  await p2.addInitScript(()=>{window.HANG_TESZT=true;});
  await p2.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p2.waitForTimeout(1200);
  await p2.waitForFunction(()=>typeof stylistNevFor==="function",null,{timeout:15000});
  const r6=await p2.evaluate(n=>{try{localStorage.removeItem(STYLIST_NEV_KEY);}catch(e){}_stNev=null;stylistSet(false);
    return {nev:fullName(n),van:NEV_ALAP[n]};},r2.n);
  ok(r6.nev==="Próba Péter","a beépített listával mindenkinél ez a név (stylist nélkül is)",r6);
  await p2.close();
  try{fs.rmSync(tmp,{recursive:true,force:true});}catch(e){}

  console.log("\n— 7. —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
