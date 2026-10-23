import config from '@/data/pricing-policy.json';
import editorial from '@/data/product-editorial.json';
import groups from '@/data/commercial-groups.json';
import type {Product} from './types';
export type Rule={regular:number;retail:number[];mixed?:number;mixedScope?:string;wholesale?:number[][]};
export const rules:Record<string,Rule>=config.rules;
export function groupOf(p:Product){return (groups as Record<string,string>)[p.id]||p.commercialGroup||((p.warehouse==='B5')?(p.category==='camisetas'?'B5-270':'B5-CP'):p.warehouse)||''}
export function ruleOf(p:Product){const g=groupOf(p);return rules[/^B1-[BCDE]$/.test(g)?'B1-standard':g]}
export {discount} from './product-display';
export function withCommercial(p:Product):Product{
 if(p._live)return p;
 // Confirmed display corrections apply to both the local snapshot and Supabase.
 // IDs, slugs, stock and commercial rules remain unchanged.
 const correction=(editorial as Record<string,Pick<Product,'name'|'color'|'description'|'seoTitle'|'seoDescription'>>)[p.id];
 if(correction)p={...p,...correction};
 const rule=ruleOf(p),g=groupOf(p);
 const benefits=[p.warehouse==='B3'?'Envío incluido hasta 3 pares; de 4 a 5, recargo por confirmar':'Envío incluido hasta 5 unidades por bodega','Pago contra entrega hasta 5 unidades por bodega'];
 if(p.warehouse==='B1'||p.warehouse==='B2')benefits.push('Seguro de transporte');
 if(p.warehouse==='B1')benefits.push('Medias de obsequio');
 return {...p,description:p.description.replace('con combos automáticos al llevar 2, 3 o 4 pares de esta misma bodega,','con beneficios según la selección,'),commercialGroup:g,pricingPending:false,...(rule?{price:rule.retail[0],previousPrice:rule.regular}:{}),benefits};
}
