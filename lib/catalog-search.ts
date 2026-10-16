import {animeProductHref} from '@/lib/anime-routes';
import type {Product} from './types';
import type {AnimeProduct} from './anime-catalog-core';
import {normalizeAnimeText} from './anime-catalog-core';
import {animeCommercial} from './anime-commercial';

type SearchParams=Record<string,string|string[]|undefined>;
export type CatalogMatch={kind:'general';product:Product}|{kind:'anime';product:AnimeProduct};
export type CatalogSuggestion={id:string;slug:string;name:string;color:string;images:string[];price:number;pricingPending:boolean;href:string};

/** Índice de lectura compartido por la lupa y /catalogo?q=.
 * Los productos Anime mantienen sus fichas y política comercial propias. */
export function searchCatalog(general:Product[],anime:AnimeProduct[],params:SearchParams){
  const val=(key:string)=>typeof params[key]==='string'?String(params[key]):'';
  const q=normalizeAnimeText(val('q').slice(0,100)),size=val('size'),color=val('color'),brand=val('brand'),availability=val('availability');
  const max=Number(val('max'))||Infinity;
  const generalMatches=general.filter(p=>p.state!=='inactive'&&(!q||normalizeAnimeText(`${p.name} ${p.sku} ${p.brand??''} ${p.category} ${p.color}`).includes(q))&&(!size||p.sizes.includes(size))&&(!color||p.color===color)&&(!brand||p.brand===brand)&&(!Number.isFinite(max)||(!p.pricingPending&&p.price<=max))&&(!availability||(availability==='confirmed'?p.stock!==null&&p.stock>0:p.stock===null)));
  const animeMatches=anime.filter(p=>!p.canonicalId&&(!q||normalizeAnimeText(`${p.name} ${p.id} ${p.category} ${p.line} ${p.searchAliases?.join(' ')||''} camiseta camisetas`).includes(q))&&(!size||p.sizes.includes(size))&&!color&&!brand&&(!Number.isFinite(max)||animeCommercial.unitPrice<=max)&&availability!=='confirmed');
  // Alternar inventarios permite descubrir ambos cuando la consulta coincide en los dos.
  const matches:CatalogMatch[]=[];
  for(let i=0;i<Math.max(generalMatches.length,animeMatches.length);i++){
    if(animeMatches[i])matches.push({kind:'anime',product:animeMatches[i]});
    if(generalMatches[i])matches.push({kind:'general',product:generalMatches[i]});
  }
  const pending=(m:CatalogMatch)=>m.kind==='general'&&!!m.product.pricingPending;
  const price=(m:CatalogMatch)=>m.kind==='anime'?animeCommercial.unitPrice:m.product.price;
  if(val('sort')==='price-asc')matches.sort((a,b)=>Number(pending(a))-Number(pending(b))||price(a)-price(b));
  if(val('sort')==='price-desc')matches.sort((a,b)=>Number(pending(a))-Number(pending(b))||price(b)-price(a));
  if(val('sort')==='name')matches.sort((a,b)=>a.product.name.localeCompare(b.product.name,'es'));
  const pages=Math.max(1,Math.ceil(matches.length/24)),page=Math.min(pages,Math.max(1,parseInt(val('page'))||1));
  return {items:matches.slice((page-1)*24,page*24),total:matches.length,page,pages};
}

export function toCatalogSuggestion(match:CatalogMatch):CatalogSuggestion{
  const p=match.product;
  return {id:p.id,slug:p.slug,name:p.name,
    color:match.kind==='anime'?match.product.category:match.product.color,
    images:match.kind==='anime'?[match.product.thumbnail]:match.product.images.slice(0,1),
    price:match.kind==='anime'?animeCommercial.unitPrice:match.product.price,
    pricingPending:match.kind==='general'&&!!match.product.pricingPending,
    href:match.kind==='anime'?animeProductHref(p.id):`/producto/${p.slug}`};
}
