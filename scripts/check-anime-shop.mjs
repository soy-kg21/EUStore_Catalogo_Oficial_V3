import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {animeQuote,animePublicTotals,animeRegularTotals,animeCommercial} from '../lib/anime-commercial.ts';
import {animeCategorySlug,animeLines} from '../lib/anime-catalog-core.ts';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const code=stripTypeScriptTypes(read('lib/anime-routes.ts')).replace(/^import .*;$/gm,'').replace(/^export /gm,'');
const routes=new Function('animeCategorySlug','animeLines','publicRoutes','animeIndex',code+'\nreturn {animeProductHref,animeFilterHref,animeLocationFilters};')(animeCategorySlug,animeLines,JSON.parse(read('data/anime-public-routes.json')),JSON.parse(read('data/anime-index.json')));
const {animeProductHref,animeFilterHref,animeLocationFilters}=routes;
for(let n=1;n<=5;n++){
 assert.equal(animeQuote(n).merchandise,animePublicTotals[n-1]);
 assert.equal(animeQuote(n,'regular').merchandise,animeRegularTotals[n-1]);
 assert.equal(animeQuote(n).advance,false);
}
assert.equal(animeQuote(4).merchandise,152000);assert.notEqual(animeQuote(4).merchandise,2*animeQuote(2).merchandise);
for(const [n,unit] of [[6,32000],[11,32000],[12,29000],[23,29000],[24,26000],[48,26000]]){
 const q=animeQuote(n);assert.equal(q.merchandise,n*unit);assert(q.advance&&q.shippingPending&&!q.requiresHuman);
}
assert.equal(animeQuote(49).merchandise,null);assert(animeQuote(49).requiresHuman);
for(const n of [0,-1,1.5,NaN,Infinity])assert.throws(()=>animeQuote(n));
assert.equal(animeCommercial.promoLabel,'2 POR $93.000');
for(const [path,line,category] of [['/anime','anime',''],['/cartoon','cartoon',''],['/rock','rock',''],['/urbanas','urbanos',''],['/shop','',''],['/anime/naruto','anime','naruto'],['/anime/dragon-ball','anime','dragon-ball'],['/urbanas/terror-y-cine','urbanos','terror-y-cine']]){
 const f=animeLocationFilters(path,'');assert.equal(f.linea,line);assert.equal(f.categoria,category);const href=new URL(animeFilterHref({...f,q:'Gojo & amigos'}),'https://review.test');assert.equal(href.pathname,path);assert.equal(href.searchParams.get('q'),'Gojo & amigos');
}
assert.deepEqual(animeLocationFilters('/anime','?linea=rock&categoria=metal&q=ghost'),{linea:'rock',categoria:'metal',q:'ghost'});
const catalog=JSON.parse(read('data/anime-catalog.json')),index=JSON.parse(read('data/anime-index.json')),byId=new Map(catalog.map(p=>[p.id,p]));
const visible=catalog.filter(p=>!p.canonicalId);
assert.equal(visible.length,index.ids.length);assert.equal(catalog.length,new Set(catalog.map(p=>p.id)).size);
for(const [alias,target] of Object.entries(index.aliases)){assert.equal(byId.get(alias).canonicalId,target);assert(!byId.get(target).canonicalId);}
for(const group of JSON.parse(read('data/anime-deduplication.json'))){assert(!byId.get(group.canonicalId).canonicalId);for(const id of group.aliasIds)assert.equal(byId.get(id).canonicalId,group.canonicalId);}
for(const p of catalog){assert.match(animeProductHref(p.id),/^\/(anime|cartoon|rock|urbanas)\/[a-z0-9-]+$/);assert(!animeProductHref(p.id).includes('?'));}
assert.equal(index.aliases['EU-ANIME-395'],'EU-ANIME-016');assert.equal(index.aliases['EU-ANIME-146'],'EU-ANIME-112');assert.equal(index.aliases['EU-ANIME-133'],'EU-ANIME-742');
console.log(`PASS: tarifas públicas/habituales, fronteras mayoristas, rutas limpias, compatibilidad y ${Object.keys(index.aliases).length} alias sin ciclos.`);
