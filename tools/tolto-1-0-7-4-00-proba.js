/* ⚽ 1.0.7.4.00 — A DEKÁZÓ TÖLTŐ ÉS A GYORSABB MENTÉS.
   Amit mér:
     1. a HUB-gombra (valódi kattintás) beugrik a töltő, a kezelő pontosan
        egyszer fut, a töltő legalább 1 mp, a HUB megnyílik, az idő tanulva;
     2. a tanulás: egy ismeretlen lassú gomb első kattintása mérve, a másodikra
        töltő jön; a töltő alatt más koppintás elnyelődik; gyors gombon nincs töltő;
     3. a kivételek (fájlválasztó, hang, kezdőrúgás, végigjátszás) és a beágyazás;
     4. a változatlan mentés nem tömörít újra; a gyorsított tömörítő hibátlan;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=+process.env.PORT||9439;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
let HTMLSRC=null;   /* a 6. lépésben a beépített másolatot szolgáljuk ki */
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/index.html"&&HTMLSRC){rp.setHeader("content-type",TYPES[".html"]);rp.end(HTMLSRC);return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,400):""));if(!c)hiba++;};
const karrier=()=>{
  window.mgmtNyit=()=>false;
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
  slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
    const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
  if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
  phase="season";S.seasonClosed=false;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  let p=await ctx.newPage();
  const errs=[];const figyel=pg=>{pg.on("pageerror",e=>errs.push(String(e)));
    pg.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});};
  figyel(p);
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof toltoFut==="function"&&typeof cupLapTorles==="function",null,{timeout:15000});


  await p.evaluate(karrier=>{
    try{localStorage.clear();}catch(e){}
    (0,eval)("("+karrier+")")();
    ["mpEntry"].forEach(id=>{const e=$(id);if(e)e.classList.add("hide");});
    $("scSim").classList.remove("hide");$("matchHubBtn").classList.remove("hide");
    /* a HUB-gomb kezelője: számláljuk, hányszor fut */
    const orig=$("matchHubBtn").onclick;window.__hub=0;
    $("matchHubBtn").onclick=function(ev){window.__hub++;return orig.call(this,ev);};
    /* két próbagomb: egy lassú (300 ms) és egy gyors */
    const mk=(id,ms)=>{const b=document.createElement("button");b.id=id;b.textContent=id;b.style.cssText="position:fixed;left:10px;top:"+(id==="probaLassu"?10:60)+"px;z-index:9000";
      window["__"+id]=0;b.onclick=()=>{window["__"+id]++;const t=performance.now();while(performance.now()-t<ms){}};document.body.appendChild(b);};
    mk("probaLassu",320);mk("probaGyors",5);},String(karrier));
  const allapot=()=>p.evaluate(()=>{const o=document.getElementById("toltoRet");
    return {be:!!(o&&o.classList.contains("be")),hub:window.__hub,lassu:window.__probaLassu,gyors:window.__probaGyors,ms:toltoMsAll()};});
  const varjVege=async()=>{const t=Date.now();await p.waitForFunction(()=>{const o=document.getElementById("toltoRet");return !_toltoAktiv&&(!o||!o.classList.contains("be")||getComputedStyle(o).opacity==="0");},null,{timeout:8000}).catch(()=>{});return Date.now()-t;};
  console.log("— 1. a HUB-gomb —");
  const t0=Date.now();
  await p.click("#matchHubBtn");
  await p.waitForTimeout(60);
  const a1=await allapot();
  ok(a1.be,"valódi kattintásra beugrik a töltő",a1);
  const tartott=(await varjVege())+60;
  await p.waitForTimeout(300);
  const a2=await allapot();
  ok(a2.hub===1,"a gomb kezelője pontosan egyszer fut",a2.hub);
  ok(tartott>=950,"a töltő legalább 1 mp-ig látszik",tartott);
  ok(!(await p.evaluate(()=>$("scHub").classList.contains("hide"))),"a HUB megnyílt");
  ok(Object.keys(a2.ms).some(k=>/^matchHubBtn\|/.test(k)),"a gomb ideje tanulva (mozgó átlag)",a2.ms);
  console.log("\n— 2. a tanulás —");
  await p.evaluate(()=>{$("scHub").classList.add("hide");});
  await p.click("#probaLassu");await p.waitForTimeout(80);
  const b1=await allapot();
  await varjVege();await p.waitForTimeout(200);
  const b1b=await allapot();
  const kl=Object.keys(b1b.ms).find(k=>/^probaLassu\|/.test(k));
  ok(!b1.be&&b1b.lassu===1&&kl&&b1b.ms[kl]>200,"egy ismeretlen lassú gomb első kattintása: nincs töltő, de mérve (>200 ms)",{be:b1.be,ms:b1b.ms[kl]});
  await p.click("#probaLassu");await p.waitForTimeout(60);
  const b2=await allapot();
  /* a töltő alatt egy újabb koppintás elnyelődik */
  await p.click("#probaGyors",{force:true}).catch(()=>{});
  await varjVege();await p.waitForTimeout(200);
  const b3=await allapot();
  ok(b2.be&&b3.lassu===2,"a második kattintásra már a töltő jön, és a kezelő egyszer fut",{be:b2.be,lassu:b3.lassu});
  ok(b3.gyors===0,"a töltő alatt egy másik gomb koppintása elnyelődik",b3.gyors);
  await p.click("#probaGyors");await p.waitForTimeout(80);
  const c1=await allapot();await p.waitForTimeout(150);
  const kg=Object.keys((await allapot()).ms).find(k=>/^probaGyors\|/.test(k));
  ok(!c1.be&&c1.gyors===1&&kg,"egy gyors gomb: nincs töltő, csak mérés",{be:c1.be,ms:kg&&(await allapot()).ms[kg]});
  console.log("\n— 3. kivételek —");
  const tilt=await p.evaluate(()=>["storeImpBtn","hangToggle","kickBtn","autoBtn"].every(id=>TOLTO_TILT.test(id)));
  ok(tilt,"a fájlválasztó, a hang, a kezdőrúgás és a végigjátszás nem kerül töltő alá");
  const nested=await p.evaluate(()=>{let n=0;_toltoAktiv=true;toltoFut(()=>{n++;});_toltoAktiv=false;return n;});
  ok(nested===1,"egy töltő alatti újabb toltoFut azonnal fut (nincs második töltő)",nested);
  console.log("\n— 4. a változatlan mentés —");
  const m=await p.evaluate(()=>{let n=0;const orig=window.mzPack;window.mzPack=function(x){n++;return orig(x);};
    const j=JSON.stringify({x:"y".repeat(6000),t:1});
    saveWrite("probaKulcs",j);const n1=n;saveWrite("probaKulcs",j);const n2=n;saveWrite("probaKulcs",j.replace("1}","2}"));const n3=n;
    window.mzPack=orig;const vissza=saveRawParse(localStorage.getItem("probaKulcs"));localStorage.removeItem("probaKulcs");
    return {n1,n2,n3,ok:vissza&&vissza.t===2};});
  ok(m.n1===1&&m.n2===1&&m.n3===2&&m.ok,"a változatlan mentés nem tömörít újra; a változott igen, és visszaolvasható",m);
  const kod=await p.evaluate(()=>{let bad=0;let seed=9;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
    for(let t=0;t<120;t++){let s="";const n=Math.floor(rnd()*30000);for(let i=0;i<n;i++){const q=rnd();
      if(q<0.06&&s.length>10){const st=Math.floor(rnd()*s.length);s+=s.substr(st,Math.floor(rnd()*5000));}
      else if(q<0.1)s+=String.fromCharCode(Math.floor(rnd()*65536));else s+="abc{}\":,01"[Math.floor(rnd()*10)];}
      if(mzUnpack(mzPack(s))!==s)bad++;}
    return bad;});
  ok(kod===0,"a gyorsított tömörítő 120 véletlen szövegen hibátlan (hosszú ismétlődéssel, 1 MB-os ablakkal is)",kod);
  console.log("\n— 5. —");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
