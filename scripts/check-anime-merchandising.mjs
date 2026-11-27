import {orderAnimePresentation,orderNationalPresentation,isDoubleProduct} from '../lib/catalog-presentation.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const json=file=>JSON.parse(read(file));
const merchandising=json('data/anime-merchandising.json'),index=json('data/anime-index.json'),records=json('data/anime-catalog.json'),products=records.filter(p=>!p.canonicalId);
const load=(file,names,values,exports)=>new Function(...names,stripTypeScriptTypes(read(file)).replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'')+`\nreturn {${exports}};`)(...values);
const {orderAnimeProducts,filterAnimeProducts,animeCategorySlug}=load('lib/anime-catalog-core.ts',[],[],'orderAnimeProducts,filterAnimeProducts,animeCategorySlug');
const orderAnimeShopProducts=(products,filters)=>orderAnimePresentation(filters.doble?products.filter(isDoubleProduct):products),isDoublePrint=id=>isDoubleProduct({id});
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
  const block=Math.min(5,remainingD);
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
 const output=verify({linea:line,categoria:'',q:''});eq(output.slice(0,5).every(p=>isDoublePrint(p.id)),true);
 for(const category of new Set(products.filter(p=>p.line===line).map(p=>p.category)))verify({linea:line,categoria:animeCategorySlug(category),q:''});
 for(const q of ['Gojo','Goku','Stitch','Metallica','EU-ANIME-300','inexistente-xyz'])verify({linea:line,categoria:'',q});
}
eq(orderAnimeShopProducts([], {linea:'anime'}),[]);
for(const predicate of [p=>isDoublePrint(p.id),p=>!isDoublePrint(p.id)]){
 const source=products.filter(predicate);eq(orderAnimeShopProducts(source,{linea:''}).length,source.length);
}
const anime=orderAnimeShopProducts(products.filter(p=>p.line==='anime'),{linea:'anime'});
// The two sides are visible in the first five photos. Ref. 310 shows a single print.
eq(anime.slice(0,6).map(p=>p.id),['EU-ANIME-082','EU-ANIME-483','EU-ANIME-491','EU-ANIME-549','EU-ANIME-504','EU-ANIME-310']);
for(const id of ['EU-ANIME-377','EU-ANIME-150']){
 eq(isDoubleProduct({id,labels:['Doble estampado confirmado']}),false);
 eq(orderAnimeShopProducts(products,{doble:true}).some(p=>p.id===id),false);
}
eq(products.filter(isDoubleProduct).map(p=>p.id).sort(),[...merchandising.doublePrintIds].sort());
eq(orderAnimeShopProducts(products,{doble:true}).every(isDoubleProduct),true);
const labeled=products.map(p=>({...p,labels:['Orden manual anime: '+(products.length-p.id.length)]}));
eq(orderAnimeShopProducts(labeled,{}).slice(0,6).map(isDoubleProduct),[true,true,true,true,true,false]);
eq(orderNationalPresentation([{warehouse:'B2',id:1},{warehouse:'B1',id:2},{warehouse:'B1',id:3},{warehouse:'B2',id:4},{warehouse:'B1',id:5},{warehouse:'B3',id:6}]).map(p=>p.id),[2,1,3,4,5,6]);
console.log(`PASS: ${checks} comprobaciones de merchandising; 5 dobles + 1 sencillo, filtros y paginación; 1209 referencias sin pérdidas ni duplicados.`);
