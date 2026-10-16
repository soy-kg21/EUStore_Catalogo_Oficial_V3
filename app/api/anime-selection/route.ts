import {animeProducts,toAnimeClientProduct} from '@/data/anime-products';
export function GET(request:Request){
 const raw=new URL(request.url).searchParams.get('ids')||'';if(raw.length>1600)return Response.json({error:'Selección demasiado grande'},{status:400});
 const ids=raw.split(',').filter(Boolean);if(ids.length>100||ids.some(id=>!/^EU-ANIME-\d{3,4}$/.test(id)))return Response.json({error:'Referencias inválidas'},{status:400});
 const selected=new Set(ids);return Response.json({items:animeProducts.filter(product=>selected.has(product.id)).map(toAnimeClientProduct)},{headers:{'Cache-Control':'private, max-age=60'}});
}
