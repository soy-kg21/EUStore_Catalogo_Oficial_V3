'use client';
import {useState} from 'react';
import {Check,Minus,Plus,ShoppingBag,ArrowUpRight} from 'lucide-react';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {useAnimeSelection,openAnimeCombo} from '@/lib/anime-selection';
import {trackAnimeEvent} from '@/lib/anime-events';
import styles from './shop-premium.module.css';
export default function AnimeProductOptions({product,onAdded}:{product:AnimeClientProduct;onAdded?:()=>void}){
 const selection=useAnimeSelection(),[size,setSize]=useState(''),[quantity,setQuantity]=useState(1),[added,setAdded]=useState(false);
 const existing=selection.rows.find(row=>row.id===product.id&&row.size===size)?.quantity||0;
 const atLimit=existing+quantity>99||(!existing&&selection.rows.length>=100);
 const add=()=>{if(!size||atLimit||product.variants?.find(v=>v.size===size)?.quantity===0)return;selection.add(product.id,size,quantity);setAdded(true);trackAnimeEvent('add_to_combo',{id:product.id,size,quantity,line:product.line});onAdded?.();};
 return <div className={styles.options}>
  <div className={styles.optionLabel}><strong>Elige tu talla</strong><span style={{color:'var(--accent-ink)'}}><Check size={13} style={{display:'inline',verticalAlign:'middle'}}/> {product.availability}</span></div>
  <div className={styles.sizes} role="group" aria-label={`Tallas disponibles de ${product.name}`}>{product.sizes.map(s=><button type="button" key={s} disabled={product.variants?.find(v=>v.size===s)?.quantity===0} aria-pressed={size===s} onClick={()=>{setSize(s);setAdded(false);}}>{s}</button>)}</div>
  <div className={styles.optionBottom}><div><span>Cantidad</span><div className={styles.quantity}><button type="button" disabled={quantity<=1} aria-label="Reducir cantidad" onClick={()=>{setQuantity(q=>q-1);setAdded(false);}}><Minus size={15}/></button><output aria-live="polite">{quantity}</output><button type="button" disabled={quantity>=99} aria-label="Aumentar cantidad" onClick={()=>{setQuantity(q=>q+1);setAdded(false);}}><Plus size={15}/></button></div></div><p>{!size?'Selecciona una talla para añadirla.':atLimit?'Alcanzaste el límite de esta selección.':`Talla ${size} · ${quantity} ${quantity===1?'camiseta':'camisetas'}`}</p></div>
  <button type="button" className={styles.primary} disabled={!size||atLimit||product.variants?.find(v=>v.size===size)?.quantity===0} onClick={add}>{added?<Check size={18}/>:<ShoppingBag size={18}/>} {added?'Añadida a tu combo':'Añadir a mi combo'}<Plus size={17}/></button>
  <div className={styles.feedback} role="status">{added&&<button type="button" onClick={openAnimeCombo}>Revisar mi combo y continuar <ArrowUpRight size={16}/></button>}</div>
 </div>;
}
