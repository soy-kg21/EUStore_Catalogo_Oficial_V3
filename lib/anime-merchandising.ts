import {orderAnimePresentation,isDoubleProduct} from './catalog-presentation.mjs';
import type {AnimeClientProduct,AnimeFilters} from './anime-catalog-core';
export const isDoublePrint=(product:string|AnimeClientProduct)=>isDoubleProduct(typeof product==='string'?{id:product}:product);
/** Five double prints and one single where both are available. */
export function orderAnimeShopProducts<T extends AnimeClientProduct>(products:T[],filters:Pick<AnimeFilters,'linea'|'doble'>):T[]{
 return orderAnimePresentation(filters.doble?products.filter(isDoublePrint):products);
}
