/* 🛟 3.9.311 — FORDÍTÁS, MÉGIS KIESÉS: A LEFÚJÁS NEM AKADHAT EL.

   BEJELENTÉS (kétszer): „a nyári kupában negyeddöntő második meccse után
   elakadt a guest. Nem engedi őt tovább. Nem ad be neki várakozó képernyőt,
   semmit." — és újratöltés után „továbbra is be van ragadva ugyanott".

   AZ OK: kupa-visszavágón a meccs embere a TOVÁBBJUTÁSHOZ kötött. Ha a csapat
   a meccsen hátrányból hozta ki a döntetlent / a győzelmet (🔥 Fordítás!), de
   a párharcot így is elveszítette, nincs meccs embere (best = −1) — a fordítás
   formapont-jutalma viszont active[best]-et olvasta. A fullTime hibára futott:
   az eredmény nem mentődött, a jutalom-lánc el sem indult, S.playing igaz
   maradt. Mivel a meccs a frissítés után ugyanazzal a sorsolással áll vissza,
   az újratöltés is pontosan ide akadt.

   Amit mér (valódi kupa-visszavágók, a felületről indítva — az első meccs
   0:4, így a párharc szinte biztosan elveszik): addig játszik, amíg legalább
   egyszer elő nem áll a „fordítás + kiesés" eset, és minden meccsnél:
     1. a lefújás lefut: S.playing hamis, a lefújás utáni lánc elindul;
     2. a fordítás-esetben nincs meccs embere, és nincs oldalhiba;
     3. az eset tényleg előállt (különben a próba nem bizonyít).
   Használat: node tools/forditas-kieses-3-9-311-proba.js   (MROOT=… másik mappára) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9311;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
const MAX=+(process.env.MAX||40);
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e.stack||e).split("\n").slice(0,2).join(" ")));
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_match_speed","3");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1000);
  const fej=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[2];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    $("mpEntry").classList.add("hide");
    phase="season";S.seasonClosed=true;S.seasonNumber=1;S.idx=30;S.finalTable=[{you:true,n:"x"}];
    setMatchSpeed(3);try{teachSetMode("off");}catch(e){}
    mevAnimBe=()=>false;window.saveGame=()=>{};
    friendlyCupStart(true);
    /* előre a negyeddöntő visszavágójáig — az első meccs 0:4 */
    let n=0;
    while(S.euro&&!(S.euro.stage==="qf"&&S.euro.idx===1)&&n<20){
      if(S.euro.stage==="qf"&&S.euro.idx===0)euroFinishUserMatch(0,4);else euroFinishUserMatch(3,0);
      euroAfterUserMatch();n++;}
    window._pillanat=JSON.stringify(S.euro);
    /* a lefújás utáni lánc itt nem kell — csak az, hogy elinduljon */
    window._lanc=0;utoLancIndit=function(){window._lanc++;};
    window._sorok=[];const al=addLine;addLine=function(t){try{window._sorok.push(String(t).replace(/<[^>]+>/g,""));}catch(e){}return al.apply(this,arguments);};
    return S.euro?`${S.euro.comp} ${S.euro.stage}/${S.euro.idx}`:"nincs kupa";});
  console.log("  felállás: "+fej);

  const meccs=async()=>{
    await p.evaluate(()=>{
      S.euro=JSON.parse(window._pillanat);mEloTorol();S.utoMeccs=null;_utoTartas=false;S.playing=false;
      window._lanc=0;window._sorok=[];
      document.querySelectorAll("section").forEach(x=>x.classList.add("hide"));showEuroScreen();});
    /* a kezdőrúgás a valódi úton: „Irány a meccs" → „Felkészülés" → „Kezdőrúgás".
       A gomb felirata dönti el, mi a következő lépés — egy átmenet közben
       elnyelt kattintás így nem akasztja meg a próbát. */
    await p.evaluate(()=>{const x=$("euroKickBtn");if(x)x.click();});await p.waitForTimeout(300);
    for(let k=0;k<12;k++){
      const all=await p.evaluate(()=>{
        if(S.playing||window._sorok.some(t=>/^VÉGE/.test(t)))return "fut";
        const kb=$("kickBtn");if(kb&&!kb.disabled)kb.click();
        return kb?kb.textContent:"-";});
      if(all==="fut")break;
      await p.waitForTimeout(350);}
    const t0=Date.now();let r;
    while(Date.now()-t0<45000){
      await p.waitForTimeout(300);
      r=await p.evaluate(()=>{const S_=window._sorok;
        return {playing:S.playing,lanc:window._lanc,vege:S_.some(t=>/^VÉGE/.test(t)),
          ford:S_.some(t=>/Fordítás!/.test(t)),kiesett:S_.some(t=>/párharc elveszett/.test(t)),
          mvp:S_.some(t=>/A meccs embere:/.test(t)),eredm:(S_.find(t=>/^VÉGE/.test(t))||"").slice(-5)};});
      if(r.vege&&(!r.playing||Date.now()-t0>8000)){await p.waitForTimeout(400);break;}}
    return Object.assign(r,await p.evaluate(()=>({playing:S.playing,lanc:window._lanc})));};

  let eset=0,db=0;const rossz=[],esetek=[];
  for(let i=0;i<MAX&&eset<2;i++){
    const e0=errs.length;
    const r=await meccs();db++;
    const uj=errs.slice(e0);
    const jo=r.vege&&!r.playing&&r.lanc===1&&uj.length===0;
    if(!jo)rossz.push({i,...r,hiba:uj[0]||null});
    if(r.ford&&r.kiesett){eset++;esetek.push({i,eredm:r.eredm,jo,mvp:r.mvp,hiba:uj[0]||null});}
    if(!jo)break;}   /* egy beragadt lefújás után a lap állapota már nem tiszta */
  console.log(`  ${db} visszavágó, ebből ${eset} „fordítás + kiesés"`);
  ok(eset>=1,"előállt a „fordítás, mégis kiesés” eset (a próba csak így bizonyít)",{db,eset});
  ok(esetek.length>0&&esetek.every(x=>x.jo&&!x.mvp),"a fordítás-esetben a lefújás lefut, a lánc elindul, nincs meccs embere és nincs hiba",esetek);
  ok(rossz.length===0,"minden visszavágónál lefut a lefújás és elindul a lánc",rossz.slice(0,3));
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
