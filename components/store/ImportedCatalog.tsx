import Image from 'next/image';
import Link from 'next/link';
import {ArrowDown,ArrowUpRight,Footprints,MessageCircle} from 'lucide-react';
import {wa} from '@/lib/config';
import {queryProducts,type Params} from '@/lib/products';
import type {Product} from '@/lib/types';
import {orderedShoeSizes} from '@/lib/shoe-sizes';
import Filters from './Filters';
import ResponsiveImportedGrid from './ResponsiveImportedGrid';
import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import {publicProduct} from '@/lib/product-display';
import ImportedMessages from './ImportedMessages';
import styles from './imported-collection.module.css';

const path='/zapatillas-importadas';
const advice=wa('Hola, quiero asesoría para elegir unas zapatillas importadas.');

export default function ImportedCatalog({products,params}:{products:Product[];params:Params}){
  const values=Object.fromEntries(Object.entries(params).map(([key,value])=>[key,typeof value==='string'&&value!=='all'?value:'']));
  const result=queryProducts(products,values,'zapatillas');
  const mobileResult=queryProducts(products,{...values,display:'mobile'},'zapatillas');
  const options={sizes:orderedShoeSizes(products.flatMap(p=>p.sizes)),colors:[...new Set(products.map(p=>p.color).filter(Boolean))].sort(),brands:[...new Set(products.map(p=>p.brand).filter((brand):brand is string=>!!brand))].sort()};
  const pageLink=(page:number)=>{const query=new URLSearchParams(values);query.set('page',String(page));return `${path}?${query}#catalogo-productos`;};
  const filtered=Object.entries(values).some(([key,value])=>key!=='page'&&!!value);
  return <main id="contenido" className={`page-main ${styles.page}`}>
    <nav className="breadcrumb" aria-label="Ruta de navegación"><Link href="/">Inicio</Link><span>/</span><Link href="/categoria/zapatillas">Zapatillas</Link><span>/</span><span aria-current="page">Importadas</span></nav>
    <section className={styles.hero} aria-labelledby="importadas-title">
      <Image className={styles.heroImage} src="/media/collections/importadas-editorial.webp" alt="" fill sizes="(max-width:700px) 100vw, 90vw" quality={85} preload/>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}><span aria-hidden="true"/>EVOLUCIÓN URBANA / LÍNEA IMPORTADA</p>
        <h1 id="importadas-title">Zapatillas<br/><em>importadas.</em></h1>
        <p className={styles.statement}>El siguiente paso<br/>{' '}lleva tu estilo.</p>
        <p className={styles.intro}>Encuentra la referencia que va contigo. Explora modelos, compara colores y elige tu próxima evolución.</p>
        <div className={styles.actions}><a className={styles.primary} href="#coleccion-importadas">ENCONTRAR MI PAR <ArrowDown size={18} aria-hidden="true"/></a><a className={styles.secondary} href={advice} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true"/>Asesoría por WhatsApp <ArrowUpRight size={16} aria-hidden="true"/></a></div>
      </div>
      <div className={styles.heroSignature} aria-hidden="true"><span>EL ESTILO SIGUE EVOLUCIONANDO.</span><span>EVOLUCIÓN<br/><b>URBANA.</b></span></div>
      <div className={styles.heroFooter}><span><i aria-hidden="true"/>COLECCIÓN EN LÍNEA</span><span>ELIGE CON CONFIANZA. CAMINA A TU MANERA.</span><ArrowUpRight size={20} aria-hidden="true"/></div>
    </section>
    <ImportedMessages/>
    <CatalogPageScroll page={result.page}/>
    <section id="coleccion-importadas" className={styles.collection} aria-labelledby="importadas-collection-title">
      <div className={styles.collectionHeading}><div><p className={styles.sectionKicker}>TU PRÓXIMO PAR ESTÁ AQUÍ</p><h2 id="importadas-collection-title">Elige el que habla por ti.</h2></div><Link href="/categoria/zapatillas#catalogo-zapatillas">Explorar nacionales <ArrowUpRight size={17} aria-hidden="true"/></Link></div>
      <div className="catalog-layout">
        <aside aria-label="Buscar y filtrar zapatillas importadas"><Filters key={JSON.stringify(values)} path={path} options={options} values={values}/></aside>
        <div className="catalog-results" id="catalogo-resultados">
          <div className="catalog-toolbar"><CatalogNavigation active="importadas"/><span role="status">{result.total} {result.total===1?'referencia':'referencias'}</span></div>
          {result.items.length?<ResponsiveImportedGrid desktop={result.items.map(publicProduct)} mobile={mobileResult.items.map(publicProduct)}/>:<div className={`empty-state ${styles.empty}`} id="catalogo-productos"><Footprints size={32} aria-hidden="true"/><h3>{products.length?'Probemos otra combinación.':'Encuentra tu próxima evolución.'}</h3><p>{products.length?'Prueba otra talla, color o rango de precio para encontrar tu par.':'Consulta por la referencia que buscas o explora nuestra colección de zapatillas nacionales.'}</p>{products.length?<Link className="button" href={path+'#coleccion-importadas'}>VER TODAS LAS IMPORTADAS <ArrowUpRight size={17}/></Link>:<a className="button" href={advice} target="_blank" rel="noopener noreferrer">CONSULTAR REFERENCIAS <ArrowUpRight size={17}/></a>}</div>}
          {result.pages>1&&<nav className="pagination" aria-label="Páginas de zapatillas importadas">{result.page>1&&<Link href={pageLink(result.page-1)} rel="prev">Anterior</Link>}<span>Página {result.page} de {result.pages}</span>{result.page<result.pages&&<Link href={pageLink(result.page+1)} rel="next">Siguiente</Link>}</nav>}
          {filtered&&result.items.length>0&&<Link className={styles.clearFilters} href={path+'#coleccion-importadas'}>Ver la colección completa <ArrowUpRight size={15} aria-hidden="true"/></Link>}
        </div>
      </div>
    </section>
    <section className={styles.advice} aria-labelledby="importadas-advice-title"><span className={styles.adviceIcon}><MessageCircle size={28} aria-hidden="true"/></span><div><p className={styles.sectionKicker}>ELIGE CON CONFIANZA</p><h2 id="importadas-advice-title">¿Ya tienes un par en mente?</h2><p>Envíanos la referencia, tu talla y el color que te gusta. Te ayudamos a confirmar disponibilidad y a continuar con tu pedido.</p></div><a className={styles.primary} href={advice} target="_blank" rel="noopener noreferrer">HABLEMOS DE TU PAR <ArrowUpRight size={18} aria-hidden="true"/></a></section>
  </main>;
}
