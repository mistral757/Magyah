/* 📏 3.9.213 — A POT-JUTALOM ÉS A FELÁLLÁS-ÁRAK SKÁLÁZÁSA

   KIMONDOTT KÉRÉS (a „+1575 POT egy játékosra" kihívás-kártya képével):
   „Ez a típusú jutalom is legyen skálázva, mert eddig nem volt. Ezen felül a
   felállás vásárlás, saját felállás készítése sem volt skálázva. Legyen
   ugyanúgy, mint a többi (scout fejlesztés, pozíció tanulás stb)."

   Amit mér:
     1. A POT-JUTALOM: 85-ös mezőnyig betűre a régi 1500 × nehézség (a képen
        látott 1575 is); fölötte a mezőny-szintű POT arányában nő, monoton; a
        kártya szövege ugyanazt a számot írja; a kifizetés a teljes összeget
        adja (a kemény POT-plafon alatt);
     2. A FELÁLLÁS-ÁRAK: a saját felállás és a bolti felállás ára pontosan a
        scaledUpgradePrice(alap) — referencia-büdzsénél a régi 50 / 75 Mrd,
        kisebb klubnál kevesebb, nagyobbnál a gyöke szerint több, az 1.
        idényben −50%; a stílus-kedvezmény erre szorzódik;
     3. A FELÜLET: a bolt és a tervezőasztal a skálázott árat mutatja, a
        vásárlás és a létrehozás pontosan azt vonja le. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9255;
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
    if(captainIdx<0)captainIdx=0;if(!coach)coach=COACHES[0];if(!scout)scout=generateScout();
    window.saveGame=()=>{};
    phase="hub";S.seasonNumber=5;
    return {v:APP_VERSION,fn:typeof challengePotAmount==="function"&&typeof customFormPrice==="function"};});
  ok(String(r0.v).localeCompare("3.9.213",undefined,{numeric:true})>=0,"a verzió legalább 3.9.213",r0.v);
  ok(r0.fn,"a két új árfüggvény létezik");
  if(!r0.fn){await b.close();srv.close();console.log(`\n✗ ${hiba} hiba`);process.exit(1);}

  console.log("\n— 1. a POT-jutalom —");
  const r1=await p.evaluate(()=>{
    const am=(f,m)=>challengePotAmount({oppRating:f},m);
    const o={a60:am(60,1),a82:am(82,1),a85k:am(85,1.05),a85:am(85,1),a100:am(100,1),a150:am(150,1),a400:am(400,1),a400m:am(400,1.05)};
    /* a kártya: genReward a valódi kontextussal, 400-as mezőnyön */
    oppTargetRating=400;
    const ctx=challengeContext();
    let kartya=null;
    for(let i=0;i<400&&!kartya;i++){const rw=genReward("short","medium",ctx);if(rw&&rw.kind==="pot")kartya=rw;}
    o.kartya=kartya;
    o.vart400=kartya?challengePotAmount(ctx,challengeDiffMult("medium")):null;
    /* a kifizetés: mindenki 1,5 millión, 400-as mezőnyön → egy ember a teljes összeget kapja */
    const ros=fullCareerRoster().filter(Boolean);
    ros.forEach(pl=>{const e=careerPool[pl.n];e.pot=1500000;});
    if(kartya)applyChallengeReward(kartya);
    const pots=ros.map(pl=>careerPool[pl.n].pot);
    o.fiz={max:Math.max(...pots),min:Math.min(...pots),kapott:pots.filter(x=>x>1500000).length};
    oppTargetRating=82;
    return o;});
  ok(r1.a60===1500&&r1.a82===1500&&r1.a85===1500,"85-ös mezőnyig (és alatta) a régi 1500",[r1.a60,r1.a82,r1.a85]);
  ok(r1.a85k===1575,"a képen látott közepes nehézség (×1,05) 85-ös mezőnyön ma is 1575",r1.a85k);
  ok(r1.a100>4000&&r1.a100<5000,"100-as mezőnyön ~×3",r1.a100);
  ok(r1.a150>30000&&r1.a150<40000,"150-es mezőnyön ~×23",r1.a150);
  ok(r1.a400>900000&&r1.a400<1000000&&r1.a400m>r1.a400,"400-as mezőnyön ~×640 (a nehézség itt is szoroz)",[r1.a400,r1.a400m]);
  ok(r1.a85<=r1.a100&&r1.a100<r1.a150&&r1.a150<r1.a400,"monoton nő a mezőnnyel");
  ok(r1.kartya&&r1.kartya.amount===r1.vart400&&r1.kartya.desc.replace(/\s/g,"").includes(String(r1.vart400)),
     "a kártya a skálázott számot hozza és írja ki",r1.kartya);
  ok(r1.fiz.kapott===1&&r1.fiz.max===1500000+r1.vart400&&r1.fiz.min===1500000,"a kifizetés a teljes összeget adja egy embernek",r1.fiz);

  console.log("\n— 2. a felállás-árak —");
  const r2=await p.evaluate(()=>{
    const o={};
    const ered=window.clubBudgetScale;
    const at=(bud,sn)=>{window.clubBudgetScale=()=>bud;S.seasonNumber=sn;
      return {cf:customFormPrice(),cfRef:scaledUpgradePrice(CUSTOM_FORM_BASE,500),
              shop:shopFormBasePrice("424"),shopRef:scaledUpgradePrice(FORM_SHOP["424"].price,500)};};
    o.ref=at(PRICE_BUDGET_REF,5);
    o.kicsi=at(PRICE_BUDGET_REF/2,5);
    o.nagy=at(PRICE_BUDGET_REF*4,5);
    o.elso=at(PRICE_BUDGET_REF,1);
    o.regiCf=Math.round(50e9/HUF_PER_POINT);o.regiShop=Math.round(75e9/HUF_PER_POINT);
    /* a stílus-kedvezmény a skálázott alapra szorzódik */
    const eredSt=window.styleFormDiscount;
    window.clubBudgetScale=()=>PRICE_BUDGET_REF*4;S.seasonNumber=5;
    window.styleFormDiscount=()=>0.8;
    o.stilus={ar:shopFormPrice("424"),alap:shopFormBasePrice("424")};
    window.styleFormDiscount=eredSt;
    window.clubBudgetScale=ered;
    return o;});
  ok(r2.ref.cf===r2.regiCf&&r2.ref.shop===r2.regiShop,"referencia-büdzsénél a régi 50 és 75 Mrd",r2.ref);
  ok(["ref","kicsi","nagy","elso"].every(k=>r2[k].cf===r2[k].cfRef&&r2[k].shop===r2[k].shopRef),
     "mindkettő pontosan a scaledUpgradePrice (a scout-fejlesztés útja)");
  const fel=x=>Math.round(x/2/500)*500;   /* az árak 500 pontra kerekednek, ahogy a scout-fejlesztésé */
  ok(r2.kicsi.cf===fel(r2.regiCf)&&r2.kicsi.shop===fel(r2.regiShop),"fele akkora klubnál fele az ár (500-ra kerekítve)",r2.kicsi);
  ok(r2.nagy.cf===r2.regiCf*2&&r2.nagy.shop===r2.regiShop*2,"négyszeres klubnál a gyöke: kétszeres",r2.nagy);
  ok(r2.elso.cf===fel(r2.regiCf)&&r2.elso.shop===fel(r2.regiShop),"az 1. idényben a kezdő −50% itt is él",r2.elso);
  ok(r2.stilus.ar===Math.round(r2.stilus.alap*0.8),"a stílus-kedvezmény a skálázott alapra szorzódik",r2.stilus);

  console.log("\n— 3. a felület: bolt, tervezőasztal, levonás —");
  const r3=await p.evaluate(()=>{
    const o={};
    const ered=window.clubBudgetScale;
    window.clubBudgetScale=()=>PRICE_BUDGET_REF*4;S.seasonNumber=5;
    S.transferBudget=1e9;S.formsBought={};S.customForms={};
    renderFormationShop();
    const box=document.getElementById("hubFormationShop");
    const txt=(box&&box.textContent||"").replace(/\s/g,"");
    o.boltAr=shopFormPrice("424");o.cfAr=customFormPrice();
    o.boltMutat=txt.includes(fmtFt(o.boltAr).replace(/\s/g,""));
    o.cfMutat=txt.includes(fmtFt(o.cfAr).replace(/\s/g,""));
    o.regiNincs=!txt.includes(fmtFt(Math.round(75e9/HUF_PER_POINT)).replace(/\s/g,""));
    /* bolti vásárlás */
    let b0=S.transferBudget;const rb=buyShopForm("424");o.vett={ok:rb.ok,levont:b0-S.transferBudget,ar:o.boltAr};
    /* saját felállás: egy szabad alak (5-2-3) */
    b0=S.transferBudget;const rc=createCustomForm(5,2,3,{d:null,m:null,f:null});
    o.sajat={ok:rc.ok,levont:b0-S.transferBudget,ar:rc.price,cf:o.cfAr,ok2:rc.reason};
    /* a tervezőasztal gombja */
    /* egy még szabad, érvényes alak (a 4-2-4 és az 5-2-3 már foglalt) */
    let jo=null;
    for(let d=3;d<=6&&!jo;d++)for(let m=1;m<=6&&!jo;m++){const f=10-d-m;if(f>=1&&!customFormError(d,m,f))jo={d,m,f};}
    o.alak=jo;
    FB={d:jo.d,m:jo.m,f:jo.f,w:{d:null,m:null,f:null}};
    const fbBox=document.getElementById("hubFormBuilder");
    if(fbBox){fbBox.classList.remove("hide");renderFormBuilder();
      o.tervezo=(fbBox.textContent||"").replace(/\s/g,"").includes(fmtFt(customFormPrice()).replace(/\s/g,""));}
    window.clubBudgetScale=ered;
    return o;});
  ok(r3.boltMutat&&r3.cfMutat&&r3.regiNincs,"a bolt a skálázott árakat mutatja, a régi fix 75 Mrd-ot nem",r3);
  ok(r3.vett.ok&&r3.vett.levont===r3.vett.ar,"a bolti vásárlás pontosan a skálázott árat vonja le",r3.vett);
  ok(r3.sajat.ok&&r3.sajat.levont===r3.sajat.cf&&r3.sajat.ar===r3.sajat.cf,"a saját felállás pontosan a skálázott árat vonja le, és visszaadja",r3.sajat);
  ok(r3.tervezo,"a tervezőasztal gombja a skálázott árat írja");

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
