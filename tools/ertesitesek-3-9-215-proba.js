/* 🔔 3.9.215 — ÉRTESÍTÉSEK A JÁTÉKON BELÜL

   KIMONDOTT KÉRÉS: „1. Nem működik a szundi gomb, legalábbis nem tartós.
   2. Vannak értesítések, amik helytelenül popupolnak folyamatosan. Pl
   megbízás a középpályán. 3. Legyenek értesítések arra, amikor új dolgok
   megnyílnak, vagy elérhető lesz az áruk: pl emlékezetes meccs után
   szurkolói hangzás megnyílik a klub arculata menüben, elérhető árú a scout
   fejlesztés, vagy van felhasználatlan átigazolási esemény stb."

   Amit mér:
     1. A SZUNDI: a ⏳ az idény végéig (legalább 5 fordulóig) hallgattat el;
        a téma megújulása (új stíluspont) nem törli; a push-jelöltek közt
        addig nincs; a Vezetés menüben „Ébresztés" gombbal visszahozható;
     2. A MEGBÍZÁS: alapbeállításon esedékes; ha egy középpályás megbízása
        nem alap, NEM esedékes (a régi kód a szezon-szerepek tábláját nézte,
        ott ez esedékes maradt); a választó megnyitása is elintézi; a
        kezdőrúgás előtti push-ok közt már nincs;
     3. AZ ÚJDONSÁGOK: az első futás csendben jegyez; utána egy új lelátó, a
        megfizethető scout-fejlesztés (csillagszintenként egyszer) a HUB-ban
        a felül beúszó sávon jelenik meg 🆕 címkével, szundi nélkül; a
        „Mutasd" a lelátónál az arculat-panel lelátó-szakaszát nyitja;
        kikapcsolva csendben jegyez (a visszakapcsoláskor nem zúdul rád). */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9257;
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

  /* A DÍSZLET: felállt karrier-keret, a HUB-ban, 2. idény 10. forduló */
  const r0=await p.evaluate(()=>{
    unlockGatesOn=()=>false;
    gameMode="career";enterCareerSetupFromHome(true);beginNewGame();
    const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
    showChemistry=()=>{};S.pyr=null;S.idx=0;
    pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
    pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
    renderPyrDivPick();pyrPickGap=2;pyrConfirmDiv();
    if(!careerPool)careerPool=initCareerPlayerPool({stars:2.5});
    slots.forEach((sl,i)=>{if(sl.player)return;const src=sq.players[i%sq.players.length];
      const pl={n:src.n,ovr:src.ovr,pos:(src.pos||[sl.pos]).slice(),age:26};sl.player=pl;sl.fit=fitFor(pl,sl);});
    slots.forEach(sl=>{const pl=sl.player;if(!pl)return;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:pl.pos.slice(),age:26,startRating:pl.ovr,peak:pl.ovr,pot:3000};
      const e=careerPool[pl.n];if(!e.attrs)initPlayerAttrs(e);});
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout={name:"Próba",stars:2};
    window.saveGame=()=>{};
    S.seasonNumber=2;S.idx=10;S.transferBudget=0;
    return {v:APP_VERSION,mode:teachMode()};});
  ok(String(r0.v).localeCompare("3.9.215",undefined,{numeric:true})>=0,"a verzió legalább 3.9.215",r0.v);

  console.log("\n— 1. a szundi —");
  const r1=await p.evaluate(()=>{
    const o={};
    const t=teachStateObj();
    /* egy push-téma: az edzésterv hiánya (a kezdőrúgás előtt szól) */
    S.training=null;
    const k="train:plan";
    o.esedekes=teachDueList(null).includes(k);
    /* a sáv: a téma épp kint van, ⏳ */
    _vezPushQ=[k];vezPushNext();
    const most=teachNow();
    document.getElementById("vezPushLater").click();
    const rec=teachTopicRec(k);
    o.snooze=rec.snooze-most;
    o.idenyVege=S.seasonNumber*30-most;
    o.utana=teachDueList(null).includes(k);
    /* 4 forduló múlva sem — a régi szundi 3 forduló után lejárt */
    S.idx+=4;o.negyUtan=teachDueList(null).includes(k);
    o.jelolt=vezPushJelolt("meccs").includes(k);
    /* a következő idényben újra szól */
    const sv=[S.seasonNumber,S.idx];S.seasonNumber=3;S.idx=0;
    o.kovIdeny=teachDueList(null).includes(k);
    S.seasonNumber=sv[0];S.idx=sv[1];
    /* a megújuló téma (sig) nem törli: stíluspont-téma kézi szundival, majd új aláírás */
    const sp=teachTopicRec("style:spend");sp.sig="p1";sp.snooze=teachNow()+8;
    const d=TEACH_TOPICS["style:spend"],eredSig=d.sig;d.sig=()=>"p2";
    teachDueList(null);
    o.sigUtan=sp.snooze>teachNow();
    d.sig=eredSig;
    /* ébresztés a Vezetés menüből */
    renderTeachPanel();
    const btn=[...document.querySelectorAll("#hubTeachBody .tchTopic")].find(x=>x.getAttribute("data-k")===k);
    o.gomb=btn?btn.textContent.trim():null;
    o.allapot=(()=>{try{return teachTopicStateLabel(k).x;}catch(e){return null;}})();
    if(btn)btn.click();
    o.ebredt=!teachTopicRec(k).snooze&&!teachTopicRec(k).muted&&teachDueList(null).includes(k);
    S.training={main:{stat:"ved"}};
    return o;});
  ok(r1.esedekes,"előfeltétel: az edzésterv-téma esedékes",r1);
  ok(r1.snooze===Math.max(5,r1.idenyVege)&&!r1.utana,"a ⏳ az idény végéig (legalább 5 fordulóig) hallgattat el",r1);
  ok(!r1.negyUtan&&!r1.jelolt,"4 forduló múlva sem szól (a régi szundi 3 után lejárt), push-jelölt sincs",r1);
  ok(r1.kovIdeny,"a következő idényben újra szólhat",r1.kovIdeny);
  ok(r1.sigUtan,"a téma megújulása (új stíluspont) nem törli a szundit",r1.sigUtan);
  ok(r1.gomb==="Ébresztés"&&/szundi/.test(r1.allapot||""),"a Vezetés menüben kiírja a szundit, és „Ébresztés\" gombot ad",[r1.gomb,r1.allapot]);
  ok(r1.ebredt,"az ébresztés után a téma újra esedékes (nem némul el)",r1.ebredt);

  console.log("\n— 2. a megbízás a középpályán —");
  const r2=await p.evaluate(()=>{
    const o={};
    const t=teachStateObj();delete t.topics["mid:role"];
    S.roles=null;
    /* alakzat, amiben van középső középpályás */
    o.form=form;
    o.vanKozep=FORMS[form].slots.some((x,i)=>isMidRoleSlot(form,i));
    o.alap=teachDueList(null).includes("mid:role");
    /* egy középpályás megbízása nem alap → elintézve (a régi kód itt is szólt) */
    const i=FORMS[form].slots.findIndex((x,j)=>isMidRoleSlot(form,j));
    const opts=slotRoleOptions(form,i),masik=opts.find(c=>c!==FORMS[form].slots[i]);
    setSlotRole(form,i,masik);
    o.beallitva=teachDueList(null).includes("mid:role");
    setSlotRole(form,i,FORMS[form].slots[i]);   /* vissza az alapra */
    o.visszaAlap=teachDueList(null).includes("mid:role");
    /* a választó megnyitása: megnézte, az alapnál maradt — döntött */
    openHubMidRolePicker({type:"slot",idx:i});
    $("hubMidRolePicker").classList.add("hide");
    o.megnezte=teachDueList(null).includes("mid:role");
    o.push=!!VEZ_PUSH["mid:role"];
    return o;});
  ok(r2.vanKozep&&r2.alap,"alapbeállításon (és a választó megnyitása előtt) esedékes",r2);
  ok(!r2.beallitva,"ha egy középpályás megbízása nem alap, NEM esedékes (a régi kód itt is szólt)",r2);
  ok(r2.visszaAlap,"visszaállítva az alapra (megnyitás nélkül) újra esedékes",r2.visszaAlap);
  ok(!r2.megnezte,"a választó megnyitása elintézi — aki megnézte és az alapnál maradt, döntött",r2.megnezte);
  ok(!r2.push,"a kezdőrúgás előtti push-ok közt már nincs (tanács, nem sürgős)",r2.push);

  console.log("\n— 3. az újdonságok —");
  /* a HUB látszik, nyugalmi helyzet */
  await p.evaluate(()=>{
    phase="hub";S.auto=false;S.playing=false;
    /* a HUB első bevezető tippje kint állna (_guideCur) — az újdonság helyesen
       kivárná; a „csak emlékeztetők" fokozat lezárja a tippet */
    teachSetMode("light");
    document.querySelectorAll("section.card").forEach(x=>x.classList.add("hide"));
    $("scHub").classList.remove("hide");
    try{renderHub();}catch(e){}
    const t=teachStateObj();delete t.uj;delete t.ujInit;delete t.ujOff;
    _vezPushQ=[];vezPushHide();
    msT().exciteMax=70;     /* a „Hazai mag" már nyitva */
    S.transferBudget=0;});
  const varj=async(ms)=>{await p.waitForTimeout(ms);};
  /* ÁLLAPOTRA VÁRUNK, nem fix időre: a figyelő 700 ms-onként fut és 1500 ms
     nyugalmat vár, tehát az első futás legrosszabb esetben ~2,8 mp — terhelt
     gépen (teljes regresszió) a régi fix 2,6 mp kevés volt. A tagadó
     ellenőrzéseknél („nem szól újra") a fix várakozás marad. */
  const varjAmig=async(fn,ms)=>{try{await p.waitForFunction(fn,null,{timeout:ms||10000});}catch(e){}};
  await varjAmig(()=>{const t=teachStateObj();return !!(t&&t.ujInit);});
  const r3a=await p.evaluate(()=>{const t=teachStateObj();
    return {init:!!t.ujInit,lelato:(t.uj&&t.uj.lelato)||[],sor:_vezPushQ.length,most:_vezPushMost?1:0};});
  ok(r3a.init&&r3a.lelato.includes("hazai")&&r3a.sor===0&&!r3a.most,"az első futás csendben jegyez (a már nyitott lelátóról nem szól)",r3a);
  /* egy emlékezetes meccs: 86-os izgalom → az Ultrák lelátó nyílik */
  await p.evaluate(()=>{msT().exciteMax=86;});
  await varjAmig(()=>{const el=$("vezPush");return !!(el&&!el.classList.contains("hide")&&el.classList.contains("uj"));});
  const r3b=await p.evaluate(()=>{const el=$("vezPush"),m=_vezPushMost;
    return {lat:!!(el&&!el.classList.contains("hide")),uj:!!(el&&el.classList.contains("uj")),
      cim:el?el.querySelector("#vezPushTx b").textContent:"",kis:el?el.querySelector("#vezPushTx small").textContent:"",
      szundiRejtve:!!(el&&el.querySelector("#vezPushLater").classList.contains("hide")),k:m&&m.k};});
  ok(r3b.lat&&r3b.uj&&/Új lelátó nyílt: Ultrák a kapu mögött/.test(r3b.cim)&&/Újdonság/.test(r3b.kis),"emlékezetes meccs után: „Új lelátó nyílt: Ultrák a kapu mögött\" 🆕 sávval",r3b);
  ok(r3b.szundiRejtve,"az újdonságon nincs szundi (egyszeri)",r3b.szundiRejtve);
  /* „Mutasd": az arculat-panel nyílik, a lelátó-szakasszal */
  await p.evaluate(()=>{document.getElementById("vezPushGo").click();});
  await varj(700);
  const r3c=await p.evaluate(()=>({panel:!!$("identLelato")&&!$("scWindow").classList.contains("hide")}));
  ok(r3c.panel,"a „Mutasd\" az arculat-panel lelátó-szakaszát nyitja",r3c);
  /* vissza a HUB-ba; megvan a pénz a scout-fejlesztésre */
  await p.evaluate(()=>{
    $("scWindow").classList.add("hide");$("scHub").classList.remove("hide");
    _vezPushQ=[];vezPushHide();
    S.transferBudget=scoutUpgradePriceNow()+10;});
  await varjAmig(()=>{const el=$("vezPush");return !!(el&&!el.classList.contains("hide")&&/scout-fejlesztés/.test(el.textContent));});
  const r3d=await p.evaluate(()=>{const el=$("vezPush");
    return {cim:el?el.querySelector("#vezPushTx b").textContent:"",lat:!!(el&&!el.classList.contains("hide")),
      jegy:teachStateObj().uj.scout};});
  ok(r3d.lat&&/Elérhető áron: scout-fejlesztés/.test(r3d.cim),"megfizethető lett a scout-fejlesztés → értesítés",r3d);
  /* ugyanarról nem szól újra */
  await p.evaluate(()=>{_vezPushQ=[];vezPushHide();});
  await varj(2600);
  const r3e=await p.evaluate(()=>({sor:_vezPushQ.length,most:_vezPushMost?(_vezPushMost.k||_vezPushMost):null}));
  ok(!r3e.most&&!r3e.sor,"ugyanarról a szintről nem szól még egyszer",r3e);
  /* a következő csillagszint újra szólhat */
  await p.evaluate(()=>{scout.stars+=0.5;S.transferBudget=scoutUpgradePriceNow()+10;});
  await varjAmig(()=>{const m=_vezPushMost;return !!(m&&m.k==="scout");});
  const r3f=await p.evaluate(()=>{const m=_vezPushMost;return {k:m&&m.k,jegy:teachStateObj().uj.scout};});
  ok(r3f.k==="scout"&&r3f.jegy.length===2,"a következő csillagszint újra értesít",r3f);
  /* kikapcsolva csendben jegyez */
  await p.evaluate(()=>{_vezPushQ=[];vezPushHide();teachStateObj().ujOff=1;msT().exciteMax=93;});
  await varjAmig(()=>{const u=teachStateObj().uj;return !!(u&&u.lelato&&u.lelato.includes("katlan"));});
  await varj(800);   /* és utána sem szólt (a jegyzés és a szólás ugyanabban a futásban dől el) */
  const r3g=await p.evaluate(()=>({most:_vezPushMost?1:0,jegy:teachStateObj().uj.lelato}));
  ok(!r3g.most&&r3g.jegy.includes("katlan"),"kikapcsolva nem szól, de jegyez (a visszakapcsoláskor nem zúdul rád)",r3g);
  /* a Vezetés menü kapcsolója */
  const r3h=await p.evaluate(()=>{teachStateObj().ujOff=0;renderTeachPanel();
    const ub=$("tchUj");const elotte=ub&&ub.getAttribute("aria-pressed");if(ub)ub.click();
    return {van:!!ub,elotte,utana:!!teachStateObj().ujOff};});
  ok(r3h.van&&r3h.elotte==="true"&&r3h.utana,"a Vezetés menüben saját kapcsolója van",r3h);

  /* minden figyelő lefut, és minden azonosítójához van szöveg — gazdag klubbal */
  const r3i=await p.evaluate(()=>{
    S.transferBudget=1e12;try{renderHub();}catch(e){}
    const o={};
    UJ_FIGY.forEach(w=>{let ids=[],msg=[],hiba=null;
      try{ids=w.ids()||[];msg=ids.map(id=>w.msg(id));}catch(e){hiba=e.message;}
      o[w.k]={n:ids.length,hiba,jo:msg.every(m=>m&&m.ic&&m.t&&m.x)};});
    return o;});
  ok(Object.values(r3i).every(x=>!x.hiba&&x.jo),"minden figyelő hiba nélkül fut, és minden újdonsághoz van ikon, cím és szöveg",r3i);
  ok(r3i.ugynokseg.n>0&&r3i.keret.n>0&&r3i.felallas.n>=2,"gazdag klubnál az ügynökség, a keretbővítés és a két felállás-tétel is elérhető áron szól",r3i);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
