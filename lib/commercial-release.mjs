// One-time compatibility for publications saved before the November price change.
// Recognize only the exact previous tariff; later owner-defined tariffs are preserved.
const oldTotals=[68000,93000,126000,152000,180000];
export const novemberTotals=[68000,93000,126000,156000,185000];
export function currentCommercialPublication(document){
 if(!document?.products)return document;
 let changed=false;
 const products=document.products.map(p=>{
  const rule=p.commerce?.rule;
  if(p.section!=='anime'||rule?.kind!=='total'||JSON.stringify(rule.retail)!==JSON.stringify(oldTotals))return p;
  changed=true;return {...p,commerce:{...p.commerce,rule:{...rule,retail:[...novemberTotals]}}};
 });
 return changed?{...document,products}:document;
}
