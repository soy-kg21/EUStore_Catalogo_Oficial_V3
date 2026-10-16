// Only append missing routes. Existing published paths are never regenerated from changed names.
import fs from 'node:fs';
const root=new URL('../',import.meta.url),read=file=>JSON.parse(fs.readFileSync(new URL(file,root),'utf8'));
const catalog=read('data/anime-catalog.json').filter(p=>!p.canonicalId),routes=read('data/anime-public-routes.json');
const slug=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const roots={anime:'/anime',cartoon:'/cartoon',rock:'/rock',urbanos:'/urbanas'};
const used=new Set(Object.values(routes).map(row=>row.path)),reserved=new Set(catalog.map(p=>`${roots[p.line]}/${slug(p.category)}`));
let added=0;
for(const product of catalog.sort((a,b)=>a.id.localeCompare(b.id))){
 if(routes[product.id]){if(routes[product.id].line!==product.line)throw new Error(`La línea cambió en ${product.id}: preparar una migración explícita antes de continuar.`);continue;}
 const base=slug(product.name.replace(/\s*[-–]?\s*ref\.?\s*\d+\s*$/i,''))||'camiseta';
 let candidate=base;if(reserved.has(roots[product.line]+'/'+candidate)||candidate==='todos')candidate+='-camiseta';
 const initial=candidate;let variant=2;while(used.has(roots[product.line]+'/'+candidate)||reserved.has(roots[product.line]+'/'+candidate))candidate=`${initial}-variante-${variant++}`;
 const path=roots[product.line]+'/'+candidate;routes[product.id]={slug:candidate,line:product.line,path};used.add(path);added++;
}
fs.writeFileSync(new URL('data/anime-public-routes.json',root),JSON.stringify(routes,null,2)+'\n');
console.log(`${added} enlaces añadidos; los enlaces existentes permanecen iguales.`);
