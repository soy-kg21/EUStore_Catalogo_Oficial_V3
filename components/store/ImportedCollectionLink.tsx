import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import styles from './imported-collection.module.css';

export default function ImportedCollectionLink({variant='banner'}:{variant?:'banner'|'gateway'}){
  return <Link className={`${styles.promo} ${styles[variant]}`} href="/zapatillas-importadas">
    <Image className={styles.promoImage} src="/media/collections/importadas-editorial.webp" alt="" fill sizes={variant==='gateway'?'(max-width:700px) 90vw, 44vw':'(max-width:700px) 90vw, 85vw'} quality={85}/>
    <div className={styles.promoCopy}><span className={styles.promoStatus}><i aria-hidden="true"/>COLECCIÓN EN LÍNEA</span><span className={styles.promoKicker}>EVOLUCIÓN URBANA / ZAPATILLAS</span><h3>Zapatillas <em>importadas.</em></h3><p>Tu próximo par, a otro nivel. Explora modelos, colores, tallas y precios en línea.</p><span className={styles.promoAction}>VER MODELOS Y PRECIOS <ArrowUpRight size={18} aria-hidden="true"/></span></div>
    <span className={styles.promoSymbol} aria-hidden="true">↗</span>
  </Link>;
}
