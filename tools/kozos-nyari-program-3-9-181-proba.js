/* 🗓 3.9.181 — A KÖZÖS NYÁRI PROGRAM (PvP).

   BEJELENTETT HIBA: „D0 PvP, én 12. helyen végeztem, és azonnal a Hiper Szuper
   Kupában indultam. A társamnak a Fából készült Kupa indult, és a 32 között
   azt írja neki, hogy várnia kell rám. […] a két játékost mindig az erősebb
   viszi oda, ahová őt nevezi a játék. Nekem is mennem kellett volna vele FA
   kupába, utána jött volna automatikusan, helyezéstől függetlenül a HSZK […]
   És utána a nyári kupa annak, aki hamarabb kiesett. Ha döntőben
   találkoztak, akkor a vesztesnek."

   Amit mér:
     1. A FELOLDÁS (tiszta függvény): a bejelentett eset FA → HSZ, mindkét
        oldalról UGYANAZ (szimmetria); a régi hiba (két 0-s rangú sorozat →
        mindkét gép a sajátját tartja) nem jön vissza; azonos sorozatnál a
        selejtező csak akkor marad, ha mindkettőnek járna; régi kliens rekordja
        (hsz mező nélkül) is HSZ-t ad; semmi → null.
     2. A NEVEZÉS: a kapu a teljes programot írja be (S.mpCup.prog), az első
        lépést indítja, és a naplóban a program minden lépése és a nyári torna
        szabálya ott áll.
     3. A LÉPTETÉS: kiesés után a lánc (FA → KK) a TÁRS győzelmére is elsül,
        és mindkettőnek beszúrja a KK-t; győztesként nincs várakozás (a rekord
        felmegy); a következő lépés a közös mezőnnyel indul, a szakasz-kulcsok
        sorozatonként külön rekeszt kapnak; a selejtező körszáma a programból.
     4. A NYÁRI TORNA: aki hamarabb kiesett (a társ még versenyben) — neki jár,
        egyedül, a „hamarabb kiestél" szöveggel, és a kihagyás után a kupa
        utáni kapu jön; döntőben győztesként NEM jár (a társnak szól);
        azonos körben kiesve mindkettőnek jár; győzelemnél nem jár.
     5. KILÉPÉS ÉS VISSZATÉRÉS: a lánc-várakozásból kilépni a programban NEM
        feladás — a várakozás mentve, a HUB gombja „Vissza a közös nyári
        programhoz", és oda is visz.
     6. KÖZÖS HSZ: a ligaszakasz végén a társ valódi eredményei a nálad
        szimuláltak helyére kerülnek (csak az övéi), és a top 8-ból NÉZŐKÉNT
        megvárjuk a társ rájátszását — a nyolcaddöntő az ő valódi
        eredményével áll fel; kiesésénél a társ „kiesett".
     7. Mentés: az új mezők mentődnek és betöltődnek; nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9223;
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
  await p.waitForTimeout(1500);

  /* ================= 1. A FELOLDÁS ================= */
  const r1=await p.evaluate(()=>{
    const o={};
    const en=(x)=>JSON.stringify(x);
    const lepes=r=>r?r.prog.map(s=>s.comp+(s.qual?"q":"")+(s.chain?">"+s.chain.gives+(s.chain.qual?"q":""):"")).join(" "):null;
    /* a bejelentett eset: én D0-ban (HSZ), a társ FA-t kapott (lánc FA → KK-selejtező) */
    const en1={comp:"HSZ",qual:false,hsz:true,cw:null};
    const ta1={comp:"FA",qual:false,hsz:false,cw:{comp:"FA",gives:"BL",qual:true}};
    o.bejelentett=lepes(mpResolveProgram(en1,ta1));
    o.bejelentettFordit=lepes(mpResolveProgram(ta1,en1));
    o.byEn=mpResolveProgram(en1,ta1).by;o.byTars=mpResolveProgram(ta1,en1).by;
    o.hszBy=mpResolveProgram(en1,ta1).prog[1].hszBy;
    /* a régi alak is ugyanazt az első lépést adja mindkét oldalon */
    o.regiA=mpResolveCup(en1,ta1).comp;o.regiB=mpResolveCup(ta1,en1).comp;
    /* mindketten D0 */
    o.mindD0=lepes(mpResolveProgram(en1,{comp:"HSZ",qual:false,hsz:true}));
    /* az erősebb visz: KK vs FA */
    o.kkFa=lepes(mpResolveProgram({comp:"BL",qual:false},{comp:"FA",qual:true,qr:4}));
    /* azonos sorozat, eltérő selejtező — szimmetrikus */
    o.blQ1=lepes(mpResolveProgram({comp:"BL",qual:true},{comp:"BL",qual:false}));
    o.blQ2=lepes(mpResolveProgram({comp:"BL",qual:false},{comp:"BL",qual:true}));
    o.blQQ=mpResolveProgram({comp:"FA",qual:true,qr:4},{comp:"FA",qual:true,qr:2}).prog[0];
    /* régi kliens: hsz mező nélkül, csak comp:"HSZ" */
    o.regiKliens=lepes(mpResolveProgram({comp:"MK",qual:true},{comp:"HSZ"}));
    /* senkinek semmi */
    o.semmi=mpResolveProgram({comp:null},{comp:null});
    o.egyik=lepes(mpResolveProgram({comp:"MK",qual:false},{comp:null}));
    /* teljes rangsor: két különböző sorozat SOSEM egyenlő */
    const R=["BL","EL","KL","FA","MK"];let dup=false;
    R.forEach(a=>R.forEach(c=>{if(a!==c&&MP_CUP_RANK[a]===MP_CUP_RANK[c])dup=true;}));
    o.rangEgyedi=!dup;
    return o;});
  console.log("\n— 1. a feloldás —");
  ok(r1.bejelentett==="FA>BLq HSZ"&&r1.bejelentettFordit==="FA>BLq HSZ",
     "a bejelentett eset: FA (lánc: KK-selejtező) → HSZ — mindkét oldalról ugyanaz",r1);
  ok(r1.byEn==="mate"&&r1.byTars==="mine"&&r1.hszBy==="mine","a „ki visz” nézőpontja tükrös (a társad FA-ja, a te HSZ-ed)");
  ok(r1.regiA==="FA"&&r1.regiB==="FA","a régi hiba nem jön vissza: mindkét gép UGYANAZT az első sorozatot kapja",{a:r1.regiA,b:r1.regiB});
  ok(r1.mindD0==="HSZ","mindketten D0: csak a HSZ",r1.mindD0);
  ok(r1.kkFa==="BL","az erősebb visz: KK a FA ellen",r1.kkFa);
  ok(r1.blQ1==="BL"&&r1.blQ2==="BL","azonos sorozat: selejtező csak ha mindkettőnek járna — szimmetrikusan",{a:r1.blQ1,b:r1.blQ2});
  ok(r1.blQQ.qual===true&&r1.blQQ.qr===2,"mindkettő selejtezős: a rövidebb selejtező",r1.blQQ);
  ok(r1.regiKliens==="MKq HSZ","régi kliens rekordja (hsz mező nélkül) is HSZ-t ad",r1.regiKliens);
  ok(r1.semmi===null&&r1.egyik==="MK","semmi → nincs program; egyikőtök MK-ja mindkettőtöket viszi",{s:r1.semmi,e:r1.egyik});
  ok(r1.rangEgyedi,"a rangsorban két különböző sorozat sosem egyenlő");

  /* ================= közös díszlet a 2–5. részhez ================= */
  await p.evaluate(()=>{
    gameMode="career";phase="hub";
    S.seasonNumber=4;S.friendlyCupSeason=0;S.friendlySolo=0;S.mkToKLDone=false;
    S.finalTable=[{n:"A"},{n:"Próba FC",you:true}];
    S.euro=null;S.euroOptOut=false;S.mpCupSeason=0;S.mpProgWait=null;S.mpProgNyk=null;
    careerPool=careerPool||{"X":{n:"X"}};
    teamName="Próba FC";MP.role="host";MP.activeRoom="PROBA";MP.active=true;
    window.h2hRoomActive=()=>true;
    window.saveGame=()=>{};
    window.__naplo=[];
    const _al=addLine;window.addLine=(t,c)=>{window.__naplo.push(String(t));};
    window.__szoba={};
    window.mpBk=()=>({
      h2hGet:async(room,key)=>window.__szoba[key]||null,
      h2hPut:async(room,key,field,val)=>{(window.__szoba[key]=window.__szoba[key]||{})[field]=val;return true;}});
    window.mpNetInit=async()=>{};
    window.h2hWaitShow=(t,m)=>{window.__varo=(window.__varo||[]);window.__varo.push(String(t)+" | "+String(m));};
    window.h2hWaitHide=()=>{};
    window.mpBeaconPing=async()=>false;
    window.__kampany=[];
    window.startEuroCampaign=()=>{window.__kampany.push(S.euroCurrent+(S.euroCurrentQual?"q":""));};
    window.mpShowCupGate=(cb)=>{window.__kapu=(window.__kapu||0)+1;};
    window.hubShowSeasonReport=()=>{};
  });

  /* ================= 2. A NEVEZÉS ================= */
  const r2=await p.evaluate(async()=>{
    const o={};
    S.euroCurrent="HSZ";S.euroCurrentQual=false;S.mpCup=null;
    const key=mpCupKey();
    window.__szoba[key]={
      host:{comp:"HSZ",qual:false,hsz:true,cw:null,teamName:"Próba FC",ovr:150,str:160,dom:0.5,v:APP_VERSION,rank:12,div:0},
      guest:{comp:"FA",qual:false,hsz:false,cw:{comp:"FA",gives:"BL",qual:true},teamName:"Társ FC",ovr:148,str:158,dom:0.6,v:APP_VERSION,rank:3,div:1}};
    _mpCupBusy=true;
    await mpCupTickRun(key,"host","guest",()=>{o.tovabb=true;},null);
    o.prog=S.mpCup&&S.mpCup.prog&&S.mpCup.prog.map(x=>x.comp);
    o.cur=S.euroCurrent;o.pi=S.mpCup.pi;
    o.naplo=window.__naplo.join(" ¦ ");
    o.kulcs0=mpCupStageKey("kor16");
    return o;});
  console.log("\n— 2. a nevezés —");
  ok(r2.tovabb&&JSON.stringify(r2.prog)==='["FA","HSZ"]'&&r2.cur==="FA"&&r2.pi===0,
     "a kapu a teljes programot írja be, és az első lépés (FA) indul",{prog:r2.prog,cur:r2.cur});
  ok(/Közös nyári program/.test(r2.naplo)&&/Fából Készült Serleg/.test(r2.naplo)&&/Hiper Szuper Kupa/.test(r2.naplo)
     &&/Társ FC helyezése jogán \(3\. hely\)/.test(r2.naplo)&&/D0-tól felfelé mindig jár/.test(r2.naplo)
     &&/Nyári Felkészülési Kupa<\/b> annak jár, aki hamarabb kiesik/.test(r2.naplo)&&/Kupák Kupájának Kupája/.test(r2.naplo),
     "a naplóban a teljes program: FA a társ jogán, HSZ a D0 jogán, a lánc (KK) és a nyári torna szabálya",r2.naplo.slice(0,700));
  ok(r2.kulcs0==="s4cupkor16","az első lépés kulcsa a régi (futó kampányok kedvéért)",r2.kulcs0);

  /* ================= 3. A LÉPTETÉS ================= */
  const r3=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    /* kiestem a FA nyolcaddöntőjében, a társ még versenyben (mateOut nincs) */
    window.__naplo=[];window.__kampany=[];window.__varo=[];
    S.euro={comp:"FA",result:"out",outAt:"mk2",stage:"done",mateIdx:5,mateOut:null};
    endEuroCampaign();
    await varj(60);
    o.var=_mpMkBusy&&!!S.mpProgWait;
    o.varoSzoveg=(window.__varo||[]).join(" ¦ ");
    o.felirat=hubNextSeasonBtnLabel();
    /* a társ megnyeri a FA-t */
    window.__szoba[mpMkKey()].guest={won:true,at:Date.now()};
    await varj(3000);   /* a váró a SAJÁT körében veszi észre */
    o.kampany1=window.__kampany.slice();
    o.prog=S.mpCup.prog.map(x=>x.comp+(x.qual?"q":""));
    o.pi=S.mpCup.pi;o.comp=S.mpCup.comp;o.wait=S.mpProgWait;
    o.naploLanc=window.__naplo.join(" ¦ ");
    o.kulcs=mpCupStageKey("kor16");
    o.qr=(S.euro={comp:"BL",stage:"qual"},euroQualRounds());
    /* a KK-ban kiesek — nincs lánc, jön a HSZ (várakozás nélkül) */
    window.__kampany=[];
    S.euro={comp:"BL",result:"out",outAt:"qual",stage:"done",mateIdx:3,mateOut:null};
    endEuroCampaign();await varj(30);
    o.kampany2=window.__kampany.slice();o.pi2=S.mpCup.pi;o.kulcs2=mpCupStageKey("kor16");
    o.mid2=S.mpCup.mid;
    return o;});
  console.log("\n— 3. a léptetés —");
  ok(r3.var&&/társad még versenyben van/.test(r3.varoSzoveg)&&/mindketten/.test(r3.varoSzoveg),
     "kiesés után a lánc megvárja a társ FA-ját — a váró kimondja, mi a tét",r3.varoSzoveg.slice(0,300));
  ok(/Vissza a közös nyári programhoz/.test(r3.felirat),"a HUB gombja közben a programhoz visz vissza",r3.felirat);
  ok(JSON.stringify(r3.prog)==='["FA","BLq","HSZ"]'&&r3.pi===1&&r3.comp==="BL"&&r3.wait===null,
     "a TÁRS győzelmére is elsül a lánc: a KK-selejtező bekerül mindkettőnek, a HSZ elé",{prog:r3.prog,pi:r3.pi});
  ok(JSON.stringify(r3.kampany1)==='["BLq"]',"a következő lépés (KK, selejtezőtől) indul",r3.kampany1);
  ok(/a társad győzelmével/.test(r3.naploLanc)&&/MINDKETTŐTÖKNEK/.test(r3.naploLanc),"a napló kimondja: a társ jogán, mindkettőtöknek",r3.naploLanc.slice(0,400));
  ok(r3.kulcs==="s4cupBLko"+"r16","a második lépés szakasz-kulcsa külön rekesz (sorozat-címkével)",r3.kulcs);
  ok(r3.qr===2,"a selejtező körszáma a programból jön",r3.qr);
  ok(JSON.stringify(r3.kampany2)==='["HSZ"]'&&r3.pi2===2&&r3.kulcs2==="s4cupHSZkor16"&&r3.mid2>0,
     "lánc nélküli lépés után azonnal a következő (HSZ), új közös mezőny-célértékkel",{k:r3.kampany2,kulcs:r3.kulcs2,mid:r3.mid2});

  /* győztesként nincs várakozás — a rekord felmegy */
  const r3b=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.mkToKLDone=false;S.mpProgWait=null;
    S.mpCup.prog=[{comp:"FA",qual:false,chain:{gives:"BL",qual:true}},{comp:"HSZ",qual:false,chain:null}];
    S.mpCup.pi=0;S.mpCup.comp="FA";
    delete window.__szoba[mpMkKey()];
    window.__kampany=[];
    S.euro={comp:"FA",result:"win",stage:"done",mateIdx:5,mateOut:"mk2"};
    endEuroCampaign();await varj(80);
    o.busy=_mpMkBusy;o.rec=window.__szoba[mpMkKey()]&&window.__szoba[mpMkKey()].host;
    o.kampany=window.__kampany.slice();
    return o;});
  ok(!r3b.busy&&r3b.rec&&r3b.rec.won===true&&JSON.stringify(r3b.kampany)==='["BLq"]',
     "győztesként nincs várakozás: a rekord felmegy, a KK azonnal indul",r3b);

  /* ================= 4. A NYÁRI TORNA ================= */
  const r4=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    const utolso=()=>{S.mpCup.prog=[{comp:"HSZ",qual:false,chain:null,hszBy:"both"}];S.mpCup.pi=0;S.mpCup.comp="HSZ";
      S.mpProgNyk=null;S.friendlyCupSeason=0;window.__kapu=0;$("scUnlock").classList.add("hide");};
    /* a) kiestem a negyeddöntőben, a társ még versenyben → nekem jár */
    utolso();
    S.euro={comp:"HSZ",result:"out",outAt:"qf",stage:"done",mateIdx:4,mateOut:null};
    endEuroCampaign();await varj(30);
    o.a_ablak=!$("scUnlock").classList.contains("hide");
    o.a_szoveg=$("unlockBody").textContent;
    o.a_nyk=JSON.stringify(S.mpProgNyk);
    o.a_kapuElotte=window.__kapu;
    /* kihagyom → jön a kupa utáni kapu */
    const no=[...$("unlockActions").querySelectorAll("button")].find(x=>/kihagyjuk/.test(x.textContent));
    no.click();await varj(30);
    o.a_kapuUtana=window.__kapu;o.a_done=S.mpProgNyk&&S.mpProgNyk.done;
    /* b) döntőben megvertem a társat → nem nekem jár */
    utolso();window.__naplo=[];
    S.euro={comp:"HSZ",result:"win",stage:"done",mateIdx:4,mateOut:"final"};
    endEuroCampaign();await varj(30);
    o.b_ablak=!$("scUnlock").classList.contains("hide");o.b_kapu=window.__kapu;
    o.b_nyk=JSON.stringify(S.mpProgNyk);o.b_naplo=window.__naplo.join(" ¦ ");
    /* c) a döntőben a társ vert meg → nekem (a vesztesnek) jár */
    utolso();
    S.euro={comp:"HSZ",result:"final",outAt:"final",stage:"done",mateIdx:4,mateOut:null};
    endEuroCampaign();await varj(30);
    o.c_ablak=!$("scUnlock").classList.contains("hide");
    /* d) ugyanabban a körben estünk ki (külön ágon) → nekem is jár */
    utolso();
    S.euro={comp:"HSZ",result:"out",outAt:"sf",stage:"done",mateIdx:4,mateOut:"sf"};
    endEuroCampaign();await varj(30);
    o.d_ablak=!$("scUnlock").classList.contains("hide");
    /* e) a társ korábban esett ki → nem nekem */
    utolso();
    S.euro={comp:"HSZ",result:"out",outAt:"sf",stage:"done",mateIdx:4,mateOut:"r16"};
    endEuroCampaign();await varj(30);
    o.e_ablak=!$("scUnlock").classList.contains("hide");o.e_kapu=window.__kapu;
    $("scUnlock").classList.add("hide");
    return o;});
  console.log("\n— 4. a nyári torna —");
  ok(r4.a_ablak&&/Te estél ki hamarabb/.test(r4.a_szoveg)&&/társadra nem kell várnod/.test(r4.a_szoveg)
     &&!/csak akkor indul, ha mindketten/.test(r4.a_szoveg)&&r4.a_kapuElotte===0,
     "a társ még versenyben: neked jár a nyári torna — egyedül, a „hamarabb kiestél” szöveggel",r4.a_szoveg.slice(0,220));
  ok(r4.a_kapuUtana===1&&r4.a_done===true,"a kihagyás után a kupa utáni kapu jön",{kapu:r4.a_kapuUtana,done:r4.a_done});
  ok(!r4.b_ablak&&r4.b_kapu===1&&/"me":false/.test(r4.b_nyk)&&/neki<\/b> jár/.test(r4.b_naplo),
     "döntőben győztesként NEM jár (a társnak szól) — egyenesen a kapu",r4);
  ok(r4.c_ablak,"a döntő vesztesének jár");
  ok(r4.d_ablak,"ugyanabban a körben kiesve mindkettőnek jár");
  ok(!r4.e_ablak&&r4.e_kapu===1,"ha a társ esett ki korábban, nem neked jár");

  /* ================= 5. KILÉPÉS ÉS VISSZATÉRÉS ================= */
  const r5=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    S.mkToKLDone=false;S.mpProgWait=null;S.mpProgNyk=null;
    S.mpCup.prog=[{comp:"FA",qual:false,chain:{gives:"BL",qual:true}},{comp:"HSZ",qual:false,chain:null}];
    S.mpCup.pi=0;S.mpCup.comp="FA";
    delete window.__szoba[mpMkKey()];
    window.__kampany=[];
    S.euro={comp:"FA",result:"out",outAt:"mk1",stage:"done",mateIdx:5,mateOut:null};
    endEuroCampaign();await varj(60);
    o.var=_mpMkBusy;
    h2hWaitLeave();await varj(30);
    o.utana=!_mpMkBusy;o.wait=JSON.stringify(S.mpProgWait);o.kampany=window.__kampany.slice();
    o.felirat=hubNextSeasonBtnLabel();
    phase="hub";
    hubNextSeasonFlow();await varj(60);
    o.ujraVar=_mpMkBusy;
    mpMkAbort();
    return o;});
  console.log("\n— 5. kilépés és visszatérés —");
  ok(r5.var&&r5.utana&&/"won":false/.test(r5.wait)&&r5.kampany.length===0,
     "a lánc-várakozásból kilépni NEM feladás: a várakozás mentve, semmi nem indul el",r5);
  ok(/Vissza a közös nyári programhoz/.test(r5.felirat)&&r5.ujraVar,"a HUB gombja ide hoz vissza, és a várakozás újra él",r5.felirat);

  /* ================= 6. KÖZÖS HSZ ================= */
  const r6=await p.evaluate(async()=>{
    const o={};
    const varj=ms=>new Promise(r=>setTimeout(r,ms));
    /* valódi, seedelt közös HSZ-mezőny */
    S.mpCup={season:S.seasonNumber,comp:"HSZ",qual:false,prog:[{comp:"HSZ",qual:false,chain:null,hszBy:"both"}],pi:0,
      mateName:"Társ FC",mateOvr:150,mateStr:155,mid:150,droppedApart:false};
    const f=buildEuroField("HSZ");
    S.euro={comp:"HSZ",stage:"group",md:0,idx:0,teams:f.teams,groups:f.groups,table:f.table,
      userIdx:f.userIdx,userG:f.userG,userSlot:f.userSlot,target:f.target,
      stats:{scorers:{},assists:{},cleanSheets:{}},fixtures:[],mateIdx:f.mateIdx,mateG:f.mateG,mateOut:null,
      mpSeeded:true,mpSeed:"s"+S.seasonNumber+":cup:HSZ",path:[]};
    const E=S.euro;
    o.van=E.mateIdx!=null&&E.mateIdx>=0;
    /* nyolc forduló: a háttér szimulál, a saját meccsemet 3:0-ra „játszom" */
    const G=E.groups[0];
    for(let md=0;md<HSZ_MATCHDAYS;md++){
      euroSimMatchday(md);
      hszSchedule()[md].forEach(([h,a])=>{
        if(h===E.userSlot||a===E.userSlot){
          const hi=G[h],ai=G[a],home=hi===E.userIdx;
          euroApplyResult(hi,ai,home?3:0,home?0:3);
          (E.ligMine=E.ligMine||[]).push({hi,ai,h:home?3:0,a:home?0:3});}});}
    o.szimDb=Object.keys(E.ligSim||{}).length;
    /* a társ valódi eredményei: mind a nyolcat elveszítette 0:1-re */
    const lig=Object.keys(E.ligSim).map(k=>{const [hi,ai]=k.split("-").map(Number);
      const home=hi===E.mateIdx;return {hi,ai,h:home?0:1,a:home?1:0};});
    const elotte=JSON.stringify(E.table[E.userIdx]);
    const kihagy=mpCupHszAdoptMate(lig.concat([{hi:E.userIdx,ai:E.mateIdx,h:9,a:0}]));
    o.kihagy=kihagy;
    o.sajatValtozatlan=JSON.stringify(E.table[E.userIdx])===elotte;
    o.tars=E.table[E.mateIdx];
    /* a pontösszeg: minden meccs 3 vagy 2 pontot oszt — az egész tabella konzisztens */
    let w=0,d=0,l=0;Object.values(E.table).forEach(r=>{w+=r.w;d+=r.d;l+=r.l;});
    o.konzisztens=(w===l)&&(d%2===0)&&(w+d/2===HSZ_MATCHDAYS*16);
    /* kiesett a ligaszakaszban? (0 pont → a 25+ közt) */
    mpCupMarkMateGroupOut();
    o.tarsKiesett=E.mateOut;
    /* ---- NÉZŐI RÁJÁTSZÁS: a társ a 9–24. közé kerül, én a top 8-ba ---- */
    E.mateOut=null;
    E.table[E.mateIdx]={w:4,d:0,l:4,gf:8,ga:8,pts:12};
    window.__szoba={};
    window.__varo=[];
    o.poban=hszMateInPlayoff();
    E.groupRank=1;
    hszSpectatePlayoff();
    await varj(80);
    o.spect=E.hszSpect&&_hszPoBusy;
    o.varo=(window.__varo||[]).join(" ¦ ");
    /* a társ megnyeri a rájátszását */
    window.__szoba[mpCupStageKey("kohszpo")]={guest:{won:true,at:Date.now()}};
    await varj(3200);
    o.stage=E.stage;o.hszSpect=E.hszSpect;
    o.tarsR16=E.ties.some(t=>t.a===E.mateIdx||t.b===E.mateIdx);
    o.enR16=E.userTie>=0;
    return o;});
  console.log("\n— 6. közös HSZ —");
  ok(r6.van&&r6.szimDb===8,"a társ nyolc ligameccse nálad szimulált, és el van téve",r6.szimDb);
  ok(r6.kihagy===1&&r6.sajatValtozatlan&&r6.tars.pts===0&&r6.tars.l===8,
     "a társ valódi eredményei a helyükre kerülnek — a saját sorodhoz semmi nem nyúl",{kihagy:r6.kihagy,tars:r6.tars});
  ok(r6.konzisztens,"a csere után az egész tabella konzisztens (győzelem = vereség, 8 forduló × 16 meccs)");
  ok(r6.tarsKiesett==="group","a csere után a ligaszakaszban kiesett társ „kiesett”-ként áll",r6.tarsKiesett);
  ok(r6.poban&&r6.spect&&/legjobb nyolcban/.test(r6.varo),"top 8-ból NÉZŐKÉNT várjuk a társ rájátszását — a váró kimondja, miért",r6.varo.slice(0,200));
  ok(r6.stage==="r16"&&!r6.hszSpect&&r6.tarsR16&&r6.enR16,"a társ valódi győzelmével áll fel a nyolcaddöntő (ő is, te is benne)",r6);

  /* ================= 7. MENTÉS ================= */
  const src=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  console.log("\n— 7. mentés, oldalhiba —");
  ok(/mpProgWait:S\.mpProgWait\|\|null,mpProgNyk:S\.mpProgNyk\|\|null/.test(src)
     &&/S\.mpProgWait=\(d\.S&&d\.S\.mpProgWait\)\|\|null;S\.mpProgNyk=\(d\.S&&d\.S\.mpProgNyk\)\|\|null/.test(src),
     "az új mezők mentődnek és betöltődnek");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
