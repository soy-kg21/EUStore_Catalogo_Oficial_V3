import type {CartLine,Product} from './types';
type PricingProduct=Pick<Product,'id'|'price'|'variants'|'_live'>;
export function quoteLive<T extends PricingProduct>(lines:CartLine[],products:T[]){
 const seen=new Set<string>(),rows=lines.map(l=>{const p=products.find(p=>p.id===l.id),key=l.id+':'+l.size,v=p?.variants?.find(v=>v.size===l.size);if(!p?._live||!v||seen.has(key)||!Number.isInteger(l.quantity)||l.quantity<1||l.quantity>100||v.quantity!==null&&l.quantity>v.quantity)throw Error('Revisa referencia, talla y cantidad disponible.');seen.add(key);return {...l,product:p,unit:p.price as number|null,total:p.price*l.quantity as number|null,reason:''};});
 const qty=(bucket:string)=>rows.filter(r=>r.product._live!.bucket===bucket).reduce((a,r)=>a+r.quantity,0),count=rows.reduce((a,r)=>a+r.quantity,0),reasons=new Set<string>(),handled=new Set<string>();
 for(const row of rows){const c=row.product._live!,rule=c.rule,n=qty(c.bucket);
  if(c.perUnit){row.total=row.unit===null?null:row.unit*row.quantity;}
  else if(rule?.kind==='total'){
   const groupKey=c.bucket+JSON.stringify(rule);if(handled.has(groupKey))continue;handled.add(groupKey);const group=rows.filter(r=>r.product._live!.bucket===c.bucket&&JSON.stringify(r.product._live!.rule)===JSON.stringify(rule)),q=group.reduce((a,r)=>a+r.quantity,0),tier=rule.wholesale.find(([min,max])=>q>=min&&q<=max),total=q<=5?rule.retail[q-1]:tier?q*tier[2]:null;let assigned=0;
   group.forEach((r,i)=>{r.total=total===null?null:i===group.length-1?total-assigned:Math.floor(total*r.quantity/q);assigned+=r.total||0;r.unit=r.total===null?null:r.total/r.quantity;});
  }else{if(c.quoteFrom!==null&&n>=c.quoteFrom)row.unit=null;else if(n>=6){const tier=rule?.wholesale.find(([min,max])=>n>=min&&n<=max);row.unit=tier?tier[2]:null;}else if(rule)row.unit=rule.mixed&&(rule.mixedScope==='bucket'?n:count)>=2?rule.mixed:rule.retail[Math.min(n,5)-1];row.total=row.unit===null?null:row.unit*row.quantity;}
  if(row.total===null)reasons.add('Esta cantidad requiere una cotización personalizada.');
 }
 const shippingPending=rows.some(r=>qty(r.product._live!.bucket)>=r.product._live!.shippingFrom),advance=rows.some(r=>r.product._live!.advance||qty(r.product._live!.bucket)>=6),subtotal=rows.some(r=>r.total===null)?null:rows.reduce((a,r)=>a+r.total!,0),shipping=shippingPending?null:0,total=subtotal===null||shipping===null?null:subtotal+shipping;
 return {rows,subtotal,shipping,total,requiresQuote:total===null,pricePending:subtotal===null,shippingPending,reasons:[...reasons],advance,warehouses:[...new Set(rows.map(r=>r.product._live!.bucket))],b1:0,b2:0,b5:0};
}
