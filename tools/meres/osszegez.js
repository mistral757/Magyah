/* 📈 MÉRÉSI NAPLÓ ÖSSZEGZŐ (3.9.206)

   Használat:
     node tools/meres/osszegez.js <fájl.json> [további fájlok…] [--csv kimenet.csv]

   Bemenet — bármelyik:
     · a játék letöltése (Beállítások → 📈 Mérési napló → Letöltés):
         {forras:"magyah-meres", karrierek:[…]}
     · a Firebase-konzol exportja (Realtime Database → ⋮ → Export JSON), akár
       a teljes adatbázis, akár csak a `meres` ág:
         {meres:{<uid>:{<karrier>:{v,at,app,d:"<napló JSON-szövegként>"}}}}
     · egyetlen napló-objektum (v, id, beall, keret0, sz).

   Kimenet: karrierenként egy összefoglaló blokk (beállítások, kezdő keret,
   idényenként erő, helyezés, pénz, érkezők forrás szerint), és --csv esetén
   egy idényenként egy soros CSV (táblázatkezelőbe). */
"use strict";
const fs=require("fs");
const args=process.argv.slice(2);
const csvI=args.indexOf("--csv");
const csvOut=csvI>=0?args[csvI+1]:null;
const fajlok=args.filter((a,i)=>a!=="--csv"&&!(csvI>=0&&i===csvI+1));
if(!fajlok.length){console.error("Használat: node tools/meres/osszegez.js <fájl.json> [--csv kimenet.csv]");process.exit(1);}
/* minden bemeneti alakból a napló-objektumok listája */
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
const atl=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;
const fmt=v=>v==null?"—":(typeof v==="number"?(Math.abs(v)>=1e6?(v/1e6).toFixed(1)+"M":String(Math.round(v*10)/10)):String(v));
const ossz=o=>Object.values(o||{}).reduce((a,b)=>a+(b||0),0);
let mind=[];
fajlok.forEach(f=>{try{mind=mind.concat(naplok(JSON.parse(fs.readFileSync(f,"utf8"))));}catch(e){console.error(`✗ ${f}: ${e.message}`);}});
/* azonos karrier több forrásból: a több idényt tartalmazó marad */
const byId={};mind.forEach(r=>{if(!byId[r.id]||(r.sz||[]).length>(byId[r.id].sz||[]).length)byId[r.id]=r;});
mind=Object.values(byId);
console.log(`📈 ${mind.length} karrier\n`);
const sorok=[];
mind.forEach(r=>{
  const b=r.beall||{},k0=r.keret0||[];
  const xi=k0.filter(p=>p.hol==="xi");
  const mentes=r.forras==="mentes";
  const P=b.piramis||{};
  console.log(`━━ ${r.id} · ${r.csapat||"?"} · ${b.app||r.app0} · ${r.t0?new Date(r.t0).toISOString().slice(0,10):"?"}${mentes?" · MENTÉSBŐL (hiányos, lásd mentesbol.js)":""}`);
  console.log(`   mód: ${b.mod} · indulás: ${b.indulas} · tempó: ${fmt(b.tempo)} (×${fmt(b.tempoMult)}) · alap: ${b.ratingAlap} · magyah: ${b.magyah?"BE":"ki"} · valósághű scout: ${b.scoutValosag?"BE":"ki"}`);
  console.log(`   mezőny: ${fmt(b.mezony)}${b.piramis?` · osztály: D${P.kezdoOszt}${P.most!=null?` (most D${P.most})`:""} · sebesség: ${fmt(P.sebesseg)} · nehézség: ${fmt(P.nehezseg)} · rés: ${fmt(P.rés)}`:""} · szint-rés: ${fmt(b.szint)} · scout: ${b.scout?b.scout.csillag+"★":"—"} · ügynökség: ${fmt(b.ugynokseg)}★${mentes?" (mostani)":""} · büdzsé: ${fmt(b.budzse)}`);
  console.log(`   kezdő keret: ${k0.length} fő · XI átlag ${fmt(atl(xi.map(p=>p.ovr)))} (POT ${fmt(atl(xi.map(p=>p.pot)))}) · keret átlag ${fmt(atl(k0.map(p=>p.ovr)))} (POT ${fmt(atl(k0.map(p=>p.pot)))}) · életkor ${fmt(atl(k0.map(p=>p.age)))}`);
  (r.sz||[]).forEach(z=>{
    const kz=z.kezd||{},vg=z.veg||{},lg=z.liga||{},p=z.penz||{};
    const erk={};(z.erk||[]).forEach(e=>{const f=String(e.forras||"?").split(":")[0];(erk[f]=erk[f]||[]).push(e);});
    const erkSz=Object.entries(erk).map(([f,l])=>`${f} ${l.length} (${fmt(atl(l.map(e=>e.ovr)))})`).join(", ")||"—";
    const oszt=kz.oszt!=null?kz.oszt:vg.oszt;
    const ero=vg.xi!=null?`XI ${fmt(vg.xi)} vs mezőny ${fmt(vg.mezony)} (rés ${fmt(vg.xi-(vg.mezony||0))})${kz.ts!=null?` · rajt ${fmt(kz.ts)}`:""}`
      :`erő ${fmt(kz.ts)}→${fmt(vg.ts)} · ⚡ ${fmt(kz.ms)}→${fmt(vg.ms)} · mezőny ${fmt(kz.mezony)}→${fmt(vg.mezony)}`;
    console.log(`   ${z.sz}. idény: ${ero}${oszt!=null?` · D${oszt}`:""}`
      +` · hely ${fmt(lg.hely)} (${fmt(lg.pont)} p, ${fmt(lg.gf)}:${fmt(lg.ga)})${z.kupa?` · kupa ${z.kupa.k} ${z.kupa.ered||z.kupa.kiesett||""}`:""}`);
    console.log(`      pénz: nyitó ${fmt(p.nyit)} · be ${fmt(ossz(p.be))} · ki ${fmt(ossz(p.ki))} · záró ${fmt(p.zar)} · igazolás ${fmt((p.ki||{}).buy)} · bér ${fmt((p.ki||{}).wage)} · eladás ${fmt((p.be||{}).sale)}`);
    console.log(`      érkezők: ${z.erk?erkSz:"— (a mentés nem tudja)"} · távozók: ${z.tav?z.tav.length:"—"}${z.eladas?` · eladás: ${z.eladas.db} fő, ${fmt(z.eladas.osszeg)}`:""}${z.folyamatban?` · FOLYAMATBAN (${z.folyamatban.fordulo}. forduló)`:""}`);
    sorok.push({karrier:r.id,forras:r.forras||"meres",csapat:r.csapat,app:b.app||r.app0,mod:b.mod,tempo:b.tempo,alap:b.ratingAlap,magyah:b.magyah?1:0,
      sebesseg:P.sebesseg||"",nehezseg:P.nehezseg||"",res:P.rés,
      valosScout:b.scoutValosag?1:0,kezdoOszt:b.piramis?b.piramis.kezdoOszt:"",scout:b.scout?b.scout.csillag:"",ugynokseg:b.ugynokseg,
      idény:z.sz,ts0:kz.ts,ts1:vg.ts,ms0:kz.ms,ms1:vg.ms,xi1:vg.xi!=null?vg.xi:(lg.atlag!=null?lg.atlag:""),mezony0:kz.mezony,mezony1:vg.mezony!=null?vg.mezony:lg.mezony,
      oszt:oszt!=null?oszt:"",
      hely:lg.hely,pont:lg.pont,gf:lg.gf,ga:lg.ga,kupa:z.kupa?z.kupa.k:"",kupaEred:z.kupa?(z.kupa.ered||z.kupa.kiesett||""):"",
      nyito:p.nyit,be:ossz(p.be),ki:ossz(p.ki),zaro:p.zar,szezonkeret:(p.be||{}).season||0,igazolas:(p.ki||{}).buy||0,ber:(p.ki||{}).wage||0,eladas:(p.be||{}).sale||0,
      eladasSztar:(p.be||{}).saleStar||0,eladasDb:z.eladas?z.eladas.db:"",
      erk:(z.erk||[]).length,erkVasarlas:(erk.vasarlas||[]).length,erkScout:(erk.scout||[]).length,erkIfi:(erk.ifi||[]).length,
      erkMegfigyelt:(erk.megfigyelt||[]).length,tav:(z.tav||[]).length});});
  console.log("");});
if(csvOut&&sorok.length){
  const fej=Object.keys(sorok[0]);
  const esc=v=>{const s=v==null?"":String(v);return /[",;\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};
  fs.writeFileSync(csvOut,[fej.join(",")].concat(sorok.map(r=>fej.map(k=>esc(r[k])).join(","))).join("\n")+"\n");
  console.log(`✓ CSV: ${csvOut} (${sorok.length} sor)`);}
