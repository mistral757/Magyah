/* 🎰 A SKILL-PÖRGETÉS A MECCS UTÁNI LÁNCBAN (3.9.223).

   HIBA: „Érzésem szerint elromlott a skill pörgetős animáció" — a lefújás
   utáni jutalom-lánc (3.9.171) rögzített véletlennel futtatja az időzítőket,
   de a setInterval minden tickje UGYANAZT a kulcsot kapta, így a pörgetés
   végig egyetlen néven állt.

   Amit mér:
     1. a láncon belül a pörgetés legalább 4 különböző nevet mutat;
     2. ugyanazzal a maggal kétszer futtatva betűre ugyanaz a sorozat és a
        kimenet (a lánc újratöltés utáni folytatása így is ugyanaz marad);
     3. a láncon kívül is pörög; nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9393;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error")errs.push(m.text());});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof grantSkillDecide==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi próbában */
  await p.evaluate(()=>{
    gameMode="career";
    enterCareerSetupFromHome(true);
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};
    S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{
      if(sl.player)return;
      const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
      sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr};
      const e=careerPool[sl.player.n];if(!e.pos)e.pos=sl.player.pos.slice();if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;});
  const fut=(lanc)=>p.evaluate(async(lanc)=>{
    const sk=MAIN_SKILLS[0];S.skillReal=false;
    $("skillSpinName").textContent="?";
    if(lanc)_uto={seed:"12345",n:0};
    let kesz=null;
    const go=()=>grantSkillDecide(sk,"challenge",3,()=>{},1,null,false);
    if(lanc)utoLepes(go);else go();
    const s=[];
    for(let i=0;i<40&&$("skillSpinBtn").classList.contains("hide")===false;i++){
      await new Promise(r=>setTimeout(r,35));s.push($("skillSpinName").textContent);}
    kesz=$("skillSpinName").textContent;
    _uto=null;$("scSkill").classList.add("hide");skillResumeCb=null;
    const nevek=[...new Set(s.filter(x=>x!=="?"&&!/\(\d+\/\d+\)$/.test(x)))];
    return {nevek,kesz,sor:nevek.join("|")};},lanc);
  const a=await fut(true),b2=await fut(true),c=await fut(false);
  ok(a.nevek.length>=4,"a láncon belül pörög (legalább 4 különböző név)",a.nevek);
  ok(a.sor===b2.sor&&a.kesz===b2.kesz,"ugyanazzal a maggal ugyanaz a sorozat és a kimenet",{a:a.sor,b:b2.sor});
  ok(c.nevek.length>=4,"a láncon kívül is pörög",c.nevek.length);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
