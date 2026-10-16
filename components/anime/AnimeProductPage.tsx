import type {Metadata} from 'next';
import {animeProducts,toAnimeClientProduct,type AnimeProduct} from '@/data/anime-products';
import {animeProductHref,animePublicRoutes} from '@/lib/anime-routes';
import {ORIGIN} from '@/lib/config';
import {jsonLd} from '@/lib/seo';
import AnimeProductDetail from './AnimeProductDetail';
export function animeProductMetadata(product:AnimeProduct):Metadata{
 const path=animeProductHref(product.id),route=animePublicRoutes[product.id],title=`${product.name} | Evolución Urbana`,description=`Camiseta ${product.name}, colección ${product.category}. Disponible en tallas ${product.sizes.join(', ')}. Elige tu talla y arma tu combo con Evolución Urbana.`;
 const image=`/social/${route.line}/${route.slug}?v=2`;
 return {title,description,alternates:{canonical:path},openGraph:{type:'website',title,description,url:path,siteName:'Evolución Urbana',locale:'es_CO',images:[{url:image,width:1200,height:630,alt:`${product.name} / Anime Shop / Evolución Urbana`}]},twitter:{card:'summary_large_image',title,description,images:[image]}};
}
export default function AnimeProductPage({product}:{product:AnimeProduct}){
 const path=animeProductHref(product.id),related=animeProducts.filter(p=>p.id!==product.id&&p.line===product.line&&p.category===product.category).slice(0,4).map(toAnimeClientProduct);
 const schema={'@context':'https://schema.org','@type':'Product',name:product.name,sku:product.id,image:[ORIGIN+product.image],url:ORIGIN+path,description:`Camiseta ${product.name}. Disponible en tallas ${product.sizes.join(', ')}.`,...(product.material!=='Por confirmar'?{material:product.material}:{}),offers:{'@type':'Offer',url:ORIGIN+path,priceCurrency:'COP',price:product.price,availability:'https://schema.org/InStock',seller:{'@type':'Organization',name:'Evolución Urbana'}}};
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/><AnimeProductDetail key={product.id} product={toAnimeClientProduct(product)} related={related}/></>;
}
