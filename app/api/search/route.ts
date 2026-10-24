import {getAnimeProducts} from '@/lib/live-products';
import {getProducts} from '@/lib/products';
import {searchCatalog,toCatalogSuggestion} from '@/lib/catalog-search';

export async function GET(request:Request){
  const params=new URL(request.url).searchParams,q=params.get('q')||'';
  if(q.length>100)return Response.json({error:'Consulta demasiado larga'},{status:400});
  const animeOnly=params.get('scope')==='anime',line=params.get('line');
  const [general,anime]=await Promise.all([animeOnly?Promise.resolve([]):getProducts(),getAnimeProducts()]);
  const animeRows=animeOnly&&['anime','cartoon','rock','urbanos'].includes(line||'')?anime.filter(p=>p.line===line):anime;
  const result=searchCatalog(general,animeRows,{q});
  return Response.json({total:result.total,items:result.items.slice(0,4).map(toCatalogSuggestion)});
}
