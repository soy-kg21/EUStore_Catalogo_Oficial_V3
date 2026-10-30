import references from '@/data/product-references.json';
import {money} from './config';
import type {Product} from './types';
import type {quote} from './pricing';

export function productInquiryMessage(product:Product,size:string,origin:string){
 return [
  'Hola Evolución Urbana, estoy interesado en:',
  [`Producto: ${product.name}`,`Código: ${productReference(product)||'Por confirmar'}`,`Color: ${product.color}`,`Talla: ${size}`,`Precio: ${product.pricingPending?'Por confirmar':money(product.price)+' COP'}`].join('\n'),
  `${origin}/producto/${product.slug}`,
  product.collection==='importadas'?'Pago anticipado por unidad. El envío está incluido en el precio.':'Quisiera asesoría sobre talla y entrega.',
  'Quiero confirmar disponibilidad, talla y entrega por WhatsApp.',
 ].join('\n\n');
}
export function cartInquiryMessage(data:ReturnType<typeof quote>,origin:string,paymentNote:string){
 return [
  'Hola Evolución Urbana, quisiera asesoría para esta selección:',
  ...data.rows.map((row,index)=>[
   `${index+1}. Producto: ${row.product.name}`,
   `Código: ${productReference(row.product)||row.product.sku}`,
   `Color: ${row.product.color}`,
   `Talla: ${row.size}`,
   `Cantidad: ${row.quantity}`,
   `Subtotal: ${row.total===null?'Por confirmar':money(row.total)+' COP'}`,
  ].join('\n')+'\n\n'+`${origin}/producto/${row.product.slug}`),
  [data.subtotal===null?'Solicito cotización personalizada.':'Productos: '+money(data.subtotal)+' COP',data.shippingPending?'Envío por cotizar con asesor':'Envío incluido',data.total===null?'Total pendiente de confirmación':'Total: '+money(data.total)+' COP'].join('\n'),
  data.warehouses.length>1?'Despachos separados, conservando beneficios y descuentos.':'',
  paymentNote,
  'Mi ciudad es:',
  'Por favor confirmar disponibilidad y total.',
 ].filter(Boolean).join('\n\n');
}

type ProductContent={id?:string;sourceId?:string;slug?:string;sku?:string;reference?:string;name?:string;color?:string;category?:string;section?:string;channel?:string;line?:string;weight?:number|null;weightGrams?:number|null;description?:string;material?:string|null;materials?:string;profile?:{reference?:string;description?:string;name?:string;color?:string;category?:string};commercial?:{materialsConfirmed?:string|null}};
const original=references as Record<string,string>;
const clean=(value:unknown)=>typeof value==='string'?value.trim():'';
export function productReference(product:ProductContent):string{
 const explicit=clean(product.reference)||clean(product.profile?.reference);if(explicit)return explicit;
 for(const key of [product.sourceId,product.id,product.slug,product.sku])if(key&&original[key])return original[key];
 const source=clean(product.sourceId)||clean(product.id);
 if(/^EU-(?:ANIME|IMP)-\d+$/i.test(source))return source;
 const sku=clean(product.sku);
 return sku&&!/^EU-(?:[a-f0-9]{8,}|B[1-7]-[a-f0-9]{12})$/i.test(sku)&&/^[\p{L}\p{N}][\p{L}\p{N} ._/-]{0,79}$/u.test(sku)?sku:'';
}
export function shortProductDescription(product:ProductContent,limit=180):string{
 const raw=clean(product.description)||clean(product.profile?.description);
 const sentences=raw.replace(/\s+/g,' ').split(/(?<=[.!?])\s+/).filter(s=>!/(?:env[ií]os?|contraentrega|transporte|precios?|pago|pedidos?|bodegas?|\bB[1-7]\b)/i.test(s));
 const name=clean(product.name)||clean(product.profile?.name),color=clean(product.color)||clean(product.profile?.color);
 const material=clean(product.material)||clean(product.materials)||clean(product.commercial?.materialsConfirmed);
 const title=(product.section==='anime'||product.channel==='anime'||['anime','cartoon','rock','urbanos'].includes(product.line||''))&&!/camiseta/i.test(name)?'Camiseta '+name:name;
 const fallback=`${title}${color&&!name.toLocaleLowerCase('es').includes(color.toLocaleLowerCase('es'))?' · '+color:''}.${material&&!/confirmar|pendiente/i.test(material)?' Material: '+material+'.':''}`;
 const text=sentences.slice(0,2).join(' ')||fallback;
 if(text.length<=limit)return text;
 const cut=text.slice(0,limit-1).replace(/\s+\S*$/,'').replace(/[ ,;:.]+$/,'');return cut+'…';
}
export const animeShippingSummary='1–5: envío incluido, sujeto a cobertura.';
