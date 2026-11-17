/* 🏷️ 1.0.11.2.01 — AZ ÚJ IKONKÉSZLET (a taktikai M).

   KIMONDOTT KÉRÉS: „Tervezz új ikont … Az ikonkészlet teljes: ugyanazok a
   fájlnevek és méretek, mint ma (favicon, apple-touch, 192/512 normál és
   maskable, a többi méret). A maskable változatnál a biztonsági zóna (a közép
   80%-a) számít … Frissítsd, ami az ikonhoz kapcsolódik."

   Amit mér (fájl-szinten, böngésző nélkül):
     1. a készlet teljes: a 15 méret + apple-touch + 2 maskable + favicon.ico,
        mind pontosan a nevében álló méretű; a favicon 16+32+48;
     2. a tartalom: a lekerekített ikonok sarka átlátszó, a közepük az új
        petróleum alap (nem a régi krém); a maskable teljes széltében
        kitöltött, és a jel nem lép ki a középső 80%-os körből;
     3. a kis méretek NEM a nagyok kicsinyítései (külön rajz: „apro", „mini");
     4. a régi készlet és rajz megvan a tools/ikon/regi/ alatt;
     5. a manifest: a színek #06141a, minden hivatkozott fájl létezik, a
        maskable „purpose" a helyén; a képernyőképek 1080×1920-asak és mind
        különbözők;
     6. a service worker: a cache-név v10 vagy későbbi, és minden ikont
        előre cache-el, ami a manifestben van;
     7. az áruházi grafika 1024×500;
     8. a gyártó ellenőrző lépése maga is zöld (node tools/ikon/general.js
        nem fut újra — a próba ugyanazt a vizsgálatot végzi a kész fájlokon). */
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {execFileSync}=require("child_process");
const ROOT=process.env.MROOT||"/home/user/Magyah";
let hiba=0;
const ok=(c,t,d)=>{console.log((c?"  ✓ ":"  ✗ ")+t+(d!==undefined?" · "+JSON.stringify(d):""));if(!c)hiba++;};
const I=path.join(ROOT,"icons");
const MERETEK=[16,32,48,72,96,120,128,144,152,167,180,192,256,384,512];

const py=kod=>JSON.parse(execFileSync("python3",["-c",kod]).toString());

console.log("\n— 1–3. A KÉSZLET —");
const r=py(`
from PIL import Image
import json,math,os
G=${JSON.stringify(I+"/")};ki={}
def info(n):
    im=Image.open(G+n).convert("RGBA");w,h=im.size;px=im.load()
    c=px[w//2,h//8]
    return im,w,h,px,c
for m in ${JSON.stringify(MERETEK)}:
    n="icon-%dx%d.png"%(m,m)
    if not os.path.exists(G+n):ki[n]="hiányzik";continue
    im,w,h,px,c=info(n)
    ki[n]={"meret":[w,h],"sarok":px[0,0][3],"kozep":px[w//2,h//2][3],"alap":c[:3]}
for m in (192,512):
    n="icon-maskable-%dx%d.png"%(m,m)
    im,w,h,px,c=info(n);R=0.4*w;kint=0;atl=0
    for y in range(h):
        for x in range(w):
            r_,g,b,a=px[x,y]
            if a<255:atl+=1
            if math.hypot(x+.5-w/2,y+.5-h/2)>R and ((g>200 and b<140) or (r_>235 and g>235 and b>235)):kint+=1
    ki[n]={"meret":[w,h],"atlatszo":atl,"kint":kint}
im=Image.open(G+"apple-touch-icon.png");ki["apple"]=list(im.size)
ico=Image.open(G+"favicon.ico");ki["ico"]=sorted([list(s) for s in ico.info.get("sizes",[])])
# a 16-os nem a 48-as kicsinyítése: a 48-ast 16-ra húzva lényegesen más képet ad
a=Image.open(G+"icon-16x16.png").convert("RGBA");b=Image.open(G+"icon-48x48.png").convert("RGBA").resize((16,16),Image.LANCZOS)
d=sum(abs(x-y) for x,y in zip(a.tobytes(),b.tobytes()))/(16*16*4)
ki["kulon16"]=round(d,1)
print(json.dumps(ki))`);
const rossz=MERETEK.filter(m=>{const x=r[`icon-${m}x${m}.png`];
  return !x||typeof x==="string"||x.meret[0]!==m||x.meret[1]!==m||x.sarok>40||x.kozep<255;});
ok(rossz.length===0,"a 15 méret mind megvan, pontos méretű, a sarok átlátszó, a közepe nem",rossz);
const alap=MERETEK.map(m=>r[`icon-${m}x${m}.png`].alap);
ok(alap.every(c=>c[0]<60&&c[1]<90&&c[2]<100),"az alap az új petróleum-éjszaka (nem a régi krém)",alap.slice(0,3));
ok(JSON.stringify(r.apple)==="[180,180]"&&JSON.stringify(r.ico)==="[[16,16],[32,32],[48,48]]","apple-touch 180, favicon 16+32+48",{apple:r.apple,ico:r.ico});
for(const m of [192,512]){const x=r[`icon-maskable-${m}x${m}.png`];
  ok(x.meret[0]===m&&x.atlatszo===0&&x.kint===0,`maskable ${m}: teljes széltében kitöltött, a jel a biztonsági körön belül`,x);}
ok(r.kulon16>12,"a 16 px-es ikon külön rajz, nem a nagyobb kicsinyítése",r.kulon16);

console.log("\n— 4. A RÉGI KÉSZLET MEGVAN —");
{
  const R=path.join(ROOT,"tools","ikon","regi");
  const v=MERETEK.filter(m=>fs.existsSync(path.join(R,`icon-${m}x${m}.png`))).length;
  ok(v===15&&fs.existsSync(path.join(R,"favicon.ico"))&&fs.existsSync(path.join(R,"icon-maskable-512x512.png"))&&fs.existsSync(path.join(R,"rajz-regi.js")),
     "a régi 15 méret, a maskable, a favicon és a régi rajz a tools/ikon/regi/ alatt",v);
}

console.log("\n— 5. A MANIFEST —");
const man=JSON.parse(fs.readFileSync(path.join(I,"site.webmanifest"),"utf8"));
{
  ok(man.theme_color==="#06141a"&&man.background_color==="#06141a","a színek az új alaphoz igazodnak (#06141a)",{t:man.theme_color,b:man.background_color});
  const hiany=man.icons.concat(man.screenshots).map(x=>x.src).filter(s=>!fs.existsSync(path.join(ROOT,s.split("?")[0])));
  ok(hiany.length===0,"minden hivatkozott fájl létezik",hiany);
  ok(man.icons.filter(x=>x.purpose==="maskable").length===2,"a két maskable ikon „purpose: maskable”-lel");
  const ss=py(`
from PIL import Image
import json,hashlib
print(json.dumps([[list(Image.open(${JSON.stringify(ROOT)}+s).size),hashlib.md5(open(${JSON.stringify(ROOT)}+s,"rb").read()).hexdigest()] for s in ${JSON.stringify(man.screenshots.map(x=>x.src.split("?")[0]))}]))`);
  ok(ss.every(x=>x[0][0]===1080&&x[0][1]===1920)&&new Set(ss.map(x=>x[1])).size===ss.length,"a négy képernyőkép 1080×1920-as, és mind különböző",ss.map(x=>x[0]));
}

console.log("\n— 6. A SERVICE WORKER —");
{
  const sw=fs.readFileSync(path.join(ROOT,"sw-1.js"),"utf8");
  const v=+(sw.match(/harminc-nulla-cache-v(\d+)/)||[])[1];
  ok(v>=11,"a cache-név v11 vagy későbbi (az ikonok címe verziót kapott)",v);
  const html=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
  const fejV=[...html.slice(0,html.indexOf("<script>")).matchAll(/href="\/icons\/(?:favicon\.ico|apple-touch-icon\.png)(\?v=\d+)?"/g)].map(m=>m[1]||"");
  const V=fejV[0]||"";
  const kell=man.icons.map(x=>x.src).concat(["/icons/favicon.ico"+V,"/icons/apple-touch-icon.png"+V,"/icons/site.webmanifest"]);
  const nincs=kell.filter(s=>!sw.includes(`"${s}"`));
  ok(nincs.length===0,"minden ikon előre cache-elve (ugyanazon a címen, amin a manifest és a <head> kéri)",nincs);
  /* 1.0.11.4.02 — „újra telepítettem az appot, és nekem az ikon nem változott
     meg": az új ikon a régi fájlnéven a gyorsítótárakból a régit adhatta.
     Mostantól minden ikon-hivatkozás UGYANAZT a verzió-utótagot viseli, a
     manifest címe viszont NEM (az azonosítja a telepített alkalmazást). */
  const manV=new Set(man.icons.concat(man.screenshots).map(x=>(x.src.match(/\?v=\d+$/)||[""])[0]));
  const swV=new Set([...sw.matchAll(/"\/icons\/(?:icon-[^"?]+\.png|favicon\.ico|apple-touch-icon\.png)(\?v=\d+)?"/g)].map(m=>m[1]||""));
  ok(V&&fejV.length===2&&fejV.every(x=>x===V)&&manV.size===1&&manV.has(V)&&swV.size===1&&swV.has(V),
     "az ikonok címe verziót visel, és a manifest, a <head> és a service worker ugyanazt",{fej:fejV,manifest:[...manV],sw:[...swV]});
  ok(/<link rel="manifest" href="\/icons\/site\.webmanifest">/.test(html),"a manifest címe változatlan (az azonosítja a telepített alkalmazást)");
}

console.log("\n— 7. AZ ÁRUHÁZI GRAFIKA —");
{
  const g=py(`
from PIL import Image
import json
print(json.dumps(list(Image.open(${JSON.stringify(I+"/play/feature-1024x500.png")}).size)))`);
  ok(JSON.stringify(g)==="[1024,500]","feature-1024x500.png: 1024×500",g);
}

console.log(hiba?`\n✗ ${hiba} hiba`:"\n✓ minden rendben");
process.exit(hiba?1:0);
