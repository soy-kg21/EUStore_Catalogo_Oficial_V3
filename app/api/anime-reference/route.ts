import {getAnimeProducts,getLiveAnimePricing} from '@/lib/live-products';
import {animeProducts,animeCategorySlug} from '@/data/anime-products';
import {searchAnimeReferences,publicReferenceFacts} from '@/lib/anime-reference-search';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';
import {isDoublePrint} from '@/lib/anime-merchandising';
import {animePublicTotals as baselineTotals} from '@/lib/anime-commercial';
import {ORIGIN} from '@/lib/config';
export async function GET(request:Request){
 const animeProducts=await getAnimeProducts(),pricing=await getLiveAnimePricing(),animePublicTotals=pricing?.retail||baselineTotals;
 const params=new URL(request.url).searchParams,q=(params.get('q')||'').trim(),limit=Number(params.get('limit')||8);
 if(!q||q.length>100||!Number.isInteger(limit)||limit<1||limit>24)return Response.json({error:'Indica una consulta de 1 a 100 caracteres y un límite de 1 a 24.'},{status:400});
 const result=searchAnimeReferences(animeProducts,q,limit);
 const collections=[...new Map(result.items.map(product=>{const path=`${animeLinePath[product.line]}/${animeCategorySlug(product.category)}`;return [path,{name:product.category,path,url:ORIGIN+path}];})).values()];
 return Response.json({source:'Catálogo Evolución Urbana / Anime Shop',query:q,match:result.match,total:result.total,items:result.items.map(product=>publicReferenceFacts(product,animeProductHref(product),ORIGIN,isDoublePrint(product.id))),collections,publicCombosCOP:animePublicTotals.map((total,index)=>({quantity:index+1,total})),conditions:'Precios COP. Consulta las condiciones vigentes de cada referencia. Envío y contraentrega sujetos a cobertura; mayoristas con pago anticipado y transporte por cotizar.',publicWholesaleCOP:pricing?.wholesale||[[6,11,32000],[12,23,29000],[24,48,26000]],answerRule:result.total===0?'No inventar referencias, enlaces ni atributos. Pedir nombre exacto o imagen.':result.total>1?'Hay varias referencias: mostrar opciones con su nombre y enlace individual; pedir cuál desea.':'Responder solo con los datos de esta referencia. No afirmar disponibilidad confirmada.'},{headers:{'Cache-Control':'no-store'}});
}
