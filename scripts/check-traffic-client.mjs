// Regression test for the real component's effects without a browser or network.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
const source=readFileSync(new URL('../components/store/TrafficMonitor.tsx',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({dnt='0'}={}){
 const calls=[],listeners=new Map(),timers=new Map(),storage=new Map(),ref={current:null};
 let effect,cleanup,timerId=0;
 const location=new URL('https://www.evolucionurbana.store/anime?utm_campaign=prueba');
 const on=(target,name,fn)=>listeners.set(target+name,fn),off=(target,name)=>listeners.delete(target+name);
 const document={visibilityState:'visible',referrer:'https://facebook.com/secret?customer=123',addEventListener:(n,f)=>on('doc:',n,f),removeEventListener:n=>off('doc:',n)};
 const window={location,addEventListener:(n,f)=>on('win:',n,f),removeEventListener:n=>off('win:',n),setInterval:fn=>{const id=++timerId;timers.set(id,fn);return id;}};
 const exports={};
 class Element{constructor(href){this.href=href;}closest(){return this;}getAttribute(){return this.href;}}
 vm.runInNewContext(compiled,{exports,require:name=>{
  if(name==='react')return {useEffect:fn=>{effect=fn;},useRef:()=>ref};
  if(name==='next/navigation')return {usePathname:()=>location.pathname};
  throw Error('Unexpected import '+name);
 },window,document,location,navigator:{doNotTrack:dnt},sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},crypto:{randomUUID},URL,URLSearchParams,Element,Date,clearInterval:id=>timers.delete(id),fetch:async(url,init)=>{calls.push({url,...JSON.parse(init.body)});return {ok:true};}});
 const render=()=>{cleanup?.();exports.default();cleanup=effect();};render();
 return {calls,location,document,listeners,timers,render,emit:(n,target='win:')=>listeners.get(target+n)?.(),click:()=>listeners.get('doc:click')?.({target:new Element('https://wa.me/573112231940?text=private')}),stop:()=>cleanup?.()};
}
test('navigation inside Anime Shop, Back, visibility and React updates keep one session without duplicate views',()=>{
 const h=harness();
 assert.equal(h.calls.length,1);const session=h.calls[0].session;
 h.location.pathname='/cartoon';h.emit('eu-anime-filters');assert.equal(h.calls.length,2);assert.equal(h.calls[1].path,'/cartoon');
 h.emit('eu-anime-filters');h.render();assert.equal(h.calls.length,2);
 h.location.pathname='/anime';h.emit('popstate');assert.equal(h.calls.length,3);
 for(const tick of h.timers.values())tick();assert.equal(h.calls.at(-1).kind,'heartbeat');
 h.document.visibilityState='hidden';const before=h.calls.length;
 h.location.pathname='/anime/gojo-diseno-2';h.emit('eu-anime-filters');for(const tick of h.timers.values())tick();assert.equal(h.calls.length,before);
 h.document.visibilityState='visible';h.emit('visibilitychange','doc:');assert.equal(h.calls.length,before+1);assert.equal(h.calls.at(-1).kind,'view');assert.equal(h.calls.at(-1).path,'/anime/gojo-diseno-2');
 h.click();assert.equal(h.calls.at(-1).kind,'whatsapp');assert(h.calls.every(c=>c.session===session));assert(h.calls.every(c=>!c.path.includes('?')));assert(h.calls.every(c=>c.referrer==='https://facebook.com'));
 h.stop();assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
});
test('Do Not Track prevents storage, requests and listeners',()=>{
 const h=harness({dnt:'1'});assert.equal(h.calls.length,0);assert.equal(h.listeners.size,0);assert.equal(h.timers.size,0);
});
