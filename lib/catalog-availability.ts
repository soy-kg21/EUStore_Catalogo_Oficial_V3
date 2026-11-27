type Inventory = {stock?:number|null;variants?:{size:string;quantity:number|null}[]};

export function matchesCatalogAvailability(product:Inventory, filter:string, size:string) {
  if(!filter)return true;
  const inventory=product.variants?.filter(variant=>!size||variant.size===size).map(variant=>variant.quantity)
    ??[product.stock??null];
  if(filter==='confirmed')return inventory.some(quantity=>quantity!==null&&quantity>0);
  if(filter==='unknown')return inventory.includes(null);
  return false;
}
