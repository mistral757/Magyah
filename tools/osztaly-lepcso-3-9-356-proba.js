/* 🪜 OSZTÁLYLÉPCSŐ A NEHÉZSÉGI SZINTTŐL + A VILÁG IDÉNY KÖZBENI EMELÉSE (3.9.356).

   KIMONDOTT KÉRÉS: „Ez egyszerűen megoldható lenne, ha a saját ligánk
   fejlődésével a fentebbi ligak szintje is szépen tornázná fel magát. És
   egyébként is az új adatok fényében felül lehetne vizsgálni, hogy alap
   járaton mennyi a minimum elvárt nehézségi szint lépés két divízió között
   játék nehézségi szinttől függően." — „b) verzió".

   Amit mér:
     1. a lépcső fokozatonként: 1–3: 3,0 · 4–6: 3,5 · 7–8: 4,0 · 9–10: 4,5;
     2. egy új, 8. fokozatú karrier világában az osztályközepek közt ~4,0 a
        lépcső (egy 2. fokozatúban ~3,0), és a karrier szerződése lepcsoV;
     3. a világ idény közbeni emelése (téli emelés + gyorsítás + követés, a
        boost-adósság nélkül) minden osztály „most" számán ott van — a D1 nem
        csúszhat a saját osztályod alá;
     4. a feljutási pótlék: feljutás után a rajt-cél pontosan a lépcső 3,0
        fölötti részével szorosabb; kiesés után és régi szerződésben nincs;
     5. nincs oldalhiba. */
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9356;
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
  await p.addInitScript(()=>{window.HANG_TESZT=true;try{localStorage.setItem("scoutReal30_0","0");localStorage.setItem("meresFel30_0","0");}catch(e){}});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);


  async function karrier(nf){
    await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
    await p.waitForTimeout(1000);
    await p.evaluate(()=>document.getElementById("mpSoloBtn").click());await p.waitForTimeout(600);
    await p.evaluate(()=>{const x=document.getElementById("unlockWelBtn");if(x&&x.offsetParent)x.click();});
    await p.waitForLoadState("load");await p.waitForTimeout(1500);
    await p.evaluate(()=>{const x=document.getElementById("modeCareerPyrBtn");if(x&&x.offsetParent)x.click();});await p.waitForTimeout(400);
    return p.evaluate((nf)=>{
      unlockGatesOn=()=>false;   /* a kinyitott profil (a kezdő lépcsőn túl) */
      beginNewGame();
      const sq=SQUADS.filter(x=>!x.wc&&x.players&&x.players.length>=18)[0];
      const _sc=showChemistry;showChemistry=()=>{};
      S.pyr=null;S.idx=0;pyrPickSq={club:"draft",season:"",players:sq.players.slice(0,15)};
      pyrPickFromDraft=true;pyrPickDiv=null;pyrPendingSpeed=pyrWantedSpeed;
      pyrPickNf=nf;
      renderPyrDivPick();pyrConfirmDiv();showChemistry=_sc;
      const P=S.pyr;
      const m=P.divs.filter(d=>d.id>=1).map(d=>d.mean);
      const lep=[];for(let i=0;i+1<m.length;i++)lep.push(Math.round((m[i]-m[i+1])*100)/100);
      return {nf:P.nf,lepcsoV:P.lepcsoV||0,lep,atl:lep.reduce((a,x)=>a+x,0)/lep.length,step:pyrLepcso(),potl:pyrFeljutPotlek()};},nf);}

  console.log("— 1. a lépcső fokozatonként —");
  const t=await p.evaluate(()=>[1,2,3,4,5,6,7,8,9,10].map(pyrLepcsoFor));
  ok(JSON.stringify(t)===JSON.stringify([3,3,3,3.5,3.5,3.5,4,4,4.5,4.5]),"1–3: 3,0 · 4–6: 3,5 · 7–8: 4,0 · 9–10: 4,5",t);

  console.log("\n— 2. a világ lépcsője az új karrierben —");
  const k2=await karrier(2);
  ok(k2.nf===2&&k2.lepcsoV===1&&k2.step===3&&k2.potl===0,"2. fokozat: lépcső 3,0, pótlék nincs",k2);
  ok(Math.abs(k2.atl-3)<0.6,"2. fokozat: az osztályközepek átlagos lépcsője ~3,0",k2.lep);
  const k8=await karrier(8);
  ok(k8.nf===8&&k8.lepcsoV===1&&k8.step===4&&k8.potl===1,"8. fokozat: lépcső 4,0, pótlék 1,0",k8);
  ok(Math.abs(k8.atl-4)<0.6&&k8.atl-k2.atl>0.6,"8. fokozat: az osztályközepek átlagos lépcsője ~4,0 (egy teljes ponttal több)",{k8:k8.lep,k2:k2.lep});

  console.log("\n— 3. a világ idény közbeni emelése —");
  const r3=await p.evaluate(()=>{
    const o={};const P=S.pyr,sn=S.seasonNumber||1;
    S.idx=20;
    P.gyors={sn,acc:6,idx:20,szunet:0};
    const _k=nfKovRec;window.__k=_k;
    nfKovRec=()=>({kov:{ad:5,emel:[{f:5,amt:2}],rajt:0,dgB:0,tur:0}});
    o.em=pyrVilagEmeles();
    const id=pyrMyDivId(),D=pyrDivs();
    const d1=D.find(d=>d.id>=1&&d.id!==id);o.masik=d1.id;
    o.d1=oppMatchStrength(d1.mean+pyrAiRate(d1.id)*20/30+o.em);
    o.d1Regi=oppMatchStrength(d1.mean+pyrAiRate(d1.id)*20/30);
    o.html=pyrLadderHtml();
    o.d1Txt=pyrN1(o.d1);o.id=id;
    nfKovRec=_k;
    return o;});
  ok(Math.abs(r3.em-8)<1e-9,"a világ emelése = gyorsítás 6 + követés 2, a boost-adósság (5) nélkül",r3.em);
  ok(r3.html.indexOf(r3.d1Txt)>=0&&Math.abs(r3.d1-r3.d1Regi-8)<1e-6,"a létrán a többi osztály „most” száma az emeléssel együtt áll",{masik:r3.masik,most:r3.d1,regi:r3.d1Regi,sajat:r3.id});

  console.log("\n— 4. a feljutási pótlék —");
  const r4=await p.evaluate(()=>{
    const o={};const P=S.pyr,H=pyrFloorHist();
    const _on=nfOn;nfOn=()=>true;
    const sn=3;const my=P.my;
    H[2]={div:my+1,done:true};o.fel=pyrFloorWantFor(sn);o.potFel=pyrFeljutPotlekFor(sn);
    H[2]={div:my,done:true};o.marad=pyrFloorWantFor(sn);o.potMarad=pyrFeljutPotlekFor(sn);
    H[2]={div:my-1,done:true};o.kies=pyrFloorWantFor(sn);
    H[2]={div:my+1,done:true};const v=P.lepcsoV;delete P.lepcsoV;o.regi=pyrFloorWantFor(sn);o.potRegi=pyrFeljutPotlekFor(sn);P.lepcsoV=v;
    delete H[2];nfOn=_on;
    return o;});
  ok(r4.potFel===1&&Math.abs(r4.marad-r4.fel-1)<0.051,"feljutás után a rajt-cél pontosan 1,0-del szorosabb (8. fokozat)",r4);
  ok(r4.potMarad===0&&Math.abs(r4.kies-r4.marad)<1e-9,"maradásnál és kiesésnél nincs pótlék",r4);
  ok(r4.potRegi===0&&Math.abs(r4.regi-r4.marad)<1e-9,"régi szerződésű (lepcsoV nélküli) karrierben nincs pótlék",r4);
  const r5=await p.evaluate(()=>{const x=NF_LEVELS.find(y=>y.nf===8);return nfReszletek(x,6,null,"tarto",null);});
  ok(/Osztálylépcső: 4/.test(r5)&&/feljutási pótlék/.test(r5),"a fokozat-választó kiírja a lépcsőt és a pótlékot",null);

  ok(!errs.length,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
