/* 🧭 1.0.11.21.00 — A KEZDÉS ÚJRAGONDOLVA + AZ ELSŐ TIZENEGY APRÓLÉKOS VEZETÉSE
   KÉRÉS: „Nem jó az, ahogyan a játék kezdődik. Legyen sokkal egyszerűbb. […]
   a menedzsment feladata nem jön be, majd csak a HUB-ban. Amikor edzőt
   választunk, ott is kér megerősítést […] ha kiválasztottad még vissza lehet
   lépni […] legyen egy kis hint […] Villog a menü. Rányom. Villog a Felállás,
   rányom. Villog az a felállás, amit ajánlunk neki […] Ugyanez az elv végigmegy
   a taktikával is."
   Amit mér:
     1. a menedzsment-célok ablaka NEM nyílik a karrier kezdetén (osztályválasztás);
     2. edzőválasztás: tipp a kerethez (illeszkedés %, indulási OVR, „ajánlott"),
        megerősítés (nem → nincs edző), a kezdő taktikánál vissza → UGYANAZ a 3
        edző, a végső kártyán vissza, majd tovább a kapitányhoz;
     3. az első HUB-on előbb a célkitűzések ablaka, utána magától indul az első lecke;
     4. a lecke végigjárható a VALÓDI, villogó elemekre koppintva: keret → lap →
        attribútumok → posztok → csere → megbízás → menü → felállás → menü →
        taktika (ismertség, illeszkedés, OVR-példa) → összegzés; a koppintás
        magától léptet; a Kezdő út első szakaszának mindhárom feladata kipipálódik;
     5. a taktika-panel minden sorában ott a meccs-hatás (OVR);
     6. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah",PORT=9397;
const KEP=process.env.KEP||"";
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,600):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
  p.on("pageerror",e=>{errs.push(String(e));if(process.env.STACK)console.log(e.stack);});
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
  /* karrier az edzőválasztásig (a draft gyors útja) */
  const r1=await p.evaluate(()=>{
    beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    const _sc=showChemistry;showChemistry=()=>{};
    S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26,startRating:sl.player.ovr,peak:sl.player.ovr,pot:3000};
      const e=careerPool[sl.player.n];if(!e.attrs)initPlayerAttrs(e);});
    /* a pad és a tartalék is legyen (a csere-javaslathoz) */
    sq.players.slice(11,18).forEach((src,i)=>{const pl={n:src.n,ovr:src.ovr,pos:(src.pos||["KV"]).slice(),age:25};
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:25,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      if(!careerPool[pl.n].attrs)initPlayerAttrs(careerPool[pl.n]);extraRoster.push(pl);});
    try{refillBench();}catch(e){}
    window.saveGame=()=>{};
    const mg=document.getElementById("mgmtModal");
    return {mgmtLatszik:!!(mg&&!mg.classList.contains("hide")),mgmtSeen:S.mgmtSeen||null,kut:!!S.kut};});
  ok(!r1.mgmtLatszik&&!r1.mgmtSeen&&r1.kut,"1. a karrier kezdetén NINCS menedzsment-ablak (majd a HUB-on), a Kezdő út él",r1);
  /* 2. edzőválasztás */
  await p.evaluate(()=>{document.querySelectorAll("#scDraft,#chemBox,#nameBox").forEach(e=>e.classList&&e.classList.remove("hide"));
    phase="coach";$("chemBox")&&$("chemBox").classList.add("hide");$("coachBox").classList.remove("hide");
    $("scDraft").scrollIntoView();$("coachSpinBtn").click();});
  await p.waitForTimeout(2600);
  const r2a=await p.evaluate(()=>{
    const tipp=document.getElementById("coachTipp");
    const nevek=[...document.querySelectorAll("#coachChoices .card [data-coachpick]")].map(b=>b.closest(".card").querySelector("div").textContent.trim());
    return {tipp:tipp?tipp.textContent.slice(0,220):null,nevek,ajanlott:document.querySelectorAll("#coachChoices .coachAjanlott").length,
      sorok:document.querySelectorAll("#coachChoices .coachTacSor").length,rating:/Rating/.test(document.getElementById("coachChoices").textContent)};});
  ok(!!r2a.tipp&&/illik/.test(r2a.tipp)&&r2a.nevek.length===3&&r2a.ajanlott===1&&r2a.sorok===9,"2a. 3 edző, tipp a kerethez, pontosan 1 „ajánlott”, edzőnként 3 taktikasor (illeszkedés + indulási OVR)",r2a);
  if(KEP)await p.screenshot({path:KEP+"/1-edzok.png"});
  const r2b=await p.evaluate(async()=>{
    const w=ms=>new Promise(r=>setTimeout(r,ms));
    document.querySelector('#coachChoices [data-coachpick="1"]').click();await w(150);
    const m=$("hubTacticConfirmModal"),cim=$("hubTacticConfirmTitle").textContent;
    const nyitva=!m.classList.contains("hide");
    $("hubTacticConfirmNo").click();await w(150);
    const nemUtan={coach:!!coach,valasztok:document.querySelectorAll("#coachChoices [data-coachpick]").length};
    document.querySelector('#coachChoices [data-coachpick="1"]').click();await w(150);
    $("hubTacticConfirmYes").click();await w(150);
    const taktKepernyo={coach:coach&&coach.n,vissza:!!$("coachTacBack"),ajanlott:document.querySelectorAll("#coachChoices .coachAjanlott").length};
    $("coachTacBack").click();await w(150);
    const nevek2=[...document.querySelectorAll("#coachChoices .card [data-coachpick]")].map(b=>b.closest(".card").querySelector("div").textContent.trim());
    const coachVissza=coach;
    document.querySelector('#coachChoices [data-coachpick="0"]').click();await w(150);$("hubTacticConfirmYes").click();await w(150);
    [...document.querySelectorAll("#coachChoices button")].find(x=>x.textContent==="Ezzel indulunk").click();await w(150);
    const kartya={ok:!$("coachOk").classList.contains("hide"),vissza:!$("coachBackBtn").classList.contains("hide"),akt:S.tactics.active};
    $("coachBackBtn").click();await w(150);
    const nevek3=[...document.querySelectorAll("#coachChoices .card [data-coachpick]")].map(b=>b.closest(".card").querySelector("div").textContent.trim());
    const okRejtve=$("coachOk").classList.contains("hide");
    document.querySelector('#coachChoices [data-coachpick="2"]').click();await w(150);$("hubTacticConfirmYes").click();await w(150);
    [...document.querySelectorAll("#coachChoices button")].find(x=>x.textContent==="Ezzel indulunk").click();await w(150);
    const vegso=coach.n;
    try{drawPitch();}catch(e){}   /* a gyors út nem rajzolta ki a pályát (a kapitány-jelölés a slotok elemén ül) */
    $("coachOk").click();await w(150);
    return {cim,nyitva,nemUtan,taktKepernyo,nevek2,coachVissza:!!coachVissza,kartya,nevek3,okRejtve,vegso,phase};});
  ok(r2b.nyitva&&/Biztos/.test(r2b.cim)&&!r2b.nemUtan.coach&&r2b.nemUtan.valasztok===3,"2b. „Őt választom” → „Biztos őt választod?”; a Mégse után nincs edző",r2b);
  ok(r2b.taktKepernyo.coach&&r2b.taktKepernyo.vissza&&r2b.taktKepernyo.ajanlott===1&&JSON.stringify(r2b.nevek2)===JSON.stringify(r2a.nevek)&&!r2b.coachVissza,
     "2c. a kezdő taktikánál „← Másik edzőt választok” → ugyanaz a 3 edző, az edző törölve; a taktikák közt 1 ajánlott",r2b);
  ok(r2b.kartya.ok&&r2b.kartya.vissza&&JSON.stringify(r2b.nevek3)===JSON.stringify(r2a.nevek)&&r2b.okRejtve&&r2b.phase==="captain",
     "2d. a végső kártyán is vissza lehet lépni (ugyanaz a 3), utána tovább a kapitányhoz",r2b);
  /* 3. az első HUB */
  await p.evaluate(()=>{if(captainIdx<0)captainIdx=0;if(!scout)scout=generateScout();
    try{$("capMsg").classList.add("hide");slots.forEach(s=>s.el&&s.el.classList.remove("cap-pick"));}catch(e){}
    phase="prestart";openPreSeasonHub();});
  await p.waitForTimeout(900);
  const r3=await p.evaluate(()=>({mgmt:!$("mgmtModal").classList.contains("hide"),lecke:!!_kutL}));
  /* a célkitűzések, majd a tippek bezárása → a lecke magától indul */
  await p.evaluate(()=>{$("mgmtOk").click();});
  for(let i=0;i<12;i++){
    await p.waitForTimeout(700);
    const v=await p.evaluate(()=>{for(const id of ["guideTipOk","guideTipOff","talDrawLater"]){const x=document.getElementById(id);if(x&&x.offsetParent){x.click();return id;}}
      return _kutL?"lecke":null;});
    if(v==="lecke")break;}
  await p.waitForTimeout(2200);
  const r3b=await p.evaluate(()=>({lecke:_kutL&&_kutL.id,i:_kutL&&_kutL.i,n:KUT_LECKE.elso11.l.length}));
  ok(r3.mgmt&&!r3.lecke&&r3b.lecke==="elso11"&&r3b.i===0,"3. az első HUB-on előbb a célkitűzések, utána magától indul az „Első tizenegy” lecke",{r3,r3b});
  /* 5. (előre) a taktika-panel minden sorában a meccs-hatás */
  const r5=await p.evaluate(()=>{renderHubTacticsPanel();const R=[...document.querySelectorAll("#hubTacticsBody [data-takt]")];
    return {sor:R.length,hatas:R.filter(r=>/Meccs-hatás/.test(r.textContent)).length};});
  ok(r5.sor===6&&r5.hatas===6,"5. a taktika-panel mind a 6 sorában ott a meccs-hatás (OVR)",r5);
  /* 4. a lecke végigjárása a valódi, villogó elemekre koppintva */
  const nyom=[];let kepI=0;
  for(let lepes=0;lepes<60;lepes++){
    await p.waitForTimeout(650);
    const all=await p.evaluate(()=>{
      if(!_kutL)return {vege:true};
      const st=KUT_LECKE.elso11.l[_kutL.i];
      const v=document.querySelector(".kutCelVillog");
      const box=$("kutLecke");
      return {i:_kutL.i,t:st.t,c:(document.querySelector("#kutLecke .kutLCim")||{}).textContent||"",pill:box&&box.classList.contains("var"),
        villog:v?(v.id||v.getAttribute("data-hubkey")||v.getAttribute("data-kut")||v.getAttribute("data-form")||v.getAttribute("data-cserekey")||v.getAttribute("data-role")||v.tagName+":"+v.textContent.slice(0,20)):null,
        modal:!$("hubTacticConfirmModal").classList.contains("hide"),fent:box&&box.classList.contains("fent"),
        x:(document.querySelector("#kutLecke .kutLX")||{}).textContent||""};});
    if(all.vege)break;
    if(all.modal){await p.evaluate(()=>$("hubTacticConfirmYes").click());nyom.push("[megerősítés: igen]");continue;}
    const sor=`${all.i+1}. ${all.t} · ${all.c.trim()}${all.villog?" → 👆 "+all.villog:""}${all.fent?" (felül)":""}`;
    if(nyom[nyom.length-1]!==sor)nyom.push(sor);
    if(KEP&&kepI<40&&[2,3,5,6,7,9,11,13,14,16,17,18,19].includes(all.i)&&!nyom.includes("kep"+all.i)){nyom.push("kep"+all.i);await p.screenshot({path:`${KEP}/l${String(all.i+1).padStart(2,"0")}.png`});kepI++;}
    if(all.c.includes("Az ajánlott felállás")&&!global._fa)global._fa=await p.evaluate(()=>{const a=_kutL.formAj;return {f:a.f,v:a.v,most:a.most};});
    if(all.villog&&all.t==="katt"){await p.evaluate(()=>{const v=document.querySelector(".kutCelVillog");v.scrollIntoView({block:"center"});v.click();});}
    else await p.evaluate(()=>{const t=document.querySelector('#kutLecke [data-kl="tovabb"]');if(t)t.click();});}
  console.log("     "+nyom.filter(x=>!/^kep/.test(x)).join("\n     "));
  const r4=await p.evaluate(()=>{const sz=KUT_SZAKASZ[0];
    return {lecke:!!_kutL,latott:!!(S.kut.lecke&&S.kut.lecke.elso11),kesz:S.kut.kesz,sz:S.kut.sz,form,takt:S.tactics.active,dim:!$("kutLDim").classList.contains("hide"),villog:document.querySelectorAll(".kutCelVillog").length};});
  const tenyleg=await p.evaluate(()=>({form,v:slots.reduce((t,s)=>t+(s&&s.player?kutPosErtek(s.player,s.pos):0),0)}));
  const fa=global._fa||{};
  ok(fa.f&&tenyleg.form===fa.f&&Math.abs(tenyleg.v-fa.v)<0.6&&fa.v>fa.most,"4c. az ajánlott felállás előrejelzése pontos: a váltás után a kezdő összértéke annyi, amennyit a lecke ígért",{fa,tenyleg});
  const vegig=nyom.some(x=>/Megvan az alap/.test(x));
  const lepett=["A kereted","Rossz poszton|Van erősebb|Nézzük meg","Az attribútumai","A posztjai","menü","Felállás","Az ajánlott felállás","Taktika","ismertség","Miből áll","Meccs-hatás","Melyiket"]
    .map(m=>nyom.some(x=>new RegExp(m).test(x)));
  ok(vegig&&lepett.every(Boolean)&&!r4.lecke&&!r4.dim&&r4.villog===0,"4a. a lecke végigjárható a villogó elemekre koppintva, a végén nincs maradék kiemelés",{lepett,r4});
  ok(["form","takt","megb"].every(k=>r4.kesz&&r4.kesz["elso11:"+k]),"4b. a Kezdő út első szakaszának feladatai kipipálódtak (felállás, taktika, megbízás)",r4);
  ok(!errs.length,"6. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");process.exit(hiba?1:0);})();
