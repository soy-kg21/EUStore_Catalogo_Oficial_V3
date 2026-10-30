import {orderAnimeShopProducts} from '@/lib/anime-merchandising';
import {getAnimeProducts} from '@/lib/live-products';
import {animeProductHref} from '@/lib/anime-routes';
import {animeProducts,filterAnimeProducts,orderAnimeProducts,readAnimeFilters} from '@/data/anime-products';
import {animeCommercial} from '@/lib/anime-commercial';
// Cabecera del Anime Shop: búsqueda acotada a este inventario, sin tocar /api/quote.
export async function GET(request:Request){
 const animeProducts=await getAnimeProducts();
  const url=new URL(request.url),filters=readAnimeFilters(url.search),filtered=orderAnimeShopProducts(filterAnimeProducts(animeProducts,filters),filters);
  return Response.json({total:filtered.length,items:filtered.slice(0,4).map(p=>({id:p.id,slug:p.slug,name:p.name,color:p.category,images:[p.thumbnail],price:p.price,pricingPending:false,href:animeProductHref(p)}))});
}
