/* 🔄 PANZER: A JELLEM-FORDÍTÁS KÉT VÉGE (3.9.88).

   BEJELENTETT HIBA: „Panzerkampfwagen, fordított jellem maxnál egy ilyen ember
   toposan pozitív kéne legyen az öltözőben. Legkeményebb vérmérséklet, majdnem
   a legdurvább kapcsolati tulajdonság. Valami nem jól van bekötve, ha csak
   5ös... Jól van a skála megcsinálva?"

   AZ OK. A traitFlip MINDEN skálán azt hitte, hogy a nagy érték a jó. Csakhogy
   a két tengely ELLENTÉTES:
     · kapcsolódás — a 0 a rossz vég (szorongó), az 1 a jó,
     · vérmérséklet — az 1 a rossz vég (vandál), a 0 a jó.
   A vandál így a „pozitívból lett negatív" ágra került, arra, amelyik a JÓ FEJ
   embereknek szól, és amelyik a képesség szintjével GYENGÜL. Az eredmény a
   képesség ígéretének pontos fordítottja lett.

   A MÁSODIK HIBA a 0..1-es vágás: a képesség „+10% / +25% / +33%"-ot ígér az
   erősödő ágon, a szélső embereknél viszont a tükör már a skála végén landolt,
   és a vágás pontosan azt nyelte el, amit a képesség elad. A folytonos morál-
   számítás ezért a VÁGATLAN alakot kapja (kapER / verER).

   Amit mér:
     1. a két tengely polaritása külön-külön;
     2. hogy a KEMÉNY ember fokozata a képesség szintjével NŐ (a hiba előtt
        csökkent: 7/10 → 6 → 6 → 5/10);
     3. hogy a JÓ FEJ emberé csökken, majd a 2. szinttől visszafordul — pont
        úgy, ahogy a képesség leírása mondja;
     4. hogy a vágatlan alak tényleg tovább visz a szélső embereknél;
     5. hogy a SÁV-kérdések (öltözői események) is a jó oldalra sorolják a
        vandált — a hiba előtt maxolt fordítás mellett is „forró" volt;
     6. hogy a képesség nélkül és más filozófiában semmi nem változik;
     7. és a skála egésze: a teljes mezőnyön az átlagos fokozat a szinttel
        MONOTON nő. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9027'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9027/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof traitFlip==="function"&&typeof traitFlipRaw==="function"
    &&typeof moraleImpact==="function",null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    careerPool=initCareerPlayerPool({stars:2.5});
    const all=(k,l)=>{S.style=k?{key:k,traits:l?{abs_jellem:l}:{}}:null;S.style2=null;};
    const R=x=>Math.round(x*1e4)/1e4;

    /* ---- 1. A KÉT TENGELY POLARITÁSA ----
       A KÉPESSÉG NÉLKÜL (lv0) a fordítás TISZTA TÜKÖR: a rossz vég pozitívba,
       a jó vég költséggé fordul. A felső szinteken a csökkentés 100% fölé megy,
       és a jó fej ember VISSZAFORDUL pozitívba — ez nem hiba, hanem a képesség
       kimondott ígérete. Ezért mérünk külön a két szinten. */
    all("panzer",0);
    ki.pol0={
      kap_rossz:R(traitFlipRaw(0,false)),   /* szorongó → 1 (jó) */
      kap_jo:R(traitFlipRaw(1,false)),      /* egy igazán jó ember → 0 (költség) */
      ver_rossz:R(traitFlipRaw(1,true)),    /* vandál → 0 (a hatás-oldalon ez a jó) */
      ver_jo:R(traitFlipRaw(0,true))};      /* földi béke → 1 (költség) */
    all("panzer",3);
    ki.pol3={
      kap_rossz:R(traitFlipRaw(0,false)),
      kap_jo:R(traitFlipRaw(1,false)),
      ver_rossz:R(traitFlipRaw(1,true)),
      ver_jo:R(traitFlipRaw(0,true))};

    /* ---- 2-3. A KÉT EMBER LÉTRÁJA ---- */
    const Kemeny={n:"Kemény Kázmér",ovr:80,karI:2,kapI:3,verI:8};  /* a képernyőképé */
    const Jofej ={n:"Jófej Jenő",   ovr:80,karI:2,kapI:8,verI:0};
    const letra=(P)=>[0,1,2,3].map(l=>{all("panzer",l);
      return {lv:l,base:R(moraleTraitBase(P)),fok:moraleImpact(P)+1};});
    ki.kemeny=letra(Kemeny);
    ki.jofej=letra(Jofej);
    all(null,0);ki.kemenyNelkul=moraleImpact(Kemeny)+1;
    all("beton",0);ki.kemenyBeton=moraleImpact(Kemeny)+1;

    /* ---- 4. A VÁGATLAN ALAK ---- */
    ki.vagas=[0,1,2,3].map(l=>{all("panzer",l);
      return {lv:l,
        vagott:R(verE(Kemeny)),        /* a szélén megáll */
        vagatlan:R(verER(Kemeny))};}); /* …ez viszont tovább megy */

    /* ---- 5. A SÁV-KÉRDÉSEK ---- */
    ki.savok=[0,1,2,3].map(l=>{all("panzer",l);
      return {lv:l,higgadt:trVerHiggE(Kemeny),forro:trVerForroE(Kemeny)};});

    /* ---- 6. NINCS SZIVÁRGÁS ---- */
    all(null,0);
    const nyers=[[0,0],[3,8],[8,0],[4,4]].map(([k,v])=>{
      const P={n:"X",ovr:80,karI:3,kapI:k,verI:v};
      return [R(kapE(P)),R(verE(P)),R(kapER(P)),R(verER(P))];});
    all("beton",0);
    const beton=[[0,0],[3,8],[8,0],[4,4]].map(([k,v])=>{
      const P={n:"X",ovr:80,karI:3,kapI:k,verI:v};
      return [R(kapE(P)),R(verE(P)),R(kapER(P)),R(verER(P))];});
    ki.szivargas={nyersEgyezik:JSON.stringify(nyers)===JSON.stringify(beton),
      /* filozófia nélkül a hatás-oldal = a nyers érték */
      azonosANyerssel:nyers.every((r,i)=>{
        const [k,v]=[[0,0],[3,8],[8,0],[4,4]][i];
        return r[0]===R(k/8)&&r[1]===R(v/8)&&r[2]===R(k/8)&&r[3]===R(v/8);})};

    /* ---- 7. A TELJES MEZŐNY ---- */
    const nevek=Object.keys(careerPool);
    ki.mezony=[["nincs",null,0],["panzer0","panzer",0],["panzer1","panzer",1],
               ["panzer2","panzer",2],["panzer3","panzer",3]].map(([nev,k,l])=>{
      all(k,l);
      let sum=0;nevek.forEach(n=>{sum+=moraleImpact(careerPool[n])+1;});
      return {nev,atlag:Math.round(sum/nevek.length*100)/100};});
    ki.N=nevek.length;
    return ki;});

  console.log("=== 1. a két tengely polaritása ===");
  const p0=t.pol0,p3=t.pol3;
  ok(p0.kap_rossz===1&&p0.kap_jo===0,
     "képesség nélkül a kapcsolódás TISZTA TÜKÖR: szorongó→1, igazán jó ember→0",
     [p0.kap_rossz,p0.kap_jo]);
  ok(p0.ver_rossz===0&&p0.ver_jo===1,
     "…és a vérmérséklet ugyanígy: vandál→0 (ez a JÓ oldal), földi béke→1",
     [p0.ver_rossz,p0.ver_jo]);
  ok(p3.kap_rossz>1&&p3.ver_rossz<0,
     "maxon a ROSSZ vég TÚLFUT a skálán — ez a képesség erősítő ága",
     {kap:p3.kap_rossz,ver:p3.ver_rossz});
  ok(p3.kap_jo>0.5&&p3.ver_jo<0.5,
     "maxon a JÓ vég visszafordul pozitívba — ahogy a leírás ígéri",
     {kap:p3.kap_jo,ver:p3.ver_jo});
  ok(Math.abs((1-p3.ver_rossz)-p3.kap_rossz)<1e-9
   &&Math.abs((1-p3.ver_jo)-p3.kap_jo)<1e-9
   &&Math.abs((1-p0.ver_rossz)-p0.kap_rossz)<1e-9,
     "a két tengely UGYANAZT a görbét járja, csak tükörben",
     {kap:[p0.kap_rossz,p3.kap_rossz],ver:[p0.ver_rossz,p3.ver_rossz]});

  console.log("=== 2. a kemény ember (karizma semleges · nehéz eset · vandál) ===");
  console.log("  "+t.kemeny.map(x=>`lv${x.lv}: ${x.fok}/10`).join(" · "));
  ok(t.kemenyNelkul<=3&&t.kemenyBeton<=3,
     "filozófia nélkül és Betonnal lehúzza az öltözőt",
     {nincs:t.kemenyNelkul,beton:t.kemenyBeton});
  ok(t.kemeny[0].fok>=6,"Panzerrel már a képesség nélkül is pozitív",t.kemeny[0].fok);
  ok(t.kemeny.every((x,i)=>i===0||x.base>=t.kemeny[i-1].base),
     "a képesség MINDEN szintje javít rajta (a hiba előtt rontott)",
     t.kemeny.map(x=>x.base));
  ok(t.kemeny[3].fok>t.kemeny[0].fok,"a maxolt képesség tényleg feljebb viszi",
     {lv0:t.kemeny[0].fok,lv3:t.kemeny[3].fok});
  ok(t.kemeny[3].fok>=8,"maxon legalább „az öltöző motorja”",t.kemeny[3].fok);

  console.log("=== 3. a jó fej ember — neki romlania kell, majd visszafordulnia ===");
  console.log("  "+t.jofej.map(x=>`lv${x.lv}: ${x.fok}/10`).join(" · "));
  ok(t.jofej[0].base<0,"a fordítás nélküle is költséggé teszi",t.jofej[0].base);
  ok(t.jofej.every((x,i)=>i===0||x.base>=t.jofej[i-1].base),
     "a csökkentés szintről szintre enyhül",t.jofej.map(x=>x.base));
  ok(t.jofej[3].base>0,"a felső szinten visszafordul pozitívba — ahogy a leírás mondja",
     t.jofej[3].base);
  ok(t.jofej[3].base<t.kemeny[3].base,
     "…de szerényebben, mint a kemény emberé",{jofej:t.jofej[3].base,kemeny:t.kemeny[3].base});

  console.log("=== 4. a vágatlan alak viszi tovább ===");
  ok(t.vagas.every(x=>x.vagott===0),"a vágott érték a skála szélén megáll",
     t.vagas.map(x=>x.vagott));
  ok(t.vagas[0].vagatlan===0&&t.vagas.every((x,i)=>i===0||x.vagatlan<t.vagas[i-1].vagatlan),
     "a vágatlan viszont szintenként tovább megy — ezt ígéri a képesség",
     t.vagas.map(x=>x.vagatlan));

  console.log("=== 5. az öltözői események sávjai ===");
  ok(t.savok.every(x=>x.higgadt&&!x.forro),
     "a vandál MINDEN szinten a higgadt sávba esik (a hiba előtt maxon „forró” volt)",
     t.savok);

  console.log("=== 6. nincs szivárgás ===");
  ok(t.szivargas.nyersEgyezik,"Beton és filozófia nélkül ugyanaz");
  ok(t.szivargas.azonosANyerssel,"…és mindkettő pontosan a NYERS jellemérték");

  console.log("=== 7. a teljes mezőny skálája ===");
  console.log("  "+t.mezony.map(x=>`${x.nev}: ${x.atlag}`).join(" · ")+`  (N=${t.N})`);
  const pz=t.mezony.slice(1);
  ok(pz.every((x,i)=>i===0||x.atlag>pz[i-1].atlag),
     "a Panzer átlagos öltözői fokozata a szinttel MONOTON nő",pz.map(x=>x.atlag));
  ok(t.mezony[0].atlag>3&&t.mezony[0].atlag<8,
     "filozófia nélkül a skála közepén ül — nem tapad a szélére",t.mezony[0].atlag);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,3));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
