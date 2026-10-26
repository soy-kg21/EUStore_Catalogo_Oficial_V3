'use client';
import {useSyncExternalStore} from 'react';
import type {Product} from '@/lib/types';
import ProductCard from './ProductCard';
const query='(max-width:700px)';
const subscribe=(notify:()=>void)=>{const media=window.matchMedia(query);media.addEventListener('change',notify);return()=>media.removeEventListener('change',notify);};
export default function ResponsiveImportedGrid({desktop,mobile}:{desktop:Product[];mobile:Product[]}){
 const compact=useSyncExternalStore(subscribe,()=>window.matchMedia(query).matches,()=>false);
 const products=compact?mobile:desktop;
 return <div className="product-grid" id="catalogo-productos" data-imported-layout={compact?'mobile':'desktop'}>{products.map((product,index)=><ProductCard key={product.id} product={product} label="LÍNEA IMPORTADA" priority={index<4}/>)}</div>;
}
