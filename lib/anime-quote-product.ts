import type {LiveProduct} from './live-types';
// Pricing projection only: Anime Shop keeps its own pages and public identity.
export function toAnimeQuoteProduct(product:LiveProduct){
 if(product.section!=='anime')throw new Error('La selección no pertenece a Anime Shop.');
 return {id:product.route.id,price:product.price,variants:product.sizes,_live:product.commerce};
}
