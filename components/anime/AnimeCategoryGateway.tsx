import Link from 'next/link';
import {ArrowDown,ArrowUpRight,Sparkles} from 'lucide-react';
import {animeProducts} from '@/data/anime-products';
import {animeCommercial} from '@/lib/anime-commercial';
import styles from './anime.module.css';

export default function AnimeCategoryGateway(){
  return <section className={styles.categoryGateway} aria-labelledby="camisetas-lines-title">
    <div className={styles.gatewayHeader}>
      <div>
        <p className={styles.gatewayEyebrow}>Camisetas / Elige tu universo</p>
        <h2 id="camisetas-lines-title">DOS LÍNEAS. <em>UNA MISMA ACTITUD.</em></h2>
      </div>
      <p>Continúa con la colección urbana actual o entra a la experiencia Anime con {animeProducts.length} diseños.</p>
    </div>
    <div className={styles.gatewayGrid}>
      <a className={`${styles.gatewayCard} ${styles.gatewayCurrent}`} href="#catalogo-camisetas">
        <span className={styles.gatewayNo}>01</span>
        <span className={styles.gatewayTag}>Colección actual</span>
        <strong>Camisetas urbanas</strong>
        <small>Explorar referencias disponibles</small>
        <span className={styles.gatewayAction}>Seguir aquí <ArrowDown size={15}/></span>
      </a>
      <Link className={`${styles.gatewayCard} ${styles.gatewayAnime}`} href="/anime">
        <span className={styles.gatewayNo}>02</span>
        <span className={styles.gatewayTag}><Sparkles size={13}/> Anime Division</span>
        <strong>Camisetas Anime</strong>
        <small>{animeProducts.length} diseños · S a XL · {animeCommercial.promoLabel}</small>
        <span className={styles.gatewayAction}>Entrar al Anime Shop <ArrowUpRight size={15}/></span>
      </Link>
    </div>
  </section>
}
