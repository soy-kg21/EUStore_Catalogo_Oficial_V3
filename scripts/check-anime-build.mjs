// Run against the local production build (pnpm start), or set CATALOG_TEST_URL.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publishedAnimePath} from '../lib/anime-routes.ts';

const base=process.env.CATALOG_TEST_URL||'http://127.0.0.1:5178';
const read=async file=>JSON.parse(await readFile(new URL('../data/'+file,import.meta.url),'utf8'));
const [{products},index]=await Promise.all([read('recovered-publication.json'),read('anime-index.json')]);
const paths=products.map(product=>{
 const {id,slug}=product.route;
 return {product,path:product.section==='anime'?publishedAnimePath({id,slug,line:product.line}):'/producto/'+slug};
});
assert.equal(new Set(paths.map(row=>row.path)).size,paths.length);

const errors=[];
let offset=0,passed=0;
async function fetchPage(path){
 try{return await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000)});}
 catch{return fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(45000)});}
}
await Promise.all(Array.from({length:6},async()=>{
 for(let position=offset++;position<paths.length;position=offset++){
  const {product,path}=paths[position];
  try{
   const page=await fetchPage(path);
   assert.equal(page.status,200);
   const html=await page.text();
   const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match=>JSON.parse(match[1]));
   const schema=blocks.find(record=>record['@type']==='Product');
   assert(schema,'Falta ficha comercial');
   assert.equal(schema.name,product.name);
   assert.equal(schema.offers.price,product.price);assert.equal(schema.offers.priceCurrency,'COP');
   assert.equal(new URL(schema.offers.url).pathname,path);
   const canonical=html.match(/<link rel="canonical" href="([^"]+)"/);
   assert(canonical,'Falta enlace canónico');assert.equal(new URL(canonical[1]).pathname,path);
   assert(schema.image.length,'Faltan imágenes de la ficha');
   passed++;
  }catch(error){errors.push({path,error:error.message});}
 }
}));
assert.equal(errors.length,0,JSON.stringify(errors.slice(0,20),null,2));

const byId=new Map(paths.map(row=>[row.product.route.id,row]));
for(const [alias,target] of Object.entries(index.aliases)){
 const response=await fetch(base+'/anime/'+alias.toLowerCase(),{redirect:'manual'});
 assert.equal(response.status,308,alias);
 assert.equal(new URL(response.headers.get('location'),base).pathname,byId.get(target).path,alias);
 await response.body?.cancel();
}
for(const id of ['EU-ANIME-125','EU-ANIME-483']){
 const {path,product}=byId.get(id);
 const response=await fetch(base+'/social/'+product.line+'/'+path.split('/').at(-1));
 assert.equal(response.status,200,id);
 assert.match(response.headers.get('content-type')||'',/^image\/png/);
 const image=Buffer.from(await response.arrayBuffer());
 assert.equal(image.readUInt32BE(16),1200);
 assert.equal(image.readUInt32BE(20),630);
}
console.log(`PASS: ${passed} fichas públicas con precios, fotos y enlaces canónicos, ${Object.keys(index.aliases).length} redirecciones y tarjetas para compartir.`);
