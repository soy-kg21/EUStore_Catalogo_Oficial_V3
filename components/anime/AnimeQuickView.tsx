'use client';
import Image from 'next/image';
import {productReference} from '@/lib/product-content';
import AnimeProductLink from './AnimeProductLink';
import {ArrowUpRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {animeProductHref} from '@/lib/anime-routes';
import {isDoublePrint} from '@/lib/anime-merchandising';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import AnimeProductOptions from './AnimeProductOptions';
import styles from './shop-premium.module.css';
export default function AnimeQuickView({product,onClose,onNavigate}:{product:AnimeClientProduct|null;onClose:()=>void;onNavigate?:()=>void}){
 return <Dialog open={!!product} onOpenChange={open=>{if(!open)onClose();}}><DialogContent className={styles.quickView} aria-describedby="anime-quick-description">{product&&<><div className={styles.quickMedia}><Image quality={85} src={product.image} alt={product.name} fill sizes="(max-width: 700px) 88vw, 450px"/></div><div className={styles.quickInfo}><p className={styles.kicker}>{product.category} / {productReference(product)||'Por confirmar'}</p><DialogTitle className={styles.quickTitle}>{product.name}</DialogTitle><DialogDescription id="anime-quick-description" className={styles.quickDescription}>{isDoublePrint(product)?'Diseño con estampado en frente y espalda.':'Consulta los detalles del diseño en su fotografía.'} {product.availability} en tallas {product.sizes.join(', ')}.</DialogDescription><p className={styles.quickDescription}>Material: <strong>{product.material||'Por confirmar'}</strong><br/>Horma: <strong>{product.fit||'Por confirmar'}</strong></p><div className={styles.detailPrice}><strong>$68.000</strong><span>o combina 2 por $93.000</span></div><AnimeProductOptions key={product.id} product={product}/><AnimeProductLink productId={product.id} className={styles.textLink} onClick={onNavigate} href={animeProductHref(product)}>Ver la ficha completa <ArrowUpRight size={16}/></AnimeProductLink></div></>}</DialogContent></Dialog>;
}
