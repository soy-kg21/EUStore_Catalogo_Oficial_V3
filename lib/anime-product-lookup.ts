import {animeProductRecords,getCanonicalAnimeProduct} from '@/data/anime-products';
import {animePublicRoutes} from './anime-routes';
import type {AnimeLine} from './anime-catalog-core';
import legacyRoutes from '@/data/anime-legacy-routes.json';
const roots:Record<AnimeLine,string>={anime:'/anime',cartoon:'/cartoon',rock:'/rock',urbanos:'/urbanas'};
const byId=new Map(animeProductRecords.map(product=>[product.id.toLowerCase(),product]));
const bySlug=new Map(animeProductRecords.map(product=>[product.slug.toLowerCase(),product]));
const readable=new Map(Object.entries(animePublicRoutes).map(([id,route])=>[`${route.line}:${route.slug}`,byId.get(id.toLowerCase())!]));
export function resolveAnimeProduct(value:string,line?:AnimeLine){
 const clean=value.trim().toLowerCase();let product=line?readable.get(`${line}:${clean}`):undefined;
 if(!product&&line){const id=(legacyRoutes as Record<string,string>)[`${roots[line]}/${clean}`];if(id)product=byId.get(id.toLowerCase());}
 product??=byId.get(clean)||bySlug.get(clean);
 if(!product){const match=clean.match(/^eu-anime-(\d{1,4})(?:-|$)/)||clean.match(/^(\d{1,4})$/);if(match){const code=String(Number(match[1])).padStart(3,'0');product=byId.get(`eu-anime-${code}`);}}
 return product?getCanonicalAnimeProduct(product):undefined;
}
