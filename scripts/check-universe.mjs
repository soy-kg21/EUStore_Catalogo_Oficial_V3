import assert from 'node:assert/strict';
import {productReference} from '../lib/product-content.ts';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {normalizeAnimeText,animeCategorySlug,animeLines} from '../lib/anime-catalog-core.ts';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),json=file=>JSON.parse(read(file));
const load=(file,bindings,exports)=>new Function(...Object.keys(bindings),stripTypeScriptTypes(read(file)).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+`\nreturn {${exports}};`)(...Object.values(bindings));
const publicRoutes=json('data/anime-public-routes.json'),animeIndex=json('data/anime-index.json'),animeProductRecords=json('data/anime-catalog.json'),products=animeProductRecords.filter(p=>!p.canonicalId).map(p=>({...p,searchAliases:Object.entries(animeIndex.aliases).filter(([,target])=>target===p.id).map(([id])=>id)})),byId=new Map(animeProductRecords.map(p=>[p.id,p]));
const {animePublicRoutes,animeLinePath,animeProductHref}=load('lib/anime-routes.ts',{animeCategorySlug,animeLines,publicRoutes,animeIndex},'animePublicRoutes,animeLinePath,animeProductHref');
const {resolveAnimeProduct}=load('lib/anime-product-lookup.ts',{animeProductRecords,animePublicRoutes,getCanonicalAnimeProduct:p=>byId.get(p.canonicalId||p.id)},'resolveAnimeProduct');
const {searchAnimeReferences}=load('lib/anime-reference-search.ts',{normalizeAnimeText,productReference},'searchAnimeReferences');
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
eq(products.length,1209);eq(Object.keys(publicRoutes).length,1209);eq(new Set(Object.values(publicRoutes).map(r=>r.path)).size,1209);
for(const product of products){const route=publicRoutes[product.id];eq(animeProductHref(product.id),route.path);eq(resolveAnimeProduct(route.slug,route.line)?.id,product.id);eq(route.path,animeLinePath[product.line]+'/'+route.slug);assert.match(route.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);eq(route.path.startsWith('/p/'),false);eq(products.some(p=>p.line===product.line&&animeCategorySlug(p.category)===route.slug),false);for(const image of [product.image,product.thumbnail,product.backdrop])eq(fs.existsSync(new URL('../public'+image,import.meta.url)),true);}
for(const [alias,target] of Object.entries(animeIndex.aliases)){eq(animeProductHref(alias),animeProductHref(target));eq(searchAnimeReferences(products,alias).items[0]?.id,target);}
for(const query of ['125','EU-ANIME-125','referencia 125'])eq(searchAnimeReferences(products,query).items[0]?.id,'EU-ANIME-125');
for(const query of ['Naruto','naturo','camisetas de Naruto']){const result=searchAnimeReferences(products,query);eq(result.match,'multiple_products');eq(result.items.every(p=>p.category==='Naruto'),true);}
for(const query of ['dragonball','Dragon Ball']){const result=searchAnimeReferences(products,query);eq(result.items.length>0,true);eq(result.items.every(p=>normalizeAnimeText(p.category).includes('dragon ball')),true);}
eq(searchAnimeReferences(products,'diseño inexistente 9282763').total,0);eq(searchAnimeReferences(products,'peliculas').total,0);eq(searchAnimeReferences(products,'Gojo').match,'multiple_products');eq(searchAnimeReferences(products,'Hellsing - Negro').items[0]?.id,'EU-ANIME-125');eq(searchAnimeReferences(products,'animaciones').items.every(p=>p.line==='cartoon'),true);
const source=json('ia/catalogo-anime-shop.json');eq(source.items.length,1209);for(const item of source.items){eq(item.path,publicRoutes[item.id].path);eq(item.priceCOP,68000);eq(Object.hasOwn(item,'supplier'),false);}
console.log(`PASS: ${checks} comprobaciones Universe V2: 1209 slugs legibles, sin colisiones, 3627 imágenes, alias y consultas IA sin resultados inventados.`);
