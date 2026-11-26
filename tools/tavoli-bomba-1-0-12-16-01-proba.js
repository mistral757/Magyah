/* 💣 1.0.12.16.01 — A TÁVOLI LÖVÉS 3D-BEN: NEM TÖR BE A VÉDŐBE, MESSZIRŐL JÖN A BOMBA
   KIMONDOTT KÉRÉS (🐞 jegyzet jmwy4qba47ws4): „Szitálós gólnál mikor megkapja a játékos a labdát, utána tol egyet
   rajta úgy, hogy gyakorlatilag beletolja a védőbe. És tök közel is kerül így a kapuhoz. Menőbb lenne, ha távol
   maradna a kaputól, és onnan messziről egy enyhe labdaigazítás után lőné rá, és igazi távoli bombagól lenne belőle."
   Amit mér (a „tavoli" felvezetésű jelenetek: Szitálós, Ágyúgolyó, potyagól; gól / védés / kapufa / mellé):
     1. a lövés helye legalább 22 m-re van a gólvonaltól (régen ~11 m);
     2. az igazítás rövid: a lövő a felvezetés végétől legfeljebb 2,5 m-t mozdul a lövésig;
     3. a lövő és a védő a lövésig 1,2 m-nél közelebb nem kerül egymáshoz, a labda sem megy át a védőn;
     4. a kimenetel változatlan (gól → háló, védés → kesztyű …), az idővonal monoton;
     5. a nem távoli felvezetés (pl. kontra) továbbra is betör a kapura;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9664;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
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
  await p.evaluate(()=>{document.querySelectorAll("#chPop").forEach(e=>e.remove());mevKezd({});_mev.keret=8;_mev.anim=true;});
  const r=await p.evaluate(()=>{const o=[];
    const E=[["skSzitalos","gol"],["skAgyu","gol"],["evPotya","gol"],["skSzitalos","vedes"],["skSzitalos","kapufa"],["skAgyu","bravur"]];
    for(let s=0;s<6;s++)E.forEach(([sk,t],i)=>{
      const ev={t,side:"us",p:slots[9].player.n,min:10+i+s*7,seq:i+1+s*13};const c=evaKontextus(ev);
      const F0=kamForgatokonyv(c,ev,sk);if(F0.arch!=="tavoli"){o.push({sk,t,arch:F0.arch,kihagy:1});return;}
      const lo0=kamUt(F0.sz.lo.ut,1);
      const F=kamKimenetel(F0,c,ev,sk),tR=F.lovesT;
      const lo=kamUt(F.sz.lo.ut,tR);const gx=52.5-lo[1];
      let minD=99,minL=99;const t1=F.ms?0:0;
      for(let u=0;u<=tR+1e-9;u+=.01){const a=kamUt(F.sz.lo.ut,u),v=F.sz.v1?kamUt(F.sz.v1.ut,u):null;
        if(v&&u>=tR*.5){minD=Math.min(minD,Math.hypot(a[1]-v[1],a[2]-v[2]));}
        if(v&&u>=tR*.5){const L=kamUt(F.labda.map(p=>[p[0],p[1],p[2],p[3]]),u);if(L)minL=Math.min(minL,Math.hypot(L[1]-v[1],L[2]-v[2]));}}
      const h=F.hang.map(x=>x[1]);
      o.push({sk,t,kim:F.kim,gx:+gx.toFixed(1),igaz:+Math.hypot(lo[1]-lo0[1],lo[2]-lo0[2]).toFixed(2),minD:+minD.toFixed(2),minL:+minL.toFixed(2),
        halo:!!F.halo,kesztyu:h.includes("aKesztyu"),fem:!!F.kapufa,mono:F.labda.every((p,j)=>!j||p[0]>=F.labda[j-1][0])});});
    /* a kontra továbbra is betör */
    let kontra=null;const SK=Object.keys(EVA_SABLON);
    for(let s=0;s<SK.length*3&&!kontra;s++){const sk=SK[s%SK.length];const ev={t:"gol",side:"us",p:slots[9].player.n,min:50+(s%40),seq:200+s};let c,F0;
      try{c=evaKontextus(ev);F0=kamForgatokonyv(c,ev,sk);}catch(e){continue;}if(!F0||!F0.sz||!F0.sz.lo||F0.arch==="egyensuly")continue;if(F0.arch==="tavoli"||F0.arch==="tizi"||F0.arch==="szabad")continue;const lo0=kamUt(F0.sz.lo.ut,1);if(lo0[1]>=36)continue;
      let F;try{F=kamKimenetel(F0,c,ev,sk);}catch(e){continue;}if(!F.lovesT||F.kim!=="gol")continue;kontra={sk,arch:F0.arch,x:+kamUt(F.sz.lo.ut,F.lovesT)[1].toFixed(1)};}
    return {o,kontra};});
  const L=r.o.filter(x=>!x.kihagy);
  console.log("    esetek:",L.length,"· pl.",JSON.stringify(L.slice(0,3)));
  ok(L.length>=20&&L.every(x=>x.gx>=22),"1. a lövés 22 m-nél messzebbről jön",L.map(x=>x.gx));
  ok(L.every(x=>x.igaz<=2.5),"2. az igazítás rövid (≤ 2,5 m)",L.map(x=>x.igaz));
  ok(L.every(x=>x.minD>=1.2&&x.minL>=.8),"3. a védőbe nem tolja bele (lövő–védő ≥ 1,2 m, labda–védő ≥ 0,8 m)",L.map(x=>[x.minD,x.minL]));
  const kimOk=L.every(x=>x.mono&&(x.t!=="gol"||(x.kim==="gol"&&x.halo))&&(x.kim!=="vedes"&&x.kim!=="fog"||x.kesztyu)&&(x.kim!=="kapufa"||x.fem));
  ok(kimOk,"4. a kimenetel és az idővonal rendben",L.map(x=>x.t+"→"+x.kim));
  ok(r.kontra&&r.kontra.x>=40,"5. a nem távoli felvezetés továbbra is betör",r.kontra);
  ok(errs.length===0,"6. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?"✗ "+hiba+" hiba":"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
