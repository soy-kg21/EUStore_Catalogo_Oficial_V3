import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowDown,ArrowUpRight,MessageCircle,Layers} from 'lucide-react';
import {wa} from '@/lib/config';
import {queryProducts,type Params} from '@/lib/products';
import type {Product} from '@/lib/types';
import Filters from './Filters';
import ProductCard from './ProductCard';
import styles from './imported-collection.module.css';

const path='/conjuntos-buzos';
const advice=wa('Hola, quiero asesoría para elegir un conjunto de buzo y sudadera.');
export default function BuzosCatalog({products,params}:{products:Product[];params:Params}){
  const values=Object.fromEntries(Object.entries(params).map(([key,value])=>[key,typeof value==='string'&&value!=='all'?value:'']));
  const result=queryProducts(products,values);
  const order=['XXS','XS','S','M','L','XL','XXL','2XL','3XL','4XL'];
  const options={sizes:[...new Set(products.flatMap(p=>p.sizes))].sort((a,b)=>{
    const x=order.indexOf(a.toUpperCase()),y=order.indexOf(b.toUpperCase());
    return x>=0&&y>=0?x-y:a.localeCompare(b,'es',{numeric:true});
  }),colors:[...new Set(products.map(p=>p.color).filter(Boolean))].sort(),brands:[...new Set(products.map(p=>p.brand).filter((x):x is string=>!!x))].sort()};
  const pageLink=(page:number)=>{const query=new URLSearchParams(values);query.set('page',String(page));return `${path}?${query}#catalogo-productos`;};
  return <main id="contenido" className={`page-main ${styles.page}`}>
    <nav className="breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/categoria/conjuntos">Conjuntos</Link><span>/</span><span aria-current="page">Buzos y sudaderas</span></nav>
    <section className={styles.hero} aria-labelledby="buzos-title">
      <Image className={styles.heroImage} src="/media/collections/conjuntos-editorial.webp" alt="" fill sizes="(max-width:700px) 100vw, 90vw" quality={85} preload/>
      <div className={styles.heroCopy}><p className={styles.eyebrow}><span aria-hidden="true"/>EVOLUCIÓN URBANA / COMFORT DIVISION</p><h1 id="buzos-title">Buzos y<br/><em>sudaderas.</em></h1><p className={styles.statement}>Comodidad que se lleva con actitud.</p><p className={styles.intro}>Tu conjunto, a tu manera. Explora las referencias publicadas, elige tu talla y dale otra expresión a tu estilo.</p><div className={styles.actions}><a className={styles.primary} href="#coleccion-buzos">ENCONTRAR MI CONJUNTO <ArrowDown size={18} aria-hidden="true"/></a><a className={styles.secondary} href={advice} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true"/>Compra con asesoría <ArrowUpRight size={16} aria-hidden="true"/></a></div></div>
      <div className={styles.heroFooter}><span><i aria-hidden="true"/>TU ESTILO SIGUE EVOLUCIONANDO</span><span>ELIGE CON CONFIANZA. LLÉVALO A TU MANERA.</span><ArrowUpRight size={20} aria-hidden="true"/></div>
    </section>
    <CatalogPageScroll page={result.page}/>
    <section id="coleccion-buzos" className={styles.collection} style={{marginTop:42}} aria-labelledby="buzos-collection-title">
      <div className={styles.collectionHeading}><div><p className={styles.sectionKicker}>EL LOOK COMPLETO EMPIEZA AQUÍ</p><h2 id="buzos-collection-title">Encuentra tu próxima combinación.</h2></div><Link href="/categoria/conjuntos#catalogo-conjuntos">Ver camiseta + pantaloneta <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
      <div className="catalog-layout"><aside aria-label="Buscar y filtrar buzos y sudaderas"><Filters key={JSON.stringify(values)} path={path} options={options} values={values}/></aside><div className="catalog-results" id="catalogo-resultados">
        <div className="catalog-toolbar"><CatalogNavigation active="conjuntos-buzos"/><span role="status">{result.total} {result.total===1?'referencia':'referencias'}</span></div>
        {result.items.length?<div className="product-grid" id="catalogo-productos">{result.items.map(product=><ProductCard key={product.id} product={product}/>)}</div>:<div className={`empty-state ${styles.empty}`} id="catalogo-productos"><Layers size={32} aria-hidden="true"/><h3>{products.length?'Probemos otra combinación.':'Tu próxima combinación está en camino.'}</h3><p>{products.length?'Prueba otra talla, color o rango de precio.':'Consulta por el conjunto que tienes en mente. Aquí aparecerán las referencias cuando estén publicadas.'}</p>{products.length?<Link className="button" href={path+'#coleccion-buzos'}>VER TODA ESTA LÍNEA <ArrowUpRight size={17}/></Link>:<a className="button" href={advice} target="_blank" rel="noopener noreferrer">CONSULTAR REFERENCIAS <ArrowUpRight size={17}/></a>}</div>}
        {result.pages>1&&<nav className="pagination" aria-label="Páginas de buzos y sudaderas">{result.page>1&&<Link href={pageLink(result.page-1)} rel="prev">Anterior</Link>}<span>Página {result.page} de {result.pages}</span>{result.page<result.pages&&<Link href={pageLink(result.page+1)} rel="next">Siguiente</Link>}</nav>}
      </div></div>
    </section>
    <section className={styles.advice}><span className={styles.adviceIcon}><MessageCircle size={28} aria-hidden="true"/></span><div><p className={styles.sectionKicker}>ELIGE CON CONFIANZA</p><h2>Tu próximo conjunto empieza contigo.</h2><p>Compártenos la referencia, la talla y el color. Confirmamos disponibilidad, medidas y condiciones antes de cerrar tu pedido.</p></div><a className={styles.primary} href={advice} target="_blank" rel="noopener noreferrer">ELEGIR CON ASESORÍA <ArrowUpRight size={18} aria-hidden="true"/></a></section>
  </main>;
}
