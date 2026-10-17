// Executes the real controller with deterministic DOM, GSAP and frame-clock adapters.
// Covers native scrolling and cleanup, not browser layout or GPU rendering.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let checks=0;
function fixture(width=1024,height=768,reduced=false){
 let y=0,now=0,queue=new Map(),next=1,activeTrigger=null,refreshes=0;
 const events=new Map();const add=(type,fn)=>{const list=events.get(type)||new Set();list.add(fn);events.set(type,list);};const remove=(type,fn)=>events.get(type)?.delete(fn);
 class El{constructor(name='div'){this.name=name;this.style={};this.dataset={};this.inert=false;this.handlers=new Map();this.offsetHeight=0;this.offsetTop=0;this.clientWidth=width;}
  addEventListener(t,f){const a=this.handlers.get(t)||new Set();a.add(f);this.handlers.set(t,a)}removeEventListener(t,f){this.handlers.get(t)?.delete(f)}closest(s){return s.includes(this.name)?this:null}getAttribute(n){return this[n]||null}getBoundingClientRect(){return {top:this===root?120-y:0,left:0,width:this.clientWidth,height:this===header?82:parseFloat(this.style.height)||640}}
 }
 const names=['viewport','stage','commerce','panel','discover','copy-title','copy-description','copy-actions','copy','edition','label-a','label-b','selection','awake','power','collection','vertical','caption','hint'];
 const nodes=Object.fromEntries(names.map(n=>[n,new El()]));nodes.panel.offsetHeight=300;nodes.commerce.offsetTop=width<=700?312:0;nodes.commerce.offsetHeight=width<=700?400:640;
 const root=new El(),header=new El(),canvas=new El('canvas'),explore=new El('a'),shots=Array.from({length:4},()=>new El());
 const context2d=new Proxy({},{get:(_t,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true});canvas.getContext=()=>context2d;
 root.querySelector=s=>s==='canvas'?canvas:s==='[data-cinema-explore]'?explore:nodes[s.match(/data-cinema="([^"]+)"/)?.[1]];root.querySelectorAll=()=>shots;
 const observers=[];class Resize{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){}}
 const context={console,Date:class extends Date{static now(){return now}},Element:El,HTMLElement:El,CustomEvent:class{},Event:class{constructor(type){this.type=type}},requestAnimationFrame:f=>{const id=next++;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),ResizeObserver:Resize,IntersectionObserver:class{observe(){}disconnect(){}}};
 const document={hidden:false,addEventListener:(t,f)=>add('document:'+t,f),removeEventListener:(t,f)=>remove('document:'+t,f),querySelector:s=>s==='header.header'?header:null,fonts:{ready:Promise.resolve()}};
 const win={get scrollY(){return y},innerHeight:height,devicePixelRatio:1,performance:{getEntriesByType:()=>[]},matchMedia:s=>({matches:s.includes('reduced')?reduced:true,addEventListener(){},removeEventListener(){}}),addEventListener:add,removeEventListener:remove,dispatchEvent(){},scrollTo({top}){y=top;for(const f of [...events.get('scroll')||[]])f();if(activeTrigger)activeTrigger.update();}};
 context.window=win;context.document=document;
 const triggerApi={create(config){const t={progress:0,refresh(){refreshes++;this.update()},update(){this.progress=Math.max(0,Math.min(1,(y-config.start())/(config.end()-config.start())));config.onUpdate(this)},kill(){activeTrigger=null}};activeTrigger=t;return t}};
 const gsap={registerPlugin(){},timeline(){let object,config;const t={to(o,c){object=o;config=c;return t},progress(p){object.p=p;config.onUpdate?.();return t},kill(){}};return t}};
 const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const exports={};cache.set(file,exports);const custom=n=>n==='gsap'?{gsap}:n==='gsap/ScrollTrigger'?{ScrollTrigger:triggerApi}:n.startsWith('./')?load('lib/'+n.slice(2)+'.ts'):require(n);const ctx=vm.createContext({...context,exports,require:custom});new vm.Script(code,{filename:file}).runInContext(ctx);return exports;}
 const dispose=load('lib/anime-cinema-runtime.ts').mountAnimeCinema(root);
 const step=(count=1)=>{for(let i=0;i<count;i++){const batch=[...queue.values()];queue.clear();now+=1000/60;for(const f of batch)f(now)}};
 const fire=(type,props={})=>{const e={ctrlKey:false,metaKey:false,altKey:false,deltaX:0,deltaY:120,deltaMode:0,target:canvas,prevented:false,preventDefault(){this.prevented=true},...props};for(const f of [...events.get(type)||[]])f(e);return e};
 step(2);return {root,nodes,step,fire,win,dispose,observers,get y(){return y},get refreshes(){return refreshes},get listenerCount(){return [...events.values()].reduce((n,s)=>n+s.size,0)},get queuedFrames(){return queue.size},shots,clickHome(){const a=new El('a');const e={button:0,target:a,preventDefault(){}};for(const f of events.get('document:click')||[])f(e)},clickExplore(){const e={preventDefault(){}};for(const f of explore.handlers.get('click')||[])f(e)},clickPrice(){const a=new El('a');a.href='#precios';for(const f of root.handlers.get('click')||[])f({target:a});},El};
}
for(const [width,height]of [[1440,900],[1024,768],[308,608],[390,844]]){
 const f=fixture(width,height);const start=Number(f.root.dataset.journeyStart),end=Number(f.root.dataset.journeyEnd);
 assert.equal(f.root.dataset.sceneProgress,'0');assert.equal(f.shots[0].style.opacity,'1');checks++;
 for(const type of ['wheel','touchmove','keydown'])assert.equal(f.fire(type).prevented,false);checks++;
 for(const progress of [.15,.45,.82,1,.65,.25,0]){
  const y=start+(end-start)*progress;f.win.scrollTo({top:y});f.step(2);
  assert(Math.abs(Number(f.root.dataset.sceneProgress)-progress)<1e-8);assert.equal(f.y,y);checks++;
  const still=f.root.dataset.sceneProgress;f.step(600);assert.equal(f.root.dataset.sceneProgress,still);assert.equal(f.queuedFrames,0);checks++;
 }
 f.win.scrollTo({top:end+200});f.step(2);assert.equal(f.y,end+200);assert.equal(f.root.dataset.sceneProgress,'1');checks++;
 for(let i=0;i<100;i++)assert.equal(f.fire('wheel').prevented,false);checks++;
 f.win.scrollTo({top:end+1000});f.step(2);assert.equal(f.y,end+1000);checks++;
 f.win.scrollTo({top:start+(end-start)*.9});f.step(2);const p=f.root.dataset.sceneProgress;
 f.nodes.panel.offsetHeight=500;f.observers[0].cb([{target:f.nodes.panel}]);f.step(2);
 assert.equal(Number(f.root.dataset.journeyEnd),end);assert.equal(f.root.dataset.sceneProgress,p);checks++;
 f.clickHome();f.step(2);assert.equal(f.y,38);assert.equal(f.root.dataset.sceneProgress,'0');checks++;
 f.clickExplore();f.step(2);assert.equal(f.y,end);assert.equal(f.root.dataset.sceneProgress,'1');checks++;
 f.dispose();assert.equal(f.listenerCount,0);f.step(2);assert.equal(f.queuedFrames,0);checks++;
}
// A held contact and its momentum cannot count as two category gestures.
for(const [width,height]of [[1440,900],[390,844]]){
 const f=fixture(width,height),end=Number(f.root.dataset.journeyEnd);
 f.win.scrollTo({top:end});f.step(2);
 for(let n=0;n<40;n++)assert.equal(f.fire('wheel').prevented,true);checks++;
 assert.equal(f.y,end);f.step(20);
 assert.equal(f.fire('wheel').prevented,false);f.win.scrollTo({top:end+120});f.step(2);assert.equal(f.y,end+120);checks++;
 f.step(80);f.win.scrollTo({top:end});f.step(2);
 assert.equal(f.fire('wheel',{deltaY:-120}).prevented,true);f.step(20);
 assert.equal(f.fire('wheel',{deltaY:-120}).prevented,false);f.win.scrollTo({top:end-120});f.step(2);assert(Number(f.root.dataset.sceneProgress)<1);checks++;
 f.step(80);f.win.scrollTo({top:end});f.step(2);
 const swipe=(direction)=>{
  f.fire('touchstart',{touches:[{clientX:180,clientY:450}]});
  for(let n=1;n<=10;n++){f.fire('touchmove',{touches:[{clientX:180,clientY:450-direction*n*12}]});f.step();}
  f.fire('touchend',{touches:[]});
 };
 swipe(1);assert.equal(f.y,end);checks++;swipe(1);assert(f.y>end);checks++;
 f.step(80);f.win.scrollTo({top:end});f.step(2);swipe(-1);assert.equal(f.y,end);checks++;swipe(-1);assert(f.y<end);checks++;
 f.step(80);f.win.scrollTo({top:end-50});f.step(2);
 assert.equal(f.fire('wheel',{deltaY:500}).prevented,true);assert.equal(f.y,end);checks++;
 for(let n=0;n<30;n++)assert.equal(f.fire('wheel',{deltaY:80}).prevented,true);assert.equal(f.y,end);checks++;
 f.step(100);f.win.scrollTo({top:end+2000});f.step(2);assert.equal(f.y,end+2000);checks++;
 f.dispose();assert.equal(f.listenerCount,0);checks++;
}
const r=fixture(390,844,true);assert.equal(r.fire('wheel').prevented,false);assert.equal(r.root.dataset.reduced,'true');r.win.scrollTo({top:800});r.step(2);assert.equal(r.root.dataset.sceneProgress,'0');r.dispose();checks++;
console.log(`PASS: ${checks} comprobaciones del controlador real: scroll manual, pausa sin desplazamiento, reversa, rueda/táctil/teclado nativos fuera del punto de categorías, doble gesto real en categorías, salida a productos, filtros sin reinicio e Inicio local. Adaptadores de DOM y reloj; sin navegador.`);
