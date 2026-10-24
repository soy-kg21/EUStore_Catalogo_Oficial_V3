import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {toLiveGeneral,withCatalogCollection} from '../lib/live-general-product.ts';
import {catalogCollections,categoryProducts,productCollectionPath} from '../lib/catalog-collections.ts';
import {queryProducts} from '../lib/product-query.ts';
import {productRecommendations} from '../lib/product-recommendations.ts';
import {publicProduct} from '../lib/product-display.ts';
import {quoteLive} from '../lib/live-pricing.ts';
import {mergePublishedProducts} from '../lib/publication-overlay.ts';
import {validateSnapshot} from '../lib/catalog-sync-core.mjs';

const bucket=warehouse=>createHash('sha256').update('eustore-bucket:'+warehouse).digest('hex').slice(0,24);
const make=(warehouse,number,category='estilo propio')=>({id:number.toString(16).padStart(24,'0'),name:'Referencia '+number,section:warehouse==='B7'?'anime':warehouse==='B4'?'importadas':'general',category,line:'',brand:'Marca de prueba',color:'negro',description:'Descripción pública',labels:[],price:number*10000,regularPrice:null,position:number,sizeSystem:['B5','B6','B7'].includes(warehouse)?'LETRAS':'EU',benefits:'Consulta condiciones',materials:'',conditions:'Disponibilidad por confirmar',payment:'Consulta opciones',sizes:[{size:['B5','B6','B7'].includes(warehouse)?'M':'40',quantity:10}],images:{principal:'/api/catalog-media/'+'a'.repeat(64),detalle:'/api/catalog-media/'+'b'.repeat(64)},route:{id:'EU-PUBLIC-'+number,slug:'referencia-'+number},commerce:{bucket:bucket(warehouse),rule:null,quoteFrom:null,shippingFrom:warehouse==='B3'?4:6,advance:warehouse==='B4'},extras:{isNew:false,fit:'',weight:null,featured:false}});
const raw=[make('B1',1),make('B2',2),make('B3',3),make('B4',4),make('B5',5,'Camisetas oversize 270g'),make('B5',6,'Conjuntos'),make('B6',7,'buzos y sudaderas'),make('B7',8,'Universo')];
const wire=validateSnapshot({schema:'eustore-sync-v1',revision:randomUUID(),createdAt:new Date().toISOString(),partial:true,products:raw});
const products=wire.products.filter(p=>p.section!=='anime').map(toLiveGeneral);

test('B1, B2 y B3 comparten nacionales; las otras líneas permanecen separadas',()=>{
  assert.deepEqual(categoryProducts(products,'zapatillas').map(p=>p.id),['EU-PUBLIC-1','EU-PUBLIC-2','EU-PUBLIC-3']);
  assert.equal(products.find(p=>p.id==='EU-PUBLIC-4').collection,'importadas');
  assert.equal(products.find(p=>p.id==='EU-PUBLIC-5').collection,'oversize');
  assert.equal(products.find(p=>p.id==='EU-PUBLIC-6').collection,'conjuntos-cortos');
  assert.equal(products.find(p=>p.id==='EU-PUBLIC-7').collection,'conjuntos-buzos');
  assert.deepEqual(categoryProducts(products,'conjuntos').map(p=>p.id),['EU-PUBLIC-6']);
  assert.throws(()=>toLiveGeneral(wire.products.find(p=>p.section==='anime')));
});
test('B6 se reconoce por su agrupación aunque su categoría anterior diga buzos o conjuntos',()=>{
  for(const category of ['buzos','sudaderas','conjuntos','Colección propia']){
    const p=toLiveGeneral(make('B6',9,category));assert.equal(p.category,'conjuntos');assert.equal(p.collection,'conjuntos-buzos');assert.equal(productCollectionPath(p),'/conjuntos-buzos');
  }
  assert.equal(toLiveGeneral(make('B5',9,'Camiseta + pantaloneta')).collection,'conjuntos-cortos');
});
test('Nacionales heredadas conservan IDs, fotografías, precios y sus bodegas internas',()=>{
  const baseline=JSON.parse(readFileSync(new URL('../data/catalog.json',import.meta.url)));
  const mapped=baseline.map(withCatalogCollection),national=categoryProducts(mapped,'zapatillas');
  assert.equal(national.length,baseline.filter(p=>['B1','B2','B3'].includes(p.warehouse)&&p.category==='zapatillas').length);
  for(let i=0;i<baseline.length;i++)for(const key of ['id','slug','price','warehouse','images','sizes'])assert.deepEqual(mapped[i][key],baseline[i][key]);
  const old={...baseline[0],warehouse:'B3',category:'calzado'},updated=withCatalogCollection(old);assert.equal(updated.collection,'nacionales');assert.equal(updated.category,'zapatillas');
  assert.ok(national.every(p=>['B1','B2','B3'].includes(p.warehouse)));
});
test('Búsqueda y filtros encuentran B3, importadas y B6 con sus tallas originales',()=>{
  assert.equal(queryProducts(products,{q:'zapatillas nacionales'}).total,3);
  assert.equal(queryProducts(products,{q:'zapatillas importadas'}).total,1);
  assert.equal(queryProducts(products,{q:'buzos sudaderas',size:'M',brand:'Marca de prueba',color:'negro',max:'70000',availability:'confirmed'}).total,1);
  assert.equal(queryProducts(products,{q:'buzos sudaderas',max:'60000'}).total,0);
  assert.equal(queryProducts(products,{q:'buzos sudaderas',size:'40'}).total,0);
  const national=categoryProducts(products,'zapatillas');assert.equal(queryProducts(national,{sort:'price-desc'}).items[0].id,'EU-PUBLIC-3');
});
test('La navegación y las recomendaciones conservan la misma línea',()=>{
  const nacional=products[0],importada=products[3],buzos=products[6];
  assert.equal(productCollectionPath(nacional),catalogCollections.nacionales.path);
  assert.equal(productCollectionPath(importada),'/zapatillas-importadas');
  assert.deepEqual(productRecommendations(products,nacional).map(p=>p.id),['EU-PUBLIC-2','EU-PUBLIC-3']);
  assert.deepEqual(productRecommendations(products,importada),[]);
  assert.deepEqual(productRecommendations(products,buzos),[]);
});
test('Unificar la vitrina nacional no mezcla las reglas de precio ni el transporte',()=>{
  const mapped=['B1','B2','B3'].map((w,i)=>{const p=make(w,20+i);p.price=(i+1)*110000;p.commerce.rule={kind:'unit',retail:[p.price,p.price-10000,p.price-20000,p.price-30000,p.price-40000],wholesale:[]};return toLiveGeneral(p);});
  const q=quoteLive(mapped.map(p=>({id:p.id,size:'40',quantity:1})),mapped);
  assert.equal(q.subtotal,660000);assert.equal(q.warehouses.length,3);assert.equal(q.shippingPending,false);
  const b3=mapped[2];assert.equal(quoteLive([{id:b3.id,size:'40',quantity:4}],mapped).shippingPending,true);
  assert.equal(products[3]._live.advance,true);
});
test('Publicación selectiva y retirada de B3 no alteran las demás referencias',()=>{
  const b3=products[2],snapshot={partial:true,products:[{section:'general',route:{id:b3.id,slug:b3.slug}}]},replacement={...b3,price:99000};
  const merged=mergePublishedProducts(products,[replacement],snapshot,['general','importadas']);
  assert.deepEqual(merged.filter(p=>p.id!==b3.id),products.filter(p=>p.id!==b3.id));
  assert.equal(merged.find(p=>p.id===b3.id).price,99000);
  const removed=mergePublishedProducts(merged,[],{partial:true,products:[],removedRoutes:[{section:'general',id:b3.id,slug:b3.slug}]},['general','importadas']);assert.equal(removed.length,products.length-1);
});
test('El cliente recibe la colección pero no la bodega, agrupación comercial ni proveedor',()=>{
  for(const p of products){const client=publicProduct({...p,commercialGroup:'INTERNO',warehouse:'B6',family:'INTERNA'});assert.equal(client.collection,p.collection);assert.equal(client.warehouse,null);assert.equal(client.family,null);assert.equal('_live' in client,false);assert.equal('commercialGroup' in client,false);assert.ok(!JSON.stringify(client).includes(p._live.bucket));}
});
