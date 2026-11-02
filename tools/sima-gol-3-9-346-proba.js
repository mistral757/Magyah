/* ⚽ A SIMA GÓL JELENETE: VÉDŐK, CSATÁR-MOZDULAT, PASSZ (3.9.346).

   KIMONDOTT KÉRÉS: „Az animációkban sima góloknál is legyenek védők, lövés
   előtti csatár mozdulatok, ha van gólpasszadó, akkor passz is."

   Amit mér:
     1. a passz ténye: saját gólnál a sor zárójeles gólpasszadója dönt, kapott
        gólnál rögzített mag (ugyanaz az esemény mindig ugyanúgy);
     2. a jelenetben két védő áll; passznál ott a passzoló is;
     3. passznál a labda a passzolótól a csatárhoz megy, a csatár ráfut,
        és csak ezután lő; a hang két rúgást hall (passz + lövés), a háló a
        lövés után mozdul;
     4. passz nélkül a csatár labdát vezet és cselez (oldalirányú kitérés),
        a közelebbi védő a csel irányába mozdul;
     5. a lövés a célzott cellába megy, a jelenet hossza 3000 ms;
     6. a fejes, a tizenegyes és a szabadrúgás változatlan (nincs új figura);
     7. képkockák a szemrevételezéshez (KEPEK=mappa); nincs oldalhiba. */
"use strict";
const http=require("http"),fs=require("fs"),path=require("path");
const ROOT=process.env.MROOT||"/home/user/Magyah", PORT=9346;
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
  const r=await p.evaluate(()=>{
    const o={};
    const minta=(ev,idok)=>{
      const T=EVA_SABLON.gol,c=evaKontextus(ev);
      const box=document.createElement("div");box.innerHTML=`<svg viewBox="0 0 120 120" width="240" height="240">${T.svg(c)}</svg>`;document.body.appendChild(box);
      const svg=box.firstChild;const an=[],J=[];
      T.mozgas((sel,fr,op)=>{const el=svg.querySelector(sel);if(!el)return;evaHangJel(J,sel,fr,op||{},"gol");const a=el.animate(fr,op);a.pause();an.push(a);},c);
      const poz=id=>{const el=svg.querySelector(id);if(!el)return null;const m=new DOMMatrix(getComputedStyle(el).transform);return [Math.round(m.e*10)/10,Math.round(m.f*10)/10];};
      const kepek=idok.map(t=>{an.forEach(a=>{a.currentTime=t;});
        return {t,labda:poz("#evaLabda"),lovo:poz("#evaLovo"),v1:poz("#evaVedo1"),v2:poz("#evaVedo2"),passzolo:poz("#evaPasszolo")};});
      const ids=["#evaVedo1","#evaVedo2","#evaPasszolo","#evaLovo","#evaKapus","#evaLabda"].filter(s=>svg.querySelector(s));
      box.remove();
      return {passz:c.passz,ids,kepek,cel:c.cel,J:J.map(x=>[Math.round(x[0]),x[1]]),dur:T.dur};};
    const idok=[0,300,600,1000,1250,1350,1900,2200];
    o.passz=minta({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:7,sor:"30'  GÓL! T. Elek (P. Pál)  1:0"},idok);
    o.cselez=minta({t:"gol",side:"us",p:"Teszt Elek",min:31,seq:8,sor:"31'  GÓL! T. Elek  2:0"},[0,560,810,1110,1350,1900]);
    const kap=[];for(let i=0;i<40;i++)kap.push(evaGolPasszVan({t:"golKapott",side:"them",p:"X",min:i,seq:i}));
    o.kapott={arany:kap.filter(Boolean).length/40,ismetel:evaGolPasszVan({t:"golKapott",p:"X",min:5,seq:5})===evaGolPasszVan({t:"golKapott",p:"X",min:5,seq:5})};
    o.kapottJelenet=minta({t:"golKapott",side:"them",p:"Ellen Fél",min:40,seq:9,sor:"40'  Gól: Ellen Fél  2:1"},[0]).ids;
    /* 6. a különleges változatok */
    const alt=a=>{const ev={t:"gol",side:"us",p:"Teszt Elek",min:50,seq:3,alt:a,sor:"GÓL! T. Elek (P. Pál)"};
      const c=evaKontextus(ev),s=EVA_SABLON.gol.svg(c);return {vedo:/evaVedo1|evaPasszolo/.test(s),fal:/evaFal0/.test(s)};};
    o.alt={fejes:alt("fejes"),tizi:alt("tizenegyes"),szabad:alt("szabadrugas")};
    return o;});

  console.log("— 1. a passz ténye —");
  ok(r.passz.passz===true&&r.cselez.passz===false,"saját gól: a zárójeles gólpasszadó dönt",[r.passz.passz,r.cselez.passz]);
  ok(r.kapott.ismetel&&r.kapott.arany>0.3&&r.kapott.arany<0.8,"kapott gól: rögzített mag, nagyjából minden második",r.kapott);

  console.log("\n— 2. a szereplők —");
  ok(["#evaVedo1","#evaVedo2","#evaPasszolo","#evaLovo"].every(x=>r.passz.ids.includes(x)),"passznál két védő és a passzoló is",r.passz.ids);
  ok(r.cselez.ids.includes("#evaVedo1")&&r.cselez.ids.includes("#evaVedo2")&&!r.cselez.ids.includes("#evaPasszolo"),"passz nélkül két védő, passzoló nincs",r.cselez.ids);
  ok(r.kapottJelenet.includes("#evaVedo1")&&r.kapottJelenet.includes("#evaVedo2"),"kapott gólnál is két védő",r.kapottJelenet);

  console.log("\n— 3. passz, ráfutás, lövés —");
  const K=t=>r.passz.kepek.find(k=>k.t===t);
  const d=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  ok(d(K(300).labda,K(0).labda)<1&&d(K(0).labda,K(0).passzolo)<8,"az elején a labda a passzolónál áll",{k0:K(0)});
  ok(d(K(1000).labda,K(1000).lovo)<10&&d(K(1000).lovo,K(0).lovo)>15,"a passz a ráfutó csatárhoz ér",{k1000:K(1000),k0:K(0)});
  ok(d(K(1350).labda,K(1350).lovo)<8&&K(1350).labda[1]>60,"a lövés előtt a labda még a csatárnál",K(1350));
  ok(d(K(2200).labda,[r.passz.cel.x,r.passz.cel.y])<1.5,"a lövés a célzott cellába megy",{l:K(2200).labda,cel:r.passz.cel});
  const rug=r.passz.J.filter(x=>x[1]==="aRugas").map(x=>x[0]),halo=r.passz.J.filter(x=>x[1]==="aHalo").map(x=>x[0]);
  ok(rug.length===2&&rug[0]<600&&rug[1]>=1300&&halo.length===1&&halo[0]>rug[1],"a hang: passz-rúgás, lövés-rúgás, aztán a háló",r.passz.J);
  ok(d(K(1250).v1,K(0).v1)>6,"a közelebbi védő becsúszik",{v1:[K(0).v1,K(1250).v1]});

  console.log("\n— 4. csel passz nélkül —");
  const C=t=>r.cselez.kepek.find(k=>k.t===t);
  ok(C(810).lovo[0]<C(560).lovo[0]&&C(1110).lovo[0]>C(810).lovo[0]+6,"a csatár balra cselez, majd jobbra elhúz",[C(560).lovo,C(810).lovo,C(1110).lovo]);
  ok(C(810).v1[0]<C(0).v1[0]-3,"a védő a csel irányába mozdul",[C(0).v1,C(810).v1]);
  ok(d(C(1350).labda,C(1350).lovo)<8,"lövés előtt a labda a csatár lábánál",C(1350));

  console.log("\n— 5–6. időtartam, különleges változatok —");
  ok(r.passz.dur===3000,"a jelenet 3000 ms",r.passz.dur);
  ok(!r.alt.fejes.vedo&&!r.alt.tizi.vedo&&!r.alt.szabad.vedo&&r.alt.szabad.fal,"fejes, tizenegyes, szabadrúgás változatlan",r.alt);

  /* 7. képkockák a lejátszóból */
  const KEPEK=process.env.KEPEK;
  if(KEPEK){
    for(const [nev,sor] of [["passz","30'  GÓL! T. Elek (P. Pál)  1:0"],["csel","31'  GÓL! T. Elek  2:0"]]){
      await p.evaluate(sor=>{_mev={anim:true,duel:false,lista:[]};_evaFut=null;_evaSor.length=0;
        evaKer({t:"gol",side:"us",p:"Teszt Elek",min:30,seq:sor.length,sor});},sor);
      /* a jelenet animációit megállítjuk, és pontos időpontokra tekerjük */
      await p.waitForTimeout(300);
      for(const t of [100,700,1100,1400,2000]){
        await p.evaluate(t=>{(_evaFut&&_evaFut.anims||[]).forEach(a=>{try{a.pause();a.currentTime=t;}catch(e){}});},t);
        const el=await p.$("#evAnim .evaSzinpad");if(el)await el.screenshot({path:`${KEPEK}/gol-${nev}-${t}.png`});}
      await p.evaluate(()=>{try{evaLezar();}catch(e){}});await p.waitForTimeout(400);}}
  ok(!errs.length,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.close();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
