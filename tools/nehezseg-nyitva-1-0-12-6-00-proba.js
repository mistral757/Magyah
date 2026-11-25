/* 🎚 1.0.12.6.00 — A FOKOZAT-CSOMAG MINDEN ELEME NYITVA
   KIMONDOTT KÉRÉS (🐞 jegyzet jmwvbypb4enyx után, „D) verzió"): „Szüntessük meg ezeket a zárt elemeket.
   Minden nyitva eleve"
   Amit mér (friss böngésző = első karrier, üres feloldás-napló):
     1. mind az 50 belső szinten (1.1 … 10.5) a csomag helyettesítés nélkül alkalmazható, és a hivatalos
        szint pontosan a választott (8.1 → 8.1, nem 6.3);
     2. a beállító rácsaiban (mezőny-tempó, tempó, ikonok, képesség-mód) egy gomb sincs lezárva, a
        kezdő lépcsőn sem;
     3. a csomag alkalmazása után a beállító állapota a csomag (nfEgyezik);
     4. a haladás-panelben nincs tempó- és képesség-feloldás; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9467;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f==="/")f="/index.html";
  const a=path.join(ROOT,f);if(!fs.existsSync(a)||fs.statSync(a).isDirectory()){r.statusCode=404;return r.end();}
  r.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(a).pipe(r);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1500);
  const r=await p.evaluate(()=>{
    const o={lepcso:!!unlockPreset(),runs:unlockState().runs||0,rossz:[],helyDb:0};
    for(let nf=1;nf<=10;nf++)for(let s=1;s<=5;s++){
      const h=nfCsomagHatasos(nfCsomag(nf,s));o.helyDb+=h.hely.length;
      const hv=nfHivatalos(h);if(hv.nf!==nf||hv.s!==s)o.rossz.push(`${nf}.${s}→${hv.nf}.${hv.s}`);}
    try{unlockApplyLocks();}catch(e){o.err=String(e);}
    o.zart=[...document.querySelectorAll("#pyrSpeedGrid button,#tempoGrid button,#iconGrid button,#skillModeGrid button")]
      .filter(x=>x.disabled||x.classList.contains("unlockOff")).map(x=>x.textContent.trim().slice(0,30));
    o.gombDb=document.querySelectorAll("#pyrSpeedGrid button,#tempoGrid button,#iconGrid button,#skillModeGrid button").length;
    pyrWanted=true;nfCsomagAlkalmaz(8,1);o.egyezik=nfEgyezik(8,1);o.hiv=nfBeallHivatalos();
    o.panel=unlockProgressHtml();
    return o;});
  ok(r.runs===0,"friss böngésző: 0 lezárt karrier",{runs:r.runs,lepcso:r.lepcso});
  ok(r.helyDb===0&&r.rossz.length===0,"1. 50 belső szint: nincs helyettesítés, a hivatalos szint = a választott",{hely:r.helyDb,rossz:r.rossz});
  ok(r.gombDb>8&&r.zart.length===0&&!r.err,"2. a beállító rácsaiban nincs zárt gomb (a kezdő lépcsőn sem)",{db:r.gombDb,zart:r.zart,err:r.err});
  ok(r.egyezik&&r.hiv.nf===8&&r.hiv.s===1,"3. a 8.1 csomag alkalmazva, a hivatalos szint 8.1",r.hiv);
  ok(!/Tempó-fokozatok|Realisztikus képesség|Ikon-sűrűség/.test(r.panel),"4. a haladás-panelben nincs tempó-, ikon- és képesség-feloldás");
  ok(errs.length===0,"nincs oldalhiba",errs);
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.log("HIBA",e);process.exit(1);});
