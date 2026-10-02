/* 🌱 3.9.177 — AZ IFIAKADÉMIA MENÜPONT.

   Amit mér (valódi karrier):
     1. a Csapatépítés alatt ott a „🌱 Ifiakadémia" kártya; üres akadémiánál
        a panel elmagyarázza, mi kerül ide;
     2. a visszaküldött tehetség (a valódi academyKeep-pel) megjelenik:
        név, poszt, kor, Rating és a visszaküldés óta vett fejlődés, POT;
     3. FOKOZATOSAN DERÜL KI: 0 meccsnél minden jellem-sor zárt és a POT
        becslés (~); 8 / 16 / 24 akadémiai meccsnél a vérmérséklet, a
        kapcsolódás, a karizma nyílik (a valódi processAcademyDevelopment
        lépteti), 45-nél a pontos POT; a napló szól, amikor valami kiderül;
     4. a várható visszatérés: 21 évesen „garantáltan" (ballagás); ha idén
        már jelentkezett, „a következő idényben"; egyébként idei esély %;
     5. a „ha most jelentkezne" Rating a visszatérés szabályából jön, de a
        panel SEMMIT nem módosít (a Rating, a csúcs és a POT változatlan);
     6. a lista sorrendje: a ballagó elöl;
     7. a régi mentés (figyelt mező nélkül) az eltöltött idényekből indul;
     8. a mentés viszi a számlálót; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9219;
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
    S.auto=false;S.academy=[];S.frozenAcademySeasons=0;});
  await p.waitForTimeout(400);

  const r=await p.evaluate(()=>{
    const out={};
    renderHub();
    const kartya=document.getElementById("hubAcademyBtn");
    out.kartya=!!kartya&&!kartya.classList.contains("hide")&&/Ifiakadémia/.test(kartya.textContent)
      &&!!kartya.closest('[data-acc="build"]');
    openAcademyPanel();
    out.ures=/Még senkit nem küldtél vissza/.test(document.getElementById("acadBody").textContent);
    out.nyitva=!document.getElementById("acadModal").classList.contains("hide");
    closeAcademyPanel();
    /* két valódi akadémiai tehetség: az egyik 17, a másik 21 éves (ballag) */
    const a=generateAcademyPlayer(),c=generateAcademyPlayer();
    const ea=careerPool[a.n],ec=careerPool[c.n];
    ea.age=17;ec.age=20;
    S.seasonNumber=S.seasonNumber||1;
    academyKeep(a,null);academyKeep(c,null);
    ec.age=21;   /* azóta betöltötte a 21-et */
    const recA=S.academy.find(x=>x.n===a.n);
    out.recUj=recA.figyelt;
    /* a bemutatkozás is idei ajánlat — az esély-ágat egy korábbi idényben
       visszaküldött tehetségen nézzük */
    out.bemutatkozasIden=recA.offerSeason===(S.seasonNumber||1);
    recA.offerSeason=0;
    /* 0 meccs: minden zárt, POT becslés */
    openAcademyPanel();
    let t=document.getElementById("acadBody").textContent;
    const kartyaA=[...document.querySelectorAll("#acadBody .acadCard")].find(x=>x.dataset.acad===a.n);
    const tA=kartyaA?kartyaA.textContent:"";
    out.alap={nev:tA.indexOf(fullName(a.n))>=0,pos:tA.indexOf((ea.pos||[]).join("/"))>=0,kor:/17 év/.test(tA),
      rating:tA.indexOf("Rating "+Math.round(ea.startRating))>=0,potBecs:/POT ~/.test(tA),
      zart:(tA.match(/🔒/g)||[]).length};
    out.sorrend=[...document.querySelectorAll("#acadBody .acadCard")].map(x=>x.dataset.acad===c.n?"ballag":"fiatal");
    out.ballagSz=/garantáltan jelentkezik/.test(document.querySelector(`#acadBody .acadCard[data-acad="${CSS.escape(c.n)}"]`).textContent);
    out.idenEsely=/idén még ~\d+% eséllyel/.test(tA);
    out.haMost=/Ha most jelentkezne: ~\d+/.test(tA);
    /* a panel nem módosít semmit */
    const pill=x=>JSON.stringify({r:x.startRating,p:x.peak,pot:x.pot,yb:x.youthBonus||0});
    const elotte=pill(ea)+pill(ec);
    renderAcademyPanel();renderAcademyPanel();
    out.nemModosit=(pill(ea)+pill(ec))===elotte;
    closeAcademyPanel();
    /* FOKOZATOS KIDERÜLÉS a valódi meccs-lépéssel */
    const sorok=[];const _a=addLine;addLine=function(h){sorok.push(String(h).replace(/<[^>]+>/g,""));};
    const lep=n=>{for(let i=0;i<n;i++)processAcademyDevelopment();};
    const nyitott=()=>{renderAcademyPanel();
      const k=[...document.querySelectorAll("#acadBody .acadCard")].find(x=>x.dataset.acad===a.n);
      const s=k?k.textContent:"";
      return {ver:/Vérmérséklet:\s*(?!még)/.test(s)&&!/🔒 Vérmérséklet/.test(s),
              kap:!/🔒 Kapcsolódás/.test(s),kar:!/🔒 Karizma/.test(s),pot:!/POT ~/.test(s)};};
    lep(7);out.m7=nyitott();
    lep(1);out.m8=nyitott();out.verSzint=VER_LEVELS[verI(ea)];
    out.m8txt=(([...document.querySelectorAll("#acadBody .acadCard")].find(x=>x.dataset.acad===a.n)||{}).textContent||"").indexOf(VER_LEVELS[verI(ea)])>=0;
    lep(8);out.m16=nyitott();
    lep(8);out.m24=nyitott();
    lep(21);out.m45=nyitott();
    addLine=_a;
    out.naploA=sorok.filter(x=>x.indexOf(fullName(a.n))>=0&&/kiderült/.test(x));
    /* idén már jelentkezett */
    recA.offerSeason=S.seasonNumber||1;
    renderAcademyPanel();
    out.idenMar=/idén már jelentkezett .*— leghamarabb a következő idényben/.test(
      ([...document.querySelectorAll("#acadBody .acadCard")].find(x=>x.dataset.acad===a.n)||{}).textContent||"");
    /* régi mentés: figyelt nélkül, két idénnyel korábban visszaküldve */
    const regi={n:a.n,leftAge:15,leftRating:60,leftSeason:(S.seasonNumber||1)-2,offerSeason:0,times:1};
    out.regiFigy=acadFigyeltDb(regi);
    /* a mentés viszi */
    saveGame();
    let d=null;try{d=JSON.parse(localStorage.getItem(saveKey()));}catch(e){}
    const mr=d&&d.S&&(d.S.academy||[]).find(x=>x.n===a.n);
    out.mentve=mr&&mr.figyelt;
    out.felirat=document.getElementById("hubAcademyDs").textContent;
    renderAcademyBtn();out.felirat=document.getElementById("hubAcademyDs").textContent;
    out.glossz=/🌱 Ifiakadémia/.test(GLOSSARY&&GLOSSARY.akademia?GLOSSARY.akademia.text:"");
    return out;});

  console.log("\n— 1. a menüpont —");
  ok(r.kartya,"a Csapatépítés alatt ott a „🌱 Ifiakadémia” kártya");
  ok(r.nyitva&&r.ures,"üres akadémiánál a panel elmagyarázza, mi kerül ide");
  console.log("\n— 2. a visszaküldött tehetség —");
  ok(r.recUj===0,"a frissen visszaküldött 0 akadémiai meccsel indul",r.recUj);
  ok(r.bemutatkozasIden,"a bemutatkozás idei jelentkezésnek számít (a játék szabálya)");
  ok(r.alap.nev&&r.alap.pos&&r.alap.kor&&r.alap.rating,"név, poszt, kor, Rating",r.alap);
  console.log("\n— 3. fokozatosan derül ki —");
  ok(r.alap.potBecs&&r.alap.zart===3,"0 meccsnél a POT becslés (~), és mind a három jellem-sor zárt",r.alap);
  ok(!r.m7.ver&&r.m8.ver&&!r.m8.kap&&r.m8txt,"8 meccsnél a vérmérséklet nyílik (a valódi szint felirattal), a többi még zárt",{m7:r.m7,m8:r.m8,szint:r.verSzint});
  ok(r.m16.kap&&!r.m16.kar,"16 meccsnél a kapcsolódás",r.m16);
  ok(r.m24.kar&&!r.m24.pot,"24 meccsnél a karizma, a POT még becslés",r.m24);
  ok(r.m45.pot,"45 meccsnél a pontos POT",r.m45);
  ok(r.naploA.length===4,"a napló négyszer szól (vérmérséklet, kapcsolódás, karizma, POT)",r.naploA);
  console.log("\n— 4. várható visszatérés —");
  ok(r.ballagSz,"21 évesen: garantáltan jelentkezik (ballagás)");
  ok(r.idenEsely,"egyébként: idei esély százalékban");
  ok(r.idenMar,"ha idén már jelentkezett: leghamarabb a következő idényben");
  console.log("\n— 5–8. —");
  ok(r.haMost&&r.nemModosit,"a „ha most jelentkezne” Rating kiíródik, és a panel semmit nem módosít");
  ok(r.sorrend[0]==="ballag","a ballagó van elöl",r.sorrend);
  ok(r.regiFigy===60,"régi mentés: két eltöltött idény = 60 akadémiai meccs",r.regiFigy);
  ok(r.mentve===45,"a mentés viszi a számlálót",r.mentve);
  ok(/2 tehetség bent/.test(r.felirat)&&/1 ballag/.test(r.felirat),"a HUB-kártya felirata a mai állapotot mondja",r.felirat);
  ok(r.glossz,"a szótár Akadémia-szócikke elmondja, hol követhető");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
