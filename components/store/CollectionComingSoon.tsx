import Image from 'next/image';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Layers,MessageCircle,Ruler,PackageCheck} from 'lucide-react';
import {upcomingCollections} from './CollectionGateway';
import {wa} from '@/lib/config';
import styles from './collection-gateway.module.css';
export default function CollectionComingSoon({category}:{category:keyof typeof upcomingCollections}){
 const collection=upcomingCollections[category];
 const contact=wa(`Hola Evolución Urbana, me interesa la línea de ${collection.next.toLowerCase()}. Quiero conocer los modelos disponibles, tallas, precios y condiciones de entrega. Mi ciudad es: `);
 return <main id="contenido" className={`page-main ${styles.page}`}>
  <nav className="breadcrumb" aria-label="Ubicación"><Link href="/">Inicio</Link><span>/</span><Link href={`/categoria/${category}`}>{collection.title}</Link><span>/</span><span>{collection.next}</span></nav>
  <section className={styles.soon} aria-labelledby="new-collection-title">
   <div className={styles.soonArt}>
    <Image className={styles.collectionImage} src={collection.editorial} alt={collection.alt} fill sizes="(max-width:700px) 90vw, (max-width:1600px) 43vw, 650px" quality={90} preload/>
    <span>EU / {collection.eyebrow}</span>
    <div className={styles.artSignature}><span>UN NUEVO CAPÍTULO.</span><strong>MISMA ESENCIA.</strong></div>
    <small>EVOLUCIÓN URBANA / COLOMBIA</small>
   </div>
   <div className={styles.soonCopy}>
    <p className={styles.tag}>Nueva línea / Atención por WhatsApp</p>
    <h1 id="new-collection-title">{collection.next}<em>Tu próxima evolución<br/>empieza aquí.</em></h1>
    <p>Esta línea ya se puede consultar y comprar por WhatsApp. Te acompañamos para encontrar los modelos, las tallas y el estilo que van contigo.</p>
    <div className={styles.status}><i/> Catálogo web en preparación</div>
    <p className={styles.catalogNote}>Aún no hay productos publicados en esta sección. Pronto encontrarás aquí las fotografías, referencias y precios. Mientras tanto, nuestro equipo te comparte la información disponible de forma personalizada.</p>
    <a className={`button ${styles.primaryAdvice}`} href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={18}/> VER OPCIONES POR WHATSAPP <ArrowUpRight size={17}/></a>
    <Link className={styles.advice} href={`/categoria/${category}#catalogo-${category}`}>Explorar {collection.current.toLowerCase()} <ArrowUpRight size={17}/></Link>
   </div>
  </section>
  <section className={styles.consultation} aria-label="Qué puedes consultar por WhatsApp">
   <div><Layers size={23}/><h2>Encuentra tu referencia.</h2><p>Pide las fotografías y los modelos disponibles de esta línea.</p></div>
   <div><Ruler size={23}/><h2>Elige con asesoría.</h2><p>Consulta medidas, colores y tallas antes de decidir.</p></div>
   <div><PackageCheck size={23}/><h2>Confirma cada detalle.</h2><p>Recibe el precio y valida disponibilidad, forma de pago y entrega para tu ciudad.</p></div>
  </section>
  <section className={styles.soonFoot}><Layers size={24}/><div><h2>Tu estilo sigue aquí.</h2><p>Descubre también las referencias y los combos de la colección actual.</p></div><Link href={`/categoria/${category}`}><ArrowLeft size={17}/> Volver a {collection.title.toLowerCase()}</Link></section>
 </main>;
}
