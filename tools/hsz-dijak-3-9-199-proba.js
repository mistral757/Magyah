/* 💜 3.9.199 — EGYÉNI DÍJAK A HIPER SZUPER KUPÁBAN.

   BEJELENTÉS: „Hiper szuper ligában is legyenek egyéni díjak. 10%kal
   erősebbek, mint a Kupák Kupájának Kupájában. Gólkirály gólpassz király
   kapus"

   Amit mér:
     1. A HÁROM SKILL: a Hiper Aranycipő / Aranypasszok / Aranykesztyű értékei
        a BL-díj +10%-a (a semleges 1-hez / 0-hoz mért többletre), mind csak
        díjként szerezhető; a hírnév- és mérföldkő-súly is a BL +10%-a;
     2. A DÍJOSZTÁS: egy lezárt HSZ-menetelés a saját királyoknak kiosztja a
        hs_ skilleket, a meglévő BL-párt LECSERÉLI (nem halmoz), az idegen
        király nem kap skillt; a díjszámláló nő;
     3. A BL UTÁN: egy későbbi BL-díj nem írja felül a meglévő HSZ-díjat, de
        a számláló (és vele a +3 Rating) nő;
     4. A FELÜLET: a záróképernyő „Hiper Szuper Kupa — egyéni díjak" címmel,
        💜-vel listázza a díjakat; a meccs-kommentár a HSZ-sorokat mondja. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9242;
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
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof euroCampaignEndNow==="function"&&typeof SKILLS!=="undefined",null,{timeout:15000});

  const r=await p.evaluate(()=>{
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
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);if(!(e.pot>0))e.pot=3000;});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];
    phase="season";S.seasonNumber=3;S.idx=10;
    window.saveGame=()=>{};
    const xi=slots.filter(sl=>sl&&sl.player).map(sl=>sl.player);
    /* mezőnyjátékosok, nem a kapitány — a siker-mérés a posztcsoporton belül megy */
    const kapN=slots[captainIdx]&&slots[captainIdx].player?slots[captainIdx].player.n:null;
    const mz=xi.filter(x=>!(x.pos&&x.pos[0]==="KP")&&x.n!==kapN);
    const A=mz[0],B=mz[1],C=mz[2];
    const tiszta=()=>{S.seasonMatches={};S.seasonMinutes={};S.careerStats={};
      Object.values(careerPool).forEach(e=>{if(e){delete e.paySign;e.pot=3000;}});};
    const fx=(P,k)=>{const x=P&&P.f.find(z=>z.k===k);return x?Math.round(x.f*1000)/1000:null;};
    const sk=id=>{const s=SKILLS.find(z=>z.id===id);return s?s.combo.map(c=>c.type+":"+c.val).join(","):null;};
    const ids=n=>(S.skills[n]||[]).map(i=>i.skill&&i.skill.id).filter(Boolean).filter(x=>/golden/.test(x)).sort();
    /* ---- 1. A HÁROM SKILL ---- */
    ki.sk={};
    ["boot","passes","gloves"].forEach(k=>{ki.sk[k]={hs:sk("hs_golden_"+k),bl:sk("bl_golden_"+k),
      nev:(SKILLS.find(z=>z.id==="hs_golden_"+k)||{}).name,cat:(SKILLS.find(z=>z.id==="hs_golden_"+k)||{}).cat};});
    ki.csakDij=["boot","passes","gloves"].every(k=>AWARD_ONLY_SKILL_IDS.has("hs_golden_"+k));
    ki.suly={fame:FAME_AWARD_BASE.HSZ,fameBL:FAME_AWARD_BASE.BL,ms:MS_AWARD_W.HSZ,msBL:MS_AWARD_W.BL};
    /* ---- 2. A DÍJOSZTÁS ---- */
    const kp=xi.find(x=>x.pos&&x.pos[0]==="KP");
    const pA=mz[0],pB=mz[1];
    S.skills=S.skills||{};
    S.skills[pB.n]=[{skill:SKILLS.find(s=>s.id==="bl_golden_passes"),stagesNeeded:1,stagesCompleted:1}];
    S.goldenAwardCount={};
    S.euroCurrent="HSZ";S.euroCurrentQual=null;
    try{startEuroCampaign({skipQual:true});}catch(e){ki.startErr=String(e);}
    const E=S.euro;
    ki.comp=E&&E.comp;
    const sajat=E.teams[E.userIdx].n,idegen=E.teams.find((t,i)=>i!==E.userIdx).n;
    E.stats={scorers:{a:{n:pA.n,g:9,own:true,club:sajat},o:{n:"Idegen Csatár",g:4,own:false,club:idegen}},
      assists:{b:{n:pB.n,a:7,own:true,club:sajat},o:{n:"Idegen Irányító",a:3,own:false,club:idegen}},
      cleanSheets:{k:{n:kp.n,c:6,own:true,club:sajat},o:{n:"Idegen Kapus",c:2,own:false,club:idegen}}};
    E.outAt="final";
    try{euroCampaignEndNow("final");}catch(e){ki.endErr=String(e)+" @ "+String(e.stack).split("\n").slice(1,5).join(" | ");}
    ki.dijak=(E.goldenAwards||[]).map(g=>({l:g.label,n:g.name===pA.n?"A":g.name===pB.n?"B":g.name===kp.n?"K":g.name,own:g.isOwn}));
    ki.kiralyok=(E.ownKings||[]).slice();
    ki.skA=ids(pA.n);ki.skB=ids(pB.n);ki.skK=ids(kp.n);
    ki.szamlalo={A:S.goldenAwardCount[pA.n],B:S.goldenAwardCount[pB.n],K:S.goldenAwardCount[kp.n]};
    /* ---- 4. A FELÜLET ---- */
    try{renderEuroScreen();}catch(e){ki.rendErr=String(e)+" @ "+String(e.stack).split("\n").slice(1,5).join(" | ");}
    const txt=(document.getElementById("euroNext")||{}).textContent||"";
    ki.cimHSZ=txt.includes("Hiper Szuper Kupa — egyéni díjak");
    ki.sorok=["Hiper Aranycipő","Hiper Aranypasszok","Hiper Aranykesztyű"].map(l=>txt.includes("💜 "+l+": "));
    ki.csereSor=txt.includes("a Hiper Aranypasszok lecserélte a korábbi KK-díját!");ki.kapSor=txt.includes("megkapta a Hiper Aranycipő special skillt!");
    ki.kom={boot:goldQuoteFor(pA.n,"hs_golden_boot")||goldQuoteFor(pA.n,"bl_golden_boot"),
      pass:goldQuoteFor(pB.n,"hs_golden_passes")||goldQuoteFor(pB.n,"bl_golden_passes"),
      glove:goldQuoteFor(kp.n,"hs_golden_gloves")||goldQuoteFor(kp.n,"bl_golden_gloves")};
    ki.blKom=goldQuoteFor(pA.n,"bl_golden_boot");
    /* ---- 3. A BL UTÁN ---- */
    S.euro=null;S.euroCurrent="BL";S.euroCurrentQual=null;
    try{startEuroCampaign({skipQual:true});}catch(e){ki.startErr2=String(e);}
    const E2=S.euro;
    const sajat2=E2.teams[E2.userIdx].n,idegen2=E2.teams.find((t,i)=>i!==E2.userIdx).n;
    E2.stats={scorers:{a:{n:pA.n,g:8,own:true,club:sajat2}},assists:{o:{n:"Idegen Irányító",a:5,own:false,club:idegen2}},
      cleanSheets:{k:{n:kp.n,c:4,own:true,club:sajat2}}};
    E2.outAt="sf";
    try{euroCampaignEndNow("out");}catch(e){ki.endErr2=String(e)+" @ "+String(e.stack).split("\n").slice(1,5).join(" | ");}
    ki.bl={dijak:(E2.goldenAwards||[]).map(g=>g.label),skA:ids(pA.n),skB:ids(pB.n),skK:ids(kp.n),
      A:S.goldenAwardCount[pA.n],K:S.goldenAwardCount[kp.n],B:S.goldenAwardCount[pB.n]};
    try{renderEuroScreen();}catch(e){ki.rendErr2=String(e);}
    const txt2=(document.getElementById("euroNext")||{}).textContent||"";
    ki.megtartSor=txt2.includes("megtartotta az erősebb Hiper Aranycipő skillt!")&&!txt2.includes("megkapta az Aranycipő");
    ki.blCim=txt2.includes("Kupa egyéni arany-díjak")&&!txt2.includes("Hiper Szuper Kupa — egyéni díjak")
    ki.verzio=APP_VERSION;
    return ki;});

  console.log("\n— 1. A HÁROM SKILL —");
  ok(!r.startErr&&!r.endErr&&r.comp==="HSZ","a HSZ-menetelés elindul és lezárul",{s:r.startErr,e:r.endErr,c:r.comp});
  ok(r.sk.boot.hs==="goalw:6.5,rating:5.5"&&r.sk.boot.bl==="goalw:6,rating:5","Hiper Aranycipő: gól 6→6,5 · rating 5→5,5",r.sk.boot);
  ok(r.sk.passes.hs==="assistw:6.5,rating:3.3,mvp:1.55"&&r.sk.passes.bl==="assistw:6,rating:3,mvp:1.5","Hiper Aranypasszok: passz 6→6,5 · rating 3→3,3 · MVP 1,5→1,55",r.sk.passes);
  ok(r.sk.gloves.hs==="defense:0.8,aura:2.75"&&r.sk.gloves.bl==="defense:0.82,aura:2.5","Hiper Aranykesztyű: védelem 0,82→0,80 · aura 2,5→2,75",r.sk.gloves);
  ok(r.sk.boot.cat==="CSATAR"&&r.sk.passes.cat==="KOZEPPALYAS"&&r.sk.gloves.cat==="KAPUS"&&/💜 Hiper Aranycipő/.test(r.sk.boot.nev),"a kategóriák és a 💜 név",[r.sk.boot.nev,r.sk.passes.nev,r.sk.gloves.nev]);
  ok(r.csakDij,"mindhárom csak díjként szerezhető (AWARD_ONLY_SKILL_IDS)");
  ok(r.suly.fame===11&&r.suly.fameBL===10&&r.suly.ms===3.3&&r.suly.msBL===3,"hírnév 10→11 · mérföldkő-súly 3→3,3",r.suly);
  console.log("\n— 2. A DÍJOSZTÁS —");
  ok(JSON.stringify(r.dijak)===JSON.stringify([{l:"Hiper Aranycipő",n:"A",own:true},{l:"Hiper Aranypasszok",n:"B",own:true},{l:"Hiper Aranykesztyű",n:"K",own:true}]),"a három király a saját játékos, Hiper-címekkel",r.dijak);
  ok(JSON.stringify(r.kiralyok)===JSON.stringify(["boot","pass","glove"]),"a királyi címek a Run-mérőnek is",r.kiralyok);
  ok(JSON.stringify(r.skA)==='["hs_golden_boot"]'&&JSON.stringify(r.skK)==='["hs_golden_gloves"]',"a gólkirály és a kapus megkapja a Hiper-skillt",{A:r.skA,K:r.skK});
  ok(JSON.stringify(r.skB)==='["hs_golden_passes"]',"a meglévő BL-Aranypasszokat a Hiper-változat LECSERÉLI (nincs halmozás)",r.skB);
  ok(r.szamlalo.A===1&&r.szamlalo.B===1&&r.szamlalo.K===1,"a díjszámláló mindhármuknál 1",r.szamlalo);
  console.log("\n— 3. A BL UTÁN —");
  ok(!r.startErr2&&!r.endErr2,"a BL-menetelés is lezárul",{s:r.startErr2,e:r.endErr2});
  ok(JSON.stringify(r.bl.skA)==='["hs_golden_boot"]'&&JSON.stringify(r.bl.skK)==='["hs_golden_gloves"]',"a BL-díj nem írja felül (és nem halmozza) a meglévő Hiper-díjat",r.bl);
  ok(r.bl.A===2&&r.bl.K===2&&r.bl.B===1,"a számláló nő (2. díj → +3 Rating), az idegen királyé nem a miénk",r.bl);
  ok(r.bl.dijak.join("|")==="Aranycipő|Aranypasszok|Aranykesztyű"&&r.blCim,"a BL a régi címekkel és fejléccel",{d:r.bl.dijak,c:r.blCim});
  ok(r.megtartSor,"a BL-záróképernyő: „megtartotta az erősebb Hiper Aranycipő skillt” (nem „megkapta”)");
  console.log("\n— 4. A FELÜLET —");
  ok(!r.rendErr&&r.cimHSZ&&r.sorok.every(Boolean),"a záróképernyő: „Hiper Szuper Kupa — egyéni díjak”, 💜 sorok",{e:r.rendErr,c:r.cimHSZ,s:r.sorok});
  ok(r.kapSor&&r.csereSor,"a sor a valódi kimenetet mondja: „megkapta…” / „…lecserélte a korábbi KK-díját”",{k:r.kapSor,c:r.csereSor});
  ok(/Hiper Szuper Kupa gólkirálya|lila aranycipő|szuperligában/.test(r.kom.boot||"")&&/Hiper Szuper Kupa gólpassz|Lila arany|legjobb passzolója/.test(r.kom.pass||"")&&/Hiper Szuper Kupa legjobb kapusa|lila kesztyű|legjobbjai ellen/.test(r.kom.glove||""),"a kommentár a Hiper-sorokat mondja",r.kom);
  ok(r.blKom===null,"a lecserélt BL-díj kommentárja már nem jön",r.blKom);
  ok(String(r.verzio).localeCompare("3.9.199",undefined,{numeric:true})>=0,"verzió legalább 3.9.199",r.verzio);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
