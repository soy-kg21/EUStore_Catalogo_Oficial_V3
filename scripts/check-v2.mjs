// Integration checks: run the production server first with pnpm start.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.CATALOG_TEST_URL||'http://localhost:5178';
const products=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
let count=0;
for(const group of ['B1-A','B1-B','B1-C','B1-D','B1-E','B1-F','B1-G','B2-A','B5-270']){
 const p=products.find(p=>p.commercialGroup===group);
 for(const quantity of [1,5,6]){
  const r=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{id:p.id,size:p.sizes[0],quantity}])});
  assert.equal(r.status,200);const q=await r.json();
  assert.equal(Object.hasOwn(q.rows[0].product,'commercialGroup'),false);
  assert.equal(q.rows[0].product.benefits.includes('Medias de obsequio'),group.startsWith('B1-'));
  assert.equal(q.advance,quantity>=6);
  assert.equal(q.shipping,quantity>=6?null:0);
  count++;
 }
}
const result=await (await fetch(base+'/api/products')).json();
assert(result.items.every(p=>!Object.hasOwn(p,'commercialGroup')));count++;
const offers=await (await fetch(base+'/ofertas')).text();
assert(!/B1-[A-G]/.test(offers));
assert(offers.includes('Todas las zapatillas de B1'));count++;
const sample=products.find(p=>p.commercialGroup==='B1-F');
const detail=await (await fetch(base+'/producto/'+sample.slug)).text();
assert(!detail.includes('commercialGroup'));count++;
console.log(`${count} V2 integration cases passed.`);
