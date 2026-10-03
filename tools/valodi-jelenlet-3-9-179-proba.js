/* 🟢 3.9.179 — VALÓDI JELENLÉT PvP-BEN.

   Bejelentett hiba: a társ akkor is ONLINE-nak látszott, ha a játékot csak nem
   zárta be — háttérben volt, más alkalmazásban, vagy rég nem nyúlt hozzá.

   A hálózat egy HAMIS Firebase-réteg (mpNet.fns), ami minden írást rögzít —
   így pontosan látszik, mi menne ki a szobába. Amit mér:
     1. előtérben, friss aktivitással a kör `online:true`-t ír;
     2. MP_IDLE_MS tétlenség után `online:false`, a seenAt az UTOLSÓ aktivitás
        (szerveridőben) — és csak EGYSZER (nincs ismételt írás);
     3. egy érintésre AZONNAL visszaáll az `online:true`;
     4. háttérbe kerüléskor (visibilitychange) AZONNAL `online:false`, a
        seenAt a távozás pillanata; visszatéréskor azonnal `online:true`;
     5. a NÉZETT, futó meccs és a beváró réteg aktivitásnak számít (tétlen
        kéz mellett is online);
     6. a szívverés a beváró képernyőn KÍVÜL is fut (globális kör);
     7. az OLVASÓ oldal: `online:true` + elavult seenAt → nincs itt;
        friss → itt van; `online:false` → nincs; mező nélkül → nem tudjuk;
     8. a felirat: „utoljára N perce volt aktív";
     9. csak a meglévő mezőket írja (online, seenAt) — a szabályfájl
        változatlanul elfogadja; nincs oldalhiba;
    10. ASZTALI GÉP: látszó, de fókusz nélküli ablak (másik program van elöl) —
        MP_IDLE_BLUR_MS tétlenség után „távol", és a nézés (beváró réteg) sem
        tartja online-nak; a fókusz visszatérése azonnal online. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9221;
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
  /* a láthatóság kézzel állítható (a headless lap mindig „visible") */
  await p.addInitScript(()=>{window.HANG_TESZT=true;
    window.__vis="visible";window.__focus=true;
    document.hasFocus=()=>window.__focus;
    Object.defineProperty(document,"visibilityState",{configurable:true,get:()=>window.__vis});});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);

  const r=await p.evaluate(async()=>{
    const out={},irasok=[];
    const varj=ms=>new Promise(res=>setTimeout(res,ms));
    /* ---- a hamis Firebase ---- */
    const SZERVER_ELTOLAS=120000;   /* a szerver órája 2 perccel jár előrébb */
    mpNet.mode="fb";mpNet.skew=SZERVER_ELTOLAS;mpNet.db={};
    mpNet.fns={ref:(db,path)=>({path}),
      update:async(ref,val)=>{irasok.push({path:ref.path,val:JSON.parse(JSON.stringify(val)),t:Date.now()});},
      onDisconnect:ref=>({update:async()=>{},cancel:async()=>{}}),
      serverTimestamp:()=>Date.now()+SZERVER_ELTOLAS};
    MP.active=true;MP.activeRoom="JELEN1";
    _mpPresence=null;_mpJelenKiirt=null;_mpBeatAt=0;
    const utolso=()=>{const a=irasok.filter(x=>/players\//.test(x.path)&&("online" in x.val));return a.length?a[a.length-1].val:null;};
    const db=()=>irasok.filter(x=>("online" in x.val)).length;
    /* 1. előtér + friss aktivitás */
    _mpLastAct=Date.now();
    mpJelenletKor();await varj(50);
    out.elotter=utolso();
    /* 2. tétlenség */
    const akt=Date.now()-(MP_IDLE_MS+30000);_mpLastAct=akt;
    mpJelenletKor();await varj(50);
    out.tetlen=utolso();
    out.tetlenVart=Math.round(akt+SZERVER_ELTOLAS);
    const n0=db();mpJelenletKor();mpJelenletKor();await varj(50);
    out.egyszer=db()===n0;
    /* 3. egy érintésre azonnal vissza */
    document.dispatchEvent(new Event("pointerdown",{bubbles:true}));await varj(80);
    out.erintes=utolso();
    /* 4. háttér */
    window.__vis="hidden";document.dispatchEvent(new Event("visibilitychange"));await varj(80);
    out.hatter=utolso();out.hatterIdo=Date.now()+SZERVER_ELTOLAS;
    window.__vis="visible";document.dispatchEvent(new Event("visibilitychange"));await varj(80);
    out.vissza=utolso();
    /* 5. nézett meccs / beváró réteg tétlen kéz mellett */
    _mpLastAct=Date.now()-(MP_IDLE_MS+60000);
    S.playing=true;S.auto=false;_mpJelenKiirt=null;
    mpJelenletKor();await varj(50);out.meccs=utolso();
    S.playing=false;
    document.getElementById("h2hWait").classList.remove("hide");_mpJelenKiirt=null;
    mpJelenletKor();await varj(50);out.bevaro=utolso();
    document.getElementById("h2hWait").classList.add("hide");
    /* 6. a globális kör a beváró képernyőn kívül is ver */
    _mpLastAct=Date.now();_mpJelenKiirt=true;_mpBeatAt=Date.now()-MP_PRES_BEAT_MS-1000;
    const n1=db();await varj(5600);
    out.globalis=db()>n1;
    /* 10. fókusz nélküli, de látszó ablak */
    const tetlen90=Date.now()-90000;
    _mpLastAct=tetlen90;_mpJelenKiirt=null;
    mpJelenletKor();await varj(50);out.fokuszTetlen90=utolso();      /* fókuszban: még online */
    window.__focus=false;_mpLastAct=tetlen90;
    mpJelenletKor();await varj(50);out.blurTetlen90=utolso();        /* fókusz nélkül: távol */
    _mpLastAct=Date.now()-20000;_mpJelenKiirt=null;
    mpJelenletKor();await varj(50);out.blurFriss=utolso();           /* friss mozdulat: online */
    document.getElementById("h2hWait").classList.remove("hide");
    _mpLastAct=tetlen90;
    mpJelenletKor();await varj(50);out.blurBevaro=utolso();          /* beváró, fókusz nélkül: távol */
    window.__focus=true;window.dispatchEvent(new Event("focus"));await varj(80);
    out.fokuszVissza=utolso();
    document.getElementById("h2hWait").classList.add("hide");
    /* 7. az olvasó oldal */
    const szoba=pl=>({players:{[mpMyId()]:{role:"host",online:true},tars:pl}});
    out.olv={
      friss:mpMateOnline(szoba({online:true,seenAt:mpNow()-10000})),
      elavult:mpMateOnline(szoba({online:true,seenAt:mpNow()-(MP_SEEN_STALE_MS+20000)})),
      ki:mpMateOnline(szoba({online:false,seenAt:mpNow()})),
      nincs:mpMateOnline(szoba({role:"guest"}))};
    /* 8. a felirat */
    _mpPresRoom=szoba({online:true,seenAt:mpNow()-12*60000});
    document.getElementById("h2hWait").classList.remove("hide");
    mpPresencePaint();
    out.felirat=document.getElementById("h2hWaitMate").textContent;
    document.getElementById("h2hWait").classList.add("hide");
    /* 9. csak engedélyezett mezők */
    const enged=new Set(["role","ready","online","seenAt","push","waitAt"]);
    out.mezok=[...new Set(irasok.flatMap(x=>Object.keys(x.val)))];
    out.csakEngedett=out.mezok.every(k=>enged.has(k));
    MP.active=false;MP.activeRoom=null;mpNet.mode=null;
    return out;});

  console.log("\n— a saját jelenlét —");
  ok(r.elotter&&r.elotter.online===true,"előtérben, friss aktivitással: online",r.elotter);
  ok(r.tetlen&&r.tetlen.online===false&&Math.abs(r.tetlen.seenAt-r.tetlenVart)<2000,
    "3 perc tétlenség után: online:false, a seenAt az utolsó aktivitás (szerveridőben)",{iras:r.tetlen,vart:r.tetlenVart});
  ok(r.egyszer,"a „távol” egyszer megy ki, nincs ismételt írás");
  ok(r.erintes&&r.erintes.online===true,"egy érintésre azonnal visszaáll",r.erintes);
  ok(r.hatter&&r.hatter.online===false&&Math.abs(r.hatter.seenAt-r.hatterIdo)<2000,"háttérbe kerüléskor azonnal online:false, a távozás pillanatával",r.hatter);
  ok(r.vissza&&r.vissza.online===true,"visszatéréskor azonnal online",r.vissza);
  ok(r.meccs&&r.meccs.online===true,"a nézett, futó meccs aktivitásnak számít",r.meccs);
  ok(r.bevaro&&r.bevaro.online===true,"a beváró réteg előtérben aktivitásnak számít",r.bevaro);
  ok(r.globalis,"a szívverés a beváró képernyőn kívül is fut (globális kör)");
  console.log("\n— asztali gép: látszó, de fókusz nélküli ablak —");
  ok(r.fokuszTetlen90&&r.fokuszTetlen90.online===true,"fókuszban 90 mp tétlenség még online (a küszöb 3 perc)",r.fokuszTetlen90);
  ok(r.blurTetlen90&&r.blurTetlen90.online===false,"fókusz nélkül 90 mp tétlenség már távol (küszöb 1 perc)",r.blurTetlen90);
  ok(r.blurFriss&&r.blurFriss.online===true,"fókusz nélkül, friss mozdulattal online",r.blurFriss);
  ok(r.blurBevaro&&r.blurBevaro.online===false,"fókusz nélkül a beváró réteg nem tart online-nak",r.blurBevaro);
  ok(r.fokuszVissza&&r.fokuszVissza.online===true,"a fókusz visszatérése azonnal online",r.fokuszVissza);
  console.log("\n— a társ jelenléte —");
  ok(r.olv.friss===true&&r.olv.elavult===false&&r.olv.ki===false&&r.olv.nincs===null,
    "friss szívverés → itt van · elavult → nincs · online:false → nincs · mező nélkül → nem tudjuk",r.olv);
  ok(/NINCS a játékban/.test(r.felirat)&&/utoljára 12 perce volt aktív/.test(r.felirat),"a felirat: „utoljára N perce volt aktív”",r.felirat);
  ok(r.csakEngedett,"csak a szabályfájl által engedett mezőket írja",r.mezok);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
