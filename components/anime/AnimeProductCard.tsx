'use client';
import Image from 'next/image';
import AnimeProductLink from './AnimeProductLink';
import {ArrowUpRight,Check} from 'lucide-react';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref} from '@/lib/anime-routes';
import {money} from '@/lib/config';
import styles from './shop-premium.module.css';
export default function AnimeProductCard({product,onChoose,onNavigate,quantity=0}:{product:AnimeClientProduct;onChoose?:(product:AnimeClientProduct)=>void;quantity?:number;onNavigate?:()=>void}){
 const href=animeProductHref(product.id),reference=product.id.replace('EU-ANIME-','');
 return <article className={styles.card} id={`anime-card-${product.id}`}>
  <AnimeProductLink productId={product.id} href={href} className={styles.cardMedia} onClick={onNavigate} aria-label={`Ver ${product.name}`}><Image quality={85} src={product.image} alt={`${product.name}, referencia ${product.id}`} fill sizes="(max-width: 700px) 47vw, (max-width: 1000px) 31vw, 300px"/><span className={styles.cardBadge}>{product.category}</span>{quantity>0&&<span className={styles.cardSelected}><Check size={13}/>{quantity} en tu combo</span>}</AnimeProductLink>
  <div className={styles.cardInfo}><p><span className={styles.cardCategory}>{product.category}</span><span className={styles.cardReference}>REF: {reference}</span></p><h3><AnimeProductLink productId={product.id} href={href} onClick={onNavigate}>{product.name}</AnimeProductLink></h3><div className={styles.cardPrice}><strong>{money(product.price)}</strong><span>2 por $99.000</span></div>
  {onChoose?<button type="button" className={styles.cardAction} onClick={()=>onChoose(product)} aria-label={`Ver diseño ${product.name}`}>VER DISEÑO <ArrowUpRight size={15}/></button>:<AnimeProductLink productId={product.id} className={styles.cardAction} href={href} onClick={onNavigate}>VER DISEÑO <ArrowUpRight size={15}/></AnimeProductLink>}</div>
 </article>;
}
