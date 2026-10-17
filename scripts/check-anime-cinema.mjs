import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {cinemaFrame,cinemaScrollProgress,cinemaGeometry,cinemaPageProgress,CINEMA_SCROLL_RESISTANCE} from '../lib/anime-cinema.ts';
let checks=0;const check=(value,message)=>{assert(value,message);checks++;};
check(Math.abs(CINEMA_SCROLL_RESISTANCE/1.08-1.14)<1e-10,'hero travel is exactly 14% above the approved original resistance');
check(cinemaScrollProgress(-100,100,3000)===0,'before the film');
check(cinemaScrollProgress(1550,100,3000)===.5,'native position sets the playhead');
check(cinemaScrollProgress(3200,100,3000)===1,'normal page continues beyond the film');
for(const p of [0,.1,.25,.5,.7,.9,1]){
 const f=cinemaFrame(p);
 check(Math.abs(f.weights.reduce((a,b)=>a+b,0)-1)<1e-10,'camera blend remains continuous');
 check(f.weights.every(v=>v>=0&&v<=1),'valid blend weights');
 check(JSON.stringify(cinemaFrame(cinemaScrollProgress(100+p*3000,100,3100)))===JSON.stringify(f),'forward and reverse share the same composition');
}
for(const [width,height,commerce]of [[3840,2160,900],[2560,1440,900],[768,1024,640],[308,608,420],[320,640,410],[390,844,380],[700,900,410],[1024,768,640],[1440,900,818],[1920,1080,900]]){
 const input={width,viewport:height,header:82,commerceTop:width<=700?312:0,commerceHeight:commerce,panelHeight:300,rootTop:120};
 const g=cinemaGeometry(input),expanded=cinemaGeometry({...input,panelHeight:580});
 check(g.end>g.start&&g.distance>=2400*CINEMA_SCROLL_RESISTANCE&&g.distance<=4000*CINEMA_SCROLL_RESISTANCE,'bounded native journey with the approved slower native scroll travel');
 check(g.settle>=40&&g.settle<=72,'category settling is a short scroll interval, not a gesture lock');
 check(g.height===g.lead+g.distance+g.settle+Math.min(g.collapsed+300,g.available),'sticky handoff fits its actual visible height');
 const overflow=Math.max(0,g.collapsed+300-g.available),stickyTop=input.header-overflow;
 check(Math.abs((input.rootTop+g.height-(g.collapsed+300)-stickyTop)-(g.end+g.settle))<1e-8,'small screens release the sticky composition without extra retention');
 if(width<=700)check(g.base>=312+commerce+65,'mobile commerce has its real content height');
 check(g.start===expanded.start&&g.end===expanded.end,'filter expansion preserves the scroll timeline');
}
let previous=0;for(let y=0;y<=12000;y+=10){const p=cinemaPageProgress(y,12000,100,3200);assert(p>=previous&&p<=1);previous=p;}
check(previous===1,'global progress line completes');
const atlas=fs.readFileSync('public/anime/cinema/gojo-atlas.webp');
check(createHash('sha256').update(atlas).digest('hex')==='ec27a17d6ee8c96c943006120a1b833a2ba05dc91bcc9b1fa946bd04ef7b8a11','approved art remains unchanged');
console.log(JSON.stringify({result:'PASS',checks,mode:'native-scroll',fixedDuration:false,testedWidths:[308,320,390,700,768,1024,1440,1920,2560,3840],scope:'Timeline and geometry, not browser rendering.'}));
