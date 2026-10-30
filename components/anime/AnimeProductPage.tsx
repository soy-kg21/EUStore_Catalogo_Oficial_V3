import {productReference} from '@/lib/product-content';
import {getAnimeProducts} from '@/lib/live-products';
import type {Metadata} from 'next';
import {animeProducts,toAnimeClientProduct,type AnimeProduct} from '@/data/anime-products';
import {animeProductHref,animePublicRoutes} from '@/lib/anime-routes';
import {ORIGIN} from '@/lib/config';
import {jsonLd} from '@/lib/seo';
import {selectAnimeRecommendations} from '@/lib/anime-recommendations';
import AnimeProductDetail from './AnimeProductDetail';
export function animeProductMetadata(product:AnimeProduct):Metadata{
 const path=animeProductHref(product),route=animePublicRoutes[product.id],title=`${product.name} | Evolución Urbana`,description=`Camiseta ${product.name}, colección ${product.category}. Disponible en tallas ${product.sizes.join(', ')}. Elige tu talla y arma tu combo con Evolución Urbana.`;
 const image=route?`/social/${route.line}/${route.slug}?v=2`:product.image;
 return {title,description,alternates:{canonical:path},openGraph:{type:'website',title,description,url:path,siteName:'Evolución Urbana',locale:'es_CO',images:[{url:image,width:1200,height:630,alt:`${product.name} / Anime Shop / Evolución Urbana`}]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export default async function AnimeProductPage({product}:{product:AnimeProduct}){
 const animeProducts=await getAnimeProducts();
 const path=animeProductHref(product),related=selectAnimeRecommendations(product,animeProducts).map(toAnimeClientProduct);
 const schema={'@context':'https://schema.org','@type':'Product',name:product.name,sku:productReference(product)||undefined,image:[ORIGIN+product.image],url:ORIGIN+path,description:`Camiseta ${product.name}. Disponible en tallas ${product.sizes.join(', ')}.`,...(product.material!=='Por confirmar'?{material:product.material}:{}),offers:{'@type':'Offer',url:ORIGIN+path,priceCurrency:'COP',price:product.price,availability:product.availability==='Agotado'?'https://schema.org/OutOfStock':'https://schema.org/InStock',seller:{'@type':'Organization',name:'Evolución Urbana'}}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/><AnimeProductDetail key={product.id} product={toAnimeClientProduct(product)} related={related}/></>;
}
