/* 🧭📐🏆⚡🪁 1.0.12.18.02 — HAT ÚJ JEGYZET
   KIMONDOTT KÉRÉS (🐞 jmwzf2h7v8ypc): „Csapatépítés menüponton belül ha megnyitom a cuccokat, és utána bezárom, majdnem
     mind visszadob a HUBba továbbra is. […] Bezárom és ott találom magam, ahol megnyitottam az imént azt az almenupotnot."
   KIMONDOTT KÉRÉS (🐞 jmx03zjtt3oqf): „Klub arculata menupontbol akár mentéssel, akár x-szel lélek ki, a HUBba dob, nem a
     menübe vissza. Stadionnál pedig csak az x-szel ugrik a HUBba a menü helyett"
   KIMONDOTT KÉRÉS (🐞 jmx04ehoy8cip): „Ha a büdzsé részt lenyitjuk, akkor elcsúszik az egész kijelző, mert túlfutón vannak
     szövegrészek. Javítsuk."
   KIMONDOTT KÉRÉS (🐞 jmx03uqmkjva9): „1 fordulóval később kapjuk meg a kupában a jutalmat bizonyos kihívásokért. Pl. 10
     gólos különbséggel kellett nyerni egy párharcot"
   KIMONDOTT KÉRÉS (🐞 jmx03szue53hq): „Száguldás gólnál nem igazán látszik, mi történik. Legyen távolabbi kamerával véve az
     egész, hogy látsszanak a játékosok a szélén, akik adogatnak"
   KIMONDOTT KÉRÉS (🐞 jmx0447hddba4): „…az ilyen gólok felé maradjon meg animáció szintén ugyanilyen, csak A feed legyen
     hozzaigazitva […] a másik felében az eseteknek pedig maradjon A feed szöveg, és az animációt kell megcsinálni a szögletre"
   Amit mér:
     1. menü-módban nincs navigációs dokk (az alsó menüpontokra lógott); a HUB-on menü nélkül van;
     2. a védőháló: ha a HUB egy pillanatra eltűnik (a menü felejtődik), a visszatéréskor a menü a nyitott füllel
        visszaáll; a felhasználó saját kilépése után nem;
     3. a 🐞 jegyzet helye viszi a menü-naplót (ki és honnan hagyta el a menüt);
     4. a lenyitott büdzsé hosszú sorral sem szélesebb a képernyőnél;
     5. a kupa-párharc lezárásakor (k:"tie") a kihívás-beváltás azonnal lefut, nem a következő meccs után;
     6. a Száguldás nyitó felvétele széles totál (mindkét szélső, legfeljebb 70 m);
     7. a fejes gól két sora: „… ELHÚZOTT A SZÉLEN, BEADTA — FEJJEL!" → beadás-jelenet, „SZÖGLET UTÁN, FEJJEL!" →
        szöglet-jelenet góllal (fejes befejezés, háló);
     8. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah",PORT=9683;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const srv=http.createServer((req,rp)=>{let f=decodeURIComponent(req.url.split("?")[0]);if(f==="/")f="/index.html";
  const abs=path.join(ROOT,f);if(!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",f.endsWith(".html")?"text/html; charset=utf-8":"application/octet-stream");fs.createReadStream(abs).pipe(rp);});
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox"]});
  let hiba=0;const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,700):""));if(!c)hiba++;};
  const errs=[];
  const p=await (await b.newContext({viewport:{width:375,height:834}})).newPage();
  p.on("pageerror",e=>errs.push(String(e)));
  await p.addInitScript(()=>{window.HANG_TESZT=true;window.JSAV_TESZT=true;try{localStorage.setItem("magyah_tudas_v1","kezdo");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2500);
  await p.evaluate(()=>{
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
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    startFirstSeason();
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    openHubMidSeason();window.saveGame=()=>{};
    const m=document.getElementById("mgmtOk");if(m&&m.offsetParent)m.click();
    S.bondsSeeded=true;S.guideOn=false;});
  await p.waitForTimeout(2500);
  await p.evaluate(()=>{document.querySelectorAll("#chPop,#mgmtModal,#guideDim,#guideTip").forEach(e=>e.classList.add("hide"));S.kut=null;window.saveGame=()=>{};try{renderHub();}catch(e){}});
  /* 1. dokk */
  const r1=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const dk=()=>!document.getElementById("navDock").classList.contains("hide");
    hubMenuExit();_navDock.tick();const kint=dk();hubMenuToggle(true,true);_navDock.tick();const bent=dk();hubMenuExit();_navDock.tick();return {kint,bent,vissza:dk()};});
  ok(r1.kint&&!r1.bent&&r1.vissza,"1. menü-módban nincs navigációs dokk, a HUB-on van",r1);
  /* 2–3. védőháló + napló */
  const r2=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    hubMenuExit();hubMenuToggle(true,true);
    const g=document.getElementById("hubCoachBtn").closest(".hubGroup");if(!g.classList.contains("open"))g.querySelector(".accHead").click();
    _hubMenuY=scrollY;
    const sc=document.getElementById("scHub");sc.classList.add("hide");await w(30);
    const elfelejt=!_inHubMenu;
    sc.classList.remove("hide");await w(60);
    const o={elfelejt,menu:_inHubMenu,acts:!document.getElementById("hubActions").classList.contains("hide"),ful:g.classList.contains("open")};
    hubMenuToggle(false);sc.classList.add("hide");await w(30);sc.classList.remove("hide");await w(60);
    o.userUtan=_inHubMenu;
    const h=devHely();o.naplo=(h.menuNaplo||[]).slice(-4);
    return o;});
  ok(r2.elfelejt&&r2.menu&&r2.acts&&r2.ful&&!r2.userUtan,"2. a HUB pillanatnyi eltűnése után a menü a nyitott füllel visszaáll; a saját kilépés után nem",r2);
  ok(r2.naplo.length>=2&&r2.naplo.some(x=>/elhagy/.test(x))&&r2.naplo.some(x=>/visszaallit/.test(x)),"3. a 🐞 jegyzet helye viszi a menü-naplót",r2.naplo);
  /* 4. büdzsé */
  const r4=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    hubMenuExit();hubBudgetToggle(true);await w(300);
    const bx=document.querySelector("#hubBudgetBreak");if(!bx)return {nincs:true};
    const row=document.createElement("div");row.className="bbRow";
    row.innerHTML='<span>…bér / szerződéskori lelátó</span><b class="down">142% (a plafon fölött — plafon 125%) · −12 Mrd 345 M Ft/meccs</b>';bx.appendChild(row);
    const r2=document.createElement("div");r2.className="bbRow";r2.innerHTML='<span>forrás: mpChallengeRewardAfterMatchHandlerSuperLongName←anotherVeryLongFunctionName</span><b>+999 Mrd 999 M Ft</b>';bx.appendChild(r2);await w(80);
    const o={W:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth};row.remove();r2.remove();hubBudgetToggle(false);return o;});
  ok(!r4.nincs&&r4.sw<=r4.W,"4. a lenyitott büdzsé hosszú sorral sem szélesebb a képernyőnél",r4);
  /* 5. kupa-kihívás azonnal */
  const r5=await p.evaluate(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));
    const _s=window.settleEarlyChallenges;let n=0;window.settleEarlyChallenges=()=>{n++;};
    const E0=S.euro;S.euro={path:[],comp:Object.keys(EURO_COMPS)[0],chal:{}};
    try{euroPathPush({k:"ko",round:"r16",leg:0,mine:5,theirs:0});await w(40);const ko=n;
      euroPathPush({k:"tie",round:"r16",mine:9,theirs:1,won:true,opp:"X"});await w(40);
      const st=cupChalStat();return {ko,tie:n,aggMax:st.aggMax,ok:challengeSatisfied({type:"cupAgg",target:8})};}
    finally{S.euro=E0;window.settleEarlyChallenges=_s;}});
  ok(r5.ko===0&&r5.tie===1&&r5.aggMax===8&&r5.ok,"5. a párharc lezárásakor a kihívás-beváltás azonnal lefut (a +8-as összesítés teljesít)",r5);
  /* 6–7. jelenetek */
  const r6=await p.evaluate(()=>{const p9=slots[9].player.n;
    const fut=(ev,sk)=>{const c=evaKontextus(ev);const F0=kamForgatokonyv(c,ev,sk);return {F0:JSON.parse(JSON.stringify({vagas:F0.vagas,arch:F0.arch})),F:kamKimenetel(F0,c,ev,sk)};};
    const ev={t:"gol",side:"us",p:p9,min:30,seq:2,skill:"akc_szaguld"};const sk=evaSkillSablon(ev);
    const sz=fut(ev,sk);const v0=sz.F0.vagas[0];
    const alt=t=>{for(const [re,a] of MEV_GOL_ALT)if(re.test(t))return a;return null;};
    const a1=alt("41'  Kovács ELHÚZOTT A SZÉLEN, BEADTA — FEJJEL! GÓL! Szabó  1:0"),a2=alt("41'  SZÖGLET UTÁN, FEJJEL! GÓL! Szabó  1:0");
    const g1=fut({t:"gol",side:"us",p:p9,min:41,seq:3,alt:a1},"gol"),g2=fut({t:"gol",side:"us",p:p9,min:41,seq:3,alt:a2},"gol");
    return {sk,v0:{n:v0.n,tav:v0.tav,f:v0.f},a1,a2,arch1:g1.F0.arch,arch2:g2.F0.arch,kim2:g2.F.kim,halo2:!!g2.F.halo,fej2:g2.F.hang.some(h=>h[1]==="aErintes")};});
  ok(r6.sk==="skSzaguld"&&r6.v0.tav>=60&&["t2","pa","lo"].every(k=>r6.v0.f.includes(k)),"6. a Száguldás nyitó felvétele széles totál, mindkét szélsővel",r6.v0);
  ok(r6.a1==="fejes"&&r6.a2==="szogletfej"&&r6.arch1==="beadas"&&r6.arch2==="szoglet"&&r6.kim2==="gol"&&r6.halo2&&r6.fej2,"7. a beadásos sor → beadás-jelenet, a szöglet-sor → szöglet-jelenet fejes góllal",r6);
  ok(errs.length===0,"8. nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);
})();
