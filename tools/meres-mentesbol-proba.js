/* 📈 A MENTÉSBŐL KÉSZÜLŐ MÉRÉSI NAPLÓ — tools/meres/mentesbol.js + osszegez.js

   Böngésző nélkül, egy SZINTETIKUS mentés-exporttal (a valódi mentések nem
   kerülnek a repóba). Amit mér:
     1. AZ OSZTÁLY-ÚT: a helyezésekből és a szintugrásból visszafejtve; az
        osztályozós idény akkor kap osztályt, ha csak egy út jön ki; ha a
        kényszerek ellentmondanak, csak a kezdő ismert;
     2. A FŐKÖNYV: bevétel és kiadás a kategória oldala szerint (az
        index.html LEDGER_CATS-ából), a záró egyenleg a következő nyitója;
     3. A KEZDŐ KERET: a foundingSquad, a draft-kori érték, a visszaszámolt kor;
     4. A FUTÓ IDÉNY: „folyamatban", a rajt csapatereje;
     5. NÉVTELENÍTÉS: --nevtelen mellett se játékos-, se csapat-, se scoutnév,
        se seed, se szobakód;
     6. AZ ÖSSZEGZŐ lefut rajta, CSV-vel és anélkül is (az első fájl nem esik ki). */
"use strict";
const fs=require("fs"),path=require("path"),os=require("os"),cp=require("child_process");
const TOOLS=__dirname;
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"mentesbol-"));
const sor=(n,start,draft,pot,age)=>[n,[pot,start,age,start,pot,1,1,1,null,50,null,draft,60,10,60,60,50]];
function mentes({nev,startDiv,my,helyek,leap,sn,idx,room}){
  const hist=helyek.map((h,i)=>({season:i+1,oppRating:80+i*5,diffLabel:"x",verdict:h===1?"Bajnok":"Középmezőny",rank:h,pts:90-h*3,
    w:20,d:5,l:5,gf:60,ga:30,teamAvg:85+i*6,excAvg:40,captain:"Titkos Kapitány",captainEffect:1}));
  const rows={};for(let s=1;s<=sn;s++)rows[s]={season:s,open:s===1?0:1000*(s-1),cats:{season:500*s,sale:300,wage:200,buy:100*s,boost:50}};
  return {magyah:"magyah-mentes",f:1,app:"3.9.150",epites:"csalad",ts:"2026-09-20T10:00:00.000Z",kulcs:"30-0-save-v1",
    cimke:{team:nev,mode:"career",phase:"hub",season:sn,idx,room:room||null,slot:1},
    mentes:{v:1,gameMode:"career",scout:{name:"Titkos Scout",stars:4},agency:{v:1,stars:6,deals:9,buys:2,sells:5,marketSells:2},
      careerPool:{pk:1,rows:[sor("Titkos Egy",80.4,82,3000,25),sor("Titkos Kettő",78,79.5,2500,30)]},
      careerStart:"draft",careerRatingBasis:"season",form:"433",oppTargetRating:120,careerBaseRating:80,worldSeed:"TITKOSSEED",
      slots:[{player:{n:"Titkos Egy",pos:["CS"],ovr:110}}],BENCH:{},extraRoster:[],drafted:["Titkos Egy","Titkos Kettő"],teamName:nev,
      S:{seasonNumber:sn,idx,W:3,D:1,L:0,GF:9,GA:2,seasonHistory:hist,seasonStartStrength:131.4,transferBudget:7777,
        ledger:{v:1,rows},transferLog:{sells:[{n:"Titkos Eladott",credit:300,season:1}]},foundingSquad:["Titkos Egy","Titkos Kettő"],
        careerMagyah:true,pyrLeap:leap||null,
        pyr:{on:true,my,startDiv,aiSpeed:"vegtelen",gapWant:2,diffId:"eselyes",worldShift:-3,clubRaw:84,clubEff:80,gap0:2,sv:2}}}};}
const irj=(n,o)=>{const f=path.join(dir,n);fs.writeFileSync(f,JSON.stringify(o));return f;};
/* A: D6-ból, 1-2-6-1 helyezés, az 5. idényre szintugrás 3→2, most a futó 5. idényben D2 */
const fA=irj("a.json",mentes({nev:"Titkos Csapat",startDiv:6,my:2,helyek:[1,2,6,1],leap:{season:5,from:3,to:2,done:true,stake:100},sn:5,idx:12}));
/* B: lezárt utolsó idény (idx 30, a forduló még nem futott): 1-1-1, most D3 = a 3. idény osztálya */
const fB=irj("b.json",mentes({nev:"Másik Titok",startDiv:5,my:3,helyek:[1,1,1],sn:3,idx:30}));
/* C: ellentmondás (közös szoba): D6-ból 5-2-2, most D2 — ez a szabályokkal nem jön ki */
const fC=irj("c.json",mentes({nev:"Szobás Titok",startDiv:6,my:2,helyek:[5,2,2],sn:3,idx:30,room:"ABC123"}));
const ki=path.join(dir,"ki.json"),kiN=path.join(dir,"kin.json");
const fut=(a)=>{try{return cp.execFileSync("node",a,{encoding:"utf8",stdio:["ignore","pipe","pipe"]});}catch(e){return "HIBA "+e.message+(e.stdout||"");}};
fut([path.join(TOOLS,"meres","mentesbol.js"),fA,fB,fC,"--ki",ki]);
fut([path.join(TOOLS,"meres","mentesbol.js"),fA,fB,fC,"--nevtelen","--ki",kiN]);
const J=JSON.parse(fs.readFileSync(ki,"utf8")),[A,B,C]=J.karrierek;

console.log("\n— 1. az osztály-út —");
const ut=r=>r.sz.map(z=>z.kezd.oszt);
ok(J.karrierek.length===3&&J.forras==="magyah-meres","három karrier, a mérő formátumában",J.karrierek.length);
ok(JSON.stringify(ut(A))==="[6,5,4,4,2]","A: 6→5 (cím) →4 (osztályozó, a szintugrás horgonya miatt egyértelmű) →4 →2 (ugrás)",ut(A));
ok(JSON.stringify(ut(B))==="[5,4,3]","B: lezárt utolsó idény — a mostani osztály AZÉ az idényé",ut(B));
ok(C.sz[0].kezd.oszt===6&&C.sz.slice(1).every(z=>z.kezd.oszt===null)&&C.beall.osztUt.ellentmondas,"C: ellentmondásnál csak a kezdő osztály ismert, és jelölve van",{ut:ut(C),u:C.beall.osztUt});

console.log("\n— 2. a főkönyv —");
const p1=A.sz[0].penz;
ok(p1.be.season===500&&p1.be.sale===300&&p1.ki.wage===200&&p1.ki.buy===100&&p1.ki.boost===50,"bevétel és kiadás a kategória oldala szerint",p1);
ok(A.sz[0].penz.zar===A.sz[1].penz.nyit&&A.sz[4].penz.zar===7777,"a záró egyenleg a következő nyitója; a futó idényé a mostani büdzsé",[A.sz[0].penz.zar,A.sz[4].penz.zar]);
ok(A.sz[0].eladas.db===1&&A.sz[0].eladas.osszeg===300,"az eladások idényenként",A.sz[0].eladas);

console.log("\n— 3. a kezdő keret —");
const k=A.keret0;
ok(k.length===2&&k[0].start===80.4&&k[0].draft===82&&k[0].ovr===82&&k[0].pot===3000&&k[0].age===21&&k[0].mostOvr===110&&k[0].mostBent&&!k[1].mostBent,
   "a foundingSquad: draft-kori érték, POT, a visszaszámolt kor (25 − 4), a mostani OVR külön",k);
ok(k.every(p=>!p.attrs),"a mostani attribútumok NEM kerülnek a kezdő keretbe");

console.log("\n— 4. a futó idény és a beállítások —");
const z5=A.sz[4];
ok(z5.folyamatban&&z5.folyamatban.fordulo===12&&z5.kezd.ts===131.4&&!z5.liga,"a futó idény: folyamatban, a rajt csapatereje",z5);
ok(A.sz[3].liga.hely===1&&A.sz[3].veg.xi===103&&A.sz[3].veg.mezony===95,"a lezárt idény: helyezés, XI-átlag és mezőny a végén",A.sz[3].veg);
ok(A.beall.piramis.sebesseg==="vegtelen"&&A.beall.piramis.nehezseg==="eselyes"&&A.beall.szintugras.hova===2&&A.beall.magyah&&A.beall.vegallapot.includes("scout"),
   "a beállítások: sebesség, nehézség, szintugrás; a scout és az ügynökség mostaniként jelölve",A.beall);

console.log("\n— 5. névtelenítés —");
const N=fs.readFileSync(kiN,"utf8");
ok(!/Titkos|Titok|TITKOSSEED|ABC123|Másik/.test(N),"--nevtelen: nincs játékos-, csapat-, scoutnév, seed vagy szobakód");
ok(JSON.parse(N).karrierek.every(r=>/^m_[0-9a-f]{12}$/.test(r.id)),"az azonosító a seed kivonata");
ok(/Titkos Csapat/.test(fs.readFileSync(ki,"utf8")),"névtelenítés nélkül a csapatnév megmarad (helyi használatra)");

console.log("\n— 6. az összegző —");
const o1=fut([path.join(TOOLS,"meres","osszegez.js"),kiN]);
ok(/📈 3 karrier/.test(o1)&&/MENTÉSBŐL/.test(o1)&&/D6/.test(o1),"--csv nélkül is lefut, az első fájlt is beolvassa",o1.split("\n").slice(0,2));
const csv=path.join(dir,"ki.csv");
const o2=fut([path.join(TOOLS,"meres","osszegez.js"),kiN,"--csv",csv]);
const sorok=fs.existsSync(csv)?fs.readFileSync(csv,"utf8").trim().split("\n"):[];
ok(sorok.length===1+5+3+3&&/forras/.test(sorok[0])&&/xi1/.test(sorok[0]),"CSV: idényenként egy sor, a forrás és a XI-átlag oszlopa",{n:sorok.length,fej:sorok[0]});
ok(/(^|,)mentes,/.test(sorok[1]),"a mentésből jött sorok jelölve",sorok[1].slice(0,80));
/* a D0 nem eshet ki (a 0 hamis érték) */
const z0=JSON.parse(fs.readFileSync(kiN,"utf8"));z0.karrierek[0].sz[1].kezd.oszt=0;
fs.writeFileSync(path.join(dir,"d0.json"),JSON.stringify(z0));
const o3=fut([path.join(TOOLS,"meres","osszegez.js"),path.join(dir,"d0.json")]);
ok(/2\. idény: .*· D0/.test(o3),"a D0 osztály is kiíródik",o3.split("\n").find(s=>/2\. idény/.test(s)));

fs.rmSync(dir,{recursive:true,force:true});
console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
process.exit(hiba?1:0);
