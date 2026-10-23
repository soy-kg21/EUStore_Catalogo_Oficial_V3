'use client';
import Image from 'next/image';
import AnimeCollectionLink from './AnimeCollectionLink';
import {useLayoutEffect,useState} from 'react';
import {consumeAnimeProduct} from '@/lib/anime-navigation';
import {ArrowLeft,ArrowUpRight,Check,Expand,MessageCircle,Truck} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {animeLines,animeCategorySlug,type AnimeClientProduct} from '@/lib/anime-catalog-core';
import {animeProductHref,animeLinePath} from '@/lib/anime-routes';
import {isDoublePrint} from '@/lib/anime-merchandising';
import {trackAnimeEvent,animeAbsoluteUrl} from '@/lib/anime-events';
import {ORIGIN,wa,money} from '@/lib/config';
import AnimeProductOptions from './AnimeProductOptions';
import AnimeShareButton from './AnimeShareButton';
import AnimeProductCard from './AnimeProductCard';
import styles from './shop-premium.module.css';
export default function AnimeProductDetail({product,related=[]}:{product:AnimeClientProduct;related?:AnimeClientProduct[]}){
 const [zoom,setZoom]=useState(false),double=isDoublePrint(product.id),lineName=animeLines.find(line=>line.id===product.line)!.name;
 useLayoutEffect(()=>{
  if(!consumeAnimeProduct(product.id))return;
  let frame=0;
  const show=()=>{const gallery=document.getElementById('anime-product-design'),header=document.querySelector('header.header')?.getBoundingClientRect().height||82;window.scrollTo({top:Math.max(0,window.scrollY+(gallery?.getBoundingClientRect().top||0)-header-16),behavior:'instant'});};
  window.scrollTo({top:0,behavior:'instant'});show();frame=requestAnimationFrame(show);
  return()=>cancelAnimationFrame(frame);
 },[product.id]);
 const categoryHref=`${animeLinePath[product.line]}/${animeCategorySlug(product.category)}`;
 const sameUniverse=related.every(item=>item.line===product.line&&item.category===product.category);
 const sameLine=related.every(item=>item.line===product.line);
 const moreHref=sameUniverse?categoryHref:sameLine?animeLinePath[product.line]:'/shop';
 const moreLabel=sameUniverse?`Ver ${product.category}`:sameLine?`Ver más de ${lineName}`:'Explorar todas las líneas';
 const consult=(origin:string)=>`Hola Evolución Urbana 👕\n\nQuiero consultar la referencia ${product.id} — ${product.name}.\nColección: ${lineName} · ${product.category}.\n${origin}${animeProductHref(product.id)}\n\nQuiero confirmar tallas, disponibilidad y la promoción aplicable.`;
 return <main id="contenido" className={styles.shell}>
  <div className={styles.detailShell}>
   <nav className={styles.breadcrumb} aria-label="Ruta de navegación"><AnimeCollectionLink href="/shop">Anime Shop</AnimeCollectionLink><span>/</span><AnimeCollectionLink href={animeLinePath[product.line]}>{lineName}</AnimeCollectionLink><span>/</span><AnimeCollectionLink href={categoryHref}>{product.category}</AnimeCollectionLink></nav>
   <div className={styles.detailGrid}>
    <div className={styles.detailGallery} id="anime-product-design"><button type="button" className={styles.detailImage} onClick={()=>setZoom(true)} aria-label={`Ampliar fotografía de ${product.name}`}><Image unoptimized quality={85} src={product.image} alt={`${product.name}, referencia ${product.id}`} fill sizes="(max-width: 800px) 94vw, 600px" preload/>{double&&<span className={styles.detailImageBadge}>FRENTE + ESPALDA</span>}<span className={styles.zoomButton}><Expand size={17}/> Ampliar diseño</span></button><p className={styles.imageCaption}>Fotografía del diseño suministrada para esta referencia.</p></div>
    <section className={styles.detailInfo}>
     <p className={styles.kicker}>{lineName} Division / {product.id}</p><h1>{product.name}</h1>
     {double&&<p className={styles.printTag}><Check size={14}/> Doble estampado</p>}
     <div className={styles.detailPrice}><strong>{money(product.price)} <small>COP</small></strong>{(product.position===undefined||product.offer)&&<span>Combina 2 camisetas por <b>{money(product.offer?.total||93000)}</b></span>}</div>
     <p className={styles.detailIntro}>{product.description||'Elige tu talla y añádela al combo. Puedes combinarla con diseños de Anime, Cartoon, Rock y Urbanas.'}</p>
     <AnimeProductOptions product={product}/>
     <AnimeShareButton name={product.name} path={animeProductHref(product.id)}/>
     <p className={styles.shippingNote}><Truck size={18}/><span>Envío estándar incluido de 1 a 5 camisetas. Cobertura y contraentrega por confirmar.</span></p>
     <div className={styles.detailAccordions}>
      <details open><summary>Detalles de esta referencia</summary><dl><div><dt>Referencia</dt><dd>{product.id}</dd></div><div><dt>Línea</dt><dd>{lineName}</dd></div><div><dt>Universo</dt><dd>{product.category}</dd></div><div><dt>Material</dt><dd>{product.material||'Por confirmar'}</dd></div>{product.weightGrams&&<div><dt>Gramaje</dt><dd>{product.weightGrams} g</dd></div>}<div><dt>Horma</dt><dd>{product.fit||'Por confirmar'}</dd></div><div><dt>Disponibilidad</dt><dd>{product.availability}</dd></div><div><dt>Tallas disponibles</dt><dd>{product.sizes.join(' · ')}</dd></div></dl></details>
      <details><summary>Tallas y disponibilidad</summary><p>{product.availability} en tallas {product.sizes.join(', ')}. Si necesitas ayuda para elegir, consulta las medidas de esta referencia antes de cerrar el pedido.</p></details>
      <details><summary>Envíos y pedidos mayoristas</summary><p>De 1 a 5 camisetas, envío estándar incluido y contraentrega sujetos a cobertura. Desde 6 camisetas, pago anticipado y transporte separado por cotizar. Desde 49, cotización personalizada.</p></details>
     </div>
     <a className={styles.consultLink} href={wa(consult(ORIGIN))} target="_blank" rel="noopener noreferrer" onClick={event=>{event.currentTarget.href=wa(consult(new URL(animeAbsoluteUrl('/')).origin));trackAnimeEvent('click_whatsapp',{id:product.id,source:'product_question'});}}><MessageCircle size={17}/> ¿Tienes una pregunta sobre este diseño? <ArrowUpRight size={15}/></a>
     <AnimeCollectionLink className={styles.backLink} href={categoryHref} resume><ArrowLeft size={16}/> Volver al listado anterior</AnimeCollectionLink>
     <AnimeCollectionLink className={styles.backLink} style={{marginTop:12}} href={categoryHref}><ArrowUpRight size={16}/> Ver todos los diseños de {product.category}</AnimeCollectionLink>
    </section>
   </div>
   {related.length>0&&<section className={styles.related}><div className={styles.sectionHeading}><div><p className={styles.kicker}>{sameUniverse?'Sigue en tu universo':'Completa tu combo'}</p><h2>Podrían ir en tu combo.</h2></div><AnimeCollectionLink href={moreHref} className={styles.textLink}>{moreLabel} <ArrowUpRight size={16}/></AnimeCollectionLink></div><div className={styles.grid}>{related.map(item=><AnimeProductCard key={item.id} product={item}/>)}</div></section>}
  </div>
  <Dialog open={zoom} onOpenChange={setZoom}><DialogContent className={styles.zoomDialog}><DialogTitle className={styles.srOnly}>{product.name}, fotografía ampliada</DialogTitle><DialogDescription className={styles.srOnly}>Vista ampliada del diseño de la referencia {product.id}.</DialogDescription><div><Image unoptimized quality={85} src={product.image} alt={`${product.name}, diseño ampliado`} fill sizes="95vw"/></div></DialogContent></Dialog>
 </main>;
}
