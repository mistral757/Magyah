/* 🎯 3.9.328 — AZ INFÓPULT „SKILLEK" FÜLE + AZ EGYENLÍTŐ-KERET FELIRATA.

   KÉRÉS: „Az info pultba be lehetne tenni a szerzett skilleket, hogy egyben
   lehessen látni és előre gondolkodni, hogy legközelebb melyiket válasszam
   fejlődni."

   Amit mér:
     1. skill nélkül a fül letiltott; skillel elérhető;
     2. a fül: összesítés, a félkészek elöl (fázis-állással, mennyi hiányzik),
        az épülő csillagok, játékosonként a teljes kép (kezdők elöl);
     3. koppintásra a skill leírása megjelenik;
     4. a páros-tipp (Csukafejes tökéletes beadás nélkül);
     5. az egyenlítő: a keret töltésekor a napló kimondja, hogy a nyári
        egyenlítők már a következő idény keretéből mennek;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9328;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
  await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a meccsmotor helyett egy számláló — a kapu a kezdőrúgás ELŐTT dönt */
    window._motor=0;playMatchMotor=function(){window._motor++;};
    window._toast=[];backToast=function(m){window._toast.push(String(m));};});
  await p.waitForTimeout(800);

  await p.waitForTimeout(800);
  const r=await p.evaluate(()=>{
    const o={};
    Object.keys(S.skills||{}).forEach(k=>{S.skills[k]=[];});
    o.nincs=hubInfoParts().sk;
    const sl=slots.filter(s=>s.player);
    const A=sl[sl.length-1].player.n,B=sl[2].player.n,C=sl[3].player.n;
    const sk=id=>SKILLS.find(s=>s.id===id);
    S.skills[A]=[{skill:sk("fw_header"),stagesNeeded:3,stagesCompleted:1}];
    S.skills[B]=[{skill:sk("mf_surgeon"),stagesNeeded:2,stagesCompleted:2,stars:1,starNeed:3,starDone:1}];
    S.skills[C]=[{skill:sk("df_clean"),stagesNeeded:2,stagesCompleted:2}];
    o.van=hubInfoParts().sk;
    hubInfoShow("sk");
    const t=document.getElementById("hubInfoTabSk");
    o.lathato=t&&!t.classList.contains("hide");
    const tx=t?t.textContent:"";
    o.osszeg=/2 kész · 1 félkész · 1 ★ · 1 csillag épül/.test(tx);
    o.felkesz=/Félkész/.test(tx)&&/Csukafejes · 1\/3 fázis — még 2/.test(tx);
    o.csillag=/Épülő csillagok/.test(tx)&&/★★ épül · 1\/3 fázis/.test(tx);
    o.jatekos=/Játékosonként/.test(tx)&&t.querySelectorAll("[data-hskid]").length===3;
    o.tipp=/Csukafejes.*van a keretben, de/.test(tx);
    const chip=t.querySelector('[data-hskid="mf_surgeon"]');chip.click();
    o.leiras=/Sebészi passz — /.test(document.getElementById("hubSkillDesc").textContent);
    o.gomb=!document.querySelector('#hubInfoTabs [data-itab="sk"]').disabled;
    hubInfoHide();
    /* az egyenlítő-keret napló-sora */
    const _on=window.eqOn;window.eqOn=()=>true;const _l=window.eqLevel;window.eqLevel=()=>2;
    S.eqBoostsUsed=2;twRefillSummerQuotas();
    window.eqOn=_on;window.eqLevel=_l;
    o.eqNull=S.eqBoostsUsed===0;
    o.eqSor=[...document.querySelectorAll("#ttLines div")].map(d=>d.textContent).some(x=>/egyenlítő alapáras keretje újratöltődött: 4 db.*következő idény keretéből/.test(x));
    return o;});
  ok(r.nincs===false&&r.van===true,"skill nélkül a fül nem elérhető, skillel igen",r);
  ok(r.lathato&&r.gomb,"a fül megnyílik, a gombja aktív",r);
  ok(r.osszeg,"összesítés: kész, félkész, csillag, épülő csillag",r);
  ok(r.felkesz,"a félkészek elöl, fázis-állással és a hiánnyal",r);
  ok(r.csillag,"az épülő csillagok",r);
  ok(r.jatekos,"játékosonként minden skill",r);
  ok(r.leiras,"koppintásra megjelenik a leírás",r);
  ok(r.tipp,"páros-tipp: Csukafejes tökéletes beadás nélkül",r);
  ok(r.eqNull&&r.eqSor,"az egyenlítő: a keret töltésekor a napló kimondja, hogy a nyár már a következő idény keretéből megy",r);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
