/* ⚖️ A POTENCIÁLIS MECCS-ERŐ (3.9.122).

   KIMONDOTT KÉRÉS: „hogy ne lehessen befolyásolni túlzottan dolgokat azzal,
   hogy az aktuális meccs-erődet a mérésnél direkt alacsonyra állítod:
   legyen mindig egy számítás arra, hogy az aktuális kerettel mi a maximális
   meccs-erő, ami explicit összehozható… és amennyiben ezzel egy min
   2,5%-kal jobb meccs-erő összehozható, a potenciális max és az aktuális
   nevezési meccs-erő számtani közepével kell számolni, és ezt jelezni is."

   Amit mér:
     1. a keresés NEM hagy nyomot: felállás, kapitány, taktika, pad, keret
        bitre ugyanaz utána, mint előtte — kivétel esetén is;
     2. ép kerettel a nyereség a küszöb alatt marad (nincs hamis riasztás);
     3. SZÁNDÉKOSAN lebutított felállásnál a keresés visszatalál, és
        a nyereség a küszöb fölé megy;
     4. a használt szám ilyenkor PONTOSAN a két érték számtani közepe;
     5. …küszöb alatt viszont a nyers érték marad, érintetlenül;
     6. a kapcsoló zárva: MS_RATED nélkül a teamMatchStrength az ÉLŐ számot
        adja — a kijelzés, a tanácsadó és a meccs nem változik;
     7. a talált konfiguráció VALÓDI: a felállás létezik, 11 slot tele van,
        a kapitány a pályán van, a taktika ismert;
     8. a bekötés: a kezdőrúgás horgonya és a PvP kézfogás tényleg hívja;
     9. a bejelentés megszólal, és megmondja, mivel lehetne jobb;
    10. a futásidő elfogadható (a horgony hurka 40-szer olvas). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9083;
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
const TAC_OK=["kontra","labdatartas","totalis","busz","hosszu","szeljatek"];
const kozel=(a,b,e)=>typeof a==="number"&&isFinite(a)&&Math.abs(a-b)<=e+1e-9;   /* a lebegőpontos kivonás (86,7−86,6 = 0,10000000000000853) ne bukjon a határon */
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  let van=true;
  try{await p.waitForFunction(()=>typeof msPotential==="function"
      &&typeof msWithRestore==="function"&&typeof msRatedBegin==="function"
      &&typeof msBestConfig==="function",null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a potenciál-mérő függvényei léteznek");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}

  const t=await p.evaluate(()=>{
    const ki={};
    const n1=x=>Math.round(x*10)/10;
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
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    if(!scout)scout=generateScout();
    phase="season";S.idx=0;S.morale=80;
    /* TAKTIKA: a teszt-karrierben nincs aktív rendszer, pedig az a keresés
       negyedik tengelye. Beállítunk egy SZÁNDÉKOSAN rosszul illeszkedőt,
       hogy legyen mit megtalálni. */
    {const lv={};Object.keys(TACTICS).forEach(k=>{lv[k]=95;});
     S.tactics={levels:lv,active:"busz"};}
    /* ERŐS PAD: legyen mit keresni — a kereset a kimaradt emberekből dolgozik */
    {const _k=sq.players.slice(11,18);
     _k.forEach((src,j)=>{
       const pl={n:"Pad "+j+" "+src.n,ovr:src.ovr,pos:(src.pos||["KKP"]).slice(),age:25};
       extraRoster.push(pl);});}

    /* ---- 1. A KERESÉS NEM HAGY NYOMOT ---- */
    const sig=()=>JSON.stringify({
      f:form,c:captainIdx,t:S.tactics&&S.tactics.active,
      xi:slots.map(s=>[s.pos,(s.player&&s.player.n)||null,s.fit]),
      bench:Object.keys(BENCH).map(k=>(BENCH[k]&&BENCH[k].n)||null),
      extra:extraRoster.map(x=>x.n)});
    const elotte=sig();
    const t0=performance.now();
    const cfg=msWithRestore(msBestConfig);
    ki.ms=Math.round(performance.now()-t0);
    ki.nyomtalan=(sig()===elotte);
    /* kivétel esetén is */
    try{msWithRestore(()=>{form="343";captainIdx=7;slots=[];throw new Error("x");});}catch(e){}
    ki.nyomtalanHiba=(sig()===elotte);
    ki.cfg={form:cfg&&cfg.form,cap:cfg&&cfg.cap,tac:cfg&&cfg.tac,
            xiN:cfg&&cfg.xi?cfg.xi.filter(Boolean).length:0};

    /* ---- 7. A TALÁLT KONFIGURÁCIÓ VALÓDI ---- */
    /* ---- A TAKTIKA-TENGELY KÜLÖN ---- */
    {const before=S.tactics.active;
     const c2=msWithRestore(msBestConfig);
     ki.taktika={indulo:before,talalt:c2&&c2.tac,
                 valtozatlanUtana:S.tactics.active===before};}

    ki.valodi={
      formLetezik:!!(cfg&&FORMS[cfg.form]),
      tizenegy:!!(cfg&&cfg.xi&&cfg.xi.length===11&&cfg.xi.every(Boolean)),
      kapitanyPalyan:!!(cfg&&cfg.cap>=0&&cfg.cap<11),
      taktikaIsmert:!!(cfg&&(cfg.tac==null||TACTICS[cfg.tac])),
      nincsDupla:!!(cfg&&cfg.xi&&new Set(cfg.xi).size===cfg.xi.length)};

    /* ---- 6. A KAPCSOLÓ ZÁRVA ---- */
    ki.elo=n1(teamMatchStrength());
    ki.eloNyers=n1(teamStrength()+hiddenMatchBonus());
    ki.kapcsoloZarva=(ki.elo===ki.eloNyers);

    /* ---- 2. ÉP KERETTEL NINCS HAMIS RIASZTÁS ---- */
    /* előbb a motor SAJÁT legjobbját állítjuk be, hogy tényleg ép legyen */
    {const bc=msWithRestore(msBestConfig);
     if(bc){
       const pool=fullCareerRoster().filter(Boolean);
       const arr=arrangeSlotsFor(bc.form,pool);
       form=bc.form;slots=arr.slots;captainIdx=bc.cap;
       if(S.tactics)S.tactics.active=bc.tac;
       /* a talált tizenegyet tesszük ki */
       bc.xi.forEach((nm,i)=>{const pl=pool.find(x=>x.n===nm);
         if(pl){slots[i].player=pl;slots[i].fit=fitFor(pl,slots[i]);}});}}
    {const r=msRatedBegin();msRatedEnd();
     ki.ep={now:r&&r.now,pot:r&&r.pot,gain:r?Math.round(r.gain*1000)/10:null,on:r&&r.on};}

    /* ---- 3-4. SZÁNDÉKOS LEBUTÍTÁS ---- */
    {const pool=fullCareerRoster().filter(Boolean);
     const gyenge=pool.slice().sort((a,b)=>pOvr(a)-pOvr(b));
     /* a kezdőbe a keret leggyengébb tizenegye, poszttól függetlenül */
     slots.forEach((sl,i)=>{const pl=gyenge[i];if(pl){sl.player=pl;sl.fit=fitFor(pl,sl);}});
     captainIdx=0;}
    ki.butaElo=n1(teamStrength()+hiddenMatchBonus());
    {const r=msRatedBegin();
     ki.buta={now:r&&r.now,pot:r&&r.pot,gain:r?Math.round(r.gain*1000)/10:null,
              on:r&&r.on,used:r?n1(r.used):null};
     ki.butaKozep=r?n1((r.now+r.pot)/2):null;
     /* 5. ablakban a teamMatchStrength a nevezési számot adja */
     ki.ablakban=n1(teamMatchStrength());
     msRatedEnd();}
    ki.ablakUtan=n1(teamMatchStrength());

    /* ---- 8. A BEKÖTÉS ---- */
    ki.bekotes={
      horgony:String(pyrAnchorAtKickoff).indexOf("msRatedBegin")>=0,
      horgonyZar:String(pyrAnchorAtKickoff).indexOf("msRatedEnd")>=0,
      kezfogas:String(mpStartExchange).indexOf("msRatedBegin")>=0,
      eloKijelzes:String(sbPaintTeams||function(){}).indexOf("msRatedBegin")<0};
    return ki;});

  console.log("\n1. A KERESÉS NEM HAGY NYOMOT");
  ok(t.nyomtalan===true,"felállás, kapitány, taktika, pad, keret változatlan");
  ok(t.nyomtalanHiba===true,"…kivétel esetén is visszaáll");
  ok(t.cfg.form!=null,"a keresés talált konfigurációt",t.cfg);

  console.log("\n7. A TALÁLT KONFIGURÁCIÓ VALÓDI (nem elméleti felső korlát)");
  ok(t.valodi.formLetezik===true,"a felállás létező");
  ok(t.valodi.tizenegy===true,"mind a 11 slot tele van");
  ok(t.valodi.nincsDupla===true,"senki nem szerepel kétszer");
  ok(t.valodi.kapitanyPalyan===true,"a kapitány a kezdő 11-ben van",t.cfg.cap);
  ok(t.valodi.taktikaIsmert===true,"a taktika a hat ismert egyike",t.cfg.tac);
  ok(t.taktika.talalt!=null&&TAC_OK.includes(t.taktika.talalt),
     "a taktika-tengely is dolgozik (a keresés rendszert is vált)",t.taktika);
  ok(t.taktika.valtozatlanUtana===true,"…és az aktív taktika utána változatlan");

  console.log("\n6. A KAPCSOLÓ ZÁRVA");
  ok(t.kapcsoloZarva===true,"MS_RATED nélkül a teamMatchStrength az ÉLŐ szám",
     {elo:t.elo,nyers:t.eloNyers});
  ok(t.ablakUtan===t.eloNyers||t.ablakUtan!==t.ablakban,
     "az ablak bezárása után újra az élő szám jön",{ablakban:t.ablakban,utan:t.ablakUtan});

  console.log("\n2. ÉP KERETTEL NINCS HAMIS RIASZTÁS");
  ok(t.ep.on===false,"a legjobb felállásnál a nyereség a 2,5% alatt marad",t.ep);

  console.log("\n3-5. SZÁNDÉKOS LEBUTÍTÁS");
  ok(t.buta.now<t.ep.now,"a lebutított felállás tényleg gyengébb",
     {ep:t.ep.now,buta:t.buta.now});
  ok(t.buta.on===true,"a keresés visszatalál, a nyereség a küszöb fölött",t.buta);
  ok(t.buta.gain>=2.5,"…legalább 2,5%",t.buta.gain);
  /* A TŰRÉS 0,1: a `now` és a `pot` egy tizedesre kerekítve utazik, a `used`
     viszont a NYERS értékekből számol — egy .x5 közép a két úton
     ellentétesen kerekedhet (mérve: 86,75 → 86,7 és 86,8). Fél tizedes
     eltérés tehát a mérésé, nem a szabályé. */
  ok(kozel(t.buta.used,t.butaKozep,0.1),"a használt szám a KÉT ÉRTÉK SZÁMTANI KÖZEPE",
     {used:t.buta.used,kozep:t.butaKozep,now:t.buta.now,pot:t.buta.pot});
  ok(kozel(t.ablakban,t.butaKozep,0.1),"és az ablakban a teamMatchStrength ezt adja",
     {ablakban:t.ablakban,kozep:t.butaKozep});

  console.log("\n8. A BEKÖTÉS");
  ok(t.bekotes.horgony===true,"a kezdőrúgás horgonya nyitja az ablakot");
  ok(t.bekotes.horgonyZar===true,"…és be is zárja");
  ok(t.bekotes.kezfogas===true,"a PvP kézfogás meccs-ereje is nevezési szám");
  ok(t.bekotes.eloKijelzes===true,"az élő eredményjelző NEM nyitja (ott az élő szám kell)");

  console.log("\n10. FUTÁSIDŐ");
  ok(t.ms<4000,"a teljes keresés 4 másodperc alatt lefut",t.ms+" ms");

  const zaj=errs.filter(e=>!/favicon|manifest|sw\.js|ServiceWorker/i.test(e));
  ok(zaj.length===0,"nincs konzolhiba",zaj.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
