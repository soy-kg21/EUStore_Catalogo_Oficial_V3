'use client';
import AnimeCatalogImage from './AnimeCatalogImage';
import {memo} from 'react';
import AnimeProductLink from './AnimeProductLink';
import {ArrowUpRight,Check} from 'lucide-react';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref} from '@/lib/anime-routes';
import {animeCommercial} from '@/lib/anime-commercial';
import {money} from '@/lib/config';
import styles from './catalog-card.module.css';

function AnimeProductCard({product,onNavigate,quantity=0,eager=false}:{product:AnimeClientProduct;quantity?:number;onNavigate?:()=>void;eager?:boolean}){
 const href=animeProductHref(product.id),reference=product.id.replace('EU-ANIME-','');
 return <article className={`product-card ${styles.card}`} id={`anime-card-${product.id}`}>
  <AnimeProductLink productId={product.id} href={href} className={`card-image ${styles.media}`} onClick={onNavigate} aria-label={`Ver ${product.name}`}>
   <AnimeCatalogImage product={product} alt={`${product.name}, referencia ${reference}`} eager={eager}/>
   <span className={`card-label ${styles.badge}`}>{product.category}</span>
   <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={19}/></span>
   {quantity>0&&<span className={styles.selected}><Check size={13}/>{quantity} en tu combo</span>}
  </AnimeProductLink>
  <div className={`card-info ${styles.info}`}>
   <p className={styles.meta}><span title={product.category}>{product.category}</span><span>REF: {reference}</span></p>
   <h3><AnimeProductLink productId={product.id} href={href} onClick={onNavigate}>{product.name}</AnimeProductLink></h3>
   <div className={`price-stack ${styles.price}`}>
    {product.position===undefined||product.offer?<strong>{product.offer?.quantity||animeCommercial.promoQuantity} por {money(product.offer?.total||animeCommercial.promoTotal)}</strong>:<strong>{money(product.price)}</strong>}
    <small>1 camiseta {money(product.price)}</small>
   </div>
   <p className={`product-benefits ${styles.benefits}`} title={product.conditions||animeCommercial.conditions}>{product.benefits||product.conditions||'Consulta las condiciones de entrega'}</p>
   <span className={`card-sizes ${styles.sizes}`}>{product.sizes.join(' / ')}</span>
  </div>
 </article>;
}
export default memo(AnimeProductCard);
