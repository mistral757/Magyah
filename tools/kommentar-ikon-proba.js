/* 💬 A KÖZVETÍTÉS TÍPUSJELEI — minden sablon besorolva (3.9.57)

   KIMONDOTT KÉRÉS: „A sima kommentári feed szövegeknek legyenek kis ikonjai
   amik jelzik, milyen típusú esemény. jó hogy szürke."

   MIÉRT PONT ÍGY MÉRÜNK. Az ikon nem a hívási helyeken születik, hanem EGY
   besoroló függvényben (evLineIcon), a kész sor szövegéből. Ennek az az ára,
   hogy egy ÚJ kommentár-sablon némán kimaradhat — ezért ez a próba a
   FORRÁSBÓL szedi össze az összes `pickTxt([...])` sablont, és mindegyiket
   átfuttatja az élő besorolón. Ha valaki holnap ír egy új mondatot, és az
   egyik mintára sem illik, ez a sor pirosodik ki, nem a felhasználó veszi
   észre hetekkel később.

   Használat: node tools/kommentar-ikon-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
const fs=require('fs');

/* Egy zárójel-párosított blokk kiolvasása a forrásból. */
function blokk(s,i,nyit,zar){
  let d=0,j=i;
  for(;j<s.length;j++){
    if(s[j]===nyit)d++;
    else if(s[j]===zar){d--;if(d===0)break;}}
  return s.slice(i,j+1);}
/* A ${...} helyére egy jellegzetes név kerül — pontosan úgy, ahogy a futó
   játékban egy játékosnév állna ott. */
function tisztit(lit){
  return lit.replace(/\$\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,"Kovács").trim();}
/* A FORRÁS KÉT HELYRŐL AD SABLONT, és mindkettőre szükség van:
     1. a pickTxt([...]) tömbök — ez a közvetítés zöme (helyzetek, védések),
     2. a PERC-BÉLYEGGEL induló, `m ev` osztályú addLine-hívások — ezek az
        egyedi pillanatok (összecsapás, gólvonalról mentés).
   Az elsőt egyedül mérve az „összecsapás" kategória üresen maradt, és a
   próba ezt hibaként jelezte — jogosan: nem a kategória volt fölösleges,
   hanem a merítés volt hiányos. */
function sablonok(){
  const s=fs.readFileSync('/home/user/Magyah/index.html','utf8');
  const ki=[];
  const lit=/`((?:[^`\\]|\\.)*)`/g;
  let m;const re=/pickTxt\(\[/g;
  while((m=re.exec(s))){
    const arr=blokk(s,m.index+m[0].length-1,'[',']');
    let k;lit.lastIndex=0;
    while((k=lit.exec(arr))){const t=tisztit(k[1]);if(t.length>8)ki.push(t);}}
  const PERC=/addLine\(\s*`\$\{(?:t|gminTxt\([^)]*\)|minTxt|sbMinTxt\([^)]*\)|emin|e\.min)\}/;
  const al=/addLine\(/g;
  while((m=al.exec(s))){
    const call=blokk(s,m.index+m[0].length-1,'(',')');
    const teljes="addLine"+call;
    if(!PERC.test(teljes))continue;
    if(!/,\s*"m ev"/.test(teljes))continue;
    if(/pickTxt/.test(teljes))continue;        /* azt már fentebb bejártuk */
    let k;lit.lastIndex=0;
    while((k=lit.exec(teljes))){
      const t=tisztit(k[1]).replace(/^Kovács\s*/,"");
      if(t.length>8)ki.push(t);}}
  /* AMI SAJÁT HANGULATJELLEL INDUL, az sosem ér el a besorolóig (az evDecorate
     kilép rajta) — a tiki-taka sorai például 🌀-val kezdődnek. Itt is ki kell
     szűrni őket, különben a próba olyasmit kérne számon, ami nem is fut le. */
  return [...new Set(ki)].filter(t=>!/^\p{Extended_Pictographic}/u.test(t));}

(async()=>{
  const srv=spawn('python3',['-m','http.server','8901'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[],oldal=[];
  const ok=(t,jo,x)=>{if(!jo)hiba.push(t+(x!==undefined?" · "+JSON.stringify(x):""));
    console.log((jo?"  ✓ ":"  ✗ ")+t+(x!==undefined?" · "+JSON.stringify(x):""));};

  const p=await b.newPage();
  p.on('pageerror',e=>oldal.push(e.message));
  p.on('console',m=>{if(m.type()==='error')oldal.push(m.text());});
  await p.goto('http://localhost:8901/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(2200);

  const SAB=sablonok();
  console.log(`=== ${SAB.length} kommentár-sablon a forrásból ===`);

  const r=await p.evaluate(SAB=>{
    const o={};
    o.besorolas=SAB.map(t=>({t,ic:evLineIcon(t)}));
    o.nincs=o.besorolas.filter(x=>!x.ic).map(x=>x.t);
    /* A DÍSZÍTÉS TELJES ÚTJA: perc-bélyeg + sablon → mit kap a sor? */
    o.dekor=SAB.slice(0,6).map(t=>evDecorate(`55'  ${t}`,"m ev"));
    /* AMI NEM KAPHAT JELET */
    o.nemKap={
      perc_nelkul:evDecorate("A mezőny minden fordulóval erősödik","m ev"),
      mar_van_jele:evDecorate("62'  🔥 A PADRÓL! Kovács beugrik és betalál","m ev"),
      nem_ev:evDecorate("55'  Kovács lövése centikkel kerüli el a hosszú sarkot","m life"),
      felido:evDecorate("FÉLIDŐ 0:0","m mt")};
    /* KÉTSZER LEFUTTATVA sem tesz ki két jelet */
    const egy=evDecorate("55'  Kovács lövése centikkel kerüli el a hosszú sarkot","m ev");
    o.ketszer=evDecorate(egy,"m ev")===egy;
    /* A HANGSÚLYOS SOROK érintetlenek maradnak */
    o.hangsulyos={gol:evDecorate("55'  GÓL! Kovács","m goal"),
                  lap:evDecorate("55'  🟨 Sárga lap. Kovács","m rc")};
    /* IKONKÉSZLET */
    o.ikonok=EV_ICONS.map(e=>e.ic+" "+e.n);
    o.egyediIkon=new Set(EV_ICONS.map(e=>e.ic)).size===EV_ICONS.length;
    /* Melyik minta hány sablont fog be? */
    const db={};EV_ICONS.forEach(e=>db[e.n]=0);
    SAB.forEach(t=>{for(const e of EV_ICONS){if(e.re.test(t)){db[e.n]++;break;}}});
    o.eloszlas=db;
    return o;},SAB);

  console.log("\n=== minden sablon kap típusjelet ===");
  ok(`mind a ${SAB.length} sablon besorolva (egy sem esik ki)`,
     r.nincs.length===0,r.nincs.length?r.nincs:undefined);
  ok("minden kategóriának SAJÁT ikonja van",r.egyediIkon===true,r.ikonok);
  ok("egyetlen kategória sem maradt üresen",
     Object.values(r.eloszlas).every(v=>v>0),r.eloszlas);

  console.log("\n=== a besorolás mintája ===");
  r.besorolas.slice(0,10).forEach(x=>console.log(`  ${x.ic}  ${x.t.slice(0,72)}`));

  console.log("\n=== amihez NEM nyúlunk ===");
  ok("perc-bélyeg nélküli sor érintetlen",
     r.nemKap.perc_nelkul==="A mezőny minden fordulóval erősödik");
  ok("aminek már van hangulatjele, nem kap másodikat",
     r.nemKap.mar_van_jele.indexOf("evIc")<0,r.nemKap.mar_van_jele);
  ok("a nem-ev osztályú sorok érintetlenek (élet, gól, lap)",
     r.nemKap.nem_ev.indexOf("evIc")<0&&r.hangsulyos.gol.indexOf("evIc")<0
     &&r.hangsulyos.lap.indexOf("evIc")<0,r.hangsulyos);
  ok("a félidő-sor érintetlen",r.nemKap.felido==="FÉLIDŐ 0:0");
  ok("kétszer lefuttatva sem kerül ki két jel",r.ketszer===true);

  console.log("\n=== egy kész sor ===");
  r.dekor.slice(0,4).forEach(x=>console.log("  "+x));

  console.log("\nOLDALHIBÁK: "+(oldal.length?oldal.slice(0,3).join(" | "):"nincs"));
  if(oldal.length)hiba.push("oldalhiba: "+oldal[0]);
  console.log(hiba.length?`\n✗ ${hiba.length} hiba`:"\n✅ minden rendben");
  await b.close(); srv.kill();
  process.exit(hiba.length?1:0);
})();
