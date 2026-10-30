/* 👥 A mi statisztáink helyett a mi játékosaink az esemény-animációkban (3.9.337).

   KIMONDOTT KÉRÉS: „Azokban az animációkban, amelyeknél a mi játékosainkat
   statiszták veszik át, azokba építsük be, hogy vagy érintett, vagy random,
   de a mi játékosaink legyenek ott. Pl. gegenpressing nyomás gólja, gólzsák
   gólja, remek kijátszás passza stb."

   Amit mér: gólnál a gólpasszadó a társ; a stáb csupa saját mezőnyjátékos,
   ismétlés nélkül; rögzített mag; letámadásos gólnál elöl játszók; tiki-taka
   passzolója a gólpasszadó; kapott gólnál hátsó sorbeli védő; az ellenfél
   kapusának bravúrjánál saját lövő; üres keretnél a régi helyőrző. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9483;
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
  try{await p.waitForFunction(()=>typeof evaKontextus==="function"&&typeof evaSajatStab==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a jelenet-kontextus függvényei léteznek");
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
     slots.forEach((sl,i)=>{
       if(sl.player)return;
       const src=_k[i%_k.length];
       sl.player={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};});}
    const keret=slots.filter(x=>x.player&&x.pos!=="KP").map(x=>({n:x.player.n,pos:x.pos}));
    const kapus=evaKapusunk();
    ki.keretDb=keret.length;
    const elol=keret.filter(x=>EVA_POSZT_ELOL.indexOf(x.pos)>=0);
    const hatul=keret.filter(x=>["KV","JV","BV"].indexOf(x.pos)>=0);
    const lovo=elol[0].n,passz=keret.find(x=>x.n!==lovo).n;
    const mi=kitForNow();
    const fejOf=(nev,hang)=>evaFig(evaJatekos(nev,"us"),mi,hang).fej;
    const nevek=new Set(keret.map(x=>x.n));
    /* 1. gól gólpasszal */
    const ev1={t:"gol",side:"us",p:lovo,min:23,seq:7,sor:`23'  GÓL! ${shortName(lovo)} (${shortName(passz)})  1:0`};
    const c1=evaKontextus(ev1);
    ki.g1=c1.stab.t;ki.passz=passz;
    ki.g1Passz=c1.stab.t[0]===passz;
    ki.g1Tars=c1.tarsUrl.fej===fejOf(passz,.3);
    ki.g1Mind=c1.stab.t.every(n=>nevek.has(n)&&n!==lovo&&n!==kapus);
    ki.g1Egyedi=new Set(c1.stab.t).size===c1.stab.t.length;
    ki.g1Ujra=JSON.stringify(evaKontextus(ev1).stab)===JSON.stringify(c1.stab);
    ki.g1NemStat=c1.tarsUrl2.fej!==fejOf("Társ2",.3)&&c1.rugoUrl.fej!==fejOf("Rúgó",.2);
    /* 2. letámadásos gól (gólpassz nélkül): a társak a mieink, elöl játszók elöl */
    const ev2={t:"gol",side:"us",p:lovo,min:61,seq:12,alt:"letamadas",sor:`61'  🧲 LETÁMADÁS! ${shortName(lovo)} lecsapott  2:0`};
    const c2=evaKontextus(ev2);
    ki.g2=c2.stab.t;
    ki.g2Elol=c2.stab.t.slice(0,Math.min(2,elol.length-1)).every(n=>elol.some(x=>x.n===n));
    ki.g2Tars=c2.tarsUrl.fej===fejOf(c2.stab.t[0],.3)&&c2.tarsUrl2.fej===fejOf(c2.stab.t[1],.3);
    /* 3. tiki-taka: a passzoló (rúgó) a gólpasszadó */
    const ev3={t:"gol",side:"us",p:lovo,min:70,seq:15,skill:"tikitaka",skillP:lovo,skillN:9,sor:`70'  GÓL! ${shortName(lovo)} (${shortName(passz)})  3:0`};
    const c3=evaKontextus(ev3);
    ki.g3Rugo=c3.rugoUrl.fej===fejOf(passz,.2);
    /* 4. kapott gól: a védőnk a mi hátsó sorunkból */
    const ev4={t:"golKapott",side:"them",p:"Ellenfél csatára",min:80,seq:20};
    const c4=evaKontextus(ev4);
    ki.g4=c4.stab.v;
    ki.g4Hatul=c4.stab.v.length===1&&hatul.some(x=>x.n===c4.stab.v[0]);
    ki.g4Vedo=c4.vedoUrl.fej===evaFig(evaJatekos(c4.stab.v[0],"us"),mi,-.2).fej;
    /* 5. az ellenfél kapusának bravúrja: a mi lövőnk is a mieink közül */
    const ev5={t:"bravur",side:"them",p:"Ellenfél kapusa",min:40,seq:9};
    const c5=evaKontextus(ev5);
    ki.g5=c5.stab.t;
    ki.g5Lo=c5.stab.t.length>0&&c5.loUrl.fej===fejOf(c5.stab.t[0],.4);
    /* 6. üres keretnél a régi helyőrző (nem omlik össze) */
    const _s=slots.map(x=>x.player);slots.forEach(x=>{x.player=null;});
    let ures=null;try{ures=evaKontextus(ev1).stab.t.length;}catch(e){ures="hiba: "+e;}
    slots.forEach((x,i)=>{x.player=_s[i];});
    ki.ures=ures;
    return ki;});
  ok(t.keretDb>=8,"van kezdő tizenegy",t.keretDb);
  ok(t.g1Passz&&t.g1Tars,"gólnál az érintett elöl: a gólpasszadó a társ figurája",{stab:t.g1,passz:t.passz});
  ok(t.g1Mind&&t.g1Egyedi,"a stáb csupa saját mezőnyjátékos: nincs ismétlés, se a gólszerző, se a kapus",t.g1);
  ok(t.g1NemStat,"a társ2 és a rúgó sem helyőrző-statiszta");
  ok(t.g1Ujra,"ugyanaz a jelenet mindig ugyanazokat mutatja (rögzített mag)");
  ok(t.g2Elol&&t.g2Tars,"letámadásos gólnál a társak a mieink, elöl játszók elöl",t.g2);
  ok(t.g3Rugo,"tiki-takánál a passzoló a gólpasszadó");
  ok(t.g4Hatul&&t.g4Vedo,"kapott gólnál a védőnk a hátsó sorunkból",t.g4);
  ok(t.g5Lo,"az ellenfél kapusának bravúrjánál a lövőnk is a mieink közül",t.g5);
  ok(t.ures===0,"üres keretnél a régi helyőrző marad, hiba nélkül",t.ures);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
