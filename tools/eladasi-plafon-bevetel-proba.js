/* 💰 AZ ELADÁSI PLAFON MÉRCÉJE: A VALÓDI BEVÉTEL (3.9.251)

   BEJELENTÉS: „Amikor indult a szezon, volt kb 5 játékosom, akiknek 80
   milliárd körüli azonnali ára volt […] a 8. héten már csak 16 milliárd
   körüli az azonnali áruk, pedig játszottak is."
   Az ok a 3.9.240-es plafon mércéje volt (csak a működési keret). Amit mér:
   a bejelentett ár a régi mércével zsugorodott, az újjal érintetlen; a mérce
   összetétele; az eladás nem emeli; a sztár-eladás továbbra is plafonos; az
   idei ütem; az 1. idény; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9477;
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
    S.ledger=null;S.seasonNumber=2;S.idx=8;_saleCoreMemo=null;
    const core=seasonBudgetCore();
    ki.core=Math.round(core);
    ki.T0=Math.round(saleSoftT());
    /* a bejelentett eset: 80 Mrd azonnali ár = 160 000 pont kikiáltási ár */
    const v=160000;
    ki.regi=saleSoftCap(v);
    /* a tavalyi idény valódi bevétele (a társ naplójából: lelátó, kupadíj, jutalom, keret) */
    const L=ledgerState();
    L.rows[1]={season:1,open:0,cats:{season:3477,fans:452980,prize:211122,reward:32902,sale:55473},nStar:null};
    _saleCoreMemo=null;
    ki.T1=Math.round(saleSoftT());
    ki.uj=saleSoftCap(v);
    ki.econ=saleEconNow();
    /* a sztár-eladás (mért: 513 315 883) továbbra is plafonos */
    ki.sztar=saleSoftCap(513315883);
    /* az eladás nem emeli a mércét */
    L.rows[1].cats.sale=5e8;_saleCoreMemo=null;ki.eladasNemSzamit=Math.round(saleSoftT())===ki.T1;
    /* idei ütem: 8 forduló után vetít, előtte nem */
    L.rows[1]={season:1,open:0,cats:{season:3000},nStar:null};
    L.rows[2]={season:2,open:0,cats:{fans:80000},nStar:null};
    S.idx=4;_saleCoreMemo=null;ki.korai=Math.round(saleSoftT());
    S.idx=8;_saleCoreMemo=null;ki.utem=Math.round(saleSoftT());
    /* az 1. idényben (nincs tavaly) a régi mérce */
    S.ledger=null;S.seasonNumber=1;S.idx=3;_saleCoreMemo=null;ki.elso=Math.round(saleSoftT())===Math.round(1.5*seasonBudgetCore());
    return ki;});
  console.log(JSON.stringify(r));
  ok(r.regi<r.uj*0.5,"a régi mércével a bejelentett 160 000-es ár a felénél is jobban zsugorodott",[r.regi,160000]);
  ok(r.uj===160000,"a valódi bevétellel mérve a 80 Mrd-os azonnali ár érintetlen",r.uj);
  ok(r.econ===3477+452980+211122+32902,"a mérce: keret + lelátó + kupadíj + jutalom (eladás nélkül)",r.econ);
  ok(r.eladasNemSzamit,"egy nagy eladás nem emeli a saját plafonját");
  ok(r.sztar<r.T1*3&&r.sztar>r.T1,"a kirívó sztár-eladás továbbra is plafonos (~3 idénynyi valódi bevétel)",[r.sztar,r.T1]);
  ok(r.korai<r.utem&&Math.abs(r.utem-1.5*80000*30/8)<2,"az idei ütem 8 forduló után vetít, előtte nem",[r.korai,r.utem]);
  ok(r.elso,"az 1. idényben (nincs még mérleg) a működési keret a mérce");
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
