/* 🎯 SCOUT-CÉLZÁS (3.9.223)

   KIMONDOTT KÉRÉS: „A scoutot lehessen beállítani, milyen játékosokat keressen
   inkább. Életkor (sávot választhatsz), pozíció (posztcsoportot vagy posztot
   választhatsz), attribútum (1et), POT (átlag fölötti legyen), jellem (3
   típus 2-2 irány közül), liga/ország (1 liga, vagy az választható, hogy
   általában válogatott játékosokat keressen). Ezek közül kettőt lehet
   választani egy elsődleges célt és egy másodlagost. Elsődleges hatása: 50%
   esély, masodlagose: 33%. Mindkét scout módban legyen elérhető ez. Legyen rá
   állítva értesítés, hogy ne felejtsd el beállítani. De ezt csak első szezon
   15. meccs után lehet beállítani először"

   Amit mér:
     1. A NYÍLÁS: az első idény 14. fordulójáig zárva (a HUB-gomb rejtve, a
        szűrő nem dob kockát), a 15.-től nyitva; a második idényben eleve;
     2. A VÁLASZTÉK: hat fajta; a kor öt sáv, a poszt négy csoport + minden
        poszt, öt képesség, a POT egy érték, a jellem 3 × 2 irány, a liga a
        válogatott + a ligák; a két cél nem lehet ugyanaz a fajta;
     3. MINDEN CÉL ILLESZT: a sávban mindegyikre van megfelelő, és a szűrő
        tényleg csak megfelelőt hagy;
     4. A HATÁS MÉRETE (2000 felfedezés célonként): az elsődleges ≈ 50%, a
        másodlagos ≈ 33% eséllyel dönt (a megfelelők aránya az alapból
        alap + p × (1 − alap)-ra nő), a kettő együtt is;
     5. MINDKÉT MÓD: a klasszikus és a valósághű felfedezés is célzott, a
        napló és a lista 🎯 jellel mutatja;
     6. AZ ÉRTESÍTÉS: a vezetés témája esedékes, amíg nincs beállítva (és a
        kezdőrúgás előtti push-sorba tartozik), utána nem; az újdonság-figyelő
        a nyíláskor szól; a panel kezelhető; a mentés oda-vissza viszi;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9395;
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
  await p.waitForFunction(()=>typeof scoutCelSzur==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
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
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  /* ---- 1. A NYÍLÁS ---- */
  const ny=await p.evaluate(()=>{
    const o={};
    S.scoutCel=null;S.seasonNumber=1;S.idx=14;
    o.zart14=!scoutCelNyitva();
    try{renderHubButtons&&renderHubButtons();}catch(e){}
    let kocka=0;const _r=Math.random;Math.random=function(){kocka++;return _r();};
    S.scoutCel={v:1,p:{t:"kor",v:"22-25"},m:null};
    const pool=Object.values(careerPool).slice(0,50);
    scoutCelSzur(pool);o.kockaZart=kocka;
    S.scoutCel={v:1,p:null,m:null};kocka=0;S.idx=20;scoutCelSzur(pool);o.kockaUres=kocka;
    Math.random=_r;
    S.idx=15;o.nyit15=scoutCelNyitva();
    S.scoutCel=null;S.seasonNumber=2;S.idx=0;o.nyitSz2=scoutCelNyitva();
    S.seasonNumber=1;S.idx=15;
    return o;});
  ok(ny.zart14&&ny.nyit15&&ny.nyitSz2,"az első idény 14. fordulójáig zárva, a 15.-től és a 2. idényben nyitva",ny);
  ok(ny.kockaZart===0&&ny.kockaUres===0,"zárva vagy cél nélkül a szűrő nem dob kockát (a véletlen-sorozat a régi)",ny);

  /* ---- 2. A VÁLASZTÉK ---- */
  const v=await p.evaluate(()=>{
    const o={tip:SCOUT_CEL_TIPUS.map(x=>x.k)};
    ["kor","poszt","attr","pot","jellem","liga"].forEach(t=>o[t]=scoutCelErtekek(t).map(x=>x.k));
    S.scoutCel=null;scoutCelSet("p","kor","22-25");scoutCelSet("m","kor","30-33");
    o.ketto={p:S.scoutCel.p,m:S.scoutCel.m};
    return o;});
  ok(JSON.stringify(v.tip)==='["kor","poszt","attr","pot","jellem","liga"]',"hat fajta cél",v.tip);
  ok(v.kor.length===5&&v.poszt.filter(k=>k.startsWith("g:")).length===4&&v.poszt.filter(k=>k.startsWith("p:")).length>=10
     &&v.attr.length===5&&v.pot.length===1&&v.jellem.length===6&&v.liga[0]==="v"&&v.liga.length>=6,
     "kor 5 sáv · poszt 4 csoport + posztok · 5 képesség · POT · jellem 3×2 · válogatott + ligák",
     {kor:v.kor.length,poszt:v.poszt.length,attr:v.attr.length,jellem:v.jellem.length,liga:v.liga.length});
  ok(v.ketto.p===null&&v.ketto.m&&v.ketto.m.v==="30-33","a két cél nem lehet ugyanaz a fajta (az újabb kiszorítja a régit)",v.ketto);

  /* ---- 3. MINDEN CÉL ILLESZT ---- */
  const il=await p.evaluate(()=>{
    const d=discoveryBand(false);
    const pool=Object.values(careerPool).filter(e=>!drafted.has(e.n)&&e.startRating>=d.lo&&e.startRating<=d.hi);
    const rossz=[],ures=[];
    SCOUT_CEL_TIPUS.forEach(T=>scoutCelErtekek(T.k).forEach(V=>{
      const cel={t:T.k,v:V.k},c=scoutCelCtx(pool,cel);
      const f=pool.filter(e=>scoutCelIllik(cel,e,c));
      if(!f.length){ures.push(T.k+":"+V.k);return;}
      if(f.length===pool.length&&T.k!=="pot")rossz.push(T.k+":"+V.k+" (mindenki)");}));
    return {sav:pool.length,ures,rossz};});
  ok(il.sav>50&&!il.rossz.length,"minden cél valódi szűrő (nem engedi át a teljes sávot)",il);
  ok(il.ures.filter(x=>!x.startsWith("liga:")&&!x.startsWith("poszt:p:")).length===0,
     "a kor, a poszt-csoport, a képesség, a POT és a jellem mindegyikére van megfelelő a sávban",il.ures.slice(0,8));

  /* ---- 4. A HATÁS MÉRETE ---- */
  const m=await p.evaluate(()=>{
    const N=2000;
    const cands=Object.values(careerPool).filter(e=>!drafted.has(e.n));
    const kor=e=>e.age>=22&&e.age<=25,kap=e=>(e.pos||[]).includes("KP");
    const mer=(beall,f)=>{S.scoutCel=beall;let h=0;
      for(let i=0;i<N;i++){const e=pickDiscoveryEntry(cands);if(e&&f(e))h++;}return h/N;};
    const alapKor=mer({v:1,p:null,m:null},kor),alapKap=mer({v:1,p:null,m:null},kap);
    const p1=mer({v:1,p:{t:"kor",v:"22-25"},m:null},kor);
    const p2=mer({v:1,p:null,m:{t:"poszt",v:"g:KAPUS"}},kap);
    const egy=mer({v:1,p:{t:"kor",v:"22-25"},m:{t:"poszt",v:"g:KAPUS"}},e=>kor(e)&&kap(e));
    const alapEgy=mer({v:1,p:null,m:null},e=>kor(e)&&kap(e));
    S.scoutCel={v:1,p:null,m:null};
    return {alapKor,p1,alapKap,p2,alapEgy,egy,
      v1:alapKor+0.5*(1-alapKor),v2:alapKap+0.33*(1-alapKap)};});
  ok(Math.abs(m.p1-m.v1)<0.06,`elsődleges (kor 22–25): ${(m.alapKor*100).toFixed(0)}% → ${(m.p1*100).toFixed(0)}% (várt ≈ ${(m.v1*100).toFixed(0)}% = alap + 50% × maradék)`,m);
  ok(Math.abs(m.p2-m.v2)<0.06,`másodlagos (kapusok): ${(m.alapKap*100).toFixed(0)}% → ${(m.p2*100).toFixed(0)}% (várt ≈ ${(m.v2*100).toFixed(0)}% = alap + 33% × maradék)`,m);
  /* várt: 0,5·0,33 (mindkettő) + a csak-egyik ágak a feltételes arányokkal — a mérésen ≈ 30–38% */
  ok(m.egy>=m.alapEgy*2&&m.egy>=0.2,`a kettő együtt is talál (22–25 éves kapus: ${(m.alapEgy*100).toFixed(1)}% → ${(m.egy*100).toFixed(1)}%)`,m);

  /* ---- 5. MINDKÉT MÓD ---- */
  const md=await p.evaluate(()=>{
    const o={};const sorok=[];const _a=addLine;addLine=function(t){sorok.push(String(t));return _a.apply(this,arguments);};
    S.scoutCel={v:1,p:{t:"pot",v:"atlag"},m:{t:"kor",v:"-21"}};
    S.scoutWatch={v:1,list:[]};
    let klCel=0,reCel=0;
    for(let i=0;i<30;i++){const r=scoutClassicDiscover("scoutfind");if(r&&r.cel)klCel++;S.scoutWatch.list=[];}
    for(let i=0;i<30;i++){const r=scoutRealDiscover("scoutfind");if(r&&r.cel)reCel++;S.scoutWatch.list=[];}
    addLine=_a;
    o.klCel=klCel;o.reCel=reCel;o.jel=sorok.filter(s=>/🎯 <i>Célzott találat/.test(s)).length;
    /* a lista jelöli */
    const r=scoutRealDiscover("scoutfind");let k=0;while((!r||!r.cel)&&k++<40){S.scoutWatch.list=[];const x=scoutRealDiscover("scoutfind");if(x&&x.cel)break;}
    renderScoutWatchPanel();o.listaJel=/🎯/.test($("twBody").innerHTML);
    S.scoutWatch={v:1,list:[]};
    return o;});
  ok(md.klCel>=8&&md.reCel>=8,"mindkét módban célzott a felfedezés (klasszikus és valósághű)",md);
  ok(md.jel===md.klCel+md.reCel&&md.listaJel,"a napló és a lista 🎯 jellel mutatja a célzott találatot",md);

  /* ---- 6. ÉRTESÍTÉS, PANEL, MENTÉS ---- */
  const e=await p.evaluate(()=>{
    const o={};
    S.seasonNumber=1;S.idx=15;S.scoutCel={v:1,p:null,m:null};
    o.tema=!!TEACH_TOPICS["scout:cel"];o.push=VEZ_PUSH["scout:cel"];
    o.esedekes=TEACH_TOPICS["scout:cel"].due();
    S.idx=10;S.scoutCel={v:1,p:null,m:null};o.zartNemEsedekes=!TEACH_TOPICS["scout:cel"].due();S.idx=15;
    const uj=UJ_FIGY.find(x=>x.k==="scoutcel");o.ujNyitva=JSON.stringify(uj.ids());
    S.idx=10;S.scoutCel={v:1,p:null,m:null};o.ujZart=JSON.stringify(uj.ids());S.idx=15;
    /* a panel: típus választása, majd érték */
    renderScoutCelPanel();
    const sel=$("twBody").querySelector('[data-sctip="p"]');sel.value="jellem";sel.onchange();
    const ert=$("twBody").querySelector('[data-scert="p"]');ert.value="ver+";ert.onchange();
    const sel2=$("twBody").querySelector('[data-sctip="m"]');
    o.foglalt=[...sel2.options].find(x=>x.value==="jellem").disabled;
    sel2.value="liga";sel2.onchange();
    o.allapot=JSON.parse(JSON.stringify(S.scoutCel));
    o.visszajelzes=/játékos felel meg/.test($("twBody").innerHTML);
    o.utanaNem=!TEACH_TOPICS["scout:cel"].due();
    /* a HUB-gomb */
    try{renderHub&&renderHub();}catch(x){}
    /* mentés oda-vissza */
    saveGame();try{saveGameFlush&&saveGameFlush();}catch(x){}
    const mentett=S.scoutCel;S.scoutCel=null;
    let raw=null;try{raw=JSON.parse(localStorage.getItem(saveKey()));}catch(x){}
    o.mentesben=!!(raw&&raw.S&&raw.S.scoutCel&&raw.S.scoutCel.p&&raw.S.scoutCel.p.v==="ver+");
    S.scoutCel=mentett;
    return o;});
  ok(e.tema&&e.push==="meccs"&&e.esedekes&&e.zartNemEsedekes,"a vezetés emlékeztet, amíg nincs beállítva (kezdőrúgás előtti push), zárva nem",e);
  ok(e.ujNyitva==='["1"]'&&e.ujZart==="[]","az újdonság-figyelő a nyíláskor szól",e);
  ok(e.allapot.p&&e.allapot.p.t==="jellem"&&e.allapot.p.v==="ver+"&&e.allapot.m&&e.allapot.m.t==="liga"&&e.foglalt&&e.visszajelzes,
     "a panel kezelhető: típus + érték, a foglalt fajta tiltva, visszajelzés a sávról",e.allapot);
  ok(e.utanaNem,"beállítás után az emlékeztető elhallgat",e.utanaNem);
  ok(e.mentesben,"a mentés viszi a célzást",e.mentesben);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
