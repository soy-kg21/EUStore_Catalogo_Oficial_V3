import {productReference} from './product-content';
import {withSocksGift} from './catalog-benefits';
import catalogAssets from '@/data/catalog-assets.json';
import type {Product} from './types';
import type {LiveProduct} from './live-types';
import type {CatalogCollection} from './catalog-collections';

// Server-only classification. Public products retain their collection, never this map.
const warehouses:Record<string,string>={
  ac2c5a647314030aca259625:'B1',b59911216dae93e2b58ad8f1:'B2',
  '39ee572347a7732f37ac5f40':'B3','2620dd993a9eaa70a3c90fe0':'B4',
  '05174c6880fa3ccb9b1991ea':'B5','17025e42553b9818edde10de':'B6',
};
export function warehouseForBucket(bucket?:string){return bucket?warehouses[bucket]:undefined;}
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function classification(warehouse:string,category:string,imported=false):{category:string;collection?:CatalogCollection}{
  if(imported||warehouse==='B4')return {category:'zapatillas',collection:'importadas'};
  if(['B1','B2','B3'].includes(warehouse))return {category:'zapatillas',collection:'nacionales'};
  if(warehouse==='B6')return {category:'conjuntos',collection:'conjuntos-buzos'};
  const value=normalize(category);
  if(/buzo|sudadera|hoodie/.test(value))return {category:'conjuntos',collection:'conjuntos-buzos'};
  if(warehouse==='B5'){
    if(/^(?:conjunto|conjuntos|camiseta\s*\+\s*pantaloneta)(?:\s|$)/.test(value))return {category:'conjuntos',collection:'conjuntos-cortos'};
    if(/^(?:camiseta|camisetas|oversize)(?:\s|$)/.test(value))return {category:'camisetas',collection:'oversize'};
  }
  return {category};
}
export function withCatalogCollection(product:Product):Product{
  return {...product,...classification(product.warehouse||'',product.category,product.collection==='importadas')};
}
export function toLiveGeneral(p:LiveProduct):Product{
  if(p.section==='anime')throw new Error('Anime conserva su catálogo y sus fichas propios.');
  const warehouse=warehouseForBucket(p.commerce.bucket)||'';
  const productClass=classification(warehouse,p.category,p.section==='importadas');
  const imported=productClass.collection==='importadas';
  const delivery=p.section==='importadas'
    ? ['Envío incluido de 1 a 2 pares. De 3 a 5 se suma el envío al pedido. Desde 6, cotización con asesor.','Pago anticipado.']
    : productClass.collection==='conjuntos-cortos'
      ? ['Envío por cantidad y combinación. Revisa el valor en el resumen del carrito.']
      : [];
  const benefits=withSocksGift(
    (delivery.length?[...delivery,p.benefits?.replace(/[^.!?]*(?:env[ií]o|despacho)[^.!?]*[.!?]?/gi,'').trim(),...(!imported?[p.payment]:[])]:[p.benefits,p.conditions,p.payment]).filter(Boolean),
    warehouse==='B1'&&productClass.collection==='nacionales',
  );
  const commerce=imported
    ? {...p.commerce,rule:null,quoteFrom:6,shippingFrom:6,advance:true,perUnit:true,retailShipping:'importadas' as const}
    : productClass.collection==='conjuntos-cortos'?{...p.commerce,retailShipping:'conjuntos-cortos' as const}:p.commerce;
  const variants=p.sizes,stock=variants.some(v=>v.quantity===null)?null:variants.reduce((sum,v)=>sum+(v.quantity||0),0);
  // Known photos are public static files. Avoid an authenticated API redirect
  // inside the image optimizer when reviewing protected deployments.
  const images=[...new Set(Object.values(p.images).map(src=>{
    const sha=/^\/api\/catalog-media\/([a-f0-9]{64})$/.exec(src)?.[1];
    return sha?(catalogAssets as Record<string,string>)[sha]||src:src;
  }))];
  return {...productClass,labels:p.labels,reference:productReference({reference:p.reference,id:p.route.id,slug:p.route.slug}),sizeSystem:p.sizeSystem,id:p.route.id,sku:'EU-'+p.id.slice(0,8).toUpperCase(),slug:p.route.slug,name:p.name,brand:p.brand||null,model:p.name,price:p.price,previousPrice:p.regularPrice&&p.regularPrice>p.price?p.regularPrice:null,currency:'COP',color:p.color,sizes:variants.map(v=>v.size),images,state:'active',stock,warehouse:null,family:null,description:p.description,benefits,sizeNote:['EUR','EU'].includes(p.sizeSystem)?'Tallas europeas (EUR).':p.sizeSystem==='LETRAS'?'Revisa la talla de esta referencia y consulta sus medidas.':'Confirma las medidas de esta referencia.',material:p.materials||null,weight:p.extras.weight,featured:p.extras.featured,rank:p.position,seoTitle:p.name+' | Evolución Urbana',seoDescription:p.description||p.name,_live:commerce,variants};
}
