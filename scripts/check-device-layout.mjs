import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {deviceLayout,DEVICE_LAYOUT_SCRIPT} from '../lib/device-layout.ts';
import {cinemaGeometry} from '../lib/anime-cinema.ts';
let checks=0;
const profiles=[
 {name:'móvil',width:390,height:844,screenWidth:390,screenHeight:844,touchPoints:5,coarse:true,phone:false,scale:1},
 {name:'móvil pequeño',width:308,height:608,screenWidth:308,screenHeight:608,touchPoints:5,coarse:true,phone:false,scale:1},
 {name:'tablet',width:980,height:1307,screenWidth:768,screenHeight:1024,touchPoints:5,coarse:true,phone:false,scale:1},
 {name:'móvil en modo ordenador',width:980,height:2121,screenWidth:390,screenHeight:844,touchPoints:5,coarse:true,phone:true,scale:1},
 {name:'modo ordenador horizontal',width:980,height:453,screenWidth:844,screenHeight:390,touchPoints:5,coarse:true,phone:true,scale:1},
 {name:'portátil táctil',width:1366,height:768,screenWidth:1366,screenHeight:768,touchPoints:10,coarse:true,phone:false,scale:1},
 {name:'PC',width:1440,height:900,screenWidth:1440,screenHeight:900,touchPoints:0,coarse:false,phone:false,scale:1},
 {name:'Full HD',width:1920,height:1080,screenWidth:1920,screenHeight:1080,touchPoints:0,coarse:false,phone:false,scale:1},
 {name:'QHD',width:2560,height:1440,screenWidth:2560,screenHeight:1440,touchPoints:0,coarse:false,phone:false,scale:4/3},
 {name:'ultrapanorámico',width:3440,height:1440,screenWidth:3440,screenHeight:1440,touchPoints:0,coarse:false,phone:false,scale:4/3},
 {name:'4K / TV',width:3840,height:2160,screenWidth:3840,screenHeight:2160,touchPoints:0,coarse:false,phone:false,scale:2}
];
for(const p of profiles){
 const result=deviceLayout(p);assert.equal(result.phoneDesktop,p.phone,p.name);assert(Math.abs(result.scale-p.scale)<.0001,p.name);checks+=2;
 const g=cinemaGeometry({width:p.width,viewport:p.height,header:82*result.scale,commerceTop:p.width<=700?312:0,commerceHeight:400*result.scale,panelHeight:300*result.scale,rootTop:120*result.scale,scale:result.scale,phoneDesktop:result.phoneDesktop});
 assert(g.end>g.start&&g.height>=g.distance&&Number.isFinite(g.height),p.name);checks++;
 if(p.phone&&p.height>p.width){assert.equal(g.base,g.available,'el hero llena la vista de escritorio vertical del teléfono');checks++;}
}
// Execute the actual pre-paint bootstrap, including an orientation/resize change.
const properties=new Map(),handlers=new Map(),root={dataset:{},style:{setProperty:(k,v)=>properties.set(k,v)}};
const window={innerWidth:980,innerHeight:2121,screen:{width:390,height:844},matchMedia:()=>({matches:true}),dispatchEvent(){},addEventListener:(k,f)=>handlers.set(k,f)};
vm.runInNewContext(DEVICE_LAYOUT_SCRIPT,{window,navigator:{maxTouchPoints:5},document:{documentElement:root},Event:class{}});
assert.equal(root.dataset.phoneDesktop,'true');assert.equal(properties.get('--eu-ui-scale'),'1.0000');checks+=2;
window.innerWidth=3840;window.innerHeight=2160;window.screen={width:3840,height:2160};handlers.get('resize')();
assert.equal(root.dataset.phoneDesktop,'false');assert.equal(properties.get('--eu-ui-scale'),'2.0000');checks+=2;
// Breakpoints stay in viewport pixels; design dimensions use the shared rem unit.
const paths=['app/globals.css','app/premium.css','app/enhancements.css','app/integrated-navigation.css','components/home/lookbook.css','components/experience/editorial-video.css','components/anime/anime.module.css','components/anime/shop-premium.module.css','components/anime/universe.module.css'];
for(const p of paths){const css=fs.readFileSync(p,'utf8');assert(css.includes('rem'),p);assert(!/@media[^\{]*\drem/.test(css),p+' conserva puntos de corte');checks+=2;}
assert(fs.readFileSync('app/device-layout.css','utf8').includes('html[data-phone-desktop=true] .header .desktop-nav{display:flex'));checks++;
console.log(JSON.stringify({result:'PASS',checks,profiles:profiles.map(p=>p.name),scope:'Clasificación, bootstrap real, geometría y reglas CSS; no es una prueba en un televisor o celular físico.'}));
