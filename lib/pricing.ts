import type {Product,CartLine} from './types';
import {ruleOf,withCommercial} from './commercial';
export function quote(lines:CartLine[],products:Product[]){
 const catalog=products.map(withCommercial);
 const rows=lines.map(l=>{const p=catalog.find(p=>p.id===l.id&&p.state!=='inactive');if(!p||!p.sizes.includes(l.size)||!Number.isInteger(l.quantity)||l.quantity<1||l.quantity>100)throw new Error('Selección inválida: revisa referencia, talla y cantidad.');return {...l,product:p,unit:p.price as number|null,total:p.price*l.quantity as number|null,reason:''}});
 const qty=(w:string,c?:string)=>rows.filter(r=>r.product.warehouse===w&&(!c||r.product.category===c)).reduce((a,r)=>a+r.quantity,0);
 const warehouses=[...new Set(rows.map(r=>r.product.warehouse))];
 const count=rows.reduce((a,r)=>a+r.quantity,0);
 const b1=qty('B1'),b2=qty('B2'),b5=qty('B5');
 const reasons=new Set<string>();
 for(const r of rows){
  const p=r.product,w=p.warehouse||'',n=qty(w),rule=ruleOf(p);
  if(p.pricingPending)r.reason='El asesor confirmará la tarifa de esta referencia.';
  else if(n>=6&&['B1','B2','B3','B4'].includes(w))r.reason='Desde 6 unidades de esta bodega, recibe una cotización mayorista personalizada.';
  else if(n>=6){const tier=rule?.wholesale?.find(([min,max])=>n>=min&&n<=max);if(tier)r.unit=tier[2];else r.reason='Para esta cantidad, consulta una cotización personalizada.'}
  else if(rule){r.unit=rule.mixed&&(rule.mixedScope==='warehouse'?n:count)>=2?rule.mixed:rule.retail[Math.min(n,5)-1]}
  if(r.reason){r.unit=null;r.total=null;reasons.add(r.reason)}else r.total=r.unit!*r.quantity;
 }
 const advance=warehouses.some(w=>qty(w||'')>=6);
 const shippingPending=advance||qty('B3')>=4;
 if(qty('B3')>=4&&qty('B3')<=5)reasons.add('Esta selección tiene un recargo logístico de $16.000 a $20.000, que confirmará tu asesor.');
 const pricePending=rows.some(r=>r.total===null);
 const subtotal=pricePending?null:rows.reduce((a,r)=>a+r.total!,0);
 const shipping=shippingPending?null:0;
 const total=subtotal===null||shipping===null?null:subtotal+shipping;
 return {rows,subtotal,shipping,total,requiresQuote:total===null,pricePending,shippingPending,reasons:[...reasons],advance,warehouses,b1,b2,b5};
}
