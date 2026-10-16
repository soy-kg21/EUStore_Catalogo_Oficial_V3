import type {Metadata} from 'next';
import {notFound,permanentRedirect} from 'next/navigation';
import {animeProducts,animeCategorySlug,type AnimeLine,type AnimeFilters} from '@/data/anime-products';
import {resolveAnimeProduct} from '@/lib/anime-product-lookup';
import {animeProductHref,animePublicRoutes,animeLinePath,animeLocationFilters} from '@/lib/anime-routes';
import AnimeProductPage,{animeProductMetadata} from './AnimeProductPage';
import AnimeShopPage from './AnimeShopPage';
import legacyRoutes from '@/data/anime-legacy-routes.json';
export type AnimeSearchParams=Promise<Record<string,string|string[]|undefined>>;
export async function collectionFilters(line:AnimeLine|'',searchParams?:AnimeSearchParams):Promise<AnimeFilters>{
 const values=searchParams?await searchParams:{},search=new URLSearchParams();for(const key of ['linea','categoria','q','estampado'])if(typeof values[key]==='string')search.set(key,values[key] as string);
 return animeLocationFilters(line?animeLinePath[line]:'/shop',`?${search}`);
}
export function categoryParams(line:AnimeLine){return [...new Set(animeProducts.filter(p=>p.line===line).map(p=>animeCategorySlug(p.category)))];}
export function collectionParams(line:AnimeLine){return [...new Set([...categoryParams(line),...Object.values(animePublicRoutes).filter(row=>row.line===line).map(row=>row.slug),...Object.keys(legacyRoutes).filter(path=>path.startsWith(animeLinePath[line]+'/')).map(path=>path.split('/')[2])])];}
function categoryName(line:AnimeLine,slug:string){return animeProducts.find(p=>p.line===line&&animeCategorySlug(p.category)===slug)?.category;}
export function categoryMetadata(line:AnimeLine,slug:string):Metadata{
 const product=resolveAnimeProduct(slug,line);if(product)return animeProductMetadata(product);
 const category=categoryName(line,slug);if(!category)return {title:'Diseño no encontrado | Evolución Urbana',robots:{index:false,follow:false}};
 return {title:`Camisetas ${category} | Evolución Urbana`,description:`Explora camisetas de ${category}. Arma tu combo y confirma tallas y disponibilidad por WhatsApp.`,alternates:{canonical:`${animeLinePath[line]}/${slug}`}};
}
export async function CollectionRoute({line,slug,searchParams}:{line:AnimeLine;slug:string;searchParams?:AnimeSearchParams}){
 if(slug==='todos')permanentRedirect('/shop');
 const product=resolveAnimeProduct(slug,line);
 if(product){if(animeProductHref(product.id)!==`${animeLinePath[line]}/${slug}`)permanentRedirect(animeProductHref(product.id));return <AnimeProductPage product={product}/>;}
 const category=categoryName(line,slug);if(category){const filters=await collectionFilters(line,searchParams);return <AnimeShopPage filters={{...filters,linea:line,categoria:slug}}/>;}notFound();
}
