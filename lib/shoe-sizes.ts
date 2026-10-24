const sizeOrder=new Intl.Collator('es',{numeric:true,sensitivity:'base'});

/** Keep original variant keys for selection/cart; only presentation is shortened. */
export function shoeSizeLabel(value:string,system=''){
  const raw=value.trim();
  const match=raw.match(/^(?:(EUR|EU|US|UK)\s*)?(\d+(?:[.,]\d+)?)(?:\s*(EUR|EU|US|UK))?$/i);
  if(!match)return {label:raw,system:system.toUpperCase()};
  const unit=(match[1]||match[3]||system).toUpperCase();
  return {label:match[2],system:unit==='EU'?'EUR':unit};
}

export function orderedShoeSizes(sizes:string[]){
  return [...new Set(sizes)].sort((a,b)=>{
    const x=shoeSizeLabel(a),y=shoeSizeLabel(b),left=Number(x.label.replace(',','.')),right=Number(y.label.replace(',','.'));
    if(x.system===y.system&&Number.isFinite(left)&&Number.isFinite(right))return left-right;
    return sizeOrder.compare(a,b);
  });
}
