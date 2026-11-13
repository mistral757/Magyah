/* 🏆 1.0.9.0.00 — A NEMZETKÖZI KUPÁK PADLÓJA AZ ÉLVONAL.
   BEJELENTÉS: „Premier league ereje 109, a BL 102, úgy hogy első szezonom,
   NBI-ben. Ez így irreálisan könnyű."
   Amit mér:
     1. D3-as, első idényes karrier: a KK mezőnye (⚡, a pályán) = a létra D1
        sora +2; OJK −1, KONF −4; HSZ = a saját osztály −1 (D2) +2 — és mind erősebb, mint a hozzád mért régi;
     2. a hazai kupák (MK, FA) és a felkészülési kupa nem változnak;
     3. túlnőtt keret (jóval a D1 fölött): a padló nem szól bele, a régi
        hozzád mért szabály marad;
     4. egy valódi kupaindulás (startEuroCampaign, KK): a célérték a padló, a
        kupa-képernyő kiírja az élvonal-padlót;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9171;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof cupPadloFor==="function",null,{timeout:15000});
  const r=await p.evaluate(()=>{
    const ki={};
    try{localStorage.clear();}catch(e){}
    gameMode="career";window.mgmtNyit=()=>false;
    enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      sl.player={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.fit=1;});
    if(!scout)scout=generateScout();
    phase="season";S.idx=30;
    ki.div=pyrMyDivId();ki.top=pyrTopId();
    /* a csapat a saját osztálya szintjén: a meccs-erő ≈ a mezőny most */
    const _tms=teamMatchStrength;
    const allit=cel=>{const v=cel;window.teamMatchStrength=()=>v;teamMatchStrength=window.teamMatchStrength;};
    const sajat=oppMatchStrength();
    allit(sajat+2);
    let k=0;try{k=Math.max(0,seasonHiddenBonus()*OPP_BUFF_MEASURED);}catch(e){}
    ki.kieg=k;ki.d1=cupD1MostMs();ki.sajat=sajat;
    /* a létra D1 sora (a felületről) */
    const lad=document.createElement("div");lad.innerHTML=pyrLadderHtml();
    const sor=[...lad.querySelectorAll(".pyrRung")].find(x=>x.querySelector(".n").textContent==="D"+ki.top);
    ki.lada=sor?parseFloat(sor.querySelector("b").textContent.replace(",",".")):null;
    /* HSZ: a saját osztály fölötti (D2) sor */
    const sor2=[...lad.querySelectorAll(".pyrRung")].find(x=>x.querySelector(".n").textContent==="D"+(ki.div-1));
    ki.lada2=sor2?parseFloat(sor2.querySelector("b").textContent.replace(",",".")):null;
    ki.d2=cupDivMostMs(ki.div-1);
    /* a csúcs fölötti, még nem létező osztály: a legfelső + egy lépcső */
    const T=pyrDivs().find(x=>x.id===pyrTopId());
    ki.d0=cupDivMostMs(pyrTopId()-1);
    ki.d0vart=oppMatchStrength(T.mean+pyrLepcso()+pyrAiRate(T.id)*(S.idx||0)/30+pyrVilagEmeles());
    const ms=c=>{const m=euroMidRating(c)+((EURO_COMPS[c]&&EURO_COMPS[c].oppDelta)||0);return {t:m,ms:Math.round((m+k)*10)/10,last:_cupLast&&_cupLast.comp===c?{rel:_cupLast.rel,aktiv:_cupLast.aktiv}:null};};
    ki.lent={};["BL","HSZ","EL","KL","MK","FA","NYK"].forEach(c=>{if(EURO_COMPS[c])ki.lent[c]=ms(c);});
    /* 3. túlnőtt keret: 30 ponttal a D1 fölött */
    allit(ki.d1+30);
    ki.fent={};["BL","EL","KL"].forEach(c=>{ki.fent[c]=ms(c);});
    /* 4. valódi kupaindulás */
    allit(sajat+2);
    S.euroCurrent="BL";S.euroOptOut=false;
    try{startEuroCampaign({});}catch(e){ki.startErr=String(e&&e.stack||e);}
    ki.euro=S.euro?{target:S.euro.target,padlo:!!S.euro.cupPadlo,stage:S.euro.stage}:null;
    try{const h=euroFieldHtml(S.euro,EURO_COMPS.BL);ki.html=h.replace(/<[^>]+>/g,"").slice(0,400);}catch(e){ki.html="HIBA "+e;}
    teamMatchStrength=_tms;
    return ki;});
  console.log(JSON.stringify({div:r.div,top:r.top,d1:r.d1,lada:r.lada,sajat:r.sajat,kieg:r.kieg}));
  console.log("lent:",JSON.stringify(r.lent));console.log("fent:",JSON.stringify(r.fent));
  const near=(a,b,t)=>Math.abs(a-b)<=(t||0.6);
  ok(r.div===3,"D3-as karrier",r.div);
  ok(r.lada!=null&&near(r.lada,r.d1,0.1),"a padló alapja = a létra D1 sora",{lada:r.lada,d1:r.d1});
  ok(near(r.lent.BL.ms,r.d1+2)&&r.lent.BL.last.aktiv,"1. KK = D1 + 2 (⚡, a pályán)",{kk:r.lent.BL.ms,d1:r.d1});
  ok(r.lada2!=null&&near(r.lada2,r.d2,0.1),"1. a HSZ-padló alapja = a létra D2 sora (a saját osztályod −1)",{lada2:r.lada2,d2:r.d2});
  ok(r.lent.HSZ&&near(r.lent.HSZ.ms,r.d2+2),"1. HSZ = a saját osztály fölötti (D2) + 2",{hsz:r.lent.HSZ,d2:r.d2});
  ok(r.d0!=null&&near(r.d0,r.d0vart,0.01)&&r.d0>r.d1,"1. a csúcson: a fölötte nyíló osztály (D0) = a legfelső + egy lépcső",{d0:r.d0,vart:r.d0vart,d1:r.d1});
  ok(near(r.lent.EL.ms,r.d1-1),"1. OJK = D1 − 1",r.lent.EL);
  ok(near(r.lent.KL.ms,r.d1-4),"1. KONF = D1 − 4",r.lent.KL);
  ok(r.lent.BL.ms>r.lent.EL.ms&&r.lent.EL.ms>r.lent.KL.ms,"1. a rangsor: KK > OJK > KONF");
  ok(r.lent.BL.ms>r.d1,"1. a KK erősebb az élvonalnál",{kk:r.lent.BL.ms,d1:r.d1});
  ok(!r.lent.MK.last||r.lent.MK.last.aktiv===false,"2. a hazai kupa (MK) padló nélkül",r.lent.MK);
  ok(!r.lent.FA||!r.lent.FA.last||r.lent.FA.last.aktiv===false,"2. a hazai kupa (FA) padló nélkül",r.lent.FA);
  ok(["BL","EL","KL"].every(c=>r.fent[c].last&&r.fent[c].last.aktiv===false&&r.fent[c].t===r.fent[c].last.rel),"3. túlnőtt keretnél a régi, hozzád mért mérce marad",r.fent);
  ok(r.fent.BL.ms>r.d1+20,"3. …és az a D1 fölött van (a kupa ott sem könnyű)",r.fent.BL);
  ok(!r.startErr&&r.euro&&r.euro.padlo&&near(r.euro.target+r.kieg,r.d1+2),"4. valódi KK-indulás: a célérték a padló",{e:r.euro,err:r.startErr});
  ok(/élvonal/.test(r.html||"")&&/padlója/.test(r.html||""),"4. a kupa-képernyő kiírja az élvonal-padlót",r.html);
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);
})();
