import {withCommercial} from './commercial';
import snapshot from '@/data/catalog.json';
import type {Product} from './types';
import {cache} from 'react';
// No client imports: the catalog and connection configuration remain server-side.
export const getProducts=cache(async ():Promise<Product[]>=>{
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
 if(!url&&!key)return (snapshot as Product[]).filter(p=>p.state!=='inactive').map(withCommercial).sort((a,b)=>a.rank-b.rank);
 if(!url||!key)throw new Error('Supabase configuration incomplete');
 const result:Product[]=[];
 for(let offset=0;;offset+=500){
 const response=await fetch(`${url}/rest/v1/catalog_public?select=payload&order=id&offset=${offset}&limit=500`,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:60}});
 if(!response.ok)throw new Error('Catalog temporarily unavailable');
 const rows=await response.json() as {payload:Product}[];result.push(...rows.map(r=>r.payload));if(rows.length<500)break;
 }
 return result.filter(p=>p.state!=='inactive').map(withCommercial).sort((a,b)=>a.rank-b.rank);
});
export const getProduct=async(slug:string)=>(await getProducts()).find(p=>p.slug===slug);
export type Params=Record<string,string|string[]|undefined>;
export function queryProducts(products:Product[],params:Params,category?:string){
 const val=(key:string)=>typeof params[key]==='string'?String(params[key]):'';
 const clean=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const q=clean(val('q')).slice(0,100),size=val('size'),color=val('color'),brand=val('brand'),availability=val('availability');
 const max=Number(val('max'))||Infinity;
 const list=products.filter(p=>(!category||p.category===category)&&(!q||clean(`${p.name} ${p.sku} ${p.brand??''} ${p.category} ${p.color}`).includes(q))&&(!size||p.sizes.includes(size))&&(!color||p.color===color)&&(!brand||p.brand===brand)&&(!Number.isFinite(max)||(!p.pricingPending&&p.price<=max))&&(!availability||(availability==='confirmed'?p.stock!==null&&p.stock>0:p.stock===null)));
 if(val('sort')==='price-asc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||a.price-b.price);if(val('sort')==='price-desc')list.sort((a,b)=>Number(!!a.pricingPending)-Number(!!b.pricingPending)||b.price-a.price);if(val('sort')==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'es'));
 const pages=Math.max(1,Math.ceil(list.length/24));const page=Math.min(pages,Math.max(1,parseInt(val('page'))||1));
 return {items:list.slice((page-1)*24,page*24),total:list.length,page,pages};
}
