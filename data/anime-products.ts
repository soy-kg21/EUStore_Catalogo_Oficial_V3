import catalog from './anime-catalog.json';
import {orderAnimeProducts,type AnimeProduct,type AnimeClientProduct} from '@/lib/anime-catalog-core';
export * from '@/lib/anime-catalog-core';
// Datos únicos y alias históricos: los códigos y las URL anteriores se conservan.
export const animeProductRecords=catalog as AnimeProduct[];
const aliasMap=new Map<string,string[]>();
for(const record of animeProductRecords){if(record.canonicalId)aliasMap.set(record.canonicalId,[...(aliasMap.get(record.canonicalId)||[]),record.id]);}
export const animeProducts=orderAnimeProducts(animeProductRecords.filter(p=>!p.canonicalId).map(p=>({...p,searchAliases:aliasMap.get(p.id)||[]})));
export const animeCategories=['Todos',...new Set(animeProducts.map(p=>p.category))];
const bySlug=new Map(animeProductRecords.map(p=>[p.slug,p]));
const byId=new Map(animeProductRecords.map(p=>[p.id,p]));
export function getAnimeProduct(slug:string){return bySlug.get(slug);}
export function getCanonicalAnimeProduct(product:AnimeProduct){return byId.get(product.canonicalId||product.id)!;}
export function toAnimeClientProduct(product:AnimeProduct):AnimeClientProduct{
  const {id,slug,name,image,thumbnail,backdrop,category,line,sizes,price,isNew,material,weightGrams,fit,availability,labels,position,variants,description,benefits,conditions,offer}=product;
  return {id,slug,name,image,thumbnail,backdrop,category,line,sizes,price,isNew,material,weightGrams,fit,availability,labels,position,variants,description,benefits,conditions,offer,searchAliases:aliasMap.get(id)||[]};
}
