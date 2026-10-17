// Executes the real controller with deterministic DOM, GSAP and frame-clock adapters.
// Covers input gating and cleanup, not browser layout or GPU rendering.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let checks=0;
function fixture(width=1024,height=768,reduced=false,initialY=0){
 let y=initialY,now=0,queue=new Map(),next=1,activeTrigger=null,refreshes=0;
 const events=new Map();const add=(type,fn)=>{const list=events.get(type)||new Set();list.add(fn);events.set(type,list);};const remove=(type,fn)=>events.get(type)?.delete(fn);
 class El{constructor(name='div'){this.name=name;this.style={};this.dataset={};this.inert=false;this.handlers=new Map();this.offsetHeight=0;this.offsetTop=0;this.clientWidth=width;}
  addEventListener(t,f){const a=this.handlers.get(t)||new Set();a.add(f);this.handlers.set(t,a)}removeEventListener(t,f){this.handlers.get(t)?.delete(f)}closest(s){return s.includes(this.name)?this:null}getAttribute(n){return this[n]||null}setAttribute(n,v){this[n]=v}getBoundingClientRect(){return {top:this===root?120-y:0,left:0,width:this.clientWidth,height:this===header?82:parseFloat(this.style.height)||640}}
 }
 const names=['viewport','stage','commerce','panel','discover','brand-a','brand-b','copy','edition','label-a','label-b','selection','awake','power','collection','vertical','caption','hint'];
 const nodes=Object.fromEntries(names.map(n=>[n,new El()]));nodes.panel.offsetHeight=300;nodes.commerce.offsetTop=width<=700?312:0;nodes.commerce.offsetHeight=width<=700?400:640;
 const modes=[new El('button'),new El('button')];modes[0].dataset.cinemaMode='auto';modes[1].dataset.cinemaMode='manual';
 const root=new El(),header=new El(),canvas=new El('canvas'),explore=new El('a'),shots=Array.from({length:4},()=>new El());
 const context2d=new Proxy({},{get:(_t,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});canvas.getContext=()=>context2d;
 root.querySelector=s=>s==='canvas'?canvas:s==='[data-cinema-explore]'?explore:nodes[s.match(/data-cinema="([^"]+)"/)?.[1]];root.querySelectorAll=s=>s==='[data-cinema-mode]'?modes:shots;
 const observers=[];class Resize{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){}}
 const context={console,getComputedStyle:()=>({getPropertyValue:()=> '1'}),Element:El,HTMLElement:El,CustomEvent:class{},Event:class{constructor(type){this.type=type}},requestAnimationFrame:f=>{const id=next++;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),ResizeObserver:Resize,IntersectionObserver:class{observe(){}disconnect(){}}};
 const document={hidden:false,documentElement:{dataset:{}},addEventListener:add,removeEventListener:remove,querySelector:s=>s==='header.header'?header:null,fonts:{ready:Promise.resolve()}};
 const win={get scrollY(){return y},innerHeight:height,devicePixelRatio:1,performance:{getEntriesByType:()=>[],now:()=>now},matchMedia:s=>({matches:s.includes('reduced')?reduced:true,addEventListener(){},removeEventListener(){}}),addEventListener:add,removeEventListener:remove,dispatchEvent(e){for(const f of [...events.get(e.type)||[]])f(e)},scrollTo({top}){y=top;for(const f of [...events.get('scroll')||[]])f();if(activeTrigger)activeTrigger.update();}};
 context.window=win;context.document=document;
 const triggerApi={create(config){const t={progress:0,refresh(){refreshes++;this.update()},update(){this.progress=Math.max(0,Math.min(1,(y-config.start())/(config.end()-config.start())));config.onUpdate(this)},kill(){activeTrigger=null}};activeTrigger=t;return t}};
 const gsap={registerPlugin(){},timeline(){let object,config;const t={to(o,c){object=o;config=c;return t},progress(p){object.p=p;config.onUpdate();return t},kill(){}};return t}};
 const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const exports={};cache.set(file,exports);const custom=n=>n==='gsap'?{gsap}:n==='gsap/ScrollTrigger'?{ScrollTrigger:triggerApi}:n.startsWith('./')?load('lib/'+n.slice(2)+'.ts'):require(n);const ctx=vm.createContext({...context,exports,require:custom});new vm.Script(code,{filename:file}).runInContext(ctx);return exports;}
 const dispose=load('lib/anime-cinema-runtime.ts').mountAnimeCinema(root);
 const step=(count=1,frameMs=1000/60)=>{for(let i=0;i<count;i++){const batch=[...queue.values()];queue.clear();now+=frameMs;for(const f of batch)f(now)}};
 const fire=(type,props={})=>{const e={ctrlKey:false,metaKey:false,altKey:false,deltaX:0,deltaY:120,deltaMode:0,target:canvas,prevented:false,preventDefault(){this.prevented=true},...props};for(const f of [...events.get(type)||[]])f(e);return e};
 step(2);return {root,nodes,step,fire,win,dispose,observers,setMode(mode){const button=modes.find(b=>b.dataset.cinemaMode===mode);for(const f of root.handlers.get('click')||[])f({target:button});},get now(){return now},explore(){for(const f of explore.handlers.get('click')||[])f({preventDefault(){}})},get y(){return y},get refreshes(){return refreshes},get listenerCount(){return [...events.values()].reduce((n,s)=>n+s.size,0)},clickPrice(){const a=new El('a');a.href='#precios';for(const f of root.handlers.get('click')||[])f({target:a});},El};
}
for(const [width,height]of [[1024,768],[308,608]]){
 const f=fixture(width,height),end=Number(f.root.dataset.journeyEnd);
 // One gesture from the very top, without a second input, starts the whole journey.
 assert.equal(f.fire('wheel').prevented,true);checks++;
 f.step(600);assert(Math.abs(Number(f.root.dataset.sceneProgress)-10/23)<.003);assert.equal(f.root.dataset.cinemaLocked,'true');checks++;
 f.setMode('auto');assert.equal(f.root.dataset.cinemaLocked,'true');checks++;
 const p=Number(f.root.dataset.sceneProgress);f.nodes.panel.offsetHeight=500;f.observers[0].cb([{target:f.nodes.panel}]);f.step(2);assert(Number(f.root.dataset.sceneProgress)>=p);assert(Number(f.root.dataset.sceneProgress)<p+.003);checks++;
 f.step(780);assert.equal(f.root.dataset.sceneProgress,'1');assert.equal(f.root.dataset.cinemaLocked,'false');checks++;
 assert.equal(f.fire('wheel').prevented,false);f.win.scrollTo({top:Number(f.root.dataset.journeyEnd)+120});assert(f.y>end);checks++;
 f.win.scrollTo({top:Number(f.root.dataset.journeyEnd)});assert(f.fire('wheel',{deltaY:-120}).prevented);f.step(60);assert(Number(f.root.dataset.sceneProgress)<1);checks++;
 f.setMode('manual');assert.equal(f.root.dataset.cinemaMode,'manual');assert.equal(f.root.dataset.cinemaLocked,'false');const manual=Number(f.root.dataset.sceneProgress);assert.equal(f.fire('wheel').prevented,false);f.step(120);assert.equal(Number(f.root.dataset.sceneProgress),manual);checks++;
 const start=Number(f.root.dataset.journeyStart),distance=Number(f.root.dataset.journeyEnd)-start;
 f.win.scrollTo({top:start+distance*.7});assert(Math.abs(Number(f.root.dataset.sceneProgress)-.7)<.001);f.win.scrollTo({top:start+distance*.2});assert(Math.abs(Number(f.root.dataset.sceneProgress)-.2)<.001);checks++;
 f.explore();assert.equal(f.root.dataset.sceneProgress,'1');checks++;
 f.setMode('auto');f.win.scrollTo({top:start});assert(f.fire('wheel').prevented);f.step(30);f.fire('eu-anime-place-list');f.win.scrollTo({top:end+2000});assert.equal(f.y,end+2000);assert.equal(f.root.dataset.cinemaLocked,'false');checks++;
 f.clickPrice();f.win.scrollTo({top:end+2200});assert.equal(f.y,end+2200);checks++;
 f.dispose();assert.equal(f.listenerCount,0);f.step(2);checks++;
}
const slow=fixture();slow.fire('wheel');slow.step(92,250);assert.equal(slow.root.dataset.sceneProgress,'1');slow.dispose();checks++;
const history=fixture(1024,768,false,12000);assert.equal(history.root.dataset.sceneProgress,'1');assert.equal(history.fire('wheel',{deltaY:-120}).prevented,false);assert.equal(history.y,12000);history.dispose();checks++;
const touch=fixture(390,844);touch.fire('touchstart',{touches:[{clientX:180,clientY:450}]});assert(touch.fire('touchmove',{touches:[{clientX:180,clientY:400}]}).prevented);touch.fire('touchend');touch.step(1382);assert.equal(touch.root.dataset.sceneProgress,'1');touch.dispose();checks++;
const r=fixture(390,844,true);assert.equal(r.fire('wheel').prevented,false);assert.equal(r.root.dataset.reduced,'true');r.dispose();checks++;
console.log(`PASS: ${checks} comprobaciones del controlador: un gesto de rueda o táctil, 23 segundos, filtros sin reinicio, liberación, reversa, cambio a manual, scroll en ambas direcciones, retorno a productos, precios, movimiento reducido y limpieza. DOM y reloj simulados.`);
