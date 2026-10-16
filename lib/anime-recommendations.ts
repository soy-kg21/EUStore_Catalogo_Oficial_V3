import type {AnimeProduct} from './anime-catalog-core';

type RecommendationProduct=Pick<AnimeProduct,'id'|'line'|'category'|'canonicalId'>;

/** Fill the four existing cards: same universe, same line, then other lines. */
export function selectAnimeRecommendations<T extends RecommendationProduct>(product:RecommendationProduct,catalog:readonly T[]):T[]{
 const selected:T[]=[],seen=new Set([product.id,product.canonicalId||product.id]);
 const tiers=[
  (item:T)=>item.line===product.line&&item.category===product.category,
  (item:T)=>item.line===product.line,
  (_item:T)=>true,
 ];
 for(const matches of tiers){
  for(const item of catalog){
   if(item.canonicalId||seen.has(item.id)||!matches(item))continue;
   selected.push(item);seen.add(item.id);
   if(selected.length===4)return selected;
  }
 }
 return selected;
}
