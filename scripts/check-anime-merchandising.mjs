import {orderAnimePresentation,isDoubleProduct} from '../lib/catalog-presentation.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const json=file=>JSON.parse(read(file));
const merchandising=json('data/anime-merchandising.json'),index=json('data/anime-index.json'),records=json('data/anime-catalog.json'),products=records.filter(p=>!p.canonicalId);
const load=(file,names,values,exports)=>new Function(...names,stripTypeScriptTypes(read(file)).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+`\nreturn {${exports}};`)(...values);
const {orderAnimeProducts,filterAnimeProducts,animeCategorySlug}=load('lib/anime-catalog-core.ts',[],[],'orderAnimeProducts,filterAnimeProducts,animeCategorySlug');
const orderAnimeShopProducts=(products,filters)=>orderAnimePresentation(products,filters.linea),isDoublePrint=id=>isDoubleProduct({id});
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
eq(products.length,1209);eq(index.ids.length,products.length);eq(new Set(merchandising.doublePrintIds).size,merchandising.doublePrintIds.length);
for(const id of merchandising.doublePrintIds)eq(index.ids.includes(id),true);
for(const priority of Object.values(merchandising.byLine))for(const id of priority)eq(index.ids.includes(id),true);
function verify(filters){
 const input=filterAnimeProducts(products,filters),snapshot=JSON.stringify(input),output=orderAnimeShopProducts(input,filters);
 eq(JSON.stringify(input),snapshot);eq(output.length,input.length);eq(new Set(output.map(p=>p.id)).size,input.length);
 eq(output.map(p=>p.id).sort(),input.map(p=>p.id).sort());eq(orderAnimeShopProducts(input,filters).map(p=>p.id),output.map(p=>p.id));
 const doubleCount=input.filter(p=>isDoublePrint(p.id)).length,otherCount=input.length-doubleCount;
 // Independent position contract, including the incomplete final double block.
 let remainingD=doubleCount,remainingS=otherCount,position=0;
 while(remainingD){
  const block=Math.min(4,remainingD);
  for(let n=0;n<block;n++){eq(isDoublePrint(output[position++].id),true);remainingD--;}
  if(remainingS){eq(isDoublePrint(output[position++].id),false);remainingS--;}
 }
 for(;position<output.length;position++)eq(isDoublePrint(output[position].id),false);
 // Loading successive 24-item pages must reconstruct exactly one ordered list.
 const paginated=[];for(let offset=0;offset<output.length;offset+=24)paginated.push(...output.slice(offset,offset+24));eq(paginated.map(p=>p.id),output.map(p=>p.id));
 return output;
}
verify({linea:'',categoria:'',q:''});
for(const line of ['anime','cartoon','rock','urbanos']){
 const output=verify({linea:line,categoria:'',q:''});eq(output.slice(0,4).every(p=>isDoublePrint(p.id)),true);
 for(const category of new Set(products.filter(p=>p.line===line).map(p=>p.category)))verify({linea:line,categoria:animeCategorySlug(category),q:''});
 for(const q of ['Gojo','Goku','Stitch','Metallica','EU-ANIME-300','inexistente-xyz'])verify({linea:line,categoria:'',q});
}
eq(orderAnimeShopProducts([], {linea:'anime'}),[]);
for(const predicate of [p=>isDoublePrint(p.id),p=>!isDoublePrint(p.id)]){
 const source=products.filter(predicate);eq(orderAnimeShopProducts(source,{linea:''}).length,source.length);
}
const anime=orderAnimeShopProducts(products.filter(p=>p.line==='anime'),{linea:'anime'});
eq(anime.slice(0,4).map(p=>p.id),['483','125','491','504'].map(n=>'EU-ANIME-'+n));
console.log(`PASS: ${checks} comprobaciones de merchandising; 4 dobles + 1 diseño restante desde posición 1, filtros y paginación; 1209 referencias sin pérdidas ni duplicados.`);
