import test from 'node:test';import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {syncService,validateSnapshot,productionContext} from '../lib/catalog-sync-core.mjs';
import {quoteLive} from '../lib/live-pricing.ts';

export function memoryStore(){const data=new Map();let sequence=0;return {data,async getWithMetadata(key){return structuredClone(data.get(key)||null);},async getMetadata(key){return data.has(key)?{metadata:data.get(key).metadata,etag:data.get(key).etag}:null;},async get(key){return structuredClone(data.get(key)?.data||null);},async setJSON(key,value,options={}){if(options.onlyIfNew&&data.has(key)||options.onlyIfMatch&&options.onlyIfMatch!==data.get(key)?.etag)return {modified:false};data.set(key,{data:structuredClone(value),metadata:{},etag:String(++sequence)});return {modified:true,etag:String(sequence)};},async set(key,value,options={}){if(options.onlyIfNew&&data.has(key))return {modified:false};data.set(key,{data:value,metadata:options.metadata||{},etag:String(++sequence)});return {modified:true,etag:String(sequence)};}};}
export const image=Buffer.from('524946461800000057454250565038200c0000003001009d012a0100010001402625a400037000fefb9400','hex'),sha=createHash('sha256').update(image).digest('hex'),token='test-only-not-a-production-key-123456789';
export const product=()=>({id:'a'.repeat(24),name:'Camiseta propia',section:'anime',category:'Colección',line:'anime',brand:'',color:'',description:'Texto público',labels:[],price:68000,regularPrice:91900,position:1,sizeSystem:'LETRAS',benefits:'Consulta condiciones',materials:'Algodón',conditions:'Cobertura por confirmar',payment:'Consulta opciones',sizes:[{size:'S',quantity:2},{size:'M',quantity:0},{size:'L',quantity:null}],images:{principal:'/api/catalog-media/'+sha,detalle:'/api/catalog-media/'+sha},route:{id:'EU-ANIME-001',slug:'eu-anime-001'},commerce:{bucket:'b'.repeat(24),rule:{kind:'total',retail:[68000,93000,126000,152000,180000],wholesale:[[6,11,32000],[12,23,29000],[24,48,26000]]},quoteFrom:null,shippingFrom:6,advance:false},extras:{isNew:false,fit:'',weight:null,featured:false}});
const document=()=>({schema:'eustore-sync-v1',revision:randomUUID(),createdAt:new Date().toISOString(),products:[product()]});
const fixture=()=>{const store=memoryStore(),service=syncService({getStore:()=>store,token}),call=(path,method='GET',body,auth=token)=>service.handle(new Request('https://store.example/api/backoffice/'+path,{method,headers:{authorization:'Bearer '+auth},...(body===undefined?{}:{body:Buffer.isBuffer(body)?body:JSON.stringify(body)})}),path);return {store,service,call};};
test('API privada: clave, entorno, tamaño, contenido y campos públicos se validan antes de escribir',async()=>{
 for(const build of ['deploy-preview','branch-deploy',undefined])assert.equal(productionContext(build,'production'),false);assert.equal(productionContext('production',undefined),true);
 const {call,store}=fixture();assert.equal((await call('status','GET',undefined,'incorrecta')).status,401);assert.equal(store.data.size,0);
 const denied=syncService({getStore:()=>store,token,production:false});assert.equal((await denied.handle(new Request('https://example.com',{headers:{authorization:'Bearer '+token}}),'status')).status,403);
 assert.equal((await call('assets/'+sha,'PUT',Buffer.from('<svg onload=alert(1)>'))).status,400);
 assert.equal((await call('assets/'+sha,'PUT',Buffer.alloc(4*1024*1024+1))).status,413);
 const raw=document();raw.products[0].cost=123456;raw.products[0].supplierReference='SECRETO';raw.products[0].description='Proveedor Dropi';const clean=validateSnapshot(raw);assert.equal(clean.products[0].description,'');assert.ok(!JSON.stringify(clean).includes('123456'));assert.ok(!JSON.stringify(clean).includes('SECRETO'));
 const duplicate=document();duplicate.products.push({...duplicate.products[0]});assert.throws(()=>validateSnapshot(duplicate));
});
test('Publicación atómica: fotos faltantes, control de cambios, versión inmutable y reintento confirmado',async()=>{
 const {call,service,store}=fixture(),first=document();assert.equal((await call('commit','POST',{expected:null,document:first})).status,409);assert.equal(await service.read(),null);
 assert.equal((await call('assets/'+sha,'PUT',image)).status,200);assert.equal((await call('commit','POST',{expected:null,document:first})).status,200);assert.equal((await service.read()).revision,first.revision);
 assert.equal((await call('commit','POST',{expected:null,document:first})).status,200);
 const corrupted=structuredClone(first);corrupted.products[0].name='Otra cosa';assert.equal((await call('commit','POST',{expected:null,document:corrupted})).status,409);
 const status=await (await call('status')).json(),a=document(),b=document();const responses=await Promise.all([call('commit','POST',{expected:status.etag,document:a}),call('commit','POST',{expected:status.etag,document:b})]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal((await service.read()).revision,a.revision);
 const saved=store.setJSON;store.setJSON=async(key,...args)=>key==='active'?{modified:true}:saved(key,...args);const current=await (await call('status')).json();assert.equal((await call('commit','POST',{expected:current.etag,document:document()})).status,503);assert.equal((await service.read()).revision,a.revision);
 const media=await service.media(sha);assert.equal(media.headers.get('Content-Type'),'image/webp');assert.deepEqual(Buffer.from(await media.arrayBuffer()),image);
});
test('Precios publicados: total Anime exacto, referencia individual, agotado, disponibilidad desconocida y mayoristas',()=>{
 const from=(id,rule=product().commerce.rule)=>({id,name:'Producto',sizes:['S','M','L'],price:68000,variants:product().sizes,_live:{...product().commerce,rule}}),products=[from('one'),from('two')],line=(id,size,quantity)=>({id,size,quantity});
 assert.equal(quoteLive([line('one','S',1),line('two','L',1)],products).subtotal,93000);
 assert.throws(()=>quoteLive([line('one','M',1)],products));assert.throws(()=>quoteLive([line('one','S',3)],products));assert.equal(quoteLive([line('one','L',6)],products).subtotal,192000);assert.equal(quoteLive([line('one','L',6)],products).shipping,null);
 const individual=from('special',null);individual.price=70000;assert.equal(quoteLive([line('one','S',1),line('special','L',1)],[...products,individual]).subtotal,138000);
 for(const n of [1,2,3,4,5])assert.equal(quoteLive([line('one','L',n)],products).subtotal,product().commerce.rule.retail[n-1]);assert.equal(quoteLive([line('one','L',49)],products).subtotal,null);
});
