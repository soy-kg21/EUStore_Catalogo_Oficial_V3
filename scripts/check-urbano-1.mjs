import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterAnimeProducts,readAnimeFilters} from '../lib/anime-catalog-core.ts';
const catalog=JSON.parse(await readFile(new URL('../data/anime-catalog.json',import.meta.url),'utf8'));
const review=JSON.parse(await readFile(new URL('../data/anime-urbano-1-review.json',import.meta.url),'utf8'));
const ledger=JSON.parse(await readFile(new URL('../data/anime-import-ledger.json',import.meta.url),'utf8'));
const products=catalog.filter(p=>p.releaseBatch==='2026-10-10-urbano-1');
assert.equal(products.length,183);
assert.deepEqual(Object.fromEntries(['anime','cartoon','rock','urbanos'].map(line=>[line,products.filter(p=>p.line===line).length])),{anime:2,cartoon:8,rock:0,urbanos:173});
assert.equal(new Set(products.map(p=>p.name)).size,183);
for(const item of review.review){
 const entry=ledger.find(p=>p.key==='u1-'+item.key);assert(entry);assert.equal(entry.decision,item.decision);
 if(item.decision!=='nuevo')continue;
 const p=products.find(p=>p.supplier.key===entry.key);assert(p);
 assert.equal(p.name,item.name);assert.equal(p.category,item.category);assert.equal(p.line,item.line);
 assert.equal(p.weightGrams,null);assert.equal(p.fit,'Por confirmar');assert.equal(p.isNew,true);
 assert.equal(p.material,item.supplierName.includes('POLIÉSTER')?'Poliéster':'Por confirmar');
 assert.equal(entry.catalogId,p.id);
 assert(filterAnimeProducts(catalog,readAnimeFilters('?linea='+p.line+'&q='+p.id)).some(x=>x.id===p.id));
}
assert.equal(products[0].id,'EU-ANIME-1048');assert.equal(products.at(-1).id,'EU-ANIME-1230');
assert.equal(products.filter(p=>p.category==='Terror y Cine').length,15);
console.log('PASS: octavo PDF, 183 altas, categorías, nombres, trazabilidad, materiales y continuidad de IDs.');
if(process.env.CATALOG_TEST_URL){
 const base=process.env.CATALOG_TEST_URL;
 for(const p of products){
  const detail=await fetch(base+'/anime/'+p.slug);assert.equal(detail.status,200,p.id);
  const html=await detail.text();assert(html.includes(p.id));assert(html.includes(p.name.replaceAll('&','&amp;'))||html.includes(p.name));
  const api=await (await fetch(base+'/api/search?q='+p.id)).json();assert(api.items.some(x=>x.id===p.id&&x.href==='/anime/'+p.slug),p.id);
  assert.equal((await fetch(base+p.thumbnail)).status,200,p.thumbnail);
 }
 const global=await (await fetch(base+'/catalogo?q=Goku%20Supreme')).text();assert(global.includes('/p/'));assert(global.includes('2 POR $93.000'));
 const terror=await (await fetch(base+'/anime?linea=urbanos&categoria=terror-y-cine')).text();assert(terror.includes('Pinhead Hellraiser'));assert(!terror.includes('aria-label="Ver Goku Supreme'));
 console.log('PASS: 183 fichas, 183 resultados de lupa y 183 tarjetas HTTP; búsqueda general y filtro Terror y Cine.');
}
