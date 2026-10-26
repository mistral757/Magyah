/* 🧑 3.9.267 — AZ ARCKÉP-GENERÁTOR (F1) — élő mérés.
   Amit néz:
     1. determinisztikus: ugyanaz a bemenet bitre ugyanazt az SVG-t adja,
     2. változatos: 400 valódi játékosból szinte mind más vonás-kombináció,
        minden hajstílus és legalább 8 bőrtónus előfordul,
     3. a kor csak a korfüggő vonásokat mozgatja (őszülés, ránc, hajvonal,
        szakáll), a bőrt / hajszínt / arcformát nem,
     4. a hajvonal csak a játékosok egy részénél húzódik vissza,
     5. a nemzetiség súlyoz, de nem kötelez (régiónként több tónus),
     6. a morál a szájon látszik (más SVG -1-nél és +1-nél),
     7. minden SVG valódi képként betölt,
     8. a pixeles változat 40×40-es PNG, a saját palettájára kvantálva,
        és a helyőrző <img> magától kicserélődik,
     9. a sima/pixeles választás: auto (téma szerint), sima, pix,
    10. nincs oldalhiba.
   Használat: node tools/arckep-3-9-267-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');

(async()=>{
  const srv=spawn('python3',['-m','http.server','8962'],{cwd:'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const hiba=[];
  const p=await b.newPage({viewport:{width:600,height:900}});
  p.on('pageerror',e=>hiba.push(e.message));
  p.on('console',m=>{if(m.type()==='error')hiba.push(m.text());});
  await p.goto('http://localhost:8962/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const out=await p.evaluate(async()=>{
    const o={};
    /* egy játékos több keretben is szerepelhet (több idény): névre szűrve */
    const all=[],volt=new Set();SQUADS.forEach(s=>s.players.forEach(x=>{if(!volt.has(x.n)){volt.add(x.n);all.push(x);}}));
    const step=Math.max(1,Math.floor(all.length/400));
    const minta=[];for(let i=0;i<all.length&&minta.length<400;i+=step)minta.push({n:all[i].n,nat:all[i].nat,age:17+faceHash(all[i].n+"kor")%22});
    const tiszta=x=>x.replace(/fc\d+/g,"fc");
    /* 1 */
    o.det=minta.slice(0,30).every(q=>tiszta(faceSVG(q,100,{mood:0}))===tiszta(faceSVG(Object.assign({},q),100,{mood:0})));
    /* 2 */
    const kulcs=q=>{const T=faceTraits(q);return [T.bor,T.text,T.hajSzin,T.szemSzin,T.haj,T.szemTip,T.orr,T.szaj,T.szemoldTip,Math.round(T.fejW),T.szakall].join(",");};
    o.kulonbozo=new Set(minta.map(kulcs)).size;
    /* 3.9.315: 38 frizura mellett a ritkák (pl. „fonott") egy 400-as mintából
       kimaradhatnak — az előfordulást a TELJES állományon nézzük */
    o.stilusok=new Set(all.map(q=>faceTraits({n:q.n,nat:q.nat,age:26}).haj)).size;
    o.stilusOssz=FACE_HAJ_STILUS.length;
    o.tonusok=new Set(minta.map(q=>faceTraits(q).bor)).size;
    /* 3-4 */
    let alland=true,oregebb=true,kopik=0;
    for(const q of minta.slice(0,200)){
      const a=faceTraits(Object.assign({},q,{age:20})),z=faceTraits(Object.assign({},q,{age:38}));
      if(["bor","text","hajSzin","szemSzin","haj","fejW","allW","szemTip","orr","szaj"].some(k=>a[k]!==z[k]))alland=false;
      if(z.osz<a.osz||z.ranc<a.ranc||z.kopas<a.kopas)oregebb=false;
      if(z.kopas>0)kopik++;}
    o.alland=alland;o.oregebb=oregebb;o.kopikArany=kopik/200;
    o.fiatalOsz=minta.filter(q=>faceTraits(Object.assign({},q,{age:21})).osz>0).length;
    /* 5 */
    const reg=(nat,k)=>{const t=[];for(let i=0;i<300;i++)t.push(faceTraits({n:"Próba "+k+i,nat,age:25}).bor);return t;};
    const sv=reg("Svédország","s"),ng=reg("Nigéria","n"),br=reg("Brazília","b");
    const atl=a=>a.reduce((x,y)=>x+y,0)/a.length;
    o.reg={sv:atl(sv),ng:atl(ng),br:atl(br),svFele:new Set(sv).size,ngFele:new Set(ng).size,brFele:new Set(br).size};
    /* 6 */
    {const q=minta[3];o.moral=tiszta(faceSVG(q,100,{mood:-1}))!==tiszta(faceSVG(q,100,{mood:1}));}
    /* 7 */
    const betolt=u=>new Promise(r=>{const im=new Image();im.onload=()=>r(im.naturalWidth>0);im.onerror=()=>r(false);im.src=u;});
    const kit={c1:"#c8102e",c2:"#ffffff",pat:"stripes",collar:"v",ink:"#ffffff"};
    const res=await Promise.all(minta.slice(0,60).map((q,i)=>betolt(faceSvgUrl(q,{kit:i%2?kit:null,mood:(i%5-2)/2}))));
    o.betolt=res.filter(Boolean).length;
    /* 8 */
    document.body.insertAdjacentHTML("beforeend",`<div id="arcProba">${faceImgHtml(minta[5],80,{pix:true,kit})}</div>`);
    const el0=document.querySelector("#arcProba img");
    o.helyorzo=el0.hasAttribute("data-facepix");
    const pu=await new Promise(r=>facePixUrl(minta[5],{kit},r));
    await new Promise(r=>setTimeout(r,50));
    o.csere=!el0.hasAttribute("data-facepix")&&el0.src===pu;
    o.png=pu.indexOf("data:image/png")===0;
    {const im=new Image();await new Promise(r=>{im.onload=r;im.src=pu;});
     const c=document.createElement("canvas");c.width=im.width;c.height=im.height;const g=c.getContext("2d");g.drawImage(im,0,0);
     const d=g.getImageData(0,0,c.width,c.height).data;const szin=new Set();
     for(let i=0;i<d.length;i+=4)if(d[i+3])szin.add(d[i]+","+d[i+1]+","+d[i+2]);
     o.pixMeret=[im.width,im.height];o.pixSzin=szin.size;o.paletta=facePaletta(minta[5],{kit,bold:true}).length;}
    o.gyors=!!facePixUrl(minta[5],{kit});
    /* 9 */
    const tema=document.documentElement.getAttribute("data-theme");
    faceStilusSet("auto");document.documentElement.setAttribute("data-theme","pixel");o.autoPix=faceStilus();
    document.documentElement.removeAttribute("data-theme");o.autoSima=faceStilus();
    faceStilusSet("pix");o.kezi=faceStilus();faceStilusSet("auto");
    if(tema)document.documentElement.setAttribute("data-theme",tema);
    return o;});

  const A=[],ok=(n,f)=>A.push({n,ok:!!f});
  ok("determinisztikus",out.det);
  ok(`változatos: ${out.kulonbozo}/400 különböző`,out.kulonbozo>=390);
  ok(`minden hajstílus előfordul (${out.stilusok}/${out.stilusOssz})`,out.stilusok===out.stilusOssz);
  ok(`legalább 8 bőrtónus (${out.tonusok})`,out.tonusok>=8);
  ok("a kor csak a korfüggő vonásokat mozgatja",out.alland);
  ok("idősebben nem fiatalabb (őszülés, ránc, hajvonal)",out.oregebb);
  ok(`a hajvonal csak egy résznél húzódik vissza (${(out.kopikArany*100).toFixed(0)}%)`,out.kopikArany>0.2&&out.kopikArany<0.55);
  ok("21 évesen senki sem ősz",out.fiatalOsz===0);
  ok(`a régió súlyoz (SE ${out.reg.sv.toFixed(1)} < BR ${out.reg.br.toFixed(1)} < NG ${out.reg.ng.toFixed(1)})`,out.reg.sv<out.reg.br&&out.reg.br<out.reg.ng);
  ok("…de nem kötelez (régiónként ≥4 tónus)",out.reg.svFele>=4&&out.reg.ngFele>=4&&out.reg.brFele>=6);
  ok("a morál látszik",out.moral);
  ok(`minden SVG betölt (${out.betolt}/60)`,out.betolt===60);
  ok("pixeles: helyőrző, majd magától csere",out.helyorzo&&out.csere);
  ok(`pixeles: 40×40 PNG, ${out.pixSzin} szín ≤ paletta ${out.paletta}`,out.png&&out.pixMeret.join()==="40,40"&&out.pixSzin<=out.paletta);
  ok("pixeles: másodszorra a gyorsítótárból",out.gyors);
  ok("választás: auto → téma, kézi felülír",out.autoPix==="pix"&&out.autoSima==="sima"&&out.kezi==="pix");
  ok("nincs oldalhiba",hiba.length===0);

  console.log(JSON.stringify(out,null,1));
  if(hiba.length)console.log("HIBÁK:",hiba.slice(0,5));
  A.forEach(a=>console.log((a.ok?"✔":"✘")+" "+a.n));
  const bukott=A.filter(a=>!a.ok).length;
  console.log(bukott?`\n${bukott} BUKOTT`:"\nMIND RENDBEN");
  await b.close();srv.kill();process.exit(bukott?1:0);
})();
