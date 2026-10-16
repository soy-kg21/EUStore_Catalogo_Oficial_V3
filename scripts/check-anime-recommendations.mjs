import assert from 'node:assert/strict';
import fs from 'node:fs';
import {selectAnimeRecommendations} from '../lib/anime-recommendations.ts';
import {orderAnimeProducts} from '../lib/anime-catalog-core.ts';
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const records=JSON.parse(read('data/anime-catalog.json')),catalog=orderAnimeProducts(records.filter(p=>!p.canonicalId)),before=JSON.stringify(catalog);
let withFullUniverse=0,withFallback=0,checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
for(const product of catalog){
 const result=selectAnimeRecommendations(product,catalog),universe=catalog.filter(p=>p.id!==product.id&&p.line===product.line&&p.category===product.category);
 eq(result.length,4);eq(new Set(result.map(p=>p.id)).size,4);assert(!result.some(p=>p.id===product.id||p.canonicalId));checks++;
 const needed=Math.min(4,universe.length);
 eq(result.slice(0,needed),universe.slice(0,4));
 const fromLine=Math.min(4,catalog.filter(p=>p.id!==product.id&&p.line===product.line).length);
 assert(result.slice(0,fromLine).every(p=>p.line===product.line));checks++;
 if(needed===4)withFullUniverse++;else withFallback++;
 if(process.argv.includes('--build')){
  const routes=JSON.parse(read('data/anime-public-routes.json')),html=read(`.next-native/server/app${routes[product.id].path}.html`);
  const section=html.match(/<section class="[^"]*related[^"]*">([\s\S]*?)<\/section>/)?.[1];assert(section,product.id+': missing suggestions');
  const ids=[...section.matchAll(/id="anime-card-(EU-ANIME-\d+)"/g)].map(m=>m[1]);eq(ids,result.map(p=>p.id));
  assert(section.includes(needed===4?'Sigue en tu universo':'Completa tu combo'));checks++;
  for(const item of result)assert(section.includes(`href="${routes[item.id].path}"`));checks++;
 }
}
eq(JSON.stringify(catalog),before);
const item=(id,line='anime',category='Solo')=>({id,line,category});
const current=item('A'),same=item('B'),other=item('C','anime','Otro'),rock=item('D','rock','Banda'),urban=item('E','urbanos','Urbanos');
eq(selectAnimeRecommendations(current,[rock,other,current,same,urban]),[same,other,rock,urban]);
eq(selectAnimeRecommendations(current,[current,{...same,canonicalId:'A'},same,same,other]),[same,other]);
eq(selectAnimeRecommendations(current,[]),[]);
const hellsing=catalog.find(p=>p.id==='EU-ANIME-125');eq(hellsing.category,'Hellsing');eq(selectAnimeRecommendations(hellsing,catalog).length,4);
console.log(`PASS: ${checks} comprobaciones; ${catalog.length} fichas con cuatro sugerencias, ${withFullUniverse} solo del mismo universo y ${withFallback} completadas con otras referencias${process.argv.includes('--build')?'; HTML de producción verificado':''}.`);
