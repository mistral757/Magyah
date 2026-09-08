#!/usr/bin/env node
/* A PLAY GRAFIKAI ELEMEINEK RENDERELÉSE.
   Miért kódból: az áruházi kép a JÁTÉK arculatát viszi (ugyanaz a betű,
   ugyanaz a két szín, ugyanaz az ikon). Egy külső eszközben rajzolt kép az
   első arculatváltásnál elavulna, és senki nem venné észre.
   Használat: node tools/grafika/render.js */
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const {spawn}=require("child_process");
const path=require("path"),fs=require("fs");
const ROOT=path.join(__dirname,"..","..");
const KI=path.join(ROOT,"icons","play");
const LAPOK=[
  {f:"tools/grafika/feature-graphic.html",ki:"feature-1024x500.png",w:1024,h:500,
   mit:"funkciógrafika (Play: kötelező)"}];
(async()=>{
  fs.mkdirSync(KI,{recursive:true});
  const srv=spawn("python3",["-m","http.server","8948"],{cwd:ROOT,stdio:"ignore"});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  for(const L of LAPOK){
    /* deviceScaleFactor 1: a Play PONTOS pixelméretet vár, nem retinát. */
    const p=await b.newPage({viewport:{width:L.w,height:L.h},deviceScaleFactor:1});
    const hibak=[];p.on("pageerror",e=>hibak.push(e.message));
    await p.goto(`http://localhost:8948/${L.f}`,{waitUntil:"networkidle"});
    /* A BETŰKRE VÁRUNK. A `font-display:block` miatt a szöveg addig
       láthatatlan, amíg a woff2 meg nem jön — egy korai kattintás üres képet
       adna. Ez a leggyakoribb hiba az ilyen renderelésnél. */
    await p.evaluate(()=>document.fonts.ready);
    await p.waitForTimeout(320);
    const cel=path.join(KI,L.ki);
    await p.screenshot({path:cel,type:"png"});
    const m=fs.statSync(cel);
    console.log(`✓ ${L.ki}  ${L.w}×${L.h}  ${(m.size/1024).toFixed(0)} kB  — ${L.mit}`
      +(hibak.length?`  ⚠ ${hibak[0]}`:""));
    await p.close();}
  await b.close();srv.kill();
})();
