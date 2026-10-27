/* 📈 A MÉRÉSI NAPLÓK LEHÚZÁSA A FIREBASE-BŐL (3.9.224)

   KIMONDOTT KÉRÉS: „A másodiknak lenne igazán értelme, azzal tudnánk
   automatikusan gyűjteni neked az infót, hogy azt tudd figyelembe venni
   minden későbbi nehézségi szint állító melónál."

   A játék a mérési naplót (Beállítások → 📈 Mérési napló → Automatikus
   feltöltés) a Firebase `meres/<uid>/<karrier>` ágára írja. Az ág kívülről
   NEM olvasható (tools/firebase-rules.json) — és ez így helyes. Ez a szkript
   egy SZOLGÁLTATÁSFIÓK kulcsával (admin jog) olvassa ki, NÉVTELENÍTI, és a
   repóba írható kivonatot készít belőle. A GitHub Action
   (.github/workflows/meres-szinkron.yml) naponta futtatja, és a `meres-adat`
   ágra commitolja.

   Használat:
     FIREBASE_SERVICE_ACCOUNT='<a kulcs JSON-ja>' node tools/meres/firebase-lehuz.js --ki <könyvtár>
     node tools/meres/firebase-lehuz.js --fajl <firebase-export.json> --ki <könyvtár>   (próba / kézi export)

   Környezet:
     FIREBASE_SERVICE_ACCOUNT  a szolgáltatásfiók JSON-kulcsa (a GitHub-titokból)
     FIREBASE_DB_URL           az adatbázis címe (alapból a játéké)
     FIREBASE_TOKEN_URL        csak próbához (alapból a Google OAuth végpontja)

   A KIMENET (<könyvtár>):
     meres-firebase.json   {forras:"magyah-meres", app:"firebase", nevtelen:true, karrierek:[…]}
                           — a tools/meres/osszegez.js közvetlenül olvassa
     osszegzes.txt         az összegző szöveges kimenete
     idenyek.csv           idényenként egy sor
     meccsek.csv           meccsenként egy sor (a nehézség és a motor hangolásához)
     ALLAPOT.md            mikor futott, hány játékos / karrier / idény / meccs

   NÉVTELENÍTÉS (a repó nyilvános): a játékos-, csapat-, scout- és edzőnév
   (n, nev, nevek, csapat) null lesz; a Firebase-uid és a karrier-azonosító
   (benne a világ-seed) helyett SHA-256 kivonat áll (u_…, f_…). Minden más —
   erő, helyezés, pénz, meccssorok — változatlan. */
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),https=require("https"),http=require("http");
const {execFileSync}=require("child_process");

const args=process.argv.slice(2);
const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const KI=opt("--ki")||"meres-ki";
const FAJL=opt("--fajl");
const DB_URL=(process.env.FIREBASE_DB_URL||"https://magyahok-default-rtdb.europe-west1.firebasedatabase.app").replace(/\/+$/,"");
const TOKEN_URL=process.env.FIREBASE_TOKEN_URL||"https://oauth2.googleapis.com/token";

function keres(url,o){
  return new Promise((res,rej)=>{
    const u=new URL(url),lib=u.protocol==="http:"?http:https;
    const req=lib.request(u,{method:(o&&o.method)||"GET",headers:(o&&o.headers)||{}},r=>{
      let b="";r.setEncoding("utf8");r.on("data",c=>b+=c);
      r.on("end",()=>r.statusCode>=200&&r.statusCode<300?res(b):rej(new Error(`HTTP ${r.statusCode}: ${b.slice(0,300)}`)));});
    req.on("error",rej);
    if(o&&o.body)req.write(o.body);
    req.end();});}
const b64u=x=>Buffer.from(x).toString("base64").replace(/=+$/,"").replace(/\+/g,"-").replace(/\//g,"_");
/* Google OAuth 2.0 szolgáltatásfiók-token (JWT, RS256) — külső csomag nélkül. */
async function tokenKer(sa){
  const most=Math.floor(Date.now()/1000);
  const fej=b64u(JSON.stringify({alg:"RS256",typ:"JWT"}));
  const test=b64u(JSON.stringify({iss:sa.client_email,
    scope:"https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email",
    aud:TOKEN_URL,iat:most,exp:most+3600}));
  const alair=crypto.sign("RSA-SHA256",Buffer.from(fej+"."+test),sa.private_key);
  const jwt=fej+"."+test+"."+b64u(alair);
  const body=`grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`;
  const v=JSON.parse(await keres(TOKEN_URL,{method:"POST",body,
    headers:{"content-type":"application/x-www-form-urlencoded","content-length":Buffer.byteLength(body)}}));
  if(!v.access_token)throw new Error("nincs access_token a válaszban");
  return v.access_token;}

async function lehuz(){
  if(FAJL){
    const d=JSON.parse(fs.readFileSync(FAJL,"utf8"));
    return d&&d.meres?d.meres:d;}
  const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!raw)throw new Error("Hiányzik a FIREBASE_SERVICE_ACCOUNT (a szolgáltatásfiók JSON-kulcsa).");
  const sa=JSON.parse(raw);
  const tok=await tokenKer(sa);
  const b=await keres(`${DB_URL}/meres.json`,{headers:{authorization:"Bearer "+tok}});
  return JSON.parse(b)||{};}

const kivonat=(pre,s)=>pre+crypto.createHash("sha256").update(String(s)).digest("hex").slice(0,12);
const NEV_KULCS=new Set(["n","nev","nevek","csapat"]);
function nevtelenit(x){
  if(Array.isArray(x))return x.map(nevtelenit);
  if(x&&typeof x==="object"){
    const o={};
    Object.keys(x).forEach(k=>{o[k]=NEV_KULCS.has(k)?null:nevtelenit(x[k]);});
    return o;}
  return x;}

(async()=>{
  const m=await lehuz();
  const karrierek=[];let hibas=0;
  const jatekosok=new Set();
  Object.keys(m||{}).forEach(uid=>{
    const ag=m[uid]||{};
    Object.keys(ag).forEach(kid=>{
      const rec=ag[kid];
      let d=null;
      try{d=typeof rec.d==="string"?JSON.parse(rec.d):rec.d;}catch(e){d=null;}
      if(!d||typeof d!=="object"){hibas++;return;}
      const n=nevtelenit(d);
      n.id=kivonat("f_",uid+"|"+kid);
      n.jatekos=kivonat("u_",uid);
      n.feltoltve=rec.at?new Date(rec.at).toISOString():null;
      n.appFel=rec.app||null;
      jatekosok.add(n.jatekos);
      karrierek.push(n);});});
  karrierek.sort((a,b)=>(a.t0||0)-(b.t0||0)||String(a.id).localeCompare(String(b.id)));
  fs.mkdirSync(KI,{recursive:true});
  const fo=path.join(KI,"meres-firebase.json");
  fs.writeFileSync(fo,JSON.stringify({forras:"magyah-meres",v:1,app:"firebase",nevtelen:true,karrierek},null,1));
  /* az összegző ugyanabból a fájlból */
  const osz=path.join(__dirname,"osszegez.js");
  let txt="";
  try{txt=execFileSync(process.execPath,[osz,fo,"--csv",path.join(KI,"idenyek.csv"),"--meccsek",path.join(KI,"meccsek.csv"),"--boostok",path.join(KI,"boostok.csv")],
    {encoding:"utf8",maxBuffer:64*1024*1024});}
  catch(e){txt="(az összegző hibára futott: "+String(e.message).slice(0,300)+")\n"+(e.stdout||"");}
  fs.writeFileSync(path.join(KI,"osszegzes.txt"),txt);
  let idenyek=0,meccsek=0;
  karrierek.forEach(k=>(k.sz||[]).forEach(z=>{idenyek++;meccsek+=Array.isArray(z.m)?z.m.length:0;}));
  /* az ALLAPOT.md csak akkor változik, ha az ADAT is változott — különben a
     napi futás minden nap egy üres commitot csinálna */
  const ujAdat=crypto.createHash("sha256").update(fs.readFileSync(fo)).digest("hex").slice(0,16);
  fs.writeFileSync(path.join(KI,"ALLAPOT.md"),
    `# Mérési naplók a Firebase-ből\n\n`
    +`Az adat kivonata: \`${ujAdat}\`.\n\n`
    +`| | |\n|---|---|\n|játékos (névtelen)|${jatekosok.size}|\n|karrier|${karrierek.length}|\n|idény|${idenyek}|\n|meccs-sor|${meccsek}|\n`
    +(hibas?`|olvashatatlan rekord|${hibas}|\n`:"")
    +`\nA legutóbbi feltöltés: ${karrierek.reduce((a,k)=>k.feltoltve&&k.feltoltve>a?k.feltoltve:a,"")||"—"}.\n\n`
    +`Fájlok: \`meres-firebase.json\` (a teljes, névtelenített napló), \`osszegzes.txt\`, \`idenyek.csv\`, \`meccsek.csv\`, \`boostok.csv\` (3.9.318-tól).\n`
    +`Újragenerálás: \`node tools/meres/osszegez.js meres-firebase.json --csv idenyek.csv --meccsek meccsek.csv --boostok boostok.csv\`.\n`);
  console.log(`✓ ${jatekosok.size} játékos · ${karrierek.length} karrier · ${idenyek} idény · ${meccsek} meccs-sor${hibas?` · ${hibas} olvashatatlan`:""} → ${KI}`);
})().catch(e=>{console.error("✗ "+e.message);process.exit(1);});
