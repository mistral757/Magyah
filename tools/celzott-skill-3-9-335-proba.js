/* 🎯 Célzott skill a csapatstílus-boltban (3.9.335).

   KIMONDOTT KÉRÉS: „Minden csapatstílushoz tartozzon egy plusz dolog, amit a
   speciális pontjaiból vásárolhat (amiből csapaterőt is, panzernél ez a
   rettenet). Kiválaszthat szezononként kétszer 1 db skillt […], amit
   nagyobb eséllyel kap meg a csapat. Erre összesen 10x lehet […] 1. A skill
   megszerzésének esélye nő 15 ⇒ 75% […], 2. A skill választható lesz, hogy
   kinek adjuk (realisztikus skill módban csak), 25 ⇒ 100%."

   Amit mér:
     1. a két esély-görbe végpontjai és egyenletessége;
     2. a szint ára a stílus SAJÁT valutájából megy (motoros: engPay), 10-nél megáll;
     3. a Panzer a rettenetből fizet (dreadSpend);
     4. idényenként két választás, a harmadik tilos, új idényben újra kettő;
     5. a pakli-húzás (drawSkillFromPoolRaw) ~a megígért arányban adja a célt (10. szint);
     6. az 1. szinten ~15% (a véletlen alapesély fölött);
     7. a realisztikus „nem te döntesz" sorsolás (skillRealDrawBiased) is céloz;
     8. 2. hatás: 10. szinten a gép-döntés helyett MINDIG te választasz,
        1. szinten ~25%-ban;
     9. akinek nincs jogosultja, arra nem céloz (a jutalom nem vész el);
    10. a mentés viszi (a stílus-állapot része);
    11. a panel kirajzolja, a gomb vesz, a választó megerősítés után állít;
    12. Könnyed szobában a hangulatjel és az állás-jelzés is mehet;
    13. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9481;
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
  try{await p.waitForFunction(()=>typeof celSkRoll==="function"&&typeof celSkHtml==="function",
      null,{timeout:15000});}catch(e){van=false;}
  ok(van,"a célzott skill függvényei léteznek");
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
       const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};
       sl.player=pl;sl.fit=fitFor(pl,sl);sl.origin="Teszt FC";});}
    if(captainIdx<0)captainIdx=0;
    if(!coach)coach=COACHES[0];
    phase="season";S.idx=0;S.morale=80;S.seasonNumber=2;
    slots.forEach(sl=>{
      if(!sl.player)return;
      if(!careerPool[sl.player.n])careerPool[sl.player.n]={n:sl.player.n,pos:sl.player.pos.slice(),age:26};
      const e=careerPool[sl.player.n];
      if(!e.pos)e.pos=sl.player.pos.slice();
      if(!e.attrs)initPlayerAttrs(e);});
    S.skills={};
    const setStyle=k=>{
      S.style={key:k,chosenSeason:1,traits:{},ms:{done:{},seen:{},t:{}},star:null};
      S.style2=null;S.styleView=1;};
    /* 1. a görbék */
    ki.p1=[1,5,10].map(l=>Math.round(celSkP1(l)*1000)/1000);
    ki.p2=[1,5,10].map(l=>Math.round(celSkP2(l)*1000)/1000);
    ki.p0=[celSkP1(0),celSkP2(0)];
    /* 2. a motoros vásárlás */
    setStyle("villam");
    const E=engState("villam");E.pts=200;E.earned=200;E.spent=0;
    ki.vWallet=!!celSkWallet("villam");
    ki.v1=celSkBuyLevel("villam");ki.vPts1=E.pts;ki.vLvl1=celSkState("villam").lvl;
    E.pts=5;ki.vWhy=celSkBuyWhy("villam");ki.vNo=celSkBuyLevel("villam");
    E.pts=100000;
    for(let i=0;i<20;i++)celSkBuyLevel("villam");
    ki.vLvlMax=celSkState("villam").lvl;
    ki.vSpent=Math.round(100000-E.pts);
    ki.priceSum=CELSK_PRICE.slice(2).reduce((a,x)=>a+x,0);
    /* 3. Panzer */
    const sv=S.style;
    setStyle("panzer");
    let F=null;try{F=fearState();}catch(e){}
    ki.pzOn=(()=>{try{return fearOn();}catch(e){return "hiba";}})();
    if(F){F.pts=100;ki.pz1=celSkBuyLevel("panzer");ki.pzPts=F.pts;ki.pzSpent=F.spent;}
    S.style=sv;
    /* 4. idényenként kettő */
    const deck=skillDeck();
    const csat=deck.filter(x=>x.cat==="CSATAR");
    const cel=csat.find(x=>eligibleForSkill(x).length>0)||deck.find(x=>eligibleForSkill(x).length>0);
    const masik=deck.find(x=>x!==cel);
    ki.cel=cel&&cel.id;
    ki.set1=celSkSet("villam",masik.id);
    ki.set2=celSkSet("villam",cel.id);
    ki.left2=celSkValtLeft("villam");
    ki.set3=celSkSet("villam",masik.id);
    ki.idAfter3=celSkState("villam").id;
    S.seasonNumber=3;
    ki.leftUj=celSkValtLeft("villam");
    S.seasonNumber=2;
    /* 5. húzás 10. szinten */
    const N=3000;
    let hit=0;
    for(let i=0;i<N;i++){const sk=drawSkillFromPoolRaw();if(sk&&sk.id===cel.id)hit++;}
    ki.r10=hit/N;
    /* 6. 1. szinten, és célzás nélkül (alapesély) */
    celSkState("villam").lvl=1;
    hit=0;for(let i=0;i<N;i++){const sk=drawSkillFromPoolRaw();if(sk&&sk.id===cel.id)hit++;}
    ki.r1=hit/N;
    celSkState("villam").lvl=0;
    hit=0;for(let i=0;i<N;i++){const sk=drawSkillFromPoolRaw();if(sk&&sk.id===cel.id)hit++;}
    ki.r0=hit/N;
    celSkState("villam").lvl=10;
    /* 7. a realisztikus „nem te döntesz" sorsolás */
    hit=0;for(let i=0;i<N;i++){const sk=skillRealDrawBiased();if(sk&&sk.id===cel.id)hit++;}
    ki.rb10=hit/N;
    /* 8. 2. hatás */
    S.skillReal=true;
    const oPlan=skillRealPlan,oDraw=showSkillDraw,oAuto=skillRealAuto;
    let te=0,gep=0;
    skillRealPlan=()=>({mode:"auto",skill:cel,target:null});
    showSkillDraw=()=>{te++;};
    skillRealAuto=()=>{gep++;};
    const oLock=S.chSkillPickLock;S.chSkillPickLock=0;
    for(let i=0;i<400;i++)grantSkillDecide(cel,"match",1,()=>{},1,null,false);
    ki.te10=te;ki.gep10=gep;
    celSkState("villam").lvl=1;te=0;gep=0;
    for(let i=0;i<2000;i++)grantSkillDecide(cel,"match",1,()=>{},1,null,false);
    ki.te1=te/2000;
    /* más képességnél nem hat */
    celSkState("villam").lvl=10;te=0;gep=0;
    skillRealPlan=()=>({mode:"auto",skill:masik,target:null});
    for(let i=0;i<200;i++)grantSkillDecide(masik,"match",1,()=>{},1,null,false);
    ki.teMas=te;
    skillRealPlan=oPlan;showSkillDraw=oDraw;skillRealAuto=oAuto;S.chSkillPickLock=oLock;
    S.skillReal=false;
    /* 9. nincs jogosult → nem céloz */
    {const oE=eligibleForSkill;
     eligibleForSkill=sk=>sk&&sk.id===cel.id?[]:oE(sk);
     let h=0;for(let i=0;i<500;i++)if(celSkRoll())h++;
     ki.nincsJog=h;
     eligibleForSkill=oE;}
    /* 10. mentés */
    try{saveGame();saveGameFlush&&saveGameFlush();}catch(e){ki.mentHiba=String(e);}
    let talalt=false;
    try{for(let i=0;i<localStorage.length;i++){const v=localStorage.getItem(localStorage.key(i))||"";
      if(v.indexOf('"celSk"')>=0&&v.indexOf(cel.id)>=0)talalt=true;}}catch(e){}
    ki.mentve=talalt;
    ki.celId=celSkState("villam").id;
    return ki;});
  ok(t.p1[0]===0.15&&t.p1[2]===0.75&&Math.abs(t.p1[1]-(0.15+4*0.6/9))<0.002,"1. hatás: 15% → 75%, egyenletesen",t.p1);
  ok(t.p2[0]===0.25&&t.p2[2]===1&&Math.abs(t.p2[1]-(0.25+4*0.75/9))<0.002&&t.p0[0]===0&&t.p0[1]===0,"2. hatás: 25% → 100%, a 0. szinten nincs",t.p2);
  ok(t.vWallet&&t.v1&&t.vLvl1===1&&t.vPts1===180,"motoros stílus: a villámpontból fizet (−20)",{pts:t.vPts1,lvl:t.vLvl1});
  ok(!t.vNo&&/hiányzik/.test(t.vWhy),"kevés pontnál nem vesz, és megmondja, mennyi hiányzik",t.vWhy);
  ok(t.vLvlMax===10&&t.vSpent===t.priceSum,"10 szintnél megáll, az ár betűre a táblázat",{lvl:t.vLvlMax,spent:t.vSpent,sum:t.priceSum});
  ok(t.pzOn===true&&t.pz1&&t.pzPts===80&&t.pzSpent===20,"Panzer: a rettenetből fizet",{on:t.pzOn,pts:t.pzPts,spent:t.pzSpent});
  ok(t.set1&&t.set2&&t.left2===0&&!t.set3&&t.idAfter3===t.cel&&t.leftUj===2,"idényenként két választás, a harmadik tilos, új idényben újra kettő",{s:[t.set1,t.set2,t.set3],left:t.left2,uj:t.leftUj});
  ok(t.r10>0.72&&t.r10<0.83,"10. szinten a húzások ~75%-a a célzott képesség",t.r10);
  ok(t.r1>0.13&&t.r1<0.25&&t.r0<0.08,"1. szinten ~15% (+ a véletlen), célzás nélkül csak az alapesély",{r1:t.r1,r0:t.r0});
  ok(t.rb10>0.72&&t.rb10<0.83,"a realisztikus „nem te döntesz” sorsolás is céloz",t.rb10);
  ok(t.te10===400&&t.gep10===0,"10. szinten a célzott képességnél mindig te választod, ki kapja",{te:t.te10,gep:t.gep10});
  ok(t.te1>0.21&&t.te1<0.29,"1. szinten ~25%-ban te választasz",t.te1);
  ok(t.teMas===0,"más képességnél a gép döntése marad");
  ok(t.nincsJog===0,"akinek nincs jogosultja, arra nem céloz");
  ok(t.mentve&&!t.mentHiba,"a mentés viszi a célzást",t.mentHiba);

  /* 11. a panel */
  const u=await p.evaluate(()=>{
    const ki={};
    try{hubStyleSetOpen(true);}catch(e){}
    _styleSecOpen.celsk=true;
    renderStylePanel();
    const body=document.getElementById("hubStyleBody");
    ki.van=!!body.querySelector("#celSkPick")||!!body.querySelector("#celSkBuy");
    ki.szoveg=/Célzott skill/.test(body.textContent||"");
    ki.fej=[...body.querySelectorAll("[data-stylesec='celsk']")].length;
    /* új idény: újra két választás, a választó él */
    S.seasonNumber=4;
    renderStylePanel();
    const sel=document.querySelector("#hubStyleBody #celSkPick");
    ki.sel=!!sel;
    if(sel){
      const masik=[...sel.options].find(o=>o.value&&o.value!==celSkState("villam").id);
      sel.value=masik.value;sel.dispatchEvent(new Event("change"));
      ki.modal=!document.getElementById("hubTacticConfirmModal").classList.contains("hide");
      ki.meg=celSkState("villam").id;
      document.getElementById("hubTacticConfirmYes").click();
      ki.utana=celSkState("villam").id;ki.cel=masik.value;
      ki.left=celSkValtLeft("villam");}
    /* gomb: a 10. szinten letiltva áll */
    const bb=document.querySelector("#hubStyleBody #celSkBuy");
    ki.btnDis=bb?bb.disabled:null;
    celSkState("villam").lvl=3;engState("villam").pts=1000;
    renderStylePanel();
    document.querySelector("#hubStyleBody #celSkBuy").click();
    ki.lvlKatt=celSkState("villam").lvl;
    return ki;});
  ok(u.van&&u.szoveg&&u.fej===1,"a 🎯 Célzott skill szakasz kirajzolódik a stílus-panelen",u);
  ok(u.sel&&u.modal&&u.meg!==u.cel&&u.utana===u.cel&&u.left===1,"a választó megerősítést kér, és csak az „igen” után állít",u);
  ok(u.btnDis===true&&u.lvlKatt===4,"a gomb a tetőn letiltva, alatta egy koppintás egy szint",{dis:u.btnDis,lvl:u.lvlKatt});
  /* MELLÉKJAVÍTÁS: Könnyed (saját bajnokságos) szobában a társnak küldött
     hangulatjel és állás-jelzés nem ütközhet a „közös szoba kell" falba. */
  const sv=await p.evaluate(()=>{
    const o={h:h2hRoomActive,r:mpRoomOn,mode:mpNet.mode,room:MP.activeRoom};
    h2hRoomActive=()=>false;mpRoomOn=()=>true;mpNet.mode="fb";MP.activeRoom="TESZT1";
    const ki={ping:mpPingWhyNot(),allas:mpAllasWhyNot()};
    mpRoomOn=()=>false;ki.nincs=mpPingWhyNot();
    h2hRoomActive=o.h;mpRoomOn=o.r;mpNet.mode=o.mode;MP.activeRoom=o.room;
    return ki;});
  ok(!/közös szoba kell/.test(sv.ping)&&!/közös szoba kell/.test(sv.allas)&&/közös szoba kell/.test(sv.nincs),
    "Könnyed szobában a hangulatjel és az állás-jelzés is mehet (szoba nélkül nem)",sv);
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
