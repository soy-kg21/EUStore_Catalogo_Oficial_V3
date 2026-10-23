import type {Product} from './types';
export function discount(p:Product){return !p.pricingPending&&p.previousPrice&&p.previousPrice>p.price?Math.round((1-p.price/p.previousPrice)*100):0}
export function publicProduct(product:Product):Product{
 const result={...product};
 delete result.commercialGroup;
 delete result._live;
 result.warehouse=null;result.family=null;
 result.sku=product._live?product.sku:'EU-'+product.id.replace(/[^a-z0-9]/gi,'').slice(-10).toUpperCase();
 const safe=(s:string)=>/\b(?:dropi|master\s*shop|bodegas?|B[1-7])\b/i.test(s)?'':s;
 result.description=safe(result.description);result.benefits=result.benefits.map(safe).filter(Boolean);
 return result;
}
