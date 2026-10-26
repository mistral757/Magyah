/* 🎬📣 3.9.312 — A DÖNTŐ PILLANAT: A GÓLÖRÖM A HÁLÓNÁL, ELŐTTE IZGALOM.

   KÉRÉS: „amikor gólt lövünk és reagál a közönség hang is és a játék gólhoz
   kapcsolódó megerősítő hangja is, az kb 1 teljes másodperccel a gól után
   jön. Legyen olyan mint a valóságban. Legyen már egy izgalomfokozódás a gól
   előtti pillanatokban, és ahogy hálót ér a labda, azonnal játsszuk le a
   gólöröm hangot."

   Valódi karrierben, a játék saját jelenet-lejátszójával mér:
     1. gól: a gól hangja (és vele a lelátó) PONTOSAN a háló mozdulásakor szól,
        nem a jelenet végén; a jelenet elejétől addig az izgalom fokozódik
        (a döntő pillanatig tartó hosszal);
     2. a jelenet utáni közvetítés ugyanazt a gól-hangot NEM ismétli meg — a
        többi közvetítés-hang (pl. egy közben jött kapufa) a jelenet után jön;
     3. kapott gól, kapufa, bravúr: a saját hangja a saját döntő pillanatában
        (háló / fém csendülése / kesztyű);
     4. a döntő pillanat előtt átugrott jelenet: se gól-hang, se izgalom nem
        marad szólva — a közvetítés gól-hangja a rendes úton, egyszer jön;
     5. a jelenet után egy új, jelenet nélküli gól-hang ismét szól (a
        nyilvántartás lejár);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9312;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
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
    /* a hang-kém: minden megszólalás időbélyeggel */
    window._hl=[];const h0=hang;hang=function(id){window._hl.push([performance.now(),id]);return h0.apply(this,arguments);};
    window._var=()=>new Promise(r=>{const t0=performance.now();
      const f=()=>(!_evaFut&&!_evaSor.length)||performance.now()-t0>9000?r():setTimeout(f,40);f();});
    window._elo=()=>{mevKezd({});_mev.anim=true;_mev.keret=8;S.playing=true;S.auto=false;};});
  await p.waitForTimeout(800);

  /* a kémek: a döntő pillanat és az izgalom */
  await p.evaluate(()=>{window._izg=[];const iz=evaIzgalom;evaIzgalom=function(d){window._izg.push([performance.now(),d]);return iz.apply(this,arguments);};});
  const jelenet=(ev,kozvHang)=>p.evaluate(async([ev,kozvHang])=>{
    _elo();evaIdoSzorzo=0.5;window._hl=[];window._izg=[];
    const t0=performance.now();evaKer(ev);
    if(kozvHang)hangMeccs(kozvHang);    /* a közvetítés hangja ugyanerre (pufferbe) */
    await new Promise(r=>setTimeout(r,30));
    const F=_evaFut,donto=F&&F.donto?{ms:Math.round(F.donto.ms),id:F.donto.id}:null;
    const halo=F?((F.hangJ||[]).filter(x=>x[1]==="aHalo").map(x=>Math.round(x[0])).sort((a,b)=>a-b)[0]):null;
    const vege=F?Math.round(((EVA_SABLON[(evaSkillSablon(ev)||evaAltSablon(ev)||EVA_TIPUS_SABLON[ev.t])]||{}).dur||0)*evaIdoSzorzo):0;
    await _var();await new Promise(r=>setTimeout(r,700));
    const sz=window._hl.map(x=>[Math.round(x[0]-t0),x[1]]);
    const izg=window._izg.map(x=>[Math.round(x[0]-t0),Math.round(x[1]*1000)]);
    mevVege();S.playing=false;evaIdoSzorzo=1;
    return {donto,halo,vege,sz,izg};},[ev,kozvHang||null]);
  const E={t:"gol",side:"us",p:"Teszt Elek",min:30,seq:1};

  console.log("\n— 1–2. gól: a hálónál, előtte izgalom, utána nem ismétlődik —");
  const g=await jelenet(E,"gol");
  const golok=g.sz.filter(x=>x[1]==="gol"),haloSz=g.sz.find(x=>x[1]==="aHalo");
  ok(g.donto&&g.donto.id==="gol"&&g.donto.ms===g.halo,"a döntő pillanat a háló mozdulása",{donto:g.donto,halo:g.halo});
  ok(golok.length>=1&&haloSz&&Math.abs(golok[0][0]-haloSz[0])<=40,"a gól hangja a hálóval EGYÜTT szól (≤40 ms)",{gol:golok[0],halo:haloSz});
  ok(golok.length>=1&&golok[0][0]<g.vege,"…a jelenet vége ELŐTT, nem utána",{gol:golok[0],vege:g.vege});
  ok(g.izg.length===1&&g.izg[0][0]<60&&Math.abs(g.izg[0][1]-g.halo)<=5,"az izgalom a jelenet elején indul, és pontosan a hálóig fokozódik",{izg:g.izg,halo:g.halo});
  ok(golok.length===1,"a jelenet utáni közvetítés a gól-hangot nem ismétli meg",golok);

  const g2=await p.evaluate(async()=>{
    _elo();evaIdoSzorzo=0.5;window._hl=[];
    evaKer({t:"gol",side:"us",p:"Teszt Elek",min:40,seq:2});
    hangMeccs("gol");hangMeccs("kapufa");
    await _var();await new Promise(r=>setTimeout(r,900));
    const ids=window._hl.map(x=>x[1]).filter(x=>!/^a[A-Z]/.test(x));
    mevVege();S.playing=false;evaIdoSzorzo=1;return ids;});
  ok(g2.filter(x=>x==="gol").length===1&&g2.includes("kapufa")&&g2.indexOf("gol")<g2.indexOf("kapufa"),"a többi közvetítés-hang megmarad, és a jelenet után jön",g2);

  console.log("\n— 3. kapott gól, kapufa, bravúr —");
  const gk=await jelenet({...E,t:"golKapott",side:"them",seq:3},"golKapott");
  const gkS=gk.sz.filter(x=>x[1]==="golKapott"),gkH=gk.sz.find(x=>x[1]==="aHalo");
  ok(gkS.length===1&&gkH&&Math.abs(gkS[0][0]-gkH[0])<=40,"kapott gól: a hálónál, egyszer",{golKapott:gkS,halo:gkH});
  const kf=await jelenet({...E,t:"kapufa",seq:4},"kapufa");
  const kfS=kf.sz.filter(x=>x[1]==="kapufa"),kfF=kf.sz.find(x=>x[1]==="aKapufa");
  ok(kfS.length===1&&kfF&&Math.abs(kfS[0][0]-kfF[0])<=40,"kapufa: a fém csendülésekor, egyszer",{kapufa:kfS,fem:kfF});
  const bv=await jelenet({...E,t:"bravur",side:"them",seq:5},"bravur");
  const bvS=bv.sz.filter(x=>x[1]==="bravur");
  ok(bvS.length===1&&bv.donto&&Math.abs(bvS[0][0]-bv.donto.ms)<=40&&bvS[0][0]<bv.vege,"bravúr: a kesztyű pillanatában, egyszer",{bravur:bvS,donto:bv.donto});
  ok([gk,kf,bv].every(r=>r.izg.length===1),"mindháromnál fokozódik előtte az izgalom",[gk.izg,kf.izg,bv.izg]);

  console.log("\n— 4. átugrás a döntő pillanat előtt —");
  const r4=await p.evaluate(async()=>{
    _elo();evaIdoSzorzo=1;window._hl=[];
    evaKer({t:"gol",side:"us",p:"Teszt Elek",min:50,seq:6});hangMeccs("gol");
    await new Promise(r=>setTimeout(r,100));
    const elotte=window._hl.filter(x=>x[1]==="gol").length;
    $("evAnim").click();
    await new Promise(r=>setTimeout(r,2600));
    const r={elotte,golok:window._hl.filter(x=>x[1]==="gol").length,szolt:JSON.stringify(_kozv.szolt)};
    mevVege();S.playing=false;return r;});
  ok(r4.elotte===0&&r4.golok===1,"a hálóig nem szólt semmi; a közvetítés gól-hangja egyszer, a rendes úton jön",r4);

  console.log("\n— 5. a nyilvántartás lejár —");
  const r5=await p.evaluate(async()=>{
    _elo();window._hl=[];hangMeccs("gol");
    const r=window._hl.filter(x=>x[1]==="gol").length;mevVege();S.playing=false;return r;});
  ok(r5===1,"jelenet nélkül a következő gól-hang ismét szól",r5);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
