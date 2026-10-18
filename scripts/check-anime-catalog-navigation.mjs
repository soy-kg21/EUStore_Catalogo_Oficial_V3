import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes,createRequire} from 'node:module';
import ts from 'typescript';
import {animeCategorySlug,animeLines,filterAnimeProducts} from '../lib/anime-catalog-core.ts';
const require=createRequire(import.meta.url),root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8'),json=file=>JSON.parse(read(file));
const load=(file,bindings,names)=>new Function(...Object.keys(bindings),stripTypeScriptTypes(read(file)).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+`\nreturn {${names}};`)(...Object.values(bindings));
const records=json('data/anime-catalog.json'),catalog=records.filter(p=>!p.canonicalId),byId=new Map(records.map(p=>[p.id,p]));
const publicRoutes=json('data/anime-public-routes.json'),animeIndex=json('data/anime-index.json'),legacyRoutes=json('data/anime-legacy-routes.json');
const routes=load('lib/anime-routes.ts',{animeCategorySlug,animeLines,publicRoutes,animeIndex},'animeProductHref,animeFilterHref,animeLocationFilters');
const lookup=load('lib/anime-product-lookup.ts',{animeProductRecords:records,getCanonicalAnimeProduct:p=>byId.get(p.canonicalId||p.id),animePublicRoutes:publicRoutes,legacyRoutes},'resolveAnimeProduct');
let checks=0;const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
equal(records.length,1250);equal(catalog.length,1209);equal(Object.keys(animeIndex.aliases).length,41);
const expected={23:['anime','Dragon Ball'],90:['anime','Pokémon'],147:['anime','Naruto'],299:['anime','Black Clover'],343:['anime','Pokémon'],362:['anime','Pokémon'],423:['anime','Naruto'],530:['anime','Studio Ghibli'],691:['anime','Demon Slayer'],692:['anime','Demon Slayer'],722:['anime','Record of Ragnarok'],861:['cartoon','Disney'],1029:['urbanos','Tupac'],1036:['urbanos','Urbanos'],1237:['cartoon','DC Comics']};
for(const [id,[line,category]] of Object.entries(expected)){const product=byId.get('EU-ANIME-'+id.padStart(3,'0'));equal([product.line,product.category],[line,category]);}
equal(byId.get('EU-ANIME-371').category,'Dragon Ball'); // Roshi, correctly retained after viewing the actual print.
const paths=new Set();
for(const product of records){
 equal([product.material,product.weightGrams,product.fit,product.availability,product.sizes],['Algodón',180,'Tradicional','Disponible',['S','M','L','XL']]);
 assert(!/poli[eé]ster|blus[oó]n|Chocolateolate/i.test(product.name));
 const canonical=byId.get(product.canonicalId||product.id),route=publicRoutes[canonical.id];
 equal([product.line,product.category],[canonical.line,canonical.category]);
 equal(route.line,canonical.line);equal(lookup.resolveAnimeProduct(product.id).id,canonical.id);
 equal(lookup.resolveAnimeProduct(product.slug).id,canonical.id);
 if(!product.canonicalId){assert(!paths.has(route.path));paths.add(route.path);equal(lookup.resolveAnimeProduct(route.slug,product.line).id,product.id);
  for(const field of ['image','thumbnail','backdrop'])assert(fs.statSync(new URL('public'+product[field],root)).size>0);
  assert(!/Chocolateolate/.test(product.name));
 }
}
for(const [path,id] of Object.entries(legacyRoutes)){const [line,slug]=path.slice(1).split('/');equal(lookup.resolveAnimeProduct(slug,line==='urbanas'?'urbanos':line).id,id);assert.notEqual(path,publicRoutes[id].path);}
const naruto=filterAnimeProducts(catalog,{linea:'anime',categoria:'naruto',q:''});assert(naruto.length>40);assert(naruto.some(p=>p.id==='EU-ANIME-147'));assert(naruto.some(p=>p.id==='EU-ANIME-423'));
const exported=json('ia/catalogo-anime-shop.json').items;equal(exported.length,catalog.length);
for(const row of exported){const p=byId.get(row.id);equal([row.line,row.universe,row.path,row.material,row.weightGrams,row.fit,row.availability],[p.line,p.category,publicRoutes[p.id].path,'Algodón',180,'Tradicional','Disponible']);}
// Exercise storage, isolation by filters, pagination and positioning without a browser server.
const storage=new Map();globalThis.sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const nav=load('lib/anime-navigation.ts',{},'ANIME_REMEMBER_EVENT,animeNavigationKey,safeAnimeListUrl,parseAnimeSnapshot,saveAnimeList,readAnimeList,requestAnimeReturn,consumeAnimeReturn,requestAnimeProduct,consumeAnimeProduct,animeResumeTarget');
const filters={linea:'anime',categoria:'naruto',q:''},key=nav.animeNavigationKey(filters),saved={version:1,url:'/anime/naruto',key,count:144,scroll:12500,productId:'EU-ANIME-147',cardTop:230,width:1440,filterOpen:true,gridFilterOpen:true,savedAt:Date.now()};
nav.saveAnimeList(saved);equal(nav.readAnimeList(key),saved);equal(nav.readAnimeList(),saved);equal(nav.readAnimeList('otra'),null);
equal(nav.parseAnimeSnapshot({...saved,filterOffset:1000,filterFloor:1800})?.filterOffset,1000);equal(nav.parseAnimeSnapshot({...saved,filterOffset:-1}),null);equal(nav.parseAnimeSnapshot({...saved,filterFloor:Infinity}),null);
equal(nav.parseAnimeSnapshot({...saved,count:Infinity}),null);equal(nav.parseAnimeSnapshot({...saved,savedAt:Date.now()-90000000}),null);
for(const url of ['https://evil.test','//evil.test','javascript:alert(1)','/catalogo','/anime/../../evil'])equal(nav.safeAnimeListUrl(url),null);
equal(nav.safeAnimeListUrl('/anime/naruto?q=Kakashi'),'/anime/naruto?q=Kakashi');
equal(nav.animeResumeTarget(saved,{scroll:9000,cardTop:600,width:1440,header:82}),9370);
equal(nav.animeResumeTarget(saved,{scroll:9000,cardTop:600,width:390,header:70}),9510);
equal(nav.animeResumeTarget(saved,{scroll:0,width:390,header:70}),12500);
nav.requestAnimeProduct('EU-ANIME-147');equal(nav.consumeAnimeProduct('EU-ANIME-147'),true);equal(nav.consumeAnimeProduct('EU-ANIME-147'),false);
// A cached route must leave the return request for its actual destination.
nav.requestAnimeReturn('resume',saved.url,key);equal(nav.consumeAnimeReturn('otra'),null);equal(nav.consumeAnimeReturn(key)?.mode,'resume');equal(nav.consumeAnimeReturn(key),null);
const hooks=()=>{
 const effects=[],listeners=new Map(),docListeners=new Map(),frames=new Map(),scrolls=[],restored=[];let frameId=0;
 const stage={dataset:{enhanced:'false',journeyEnd:'3200'}},card={getBoundingClientRect:()=>({top:230})};
 globalThis.window={innerWidth:1440,scrollY:12500,location:{origin:'https://test.local',pathname:'/anime/naruto',search:''},addEventListener:(k,f)=>listeners.set(k,f),removeEventListener:k=>listeners.delete(k),dispatchEvent:e=>listeners.get(e.type)?.(e),scrollTo:options=>scrolls.push(options.top)};
 globalThis.document={fonts:{status:'loaded'},getElementById:id=>id.startsWith('anime-card-')?card:{getBoundingClientRect:()=>({top:3200})},querySelector:selector=>selector==='header.header'?{getBoundingClientRect:()=>({height:82})}:stage,addEventListener:(k,f)=>docListeners.set(k,f),removeEventListener:k=>docListeners.delete(k)};
 globalThis.requestAnimationFrame=fn=>{frames.set(++frameId,fn);return frameId;};globalThis.cancelAnimationFrame=id=>frames.delete(id);
 const exports={};const code=ts.transpileModule(read('components/anime/useAnimeListNavigation.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mock=name=>name==='react'?{useEffect:fn=>effects.push(fn),useRef:initial=>({current:initial})}:name==='@/lib/anime-navigation'?nav:name==='@/lib/anime-routes'?{animePublicRoutes:publicRoutes}:require(name);
 new Function('require','exports',code)(mock,exports);const prepareFilterUpdate=exports.useAnimeListNavigation({filters,count:24,filterOpen:false,gridFilterOpen:false,restore:s=>restored.push(s)});
 let cleanups=effects.map(effect=>effect());
 const tick=()=>{const entries=[...frames];frames.clear();for(const [,fn] of entries)fn();};
 return {listeners,frames,scrolls,restored,stage,tick,prepareFilterUpdate,replay:()=>{cleanups.forEach(fn=>fn?.());cleanups=effects.map(effect=>effect());},cleanup:()=>cleanups.forEach(fn=>fn?.())};
};
let h=hooks();equal(h.restored[0].count,144);h.tick();equal(h.scrolls,[]);h.cleanup(); // native history: no requested scroll
h=hooks();equal(h.restored.length,1);h.prepareFilterUpdate();h.replay();equal(h.restored.length,1);h.cleanup(); // local edits retain the current search anchor
nav.requestAnimeReturn('resume',saved.url,key);h=hooks();h.tick();equal(h.scrolls,[]);h.stage.dataset.enhanced='true';for(let i=0;i<12;i++)h.tick();assert(h.scrolls.length);assert(h.scrolls.every(top=>top===12500));equal(h.frames.size,0);h.cleanup();
nav.requestAnimeReturn('resume',saved.url,key);h=hooks();h.replay();h.stage.dataset.enhanced='true';for(let i=0;i<12;i++)h.tick();assert(h.scrolls.length);assert(h.scrolls.every(top=>top===12500));equal(h.frames.size,0);h.cleanup(); // React Strict Mode replay must preserve the return intent
nav.requestAnimeReturn('categories',saved.url,key);h=hooks();h.stage.dataset.enhanced='true';h.tick();equal(h.scrolls[0],3200);h.listeners.get('wheel')();const n=h.scrolls.length;h.tick();equal(h.scrolls.length,n);h.cleanup();
nav.saveAnimeList({...saved,scroll:0,cardTop:230});nav.requestAnimeReturn('resume',saved.url,key);h=hooks();h.stage.dataset.enhanced='true';window.scrollY=0;h.tick();equal(h.scrolls[0],3200);h.cleanup(); // a product opened in the hero returns to categories, never to the intro
delete globalThis.window;delete globalThis.document;delete globalThis.sessionStorage;delete globalThis.requestAnimationFrame;delete globalThis.cancelAnimationFrame;
console.log(`PASS: ${checks} comprobaciones de identidad, 1.250 referencias/alias, 1.209 rutas y exportaciones, diez enlaces históricos, especificaciones comunes, regreso explícito, paginación y respeto del historial nativo.`);
