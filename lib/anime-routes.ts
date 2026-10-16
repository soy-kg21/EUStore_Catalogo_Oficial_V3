import {animeCategorySlug,animeLines,type AnimeFilters,type AnimeLine} from './anime-catalog-core';
import publicRoutes from '@/data/anime-public-routes.json';
import animeIndex from '@/data/anime-index.json';
export const animeLinePath:Record<AnimeLine,string>={anime:'/anime',cartoon:'/cartoon',rock:'/rock',urbanos:'/urbanas'};
export const animePublicRoutes=publicRoutes as Record<string,{slug:string;line:AnimeLine;path:string}>;
export function animeFilterHref(filters:AnimeFilters){
 const root=filters.linea?animeLinePath[filters.linea as AnimeLine]||'/shop':'/shop';
 const path=filters.categoria&&filters.linea?`${root}/${animeCategorySlug(filters.categoria)}`:root;const query=new URLSearchParams();if(filters.doble)query.set('estampado','doble');
 if(filters.q.trim())query.set('q',filters.q.slice(0,100));if(!filters.linea&&filters.categoria)query.set('categoria',animeCategorySlug(filters.categoria));
 return path+(query.size?`?${query}`:'');
}
export function animeLocationFilters(pathname:string,search:string):AnimeFilters{
 const parts=pathname.split('/').filter(Boolean),params=new URLSearchParams(search),first=parts[0]==='urbanos'?'urbanas':parts[0];
 const line=animeLines.find(row=>animeLinePath[row.id]===`/${first}`)?.id||'anime';const legacy=params.get('linea');
 const linea=legacy!==null?(legacy==='urbanas'?'urbanos':animeLines.some(row=>row.id===legacy)?legacy:''):(first==='shop'||parts[1]==='todos'?'':line);
 const category=parts[1]&&parts[1]!=='todos'&&!/^eu-anime-|^\d/.test(parts[1])?parts[1]:'';
 return {linea,categoria:animeCategorySlug(params.get('categoria')||category),q:(params.get('q')||'').slice(0,100),...(params.get('estampado')==='doble'?{doble:true}:{})};
}
export function animeProductHref(id:string){const key=id.toUpperCase(),canonical=(animeIndex.aliases as Record<string,string>)[key]||key;const route=animePublicRoutes[canonical];if(!route)throw new Error('Referencia de Anime Shop inexistente');return route.path;}
export function isAnimeShopPath(path:string){return /^\/(?:anime|cartoon|rock|urbanas|urbanos|shop|p)(?:\/|$)/.test(path);}
