'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef,type ReactNode} from 'react';
import {ArrowDown,ArrowUpRight,Home,Layers} from 'lucide-react';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref} from '@/lib/anime-routes';
import styles from './universe.module.css';
type Props={products:AnimeClientProduct[];division:string;title:[string,string];description:string;navigation?:ReactNode};
/** Approved Gojo composition with real catalog links and a native-scroll timeline. */
export default function AnimeUniverseHero({products,title,description,navigation}:Props){
 const root=useRef<HTMLElement>(null);
 useEffect(()=>{let cancelled=false,dispose:(()=>void)|undefined;import('@/lib/anime-cinema-runtime').then(({mountAnimeCinema})=>{if(!cancelled&&root.current)dispose=mountAnimeCinema(root.current);}).catch(()=>{/* Static collection stays available if enhancement fails. */});return()=>{cancelled=true;dispose?.();};},[]);
 return <section ref={root} id="anime-inicio" className={styles.journey} data-anime-journey data-scene-progress="0" aria-labelledby="anime-hero-title"><div className={styles.viewport} data-cinema="viewport"><div className={styles.stage} data-cinema="stage">
  <div className={styles.film} aria-hidden="true">{[0,1,2,3].map(index=><div key={index} className={`${styles.shot} ${styles['shot'+index]}`} data-cinema-shot={index}/>)}<div className={styles.shade}/><div className={styles.grain}/></div><canvas className={styles.effects} aria-hidden="true"/>
  <nav className={styles.breadcrumb} aria-label="Inicio de Anime Shop"><a href="#anime-inicio" data-cinema-home><Home size={11}/> Inicio</a></nav>
  <div className={styles.edition} data-cinema="edition"><span/> ANIME SHOP / GOJO SATORU</div><div className={styles.brand} aria-label="Evolución Urbana"><span data-cinema="brand-a">EVOLUCIÓN</span><span data-cinema="brand-b">URBANA<em>.</em></span></div>
  <div className={styles.commerce} data-cinema="commerce"><div className={styles.copy} data-cinema="copy"><p className={styles.eyebrow}>LLEVA LO QUE TE REPRESENTA</p><h1 id="anime-hero-title">{title[0]}<br/><em>{title[1]}</em></h1><p className={styles.description}>{title[0]==='DE TU UNIVERSO.'?<>Tu anime favorito. Tu próxima camiseta.<br/>Elige tus diseños y arma tu combo.</>:description}</p><div className={styles.actions}><a href="#anime-discover" className={styles.enter} data-cinema-explore>Explorar la colección <ArrowUpRight size={17}/></a><a href="#precios" className={styles.prices}>2 por $99.000</a></div></div>
   <div className={styles.selection} data-cinema="selection"><span className={styles.selectionHeading}>TRES FORMAS DE EMPEZAR <ArrowUpRight size={12}/></span><div className={styles.products}>{products.slice(0,3).map((product,index)=><Link key={product.id} href={animeProductHref(product.id)} className={styles.look} aria-label={`Ver camiseta ${product.name}`}><Image quality={85} src={product.image} alt={product.name} fill sizes="(max-width:700px) 27vw, (max-width:1100px) 12vw, 150px" preload={index===0} loading={index===0?undefined:'eager'}/></Link>)}</div><span className={styles.selectionNote}>{title[0]==='DE TU UNIVERSO.'?'Diseños del catálogo · Doble estampado':'Diseños del catálogo · Elige tu universo'}</span></div>
  </div>
  <div className={`${styles.label} ${styles.labelA}`} data-cinema="label-a"><Layers size={17}/><div><small>ACTITUD POR AMBOS LADOS</small><strong>Doble estampado.</strong></div></div><button type="button" className={`${styles.label} ${styles.labelB}`} data-cinema="label-b" onClick={()=>window.dispatchEvent(new Event('eu-open-anime-filters'))}><div><small>TU OUTFIT. TUS REGLAS.</small><strong>Elige tu universo.</strong></div><ArrowUpRight size={17}/></button>
  <div className={styles.chapter} data-cinema="awake"><p className={styles.eyebrow}>EL INSTANTE EN QUE TODO CAMBIA</p><h2>DESPIERTA<br/><em>TU ESTILO.</em></h2></div><div className={`${styles.chapter} ${styles.power}`} data-cinema="power"><p className={styles.eyebrow}>NO GUARDES TU ENERGÍA</p><h2>LLÉVALA<br/><em>PUESTA.</em></h2></div><div className={`${styles.chapter} ${styles.collection}`} data-cinema="collection"><p className={styles.eyebrow}>EL UNIVERSO SIGUE CONTIGO</p><h2>TU ESTILO.<br/><em>TUS REGLAS.</em></h2></div><span className={styles.vertical} data-cinema="vertical">EVOLUCIÓN / SIN LÍMITES</span><div className={styles.meta}><span data-cinema="caption">ENTRA EN TU UNIVERSO</span><span><span data-cinema="hint">SIGUE EL SCROLL</span><ArrowDown size={12}/></span></div>
 </div><div className={styles.discoverWrap} data-cinema="discover"><div className={styles.discover} data-cinema="panel" id="anime-discover">{navigation}</div></div></div></section>;
}
