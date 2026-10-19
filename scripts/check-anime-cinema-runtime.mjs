// Executes the real controller with deterministic DOM, GSAP and frame-clock adapters.
// Covers native scrolling and cleanup, not browser layout or GPU rendering.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ts from 'typescript';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let checks=0;
function fixture(width=1024,height=768,reduced=false,artIds=[]){
 let y=0,now=0,queue=new Map(),next=1,activeTrigger=null,refreshes=0;
 const metrics={layoutReads:0,queries:0,canvasDraws:0,canvasResizes:0,styleWrites:0};
 const events=new Map();const add=(type,fn)=>{const list=events.get(type)||new Set();list.add(fn);events.set(type,list);};const remove=(type,fn)=>events.get(type)?.delete(fn);
 class El{constructor(name='div'){this.name=name;this.style=new Proxy({},{set:(target,key,value)=>{metrics.styleWrites++;target[key]=value;return true;}});this.dataset={};this.inert=false;this.handlers=new Map();this.offsetHeight=0;this.offsetTop=0;this.clientWidth=width;for(const key of ['offsetHeight','offsetTop','clientWidth']){let value=this[key];Object.defineProperty(this,key,{get(){metrics.layoutReads++;return value;},set(next){value=next;}});}}
  addEventListener(t,f){const a=this.handlers.get(t)||new Set();a.add(f);this.handlers.set(t,a)}removeEventListener(t,f){this.handlers.get(t)?.delete(f)}closest(s){return s.includes(this.name)?this:null}getAttribute(n){return this[n]||null}getBoundingClientRect(){metrics.layoutReads++;return {top:this===root?120-y:0,left:0,width:this.clientWidth,height:this===header?82:parseFloat(this.style.height)||640}}
 }
 const names=['viewport','stage','commerce','panel','discover','copy-title','copy-description','copy-actions','copy','edition','label-a','label-b','selection','awake','power','collection','vertical','caption','hint'];
 const nodes=Object.fromEntries(names.map(n=>[n,new El()]));nodes.panel.offsetHeight=300;nodes.commerce.offsetTop=width<=700?312:0;nodes.commerce.offsetHeight=width<=700?400:640;
 const root=new El(),header=new El(),canvas=new El('canvas'),explore=new El('a'),shots=Array.from({length:4},(_,i)=>{const el=new El();if(artIds[i])el.dataset.cinemaArt=artIds[i];return el;});
 const context2d=new Proxy({},{get:(_t,k)=>k==='createRadialGradient'?()=>({addColorStop(){}}):()=>{if(k==='clearRect')metrics.canvasDraws++;},set:()=>true});canvas.getContext=()=>context2d;for(const key of ['width','height']){let value=0;Object.defineProperty(canvas,key,{get:()=>value,set:next=>{metrics.canvasResizes++;value=next;}});}
 root.querySelector=s=>{metrics.queries++;return s==='canvas'?canvas:s==='[data-cinema-explore]'?explore:nodes[s.match(/data-cinema="([^"]+)"/)?.[1]];};root.querySelectorAll=()=>{metrics.queries++;return shots;};
 const observers=[];class Resize{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){}}
 const context={console,Date:class extends Date{static now(){return now}},Element:El,HTMLElement:El,CustomEvent:class{},Event:class{constructor(type){this.type=type}},requestAnimationFrame:f=>{const id=next++;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),ResizeObserver:Resize,IntersectionObserver:class{observe(){}disconnect(){}}};
 const document={hidden:false,addEventListener:(t,f)=>add('document:'+t,f),removeEventListener:(t,f)=>remove('document:'+t,f),querySelector:s=>s==='header.header'?header:null,fonts:{ready:Promise.resolve()}};
 const win={get scrollY(){return y},innerHeight:height,devicePixelRatio:1,performance:{getEntriesByType:()=>[]},matchMedia:s=>({matches:s.includes('reduced')?reduced:true,addEventListener(){},removeEventListener(){}}),addEventListener:add,removeEventListener:remove,dispatchEvent(e){for(const f of [...events.get(e.type)||[]])f(e)},scrollTo({top}){y=top;for(const f of [...events.get('scroll')||[]])f();if(activeTrigger)activeTrigger.update();}};
 context.window=win;context.document=document;
 const triggerApi={create(config){const t={progress:0,refresh(){refreshes++;this.update()},update(){this.progress=Math.max(0,Math.min(1,(y-config.start())/(config.end()-config.start())));config.onUpdate(this)},kill(){activeTrigger=null}};activeTrigger=t;return t}};
 const gsap={registerPlugin(){},timeline(){let object,config;const t={to(o,c){object=o;config=c;return t},progress(p){object.p=p;config.onUpdate?.();return t},kill(){}};return t}};
 const cache=new Map();function load(file){if(cache.has(file))return cache.get(file);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const exports={};cache.set(file,exports);const custom=n=>n==='gsap'?{gsap}:n==='gsap/ScrollTrigger'?{ScrollTrigger:triggerApi}:n.startsWith('./')?load('lib/'+n.slice(2)+'.ts'):require(n);const ctx=vm.createContext({...context,exports,require:custom});new vm.Script(code,{filename:file}).runInContext(ctx);return exports;}
 const dispose=load('lib/anime-cinema-runtime.ts').mountAnimeCinema(root);
 const step=(count=1)=>{for(let i=0;i<count;i++){const batch=[...queue.values()];queue.clear();now+=1000/60;for(const f of batch)f(now)}};
 const fire=(type,props={})=>{const e={ctrlKey:false,metaKey:false,altKey:false,deltaX:0,deltaY:120,deltaMode:0,target:canvas,prevented:false,preventDefault(){this.prevented=true},...props};for(const f of [...events.get(type)||[]])f(e);return e};
 step(2);return {root,nodes,step,fire,win,doc:document,dispose,observers,metrics,resetMetrics(){for(const key of Object.keys(metrics))metrics[key]=0;},get y(){return y},get refreshes(){return refreshes},get listenerCount(){return [...events.values()].reduce((n,s)=>n+s.size,0)},get queuedFrames(){return queue.size},shots,clickHome(){const a=new El('a');const e={button:0,target:a,preventDefault(){}};for(const f of events.get('document:click')||[])f(e)},clickExplore(){const e={preventDefault(){}};for(const f of explore.handlers.get('click')||[])f(e)},clickPrice(){const a=new El('a');a.href='#precios';for(const f of root.handlers.get('click')||[])f({target:a});},El};
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
// One uninterrupted movement crosses categories in either direction. Native
// momentum, tiny deltas and programmatic/history placement must never be parked.
for(const [width,height]of [[320,640],[390,844],[768,1024],[1440,900],[1920,1080]]){
 for(const direction of [1,-1]){
  const f=fixture(width,height),end=Number(f.root.dataset.journeyEnd);
  f.win.scrollTo({top:end-direction*30});f.step(2);
  assert.equal(f.fire('wheel',{deltaY:direction*120}).prevented,false);checks++;
  f.win.scrollTo({top:end+direction*90});f.step(2);assert.equal(f.y,end+direction*90);checks++;
  f.win.scrollTo({top:end});f.step(2);
  f.fire('touchstart',{touches:[{clientX:180,clientY:450}]});
  for(let n=1;n<=10;n++)assert.equal(f.fire('touchmove',{touches:[{clientX:180,clientY:450-direction*n*9}]}).prevented,false);checks++;
  f.fire('touchend',{touches:[]});f.win.scrollTo({top:end+direction*100});f.step(2);assert.equal(f.y,end+direction*100);checks++;
  f.win.scrollTo({top:end});f.step(2);
  assert.equal(f.fire('keydown',{key:direction>0?'ArrowDown':'ArrowUp'}).prevented,false);checks++;
  for(let n=1;n<=20;n++){assert.equal(f.fire('wheel',{deltaY:direction}).prevented,false);f.win.scrollTo({top:end+direction*n});f.step();}checks++;
  const still=f.root.dataset.sceneProgress;f.step(180);assert.equal(f.root.dataset.sceneProgress,still);assert.equal(f.queuedFrames,0);checks++;
  f.fire('popstate');f.win.scrollTo({top:end+500});f.step(2);assert.equal(f.y,end+500);checks++;
  f.dispose();assert.equal(f.listenerCount,0);checks++;
 }
}
const r=fixture(390,844,true);assert.equal(r.fire('wheel').prevented,false);assert.equal(r.root.dataset.reduced,'true');r.win.scrollTo({top:800});r.step(2);assert.equal(r.root.dataset.sceneProgress,'0');r.dispose();checks++;
// Category artwork changes on the same mounted list without resetting its scroll.
for(const width of [322,768,1440]){
 const f=fixture(width,844,false,['jordan','ghostface','canserbero','snoop']);
 const end=Number(f.root.dataset.journeyEnd);f.win.scrollTo({top:end});f.step(2);
 assert(f.shots.every(shot=>shot.dataset.cinemaArt));assert(f.shots.every(shot=>!shot.style.transform.includes('NaN')));
 const previous=f.shots[1].style.transform;f.shots[1].dataset.cinemaArt='scooby';
 for(const fn of f.root.handlers.get('eu-cinema-art-change')||[])fn();f.step(2);
 assert.notEqual(f.shots[1].style.transform,previous);assert.equal(f.y,end);assert.equal(f.root.dataset.sceneProgress,'1');
 f.dispose();assert.equal(f.root.handlers.get('eu-cinema-art-change').size,0);checks++;
}
console.log(`PASS: ${checks} comprobaciones del controlador real: scroll nativo continuo, avance y reversa con un gesto, rueda/táctil/teclado sin retención, inercia e historial sin saltos, pausa sin desplazamiento, filtros y limpieza. Adaptadores de DOM y reloj; sin navegador.`);

// Scroll the actual controller through long loaded lists. The finished hero must
// do no layout reads, canvas drawing, or DOM writes for successive list frames.
for(const width of [390,1440]){
 const f=fixture(width,900),start=Number(f.root.dataset.journeyStart),end=Number(f.root.dataset.journeyEnd);
 f.win.scrollTo({top:end+2000});f.step(2);f.resetMetrics();
 for(let i=0;i<300;i++){f.win.scrollTo({top:end+2000+i*12});f.step();}
 assert.equal(f.metrics.canvasDraws,0);assert.equal(f.metrics.layoutReads,0);assert.equal(f.metrics.queries,0);assert.equal(f.metrics.styleWrites,0);assert.equal(f.queuedFrames,0);checks+=5;
 f.win.scrollTo({top:start+(end-start)*.5});f.step(2);assert(f.metrics.canvasDraws>0);assert.equal(f.root.dataset.cinemaActive,'true');checks+=2;
 f.resetMetrics();
 for(let i=0;i<180;i++){f.win.scrollTo({top:start+(end-start)*(.1+.8*i/179)});f.step();}
 assert.equal(f.metrics.layoutReads,0);assert.equal(f.metrics.queries,0);assert(f.metrics.canvasResizes<40);checks+=3;
 f.dispose();assert.equal(f.listenerCount,0);checks++;
}
console.log('PASS: hero sin lecturas de layout, consultas DOM, dibujo ni escrituras en 300 frames de listado; reactivación al volver y buffer de canvas reutilizado.');

// Hiding a tab suspends the film; coming back restores its actual scroll frame.
const hidden=fixture(390,844);const hiddenStart=Number(hidden.root.dataset.journeyStart),hiddenEnd=Number(hidden.root.dataset.journeyEnd);
hidden.win.scrollTo({top:hiddenStart+(hiddenEnd-hiddenStart)*.45});hidden.step(2);
hidden.doc.hidden=true;hidden.fire('document:visibilitychange');hidden.resetMetrics();
hidden.win.scrollTo({top:hiddenStart+(hiddenEnd-hiddenStart)*.55});hidden.step(10);
assert.equal(hidden.metrics.canvasDraws,0);assert.equal(hidden.queuedFrames,0);assert.equal(hidden.root.dataset.cinemaActive,'false');
hidden.doc.hidden=false;hidden.fire('document:visibilitychange');hidden.step(2);
assert.equal(hidden.root.dataset.cinemaActive,'true');assert(Math.abs(Number(hidden.root.dataset.sceneProgress)-.55)<1e-8);assert(hidden.metrics.canvasDraws>0);hidden.dispose();
console.log('PASS: pausa de efectos al ocultar la pestaña y restauración de su fotograma al regresar.');
