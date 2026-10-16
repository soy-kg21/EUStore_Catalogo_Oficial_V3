import {normalizeAnimeText,type AnimeProduct,type AnimeLine} from './anime-catalog-core';
export function normalizeReferenceQuery(query:string){
 const clean=normalizeAnimeText(query).replace(/[^a-z0-9]+/g,' ').trim();
 const aliases:Record<string,string>={naturo:'naruto',dragonball:'dragon ball',onepiece:'one piece',jujutsukaisen:'jujutsu kaisen',caricaturas:'cartoon',animaciones:'cartoon',animacion:'cartoon',urbanas:'urbanos',urbana:'urbanos'};
 return clean.split(/\s+/).map(token=>aliases[token]||token).join(' ');
}
const stopWords=new Set(['camiseta','camisetas','quiero','busco','ver','tienes','tienen','hay','una','un','de','del','la','el','las','los','para','por','favor','diseno','disenos','pelicula','peliculas','serie','series','informacion','sobre','referencia','ref']);
export function searchAnimeReferences(products:AnimeProduct[],query:string,limit=8){
 const normalized=normalizeReferenceQuery(query),numeric=normalized.match(/^(?:(?:referencia|ref|eu anime) )?(\d{1,4})$/);
 const exactId=numeric?`EU-ANIME-${String(Number(numeric[1])).padStart(3,'0')}`:query.trim().toUpperCase();
 const exact=products.find(p=>p.id===exactId||p.searchAliases?.includes(exactId));
 if(exact)return {match:'exact_product' as const,total:1,items:[exact],query:normalized};
 const tokens=normalized.split(/\s+/).filter(token=>token&&!stopWords.has(token));
 if(!tokens.length)return {match:'no_match' as const,total:0,items:[],query:normalized};
 const phrase=tokens.join(' '),compact=phrase.replaceAll(' ','');
 const ranked=products.flatMap(product=>{
  const name=normalizeReferenceQuery(product.name),category=normalizeReferenceQuery(product.category),line=product.line;
  const haystack=`${name} ${category} ${line}`,flat=haystack.replaceAll(' ','');
  if(!tokens.every(token=>haystack.includes(token)||flat.includes(token)))return [];
  const score=(name===phrase?1000:0)+(category===phrase?500:0)+(line===phrase?300:0)+(name.replaceAll(' ','')===compact?200:0)+(name.includes(phrase)?100:0);
  return [{product,score}];
 }).sort((a,b)=>b.score-a.score||a.product.name.localeCompare(b.product.name,'es')||a.product.id.localeCompare(b.product.id));
 const items=ranked.slice(0,Math.min(24,Math.max(1,limit))).map(row=>row.product);
 return {match:ranked.length===1?'exact_product' as const:ranked.length?'multiple_products' as const:'no_match' as const,total:ranked.length,items,query:normalized};
}
export function publicReferenceFacts(product:AnimeProduct,path:string,origin:string,doublePrint:boolean){
 return {id:product.id,aliases:product.searchAliases||[],name:product.name,line:product.line as AnimeLine,universe:product.category,path,url:new URL(path,origin).href,image:new URL(product.image,origin).href,priceCOP:product.price,doublePrint:doublePrint?'confirmed':'not_confirmed',material:product.material&&product.material!=='Por confirmar'?product.material:null,weightGrams:product.weightGrams,fit:product.fit&&product.fit!=='Por confirmar'?product.fit:null,catalogSizes:product.sizes,availability:product.availability};
}
