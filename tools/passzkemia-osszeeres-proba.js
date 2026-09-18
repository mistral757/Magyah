/* 🌀 A PASSZKÉMIA KÖZÖS FEJLŐDÉSE — AZ ÖSSZEÉRÉS JAVÍTÁSA (3.9.95).

   BEJELENTETT HIBA: „Szerintem bugos a passzkémiánál az együtt fejlődés.
   Sokszor van hogy ilyen fura állásokon elakad. Nem is éri el a szintjét,
   főleg nem megy vele együtt onnan." — mellé egy játékoslap, amin

        Passz  112.375

   állt, miközben a többi attribútum kerek egész volt.

   A LÁNC, AMI EBBŐL KIBOMLOTT. A specializációs sáv két vége a trainScale-lel
   skálázódik, az pedig tört: egy 89-es Ratingű középvédő Passz-plafonja
   89 − 10 + 30×1,1125 = 112,375. Amint az attribútum nekifeszült, a clamp
   RÁÍRTA a törtet magára az attribútumra. A passzkémia összeérését viszont
   EGYENLŐSÉG dönti el — egy tört érték pedig sosem egyenlő a társa egészével,
   tehát a kötés örökre a felzárkózás szakaszában ragadt, és a közös,
   gyorsított fejlődés, vagyis a kötés FELE HASZNA, el sem indult.

   A második, független hiba ugyanitt: a gyengébb fél saját plafonja a társáé
   ALATT is lehet (egy középvédő sávja szűkebb, mint egy irányítóé). Ilyenkor
   felért, ameddig felérhetett — az egyenlőség mégis elérhetetlen maradt.

   A harmadik: az egyenlőséget a legelső eltérés visszabontotta, tehát még a
   SIKERES összeérés sem tartott ki egy meccsnél tovább.

   Amit mér:
     1. az attribútum-sáv két vége egész, és a clamp sem ír törtet;
     2. a régi mentésben ülő tört értéket a betöltés visszahozza a sávba;
     3. a plafonra ért gyengébb fél összeértnek számít — és ezzel megindul a
        közös fejlődés;
     4. az összeérés VÉGLEGES: egy későbbi eltérés nem bontja vissza;
     5. a rendes (egyenlőséges) összeérés változatlanul működik;
     6. …és a plafont MOST SEM lépjük át: a passzkémia nem ír felül határokat. */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9045'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const h=[];p.on('pageerror',e=>h.push(e.stack||e.message));
  p.on('console',m=>{if(m.type()==='error')h.push(m.text());});
  await p.goto('http://localhost:9045/index.html',{waitUntil:'networkidle'});
  await p.waitForFunction(()=>typeof passChemTick==="function"
    &&typeof attrBandOf==="function"&&typeof passChemPassCeil==="function",
    null,{timeout:30000});

  const t=await p.evaluate(()=>{
    const ki={};
    gameMode="career";
    const mk=(n,pos,sr,passz)=>{
      const e={n,pos:[pos],startRating:sr,age:23};
      initPlayerAttrs(e);e.attrs.passz=passz;return e;};

    /* ---- 1. A SÁV KÉT VÉGE EGÉSZ, ÉS A CLAMP SEM ÍR TÖRTET ---- */
    /* Pontosan a bejelentett eset: 89-es KV. A sáv teteje a régi kódban
       112,375 volt — most 112, és az attribútum sem lesz tört. */
    {const e=mk("Pista","KV",89,100);
     const sav=attrBandOf(e,"passz");
     for(let i=0;i<40;i++)bumpAttr(e,"passz",1);
     /* lefelé is: a sáv alja ugyanígy tört volt */
     const l=mk("Lefele","KV",89,60);
     for(let i=0;i<40;i++)bumpAttr(l,"passz",-1);
     ki.sav={hi:sav.hi,lo:sav.lo,
       hiEgesz:Number.isInteger(sav.hi),loEgesz:Number.isInteger(sav.lo),
       ts:trainScale(e),
       fent:e.attrs.passz,fentEgesz:Number.isInteger(e.attrs.passz),
       lent:l.attrs.passz,lentEgesz:Number.isInteger(l.attrs.passz)};}

    /* ---- 2. A RÉGI MENTÉSBEN ÜLŐ TÖRT ÉRTÉK MIGRÁCIÓJA ---- */
    {const e=mk("Regi","KV",89,100);
     e.attrs.passz=112.375;                /* pontosan a bejelentett szám */
     e.attrs.ved=93.5;
     const _cp=careerPool;
     careerPool={Regi:e};
     ensureAllAttrs();
     careerPool=_cp;
     ki.migracio={passz:e.attrs.passz,ved:e.attrs.ved,
       mindEgesz:Number.isInteger(e.attrs.passz)&&Number.isInteger(e.attrs.ved),
       savBan:e.attrs.passz<=attrBandOf(e,"passz").hi};}

    /* ---- KÖZÖS ELŐKÉSZÍTÉS A KÖTÉS-ÁGAKHOZ ---- */
    passChemLevel=()=>3;
    const fut=(pool,lepes,jelolo)=>{
      const _ms=msEntry;
      msEntry=n=>pool[n]||null;
      S.passChem={};
      const nevek=Object.keys(pool);
      addPassChemPair(nevek[0],nevek[1],PASS_CHEM_NEED);
      const kulcs=Object.keys(S.passChem)[0];
      const halo=new Set(nevek);
      const nyom=[];
      for(let i=0;i<lepes;i++){
        if(jelolo)jelolo(i,pool);
        passChemTick(halo);
        const pr=S.passChem[kulcs];
        nyom.push({a:pool[nevek[0]].attrs.passz,b:pool[nevek[1]].attrs.passz,
          ripe:!!passChemRipe(pr),
          boostA:passChemPassBoost(nevek[0],halo),
          boostB:passChemPassBoost(nevek[1],halo)});}
      /* a passChemPassCeil-t MÉG a stub alatt kérdezzük le, hogy a próba azt
         is igazolja: a kötés ugyanazt a sávot látja, mint a bumpAttr */
      nyom.plafonFv={};
      nevek.forEach(n=>{nyom.plafonFv[n]=passChemPassCeil(n);});
      msEntry=_ms;
      return nyom;};

    /* ---- 3. A PLAFONRA ÉRT GYENGÉBB FÉL ÖSSZEÉRTNEK SZÁMÍT ---- */
    /* Az irányító 125-ös passzal; a középvédő plafonja 112 — soha nem érheti
       el, a régi kódban tehát ÖRÖKRE felzárkózásban maradt. */
    {const A=mk("Iranyito","KKP",110,125);
     const B=mk("Kozepvedo","KV",89,80);
     const nyom=fut({Iranyito:A,Kozepvedo:B},30);
     const v=nyom[nyom.length-1];
     /* A plafont KÖZVETLENÜL a sávból kérdezzük: a passChemPassCeil a
        msEntry-n keresztül néz, azt viszont a `fut` már visszaállította. */
     ki.plafonos={veg:v,
       plafon:attrBandOf(B,"passz").hi,
       ceilFv:nyom.plafonFv.Kozepvedo,
       ripeMikor:nyom.findIndex(x=>x.ripe),
       boostMindketto:v.boostA===1&&v.boostB===1};}

    /* ---- 4. AZ ÖSSZEÉRÉS VÉGLEGES ---- */
    /* Egyenlő passzal indulnak, majd a 10. meccsen a vezetőt KÉZZEL
       megemeljük: a régi kódban ettől a pár visszaesett felzárkózásba, és a
       közös fejlődés elnémult. */
    {const A=mk("Vezeto2","KKP",100,100);
     const B=mk("Tars2","KKP",100,100);
     const nyom=fut({Vezeto2:A,Tars2:B},20,(i,pool)=>{if(i===10)pool.Vezeto2.attrs.passz+=6;});
     ki.vegleges={elso:nyom[0].ripe,
       elteresUtan:nyom[11].ripe,
       boostMegvan:nyom[11].boostA===1&&nyom[11].boostB===1,
       mindvegig:nyom.every(x=>x.ripe)};}

    /* ---- 5. A RENDES, EGYENLŐSÉGES ÖSSZEÉRÉS ---- */
    /* Két azonos profilú középpályás, bőven plafon alatt: a felzárkózásnak
       tényleg egyenlőséggel kell zárulnia, nem plafonnal. */
    {const A=mk("Egy","KKP",100,120);
     const B=mk("Ketto","KKP",100,104);
     const nyom=fut({Egy:A,Ketto:B},20);
     const v=nyom[nyom.length-1];
     ki.egyenlo={a:v.a,b:v.b,egyenlo:v.a===v.b,ripe:v.ripe,
       plafonA:attrBandOf(A,"passz").hi,
       ripeMikor:nyom.findIndex(x=>x.ripe),
       plafonAlatt:v.a<attrBandOf(A,"passz").hi};}

    /* ---- 6. A PLAFONT MOST SEM LÉPJÜK ÁT ---- */
    {const A=mk("Csucs","KKP",110,125);
     const B=mk("Also","KV",89,80);
     const nyom=fut({Csucs:A,Also:B},60);
     ki.plafonTart={b:nyom[nyom.length-1].b,plafon:attrBandOf(B,"passz").hi};}
    return ki;});

  console.log("=== 1. az attribútum-sáv két vége EGÉSZ ===");
  ok(t.sav.hiEgesz&&t.sav.loEgesz,"a sáv teteje és alja egész szám",t.sav);
  ok(t.sav.ts!==1&&!Number.isInteger(t.sav.ts),
     "…pedig a trainScale tört — épp ez szülte a hibát",t.sav.ts);
  ok(t.sav.hi===112,"a bejelentett eseté pontosan 112 (a régi 112,375 helyett)",t.sav.hi);
  ok(t.sav.fentEgesz&&t.sav.fent===t.sav.hi,
     "a plafonnak feszülő attribútum EGÉSZ, és pont a plafonon áll",t.sav);
  ok(t.sav.lentEgesz&&t.sav.lent===t.sav.lo,
     "a padlóra érő attribútum is egész, és pont a padlón áll",t.sav);

  console.log("=== 2. a régi mentésben ülő tört migrációja ===");
  ok(t.migracio.mindEgesz,"a betöltés minden tört attribútumot visszakerekít",t.migracio);
  ok(t.migracio.passz===112&&t.migracio.savBan,
     "…a sávon belülre, nem fölé",t.migracio);

  console.log("=== 3. a plafonra ért gyengébb fél ÖSSZEÉRTNEK számít ===");
  ok(t.plafonos.veg.b===t.plafonos.plafon,
     "a középvédő felért a SAJÁT plafonjára",t.plafonos);
  ok(t.plafonos.ceilFv===t.plafonos.plafon,
     "…és a kötés UGYANAZT a plafont látja, mint a bumpAttr",t.plafonos);
  ok(t.plafonos.veg.ripe===true,
     "…és ezzel a felzárkózás lezárult (a régi kódban sosem zárult le)",t.plafonos.veg);
  ok(t.plafonos.boostMindketto,
     "a közös, gyorsított fejlődés MINDKETTŐJÜKNEK jár",t.plafonos.veg);
  ok(t.plafonos.ripeMikor>0,
     "…de nem a semmiből: a felzárkózás tényleg lefutott előtte",t.plafonos.ripeMikor);

  console.log("=== 4. az összeérés VÉGLEGES ===");
  ok(t.vegleges.elso===true,"az egyenlő pár rögtön összeértnek számít");
  ok(t.vegleges.elteresUtan===true,
     "egy későbbi eltérés NEM bontja vissza a párt felzárkózásba",t.vegleges);
  ok(t.vegleges.boostMegvan,"…és a közös fejlődés sem némul el tőle",t.vegleges);
  ok(t.vegleges.mindvegig===true,"végig összeért marad",t.vegleges);

  console.log("=== 5. a rendes, EGYENLŐSÉGES összeérés változatlan ===");
  ok(t.egyenlo.egyenlo===true,"a két passz tényleg egy szintre került",t.egyenlo);
  ok(t.egyenlo.plafonAlatt===true,
     "…méghozzá a plafon ALATT — tehát nem a 3. ág zárta le",t.egyenlo);
  ok(t.egyenlo.ripe===true&&t.egyenlo.ripeMikor>0,
     "és összeértnek számít",t.egyenlo);

  console.log("=== 6. a plafont most sem lépjük át ===");
  ok(t.plafonTart.b===t.plafonTart.plafon,
     "a gyengébb fél a plafonján áll meg, nem fölötte",t.plafonTart);

  console.log("=== hibák a konzolon ===");
  ok(h.length===0,"nincs futásidejű hiba",h.slice(0,2));

  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);})();
