/* A HANGOLÁS (3.9.38) — a beragadás mentőöve.

   Amit mér:
     1. A KAPU: csak akkor ajánljuk fel, ha a legutóbbi idényben NEM jutottál
        feljebb, ÉS a korrekció tényleg lefelé viszi a világot. Feljutás után,
        illetve akkor, ha amúgy is a kezdő rés fölött állsz, nincs ajánlat.
     2. A MÉRCE: a saját oldalad a MECCS-ERŐ és a KERET-ERŐ számtani közepe.
        Ez azért a helyes szám, mert a mezőny a rejtett bónuszból fixen a
        felét kapja vissza (OPP_BUFF_MEASURED) — a közép pontosan kiejti. A
        próba ezt közvetlenül ellenőrzi: a rejtett bónusz MEGVÁLTOZTATÁSA nem
        mozdíthatja a hangolás utáni VALÓDI rést (levelGap). Külön mérjük a
        NEGATÍV rejtett bónuszt is: ott a mezőny semmit nem kap vissza
        (max(0,·)), tehát a közép helyett a tiszta meccs-erő a helyes mérce —
        és a valódi résnek ott is a vállalásra kell állnia.
     0. A FIXTÚRA a valódi játékot utánozza: a kezdő 11 benne van a
        `drafted`-ben (a játékban minden leigazolt játékos bekerül), különben
        a piac-eltolás a SAJÁT keretedet is átskálázná.
     3. A HATÁS: a világ MINDEN osztálya együtt mozdul, a lépcső nem csúszik.
     4. AZ ÁR: a Run-szint szorzósan esik (90 → 81 → 72,9), nem kivonással.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=8979;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});

(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);

  const r=await p.evaluate(()=>{
    const out={};
    gameMode="career";teamName="Teszt FC";
    /* egy hihető kezdő 11 — a teamStrength ebből számol */
    const POS=["KP","JV","BV","BV","KV","VKP","KKP","TKP","JSZ","BSZ","CS"];
    careerPool={};slots.length=0;
    POS.forEach((pos,i)=>{
      const n=`Teszt ${i+1}`;
      const pl={n,pos:[pos],ovr:100,age:26,pot:9000,nat:"Magyarorszag"};
      careerPool[n]={n,pos:[pos],ovr:100,age:26,pot:9000,peak:102,startRating:100,
        nat:"Magyarorszag",conf:0,attrs:{}};
      /* a valódi játékban a leigazolt játékos MINDIG bekerül a drafted-be —
         ez tartja távol tőle a piac-eltolást (applyMarketShift) */
      drafted.add(n);
      slots.push({pos,player:pl,fit:1});});
    /* egy hatosztályos világ, kézzel — a piramis csak a divs-t olvassa */
    const mk=mean=>({teams:Array.from({length:15},(_,i)=>(
      {n:`Klub ${mean}-${i}`,ovr:Math.round((mean+(i-7)*0.4)*10)/10,raw:mean})),mean,lo:mean-3,hi:mean+3});
    const kozepek=[105,102,99,96,93,90];
    S.pyr={on:true,my:4,startDiv:6,aiSpeed:"tarto",divs:kozepek.map(mk),
      /* gapWant = amit a nehézségválasztón VÁLLALTÁL; a gap0 szándékosan MÁS,
         hogy lássuk: a hangolás a vállalást állítja vissza, nem a gap0-t */
      gapWant:2,gap0:-4,log:[{s:1,div:4,to:4,rank:8}],meas:null,upAmt:0,up:0,v:1};
    S.run={retunes:0};S.auto=false;
    const ts=teamStrength(),h=hiddenMatchBonus();
    out.alap={keret_ero:Math.round(ts*10)/10,rejtett:Math.round(h*10)/10,
      mercem:Math.round(pyrRetuneMine()*10)/10,osztaly_kozepe:S.pyr.divs[3].mean,
      valodi_res:Math.round(pyrRetuneGap()*10)/10,vallalas:pyrRetuneWant()};

    /* ---- 1. A KAPU ---- */
    out.kapu={};
    out.kapu.beragadva=pyrRetuneOfferable();
    S.pyr.log=[{s:1,div:5,to:4,rank:1}];                 /* feljutottál */
    out.kapu.feljutas_utan_nincs=!pyrRetuneOfferable();
    S.pyr.log=[{s:1,div:4,to:4,rank:8}];
    /* ha a világ amúgy is jóval alattad van, a hangolás FÖLFELÉ tolna — nem ajánljuk */
    const ment=S.pyr.divs.map(d=>d.mean);
    S.pyr.divs.forEach((d,i)=>{d.mean=ment[i]-40;});
    out.kapu.mar_elorebb_nincs=!pyrRetuneOfferable();
    S.pyr.divs.forEach((d,i)=>{d.mean=ment[i];});
    out.kapu.vissza=pyrRetuneOfferable();

    /* ---- 2-3. A HATÁS ---- */
    const elotte=S.pyr.divs.map(d=>d.mean);
    const sh=pyrRetuneShift();
    out.shift={off:sh.off,mercem:sh.mine,most:sh.now,cel:sh.cel,gap0:sh.gap0};
    const alk=pyrRetuneApply();
    const utana=S.pyr.divs.map(d=>d.mean);
    out.hatas={
      /* a VÁLLALT rés állt vissza (+2), nem a tárolt gap0 (−4) */
      res_visszaallt:Math.abs(pyrRetuneGap()-2)<0.15,
      nem_a_gap0:Math.abs(pyrRetuneGap()-(-4))>1,
      /* MINDEN osztály együtt mozdult, ugyanannyival */
      mind_mozdult:utana.every((m,i)=>Math.abs((elotte[i]-m)-alk.off)<0.06),
      /* a lépcső NEM csúszott szét */
      lepcso_ep:(function(){
        const e=[],u=[];
        for(let i=1;i<elotte.length;i++){e.push(Math.round((elotte[i-1]-elotte[i])*10)/10);
          u.push(Math.round((utana[i-1]-utana[i])*10)/10);}
        return e.join()===u.join();})(),
      keret_erintetlen:Math.abs(teamStrength()-ts)<1e-9};

    /* ---- 2/b. A REJTETT BÓNUSZ KIESIK ----
       Ez a kérés lényege: „a meccs erőd és a csapaterőd számtani közepéhez
       képest". Ha a mérce helyes, akkor egy MÁS rejtett bónusszal is UGYANAZ
       a valódi rés jön ki a hangolás után — a mezőny ugyanis a felét
       visszakapja. Két futás, két különböző morállal. */
    const proba=(morale)=>{
      S.pyr.divs=kozepek.map(mk);S.pyr.my=4;S.run={retunes:0};
      S.morale=morale;S.oppBuffH=null;S.idx=0;
      S.pyr.log=[{s:1,div:4,to:4,rank:8}];
      const be=pyrRetuneApply();
      oppTargetRating=pyrLevel();
      /* a VALÓDI rés a motor saját mércéjével, a hangolás UTÁN */
      return {h:Math.round(hiddenMatchBonus()*10)/10,
              off:be?be.off:0,
              res:Math.round(levelGap(pyrLevel())*10)/10};};
    const a1=proba(20),a2=proba(95);
    out.rejtett_kiesik={alacsony_moral:a1,magas_moral:a2,
      /* a rejtett bónusz jócskán más… */
      h_kulonbozik:Math.abs(a1.h-a2.h)>1.5,
      /* …a hangolás után MINDKETTŐ a vállalt +2-re áll (a pyrLevel egészre
         kerekít, ezért fél Rating a megengedett szórás) */
      mindketto_a_vallalason:Math.abs(a1.res-2)<0.55&&Math.abs(a2.res-2)<0.55,
      res_ugyanaz:Math.abs(a1.res-a2.res)<1.01};

    /* ---- 4. AZ ÁR ---- */
    S.run={retunes:0};
    out.ar={nulla:pyrRetuneMult(),
      egy:(S.run.retunes=1,Math.round(pyrRetuneMult()*1000)/1000),
      ketto:(S.run.retunes=2,Math.round(pyrRetuneMult()*1000)/1000),
      /* 90 → 81 → 72,9 — a kérés szerint */
      kilencven_utan:(S.run.retunes=1,Math.round(90*pyrRetuneMult()*10)/10),
      ketszer:(S.run.retunes=2,Math.round(90*pyrRetuneMult()*10)/10)};
    return out;});

  const T=[
    ["beragadva felajánlja",r.kapu.beragadva===true],
    ["feljutás után NEM ajánlja",r.kapu.feljutas_utan_nincs===true],
    ["ha amúgy is előrébb vagy, NEM ajánlja",r.kapu.mar_elorebb_nincs===true],
    ["a VÁLLALT rés áll vissza (+2)",r.hatas.res_visszaallt===true],
    ["…és nem a tárolt gap0 (−4)",r.hatas.nem_a_gap0===true],
    ["mind a hat osztály együtt mozdul",r.hatas.mind_mozdult===true],
    ["a lépcső nem csúszik szét",r.hatas.lepcso_ep===true],
    ["a kereted érintetlen",r.hatas.keret_erintetlen===true],
    ["a rejtett bónusz tényleg más a két futásban",r.rejtett_kiesik.h_kulonbozik===true],
    ["…a hangolás utáni VALÓDI rés mégis ugyanaz",r.rejtett_kiesik.res_ugyanaz===true],
    ["…és mindkettő a vállalt +2-n áll",r.rejtett_kiesik.mindketto_a_vallalason===true],
    ["az ár szorzós: 1× = 0,90 · 2× = 0,81",r.ar.egy===0.9&&r.ar.ketto===0.81],
    ["90 → 81 → 72,9 (a kérés szerint)",r.ar.kilencven_utan===81&&r.ar.ketszer===72.9],
    ["nincs oldalhiba",errs.length===0]];
  T.forEach(([n,ok])=>console.log((ok?"  ✓ ":"  ✗ ")+n));
  console.log("\n  a próbakeret:",JSON.stringify(r.alap));
  console.log("  az eltolás:  ",JSON.stringify(r.shift));
  console.log("  rejtett-próba:",JSON.stringify(r.rejtett_kiesik));
  if(errs.length)console.log("\noldalhiba:",errs.slice(0,3));
  const bukott=T.filter(x=>!x[1]).length;
  console.log(bukott?`\nBUKOTT: ${bukott}`:"\nminden rendben");
  await b.close();srv.close();process.exit(bukott?1:0);})();
