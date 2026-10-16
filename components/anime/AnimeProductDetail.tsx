'use client';
import Image from 'next/image';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,ArrowUpRight,Check,Expand,MessageCircle,Truck} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {animeLines,animeCategorySlug,type AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';
import {isDoublePrint} from '@/lib/anime-merchandising';
import {trackAnimeEvent,animeAbsoluteUrl} from '@/lib/anime-events';
import {ORIGIN,wa} from '@/lib/config';
import AnimeProductOptions from './AnimeProductOptions';
import AnimeShareButton from './AnimeShareButton';
import AnimeProductCard from './AnimeProductCard';
import styles from './shop-premium.module.css';
export default function AnimeProductDetail({product,related=[]}:{product:AnimeClientProduct;related?:AnimeClientProduct[]}){
 const [zoom,setZoom]=useState(false),double=isDoublePrint(product.id),lineName=animeLines.find(line=>line.id===product.line)!.name;
 const categoryHref=`${animeLinePath[product.line]}/${animeCategorySlug(product.category)}`;
 const consult=(origin:string)=>`Hola Evolución Urbana 👕\n\nQuiero consultar la referencia ${product.id} — ${product.name}.\nColección: ${lineName} · ${product.category}.\n${origin}${animeProductHref(product.id)}\n\nQuiero confirmar tallas, disponibilidad y la promoción aplicable.`;
 return <main id="contenido" className={styles.shell}>
  <div className={styles.detailShell}>
   <nav className={styles.breadcrumb} aria-label="Ruta de navegación"><Link href="/shop">Anime Shop</Link><span>/</span><Link href={animeLinePath[product.line]}>{lineName}</Link><span>/</span><Link href={categoryHref}>{product.category}</Link></nav>
   <div className={styles.detailGrid}>
    <div className={styles.detailGallery}><button type="button" className={styles.detailImage} onClick={()=>setZoom(true)} aria-label={`Ampliar fotografía de ${product.name}`}><Image src={product.image} alt={`${product.name}, referencia ${product.id}`} fill sizes="(max-width: 800px) 94vw, 600px" preload/>{double&&<span className={styles.detailImageBadge}>FRENTE + ESPALDA</span>}<span className={styles.zoomButton}><Expand size={17}/> Ampliar diseño</span></button><p className={styles.imageCaption}>Fotografía del diseño suministrada para esta referencia.</p></div>
    <section className={styles.detailInfo}>
     <p className={styles.kicker}>{lineName} Division / {product.id}</p><h1>{product.name}</h1>
     {double&&<p className={styles.printTag}><Check size={14}/> Doble estampado</p>}
     <div className={styles.detailPrice}><strong>$68.000 <small>COP</small></strong><span>Combina 2 camisetas por <b>$99.000</b></span></div>
     <p className={styles.detailIntro}>Elige tu talla y añádela al combo. Puedes combinarla con diseños de Anime, Cartoon, Rock y Urbanas.</p>
     <AnimeProductOptions product={product}/>
     <AnimeShareButton name={product.name} path={animeProductHref(product.id)}/>
     <p className={styles.shippingNote}><Truck size={18}/><span>Envío estándar incluido de 1 a 5 camisetas. Cobertura y contraentrega por confirmar.</span></p>
     <div className={styles.detailAccordions}>
      <details open><summary>Detalles de esta referencia</summary><dl><div><dt>Referencia</dt><dd>{product.id}</dd></div><div><dt>Universo</dt><dd>{product.category}</dd></div><div><dt>Material</dt><dd>{product.material||'Por confirmar'}</dd></div>{product.weightGrams&&<div><dt>Gramaje</dt><dd>{product.weightGrams} g</dd></div>}{product.fit&&product.fit!=='Por confirmar'&&<div><dt>Horma</dt><dd>{product.fit}</dd></div>}</dl></details>
      <details><summary>Tallas y disponibilidad</summary><p>Las tallas del catálogo no representan inventario en tiempo real. Antes de cerrar el pedido confirmamos la referencia, la talla y, si lo necesitas, sus medidas.</p></details>
      <details><summary>Envíos y pedidos mayoristas</summary><p>De 1 a 5 camisetas, envío estándar incluido y contraentrega sujetos a cobertura. Desde 6 camisetas, pago anticipado y transporte separado por cotizar. Desde 24, cotización personalizada.</p></details>
     </div>
     <a className={styles.consultLink} href={wa(consult(ORIGIN))} target="_blank" rel="noopener noreferrer" onClick={event=>{event.currentTarget.href=wa(consult(new URL(animeAbsoluteUrl('/')).origin));trackAnimeEvent('click_whatsapp',{id:product.id,source:'product_question'});}}><MessageCircle size={17}/> ¿Tienes una pregunta sobre este diseño? <ArrowUpRight size={15}/></a>
     <Link className={styles.backLink} href={categoryHref}><ArrowLeft size={16}/> Volver a {product.category}</Link>
    </section>
   </div>
   {related.length>0&&<section className={styles.related}><div className={styles.sectionHeading}><div><p className={styles.kicker}>Sigue en tu universo</p><h2>Podrían ir en tu combo.</h2></div><Link href={categoryHref} className={styles.textLink}>Ver {product.category} <ArrowUpRight size={16}/></Link></div><div className={styles.grid}>{related.map(item=><AnimeProductCard key={item.id} product={item}/>)}</div></section>}
  </div>
  <Dialog open={zoom} onOpenChange={setZoom}><DialogContent className={styles.zoomDialog}><DialogTitle className={styles.srOnly}>{product.name}, fotografía ampliada</DialogTitle><DialogDescription className={styles.srOnly}>Vista ampliada del diseño de la referencia {product.id}.</DialogDescription><div><Image src={product.image} alt={`${product.name}, diseño ampliado`} fill sizes="95vw"/></div></DialogContent></Dialog>
 </main>;
}
