/* 🟥 A KIÁLLÍTÁS-TERV ÉS A RITKÁBB SAJÁT PIROS (3.9.224)

   A fejlesztő terve (élesítve a mérés után): a kiállítás ára 3,0; a tízfős
   oldal ellen a 30. perctől +15%, a 85. perctől +25%; kiállítás után ×2
   különleges esemény; −10% lap. Mellé: „a saját csapat kapjon kevesebb
   pirosat, […] a panzer lapesélyei jelentősebben növekedjenek a
   képességekkel". A statisztikai mérés: tools/meccsmotor/kiallitas-terv.js.

   Amit mér:
     1. a KIALL_TERV alapból a javaslat, a SAJAT_PIROS él;
     2. a fáradás: a 30. perc előtt 1, utána 1,15, a 85. perctől 1,25; a
        kiállítás nélküli oldal ellen 1;
     3. a kiállítás ára és a lap-szorzó;
     4. a Panzer Vadhajtások: +100 / +200 / +320% piroslap-esély;
     5. nincs oldalhiba. (A párharc ugyanezt a szabályt kapja: a
        pillanatkép ára és lapjai, a h2hSimulate fáradása és a sárgás
        óvatossága — a pvp-parharc-rendszerek próba futtatja.) */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9465;
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
    ki.terv=JSON.stringify(KIALL_TERV)===JSON.stringify(KIALL_TERV_JAVASLAT);
    ki.sp=SAJAT_PIROS;
    ki.far=[kiallFaradas(null,90),kiallFaradas(30,55),kiallFaradas(30,65),kiallFaradas(30,80),kiallFaradas(60,90),kiallFaradas(80,90)];
    ki.ar=kiallArMult();ki.lap=kiallLapMult();
    const vh=(STYLE_TRAITS.panzer||[]).find(t=>t.key==="vadhajtasok");
    ki.vh=vh?vh.lv.map(l=>l.fx.redMult):null;
    return ki;});
  ok(r.terv&&r.sp.kozv===0.6&&r.sp.sargaUtan===0.4,"a KIALL_TERV alapból a javaslat, a SAJAT_PIROS él",{terv:r.terv,sp:r.sp});
  ok(JSON.stringify(r.far)===JSON.stringify([1,1,1.15,1.15,1.25,1.25]),"a fáradás: 30 percig 1, utána 1,15, a 85. perctől 1,25; kiállítás nélkül 1",r.far);
  ok(Math.abs(r.ar-1.2)<1e-9&&Math.abs(r.lap-0.9)<1e-9,"a kiállítás ára 3,0 (×1,2), a lapok −10%",{ar:r.ar,lap:r.lap});
  ok(JSON.stringify(r.vh)==="[2,3,4.2]","a Panzer Vadhajtások: +100 / +200 / +320% piroslap-esély",r.vh);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
