/* 🧭 1.0.4.16.01 — A JÁTÉKOS-ADATLAP FEJLÉCE: HONNAN ÉS MILYEN ÚTON JÖTT.
   KÉRÉS: „kerüljön be, hogy az adott játékos melyik csapatból jött hozzánk és
   milyen úton (draft, vásárlás, scout, ifiakadémia, átigazolási esemény)."
   Amit mér: a közös feljegyző; a markArrived a hívó útját veszi át, vagy
   következtet (vételár → vásárlás, akadémia → ifiakadémia); a közvetlen
   feljegyzést nem írja felül; a klub-szemle a szemlézett klubot rögzíti; a
   visszavásárlás frissíti az utat, a klubot nem; régi mentés: következtetés;
   a fejléc sora megjelenik; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9419;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof cupLapTorles==="function",null,{timeout:15000});

  const r=await p.evaluate(()=>{
    const ki={};
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
    window.saveGame=()=>{};
    S.seasonNumber=3;
    const szabad=Object.values(careerPool).filter(e=>!drafted.has(e.n)).slice(0,8).map(e=>e.n);
    const P=n=>careerPlayerFromPoolEntry(careerPool[n]);
    /* 1. a markArrived a hívó útjával */
    const a=P(szabad[0]);a._erkUt="scout";markArrived(a,500);ki.a=JSON.parse(JSON.stringify(careerPool[a.n].from));
    /* 2. következtetés: vételár → vásárlás; akadémia → ifiakadémia */
    const b=P(szabad[1]);markArrived(b,800);ki.b=careerPool[b.n].from.via;
    const c=P(szabad[2]);markArrived(c,0,true);ki.c=JSON.parse(JSON.stringify(careerPool[c.n].from));
    /* 3. közvetlen feljegyzés után a markArrived nem írja felül */
    const d=P(szabad[3]);erkUtJegyez(d.n,"esemeny",null,"egy távozó helyére");markArrived(d,900);ki.d=JSON.parse(JSON.stringify(careerPool[d.n].from));
    /* 4. klub-szemle: a szemlézett klub */
    const f=P(szabad[4]);f._erkUt="szemle";f._erkKlub={club:sq.club,season:sq.season};markArrived(f,700);ki.f=JSON.parse(JSON.stringify(careerPool[f.n].from));ki.sqClub=sq.club;
    /* 5. visszavásárlás: az út frissül, a klub marad */
    S.seasonNumber=5;const klub0=careerPool[b.n].from.club;
    const b2=P(szabad[1]);b2._erkUt="vissza";markArrived(b2,1000);ki.b2=JSON.parse(JSON.stringify(careerPool[b.n].from));ki.klub0=klub0;
    /* 6. a szöveg */
    ki.txtA=erkUtTxt(a,careerPool[a.n]);ki.txtC=erkUtTxt(c,careerPool[c.n]);ki.txtD=erkUtTxt(d,careerPool[d.n]);
    /* 7. régi mentés: út nélkül */
    const g=szabad[5];careerPool[g].from={club:sq.club,season:sq.season,sz:1};S.foundingSquad=[g];
    ki.txtG=erkUtTxt({n:g},careerPool[g]);
    const h=szabad[6];careerPool[h].from={club:sq.club,season:sq.season,sz:2};careerPool[h].boughtFor=1234;
    ki.txtH=erkUtTxt({n:h},careerPool[h]);
    /* 8. a fejléc */
    const q=P(szabad[7]);extraRoster.push(q);erkUtJegyez(q.n,"draft",{club:sq.club,season:sq.season});
    try{ki.head=plSheetHeadHtml({type:"extra",idx:extraRoster.length-1,p:q});}catch(e){ki.head="HIBA "+e;}
    return ki;});
  console.log("\n— 1–5. a feljegyzés —");
  ok(r.a.via==="scout"&&r.a.viaSz===3&&!!r.a.club,"a hívó útja (scout) + a klub és az idény",r.a);
  ok(r.b==="piac","vételárral, út nélkül → vásárlás",r.b);
  ok(r.c.via==="ifi"&&r.c.akad===1,"akadémiáról → ifiakadémia, saját akadémia",r.c);
  ok(r.d.via==="esemeny"&&r.d.det==="egy távozó helyére","a közvetlen feljegyzést (átigazolási esemény) a markArrived nem írja felül",r.d);
  ok(r.f.via==="szemle"&&r.f.club===r.sqClub,"klub-szemle: a szemlézett klub",r.f);
  ok(r.b2.via==="vissza"&&r.b2.viaSz===5&&r.b2.club===r.klub0,"visszavásárlás: az út és az idény frissül, a klub marad",r.b2);
  console.log("\n— 6–7. a szöveg —");
  ok(/🛫 /.test(r.txtA)&&/🔭 scout/.test(r.txtA)&&/3\. idény/.test(r.txtA),"„🛫 klub · 🔭 scout · 3. idény”",r.txtA);
  ok(/saját akadémia/.test(r.txtC)&&/🌱 ifiakadémia/.test(r.txtC),"akadémista",r.txtC);
  ok(/átigazolási esemény — egy távozó helyére/.test(r.txtD),"esemény a részlettel",r.txtD);
  ok(/📝 draft/.test(r.txtG)&&/💰 vásárlás/.test(r.txtH),"régi mentés: kezdő keret → draft, vételár → vásárlás",[r.txtG,r.txtH]);
  console.log("\n— 8. a fejléc —");
  ok(/class="plSub plErk"/.test(r.head||"")&&/📝 draft/.test(r.head||""),"a fejlécben a helyén (a kártyaszint fölött)",(r.head||"").slice(0,200));
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
