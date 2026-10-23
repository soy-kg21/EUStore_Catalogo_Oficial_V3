import {getAnimeProducts} from '@/lib/live-products';
import {getProducts} from '@/lib/products';
import {animeProducts} from '@/data/anime-products';
import {searchCatalog,toCatalogSuggestion} from '@/lib/catalog-search';

export async function GET(request:Request){
 const animeProducts=await getAnimeProducts();
  const q=new URL(request.url).searchParams.get('q')||'';
  if(q.length>100)return Response.json({error:'Consulta demasiado larga'},{status:400});
  const result=searchCatalog(await getProducts(),animeProducts,{q});
  return Response.json({total:result.total,items:result.items.slice(0,4).map(toCatalogSuggestion)});
}
