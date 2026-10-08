/* 🎚 A TÍZ FOKOZAT × ÖT BELSŐ SZINT (3.9.223) — a csomag-tábla, a játékkal
   BETŰRE AZONOS (index.html: NF_ALAP + NF_LEPESEK + nfCsomag). A próba
   (tools/fokozat-csomag-3-9-223-proba.js) összeveti a kettőt.

   A SZERKEZET:
     · a NAGY fokozat határán CSAK a célrés lép (1 → 2 → … → 10); a 6.
       fokozattól a belső szinteken is lép a célrés (−0,1);
     · a fokozaton belül a 2–5. belső szint EGY-EGY további elemet léptet
       nehezebbre (40 lépés = 10 fokozat × 4) — a sorrendben mindig a kisebb
       súlyú lépés jön előbb (pl. az akadémia-tempó a játékos-tempó előtt);
     · a téli felmérés tűrése (tel): laza +1,0 · normál +0,5 · szigorú 0 —
       a célrés fölött ennyit hagy meg télen, mielőtt a mezőny erősödik;
     · egy elem soha nem lép vissza: amit egy fokozat 5. szintje elért, azzal
       indul a következő fokozat 1. szintje is (a célrés egy fokkal nehezebb). */
"use strict";
/* a célrés: +4-től −1-ig (3.9.223); a fokozat 1. belső szintjéé, a 6.
   fokozattól minden belső szint −0,1 (6.1 = +1,4 … 10.5 = −1,0) */
const NF_CEL=[4,3.4,2.8,2.2,1.6,1.4,0.9,0.4,-0.1,-0.6];
function nfCel(nf,s){return Math.round((NF_CEL[nf-1]-(nf>=6?0.1*((s||1)-1):0))*100)/100;}
/* a legkönnyebb csomag: 1. fokozat, 1. belső szint */
const NF_ALAP={speed:"alvo",tempo:{jatekos:"turbo",penz:"turbo",taktika:"turbo",akademia:"turbo"},
  icons:"teljes",skill:"loose",scout:"off",tel:"laza"};
/* a 40 lépés, fokozatonként négy (a 2., 3., 4., 5. belső szinthez) */
const NF_LEPESEK=[
  /* 1 Homokozó    */ ["tempo.akademia","gyors"],["tempo.taktika","gyors"],["tempo.penz","gyors"],["tempo.jatekos","gyors"],
  /* 2 Kezdő       */ ["speed","lassu"],["tempo.akademia","normal"],["tempo.taktika","normal"],["tempo.penz","normal"],
  /* 3 Simaliba    */ ["tempo.jatekos","normal"],["speed","tarto"],["tel","normal"],["tempo.akademia","komotos"],
  /* 4 Haladó      */ ["tempo.taktika","komotos"],["tempo.penz","komotos"],["scout","on"],["tempo.jatekos","komotos"],
  /* 5 Nehéz       */ ["icons","ritka"],["tempo.akademia","csiga"],["tempo.taktika","csiga"],["skill","real"],
  /* 6 Profi       */ ["cel",null],["tempo.penz","csiga"],["tempo.jatekos","csiga"],["tempo.akademia","gleccser"],
  /* 7 Mesteri     */ ["icons","nagyonritka"],["tempo.taktika","gleccser"],["tempo.penz","gleccser"],["tempo.jatekos","gleccser"],
  /* 8 Legendás    */ ["tel","szigoru"],["tempo.akademia","jegkorszak"],["tempo.taktika","jegkorszak"],["cel",null],
  /* 9 Gyilkos     */ ["tempo.penz","jegkorszak"],["tempo.jatekos","jegkorszak"],["icons","ki"],["tempo.akademia","kokorszak"],
  /* 10 Semmi esély */ ["cel",null],["tempo.taktika","kokorszak"],["tempo.penz","kokorszak"],["tempo.jatekos","kokorszak"]];
function nfCsomag(nf,s){
  const c=JSON.parse(JSON.stringify(NF_ALAP));
  const n=(nf-1)*4+(s-1);
  for(let i=0;i<n;i++){const [k,v]=NF_LEPESEK[i];
    if(k==="cel")continue;   /* csak a célrés lép (a 6. fokozattól −0,1) */
    if(k.startsWith("tempo."))c.tempo[k.slice(6)]=v;else c[k]=v;}
  c.nf=nf;c.s=s;c.cel=nfCel(nf,s);
  return c;}
module.exports={NF_CEL,nfCel,NF_ALAP,NF_LEPESEK,nfCsomag};
