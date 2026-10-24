import {cache} from 'react';
import {getLiveCatalog} from './live-catalog';
import {animeProducts as baseline,toAnimeClientProduct} from '@/data/anime-products';
import {resolveAnimeProduct} from './anime-product-lookup';
import type {AnimeProduct,AnimeLine} from './anime-catalog-core';
import type {Product} from './types';
import type {LiveProduct} from './live-types';
import {mergePublishedProducts} from './publication-overlay';

export function toLiveGeneral(p:LiveProduct):Product{
 const variants=p.sizes,stock=variants.some(v=>v.quantity===null)?null:variants.reduce((sum,v)=>sum+(v.quantity||0),0);
 return {id:p.route.id,sku:'EU-'+p.id.slice(0,8).toUpperCase(),slug:p.route.slug,name:p.name,category:p.section==='importadas'?'zapatillas':p.category,brand:p.brand||null,model:p.name,price:p.price,previousPrice:p.regularPrice&&p.regularPrice>p.price?p.regularPrice:null,currency:'COP',color:p.color,sizes:variants.map(v=>v.size),images:[...new Set(Object.values(p.images))],state:'active',stock,warehouse:null,family:null,description:p.description,benefits:[p.benefits,p.conditions,p.payment].filter(Boolean),sizeNote:p.sizeSystem==='EUR'?'Tallas europeas (EUR).':'Confirma las medidas de esta referencia.',material:p.materials||null,weight:p.extras.weight,featured:p.extras.featured,rank:p.position,seoTitle:p.name+' | Evolución Urbana',seoDescription:p.description||p.name,_live:p.commerce,variants};
}
export const getAnimeProducts=cache(async():Promise<AnimeProduct[]>=>{
 const live=await getLiveCatalog();if(!live)return baseline;
 const published:AnimeProduct[]=live.products.filter(p=>p.section==='anime').sort((a,b)=>a.position-b.position).map(p=>({id:p.route.id,slug:p.route.slug,name:p.name,image:p.images.principal,thumbnail:p.images.principal,backdrop:p.images.principal,category:p.category,line:(['anime','cartoon','rock','urbanos'].includes(p.line)?p.line:'anime') as AnimeLine,sizes:p.sizes.map(v=>v.size),price:p.price,isNew:p.extras.isNew,availability:p.sizes.every(v=>v.quantity===0)?'Agotado':p.sizes.some(v=>v.quantity===null)?'Por confirmar':'Disponible',material:p.materials||'Por confirmar',weightGrams:p.extras.weight,fit:p.extras.fit,releaseBatch:'',sourceName:'',position:p.position,variants:p.sizes,description:p.description,benefits:p.benefits,conditions:p.conditions,offer:p.commerce.rule?.kind==='total'?{quantity:2,total:p.commerce.rule.retail[1]}:undefined,_live:p.commerce,searchAliases:baseline.find(b=>b.id===p.route.id)?.searchAliases||[]}));
 return mergePublishedProducts(baseline,published,live,['anime']).sort((a,b)=>(a.position||0)-(b.position||0));
});
export async function resolveLiveAnimeProduct(value:string,line?:AnimeLine){const legacy=resolveAnimeProduct(value,line),rows=await getAnimeProducts();return rows.find(p=>(legacy?p.id===legacy.id:p.id.toLowerCase()===value.toLowerCase()||p.slug===value)&&(!line||p.line===line));}
export async function getLiveAnimePricing(){const live=await getLiveCatalog();return live?.products.find(p=>p.section==='anime'&&p.commerce.rule?.kind==='total')?.commerce.rule||null;}
export const publicAnimeProduct=toAnimeClientProduct;
