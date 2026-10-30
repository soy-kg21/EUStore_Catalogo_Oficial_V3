import {orderImportedPresentation,collectionOf} from './catalog-presentation.mjs';
import type {Product} from './types';
import {collectionSearchText} from './catalog-collections.ts';

export type Params=Record<string,string|string[]|undefined>;
export function queryProducts(products:Product[],params:Params,category?:string){
 const val=(key:string)=>typeof params[key]==='string'?String(params[key]):'';
 const clean=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=clean(val('q')).slice(0,100),size=val('size'),color=val('color'),brand=val('brand'),availability=val('availability');
 const max=Number(val('max'))||Infinity;
 let list=products.filter(p=>(!category||p.category===category)&&(!q||clean(`${p.name} ${p.reference||''} ${p.sku} ${p.brand??''} ${p.category} ${collectionSearchText(p)} ${p.color}`).includes(q))&&(!size||p.sizes.includes(size))&&(!color||p.color===color)&&(!brand||p.brand===brand)&&(!Number.isFinite(max)||(!p.pricingPending&&p.price<=max))&&(!availability||(availability==='confirmed'?p.stock!==0:false)));
 if(!val('sort')&&list.length&&list.every(p=>collectionOf(p)==='importadas'))list=orderImportedPresentation(list,val('display')==='mobile');
 if(val('sort')==='price-asc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||a.price-b.price);if(val('sort')==='price-desc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||b.price-a.price);if(val('sort')==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 const pages=Math.max(1,Math.ceil(list.length/24));const page=Math.min(pages,Math.max(1,parseInt(val('page'))||1));
 return {items:list.slice((page-1)*24,page*24),total:list.length,page,pages};
}
