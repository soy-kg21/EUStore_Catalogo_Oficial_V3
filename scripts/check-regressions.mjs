import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../',import.meta.url)),require=createRequire(import.meta.url),ts=require('typescript'),React=require('react'),modules=new Map();
const original=JSON.parse(fs.readFileSync(path.join(root,'data/recovered-publication.json')));
const moved={...original.products.find(p=>p.route.id==='EU-ANIME-001'),line:'rock'};
const added={...moved,id:'0123456789abcdef01234567',name:'Rock de prueba',route:{id:'EU-0123456789ABCDEF01234567',slug:'rock-de-prueba-01234567'}};
const snapshot={...original,products:[...original.products.filter(p=>p.route.id!==moved.route.id),moved,added]};
function load(file){file=path.resolve(root,file);if(modules.has(file))return modules.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file));if(file.endsWith('.css'))return {__esModule:true,default:{}};const loadedModule={exports:{}};modules.set(file,loadedModule.exports);
 const localRequire=name=>{
  if(name==='react')return {...React,cache:fn=>fn};
  if(name==='./live-catalog'||name==='@/lib/live-catalog')return {getLiveCatalog:async()=>snapshot};
  if(name.endsWith('AnimeProductDetail'))return {__esModule:true,default:()=>null};
  if(name.startsWith('.')||name.startsWith('@/')){let target=name.startsWith('@/')?path.join(root,name.slice(2)):path.resolve(path.dirname(file),name);if(!fs.existsSync(target))target=['.ts','.tsx','.mjs','.json'].map(suffix=>target+suffix).find(fs.existsSync)||target;return load(target);}return require(name);
 };
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',code)(localRequire,loadedModule,loadedModule.exports);modules.set(file,loadedModule.exports);return loadedModule.exports;
}
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const live=load('lib/live-products.ts'),routing=load('lib/anime-routes.ts'),products=await live.getAnimeProducts(),created=products.find(p=>p.id===added.route.id);
eq(routing.animeProductHref(created),'/rock/rock-de-prueba-01234567');eq((await live.resolveLiveAnimeProduct('rock-de-prueba-01234567','rock')).id,created.id);
eq((await live.resolveLiveAnimeProduct('abuelo-de-goku','anime')).line,'rock');
eq(load('data/anime-products.ts').toAnimeClientProduct(created).publicPath,created.publicPath);
const api=load('app/api/anime-quote/route.ts'),p=products.find(p=>p.id===moved.route.id);
for(const [quantity,total]of [[1,68000],[2,93000],[3,126000],[4,152000],[5,180000],[6,192000],[12,348000],[24,624000],[49,null]]){const r=await api.POST(new Request('http://test.local/api/anime-quote',{method:'POST',body:JSON.stringify([{id:p.id,size:'M',quantity}])}));eq(r.status,200);eq((await r.json()).quote.merchandise,total);}
for(const rows of [[{id:p.id,size:'M',quantity:0}],[{id:p.id,size:'INVALID',quantity:1}],[{id:p.id,size:'M',quantity:1},{id:p.id,size:'M',quantity:1}]])eq((await api.POST(new Request('http://test.local/api/anime-quote',{method:'POST',body:JSON.stringify(rows)}))).status,400);
const custom={...p,reference:'CUSTOM-TEST-ABC'},search=load('lib/catalog-search.ts');eq(search.searchCatalog([],[custom],{q:custom.reference}).total,1);eq(search.searchCatalog([],[custom],{availability:'confirmed'}).total,1);
eq(p.availability,'Confirmado');eq(p.material,'Algodón peinado 100%');eq(p.fit,'Tradicional (clásica)');eq(p.weightGrams,180);
const {toLiveGeneral}=load('lib/live-general-product.ts'),{quoteLive}=load('lib/live-pricing.ts'),imported=toLiveGeneral(original.products.find(p=>p.section==='importadas'));
for(const quantity of [1,2,6,12]){const q=quoteLive([{id:imported.id,size:imported.sizes[0],quantity}],[{...imported,variants:imported.variants.map(v=>({...v,quantity:null}))}]);eq(q.total,quantity*imported.price);eq(q.shipping,0);eq(q.advance,true);}
const baseline=JSON.parse(fs.readFileSync(path.join(root,'data/catalog.json')));for(const item of baseline.filter(p=>p.warehouse==='B5')){const client=load('lib/commercial.ts').withCommercial(item);eq(client.weight,item.weight);eq(client.material,item.material);}
const assets=load('data/catalog-assets.json');
for(const item of original.products.filter(p=>p.section==='importadas')){
 const mapped=toLiveGeneral(item);
 for(const source of Object.values(item.images)){
  const sha=/^\/api\/catalog-media\/([a-f0-9]{64})$/.exec(source)?.[1];
  if(sha&&assets[sha]){eq(mapped.images.includes(assets[sha]),true);eq(fs.existsSync(path.join(root,'public',assets[sha])),true);}
 }
}
const uploaded={...original.products.find(p=>p.section==='importadas'),images:{front:'/api/catalog-media/'+'a'.repeat(64)}};
if(!assets['a'.repeat(64)])eq(toLiveGeneral(uploaded).images[0],uploaded.images.front);
const content=load('lib/product-content.ts'),config=load('lib/config.ts'),origin='https://www.evolucionurbana.store';
const inquiry=content.productInquiryMessage(imported,imported.sizes[0],origin);
eq(inquiry.includes('interesado en:\n\nProducto:'),true);
eq(inquiry.includes('\\n'),false);
eq(new URL(config.wa(inquiry)).searchParams.get('text'),inquiry);
const q=quoteLive([{id:imported.id,size:imported.sizes[0],quantity:1}],[{...imported,variants:imported.variants.map(v=>({...v,quantity:null}))}]);
const multi=content.cartInquiryMessage({...q,rows:[...q.rows,...q.rows]},origin,'Pago anticipado.');
eq(multi.includes('\n\n2. Producto:'),true);
eq(multi.includes('\\n'),false);
eq(multi.includes('\n\nMi ciudad es:\n\n'),true);
eq(new URL(config.wa(multi)).searchParams.get('text'),multi);
console.log('PASS: '+checks+' regresiones de cotización, rutas, políticas, imágenes y párrafos de WhatsApp.');
