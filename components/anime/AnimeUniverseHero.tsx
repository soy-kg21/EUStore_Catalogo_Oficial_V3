'use client';
import AnimeCatalogImage from './AnimeCatalogImage';
import AnimeProductLink from './AnimeProductLink';
import {useEffect,useLayoutEffect,useRef,type CSSProperties,type ReactNode} from 'react';
import {ArrowDown,ArrowUpRight,Home} from 'lucide-react';
import type {AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref} from '@/lib/anime-routes';
import {cinemaArtForLine} from '@/lib/anime-cinema-art';
import styles from './universe.module.css';
import {mountAnimeCinema} from '@/lib/anime-cinema-runtime';
type Props={products:AnimeClientProduct[];division:string;title:[string,string];description:string;navigation?:ReactNode;line?:string};
/** Each line keeps its four approved characters; the mixed shop opens with the original Gojo. */
export default function AnimeUniverseHero({products,title,description,navigation,line='anime'}:Props){
 const root=useRef<HTMLElement>(null);
 const artwork=cinemaArtForLine(line);
 useLayoutEffect(()=>{if(root.current)return mountAnimeCinema(root.current);},[]);
 useEffect(()=>{root.current?.dispatchEvent(new Event('eu-cinema-art-change'));},[line]);
 return <section ref={root} id="anime-inicio" className={styles.journey} data-anime-journey data-cinema-opening={artwork[0].format} data-cinema-title={title[0]==='DE TU UNIVERSO.'?'universe':'line'} data-scene-progress="0" aria-labelledby="anime-hero-title"><div className={styles.viewport} data-cinema="viewport"><div className={styles.stage} data-cinema="stage">
  <div className={styles.film} style={{'--cinema-mobile-city':`url('${artwork[0].src}')`,'--cinema-mobile-city-size':artwork[0].format==='atlas'?'800% 200%':'400% 100%'} as CSSProperties} aria-hidden="true">{artwork.map((art,index)=>{
   return <div key={index} className={`${styles.shot} ${styles['shot'+index]}`} data-cinema-shot={index} data-cinema-art={art.id} data-cinema-art-format={art.format}><div className={styles.shotImage} style={{backgroundImage:`url('${art.src}')`,backgroundSize:art.format==='atlas'?'200% 200%':'100% 100%',backgroundPosition:art.format==='atlas'?'0 0':'center'}}/></div>;
  })}<div className={styles.shade}/><div className={styles.grain}/></div><canvas className={styles.effects} aria-hidden="true"/>
  <nav className={styles.breadcrumb} aria-label="Inicio de Anime Shop"><a href="#anime-inicio" data-cinema-home><Home size={11}/> Inicio</a></nav>
  <div className={styles.edition} data-cinema="edition"><span/> {artwork[0].edition}</div>
  <div className={styles.commerce} data-cinema="commerce"><div className={styles.copy} data-cinema="copy"><h1 id="anime-hero-title" data-cinema="copy-title">{title[0]==='DE TU UNIVERSO.'?'TU UNIVERSO':title[0]}<br/><em>{title[1]==='A LA CALLE.'?'A LA CALLE':title[1]}</em></h1><p className={styles.description} data-cinema="copy-description">{title[0]==='DE TU UNIVERSO.'?<>Tu anime favorito. Tu próxima camiseta.<br/>Elige tus diseños y arma tu combo.</>:description}</p><div className={styles.actions} data-cinema="copy-actions"><a href="#anime-discover" className={styles.enter} data-cinema-explore>Explorar la colección <ArrowUpRight size={17}/></a><a href="#precios" className={styles.prices}>2 por $93.000</a></div></div>
   <div className={styles.selection} data-cinema="selection"><span className={styles.selectionHeading}>TRES FORMAS DE EMPEZAR <ArrowUpRight size={12}/></span><div className={styles.products}>{products.slice(0,3).map((product,index)=><AnimeProductLink productId={product.id} key={product.id} href={animeProductHref(product.id)} className={styles.look} aria-label={`Ver camiseta ${product.name}`}><AnimeCatalogImage product={product} alt={product.name} sizes="(max-width:700px) 27vw, (max-width:1100px) 12vw, 150px" priority={index===0} eager/></AnimeProductLink>)}</div><span className={styles.selectionNote}>{title[0]==='DE TU UNIVERSO.'?'Diseños del catálogo · Doble estampado':'Diseños del catálogo · Elige tu universo'}</span></div>
  </div>
  <button type="button" className={`${styles.label} ${styles.labelB}`} data-cinema="label-b" onClick={()=>window.dispatchEvent(new Event('eu-open-anime-filters'))}><div><small>TU OUTFIT. TUS REGLAS.</small><strong>Elige tu universo.</strong></div><ArrowUpRight size={17}/></button>
  <div className={styles.chapter} data-cinema="awake"><p className={styles.eyebrow}>EL INSTANTE EN QUE TODO CAMBIA</p><h2>DESPIERTA<br/><em>TU ESTILO.</em></h2></div><div className={`${styles.chapter} ${styles.power}`} data-cinema="power"><p className={styles.eyebrow}>NO GUARDES TU ENERGÍA</p><h2>LLÉVALA<br/><em>PUESTA.</em></h2></div><div className={`${styles.chapter} ${styles.collection}`} data-cinema="collection"><p className={styles.eyebrow}>EL UNIVERSO SIGUE CONTIGO</p><h2>TU ESTILO.<br/><em>TUS REGLAS.</em></h2></div><span className={styles.vertical} data-cinema="vertical">EVOLUCIÓN / SIN LÍMITES</span><div className={styles.meta}><span data-cinema="caption">ENTRA EN TU UNIVERSO</span><span><span data-cinema="hint">SIGUE EL SCROLL</span><ArrowDown size={12}/></span></div>
 </div><div className={styles.discoverWrap} data-cinema="discover"><div className={styles.discover} data-cinema="panel" id="anime-discover">{navigation}</div></div></div></section>;
}
