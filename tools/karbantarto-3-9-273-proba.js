/* 🧹 3.9.273–274 — A KARBANTARTÓ (F6) — élő mérés.
   Amit néz:
     1. az élő meccskép hurka: két kezdőrúgás után is csak EGY fut (a régi
        szivárgott: +1 időzítő/meccs);
     2. a napló: sok sor → a régebbiek archívumba, a lapon az utolsó 220, a
        tetején a „▲ Korábbi sorok" gomb; a kupa-jelölő (euroLogMark) együtt
        mozog; a gomb darabonként visszahoz, a görgetés a helyén marad, a
        témakör-jelölés (data-fk) megmarad; a végén a gomb eltűnik;
     3. meccs közben és visszafelé olvasva nem takarít; szezonváltáskor az
        archívum is ürül;
     4. az arckép-gyorsítótár LRU: 240 fölött a legrégebben használt megy, a
        frissen használt marad;
     5. a diagnosztikában ott a KARBANTARTÓ blokk;
     6. a pixeles előkészítés EGYENKÉNT halad (nincs 154 egyidejű kérés);
     7. nincs oldalhiba.
   Használat: node tools/karbantarto-3-9-273-proba.js */
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {spawn}=require('child_process');
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
(async()=>{
  const srv=spawn('python3',['-m','http.server','9063'],{cwd:process.env.MROOT||'/home/user/Magyah',stdio:'ignore'});
  await new Promise(r=>setTimeout(r,1200));
  const b=await chromium.launch({args:["--no-sandbox"]});
  const p=await b.newPage({viewport:{width:430,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{const si=window.setInterval,ci=window.clearInterval;window._ivA=new Map();
    window.setInterval=function(f,t,...a){const id=si.call(window,f,t,...a);window._ivA.set(id,String(f).slice(0,40));return id;};
    window.clearInterval=function(id){window._ivA.delete(id);return ci.call(window,id);};});
  await p.goto('http://localhost:9063/index.html',{waitUntil:'networkidle'});
  await p.waitForTimeout(1500);
  const r=await p.evaluate(async()=>{
    const o={};const varj=ms=>new Promise(r=>setTimeout(r,ms));
    /* 1 */
    document.getElementById("scSim").classList.remove("hide");
    mevKezd({});ekKezd();ekKezd();ekKezd();
    o.ekHurok=[...window._ivA.values()].filter(s=>/ekLeptet/.test(s)).length;
    clearInterval(_ek.iv);_ek.iv=null;
    o.ktHurok=[...window._ivA.values()].filter(s=>/ktUtemez/.test(s)).length;
    /* 2 */
    const L=lines();L.innerHTML="";ktArchivUrit();S.playing=false;
    for(let i=0;i<500;i++)addLine(`${i%90}'  Sor ${i}`,i%7?"m ev":"m life");
    L.scrollTop=L.scrollHeight;await varj(50);
    euroLogMark=480;
    ktFut();
    o.lapon=ktSorok(L).length;o.archiv=_ktArchiv.length;o.mark=euroLogMark;
    o.gomb=!!L.querySelector(":scope>.ktArchiv")&&L.firstElementChild.classList.contains("ktArchiv");
    o.gombTx=L.querySelector(".ktArchiv button").textContent;
    o.elsoLapon=ktSorok(L)[0].textContent.trim();
    L.scrollTop=40;const t0=L.scrollTop;
    L.querySelector(".ktArchiv button").click();
    o.vissza1={lapon:ktSorok(L).length,archiv:_ktArchiv.length,mark:euroLogMark,gorgetesMozdult:L.scrollTop>t0,
      fk:ktSorok(L)[0].hasAttribute("data-fk"),elso:ktSorok(L)[0].textContent.trim()};
    L.querySelector(".ktArchiv button").click();
    o.vissza2={lapon:ktSorok(L).length,archiv:_ktArchiv.length,gomb:!!L.querySelector(".ktArchiv"),mark:euroLogMark,
      sorrend:ktSorok(L).slice(0,3).map(x=>x.textContent.trim())};
    /* a jelölő ugyanazt a sort mutatja, mint a takarítás előtt (a 480. sort) */
    o.markSor=L.children[euroLogMark]?L.children[euroLogMark].textContent.trim():null;
    /* 3 */
    for(let i=0;i<300;i++)addLine(`50'  Új ${i}`,"m ev");
    L.scrollTop=L.scrollHeight;S.playing=true;const db0=ktSorok(L).length;ktFut();o.meccsKozben=ktSorok(L).length===db0;
    S.playing=false;L.scrollTop=0;ktFut();o.visszaOlvas=ktSorok(L).length===db0;
    L.scrollTop=L.scrollHeight;ktFut();o.utanaTakarit=ktSorok(L).length===220;
    L.innerHTML="";ktArchivUrit();o.szezonUrit=_ktArchiv.length===0;
    /* 4 */
    _faceCache.clear();
    for(let i=0;i<300;i++)faceSvgUrl({n:"LRU "+i,nat:"",age:25},{});
    faceSvgUrl({n:"LRU 3",nat:"",age:25},{});   /* frissen használt */
    ktFut();
    o.lru={meret:_faceCache.size,friss:[..._faceCache.keys()].some(k=>k.indexOf("LRU 3|")>=0),regi:[..._faceCache.keys()].some(k=>k.indexOf("LRU 4|")>=0)};
    /* 5 */
    o.diag=/KARBANTARTÓ/.test(mpDiagCollect())&&/arckép-gyorsítótár/.test(ktAllapotSzoveg());
    /* 6 */
    try{applyTheme("pixel");}catch(e){}
    faceStilusSet("auto");_faceCache.clear();
    /* friss lapon nincs keret — négy próbajátékos kerül a felállásba */
    const _sl=slots;slots=["KP","KV","KKP","CS"].map((pos,i)=>({pos,player:{n:"Pix Teszt "+i,pos:[pos],age:24,ovr:70}}));
    let csucs=0;const _fp=facePixUrl;
    facePixUrl=function(...a){const r=_fp.apply(this,a);csucs=Math.max(csucs,_facePixVar.size);return r;};
    evaArcElo();
    for(let i=0;i<60;i++){await varj(100);}
    facePixUrl=_fp;slots=_sl;
    o.pix={csucs,kesz:[..._faceCache.keys()].filter(k=>k.indexOf("p|")===0).length};
    return o;});
  console.log(JSON.stringify(r,null,1));
  ok(r.ekHurok===1,"három kezdőrúgás után is egy élő-kép hurok",r.ekHurok);
  ok(r.ktHurok===1,"a karbantartó egyetlen ütemezője fut",r.ktHurok);
  ok(r.lapon===220&&r.archiv===280&&r.gomb,"500 sorból 220 a lapon, 280 archívumban, gomb a tetején",{lapon:r.lapon,archiv:r.archiv});
  ok(r.mark===201,"a kupa-jelölő együtt mozog (480 − 280 + 1 gomb)",r.mark);
  ok(/280/.test(r.gombTx)&&r.elsoLapon.indexOf("Sor 280")>=0,"a gomb a darabszámot mondja; a lapon a 280. sortól",{tx:r.gombTx,elso:r.elsoLapon});
  ok(r.vissza1.lapon===420&&r.vissza1.archiv===80&&r.vissza1.gorgetesMozdult&&r.vissza1.fk&&r.vissza1.elso.indexOf("Sor 80")>=0,"visszahozás: +200 sor elé, a szem a helyén marad, a témakör megmarad",r.vissza1);
  ok(r.vissza2.lapon===500&&r.vissza2.archiv===0&&!r.vissza2.gomb&&r.vissza2.sorrend[0].indexOf("Sor 0")>=0,"a végén minden sor a helyén, sorrendben, gomb nélkül",r.vissza2);
  ok(r.markSor&&r.markSor.indexOf("Sor 480")>=0,"a kupa-jelölő végig ugyanazt a sort mutatja",r.markSor);
  ok(r.meccsKozben&&r.visszaOlvas&&r.utanaTakarit,"meccs közben és visszafelé olvasva nem takarít; utána igen",{m:r.meccsKozben,v:r.visszaOlvas,u:r.utanaTakarit});
  ok(r.szezonUrit,"szezonváltáskor az archívum is ürül");
  ok(r.lru.meret===240&&r.lru.friss&&!r.lru.regi,"arckép-gyorsítótár: LRU, 240",r.lru);
  ok(r.diag,"a diagnosztikában ott a karbantartó");
  ok(r.pix.csucs<=1&&r.pix.kesz===12,"a pixeles előkészítés egyenként halad",r.pix);
  ok(errs.length===0,"nincs oldalhiba",errs.slice(0,3));
  await b.close();srv.kill();
  console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
  process.exit(hiba?1:0);
})();
