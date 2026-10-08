#!/usr/bin/env node
/* A fokozat-szimuláció (fokozatsim.js) CSV-jéből a játék NF_KIMENET táblája:
   [feljutás%, bajnoki cím%, kiesés%, beragadás%, átlagos rés] belső szintenként.
   A mintavételi zajt monoton simítás (szomszédos sértők összevonása) veszi ki:
   egy nehezebb szint sosem mutat jobb számot, mint a könnyebb.
   HASZNÁLAT: node tools/nehezseg/kimenet-js.js tools/nehezseg/adat/fokv-P3.csv */
"use strict";
const fs=require("fs");
const rows=fs.readFileSync(process.argv[2],"utf8").trim().split("\n").slice(1).map(l=>l.split(";"));
/* oszlopok: fok;cel;speed;tempo;icons;skill;scout;tel;gAvg;fel;kies;stuck;bajnok;top;cim */
function pava(a,csokken){const b=csokken?a.map(x=>-x):a.slice();
  const bl=b.map(v=>({s:v,n:1}));let i=0;
  while(i<bl.length-1){if(bl[i].s/bl[i].n>bl[i+1].s/bl[i+1].n){bl[i].s+=bl[i+1].s;bl[i].n+=bl[i+1].n;bl.splice(i+1,1);if(i>0)i--;}else i++;}
  const o=[];bl.forEach(x=>{for(let k=0;k<x.n;k++)o.push(x.s/x.n);});return csokken?o.map(x=>-x):o;}
const col=j=>rows.map(r=>+r[j]);
const fel=pava(col(9),true),baj=pava(col(12),true),kies=pava(col(10),false),stuck=pava(col(11),false),g=pava(col(8),true);
const out=rows.map((r,i)=>[Math.round(fel[i]),Math.round(baj[i]),Math.round(kies[i]),Math.round(stuck[i]),Math.round(g[i]*10)/10]);
console.log("const NF_KIMENET=["+out.map(x=>"["+x.join(",")+"]").join(",")+"];");
