import merchandising from '@/data/anime-merchandising.json';
import index from '@/data/anime-index.json';
import {orderAnimeProducts, type AnimeClientProduct, type AnimeFilters, type AnimeLine} from '@/lib/anime-catalog-core';
const aliases=index.aliases as Record<string,string>;
const canonicalId=(id:string)=>aliases[id]||id;
const doubles=new Set(merchandising.doublePrintIds.map(canonicalId));
export function isDoublePrint(id:string){return doubles.has(canonicalId(id));}
/** Filter first; five doubles + one other from position one; paginate last. */
export function orderAnimeShopProducts<T extends AnimeClientProduct>(products:T[],filters:Pick<AnimeFilters,'linea'>):T[]{
 const priority:readonly string[]=Object.prototype.hasOwnProperty.call(merchandising.byLine,filters.linea)?merchandising.byLine[filters.linea as AnimeLine]:merchandising.all;
 const available=new Map(products.map(product=>[product.id,product]));const featured:T[]=[];
 for(const legacyId of priority){const id=canonicalId(legacyId),product=available.get(id);if(product){featured.push(product);available.delete(id);}}
 const baseline=[...featured,...orderAnimeProducts(products.filter(product=>available.has(product.id)))];
 const double=baseline.filter(product=>isDoublePrint(product.id)),other=baseline.filter(product=>!isDoublePrint(product.id));
 const result:T[]=[];let d=0,s=0;
 while(d<double.length){for(let n=0;n<5&&d<double.length;n++)result.push(double[d++]);if(s<other.length)result.push(other[s++]);}
 return [...result,...other.slice(s)];
}
