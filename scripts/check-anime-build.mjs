// Verify the actual production output and compiled handlers without opening a preview server.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8'),json=file=>JSON.parse(read(file));
const records=json('data/anime-catalog.json'),routes=json('data/anime-public-routes.json'),visible=records.filter(p=>!p.canonicalId),valid=new Set(visible.map(p=>p.id));
const handler=name=>require(new URL(`.next-native/server/app/api/${name}/route.js`,root).pathname).routeModule.userland;
const select=handler('anime-selection').GET,search=handler('search').GET,reference=handler('anime-reference').GET,quote=handler('quote').POST;
let checks=0;
for(const product of visible){
 const route=routes[product.id],html=read(`.next-native/server/app${route.path}.html`);
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/);assert(canonical,product.id);assert.equal(new URL(canonical[1]).pathname,route.path);
 const blocks=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 const schema=blocks.find(s=>s['@type']==='Product');assert(schema,product.id);assert.equal(schema.sku,product.id);assert.equal(schema.name,product.name);assert.equal(schema.offers.price,68000);assert.equal(schema.offers.availability,'https://schema.org/InStock');
 assert.equal(schema.material,'Algodón');assert(html.includes('Tradicional'));assert(html.includes('Tallas disponibles'));assert(html.includes('Disponible'));
 assert(html.includes('Compartir camiseta'));assert(html.includes('Cambiar a modo claro'));assert(html.includes('eu-theme-init'));
 const og=html.match(/<meta property="og:image" content="([^"]+)"/);assert(og);assert.equal(new URL(og[1].replaceAll('&amp;','&')).pathname,`/social/${route.line}/${route.slug}`);
 assert(!/href="\/p\//.test(html),product.id);assert(html.includes('announcement-track'));const navigation=html.match(/<nav class="desktop-nav"[\s\S]*?<\/nav>/)?.[0];assert(navigation,product.id);for(const path of ['/','/catalogo','/categoria/camisetas','/categoria/zapatillas','/categoria/conjuntos','/anime'])assert(navigation.includes('href="'+path+'"'),product.id+path);checks++;
}
for(let n=0;n<visible.length;n+=100){
 const batch=visible.slice(n,n+100),response=await select(new Request('http://local.test/api/anime-selection?ids='+batch.map(p=>p.id).join(',')));assert.equal(response.status,200);const {items}=await response.json();assert.equal(items.length,batch.length);
 for(const product of items){assert.equal(Object.hasOwn(product,'supplier'),false);assert.equal(Object.hasOwn(product,'sourceName'),false);assert(valid.has(product.id));}checks++;
}
for(const value of ['bad-id','../secreto','EU-ANIME-001,'.repeat(102)]){assert.equal((await select(new Request('http://local.test/api/anime-selection?ids='+encodeURIComponent(value)))).status,400);checks++;}
for(const q of ['Gojo','Stitch','Metallica','EU-ANIME-395','Goku Supreme']){
 const response=await search(new Request('http://local.test/api/search?q='+encodeURIComponent(q)));assert.equal(response.status,200);const {items}=await response.json();assert(items.length);for(const item of items){assert.equal(item.href,routes[item.id].path);assert(valid.has(item.id));}checks++;
}
for(const q of ['Naruto','Dragonball','Gojo','Metallica','Hellsing Negro','EU-ANIME-395','pelicula Jason','animaciones','nombre inexistente xyz9282']){
 const response=await reference(new Request('http://local.test/api/anime-reference?q='+encodeURIComponent(q)));assert.equal(response.status,200);const result=await response.json();
 if(q==='nombre inexistente xyz9282'){assert.equal(result.total,0);assert.equal(result.match,'no_match');}else assert(result.items.length,q);
 for(const item of result.items){assert.equal(item.path,routes[item.id].path);assert.equal(new URL(item.url).pathname,item.path);assert.equal(item.priceCOP,68000);assert(!Object.hasOwn(item,'supplier'));}checks++;
}
for(const query of ['', '?q=x&limit=25','?q=x&limit=abc','?q='+('a'.repeat(101))]){assert.equal((await reference(new Request('http://local.test/api/anime-reference'+query))).status,400);checks++;}
// General catalog commercial regression suite runs against the unchanged compiled quote handler.
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,init)=>{const parsed=new URL(url);assert.equal(parsed.pathname,'/api/quote');return quote(new Request(parsed,init));};
try{await import('./check-pricing.mjs');}finally{globalThis.fetch=originalFetch;}
// Render the sharing PNG for both a WEBP and a JPEG product; assets are provided locally in process.
const socialOutput=fs.mkdtempSync(path.join(os.tmpdir(),'eu-social-audit-'));
const social=require(new URL('.next-native/server/app/social/[line]/[slug]/route.js',root).pathname).routeModule.userland.GET;
globalThis.fetch=async(url)=>{const parsed=new URL(url),asset=new URL('public'+parsed.pathname,root);assert(asset.pathname.startsWith(new URL('public/anime/',root).pathname));const bytes=fs.readFileSync(asset);assert.equal(parsed.pathname.endsWith('.webp'),false,'Social image must use compatible JPEG');const mime=parsed.pathname.endsWith('.webp')?'image/webp':parsed.pathname.endsWith('.png')?'image/png':'image/jpeg';return new Response(bytes,{headers:{'content-type':mime}});};
try{
 for(const id of ['EU-ANIME-125','EU-ANIME-483']){const route=routes[id],response=await social(new Request('http://local.test'),{params:Promise.resolve({line:route.line,slug:route.slug})});assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/png');const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),630);assert(bytes.length>10000);fs.writeFileSync(path.join(socialOutput,`social-${id}.png`),bytes);checks++;}
 assert.equal((await social(new Request('http://local.test'),{params:Promise.resolve({line:'anime',slug:'inexistente'})})).status,404);checks++;
}finally{globalThis.fetch=originalFetch;}
console.log(`PASS: ${checks} comprobaciones de producción: HTML, canonicals y previews de 1209 fichas; APIs, IA, 38 cotizaciones generales y dos PNG sociales de 1200×630. Sin servidor de vista previa.`);
process.exit(0);
