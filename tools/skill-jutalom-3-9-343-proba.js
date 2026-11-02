/* 🎖 Skill-jutalom: kész képesség, kategória- és címzett-választás minden módban (3.9.343).

   KIMONDOTT KÉRÉS: „Skill jutalomnál minden játékmódban teljes skillt
   kapjunk, és tényleg lehessen kiválasztani, ki kapja, és lehessen
   választani, melyik kategóriából."

   Amit mér: realisztikus módban is a sorsolt / kategória választó jön; a
   képesség 3/3; a címzettet te választod; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9490;
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
  let van=true;
  try{await p.waitForFunction(()=>typeof grantSkillDecide==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a skill-kapu létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}



  await p.evaluate(()=>{
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const src=_k[i%_k.length];
       sl.player={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};});}
    S.skills={};S.skillReal=true;S.chSkillPickLock=0;
    window._kesz=0;
    const sk=skillDeck().find(x=>eligibleForSkill(x).length>0);window._sk=sk.id;
    ["scHub","scSim","scWindow"].forEach(id=>$(id)&&$(id).classList.add("hide"));
    grantSkillDecide(sk,"match",3,()=>{window._kesz++;},1,null,false);});
  await p.waitForTimeout(300);
  const a=await p.evaluate(()=>{
    const bs=[...$("skillAssignList").querySelectorAll("button")].map(b=>b.textContent);
    return {latszik:!$("scSkill").classList.contains("hide"),bs};});
  ok(a.latszik&&/A sorsolt/.test(a.bs[0]||"")&&a.bs.filter(t=>/képességből/.test(t)).length>=2,"realisztikus módban is: előbb a sorsolt képesség vagy egy kategória",a.bs);
  /* egy kategória választása */
  await p.evaluate(()=>{const b=[...$("skillAssignList").querySelectorAll("button")].find(x=>/képességből/.test(x.textContent));b.click();});
  await p.waitForTimeout(2500);
  const b2=await p.evaluate(()=>({desc:$("skillDesc").textContent,db:$("skillAssignList").querySelectorAll("button,.prow,[data-n]").length,spin:$("skillSpinName").textContent}));
  ok(/KÉSZEN érkezik/.test(b2.desc)&&/\(3\/3\)/.test(b2.spin),"a képesség készen érkezik (3/3)",b2);
  /* az ember kiválasztása */
  const c=await p.evaluate(async()=>{
    const el=$("skillAssignList").querySelector("button,.prow");
    if(el)el.click();
    await new Promise(r=>setTimeout(r,400));
    const y=$("hubTacticConfirmYes");if(y&&!$("hubTacticConfirmModal").classList.contains("hide"))y.click();
    await new Promise(r=>setTimeout(r,400));
    const v=Object.keys(S.skills).map(n=>({n,i:S.skills[n].map(x=>x.stagesCompleted+"/"+x.stagesNeeded)}));
    return {v,kesz:window._kesz};});
  ok(c.v.length===1&&c.v[0].i[0]==="3/3","te választod, ki kapja — és kész képességként kapja meg",c);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
