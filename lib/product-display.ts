import type {Product} from './types';
export function discount(p:Product){return !p.pricingPending&&p.previousPrice&&p.previousPrice>p.price?Math.round((1-p.price/p.previousPrice)*100):0}
export function publicProduct(product:Product):Product{
 const result={...product};
 delete result.commercialGroup;
 return result;
}
