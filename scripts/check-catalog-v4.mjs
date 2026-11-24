// Run against the local catalog with CATALOG_TEST_URL or pnpm start.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.CATALOG_TEST_URL||'http://localhost:5178';
const products=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
const publication=JSON.parse(await readFile(new URL('../data/recovered-publication.json',import.meta.url),'utf8'));
const socksGift='Medias de obsequio';
const b1Ids=new Set(publication.products.filter(product=>
  product.section==='general'&&product.commerce.bucket==='ac2c5a647314030aca259625',
).map(product=>product.route.id));
async function get(path,options){
 const response=await fetch(base+path,options);
 assert.equal(response.status,200,path);
 return response;
}
let count=0;
for(const group of ['B1-A','B1-B','B1-C','B1-D','B1-E','B1-F','B1-G','B2-A','B5-270']){
 const p=products.find(p=>p.commercialGroup===group);
 for(const quantity of [1,5,6]){
  const r=await get('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{id:p.id,size:p.sizes[0],quantity}])});
  const q=await r.json();
  assert.equal(Object.hasOwn(q.rows[0].product,'commercialGroup'),false);
  assert.equal(q.rows[0].product.benefits.includes(socksGift),group.startsWith('B1-'));
  assert.equal(q.advance,quantity>=6);
  assert.equal(q.shipping,quantity>=6?null:0);
  count++;
 }
}
const first=await (await get('/api/products?page=1')).json();
let verifiedProducts=0;
for(let page=1;page<=first.pages;page++){
 const {items}=page===1?first:await (await get('/api/products?page='+page)).json();
 for(const product of items){
  assert(!Object.hasOwn(product,'commercialGroup'),product.slug);
  const giftOccurrences=product.benefits.filter(benefit=>benefit===socksGift).length;
  if(b1Ids.has(product.id))assert.equal(giftOccurrences,1,product.slug);
  if(product.collection!=='nacionales')assert.equal(giftOccurrences,0,product.slug);
  if(product.collection==='nacionales'&&products.some(item=>item.id===product.id&&item.warehouse!=='B1')){
   assert.equal(giftOccurrences,0,product.slug);
  }
  verifiedProducts++;
 }
}
assert.equal(verifiedProducts,first.total);
const offers=await (await get('/ofertas')).text();
assert(!/\bB1-[A-G]\b/.test(offers));
assert(offers.includes('Combos+'));count++;
const sample=products.find(product=>product.slug==='mary-jane-negro-b1-052');
const detail=await (await get('/producto/'+sample.slug)).text();
assert(!detail.includes('commercialGroup'));
assert(detail.includes(socksGift));count++;
console.log(`Catálogo V4: ${count} comprobaciones de integración y ${verifiedProducts} fichas.`);
