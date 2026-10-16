import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {filterAnimeProducts,orderAnimeProducts,readAnimeFilters,animeCategorySlug} from '../lib/anime-catalog-core.ts';
import {animeCommercial} from '../lib/anime-commercial.ts';
const catalog=JSON.parse(await readFile(new URL('../data/anime-catalog.json',import.meta.url),'utf8'));
const index=JSON.parse(await readFile(new URL('../data/anime-index.json',import.meta.url),'utf8'));
const canonical=catalog.filter(p=>!p.canonicalId),ids=new Set(catalog.map(p=>p.id)),slugs=new Set(catalog.map(p=>p.slug));
assert.equal(ids.size,catalog.length);assert.equal(slugs.size,catalog.length);
for(let n=1;n<=207;n++)assert(ids.has(`EU-ANIME-${String(n).padStart(3,'0')}`),'Referencia histórica perdida');
assert.equal(index.ids.length,canonical.length);
const hashes=new Map();
for(const p of catalog){
 assert.equal(p.price,animeCommercial.unitPrice);assert.deepEqual(p.sizes,['S','M','L','XL']);
 assert(['anime','cartoon','rock','urbanos'].includes(p.line));assert(p.name.trim());
 if(p.canonicalId){const target=catalog.find(t=>t.id===p.canonicalId);assert(target&&!target.canonicalId);continue;}
 for(const field of ['image','thumbnail','backdrop'])assert((await stat(new URL('../public'+p[field],import.meta.url))).size>0,`${p.id} ${field}`);
 const hash=createHash('sha256').update(await readFile(new URL('../public'+p.image,import.meta.url))).digest('hex');
 assert(!hashes.has(hash),`Imagen repetida: ${p.id} y ${hashes.get(hash)}`);hashes.set(hash,p.id);
}
assert(canonical.filter(p=>/demon slayer|kawai slayer/i.test(p.name)).every(p=>p.line==='anime'&&p.category==='Demon Slayer'));
assert.equal(canonical.find(p=>p.id==='EU-ANIME-735').category,'Pokémon');
assert.equal(canonical.find(p=>p.id==='EU-ANIME-315').category,'Tokyo Revengers');
let blocks=0;
for(const linea of ['', 'anime','cartoon','rock','urbanos']){
 const source=filterAnimeProducts(canonical,{linea,categoria:'',q:''});const ordered=orderAnimeProducts(source);
 assert.equal(new Set(ordered.map(p=>p.id)).size,source.length);
 assert.equal(ordered.length,source.length);
 const fullBlocks=Math.min(Math.floor(source.filter(p=>p.isNew).length/19),Math.floor(source.filter(p=>!p.isNew).length/6));
 for(let k=0;k<fullBlocks;k++){assert.equal(ordered.slice(k*25,(k+1)*25).filter(p=>p.isNew).length,19);blocks++;}
 if(linea)assert(ordered.every(p=>p.line===linea));
}
const p=canonical.find(p=>p.name.includes('Bulma'));
assert(filterAnimeProducts(canonical,readAnimeFilters('?linea=anime&q=bulma')).some(x=>x.id===p.id));
assert.equal(animeCategorySlug('Pokémon'),'pokemon');
assert.equal(readAnimeFilters('?linea=incorrecta').linea,'');
const accented=canonical.find(p=>/[áéíóúñ]/i.test(p.name));
assert(filterAnimeProducts(canonical,{linea:'',categoria:'',q:accented.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}).some(x=>x.id===accented.id));
assert.equal(animeCommercial.promoTotal,99000);assert.equal(animeCommercial.promoQuantity,2);
console.log(`PASS: ${canonical.length} diseños únicos, ${catalog.length-canonical.length} alias, archivos e IDs íntegros, ofertas y ${blocks} bloques 76/24.`);
if(process.env.CATALOG_TEST_URL){
 const base=process.env.CATALOG_TEST_URL;
 for(const linea of ['anime','cartoon','rock','urbanos']){const r=await fetch(`${base}/anime?linea=${linea}`);assert.equal(r.status,200);const html=await r.text();assert(html.includes('Colecciones Anime Shop'));const cards=[...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map(m=>m[0]).filter(card=>card.includes('aria-label="Ver '));assert.equal(cards.length,24);for(const card of cards){const id=card.match(/EU-ANIME-\d+/)[0];assert.equal(canonical.find(p=>p.id===id).line,linea);}}
 for(const p of catalog.filter(p=>p.canonicalId)){const r=await fetch(base+'/anime/'+p.slug,{redirect:'manual'});assert.equal(r.status,308);assert(r.headers.get('location').endsWith(JSON.parse(await readFile(new URL('../data/anime-public-routes.json',import.meta.url),'utf8'))[p.canonicalId].path));}
 const api=await (await fetch(base+'/api/anime-products?q=Chopper')).json();assert(api.items.length>0);assert(api.items.every(p=>/^\/(anime|cartoon|rock|urbanas)\/[a-z0-9-]+$/.test(p.href)&&!Object.hasOwn(p,'supplier')));
 const fresh=canonical.find(p=>p.isNew);const r=await fetch(base+'/anime/'+fresh.slug);assert.equal(r.status,200);assert((await r.text()).includes(fresh.id));
 assert.equal((await fetch(base+'/anime/no-existe')).status,404);
 for(const q of ['Chopper','EU-ANIME-208','pokemon','Anime','Cartoon','Rock','Urbanos']){
  const r=await fetch(base+'/api/search?q='+encodeURIComponent(q));assert.equal(r.status,200);
  const data=await r.json();assert(data.total>0);assert(data.items.length>0);
  assert(data.items.every(p=>/^\/(anime|cartoon|rock|urbanas)\/[a-z0-9-]+$/.test(p.href)&&!Object.hasOwn(p,'supplier')));
  for(const p of data.items){assert(canonical.some(c=>c.id===p.id));assert.equal((await fetch(base+p.href)).status,200);}
 }
 const mixed=await (await fetch(base+'/api/search?q=camiseta')).json();
 assert(mixed.items.some(p=>/^\/(anime|cartoon|rock|urbanas)\/[a-z0-9-]+$/.test(p.href)));assert(mixed.items.some(p=>p.href.startsWith('/producto/')));
 const globalResults=await (await fetch(base+'/catalogo?q=Chopper')).text();
 assert(globalResults.includes('href="/anime/'));assert(globalResults.includes('2 POR $99.000'));
 assert.equal((await fetch(base+'/api/search?q='+'x'.repeat(101))).status,400);
 assert.equal((await (await fetch(base+'/api/search?q=referencia-inexistente-xyz')).json()).total,0);
 for(const params of ['q=Chopper&max=67000','q=Chopper&availability=confirmed']){
  const html=await (await fetch(base+'/catalogo?'+params)).text();assert(!/<article class="product-card">/.test(html));
 }
 console.log('PASS: lupa global, ambas fuentes, enlaces reales, ofertas, filtros y límite de consulta.');
 console.log('PASS: enlaces de las cuatro líneas, ficha nueva, 404 y redirecciones históricas 308.');
}
