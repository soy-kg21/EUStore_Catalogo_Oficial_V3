import type {Product} from './types';

export function productRecommendations(products:Product[],current:Product){
  return products.filter(p=>p.id!==current.id&&p.category===current.category&&p.collection===current.collection)
    .sort((a,b)=>Number(b.brand===current.brand)-Number(a.brand===current.brand)).slice(0,4);
}
