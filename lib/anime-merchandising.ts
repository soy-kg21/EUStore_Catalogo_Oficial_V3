import {orderAnimePresentation,isDoubleProduct} from './catalog-presentation.mjs';
import type {AnimeClientProduct,AnimeFilters} from './anime-catalog-core';
export const isDoublePrint=(product:string|AnimeClientProduct)=>isDoubleProduct(typeof product==='string'?{id:product}:product);
/** Four double prints + one single; protected from synchronization positions. */
export function orderAnimeShopProducts<T extends AnimeClientProduct>(products:T[],filters:Pick<AnimeFilters,'linea'>):T[]{return orderAnimePresentation(products,filters.linea);}
