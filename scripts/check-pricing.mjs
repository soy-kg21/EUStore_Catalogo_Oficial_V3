// Integration checks against a running local development server.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.CATALOG_TEST_URL||'http://localhost:5178';
const catalog=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
const p=g=>catalog.find(p=>p.commercialGroup===g);
const line=(g,n)=>({id:p(g).id,size:p(g).sizes[0],quantity:n});
let checked=0;
async function quote(lines){const r=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lines)});assert.equal(r.status,200);return r.json()}
const standard=[112900,102900,93900,86900,86900];
for(const [g,prices,shipping] of [['B1-B',standard],['B2-A',standard],['B2-B',standard],['B5-270',[93400,76400,71300,61400,61400]],['B5-CP',[99000,90000,87000,85200,85200],[6000,0,0,12600,12600]]]){
 for(let n=1;n<=5;n++){
  const q=await quote([line(g,n)]),delivery=shipping?.[n-1]??0;
  assert.equal(q.total,prices[n-1]*n+delivery);assert.equal(q.shipping,delivery);assert.equal(q.advance,false);checked++;
 }
}
for(const g of ['B1-B','B2-A']){const q=await quote([line(g,6)]);assert.equal(q.total,null);assert.equal(q.rows[0].unit,null);assert.equal(q.requiresQuote,true);checked++}
for(const [g,n,unit] of [['B5-270',6,47500],['B5-270',12,43000],['B5-270',24,36000],['B5-CP',6,69700],['B5-CP',12,65300],['B5-CP',36,60000]]){const q=await quote([line(g,n)]);assert.equal(q.subtotal,n*unit);assert.equal(q.shipping,null);assert.equal(q.total,null);assert.equal(q.advance,true);checked++}
for(const [g,single,unit,peer] of [['B1-F',116900,105900,'B1-B'],['B1-G',120900,112900,'B1-B'],['B2-C',116900,105900,'B2-A'],['B2-D',117700,106900,'B2-A'],['B2-E',119900,108900,'B2-A'],['B2-F',124700,112900,'B2-A']]){
 const split=await quote([line(g,1),line('B5-270',1)]);
 assert.equal(split.rows[0].unit,single);assert.equal(split.shipping,0);assert.equal(split.dispatches.length,2);
 for(const quantity of [1,2,3,4]){
  const mixed=await quote([line(g,1),line(peer,quantity)]);
  assert.equal(mixed.rows[0].unit,unit);assert.equal(mixed.rows[1].unit,standard[quantity]);
  assert.equal(mixed.dispatches.length,1);checked++;
 }
 checked++;
}
{const q=await quote([line('B1-B',5),line('B2-A',5)]);assert.equal(q.total,10*86900);assert.equal(q.advance,false);checked++}
{const q=await quote([line('B5-270',37)]);assert.equal(q.rows[0].unit,null);checked++}
for(const [shirts,hoods,shipping,subtotal] of [[1,1,6000,166400],[2,1,8500,229600],[3,1,11000,269400],[4,1,13500,330800]]){
 const q=await quote([line('B5-270',shirts),line('B5-CP',hoods)]);
 assert.equal(q.shipping,shipping);assert.equal(q.subtotal,subtotal);assert.equal(q.total,subtotal+shipping);checked++;
}
{const q=await quote([line('B5-270',3),line('B5-CP',3)]);assert.equal(q.subtotal,3*47500+3*69700);assert.equal(q.shipping,null);checked++}
const effective=JSON.parse(await readFile(new URL('../data/recovered-publication.json',import.meta.url),'utf8'));
const imports=effective.products.filter(product=>product.section==='importadas');
assert.equal(imports.length,98);assert(!imports.some(product=>product.route.id==='EU-IMP-001'));
const shoe=imports.find(product=>product.price===148900&&product.sizes.some(v=>v.quantity===null));
const importedLine=(product,quantity)=>({id:product.route.id,size:product.sizes.find(v=>v.quantity===null).size,quantity});
for(const [quantity,unit,shipping] of [[1,148900,0],[2,137900,0],[3,134900,12000],[4,132900,15000],[5,132900,16000],[6,null,null]]){
 const q=await quote([importedLine(shoe,quantity)]);
 assert.equal(q.rows[0].unit,unit);assert.equal(q.shipping,shipping);
 assert.equal(q.total,unit===null?null:unit*quantity+shipping);assert.equal(q.advance,true);checked++;
}
{const q=await quote([importedLine(shoe,3),line('B5-CP',1)]);
 assert.deepEqual(q.dispatches.map(group=>group.shipping),[12000,6000]);assert.equal(q.shipping,18000);checked++;
}
{const r=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{...line('B1-B',1),quantity:-1}])});assert.equal(r.status,400);checked++}
const limited=imports.find(product=>product.route.id==='EU-IMP-002');
const variant=limited.sizes.find(v=>v.quantity>0&&v.quantity<100);
const legacySize=variant.size.replace(/\s+EUR$/,'');
{
 const q=await quote([{id:limited.route.id,size:legacySize,quantity:1}]);
 assert.equal(q.total,limited.price);assert.equal(q.rows[0].size,legacySize);checked++;
 const response=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([
  {id:limited.route.id,size:legacySize,quantity:variant.quantity+1},line('B5-CP',1),
 ])});
 assert.equal(response.status,409);
 assert.deepEqual((await response.json()).issues.map(issue=>[issue.id,issue.maximum]),[[limited.route.id,variant.quantity]]);checked++;
}
console.log(`${checked} commercial integration cases passed.`);
