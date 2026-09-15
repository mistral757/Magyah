/* ⏳ A VÁRAKOZÓ KÉPERNYŐK RENDBETÉTELE (3.9.75)

   NÉGY BEJELENTETT PANASZ, mind ugyanarról a képernyőről:
     1. „Tempós tempó. Gagyi." — a fokozat neve önmagát magyarázta;
     2. a lágy kiút felirata fél mondatban SZEMÉLYT VÁLTOTT;
     3. a kezdőlap-gomb nem mondta ki, hogy a keret mentve van;
     4. „Sok az apró betűs rész. Tegyük be mindet egy infó gomb mögé."

   A PRÓBA AZT IS MÉRI, AMIT A NÉGY PONT NEM MOND KI: hogy az elv MINDEN
   várakozó képernyőre érvényes-e (nem maradt-e valahol apró betűs rész), és
   hogy az új doboz színei TÉMAFÜGGETLENEK — ez a réteg mindig sötét, egy
   var(--ink) világos témában majdnem feketére váltana rajta.

   Használat: node tools/varakozo-kepernyo-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const fs=require('fs');
/* Az ÖNÁLLÓ „tempó" szó (a „Tempós" fokozatnév nem az). */
const TEMPO_SZO=/tempó(?![a-záéíóöőúüű])/i;

(async()=>{
  const srv=spawn('python3',['-m','http.server','8975'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  /* ── 0. FORRÁS-SZINTŰ ÁLLÍTÁS: nem maradt apró betűs rész EGYETLEN
         várakozó képernyőn sem. Ezt a DOM-ból nem lehet megmérni (mind a
         huszonhat hívás más folyamat mélyén ül), a forrásból viszont igen. ── */
  const src=fs.readFileSync('/home/user/Magyah/index.html','utf8').split("\n");
  let aproMaradt=[],hivas=0;
  src.forEach((l,i)=>{
    if(l.indexOf("h2hWaitShow(")<0||l.indexOf("function h2hWaitShow")>=0)return;
    hivas++;
    let blk=src.slice(i,i+12).join("\n");
    const m=/\);/.exec(blk);
    if(m)blk=blk.slice(0,m.index+2);
    if(blk.indexOf("<small")>=0)aproMaradt.push(i+1);});
  console.log("=== az elv MINDEN várakozó képernyőn ===");
  ok(`mind a ${hivas} várakozó-hívás apró betűs rész nélkül`,
     aproMaradt.length===0&&hivas>=20,{hivas,maradt:aproMaradt});

  const p=await b.newPage({viewport:{width:390,height:900}});
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8975/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2400);

  const r=await p.evaluate(()=>{
    const o={};
    MP.role="host";MP.activeRoom="ABCD";mpNet.mode="fb";gameMode="career";
    window.h2hRoomActive=()=>true;
    const me=mpMyId();

    /* ── 1. A SEBESSÉG ── */
    o.sebesseg={
      nevek:Object.keys(MP_TEMPO).map(k=>MP_TEMPO[k].n),
      cimkek:Object.keys(MP_TEMPO).map(k=>mpTempoLabel(MP_TEMPO[k])),
      /* a KULCSOK változatlanok: azokat a futó szobák tárolják */
      kulcsok:Object.keys(MP_TEMPO).join(",")};
    /* A VÁLASZTÓ a lobbi MEGLÉVŐ dobozába rajzol (a $ az elsőt adja vissza) —
       egy második, azonos azonosítójú elemet hiába tennénk a lapra. */
    mpTempoRender();
    o.valaszto=($("mpTempoBox")||{}).textContent||"";

    /* ── 2. A LÁGY KIÚT FELIRATA ── */
    o.kiut=(()=>{
      const cim=`A társad nem elérhető — játszd le a társad ${h2hKeyLabel("s2r15")}jában rögzített keretével`;
      return {szoveg:cim,
        /* nincs benne „játszom le" — az volt a személyváltás */
        nincsSzemelyvaltas:!/játszom le/.test(cim),
        label:h2hKeyLabel("s2r15")};})();

    /* ── 3. A KEZDŐLAP-GOMB ── */
    h2hWaitShow("30. FORDULÓ","Várakozás…",true,false);
    o.gombKesz=($("h2hWaitHomeBtn")||{}).textContent||"";
    h2hWaitShow("30. FORDULÓ","Várakozás…",false,false);
    o.gombUres=($("h2hWaitHomeBtn")||{}).textContent||"";

    /* ── 4. AZ INFÓ-GOMB ── */
    const wrap=()=>$("h2hWaitInfoWrap"),body=()=>$("h2hWaitInfo"),btn=()=>$("h2hWaitInfoBtn");
    /* (a) infó nélkül nincs gomb — egy üres „Részletek" volna a legnagyobb zaj */
    h2hWaitShow("30. FORDULÓ","Várakozás…",true,false,null,"");
    o.nincsInfo={gombRejtve:wrap().classList.contains("hide")};
    /* (b) infóval van gomb, de a törzs ALAPBÓL CSUKVA */
    h2hWaitShow("30. FORDULÓ","Várakozás…",true,false,null,"Ez az apró betűs rész.");
    o.vanInfo={gombLatszik:!wrap().classList.contains("hide"),
      torzsCsukva:body().classList.contains("hide"),
      felirat:btn().textContent};
    /* (c) koppintásra kinyílik */
    btn().click();
    o.nyitva={torzs:!body().classList.contains("hide"),
      felirat:btn().textContent,
      szoveg:body().textContent};
    /* (d) …és a következő újrarajzoláskor NYITVA MARAD (a képernyők 2,5
           másodpercenként újrarajzolódnak — az orra előtt becsukódó doboz
           rosszabb volna, mint a régi apró betű) */
    h2hWaitShow("30. FORDULÓ","Várakozás…",true,false,null,"Ez az apró betűs rész.");
    o.ujrarajzolas={torzs:!body().classList.contains("hide")};
    /* (e) a körönként újrarajzoló hívók megőrzik a tartalmat */
    o.megorzes=h2hWaitInfoNow();
    /* (f) infó nélküli képernyőre lépve a nyitva-állapot is elhal */
    h2hWaitShow("TABELLA","Várakozás…",true,false,null,"");
    o.elhal={gombRejtve:wrap().classList.contains("hide")};

    /* ── 5. A SZÍNEK TÉMAFÜGGETLENEK ── */
    const meres=()=>{
      h2hWaitShow("30. FORDULÓ","Várakozás…",true,false,null,
        `<b style="color:#f3f2f2">Te: házigazda</b> · a te rekeszed: <b>kész</b>`);
      const ib=body(),bb=ib.querySelector("b");
      return {doboz:getComputedStyle(ib).color,
        kiemelt:getComputedStyle(bb).color,
        hatter:getComputedStyle($("h2hWait")).backgroundColor};};
    o.sotet=meres();
    document.documentElement.setAttribute("data-theme","paper");   /* VILÁGOS téma */
    o.vilagos=meres();
    document.documentElement.removeAttribute("data-theme");
    /* a rétegnek NINCS téma-változós színe a stílusában */
    o.stilus=($("h2hWaitInfo").getAttribute("style")||"");
    return o;});

  console.log("\n=== 1. a tempóból sebesség lett ===");
  ok("a három fokozat: Laza · Tempós · Villám",
     r.sebesseg.nevek.join(" · ")==="Laza · Tempós · Villám",r.sebesseg.nevek);
  ok("és a felületen <fokozat> + sebesség — a szó egyszer szerepel, nem kétszer",
     r.sebesseg.cimkek.every(x=>/ sebesség$/.test(x))
     &&r.sebesseg.cimkek.indexOf("Tempós sebesség")>=0
     /* A „Tempós" FOKOZATNÉV maga is tartalmazza a szót — a hibás alak az
        ÖNÁLLÓ „tempó" volt mögötte („Tempós tempó"). A szó után ezért nem
        állhat magyar kisbetű: úgy már egy másik szó része. */
     &&!r.sebesseg.cimkek.some(x=>TEMPO_SZO.test(x)),r.sebesseg.cimkek);
  ok("a KULCSOK változatlanok — azokat a futó szobák tárolják",
     r.sebesseg.kulcsok==="nyugodt,tempos,villam",r.sebesseg.kulcsok);
  ok("a választó is az új alakot mutatja",
     /Laza sebesség/.test(r.valaszto)&&/Tempós sebesség/.test(r.valaszto)
     &&/Villám sebesség/.test(r.valaszto)&&!TEMPO_SZO.test(r.valaszto),
     {valaszto:r.valaszto});

  console.log("\n=== 2. a lágy kiút egy nézőpontból beszél ===");
  ok("a felirat felszólít, nem a program nevében beszél",
     r.kiut.nincsSzemelyvaltas===true&&/játszd le a társad/.test(r.kiut.szoveg),r.kiut);
  ok("és pontosan megnevezi, MELYIK keret az",
     r.kiut.label==="2. szezon 15. forduló"
     &&/2\. szezon 15\. fordulójában rögzített keretével/.test(r.kiut.szoveg),r.kiut);

  console.log("\n=== 3. a kezdőlap-gomb kimondja, mi marad meg ===");
  ok("felküldött keretnél kiírja: a szoba megmarad, a kereted MENTVE",
     /a szoba megmarad, a kereted MENTVE$/.test(r.gombKesz),{g:r.gombKesz});
  ok("keret nélkül viszont nem ígér mentést",
     /a szoba megmarad$/.test(r.gombUres)&&!/MENTVE/.test(r.gombUres),{g:r.gombUres});

  console.log("\n=== 4. az apró betűs rész az infó mögé került ===");
  ok("infó nélkül nincs gomb sem",r.nincsInfo.gombRejtve===true,r.nincsInfo);
  ok("infóval van gomb, de a törzs ALAPBÓL csukva",
     r.vanInfo.gombLatszik===true&&r.vanInfo.torzsCsukva===true
     &&/Részletek/.test(r.vanInfo.felirat),r.vanInfo);
  ok("koppintásra kinyílik, és a felirat is átvált",
     r.nyitva.torzs===true&&/elrejtése/.test(r.nyitva.felirat)
     &&/apró betűs/.test(r.nyitva.szoveg),r.nyitva);
  ok("és a következő újrarajzoláskor NYITVA marad",r.ujrarajzolas.torzs===true,r.ujrarajzolas);
  ok("a körönként újrarajzoló hívók megőrzik a tartalmat",
     /apró betűs/.test(r.megorzes),{m:r.megorzes});
  ok("infó nélküli képernyőre lépve a gomb eltűnik",r.elhal.gombRejtve===true,r.elhal);

  console.log("\n=== 5. a színek témafüggetlenek (a réteg MINDIG sötét) ===");
  ok("a doboz szövege világos marad VILÁGOS témában is",
     r.sotet.doboz===r.vilagos.doboz&&r.vilagos.doboz==="rgb(185, 180, 171)",
     {sotet:r.sotet.doboz,vilagos:r.vilagos.doboz});
  ok("a kiemelt rész is — és a háttér mindkét témában sötét",
     r.sotet.kiemelt===r.vilagos.kiemelt
     &&r.vilagos.hatter==="rgba(20, 18, 15, 0.95)",
     {s:r.sotet.kiemelt,v:r.vilagos.kiemelt,h:r.vilagos.hatter});
  ok("a doboz stílusában nincs egyetlen téma-változó sem",
     r.stilus.indexOf("var(--")<0,{stilus:r.stilus.replace(/\s+/g," ").slice(0,90)});

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,4).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  await b.close();srv.kill();
  if(hiba.length){console.log("\n❌ "+hiba.length+" hiba");process.exit(1);}
  console.log("\n✅ minden rendben");
})();
