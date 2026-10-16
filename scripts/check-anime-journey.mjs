// Server render and actual click handlers; this is not browser/WebGL visual QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
import {ImageConfigContext} from 'next/dist/shared/lib/image-config-context.shared-runtime.js';
import {imageConfigDefault} from 'next/dist/shared/lib/image-config.js';
const require=createRequire(import.meta.url),root=path.resolve(import.meta.dirname,'..'),cache=new Map(),links=new Map();
const records=JSON.parse(fs.readFileSync(path.join(root,'data/anime-catalog.json'),'utf8')).filter(p=>!p.canonicalId);
const styles=new Proxy({},{get:(_target,name)=>String(name)});
let calls=[],location=new URL('https://local.test/anime?utm_source=prueba'),scrollCalls=0;
const browser={get location(){return location;},scrollY:935,history:{state:{preserve:'scene'},pushState(state,_unused,url){calls.push({state,url});location=new URL(url,location);},replaceState(state,_unused,url){calls.push({state,url});location=new URL(url,location);}},dispatchEvent(){},scrollTo(){scrollCalls++;}};
function load(file){
 const absolute=path.join(root,file);if(cache.has(absolute))return cache.get(absolute);
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(absolute,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,exports={};cache.set(absolute,exports);
 const resolve=name=>{
  if(name.endsWith('.module.css'))return {__esModule:true,default:styles};
  if(name==='next/link')return {__esModule:true,default:({href,children,scroll,...props})=>{if(props.onClick)links.set(href,props.onClick);return React.createElement('a',{href,...props},children);}};
  if(name==='@/lib/anime-selection')return {useAnimeSelection:()=>({rows:[{id:'EU-ANIME-125',size:'M',quantity:1}]})};
  if(name==='@/lib/anime-events')return {trackAnimeEvent(){}};
  if(name==='./AnimeQuickView')return {__esModule:true,default:()=>null};
  if(name==='@/components/ui/sheet')return {Sheet:({open,children})=>open?children:null,SheetContent:({children})=>children,SheetTitle:({children})=>children,SheetDescription:({children})=>children};
  if(name.startsWith('@/')||name.startsWith('.')){let target=name.startsWith('@/')?name.slice(2):path.relative(root,path.resolve(path.dirname(absolute),name));if(!path.extname(target))target+=fs.existsSync(path.join(root,target+'.tsx'))?'.tsx':'.ts';return load(target);}
  return require(name);
 };
 new Function('require','exports',code)(resolve,exports);return exports;
}
const {animeExperience}=load('lib/anime-experience.ts'),{animeLocationFilters}=load('lib/anime-routes.ts'),Client=load('components/anime/AnimeShopClient.tsx').default;
const counts=Object.fromEntries(['anime','cartoon','rock','urbanos'].map(line=>[line,records.filter(p=>p.line===line).length]));
const render=(pathname)=>{
 const filters=animeLocationFilters(pathname,''),experience=animeExperience[filters.linea||'shop'];
 const hero={products:experience.heroIds.map(id=>records.find(p=>p.id===id)),division:experience.eyebrow,title:experience.title,description:experience.description};
 const initialSearch='?'+new URLSearchParams({linea:filters.linea,categoria:'',q:''});
 return renderToStaticMarkup(React.createElement(ImageConfigContext.Provider,{value:{...imageConfigDefault,qualities:[75,85]}},React.createElement(Client,{products:records,initialSearch,counts,hero})));
};
let checks=0;
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),1209);checks++;
for(const pathname of ['/anime','/shop','/cartoon','/rock','/urbanas']){
 links.clear();const html=render(pathname);
 assert(html.includes('EVOLUCIÓN'));assert(html.includes('URBANA'));assert(html.includes('<canvas'));
 assert.equal((html.match(/aria-label="Líneas de Anime Shop"/g)||[]).length,1);
 assert(html.includes('aria-label="Cambiar línea entre los productos"'));
 assert(!html.includes('href="/catalogo"'));
 assert(html.indexOf('aria-label="Cambiar línea entre los productos"')>html.indexOf('id="coleccion"'));
 assert(html.includes('VER DISEÑO'));assert(html.includes('REF: '));
 for(const count of [1209,644,163,170,232])assert(html.includes(count.toLocaleString('es-CO')+' diseños'));
 assert(html.indexOf('id="anime-discover"')<html.indexOf('id="coleccion"'));
 assert(html.indexOf('id="coleccion"')<html.indexOf('id="anime-collection-title"'));
 for(const line of ['anime','cartoon','rock','urbanas'])assert(html.includes(encodeURIComponent(`/anime/universe/${line}.webp`)));
 checks++;
}
links.clear();render('/anime');globalThis.window=browser;
let prevented=false;const click=links.get('/cartoon');assert(click);
click({button:0,metaKey:false,ctrlKey:false,shiftKey:false,altKey:false,preventDefault(){prevented=true;}});
assert(prevented);assert.equal(location.pathname,'/cartoon');assert.equal(location.searchParams.get('utm_source'),'prueba');assert.equal(calls.length,1);assert.equal(calls[0].state.preserve,'scene');assert.equal(scrollCalls,0);assert.equal(window.scrollY,935);checks++;
click({button:0,metaKey:false,ctrlKey:true,shiftKey:false,altKey:false,preventDefault(){throw new Error('A new-tab click must keep its normal behavior');}});
assert.equal(calls.length,1);checks++;
assert.equal(window.scrollY,935);checks++;
console.log(`PASS: ${checks} comprobaciones del recorrido: cinco rutas renderizadas, conteos reales, selector entre productos, título fuera del hero y clic real de categoría con historial/UTM y scroll conservados. Sin navegador.`);
