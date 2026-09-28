/* 🔧 3.9.157 — A TARTÓS FORMA A MECCS-ERŐ MELLETT, A PÁRHARC-CSAPATLAP
   PLAFONJA, ÉS A NYÁRI KUPA ELŐTTI SZÁMÍTÁS.

   KIMONDOTT KÉRÉS: „A nyári kupa nevezés előtt valami 3 másodperces
   computing volt… Plusz jó lenne már megoldani a hibát, ami 120-ban locklja
   pvp-ben az ellenfél játékosainak értékelését… Plusz valami számolás még ráad
   a pvp meccsen valami kiegészítő kiegyenlítést a meccs-erőre."

   Amit mér:
     1. A FORMA: semleges formánál a pillanatkép ⚡-ja és a HUB ⚡-ja egyezik,
        és a forma-tag 0; jó formánál a HUB ⚡ + a forma-tag (pformTeamOvr)
        PONTOSAN a pillanatkép ⚡-ja — vagyis a kiírt két rész összege az, amivel
        a motor számol; a sáv és az eredményjelző kiírja a 📈 tételt;
     2. A CSAPATLAP: a társtól jött 150-es Rating, csapaterő és keret-szám nem
        vágódik 120-ra (a 400 fölötti igen);
     3. A NYÁRI KUPA: a nevezési képernyő láncában a „potenciális meccs-erő"
        keresése EGYSZER fut (nem háromszor), és ugyanazt a mezőnyt adja; ha a
        keret változik, újra fut;
     4. AZ ELŐSZŰRŐ: a keresés az előszűrővel ugyanazt a legjobbat találja, mint
        nélküle, kevesebb teljes számítással;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9199;
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
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=(e==null?1e-9:e)+1e-12;
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof pformTeamOvr==="function",null,{timeout:15000});
  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];phase="season";S.seasonNumber=3;S.idx=0;
    const szabad=Object.values(careerPool).filter(e=>e&&!drafted.has(e.n)&&e.pos&&e.pos.length).slice(0,13);
    szabad.forEach(e=>{if(!e.attrs)initPlayerAttrs(e);const pl=careerPlayerFromPoolEntry(e);extraRoster.push(pl);drafted.add(pl.n);});
    addLine=()=>{};saveGame=()=>{};});

  /* ---- 1. A FORMA ---- */
  const fo=await p.evaluate(()=>{
    const ki={};
    const allit=v=>slots.forEach(sl=>{pformState()[sl.player.n]=v;});
    allit(PFORM_MID);
    ki.s0={hub:teamMatchStrength(),snap:snapMatchStrength(buildMatchSnapshot()),forma:pformTeamOvr()};
    allit(12.5);
    ki.s1={hub:teamMatchStrength(),snap:snapMatchStrength(buildMatchSnapshot()),forma:pformTeamOvr()};
    allit(3);
    ki.s2={hub:teamMatchStrength(),snap:snapMatchStrength(buildMatchSnapshot()),forma:pformTeamOvr()};
    allit(12.5);
    updateStrengthBar();ki.sav=$("teamMatchForma").textContent;
    return ki;});
  console.log("\n— 1. A TARTÓS FORMA —");
  ok(kozel(fo.s0.forma,0,1e-12)&&kozel(fo.s0.hub,fo.s0.snap,0.06),"semleges formánál a forma-tag 0, és a HUB ⚡ = a pillanatkép ⚡",fo.s0);
  ok(fo.s1.forma>1&&kozel(fo.s1.hub+fo.s1.forma,fo.s1.snap,0.06),"jó formánál a HUB ⚡ + a 📈 forma pontosan a pillanatkép ⚡-ja (amivel a motor számol)",fo.s1);
  ok(fo.s2.forma<-1&&kozel(fo.s2.hub+fo.s2.forma,fo.s2.snap,0.06),"rossz formánál is (negatív tag)",fo.s2);
  ok(/📈 forma \+/.test(fo.sav)&&/a meccsen/.test(fo.sav),"a sáv kiírja a formát és a meccsen érvényes összeget",fo.sav);

  /* ---- 2. A CSAPATLAP ---- */
  const cs=await p.evaluate(()=>{
    const c=mpCardClean({team:"Társ",ovr:150,str:152.5,squad:149,mstr:173,
      top:{n:"Sztár Péter",pos:"CS",r:161},
      players:[{n:"Sztár Péter",pos:"CS",r:161,xy:[50,20]},{n:"Túl Nagy",pos:"KP",r:999,xy:[50,90]}]});
    return {ovr:c.ovr,str:c.str,squad:c.squad,top:c.top.r,r:c.players.map(x=>x.r)};});
  console.log("\n— 2. A PÁRHARC-CSAPATLAP —");
  ok(cs.ovr===150&&cs.str===152.5&&cs.squad===149&&cs.top===161&&cs.r[0]===161&&cs.r[1]===400,
    "a 150-es csapaterő és a 161-es Rating megmarad (a régi 120-as plafon helyett 400)",cs);

  /* ---- 3. A NYÁRI KUPA ---- */
  const ny=await p.evaluate(()=>{
    const ki={};
    let n=0;const _b=msBestConfig;msBestConfig=function(){n++;return _b.apply(this,arguments);};
    try{
      _msPotLast=null;
      const t=performance.now();
      const mid=euroMidRating("NYK");const ms=(nykMidMine()!=null)?nykRatedMs():null;const e=nykEntryMs();
      ki.ido=Math.round(performance.now()-t);ki.keres=n;ki.mid=mid;ki.ms=ms;ki.e=e;
      /* ugyanaz még egyszer: nincs új keresés, ugyanaz az eredmény */
      n=0;const mid2=euroMidRating("NYK");ki.keres2=n;ki.mid2=mid2;
      /* a keret változik (új kezdő) → újra keres */
      const t0=slots[5].player,x=extraRoster[0];slots[5].player=x;slots[5].fit=fitFor(x,slots[5]);extraRoster[0]=t0;
      n=0;euroMidRating("NYK");ki.keres3=n;
    }finally{msBestConfig=_b;}
    return ki;});
  console.log("\n— 3. A NYÁRI KUPA —");
  ok(ny.keres===1,"a nevezési képernyő lánca (mezőny, kiírt meccs-erő, nevezési szám) EGY keresést futtat, nem hármat",ny);
  ok(ny.keres2===0&&ny.mid2===ny.mid,"ugyanarra a keretre újra kérve nincs keresés, és ugyanaz a mezőny",{k:ny.keres2,m:[ny.mid,ny.mid2]});
  ok(ny.keres3===1,"ha a kezdő változik, újra keres",ny.keres3);

  /* ---- 4. AZ ELŐSZŰRŐ ---- */
  const el=await p.evaluate(()=>{
    const fut=()=>{let n=0;const _r=msRaw;msRaw=function(){n++;return _r();};
      let best=null;try{best=msWithRestore(msBestConfig);}finally{msRaw=_r;}
      return {v:best&&Math.round(best.v*1000)/1000,xi:best&&best.xi.join(","),n};};
    const vele=fut();const volt=MS_POT_PRUNE;MS_POT_PRUNE=Infinity;const nelkul=fut();MS_POT_PRUNE=volt;
    return {vele,nelkul};});
  console.log("\n— 4. AZ ELŐSZŰRŐ —");
  ok(el.vele.v===el.nelkul.v&&el.vele.xi===el.nelkul.xi&&el.vele.n<el.nelkul.n,
    "az előszűrővel ugyanaz a legjobb felállás, kevesebb teljes számítással",{v:[el.vele.v,el.nelkul.v],n:[el.vele.n,el.nelkul.n]});

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
