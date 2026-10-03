/* 🤝 3.9.182 — A PÁROS EGY OSZTÁLYBAN, EGY VILÁGBAN.

   Bejelentés: „Divízió ugrás eltörik D1-től kezdve. Bedobta társamnak, hogy
   ugorjon, és őt a D2-be ugrasztotta. 1. Nem kéne ilyenkor már felajánlani.
   […] ha két játékos közül valaki már D0 vagy azalatt van, akkor idény
   indításkor mindkettő kerüljön a legerősebb divízióba. […] De más elcsúszás
   már nem lesz, ha alapvetően kijavítod."

   Valódi piramis-karrierrel, egy kézzel épített ERŐSEBB társ-világgal
   (megnyílt D0, a társ ott játszik). Amit mér:
     1. a feloldás SZIMMETRIKUS: ugyanazt a győztest adja mindkét oldalról;
        egyező világnál nem nyúl semmihez;
     2. a szintugrás NEM jár, ha a társ erősebb osztályban van — és a lánc
        szó nélkül megy tovább, egy naplósorral; a hangolás közös karrierben
        nincs;
     3. a kapu: a gyengébb fél átveszi az erősebb világát (megnyílt D0, ő is a
        D0-ban), a mezőnyszint és az ellenfél-lista az új osztályé, a
        fejlődés-mérő tud róla, és az „EGYÜTT KEZDITEK" ablak mondja el; a gomb
        továbbvisz;
     4. az erősebb fél nem változik, csak a napló szól;
     5. egyező világnál azonnal továbbenged;
     6. a nyári lánc a szintugrás UTÁN hívja a kaput; a mező mentődik; nincs
        oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9225;
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

  /* ---- egy valódi egyjátékos karrier, szezonban, lemezre mentve ---- */
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
  const alap=await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    S.idx=4;S.W=3;S.D=1;S.L=0;S.auto=false;
    saveGame();
    return {kulcs:saveKey(),csapat:teamName,idx:S.idx,W:S.W,D:S.D,L:S.L};});
  ok(!!(alap&&alap.kulcs),"előkészület: valódi piramis-karrier",alap);
  const r=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    o.pyr=!!(S.pyr&&S.pyr.divs&&S.pyr.divs.length);
    o.enDiv=pyrMyDivId();o.enAbove=pyrAbove();
    /* ---- 1. a feloldás ---- */
    const A={div:3,above:0,sig:"a",world:{},host:true},B={div:0,above:1,sig:"b",world:{},host:false};
    const r1=mpPyrResolve(A,B),r2=mpPyrResolve(B,A);
    o.szim=(r1.mine===false&&r1.src===B)&&(r2.mine===true&&r2.src===B);
    const C={div:2,above:1,sig:"c",world:{},host:true},D={div:2,above:1,sig:"d",world:{},host:false};
    o.dontetlen=(mpPyrResolve(C,D).src===C)&&(mpPyrResolve(D,C).src===C);
    o.egyezo=mpPyrResolve({div:1,sig:"x",world:{}},{div:1,sig:"x",world:{}}).same===true;
    /* ---- közös díszlet ---- */
    MP.role="guest";MP.activeRoom="PROBA";MP.active=true;
    _saveLock=saveKey();   /* a mentési zár a közös helyre (különben a napló a zárról szól) */
    window.h2hRoomActive=()=>true;
    window.__szoba={};
    window.mpBk=()=>({h2hGet:async(r,k)=>window.__szoba[k]||null,
      h2hPut:async(r,k,f,v)=>{(window.__szoba[k]=window.__szoba[k]||{})[f]=v;return true;}});
    window.mpNetInit=async()=>{};window.mpBeaconPing=async()=>false;
    window.h2hWaitShow=()=>{};window.h2hWaitHide=()=>{};
    window.__naplo=[];const _al=addLine;window.addLine=(t)=>{window.__naplo.push(String(t));};
    /* az ERŐSEBB társ-világ: a mi világunk + egy megnyílt D0 a tetején, a társ ott */
    const W0=JSON.parse(JSON.stringify(S.pyr));
    const top=W0.divs[0];
    const d0={id:0,name:pyrDivName(0),mean:top.mean+6,lo:top.lo+6,hi:top.hi+6,
      teams:top.teams.map((t,i)=>({n:"Szuper "+i,ovr:t.ovr+6,club:"Szuper "+i,season:"",raw:t.raw}))};
    const tars={div:0,above:1,world:{divs:[d0].concat(W0.divs),above:1,spare:W0.spare||null,spare2:W0.spare2||null,opened:[{s:2,id:0}],rolledFor:W0.rolledFor||null},
      host:true,team:"Társ FC",v:APP_VERSION};
    tars.sig="tars-sig";
    /* ---- 2. szintugrás és hangolás ---- */
    S.mpMatePyr={season:mpUpcomingSeason(),div:0,above:1,sig:"tars-sig",my:{div:pyrMyDivId(),above:pyrAbove()}};
    o.elol=mpPyrMateAhead();
    S.transferBudget=999999999;S.auto=false;
    o.ugrasJar=pyrLeapOfferable();
    let tovabb=0;window.__naplo=[];
    pyrLeapOffer(()=>{tovabb++;});
    o.ugrasTovabb=tovabb;o.ugrasNaplo=window.__naplo.join(" ¦ ");
    o.unlockNyitva=!$("scUnlock").classList.contains("hide")&&/ALL-IN|UGRÁS|ugrás/i.test($("unlockTitle").textContent);
    o.hangolas=pyrRetuneOfferable();
    /* ---- 3. a kapu: a gyengébb oldal (mi) ---- */
    const key="s"+mpUpcomingSeason()+"pyrw";
    window.__szoba[key]={host:tars};
    window.__naplo=[];
    let kesz=0;
    mpPyrUnifyGate(()=>{kesz++;});
    await varj(300);
    o.uj={div:pyrMyDivId(),above:pyrAbove(),divDb:S.pyr.divs.length,
      szint:oppTargetRating,szintVart:pyrLevel(),ellenfel:(SEASON_OPPS||[]).length,
      szuperEllenfel:(SEASON_OPPS||[]).filter(x=>/^Szuper /.test(x.n)).length,
      leaps:JSON.stringify(S.pyr.leaps&&S.pyr.leaps[S.pyr.leaps.length-1])};
    o.ablak=!$("scUnlock").classList.contains("hide");
    o.ablakCim=$("unlockTitle").textContent;o.ablakSzoveg=$("unlockBody").textContent;
    o.keszElotte=kesz;
    o.naplo=window.__naplo.join(" ¦ ");
    o.felrakott=!!(window.__szoba[key]&&window.__szoba[key].guest&&window.__szoba[key].guest.world);
    const g=[...$("unlockActions").querySelectorAll("button")][0];if(g)g.click();await varj(30);
    o.keszUtana=kesz;o.ablakZarva=$("scUnlock").classList.contains("hide");
    /* ---- 4. az erősebb fél (most már mi): a gyengébb rekordja nem változtat ---- */
    const most={div:pyrMyDivId(),above:pyrAbove(),sig:mpPyrSig()};
    const gyenge={div:4,above:0,sig:"gyenge",world:{divs:W0.divs,above:0},host:true,team:"Társ FC"};
    const key2=key;delete window.__szoba[key2];window.__szoba[key2]={host:gyenge};
    window.__naplo=[];kesz=0;
    mpPyrUnifyGate(()=>{kesz++;});await varj(300);
    o.eros={valtozatlan:pyrMyDivId()===most.div&&pyrAbove()===most.above&&mpPyrSig()===most.sig,
      kesz,ablak:!$("scUnlock").classList.contains("hide"),naplo:window.__naplo.join(" ¦ ")};
    /* ---- 5. egyező világ: azonnal tovább ---- */
    delete window.__szoba[key2];
    window.__szoba[key2]={host:Object.assign({},mpPyrMine(),{world:mpPyrWorldPack(),host:true,team:"Társ FC"})};
    window.__naplo=[];kesz=0;
    mpPyrUnifyGate(()=>{kesz++;});await varj(300);
    o.egyezoKapu={kesz,naplo:window.__naplo.length};
    window.addLine=_al;
    return o;});
  console.log("\n— 1. a feloldás —");
  ok(r.pyr,"valódi piramis-világ",{div:r.enDiv,above:r.enAbove});
  ok(r.szim,"szimmetrikus: mindkét oldalról az erősebb (D0) világ nyer");
  ok(r.dontetlen,"azonos osztálynál a házigazda dönt — mindkét oldalról ugyanúgy");
  ok(r.egyezo,"egyező világnál nincs teendő");
  console.log("\n— 2. szintugrás és hangolás —");
  ok(r.elol,"a csere adataiból tudja: a társ erősebb osztályban van");
  ok(!r.ugrasJar&&r.ugrasTovabb===1&&!r.unlockNyitva&&/Szintugrás most nincs/.test(r.ugrasNaplo),
     "a szintugrás NEM jár — a lánc továbbmegy, egy naplósor elmondja, miért",{jar:r.ugrasJar,tovabb:r.ugrasTovabb,naplo:r.ugrasNaplo});
  ok(r.hangolas===false,"a hangolás közös karrierben nincs");
  console.log("\n— 3. a kapu: a gyengébb fél —");
  ok(r.uj.div===0&&r.uj.above===1&&r.uj.divDb===r.uj.divDb,"átvette az erősebb világot: megnyílt D0, ő is ott",r.uj);
  ok(r.uj.szint===r.uj.szintVart&&r.uj.ellenfel>0&&r.uj.szuperEllenfel===r.uj.ellenfel,
     "a mezőnyszint és az ellenfél-lista az új osztályé",r.uj);
  ok(/"to":0/.test(r.uj.leaps)&&/"mp":true/.test(r.uj.leaps),"a fejlődés-mérő tud róla",r.uj.leaps);
  ok(r.ablak&&/EGYÜTT KEZDITEK/.test(r.ablakCim)&&/Társ FC/.test(r.ablakSzoveg)&&/D0/.test(r.ablakSzoveg)
     &&/te is vele kezded az idényt/.test(r.ablakSzoveg)&&/mindig az erősebb osztályban/.test(r.ablakSzoveg)&&r.keszElotte===0,
     "az „EGYÜTT KEZDITEK” ablak elmondja: a társ a D0-ban, te is vele kezdesz",r.ablakSzoveg.slice(0,260));
  ok(r.keszUtana===1&&r.ablakZarva,"a gomb bezár és továbbvisz");
  ok(/Együtt kezditek/.test(r.naplo)&&r.felrakott,"a napló is kimondja; a saját rekord (a világgal) felment",r.naplo.slice(0,200));
  console.log("\n— 4. az erősebb fél —");
  ok(r.eros.valtozatlan&&r.eros.kesz===1&&!r.eros.ablak&&/veled kezdi az idényt/.test(r.eros.naplo),
     "az erősebb fél világa nem változik — csak a napló szól",r.eros);
  console.log("\n— 5. egyező világ —");
  ok(r.egyezoKapu.kesz===1&&r.egyezoKapu.naplo===0,"egyező világnál azonnal továbbenged, szó nélkül",r.egyezoKapu);
  console.log("\n— 6. a lánc, mentés, oldalhiba —");
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(/const _offerMp=\(\)=>\{try\{mpPyrUnifyGate\(_offer\);/.test(src)&&/pyrLeapOffer\(_offerMp\)/.test(src),
     "a nyári lánc a szintugrás UTÁN hívja a kaput");
  ok(/mpMatePyr:S\.mpMatePyr\|\|null/.test(src)&&/S\.mpMatePyr=\(d\.S&&d\.S\.mpMatePyr\)\|\|null/.test(src),"a csere adata mentődik és betöltődik");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
