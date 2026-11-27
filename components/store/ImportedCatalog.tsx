import Link from 'next/link';
import {ArrowUpRight,Footprints,MessageCircle} from 'lucide-react';
import {wa} from '@/lib/config';
import {catalogCollections} from '@/lib/catalog-collections';
import {queryProducts,type Params} from '@/lib/products';
import type {Product} from '@/lib/types';
import {orderedShoeSizes} from '@/lib/shoe-sizes';
import ResponsiveImportedGrid from './ResponsiveImportedGrid';
import CatalogHeading from './CatalogHeading';
import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import CatalogLoadMore from './CatalogLoadMore';
import {publicProduct} from '@/lib/product-display';
import ImportedMessages from './ImportedMessages';
import styles from './imported-collection.module.css';
import dockStyles from './catalog-dock.module.css';

const {path,name}=catalogCollections.importadas;
const advice=wa('Hola, quiero asesoría para elegir unas zapatillas importadas.');

export default function ImportedCatalog({products,params}:{products:Product[];params:Params}){
  const values=Object.fromEntries(Object.entries(params).map(([key,value])=>[key,typeof value==='string'&&value!=='all'?value:'']));
  const result=queryProducts(products,values,'zapatillas',values.hasta);
  const mobileResult=queryProducts(products,{...values,display:'mobile'},'zapatillas',values.hasta);
  const options={sizes:orderedShoeSizes(products.flatMap(p=>p.sizes)),colors:[...new Set(products.map(p=>p.color).filter(Boolean))].sort(),brands:[...new Set(products.map(p=>p.brand).filter((brand):brand is string=>!!brand))].sort()};
  const filtered=Object.entries(values).some(([key,value])=>key!=='page'&&key!=='hasta'&&!!value);
  return <main id="contenido" className={`page-main ${styles.page}`}>
    <CatalogHeading title={name} section={name} detail="Explora modelos, colores y tallas de la línea importada."/>
    <CatalogPageScroll page={result.page}/>
    <section id="coleccion-importadas" className={styles.collection} aria-label="Colección de zapatillas importadas">
      <div className={`catalog-results ${dockStyles.results}`} data-catalog-start id="catalogo-resultados">
          <CatalogNavigation active="importadas" total={result.total} path={path} options={options} values={values}/>
          {result.items.length?<ResponsiveImportedGrid desktop={result.items.map(publicProduct)} mobile={mobileResult.items.map(publicProduct)}/>:<div className={`empty-state ${styles.empty}`} id="catalogo-productos"><Footprints size={32} aria-hidden="true"/><h3>{products.length?'Probemos otra combinación.':'Encuentra tu próxima evolución.'}</h3><p>{products.length?'Prueba otra talla, color o rango de precio para encontrar tu par.':'Consulta por la referencia que buscas o explora nuestra colección de zapatillas nacionales.'}</p>{products.length?<Link className="button" href={path+'#coleccion-importadas'}>VER TODAS LAS IMPORTADAS <ArrowUpRight size={17}/></Link>:<a className="button" href={advice} target="_blank" rel="noopener noreferrer">CONSULTAR REFERENCIAS <ArrowUpRight size={17}/></a>}</div>}
          <CatalogLoadMore path={path} values={values} shown={result.items.length} total={result.total} page={result.page} pages={result.pages}/>
          {filtered&&result.items.length>0&&<Link className={styles.clearFilters} href={path+'#coleccion-importadas'}>Ver la colección completa <ArrowUpRight size={15} aria-hidden="true"/></Link>}
      </div>
    </section>
    <ImportedMessages/>
    <section className={styles.advice} aria-labelledby="importadas-advice-title"><span className={styles.adviceIcon}><MessageCircle size={28} aria-hidden="true"/></span><div><p className={styles.sectionKicker}>ELIGE CON CONFIANZA</p><h2 id="importadas-advice-title">¿Ya tienes un par en mente?</h2><p>Envíanos la referencia, tu talla y el color que te gusta. Te ayudamos a confirmar disponibilidad y a continuar con tu pedido.</p></div><a className={styles.primary} href={advice} target="_blank" rel="noopener noreferrer">HABLEMOS DE TU PAR <ArrowUpRight size={18} aria-hidden="true"/></a></section>
  </main>;
}
