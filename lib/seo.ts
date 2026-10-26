import {productReference} from './product-content';
import type {Metadata} from 'next';import {ORIGIN} from './config';import type {Product} from './types';
export function metadata(title:string,description:string,path='',image?:string):Metadata{return {title,description,alternates:{canonical:ORIGIN+path},openGraph:{title,description,url:ORIGIN+path,type:'website',siteName:'Evolución Urbana',locale:'es_CO',images:image?[{url:ORIGIN+image}]:[{url:ORIGIN+'/imagenes/logo-wpp.jpg'}]},twitter:{card:'summary_large_image',title,description,images:[ORIGIN+(image||'/imagenes/logo-wpp.jpg')]}}}

// Production is public by default. A false flag can still pause a release;
// Vercel previews and local development always stay out of search results.
export function isIndexingEnabled():boolean {
  if(process.env.INDEXING_ENABLED==='false')return false;
  if(process.env.VERCEL_ENV)return process.env.VERCEL_ENV==='production';
  return process.env.NODE_ENV==='production';
}

export function siteSchema(){return {
  '@context':'https://schema.org',
  '@graph':[
    {
      '@type':'Organization',
      '@id':ORIGIN+'/#organization',
      name:'Evolución Urbana',
      alternateName:'Evolución Urbana Store',
      url:ORIGIN+'/',
      logo:ORIGIN+'/imagenes/logo.png',
      sameAs:[
        'https://www.instagram.com/evolucion_urbanacol/',
        'https://www.facebook.com/evolucion.urbanacol',
        'https://www.tiktok.com/@evolucion_urbanacol',
      ],
    },
    {
      '@type':'WebSite',
      '@id':ORIGIN+'/#website',
      name:'Evolución Urbana',
      alternateName:['Evolución Urbana Store','Evolucion Urbana'],
      url:ORIGIN+'/',
      inLanguage:'es-CO',
      publisher:{'@id':ORIGIN+'/#organization'},
    },
  ],
}}
export function productSchema(p:Product){return {'@context':'https://schema.org','@type':'Product',name:p.name,sku:productReference(p)||undefined,image:p.images.map(i=>ORIGIN+i),description:p.seoDescription,...(p.brand?{brand:{'@type':'Brand',name:p.brand}}:{}),...(p.pricingPending?{}:{offers:{'@type':'Offer',url:ORIGIN+'/producto/'+p.slug,priceCurrency:'COP',price:p.price,...(p.stock!==null?{availability:p.stock>0?'https://schema.org/InStock':'https://schema.org/OutOfStock'}:{})}})}}
export const jsonLd=(data:unknown)=>JSON.stringify(data).replace(/</g,'\\u003c');
