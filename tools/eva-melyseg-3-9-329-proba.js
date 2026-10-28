/* 🎞 3.9.329 — PERSPEKTIVIKUS TAKARÁS A MECCS-JELENETEKBEN.

   BEJELENTETT HIBA: „A tikitaka gólnál nem jól vannak beállítva a játékosok
   overlapjei. Össze vissza fedik egymást. Nem perspektíva szerűen"

   Amit mér:
     1. a rendező: a figurák a pillanatnyi talppontjuk szerint (lejjebb =
        elöl) kerülnek sorba, a labda és a villanás továbbra is fölöttük;
     2. a rendezés nem szakítja meg a futó animációkat;
     3. a lejátszóban él: egy valódi tiki-taka jelenet alatt a figurák
        sorrendje mindvégig a mélységet követi, és a jelenet végén a ciklus leáll;
     4. a tiki-taka rombusza szétnyitva: a lövő nem áll egy vonalban a
        középső passzoló mögött;
     5. nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9329;
const {chromium}=require("/opt/node22/lib/node_modules/playwright");
const TYPES={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",
  ".woff2":"font/woff2",".png":"image/png",".ico":"image/x-icon",".webmanifest":"application/manifest+json"};
const srv=http.createServer((req,rp)=>{
  let f=decodeURIComponent(req.url.split("?")[0]); if(f==="/")f="/index.html";
  if(f==="/stylist-masolat.html"&&MASOLAT){rp.setHeader("content-type","text/html; charset=utf-8");rp.end(fs.readFileSync(MASOLAT));return;}
  const abs=path.join(ROOT,f);
  if(!abs.startsWith(ROOT)||!fs.existsSync(abs)||fs.statSync(abs).isDirectory()){rp.statusCode=404;rp.end();return;}
  rp.setHeader("content-type",TYPES[path.extname(abs)]||"application/octet-stream");
  fs.createReadStream(abs).pipe(rp);});
let hiba=0,MASOLAT=null;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d).slice(0,500):""));if(!c)hiba++;};
(async()=>{
  await new Promise(r=>srv.listen(PORT,"127.0.0.1",r));
  const b=await chromium.launch({args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)+" "+(e.stack||"").split("\n").slice(1,4).join("|")));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1200);
  await p.waitForTimeout(800);
  const r=await p.evaluate(async()=>{
    const o={};
    const ev={t:"gol",side:"us",p:"Teszt Elek",min:30,seq:99,skill:"tikitaka",skillN:12};
    const T=EVA_SABLON.skTiki,c=evaKontextus(ev);
    const box=document.createElement("div");box.innerHTML=`<svg viewBox="0 0 120 120" width="240" height="240">${T.svg(c)}</svg>`;document.body.appendChild(box);
    const svg=box.firstChild;const an=[];
    T.mozgas((sel,fr,op)=>{const el=svg.querySelector(sel);if(!el)return;const a=el.animate(fr,op);a.pause();a.currentTime=.5*T.dur;an.push(a);},c);
    const ty=g=>new DOMMatrix(getComputedStyle(g).transform).f;
    const sorrend=()=>[...svg.querySelectorAll("[data-mely]")].map(g=>ty(g));
    o.elotte=sorrend();
    o.mozdult=evaMelysegRendez(svg);
    o.utana=sorrend();
    o.rendezett=o.utana.every((y,i)=>i===0||y>=o.utana[i-1]);
    const kids=[...svg.children],utolsoFig=Math.max(...[...svg.querySelectorAll("[data-mely]")].map(g=>kids.indexOf(g)));
    o.labdaFelul=kids.indexOf(svg.querySelector("#evaLabda"))>utolsoFig&&kids.indexOf(svg.querySelector("#evaVillan"))>utolsoFig;
    o.animFut=an.every(a=>a.playState!=="idle");
    o.masodszor=evaMelysegRendez(svg);
    /* a rombusz: a lövő x-e eltér a középső passzolóétól */
    const kx=id=>new DOMMatrix(getComputedStyle(svg.querySelector(id)).transform).e;
    an.forEach(a=>{a.currentTime=0;});
    o.lovoX=kx("#evaLovo");o.tars2X=kx("#evaTars2");
    box.remove();
    /* 3. a lejátszóban */
    _mev={anim:true,duel:false,lista:[]};_evaFut=null;_evaSor.length=0;
    evaKer(ev);
    const minta=[];let stopVolt=false;
    for(let i=0;i<14;i++){await new Promise(r=>setTimeout(r,220));
      const F=_evaFut;
      if(F&&typeof F.melyStop==="function")stopVolt=true;
      const s=document.querySelector("#evAnim svg");if(!s)continue;
      const ys=[...s.querySelectorAll("[data-mely]")].map(g=>ty(g));
      if(ys.length)minta.push(ys.every((y,j)=>j===0||y>=ys[j-1]-0.5));}
    o.lejatszo={minta:minta.length,mind:minta.every(Boolean),stopVolt};
    return o;});
  ok(r.mozdult>=1&&r.rendezett,"a rendező a pillanatnyi mélység szerint rendez (lejjebb = elöl)",{elotte:r.elotte,utana:r.utana});
  ok(r.labdaFelul,"a labda és a villanás továbbra is a figurák fölött",r.labdaFelul);
  ok(r.animFut&&r.masodszor===0,"a futó animációk megmaradnak; rendezett állapotban nem bolygat",{anim:r.animFut,m:r.masodszor});
  ok(r.lejatszo.minta>=5&&r.lejatszo.mind&&r.lejatszo.stopVolt,"a lejátszóban a jelenet alatt végig a mélységet követi",r.lejatszo);
  ok(Math.abs(r.lovoX-r.tars2X)>=8,"a tiki-taka lövője nem áll egy vonalban a középső passzoló mögött",{lovo:r.lovoX,tars2:r.tars2X});
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,5));
  await b.close();srv.close();
  console.log(hiba?`✗ ${hiba} hiba`:"✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(2);});
