/* 🧭 1.0.11.15.00 — KEZDŐ ÚT, 1. FÁZIS (BELÉPÉS) + DINAMIKUS MÓD KI + KÖLTÉS-FIGYELMEZTETÉS
   KÉRÉS: „Egyelőre a dinamikus módot vegyük ki a választható játékmódok közül
   […] Amikor játékot indítasz nem is kell utána semmi felület, egyből a
   hagyományos módon belüli első kijelző jöhet. […] Költés figyelmeztetés
   minden módban legyen. Amint túl kevés tartalékod marad, vagy éppen túl
   magasra nősz a mezőny fölé (várható győzelmi esély a következő ellenfél
   ellen meghaladja a 85%-ot)." + docs/kezdo-ut-roadmap.md 5. fejezet.
   Amit mér:
     1. a „Karrier indítása" egyenesen a hagyományos karrier gyors indítójára
        visz (nincs módválasztó), a dinamikus mód sehol nem választható;
     2. „Mennyire ismered a játékot?": az alap „Most kezdem" → 2. fokozat,
        teljes vezetés, 2 lépéses beállítás; „Játszottam már" → 4. fokozat,
        3 lépés; mind a 10 fokozat választható, mindegyiknél „kinek ajánlott";
     3. kezdőként a 7+ fokozat indítás előtt megerősítést kér;
     4. a drafton „Az edző tippje" csak „Most kezdem" módban;
     5. az osztályválasztón minden nyitott osztálynál ott a tanács, a D3-nál
        az első karrieres ajánlás;
     6. a költés-figyelmeztetés: kevés tartaléknál a HUB-ban és a megerősítő
        ablakban; 85% fölötti győzelmi esélynél erősítő költésre; bőséges
        tartaléknál és gyengébb csapatnál hallgat; a stadionbővítés is kérdez;
     7. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9273;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
  const errs=[];
  const uj=async()=>{const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
    p.on("pageerror",e=>errs.push(String(e)));
    await p.addInitScript(()=>{window.HANG_TESZT=true;});
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);return p;};
  const indit=async p=>{
    await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
    await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
    await p.waitForTimeout(2500);};
  /* ---- 1–4: az új játékos útja ---- */
  {const p=await uj();
   const d0=await p.evaluate(()=>({heDyn:document.getElementById("heWayDyn").classList.contains("hide"),
     modeDyn:document.getElementById("modeCareerDynBtn").classList.contains("hide")}));
   await indit(p);
   const v=await p.evaluate(()=>{const l=id=>{const e=document.getElementById(id);return !!(e&&!e.classList.contains("hide")&&e.offsetParent);};
     return {mode:l("scModeSelect"),quick:l("scQuick"),pyr:pyrWanted,qkMode:l("qkModeGrid"),
       mpDyn:kaOpts({mpMode:true}).find(x=>x.v==="dyn").off};});
   ok(!v.mode&&v.quick&&v.pyr&&!v.qkMode&&d0.heDyn&&d0.modeDyn&&v.mpDyn,"1. „Karrier indítása” → egyenesen a hagyományos karrier indítója; a dinamikus mód sehol nem választható",Object.assign(v,d0));
   const k=await p.evaluate(()=>({tudas:kutTudas(),nf:pyrPickFok&&pyrPickFok.nf,vez:guideWantedMode,
     lepes:[...document.querySelectorAll("#qkSteps [data-qkl]")].length,
     zart:[...document.querySelectorAll("#qkDiff .nfSub")].filter(b=>b.disabled&&!/^10\.(6|7|8|9)/.test(b.dataset.fok||"")&&!/^10\.\d\d/.test(b.dataset.fok||"")).length,
     kinek:document.querySelectorAll("#qkDiff .nfKinek").length,
     ajanlott:[...document.querySelectorAll("#qkDiff summary")].filter(x=>/ajánlott neked/.test(x.textContent)).map(x=>x.textContent.trim().slice(0,12))}));
   ok(k.tudas==="kezdo"&&k.nf===2&&k.vez==="hard"&&k.lepes===2&&k.zart===0&&k.kinek===10&&k.ajanlott.length===1&&/2\./.test(k.ajanlott[0]),
     "2a. „Most kezdem” (alap): 2. fokozat, teljes vezetés, 2 lépés; mind a 10 fokozat nyitva, mindegyiknél „kinek ajánlott”",k);
   await p.evaluate(()=>document.querySelector('#qkTudasGrid [data-tudas="halado"]').click());await p.waitForTimeout(300);
   const h=await p.evaluate(()=>({tudas:kutTudas(),nf:pyrPickFok&&pyrPickFok.nf,vez:guideWantedMode,lepes:[...document.querySelectorAll("#qkSteps [data-qkl]")].length}));
   ok(h.tudas==="halado"&&h.nf===4&&h.vez==="guided"&&h.lepes===3,"2b. „Játszottam már”: 4. fokozat, rövid vezetés, 3 lépés (az Egyéb lap is)",h);
   await p.evaluate(()=>document.querySelector('#qkTudasGrid [data-tudas="kezdo"]').click());await p.waitForTimeout(300);
   /* 3. a 7+ fokozat kezdőként megerősítést kér */
   const m=await p.evaluate(()=>{nfCsomagAlkalmaz(8,1);quickRender();document.getElementById("qkNextBtn").click();
     document.getElementById("qkGoBtn").click();
     const md=document.getElementById("hubTacticConfirmModal");const o={kerdez:!md.classList.contains("hide"),cim:document.getElementById("hubTacticConfirmTitle").textContent};
     md.classList.add("hide");nfCsomagAlkalmaz(2,1);quickRender();return o;});
   ok(m.kerdez&&/Biztosan/.test(m.cim),"3. kezdőként a 8. fokozat indítás előtt megerősítést kér",m);
   /* 4. a draft: az edző tippje */
   await p.evaluate(()=>document.getElementById("qkGoBtn").click());await p.waitForTimeout(2500);
   await p.evaluate(()=>{const b=document.getElementById("scoutSpinBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(2500);
   await p.evaluate(()=>{const b=document.getElementById("scoutNextBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(1500);
   await p.evaluate(()=>{const b=document.getElementById("spinBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(2500);
   const t=await p.evaluate(()=>{const a=document.querySelectorAll("#squadList .kutTipp").length;
     try{localStorage.setItem(KUT_TUDAS_KEY,"halado");}catch(e){}renderSquad();
     const bb=document.querySelectorAll("#squadList .kutTipp").length;
     try{localStorage.setItem(KUT_TUDAS_KEY,"kezdo");}catch(e){}renderSquad();
     return {kezdo:a,halado:bb,guideHorgony:document.getElementById("guideTip").classList.contains("anchored")};});
   ok(t.kezdo===1&&t.halado===0,"4. a drafton „Az edző tippje” egy jelöltnél, csak „Most kezdem” módban (a draft-tipp a listára horgonyoz)",t);
   await p.close();}
  /* ---- 5–6: karrier a HUB-ban ---- */
  {const p=await uj();
   await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
   await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
   await p.waitForLoadState("load");await p.waitForTimeout(2500);
   const div=await p.evaluate(()=>{
     beginNewGame();
     const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
     const _sc=showChemistry;showChemistry=()=>{};
     S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
     pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
     renderPyrDivPick();
     /* a kezdő lépcsőn a D3 kötött: ott a kimondás mellett áll a tanács; szabad karrierben minden gombon */
     const lista=document.getElementById("pyrDivPickList");
     const gombok=[...lista.querySelectorAll("button")].filter(x=>/^D\d/.test(x.textContent.trim()));
     const lepcso=!!lista.querySelector(".unlockLadderPick");
     const o={lepcso,db:gombok.filter(x=>!x.disabled).length,tanacs:gombok.filter(x=>!x.disabled&&/👤/.test(x.textContent)).length,
       d3:lepcso?/Első karrierhez ajánlott/.test(lista.textContent):gombok.some(x=>/^D3/.test(x.textContent.trim())&&/Első karrierhez ajánlott/.test(x.textContent))};
     /* a szabad választás is (a tanács minden nyitott osztálynál) — a lépcső nélkül */
     if(lepcso){const _u=unlockPreset;window.unlockLadderApplyDiv=(()=>{const f=unlockLadderApplyDiv;return ()=>false;})();
       try{unlockPreset=()=>null;}catch(e){}
       renderPyrDivPick();
       const g2=[...lista.querySelectorAll("button")].filter(x=>/^D\d/.test(x.textContent.trim()));
       o.szabadDb=g2.filter(x=>!x.disabled).length;o.szabadTanacs=g2.filter(x=>!x.disabled&&/👤/.test(x.textContent)).length;
       try{unlockPreset=_u;}catch(e){}}
     pyrConfirmDiv();showChemistry=_sc;
     if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
     slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
     slots.forEach(sl=>{if(!sl.player)return;
       if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
       const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
     if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
     startFirstSeason();
     for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
     openHubMidSeason();window.saveGame=()=>{};
     return o;});
   ok(div.d3&&(div.lepcso?(div.szabadDb>=1&&div.szabadTanacs===div.szabadDb):(div.db>=1&&div.tanacs===div.db)),"5. az osztályválasztón a D3-nál az első karrieres ajánlás (a lépcsőn a kimondás mellett is), szabad választásnál minden nyitott osztálynál tanács",div);
   await p.waitForTimeout(1500);
   const k=await p.evaluate(()=>{
     const o={};
     const kusz=koltesKuszob();o.kuszob=kusz;o.gy=koltesGyozEsely();
     S.transferBudget=kusz*20;
     o.boseg=koltesFigyelmeztetesHtml(Math.round(kusz*5),true)==="";
     o.keves=/Kevés tartalék/.test(koltesFigyelmeztetesHtml(Math.round(kusz*19.5),false));
     S.transferBudget=Math.round(kusz*.5);try{renderHub();}catch(e){}
     o.hub=/koltesHub/.test(document.getElementById("hubBudgetChip").innerHTML);
     askConfirm({title:"Teszt",html:"<p>x</p>",koltes:{ar:100,erosit:false},onYes:()=>{}});
     o.ablak=/koltesIntes/.test(document.getElementById("hubTacticConfirmBody").innerHTML);
     document.getElementById("hubTacticConfirmModal").classList.add("hide");
     /* a 85% fölötti esély (a mért esélyt felülírva) */
     const eredeti=window.koltesGyozEsely;S.transferBudget=kusz*20;
     window.koltesGyozEsely=()=>.91;
     o.eros=/91% a győzelmi esélyed/.test(koltesFigyelmeztetesHtml(10,true));
     o.erosNemErosit=koltesFigyelmeztetesHtml(10,false)==="";
     window.koltesGyozEsely=()=>.6;o.gyenge=koltesFigyelmeztetesHtml(10,true)==="";
     window.koltesGyozEsely=eredeti;
     /* a stadionbővítés is kérdez, ha kevés marad */
     S.transferBudget=Math.round(kusz*.5);let fut=false;
     koltesKerdez(100,false,"Bővíted?",()=>{fut=true;});
     o.stadionKerdez=!fut&&!document.getElementById("hubTacticConfirmModal").classList.contains("hide");
     document.getElementById("hubTacticConfirmModal").classList.add("hide");
     S.transferBudget=kusz*20;fut=false;koltesKerdez(100,false,"Bővíted?",()=>{fut=true;});o.stadionMegy=fut;
     return o;});
   ok(k.kuszob>0&&typeof k.gy==="number"&&k.boseg&&k.keves&&k.hub&&k.ablak&&k.eros&&k.erosNemErosit&&k.gyenge&&k.stadionKerdez&&k.stadionMegy,
     "6. költés-figyelmeztetés: kevés tartalék (HUB + megerősítés), 85% fölötti esély erősítésnél; bőség és gyengébb csapat mellett hallgat; a stadion is kérdez",k);
   await p.close();}
  ok(!errs.length,"7. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})().catch(e=>{console.error(e);process.exit(1);});
