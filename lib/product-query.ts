import {orderImportedPresentation,orderNationalPresentation,collectionOf} from './catalog-presentation.mjs';
import {warehouseForBucket} from './live-general-product';
import type {Product} from './types';
import {collectionSearchText} from './catalog-collections.ts';
import {paginateCatalog} from './catalog-pagination';
import {matchesCatalogAvailability} from './catalog-availability';

export type Params=Record<string,string|string[]|undefined>;

export function catalogQueryString(params: Params) {
 const query = new URLSearchParams();
 for (const [key, value] of Object.entries(params)) {
  if (typeof value === 'string') query.set(key, value);
  else value?.forEach(entry => query.append(key, entry));
 }
 return query.size ? '?' + query.toString() : '';
}
export function queryProducts(products:Product[],params:Params,category?:string,throughPage?:string){
 const val=(key:string)=>typeof params[key]==='string'?String(params[key]):'';
 const clean=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=clean(val('q')).slice(0,100),size=val('size'),color=val('color'),brand=val('brand'),availability=val('availability');
 const max=val('max').trim()?Number(val('max')):Infinity;
 let list=products.filter(p=>(!category||p.category===category)&&(!q||clean(`${p.name} ${p.reference||''} ${p.sku} ${p.brand??''} ${p.category} ${collectionSearchText(p)} ${p.color}`).includes(q))&&(!size||p.sizes.includes(size))&&(!color||p.color===color)&&(!brand||p.brand===brand)&&(!Number.isFinite(max)||(!p.pricingPending&&p.price<=max))&&matchesCatalogAvailability(p,availability,size));
 if(!val('sort')&&list.length&&list.every(p=>collectionOf(p)==='importadas'))list=orderImportedPresentation(list,val('display')==='mobile');
 if(!val('sort')&&list.length&&list.every(p=>collectionOf(p)==='nacionales')){
  list=orderNationalPresentation(list,product=>product.warehouse??warehouseForBucket(product._live?.bucket));
 }
 if(val('sort')==='price-asc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||a.price-b.price);if(val('sort')==='price-desc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||b.price-a.price);if(val('sort')==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 return paginateCatalog(list,val('page'),throughPage);
}
