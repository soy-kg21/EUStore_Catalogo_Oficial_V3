import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {cinemaFrame,createCinemaPlayback,cinemaGeometry,cinemaPageProgress,CINEMA_STOPS,CINEMA_SECONDS} from '../lib/anime-cinema.ts';
let checks=0;const check=(value,message)=>{assert(value,message);checks++;};
const player=createCinemaPlayback();
for(let i=0;i<1000;i++)player.request(1);
check(player.target===1,'fast inputs queue the film');
for(let i=0;i<60*10;i++)player.advance(1/60);
check(Math.abs(player.position-10/23)<.001,'ten seconds follow the 23-second timeline');
check(cinemaFrame(player.position).discover===0,'categories stay hidden before their chapter');
player.seek(0);player.request(1,true);let elapsed=0,positions=[];
while(player.moving&&elapsed<40){player.advance(1/60);elapsed+=1/60;positions.push(player.position);}
check(elapsed>=CINEMA_SECONDS-.01&&elapsed<CINEMA_SECONDS+.1,'full film has its intended visible running time');check(player.position===1,'film completes');check(elapsed<=23.02,'full automatic journey finishes within 23 seconds plus one render frame');
for(const stop of CINEMA_STOPS)check(positions.some(p=>Math.abs(p-stop)<.001)||stop===0,'every chapter is traversed');
const frames=new Map([0,.1,.25,.5,.7,.9,1].map(p=>[p,cinemaFrame(p)]));
player.request(-1,true);let last=1;
while(player.moving){const p=player.advance(1/60);assert(p<=last);last=p;}
check(player.position===0,'reverse returns to the exact start');for(const [p,f]of [...frames].reverse())check(JSON.stringify(cinemaFrame(p))===JSON.stringify(f),'reversible composition');
for(const p of [0,.1,.25,.5,.7,.9,1]){const f=cinemaFrame(p);check(Math.abs(f.weights.reduce((a,b)=>a+b,0)-1)<1e-10,'one coherent camera blend');check(f.weights.every(v=>v>=0&&v<=1),'valid weights');}
for(const [width,height,commerce]of [[308,608,420],[320,640,410],[390,844,380],[700,900,410],[1024,768,640],[1440,900,818],[1920,1080,900]]){
 const g=cinemaGeometry({width,viewport:height,header:82,commerceTop:width<=700?312:0,commerceHeight:commerce,panelHeight:300,rootTop:120});
 check(g.end>g.start&&g.distance>=4800,'substantial journey');
 check(g.height===g.lead+g.distance+g.collapsed+300,'no empty spacer after categories');
 if(width<=700)check(g.base>=312+commerce+65,'mobile commerce reserves its actual content height');
 const expanded=cinemaGeometry({width,viewport:height,header:82,commerceTop:width<=700?312:0,commerceHeight:commerce,panelHeight:580,rootTop:120});
 check(g.start===expanded.start&&g.distance===expanded.distance,'opening filters cannot reset chapter progress');
}
let previous=0;for(let y=0;y<=12000;y+=10){const p=cinemaPageProgress(y,12000,100,6000);assert(p>=previous&&p<=1);previous=p;}check(previous===1,'weighted global line completes');check(cinemaPageProgress(6000,12000,100,6000)===.16,'intro occupies its chapter portion');
const atlas=fs.readFileSync('public/anime/cinema/gojo-atlas.webp');check(createHash('sha256').update(atlas).digest('hex')==='ec27a17d6ee8c96c943006120a1b833a2ba05dc91bcc9b1fa946bd04ef7b8a11','approved artwork preserved byte for byte');
for(const name of ['all','anime','cartoon','rock','urbanas'])check(fs.statSync('public/anime/universe/'+name+'.webp').size>10000,'cinematic category art '+name);
const report={result:'PASS',checks,sequenceSeconds:CINEMA_SECONDS,testedWidths:[308,320,390,700,1024,1440,1920],scope:'Timeline, input-rate control, geometry and original artwork integrity; not a browser pixel/rendering test.'};
console.log(JSON.stringify(report));
