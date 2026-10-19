// Real progress component with a deterministic frame clock and measured DOM reads.
// This verifies calculation, caching and cleanup; it does not measure browser FPS.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {cinemaPageProgress} from '../lib/anime-cinema.ts';
const require=createRequire(import.meta.url);
const metrics={reads:0,queries:0,rootWrites:0},effects=[],frames=new Map(),listeners=new Map();
let next=1,y=0,height=9000,headerHeight=82;
const values=new Map(),track={style:{top:'',setProperty:(key,value)=>values.set(key,value)}};
const h={style:{setProperty:()=>metrics.rootWrites++},get scrollHeight(){metrics.reads++;return height;},get clientHeight(){metrics.reads++;return 900;}};
const announcement={getBoundingClientRect(){metrics.reads++;return {bottom:38-y};}};
const header={getBoundingClientRect(){metrics.reads++;return {height:headerHeight};}};
const cinema={dataset:{enhanced:'true',reduced:'false',journeyStart:'100',journeyEnd:'3200'}};
const add=(key,fn)=>{const set=listeners.get(key)||new Set();set.add(fn);listeners.set(key,set);};
const remove=(key,fn)=>listeners.get(key)?.delete(fn);
globalThis.window={get scrollY(){return y;},addEventListener:add,removeEventListener:remove};
globalThis.document={documentElement:h,body:{},hidden:false,fonts:{ready:Promise.resolve()},addEventListener:add,removeEventListener:remove,querySelector(selector){metrics.queries++;return selector==='.announcement'?announcement:selector==='header.header'?header:cinema;}};
globalThis.requestAnimationFrame=fn=>{const id=next++;frames.set(id,fn);return id;};
globalThis.cancelAnimationFrame=id=>frames.delete(id);
let resize;
globalThis.ResizeObserver=class{constructor(fn){resize=fn;}observe(){}disconnect(){}};
const code=ts.transpileModule(fs.readFileSync(new URL('../components/store/ScrollProgress.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const exports={};new Function('require','exports',code)(name=>name==='react'?{useRef:()=>({current:track}),useEffect:fn=>effects.push(fn)}:name==='next/navigation'?{usePathname:()=>'/anime'}:name==='@/lib/anime-cinema'?{cinemaPageProgress}:require(name),exports);
exports.default();const dispose=effects[0]();await Promise.resolve();
const tick=()=>{const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn());};
const fire=type=>{for(const fn of listeners.get(type)||[])fn();};
tick();assert.equal(metrics.rootWrites,1);
metrics.reads=metrics.queries=metrics.rootWrites=0;
for(let i=0;i<120;i++){
 y=3400+i*20;fire('scroll');tick();
 assert.equal(Number(values.get('--scroll-progress')),cinemaPageProgress(y,height-900,100,3200));
}
assert.equal(metrics.reads,0);assert.equal(metrics.queries,0);assert.equal(metrics.rootWrites,0);
const old=Number(values.get('--scroll-progress'));height=14000;resize();tick();
assert(Number(values.get('--scroll-progress'))<old);
assert.equal(Number(values.get('--scroll-progress')),cinemaPageProgress(y,height-900,100,3200));
headerHeight=70;resize();tick();assert.equal(metrics.rootWrites,1);resize();tick();assert.equal(metrics.rootWrites,1);
document.hidden=true;fire('scroll');assert.equal(frames.size,0);
document.hidden=false;fire('visibilitychange');tick();
dispose();assert.equal([...listeners.values()].reduce((n,set)=>n+set.size,0),0);assert.equal(frames.size,0);
console.log('PASS: barra real en 120 frames sin lecturas DOM ni escrituras globales; recálculo al cargar más, cambio de cabecera, visibilidad y limpieza.');
