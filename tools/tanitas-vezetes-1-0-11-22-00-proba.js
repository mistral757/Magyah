/* 🧭 1.0.11.22.00 — A MENÜ SAJÁT FELÜLETEN, TANÍTÓ CÉLOK, ÚJ ANIMÁCIÓ-ALAP, VEZETETT LECKÉK
   KÉRÉS: „Nem jó az, amikor a Menü megnyílik a HUB-on belül úgy, hogy nem külön felületen […]
   Nem jó a tanuló fázis második céljának, hogy nyerj egy meccset kapott gól nélkül. Legyen ez:
   rúgj egy gólt, játssz le 3 meccset. Változtasd meg a meccs tempóját. […] Tanító célok legyenek
   mindig. Az animációk alapbeállítása az legyen, hogy csak az új verzió szerinti animációk
   fussanak le, és legyenek kicsit lassabbak […] ne legyenek úgy lecsapva a jelenetek végei. […]
   azt az elvet […] végig vezessük át a teljes tanításra."
   Amit mér:
     1. a menü minden úton (a játékos koppintása, a tanító réteg „Mutasd meg”-je, a guide-túra)
        a SAJÁT felületén nyílik (menü-mód: a keretlista nem látszik mellette); ragadó gombnál
        is az első koppintásra;
     2. a Kezdő út céljai: nincs eredményhez kötött cél (győzelem, kapott gól nélkül, zsinór,
        veretlenség, tabella), a 2. szakasz: gól + 3 meccs + tempó; minden cél funkciója a
        szakasz kezdetén már nyitva; a 2. szakasz VERESÉGEKKEL is teljesíthető;
     3. az animáció alapja az Új (csak 3D); a 3D jelenet 25%-kal lassabb; a végén a kép kitart,
        majd elhalványul (nem vágódik le);
     4. minden nyitás-lecke vezetett (villogó menü → villogó gomb → a panelen), és
        végigjárható a valódi, villogó elemekre koppintva;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9399;
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
  /* 1. a menü saját felületen */
  const r1=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    kutLeckeZar();try{hubMenuExit();}catch(e){}await w(300);const o={};
    const allapot=()=>({menu:!$("hubActions").classList.contains("hide"),mod:$("scHub").classList.contains("menuMode"),
      keret:(()=>{const r=$("hubRoster").getBoundingClientRect();return r.height>0&&getComputedStyle($("hubRoster")).display!=="none";})()});
    /* a) a játékos koppintása, görgetés után (ragadó gomb) */
    window.scrollTo(0,document.body.scrollHeight);await w(400);
    o.ragad=hubMenuStuck();$("hubMenuBtn").click();await w(500);o.koppintas=allapot();
    hubMenuExit();await w(300);
    /* b) a tanító réteg „Mutasd meg"-je */
    teachRevealInMenu();await w(300);o.mutasd=allapot();hubMenuExit();await w(300);
    /* c) a guide-túra */
    guideOpenHubMenu();await w(300);o.guide=allapot();hubMenuExit();await w(300);
    return o;});
  const sajat=x=>x.menu&&x.mod&&!x.keret;
  ok(sajat(r1.koppintas)&&sajat(r1.mutasd)&&sajat(r1.guide),"1. a menü minden úton a saját felületén nyílik (a keretlista nem látszik mellette), ragadó gombnál is az első koppintásra",r1);
  /* 2. a Kezdő út céljai */
  const r2=await p.evaluate(()=>{
    const TILT=["gyoz","nulla","zsinor2","veretlen3","ketgol"],TILTA=["felsofel","felsofel25"];
    const eredmeny=[];const zart=[];
    const nyitva=new Set(Object.keys(KUT_FUNKCIO).filter(f=>!KUT_FUNKCIO[f].el||false));
    const elotte=new Set(Object.keys((kutUj()||{nyit:{}}).nyit));   /* a szakasz kezdetén már nyitott funkciók (1.0.12.5.00: a Menedzsment az elejétől) */
    const funkcioElem={};Object.keys(KUT_FUNKCIO).forEach(f=>KUT_FUNKCIO[f].el.forEach(id=>funkcioElem[id]=f));
    KUT_SZAKASZ.forEach(sz=>{
      sz.fel.forEach(f=>{
        if(TILT.includes(f.m)||TILTA.includes(f.all))eredmeny.push(sz.id+":"+f.id);
        const fn=f.a&&funkcioElem[f.a];
        if(fn&&!elotte.has(fn)&&!(KUT_FUNKCIO[fn].fordulo))zart.push(sz.id+":"+f.id+"→"+fn);});
      sz.nyit.forEach(f=>elotte.add(f));});
    const m=KUT_SZAKASZ[1];
    return {eredmeny,zart,masodik:m.fel.map(f=>f.id),kell:m.kell};});
  ok(!r2.eredmeny.length&&!r2.zart.length&&JSON.stringify(r2.masodik)===JSON.stringify(["gol","meccs3","tempo"])&&r2.kell===3,
    "2a. nincs eredményhez kötött cél; minden cél funkciója a szakasz kezdetén nyitva; a 2. szakasz: gól + 3 meccs + tempó",r2);
  const r2b=await p.evaluate(()=>{
    const K=S.kut;K.sz=1;K.kesz={};K.md={};
    kutMeccsUtan(1,3);const a=K.sz;kutMeccsUtan(0,2);kutMeccsUtan(0,1);const b2=K.sz;
    /* a tempó: a csúszka nyila */
    const st=document.querySelector("#speedRow .speedStep");st&&st.click();
    return {egyMeccsUtan:a,haromVeresegUtan:b2,tempoUtan:K.sz,pipak:Object.keys(K.kesz)};});
  ok(r2b.egyMeccsUtan===1&&r2b.haromVeresegUtan===1&&r2b.tempoUtan===2,"2b. a 2. szakasz három vereséggel is teljesül (gól + 3 meccs + a tempó nyila)",r2b);
  /* 4. a vezetett leckék */
  await p.evaluate(()=>{kutLeckeZar();try{_guideQ.length=0;guideShowNext();}catch(e){}   /* a gyors indítás kint hagyott guide-tippje */
    Object.keys(KUT_FUNKCIO).forEach(f=>S.kut.nyit[f]=1);S.kut.uj=[];   /* a 2. rész szakasz-lezárásának ünneplése itt ne indítson más leckét */S.kut.lecke={elso11:1};renderHub();});
  await p.waitForTimeout(800);
  const eredm={};
  for(const id of ["meccsek","fejlodes","lelek","kockazat","merleg","hosszu"]){
    await p.evaluate((id)=>{kutLeckeZar();document.querySelectorAll('[role="dialog"],.hubModal').forEach(e=>{if(!e.closest("#kutLecke"))e.classList.add("hide");});
      try{hubMenuExit();}catch(e){}["scWindow","twPanel","hubFormationPicker"].forEach(x=>{const e=document.getElementById(x);if(e)e.classList.add("hide");});
      document.getElementById("scHub").classList.remove("hide");renderHub();
      /* 1.0.12.1.00: a lecke a futó lépéssort félreteszi, így a renderHub egy újat indíthat (ami kinyitja
         a menüt) — a próba a csukott menüs HUB-ról indítja a leckét */
      try{if(_tSteps){_tSteps=null;teachStepsHide();}hubMenuExit();}catch(e){}kutLeckeIndit(id);},id);
    const nyom=[];let elozo="",ism=0,elakadt=0,kattDb=0;
    for(let k=0;k<80;k++){
      await p.waitForTimeout(450);
      const a=await p.evaluate(()=>{if(!_kutL)return {vege:1};const st=KUT_LECKE[_kutL.id].l[_kutL.i];const v=document.querySelector(".kutCelVillog");const box=$("kutLecke");
        return {i:_kutL.i,t:st.t,pill:box.classList.contains("var"),v:v?(v.id||v.className.split(" ")[0]):null,modal:!$("hubTacticConfirmModal").classList.contains("hide"),
          c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent||"",x:(document.querySelector("#kutLecke .kutLX")||{}).textContent||""};});
      if(a.vege)break;
      if(a.modal){await p.evaluate(()=>$("hubTacticConfirmYes").click());continue;}
      const sor=a.i+":"+a.c;if(sor===elozo)ism++;else{ism=0;nyom.push(a.c.trim().replace(/^\S+\s/,"")+(a.v?" →"+a.v:""));}elozo=sor;
      if(/\$\{|undefined|NaN/.test(a.x))nyom.push("!!SZÖVEG");
      if(ism>=5){elakadt++;await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();else kutLeckeTovabb();});ism=0;continue;}
      if(a.t==="katt"&&a.v&&!a.pill){kattDb++;await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});v.click();});
        /* a beállító panelek saját mentése helyett a jel (a próba nem tölt ki űrlapot) */
        if(/Állítsd be|Próbáld ki/.test(a.c))await p.evaluate(()=>{kutJel("set:training");kutJel("set:bond");kutJel("set:dial");});}
      else if(!a.pill)await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
    eredm[id]={elakadt,kattDb,lepes:nyom.length,szoveg:nyom.filter(x=>x==="!!SZÖVEG").length,elso:nyom[0]};}
  const vez=await p.evaluate(()=>["meccsek","piac","fejlodes","lelek","kockazat","merleg","hosszu"].filter(id=>!KUT_LECKE[id].vezetett||KUT_LECKE[id].l[0].t!=="katt"));
  /* a lecke a SAJÁT első lépésével indul (nem egy közbejött ünneplés másik leckéje) */
  const ELSO={meccsek:"Az edzésterv",fejlodes:"A meccserő",lelek:"A csapatszerepek",kockazat:"A talizmánok",merleg:"A pénzed",hosszu:"Az ifiakadémia"};
  const rossz=Object.keys(eredm).filter(id=>eredm[id].elakadt||eredm[id].kattDb<3||eredm[id].szoveg||!String(eredm[id].elso).startsWith(ELSO[id]));
  ok(!vez.length&&!rossz.length,"4. minden nyitás-lecke vezetett (villogó menü → gomb → panel), és végigjárható a valódi, villogó elemekre koppintva",{vez,rossz,eredm});
  /* 3. animációk */
  const r3=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    const o={mod:kamMod(),lassu:KAM_LASSU};
    kamModAllit("mindketto");o.both=kamMod();kamModAllit("uj");o.uj=kamMod();
    try{localStorage.removeItem("evaKamMod30_0");localStorage.removeItem("evaKamOff30_0");}catch(e){}
    o.alap=kamMod();
    /* a 3D jelenet valódi hossza a régi idővonal 1,25-szöröse */
    const el=evaElem();const cv=el.querySelector(".evaKamVaszon");el.classList.remove("hide");cv.classList.remove("hide");
    const ev={t:"kapufa",side:"us",p:slots[9].player.n,min:30,seq:3};const c=evaKontextus(ev);
    const k=kamFelvetel(cv,c,ev,"elo",()=>{},{teljes:true});o.arany=k.ms/(k.F.ms*evaIdoSzorzo);k.stop();el.classList.add("hide");
    /* a jelenet vége: kitart, elhalványul, aztán zárul */
    mevKezd({});_mev.anim=true;evaIdoSzorzo=.4;
    const ev2={t:"kapufa",side:"us",p:slots[9].player.n,min:31,seq:4};
    let vegIdo=null;const t0=performance.now();
    evaKer(ev2);
    const minta=[];
    for(let i=0;i<150;i++){await w(25);const e=$("evAnim");const lat=e&&!e.classList.contains("hide");
      minta.push({t:Math.round(performance.now()-t0),lat,op:lat?+getComputedStyle(e).opacity:0,fut:!!_evaFut});
      if(!lat&&!_evaFut)break;}
    evaIdoSzorzo=1;
    const veg=minta.find(x=>!x.lat);const halvany=minta.filter(x=>x.lat&&x.op<.95&&x.op>0.02);
    o.halvanyKepek=halvany.length;o.zarult=!!veg;o.utolsoLathato=minta.filter(x=>x.lat).slice(-1)[0];
    return o;});
  ok(r3.mod==="uj"&&r3.alap==="uj"&&r3.both==="mindketto"&&Math.abs(r3.arany-1.25)<0.01&&r3.halvanyKepek>=2&&r3.zarult,
    "3. az animáció alapja az Új; a 3D jelenet 25%-kal lassabb; a vége kitart és elhalványul, nem vágódik le",r3);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
