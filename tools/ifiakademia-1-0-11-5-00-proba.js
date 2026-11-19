/* 🌱 1.0.11.5.00 — AZ IFIAKADÉMIA SAJÁT SZINTJE, IRÁNYA ÉS SZAKEMBEREI + AZ IFI POT A MEZŐNYHÖZ.
   KÉRÉS: „már 8. fordulótól nyíljon meg a lehetőség, hogy az ifiakadémiának
   beállítsunk különböző célokat, fókuszokat […] gyakrabban, vagy inkább
   magasabb minőségben […] ifiakadémia xp […] 1, 2, 3 szakembert […] az
   ifisek POT-ját tovább kéne hangolni" (200 fölött 25k POT 100k+ mezőnyben).
   Amit mér:
     1. a nyitás: az 1. idény 7. fordulójáig zárva (a panel 🔒), a 8.-tól
        nyitva, a 2. idénytől mindig;
     2. az XP: meccs +1, saját nevelésű a pályán +2/gól +3/gólpassz +2/MVP +4,
        felvett ifi +40 (markArrived), ifi-eladás +30…+100, új idény a
        csapaterő-növekedés ×6; a szintlépés naplósora;
     3. a szint: küszöbök, az irány tartománya (±1/±2/±3), a szakemberhelyek
        (1/2/3), az erő 0,35 + 0,065 · szint;
     4. az új tehetség POT-ja 200-as mezőnyben a mezőny POT-jához horgonyoz
        (medián ≥ 75 %), a karrier elején (eltolás nélkül) nem változik;
     5. az irány: „gyakrabban" köztes ablakot nyit, „minőség" ritkít és
        javít; a tehetségvadász és a szint emeli a POT-ot;
     6. a szakemberek: poszt-edző a posztot, attribútum-edző a tengelyt,
        skill-mester a kész skillt (a felvételkor meg is kapja), a
        tehetségvadász a bent nevelt ifik fejlődését;
     7. a visszatérő ifi POT-ja a felhozott csúcsához áll;
     8. a panel: irány-gomb, fókusz, szakember választása és célja kattintással,
        a felirat a hatást mondja; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT="/home/user/Magyah", PORT=9231;
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
    phase="season";
    window.saveGame=()=>{};window.saveGameNow=()=>{};
    const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
    /* 1. nyitás */
    S.ifiAk=null;S.seasonNumber=1;S.idx=7;
    ki.nyit7=ifiAkNyitva();ki.panel7=/🔒/.test(ifiAkPanelHtml());
    S.idx=8;ki.nyit8=ifiAkNyitva();
    S.ifiAk=null;S.seasonNumber=2;S.idx=0;ki.nyit2=ifiAkNyitva();
    S.seasonNumber=3;S.idx=11;
    /* 2. XP */
    S.ifiAk=null;
    const xi=slots.map(s=>s.player);
    const sajat=xi[3].n;careerPool[sajat].from={akad:1,sz:1};
    const active=xi.map(p=>({p,share:1}));
    const mS={},mA={};mS[sajat]=2;mA[sajat]=1;
    ifiAkMeccsUtan(active,mS,mA,3);
    ki.xpMeccs={xp:ifiAk().xp,vart:1+2+2*3+2+4,forras:Object.assign({},ifiAk().forras)};
    const x0=ifiAk().xp;
    const pr=generateAcademyPlayer();extraRoster.push(pr);markArrived(pr,0,true);
    ki.xpFelvett=ifiAk().xp-x0;
    const x1=ifiAk().xp;ifiAkEladas(sajat,boostUnitPrice()*3);ki.xpEladas=ifiAk().xp-x1;ki.xpEladasVart=30+Math.min(70,Math.round(20*Math.log2(4)));
    const x2=ifiAk().xp;ifiAkEladas(xi[4].n,1e9);ki.xpIdegen=ifiAk().xp-x2;
    const x3=ifiAk().xp;ifiAkUjIdeny(teamStrength()-2.5);ki.xpIdeny=ifiAk().xp-x3;
    const _al=addLine;const sorok=[];addLine=(t,c)=>{sorok.push(String(t));return _al(t,c);};
    ifiAk().xp=95;ifiAk().szintLatott=1;ifiAkXp("csapat",10);addLine=_al;
    ki.szintLep=ifiAkSzint();ki.szintNaplo=sorok.some(t=>/2\. szintre/.test(t));
    /* 3. szintek */
    ki.szint={x0:ifiAkSzint(0),x99:ifiAkSzint(99),x100:ifiAkSzint(100),x3200:ifiAkSzint(3200),x9999:ifiAkSzint(9999)};
    ki.irMax=[1,3,4,6,7,10].map(L=>ifiAkIranyMax(L));
    ki.hely=[1,3,4,6,7,10].map(L=>ifiAkSzakHely(L));
    ki.ero=[1,10].map(L=>+ifiAkSzakEro(L).toFixed(3));
    /* 4. a POT horgonya */
    const gen=(N)=>{const P=[],K=[],pos=[],g=[];for(let i=0;i<N;i++){const pl=generateAcademyPlayer();const e=careerPool[pl.n];P.push(e.pot);K.push(e.peak);pos.push(e.pos[0]);g.push(e);}return {P,K,pos,g};};
    const szint=(F,inf)=>{oppTargetRating=F;infinityMode=inf;};
    S.ifiAk={v:1,xp:0,forras:{},irany:0,fokusz:null,szak:[],nyitva:1};
    szint(200,true);let G=gen(150);ki.pot200={med:med(G.P),mezony:peakToPot(200),csucs:Math.round(med(G.K))};
    szint(80,false);const sh=marketPeakShift();G=gen(150);ki.pot80={shift:sh,med:med(G.P),max:Math.max(...G.P)};
    /* 5. irány és szint */
    szint(200,true);
    S.ifiAk={v:1,xp:3200,forras:{},irany:3,fokusz:null,szak:[],nyitva:1};
    let km=0;for(let i=0;i<3000;i++)if(ifiAkUjKimarad())km++;ki.kimarad3=+(km/3000).toFixed(3);
    G=gen(150);ki.potMin3=med(G.P);
    S.ifiAk.irany=-3;let ka=0;for(let i=0;i<3000;i++)if(ifiAkKoztesAblak())ka++;ki.koztes3=+(ka/3000).toFixed(3);
    ki.kimaradGyak=ifiAkUjKimarad();
    G=gen(150);ki.potGyak3=med(G.P);
    S.ifiAk={v:1,xp:0,forras:{},irany:5,fokusz:null,szak:[],nyitva:1};ki.iranyVagott=ifiAkIrany();
    /* 6. szakemberek (10. szint) */
    S.ifiAk={v:1,xp:3200,forras:{},irany:0,fokusz:null,szak:[{t:"poszt",c:"CS"},{t:"attr",c:"passz"},{t:"skill",c:null}],nyitva:1};
    G=gen(200);ki.csArany=+(G.pos.filter(p=>p==="CS").length/200).toFixed(3);
    ki.attrDb=G.g.filter(e=>e.ifiAkAttr&&e.ifiAkAttr.passz>0).length;
    const skv=skillDeck().find(x=>x.cat==="VEDO");
    S.ifiAk.szak=[{t:"skill",c:skv.id}];
    G=gen(300);
    const kesz=G.g.filter(e=>e._giftSkills&&e._giftSkills[0]===skv.id);
    ki.skill={db:kesz.length,mind_vedo:kesz.every(e=>getCategoryFor(e.pos[0])==="VEDO"),vedoArany:+(G.g.filter(e=>getCategoryFor(e.pos[0])==="VEDO").length/300).toFixed(3)};
    if(kesz.length){const pl=careerPlayerFromPoolEntry(kesz[0]);extraRoster.push(pl);markArrived(pl,0,true);
      ki.skillMegkapta=(S.skills[pl.n]||[]).some(i=>i.skill&&i.skill.id===skv.id);}
    S.ifiAk.szak=[{t:"tehetseg",c:"*"}];
    const e1={n:"x",age:17,pos:["CS"]};ki.fejl={teh:+ifiAkFejlodesSzorzo(e1).toFixed(3),vart:+(1+0.30*ifiAkSzakEro(10)).toFixed(3)};
    S.ifiAk.szak=[{t:"poszt",c:"KP"}];ki.fejlMas=ifiAkFejlodesSzorzo(e1);
    /* a szakember-hely a szinten túl nem dolgozik */
    S.ifiAk={v:1,xp:0,forras:{},irany:0,fokusz:null,szak:[{t:"tehetseg",c:"*"},{t:"poszt",c:"CS"}],nyitva:1};
    ki.aktivL1=ifiAkSzakok().length;
    /* 7. visszatérő ifi POT-ja */
    S.ifiAk={v:1,xp:0,forras:{},irany:0,fokusz:null,szak:[],nyitva:1};
    szint(200,true);
    const vp=generateAcademyPlayer();const ve=careerPool[vp.n];
    ve.age=19;ve.pot=800;ve.peak=potToPeakOvr(800);ve.startRating=60;
    S.academy=[{n:vp.n,leftAge:17,leftRating:120,leftSeason:1,offerSeason:1,times:1}];
    const L=academyReturnLift(S.academy[0]);
    ki.vissza={lifted:L&&L.lifted,after:L&&L.after,pot:ve.pot,peak:Math.round(ve.peak),vart:Math.min(potHardCap(),peakToPot(ve.peak)),potElotte:L&&L.potElotte};
    /* 8. a panel */
    S.ifiAk={v:1,xp:500,forras:{csapat:300,felvett:200},irany:0,fokusz:null,szak:[],nyitva:1};
    openAcademyPanel();
    const q=s=>document.querySelector("#acadBody "+s);
    q('[data-iair="1"]').click();ki.uiIrany=ifiAk().irany;
    ki.uiTiltott=!!q('[data-iair="3"]').disabled;
    q('[data-iafok="CSATAR"]').click();ki.uiFokusz=ifiAk().fokusz;
    q('[data-iaszt="0:poszt"]').click();
    const sel=q('[data-iasc="0"]');sel.value="BSZ";sel.dispatchEvent(new Event("change"));
    ki.uiSzak=JSON.stringify(ifiAk().szak[0]);
    ki.uiSzoveg=/BSZ posztra születik/.test(document.getElementById("acadBody").textContent);
    ki.uiZarHely=document.querySelectorAll("#acadBody .iaSzak.zar").length;
    return ki;});
  console.log(JSON.stringify(r));
  await p.waitForTimeout(900);
  await p.screenshot({path:path.join(process.env.SHOT_DIR||"/tmp","ifiak-panel.png"),fullPage:false});

  ok(!r.nyit7&&r.panel7&&r.nyit8&&r.nyit2,"1. a nyitás: 1. idény 7. fordulójáig zárva (🔒), a 8.-tól és a 2. idénytől nyitva",{a:r.nyit7,b:r.nyit8,c:r.nyit2});
  ok(r.xpMeccs.xp===r.xpMeccs.vart,"2a. meccs-XP: +1 + pályán 2 + 2 gól·3 + gólpassz 2 + MVP 4",r.xpMeccs);
  ok(r.xpFelvett===40,"2b. felvett ifi +40",r.xpFelvett);
  ok(r.xpEladas===r.xpEladasVart&&r.xpIdegen===0,"2c. ifi-eladás +30 + log-skála; idegen eladása 0",[r.xpEladas,r.xpEladasVart,r.xpIdegen]);
  ok(r.xpIdeny===15,"2d. új idény: +2,5 csapaterő × 6 = 15",r.xpIdeny);
  ok(r.szintLep===2&&r.szintNaplo,"2e. szintlépés + naplósor",[r.szintLep,r.szintNaplo]);
  ok(r.szint.x0===1&&r.szint.x99===1&&r.szint.x100===2&&r.szint.x3200===10&&r.szint.x9999===10,"3a. a szint-küszöbök",r.szint);
  ok(JSON.stringify(r.irMax)==="[1,1,2,2,3,3]"&&JSON.stringify(r.hely)==="[1,1,2,2,3,3]","3b. irány-tartomány és szakember-hely",[r.irMax,r.hely]);
  ok(r.ero[0]===0.415&&r.ero[1]===1,"3c. erő 0,415 → 1,00",r.ero);
  ok(r.pot200.med>=0.75*r.pot200.mezony,"4a. 200-as mezőny: az új ifi medián POT-ja a mezőnyé ≥ 75 %-a (régen 58 300 / 164 180)",r.pot200);
  ok(r.pot80.shift<=0&&r.pot80.max<=5500,"4b. a karrier elején (eltolás nélkül) a régi sáv (≤ 5500)",r.pot80);
  ok(Math.abs(r.kimarad3-0.6)<0.04&&!r.kimaradGyak,"5a. minőség +3: az új felfedezés ~60 %-ban kimarad; gyakrabban nem",[r.kimarad3]);
  ok(Math.abs(r.koztes3-0.9)<0.03,"5b. gyakrabban −3: köztes ablak ~90 %",r.koztes3);
  ok(r.potMin3>r.potGyak3*1.3,"5c. a minőség-irány érezhetően nagyobb POT-ot ad, mint a gyakoriság",[r.potMin3,r.potGyak3]);
  ok(r.iranyVagott===1,"5d. 1. szinten a +5 iránykérés ±1-re vágva",r.iranyVagott);
  ok(r.csArany>=0.55,"6a. poszt-edző (CS, 10. szint): ≥ 55 % CS",r.csArany);
  ok(r.attrDb===200,"6b. attribútum-edző: minden új ifi kap passz-többletet",r.attrDb);
  ok(r.skill.db>=40&&r.skill.mind_vedo&&r.skill.vedoArany>0.45,"6c. skill-mester: védőnek kész skill, a védők aránya nő",r.skill);
  ok(r.skillMegkapta===true,"6d. a felvételkor a kész skill a játékosé",r.skillMegkapta);
  ok(r.fejl.teh===r.fejl.vart&&r.fejlMas===1,"6e. tehetségvadász: +30 %·erő fejlődés; más posztú poszt-edző nem gyorsít",[r.fejl,r.fejlMas]);
  ok(r.aktivL1===1,"6f. 1. szinten csak az 1. hely dolgozik",r.aktivL1);
  ok(r.vissza.lifted&&r.vissza.pot===r.vissza.vart&&r.vissza.potElotte===800&&r.vissza.pot>800,"7. a visszatérő ifi POT-ja a felhozott csúcsához áll (800 → a csúcs POT-ja)",r.vissza);
  ok(r.uiIrany===1&&r.uiTiltott&&r.uiFokusz==="CSATAR"&&r.uiSzak==='{"t":"poszt","c":"BSZ"}'&&r.uiSzoveg&&r.uiZarHely===1,"8. a panel: irány, fókusz, szakember és cél kattintással; a zárt hely (4. szint: 1)",{i:r.uiIrany,t:r.uiTiltott,f:r.uiFokusz,s:r.uiSzak,sz:r.uiSzoveg,z:r.uiZarHely});
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  await b.close();srv.close();process.exit(hiba?1:0);})();
