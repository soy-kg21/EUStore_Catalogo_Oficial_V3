// Integration checks against a running local development server.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.CATALOG_TEST_URL||'http://localhost:5178';
const catalog=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
const p=g=>catalog.find(p=>p.commercialGroup===g);
const line=(g,n)=>({id:p(g).id,size:p(g).sizes[0],quantity:n});
let checked=0;
async function quote(lines){const r=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(lines)});assert.equal(r.status,200);return r.json()}
for(const [g,prices] of [['B1-B',[112900,105900,97700,88200,88200]],['B5-270',[97440,88480,78400,68320,68320]],['B5-CP',[114718,104925,97930,88137,88137]]])for(let n=1;n<=5;n++){const q=await quote([line(g,n)]);assert.equal(q.total,prices[n-1]*n);assert.equal(q.shipping,0);assert.equal(q.advance,false);checked++}
for(const g of ['B1-B','B2-A']){const q=await quote([line(g,6)]);assert.equal(q.total,null);assert.equal(q.rows[0].unit,null);assert.equal(q.requiresQuote,true);checked++}
for(const [g,n,unit] of [['B5-270',6,47500],['B5-270',12,43000],['B5-270',24,36000],['B5-CP',6,69700],['B5-CP',12,65300],['B5-CP',36,60000]]){const q=await quote([line(g,n)]);assert.equal(q.subtotal,n*unit);assert.equal(q.shipping,null);assert.equal(q.total,null);assert.equal(q.advance,true);checked++}
for(const [g,unit] of [['B1-F',113900],['B1-G',118400],['B2-C',114700],['B2-D',113000]]){const q=await quote([line(g,1),line('B5-270',1)]);assert.equal(q.rows[0].unit,unit);assert.equal(q.shipping,0);assert.equal(q.warehouses.length,2);checked++}
{const q=await quote([line('B1-B',5),line('B2-A',5)]);assert.equal(q.total,5*88200+5*112900);assert.equal(q.advance,false);checked++}
{const q=await quote([line('B5-270',37)]);assert.equal(q.rows[0].unit,null);checked++}
{const q=await quote([line('B5-270',1),line('B5-CP',1)]);assert.equal(q.total,193405);assert.equal(q.rows[0].unit,88480);assert.equal(q.rows[1].unit,104925);checked++}
{const q=await quote([line('B5-270',3),line('B5-CP',3)]);assert.equal(q.subtotal,3*47500+3*69700);assert.equal(q.shipping,null);checked++}
for(const [g,single,mixed] of [['B2-E',119900,116700],['B2-F',124700,119900]]){const q=await quote([line(g,1)]);assert.equal(q.rows[0].unit,single);const combo=await quote([line(g,1),line('B2-A',1)]);assert.equal(combo.rows[0].unit,mixed);const separate=await quote([line(g,1),line('B5-270',1)]);assert.equal(separate.rows[0].unit,single);checked+=3}
{const r=await fetch(base+'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{...line('B1-B',1),quantity:-1}])});assert.equal(r.status,400);checked++}
console.log(`${checked} commercial integration cases passed.`);
