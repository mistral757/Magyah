/* 🔬 HARDCORE SEED-MÉRŐ — KÉT GÉP ÖSSZEVETÉSE (3.9.298)

   Használat:
     node tools/meres/seed-osszevet.js <házigazda.json> [vendég.json]

   Bemenet: a játék letöltése (Beállítások → 📈 Mérési napló → Letöltés), a
   Firebase-export vagy egyetlen napló — ugyanaz, amit az osszegez.js olvas.
   A seed-mérő a karrier naplójának `seed` mezőjében él (3.9.298-tól).

   EGY FÁJLLAL IS MŰKÖDIK: a kézfogáskor a két gép kicseréli a lezárt szakasz
   részletes naplóját, és a mérő mindkét oldalt eltárolja — tehát a házigazda
   letöltése a vendég húzásait is tartalmazza, kézfogásonként.

   KÉT FÁJLLAL: a közös karriereket a szoba kódja + a világ-seed kivonata
   párosítja (beall.mp), és a két teljes napló szakaszonként, fajtánként
   összevethető — a kézfogáson kívüli (vagy kézfogás nélkül lezárt)
   szakaszok is.

   Kimenet: karrierenként az alap (szigorúság, seed, fokozat, verzió), a
   figyelmeztetések, a kézfogások egyezése, és szakaszonként/fajtánként a
   kivonat-sorok egyezése, az első eltérésekkel. */
"use strict";
const fs=require("fs");
const fajlok=process.argv.slice(2);
if(!fajlok.length){console.error("Használat: node tools/meres/seed-osszevet.js <házigazda.json> [vendég.json]");process.exit(1);}
function naplok(obj){
  const out=[];
  const proba=x=>{if(x&&typeof x==="object"&&x.v&&x.id&&Array.isArray(x.sz)){out.push(x);return true;}return false;};
  const fb=x=>{if(x&&typeof x==="object"&&typeof x.d==="string"){try{proba(JSON.parse(x.d));}catch(e){}return true;}return false;};
  if(proba(obj))return out;
  if(obj&&Array.isArray(obj.karrierek)){obj.karrierek.forEach(proba);return out;}
  const gyoker=(obj&&obj.meres)||obj;
  if(gyoker&&typeof gyoker==="object")
    Object.values(gyoker).forEach(u=>{if(!fb(u)&&u&&typeof u==="object")Object.values(u).forEach(fb);});
  return out;}
const FAJ={"kih:short":"rövid kihívás","kih:long":"hosszú kihívás","kih:cup":"kupa-kihívás",scout:"scout-felderítés",
  felfedez:"felfedezés",terv:"scout-terv",esemeny:"átigazolási esemény",kepesseg:"képesség-keresés",klub:"klub-szemle",
  ifi:"ifi-ablak",tal:"talizmán",skillsor:"skill-sor",stab:"stáb-piac"};
const fn=f=>FAJ[f]||f;
const alapTx=a=>a?`${a.szerep||"?"} · ${a.szigor||"?"} · seed ${a.seed||"?"} · padló ${a.padlo||0} · fok ${a.fok||"—"} · v${a.app||"?"}`:"—";
/* két napló-szelet összevetése fajtánként, sorrendben (a közös előtag) */
function osszevet(a,b,behuz){
  const fajok=[...new Set(a.concat(b).map(x=>x.f))];
  let eq=0,ne=0;
  fajok.forEach(f=>{
    const x=a.filter(z=>z.f===f),y=b.filter(z=>z.f===f),k=Math.min(x.length,y.length);
    let e=0;const elt=[];
    for(let i=0;i<k;i++){if(x[i].e===y[i].e)e++;else if(elt.length<3)elt.push(`#${i+1}: ${x[i].r||x[i].e}  ≠  ${y[i].r||y[i].e}`);}
    eq+=e;ne+=k-e;
    const tobb=x.length!==y.length?` · seed fölött: ${x.length-k?"A +"+(x.length-k):"B +"+(y.length-k)}`:"";
    console.log(`${behuz}${k-e?"⚠️":"✓"} ${fn(f)}: ${e}/${k} egyezik${tobb}`);
    elt.forEach(t=>console.log(`${behuz}     ${t}`));});
  return {eq,ne};}
let mind=[];
const forras={};
fajlok.forEach((f,i)=>{try{naplok(JSON.parse(fs.readFileSync(f,"utf8"))).forEach(r=>{forras[r.id]=i;mind.push(r);});}
  catch(e){console.error(`✗ ${f}: ${e.message}`);}});
const seedes=mind.filter(r=>r.seed&&r.seed.v===1);
console.log(`🔬 ${seedes.length} karrier seed-mérővel (${mind.length} karrierből)\n`);
seedes.forEach(r=>{
  const M=r.seed,b=r.beall||{};
  console.log(`━━ ${r.id} · ${r.csapat||"?"} · szoba ${(b.mp&&b.mp.szoba)||"?"}`);
  console.log(`   alap:      ${alapTx(M.alap)}`);
  if(M.tars)console.log(`   a társé:   ${alapTx(M.tars)}`);
  (M.figy||[]).forEach(f=>console.log(`   ⚠️ ${f.sn}. idény ${f.i}. forduló · ${f.hol}: ${f.k.split("|").join(" · ")}`));
  console.log(`   seedelt húzás: ${(M.log||[]).length} · kézfogás: ${(M.kez||[]).length}`);
  (M.kez||[]).forEach(k=>{
    console.log(`   🛡 ${k.pont}${k.egyedul?" — kézfogás nélkül":` — ${k.egyezik||0}/${(k.egyezik||0)+(k.elter||0)} egyezik${k.fajok&&k.fajok.length?" (eltér: "+k.fajok.map(fn).join(", ")+")":""}`}`);
    if(Array.isArray(k.enLog)&&Array.isArray(k.tarsLog))osszevet(k.enLog,k.tarsLog,"      ");
    else if(k.tarsRegi)console.log("      a társ régi verzió — nincs részletes naplója");});
  console.log("");});
/* két fájl: a közös karrier párosítása és a teljes napló összevetése */
if(fajlok.length>=2){
  const kulcs=r=>{const m=r.beall&&r.beall.mp;return m&&m.szoba&&m.seed?m.szoba+"|"+m.seed:null;};
  const csop={};
  seedes.forEach(r=>{const k=kulcs(r);if(k)(csop[k]=csop[k]||[]).push(r);});
  Object.entries(csop).forEach(([k,rs])=>{
    const A=rs.find(r=>forras[r.id]===0),B=rs.find(r=>forras[r.id]===1);
    if(!A||!B)return;
    console.log(`══ PÁR: ${k.replace("|"," · seed ")} — ${A.csapat||"A"} ↔ ${B.csapat||"B"}`);
    const LA=A.seed.log||[],LB=B.seed.log||[];
    const szk=[...new Set(LA.concat(LB).map(x=>x.sz))];
    let eq=0,ne=0;
    szk.forEach(sz=>{console.log(`   ▸ ${sz}`);
      const o=osszevet(LA.filter(x=>x.sz===sz),LB.filter(x=>x.sz===sz),"     ");eq+=o.eq;ne+=o.ne;});
    console.log(`   összesen: ${eq}/${eq+ne} közös húzás egyezik\n`);});}
