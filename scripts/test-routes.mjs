import {createRequire} from 'node:module';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {Miniflare}=require(require.resolve('miniflare',{paths:[require.resolve('wrangler')]}));
const root=path.resolve('dist/server');const mf=new Miniflare({modules:[{type:'ESModule',path:path.join(root,'index.js')},...fs.readdirSync(root,{recursive:true}).filter(x=>x.endsWith('.js')&&x!=='index.js').map(x=>({type:'ESModule',path:path.join(root,x)}))],modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat']});
const products=JSON.parse(fs.readFileSync('data/catalog.json','utf8'));
const report={products:0,metadata:0,schema:0,inactive404:0,checks:[]};
try{
 for(const p of products){const r=await mf.dispatchFetch('https://www.evolucionurbana.store/producto/'+p.slug);const html=await r.text();if(p.state==='inactive'){assert.equal(r.status,404);report.inactive404++;continue}assert.equal(r.status,200,p.slug);report.products++;assert.ok(html.includes('https://www.evolucionurbana.store/producto/'+p.slug));assert.ok(html.includes('rel="canonical"'));assert.ok(html.includes('property="og:title"'));report.metadata++;assert.ok(html.includes('application/ld+json'));assert.ok(html.includes('"priceCurrency":"COP"'));report.schema++;
 }
 for(const route of ['/','/catalogo','/categoria/camisetas','/categoria/zapatillas','/categoria/conjuntos','/ofertas','/nosotros','/contacto','/privacidad','/carrito','/sitemap.xml','/robots.txt']){const r=await mf.dispatchFetch('https://www.evolucionurbana.store'+route);const body=await r.text();assert.equal(r.status,200,route);if(route==='/sitemap.xml')assert.equal((body.match(/<loc>/g)||[]).length,259);if(route==='/robots.txt')assert.ok(body.includes('Disallow: /'));report.checks.push(route)}
 const search=await mf.dispatchFetch('https://www.evolucionurbana.store/api/products?q=Mary%20Jane&color=Marfil');const result=await search.json();assert.equal(result.total,1);assert.equal(result.items[0].color,'Marfil');
 const p=products.find(p=>p.state==='active');const redirect=await mf.dispatchFetch('https://www.evolucionurbana.store/productos/'+p.slug,{redirect:'manual'});assert.equal(redirect.status,308);
 for(const [rows,status] of [[[{id:p.id,size:p.sizes[0],quantity:2}],200],[[{id:p.id,size:'invalid',quantity:2}],400],[[{id:p.id,size:p.sizes[0],quantity:-1}],400]]){const r=await mf.dispatchFetch('https://www.evolucionurbana.store/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(rows)});assert.equal(r.status,status);await r.text()}
 fs.writeFileSync('docs/route-test-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await mf.dispose()}
