import {animeProducts,animeCategorySlug} from '@/data/anime-products';
import {searchAnimeReferences,publicReferenceFacts} from '@/lib/anime-reference-search';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';
import {isDoublePrint} from '@/lib/anime-merchandising';
import {animePublicTotals} from '@/lib/anime-commercial';
import {ORIGIN} from '@/lib/config';
export async function GET(request:Request){
 const params=new URL(request.url).searchParams,q=(params.get('q')||'').trim(),limit=Number(params.get('limit')||8);
 if(!q||q.length>100||!Number.isInteger(limit)||limit<1||limit>24)return Response.json({error:'Indica una consulta de 1 a 100 caracteres y un límite de 1 a 24.'},{status:400});
 const result=searchAnimeReferences(animeProducts,q,limit);
 const collections=[...new Map(result.items.map(product=>{const path=`${animeLinePath[product.line]}/${animeCategorySlug(product.category)}`;return [path,{name:product.category,path,url:ORIGIN+path}];})).values()];
 return Response.json({source:'Catálogo Evolución Urbana / Anime Shop',query:q,match:result.match,total:result.total,items:result.items.map(product=>publicReferenceFacts(product,animeProductHref(product.id),ORIGIN,isDoublePrint(product.id))),collections,publicCombosCOP:animePublicTotals.map((total,index)=>({quantity:index+1,total})),conditions:'Precios COP. De 1 a 5 camisetas, envío estándar incluido y contraentrega sujetos a cobertura. De 6 a 11: $38.400 por unidad; de 12 a 23: $33.300. Desde 6, pago anticipado y transporte separado; desde 24, cotización humana.',answerRule:result.total===0?'No inventar referencias, enlaces ni atributos. Pedir nombre exacto o imagen.':result.total>1?'Hay varias referencias: mostrar opciones con su nombre y enlace individual; pedir cuál desea.':'Responder solo con los datos de esta referencia. No afirmar disponibilidad confirmada.'},{headers:{'Cache-Control':'public, max-age=60'}});
}
