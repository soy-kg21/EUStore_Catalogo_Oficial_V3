import {orderGeneralPresentation} from './catalog-presentation.mjs';
import {withCommercial} from './commercial';
import {getLiveCatalog} from './live-catalog';
import {toLiveGeneral,withCatalogCollection} from './live-general-product';
import {mergePublishedProducts} from './publication-overlay';
import snapshot from '@/data/catalog.json';
import type {Product} from './types';
import {cache} from 'react';
// No client imports: the catalog and connection configuration remain server-side.
export const getProducts=cache(async ():Promise<Product[]>=>{
 const live=await getLiveCatalog(),published=live?.products.filter(p=>p.section!=='anime').map(toLiveGeneral)||[];
 if(live&&!live.partial)return orderGeneralPresentation(published.sort((a,b)=>a.rank-b.rank));
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;
 if(!url&&!key){const baseline=(snapshot as Product[]).filter(p=>p.state!=='inactive').map(withCommercial).map(withCatalogCollection);return orderGeneralPresentation((live?mergePublishedProducts(baseline,published,live,['general','importadas']):baseline).sort((a,b)=>a.rank-b.rank));}
 if(!url||!key)throw new Error('Supabase configuration incomplete');
 const result:Product[]=[];
 for(let offset=0;;offset+=500){
 const response=await fetch(`${url}/rest/v1/catalog_public?select=payload&order=id&offset=${offset}&limit=500`,{headers:{apikey:key,Authorization:`Bearer ${key}`},next:{revalidate:60}});
 if(!response.ok)throw new Error('Catalog temporarily unavailable');
 const rows=await response.json() as {payload:Product}[];result.push(...rows.map(r=>r.payload));if(rows.length<500)break;
 }
 const baseline=result.filter(p=>p.state!=='inactive').map(withCommercial).map(withCatalogCollection);
 return orderGeneralPresentation((live?mergePublishedProducts(baseline,published,live,['general','importadas']):baseline).sort((a,b)=>a.rank-b.rank));
});
export const getProduct=async(slug:string)=>(await getProducts()).find(p=>p.slug===slug);
export {queryProducts} from './product-query';
export type {Params} from './product-query';
