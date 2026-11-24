/* 🐞 A FEJLESZTŐI JEGYZETEK LEHÚZÁSA A FIREBASE-BŐL (1.0.12.3.00)

   KIMONDOTT KÉRÉS: „ezt felnyomnánk firebase-n keresztül a repóba, akárcsak a mérési adatokat, és
   abból időről időre, amikor újabb kérésekkel jövök itt hozzád, akkor kiolvasnád a
   bug-reportjaimat, ötleteimet, és amellett, amit kérek, megvalósítanád azokat."

   A játék (🐞 gomb, fejlesztői módban) a jegyzetet a Firebase `devjegyzet/<uid>/<id>` ágára írja.
   Az ág kívülről NEM olvasható (tools/firebase-rules.json). Ez a szkript a mérési szinkron
   szolgáltatásfiókjával (FIREBASE_SERVICE_ACCOUNT) olvassa ki, és a repóba írható kivonatot
   készít. A GitHub Action (.github/workflows/devjegyzet-szinkron.yml) futtatja, és a
   `dev-jegyzetek` ágra commitolja. A feldolgozás: .claude/skills/jegyzetek/SKILL.md.

   Használat:
     FIREBASE_SERVICE_ACCOUNT='<kulcs JSON>' node tools/devjegyzet/lehuz.js --ki <könyvtár>
     node tools/devjegyzet/lehuz.js --fajl <firebase-export.json> --ki <könyvtár>   (próba / kézi export)

   A KIMENET (<könyvtár>):
     jegyzetek.json   {forras:"magyah-devjegyzet", jegyzetek:[…]} — a legújabb elöl
     JEGYZETEK.md     ember által olvasható lista (a legújabb elöl), a hellyel és a szöveggel

   A Firebase-uid helyett SHA-256 kivonat áll (u_…). A jegyzet szövege VÁLTOZATLAN — ha a repó
   nyilvános, a `dev-jegyzetek` ág is az. */
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto"),https=require("https"),http=require("http");

const args=process.argv.slice(2);
const opt=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:null;};
const KI=opt("--ki")||"devjegyzet-ki";
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
  if(FAJL){const d=JSON.parse(fs.readFileSync(FAJL,"utf8"));return d&&d.devjegyzet?d.devjegyzet:d;}
  const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
  if(!raw)throw new Error("Hiányzik a FIREBASE_SERVICE_ACCOUNT (a szolgáltatásfiók JSON-kulcsa).");
  const tok=await tokenKer(JSON.parse(raw));
  const b=await keres(`${DB_URL}/devjegyzet.json`,{headers:{authorization:"Bearer "+tok}});
  return JSON.parse(b)||{};}

const kivonat=(pre,s)=>pre+crypto.createHash("sha256").update(String(s)).digest("hex").slice(0,12);
const PRIO={magas:"🔥 sürgős",normal:"normál",rarer:"🧊 ráér"};
const md=s=>String(s==null?"":s).replace(/\r/g,"");

(async()=>{
  const m=await lehuz();
  const lista=[];let hibas=0;
  Object.keys(m||{}).forEach(uid=>{
    const ag=m[uid]||{};
    Object.keys(ag).forEach(id=>{
      const rec=ag[id];let d=null;
      try{d=typeof rec.d==="string"?JSON.parse(rec.d):rec.d;}catch(e){d=null;}
      if(!d||typeof d!=="object"){hibas++;return;}
      lista.push({id,szerzo:kivonat("u_",uid),at:d.at||rec.at||0,ido:new Date(d.at||rec.at||0).toISOString(),
        app:d.app||rec.app||null,tipus:d.tipus||null,tipusNev:d.tipusNev||null,prio:d.prio||"normal",
        szoveg:md(d.szoveg),hely:d.hely||null});});});
  lista.sort((a,b)=>b.at-a.at);
  fs.mkdirSync(KI,{recursive:true});
  fs.writeFileSync(path.join(KI,"jegyzetek.json"),JSON.stringify({forras:"magyah-devjegyzet",v:1,db:lista.length,jegyzetek:lista},null,1));
  let t=`# 🐞 Fejlesztői jegyzetek\n\n${lista.length} jegyzet${hibas?` · ${hibas} olvashatatlan`:""} · a legújabb elöl.\n`
    +`A feldolgozottakat a fő ágon a \`tools/devjegyzet/kezelt.json\` tartja nyilván.\n`;
  lista.forEach(j=>{
    const h=j.hely||{};
    t+=`\n---\n\n## ${j.id} — ${md(j.tipusNev||j.tipus)} · ${PRIO[j.prio]||j.prio}\n\n`
      +`- **Mikor:** ${j.ido} · v${md(j.app)}\n`
      +`- **Hol:** ${md(h.leiras||"?")}\n`
      +(h.idenyFordulo?`- **Állapot:** ${md(h.idenyFordulo)}${h.kutSzakasz?` · Kezdő út: ${md(h.kutSzakasz)}`:""}${h.lecke?` · lecke: ${md(h.lecke.id)} ${h.lecke.lepes+1}. lépés`:""}\n`:"")
      +`- **Nézet:** ${md(h.nezet||"?")}${h.tema?` · téma: ${md(h.tema)}`:""} · képernyők: ${(h.fo||[]).join(", ")||"—"}`
      +((h.ablak||[]).length?` · ablakok: ${h.ablak.map(a=>a.id+(a.cim?` („${md(a.cim)}”)`:"")).join(", ")}`:"")+`\n\n`
      +md(j.szoveg).split("\n").map(x=>"> "+x).join("\n")+"\n";});
  fs.writeFileSync(path.join(KI,"JEGYZETEK.md"),t);
  console.log(`✓ ${lista.length} jegyzet${hibas?` · ${hibas} olvashatatlan`:""} → ${KI}`);
})().catch(e=>{console.error("✗ "+e.message);process.exit(1);});
