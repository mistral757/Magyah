/* 📈 MENTÉSBŐL MÉRÉSI NAPLÓ (a 3.9.206-os mérő mellé)

   A 3.9.206-os mérő csak az ÚJ karriereket látja. A korábbi karrierek
   mentés-exportjaiban (Beállítások → Mentések → Exportálás: magyah_….json)
   viszont sok minden benne van — ez a szkript azt fordítja le a mérő
   naplóformátumára, hogy az összegző (osszegez.js) ugyanúgy kezelje.

   Használat:
     node tools/meres/mentesbol.js <mentés.json> [további…] [--ki kimenet.json] [--nevtelen]

     --nevtelen   a csapatnév, a világ-seed és a szobakód NEM kerül a
                  kimenetbe (a karrier azonosítója a seed kivonata lesz).
                  Nyilvános helyre (pl. a repóba) csak így tegyél adatot.

   AMI A MENTÉSBŐL HITELESEN KIJÖN (idényenként):
     · helyezés, pont, győzelem/döntetlen/vereség, gólok (seasonHistory);
     · a mezőny ereje és a kezdő XI átlaga az idény VÉGÉN;
     · a nemzetközi kupa útja;
     · a főkönyv: nyitó egyenleg, bevétel és kiadás kategóriánként, záró
       egyenleg (S.ledger — 3.9.8x óta minden mentésben);
     · az eladások száma és bevétele (S.transferLog.sells);
     · a futó idény kezdő csapatereje (S.seasonStartStrength).

   AMI CSAK BECSLÉS:
     · AZ OSZTÁLY idényenként. A mentés csak a kezdő és a mostani osztályt
       tudja; a köztes utat a helyezésekből fejtjük vissza (1. = feljutás,
       2–3. = osztályozó, utolsó = kiesés), a szintugrás (pyrLeap) horgonyával.
       Ha több út is kijön, csak az az idény kap osztályt, amelyben minden út
       egyezik — a többi null marad. (`osztBecsult: true`)
     · A KEZDŐ KERET. A mentés tudja, kik voltak (S.foundingSquad), és a
       világ generálásakori értéküket (startRating), a draft-kori értéket
       (draftRating, ha van) és a POT-ot. Az életkor a mostaniból visszaszámolt.
       Az attribútumok és az OVR a MOSTANIAK — azokat nem írjuk be.

   AMI NINCS BENNE: meccsenkénti sor, a büdzsé idősora, az érkezők forrása
   (csak az igazolásra költött összeg), a scout felfedezései.

   A BEÁLLÍTÁSOK közül a scout és az ügynökség a MOSTANI állapot (a karrier
   közben fejlődhetett) — ezért `beall.vegallapot: ["scout","ugynokseg"]`. */
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const args=process.argv.slice(2);
const kiI=args.indexOf("--ki");
const kiFajl=kiI>=0?args[kiI+1]:null;
const nevtelen=args.includes("--nevtelen");
const fajlok=args.filter((a,i)=>!a.startsWith("--")&&!(kiI>=0&&i===kiI+1));
if(!fajlok.length){console.error("Használat: node tools/meres/mentesbol.js <mentés.json> [--ki kimenet.json] [--nevtelen]");process.exit(1);}

/* a főkönyv kategóriáinak oldala — magából az index.html-ből, hogy egy új
   kategória se essen rossz oldalra */
const OLDAL={};
try{
  const html=fs.readFileSync(path.join(__dirname,"..","..","index.html"),"utf8");
  const blokk=html.slice(html.indexOf("const LEDGER_CATS={"),html.indexOf("const LEDGER_CATS={")+6000);
  for(const m of blokk.matchAll(/(\w+):\s*\{n:"[^"]*"[^}]*?side:\s*(-?1)/g))OLDAL[m[1]]=+m[2];
}catch(e){}
const oldal=k=>OLDAL[k]!=null?OLDAL[k]:(/^(wage|buy|staff|boost|penalty|retain|poslearn|loan|invest|fee|leap)/.test(k)?-1:1);

const PYR_TEAMS=16,PYR_UP=1,PYR_PO_N=2,PYR_DOWN=1;
const r1=v=>(typeof v==="number"&&isFinite(v))?Math.round(v*10)/10:null;
const kivonat=s=>crypto.createHash("sha256").update(String(s)).digest("hex").slice(0,12);

/* a pool tömörített sora → objektum (lásd packCareerPool az index.html-ben) */
const POOL_NUM=["pot","peak","age","startRating","estimatedPOT","karI","kapI","verI","formPoints","sebBase","_attrAnchor","draftRating"];
function poolBol(cp){
  if(!cp)return {};
  if(!cp.pk||!Array.isArray(cp.rows))return cp;
  const out={};
  cp.rows.forEach(row=>{const e={n:row[0]};POOL_NUM.forEach((k,i)=>{const v=(row[1]||[])[i];if(v!=null)e[k]=v;});
    if(row[2])Object.assign(e,row[2]);out[row[0]]=e;});
  return out;}

/* AZ OSZTÁLY-ÚT. Minden idény kimenetele: fel (−1), marad (0), le (+1);
   a bizonytalan helyezéseknél mindkettő lehetséges. A kényszerek: a kezdő
   osztály, a szintugrás (az L. idény a `to` osztályban indul, és előtte
   `from`-ban kellett lennie), és a mostani osztály. */
function osztalyUt(start,veg,helyek,utolsoKesz,leap){
  const n=helyek.length;   /* lezárt idények */
  const lehet=helyek.map(h=>{
    if(h===1)return [-1];
    if(h>=PYR_UP+1&&h<=PYR_UP+PYR_PO_N)return [-1,0];
    if(h===PYR_TEAMS)return [1];
    if(h>PYR_TEAMS-PYR_DOWN-PYR_PO_N&&h<PYR_TEAMS)return [0,1];
    return [0];});
  /* a mostani osztály: lezárt utolsó idénynél AZÉ az idényé (a forduló még
     nem futott le), egyébként a futó idényé */
  const utak=[];
  const lep=(i,div,ut)=>{
    if(ut.length>64)return;
    if(leap&&leap.done!==false&&leap.season===i+1){if(div!==leap.from)return;div=leap.to;}
    ut=ut.concat([div]);
    if(i===n){utak.push(ut);return;}
    lehet[i].forEach(d=>lep(i+1,Math.min(6,div+d),ut));};
  lep(0,start,[]);
  /* ut[k] = a (k+1). idény osztálya; ut[n] = a következő (futó) idényé */
  const jo=utak.filter(u=>(utolsoKesz?u[n-1]:u[n])===veg);
  if(!jo.length)return {ut:helyek.map((_,i)=>i===0?start:null).concat([utolsoKesz?null:veg]),egyertelmu:false,ellentmondas:true};
  const ut=[];
  for(let k=0;k<=n;k++){const v=new Set(jo.map(u=>u[k]));ut.push(v.size===1?[...v][0]:null);}
  return {ut,egyertelmu:jo.length===1,ellentmondas:false};}

function atalakit(fajl){
  const d=JSON.parse(fs.readFileSync(fajl,"utf8"));
  let m=d.mentes||d;if(typeof m==="string")m=JSON.parse(m);
  const S=m.S||{};
  if(m.gameMode!=="career")return null;
  const P=S.pyr||null,cim=d.cimke||{};
  const pool=poolBol(m.careerPool);
  const hist=S.seasonHistory||[];
  const sn=S.seasonNumber||hist.length||1;
  const utolsoKesz=hist.length>=sn;           /* az idény lefutott, a forduló még nem */
  const seed=m.worldSeed||"";
  const id=(nevtelen?"m_":"mentes_")+kivonat(seed+"|"+(m.teamName||""));
  /* osztály-út */
  let ut=null,utInfo=null;
  if(P&&P.on){utInfo=osztalyUt(P.startDiv,P.my,hist.map(h=>h.rank),utolsoKesz,S.pyrLeap);ut=utInfo.ut;}
  /* főkönyv */
  const L=(S.ledger&&S.ledger.rows)||{};
  const penzOf=s=>{const row=L[s];if(!row)return null;
    const be={},ki={};Object.entries(row.cats||{}).forEach(([k,v])=>{(oldal(k)<0?ki:be)[k]=v;});
    const kov=L[s+1];
    const zar=kov?kov.open:(s===sn?Math.round(S.transferBudget||0):null);
    return {nyit:row.open,be,ki,zar};};
  const eladas={};((S.transferLog&&S.transferLog.sells)||[]).forEach(x=>{const k=x.season||0;
    (eladas[k]=eladas[k]||{db:0,osszeg:0,nevek:[]});eladas[k].db++;eladas[k].osszeg+=x.credit||0;eladas[k].nevek.push(x.n);});
  /* kezdő keret */
  const roster=[].concat((m.slots||[]).filter(s=>s&&s.player).map(s=>s.player),
    Object.values(m.BENCH||{}).filter(Boolean),(m.extraRoster||[]).filter(Boolean));
  const rByN={};roster.forEach(p=>{rByN[p.n]=p;});
  const keret0=(S.foundingSquad||[]).map(n=>{const e=pool[n]||{},p=rByN[n]||{};
    return {n:nevtelen?null:n,hol:"alap",pos:(p.pos||e.pos||[]).slice(),
      age:e.age!=null?e.age-(sn-1):null,start:r1(e.startRating),draft:r1(e.draftRating),pot:e.pot!=null?e.pot:null,
      estPot:e.estimatedPOT!=null?e.estimatedPOT:null,ovr:r1(e.draftRating!=null?e.draftRating:e.startRating),
      mostOvr:r1(p.ovr),mostBent:!!rByN[n],ref:e.refOvr!=null?e.refOvr:null};});
  const sz=[];
  for(let s=1;s<=sn;s++){
    const h=hist.find(x=>x.season===s)||null;
    const oszt=ut?ut[s-1]:null;
    const z={sz:s,kezd:{oszt:oszt!=null?oszt:null,mezony:null,ts:null,ms:null},veg:null,m:null,mOssz:null,budzseIdo:null,
      erk:null,tav:null,penz:penzOf(s),liga:null,kupa:null,keretKezd:null,eladas:eladas[s]||{db:0,osszeg:0}};
    if(nevtelen)delete z.eladas.nevek;
    if(h){
      z.liga={hely:h.rank,pont:h.pts,gy:h.w,d:h.d,v:h.l,gf:h.gf,ga:h.ga,mezony:r1(h.oppRating),atlag:r1(h.teamAvg),csapatok:PYR_TEAMS,
        verdikt:h.verdict||null,nehezseg:h.diffLabel||null};
      z.mOssz={n:(h.w||0)+(h.d||0)+(h.l||0),gy:h.w,d:h.d,v:h.l,gf:h.gf,ga:h.ga};
      z.veg={xi:r1(h.teamAvg),mezony:r1(h.oppRating),oszt:oszt};
      if(h.euro&&h.euro.comp)z.kupa={k:h.euro.comp,ered:h.euro.reachedLabel||h.euro.reached||null,nyert:!!h.euro.won};}
    if(s===sn&&!h){z.kezd.ts=r1(S.seasonStartStrength);z.kezd.mezony=r1(m.oppTargetRating);
      z.folyamatban={fordulo:S.idx||0,gy:S.W||0,d:S.D||0,v:S.L||0,gf:S.GF||0,ga:S.GA||0};}
    sz.push(z);}
  const ag=m.agency||{};
  return {v:1,forras:"mentes",id,t0:Date.parse(d.ts)||null,app0:d.app||null,csapat:nevtelen?null:(m.teamName||cim.team||null),
    beall:{app:d.app||null,mod:P&&P.on?"hagyomanyos":"dinamikus",indulas:m.careerStart||null,ratingAlap:m.careerRatingBasis||null,
      magyah:!!S.careerMagyah,vb:!!S.careerWc,felallas:m.form||null,mezony:r1(m.oppTargetRating),alapErtek:r1(m.careerBaseRating),
      piramis:P?{oszt:P.startDiv,kezdoOszt:P.startDiv,most:P.my,sebesseg:P.aiSpeed||null,rés:P.gapWantMp!=null?P.gapWantMp:(P.gapWant!=null?P.gapWant:null),
        nehezseg:P.diffId||null,fok:P.diffT!=null?P.diffT:null,eltolas:P.worldShift!=null?P.worldShift:null,klubNyers:P.clubRaw||null,
        klubEff:P.clubEff||null,gap0:P.gap0!=null?P.gap0:null,verzio:P.sv||1,felett:P.above||0}:null,
      osztUt:utInfo?{egyertelmu:utInfo.egyertelmu,ellentmondas:utInfo.ellentmondas}:null,
      szintugras:S.pyrLeap?{idény:S.pyrLeap.season,honnan:S.pyrLeap.from,hova:S.pyrLeap.to,tet:S.pyrLeap.stake,vissza:S.pyrLeap.back||null}:null,
      scout:m.scout?{nev:nevtelen?null:m.scout.name,csillag:m.scout.stars}:null,
      ugynokseg:ag.stars!=null?ag.stars:null,ugynoksegUgyletek:{osszes:ag.deals||0,vett:ag.buys||0,eladott:ag.sells||0,piaci:ag.marketSells||0},
      budzse:L[1]?Math.round((L[1].cats&&L[1].cats.season)||0):null,
      kozos:!!(cim.room||m.mp),szoba:nevtelen?null:(cim.room||null),vegallapot:["scout","ugynokseg"]},
    keret0,keret0Idx:null,keret0Forras:"foundingSquad",sz};}

const karrierek=[];
fajlok.forEach(f=>{try{const r=atalakit(f);if(r)karrierek.push(r);else console.error(`– ${f}: nem karrier, kihagyva`);}
  catch(e){console.error(`✗ ${f}: ${e.message}`);}});
const ki=JSON.stringify({forras:"magyah-meres",v:1,app:"mentesbol",at:new Date().toISOString(),nevtelen,karrierek},null,1);
if(kiFajl){fs.writeFileSync(kiFajl,ki+"\n");console.log(`✓ ${karrierek.length} karrier → ${kiFajl}`);}
else process.stdout.write(ki+"\n");
karrierek.forEach(r=>{const u=r.sz.map(z=>z.kezd.oszt==null?"?":z.kezd.oszt).join("→");
  console.error(`  ${r.id} · ${r.app0} · ${r.sz.length} idény · osztály-út: ${u}${r.beall.osztUt&&r.beall.osztUt.ellentmondas?" (ellentmondás — csak a kezdő és a mostani ismert)":""}`);});
