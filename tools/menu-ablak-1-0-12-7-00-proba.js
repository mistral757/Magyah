/* 🐞 1.0.12.7.00 — A FEJLESZTŐ TELEFONOS JEGYZETEI (u_fd5811b0d243)
   Amit mér:
     1. kihívás-lecke (jmwvupnn3jf9e): 3 lépés, a „Kész — tovább"-ra nem visz; a lecke után ~3 mp-cel
        fókusz nélküli tipp-sáv, és villan a „Megnézem a keretet a HUB-ban" gomb;
     2. párkémia (jmwvuij112r68): a „3/5" jelvény a reflektor témában is látszik (saját háttér);
     3. csapategyensúly (jmwvuerlk3at9): feladat „A csapat lelke" szakaszban, a „Hol?" vezetett leckét
        indít (a ⚖️ mérőn), a végén kipipálva; a Leckék listában is;
     4. menü-ablakok (jmwvspztm1im2, jmwvsmwnf9q2h): menüből nyitva a kapitányváltó (HUB-kártya) és az
        edzésterv (HUB-on kívüli aloldal) rögzített ablak a menü fölött; bezárás után a menü nyitva, a
        csoport nyitva, a lap görgetése változatlan;
     + nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9481;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
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
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  const w=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>{const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();try{kutLeckeZar();}catch(e){}});
  /* 1 */
  const k=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    if(S.kut.lecke)delete S.kut.lecke.kihivas;S.kut.nyit.menedzsment=1;
    S.seasonNumber=1;S.idx=10;   /* évszak-ajánlat: van HUB-kitérő gomb */
    showChallengeOffers("short",3,()=>{},false,{});await w(1200);
    const o={id:_kutL&&_kutL.id,lep:KUT_LECKE.kihivas.l.length,utolso:KUT_LECKE.kihivas.l[2].t};
    while(_kutL&&_kutL.id==="kihivas"){try{kutLeckeZar();}catch(e){break;}}
    await w(4200);
    const t=$("kihDontesTipp");o.tipp=!!t;o.szoveg=t?t.textContent:"";o.hubGomb=!!document.querySelector("#twActions .chHubBack");
    const done=[...document.querySelectorAll("#twActions .stepbtn")].pop();if(done)done.click();await w(300);
    o.tippTorolve=!$("kihDontesTipp");return o;});
  ok(k.id==="kihivas"&&k.lep===3&&k.utolso==="osszeg","1. kihívás-lecke: 3 lépés, összegzéssel zárul (nem a Kész gombbal)",k);
  ok(k.tipp&&/Nem tudod eldönteni/.test(k.szoveg)&&(k.hubGomb?/HUB-ba/.test(k.szoveg):true),"1. a lecke után ~3 mp-cel tipp-sáv a HUB-kitérőről",k);
  ok(k.tippTorolve,"1. a „Kész — tovább” eltünteti a tipp-sávot");
  /* 2 */
  const c=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    applyTheme("reflektor");const xi=slots.filter(s=>s.player).map(s=>s.player.n);
    addChemPair(xi[2],xi[3],3);S.chemInProgress=chemKey(xi[2],xi[3]);
    showChemBuild(()=>{});await w(400);
    const pos=document.querySelector("#chemGoOn .pos"),cs=getComputedStyle(pos);
    const o={txt:pos.textContent,bg:cs.backgroundColor,color:cs.color};$("scSkill").classList.add("hide");applyTheme("dark");return o;});
  ok(c.txt==="3/5"&&c.bg!=="rgba(0, 0, 0, 0)"&&c.bg!==c.color,"2. a párkémia „3/5” jelvénye a reflektor témában saját háttéren",c);
  /* 3 */
  const e=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    const i=KUT_SZAKASZ.findIndex(x=>x.id==="lelek");S.kut.sz=i;delete S.kut.kesz["lelek:egyensuly"];
    openHubMidSeason();await w(300);
    const o={feladat:KUT_SZAKASZ[i].fel.some(f=>f.id==="egyensuly"&&f.jel==="view:balance"),blokk:!!$("specBalanceBlock")};
    kutHolIndit("lelek","egyensuly");await w(500);o.id=_kutL&&_kutL.id;o.l=_kutL&&KUT_LECKE[_kutL.id].l.length;
    o.x1=(document.body.textContent.match(/csapategyensúly/gi)||[]).length;
    for(let n=0;n<5&&_kutL;n++){const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^(Tovább|Kész|Értem)/.test(x.textContent.trim())&&x.closest("[class*=kut]"));if(!b)break;b.click();await w(400);}
    o.pipa=!!S.kut.kesz["lelek:egyensuly"];o.lista=kutLeckeElerheto("egyensuly");return o;});
  ok(e.feladat&&e.blokk,"3. „A csapat lelke” szakaszban ott a csapategyensúly-feladat, a HUB-on a ⚖️ mérő",e);
  ok(e.id==="hol_egyensuly"&&e.l===3,"3. a „Hol?” a 3 lépéses csapategyensúly-leckét indítja",e);
  ok(e.pipa&&e.lista,"3. a lecke végén a feladat kipipálva; a Leckék listában is elérhető",e);
  /* 4 */
  const m=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    try{kutLeckeZar();}catch(e){}if(S.kut)S.kut.mind=1;
    openHubMidSeason();await w(200);hubMenuToggle(true,true);await w(100);
    const grp=document.querySelector('#hubActions .hubGroup[data-acc="build"]');if(!grp.classList.contains("open"))hubAccToggle(grp);await w(100);
    const o={};
    const egy=async(id)=>{const b=$(id);b.scrollIntoView({block:"center"});await w(80);const y0=window.scrollY;b.click();await w(600);
      const ab=hubMenuAblakEl();const r={ablak:ab&&ab.id,pos:ab&&getComputedStyle(ab).position,
        menuLatszik:getComputedStyle($("scHub")).display!=="none"&&getComputedStyle(document.querySelector("#scHub>.hubMainCard")).display!=="none"};
      ab.querySelector(".hubSubBack").click();await w(600);
      r.inMenu=_inHubMenu;r.lista=!$("hubActions").classList.contains("hide");r.csoport=grp.classList.contains("open");r.dy=Math.round(window.scrollY-y0);return r;};
    o.kapitany=await egy("hubCaptainBtn");o.edzes=await egy("hubTrainingBtn");return o;});
  for(const [n,r] of Object.entries(m)){
    ok(r.pos==="fixed"&&r.menuLatszik,`4. ${n}: ablakként nyílik, a menü alatta marad`,r);
    ok(r.inMenu&&r.lista&&r.csoport&&Math.abs(r.dy)<=2,`4. ${n}: bezárás után vissza a menübe, ugyanoda (dy ${r.dy})`,r);}
  ok(errs.length===0,"nincs oldalhiba",errs);
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
