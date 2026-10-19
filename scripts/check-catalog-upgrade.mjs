// Integration checks on source modules and server rendering. No browser is used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const require=createRequire(import.meta.url),root=path.resolve(import.meta.dirname,'..'),cache=new Map();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const styles=new Proxy({},{get:(_,key)=>String(key)});
function load(file){
 const absolute=path.join(root,file);if(cache.has(absolute))return cache.get(absolute);
 if(file.endsWith('.json')){const json=JSON.parse(read(file));cache.set(absolute,json);return json;}
 const exports={};cache.set(absolute,exports);
 const code=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 const resolve=name=>{
  if(name.endsWith('.module.css'))return {__esModule:true,default:styles};
  if(name.endsWith('.css'))return {};
  if(name==='next/link')return {__esModule:true,default:({href,children,scroll,prefetch,onNavigate,...props})=>React.createElement('a',{href,...props},children)};
  if(name==='next/image')return {__esModule:true,default:({src,alt,fill,preload,priority,quality,sizes,loading,...props})=>React.createElement('img',{src,alt,...props})};
  if(name.startsWith('@/')||name.startsWith('.')){
   let target=name.startsWith('@/')?name.slice(2):path.relative(root,path.resolve(path.dirname(absolute),name));
   if(!path.extname(target))target+=fs.existsSync(path.join(root,target+'.tsx'))?'.tsx':'.ts';
   return load(target);
  }
  return require(name);
 };
 new Function('require','exports',code)(resolve,exports);return exports;
}
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const commercial=load('lib/commercial.ts'),pricing=load('lib/pricing.ts'),anime=load('lib/anime-commercial.ts');
const general=load('data/catalog.json'),records=load('data/anime-catalog.json'),policy=load('data/pricing-policy.json');
const totals=[68000,93000,126000,152000,180000];
for(let n=1;n<=48;n++){
 const expected=n<=5?totals[n-1]:n*(n<=11?32000:n<=23?29000:26000),q=anime.animeQuote(n);
 eq(q.merchandise,expected);eq(q.unit,expected/n);eq(q.advance,n>=6);eq(q.shippingPending,n>=6);eq(q.requiresHuman,false);
 eq(anime.animeQuote(n,'regular').merchandise,expected);
}
for(const n of [49,50,100,9999]){eq(anime.animeQuote(n).merchandise,null);eq(anime.animeQuote(n).requiresHuman,true);}
for(const n of [0,-1,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]){assert.throws(()=>anime.animeQuote(n));checks++;}
eq(policy.rules.B7.retail,totals.map((v,i)=>v/(i+1)));eq(policy.rules.B7.wholesale,[[6,11,32000],[12,23,29000],[24,48,26000]]);
for(const file of ['ia/catalogo-anime-shop.json','docs/meta-catalog-context.json']){
 const data=load(file);eq(data.publicCombosCOP,totals.map((total,i)=>({quantity:i+1,total})));eq(data.wholesale,[{from:6,to:11,unitCOP:32000},{from:12,to:23,unitCOP:29000},{from:24,to:48,unitCOP:26000},{from:49,humanQuote:true}]);eq(data.items.length,1209);
}
// Preserve all existing general-warehouse rules while B7 receives the new Anime policy.
const expectedGeneral={
 'B1-standard':[112900,105900,97700,88200,88200],
 'B5-270':[97440,88480,78400,68320,68320],
 'B5-CP':[114718,104925,97930,88137,88137],
};
for(const [group,prices] of Object.entries(expectedGeneral)){
 const product=general.find(p=>commercial.ruleOf(p)===commercial.rules[group]);assert(product);
 for(let n=1;n<=5;n++){
  const q=pricing.quote([{id:product.id,size:product.sizes[0],quantity:n}],general);
  eq(q.subtotal,prices[n-1]*n);eq(q.total,q.subtotal);eq(q.advance,false);
 }
}
const byGroup=group=>general.find(p=>commercial.groupOf(p)===group),line=(p,n)=>({id:p.id,size:p.sizes[0],quantity:n});
for(const [group,n,unit] of [['B5-270',6,47500],['B5-270',12,43000],['B5-270',24,36000],['B5-CP',6,69700],['B5-CP',12,65300],['B5-CP',36,60000]]){
 const q=pricing.quote([line(byGroup(group),n)],general);eq(q.subtotal,n*unit);eq(q.total,null);eq(q.shipping,null);eq(q.advance,true);
}
const mixed=pricing.quote([line(byGroup('B5-270'),1),line(byGroup('B5-CP'),1)],general);eq(mixed.subtotal,193405);
// Exercise the actual API handler without binding a local server.
const api=load('app/api/quote/route.ts');
for(const lines of [[line(byGroup('B5-270'),2)],[line(byGroup('B1-B'),5),line(byGroup('B2-A'),5)]]){
 const response=await api.POST(new Request('https://local.test/api/quote',{method:'POST',body:JSON.stringify(lines)}));eq(response.status,200);
 const result=await response.json();eq(result.subtotal,pricing.quote(lines,general).subtotal);eq('commercialGroup' in result.rows[0].product,false);
}
for(const bad of [[line(byGroup('B5-270'),-1)],[line(byGroup('B5-270'),1),line(byGroup('B5-270'),1)],[{...line(byGroup('B5-270'),1),size:'INVALID'}]]){
 const response=await api.POST(new Request('https://local.test/api/quote',{method:'POST',body:JSON.stringify(bad)}));eq(response.status,400);
}
// Inspect every combo's real product links and images in server-rendered output.
const Offers=load('app/ofertas/page.tsx').default,html=renderToStaticMarkup(await Offers());
const blocks=[...html.matchAll(/<article\b[^>]*id="combo-([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)];eq(blocks.length,4);
for(const [,category,block] of blocks){
 const links=[...block.matchAll(/href="(\/[^"#]+)"/g)].map(m=>m[1]);
 if(category==='anime'){
  eq(links.filter(l=>/^\/(anime|cartoon|rock|urbanas)\//.test(l)).length,2);assert(block.includes('93.000'));assert(block.includes('46.500'));
 }else{
  const refs=links.filter(l=>l.startsWith('/producto/')).map(l=>general.find(p=>'/producto/'+p.slug===l));eq(refs.length,2);assert(refs.every(Boolean));
  eq(new Set(refs.map(p=>p.warehouse)).size,1);assert(refs.every(p=>p.category===category));
  const q=pricing.quote(refs.map(p=>line(p,1)),general);const digits=q.subtotal.toLocaleString('es-CO');assert(block.includes(digits));checks++;
 }
 for(const match of block.matchAll(/<img[^>]+src="([^"]+)"/g)){assert(fs.existsSync(path.join(root,'public',match[1])));checks++;}
}
for(const category of ['zapatillas','conjuntos']){
 const Gateway=load('components/store/CollectionGateway.tsx').default,ComingSoon=load('components/store/CollectionComingSoon.tsx').default;
 const destination=category==='zapatillas'?'/zapatillas-importadas':'/conjuntos-buzos';
 const gateway=renderToStaticMarkup(React.createElement(Gateway,{category})),soon=renderToStaticMarkup(React.createElement(ComingSoon,{category}));
 assert(gateway.includes(`href="${destination}"`));assert(gateway.includes(`href="#catalogo-${category}"`));assert(soon.includes('Aún no hay productos publicados'));assert(!soon.includes('href="/producto/'));checks+=4;
}
const {resolveLooks}=load('lib/looks.ts'),looks=resolveLooks(general.map(commercial.withCommercial));eq(looks.length,3);
const lookbook=renderToStaticMarkup(React.createElement(load('components/home/Lookbook.tsx').default,{looks}));
for(const piece of looks[0].pieces)assert(lookbook.includes('/producto/'+piece.slug));assert(lookbook.includes('Pausar looks'));checks+=3;
// Verify the active API knowledge source matches the same public and wholesale prices.
const refApi=load('app/api/anime-reference/route.ts'),response=await refApi.GET(new Request('https://local.test/api/anime-reference?q=Gojo'));
eq(response.status,200);const facts=await response.json();eq(facts.publicCombosCOP,totals.map((total,i)=>({quantity:i+1,total})));assert(facts.conditions.includes('$26.000'));checks++;
// Both original catalogs retain their IDs and image paths.
eq(general.length,253);eq(records.length,1250);eq(records.filter(p=>!p.canonicalId).length,1209);
for(const p of general.filter(p=>p.state!=='inactive'))for(const image of p.images){assert(fs.existsSync(path.join(root,'public',image)));checks++;}
console.log(`PASS: ${checks} comprobaciones de tarifas 1–49+, unidades exactas, WhatsApp/IA, API general, separación de bodegas, combos reales, looks y nuevas extensiones sin productos.`);

// Run the actual category click + layout effect with a viewport far below the
// first row. The shorter destination must place its first row below the dock.
const slots=[],layouts=[];let cursor=0,activeFilters={linea:'rock',categoria:'',q:''};
const hookReact={...React,
 useState(initial){const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?initial():initial;return [slots[i],next=>{slots[i]=typeof next==='function'?next(slots[i]):next;}];},
 useRef(initial){const i=cursor++;return slots[i]??(slots[i]={current:initial});},
 useMemo:fn=>fn(),useCallback:fn=>fn,useDeferredValue:v=>v,useEffect(){},useLayoutEffect:fn=>layouts.push(fn),
};
const clientCode=ts.transpileModule(read('components/anime/AnimeShopClient.tsx'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const clientExports={};new Function('require','exports',clientCode)(name=>{
 if(name==='react')return hookReact;
 if(name.endsWith('.module.css'))return {__esModule:true,default:styles};
 if(name==='next/link')return {__esModule:true,default:'a'};
 if(name==='./useAnimeFilters')return {useAnimeFilters:()=>({filters:activeFilters,update:patch=>{activeFilters={...activeFilters,...patch};}})};
 if(name==='./useAnimeListNavigation')return {useAnimeListNavigation:()=>()=>{}};
 if(name==='@/lib/anime-selection')return {useAnimeSelection:()=>({rows:[],count:0})};
 if(name==='@/lib/anime-events')return {trackAnimeEvent(){}};
 if(name==='./AnimeUniverseHero'||name==='./AnimeProductCard')return {__esModule:true,default:name};
 if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
 return require(name);
},clientExports);
const source=records.filter(p=>!p.canonicalId),counts=Object.fromEntries(['anime','cartoon','rock','urbanos'].map(line=>[line,source.filter(p=>p.line===line).length]));
const clientProps={products:source,initialSearch:'',counts,hero:{products:source.slice(0,3),division:'test',title:['test','test'],description:''}};
const scrolls=[];globalThis.window={scrollY:10000,scrollTo:options=>scrolls.push(options),dispatchEvent(){}};
globalThis.document={querySelector:()=>({getBoundingClientRect:()=>({height:82})})};
function walk(node,fn){if(!node||typeof node!=='object')return;if(Array.isArray(node)){node.forEach(n=>walk(n,fn));return;}fn(node);if(node.props)walk(node.props.children,fn);}
function renderClient(){cursor=0;layouts.length=0;const tree=clientExports.default(clientProps);walk(tree,node=>{if(node.props?.ref&&typeof node.props.ref==='object')node.props.ref.current={offsetHeight:60,getBoundingClientRect:()=>({top:node.props.className==='grid'?-6500:0})};});return tree;}
let tree=renderClient();layouts.forEach(fn=>fn());eq(scrolls,[]);
let categoryLink;walk(tree,node=>{if(node.props?.href==='/cartoon'&&node.props.onClick)categoryLink=node;});assert(categoryLink);
let prevented=false;categoryLink.props.onClick({button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,preventDefault(){prevented=true;}});eq(prevented,true);eq(activeFilters.linea,'cartoon');
tree=renderClient();layouts.forEach(fn=>fn());eq(scrolls,[{top:3334,behavior:'instant'}]);
walk(tree,node=>{if(node.props?.className==='grid')eq(node.props.style.paddingTop,undefined);if(node.props?.id==='coleccion')eq(node.props.style?.minHeight,undefined);});
delete globalThis.window;delete globalThis.document;
console.log('PASS: cambio real de Rock a Cartoon desde 10.000px; primera fila visible de inmediato, sin relleno ni altura mínima heredada.');
