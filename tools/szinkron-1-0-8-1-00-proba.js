/* 🔄 SZINKRON — a teljes profil eszközök között (1.0.8.1.00)

   Két KÜLÖN böngészőprofil (két „eszköz"), egy VALÓDI Firestore — a helyi
   emulátor, a tools/firestore-szinkron.rules szabályaival. A Firebase SDK-t
   (10.12.2, ugyanaz, mint a kétjátékos ágé) a gstatic helyett a helyi npm
   csomagból szolgáljuk ki; minden más a játék saját kódja, változatlanul.

   Amit mér:
   · a profil-ablak LEGTETEJÉN a szinkron gomb, és a beállító ablak;
   · létrehozás → párosító link → csatlakozás a másik eszközön, újratöltéssel;
   · minden kulcs átmegy (karrier-helyek, szoba-mentés, profil, nevek,
     beállítások, egy 1,5 millió karakteres érték darabolva), az eszközhöz
     kötöttek nem (melyik helyen játszol, értesítések);
   · csatlakozáskor a csak ott meglévő adat megmarad és visszafelé is átmegy;
   · élő frissítés mindkét irányban, törlés is;
   · ütközés: mindkét eszköz ugyanazt a kulcsot írja → a később módosított nyer,
     a csak egyik oldalon változott kulcsok mind megmaradnak;
   · meccs közben (S.playing) a felhős változás vár, utána töltődik be;
   · a felhőben minden titkosított (a becenév sehol), nincs árva darab;
   · a szabályok: kód nélkül nem listázható, rossz azonosító nem olvasható;
   · a beépített szabályszöveg = a tools/firestore-szinkron.rules.

   Futtatás (Java + firebase-tools + a firebase@10.12.2 npm-csomag kell):
     cd <mappa, benne firebase.json: {"firestore":{"rules":".../tools/firestore-szinkron.rules"},
         "emulators":{"firestore":{"port":8085,"host":"127.0.0.1"}}}>
     FB_SDK_DIR=<…/node_modules/firebase> npx firebase emulators:exec --only firestore \
       --project magyahszinkron "node /home/user/Magyah/tools/szinkron-1-0-8-1-00-proba.js"
   Emulátor nélkül (FIRESTORE_EMULATOR_HOST nincs beállítva) kihagyja magát. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const PORT=8931;
const EMU=process.env.FIRESTORE_EMULATOR_HOST;
const SDK=process.env.FB_SDK_DIR;
if(!EMU||!SDK){console.log("  – kihagyva: nincs FIRESTORE_EMULATOR_HOST / FB_SDK_DIR (lásd a fejkommentet)");process.exit(0);}
const [EH,EP]=EMU.split(':');
/* a játék beépített szinkron-projektje (SYNC_FB_DEFAULT) — az emulátort is erre indítsd */
const PROJECT=process.env.GCLOUD_PROJECT||'magyahszinkron';
const CFG=`const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "${PROJECT}.firebaseapp.com",
  projectId: "${PROJECT}",
  appId: "1:1:web:1"
};`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const srv=spawn('python3',['-m','http.server',String(PORT)],{cwd:ROOT,stdio:'ignore'});
  await sleep(1200);
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x).slice(0,300):""));};
  async function eszkoz(nev){
    const ctx=await b.newContext({viewport:{width:430,height:900}});
    await ctx.addInitScript(([h,p])=>{window.MAGYAH_SYNC_EMU={host:h,port:+p};},[EH,EP]);
    await ctx.route(/https:\/\/www\.gstatic\.com\/firebasejs\/10\.12\.2\/(firebase-[a-z]+\.js)$/,async r=>{
      const f=path.join(SDK,r.request().url().split('/').pop());
      if(!fs.existsSync(f))return r.abort();
      r.fulfill({status:200,contentType:'application/javascript',body:fs.readFileSync(f)});});
    const p=await ctx.newPage();
    p.on('pageerror',e=>oldal.push(nev+": "+e.message));
    /* a játék saját kétjátékos RTDB-je a próbakörnyezetből nem érhető el — az zaj */
    p.on('console',m=>{if(m.type()==='error'&&!/favicon|net::ERR|Failed to load resource|firebasedatabase\.app/.test(m.text()))oldal.push(nev+": "+m.text());});
    await p.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'load'});
    await p.waitForTimeout(2500);
    return {ctx,p};}
  const allapot=p=>p.evaluate(()=>({st:SY.status.state,msg:SY.status.message||null,mode:SY.conf&&SY.conf.mode,rev:SY.base.rev}));
  async function varOk(p,mp,cimke){
    const t0=Date.now();let a=null;
    while(Date.now()-t0<(mp||30000)){
      try{a=await allapot(p);if(a.st==="ok"&&a.mode==="live")return a;
        if(a.st==="error")break;}catch(e){/* épp újratölt */}
      await sleep(300);}
    ok((cimke||"")+" — a szinkron állapota ok",false,a);return a;}
  /* a másik eszközről jött változás után a lap magától újratölt */
  async function varUjratoltes(p,fn,mp){
    const nav=p.waitForEvent('load',{timeout:mp||30000}).then(()=>true).catch(()=>false);
    if(fn)await fn();
    const lett=await nav;
    await p.waitForTimeout(1500);
    return lett;}
  const ls=(p,k)=>p.evaluate(k=>localStorage.getItem(k),k);

  /* ============ 0. a szabályszöveg egyezik a fájllal ============ */
  const A=await eszkoz("A");
  {const beepitett=await A.p.evaluate(()=>SYNC_RULES);
   ok("a beépített szabályszöveg = tools/firestore-szinkron.rules",beepitett===fs.readFileSync(path.join(ROOT,'tools/firestore-szinkron.rules'),'utf8'));
   ok("a verziószám legalább 1.0.8.1.01",await A.p.evaluate(()=>verzioUjabb(APP_VERSION,"1.0.8.1.00")));}

  /* ============ 1. az „A" eszköz adatai ============ */
  /* véletlen tartalom: a gzip sem nyomja 1 MB alá */
  const NAGY=await A.p.evaluate(()=>{const abc="abcdefghijklmnopqrstuvwxyzÁÉŐŰ0123456789",r=new Uint8Array(1500000);
    for(let i=0;i<r.length;i+=65536)crypto.getRandomValues(r.subarray(i,i+65536));
    let s="";for(let i=0;i<r.length;i++)s+=abc[r[i]%abc.length];return s;});
  await A.p.evaluate((nagy)=>{
    profileSetNick("Szinkronka");
    localStorage.setItem("30-0-save-v1-s2","A-karrier-2");
    localStorage.setItem("30-0-save-mp-QWER-v1","A-szoba-QWER");
    localStorage.setItem("harminc_nulla_mp_mycodes_v1",JSON.stringify(["QWER"]));
    localStorage.setItem("harminc_nulla_usernevek_v1",JSON.stringify({"p1":"Kovács Különleges"}));
    localStorage.setItem("theme30_0","dark");
    localStorage.setItem("30-0-proba-nagy",nagy);
    localStorage.setItem("harminc_nulla_sp_slot_v1","2");       /* eszközhöz kötött */
    localStorage.setItem("magyah_ertesites_v1",JSON.stringify({on:true,pvp:true}));   /* eszközhöz kötött */
  },NAGY);
  /* egy VALÓDI karrier az 1. helyen: elindítva, első idény, kimentve */
  const kar=await A.p.evaluate(()=>{
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
      const pl={n:src.n,ovr:src.ovr,pos:[sl.pos],age:26};sl.player=pl;sl.fit=1;
      if(!careerPool[pl.n])careerPool[pl.n]={n:pl.n,pos:[sl.pos],age:26,startRating:pl.ovr,peak:pl.ovr};
      const e=careerPool[pl.n];e.pos=[sl.pos];if(!e.attrs)initPlayerAttrs(e);});
    if(!scout)scout=generateScout();
    try{startFirstSeason();}catch(e){}
    for(const id of ["talDrawLater","guideTipOk"]){const x=document.getElementById(id);if(x&&x.offsetParent)x.click();}
    phase="season";
    saveLockAdopt();saveGameNow();
    const d=loadSavedGame(SAVE_KEY);
    return {van:saveHasGame(d),kulcs:saveKey(),hossz:(localStorage.getItem(SAVE_KEY)||"").length,
      tomor:(localStorage.getItem(SAVE_KEY)||"").startsWith("MZ1~"),csapat:d&&(d.teamName||d.myTeamName||null),idx:d&&d.S&&d.S.idx};});
  ok("A: valódi karrier az 1. helyen, tömörítve mentve",kar.van&&kar.kulcs==="30-0-save-v1"&&kar.tomor,kar);
  const KAR=await ls(A.p,"30-0-save-v1");let karB=null;
  const nickA=await A.p.evaluate(()=>profileNick());
  ok("A: a becenév beállítva",nickA==="Szinkronka",nickA);

  /* ============ 2. a profil-ablak teteje és a beállító ablak ============ */
  await A.p.evaluate(()=>openProfileModal());
  await A.p.waitForTimeout(300);
  {const r=await A.p.evaluate(()=>{const b=$("profileBody");const f=b.firstElementChild;
     return {elso:f&&f.id,szoveg:f&&f.textContent.replace(/\s+/g," ").trim()};});
   ok("a profil-ablak LEGELSŐ eleme a szinkron gomb",r.elso==="profSyncBtn",r);
   ok("a gomb felirata „Szinkronizálás”",/Szinkronizálás/.test(r.szoveg||""),r.szoveg);}
  await A.p.screenshot({path:path.join(process.env.MSP||'/tmp','szinkron-profil.png')});
  await A.p.click("#profSyncBtn");
  await A.p.waitForTimeout(300);
  {const r=await A.p.evaluate(()=>({lat:!$("syncModal").classList.contains("hide"),
     cfg:!!$("syncFbCfg"),create:!!$("syncCreate"),code:!!$("syncCode"),join:!!$("syncJoin"),
     z:+getComputedStyle($("syncModal")).zIndex,zp:+getComputedStyle($("profileModal")).zIndex}));
   ok("a beállító ablak felugrik (új szinkron, kód, csatlakozás; a saját projekt csak a haladó lenyílóban)",r.lat&&r.cfg&&r.create&&r.code&&r.join,r);
   ok("a saját projekt mezője egy CSUKOTT lenyílóban ül",await A.p.evaluate(()=>{const d=$("syncFbCfg").closest("details");return !!d&&!d.open;}));
   ok("a beállító ablak a profil fölött ül",r.z>r.zp,r);}
  /* hibás saját beállítással nem indul */
  await A.p.evaluate(()=>{$("syncFbCfg").closest("details").open=true;});
  await A.p.fill("#syncFbCfg","ez nem config");
  await A.p.click("#syncCreate");
  ok("hibás saját beállítással szól, és nem indul",await A.p.evaluate(()=>!SY.conf&&/hiányos/.test($("syncBody").textContent)));
  /* a szabályok kimásolhatók */
  ok("a beállítási útmutató és a szabályok az ablakban",await A.p.evaluate(()=>!!$("syncRulesTxt")&&$("syncRulesTxt").value===SYNC_RULES));
  await A.p.screenshot({path:path.join(process.env.MSP||'/tmp','szinkron-beallitas.png')});
  /* üres mező = a beépített projekt: a játékosnak semmit nem kell beillesztenie */
  await A.p.fill("#syncFbCfg","");
  await A.p.evaluate(()=>{SY.cfgDraft="";});
  await A.p.click("#syncCreate");
  await varOk(A.p,40000,"A létrehozás");
  {const r=await A.p.evaluate(()=>({view:SY.view,link:$("syncLinkTxt")&&$("syncLinkTxt").value,code:SY.conf.code}));
   ok("létrehozás után a párosító link látszik",r.view==="link"&&/#sync=/.test(r.link||""),r.view);
   ok("a kód 5×5 karakter, félreolvasható betű nélkül",/^[0-9A-HJKMNP-TV-Z]{5}(-[0-9A-HJKMNP-TV-Z]{5}){4}$/.test(r.code),r.code);}
  const LINK=await A.p.evaluate(()=>syncPairLink());
  {const r=await A.p.evaluate(()=>({pid:SY.conf.fb.projectId,alap:syncFbIsDefault(SY.conf.fb),
     link:JSON.parse(_syncUnb64url(syncPairLink().split("#sync=")[1]))}));
   ok("a beépített projekttel indult",r.alap&&r.pid==="magyahszinkron",r.pid);
   ok("a párosító linkben csak a kód van, a beállítás nem",!r.link.f&&!!r.link.k,Object.keys(r.link));}

  /* ============ 3. a felhőben minden titkosított ============ */
  const rest=async(ut,tok)=>{const r=await fetch(`http://${EMU}/v1/projects/${PROJECT}/databases/(default)/documents/${ut}`,
      {headers:tok?{Authorization:"Bearer owner"}:{}});return {status:r.status,j:await r.json().catch(()=>null)};};
  const docsAll=async()=>{let out=[],tok="";do{const r=await rest("magyah?pageSize=300"+(tok?"&pageToken="+tok:""),true);
      out=out.concat((r.j&&r.j.documents)||[]);tok=r.j&&r.j.nextPageToken;}while(tok);return out;};
  {const d=await docsAll();
   const nyers=JSON.stringify(d);
   ok("a felhőben dokumentumok vannak (fő + darabok)",d.length>=3,d.length);
   ok("a becenév, a név-lista és a karrier szövege sehol nem olvasható",!/Szinkronka|Különleges|A-karrier-2|A-szoba-QWER/.test(nyers));
   const n=await A.p.evaluate(async()=>{const {firestore}=SY.fs;const s=await firestore.getDoc(SY.ref);
     const m=await syncReadManifest(s.data());return m["30-0-proba-nagy"]&&m["30-0-proba-nagy"].n;});
   ok("a nagy érték több darabban ment fel (1 MB-os dokumentum-korlát)",n>=2,n);}

  /* ============ 4. a „B" eszköz: saját adat, aztán csatlakozás linkkel ============ */
  const B=await eszkoz("B");
  await B.p.evaluate(()=>{
    profileSetNick("Bprofil");
    localStorage.setItem("30-0-save-v1-s3","B-karrier-3");          /* csak itt van */
    localStorage.setItem("theme30_0","pixel");                    /* ott is van — a közös nyer */
    localStorage.setItem("harminc_nulla_sp_slot_v1","3");});
  /* a már nyitott játékba, ugyanabba a fülbe illesztett link: csak a hash vált */
  await B.p.evaluate(h=>{location.hash=h;},LINK.slice(LINK.indexOf("#")));
  await B.p.waitForTimeout(800);
  ok("B: a nyitott játékba illesztett link is a csatlakozásra nyit",await B.p.evaluate(()=>SY.view==="join"&&!$("syncModal").classList.contains("hide")));
  await B.p.evaluate(()=>{$("syncModal").classList.add("hide");SY.view="main";SY.pair=null;});
  /* friss betöltés a linkkel (más alkalmazásból megnyitva) */
  await B.p.goto('about:blank');
  await B.p.goto(LINK.replace(/^http:\/\/[^/]+\/[^#]*/,`http://localhost:${PORT}/index.html`),{waitUntil:'load'});
  await B.p.waitForTimeout(2500);
  {const r=await B.p.evaluate(()=>({lat:!$("syncModal").classList.contains("hide"),view:SY.view,
     igen:!!$("syncJoinYes"),hash:location.hash,szoveg:$("syncBody").textContent}));
   ok("B: a párosító link a csatlakozás kérdésére nyit",r.lat&&r.view==="join"&&r.igen,r.view);
   ok("B: a link a címsorból azonnal eltűnik",r.hash==="",r.hash);
   ok("B: a kérdés kimondja, mi van már ezen az eszközön",/Bprofil/.test(r.szoveg)&&/közös \(felhős\) változat/.test(r.szoveg),r.szoveg.slice(0,200));}
  await B.p.screenshot({path:path.join(process.env.MSP||'/tmp','szinkron-csatlakozas.png')});
  const aVar=varUjratoltes(A.p,null,40000);   /* A is megkapja B saját adatát */
  const bUjra=await varUjratoltes(B.p,()=>B.p.click("#syncJoinYes"),40000);
  ok("B: csatlakozás után egyszer újratölt",bUjra);
  await varOk(B.p,40000,"B csatlakozás");
  {const r=await B.p.evaluate(()=>({nick:profileNick(),s2:localStorage.getItem("30-0-save-v1-s2"),
     szoba:localStorage.getItem("30-0-save-mp-QWER-v1"),kodok:localStorage.getItem("harminc_nulla_mp_mycodes_v1"),
     nevek:localStorage.getItem("harminc_nulla_usernevek_v1"),tema:localStorage.getItem("theme30_0"),
     s3:localStorage.getItem("30-0-save-v1-s3"),hely:localStorage.getItem("harminc_nulla_sp_slot_v1"),
     ert:localStorage.getItem("magyah_ertesites_v1"),nagyH:(localStorage.getItem("30-0-proba-nagy")||"").length}));
   ok("B: a profil (becenév) átjött",r.nick==="Szinkronka",r.nick);
   ok("B: a 2. karrier-hely átjött",r.s2==="A-karrier-2");
   /* a szobák listáját a játék a háttér szerint maga is rendben tartja (a
      próba szobája nem létezik, tehát kitakarítja) — a lényeg, hogy a két
      eszközön ugyanaz legyen */
   ok("B: a szoba-mentés átjött, a szobák listája a két eszközön azonos",r.szoba==="A-szoba-QWER"&&r.kodok===(await ls(A.p,"harminc_nulla_mp_mycodes_v1")),{b:r.kodok});
   ok("B: a saját játékosnevek átjöttek",/Különleges/.test(r.nevek||""));
   ok("B: a beállítás (téma) a közös értéket vette fel",r.tema==="dark",r.tema);
   ok("B: a csak itt meglévő 3. hely megmaradt",r.s3==="B-karrier-3");
   ok("B: az eszközhöz kötött kulcsok nem jöttek át",r.hely==="3"&&r.ert===null,{hely:r.hely,ert:r.ert});
   ok("B: a 1,5 millió karakteres érték hiánytalan",r.nagyH===1500000,r.nagyH);
   ok("B: a nagy érték bájtra azonos",(await ls(B.p,"30-0-proba-nagy"))===NAGY);
   karB=await ls(B.p,"30-0-save-v1");
   const fut=await B.p.evaluate(()=>{const d=loadSavedGame(SAVE_KEY);const okk=loadIntoGame(d,SAVE_KEY);
     return {okk,phase,gm:gameMode,idx:S.idx,n:slots.filter(x=>x&&x.player).length};});
   ok("B: a karrier be is tölthető és folytatható (idény, 11 játékos)",fut.okk&&fut.phase==="season"&&fut.gm==="career"&&fut.n===11,fut);}
  ok("A: B saját adata után magától újratöltött",await aVar);
  await varOk(A.p,30000,"A a csatlakozás után");
  ok("A: megkapta B 3. helyét",(await ls(A.p,"30-0-save-v1-s3"))==="B-karrier-3");
  {const karA=await ls(A.p,"30-0-save-v1");
   ok("A valódi karrierje bájtra azonos a két eszközön",karA===karB&&!!karA&&karA.startsWith("MZ1~"),{a:karA&&karA.length,b:karB&&karB.length,elso:KAR.length});}
  ok("A: a saját „melyik helyen játszom” változatlan",(await ls(A.p,"harminc_nulla_sp_slot_v1"))==="2");

  /* ============ 5. élő frissítés mindkét irányban, törlés ============ */
  {const v=varUjratoltes(B.p,()=>A.p.evaluate(()=>localStorage.setItem("30-0-records-v1",JSON.stringify({v:1,r:{gol:9}}))),40000);
   ok("A írt → B magától újratölt",await v);
   await varOk(B.p,30000,"B frissítés");
   ok("B: az új érték megvan",(await ls(B.p,"30-0-records-v1"))===JSON.stringify({v:1,r:{gol:9}}));}
  await varOk(A.p,30000,"A");
  {const v=varUjratoltes(A.p,()=>B.p.evaluate(()=>localStorage.removeItem("30-0-save-v1-s2")),40000);
   ok("B törölt → A magától újratölt",await v);
   await varOk(A.p,30000,"A törlés után");
   ok("A: a törölt hely nála is eltűnt",(await ls(A.p,"30-0-save-v1-s2"))===null);}
  await varOk(B.p,30000,"B");

  /* ============ 6. ütközés: mindkettő ír, kapcsolat nélkül ============ */
  await A.p.evaluate(()=>syncStop());await B.p.evaluate(()=>syncStop());
  await A.p.evaluate(()=>{localStorage.setItem("30-0-proba-utkozes","A-elobb");localStorage.setItem("csakA","1");});
  await sleep(300);
  await B.p.evaluate(()=>{localStorage.setItem("30-0-proba-utkozes","B-kesobb");localStorage.setItem("csakB","1");});
  await A.p.evaluate(()=>syncStart());
  await varOk(A.p,30000,"A ütközés előtt");
  {const v=varUjratoltes(A.p,null,40000);
   const bv=varUjratoltes(B.p,()=>B.p.evaluate(()=>syncStart()),40000);
   ok("B: A változása miatt újratölt",await bv);
   ok("A: B változása miatt újratölt",await v);}
  await varOk(A.p,30000,"A ütközés után");await varOk(B.p,30000,"B ütközés után");
  {const ra=await A.p.evaluate(()=>[localStorage.getItem("30-0-proba-utkozes"),localStorage.getItem("csakA"),localStorage.getItem("csakB")]);
   const rb=await B.p.evaluate(()=>[localStorage.getItem("30-0-proba-utkozes"),localStorage.getItem("csakA"),localStorage.getItem("csakB")]);
   ok("ütközés: mindkét eszközön a később módosított nyer",ra[0]==="B-kesobb"&&rb[0]==="B-kesobb",{ra,rb});
   ok("ütközés: a csak egyik oldalon változott kulcsok mind megmaradtak",ra[1]==="1"&&ra[2]==="1"&&rb[1]==="1"&&rb[2]==="1",{ra,rb});}

  /* ============ 7. meccs közben vár ============ */
  await B.p.evaluate(()=>{S.playing=true;});
  await A.p.evaluate(()=>localStorage.setItem("harminc_nulla_tempo_v1","meccs-kozben"));
  {const t0=Date.now();let a=null;
   while(Date.now()-t0<25000){a=await allapot(B.p);if(a.st==="waiting")break;await sleep(300);}
   ok("B meccs közben: „vár” állapot, nem tölt újra",a&&a.st==="waiting",a);
   ok("B meccs közben: az érték még a régi",(await ls(B.p,"harminc_nulla_tempo_v1"))!=="meccs-kozben");}
  {const v=varUjratoltes(B.p,()=>B.p.evaluate(()=>{S.playing=false;}),30000);
   ok("B a meccs után betölti és újratölt",await v);
   await varOk(B.p,30000,"B a meccs után");
   ok("B: az érték megjött",(await ls(B.p,"harminc_nulla_tempo_v1"))==="meccs-kozben");}
  await varOk(A.p,30000,"A");

  /* ============ 7b. tele a tárhely ============ */
  await B.p.evaluate(()=>{window.__eredetiLsSet=syncLsSet;
    window.syncLsSet=(k,v)=>{if(k==="30-0-proba-tele"){const e=new Error("QuotaExceededError");e.name="QuotaExceededError";throw e;}return window.__eredetiLsSet(k,v);};});
  await A.p.evaluate(()=>localStorage.setItem("30-0-proba-tele","nagy-karrier"));
  {const t0=Date.now();let a=null;
   while(Date.now()-t0<25000){a=await allapot(B.p);if(a.st==="error")break;await sleep(300);}
   ok("tele tárhely: B nem tölt újra, hanem megnevezi a teendőt",a&&a.st==="error"&&/Hely felszabadítása/.test(a.msg||""),a);
   ok("tele tárhely: B nem fagy le (a mentés újra írhat)",await B.p.evaluate(()=>!SY.frozen&&!_saveFrozen));}
  {const v=varUjratoltes(B.p,()=>B.p.evaluate(()=>{window.syncLsSet=window.__eredetiLsSet;syncNow();}),30000);
   ok("hely után a „Szinkronizálás most” behozza és újratölt",await v);
   await varOk(B.p,30000,"B a hely után");
   ok("B: a korábban el nem fért érték megjött",(await ls(B.p,"30-0-proba-tele"))==="nagy-karrier");}
  await varOk(A.p,30000,"A");

  /* ============ 8. nincs árva darab ============ */
  await sleep(1500);
  {const refd=await A.p.evaluate(async()=>{const {firestore}=SY.fs;const s=await firestore.getDoc(SY.ref);
     const m=await syncReadManifest(s.data());const ids=[];
     for(const e of Object.values(m))for(let i=0;i<(e.n||1);i++)ids.push(syncPartId(e.p,i));
     return {ids,docId:SY.conf.docId,rev:s.data().rev};});
   const d=(await docsAll()).map(x=>x.name.split('/').pop()).filter(n=>n.startsWith(refd.docId));
   const resz=d.filter(n=>n!==refd.docId).sort(),vart=refd.ids.slice().sort();
   ok("a felhőben pontosan a jegyzék darabjai vannak (nincs árva)",JSON.stringify(resz)===JSON.stringify(vart),{resz:resz.length,vart:vart.length});
   /* ============ 9. a szabályok ============ */
   const lista=await rest("magyah",false);
   ok("szabály: a gyűjtemény kód nélkül nem listázható",lista.status===403,lista.status);
   const rossz=await rest("magyah/abc",false);
   ok("szabály: rossz formájú azonosító nem olvasható",rossz.status===403,rossz.status);
   const fo=await rest("magyah/"+refd.docId,false);
   ok("szabály: a fődokumentum a kóddal (azonosítóval) olvasható — titkosítva",fo.status===200&&!/Szinkronka/.test(JSON.stringify(fo.j)),fo.status);
   const masik=await rest("zsebor/"+refd.docId,false);
   ok("szabály: más gyűjtemény zárva",masik.status===403,masik.status);}

  /* ============ 10. leválasztás ============ */
  await B.p.evaluate(()=>openProfileModal());await B.p.click("#profSyncBtn");await B.p.waitForTimeout(200);
  ok("B: csatlakozva a kód rejtve, és van párosító link + leválasztás",await B.p.evaluate(()=>
    !!$("syncLink")&&!!$("syncOff")&&!$("syncBody").textContent.includes(SY.conf.code)));
  await B.p.screenshot({path:path.join(process.env.MSP||'/tmp','szinkron-kapcsolva.png')});
  await B.p.click("#syncOff");await B.p.click("#syncOffYes");
  {const r=await B.p.evaluate(()=>({conf:SY.conf,kulcs:localStorage.getItem(SYNC_CFG_KEY),
     adat:localStorage.getItem("30-0-save-v1-s3")}));
   ok("B leválasztva: a beállítás törölve, az adatok megmaradtak",r.conf===null&&r.kulcs===null&&r.adat==="B-karrier-3",r);}
  await B.p.evaluate(()=>localStorage.setItem("leválasztva-írt","1"));
  await sleep(6000);
  ok("leválasztás után B változása nem megy át",(await ls(A.p,"leválasztva-írt"))===null);

  /* ============ 11. törlés a felhőből ============ */
  {const docId=await A.p.evaluate(()=>SY.conf.docId);
   const elotte=(await docsAll()).filter(x=>x.name.split('/').pop().startsWith(docId)).length;
   await A.p.evaluate(()=>openProfileModal());await A.p.click("#profSyncBtn");await A.p.waitForTimeout(200);
   await A.p.click("#syncOff");await A.p.click("#syncWipeYes");
   const t0=Date.now();while(Date.now()-t0<15000&&await A.p.evaluate(()=>!!SY.conf))await sleep(300);
   await sleep(800);
   const utana=(await docsAll()).filter(x=>x.name.split('/').pop().startsWith(docId)).length;
   ok("törlés a felhőből: előtte voltak dokumentumok, utána egy sem",elotte>0&&utana===0,{elotte,utana});
   ok("törlés után A le van választva, a helyi adat megmaradt",await A.p.evaluate(()=>!SY.conf&&localStorage.getItem("30-0-save-v1-s3")==="B-karrier-3"));}

  ok("nincs oldalhiba",oldal.length===0,oldal.slice(0,5));
  await b.close();srv.kill();
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✓ minden állítás teljesült");
  process.exit(hiba.length?1:0);
})().catch(e=>{console.error("✗ a próba elszállt:",e);process.exit(1);});
