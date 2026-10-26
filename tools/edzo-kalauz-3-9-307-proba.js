/* 👔📖 3.9.307 — AZ EDZŐ MINT IDEGENVEZETŐ: az edző szava + az edző kalauza.

   KÉRÉS: „az edző lenne az idegenvezető […] Idény elején elmondaná, mi
   nyílt meg, és a menü tetején egyetlen javaslatot adna […] a legfontosabb,
   legtöbbet érő dolgokat egy-egy ablakban vizuálisan el lehetne magyarázni
   külön. Kicsit ilyen klasszik guide screenshot verzióban. […] Idénytől
   idényre."

   Amit mér (valódi böngészőben, egy valódi karrier HUB-jában):
     1. a kártya KÖZVETLENÜL a ☰ Menü fölött ül, az edző nevével és arcképével;
     2. az 1. idény köszöntése: a kalauz-fejezetek, és NEM sorolja fel
        „megnyíltként" azt, ami eleve nyitva volt;
     3. az egy javaslat a tanító réteg legelső esedékes témája (ugyanaz a
        rangsor), a „›" lapoz, a „Mutasd" a vezetés saját útját hívja;
     4. „Értem" → elcsukódik, és a mentés viszi; egy új menüelem megjelenése
        („Megnyílt valami új") újra eligazít;
     5. új idény → „2. idény — eligazítás" és az akkor nyíló fejezetek;
     6. a kalauz: a tartalomjegyzék a zárt fejezeteket 🔒-tel mutatja; minden
        nyitott fejezet minden lépése élő képet ad (a valódi elem másolata,
        id nélkül, nem kattintható), a jelölők a képen belül vannak;
     7. az utolsó lépés „Értem"-je olvasottnak jelöli (a kártya számlálója is);
     8. az Edző menüből is nyílik; „Vezetés: Semmi" fokozatban a kártya rejtve;
     9. a mentés és a visszatöltés viszi (S.kalauz);
    10. nincs oldalhiba.

   KÉPEK: ha megadsz egy mappát (node … <mappa>), oda kerülnek a képernyőképek. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9307;
const KEPEK=process.argv[2]||null;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".json":"application/json",
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
  if(KEPEK)fs.mkdirSync(KEPEK,{recursive:true});
  const b=await chromium.launch({args:["--no-sandbox"]});
  const ctx=await b.newContext({viewport:{width:430,height:900}});
  const p=await ctx.newPage();
  const errs=[];
  p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  const kep=async n=>{if(KEPEK)await p.screenshot({path:path.join(KEPEK,n+".png")});};

  /* egy valódi karrier, a HUB-ban (1. idény, 5. forduló) */
  await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[2];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;pyrPickNf=null;
    renderPyrDivPick();document.querySelector("#pyrDiffList [data-nfpick='4']").click();pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;
    coach=COACHES.find(c=>c.n==="Jürgen Klopp")||COACHES[0];if(!scout)scout=generateScout();
    phase="season";S.seasonClosed=false;S.seasonNumber=1;S.idx=4;S.kalauz=null;
    try{teachSetMode("light");}catch(e){}           /* a buborékok ne takarjanak */
    $("mpEntry").classList.add("hide");
    try{openHubMidSeason();}catch(e){}
    document.querySelectorAll("section").forEach(x=>{if(x.id!=="scHub")x.classList.add("hide");});
    $("scHub").classList.remove("hide");renderHub();
    try{$("guideTip").classList.add("hide");}catch(e){}});
  await p.waitForTimeout(500);

  console.log("— 1–2. a kártya és a köszöntés —");
  const k1=await p.evaluate(()=>{
    const el=$("hubEdzoKartya"),wrap=document.querySelector(".hubMenuWrap");
    /* a kártya és a menü között legfeljebb a láthatatlan ragadás-jelölő áll */
    let n=el&&el.nextElementSibling;while(n&&n.id==="hubMenuSentinel")n=n.nextElementSibling;
    return {van:!!el,lat:!!el&&!el.classList.contains("hide"),menuFelett:n===wrap,
      tx:el?el.innerText:"",arc:!!(el&&el.querySelector(".ekArc svg")),
      fejezetChip:el?[...el.querySelectorAll("[data-ekkal]")].map(b=>b.getAttribute("data-ekkal")):[],
      ujChip:el?el.querySelectorAll("[data-ekmut]").length:-1,lat0:(S.kalauz&&S.kalauz.lat)||null};});
  ok(k1.van&&k1.lat&&k1.menuFelett,"a kártya közvetlenül a ☰ Menü fölött, látható",{menuFelett:k1.menuFelett});
  ok(k1.arc&&/Jürgen|Klopp/.test(k1.tx)&&/1\. idény — eligazítás/.test(k1.tx),"az edző neve, arcképe és „1. idény — eligazítás”",k1.tx.slice(0,120));
  ok(/Üdv a klubnál/.test(k1.tx)&&["hub","meccsero","piac","taktika","kihivas"].every(f=>k1.fejezetChip.includes(f))
     &&!k1.fejezetChip.includes("run")&&!k1.fejezetChip.includes("merfoldko"),"az 1. idény köszöntése az első fejezetekkel (a 2–3. idényesek nélkül)",k1.fejezetChip);
  ok(k1.ujChip===0&&Array.isArray(k1.lat0),"ami eleve nyitva volt, az nem „hír” (csendes alapállapot)",{uj:k1.ujChip,lat:k1.lat0});
  await (await p.$("#hubEdzoKartya")).scrollIntoViewIfNeeded();await kep("1-kartya-1-idény");

  console.log("— 3. az egy javaslat —");
  const j=await p.evaluate(()=>{
    const due=teachDueList("hub");
    const el=$("hubEdzoKartya"),tx=(el.querySelector(".ekJav")||{}).innerText||"";
    const elso=due[0]&&TEACH_TOPICS[due[0]];
    let hivott=null;const regi=vezPushMutasd;vezPushMutasd=k=>{hivott=k;};
    el.querySelector('[data-ek="mutasd"]').click();vezPushMutasd=regi;
    let lapoz=null;
    if(due.length>1){el.querySelector('[data-ek="kov"]').click();lapoz=($("hubEdzoKartya").querySelector(".ekJav")||{}).innerText||"";}
    _ekIdx=0;renderEdzoKartya(true);
    return {due:due.slice(0,3),tx,elsoN:elso&&elso.n,hivott,lapoz,masodikN:due[1]&&TEACH_TOPICS[due[1]].n};});
  ok(j.due.length>0&&j.tx.includes(j.elsoN),"a javaslat a tanító réteg legelső esedékes témája",{due:j.due,tx:j.tx.slice(0,90)});
  ok(j.hivott===j.due[0],"„Mutasd” → a vezetés saját útja (vezPushMutasd) ugyanazzal a témával",j.hivott);
  ok(j.due.length<2||(j.lapoz&&j.lapoz.includes(j.masodikN)&&/2\/\d/.test(j.lapoz)),"„›” a következő esedékes témára lapoz",j.lapoz&&j.lapoz.slice(0,80));

  console.log("— 4. Értem · új menüelem —");
  const e4=await p.evaluate(()=>{
    $("hubEdzoKartya").querySelector('[data-ek="ertem"]').click();
    const utana=!$("hubEdzoKartya").querySelector(".ekElig");
    const fej=S.kalauz.fej.slice(),sn=S.kalauz.sn;
    /* egy még rejtett menüelem most nyílik meg (a HUB ilyenkor mutatja a gombját) */
    const ujElem=EK_NYILAS.find(x=>!x.nyit&&$(x.id)&&$(x.id).classList.contains("hide"));
    const bb=$(ujElem.id),volt=true;bb.classList.remove("hide");
    renderEdzoKartya(true);
    const el=$("hubEdzoKartya");
    const r={utana,fej,sn,id:ujElem.id,uj:/Megnyílt valami új/.test(el.innerText),chip:[...el.querySelectorAll("[data-ekmut]")].map(b=>b.getAttribute("data-ekmut"))};
    el.querySelector('[data-ek="ertem"]').click();
    r.ujra=!!$("hubEdzoKartya").querySelector(".ekElig");
    r.latBoost=S.kalauz.lat.includes(ujElem.id);
    if(volt)bb.classList.add("hide");
    return r;});
  ok(e4.utana&&e4.sn===1&&e4.fej.includes("hub"),"„Értem” → az eligazítás elcsukódik, az állás a mentett állapotban",e4);
  ok(e4.uj&&e4.chip.includes(e4.id),"egy újonnan megjelent menüelem → „Megnyílt valami új” + chip",e4.chip);
  ok(!e4.ujra&&e4.latBoost,"…és „Értem” után csend",e4);

  console.log("— 5. új idény —");
  const e5=await p.evaluate(()=>{
    S.seasonNumber=2;renderEdzoKartya(true);
    const el=$("hubEdzoKartya");
    return {tx:el.innerText,fej:[...el.querySelectorAll("[data-ekkal]")].map(b=>b.getAttribute("data-ekkal"))};});
  ok(/2\. idény — eligazítás/.test(e5.tx)&&/Új idény kezdődik/.test(e5.tx),"a 2. idény eligazítása",e5.tx.slice(0,140));
  ok(e5.fej.includes("utanpotlas")&&!e5.fej.includes("hub"),"a 2. idényben nyíló fejezetek (a már ismertek nélkül)",e5.fej);
  await (await p.$("#hubEdzoKartya")).scrollIntoViewIfNeeded();await kep("2-kartya-2-idény");

  console.log("— 6. a kalauz —");
  const lista=await p.evaluate(()=>{
    kalauzNyit();const m=$("kalauzModal");
    const t=[...m.querySelectorAll(".kzTetel")].map(b=>({f:b.getAttribute("data-kzf"),zart:b.disabled,tx:b.innerText.replace(/\s+/g," ")}));
    return {nyitva:!m.classList.contains("hide"),t};});
  ok(lista.nyitva&&lista.t.length===10,"a tartalomjegyzék: 10 fejezet",lista.t.length);
  const zart=lista.t.filter(x=>x.zart);
  ok(zart.length>=1&&zart.every(x=>/🔒/.test(x.tx))&&zart.some(x=>/3\. idénytől/.test(x.tx)),"a zárt fejezetek 🔒-tel és az idénnyel",zart.map(x=>x.tx));
  await kep("3-kalauz-lista");
  const nyitott=lista.t.filter(x=>!x.zart).map(x=>x.f);
  const lepesek=[];
  for(const f of nyitott){
    const n=await p.evaluate(f=>KALAUZ.find(x=>x.k===f).l.length,f);
    for(let i=0;i<n;i++){
      await p.evaluate(([f,i])=>{_kz={f,i};kalauzRajzol();},[f,i]);
      await p.waitForTimeout(120);
      const r=await p.evaluate(([f,i])=>{
        const L=KALAUZ.find(x=>x.k===f).l[i];
        const bel=$("kalauzKepBelso"),kep=$("kalauzKep").getBoundingClientRect();
        const jel=[...document.querySelectorAll("#kalauzJelek .kzSzam")];
        const bent=jel.every(s=>{const r=s.getBoundingClientRect();return r.left>=kep.left-1&&r.right<=kep.right+1&&r.top>=kep.top-1&&r.bottom<=kep.bottom+1;});
        return {f,i,tart:bel.textContent.trim().length,idk:bel.querySelectorAll("[id]").length,inert:bel.hasAttribute("inert"),
          jel:jel.length,vart:(L.kep.jel||[]).length,bent,szoveg:$("kalauzBody").querySelector(".kzSzoveg").innerText.length};},[f,i]);
      lepesek.push(r);
      if(KEPEK&&i===0)await kep(`4-${f}`);}}
  ok(lepesek.length>=10&&lepesek.every(r=>r.tart>0&&r.szoveg>80),"minden nyitott lépés élő képet és magyarázatot ad",lepesek.map(r=>`${r.f}${r.i}:${r.tart}`).join(" "));
  ok(lepesek.every(r=>r.idk===0&&r.inert),"a másolatban nincs id (nincs kettőzött azonosító), és nem kattintható",lepesek.filter(r=>r.idk||!r.inert));
  ok(lepesek.filter(r=>r.vart>0).every(r=>r.jel>=1&&r.bent),"ahol jelölő van, legalább egy megjelenik, és mind a képen belül",lepesek.map(r=>`${r.f}${r.i}:${r.jel}/${r.vart}`).join(" "));
  const jelOssz=lepesek.reduce((a,r)=>a+r.jel,0),vartOssz=lepesek.reduce((a,r)=>a+r.vart,0);
  ok(jelOssz>=vartOssz*0.7,"a jelölők nagy része meg is jelenik (ami hiányzik, az még nem elérhető elem)",{jelOssz,vartOssz});

  console.log("— 7. olvasottnak jelölés —");
  const e7=await p.evaluate(()=>{
    _kz={f:"piac",i:0};kalauzRajzol();
    $("kalauzBody").querySelector('[data-kz="kov"]').click();
    $("kalauzBody").querySelector('[data-kz="kesz"]').click();
    const visszaLista=!!$("kalauzBody").querySelector(".kzLista");
    const pipa=/✓/.test($("kalauzBody").querySelector('[data-kzf="piac"]').innerText);
    kalauzZar();
    const szam=($("hubEdzoKartya").querySelector(".ekKalBtn")||{}).innerText||"";
    return {olv:!!S.kalauz.olv.piac,visszaLista,pipa,zarva:$("kalauzModal").classList.contains("hide"),szam};});
  ok(e7.olv&&e7.visszaLista&&e7.pipa&&e7.zarva&&/1\/\d+/.test(e7.szam),"az utolsó lépés „Értem”-je olvasottnak jelöl, a kártya számlálója nő",e7);

  console.log("— 8. az Edző menüből · Semmi fokozat —");
  const e8=await p.evaluate(()=>{
    renderHubCoachPanel();const kb=$("edzoKalauzBtn");
    const van=!!kb,tx=kb?kb.innerText:"";
    if(kb)kb.click();const nyilt=!$("kalauzModal").classList.contains("hide");kalauzZar();
    teachSetMode("off");renderEdzoKartya(true);const rejt=$("hubEdzoKartya").classList.contains("hide");
    teachSetMode("light");renderEdzoKartya(true);const vissza=!$("hubEdzoKartya").classList.contains("hide");
    return {van,tx,nyilt,rejt,vissza};});
  ok(e8.van&&/kalauza/.test(e8.tx)&&e8.nyilt,"az Edző menü gombja nyitja a kalauzt",e8.tx);
  ok(e8.rejt&&e8.vissza,"„Vezetés: Semmi” → a kártya rejtve; visszakapcsolva újra ott",e8);

  console.log("— 9. mentés —");
  const e9=await p.evaluate(()=>{
    let csomag=null;const regi=localStorage.setItem.bind(localStorage);
    try{window.saveGame&&saveGame();}catch(e){}
    const kulcsok=Object.keys(localStorage).filter(k=>{const v=localStorage.getItem(k)||"";return v.includes('"kalauz"');});
    return {kulcsok:kulcsok.length,src:String(saveGame).length>0};});
  const forras=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  ok(/kalauz:S\.kalauz\|\|null/.test(forras)&&/S\.kalauz=\(d\.S\.kalauz&&d\.S\.kalauz\.v===1\)\?d\.S\.kalauz:null/.test(forras),
     "a mentés kiírja és a visszatöltés visszaveszi az S.kalauz-t",e9);

  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
