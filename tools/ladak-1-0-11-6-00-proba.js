/* 🎁 1.0.11.6.00 — LÁDÁK: ÖT FIZETŐESZKÖZ, HAT LÁDA, HAT SZINT.
   Amit mér:
     1. az esélytábla: minden láda összege 1; az Öltözői 6. szintje 0,05 %;
        a várható érték / ár 84–98 %, a nagyobb láda nem rosszabb;
        20 000 dobás ládánként a tábla szerint oszlik;
     2. a befizetés: pénz (U/100 Ft érménként), stíluspont (2,5), játékos
        (piaci érték 40 %-a, legalább 1,5× a gyors eladás, a keretből kikerül — és mérve a gyors eladás
        fölött van), stábtag (40 %), talizmán (ritkaság szerint);
     3. a vásárlás: kevés érméből nem megy; ×5 → öt jutalom, az érme fogy;
     4. a kategóriák hatása és lejárata: kupon (az ár −25 %, fizetéskor fogy),
        ingyen boost (0 Ft), szezonkártya (fokozat + Rating + POT), stábtag,
        talizmán-fejlesztés, csúszka-boost (dialMul, N meccs után semleges),
        stílusbolt-tétel (styleActiveFx), gól-erősítő (multSkillEffect),
        időleges skill (N meccs után eltűnik), szurkolói boost, pénz,
        kölcsön (tíz meccs alatt törlesztődik), minden „egyéb" a 6. szinten;
     5. az időleges csapatstílus: a slot-sorban él, a képessége hat, nem
        fejleszthető, a szerepei kiosztva, lejártakor minden visszaáll;
     6. a mentés viszi; 7. a felület: ablak, nyitás-jelenet, választós
        jutalom kiosztása; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9237;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForFunction(()=>typeof coachAttrPower==="function",null,{timeout:15000});
  const r=await p.evaluate(async()=>{
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
    form="433";slotRoles={};S.ultraSlot=null;
    slots=FORMS["433"].slots.map((pp,i)=>({pos:effectiveSlotPos("433",i),xy:slotXY("433",i),player:null,fit:1,origin:null}));
    slots.forEach((sl,i)=>{const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr+10,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){ki.sfs=String(e);}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";S.seasonNumber=3;S.idx=11;
    window.__sg=saveGame;window.saveGame=()=>{};window.saveGameNow=()=>{};
    const U=ladaU();ki.U=U;
    /* 1. esélytábla */
    ki.tabla=LADAK.map(d=>({k:d.k,sum:+d.p.reduce((a,b)=>a+b,0).toFixed(6),ev:+(ladaEV(d)/d.ar).toFixed(3)}));
    ki.olt6=LADAK[0].p[5];
    ki.dob=LADAK.map(d=>{const c=[0,0,0,0,0,0];for(let i=0;i<20000;i++)c[ladaSzintDob(d)-1]++;
      return {k:d.k,max:+Math.max(...c.map((x,i)=>Math.abs(x/20000-d.p[i]))).toFixed(4)};});
    /* 2. befizetés */
    S.lada=null;S.transferBudget=Math.round(U*5);
    const b0=S.transferBudget;let r=ladaBefizetPenz(100);
    ki.penz={ok:r.ok,erme:ladaErme(),fizetett:b0-S.transferBudget,vart:Math.round(100*ladaErmeAr()),regi:Math.round(U),nf:ladaNfSzorzo()};
    const M=msState();M.sp=100;r=ladaBefizetSp(40);ki.sp={ok:r.ok,e:r.e,vart:ladaSpErme(40),sp:M.sp};
    /* egy valódi tartalék: 19 éves, a mezőny szintjén */
    const tp=generateAcademyPlayer();const tpe=careerPool[tp.n];tpe.age=19;tpe.startRating=55;tpe.pot=9000;tpe.peak=potToPeakOvr(9000);
    const tpl=careerPlayerFromPoolEntry(tpe);extraRoster.push(tpl);
    const J=ladaJatJeloltek();const jo=J.find(o=>o.p.n===tp.n);
    const je=careerPool[jo.p.n];const sv=sellValue(jo.p),mv=marketValue(je);
    const e0=ladaErme();r=ladaBefizetJatekos(jo.p.n);
    ki.jat={ok:r.ok,uz:r.uz,e:r.e,vart:Math.round(Math.max(mv*LADA_JAT_K,sv*1.5)/U*100*ladaNfSzorzo()),bent:!!fullCareerRoster().find(p=>p&&p.n===jo.p.n),
      gyorsEladasErme:Math.round(sv/U*100),arany:+(r.e/Math.max(1,Math.round(sv/U*100))).toFixed(2),delta:ladaErme()-e0};
    ki.kezdoUz=(()=>{const x=ladaJatJeloltek().find(o=>slots.some(s=>s.player===o.p));if(!x)return null;const rr=ladaBefizetJatekos(x.p.n);return rr.ok?"ok":rr.uz;})();
    S.staff=[{n:"Láda Teszt",type:"attr:passz",attrKey:"passz",sz:60,szBase:60,age:40,xp:0,since:1,focus:{mode:"team",group:null,names:[]}}];
    const se=ladaStabErme(S.staff[0]);r=ladaBefizetStab(0);ki.stab={ok:r.ok,e:r.e,vart:se,db:S.staff.length};
    const T=talState();T.lapok.push({kat:"scout",valt:"lista",rang:2,dobas:0.5});
    const te=ladaTalErme(T.lapok[T.lapok.length-1]);r=ladaBefizetTal(T.lapok.length-1);ki.tal={ok:r.ok,e:r.e,vart:te,talOn:talOn()};
    /* 3. vásárlás */
    S.lada.erme=0.1;ki.kevés=ladaVesz("bajnoki",1).ok;
    S.lada.erme=10;const e1=ladaErme();const v=ladaVesz("kupa",5);
    ki.vesz={ok:v.ok,db:v.jut.length,fogy:e1-ladaErme(),vart:49*5,szintek:v.jut.map(j=>j.szint),szamlalo:S.lada.db.kupa};
    /* 4. kategóriák */
    const K={};
    S.chFreeBoost={};S.boostTokens=0;S.lada.kupon={};const ar0=boostPriceOf("plain");
    ladaJutBoost(1).alkalmaz();K.kupon={elotte:ar0,utana:boostPriceOf("plain"),pct:ladaKuponPct("plain")};
    ladaKuponSpend("plain");K.kupon.vissza=boostPriceOf("plain");
    const fb0=(S.chFreeBoost&&S.chFreeBoost.youth)||0;ladaJutBoost(6).alkalmaz();K.ingyen={db:S.chFreeBoost.youth-fb0,ar:boostPriceOf("youth")};
    const xi=ladaXI();const kp=xi[2];const ke=careerPool[kp.n];ke.cardTier=null;const kr0=ke.startRating,kpot0=ke.pot;
    K.kartya={txt:ladaKartyaAd(kp.n,"stellar"),tier:ke.cardTier,dr:ke.startRating-kr0,dpot:ke.pot-kpot0};
    K.kartyaUjra={txt:ladaKartyaAd(kp.n,"silver"),tier:ke.cardTier};
    const sl=Array.from({length:200},()=>ladaKartyaDob(1));K.kartyaSav1=[...new Set(sl)].sort();
    const sl6=Array.from({length:400},()=>ladaKartyaDob(6));K.kartyaSav6=[...new Set(sl6)].sort();
    S.staff=[];const sj=ladaJutStab(5);const st=sj.alkalmaz();K.stab={txt:st,db:S.staff.length,sz:S.staff[0]&&S.staff[0].sz};
    T.lapok.push({kat:"scout",valt:"lista",rang:1,dobas:0.2});const ti=T.lapok.length-1;
    K.tal={txt:ladaTalFejleszt(ti,2),rang:T.lapok[ti].rang};
    T.lapok[ti].rang=4;K.tal4={txt:ladaTalFejleszt(ti,1),rang:T.lapok[ti].rang,dobas:T.lapok[ti].dobas};
    S.lada.dial=[];const d0=dialMul("own",{});S.lada.dial.push({ch:"own",m:1.15,n:"Gólszomj",ic:"🔥",left:2});
    const d1=dialMul("own",{});ladaMeccsUtan();const d2=dialMul("own",{});ladaMeccsUtan();const d3=dialMul("own",{});
    K.dial={d0:+d0.toFixed(4),d1:+d1.toFixed(4),d2:+d2.toFixed(4),d3:+d3.toFixed(4),db:S.lada.dial.length};
    const fxDb0=styleActiveFx().length;S.lada.fx.push({fx:{ownGoalMult:1.07},n:"Étvágy",ic:"🔥",left:1});
    const fxDb1=styleActiveFx().length;ladaMeccsUtan();const fxDb2=styleActiveFx().length;K.fx={fxDb0,fxDb1,fxDb2};
    S.lada.jat=[];const gp=xi[9];const g0=multSkillEffect(gp.n,"goalw");ladaJatekosAd(gp.n,{fajta:"gol",m:1.5,N:1});
    const g1=multSkillEffect(gp.n,"goalw");ladaMeccsUtan();K.gol={g0:+g0.toFixed(4),g1:+g1.toFixed(4),g2:+multSkillEffect(gp.n,"goalw").toFixed(4)};
    const skp=xi[5];const sk0=playerSkills(skp.n).length;K.skill={txt:ladaJatekosAd(skp.n,{fajta:"skill",N:2})};
    K.skill.db1=playerSkills(skp.n).length-sk0;ladaMeccsUtan();K.skill.db2=playerSkills(skp.n).length-sk0;ladaMeccsUtan();K.skill.db3=playerSkills(skp.n).length-sk0;
    const rp=xi[6];const rr=ladaJatekosAd(rp.n,{fajta:"rating",amt:5,N:3});K.rating={amt:nextMatchOvrOf(rp.n)};
    S.lada.szurk=[];ladaJutSzurk(2);S.lada.szurk.push({m:1.25,left:1});K.szurk={m:ladaSzurkMult()};ladaMeccsUtan();K.szurk.utana=ladaSzurkMult();
    const pb0=S.transferBudget;ladaJutPenz(3,true).alkalmaz();K.penz={nott:S.transferBudget-pb0};
    S.lada.hitel=null;let hj=null;for(let i=0;i<60&&!hj;i++){const x=ladaJutPenz(4);if(x.v&&x.v.most)hj=x;}
    const hb0=S.transferBudget;hj.alkalmaz();const hb1=S.transferBudget;K.hitel={kapott:hb1-hb0,tartozas:S.lada.hitel&&S.lada.hitel.tartozas};
    S.transferBudget+=hj.v.vissza*2;const hb2=S.transferBudget;for(let i=0;i<10;i++)ladaMeccsUtan();K.hitel.torlesztve=hb2-S.transferBudget;K.hitel.vege=S.lada.hitel;
    const egyeb=[];for(let i=0;i<60;i++){const o=ladaJutEgyeb(6);try{egyeb.push(o.cim+" → "+String(o.alkalmaz()).slice(0,40));}catch(err){egyeb.push("HIBA "+o.cim+": "+err);}}
    K.egyebHiba=egyeb.filter(x=>/^HIBA/.test(x));K.egyebFajta=[...new Set(egyeb.map(x=>x.split(" → ")[0]))].length;
    /* minden kategória minden szinten lefut */
    const katHiba=[];
    LADA_KAT.forEach(k=>{for(let L=1;L<=6;L++){try{if(!k.ok(L))continue;const j=k.gen(L);if(!j)throw "üres";
      if(j.valaszt){const f=ladaFuggMent(Object.assign(j,{szint:L}));const o=ladaValasztOpciok(f);ladaValasztottAlkalmaz(f,o[0]&&o[0].v);}else j.alkalmaz();}
      catch(err){katHiba.push(k.k+L+": "+err);}}});
    K.katHiba=katHiba;
    ki.K=K;
    /* 5. időleges csapatstílus */
    S.style={key:"beton",chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}}};S.style2=null;S.styleExtra=[];S.lada.stilus=null;
    try{styleLvlCacheClear();}catch(e){}
    const n0=styleSlots().length;ki.stLehet=ladaStilusLehet();
    let sj2=null;for(let i=0;i<20;i++){sj2=ladaJutStilus(6);if(sj2)break;}
    ki.stTxt=sj2.alkalmaz();
    const tst=S.lada.stilus;const tk=Object.keys(tst.traits);
    ki.stilus={n0,n1:styleSlots().length,key:tst.key,traitDb:tk.length,szint:styleTraitLevel(tk[0]),szerep:tst.szerep.length,
      masodlagos:styleIsSecondary(tst),left:tst.left};
    S.styleView=styleSlots().length;ki.stilus.vesz=styleBuyTrait((STYLE_TRAITS[tst.key]||[])[0].key);
    const szerepKulcs=tst.szerep.slice();
    for(let i=0;i<14;i++)ladaMeccsUtan();
    ki.stilus.vege={n:styleSlots().length,van:!!S.lada.stilus,szint:styleTraitLevel(tk[0]),szerepMaradt:szerepKulcs.filter(k=>roleState().map[k]).length,nezet:S.styleView};
    /* 8. (1.0.11.6.01) nehézség-szorzó, kihívás-jutalom */
    const _nfm=window.styleXNfMost;
    const nfp=(nf,s)=>{window.styleXNfMost=()=>({nf,s});const v=+ladaNfSzorzo().toFixed(3);return v;};
    ki.nfTab={"1.1":nfp(1,1),"5.1":nfp(5,1),"7.1":nfp(7,1),"9.5":nfp(9,5),"10.5":nfp(10,5)};
    window.styleXNfMost=()=>({nf:5,s:1});
    const ar5=ladaErmeAr(),sp5=ladaSpErme(40);window.styleXNfMost=()=>({nf:9,s:5});const ar9=ladaErmeAr(),sp9=ladaSpErme(40);
    ki.nfHat={ar5:Math.round(ar5),ar9:Math.round(ar9),sp5,sp9};
    window.styleXNfMost=_nfm;
    const ce0=ladaErme();const ctxt=applyChallengeReward({kind:"ladaErme",amount:55});ki.kihivas={txt:ctxt,d:ladaErme()-ce0};
    let vanPool=0;for(let i=0;i<30&&!vanPool;i++){try{const rw=genReward("long",3,{oppRating:oppTargetRating});}catch(e){}}
    ki.poolSzoveg=/kind:"ladaErme"/.test(genReward.toString());
    /* 6. mentés */
    S.lada.erme=1.23;S.lada.log.unshift({t:"ki",sz:"teszt",sz2:3,s:3,i:11});
    window.__lsw=null;const _s=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===saveKey())window.__lsw=v;return _s.apply(this,arguments);};
    try{window.__sg();}catch(e){ki.saveErr=String(e);}finally{Storage.prototype.setItem=_s;}
    let dd=null;try{dd=JSON.parse(mzUnpack(window.__lsw));}catch(e){}
    ki.mentes={van:!!(dd&&dd.S&&dd.S.lada&&Math.abs(dd.S.lada.erme-1.23)<1e-9)};
    if(dd){S.lada=null;try{applySavedGame(dd);}catch(e){ki.loadErr=String(e);}ki.mentes.vissza=!!(S.lada&&ladaErme()===123&&S.lada.log[0].sz==="teszt");}
    return ki;});
  console.log(JSON.stringify(r));
  /* 7. a felület */
  const shot=async n=>{
    await p.evaluate(()=>{[...document.querySelectorAll("button")].filter(b=>b.offsetParent&&/Megkaptam/i.test(b.textContent||"")).forEach(b=>{try{b.click();}catch(e){}});});
    await p.waitForTimeout(150);
    return p.screenshot({path:path.join(process.env.SHOT_DIR||"/tmp",n),fullPage:false});};
  const ui=await p.evaluate(()=>{
    S.lada.erme=6;S.lada.fugg=[];
    /* a próba korábbi lépései felugró ablakot hagyhattak (mérföldkő) — a fotóhoz bezárjuk */
    for(let i=0;i<5;i++)[...document.querySelectorAll("button")].filter(b=>b.offsetParent&&/Megkaptam|Rendben|tovább/i.test(b.textContent||"")&&!b.closest("#ladaModal,#ladaNyit")).forEach(b=>{try{b.click();}catch(e){}});
    renderHub&&renderHub();
    try{renderLadaBtn();}catch(e){}
    const gomb=document.getElementById("hubLadaBtn");
    const out={gomb:gomb&&!gomb.classList.contains("hide"),gombTxt:gomb&&gomb.textContent};
    ladaMenuOpen();
    out.kartyak=document.querySelectorAll("#ladaBody .ldKartya").length;
    out.letiltott=document.querySelectorAll("#ladaBody .ldNyit[disabled]").length;
    return out;});
  await p.waitForTimeout(700);await shot("lada-ablak.png");
  const ui2=await p.evaluate(()=>{
    document.querySelector('#ladaBody [data-ldb="5"]').click();
    document.querySelector('#ladaBody [data-ldk="oltozo"]').click();
    const ov=document.getElementById("ladaNyit");
    return {on:ov.classList.contains("lnOn"),anim:ov.classList.contains("lnAnim"),k:ov.querySelectorAll(".lnK").length,erme:ladaErme(),db:S.lada.db.oltozo};});
  await p.waitForTimeout(600);await shot("lada-nyitas-kozben.png");
  await p.waitForTimeout(1900);await shot("lada-nyitas-vege.png");
  const ui3=await p.evaluate(()=>{
    /* ha a ×5-ben választós jutalom jött, előbb kiosztjuk (addig a „Rendben” jogosan tiltott) */
    const fuggElotte=S.lada.fugg.length;
    document.querySelectorAll("#ladaNyit .lnKioszt").forEach(b=>b.click());
    document.getElementById("lnTovabb").click();
    const ov=document.getElementById("ladaNyit");const zarva=!ov.classList.contains("lnOn");
    /* választós jutalom: kártya, te választod */
    S.lada.fugg=[{id:"t1",kat:"kartya",v:{tier:"gold"},szint:2,cim:"Arany szezonkártya — te választod, kié",ic:"🃏",valaszt:"keret"}];
    ladaNyitasMutat(null,[]);
    const tov=document.getElementById("lnTovabb").disabled;
    const sel=document.querySelector("#ladaNyit .lnSel");const nev=sel.options[0].value;sel.value=nev;
    document.querySelector("#ladaNyit .lnKioszt").click();
    const tov2=document.getElementById("lnTovabb").disabled;
    const out={zarva,fuggElotte,tov,tov2,fugg:S.lada.fugg.length,kartya:careerPool[nev].cardTier,kartyaRang:CARD_ORDER.indexOf(careerPool[nev].cardTier)+1};
    document.getElementById("lnTovabb").click();
    /* a befizetés fül */
    _ladaFul="be";_ladaBefFul="jat";renderLada();
    out.jatSor=document.querySelectorAll("#ladaBody [data-lbj]").length;
    out.jatLink=document.querySelectorAll("#ladaBody .ldSor .jatLink[data-jat]").length;
    S.staff=[{n:"Info Teszt",type:"attr:passz",attrKey:"passz",sz:60,szBase:60,age:44,xp:0,since:1,focus:{mode:"team",group:null,names:[]}}];
    _ladaBefFul="stab";renderLada();
    document.querySelector('#ladaBody [data-ldinfo="stab:0"]').click();
    out.stabInfo=document.getElementById("ladaInfo").classList.contains("on")&&/Szakértelem/.test(document.getElementById("ladaInfo").textContent);
    document.getElementById("ladaInfoZar").click();
    talState().lapok.push({kat:"scout",valt:"lista",rang:3,dobas:0.4});
    _ladaBefFul="tal";renderLada();
    const tl=document.querySelectorAll('#ladaBody [data-ldinfo^="tal:"]');tl[tl.length-1].click();
    out.talInfo=document.getElementById("ladaInfo").classList.contains("on")&&document.getElementById("ladaInfo").textContent.length>40;
    document.getElementById("ladaInfoZar").click();
    _ladaBefFul="jat";renderLada();
    return out;});
  await p.waitForTimeout(400);await shot("lada-befizetes.png");
  /* a játékosnév valódi koppintása: menü → adatlap a ládák fölött */
  const nevEl=await p.$("#ladaBody .ldSor .jatLink");
  if(nevEl){await nevEl.click();await p.waitForTimeout(150);
    const menu=await p.$('.jatMenu [data-jm="lap"]');if(menu){await menu.click();await p.waitForTimeout(400);}}
  const peek=await p.evaluate(()=>{const b=document.getElementById("plSheet");if(!b)return null;
    return {lat:!b.classList.contains("hide"),z:+getComputedStyle(b).zIndex};});
  await shot("lada-adatlap.png");
  console.log(JSON.stringify({ui,ui2,ui3,peek}));

  ok(r.tabla.every(t=>Math.abs(t.sum-1)<1e-6)&&r.olt6===0.0005,"1a. minden láda esélye 1-re összegződik; az Öltözői 6. szintje 0,05 %",r.tabla.map(t=>t.sum));
  ok(r.tabla.every(t=>t.ev>=0.84&&t.ev<=0.98)&&r.tabla.every((t,i)=>i===0||t.ev>=r.tabla[i-1].ev-1e-9),"1b. a várható érték / ár 84–98 %, a nagyobb láda nem rosszabb",r.tabla.map(t=>t.ev));
  ok(r.dob.every(d=>d.max<0.012),"1c. 20 000 dobás ládánként a tábla szerint (eltérés < 1,2 pp)",r.dob);
  ok(r.penz.ok&&r.penz.erme===100&&Math.abs(r.penz.fizetett-r.penz.vart)<=1&&r.penz.fizetett<=0.8*r.penz.regi/r.penz.nf+1,"2a. pénz: 100 érme ≥ 20%-kal olcsóbb, mint 1 U (a nehézség-szorzó fölött)",r.penz);
  ok(r.sp.ok&&r.sp.e===r.sp.vart&&r.sp.sp===60,"2b. stíluspont: 40 pont = 100 érme × a nehézség-szorzó",r.sp);
  ok(r.jat.ok&&r.jat.e===r.jat.vart&&!r.jat.bent&&r.jat.arany>=1.4,"2c. játékos: a piaci érték 40 %-a (≥ 1,5× gyors eladás), kikerül a keretből",r.jat);
  ok(r.kezdoUz===null||r.kezdoUz==="ok"||/nincs, aki a helyére/.test(r.kezdoUz),"2c'. pótlás nélküli kezdő: érthető elutasítás",r.kezdoUz);
  ok(r.stab.ok&&r.stab.e===r.stab.vart&&r.stab.db===0,"2d. stábtag: a stábpiaci ár 40 %-a, távozik",r.stab);
  ok(r.tal.ok&&r.tal.e===r.tal.vart,"2e. talizmán: a ritkaság szerint",r.tal);
  ok(r.kevés===false&&r.vesz.ok&&r.vesz.db===5&&r.vesz.fogy===r.vesz.vart&&r.vesz.szamlalo===5,"3. kevés érméből nem megy; ×5: öt jutalom, 245 érme fogy",r.vesz);
  const K=r.K;
  ok(K.kupon.utana<K.kupon.elotte&&Math.abs(K.kupon.utana/K.kupon.elotte-0.75)<0.03&&K.kupon.vissza===K.kupon.elotte,"4a. kupon: −25 %, fizetéskor elfogy",K.kupon);
  ok(K.ingyen.db===2&&K.ingyen.ar===0,"4b. 6. szint: 2 ingyen ifi-boost, 0 Ft",K.ingyen);
  ok(K.kartya.tier==="stellar"&&K.kartya.dr>0&&K.kartya.dpot>0&&K.kartyaUjra.tier==="stellar","4c. szezonkártya: fokozat + Rating + POT; alacsonyabb nem írja felül",K);
  ok(JSON.stringify(K.kartyaSav1)===JSON.stringify(["diamond","gold","silver"])&&K.kartyaSav6.every(t=>["stellar","mythic","killer","vandal","godlike"].includes(t))&&K.kartyaSav6.includes("godlike"),"4d. a kártya-sávok: 1. ezüst–diamond, 6. stellar–godlike",{a:K.kartyaSav1,b:K.kartyaSav6});
  ok(K.stab.db===1&&K.stab.sz>=72&&K.stab.sz<=85,"4e. stábtag az 5. szinten Sz 72–85",K.stab);
  ok(K.tal.rang===3&&K.tal4.rang===4&&K.tal4.dobas>0.2,"4f. talizmán: +2 fokozat; a csúcson a dobás nő",[K.tal,K.tal4]);
  ok(Math.abs(K.dial.d1/K.dial.d0-1.15)<1e-3&&Math.abs(K.dial.d2/K.dial.d0-1.15)<1e-3&&K.dial.d3===K.dial.d0&&K.dial.db===0,"4g. csúszka-boost: 2 meccsen ×1,15, utána semleges",K.dial);
  ok(K.fx.fxDb1===K.fx.fxDb0+1&&K.fx.fxDb2===K.fx.fxDb0,"4h. stílusbolt-tétel: a hatás-listán, lejártakor le",K.fx);
  ok(Math.abs(K.gol.g1/K.gol.g0-1.5)<1e-3&&K.gol.g2===K.gol.g0,"4i. gól-erősítő ×1,5 egy meccsre",K.gol);
  ok(K.skill.db1===1&&K.skill.db2===1&&K.skill.db3===0,"4j. időleges skill: 2 meccs után eltűnik",K.skill);
  ok(K.rating.amt===5,"4k. Rating-erősítő a következő meccsekre",K.rating);
  ok(Math.abs(K.szurk.m-1.25)<1e-9&&K.szurk.utana===1,"4l. szurkolói boost ×1,25, lejár",K.szurk);
  ok(K.penz.nott>0,"4m. pénz ajándék",K.penz);
  ok(K.hitel.kapott>0&&K.hitel.tartozas>0&&Math.abs(K.hitel.torlesztve-K.hitel.tartozas)<=10&&K.hitel.vege===null,"4n. kölcsön: most 3×, vissza 2× tíz meccs alatt",K.hitel);
  ok(!K.egyebHiba.length&&K.egyebFajta>=6,"4o. az „egyéb” 6. szinten mind lefut",{h:K.egyebHiba,f:K.egyebFajta});
  ok(!K.katHiba.length,"4p. minden kategória minden szinten lefut",K.katHiba);
  const T=r.stilus;
  ok(r.stLehet&&T.n1===T.n0+1&&T.traitDb===4&&T.szint===2&&T.masodlagos,"5a. időleges stílus: a slot-sorban, 4 képesség 2. szinten, másodlagosként",T);
  ok(T.vesz&&T.vesz.ok===false&&/nem fejleszthető/.test(T.vesz.reason||""),"5b. nem fejleszthető",T.vesz);
  ok(T.vege.n===T.n0&&!T.vege.van&&T.vege.szint===0&&T.vege.szerepMaradt===0&&T.vege.nezet<=T.n0,"5c. 14 meccs után lejár: slot, képesség, szerepek, nézet vissza",T.vege);
  ok(r.mentes&&r.mentes.van&&r.mentes.vissza&&!r.loadErr,"6. a mentés viszi",{m:r.mentes,e:r.loadErr});
  ok(r.nfTab["9.5"]===1&&r.nfTab["1.1"]===2&&r.nfTab["7.1"]>1.3&&r.nfTab["10.5"]<1&&r.nfTab["5.1"]>r.nfTab["7.1"],"8a. nehézség-szorzó: 9.5 ×1, lefelé több, a 10-es fokozaton kevesebb",r.nfTab);
  ok(r.nfHat.ar5<r.nfHat.ar9&&r.nfHat.sp5>r.nfHat.sp9,"8b. könnyebb nehézségen olcsóbb az érme, több a stíluspont-hozam",r.nfHat);
  ok(r.kihivas.d===55&&/ládaérme/.test(r.kihivas.txt)&&r.poolSzoveg,"8c. kihívás-jutalom: +55 ládaérme, és a jutalom-készletben is ott van",r.kihivas);
  ok(ui.gomb&&ui.kartyak===6&&ui.letiltott===0,"7a. HUB-gomb, hat láda; 600 érméből mind nyitható",ui);
  ok(ui2.on&&ui2.k===5&&ui2.erme>=600-70&&ui2.erme<600&&ui2.db>=5,"7b. ×5 Öltözői: a jelenet öt kártyával, 70 érme fogy (tele stábnál a stábtag-jutalom érmeként visszajön)",ui2);
  ok(ui3.zarva&&ui3.tov===true&&ui3.tov2===false&&ui3.fugg===0&&ui3.kartyaRang>=2&&ui3.jatSor>0,"7c. a „Rendben” zár; a választós kártya kiosztása, addig nem lehet továbblépni; befizetés-lista",ui3);
  ok(ui3.jatLink>0&&ui3.stabInfo&&ui3.talInfo,"7d. befizetésnél a játékos, a stábtag és a talizmán neve kis ablakot nyit",{j:ui3.jatLink,s:ui3.stabInfo,t:ui3.talInfo});
  ok(peek&&peek.lat&&peek.z>465,"7e. a névre koppintva a játékos adatlapja a ládák ablaka fölött nyílik",peek);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})();
