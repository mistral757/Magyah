/* 🎨 1.0.9.8.00 — PIXELES GÓLÖRÖM-FUTÁS A GÓL-JELENETBEN (Blender-render).
   KÉRÉS: „1. Pixeles 2. Maradnak az arányok 3. Gól jelenet"
   Amit mér:
     1. az atlasz betöltődik (320×80, két sor, 8 kocka);
     2. a színezés: a csík a gólszerző mezének fő színét, a nadrág a
        másodszínét viseli; ugyanaz a mez a gyorsítótárból jön;
     3. a jelenetben ott az ünnep-réteg — sima gólnál, fejesnél, tizenegyesnél,
        szabadrúgásnál és kapott gólnál is;
     4. a mozgás: a labda hálóba érése előtt a figura a képen KÍVÜL vár,
        utána balról jobbra keresztülfut a kép alján, és közben a 8 kocka
        lépcsőzetesen vált;
     5. képkockák a szemrevételezéshez (KEPEK=mappa); nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9348;
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
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await (await b.newContext({viewport:{width:430,height:900}})).newPage();
  const errs=[];p.on("pageerror",e=>errs.push(String(e)));
  p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|404/.test(m.text()))errs.push(m.text());});
  await p.addInitScript(()=>{window.HANG_TESZT=true;});
  await p.goto(`http://127.0.0.1:${PORT}/index.html`,{waitUntil:"load"});
  await p.waitForTimeout(1500);
  await p.waitForFunction(()=>typeof _sprFutAdat!=="undefined"&&!!_sprFutAdat,null,{timeout:10000}).catch(()=>{});
  const r=await p.evaluate(async()=>{
    const o={};
    o.atlasz=_sprFutAdat?{w:_sprFutAdat.width,h:_sprFutAdat.height,feny:_sprFutFeny}:null;
    /* 2. a színezés */
    const kit={c1:"#d01010",c2:"#1030d0",ink:"#ffffff",pat:"solid"};
    const url=sprFutLap(kit,"#e3b38e","#3a2a20");
    o.cache=sprFutLap(kit,"#e3b38e","#3a2a20")===url;
    const im=new Image();await new Promise(r=>{im.onload=r;im.src=url;});
    const cv=document.createElement("canvas");cv.width=im.width;cv.height=im.height;const x=cv.getContext("2d");x.drawImage(im,0,0);
    const D=x.getImageData(0,0,im.width,im.height).data;
    let piros=0,kek=0,ossz=0;
    for(let i=0;i<D.length;i+=4){if(!D[i+3])continue;ossz++;
      if(D[i]>D[i+1]*2.2&&D[i]>D[i+2]*2.2&&D[i]>90)piros++;
      if(D[i+2]>D[i]*2.2&&D[i+2]>D[i+1]*1.6&&D[i+2]>90)kek++;}
    o.szin={w:im.width,h:im.height,ossz,piros,kek};
    /* 3–4. a jelenet */
    const minta=(ev,idok)=>{
      const T=EVA_SABLON.gol,c=evaKontextus(ev);
      const box=document.createElement("div");box.innerHTML=`<svg viewBox="0 0 120 120" width="240" height="240">${T.svg(c)}</svg>`;document.body.appendChild(box);
      const svg=box.firstChild;const an=[];
      T.mozgas((sel,fr,op)=>{const el=svg.querySelector(sel);if(!el)return;const a=el.animate(fr,op);a.pause();an.push(a);},c);
      const poz=id=>{const el=svg.querySelector(id);if(!el)return null;const m=new DOMMatrix(getComputedStyle(el).transform);return [Math.round(m.e*10)/10,Math.round(m.f*10)/10];};
      const van=!!svg.querySelector("#evaUnnep");
      const kepek=idok.map(t=>{an.forEach(a=>{a.currentTime=t;});return {t,u:poz("#evaUnnep"),sor:poz("#evaUnnepSor"),labda:poz("#evaLabda")};});
      box.remove();return {van,kepek};};
    const idok=[0,1000,1900,2100,2400,2700,2950];
    o.sima=minta({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:7,sor:"30'  GÓL! T. Elek (P. Pál)  1:0"},idok);
    o.fejes=minta({t:"gol",side:"us",p:"Teszt Elek",min:31,seq:8,alt:"fejes",sor:"31'  GÓL! T. Elek  2:0"},[0,1100,1300,2000,2900]);
    o.tizi=minta({t:"gol",side:"us",p:"Teszt Elek",min:32,seq:9,alt:"tizenegyes",sor:"GÓL!"},[0]).van;
    o.szabad=minta({t:"gol",side:"us",p:"Teszt Elek",min:33,seq:10,alt:"szabadrugas",sor:"GÓL!"},[0]).van;
    o.kapott=minta({t:"golKapott",side:"them",p:"Ellen Fél",min:40,seq:9,sor:"40'  Gól: Ellen Fél  2:1"},[0]).van;
    return o;});
  console.log(JSON.stringify(r).slice(0,1800));
  ok(r.atlasz&&r.atlasz.w===320&&r.atlasz.h===80&&r.atlasz.feny.hi>r.atlasz.feny.lo,"1. az atlasz betöltődik (320×80)",r.atlasz);
  ok(r.szin.w===320&&r.szin.h===40&&r.szin.piros>r.szin.ossz*0.2&&r.szin.kek>r.szin.ossz*0.03&&r.cache,"2. a mez a fő színben, a nadrág a másodszínben; gyorsítótár",r.szin);
  ok(r.sima.van&&r.fejes.van&&r.tizi&&r.szabad&&r.kapott,"3. az ünnep-réteg minden gól-változatban (kapott gólnál is)",{s:r.sima.van,f:r.fejes.van,t:r.tizi,sz:r.szabad,k:r.kapott});
  const K=t=>r.sima.kepek.find(k=>k.t===t);
  ok(K(0).u[0]<=-60&&K(1900).u[0]<=-60,"4. a labda hálóba érése előtt a figura a képen kívül vár",[K(0).u,K(1900).u]);
  ok(K(2400).u[0]>0&&K(2400).u[0]<120&&K(2950).u[0]>K(2400).u[0]+30&&K(2400).u[1]>50,"4. utána balról jobbra keresztülfut a kép alján",[K(2100).u,K(2400).u,K(2700).u,K(2950).u]);
  const sorok=new Set(r.sima.kepek.map(k=>k.sor[0]));
  ok(sorok.size>=3&&[...sorok].every(v=>v<=0&&v>-320&&Math.abs(v%40)<0.01),"4. a futókockák lépcsőzetesen váltanak (40 px-es lépések)",[...sorok]);
  const F=t=>r.fejes.kepek.find(k=>k.t===t);
  ok(F(1100).u[0]<=-60&&F(2000).u[0]>0,"4. fejesnél a rövidebb jelenethez igazodik",[F(1100).u,F(2000).u]);
  const KEPEK=process.env.KEPEK;
  if(KEPEK){
    await p.evaluate(()=>{_mev={anim:true,duel:false,lista:[]};_evaFut=null;_evaSor.length=0;
      evaKer({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:3,sor:"30'  GÓL! T. Elek  1:0"});});
    await p.waitForTimeout(300);
    for(const t of [2000,2250,2500,2750]){
      await p.evaluate(t=>{(_evaFut&&_evaFut.anims||[]).forEach(a=>{try{a.pause();a.currentTime=t;}catch(e){}});},t);
      const el=await p.$("#evAnim .evaSzinpad");if(el)await el.screenshot({path:`${KEPEK}/unnep-${t}.png`});}
    await p.evaluate(()=>{try{evaLezar();}catch(e){}});}
  ok(!errs.length,"5. nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
