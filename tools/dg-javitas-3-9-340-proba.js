/* 🩹 A felfújt 1. idényes rés-változás javítása (3.9.340).

   BEJELENTETT HIBA (saját bajnokság, vendég, 2. idény): „esélytelen
   nehézségen fut, pedig saját célréssel kellett volna" — a rajt-rés −5,8 volt
   a +0,5-ös célrés mellett. Az 1. idény mérés-sora a kalibrálás előtti
   rajt-rést (−5,4) őrizte a kalibrált (+1,5) helyett, így a rés-változás 12,7
   lett ≈5,8 helyett, és a 2. idény rajt-célja 3,45-tel keményebb.

   Amit mér: a javítás a kalibrált rajtból számol; a futó idény mezőnye
   lejjebb kerül; a sor és a rés-követés a helyes becslésre áll; egyszer
   fut; ép karrierhez nem nyúl; a kalibrálás a korábban létrejött sort
   frissíti. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9486;
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
  try{await p.waitForFunction(()=>typeof nfDgJavit==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a javító függvény létezik");
  if(!van){await b.close();srv.close();console.log("\n✗ 1 hiba");process.exit(1);}


  const t=await p.evaluate(()=>{
    const ki={};
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
    {const _k=sq.players.slice();
     slots.forEach((sl,i)=>{if(sl.player)return;const src=_k[i%_k.length];
       sl.player={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};});}
    const P=S.pyr;
    P.padlo=2;P.nf=7;P.nf0=7;P.cel=0.5;
    ki.on=pyrFloorOn();
    saveGame=()=>{};const log=[];addLine=t=>log.push(String(t).replace(/<[^>]+>/g,""));
    /* a bejelentett eset: az 1. idény sora a kalibrálás előtti rajt-rést őrzi */
    P.gap0=1.5;
    P.vallH={1:{g:2,want:2,div:3,lift:0,mid:4.4,done:true,elso:true,nf:7,cel:0.5,utana:-5.4,midDone:true,veg:2.9,dg:12.7}};
    S.seasonNumber=2;S.idx=12;S.seasonClosed=false;
    P.vallH[2]={g:-5.8,want:-5.8,utana:-5.8,done:true,nf:7,cel:0.5,dgBecsles:12.7,kov:{v:1,rajt:-3.6,dgB:12.7,tur:0.5,emel:[],ad:0,g:{}}};
    const g0=levelGap(),l0=pyrLevel();
    ki.ret=nfDgJavit();
    const H=P.vallH;
    ki.dg1=H[1].dg;ki.ut1=H[1].utana;ki.g2=H[2].g;ki.becs=H[2].dgBecsles;ki.kovR=H[2].kov.rajt;ki.kovD=H[2].kov.dgB;
    ki.dGap=Math.round((levelGap()-g0)*10)/10;ki.dLvl=pyrLevel()-l0;
    ki.masodszor=nfDgJavit();ki.log=log.join(" | ");
    /* ép karrier: nincs eltérés → nem nyúl hozzá */
    P.dgJav=0;P.vallH={1:{g:2,want:2,mid:0,done:true,elso:true,utana:1.5,veg:3,dg:1.5}};
    const l1=pyrLevel();ki.ep=nfDgJavit();ki.epLvl=pyrLevel()-l1;ki.epDg=P.vallH[1].dg;
    /* a kalibrálás frissíti a már létrejött 1. idényes sort */
    P.dgJav=0;P.vallH={1:{g:2,want:2,mid:0,done:true,elso:true,utana:-5.4}};S.seasonNumber=1;S.idx=0;
    P.anchored=false;P.gapWant=2;
    let anch=null;try{anch=pyrAnchorAtKickoff();}catch(e){anch="hiba "+e;}
    ki.anch={ret:anch,ut1:P.vallH[1].utana,gap0:P.gap0};
    return ki;});
  ok(t.on,"a padló-rendszer él a próbakarrierben");
  ok(t.ret&&t.dg1===5.8&&t.ut1===1.5,"az 1. idény rés-változása a kalibrált rajtból: +12,7 helyett +5,8",{dg:t.dg1,ut:t.ut1});
  ok(t.dGap>=2.9&&t.dGap<=4.0&&t.dLvl<0,"a futó idény mezőnye annyival lejjebb kerül, amennyivel a rajt-cél keményebb volt (≈3,45)",{dGap:t.dGap,dLvl:t.dLvl});
  ok(Math.abs(t.g2-(-5.8+t.dGap))<0.25&&t.becs===5.8&&t.kovD===5.8&&t.kovR>-3.6,"a futó idény sora és a rés-követés pályája a helyes becslésre áll",{g2:t.g2,becs:t.becs,kovR:t.kovR});
  ok(t.masodszor===null&&/Javítva/.test(t.log),"egyszer fut, és a napló kimondja",t.log.slice(0,160));
  ok(t.ep===null&&t.epLvl===0&&t.epDg===1.5,"ép karrierhez nem nyúl",{ep:t.ep,lvl:t.epLvl});
  ok(t.anch.ut1===t.anch.gap0,"a kezdőrúgás kalibrálása a korábban létrejött 1. idényes sort a kalibrált rajt-résre frissíti",t.anch);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
