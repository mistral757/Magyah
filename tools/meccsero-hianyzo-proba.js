/* ⚡ A MECCSERŐ A PÁLYÁRA LÉPŐ TIZENEGYRŐL (3.9.224)

   BEJELENTÉS (PvP-társ): „Az miért van, hogy 7 meccsből alig volt olyan, amit
   nyertem annak ellenére, hogy mindig én vagyok az erősebb, és többször 3-4
   egységgel?"
   A MÉRÉS (tools/meccsmotor/kijelzes-valos.js) szerint a kiírt ⚡ a sérült /
   eltiltott kezdővel együtt számolt, a motor viszont a pótlásával játszott:
   egy hiányzónál 1,5–2,5, kettőnél 4+ meccserő volt a különbség.

   Amit mér:
     1. hiányzó nélkül a ⚡ betűre a régi (teamStrength + rejtett tagok);
     2. egy sérült kezdővel a ⚡ a PÓTLÁSSAL számol — pontosan annyi, amennyi
        a valódi pótlási réteg felépítése után (S.subs) lenne;
     3. a próba-felépítés nem hagy nyomot (S.subs üres marad);
     4. ha a KAPITÁNY hiányzik, a rutin-bónusza nem jár (mint a motorban);
     5. a csapaterő-sáv (teamStrengthNow) és a ⚡ ugyanazt a tizenegyet látja;
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9463;
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
  await p.waitForFunction(()=>typeof talKinalat==="function",null,{timeout:15000});

  /* a karrier-fixture — ugyanaz, mint a többi talizmán-próbában */
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
    phase="season";S.seasonNumber=1;S.idx=0;S.tal=null;S.talOff=false;
    window._lap=(kat,valt,rang,dobas,spec,x)=>Object.assign({uid:0,kat,valt,rang,dobas:dobas==null?0.5:dobas,spec:spec||null},x||{});
    window._pakli=lapok=>{S.tal=null;const T=talState();T.lapok=lapok.map((L,i)=>Object.assign(L,{uid:i+1}));T.seq=lapok.length+Math.random();
      _talAlapMemo=null;_talSpecMemo=null;_talElMemo=null;};});


  const r=await p.evaluate(()=>{
    const ki={};
    S.unavailable={};S.subs={};S.replacementChoice={};
    ki.regi=teamStrength()+hiddenMatchBonus();
    ki.most=teamMatchStrength();
    /* a legerősebb nem-kapitány kezdő megsérül */
    let best=-1,bv=-1;slots.forEach((sl,i)=>{if(!sl.player||i===captainIdx)return;const v=pOvr(sl.player);if(v>bv){bv=v;best=i;}});
    const nm=slots[best].player.n;
    S.unavailable[nm]={reason:"sérülés",matchesLeft:2};
    ki.hiany=teamMatchStrength();ki.hiany2=teamMatchStrength();
    ki.nyom=Object.keys(S.subs||{}).length;
    buildMatchSubs();
    ki.valodi=teamStrengthNow()+hiddenMatchBonus();
    ki.sav=teamStrengthNow();
    ki.matchWith=teamMatchStrength();
    S.subs={};
    /* a kapitány hiányzik: a rutin-bónusz nem jár */
    delete S.unavailable[nm];
    const cp=slots[captainIdx].player;
    const capBonus=captainAgeExpBonus(cp.age)*0.15;
    const h0=hiddenMatchBonus();
    S.unavailable[cp.n]={reason:"eltiltás",matchesLeft:1};
    const h1=hiddenMatchBonus();
    ki.kap={capBonus,h0,h1,nyom:Object.keys(S.subs||{}).length};
    S.unavailable={};S.subs={};
    return ki;});
  ok(Math.abs(r.regi-r.most)<1e-9,"hiányzó nélkül a ⚡ betűre a régi",r);
  ok(Math.abs(r.hiany-r.regi)>0.05&&r.hiany===r.hiany2,"egy sérült kezdővel a ⚡ a pótlással számol (más szám), és kérdésről kérdésre ugyanaz",{regi:r.regi,hiany:r.hiany,ujra:r.hiany2});
  ok(Math.abs(r.hiany-r.valodi)<1e-9&&Math.abs(r.matchWith-r.valodi)<1e-9,"…pontosan annyi, amennyi a valódi pótlási réteggel",{hiany:r.hiany,valodi:r.valodi});
  ok(r.nyom===0&&r.kap.nyom===0,"a próba-felépítés nem hagy nyomot (S.subs üres)");
  ok(r.kap.capBonus<=0||r.kap.h0-r.kap.h1>=r.kap.capBonus-1e-9,"a hiányzó kapitány rutin-bónusza nem jár",r.kap);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
