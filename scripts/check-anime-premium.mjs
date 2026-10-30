import assert from 'node:assert/strict';
import {productReference} from '../lib/product-content.ts';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {animeQuote} from '../lib/anime-commercial.ts';
import {animeCategorySlug,animeLines} from '../lib/anime-catalog-core.ts';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),json=file=>JSON.parse(read(file));
const load=(file,bindings,exports)=>new Function(...Object.keys(bindings),stripTypeScriptTypes(read(file)).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+`\nreturn {${exports}};`)(...Object.values(bindings));
const publicRoutes=json('data/anime-public-routes.json'),index=json('data/anime-index.json'),animeProductRecords=json('data/anime-catalog.json'),byId=new Map(animeProductRecords.map(p=>[p.id,p]));
const getCanonicalAnimeProduct=p=>byId.get(p.canonicalId||p.id);
const {animeProductHref,animeFilterHref,animeLocationFilters,isAnimeShopPath,animePublicRoutes}=load('lib/anime-routes.ts',{animeCategorySlug,animeLines,publicRoutes,animeIndex:index},'animeProductHref,animeFilterHref,animeLocationFilters,isAnimeShopPath,animePublicRoutes');
const {resolveAnimeProduct}=load('lib/anime-product-lookup.ts',{animeProductRecords,getCanonicalAnimeProduct,animePublicRoutes},'resolveAnimeProduct');
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
for(const product of animeProductRecords){
 const canonical=product.canonicalId||product.id;
 for(const value of [product.id,product.id.toLowerCase(),product.slug,product.id.toLowerCase()+'-nombre-historico',product.id.replace('EU-ANIME-','')])eq(resolveAnimeProduct(value)?.id,canonical);
}
for(const value of ['no-existe','algo-23','naruto','EU-ANIME-9999','9999',''])eq(resolveAnimeProduct(value),undefined);
for(const path of ['/anime','/anime/naruto','/cartoon','/rock','/urbanos','/shop','/p/125'])eq(isAnimeShopPath(path),true);
for(const path of ['/catalogo','/producto/modelo','/categoria/camisetas','/anime-falso'])eq(isAnimeShopPath(path),false);
for(const line of ['', 'anime','cartoon','rock','urbanos'])for(const q of ['', 'Gojo & Sukuna','AC/DC','Pokémon']){
 const original={linea:line,categoria:line==='anime'?'naruto':'',q,doble:true};const url=new URL(animeFilterHref(original),'https://preview.test');eq(animeLocationFilters(url.pathname,url.search),original);
}
const {parseAnimeSelection,changeAnimeSelection}=load('lib/anime-selection-core.ts',{index},'parseAnimeSelection,changeAnimeSelection');
const id='EU-ANIME-483',second='EU-ANIME-125';
eq(parseAnimeSelection('invalid'),[]);eq(parseAnimeSelection('{"id":"x"}'),[]);eq(parseAnimeSelection('[null,12,{},"inexistente"]'),[]);
eq(parseAnimeSelection('["EU-ANIME-395"]'),[{id:'EU-ANIME-016',quantity:1}]);
let rows=changeAnimeSelection([],id,'M',{add:1});rows=changeAnimeSelection(rows,id,'L',{add:2});rows=changeAnimeSelection(rows,second,'S',{add:1});
eq(rows.length,3);eq(rows.reduce((n,r)=>n+r.quantity,0),4);eq(animeQuote(rows.reduce((n,r)=>n+r.quantity,0)).merchandise,152000);
rows=changeAnimeSelection(rows,id,'M',{quantity:3});eq(rows[0].size,'M');eq(rows[0].quantity,3);
rows=changeAnimeSelection(rows,id,'M',{nextSize:'L'});eq(rows.length,2);eq(rows.find(r=>r.id===id).quantity,5);eq(rows.find(r=>r.id===id).size,'L');
rows=changeAnimeSelection(rows,id,'L',{quantity:0});eq(rows,[{id:second,size:'S',quantity:1}]);
eq(parseAnimeSelection(JSON.stringify([{id,size:'M',quantity:150},{id,size:'S',quantity:-1},{id,size:'L',quantity:1.4}])) ,[{id,size:'M',quantity:99}]);
const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
const {animeSelectionMessage}=load('lib/anime-message.ts',{animeQuote,animeProductHref,money,productReference},'animeSelectionMessage');
for(const [quantity,total] of [[1,68000],[2,93000],[3,126000],[4,152000],[5,180000],[6,192000],[11,352000],[12,348000],[23,667000],[24,624000],[48,1248000]]){
 const text=animeSelectionMessage([{id,size:'M',quantity}],animeProductRecords,'https://independiente.test');
 eq(text.includes(money(total)),true);eq(text.includes(`Cantidad: ${quantity}`),true);eq(text.includes('https://independiente.test/anime/gojo-diseno-2'),true);eq(text.includes('evolucionurbana.store'),false);
 eq(text.includes('Transporte separado'),quantity>=6);
}
eq(animeSelectionMessage([{id,size:'M',quantity:49}],animeProductRecords,'https://independiente.test').includes('cotización personalizada'),true);
console.log(`PASS: ${checks} comprobaciones premium: 1250 referencias y alias, rutas, filtros compartibles, cantidades/tallas, fusiones y mensaje con precios reales y dominio independiente.`);
