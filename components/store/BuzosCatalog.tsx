import CatalogNavigation from './CatalogNavigation';
import CatalogPageScroll from './CatalogPageScroll';
import CatalogLoadMore from './CatalogLoadMore';
import Link from 'next/link';
import {ArrowUpRight,MessageCircle,Layers} from 'lucide-react';
import {wa} from '@/lib/config';
import {catalogCollections} from '@/lib/catalog-collections';
import CatalogHeading from './CatalogHeading';
import {queryProducts,type Params} from '@/lib/products';
import type {Product} from '@/lib/types';
import ProductCard from './ProductCard';
import styles from './imported-collection.module.css';
import dockStyles from './catalog-dock.module.css';

const {path,name}=catalogCollections['conjuntos-buzos'];
const advice=wa('Hola, quiero asesoría para elegir un conjunto de buzo y sudadera.');
export default function BuzosCatalog({products,params}:{products:Product[];params:Params}){
  const values=Object.fromEntries(Object.entries(params).map(([key,value])=>[key,typeof value==='string'&&value!=='all'?value:'']));
  const result=queryProducts(products,values,undefined,values.hasta);
  const order=['XXS','XS','S','M','L','XL','XXL','2XL','3XL','4XL'];
  const options={sizes:[...new Set(products.flatMap(p=>p.sizes))].sort((a,b)=>{
    const x=order.indexOf(a.toUpperCase()),y=order.indexOf(b.toUpperCase());
    return x>=0&&y>=0?x-y:a.localeCompare(b,'es',{numeric:true});
  }),colors:[...new Set(products.map(p=>p.color).filter(Boolean))].sort(),brands:[...new Set(products.map(p=>p.brand).filter((x):x is string=>!!x))].sort()};
  return <main id="contenido" className={`page-main ${styles.page}`}>
    <CatalogHeading title={name} section={name} detail="Explora referencias, colores y tallas para armar tu conjunto."/>
    <CatalogPageScroll page={result.page}/>
    <section id="coleccion-buzos" className={styles.collection} aria-label="Colección de buzos y sudaderas">
      <div className={`catalog-results ${dockStyles.results}`} data-catalog-start id="catalogo-resultados">
        <CatalogNavigation active="conjuntos-buzos" total={result.total} path={path} options={options} values={values}/>
        {result.items.length?<div className="product-grid" id="catalogo-productos">{result.items.map(product=><ProductCard key={product.id} product={product}/>)}</div>:<div className={`empty-state ${styles.empty}`} id="catalogo-productos"><Layers size={32} aria-hidden="true"/><h3>{products.length?'Probemos otra combinación.':'Tu próxima combinación está en camino.'}</h3><p>{products.length?'Prueba otra talla, color o rango de precio.':'Consulta por el conjunto que tienes en mente. Aquí aparecerán las referencias cuando estén publicadas.'}</p>{products.length?<Link className="button" href={path+'#coleccion-buzos'}>VER TODA ESTA LÍNEA <ArrowUpRight size={17}/></Link>:<a className="button" href={advice} target="_blank" rel="noopener noreferrer">CONSULTAR REFERENCIAS <ArrowUpRight size={17}/></a>}</div>}
        <CatalogLoadMore path={path} values={values} shown={result.items.length} total={result.total} page={result.page} pages={result.pages}/>
      </div>
    </section>
    <section className={styles.advice}><span className={styles.adviceIcon}><MessageCircle size={28} aria-hidden="true"/></span><div><p className={styles.sectionKicker}>ELIGE CON CONFIANZA</p><h2>Tu próximo conjunto empieza contigo.</h2><p>Compártenos la referencia, la talla y el color. Confirmamos disponibilidad, medidas y condiciones antes de cerrar tu pedido.</p></div><a className={styles.primary} href={advice} target="_blank" rel="noopener noreferrer">ELEGIR CON ASESORÍA <ArrowUpRight size={18} aria-hidden="true"/></a></section>
  </main>;
}
