/* 🌍 A KÖZÖS KINÉZET-LISTA NAPI BEÉPÍTÉSE (3.9.315)

   KIMONDOTT KÉRÉS: „»szutykos stylist vagyok« és akkor minden amit globálra
   beállítasz, automatikusan uploadolódik egy […] listára, ami aztán naponta
   egyszer leszoppantódik, és beépül a kódba."

   A játék stylist-módban a globálisan mentett kinézetet a Firebase
   `stylist/<uid>/<kulcs>` ágára írja ({v, at, app, n, d}). Az ág kívülről nem
   olvasható; ez a szkript a SZOLGÁLTATÁSFIÓK kulcsával (admin) olvassa ki, és
   az index.html két jelölője közé (ARC-ALAP:KEZD … ARC-ALAP:VEG) írja
   az ARC_ALAP táblát. A GitHub Action (.github/workflows/stylist-szinkron.yml)
   naponta futtatja, és ha változott, commitolja az alapértelmezett ágra.

   SZŰRÉS — a kulcsszó a forrásban olvasható, tehát bárki feltölthet; amit
   átveszünk, az csak kinézet, és csak ez:
     · a név a játékban LÉTEZŐ kanonikus név (HU_NAME_TABLE kulcsa vagy keret-
       játékos), és a bejegyzés kulcsa a nevéből számolt (stylistKulcs);
     · csak az ismert mezők (FACE_MOD_MEZOK — magából az index.html-ből), a
       saját tartományukban (a játék faceModTisztit-jével azonos szabály);
     · nevenként a LEGFRISSEBB bejegyzés dönt (bárkié); az üres d = törlés.
   A repó nyilvános: a feltöltő azonosítója (uid) NEM kerül bele, csak a
   kinézet és a kanonikus név — az a név az index.html-ben amúgy is ott áll.

   🎽 3.9.320 — AZ ELLENFÉL-MEZEK ugyanezen az ágon jönnek (v:2, a név "mez:"
   előtaggal, a kulcs a "mez:<csapat>" hash-e). Ezek a MEZ-ALAP:KEZD …
   MEZ-ALAP:VEG blokkba kerülnek, KULCS (hash) szerint — a repóba csapatnév
   nem kerül. Szűrés: a kulcs a névből számolt; csak a mez mezői (két-három
   #rrggbb szín, a játék KIT_PATTERNS / KIT_SLEEVES / KIT_COLLARS listájának
   egy-egy eleme); csapatonként a legfrissebb dönt; az üres d = törlés.

   Használat:
     FIREBASE_SERVICE_ACCOUNT='<kulcs JSON>' node tools/stylist/beepit.js [--html index.html]
     node tools/stylist/beepit.js --fajl <firebase-export.json> [--html <másolat>]   (próba)
   Kimenet: a módosított index.html, és a szabványos kimeneten egy összegzés;
   GitHub Actionben a GITHUB_OUTPUT-ba: valtozas=0|1, uzenet=<commit-sor>. */
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),https=require("https"),http=require("http");
const args=process.argv.slice(2);
const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const HTML=opt("--html")||path.join(__dirname,"..","..","index.html");
const FAJL=opt("--fajl");
const DB_URL=(process.env.FIREBASE_DB_URL||"https://magyahok-default-rtdb.europe-west1.firebasedatabase.app").replace(/\/+$/,"");
const TOKEN_URL=process.env.FIREBASE_TOKEN_URL||"https://oauth2.googleapis.com/token";
const KEZD="/*ARC-ALAP:KEZD*/",VEG="/*ARC-ALAP:VEG*/";
const MKEZD="/*MEZ-ALAP:KEZD*/",MVEG="/*MEZ-ALAP:VEG*/";
const MAX_MEZ=5000;
const MAX_JATEKOS=5000;

function keres(url,o){
  return new Promise((res,rej)=>{
    const u=new URL(url),lib=u.protocol==="http:"?http:https;
    const req=lib.request(u,{method:(o&&o.method)||"GET",headers:(o&&o.headers)||{}},r=>{
      let b="";r.setEncoding("utf8");r.on("data",c=>b+=c);
      r.on("end",()=>r.statusCode>=200&&r.statusCode<300?res(b):rej(new Error(`HTTP ${r.statusCode}: ${b.slice(0,300)}`)));});
    req.on("error",rej);if(o&&o.body)req.write(o.body);req.end();});}
const b64u=x=>Buffer.from(x).toString("base64").replace(/=+$/,"").replace(/\+/g,"-").replace(/\//g,"_");
async function tokenKer(sa){
  const most=Math.floor(Date.now()/1000);
  const fej=b64u(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const test=b64u(JSON.stringify({iss:sa.client_email,
    scope:"https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud:TOKEN_URL,iat:most,exp:most+3600}));
  const alair=crypto.sign("RSA-SHA256",Buffer.from(fej+"."+test),sa.private_key);
  const body=`grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${fej}.${test}.${b64u(alair)}`;
  const v=JSON.parse(await keres(TOKEN_URL,{method:"POST",body,
    headers:{"content-type":"application/x-www-form-urlencoded","content-length":Buffer.byteLength(body)}}));
  if(!v.access_token)throw new Error("nincs access_token a válaszban");
  return v.access_token;}
async function lehuz(){
  if(FAJL){const d=JSON.parse(fs.readFileSync(FAJL,"utf8"));return (d&&d.stylist)?d.stylist:d;}
  const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!raw)throw new Error("Hiányzik a FIREBASE_SERVICE_ACCOUNT (a szolgáltatásfiók JSON-kulcsa).");
  const tok=await tokenKer(JSON.parse(raw));
  return JSON.parse(await keres(`${DB_URL}/stylist.json`,{headers:{authorization:"Bearer "+tok}}))||{};}

/* a játék saját szabályai — magából az index.html-ből */
function jatekSzabaly(src){
  const m1=/const FACE_MOD_MEZOK=(\{[\s\S]*?\});/.exec(src),m2=/const FACE_EGESZ=(\[[^\]]*\]);/.exec(src);
  if(!m1||!m2)throw new Error("Nem találom a FACE_MOD_MEZOK / FACE_EGESZ táblát az index.html-ben.");
  return {MEZOK:Function(`"use strict";return (${m1[1]});`)(),EGESZ:Function(`"use strict";return (${m2[1]});`)()};}
function tisztit(ov,SZ){
  const o={};if(!ov||typeof ov!=="object"||Array.isArray(ov))return o;
  for(const k of Object.keys(SZ.MEZOK)){
    const v=ov[k],t=SZ.MEZOK[k];
    if(v===undefined||v===null)continue;
    if(t==="b"){o[k]=!!v;continue;}
    const n=Number(v);if(!isFinite(n))continue;
    const c=Math.max(t[0],Math.min(t[1],n));
    o[k]=SZ.EGESZ.indexOf(k)>=0?Math.round(c):Math.round(c*1000)/1000;}
  return o;}
/* a játékban létező kanonikus nevek */
function ismertNevek(src){
  const s=new Set();let m;
  const re1=/\n "((?:[^"\\]|\\.)+)":\["/g;while((m=re1.exec(src)))s.add(JSON.parse(`"${m[1]}"`));
  const re2=/\{n:"((?:[^"\\]|\\.)+)",(?:pos|era):/g;while((m=re2.exec(src)))s.add(JSON.parse(`"${m[1]}"`));
  return s;}
/* a játék faceHash-e (FNV-1a) — a kulcs ellenőrzéséhez */
function faceHash(t){let h=2166136261>>>0;t=String(t);for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
const kulcsa=n=>"h"+faceHash(n).toString(36);

function blokkOlvas(src,K,V){
  K=K||KEZD;V=V||VEG;
  const a=src.indexOf(K),b=src.indexOf(V);
  if(a<0||b<0||b<a)throw new Error(`Nem találom a ${K} … ${V} jelölőket az index.html-ben.`);
  const belso=src.slice(a+K.length,b).trim();
  return {a,b,tabla:belso?JSON.parse(belso):{}};}
/* 🎽 a mez szabályai — a játék listáiból */
function mezSzabaly(src){
  const lista=nev=>{const m=new RegExp(`const ${nev}=\\[([\\s\\S]*?)\\];`).exec(src);
    if(!m)throw new Error(`Nem találom a ${nev} listát.`);
    const out=[];const re=/\{k:"([a-z]+)"/g;let x;while((x=re.exec(m[1])))out.push(x[1]);return out;};
  return {pat:lista("KIT_PATTERNS"),sleeve:lista("KIT_SLEEVES"),collar:lista("KIT_COLLARS")};}
function mezTisztit(k,MS){
  if(!k||typeof k!=="object"||Array.isArray(k))return null;
  const hex=v=>(typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v))?v.toLowerCase():null;
  const o={c1:hex(k.c1),c2:hex(k.c2),ink:hex(k.ink),
    pat:MS.pat.includes(k.pat)?k.pat:"solid",sleeve:MS.sleeve.includes(k.sleeve)?k.sleeve:"same",collar:MS.collar.includes(k.collar)?k.collar:"crew"};
  if(!o.c1||!o.c2)return null;
  if(!o.ink)o.ink="#ffffff";
  return o;}
function blokkIr(tabla){
  const k=Object.keys(tabla).sort((x,y)=>x.localeCompare(y,"hu"));
  return "{\n"+k.map((n,i)=>` ${JSON.stringify(n)}:${JSON.stringify(tabla[n])}${i<k.length-1?",":""}`).join("\n")+(k.length?"\n":"")+"}";}

(async()=>{
  const src=fs.readFileSync(HTML,"utf8");
  const SZ=jatekSzabaly(src),NEVEK=ismertNevek(src);
  const B=blokkOlvas(src),regi=JSON.stringify(B.tabla);
  const MS=mezSzabaly(src),MB=blokkOlvas(src,MKEZD,MVEG),mregi=JSON.stringify(MB.tabla);
  const mezLeg=new Map();
  const adat=await lehuz();
  /* nevenként a legfrissebb, érvényes bejegyzés */
  const legfrissebb=new Map();let elvetett=0,osszes=0;
  for(const uid of Object.keys(adat||{})){
    const ag=adat[uid];if(!ag||typeof ag!=="object")continue;
    for(const k of Object.keys(ag)){
      osszes++;
      const t=ag[k];
      if(!t||typeof t.n!=="string"||typeof t.d!=="string"||typeof t.at!=="number"){elvetett++;continue;}
      /* 🎽 ellenfél-mez */
      if(t.n.startsWith("mez:")){
        if(t.n.length<5||t.n.length>84||kulcsa(t.n)!==k){elvetett++;continue;}
        const e=mezLeg.get(k);if(!e||t.at>e.at)mezLeg.set(k,t);
        continue;}
      if(!NEVEK.has(t.n)||kulcsa(t.n)!==k){elvetett++;continue;}
      const e=legfrissebb.get(t.n);
      if(!e||t.at>e.at)legfrissebb.set(t.n,t);}}
  const T=Object.assign({},B.tabla);let uj=0,mod=0,torolt=0;
  for(const [n,t] of legfrissebb){
    let ov={};if(t.d){try{ov=tisztit(JSON.parse(t.d),SZ);}catch(e){elvetett++;continue;}}
    const volt=T[n];
    if(!Object.keys(ov).length){if(volt){delete T[n];torolt++;}continue;}
    if(!volt)uj++;else if(JSON.stringify(volt)!==JSON.stringify(ov))mod++;
    T[n]=ov;}
  if(Object.keys(T).length>MAX_JATEKOS)throw new Error(`Túl sok bejegyzés (${Object.keys(T).length}) — gyanús, nem írom be.`);
  /* 🎽 a mezek */
  const M=Object.assign({},MB.tabla);let muj=0,mmod=0,mtorolt=0;
  for(const [k,t] of mezLeg){
    let kit=null;if(t.d){try{kit=mezTisztit(JSON.parse(t.d),MS);}catch(e){kit=null;}if(!kit){elvetett++;continue;}}
    const volt=M[k];
    if(!kit){if(volt){delete M[k];mtorolt++;}continue;}
    if(!volt)muj++;else if(JSON.stringify(volt)!==JSON.stringify(kit))mmod++;
    M[k]=kit;}
  if(Object.keys(M).length>MAX_MEZ)throw new Error(`Túl sok mez (${Object.keys(M).length}) — gyanús, nem írom be.`);
  const valtA=JSON.stringify(T)!==regi,valtM=JSON.stringify(M)!==mregi,valt=valtA||valtM;
  const uzenet=`🌍 Stylist-lista: ${Object.keys(T).length} játékos (+${uj} új, ${mod} módosult, ${torolt} törölve) · 🎽 ${Object.keys(M).length} mez (+${muj} új, ${mmod} módosult, ${mtorolt} törölve)`;
  if(valt){
    /* a két blokk közül előbb a későbbit írjuk, hogy a korábbi pozíciója ne csússzon */
    const blokkok=[{a:B.a,b:B.b,K:KEZD,txt:blokkIr(T)},{a:MB.a,b:MB.b,K:MKEZD,txt:blokkIr(M)}].sort((x,y)=>y.a-x.a);
    let out=src;for(const x of blokkok)out=out.slice(0,x.a+x.K.length)+x.txt+out.slice(x.b);
    fs.writeFileSync(HTML,out);}
  console.log(`${osszes} feltöltés, ${legfrissebb.size} játékos, ${mezLeg.size} mez, ${elvetett} elvetve → ${valt?uzenet:"nincs változás"}`);
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`valtozas=${valt?1:0}\nuzenet=${uzenet}\n`);
})().catch(e=>{console.error("✗ "+(e&&e.message||e));process.exit(1);});
