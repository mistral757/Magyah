/* 🃏🔣 3.9.321 — MINDEN ÁTIGAZOLÁSI ESEMÉNY A PAKLIBAN, JOKER-KIEMELÉS,
   EGY JEL A MEZEN, MEZSZPONZOR-JEL.

   KÉRÉS: „Lehessen 1 db valamit tenni minden mezre választható helyre a mezen
   … egyetlen beüthető karakter, akárcsak a címernél … az az átigazolási
   esemény, ami mezszponzoros cucc, és akkor ott egy konkrét emoji vagy
   jelecske lehetne, amit kér a szponzor … minden esemény legyen eleve a
   pakliban, a Joker talizmánja … azok húzásának jelentősen megnövekedjen az
   esélye … a 3 legyen pozitív, a negatív talizmán tulajdonság pedig legyen
   1 db negatív, aminek az esélye megnövekszik."

   Amit mér:
     1. talizmán nélkül is mind a 16 esemény a pakliban, alapsúllyal;
     2. a Joker-lap 3 jó + 1 rossz eseményt emel ki, a többi alapsúlyon marad,
        és az égetés megszünteti a kiemelést;
     3. a jel-tisztító egy grafémát hagy (zászló, bőrszínes emoji egyben),
        a HTML-jeleket kidobja;
     4. a jel a mezen a választott helyen rajzolódik; a szerkesztőben
        beírható, helyet lehet választani, a mentés megőrzi, a „Nincs jel"
        törli;
     5. a stylist mez-ablakban is beírható, és a mentett ellenfél-mez viszi;
     6. a mezszponzor negyedik ajánlata: a cég jele a mezünkön (a kért
        helyen, a saját jel helyett), meccsenként fizet, a kötbér számol vele,
        a lejárat után a saját jel visszajön;
     7. a szponzorszín-szerződés az ablak-díj után is él (régi hiba), és a
        már elrontott mentés helyreáll;
     8. a mez eleje vagy hátulja az animációkban (arculat, 6. szakasz);
     9. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9321;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const b=document.getElementById("unlockWelBtn");if(b&&b.offsetParent)b.click();});
  await p.waitForLoadState("load");await p.waitForTimeout(2000);
  await p.evaluate(()=>{const b=document.getElementById("modeCareerPyrBtn");if(b&&b.offsetParent)b.click();});await p.waitForTimeout(500);
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
    openHubMidSeason();
    window.saveGame=()=>{};
    /* a meccsmotor helyett egy számláló — a kapu a kezdőrúgás ELŐTT dönt */
    window._motor=0;playMatchMotor=function(){window._motor++;};
    window._toast=[];backToast=function(m){window._toast.push(String(m));};});
  await p.waitForTimeout(800);

  console.log("— 1. a pakli talizmán nélkül —");
  const r1=await p.evaluate(()=>{
    S.tal=S.tal||{};S.tal.lapok=[];S.tal.esemenyek={};
    const P=talEsemenyPakli();
    return {db:P.length,ossz:TAL_ESEMENY.length,sulyok:[...new Set(P.map(x=>x.weight))],kiemelt:P.filter(x=>x.kiemelt).length};});
  ok(r1.db===16&&r1.ossz===16,"mind a 16 esemény a pakliban, talizmán nélkül is",r1);
  ok(r1.sulyok.length===1&&r1.sulyok[0]===0.25&&r1.kiemelt===0,"mind alapsúlyon (0,25), kiemelés nélkül",r1);

  console.log("— 2. a Joker-kiemelés —");
  const r2=await p.evaluate(()=>{
    const o={};
    let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    const cs=talCsomagDob(rnd);
    o.csomag=cs.map(id=>({id,jo:TAL_ESEMENY_BY[id].jo}));
    const L={kat:"joker",rang:3,dobas:0.5,valt:"csomag",csomag:cs,uid:991,szezon:S.seasonNumber||1};
    S.tal.lapok=[L];
    o.talOn=talOn();
    const P=talEsemenyPakli();
    o.db=P.length;
    o.kiemelt=P.filter(x=>x.kiemelt).map(x=>[x.tal,x.weight]);
    o.tobbi=[...new Set(P.filter(x=>!x.kiemelt).map(x=>x.weight))];
    o.szoveg=talAlapSzoveg(L);
    L.eget=true;
    o.egetUtan=talEsemenyPakli().filter(x=>x.kiemelt).length;
    S.tal.lapok=[];
    return o;});
  ok(r2.csomag.length===4&&r2.csomag.filter(x=>x.jo).length===3&&r2.csomag.filter(x=>!x.jo).length===1,"a lap 3 jó + 1 rossz eseményt hoz",r2.csomag);
  ok(r2.db===16&&r2.kiemelt.length===4&&r2.kiemelt.every(x=>x[1]>=1),"a pakliban továbbra is 16, ebből 4 kiemelve (×4 vagy több)",r2);
  ok(r2.tobbi.length===1&&r2.tobbi[0]===0.25,"a többi alapsúlyon marad",r2.tobbi);
  ok(/✦/.test(r2.szoveg)&&/✖/.test(r2.szoveg),"a lap szövege a 3 jót és az 1 rosszat is mutatja",r2.szoveg);
  ok(r2.egetUtan===0,"az égetett lap már nem emel ki",r2.egetUtan);

  console.log("— 3. a jel-tisztító —");
  const r3=await p.evaluate(()=>({
    csillag:kitJelTisztit("★★★"),betu:kitJelTisztit("ab"),
    zaszlo:kitJelTisztit("🇭🇺🇩🇪"),bor:kitJelTisztit("👍🏽x"),csalad:kitJelTisztit("👨‍👩‍👧"),
    html:kitJelTisztit("<b>"),ures:kitJelTisztit("   "),nul:kitJelTisztit(null)}));
  ok(r3.csillag==="★"&&r3.betu==="a","egy karakter marad",r3);
  ok(r3.zaszlo==="🇭🇺"&&r3.bor==="👍🏽"&&r3.csalad==="👨‍👩‍👧","a többrészes emoji egynek számít",r3);
  ok(r3.html==="b"&&r3.ures===""&&r3.nul==="","a HTML-jelek kiesnek, az üres üres",r3);

  console.log("— 4. a jel a saját mezen és a szerkesztőben —");
  const r4=await p.evaluate(()=>{
    const o={};
    const svg=jerseySVG({c1:"#c8102e",c2:"#ffffff",pat:"solid",sleeve:"same",collar:"crew",ink:"#ffffff",jel:"🦁",jelHely:"ujjb"},100,{num:9});
    o.rajz=/data-kitjel="ujjb"/.test(svg)&&svg.includes("🦁");
    o.nincs=!/data-kitjel/.test(jerseySVG({c1:"#c8102e",c2:"#ffffff",pat:"solid"},100,{}));
    o.alaphely=/data-kitjel="mellb"/.test(jerseySVG({c1:"#c8102e",c2:"#ffffff",jel:"Ω"},100,{}));
    identOpenPanel();
    const inp=document.getElementById("identKitJel");
    o.mezo=!!inp;o.helyek=document.querySelectorAll("#twBody [data-kjelh]").length;
    inp.value="⚽ labda";inp.dispatchEvent(new Event("input"));
    o.draft=_identDraft.kit.home.jel;
    o.elonezet=!!document.querySelector("#twBody .kitPrev [data-kitjel]");
    inp.dispatchEvent(new Event("change"));
    document.querySelector('#twBody [data-kjelh="has"]').click();
    o.hely=_identDraft.kit.home.jelHely;
    identSaveDraft();
    o.mentett=JSON.stringify(identKit("home"));
    o.kitNow=kitForNow().jel+"@"+kitForNow().jelHely;
    identOpenPanel();
    o.ujraMezo=document.getElementById("identKitJel").value;
    document.getElementById("identKitJelOff").click();
    identSaveDraft();
    o.torolve=!("jel" in (identKit("home")||{}));
    return o;});
  ok(r4.rajz&&r4.nincs&&r4.alaphely,"a jel a választott helyen rajzolódik (alap: bal mell), jel nélkül semmi",r4);
  ok(r4.mezo&&r4.helyek===7,"a szerkesztőben szövegmező és 7 hely",r4);
  ok(r4.draft==="⚽"&&r4.elonezet,"beírva egy jel marad, és az előnézetben látszik",r4);
  ok(r4.hely==="has"&&/"jel":"⚽"/.test(r4.mentett)&&/"jelHely":"has"/.test(r4.mentett)&&r4.kitNow==="⚽@has","a mentés megőrzi a jelet és a helyet, a pályakép is ezt hordja",r4);
  ok(r4.ujraMezo==="⚽"&&r4.torolve,"újranyitva ott van, a „Nincs jel” törli",r4);
  await p.evaluate(()=>{const b=document.getElementById("twCancel")||document.getElementById("twClose");if(b)try{b.click();}catch(e){}});

  console.log("— 5. a stylist mez-ablak —");
  const r5=await p.evaluate(()=>{
    const o={};
    try{localStorage.removeItem(MEZ_HELYI_KEY);}catch(e){}
    let tov=0;mezAblak(()=>{tov++;});
    const inp=document.getElementById("mezJel");
    o.mezo=!!inp;o.helyek=document.querySelectorAll("#mezTorzs [data-mezjelh]").length;
    inp.value="♞";inp.dispatchEvent(new Event("input"));
    o.elonezet=/data-kitjel/.test(document.getElementById("mezElonezet").innerHTML);
    document.querySelector('#mezTorzs [data-mezjelh="mellk"]').click();
    const nyers=mezEllenfelNev();
    [...document.querySelectorAll("#mezGombok button")][0].click();
    const M=mezFor(nyers);
    o.mentett=M&&M.jel+"@"+M.jelHely;o.tov=tov;
    o.tisztit=JSON.stringify(mezTisztit({c1:"#112233",c2:"#ffffff",jel:"<x>",jelHely:"rossz"}));
    o.tisztit2=JSON.stringify(mezTisztit({c1:"#112233",c2:"#ffffff",jel:"★",jelHely:"rossz"}));
    return o;});
  ok(r5.mezo&&r5.helyek===7&&r5.elonezet,"a stylist ablakban is beírható jel, 7 hellyel, élő előnézettel",r5);
  ok(r5.mentett==="♞@mellk"&&r5.tov===1,"a mentett ellenfél-mez viszi a jelet és a helyet",r5);
  ok(!/"jel":"</.test(r5.tisztit)&&/"jel":"★","jelHely":"mellb"/.test(r5.tisztit2),"a tisztító a rossz helyet az alapra cseréli, HTML nem megy át",r5);

  console.log("— 6. a mezszponzor jele —");
  const r6=await p.evaluate(()=>{
    const o={};
    identState().kit={home:{c1:"#c8102e",c2:"#ffffff",pat:"solid",sleeve:"same",collar:"crew",ink:"#ffffff",jel:"Ω",jelHely:"has"},
      away:{c1:"#f2f4f7",c2:"#c8102e",pat:"solid",sleeve:"alt",collar:"crew",ink:"#c8102e"},gk:null};
    talEsFut().szponzor=null;
    const w=fanWeeklyIncome();o.w=w>0;
    let h=null;for(let i=0;i<5&&!h;i++)h=TAL_ES_IMPL.szponzor.elo();
    o.aj=Object.keys(h.aj);o.gombok=h.gombok.map(g=>g.k);
    o.jelAj=h.aj.mezjel;
    o.txt=TAL_ES_IMPL.szponzor.alkalmaz(h,"mezjel");
    const Z=talSzponzor();
    o.Z=Z&&Z.k;
    o.mezJel=talSzponzorMezJel();
    const K=kitForNow();o.kitNow=K.jel+"@"+K.jelHely;
    o.kapus=kapusKitNow().jel===h.aj.mezjel.jel;
    o.svg=jerseySVG(K,60,{}).includes(esc(h.aj.mezjel.jel));
    o.sajatMarad=identKit("home").jel==="Ω";
    S.idx=3;const b0=S.transferBudget;talSzponzorMeccs();o.fizet=S.transferBudget-b0;o.vart=Math.round(w*h.aj.mezjel.pct);
    o.kot=talSzponzorHatraErtek()>0;
    identOpenPanel();o.szerkFigy=/szerződése él/.test(document.getElementById("twBody").innerHTML);
    _identDraft=null;
    const menu=talKepessegek().find(x=>x.k==="szponzor");o.menu=menu&&menu.d;
    Z.utolso=S.seasonNumber;talSzponzorSzezonvaltas();
    o.lejart=!talSzponzor()&&kitSzponzorral(identKitOrDefault("home")).jel==="Ω"&&!talSzponzorMezJel();
    return o;});
  ok(r6.aj.join()==="logo,szin,stadion,mezjel"&&r6.gombok.join()==="logo,szin,mezjel,stadion,nem","négy ajánlat, köztük a mezjel",r6);
  ok(r6.jelAj&&kitJelHelyOk(r6.jelAj.hely)&&r6.jelAj.pct>=0.08&&r6.jelAj.pct<=0.14,"a mezjel-ajánlat: jel, hely, 8–14%",r6.jelAj);
  ok(r6.Z==="mezjel"&&r6.mezJel&&r6.kitNow===`${r6.jelAj.jel}@${r6.jelAj.hely}`&&r6.kapus&&r6.svg,"a szponzor jele a mezen, a kért helyen (a kapusmezen is)",r6);
  ok(r6.sajatMarad,"a saját jel nem vész el, csak a szerződés idejére háttérbe kerül",r6);
  ok(r6.fizet===r6.vart&&r6.vart>0&&r6.kot,"meccsenként fizet, a kötbér számol vele",{fizet:r6.fizet,vart:r6.vart});
  ok(r6.szerkFigy&&/jel a mezen/.test(r6.menu||""),"a szerkesztő és a talizmán-menü kiírja",r6.menu);
  ok(r6.lejart,"lejárat után a saját jel jön vissza",r6);

  console.log("— 7. a szponzorszín-szerződés túléli az ablak-díjat —");
  const r7=await p.evaluate(()=>{
    const o={};
    const sz=S.seasonNumber||1;
    talEsFut().szponzor={k:"szin",szin:"#f2c230",szinNev:"napsárga",cegnev:"X",osszeg:1000,ev:2,elso:sz,utolso:sz+1,fizetve:0};
    S.idx=8;const b0=S.transferBudget;talSzponzorMeccs();talSzponzorMeccs();
    o.egyszer=S.transferBudget-b0;
    o.el=!!talSzponzor();o.utolso=talSzponzor()&&talSzponzor().utolso;
    /* a régi hiba nyoma egy mentésben */
    talEsFut().szponzor={k:"szin",szin:"#f2c230",szinNev:"napsárga",cegnev:"X",osszeg:1000,ev:2,elso:sz,utolso:`${sz}:8`,fizetve:0};
    const Z=talSzponzor();o.helyreall=!!Z&&Z.utolso===sz+1&&Z.ablak===`${sz}:8`;
    S.idx=8;const b1=S.transferBudget;talSzponzorMeccs();o.nemDuplaz=S.transferBudget-b1;
    talEsFut().szponzor=null;S.idx=0;
    return o;});
  ok(r7.egyszer===1000&&r7.el&&r7.utolso===(await p.evaluate(()=>S.seasonNumber||1))+1,"az ablak-díj egyszer jár, és a szerződés él tovább",r7);
  ok(r7.helyreall&&r7.nemDuplaz===0,"az elrontott mentés helyreáll, a már kifizetett ablak nem fizet újra",r7);

  console.log("— 8. a mez eleje vagy hátulja az animációkban —");
  const r8=await p.evaluate(()=>{
    const o={};
    o.alap=animHatul();
    const k={c1:"#c8102e",c2:"#ffffff",pat:"solid",collar:"crew",ink:"#ffffff",jel:"🦁",jelHely:"mellb"};
    const jp={n:"Teszt Elek",nat:"HU",age:25};
    const elol=evaFigura("pf1",evaFig(jp,k,.5),k,50,50,1);
    o.elolJel=/data-evajel="mellb"/.test(elol)&&elol.includes("🦁")&&!/data-evaszam/.test(elol);
    identOpenPanel();
    o.gombok=!!document.getElementById("identAnimEleje")&&!!document.getElementById("identAnimHatul");
    document.getElementById("identAnimHatul").click();
    o.be=animHatul()&&identState().animHatul===true;
    o.gombSel=document.getElementById("identAnimHatul").classList.contains("on");
    _identDraft=null;
    const F=evaFig(jp,k,.5);
    const hat=evaFigura("pf2",F,k,50,50,1);
    o.hatSzam=/data-evaszam/.test(hat)&&!/data-evajel/.test(hat)&&F.hatul===true&&typeof F.num==="number";
    o.fejMas=F.fej!==evaFig(jp,k,.5).fej?"cache-hiba":(F.fej!==(()=>{identState().animHatul=false;const u=evaFig(jp,k,.5).fej;identState().animHatul=true;return u;})());
    const svg=faceSVG(jp,60,{kit:k,bg:false,csakFej:true,hatul:true});
    o.nincsSzem=!/#fbfbf8/.test(svg);
    o.kapusEgy=evaMezSzam({n:"Ellenfél kapusa"})===1;
    o.stabil=evaMezSzam({n:"Valaki"})===evaMezSzam({n:"Valaki"});
    animHatulSet(false);o.ki=!animHatul();
    return o;});
  ok(r8.alap===false&&r8.elolJel,"alapból elölről: arc, a mellen a jel, szám nélkül",r8);
  ok(r8.gombok&&r8.be&&r8.gombSel,"az arculat 6. szakaszában kapcsolható, azonnal érvényes",r8);
  ok(r8.hatSzam&&r8.fejMas===true&&r8.nincsSzem,"hátulról: tarkó (szemek nélkül), a háton a szám, jel nélkül",r8);
  ok(r8.kapusEgy&&r8.stabil&&r8.ki,"az ellenfél kapusa 1-es, a többi szám névből stabil; visszakapcsolható",r8);

  console.log("— 9. oldalhibák —");
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
function kitJelHelyOk(h){return ["mellb","mellk","mellj","ujjb","has"].includes(h);}
