/* 👔 3.9.300 — AZ EDZŐ: ARCKÉP, SZINT, ELEMZŐ IRÁNYOK, MECCS ELŐTTI ELEMZÉS.

   KÉRÉS: „A csapatépítésen belül ezentúl legyen egy edző menü […] statok […]
   profilkép […] xp gyűjtős, de akár pénzen is fejleszthetős levelling […]
   Meccs előtt tud adni egy elemzést […] Ennek az elemzésnek a részletességét
   lehet az edző fejlődésével tolni bizonyos irányokba […] meccsenként 1==>4
   elemzésig."

   Amit mér:
     1. minden edzőnek saját arcképe van (SVG, a jellegzetes vonásokkal);
     2. a menü: adatlap, szint, XP-sáv, „amit hoz", az irányok;
     3. a szint: meccsenként XP (győzelem több), a küszöbök, a hír; pénzen a
        következő szintig (a büdzséből, a stáb-kiadások közé);
     4. az irányok: 2. szinttől szintenként 1 pont, irányonként legfeljebb 3,
        szabad pont nélkül nem tehető;
     5. az elemzés: megerősítés → elemzés; esélyek (összegük 1), gólvárhatóság,
        rejtett tényezők, kulcsemberek; a meccs NEM indul; a kvóta meccsenként
        1 → 4 (1., 4., 7., 10. szint); az irányok új szekciókat nyitnak;
        mellékhatás nélkül (a stáb munkanaplója nem nő);
     6. a mentés viszi; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9300;
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
  await p.evaluate(()=>{const x=document.getElementById("mpSoloBtn");if(x)x.click();});await p.waitForTimeout(700);
  await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(500);
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
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:22};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:22,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    try{hubMidSeasonReturn();}catch(e){}
    /* a cserepad és a tartalék feltöltése a pool-ból */
    const kezdo=new Set(slots.filter(s=>s.player).map(s=>s.player.n));
    const tobbi=Object.values(careerPool).filter(e=>e&&!kezdo.has(e.n)&&e.pos&&e.pos.length).slice(0,9);
    BENCH_KEYS.forEach((k,i)=>{const e=tobbi[i];if(!e)return;if(!e.attrs)initPlayerAttrs(e);e.age=21;
      BENCH[k]={n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:21};});
    tobbi.slice(BENCH_KEYS.length).forEach(e=>{if(!e.attrs)initPlayerAttrs(e);extraRoster.push({n:e.n,ovr:e.startRating,pos:e.pos.slice(),age:e.age||24});});});
  await p.waitForTimeout(800);


  const kep=process.argv[2];
  console.log("— 1. az arcképek —");
  const a=await p.evaluate(()=>{const o=COACHES.map(c=>{const s=edzoArcSVG(c,80);return {n:c.n,svg:/^<svg/.test(s),len:s.length};});
    const kul=new Set(COACHES.map(c=>edzoArcSVG(c,80))).size;
    return {o,kul,klopp:/<rect[^>]*rx="1.8"/.test(edzoArcSVG(COACHES.find(c=>c.n==="Jürgen Klopp"),80)),
      pep:!/<rect[^>]*rx="1.8"/.test(edzoArcSVG(COACHES.find(c=>c.n==="Pep Guardiola"),80))};});
  ok(a.o.every(x=>x.svg)&&a.kul===a.o.length,"mind a "+a.o.length+" edzőnek saját, különböző arcképe van",a.kul);
  ok(a.klopp&&a.pep,"a jellegzetes jegyek: Klopp szemüveges, Guardiola nem");

  console.log("\n— 2–4. a menü, a szint, az irányok —");
  const m=await p.evaluate(()=>{const o={};
    coach=COACHES.find(c=>c.n==="Sir Alex Ferguson");S.edzo=null;
    $("hubCoachBtn").click();
    o.nyitva=!$("hubCoachPicker").classList.contains("hide");
    const tx=()=>$("hubCoachBody").textContent;
    o.alap=/1\. szint/.test(tx())&&/Játékerő/.test(tx())&&/Kedvelt taktikák/.test(tx())&&/Elemző irányok/.test(tx());
    o.pontNincs=!edzoPontTesz("ero");
    edzoXpMeccs(2,1);o.xp1=edzoAll().xp;
    edzoXpMeccs(1,1);o.xp2=edzoAll().xp;
    edzoXpMeccs(0,2);o.xp3=edzoAll().xp;
    const sorok=[];const _al=window.addLine;window.addLine=function(t){sorok.push(String(t));return _al.apply(this,arguments);};
    edzoXp(120-o.xp3,"proba");o.lvl2=edzoLvl();o.hir=sorok.some(t=>/szintet lépett: 2\. szint/.test(t));
    window.addLine=_al;
    o.pont=edzoPontTesz("kulcs");o.szabad=edzoPontSzabad();o.pont2=edzoPontTesz("kulcs");
    /* pénzen */
    S.transferBudget=1e12;const b0=S.transferBudget;const ar=edzoVetelAr();const r=edzoVesz();
    o.vett={ok:r.ok,lvl:edzoLvl(),fizetett:b0-S.transferBudget,ar};
    /* a 10. szint, a 3-as plafon */
    edzoXp(99999);o.max=edzoLvl();o.elemzes=[1,3,4,6,7,9,10].map(l=>edzoElemzesMax(l));
    edzoPontTesz("kulcs");edzoPontTesz("kulcs");o.kulcs3=edzoIrany("kulcs");o.negyedik=edzoPontTesz("kulcs");
    renderHubCoachPanel();o.gombok=$("hubCoachBody").querySelectorAll("[data-edzo-pont]").length;
    return o;});
  ok(m.nyitva&&m.alap,"a menü: adatlap, szint, „amit hoz”, kedvelt taktikák, elemző irányok",m);
  ok(m.xp1===15&&m.xp2===27&&m.xp3===37,"XP: győzelem 15, döntetlen 12, vereség 10",[m.xp1,m.xp2,m.xp3]);
  ok(m.pontNincs&&m.lvl2===2&&m.hir&&m.pont&&m.szabad===0&&!m.pont2,"2. szint 120 XP-nél, hír; 1 pont; szabad pont nélkül nem tehető",m);
  ok(m.vett.ok&&m.vett.lvl===3&&m.vett.fizetett===m.vett.ar&&m.vett.ar>0,"pénzen: a következő szint a büdzséből",m.vett);
  ok(m.max===10&&m.elemzes.join()==="1,1,2,2,3,3,4","10. szint a plafon; elemzés meccsenként 1/2/3/4 (1., 4., 7., 10. szint)",m.elemzes);
  ok(m.kulcs3===3&&!m.negyedik,"egy irányba legfeljebb 3 pont",m);
  if(kep){fs.mkdirSync(kep,{recursive:true});
    await p.evaluate(()=>{coach=COACHES.find(c=>c.n==="Jürgen Klopp");S.edzo=null;edzoXp(800);edzoPontTesz("rejtett");edzoPontTesz("kulcs");edzoPontTesz("kulcs");edzoPontTesz("ero");renderHubCoachPanel();
      const w=document.createElement("div");w.id="kepMenu";w.className="card";w.style.cssText="position:fixed;left:0;top:0;width:430px;z-index:99999;max-height:none";
      w.innerHTML=`<div class="steplbl">👔 Edző</div>`+$("hubCoachBody").innerHTML;document.body.appendChild(w);});
    await p.locator("#kepMenu").screenshot({path:path.join(kep,"edzo-menu.png")});
    await p.evaluate(()=>{$("kepMenu").remove();});}

  console.log("\n— 5. az elemzés —");
  const e=await p.evaluate(async()=>{const varj=ms=>new Promise(r=>setTimeout(r,ms));const o={};
    coach=COACHES.find(c=>c.n==="Pep Guardiola");S.edzo=null;
    S.playing=false;
    const idx0=S.idx,mukod=JSON.stringify((staff()||[]).map(c=>c&&c.work));
    o.marad0=edzoElemzesMarad();
    edzoElemzesKer();await varj(150);
    o.kerdes=!$("hubTacticConfirmModal").classList.contains("hide")&&/Elemzést kérsz/.test($("hubTacticConfirmTitle").textContent);
    $("hubTacticConfirmYes").click();await varj(300);
    o.nyitva=!$("edzoElemModal").classList.contains("hide");
    const tx=$("edzoElemBody").textContent;
    o.esely=/Győzelem/.test(tx)&&/Döntetlen/.test(tx)&&/Vereség/.test(tx)&&/Gólvárhatóság/.test(tx);
    o.resz=/A meccserőn kívül/.test(tx)&&/Kulcsemberek/.test(tx);
    o.nincsIrany=!/A meccserő összetétele/.test(tx)&&!/Lapveszély/.test(tx)&&!/legvalószínűbb/.test(tx);
    const sz=edzoElemzesSzamol(edzoKovetkezoMeccs().fx);
    o.osszeg=Math.round((sz.gy+sz.d+sz.v)*1000)/1000;o.lf=sz.lf;o.la=sz.la;o.diff=sz.diff;
    o.idx=S.idx===idx0&&!S.playing;
    o.mukod=JSON.stringify((staff()||[]).map(c=>c&&c.work))===mukod;
    o.marad1=edzoElemzesMarad();o.ujraRejtve=$("edzoElemUjra").classList.contains("hide");
    $("edzoElemOk").click();
    edzoElemzesKer();await varj(150);o.nincsTobb=/már leadta/.test($("hubTacticConfirmBody").textContent);$("hubTacticConfirmNo").click();
    /* fejlett edző: több elemzés, több szekció */
    edzoXp(99999);["ero","ero","ero","ellen","ellen","forgat","forgat","rejtett","rejtett"].forEach(k=>edzoPontTesz(k));
    o.marad10=edzoElemzesMarad();
    edzoElemzesKer();await varj(150);$("hubTacticConfirmYes").click();await varj(300);
    const t2=$("edzoElemBody").textContent;
    o.uj=/A meccserő összetétele/.test(t2)&&/legvalószínűbb végeredmények/.test(t2)&&/Félidőnként/.test(t2)&&/Az ellenfél/.test(t2)&&/Forgatókönyv/.test(t2)&&/Időablakok/.test(t2);
    o.ujraLatszik=!$("edzoElemUjra").classList.contains("hide");
    return o;});
  ok(e.marad0===1&&e.kerdes&&e.nyitva,"megerősítés → elemzés (1. szinten 1 elemzés)",e);
  ok(e.esely&&e.resz&&e.nincsIrany,"az alapelemzés: esélyek, gólvárhatóság, a meccserőn kívüli tényezők, kulcsemberek — irány-szekciók nélkül",e);
  ok(e.osszeg===1&&e.lf>0&&e.la>0,"az esélyek összege 100%, a gólvárhatóság a motor képlete",{osszeg:e.osszeg,lf:e.lf,la:e.la,diff:e.diff});
  ok(e.idx&&e.mukod,"a meccs nem indul el, és nincs mellékhatás (a stáb munkanaplója változatlan)",e);
  ok(e.marad1===0&&e.ujraRejtve&&e.nincsTobb,"a kvóta fogy: 1. szinten nincs újabb elemzés",e);
  ok(e.marad10>=3&&e.uj&&e.ujraLatszik,"10. szinten több elemzés, és az irányok szekciói megjelennek",e);
  if(kep){await p.evaluate(()=>{document.querySelectorAll("body *").forEach(el=>{const m=document.getElementById("edzoElemModal");if(getComputedStyle(el).position==="fixed"&&el!==m&&!m.contains(el)&&!el.contains(m))el.style.display="none";});});
    await p.locator("#edzoElemModal .card").screenshot({path:path.join(kep,"edzo-elemzes.png")});}

  console.log("\n— 6. mentés, hibák —");
  const s=await p.evaluate(()=>{let d=null;const _s=window.localStorage.setItem.bind(localStorage);
    const o={};try{o.van=!!(S.edzo&&S.edzo.v===1&&S.edzo.by["Pep Guardiola"].xp>0);}catch(e){o.van=false;}
    return o;});
  ok(s.van,"az állapot az S.edzo-ban (a mentés viszi)");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
